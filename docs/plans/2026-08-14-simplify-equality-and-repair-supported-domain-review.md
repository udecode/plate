# simplify equality and repair supported-domain review

Objective:
Simplify Plite equality and repair supported-domain review doctrine; done when
behavior/perf proof, source/mirror audits, agent-native review, package gates,
and P2 review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-simplify-equality-and-repair-supported-domain-review.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: direct user correction after `best-api review`
- id / link: N/A: no tracker or public GitHub mutation is authorized
- title: Simplify EQ-P1 and repair the review skill
- acceptance criteria: replace the overengineered equality traversal with the
  smallest truthful private owner; preserve public behavior and shallow
  performance; remove synthetic unsupported-depth proof; add a reusable
  supported-domain review rule at source; regenerate and verify skill mirrors.

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
- initial confidence score: N/A: binary behavior, performance, sync, and review gates apply
- improvement loop: refactor -> focused proof -> skill sync -> source/mirror audit -> reviews
- final score / loop closure: N/A: close only on named binary gates

Completion threshold:
- The public `TextApi.equals` import, signature, clone equality, negative laws,
  missing-key/`undefined`, prototype-own-key, and wide first-difference behavior
  remain unchanged.
- Equality is a private lexical owner beside `TextApi`; the one-consumer
  `utils/deep-equal.ts`, its unused barrel export, and the 200,000-depth false
  guarantee are removed.
- Three alternating shallow p95 samples show no regression versus the current
  iterative implementation; representative nested comparison remains finite.
- `.agents/rules/best-api.mdc`, `.agents/rules/patch.mdc`, and the smallest
  durable Vision owner teach that review findings cannot expand supported input
  domains or add isolated guarantees without an end-to-end user job.
- `pnpm install` regenerates mirrors; source/mirror audits, agent-native review,
  focused tests, fixtures, package typecheck, scoped lint, and final P2
  autoreview have zero accepted actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-simplify-equality-and-repair-supported-domain-review.md` passes.

Verification surface:
- Public behavior: `packages/plite/test/text-equality.test.ts` and the converted
  legacy equality fixtures through `TextApi.equals`.
- Performance: disposable alternating benchmark comparing the pre-repair
  iterative implementation with the recursive lexical candidate.
- Package: focused Bun tests, fixture filter, source-first Plite typecheck,
  package barrel command, scoped Biome, and affected Plite gate with exact
  unrelated failures separated.
- Agent workflow: `pnpm install`, source/generated `rg` audit, best-api
  forward-test against this equality case, `agent-native-reviewer`, and P2
  `autoreview` over the exact code/rule/docs boundary.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Keep `TextApi.equals` public shape and missing-versus-`undefined` law.
- Do not reuse strict `areEditorJsonValuesEqual`; its input law differs.
- Do not edit generated `.agents/skills/**/SKILL.md` directly.
- Do not commit, push, open a PR, mutate GitHub, or edit `templates/**`.

Boundaries:
- Source of truth: `packages/plite/src/interfaces/text.ts`, current equality
  tests/fixtures, `.agents/rules/best-api.mdc`, `.agents/rules/patch.mdc`,
  `docs/vision/common.md`, and generated skill mirrors after sync.
- Allowed edit scope: the private Plite equality owner/tests/barrel, the three
  doctrine/rule owners above, generated mirror/sync outputs, and this plan.
- Browser surface: N/A: private deterministic model comparison and agent prose.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue, PR, or Linear mutation authorized.
- Non-goals: public API/types, strict core JSON equality semantics,
  collaboration/history/serialization formats, UI/browser behavior, release,
  unrelated audit packets, and unrelated dirty-tree failures.

Output budget strategy:
- Read exact equality/rule/Vision owners and targeted search results only.
  Exclude dependencies, generated apps, templates, build output, and unrelated
  packages. Use scoped tests, capped output, and isolated review bundles.

Blocked condition:
- Stop only if the simpler owner cannot preserve behavior and shallow budget,
  skill generation cannot identify a source owner, or a relevant changed-owner
  gate fails with no safe in-scope fix.

Task state:
- task_type: package architecture refactor plus agent-workflow repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: the public behavior is preserved in a smaller lexical owner, and
  review/execution doctrine now rejects unsupported isolated guarantees
- confidence: high from focused/full package proof, three final benchmarks,
  regenerated mirrors, agent-native parity, and a clean P2 review
- next owner: none
- reason: one production consumer does not justify a separate 150-line helper;
  the deleted 200,000-depth guarantee was unsupported by adjacent JSON owners.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-simplify-equality-and-repair-supported-domain-review.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Code simplification, skill repair, source-only edits, regeneration, behavior/perf/package proof, reviews, and final handoff are explicit above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `best-api`, `autogoal`, `patch`, `tdd`, `docs-creator`, `changeset`, and `agent-native-reviewer`; `autoreview` loads before final review. |
| Active goal checked or created | yes | No prior goal existed; created the exact objective naming this plan. |
| Source of truth read before edits | yes | Read root/common/Plite Vision, equality public/private owners, strict core JSON equality, consumers, dossier, tests, package exports, and targeted rule owners. |
| Tracker comments and attachments read | no | N/A: direct user correction; no tracker target. |
| Video transcript evidence required | no | N/A: no video or visible behavior. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Targeted supported-domain/synthetic/extremal search found no existing owner for this review miss. |
| TDD decision before behavior change or bug fix | yes | Behavior is already green; this is a refactor. Preserve public behavior tests, delete the implementation-coupled unsupported-depth case, and rerun the class proof. |
| Branch decision for code-changing task | no | N/A: use the current checkout; no commit/PR requested. |
| Release artifact decision | yes | Main-relative audit previously proved `packages/plite` absent from `main` and `origin/main`; recheck before closeout, so no changeset unless that changed. |
| Browser tool decision for browser surface | no | N/A: deterministic model equality and internal agent doctrine. |
| PR expectation decision | no | N/A: user did not request a PR. |
| Tracker sync expectation decision | no | N/A: no tracker target or mutation authority. |
| Output budget strategy recorded | yes | Exact owners, capped searches, scoped commands, and isolated review bundles only. |
| Agent-native pack selected | yes | `.agents/rules/**` source and generated skill mirrors change. |
| Agent-facing action surface identified | yes | `best-api review` and patch architecture/review-finding classification. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc` and `.agents/rules/patch.mdc`; regenerate `.agents/skills/**/SKILL.md` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded complete skill; final parity map required. |
| Package/API pack selected | yes | Published package runtime behavior/file topology is touched although the public call shape stays fixed. |
| Public surface or package boundary identified | yes | `@platejs/plite` root `TextApi.equals` stays unchanged; private equality file moves lexical to `interfaces/text.ts`. |
| Release artifact path selected | no | N/A: no main-relative released package exists; recheck before closeout. |
| `changeset` skill loaded when `.changeset` is required | no | Loaded for the baseline rule; no artifact currently applies. |
| Barrel/export impact decision recorded | yes | Remove the private `utils/index.ts` export and run the package `brl` command; root package exports remain unchanged. |
| Docs pack selected | yes | Durable internal Vision doctrine changes as supporting work. |
| `docs-creator` loaded | yes | Loaded complete source-owned docs workflow. |
| Docs lane selected | yes | Internal spec/law doctrine, not public MDX. |
| Target docs and nearest sibling docs read | yes | Read root Vision, `docs/vision/common.md`, and `docs/vision/plite.md`. |
| Docs style doctrine read | yes | Loaded `docs-creator`; current-state, owner-first, binary wording applies. |
| Documented source owner identified | yes | Shared supported-domain doctrine belongs in `docs/vision/common.md`; workflow mechanics belong in best-api/patch rules. |

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
- [x] Required video or screen-recording evidence is N/A: no video or visible behavior.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: the private relation
      is lexical to `TextApi`, its sole production consumer.
- [x] Release artifact requirement recorded: N/A because `packages/plite` is
      absent from both `main` and `origin/main`, so there is no released-package
      delta from either baseline.
- [x] Final handoff shape decided: report the local code/rule repair, focused
      and package proof, unrelated broad-gate failures, and no public mutation.
- [x] Branch handling recorded: N/A, current checkout only; no commit/PR requested.
- [x] Local-env-rot retry policy recorded: N/A because broad failures were
      deterministic existing source/changeset contracts, not install-corruption
      signals; no reinstall was warranted.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded: a recursive relation has the same depth ceiling
      as adjacent Plite JSON owners; targeted laws, width short-circuit proof,
      property tests, package tests, and bounded depth benchmarks cover the
      supported domain. The agent risk is accidental rubric expansion, covered
      by source/mirror audits and the forward review.
- [x] Review/P2 autoreview target selected from the exact equality code/test
      patch in an isolated baseline/current bundle; P2 returned no actionable
      findings.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: edited `.agents/rules/*.mdc` source owners, not generated mirrors.
- [x] Agent-native pack: supported-domain decisions are discoverable in
      `best-api`, `patch`, and `plite-plan` source and generated skill text.
- [x] Agent-native pack: `pnpm install` regenerated all three skill mirrors.
- [x] Agent-native pack: parity review passed with no accepted findings.
- [x] Package/API pack: public `TextApi.equals` is unchanged; only its private
      implementation/file topology changed, with no main-relative release artifact.
- [x] Package/API pack: release matrix applied; explicit no-artifact reason recorded.
- [x] Package/API pack: `changeset` was loaded; N/A because no released package
      exists on `main` or `origin/main`.
- [x] Package/API pack: N/A registry-only path; no registry files changed.
- [x] Package/API pack: no user-visible delta from either release baseline exists.
- [x] Package/API pack: compatibility/migration N/A because the public call and
      behavior laws did not change.
- [x] Package/API pack: focused tests, fixtures, package typecheck, full package
      test boundary, and affected development gate are recorded.
- [x] Package/API pack: package `brl` reported no barrels to generate; release
      notes are N/A.
- [x] Docs pack: internal shared doctrine belongs to `docs/vision/common.md`;
      root and Plite sibling Vision owners were read.
- [x] Docs pack: all named APIs/owners are backed by current source; routes,
      components, demos, and previews are N/A.
- [x] Docs pack: the Vision addition states durable current law, not history.
- [x] Docs pack: N/A links/anchors/previews; none were added.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | Focused laws, fixtures, typecheck, barrel, scoped lint, benchmarks, mirror audit, agent parity, and P2 review passed. |
| Bug reproduced before fix | no | N/A with reason | N/A: behavior was green; source ownership and unsupported robustness machinery were the defect, established by source audit and baseline benchmark. |
| Targeted behavior verification | yes | Run focused proof | Four focused equality rows and 13 slow-fixture rows passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/plite` passed. |
| Package exports or file layout changed | yes | Run `brl` | `pnpm --filter @platejs/plite brl` reported no barrels to generate. |
| Package manifests, lockfile, or install graph changed | no | Sync rules | No manifest change; `pnpm install` completed for rule generation. |
| Agent rules or skills changed | yes | Regenerate and audit | `pnpm install` regenerated mirrors; exact source/mirror searches passed. |
| Workspace authority proof | yes | Run in owner | All proof ran from `/Users/zbeyens/git/plate-2`, with package commands scoped to `@platejs/plite`. |
| Browser surface changed | no | N/A | N/A: deterministic model equality and agent doctrine have no browser surface. |
| Browser final proof | no | N/A | N/A: no runnable visible surface changed. |
| CI-controlled template output changed | no | N/A | N/A: no template output touched. |
| Package behavior or public API changed | no | Classify release delta | Public API/laws unchanged; package absent from `main` and `origin/main`, so no changeset. |
| Registry-only component work changed | no | N/A | N/A: no registry work. |
| Docs or content changed | yes | Audit claims | Internal Vision law is source-backed; no MDX, link, route, or preview changed. |
| High-risk mini gate | yes | Record failure/proof/boundary | Recursive depth ceiling intentionally matches adjacent JSON owners; property/law/width/package/benchmark proof covers the supported domain. |
| Agent-native review for agent/tooling changes | yes | Close findings | Loaded reviewer; three-route parity map passed with no findings. |
| Local install corruption suspected | no | N/A | N/A: no corruption signal; broad failures were stable unrelated source contracts. |
| P2 autoreview for non-trivial implementation changes | yes | Run P2 | Exact baseline/current equality patch reviewed with `--max-priority P2`; no actionable findings. |
| PR create or update | no | N/A | N/A: no PR requested. |
| Task-style PR body verified | no | N/A | N/A: no PR exists. |
| PR proof image hosting | no | N/A | N/A: no PR or browser proof. |
| Tracker sync-back | no | N/A | N/A: no issue or tracker mutation requested. |
| Final handoff contract | yes | Fill fields | Filled below with exact proof and caveats. |
| Final lint | yes | Run scoped equivalent | Biome checked all 14 modified equality source/test files successfully. |
| Output budget discipline | yes | Record recovery | One broad diff exceeded the intended view; subsequent inspection used narrow bounded reads and searches. |
| Timed checkpoint | no | N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-simplify-equality-and-repair-supported-domain-review.md` | Passed after all substantive and closure rows were resolved. |
| Agent source / generated sync | yes | Regenerate and verify | `pnpm install` plus source/mirror `rg` passed. |
| Agent action discoverability | yes | Audit route | `best-api`, `patch`, and `plite-plan` each expose the rule at the decision point. |
| Agent-native review | yes | Review parity | PASS; no accepted findings. |
| Public API / package boundary proof | yes | Audit boundary | `TextApi.equals` call shape/export unchanged; dead private helper export removed. |
| Release artifact classification | yes | Classify | No released-package user-visible delta from `main` or `origin/main`. |
| Published package changeset | no | N/A | N/A: `packages/plite` does not exist on either release baseline. |
| Registry changelog | no | N/A | N/A: no registry-only files. |
| No release artifact | yes | State reason | Plite has no main-relative published baseline; agent/Vision changes are internal. |
| Package typecheck/build/test | yes | Run package proof | Typecheck passed; focused tests passed; full package ran with 1435 passes and three unrelated existing failures. |
| Barrel/export generation | yes | Run package `brl` | Passed with no generated changes. |
| Docs source-backed claim audit | yes | Audit doctrine | Shared law matches current adjacent JSON owners and the repaired skill gates. |
| Docs links / routes / previews | no | N/A | N/A: none added or changed. |
| Docs MDX/content parser | no | N/A | N/A: no MDX/content files changed. |
| Plugin page specifics | no | N/A | N/A: not a plugin page. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Public/private owners, adjacent JSON pipeline, rules, Vision, and tests audited. | implementation |
| Implementation | completed | Equality owner simplified; unsupported-depth test deleted; source doctrine repaired and regenerated. | verification |
| Verification | completed | Focused/package proof, benchmarks, source/mirror audit, parity review, and P2 review recorded. | closeout |
| PR / tracker sync | completed | N/A: user requested only local repair. | closeout |
| Closeout | completed | All substantive gates closed; final plan audit ready. | final response |

Findings:
- The public `TextApi.equals` shape is already the smallest truthful API.
- `utils/deep-equal.ts` has one production consumer, `interfaces/text.ts`;
  tests and a dead private barrel do not establish another owner.
- Plite separately owns strict JSON equality in `core/value-codec.ts`.
  Reusing it would break `TextApi.equals` missing-key/explicit-`undefined`
  semantics and add strict validation cost, so the relations must stay distinct.
- The accepted Slate dossier proposed a small recursive relation. The iterative
  150-line implementation grew only after review findings added 200,000-depth
  stack safety and width-sized-worklist defenses.
- Plite JSON validation, cloning, schema canonicalization, and JavaScript
  serialization already recurse and cannot carry a 200,000-depth document
  end-to-end. Equality-only stack safety is a misleading isolated guarantee.
- A lexical recursive prototype preserving the scalar fast path passed the
  accepted equality laws and measured 0.866x-0.901x current shallow p95 across
  three runs. Depth-512 cost rose from about 2.6-2.8us to 4.8-4.9us, which is
  finite and immaterial for a depth the normal editor pipeline does not approach.

Decisions and tradeoffs:
- Keep the public call and behavior law; inline the private comparator beside
  `TextApi` and delete the separate one-consumer file.
- Preserve the scalar top-level fast path, recursive short-circuiting,
  `Object.hasOwn`, and missing/`undefined` normalization.
- Delete the 200,000-depth test because it claims unsupported end-to-end
  capability. Keep the wide first-difference proof because wide JSON values are
  supported and recursive comparison naturally short-circuits.
- Repair shared doctrine plus `best-api` judgment and `patch` review-finding
  execution. Do not edit the externally sourced `autoreview` mirror directly.

Implementation notes:
- Replaced the separate iterative `utils/deep-equal.ts` owner with a small
  recursive private relation beside `TextApi` in `interfaces/text.ts`.
- Removed the dead private utility export and routed all portable fixtures
  through public `TextApi.equals`.
- Removed only the unsupported 200,000-depth test; kept semantic, property, and
  wide first-difference coverage.
- Added the end-to-end supported-domain gate to shared Vision, `best-api`,
  `patch`, and Plite planning source rules, then regenerated skill mirrors.

Review fixes:
- User correction accepted: the first EQ-P1 implementation was not the best
  architecture because it optimized a reviewer-invented domain. Both the code
  and the workflow that accepted it were repaired.
- Agent-native parity review: PASS.

  | User action | Agent route | Source owner | Generated/doc owner | Proof | Status |
  |-------------|-------------|--------------|---------------------|-------|--------|
  | Challenge whether an API/implementation is best | `best-api review` | `.agents/rules/best-api.mdc`, `docs/vision/common.md` | `.agents/skills/best-api/SKILL.md` | regenerated text audit plus equality forward review/benchmark | PASS |
  | Apply a P2 finding during local behavior repair | `patch` architecture pressure and P2 classification | `.agents/rules/patch.mdc` | `.agents/skills/patch/SKILL.md` | source/mirror audit plus final P2 review | PASS |
  | Plan extremal Plite proof | `plite-plan` proof design | `.agents/rules/plite-plan.mdc` | `.agents/skills/plite-plan/SKILL.md` | source/mirror audit | PASS |

- Forward test: applying the repaired `best-api` rubric to current
  `TextApi.equals` kept the public call, colocated its one-consumer private
  owner, rejected the semantically different strict JSON helper, rejected the
  synthetic depth guarantee, and required the bounded benchmark. PASS.
- Final P2 autoreview found no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Isolated review baseline commit inherited local signing | 1 | Disable signing only for the temporary commit | Recreated with `-c commit.gpgsign=false`; review passed. |
| Full package test exposed unrelated contracts | 1 | Keep focused owner proof and inspect failure ownership | 1435 passed; three unrelated failures recorded below. |
| Affected Plite gate exposed existing adopter type errors | 1 | Record exact external package boundary | Plite package typecheck passed; list/table adopter failures are unrelated. |
| Broad diff view exceeded the intended output budget | 1 | Switch to narrow files, bounded reads, and exact searches | All subsequent audits were scoped and capped. |

Verification evidence:
- `pnpm --filter @platejs/plite test test/text-equality.test.ts`: 4 passed.
- `PLITE_FIXTURE_FILTER=utils/deep-equal pnpm --filter @platejs/plite test ./test/index.slow.ts`: 13 passed.
- `pnpm turbo typecheck --filter=./packages/plite`: passed.
- `pnpm --filter @platejs/plite brl`: passed, no barrels to generate.
- Scoped `pnpm exec biome check` over 14 changed equality files: passed.
- Three alternating public-API benchmark runs against the previous exact
  implementation: shallow ratios 0.8861, 0.8978, 0.8905 (limit 1.25);
  depth-64-to-512 scaling 6.7606, 6.8219, 6.8764 (limit 12).
- `pnpm --filter @platejs/plite test`: 1435 passed, three unrelated failures:
  existing `getNodeKeyDOMValue` exact-export mismatch, pending changeset
  contract, and native discarded-transaction node-key identity.
- Changed-file-isolated `pnpm check:plite:dev`: Plite package typecheck passed;
  existing list/table adopter errors remain at `BaseListPlugin.ts:994`,
  `BaseTablePlugin.ts:2334`, and `TablePlugin.tsx:65`.
- `pnpm install`: passed and regenerated skill mirrors.
- Exact source/mirror searches found the supported-domain gate in all three
  source owners and generated mirrors; no stale private equality import remains.
- Scoped `git diff --check`: passed.
- P2 autoreview of the exact baseline/current equality patch: clean.
- `main` and `origin/main` both lack `packages/plite`; no changeset applies.

Final handoff contract:
- PR line: N/A, no commit/push/PR requested.
- Issue / tracker line: N/A, no public mutation requested.
- Confidence line: high; targeted proof and review are green, broad unrelated
  failures are named rather than hidden.
- Flow table:
  - Reproduced: source/benchmark proof established unsupported complexity;
    browser N/A.
  - Verified: focused tests, fixtures, typecheck, lint, barrel, benchmark,
    source/mirror parity, agent-native review, and P2 review passed; browser N/A.
- Browser check: N/A, no visible/browser surface changed.
- Outcome: smaller equality owner plus durable review/execution scope gate.
- Caveat: broad package/dev gates still expose the unrelated failures listed
  above; the comparator intentionally shares the depth ceiling of adjacent
  Plite JSON operations.
- Design:
  - Chosen boundary: private lexical comparator beside public `TextApi`; shared
    supported-domain law plus decision-point rules in three agent routes.
  - Why not quick patch: changing only the comparator would let the same review
    failure recreate unsupported machinery later.
  - Why not broader change: public `TextApi.equals` is already the right API;
    strict core JSON equality has different semantics and ownership.
- Verified: exact commands and boundaries recorded above.
- PR body verified: N/A, no PR exists.

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
- Browser proof: N/A.
- Caveats: broad unrelated test/adopter failures and intentional shared JSON
  depth ceiling are recorded above.

Timeline:
- 2026-08-14T13:31:18.527Z Task goal plan created.
- 2026-08-14 User correction captured; ideal/current comparison, owner manifest,
  supported-domain audit, and three prototype benchmark runs completed before edits.
- 2026-08-14 Equality owner and agent doctrine repaired; generated mirrors,
  package proof, benchmarks, parity review, and P2 review completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run the final goal audit and hand back the exact local outcome. |
| What is the goal? | Make the accepted behavior simple and prevent future review findings from inventing isolated unsupported guarantees. |
| What have I learned? | The public API is right; the private implementation and workflow scope gate are wrong. |
| What have I done? | Simplified the equality owner, repaired source doctrine, regenerated mirrors, and completed package, benchmark, agent-native, and P2 proof. |

Open risks:
- Recursive comparison intentionally shares the depth ceiling of adjacent
  Plite JSON operations; a future end-to-end stack-safe JSON pipeline would be
  reversal evidence for revisiting this choice.
- The checkout contained pre-existing rule/mirror edits; the exact new
  supported-domain clauses were audited in both source and generated owners.
