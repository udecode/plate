# Build the website with one memory switch

Status: building, checking the restored build with one memory flag on the owner's Basic machine.
Playbook: bug-fix

## Brief

### What will change?

Restore the passing build changes with one switch. Builds use less memory by default. Turn the switch off on a larger machine to restore normal caching and compilation concurrency.

### What could go wrong?

The previous build passed on Standard. The Basic machine still needs its own result. Lower memory use can cost build time. Neither mode has a measured speed guarantee.

## Teach

The build turns the website source and documentation into deployable pages. JavaScript and native tools share the machine's memory. A heap allowance equal to the whole machine leaves little room for other uses.

The memory mode limits the heap and simultaneous module work, enables webpack's memory option and disables its cache. The other mode restores a larger heap and normal webpack caching and concurrency. The build worker stays enabled in both.

Reading registry source directly avoids a redundant parse in both modes. That change preserves the source text and does not trade speed for memory.

## Scope

- Latest request: revert the revert, test the owner's Basic Vercel machine and provide one flag that can be disabled for a larger GitHub CI machine later.
- Exit condition: the single flag controls all memory tradeoffs, its off mode is checked locally, and a fresh low-memory preview reaches READY with Basic hardware confirmed in its build log.
- User-selected machine change: Standard to Basic. This run changes no Vercel machine setting.
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

## Demo

1. Run `pnpm -w build:www:ci` to use the memory mode by default. Set `PLATE_WWW_LOW_MEMORY=1` explicitly for the same behavior.
2. Run `PLATE_WWW_LOW_MEMORY=0 pnpm -w build:www:ci` on a larger machine to use the normal cache and concurrency settings with an 8192 MiB heap allowance.

## Steps

- [x] Reproduce the original memory failure and find a passing Standard build. Proof: baseline-vercel.json through cache-final-vercel.json retain the five trials; the fifth reached READY with all 1448 pages generated.
- [x] Restore the requested revert. Proof: the runtime source restoration matches the previously passing registry reader and build settings before the flag is added.
- [x] Add one memory flag and check both modes. Proof: single-flag-modes-a4.log covers default, explicit on and explicit off in Next config, the actual Node launcher and a real Next webpack worker with conflicting inherited heap spellings.
- [x] Check existing docs and CI command contracts. Proof: flag-config-before/after-a1.log and flag-ci-before/after-a1.log pass; flag-lint-a1.log covers four changed JS/TS files.
- [ ] Publish and test on Basic. Proof: exact candidate SHA reaches READY; log confirms the actual machine allocation.
- [ ] Complete the evidence review and final delivery. Proof: handled review findings, final source identity and land.mjs commits.

## Verification

- Three existing docs configuration tests and the focused existing Vercel command test pass before and after. The configuration mode probe also confirms the async-docs replacement remains present when memory mode is off.
- The local Node 24 launcher and Next worker report the selected 4096 or 8192 MiB old-space cap despite mixed inherited spellings. This checks flag propagation, not remote peak memory. Next deliberately removes both heap flags for static prerender workers.
- Turbo's dry run includes `PLATE_WWW_LOW_MEMORY` as a configured build variable when set to `0`.
- The registry reader matches the earlier candidate byte for byte. The retained text-parity probe covers all 948 tracked registry text files and unchanged import rewriting. It does not execute every documentation route.
- The earlier Standard build and its three deployed HTTP checks remain historical evidence. Basic needs a new deployment result. No speedup or broad editor behavior claim is made.

## Evidence

- Main checkout run directory: docs/plans/artifacts/2026-10-19-www-build-memory.
- Earlier trials: baseline-vercel.json, heap-final-vercel.json, parser-final-vercel.json, parallel-final-vercel.json and heap4096-final-vercel.json. The first four candidates failed before compilation completed.
- Passing Standard trial: cache-final-vercel.json and decisive slices in cache-watcher-final.json. Its all-events response was marked truncated, so it is not a complete log archive.
- Parser parity: registry-text-parity-a1.log and registry-text-parity.json; source equality against b9541b47a7 confirms this iteration restores the same reader.
- Flag owner: single-flag-owner.md. The first local probe omitted Fumadocs' Babel-loader context. The second exposed an incorrect CLI filename. The final probe supplies the loader context and resolves Next's actual extensionless binary.
- Existing contracts: flag-config-before-a1.log, flag-config-after-a1.log, flag-ci-before-a1.log and flag-ci-after-a1.log.
- Launcher and modes: next-launcher-help-a1.log, single-flag-modes-a4.log and turbo-flag-dry.json. The mode probe intercepts the Next startup after reading its memory allowance; it does not perform a full local build.

## Open work

- Finish the Basic deployment check and final delivery. owner: this run; stop: exact candidate READY on Basic and evidence review complete.
