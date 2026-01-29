# 🦋️📝️ SuperDoc

> The modern collaborative document editor for the web

[![Documentation](https://img.shields.io/badge/docs-available-1355ff.svg)](https://docs.superdoc.dev/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-1355ff.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![npm version](https://img.shields.io/npm/v/@harbour-enterprises/superdoc.svg?color=1355ff)](https://www.npmjs.com/package/@harbour-enterprises/superdoc)
[![Discord](https://img.shields.io/badge/discord-join-1355ff)](https://discord.gg/FBeRDqWy)

SuperDoc is a powerful document editor that brings Microsoft Word-level capabilities to your web applications. With real-time collaboration, extensive formatting options, and seamless integration capabilities, SuperDoc makes document editing on the web better for everyone.

## ✨ Features

- **Document Compatibility**: View and edit DOCX and PDF documents directly in the browser
- **Microsoft Word Integration**: Full support for importing/exporting, advanced formatting, comments, and tracked changes
- **Real-time Collaboration**: Built-in multiplayer editing, live updates, commenting, sharing, and revision history
- **Framework Agnostic**: Seamlessly integrates with Vue, React, or vanilla JavaScript
- **Extensible Architecture**: Modular design makes it easy to extend and customize
- **Dual License**: Available under AGPLv3 for community use and Commercial license for enterprise deployments

## 🚀 Quick Start

### Installation

```bash
npm install @harbour-enterprises/superdoc
```

### Basic Usage

```javascript
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

const superdoc = new SuperDoc({
  selector: '#superdoc',
  documents: [
    {
      id: 'my-doc-id',
      type: 'docx',
      data: fileObject, // Optional: JS File object if not using collaboration
    },
  ],
});
```

## 🛠️ Development Setup

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/SuperDoc.git
cd SuperDoc
```

2. **Choose Your Package**

SuperDoc consists of two main packages:

- **/packages/superdoc**: Main package (recommended)

  ```bash
  cd packages/superdoc
  npm install && npm run dev
  ```

- **/packages/super-editor**: Core editor component
  ```bash
  cd packages/super-editor
  npm install && npm run dev
  ```

## 📖 Documentation

For comprehensive documentation, visit our [SuperDocumentation](https://docs.superdoc.dev) site. Key topics include:

- Complete API reference
- Integration guides
- Collaboration setup
- Advanced customization
- Best practices

## 🤝 Contributing

We love contributions! Here's how you can help:

1. Check our [issue tracker](https://github.com/Harbour-Enterprises/SuperDoc/issues) for open issues
2. Fork the repository and create a feature/bugfix branch
3. Write clear, documented code following our style guidelines
4. Submit a PR with detailed description of your changes

See our [Contributing Guide](CONTRIBUTING.md) for more details.

## 💬 Community

- [Discord Server](https://discord.gg/FBeRDqWy) - Join our community chat
- [GitHub Discussions](https://github.com/Harbour-Enterprises/SuperDoc/discussions) - Ask questions and share ideas
- [Email Support](mailto:support@harbourshare.com) - Get help from our team

## 📄 License

- Open Source: [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html)
- Commercial: [Enterprise License](https://www.harbourshare.com/request-a-demo)

## 📱 Contact

- [✉️ Email](mailto:support@harbourshare.com?subject=[SuperDoc]%20Project%20inquiry)
- [🔗 LinkedIn](https://www.linkedin.com/company/harbourshare/)
- [⛵️ Website](https://superdoc.dev)

---

Created and actively maintained by [Harbour](https://www.harbourshare.com) and the SuperDoc community.
