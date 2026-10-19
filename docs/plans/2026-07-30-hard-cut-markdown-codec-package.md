# Hard cut markdown codec package

Objective:
Hard-cut `@platejs/markdown-codec` into Core; done when the package and live
references are gone and scoped type, test, export, install, docs, release, and
review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-30-hard-cut-markdown-codec-package.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user request
- id / link: N/A
- title: Hard-cut `@platejs/markdown-codec` and move its contract into Core
- acceptance criteria:
  - delete the standalone package with no compatibility alias or shim;
  - move its public Markdown codec/context types and built-in registry entry
    into `@platejs/core`;
  - migrate every source, package manifest, lockfile, docs, changeset, tooling,
    export, and test consumer;
  - preserve the optional `@platejs/markdown` compiler/runtime and
    feature-owned codec maps;
  - ignore unrelated CI/concurrent-task failures and do not modify unrelated
    work.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary removal and scoped proof gates apply
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `packages/markdown-codec` no longer exists.
- No live repository reference to `@platejs/markdown-codec` or the removed
  package remains outside this evidence plan.
- Core exports the complete Markdown codec authoring contract and directly
  registers `text/markdown`.
- All affected imports/manifests/lockfile/barrels/docs/release artifacts match
  the Core-owned contract.
- Scoped Core codec contracts, Core/Markdown tests, representative source
  checks, and docs proof pass; accepted autoreview findings are zero. Direct
  feature-package typechecks are waived only where the user's concurrent
  Core/Plite task causes unrelated failures.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-30-hard-cut-markdown-codec-package.md` passes.

Verification surface:
- Exact `rg` stale-package/symbol audit excluding this active plan.
- `pnpm brl`, `pnpm install`, and scoped package-manifest/lockfile audit.
- `@platejs/core` declaration/type-contract checks and tests.
- `@platejs/markdown` tests plus exact Core codec-contract checks. Attempt
  affected feature-package typechecks, but do not treat failures from the
  user's concurrent Core/Plite task as this hard cut's blocker.
- Scoped lint/diff check and `autoreview --mode local`.
- Changeset audit relative to `main`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not preserve `@platejs/markdown-codec` as an alias, stub, re-export,
  compatibility package, or migration bridge.
- Do not move the optional Markdown compiler/runtime into Core.
- Preserve installed-feature ownership of actual codec maps.
- Ignore unrelated CI and concurrent edits; do not use their failures as this
  task's proof or blocker.

Boundaries:
- Source of truth: current checkout plus the accepted Core-owned Markdown
  doctrine in `.agents/rules/best-api.mdc` and `docs/vision/plate.md`.
- Allowed edit scope: every live owner reached from the package/reference
  graph: Core, Markdown, affected feature packages, manifests, lockfile,
  barrels, tests, docs, changesets, tooling, and this plan.
- Browser surface: the Markdown docs route documents the public install and
  authoring shape; the package itself remains a type-only contract.
- Browser strategy: use Browser for the Markdown docs route. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue/Linear target supplied.
- Non-goals: unrelated CI repair, unrelated concurrent work, PR/commit/push,
  Markdown runtime redesign, and editor behavior changes.

Output budget strategy:
- Inventory with `rg --files`, `rg -l`, counts, and exact symbol queries first;
  inspect bounded owners only; exclude `.git`, `node_modules`, build output,
  caches, and this active plan from stale-symbol closure.

Blocked condition:
- Stop only if concurrent edits overlap an exact owning file in a way that
  makes safe integration impossible after three source-backed attempts, or if
  the package graph cannot preserve Core declaration inference without a
  broader accepted API change.

Task state:
- task_type: public package hard cut and type-contract migration
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: execute the accepted hard cut
- confidence: high
- next owner: Core/Markdown package implementation
- reason: the standalone type-only package creates a cycle and 21 activation
  imports; Core is the accepted durable owner.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-30-hard-cut-markdown-codec-package.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Task source, thresholds, constraints, boundaries, and handoff recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Loaded complete `hard-cut`, `autogoal`, `changeset`, and `docs-creator` skills |
| Active goal checked or created | yes | No goal existed; task goal created for this plan |
| Source of truth read before edits | yes | Accepted best-api/Plate doctrine and current package owners identified; exact graph inventory is phase one |
| Tracker comments and attachments read | no | N/A: no tracker target |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Exact package/codec solution search required in intake before edits |
| TDD decision before behavior change or bug fix | no | N/A: type-contract/package ownership hard cut; compile contracts and existing behavior tests are the proof |
| Branch decision for code-changing task | no | N/A: remain in the user's shared checkout; no branch/PR requested |
| Release artifact decision | yes | Changeset classification relative to `main` required; no registry changelog |
| Browser tool decision for browser surface | yes | Browser verifies `/docs/markdown`; native browser/OS behavior is N/A |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker target |
| Output budget strategy recorded | yes | Count/file-list first, bounded owner reads |
| Docs pack selected | yes | Incidental docs/reference cleanup under implementation task |
| `docs-creator` loaded | yes | Complete skill read before edits |
| Docs lane selected | yes | Source-backed reference/import cleanup; no new page topology |
| Target docs and nearest sibling docs read | yes | Exact matching docs and nearest Markdown serialization owner will be read in intake |
| Docs style doctrine read | yes | Complete `docs-creator` read |
| Documented source owner identified | yes | Current Core/Markdown types and docs references, finalized by exact inventory |
| Package/API pack selected | yes | Public type/export/package-boundary deletion |
| Public surface or package boundary identified | yes | `@platejs/markdown-codec` absorbed by `@platejs/core`; compiler remains `@platejs/markdown` |
| Release artifact path selected | yes | `.changeset` classification against `main`; one package per file if required |
| `changeset` skill loaded when `.changeset` is required | yes | Complete skill read |
| Barrel/export impact decision recorded | yes | Public Core types/file layout changes require `pnpm brl` |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions and implementation patterns read before edits:
      current codec contract, Core registry/types/barrels/type contracts,
      Markdown compiler, feature consumers, tooling gates, docs, and changesets.
- [x] Implementation fixes the right ownership boundary: Core owns the
      authoring types and built-in registry; Markdown remains optional runtime.
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset classification against
      `main`; registry changelog N/A.
- [x] Final handoff shape decided: package removal, new Core owner, exhaustive
      stale-reference count, scoped proof, concurrent-CI caveat, and no PR.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: N/A; remain in shared checkout and do not create
      a branch/PR.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only
      for documented install-corruption signatures; unrelated CI is ignored.
- [x] Workspace authority recorded: every proof command runs in
      `/Users/zbeyens/git/plate-2`.
      owns the changed behavior.
- [x] High-risk note recorded for public API/package-boundary change: risks are
      lost Markdown contextual inference, circular declarations, stale package
      dependencies, and broken release exports; proof covers each owner.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected: dirty local hard-cut diff,
      `autoreview --mode local`, scoped to exact package/type/docs owners.
- [x] Agent-native review N/A: this task does not change agent/tooling owners;
      the plan file itself is runtime evidence only.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: source-backed import/reference cleanup lane and Core/Markdown
      owners are recorded; exact targets come from intake inventory.
- [x] Docs pack: every changed API/import claim is source-backed by the Core
      barrel, Core registry, and feature plugin declarations; unchanged
      components/previews are outside this hard cut.
- [x] Docs pack: changed prose uses current-state reference voice.
- [x] Docs pack: links and anchors are unchanged; `/docs/markdown` is the real
      leaf route and rendered successfully. Embedded preview runtime errors are
      from the user's concurrent renderer task and do not affect the changed
      reference text.
- [x] Package/API pack: public API, package boundary, export, and
      release-artifact impact are recorded.
- [x] Package/API pack: Core receives one patch changeset; registry changelog
      is N/A; the branch-only package never existed on `main`.
- [x] Package/API pack: `changeset` loaded; exact files depend on `main`
      baseline evidence.
- [x] Package/API pack: registry-only work N/A; no registry surface.
- [x] Package/API pack: no-artifact path, if selected, must be justified against
      `main`; not assumed.
- [x] Package/API pack: hard cut is explicit; no aliases/shims.
- [x] Package/API pack: Core codec contracts passed before concurrent Core/Plite
      edits resumed; Core and Markdown tests pass. Direct feature typechecks are
      waived where those concurrent edits produce unrelated extension errors.
- [x] Package/API pack: `pnpm brl` exported the Core type owner; the Core patch
      changeset describes the `main`-relative public delta.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named stale/package/type/test/docs/review proof | Passed: package files and live references are zero; scoped gates below pass |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: ownership hard cut; compile contracts exposed and closed the mixed-codec inference regression |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior | `pluginAuthoringContext.spec.ts`: 2 passed, 0 failed |
| TypeScript or typed config changed | yes | Run relevant typecheck | Core contracts, Basic Styles, Link, and Table typechecks pass |
| Package exports or file layout changed | yes | Run `pnpm brl` | Passed; Core barrel exports `MarkdownNodeCodec` |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and graph checks | Passed with 61 workspaces; manifests parse and removed lockfile key is absent |
| Agent rules or skills changed | no | Run generated skill sync or mark N/A | N/A: no agent rule or skill changed |
| Workspace authority proof | yes | Run all proof in the owning checkout | Every command ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | yes | Verify the Markdown docs route | `/docs/markdown` rendered the Core claim and runtime install command with no removed package reference before the concurrent renderer crash |
| Browser final proof | yes | Attach proof or exact caveat | DOM proof passed initially; final reload is blocked by the concurrent `assertRendererNeutral` preview error |
| CI-controlled template output changed | no | Restore generated templates or mark N/A | N/A: no `templates/**` output touched |
| Package behavior or public API changed | yes | Add a changeset | `.changeset/core-markdown-codec-contract.md` is a Core patch |
| Registry-only component work changed | no | Update registry changelog or mark N/A | N/A: no registry-only component change |
| Docs or content changed | yes | Verify source claims and parser | Source claims match Core exports/API; `www build:source` passes |
| High-risk mini gate | yes | Record boundary, failure modes, and proof | Risks: stale package edges and lost contextual inference. Exact stale audits plus element/mark contracts cover both |
| Agent-native review for agent/tooling changes | no | Run agent review or mark N/A | N/A: no agent/tooling contract changed; package-list cleanup is ordinary repository tooling |
| Local install corruption suspected | no | Reinstall or mark N/A | N/A: no install-corruption signature |
| Autoreview for non-trivial implementation changes | yes | Run structured local review | Clean: no accepted/actionable findings; overall correctness `patch is correct` |
| PR create or update | no | Create/update PR or mark N/A | N/A: user did not request a PR |
| Task-style PR body verified | no | Verify PR body or mark N/A | N/A: no PR |
| PR proof image hosting | no | Host PR proof or mark N/A | N/A: no PR |
| Tracker sync-back | no | Sync tracker or mark N/A | N/A: no tracker target |
| Final handoff contract | yes | Fill exact handoff below | Complete below |
| Final lint | yes | Run scoped lint | Scoped Biome: 14 files, no findings |
| Output budget discipline | yes | Keep broad output bounded | Searches were count/file-first and command output capped; autoreview emitted bounded progress |
| Timed checkpoint | no | Complete requested duration or mark N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `check-complete.mjs` | Passed after final closure update |
| Docs source-backed claim audit | yes | Verify docs against current source | Core barrel, registry entry, `defineCodecs.merge`, and Markdown runtime boundary verified |
| Docs links / routes / previews | yes | Verify routes and previews | Leaf route exists; changed prose rendered initially; preview reload caveat is the concurrent renderer crash |
| Docs MDX/content parser | yes | Run `www build:source` | Passed after final wording |
| Plugin page specifics | yes | Apply current-state plugin reference style | Current-state install/authoring guidance; no migration narrative |
| Public API / package boundary proof | yes | Audit exports and removed boundary | Core owns exported types and registry; standalone package/reference counts are zero |
| Release artifact classification | yes | Classify published delta | Published Core type/API patch |
| Published package changeset | yes | Add valid changeset | Core patch changeset present; no forbidden minor |
| Registry changelog | no | Update registry changelog or mark N/A | N/A: not registry-only |
| No release artifact | no | Justify no artifact or mark N/A | N/A: published Core changeset applies |
| Package typecheck/build/test | yes | Run owner checks or record concurrent caveat | Core contracts/tests, Markdown tests, Basic Styles/Link/Table typechecks pass; other feature checks fail in the user's concurrent extension/schema work |
| Barrel/export generation | yes | Run `pnpm brl` | Passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | 5 package files, 21 marker imports, 1 named type import, 17 manifests, 2 docs, 2 tooling gates, lockfile, changesets, and Core owners inventoried | implementation |
| Implementation | complete | Package files/dependencies/marker imports/tooling/docs removed; types, registry, barrel, tests, lockfile, and changeset moved to Core | verification |
| Verification | complete | Install/barrel/stale/contracts/runtime/tests/docs/lint/browser/autoreview evidence recorded | closeout |
| PR / tracker sync | complete | N/A: neither requested nor supplied | final response |
| Closeout | complete | Plan checker passes; final handoff is recorded | final response |

Findings:
- Accepted owner: Core owns universal Markdown authoring types and the built-in
  `text/markdown` registry entry; `@platejs/markdown` remains optional runtime.
- `packages/markdown-codec` has five files and exports only types.
- The package is absent from `main`; its removal is not a release-note event.
  Rewrite its branch-only changeset as the final Core type-contract delta.
- Live consumers: 21 empty type imports, one explicit
  `MarkdownDecodeContext` import query, Markdown compiler type imports, 17
  feature/Markdown manifests, two tooling package lists, two public Markdown
  docs pages, and the lockfile.
- `MarkdownNodeCodec` depends only on Plite/upstream AST types and three
  definition types already owned by `PluginDefinition.ts`, so moving it beside
  Core plugin types avoids a BasePlugin definition cycle.

Decisions and tradeoffs:
- Hard delete the package instead of re-exporting it from Core.
- Ignore unrelated CI but retain scoped owner proof.

Implementation notes:
- Moved the complete Markdown node codec/context contract to
  `packages/core/src/lib/plugin/MarkdownNodeCodec.ts` and exported it through
  the Core plugin barrel.
- Core self-registers `text/markdown` from that owner, so consumers get
  contextual inference from `@platejs/core` without empty activation imports.
- Mixed HTML/Markdown declarations use `defineCodecs.merge` with independently
  inferred maps.
  Node-only maps still require a registered key, preserving arbitrary computed
  MIME document-codec inference.
- Migrated all 31 mixed feature declarations to `defineCodecs.merge` without
  callback annotations or casts.
- Deleted all standalone package files, 21 marker imports, 18 package
  dependencies, two tooling entries, lockfile ownership, and public docs
  installation/import references. No alias, shim, stub, or re-export remains.
- Added Core contracts for Markdown source-node/schema inference and a mixed
  HTML/Markdown declaration.
- `pnpm install` passed with 61 workspaces; `pnpm brl` passed and exported
  `MarkdownNodeCodec`.

Review fixes:
- Replaced indistinguishable direct two-map overloads with
  `defineCodecs.merge`, preserving inference for element and mark schemas while
  leaving foreign-target `defineCodecs(Target, map)` unchanged.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| A generic known-format mapped overload made mixed/foreign codec callbacks lose contextual typing | 3 | Restore separate mixed-map and node-only inference responsibilities | Resolved: `defineCodecs.merge` preserves independent registered-format inference; node-only maps require one exact registered key |
| Direct two-argument self-codec overloads competed with `defineCodecs(Target, map)` | 2 | Give independently inferred self maps a named method instead of an indistinguishable overload | Resolved: `defineCodecs.merge` keeps foreign-target calls unchanged and passes element plus mark contracts |
| Full 19-package Turbo typecheck entered dependency builds and failed in concurrent `@platejs/utils` declaration work | 1 | Use direct package typechecks and exact contract tests | Classified unrelated per user instruction; no utils patch made |
| Direct verification changed underneath the run as the concurrent task edited Core/Plite generic owners | 2 | Keep hard-cut proof scoped to exact stale/package/export/type contracts and report the shared-tree caveat | Active; not treated as this task's CI blocker |

Verification evidence:
- `pnpm install` -> passed; workspace package count dropped from 62 to 61.
- `pnpm brl` -> passed; Core barrel exports `MarkdownNodeCodec`.
- Package manifest JSON parse -> passed.
- Lockfile/package/tooling/content/source stale-package audit -> zero.
- `rg --files packages/markdown-codec` -> zero.
- Core direct typecheck passed after the inference repair before the concurrent
  task resumed overlapping Core/Plite edits.
- Core codec runtime tests -> 2 passed, 0 failed.
- Core package tests -> passed.
- Markdown package tests -> passed.
- Core type contracts -> passed with mixed element and mark codec contracts.
- Basic Styles, Link, and Table typechecks -> passed.
- Other affected feature typechecks were attempted and fail in the user's
  concurrent schema/extension changes; the failures are not stale-package or
  Core codec-contract failures.
- `www build:source` -> passed after final wording.
- Scoped Biome check over all task-owned TypeScript files -> passed.
- Browser `/docs/markdown` initially proved the Core authoring claim, optional
  Markdown runtime install, and absence of the removed package. A later reload
  is blocked by the concurrent renderer-neutral preview assertion.
- `autoreview --mode local --prompt-file
  docs/plans/2026-07-30-hard-cut-markdown-codec-package.md
  --stream-engine-output` -> clean, zero accepted/actionable findings.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker target
- Confidence line: 95%
- Flow table:
  - Reproduced: N/A ownership hard cut; compile inference gap reproduced
  - Verified: scoped contracts, tests, types, docs parser, stale audit, and review pass
- Browser check: route proof passed before a concurrent renderer crash blocked
  the final reload
- Outcome: standalone codec package and every live reference are deleted; Core
  owns the authoring contract and `defineCodecs.merge`
- Caveat: full feature/workspace typechecks and the final docs reload remain
  red in the user's concurrent Core/Plite renderer/schema work
- Design:
  - Chosen boundary: universal codec types and registry in Core; optional compiler/runtime in Markdown
  - Why not quick patch: marker imports and a type-only package preserved the cycle and activation tax
  - Why not broader change: compiler/runtime behavior remains optional and feature-owned codec maps remain installed with their features
- Verified: package/reference zero, Core export/deps, 33 mixed-map migrations,
  contracts/runtime/tests/docs/lint/review
- PR body verified: N/A: no PR

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: not requested
- Issue / tracker: N/A: none supplied
- Browser proof: initial DOM proof passed; final reload blocked by concurrent renderer assertion
- Caveats: unrelated concurrent typecheck/browser failures intentionally untouched

Timeline:
- 2026-07-30T07:10:35.045Z Task goal plan created.
- 2026-07-30T09:20+02:00 Completed bounded package/reference/main-baseline
  inventory and selected direct Core type ownership.
- 2026-07-30T10:10+02:00 Closed hard cut, scoped proof, docs route audit, and
  clean structured review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run the plan checker, close the goal, and hand off |
| What is the goal? | Delete `@platejs/markdown-codec`, move its contract to Core, migrate every live owner, and prove the hard cut |
| What have I learned? | The package is branch-only, type-only, and safely movable through PluginDefinition without a BasePlugin cycle |
| What have I done? | Deleted the package, moved the contract to Core, migrated every live owner, and closed scoped proof/review |

Open risks:
- Concurrent edits may touch overlapping package manifests or codec files;
  integrate current contents and never overwrite unrelated work.
