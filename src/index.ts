import { createHash } from 'crypto';

const plugin = (options: any = {}) => {
  return {
    postcssPlugin: 'postcss-obfuscate-custom-properties',
    Once(root: any) {
      const mapping = {};
      const hashLength = options.hashLength || 6;

      // First pass: collect custom properties and generate hashes
      root.walkRules((rule: any) => {
        rule.walkDecls((decl: any) => {
          if (decl.prop.startsWith('--')) {
            const hash = createHash('sha512').update(decl.prop).digest('hex').slice(0, hashLength);
            const mapping: { [key: string]: string } = {};
            mapping[decl.prop] = `--${hash}`;
            decl.prop = mapping[decl.prop];
          }
        });
      });

      // Second pass: replace usage in var() functions
      root.walkDecls((decl: any) => {
        for (const original in mapping) {
          const hash = mapping[original as keyof typeof mapping];
          decl.value = decl.value.replace(new RegExp(`var\\(${original}\\)`, 'g'), `var(${hash})`);
        }
      });
    },
  };
};

plugin.postcss = true;

module.exports = plugin;
