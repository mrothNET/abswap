# Swap Files or Directories using Symlinks

![dependencies](https://img.shields.io/librariesio/release/npm/abswap.svg?style=flat-square)&nbsp;&nbsp;![tests](https://img.shields.io/circleci/build/github/mrothNET/abswap/master.svg?label=tests&style=flat-square)&nbsp;&nbsp;![npm](https://img.shields.io/npm/v/abswap.svg?style=flat-square)&nbsp;&nbsp;![code size](https://img.shields.io/github/languages/code-size/mrothNET/abswap.svg?style=flat-square)&nbsp;&nbsp;![license](https://img.shields.io/github/license/mrothNET/abswap.svg?style=flat-square)

![Screencast](./assets/screencast-example.gif)


## Features

  * Work with directories and regular files.
  * Maintain valid symlink for the activated selection (atomicity behavior).
  * Convert existing file or directory to a/b structure.


## Install

|              npm              |           yarn           |
|:-----------------------------:|:------------------------:|
| `npm install --global abswap` | `yarn global add abswap` |


## Usage

```
Usage: abswap [options] <path>

Options:
  -V, --version  output the version number
  --init         initialize a path for a/b swap
  --copy         copy existing path to inactive selection on initialize
  --file         expect (or create) regular files as targets
  --directory    expect (or create) directory as targets
  -h, --help     output usage information
```


## Changelog

**`v0.3.0`**
  - New option `--copy` to copy existing file or directory to inactive selection on initialize.

**`v0.2.0`**
  - Can convert existing files or directories.
  - New options `--file` and `--directory` to select file or directory mode.

**`v0.1.3`**
  - Initial public version.


## Contributing

Pull requests, patches, emails, issues, what ever, are welcomed!


## Author

  * [Michael Roth](https://mroth.net/) [<<mail@mroth.net>>](mailto:mail@mroth.net)


## Built With

  * [TypeScript](https://www.typescriptlang.org/) - JavaScript that scales.
  * [Jest](https://jestjs.io/) - Delightful JavaScript Testing.
  * [TSLint](https://palantir.github.io/tslint/) - An extensible linter for the TypeScript language.
  * [Prettier](https://prettier.io/) - Opinionated Code Formatter.
  * [Visual Studio Code](https://code.visualstudio.com/) - Code editing. Redefined.


## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
