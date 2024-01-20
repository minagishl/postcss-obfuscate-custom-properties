# postcss-obfuscate-custom-properties

This plugin replaces the names of CSS custom properties with hard-to-guess strings.

```css
:root {
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
}
```

```css
:root {
  --b6d946: 240 5.9% 10%;
  --f02024: 240 4.8% 95.9%;
}
```

## Usage

**Step 1:** Install plugin:

```bash
npm install --save-dev postcss postcss-obfuscate-custom-properties
```

**Step 2:** Check your project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: {
    autoprefixer: {},
+   'postcss-obfuscate-custom-properties': {},
  },
};
```

## Options

| Option               | Type                | Default                 | Description                                                    |
| -------------------- | ------------------- | ----------------------- | -------------------------------------------------------------- |
| enable               | boolean             | true                    | Enable or disable the obfuscation.                             |
| length               | number              | 6                       | Character length (max. 32 characters)length.                   |
| method               | string              | "random"                | "random" or "none" obfuscation method for classes.             |
| prefix               | string              | ""                      | Prefix for custom properties.                                  |
| suffix               | string              | ""                      | Suffix for custom properties.                                  |
| ignore               | string[]            | []                      | Array of custom properties to ignore.                          |
| output               | string              | ""                      | Obfuscated property list json file output destination          |
| speedPriority        | boolean             | false                   | Ignore all regular expressions and execute.                    |
| ignoreRegex          | string[]            | []                      | Regex to ignore.                                               |
| ignoreSelectors      | string[]            | []                      | Array of selectors to ignore.                                  |
| IgnoreSelectorsRegex | string[]            | []                      | Regex to ignore selectors.                                     |
| [new] hashAlgorithm  | string              | "sha256"                | Hash algorithm for obfuscation.                                |
| preRun               | () => Promise<void> | () => Promise.resolve() | What to do before running the plugin                           |
| callBack             | () => void          | function () {}          | Callback function to run after the plugin has finished running |

## License

This source code is released under the [MIT license.]

[MIT license.]: https://opensource.org/licenses/MIT
[official docs]: https://github.com/postcss/postcss#usage
