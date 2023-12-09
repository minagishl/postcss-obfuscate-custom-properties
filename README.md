# postcss-obfuscate-custom-properties

This plugin replaces the names of CSS custom properties with hard-to-guess strings.

```css
:root {
  --foo: #fff;
  --bar: #000;
}
```

```css
:root {
  --ajsn97: #fff;
  --kix021: #000;
}
```

## Usage

**Step 1:** Install plugin:

```sh
npm  install  --save-dev  postcss  postcss-obfuscate-custom-properties
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
+       'postcss-obfuscate-custom-properties': {},
		autoprefixer: {}
	},
};
```

## Options

| Option | Type     | Default  | Description                                        |
| ------ | -------- | -------- | -------------------------------------------------- |
| enable | boolean  | true     | Enable or disable the obfuscation.                 |
| length | number   | 6        | Character length (max. 32 characters)length.       |
| method | string   | "random" | "random" or "none" obfuscation method for classes. |
| prefix | string   | ""       | Prefix for custom properties.                      |
| suffix | string   | ""       | Suffix for custom properties.                      |
| ignore | string[] | []       | Array of custom properties to ignore.              |
| output | string   | ""       | Output destination for json files                  |

## License

This source code is released under the [MIT license.]

[MIT license.]: https://opensource.org/licenses/MIT
[official docs]: https://github.com/postcss/postcss#usage
