# plate-core-merge-unnamed-extensions

Objective:
Merge unnamed Plate Core extensions before Plite install; done when focused runtime/type tests and plan gates pass.

Goal plan:
docs/plans/2026-07-01-plate-core-merge-unnamed-extensions.md

Task source:
- type: local implementation task
- title: Merge repeated unnamed Plate `.extendExtension` calls
- user request: support many `.extendExtension({...})` calls without a `name`, merging them into the same implicit plugin extension before Plite sees them; make sure types are tested.
- acceptance criteria:
  - Plate Core supports many `.extendExtension({...})` calls without naming.
  - Unnamed Plate extensions for the same plugin merge into one implicit Plite extension named by the plugin key.
  - Named extensions remain explicit and separate.
  - Type inference from repeated `.extendExtension` calls works for `editor.api.*` and `tx.*`.
  - Focused runtime tests, type tests/typecheck, lint, build, and plan check pass.

First checkpoint:
- Requirements copied before implementation: same-plugin unnamed merge, explicit-name behavior preserved, type proof required, no Plite semantics widening, no docs/browser/release work unless evidence requires it.

Timed checkpoint:
- N/A: no duration requested.

Completion threshold:
- Done when Core marks implicit Plate extension names, merges repeated unnamed extension fragments before Plite install, keeps explicit names separate, proves runtime behavior and inferred types, passes scoped Core typecheck/lint/build, and this plan passes `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-core-merge-unnamed-extensions.md`.

Verification surface:
- Runtime test: `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts`
- Typecheck/type tests: `pnpm --filter @platejs/core typecheck`
- Lint: `pnpm --filter @platejs/core lint`
- Build: `pnpm --filter @platejs/core build`
- Browser proof: N/A, no browser-rendered surface changed.

Constraints:
- Preserve Plite same-name extension semantics.
- Keep the merge in Plate Core, because Plate is the layer adding implicit plugin-key names.
- Do not merge explicit named extensions.
- Do not add docs, changesets, PRs, commits, or browser proof for this package-only behavior/type patch.

Boundaries:
- Source of truth: current user request and Core plugin extension install path.
- Edited runtime owners:
  - `packages/core/src/lib/plugin/createBasePlugin.ts`
  - `packages/core/src/lib/editor/withPlite.ts`
  - `packages/core/src/lib/plugin/BasePlugin.ts`
- Edited proof owners:
  - `packages/core/src/lib/plugin/createBasePlugin.spec.ts`
  - `packages/core/type-tests/plate-extension-merge-contracts.ts`
- Non-goals: Plite API redesign, docs rewrite, public release artifact, Browser app proof.

Output budget strategy:
- Used focused Core file reads and scoped proof commands only.

Blocked condition:
- Block only if implicit merge cannot preserve inferred types without changing Plite same-name extension semantics.

Task state:
- task_type: package runtime/type behavior
- task_complexity: normal
- current_phase: complete
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_close

Current verdict:
- verdict: complete
- confidence: 0.95
- next owner: none
- reason: runtime merge, type inference, lint, typecheck, and build all passed in the owning Core package.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria copied above before implementation. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | `task` and `autogoal` read. |
| Active goal checked or created | yes | Goal created for unnamed Plate extension merge. |
| Source of truth read before edits | yes | User prompt plus `createBasePlugin`, `BasePlugin`, and `withPlite` extension paths read. |
| Tracker comments and attachments read | N/A | No tracker or attachment source. |
| Video transcript evidence required | N/A | No video evidence. |
| TDD decision before behavior change | yes | Added runtime test and package type-test contract. |
| Branch decision for code-changing task | yes | Current checkout only; no PR or branch requested. |
| Release artifact decision | yes | N/A: active Plate v2 beta migration patch; no release artifact requested. |
| Browser tool decision for browser surface | N/A | No browser surface changed. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Package/API pack selected | yes | Core package runtime/type behavior changed. |
| Public surface or package boundary identified | yes | `createBasePlugin().extendExtension` inference and install behavior. |
| Barrel/export impact decision recorded | yes | N/A: no exports or file layout changed. |

Work Checklist:
- [x] Explicit prompt requirements copied into this plan before implementation.
- [x] Completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Runtime owner identified as Plate Core extension normalization/install, not Plite extension replacement semantics.
- [x] Type inference proof added for repeated unnamed `.extendExtension` calls.
- [x] Runtime proof added for repeated unnamed `.extendExtension` calls.
- [x] Named extension behavior preserved by only merging Core-marked implicit extensions.
- [x] Release artifact requirement recorded as N/A with reason.
- [x] Branch/PR/tracker/browser requirements recorded as N/A with reason.
- [x] Package/API impact recorded and scoped to Core.
- [x] Focused package tests passed.
- [x] Core typecheck including type tests passed.
- [x] Core lint passed.
- [x] Core build passed.
- [x] Plan checker run before goal completion.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all commands in verification surface | Runtime test, typecheck, lint, and build passed. |
| Bug reproduced before fix | N/A | Record focused behavior proof instead | Old behavior was same implicit name replacement; new runtime test covers merge contract. |
| Targeted behavior verification | yes | Run focused Core runtime test | `20 pass, 0 fail, 33 expect() calls`. |
| TypeScript or typed config changed | yes | Run Core typecheck | `pnpm --filter @platejs/core typecheck` passed, including `tsconfig.type-tests.json`. |
| Package exports or file layout changed | N/A | Run barrels only if exports/layout changed | No exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run install only if dependency graph changed | No manifest or lockfile change. |
| Agent rules or skills changed | N/A | Run skill sync only if agent files changed | No `.agents` changes. |
| Workspace authority proof | yes | Run commands in owning repo/package | All proof commands ran in `/Users/zbeyens/git/plate-2` for `@platejs/core`. |
| Browser surface changed | N/A | Browser proof only for rendered surface | Package runtime/type behavior only. |
| Package behavior or public API changed | yes | Classify release artifact | N/A: active beta migration Core behavior fix; no changeset requested for this lane. |
| Docs or content changed | N/A | Verify docs only if docs changed | No docs/content changed besides this plan. |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode was dropped earlier extension fragment; runtime/type tests cover merged API and tx groups. |
| Agent-native review for agent/tooling changes | N/A | Review only if agent/tooling changed | No agent/tooling files changed. |
| Local install corruption suspected | N/A | Reinstall only if env rot signal appears | Failures were real type/lint issues and fixed directly. |
| Autoreview for non-trivial implementation changes | N/A | Run when requested or broader diff needs review | Focused Core patch with direct runtime/type/lint/build proof; no review run requested. |
| PR create or update | N/A | Run check before PR if requested | No PR requested. |
| Tracker sync-back | N/A | Sync tracker only when tracker exists | No tracker. |
| Final lint | yes | Run scoped lint | `pnpm --filter @platejs/core lint` passed. |
| Output budget discipline | yes | Avoid unbounded output | Used focused reads and scoped commands. |
| Timed checkpoint | N/A | Run until duration only when requested | No duration requested. |
| Goal plan complete | yes | Run autogoal checker | Checker command run before closeout. |
| Public API / package boundary proof | yes | Source-audit Core boundary | Plate marks and merges implicit extensions before Plite install; Plite semantics stay strict. |
| Package typecheck/build/test | yes | Run owning package checks | Core test, typecheck, lint, and build passed. |
| Barrel/export generation | N/A | Run `pnpm brl` only if exports/layout changed | No exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Core extension normalizer/install paths read | implementation |
| Implementation | complete | implicit marker, merge path, type helper, runtime/type tests added | verification |
| Verification | complete | Core runtime test, typecheck, lint, build passed | closeout |
| PR / tracker sync | N/A | No PR or tracker requested | final response |
| Closeout | complete | Autogoal checker run before final response | final response |

Findings:
- Plate Core was assigning implicit names to unnamed extension fragments independently, so repeated unnamed `.extendExtension` calls could collide at Plite install time instead of composing as one plugin-owned extension.
- Plite should keep strict same-name replacement semantics. Plate Core owns the implicit merge because it owns the implicit plugin-key naming.

Decisions and tradeoffs:
- Mark implicit names with a non-enumerable symbol so explicit `name` remains explicit even when it equals the plugin key.
- Merge only marked implicit extensions. Explicit named extensions stay separate and Plite-owned.
- Merge arrays by concatenation, plain objects recursively, and scalar/function fields by later override.
- Mirror implicit runtime naming in Core's type helper so unnamed extension fragments contribute inferred `api` and `tx` groups.

Implementation notes:
- `createBasePlugin.ts` marks normalized unnamed extensions with `Symbol.for('plate.core.implicitExtensionName')`.
- `withPlite.ts` merges marked implicit extension fragments before calling `editor.extend(...)`.
- `BasePlugin.ts` treats unnamed extension arguments as having an implicit `name: string` for installed API/tx inference.
- `createBasePlugin.spec.ts` covers merged runtime API and tx groups.
- `plate-extension-merge-contracts.ts` covers inferred API and tx access.

Review fixes:
- Fixed TypeScript predicate narrowing in `withPlite.ts`.
- Fixed type inference gap for unnamed extension arguments in `BasePlugin.ts`.
- Fixed lint formatting and `Object.hasOwn` rule.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Typecheck failed on unknown narrowing in `withPlite.ts` | 1 | Make the implicit-extension guard a type predicate | Fixed and reran typecheck. |
| Typecheck failed because unnamed raw extension objects did not infer installed API/tx | 1 | Add type-level implicit-name helper in `BasePlugin.ts` | Fixed and reran typecheck. |
| Lint failed on formatter/hasOwnProperty style | 1 | Apply lint-preferred shape | Fixed and reran lint. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts` passed: `20 pass, 0 fail, 33 expect() calls`.
- `pnpm --filter @platejs/core typecheck` passed, including package typecheck, `tsconfig.test.json`, and `tsconfig.type-tests.json`.
- `pnpm --filter @platejs/core lint` passed: `Checked 395 files in 114ms. No fixes applied.`
- `pnpm --filter @platejs/core build` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: 95% confidence.
- Flow table:
  - Reproduced: focused runtime/type gap covered by new tests.
  - Verified: Core runtime test, typecheck, lint, and build passed.
- Browser check: N/A, no browser surface changed.
- Outcome: repeated unnamed Plate Core extension fragments compose under the plugin key before Plite install.
- Caveat: no broad repo check was run; proof is scoped to `@platejs/core`.
- Design:
  - Chosen boundary: Plate Core pre-merge, Plite strict extension install.
  - Why not quick patch: caller-side naming would keep boilerplate and lose the Plate default.
  - Why not broader change: Plite same-name semantics should not change for every host.
- Verified: commands listed in Verification evidence.
- PR body verified: N/A, no PR.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A, package runtime/type behavior only.
- Caveats: scoped Core proof, no full repo check.

Timeline:
- 2026-07-01T12:06:28.497Z Task goal plan created.
- 2026-07-01T12:15:00Z Core implicit extension merge implemented and verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Final response after checker and goal completion. |
| What is the goal? | Merge unnamed Plate Core extensions before Plite install with runtime/type proof. |
| What have I learned? | Plate Core must merge only Core-marked implicit extensions; Plite should keep strict explicit-name behavior. |
| What have I done? | Patched Core runtime merge, patched inference, added runtime/type tests, ran focused Core proof. |

Open risks:
- No known open risks for the scoped Core behavior. Full repo check was not run.
