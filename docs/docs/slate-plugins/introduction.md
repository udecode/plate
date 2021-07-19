---
slug: /
title: Introduction
---

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