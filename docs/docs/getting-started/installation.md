---
slug: /installation
title: Installation
---

Plate is essentially a set of npm packages that can be installed
over npm.

You can install all the packages bundled together:

```bash npm2yarn
npm install @udecode/plate
```

You will also need these peer dependencies:

```bash npm2yarn
npm install slate slate-react slate-history slate-hyperscript react react-dom styled-components

# if using @udecode/plate-ui-dnd
npm install react-dnd react-dnd-html5-backend
```

Alternatively you can install only the packages you need as listed in the following sections.

Additional packages:

```bash npm2yarn
# if using @udecode/plate-serializer-docx
npm install @udecode/plate-juice

# Excalidraw
npm install @udecode/plate-ui-excalidraw
```