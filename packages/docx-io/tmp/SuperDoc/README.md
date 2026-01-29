<h1 align="center">
  <a href="https://www.superdoc.dev" target="_blank">
    <img alt="SuperDoc logo" src="https://storage.googleapis.com/public_statichosting/SuperDocHomepage/logo.webp" width="170px" height="auto" />
  </a>
  <BR />
  <a href="https://www.superdoc.dev" target="_blank">
    SuperDoc
  </a>
</h1>

<div align="center">
  <a href="https://www.superdoc.dev" target="_blank"><img src="https://img.shields.io/badge/Official%20Site-1355ff.svg" height="22px"></a>
  <a href="https://docs.superdoc.dev" target="_blank"><img src="https://img.shields.io/badge/docs-available-1355ff.svg" height="22px"></a>
  <a href="https://www.gnu.org/licenses/agpl-3.0" target="_blank"><img src="https://img.shields.io/badge/License-AGPL%20v3-1355ff.svg?color=1355ff" height="22px"></a>
  <a href="https://www.npmjs.com/package/@harbour-enterprises/superdoc" target="_blank"><img src="https://img.shields.io/npm/v/@harbour-enterprises/superdoc.svg?color=1355ff" height="22px"></a>
  <a href="https://www.discord.com/invite/b9UuaZRyaB" target="_blank"><img src="https://img.shields.io/badge/discord-join-1355ff" height="22px"></a>
</div>

<div>
  <BR />
  <strong>SuperDoc</strong> (<a href="https://www.superdoc.dev" target="_blank">online demo</a>) is an open source document editor bringing Microsoft Word capabilities to the web with real-time collaboration, extensive formatting options, and easy integration. Self-hostable with Vanilla JS, React, Vue, and more (<a href="https://github.com/Harbour-Enterprises/SuperDoc/tree/main/examples" target="_blank">code examples</a>).
  <BR />
</div>

## 🖼️ Screenshot

<div align="center">
  <a href="https://www.superdoc.dev" target="_blank">
    <img alt="SuperDoc editor screenshot" src="https://storage.googleapis.com/public_statichosting/SuperDocHomepage/screeenshot.png" width="600px" height="auto" />
  </a>
</div>

## ✨ Features

- **📝 Microsoft Word compatible**: View and edit DOCX documents with great import/export, advanced formatting, comments, and tracked changes
- **🛠️ Easy to integrate**: Open source, can be self-hosted, seamlessly integrates with React, Vue, vanilla JavaScript, and more
- **👥 Real-time collaboration**: Features multiplayer editing, live updates, commenting, sharing, and revision history
- **📐 Extensible architecture**: Modular design makes it easy to extend, brand, and customize
- **✅ Dual licensed**: Available under AGPLv3 for community use and Commercial license for enterprise deployments

## 💡 Quick start

### Installation

```bash
npm install @harbour-enterprises/superdoc
```

Or install with CDN

```html
<link rel="stylesheet" href="https://unpkg.com/@harbour-enterprises/superdoc/dist/style.css" />
<script type="module" src="https://unpkg.com/@harbour-enterprises/superdoc/dist/superdoc.umd.js"></script>
```

### Basic usage

```javascript
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

// For CDN use - `SuperDocLibrary.SuperDoc`
const superdoc = new SuperDoc({
  selector: '#superdoc',
  toolbar: '#superdoc-toolbar',
  document: '/sample.docx', // URL, File or document config
  documentMode: 'editing',
  pagination: true,
  rulers: true,
  onReady: (event) => {
    console.log('SuperDoc is ready', event);
  },
  onEditorCreate: (event) => {
    console.log('Editor is created', event);
  },
});
```

For a list of all available properties and events, see the documentation or refer to [SuperDoc.js](packages/superdoc/src/core/SuperDoc.js)

## 📖 Documentation

Visit our <a href="https://docs.superdoc.dev" target="_blank">documentation site</a> and <a href="https://github.com/Harbour-Enterprises/SuperDoc/tree/main/examples" target="_blank">code examples</a>. Key topics include:

- Installation
- Integration guides
- Collaboration setup
- Advanced customization
- Best practices

## 🎯️ Roadmap

We keep our big work-in-progress items here:

- Check out our [SuperDoc roadmap](https://github.com/Harbour-Enterprises/SuperDoc/wiki/%F0%9F%8E%AF%EF%B8%8F-SuperDoc-Roadmap)
- We prioritize the solving of big DOCX import/export/formatting needs

## 🤝 Contribute

We love contributions! Here's how you can help:

1. Check our [issue tracker](https://github.com/Harbour-Enterprises/SuperDoc/issues) for open issues
2. Fork the repository and create a feature/bugfix branch
3. Write clear, documented code following our style guidelines
4. Submit a PR with detailed description of your changes

See our [Contributing Guide](CONTRIBUTING.md) for more details.

## 💬 Community

- [Discord](https://discord.com/invite/b9UuaZRyaB) - Join our community chat
- [GitHub Discussions](https://github.com/Harbour-Enterprises/SuperDoc/discussions) - Ask questions and share ideas
- [Team email](mailto:q@superdoc.dev) - Get help from our team

## 📄 License

- Open Source: [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html)
- Commercial: [Enterprise License](https://www.harbourshare.com/get-in-touch)

## 🙌 Shout-outs

- Marijn Haverbeke and the community behind <a href="https://prosemirror.net" target="_blank">ProseMirror</a> - which we built on top of to make SuperDoc possible
- Tiptap and the <a href="https://github.com/JefMari/awesome-wysiwyg-editors" target="_blank">many amazing editors of the web</a> - from which we draw inspiration
- These wonderful projects that SuperDoc uses: <a href="https://github.com/yjs/yjs" target="_blank">Yjs</a>, <a href="https://fontawesome.com/" target="_blank">FontAwesome</a>, <a href="https://stuk.github.io/jszip/" target="_blank">JSZip</a>, and <a href="https://vite.dev" target="_blank">Vite</a>

## 📱 Contact

- [✉️ Email](mailto:q@superdoc.dev?subject=[SuperDoc]%20Project%20inquiry)
- [⛵️ Website](https://superdoc.dev)

---

Created and actively maintained by <a href="https://www.superdoc.dev" target="_blank">Harbour</a> and the SuperDoc community
