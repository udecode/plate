<h1 align="center">
slate-plugins
</h1>

<p>
<div align="center">
  <a target="_blank" href="https://github.com/udecode/slate-plugins/releases/latest"><img src="https://img.shields.io/github/v/release/udecode/slate-plugins" /></a>
  <a target="_blank" href="https://slate-plugins.udecode.io/docs/playground" alt="Live Demo"><img src="https://img.shields.io/badge/Live%20Demo-blue" /></a>
  <a target="_blank" href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a target="_blank" href="https://codecov.io/gh/udecode/slate-plugins/branch/next/graph/badge.svg"><img src="https://codecov.io/gh/udecode/slate-plugins/branch/next/graph/badge.svg" /></a>
  <a target="_blank" href="https://github.com/facebook/jest"><img src="https://img.shields.io/badge/tested_with-jest-99424f.svg" alt="Tested with Jest"></a>
  <a target="_blank" href="https://github.com/udecode/slate-plugins/blob/main/LICENSE"><img src="https://badgen.now.sh/badge/license/MIT" /></a>
  <a target="_blank" href="https://slate-js.slack.com/messages/slate-plugins"><img src="https://img.shields.io/badge/slack-slate-yellow?logo=slack" /></a>
</div>
<div align="center">
</div>
</p>

## Visit [slate-plugins.udecode.io](https://slate-plugins.udecode.io/) for docs, guides, API and more!

## Introduction

[Slate](https://github.com/ianstormtaylor/slate) is a low-level editor
framework that helps you deal with difficult parts when building an
editor, such as events handlers, elements, formatting, commands,
rendering, serializing, normalizing, etc.

While you are trying to build your own editors, it still needs a lot of
skills to make something similar to [Quill](https://quilljs.com/) or
[ProseMirror](https://prosemirror.net/). This repository allows you to
build your editor right away with **minimal** slate knowledge.

`@udecode/slate-plugins` is built on top of slate to handle plugins and
state management for an optimal development experience. This repository
comes with a lot of plugins as elements, marks, serializers,
normalizers, queries, transforms, components and so on.

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

> We enforce separation of concerns by packaging each feature for build
> optimization and versioning.

- 🛠 Extensible

> All plugins accept extensible options and if you need to fork a
> plugin, all its functions are exported.

- 📦 Tree-shaking / ES modules
- ✅ TypeScript types
- ✅ Unit tested with `slate@0.63.0` and `slate-react@0.65.2`

<!--- 📓-->
<!--  [Docs](https://slate-plugins-next.netlify.app/?path=/docs/docs-getting-started--page)-->
<!--  and-->
<!--- -->
<!--  📖 [API](https://slate-plugins-api.netlify.app/) generated with-->
<!--  [TypeDoc](https://typedoc.org/).-->

## Packages

### Core libraries

| Name                                               | Version                                                                                                                                                                                         | Description                               |
|:---------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------|
| [`@udecode/slate-plugins-common`](packages/common) | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-common.svg" alt="@udecode/slate-plugins-common npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-common) | Common queries, transforms and utilities. |
| [`@udecode/slate-plugins-core`](packages/core)     | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-core.svg" alt="@udecode/slate-plugins-core npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-core)       | Core slate-plugins architecture.          |

### Element Plugins

| Name                                                                         | Version                                                                                                                                                                                                                 | Description                                       |
|:-----------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------|
| [`@udecode/slate-plugins-basic-elements`](packages/elements/basic-elements)  | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-basic-elements.svg" alt="@udecode/slate-plugins-basic-elements npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-basic-elements) | Basic elements.                                   |
| [`@udecode/slate-plugins-alignment`](packages/elements/alignment)            | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-alignment.svg" alt="@udecode/slate-plugins-alignment npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-alignment)                | Text alignment.                                   |
| [`@udecode/slate-plugins-alignment-ui`](packages/elements/alignment-ui)      | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-alignment-ui.svg" alt="@udecode/slate-plugins-alignment-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-alignment-ui)       | Default UI for alignment.                         |
| [`@udecode/slate-plugins-block-quote`](packages/elements/block-quote/)       | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-block-quote.svg" alt="@udecode/slate-plugins-block-quote npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-block-quote)          | Block quotes.                                     |
| [`@udecode/slate-plugins-block-quote-ui`](packages/elements/block-quote-ui/) | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-block-quote-ui.svg" alt="@udecode/slate-plugins-block-quote-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-block-quote-ui) | Default UI for block quotes.                      |
| [`@udecode/slate-plugins-code-block`](packages/elements/code-block)          | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-code-block.svg" alt="@udecode/slate-plugins-code-block npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-code-block)             | Code blocks.                                      |
| [`@udecode/slate-plugins-code-block-ui`](packages/elements/code-block-ui)    | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-code-block-ui.svg" alt="@udecode/slate-plugins-code-block-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-code-block-ui)    | Default UI for code blocks.                       |
| [`@udecode/slate-plugins-heading`](packages/elements/heading/)               | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-heading.svg" alt="@udecode/slate-plugins-heading npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-heading)                      | Headings (from 1 to 6).                           |
| [`@udecode/slate-plugins-image`](packages/elements/image/)                   | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-image.svg" alt="@udecode/slate-plugins-image npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-image)                            | Images and pasting images from clipboard.         |
| [`@udecode/slate-plugins-image-ui`](packages/elements/image-ui/)             | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-image-ui.svg" alt="@udecode/slate-plugins-image-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-image-ui)                   | Default UI for images.                            |
| [`@udecode/slate-plugins-link`](packages/elements/link/)                     | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-link.svg" alt="@udecode/slate-plugins-link npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-link)                               | Hyperlinks.                                       |
| [`@udecode/slate-plugins-link-ui`](packages/elements/link-ui/)               | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-link-ui.svg" alt="@udecode/slate-plugins-link-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-link-ui)                      | Default UI for hyperlinks.                        |
| [`@udecode/slate-plugins-list`](packages/elements/list)                      | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-list.svg" alt="@udecode/slate-plugins-list npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-list)                               | Bulleted, numbered and to-do lists.               |
| [`@udecode/slate-plugins-list-ui`](packages/elements/list-ui)                | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-list-ui.svg" alt="@udecode/slate-plugins-list-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-list-ui)                      | Default UI for lists.                             |
| [`@udecode/slate-plugins-media-embed`](packages/elements/media-embed)        | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-media-embed.svg" alt="@udecode/slate-plugins-media-embed npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-media-embed)          | Embeddable media such as YouTube or Vimeo videos. |
| [`@udecode/slate-plugins-media-embed-ui`](packages/elements/media-embed-ui)  | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-media-embed-ui.svg" alt="@udecode/slate-plugins-media-embed-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-media-embed-ui) | Default UI for embeddable media.                  |
| [`@udecode/slate-plugins-mention`](packages/elements/mention/)               | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-mention.svg" alt="@udecode/slate-plugins-mention npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-mention)                      | Autocompleting @mentions and #tags.               |
| [`@udecode/slate-plugins-mention-ui`](packages/elements/mention-ui/)         | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-mention-ui.svg" alt="@udecode/slate-plugins-mention-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-mention-ui)             | Default UI for mentions.                          |
| [`@udecode/slate-plugins-paragraph`](packages/elements/paragraph/)           | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-paragraph.svg" alt="@udecode/slate-plugins-paragraph npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-paragraph)                | Paragraphs.                                       |
| [`@udecode/slate-plugins-table`](packages/elements/table/)                   | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-table.svg" alt="@udecode/slate-plugins-table npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-table)                            | Tables.                                           |
| [`@udecode/slate-plugins-table-ui`](packages/elements/table-ui/)             | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-table-ui.svg" alt="@udecode/slate-plugins-table-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-table-ui)                   | Default UI for tables.                            |

### Mark Plugins

| Name                                                               | Version                                                                                                                                                                                                        | Description                                                                                     |
|:-------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
| [`@udecode/slate-plugins-basic-marks`](packages/marks/basic-marks) | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-basic-marks.svg" alt="@udecode/slate-plugins-basic-marks npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-basic-marks) | Basic text formatting: bold, code, italic, strikethrough, subscript, superscript and underline. |
| [`@udecode/slate-plugins-highlight`](packages/marks/highlight/)    | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-highlight.svg" alt="@udecode/slate-plugins-highlight npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-highlight)       | Highlights.                                                                                     |
| [`@udecode/slate-plugins-kbd`](packages/marks/kbd/)                | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-kbd.svg" alt="@udecode/slate-plugins-kbd npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-kbd)                         | Keyboard input formatting.                                                                      |

### Serializer Plugins

| Name                                                                             | Version                                                                                                                                                                                                                    | Description               |
|:---------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------|
| [`@udecode/slate-plugins-html-serializer`](packages/serializers/html-serializer) | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-html-serializer.svg" alt="@udecode/slate-plugins-html-serializer npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-html-serializer) | HTML (de)serializing.     |
| [`@udecode/slate-plugins-md-serializer`](packages/serializers/md-serializer)     | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-md-serializer.svg" alt="@udecode/slate-plugins-md-serializer npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-md-serializer)       | Markdown (de)serializing. |
| [`@udecode/slate-plugins-ast-serializer`](packages/serializers/ast-serializer) | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-ast-serializer.svg" alt="@udecode/slate-plugins-ast-serializer npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-ast-serializer) | AST deserializing.     |
| [`@udecode/slate-plugins-csv-serializer`](packages/serializers/csv-serializer) | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-csv-serializer.svg" alt="@udecode/slate-plugins-csv-serializer npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-csv-serializer) | CSV deserializing.     |

### Plugins

| Name                                                                 | Version                                                                                                                                                                                                                    | Description                                                                 |
|:---------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------|
| [`@udecode/slate-plugins-slate-plugins`](packages/slate-plugins)     | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins.svg" alt="@udecode/slate-plugins npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins)                                                 | Provides all packages.                                                      |
| [`@udecode/slate-plugins-autoformat`](packages/autoformat)           | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-autoformat.svg" alt="@udecode/slate-plugins-autoformat npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-autoformat)                | Autoformatting actions.                                                     |
| [`@udecode/slate-plugins-break`](packages/break)                     | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-break.svg" alt="@udecode/slate-plugins-break npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-break)                               | Soft-break and exit-break.                                                  |
| [`@udecode/slate-plugins-dnd`](packages/dnd)                         | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-dnd.svg" alt="@udecode/slate-plugins-dnd npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-dnd)                                     | Drag and drop with [react-dnd](https://github.com/react-dnd/react-dnd).     |
| [`@udecode/slate-plugins-find-replace`](packages/find-replace)       | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-find-replace.svg" alt="@udecode/slate-plugins-find-replace npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-find-replace)          | Highlighting searching text.                                                |
| [`@udecode/slate-plugins-find-replace-ui`](packages/find-replace-ui) | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-find-replace-ui.svg" alt="@udecode/slate-plugins-find-replace-ui npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-find-replace-ui) | Default UI for find-replace.                                                |
| [`@udecode/slate-plugins-node-id`](packages/node-id)                 | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-node-id.svg" alt="@udecode/slate-plugins-node-id npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-node-id)                         | Insert nodes with an id key.                                                |
| [`@udecode/slate-plugins-normalizers`](packages/normalizers)         | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-normalizers.svg" alt="@udecode/slate-plugins-normalizers npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-normalizers)             | Editor normalizers.                                                         |
| [`@udecode/slate-plugins-reset-node`](packages/reset-node)           | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-reset-node.svg" alt="@udecode/slate-plugins-reset-node npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-reset-node)                | Reset node type.                                                            |
| [`@udecode/slate-plugins-select`](packages/select)                   | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-select.svg" alt="@udecode/slate-plugins-select npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-select)                            | Selection utilities.                                                        |
| [`@udecode/slate-plugins-styled-components`](packages/ui/styled-components)             | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-ui-fluent.svg" alt="@udecode/slate-plugins-ui-fluent npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-ui-fluent)                   | Common UI utilities with [fluentui](https://github.com/microsoft/fluentui). |
| [`@udecode/slate-plugins-trailing-block`](packages/trailing-block)   | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-trailing-block.svg" alt="@udecode/slate-plugins-trailing-block npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-trailing-block)    | Ensures a trailing block.                                                   |
| [`@udecode/slate-plugins-toolbar`](packages/ui/toolbar)              | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-toolbar.svg" alt="@udecode/slate-plugins-toolbar npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-toolbar)                         | Toolbar components: balloon, heading, buttons.                              |
| [`@udecode/slate-plugins-test-utils`](packages/test-utils/)          | [<img src="https://img.shields.io/npm/v/@udecode/slate-plugins-test-utils.svg" alt="@udecode/slate-plugins-test-utils npm package badge">](https://www.npmjs.com/package/@udecode/slate-plugins-test-utils)                | Test utilities.                                                             |

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
[Slack](https://slate-js.slack.com/messages/slate-plugins), we will
take the time to guide you.

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/zbeyens"><img src="https://avatars3.githubusercontent.com/u/19695832?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ziad Beyens</b></sub></a><br /><a href="#maintenance-zbeyens" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/dylans"><img src="https://avatars.githubusercontent.com/u/97291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dylan Schiemann</b></sub></a><br /><a href="#maintenance-dylans" title="Maintenance">🚧</a></td>
    <td align="center"><a href="http://horacioh.com"><img src="https://avatars3.githubusercontent.com/u/725120?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Horacio Herrera</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=horacioh" title="Code">💻</a> <a href="#plugin-horacioh" title="Plugin/utility libraries">🔌</a> <a href="#example-horacioh" title="Examples">💡</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Ahoracioh" title="Bug reports">🐛</a> <a href="#ideas-horacioh" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/eivindw"><img src="https://avatars2.githubusercontent.com/u/67761?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eivind Barstad Waaler</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=eivindw" title="Code">💻</a> <a href="#plugin-eivindw" title="Plugin/utility libraries">🔌</a> <a href="#example-eivindw" title="Examples">💡</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Aeivindw" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://spetex.dev"><img src="https://avatars3.githubusercontent.com/u/9515499?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Petr Sahula</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=spetex" title="Code">💻</a> <a href="#plugin-spetex" title="Plugin/utility libraries">🔌</a> <a href="#example-spetex" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/vujevits"><img src="https://avatars1.githubusercontent.com/u/2270661?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mark Vujevits</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=vujevits" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/alantrrs"><img src="https://avatars2.githubusercontent.com/u/689720?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alan</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=alantrrs" title="Code">💻</a> <a href="#plugin-alantrrs" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Aalantrrs" title="Bug reports">🐛</a> <a href="#ideas-alantrrs" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/cycle-app"><img src="https://avatars0.githubusercontent.com/u/53185684?v=4?s=100" width="100px;" alt=""/><br /><sub><b>cycle-app</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=cycle-app" title="Code">💻</a></td>
    <td align="center"><a href="https://devpaul.com"><img src="https://avatars2.githubusercontent.com/u/331431?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Paul</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=devpaul" title="Code">💻</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Adevpaul" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/danlunde"><img src="https://avatars3.githubusercontent.com/u/59754?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Lunde</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=danlunde" title="Code">💻</a> <a href="#plugin-danlunde" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://github.com/romansky"><img src="https://avatars2.githubusercontent.com/u/616961?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roman Landenband</b></sub></a><br /><a href="https://github.com/udecode/slate-plugins/commits?author=romansky" title="Code">💻</a> <a href="#plugin-romansky" title="Plugin/utility libraries">🔌</a> <a href="#example-romansky" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/karthikeyan676"><img src="https://avatars.githubusercontent.com/u/24937683?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Karthikeyan</b></sub></a><br /><a href="#plugin-karthikeyan676" title="Plugin/utility libraries">🔌</a> <a href="#example-karthikeyan676" title="Examples">💡</a> <a href="https://github.com/udecode/slate-plugins/issues?q=author%3Akarthikeyan676" title="Bug reports">🐛</a></td>
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
