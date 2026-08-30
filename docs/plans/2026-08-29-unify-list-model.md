# Unify the list model

Objective:
Remove the alternative list model completely; done when implementation, exports, registry, docs, generated artifacts, and agent doctrine have zero live references and all scoped proofs pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-29-unify-list-model.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user instruction
- id / link: current Codex task
- title: Remove Legacy list model completely
- acceptance criteria: delete the implementation and every public, registry,
  docs, generated, tooling, test, and agent-doctrine reference; retain only the
  modern root list model; leave no alias, shim, deprecation notice, or live
  mention.

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
- initial confidence score: N/A: completion is binary and source-auditable
- improvement loop: continue until zero-reference and verification gates pass
- final score / loop closure: N/A

Completion threshold:
- Zero live source/config/docs/generated references to the deleted model or its
  public names, including kebab-case, camelCase, PascalCase, and human-readable
  variants.
- Deleted package implementation, React adapter, exports, tsconfig/build/Turbo
  partitions, tests, registry items/components/examples/values, docs pages/nav,
  proof manifests, and agent doctrine.
- Surviving modern list package checks, docs parser, registry/source checks,
  Browser demo proof, lint, generated-barrel/install sync, review, and release
  artifact gates pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-unify-list-model.md` passes.

Verification surface:
- Scoped `rg` zero-reference audits across tracked live files, with generated
  history or third-party fixtures included unless an owning generator proves
  they are immutable historical records that must survive.
- `platejs` entrypoint manifests, typecheck/test/build or package check commands,
  `pnpm brl`, `pnpm install`, docs source/check commands, and registry checks.
- Browser proof of the surviving modern list demo route and console state.
- Agent-native review and P1 local autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `packages/platejs` list owners and package/build manifests;
  `apps/www/src/registry` list composition; `content/docs`; `.agents/rules` and
  generated `.agents/skills`; root/Plate Vision.
- Allowed edit scope: every live owner or consumer of the deleted list model,
  including generated artifacts produced by repository commands and release
  metadata required by the public cut.
- Browser surface: surviving modern list standalone demo or `/docs/list`.
- Browser strategy: Browser normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker or PR requested.
- Non-goals: redesigning the surviving modern list model in this cut; retaining
  compatibility for the deleted model; commit, push, or PR creation.

Output budget strategy:
- Start with counts and filenames. Exclude `node_modules`, `.git`, `.next`,
  `.turbo`, caches, and the sibling research clone. Cap line output and inspect
  owner slices; use artifacts for any large generated-reference ledger.

Blocked condition:
- Stop only if repository generators recreate the deleted public surface from
  an inaccessible external source, or the surviving modern list cannot pass its
  owning checks without restoring deleted code and no in-scope repair exists.

Task state:
- task_type: public API and feature hard cut
- task_complexity: major blast radius, mechanically auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_for_completion

Current verdict:
- verdict: delete the entire alternative list model; retain one root list owner
- confidence: high
- next owner: hard-cut execution
- reason: parallel persisted list models create permanent transform, codec,
  renderer, documentation, and testing cost without an independent target job.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-unify-list-model.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, threshold, boundaries, and explicit zero-reference requirement recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `autogoal`, `hard-cut`, `best-api`, `docs-creator`, and `changeset`; agent review and autoreview load at their gates. |
| Active goal checked or created | yes | `get_goal` returned null; matching goal created before product edits. |
| Source of truth read before edits | yes | Read package implementation/exports, registry components, list docs/nav, Vision, and API ownership doctrine. |
| Tracker comments and attachments read | no | N/A: direct user instruction only. |
| Video transcript evidence required | no | N/A: no video or recording. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused search found three stale alternative-list references; they are inside the deletion scope. |
| TDD decision before behavior change or bug fix | no | N/A: hard deletion; repo law rejects dead-code-removal tests. Surviving behavior gets existing focused proof. |
| Branch decision for code-changing task | no | N/A: user did not request branch, commit, push, or PR. |
| Release artifact decision | yes | Existing `platejs` major consolidation changeset owns the final delta; obsolete feature-specific changesets will be deleted, not replaced. |
| Browser tool decision for browser surface | yes | Use Browser on the surviving modern list demo/docs route. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Count/file-first scoped searches with cache exclusions and capped output recorded above. |
| Docs pack selected | yes | Supporting docs deletion under task primary template. |
| `docs-creator` loaded | yes | Skill and style/topology reference read. |
| Docs lane selected | yes | Plugin-page deletion plus serialization/nav cleanup. |
| Target docs and nearest sibling docs read | yes | Deleted-model page and surviving `/docs/list` page read with their source owners. |
| Docs style doctrine read | yes | `style-and-structure.md` read; deletion routes and links must not point back. |
| Documented source owner identified | yes | Root `platejs` modern `ListPlugin` is the sole surviving owner. |
| Package/API pack selected | yes | Public export and package-layout cut. |
| Public surface or package boundary identified | yes | Remove the feature subpaths and React subpath from `platejs`; root list remains. |
| Release artifact path selected | yes | Existing `.changeset/consolidate-platejs-package.md` remains the major migration artifact. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded and main baseline checked. |
| Barrel/export impact decision recorded | yes | Exported directories/subpaths are deleted; `pnpm brl` required. |
| Browser pack selected | yes | Normal Browser proof. |
| Browser route / app surface identified | yes | Surviving list demo route, falling back to `/docs/list` if no standalone block route exists. |
| Browser tool decision recorded | yes | Browser; no native Chrome behavior involved. |
| Console/network caveat policy recorded | yes | Record console errors; unrelated network noise is reported, not hidden. |
| Observable browser case captured | no | N/A: no report-backed bug; prove surviving list renders and edits after removal. |
| Agent-native pack selected | yes | Source rules and generated skills contain deletion doctrine. |
| Agent-facing action surface identified | yes | Remove stale alternative-list teaching from Plate planning/UI/sync/review skills. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required at completion after final source-rule diff exists. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no recording supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: existing `platejs` major consolidation changeset owns the final delta.
- [x] Final handoff shape decided: feature hard-cut outcome, surviving tests,
      Browser proof, source audit, and caveats; no PR/tracker fields.
- [x] Branch handling recorded for code-changing work: N/A because no branch,
      commit, push, or PR was requested.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only
      if failures match the documented install-corruption signals.
- [x] Workspace authority recorded: all source and command proof uses
      `/Users/zbeyens/git/plate-2`; Browser uses the local www route.
- [x] High-risk note recorded: removing a public persisted-model API can break
      imports and stored documents; the accepted hard cut chooses one canonical
      root model and proves no surviving caller requires the deleted model.
- [x] Review/P1 autoreview target selected: final complete local hard-cut diff.
- [x] Agent-native review decision recorded: required after `.agents/rules`
      cleanup and regeneration.
- [x] Output budget discipline recorded and followed: initial broad audit used
      counts, category totals, capped filenames, and cache exclusions.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit: no compatibility survives.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Final handoff covers the hard-cut outcome, package/docs/browser proof,
      review waiver, and the explicit local-only status. PR and tracker sync are
      N/A because neither was requested.
- [x] Docs pack: all surviving API names, imports, routes, components, demos,
      links, and previews are source-backed; deleted pages and navigation rows
      have no compatibility or migration prose.
- [x] Docs pack: current docs use current-state reference voice. The final
      `unslop` audit found only pre-existing heading-style candidates; manual
      review preserved code literals and technical claims without gratuitous
      rewrites.
- [x] Package/API pack: the removed public subpaths, build partitions, tests,
      package exports, and generated artifacts are gone. The existing
      `platejs` major consolidation and list-scoped API changesets own the
      published package delta; obsolete feature-only changesets are deleted.
- [x] Package/API pack: this is not registry-only work. A new registry
      changelog row would violate the explicit zero-name requirement and refer
      to IDs that no longer exist, so the canonical changelog was regenerated
      after removing those historical item references.
- [x] Package/API pack: package build, release matrix, typecheck, focused tests,
      barrels, docs API reference, and generated registry proof are recorded.
- [x] Browser pack: Browser executed all 35 client runtime entrypoints, then
      rendered and edited `/blocks/list-demo`; both pages had zero console
      errors.
- [x] Browser pack: screenshot, paint controls, exact report replay, pushed-ref
      fingerprints, and 5/5 native stability are N/A. This is a structural
      deletion with no paint/native-browser claim and no pushed ref.
- [x] Browser pack: no stub, alias, bypass, or temporary compatibility path was
      used. The ignored Fumadocs development output was regenerated after the
      first browser run exposed its stale IDs.
- [x] Agent-native pack: `.agents/rules/**` remains authoritative, `pnpm
      install` regenerated the skill mirrors, the one-list-owner rule is
      discoverable, and the capability review found no actionable gap.

Completion Gates:
| Gate | Applies | Evidence | Status |
|------|---------|----------|--------|
| Zero-reference threshold | yes | Source, filename, generated Fumadocs, export, and registry audits return zero | pass |
| Package API and runtime | yes | Build plus packed NodeNext, Bundler, import, SSR, DCE, optional-peer, and size matrix | pass |
| Targeted list and Markdown behavior | yes | 39 standard-list and 202 Markdown tests | pass |
| TypeScript | yes | 78/78 `platejs` entrypoint tasks | pass |
| Barrels, manifests, install, agent mirrors | yes | `pnpm brl`, `pnpm install`, Turbo/DAG and manifest checks | pass |
| Docs, API reference, registry, MDX | yes | docs parity, API reference, registry generation, 93 changelog events | pass |
| Browser | yes | 35 client entrypoints plus editable list demo, zero console errors | pass |
| Agent-native review | yes | source owner, route, mirror, proof, and discoverability map complete; no findings | pass |
| P1 autoreview | no | N/A: branch is `next`; repository policy forbids autoreview on `next` | N/A |
| Scoped final lint | yes | touched production/test/config files passed `ultracite fix` and `check` | pass |
| Bug repro / paint / native stability | no | N/A: hard deletion, not a report-backed or native-paint bug | N/A |
| Clean pushed ref and fingerprints | no | N/A: no commit, push, PR, or shipped-state claim requested | N/A |
| Templates | no | N/A: CI-controlled templates were not edited | N/A |
| PR and tracker sync | no | N/A: not requested | N/A |
| Install-corruption reset | no | N/A: no documented local-env-rot failure occurred | N/A |
| Output budget | yes | One no-ignore audit was truncated; subsequent searches were file-scoped and capped | pass |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| Goal plan complete | yes | Run `check-complete.mjs` after this record is final | ready |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | public surface, implementation, registry, docs, tooling, and doctrine mapped | implementation |
| Implementation | complete | alternative package and registry graph deleted; one root owner retained | verification |
| Verification | complete | package, docs, source audit, generated output, and Browser gates pass | closeout |
| PR / tracker sync | N/A | no commit, PR, push, or tracker mutation requested | final response |
| Closeout | complete | review, release classification, and final handoff recorded | final response |

Findings:
- Browser exposed stale ignored Fumadocs development output even though tracked
  source checks were clean. Regenerating `.source-dev` removed the dead IDs and
  the repeated Browser run passed.
- No agent-native source-owner, route, mirror, discoverability, or proof gap
  remains.

Decisions and tradeoffs:
- Keep one root `ListPlugin` as the only list schema, transform, codec, React,
  and copied-registry owner. No alias, compatibility export, or parallel stored
  document model survives.
- Historical current-tree prose uses neutral list-model language where context
  remains useful. The deleted public name does not survive in live sources,
  filenames, generated docs, API manifests, or registry output.
- The public package delta is major. Existing consolidation and list-scoped API
  changesets own it; adding a registry-only event for deleted IDs would create
  a stale public noun and contradict the hard-cut requirement.

Implementation notes:
- Deleted the package feature and React adapter, entrypoint tsconfigs, exports,
  Turbo/DAG rows, tests, schema aliases, and obsolete changesets.
- Deleted the copied registry feature graph, demo/value/docs pages, toolbar and
  command wiring, and generated registry payloads.
- Removed dead Markdown and tabbable compatibility logic, migrated surviving
  Markdown list fixtures to the root list representation, regenerated barrels,
  docs, API reference, registry, changelog, and entrypoint size snapshots.
- Updated Vision and source agent rules, then regenerated skill mirrors with
  `pnpm install`.

Review fixes:
- Manual package/docs/doctrine review found no actionable defect after the
  stale Fumadocs artifact repair. P1 autoreview is intentionally N/A because
  the active branch is `next`, where repository policy forbids it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Markdown focused tests initially used deleted structural fixtures | 1 | migrate fixtures to the root paragraph/indent/listType model | 202/202 Markdown tests pass |
| Packed entrypoint size proof detected 176-byte shrink | 1 | update the intentional size snapshot and rerun the full release matrix | full packed matrix passes |
| First www Browser run loaded stale ignored Fumadocs development output | 1 | regenerate `.source-dev`, reopen the route, and recheck console state | list demo renders, edits, and logs zero errors |
| One broad no-ignore audit exceeded the output budget | 1 | switch to tracked/live/generated-owner scoped audits with capped output | all final audits are bounded and clean |

Verification evidence:
- Zero-reference audit: no matching live source content, working-tree filename,
  or generated `.source`/`.source-dev` content.
- `pnpm plite:release:packages`: 4 packed release packages, 79 public
  subpaths, 74 Node runtime imports, 39 headless executions, 1 DOM-free SSR
  render, 37 exact optional-peer closures, declaration parity, DCE, and entry
  size proof all pass.
- `pnpm turbo typecheck --filter=./packages/platejs`: 78/78 tasks pass.
- `test:partition:standard-list`: 39/39; `test:partition:markdown`: 202/202.
- Turbo generation/check, package manifests, schema adoption, barrels, package
  build, registry build, API reference, MDX/docs parity, www typecheck, slow
  package integration tests, focused registry tests, and scoped lint pass.
- Browser: `/runtime-entrypoints` reports `passed` for 35 client entrypoints;
  `/blocks/list-demo` has one editable, accepts follow-up text, and records zero
  console errors.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct local task.
- Confidence line: high for the local working tree; no shipped-state claim.
- Flow table:
  - Reproduced: N/A: hard deletion, not a report-backed bug.
  - Verified: package, docs, generated-output, zero-reference, and Browser gates pass.
- Browser check: 35/35 client entrypoints and editable surviving list demo pass with zero console errors.
- Outcome: the alternative list model and every live public mention are gone; root `ListPlugin` is the sole owner.
- Caveat: changes are local and uncommitted; the index/history still names deleted files until a later authorized commit records their deletion.
- Design:
  - Chosen boundary: one root list schema and UI graph.
  - Why not quick patch: aliases would preserve two public models and permanent codec/transform cost.
  - Why not broader change: redesigning the surviving list model is independent of deleting its duplicate.
- Verified: exact commands and counts are recorded above.
- PR body verified: N/A: no PR exists.

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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: direct local task.
- Browser proof: pass for all 35 client entrypoints and the editable surviving
  list demo, with zero console errors.
- Caveats: local and uncommitted; no shipped-state claim.

Timeline:
- 2026-08-29T10:30:54.092Z Task goal plan created.
- 2026-08-29 Package, registry, docs, generated outputs, and doctrine cut.
- 2026-08-29 Package, docs, source, release, lint, and browser proof passed.
- 2026-08-29 Final zero-reference and review gates closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; ready for final response |
| Where am I going? | Mark the active goal complete and hand off the local result |
| What is the goal? | Remove the alternative list model and every live mention |
| What have I learned? | Generated ignored development outputs require explicit regeneration and audit |
| What have I done? | Deleted the full feature graph and passed every applicable source, package, docs, release, and Browser gate |

Open risks:
- None inside the authorized local scope. Publication and migration
  communication remain future release work because no commit, PR, or publish
  was requested.
