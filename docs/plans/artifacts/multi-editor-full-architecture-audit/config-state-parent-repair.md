# A1 repair — immutable plugin options and editor-local session

Status: decision-ready correction to the parent A1 dossier  
Scope: planning only; do not edit the parent plan or product source  
Priority: P0  
Primary execution owner: `plate-plan`  
Public-shape owner: `best-api`  
Plite dependency: none

## Exact parent-plan patch checklist

Apply these corrections to
`docs/plans/2026-07-25-multi-editor-full-architecture-audit.md` when the parent
audit is assembled:

| Parent location                      | Required correction                                                                                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rank row `A1`, line 443              | Keep P0 and `best-api → plate-plan`. Replace the conditional `plite-plan` dependency with `none`. Runtime plugin reconfiguration is not part of A1.                                                                                               |
| Dependency statement, line 454       | Remove `A1 → Plate adoption of A2`. A1 is independently valuable; the pressure review separately defers A2.                                                                                                                                       |
| Evidence, lines 464–470              | Preserve the two-truth diagnosis. Refresh the live census from 166 mutation lines / 40 files to **169 calls / 42 files** in the current checkout.                                                                                                 |
| Proposed public shape, lines 498–549 | Keep the established noun `options`; replace `config` with readonly `options`. Declare editor-local state with a per-editor `session: () => state` initializer. Remove declared session selectors and any public runtime reconfiguration example. |
| Internal shape, lines 551–585        | Keep one frozen descriptor options graph. Replace the mixed options store with a private session registry. Do not add a duplicate configuration map or revision API. Preserve `PluginConfig.state` as state-bound read groups.                    |
| Closure table, lines 587–596         | Replace the raw adopter list with the complete mutation-family ledger below. Add top-level selector deletion/adoption and fixed-after-publication options proof.                                                                                  |
| Donor conclusion, lines 598–601      | Keep the conclusion, but say A1 is better because it combines immutable Plate compilation with a private editor-local session owner; it does not import donor reconfiguration machinery.                                                          |

This artifact supersedes the public `editor.update.plugins.reconfigure(...)`
proposal in `config-state-proposal.md`. No current Plate product job justifies
that API. If one appears later, it requires a separate `best-api` decision and
atomic `plate-plan`/`plite-plan` packet.

## Final verdict

Plate's current `options` value has two incompatible jobs:

1. immutable plugin configuration consumed by schema, codecs, parser tables,
   API factories, and runtime compilation;
2. mutable editor-local UI, async-process, and runtime-handle state.

The live implementation publishes a frozen descriptor options graph, then
creates a second mutable Zustand copy:

- public mutation surface:
  `packages/core/src/lib/plugin/PluginConfig.ts:458-492`;
- frozen descriptor snapshot:
  `packages/core/src/internal/plugin/resolvePlugins.ts:405-438`;
- second store for every plugin:
  `packages/core/src/internal/plugin/resolvePlugins.ts:621-652`;
- store typed over `InferOptions`:
  `packages/core/src/internal/plugin/pluginOptionsStore.ts:10-16`;
- schema reads descriptor options:
  `packages/core/src/internal/plugin/compilePlateModel.ts:275-329`;
- HTML parsing reads the mutable store:
  `packages/core/src/internal/plugin/prepareHtmlRegistry.ts:42-69`;
- portal writes only the store:
  `packages/core/src/lib/plugin/getEditorPlugin.ts:235-299`.

The target has one rule:

- `options` are immutable and fixed after descriptor publication;
- `session` is mutable, editor-local, non-document, non-history,
  non-collaborative, and non-serialized;
- anything else moves to its actual document, field/effect, application,
  provider, or call-local owner.

Do not rename `options` to `config`. Current Plate doctrine explicitly puts
parameters in `options` (`docs/vision/plate.md:48,86`). Do not name mutable
storage `state`: Plite owns editor/document state, and
`PluginConfig.state` already means state-bound read groups.

## Complete live mutation classification

### Census

The bounded scan includes production `.ts`/`.tsx` under `packages/**` and
`apps/www/**`, excluding specs, tests, slow tests, `__tests__`, and type tests:

```sh
rg -n '\bsetOptions?\(' packages apps/www \
  --glob '*.{ts,tsx}' \
  --glob '!**/*.spec.*' \
  --glob '!**/*.test.*' \
  --glob '!**/*.slow.*' \
  --glob '!**/__tests__/**' \
  --glob '!**/type-tests/**'
```

Current result: **169 calls across 42 files**. The classification below accounts
for all 169.

| Final owner                |   Calls | Current writes                                                                                          | Required adoption                                                                                                                          |
| -------------------------- | ------: | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Editor-local session       |     154 | UI interaction, async progress, temporary buffers, runtime handles, and the synthetic fan-out benchmark | Move declaration to `session`, writes to `plugin.session.set`, reads to `session.get` or `usePluginSession`.                               |
| Application/provider state |      10 | Eight `discussions` writes; live `chatOptions` and `completeOptions` settings writes                    | Move discussions and live AI settings to app/provider state. Plugin options keep only stable authoring inputs or stable service callbacks. |
| Plite field/effect         |       2 | Copilot `suggestionNodeId` / `suggestionText` patches                                                   | Delete duplicated option keys; read the existing `copilotSuggestionField` and update it through `copilotSuggestionEffect`.                 |
| Immutable options          |       1 | Codec proof mutates `label`                                                                             | Replace with separate statically configured descriptor/editor proof. It must not become session state.                                     |
| Call-local runtime input   |       2 | DOM auto-scroll saves, overwrites, then restores plugin options                                         | Pass the override through the existing `tx.dom.autoScroll(fn, options)` call/private call stack.                                           |
| Document state             |       0 | No current mutation call belongs in document JSON                                                       | Keep zero. Do not persist UI state to make migration easier.                                                                               |
| **Total**                  | **169** |                                                                                                         |                                                                                                                                            |

### Session calls: 154

Every session call is covered by these bounded families:

| Session family        |   Calls | Complete owners                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selection UI          |      36 | `packages/selection/src/react/BlockMenuPlugin.tsx` (4), `BlockSelectionPlugin.tsx` (8), `CursorOverlayPlugin.tsx` (2), `components/BlockSelectionAfterEditable.tsx` (3), `hooks/useBlockSelectable.ts` (1), `hooks/useSelectionArea.ts` (5), `internal/api/moveSelection.ts` (2), `internal/api/setSelectedIds.ts` (4), `internal/api/shiftSelection.ts` (4), `transforms/duplicateBlockSelectionNodes.ts` (1), `transforms/insertBlocksAndSelect.ts` (1), `utils/selectInsertedBlocks.ts` (1) |
| Drag UI               |      23 | `packages/dnd/src/DndPlugin.tsx` (12), `hooks/useDragNode.ts` (4), `transforms/onHoverNode.ts` (5), `apps/www/src/registry/ui/block-draggable.tsx` (2)                                                                                                                                                                                                                                                                                                                                         |
| Floating link UI      |      14 | `packages/link/src/react/FloatingLink.tsx` (2), `LinkPlugin.tsx` (8), `useFloatingLink.ts` (4)                                                                                                                                                                                                                                                                                                                                                                                                 |
| Comment/suggestion UI |      19 | registry `comment-kit.tsx` (4), `suggestion-kit.tsx` (2), `comment-node.tsx` (3), `mode-toolbar-button.tsx` (2), `suggestion-node.tsx` (7), `suggestion-toolbar-button.tsx` (1)                                                                                                                                                                                                                                                                                                                |
| Navigation feedback   |       2 | `packages/core/src/react/plugins/navigation-feedback/transforms/flashTarget.ts`                                                                                                                                                                                                                                                                                                                                                                                                                |
| Toggle disclosure     |       2 | `packages/toggle/src/lib/BaseTogglePlugin.ts` (1), `packages/toggle/src/react/useHooksToggle.ts` (1)                                                                                                                                                                                                                                                                                                                                                                                           |
| Find/replace UI       |       1 | `apps/www/src/registry/examples/find-replace-demo.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Block placeholder UI  |       5 | `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| AI chat process       |      29 | `packages/ai/src/react/ai-chat/AIChatPlugin.ts` (18), registry `markdown-streaming-demo.tsx` (9), `plugins/ai-kit.tsx` (1), `components/editor/use-chat.ts` `toolName` write (1)                                                                                                                                                                                                                                                                                                               |
| Copilot process       |      14 | `packages/ai/src/react/copilot/CopilotPlugin.tsx`, excluding its two field/effect writes                                                                                                                                                                                                                                                                                                                                                                                                       |
| Upload process        |       5 | `packages/media/src/react/placeholder/PlaceholderPlugin.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Runtime handles       |       2 | `packages/ai/src/react/ai-chat/useAIChat.ts` `aiEditor`; registry `use-chat.ts` `chat` adapter                                                                                                                                                                                                                                                                                                                                                                                                 |
| Session benchmark     |       2 | `apps/www/src/app/dev/editor-perf/page.tsx`; rename the benchmark lane from plugin option to plugin session                                                                                                                                                                                                                                                                                                                                                                                    |
| **Total**             | **154** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

Representative session fields include `selectedIds`, `anchorId`, `dropTarget`,
`draggingId`, `isDragging`, floating-link form state, `streaming`,
`completion`, `abortController`, upload errors/files, temporary AI paths/chunks,
`activeTarget`, `openIds`, and runtime refs/handles.

### Non-session calls: 15

| Current owner                                                                        |  Calls | Current field                        | Final owner and deletion                                                                                                                                          |
| ------------------------------------------------------------------------------------ | -----: | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/www/src/registry/components/editor/use-chat.ts` plus `registry/ui/comment.tsx` |      8 | `discussions`                        | Application discussion store/provider. Document marks retain IDs only. Delete the plugin copy and its discussion selectors.                                       |
| `apps/www/src/registry/components/editor/settings-dialog.tsx`                        |      2 | `chatOptions`, `completeOptions`     | Application AI settings. Stable plugin callbacks/services may consult the app owner; the settings dialog never mutates plugin options.                            |
| `packages/ai/src/react/copilot/CopilotPlugin.tsx:426-440`                            |      2 | `suggestionNodeId`, `suggestionText` | Existing `copilotSuggestionField` plus `copilotSuggestionEffect` at lines 52–72. Delete the duplicate option fields and selector.                                 |
| `apps/www/src/app/(app)/examples/plite/_examples/plate-schema-descriptors.tsx:422`   |      1 | `label`                              | Immutable codec option. Recreate the proof editor with `CodecProofPlugin.configure({ options: { label: 'replacement' } })`; delete the live mutation button/path. |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts:88,113`                              |      2 | auto-scroll option snapshot          | Existing `tx.dom.autoScroll(fn, options)` owns the call-local override. Delete global save/mutate/restore.                                                        |
| **Total**                                                                            | **15** |                                      |                                                                                                                                                                   |

## Exact current public shape

All imports below are current public entrypoints:

```ts
import {
  createPlatePlugin,
  useEditorPlugin,
  usePluginOption,
} from "@platejs/core/react";

type UploadError = Readonly<{ message: string }>;
type UploadConfig = Readonly<{ maxFileCount: number }>;

const PlaceholderPlugin = createPlatePlugin({
  key: "placeholder",
  options: {
    disableFileDrop: false,
    error: null as UploadError | null,
    uploadConfig: { maxFileCount: 5 } satisfies UploadConfig,
    uploadingFiles: {} as Record<string, File>,
  },
  api: ({ getOption, setOption }) => ({
    addFile(id: string, file: File) {
      setOption("uploadingFiles", {
        ...getOption("uploadingFiles"),
        [id]: file,
      });
    },
  }),
});

editor
  .plugin(PlaceholderPlugin)
  .setOption("uploadingFiles", nextUploadingFiles);

const uploadingFiles = usePluginOption(PlaceholderPlugin, "uploadingFiles");

const { getOptions, setOptions } = useEditorPlugin(PlaceholderPlugin);
```

The same inferred object permits schema-bearing configuration and upload
progress to be written through the same API.

## Exact target public shape

### Authoring, portal, and hooks

The target imports only real Plate public owners. `usePluginSession` is the one
new public export:

```ts
import type { InferSession } from "@platejs/core";
import {
  type PlateEditor,
  createPlatePlugin,
  useEditorPlugin,
  usePluginSession,
} from "@platejs/core/react";

type UploadError = Readonly<{ message: string }>;
type UploadConfig = Readonly<{ maxFileCount: number }>;

export const PlaceholderPlugin = createPlatePlugin({
  key: "placeholder",

  // Immutable descriptor configuration.
  options: {
    disableFileDrop: false,
    uploadConfig: { maxFileCount: 5 } satisfies UploadConfig,
  },

  // Pure per-editor initializer. A factory prevents object, Set, ref, or
  // controller identity from leaking between editors.
  session: () => ({
    error: null as UploadError | null,
    uploadingFiles: {} as Record<string, File>,
  }),

  api: ({ options, session }) => ({
    addFile(id: string, file: File) {
      if (
        Object.keys(session.get().uploadingFiles).length >=
        options.uploadConfig.maxFileCount
      ) {
        return;
      }

      session.set(({ uploadingFiles }) => ({
        uploadingFiles: {
          ...uploadingFiles,
          [id]: file,
        },
      }));
    },
  }),
});

const placeholder = editor.plugin(PlaceholderPlugin);

placeholder.options.disableFileDrop; // readonly
placeholder.session.get().uploadingFiles;
placeholder.session.set({ uploadingFiles: nextUploadingFiles });

function UploadProgress() {
  const uploadingFiles = usePluginSession(
    PlaceholderPlugin,
    (session) => session.uploadingFiles
  );
  const { options } = useEditorPlugin(PlaceholderPlugin);

  return (
    <output data-drop-disabled={options.disableFileDrop}>
      {Object.keys(uploadingFiles).length}
    </output>
  );
}
```

The target session contract is one immutable snapshot plus one atomic patch
verb:

```ts
type PluginSessionPortal<S extends object> = Readonly<{
  get(): Readonly<S>;
  set(update: Partial<S> | ((current: Readonly<S>) => Partial<S>)): void;
}>;

type UsePluginSessionOptions<U> = Readonly<{
  editor?: PlateEditor;
  equalityFn?: (left: U, right: U) => boolean;
}>;

declare function usePluginSession<P, U>(
  plugin: P,
  selector: (session: Readonly<InferSession<P>>) => U,
  options?: UsePluginSessionOptions<U>
): U;
```

`PluginSessionPortal` and `InferSession` may be declaration-emitted support
types without becoming top-level documentation concepts. `usePluginSession` is
the only session hook. Omit `options.editor` for the nearest Plate editor; pass
an editor explicitly for an outside-provider owner. Do not add parallel
`useEditorPluginSession`, key-based session hooks, or a raw store export.

`session.set` shallow-merges a patch. Updater callbacks read an immutable
snapshot and return a patch. They do not receive an Immer draft. Collection
updates return a new collection:

```ts
plugin.session.set(({ openIds }) => {
  const next = new Set(openIds);
  next.add(toggleId);

  return { openIds: next };
});
```

### Derived values

Do not move current `selectors` into `session.selectors`.

```ts
// Reactive session derivation.
const isOpen = usePluginSession(TogglePlugin, ({ openIds }) =>
  openIds.has(toggleId)
);

// Imperative session derivation owned by the plugin API.
const TogglePlugin = createPlatePlugin({
  key: "toggle",
  session: () => ({ openIds: new Set<string>() }),
  api: ({ session }) => ({
    isOpen: (id: string) => session.get().openIds.has(id),
  }),
});
```

State-bound document derivation remains under the existing `read` accumulator.
The current `PluginConfig.state` generic remains its type-level projection; it
is not renamed or repurposed.

### Application-owned live settings

No public runtime plugin-reconfiguration API is introduced:

```ts
import * as React from "react";

import { CopilotPlugin } from "@platejs/ai/react";

type AISettings = Readonly<{
  apiKey: string;
  model: string;
}>;

type CompletionInput = Readonly<{ prompt: string }>;

declare function requestCompletion(
  input: CompletionInput,
  settings: AISettings
): Promise<string>;

function useStableCompletionService(settings: AISettings) {
  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;

  return React.useMemo(
    () => ({
      complete: (input: CompletionInput) =>
        requestCompletion(input, settingsRef.current),
    }),
    []
  );
}

function useEditorPlugins(settings: AISettings) {
  const completion = useStableCompletionService(settings);

  return React.useMemo(
    () => [
      CopilotPlugin.configure({
        options: { completion },
      }),
    ],
    [completion]
  );
}
```

The app mutates `AISettings`; the plugin keeps one stable service capability in
immutable options. This target may require replacing the current
`completeOptions` bag with a domain service in the AI package, but it does not
justify generic live plugin configuration. The same ownership applies to chat
transport. Discussions remain in an app/provider store.

### Call-local DOM input

```ts
editor.update.dom.autoScroll(
  (tx) => {
    tx.nodes.insert(nodes);
  },
  {
    changes: { insertText: false },
    mode: "last",
  }
);
```

The exact existing `tx.dom.autoScroll(fn, options)` API owns these overrides.
The implementation uses a private nested call context and never overwrites
`DOMPlugin.options`.

## Exact target internal types

The clean hard cut removes the selector generic and uses that position for the
session accumulator. Later generic positions, including `State`, retain their
meaning:

```ts
export type PluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  Session = never,
  State = {},
  D extends readonly PluginReference[] = readonly [],
  SchemaModel = never,
  PluginApi = {},
  Enabled extends boolean = boolean
> = {
  key: K;
  api: A;
  pluginApi: PluginApi;
  dependencies?: D;
  enabled?: Enabled;
  options: O;
  session: Session;
  state?: State;
  schemaModel?: SchemaModel;
  tx: Tx;
};

export type InferSession<P> = P extends { session: infer S } ? S : never;

export type PluginSessionFactory<S extends object> = () => S;
```

Every manual `PluginConfig` instantiation must migrate in the same hard cut.
No old fifth-generic selector contract survives under the new meaning.

Descriptor and authoring fragments:

```ts
type PluginBase<C extends AnyPluginConfig> = {
  // Existing descriptor fields omitted.
  readonly options: InferOptions<C>;
  readonly session: [InferSession<C>] extends [never]
    ? null
    : PluginSessionFactory<InferSession<C>>;
};

type RuntimeBasePluginConfig<
  C extends AnyPluginConfig,
  TOptions extends object,
  TSession extends object
> = {
  // Existing authoring fields omitted.
  options?: TOptions & Partial<InferOptions<C>>;
  session?: PluginSessionFactory<TSession>;
};

type PluginSessionContext<C extends AnyPluginConfig> = [
  InferSession<C>
] extends [never]
  ? {}
  : Readonly<{
      session: PluginSessionPortal<InferSession<C>>;
    }>;

type PluginBaseContext<C extends AnyPluginConfig> = Readonly<{
  api: InferOwnApi<C>;
  installed: boolean;
  options: InferOptions<C>;
  read: InferOwnState<C>;
  update: InferOwnTx<C>;
}> &
  PluginSessionContext<C>;
```

`session` is creation-owned. It is available to
`createBasePlugin`/`createPlatePlugin` authoring and inference, but terminal
`.configure()` cannot replace its shape or initializer. Terminal
`.configure({ options })` continues to override immutable parameters.

Private store and registry:

```ts
type PluginSessionStore<S extends object> = {
  getSnapshot(): Readonly<S>;
  set(update: Partial<S> | ((current: Readonly<S>) => Partial<S>)): void;
  subscribe(listener: () => void): () => void;
};

type AnyPluginSessionStore = PluginSessionStore<Record<string, unknown>>;

const PLUGIN_SESSION_STORES = new WeakMap<
  object,
  Map<string, AnyPluginSessionStore>
>();
```

The WeakMap key is `getPlateRuntimeOwner(editor)`, preserving current root-view
sharing and cross-editor isolation. The store implementation remains private;
Zustand may back it, but neither Zustand nor its selector registry appears in
the public contract.

### Candidate and publication lifecycle

1. Resolve plugins and snapshot `plugin.options` once with the existing plain
   data/reference canonicalizer.
2. Build candidate session stores only for descriptors declaring a session
   factory.
3. API/render/handler factories may capture the candidate portal, but session
   writes before successful installation throw.
4. Compile schema, codecs, parser tables, API, and runtime exclusively from the
   frozen `plugin.options`.
5. Publish the Plate model and candidate session registry together only after
   Plite extension initialization succeeds.
6. On failure, discard candidate stores and expose neither options nor session.
7. Root views share the runtime owner's registry. Separate editors receive
   fresh session-factory values.
8. WeakMap ownership plus hook unsubscription releases ordinary session stores
   with the editor. Resourceful services/listeners remain setup/cleanup owners,
   never session-initializer side effects.

There is no configuration revision, options store, runtime configuration
mutation, plugin add/remove lifecycle, or public reconfiguration method in A1.

## Selector hard cut

The mixed option store currently also owns top-level `selectors`. No independent
selector registry job survives:

| Current selector owner            | Target                                            |
| --------------------------------- | ------------------------------------------------- |
| Registry discussion selectors     | App discussion store selectors                    |
| Copilot `isSuggested`             | Existing state field exposed through typed `read` |
| Floating link `isOpen`            | Session hook selector and plugin API              |
| Block selection selectors         | Session hook selector and plugin API              |
| Table `cellIndices`               | Typed state-bound `read`                          |
| Table selection projections       | Existing table API or typed `read`                |
| Toggle open-state selectors       | Session hook selector and plugin API              |
| Block-placeholder target selector | Session hook selector and plugin API              |

Delete `InferSelectors`, selector generics/accumulators,
`__selectorExtensions`, `projectPluginSelectors`, and top-level plugin
`selectors`. This is not replaced with declared `session.selectors`.

## Hard deletions

- `PluginBaseContext.getOption`, `getOptions`, `setOption`, and `setOptions`;
- the same methods on the editor plugin portal;
- `PluginOptionsStore`, `PLUGIN_OPTIONS_STORES`,
  `resolvePluginStores`, and parser store fallback;
- `usePluginOption`, `useEditorPluginOption`, `usePluginOptions`, and
  `useEditorPluginOptions`;
- the top-level selector machinery listed above;
- synthetic `'state'` option reads;
- tests and examples that treat options mutation as model publication;
- the live codec-label mutation proof;
- DOM auto-scroll option save/mutate/restore;
- plugin copies of discussions and live AI settings;
- duplicated Copilot suggestion option fields;
- every compatibility alias or adapter preserving old mutation calls.

Keep:

- `options`, terminal `.configure({ options })`, option schema factories, and
  the existing option snapshot/canonical-reference logic;
- `PluginConfig.state` and `InferState` for state-bound read groups;
- Plite document state, state fields, effects, history, Yjs, and serialization
  owners;
- the existing Plate runtime owner used to share root-view resources.

## Adoption map

### Core

- `PluginConfig.ts`: replace selector generic with session; add
  `InferSession`; make portal options readonly; remove mixed getters/setters.
- `BasePlugin.ts`, `PlatePlugin.ts`, `createBasePlugin.ts`: add creation-owned
  session inference to constructor/extension paths; preserve every remaining
  accumulator and terminal configuration inference.
- `resolvePlugins.ts`: retain option snapshotting; stage/publish only declared
  session stores; delete selector projection and universal stores.
- `getEditorPlugin.ts`: expose direct readonly `options` plus conditional
  session portal.
- `prepareHtmlRegistry.ts`: read installed descriptor options only.
- React store exports: add `usePluginSession`; delete four mixed hooks.
- Runtime publication/disposal: own staged store rollback, root sharing, and
  cleanup.

### Feature packages and app

Execute in mutation-family order:

1. selection, DnD, link, comment/suggestion UI, toggle, navigation,
   find/replace, block placeholder;
2. AI chat, copilot async state, uploads, runtime handles;
3. Copilot field/effect deduplication;
4. discussions and AI settings app ownership;
5. DOM call-local override;
6. codec proof and performance benchmark;
7. all configuration-only readers in schema, codecs, Yjs, list, table, media,
   code block, and Markdown;
8. selector-owner migrations, docs, examples, fixtures, exports, and type
   tests.

## Proof contract

### Type proof

- `options` is readonly in schema, codec, API, handler, render, extension, and
  portal contexts.
- A declared session factory infers its complete state without annotations or
  casts.
- A plugin without `session` has no `.session` portal member.
- `usePluginSession` infers selector input/output and rejects unknown keys.
- Schema callbacks receive options but no session.
- Terminal `.configure` cannot replace session.
- `PluginConfig.state`/`InferState` read-group inference remains exact.
- All current API/read/update/dependency/schema/codec accumulator tests remain
  finite and exact after selector removal.
- Unknown read/session/update groups fail; session capability never appears on
  `editor.read`, `editor.update`, history, or Yjs types.

### Runtime proof

- Schema, codecs, HTML parser, API factories, runtime handlers, and portal
  observe one frozen options object.
- Only session-declaring plugins allocate stores.
- Candidate compilation failure publishes no session store.
- Root views share one session; separate editors receive distinct object,
  `Set`, ref, and controller identities.
- Session writes notify only matching subscribers and never compile schema,
  traverse documents, create commits, enter history, emit Yjs, or change
  serialization.
- App discussion/settings changes do not mutate plugin options.
- Copilot suggestion behavior reads one field/effect truth.
- Nested auto-scroll overrides restore from call-local context even when a
  callback throws.

### Browser and performance proof

Focused Browser rows:

- DnD lifecycle;
- block selection and selection area;
- floating-link open/edit/reset;
- comment/suggestion hover and active state;
- AI stream/abort/error and Copilot ghost text;
- upload progress/error;
- app settings followed by the next AI request;
- multiple root views sharing one session.

Benchmarks:

- editor creation with 10/100/1,000 config-only versus session plugins;
- retained store count and memory;
- session write fan-out at 0/1/10/1,000 subscribers;
- assert zero document reads, commits, schema compiles, codec rebuilds, and Yjs
  output per session write.

Execution then follows the relevant package typechecks, focused tests, Browser
proof, `pnpm check:plite`, and closure matrix required by repository rules.

## Ownership and risk

| Decision                                                 | Owner                                                                   |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Exact `options` / `session` / hook / portal shape        | `best-api` — fixed by this dossier                                      |
| Core hard cut, package/app adoption, docs, Browser proof | `plate-plan`                                                            |
| Plite changes                                            | None                                                                    |
| Future live plugin configuration                         | Separate evidence-first `best-api`; only then `plate-plan`/`plite-plan` |

Three material risks and gates:

1. **A mutable value is misclassified as options.** Gate every one of the 169
   writes with the ledger above; no unclassified caller may remain.
2. **A persistent semantic value is dumped into session.** Gate history/Yjs/
   serialization absence and keep Copilot suggestion state in its existing
   field/effect owner.
3. **Builder inference regresses during selector/session surgery.** Gate every
   accumulator, negative type proof, declaration emit, and absence of callback
   annotations/casts before deleting the old generic.

No implementation is authorized by this artifact.
