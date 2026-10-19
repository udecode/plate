# Exit picks its level without building a block

Status: executed: ready for your commit
Playbook: plan
Page: https://claude.ai/artifact/33HNCihduRT9CK3UN74eYT

## Brief

### What will change?

Mod+Enter no longer crashes when your document's usual block needs an id and the new block lands inside a container. It also leaves containers the same way wherever they sit. It passed the speed check in every case.

### What could go wrong?

Mod+Enter still errors when the block it adds at the top level needs an id. Another session plans to rewrite how exit picks where to land, which would replace this work.

## Teach

Mod+Enter leaves the structure you are in and adds an empty block next to it. To decide how far out to go, it walks up from your block and stops at the first container whose parent could hold the document's usual block, such as a paragraph. A table row can't hold one, so the walk passes a cell and its row and stops at the table.

Before this change, it answered that question by building the usual block, then built it again to insert it. Building failed when that block needed an id, so the key could crash even where the block it landed would be fine. It also built the block meant for the spot right after your top-level block, and in some documents that spot holds a different, required block.

After the change, exit reads only the usual block's type and asks the schema whether each parent accepts that type. Nothing gets built until the landing, and then only once.

## What other editors do

Read at prosemirror-commands 52a84a8, prosemirror-model 6264de0, Tiptap 91c51be53, Lexical dd5c41b13 and Slate 945a484df, none run. ProseMirror is the only one with a schema-driven exit, and it checks the default block's type before it builds one block.

| Editor | Which level exit leaves | How it reads the default block | When it builds |
| --- | --- | --- | --- |
| ProseMirror | `exitCode` leaves only the code block's parent (`prosemirror-commands/src/commands.ts:308`) | `defaultBlockAt` walks the parent's content match for the first textblock type with no required attributes (`commands.ts:297`) | once, `createAndFill` after the type-level `canReplaceWith` check (`commands.ts:312-314`) |
| Tiptap | a code block's third Enter calls ProseMirror's `exitCode` (`packages/extension-code-block/src/code-block.ts:359`) | as ProseMirror | as ProseMirror |
| Lexical | `CodeNode.insertNewAfter` leaves the code block (`packages/lexical-code-core/src/CodeNode.ts:289`) | none, it always makes a paragraph (`CodeNode.ts:367`) | once |
| Slate | no exit command in core | none | app code |

## Main changes

- `packages/plitejs/src/editor/exit-break.ts` no longer builds a block to choose its level. When the selected block sits two or more levels below a root child, it reads the element type of the active root's body default (its content program's `defaultPlan`, which follows any required leading slots) and asks `schema.canContain(parent, type)` of each strict ancestor's parent. The walk, `match`, `before` and the landing through `insertDefaultChild` stay as they are, so one Mod+Enter builds at most one block.
- `packages/plitejs/src/core/editor-schema.ts`: the private membership rule `contentAllows` and the internal `canContain` also take an element type. A type is judged by the same membership rule as a node of that type, and a parent with no compiled content program (an element the schema does not declare, kept by `unknown: 'preserve'`, the default for schema-less editors) keeps its fallback rule, read from the type's compiled behavior.

## Scope

This plan changes the level read in `exit-break.ts`, the type input of `contentAllows` and `canContain`, the specs that pin them, the promise text that names the old positional read (the `tx.break.exit` JSDoc, `docs/vision/plite.md` and `content/docs/api/editor-transforms.mdx`), and runs the frozen speed gate.

It leaves three things alone. The landing helper `insertDefaultChild` is shared with Enter on a block void, so exit still throws where the block it lands cannot be built. The nearest-structure level rule belongs to another session, whose red specs sit in the same three files. The misreading of an element with a property named `text` goes to a side task.

## Decisions

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Exit's level read | builds the root default at the next top-level position, then asks `findWrapping(parent, block)?.length === 0` | reads the root program's body default type, then asks `canContain(parent, type)` | `plitejs` `editor/exit-break.ts` | the build throws, picks a prefix slot and doubles the work; the question needs only the type | internal; `tx.break.exit` keeps its signature, and Plate's callers are untouched | step 1 specs, step 5 speed gate | an element whose property is named `text` reads as an element, not as text | rearchitect |
| Containment input | `canContain(parent, child: Descendant)` | `canContain(parent, child: Descendant \| string)`, a string being an element type | `plitejs` `core/editor-schema.ts` | one membership rule and one fallback answer for nodes and types; no stand-in node | internal; every node caller compiles unchanged | step 2 typecheck, step 1 specs | none beyond the row above | keep, widened |
| Landing | `insertDefaultChild` builds the landing parent's positional default, admits it with `canPlaceAt` and selects it | unchanged | `plitejs` `editor/insert-default-child.ts` | shared with Enter on a block void; the user scoped the fix to the level read | none | the three spec files | still throws where the landed block needs a property | keep |
| Mod+Enter speed | base built the root's slot-zero default once | one build, no build for the level read | `benchmark` paired probe | the user's frozen 1.10 budget | none | step 5 | a conclusive miss sends the level read back to `architect` | gate |

Targets compared in `architect` (runners Opus, Astra and Sol; cross-judge Opus; base Astra's):

| Target | Exit asks | New artifact | Parity | Outcome |
| --- | --- | --- | --- | --- |
| Incumbent | `findWrapping` on a built block | none | today | rejected: the user's three costs |
| Stand-in node | `canContain(parent, { children: [], type })` | none | same as picked | rejected: safe only while `canContain` reads nothing but the type, guarded by a comment |
| Public type read | `allowsElementType(parent.type, type)` | none | climbs out of an undeclared container where today refuses (`probe-derived-nested-a1.log`) | rejected |
| New member | `canContainRootDefault(parent, root)` | one internal member | same as picked | rejected: a second containment entry that rereads the root per ancestor |
| `canContain` takes a type | `canContain(parent, type)` | none, one internal input widens | same, except the text-property case | picked |

The run directory `docs/plans/artifacts/2026-10-14-exit-level-read/architect/` holds the brief, each runner's answer, the rubric and the judge's verdict.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Mod+Enter where the new top-level block needs an id | Still errors and changes nothing, as before (look) | Refuse quietly instead, which also changes Enter on a picked divider | refuse quietly | small |
| A block with a setting named text | Exit treats it as the block it is | Keep today's accidental reading of it as text | text reading | detail |
| A container your schema doesn't list | Exit still does nothing there, as today | Climb out and add the block after it | climb out | detail |
| Three red tests from another session | Not counted against this change; they stay red as before (look) | Wait for that session to make them pass first | wait for them | small |
| Review of this plan | The design contest only, since nothing public changes | Also run a review panel on the plan | panel | detail |
| Where this page lives | Its own page | The page of the earlier exit block plan | exit page | detail |
| This plan's page | The new page https://claude.ai/artifact/33HNCihduRT9CK3UN74eYT, since https://claude.ai/artifact/4SZJpRkYK1Fay3boEK8URB no longer opens from this account | Drop the new page and restore the old link | old page | detail |
| Checks broken by other sessions' unfinished work | Count this work as done; those checks fail the same without it (look) | Wait for those sessions, then rerun | rerun after them | small |

## Steps

- [x] 1. Specs first, in `packages/plitejs/test/break-exit.test.ts`: (a) a root whose top-level paragraphs need an id, where exit from a quote inside a box lands the box's paragraph and returns `true`; (b) a root whose prefix puts a title after a box, where exit from a quote inside the box lands a paragraph inside the box; (c) a schema-less editor with a quote inside a quote, where exit returns `false` and changes nothing. Proof: (a) and (b) fail on the frozen pre-edit tree through `tooling/scripts/proof-worktree.mjs --expect-fail`, (c) passes there, all three pass after step 3, and `.agents/pstack/mutate.mjs` shows (c) failing when the string branch of `canContain` asks `allowsElementType` instead.
- [x] 2. `packages/plitejs/src/core/editor-schema.ts`: `contentAllows` and `InternalEditorSchemaApi.canContain` take an element type; the node path keeps its exact rules. Proof: `pnpm --filter plitejs typecheck` and the step 1 specs.
- [x] 3. `packages/plitejs/src/editor/exit-break.ts`: the level read asks `canContain(parent, bodyType)`, with `bodyType` read from `getRootContent(root)?.defaultPlan` only when the selected block's path is longer than 2. Proof: the three spec files pass on the final bytes, except the three cases another session added, which fail as they did before this run's first edit (`docs/plans/artifacts/2026-10-14-exit-level-read/baseline-platejs-exit-specs-a1.log`, `docs/plans/artifacts/2026-10-14-exit-level-read/baseline-plitejs-break-exit-a1.log`).
- [x] 4. Promise text, through `plate-docs` for the docs page: the `tx.break.exit` JSDoc in `packages/plitejs/src/interfaces/editor.ts`, the exit bullet in `docs/vision/plite.md`, and the level sentence in `content/docs/api/editor-transforms.mdx` say the root's body default, wherever the container sits; `changeset` decides whether a changeset line changes. Proof: the docs source parity check, `pnpm check knowledge` and a `git grep` for "after the current top-level block".
- [x] 5. Benchmark gate, frozen before any candidate result. Rerun the paired probe from `docs/plans/artifacts/2026-10-14-exit-block/bench/paired-config-a3.json` and `bench-exit.ts` through `.agents/rules/benchmark/scripts/paired-timing.mjs`. Frozen line: in every cohort (`d1-cheap`, `d8-cheap`, `d32-cheap`, `d1-deep`, `d8-deep`, `d32-deep`), the candidate's median Mod+Enter wall time (`medianWallMicrosPerUpdate`) is at most 1.10 times base, with a one-minute load limit of 9 on 18 cores. Base is the checkout frozen with the exit-block run's and this run's package files reverted to their state before the exit-block run. The harness copy `docs/plans/artifacts/2026-10-14-exit-level-read/bench/bench-exit.ts` takes 900 samples per cohort, three times the earlier 300, with the same 60 warmups. The planted arm runs base's code and adds busy work equal to 30 percent of each whole timed Mod+Enter call, inside the timed window, so it is sized to the whole Mod+Enter rather than to `exitBreak`. The same-code arm is a second copy of the candidate. A known-bad run with `--expect-wrong-landing` must fail with `bench-exit assertion`. A conclusive miss on any cohort sends exit's level read back to `architect`; an inconclusive run stays a gate with this budget. `pstack:benchmark-checklist` runs before any row is logged verified. Proof: the paired-timing log and measurements in `docs/plans/artifacts/2026-10-14-exit-level-read/bench/`.
- [x] 6. Close the earlier plan's Open work item "Make exit's level read build-free and root-wide" in `docs/plans/2026-10-14-exit-block.md`, pointing it at this plan. Proof: that file's Open work.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Pre-edit baseline of the three spec files | yes | `docs/plans/artifacts/2026-10-14-exit-level-read/baseline-plitejs-break-exit-a1.log`, `docs/plans/artifacts/2026-10-14-exit-level-read/baseline-platejs-exit-specs-a1.log`; specs (a) and (b) fail on the pre-edit tree, (c) passes (`docs/plans/artifacts/2026-10-14-exit-level-read/spec-red-pre-edit-a1.log`) |
| Code quality review of the shared-code diff (`pstack:thermo-nuclear-code-quality-review`) | yes, `editor-schema.ts` is shared Plite core | no blocker or major; findings 1 to 6 applied, 7 left to lint (`docs/plans/artifacts/2026-10-14-exit-level-read/review/thermo-slice-1.md`) |
| Writing passes: `deslop`, `no-comments` on code; `unslop` on the plan and docs | yes | deslop changed nothing; no-comments deleted two comments (`docs/plans/artifacts/2026-10-14-exit-level-read/review/no-comments-1.md`); unslop on the docs sentence, the Vision bullet, the plan's Brief and its Close |
| `pnpm check` steps the edits reach: plitejs typecheck, knowledge | yes | typecheck passes (`docs/plans/artifacts/2026-10-14-exit-level-read/final-plitejs-typecheck-a1.log`); knowledge fails only on other sessions' citations (`docs/plans/artifacts/2026-10-14-exit-level-read/check-knowledge-a1.log`), accepted under "rerun after them" |
| `plate-docs` on `content/docs/api/editor-transforms.mdx` | yes | registry rebuilt and fresh, source builds, parity passes (`docs/plans/artifacts/2026-10-14-exit-level-read/docs-registry-check-a1.log`, `docs/plans/artifacts/2026-10-14-exit-level-read/docs-parity-a1.log`); `check:docs` stops on another session's export (`docs/plans/artifacts/2026-10-14-exit-level-read/docs-check-a1.log`) |
| Hand drive of the changed docs page | yes | 8 of 8 cells on `/docs/exit-break` and `/docs/api/editor-transforms`, with native Mod+Enter from a table cell in a column (`docs/plans/artifacts/2026-10-14-exit-level-read/hand-drive-check-a1.log`); the transforms page re-driven on fresh loads after a stale tab logged another session's hot-reload warning (`docs/plans/artifacts/2026-10-14-exit-level-read/hand-drive-check-a2.log`) |
| `pnpm lint:task` on the task's files, last check that edits code | yes | clean; it reformatted spec (c) only (`docs/plans/artifacts/2026-10-14-exit-level-read/lint-task-a1.log`) |
| Benchmark rerun on the final bytes (step 5) | yes | passes: candidate 0.849 to 0.978 times base, planted 1.299 to 1.387, max load 8.18 (`docs/plans/artifacts/2026-10-14-exit-level-read/bench/paired-a2.log`, `docs/plans/artifacts/2026-10-14-exit-level-read/bench/checklist-a2.txt`); attempt a1 was voided by load 9.32 |
| Changeset decision through `changeset` | yes | one bullet added to `.changeset/platejs-exit-break-default.md` for the id case; the prefix-root fix needs none because no shipped root has such a prefix |
| `best-api repair` | no: `tx.break.exit` keeps its call shape; only its JSDoc wording changes | skip: no public call shape changes |

## Proof

The three spec files are the behavior oracle. The step 1 cases fail before the change for their named defects, and the undeclared-container case is the differential guard against the obvious wrong read. The speed line is the user's frozen paired probe. Native Mod+Enter stays covered by the docs demo's hand drive only.

The build runs `.agents/playbooks/build.md`.

## Close

Reversals and deviations come first.

- The slice 1 code review changed the code before the writing passes. The type branch of `canContain` now calls `getElementBehavior`, which takes `{ type }`, instead of copying its body. The level read drops a `?? 'main'` that did nothing, and spec (b) now checks that exit reports a landing.
- The comment pass deleted the JSDoc on `canContain` and the comment over the depth gate. It also asked for a separate `canContainType` and for a lazy root read in place of the depth gate. Both shapes stay as built. The `architect` runners rejected a separate type member (`docs/plans/artifacts/2026-10-14-exit-level-read/architect/opus/answer.md`). The lazy read was Opus's proposal, and this run's synthesis took Sol's depth gate in its place, as the judge's graft list suggested (log row "grafts").
- The first mutation run, on slice 1, dropped the type fallback. A second run on the final bytes adds the exact mutant step 1 names, a type branch that asks `allowsElementType`, and spec (c) fails on it.
- The benchmark's base arm reverts only the exit hunks of this run and the exit-block run. Copying their old pre-edit files would also have reverted another session's document work in `public-state.ts`.
- The exit-block plan's Main changes still describes the level rule that plan built. It stays as that plan's history, and this plan's Main changes holds the new rule.
- Rebuilding the docs registry rewrote generated files that held the exit-block run's uncommitted wording, before this run copied them. The hook had already staged the rebuilt bytes, so the old ones cannot be recovered. They were generated from `content/docs/api/editor-transforms.mdx`, whose pre-edit copy is in `docs/plans/artifacts/2026-10-14-exit-level-read/pre-edit/`.
- Load from other sessions voided the first benchmark attempt. The one-minute load reached 9.32, past the frozen 9. The second attempt waited for a load of 7 or less, started at 5.6 and peaked at 8.18.

What landed:

- `packages/plitejs/src/editor/exit-break.ts` reads the type of the active root's body default once, only for a block two or more levels below a root child. It asks `canContain(parent, type)` of each ancestor's parent and builds no block to pick its level.
- In `packages/plitejs/src/core/editor-schema.ts`, `canContain` and `contentAllows` take an element type as well as a node, and `getElementBehavior` takes `{ type }`.
- Three specs in `packages/plitejs/test/break-exit.test.ts`, the `exit` JSDoc, the level sentence in the transforms reference, the Vision bullet, a changeset bullet, and the earlier plan's Open work item, which now points here.

Proof and its limits:

- Specs (a) and (b) fail on the pre-edit tree and pass on the final bytes. Spec (c) passes on both (`docs/plans/artifacts/2026-10-14-exit-level-read/spec-red-pre-edit-a1.log`, `docs/plans/artifacts/2026-10-14-exit-level-read/final-plitejs-break-exit-a1.log`).
- All three mutants of the final tree fail their named specs (`docs/plans/artifacts/2026-10-14-exit-level-read/mutate-run-2.log`).
- The three exit spec files pass except three cases the nearest-structure session added. Those fail the same way before and after this run. The plitejs typecheck passes.
- The plitejs core partition has 1919 passing and 2 failing tests, and the platejs core partition 593 and 2. Each failure is another session's uncommitted spec. One is command-spec's new nested-default case, which fails the same way with both exit runs reverted (`docs/plans/artifacts/2026-10-14-exit-level-read/attribute-command-spec-base-a1.log`).
- The benchmark passes the frozen line in all six cohorts. The candidate measured 0.849 to 0.978 times base, and the planted slowdown 1.299 to 1.387 (`docs/plans/artifacts/2026-10-14-exit-level-read/bench/paired-a2.log`). It times a programmatic Mod+Enter in happy-dom. No speedup is claimed, because the profile puts the level read at 1 to 2 percent of the process (`docs/plans/artifacts/2026-10-14-exit-level-read/bench/checklist-a2.txt`).
- The docs registry is fresh and the docs parity check passes. `check:docs` stops at its first link on another session's `SchemaRoot` export, with the same error when this run's hunks are reverted (`docs/plans/artifacts/2026-10-14-exit-level-read/attribute-api-reference-without-a1.log`). The knowledge check's 104 findings neither come from nor cite any file this run touched (`docs/plans/artifacts/2026-10-14-exit-level-read/attribute-knowledge-a1.txt`), but no run with this change reverted backs that, so it stays inferred. Both are accepted under "rerun after them".
- `docs/plans/artifacts/2026-10-14-exit-level-read/bench/paired-a2-analyze-a1.log` re-judges the saved measurements with its command and exit code, because the original run log records neither.
- The hand drive covered 8 of 8 cells. A tab left open on the transforms page later logged a React script-tag warning while other sessions hot-reloaded shared files, so this run re-drove those four cells on fresh loads with no console errors (`docs/plans/artifacts/2026-10-14-exit-level-read/hand-drive-check-a2.log`). Native Mod+Enter from a table cell inside a column landed the paragraph after the table, inside the column. It ran in the app's built-in Chromium only.

Counts, over 6 steps and 3 open work items: 6 done, step 4 among them on its accepted narrower proof; 0 partial; 0 skipped; 0 blocked; 3 open.

Attention, from the decision-trail review (`docs/plans/artifacts/2026-10-14-exit-level-read/trail-review/answer.md`), each with what this run did:

reviewed by gpt-6.1-sol

- Registry regeneration skipped the pre-edit copies. Logged as a gap; the old generated bytes are gone, and their source's pre-edit copy remains.
- Docs failure ownership was inferred. `check:docs` now has a run with this change reverted that fails the same way. The knowledge check stays inferred from its inputs and is labeled that way.
- The acceptance labels did not cover every failed log. Each failed log now has its own labeled partial and accepted rows, and `plan-open.mjs` passes.
- The memo rejection was misattributed to Opus. The Close and the log now credit the depth gate to this run's synthesis.
- The cleanup after the nearest-structure build was requested, not confirmed. Open work now names the owner as the one who checks it.
- The code review's side findings had no disposition. Two are dropped with reasons, and the containment-test cleanup is a suggested task.
- The benchmark log lacked its command line. A labeled re-analysis of the saved measurements records it.
- The proofs ran on the frozen tree 40ec0bad77. Three exit cases stay red as before, and the benchmark passes its gate without showing a speedup.

## Open work

- The nearest-structure plan (`docs/plans/2026-10-14-exit-nearest-structure.md`) replaces this level read with a rule that reads no root default. That session confirmed the replacement. This run asked it to remove the type input of `canContain` and rewrite the `exit` JSDoc, the transforms reference sentence and the Vision bullet in the same build, and it has not confirmed that part. owner: zbeyens, who checks that build's diff for both. stop: the removal and the three rewrites land, or the owner keeps them as they are.
- Mod+Enter still throws where the block it lands at the top level needs a property such as `id`, as at base. owner: zbeyens. stop: the word "refuse quietly" reopens the landing decision and its build lands, or the owner dismisses it.
- An element with a property named `text` reads as text. owner: zbeyens, through the suggested task "Reserve text as an element property key in Plite". stop: that task lands, or the owner dismisses it.
