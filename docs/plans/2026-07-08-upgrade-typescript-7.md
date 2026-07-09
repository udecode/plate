# upgrade typescript 7

Objective:
Upgrade repo to TypeScript 7; done when manifests/lockfile target TS 7 and package-facing checks are updated or blockers documented.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-08-upgrade-typescript-7.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user prompt
- id / link: N/A
- title: Upgrade to TypeScript 7 now
- decision to make: whether the current repo can move to the live TypeScript 7 npm target now, and what code/config fixes are required
- decision criteria: manifests and lockfile target TypeScript 7; install resolves; `pnpm check:core` passes; no unrelated git/PR work

Major lane:
- lane: framework/library migration
- output type: code-changing execution with verification
- implementation expected: yes
- affected packages / surfaces: root package manager metadata, TypeScript configs, core-check package typecheck/build/test surface
- dominant risk: TypeScript 7 compiler and package API changes breaking `check:core`, especially Plite/Core declaration output and callback inference

First checkpoint:
- Explicit requirement: upgrade to TS 7 now.
- Scope: current checkout `/Users/zbeyens/git/plate-2`.
- Non-goals: no PR, commit, push, branch hygiene, or git status unless explicitly requested.
- Timing: no duration requested.
- Stop condition: stop only for a real TS 7 availability/resolution blocker, install blocker, or source-backed compiler incompatibility that cannot be fixed safely in this task.
- Deliverable: repo metadata/config/source changes needed for TypeScript 7 plus verification evidence.
- Final handoff: concise English summary with changed files, verification, blockers if any, and residual risk.
- Verification surface: live npm TypeScript target, package manager install/lockfile, `pnpm check:core`.
- Success criteria: TypeScript 7 is selected in the repo dependency graph and `pnpm check:core` passes.

Completion threshold:
- TypeScript 7 live npm target is verified, the repo dependency metadata and lockfile target that version/range, and `pnpm check:core` proof is recorded.
- Package/API closure is legal because public package dependency metadata changes have changesets, build output keeps declaration files, and `check:core` passes.
- Major-task closure is legal because decision criteria are satisfied, facts/inference/recommendation are separated, implementation gates are closed, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-upgrade-typescript-7.md` passes.

Verification surface:
- `npm view typescript dist-tags version --json` readback.
- Repo audit of TypeScript dependency owners and TypeScript config owners.
- Package manager install/lockfile resolution after dependency change.
- `pnpm exec tsc --version`.
- `pnpm check:core`.
- Focused package build proof where `tsdown` declaration bundling failed under TS 7.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute implementation because the user said "now."
- Do not check git state proactively at task start.
- Do not create a PR, commit, push, or branch unless explicitly requested.
- User narrowed proof to `pnpm check:core`.

Boundaries:
- Source of truth: user prompt plus repo package/config ownership.
- Allowed edit scope: dependency manifests, lockfiles, TypeScript configs, source/test fixes required by TS 7 diagnostics, changesets for package metadata, and this plan file.
- External sources: npm registry and official TypeScript sources/docs only when needed to settle version/compiler behavior.
- Browser surface: N/A because no browser-rendered route or UI behavior changed.
- Tracker sync: N/A, no tracker item.
- Non-goals: unrelated refactors, package release, PR creation, branch hygiene, manual template edits, and broader `www` typecheck closure.

Blocked condition:
- TypeScript 7 is not available from the npm registry, required upstream compiler/plugins do not support it in a way that blocks `check:core`, or `pnpm check:core` exposes a migration that needs a separate architecture/API decision before safe implementation.

Current verdict:
- verdict: complete for the requested gate
- confidence: high for `check:core`; moderate for broader ecosystem support because `typescript-eslint` still advertises a pre-TS7 peer range
- next owner: none unless the user wants broader gates
- reason: TS 7.0.2 is installed, package declarations build through `tsc`, and `pnpm check:core` passes

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records TS 7 upgrade, current checkout, no PR/commit/branch work, and `check:core` success gate |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md` before implementation |
| Active goal checked or created | yes | `get_goal` returned none; created active goal for TS 7 upgrade |
| Source of truth read before analysis | yes | User prompt: "lets upgrade to ts 7 now"; follow-up narrowed proof to `check:core` |
| Major lane selected | yes | framework/library migration |
| Decision criteria stated | yes | npm TS 7 target, install/lockfile, `pnpm check:core`, no unrelated git/PR work |
| Existing repo patterns / prior decisions checked | yes | `check:core` script, TypeScript owners, tsconfig owners, and package build owners audited |
| Helper stack selected | yes | autogoal, task, major-task, changeset; Chrome not needed |
| External research decision recorded | yes | npm registry readback was enough for TS version; local package errors settled compiler/tooling changes |
| Implementation expectation recorded | yes | implement now |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` owns proof |
| Branch / PR expectation decided | no | N/A: no branch/PR requested |
| Output budget strategy recorded | yes | focused reads/searches, no broad generated-output scans |
| Package/API pack selected | yes | TypeScript major and dependency metadata affect package build/publish surfaces |
| Public surface or package boundary identified | yes | Plite package runtime dependency metadata and declaration output |
| Release artifact path selected | yes | `.changeset/*.md` files for published dependency metadata; no release artifact for internal TS build wiring |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` and `.agents/rules/changeset.mdc` |
| Barrel/export impact decision recorded | no | N/A: no exported file layout or package export map changed |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected outcome, decision criteria, likely files/packages/surfaces, browser surface, and highest-leverage owner.
- [x] Current state is mapped before migration work. Root and www TypeScript dependency owners, TS config owners, `check:core`, npm TS dist-tags, and peer/tooling blockers were audited.
- [x] Existing repo patterns, prior decisions, and nearby implementation constraints are recorded before external research. `check:core` is the user-narrowed proof gate; templates are generated and not edited.
- [x] External docs or source are used only where repo evidence does not settle the question, or N/A reason is recorded. npm registry readback and local package diagnostics were enough; Chrome/TS docs were not needed.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with reason.
- [x] Touched-surface packs cover package/API surfaces.
- [x] Workspace authority recorded: proof commands name `/Users/zbeyens/git/plate-2`.
- [x] Output budget discipline recorded and followed: broad searches were scoped and command output was capped except the final `check:core` proof stream.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with evidence. N/A: no external review findings were used.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset` for dependency metadata, explicit no-artifact reason for internal build wiring.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry-only source changes.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. No migration needed; dependency metadata is additive.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: generated barrels or release notes are updated when required. Barrels N/A; changesets added.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run `pnpm check:core` | Passed in `/Users/zbeyens/git/plate-2` |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | TypeScript manifests, pnpm workspace policy, tsconfigs, tsdown build owners, and Plite/Core source owners audited |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | TS 7 selected; install resolved; `check:core` passed; no git/PR action performed |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | See Decisions and tradeoffs |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Self-review against package/API and changeset rules completed; no separate autoreview because requested gate was local `check:core` and no PR/ship handoff |
| Review findings closure | no | Fix or explicitly reject accepted/actionable findings and record closure proof | N/A: no external review findings |
| External-source audit | yes | Cite official/local sources when used, or record N/A | npm registry readback for TypeScript version; local compiler/package diagnostics for code changes |
| Implementation gates | yes | Close primary-template and touched-surface gates | `pnpm install`, focused builds, focused inventory test, and `pnpm check:core` recorded |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | See Final handoff contract |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm check:core` ran package lint for Core, Plite, Utils, Basic Nodes, Basic Styles, Indent, and Selection; no broader lint required by user scope |
| Output budget discipline | yes | Verify command output was bounded or justified | Final `check:core` stream was the named proof; other reads were scoped/capped |
| Timed checkpoint | no | Duration handling | N/A: no duration requested |
| Goal plan complete | yes | Run autogoal completion check | To run after this final plan write |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | No export map change; package runtime dependency metadata changed for Plite packages |
| Release artifact classification | yes | Classify published package behavior/API/types/config/runtime | Additive package metadata changes require changesets; internal TS build wiring does not |
| Published package changeset | yes | Add/update one `.changeset/*.md` per package | Added patch changesets for `@platejs/plite-dom`, `@platejs/plite-history`, `@platejs/plite-hyperscript`, `@platejs/plite-layout`, `@platejs/plite-react`, and `@platejs/yjs` |
| Registry changelog | no | Registry-only source handling | N/A: no `apps/www/src/registry/**` changes |
| No release artifact | yes | Record exact reason for no artifact where applicable | Internal TypeScript version/build plumbing has no published user-visible delta from `main`; dependency metadata has changesets |
| Package typecheck/build/test | yes | Run `pnpm check:core` | Passed |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported layout changed | N/A: no exported file layout or package export map changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User prompt read; `autogoal`, `task`, and `major-task` skills loaded; active goal created | N/A |
| Current-state map | complete | npm TS latest is 7.0.2; root and www manifest owners changed; `check:core` scope mapped | N/A |
| Options and recommendation | complete | Chose TS 7.0.2 plus `tsc` declaration emit over waiting for `tsdown`/typescript-eslint peer support | N/A |
| Review / pressure pass | complete | Package/API and changeset self-review completed | N/A |
| Implementation or plan artifact | complete | TS metadata, tsconfigs, build wiring, Plite source/test fixes, runtime dependency metadata, and changesets updated | N/A |
| Verification | complete | `pnpm exec tsc --version`, focused builds/tests, and `pnpm check:core` passed | N/A |
| Closeout | complete | Final plan evidence recorded | N/A |

Facts:
- `npm view typescript dist-tags version --json` reported latest `7.0.2` on 2026-07-08.
- `pnpm exec tsc --version` reports `Version 7.0.2`.
- `pnpm install` resolves after exact `minimumReleaseAgeExclude` rows for TypeScript 7 packages.
- `tsdown@0.16.6` / `rolldown-plugin-dts@0.18.4` declaration bundling crashes under TS 7 in this checkout.
- `typescript-eslint@8.56.1` still advertises a pre-TS7 peer range; that does not block the requested `check:core` gate.
- `pnpm check:core` passed in `/Users/zbeyens/git/plate-2`.

Inference:
- Keeping `tsdown` for JS bundles and using `tsc -p tsconfig.build.json` for declaration emit is the lowest-risk TS 7 bridge because package declaration files remain emitted and no unproven bundler upgrade is required.
- Removing TS 7-invalid `baseUrl` assumptions and rebasing `paths` is preferable to chasing compiler flags because the configs become explicit and source-first.
- Moving Plite workspace packages used at runtime from `devDependencies` to `dependencies` is a real published metadata fix, so changesets are warranted.
- Broader peer-range warnings are ecosystem readiness lag, not proof that the requested core gate should stay blocked.

Recommendation:
- Ship this as the TS 7 core-check upgrade.
- Keep broader `www`/full-repo typecheck and upstream peer cleanup as a separate lane if needed.
- Do not wait on `tsdown` declaration bundling; revisit when its TS 7 path is stable.

Decisions and tradeoffs:
- Use TypeScript `7.0.2`, the live npm target, instead of a range so the lockfile and optional native packages are deterministic.
- Add exact `pnpm-workspace.yaml` release-age exclusions instead of disabling the repo freshness policy.
- Disable `tsdown` dts bundling and emit declarations with `tsc`; rejected `tsdown@0.22.4` plus native-preview because it still crashed in this checkout.
- Use `@babel/parser` in the Plite escape-hatch inventory test because TS 7 changed the root `typescript` compiler API shape enough to break the existing test parser path.
- Add package changesets only for runtime dependency metadata; rejected changesets for internal compiler/build config because users do not consume those as package behavior.

Implementation notes:
- Upgraded TypeScript owners in root and `apps/www` manifests plus lockfile.
- Added exact pnpm release-age exclusions for TypeScript 7 and its platform optional packages.
- Removed `baseUrl` from repo tsconfigs that TS 7 rejects and rebased path aliases.
- Switched package declaration emit from `tsdown` dts bundling to `tsc` declaration emit through `plate-pkg p:build` and local tsdown package scripts.
- Added `rootDir` to package build tsconfigs so declaration output stays under package `dist`.
- Fixed Plite commit listener variance and portable declaration output.
- Reworked the Plite escape-hatch inventory parser to avoid the broken root TypeScript compiler API import.
- Moved Plite runtime workspace packages from dev-only metadata into dependencies where package consumers need them.
- Added six package changesets for those published dependency metadata changes.

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `npm view typescript dist-tags version --json` -> latest `7.0.2`.
- `/Users/zbeyens/git/plate-2`: `pnpm install` -> passed after exact TypeScript 7 release-age exclusions.
- `/Users/zbeyens/git/plate-2`: `pnpm exec tsc --version` -> `Version 7.0.2`.
- `/Users/zbeyens/git/plate-2`: `pnpm --filter @platejs/plite build` -> passed and emitted `packages/plite/dist/index.d.ts`.
- `/Users/zbeyens/git/plate-2`: `pnpm --filter @platejs/plite-react build` -> passed.
- `/Users/zbeyens/git/plate-2`: `pnpm --filter @platejs/core build` -> passed.
- `/Users/zbeyens/git/plate-2/packages/plite`: `bun test --preload ../../config/plite-source-test-setup.ts ./test/escape-hatch-inventory-contract.ts` -> 3 pass, 0 fail.
- `/Users/zbeyens/git/plate-2`: `pnpm check:core` -> passed.
- `/Users/zbeyens/git/plate-2`: changeset frontmatter readback confirmed patch entries for six Plite packages.

Final handoff contract:
- Recommendation: use the current diff as the TS 7 core-check upgrade.
- Confidence: high for the requested `check:core` gate.
- Evidence: npm version readback, install, focused package builds/tests, TypeScript version readback, and `pnpm check:core`.
- Tests / commands: recorded in Verification evidence.
- Browser proof: N/A because no browser-rendered route or UI behavior changed.
- PR / tracker: N/A because no PR, commit, branch, or tracker item was requested.
- Caveats: broader peer support still lags for `typescript-eslint`; full-repo gates may need separate work.
- Next owner: none for this request.

Timeline:
- 2026-07-08T20:44:21.523Z Major-task goal plan created.
- 2026-07-08T20:47:00Z Captured explicit requirement, scope, non-goals, verification surface, and blocker conditions.
- 2026-07-08T21:05:00Z User narrowed completion gate to `pnpm check:core`; plan updated.
- 2026-07-08T21:30:00Z TypeScript 7 install and package build fixes completed.
- 2026-07-08T21:40:00Z `pnpm check:core` passed and changesets were added for published dependency metadata.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after passing `pnpm check:core` |
| Where am I going? | Run the autogoal completion check, then final handoff |
| What is the goal? | Upgrade repo to TypeScript 7 with lockfile/manifests and package-facing proof |
| What have I learned? | TS 7 works for the requested core gate when declarations are emitted with `tsc` instead of `tsdown` dts bundling |
| What have I done? | Updated TS metadata/config/build/source/tests, added package changesets, and passed `pnpm check:core` |

Open risks:
- None for the requested `check:core` closure.
- Residual broader risk: `typescript-eslint` peer ranges still lag TS 7, so full-repo or non-core gates may need separate ecosystem cleanup.
