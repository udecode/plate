# One answer to whether a block owns its exit

Status: executed: waiting on your commit, together with or after the exit-rule check of task_7b3ea248
Page: https://claude.ai/artifact/ANivogBd6jbadyYYNoNpou
Playbook: plan

Execution playbook: Build (`.agents/playbooks/build.md`). Run directory: `docs/plans/artifacts/2026-10-14-exit-owner/`. Intake base: `e544d29448` plus the uncommitted Plate exit-rule check of suggested task `task_7b3ea248` (`docs/plans/artifacts/2026-10-14-exit-owner/task-7b3ea248.patch`). Requested by the session that ran `task_7b3ea248`, as its follow-up "Share Plite's exit-owner predicate with Plate".

## Brief

### What will change?

The owns-exit flag now says yes for images and dividers too, and both Mod+Enter and Plate's plugin check read it. Plate's copy of the rule is gone, and it's ready for you to commit.

### What could go wrong?

Code that reads the flag now gets yes for images and dividers. Saved schemas don't change. One line this change needs also sits in another session's unfinished edit, so keep that line if that edit is thrown away.

## Teach

Exit is Mod+Enter. It steps out of the block you are in, or out of the container around it. Some blocks are a thing you step out of on their own: a code block, a callout, an image, a divider. They own their exit.

The schema has an owns-exit flag, but today it only records what a text block declared. Images and dividers own their exit without declaring it, so the flag says no for them. Mod+Enter works out the real answer from three facts each time. Plate's new plugin check copied that rule, and someone has to keep the copy in sync by hand.

After this change the flag holds the full answer from the moment the schema compiles. Mod+Enter and the Plate check both read the flag, and the copy goes away. Saved schemas stay the same, because they still store only what a text block declared.

## Public API

An app reading a block's behavior gets the full answer for a divider, which owns its exit without declaring it.

```ts before
// packages/plitejs/src/interfaces/editor.ts (EditorElementBehavior)
/** Whether the text block declares `ownsExit`; false for voids and objects. */
ownsExit: boolean;

// app code, divider is a block void
editor.read.schema.getElementBehavior(divider).ownsExit; // false
```

```ts after
// packages/plitejs/src/interfaces/editor.ts (EditorElementBehavior)
/**
 * Whether the element owns its exit, which every void and object does, as
 * does a text block that declares `ownsExit`. `tx.break.exit` treats a
 * selected block that owns its exit as a structure of its own.
 */
ownsExit: boolean;

// app code, divider is a block void
editor.read.schema.getElementBehavior(divider).ownsExit; // true
```

`exitBreak` reads the field instead of combining three.

```ts before
// packages/plitejs/src/editor/exit-break.ts
const ownsExit = (element: Element) => {
  const behavior = schema.getElementBehavior(element);

  return behavior.void || behavior.object || behavior.ownsExit;
};
```

```ts after
// packages/plitejs/src/editor/exit-break.ts
const ownsExit = (element: Element) =>
  schema.getElementBehavior(element).ownsExit;
```

## What other editors do

This plan read ProseMirror (`prosemirror-model@6264de0`, `prosemirror-commands@52a84a8`) from the local clones; Tiptap, Lexical and Slate come from the earlier exit plan's prior-art pass (`docs/plans/2026-10-14-exit-nearest-structure.md`). None was run. ProseMirror keeps the raw flag in the node spec and exposes derived reads on the compiled node type, which is the split this plan takes.

| Editor | Where "leave this block first" is decided | Raw declaration or effective read |
| --- | --- | --- |
| ProseMirror | `exitCode` checks the parent's `spec.code` (`prosemirror-commands/src/commands.ts:292`) | The spec keeps the raw flag; the compiled `NodeType` exposes derived reads such as `isAtom`, true for every leaf or `spec.atom` (`prosemirror-model/src/schema.ts:108`) |
| Tiptap | ProseMirror's `exitCode` | As ProseMirror |
| Lexical | The code node's own Enter handling; element classes override methods such as `isShadowRoot()` | Behavior lives on the node class, no shared schema flag |
| Slate | No exit command | None |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Compiled `behavior.ownsExit` holds the effective answer; contract and fingerprint keep the declared bit | Plite | `plitejs` (`src/core/schema-compiler.ts`), read through the root `plitejs` schema API | The schema compiler already derives `isolating`, `atom` and `markableVoid`; exit ownership is a Plite rule of `tx.break.exit` |
| `exitBreak` reads the field | Plite | `plitejs` (`src/editor/exit-break.ts`) | One reader of the compiled fact |
| Plate's empty-line exit refusal reads the field | Plate | `platejs` (`src/internal/plugin/resolvePlugins.ts`), through the existing facade export of `getCompiledEditorSchemaFromApi` | The refusal of which plugins Plate accepts stays Plate policy; the ownership fact comes from Plite, with no new bridge export |

## Hard cuts and app migration

Nothing is removed. One unreleased read changes meaning: `EditorElementBehavior.ownsExit` and `EditorSchemaElement.behavior.ownsExit` read true for every void and object. `ownsExit` ships first in this beta (`.changeset/plite-break-exit.md`, unreleased), and no source, test, doc or generated file reads it for a void or an object (decision log, row "census"). Apps change nothing; copied registry components do not read it.

## Main changes

- The schema compiler encodes exit ownership once. A void or an object owns its exit by its kind, and a text block by its declaration. The contract writer stores only the declaration, so every saved schema keeps its bytes. The reader still hashes a received contract with base's code, so it accepts and refuses exactly what base does; a contract that adds `ownsExit` to a void or an object still fails its fingerprint. A restored contract takes its behavior from the compile it is already checked against, so it gives the answer a fresh compile gives.
- Plate's plugin check no longer restates Plite's rule.

## Decisions

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| "Owns its exit" | Derived at each use: `exitBreak` ORs void, object and the declared bit; Plate ORs object and the declared bit inside the textBlock gate | The compiled `behavior.ownsExit` is the effective answer, decided once by the schema compiler | Plite schema compiler | One owner; a new exit owner reaches both readers; truthful public name | Both readers read the field | Steps 1 to 3 | A reader that needs only the declaration; none exists | rearchitect |
| Public `ownsExit` read | Declared bit, false for voids and objects | Effective answer, true for every void (inline ones included) and object | Plite | The name says "owns exit"; `isolating`, `atom` and `markableVoid` are already effective values | JSDoc on both public types, changeset line, Vision bullet | Step 1 tests, best-api repair sweep | An app that wanted the declaration; unreleased, none found | rearchitect |
| Contract and fingerprint `ownsExit` | Written when the declared bit is true; a received contract hashes through `omitFalseOwnsExit` | Unchanged bytes: the writer, `declaredContractBehavior`, stores the bit only for a text block that declares it, derived as effective and not owned by kind; a received contract hashes through base's unchanged code | Plite | Serialized-data law: snapshots and history refuse a fingerprint change, and the reader must accept and refuse what it does at base | none | Fingerprint probe, a new pinned fingerprint for a schema with a void and an object, new cases that add `ownsExit` to a stored void and object and that hold an explicit `ownsExit: undefined` | A leak of the effective bit moves every schema with a void or an object; any change to the received-data hash changes which contracts the reader accepts | keep |
| Owns-by-kind rule | Spelled in two readers | One private rule in the schema compiler, used by the compile, the declaration refusal and the contract writer | Plite schema compiler | The refusal keeps declarations off owner kinds, so the writer's derived bit is exact by construction | none | Mutants m3 and m4 | Widening the rule to a kind that a schema declares `ownsExit` on refuses that declaration, and dropping it changes that schema's fingerprint | keep |
| Contract restore | Rebuilds behavior from the contract, `ownsExit` from the stored bit | Takes each element's behavior from the compile that restore already runs to check the contract | Plite | The contract must equal that compile's contract, so restore equals compile by construction and nothing reads the stored bit back | none | The new restore case | none | keep |
| Plate's empty-line exit refusal | Copies Plite's rule behind a pointer comment | Reads the compiled field inside its textBlock gate | Plate | The gate (which plugins Plate refuses) is Plate policy; the fact is Plite's | none | `resolvePlugins.spec.tsx` refusal and acceptance cases | none | move |
| Private `plitejs/internal` helper | none | none | none | The compiled field removes any need for a bridge | none | none | none | cut |

### Design arena

`architect` ran three runners from one prompt (`docs/plans/artifacts/2026-10-14-exit-owner/architect/`), and all three reached the same target independently: Opus, Astra and Sol each made the compiled public field the effective answer, kept the contract bytes, and added no export. They split on how the writer keeps the declared bit. The blind cross-judge scored the Opus shape 23, the Astra shape 18 and the Sol shape 18, and recommended the Opus shape as base with two grafts, which the lead's own scoring matched.

- Base: one private owns-by-kind rule; the writer stores the bit when the effective value holds and the rule does not.
- Graft from Astra and Sol: restore reuses the fresh compile's behavior. At `e544d29448` restore already runs that compile inline to check the contract; this plan names its result `compiled`, as another session's uncommitted rewrite of `schema-compiler.ts` also does. The lead first dropped this graft on the false claim that base never runs that compile; the plan panel corrected it (decision log, row "corrected").
- Graft from the judge, answering Astra's and Sol's objection: the declaration refusal uses the same rule, so a declaration and ownership by kind never meet and the derived bit is exact.
- Rejected: Astra's private symbol and Sol's `declaredOwnsExit` field, which store a second fact on the compiled element that the public `restoreEditorSchemaContract` returns; Sol's move of Plate's check to public schema reads, which gains nothing while the same function keeps the compiled schema for its other checks and swaps the group lookup for a transitive one; a helper exported through `plitejs/internal`, which leaves the public field misleading; a new public method, which would be a second read of one fact.

Only the Opus family reached the derived-bit base (the judge is Opus too), so the plan panel attacks it, and the dropped restore graft, with seats of other families.

### Named limits

- Adding a kind to the owns-by-kind rule makes the compiler refuse an `ownsExit` declaration on that kind. A schema that declared it there must drop the declaration, and that changes its fingerprint, so its snapshots, history and authored comparisons need a migration. Today no kind overlaps, so widening the rule needs its own plan with that migration.
- The Plate check still cannot read a rule written as a function, as before.
- The compiler does not check that `ownsExit`, or any other behavior flag, is a boolean, at base or after this plan. Untyped JavaScript can declare `ownsExit: 'yes'`; it compiles, and its contract stores `'yes'`, which `readEditorSchemaContract` refuses, as at base. This plan keeps that input's bytes as they are, a test pins them, and checking the flag types is open work.
- `ownsExitByKind` accepts any shape with `void` and `object`, stored behavior included, so applying it to received data is not a type error; the forged-contract case is the guard.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the full owns-exit answer lives | In the schema's own flag, which now says yes for images and dividers too (look) | A private helper Plate imports, and the flag keeps saying no for them | private helper | big |
| How saved schemas stay the same | The editor works out which blocks declared the flag, using one rule. If we later make another kind of block own its exit automatically, any schema that declared the flag on that kind gets a new fingerprint (look) | Keep a second copy of the declared flag on every block type, so those fingerprints never move | store declared | small |
| Files you didn't list | Also touch a few: the flag's doc comment in two Plite type files, three Plite tests, the Vision note, the changeset and one open-work line. The repo's rules require these when a public read changes meaning (look) | Edit only your listed files and hand you the rest as a follow-up | brief writes only | small |
| Build after the plan review | Build now: three review rounds settled every finding (look) | Stop here so you can read the plan first | hold | small |
| The earlier Plate check is not committed yet | Build on it as it sits in the working tree, since you commit next yourself | Wait for your commit first | wait commit | small |
| One of three reviewers hit a usage limit twice, in the design round and again in the plan review | Ran it again once the limit cleared each time, so all three answered both times | Decide with the other two | two reviewers | detail |

## Steps

- [x] 1. Plite compiles the effective answer. In `packages/plitejs/src/core/schema-compiler.ts`, one private rule, `ownsExitByKind`, says a void or an object owns its exit by kind. The element behavior compile sets `ownsExit` to the declaration or that rule, and refuses a declaration on an inline element or an owner by kind. A new `declaredContractBehavior` turns compiled behavior into its stored form. It drops the bit for an element the rule owns by kind and otherwise keeps the declared value as written, so even an untyped truthy declaration such as `'yes'` keeps the value and fingerprint it has at base. The contract writer and the compiled fingerprint call it. `omitFalseOwnsExit` and `canonicalSchemaElementBehavior` keep base's bodies and now take stored behavior only, so `declaredContractBehavior` is the one typed path from compiled behavior to stored bytes, and the reader hashes a received contract with base's code. `restoreEditorSchemaContract` names its existing compile `compiled`, and `restoreElement` takes each element's behavior from it. In the shared tree another session's uncommitted rewrite already binds the same `compiled`, so the build adds no line there; `apply-change.mjs` adds the binding at base, and it must stay if that rewrite is dropped. The "declares ownsExit but is not a text block" check reads the raw declaration on the element input. Update the `ownsExit` JSDoc on `EditorElementBehavior` (`packages/plitejs/src/interfaces/editor.ts`) and `EditorSchemaElement` (`packages/plitejs/src/interfaces/schema.ts`) to say the element owns its exit, voids and objects always, and on the contract's `EditorSchemaContractElementBehavior` to say the stored bit is present only where a text block declares it. Proof: the fingerprint probe prints the same fingerprints at base and on the step's bytes. Five new cases. `packages/plitejs/test/schema-compiler.test.ts` pins the base fingerprint `fnv1a64:2cef62983b4aa32c` of a schema holding a block void and an object, the direct guard on persisted bytes under the serialized-data law. `packages/plitejs/test/schema-contract-generation.test.ts` gets four. One checks that the stored contract omits the bit for a void and an object and that restore reports both as owning their exit; it is the only case that fails on a restore that reads the stored bit (m2), and it covers objects, which the existing every-void-kind read-back lacks. One refuses a stored contract that adds `ownsExit` to a void or an object; it is the only case that fails when received data goes through the kind rule (m6). One reads a contract object whose behavior holds an explicit `ownsExit: undefined`, which base accepts; it is the only case that fails when the reader stops dropping that key (m8). One keeps the stored value and fingerprint of an untyped declaration, `'yes'` or `1`, as base writes them; it is the only case that fails when the stored form coerces the declaration to `true` (m9). Each case fails under its mutant in step 5's worktree run, which edits the compiler there and restores it after each mutant; `.agents/pstack/mutate.mjs` would link this checkout's `node_modules`, so its `plitejs` imports would load the shared tree instead of the mutant. Done: `docs/plans/artifacts/2026-10-14-exit-owner/final/run/` holds the probe logs (`nonboolean-a1.log`, `forged-a1.log`, `probe-a1.log`, `media-a1.log`), the passing `plitejs-core-a1.log` and the mutant logs; m2, m6, m8 and m9 each fail only their named case.
- [x] 2. `exitBreak` reads `schema.getElementBehavior(element).ownsExit`. Proof: `packages/plitejs/test/break-exit.test.ts` passes unchanged, and fails when the compile drops ownership by kind (mutant m3). Done: `break-exit.test.ts` passes in `docs/plans/artifacts/2026-10-14-exit-owner/final/run/plitejs-core-a1.log` and fails under m3 in `docs/plans/artifacts/2026-10-14-exit-owner/final/run/m3-compile-declared-plitejs-a1.log`.
- [x] 3. Plate's `assertEmptyLineEndExitOwned` returns when the compiled `behavior.ownsExit` is true, and the pointer comment above it goes away. Proof: `packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx` (refusal and "cannot strand" cases) and `packages/platejs/src/lib/plugins/override/OverridePlugin.spec.tsx` pass unchanged. Done: `docs/plans/artifacts/2026-10-14-exit-owner/final/run/platejs-core-a1.log` passes both specs, and `resolvePlugins.spec.tsx`'s "cannot strand" case fails under m3 in `docs/plans/artifacts/2026-10-14-exit-owner/final/run/m3-compile-declared-platejs-a1.log`.
- [x] 4. Teaching. Through `best-api repair`: the exit bullet in `docs/vision/plite.md` says the compiled fact covers voids and objects while the contract and fingerprint carry only a text block's declaration; the `ownsExit` line in `.changeset/plite-break-exit.md` says the read reports ownership, always true for a void or an object; the `EditorElementBehavior.ownsExit` item in `docs/plans/topics/basic.md` Open work closes. `node tooling/scripts/teaching-sweep.mjs ownsExit` finds no other live hit that says the read is false for voids and objects (`docs/plans/artifacts/2026-10-14-exit-owner/sweep-ownsExit-a1.log`); `content/docs` teaches only declaring the flag and needs no edit. `apps/www/src/generated/api-reference-manifest.json` already lacks `ownsExit` at base. The existing API reference manifest item in `docs/plans/topics/basic.md` Open work covers regenerating it once its generator, which fails at base, runs again. Proof: the sweep rerun after the edits. Done: `docs/plans/artifacts/2026-10-14-exit-owner/build/sweep-ownsExit-a2.log` and `docs/plans/artifacts/2026-10-14-exit-owner/build/teach-hunks.diff`.
- [x] 5. Final proof on the final bytes runs in a detached worktree at the base plus `task-7b3ea248.patch`. There `docs/plans/artifacts/2026-10-14-exit-owner/apply-change.mjs` and `proto/add-tests-final.mjs` apply this plan's hunks by exact string, as they do in the shared tree, because a diff against the pre-edit copies would carry another session's rewritten context and fail to apply at base. The proof runs plitejs `test:partition:core`, platejs `test:partition:core` and `test:partition:callout`, `withPlite.slow.ts`, `pnpm --filter @platejs/cli test` (the generator writes and the migrator reads contracts; `docs/plans/artifacts/2026-10-14-exit-owner/blast-radius.md`), `pnpm --filter plitejs typecheck`, platejs `typecheck:partition:core` and `typecheck:partition:callout` (the package typecheck stops at `migrations`, red at base), and `pnpm lint:task` on the task's files. Proof: attempt-indexed logs in the run directory. Done: `docs/plans/artifacts/2026-10-14-exit-owner/final/final-proof-a1.log`, with each command's log in `docs/plans/artifacts/2026-10-14-exit-owner/final/run/`; `pnpm lint:task` in `docs/plans/artifacts/2026-10-14-exit-owner/build/lint-task-a1.log`.

## Completion Gates

Execution authority: the brief from the session that ran `task_7b3ea248`, which names the owner choice, both callers and the proof, and the plan panel's rounds. Packet: `packages/plitejs/src/core/schema-compiler.ts`, `packages/plitejs/src/editor/exit-break.ts`, `packages/plitejs/src/interfaces/editor.ts`, `packages/plitejs/src/interfaces/schema.ts`, `packages/plitejs/test/schema-compiler.test.ts`, `packages/plitejs/test/schema-contract-generation.test.ts`, `packages/platejs/src/internal/plugin/resolvePlugins.ts`, `docs/vision/plite.md`, `.changeset/plite-break-exit.md` and `docs/plans/topics/basic.md`.

| Gate | Artifact |
| --- | --- |
| `pstack:blast-radius` on the public API change before code moves | `docs/plans/artifacts/2026-10-14-exit-owner/blast-radius.md` |
| Each planned guard reproduced through its public entry before the build | Both guards already hold at base, so the build keeps them rather than adding them: `readEditorSchemaContract` refuses a forged `ownsExit` and accepts an explicit `ownsExit: undefined` (`docs/plans/artifacts/2026-10-14-exit-owner/base-tests-control-a4.log`), and the compiler and Plate's exit-rule check refuse their cases (`docs/plans/artifacts/2026-10-14-exit-owner/base-control-a1.log`) |
| `api-build` panel on the build's diff | `docs/plans/artifacts/2026-10-14-exit-owner/panel-diff-1/`: all three seats answered on frozen commit `433ab9dd9e`; two warnings and two nits applied, one nit dismissed as a named limit (decision log) |
| Code quality review per slice | skip: the `api-build` panel owes a panel on the diff, and every seat applies a code-quality lens |
| The slice frozen with `freeze.mjs` after its review fixes | `docs/plans/artifacts/2026-10-14-exit-owner/final/freeze-a1.log`: commit `4c5f3f7892` |
| `pnpm check` steps the edits reach, before the final acceptance run | `plite-bridge` passes (`docs/plans/artifacts/2026-10-14-exit-owner/build/check-plite-bridge-a1.log`). `knowledge`, `lint-baseline` and `review-ledger` fail in the shared tree on files this task never wrote (`docs/plans/artifacts/2026-10-14-exit-owner/build/check-knowledge-a1.log`, `docs/plans/artifacts/2026-10-14-exit-owner/build/check-lint-baseline-a1.log`, `docs/plans/artifacts/2026-10-14-exit-owner/build/check-review-ledger-a1.log`). `lint:task`, the oxlint gate and step 5 cover `lint`, `lint-type-aware`, `cli-test` and the touched test and typecheck partitions |
| Hard-cut sweep | skip: nothing is removed; one unreleased read changes meaning, swept by `best-api repair` |
| `best-api repair` on the changed public API | `docs/plans/artifacts/2026-10-14-exit-owner/build/sweep-ownsExit-a2.log` and `docs/plans/artifacts/2026-10-14-exit-owner/build/forward-test-a1.log`; Vision, changeset and subject-file edits in `docs/plans/artifacts/2026-10-14-exit-owner/build/teach-hunks.diff` |
| `plate-docs` on every docs page the change affects | `docs/plans/artifacts/2026-10-14-exit-owner/build/plate-docs-check.md`: no page needs a change |
| Hand drive | skip: no browser-visible change; `exitBreak` gives the same answer for every element kind (step 2) |
| Scale contracts through `benchmark` | skip: no per-keystroke or per-document work grows (Proof) |
| `oxlint --type-aware` file count before the diff panel freezes | `docs/plans/artifacts/2026-10-14-exit-owner/build/oxlint-type-aware-a2.log`: 0 findings on the 7 files passed |
| Writing passes: `deslop`, `no-comments`, `unslop` | Two `writing` rows in the decision log, one for the build and one for the diff panel's fixes |
| Changeset per `changeset` | `docs/plans/artifacts/2026-10-14-exit-owner/build/changeset-status-a1.log`; the unreleased plitejs line is amended, and Plate needs none |
| `pnpm lint:task` on the task's paths | `docs/plans/artifacts/2026-10-14-exit-owner/build/lint-task-a1.log`: exit 0 on the seven code and test files |

## Proof

The base control at `e544d29448` plus `task-7b3ea248.patch` passes every named suite (`docs/plans/artifacts/2026-10-14-exit-owner/base-control-a1.log`), and its typecheck control fails only the platejs `migrations` partition (`docs/plans/artifacts/2026-10-14-exit-owner/base-typecheck-a1.log`). The design with the plan panel's fixes from all three rounds runs in the prototype worktree with its probes, suites, the CLI tests, the plitejs typecheck and eight mutants (`docs/plans/artifacts/2026-10-14-exit-owner/proto/r3/`, built by `proto/verify-r3.sh`). The platejs package typecheck there stops at `migrations`, red at base, so its core and callout partitions first run in step 5. This run replaces the earlier runs in `proto/synth2/`, `proto/r1/`, `proto/r1b/` and `proto/r2/`. Step 5 then reran it on the built bytes with the fifth case and a ninth mutant (`docs/plans/artifacts/2026-10-14-exit-owner/final/final-proof-a1.log`). At base, the restore case fails only on the restored values, and the fingerprint pin, the forged-contract case and the explicit-undefined case pass (`docs/plans/artifacts/2026-10-14-exit-owner/base-tests-control-a4.log`). The forged-contract probe rejects both forged contracts at base (`docs/plans/artifacts/2026-10-14-exit-owner/panel-plan-1/forged-base-a1.log`), and the non-boolean probe prints the stored values and fingerprints that the r3 run must match (`docs/plans/artifacts/2026-10-14-exit-owner/panel-plan-3/nonboolean-base-a1.log`).

The Benchmark gate does not apply. The compile adds one OR per element once per schema compile, and `exitBreak` reads one field where it read three, so no per-keystroke or per-document work grows (source read of `schema-compiler.ts` and `exit-break.ts`). Document shape and Native behavior sections do not apply: no stored node, contract byte, selection, IME, clipboard, undo or focus behavior changes.

## Close

Reversals and deviations come first.

- The lead dropped the arena's restore graft on the false claim that base never runs the compile that restore checks a contract against. Plan panel round 1 corrected it, and the build adopts the graft (decision log, row "corrected").
- Round 2 rebuilt the stored form around a boolean, which turned an untyped `ownsExit: 'yes'` into `true` and moved that schema's fingerprint. Round 3 went back to round 1's body. After the diff panel, a fifth test case and mutant m9 pin that behavior.
- The build wrote outside the brief's list because a public read changed meaning (Defaults, "brief writes only"). It edited the `ownsExit` JSDoc in `packages/plitejs/src/interfaces/editor.ts` and `packages/plitejs/src/interfaces/schema.ts`, the two plitejs test files, `docs/vision/plite.md`, `.changeset/plite-break-exit.md` and `docs/plans/topics/basic.md`. It did not touch `content/docs` or `packages/platejs/src/features`.
- The mutants ran inside step 5's worktree instead of through `.agents/pstack/mutate.mjs`, whose linked `node_modules` would have loaded the shared tree's `plitejs`.
- `pnpm lint:task` rewrapped two expressions of another session's uncommitted code in `schema-compiler.ts`, at lines 3749 and 6585. Neither changes behavior.
- The restore hunk reads `compiled`, which the shared tree binds only through another session's uncommitted rewrite of `restoreEditorSchemaContract`. `apply-change.mjs` adds the same binding at base, and step 5 proves the hunks there. If that rewrite is dropped before the commit, its `const compiled` line must stay.
- The build did not wait for the commit of `task_7b3ea248`'s exit-rule check. It builds on that check as it sits in the working tree (Defaults, "wait commit").

What landed, uncommitted on `next`:

- The schema compiler sets the compiled `behavior.ownsExit` to the full answer. One private rule, `ownsExitByKind`, makes every void and object own its exit, and a text block owns it when it declares it. The same rule refuses a declaration on a void or an object.
- The contract writer and the compiled fingerprint store only the declaration, through `declaredContractBehavior`, so saved schemas keep their bytes. `readEditorSchemaContract` hashes a received contract with base's code, and restore takes each element's behavior from the compile it already runs.
- `exitBreak` and Plate's `assertEmptyLineEndExitOwned` both read the compiled field, and the pointer comment is gone. The brief offered a `plitejs/internal` helper or a public read. Boundary Law picked the public field the compiler already exposes, so nothing new is exported (Decisions).
- Five new test cases pin the fingerprint of a schema with a void and an object, restore of both, refusal of a forged contract, an explicit `ownsExit: undefined`, and untyped declarations.
- The Vision exit bullet, the unreleased changeset line and `docs/plans/topics/basic.md` teach the new meaning.

The proof ran in a fresh worktree at `e544d29448` plus `task-7b3ea248.patch` plus this plan's hunks (`docs/plans/artifacts/2026-10-14-exit-owner/final/final-proof-a1.log`). The non-boolean probe prints base's stored values and fingerprints. The forged-contract probe rejects both forged contracts, and the Media fingerprint is `fnv1a64:2cef62983b4aa32c`, as at base. The plitejs core partition passes 1973 cases, platejs core 603, callout 3, `withPlite.slow.ts` 49 and the CLI 90. The plitejs typecheck and the platejs core and callout partition typechecks exit 0. All nine mutants fail at least one case, and m2, m6, m8 and m9 each fail only the case written for them.

The proof has limits. The platejs package typecheck stops at `migrations`, which is red at base, so only its core and callout partitions ran. Full `pnpm check` did not run. Its `knowledge`, `lint-baseline` and `review-ledger` steps fail in the shared tree on files this task never wrote, and `plite-bridge` passes. Of its other steps, `typecheck`, `test`, `test-slow`, `plite-test`, `public-types`, `core-audits` and `www` ran only through the partitions above. Acceptance ran in the worktree, so other sessions' uncommitted edits cannot change what it proves. The shared tree's own core partitions also pass, 1971 plitejs cases and 597 platejs cases (`docs/plans/artifacts/2026-10-14-exit-owner/build/shared-plitejs-core-a1.log`, `docs/plans/artifacts/2026-10-14-exit-owner/build/shared-platejs-core-a1.log`); the counts differ from the worktree's because those edits add and remove cases. No browser drive ran, because `exitBreak` gives the same answer for every element kind.

All 5 steps are done. Of 15 gates, 11 are done and 4 are skipped with a reason (code quality per slice, hard-cut sweep, hand drive and scale contracts); none is partial, blocked or open. `architect` ran three runners and a blind judge, the plan panel ran three rounds and the diff panel one. The plan rounds raised three criticals, and the lead applied all three. The diff round raised two warnings and three nits. The lead applied both warnings and two nits, and dismissed one nit because Named limits already names it. No decision-trail review ran, because no critical was dismissed, narrowed or left open and the run changed no shared script or check.

Open work, each item tracked in `docs/plans/topics/basic.md` Open work:

- The API reference manifest lacks `ownsExit`. owner: zbeyens. stop: the `SchemaRoot` decision lands and `pnpm --filter www api-reference` regenerates the manifest.
- Restore takes behavior from the compile but rebuilds every other field from the contract. owner: zbeyens. stop: another session's uncommitted rewrite of `restoreEditorSchemaContract` lands, then a plan for restore from the compile.
- The compiler does not check that behavior flags are booleans. owner: zbeyens. stop: the next schema-compiler review.
- The commit itself. owner: zbeyens. stop: the owner commits `next`.
