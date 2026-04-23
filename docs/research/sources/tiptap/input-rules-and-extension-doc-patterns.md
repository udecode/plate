---
title: Tiptap input-rules and extension doc patterns
type: source
status: partial
updated: 2026-04-15
source_refs:
  - /Users/zbeyens/git/tiptap-docs/src/content/editor/api/input-rules.mdx
  - /Users/zbeyens/git/tiptap-docs/src/content/editor/api/editor.mdx
  - /Users/zbeyens/git/tiptap-docs/src/content/editor/extensions/custom-extensions/create-new/extension.mdx
  - https://tiptap.dev/docs/editor/api/input-rules
related:
  - docs/research/systems/plugin-input-rule-doc-pattern-landscape.md
---

# Tiptap input-rules and extension doc patterns

## Purpose

This page compiles how Tiptap documents input rules and the nearby extension
authoring surface.

## Strongest explicit signals

- Tiptap has a dedicated public page for `Input Rules`.
- The extension authoring guide links back to that dedicated page from
  `addInputRules`.
- The editor config docs expose rule activation as a top-level editor concern
  with `enableInputRules`.

## Documentation pattern

- **Concept page first**: `Input Rules` gets its own page with a plain-language
  opening, a short “what it is” section, and helper-level examples.
- **Authoring page second**: the custom extension guide explains where
  `addInputRules()` lives and links outward instead of duplicating the whole
  explanation.
- **Activation page third**: editor config docs explain how to enable or narrow
  input rules globally.

## Plate-relevant takeaways

- A dedicated runtime page is worth it when the concept shows up across many
  packages.
- The runtime page should explain the mental model before the API reference.
- Package or extension guides should link back to the runtime page instead of
  restating it in full.
- A good doc system shows both:
  - how the runtime works
  - where feature authors hook into it

## What Tiptap does especially well

- Gives input rules a clear name and dedicated entrypoint.
- Shows helpers early (`markInputRule`, `nodeInputRule`), but not before the
  basic mental model.
- Cross-links the extension guide and the editor config docs back into the same
  concept lane.

## What Tiptap does less well for Plate's needs

- The examples are regex-heavy very early.
- The page is extension-centric and does not need to explain package ownership
  splits the way Plate does.
- Tiptap’s activation story is editor-wide; Plate’s story is explicit
  rule-instance registration on plugins and kits.

## High-value pages

- `src/content/editor/api/input-rules.mdx`
- `src/content/editor/extensions/custom-extensions/create-new/extension.mdx`
- `src/content/editor/api/editor.mdx`

## What this source cluster is good for

Use it when deciding:

- how much standalone importance the Input Rules guide deserves
- where to put mental model vs helper details
- how to cross-link package docs back to one canonical runtime page
