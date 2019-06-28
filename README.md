# abswap

> Swap a/b directories or files using symlinks.


## Example

Initialize:

```console
$ abswap --init example
$ ls -l
lrwxrwxrwx 1 mroth mroth    9 Jun 26 11:30 example -> example.a
drwxrwxr-x 2 mroth mroth 4096 Jun 26 11:30 example.a
drwxrwxr-x 2 mroth mroth 4096 Jun 26 11:30 example.b
lrwxrwxrwx 1 mroth mroth    9 Jun 26 11:30 example.inactive -> example.b
```

Swap directories:

```console
$ abswap example
$ ls -l
lrwxrwxrwx 1 mroth mroth    9 Jun 26 11:32 example -> example.b
drwxrwxr-x 2 mroth mroth 4096 Jun 26 11:30 example.a
drwxrwxr-x 2 mroth mroth 4096 Jun 26 11:30 example.b
lrwxrwxrwx 1 mroth mroth    9 Jun 26 11:32 example.inactive -> example.a
```

Of course, calling `abswap` again swaps back again.


## Features

  * Works with directories and regular files.
  * Maintains always a valid symlink for the activated selection (atomic behavior).
  * ...


## Install

|              npm              |           yarn           |
|:-----------------------------:|:------------------------:|
| `npm install --global abswap` | `yarn global add abswap` |


## Usage

TBW.


## Built With

  * [TypeScript](https://www.typescriptlang.org/) - JavaScript that scales.
  * [Jest](https://jestjs.io/) - Delightful JavaScript Testing.
  * [TSLint](https://palantir.github.io/tslint/) - An extensible linter for the TypeScript language.
  * [Prettier](https://prettier.io/) - Opinionated Code Formatter.
  * [Visual Studio Code](https://code.visualstudio.com/) - Code editing. Redefined.


## Contributing

Pull requests, patches, emails, issues, what ever, are welcomed!


## Author

  * [Michael Roth](https://mroth.net/) [<<mail@mroth.net>>](mailto:mail@mroth.net)


## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
