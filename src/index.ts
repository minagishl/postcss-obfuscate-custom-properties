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
  preRun?: () => Promise<void>;
  callback?: () => void;
};

const plugin = (opt: any = {}) => {
  return {
    postcssPlugin: 'postcss-obfuscate-custom-properties',
    Once(root: any) {
      const mapping: { [key: string]: string } = {};
      const options: Options = opt;

      // Options
      const enable = options.enable !== undefined ? options.enable : true;
      const length = options.length || 6;
      const method = options.method || 'random';
      const prefix = options.prefix || '';
      const suffix = options.suffix || '';
      const ignore = options.ignore || [];
      const output = options.output || '';
      const inspect = options.inspect || false;
      const speedPriority = options.speedPriority || false;
      const ignoreRegex = options.ignoreRegex || [];
      const ignoreSelectors = options.ignoreSelectors || [];
      const IgnoreSelectorsRegex = options.ignoreSelectorsRegex || [];
      const preRun = options.preRun || (() => Promise.resolve());
      const callback = options.callback || function () {};

      // Validate options
      if (length > 64) {
        throw new Error('Length must be less than or equal to 64');
      }

      // Generate random integer
      function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
      }

      // Add '--' to ignore list
      for (let i = 0; i < ignore.length; i++) {
        if (!ignore[i].startsWith('--')) {
          ignore[i] = '--' + ignore[i];
        }
      }

      // Run preRun callback
      preRun();

      // First pass: collect custom properties and generate hashes
      root.walkRules((rule: any) => {
        if (
          !ignoreSelectors.includes(rule.selector) &&
          (speedPriority || !IgnoreSelectorsRegex.some((regex) => new RegExp(regex).test(rule.selector)))
        ) {
          rule.walkDecls((decl: any) => {
            if (
              decl.prop.startsWith('--') &&
              enable &&
              !ignore.includes(decl.prop) &&
              (speedPriority || !ignoreRegex.some((regex) => new RegExp(regex).test(decl.prop)))
            ) {
              // Length of hash characters
              const hashLength = length - prefix.length - suffix.length;

              // Hash method
              if (method === 'random') {
                if (!Object.prototype.hasOwnProperty.call(mapping, decl.prop)) {
                  let hash;
                  do {
                    hash = createHash('sha256')
                      .update(decl.prop + getRandomInt(100))
                      .digest('hex')
                      .slice(0, hashLength);
                  } while (Object.values(mapping).includes(`--${prefix + hash + suffix}`));
                  mapping[decl.prop] = `--${prefix + hash + suffix}`;
                }
              } else {
                mapping[decl.prop] = '--' + prefix + decl.prop.substring(2) + suffix;
              }
              decl.prop = mapping[decl.prop];
            }
          });
        }
      });

      // Write mapping to file
      if (output) {
        let outputPath = path.join(process.cwd(), output);

        // Check if outputPath ends with a .json file
        if (!path.basename(outputPath).endsWith('.json')) {
          // If outputPath ends with '/', append 'main.json'. Otherwise, append '/main.json'
          outputPath += outputPath.endsWith('/') ? 'main.json' : '/main.json';
        }

        // Get the directory of outputPath
        const dir = path.dirname(outputPath);

        // If the directory does not exist, create it
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFile(outputPath, JSON.stringify(mapping, null, 2), (err) => {
          if (err) throw err;
        });
      }

      if (inspect) {
        console.log(mapping);
      }

      // Compile regular expressions outside of the loop
      const regexes = Object.keys(mapping).map((original) => ({
        regex: new RegExp(`var\\(${original}\\)`, 'g'),
        hash: mapping[original as keyof typeof mapping],
      }));

      // Second pass: replace usage in var() functions
      root.walkDecls((decl: any) => {
        for (const { regex, hash } of regexes) {
          if (regex.test(decl.value)) {
            decl.value = decl.value.replace(regex, `var(${hash})`);
          }
        }
      });

      callback();
    },
  };
};

plugin.postcss = true;
export = plugin;
