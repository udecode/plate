# slate-plugins

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/udecode/slate-plugins)](https://github.com/udecode/slate-plugins/releases/latest)
[![CodeFactor](https://www.codefactor.io/repository/github/udecode/slate-plugins/badge)](https://www.codefactor.io/repository/github/udecode/slate-plugins)
[![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/udecode/slate-plugins)](https://snyk.io/test/github/udecode/slate-plugins)
[![codecov](https://codecov.io/gh/udecode/slate-plugins/branch/next/graph/badge.svg)](https://codecov.io/gh/udecode/slate-plugins)
[<img src="https://badgen.now.sh/badge/license/MIT" />](https://github.com/udecode/slate-plugins/blob/master/LICENSE)&nbsp;
[<img src="https://slate-slack.herokuapp.com/badge.svg?logo=slack" />](https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1)&nbsp;

[Slate](https://github.com/ianstormtaylor/slate/) is a completely
customizable framework for building rich text editors. However, your
codebase can quickly get complex when implementing tens of features.
Built on top of Slate, `slate-plugins` enables you to use a list of
configurable and extendable plugins to keep your codebase clean and easy
to debug.

This library comes with a lot of plugins for the elements, marks,
deserialization, normalization, and so on. We also provide a bunch of
helpers on top of Slate's API.

[Try out the existing ones](https://slate-plugins-next.netlify.app/?path=/story/plugins-playground--plugins)
and
[create your own plugins](https://slate-plugins-next.netlify.app/?path=/docs/docs-guide--page)!


## 📦 Included

- ✨ 30+ Editor Plugins.
- ✅ Unit tested with `slate@0.58.3`.
- 🏷️ Separation of Concerns.
- ⚛️ Atomic Design.
- 📖
  [Docs](https://slate-plugins-next.netlify.app/?path=/docs/docs-getting-started--page)
  and
  [Demos](https://slate-plugins-next.netlify.app/?path=/story/plugins-playground--plugins)
  on Storybook.

## Table of contents

- 🚀 [Getting Started](#-getting-started)
- 🔌 [Plugins](#-plugins)
- 🤔 [Notice](#-notice)
  - [Why](#why)
  - [Bundle size](#bundle-size)
- 👥 [Community](#-community)
- 👏 [Contributing](#-contributing)
  - 👨‍💻 [Development scripts](#-development-scripts)
- ✨ [Contributors](#contributors-)
- :memo: [License](#license)

## 🚀 Getting Started

```bash
yarn add @udecode/slate-plugins
```

> ⚠️ In production, you should pin the dependency until 1.0.0 is
> released.

You will also need these peerDependencies:

```bash
yarn add slate slate-hyperscript slate-react styled-components react react-dom
```

For full documentation on using `slate-plugins` visit:
[slate-plugins-next.netlify.app](https://slate-plugins-next.netlify.app/)

For additional help, join us in our
[Slack](https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1)

## 🔌 Plugins

<img src="https://i.imgur.com/JAO2NPN.png" alt="blocks" width="400"/>

| Element Plugins                                                     |                                                                       |
|:--------------------------------------------------------------------|:----------------------------------------------------------------------|
| [BasicElements](packages/slate-plugins/src/elements/basic-elements) | Enables support for basic elements.                                   |
| [Blockquote](packages/slate-plugins/src/elements/blockquote/)       | Enables support for block quotes.                                     |
| [CodeBlock](packages/slate-plugins/src/elements/code-block)         | Enables support for pre-formatted code blocks.                        |
| [Heading](packages/slate-plugins/src/elements/heading/)             | Enables support for headings (from 1 to 6).                           |
| [Image](packages/slate-plugins/src/elements/image/)                 | Enables support for images.                                           |
| [ImageUpload](packages/slate-plugins/src/elements/image/)           | Allows for pasting images from clipboard.                             |
| [Link](packages/slate-plugins/src/elements/link/)                   | Enables support for hyperlinks.                                       |
| [List](packages/slate-plugins/src/elements/list)                    | Enables support for bulleted, numbered and to-do lists.               |
| [MediaEmbed](packages/slate-plugins/src/elements/media-embed)       | Enables support for embeddable media such as YouTube or Vimeo videos. |
| [Mention](packages/slate-plugins/src/elements/mention/)             | Enables support for autocompleting @mentions and #tags.               |
| [Paragraph](packages/slate-plugins/src/elements/paragraph/)         | Enables support for paragraphs.                                       |
| [Table](packages/slate-plugins/src/elements/table/)                 | Enables support for tables.                                           |

<img src="https://imgur.com/NQJgC5b.png" alt="marks" width="650"/>

| Mark Plugins                                                     |                                               |
|:-----------------------------------------------------------------|:----------------------------------------------|
| [BasicMarks](packages/slate-plugins/src/marks/basic-marks)       | Enables support for basic text formatting.    |
| [Bold](packages/slate-plugins/src/marks/bold/)                   | Enables support for bold formatting.          |
| [Code](packages/slate-plugins/src/marks/code)                    | Enables support for inline code formatting.   |
| [Highlight](packages/slate-plugins/src/marks/highlight/)         | Enables support for highlights.               |
| [Italic](packages/slate-plugins/src/marks/italic)                | Enables support for italic formatting.        |
| [Strikethrough](packages/slate-plugins/src/marks/strikethrough/) | Enables support for strikethrough formatting. |
| [Subscript](packages/slate-plugins/src/marks/subscript/)         | Enables support for subscript formatting.     |
| [Superscript](packages/slate-plugins/src/marks/superscript/)     | Enables support for superscript formatting.   |
| [Underline](packages/slate-plugins/src/marks/underline)          | Enables support for underline formatting.     |

| Deserializer Plugins                                                            |                                                                                 |
|:--------------------------------------------------------------------------------|:--------------------------------------------------------------------------------|
| [DeserializeHtml](packages/slate-plugins/src/deserializers/deserialize-html/)   | Enables support for deserializing content from HTML format to Slate format.     |
| [DeserializeMarkdown](packages/slate-plugins/src/deserializers/deserialize-md/) | Enables support for deserializing content from Markdown format to Slate format. |

| Serializer Plugins                                                            |                                                                                 |
|:--------------------------------------------------------------------------------|:--------------------------------------------------------------------------------|
| [SerializeHtml](packages/slate-plugins/src/serializers/serialize-html/)   | Enables support for serializing content from Slate format to HTML. Useful for exports from editor.    |

| Normalizer Plugins                                        |                                                                                                                      |
|:----------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------|
| [NormalizeTypes](packages/slate-plugins/src/normalizers/) | Enables support for defining type rules for specific locations in the document.                                      |
| [TrailingNode](packages/slate-plugins/src/normalizers/)   | Enables support for inserting a trailing node of a configurable type when the type of the last node is not matching. |

| Handler Plugins                                               |                                                     |
|:--------------------------------------------------------------|:----------------------------------------------------|
| [Autoformat](packages/slate-plugins/src/handlers/autoformat/) | Enables support for autoformatting actions.         |
| [SoftBreak](packages/slate-plugins/src/handlers/soft-break/)  | Enables support for inserting soft breaks.          |

| Decorator Plugins                                         |                                 |
|:----------------------------------------------------------|:--------------------------------|
| [Preview](packages/slate-plugins/src/decorators/preview/) | Enables support for previewing. |

| Toolbar                                                          |                                                                |
|:-----------------------------------------------------------------|:---------------------------------------------------------------|
| [BalloonToolbar](packages/slate-plugins/src/components/Toolbar/) | Provides a toolbar, pointing at a particular element or range. |
| [Toolbar](packages/slate-plugins/src/components/Toolbar/)        | Provides a toolbar with buttons.                               |

| Utility Plugins                                                |                                                     |
|:---------------------------------------------------------------|:----------------------------------------------------|
| [NodeID](packages/slate-plugins/src/common/transforms/node-id) | Enables support for inserting nodes with an id key. |


| Widget Plugins                                                          |                                                  |
|:------------------------------------------------------------------------|:-------------------------------------------------|
| [SearchHighlight](packages/slate-plugins/src/widgets/search-highlight/) | Enables support for highlighting searching text. |

## 🤔 Notice

### Why

[Slate](https://github.com/ianstormtaylor/slate) is a powerful editor
framework that helps you deal with difficult parts when building an
editor, such as events handlers, elements, formatting, commands,
rendering, serializing, normalizing, etc.

While you are trying to build your own editors, it still need a lot of
efforts to make something similar to [Quill](https://quilljs.com/) or
[ProseMirror](https://prosemirror.net/). This repository allows you to
build your editor right away with **minimal** slate knowledge.

### Bundle size

For simplicity, a single package `@udecode/slate-plugins` has been published
to share all the plugins. It's not a problem as
[it is tree-shakeable](https://bundlephobia.com/result?p=slate-plugins-next).
However, a few plugins use external dependencies. These should be moved
into their own package in the future.

## 👥 Community

- Chatting on
  [Slack](https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1)

## 👏 [Contributing](CONTRIBUTING.md)

We welcome contributions to `slate-plugins`! Please feel free to **share
your own plugins** here.


📥 Pull requests and 🌟 Stars are always welcome. Read our
[contributing guide](CONTRIBUTING.md) to get started, or find us on
[Slack](https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1), we will
take the time to guide you

### 👨‍💻 Development scripts

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

> Lint, test, build and push a release to git and npm will ask for
> version in interactive mode - using lerna.

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<table>
  <tr>
    <td align="center"><a href="https://github.com/zbeyens"><img src="https://avatars3.githubusercontent.com/u/19695832?v=4" width="100px;" alt=""/><br /><sub><b>Ziad Beyens</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=zbeyens" title="Code">💻</a> <a href="#maintenance-zbeyens" title="Maintenance">🚧</a> <a href="#plugin-zbeyens" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/udecode/slate-plugins/commits?author=zbeyens" title="Tests">⚠️</a> <a href="https://github.com/udecode/slate-plugins/commits?author=zbeyens" title="Documentation">📖</a></td>
    <td align="center"><a href="http://horacioh.com"><img src="https://avatars3.githubusercontent.com/u/725120?v=4" width="100px;" alt=""/><br /><sub><b>Horacio Herrera</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=horacioh" title="Code">💻</a> <a href="#plugin-horacioh" title="Plugin/utility libraries">🔌</a> <a href="#example-horacioh" title="Examples">💡</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Ahoracioh" title="Bug reports">🐛</a> <a href="#ideas-horacioh" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/eivindw"><img src="https://avatars2.githubusercontent.com/u/67761?v=4" width="100px;" alt=""/><br /><sub><b>Eivind Barstad Waaler</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=eivindw" title="Code">💻</a> <a href="#plugin-eivindw" title="Plugin/utility libraries">🔌</a> <a href="#example-eivindw" title="Examples">💡</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Aeivindw" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://spetex.dev"><img src="https://avatars3.githubusercontent.com/u/9515499?v=4" width="100px;" alt=""/><br /><sub><b>Petr Sahula</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=spetex" title="Code">💻</a> <a href="#plugin-spetex" title="Plugin/utility libraries">🔌</a> <a href="#example-spetex" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/vujevits"><img src="https://avatars1.githubusercontent.com/u/2270661?v=4" width="100px;" alt=""/><br /><sub><b>Mark Vujevits</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=vujevits" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

[MIT](LICENSE)
