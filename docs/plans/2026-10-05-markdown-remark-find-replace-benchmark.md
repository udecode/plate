# Remark find-and-replace scaling benchmark

Status: awaiting your pick of reflect lessons; the fix is on `next` as an uncommitted pnpm patch.
Playbook: perf-issue

Objective:
Make the remark find-and-replace passes that Plate's Markdown kit runs grow linearly in sibling and block count, at the owning module, proven by an interleaved control/candidate doubling cohort.

Flow mode:
one-shot execution

Plan:
docs/plans/2026-10-05-markdown-remark-find-replace-benchmark.md

Template:
.agents/rules/benchmark/templates/benchmark.md

## Brief

### What will change?

On `next`, 25600 breaks parse in 2.5 s instead of 6.3 s and 16000 blocks in about 3.3 s instead of 5.9 s, through a pnpm patch of the dependency. It is uncommitted.

### What could go wrong?

A hinted lookup could return a different index than a full scan. The hint falls back to a full scan on a miss, and both copies must produce identical parsed documents.

## Defaults

| Decision | Pick | Alternative | Word |
|---|---|---|---|
| Land the fix on `next` | a pnpm patch of `mdast-util-find-and-replace@3.0.2` under `pnpm.patchedDependencies`, uncommitted | no patch, leaving the fix only in `../mdast-util-find-and-replace` | `no patch` |

## Open questions

### Reflect lessons

Which of the 11 Accepted reflect lessons should I apply?

Why it needs you: Each lesson changes instructions that every later agent and teammate loads, and reflect applies none without your approval.

- Rows 1 to 3 and 11 change the shared pstack block or the plan-page skill, so they go through sync-pstack's Lesson mode into the shared source.
- Rows 4, 5, 7, 8 and 9 change this repo's perf playbook and benchmark methodology, row 6 changes `AGENTS.md` outside the pstack block, and row 10 tunes the `verify` description.
- Row 1 encodes your correction: never propose or ask about a commit, push, PR, issue or fork in any repository unless you asked for it.

- **Apply all 11 lessons** (recommended): I apply every Accepted row, each through its routing, and leave everything uncommitted here. Cost: Four rows change the shared pstack source that every pstack project syncs.
- **Apply only this repo's 7 lessons**: I apply rows 4 to 10 and leave the shared-source rows out. Cost: Your no-PR correction stays unencoded in the shared rules, so another run could ask again.
- **Apply none**: Nothing changes. Cost: The next run can repeat both mistakes, the PR question and the missing in-tree dependency fix.

Why I pick it: Row 1 is your correction, and it only holds for every run once it is in the shared rules.

If you say go: I apply all 11 rows through their routings and republish this page; nothing is committed in this repo.

## Close

**Reversal.** The first close picked "no patch" as a default and left Plate unchanged. That default left the task's goal unmet in this checkout, which the plan-page rule forbids. Your answer to the upstream question was "just keep uncommited on next!! never ask for PR agaisnt next or main". The fix now lives on `next` as an uncommitted pnpm patch, no PR or issue was opened, and none will be offered.

**Deviations.** The task offered three owners. The fix belongs upstream. The only way to land it in this checkout is a dependency patch, so Plate's own apps and tests get it now. Consumers still get it only from an upstream release.

**What landed.** All of this is uncommitted on `next`. A new `patches/mdast-util-find-and-replace@3.0.2.patch` holds the same changed lines as the upstream patch. A `pnpm.patchedDependencies` entry in the root `package.json` registers it, and `pnpm-lock.yaml` gains its `patchedDependencies` hash plus three references. The installed module is byte-identical to the measured patched copy. Both consumers, `mdast-util-gfm-autolink-literal` and `remark-emoji`, link to it. The same change also sits uncommitted in `../mdast-util-find-and-replace`, on top of upstream 3.0.3.

**What was decided.**
- The upstream patch is the fix. Its `findAndReplace` starts each sibling lookup from the last index found in the same parent, keeping one hint map per walk. On a miss it falls back to a full search. The change is 33 added and 7 removed lines in `lib/index.js` plus one test, prepared in `../mdast-util-find-and-replace` on top of 3.0.3.
- I rejected a Plate-side change to which passes run. GFM autolinks and emoji come from remark plugins the user configures; the registry kit wires `remarkGfm` and `remarkEmoji`. Dropping or reordering those passes would change product output to hide a dependency's cost.
- I rejected an accepted limit. `maxNodes` (100,000 mdast nodes) admits a single paragraph of about 49,999 breaks. Extrapolating the measured 4× per doubling, the control would scan about 7.5 billion slots there. That figure is inferred, not measured.

**Proof.** Work counts are deterministic and identical on 3.0.2 and 3.0.3. At 3200 / 6400 / 12800 / 25600 breaks, the control scans 30.7M / 122.9M / 491.6M / 1966.2M `indexOf` slots per parse (4× per doubling) and the patched copy 38k / 77k / 154k / 307k (2×). At 2000 / 4000 / 8000 / 16000 blocks, the control scans 18.0M / 72.1M / 288.2M / 1152.4M and the patched copy 56k / 112k / 224k / 448k. On the dialect benchmark's legacy fixture, 5 copies drop from 38.8k to 3.7k slots and 100 copies from 14.6M to 75k. The interleaved timing receipt (5 packets per side, on 3.0.2 plus the patch) gives p50 368 / 846 / 2072 / 6303 ms against 302 / 581 / 1229 / 2708 ms for breaks, and 531 / 1083 / 2351 / 5858 ms against 442 / 848 / 1727 / 3253 ms for blocks. The patched doubling ratios stay between 1.88 and 2.20, inside the 2.4 budget. Every cohort's parsed document hashes identically across 3.0.2, 3.0.3 and both patched copies. The Markdown suite passes with the exact proposed bytes loaded (269 tests plus a marker test that fails when the wrong copy loads).

**Limits.** The timing receipt measured the patch applied to 3.0.2, Plate's locked version; on 3.0.3 the proposal is checked by work counts and tests, not timing. A warm 100-copy legacy timing run was invalidated, because host load reached 13.45 from another session's `tsgolint` and several `xcodebuild` processes. Timing is headless Bun on one Apple M5 Max. One behavior differs, and no test or Plate code observes it. When the same node object sits in two places, a function `ignore` test now receives the index of the occurrence being visited rather than the first one.

**Open work.**
- Plate's consumers keep the quadratic passes until upstream changes, since a pnpm patch does not ship with Plate's packages. The upstream-ready diff is at `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/upstream.patch`. owner: Plate Markdown maintainers. tracked: this plan's Close and Open risks.
- The root `package.json` also lists `is-hotkey@0.2.0` under a top-level `patchedDependencies` key, which pnpm 9 ignores. The lockfile records no hash for it, and the installed `is-hotkey` is unpatched. owner: Plate maintainers. tracked: this plan's Close.
- `ultracite check package.json` fails at `HEAD` on the `workspaces` array formatting, unrelated to this patch. owner: Plate maintainers. tracked: this plan's Close.

**Counts.** Of the 5 requirement rows, 5 are done, 0 skipped, 0 blocked and 0 open. All 9 lanes are closed: 5 complete and 4 N/A.

**Real-install proof.** Through the installed patch, with no preloads, three passes ran at load average 5 to 5.6. Breaks took 298 to 312 / 552 to 604 / 1156 to 1254 / 2497 to 2620 ms, matching the hinted receipt. Blocks took 396 to 513 / 795 to 907 / 1652 to 2245 / 3305 to 4286 ms. Every cohort's document hash matches the receipt. `pnpm install --frozen-lockfile` passes, and `bun test src/markdown` passes 270 with 0 failures.

## Main changes

- The root `package.json` registers a pnpm patch of `mdast-util-find-and-replace@3.0.2` (`patches/mdast-util-find-and-replace@3.0.2.patch`). It makes every find-and-replace pass in Plate's own install start each sibling lookup from the last index found in that parent.

## Reflect

Three reviewers (judgment, tooling, divergent) and a synthesizer, all on Opus, read this session's transcript after your correction. In the structural check I moved the frozen-snapshot row from Accepted to Backlog, because the snapshot script in Backlog can enforce it. Nothing below is applied yet.

### Accepted

| # | Problem | Proposal | Routing |
|---|---|---|---|
| 1 | The Plan pages rule sends "outward" calls to AskUserQuestion, so the lead asked to open an upstream PR, marked that option Recommended, and got back "never ask for PR agaisnt next or main" [J1 T1 D3 D4]. | Delivery should say that a commit, push, PR, issue or fork in any repository, upstream included, is never proposed, defaulted or asked about unless the user's own message asked for it, that Close lists it as not done, and that repairing an existing PR still follows Main-line PR delivery; Plan pages and shape.md's Open questions then leave these out of "outward". | AGENTS.md pstack block, Delivery and Plan pages, plus `.agents/skills/plan-page/references/shape.md` Open questions, through sync-pstack Lesson mode (udecode/dotai) |
| 2 | The lead's own spawn_task brief said "do not open upstream issues or PRs without the owner's word", and the run it started turned that line into the PR question [J1 T1 D5]. | Extend the resume-prompt sentence to cover spawn_task briefs, because one click makes a brief the new session's user message: a brief carries the goal, the gate, the plan path and "uncommitted in this checkout", and names no outward action as an option or a gate. | AGENTS.md pstack block, Todo list and close (the resume-prompt sentence), through sync-pstack |
| 3 | The free-text answer "just keep uncommited on next!!" was logged as "keep it local" with "on next" dropped, so the fix stayed out of Plate [J3 D2]. | When a question is answered, its Defaults or decision-log row quotes the answer verbatim, and a free-text answer that names an outcome no option offered is followed as written, not mapped to the nearest option. | AGENTS.md pstack block, Plan pages (the "go, or a pasted answer line" sentence), through sync-pstack |
| 4 | Durable fix decision has no class for a third-party owner, so the run read "never downgrade to a compatible local patch" as a ban on any in-tree fix and closed with "no Plate files changed" [J2 T2 D1]. | Add a `dependency` class: its long-term target is the upstream release, and until that ships the in-checkout delivery is the owner's exact diff as an uncommitted `pnpm patch` under `pnpm.patchedDependencies`, with Close stating that npm consumers stay affected until the release. | `.agents/playbooks/perf-issue.md`, Durable fix decision steps 1, 3 and 6, plus the "never downgrade" sentence in "Plan the fix from the trace" |
| 5 | The run wrote an upstream patch after `npm view` without checking the owner's tracker for an existing report, PR or fix [T3]. | In the dependency case, run `gh issue list` and `gh pr list -R <owner>/<repo> --search <symptom> --state all` and read the releases before writing a patch, and prefer a version bump when a fix has already shipped. | `.agents/playbooks/perf-issue.md`, Durable fix decision, the new dependency case |
| 6 | The run left uncommitted edits in `../mdast-util-find-and-replace`, the reference clone AGENTS.md points agents to for library behavior, so a later lookup would read the patch as upstream code [D6]. | Prepare third-party patches in a scratch clone or worktree, and keep every `../<repo>` reference clone at its upstream ref. | AGENTS.md Packages, the "inspect the repo at `..`" bullet (outside the pstack block) |
| 7 | A warm run took 1000–1600 ms for a parse that normally takes about 500 ms because other sessions had pushed load to 13, and nobody checked load until the number looked wrong [J6 T9]. | Record the load average with each packet, throw out packets above a threshold frozen together with the budget, and while load stays high, settle the claim with the path's work counter instead of more timing packets. | `.agents/rules/benchmark/references/methodology.md`, Fast Sampling |
| 8 | The first patched-dependency preload never swapped the module, so a "no difference" result would have measured the same copy twice [J7 T5]. | When a side swaps a module through a patch, alias or preload, load both sides through the same mechanism, assert in every sample a marker naming the copy that ran, and show the assertion fails when the wrong side is expected. | `.agents/rules/benchmark/references/methodology.md`, Candidate And Baseline Identity, after "Paths are not identities" |
| 9 | The browser lanes were marked N/A on the strength of a probe of popular verbs that skipped undo, redo and `tx.changes.apply`, and "2997 pass" never showed the suite reaching the new batched branch [D11 D12]. | Prove a claim that a path does or does not reach a changed branch with a hit counter on that branch, driven by every producer of its input shape including replay paths, or with a mutation the suite catches, never with a pass count. | `.agents/playbooks/perf-issue.md`, Fix, rerun, resume step 2, and `methodology.md` Default Lane Order (the `N/A: inapplicable` sentence) |
| 10 | `verify` was never loaded, although the run wrote two tests, marked three browser lanes N/A and claimed the fix works [D10 T11]. | Put "writing or changing a test" and "marking a benchmark lane or browser proof N/A" at the front of the description. | tune description: `.agents/rules/verify.mdc` (regenerates `.agents/skills/verify/SKILL.md`) |
| 11 | One subject got two one-off pages, and plan 1's open work pointed at plan 2's PR question, a pointer that went stale when that question was deleted [D8]. | Once a one-off plan's open work spawns a follow-up plan, create a subject file and make both plans its iterations. | `.agents/skills/plan-page/SKILL.md` Render step 1, through sync-pstack (udecode/dotai) |

### Rejected

- Principle: When an answer removes a question, search every plan and page for its header and fix each citation (J4).
- Reason: already-covered. The AGENTS.md rule "found by searching for its key phrase" already requires this, and Accepted row 12 removes the cross-plan pointer that caused it.

- Principle: `bun --preload <file> run <script>` prints the script list and runs nothing (T4).
- Reason: durability. It is a Bun CLI quirk tied to one version, and AGENTS.md's control-run proof rule already catches a launch that never happened.

- Principle: Wrap `RootChange.prototype.apply` and read `getRootChangeApplyStats` as Plite's work counter (T8).
- Reason: specificity. The internal API name will drift, and methodology's "direct cost counter owned by the path" step already asks for a counter.

- Principle: A filtered `node:test` run over nested subtests passes with zero tests (T10).
- Reason: already-covered. AGENTS.md makes a run that is expected to fail assert its own failure text, which is how the run caught this, and the case involved a third-party repo's runner.

- Principle: Plite's Bun suite command is `pnpm --filter plitejs test:bun` (T11, the command part).
- Reason: already-covered. verify's `commands.md` already names the plitejs scripts and the root Bun contract runner; the miss was not loading verify, which Accepted row 11 addresses.

- Principle: A regression test must not pin an option that a Defaults word reverses; it should assert the defect's invariant instead (D9).
- Reason: already-covered. The Tests rule and verify's testing reference already govern test shape, and Accepted row 11 makes that reference load.

- Principle: The long-term target should ask whether a repair is ever warranted for valid input (D13).
- Reason: already-covered. Durable fix decision step 2 already asks for the best long-term target; the concrete case is in Backlog.

- Principle: A harness defect noted only in Findings needs a repair or an owner row (D15).
- Reason: already-covered. Harness Repair and the `owner:` rule already require this; the concrete defect is in Backlog.

### Backlog

- **plan-open.mjs accepts a self-referential or ignored `tracked:` target (D7).** The remark plan's open work read "tracked: this plan's Close", and the only copy of the fix sat in gitignored `docs/plans/artifacts/`. `plan-open.mjs` never checks `tracked:`. Make it refuse a tracked target that names the plan itself or that matches `git check-ignore`. The change goes into udecode/dotai through sync-pstack.
- **plan-open.mjs misreports an open decision memo (T12).** Every fact and option bullet under `## Open questions` fails with "name its owner: and where it is tracked", and the lead spent several calls reshaping a memo that was valid under shape.md. Report each open `###` question as a single "waits on the owner" item instead.
- **Dirty-tree snapshot script (J5 T6).** Promote the run's scratch `snapshot.mjs` into `.agents/rules/benchmark/scripts/` with a built-in check that diffs each side against the base and fails on any file outside the task's list. Accepted row 7 then becomes one command.
- **CPU profile summarizer (T7).** `bun --cpu-prof --cpu-prof-dir=<dir>` found both owners in this run, but the repo has no tool to rank the result. Add `scripts/analyze-cpuprofile.mjs`, which ranks self and inclusive time by `function file:line`, and cite it in lane 4 `owner-microbench-and-trace`.
- **The is-hotkey patch is not applied (parent note, rechecked).** `package.json` keeps `is-hotkey@0.2.0` under a root-level `patchedDependencies` key, which pnpm 9.15 ignores. The lockfile records only the mdast patch, and the installed copy is unpatched.
  - The owner decides whether to move it under `pnpm.patchedDependencies`, which changes runtime behavior, or to delete it.
  - Add a check that fails when a `patches/*.patch` file is missing from the lockfile's `patchedDependencies`.
- **Dialect benchmark role asymmetry (D15).** Its prose row runs `withoutMdx` on the baseline side only, so any A/B through it gives wrong results. Repair it through benchmark's Harness Repair, or record an owner row.
- **Valid input still emits a repair (D13).** After the fix, valid `a<br/>b<br/>c` still emits a `merge-text` repair at `warning` severity (see `diag.jsonl`). The Plite slice-fit and Markdown decode owner should decide whether valid input should need a repair at all.
- **Reference clone cleanup (D6).** `../mdast-util-find-and-replace` still holds this run's uncommitted `lib/index.js` and `test.js` edits. Save the full diff, `test.js` included, somewhere tracked or in scratch, then reset the clone to its upstream tag.
- **Frozen snapshot for dirty source (J5 T6 D14), moved from Accepted.** For dirty source, build every side from one frozen snapshot, add only the task's files, diff the sides, and name each other-session file the measured path loads. The snapshot script above enforces it.

## Benchmark Source

- request: "Do this task here: “Fix quadratic remark find-and-replace on break-heavy paragraphs”". The task asked to run the Perf issue playbook, reproduce with a doubling cohort (3200, 6400, 12800, 25600 breaks), decide the owner (an upstream patch to `mdast-util-find-and-replace`, a Plate-side change to which passes run, or an accepted limit with a parse-limit note), not pre-merge leaves in the Markdown decoder, leave changes uncommitted, and open no upstream issue or PR without the owner's word.
- scope: `editor.api.markdown.parse` through the registry kit's remark plugins (`remarkMath`, `remarkGfm`, `remarkEmoji`), on break-heavy paragraphs and many-block documents
- invocation: `$benchmark markdown-remark-find-replace`
- candidate-identity: fingerprint: the same snapshot worktree loading `scratchpad/far/hint/index.js` (sha256 20eb786718b1), which is 3.0.2's `lib/index.js` with hinted sibling lookups and absolute imports
- plate-main-identity: N/A: origin/main loads the same third-party module through the user's remark plugins; see lane 2
- plite-identity: fingerprint: snapshot worktree `scratchpad/far/wt-snap` = `HEAD` 36c2f43170 plus the checkout's 347 uncommitted files at 2026-10-05, loading `scratchpad/far/control/index.js` (sha256 4063b2fcab6c), which is 3.0.2's `lib/index.js` (sha256 b171699f61c9) with absolute imports only
- slate-identity: N/A: Slate has no Markdown pipeline; see lane 7
- named-symptom: at 12800 breaks, 36% of a 2.17 s parse sat in `indexOf` under `mdast-util-find-and-replace` (`docs/plans/2026-10-05-markdown-br-canonicalization-benchmark.md`, Close)
- final-artifacts: artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`

First checkpoint:
- Copy every explicit requirement into checkable rows before measurement or
  code changes.
- Resolve source identities, host/build freshness, fixture/action comparability,
  correctness guards, and every default lane's applicability.
- All applicable lanes are selected by default. Only an explicit `only`
  invocation may mark otherwise relevant lanes
  `N/A: only - <reason>`. Use `N/A: inapplicable - <reason>` only for a lane
  that genuinely cannot apply.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A: no duration requested
- start / deadline: N/A: no duration requested
- final loop closure: N/A: no duration requested

Completion threshold:
- Requirement rows: (1) doubling cohort 3200, 6400, 12800, 25600 breaks reproduced on the control; (2) the owner decided among upstream patch, Plate-side pass change and accepted limit, with evidence; (3) no leaf pre-merge in the Markdown decoder; (4) changes stay uncommitted; (5) no upstream issue or PR without the owner's word.
- The candidate's p50 ratio per doubling is at most 2.4× at every step of both cohorts, in an interleaved run of at least five packets per side, and its parsed documents hash identically to the control's.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, the P1 autoreview gate is
  resolved per the pstack block's Panel review and Review rules, and `node .agents/pstack/plan-open.mjs` passes.

Verification surface:
- benchmark commands / artifacts: `PACKETS=5 node scratchpad/far/receipt.mjs <out.json>` over `para:3200..25600` and `blocks:2000..16000`; artifacts under `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/`
- correctness commands: `bun test src/markdown` in `packages/platejs` with the candidate preload; upstream `npm test` in `../mdast-util-find-and-replace` with the patch
- Browser / Chrome / device proof: N/A: the module runs only inside headless Markdown parsing
- source/ref/fingerprint proof: Benchmark Source above

Constraints:
- Correctness and native editor behavior outrank metric movement.
- Do not hide latency with debounce, delayed work, changed fixtures, degraded
  DOM, or a narrower action.
- Do not create another benchmark target registry or permanent run ledger.
- A conclusive cause pauses later lanes; it does not complete the goal.
- A proven cause selects the best long-term durable target, not the cheapest
  compatible patch. Before stability, hard-cut API or architecture when that
  buys materially better lasting value; preserve only a named hard correctness,
  security, serialized-data, native-behavior, or runtime law.
- After a fix, rerun the exact red lane and correctness guard before breadth.
- Do not commit, push, open a PR, comment, publish, or release unless separately
  authorized.
- No upstream issue or PR without the owner's word.

Boundaries:
- allowed runtime/packages/apps: none in Plate unless the owner decision lands a Plate-side change; the candidate module lives in scratch and in a local upstream clone
- allowed benchmark/tests/fixtures: scratch runners and preloads; the upstream clone's tests
- allowed baseline checkouts/hosts: `scratchpad/far/wt-snap`, `../mdast-util-find-and-replace`
- non-goals: Plite, the Markdown decoder's leaf shape, the CommonMark tokenizer's B4 scaling

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- The hinted copy changes any parsed document, or upstream tests reject the change with no linear alternative.

## Interaction Coverage

- first-interaction: N/A: a headless parse API call has no interaction phase; every cohort is one parse after two warmup parses
- settled-interaction: N/A: no interaction; repeated parses are covered by the 5 fresh-process packets per side
- route-scope: N/A: no route; the measured surface is `editor.api.markdown.parse` through `createTestEditor()`
- reporter-profile: pass: the named 12800-break symptom reproduced at 2072 ms p50 on the control (artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`)

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | `wt-snap` with `preload-hint.ts` | `wt-snap` with `preload-control.ts` | artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/modules/` holds both module copies and their preloads |
| lockfile / package manager | `pnpm-lock.yaml` sha256 b1ef4ef60309, pnpm 9.15.0 | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/modules/control/index.js` is 3.0.2's file with absolute imports into this lockfile's store |
| build mode / host / port | source under bun 1.3.12, two preloads | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/far-sample.ts` asserts the loaded copy on every sample |
| browser / machine / viewport / DPR | headless bun on Apple M5 Max | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json` records bun 1.3.12 |
| route / fixture / document / plugins | `createTestEditor()` with `remarkMath`, `remarkGfm`, `remarkEmoji` | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/far-sample.ts` builds and guards every cohort |
| setup / action / DOM strategy | one `parseTestMarkdown` per cohort after two warmups, fresh process per side per packet | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.mjs` |
| warmups / samples / interleave order | 2 warmups, 5 packets, alternating order | same | artifact: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json` rows carry `packet` and `order` |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Completion threshold rows (1) to (5) |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | skill and `methodology.md` read in full this session |
| Existing plan reused | yes | the earlier plan `2026-10-05-markdown-br-canonicalization-benchmark.md` is executed; this cause is new, so it gets its own plan |
| Candidate and baseline identities recorded | yes | Benchmark Source |
| Target/runner discovery completed from current source | yes | `benchmarks/targets/slate-v2.json` has no remark plugin target |
| Host/build/fixture freshness proved | yes | each sample asserts which module copy loaded; both copies come from the same 3.0.2 file |
| Correctness oracle identified | yes | identical parsed-document hashes, the Markdown spec suite with the candidate preload, the upstream test suite |
| All default lanes inventoried | yes | Lane table |
| `only` narrowing explicitly authorized or N/A | no | N/A: no `only` narrowing was requested |
| Browser/native proof strategy selected | yes | N/A for headless parsing |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default; no upstream issue or PR |

Work Checklist:
- [x] Every explicit scope, comparison, timing, stop condition, deliverable, verification surface, and success criterion is recorded. Closed: Benchmark Source and Completion threshold. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.
- [x] Short objective, threshold, verification, constraints, boundaries, and blocked condition are concrete. Closed: header sections. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason. Closed: Lane table. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.
- [x] Candidate/baseline signatures prove comparable source, fixture, action, build, browser, machine, and sampling. Closed: Comparison Signature. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.
- [x] Primary metrics match the visible user operation; proxies stay labeled. Closed: the metric is one complete `editor.api.markdown.parse`; work counts are labeled a deterministic indicator. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/scan-counts.jsonl`.
- [x] Samples expose p50/p75/p95/p99 only when sample count supports them, plus max, absolute/relative delta, and noise evidence. Closed: Metric table; p95 and p99 omitted at 5 samples per side. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.
- [x] Red lanes are not called causal without the conclusive-cause gate. Closed: Cause History names the intervention and work counter. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/scan-counts.jsonl`.
- [x] A proven cause pauses later lanes before another expensive benchmark. Closed: breadth ran after the receipt. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.
- [x] Every proven cause records its fix class, best long-term target, decision owner, layer plan, compatibility verdict, and implementation owner. Closed: Cause History. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then the Plan playbook before implementation. Broad accepted execution may use pstack's Autonomous run playbook; target selection may not. skip: the cause is `internal-implementation` in a dependency; no Plate API changes.
- [x] One isolated owner is fixed, then the exact benchmark and correctness guard rerun before breadth resumes. Closed: one owner, upstream `findAndReplace`, measured on 3.0.2 and 3.0.3. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/scan-counts-303.jsonl`.
- [x] Failed reruns invalidate or continue the same cause; they do not skip to a different green metric. Closed: the invalid mutation run and the loaded-host timing run are recorded and replaced. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/mutation.log`.
- [x] Green reruns resume the first pending applicable lane. Closed: lanes 8 and 9 ran after lane 4. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt-legacy.json`.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner evidence. Closed: Packet ledger. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.
- [x] Harness/metric/host defects are repaired before product optimization. Closed: the `onLoad` swap and load marker were fixed before any timing was read. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/aa.json`.
- [x] Final handoff reports candidate/baseline identities, lane status, first conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk. Closed: Final handoff contract and Close. Proof: `docs/plans/artifacts/2026-10-05-markdown-remark-find-replace/receipt.json`.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | snapshot worktree, two module copies from one file, load marker asserted per sample, A/A `aa.json` within 3 to 8% | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - the cost sits in `mdast-util-find-and-replace`, which the user's own remark plugins load on main and next alike, so a main-versus-next comparison cannot isolate it; the control/candidate pair swaps only that module | dependency ranges `^3.0.0` and `^3.0.1` | none |
| 3 | plate-vs-plite-decomposition | yes | complete | the 12800-break profile put 36% in `indexOf` under `mdast-util-find-and-replace`, called by GFM autolink literals and `remark-emoji`, outside Plate and Plite; Plate's source never imports it | none |
| 4 | owner-microbench-and-trace | yes | complete | `scan-counts.jsonl` and `scan-counts-303.jsonl` work counts, and `receipt.json` interleaved timing, both with identical document hashes | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - the module runs only inside remark transforms during Markdown parse, never during editor mount; a mount from Markdown pays the parse that lanes 4 and 9 measure | `git grep` finds no Plate import of `findAndReplace` | none |
| 6 | trusted-editing-matrix | no | N/A: inapplicable - typing, paste of editor content and other edits never run remark transforms; only Markdown parse does | same | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - the cost is in a remark dependency outside both Plite and Slate, and Slate has no Markdown pipeline | none | none |
| 8 | example-breadth | yes | complete | Markdown suite with the proposed bytes 269 pass plus marker; legacy fixture scans 38.8k to 3.7k slots (5 copies) and 14.6M to 75k (100 copies); 5-copy timing 44.7 vs 41.6 ms p50 (`receipt-legacy.json`) | none |
| 9 | large-and-stress | yes | complete | breaks to 25600 and blocks to 16000 in `receipt.json` and both count files | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: N/A: no cause open; results are in Cause History
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: N/A: no cause open; results are in Cause History
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: no cause open; results are in Cause History
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| find-and-replace-sibling-indexof | owner-microbench-and-trace | kept | internal-implementation | upstream `findAndReplace` starts each sibling lookup from the last index found in that parent during the walk, so every pass is linear in the tree | benchmark | N/A: a third-party internal implementation fix needs no Plate layer plan | N/A: no API or output change; parsed documents hash identically, and only a function `ignore` test on a node object used twice sees a different index | upstream `syntax-tree/mdast-util-find-and-replace` `findAndReplace`, carried on `next` as `patches/mdast-util-find-and-replace@3.0.2.patch` | `indexOf` scan work grows 4× per doubling on the control and 2× with hinted lookups, for both break and block cohorts; the 12800-break profile put 36% of the parse in that `indexOf` | pass: Markdown suite 269 pass on the snapshot with 3.0.2 loaded | `PACKETS=5 node scratchpad/far/receipt.mjs` | pass: p50 302 / 581 / 1229 / 2708 vs 368 / 846 / 2072 / 6303 ms for breaks and 442 / 848 / 1727 / 3253 vs 531 / 1083 / 2351 / 5858 ms for blocks | `bun test --preload ../../config/plite-source-aliases.ts --preload ../../tooling/config/bunTestSetup.ts --preload <module preload> src/markdown <marker.test.ts>` in `packages/platejs`, and `npm test` in `../mdast-util-find-and-replace` | pass: 270 pass with the proposed bytes, upstream 26 of 26 | `receipt.json`, `scan-counts.jsonl`, `scan-counts-303.jsonl`, `mutation.log` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| sizing | owner-microbench-and-trace | hinted sibling lookups make each pass linear | one pass: breaks 302 / 541 / 1145 / 2438 vs 354 / 748 / 1988 / 5942 ms; blocks 417 / 878 / 1713 / 3257 vs 492 / 961 / 2211 / 5413 ms | identical document hashes | keep | interleaved receipt |
| aa | source-and-host-readiness | identical control copies agree | 2 packets, p50 within 3 to 8% | identical hashes | keep: noise band | receipt |
| receipt | owner-microbench-and-trace | interleaved control vs hinted | see Metric table | identical hashes | keep | work counts |
| scan-counts | owner-microbench-and-trace | deterministic `indexOf` work | 4× vs 2× per doubling, on 3.0.2 and 3.0.3 | identical hashes | keep | breadth |
| legacy | example-breadth | normal and large documents | 5 copies 44.7 vs 41.6 ms p50; counts 38.8k to 3.7k and 14.6M to 75k | identical hashes | keep | upstream suite |
| legacy-warm | example-breadth | warm 100-copy timing | control 466 to 952 ms, hinted 524 to 1607 ms | identical hashes | invalidate: host load 13.45 from other processes | rely on work counts |
| upstream | owner-microbench-and-trace | proposed patch on 3.0.3 | upstream `npm test` 26 of 26; fallback mutation hangs until a 20 s timeout | pass | keep, local only; no PR | pnpm patch |
| pnpm-patch | owner-microbench-and-trace | the same change installed on `next` | three real-install passes match the hinted receipt; hashes identical | Markdown suite 270 pass; frozen install passes | keep | close |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| parse, 3200 breaks | 5 per side | 368.3 / 387.1 / omitted / omitted / 428.6 ms | 301.8 / 304.5 / omitted / omitted / 354.9 ms | −66.5 ms, −18% | A/A 3 to 8% | `receipt.json` |
| parse, 6400 breaks | 5 per side | 845.8 / 890.5 / omitted / omitted / 1319.2 ms | 580.8 / 593.0 / omitted / omitted / 626.8 ms | −265.0 ms, −31% | control max inflated by host noise | `receipt.json` |
| parse, 12800 breaks | 5 per side | 2071.8 / 2109.7 / omitted / omitted / 5683.9 ms | 1228.9 / 1242.7 / omitted / omitted / 1347.1 ms | −842.9 ms, −41% | control max inflated by host noise | `receipt.json` |
| parse, 25600 breaks | 5 per side | 6302.9 / 7573.4 / omitted / omitted / 10205.0 ms | 2708.2 / 2719.6 / omitted / omitted / 2886.6 ms | −3594.7 ms, −57% | control max inflated by host noise | `receipt.json` |
| parse, 2000 blocks | 5 per side | 530.8 / 743.3 / omitted / omitted / 846.1 ms | 441.8 / 447.6 / omitted / omitted / 476.1 ms | −89.0 ms, −17% | A/A 3 to 8% | `receipt.json` |
| parse, 4000 blocks | 5 per side | 1083.2 / 1570.8 / omitted / omitted / 1816.0 ms | 848.2 / 886.6 / omitted / omitted / 898.3 ms | −235.0 ms, −22% | control max inflated by host noise | `receipt.json` |
| parse, 8000 blocks | 5 per side | 2350.8 / 2363.1 / omitted / omitted / 3115.1 ms | 1726.8 / 1745.0 / omitted / omitted / 1790.0 ms | −624.0 ms, −27% | control max inflated by host noise | `receipt.json` |
| parse, 16000 blocks | 5 per side | 5857.8 / 7563.6 / omitted / omitted / 11571.4 ms | 3253.2 / 3357.9 / omitted / omitted / 5599.3 ms | −2604.6 ms, −44% | both maxes inflated by host noise | `receipt.json` |
| `indexOf` slots scanned per parse, 25600 breaks | 1 deterministic count per side | 1,966,156,800 | 307,194 | −99.98% | exact | `scan-counts.jsonl` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | `receipt.json`: hinted ratios 1.88 to 2.20 ≤ 2.4; identical hashes |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-05-markdown-remark-find-replace-benchmark.md` at cause/resume checkpoints | `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-remark-find-replace-benchmark.md` exit 0 |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Lane table: 5 complete, 4 N/A |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | `real-install.jsonl`: the same cohorts through the installed patch match the hinted receipt with identical hashes |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | `bun test src/markdown` through the installed patch 270 pass, 0 fail; upstream `npm test` 26 of 26 |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | every sample asserts its loaded copy; module copies saved under `modules/` |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | A/A `aa.json`; the marker test fails on a wrong copy; the loaded-host run is invalidated |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History, `internal-implementation` owned upstream |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | upstream `npm test` runs `tsc` and `type-coverage` (960 of 960) |
| Browser surface proof | no | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | N/A: headless Markdown parsing only |
| Changeset/release artifact | no | Add only for published package behavior/API changes, otherwise N/A | N/A: the patch changes only the private root workspace install, and no published package |
| Agent rule/skill sync | no | Run `pnpm install` and mirror/resource checks when agent sources changed, otherwise N/A | N/A: no agent source changes |
| Benchmark plan complete validation | yes | Run validator with `--complete` | `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-05-markdown-remark-find-replace-benchmark.md` exit 0 |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `ultracite check package.json` fails only on the `workspaces` array, the same failure at `HEAD`; the patch hunk formats clean |
| Timed checkpoint | no | Satisfy requested duration and close current packet, otherwise N/A | N/A: no duration requested |
| P1 autoreview | no | Run the panel that the `.agents/pstack.json` reviews list names for this work, or the one the user asked for, and record its result, or N/A with reason | N/A: the reviews list names no row for this work, and no panel was requested |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-05-markdown-remark-find-replace-benchmark.md` | exit 1 only on the list items under the open Reflect lessons question, by design while it is open |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | plan, snapshot, two module copies | none |
| Ordered diagnosis | complete | lanes 1 to 4, receipt, work counts | none |
| Fix and exact rerun | complete | patch prepared upstream; landing deferred to the owner | none |
| Remaining breadth | complete | lanes 8 and 9 | none |
| Review and closeout | complete | upstream suite, mutation check, writing passes | none |

Findings:
- `findAndReplace` runs one `visitParents` walk per find/replace pair. For each visited text node, `visitor` calls `indexOf` on every ancestor's siblings and `handler` calls `siblings.indexOf(node)`. A paragraph with s inline siblings costs O(s²) per pass, and a document with B blocks costs O(B) per text node, so O(B²) per pass.
- Upstream 3.0.3 (published 2026-10-04) only merges adjacent text nodes it creates; both `indexOf` calls remain.
- GFM autolink literals run one pass with two pairs and `remark-emoji` one or two, so the registry kit pays 3 to 4 passes per parse.

Decisions and tradeoffs:
- The owner is upstream. A pass change in Plate would alter what users' own plugins do, and the parse limits admit a paragraph about twice the size of the 25600-break cohort.
- The hint map resets per walk because a hint is only valid within one walk. A miss falls back to a full search, which keeps a node object used in two places correct.
- Delivery to consumers needs no Plate change: `mdast-util-gfm-autolink-literal` depends on `^3.0.0` and `remark-emoji` on `^3.0.1`.
- No local pnpm patch by default, reversible with `patch` under Defaults.
- Your answer, verbatim: "just keep uncommited on next!! never ask for PR agaisnt next or main". The fix lands on `next` as an uncommitted pnpm patch, and no PR or issue is opened or offered.
- The pnpm patch goes under `pnpm.patchedDependencies`, the key pnpm 9 reads, and the install ran with `--offline --ignore-scripts` so `prepare` would not regenerate other sessions' agent files. The lockfile was in sync with every manifest before the install (`--frozen-lockfile` passed).
- The comment review renamed `hints` to `lastIndexByParent` and rewrote its reason, because the first wording claimed every lookup lands at or after the hint and never mentioned the fallback. Counts, hashes and the Markdown suite were rerun on the final bytes (`scan-counts-303-final.jsonl`).

Harness/methodology repairs:
- On a host shared with other sessions, deterministic `indexOf` work counts carry the scaling claim, and timing is supporting evidence.
- Bun's runtime `onResolve` does not intercept bare imports from inside `node_modules`; the sample's load-marker guard caught it, and the preloads switched to `onLoad` on the real 3.0.2 file path.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| `onResolve` redirect never applied (`loaded undefined`) | 1 | `onLoad` keyed on the module's real path | fixed |
| the first mutation run matched no test (`--test-name-pattern` skips nested subtests) | 1 | rerun the whole file under a 20 s timeout | fixed; the mutation hangs and the timeout kills it (exit 124) |
| warm legacy timing under host load 13.45 | 1 | deterministic work counts | invalidated |

Verification evidence:
- `scan-counts.jsonl` (3.0.2) and `scan-counts-303.jsonl` (3.0.3): control and patched counts as in Close, with hashes identical across all four copies.
- `bun test ... src/markdown marker.test.ts` with the proposed 3.0.3 bytes: 270 pass, 0 fail; the same marker with a wrong expected copy fails with `Expected: "control"`, `Received: "hint"`.
- `npm test` in `../mdast-util-find-and-replace` on the final bytes: build, type coverage 960 of 960, format, lint and `c8 --100`, 26 of 26.
- `scan-counts-303-final.jsonl`: the final upstream bytes give the same counts and hashes as the earlier patched copy, and the Markdown suite passes 270 with them loaded.
- `mutation.log`: removing the fallback makes `node --conditions development test.js` hang until `timeout 20` kills it (exit 124).

Final handoff contract:
- plan / scope: this plan; remark find-and-replace passes in `editor.api.markdown.parse`
- candidate / baseline identities: Benchmark Source
- completed / N/A / pending lanes: 5 complete (1, 3, 4, 8, 9), 4 N/A (2, 5, 6, 7), 0 pending
- first conclusive cause: `find-and-replace-sibling-indexof`
- baseline / latest / best metrics: 25600 breaks went from 6302.9 ms to 2708.2 ms p50, and 16000 blocks from 5857.8 ms to 3253.2 ms
- fix owner / changed files: upstream `findAndReplace`; on `next`, `package.json`, `pnpm-lock.yaml` and `patches/mdast-util-find-and-replace@3.0.2.patch`, uncommitted; also `../mdast-util-find-and-replace/lib/index.js` and `test.js`
- exact benchmark and correctness reruns: Cause History
- resumed breadth: lanes 8 and 9
- packet decisions: Packet ledger
- harness/methodology repairs: `onLoad` module swap with a load marker; work counts on a loaded host
- residual claim limits / next owner: consumers keep the quadratic passes until upstream changes, owner Plate Markdown maintainers

Timeline:
- 2026-10-05 Plan created after the sizing pass.
- 2026-10-05 Interleaved receipt, work counts on 3.0.2 and 3.0.3, upstream suite and mutation check.
- 2026-10-05 After your answer, the fix landed on `next` as an uncommitted pnpm patch.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Awaiting your pick of reflect lessons |
| Where am I going? | Nowhere; everything stays uncommitted on `next` |
| What is the goal? | Linear remark find-and-replace passes in Plate's Markdown parse |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Plate's consumers stay quadratic in sibling and block count inside these passes until upstream changes. owner: Plate Markdown maintainers. tracked: this plan's Close.
