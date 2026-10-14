# Exit leaves only the nearest structure

Status: planning: waiting on the plan panel, the speed probe and your call on one changed test
Page: https://claude.ai/artifact/JWj6mvxj8ZdcuaMBm9YTg4
Playbook: plan

Execution playbook: Build (`.agents/playbooks/build.md`). Run directory: `docs/plans/artifacts/2026-10-14-exit-nearest-structure/`. Intake base: `6fa1169c5e` plus the uncommitted exit work of `docs/plans/2026-10-14-exit-block.md` and the level read of `docs/plans/2026-10-14-exit-level-read.md`, frozen by that session as `40ec0bad77`.

## Brief

### What will change?

Mod+Enter, and Enter on a callout's empty last line, leave only the nearest structure. A code block or callout inside a column, quote or table cell gets a paragraph after it, still inside.

### What could go wrong?

A custom block that acts like a code block needs a new schema flag, or it leaves its container as it does today. The flag on code blocks and callouts changes Plate's schema fingerprint, so saved documents need a migration.

## Teach

Exit is what Mod+Enter does, and what Enter does on a callout's empty last line. It picks the thing around the caret to step out of, then adds a new block right after it. Today it only looks at containers, asking whether each one's parent could hold a paragraph. It never asks about the code block itself, so a code block in a column jumps out past the whole column group.

To the schema, a paragraph and a code block look the same, one run of text. Nothing says the code block is a thing you step out of while a paragraph or heading is just content.

The fix adds that one fact. A code block or callout declares that exit leaves it first, so you land right after it, still in its container. Every other block leaves the nearest container, which exit finds from what each parent can hold. It builds nothing until it adds the new block.

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

The compiled fact is readable beside the other behavior facts, and `tx.break.exit` keeps its call shape and options:

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
  /** Structural exit leaves this text block before any container around it. */
  ownsExit: boolean;
  readOnly: boolean;
  selectable: boolean;
  void: boolean;
}>;
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
| `ownsExit` element fact: input, compiled behavior, contract and fingerprint | Plite | `plitejs` (`src/interfaces/schema.ts`, `src/core/schema-compiler.ts`, `src/core/schema-definition.ts`, `src/interfaces/editor.ts`) | The schema already owns the behavior facts beside it (`void`, `object`, `isolating`) |
| Code block and callout declare the fact | Plate | `platejs` (`features/code-block`, `features/callout`) | The producer of each element owns its declaration |
| Rule-action JSDoc for `'exit'` and `'deleteExit'` | Plate | `platejs` (`src/lib/plugin/PluginDefinition.ts`) | It still says "Exit the current block" |

Every edit stays inside the module that owns it today, so the entrypoint graph does not change.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Caret after Mod+Enter in a code block or callout inside a container | The caret lands in the new paragraph inside the container, not after the container | jsdom specs in `ExitBreakPlugin.spec.ts` and `OverridePlugin.spec.tsx` assert the selection; one hand drive of the exit-break demo in Chromium |
| Undo after the callout's `deleteExit` | Unchanged: one undo restores the newline and removes the landed paragraph | the callout-in-quote spec asserts the one-step undo |

## Main changes

- The level read builds nothing and reads no root default. It reads the selected block's behavior, then each parent's compiled content, until it finds the level.
- The `Descendant | string` overload of `canContain`, the string branch in it and the `{ type?: unknown }` widening of `getElementBehavior` in `editor-schema.ts` go away. The exit-level-read session added them for its level read, and nothing else passes a string.

## Decisions

The arena ran three runners (opus @high, gpt-6-astra @xhigh, gpt-6.1-sol @xhigh) and a blind cross-judge (opus @high) on the level rule. The synthesis is in `docs/plans/artifacts/2026-10-14-exit-nearest-structure/architect/synthesis.md`, the judge's verdict in `architect/judge/answer.md` beside it.

Under the new rule, a void, an object, or a text block that declares `ownsExit` is the structure exit leaves. Otherwise exit leaves the nearest strict ancestor that is a root child, whose parent has no compiled content, or whose parent's ordinary content (a prefix program's remainder) admits a text block. `match` filters those strict ancestors, as today. The landing does not change. The structure's parent declares the default at the landing index, and a parent with no default or no room changes nothing.

| Rule | Plite census, 45 cases | Plate replay, 17 cases | Why it lost or won |
| --- | --- | --- | --- |
| Checkout today (control, adds nothing) | 30/45 | 9/17 | Fails the three reported cases: it measures every level against the root's default type |
| Scope group every structure declares (sol) | 43/45 simulated | not run | A container whose producer forgets the group skips levels, and the no-default and full-container refusals stop holding |
| No new fact: positional default plus a frame check (opus) | 36/45 | not run | Keeps the app-root two-level exit, keeps a heading inside its quote, and a narrow root grammar two levels up makes a code block leave its quote |
| Declared text-block fact plus derived containers (astra, base) | 41/45 simulated | not run | Base: a forgotten declaration falls back to today's behavior |
| Synthesis (base with the object and undeclared-parent grafts) | 43/45 | 17/17 | Misses only the details grammar default, which Plate repairs, and one named limit the control shares |

The census logs are `docs/plans/artifacts/2026-10-14-exit-nearest-structure/census-arena-a4.log` and `plate-replay-a1.log`; the checkout's level read replays identically to the tree in both.

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Which level `tx.break.exit` leaves | Nearest ancestor that is a root child or whose parent can contain the root default's type | A void, an object or an `ownsExit` text block leaves itself; otherwise the nearest strict ancestor that is a root child, sits in an undeclared parent, or sits in a parent whose ordinary content admits a text block | Plite `exit-break.ts` | `EDIT-GLOBAL-001` to `-003`; the root default is not a level fact | No caller changes; docs and Vision teach the new rule | Steps 2 and 3 specs, the census and the Plate replay | A custom code-like block without the flag still leaves its container | rearchitect |
| `ownsExit` element fact | none | `SchemaElementInput.ownsExit?: boolean`, text blocks only; compiled `behavior.ownsExit`; in the contract and fingerprint only when true | Plite schema compiler | Heading, code and callout have identical grammar, so no existing fact can tell them apart | Code block and callout declare it; custom code-like blocks opt in | Step 1 compiler and contract tests | Plate's fingerprint changes | rearchitect |
| `canContain` string overload | `canContain(parent, Descendant \| string)` | `canContain(parent, Descendant)` | Plite `editor-schema.ts` | Its only caller was the replaced level read | none | typecheck, diff against the exit-level-read session's pre-edit copy | none | cut |
| `match` option | Filters strict ancestors | Unchanged | Plite `exit-break.ts` | Deleting it from `ExitBreakPlugin` is a hard cut of a committed option | none | the existing `match: () => true` spec | It can still skip a level when a caller asks | keep |
| Landing helper `insertDefaultChild` | Builds the landing default, then admits it | Unchanged | Plite `insert-default-child.ts` | Its throw on an unbuildable landing default predates this rule and is shared with Enter on a block void | none | side task | A landing parent whose default needs a property at that site still throws | keep |
| Details grammar | `any([summary, blockContent], { default: summary })` | Unchanged | Plate details | Details already turns a landed summary into a paragraph in the same update | none | Plate replay case "code block in a details body"; Step 3 spec | none in Plate | keep |
| Mod+Enter speed | Peer level read, inherited budget | Same budget | `benchmark` | Once per gesture | none | Step 0 | A conclusive miss | gate |

### Named limits

- A structural parent that also admits a text block, such as a column group that holds a caption paragraph, makes Mod+Enter in a column's paragraph add a column. The checkout does the same, and no shipped schema has such a parent.
- In a Plite schema whose container declares a frame part as its default, such as a summary at every index, exit lands that default. Plate's details repairs it; a Plite-only schema owns its own grammar.
- A text block that should own its exit but does not declare `ownsExit` behaves like a paragraph, as every block does today.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Heading inside a container | Leaves the container, like a paragraph does today | Stays inside, like a code block | heading stays | small |
| How a block says exit leaves it first | One new flag on the block's schema, set by code blocks and callouts | A group that every container declares | scope group | big |
| The new flag's name | owns exit | defining, which ProseMirror uses for another job | call it defining | small |
| The ancestor filter option | Kept as it is | Removed, which is a hard cut | cut match | small |
| Details' usual block | Unchanged; details turns a landed summary into a paragraph | Details declares a paragraph for its body | details default | small |
| A landing block that cannot be built | Still errors as today, tracked as a side task | Fixed here | fix landing | small |
| Plate's schema fingerprint | Changes, in a release that already ships a schema migration (look) | Leave the flag out of the fingerprint | keep fingerprint | small |
| Plate deriving the flag from Enter rules | Each plugin declares the flag itself | Plate sets it for plugins whose Enter rules exit | derive flag | small |
| Speed check timing | Runs after the other session's benchmark, so the two do not slow each other | Runs now beside it | bench now | detail |
| A grid that also holds a caption paragraph | Adds a column, as today, named as a limit | Leaves the whole grid | grid exits | detail |
| Where this plan's page lives | Its own page | One shared exit page for the three exit plans | shared page | detail |

## Open questions

### Callout test in a section

Should leaving a callout in a section keep you inside that section?

Why it needs you: You asked to approve every changed test outcome yourself.

- Today that test expects a new section, which leaves two levels.
- Your request called that test a two-level exit.

- **Stay in section** (recommended): A paragraph lands after the callout, inside its section. Cost: One existing test changes its expected result.
- **Keep the test**: The test's stand-in callout stays without the flag, so a new section appears. Cost: The test keeps checking a two-level exit.

Why I pick it: It is the one-level exit your request asks for.

Attention: safe

## Steps

- [ ] 0. Speed pre-acceptance probe, before any product edit, through `benchmark`. Copy the exit-level-read session's harness (`docs/plans/artifacts/2026-10-14-exit-level-read/bench/`) into this run's `bench/` and change only the copy. Base is `40ec0bad77`; the candidate is that commit plus the synthesis `exit-break.ts`, through `proof-worktree.mjs --with`; a same-code arm repeats the candidate, and a planted arm adds busy work sized to 30% of one whole Mod+Enter. This run inherits the budget from `docs/plans/2026-10-14-exit-block.md` and freezes it before reading any candidate result. In every cohort (depth 1, 8 and 32, with a cheap and a deep required default), the candidate's median wall time for one Mod+Enter is at most 1.10 times base. `paired-timing.mjs` judges it with three times the earlier sample count and a load limit of 9; a known-bad input must fail with the probe's own assertion text. A conclusive miss sends the level rule back to `architect`; an inconclusive result stays a gate and reruns on the final bytes in step 9. Proof: the paired config and its attempt-indexed measurements and log in this run's `bench/`.
- [ ] 1. The `ownsExit` fact in Plite. Accept it on `SchemaElementInput` and in `schema.element.textBlock()` options; compile it into `behavior.ownsExit` (false by default); refuse it with `invalid-element-behavior` on an inline, void, object or container element; carry it in the schema contract and the fingerprint only when true, so a schema that never declares it keeps its fingerprint and contract bytes; read an old contract without the key as false. Proof: red-first tests in `packages/plitejs/test` for the compile, each refusal, the contract round trip, a fingerprint that equals the literal computed at base for a schema without the flag, and a changed fingerprint when one element declares it.
- [ ] 2. The level rule in `exit-break.ts`, after messaging the exit-level-read session. Replace its level read with the rule in Decisions, and revert the `canContain` overload, its string branch and the `getElementBehavior` widening in `editor-schema.ts` to the exit-level-read session's pre-edit copy (`docs/plans/artifacts/2026-10-14-exit-level-read/pre-edit/editor-schema.ts`), leaving other sessions' hunks. Rewrite the `exit` JSDoc in `interfaces/editor.ts`. Proof: `packages/plitejs/test/break-exit.test.ts` passes every case, the exit-level-read session's three included, with new cases for an `ownsExit` text block in a quote, a heading in a quote, an isolating text header cell, a block void in a column and an undeclared container; the census rerun with the real flag scores 43/45 with the two named misses; `mutate.mjs` shows each new guard fails when its clause is removed.
- [ ] 3. Producers. `BaseCodeBlockPlugin` and `BaseCalloutPlugin` declare `ownsExit: true`; `PluginDefinition.ts` documents `'exit'` and `'deleteExit'` as leaving the nearest structure through `tx.break.exit`. After your answer, the app-root spec in `OverridePlugin.spec.tsx` either gives its stand-in callout the flag and expects a paragraph inside the section with one-step undo, or stays unchanged. Proof: `ExitBreakPlugin.spec.ts` (code block in a column) and `OverridePlugin.spec.tsx` (callout in a quote) go from red to green; a new spec for an image in a column lands inside the column; a spec for a code block in a details body lands a paragraph with the caret in it; the Plate replay with the real flag scores 17/17.
- [ ] 4. Generated outputs. Run `pnpm --filter www editor:generate` for `plugins.generated.ts` and `plugins.schema.json`, and refresh the API reference manifest for `EditorElementBehavior` and `SchemaElementInput`. Proof: `pnpm --filter www exec plate generate --check src` passes and the diff touches only the new field and the fingerprint; `withPlite.slow.ts`'s pinned fingerprint is checked by its own test run.
- [ ] 5. Docs through `plate-docs`: `content/docs/(plugins)/(functionality)/(utils)/exit-break.mdx` and its `.cn.mdx` twin (How exit break works, Exit point determination, Custom plugin configuration, a nested code block example), `content/docs/api/editor-transforms.mdx` (`tx.break.exit`), `content/docs/(guides)/schema.mdx` (declaring `ownsExit` on the notice example) and the exit-break demo values in both locales. Proof: `plate-docs`' example audit and docs checks, and the preview of each page.
- [ ] 6. `best-api repair` for the new schema fact and the changed exit rule: the `docs/vision/plite.md` exit bullet, and every skill or doc that still teaches the root-default rule. Proof: its repair log and a `git grep` for the old rule's wording over live source, docs and skills.
- [ ] 7. Changesets: `.changeset/plite-break-exit.md` (the rule and `ownsExit`) and `.changeset/platejs-exit-break-default.md` (code block and callout exits, the fingerprint change). Proof: `changeset`'s check.
- [ ] 8. Hand drive the exit-break demo in Chromium: Mod+Enter in the code block inside the column, then in the column's paragraph. Proof: `hand-drive.mjs check` and the screenshots.
- [ ] 9. Final proof on the final bytes: the touched plitejs and platejs partitions and their typechecks, then step 0's paired probe rerun on the final production path. Proof: attempt-indexed logs in the run directory.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Each reported case red at base, green after | yes | pending |
| `break-exit.test.ts`, `ExitBreakPlugin.spec.ts`, `OverridePlugin.spec.tsx` green except owner-approved outcomes | yes | pending |
| Touched plitejs and platejs partitions and typechecks | yes | pending |
| Paired speed probe on final bytes | yes | pending |
| Writing passes: `deslop`, `no-comments`, `unslop` | yes | pending |
| Diff panel (reviews row `api-build`) | yes | pending |
| `best-api repair`, `plate-docs`, changesets | yes | pending |
| Hand drive | yes | pending |
| `pnpm lint:fix` on the task's paths | yes | pending |
| Decision-trail review | yes | pending |

## Open work

- The landing helper throws when the landing parent's default needs a property it cannot fill at that site; Enter on a block void shares it. owner: zbeyens. stop: a suggested task lands a refusal there, or the owner drops it. Tracked as a suggested task from this run.
