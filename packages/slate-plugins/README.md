# slate-plugins-next

[<img src="https://img.shields.io/npm/v/slate-plugins-next.svg" />](https://npm.im/slate-plugins-next)&nbsp;
[<img src="https://badgen.net/npm/dw/slate-plugins-next" />](https://npm.im/slate-plugins-next)&nbsp;
[<img src="https://badgen.net/bundlephobia/minzip/slate-plugins-next" />](https://bundlephobia.com/result?p=slate-plugins-next)&nbsp;
[<img src="https://badgen.now.sh/badge/license/MIT" />](https://github.com/zbeyens/slate-plugins-next/blob/master/LICENSE)&nbsp;
[<img src="https://slate-slack.herokuapp.com/badge.svg?logo=slack" />](https://slate-slack.herokuapp.com)&nbsp;
[<img src="https://img.shields.io/github/stars/zbeyens/slate-plugins-next?style=social" />](https://github.com/zbeyens/slate-plugins-next)&nbsp;

Built on top of [Slate](https://github.com/ianstormtaylor/slate#documentation) framework, `slate-plugins-next` enables you to use a list of
customizable plugins for your Slate editor.

[Try out the existing ones](https://slate-plugins-next.netlify.com/?path=/story/plugins-playground--plugins) and [create your own plugins](https://slate-plugins-next.netlify.com/?path=/docs/docs-guide--page)!

## 🚀 Included

- ✨ 20+ Editor Plugins.
- 🏷️ Separation of Concerns.
- ⚛️ Atomic Design.
- 🎌 Supports the latest version of `slate@0.57.1`.
- 📖 [Docs](https://slate-plugins-next.netlify.com/?path=/docs/docs-getting-started--page) and [Demos](https://slate-plugins-next.netlify.com/?path=/story/plugins-playground--plugins) on Storybook.

## 🧩 Plugins

A list of provided plugins extracted from [official examples](https://www.slatejs.org/examples/richtext).

### Elements

A plugin for each type of element. All of these
use `renderElement`.

<img src="https://i.imgur.com/EFORuVT.png" alt="blocks" width="500"/>

- [Action Item](https://slate-plugins-next.netlify.com/?path=/docs/plugins-action-item--examp)
- [Blockquote](https://slate-plugins-next.netlify.com/?path=/docs/plugins-elements--block-plugins)
- [Code](https://slate-plugins-next.netlify.com/?path=/docs/plugins-elements--block-plugins)
- [Heading](https://slate-plugins-next.netlify.com/?path=/docs/plugins-elements--block-plugins)
- [Image](https://slate-plugins-next.netlify.com/?path=/docs/plugins-image--example)
- [Link](https://slate-plugins-next.netlify.com/?path=/docs/plugins-link--example)
- [List](https://slate-plugins-next.netlify.com/?path=/docs/plugins-elements--block-plugins)
- [Mention](https://slate-plugins-next.netlify.com/?path=/docs/plugins-mention--example)
- [Paragraph](https://slate-plugins-next.netlify.com/?path=/docs/plugins-elements--block-plugins)
- [Table](https://slate-plugins-next.netlify.com/?path=/docs/plugins-table--example)
- [Video](https://slate-plugins-next.netlify.com/?path=/docs/plugins-video--example)

### Marks

A plugin for each type of leaf. All of these
use `renderLeaf`.

<img src="https://i.imgur.com/AVTAUqJ.png" alt="marks" width="400"/>

- [Bold](https://slate-plugins-next.netlify.com/?path=/docs/plugins-marks--mark-plugins)
- [Highlight](https://slate-plugins-next.netlify.com/?path=/docs/plugins-search-highlight--example)
- [Inline code](https://slate-plugins-next.netlify.com/?path=/docs/plugins-marks--mark-plugins)
- [Italic](https://slate-plugins-next.netlify.com/?path=/docs/plugins-marks--mark-plugins)
- [Strikethrough](https://slate-plugins-next.netlify.com/?path=/docs/plugins-marks--mark-plugins)
- [Underline](https://slate-plugins-next.netlify.com/?path=/docs/plugins-marks--mark-plugins)

### Utilities

- Slate Plugins
- Common
- [Forced Layout](https://slate-plugins-next.netlify.com/?path=/docs/plugins-forced-layout--example)
- [Markdown Preview](https://slate-plugins-next.netlify.com/?path=/docs/plugins-markdown-preview--example)
- [Markdown Shortcuts](https://slate-plugins-next.netlify.com/?path=/docs/plugins-markdown-shortcuts--example)
- [Paste Html](https://slate-plugins-next.netlify.com/?path=/docs/plugins-paste-html--example)
- [Search Highlight](https://slate-plugins-next.netlify.com/?path=/docs/plugins-search-highlight--example)
- [Toolbar](https://slate-plugins-next.netlify.com/?path=/docs/basic-hovering-toolbar--example)

## 📦 Install

```bash
yarn add slate-plugins-next
```

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

#### `yarn release`

> Lint, build and push a release to git and npm will ask for version in interactive mode - using lerna.

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
