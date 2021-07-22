<h1 align="center">
plate
</h1>

<p>
<div align="center">
  <a target="_blank" href="https://github.com/udecode/plate/releases/latest"><img src="https://img.shields.io/github/v/release/udecode/plate" /></a>
  <a target="_blank" href="https://plate.udecode.io/docs/playground" alt="Live Demo"><img src="https://img.shields.io/badge/Live%20Demo-blue" /></a>
  <a target="_blank" href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a target="_blank" href="https://codecov.io/gh/udecode/plate/branch/next/graph/badge.svg"><img src="https://codecov.io/gh/udecode/plate/branch/next/graph/badge.svg" /></a>
  <a target="_blank" href="https://github.com/facebook/jest"><img src="https://img.shields.io/badge/tested_with-jest-99424f.svg" alt="Tested with Jest"></a>
  <a target="_blank" href="https://github.com/udecode/plate/blob/main/LICENSE"><img src="https://badgen.now.sh/badge/license/MIT" /></a>
  <a target="_blank" href="https://slate-js.slack.com/messages/plate"><img src="https://img.shields.io/badge/slack-slate-yellow?logo=slack" /></a>
</div>
<div align="center">
</div>
</p>

## Visit [plate.udecode.io](https://plate.udecode.io/) for docs, guides, API and more!

## Introduction

[Slate](https://github.com/ianstormtaylor/slate) is a low-level editor
framework that helps you deal with difficult parts when building an
editor, such as events handlers, elements, formatting, commands,
rendering, serializing, normalizing, etc.

While you are trying to build your own editors, it still needs a lot of
skills to make something similar to [Quill](https://quilljs.com/) or
[ProseMirror](https://prosemirror.net/). This repository allows you to
build your editor right away with **minimal** slate knowledge.

`@udecode/plate` is built on top of slate to handle plugins and
state management for an optimal development experience. This repository
comes with a lot of plugins as elements, marks, serializers,
normalizers, queries, transforms, components and so on.

- 🏎 Simple Start

>  You only need one component to get started: `<Plate>`

- 🐻 State Management

> [zustand](https://github.com/pmndrs/zustand) store is internally used
> to support multiple editor states.

- 💅 Design System

> The API is design system friendly. We provide a default design system
> for quick start but you can plug-in your own one using a single
> function.

- 🔌 40+ Packages

> We enforce separation of concerns by packaging each feature for build
> optimization and versioning.

- 🛠 Extensible

> All plugins accept extensible options and if you need to fork a
> plugin, all its functions are exported.

- 📦 Tree-shaking / ES modules
- ✅ TypeScript types
- ✅ Unit tested with `slate@0.63.0` and `slate-react@0.65.2`

## Packages

### Core libraries

| Name                                               | Version                                                                                                                                                                                         | Description                               |
|:---------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------|
| [`@udecode/plate-common`](packages/common) | [<img src="https://img.shields.io/npm/v/@udecode/plate-common.svg" alt="@udecode/plate-common npm package badge">](https://www.npmjs.com/package/@udecode/plate-common) | Common queries, transforms and utilities. |
| [`@udecode/plate-core`](packages/core)     | [<img src="https://img.shields.io/npm/v/@udecode/plate-core.svg" alt="@udecode/plate-core npm package badge">](https://www.npmjs.com/package/@udecode/plate-core)       | Core plate architecture.          |

### Element Plugins

| Name                                                                         | Version                                                                                                                                                                                                                 | Description                                       |
|:-----------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------|
| [`@udecode/plate-basic-elements`](packages/elements/basic-elements)  | [<img src="https://img.shields.io/npm/v/@udecode/plate-basic-elements.svg" alt="@udecode/plate-basic-elements npm package badge">](https://www.npmjs.com/package/@udecode/plate-basic-elements) | Basic elements.                                   |
| [`@udecode/plate-alignment`](packages/elements/alignment)            | [<img src="https://img.shields.io/npm/v/@udecode/plate-alignment.svg" alt="@udecode/plate-alignment npm package badge">](https://www.npmjs.com/package/@udecode/plate-alignment)                | Text alignment.                                   |
| [`@udecode/plate-alignment-ui`](packages/elements/alignment-ui)      | [<img src="https://img.shields.io/npm/v/@udecode/plate-alignment-ui.svg" alt="@udecode/plate-alignment-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-alignment-ui)       | Default UI for alignment.                         |
| [`@udecode/plate-block-quote`](packages/elements/block-quote/)       | [<img src="https://img.shields.io/npm/v/@udecode/plate-block-quote.svg" alt="@udecode/plate-block-quote npm package badge">](https://www.npmjs.com/package/@udecode/plate-block-quote)          | Block quotes.                                     |
| [`@udecode/plate-block-quote-ui`](packages/elements/block-quote-ui/) | [<img src="https://img.shields.io/npm/v/@udecode/plate-block-quote-ui.svg" alt="@udecode/plate-block-quote-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-block-quote-ui) | Default UI for block quotes.                      |
| [`@udecode/plate-code-block`](packages/elements/code-block)          | [<img src="https://img.shields.io/npm/v/@udecode/plate-code-block.svg" alt="@udecode/plate-code-block npm package badge">](https://www.npmjs.com/package/@udecode/plate-code-block)             | Code blocks.                                      |
| [`@udecode/plate-code-block-ui`](packages/elements/code-block-ui)    | [<img src="https://img.shields.io/npm/v/@udecode/plate-code-block-ui.svg" alt="@udecode/plate-code-block-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-code-block-ui)    | Default UI for code blocks.                       |
| [`@udecode/plate-heading`](packages/elements/heading/)               | [<img src="https://img.shields.io/npm/v/@udecode/plate-heading.svg" alt="@udecode/plate-heading npm package badge">](https://www.npmjs.com/package/@udecode/plate-heading)                      | Headings (from 1 to 6).                           |
| [`@udecode/plate-image`](packages/elements/image/)                   | [<img src="https://img.shields.io/npm/v/@udecode/plate-image.svg" alt="@udecode/plate-image npm package badge">](https://www.npmjs.com/package/@udecode/plate-image)                            | Images and pasting images from clipboard.         |
| [`@udecode/plate-image-ui`](packages/elements/image-ui/)             | [<img src="https://img.shields.io/npm/v/@udecode/plate-image-ui.svg" alt="@udecode/plate-image-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-image-ui)                   | Default UI for images.                            |
| [`@udecode/plate-link`](packages/elements/link/)                     | [<img src="https://img.shields.io/npm/v/@udecode/plate-link.svg" alt="@udecode/plate-link npm package badge">](https://www.npmjs.com/package/@udecode/plate-link)                               | Hyperlinks.                                       |
| [`@udecode/plate-link-ui`](packages/elements/link-ui/)               | [<img src="https://img.shields.io/npm/v/@udecode/plate-link-ui.svg" alt="@udecode/plate-link-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-link-ui)                      | Default UI for hyperlinks.                        |
| [`@udecode/plate-list`](packages/elements/list)                      | [<img src="https://img.shields.io/npm/v/@udecode/plate-list.svg" alt="@udecode/plate-list npm package badge">](https://www.npmjs.com/package/@udecode/plate-list)                               | Bulleted, numbered and to-do lists.               |
| [`@udecode/plate-list-ui`](packages/elements/list-ui)                | [<img src="https://img.shields.io/npm/v/@udecode/plate-list-ui.svg" alt="@udecode/plate-list-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-list-ui)                      | Default UI for lists.                             |
| [`@udecode/plate-media-embed`](packages/elements/media-embed)        | [<img src="https://img.shields.io/npm/v/@udecode/plate-media-embed.svg" alt="@udecode/plate-media-embed npm package badge">](https://www.npmjs.com/package/@udecode/plate-media-embed)          | Embeddable media such as YouTube or Vimeo videos. |
| [`@udecode/plate-media-embed-ui`](packages/elements/media-embed-ui)  | [<img src="https://img.shields.io/npm/v/@udecode/plate-media-embed-ui.svg" alt="@udecode/plate-media-embed-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-media-embed-ui) | Default UI for embeddable media.                  |
| [`@udecode/plate-mention`](packages/elements/mention/)               | [<img src="https://img.shields.io/npm/v/@udecode/plate-mention.svg" alt="@udecode/plate-mention npm package badge">](https://www.npmjs.com/package/@udecode/plate-mention)                      | Autocompleting @mentions and #tags.               |
| [`@udecode/plate-mention-ui`](packages/elements/mention-ui/)         | [<img src="https://img.shields.io/npm/v/@udecode/plate-mention-ui.svg" alt="@udecode/plate-mention-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-mention-ui)             | Default UI for mentions.                          |
| [`@udecode/plate-paragraph`](packages/elements/paragraph/)           | [<img src="https://img.shields.io/npm/v/@udecode/plate-paragraph.svg" alt="@udecode/plate-paragraph npm package badge">](https://www.npmjs.com/package/@udecode/plate-paragraph)                | Paragraphs.                                       |
| [`@udecode/plate-table`](packages/elements/table/)                   | [<img src="https://img.shields.io/npm/v/@udecode/plate-table.svg" alt="@udecode/plate-table npm package badge">](https://www.npmjs.com/package/@udecode/plate-table)                            | Tables.                                           |
| [`@udecode/plate-table-ui`](packages/elements/table-ui/)             | [<img src="https://img.shields.io/npm/v/@udecode/plate-table-ui.svg" alt="@udecode/plate-table-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-table-ui)                   | Default UI for tables.                            |

### Mark Plugins

| Name                                                               | Version                                                                                                                                                                                                        | Description                                                                                     |
|:-------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
| [`@udecode/plate-basic-marks`](packages/marks/basic-marks) | [<img src="https://img.shields.io/npm/v/@udecode/plate-basic-marks.svg" alt="@udecode/plate-basic-marks npm package badge">](https://www.npmjs.com/package/@udecode/plate-basic-marks) | Basic text formatting: bold, code, italic, strikethrough, subscript, superscript and underline. |
| [`@udecode/plate-highlight`](packages/marks/highlight/)    | [<img src="https://img.shields.io/npm/v/@udecode/plate-highlight.svg" alt="@udecode/plate-highlight npm package badge">](https://www.npmjs.com/package/@udecode/plate-highlight)       | Highlights.                                                                                     |
| [`@udecode/plate-kbd`](packages/marks/kbd/)                | [<img src="https://img.shields.io/npm/v/@udecode/plate-kbd.svg" alt="@udecode/plate-kbd npm package badge">](https://www.npmjs.com/package/@udecode/plate-kbd)                         | Keyboard input formatting.                                                                      |

### Serializer Plugins

| Name                                                                             | Version                                                                                                                                                                                                                    | Description               |
|:---------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------|
| [`@udecode/plate-html-serializer`](packages/serializers/html-serializer) | [<img src="https://img.shields.io/npm/v/@udecode/plate-html-serializer.svg" alt="@udecode/plate-html-serializer npm package badge">](https://www.npmjs.com/package/@udecode/plate-html-serializer) | HTML (de)serializing.     |
| [`@udecode/plate-md-serializer`](packages/serializers/md-serializer)     | [<img src="https://img.shields.io/npm/v/@udecode/plate-md-serializer.svg" alt="@udecode/plate-md-serializer npm package badge">](https://www.npmjs.com/package/@udecode/plate-md-serializer)       | Markdown (de)serializing. |
| [`@udecode/plate-ast-serializer`](packages/serializers/ast-serializer) | [<img src="https://img.shields.io/npm/v/@udecode/plate-ast-serializer.svg" alt="@udecode/plate-ast-serializer npm package badge">](https://www.npmjs.com/package/@udecode/plate-ast-serializer) | AST deserializing.     |
| [`@udecode/plate-csv-serializer`](packages/serializers/csv-serializer) | [<img src="https://img.shields.io/npm/v/@udecode/plate-csv-serializer.svg" alt="@udecode/plate-csv-serializer npm package badge">](https://www.npmjs.com/package/@udecode/plate-csv-serializer) | CSV deserializing.     |

### Plugins

| Name                                                                 | Version                                                                                                                                                                                                                    | Description                                                                 |
|:---------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------|
| [`@udecode/plate-plate`](packages/plate)     | [<img src="https://img.shields.io/npm/v/@udecode/plate.svg" alt="@udecode/plate npm package badge">](https://www.npmjs.com/package/@udecode/plate)                                                 | Provides all packages.                                                      |
| [`@udecode/plate-autoformat`](packages/autoformat)           | [<img src="https://img.shields.io/npm/v/@udecode/plate-autoformat.svg" alt="@udecode/plate-autoformat npm package badge">](https://www.npmjs.com/package/@udecode/plate-autoformat)                | Autoformatting actions.                                                     |
| [`@udecode/plate-break`](packages/break)                     | [<img src="https://img.shields.io/npm/v/@udecode/plate-break.svg" alt="@udecode/plate-break npm package badge">](https://www.npmjs.com/package/@udecode/plate-break)                               | Soft-break and exit-break.                                                  |
| [`@udecode/plate-dnd`](packages/dnd)                         | [<img src="https://img.shields.io/npm/v/@udecode/plate-dnd.svg" alt="@udecode/plate-dnd npm package badge">](https://www.npmjs.com/package/@udecode/plate-dnd)                                     | Drag and drop with [react-dnd](https://github.com/react-dnd/react-dnd).     |
| [`@udecode/plate-find-replace`](packages/find-replace)       | [<img src="https://img.shields.io/npm/v/@udecode/plate-find-replace.svg" alt="@udecode/plate-find-replace npm package badge">](https://www.npmjs.com/package/@udecode/plate-find-replace)          | Highlighting searching text.                                                |
| [`@udecode/plate-find-replace-ui`](packages/find-replace-ui) | [<img src="https://img.shields.io/npm/v/@udecode/plate-find-replace-ui.svg" alt="@udecode/plate-find-replace-ui npm package badge">](https://www.npmjs.com/package/@udecode/plate-find-replace-ui) | Default UI for find-replace.                                                |
| [`@udecode/plate-node-id`](packages/node-id)                 | [<img src="https://img.shields.io/npm/v/@udecode/plate-node-id.svg" alt="@udecode/plate-node-id npm package badge">](https://www.npmjs.com/package/@udecode/plate-node-id)                         | Insert nodes with an id key.                                                |
| [`@udecode/plate-normalizers`](packages/normalizers)         | [<img src="https://img.shields.io/npm/v/@udecode/plate-normalizers.svg" alt="@udecode/plate-normalizers npm package badge">](https://www.npmjs.com/package/@udecode/plate-normalizers)             | Editor normalizers.                                                         |
| [`@udecode/plate-reset-node`](packages/reset-node)           | [<img src="https://img.shields.io/npm/v/@udecode/plate-reset-node.svg" alt="@udecode/plate-reset-node npm package badge">](https://www.npmjs.com/package/@udecode/plate-reset-node)                | Reset node type.                                                            |
| [`@udecode/plate-select`](packages/select)                   | [<img src="https://img.shields.io/npm/v/@udecode/plate-select.svg" alt="@udecode/plate-select npm package badge">](https://www.npmjs.com/package/@udecode/plate-select)                            | Selection utilities.                                                        |
| [`@udecode/plate-styled-components`](packages/ui/styled-components)             | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-fluent.svg" alt="@udecode/plate-ui-fluent npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-fluent)                   | Common UI utilities with [fluentui](https://github.com/microsoft/fluentui). |
| [`@udecode/plate-trailing-block`](packages/trailing-block)   | [<img src="https://img.shields.io/npm/v/@udecode/plate-trailing-block.svg" alt="@udecode/plate-trailing-block npm package badge">](https://www.npmjs.com/package/@udecode/plate-trailing-block)    | Ensures a trailing block.                                                   |
| [`@udecode/plate-toolbar`](packages/ui/toolbar)              | [<img src="https://img.shields.io/npm/v/@udecode/plate-toolbar.svg" alt="@udecode/plate-toolbar npm package badge">](https://www.npmjs.com/package/@udecode/plate-toolbar)                         | Toolbar components: balloon, heading, buttons.                              |
| [`@udecode/plate-test-utils`](packages/test-utils/)          | [<img src="https://img.shields.io/npm/v/@udecode/plate-test-utils.svg" alt="@udecode/plate-test-utils npm package badge">](https://www.npmjs.com/package/@udecode/plate-test-utils)                | Test utilities.                                                             |

### Author's Note

>  [@zbeyens](https://github.com/zbeyens): I'm building an app with an
>  editor like many of you and my first initiative was to spend months
>  to share this work, while hundreds of developers were coding and
>  debugging the exact same features. Open-source is a long-term
>  investment for a **bug-free product and reducing technical debt**, so
>  I can only encourage you to join this collaboration. Our goal is to
>  build a fully-featured editor.

#### [Become a Sponsor!](https://github.com/sponsors/zbeyens)

### Contributors

🌟 Stars and 📥 Pull requests are welcome! Don't hesitate to **share
your plugins** here. Read our [contributing guide](CONTRIBUTING.md) to
get started, or find us on
[Slack](https://slate-js.slack.com/messages/plate), we will
take the time to guide you.

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/zbeyens"><img src="https://avatars3.githubusercontent.com/u/19695832?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ziad Beyens</b></sub></a><br /><a href="#maintenance-zbeyens" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/dylans"><img src="https://avatars.githubusercontent.com/u/97291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dylan Schiemann</b></sub></a><br /><a href="#maintenance-dylans" title="Maintenance">🚧</a></td>
    <td align="center"><a href="http://horacioh.com"><img src="https://avatars3.githubusercontent.com/u/725120?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Horacio Herrera</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=horacioh" title="Code">💻</a> <a href="#plugin-horacioh" title="Plugin/utility libraries">🔌</a> <a href="#example-horacioh" title="Examples">💡</a> <a href="https://github.com/udecode/plate/issues?q=author%3Ahoracioh" title="Bug reports">🐛</a> <a href="#ideas-horacioh" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/eivindw"><img src="https://avatars2.githubusercontent.com/u/67761?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eivind Barstad Waaler</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=eivindw" title="Code">💻</a> <a href="#plugin-eivindw" title="Plugin/utility libraries">🔌</a> <a href="#example-eivindw" title="Examples">💡</a> <a href="https://github.com/udecode/plate/issues?q=author%3Aeivindw" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://spetex.dev"><img src="https://avatars3.githubusercontent.com/u/9515499?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Petr Sahula</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=spetex" title="Code">💻</a> <a href="#plugin-spetex" title="Plugin/utility libraries">🔌</a> <a href="#example-spetex" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/vujevits"><img src="https://avatars1.githubusercontent.com/u/2270661?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mark Vujevits</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=vujevits" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/alantrrs"><img src="https://avatars2.githubusercontent.com/u/689720?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alan</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=alantrrs" title="Code">💻</a> <a href="#plugin-alantrrs" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/udecode/plate/issues?q=author%3Aalantrrs" title="Bug reports">🐛</a> <a href="#ideas-alantrrs" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/cycle-app"><img src="https://avatars0.githubusercontent.com/u/53185684?v=4?s=100" width="100px;" alt=""/><br /><sub><b>cycle-app</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=cycle-app" title="Code">💻</a></td>
    <td align="center"><a href="https://devpaul.com"><img src="https://avatars2.githubusercontent.com/u/331431?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Paul</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=devpaul" title="Code">💻</a> <a href="https://github.com/udecode/plate/issues?q=author%3Adevpaul" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/danlunde"><img src="https://avatars3.githubusercontent.com/u/59754?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Lunde</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=danlunde" title="Code">💻</a> <a href="#plugin-danlunde" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://github.com/romansky"><img src="https://avatars2.githubusercontent.com/u/616961?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roman Landenband</b></sub></a><br /><a href="https://github.com/udecode/plate/commits?author=romansky" title="Code">💻</a> <a href="#plugin-romansky" title="Plugin/utility libraries">🔌</a> <a href="#example-romansky" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/karthikeyan676"><img src="https://avatars.githubusercontent.com/u/24937683?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Karthikeyan</b></sub></a><br /><a href="#plugin-karthikeyan676" title="Plugin/utility libraries">🔌</a> <a href="#example-karthikeyan676" title="Examples">💡</a> <a href="https://github.com/udecode/plate/issues?q=author%3Akarthikeyan676" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/ghingis"><img src="https://avatars.githubusercontent.com/u/3637899?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Csaba Benkő</b></sub></a><br /><a href="#plugin-ghingis" title="Plugin/utility libraries">🔌</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.
Contributions of any kind welcome!

## License

[MIT](LICENSE)
