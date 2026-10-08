---
review_scopes: [emoji]
review_basis: [2026-10-04-emoji-audit]
verdict: pursue
work_kind: implementation
review_commit: c70bacbd4a7523ae3ebfd820cec0ea8ec228e9ad
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, packages/platejs/src/emoji/lib/BaseEmojiPlugin.ts, packages/platejs/src/emoji/lib/createEmojiSearch.ts, packages/platejs/src/emoji/react/EmojiPlugin.tsx, packages/platejs/package.json, packages/platejs/src/react/features/combobox/useCombobox.ts, packages/platejs/src/features/combobox/lib/combobox.ts, apps/www/src/registry/components/editor/emoji.tsx, apps/www/src/registry/components/editor/emoji-picker.tsx, apps/www/src/registry/components/editor/emoji-toolbar-button.tsx, apps/www/src/registry/components/editor/callout.tsx, apps/www/src/registry/components/editor/inline-combobox.tsx, apps/www/src/registry/registry-editor.ts, apps/www/src/registry/registry-features.ts, apps/www/tests/browser/combobox.spec.ts, content/docs/(plugins)/(functionality)/(combobox)/emoji.mdx, docs/editor-behavior/markdown-editing-spec.md, docs/plans/2026-10-03-autocomplete-occurrence-host.md, tooling/entrypoints/entrypoint-dag.mjs, .changeset/emoji-v54-runtime.md, docs/plans/artifacts/2026-10-08-emoji-review/architect/synthesis.md, docs/plans/artifacts/2026-10-08-emoji-review/architect/judge/verdict.md, docs/plans/artifacts/2026-10-08-emoji-review/spike/delete-emoji-a1.log]
review_upstreams: ['../frimousse@5723fc11a8162b3b795cd2f5d1164bd6795ae30e', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988']
---

# Emoji entry on frimousse and Emojibase

Status: planning; panel round 3 on the round 2 fixes runs next, then the build
Playbook: plan

Pursue, superseding `2026-10-04-emoji-audit`. Every job `platejs/emoji` publishes, a `:` trigger, text insertion through a `createEmojiNode` factory and a search over the emoji-mart catalog, is product composition whose only terminal consumers are copied registry files, and Plate law gives catalogs and filtering to copied controls. The dataset under it, `@emoji-mart/data`, last shipped on 2024-04-25 and stops at the Emoji 15 set, and the copied kit imports its 433 KB file (83 KB gzip) statically into every editor that installs `EmojiKit`. The owner picked frimousse for the picker and Emojibase for the data; this plan owns everything around that pick.

The plan deletes `platejs/emoji`, `platejs/emoji/react`, `PLUGINS.emoji` and the emoji-mart peer. A new copied `emoji-data` lib item loads Emojibase once through frimousse's `defaultEmojiDataResolver`, pinned to `emojibase-data@17.0.0`, joins GitHub shortcodes to it by glyph, and serves both the `:` popup and every picker. The copied `emoji` item defines its own edit-only plugin, vetoes code blocks and inserts with `tx.text.insert`. The copied picker sits in its own popover, with the trigger as its child and a required `onEmojiSelect`. While the user types, it shows the same ranked search as the popup; with an empty search, it shows a frequent row above frimousse's virtualized category grid. An `architect` arena with three runners and a blind judge picked this target ([synthesis](artifacts/2026-10-08-emoji-review/architect/synthesis.md)).

## Brief

### What will change?

Emoji search and the emoji picker use frimousse and current Emojibase data, with names like smile and thumbsup. Plate stops shipping an emoji package, and editors stop bundling the old emoji list.

### What could go wrong?

The emoji list loads from a public CDN on first use, so offline apps must host three files. The picker loses its category tabs. Apps that import the emoji package must copy the new files.

## Public API

The copied `emoji` item defines an edit-only plugin whose state holds the trigger policy and refuses a trigger inside a code block, as slash does. The kit adds the popup slot, so the bare plugin stays usable without a popup.

```tsx before
// apps/www/src/registry/components/editor/emoji.tsx
export const emojiPlugin = EmojiPlugin.extend({
  initialState: {
    data: emojiMartData as unknown as EmojiMartData,
  },
});

export const EmojiKit = [
  emojiPlugin.configure({ slots: { afterEditable: EmojiCombobox } }),
];
```

```tsx after
// apps/www/src/registry/components/editor/emoji.tsx
export const EmojiPlugin = definePlugin('emoji', {
  editOnly: true,
  initialState: (): ComboboxState => ({
    maxQueryLength: 75,
    queryPattern: /^[\p{L}\p{N}_+\-:]$/u,
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
    triggerQuery: (editor) => {
      const codeBlock = editor.plugin(BaseCodeBlockPlugin);

      return (
        !codeBlock.installed ||
        !editor.read.nodes.some({ type: codeBlock.schema.type })
      );
    },
  }),
});

export const EmojiKit = [
  EmojiPlugin.configure({ slots: { afterEditable: EmojiCombobox } }),
];
```

The popup asks the shared catalog for matches, which loads on the first query character and ranks shortcodes first, and it inserts the emoji character in the completion transaction.

```tsx before
// apps/www/src/registry/components/editor/emoji.tsx
const data = usePluginStore(emojiPlugin, 'data');
const search = React.useMemo(() => createEmojiSearch(data), [data]);

<InlineComboboxItem
  key={emoji.id}
  value={emoji.name}
  onSelect={(tx) => {
    tx.plugin(emojiPlugin).insert(emoji);
  }}
>
```

```tsx after
// apps/www/src/registry/components/editor/emoji.tsx
const { results, status } = useEmojiSearch(query || null);

<InlineComboboxItem
  key={emoji.emoji}
  value={emoji.label}
  onSelect={(tx) => {
    tx.text.insert(emoji.emoji);
  }}
>
```

The picker takes its trigger as its child and hands the caller the emoji character. The callout sets its icon and stops writing a storage key that nothing reads.

```tsx before
// apps/www/src/registry/components/editor/callout.tsx
<EmojiPicker
  closeOnSelect
  disabled={readOnly}
  onSelectEmoji={(emoji) => {
    const icon = emoji.skins[0]?.native;

    if (!icon) return;

    editor.update.nodes.set({ icon }, { at: props.element });
    localStorage.setItem(CALLOUT_STORAGE_KEY, icon);
  }}
>
  <EmojiPickerTrigger>
```

```tsx after
// apps/www/src/registry/components/editor/callout.tsx
<EmojiPicker
  onEmojiSelect={(icon) => {
    editor.update.nodes.set({ icon }, { at: props.element });
  }}
>
```

The toolbar button is the one place that inserts a picked emoji into the document. It inserts at the editor's kept selection as its own undo step, and the picker returns focus to the editor.

```tsx before
// apps/www/src/registry/components/editor/emoji-toolbar-button.tsx
<EmojiPicker
  closeOnSelect={closeOnSelect}
  data={data}
  onSelectEmoji={onSelectEmoji}
  settings={settings}
>
  <EmojiPickerTrigger>
```

```tsx after
// apps/www/src/registry/components/editor/emoji-toolbar-button.tsx
<EmojiPicker
  onEmojiSelect={(emoji) => {
    if (readOnly || !editor.read.selection()) return;

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert(emoji);
    });
  }}
>
```

Docs and apps stop importing the package search and plugin.

```tsx before
// content/docs/(plugins)/(functionality)/(combobox)/emoji.mdx
import emojiMartData, { type EmojiMartData } from '@emoji-mart/data';
import { createEmojiSearch } from 'platejs/emoji';
```

```tsx after
```

## Layer and owner

| Delta | Job | Owner |
| --- | --- | --- |
| changed | Trigger policy for `:` | `ComboboxState` fields of the copied `EmojiPlugin` in `emoji.tsx`, with a code-block veto in `triggerQuery` |
| changed | Insertion | `tx.text.insert` in the popup's completion and in the toolbar button's `onEmojiSelect` |
| changed | Search | `searchEmojis` in the copied `lib/emoji-data.ts`, ranking exact shortcode, then shortcode prefix, then label word prefix, then substring, for both the popup and the picker's search |
| changed | Dataset | The copied `lib/emoji-data.ts`, with one memoized load through frimousse's `defaultEmojiDataResolver` and GitHub shortcodes from `emojibase-data@17.0.0`, shared by the popup and every picker |
| changed | Picker grid, categories, preview and frequent picks | Copied `emoji-picker.tsx` inside its own popover, with its own search input and ranked results while the user types, and frimousse's virtualized grid with a frequent row above it while the search is empty |

All of these live in Plate's copied registry layer; no `platejs` or `plitejs` entrypoint gains code, and `tooling/entrypoints/entrypoint-dag.mjs` loses the `emoji` and `emoji/react` rows.

## Hard cuts and app migration

Each cut below is named by this Pursue plan on a review the owner asked for, so it runs as a `look` Defaults row under the architecture reference's Hard cut.

| Cut | Replacement |
| --- | --- |
| `platejs/emoji` and `platejs/emoji/react`, with `BaseEmojiPlugin`, `EmojiPlugin`, `EmojiPluginState`, `createEmojiSearch`, the `Emoji` type and `createEmojiNode` | The copied `emoji` item's plugin, `lib/emoji-data.ts` and `tx.text.insert` |
| The `@emoji-mart/data` optional peer and dev dependency of `platejs`, and its www dependency | `frimousse@0.4.0` in the copied items, and `emojibase-data@17.0.0` as a www dev dependency for tests |
| `PLUGINS.emoji` | The copied plugin's own `'emoji'` key, a local plugin's literal |
| The picker's `data`, `settings`, `closeOnSelect` and `disabled` props, `onSelectEmoji`, `EmojiPickerTrigger` and `EmojiPickerOptions` | A required `onEmojiSelect(emoji)` and the trigger as the picker's child |
| The picker's category icon bar, preview pane and seeded frequent defaults | frimousse's sticky category headers, its active-emoji footer and an empty frequent row |
| The callout's `plate-storage-callout` write | Nothing; no code reads it |

The spike at the run base confirms the live set. After the cut, only the copied emoji files, the two registry entries, both emoji docs pages and the `platejs` manifest still name the surface, `platejs` typechecks clean, and every www type error sits in an `EditorKit` consumer that the rewritten `emoji.tsx` repairs ([spike log](artifacts/2026-10-08-emoji-review/spike/delete-emoji-a1.log)).

Documents need no migration, because emoji are text. The v54 input migration that turns legacy `emoji_input` nodes back into text stays, because it reads documents, not this package. Apps that import `platejs/emoji` copy the `emoji-data`, `emoji` and `emoji-picker` items again; the changeset says so. `templates/**` regenerates in CI, so the claim that no emoji-mart import remains covers live source and registry output, and the templates follow on CI's next run.

Two open consumers cite the cut surface. Phase 2 of `docs/plans/2026-10-03-autocomplete-occurrence-host.md`, gated and not started, adds an `emoji/react` to `combobox/react` entrypoint edge and keeps `createEmojiNode`; once this cut lands that phase drops emoji from its four feature edges. The pending `.changeset/emoji-v54-runtime.md` teaches `createEmojiSearch` and `EmojiPluginState`, and step 2.4 replaces it.

## Native behavior and proof

| Behavior | Proof |
| --- | --- |
| Typing `:smile:` opens the popup and Enter inserts exactly 😄 as text, in one undo step, with the editor focused and follow-up typing landing after it | `combobox:emoji completes a closed shortcode` in `apps/www/tests/browser/combobox.spec.ts`, tightened, Chromium, with Emojibase routed locally |
| Typing `:smile` inside a code block opens no popup | A new case in `combobox.spec.ts`, Chromium |
| Enter while the catalog still loads leaves the paragraph reading `:smile`, in one block, with the popup open, and the popup completes to 😄 once the data lands | A new case in `combobox.spec.ts` that delays the routed data, Chromium |
| In the toolbar picker, typing `fire`, waiting for the 🔥 result and pressing Enter inserts 🔥 at the caret, closes the picker and returns focus, so typing `x` gives `🔥x`; Escape closes the picker and returns focus to the toolbar button | A new case in `apps/www/tests/browser/emoji.spec.ts`, Chromium and Firefox |
| Enter that confirms an IME composition in the picker's search selects nothing and keeps the picker open, and the next plain Enter selects | Two runs in `emoji.spec.ts`, Chromium: one with the composition still active and an Enter with key code 13, and one with the WebKit shape, an Enter keydown with key code 229 and no active composition, sent through CDP |
| A picker pick shows under Frequently used on reopen | A new case in `emoji.spec.ts`, Chromium |
| After one load, an offline reload still completes `:smile:` to 😄; with the cached data cleared the popup says the emoji list is unavailable; once the routes come back, the next query character loads the list and completes to 😄 without a reload | A new case in `combobox.spec.ts` that aborts and restores the routes, Chromium |
| A failed load shows the same unavailable message in the picker, with or without a search | A new case in `emoji.spec.ts` with the routes aborted, Chromium |
| The callout icon picker sets the callout's icon and inserts no text | Browser run through `verify` on the callout demo |
| Read-only editors open no popup | `editOnly` on the copied plugin, unchanged from today |
| The picker opens, picks, closes on Escape and returns focus in both popover families | An emoji block added to `verifyInstalledEditorCommands` in `apps/www/scripts/registry-create-install-e2e.mts`, run on `editor-ai` for both bases through `pnpm --filter www test:create-install editor-ai` after the registry output is regenerated; this manual script installs over the network, and the installed app loads Emojibase from jsDelivr |
| The editor bundle no longer carries the emoji list | Production build of www before and after, searching the editor chunks for emoji-mart's data |

IME preview, Escape and refusal in the `:` popup stay with the combobox host and its existing tests; the picker's search input is a separate input, so its IME case is its own. Every browser case in `apps/www/tests/browser` routes the pinned jsDelivr URLs to the installed `emojibase-data@17.0.0` files and aborts any other external request, so none needs the network. Playwright routing turns off the HTTP cache, so the offline case relies on the two browser-storage copies alone.

## Main changes

- The emoji dataset moves out of the editor bundle. It loads on the first `:` query or picker open, from a pinned CDN URL, frimousse caches it in memory and `localStorage` and drops emoji the device cannot draw, and Plate stores the GitHub shortcodes in `localStorage` beside it, keyed by the pinned release.
- `platejs` loses the `emoji` and `emoji/react` entrypoints, their partition scripts, tsconfig paths and runtime proof imports, all regenerated from the entrypoint graph.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the emoji list loads from | frimousse's default loader, which fetches Emojibase from the jsDelivr CDN at the pinned 17.0.0 release, caches it in the browser and hides emoji the device cannot draw | Serve the Emojibase files from the app and point the one base address at them | self-host emoji data |
| Shortcode names | GitHub shortcodes from the same Emojibase release, joined to each emoji | Emojibase's own shortcode set, twice the size and missing names like sunny | emojibase shortcodes |
| The emoji package in Plate | Delete both emoji entry points, the emoji-mart peer and the emoji plugin key; a copied plugin replaces them | Keep a package plugin that holds only the trigger policy | keep emoji package |
| Where the data loader lives | A new copied emoji data item, so a callout install does not pull in the colon popup | Put the loader in the emoji item | loader in emoji item |
| How the picker opens | The picker owns its popover and takes its trigger as its child | A bare panel that each caller wraps in its own popover | bare picker panel |
| Who inserts a picked emoji | Every caller passes a select handler; the toolbar button inserts | The picker inserts into the editor when no handler is given | default picker insert |
| Colon popup in code blocks | Refuse it, as slash does | Open it everywhere, as today | emoji in code |
| Category tabs in the picker | Remove the tab bar; sticky headers and search find categories | Build a tab bar over frimousse | keep category tabs |
| Picker search order | The ranked search the popup uses, shown as one flat list while the user types | frimousse's own search, which groups results by category and puts heart on fire before fire | frimousse search |
| Frequent picks | Keep a frequent row above the grid, counted from picker picks, stored in the browser by emoji character, empty at first | Count popup picks too, or seed it with defaults | count popup picks |
| Skin tones | No skin tone control, as today | Add frimousse's skin tone selector | add skin tones |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Emoji package entrypoints | `platejs/emoji`, `platejs/emoji/react` | none | copied registry | Only copied UI consumes them (`plate.md` terminal-consumer law) | Re-copy the registry items; changeset | Delete spike; `pnpm check entrypoint-graph`, `barrels`, typecheck | Downstream apps that import them break | cut |
| Trigger policy | `BaseEmojiPlugin` state | copied `EmojiPlugin` state with a code-block veto | `emoji.tsx` | Autocomplete law puts trigger policy in plugin state; slash already vetoes code | Re-copy `emoji` | Browser code-block case | `:` in inline code still opens (no mark read on `ComboboxEditor`) | move |
| Insertion | `insert(emoji)` through `createEmojiNode` | `tx.text.insert` | popup completion, toolbar button | Emoji are text; a factory option has no consumer | Re-copy | Tightened `:smile:` case | Inserted text takes the caret's marks | cut |
| Dataset | `@emoji-mart/data` 1.2.1, bundled | Emojibase 17.0.0 through frimousse's loader plus GitHub shortcodes, loaded once | `lib/emoji-data.ts` | Owner's pick; current data, device filtering, zero bundle bytes | New `emoji-data` registry lib item | Bundle check; routed browser cases | First use needs the network | rearchitect |
| Search | `createEmojiSearch`, linear over 1,870 entries per query | `searchEmojis`, linear over about 1,900 entries with shortcodes ranked first | `lib/emoji-data.ts` | Label-and-tag ranking picks 😼 for `smile` (judge's measurement) | Re-copy | Step 1.1 pre-acceptance probe, then the tightened browser case | Per-keystroke cost | gate |
| Picker | 1,207-line hand-built grid | frimousse parts in a copied popover | `emoji-picker.tsx` | Owner's pick; keyboard grid, virtualization, device filtering | Re-copy `emoji-picker`; callout and toolbar change | Browser toolbar and frequent cases | frimousse is pre-1.0 | rearchitect |
| Frequent picks | `emoji:frequent`, emoji-mart ids, 13 seeded defaults | `plate:emoji-frequent:v1`, glyph and label with counts, empty at first | `emoji-picker.tsx` | Per-browser preference; ids no longer exist | Old counts drop | Browser frequent case | Lost counts on cross-tab races | rearchitect |

## Steps

Execution playbook: `.agents/playbooks/build.md`.

### Phase 1: copied emoji items on frimousse and Emojibase

At the phase exit, keep when every Phase 1 proof passes; otherwise revert the copied files to the run base.

- [ ] 1.1 Install `frimousse@0.4.0` in `apps/www` and `emojibase-data@17.0.0` as its dev dependency, exact versions. Copy today's `createEmojiSearch` and the `@emoji-mart/data` 1.2.1 `native.json` into `docs/plans/artifacts/2026-10-08-emoji-review/bench/`, so the probe keeps its baseline after Phase 2 deletes them. Run the pre-acceptance search probe through `benchmark` before writing `searchEmojis` into the copied file. Each side runs the whole popup search path, with the trailing colon removed and at most 60 results, and the probe first asserts each side's top result, 😄 for `smile`, 👍 for `+1` and 🔥 for `fire`, before it times anything. It runs in bun for the queries `s`, `sm`, `smile`, `smile:`, `thumbsup`, `+1`, `fire`, `heart_eyes` and `zzz`, with 200 warmups and ten interleaved packets of 2,000 calls per side per query. The acceptance line is that, for each query, the candidate's per-call p95 is at most 1.5 times the baseline's p95, and the candidate's one-time index build is at most 50 ms. A separate sensitivity line runs a planted candidate that rebuilds its index on every call and must exceed 1.5 times the unmodified candidate's p95 on every query; a query where it does not makes the probe inconclusive, and the probe grows its calls per packet before any keep. Proof: the probe log under `docs/plans/artifacts/2026-10-08-emoji-review/bench/` with every cohort's numbers, the planted run's failure, and a `pstack:benchmark-checklist` pass.
- [ ] 1.2 Write `apps/www/src/registry/lib/emoji-data.ts`. `loadShortcodes` reads GitHub shortcodes from browser storage under a key that names the pinned release, and otherwise fetches `en/shortcodes/github.json` from the pinned base URL, accepts string and array values, and stores it. A storage read or write that throws is ignored. A stored value that is not an object of string or string-array values holding `1F604` is ignored and fetched again. Only a failed fetch, a non-ok response included, rejects. `loadEmojis` joins `defaultEmojiDataResolver('en', { emojibaseUrl })` and `loadShortcodes` by glyph, with U+FE0E and U+FE0F removed on both sides, memoized per page, and forgets any rejected load so the next call retries. `resolveEmojiData` serves pickers and returns empty data on failure. `useEmojiSearch(query)` loads unless the query is null and returns `{ results, status }`; while the status is `'failed'`, a changed query calls `loadEmojis` again, so a restored connection recovers without a reload. `searchEmojis(entries, query)` drops one trailing colon and returns at most 60 matches, ranked by exact shortcode, shortcode prefix, label word prefix, then substring. Add the `emoji-data` item to `apps/www/src/registry/registry-lib.ts` with `frimousse@0.4.0`. Proof: the tightened `:smile:` browser case in 1.6, which fails when ranking falls back to labels and tags, and the offline case, which fails when the shortcodes are not stored or when the hook loads once per mount.
- [ ] 1.3 Rewrite `apps/www/src/registry/components/editor/emoji.tsx` to the Public API above, with the local `EmojiPlugin`, the code-block veto, `EmojiKit` with the popup slot, and `tx.text.insert`. While the catalog loads, the copied `inline-combobox` gets `loading`, which holds Enter and Tab, and the popup's empty row, mounted in every state, shows a loading status, so the popup stays open and Enter leaves the query and the block as they are; a failed load shows that the emoji list is unavailable. Change `registry-features.ts`'s `emoji` item to depend on `@plate/emoji-data` and drop `@emoji-mart/data`. Update `apps/www/src/app/dev/combobox-typing/page.tsx` to import `EmojiPlugin`, and make `apps/www/scripts/run-combobox-typing-probe.mts` route Emojibase locally and wait for real emoji rows before it measures. Proof: www typecheck clean except the base's known error, and the browser cases in 1.6.
- [ ] 1.4 Rewrite `apps/www/src/registry/components/editor/emoji-picker.tsx`. The popover owns open state, focuses the search input on open, closes on select and returns focus to the editor through `onFinalFocus` after a pick, with a bounded height. The search input is the picker's own, not frimousse's. The picker reads the load status and results from `useEmojiSearch(search)` and shows one unavailable message in both modes when it is `'failed'`. While the input holds text, the picker renders those results as one flat grid with an active result, arrow keys and Enter, and the input ignores every key it handles when `isComposing` is true or the key code is 229, the rule the copied find bar uses. The popover's Escape handler calls `preventDefault()` under the same rule, which keeps the Radix-family picker open when Escape cancels an IME candidate; Base UI's dismissal ignores Escape during composition on its own (inferred from `@base-ui/react` `useDismiss.js`, not run). While it is empty, the picker renders one row of Frequently used native buttons and, only once the status is `'ready'`, frimousse's `Root`, `Viewport` with `tabIndex={0}`, `List`, `Loading` and `ActiveEmoji` over `resolveEmojiData`, and ArrowDown in the input moves focus into the viewport. Store picks under `plate:emoji-frequent:v1` as glyph, label and count. Change the `emoji-picker` registry item to depend on `frimousse@0.4.0`, `@plate/emoji-data` and `@plate/floating-popover`, and drop `@plate/emoji`, `button`, `tooltip` and `@emoji-mart/data`. Delete `emoji-picker.spec.tsx`, which tests the deleted grid. Proof: the picker browser cases in 1.6.
- [ ] 1.5 Rewrite `emoji-toolbar-button.tsx` and `callout.tsx` to the Public API above. The toolbar button is disabled while the editor is read-only, and its insert is its own undo step. Proof: the toolbar browser cases in 1.6 and the callout run in 1.7.
- [ ] 1.6 Add the browser cases in the Native behavior table through `verify`, starting with a shared route helper that fulfills the pinned jsDelivr `emojibase-data@17.0.0` GET and HEAD requests from the installed package, with an ETag, and aborts other external requests. Record each case's result at the run base first. The code-block case fails there because the popup opens inside code. The toolbar case's focus half runs at the base with a pointer pick, because the base picker has no Enter path, and fails because focus stays off the editor. The `:smile:`, loading, IME, frequent and offline cases have no counterpart at the base, so each gets its failure from a mutation on the candidate. The `:smile:` case fails under label-and-tag ranking. The loading case fails twice: with the loading text rendered as the empty row, which splits the block, and with a loading option that does not refuse, which deletes the query. The WebKit IME run fails with the key code 229 branch removed, and the other IME run with the composition branch removed. The picker's failed case fails with a picker that reads the status only in search mode, so browse mode falls back to frimousse's Empty. The frequent case fails with a reader on another storage key. The offline case fails with unstored shortcodes and with a hook that loads once per mount. The toolbar case fails with `onFinalFocus` removed. The toolbar and frequent cases wait for the 🔥 result before they press Enter. Proof: Chromium runs of `combobox.spec.ts` and `emoji.spec.ts` against a doctored www instance, a Firefox run of the toolbar case, five repeats without retries for the focus cases, and one log per mutation, all under the run directory.
- [ ] 1.7 Drive the callout icon pick in the browser through `verify`, with screenshots inspected. Run `pnpm --filter www build:registry`, add an emoji block to `verifyInstalledEditorCommands` in `apps/www/scripts/registry-create-install-e2e.mts` that opens the toolbar picker, types `fire`, waits for the 🔥 result, presses Enter, checks 🔥 in the document and focus in the editor, reopens, presses Escape and checks focus on the toolbar button, and run `pnpm --filter www test:create-install editor-ai` for both bases. Proof: screenshots and logs under the run directory.

### Phase 2: hard cut and teaching

At the phase exit, keep when the checks pass; otherwise revert Phase 2 and keep Phase 1, whose copied files no longer import the package.

- [ ] 2.1 Delete `packages/platejs/src/emoji/`, the `emoji` and `emoji/react` rows and list entries in `tooling/entrypoints/entrypoint-dag.mjs`, `PLUGINS.emoji` in `packages/platejs/src/utils/plate-keys.ts`, and `@emoji-mart/data` from `packages/platejs/package.json` and `apps/www/package.json`; run `pnpm entrypoint:turbo:generate`, `pnpm install` and `pnpm brl`. Repoint the citations that name deleted files: the owners, members and proof of `docs/research/review-scopes/emoji.json`, and the emoji paths in `docs/research/review-scopes/autocomplete.json`, `docs/research/review-scopes/markdown.json` and `docs/research/sources/plite/performance.md`. Proof: `pnpm check entrypoint-graph`, `pnpm check barrels`, `pnpm check knowledge`, `pnpm check review-ledger`, `pnpm --filter platejs typecheck` and a `git grep` for `platejs/emoji`, `PLUGINS.emoji` and `@emoji-mart` over live source, docs, research and skills that finds nothing outside history.
- [ ] 2.2 Run `plate-docs` on `content/docs/(plugins)/(functionality)/(combobox)/emoji.mdx` and `emoji.cn.mdx`: the kit, the copied items and their dependencies, the `:` flow with shortcodes and the code-block veto, the picker's props and search, the frequent row, the CDN load and the self-hosting knob, with its example coverage audit. Proof: the docs checks the skill names and a rendered page in the browser.
- [ ] 2.3 Run `pnpm --filter www build:registry` and include its generated output. Proof: `pnpm check registry-changelog` and a rerun of `pnpm --filter www test:create-install editor-ai` for both bases on the final registry output.
- [ ] 2.4 Through `changeset`, replace `.changeset/emoji-v54-runtime.md` with the removal of `platejs/emoji` and the emoji-mart peer, rewrite the draft registry changelog entry `apps/www/src/registry/changelog/entries/2026-09-08-emoji-search.mdx`, which still teaches `createEmojiSearch`, and add the registry changelog entries for the three items. Proof: the changeset skill's checks.
- [ ] 2.5 Run `best-api repair` for the removed public API: the Vision owner, skills and docs that still teach `platejs/emoji`. Proof: the repair's grep over `docs/vision`, `.agents/rules` and `content/docs`.
- [ ] 2.6 Rerun the 1.1 search probe on the final `lib/emoji-data.ts` against the copied baseline, run the combobox typing probe's trigger lane through `benchmark` on production builds at the run base and on the final bytes, and build www in production before and after to show the editor chunks no longer hold emoji-mart's data. Proof: the probe logs and the two build greps under the run directory, then `pnpm check` once on the settled change.

## Open work

- The `emoji-picker` and `emoji-toolbar-button` registry items link the `emoji-pro` example and Plate Pro's emoji picker page, which runs `@platejs/emoji` 52 on emoji-mart with another picker API. owner: zbeyens. stop: the next Plate Pro emoji sync, or 2026-11-30. Tracked in `docs/plans/topics/emoji.md` Open work at the fold.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`).

This review supersedes `2026-10-04-emoji-audit`. That audit's verdict and its deletion of `platejs/emoji` hold, but its target kept the emoji-mart catalog and the hand-built picker, and the owner's pick of frimousse and Emojibase on 2026-10-08 replaces both. The [2026-09-07 extraction audit](2026-09-07-full-plate-ui-extraction-audit.md), which kept the shared search in the package, stays reopened as the 2026-10-04 audit left it. `docs/plans/2026-03-23-emoji-coverage-pass.md`, `docs/plans/2026-04-04-emoji-shortcode-support.md`, `docs/plans/2026-06-15-4949-emoji-empty-categories.md` and `docs/plans/2026-07-11-plate-next-docx-docx-io-emoji-package-reviews.md` are history; the empty-category fix of issue 4949 belongs to the picker this plan replaces.

### Requirements

- Owner: "pick frimousse , emojibase-data", after asking to redesign "the whole emoji entry" from first principles.
- Emoji persist as ordinary text, with no node, mark or document property.
- Autocomplete queries stay ordinary editor text, a feature declares its trigger as `ComboboxState` fields in plugin `initialState`, and completion replaces trigger and query in one refusable transaction (`docs/vision/plate.md`).
- Copied controls own catalogs, filtering, the active option and presentation (`docs/vision/plate.md`).
- Package publication needs independent terminal consumers or a durable headless contract; copied registry UI alone does not count (`docs/vision/plate.md`).
- Frequent picks are per-user preferences that live outside the document and the plugin store.
- Read-only editors open no popup.
- Markdown `:shortcode:` parsing, `EDIT-EMOJI-001`, belongs to the markdown kit's `remark-emoji` and stays outside this scope.

### Lanes

- **Chosen, the strongest deletion.** Delete [`platejs/emoji`](../../packages/platejs/src/emoji/lib/BaseEmojiPlugin.ts), `platejs/emoji/react`, `PLUGINS.emoji` and the emoji-mart peer. The copied items own the plugin, trigger, search, data and insertion, with one frimousse-backed catalog for the popup and the pickers.
- **Keep a trigger-only package plugin and swap the data.** It loses because the plugin would publish trigger state with no semantic contract, and copied UI stays its only consumer.
- **Keep the hand-built picker and swap only the dataset.** This is the control that adds no artifact. It loses because it keeps 1,207 lines that frimousse replaces, its grid has no keyboard path, search needs emoji-mart ids that Emojibase lacks, and the owner picked frimousse.
- **Bundle `emojibase-data` through a custom resolver.** It loses as the default, because frimousse uses custom data "as-is, without version or country-flag filtering" (`../frimousse/src/types.ts`), so devices without Emoji 16 or 17 fonts would show empty boxes, and it adds about 114 KB gzip to the editor chunk. Self-hosting the same files keeps the filtering and stays the Defaults alternative.
- **Match labels and tags only.** It loses because frimousse's own scoring on Emojibase 17 ranks 😼 first for `smile`, 🥰 for `heart` and 👨‍🚒 for `fire`, and finds nothing for `thumbsup`, `sweat_smile` or `heart_eyes` (judge's re-run, [verdict](artifacts/2026-10-08-emoji-review/architect/judge/verdict.md)).
- **Store emoji as a node with a shortcode, as Tiptap does.** It loses because it breaks the text-only requirement and adds a schema for no current job.

### Design

Three runners answered one brief: Opus, `gpt-6-astra` at xhigh and `gpt-6.1-sol` at xhigh. A blind Opus judge scored them 22, 17 and 18 of 24 and picked the Opus package as the base; the lead's reading agrees. All three converged on the deletion, the pinned frimousse loader, a shortcode sidecar, a code-block veto, the frequent row outside the virtualized grid and `tx.text.insert`. Grafts came from the other two: the separate `emoji-data` item, the toolbar's editability check and new undo step, the focusable viewport and the tightened tests. The live anchor, the bare panel and a slot inside the plugin definition were rejected. Challenge delta: improved, with label-only search replaced by GitHub shortcodes, the null `triggerQuery` replaced by a code-block veto and a new `emoji-data` item owning the dataset ([synthesis](artifacts/2026-10-08-emoji-review/architect/synthesis.md)).

The judge checked three load-bearing facts against source and data. Plite keeps the model selection when focus moves into an input: blur sets `preferModelSelection`, and `selectionchange` from inputs is ignored, so the toolbar needs no anchor. That is a source read, and the toolbar browser case proves it at runtime. GitHub's 17.0.0 preset maps all nine named shortcodes in 15.7 KB gzip, and Emojibase's own preset is 31.9 KB gzip and lacks 292 GitHub names. The plugin's `initialState: (): ComboboxState` form and code-block `triggerQuery` match slash's, which passes `RequireComboboxState`.

Release counts read from the npm registry on 2026-10-08: `@emoji-mart/data` 1.2.1 on 2024-04-25, `emojibase-data` 17.0.0 on 2025-11-17 and `frimousse` 0.4.0 on 2026-09-21. External checkouts read: `../frimousse` at `5723fc1`, `../tiptap` at `91c51be`, `../BlockNote` at `1e26f1c` and `../lexical` at `dd5c41b`.

The Close marks each predicted benefit held or falsified. An editor with `EmojiKit` stops bundling the 83 KB gzip emoji-mart list. The picker shrinks from 1,207 lines to a few hundred. Emoji 16 and 17 appear where the device can draw them. `platejs` loses two entrypoints and an optional peer.

Limits: frimousse's data holds 1,914 emoji, and GitHub's preset names no shortcode for 44 of them, all from Emoji 15.1 to 17, which stay reachable by label. In the picker, results while typing come from Plate's ranked search, and browsing keeps frimousse's category order. A `:` typed inside inline code still opens the popup, because `ComboboxEditor` exposes no mark read. No CDN availability, CSP or privacy review has run.
