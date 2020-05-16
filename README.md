# slate-plugins-next
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![codecov](https://codecov.io/gh/zbeyens/slate-plugins-next/branch/master/graph/badge.svg)](https://codecov.io/gh/zbeyens/slate-plugins-next)
[<img src="https://img.shields.io/npm/v/slate-plugins-next.svg" />](https://npm.im/slate-plugins-next)&nbsp;
[<img src="https://badgen.net/npm/dw/slate-plugins-next" />](https://npm.im/slate-plugins-next)&nbsp;
[<img src="https://badgen.net/bundlephobia/minzip/slate-plugins-next" />](https://bundlephobia.com/result?p=slate-plugins-next)&nbsp;
[<img src="https://badgen.now.sh/badge/license/MIT" />](https://github.com/zbeyens/slate-plugins-next/blob/master/LICENSE)&nbsp;
[<img src="https://slate-slack.herokuapp.com/badge.svg?logo=slack" />](https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1)&nbsp;
[![Netlify Status](https://api.netlify.com/api/v1/badges/2cc9e07a-2339-48c4-a2b8-26adf0e5569d/deploy-status)](https://app.netlify.com/sites/slate-plugins-next/deploys)

Built on top of [Slate](https://github.com/ianstormtaylor/slate#documentation) framework, `slate-plugins-next` enables you to use a list of
customizable plugins for your Slate editor.

[Try out the existing ones](https://slate-plugins-next.netlify.com/?path=/story/plugins-playground--plugins) and [create your own plugins](https://slate-plugins-next.netlify.com/?path=/docs/docs-guide--page)!

## 🚀 Included

- ✨ 20+ Editor Plugins.
- 🏷️ Separation of Concerns.
- ⚛️ Atomic Design.
- ✅ Unit tested with `slate@0.58.1`.
- 📖 [Docs](https://slate-plugins-next.netlify.com/?path=/docs/docs-getting-started--page) and [Demos](https://slate-plugins-next.netlify.com/?path=/story/plugins-playground--plugins) on Storybook.

## 🧩 Plugins

A list of provided plugins extracted from [official examples](https://www.slatejs.org/examples/richtext).

### Elements

A plugin for each type of element. They all use `renderElement`.

<img src="https://i.imgur.com/JAO2NPN.png" alt="blocks" width="400"/>

- Action
- Blockquote
- Code
- Editable
- Heading
- Image
- Link
- List
- Mention
- Paragraph
- Table
- Video
 
### Marks

A plugin for each type of leaf. They all use `renderLeaf`.

<img src="https://imgur.com/NQJgC5b.png" alt="marks" width="650"/>

- Bold
- Code
- Highlight
- Italic
- Strikethrough
- Subscript
- Superscript
- Underline

### Deserializers

- HTML
- Markdown

### Normalizers

- Forced Layout

### Plugins

- Search Highlight
- Editable

### Components

- Editable Plugins
- Toolbar

## 📦 Install

```bash
yarn add slate-plugins-next@0.58.1
```

> ⚠️ In production, you should pin the dependency until 1.0.0 is released.

You will also need these peerDependencies:

```bash
yarn add slate slate-hyperscript slate-react styled-components react react-dom
```

## 📝 Notice

### Why

[Slate](https://github.com/ianstormtaylor/slate) is a powerful editor framework that helps you deal with
difficult parts when building an editor, such as events handlers, elements, formatting, commands, rendering,
serializing, normalizing, etc.

While you are trying to build your own editors, it still need a lot of efforts to make something
similar to [Quill](https://quilljs.com/) or [ProseMirror](https://prosemirror.net/).
This repository allows you to build your editor right away with **minimal** slate knowledge.

### Bundle size

For simplicity, a single package `slate-plugins-next` has been published to share all the plugins.
It's not a problem as [it is tree-shakeable](https://bundlephobia.com/result?p=slate-plugins-next). However, a few plugins use external dependencies.
These should be moved into their own package in the future.

## 👏 Contributing

You can use this repository to **share your own plugins**.

If your plugin is _tree-shakeable_, you can add it to `packages/slate-plugins`.

Otherwise, create a new package in `packages`

📥 Pull requests and 🌟 Stars are always welcome.

### Development scripts

Useful scripts include:

#### `yarn`

> Installs package dependencies

#### `yarn storybook`

> Starts storybook dev

#### `yarn lint`

> boolean check if code conforms to linting eslint rules

#### `yarn test`

> Test with Jest

#### `yarn release`

> Lint, test, build and push a release to git and npm will ask for version in interactive mode - using lerna.

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/zbeyens"><img src="https://avatars3.githubusercontent.com/u/19695832?v=4" width="100px;" alt=""/><br /><sub><b>Ziad Beyens</b></sub></a><br /><a href="https://github.com/zbeyens/slate-plugins-next/commits?author=zbeyens" title="Code">💻</a> <a href="#maintenance-zbeyens" title="Maintenance">🚧</a> <a href="#plugin-zbeyens" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/zbeyens/slate-plugins-next/commits?author=zbeyens" title="Tests">⚠️</a> <a href="https://github.com/zbeyens/slate-plugins-next/commits?author=zbeyens" title="Documentation">📖</a></td>
    <td align="center"><a href="http://horacioh.com"><img src="https://avatars3.githubusercontent.com/u/725120?v=4" width="100px;" alt=""/><br /><sub><b>Horacio Herrera</b></sub></a><br /><a href="https://github.com/zbeyens/slate-plugins-next/commits?author=horacioh" title="Code">💻</a> <a href="#plugin-horacioh" title="Plugin/utility libraries">🔌</a> <a href="#example-horacioh" title="Examples">💡</a> <a href="https://github.com/zbeyens/slate-plugins-next/issues?q=author%3Ahoracioh" title="Bug reports">🐛</a> <a href="#ideas-horacioh" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/eivindw"><img src="https://avatars2.githubusercontent.com/u/67761?v=4" width="100px;" alt=""/><br /><sub><b>Eivind Barstad Waaler</b></sub></a><br /><a href="https://github.com/zbeyens/slate-plugins-next/commits?author=eivindw" title="Code">💻</a> <a href="#plugin-eivindw" title="Plugin/utility libraries">🔌</a> <a href="#example-eivindw" title="Examples">💡</a> <a href="https://github.com/zbeyens/slate-plugins-next/issues?q=author%3Aeivindw" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://spetex.dev"><img src="https://avatars3.githubusercontent.com/u/9515499?v=4" width="100px;" alt=""/><br /><sub><b>Petr Sahula</b></sub></a><br /><a href="https://github.com/zbeyens/slate-plugins-next/commits?author=spetex" title="Code">💻</a> <a href="#plugin-spetex" title="Plugin/utility libraries">🔌</a> <a href="#example-spetex" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/vujevits"><img src="https://avatars1.githubusercontent.com/u/2270661?v=4" width="100px;" alt=""/><br /><sub><b>Mark Vujevits</b></sub></a><br /><a href="https://github.com/zbeyens/slate-plugins-next/commits?author=vujevits" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

[MIT](LICENSE)
