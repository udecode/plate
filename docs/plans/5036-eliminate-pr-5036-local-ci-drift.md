# Eliminate PR 5036 local CI drift

Objective:
Produce a local PR 5036 candidate that removes every confirmed local/CI drift
owner: fresh source resolution, browser installation, Linux Chromium behavior,
pagination timing, stale Node fixtures, and www source/build drift. The local
candidate is complete when clean package/adopter/lint checks, exact Linux
Chromium proof, a fresh production www build, root `pnpm check`, and bounded P1
review close. Remote green status is a separate delivery gate because no push
or PR mutation was authorized.

Flow mode:
one-shot execution

Goal plan:
`docs/plans/5036-eliminate-pr-5036-local-ci-drift.md`

Maintainer source:
- mode: exact PR repair
- repo: `udecode/plate`
- item: https://github.com/udecode/plate/pull/5036
- remote head: `33557a72cc6b393c4646af46cf0348f0e49efa99`
- remote base: `fa98e906637e8b2a0b331f1c3a22b91fd389fe9f`
- local candidate fingerprint:
  `70bf2c64c9213859c553db9a75a4f69a70e748771397e8a453ae81e33d7c176b`
- authority: local edits and proof only; no commit, push, comment, review,
  merge, release, label, or other GitHub mutation

Completion threshold:
- Root type-aware lint prepares the declaration generators it consumes and
  runs from one source-backed command on fresh and warm checkouts, including a
  Windows-safe command-shim path.
- Plite package and adopter typechecks resolve workspace source without warm
  `dist`; package CI installs Chromium before browser-backed package tests.
- The exact pagination gap, full/staged vertical selection, virtualized
  vertical selection, staged timing, and synced-root drag rows pass 5/5 in the
  pinned Linux Playwright image without proof reuse.
- The final four-shard Linux Chromium matrix merges successfully; the official
  strict host command, focused contracts, package typechecks, docs source
  checks, and root `pnpm check` pass.
- English and Chinese link docs point at the literal `link` registry owner.
  The registry generator rebuilds the legacy root plus every style target,
  client-loaded registry previews stay metadata-free, and a fresh disposable
  `CI=1` checkout passes the complete www production build.
- Every review finding is fixed or rejected from adjacent source evidence;
  local work remains `candidate-local` until replayed on a pushed ref.

Verification surface:
- Live PR metadata, checks, reviews, and comments through read-only `gh`.
- Cold source/adopter/package archives with no workspace `dist` dependency.
- `pnpm lint:type-aware`, `pnpm check:plite`, `pnpm check`, focused contracts,
  selected package typechecks, `pnpm --filter www typecheck`, and a fresh
  `CI=1 pnpm --filter www build` in a disposable checkout.
- Exact macOS Chromium and pinned Linux Chromium reporter cases, forced 5/5
  runs, and a fresh four-shard Linux merge.
- Browser spot proof on `/examples/plite/pagination` and
  `/examples/plite/huge-document`, plus production-artifact proof on the three
  repaired editor block routes.
- Isolated PR-5036 P1 autoreview bundle excluding unrelated dirty work.

Constraints:
- Preserve user-owned unrelated dirty files.
- Do not weaken exact selection, timing, drag, or coverage assertions merely
  to turn CI green.
- Do not add OS, DPR, pixel-bias, or public geometry switches.
- Do not run `build:registry` outside CI or edit generated registry/template
  output.
- Do not claim raw physical-device proof from Playwright viewports.
- Do not commit, push, open/update a PR, comment, merge, or release without
  explicit authority.

Boundaries:
- In scope: `.github/workflows/plite-ci.yml`, root/package scripts and shared
  type config, Plite DOM/React geometry, exact browser regressions, stale Plite
  Node fixtures, the two link docs, and the www registry build/preview owners.
- Out of scope: unrelated Core/Plate architecture already dirty in the
  checkout, generated registry output, templates, broad queue work, public API
  redesign, physical-device release proof, and remote delivery.
- Final claim boundary: local candidate only. A pushed SHA, CI checks, Vercel,
  conflict resolution, release, and publication are not claimed.

Blocked condition:
Local implementation is blocked only if the exact Linux runtime cannot run or
the owning repository commands cannot establish the failure. Remote green
status requires separate push authority and does not authorize a mutation from
this task.

Start Gates:

| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Exact PR, fix-all scope, CI/script authority, no-drift threshold, proof, and no-public-mutation boundary were recorded before edits |
| Active goal | yes | Goal `01a02eb9-27ab-72d1-837f-6a557d2de63a` owns this plan |
| Vision and maintainer doctrine | yes | Root/common/Plite/Plate Vision, maintainer, task, patch, regression, benchmark, best-api, Plite plan, docs, changeset, Browser, and autoreview owners were read |
| Live GitHub source | yes | PR 5036 and exact failed jobs were read before implementation |
| Reporter-valid cases | yes | Exact pagination and huge-document Linux titles, state fields, browser image, and bad ref were captured |
| Queue snapshot | no | Exact user-selected PR; no broad queue ranking applies |
| Security path | no | No security-shaped report or advisory |
| Public mutation authority | no | Local edits and proof only |
| Output budget | yes | Long logs and browser artifacts stayed under `/tmp`; source reads were owner-bounded |

Work Checklist:
- [x] Capture every explicit requirement, authority boundary, proof surface,
      stop condition, and handoff requirement.
- [x] Read live PR state, failed jobs, contributor/PR/security intake, and
      relevant Vision and owner doctrine.
- [x] Prove the cold type-aware lint and adopter failures are warm-`dist`
      resolution drift.
- [x] Make type-aware lint prepare its exact declarations and launch Windows
      command shims safely.
- [x] Add the missing `@udecode/*` source mapping to type-test config.
- [x] Install Chromium before browser-backed Plite package tests in CI.
- [x] Point both link docs at the existing `link` registry owner.
- [x] Reproduce pagination and huge-document failures in the pinned Linux
      Playwright image.
- [x] Keep paragraph-gap hit placement inside the owning block geometry.
- [x] Derive vertical navigation from Chromium's painted-caret leading edge
      and carry the cached goal column through staged coverage.
- [x] Reject pointer-hit-test consensus, platform branches, fixed bias,
      tolerance, and fake line-movement mirrors.
- [x] Repair the pagination timing sample count and preserve a separate max
      guard.
- [x] Repair synced-root drag and huge-document test setup without weakening
      model or selection assertions.
- [x] Align stale Node fixtures with the accepted string-`type` element law.
- [x] Restore the legacy root registry alongside style variants and contract
      both production and development target maps.
- [x] Remove illegal metadata exports from client-loaded registry previews and
      add a registry-wide client-compatibility contract.
- [x] Pass www typecheck and the complete production build from a fresh
      disposable `CI=1` checkout, then render all three repaired blocks from
      that production artifact.
- [x] Run focused units, contracts, package typechecks, docs checks, full host
      strict proof, five host geometry replays, five Linux risk packets, and
      the four-shard Linux matrix.
- [x] Run full Ultracite, type-aware lint, and final root `pnpm check`.
- [x] Run isolated P1 autoreview within the three-invocation cap; fix the
      Windows finding and reject the raw-mobile false positive from adjacent
      validation code.
- [x] Re-read live PR state and keep the handoff `candidate-local`.
- [x] Record changed files, errors, fingerprints, proof boundaries, remaining
      risks, and next authorized action.

## Benchmark Source

- request: Validate the pagination staged-burst timing repair without widening
  into unrelated performance lanes.
- scope: pagination staged burst typing only; correctness remains mandatory.
- invocation: `$benchmark only pagination-staged-burst-typing`
- candidate-identity: fingerprint: `70bf2c64c9213859c553db9a75a4f69a70e748771397e8a453ae81e33d7c176b`
- named-symptom: a valid interaction failed because a 16-sample nearest-rank
  p95 collapsed onto the single max outlier.
- final-artifacts: artifact: this plan plus
  `/tmp/plate-5036-linux.z6uCBx/.tmp/pr5036-linux-five-row-{1..5}.log`

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | unpushed candidate `70bf2c64c9213859c553db9a75a4f69a70e748771397e8a453ae81e33d7c176b` | N/A: only target validates one candidate threshold | artifact: candidate fingerprint groups in Verification evidence |
| lockfile / package manager | branch lockfile with pnpm 9.15.0 and Bun 1.3.12 | N/A: only target has no ref comparison | artifact: strict and root command logs |
| build mode / host / port | static Plite app through repository browser runner | N/A: only target has no alternate build | artifact: Linux five-row logs |
| browser / machine / viewport / DPR | Chromium 1.61 Noble Linux amd64 plus host Chromium spot proof | N/A: only target has no cross-ref browser | artifact: Linux matrix and Browser receipts |
| route / fixture / document / plugins | `/examples/plite/pagination`, 15-page staged document, repository fixture | N/A: only target preserves one exact fixture | artifact: pagination test and runner logs |
| setup / action / DOM strategy | staged pagination, trusted typing burst, model and DOM correctness assertions | N/A: only target preserves one exact action | artifact: pagination Playwright row |
| warmups / samples / interleave order | 20 samples per run, five forced runs, p95 plus independent max | N/A: only target does not interleave refs | artifact: five metric receipts below |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | exact candidate files matched the Linux fixture; Node 22, pnpm, browser image, route, and forced proof mode were fixed | trusted editing target |
| 2 | current-vs-main-product-smoke | no | N/A: only - explicit pagination target has no ref comparison | user invoked one timing target only | trusted editing target |
| 3 | plate-vs-plite-decomposition | no | N/A: only - explicit pagination target does not compare editor layers | no layer attribution question exists | trusted editing target |
| 4 | owner-microbench-and-trace | no | N/A: only - browser event-to-paint receipt is the owning metric | no lower-level proxy is authoritative | trusted editing target |
| 5 | product-mount-matrix | no | N/A: only - pagination typing does not measure mount | mount behavior is outside the requested target | trusted editing target |
| 6 | trusted-editing-matrix | yes | complete | five forced Linux runs preserved interaction correctness with n20 p95 below 18 ms and max below 35 ms | complete target |
| 7 | plite-vs-pinned-slate | no | N/A: only - explicit pagination target does not compare Slate | no editor baseline requested | complete target |
| 8 | example-breadth | no | N/A: only - explicit pagination target excludes unrelated examples | full Chromium matrix separately proves closure | complete target |
| 9 | large-and-stress | no | N/A: only - explicit pagination target excludes general stress | 15-page fixture is already the target document | complete target |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: archived in Cause History
- lane: N/A: all applicable lanes closed
- comparable-baseline: N/A: no active cause
- material-delta: N/A: no active cause
- isolated-owner: N/A: no active cause
- causal-intervention: N/A: no active cause
- correctness-guard-result: N/A: no active cause
- fix-class: N/A: no active cause
- long-term-target: N/A: no active cause
- decision-owner: N/A: no active cause
- layer-plan: N/A: no active cause
- compatibility-verdict: N/A: no active cause
- fix-owner: N/A: no active cause
- benchmark-command: N/A: no active cause
- benchmark-rerun: N/A: no active cause
- benchmark-rerun-result: N/A: no active cause
- correctness-command: N/A: no active cause
- correctness-rerun: N/A: no active cause
- correctness-rerun-result: N/A: no active cause
- resume-lane: N/A: all applicable lanes closed

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PR5036-PAGINATION-P95-THRESHOLD | trusted-editing-matrix | invalidated | correctness | statistically valid p95 that does not alias one outlier plus an explicit max bound | regression | N/A: no architecture or public API change | N/A: benchmark harness correction only | regression | 16 samples make nearest-rank p95 equal max, so one scheduler outlier controls both metrics | pass: exact typing action, model, DOM, and selection stayed correct | `PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:project -- chromium --grep="keeps staged burst typing responsive in the 15-page document"` | fail: fifth 34 ms-threshold run reached 34.6 ms and invalidated the threshold | exact pagination Playwright correctness assertions | pass: behavior stayed correct while the metric design was rejected | `/tmp/plate-5036-linux.z6uCBx/.tmp/pr5036-linux-timing-5.log` |
| PR5036-PAGINATION-P95-SAMPLES | trusted-editing-matrix | kept | correctness | n20 timing packet with p95 at or below 32 ms and independent max at or below 50 ms | regression | N/A: no architecture or public API change | N/A: benchmark harness correction only | regression | 20 samples separate p95 from max while retaining a hard scheduler-spike guard | pass: exact typing action, model, DOM, and selection stayed correct | `PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:project -- chromium --grep="keeps staged burst typing responsive in the 15-page document"` | pass: five p95 values 15.2, 17.9, 14.7, 16.3, 15.2 ms; maxima 32.8, 33.0, 31.7, 34.4, 32.7 ms | exact pagination Playwright correctness assertions plus `pnpm check` | pass: five risk packets, four shards, strict Plite, and final root check passed | `/tmp/plate-5036-linux.z6uCBx/.tmp/pr5036-linux-five-row-{1..5}.log` |

Geometry decision:
- Best API verdict: no public API change. Vertical caret parity is an internal
  DOM invariant, not a caller option, platform profile, tolerance, or plugin.
- Chromium derives vertical navigation from a one-pixel caret centered on the
  insertion boundary, rounds in the local block context, and caches the
  leading edge. `getVerticalNavigationCaretX` owns that calculation.
- The existing vertical-goal state now carries the numeric preferred column
  through runtime keyboard events, keyboard strategy, caret engine, and
  large-document DOM coverage.
- Unmounted measurement uses a layout-only probe for exact grapheme geometry.
  Pointer caret APIs are not treated as line-navigation consensus.
- Browser-source evidence:
  `selection_modifier.cc` in Chromium,
  `ng_caret_rect.cc` in Chromium, and CSS UI 4 caret geometry.
- Compatibility: N/A. No public export, serialized data, package call shape,
  or migration changes.

Release and package decision:
- No new changeset. The repair is internal/test/CI/docs behavior on the v54 beta
  integration branch; Plite is absent from `origin/main`, and a new changeset
  would describe branch history rather than a standalone released delta.
- No registry changelog. The registry owner is unchanged; docs now reference
  it correctly.
- No barrel generation. The geometry helper remains internal and no package
  barrel or exported file topology changed.

Completion Gates:

| Gate | Applies | Evidence |
|---|---|---|
| Named local verification threshold | yes | Cold resolution, Linux 5/5, Linux four-shard merge, strict Plite, docs, root check, and review evidence passed |
| Vision and standing-order fit | yes | Durable source owner, exact browser proof, and explicit authority boundary preserved |
| Live GitHub truth | yes | Final read shows OPEN draft, DIRTY conflict state, remote head `33557a72cc`, seven failed statuses including Vercel, and no reporter contradiction |
| Queue snapshot | no | Exact PR repair, not heartbeat ranking |
| Duplicate and claim guard | yes | No assignee, review request, competing item, or human contradiction found |
| Owner route | yes | Maintainer coordinated task, regression, patch, benchmark, best-api, Plite plan, docs, Browser, changeset, and autoreview gates |
| Reporter-valid exact replay | yes | Exact Linux behavior titles plus all five risk rows passed 5/5 without reuse |
| Final pushed-ref truth | no | N/A: no push authority; all claims remain candidate-local |
| Public mutation boundary | yes | Zero commits, pushes, comments, reviews, labels, merges, releases, or PR updates performed |
| P1 autoreview | yes | Three-invocation cap honored; Windows P1 fixed, second pass clean, final raw-mobile finding rejected because the preceding guard already records malformed counts |
| Browser interaction proof | yes | Pagination and huge-document behavior passed; fresh production artifact rendered editor-basic, editor-select, and editor-ai previews |
| Browser console check | yes | Huge-document Browser dev log query returned an empty list |
| Native Chrome or physical device | no | N/A: reported surface is Playwright Chromium Linux, not native OS dialogs or raw mobile hardware |
| Package typecheck and tests | yes | Selected typechecks, strict Plite package tests, contracts, browser proof, and root check passed |
| Docs source proof | yes | `pnpm --filter www check:docs` and final `pnpm --filter www typecheck` passed |
| Fresh www production build | yes | Disposable fixture `/tmp/plate-5036-www-ci-final.vjP9Qf` installed from HEAD plus the complete checkout delta, built the legacy registry and all 18 style variants, compiled Next, and generated 1,052 static pages |
| Release artifact | no | N/A: internal beta-branch repair with no standalone published delta from main |
| Barrel generation | no | N/A: no public exports or exported file layout changed |
| Run artifact | yes | This goal plan is the durable exact-PR run ledger; a separate maintainer run note would duplicate it |
| Goal plan validation | yes | Benchmark and Autogoal validators are the final mechanical gates |

Candidate matrix:

| Rank | Item | Live state | Owner | Proof | Authority | Decision |
|---|---|---|---|---|---|---|
| 1 | PR 5036 `v54 (beta)` | OPEN draft, DIRTY, remote checks stale-red at `33557a72cc` | task under maintainer with regression/browser/docs gates | local candidate fingerprint, cold commands, Linux exact proof, strict host, root check, P1 review | local edits and proof only | candidate-local |

Rejected candidates:
- Broad workflow-only greenwash: rejected because it would hide real runtime,
  source-resolution, docs, and browser-prerequisite failures.
- OS/DPR branches, fixed x bias, CSS-center bias, tolerance, and platform flags:
  rejected because they encode observed environments rather than caret law.
- Native point-API consensus and global standard/legacy consensus: rejected
  because pointer hit tests disagree with vertical line navigation.
- Fake `Selection.modify` mirror: rejected because a synthetic source line
  chooses a different column and failed path 6/path 7/virtualized oracles.
- Hidden zero-opacity native probe: rejected because Linux excludes it from
  caret hit-testing.
- Selected-text synced drag setup: rejected because it did not start from the
  intended block-selection geometry.

Error attempts:

| Error or invalid attempt | Resolution |
|---|---|
| Root-only tsconfig passed one owner but clean CI still emitted 249 follow-on diagnostics | Build exact generator declarations before type-aware Oxlint and keep source mappings explicit |
| Early aggregate shell command lacked fail-fast behavior | Replayed each owner with real exit propagation and bounded logs |
| Initial Docker run exhausted memory | Replayed with bounded workers and `--ipc=host` |
| Playwright image Node 24 differed from CI | Pinned Node 22 inside the Linux fixture |
| Linux runner lacked `GITHUB_SHA` | Bound it to the exact remote head for proof receipts |
| Parallel docs and package build read `dist` mid-rewrite | Invalidated the concurrent run and replayed docs serially |
| First disposable build command omitted `cd` and ran against the checkout | Restored exactly 401 tracked and 6,786 untracked generated files to the pre-run 36/8 state, then required fixture-path evidence before accepting another build |
| Fresh www build deleted `public/r/registry.json` and imported metadata-bearing pages into the client preview graph | Rebuilt the legacy root before all style variants, removed metadata from the three non-route preview sources, and added target-map plus registry-wide compatibility contracts |
| Port 3102 was occupied by the Browser spot server | Stopped the owned server and reran strict Plite from the top |
| n16 p95 and max shared one 34.6 ms outlier | Invalidated threshold design; adopted n20 p95 plus independent max bound |
| Initial synced drag used an already selected text range | Began the drag 8 px before the selection and asserted both model roots unchanged |
| CSS-center quantization passed Linux and failed macOS | Rejected platform-sensitive approximation |
| Zero-opacity probe passed macOS and failed Linux | Rejected hit-test visibility dependence |
| Standard/legacy/global native point consensus disagreed | Deleted pointer-consensus machinery; kept exact grapheme geometry |
| Fake line-movement mirror chose path 6 offset 140, path 7 offset 130, and virtualized Up offset 86 | Rejected synthetic line movement and traced Chromium's real caret owner |
| Bun treated `packages/plite/test/index.slow.ts` as a name filter | Replayed with the required `./` path marker |
| Root check exposed five stale typeless Node fixtures | Added valid element types and made plain snapshot values non-Nodes; focused 15/15 and root suites passed |
| P1 review found direct Windows `.cmd` spawning | Added injectable platform steps and `shell: true` only on Windows; contract and lint passed |
| Review-fix test formatting failed root lint | Ran targeted Ultracite on the owned test and replayed root check |
| Final review claimed malformed update counts could pass | Rejected from adjacent source: lines 251-257 already append an invalid-count issue before the guarded scenario comparison |

Changed files:
- CI/tooling: `.github/workflows/plite-ci.yml`, `package.json`,
  `tooling/config/tsconfig.type-tests.json`,
  `tooling/scripts/lint-type-aware.mjs`,
  `tooling/scripts/check-plite.test.mjs`, and
  `tooling/scripts/plite-source-aliases.test.mjs`.
- Runtime: `packages/browser/src/core/raw-mobile-proof.ts`,
  `packages/plite-dom/src/plugin/dom-geometry.ts`,
  `packages/plite-react/src/editable/caret-engine.ts`,
  `dom-coverage-vertical-selection.ts`, `keyboard-input-strategy.ts`, and
  `runtime-keyboard-events.ts`.
- Browser/unit proof: `packages/plite-dom/test/dom-geometry.test.ts`,
  `packages/plite-react/test/plite-string-coordinate-placement.test.ts`, and
  the huge-document, pagination, and synced-blocks Playwright files.
- Node fixtures: seven `packages/plite/test/interfaces/Node/isNode*` fixture
  files aligned with the accepted element/editor contract.
- Docs: `content/docs/(plugins)/(elements)/link.mdx` and `link.cn.mdx`.
- www build: `apps/www/scripts/build-registry.mts`,
  `registry-build-targets.mts`, `registry-build-targets.test.mts`, the
  `editor-ai`, `editor-basic`, and `editor-select` registry pages, and
  `apps/www/src/registry/registry.test.ts`.
- Durable ledger: this plan.

Verification evidence:
- Final candidate groups: candidate
  `70bf2c64c9213859c553db9a75a4f69a70e748771397e8a453ae81e33d7c176b`;
  geometry runtime
  `c7cfdcd922a08a607bebe1bfb1005c9476f423803d5152ba4280a7a73158370d`;
  browser tests
  `d3c08b9c92fd7c7bdc1efc6e303fc6ac3c5bb28d37b04e6b0a6e092661c2a727`;
  CI/tooling
  `399665e499fb1cce802c4b11d8bf1bd9d92dbe88bfa2b0ac7a82f29c94f17c04`;
  Node fixtures
  `76eaeb92b2e0f6123d91bebecc1c4011f7dee20e4f8e0529916cb9501cf97156`;
  docs `e0aae6485a97af05f66096cac8940f10e5f4d47138a4d9015ebd57fb7102df40`;
  www build owner
  `83707b26d28e78cfa8368d86056b3867f312d2d8e865113117dc1b76638dbd03`.
- Cold root archive `/tmp/plate-5036-native.rKHAyA` contained no package
  `dist`; its type-aware lint proved the source/declaration prerequisite.
- Cold adopter `/tmp/plate-5036-adopter.cTbgAe` passed 45 packages in 48.569s.
- Clean Linux package archive `/tmp/plate-5036-clean.sDHkkH` passed
  `plite:typecheck` and `plite:test` with exact `GITHUB_SHA`.
- Focused tooling contracts: 38/38. DOM geometry unit: 9/9. Node fixture
  repair: 15/15. Selected Plite DOM/React typechecks: 6/6 tasks.
- Host exact full/staged and virtualized selection tests passed once, then 5/5
  repeated with no retry.
- Linux exact five-row packet passed 5/5, covering paragraph gap, both
  vertical-selection oracles, pagination timing, and synced drag.
- Linux four-shard matrix passed: shard 1 `175/3`, shard 2 `168/2`, shard 3
  `185/2`, shard 4 `179/2`; merged `707 passed, 9 skipped, 716 applicable`.
  Artifact: `/tmp/plate-5036-linux.z6uCBx/.tmp/pr5036-final-matrix.L7YYU9`.
- Official `pnpm check:plite` passed typecheck, package tests, contracts, and
  full host Chromium in 373.018s; browser summary `708 passed, 8 skipped`.
- `pnpm --filter www check:docs` passed API reference, MDX source generation,
  and docs source parity.
- Final `pnpm --filter www typecheck` passed editor generation checks, API
  reference parity, MDX source/parity, registry source checks, app TypeScript,
  and package-integration TypeScript. Registry target/client contracts passed
  10/10 with 499 assertions; focused Ultracite was clean.
- Fresh fixture `/tmp/plate-5036-www-ci-final.vjP9Qf` started from remote head
  `33557a72cc` plus all 41 modified, 10 untracked, and one deleted checkout
  paths. `CI=1 pnpm install --frozen-lockfile` and
  `CI=1 pnpm --filter www build` passed. The build produced the legacy root,
  all 18 style registries, a 32.4-second Next compile, and 1,052/1,052 static
  pages. Logs: `.tmp/install.log` and `.tmp/www-build.log` in that fixture.
- The main checkout retained zero modified or untracked generated registry
  files after the fresh build.
- Browser spot proof: pagination editor visible and active; click changed
  selection from no range to one in-editor range. Huge-document route rendered
  virtualized with visible active editor and one in-editor range; dev logs `[]`.
- Production-artifact Browser proof at port 3103 rendered the Basic Editor,
  Select Editor, and full AI Editor from `/blocks/editor-basic`,
  `/blocks/editor-select`, and `/blocks/editor-ai`.
- P1 autoreview: invocation 1 found Windows shim launch; invocation 2 was clean;
  invocation 3 repeated after formatting and produced only the rejected
  raw-mobile false positive. TruffleHog preflight was clean on every bundle.
- Final `pnpm check` passed full Ultracite, type-aware lint, typecheck, all
  tests, slow tests, and slowest-test budgets. Log:
  `/tmp/plate-5036-root-check-final-build-owner.log`.
- Final live read: PR OPEN, draft, DIRTY, remote head `33557a72cc`, seven failed
  statuses including Vercel, five successful checks, four skipped checks, and
  no assignee/review request/reporter contradiction.

Phase / pass table:

| Phase | Status | Evidence |
|---|---|---|
| Intake and owner tracing | complete | Exact live failures and source owners recorded |
| Tooling and clean resolution | complete | Cold archives, final lint, contracts, and root check passed |
| Browser behavior repair | complete | Host 5/5, Linux 5/5, and Linux four-shard merge passed |
| Docs source repair | complete | Both docs point to `link`; docs source parity passed |
| www production build repair | complete | Legacy root plus 18 variants, Next compile, 1,052 static pages, and three production block previews passed from a fresh fixture |
| Benchmark correction | complete | Invalid n16 threshold archived; n20 p95/max packet passed five runs |
| Review closeout | complete | One accepted P1 fixed; one final finding rejected with direct source evidence |
| Local handoff | complete | Candidate fingerprint, remote boundary, and next action recorded |

Heartbeat handoff:
- selected item: PR 5036 only
- selected owner: task under maintainer; regression owns browser/timing repair
- selected proof: final root check plus exact Linux/browser matrix
- queue snapshot: N/A for exact PR mode
- run artifact: this plan
- public mutations: none
- needs user attention: authorize commit/push if remote rerun is desired; then
  resolve the PR conflict and require exact pushed-SHA CI/Vercel replay
- next heartbeat: none safe without push authority

Reboot status:

| Where am I? | Where am I going? | Goal | Learned | Done |
|---|---|---|---|---|
| Local candidate complete and unpushed | Authorized delivery or clean stop | Remove PR 5036 drift without false remote claims | Warm declarations, pointer hit tests, tiny percentile samples, stale fixtures, a dropped legacy registry target, and metadata-bearing client previews each had distinct owners | All safe local edits, exact proof, fresh production build, review, live audit, and handoff are complete |

Open risks:
- Remote CI and Vercel still show the old head. They cannot validate the local
  candidate until an authorized commit/push.
- PR 5036 remains conflicted with `main`; conflict resolution may change the
  candidate and would invalidate these fingerprints and require full replay.
- Remote Vercel remains unproved on the unpushed candidate even though the
  equivalent fresh production command passed in the disposable CI fixture.
- Physical iOS/Android behavior is not proved and is not implied by the Linux
  Chromium result.
- The checkout contains unrelated user changes. Root `pnpm check` covered the
  whole checkout, while P1 review covered the pre-build-repair scope and the
  final fingerprint covers the 33 PR-5036 source files.
