---
title: Plugin input rule doc pattern landscape
type: system
status: partial
updated: 2026-04-15
related:
  - docs/research/sources/tiptap/input-rules-and-extension-doc-patterns.md
  - docs/research/sources/prosemirror/guide-reference-and-example-doc-patterns.md
  - docs/research/sources/lexical/markdown-package-and-shortcuts-doc-patterns.md
  - docs/research/sources/slate/walkthrough-concepts-and-api-doc-patterns.md
  - docs/research/decisions/plugin-input-rules-guide-should-lead-with-runtime-first-then-feature-owners-then-api-reference.md
---

# Plugin input rule doc pattern landscape

## Purpose

This page maps the strongest documentation patterns for a Plate guide about the
input-rules runtime.

## Corpus scope

- Tiptap
- ProseMirror
- Lexical
- Slate

## Per-corpus evidence ledger

### Tiptap

- compiled pages inspected: none before this pass
- raw paths inspected:
  - `/Users/zbeyens/git/tiptap-docs/src/content/editor/api/input-rules.mdx`
  - `/Users/zbeyens/git/tiptap-docs/src/content/editor/api/editor.mdx`
  - `/Users/zbeyens/git/tiptap-docs/src/content/editor/extensions/custom-extensions/create-new/extension.mdx`
- direct raw files actually read: the three paths above
- official source entrypoints checked:
  - `https://tiptap.dev/docs/editor/api/input-rules`
- strongest evidence found:
  - dedicated Input Rules page
  - custom extension page linking back to it
  - editor config page exposing activation controls
- disposition: evidenced
- next action if unresolved:
  - mirror the docs repo into `../raw` later if this corpus becomes recurring

### ProseMirror

- compiled pages inspected: none before this pass
- raw paths inspected:
  - `/Users/zbeyens/git/prosemirror/README.md`
- direct raw files actually read:
  - `/Users/zbeyens/git/prosemirror/README.md`
- official source entrypoints checked:
  - `https://prosemirror.net/docs/guide/`
  - `https://prosemirror.net/docs/ref/#inputrules.InputRule`
  - `https://prosemirror.net/examples/markdown/`
- strongest evidence found:
  - clear guide/reference/example split
  - `InputRule` documented in the reference layer
- disposition: evidenced
- next action if unresolved:
  - mirror the relevant docs pages into a raw family if Plate starts citing
    ProseMirror often in future doc work

### Lexical

- compiled pages inspected: none before this pass
- raw paths inspected:
  - `/Users/zbeyens/git/lexical/README.md`
  - `/Users/zbeyens/git/lexical/packages/lexical-markdown/README.md`
  - `/Users/zbeyens/git/lexical/packages/lexical-markdown/src/MarkdownTransformers.ts`
- direct raw files actually read: the three paths above
- official source entrypoints checked:
  - `https://lexical.dev/docs/intro`
  - `https://lexical.dev/docs/packages/lexical-markdown`
- strongest evidence found:
  - package-oriented docs
  - separate React plugin vs manual registration examples
  - explicit transformer-family inventory
- disposition: evidenced
- next action if unresolved:
  - mirror the package docs into `../raw` if Lexical becomes a recurring doc IA
    comparison lane

### Slate

- compiled pages inspected: none before this pass
- raw paths inspected:
  - `/Users/zbeyens/git/slate/docs/Introduction.md`
  - `/Users/zbeyens/git/slate/docs/Summary.md`
  - `/Users/zbeyens/git/slate/docs/walkthroughs/05-executing-commands.md`
  - `/Users/zbeyens/git/slate/docs/api/transforms.md`
- direct raw files actually read: the four paths above
- official source entrypoints checked:
  - `https://docs.slatejs.org/`
  - `https://docs.slatejs.org/walkthroughs/01-installing-slate`
- strongest evidence found:
  - clear walkthrough / concepts / API split
  - strong narrative explanation before exact API reference
- disposition: evidenced
- next action if unresolved:
  - no immediate gap for this question

## Strongest cross-corpus patterns

### 1. The best docs give the concept its own page

Tiptap is strongest here. Input rules get their own dedicated page instead of
being buried entirely inside extension docs.

### 2. The best docs separate tutorial flow from reference detail

Slate and ProseMirror both help here for different reasons:

- Slate shows the progressive teaching flow
- ProseMirror shows the clean reference split

### 3. The best docs keep package wiring visible

Lexical is strongest here. It is good at saying:

- here is the package
- here is the React shortcut
- here is the lower-level manual registration path

### 4. Cross-linking beats duplication

Tiptap is best at this in the relevant slice. The custom extension docs link
back to the dedicated Input Rules page instead of carrying the whole concept
themselves.

## Best mix for Plate

### Keep from Tiptap

- dedicated concept page for the runtime
- explicit cross-links from package/authoring docs back to that page
- small helper-level examples near the top

### Keep from Slate

- progressive guide structure
- mental model first
- examples before exact API detail

### Keep from Lexical

- quick-path vs manual-path split
- crisp inventory of built-in rule families / lanes

### Keep from ProseMirror

- reference-like exactness in the final API section
- clean separation between tutorial text and primitive definitions

## Plate-specific consequences

- the new page should be a **guide** first and a **reference** second
- it should have one canonical home instead of leaking across feature pages
- feature pages should link back to it rather than carrying duplicate runtime
  explanations
- the final `## API Reference` should be much more precise than the opening
  tutorial sections

## What this system page is good for

Use it when deciding:

- the information architecture of the new Plugin Input Rules guide
- how much prose vs reference detail to front-load
- how to cross-link package pages and guide pages without duplication
