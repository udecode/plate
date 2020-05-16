# slate-plugins-next

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

## License

[MIT](LICENSE)
