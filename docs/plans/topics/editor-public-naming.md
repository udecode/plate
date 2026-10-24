# Editor naming

Page: https://claude.ai/artifact/5zNGoEU2E4rS7KwSMUoLDm

Should editor exports and DOM contracts use neutral names across Plate and its runtime, and which public nouns should disappear instead of being renamed? The 2026-09-12 adoption made every exported name neutral, moved the DOM to one `data-editor-*` vocabulary and gave the clipboard and authored codecs neutral wire names with no old readers (`docs/plans/2026-09-12-editor-public-naming-adoption.md`). The 2026-09-13 closure audit added the `editorSelection` proof field, `__EDITOR_*` browser globals, clean public JSDoc and Plate declarations with no `plitejs` reference, and the 2026-10-05 Vision rewrite removed the deleted nouns from root `VISION.md`. The 2026-10-12 build made the values users can observe neutral too: stored keys and formats, protocol keys, default ids, messages and copied registry UI values, and `plate/no-branded-value` stops new branded values (`docs/plans/2026-10-12-editor-public-naming-review.md`). Package names and import paths are not part of the question.

## Public API

A test or development entry attaches the browser handle once, from `content/docs/(guides)/browser.mdx`.

```ts
// content/docs/(guides)/browser.mdx
import { installBrowserHandle } from "platejs/react";

installBrowserHandle();
```

Browser tests import the handle's key from `@platejs/test/playwright`, and the clipboard helper pastes the editor fragment under `fragment`, from `apps/www/tests/browser/document-migration.spec.ts` and `packages/test/src/playwright/clipboard.ts`.

```ts
// apps/www/tests/browser/document-migration.spec.ts
import { BROWSER_HANDLE_KEY } from '@platejs/test/playwright';

editor.evaluate((element, [value, key]) => {
  (element as HTMLElement & Record<string, Handle>)[key]
    .insertTextAt(value, { offset: 0, path: [0, 0] }, { tags: ['document-migration-proof'] });
}, [text, BROWSER_HANDLE_KEY] as const);
// packages/test/src/playwright/clipboard.ts
handle.insertData({ html, fragment: nextPayload.fragment ?? undefined, text });
```

Saved comments carry a neutral kind, from `content/docs/(plugins)/(collaboration)/comment.mdx`.

```ts
// content/docs/(plugins)/(collaboration)/comment.mdx
const initialComments: CommentsJSON = { kind: "comments", version: 1, threads, ranges };
```

An editor created without an id gets `editor-N`, from `content/docs/api/core/plate-controller.mdx`.

```tsx
// content/docs/api/core/plate-controller.mdx
<p>Active editor: {editor.id}</p> // "Active editor: editor-1"
```

Error messages name neither the engine nor deleted hooks, from `packages/plitejs/src/core/initial-value.ts` and `packages/plitejs/src/react/hooks/use-plite-history.ts`.

```ts
// packages/plitejs/src/core/initial-value.ts and packages/plitejs/src/react/hooks/use-plite-history.ts
"initialValue is invalid! Expected an object."
"useEditorHistory requires an editor or an EditorRoot."
```

Tests select the editable by its textbox role, from `packages/test/test/react/PlateTest.test.tsx`; the harness finds the editable it rendered through a ref.

```ts
// packages/test/test/react/PlateTest.test.tsx
expect(rendered.getByRole("textbox")).toHaveTextContent("one");
```

A test can give the editable its own test id and ref through the helper's editable props.

```ts
// packages/test/test/react/createTestEditor.test.tsx
const result = await createTestEditor(
  { initialValue: [paragraph('one')] },
  {
    componentProps: {
      editableProps: { 'data-testid': 'caller', ref: callerRef },
    },
  }
);
```

## What other editors do

The 2026-10-12 review read each editor's source at the commits in its front matter and ran none of them. Every editor that brands an observable value uses its own public product name, none names a hidden internal layer, and both Yjs bindings store neutral keys.

| Editor | DOM keys and attributes | Clipboard format | Collaborative document keys |
| --- | --- | --- | --- |
| Lexical | `__lexicalEditor`, `data-lexical-editor` | `application/x-lexical-editor` | neutral `__type` (`facebook/lexical@dd5c41b131:packages/lexical-yjs/src/Utils.ts`) |
| Slate | `data-slate-node`, `data-slate-editor` | `x-slate-fragment`, configurable | no first-party binding |
| ProseMirror | `pmViewDesc`, `data-pm-slice`, `ProseMirror-*` classes | `data-pm-slice` on HTML | y-prosemirror stores the node type name with no prefix |
| BlockNote | neutral `data-content-type`, `data-node-type`; `bn-editor` class | `blocknote/html` | through y-prosemirror |
| Tiptap | `data-tiptap-style` | through ProseMirror | through y-prosemirror |

## Document shape

Apps that save comments read and write this JSON.

```json
{ "kind": "comments", "version": 1, "threads": [], "ranges": [] }
```

Every peer and every Hocuspocus store reads these `Y.XmlElement` attributes. The block type is an ordinary attribute, every element's `nodeName` is `element`, and the binding reserves the whole `yjs:` family.

```json
{ "nodeName": "element", "type": "heading-one", "yjs:id": "k3f9a-12", "align": "center" }
```

A document bound without a `rootName` lives under `document`, and its schema envelope is format 3. Before import, a new editor scans every top-level schema envelope in the document and refuses one of any other format, writing nothing.

```json
{ "document": "<Y.XmlElement>", "document:roots": "<Y.Map>", "document:schema": { "current": { "format": 3, "identity": "<schema identity>" } }, "document:shared-effect-events": "<Y.Array>", "document:shared-effect-acks": "<Y.Map>", "document:shared-effect-checkpoint": "<Y.Map>", "document:shared-effect-retired-peers": "<Y.Map>" }
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Browser handle key | Plite | `plitejs` root partition (`src/internal/browser-protocol.ts`), exported from `plitejs/testing`, re-exported by `platejs/testing`, imported by relative path from scripts outside the workspace; `@platejs/test/playwright` keeps a copy that a test pins to it | The producer owns the protocol; Playwright here cannot load plitejs source, so browser tests read the harness copy |
| Yjs keys, `type` as an ordinary attribute, node ids, default root name, envelope format and the admission preflight | Plite | `plitejs/yjs` (`yjs/core/keys.ts`, `yjs/core/schema-metadata.ts`, `yjs/core/controller.ts`, `yjs/core/plugin.ts`) | One module owns every stored key and the default root; the bridge derives its list; the envelope owns the format, and admission refuses a foreign format before import |
| Global symbol keys and type-only witnesses | Plite | `plitejs` root `core/tx-only.ts`; `plitejs/react` `react/dom-text-sync.ts` | Each owner defines its key once; specs test behavior through the public setters instead of spelling the key |
| React component names | Plite | `plitejs/react` and `plitejs/pagination` | React prints component names in its console messages |
| Donor Hocuspocus server and raw example root | Tooling | `tooling/plite/donor/yjs/hocuspocus-server.ts`; `apps/www/src/app/(app)/examples/plite/_examples/yjs-hocuspocus.tsx` | Repo tooling stores snapshots only; the raw example uses the default root |
| Comments `kind` | Plate | `platejs/comments` | The comments codec owns its envelope |
| Default editor id, read ids, effect ids, decoration ids, hoisted styles, messages | Plite | `plitejs` root, `plitejs/react`, `plitejs/dom`, `plitejs/pagination` | Each producer renames its own value |
| Runtime plugin names, schema group, format keys, CSS variable, DOCX ids, messages | Plate | `platejs` root, `platejs/react`, `platejs/docx` | Each producer renames its own value |
| `failInvariant` | Plite and Plate | `plitejs` root `internal/fail-invariant.ts`; `platejs` root `internal/failInvariant.ts` | One implementation per package instead of eleven copies; callers import their package's root copy and the forwarding files go |
| `DOMResolutionError.code` | Plite | `plitejs/dom` (`dom/plugin/dom-editor.ts`) | Deleted: nothing in the repository or the docs reads it |
| Test defaults, timeout setting, page keys | Plate | `@platejs/test` | The test package owns its harness |
| Copied UI values: emoji storage keys, download names, demo room, demo comments; the unused `prism.css` | Plate | `apps/www/src/registry`; `apps/www/public` | The registry owns the copied UI |
| The guard | Tooling | `tooling/oxlint/plate-plugin.mjs`, `oxlint.config.ts` | The repository's `plate/*` lint law owns static checks |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Plate-only neutral re-export aliases | Two public vocabularies and recurring facade and declaration reconciliation; the shared source is renamed instead. |
| Replacing every brand prefix with `Editor` | Keeps public internals and hides provider, model and view collisions; ordinary domain nouns such as `Selection`, `NodeKey` and `definePlugin` state the job. |
| Keeping `<Plate>` and `<Plite>` as root components | The import already names the product; `EditorRoot` states the role. |
| `Editor`, `EditorProvider`, `EditableRoot` or `EditableContent` for the root and content | `Editor` collides with the model type and the copied composition; `EditorProvider` is the passive scope that creates no view; `Editable*` adds an editability term the read-only surface does not have. |
| A configurable attribute prefix, dual emission or a DOM registry | Coordination and runtime work for a naming problem. |
| Private bindings in place of every DOM attribute | External controls, styles, DOM repair and clipboard HTML read the literal hooks. |
| Treating every `data-editor-*` mutation as runtime-owned | Would classify application attributes as repair work; the DOM owner keeps its exact private list, and resolution still checks the registered mount. |
| Readers for the old branded clipboard, authored, mention and media formats | Not a supported input domain; a fallback would be a second dialect. |

## Hard cuts and app migration

Each cut has no alias and no old reader. `pstack:blast-radius` runs before the first edit and adds any caller this list misses.

- Browser tests that read the browser handle import `BROWSER_HANDLE_KEY` from `@platejs/test/playwright`, and package tests import it from `platejs/testing`, as Public API shows; the element key is now `__EDITOR_BROWSER_HANDLE__`, and `insertData` takes `fragment`. Scripts outside the pnpm workspace, such as `benchmarks/editor` and `tooling/scripts/*.mjs`, import it from `packages/plitejs/src/internal/browser-protocol.ts` by relative path.
- Saved comments use `kind: 'comments'`, and `decodeComments` refuses a blob saved as `'plate-comments'` like any foreign blob.
- A new editor refuses a collaborative document written by the envelope binding before the cut, whatever root name it was written under, because admission scans every top-level schema envelope and refuses any that is not format 3. It writes nothing to the refused document. Documents from before the envelope existed (2026-07-22), such as the 53.x `content` layout of `@platejs/yjs`, carry no envelope; they behave as they do at the review commit, and Open work tracks them. Nothing reads the old format. Without the refusal, an old document would read with no element types, show nodes a move had hidden, and hand the old internal keys to the app as props, and an old default room would look empty and get a second tree.
- An editor from before the cut refuses a new document only when both bind the same root name. Nothing makes old code look under the new default root, so anyone running unreleased `next` collaboration moves to new rooms and keeps old clients out of them. Release notes measure from the June beta, which wrote no such rooms, so this plan and its subject page carry that instruction. The registry collaboration demo moves from `plate-collaboration-demo` to `collaboration-demo`, and the raw Plite Hocuspocus example drops its `rootName: 'plitejs'` override and moves to a new default room.
- The donor Hocuspocus server loses `PLITE_YJS_ROOT_NAME` and its JSON debug export, which nothing sets, so it stores snapshots without reading any root.
- An app field whose name starts with `yjs:` is now refused, and one starting with `plite:yjs-set:` is now accepted, because the binding reserves the whole `yjs:` family. No app in the repository uses such a field.
- `DOMResolutionError` loses its `code` field. Nothing in the repository or the docs reads it; all eight values start with `plitejs/dom/`, and three also end in `plite-node`, `plite-point` or `plite-range`.
- Global symbol keys lose the `plitejs.` name. `Symbol.for` keys take job names such as `editor-runtime.tx-only-methods`, so duplicate package copies still share them.
- About 11 Plite React components, such as `PliteVoidShell` and `PliteRuntimeProvider`, take neutral names, because React prints component names in console messages. Hooks keep their names.
- `createPlateTestEditor` loses its `testID` option, and `PlateTest` no longer marks its editable with a default test id; the harness finds the editable it rendered through a ref. Tests select the editable by role, as Public API shows, and a caller's own `data-testid` or `ref` in `editableProps` reaches the editable.
- `PLITE_BROWSER_CLIPBOARD_LOCK_TIMEOUT_MS` is gone; the lock waits 30 seconds.
- The navigation feedback CSS variable is `--editor-nav-feedback-duration`. The old name shipped in `@platejs/core` 53.x, so the changeset lists it as breaking. The duplicate-copy counter stays `__PLATE_INSTANCES__`, because 53.x `@platejs/core` writes the same global and a second name would hide a mixed install.
- Copied UI made from the registry after the cut stores emoji picks under `emoji-frequent:v1` and `emoji-shortcodes:v1:`, and exports `document.html`, `document.md` and `document.docx`. Apps that copied the old components keep their own copies. The www app's unused Prism stylesheet, which nothing loads, goes.
- Code that matched error text containing Plite or `[Plite]` matches the new text; `@platejs/test`'s recorder keeps the three message prefixes, and a test feeds plitejs's real errors through it.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Paste through the browser handle | The `insertData` field name | A new `@platejs/test` case on the `'handle'` clipboard transport, with a real editor and handle mounted in happy-dom, whose fragment gives a different document than its HTML and text; the transport calls the handle directly, and the native transport never calls `insertData` |
| Runtime error recording | The DOM resolution messages and the patterns that record them | A new case that feeds real `DOMEditor` resolution errors through the default recorder and checks that an unrelated console error is not recorded |
| IME helper | Reads the imported key instead of a literal | The managed Chromium run of a spec that uses `ime.ts` |
| Collaboration after a type change and a split | The stored type survives the clone | The new `split-node-contract.spec.ts` case, a fresh peer seeded from the Y.Doc |
| Joining a room saved before the cut | The editor refuses it before import, under the default or an explicit root, and writes nothing | Two cases on Y.Doc updates captured at the review commit, each comparing the full encoded document and the emitted updates across the bind, with a deletion control; a managed run of the raw Hocuspocus example |

Selection, focus and undo do not change.

## Main changes

- One plitejs leaf owns the browser handle key. `@platejs/test` keeps one copy of the key and of the three DOM resolution message prefixes, and two tests fail when either drifts from plitejs.
- `yjs/core/keys.ts` owns every key the binding stores, the reserved `yjs:` family and the default root; `event-change-bridge.ts` derives its projection list from it, one predicate replaces `INTERNAL_YJS_ATTRIBUTE_SET`, and `type` loses its special case.
- The Yjs schema envelope's format moves to 3, and admission scans every top-level schema envelope before it waits for a seed, seeds, imports or activates the shared-effect log.
- `failInvariant` has one implementation per package: each package's root copy, which every caller imports directly.
- Each global symbol key has one owner, and no spec spells it.
- `plate/no-branded-value` joins the `plate/*` lint rules.
- `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` owns the saved comments shape and its validator.
- `packages/plitejs/src/create-editor.ts` allocates the default editor id.
- `createTestEditor` finds its editable through the ref that `EditorContent` passes to the editable element, composed with any `editableProps.ref`, instead of querying the whole document for a test id. `EditorTestProps.editableProps` accepts `data-*` keys.

## Open work

- Shared documents written before the Yjs envelope existed (2026-07-22), such as the 53.x `content` layout of `@platejs/yjs`, carry no envelope, so a v54 editor bound under its default root finds its own root empty and can seed beside them. Plate law requires a reader for that shipped format, which is a separate plan. owner: zbeyens. stop: a plan for opening 53.x Yjs rooms in v54 is written, or the owner accepts the gap.
- Four task chips from the 2026-10-12 build wait for the owner: "Let @platejs/test import plitejs's handle key", "Remove the any erasure in useRuntime view registration", "Fix readEditorSchemaContract rejecting the www schema" and "Fix external-text browser spec that cannot load". owner: zbeyens. stop: each chip's session lands its fix, or the owner dismisses the chip.
- The 2026-10-06 knowledge plan's compile readers found 1 problem in refactoring: code comments keep stale Plite names, and one clipboard format key is defined three times. Each is an open `finding` row in that plan's decision log, and phase 4's side findings in the same area join them; a claim marked inferred or "not run" needs its probe before a fix. owner: Ziad. stop: fixed by the Refactoring playbook or dropped, or 2026-12-07. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
