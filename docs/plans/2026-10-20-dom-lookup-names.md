---
review_scopes: [dom-lookup-names]
verdict: pursue
review_basis: []
work_kind: implementation
review_commit: a28e4eecbe75238a877d013930570d749a582fa0
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/development/enforcement.md, docs/plans/2026-10-18-plite-dom-error-gaps.md, docs/research/sources/plite/large-documents.md, packages/plitejs/src/dom/plugin/dom-coverage.ts, packages/plitejs/src/dom/plugin/dom-editor.ts, packages/plitejs/src/dom/plugin/dom-root-runtime.ts, packages/plitejs/src/react/editable/dom-coverage-selection.ts, packages/plitejs/src/react/plugin/react-editor.ts, packages/plitejs/src/dom/index.ts, packages/plitejs/src/dom/internal/index.ts, packages/plitejs/test/dom/dom-coverage.ts, packages/plitejs/test/react/dom-coverage-boundary-contract.tsx, packages/plitejs/test/dom/public-surface-contract.ts, packages/platejs/src/react/features/table/TablePlugin.tsx, tooling/oxlint/plate-plugin.mjs, tooling/oxlint/plate-plugin.test.mjs, content/docs/api/dom.mdx, content/docs/plite/libraries/plite-dom.mdx, content/docs/plite/libraries/plite-react/react-editor.mdx, content/docs/plite/libraries/plite-react/dom-coverage-boundaries.mdx, content/docs/plite/migration.mdx, .changeset/plite-dom-lookup-errors.md]
review_upstreams: ['../slate@945a484df2497e4c448b33f417b0de2a49840032', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../codemirror-view@fbff59ba004d80d8c914f64c42586387b08706ac']
---

# DOM lookups: rename the strict root lookup and delete the coverage pair

Status: executed; open work waits on t_bd61f59e, t_78091f8f and the 09-03 plan's next iteration
Playbook: plan

**Pursue.** Rename `findDocumentOrShadowRoot` to `assertDocumentOrShadowRoot` on `DOMEditor`, `ReactEditor` and `editor.api.dom`, so the root lookup that throws carries the `assert` name every other strict DOM lookup carries. Delete `resolveDOMPointOrBoundary`, `resolveDOMRangeOrBoundary` and their two result types from DOM coverage sessions. Vision's strict-lookup rule gives strict lookups a job, for a direct caller that knows the DOM is mounted, and names this one (`docs/vision/plite.md:852-855`). Deleting it would change that rule, which needs the owner (`.agents/playbooks/verdict.md:61`). Its throw is the one `assertDOMNode(editor)` throws, because both fail when the editable is missing (`dom-editor.ts:1399-1407`, `:1925-1935`). The rename keeps the rule and the error and changes only the name. The coverage pair answers with DOM or with the boundary that hides it, never both. On a public session it is a boundary read, then `DOMEditor.resolveDOMPoint` or `resolveDOMRange`, which call the same resolver with no root. The app-facing `editor.api.dom.resolveDOMPoint` and `resolveDOMRange` also return `null` whenever the page's text differs from the editor's, and they need the `dom()` plugin, which Plite React's `createEditor` installs. The selection export is Plite's one consumer of both answers. It reveals hidden parts between the two reads, so the union cannot serve it. Saved documents and runtime behavior do not change. No release carried these Plite lookups. The Build playbook executes this plan.

## Brief

### What will change?

The root lookup that throws now starts with assert, like the others, and the two coverage lookups that only tests called are gone. Tests, typechecks, docs checks and a hand drive passed; no app calls these lookups.

### What could go wrong?

Code calling the old names stops compiling and needs a one-line change. Apps now get the DOM from a lookup that finds nothing while the page shows other text than the editor, where the old call answered anyway.

## Teach

Plite finds the DOM for editor content in two ways. A strict lookup throws when the DOM is missing, for app code that knows the editor is mounted. A soft lookup returns nothing, for code that may run while the editor is unmounted. Strict lookups start with assert, and soft ones start with resolve.

The root lookup breaks that pattern, because its strict form starts with find. A coverage session tracks the parts of a long document that are not drawn. Its two lookups answer with either a DOM position or the hidden part covering it, and only tests call them.

After this change, the strict root lookup starts with assert like the rest. The two coverage lookups are gone. For a position, apps ask the session for the hidden part, then ask the editor for the DOM.

## Public API

The strict root lookup takes the `assert` name.

```ts before
// tooling/oxlint/plate-plugin.test.mjs:565
const root = editor.api.dom.findDocumentOrShadowRoot();
```

```ts after
// tooling/oxlint/plate-plugin.test.mjs:565
const root = editor.api.dom.assertDocumentOrShadowRoot();
```

A point lookup becomes two questions: which boundary hides the point, then where its DOM is.

```ts before
// packages/plitejs/test/dom/dom-coverage.ts:1213
testView(editor).domCoverage.resolveDOMPointOrBoundary(hiddenPoint)
```

```ts after
// packages/plitejs/test/dom/dom-coverage.ts:1183
testView(editor).domCoverage.getBoundaryForPoint(hiddenPoint)
```

A range lookup becomes the same two questions for a range.

```ts before
// packages/plitejs/test/dom/dom-coverage.ts:438
testView(editor).domCoverage.resolveDOMRangeOrBoundary(range)
```

```ts after
// packages/plitejs/test/dom/dom-coverage.ts:412
testView(editor).domCoverage.getBoundariesForRange(range)
```

## What other editors do

The subject's comparison stands. Only Plite's row changes.

| Delta | Editor | Root lookup | Missing root | DOM for an undrawn position |
| --- | --- | --- | --- | --- |
| changed | Plite today | `resolveDocumentOrShadowRoot` and strict `assertDocumentOrShadowRoot` | `null`, or a throw | `resolveDOMPoint` returns `null`; `getBoundaryForPoint` names the hiding boundary |

## Hard cuts and app migration

The change renames:

- `findDocumentOrShadowRoot` to `assertDocumentOrShadowRoot` in `DOMApi`, `DOMEditorInterface`, the `DOMEditor` implementation and the `editor.api.dom` capability, which also renames it on `ReactEditor`, an alias of `DOMEditor` (`packages/plitejs/src/react/plugin/react-editor.ts:22`). Its error stays the one `assertDOMNode(editor)` throws.
- Its entry in `plate/no-strict-dom-lookup`'s resolver map, its public-surface key and its lint test case.

It deletes:

- `resolveDOMPointOrBoundary` and `resolveDOMRangeOrBoundary` from every DOM coverage session, public and per-root.
- `DOMCoverageDOMPointResult` and `DOMCoverageDOMRangeResult`, and their exports from `plitejs/dom` and its internal entry.
- The tests that only exercise the deleted calls.

No release carried these Plite lookups. The published 54 beta of `platejs` (`54.0.0-beta.1`) had a different, soft `editor.api.findDocumentOrShadowRoot()` in `@platejs/slate`, which catches Slate's throw and returns `undefined` (`packages/slate/src/internal/dom-editor/findDocumentOrShadowRoot.ts:5-8` at that tag). Plate v2 dropped that call before this plan. In this repository the change breaks only tests, the lint rule's own test and the API reference. An app that calls the strict root lookup renames one call:

```ts
// an app reading the root from a mounted view's editor, after the change
const editor = useEditorContext();
const root = editor.api.dom.assertDocumentOrShadowRoot();
```

These calls run on a mounted view's editor. `EditorRoot` gives each view its own editor (`packages/plitejs/src/react/components/plite.tsx:294-315`), and the DOM API of the editor `createEditor` returns sees none of those views. There the soft lookup returns `null` and the strict one throws, as probe c1 shows.

An app that called a coverage lookup asks two questions instead. `editor.api.dom` comes from the `dom()` plugin, which Plite React's `createEditor` installs (`packages/plitejs/src/react/plugin/with-react.ts:217`).

```ts
// an app resolving a possibly hidden point or range on the view's editor, after the cut
const boundary = coverage.getBoundaryForPoint(point);
const domPoint = boundary ? null : editor.api.dom.resolveDOMPoint(point);

const boundaries = coverage.getBoundariesForRange(range);
const domRange =
  boundaries.length > 0 ? null : editor.api.dom.resolveDOMRange(range);
```

The pair resolved DOM without checking that the page shows the editor's text. `editor.api.dom.resolveDOMPoint` and `resolveDOMRange` check it (`packages/plitejs/src/dom/plugin/dom-editor.ts:1222-1228`), so they return `null` whenever the page's text differs from the editor's, where the pair returned DOM anyway. That covers a page that lags the editor and also foreign DOM inside a text host. `packages/plitejs/test/react/dom-lookup-freshness-contract.test.tsx:1248-1277` prepends a foreign host, and there the unchecked resolver returns a correct point while the checked one returns `null`. A range whose endpoints are mounted still resolves when it crosses hidden content (`packages/plitejs/src/dom/plugin/dom-text-freshness.ts:324-343`), so the range form checks its boundaries first.

Copied registry components call none of these, so no registry item changes. `pnpm --filter www build:registry` still runs, because the docs registry embeds `content/docs/api/dom.mdx`.

## Main changes

- The per-root coverage session that `DOMRootRuntime` binds to its root element (`packages/plitejs/src/dom/plugin/dom-root-runtime.ts:283`) no longer offers a DOM lookup. Plite's runtime never called it. The two-Editable contract keeps its boundary and reverse-mapping checks and drops its DOM-point check, which tested only the deleted per-root lookup.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Strict root lookup | `findDocumentOrShadowRoot` on `DOMEditor`, `ReactEditor` and `editor.api.dom` throws when no view resolves | renamed `assertDocumentOrShadowRoot`, same behavior and error | `plitejs/dom` | Vision gives the strict family a job and names this lookup; every other member starts with `assert`, and its error is `assertDOMNode(editor)`'s because the same thing fails. | `dom.mdx`, `react-editor.mdx`, `migration.mdx`, `docs/vision/plite.md:852`, `enforcement.md:54`, the lint map and its test, the public-surface contract, the changeset | rename-and-typecheck in a proof copy, lint and public-surface tests, a root probe | code calling the old name stops compiling | rename |
| Coverage DOM-or-boundary lookups | `resolveDOMPointOrBoundary` and `resolveDOMRangeOrBoundary` with two result types | deleted; `getBoundaryForPoint` or `getBoundariesForRange`, then `editor.api.dom.resolveDOMPoint` or `resolveDOMRange` | `plitejs/dom` | On a public session each is a boundary read plus `DOMEditor.resolveDOMPoint` or `resolveDOMRange`; the app-facing resolvers add a painted-text check, and the selection export needs both answers with a reveal between them. | `plite-dom.mdx`, `large-documents.md`, the changeset, `dom-coverage.ts` and `dom-coverage-boundary-contract.tsx` tests | equivalence probe at base on every call the tests make, a migration probe on a public session, migrated tests at head | an app reading DOM through it gets `null` when the page's text differs; only internal sessions had a root | cut |

## Steps

One phase. A partial change would leave docs and the lint rule teaching a removed or renamed call, so it lands in one change. The Build playbook executes it.

- [x] 1. Controls at base. In a detached proof worktree at `a28e4eecbe`, run an equivalence probe that makes every coverage-pair call the tests make also compute the boundary read plus `DOMEditor.resolveDOMPoint` or `resolveDOMRange`, and plus `editor.api.dom.resolveDOMPoint` or `resolveDOMRange`. Then delete the three methods and two types and typecheck plitejs and platejs to list every compile caller. Run `pstack:blast-radius` on the three surfaces. Proof: the probe log shows each boundary and `null` answer equal to both replacements and names each DOM answer that needs a session root, and the spike log names only the files this plan lists. Result: all 11 calls ran on root-bound sessions. The 7 boundary and `null` answers matched, and the 4 DOM points, all in the two-Editable contract, matched neither replacement without a root. No call reached the DOM branch of a session without a root, so that branch rests on source and on step 2's migration probe. The plitejs typecheck failed only at `dom-coverage-boundary-contract.tsx:146`, platejs passed, and www, whose source has no hit, was not typechecked. Blast radius found two couplings, which step 3 takes.
- [x] 2. Delete the coverage pair, its two result types, their exports and the imports only the pair used (`dom-coverage.ts:20`, `:24-25`). Rewrite each test that reads a boundary through the pair to call `getBoundaryForPoint` or `getBoundariesForRange`; no test in `dom-coverage.ts` reads DOM through it. Delete `answers null for an uncovered point and range with no DOM` (`dom-coverage.ts:1383`), whose defect, a pair that throws, goes with the pair. Drop the two-Editable contract's DOM-point check (`dom-coverage-boundary-contract.tsx:144-152`), whose defect, a per-root session resolving DOM in the sibling root, goes with the per-root lookup. Proof: from `packages/plitejs`, `bun test --preload ../../config/plite-source-test-setup.ts ./test/dom/dom-coverage.test.ts` and `bun run test:react test/react/dom-coverage-boundary-contract.test.tsx` pass, and the plitejs typecheck passes. A run-only probe shows that a public session on one mounted view returns no boundary, that `editor.api.dom.resolveDOMPoint` equals `DOMEditor.resolveDOMPoint` and lands in the editable, and that a bare core editor's session answers boundary reads with no `editor.api.dom`. With `resolveDOMPointInRoot` made to ignore its root, the plitejs React and Bun suites name the tests that still catch it. Result: the lead ran `cut.mjs --coverage --rename-root` on the worktree, whose diff equals proof copy c1's apart from one import the lint fix joined onto a line. The coverage and surface tests (46), the boundary contract (19) and the plitejs typecheck pass on the worktree. The migration probe passed in proof copy c1, and with the resolver ignoring its root only `plite-element-node-ref.test.tsx` failed, in proof copy b1. On a diff panel round 1 finding, the build then deleted the migrated `resolves a nested hidden child point to a boundary instead of a DOM point`, which repeated `uses parent-hidden policy before nested child policy regardless of registration order` once the pair was gone. The coverage file passes 29 of 29 after it.
- [x] 3. Rename the strict root lookup in `DOMApi`, `DOMEditorInterface`, the implementation and the capability, and its `####` entry in `content/docs/api/dom.mdx`, because the public-surface contract compares that file's headings with the capability's keys (`public-surface-contract.ts:344-352`). Rename its key in that contract, its lint-map entry and its lint test case. Make the soft lookup's JSDoc say it returns `null` when this editor has no mounted view, or when several are mounted and none has focus. The JSDoc does not name Plite, because `platejs` bundles these declarations and its build refuses that word. Proof: `node --test tooling/oxlint/plate-plugin.test.mjs`, the public-surface contract, the plitejs and platejs typechecks and `pnpm --filter platejs build` pass. A run-only probe shows that on a view's editor the soft lookup returns the document with one view, `null` with two views in two shadow roots and neither focused, and each view's shadow root once that view has focus. On the editor `createEditor` returns, it returns `null` and the strict lookup throws while one view is mounted. Result: the lint test (124), the public-surface contract and both typechecks pass on the worktree. Both package builds and the root probe's three cases passed in proof copy c1.
- [x] 4. Docs. Run `plate-docs` on `content/docs/api/dom.mdx` and `content/docs/plite/libraries/plite-react/react-editor.mdx`, which rename the strict entry and give the soft one the several-views case, on `content/docs/plite/libraries/plite-dom.mdx`, which drops the result type, teaches the boundary reads before the DOM read, names the `dom()` plugin, and shows the range form that checks boundaries first because a range with mounted endpoints can cross hidden content, and on `content/docs/plite/migration.mdx` step 8, which gains Slate's `ReactEditor.findDocumentOrShadowRoot(editor)` and its soft replacement. Check that `dom-coverage-boundaries.mdx` teaches neither coverage lookup. Then run `pnpm --filter www build:registry`. Proof: `pnpm --filter www check:docs`, `pnpm --filter www build:registry --check` and a `git grep` that finds no old name in the generated docs registry. Result: `plate-docs` found each page teaching only the current API, with the base editor's DOM calls left to Open work. `check:docs` passed in proof copy c1 on the same docs bytes, `build:registry --check` passes on the worktree, and the sweep finds no old name in generated output. The hand drive covered all four pages.
- [x] 5. Law and release notes. Run `best-api repair`. In `docs/vision/plite.md:852`, drop "and `findDocumentOrShadowRoot`" from the strict-lookup sentence, because the renamed lookup is an `assert*` lookup; the rule stays. Update `docs/development/enforcement.md:54`, and rewrite `docs/research/sources/plite/large-documents.md:9` through `research`, so it names a session's boundary reads and the exact lookups instead of the private runtime session's pair. Amend `.changeset/plite-dom-lookup-errors.md` with the `changeset` skill. The published `plitejs@0.0.1` holds only a README, a license and `package.json`, so the note describes the final API with no removal prose: its soft root lookup line also names the strict `assertDocumentOrShadowRoot()`, and its line about the coverage pair goes. Proof: `node tooling/scripts/teaching-sweep.mjs findDocumentOrShadowRoot resolveDOMPointOrBoundary resolveDOMRangeOrBoundary DOMCoverageDOMPointResult DOMCoverageDOMRangeResult` lists as live only Slate's example in `migration.mdx`, this plan, the subject file, the scope question in `docs/research/review-scopes/dom-lookup-names.json` and the snippet Open work flags, and the Close explains any other. After the subject file folds the plan, the same sweep and a line-by-line read show the subject naming the five only in its history, its question and Slate's example, because `check-removed-api-teaching.mjs` reads a manifest that covers only `platejs`. `node tooling/scripts/review-ledger.mjs check docs/plans/2026-10-20-dom-lookup-names.md` passes. Result: `best-api repair`, `research` maintain and `changeset` made the step's edits, and after diff panel round 1 the build corrected the changeset's soft root wording. On the folded tree the sweep lists as live only Slate's example in `migration.mdx`, this plan, the scope question, the 09-03 snippet and the subject file. A line-by-line read finds the subject naming the old names only in its opening question, Slate's row and the Open work item about that snippet. `review-ledger.mjs check` passes.
- [x] 6. Land through `node .agents/pstack/land.mjs --check 'pnpm check --affected'`, after the writing passes and the panel on the diff. Proof: the land log's check exits 0 and the push names its commit. Result: `land.mjs` squashed the task into one commit on `origin/next`, and the suggested-task ledger's `landed` row names it.

## Completion gates

| Gate | Applies | Proof |
| --- | --- | --- |
| `pstack:blast-radius` before code moved | yes, the plan changes a public API | its log row from planning |
| Package tests, lint test, typechecks and package builds | yes | log rows for proof copy c1 and worktree w1 |
| `plate-docs` with its coverage audit, `check:docs`, `build:registry` and its check | yes | step 4 and log rows for proof copy c1 and worktree w1 |
| `best-api repair` and the teaching sweep | yes | step 5 and the repair log row |
| Changeset | yes, `plitejs` changes | step 5 |
| Benchmark | no: the rename keeps the function and the cut removes two methods no runtime path calls, per Callers | the benchmark log row |
| Hand drive | yes, four docs pages change | the hand drive log row, and the final-bytes row after diff panel round 1 |
| Playtest | no: `playtest.mjs scope` names no catalog for these files | the hand drive log row |
| `pstack:thermos` | skip: reviews rows `api-build` and `push` owe a panel on the diff | none |
| Typed oxlint before the panel | yes | worktree w1 log row |
| Writing passes | yes | the two `writing` log rows, for the build and for diff panel round 1 |
| Panel on the diff | yes, reviews rows `api-build` and `push` | round 1's `seats` and `warning` log rows; no critical finding, so no round 2 |
| `land.mjs --check 'pnpm check --affected'` | yes | done: one squashed commit on `origin/next` |
| `review-ledger.mjs check` | yes | passes on the folded plan |
| Chips sweep | skip: a suggested task's session runs no sweep, as `AGENTS.md`'s Suggested tasks rule says; this run offered one task and folded one finding | the ledger rows for t_78091f8f and t_bd61f59e |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Strict root lookup | Rename it so it matches the other strict lookups (look) | Delete it, which changes a Vision rule and needs you; keep the old name | delete root | big |
| Coverage lookups | Delete both; ask for the hidden part and the DOM separately (look) | Keep them; rename them | keep coverage | big |
| DOM replacement | Point apps at the editor's DOM lookups, which find nothing when the page shows other text | Point them at the lookups that skip that check | exact resolver | small |
| Root error | Keep the error the node lookup throws, since the same thing fails | A new error that names the root | root message | detail |
| Soft root docs | Say it finds nothing when this editor has no open view, or when several are open and none has focus | Leave the docs saying only "not mounted" | keep root docs | detail |
| Base editor's DOM calls | Name the view's editor in this plan and leave the DOM API page's example for its own task | Name the view's editor in each root docs entry now | name view editor | detail |
| Two-editor test | Drop its DOM check, which only tested the deleted lookup | Keep a root check through Plite's internal lookup | root check | detail |
| Release note | Fix the unreleased note in place, with no removal lines, since no release had these calls | Add a second note that undoes the first | second note | detail |
| Build | Build after the plan review | Stop once the plan is written | stop at plan | detail |
| Who applies the cut | Run the proven cut script myself, since its output matched the proof copy byte for byte | Hand it to a code helper | delegate build | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

Prior work. `node tooling/scripts/review-ledger.mjs lookup dom-lookup-names` reports the scope unreviewed, with no head, plan, execution or candidate, and the related scopes `editor-public-naming` and `selection`. A search of `docs/plans` for the five names finds the [Plite DOM error gaps](2026-10-18-plite-dom-error-gaps.md) plan, which landed the current state. It added `resolveDocumentOrShadowRoot`, moved every runtime caller to it, made the coverage pair answer `null`, and added `plate/no-strict-dom-lookup`. Its Defaults row kept both coverage names, and its scope and open work sent the naming question here. This review retains that plan's soft root lookup, its lint rule and the `null` answers of the public resolvers. It supersedes the row that kept the coverage pair. The upstream editors were read as source at the commits in `review_upstreams`, and nothing was run.

### Architect

Three runners answered the architect brief at xhigh: Opus, gpt-6-astra and gpt-6.1-sol. All three cut the coverage pair and its types. All three also found two of the lead's premises false. The app-facing resolvers check painted text while the pair does not, and Plate's 54 beta shipped a soft root lookup of the same name. They split on the strict root lookup. Opus deleted it, and astra and sol renamed it to `assertDocumentOrShadowRoot`, because Vision's strict-lookup rule names it. The blind cross-judge, Opus at xhigh, picked sol's rename as the base, 22 points to Opus's 21. It refuted one of Opus's reasons. The `assert*` lookups also fail on a mounted editor with two unfocused views (`dom-editor.ts:1056-1058`, `dom-node-path.ts:75-81`), so focus does not set the root lookup apart. The lead first kept delete on other reasons and sent it to the plan panel.

### Plan panel

Round 1 seated Opus, gpt-6-astra and gpt-6.1-sol at xhigh. All three found that deleting the strict root lookup changes the rule at `docs/vision/plite.md:852-855`, which gives strict lookups a job and names this one, and the Verdict playbook asks the owner before such a change. Opus also showed the delete's two premises false. `assertDOMNode(editor)` is the strict form of `editable` (`dom-editor.ts:1895-1896`, `:1925-1935`), as the lint rule's own message says (`tooling/oxlint/plate-plugin.mjs:1144-1145`). The root lookup throws the node lookup's error because the same thing fails, and `getWindow` is strict with no soft twin, so the Vision sentence the plan would have added was false. astra and sol recommended the rename, as two architect runners and the judge had. The plan now renames, which keeps the rule and its error, and keeps the coverage cut, which no seat contested. It also takes the seats' warnings and nits, which the decision log lists.

Round 2 seated the same three at xhigh. All three found the rename keeps the rule and its error, and found round 1's findings fixed. None raised a critical finding. Opus found that the editor `createEditor` returns sees no view `EditorRoot` mounts, so the soft root lookup returns `null` on it. astra found that a range with mounted endpoints can cross hidden content and still resolve. astra and sol found that `check-removed-api-teaching.mjs` covers only `platejs`, so it cannot prove this cleanup. The plan takes each of these and Opus's nits, as the decision log lists.

### Diff panel

Round 1 seated Opus, gpt-6-astra and gpt-6.1-sol at xhigh on the build's diff, and all three answered. Astra and Sol found nothing. Opus raised no critical finding, so no second round ran. It found that the soft root lookup's new wording was false on the editor `createEditor` returns, which has no view of its own while `EditorRoot` mounts one, so the docs, JSDoc and changeset now say "this editor has no mounted view, or several are mounted and none has focus" (`dom-root-runtime.ts:141-191`). It also found a migrated test that repeated another, stale line numbers in the research page and a lint case's comment that named the old call. The build deleted the test and the comment and fixed the line numbers.

### Requirements

- Each `assert*` DOM lookup throws while DOM is missing and has a `resolve*` twin that returns `null`. Runtime and package code call the twin, and a lint rule bans the strict forms there ([plite.md](../vision/plite.md) line 852). The rename brings the root lookup under the `assert*` name and changes no rule.
- A public API offers one way to do each common operation, and a cut justified only by "no production caller" first checks whether Vision names a job for it ([common.md](../vision/common.md)). Vision names the strict job for direct callers that know the DOM is mounted, so the root keeps a strict form. No such job covers the coverage pair.
- Exact DOM lookups stay exact over virtualized content. `resolveDOMPoint` and `resolveDOMRange` return `null` for a position with no mounted DOM, and a coverage session names the boundary that covers it (`large-documents.md` line 9, `dom-coverage.ts:587`, `:626`).
- Selection export reads the boundaries a range crosses, reveals each one whose policy says so, then projects DOM (`dom-coverage-selection.ts:170-205`).
- Next is a redesign that takes hard cuts over compatibility ([VISION.md](../../VISION.md)).

### Callers

`git grep -w` over the checkout at `a28e4eecbe`, release notes and generated registry output aside:

- `findDocumentOrShadowRoot`: its own implementation and capability forwarder in `dom-editor.ts`, the lint map at `tooling/oxlint/plate-plugin.mjs:1143`, its invalid case at `tooling/oxlint/plate-plugin.test.mjs:565`, the key at `packages/plitejs/test/dom/public-surface-contract.ts:307`, `content/docs/api/dom.mdx:230`, `react-editor.mdx:205`, `docs/vision/plite.md:852` and `docs/development/enforcement.md:54`. `resolveDocumentOrShadowRoot` has 23 runtime callers and Plate's table plugin.
- The coverage pair: seven calls in `packages/plitejs/test/dom/dom-coverage.ts` and one in `packages/plitejs/test/react/dom-coverage-boundary-contract.tsx:146`, plus `docs/research/sources/plite/large-documents.md:9` and a snippet in the open External text view substrate plan (`docs/plans/2026-09-03-editable-island-substrate-closure.md:353`). The two result types are exported from `packages/plitejs/src/dom/index.ts:9-10` and `dom/internal/index.ts:18-19`, and `content/docs/plite/libraries/plite-dom.mdx:191` lists one.
- No app, example, copied registry component or Plate package calls any of the three. The strict `assert*` family has no such caller either, so the caller count alone does not separate the root lookup from it.

### Lanes

1. **Keep everything. Loses.** The strict root lookup keeps a name outside the strict family, and coverage sessions keep a union no consumer reads, whose shape cannot serve the one consumer of both answers.
2. **Rename the strict root lookup to `assertDocumentOrShadowRoot`. Wins for the root.** It keeps the job Vision names and its error, which matches `assertDOMNode(editor)` because the same thing fails. Two architect runners, the judge and two plan-panel seats picked it.
3. **Delete the strict root lookup. Loses.** No caller uses it, but no caller uses any `assert*` lookup either. Deleting it removes a job Vision names, which needs the owner (`.agents/playbooks/verdict.md:61`). The premises that set it apart were false. `editable` has a strict form through `assertDOMNode(editor)`, and the root lookup throws the node lookup's error because the same thing fails.
4. **The rule is wrong: delete every strict DOM lookup. Not pursued here.** No app or package calls the `assert*` family either, but Vision names its job, and its errors name the failing target. Changing that rule binds every Plite scope, so it needs the owner and its own review.
5. **Delete the coverage pair. Wins for coverage.** Predicted benefit: two public methods and two public types go, each job keeps one path, and no runtime work changes because no runtime code called them. Step 1's probe and step 2's migration probe mark the redundancy held or falsified, and the Close records it.
6. **Make the coverage pair the selection export's path. Loses.** The export reveals boundaries between the boundary read and the DOM read (`dom-coverage-selection.ts:170-205`), so one call that answers before the reveal cannot serve it.
7. **Rename the coverage pair. Loses.** The pair can disappear, because a boundary read plus the editor's DOM lookup does its job.

### Dependents

- None. `lookup dom-lookup-names` lists no dependent scope and no unowned importer, and the caller census above finds no consumer outside Plite's own tests, the lint rule, docs and one open plan's snippet.

### Proof limits

- Step 1's probe covers the 11 pair calls the tests make, all on root-bound sessions. Step 2's migration probe runs a public session's DOM branch on one fixture, and the pair's equivalence there rests on source (`dom-coverage.ts:547-555`, `:765-769`, `dom-editor.ts:1938`).
- The strict root lookup calls the soft one and throws on `null` (`dom-editor.ts:1399-1408`); that was read from source, not run.
- Probe c1 shows the soft root lookup returns `null` on the editor `createEditor` returns while `EditorRoot` mounts one view. Other `editor.api.dom` calls on that editor were not run.
- The several-views wording comes from source (`dom-root-runtime.ts:158-178`, `:690-698`). The root probe ran only the focus cases, not a pointer press in one view while another keeps focus.
- The rename keeps the function, and the cut removes two methods no runtime path calls, per the census above, so no runtime work changes. The build records the benchmark gate through `benchmark`.
- `findKey` and `getWindow` are strict with no public soft twin; they are outside this scope's question and stay.

## Close

Deviations come first.

- The build deleted one more test than step 2 planned. Diff panel round 1 found that `resolves a nested hidden child point to a boundary instead of a DOM point` repeated the parent-hidden policy test once the pair was gone, so the coverage file now holds 29 tests.
- The soft root lookup's wording changed after the build. "When the editor cannot tell which mounted view is active" was false on the editor `createEditor` returns, so the docs, both JSDoc blocks and the changeset now say "this editor has no mounted view, or several are mounted and none has focus".
- comment-sicko deleted the lint case's provenance comment, which named the commits that wrote the old call, instead of rewording it as the panel suggested. Fifteen other cases in that file keep such comments.
- The chips sweep did not run, because a suggested task's session runs none. The run offered t_78091f8f and folded one finding into t_bd61f59e.

What landed is one commit on `origin/next`, which `land.mjs` squashed and rebased. `findDocumentOrShadowRoot` is now `assertDocumentOrShadowRoot` on `DOMEditor`, `ReactEditor` and `editor.api.dom`, with the same body and error. DOM coverage sessions no longer offer `resolveDOMPointOrBoundary` or `resolveDOMRangeOrBoundary`, and `plitejs/dom` no longer exports `DOMCoverageDOMPointResult` or `DOMCoverageDOMRangeResult`. The lint rule, the public-surface contract, four docs pages, the Vision strict-lookup sentence, the enforcement row, the large-documents research page and the unreleased changeset use the new names, and the subject file holds the folded state.

Proof, from each log row's scope:

- At base, step 1's equivalence probe matched all 7 boundary and `null` answers among the 11 pair calls the tests make, and showed the 4 DOM points needed a session root.
- Proof copy c1 ran the cut with the plan's wording: the coverage and surface tests, the boundary contract, the lint test, both typechecks and package builds, the root and migration probes, `check:docs`, `build:registry` and its check (`build/proof-c1.out`).
- Worktree w1 reran the package checks on the worktree's bytes after the lint fix, and its diff matched c1's apart from one import the lint fix joined (`build/worktree-w1.out`).
- After diff panel round 1, the coverage tests pass 29 of 29, the lint test passes, the registry is fresh, `lint:task` is clean on its 9 lintable files, and the hand drive covers all four docs pages, with each changed sentence read from the page (`panel-diff-r1/hand-drive-check-a2.log`).
- `land.mjs` ran `lint:task` and `pnpm check --affected` on the rebased commit before it pushed.

Proof limits lists where the proof stops. A public session's DOM branch ran on one fixture, the strict root lookup's throw was read from source, the several-views wording was probed only through focus, and no browser test calls these lookups.

The review read these inputs. The doctrine came from `VISION.md`, `docs/vision/common.md` and `docs/vision/plite.md`, whose strict-lookup sentence changed, and `docs/development/enforcement.md`, whose row changed. `docs/plans/2026-10-18-plite-dom-error-gaps.md` holds the state this plan started from. The build changed `docs/research/sources/plite/large-documents.md`, `packages/plitejs/src/dom/plugin/dom-coverage.ts`, `packages/plitejs/src/dom/plugin/dom-editor.ts`, `packages/plitejs/src/dom/index.ts`, `packages/plitejs/src/dom/internal/index.ts`, `packages/plitejs/test/dom/dom-coverage.ts`, `packages/plitejs/test/react/dom-coverage-boundary-contract.tsx`, `packages/plitejs/test/dom/public-surface-contract.ts`, `tooling/oxlint/plate-plugin.mjs`, `tooling/oxlint/plate-plugin.test.mjs`, `content/docs/api/dom.mdx`, `content/docs/plite/libraries/plite-dom.mdx`, `content/docs/plite/libraries/plite-react/react-editor.mdx`, `content/docs/plite/migration.mdx` and `.changeset/plite-dom-lookup-errors.md`. It left unchanged `packages/plitejs/src/dom/plugin/dom-root-runtime.ts`, which picks the active view, `packages/plitejs/src/react/editable/dom-coverage-selection.ts`, the one consumer of both coverage answers, `packages/plitejs/src/react/plugin/react-editor.ts`, whose `ReactEditor` alias took the rename, `packages/platejs/src/react/features/table/TablePlugin.tsx`, which already calls the soft root lookup, and `content/docs/plite/libraries/plite-react/dom-coverage-boundaries.mdx`, which teaches neither coverage lookup.

The request had one ask, to settle the scope's design question through the Verdict playbook and then plan any fix. It is done. The verdict is Pursue, and this plan was built and landed. No ask was skipped.

## Open work

- Same-named resolvers differ. `DOMEditor.resolveDOMPoint` and `resolveDOMRange` skip the painted-text check that `editor.api.dom.resolveDOMPoint` and `resolveDOMRange` run (`dom-editor.ts:1943`, `:1981`, `:2953-2954`). Owner: suggested task t_bd61f59e, which this question joined. Stop: that task lands or is dropped.
- Several views, none active. Every DOM lookup without a root then returns `null` and the `assert*` lookups throw, so an app with two views of one editor has no public way to resolve DOM in a chosen view (`dom-root-runtime.ts:141-191`). Owner: suggested task t_78091f8f. Stop: that task lands or is dropped.
- The base editor's DOM API sees no mounted view. `content/docs/api/dom.mdx` Minimal usage calls `editor.api.dom.focus()` on the editor `createEditor` returns, while `EditorRoot` gives each view its own editor (`packages/plitejs/src/react/components/plite.tsx:294-315`). Probe c1 got `null` from the soft root lookup on that editor; other calls were not run. Owner: suggested task t_78091f8f, which also fixes that page's example. Stop: that task lands or is dropped.
- An open plan still teaches the deleted lookup. The External text view substrate plan shows `coverage.resolveDOMPointOrBoundary(point)` (`docs/plans/2026-09-03-editable-island-substrate-closure.md:353`). Owner: that plan's next iteration. Stop: its next edit of that snippet.
