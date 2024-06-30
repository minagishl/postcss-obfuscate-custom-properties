import { createHash } from 'crypto';
import fs from 'node:fs';
import path from 'node:path';

type Options = {
  enable?: boolean;
  length?: number;
  method?: string;
  prefix?: string;
  suffix?: string;
  ignore?: string[];
  output?: string;
  inspect?: boolean; // No description in readme.md
  speedPriority?: boolean;
  ignoreRegex?: string[];
  ignoreSelectors?: string[];
  ignoreSelectorsRegex?: string[];
  hashAlgorithm?: string;
  preRun?: () => Promise<void>;
  callback?: () => void;
};

const defaultOptions: Options = {
  enable: true,
  length: 6,
  method: 'random',
  prefix: '',
  suffix: '',
  ignore: [],
  output: '',
  inspect: false,
  speedPriority: false,
  ignoreRegex: [],
  ignoreSelectors: [],
  ignoreSelectorsRegex: [],
  hashAlgorithm: 'sha256',
  preRun: () => Promise.resolve(),
  callback: () => {},
};

const validHashAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

const validateOptions = (options: Options) => {
  if (options.length! > 64) {
    throw new Error('Length must be less than or equal to 64');
  }
  if (!validHashAlgorithms.includes(options.hashAlgorithm!)) {
    throw new Error(
      `Invalid hashAlgorithm: ${options.hashAlgorithm}. Must be one of ${validHashAlgorithms.join(', ')}`
    );
  }
};

const prepareIgnoreList = (ignore: string[]) => {
  return ignore.map((item) => (item.startsWith('--') ? item : `--${item}`));
};

const writeMappingToFile = (output: string, mapping: { [key: string]: string }) => {
  let outputPath = path.join(process.cwd(), output);

  if (!path.basename(outputPath).endsWith('.json')) {
    outputPath += outputPath.endsWith('/') ? 'main.json' : '/main.json';
  }

  const dir = path.dirname(outputPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFile(outputPath, JSON.stringify(mapping, null, 2), (err) => {
    if (err) throw err;
  });
};

const plugin = (opt: Options = {}) => {
  return {
    postcssPlugin: 'postcss-obfuscate-custom-properties',
    async Once(root: any) {
      const options = { ...defaultOptions, ...opt };
      validateOptions(options);

      const mapping: { [key: string]: string } = {};
      const ignoreList = prepareIgnoreList(options.ignore!);

      await options.preRun!();

      root.walkRules((rule: any) => {
        if (
          !options.ignoreSelectors!.includes(rule.selector) &&
          (options.speedPriority ||
            !options.ignoreSelectorsRegex!.some((regex) => new RegExp(regex).test(rule.selector)))
        ) {
          rule.walkDecls((decl: any) => {
            if (
              decl.prop.startsWith('--') &&
              options.enable &&
              !ignoreList.includes(decl.prop) &&
              (options.speedPriority ||
                !options.ignoreRegex!.some((regex) => new RegExp(regex).test(decl.prop)))
            ) {
              const hashLength = options.length! - options.prefix!.length - options.suffix!.length;

              if (options.method === 'random') {
                if (!mapping.hasOwnProperty(decl.prop)) {
                  let hash;
                  do {
                    hash = createHash(options.hashAlgorithm!)
                      .update(decl.prop + getRandomInt(100))
                      .digest('hex')
                      .slice(0, hashLength);
                  } while (Object.values(mapping).includes(`--${options.prefix! + hash + options.suffix!}`));
                  mapping[decl.prop] = `--${options.prefix! + hash + options.suffix!}`;
                }
              } else {
                mapping[decl.prop] = `--${options.prefix! + decl.prop.substring(2) + options.suffix!}`;
              }
              decl.prop = mapping[decl.prop];
            }
          });
        }
      });

      if (options.output) {
        writeMappingToFile(options.output, mapping);
      }

      if (options.inspect) {
        console.log(mapping);
      }

      const regexes = Object.keys(mapping).map((original) => ({
        regex: new RegExp(`var\\(${original}\\)`, 'g'),
        hash: mapping[original],
      }));

      root.walkDecls((decl: any) => {
        for (const { regex, hash } of regexes) {
          decl.value = decl.value.replace(regex, `var(${hash})`);
        }
      });

      options.callback!();
    },
  };
};

plugin.postcss = true;
export = plugin;
