# slate-plugins-next

Built on top of Slate framework, `slate-plugins-next` enables you to use a list of
customizable plugins for your Slate editor.
Pick existing ones and create your own plugins!

## 🚀 Features

- 20+ Editor Plugins
- Supports the latest version of Slate (0.57.1)
- Plugins designed to follow the separation of concerns principle

## 🧩 Plugins

A list of provided plugins extracted from [official examples](https://www.slatejs.org/examples/richtext).

### Root

- provides the interface of a plugin: `SlatePlugin`

### Elements

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

A plugin for each type of leaf. All of these
use `renderLeaf`.

- Bold
- Highlight
- Inline code
- Italic
- Strikethrough
- Underline

### Misc

- Forced Layout
- Markdown Preview
- Markdown Shortcuts
- Paste Html
- Search Highlight
- Toolbar

### common

This includes common components usable by any other plugins.

- components

###

- Hot Keys, support list
- Full Screen Edit mode
- Serialize and Deserialize into HTML
- 🧩 Independent Plugins Copy and Paste HTML in Editor
- Support Toolbar
- Support Sidebar
- 📖 Demos on Storybook 5

WrapperPlugins support for slate@0.57.1

## 👏 Contributing

We welcome contributions to this repository!

📥 Pull requests and 🌟 Stars are always welcome.

### Development scripts

Useful scripts include:

#### `yarn`

> Installs package dependencies

#### `yarn lint`

> boolean check if code conforms to linting eslint rules

#### `yarn release`

> Push a release to git and npm will ask for version in interactive mode - using lerna.

## License

[MIT](LICENSE)
