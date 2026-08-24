# enforce root runtime boundaries across split packages

Objective:
Enforce root runtime boundaries on every package exporting `.` and `./react`;
done when inventory coverage and focused artifact/build checks pass; plan
docs/plans/2026-08-23-enforce-root-runtime-boundaries-across-split-packages.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-23-enforce-root-runtime-boundaries-across-split-packages.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- A source-derived inventory of workspace packages whose `exports` contain both
  `.` and `./react`, joined against direct-package build configuration.
- The package artifact verifier tests, the exact configured package builds, and
  a final zero-missing-boundary source audit.

Constraints:
- The user explicitly authorized inventory and implementation in this turn.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve every root and `./react` public export and keep React imports legal
  from React-specific entries.
- Do not commit, push, open a PR, publish, or release.

Boundaries:
- In scope: every workspace package that exports both `.` and `./react`, its
  `tsdown.config.mts`, shared direct-package artifact enforcement, focused
  verifier tests, and source repairs only if a configured root currently
  reaches a forbidden React runtime package.
- Source owners: package manifests and tsdown configs under `packages/**`, plus
  `tooling/config/**` and `tooling/scripts/check-package-build-artifacts*` when
  shared enforcement needs repair.
- Non-goals: packages without both public entries, physical package splits,
  public API changes, dependency removal, docs/registry/UI work, and unrelated
  checkout failures.
- Direct Plite boundary owners: `@platejs/plite-react` is a forbidden root
  runtime dependency; no Plite source change is expected unless build proof
  exposes a literal owner violation.

Output budget strategy:
- Use a bounded manifest script to print only package names, paths, exports, and
  boundary status. Read named configs only. Cap test/build output and avoid
  generated trees, `node_modules`, `tmp`, `.next`, and `.turbo`.

Blocked condition:
- Stop only if a target package cannot use the direct-package verifier, or a
  root runtime violation requires a public shape/package split decision rather
  than a private source-owner repair.

Plate Plan state:
- status: complete
- phase: prove_and_hand_off
- next: final user handoff
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | List every package exporting both `.` and `./react`, then add `runtimeImportBoundaries` to the complete set and verify it. |
| Active goal and plan verified | yes | Active goal names this exact one-shot execution plan. |
| Current owners read | yes | Vision, Plate Vision, accepted Base runtime plan, all target manifests/build routes, shared config wrappers, artifact verifier, and tests read. |
| Best API target resolved | yes | N/A: no reusable call shape changes; preserve `.` and `./react`. |
| Mode and execution boundary resolved | yes | `standard`, one-shot execution authorized by the user's explicit “list all then fix”. |
| Package/API pack selected | yes | `package-api` because package runtime boundaries and builds change. |
| Public surface or package boundary identified | yes | Public exports stay unchanged; only emitted root runtime reachability is enforced. |
| Release artifact path selected | no | N/A: internal build enforcement and tests only; manifests, exports, emitted package behavior, and package APIs are unchanged. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package user-visible delta, so no changeset is required. |
| Barrel/export impact decision recorded | yes | No source export or exported file-layout change; `pnpm brl` is N/A. |

Work Checklist:
- [x] Skill analysis complete: `autogoal` owns the exhaustive goal ledger;
  `plate-plan` owns the accepted runtime/package boundary rollout.
- [x] Capture every explicit requirement: list all `.` + `./react` packages;
  configure all targets; preserve React entry legality; verify complete coverage.
- [x] Produce the complete current package inventory and existing coverage list: 32 targets, 2 explicitly protected, 30 missing the handwritten option.
- [x] Patch every missing target and any shared verifier gap exposed by the inventory: topology inference protects all direct and shared builds without package-local copies.
- [x] Prove the verifier and every changed package build, then audit zero omissions: 17/17 tests, 47/47 build tasks, and `TOTAL=32 PASS=32 MISSING=0 VIOLATIONS=0`.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source and the manifest inventory.
- [x] Reusable public call shape has one `best-api` verdict before target lock: N/A because no public call shape changes.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers: N/A, no public break or bridge.
- [x] Execution slices and focused proof matrix are concrete and complete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix selects no artifact because the delta is internal build enforcement.
- [x] Package/API pack: `.changeset` work is N/A because no changeset is required.
- [x] Package/API pack: registry-only work is N/A because no registry file changes.
- [x] Package/API pack: no-artifact decision records no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut is N/A because public shape is unchanged.
- [x] Package/API pack: package-owned build and verifier proof is recorded.
- [x] Package/API pack: generated barrels and release notes are N/A because no exports or user-visible package behavior changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Inventory, implementation, proof, review, and handoff rows are complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final manifest audit reports 32 targets, 32 passes, zero missing and zero violations. |
| Best API review | no | Record no public shape change | Public package names, exports, entrypoints, and call sites are unchanged. |
| Conditional risk and adoption | yes | Complete triggered runtime/build risks | Direct/shared hooks, ESM, compact ESM, dynamic import AST support, CommonJS, missing chunks, and sibling React entries are covered. |
| Verification recorded | yes | Record fresh execution gates | 17/17 verifier tests; 47/47 build tasks; lint pass; 32/32 audit; diff check pass. |
| Handoff prepared | yes | Prepare ownership, proof, risks, and package list | Recorded below. |
| P1 autoreview | yes | Run with `--max-priority P1` | Invocation 1 fixed CommonJS traversal; invocation 2 replaced formatting-sensitive ESM regex parsing; invocation 3 clean with no P0/P1 findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-enforce-root-runtime-boundaries-across-split-packages.md` | Passed after final evidence was recorded. |
| Public API / package boundary proof | yes | Audit exports and runtime boundary impact | Manifests/exports are unchanged; boundary is inferred from existing `.` and `./react` exports. |
| Release artifact classification | yes | Classify published impact | Internal build/CI enforcement only; no emitted package or API delta. |
| Published package changeset | no | Add only for a published delta | N/A: no published package user-visible delta. |
| Registry changelog | no | Add only for registry work | N/A: no registry file changes. |
| No release artifact | yes | Record exact reason | Internal-only build verifier/config/test change; current package output already satisfies the rule. |
| Package typecheck/build/test | yes | Run owning checks | 17/17 verifier tests and 47/47 build tasks across the 32 targets; no package source changed, so a separate package typecheck adds no owner-specific signal. |
| Barrel/export generation | no | Run only for export/file-layout changes | N/A: no package export or exported source layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | 32 target manifests and three build routes inventoried; only two handwritten configs existed. | Decide |
| Decide | complete | Export-topology inference selected over 30 copied configs; syntax-aware traversal selected over regex. | Prove and hand off |
| Prove and hand off | complete | Tests, 32-package build, source audit, lint, diff check, and clean final P1 review recorded. | Final user handoff |

Decision brief:
- outcome: Every workspace package exporting `.` and `./react` enforces a React-free root runtime artifact.
- chosen shape: Infer the boundary from package exports and attach it to both direct and shared tsdown build hooks; parse emitted JavaScript syntax and traverse local chunks.
- strongest rejected alternative: Add and maintain the same array in 32 package configs.
- consequence: Current and future split packages are covered automatically; custom explicit boundaries remain additive.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Boundary admission | Two package configs carried handwritten boundaries; 30 equivalent packages had none. | Infer the standard boundary whenever exports contain both `.` and `./react`. | Package artifact verifier | Export topology already states the intended runtime split. | Remove redundant package-local blocks; no public adoption. | Manifest inventory and all-build-route contract. | A custom config could bypass shared owners. | `rearchitect` |
| Build-hook coverage | Direct builds ran artifact checks; shared default builds had no runtime boundary hook. | Direct builds enforce through artifact completion; non-direct builds use the runtime-only completion wrapper. | tsdown config owners | Enabling direct declarations everywhere would be an unrelated declaration migration. | Internal config only. | Direct and non-direct failure fixtures plus 32-package build. | Hook composition could skip an existing completion hook. | `add` |
| Runtime traversal | Regex traversal covered formatted ESM but initially missed CommonJS and compact ESM. | Babel AST scan covers static imports/reexports, literal dynamic imports, and static `require()`, then recursively visits local artifacts. | Artifact verifier | Build correctness cannot depend on output whitespace. | Private hard replacement of the regex. | ESM, compact ESM, CommonJS, legal sibling entry, and missing-chunk fixtures. | Future unsupported syntax must fail parse rather than silently pass. | `rearchitect` |
| Public/release surface | Package exports and current emitted roots already satisfy the invariant. | Keep manifests, exports, dependencies, package source, and release notes unchanged. | Package owners | This is enforcement coverage, not a shipped behavior change. | None. | 32/32 artifact audit and 47/47 build tasks. | None found. | `keep` |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Inventory | Package manifests + build routes | Enumerate exact `.` + `./react` packages and classify shared/direct configuration. | User authorization. | Complete target and missing-coverage list. | Bounded manifest script: 32 targets, 30 missing handwritten coverage. |
| 2. Centralize policy | Artifact checker + tsdown wrappers | Infer boundaries and attach both build paths. | Slice 1. | All target routes invoke one verifier law. | Failure fixtures and build-owner inventory test. |
| 3. Harden traversal | Artifact checker parser | Replace formatting-sensitive import matching with syntax-aware traversal. | Review findings. | ESM/CommonJS/compact output all fail closed. | 17/17 verifier tests. |
| 4. Close | All 32 target builds + review | Build, audit, lint, diff-check, and P1 review. | Slices 1-3. | Zero omissions/violations and clean final review. | 47/47 build tasks; 32/32 audit; invocation 3 clean. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Target inventory is complete | Package export scan | 32 named packages, with route ownership asserted in tests. | passed |
| Every target build enforces the boundary | Shared/direct config source | 47/47 tasks for all 32 targets. | passed |
| Root entries avoid forbidden React runtime packages | Emitted artifact traversal | Final audit: `TOTAL=32 PASS=32 MISSING=0 VIOLATIONS=0`. | passed |
| React-specific entries remain legal | Existing separate `./react` exports | Fixture imports React from the sibling entry while root remains clean. | passed |
| Traversal is output-format independent | Reviewer findings and parser owner | Compact ESM and CommonJS transitive fixtures pass; AST parsing replaces regex. | passed |

Conditional evidence:
- High-risk scenarios: a package bypasses both shared build owners; a local chunk hides React behind compact ESM or CommonJS; a React sibling entry is banned accidentally. The build-owner inventory, AST traversal fixtures, and legal sibling-entry fixture cover each case.
- External research: N/A; current manifests, emitted artifacts, and build tooling are authoritative.
- Issue/PR provenance: N/A; no public issue/PR mutation is authorized.
- Docs/registry/browser/release/behavior-law owners: N/A; no user-facing docs, registry, UI, emitted behavior, or public API changed. Browser proof cannot establish an artifact import graph.

Findings:
- Exactly 32 workspace packages export both `.` and `./react`.
- Initial live coverage was 2/32 through handwritten Core and Plate config blocks; 30 equivalent packages were unprotected.
- Twenty-six targets use the shared default config, four use `createPlatePackageConfig` locally, and two use `defineDirectPackageConfig`; both owning paths therefore need enforcement.
- All current emitted roots already satisfy the boundary. No package source repair was required.
- Regex source matching was an invalid oracle for valid compact ESM and CommonJS output; Babel parser is already a root development dependency and is the literal syntax owner.

Decisions and tradeoffs:
- Infer standard boundaries from exports -> prevents omission and covers future split packages -> config-specific extra boundaries remain supported.
- Keep direct declarations optional -> avoids turning runtime enforcement into a 30-package declaration migration.
- Parse emitted JavaScript -> slightly more build-hook work, but correct across output formatting and module formats.
- No package-local config blocks -> one policy owner instead of 32 copies.

Review fixes:
- Invocation 1 P1 accepted: static CommonJS `require()` edges were invisible -> added syntax coverage and a transitive CommonJS fixture.
- Invocation 2 P1 accepted: whitespace-dependent ESM regex missed compact imports/reexports -> replaced regex traversal with Babel AST parsing and added compact ESM proof.
- Invocation 3: clean, no accepted/actionable P0/P1 finding.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial combined `rg` included the one-line pasted attachment and emitted oversized truncated output | 1 | Exclude attachments/generated trees and use bounded manifest scripts plus named reads | Active discipline applied |
| First parser test referenced a loop-local path variable before it existed | 1 | Use the current trace tail as the parsed artifact path | 17/17 tests pass |
| One parallel broad build observed temporary missing Core declarations in `tabbable`/`mention` | 1 | Verify Core artifacts, rerun the exact two packages, then rerun the full target set | Focused 15/15 tasks and final full 47/47 tasks pass |

Verification evidence:
- `node --test tooling/scripts/check-package-build-artifacts.test.mjs` -> 17 passed, 0 failed.
- `pnpm turbo build` with all 32 explicit target filters -> 47 successful tasks, 0 failed.
- Final manifest/artifact audit -> `TOTAL=32 PASS=32 MISSING=0 VIOLATIONS=0`.
- `pnpm lint:fix` -> pass; only existing Node module-type performance warnings.
- `git diff --check HEAD -- <scoped files>` -> pass.
- Scoped isolated `autoreview --mode local --max-priority P1` invocation 3 -> clean, no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-enforce-root-runtime-boundaries-across-split-packages.md` -> complete.

Final handoff prepared:
- Ownership and target API: package exports select the standard boundary; shared artifact/config tooling enforces it.
- Public breaks and adoption: none; package names, exports, dependencies, source, and React entrypoints stay unchanged.
- Applicable runtime/package/docs/browser decisions: runtime artifact enforcement applies; docs, registry, browser, and release artifacts are N/A.
- Proof and execution risks: 17/17 tests, 47/47 tasks, 32/32 audit, clean final P1 review; no open in-scope risk.
- Execution order and user attention: complete locally; no commit, push, PR, publish, or release performed.

Timeline:
- 2026-08-23T21:49:34.414Z Plate Plan created.
- 2026-08-24 inventory found 32 targets and 30 missing handwritten boundaries.
- 2026-08-24 centralized export-derived enforcement across direct and shared builds.
- 2026-08-24 accepted two P1 review findings and replaced regex traversal with AST parsing.
- 2026-08-24 final tests, builds, audit, lint, diff check, and third P1 review passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final handoff |
| Where am I going? | Mechanical goal close, then user handoff |
| What is the goal? | Every package with `.` and `./react` has an executable React-free root runtime boundary. |
| What have I learned? | Export topology is the canonical selector; the checker must parse syntax rather than formatting. |
| What have I done? | Protected all 32 targets, hardened traversal, and closed focused proof and review. |

Open risks:
- None in scope. The review invocation cap is exhausted with a clean third run.
