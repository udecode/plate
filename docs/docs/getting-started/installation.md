---
slug: /installation
title: Installation
---

Plate is essentially a set of npm packages that can be installed
over npm.

You can install all the packages bundled together:

```bash npm2yarn
npm install @udecode/plate

# required peer deps
npm install slate slate-react slate-history slate-hyperscript react react-dom styled-components
```

Alternatively you can install only the packages you need as listed in the following sections.

```bash npm2yarn
# core
npm install @udecode/plate-core

# required peer deps
npm install slate slate-react slate-history slate-hyperscript react react-dom

# plugins
npm install @udecode/plate-basic-elements
# npm install @udecode/plate-...

# if using @udecode/plate-serializer-docx
npm install @udecode/plate-juice

# if using @udecode/plate-ui
npm install styled-components

# if using @udecode/plate-ui-dnd
npm install react-dnd react-dnd-html5-backend
```