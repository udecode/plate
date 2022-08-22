<h1 align="center">
Plate
</h1>

<p>
<div align="center">
  <a href="https://www.npmjs.com/package/@udecode/plate-core"><img src="https://img.shields.io/npm/dt/@udecode/plate-core.svg" alt="Total Downloads"></a>
  <a target="_blank" href="https://github.com/udecode/plate/releases/latest"><img src="https://img.shields.io/github/v/release/udecode/plate" /></a>
  <a target="_blank" href="https://plate.udecode.io/docs/playground" alt="Live Demo"><img src="https://img.shields.io/badge/Live%20Demo-blue" /></a>
  <a target="_blank" href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a target="_blank" href="https://github.com/udecode/plate/blob/main/LICENSE"><img src="https://badgen.now.sh/badge/license/MIT" /></a>
  <a target="_blank" href="https://slate-js.slack.com/messages/plate"><img src="https://img.shields.io/badge/slack-slate-yellow?logo=slack" /></a>
</div>
<div align="center">
<a href="https://vercel.com/?utm_source=udecode&utm_campaign=oss"><img height="32" src="https://styled-icons.dev/powered-by-vercel.svg" alt="Powered by Vercel" /></a>
</div>
</p>

## Visit [plate.udecode.io](https://plate.udecode.io/) for docs, guides, API and more!

### Hiring

Plate consulting:
- [@zbeyens](https://superpeer.com/zbeyens) – author

Looking to hire:
- [@dylans](https://github.com/dylans) – co-owner
- [@nicholasareed](https://github.com/nicholasareed)

DM [@zbeyens](https://github.com/zbeyens) to get added to the list if your offer includes Plate contribution.

## Introduction

[Slate](https://github.com/ianstormtaylor/slate) is a low-level editor
framework that helps you deal with difficult parts when building an
editor, such as events handlers, elements, formatting, commands,
rendering, serializing, normalizing, etc.

While you are trying to build your own editors, it still needs a lot of
skills to make something similar to [Quill](https://quilljs.com/) or
[ProseMirror](https://prosemirror.net/). This repository allows you to
build your editor right away with **minimal** slate knowledge.

`@udecode/plate` is built on top of slate to handle plugins and state
management for an optimal development experience. This repository comes
with a lot of plugins as elements, marks, serializers, normalizers,
queries, transforms, components and so on.

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

## Documentation

To find out more see the following Plate documentation sections:

- [API documentation](https://plate-api.udecode.io/globals.html)
- [Docs](https://plate.udecode.io)
  - [Quick start](https://plate.udecode.io/docs/installation)
  - [Guides](https://plate.udecode.io/docs/Plate)
  - [Playground](https://plate.udecode.io/docs/playground)
- [Examples](examples)
  - [NextJS](examples/apps/next)
  - [CRA](examples/apps/cra)

The documentation is far from being complete and will be constantly
evolving (as will the packages).

## Contributing and project organization

### Ideas and discussions

[Discussions](https://github.com/udecode/plate/discussions) is the best
place for bringing opinions and contributions. Letting us know if we're
going in the right or wrong direction is great feedback and will be much
appreciated!

### Development

Plate is a modular, multi-package, monorepo project. It consists of a
core package that creates the plugin system, based on which the plugin
packages are implemented.

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute
your code to the project.

## Packages

### Core libraries

| Name                                       | Version                                                                                                                                                                 | Description                               |
|:-------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------|
| [`@udecode/plate-common`](packages/common) | [<img src="https://img.shields.io/npm/v/@udecode/plate-common.svg" alt="@udecode/plate-common npm package badge">](https://www.npmjs.com/package/@udecode/plate-common) | Common queries, transforms and utilities. |
| [`@udecode/plate-core`](packages/core)     | [<img src="https://img.shields.io/npm/v/@udecode/plate-core.svg" alt="@udecode/plate-core npm package badge">](https://www.npmjs.com/package/@udecode/plate-core)       | Core plate architecture.                  |

### Element Plugins

| Name                                                              | Version                                                                                                                                                                                         | Description                                               |
|:------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------|
| [`@udecode/plate-basic-elements`](packages/nodes/basic-elements)  | [<img src="https://img.shields.io/npm/v/@udecode/plate-basic-elements.svg" alt="@udecode/plate-basic-elements npm package badge">](https://www.npmjs.com/package/@udecode/plate-basic-elements) | Basic elements plugins.                                   |
| [`@udecode/plate-alignment`](packages/nodes/alignment)            | [<img src="https://img.shields.io/npm/v/@udecode/plate-alignment.svg" alt="@udecode/plate-alignment npm package badge">](https://www.npmjs.com/package/@udecode/plate-alignment)                | Text alignment plugin.                                    |
| [`@udecode/plate-ui-alignment`](packages/ui/nodes/alignment)      | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-alignment.svg" alt="@udecode/plate-ui-alignment npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-alignment)       | Text alignment UI.                                        |
| [`@udecode/plate-block-quote`](packages/nodes/block-quote/)       | [<img src="https://img.shields.io/npm/v/@udecode/plate-block-quote.svg" alt="@udecode/plate-block-quote npm package badge">](https://www.npmjs.com/package/@udecode/plate-block-quote)          | Block quote plugin.                                       |
| [`@udecode/plate-ui-block-quote`](packages/ui/nodes/block-quote/) | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-block-quote.svg" alt="@udecode/plate-ui-block-quote npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-block-quote) | Block quote UI.                                           |
| [`@udecode/plate-code-block`](packages/nodes/code-block)          | [<img src="https://img.shields.io/npm/v/@udecode/plate-code-block.svg" alt="@udecode/plate-code-block npm package badge">](https://www.npmjs.com/package/@udecode/plate-code-block)             | Code block plugin.                                        |
| [`@udecode/plate-ui-code-block`](packages/ui/nodes/code-block)    | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-code-block.svg" alt="@udecode/plate-ui-code-block npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-code-block)    | Code block UI.                                            |
| [`@udecode/plate-excalidraw`](packages/ui/nodes/excalidraw/)      | [<img src="https://img.shields.io/npm/v/@udecode/plate-excalidraw.svg" alt="@udecode/plate-excalidraw npm package badge">](https://www.npmjs.com/package/@udecode/plate-excalidraw)             | Excalidraw plugin.                                        |
| [`@udecode/plate-heading`](packages/nodes/heading/)               | [<img src="https://img.shields.io/npm/v/@udecode/plate-heading.svg" alt="@udecode/plate-heading npm package badge">](https://www.npmjs.com/package/@udecode/plate-heading)                      | Headings (1-6) plugin.                                    |
| [`@udecode/plate-link`](packages/nodes/link/)                     | [<img src="https://img.shields.io/npm/v/@udecode/plate-link.svg" alt="@udecode/plate-link npm package badge">](https://www.npmjs.com/package/@udecode/plate-link)                               | Link plugin.                                              |
| [`@udecode/plate-ui-link`](packages/ui/nodes/link/)               | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-link.svg" alt="@udecode/plate-ui-link npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-link)                      | Link UI.                                                  |
| [`@udecode/plate-list`](packages/nodes/list)                      | [<img src="https://img.shields.io/npm/v/@udecode/plate-list.svg" alt="@udecode/plate-list npm package badge">](https://www.npmjs.com/package/@udecode/plate-list)                               | Bulleted, numbered and to-do list plugins.                |
| [`@udecode/plate-ui-list`](packages/ui/nodes/list)                | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-list.svg" alt="@udecode/plate-ui-list npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-list)                      | List UI.                                                  |
| [`@udecode/plate-media`](packages/nodes/media)                        | [<img src="https://img.shields.io/npm/v/@udecode/plate-media.svg" alt="@udecode/plate-media npm package badge">](https://www.npmjs.com/package/@udecode/plate-media)                                  | Media embed plugin.                                       |
| [`@udecode/plate-ui-media`](packages/ui/nodes/media)                | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-media.svg" alt="@udecode/plate-ui-media npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-media)                         | Media embed UI.                                           |
| [`@udecode/plate-mention`](packages/nodes/mention/)               | [<img src="https://img.shields.io/npm/v/@udecode/plate-mention.svg" alt="@udecode/plate-mention npm package badge">](https://www.npmjs.com/package/@udecode/plate-mention)                      | Mention plugin (autocomplete `@mentions`, `#tags`, etc.). |
| [`@udecode/plate-ui-mention`](packages/ui/nodes/mention/)         | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-mention.svg" alt="@udecode/plate-ui-mention npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-mention)             | Mention UI.                                               |
| [`@udecode/plate-paragraph`](packages/nodes/paragraph/)           | [<img src="https://img.shields.io/npm/v/@udecode/plate-paragraph.svg" alt="@udecode/plate-paragraph npm package badge">](https://www.npmjs.com/package/@udecode/plate-paragraph)                | Paragraph plugin.                                         |
| [`@udecode/plate-table`](packages/nodes/table/)                   | [<img src="https://img.shields.io/npm/v/@udecode/plate-table.svg" alt="@udecode/plate-table npm package badge">](https://www.npmjs.com/package/@udecode/plate-table)                            | Table plugin.                                             |
| [`@udecode/plate-ui-table`](packages/ui/nodes/table/)             | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-table.svg" alt="@udecode/plate-ui-table npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-table)                   | Table UI.                                                 |

### Mark Plugins

| Name                                                       | Version                                                                                                                                                                                | Description                                                                                   |
|:-----------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------|
| [`@udecode/plate-basic-marks`](packages/nodes/basic-marks) | [<img src="https://img.shields.io/npm/v/@udecode/plate-basic-marks.svg" alt="@udecode/plate-basic-marks npm package badge">](https://www.npmjs.com/package/@udecode/plate-basic-marks) | Basic marks plugins: bold, code, italic, strikethrough, subscript, superscript and underline. |
| [`@udecode/plate-font`](packages/nodes/font)               | [<img src="https://img.shields.io/npm/v/@udecode/plate-font.svg" alt="@udecode/plate-font npm package badge">](https://www.npmjs.com/package/@udecode/plate-font)                      | Font color and background color plugins.                                                      |
| [`@udecode/plate-highlight`](packages/nodes/highlight/)    | [<img src="https://img.shields.io/npm/v/@udecode/plate-highlight.svg" alt="@udecode/plate-highlight npm package badge">](https://www.npmjs.com/package/@udecode/plate-highlight)       | Highlight plugin.                                                                             |
| [`@udecode/plate-kbd`](packages/nodes/kbd/)                | [<img src="https://img.shields.io/npm/v/@udecode/plate-kbd.svg" alt="@udecode/plate-kbd npm package badge">](https://www.npmjs.com/package/@udecode/plate-kbd)                         | Keyboard input plugin.                                                                        |

### Serializer Plugins

| Name                                                                     | Version                                                                                                                                                                                            | Description                 |
|:-------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------|
| [`@udecode/plate-serializer-md`](packages/serializers/md)     | [<img src="https://img.shields.io/npm/v/@udecode/plate-serializer-md.svg" alt="@udecode/plate-serializer-md npm package badge">](https://www.npmjs.com/package/@udecode/plate-serializer-md)       | Markdown serializer plugin. |
| [`@udecode/plate-serializer-csv`](packages/serializers/csv)   | [<img src="https://img.shields.io/npm/v/@udecode/plate-serializer-csv.svg" alt="@udecode/plate-serializer-csv npm package badge">](https://www.npmjs.com/package/@udecode/plate-serializer-csv)    | CSV serializer plugin.      |

### Plugins

| Name                                                                | Version                                                                                                                                                                                            | Description                                                                                                    |
|:--------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------|
| [`@udecode/plate`](packages/plate)                                  | [<img src="https://img.shields.io/npm/v/@udecode/plate.svg" alt="@udecode/plate npm package badge">](https://www.npmjs.com/package/@udecode/plate)                                                 | All-in-one package.                                                                                            |
| [`@udecode/plate-autoformat`](packages/editor/autoformat)                  | [<img src="https://img.shields.io/npm/v/@udecode/plate-autoformat.svg" alt="@udecode/plate-autoformat npm package badge">](https://www.npmjs.com/package/@udecode/plate-autoformat)                | Autoformatting plugin. Replaces predefined characters with a corresponding format (e.g. **foo** becomes bold). |
| [`@udecode/plate-break`](packages/editor/break)                            | [<img src="https://img.shields.io/npm/v/@udecode/plate-break.svg" alt="@udecode/plate-break npm package badge">](https://www.npmjs.com/package/@udecode/plate-break)                               | Insert break plugins.                                                                                          |
| [`@udecode/plate-ui-dnd`](packages/ui/dnd)                                | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-dnd.svg" alt="@udecode/plate-ui-dnd npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-dnd)                                     | Drag and drop with [react-dnd](https://github.com/react-dnd/react-dnd).                                        |
| [`@udecode/plate-find-replace`](packages/decorators/find-replace)              | [<img src="https://img.shields.io/npm/v/@udecode/plate-find-replace.svg" alt="@udecode/plate-find-replace npm package badge">](https://www.npmjs.com/package/@udecode/plate-find-replace)          | Find and replace plugin.                                                                                       |
| [`@udecode/plate-ui-find-replace`](packages/ui/find-replace)        | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-find-replace.svg" alt="@udecode/plate-ui-find-replace npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-find-replace) | Find and replace UI.                                                                                           |
| [`@udecode/plate-node-id`](packages/editor/node-id)                        | [<img src="https://img.shields.io/npm/v/@udecode/plate-node-id.svg" alt="@udecode/plate-node-id npm package badge">](https://www.npmjs.com/package/@udecode/plate-node-id)                         | Node ID plugin.                                                                                                |
| [`@udecode/plate-normalizers`](packages/editor/normalizers)                | [<img src="https://img.shields.io/npm/v/@udecode/plate-normalizers.svg" alt="@udecode/plate-normalizers npm package badge">](https://www.npmjs.com/package/@udecode/plate-normalizers)             | Normalizer plugins.                                                                                            |
| [`@udecode/plate-reset-node`](packages/editor/reset-node)                  | [<img src="https://img.shields.io/npm/v/@udecode/plate-reset-node.svg" alt="@udecode/plate-reset-node npm package badge">](https://www.npmjs.com/package/@udecode/plate-reset-node)                | Reset node plugin.                                                                                             |
| [`@udecode/plate-select`](packages/editor/select)                          | [<img src="https://img.shields.io/npm/v/@udecode/plate-select.svg" alt="@udecode/plate-select npm package badge">](https://www.npmjs.com/package/@udecode/plate-select)                            | Node selecting plugins.                                                                                        |
| [`@udecode/plate-styled-components`](packages/ui/styled-components) | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-fluent.svg" alt="@udecode/plate-ui-fluent npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-fluent)                   | Styled components (Plate UI library).                                                                          |
| [`@udecode/plate-trailing-block`](packages/editor/trailing-block)          | [<img src="https://img.shields.io/npm/v/@udecode/plate-trailing-block.svg" alt="@udecode/plate-trailing-block npm package badge">](https://www.npmjs.com/package/@udecode/plate-trailing-block)    | Trailing-block plugin.                                                                                         |
| [`@udecode/plate-ui-toolbar`](packages/ui/toolbar)                     | [<img src="https://img.shields.io/npm/v/@udecode/plate-ui-toolbar.svg" alt="@udecode/plate-ui-toolbar npm package badge">](https://www.npmjs.com/package/@udecode/plate-ui-toolbar)                         | Toolbar UI (balloon, heading, buttons, etc.).                                                                  |
| [`@udecode/plate-test-utils`](packages/test-utils/)                 | [<img src="https://img.shields.io/npm/v/@udecode/plate-test-utils.svg" alt="@udecode/plate-test-utils npm package badge">](https://www.npmjs.com/package/@udecode/plate-test-utils)                | Test utilities.                                                                                                |

## Looking for `slate-plugins`?

This repo has been renamed to `plate`. The name change should not
disrupt any current usage, repo clones, pull requests or issue
reporting. Links should redirect to the new location. The library
formerly known as `@udecode/slate-plugins` is now available as
`@udecode/plate`.

### Author's Note

>  [@zbeyens](https://github.com/zbeyens): I'm building an app with an
>  editor like many of you and my first initiative was to spend months
>  to share this work, while hundreds of developers were coding and
>  debugging the exact same features. Open-source is a long-term
>  investment for a **bug-free product and reducing technical debt**, so
>  I can only encourage you to join this collaboration. Our goal is to
>  build a fully-featured editor.

#### [Become a Sponsor!](https://github.com/sponsors/zbeyens)

### Contributors

🌟 Stars and 📥 Pull requests are welcome! Don't hesitate to **share
your plugins** here. Read our [contributing guide](CONTRIBUTING.md) to
get started, or find us on
[Slack](https://slate-js.slack.com/messages/plate), we will take
the time to guide you.

Thanks goes to these wonderful people
([emoji key](https://allcontributors.org/docs/en/emoji-key)):

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

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!

## License

[MIT](LICENSE)
