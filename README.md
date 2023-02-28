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

Udecode offers Plate consultancy services. If you're a company in need of a gig, please DM @zbeyens.

## Introduction

Plate is a plugin system for Slate and React to make it easier to build fully-featured editors. It handles things like node rendering, events handlers, serializing, and normalizing so you don't have to.

This repository comes with a lot of plugins, including elements, marks, serializers, normalizers, queries, transforms, and components.

Plate uses jotai for state management and is designed to support decoupled design systems. It comes with a default design system, but you can also plug in your own.

With more than 50 packages, `@udecode/plate` enforces separation of concerns for improved build optimization and versioning. It is also extensible, with all plugins accepting options and their functions being exported. Finally, it is tree-shakeable and comes with heavy TypeScript support.

## Motivation

Are you tired of struggling to build your own custom editor from scratch? Do you wish there was an easier way to take advantage of the powerful features of Slate without needing to be an expert in its low-level details? Look no further than Plate!

With Plate, building your own editor is as simple as using a single <Plate> component. But don't let its simplicity fool you - Plate is packed with powerful features to help you create the perfect editor for your needs. It uses Jotai for state management, and offers a default design system or the ability to plug in your own. Plus, with over 50 packages for individual features, you can easily customize and optimize your editor.

But that's not all - Plate also supports extensibility and comes with TypeScript support for even stronger type checking.

Don't spend any more time struggling to build your custom editor. Try Plate today and start building the perfect editor for your needs!

## Documentation

For more information on `@udecode/plate`, please refer to the following documentation sections:

- [API documentation](https://plate-api.udecode.io/globals.html)
- [Docs](https://plate.udecode.io)
  - [Quick start](https://plate.udecode.io/docs/installation)
  - [Guides](https://plate.udecode.io/docs/Plate)
  - [Playground](https://plate.udecode.io/docs/playground)
- [Examples](examples)
  - [NextJS](examples/apps/next)
  - [CRA](examples/apps/cra)

Note that the documentation is a work in progress and will be updated regularly as the project evolve.

## Contributing and project organization

### Ideas and discussions

[Discussions](https://github.com/udecode/plate/discussions) is the best
place for bringing opinions and contributions. Your feedback and contributions are welcome and will help us ensure that we are heading in the right direction with the project.

### Development

Plate is a modular, multi-package project that uses a monorepo structure. The core package provides the foundation for the plugin system, and the plugin packages are built on top of this.

If you are interested in contributing to the development of Plate, please refer to the [contributing guide](CONTRIBUTING.md) for information on how to submit your code to the project.

### Author's Note

> As the author of @udecode/plate, I understand the challenges of building an app with an editor. I spent months working on this project and realized that many other developers were facing the same difficulties. That's why I decided to open-source this work and invite others to collaborate.
> 
> Open-source is a long-term investment that can help us create a bug-free product and reduce technical debt. By working together, we can build a fully-featured editor that will benefit us all. I encourage you to join this collaboration and contribute to the project. Together, we can create something truly great.

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
