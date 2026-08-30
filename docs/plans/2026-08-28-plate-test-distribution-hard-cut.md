# Plate test distribution hard cut

Objective:
Hard-cut Plate test infrastructure into one honest `@platejs/test` package with
a Node-safe root and explicit React, browser, Playwright, and proof entrypoints.
Delete `platejs/testing` and `@platejs/browser`, migrate every live consumer,
and prove package, runtime, SSR, browser, docs, tooling, and cache correctness.

Flow mode:
- new package

Goal plan:
docs/plans/2026-08-28-plate-test-distribution-hard-cut.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `deep`: package identity, public exports, optional peer reachability, CI,
  Turbo invalidation, React/SSR safety, docs, and skills all change together.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Exact stale-name and forbidden-import searches across live source, docs,
  tooling, manifests, CI, and generated skill mirrors.
- `@platejs/test` typecheck/tests plus packed Node import probes for the root,
  `/proof`, `/react`, `/browser`, and `/playwright` with only each entrypoint's
  declared dependency closure installed.
- Plate/Plite release-artifact and package-boundary checks, Turbo task/cache
  contract checks, scoped lint, docs typecheck, Next SSR route proof, and the
  focused browser lanes reached by changed consumers.

Constraints:
- The user accepted and invoked the exact hard cut with “go full cut”; execution
  is authorized in this checkout.
- No public compatibility aliases or runtime shims.
- Preserve runtime names `platejs`, `platejs/static`, and `platejs/react`.
- Only `packages/platejs` may import `plitejs`; `@platejs/test` consumes Plate's
  public facade only.
- The new package root must be safe in plain Node without React or browser
  globals. Optional peers belong only behind their honest entrypoints.
- Do not keep `@platejs/test/core`; proof contracts move to `/proof`.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: package/folder rename, exports, source moves, Plate test helpers,
  every live import, manifests/lockfile, Turbo/CI/scripts, current docs, Vision,
  affected source rules and generated skills, changeset, and runtime proof.
- Source owners: `packages/test`, `packages/platejs`, `packages/plitejs`,
  `apps/plite`, `apps/www`, `tooling`, root package/Turbo/Oxlint config,
  current docs/Vision/rules, and the lockfile.
- Non-goals: renaming the `platejs/static` and `platejs/react` runtime APIs;
  redesigning Plite's own test-only API; rewriting generated templates.
- Direct Plite boundary owners: `packages/platejs` only. Package-boundary lint
  and release-artifact checks must reject `plitejs` imports everywhere else.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the packed entrypoint graph cannot isolate a declared optional
  peer without changing the accepted API, or required Browser/SSR proof cannot
  run after exhausting the documented local reinstall path.

Plate Plan state:
- status: done
- phase: prove and hand off
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | passed | Constraints, boundaries, verification surface, and accepted five-entrypoint table above |
| Active goal and plan verified | passed | Active goal created for this exact hard cut; this plan is its durable artifact |
| Current owners read | passed | Audited the retired package and Plate testing facade, every public export, live consumer, release inventory, CI route, docs owner, and generated skill mirror |
| Best API target resolved | passed | Accepted maximum cut: one `@platejs/test` package; no compatibility entrypoint or old package |
| Mode and execution boundary resolved | passed | Deep execution authorized by “go full cut” |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and the package-private Plate test adapter have complete adoption and deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | passed | Resolve every readiness condition | Five entrypoints, atomic adoption, dependency closure, CI, docs, browser, and packed artifacts all pass |
| Fresh source evidence | passed | Recheck decision-changing current claims | Final exact scans find no retired identity, relative Plate testing import, retired directory, or forbidden distributable Plite import |
| Best API review | passed | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | One `@platejs/test` distribution with explicit environment subpaths; no compatibility alias and no `/core` |
| Conditional risk and adoption | passed | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Node, SSR, browser, registry, docs, release, optional-peer, Turbo, Oxlint, Vision, and skill work complete; issue provenance does not apply to this user-directed cut |
| Verification recorded | passed | Record fresh planning proof and exact execution gates | See Verification evidence and Proof matrix |
| Handoff prepared | passed | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff prepared below |
| P2 autoreview | yes | Run the feature checker review gate or record a repository-law exception | Current branch is `next`, where repository law forbids running `autoreview`; source, artifact, CI, SSR, browser, and deterministic plan gates replace it |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-plate-test-distribution-hard-cut.md` | autogoal and Plate feature deterministic checkers pass on the final plan |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | passed | Owners, consumers, package graph, docs, CI, release, and skills inventoried | Decide |
| Decide | passed | Accepted five-entrypoint shape and deletion contract implemented | Prove and hand off |
| Prove and hand off | passed | Source, packed, SSR, browser, docs, Turbo, Oxlint, CI, and stale-name gates pass | User review |

Decision brief:
- outcome: Plate has one public testing distribution rather than a browser
  harness plus a React-leaking runtime testing subpath.
- chosen shape: `@platejs/test`, `@platejs/test/react`,
  `@platejs/test/browser`, `@platejs/test/playwright`, and
  `@platejs/test/proof`.
- strongest rejected alternative: keep `platejs/testing` for fixtures and
  merely rename `@platejs/browser`; rejected because it preserves split
  ownership and keeps React reachable from Plate's runtime package.
- consequence: all live imports break and migrate atomically; consumers install
  the optional peers required by the explicit subpath they import.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| npm package | `@platejs/browser` | `@platejs/test` | `packages/test` | Testing is the independent job; browser is one environment | Rename folder, manifest, dependencies, lockfile, scripts, and consumers | Pack/import/test | Stale package identity | accepted |
| headless fixtures | `platejs/testing` | `@platejs/test` | `packages/test` root | Root can be plain-Node safe and framework-specific | Move/rebuild through public Plate APIs; delete old export | Node import and headless tests | Accidental React/DOM reachability | accepted |
| React harness | `platejs/testing` mixed with root fixtures | `@platejs/test/react` | `packages/test` | React is optional and must be explicit | Move `PlateTest` and consumers | packed React import + SSR/type tests | internal Plate dependency leaks | accepted |
| DOM inspection | `@platejs/browser/browser` | `@platejs/test/browser` | `packages/test` | Browser is one honest environment | Mechanical import migration | browser unit/browser lane | Node root leakage | accepted |
| Playwright harness | `@platejs/browser/playwright` | `@platejs/test/playwright` | `packages/test` | Playwright remains an optional peer | Mechanical import migration | packed optional-peer closure + browser tests | sibling entrypoint leakage | accepted |
| proof contracts | `@platejs/browser/core` | `@platejs/test/proof` | `packages/test` | Contracts are environment-neutral proof APIs | Mechanical import migration, delete `/core` | Node import + release checks | browser imports in proof graph | accepted |
| runtime names | `platejs`, `/static`, `/react` | unchanged | `packages/platejs` | Names already state headless, static React, and live React jobs | No migration | root/static/react probes | scope creep | accepted |

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | `best-api` + `plate-plan` | `@platejs/test`, `/react`, `/browser`, `/playwright`, `/proof`; old package/subpath deleted | Plate test authors | public contract, stale-path audit, packed imports | complete |
| Package | yes | `packages/test` | [Package file evidence](#package-file-evidence) | apps, package tests, external consumers | typecheck, tests, build, manifest and artifact checks | complete |
| React adapter | yes | `packages/test/src/react` | `PlateTest`, `createPlateTestEditor` | React unit tests | React type/test and Node SSR import | complete |
| Registry UI | yes | `apps/www/src/registry` | migrated test-fixture imports with unchanged product UI | copied registry consumers | registry build and representative routes | complete |
| Composition | yes | `packages/test/src/react` + registry examples | shared React test-editor composition through `PlateTest` | package and registry test authors | React tests, registry build, SSR routes | complete |
| Registry metadata/examples | yes | `apps/www` | fixture imports and generated registry payloads | docs examples | registry build/source check and representative route | complete |
| Docs | yes | package README + current Plate/Plite guides | install/import/current ownership teaching | test authors | docs check and route load | complete |
| Release artifacts | yes | changeset + release tooling | new package identity, old package removal, packed export closure | maintainers and npm consumers | changeset/manifest/release-artifact checks | complete |
| Proof | yes | package/tooling/apps | Node, React, DOM, Playwright, proof, Turbo, Oxlint, SSR/browser receipts | maintainers | commands in Proof matrix | complete |
| Plate Next attestation | yes | Plate Next v119 | [Package file evidence](#package-file-evidence) | maintainers | version validation, status, exact package fingerprint | complete |
| Review/handoff | yes | root | branch-policy review disposition, goal check, concise final evidence | user | plan checkers and recorded branch-policy exception | complete |

Package file evidence:

- Package: test
- Manifest command / file count: `node .agents/rules/plate-next/scripts/version.mjs fingerprint test` (90 files).
- Package fingerprint: sha256:e1e76d6b738fd753f2d2f706840d24758b9a0a9def0eff380141288e6ca2f1a5

- File: `packages/test/package.json`
- File: `packages/test/src/browser/index.ts`
- File: `packages/test/src/browser/selection.ts`
- File: `packages/test/src/browser/zero-width.ts`
- File: `packages/test/src/createDataTransfer.ts`
- File: `packages/test/src/index.ts`
- File: `packages/test/src/internal/getDefined.ts`
- File: `packages/test/src/jsx.ts`
- File: `packages/test/src/playwright/artifacts.ts`
- File: `packages/test/src/playwright/caret-visibility.ts`
- File: `packages/test/src/playwright/clipboard.ts`
- File: `packages/test/src/playwright/constants.ts`
- File: `packages/test/src/playwright/displayed-selection.ts`
- File: `packages/test/src/playwright/dom-locators.ts`
- File: `packages/test/src/playwright/dom-shape.ts`
- File: `packages/test/src/playwright/dom-text-actions.ts`
- File: `packages/test/src/playwright/dom-text.ts`
- File: `packages/test/src/playwright/example-route.ts`
- File: `packages/test/src/playwright/handle.ts`
- File: `packages/test/src/playwright/harness-assertions.ts`
- File: `packages/test/src/playwright/harness-input.ts`
- File: `packages/test/src/playwright/harness-scenario.ts`
- File: `packages/test/src/playwright/harness.ts`
- File: `packages/test/src/playwright/ime.ts`
- File: `packages/test/src/playwright/index.ts`
- File: `packages/test/src/playwright/interaction-performance.ts`
- File: `packages/test/src/playwright/keyboard.ts`
- File: `packages/test/src/playwright/materialization.ts`
- File: `packages/test/src/playwright/native-event-trace.ts`
- File: `packages/test/src/playwright/ready.ts`
- File: `packages/test/src/playwright/render-profiler.ts`
- File: `packages/test/src/playwright/render-state.ts`
- File: `packages/test/src/playwright/root-focus.ts`
- File: `packages/test/src/playwright/runtime-errors.ts`
- File: `packages/test/src/playwright/scenario-conformance.ts`
- File: `packages/test/src/playwright/scenario-destructive.ts`
- File: `packages/test/src/playwright/scenario-kernel-trace.ts`
- File: `packages/test/src/playwright/scenario-replay.ts`
- File: `packages/test/src/playwright/scenario-warm.ts`
- File: `packages/test/src/playwright/scenario.ts`
- File: `packages/test/src/playwright/selection-actions.ts`
- File: `packages/test/src/playwright/selection-anchors.ts`
- File: `packages/test/src/playwright/selection-geometry.ts`
- File: `packages/test/src/playwright/selection-handle.ts`
- File: `packages/test/src/playwright/selection-snapshots.ts`
- File: `packages/test/src/playwright/selectionContract.ts`
- File: `packages/test/src/playwright/surface.ts`
- File: `packages/test/src/playwright/types.ts`
- File: `packages/test/src/proof/feature-contracts.ts`
- File: `packages/test/src/proof/first-party-browser-contracts.ts`
- File: `packages/test/src/proof/index.ts`
- File: `packages/test/src/proof/mobile-transport-proof.ts`
- File: `packages/test/src/proof/proof.ts`
- File: `packages/test/src/proof/raw-mobile-proof.ts`
- File: `packages/test/src/proof/selection.ts`
- File: `packages/test/src/react/PlateTest.tsx`
- File: `packages/test/src/react/createPlateTestEditor.ts`
- File: `packages/test/src/react/index.ts`
- File: `packages/test/test/browser/selection.browser.test.ts`
- File: `packages/test/test/browser/zero-width.browser.test.ts`
- File: `packages/test/test/node/jsx.test.ts`
- File: `packages/test/test/proof/keyboard-oracle-audit.test.ts`
- File: `packages/test/test/proof/mobile-device-proof-command.test.ts`
- File: `packages/test/test/proof/package-scripts.test.ts`
- File: `packages/test/test/proof/playwright-attachments.test.ts`
- File: `packages/test/test/proof/playwright-clipboard.test.ts`
- File: `packages/test/test/proof/playwright-ime.test.ts`
- File: `packages/test/test/proof/playwright-native-event-trace.test.ts`
- File: `packages/test/test/proof/playwright-runtime-errors.test.ts`
- File: `packages/test/test/proof/playwright-selection.test.ts`
- File: `packages/test/test/proof/proof.test.ts`
- File: `packages/test/test/proof/raw-mobile-proof.test.ts`
- File: `packages/test/test/proof/scenario.test.ts`
- File: `packages/test/test/proof/selection.test.ts`
- File: `packages/test/test/public-api-contract.tsx`
- File: `packages/test/test/react/PlateTest.test.tsx`
- File: `packages/test/test/types/scenario-types.ts`
- File: `packages/test/tsconfig.build.json`
- File: `packages/test/tsconfig.entrypoints/browser.json`
- File: `packages/test/tsconfig.entrypoints/contracts.json`
- File: `packages/test/tsconfig.entrypoints/playwright.json`
- File: `packages/test/tsconfig.entrypoints/proof.json`
- File: `packages/test/tsconfig.entrypoints/react.json`
- File: `packages/test/tsconfig.entrypoints/root.json`
- File: `packages/test/tsconfig.json`
- File: `packages/test/tsconfig.public-api.json`
- File: `packages/test/tsconfig.test.json`
- File: `packages/test/tsdown.config.mts`
- File: `packages/test/turbo.json`
- File: `packages/test/vitest.config.ts`

- [x] `packages/test/package.json` — score: 100 — verdict: keep-in-plate — owner: @platejs/test manifest — evidence: exports peers scripts dependency audit and packed closure pass — next: none.
- [x] `packages/test/src/browser/index.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/browser — evidence: source audit browser unit tests Chromium smoke and packed closure pass — next: none.
- [x] `packages/test/src/browser/selection.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/browser — evidence: source audit browser unit tests Chromium smoke and packed closure pass — next: none.
- [x] `packages/test/src/browser/zero-width.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/browser — evidence: source audit browser unit tests Chromium smoke and packed closure pass — next: none.
- [x] `packages/test/src/createDataTransfer.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/test — evidence: source audit Node typecheck unit tests and packed root closure pass — next: none.
- [x] `packages/test/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/test — evidence: source audit Node typecheck unit tests and packed root closure pass — next: none.
- [x] `packages/test/src/internal/getDefined.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/test — evidence: source audit Node typecheck unit tests and packed root closure pass — next: none.
- [x] `packages/test/src/jsx.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/test — evidence: source audit Node typecheck unit tests and packed root closure pass — next: none.
- [x] `packages/test/src/playwright/artifacts.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/caret-visibility.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/clipboard.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/constants.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/displayed-selection.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/dom-locators.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/dom-shape.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/dom-text-actions.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/dom-text.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/example-route.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/handle.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/harness-assertions.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/harness-input.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/harness-scenario.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/harness.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/ime.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/index.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/interaction-performance.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/keyboard.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/materialization.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/native-event-trace.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/ready.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/render-profiler.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/render-state.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/root-focus.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/runtime-errors.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/scenario-conformance.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/scenario-destructive.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/scenario-kernel-trace.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/scenario-replay.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/scenario-warm.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/scenario.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/selection-actions.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/selection-anchors.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/selection-geometry.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/selection-handle.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/selection-snapshots.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/selectionContract.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/surface.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/playwright/types.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/playwright — evidence: source audit contract tests Chromium smoke and packed optional-peer closure pass — next: none.
- [x] `packages/test/src/proof/feature-contracts.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/proof — evidence: source audit Node contracts unit tests and packed Node closure pass — next: none.
- [x] `packages/test/src/proof/first-party-browser-contracts.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/proof — evidence: source audit Node contracts unit tests and packed Node closure pass — next: none.
- [x] `packages/test/src/proof/index.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/proof — evidence: source audit Node contracts unit tests and packed Node closure pass — next: none.
- [x] `packages/test/src/proof/mobile-transport-proof.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/proof — evidence: source audit Node contracts unit tests and packed Node closure pass — next: none.
- [x] `packages/test/src/proof/proof.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/proof — evidence: source audit Node contracts unit tests and packed Node closure pass — next: none.
- [x] `packages/test/src/proof/raw-mobile-proof.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/proof — evidence: source audit Node contracts unit tests and packed Node closure pass — next: none.
- [x] `packages/test/src/proof/selection.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/proof — evidence: source audit Node contracts unit tests and packed Node closure pass — next: none.
- [x] `packages/test/src/react/PlateTest.tsx` — score: 100 — verdict: keep-in-plate — owner: @platejs/test/react — evidence: source audit typecheck React tests SSR and packed closure pass — next: none.
- [x] `packages/test/src/react/createPlateTestEditor.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/test/react — evidence: source audit typecheck React tests SSR and packed closure pass — next: none.
- [x] `packages/test/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: @platejs/test/react — evidence: source audit typecheck React tests SSR and packed closure pass — next: none.
- [x] `packages/test/test/browser/selection.browser.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/browser proof suite — evidence: executed browser unit tests and Chromium smoke pass — next: none.
- [x] `packages/test/test/browser/zero-width.browser.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/browser proof suite — evidence: executed browser unit tests and Chromium smoke pass — next: none.
- [x] `packages/test/test/node/jsx.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test root proof suite — evidence: executed Node unit tests and packed root probe pass — next: none.
- [x] `packages/test/test/proof/keyboard-oracle-audit.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/mobile-device-proof-command.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/package-scripts.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/playwright-attachments.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/playwright-clipboard.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/playwright-ime.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/playwright-native-event-trace.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/playwright-runtime-errors.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/playwright-selection.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/proof.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/raw-mobile-proof.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/scenario.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/proof/selection.test.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test proof suites — evidence: executed Node contract tests and release-artifact proof pass — next: none.
- [x] `packages/test/test/public-api-contract.tsx` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test public type proof — evidence: public API and entrypoint typecheck contracts pass — next: none.
- [x] `packages/test/test/react/PlateTest.test.tsx` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test/react proof suite — evidence: executed React tests typecheck and SSR proof pass — next: none.
- [x] `packages/test/test/types/scenario-types.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test public type proof — evidence: public API and entrypoint typecheck contracts pass — next: none.
- [x] `packages/test/tsconfig.build.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.entrypoints/browser.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.entrypoints/contracts.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.entrypoints/playwright.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.entrypoints/proof.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.entrypoints/react.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.entrypoints/root.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.public-api.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsconfig.test.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/tsdown.config.mts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/turbo.json` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.
- [x] `packages/test/vitest.config.ts` — score: 100 — verdict: justify-new-proof-tooling — owner: @platejs/test build tooling — evidence: generated task audit typecheck tests build and packed artifact checks pass — next: none.

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | `@platejs/test` declares optional/required peers by entrypoint, with `devDependencies.platejs: workspace:^` and no normal `platejs` dependency | `packages/test/package.json`; `pnpm test:manifests` passes |
| Plite ownership | `packages/test` imports only public `platejs` entrypoints; only `packages/platejs` may import `plitejs` among Plate distributions | Oxlint DAG, manifest contract, and exact package-source audit pass |
| external dependency ownership | root requires Plate plus `is-hotkey`; React/Testing Library and Playwright are optional peers owned by `/react` and `/playwright` | manifest, DAG, and 34 exact packed optional-peer closures pass |
| entrypoint direction | root is Node-safe; `/react`, `/browser`, `/playwright`, and `/proof` are explicit siblings; Playwright alone depends on browser and proof | generated Turbo DAG, typecheck, build, and packed consumers pass |
| Oxlint coverage | generated DAG rule applies to `packages/test/src`; wider rule forbids direct `plitejs` imports | scoped lint and exact source audit pass |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Contract and inventory | root | Exact exports, symbols, consumers, peers, tasks, docs, rules | Accepted target | Complete bounded manifest and migration map | `rg`, manifests, export graph |
| 2. Package hard cut | `packages/test` + `packages/platejs` | Rename package, construct five entrypoints, move `PlateTest`, delete old package/subpath | Slice 1 | New source and exports compile with no lower-distribution import | typecheck, entrypoint tests, forbidden-import lint |
| 3. Atomic adoption | all live consumers | Imports, dependencies, scripts, CI, Turbo, release verification, docs | Slice 2 | Zero live old identities and honest dependency declarations | stale searches, Turbo dry-run, release checks |
| 4. Doctrine and release | Vision/rules/docs | Best-API repair, affected skill teaching, regeneration, changeset | Slice 3 | Source/mirror parity and current docs only | `pnpm install`, skill audits, changeset checks |
| 5. Runtime proof | package/apps | Node, React SSR, Next SSR, browser, package artifact closure | Slice 4 | All applicable gates pass or exact external blocker recorded | focused commands and Browser receipts |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Root and `/proof` do not load React, DOM, Playwright, or Plite | export/source graph | packed plain-Node executable consumer and source/import assertions | passed |
| `/react` is SSR-safe and isolated | explicit source owner and optional peers | packed React DOM server render plus Next server-side and Plate-to-HTML routes | passed |
| `/browser` and `/playwright` are explicit environment boundaries | entrypoint graph | package tests, exact optional-peer closures, and Chromium smoke | passed |
| Old package and `platejs/testing` are gone | exact migration ledger | zero stale names, escaped names, relative Plate testing imports, retired directories, and package inventories | passed |
| Turbo remains correctly invalidated without package sprawl | task/input graph | generated-state check, exact mutation/reverse-closure test, affected CI lane | passed |
| Only `packages/platejs` imports `plitejs` among Plate distributions | Oxlint/package boundary rules | scoped lint, manifest contract, and exact `packages/test`/`packages/cli` source audit | passed |

Conditional evidence:
- High-risk scenarios: packed optional-peer closure, Node import safety, SSR,
  browser globals, declaration leakage, Turbo invalidation, and published export
  completeness all apply.
- External research: N/A. The public target is accepted and the implementation
  question is fully answerable from this repository's source and packed proofs.
- Issue/PR provenance: N/A. This is a user-directed local architecture cut.
- Docs/registry/browser/release/behavior-law owners: all applied; current docs,
  generated registry payloads, apps, release checks, and doctrine teach only the
  consolidated distribution.

Findings:
- The deleted `platejs/testing` facade mixed Plite fixtures, React, and Plate
  internals; the package-private Plate adapter keeps only co-located tests from
  importing Plite directly.
- The former browser package contained browser, Playwright, and environment-free
  proof APIs; the new names make each environment boundary explicit.
- App fixtures and package tests retain their test-authoring behavior through
  the new root and React entrypoints.

Decisions and tradeoffs:
- Optional peer installation friction is accepted. It does not justify an npm
  package boundary; explicit subpaths and packed closure tests own isolation.
- Compatibility aliases are rejected. The old package and old Plate subpath
  disappear in the same change.

Review fixes:
- Packed proof rejected `is-hotkey` as a dishonest optional peer; it is a normal
  dependency because built code reaches it without an optional boundary.
- Packed proof required root `main`, `module`, and `types`; package metadata and
  its contract test now assert the emitted root files.
- `check:plite:dev` found seven Yjs tests importing the deleted relative Plate
  testing owner; they use the package-private test adapter.
- Full contracts found three bare `browser` package inventories and a
  source-first typecheck assertion that omitted `@platejs/test`; all inventories
  now name `test` and the complete entrypoint graph.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Type inference leaked a private editor reference from the moved React helper | 1 | Give the public helper explicit public result types while preserving inferred value/plugin/schema generics | resolved; public contract typecheck passes |
| A `*-contract.ts` production filename was classified as test-only by the entrypoint generator | 1 | Rename the production module instead of weakening the generator rule | resolved as `selectionContract.ts` |
| Packed optional-peer closure reached `is-hotkey` without the declared peer | 1 | Make the reachable runtime dependency normal | resolved; all 34 closures pass |
| `@platejs/test` metadata omitted root `main`, `module`, and `types` | 1 | Point all three fields at the emitted root files | resolved; packed runtime/declaration parity passes |
| Turbo mutation test changed while `pnpm brl` ran concurrently | 1 | Serialize source-mutating proof and rerun after barrel generation | resolved; isolated mutation test passes all 3 rows |
| Full affected lane found relative Plate testing imports and stale bare browser package inventories | 2 | Expand stale audit beyond public specifiers and migrate every internal inventory | resolved; final affected lane and exact scans pass |
| Shared Core gate found a stale `media_embed` MDX fallback in consolidated Plate | 1 | Delete the dual codec identity and prove the application schema type round-trip | resolved; focused media Markdown test, schema adoption audit, and Plate typecheck pass |
| Shared Core gate sent `@platejs/test` browser and React suites through raw Bun | 1 | Register the package as an entrypoint-graph owner and add the runner contract | resolved; `@platejs/test` uses its 21-task environment-aware graph and `pnpm check:core` passes |
| Production registry build left the separate development registry payloads stale | 1 | Run both owning production and development registry generators, then scan generated JSON | resolved; `build:registry` and `rd` complete and exact generated-artifact scan is clean |

Verification evidence:
- `pnpm --filter @platejs/test lint:fix`, `typecheck`, and `test`: passed;
  18 typecheck and 21 test tasks.
- `pnpm --filter platejs lint:fix` and `typecheck`: passed; 36 typecheck tasks.
- Focused Yjs partitions: 211 headless and 11 React tests passed.
- `pnpm check:plite:dev`: passed; 46 source-first typecheck tasks, Plite app
  typecheck, www package-integration typecheck, 69 package test tasks, 196 Node
  contracts, 25 benchmark contracts, 44 benchmark targets, public types, and 3
  Chromium smoke tests.
- `pnpm plite:release:packages`: passed; 4 packed packages, 51 public subpaths,
  runtime/declaration parity, NodeNext and Bundler declarations, Node runtime,
  package direction, DCE, and 34 exact optional-peer closures.
- `pnpm --filter www build:registry`, `rd`, `check:docs`, and `typecheck`:
  passed, including production/development payloads, registry source, and
  package-integration checks.
- Browser Plugin receipts: `/docs/unit-testing`, `/docs/browser`,
  `/docs/examples/server-side`, and `/docs/examples/plate-to-html` rendered with
  no console errors.
- `pnpm entrypoint:turbo:check`, `pnpm test:manifests`, `pnpm brl`, and Plate
  Next v119 validation: passed.
- `pnpm check:core`: passed after enrolling `@platejs/test`; the gate ran
  declaration, schema, React Compiler, docs, type, lint, entrypoint-test, and
  CLI suites through their owning environments.
- Focused Media Embed Markdown proof: 7 tests pass, including configured schema
  identity round-trip; the full 4,214-file schema adoption audit passes.
- Final exact scan: zero retired package identities, escaped identities,
  relative Plate testing imports, retired directories, stale package
  inventories, or forbidden Plite imports in `packages/test` and `packages/cli`.
- P1 `autoreview`: not run because the current branch is `next`; repository law
  explicitly forbids `autoreview` on `next`.

Final handoff prepared:
- Ownership and target API: `@platejs/test` owns headless, React, browser,
  Playwright, and proof testing APIs through five explicit entrypoints.
- Public breaks and adoption: `@platejs/browser`, `platejs/testing`, and
  `@platejs/test/core` have no compatibility paths; every live consumer uses the
  new package.
- Applicable runtime/package/docs/browser decisions: Node-safe root, SSR-safe
  React subpath, explicit browser/Playwright boundaries, optional peer metadata,
  current docs, CI, Turbo, Oxlint, Vision, rules, generated skills, and changeset
  are complete.
- Proof and execution risks: no known remaining release blocker; raw-device proof
  remains an independent claim and is not asserted by this package cut.
- Execution order and user attention: implementation is complete in the current
  checkout; no commit, push, or PR was requested.

Timeline:
- 2026-08-28T19:18:28.335Z Plate Plan created.
- 2026-08-28 Accepted five-entrypoint hard cut captured; execution authorized.
- 2026-08-28 Package, consumers, docs, tooling, CI, doctrine, and release
  artifacts migrated; full affected and packed release proof passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove and hand off complete |
| Where am I going? | User review |
| What is the goal? | Replace split Plate test ownership with one isolated `@platejs/test` distribution and remove every old live path. |
| What have I learned? | Public specifier scans are insufficient; package inventories and relative private imports need explicit closure checks. |
| What have I done? | Completed the hard cut and proved the package, entrypoint, dependency, CI, SSR, docs, and browser contracts. |

Open risks:
- Raw-device behavior still requires direct device receipts; browser smoke and
  viewport emulation do not upgrade that claim.
- Consumers of optional React or Playwright entrypoints must install their peers;
  this is the accepted package contract, not a hidden runtime fallback.
