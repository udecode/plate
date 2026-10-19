---
review_scopes: [slash]
verdict: pursue
review_basis: [2026-10-04-slash-audit-2]
work_kind: implementation
review_commit: 924b994fde53b8e7ff88c0864cd0f3d8db0e51c4
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/plans/topics/autocomplete.md, docs/plans/topics/emoji.md, docs/plans/2026-10-03-autocomplete-occurrence-host.md, docs/plans/2026-10-08-emoji-review.md, packages/platejs/src/react/features/slash-command/SlashPlugin.tsx, packages/platejs/src/react/features/combobox/useCombobox.ts, packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts, packages/platejs/src/react/features/combobox/useCombobox.spec.tsx, packages/platejs/src/react/plugin/PlatePlugin.ts, packages/platejs/src/react/components/EditorContentView.internal.tsx, packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts, apps/www/src/registry/components/editor/slash.tsx, apps/www/src/registry/components/editor/slash.spec.tsx, apps/www/src/registry/components/editor/emoji.tsx, apps/www/src/registry/components/editor/inline-combobox.tsx, apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx, apps/www/src/registry/components/editor/block-menu.tsx, apps/www/src/registry/components/editor/plugins.ts, tooling/entrypoints/entrypoint-dag.mjs, 'content/docs/(plugins)/(functionality)/(combobox)/slash-command.mdx', 'content/docs/(plugins)/(functionality)/(combobox)/combobox.mdx', .changeset/slash-command-plite-plugin.md, .changeset/combobox-command-runtime.md]
review_upstreams: ['../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Slash: move the trigger plugin into the copied slash file

Status: executed
Topic: slash
Playbook: plan

**Pursue, reaffirmed on the current code, and planned.** `platejs/slash-command` and `platejs/slash-command/react` publish one plugin with five trigger defaults and `editOnly`, under four exported names and a `PLUGINS` key. Its only terminal consumer is the copied `slash.tsx`, and `docs/vision/plate.md` makes a plugin stage that only copied UI uses registry-owned when its job is product composition. The emoji popup took this shape on 2026-10-09, and the autocomplete subject teaches it for any trigger. The build defines `SlashPlugin` in `slash.tsx` with `definePlugin` and `ComboboxState`, deletes both entrypoints, their types and the `PLUGINS.slashCommand` key, and lets the completion take the boolean that typed commands already return. The arena added one cut. The Date, Footnote and Inline Equation items' read-only and installed checks repeat what the popup and the combobox owner already refuse, and the old and new files give the same results on the same inputs. The plan's panel kept the AI item's read-only check, because AI opens after the completion commits, and a view can turn read-only in between. The Build playbook built it, and the Close says what landed and where the proof stops.

## Brief

### What will change?

Plate no longer ships the slash menu's plugin. It now lives in the slash file you copy, like emoji's. That file also drops a few checks the popup already does. The menu works the same in every test and when typed by hand.

### What could go wrong?

An app that imports the slash plugin from Plate breaks until it copies the new slash file. The release note shows how. The browser checks ran in Chrome only, so Safari, Firefox and phones weren't tried. One test still counted the two removed slash import paths. The final checks caught it, and it's fixed. A few repository-wide checks already failed on next before this change, and they still fail.

## Teach

The slash menu is the popup you get when you type a slash at the start of a line or after a space. It lists blocks and inline items, filters as you type, and swaps the slash and your query for the item you pick, in one undo step.

Today the menu, its items and the rule that keeps it out of code blocks live in a file the app copies and owns. Plate keeps only a tiny plugin with five trigger settings, published at two import paths, and that copied file is its only real user.

The change moves those settings into the copied file, as emoji does, and deletes both import paths. Each item hands its command's yes or no straight to the popup. The Date, Footnote and Inline Equation items drop their read-only checks, since the popup already refuses in read-only views. The AI item keeps its check, because it opens AI after the popup's edit.

## Public API

The copied slash file defines its own plugin, with the trigger settings and the code-block rule, like the emoji file does.

```tsx before
// apps/www/src/registry/components/editor/slash.tsx
import { SlashPlugin } from 'platejs/slash-command/react';

export const SlashKit = [
  SlashPlugin.configure({
    initialState: {
      triggerQuery: (editor) => {
        const codeBlock = editor.plugin(BaseCodeBlockPlugin);

        return (
          !codeBlock.installed ||
          !editor.read.nodes.some({
            type: codeBlock.schema.type,
          })
        );
      },
    },
    slots: { afterEditable: SlashCombobox },
  }),
];
```

```tsx after
// apps/www/src/registry/components/editor/slash.tsx
export const SlashPlugin = definePlugin('slashCommand', {
  editOnly: true,
  initialState: (): ComboboxState => ({
    maxQueryLength: 75,
    queryPattern: null,
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
    triggerQuery: (editor) => {
      const codeBlock = editor.plugin(BaseCodeBlockPlugin);

      return (
        !codeBlock.installed ||
        !editor.read.nodes.some({
          type: codeBlock.schema.type,
        })
      );
    },
  }),
});

export const SlashKit = [
  SlashPlugin.configure({ slots: { afterEditable: SlashCombobox } }),
];
```

The build deletes Plate's slash plugin and both of its import paths.

```ts before
// packages/platejs/src/features/slash-command/lib/BaseSlashPlugin.ts
export const BaseSlashPlugin = definePlugin(PLUGINS.slashCommand, {
  initialState: (): SlashPluginState => ({
    maxQueryLength: 75,
    queryPattern: null,
    trigger: '/',
    triggerQuery: null,
    triggerPreviousCharPattern: TRIGGER_PREVIOUS_CHAR_PATTERN,
  }),

  editOnly: true,
});
```

```ts after
```

A menu item's callback can now return a command's `true` or `false`. Only `false` cancels, which is how it already runs.

```ts before
// packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts
export type ComboboxCompletion = (tx: PluginTransaction) => false | void;
```

```ts after
// packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts
export type ComboboxCompletion = (tx: PluginTransaction) => boolean | void;
```

Each item returns its command's result. The inline items drop their read-only and installed checks, which the popup already makes.

```tsx before
// apps/www/src/registry/components/editor/slash.tsx
{
  icon: <CalendarIcon />,
  isAvailable: (editor) => editor.plugin(BaseDatePlugin).installed,
  keywords: ['time'],
  label: 'Date',
  value: PLUGINS.date,
  onSelect: (editor, tx) => {
    if (
      !editor.plugin(BaseDatePlugin).installed ||
      editor.read.view.isReadOnly()
    ) {
      return false;
    }

    tx.plugin(BaseDatePlugin).insert({}, { select: true });
    return undefined;
  },
},

<InlineComboboxItem
  key={value}
  value={value}
  onSelect={(tx) =>
    onSelect?.(editor, tx) === false ? false : undefined
  }
>
```

```tsx after
// apps/www/src/registry/components/editor/slash.tsx
{
  icon: <CalendarIcon />,
  isAvailable: (editor) => editor.plugin(BaseDatePlugin).installed,
  keywords: ['time'],
  label: 'Date',
  value: PLUGINS.date,
  onSelect: (_editor, tx) =>
    tx.plugin(BaseDatePlugin).insert({}, { select: true }),
},

<InlineComboboxItem
  key={value}
  value={value}
  onSelect={(tx) => onSelect?.(editor, tx)}
>
```

The copied popups use Plate's shared props type instead of writing their own.

```tsx before
// apps/www/src/registry/components/editor/slash.tsx
export function SlashCombobox({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
```

```tsx after
// apps/www/src/registry/components/editor/slash.tsx
export function SlashCombobox({ editableRef }: EditableSiblingProps) {
```

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| changed | Trigger policy | `ComboboxState` fields of the copied `SlashPlugin` in `slash.tsx`, with the code-block veto in `triggerQuery`; no `platejs` entrypoint holds slash code. |
| changed | Completion | `useCombobox`'s `complete` replaces the trigger and query and runs the chosen edit in one synchronous, refusable transaction with one-step undo, and refuses without running the edit when the view is read-only. The edit returns `true`, `false` or nothing, and only `false` refuses, so a typed command's result passes straight through. Shared by slash, mentions, emoji and footnotes. |
| changed | Catalog | 20 product items in copied `slash.tsx`; `isAvailable` alone decides which items show, and an inline item runs only its command. The AI item checks read-only before it opens AI, because it runs after the completion commits. A small lexical factory is allowed there if it keeps descriptor inference, never exported. |

## Hard cuts and app migration

Deleted:

- `platejs/slash-command`, with `BaseSlashPlugin`, `SlashPluginState` and `SlashDefinition`.
- `platejs/slash-command/react`, with `SlashPlugin`.
- The `PLUGINS.slashCommand` key, which also narrows `PluginName`.
- The Date, Footnote and Inline Equation items' read-only and installed checks, and the popup's read-only branch.

The census at `924b994fde`, checked by a delete-and-typecheck spike, finds these callers and files:

| Kind | Files | Change |
| --- | --- | --- |
| Copied UI | `slash.tsx` | Defines `SlashPlugin`; drops the package import, the adapter, the inline items' guards and the local props type. |
| Tests | `slash.spec.tsx`, `useCombobox.spec.tsx` | The slash spec imports `SlashPlugin` from `./slash`; the combobox spec defines its own `TestSlashTrigger` for its two-trigger case. |
| Dev page | `apps/www/src/app/dev/combobox-typing/page.tsx` | Imports `SlashPlugin` from the registry file. |
| Package glue | `plate-keys.ts`, `package.json` exports, `tsdown.config.mts`, `entrypoint-dag.mjs` and its test counts, `api-reference.config.json` | Lose the slash entries. |
| Generated | eight tsconfig alias blocks, both `tsconfig.entrypoints/slash-command*.json`, `core.json`, `react-core.json`, `turbo.json`, `apps/plite/src/runtime-entrypoint-proof.generated.ts`, the entrypoint sizes file, the API manifest, `plate-baseline.json`, and the registry output under `apps/www/public/r/` and `apps/www/src/__registry__/` | Their generators rewrite them. `release-index.json` and the package changelogs are history and stay. |
| Docs | `slash-command.mdx` and its Chinese twin, `combobox.mdx` and its Chinese twin, including the twins' `HashtagCombobox` example | Through `plate-docs`. |
| Release notes | `.changeset/slash-command-plite-plugin.md`, `.changeset/combobox-command-runtime.md`, one registry changelog entry | Rewritten while `.changeset/pre.json` lists neither, because the slash plugin has not shipped from `platejs`. Once a beta lists them, both stay as shipped, and one new changeset carries the removal and the completion change. |
| Teaching | `docs/plans/topics/autocomplete.md`, `docs/editor-behavior/markdown-editing-spec.md`, `docs/research/sources/plite/autocomplete-and-triggers.md`, `docs/research/review-scopes/slash.json` and `autocomplete.json` | Point at the copied file; `slash.json` names `slash.tsx` as its owner. |
| Open plan | `docs/plans/2026-10-03-autocomplete-occurrence-host.md` | Flagged under Open work, not edited. |

The templates pin `@platejs/slash-command@^53` and keep it.

An app that set up Plate's slash plugin itself now copies the slash file, or defines the plugin in its own code.

```tsx before
// app code, as the slash-command docs page teaches it
import { SlashPlugin } from 'platejs/slash-command/react';

SlashPlugin.configure({
  initialState: { triggerQuery },
  slots: { afterEditable: SlashCombobox },
});
```

```tsx after
// app code, after the cut
import { SlashKit } from '@/components/editor/slash';

const editor = createEditor({ plugins: [...SlashKit] });
```

## Main changes

- The copied emoji, mention, footnote and slash popups take `EditableSiblingProps`, and `InlineCombobox` types its ref as `UseComboboxOptions['editableRef']`, so no copied file restates the slot's ref type.
- `InlineComboboxItem` infers its `onSelect` type from `UseComboboxReturn['complete']`, so the copied file follows the package's completion contract without a second copy of it.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Slash trigger plugin | Two `platejs` entrypoints publish `BaseSlashPlugin` and `SlashPlugin` | `SlashPlugin` defined in copied `slash.tsx` | registry `slash.tsx` | `plate.md` 1141 to 1150 makes a stage that only copied UI uses registry-owned | the four code users, two docs pages, one changeset | `slash.spec.tsx`, `useCombobox.spec.tsx`, entrypoint tests, `entrypoint:turbo:check`, www and `platejs` typechecks, the www combobox browser spec | apps that import the subpath break; the changeset migrates them | cut |
| `PLUGINS.slashCommand` | A first-party plugin key | Gone; the copied plugin names itself with a literal | registry `slash.tsx` | `plate.md` 659 to 664 keeps literal names for local plugins | `plate-keys.ts`, the API manifest | `platejs` typecheck and type tests | an app that typed `PluginName` as `'slashCommand'` breaks | cut |
| Completion result | `false \| void` | `boolean \| void`, only `false` refuses | `platejs/combobox/react` | `plate.md` 765 to 779 has typed commands return `true` or `false` | `inline-combobox.tsx`, `slash.tsx`, `combobox.mdx`, the combobox changeset | the slash Text and Heading cases complete on `true`; the refusal case keeps its query | none at runtime; the type widens | keep |
| Slash item guards | Date, Footnote, Inline Equation and AI check installed and read-only; the popup lists nothing in read-only | The inline items' checks and the popup branch go; the AI item keeps its read-only check | `isAvailable`, the `editOnly` slot and the combobox owner; the AI item for its post-commit action | the probes show the inline checks change no result on the same inputs; the AI action runs after the owner's check | `slash.tsx` | the guard probe on both files, the AI read-only probe, and the new owner and AI tests | none once the owner test lands | cut |
| Popup ref type | A local object type in five copied files and the combobox docs example | `EditableSiblingProps`, and `UseComboboxOptions['editableRef']` in `InlineCombobox` | exported contracts | `plate.md` 385 to 391 | slash, emoji, mention, footnote, inline combobox, `combobox.mdx` and its twin | www typecheck | none | cut |

## Design

The arena ran `architect` with three runners, Opus 5.5, `gpt-6-astra` at xhigh and `gpt-6.1-sol` at xhigh, on one outcome prompt. Two read-only explorers wrote its grounding. The prompt named the outcome and a control that adds nothing, which keeps the package plugin and fixes only the copied file's typing. Every runner cut the package, and none preferred the control. An Opus cross-judge scored the anonymized candidates, and the lead scored them again from the same rubric. The prompt, grounding, candidates and verdict are in the run directory as `arena-prompt.md`, `grounding.md`, `cand-1.md` (Astra), `cand-2.md` (Opus), `cand-3.md` (Sol) and `judge.md`.

| Candidate | Owner | Surface | Behavior | Reader load | Adoption | Evidence | Judge | Lead |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Control: keep the package, fix typing | 2 | 1 | 5 | 3 | 5 | 3 | not scored | 19 |
| Astra: cut, export `ComboboxCompletion` | 3 | 3 | 5 | 4 | 4 | 4 | 23 | 23 |
| Opus: cut, drop the item guards, rename to `slash` | 5 | 5 | 3 | 3 | 3 | 4 | 23 | 23 |
| Sol: cut, infer the callback type | 3 | 5 | 5 | 4 | 4 | 5 | 26 | 26 |

The base is Sol's. In it the copied `SlashPlugin` keeps the `slashCommand` name, the package gains no export, `InlineComboboxItem` infers its callback type from `UseComboboxReturn['complete']`, the unused `Item.className` goes, and the package spec gets its own `TestSlashTrigger` instead of a product slash plugin.

The base takes these grafts:

- Opus's candidate deletes the Date, Footnote and Inline Equation guards, `useEditorReadOnly` and the `readOnly ? []` branch. The probes in Evidence show the files with and without them give the same results, read-only through the content and the root `readOnly` props included. The candidate also deleted the AI `onClick` guard, and round 1 of the plan's panel put that one back, as the Panel part of Evidence says.
- Opus's candidate also flags the occurrence host plan instead of editing it, gives the registry changelog one row each for slash, inline combobox, emoji, mention and footnote, fixes the `complete` prose in `combobox.mdx` and its twin, replaces the slash pages' Plugins section with a registry API table in the shape `emoji.mdx` uses, and rewrites both stale shapes in the autocomplete subject.
- Astra's candidate drops `@tanstack/react-virtual` from both slash pages' install line, since neither copied file imports it.
- The judge adds a slash test that a `/` typed in a code block stays text, because no test covers the veto the cut moves.
- The lead points `docs/research/sources/plite/autocomplete-and-triggers.md` lines 51 and 59 at the copied file, and types `InlineCombobox`'s ref as `UseComboboxOptions['editableRef']`, the way its `plugin` prop already reads.

Cases a losing candidate handles that the base drops, and what the plan does with each:

| Case | From | Plan |
| --- | --- | --- |
| The item guards and the read-only branch | Opus | Graft. |
| `combobox.mdx` `complete` prose and twin | Opus | Graft, Phase 1. |
| Both stale shapes in the autocomplete subject | Opus | Graft, Phase 1. |
| Registry changelog rows for emoji, mention and footnote | Opus | Graft, Phase 1. |
| `UseComboboxOptions.editableRef` derived from `EditableSiblingProps` | Opus | Limit. It is a package type with its own doc comment, not a copied mirror, and the rule binds copied UI. |
| The `test:create-install editor-ai` run | Opus | Gate, Phase 3. The autocomplete subject's note that it fails on drag-and-drop types dates from October 3, so only a failure that repeats at the base in a detached worktree counts as base-red. |
| `@tanstack/react-virtual` in the slash install line | Astra | Graft, Phase 1. |
| Packed export maps lack the retired subpaths | Astra | Limit. The export map is the `package.json` edit itself, which the census grep and the entrypoint tests read. |
| A fresh registry install in a new consumer | Astra | Gate, Phase 3, the same create-install run. |
| A read-only slash test | Opus, judge | Dropped. Each read-only layer refuses on its own. With `editOnly` off, the owner still refuses on both read-only routes (`r1-mutant-editonly-a1.log`). With the owner's check off, the slot still unmounts the menu (`probe-mutant-owner-a1.log`). So no single defect fails a slash read-only test, and Phase 1 tests the owner directly instead. |
| A `true`-returning command with one-step undo | Astra, judge | Limit. The slash Text and Heading cases already complete through `upsert`'s `true`; undo belongs to the transaction, not the return value. |
| The `json-helpers-leaf` plan's size evidence | judge | Limit. That plan is executed, so its old bundle name is history. |

The plan declines Astra's public `ComboboxCompletion` export, because `VISION.md` line 41 counts every public name as API, and inference already gives the copied file the type without a new name. It also declines Opus's rename to `slash`, because the same line makes the name API, and the layout review keeps `slashCommand`.

The Opus runner and the judge each wrote a summary under `~/.claude/plans/`, outside the run directory, against their read-only brief. Neither file is an input to this plan.

Challenge delta. Round 1 of the plan's panel kept the base, the cut and every graft but one. The AI item keeps its read-only check. Registry regeneration, the docs and the release notes move into Phase 1, so no phase leaves docs teaching a deleted import. The writing passes and the diff panel run before the runtime proofs. Phase 1 adds the combobox owner's read-only test and the AI test, and its census grep can pass. The create-install run is a gate. One codemod replaces the two, and it writes nothing until every edit matches. Round 2 kept all of that and made each phase end with a registry build after its last edit. Round 3 kept all of that, gave the release notes a branch for a beta that has already shipped the slash changesets, and moved the release and freshness checks onto the tree land.mjs pushes.

## Steps

`<run>` is the run directory, `docs/plans/artifacts/2026-10-18-slash-review/` in the main checkout.

The parent session's brief for this review authorizes the build: a Pursue continues through the Plan and Build playbooks and lands through `land.mjs`. The build starts from `origin/next` at `3b7a369248`. Since the review commit `924b994fde`, that base changed only generated files among the census files. Phase 1's code goes to one delegate in its own worktree, with the brief `<run>/delegate-phase1.md`. The lead writes the docs, the release notes and the teaching fixes in this worktree at the same time, since those files are disjoint from the delegate's. The generated registry output embeds both, so the lead regenerates it after it takes the delegate's commit.

### Phase 1. Cut the package and teach the copied plugin

The code, the docs and the release notes change together, so no state of the tree teaches a deleted import.

- [x] Before the first edit, run `slash.spec.tsx` and `useCombobox.spec.tsx` at the build's base as the pre-edit baseline. Proof: a `base-specs` log with 38 passes.
- [x] Apply the cut with `node <run>/slash-build.mjs <worktree>`. It checks every edit and directory before it writes anything, so a drifted file stops it with the tree untouched. Proof: it prints its applied line with 2 directories removed.
- [x] Regenerate the derived files with `pnpm entrypoint:turbo:generate`, `pnpm brl`, `pnpm plite:entrypoint-sizes:update`, `pnpm lint:baseline` and `pnpm --filter www build:registry`, and the API manifest with `pnpm --filter www api-reference` after building `platejs`. Proof: `pnpm entrypoint:turbo:check` and `pnpm --filter www build:registry --check` pass, and `git status` lists only files in Hard cuts.
- [x] Add three cases, each proven to fail on its own mutant before it counts:
  - In `slash.spec.tsx`, a `/p` typed key by key into a code block with Code Block installed stays text, opens no menu and leaves `aria-expanded` unset. The spec has no settle step, so the test waits as the probe did. A `findByRole` for the Text option with a 300 ms timeout must reject. It fails on `mutate-veto.mjs` at that option check, as the probe did after its 300 ms wait (`probe-mutant-veto-a1.log`).
  - In `slash.spec.tsx`, a view that turns read-only during the AI item's completion commit keeps AI closed and drops the typed `/a`. It fails when the AI item loses its read-only check, as `probe-ai-grafted-a1.log` shows for the probe form.
  - In `useCombobox.spec.tsx`, a view that turns read-only during a mention query closes the popup's match. The test first waits for `match` to become `null`, then checks that the editable lost `aria-expanded` and `role="combobox"`, and last that `complete` with the old match returns `false` without throwing. It fails on `mutate-owner.mjs`, which every combobox spec passes today, at the `match` check. It has no Enter check, because Plite never passes a key to the popup's handler in a read-only view, so that check passes with or without the defect.
- [x] Run `plate-docs` on `content/docs/(plugins)/(functionality)/(combobox)/slash-command.mdx` and its Chinese twin. Its example coverage audit runs first. Manual usage installs the copied kit instead of the package plugin, the Plugins section becomes a registry API table in the shape `emoji.mdx` uses, and the install line drops `@tanstack/react-virtual`.
- [x] Run `plate-docs` on `combobox.mdx` and its Chinese twin, so `complete`'s callback type reads `(tx) => boolean | void`, the text says only `false` refuses, and the `HashtagCombobox` example takes `EditableSiblingProps`. Proof for both docs steps: `pnpm --filter www build:source` and `pnpm --filter www check:docs` pass.
- [x] Through the `changeset` skill, check whether `origin/next`'s `.changeset/pre.json` lists `slash-command-plite-plugin` or `combobox-command-runtime`. A beta release lists both at once, as the open release commit `cc49027baf` does (`r3-release-prejson-a1.log`).
  - While neither is listed, rewrite `.changeset/slash-command-plite-plugin.md` as a removal with a migration from `@platejs/slash-command` to the copied `SlashKit`, in the shape of `emoji-v54-runtime.md`. It names the v53 package and `SlashPlugin`, which the census does not match, and no removed `platejs` name. Change the refusal bullet in `.changeset/combobox-command-runtime.md` to say a callback returns `true`, `false` or nothing.
  - Once they are listed, the beta has shipped `platejs/slash-command`, and Changesets ignores later edits to both files until the beta ends (`@changesets/assemble-release-plan` 6.0.9, lines 579 to 581). Restore both files to `origin/next`'s text, and write one new `platejs` changeset, `.changeset/slash-command-removal.md`, that removes `platejs/slash-command` with the same migration and says a completion callback returns `true`, `false` or nothing.

  Add one registry changelog entry with rows for `slash`, `inline-combobox`, `emoji`, `mention` and `footnote`. Proof: `node tooling/scripts/generate-ui-changelog-entries.mjs --check` passes, and each sentence matches the shipped code.
- [x] Run `best-api repair`. The autocomplete subject's slash example defines the plugin in the copied file, and its mention popup takes `EditableSiblingProps`. `markdown-editing-spec.md` names `slash.tsx` for slash's 75-character cap. Through `research`, lines 51 and 59 of the research source name the copied file, drop the "guarded items that return `false`" clause and fix their `BaseEmojiPlugin.ts` citations. `slash.json` names `slash.tsx` as its owner and drops `packages/platejs/package.json`, `plate-keys.ts` and the deleted `packages/platejs/src/features/slash-command/` from its members, and `autocomplete.json` drops the deleted paths. Proof: `teaching-sweep.mjs` lists live teaching of a removed name only in the flagged occurrence host plan, this plan, older plans that carry no status label, and the slash subject, which Phase 3's fold rewrites.
- [x] Close the phase's edits. Run `pnpm lint:task` on the changed files, then `pnpm --filter platejs build`, `pnpm --filter www api-reference` and `pnpm --filter www build:registry`. The registry output embeds the registry sources and the English docs pages, so a docs edit after a registry build leaves it stale (`r2-registry-check-after-docs-edit-a1.log`). The API manifest embeds the built `platejs` declarations and their comments, so it needs a fresh build too. Proof: the lint log, and `pnpm --filter www api-reference:check` and `pnpm --filter www build:registry --check` pass.
- [x] Census. `git grep -n -E "['\"]platejs/slash-command|['\"]\./slash-command['\"]|\.\./slash-command/|BaseSlashPlugin|SlashPluginState|SlashDefinition|PLUGINS\.slashCommand|features/slash-command" -- tsconfig.json packages apps tooling content templates .changeset ':!**/CHANGELOG.md' ':!**/release-index.json'` finds nothing. After a beta ships the slash changesets, it also skips `':!.changeset/slash-command-plite-plugin.md' ':!.changeset/slash-command-removal.md'`, because the shipped file matches at line 7 (`r3-census-released-changeset-a1.log`). At the base it lists 34 files, each one this phase edits, deletes or regenerates.
- [x] Run the narrow checks. Proof: logs for `slash.spec.tsx` with `useCombobox.spec.tsx` at 41 passes, `tsc -p tsconfig.json` and `tsc -p tsconfig.package-integration.json` in `apps/www`, `pnpm --filter plite typecheck`, `pnpm --filter platejs typecheck`, the `platejs` type tests, the entrypoint tests, `pnpm --filter www api-reference:check`, `pnpm --filter www build:registry --check`, and the `platejs` spec typecheck with the build base's error count in each file.
- Keep when every check passes, and fix forward. Phase 1 lands only whole; revert all of it when a check fails for a reason the cut cannot fix.

### Phase 2. Review the diff

- [x] Run `deslop`, then `no-comments`, over the product code, and `unslop` over the docs, release notes and plan. Proof: a `writing` row per pass.
- [x] Run `pnpm exec oxlint --type-aware --format=default` on the task's lintable files without fixing, and check its file count against the paths passed.
- [x] Run the panel on the diff (reviews row `api-build`), fix its critical findings with a test for each, and run the writing passes again on the fixes. Proof: its `seats` and finding rows.
- [x] After the phase's last edit, close the edits as Phase 1 does: `pnpm lint:task` on the changed files, the `platejs` build, `api-reference` and `build:registry`. Proof: `pnpm --filter www api-reference:check` and `pnpm --filter www build:registry --check` pass.
- Keep when no critical finding is left unsettled. A fix that changes behavior reruns the narrow checks it touches before Phase 3.

### Phase 3. Prove and land

- [x] Run `pnpm --filter www typecheck` and `pnpm check` on the settled tree, in the background and under the hour. A red step reruns alone, then at the base in a fresh `--install` worktree, and a step that fails there with the same findings becomes a `base-red:` row. Proof: the www typecheck exits 0, and each red `pnpm check` step is base-red with no finding the base lacks.
- [x] Run `pnpm --filter www test:create-install editor-basic editor-ai`. A failure reruns at the base in a detached worktree, and only the same failure there becomes a `base-red:` row with a suggested task. Proof: its log, and the base log when it fails.
- [x] Run the www combobox browser spec in Chromium against a doctored `dev:plite` server. Proof: `PLAYWRIGHT_BASE_URL=<url> pnpm --filter www test:www-browser:chromium tests/browser/combobox.spec.ts` passes, its slash cases included.
- [x] Hand drive the 23 desktop cells and 20 load cells that `hand-drive.mjs scope` lists for the changed files. Type `/` key by key on `/blocks/slash-command-demo`, pick Heading 1, Date, Inline Equation and AI, and check the menu stays out of a code block. Proof: `node tooling/scripts/hand-drive.mjs check` passes, and a screenshot of each typed cell is read.
- [x] Before the land, write the `## Close` and fold this plan into `docs/plans/topics/slash.md`, and set `Status:` to executed in the same edit. The subject then ships in the landed commit, as the Build playbook's close says. Then run `review-ledger.mjs check` on this plan and `teaching-sweep.mjs` on the removed names. The diff panel's next round reviews the fold with round 1's fixes. Proof: `plan-page.mjs --folded` renders the subject, the sweep lists no live hit under `docs/plans/topics/`, and the check passes.
- [x] Land through `node .agents/pstack/land.mjs --message <file>` with `--check`s, which land.mjs runs on the rebased tree before it pushes: `pnpm --filter platejs build && pnpm --filter www api-reference:check`, `pnpm --filter www build:registry --check`, and, when Phase 1 rewrote the changesets, `! grep -q -E 'slash-command-plite-plugin|combobox-command-runtime' .changeset/pre.json`. A beta release that lands first fails that last check. Then take the changeset step's other branch and land again. Resolve a rebase conflict in a generated file by regenerating it. land.mjs's push retry rebases again without the checks, so when it prints a retry, rerun the checks on the landed commit in a fresh detached worktree and land any fix forward. Proof: the land log and the landed commit on `next`.
- [x] Run `node tooling/scripts/review-ledger.mjs next` and offer the item it names as a suggested task. Proof: the offered card.
- Keep when every box is checked. A failed land reverts nothing; it goes back to the failing check.

## Completion gates

| Gate | Evidence |
| --- | --- |
| Blast radius before code moves | the census and spike in Evidence, `grounding.md` |
| Hard-cut sweep of callers, exports, tests, docs, examples and browser proof | Phase 1 census `close-census-a2.log`; Phase 3: `phase3-combobox-chromium-a1.log`, and the entrypoint count the census missed, fixed in `phase3-release-artifacts-test-a1.log` |
| `best-api repair` | Phase 1: `close-teaching-sweep-a1.log`; Phase 3, after the fold: `fold-teaching-sweep-a1.log`, `fold-topics-after-a1.log` |
| `plate-docs` with its example coverage audit | Phase 1: `close-check-docs-a2.log` |
| Changeset and registry changelog | Phase 1: `close-ui-changelog-check-a1.log` |
| `pnpm check` steps before the acceptance runs | Phase 3: `phase3-check-a1.log`, `red-base-a1.log`, `red-base-cli-a2.log`, `red-head-www-a1.log`, `phase3-full-tests-head-a1.log`, `phase3-full-tests-base-a2.log` |
| Type-aware oxlint before the diff panel | Phase 2: `phase2-oxlint-type-aware-a1.log` |
| Panel on the diff (`api-build`) | round 1: `panel-diff-1.md` and its three answers; round 2: `panel-diff-2.md` and its three answers; round 3: `panel-diff-3.md` and its three answers |
| Hand drive | Phase 3: `phase3-hand-drive-check-a1-a1.log` |
| Playtest | skip: `playtest.mjs scope` finds no scenario catalog for the changed files, and the cut adds no feature |
| `thermos` | skip: the `api-build` panel on the diff covers both lenses |
| Benchmark | skip: the only payload change is the deleted entrypoint, which `plite:entrypoint-sizes:update` records |
| `check-plate-feature.mjs` | skip: a hard cut, not a feature delivery |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Slash package | Delete both slash import paths and move the plugin into the copied file (look) | Keep the package plugin | keep slash package | big |
| Item results | Items hand their command's yes or no straight to the popup (look) | Keep the small adapter in the slash file | keep slash adapter | small |
| Item checks | Drop the read-only and installed checks the popup already makes for Date, Footnote and Inline Equation (look) | Keep the checks in each item | keep slash guards | small |
| AI item check | Keep the AI item's read-only check, because it opens AI after the popup's edit is done | Drop it with the others | drop slash AI guard | detail |
| Code block test | Add one slash test that a slash typed in a code block stays text | Add no test | no slash veto test | detail |
| Read-only tests | Test read-only in the shared popup code and on the AI item, not across the whole slash menu | Add a slash read-only test too | add slash read-only test | detail |
| Popup props type | Use Plate's shared types in the slash, emoji, mention, footnote and shared popups, and in the combobox docs example | Fix the slash popup only | slash popup only | detail |
| Completion type | Add no new public type; the copied popup infers it | Export the completion type from Plate | export completion type | detail |
| Plugin name | Keep the name slashCommand | Rename it to slash | rename slash plugin | detail |
| Shipped release notes | If a beta ships the slash release notes first, leave them as they are and add one new note for the removal and the callback change | Rewrite the shipped notes for the stable release | rewrite shipped slash notes | detail |
| Next step | Plan and build now | Stop once the plan is written | stop at plan | detail |

## Open work

- The autocomplete occurrence host plan's gated Phase 2 still names `SlashPlugin.configure`, `SlashPluginState`, the `slash-command/react` entrypoint edge and the slash changeset. After this cut it targets the copied `SlashPlugin` in `slash.tsx`. owner: that plan's Phase 2. stop: its verdict gate.
- Once, this run said a check already failed before the change because an old note said so, without running it there. The panel's first round caught it in the create-install row. owner: suggested task `t_b329e1e4`, which runs `/pstack:correct` on it. stop: the owner starts or drops it.
- Twice, this plan described a new test whose assertion could not catch its defect. One assertion would have failed through an unrelated error, and one would pass with or without the defect. The panel's second and third rounds caught them in the owner test. owner: suggested task `t_b329e1e4`. stop: the owner starts or drops it.
- Three times, the census of removed names missed a test that counts the removed entrypoints: two counts in the entrypoint tests during the spike, and the 32 in `check-plite-release-artifacts.test.mjs` in Phase 3. owner: suggested task `t_b329e1e4`. stop: the owner starts or drops it.
- Twice, the Close listed fewer failures than its logs held, in the diff panel's rounds 2 and 3. The second time, the base and head comparison matched only failure lines and missed the seven files bun could not load. owner: suggested task `t_b329e1e4`, which waits on the three active plans that edit the `correct` subject. stop: the owner starts or drops it.
- The diff panel's first round found that this plan left the slash subject teaching the removed plugin until after the land. That is a live teaching-sweep hit, and row 37 of `docs/development/enforcement.md` enforces acting on sweep hits by rule only. owner: `/pstack:correct` on that class in this session, after the land. stop: the close.
- Checks that already fail on `next` at `3b7a369248` stay red: `pnpm check`'s `lint`, `core-audits`, `plite-bridge`, `review-ledger`, `knowledge`, `test-slow` and `cli-test`, and in `pnpm test` and `plite:test` the public import smoke list, the footnote navigation case, the AI discard tests and the kernel authority audit case. owner: the chips ledger tasks that own each, such as `t_05e726ee`, `t_9ab7fdd4`, `t_3ea68f2e`, `t_278b93f3`, `t_ceb53af4`, `t_e044002d`, `t_c411234d` and `t_c1908482`. stop: those tasks.

## Close

Reversals and deviations come first. No step reversed. All three seats of the diff panel's first round found that the slash subject still taught the removed plugin, because the plan folded it only after the land. The fold now comes before the land and ships in the landed commit. The first attribution of `pnpm check` missed one failure the cut caused. `tooling/scripts/check-plite-release-artifacts.test.mjs` pinned 32 Plate entrypoints, and the cut leaves 30. Phase 1's census matched the removed names, not counts of them, and the spike had already found two such counts in the entrypoint tests. The test now expects 30, and `pnpm test` and `pnpm plite:test` ran again in full, because the first `plite-test` run stopped after its layout timeout with 115 of 138 tasks done. The full runs at head fail only on cases that open suggested tasks already own, and a full run at the base in a detached worktree checks each of them. The Chromium spec ran on the `dev:plite` server its managed runner started from this worktree, not a doctored one, because `PLAYWRIGHT_BASE_URL` was unset. The hand drive ran on a dev server started from the shell, because after the app restarted `preview_start` resolved launch entries in the main checkout. `hand-drive.mjs scope` listed 23 desktop cells at the build, not the 20 the plan counted. Phase 2's `lint:task` on round 1's three Markdown files exited 2, because lint ignores Markdown; their format check passed. The land message names `tooling/entrypoints/platejs-entrypoint-sizes.json` and `packages/platejs/turbo.json` on its `Beyond the ask:` line. Each regenerated file also carries drift the base already had: the sizes file's other rows, kept in full on the owner's word, and turbo.json's `typecheck:partition:layout` dependency from base commit `59f4816b75`. The fold moved only the occurrence host item into the subject's Open work, though the fold rule moves all of it. The other six items are lessons about this run's workflow or checks that already fail on `next`, not slash decisions, so they stay in this plan. Suggested task `t_b329e1e4` takes four of the lessons, chips tasks own the checks, and this session runs `/pstack:correct` on the late fold's class after the land.

What landed. `apps/www/src/registry/components/editor/slash.tsx` defines `SlashPlugin` with `definePlugin('slashCommand')`, `editOnly`, the five `ComboboxState` trigger defaults and the code-block veto in `triggerQuery`. `platejs/slash-command`, `platejs/slash-command/react`, `BaseSlashPlugin`, `SlashPluginState`, `SlashDefinition` and `PLUGINS.slashCommand` are gone, with their five source files, including `packages/platejs/src/react/features/slash-command/SlashPlugin.tsx`, and their two tsconfig entrypoints. `ComboboxCompletion` in `packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts` returns `boolean | void`, and only `false` refuses. The Date, Footnote and Inline Equation items return their command's result with no read-only or installed check, the popup lost its read-only branch, and the AI item keeps its read-only check. The slash, emoji, mention and footnote popups take `EditableSiblingProps`, and `apps/www/src/registry/components/editor/inline-combobox.tsx` types `InlineComboboxItem`'s `onSelect` from `UseComboboxReturn['complete']`. `apps/www/src/registry/components/editor/slash.spec.tsx` and `packages/platejs/src/react/features/combobox/useCombobox.spec.tsx` gained the three new tests. The slash command and combobox pages and their Chinese twins, `.changeset/slash-command-plite-plugin.md`, `.changeset/combobox-command-runtime.md`, a registry changelog entry, the markdown editing spec, `docs/plans/topics/autocomplete.md`, the research source and both review scopes teach the copied plugin, and `docs/plans/topics/slash.md` holds this plan's fold. The build ran as wip commits on `worktree-slash-review` from `89e5ab4fbf`, and `land.mjs` squashes them into one commit on `next`.

The proof, from each row's own scope:

- New tests. `slash.spec.tsx` with `useCombobox.spec.tsx` passed 38 cases at the base and 41 after Phase 1. Each new test fails on its own mutant at its own assertion: the code-block case at its option check, the AI case at its open check and the owner case at its match check.
- Narrow checks. Both www `tsc` projects, the plite and `platejs` typechecks, the `platejs` type tests, the entrypoint tests at 42 of 42, `entrypoint:turbo:check` and lint exit 0. The `platejs` spec typecheck reports 247 errors in 80 files at the base and after the cut, with the same count in each file.
- Phase closes. Phase 1's lint covers 13 of 71 changed paths and passes. After each phase's last edit the `platejs` build, `api-reference:check` and `build:registry --check` pass, and the census finds no match.
- Docs and release notes. `build:source`, `check:docs` and the registry changelog check pass.
- Teaching. Phase 1's sweep found 53 live hits: this plan, the slash subject, the flagged occurrence host plan, older plans with no status label, research artifacts of past runs and the playground template, which keeps `@platejs/slash-command@^53`. After the fold the sweep finds 29, none under `docs/plans/topics`, and `kb.mjs check` reports the base's 66 findings, none on the slash subject.
- Writing and lint. Phase 2's `deslop`, `no-comments` and `unslop` changed no line. Each diff round's prose fixes got an `unslop` pass, which changed one Close sentence after round 1 and two after each later round, and `bro` restated the Brief after round 1. Type-aware oxlint finds nothing in 13 of 13 product files.
- `pnpm check`. On the frozen tree `cba25b9c03`, 16 of 26 steps passed. `lint`, `core-audits`, `plite-bridge`, `review-ledger`, `knowledge`, `test-slow` and `cli-test` fail at the base `3b7a369248` with the same findings, except knowledge's K7 on the slash subject, which the fold removes. The `www` step passes after a relink of this worktree's `plate` bin. The link iframe dismissal and the column width preset failed under load and pass alone. The footnote read-only jump fails in every full run with the same `spyOn` error and passes alone, and `t_e044002d` owns finding why. The `test` step also failed on the entrypoint count above and on the public import smoke list, the same failure `test-slow` shows. Run again in full, with turbo's `--continue` on both `plite:test` runs, `pnpm test` and `plite:test` at head fail only on five cases: the public import smoke list, the footnote navigation case, the two AI discard tests and the kernel authority audit's mutation owner case (`phase3-full-tests-head-a1.log`). `t_ceb53af4`, `t_e044002d`, `t_c411234d` and `t_c1908482` own them. The same run at the base, in a fresh worktree, fails each of the five the same way (`phase3-full-tests-base-a2.log`). Three more cases fail only at the base, and seven www test files never load there. DocsNav cannot load the generated `collections/server` module, which the fresh base worktree lacks, and neither can those seven files: the docs page, the docs page tree, the search route and four LLM route tests. The turbo state check fails on the base's stale `turbo.json`, which this change regenerates. The link iframe dismissal times out under load, as it did once at head.
- Install. `test:create-install` builds editor-basic and editor-ai in base-nova and radix-luma, four consumers.
- Browser. The www combobox spec passes 21 of 21 in Chromium. Four of them are slash cases: AI in a suggested paragraph by Enter and by click, a slash inside prose, and a pick under reduced motion.
- Hand drive. `hand-drive.mjs check` covers 23 desktop and 20 load cells. Typed key by key on the slash demo, Heading 1, Date, Inline Equation and AI land, and `/p` in a code block stays text with no menu. Mention, emoji, footnote and the combobox typing page pick through their popups, and the four changed docs pages show the new text.
- Plan panel. Three rounds of Opus, `gpt-6-astra` and `gpt-6.1-sol` at xhigh found five critical findings, and the lead applied all five.
- Diff panel. In round 1 each seat found one critical finding, the late fold, which the lead applied. The lead also applied Opus's warning and two nits: six short spec citations, the turbo.json record and the slash node in the migration. In round 2, Opus found one critical finding. This Close said the `test` step's only other failure was the entrypoint count, but the public import smoke list failed there too. The lead fixed the sentence. All three seats found that the migration named the wrong file as the one importing `@platejs/slash-command`, and the lead fixed it. The lead also applied the nits on the writing passes' scope, the base run's result, the reason only one Open work item moved into the subject and row 52's command proofs, and declined the one on fence order. In round 3, Opus and Astra found one critical finding. The Close named three base-only failures and left out the seven www test files the base never loaded. The lead added them here and to Limits. The lead also applied Opus's warning that turbo stopped `plite-test`, not `test`, and the nits on the shared case count, the footnote case, this list, the Open work deviation and the proof scripts' home. Round 3 was the last round the cap allows.

Limits. Unit tests ran in happy-dom. The browser spec and the hand drive ran in Chromium at desktop width, so Firefox, WebKit, Safari, phones and a real IME did not run. The census covers this repository, so apps outside it that import `platejs/slash-command` are unknown, and the changeset gives them the migration. The base never ran the seven www test files it could not load, so they have no base control, and head passes all of them. The base-red `pnpm check` steps stay red on `next`.

Counts. The parent session's brief asked for a verdict on the current code and, on a Pursue, the Plan and Build playbooks, a diff panel, the land and a suggested task for the next ledger item. The verdict, plan, build, fold, diff panel and offer are done, and `land.mjs` lands this commit. `review-ledger.mjs next` names `styles`, Text marks and presentation, which suggested task `t_0cb0951d` offers on card `task_ee643d3b`. The owner's two messages are done: "1", which kept the regenerated sizes file, and "c", which resumed the run. Of the 13 completion gates, nine pass, and Playtest, `thermos`, Benchmark and `check-plate-feature.mjs` skip with their reasons. Three plan rounds found five critical findings, all applied, and the diff's three rounds found one each, all applied.

Review inputs. The verdict read the law in `VISION.md`, `docs/vision/common.md` and `docs/vision/plate.md`, the subjects `docs/plans/topics/autocomplete.md` and `docs/plans/topics/emoji.md`, and the plans `docs/plans/2026-10-03-autocomplete-occurrence-host.md` and `docs/plans/2026-10-08-emoji-review.md`. Besides the files named above, the build changed `apps/www/src/registry/components/editor/emoji.tsx`, `tooling/entrypoints/entrypoint-dag.mjs`, `content/docs/(plugins)/(functionality)/(combobox)/slash-command.mdx` and `content/docs/(plugins)/(functionality)/(combobox)/combobox.mdx`. `packages/platejs/src/react/features/combobox/useCombobox.ts`, `packages/platejs/src/react/plugin/PlatePlugin.ts`, `packages/platejs/src/react/components/EditorContentView.internal.tsx`, `packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts`, `apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx`, `apps/www/src/registry/components/editor/block-menu.tsx` and `apps/www/src/registry/components/editor/plugins.ts` stay unchanged.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

Prior work. `node tooling/scripts/review-ledger.mjs lookup slash` names the [2026-10-04 audit 2](../research/review-records/2026-10-04-slash-audit-2.json) as the head, a Pursue that no plan adopted. It reads stale because `slash.tsx` and `slash.spec.tsx` changed since, and `VISION.md` and `docs/vision/common.md` moved. Its plans are the [2026-09-18 slash UI actions plan](2026-09-18-slash-ui-actions-implementation.md), which moved every item onto typed `insert` and `upsert`, the [2026-09-16 AI suggested paragraph plan](2026-09-16-slash-ai-suggested-paragraph.md), the [2026-09-07 UI extraction audit](2026-09-07-full-plate-ui-extraction-audit.md) and two combobox regression plans from August. A search of `docs/plans` for `slash-command`, `SlashPlugin` and `BaseSlashPlugin` finds twelve plans. Only the [autocomplete occurrence host plan](2026-10-03-autocomplete-occurrence-host.md) is open; its gated Phase 2 edits `SlashPlugin.configure` and the `slash-command/react` entrypoint edge. The [emoji review](2026-10-08-emoji-review.md) landed the same cut for emoji. The ledger's status before this review: 70 scopes, 0 unreviewed, 2 forks, 12 Pursue verdicts no plan has adopted, 1 deferred, 55 closed and 84 unowned paths.

Since the audit's commit `17195da367`, `slash.tsx` gained a Details title branch, where Heading sets the title's level in place and Text clears it (`00adcecc79`, `9205e4e1b6`), renamed `BaseColumnPlugin` to `BaseColumnGroupPlugin` and dropped the Code Drawing item. `slash.spec.tsx` gained ten Details and refusal cases. The package's `slash-command` directories did not change. The combobox owner changed by two lines, a refusal sentinel and an explicit effect return.

### Requirements

- Typing `/` at a line start or after whitespace opens the menu in its own Editable, the query stays ordinary text, and completion replaces trigger and query in one refusable transaction that undoes in one step ([autocomplete subject](topics/autocomplete.md), `useCombobox.spec.tsx`, `slash.spec.tsx`).
- No trigger opens inside a code block (`slash.tsx` `triggerQuery`, `slash.spec.tsx`).
- A read-only view never completes a slash item and keeps the typed text (`comboboxOwner.internal.ts` `isEditable`, the `editOnly` slot gate in `EditorContentView.internal.tsx`).
- Copied registry source owns catalogs, filtering, the active option and presentation, and each feature plugin's `ComboboxState` in `initialState` holds its trigger policy ([autocomplete subject](topics/autocomplete.md), Layer and owner).
- A plugin stage used only by copied registry UI is registry-owned when its job is product composition, and package publication needs independent terminal consumers or a durable headless contract. A package import, export, docs page or test is not an independent terminal consumer ([plate.md](../vision/plate.md), lines 1141 to 1150).
- Packages ship semantically neutral defaults, and opinionated product behavior lives in copied registry source ([VISION.md](../../VISION.md), Plate Essentials).
- Copied UI types a framework-defined plugin field with the package's exported contract, never a local structural mirror ([plate.md](../vision/plate.md), lines 385 to 391).
- A block `insert` or `upsert` returns `false` with nothing changed when the block does not fit, so a slash command keeps its query ([plate.md](../vision/plate.md), lines 776 to 779; `slash.spec.tsx`, "keeps the query when the chosen block does not fit its parent").
- On a Details title, Heading formats the title in place and Text clears its level; other blocks land after a closed Details and inside an open one (`slash.spec.tsx`).
- Hard cuts beat compatibility during the beta ([VISION.md](../../VISION.md), Invariants).

### Lanes

1. **Keep `platejs/slash-command`. Loses.** Two subpaths, four exported names and one `PLUGINS` key carry five default values and `editOnly`. A `git grep` over packages, apps, content and tooling at `924b994fde` finds four code users: the copied `slash.tsx`, `slash.spec.tsx`, the combobox typing dev page and `useCombobox.spec.tsx`, plus the docs page. The law counts only the copied file as a terminal consumer. No headless code reads the plugin or its key.
2. **Strongest deletion: define `SlashPlugin` in the copied `slash.tsx` and delete both entrypoints, their types, the `PLUGINS` key and the docs API section. Wins.** `emoji.tsx` landed this exact shape on 2026-10-09, and the autocomplete subject teaches it for any custom trigger. The spike below ran it.
3. **Let the completion accept a typed command's boolean. Wins, with lane 2.** `ComboboxCompletion` is typed to return `false` or nothing, while `upsert`, `setLevel` and `blocks.reset` return a boolean. So `slash.tsx` maps each result through `=== false ? false : undefined`, and its date, footnote and inline equation items end in a bare `return undefined`. The runtime already refuses only on `false` (`comboboxOwner.internal.ts`, line 153).
4. **Move the Details title rule into Heading's `upsert`. Loses.** `upsert`'s job is insertion ([plate.md](../vision/plate.md), lines 765 to 780). `setLevel` already formats a title, and which verb an item runs on a title is catalog policy; the turn-into and block menus call `setLevel` directly.
5. **Move the catalog or an item factory into the package. Loses.** Labels, icons, groups, AI membership and feature choice are product policy, and the autocomplete subject rejects promoted option catalogs.
6. **Merge slash into the combobox package. Loses.** Combobox owns the neutral occurrence and completion contract that mention, emoji and footnote share.
7. **Give `ComboboxState` defaults so a copied plugin names only its trigger. Not this scope.** The autocomplete subject owns that lever, and this cut does not need it.
8. **The rule is wrong. Not a lane.** No subject decision or Vision rule blocks the target.

The popup restates `editableRef` in a local object type, and so do the copied emoji, mention, footnote and inline combobox files, while `link.tsx`, `lint.tsx`, `discussion.tsx` and the floating toolbar take `EditableSiblingProps`, the exported contract for components beside the Editable. That breaks the typing rule above and is a P3 fix in the same files.

### Spike and probes

A copy-on-write clone of the worktree at `924b994fde`, without its `.git`, ran the cut through `slash-cut.mjs`. Logs are in the run directory, `docs/plans/artifacts/2026-10-18-slash-review/`.

- `slash.spec.tsx` and `useCombobox.spec.tsx` pass 38 cases at the base and the same 38 after the cut (`base-specs-a1.log`, `spike-specs-a1.log`).
- www typecheck, `platejs` typecheck and the `platejs` type tests exit 0 after the cut (`spike-www-tsc-a1.log`, `spike-platejs-typecheck-a1.log`, `spike-platejs-type-tests-a1.log`). The `platejs` spec typecheck has 247 errors at both, in the same files (`base-platejs-spec-tsc-a1.log`, `spike-platejs-spec-tsc-a1.log`).
- `pnpm entrypoint:turbo:check` passes after regeneration (`spike-turbo-check-a1.log`). The entrypoint tests pass 41 of 42; the miss reads `git ls-files`, which the clone without `.git` cannot answer (`spike-entrypoint-tests-a2.log`). The first run also found two runtime counts the census missed, now in the codemod (`spike-entrypoint-tests-a1.log`).
- The guard probe is `slash.probe.spec.tsx` in the run directory. It types `/date` with Date installed and inserts it. It turns the view read-only mid-query, once through the content's `readOnly` prop and once through the root's, then presses Enter and clicks the stale option. That click lands on a detached node, so what the probe shows is the menu closing and the text staying. It opens the menu without Date installed and looks for Date. It types `/p` in a code block and in a paragraph with Code Block installed. The file with the guards and the file without them pass the same 19 cases with the slash spec (`probe-guarded-a2.log`, `probe-grafted-a3.log`).
- Each read-only layer refuses on its own. With `editOnly` turned off by `mutate-editonly.mjs`, the combobox owner still closes the menu and keeps `/date` on both routes, and all 19 cases pass (`r1-mutant-editonly-a1.log`). With the owner's read-only check removed, the `editOnly` slot still unmounts the menu (`probe-mutant-owner-a1.log`). The same owner mutant also passes every package combobox spec and the footnote combobox spec (`owner-mutant-pkg-specs-a1.log`), so no test covers the owner's own read-only check, and Phase 1 adds one. Both layers read one effective read-only flag, which `PlateContent.spec.tsx` already tests ("syncs readOnly and disabled into the Plite view state"). A third layer keeps the text whatever the other two do, because Plite's view `update` throws in a read-only view (`packages/plitejs/src/editor-runtime-view.ts`, line 1371). So the owner's own job is to close the match when the view turns read-only. That removes the popup's ARIA from the editable, and a later `complete` with the old match returns `false` at its stale-match check. A `complete` that runs before that refresh meets the view's throw on both trees, and Plite never passes a key to the popup's handler in a read-only view (`packages/plitejs/src/react/editable/keyboard-input-strategy.ts`, lines 649 to 685). So the owner test checks the closed match first.
- The AI probe, `slash.ai-probe.spec.tsx`, turns the view read-only through `flushSync` in `onValueChange` while the AI completion commits. With the AI item's read-only check, AI stays closed (`probe-ai-guarded-a1.log`); without it, AI opens in the read-only view (`probe-ai-grafted-a1.log`).
- `slash-build.mjs`, run on an export of the base, gives the same tree as `slash-cut.mjs` then `slash-graft.mjs` except the kept AI check, and a second run refuses and changes nothing (`r1-slash-build-check-a1.log`). With its `slash.tsx`, the slash spec, the guard probe, the AI probe and the combobox spec pass 45 of 45 and `tsc -p tsconfig.json` exits 0 (`r1-specs-a1.log`, `r1-www-tsc-a1.log`).
- In the spike after the cut, `pnpm build:registry --check` fails on stale registry output and passes after `pnpm build:registry` (`r1-registry-check-before-a1.log`, `r1-registry-build-a1.log`, `r1-registry-check-after-a1.log`), so Phase 1 regenerates the registry before its checks. One line appended to `slash-command.mdx` after that build makes the check fail again, and restoring the page makes it pass (`r2-registry-check-fresh-a1.log`, `r2-registry-check-after-docs-edit-a1.log`, `r2-registry-check-restored-a1.log`), so each phase regenerates after its last edit.
- The code-block probe fails when `triggerQuery` always returns `true` (`probe-mutant-veto-a1.log`), and no other case fails there.
- After the pick, `spike-delta.mjs` brought the spike to the revised codemods. Then the slash spec, the probe and the package combobox spec pass 44 of 44, the www typecheck and the `platejs` typecheck exit 0, and the `platejs` spec typecheck keeps the base's 247 errors in the same 80 files with the same count each (`spike-specs-a2.log`, `spike-www-tsc-a3.log`, `spike-platejs-typecheck-a2.log`, `spike-platejs-spec-tsc-a2.log`).

Proof limits. The spike ran unit tests in happy-dom and typechecks, not a browser, and its www check was `tsc -p tsconfig.json`, not the `typecheck` script; the build's Phase 3 runs the full script, `pnpm check`, the browser spec and the hand drive. The census is in-repository, so external apps that import `platejs/slash-command` are unknown. The lead read the reference editors and ran none of them.

### Panel

Round 1 on the plan ran `claude-opus-5-5`, `gpt-6-astra` and `gpt-6.1-sol`, each at xhigh, on one prompt, `panel-plan-1.md`, over the plan frozen as `plan-p1.md`. The lead applied all three critical findings:

- Phase 1 could not pass the www `typecheck` script, which checks registry freshness before TypeScript. Sol and Astra raised it, and Opus raised it as a warning. Phase 1 now regenerates the registry and names its narrow checks, and Phase 3 runs the full script and `pnpm check`.
- The AI item's read-only check guards an action that runs after the completion commits. Sol raised it. The check stays, and the AI probe shows the difference.
- The census grep matched slugs and demo names the plan keeps. Opus raised it, and Sol and Astra raised it as warnings. It now matches import specifiers and the removed names, and expects no hit.

The warnings and nits each changed the plan: the combobox docs example, the owner test, the phase order, fix-forward docs, the create-install gate, the closing ledger step, the review scope owner, the research source wording, the merged codemod and the declined export's citation. The decision log has each one.

Round 2 ran the same seats on `panel-plan-2.md`, over the plan frozen as `plan-p2.md`, and checked only round 1's changes. Sol and Astra found nothing. Opus found one critical issue, which the lead applied. The registry was rebuilt only once, before the docs edits, `lint:task` and Phase 2's passes, so Phase 3's registry check would fail. Phase 1 and Phase 2 now each end with `lint:task` and a registry build. Opus's warnings and nits also changed the plan: the owner test's assertions, a check for the open beta release, the root `tsconfig.json` in the census, the changeset's names, the deleted directory in `slash.json` and the veto test's timing.

Round 3 ran the same seats on `panel-plan-3.md`, over the plan frozen as `plan-p3.md`, and checked only round 2's changes. All three found the same critical issue, which the lead applied. Once a beta lists the slash changesets, the shipped slash changeset stays on disk and matches the census at line 7, so the census could not reach zero (`r3-census-released-changeset-a1.log`). On that branch, both shipped changesets now stay as they are. One new changeset carries the removal and the completion change, and the census skips the shipped file and the new one. The warnings also changed the plan. The combobox changeset edit now depends on the release state. land.mjs runs the release, registry and API checks on the rebased tree. Each phase rebuilds `platejs` and the API manifest along with the registry. The owner test checks the closed match and the editable's ARIA instead of the Enter, and the veto test names its wait. Round 3 is the last plan round.

### Dependents

- `react`: affected. `packages/platejs/src/react/features/slash-command/SlashPlugin.tsx` goes with its entrypoint.
- `ui`: affected through the kit only. `apps/www/src/registry/components/editor/plugins.ts` installs `SlashKit` from `slash.tsx`, which keeps that export. The demo values import `slash-command-value.tsx`, which does not change.
- `distribution`: unaffected. `markdownParagraph.ts`, `utils/index.ts` and `ExitBreakPlugin.ts` import only the `PLUGINS` table from `utils/plate-keys.ts`, and none reads `slashCommand` (`git grep`).
- `editing`: unaffected for the same reason. `ExitBreakPlugin.ts`, `SingleBlockPlugin.ts`, `SingleLinePlugin.ts` and `TrailingBlockPlugin.ts` import only the `PLUGINS` table.

### History

- This review supersedes the [2026-10-04 audit 2](../research/review-records/2026-10-04-slash-audit-2.json). It keeps that audit's target and rejected lanes, because the package did not change and the law it cited still holds where the combobox rules moved, into the autocomplete subject. It adds the completion, guard and slot-type fixes the current `slash.tsx` shows.
- It retains the [2026-09-18 slash UI actions plan](2026-09-18-slash-ui-actions-implementation.md), whose typed `insert` and `upsert` items still hold in `slash.tsx`.
- It retains the [2026-09-16 AI suggested paragraph plan](2026-09-16-slash-ai-suggested-paragraph.md)'s behavior, which `slash.spec.tsx` still covers, without inheriting its proof.
- External checkouts read on 2026-10-18: `../tiptap` at `91c51be53c`, `../lexical` at `dd5c41b131`, `../BlockNote` at `1e26f1c5e1` and `../slate` at `945a484df2`.
