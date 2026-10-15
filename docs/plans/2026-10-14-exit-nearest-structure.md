# Exit leaves only the nearest structure

Status: executed: uncommitted on next for the owner to commit
Page: https://claude.ai/artifact/W25CeDUbwjf8odecjFypYY
Playbook: plan

Execution playbook: Build (`.agents/playbooks/build.md`). Run directory: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/`. Intake base: `6fa1169c5e` plus the uncommitted exit work of `docs/plans/2026-10-14-exit-block.md`, the level read of `docs/plans/2026-10-14-exit-level-read.md` (frozen by that session as `40ec0bad77`) and the path-based default builder of `docs/plans/2026-10-14-nested-defaults.md`. The owner's commit `422564e6f6` since landed that work and this run's three red specs, so the build measures its own change against `79de482237`.

## Brief

### What will change?

Mod+Enter, and Enter on a callout's empty last line, step out of one thing, not two. In a code block, callout, image or divider inside a column, quote or table cell, a paragraph lands right after it, still inside.

### What could go wrong?

A custom block that acts like a code block needs the new flag, or Mod+Enter leaves its container. Old snapshots and undo history won't load. The speed check never got a quiet machine, and three generated files are stale.

## Teach

Exit is what Mod+Enter does, and what Enter does on a callout's empty last line. It picks the thing around the caret to step out of, then adds a new block right after it. Today it only looks at containers, asking whether each one's parent could hold a paragraph. It never asks about the code block itself, so a code block in a column jumps out past the whole column group.

To the schema, a paragraph and a code block look the same, one run of text. Nothing says the code block is a thing you step out of while a paragraph or heading is just content.

The fix adds that one fact. A code block or callout declares it, so you land right after it, still in its container. Images and dividers already work this way. When nothing else fits there, exit steps out of the container instead. Every other block leaves the nearest container.

## Public API

A text block declares that exit leaves it before any container around it. The callout and the code block declare it:

```ts before
// packages/platejs/src/features/callout/lib/BaseCalloutPlugin.ts
schema: {
  element: schema.element.textBlock({
    properties: {
      backgroundColor: property.string(),
      icon: property.string({ default: DEFAULT_CALLOUT_ICON, omitDefault: false }),
      variant: property.string(),
    },
  }),
},
```

```ts after
// packages/platejs/src/features/callout/lib/BaseCalloutPlugin.ts
schema: {
  element: schema.element.textBlock({
    ownsExit: true,
    properties: {
      backgroundColor: property.string(),
      icon: property.string({ default: DEFAULT_CALLOUT_ICON, omitDefault: false }),
      variant: property.string(),
    },
  }),
},
```

The code block is a text block declared field by field, so it gets the same field:

```ts before
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
schema: {
  element: {
    content: schema.content.text({ default: 'text', min: 1, max: 1 }),
    properties: { language: property.string() },
    slice: { preserveContext: true },
  },
},
```

```ts after
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
schema: {
  element: {
    content: schema.content.text({ default: 'text', min: 1, max: 1 }),
    ownsExit: true,
    properties: { language: property.string() },
    slice: { preserveContext: true },
  },
},
```

The compiled declaration is readable beside the other behavior facts, on both `EditorElementBehavior` and `EditorSchemaElement.behavior`. It reports the text-block declaration; voids and objects own their exit through their own `void` and `object` facts:

```ts before
// packages/plitejs/src/interfaces/editor.ts
export type EditorElementBehavior = Readonly<{
  atom: boolean;
  inline: boolean;
  isolating: boolean;
  markableVoid: boolean;
  object: boolean;
  readOnly: boolean;
  selectable: boolean;
  void: boolean;
}>;
```

```ts after
// packages/plitejs/src/interfaces/editor.ts
export type EditorElementBehavior = Readonly<{
  atom: boolean;
  inline: boolean;
  isolating: boolean;
  markableVoid: boolean;
  object: boolean;
  /** Whether the text block declares `ownsExit`; false for voids and objects. */
  ownsExit: boolean;
  readOnly: boolean;
  selectable: boolean;
  void: boolean;
}>;
```

`tx.break.exit` keeps its call shape. Its `match` option now also filters the selected block when that block owns its exit; the selected block stays the last resort, which caption Enter in `BaseMediaPlugin` relies on:

```ts before
// packages/plitejs/src/interfaces/editor.ts
export type EditorBreakExitOptions = {
  /** Land before the exited structure instead of after it. */
  before?: boolean;
  /** Which ancestors may be exited; the selected block stays the last resort. */
  match?: (node: Element, path: Path) => boolean;
};
```

```ts after
// packages/plitejs/src/interfaces/editor.ts
export type EditorBreakExitOptions = {
  /** Land before the exited structure instead of after it. */
  before?: boolean;
  /**
   * Which levels may be exited: the selected block when it owns its exit, then
   * its ancestors. The selected block stays the last resort.
   */
  match?: (node: Element, path: Path) => boolean;
};
```

## What other editors do

The how explorer read ProseMirror (`prosemirror-commands@52a84a8`, `prosemirror-model@6264de0`), Tiptap (`91c51be53`), Lexical (`dd5c41b13`), Slate (`945a484df`), BlockNote (`1e26f1c`), CKEditor 5 (`14e73cc31b`) and Milkdown (`6a4db480`) from local clones; none was run (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/prior-art/answer.md`). Every editor that has a code exit leaves only the code block and stays in its container, and ProseMirror marks that block with one schema flag.

| Editor | Exit command | Which block is left | What lands | Code block inside a container |
| --- | --- | --- | --- | --- |
| ProseMirror | Mod+Enter `exitCode`; `liftEmptyBlock` | The immediate parent when its spec sets `code: true` | The parent's first default text block with no required attributes; `false` when it cannot fit | Stays in the container |
| Tiptap | `exitCode` from ProseMirror; triple Enter in code; a separate Details exit | The code block (`code: true`); Details uses fixed depths | The parent's default text block | Stays in the container |
| Lexical | `$exitCodeNodeOnEnter`; `insertNewAfter` | The CodeNode itself | Always a paragraph after it | Stays in the container |
| Slate | none in core or examples | Enter splits the lowest block | A split copy of the block | Splits inside it |
| BlockNote | Enter or Shift+Enter in code; `liftItem` for nested blocks | The code block, at its own nesting level | The next sibling or a paragraph | Stays nested |
| CKEditor 5 | Enter at the code block's start or end | The immediate code block | A paragraph before or after it | Stays in the container |
| Milkdown | ProseMirror's `exitCode`, also from its CodeMirror view | The immediate `code: true` parent | The parent's default text block | Stays in the container |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Level rule of `tx.break.exit` | Plite | `plitejs` (`src/editor/exit-break.ts`) | Exit is a neutral verb over schema facts; the rule reads compiled grammar and the new fact, and names no product type |
| Landing that refuses instead of throwing | Plite | `plitejs` (`src/editor/insert-default-child.ts`) | The one helper that builds and places a landing block for exit and for Enter on a block void |
| `ownsExit` element fact: input, compiled behavior, contract and fingerprint | Plite | `plitejs` (`src/interfaces/schema.ts`, `src/core/schema-compiler.ts`, `src/core/schema-definition.ts`, `src/interfaces/editor.ts`) | The schema already owns the behavior facts beside it (`void`, `object`, `isolating`) |
| Code block and callout declare the fact | Plate | `platejs` (`features/code-block`, `features/callout`) | The producer of each element owns its declaration |
| Rule-action JSDoc for `'exit'` and `'deleteExit'` | Plate | `platejs` (`src/lib/plugin/PluginDefinition.ts`) | It still says "Exit the current block" |

Every edit stays inside the module that owns it today, so the entrypoint graph does not change.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Caret after Mod+Enter in a code block or callout inside a container | The caret lands in the new paragraph inside the container, not after the container | jsdom specs in `ExitBreakPlugin.spec.ts` and `OverridePlugin.spec.tsx` assert the selection; one hand drive of the exit-break demo in Chromium |
| Mod+Enter on an image or divider inside a container | A paragraph lands after it inside the container, as Enter on a block void already does when the container's default is a plain block | jsdom specs for an image and a divider in a column |
| Undo after the callout's `deleteExit` | Unchanged: one undo restores the newline and removes the landed paragraph | the callout-in-quote spec asserts the one-step undo |

## Main changes

- The level read no longer reads the root default. It builds each candidate level's landing once, checks the caret's path through it and inserts that same block; a level the grammar rules out builds nothing.
- The landing helper refuses, returning `false`, when the default needs a required property it cannot fill or has no text at its end for the caret, which today throws while selecting. The element builder's throw for that case gets the `missing-property` diagnostic code it lacks today, so the helper can tell it from a broken property generator, which still throws. Enter on a block void stops throwing on a missing property too.
- The `Descendant | string` overload of `canContain`, the string branch in it and the `{ type?: unknown }` widening of `getElementBehavior` in `editor-schema.ts` go away. The exit-level-read session added them for its level read, and nothing else passes a string.

## Decisions

The arena ran three runners (opus @high, gpt-6-astra @xhigh, gpt-6.1-sol @xhigh) and a blind cross-judge (opus @high) on the level rule. The synthesis is in `docs/plans/artifacts/2026-10-14-exit-nearest-structure/architect/synthesis.md`, the judge's verdict in `architect/judge/answer.md` beside it. The plan panel's first round (three Opus seats, the two Codex seats rate-limited) and second and third rounds (Opus, Astra and Sol) changed it as the Challenge delta says.

Under the new rule, a block owns its exit when it is a void, an object, or a text block that declares `ownsExit`. Such a block is the structure exit leaves when `match` accepts it and its parent can land a default beside it whose caret path holds no owning block. The caret path runs from the landing through each last child to where the caret lands. Otherwise exit escalates to a container, as `EDIT-SHORTCUT-*` asks, so an owning block that cannot be left in place exits as a plain block in the same spot would. That can leave two depths, the owning block and its container, against `EDIT-GLOBAL-002`; the plan takes that over a key that does nothing on every press, which `EDIT-SHORTCUT-*` rules out. It takes the nearest strict ancestor that `match` accepts and that is a root child, sits in a parent with no compiled content, or sits in a parent whose ordinary content admits a text block. Ordinary content is a prefix program's remainder, or the whole program. Exit skips such an ancestor, and climbs past it, when its landing's caret path holds the ancestor's own type, so no container landing below the top level puts the caret back into what it left; a root child is always a level, and the last resort lands beside the selected block whatever its type, as Named limits says. With no such ancestor, the selected block is the last resort. When the chosen container's landing cannot be built, because its parent declares no default, has no room, needs a property it cannot fill or would leave no text for the caret, exit changes nothing and does not climb further, as the existing spec "changes nothing when the container declares no default block" asserts. A default the schema cannot build for any reason but a missing required property is a schema bug, and exit throws it.

| Rule | Plite census, 64 law cases | Plate replay, 17 cases | Why it lost or won |
| --- | --- | --- | --- |
| Checkout today (control, adds nothing) | 45/64 | 9/17 | Fails the three reported cases: it measures every level against the root's default type |
| Scope group every structure declares (sol) | 44/64 simulated | not run | A container whose producer forgets the group skips levels, and the no-default and full-container refusals stop holding |
| No new fact: positional default plus a frame check (opus) | 41/64 | not run | Keeps the app-root two-level exit, keeps a heading inside its quote, and a narrow root grammar two levels up makes a code block leave its quote |
| Declared text-block fact plus derived containers (astra, base) | 42/64 simulated | not run | Base: a forgotten declaration falls back to today's behavior |
| Arena synthesis (base with the object and undeclared-parent grafts) | 44/64 | 17/17 | Throws or swallows the key when an owning block's parent cannot land a different block, and ignores `match` there |
| Synthesis after panel round 1 (escalation, refusing landing, `match` on the owning block) | 53/64 | 17/17 | Loops when a container's default wraps another code block or image, and turns a broken property generator into an exit |
| Synthesis after panel round 2 (caret path, narrow refusal) | 55/64 | 17/17 | The container walk still loops when the container's default recreates the level it leaves, and a landing with no text end throws |
| Count only text blocks that do not own their exit in a parent (opus, round 3) | 61/64 | not run | Still loops in a box whose default is the quote it leaves, and keeps the captioned-group column |
| Synthesis after panel round 3 (progress on every landing) | 63/64 | 17/17 | Misses only the details grammar default, which Plate repairs |

The census logs are `docs/plans/artifacts/2026-10-14-exit-nearest-structure/census-panel3-a1.log` and `plate-replay-a4.log`. The Plate replay compares its control with the tree on exact documents. The census control compared only whether each case met its expectation, until the diff panel found that two different misses would match; `census/census-r1.ts` now compares each case's document, return value and selection, and the built rule matches the tree on every case (`panel1-census-a1.log`, with a planted different miss reported as drift in `panel1-census-planted-a1.log`). Every rule above also passes the census's one policy row, a broken property generator that throws, except the checkout and round 1's rule.

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Which level `tx.break.exit` leaves | Nearest ancestor that is a root child or whose parent can contain the root default's type | An owning block (void, object or `ownsExit` text block) when its parent lands a default beside it whose caret path holds no owning block; otherwise the nearest strict ancestor that is a root child, sits in an undeclared parent, or sits in a parent whose ordinary content admits a text block, skipping one whose landing's caret path holds its own type | Plite `exit-break.ts` | `EDIT-GLOBAL-001` to `-003` and `EDIT-SHORTCUT-*`; the root default is not a level fact | No caller changes; docs and Vision teach the new rule | Steps 2 and 4 specs, the census and the Plate replay | A custom code-like block without the flag still leaves its container | rearchitect |
| `ownsExit` element fact | none | `SchemaElementInput.ownsExit?: boolean`, text blocks only; compiled `behavior.ownsExit`; in the contract and fingerprint only when true | Plite schema compiler | Heading, code and callout have identical grammar, so no existing fact can tell them apart | Code block and callout declare it; custom code-like blocks opt in | Step 1 compiler, contract and diff tests | Plate's fingerprint changes, as it already does between betas; a named schema that declares it needs a version bump before `plate migrate`, as for any behavior change | rearchitect |
| Landing helper `insertDefaultChild` | Throws when the landing default fails schema validation | Refuses and returns `false` on a missing required property or a landing with no text at its end; any other build error still throws | Plite `insert-default-child.ts`, with the `missing-property` code from `editor-schema.ts` | The new rule lands beside owning blocks, where a default may need a property; Enter on a block void has the same crash | Exit and Enter on a block void | Step 2 tests | A container default that needs a property makes the key do nothing instead of throwing | rearchitect |
| `canContain` string overload | `canContain(parent, Descendant \| string)` | `canContain(parent, Descendant)` | Plite `editor-schema.ts` | Its only caller was the replaced level read | none | typecheck, diff against the exit-level-read session's pre-edit copy | none | cut |
| `match` option | Filters strict ancestors | Filters every candidate level, the owning block included; the selected block stays the last resort | Plite `exit-break.ts` | An owning block would otherwise skip `match`; caption Enter's `match: () => false` needs the last resort | none; `BaseMediaPlugin` keeps working | Step 2 `match` cases | none | keep |
| Details grammar | `any([summary, blockContent], { default: summary })` | Unchanged | Plate details | Details already turns a landed summary into a paragraph in the same update | none | Plate replay case "code block in a details body"; Step 4 spec | none in Plate | keep |
| Mod+Enter speed | Peer level read, inherited budget | Same budget on the paragraph and owning-block paths; a looser frozen budget on the rare climb | `benchmark` | Once per gesture | none | Step 0 | A conclusive miss | gate |

### Named limits

- In a Plite schema whose container declares a frame part as its default, such as a summary at every index, exit lands that default. Plate's details repairs it; a Plite-only schema declares a body default itself.
- An owning block whose container cannot land a plain default beside it, such as a code block in a container with no default, exits after the container, two depths at once. A container level whose landing would recreate it climbs the same way, as a paragraph in a quote does in a box whose default is a quote, where the checkout loops. A paragraph in a quote in a container with no default changes nothing, because a container level that cannot land never climbs.
- When `match` rejects every level, the last resort lands the default beside the selected block even when that keeps the caret in an owning block, as today; only caption Enter in `BaseMediaPlugin` passes such a `match`, and no shipped container defaults to a media block.
- At the top level the last resort lands the root's default whatever it is, so under a root whose default is a code block, Mod+Enter from a top-level code block lands another code block on every press, as at base; the root has no level above it.
- `EditorElementBehavior.ownsExit` holds only the bit a text block declares and reads false for voids and objects, which own their exit too; the full predicate stays inside `exit-break.ts`.
- A container whose default is a read-only text block takes the caret there, where typing changes nothing; the landing checks for text, not editable text.
- A text block that should own its exit but does not declare `ownsExit` behaves like a paragraph, as every block does today. A Plate plugin whose Enter rule exits, such as a callout, has to declare it too; Open work tracks a check.

## Challenge delta

Panel round 1 (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel-plan-1/`): `improved`.

- Owning blocks escalate to the container walk when their parent cannot land a block beside them, instead of throwing or swallowing the key (`EDIT-SHORTCUT-*`).
- The landing helper refuses instead of throwing when the default needs a property it cannot fill, which also stops Enter on a block void from crashing there.
- `match` filters the owning block too, so a caller that names an outer level still reaches it.
- The app-root spec gives its callout the flag, as you approved, and a new spec keeps a root-sibling landing for a plain paragraph.
- The brief, docs and changesets name the image and divider outcome, and the persistence cost names what is refused.

Panel round 2 (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel-plan-2/`): `improved`.

- An owning block stays the level only when the caret's path through the landing holds no owning block, so a container whose default wraps another code block or image no longer traps exit in a loop.
- Only a missing required property refuses the landing; a broken property generator throws instead of turning into a silent exit.
- Decisions names the two-depth exit against `EDIT-GLOBAL-002`, and the changeset names the `plate migrate` version bump.
- The speed probe times the round 2 rule on `79de482237`, with owning-block and climbing cohorts beside the inherited ones.

Panel round 3 (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel-plan-3/`): `improved`. It was the last round on the plan; the build's diff panel reviews the code.

- Every landing must move the caret out of what it leaves: a container level whose landing holds its own type is skipped, so the container walk no longer loops when a container's default wraps a code block, a quote or itself.
- The landing helper refuses a landing with no text at its end, which threw while selecting, in the checkout too.
- Both owning-block arms press Mod+Enter, the base with a `match` that rejects every level, and the climb's deep axis deepens the discarded default.
- A column in a group that also holds a caption paragraph now leaves the group instead of adding a column, so that limit is gone.

Diff panel round 1 (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel-diff-1/`): `improved`. No critical fix was applied, so no second round runs.

- Astra's one critical, another code block on every press under a code-block root, behaves as at base and as the root declares; a test now pins it and the Vision bullet states it.
- The prefix-remainder branch gets a test, and a branch no landing can reach goes away.
- The mutation check reruns on the renamed code, and the census compares whole outcomes.
- The docs, Vision, changesets and JSDoc say exactly when exit climbs and when it refuses, and that only editors with a code block or callout get a new fingerprint.
- Two narrow cases are picked for you under Defaults: the public `ownsExit` field reading false for voids and objects, and a read-only default.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Heading inside a container | Leaves the container, like a paragraph does today | Stays inside, like a code block | heading stays | small |
| How a block says Mod+Enter leaves it first | One new flag on the block's schema, set by code blocks and callouts | A group that every container declares | scope group | big |
| The new flag's name | owns exit | a role name such as standalone | rename flag | small |
| A code block or image whose container cannot fit a plain block beside it | Exit steps out of the container instead | The key does nothing | stay put | small |
| The new block needs a setting nobody can fill in | The key does nothing, for exit and for Enter on an image | It errors, as today | keep error | small |
| A container default that keeps the caret inside another code block or image | Exit steps out of the container instead | It lands that default, which loops | land wrapper | small |
| The option that picks which levels exit may leave | Kept, now also checked on a code block or image | Removed, which is a hard cut | cut match | small |
| Details' usual block | Unchanged; details turns a landed summary into a paragraph | Details declares a paragraph for its body | details default | small |
| Plate's schema fingerprint | Changes, as it already does between betas (look) | Leave the flag out of the fingerprint | keep fingerprint | small |
| Plate checking callout-like plugins | Each plugin declares the flag; a check is a side task | Plate refuses a plugin whose Enter rule exits without the flag | check flag | small |
| Speed check timing | Runs once the host is free enough; the load limit catches a busy one | Wait for the other session's benchmark | wait bench | detail |
| A grid that also holds a caption paragraph | Leaves the whole grid, since a new column would put the caret back in a column | Adds a column, as today | grid adds column | detail |
| The old page link stopped opening | A new page, https://claude.ai/artifact/W25CeDUbwjf8odecjFypYY, replaces https://claude.ai/artifact/JWj6mvxj8ZdcuaMBm9YTg4 | Go back to the old link | old page | detail |
| Where this plan's page lives | Its own page | One shared exit page for the three exit plans | shared page | detail |
| Mod+Enter in a top-level code block when the document's default block is a code block | Adds another code block, the document's own default, as today | The key does nothing there | stop at top | detail |
| What the new owns-exit flag reports for an image or a divider | False. The flag only records what a text block declared, and its docs say so (look) | True, so the flag means "exit stops here" for every block | full owns exit | small |
| A container whose default block is read-only text | Exit lands there like any default, and typing there does nothing | Exit skips it and leaves the container | skip read-only | detail |
| Three generated files that can't rebuild until another session finishes its work | Hand back without them, and rebuild them once that work builds (look) | Wait and rebuild them first | wait generate | small |
| The speed check, which never got a quiet enough machine to finish | Hand back without a verdict. Other sessions kept the machine too busy every time, and nothing measured too slow (look) | Wait for a quiet machine and run it again first | rerun perf | small |
| The Plite test type check, which already fails without this change | Accept it. It fails the same way without this change, and none of its errors are in this change's files (look) | Wait until it passes first | wait typecheck | small |

## Steps

- [x] 0. Speed pre-acceptance probe through `benchmark`, gating step 3 only. Copy the exit-level-read session's harness (`docs/plans/artifacts/2026-10-14-exit-level-read/bench/`) into this run's `bench/` and change only the copy. Base is `79de482237`; the candidate is that commit plus this run's prototype `exit-break.ts` and `insert-default-child.ts` from `bench/candidate/`, copied into the candidate worktrees by `bench/build-arms.sh`, which logs the diff and each worktree's status; a same-code arm repeats the candidate, and a planted arm adds busy work sized to a share of one whole Mod+Enter. This run inherits the budget from `docs/plans/2026-10-14-exit-block.md` and freezes every line before reading any candidate result. In each inherited cohort (a paragraph under depth 1, 8 and 32, with a cheap and a deep required default) and each owning-block cohort (a divider at the same depths, landing the cheap or deep default beside itself, where the base arm presses Mod+Enter with a `match` that rejects every level, whose last resort lands the same block beside the divider today, because plain base Mod+Enter lands after the outermost level and so does other work), the candidate's median wall time for one Mod+Enter is at most 1.10 times base, with a 30% planted arm. In each climbing cohort (a divider whose container's default wraps another divider one wrapper deep, or eight on the deep axis, with a paragraph as the shared root landing), it is at most 3.0 times base, with a 250% planted arm. The climb builds and discards one default, an eight-level default build costs one to two cheap Mod+Enters on the base arm (`bench/base-smoke-a1.log`, `d1-deep` against `d1-cheap`), and only a custom schema reaches it. Each cohort asserts both sides' landing and the undo before timing; `bench/paired-config-main.json` holds the first two kinds and `bench/paired-config-climb.json` the climb. `paired-timing.mjs` judges it with three times the earlier sample count and a load limit of 9; a known-bad input must fail with the probe's own assertion text. A conclusive miss sends the level rule back to `architect`; an inconclusive result stays a gate and reruns on the final bytes in step 10. Proof: the paired config and its attempt-indexed measurements and log in this run's `bench/`. Inconclusive: No attempt reached a verdict, because other sessions pushed the one-minute load past the frozen limit of 9 every time: 37.66 on the plan's round 3 rule (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/paired-main-a1.log`), 11.05 on the final bytes after 4 of 24 runs (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/measurements-final.json`), then 11.17 on the main config (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/paired-final-a2.log`) and 12.90 on the climb (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/paired-final-climb-a1.log`). No cohort missed its budget. On the final bytes, every main candidate median lies between 0.917 and 1.058 times base against a budget of 1.10, and every climb median between 1.082 and 1.521 against 3.0. The Defaults row "rerun perf" accepts it.
- [x] 1. The `ownsExit` fact in Plite. Accept it on `SchemaElementInput` and in `schema.element.textBlock()` options; compile it into `behavior.ownsExit` (false by default), on `EditorElementBehavior` and `EditorSchemaElement.behavior`; refuse it with `invalid-element-behavior` on an inline, void, object or container element; carry it in the schema contract and the fingerprint only when true, through `contractElement`, `restoreElement`, `canonicalCompiledElement` and `canonicalSchemaElementBehavior`, so a schema that never declares it keeps its fingerprint and contract bytes; read an old contract without the key as false. Proof: red-first tests in `packages/plitejs/test` for the compile, each refusal, the contract round trip, an old contract without the key, a fingerprint that equals the literal computed at base for a schema without the flag, a changed fingerprint when one element declares it, and `diffEditorSchemaContracts` reporting the declaring element as changed. Done: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step1-red-a1.log` fails the five new cases at base and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step1-green-a1.log` passes them.
- [x] 2. The landing refusal. Copy `insert-default-child.ts` and `editor-schema.ts`, which holds another session's uncommitted edit, to the run directory first. The element builder's "requires property" throw in `editor-schema.ts` carries the `missing-property` diagnostic code. That diagnostic names the element in `nodeType` and carries the property context, as the other `missing-property` sites do. The helper builds the landing block, returns `false` without changing anything when every diagnostic of the thrown `EditorSchemaValidationError` is `missing-property` or when the block's caret path ends without text, rethrows any other error, and gives exit the built block so it can check its caret path before inserting. Proof: red-first `packages/plitejs/test` cases where Enter on a block void and exit from a void or code block meet a parent default that needs a property, each changing nothing and throwing nothing, a case where a property generator returns the wrong kind, which throws its "must be string" error, and a case where the default is an element with no children, which changes nothing; a test reads the `missing-property` code off the builder's throw; the existing `break-exit.test.ts`, block-void Enter and `schema-contract.ts` cases stay green. Done: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step2-red-a1.log` fails the landing cases at base and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step2-green-a1.log` passes them.
- [x] 3. The level rule in `exit-break.ts`, after messaging the exit-level-read session. Replace its level read with the rule in Decisions, and revert the `canContain` overload, its string branch and the `getElementBehavior` widening in `editor-schema.ts` to the exit-level-read session's pre-edit copy (`docs/plans/artifacts/2026-10-14-exit-level-read/pre-edit/editor-schema.ts`), leaving other sessions' hunks. Rewrite the `exit` and `match` JSDoc in `interfaces/editor.ts`, and rename the test "measures the exit level against the named root default". Proof: `packages/plitejs/test/break-exit.test.ts` passes every case, the exit-level-read session's three included, with new cases for an `ownsExit` text block in a quote, a heading in a quote, an isolating text header cell, a block void in a column, an undeclared container, an owning block in a no-default, full, code-only and required-property container and in a container whose default wraps a code block or an image (each escalating), repeated Mod+Enter from that wrapper case leaving the container on the first press, two presses from a code block in a container that admits code and quotes and defaults to a quote, two presses from inside a default wrapper, a paragraph in a quote in a box whose default is a quote, an owning block and a container level whose default has no text, a container level that cannot build its default (refusing), and `match` naming an outer level from a code block, plus `match: () => false` landing beside a void; the census rerun with the real flag scores 63/64 law rows, missing only the details default, and its policy row; `mutate.mjs` shows each new guard fails when its clause is removed. Done: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step3-green-a2.log` passes 116 Plite tests, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/census-build-a1.log` scores 63 of 64 law rows and 1 of 1 policy row, and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/build/mutate-plite.json` catches 20 of 20 mutants, rerun after the diff panel's renames and new tests as 22 of 22 on HEAD plus this run (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-mutate/summary-a3.log`); the exit-level-read session had an earlier heads-up and was not listed among the active sessions at the revert, so no second message went (decision log).
- [x] 4. Producers. `BaseCodeBlockPlugin` and `BaseCalloutPlugin` declare `ownsExit: true`; `PluginDefinition.ts` documents `'exit'` and `'deleteExit'` as leaving the nearest structure through `tx.break.exit`. The app-root spec in `OverridePlugin.spec.tsx` gives its stand-in callout the flag and expects a paragraph inside the section with one-step undo, as you approved; a new `ExitBreakPlugin.spec.ts` case keeps the root-sibling path, Mod+Enter on a paragraph in a sections-only root landing a new section with the caret at `[1, 0, 0]` and one-step undo. Proof: `ExitBreakPlugin.spec.ts` (code block in a column) and `OverridePlugin.spec.tsx` (callout in a quote) go from red to green; new specs for an image and a divider in a column land inside the column; a spec for a code block in a details body lands a paragraph with the caret in it and one-step undo; the Plate replay with the real flag scores 17/17. Done: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step4-red-a1.log` fails the six owning-block cases on HEAD's code, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step4-green-a1.log` passes 31 of 31, and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/plate-replay-a5.log` scores 17 of 17.
- [x] 5. Generated outputs. Run `pnpm --filter www editor:generate` for `plugins.generated.ts` and `plugins.schema.json`, and refresh the API reference manifest for `EditorElementBehavior`, `EditorSchemaElement` and `SchemaElementInput`. Proof: `pnpm --filter www exec plate generate --check src` passes and the diff touches only the new field and the fingerprint; `withPlite.slow.ts`'s pinned fingerprint is checked by its own test run. Blocked: `editor:generate` fails on the `authored-context` element at `79de482237` and again at HEAD `469061ecb6` (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/step5-generate-head-a1.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step5-generate-head-a2.log`), and the manifest's `pnpm --filter plitejs build` fails at HEAD on `AuthoredReview` (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/build/plitejs-build-head-a1.log`), both in the suggestions session's authored work, so neither output regenerates (Defaults word "wait generate").
- [x] 6. Docs through `plate-docs`: `content/docs/(plugins)/(functionality)/(utils)/exit-break.mdx` and its `.cn.mdx` twin (How exit break works, Exit point determination, Custom plugin configuration, nested code block, image and divider examples), `content/docs/api/editor-transforms.mdx` (`tx.break.exit` and `match`), `content/docs/(guides)/schema.mdx` (declaring `ownsExit` on the notice example) and the exit-break demo values in both locales. Proof: `plate-docs`' example audit and docs checks, and the preview of each page. Done: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step6-build-source-a1.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step6-docs-parity-a1.log` and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step6-build-registry-check-a1.log` pass, and again after the diff panel's wording fixes (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-build-source-a2.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-docs-parity-a2.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-build-registry-check-a2.log`); each page's preview was driven (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/hand-drive-check-a3.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-hand-drive-check-a2.log`).
- [x] 7. `best-api repair` for the new schema fact and the changed exit rule: the `docs/vision/plite.md` exit bullet, and every skill, doc or test name that still teaches the root-default rule. Proof: its repair log and a `git grep` for the old rule's wording over live source, tests, docs and skills. Done: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step7-sweep-a1.log` finds no live artifact teaching the old rule, and the Vision bullets state the rule, the flag and the refusing landing.
- [x] 8. Changesets: `.changeset/plite-break-exit.md` (the rule, `ownsExit`, `match` and the refusing landing) and `.changeset/platejs-exit-break-default.md` (code block, callout, image and divider exits; snapshots, persisted history, authored comparisons and Yjs rooms across old and new clients refuse the old fingerprint; a named schema needs a higher version before `plate migrate` scaffolds its migration). Proof: `changeset`'s check. Done: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step8-changeset-status-a2.log` lists both under their packages and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step8-registry-check-a2.log` passes the demo copy's registry entry.
- [x] 9. Hand drive the exit-break demo in Chromium: Mod+Enter in the code block inside the column, then in the column's paragraph. Proof: `hand-drive.mjs check` and the screenshots. Done: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/hand-drive-check-a3.log` covers all nine cells, and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-hand-drive-check-a2.log` the four the diff panel's fixes touched; Mod+Enter lands a paragraph inside the column, and again lands one after the group.
- [x] 10. Final proof on the final bytes: the touched plitejs and platejs partitions and their typechecks, then step 0's paired probe rerun on the final production path, with owning-block cohorts that use a code block declaring the real `ownsExit` beside the divider ones. Proof: attempt-indexed logs in the run directory. Partial: on `7c16e8c462`, HEAD `469061ecb6` plus only this run's hunks, every touched partition and typecheck passes except the plitejs test typecheck, which fails at HEAD too (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/final-2/plitejs-typecheck-tests-a1.log`, Defaults word "wait typecheck"); the probe rerun is inconclusive, as step 0 says.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Each reported case red at base, green after | yes | `docs/plans/artifacts/2026-10-14-exit-nearest-structure/spec-red-tree-a1.log` and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/spec-red-head-a1.log` show all three wrong landings before the fix; `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step4-red-a1.log` fails the six owning-block Plate cases on HEAD's code and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step4-green-a1.log` passes them |
| `break-exit.test.ts`, `ExitBreakPlugin.spec.ts`, `OverridePlugin.spec.tsx` green except owner-approved outcomes | yes | `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-fix-plite-a1.log` passes 119 and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-fix-plate-a1.log` passes 80; the only changed outcome is the app-root spec you approved |
| Touched plitejs and platejs partitions and typechecks | yes | partial: on HEAD plus only this run's hunks every partition and typecheck passes (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/final-2/plitejs-test-partition-core-a1.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/final-2/platejs-test-partition-core-a1.log` and the other final-2 logs) except the plitejs test typecheck, red at HEAD too with none of its errors in this run's files (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/final-2/plitejs-typecheck-tests-head-a1.log`); Defaults word "wait typecheck" |
| Paired speed probe on final bytes | yes | partial: inconclusive under load on every attempt, with no cohort over its budget (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/paired-final-a2.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/paired-final-climb-a1.log`); Defaults word "rerun perf" |
| Writing passes: `deslop`, `no-comments`, `unslop` | yes | the build's passes (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/comments-plite-a1.log`) and diff round 1's (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/comment-sicko/panel1-answer.md`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-build-source-a2.log`) |
| Diff panel (reviews row `api-build`) | yes | one round, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel-diff-1/`: Astra's one critical dismissed, five warnings and nits applied, two deferred, one dismissed |
| `best-api repair`, `plate-docs`, changesets | yes | steps 6 to 8: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step7-sweep-a1.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-docs-parity-a2.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step8-changeset-status-a2.log` |
| Hand drive | yes | `docs/plans/artifacts/2026-10-14-exit-nearest-structure/hand-drive-check-a3.log` and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-hand-drive-check-a2.log` |
| `pnpm lint:fix` on the task's paths | yes | `docs/plans/artifacts/2026-10-14-exit-nearest-structure/lint-task-a4.log` exits 0 and reformats only the two new tooling files |
| Decision-trail review | yes | gpt-6.1-sol @xhigh on the frozen snapshot: four warnings and five nits, no critical, each settled in the Close (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/trail/sol/answer.md`) |

## Open work

- A Plate plugin whose Enter rule is a static `'exit'` or `'deleteExit'` on `break.emptyLineEnd` but whose text block does not declare `ownsExit` leaves its container, which is reported case 2 again. A plugin-compile check could refuse it; `break.empty: 'exit'` stays legitimate for plain blocks, and a rule written as a function cannot be read statically. owner: zbeyens. stop: a suggested task lands the check, or the owner drops it. Tracked as suggested task `task_7b3ea248`, which waits for `task_3fa75615` and `task_df170f45` because they write the same Plate plugin code.
- `plugins.generated.ts` and `plugins.schema.json` are not regenerated, because `pnpm --filter www editor:generate` fails at HEAD `469061ecb6` on the `authored-context` element, which has no Plate plugin owner (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/step5-generate-head-a2.log`); the suggestions session owns it and its fix removes the element. The API reference manifest is not regenerated either, because `pnpm --filter plitejs build` fails at HEAD on two `MISSING_EXPORT` errors for `AuthoredReview` in the same session's authored work (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/build/plitejs-build-head-a1.log`). owner: zbeyens. stop: `editor:generate` and the plitejs build pass at HEAD, then a `proof-worktree.mjs --install` worktree regenerates all three files (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/build/api-manifest.sh` for the manifest) and `plate generate --check src` passes. Tracked in this plan's Defaults word "wait generate".
- `EditorElementBehavior.ownsExit` reads false for voids and objects, and a read-only container default takes the caret where typing does nothing. owner: zbeyens. stop: as each item in `docs/plans/topics/basic.md` Open work says.

## Close

### Reversals and deviations

- Step 3 and every step after it were built before step 0's speed probe decided, though step 0 gated step 3 (row "built: deviation from step 0"). The probe never decided, because other sessions pushed the one-minute load past the frozen limit of 9 on every attempt: 37.66 on the plan's round 3 rule (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/paired-main-a1.log`), 11.05 on the final bytes after 4 of 24 runs (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/measurements-final.json`), then 11.17 on the main config (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/paired-final-a2.log`) and 12.90 on the climb (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/bench/paired-final-climb-a1.log`). No cohort missed its budget. On the final bytes, every main candidate median lies between 0.917 and 1.058 times base against a budget of 1.10, and every climb median between 1.082 and 1.521 against 3.0. The Defaults row "rerun perf" hands the change back without that verdict, and a conclusive miss on a later rerun still sends the level rule back to `architect`.
- Step 3 said the lead would message the exit-level-read session before reverting its level read. The lead had sent that session a heads-up earlier in the build, and at the revert it was not listed among the active sessions, so no second message went.
- The user asked the lead to read `AGENTS.md`, `VISION.md` and `CODING_STANDARDS.md` first, then load `pstack:poteto-mode`. The lead loaded `pstack:poteto-mode` before it read `VISION.md` and `CODING_STANDARDS.md`, and read both before it wrote the plan.
- HEAD moved from `79de482237` to `469061ecb6` mid-run, through 23 of the owner's merge commits (row "HEAD moved"). From then on each proof ran on `7c16e8c462`, the new HEAD plus only this run's hunks, and the lead rebuilt the bench arms at the new HEAD before reading any result.
- The diff panel's brief cited a mutation check run on an earlier freeze for the reviewed tree, after renames changed the lines it mutates. The lead reran it on `7c16e8c462`, where it catches 22 of 22 mutants, and ran `/pstack:correct` on that mistake (rows "mutation rerun" and "built: /pstack:correct").
- The lead stopped the first final-bytes probe after 4 of its 24 runs, once one run's load of 11.05 had already made it inconclusive.

### What landed

All of it is uncommitted on `next`, for the owner to commit.

- A Plite text block can declare `ownsExit` on `SchemaElementInput` or in `schema.element.textBlock()`. It compiles to `behavior.ownsExit`, and the schema contract and fingerprint carry it only when it is true, so a schema without it keeps its fingerprint.
- `tx.break.exit` leaves the nearest structure. A void, an object or an `ownsExit` text block is the level when `match` accepts it and its landing puts the caret in no block that owns its exit. Otherwise exit takes the nearest ancestor that is a root child, sits in a parent with no declared content, or sits in a parent whose content after any leading prefix admits a text block. It passes an ancestor that is not a root child when its landing would put the caret back in its own type, and lands beside the selected block when nothing else fits.
- The landing helper changes nothing and returns `false` when the default needs a property nobody supplies or ends without text, and the element builder's requires-property throw carries the `missing-property` code.
- `BaseCodeBlockPlugin` and `BaseCalloutPlugin` declare `ownsExit`, so Mod+Enter in a code block, callout, image or divider inside a column, quote or table cell lands a paragraph right after it, still inside. The app-root spec's callout lands inside its section, as the owner approved.
- The exit-break docs in both locales, `editor-transforms.mdx`, `schema.mdx`, the demo copy in both locales, `docs/vision/plite.md` and both changesets teach the new rule.
- `tooling/scripts/stale-mutations.mjs` runs as a PostToolUse hook after each `freeze.mjs` and lists each mutated file whose frozen bytes differ from its bytes at the commit of every mutation spec in the run directory that mutates it. It is advisory. It never blocks, and no gate runs its tests. The rules table in `CODING_STANDARDS.md` names it.

### Proof

- Each reported case fails before the fix (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/spec-red-tree-a1.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/spec-red-head-a1.log`). `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step4-red-a1.log` fails the six owning-block Plate cases on HEAD's code, and `docs/plans/artifacts/2026-10-14-exit-nearest-structure/step4-green-a1.log` passes 31 of 31.
- The three named files stay green. The Plite run passes 119 (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-fix-plite-a1.log`) and the Plate run passes 80 across the two named specs and `withPlite.slow.ts` (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-fix-plate-a1.log`). The only changed outcome is the app-root spec, which the owner approved with "Stay in section".
- On `7c16e8c462` the plitejs core partition passes 1967 tests, the platejs core partition 600, the callout partition 3 and the standard-code-block partition 61, and the plitejs core and three platejs typecheck partitions exit 0 (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/final-2/`).
- On the same commit each of the 22 guards fails its test when removed (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-mutate/summary-a3.log`), and so do the root-child, last-resort and owning-last-resort refusals (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-mutate/summary-root-a2.log`).
- The census matches 63 of 64 law rows and its one policy row, missing only the details default that Plate repairs, and its control drifts when a defect is planted (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-census-a1.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-census-planted-a1.log`). The Plate replay scores 17 of 17 (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-plate-replay-a1.log`).
- The hand drive covers nine cells and the four the diff panel's fixes touched; Mod+Enter in the demo's column code block lands a paragraph inside the column, and the next press leaves the group (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/hand-drive-check-a3.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-hand-drive-check-a2.log`).
- The docs build, the docs parity check and the registry check pass after the last prose pass (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-build-source-a2.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-docs-parity-a2.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-build-registry-check-a2.log`).
- The stale-mutations check lists all four mutated files on the diff round's tree and exits 1, stays quiet on the commit its spec targets, and passes its five tests after the lint fix (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/correct/stale-mutations-past-a4.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/correct/stale-mutations-control-a4.log`, `docs/plans/artifacts/2026-10-14-exit-nearest-structure/correct/stale-mutations-test-a6.log`).
- The task lint exits 0 and reformats only the two new tooling files (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/lint-task-a4.log`).

### Proof limits

- The speed of Mod+Enter on the final bytes has no verdict. The medians above are what an overloaded run measured, so they show no miss and prove no pass.
- The plitejs `typecheck:tests` gate fails on `7c16e8c462` and at HEAD, with none of its errors in this run's files (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/final-2/plitejs-typecheck-tests-head-a1.log`); the Defaults row "wait typecheck" accepts it.
- `plugins.generated.ts`, `plugins.schema.json` and the API reference manifest are stale, because `editor:generate` and the plitejs build both fail at HEAD on another session's authored work; the Defaults row "wait generate" accepts it, and Open work holds the regeneration.
- The stale-mutations hook runs only in Claude Code, never blocks, checks only mutation specs and compares bytes, never a run's results, so the correction is partial. A Codex run or another kind of stale proof still rests on the rule, and the blocking check waits in `docs/plans/topics/correct.md`.
- The Named limits under Decisions list the rule's own edge cases.

### Counts

21 items: the 11 steps and the 10 completion gates. 16 done, 4 partial (step 0 and step 10, and the partitions and speed gates, each through its accepted rows), 0 skipped, 1 blocked (step 5, through its accepted rows), 0 open.

### Diff panel

One round on `d52844ddff` (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel-diff-1/`). The lead dismissed Astra's one critical finding, another code block on each press under a code-block root, because it behaves as at base and as the root declares. Mod+Enter goes from `ExitBreakPlugin.ts:22` to `tx.break.exit` at `:16`. In `exit-break.ts` the code block owns its exit (`:51`), but its landing, the root's default code block, holds an owning block, so it is not the level (`:55`). A top-level block gives the ancestor walk nothing (`:76`), so the last resort at `:94` lands the root's default. The seat's own three-press Plate probe lands three code blocks on `7c16e8c462` and changes nothing once that last resort refuses (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/trail/root-mutant-a2.log`), and the Plite test that pins the case fails on the same mutant (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/panel1-mutate/summary-root-a2.log`). The lead applied five warnings and nits, deferred two to `docs/plans/topics/basic.md` Open work and dismissed two. No critical fix was applied, so no second round ran.

### Decision-trail review

Reviewed by gpt-6.1-sol @xhigh, the effort its `cross.mjs` seat line reports, on the frozen snapshot `docs/plans/artifacts/2026-10-14-exit-nearest-structure/trail/snapshot/` (hashes in its `MANIFEST.txt`). It found four warnings and five nits, and no critical finding (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/trail/sol/answer.md`).

- Warning. The dismissal of Astra's critical had no hop-by-hop trace, its mutation ran on a direct Plite test rather than the seat's three-press Plate case, and Decisions said exit never lands back inside what it left. The Diff panel paragraph now traces the path, the seat's own probe runs on the own commit and on its mutant (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/trail/root-mutant-a2.log`), and the Decisions sentence now names the last resort.
- Warning. The generate control ran before HEAD moved. A fresh control at `469061ecb6` fails the same way (`docs/plans/artifacts/2026-10-14-exit-nearest-structure/step5-generate-head-a2.log`).
- Warning. The `/pstack:correct` change compares bytes, not a run's results, and never blocks, so it is not the highest level that works. The script, its test, the rules table and `correct.md` now say it compares bytes with each spec that mutates the file and is advisory, the Proof limits call the correction partial, and the blocking check stays in `correct.md`.
- Warning. The Counts counted this review as done before it ran. They stand now that the review is recorded and settled.
- Nits. The exit-level-read message, the order of the first reads (now a deviation), the panel tally, the 80-test attribution and the first probe's label (the plan's round 3 rule) are fixed above, and a `corrected` row records the log rows that kept the old wording.

### Open work

The plan's `## Open work` holds each item with its owner and stop. The plugin flag check is suggested task `task_7b3ea248`. No suggested task waited only for this run; `task_7b3ea248` still waits for `task_3fa75615` and `task_df170f45`, two offered tasks that write the same Plate plugin code.
