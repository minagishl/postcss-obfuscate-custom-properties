# Changelog

All changes to this project will be noted here.

## [1.4.0] - 2025-01-26

### Changed

- Upgrade dependencies: postcss, etc.
- Refactoring to improve code maintainability

## [1.3.0] - 2024-06-30

### Changed

Refactoring to improve code maintainability

## [1.2.0] - 2024-01-18

### Added

- `hashAlgorithm` - Hash algorithm for obfuscation.

### Changed

- Upgrade Packages

## [1.1.0] - 2023-12-10

### Added

Multiple options added

- `speedPriority` - Ignore all regular expressions and execute.
- `ignoreRegex` - Regex to ignore.
- `ignoreSelectors` - Array of selectors to ignore.
- `IgnoreSelectorsRegex` - Regex to ignore selectors.
- `preRun` - What to do before running the plugin
- `callBack` - Callback function to run after the plugin has finished running

The changelog of the previous version has been rewritten in detail.

### Changed

- Upgrade dependencies: eslint, postcss

## [1.0.0] - 2023-12-09

### Added

Optional features for this plug-in have been added

- `enable` - Enable or disable the obfuscation.
- `length` - Character length (max. 32 characters)length.
- `method` - "random" or "none" obfuscation method for classes.
- `prefix` - Prefix for custom properties.
- `suffix` - Suffix for custom properties.
- `ignore` - Array of custom properties to ignore.
- `output` - Obfuscated property list json file output destination
- Ability to avoid covering property names

## [0.1.0] - 2023-12-09

### Added

- First release

[0.1.0]: https://www.npmjs.com/package/postcss-obfuscate-custom-properties/v/0.1.0
[1.0.0]: https://www.npmjs.com/package/postcss-obfuscate-custom-properties/v/1.0.0
[1.1.0]: https://www.npmjs.com/package/postcss-obfuscate-custom-properties/v/1.1.0
[1.2.0]: https://www.npmjs.com/package/postcss-obfuscate-custom-properties/v/1.2.0
[1.3.0]: https://www.npmjs.com/package/postcss-obfuscate-custom-properties/v/1.3.0
[1.4.0]: https://www.npmjs.com/package/postcss-obfuscate-custom-properties/v/1.4.0
