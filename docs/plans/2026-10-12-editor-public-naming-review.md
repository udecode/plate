---
review_scopes: [editor-public-naming]
verdict: pursue
review_basis: [2026-10-04-editor-public-naming-audit]
work_kind: implementation
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [docs/research/decisions/editor-public-naming.md, docs/research/review-records/2026-10-04-editor-public-naming-audit.json, docs/research/review-records/2026-09-13-editor-public-naming-closure-audit.json, docs/plans/2026-10-04-ledger-triage-audit.md, docs/plans/2026-09-12-editor-public-naming-adoption.md, VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, packages/plitejs/src/react/editable/browser-handle.ts, packages/plitejs/src/react/index.ts, packages/plitejs/src/create-editor.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/core/initial-value.ts, packages/plitejs/src/dom/plugin/data-transfer-format.ts, packages/plitejs/src/react/hooks/use-plite-history.ts, packages/plitejs/src/react/hooks/use-plite-child-root.ts, packages/plitejs/src/react/hooks/use-editor-context.tsx, packages/plitejs/src/yjs/core/attributes.ts, packages/plitejs/src/yjs/core/document.ts, packages/plitejs/src/yjs/core/set-valued-attributes.ts, packages/plitejs/src/yjs/core/editor-adapter.ts, packages/platejs/src/features/comments/BaseCommentsPlugin.ts, packages/platejs/src/internal/plugin/compilePlateFormats.ts, packages/platejs/src/internal/failInvariant.ts, packages/test/package.json, packages/test/src/index.ts, packages/test/src/playwright/constants.ts, packages/test/src/playwright/clipboard.ts, packages/test/src/playwright/dom-locators.ts, packages/test/src/react/PlateTest.tsx, packages/test/src/react/createPlateTestEditor.ts, content/docs/(guides)/browser.mdx, content/docs/(plugins)/(collaboration)/comment.mdx, content/docs/api/core/plate-controller.mdx, packages/plitejs/src/react/hooks/use-plite-runtime.tsx, packages/platejs/src/ai/internal/failInvariant.ts, apps/www/tests/browser/excalidraw.spec.ts, packages/platejs/src/features/code-block/internal/failInvariant.ts, apps/www/src/registry/components/editor/import-toolbar-button.tsx, packages/plitejs/src/react/editable/external-text-binding.ts, packages/platejs/src/markdown/internal/failInvariant.ts, apps/www/tests/browser/media-caption.spec.ts, packages/plitejs/src/pagination/react.tsx, apps/www/tests/browser/document-migration.spec.ts, apps/plite/src/app/mobile-lab/client.tsx, packages/plitejs/src/react/components/editable-element-placement.tsx, packages/platejs/src/features/basic-styles/internal/failInvariant.ts, packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts, apps/www/tests/browser/suggestion.spec.ts, packages/platejs/src/features/table/internal/failInvariant.ts, apps/www/tests/browser/files-sdk.spec.ts]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../blocknote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7']
---

# Editor naming: values users see

Status: executed: built and left uncommitted on next for the owner to commit
Topic: editor-public-naming
Playbook: plan

**Pursue, superseding `2026-10-04-editor-public-naming-audit`.** No saved format with these names has shipped, so renaming them now needs no code that reads the old names. After the first real release, Plate law keeps such a reader for every supported saved format. The 54 betas of `platejs` and `@platejs/*` date from 2026-06-16 and 2026-06-17, before the Yjs keys (2026-06-24) and the comments label (2026-09-18). The 53.x line is published from `main`. `plitejs@0.0.1` is a 2.5 KB name reservation, and `@platejs/test` returns 404. Two values did ship in `@platejs/core` 53.x and the 54 betas, the navigation feedback CSS variable and `__PLATE_INSTANCES__` (a plan panel seat grepped the published tarballs), so their renames are breaking changes for 53.x users. The 2026-10-04 target named five values. The live census finds the largest permanent one it missed: the Yjs binding writes `plite:type`, `plite:yjs-id` and four more `plite:` keys into every collaborative document, under a root named `plitejs` unless the app names one. Error text is a second miss. 79 plitejs string literals name Plite, most of them errors a Plate user can hit, and some name hooks that no longer exist, such as `usePliteHistory`. A new branded value landed after the 10-04 Pursue (`precedence="plite"`, 2026-10-08), so the guard stays part of the target. This is the unit `review-ledger.mjs next` returned; it depends on no other scope. The 2026-10-05 Vision rewrite already removed the deleted nouns the 10-04 review found in root `VISION.md`. The Build playbook runs this plan.

## Brief

### What will change?

Saved comments, shared documents, test helpers, default ids and error messages no longer say Plite or Plate, and a lint rule blocks new ones. Shared documents also keep a block's changed type, and it all sits uncommitted on next.

### What could go wrong?

Old demo comments and old shared rooms stop loading, so demos need new rooms. Tests that give the editor their own test id break the test helper, and a Yjs upgrade means rechecking how old rooms get refused.

## Teach

Plate is the product people install. Plite is the engine inside it, and Plate's docs never mention it, so users never need its name.

Two earlier passes renamed every export and every DOM attribute. Those passes skipped text values. Comments saved by an app carry a Plate-branded label. Every collaborative document stores Plite-branded keys. The handle tests use to drive the editor, the default editor id and many error messages say Plite too, and some messages name hooks that were renamed months ago.

The fix gives each value a neutral name, or deletes it when nothing uses it. No saved format has shipped yet, so no saved data needs a converter. A new lint rule fails when a brand name shows up in shipped text, because new ones kept sneaking in. Renaming the shared document keys also fixes a bug. A block whose type changed went back to its old type in the saved copy after someone split it.

## Public API

Tests reach the browser handle through a branded element key that each reader spells by hand, and paste through a branded field. After the cut, plitejs owns the key and exports it from `plitejs/testing`, which `platejs/testing` re-exports. Browser tests import it from `@platejs/test/playwright` and pass it into the page. That package keeps its own copy because Playwright loads it from source here and cannot compile plitejs, and a test fails when the copy and plitejs's key differ.

```ts before
// apps/www/tests/browser/document-migration.spec.ts
editor.evaluate((element, value) => {
  (element as HTMLElement & { __pliteBrowserHandle: Handle })
    .__pliteBrowserHandle.insertTextAt(value, { offset: 0, path: [0, 0] }, { tags: ['document-migration-proof'] });
}, text);
// packages/test/src/playwright/clipboard.ts
handle.insertData({ html, pliteFragment: nextPayload.fragment ?? undefined, text });
```

```ts after
// apps/www/tests/browser/document-migration.spec.ts
import { BROWSER_HANDLE_KEY } from '@platejs/test/playwright';

editor.evaluate((element, [value, key]) => {
  (element as HTMLElement & Record<string, Handle>)[key]
    .insertTextAt(value, { offset: 0, path: [0, 0] }, { tags: ['document-migration-proof'] });
}, [text, BROWSER_HANDLE_KEY] as const);
// packages/test/src/playwright/clipboard.ts
handle.insertData({ html, fragment: nextPayload.fragment ?? undefined, text });
```

Saved comments name the product in their kind.

```ts before
// content/docs/(plugins)/(collaboration)/comment.mdx
const initialComments: CommentsJSON = { kind: "plate-comments", version: 1, threads, ranges };
```

```ts after
// content/docs/(plugins)/(collaboration)/comment.mdx
const initialComments: CommentsJSON = { kind: "comments", version: 1, threads, ranges };
```

An editor created without an id shows the engine's name wherever an app prints it.

```tsx before
// content/docs/api/core/plate-controller.mdx
<p>Active editor: {editor.id}</p> // "Active editor: plite-editor-1"
```

```tsx after
// content/docs/api/core/plate-controller.mdx
<p>Active editor: {editor.id}</p> // "Active editor: editor-1"
```

A Plate app passing a bad value reads the engine's name, and some messages name hooks that no longer exist.

```ts before
// packages/plitejs/src/core/initial-value.ts and packages/plitejs/src/react/hooks/use-plite-history.ts
"[Plite] initialValue is invalid! Expected an object."
"usePliteHistory requires an editor or Plite provider."
```

```ts after
// packages/plitejs/src/core/initial-value.ts and packages/plitejs/src/react/hooks/use-plite-history.ts
"initialValue is invalid! Expected an object."
"useEditorHistory requires an editor or an EditorRoot."
```

The React test harness gives the editable a branded test id. Tests select the editable by its textbox role, and the harness finds the editable it rendered by a neutral test id.

```ts before
// packages/test/test/react/PlateTest.test.tsx
expect(rendered.getByTestId("plite-content-editable")).toHaveTextContent("one");
```

```ts after
// packages/test/test/react/PlateTest.test.tsx
expect(rendered.getByRole("textbox")).toHaveTextContent("one");
```

## Document shape

Apps that save comments read and write this JSON; the kind loses the product name.

```json before
{ "kind": "plate-comments", "version": 1, "threads": [], "ranges": [] }
```

```json after
{ "kind": "comments", "version": 1, "threads": [], "ranges": [] }
```

Every peer and every Hocuspocus store reads these `Y.XmlElement` attributes. The element's `type` becomes an ordinary attribute, which the clone path copies. Every element's `nodeName` becomes `element`, because nothing reads it once the type fallback goes and it went stale after each retype. The binding reserves every key that starts with `yjs:`. An element with no `type` still stores `element`, as today.

```json before
{ "nodeName": "paragraph", "plite:type": "heading-one", "plite:yjs-id": "plite-yjs-k3f9a-12", "align": "center" }
```

```json after
{ "nodeName": "element", "type": "heading-one", "yjs:id": "k3f9a-12", "align": "center" }
```

Each peer reads the document's top-level shared types and its schema envelope before it imports anything. A document bound without a `rootName` moves from `plitejs` to `document`, which renames all seven top-level names, and the envelope's format moves to 3. Before import, a new editor scans every top-level schema envelope in the document, whatever its root name, and refuses the document when any of them is not format 3.

```json before
{ "plitejs": "<Y.XmlElement>", "plitejs:roots": "<Y.Map>", "plitejs:schema": { "current": { "format": 2, "identity": "<schema identity>" } }, "plitejs:shared-effect-events": "<Y.Array>", "plitejs:shared-effect-acks": "<Y.Map>", "plitejs:shared-effect-checkpoint": "<Y.Map>", "plitejs:shared-effect-retired-peers": "<Y.Map>" }
```

```json after
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
- `createPlateTestEditor` loses its `testID` option, and `PlateTest` renames its default test id to `editor-test-editable`, which the harness uses to find its own editable. Tests select the editable by role, as Public API shows. A caller that sets its own `data-testid` through `editableProps` now breaks the harness lookup. The `testID` option was the way around that, and no caller in the repository set it.
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

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Browser handle key | `__pliteBrowserHandle`, copied in `@platejs/test` and 45 test files | `__EDITOR_BROWSER_HANDLE__` from one leaf, exported through the testing entrypoints | `plitejs` | One owner; matches the `__EDITOR_*` protocol keys | Workspace readers import the key from the testing entrypoints; scripts outside the workspace import the leaf by relative path | Handle contract test, managed Chromium runs, a grep that finds the old key nowhere and the new key only in the leaf | A missed raw reader times out instead of failing to compile | rename |
| Handle paste field | `pliteFragment` | `fragment` | `plitejs` | Names the payload, not the runtime | `@platejs/test` clipboard helper | Clipboard spec run | None found | rename |
| Yjs stored keys | `plite:type`, `plite:yjs-*`, `plite-yjs-*`, `nodeName` set to the creation type, default root `plitejs` in two files, envelope format 2 checked only under the bound root | `type` as an ordinary attribute, the reserved `yjs:` family, `${scope}-${n}` ids, `nodeName` `element`, one default root `document`, format 3 with a scan of every top-level envelope | `plitejs/yjs` | Neutral stored data; fixes the measured revert; a new editor refuses an old document under any root before import | Old rooms are refused; demo rooms move; old clients stay out of new rooms by deployment | New split case fails at base, passes after; review-commit documents under the default and an explicit root are refused with the encoded document unchanged and no update emitted; the review commit refuses a format-3 document under the same root; Yjs suite | A missed write path keeps an old key | rename |
| Comments kind | `plate-comments` | `comments` | `platejs/comments` | Rejects foreign blobs without the product name | Docs, copied UI, demo values | Comments spec | None found | rename |
| Default editor id | `plite-editor-N` | `editor-N` | `plitejs` | Docs print the id | None needed | Package tests | None found | rename |
| Read, effect, plugin, format, decoration and symbol ids | `plite:` and `plate:` prefixes | No prefix for descriptor ids, `core:` for built-ins in shared registries, `${owner}:` for plugin-owned names, job names such as `editor-runtime.tx-only-methods` for `Symbol.for` keys, `declare const` for the two type-only witnesses | Each producer | Diagnostic, registry and global symbol identities carry no brand | Internal callers; platejs specs test the renderer capabilities through the public setters | Typecheck and package tests | A duplicate id throws at registration | rename |
| React component names | About 11 `Plite*` components, such as `PliteVoidShell` and `PliteRuntimeProvider` | Neutral names, such as `VoidShell` | `plitejs/react`, `plitejs/pagination` | React prints component names in console messages | Internal callers only; hooks keep their names | Typecheck and package tests | A rename collides with an existing export | rename |
| Messages | `[Plite]`, Plite nouns, deleted API names, eleven `failInvariant` copies | Plain messages that name live APIs; one `failInvariant` per package, each package's root copy, with `Invariant failed: `, and no forwarding files | Each producer | Plate users read them | Tests that assert the old text | Package tests | A matcher in app code misses the new text | rename |
| DOM resolution codes | `DOMResolutionError.code` with eight values, three of them ending in `plite-node`, `plite-point` and `plite-range` | No `code` field | `plitejs/dom` | Nothing in the repository or the docs reads it | `best-api repair` for the removed field | plitejs DOM tests and the public surface contract | An app that read the field loses it | cut |
| Test package defaults and knobs | Branded test id, `testID` option, unused timeout setting, branded page keys | A neutral harness test id, role selection in tests, fixed timeout, `__EDITOR_*` page keys | `@platejs/test` | Values with no job go; the rest follow the protocol convention | Five test files | `@platejs/test` partitions | None found | cut |
| DOM, CSS and DOCX names | `precedence="plite"`, `plite-*` style hrefs, `--plate-nav-feedback-duration`, `rIdPlateComments*`, `plate_<id>` | `editor`, `editor-*`, `--editor-nav-feedback-duration`, `rIdComments*`, `bookmark_<id>` | Each producer | Users see them in the head, CSS and Word | Docs pages for the CSS variable; the CSS variable shipped in 53.x | Package tests, guard | None found | rename |
| Copied UI values | `plate:emoji-frequent:v1`, `plate:emoji-shortcodes:v1:`, `plate.html`, `plate.md`, `plate.docx`, `plate-collaboration-demo`, `'plate-comments'` in six demo and value files | `emoji-frequent:v1`, `emoji-shortcodes:v1:`, `document.*`, `collaboration-demo`, `'comments'` | `apps/www/src/registry` | Copied UI writes them into the app's storage, its end users' downloads and its Yjs rooms | New copies only; existing copies stay the app's | Registry rebuild and the comments spec | A copied app's saved emoji picks reset | rename |
| Donor collaboration server | `PLITE_YJS_ROOT_NAME` and a JSON debug export that decodes the `plitejs` root | Snapshot storage only | Tooling | Nothing sets either setting | None | The raw Hocuspocus example's managed run | A developer used the debug export by hand | cut |
| Guard | Text review only | `plate/no-branded-value` with a shrink-only baseline over `plitejs`, `platejs` and `@platejs/test` source and the copied UI in `apps/www/src/registry/{components,lib,hooks}` | Tooling | Three of the four values that arrived after the last cut landed in that scope; the fourth sits in the excluded device lane; copied UI writes into end users' storage | The baseline empties by Phase 3; the CLI is swept by hand | Past-mistake replays on `85d9d991ea`, `3a7b31d737` and `e0c1500b95` | False positives push exceptions, which expire after 90 days | keep |

## Failure modes

This change touches collaboration, the browser contract and generated output, so the plan records three realistic failures, each with the step that catches it and how to roll it back.

- A Yjs write path keeps an old `plite:` key, and a fresh peer reads a mixed document. The Yjs step's new case seeds a fresh peer from the stored document, and the final census greps for `plite:`. A new editor refuses an old document under any root name; an old editor refuses a new document only under the same root, so deployment keeps old clients out of new rooms. To roll back, revert only the Yjs files; no other step reads them. A room that a new editor already wrote stays format 3, so a rollback also moves the demos back to their old rooms.
- A test or benchmark still reads the handle by its old element key and times out instead of failing to compile. The browser handle step moves every raw reader, and the step and the final census both run a repo-wide grep for the old key that must find nothing. To roll back, revert the handle step's files together.
- The guard flags enough ordinary text that many findings need exceptions. Phase 1 counts those findings before anything is renamed. Above three, the lead repairs the tokenizer, then quarantines the offending visitor or the rule and keeps the guard item open.

## Steps

Execution authority: the owner's "verdict next", whose Pursue verdict continues into this plan's build under the Autopilot rule. The packet is the three phases below, built by the lead in this checkout from base `6fa1169c5e`, and left uncommitted on `next` for the owner. The build's blast radius is `docs/plans/artifacts/2026-10-12-editor-public-naming-review/build/blast-radius.md`.

### Phase 1. Land the guard with its baseline

- [x] Write `plate/no-branded-value` in `tooling/oxlint/plate-plugin.mjs`, wrapped in `withBaseline`. It reads string literals, template literal text and JSX text, plus four kinds of names that leave the code: property and declaration names that start with `__`, the name after `process.env.`, object literal keys and class fields, and React component declarations (PascalCase function declarations, and PascalCase constants initialized with an arrow function, a function expression, `memo` or `forwardRef`). Type and interface property signatures are out, because they never reach runtime. It skips module specifiers. It splits camel, kebab, snake, colon, slash and screaming names into tokens. In text, it flags `plite` and `plitejs` everywhere it scans, flags `plate` everywhere in plitejs and elsewhere only when it is not the standalone word "Plate", and passes `platejs`, the product's package name, and `@plate/<item>` registry names. In names, it flags `plite` everywhere and `plate` only in plitejs, so Plate's own internal components, such as `PlateInner`, stay Plate naming itself. Proof: `node --test tooling/oxlint/plate-plugin.test.mjs` with must-flag cases for `precedence="plite"`, `element.__pliteBrowserHandle = handle`, `process.env.PLITE_BROWSER_CLIPBOARD_LOCK_TIMEOUT_MS`, `{ pliteFragment: fragment }`, `export const PliteVoidShell = () => null`, `Symbol.for('plitejs.x')`, `'rIdPlateComments'`, `'plate-comments'`, `'plitejs/dom/path'` and `options.rootName ?? 'plitejs'`, and must-pass cases for `'platejs'`, `import { x } from 'plitejs/react'`, `'@plate/ai'`, `'template'`, `'https://platejs.org'`, `function usePliteRuntime()`, `type T = { pliteNode: Node }`, `function PlateInner()` in platejs and `'Plate plugin "x" failed'` in platejs. Done: 101 of 101 cases pass (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/build/rule-tests-a1.log`); it also flags a PascalCase named function expression, such as `memo(function PliteShell() {})`, which React prints like a declaration.
- [x] Turn it on in `oxlint.config.ts` for `packages/{plitejs,platejs,test}/src/**` and the copied UI in `apps/www/src/registry/{components,lib,hooks}/**`, leaving out test files and the private device partition `packages/test/src/device/**`. The CLI names its binary `plate` in every command example, so it stays out of scope and the final census sweeps it by hand. Seed the baseline with `PLATE_BASELINE_BASE=6fa1169c5e pnpm lint:baseline --init`, and add the CODING_STANDARDS row "Values users can observe never name Plate or Plite | `plate/no-branded-value` (baseline) over plitejs, platejs and @platejs/test source and copied registry UI; the CLI, member accesses and hook names are rule-only". Proof: `pnpm check lint-baseline` and `pnpm check lint` logs.
  Done: on with an empty baseline, and `pnpm check lint-baseline` passes (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/baseline/lint-baseline-check-a2.log`). In the HEAD-plus-patch worktree, `pnpm check lint` fails only on what fails the same way at `6fa1169c5e`: console statements in `apps/www/src/registry/components/editor/link.tsx` and `apps/www/tests/browser/link-url-policy.spec.ts`, and the formatting of four files this change does not touch (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-rerun-lint-a1.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/base-lint-a1.log`).
- [x] Replay the real past mistake. In a `tooling/scripts/proof-worktree.mjs` worktree with the rule, write `git show 85d9d991ea:packages/plitejs/src/react/components/editable-element-placement.tsx` to its path and run `PLATE_LINT_BASELINE=report-all pnpm exec oxlint -c oxlint.config.ts` on it; require `plate(no-branded-value)` on the `href` and the `precedence`. The current file still holds both values until Phase 2, so the control is the same file with the two values swapped for the planned neutral ones in the worktree, which must report nothing from this rule. Repeat both runs for `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` from `3a7b31d737`, which wrote `'plate-comments'`, and for `packages/plitejs/src/react/components/editable-text-blocks.tsx` from `e0c1500b95`, which added the `PliteViewSelectionCaret` and `PliteViewSelectionCaretGeometry` components on 2026-09-15, after the last cut. Each control swaps every name the rule flags in that file. Proof: one log per command with its exit status. Done: 2, 4 and 9 findings, and each control reports none (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/controls/guard-replay/run-a1.log`).
- [x] Keep, repair or quarantine. Before the report-all run, write the planned renames to `docs/plans/artifacts/2026-10-12-editor-public-naming-review/controls/planned-renames.txt` from `census-distinct-a1.tsv`, the copied UI values, the `Plite*` components and the branded object keys and class fields a source grep finds, so the count cannot follow whatever the guard flags. A permanent keep must pass the tokenizer itself, because an exception expires after 90 days. Keep the rule when at most three findings are neither on that list nor a message the Messages step rewrites. Above three, repair the tokenizer and measure again; if a visitor still goes over, quarantine that visitor, or the whole rule, and keep the guard item open instead of calling the hand cut complete. Proof: a decision row with the counts. Done: kept. 264 findings, 260 on the frozen list (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/controls/planned-renames.txt`), 4 messages the Messages step rewrites, 0 others (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/controls/classify-a1.txt`).

### Phase 2. Cut stored and protocol values

- [x] Yjs. The type revert is a defect in shipped code, so this step runs the Bug fix playbook's method inside the plan. Add the retype-then-split case to `packages/plitejs/test/yjs/split-node-contract.spec.ts` and show it fails at base with `proof-worktree.mjs --expect-fail`. List every reader of the element type, each caller of `getPliteYjsElementType` and each path that builds a `Y.XmlElement`, and give any reader the new case does not reach its own case. Then add `packages/plitejs/src/yjs/core/keys.ts` owning `yjs:hidden`, `yjs:id`, `yjs:virtual-child-id`, `yjs:virtual-placeholder`, the `yjs:set:` prefix, the reserved `yjs:` family and `DEFAULT_YJS_ROOT_NAME = 'document'`; derive `event-change-bridge.ts`'s projection list from it; replace `INTERNAL_YJS_ATTRIBUTE_SET` and the check in `assertPublicYjsAttributeCanBeSet` with one reserved-family predicate; store `type` as an ordinary attribute and delete `PLITE_TYPE_ATTRIBUTE`, `getPliteYjsElementType`, `setPliteYjsAttribute`, `removePliteYjsAttribute` and the `nodeName` fallback; create and clone every element, the placeholder included, with `nodeName` `element`; allocate node ids as `${scope}-${n}`; name the temporary selection root `root`. An untyped element still stores and reads back `element`. Make `yjs/core/controller.ts` and `yjs/core/plugin.ts` read the default root from `keys.ts`. Move `SCHEMA_METADATA_FORMAT` in `yjs/core/schema-metadata.ts` from 2 to 3, and make `readYjsSchemaEnvelope` refuse another format with a message that names both formats. Run the foreign-format scan inside `assertRoomSchemaForImport`, which activation, first admission and each later input already call, so it runs before waiting for a seed, seeding, import or `activate()`. The scan treats an `X:schema` entry as an editor envelope only when it holds a numeric format and an identity whose kind is `derived` or `named` and whose fingerprint is a string; extra fields do not change that. It reads a remote placeholder's entry without retyping it, skips a name already typed as something other than a map, and refuses any such envelope whose format is not 3. The bound root's reader also requires format 3. In the raw Plite Hocuspocus example, delete the `rootName: 'plitejs'` override and move the default room to a new id; in `tooling/plite/donor/yjs/hocuspocus-server.ts`, delete `PLITE_YJS_ROOT_NAME` and the JSON debug export. Proof: the new case passes; a round-trip case keeps an untyped element as `element`; a case refuses an app field named `yjs:x`; two cases bind Y.Doc updates captured from the review commit in a `proof-worktree.mjs` run, one written under the old default root and bound under the new default, and one written under one explicit root and bound under another, and each expects the scan's refusal with the full encoded document unchanged and no update emitted during the bind; a control that deletes an entry before refusing must fail that assertion; a same-root case checks the format bump's own refusal; a probe at the review commit binds an update from the new code under the same explicit root and records the old code's refusal in its log; the plitejs Yjs specs pass; a managed run of the raw Hocuspocus example still syncs; and the `plite-yjs-event-change-bridge` benchmark target reruns through `benchmark`.
  Done: the plitejs Yjs specs pass 296 of 296 on the last panel round's code (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/panel/yjs-partition-after-r4-a2.log`), and the raw Hocuspocus example syncs in managed Chromium (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/browser/plite-chromium-handle-rest-a2.log`). The `plite-yjs-event-change-bridge` target passes every gate in strict mode on five interleaved packets per side, rerun on the final linted bytes. The sync distance ratio has a median of 1.207 against the base's 1.227, and the base alone ranges from 1.096 to 1.485. The host ran at a load of 7 to 10 on 18 cores, which makes every timing line inconclusive, so the claim rests on the zero detached transactions, zero property-context failures and per-edit trace asserts that hold on every packet; the Defaults row "Benchmark on a busy machine" accepts that (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/bench/final-summary-a1.log`). The target's correctness command passes 45 of 45 (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/bench/correctness-cand-a2.log`).
- [x] Comments. Change `CommentsJSON.kind`, `decodeComments` and the writers in `BaseCommentsPlugin.ts`, the spec and fixture, `apps/www/src/registry/components/editor/import-toolbar-button.tsx` the six registry demo and value files that write the old label (`rich-text-editor-value.ts`, `comment-overlap-demo.tsx`, `discussion-demo.tsx`, `pagination-demo.tsx`, `playground-demo.tsx` and `comment-value.tsx`), the generator `apps/www/scripts/generate-rich-text-editor-value.ts` that writes the first of them, and the proof block `apps/www/src/app/(blocks)/blocks/discussion-proof/discussion-proof.tsx` to `'comments'`. The spec's wrong-kind case uses `'comments'` today, so it switches to `'plate-comments'` and proves the old label is refused. Run `plate-docs` on `content/docs/(plugins)/(collaboration)/comment.mdx` and its Chinese twin. Proof: the comments spec, including its wrong-kind case, and the `plate-docs` checks.
  Done: the comments spec passes 61 of 61 with the wrong-kind case on `'plate-comments'` (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/comments/comments-spec-a1.log`), and the registry builds fresh in this checkout and in the HEAD-plus-patch worktree (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/main-build-registry-check-a2.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-build-registry-a1.log`).
- [x] Browser handle. Add the dependency-free leaf `packages/plitejs/src/internal/browser-protocol.ts` with `BROWSER_HANDLE_KEY = '__EDITOR_BROWSER_HANDLE__'` and `DOM_RESOLUTION_ERROR_PATTERNS`; it sits in the root partition, which `react`, `dom` and `testing` already depend on. Import it in `browser-handle.ts` and `dom-editor.ts`; rename `pliteFragment` to `fragment`; export both values from `plitejs/testing` through a file in `src/testing/` and `pnpm brl`; add `platejs/testing` to the `@platejs/test` playwright entrypoint in `tooling/entrypoints/entrypoint-dag.mjs`; make `@platejs/test` import them and delete `BROWSER_HANDLE_KEY` from `constants.ts` and the literal in `ime.ts`; move every raw reader in the workspace's `apps/` and `packages/*/test` to the import, and make scripts outside the workspace, such as `benchmarks/editor`, `benchmarks/slate-v2/donor`, `packages/plitejs/benchmarks/*.mjs` and `tooling/scripts/*.mjs`, import the leaf by relative path, as some benchmarks already import plitejs source; Node 24 runs the `.ts` leaf from a `.mjs` script (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/replay/probe/ts-leaf-import-a1.log`), and Node 22.18, the lowest version `engines` allows, strips types by default too (inferred from Node's release notes; not run). A script that writes the key into generated source, such as `cross-editor-adapters.mjs`, interpolates the imported value. Build the DOM resolution messages from the leaf's three prefixes, `Unable to find the path for an editor node`, `Cannot resolve an editor node` and `Cannot resolve a DOM `, so the recorder records exactly the three families it records today and the messages cannot drift from it. Delete `DOMResolutionError.code` and its eight values in `dom/plugin/dom-editor.ts`. Proof: the browser-handle contract test; a new `@platejs/test` case on the `'handle'` clipboard transport whose fragment gives a different document than its HTML and text, which fails when the helper sends `pliteFragment`; a new case that feeds real `DOMEditor` path and node resolution errors through the default recorder and checks that an unrelated console error is not recorded; `pnpm check entrypoint-graph`; the `@platejs/test` partitions; managed Chromium runs of `apps/www/tests/browser/document-migration.spec.ts` and one plite spec that uses the handle; `git grep -F __pliteBrowserHandle -- . ':!docs' ':!.changeset' ':!tooling/oxlint/plate-plugin.test.mjs'` finding nothing; and `git grep -F __EDITOR_BROWSER_HANDLE__ -- . ':!docs' ':!content' ':!.changeset'` finding only the leaf.
  Done: the contract test passes 12 of 12, the two new `@platejs/test` cases pass and fail under their mutants, `pnpm check entrypoint-graph` and the 39 `@platejs/test` partition tasks pass, and managed Chromium runs pass for `document-migration.spec.ts`, plaintext, huge-document, cross-editor drag, authored changes and the synthetic IME commit (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/browser/`). Deviation: Playwright here loads workspace packages from source and cannot compile plitejs core, so `@platejs/test` keeps its own key and the three message prefixes, `dom-editor.ts` writes its messages inline, the leaf exports only `BROWSER_HANDLE_KEY`, browser specs import the key from `@platejs/test/playwright`, and the second grep finds the leaf and that copy. The handle case runs in happy-dom with a real mounted editor, since the transport calls the handle directly.
- [x] Test package. Delete the default test id and the `testID` option, and move `packages/platejs/test/react/PlateTest.tsx` and `packages/platejs/src/react/utils/BlockPlaceholderPlugin.slow.tsx` off the old test id, delete `PLITE_BROWSER_CLIPBOARD_LOCK_TIMEOUT_MS` with its pass-through in `apps/plite/scripts/run-plite-browser.mjs` and that script's test row, rename the page keys to `__EDITOR_NATIVE_CLIPBOARD_PAYLOAD_*` and `__EDITOR_TRUSTED_TYPING_TRACE__`, and make the device lane's message name `PLATE_DEVICE_WWW_PORT`, the setting setup reads. Proof: `pnpm --filter @platejs/test test:react` and the runner's Node test.
  Done: `test:react` passes, the runner's Node test passes 3 of 3, and the placeholder slow test passes 14 of 14 (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/test-package/`). Deviation: nothing imported `packages/platejs/test/react/PlateTest.tsx`, so it and its `.d.ts` were deleted instead of moved. After the diff panel, `EditorTest` marks its editable with `data-testid="editor-test-editable"` and `createTestEditor` finds it by that id. A role query fails when the editable takes another role, and a `[data-editor="true"]` query picks another editor that a plugin renders before the editable. The `testID` option stays deleted.
- [x] Defaults, DOM, CSS and DOCX. Allocate `editor-N` ids; rename the hoisted styles to `editor-element-placement` and `editor-pagination-native-flow-break` with `precedence="editor"`; rename the CSS variable and run `plate-docs` on `content/docs/(plugins)/(functionality)/navigation-feedback.mdx` and its twin; rename DOCX relationships to `rIdComments*` and bookmarks to `bookmark_<id>`. Proof: plitejs and platejs tests, the DOCX export specs and the `plate-docs` checks.
  Done: the plitejs core, pagination and react partitions, the platejs DOCX export partition and the navigation feedback spec pass (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/dom-css-docx/`), and the registry builds fresh (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/main-build-registry-check-a2.log`).
- [x] Copied UI. In `apps/www/src/registry`, rename the emoji storage keys to `emoji-frequent:v1` and `emoji-shortcodes:v1:`, the export downloads to `document.html`, `document.md` and `document.docx`, and the collaboration demo's room, root and schema id to `collaboration-demo`, with the matching entry in `tooling/scripts/check-plate-schema-adoption.mjs`. Update `apps/www/tests/browser/emoji.spec.ts` and `apps/www/tests/browser/docx.spec.ts`, and run `plate-docs` on `content/docs/(plugins)/(functionality)/(combobox)/emoji.mdx` and its Chinese twin. Delete `apps/www/public/prism.css`, which nothing references. Proof: `pnpm --filter www build:registry` output, `pnpm check lint-baseline` dropping the copied UI entries, and `git grep -F prism.css -- apps` finding nothing.
  Done: the values are renamed, `prism.css` is gone and `git grep -F prism.css -- apps` finds nothing; `content/docs/examples/export.mdx` and its twin also teach the new download names. The registry builds fresh in both trees (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/main-build-registry-check-a2.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-build-registry-a1.log`), and the baseline check passes (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/baseline/lint-baseline-check-a2.log`).
- [x] Shrink the baseline. Proof: `pnpm lint:baseline` drops this phase's entries and `pnpm check lint-baseline` passes.
  Done: the retry at 14:05 dropped the 264 `plate/no-branded-value` entries and no other rule's, and `node tooling/oxlint/plate-baseline.mjs --check` passes (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/baseline/lint-baseline-shrink-a2.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/baseline/lint-baseline-check-a1.log`).

### Phase 3. Fix messages and ids, then close the baseline

- [x] Messages. Drop the `[Plite] ` prefix, say "editor node", "editor point" and "editor range" where messages say Plite, name `useEditorHistory`, `useChildRoot`, `useContentRoot`, `EditorRoot` and `EditorContent` where messages name deleted APIs, such as "PlateContent is rendered below Plate" in `EditorContentView.internal.tsx`, give each package's root `failInvariant` the prefix `Invariant failed: `, delete the six platejs feature copies and the plitejs yjs copy and import each package's root copy from their callers, and give the cli and www copies the same text. Drop the `plitejs/react` mention from `@platejs/test`'s `installBrowserHandle()` message in `playwright/ready.ts`. Update every test that asserts the old text, found by grepping each changed message. Proof: `pnpm check test` and `pnpm check plite-test`.
  Done: applied by `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/messages-codemod.mjs` and `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/fail-invariant-codemod.mjs`. The three packages typecheck, and their package tests pass, with the core and authored partitions rerun serially after three 5 s timeouts under load (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/plite-test-continue-a1.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/plite-test-core-authored-serial-a1.log`). The final `pnpm check` in the HEAD-plus-patch worktree fails only tests that fail the same way at `6fa1169c5e`: the `migrateListIdentity` export, the DOCX parse count, two `listId` cases and the authored fill-law property run (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-pnpm-check-a3.log`).
- [x] Ids. Drop the prefix from read and contribution ids such as `transfer.source`; use `core:` for built-ins in registries apps also write, such as `core:html` and `core:block-content`; use `${owner}:` for plugin-owned format and rule names; give the `Symbol.for` keys in `core/tx-only.ts` and `react/dom-text-sync.ts` job names such as `editor-runtime.tx-only-methods`, and make the platejs specs that spell the renderer capability keys assert behavior through the public setters instead, deleting the spec's local key-reading helper; turn the two type-only witnesses in `core/tx-only.ts` into `declare const` with `unique symbol`; drop the prefix from other symbol descriptions; rename the `Plite*` React components and the branded property keys the guard flags; rename branded discriminants by role. Proof: `pnpm check typecheck` and `pnpm check test`.
  Done: applied by `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/ids-codemod.mjs` across 71 files; the guard reports 0 findings over its scope (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/report-all-a3.json`), and typecheck and package tests pass as the Messages step says. Plugin names, format keys, decoration sources, the block-content group and derived child roots take `core:`; effect keys and the internal DOM phase key follow their unprefixed siblings. `plate generate` in the HEAD-plus-patch worktree wrote `plugins.schema.json` and `plugins.generated.ts`. Its output also adds the `listId` and `listLevels` fields that committed source declares but the base never regenerated. `withPlite.slow.ts` pins the derived fingerprint, which the group rename changed. The final check's typecheck, public-types and plite-test steps pass (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-pnpm-check-a3.log`).
- [x] Close the baseline. The `plate/no-branded-value` entries are gone and the rule stays an error. Proof: `pnpm check lint` and `pnpm check lint-baseline`.
  Done: the entries are gone and the rule stays `error` in `oxlint.config.ts`; `pnpm check lint-baseline` passes and `pnpm check lint` fails only on the base's findings (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/baseline/lint-baseline-check-a2.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-rerun-lint-a1.log`).
- [x] Teaching and doctrine. Run `best-api repair`: add the observable-values sentence and the guard to the naming rule in `docs/vision/plate.md`, run `tooling/scripts/teaching-sweep.mjs` for each renamed value, fix live hits in `docs/plite` and skills, run `pnpm brl` for the changed exports, rebuild the registry with `pnpm --filter www build:registry`, regenerate the API reference in a proof worktree, and write changesets for `plitejs`, `platejs`, `@platejs/test` and `@platejs/cli` through `changeset`. Proof: the sweep logs, `pnpm check registry-changelog` and `pnpm check skill-mirrors`.
  Done: `docs/vision/plate.md` holds the observable-values rule and names the guard. The sweep (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/teaching-sweep-a1.txt`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/exact-old-values-a1.txt`) finds the old values only in dated research, history, generated output, kept tooling names and the wrong-kind test. `pnpm brl` changes nothing. The build amended three unreleased changesets, the navigation feedback one among them for the CSS variable, added `.changeset/test-browser-handle-key.md`, and added the registry changelog entry `2026-10-12-neutral-stored-names` for the copied UI. The CLI never shipped and only its internal message changed, so it gets no changeset. `pnpm --filter www build:registry --check` passes in the main checkout, and the API reference manifest takes the worktree's regeneration. `pnpm check registry-changelog` and `pnpm check skill-mirrors` pass in the final check (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-pnpm-check-a3.log`).
- [x] Final census and `pnpm check`. Rerun the census script over the three packages, `packages/cli/src`, the registry's TypeScript and JSON output and `apps/www/public`; only package names, Plate prose, the CLI's `plate` command, `@plate/<item>` registry names and raw Plite example pages remain. Run `git grep -F -e __pliteBrowserHandle -e "'plite:type'" -e plite:yjs- -e "'plite-yjs-" -- 'packages/*/src' apps/www/src/registry apps/www/public`, which must find nothing; repo tooling names such as the `plite-yjs-event-change-bridge` benchmark and the `plite:typecheck` script stay. Run `pnpm check` once on the settled patch in a detached worktree. Proof: the census log, the grep log and the `pnpm check` log.
  Done: the census finds only the kept duplicate-copy counter and the comments spec's wrong-kind case, and the step's grep finds nothing (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/final-census-a2.log`). The census script greps the 26 renamed or deleted values, so the other branded values come from the guard: it reports nothing over its scope in the final lint, and run over the CLI and the registry's examples and blocks it finds only the CLI's own name in its messages, cache and temp paths and build plugin names, and the 12 deliberate examples (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/correct/branded-probe-cli-a1.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/correct/branded-probe-examples-a1.log`). `pnpm check` on the settled HEAD-plus-patch tree fails only steps that fail the same way at `6fa1169c5e`, plus one authored property test that timed out under load and passes when its partition runs alone, and the www production build that the base's type error stops passes here (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-pnpm-check-a4.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-authored-partition-a1.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-rerun-build-www-ci-a1.log`).

## Completion gates

| Gate | Artifact |
| --- | --- |
| `pstack:blast-radius` on the change before the first edit | `docs/plans/artifacts/2026-10-12-editor-public-naming-review/build/blast-radius.md`, census `docs/plans/artifacts/2026-10-12-editor-public-naming-review/build/blast-census-a1.log` |
| `verify` loaded before the first proof gate, and `benchmark` before the Yjs bench rerun | `verify`: this build's invocation before the Phase 1 proofs; `benchmark`: loaded before `docs/plans/artifacts/2026-10-12-editor-public-naming-review/bench/summary-a1.log` |
| `pstack:thermo-nuclear-code-quality-review` per shared-code slice | skip: the `api-build` reviews row owed a panel on the diff from the first slice, and every seat applied the code-quality lens |
| `PLATE_BASELINE_BASE=6fa1169c5e` for every baseline write and check until the change ships | `docs/plans/artifacts/2026-10-12-editor-public-naming-review/baseline/lint-baseline-shrink-a2.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/baseline/lint-baseline-check-a1.log` |
| Copies of files other sessions hold, made before the first edit | `docs/plans/artifacts/2026-10-12-editor-public-naming-review/build/pre-edit/INDEX.txt` |
| Each slice frozen with `freeze.mjs` | `docs/plans/artifacts/2026-10-12-editor-public-naming-review/build/freeze-phase1.txt`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/yjs/freeze-yjs-candidate.txt`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/panel/round-3-freeze.txt`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/panel/round-4-freeze.txt`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/panel/round-5-freeze.txt` |
| `plate-docs` on each docs page the plan names | loaded for the navigation feedback and emoji pages; the comment and export pages change only renamed values; `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/main-build-registry-check-a2.log` |
| `pnpm check` steps the edits reach, before expensive runs | `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-typecheck-a1.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/type-aware-task-a3.log` |
| `deslop`, then `no-comments`, on the product diff | decision-log rows "deslop on the product diff" and "no-comments on the product diff", then each panel round's writing row |
| `oxlint --type-aware` on the task's files before the panel | `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/type-aware-task-a3.log` |
| Panel on the diff (reviews: api-build) | three rounds, the cap: `docs/plans/artifacts/2026-10-12-editor-public-naming-review/panel/round-3-prompt.md`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/panel/round-4-prompt.md`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/panel/round-5-prompt.md` and their answers |
| `best-api repair` | `docs/vision/plate.md` observable-values bullet; `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/teaching-sweep-a1.txt` |
| Changesets | `.changeset/plite-yjs-attribute-keys.md`, `.changeset/plitejs-browser-handle-installer.md`, `.changeset/keyed-mounted-navigation-feedback.md`, `.changeset/test-browser-handle-key.md` and the registry changelog entry `2026-10-12-neutral-stored-names` |
| `unslop` on plan, docs and changesets | decision-log row "unslop on docs, changesets and plan notes", then each panel round's writing row |
| `pnpm lint:fix` on the task's paths, last | `docs/plans/artifacts/2026-10-12-editor-public-naming-review/build/lint-task-main-a3.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/build/lint-task-worktree-a1.log` |
| `review-ledger.mjs check` and `lookup` | `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/main-review-ledger-check-a1.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/main-review-ledger-lookup-a1.log` |
| Fold into the subject file and render with `--folded` | `docs/plans/topics/editor-public-naming.md`; `docs/plans/artifacts/2026-10-12-editor-public-naming-review/fold/subject.before-fold.md` keeps the state before it |

## Open work

- Shared documents written before the Yjs envelope existed (2026-07-22), such as the 53.x `content` layout of `@platejs/yjs`, carry no envelope, so a v54 editor bound under its default root finds its own root empty and can seed beside them. The review commit behaves the same way. Plate law requires a reader for that shipped format, which is a separate plan; this one does not change how such a room loads. Tracked in `docs/plans/topics/editor-public-naming.md` Open work at the fold. owner: zbeyens. stop: a plan for opening 53.x Yjs rooms in v54 is written, or the owner accepts the gap.
- Five task chips from this build wait for the owner: "Find createTestEditor's editable through a ref", "Let @platejs/test import plitejs's handle key", "Remove the any erasure in useRuntime view registration", "Fix readEditorSchemaContract rejecting the www schema" and "Fix external-text browser spec that cannot load". Tracked in `docs/plans/topics/editor-public-naming.md` Open work at the fold. owner: zbeyens. stop: each chip's session lands its fix, or the owner dismisses the chip.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which item to take | Editor naming, the item the ledger returned | Another open item | another item | small |
| How much to rename | Every name a user, their saved data or their tests can see (look) | Only the five names the last review listed | narrow | big |
| Error messages | Drop the engine's name from messages and fix the ones naming renamed hooks | Leave messages alone | keep messages | big |
| Plate's own messages | Keep saying Plate in Plate's error text, since users installed Plate | Make them neutral too | neutral prose | small |
| Old saved comments and collaborative documents | No converter, because no release ever wrote those formats (look) | Read the old names too | old reader | big |
| Shared documents saved before this | Editors refuse them with a clear error before reading anything (look) | Let them load and come out mangled | no refusal | big |
| Shared documents with no chosen name | They live under a plain name, document (look) | Keep the engine's name there | keep root name | small |
| Where the new lint rule looks | The three editor packages and the copied UI components; the command-line tool and the registry's examples and blocks get checked by hand (look) | Everywhere, with exceptions that expire every 90 days | guard everywhere | small |
| What the new lint rule reads | Text, protocol names, field names and component names; not every property access (look) | Every name in the code, with a long baseline | read everything | small |
| Error codes on DOM resolution errors | Removed, since nothing reads them (look) | Renamed without the engine's name | keep codes | small |
| Which errors the test recorder catches | The same three families as today. The test package keeps the three patterns, and a test feeds the engine's real errors through them, because the browser test runner here cannot load the engine's source (look) | A new public entry point that holds only the patterns and the handle's name | one entry | small |
| Engine component names in React's console messages | Renamed; hook names stay | Kept | keep components | small |
| Scripts outside the workspace | Import the handle's name from its one owner | Spell it by hand | spell key | detail |
| Emoji picks and export file names in copied UI | Plain names; new copies start with fresh emoji picks | Keep the Plate names | keep copied names | small |
| One error helper per package | Each package keeps its own copy with the new text | Plate borrows the engine's copy | share helper | detail |
| Names nothing uses | Delete them instead of renaming, such as the test id option and an unused timeout setting; the test harness keeps its own test id under a plain name, because it finds the editor with it (look) | Rename everything | rename all | small |
| What stays branded | Package names, import paths, the website link, the command-line tool's name and the registry's item names | Rename those too | rename packages | detail |
| Stopping new branded names | A lint rule with a starting list of known cases that must shrink to zero (look) | A broader checker that also reads docs, CSS and JSON | broad checker | big |
| Raw engine examples | Engine demo pages and repo tools may still say Plite, since they show or test the engine | Rename them too | rename demos | detail |
| App fields named like the shared document keys | Any field starting with the editor's reserved prefix is rejected, so a key the editor adds later cannot collide with an app field (look) | Rejected only on an exact match, or renamed on save so any name works | exact keys | small |
| Plate's own internal component names | Kept, since they are Plate naming itself, like Plate's error text | Renamed along with the engine's | rename plate components | detail |
| Shared document element tags | Every element stores the same tag; the type lives only in its type field | Keep the tag it was created with | keep tags | detail |
| Saved comments label | Keep a neutral label so a stray file cannot wipe comments | Drop the label | drop kind | small |
| Where tests get the handle's name | Browser tests import it from the test package, which keeps its own copy for the same reason; a test fails when the copy and the engine's name differ (look) | A new public entry point that holds only the name | one entry | small |
| Device test lane | Leave it where it is and fix its one wrong message | Move it into repo tooling | move device | detail |
| Word bookmarks from export | Renamed and still visible | Hidden from Word's bookmark list | hide bookmarks | detail |
| Generated editor schema | Take the generator's whole output, which also adds two list fields that committed code already declares | Change only the renamed group by hand | schema rename only | small |
| Duplicate-copy counter | Keep its Plate name, so a 53.x copy and this one still count together and warn | Rename it after the package | rename counter | small |
| What happens after this review | Write the plan and build it now | Stop at this review | hold | big |
| Benchmark on a busy machine | Keep the rerun's passing gates and zero error counts, and leave the timing comparison open (look) | Rerun on a quiet machine before closing | quiet rerun | small |
| Envelope check fixed twice in review | Keep the second fix, which the last review round found nothing against (look) | Remove the whole-document check, so a new editor refuses an old document only under the same name, and plan the check again | revert scan | small |
| Tests for each place that reads a block's type | Every place reads the type through one function; no extra test per place, because two places cannot be told apart by any test and two others had no test before this change (look) | Write a test for each place | reader cases | small |

## Close

Built from base `6fa1169c5e` and left uncommitted on `next` for the owner. The panel reviewed the diff in three rounds, the build's cap.

Reversals and deviations come first.

- The plan deleted the test harness's default test id. The build renames it to `editor-test-editable` instead, because the harness finds the editable it rendered by that id. A role query broke when a caller gave the editable another role, and a `[data-editor="true"]` query picked a nested editor that a plugin rendered first. The `testID` option stays deleted, so a caller that sets its own `data-testid` through `editableProps` now breaks the harness lookup. Two harnesses mounted in one test still find two editables, as they did at the base. Task chip "Find createTestEditor's editable through a ref" tracks the fix.
- The CODING_STANDARDS row and `docs/vision/plate.md` said the guard covers all copied registry UI. It covers the registry's components, hooks and lib. Registry examples and blocks stay unchecked, because all 12 brand names the guard finds there are engine comparisons, a Plate code sample or a Plate migration label (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/correct/branded-probe-examples-a1.log`).
- `@platejs/test` keeps its own copy of the browser handle key and the three DOM resolution message prefixes, and a test fails when either drifts from plitejs, because Playwright here cannot compile plitejs source. Task chip "Let @platejs/test import plitejs's handle key" tracks the root cause.
- `failInvariant` keeps one root copy per package instead of Plate borrowing the engine's.
- Nothing imported the platejs test copy of `EditorTest`, so the build deleted it instead of moving it.
- No separate test covers each reader of a block's type, because every reader goes through `getYjsElementType` (Defaults row "Tests for each place that reads a block's type", word reader cases).
- `plugins.schema.json` and `plugins.generated.ts` take the whole `plate generate` output, which also adds 36 list-field lines that committed source already declared.
- Round 3 replaced how the admission scan recognizes an editor envelope, from a sibling root to a valid editor identity. Round 4 found a critical case in that replacement and fixed the recognizer a second time, to a numeric format plus an editor kind and a string fingerprint. The panel rule sends a mechanism that needs a second fix back to planning instead, so this fix broke that rule. Round 5 found nothing against the scan, so the build keeps it (Defaults row "Envelope check fixed twice in review", word revert scan).

What landed. Saved comments, collaborative documents, browser test handles, default ids, hoisted styles, the navigation CSS variable, DOCX ids, error messages, symbol keys, React component names, test package defaults and copied registry UI values no longer name Plate or Plite. Collaborative documents store neutral `yjs:` keys, keep the block type as an ordinary attribute, bind under `document` by default and write envelope format 3. A new editor refuses an envelope of any other format under any root before it reads or writes anything. The block type now survives a retype followed by a split. `plate/no-branded-value` blocks new branded values with an empty baseline.

Proof, from each decision-log row's scope:

- The retype-then-split case fails at the base and passes on the build. The plitejs Yjs specs pass 296 of 296 on the last panel round's code. A new editor refuses rooms the base saved before it imports them, and the rooms stay byte-identical; mutation controls cover the scan, its no-write claim and the reserved family.
- The raw Hocuspocus example syncs in managed Chromium.
- The `plite-yjs-event-change-bridge` target passes every gate on five interleaved packets per side, and its correctness command passes 45 of 45. The host was loaded, so its timing comparison with the base is inconclusive; its zero error counts and per-edit trace asserts hold.
- The browser handle contract test passes 12 of 12, the clipboard and recorder cases fail under their mutants, and managed Chromium runs pass for the plite and www specs that read the handle, except two www cases that fail the same way at the base.
- The guard reports the two past mistakes it replays, reports 0 findings over its scope after the build, and its baseline holds no entries.
- The final census of the 26 renamed or deleted values over the three packages, the CLI, the registry and `apps/www/public` finds only the kept duplicate-copy counter and the comments spec's wrong-kind case (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/final-census-a2.log`). For other branded values, the guard reports nothing over its scope in the final lint, and running it over the CLI and the registry's examples and blocks finds only the CLI naming itself and the 12 deliberate examples (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/correct/branded-probe-cli-a1.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/correct/branded-probe-examples-a1.log`).
- `pnpm check` on the settled HEAD-plus-patch tree fails 9 of 25 steps. One is `plite-test`, where an authored property test timed out at 5.2 s under load; that partition passes 652 of 652 run alone. The other eight fail only where `6fa1169c5e` fails the same way: console statements and four files' formatting in lint, six tests (the `migrateListIdentity` export, the DOCX parse count, two `listId` cases and the authored fill-law property run), the schema adoption audit's 11 findings, seven other plans' ledger links, one knowledge citation in the emoji subject and the www type errors in `import-toolbar-button.spec.tsx`. The www production build, which that type error stops at the base, passes here (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-pnpm-check-a4.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-authored-partition-a1.log`, `docs/plans/artifacts/2026-10-12-editor-public-naming-review/phase3/wt-rerun-build-www-ci-a1.log`).

Limits.

- The admission scan reads a root that only a remote update created through yjs 13.6's item store, the same way yjs's unexported `typeMapGet` does, because `getMap` would retype that root for good. A yjs upgrade that changes those internals needs this read checked again.
- The scan's check that a fingerprint is a string has no test of its own.
- The benchmark host ran at a load of 7 to 10 on 18 cores, so every timing line is inconclusive, and only the zero detached transactions, zero property-context failures and per-edit trace asserts carry a claim. A rerun on a quiet machine would settle the timing.
- Demo comments saved in browsers and demo rooms on a running Hocuspocus server still hold the old names, so they stop loading and the demos move to new rooms.

Of the plan's 16 steps, 16 are done, and none are partial, skipped, blocked or open. Of its 17 completion gates, 16 are met. The per-slice code-quality review is skipped, because the diff panel ran from the first slice.

Review inputs. The verdict read, and the build changed or proved, these 52 files: `2e865a0bc4:docs/research/decisions/editor-public-naming.md`, `docs/research/review-records/2026-10-04-editor-public-naming-audit.json`, `docs/research/review-records/2026-09-13-editor-public-naming-closure-audit.json`, `docs/plans/2026-10-04-ledger-triage-audit.md`, `docs/plans/2026-09-12-editor-public-naming-adoption.md`, `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `docs/vision/plite.md`, `packages/plitejs/src/react/editable/browser-handle.ts`, `packages/plitejs/src/react/index.ts`, `packages/plitejs/src/create-editor.ts`, `packages/plitejs/src/interfaces/editor.ts`, `packages/plitejs/src/core/initial-value.ts`, `packages/plitejs/src/dom/plugin/data-transfer-format.ts`, `packages/plitejs/src/react/hooks/use-plite-history.ts`, `packages/plitejs/src/react/hooks/use-plite-child-root.ts`, `packages/plitejs/src/react/hooks/use-editor-context.tsx`, `packages/plitejs/src/yjs/core/attributes.ts`, `packages/plitejs/src/yjs/core/document.ts`, `packages/plitejs/src/yjs/core/set-valued-attributes.ts`, `packages/plitejs/src/yjs/core/editor-adapter.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`, `packages/platejs/src/internal/plugin/compilePlateFormats.ts`, `packages/platejs/src/internal/failInvariant.ts`, `packages/test/package.json`, `packages/test/src/index.ts`, `packages/test/src/playwright/constants.ts`, `packages/test/src/playwright/clipboard.ts`, `packages/test/src/playwright/dom-locators.ts`, `packages/test/src/react/PlateTest.tsx`, `packages/test/src/react/createPlateTestEditor.ts`, `content/docs/(guides)/browser.mdx`, `content/docs/(plugins)/(collaboration)/comment.mdx`, `content/docs/api/core/plate-controller.mdx`, `packages/plitejs/src/react/hooks/use-plite-runtime.tsx`, `packages/platejs/src/ai/internal/failInvariant.ts`, `apps/www/tests/browser/excalidraw.spec.ts`, `packages/platejs/src/features/code-block/internal/failInvariant.ts`, `apps/www/src/registry/components/editor/import-toolbar-button.tsx`, `packages/plitejs/src/react/editable/external-text-binding.ts`, `packages/platejs/src/markdown/internal/failInvariant.ts`, `apps/www/tests/browser/media-caption.spec.ts`, `packages/plitejs/src/pagination/react.tsx`, `apps/www/tests/browser/document-migration.spec.ts`, `apps/plite/src/app/mobile-lab/client.tsx`, `packages/plitejs/src/react/components/editable-element-placement.tsx`, `packages/platejs/src/features/basic-styles/internal/failInvariant.ts`, `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts`, `apps/www/tests/browser/suggestion.spec.ts`, `packages/platejs/src/features/table/internal/failInvariant.ts`, `apps/www/tests/browser/files-sdk.spec.ts`.

Attention.

reviewed by gpt-6.1-sol @xhigh

- warning. Round 4 fixed the admission scan's envelope recognizer a second time, which the panel rule forbids. The build keeps it, since round 5 found nothing against it, and the word revert scan removes it.
- warning. The Yjs step closed while a reader-coverage gap was still logged partial. It is now accepted with the word reader cases.
- warning. The final check did not run as one pass on the settled tree. It ran again in full on the final bytes after the fold.
- warning. The benchmark rows said "no measurable difference" on a loaded host. The claim now says the timing is inconclusive, accepted with the word quiet rerun.
- warning. The census script checks only the 26 renamed values. The guard over the CLI and the registry's examples and blocks now covers the rest.
- warning. Comment-sicko's surrounding code changed while it reviewed. The log now records the slip.

Open work.

- Shared documents written before the Yjs envelope existed (2026-07-22), such as the 53.x `content` layout of `@platejs/yjs`, carry no envelope, so a v54 editor bound under its default root finds its own root empty and can seed beside them. Plate law requires a reader for that shipped format, which is a separate plan. Tracked in `docs/plans/topics/editor-public-naming.md` Open work. owner: zbeyens. stop: a plan for opening 53.x Yjs rooms in v54 is written, or the owner accepts the gap.
- Five task chips from this run wait for the owner: "Find createTestEditor's editable through a ref", "Let @platejs/test import plitejs's handle key", "Remove the any erasure in useRuntime view registration", "Fix readEditorSchemaContract rejecting the www schema" and "Fix external-text browser spec that cannot load". Tracked in `docs/plans/topics/editor-public-naming.md` Open work. owner: zbeyens. stop: each chip's session lands its fix, or the owner dismisses the chip.

## Evidence

Model: claude-opus-5-5 at xhigh effort, the lead alone for the verdict. The plan's design ran an architect arena with three runners and a cross-judge, below.

### Design

The arena gave three runners the outcome and no mechanism. Every value a Plate user, their stored data, their tests or their console can see stops naming Plate or Plite, nothing ships that no one needs, and a guard stops new ones. The runners were gpt-6-astra at xhigh, claude-opus-5-5 at high and gpt-6.1-sol at xhigh. A claude-opus-5-5 cross-judge read the three candidates under anonymous labels and spot-checked their source claims (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/architect/judge/verdict.md`). It scored the Astra and Opus candidates 25 of 30 each and the Sol candidate 20, and picked the Opus candidate as the base. That candidate's guard is the repository's own baselined lint rule, proven on a real past mistake and shipped first, and that candidate found the Yjs type revert.

The plan grafts seven points from the other two: a kept comments `kind`, a constant-only handle key spelled `__EDITOR_BROWSER_HANDLE__`, producer-owned error patterns, one `failInvariant` per package, the dead device setting fixed in place, page keys renamed to the `__EDITOR_*` convention, and a pure DOCX bookmark rename. The lead also names `Symbol.for` keys after the package. The plan drops the base's public `browserHandle` helper, its broad error prefix, its deletion of `kind` and its move of the device lane.

The plan deviates from the judge once, as the lead's own logged call. It does not take the judge's second graft, which escapes only application keys that collide with the binding's. The binding keeps today's exact ownership under new names. That protects application keys that share the prefix, as `plate.md` asks, adds no encode step and changes no runtime cost. The plan panel attacks this choice and the base pick. The synthesis is `docs/plans/artifacts/2026-10-12-editor-public-naming-review/architect/synthesis.md`.

Rejected: the Astra candidate's `prop:` prefix on every application key, the cross-format checker two candidates proposed, removing Plate's name from Plate's own messages, and replacing `failInvariant` with direct throws at about 216 call sites.

The lead ran the base controls on the review commit's tree before the build. They show that the past mistakes hold the literals the guard must flag, the comments spec's wrong-kind case uses `'comments'`, the playwright partition cannot import `platejs/testing` yet, only the runner passes the timeout setting, and a duplicate read id throws (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/controls/base-controls-a2.log`). The Yjs revert fails at the review commit (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/probes/yjs-clone-type-base-a1.log`).

Challenge delta after plan panel round 1: improved. The panel kept the target and its owners and changed five things:

- The guard's scope moved to the three editor packages, because the CLI's `plate` command and the registry's `@plate/<item>` names are permanent keeps that a 90-day exception cannot hold. The guard now also reads `__` protocol names and `process.env` names.
- The Yjs cut gained the default root name and an envelope format bump, so old and new documents refuse each other instead of loading mangled.
- The cut gained the copied UI's stored keys, download names and demo rooms, and the `DOMResolutionError` codes.
- `failInvariant` keeps each package's own root copy instead of a new bridge from platejs to `plitejs/internal`.
- The shipped-values claim narrowed to saved formats, since the CSS variable and `__PLATE_INSTANCES__` shipped in `@platejs/core` 53.x.

Against keeping today's names, the revised target still wins for the same reasons: it removes the branded values users see and fixes the measured revert. The round only added values to remove and a refusal, so nothing it changed weakens that comparison.

Because round 1 improved the winner, the plan replayed architect once (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/replay/task.md`). The same three runners were asked to beat the improved plan or argue for keeping it; all three kept it as the base and proposed point changes. A claude-opus-5-5 cross-judge scored the improved plan 19 of 30 and the best package 25, and recommended eleven changes (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/replay/judge/verdict.md`). The plan takes ten of them:

- An admission preflight scans every top-level schema envelope. The improved plan's refusal only looked under the bound root, so an app on the default root would have found an old room empty and seeded a second tree beside it. All three runners found this.
- One default root, read by both files that held one.
- The whole `yjs:` family is reserved, so the binding can add keys after release without a format bump.
- Every element's `nodeName` is `element`.
- The donor server's unused root setting and JSON debug export go, and the raw example drops its root override.
- `DOMResolutionError.code` goes, since nothing reads it.
- `Symbol.for` keys take job names; the spec reads each capability through the key its public setter writes on a probe renderer; the type-only witnesses become `declare const`.
- Scripts outside the workspace import the handle key from its leaf.
- The guard reads property key declarations and component declarations and covers copied UI; a breach repairs or quarantines instead of reverting to the hand cut.
- The `failInvariant` forwarders and the unused `prism.css` go, and about 11 Plite components are renamed.

The lead deviates from the judge once and logs it as its own call. The plan does not take the judge's recorder change, which matches every `DOMResolutionError` instead of three message families. That change alters what every managed browser suite records, and its own gate is a full browser run. The leaf's message prefixes stay the recorder's patterns, now built into the messages from the same constants.

Rejected from the replay: an asset adapter for CSS, JSON and HTML, because no package asset holds a branded value and the final census greps `apps/www/public` and the registry's JSON; the CLI in the guard, because its `plate` command needs a rule of its own; UUID symbol keys; a `.mjs` leaf; and deployment steps that no repository change performs, which go in this plan and its subject page instead.

Challenge delta after the replay: improved, with the admission preflight, the reserved family, the constant tag, the donor deletions, the `code` deletion, the symbol keys, the wider guard and the deleted forwarders.

Plan panel round 2 reviewed only the changes and raised no critical finding, so no third round runs. Its warnings tightened the plan without changing the target:

- The refusal claim now covers only documents written by the envelope binding, and older 53.x rooms went to Open work.
- The format check moved into `readYjsSchemaEnvelope` and the scan into `assertRoomSchemaForImport`, so both the same-root and the cross-root cases reach code that runs at activation. The refusal proofs compare the full encoded document, because a deletion does not move the state vector.
- The guard reads object keys and class fields but not type signatures, flags `plate` in names only inside plitejs, covers arrow-function components, replays the post-cut `e0c1500b95` caret components, and counts findings against a list frozen before the run.
- The greps exclude the lint fixtures, changesets and kept tooling names.
- The spec tests the renderer capabilities through the public setters, because the getters the replay named do not exist publicly. Each setter marks a probe renderer, and the spec reads the capability under the one symbol that probe carries, so the spec spells no key.

Challenge delta after round 2: improved, with narrower claims and stronger proofs; the target is unchanged.

### Requirements

- Plate apps install and import `platejs`, never `plitejs`, and public docs teach one Plate API; only the Performance comparison and the From Plite to Plate guide name the runtime ([VISION.md](../../VISION.md), Boundary Law; [plate.md](../vision/plate.md), Plate Rules).
- Public identifiers use neutral domain names; exported names do not repeat Plate or Plite branding, and `plitejs` calls its runtime type `Editor` with no branded variants ([plate.md](../vision/plate.md); [plite.md](../vision/plite.md); [common.md](../vision/common.md), Boundary Law).
- DOM output uses `data-editor` and `data-editor-*`; new serialized output uses neutral markers; supported persisted formats keep explicit readers ([plate.md](../vision/plate.md), Plate Rules).
- Names, config keys, persisted fields and output shapes are API surface, worth their long-term compatibility cost ([common.md](../vision/common.md), Taste; [VISION.md](../../VISION.md), Common Essentials).
- Hard cuts over compatibility: no alias, shim or second name ([VISION.md](../../VISION.md), Invariants 1).
- Browser proof instrumentation is opt-in through `installBrowserHandle()` in a test or development entry ([plite.md](../vision/plite.md)).
- The owner's "Ok go all" accepted neutral vocabulary, and the docs audit set "Plite is an internal sublayer"; package names, import specifiers and implementation filenames are not a brand-removal corpus (decision (`2e865a0bc4:docs/research/decisions/editor-public-naming.md`)).

### Findings

Census on this checkout (`6fa1169c5e`), every string literal in `packages/plitejs/src`, `packages/platejs/src` and `packages/test/src` outside tests, with import paths removed: 403 distinct values at 490 sites (`docs/plans/artifacts/2026-10-12-editor-public-naming-review/census-distinct-a1.tsv`). By what a user sees:

- **Saved and synced data.** [attributes.ts](../../packages/plitejs/src/yjs/core/attributes.ts) writes `plite:type`, and [document.ts](../../packages/plitejs/src/yjs/core/document.ts) writes `plite:yjs-hidden`, `plite:yjs-id`, `plite:yjs-virtual-child-id`, `plite:yjs-virtual-placeholder`, `plite-yjs-<scope>-N` ids and a `plite-yjs-virtual-placeholder` element; [set-valued-attributes.ts](../../packages/plitejs/src/yjs/core/set-valued-attributes.ts) adds a `plite:yjs-set:` prefix and [editor-adapter.ts](../../packages/plitejs/src/yjs/core/editor-adapter.ts) a `plite-yjs-selection-root` type. All land in every collaborative document since 2026-06-24 (`b86f5902be`). [BaseCommentsPlugin.ts](../../packages/platejs/src/features/comments/BaseCommentsPlugin.ts) writes and validates `kind: 'plate-comments'`, which the comments docs page, `content/docs/(plugins)/(collaboration)/comment.mdx`, teaches. DOCX export names relationships `rIdPlateComments*` and bookmarks `plate_<id>`.
- **Public contracts and defaults.** [browser-handle.ts](../../packages/plitejs/src/react/editable/browser-handle.ts) sets `element.__pliteBrowserHandle` with an `insertData({ pliteFragment })` field; the key appears in 60 files. [create-editor.ts](../../packages/plitejs/src/create-editor.ts) defaults `editor.id` to `plite-editor-N`, which [plate-controller.mdx](../../content/docs/api/core/plate-controller.mdx) prints. Read descriptor ids such as `plite:transfer.source` are documented as a "stable configuration and diagnostics identity" in [editor.ts](../../packages/plitejs/src/interfaces/editor.ts). Format keys `plite-plain-text` in [data-transfer-format.ts](../../packages/plitejs/src/dom/plugin/data-transfer-format.ts) and `plate:structural-plain-text` in [compilePlateFormats.ts](../../packages/platejs/src/internal/plugin/compilePlateFormats.ts) show in duplicate-key errors. React hoists `<style precedence="plite">` into the document head, and the navigation feedback docs teach a `--plate-nav-feedback-duration` CSS variable.
- **The test package.** [PlateTest.tsx](../../packages/test/src/react/PlateTest.tsx) and [createPlateTestEditor.ts](../../packages/test/src/react/createPlateTestEditor.ts) default the test id to `plite-content-editable`, though the editable renders `role="textbox"` and [dom-locators.ts](../../packages/test/src/playwright/dom-locators.ts) already selects by that role. [clipboard.ts](../../packages/test/src/playwright/clipboard.ts) reads a `PLITE_BROWSER_CLIPBOARD_LOCK_TIMEOUT_MS` setting nothing sets except a pass-through list in `apps/plite/scripts/run-plite-browser.mjs`, plus a `__pliteNativeClipboardPayload_*` page key. A `__plateTrustedTypingTrace` page key breaks the `__EDITOR_*` convention the 09-13 closure set. The device lane's `PLATE_DEVICE_WWW_URL` and `plate-proof` paths sit in `packages/test/src/device/`, which no package export reaches.
- **Error text.** 79 plitejs string literals name Plite, such as `[Plite] initialValue is invalid!` in [initial-value.ts](../../packages/plitejs/src/core/initial-value.ts). Plate re-exports Plite by identity, so a Plate user reads each one. Several name deleted APIs: [use-plite-history.ts](../../packages/plitejs/src/react/hooks/use-plite-history.ts) says `usePliteHistory` while [react/index.ts](../../packages/plitejs/src/react/index.ts) exports `useEditorHistory`; [use-plite-child-root.ts](../../packages/plitejs/src/react/hooks/use-plite-child-root.ts) says `usePliteChildRoot` for `useChildRoot`; [use-editor-context.tsx](../../packages/plitejs/src/react/hooks/use-editor-context.tsx) says `<Plite>` for `EditorRoot`. Seven `failInvariant.ts` copies in platejs, such as [this one](../../packages/platejs/src/internal/failInvariant.ts), and two in plitejs throw `Plite invariant failed`. 297 platejs strings name Plate in its own messages; that is the installed product naming itself.
- **Recurrence.** Dated by first `git log -S`: `plate-comments` 2026-09-18, `plate:structural-plain-text` 2026-09-27, `PLATE_DEVICE_WWW_URL` 2026-10-03 and `precedence="plite"` 2026-10-08 all landed after the 2026-09-13 hard cut, the last after the 10-04 Pursue.
- **No saved format shipped.** `npm view` on 2026-10-12: the 54 betas of `platejs` and `@platejs/core` were published on 2026-06-16 and 2026-06-17, and every later `@platejs/*` and `platejs` release is a 53.x version from `main`; `plitejs@0.0.1` is 3 files and 2,571 bytes, published 2026-08-26; `@platejs/test` is E404. `platejs` is a nine-file package that re-exports `@platejs/*`, so its own size says nothing. The Yjs keys first appear on 2026-06-24 and the comments label on 2026-09-18, after the last 54 beta. A plan panel seat grepped the `@platejs/core` 53.3.15 and 54.0.0-beta.1 tarballs and found `--plate-nav-feedback-duration` and `__PLATE_INSTANCES__` in both; those two values shipped.
- **Blast radius.** File counts per value outside plans, research and generated output are in `docs/plans/artifacts/2026-10-12-editor-public-naming-review/blast-radius-a1.txt`: 60 for the handle key, 15 for `plate-comments`, 12 each for `plite-yjs-` and `Plite invariant failed`, and 8 or fewer for the rest.

### Lanes

- **Keep the values (Stop).** Loses. They are not private identifiers. Collaborative documents and saved comments store them, docs print them, the public test package exposes them, and error text shows them to every Plate user. The cost of keeping them grows with each release, since a supported saved format keeps its reader.
- **The 10-04 target: five values, the root Vision nouns and a guard.** Loses as incomplete. The Vision part already landed. Its census missed the Yjs keys, the largest permanent cost, and the message text. Its own guard would flag both on its first run, so the narrow target cannot ship green.
- **Every observable value, deletion first, plus the guard (chosen).** Each value a user, their stored data, their tests or their console can see gets a neutral name, or goes when nothing needs it. Keeps: package names and import paths, the duplicate-copy counter `__PLATE_INSTANCES__`, which 53.x copies also write, the `platejs.org` link, Plate naming itself in Plate's messages, and raw Plite example pages. Predicted benefits for the plan's Close to mark held or falsified: the census leaves zero `plite` or `plate` tokens in published string values outside the keep list; no message names an API the package does not export; a branded string or protocol name added to plitejs, platejs or `@platejs/test` source fails `pnpm check`.
- **Strongest deletion.** Delete instead of rename where no job survives: the `[Plite]` message prefix (the message states the problem without it) and the clipboard lock timeout setting (nothing sets it). The default test id was a third candidate, since `role="textbox"` already selects the editable, but the harness needs an id to find the editable it rendered, so the build renames it, as the Test package step records. Deleting `editor.id` itself loses, because docs teach it as the editor's identity in controller UI and logs. Deleting the comments `kind` field loses: an empty foreign envelope with only `version`, `threads` and `ranges` passes every other check in `decodeComments`, and replacing comments with it wipes them. Deleting `installBrowserHandle` loses, because `plite.md` names its job.
- **Configurable prefix or dual names.** Loses. It adds a setting or a second dialect for a naming problem, which the adoption already rejected.

### Dependents

- `accessibility`: [use-plite-runtime.tsx](../../packages/plitejs/src/react/hooks/use-plite-runtime.tsx) throws `[Plite]` messages; its text changes, no API.
- `ai`: [failInvariant.ts](../../packages/platejs/src/ai/internal/failInvariant.ts) throws `Plite invariant failed`; its text changes.
- `authored`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `autocomplete`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `basic`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `callout`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `canvas`: [excalidraw.spec.ts](../../apps/www/tests/browser/excalidraw.spec.ts) reads the browser handle key; the test follows the rename.
- `code`: [failInvariant.ts](../../packages/platejs/src/features/code-block/internal/failInvariant.ts) throws `Plite invariant failed`, and two code-block browser specs read the handle key.
- `collaboration`: [attributes.ts](../../packages/plitejs/src/yjs/core/attributes.ts) and the rest of `plitejs/yjs` write the `plite:` document keys; the stored Yjs shape changes.
- `comments`: [BaseCommentsPlugin.ts](../../packages/platejs/src/features/comments/BaseCommentsPlugin.ts) writes and validates the saved `kind`; the saved shape changes.
- `csv`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `date`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `distribution`: [compilePlateFormats.ts](../../packages/platejs/src/internal/plugin/compilePlateFormats.ts) names the `plate:` format keys; the guard also lands in its check list.
- `documents`: [import-toolbar-button.tsx](../../apps/www/src/registry/components/editor/import-toolbar-button.tsx) builds saved comments with the old kind; the copied UI follows the rename.
- `drawing`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `editing`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `external-text`: [external-text-binding.ts](../../packages/plitejs/src/react/editable/external-text-binding.ts) throws messages naming Plite, and two CodeMirror browser specs read the handle key.
- `footnote`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `html`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `layout`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `link`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `list`: unaffected, because its only Plite string sits in a raw Plite example page, which keeps its runtime's name.
- `markdown`: [failInvariant.ts](../../packages/platejs/src/markdown/internal/failInvariant.ts) throws `Plite invariant failed`; its text changes.
- `math`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `media`: [media-caption.spec.ts](../../apps/www/tests/browser/media-caption.spec.ts) reads the handle key; the test follows the rename.
- `mentions`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `pagination`: [react.tsx](../../packages/plitejs/src/pagination/react.tsx) hoists a style with `precedence="plite"` and throws `[Plite]` messages.
- `persistence`: [document-migration.spec.ts](../../apps/www/tests/browser/document-migration.spec.ts) reads the handle key; the test follows the rename.
- `plate-api`: unaffected, because its files hold no branded value and two test titles that say Plite are not user output.
- `proof`: [client.tsx](../../apps/plite/src/app/mobile-lab/client.tsx) reads the handle key, and 47 proof files hold a branded value; scripts and specs follow the rename.
- `react`: [editable-element-placement.tsx](../../packages/plitejs/src/react/components/editable-element-placement.tsx) hoists a style with `precedence="plite"`, and 13 react source files hold strings naming Plite.
- `search`: unaffected, because its only Plite string sits in a raw Plite example page, which keeps its runtime's name.
- `slash`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `styles`: [BaseStylePlugins.ts](../../packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts) throws through its feature's own `failInvariant` copy, whose text is `Plite invariant failed`; the copy goes and its text changes.
- `suggestions`: [suggestion.spec.ts](../../apps/www/tests/browser/suggestion.spec.ts) reads the handle key; the test follows the rename.
- `table`: [failInvariant.ts](../../packages/platejs/src/features/table/internal/failInvariant.ts) throws `Plite invariant failed`, and a table browser spec reads the handle key.
- `toc`: unaffected, because none of its files holds a branded value or a message naming Plite.
- `uploads`: [files-sdk.spec.ts](../../apps/www/tests/browser/files-sdk.spec.ts) reads the handle key; the test follows the rename.

The per-scope counts are in `docs/plans/artifacts/2026-10-12-editor-public-naming-review/dependents-a1.tsv`.

### Reconciled reviews

- This review supersedes `2026-10-04-editor-public-naming-audit`. Its direction stands, but its census missed the Yjs keys and the message text, and its root Vision finding has landed.
- This review retains `2026-09-13-editor-public-naming-closure-audit` as superseded history through the 10-04 review; its fixes (the `editorSelection` field, `__EDITOR_*` globals, JSDoc and declaration provenance) are still live.
- This review retains `2026-09-18-recovered-2026-09-12-editor-public-naming-adoption`, because its export names, DOM vocabulary and codecs are live and unchanged.
- This review retains `2026-09-18-recovered-2026-09-12-plate-public-docs-audit`, because public docs still teach only Plate outside the two named pages.
- This review retains the decision page (`2e865a0bc4:docs/research/decisions/editor-public-naming.md`), whose Pursue conclusion this verdict keeps.

### Proof limits

The verdict read source, git history and `npm view` only. The plan then ran the Yjs revert probe and the base controls; no test suite, build or browser ran. The census reads quoted literals line by line, so a value built across lines, or held in CSS files, JSON fixtures or generated registry output, can escape it. The lead inferred which read ids, runtime plugin names and decoration source ids a user can observe from their JSDoc and did not probe them at runtime. Demo collaboration rooms on any running Hocuspocus server and demo comments saved in browsers hold the old names; the lead inspected no such store. The lead read the other editors' source at the commits in the front matter and ran none of them.
