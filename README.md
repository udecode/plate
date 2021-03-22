<h1 align="center">
slate-plugins
</h1>

<p align="center">
<a href="https://github.com/udecode/slate-plugins/releases/latest"><img src="https://img.shields.io/github/v/release/udecode/slate-plugins" /></a>
<a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
<a href="https://www.codefactor.io/repository/github/udecode/slate-plugins/badge"><img src="https://www.codefactor.io/repository/github/udecode/slate-plugins/badge" /></a>
<a href="https://codecov.io/gh/udecode/slate-plugins/branch/next/graph/badge.svg"><img src="https://codecov.io/gh/udecode/slate-plugins/branch/next/graph/badge.svg" /></a>
<a href="https://github.com/facebook/jest"><img src="https://img.shields.io/badge/tested_with-jest-99424f.svg" alt="Tested with Jest"></a>
<a href="https://github.com/udecode/slate-plugins/blob/master/LICENSE"><img src="https://badgen.now.sh/badge/license/MIT" /></a>
<a href="https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1"><img src="https://slate-slack.herokuapp.com/badge.svg?logo=slack" /></a>
</p>

> **We are working hard on v1 docs. Storybook docs are still for
> v0.75.**

Author's Note:

>  [@zbeyens](https://github.com/zbeyens): Hi, I'm building a startup
>  with an editor like many of you and my first initiative was to spend
>  months to share this work, while hundreds of developers were coding
>  and debugging the exact same features. Open-source is a long-term
>  investment for a **bug-free product** and to **minimize technical
>  debt**, so I can only encourage you to join this collaboration to
>  enjoy these benefits. At the end, a fully-featured editor will be
>  shared here. DRY.

## Introduction

[Slate](https://github.com/ianstormtaylor/slate/) is a low-level
framework for building rich text editors. However, it's not
beginner-friendly and your codebase can quickly get complex when
implementing tens of features.

`@udecode/slate-plugins` is built on top of `slate` to handle plugins
and state management for an optimal development experience. This
repository comes with a lot of plugins as elements, marks, serializers,
normalizers, queries, transforms, components and so on.

<!--[API documentation](https://slate-plugins-api.netlify.app/).-->

<!--[Try out our plugins](https://slate-plugins-next.netlify.app/?path=/story/plugins-playground--plugins)-->
<!--and-->
<!--[create yours in a few minutes](https://slate-plugins-next.netlify.app/?path=/docs/docs-guide--page)!-->

- 🏎 Simple Start

>  You only need one component to get started: `<SlatePlugins>`

- 🐻 State Management

> [zustand](https://github.com/pmndrs/zustand) store is internally used
> to support multiple editor states.

- 💅 Design System

> The API is design system friendly. We provide a default design system
> for quick start but you can plug-in your own one using a single
> function.

- 🔌 40+ Packages

> We enforce separation of concerns by packaging each feature for
> optimization and versioning.

- 📦 Tree-shaking / ES modules
- ✅ TypeScript types
- ✅ Unit tested with `slate@0.60.11`

<!--- 📓-->
<!--  [Docs](https://slate-plugins-next.netlify.app/?path=/docs/docs-getting-started--page)-->
<!--  and-->
<!--  [Demos](https://slate-plugins-next.netlify.app/?path=/story/plugins-playground--plugins)-->
<!--  on Storybook.-->
<!--- -->
<!--  📖 [API](https://slate-plugins-api.netlify.app/) generated with-->
<!--  [TypeDoc](https://typedoc.org/).-->

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

## Installation

You can install all the packages simultaneously:

```bash
yarn add @udecode/slate-plugins
```

You will also need these peer dependencies:

```bash
yarn add slate slate-hyperscript slate-react react react-dom
```

Alternatively you can install only the packages you need:

```bash
yarn add @udecode/slate-plugins-alignment
yarn add @udecode/slate-plugins-alignment-ui
yarn add @udecode/slate-plugins-autoformat
yarn add @udecode/slate-plugins-basic-elements
yarn add @udecode/slate-plugins-basic-marks
yarn add @udecode/slate-plugins-block-quote
yarn add @udecode/slate-plugins-block-quote-ui
yarn add @udecode/slate-plugins-break
yarn add @udecode/slate-plugins-code-block
yarn add @udecode/slate-plugins-code-block-ui
yarn add @udecode/slate-plugins-common
yarn add @udecode/slate-plugins-core
yarn add @udecode/slate-plugins-dnd
yarn add @udecode/slate-plugins-find-replace
yarn add @udecode/slate-plugins-find-replace-ui
yarn add @udecode/slate-plugins-heading
yarn add @udecode/slate-plugins-highlight
yarn add @udecode/slate-plugins-html-serializer
yarn add @udecode/slate-plugins-image
yarn add @udecode/slate-plugins-image-ui
yarn add @udecode/slate-plugins-kbd
yarn add @udecode/slate-plugins-link
yarn add @udecode/slate-plugins-link-ui
yarn add @udecode/slate-plugins-list
yarn add @udecode/slate-plugins-list-ui
yarn add @udecode/slate-plugins-md-serializer
yarn add @udecode/slate-plugins-media-embed
yarn add @udecode/slate-plugins-media-embed-ui
yarn add @udecode/slate-plugins-mention
yarn add @udecode/slate-plugins-mention-ui
yarn add @udecode/slate-plugins-node-id
yarn add @udecode/slate-plugins-normalizers
yarn add @udecode/slate-plugins-paragraph
yarn add @udecode/slate-plugins-reset-node
yarn add @udecode/slate-plugins-select
yarn add @udecode/slate-plugins-table
yarn add @udecode/slate-plugins-table-ui
yarn add @udecode/slate-plugins-toolbar
yarn add @udecode/slate-plugins-trailing-block
yarn add @udecode/slate-plugins-ui-fluent
```

## Usage

> **v1 docs WIP**

Most plugins are used in
[this storybook playground](https://slate-plugins-next.netlify.app/?path=/story/plugins-playground--plugins).

For guidance on using `@udecode/slate-plugins` visit:
[slate-plugins-next.netlify.app](https://slate-plugins-next.netlify.app/)
and checkout our [API](https://slate-plugins-api.netlify.app/)
documentation.

For additional help, join us in
[Slate Slack](https://join.slack.com/t/slate-js/shared_invite/zt-f8t986ip-7dA1DyiqPpzootz1snKXkw).

## Packages

### Core libraries

## 🔌 Plugins

<img src="https://i.imgur.com/JAO2NPN.png" alt="blocks" width="400"/>

| Element Plugins                                                           | Version                                                                                                                                                                    | Description                                                           |
|:--------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------|
| [`@udecode/slate-plugins-alignment`](packages/elements/alignment)         | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins.svg" alt="@udecode/slate-plugins npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins) | Enables support for text alignment.                                                                      |
| [`@udecode/slate-plugins-alignment-ui`](packages/elements/alignment-ui)   |                                                                                                                                                                            | Default UI for alignment.                                             |
| [`@udecode/slate-plugins-BasicElements](packages/elements/basic-elements) |                                                                                                                                                                            | Enables support for basic elements.                                   |
| [`@udecode/slate-plugins-Blockquote](packages/elements/block-quote/)      |                                                                                                                                                                            | Enables support for block quotes.                                     |
| [`@udecode/slate-plugins-CodeBlock](packages/elements/code-block)         |                                                                                                                                                                            | Enables support for pre-formatted code blocks.                        |
| [`@udecode/slate-plugins-Heading](packages/elements/heading/)             |                                                                                                                                                                            | Enables support for headings (from 1 to 6).                           |
| [`@udecode/slate-plugins-Image](packages/elements/image/)                 |                                                                                                                                                                            | Enables support for images.                                           |
| [`@udecode/slate-plugins-ImageUpload](packages/elements/image/)           |                                                                                                                                                                            | Allows for pasting images from clipboard.                             |
| [`@udecode/slate-plugins-Link](packages/elements/link/)                   |                                                                                                                                                                            | Enables support for hyperlinks.                                       |
| [`@udecode/slate-plugins-List](packages/elements/list)                    |                                                                                                                                                                            | Enables support for bulleted, numbered and to-do lists.               |
| [`@udecode/slate-plugins-MediaEmbed](packages/elements/media-embed)       |                                                                                                                                                                            | Enables support for embeddable media such as YouTube or Vimeo videos. |
| [`@udecode/slate-plugins-Mention](packages/elements/mention/)             |                                                                                                                                                                            | Enables support for autocompleting @mentions and #tags.               |
| [`@udecode/slate-plugins-Paragraph](packages/elements/paragraph/)         |                                                                                                                                                                            | Enables support for paragraphs.                                       |
| [`@udecode/slate-plugins-Table](packages/elements/table/)                 |                                                                                                                                                                            | Enables support for tables.                                           |

<img src="https://imgur.com/NQJgC5b.png" alt="marks" width="650"/>

| Mark Plugins                                               |                                               |
|:-----------------------------------------------------------|:----------------------------------------------|
| [BasicMarks](packages/slate-plugins/src/marks/basic-marks) | Enables support for basic text formatting.    |
| [Bold](packages/marks/basic-marks/src/bold)                | Enables support for bold formatting.          |
| [Code](packages/basic-marks/src/code)                      | Enables support for inline code formatting.   |
| [Highlight](packages/slate-plugins/src/marks/highlight/)   | Enables support for highlights.               |
| [Italic](packages/basic-marks/src/italic)                  | Enables support for italic formatting.        |
| [Strikethrough](packages/basic-marks/src/strikethrough)    | Enables support for strikethrough formatting. |
| [Subscript](packages/basic-marks/src/subscript)            | Enables support for subscript formatting.     |
| [Superscript](packages/basic-marks/src/superscript)        | Enables support for superscript formatting.   |
| [Underline](packages/basic-marks/src/underline)            | Enables support for underline formatting.     |

| Deserializer Plugins                                           |                                                                                 |
|:---------------------------------------------------------------|:--------------------------------------------------------------------------------|
| [DeserializeHtml](packages/html-serializer/src/deserializer)   | Enables support for deserializing content from HTML format to Slate format.     |
| [DeserializeMarkdown](packages/md-serializer/src/deserializer) | Enables support for deserializing content from Markdown format to Slate format. |

| Serializer Plugins                                       |                                                                                                    |
|:---------------------------------------------------------|:---------------------------------------------------------------------------------------------------|
| [SerializeHtml](packages/html-serializer/src/serializer) | Enables support for serializing content from Slate format to HTML. Useful for exports from editor. |

| Normalizer Plugins                                        |                                                                                                                      |
|:----------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------|
| [NormalizeTypes](packages/slate-plugins/src/normalizers/) | Enables support for defining type rules for specific locations in the document.                                      |
| [TrailingNode](packages/slate-plugins/src/normalizers/)   | Enables support for inserting a trailing node of a configurable type when the type of the last node is not matching. |

| Handler Plugins                                             |                                             |
|:------------------------------------------------------------|:--------------------------------------------|
| [Autoformat](packages/slate-plugins/src/plugins/autoformat) | Enables support for autoformatting actions. |
| [SoftBreak](packages/break/src/soft-break)                  | Enables support for inserting soft breaks.  |

| Decorator Plugins                            |                                 |
|:---------------------------------------------|:--------------------------------|
| [Preview](stories/examples/preview-markdown) | Enables support for previewing. |

| Toolbar                                                      |                                                                |
|:-------------------------------------------------------------|:---------------------------------------------------------------|
| [BalloonToolbar](packages/components/src/components/Toolbar) | Provides a toolbar, pointing at a particular element or range. |
| [Toolbar](packages/components/src/components/Toolbar)        | Provides a toolbar with buttons.                               |

| Utility Plugins                                             |                                                     |
|:------------------------------------------------------------|:----------------------------------------------------|
| [NodeID](packages/slate-plugins/src/common/plugins/node-id) | Enables support for inserting nodes with an id key. |


| Widget Plugins                                                     |                                                  |
|:-------------------------------------------------------------------|:-------------------------------------------------|
| [SearchHighlight](packages/slate-plugins/src/widgets/find-replace) | Enables support for highlighting searching text. |

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

For simplicity, a single package `@udecode/slate-plugins` has been
published to share all the plugins. It's not a problem as
[it is tree-shakeable](https://bundlephobia.com/result?p=slate-plugins-next).
However, a few plugins use external dependencies. These should be moved
into their own package in the future.

## 👥 Community

- Chatting on
  [Slack](https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1)

## 👏 [Contributing](CONTRIBUTING.md)

We welcome contributions to `@udecode/slate-plugins`! Please feel free
to **share your own plugins** here.

📥 Pull requests and 🌟 Stars are always welcome. Read our
[contributing guide](CONTRIBUTING.md) to get started, or find us on
[Slack](https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1), we will
take the time to guide you

### 👨‍💻 Development scripts

Useful scripts include:

#### `yarn`

> Installs package dependencies

#### `yarn build`

> Build the local packages.

#### `yarn storybook`

> Starts storybook dev (after building).

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
    <td align="center"><a href="https://github.com/zbeyens"><img src="https://avatars3.githubusercontent.com/u/19695832?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ziad Beyens</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=zbeyens" title="Code">💻</a> <a href="#maintenance-zbeyens" title="Maintenance">🚧</a> <a href="#plugin-zbeyens" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/udecode/slate-plugins/commits?author=zbeyens" title="Tests">⚠️</a> <a href="https://github.com/udecode/slate-plugins/commits?author=zbeyens" title="Documentation">📖</a></td>
    <td align="center"><a href="http://horacioh.com"><img src="https://avatars3.githubusercontent.com/u/725120?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Horacio Herrera</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=horacioh" title="Code">💻</a> <a href="#plugin-horacioh" title="Plugin/utility libraries">🔌</a> <a href="#example-horacioh" title="Examples">💡</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Ahoracioh" title="Bug reports">🐛</a> <a href="#ideas-horacioh" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/eivindw"><img src="https://avatars2.githubusercontent.com/u/67761?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eivind Barstad Waaler</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=eivindw" title="Code">💻</a> <a href="#plugin-eivindw" title="Plugin/utility libraries">🔌</a> <a href="#example-eivindw" title="Examples">💡</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Aeivindw" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://spetex.dev"><img src="https://avatars3.githubusercontent.com/u/9515499?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Petr Sahula</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=spetex" title="Code">💻</a> <a href="#plugin-spetex" title="Plugin/utility libraries">🔌</a> <a href="#example-spetex" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/vujevits"><img src="https://avatars1.githubusercontent.com/u/2270661?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mark Vujevits</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=vujevits" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/alantrrs"><img src="https://avatars2.githubusercontent.com/u/689720?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alan</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=alantrrs" title="Code">💻</a> <a href="#plugin-alantrrs" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Aalantrrs" title="Bug reports">🐛</a> <a href="https://github.com/udecode/slate-plugins/commits?author=alantrrs" title="Tests">⚠️</a> <a href="#ideas-alantrrs" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/cycle-app"><img src="https://avatars0.githubusercontent.com/u/53185684?v=4?s=100" width="100px;" alt=""/><br /><sub><b>cycle-app</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=cycle-app" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://devpaul.com"><img src="https://avatars2.githubusercontent.com/u/331431?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Paul</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=devpaul" title="Code">💻</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Adevpaul" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/danlunde"><img src="https://avatars3.githubusercontent.com/u/59754?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Lunde</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=danlunde" title="Code">💻</a> <a href="#plugin-danlunde" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/udecode/slate-plugins/commits?author=danlunde" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/romansky"><img src="https://avatars2.githubusercontent.com/u/616961?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roman Landenband</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=romansky" title="Code">💻</a> <a href="#plugin-romansky" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/udecode/slate-plugins/commits?author=romansky" title="Tests">⚠️</a> <a href="#example-romansky" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/dylans"><img src="https://avatars.githubusercontent.com/u/97291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dylan Schiemann</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=dylans" title="Code">💻</a> <a href="#plugin-dylans" title="Plugin/utility libraries">🔌</a> <a href="#example-dylans" title="Examples">💡</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Adylans" title="Bug reports">🐛</a> <a href="#ideas-dylans" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

[MIT](LICENSE)
