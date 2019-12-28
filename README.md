# slate-plugins-next

Built on top of [Slate](https://github.com/ianstormtaylor/slate) framework, `slate-plugins-next` enables you to use a list of
customizable plugins for your Slate editor.

[Try out the existing ones](https://slate-plugins-next.netlify.com/?path=/docs/plugins-playground--plugins) and [create your own plugins](https://slate-plugins-next.netlify.com/?path=/docs/docs-guide--page)!

## 🚀 Included

- ✨ 20+ Editor Plugins
- 🏷️ Separation of Concerns
- 🎌 Supports the latest version of `slate@0.57.1`
- 📖 [Docs](https://slate-plugins-next.netlify.com/?path=/docs/docs-getting-started--page) and [Demos](https://slate-plugins-next.netlify.com/?path=/docs/plugins-playground--plugins) on Storybook

## 🧩 Plugins

A list of provided plugins extracted from [official examples](https://www.slatejs.org/examples/richtext).

### Elements

<img src="https://i.imgur.com/EFORuVT.png" alt="blocks" width="500"/>

A plugin for each type of element. All of these
use `renderElement`.

- Action Item
- Blockquote
- Code
- Heading
- Image
- Link
- List
- Mention
- Paragraph
- Table
- Video

### Marks

<img src="https://i.imgur.com/AVTAUqJ.png" alt="marks" width="400"/>

A plugin for each type of leaf. All of these
use `renderLeaf`.

- Bold
- Highlight
- Inline code
- Italic
- Strikethrough
- Underline

### Utilities

- Forced Layout
- Markdown Preview
- Markdown Shortcuts
- Paste Html
- Search Highlight
- Toolbar
- Common
- Slate Plugins

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

For simplicity, a single package `slate-plugins-next` has been published to share all the plugins.
It's not a problem as it is [tree-shakeable](https://bundlephobia.com/result?p=slate-plugins-next). However, a few plugins use external dependencies.
These should be moved into their own package.

## License

[MIT](LICENSE)
