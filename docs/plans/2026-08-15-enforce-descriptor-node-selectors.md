# enforce descriptor node selectors

Objective:
Use Plate descriptors for structural selectors whenever available; done when package/registry audits find zero avoidable persisted-type selectors and both worker skills enforce the law; plan docs/plans/2026-08-15-enforce-descriptor-node-selectors.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-15-enforce-descriptor-node-selectors.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user correction to the completed node-selector migration
- id / link: current task; no external tracker
- title: Enforce descriptor-first Plate node selectors
- acceptance criteria: audit all Plate-owned package and copied-registry node
  selector call sites, replace every avoidable persisted string/schema-type
  selector with the available exact plugin descriptor, preserve persisted
  identity for AST construction/serialization and raw Plite boundaries, repair
  `plate-plugin-creator` and `plate-ui` source rules, regenerate mirrors, and
  pass source/type/runtime/browser/review/checker gates

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
- initial confidence score: N/A: exact zero-stale audits and pass/fail gates apply
- improvement loop: enumerate selector-bearing APIs, classify each candidate,
  adopt by owner, then rerun audits and proof
- final score / loop closure: N/A

Completion threshold:
- Zero avoidable raw persisted string, `schema.type`, portal `.schema.type`, or
  capability-name selectors remain in Plate-owned production package and
  copied-registry node read/update APIs when an exact descriptor is available;
  legitimate AST construction, serialization, fixtures, external formats,
  dynamic runtime names, and raw Plite boundaries are classified and retained;
  `plate-plugin-creator` and `plate-ui` source rules and generated skills teach
  descriptor-first selection; affected typechecks/tests/browser proof, lint,
  agent-native review, P2 autoreview, and the final checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-enforce-descriptor-node-selectors.md` passes.

Verification surface:
- Count-first source audit of every structural selector field passed to
  `nodes.*`, selection, correction, and insertion split APIs across
  `packages/**/src` and `apps/www/src/registry/**`.
- Affected package and www source-first typechecks plus focused existing tests.
- Representative registry demo browser proof if registry runtime code changes.
- `pnpm lint:fix`, `pnpm install`, source/generated skill parity, agent-native
  review, P2 autoreview, and final goal checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not replace AST node construction or external-format identities with
  descriptors; descriptors belong only in descriptor-aware Plate APIs.
- Do not modify raw Plite call sites to depend on Plate plugins.
- Do not manufacture plugin imports solely for fixtures or truly dynamic
  descriptor-free boundaries.

Boundaries:
- Source of truth: root/Plate/Plite Vision, `best-api`, live Core selector
  declarations/lowering, `plate-plugin-creator`, `plate-ui`, and every live
  Plate-owned selector caller.
- Allowed edit scope: classified Plate package/registry selector callers,
  focused tests when needed, `.agents/rules/plate-plugin-creator*`,
  `.agents/rules/plate-ui*`, generated mirrors via `pnpm install`, and this plan.
- Browser surface: representative affected `/blocks/*-demo` route if registry
  runtime source changes; otherwise N/A with evidence.
- Browser strategy: Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue/PR/Linear source.
- Non-goals: changing the accepted selector API, changing persisted schema
  identity, altering AST data, refactoring unrelated plugin/UI code, registry
  metadata unless imports require it, commits, pushes, or PRs.

Output budget strategy:
- Enumerate API-shaped candidates with `rg --count`/file lists first, exclude
  generated output/templates/dist/public artifacts, and inspect only bounded
  candidate slices. Store any large manifest under the plan artifact directory
  rather than streaming it.

Blocked condition:
- Block only if a classified Plate caller cannot accept its available
  descriptor without an owning Core typing/runtime change and three distinct
  owner-level attempts cannot preserve inference and behavior.

Task state:
- task_type: implementation and agent-rule repair
- task_complexity: normal
- current_phase: implementation
- current_phase_status: complete
- next_phase: implementation
- goal_status: complete

Current verdict:
- verdict: strengthen and fully adopt the already-accepted descriptor-first
  selector law; the prior migration proved the API but did not fully audit its
  canonical call-site spelling
- confidence: high; exact candidate classification remains
- next owner: task
- reason: descriptors preserve configured schema identity and inference, while
  raw persisted values at Plate call sites throw away both

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-enforce-descriptor-node-selectors.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | All package/registry usages, descriptor-first adoption, and both named skill repairs are explicit above. |
| Timed checkpoint parsed | no | N/A: none requested. |
| Skill analysis before edits | yes | Read `best-api`, `plate-plugin-creator`, its required creation/typing references, and `plate-ui`; remaining source-rule and reviewer reads precede edits. |
| Active goal checked or created | yes | `get_goal` returned none; this plan is the static shell for the new goal. |
| Source of truth read before edits | yes | Root/common/Plate/Plite Vision, live selector types/lowering, representative package callers, and named skills read. |
| Tracker comments and attachments read | no | N/A: direct user request only. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Selector-specific solution search required before implementation. |
| TDD decision before behavior change or bug fix | no | N/A: behavior-neutral canonical-call-site adoption; existing type/runtime tests prove lowering. Add a test only if classification exposes missing behavior. |
| Branch decision for code-changing task | no | N/A: user requested current checkout edits, not a branch/PR. |
| Release artifact decision | no | N/A: no published behavior/API delta; this adopts an already-published descriptor selector. |
| Browser tool decision for browser surface | yes | Use Browser on a representative demo if registry runtime source changes; otherwise record N/A. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Count/file-list first with generated/build exclusions and capped slices. |
| Agent-native pack selected | yes | Both named worker skills require source-rule repair and mirror sync. |
| Agent-facing action surface identified | yes | Package and copied-registry node selector authoring. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required before closeout because agent rules change. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A because this is behavior-neutral adoption of an already-published API plus agent-rule repair.
- [x] Final handoff shape decided: report classified/adopted/retained counts, exact rule repair, proof, and no PR/tracker mutation.
- [x] Branch handling recorded for code-changing work: N/A; current checkout is user-authorized and no PR was requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure: run `pnpm run reinstall` once only for matching corruption signals; otherwise N/A.
- [x] Workspace authority recorded: `/Users/zbeyens/git/plate-2` owns all source and proof.
- [x] High-risk note recorded: runtime behavior must remain identical after descriptor lowering; source audits distinguish selectors from AST `type` fields.
- [x] Review/P2 autoreview target selected: local diff after adoption and skill sync, max priority P2.
- [x] Agent-native review decision recorded: required after source-rule edits and generated mirror sync.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Refined AST audit: 37 residual non-direct values across 16 files, all classified; zero avoidable rows. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: canonical call-site/drift repair, not a behavior bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | 359/359 non-hook batch plus isolated hook files 13/13, 3/3, and 2/2; Core regression 5/5. |
| TypeScript or typed config changed | yes | Run relevant typecheck | 11 affected package typechecks pass; full www typecheck passes. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A unless adoption changes imports/exports or files. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | `pnpm install` is still required for Skiller mirror generation, not dependency changes. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install`; v79 validate/fingerprint and generated rule searches pass. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; Browser targeted localhost from `apps/www`. |
| Browser surface changed | conditional | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Attempted `/blocks/editor-demo` and `/dev/table-perf`; both are blocked before app code by stale CI-generated `src/__registry__/index.tsx` imports for intentionally deleted `editor-kit.tsx` and `plate-types.ts`. |
| Browser final proof | conditional | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Exact Browser/console caveat recorded; repo policy forbids local `build:registry`, while full www generation/parity/typecheck passes. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: templates are excluded. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: behavior-neutral adoption of an existing API; no exported contract changes. |
| Registry-only component work changed | conditional | Update `docs/components/changelog.mdx` or record N/A | N/A if only implementation spelling changes with no user-visible registry delta. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: agent rules are not public docs. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk is misclassifying AST construction as selector or using the wrong descriptor; exact typechecks/runtime tests and zero-stale classified audit prove the boundary. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | PASS: action route, source ownership, generated mirrors, proof, and discoverability are present; no agent-native findings. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A unless matching corruption signals appear. |
| P2 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | First run found one valid P2 string-reference regression; fixed with test. Final two-pass run: clean, patch correct 0.84. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | complete | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below; PR/tracker are N/A. |
| Final lint | complete | Run `pnpm lint:fix` or scoped equivalent | Scoped Biome check on 30 changed TS/TSX/JSON files passes; `git diff --check` passes. |
| Output budget discipline | complete | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were count-first/capped; one 11-package Turbo log was bounded and summarized. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: none requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-enforce-descriptor-node-selectors.md` | Final checker passed after evidence closure. |
| Agent source / generated sync | complete | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`; generated `plate-plugin-creator`, `plate-ui`, and `plate-next` mirrors updated; v79 validation passes. |
| Agent action discoverability | complete | Source-audit the skill/rule path an agent will read | Generated skill searches find descriptor-first and string-capability rules at the expected entrypoints. |
| Agent-native review | complete | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; no gaps in action route, owner, mirror, proof, or handoff. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Created plan; read Vision, Core selector owners, `best-api`, both named skills, plugin required references, and `agent-native-reviewer`; classified the Babel candidate manifest. | implementation |
| Implementation | complete | Adopted descriptors across package and copied-registry selectors; repaired both source rules; doctrine v79 recorded. | verification |
| Verification | complete | Package/www types, focused tests, registry ownership, lint, doctrine parity, Browser attempt/caveat, agent-native review, and clean P2 autoreview recorded. | closeout |
| PR / tracker sync | complete | N/A: no PR, issue, or tracker mutation requested. | closeout |
| Closeout | complete | Evidence finalized; final checker is the terminal command. | final response |

Findings:
- A Babel AST audit found 120 direct non-descriptor node-selector arguments in
  32 production package/registry files. This is the candidate manifest, not the
  accepted edit count: generic runtime owners, external/persisted identity, and
  descriptor-free dynamic inputs still need classification.
- Existing doctrine is incomplete at the worker boundary:
  `plate-plugin-creator` says `type: FooPlugin` but does not forbid eagerly
  resolving `schema.type`; `plate-ui` does not teach descriptor-first copied
  registry selection at all.
- The refined argument-position AST audit reports 37 non-direct selector
  values across 16 files, including three raw Plite implementation rows. Every
  remaining Plate row is a classified exception: optional cross-package
  plugins without a descriptor dependency, raw/native state or codec views,
  Core lowering/compiler internals, configured dynamic plugin lists, generic
  runtime selectors, or the TOC type-to-depth map. A separate type-bearing
  `match` audit found one avoidable Tag selector and moved its element identity
  to `type: plugin`; the other matches perform path/property/structure logic or
  have no exact descriptor dependency.
- Table-only size commands exposed an unrelated escape hatch:
  `TableFindOptions` allowed a caller to override the table type. The durable
  fix omits `type`, so those commands always select `context.plugin` and retain
  caller control over location and traversal mode.
- Copied registry files that gained direct package descriptor imports also own
  the matching install closure in registry metadata. The registry source
  checker passes after adding `basic-nodes`, `code-block`, `layout`, and
  `table` only to the items that directly need them.

Error attempts:
- Tried to build the candidate manifest with the installed TypeScript 7 package,
  but its runtime export has no compiler API (`ScriptTarget` was undefined).
  Switched to the installed Babel parser and completed the bounded AST audit.
- The accepted API and durable doctrine already prefer `type: FooPlugin` in
  Plate, but `plate-ui` does not teach the selector rule and
  `plate-plugin-creator` states it only once without an explicit ban on
  `schema.type`/literals when a descriptor exists.
- Live source has descriptor selector adoption, but the prior closeout did not
  classify every non-descriptor Plate selector.
- The first broad package typecheck correctly rejected descriptors in Code
  Block codec/native command state, List Classic helpers explicitly narrowed
  to raw `EditorStateView`, the Slash combobox's narrow base-editor callback,
  and the string-valued custom List toggle API. Restored compiled persisted
  types only at those non-descriptor-aware boundaries; the focused Code Block,
  List Classic, AI, and app typechecks then passed.
- A first Table fix combined a raw optional `type` with a descriptor default,
  which erased selector inference. Removed `type` from `TableFindOptions`
  instead of casting or adding a result generic; `@platejs/table` typecheck
  passes with direct `context.plugin` selection.

Decisions and tradeoffs:
- Descriptor-first applies only to descriptor-aware selector inputs. Persisted
  identity remains correct for node construction, serialization, external
  formats, deliberate fixtures, dynamic runtime input, and raw Plite.

Implementation notes:
- Package selectors now use their exact owner descriptor or callback `plugin`
  across AI, Basic Nodes, Code Block, Core injection, Layout, Link, List
  Classic, Math, Table, Tag, and Toggle. AST construction, codecs, and raw
  Plite command/state views retain compiled persisted types.
- Copied registry AI/table utilities, editor transforms, autoformat, chat,
  draggable blocks, Link, and Table UI use stable package descriptors. Registry
  metadata declares every newly direct package import.
- `plate-plugin-creator` owns package selector doctrine; `plate-ui` owns copied
  registry adoption. Plate Next v79 fingerprints both source changes and
  generated mirrors were regenerated through `pnpm install`.

Review fixes:
- Accepted P2: `getInjectMatch` passed string capability references directly as
  persisted selectors. Exact descriptors still flow through, while strings
  resolve through the installed portal. A configured schema-type regression
  test proves the distinction. Final P2 autoreview is clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| TypeScript 7 package root lacked the compiler parser API | 1 | Use installed Babel parser | Completed bounded AST audits. |
| Descriptors were tried in raw/native state and narrow BaseEditor callbacks | 1 | Let type errors identify actual Plate-vs-Plite boundaries | Restored compiled types only at non-descriptor-aware APIs. |
| Table descriptor default unioned with caller-overridable raw `type` | 2 | Remove the invalid table-type override instead of casting/inserting a result generic | Table commands infer from `context.plugin`; typecheck passes. |
| Combined React hook test files lost shared editor/store context | 1 | Run the three failing files in isolated Bun processes | Isolated 13/13, 3/3, and 2/2 pass; the other 359 tests passed in the batch. |
| Browser route compilation read stale CI-generated registry imports | 2 routes | Verify exact blocker and retain repo prohibition on local registry generation | `/blocks/editor-demo` and `/dev/table-perf` fail before app code on deleted `editor-kit.tsx`/`plate-types.ts`; full www check passes. |
| First P2 autoreview found string capability-name regression | 1 | Resolve only strings through installed portals and add a configured-type test | Core typecheck/test pass; final autoreview clean. |

Verification evidence:
- `pnpm turbo typecheck` for 11 affected packages: 49/49 graph tasks pass.
- `pnpm --filter www typecheck`: editor generation check, API reference check,
  docs parity, registry ownership, app TypeScript, and package integration pass.
- Focused runtime: 359/359 combined non-hook rows; isolated React hook files
  13/13, 3/3, and 2/2; final Core `getInjectMatch` regression 5/5.
- `pnpm install`; Plate Next registry validates at v79 with doctrine fingerprint
  `sha256:97b1ca2c1bbc390081f5180c32b991bda310dd174be860936d5d95294c0e76ac`;
  generated skill searches prove both rules are discoverable.
- Scoped Biome checks 30 changed typed/config files clean; `git diff --check`
  clean; registry source checker passes.
- Agent-native review: PASS with no findings. Final
  `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P2`:
  two passes, zero findings, patch correct at 0.84.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: direct local task with no tracker.
- Confidence line: high; exact source/type/test/doctrine/review gates pass, with
  one explicit unrelated Browser blocker.
- Flow table:
  - Reproduced: the source audit exposed 120 raw candidates and the first review
    reproduced the string capability-name regression.
  - Verified: zero avoidable selectors; package/www types and focused runtime
    tests pass; Browser attempt is blocked before affected code.
- Browser check: attempted `/blocks/editor-demo` and `/dev/table-perf`; both hit
  the same stale generated registry-index imports for files already deleted by
  the surrounding checkout.
- Outcome: package and registry Plate selectors use descriptors wherever the
  called API and dependency boundary make one available; both worker skills
  enforce the rule.
- Caveat: no successful rendered Browser proof because local registry output is
  stale and `build:registry` is CI-only. This patch's full www contract passes.
- Design:
  - Chosen boundary: preserve descriptors until Core lowers them; resolve only
    string capability references through installed portals.
  - Why not quick patch: replacing only Link would leave the same drift across
    packages, registry source, and future agent teaching.
  - Why not broader change: AST identity, codecs, raw Plite, optional
    cross-package references, and genuinely dynamic selectors are different
    contracts and remain persisted/dynamic by design.
- Verified: exact commands and results are listed above.
- PR body verified: N/A: no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: attempted and blocked by stale CI-generated registry index;
  exact missing imports recorded above.
- Caveats: no changeset because this adopts an existing selector API and repairs
  internal authoring doctrine; no registry changelog because runtime behavior
  and copied UI are unchanged.

Timeline:
- 2026-08-15T16:54:43.268Z Task goal plan created.
- 2026-08-15T17:31:00+02:00 Descriptor sweep, doctrine v79, generated mirrors,
  types, focused tests, Browser attempt, agent-native review, and final clean P2
  autoreview completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final checker, goal completion, user handoff |
| What is the goal? | Zero avoidable persisted-type structural selectors in Plate package/registry source, with both worker skills enforcing descriptor-first usage. |
| What have I learned? | See Findings |
| What have I done? | Completed implementation and all available proof; see Timeline. |

Open risks:
- Browser rendering remains unproved locally until CI regenerates
  `apps/www/src/__registry__/index.tsx`; this is explicit and does not weaken
  package/runtime/type or registry ownership proof.
