import { createHash } from 'crypto';
import fs from 'node:fs';
import path from 'node:path';

interface PluginOptions {
  enable?: boolean;
  length?: number;
  method?: 'random' | 'preserve';
  prefix?: string;
  suffix?: string;
  ignore?: string[];
  output?: string;
  inspect?: boolean;
  speedPriority?: boolean;
  ignoreRegex?: string[];
  ignoreSelectors?: string[];
  ignoreSelectorsRegex?: string[];
  hashAlgorithm?: 'md5' | 'sha1' | 'sha256' | 'sha512';
  preRun?: () => Promise<void>;
  callback?: () => void;
}

const DEFAULT_OPTIONS: PluginOptions = {
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

class CustomPropertyObfuscator {
  private options: PluginOptions;
  private mapping: Map<string, string>;
  private usedHashes: Set<string>;

  constructor(options: PluginOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.validateOptions();
    this.mapping = new Map();
    this.usedHashes = new Set();
  }

  private validateOptions() {
    if (this.options.length! > 64) {
      throw new Error('Length must be ≤ 64');
    }
    if (!['md5', 'sha1', 'sha256', 'sha512'].includes(this.options.hashAlgorithm!)) {
      throw new Error(`Invalid hash algorithm: ${this.options.hashAlgorithm}`);
    }
  }

  private generateUniqueHash(input: string): string {
    const hashLength = this.options.length! - this.options.prefix!.length - this.options.suffix!.length;

    let hash: string;
    do {
      hash = createHash(this.options.hashAlgorithm!)
        .update(input + Math.random())
        .digest('hex')
        .slice(0, hashLength);
    } while (this.usedHashes.has(hash));

    this.usedHashes.add(hash);
    return `--${this.options.prefix! + hash + this.options.suffix!}`;
  }

  private shouldObfuscateSelector(selector: string): boolean {
    if (this.options.ignoreSelectors!.includes(selector)) return false;

    return (
      this.options.speedPriority ||
      !this.options.ignoreSelectorsRegex!.some((regex) => new RegExp(regex).test(selector))
    );
  }

  private shouldObfuscateProperty(prop: string): boolean {
    if (!prop.startsWith('--') || !this.options.enable) return false;

    const ignoredProps = this.options.ignore!.map((item) => (item.startsWith('--') ? item : `--${item}`));

    if (ignoredProps.includes(prop)) return false;

    return (
      this.options.speedPriority || !this.options.ignoreRegex!.some((regex) => new RegExp(regex).test(prop))
    );
  }

  private processCustomProperties(root: any) {
    root.walkRules((rule: any) => {
      if (!this.shouldObfuscateSelector(rule.selector)) return;

      rule.walkDecls((decl: any) => {
        if (!this.shouldObfuscateProperty(decl.prop)) return;

        const newProp =
          this.options.method === 'random'
            ? this.generateUniqueHash(decl.prop)
            : `--${this.options.prefix! + decl.prop.substring(2) + this.options.suffix!}`;

        this.mapping.set(decl.prop, newProp);
        decl.prop = newProp;
      });
    });
  }

  private updateVariableReferences(root: any) {
    const regexes = Array.from(this.mapping.entries()).map(([original, hash]) => ({
      regex: new RegExp(`var\\(${original}\\)`, 'g'),
      hash,
    }));

    root.walkDecls((decl: any) => {
      for (const { regex, hash } of regexes) {
        decl.value = decl.value.replace(regex, `var(${hash})`);
      }
    });
  }

  private writeMappingToFile() {
    if (!this.options.output) return;

    const mappingObject = Object.fromEntries(this.mapping);
    const outputPath = path.resolve(
      process.cwd(),
      this.options.output.endsWith('.json')
        ? this.options.output
        : path.join(this.options.output, 'main.json')
    );

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(mappingObject, null, 2));
  }

  public async process(root: any) {
    await this.options.preRun!();
    this.processCustomProperties(root);
    this.updateVariableReferences(root);

    if (this.options.inspect) {
      console.log(Object.fromEntries(this.mapping));
    }

    this.writeMappingToFile();
    this.options.callback!();
  }
}

const plugin = (opt: PluginOptions = {}) => ({
  postcssPlugin: 'postcss-obfuscate-custom-properties',
  async Once(root: any) {
    const obfuscator = new CustomPropertyObfuscator(opt);
    await obfuscator.process(root);
  },
});

plugin.postcss = true;
export = plugin;
