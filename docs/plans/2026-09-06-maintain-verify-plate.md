# Maintain Verify Plate

Outcome: **blocked**. The unscoped source audit and live-attempt ledger are complete. Full measurement coverage and replay of several benchmark harness edits remain blocked. Verified local corrections are retained alongside explicitly unverified candidates; the complete change set is not ready to publish.

Scope: Verify Plate source, canonical verification inventories and harnesses in `/Users/zbeyens/git/plate-2`, branch `next`. This maintenance run made no product edits, commits, pushes, PRs or external messages. Other work changed the shared checkout during the run; each receipt retains its own input identity.

The requested [Maintain Verification Skill](../../.agents/skills/maintain-verification-skill/SKILL.md) says, “Never edit product code during a run.” Product failures below therefore remain reported defects. Missing credentials, device access and browser-policy restrictions remain explicit prerequisites.

## Complete denominator

These inventories overlap; their counts must not be added into one feature total.

| Surface | Source coverage | Live result and evidence |
| --- | --- | --- |
| Plite examples | 41/41, including nine hidden examples | All have attempted owned recipes. The initial full run passed 739 Chromium cases. The eight profile/opt-in rows later passed on their applicable profiles; a saved stress replay also passed. These runs have distinct input identities. See [initial cases](artifacts/2026-09-06-maintain-verify-plate/chromium/test-results-current.json), [journeys](artifacts/2026-09-06-maintain-verify-plate/plite-journeys-current.json), and the final strict result below. |
| Plate registry | 226/226: 72 components/kits, 70 examples, 67 editor components, six hooks, three libraries, two styles, four blocks and two initialization entries | 226/226 entries have explicit attempted-consumer scopes and results. This includes failures and unreachable prerequisites. [Per-entry ledger](artifacts/2026-09-06-maintain-verify-plate/registry-live-coverage.json). |
| Public packages | 75 JavaScript entrypoints plus the math CSS export; 80 partitions selecting 452 test paths | Source package checks, client entrypoint fixture and packed import/declaration/SSR checks ran. Packed proof failed the size snapshot for 28 entries, differing by 76–742 bytes. [Inventory](artifacts/2026-09-06-maintain-verify-plate/public-package-inventory.json), [packed log](artifacts/2026-09-06-maintain-verify-plate/packed-packages.log). Test paths are not independent behaviors. |
| CLI | Four executable jobs, 25 proof rows | All 25 rows drove the actual binary in disposable consumers, including watch ownership/recovery, migration scaffolding, document modes and interactive dependency updates. Package tests: 86 passed. [CLI evidence](artifacts/2026-09-06-maintain-verify-plate/cli-live), [cleanup](artifacts/2026-09-06-maintain-verify-plate/cli-cleanup.json). |
| Docs | 309 MDX sources: 193 English, 116 Chinese; 78 English fallback URLs | 387/387 routes attempted: 380 rendered their expected heading and body, six failed after preview loading, one Chinese huge-document preview remained unverified after a browser crash. Rendering scope is separate from embedded-editor behavior. [Route ledger](artifacts/2026-09-06-maintain-verify-plate/docs-browser-coverage.json). |
| Benchmarks | 48 initial entries; 47 active after removing one exact duplicate | All 47 reached an actual drive attempt: 26 passed, eight failed during measurement, one failed correctness, twelve were blocked before measurement by strict-proof freshness/failure. There are 51 preserved attempt receipts. [Ledger](artifacts/2026-09-06-maintain-verify-plate/benchmark-progress.json). |

The Plate automated browser inventory contains **106 distinct cases: 100 passed, four failed, two skipped**. Focused replays replace earlier results for the same case; they do not inflate the denominator. The two skipped comparison cases require an explicitly pinned main deployment. [Case ledger](artifacts/2026-09-06-maintain-verify-plate/www-browser-coverage.json).

## Final strict result

The final `pnpm check:plite` passed package types, package tests and proof-runner contracts, then stopped after four of 81 browser batches: **31 passed, one failed**. `huge-document.test.ts:1285` failed staged repeated Shift+ArrowDown selection parity with full DOM; several focus offsets differed.

All **4,419 captured inputs were unchanged** through that run. The failure is therefore not attributed to concurrent edits. The earlier 739-case green cannot certify these later inputs. [Final strict receipt](artifacts/2026-09-06-maintain-verify-plate/full-check-refresh-3-result.json), [raw log](artifacts/2026-09-06-maintain-verify-plate/check-plite-refresh-3.log), [copied browser artifacts](artifacts/2026-09-06-maintain-verify-plate/strict-refresh-3).

The preceding refresh stopped in package tests; its exact assertions and a concurrent test edit remain preserved in `full-check-refresh-2-result.json`. The later package pass supersedes that package failure only; it does not erase either attempt.

## Verified local corrections

| Owning source or harness | Correction and proof |
| --- | --- |
| `.agents/rules/verify-plate.mdc` and owned `commands.md` / `cli.md` | Teach canonical package discovery, streamed docs and loaded previews, source/build identity, native clipboard distinctions, installed Base/Radix consumers, copied API prerequisites, watch/migration/dependency operations and cleanup. The live attempts above establish the stated routes and limits. |
| `inspect-plite-browser.mjs` and its tests | Retain suite-local helpers, timeouts and suite annotations. Parameterized helpers remain explicitly unresolved. Current discovery returns 690 recipes and 17 unresolved sites; the selected examples were driven. |
| Async-decoration and stress-replay specs | Remove a duplicate nonexistent hook variant. Resolve saved stress routes through the same Plite prefix as the producer. Decoration cases passed in the initial full run; saved stress replay passed after the route correction. Original failures are retained. |
| Package build-artifact checker | Require exported CSS bytes even when declarations exist. Missing-CSS control failed before the fix; contract and actual Plate artifact checks passed. Final inspector/artifact helper suite: 23 passed. |
| Find history and kit lifetime specs | Assert rendered document elements without drag-control text; put default probe output in the per-test artifact directory. Focused live replay passed both cases, and the shared historical `/tmp` output stayed unchanged. |
| Clipboard and drawing controls specs | Separate trusted native HTML paste from synthetic-event proof; drive the 767/768px layout boundary and real horizontal toolbar scrolling. Final focused run: four passed, zero skipped. [Results](artifacts/2026-09-06-maintain-verify-plate/final-focused-www/results.json). |
| Pagination benchmark locator | Read rendered text ranges when leaf wrappers are omitted or use `display: contents`. All 120 actual operation samples passed after correction; recorded worst p95 was 633.7ms. This is harness reachability proof, not an improvement claim. |
| Benchmark inventory and supporting scripts | Remove the exact issue-6038 alias; correct moved sources, output paths, build-before-artifact checks and default comparison controls. Scoped drives reached their intended stages; timing and behavior failures remain failures. Three forced browser-launch failures each recorded listener acquisition followed by closure. [Cleanup controls](artifacts/2026-09-06-maintain-verify-plate/launch-failure-controls/receipt.json). |

`pnpm install` regenerated both verifier mirrors. Resource parity passed; all 14 generated local verifier links resolved. Final syntax checks passed for 17 MJS helpers, and the target checker accepted 47 entries. [Regeneration](artifacts/2026-09-06-maintain-verify-plate/final-source-regeneration.log), [parity](artifacts/2026-09-06-maintain-verify-plate/final-resource-parity.log), [helper contracts](artifacts/2026-09-06-maintain-verify-plate/final-helper-contracts.log).

## Edits still requiring replay

These local candidates are **not proven ready**:

- `core/compare/history.mjs`, `observation.mjs` and `rich-text-operations.mjs` adapt the comparison to current Plite APIs and require matching runtime/owner identity. Their actual measurements were blocked by the strict prerequisite. Syntax and source inspection do not prove their workloads.
- `browser/rich-text-replay-coverage.mjs` uses the current test configuration and identifies its output as discovery. Its full target drive was blocked before execution.
- The legacy huge-document runner's default repository/build path is source-corrected. Its launch-failure cleanup passed with building explicitly disabled; the normal build-and-measure path remains unverified.
- The normalization comparison reached its corrected build/import setup but still crashed while constructing its schema. That entire target is not healthy.

The failed huge-document locator candidate was removed; only its independently proven launch cleanup remains. Benchmark budgets and frozen baselines were not relaxed.

[Agent-native review](artifacts/2026-09-06-maintain-verify-plate/agent-native-review.md): **NEEDS WORK** because the above proof gaps remain. Source ownership, generated preservation and discoverability checks passed.

## Product failures and proof limits

| Surface | Observed result |
| --- | --- |
| Full installed editor | Base built but failed after hydration with missing drag-drop context. Radix compilation/typecheck passed but `/editor` prerender failed because Tooltip lacked its provider. Both basic installed editors built, accepted text and undid it. [Consumer receipt](artifacts/2026-09-06-maintain-verify-plate/installed-consumers/receipt.json). |
| Demo schemas | Tabbable, Editable Voids and Hundreds Editors fail on both language docs routes and exact registry routes. Plugin Rules rejects codeBlock cardinality; Playground lacks codeDrawing; Version History uses mismatched extension names; Multiple Editors lacks drag-drop context for its image component. Align begins empty, although its control works after typing. Exact actions and errors are in the registry ledger. |
| Other editor behavior | Copilot's visible fallback is discarded by Tab while the bulleted paragraph indents. Editor Select remains read-only after toggling it off. An image upload hit `insertBefore` during concurrent HMR; root-cause attribution requires stable-input replay. General mode switching on basic marks passed. |
| Four automated Plate failures | Arrow autoformat stayed literal; native huge-code style recalculation exceeded 0.1s (0.152394s); homepage DnD native selection was empty; table paint positive control detected no pixel difference. The table paint contract remains unverified. |
| Benchmark failures | Schema instantiations exceeded 5,000,000 (11,473,749); Plate code-block worst budget ratio was 7.08; the text-flow matrix timed out for dense/overlap/code at 10,000 lines. Other failed target receipts identify document-change, anchors, decoration scalability, normalization schema setup and huge-document click selection. External-text correctness was invalidated by an actual source change; no measurement followed. |
| Remote APIs | Installed AI/copilot returned 401 with no AI Gateway key. UploadThing configuration returned 200, but upload credentials were absent. Demonstration fallback output is not remote-service proof. [Prerequisites](artifacts/2026-09-06-maintain-verify-plate/installed-consumers/api-prerequisites.json). |
| Browser/device scope | Mobile viewport and synthetic composition results are proxies. No raw Android/iOS input is certified. Pro iframe access, saved static HTML browser policy and one Chinese huge-document preview remain explicit gaps. Static code-drawing has no ordinary live registry consumer. |
| Export scope | Five formats were saved and signature-checked; Word/HTML/Markdown import round-trips passed. PNG contrast reflects the active Dark Reader profile; PDF raster appearance was not separately inspected. HTML export proves allocation/download, not object-URL revocation. |

## Cleanup and handoff

Owned listeners on 3297, 3301 and 3102 are gone. The www session exited 143 after its verified listener received SIGTERM. All disposable CLI and installed-consumer workspaces were removed after checking their evidence and open handles; the installed archive was read back and all 1,690 files matched before deletion. Healthy IAB/Chrome tabs were closed. A prior crashed IAB tab could not be closed because Browser Use URL policy denied that action; no bypass was attempted. The user's port-3000 server was not stopped.

Evidence remains under [the run artifacts](artifacts/2026-09-06-maintain-verify-plate/). Earlier checkpoint prose is preserved in `progress-checkpoints.md`; original benchmark artifacts and failed attempts remain intact. [Cleanup receipt](artifacts/2026-09-06-maintain-verify-plate/final-cleanup.json).

Next work: repair the reported product/proof blockers under their owning task, obtain a matching strict pass, then replay the twelve gated targets and the named candidate harness paths. No successful measurement or publication is claimed for them. Suggested separately authorized sync: **Verify Plate** to `/Users/zbeyens/git/plate`; these Plate-specific mechanics do not require a Dotai behavior change.
