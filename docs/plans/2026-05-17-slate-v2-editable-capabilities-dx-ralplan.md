# Slate v2 editable capabilities DX ralplan

Date: 2026-05-17
Status: done
Owner: Slate Ralplan planning only
Execution owner: `ralph` in `../slate-v2`
Completion id: `019e1fc0-dba0-7de1-9236-b484a144cda6`
Score: 0.93, closed for Ralph execution

## Verdict

`capabilities` comes from the core extension registry. It was introduced as a
generic runtime bucket for extension-provided mounted handles/providers, and it
also feeds typed `editor.api.*` installed handles.

That architecture is valid internally. It is not acceptable as first-party app
authoring DX.

Hard answer:

- Keep internal capabilities as the substrate.
- Remove `editableKeyCommands(...)` as public example/documentation DX.
- Do not remove extension-owned keyboard behavior.
- Do not regress back to raw `<Editable onKeyDown>` for reusable editor
  behavior.
- Replace public capability-spread authoring with typed package facets on the
  same `defineEditorExtension(...)` object.
- Tighten generic installed handles toward public `api` authoring and internal
  provider storage. Public examples should not write `capabilities`.

The bad part is not only `editableKeyCommands`. The public shape:

```ts
capabilities: {
  ...editableRenderers(...),
  ...editableKeyCommands(...),
  'clipboard.insertData': handler,
}
```

is registry plumbing exposed as product syntax. That is why the example needs:

```ts
const iframeEditor = editor as unknown as CustomEditor
```

That cast is the DX failure in one line.

## Current source

| Surface | Current source | Finding |
| --- | --- | --- |
| Core extension output | `../slate-v2/packages/slate/src/interfaces/editor.ts:1292-1305`, `:1308-1331` | `EditorExtension` and `register(...)` outputs both expose `capabilities?: Record<string, unknown \| readonly unknown[]>`. |
| Capability registration | `../slate-v2/packages/slate/src/core/editor-extension.ts:347-405` | Core loops through `slots.capabilities` and registers every named value into the extension registry. |
| Runtime registry | `../slate-v2/packages/slate/src/core/extension-registry.ts:31-43`, `:169-196` | `capabilities` are stored as `Map<string, unknown[]>`; ordered providers and installed handles share the same generic bucket. |
| Public `editor.api` | `../slate-v2/packages/slate/src/create-editor.ts:813-865` | `editor.api.<name>` is a proxy over registered capabilities; `editor.getApi(extension)` also resolves from extension capability names. This is the right public place for installed runtime handles. |
| Public key helper | `../slate-v2/packages/slate-react/src/editable/editable-key-commands.ts:7-23` | `editableKeyCommands(...)` returns a magic-key record: `'slate-react.editable.keyCommand' -> commands`. |
| Key helper consumption | `../slate-v2/packages/slate-react/src/editable/editable-key-commands.ts:28-35`, `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts:125-149` | Slate React reads the capability registry and calls each command with `{ editor, event, selection }`. |
| Public renderer helper | `../slate-v2/packages/slate-react/src/editable/editable-renderers.ts:14-81` | `editableRenderers(...)` has the same public-helper-over-registry shape. |
| Export surface | `../slate-v2/packages/slate-react/src/index.ts:73-89` | `EDITABLE_KEY_COMMAND_CAPABILITY`, `editableKeyCommands`, `EDITABLE_RENDERERS_CAPABILITY`, and `editableRenderers` are public exports. |
| Example failure | `../slate-v2/site/examples/ts/iframe.tsx:94-120` | First-party example spreads render/key capability helpers and casts `editor` to `CustomEditor`. |
| More example failure | `../slate-v2/site/examples/ts/richtext.tsx:293-330` | Richtext repeats the same shape and casts because the handler sees only `ReactEditor`. |
| Test locking current bad DX | `../slate-v2/packages/slate-react/test/surface-contract.tsx:459-468` | Contract test explicitly expects examples to use `editableKeyCommands` and not raw `onKeyDown`. It locks the wrong public helper, even though the intent is right. |

## Why the current API happened

The previous architecture direction correctly separated:

- replayable model reads/writes: `editor.read((state) => ...)` and
  `editor.update((tx) => ...)`
- mounted/browser/runtime handles: `editor.api.<name>`
- extension installation: `extensions: [...]`

The unified extension plan already says mounted DOM/React APIs belong to
installed capabilities rather than `state` / `tx` or editor root namespaces
(`docs/plans/2026-05-16-slate-v2-unified-extension-composition-ralplan.md:515-545`).

The implementation took that correct substrate and exposed it too directly in
examples. Public examples should teach editor features, not registry records.

## Absolute-best target

Keep one extension declaration. Do not make app authors choose between
`defineEditorExtension`, `defineEditableExtension`, raw `<Editable>` props, and
capability helper spreads.

Target first-party authoring shape:

```ts
const iframe = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'iframe',
    editable: {
      renderers: {
        elements: {
          paragraph: ParagraphElement,
        },
        leaves: {
          bold: BoldLeaf,
          code: CodeLeaf,
          italic: ItalicLeaf,
          underline: UnderlineLeaf,
        },
      },
      keymap: {
        'mod+b': { kind: 'toggle-mark', mark: 'bold' },
        'mod+i': { kind: 'toggle-mark', mark: 'italic' },
        'mod+u': { kind: 'toggle-mark', mark: 'underline' },
        'mod+`': { kind: 'toggle-mark', mark: 'code' },
      },
      onCommand(command, { editor }) {
        if (command.kind !== 'toggle-mark') return

        toggleMark(editor, command.mark)
        return true
      },
    },
  })
```

Target image-style shape:

```ts
const image = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'image',
    elements: [{ type: 'image', void: 'editable-island' }],
    editable: {
      keymap: {
        'mod+a': { kind: 'select-all' },
      },
      renderers: {
        elements: {
          paragraph: Paragraph,
        },
        voids: {
          image: ({ element }) => <Image element={element} />,
        },
      },
    },
    clipboard: {
      insertData(data, { editor, next }) {
        const text = data.getData('text/plain')
        const imageFiles = Array.from(data.files ?? []).filter((file) =>
          file.type.startsWith('image/')
        )

        if (imageFiles.length === 0 && !isImageUrl(text)) {
          return next()
        }

        editor.update((tx) => {
          // app-specific insert logic
        })

        return true
      },
    },
  })
```

Raw escape hatch remains available, but it stops being the first-party feature
path:

```tsx
<Editable
  onKeyDown={(event, { editor }) => {
    // UI-only or truly custom browser behavior.
  }}
/>
```

## Public architecture change

Replace public generic capability authoring with typed extension facets.

Core type target:

```ts
export interface EditorExtensionFacets<
  TEditor extends BaseEditor<any> = Editor,
> {}

export type EditorExtension<
  TEditor extends BaseEditor<any> = Editor,
  TOptions = unknown,
> = EditorExtensionCore<TEditor, TOptions> &
  EditorExtensionFacets<TEditor>
```

`slate-react` augments the extension facets:

```ts
declare module 'slate' {
  interface EditorExtensionFacets<TEditor extends BaseEditor<any>> {
    editable?: EditableExtensionFacet<TEditor>
  }
}
```

`slate-dom` augments the extension facets:

```ts
declare module 'slate' {
  interface EditorExtensionFacets<TEditor extends BaseEditor<any>> {
    clipboard?: ClipboardExtensionFacet<TEditor>
  }
}
```

The runtime may still compile these facets into internal capabilities. That is
an implementation detail. Public authoring should not mention capability names
or spread helpers.

Generic installed handles need the same cleanup. If an extension intentionally
exposes `editor.api.<name>`, the public authoring word should be `api`, not
`capabilities`:

```ts
const dom = () =>
  defineEditorExtension({
    name: 'dom',
    api: {
      clipboard: (context) => createClipboardApi(context),
      dom: (context) => createDomApi(context),
    },
  })
```

Internal ordered provider lists may still use the registry machinery, but they
should not be the normal public app syntax. In other words:

- public reusable feature authoring: `editable`, `clipboard`, `elements`,
  `transforms`, `state`, `tx`
- public installed runtime handles: `api`, read as `editor.api.<name>`
- internal ordered provider storage: private registry, currently implemented by
  capabilities
- escape hatch for package authors: `register(context)` may return private
  provider output, but examples/docs should not teach raw string capability keys

## Keyboard behavior target

Use three layers, in this order:

1. `editable.keymap`: hotkey-to-semantic-command mapping for reusable editor
   behavior.
2. `editable.onCommand`: semantic behavior execution for commands that raw
   Slate cannot default safely, such as custom marks or custom blocks.
3. `editable.onKeyDown`: last-resort extension escape hatch for browser/UI
   quirks that cannot be represented as an editable command.

This preserves the good intent from the current implementation: feature-owned
behavior should live with the extension, not in scattered `<Editable onKeyDown>`
props.

It also removes the bad part: event-callback registry helpers with weak editor
typing.

## Rejected alternatives

| Option | Decision | Why |
| --- | --- | --- |
| Keep `editableKeyCommands` and add `<CustomEditor>` generic | Reject | It fixes the cast but keeps registry syntax and raw event callbacks as the public model. This is a bandage on the wrong API. |
| Remove extension key handling and use only `<Editable onKeyDown>` | Reject | That regresses composability and recreates the old scattered example glue. Raw props stay escape hatches, not feature packaging. |
| Put `onKeyDown` directly on core `EditorExtension` | Reject | React event types do not belong in core `slate`. The field must be a `slate-react` facet. |
| Add only `defineEditableExtension(...)` | Reject as canonical | Better than capability spreads, but it creates another extension definition path and breaks the "one extension owns one feature" story when the same feature also has `elements`, `clipboard`, `state`, or `tx`. It can exist as a convenience later, but not as the primary architecture. |
| Rename `capabilities` to `api` and call it done | Reject | Some current capability uses are ordered providers, not public installed handles. The fix is to split author-facing facets from internal registry storage. |

## Maintainer Objection Pass

Pass status: complete.

| Objection | Harsh read | Decision |
| --- | --- | --- |
| "`editable` and `clipboard` facets are Plate plugins sneaking into Slate." | Valid fear, wrong conclusion. A facet is not a product plugin if it stays tiny, package-owned, and typed around Slate primitives. Slate already has `elements`, `transforms`, `queries`, `normalizers`, `state`, and `tx`; package facets are the same extension object, not Plate's plugin config system. | Keep facets, but restrict them to package-owned low-level surfaces. No `plugins`, no product rules DSL, no target/priority zoo in raw Slate. |
| "Core `EditorExtension` should not know React or DOM fields." | Correct. Core must not import React or DOM handler types. | Use declaration-mergeable `EditorExtensionFacets<TEditor>` and let `slate-react` / `slate-dom` augment it. Core stays dependency-free. |
| "`capabilities` is still public on `EditorExtension`, so the bad DX will survive." | Correct. This is the real gap in the first draft. If public examples can still write capability string maps, authors will copy that. | Revise target: public installed handles use `api`; package provider facets use named slots such as `editable`. Raw `capabilities` becomes internal/advanced, removed from examples/docs, and ideally no longer part of normal public `EditorExtension` object authoring. |
| "`editable.onKeyDown` just renames `editableKeyCommands`." | Mostly correct if examples use it. The event callback is only acceptable as a last-resort extension hook, not the primary feature API. | Primary path is `editable.keymap` plus `editable.onCommand`. First-party examples should not use `editable.onKeyDown` unless a browser/UI case cannot be modeled as a command. Add a contract test for that. |
| "Keymap plus `onCommand` is too much ceremony for bold." | It is more code for one hotkey, but it scales better. Hotkey parsing, command classification, and behavior execution are separate concerns. | Keep it. Provide small helpers later only if repeated examples prove boilerplate. Do not return to raw DOM key callbacks for marks. |
| "This could break the existing #4613 clipboard improve claim." | It must not. `clipboard.insertData` facet authoring is a DX wrapper over the existing insertData handler pipeline, not a new behavior claim. | Preserve #4613 as-is. Ralph must keep existing clipboard tests green and not broaden PR claims. |
| "Module augmentation can be surprising in TypeScript." | True, but less surprising than two extension constructors plus string-key registries. Imported packages already define their own public types. | Accept. Add negative type tests proving `editable` exists when `slate-react` types are present and does not pollute core-only authoring. |

Maintainer verdict:

The best shape survives, with one tightening: do not leave `capabilities` as the
normal public word. The final target is:

```ts
defineEditorExtension<CustomEditor>()({
  name: 'image',
  elements: [{ type: 'image', void: 'editable-island' }],
  editable: {
    keymap: {
      'mod+a': { kind: 'select-all' },
    },
    renderers: {
      voids: {
        image: ImageElement,
      },
    },
  },
  clipboard: {
    insertData(data, { editor, next }) {
      // feature-owned paste behavior
    },
  },
})
```

Not:

```ts
defineEditorExtension({
  capabilities: {
    ...editableKeyCommands(...),
    ...editableRenderers(...),
    'clipboard.insertData': handler,
  },
})
```

And not:

```tsx
<Editable onKeyDown={featureBehavior} />
```

unless the behavior is app-local UI or a real browser escape hatch.

## Public surface cuts for Ralph

Hard cut these from first-party docs/examples:

- `capabilities: { ...editableKeyCommands(...) }`
- `capabilities: editableRenderers(...)`
- public import of `EDITABLE_KEY_COMMAND_CAPABILITY`
- public import of `EDITABLE_RENDERERS_CAPABILITY`
- public docs that teach capability key strings
- example casts from `ReactEditor` to `CustomEditor`

Do not necessarily delete the internal capability constants in the same first
commit. The implementation can keep private registry names while the public
surface moves to `editable` / `clipboard` facets.

## Type contract

Ralph must add negative type proof:

- `editable.onCommand` receives the typed `CustomEditor`, not plain
  `ReactEditor`.
- `editable.onKeyDown` receives the typed `CustomEditor`, if used.
- `editable.renderers.elements.paragraph` receives only the paragraph element
  variant.
- invalid `keymap` mark keys fail for custom text types.
- invalid `keymap` block types fail for known custom element types when the
  command is block-specific.
- `enabled: false` extensions do not contribute `editor.api` or facet-derived
  types.
- raw capability string lookup remains non-public.

The key example test should assert the positive shape too:

```ts
defineEditorExtension<CustomEditor>()({
  name: 'typed-hotkeys',
  editable: {
    keymap: {
      'mod+b': { kind: 'toggle-mark', mark: 'bold' },
    },
    onCommand(command, { editor }) {
      const custom: CustomEditor = editor

      if (command.kind === 'toggle-mark') {
        toggleMark(custom, command.mark)
        return true
      }
    },
  },
})
```

## Example rewrite target

Rewrite first-party examples away from public capability helpers:

| Example | Current public DX | Target |
| --- | --- | --- |
| `iframe.tsx` | `editableRenderers(...)` + `editableKeyCommands(...)` with `CustomEditor` cast | `editable.renderers` + `editable.keymap` + `editable.onCommand` |
| `richtext.tsx` | mixed renderers, key commands, HTML paste, custom casts | one `richtext()` extension with `editable.renderers`, `editable.keymap`, `editable.onCommand`, and package facet for clipboard/paste if still needed |
| `images.tsx` | key command helper + renderer helper + string `clipboard.insertData` capability | `editable.keymap`, `editable.renderers`, and `clipboard.insertData` facet |
| `code-highlighting.tsx` | key command callback over DOM event | command/keymap facet for semantic code commands; raw `onKeyDown` only where code editor browser behavior truly cannot be modeled |

## Issue accounting

No fixed issue claim yet.

Related issue/accounting pass is complete:

- #3177 render/plugin composition: related. This plan strengthens the same
  feature-owned composition direction, but no fixed/improved claim until source,
  examples, type contracts, and docs land.
- #5961 onKeyDown render warning: not claimed. This is a stale repro row; do
  not claim runtime repair without a current failing route.
- #4613 clipboard customization: related only if the `clipboard` facet is
  executed. No claim in this planning pass.

## Research position

External-editor mechanism to steal:

- ProseMirror: plugin props are aggregated internally; users do not write
  registry key strings.
- Lexical: keyboard behavior routes through commands rather than app-owned raw
  DOM event parsing for model behavior.
- Tiptap: feature authors define extension methods like keyboard shortcuts,
  commands, node views, and paste/input rules together.

Slate v2 should steal the mechanism, not the whole product API:

- keep raw Slate lower-level than Tiptap
- keep core `slate` React-free
- keep `Editable` raw props as escape hatches
- make feature-owned behavior live on the extension object
- hide registry storage from public examples

## Related Issue And Research Sync Pass

Pass status: complete.

No fixed issue claim is added by this planning pass.

Issue sync:

| Issue | Current ledger state | Pass decision |
| --- | --- | --- |
| #3177 render/plugin composition | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:594`, `docs/slate-v2/ledgers/issue-coverage-matrix.md:208`, and `docs/slate-v2/ledgers/fork-issue-dossier.md:6504-6537` already mark it related/planning-reviewed. | Keep related only. This plan strengthens the feature-owned composition direction by replacing public capability helper spreads with typed extension facets, but it still needs source edits, examples, type contracts, and docs before any improve/fix claim. |
| #5961 onKeyDown render warning | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:39` and `docs/slate-issues/open-issues-ledger.md:496` mark it triage-closed/stale-candidate and require a current repro before v2 priority. | Keep not claimed. Removing public key-command callback DX might reduce raw event misuse, but this plan does not reproduce or fix the reported DevTools render warning. |
| #4613 extensible insertData | `docs/slate-v2/ledgers/issue-coverage-matrix.md:263` and `docs/slate-v2/ledgers/fork-issue-dossier.md:3953-3982` already carry an improves claim for typed clipboard capability handlers. | Preserve existing improve claim, do not broaden it. The proposed `clipboard.insertData` facet is an authoring-DX refinement over the same capability substrate, not a new clipboard behavior claim. |

Research sync:

| Evidence | Finding | Pass decision |
| --- | --- | --- |
| `docs/plans/2026-05-14-slate-v2-keydown-command-coverage-ralplan.md:153-166` | Prior command review already chose semantic command/keymap registration over scattered raw DOM event parsing, while keeping Slate lower-level than Tiptap. | Reuse. The new plan corrects the public helper shape, not the command direction. |
| `docs/research/sources/editor-architecture/node-text-mark-render-dx-corpus-ledger.md:176-198` | Tiptap has the strongest extension package DX: commands, shortcuts, input rules, paste rules, render hooks, and schema config live together. | Steal packaging cohesion, not Tiptap's full product layer or React NodeView mechanics. |
| `docs/plans/2026-05-16-slate-v2-unified-extension-composition-ralplan.md:515-545` | Mounted/browser APIs belong to installed capability handles and should not enter replayable `state` / `tx`. | Keep capability substrate internal; expose authoring through package facets and installed handles. |

Ledger sync performed:

- Added a fork issue dossier section for this plan.
- Added #5961 to the issue coverage matrix as related/not claimed.
- Updated #3177 evidence to include this plan.
- Updated PR reference wording so `editableKeyCommands(...)` /
  `editableRenderers(...)` are no longer described as the accepted final public
  DX; extension-owned behavior remains accepted, public capability helper
  spreads do not.

## Verification plan

Planning-only current pass did not edit `../slate-v2`.

Ralph execution gates:

1. Source/type contract:
   - update `EditorExtension` typing for package facets
   - add `slate-react` and `slate-dom` facet type augmentation
   - type-level negative tests for typed editor inference, invalid marks, and
     disabled extensions
2. Runtime:
   - facet registration compiles to existing internal capability registry or a
     split private provider registry
   - preserve extension ordering and latest-extension-wins behavior
   - preserve direct `<Editable>` prop override/escape-hatch behavior
3. Public surface:
   - remove `editableKeyCommands` from public docs/examples
   - remove `editableRenderers` from public docs/examples if the facet replaces
     it
   - stop exporting public capability constants from `slate-react`
   - remove `capabilities` from first-party app/example authoring
   - add public `api` authoring for installed runtime handles if generic handle
     authoring must remain public
4. Example proof:
   - `iframe.tsx`, `richtext.tsx`, `images.tsx`, `code-highlighting.tsx`
   - no `as unknown as CustomEditor` casts for key/render authoring
   - no first-party `editable.onKeyDown` unless the example records why command
     modeling cannot express it
5. Commands:
   - `cd ../slate-v2 && bun --filter slate-react test:vitest -- surface-contract keyboard-input-strategy-contract generic-react-editor-contract`
   - `cd ../slate-v2 && bun --filter slate-react typecheck`
   - `cd ../slate-v2 && bun --filter slate-dom test`
   - `cd ../slate-v2 && bun check`

## Closure Final Gates

Pass status: complete.

Closure assertions:

- Current-state read and verdict is complete.
- Related issue/research sync is complete.
- Maintainer objection pass is complete.
- No pass row remains pending with a runnable planning move.
- No `../slate-v2` implementation, test, example, package, build, or config file
  was edited by this Slate Ralplan.
- No new fixed/improved issue claim was added.
- #3177 stays related/planning-reviewed.
- #5961 stays not claimed.
- #4613 existing improve claim is preserved but not broadened.
- Ralph execution has concrete target shapes and verification commands.

Final handoff status: complete.

Ralph execution summary:

1. Replace first-party public authoring that writes `capabilities` with typed
   package facets such as `editable` and `clipboard`.
2. Keep internal provider/registry storage private or advanced; do not teach raw
   capability strings in examples/docs.
3. Add public `api` authoring for installed runtime handles if generic handle
   authoring remains public, read through `editor.api.<name>`.
4. Remove `editableKeyCommands(...)` / `editableRenderers(...)` from public
   examples/docs once facets replace them.
5. Prefer `editable.keymap` plus `editable.onCommand`; use
   `editable.onKeyDown` only as a justified last-resort escape hatch.
6. Preserve extension ordering, latest-extension-wins, disabled-extension type
   exclusion, and existing clipboard behavior claims.
7. Add negative type tests for typed editor inference, invalid mark/block keys,
   disabled extension output exclusion, and no public raw capability lookup.

## Pass state

| Pass | Status | Evidence | Result | Next |
| --- | --- | --- | --- | --- |
| Current-state read and verdict | complete | Live source rows above. | `capabilities` is valid internal substrate but bad public authoring DX; replace with typed extension facets. | Related issue/research sync. |
| Related issue/research sync | complete | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:39`, `:594`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:208`, `:263`; `docs/slate-v2/ledgers/fork-issue-dossier.md:3953-3982`, `:6504-6537`; research rows above. | #3177 stays related, #5961 stays not claimed, #4613 existing improve claim is preserved but not broadened; research supports extension-facet authoring over public registry helper spreads. | Maintainer objection pass. |
| Maintainer objection pass | complete | Maintainer objection table above. | Facets survive, but generic installed handles should use public `api` authoring and raw `capabilities` should leave normal app/example DX. `editable.onKeyDown` is demoted to last-resort and should not appear in first-party examples without explicit justification. | Closure gates. |
| Closure gates | complete | Closure final gates section above. | Plan is ready for Ralph execution; completion file may be marked `done`. | none |
