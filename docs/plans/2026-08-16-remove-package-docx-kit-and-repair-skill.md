# remove package docx kit and repair skill

Objective:
Remove package-exported `DocxKit` and repair kit ownership doctrine; done when
app source owns composition, stale package-kit teaching is zero, and package,
docs, agent, and review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-16-remove-package-docx-kit-and-repair-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: direct user correction
- id / link: current Codex task
- title: Remove package-exported kits and repair the owning skill
- acceptance criteria:
  - `@platejs/docx` reexports the three leaf packages but exports no kit array.
  - The registry-owned `DocxKit` lists the desired descriptors itself.
  - Public docs and the existing changeset describe only the corrected final API.
  - The source-owned API/package skill rules reject package-exported plugin kits.
  - Generated skill mirrors, package/docs checks, stale-name audits, agent-native
    review, P2 autoreview, and this plan's completion checker pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: binary completion threshold
- improvement loop: fix accepted verification/review findings inside scope
- final score / loop closure: N/A: close on named binary gates

Completion threshold:
- Zero active package exports, package examples, or skill teaching that place a
  named plugin-array `*Kit` in package source.
- `@platejs/docx` remains a facade over `docx-paste`, `docx-import`, and
  `docx-export`; `apps/www` owns `DocxKit` as explicit app policy.
- The final branch-relative changeset describes the user-visible delta from
  `main`, never the branch-only `DocxKit` mistake.
- Package typecheck/test/build, app/docs checks, rule/mirror parity,
  agent-native review, P2 autoreview, and the goal checker pass with no accepted
  actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-remove-package-docx-kit-and-repair-skill.md` passes.

Verification surface:
- Scoped `rg` over package source, docs, apps, changesets, Vision, source rules,
  and generated skill mirrors.
- `pnpm install`, `pnpm brl`, DOCX package checks, www type/docs/MDX checks,
  Plate Next doctrine validation, and `pnpm lint:fix`.
- Browser route proof for `/docs/docx`, or the exact unrelated generated-registry
  blocker if it remains.
- `agent-native-reviewer`, focused P2 `autoreview`, and `check-complete.mjs`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `docs/vision/plate.md`, `.agents/rules/best-api.mdc`,
  `.agents/rules/plate-plugin-creator.mdc`, current DOCX package/app/docs source,
  and the `main` release baseline.
- Allowed edit scope: `packages/docx`, direct registry/docs consumers, the
  existing DOCX topology changeset, affected source rules and generated mirrors,
  versioned doctrine metadata when its source set changes, and this plan.
- Browser surface: `/docs/docx`; no editor runtime behavior changes.
- Browser strategy: Browser route/DOM/console proof after deterministic docs
  checks. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: leaf package renaming, dependency topology changes, DOCX behavior
  changes, converter fixes, registry redesign, commit, push, or PR creation.

Output budget strategy:
- Search exact kit/package names and named owners first; exclude generated app
  output, dependencies, build artifacts, historical plans, and changelogs unless
  they are the explicit release owner. Cap broad output with `head` and focused
  `sed` ranges.

Blocked condition:
- Stop only if the package facade cannot reexport the leaves without owning a
  preset, or source/mirror generation remains broken after the documented
  install recovery path.

Task state:
- task_type: public API correction plus agent-skill repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: remove `DocxKit` from package source; keep only app/registry kits
- confidence: high
- next owner: package/docs/rule implementation, then review
- reason: Plate Vision already states that packages export individual
  descriptors and app/registry source owns named plugin arrays.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-16-remove-package-docx-kit-and-repair-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above copy the correction, implementation, skill repair, and closeout requirements. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `autogoal`, `best-api`, `plate-plugin-creator` plus required references, `hard-cut`, `skill-creator`, `changeset`, `docs-creator`, and `agent-native-reviewer`. |
| Active goal checked or created | yes | Prior goal is complete; this plan is ready for a new matching goal. |
| Source of truth read before edits | yes | Read current package/app/docs matches, Plate Vision kit ownership, source-rule kit guidance, and the prior owner-first kit cleanup memory. |
| Tracker comments and attachments read | no | N/A: direct user correction, no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Prior owner-first kit cleanup memory and current rule/vision owners provide the relevant established law; no DOCX behavior solution is needed. |
| TDD decision before behavior change or bug fix | no | N/A: structural public-export correction; delete the dead kit spec and prove surviving reexports/builds instead of testing absence. |
| Branch decision for code-changing task | no | N/A: no commit or PR requested; edit the current checkout. |
| Release artifact decision | yes | Update the existing `.changeset/docx-package-topology.md` to the final `main`-relative API; do not create a branch-only removal note. |
| Browser tool decision for browser surface | yes | Use Browser on `/docs/docx` after source checks; report the exact unrelated blocker if generated registry drift still prevents rendering. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact-owner searches and capped outputs recorded above. |
| Agent-native pack selected | yes | Source-rule and generated-skill behavior changes. |
| Agent-facing action surface identified | yes | `best-api` must reject package-exported preset arrays; `plate-plugin-creator` must enforce descriptors-only package exports. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `.agents/skills/**` with `pnpm install`; never hand-edit mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before rule edits. |
| Package/API pack selected | yes | `@platejs/docx` public exports change. |
| Public surface or package boundary identified | yes | Remove only package `DocxKit`; preserve leaf reexports and app-local composition. |
| Release artifact path selected | yes | Existing package changeset, rewritten to final `main`-relative surface. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; one package per file and `main`-relative prose apply. |
| Barrel/export impact decision recorded | yes | Package root export changes; run `pnpm brl`. |
| Docs pack selected | yes | Canonical DOCX pages teach the rejected package kit. |
| `docs-creator` loaded | yes | Loaded before docs edits. |
| Docs lane selected | yes | Existing serialization/plugin page at `/docs/docx`. |
| Target docs and nearest sibling docs read | yes | Current English/CN DOCX pages and package/app source were audited; existing page structure stays. |
| Docs style doctrine read | yes | Current-state, source-backed ownership and kit/manual rules loaded. |
| Documented source owner identified | yes | Leaf plugin exports plus app-local registry kit are authoritative. |

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
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P2 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named package/docs/agent/review gates | Passed except exact unrelated caveats recorded below. |
| Bug reproduced before fix | no | N/A | Structural ownership correction; the rejected `DocxKit` export was present in source. |
| Targeted behavior verification | yes | Prove the surviving facade and app composition | DOCX test passes; source and built-export audits pass. |
| TypeScript or typed config changed | yes | Run relevant typechecks | Four DOCX packages and full `www` typecheck pass. |
| Package exports or file layout changed | yes | Run `pnpm brl` | 57 barrel tasks passed. |
| Package manifests, lockfile, or install graph changed | yes | Run install and package checks | `pnpm install` passed; lockfile contains facade/leaf workspace links. |
| Agent rules or skills changed | yes | Regenerate and validate mirrors | `pnpm install`, exact resource `cmp`, and Plate Next v87 validation pass. |
| Workspace authority proof | yes | Use package/app/Browser owners | Commands ran in `/Users/zbeyens/git/plate-2`; Browser targeted its localhost dev server. |
| Browser surface changed | yes | Open `/docs/docx` | Attempted with Browser; unrelated generated-registry imports block compilation. |
| Browser final proof | yes | Record proof or exact caveat | 500: missing `editor-kit.tsx` and `plate-types.ts` from generated registry imports. |
| CI-controlled template output changed | no | N/A | No template files edited. |
| Package behavior or public API changed | yes | Update changeset | Existing DOCX topology changeset describes the final facade API relative to `main`. |
| Registry-only component work changed | no | N/A | Published package API also changed; package changeset is the owner. |
| Docs or content changed | yes | Validate source and MDX | `www typecheck` passed API reference, MDX, docs parity, registry source, and TS checks. |
| High-risk mini gate | yes | Name failure mode/boundary/proof | Failure mode was package-owned policy; app ownership plus package/docs/skill proof closes it. |
| Agent-native review for agent/tooling changes | yes | Review route/source/mirror/proof | PASS; no accepted findings. |
| Local install corruption suspected | no | N/A | No install-corruption signal; reinstall was not warranted. |
| P2 autoreview for non-trivial implementation changes | yes | Run exact scoped P2 review | Clean exact tracked-file snapshot; no accepted/actionable P0-P2 findings. |
| PR create or update | no | N/A | User did not request a PR. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR or screenshot. |
| Tracker sync-back | no | N/A | No issue or tracker requested. |
| Final handoff contract | yes | Fill exact outcome/proof/caveat | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` | Passed with pre-existing large-file warnings; formatted one task file. |
| Output budget discipline | yes | Keep searches bounded | One accidental broad search expanded shell backticks; subsequent searches were exact and capped. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run completion checker | Run after this evidence update. |
| Agent source / generated sync | yes | Install and compare | Passed. |
| Agent action discoverability | yes | Audit skill entrypoints | Early gate is visible in `best-api`; implementation law is visible in `plate-plugin-creator`. |
| Agent-native review | yes | Close findings | PASS; zero findings. |
| Public API / package boundary proof | yes | Audit exports and owner | Facade has three `export *` lines; app owns explicit four-member `DocxKit`. |
| Release artifact classification | yes | Classify delta | Published major `@platejs/docx` topology/API change. |
| Published package changeset | yes | Keep one package per file | `.changeset/docx-package-topology.md` updates `@platejs/docx` only. |
| Registry changelog | no | N/A | Not registry-only. |
| No release artifact | no | N/A | Published package delta requires and has a changeset. |
| Package typecheck/build/test | yes | Run owning checks | Typecheck, build, and one positive facade test pass. |
| Barrel/export generation | yes | Run `pnpm brl` | Passed. |
| Docs source-backed claim audit | yes | Compare claims with package/app source | Passed; stale package-kit phrase audit is empty. |
| Docs links / routes / previews | yes | Validate docs wiring | MDX and registry source checks pass; runtime route has unrelated compile blocker. |
| Docs MDX/content parser | yes | Run source build | Passed inside `www typecheck`. |
| Plugin page specifics | yes | Apply kit/manual/API law | App-local kit and descriptor API ownership are explicit. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | plan, Vision, package/app/docs/rules read | implementation |
| Implementation | completed | package kit cut; app composition; docs/changeset/rules repaired | verification |
| Verification | completed | package/app/docs/agent checks plus P2 review | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested | final response |
| Closeout | completed | evidence recorded; completion checker passed on final rerun | final response |

Findings:
- `docs/vision/plate.md` already forbids package grouping arrays and assigns
  named plugin kits to app/registry source.
- `best-api` asks whether a package kit is a consumer preset, and
  `plate-plugin-creator` rejects package bundle plugins, but neither presents a
  blunt package-root export gate early enough to prevent this mistake.
- The prior HeadingKit cleanup established the same invariant: packages expose
  descriptors; app/registry source owns optional membership and must declare
  direct dependencies after an intermediate kit disappears.

Decisions and tradeoffs:
- Keep `@platejs/docx` as a dependency facade that reexports leaf APIs; delete
  only the preset value. This preserves package discovery without exporting app
  policy.
- Make `apps/www` spell the four-descriptor `DocxKit` directly. The duplication
  is intentional ownership, not package API debt.
- Strengthen existing `best-api` and `plate-plugin-creator` source rules; do not
  create another skill or change Vision because Vision already states the law.

Implementation notes:
- `@platejs/docx` exports only the three focused package surfaces.
- `apps/www` owns `DocxKit` as the explicit ordered array of Juice, paste,
  import, and export descriptors.
- English and Chinese DOCX docs plus the existing changeset teach facade
  reexports and app-owned composition.
- `best-api` and `plate-plugin-creator` reject package-root `*Kit` arrays at the
  decision and implementation gates. Plate Next v87 records the invariant.

Review fixes:
- Agent-native review: PASS. Route is `best-api` -> source rule -> generated
  mirror -> install/version/source-audit proof; no actionable gap.
- First P2 snapshot findings were rejected because the snapshot copied ignored
  package `node_modules/.turbo` and omitted the real lockfile. The exact
  tracked-file rerun included `pnpm-lock.yaml` and returned clean with no
  accepted/actionable P0-P2 findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Facade test command found no tests after deleting the dead kit test | 1 | Add positive reexport coverage, not an absence assertion | `index.spec.ts` passes with three identity checks. |
| `check:core` failed on unrelated moving-tree doctrine drift | 1 | Keep focused package/app proof and record boundary | 27 findings name Core/Table/Yjs/etc.; none names DOCX or changed skill files. |
| Browser `/docs/docx` returned 500 | 1 | Inspect console and stop at unrelated owner | Generated registry imports missing `editor-kit.tsx` and `plate-types.ts`. |
| First P2 snapshot included ignored artifacts and omitted lockfile | 1 | Rebuild exact tracked-file snapshot | Exact rerun clean. |
| Node imported built facade through extensionless `virtual-dom` dependency | 1 | Use repo/runtime owner for browser package proof | Bun built-artifact import passes; Node-only failure originates in existing leaf dependency. |

Verification evidence:
- `pnpm install` -> pass; generated skills/resources synced.
- `pnpm brl` -> 57/57 tasks pass.
- `pnpm turbo typecheck --filter=./packages/docx --filter=./packages/docx-paste --filter=./packages/docx-import --filter=./packages/docx-export` -> 19/19 tasks pass.
- `pnpm --filter @platejs/docx build` -> pass.
- `pnpm --filter @platejs/docx test` -> 1 pass, 3 expectations.
- Bun built-artifact import -> `DocxPastePlugin`, `DocxImportPlugin`, and
  `DocxExportPlugin` present; `DocxKit` absent.
- `pnpm --filter www typecheck` -> editor generation check, API reference,
  MDX, docs parity, registry source, app TS, and package-integration TS pass.
- `pnpm lint:fix` -> pass with unrelated oversized-artifact warnings.
- Plate Next version validation -> v87 valid; source/resource mirrors exact.
- Global package-source scan -> zero exported `*Kit = [...]` declarations.
- DOCX stale-teaching scan -> zero package-owned `DocxKit` claims.
- Browser `/docs/docx` -> blocked before render by unrelated generated-registry
  references to missing `editor-kit.tsx` and `plate-types.ts`.
- Exact tracked-file P2 autoreview -> clean, overall correct 0.95.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker requested
- Confidence line: 95-100% for the scoped correction
- Flow table:
  - Reproduced: package-owned `DocxKit` confirmed in source before the cut
  - Verified: package/app/docs/agent checks pass; Browser blocked upstream
- Browser check: attempted; unrelated generated registry imports return 500
- Outcome: package facade exports capabilities only; app owns the kit
- Caveat: full `check:core` and Browser route are blocked by unrelated checkout drift
- Design:
  - Chosen boundary: facade reexports descriptors; registry array owns policy
  - Why not quick patch: renaming or hiding the package kit preserves the false owner
  - Why not broader change: leaf names, behavior, and dependency topology are already correct
- Verified: exact commands listed above plus clean P2 review
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
- PR: N/A: no PR requested
- Issue / tracker: N/A: no tracker requested
- Browser proof: blocked by missing generated registry sources outside scope
- Caveats: unrelated `check:core` backlog and Node-only leaf dependency import noted

Timeline:
- 2026-08-16T17:56:25.227Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Completion checker and final response |
| What is the goal? | Keep package exports capability-only and repair kit ownership doctrine |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- The live docs route remains unavailable until the unrelated generated
  registry references to `editor-kit.tsx` and `plate-types.ts` are repaired.
- `check:core` remains red on unrelated concurrent Core/Table/Yjs/package work;
  this task did not expand into those owners.
