---
review_scopes: []
work_kind: implementation
---

# Fit report repair input paths

Status: executed; waits on your commit
Page: https://claude.ai/artifact/BcaA9PrtcYPnpdcBBHy22x
Playbook: bug-fix

`fitDocumentWithReport` names each schema repair's `inputs` so HTML, Markdown and DOCX diagnostics can point at the part of the caller's document that changed. Property and representation repairs named those inputs by their place in the grammar fitter's output, so a grammar insertion, wrap or removal before a repaired node shifted the path. A required root `title` prefix turned a merge of the caller's `[0,0]` and `[0,1]` into `[1,0]` and `[1,1]`, and an element prefix moved an omitted `bold` from `[0,0]` to `[0,1]`. Grammar `wrap-content` repairs had the same defect. They built their inputs from the wrapper's output index, so wrapping the caller's `[1]` and `[2]` reported `[1,0]` and `[1,1]`. The fix maps every input back to the caller's document through the grammar fit provenance, and nodes the grammar created report no input. The bug predates the authored-fill plan.

## Main changes

- `RootFitPathProvenance` in `packages/plitejs/src/core/slice-fit/provenance.ts` now maps caller paths for repair reports as well as for selection. `inputPaths(path)` returns the caller path of a node in the latest grammar output. It is the exact inverse of the provenance's path map, and the provenance builds it only when a report asks. `stage(source)` starts one grammar stage and returns its origin tracker, `inputsOf(node)` and `advance(fitted)`, so a stage resolves inputs against the mapping from before that stage advances.
- The root fit target in `compiled-slice-fitter.ts` carries `report: { provenance, repairs }` in place of the loose `repairs` option, so a root report cannot exist without its provenance. `fitRoot` creates one report per root attempt.
- Grammar report sites hand `reportRepair` the nodes they consumed, and the stage resolves those nodes through their origins. This covers `wrap-content`, `replace-element-shell` and `drop-unplaceable-text`, and content the fitter refits inside a replacement shell.
- `collectPropertyRepairs` in `editor-schema.ts` takes an input-path resolver. `resolveRepresentationRepairs` in `fit-report.ts` still classifies events against its own pass, so the set of repairs it reports does not change. It maps inputs to caller paths only when it emits a repair, and it returns `inputsOf(node)` for the second property pass.
- `fitRoot` throws when a fit records a third canonical pass, because no path map exists for it. None of the 84 report fits in the plitejs suite and the platejs HTML, Markdown and DOCX specs recorded more than two (`probe-passes-plitejs.txt`, `probe-passes-platejs.txt` in the run directory).
- Output locations did not change. HTML, Markdown and DOCX copy `inputs` verbatim, so they needed no change.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where a repair says it ended up | Leave it for later, since you asked about inputs (look) | Fix it now too | fix outputs | big |
| A repair for something the fit added, then removed | Still listed, pointing at nothing in your document | Left out of the report | drop empty repairs | small |
| A third cleanup pass, never seen so far | Throw an error | Ignore it quietly | skip extra passes | small |
| Release note | None, since nobody has these reports yet | Add a patch note | add changeset | detail |
| Test for the second cleanup pass | None, since no real document gets there | A test with a faked input | add pass-1 test | detail |

## Close

What landed, uncommitted in the working tree on `next`:

- `packages/plitejs/src/core/slice-fit/provenance.ts`, `compiled-slice-fitter.ts` and `fit-report.ts`, and `packages/plitejs/src/core/editor-schema.ts`. Another session has uncommitted work in the same files. Each file's diff against its pre-edit copy in the run directory holds only this fix's hunks.
- Five tests at the end of `reported schema fitting` in `packages/plitejs/test/schema-fit-report.test.ts`. They cover representation inputs after a root insertion, property-keyed representation inputs after an element insertion, property-pass inputs after both insertions, wrapped content, and a replacement shell with the content it wraps.

Deviations from the design come first:

- The architect synthesis added `stageInputs(source, origins)` beside the provenance's existing `advance`. The comment pass found a comment whose only job was to enforce their call order. The two became one stage handle, so the order can no longer go wrong. The representation resolver returns a node-keyed `inputsOf`, so `fitRoot` reuses the fitter's existing `getDescendant` instead of adding a path walk.
- `pnpm lint:task` autofixed one line in `fit-report.ts`, from `readonly (readonly number[])[]` to `ReadonlyArray<readonly number[]>`. That line came from the other session's uncommitted work, not from this fix.

Proof and its limits:

- The repro runs on the package API. Before the fix, all five new tests fail with the wrong path. That run used a snapshot of the current tree with this fix's four source files restored to their pre-edit copies, and it gave 5 failures and 6 passes (`attribution/red.sh`, `red-prefix-a1.log`). After the fix, `bun test --preload ../../config/plite-source-test-setup.ts ./test/schema-fit-report.test.ts` from `packages/plitejs` passes 11 of 11 (`green-report-a4.log`).
- Six mutants ran on a frozen commit of the final bytes (`f6361ce17b`), and each failed its named test (`mutate/`). They revert the grammar-frame map, checked against two tests, the representation input mapping, the property input mapping, the wrap sources and the stage origin lookup. A failing test names the wrong path. For example, the shell test expects a replacement-shell input of `[0,0]` and gets none.
- On the final bytes, the plitejs Bun suite passes 3420 of 3420 (`plitejs-bun-a2.log`). The platejs HTML, Markdown and DOCX specs pass 142 of 142 (`platejs-consumers-a2.log`). The core partition typechecks with all four source files in its program (`tsc-core-a2.log`, `tsc-core-files-a1.log`), and `pnpm lint:task` on the five files reports nothing (`lint-task-a2.log`). An earlier full run showed 8 authored-review failures. They failed the same way with and without this fix's four files on one snapshot, so they came from the other session's authored work in progress, and they were gone by the final run.
- The cost result is inconclusive. Three alternating packets per side ran at 100 and 2000 paragraphs. At 2000, report mode took 301 to 318 ms on the candidate against 295 to 326 ms on the baseline. That is 1.04x, inside the 1.08x spread between two baseline runs. Plain `fitDocument` ran at 0.98x, both sides produced the same repair and input-location counts, and a planted 2x slowdown failed both budget lines (`bench/`). Host load sat at 7 to 13 on 18 cores, above the frozen limit of 4, and no profile named the limiter. So the cost claim rests on the work counts and the source. Report mode adds a fixed number of linear passes per root: the provenance seed, one advance per stage that changes the tree, and a path inverse and stage index built once when a repair asks. Plain and selection-only fits gain no per-node work.
- Not proven: no document I found gives a second-pass property repair an input. Two traced fixtures failed at schema definition or never flattened (`probe-p5-a1.log`), so the mapping for that pass ships without its own test. The bridge from the grammar output to the first canonical pass relies on matching paths, because node identity does not survive the builder. The paths matched in the five probed cases (`probe-identity-a1.log`), which is evidence, not a proof for every slice fit.

Counts: 26 items, 23 done, 0 partial, 3 skipped, 0 blocked and 0 open. The skips are the session title, because the rename tool cannot find this session, the PR, because none was asked for, and the changeset, because the schema-repair diagnostics ship in the unreleased conversion-contracts changeset and no user saw the wrong paths. No panel ran. A bug fix with no PR and no public API change is not on the reviews list. The architect step ran three runners (Opus, Astra and Sol) and an Opus cross-judge. The synthesis took Sol's candidate as its base, with Astra's representation lineage and Opus's third-pass refusal grafted in (`architect/synthesis.md`).

Open work, tracked here:

- Output locations still name each stage's own paths. A spacer inserted before a text moves the final text from `[0,1]` to `[0,2]`, while its `default-property` repair still names `[0,1]`. A root prefix moves an element-level `insert-required-content` from `[0,0]` to `[1,0]` (`probe-frames-fixed-a1.log`, cases C and E). The representation pass's successor map can move property outputs, and grammar outputs need lineage for the nodes the grammar creates. owner: zbeyens. stop: the owner says "fix outputs", or drops it.
- The cost probe needs a quiet host before its timings count. owner: zbeyens. stop: the owner reruns `bench/run.sh` from this plan's run directory with load under 4, or drops it.
