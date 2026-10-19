# Build the website with one memory switch

Status: executed, the restored build passed on Basic with one memory flag.
Playbook: bug-fix

## Brief

### What will change?

The passing build changes are restored with one switch. The Basic build reached Ready with all pages generated. Memory mode stays on by default. Turn it off on a larger machine to restore normal caching and compilation concurrency.

### What could go wrong?

The other mode permits an 8 GB heap and disables webpack's memory option. It has local startup checks, not a full build. The project now uses Basic explicitly. The separate GitHub deployment workflow still has an upload error.

## Teach

The build turns the website source and documentation into deployable pages. JavaScript and native tools share the machine's memory. A heap allowance equal to the whole machine leaves little room for other uses.

The memory mode limits the heap and simultaneous module work, enables webpack's memory option and disables its cache. The other mode restores a larger heap and normal webpack caching and concurrency. The build worker stays enabled in both.

Reading registry source directly avoids a redundant parse in both modes. That change preserves the source text and does not trade speed for memory.

## Scope

- Latest request: revert the revert, test the owner's Basic Vercel machine and provide one flag that can be disabled for a larger GitHub CI machine later.
- Exit condition: the single flag controls all memory tradeoffs, its off mode is checked locally, and a fresh low-memory preview reaches READY with Basic hardware confirmed in its build log.
- User-selected machine change: Standard to Basic. The inherited team setting displayed Basic, but two previews still received Standard hardware. This run saved Basic explicitly for this project. A fresh preview now logs 2 cores and 8 GB.
- Previous passing source: b9541b47a7d275f42d4486c5a4706dbd0dec454f, deployment dpl_3R2yHbHJenZk5pixoGv7mvYL5vUr, Standard 4 cores and 8 GB.
- Revert restored by this iteration: 189450ae23bc7ad31ea4e4bf81e52803d0c48f62.
- No production promotion or release. The separate GitHub Actions workflow introduced by 88e2550143 remains outside this change.
- Throughput checkpoint: one direct Vercel trial at a time; run the local mode checks before publishing.

## Main changes

- `PLATE_WWW_LOW_MEMORY` defaults to enabled. Set it to `0` to disable the memory tradeoffs.
- The Next launcher selects a 4096 MiB heap in memory mode and 8192 MiB otherwise. Both accepted heap-option spellings receive the same value because Next reformats options for its webpack workers.
- Memory mode uses `webpackMemoryOptimizations`, disables webpack caching and limits module parallelism to four. Off mode disables that experimental memory option and leaves webpack's cache and parallelism defaults intact.
- Turbo allows the flag through its build environment. The existing CI command check follows the launcher.
- The async-docs module replacement and build worker remain enabled in both modes. Registry text uses direct import rewriting in both modes.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Default build mode | Reduce memory | Prefer maximum throughput | speed | small |
| Project machine setting | Keep Basic explicitly (look) | Follow the team default | inherit | small |

## Demo

1. Open https://plate-25332s4te-udecode.vercel.app/docs/components/math and select Manual. The deployed page shows the registry source, including math.tsx.
2. Run `pnpm -w build:www:ci` to use the memory mode by default. Set `PLATE_WWW_LOW_MEMORY=1` explicitly for the same behavior.
3. Run `PLATE_WWW_LOW_MEMORY=0 pnpm -w build:www:ci` on a larger machine to use the normal cache and concurrency settings with an 8192 MiB heap allowance.

## Steps

- [x] Reproduce the original memory failure and find a passing Standard build. Proof: baseline-vercel.json through cache-final-vercel.json retain the five trials; the fifth reached READY with all 1448 pages generated.
- [x] Restore the requested revert. Proof: reader-restoration-a1.log compares the restored reader with the passing b954 source; the runtime diff records the added flag and launcher separately.
- [x] Add one memory flag and check both modes. Proof: single-flag-modes-a4.log covers default, explicit on and explicit off in Next config and the actual Node launcher. Next's Worker class runs a heap query with webpack's worker options; the probe does not execute webpack compilation.
- [x] Check existing docs and CI command contracts. Proof: flag-config-before/after-a1.log and flag-ci-before/after-a1.log pass. flag-final-lint-a1.log covers the final four eligible JS/TS files; the earlier flag-lint-a1.log predates the final launcher edits.
- [x] Publish and test on Basic. Proof: basic-final-vercel.json records READY at exact commit 40010f7279; basic-start.json confirms 2 cores and 8 GB. build-hardware-and-phase-slices.json records the 4096 MiB heap, successful compilation and 1448/1448 pages. basic-http-a1.log and basic-math-manual.txt/png cover the deployed output checks.
- [x] Complete the evidence review and runtime delivery. Proof: audit-flag-opus.txt and audit-flag-tail-opus.txt, handled findings below, flag-source-identity-a1.log and runtime commit40010f7279. The closing documentation is delivered through land.mjs.

## Verification

- Three existing docs configuration tests and the focused existing Vercel command test pass before and after. The configuration mode probe also confirms the async-docs replacement remains present when memory mode is off.
- The config probe runs with Bun. The launcher runs with Node 24, and Next's Worker class reports the selected 4096 or 8192 MiB old-space cap despite mixed inherited spellings. The child runs a V8 heap query with webpack's worker options, not webpack itself. This checks flag propagation, not remote peak memory. Next deliberately removes both heap flags for static prerender workers.
- Turbo's dry run includes `PLATE_WWW_LOW_MEMORY` as a configured build variable when set to `0`.
- The registry reader matches the earlier candidate byte for byte. The retained text-parity probe covers all 948 tracked registry text files. Source inspection confirms that unchanged import rewriting receives the same text. The probe does not execute that rewriting or every documentation route.
- The Basic preview reached READY on Node 22 with 2 cores and 8 GB. All 1448 pages generated; all 5 Turbo tasks succeeded with 0 cached in 7m17.577s. Vercel reports about 8 minutes for the build. Three HTTP routes returned 200 with expected text. The Math Manual tab showed registry source in the browser, with its screenshot inspected. This is one full build and scoped output proof, not a speed comparison or broad editor certification.

## Evidence

- Main checkout run directory: docs/plans/artifacts/2026-10-19-www-build-memory.
- Earlier trials: baseline-vercel.json, heap-final-vercel.json, parser-final-vercel.json, parallel-final-vercel.json and heap4096-final-vercel.json. The first four candidates failed before compilation completed.
- Passing Standard trial: cache-final-vercel.json and decisive slices in cache-watcher-final.json. Its all-events response was marked truncated, so it is not a complete log archive.
- Parser parity: registry-text-parity-a1.log and registry-text-parity.json; source equality against b9541b47a7 confirms this iteration restores the same reader.
- Flag owner: single-flag-owner.md. The first local probe omitted Fumadocs' Babel-loader context. The second exposed an incorrect CLI filename. The final probe supplies the loader context and resolves Next's actual extensionless binary.
- Existing contracts: flag-config-before-a1.log, flag-config-after-a1.log, flag-ci-before-a1.log and flag-ci-after-a1.log.
- Launcher and modes: next-launcher-help-a1.log, single-flag-modes-a4.log and turbo-flag-dry.json. The mode probe intercepts the Next startup after reading its memory allowance; it does not perform a full local build.
- Basic allocation: basic-setting-full.txt and basic-setting.png show the saved project setting after reload. The first basic-setting.txt contained only an accessibility diff with no changes and proves nothing. basic-start.json binds deployment dpl_2n4jVxGHSpjrBvVqKJ9hbvyHnwTx to exact commit 40010f7279b666f109e0fb76832746e4c63dfa6f and its 2-core/8-GB build log. standard-allocation-previews.json retains the two canceled Standard previews and their hardware lines.
- Historical machine evidence: build-hardware-and-phase-slices.json also supplies the hardware lines missing from the original parser, parallelism and heap4096 snapshots.
- The rollback's automatic Git preview was canceled at the start of this restoration. rollback-canceled.json records dpl_9KLa2uD1nHTVwdUWPnMt5hCYeBjK at 189450, with preview target null. The later dpl_ChiRd preview was also an automatic Git build of this run's commit. The two API previews used an exact SHA ref. This run assigned no branch alias or beta domain and performed no production promotion.

## Review and reflection

- Independent trail review used claude-opus-5-5 at xhigh. Its first packet was stale after the machine override. The supplemental review used the current physical transcript. Both reports are retained.
- Corrected evidence pointers, saved the full settings tree, added the machine-override default, retained missing cancellation and hardware evidence, and narrowed worker, lint and parser claims. No source repair was needed.
- No permanent test was added for reversible configuration constants. The retained three-mode probe checks the actual launcher, Next worker transport and config hook. Existing docs and command contracts remain checked.
- Reflection accepted no workflow edit and created no backlog. The worker-boundary and Turbo environment findings are implemented and checked in this change. General proof guidance already requires observing the actual consumer. One framework formatter detail does not warrant a vendor-skill edit.

## Open work

- The larger GitHub deployment workflow is outside this request and belongs to its existing implementation task. owner: the GitHub CI workflow owner; stop: its requested later CI work verifies upload and domain assignment. Actions runs 39243102355 at 40010 and 39241582805 at 189450 both failed upload because `--skip-domain` requires a production deployment. Their failed-step logs are retained. This run changed no workflow and does not certify that deployment path.

## Close

The owner requested a rollback, then requested its reversal with one flag. Revert 189450ae23 was restored by 40010f7279, which adds the flag. Basic needed an explicit project setting because inherited Basic still allocated Standard. The saved explicit Basic selection persists; `inherit` returns the choice to the team default.

The original failure was webpack worker termination with confirmed memory exhaustion. The passing combination removes redundant source parsing, limits JavaScript heap and module concurrency, enables webpack's memory option and disables its cache. The cache change was the final difference before the first Standard pass. The trials do not establish that every retained setting is individually necessary.

At 40010f7279, preview dpl_2n4jVxGHSpjrBvVqKJ9hbvyHnwTx reached READY on Basic with 2 cores and 8 GB. It generated 1448/1448 pages and completed 5 tasks with 0 cached. All 3 scoped HTTP checks passed. The browser showed Math's Manual source, including math.tsx and EquationElement. The four eligible JS/TS files lint clean, the three existing config tests and focused command test pass, and the six-file source identity check matches the deployed commit.

The latest request is complete. The original sequential trials are recorded as d94594616c, f46323fa56, 94346acde7, d5ea31e22c and b9541b47a7. Commit 189450ae23 rolled them back; 40010f7279 restores the passing source under one flag. No production release, machine upgrade or change to the other task's GitHub workflow occurred.

Attention, reviewed by claude-opus-5-5 at xhigh. Basic is an explicit project override. Off mode selects 8192 MiB and turns off the experimental memory option; its full larger-machine build remains for the later CI work. The separate Actions workflow currently fails upload. Evidence limitations and review corrections are recorded above.
