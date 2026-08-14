# repair registry dependency metadata

Objective:
Repair registry install metadata; done when every audited published item has source-backed package/registry closure, durable checks pass, and the changelog is generated.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-repair-registry-dependency-metadata.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user follow-up to the completed registry dependency audit
- id / link: current Codex task; audit ledger `docs/plans/2026-08-13-audit-registry-dependency-metadata.md`
- title: Fix all registry dependency metadata drift
- acceptance criteria: repair every confirmed missing, duplicate, malformed, or
  stale `dependencies` / `registryDependencies` row across all
  `apps/www/src/registry/registry-*.ts` owners; preserve intentional optional
  feature, style, teaching, and classic behavior; strengthen the source checker;
  generate a user-facing registry changelog; verify copied-install closure.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: 0.82 from the completed exhaustive audit
- improvement loop: inspect each reported exception, patch metadata and checker,
  rerun closure, typecheck/lint, changelog generation, and P2 review
- final score / loop closure: 0.97; all registry closure, changelog, focused
  tests, lint, diff, and P2 review gates pass. The broad www typecheck reaches
  and passes the registry checker, then stops on unrelated shared
  List/Suggestion/Table and existing registry component WIP errors.

Completion threshold:
- Every confirmed published missing package/registry dependency and direct-owner
  drift from the audit is repaired; duplicate rows and the malformed catalog row
  are resolved; every stale-dependency candidate receives a source-backed keep
  or remove verdict; the checker rejects uncovered registered imports; focused
  registry checks, www typecheck, lint, changelog checks, and P2 review pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-repair-registry-dependency-metadata.md` passes.

Verification surface:
- `apps/www/scripts/check-registry-source.mts`, focused registry tests, a
  source-derived fixed-point closure audit, `pnpm --filter www typecheck`,
  `pnpm lint:fix`, registry changelog generation/check, and P2 autoreview.
- Browser is N/A unless a runnable page exposes source registry metadata; this
  changes CLI/copy install wiring, not rendered UI.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the completed audit ledger, all
  `apps/www/src/registry/registry-*.ts` declarations, their registered source
  files, `registry.ts`, shadcn registry metadata, and registry checker/tests.
- Allowed edit scope: registry metadata owners, the owning registry checker and
  focused tests, registry changelog source/generated artifacts, and this plan.
- Browser surface: none: source registry metadata is consumed by the shadcn CLI
  and its local generated endpoint is CI-controlled.
- Browser strategy: N/A: no rendered component or interaction changes. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker.
- Non-goals: component/runtime behavior changes, package API changes, package
  manifest changes, classic modernization, CI-controlled registry build output,
  templates, or removal of deliberate optional/style/teaching dependencies.

Output budget strategy:
- Reuse the completed audit inventory; inspect only named mismatches and compact
  checker summaries. Save any broad closure report under `/tmp`; exclude
  generated registry output, templates, `.next`, `node_modules`, and builds.

Blocked condition:
- Block only if the registry source graph cannot be resolved by the existing
  source checker and no deterministic local closure check can replace it.

Task state:
- task_type: registry install-metadata repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid; existing checks pass despite proven install-closure gaps
- confidence: 0.82
- next owner: task
- reason: metadata mirrors registered source ownership, while the existing
  checker validates target existence but not complete imported dependency closure

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-repair-registry-dependency-metadata.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Fix the completed audit's full confirmed set; preserve intentional feature/style/teaching dependencies; add durable proof |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `plate-ui` owns registry wiring; `shadcn` owns copied-install semantics; `registry-changelog`, `task`, and `autogoal` own release/workflow closure |
| Active goal checked or created | yes | `get_goal` returned no active goal; create after this plan is filled |
| Source of truth read before edits | yes | Completed exhaustive audit ledger and all required skills read |
| Tracker comments and attachments read | no | N/A: no tracker or attachment |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: the completed source audit is the direct task source |
| TDD decision before behavior change or bug fix | no | N/A: metadata/checker repair; focused checker regression coverage replaces behavior TDD |
| Branch decision for code-changing task | yes | Work in the current checkout; no branch/PR requested |
| Release artifact decision | yes | Registry-only user-visible install-shape change requires registry changelog; no package changeset |
| Browser tool decision for browser surface | no | N/A: no rendered UI; CLI/source checker owns proof |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Reuse audit inventory; inspect named rows; artifact broad results |
| Registry changelog pack selected | yes | Copied-install metadata changes are user-visible |
| User-visible registry impact classified | yes | Fixed registry items install all imported packages/files without accidental transitivity |
| Source entry path selected | yes | `apps/www/src/registry/changelog/entries/2026-08-13-fix-registry-install-dependencies.mdx` |
| Generator command selected | yes | Create source entry, run `--write`, then `--check` |
| Browser pack selected | yes | Pack included to record explicit N/A for metadata-only change |
| Browser route / app surface identified | no | N/A: registry source metadata has no rendered route and generated registry output is CI-controlled |
| Browser tool decision recorded | no | N/A: source/checker/CLI closure is the owning surface |
| Console/network caveat policy recorded | no | N/A: no rendered route or network behavior changed |

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
- [x] Final handoff shape decided: exact metadata repairs, checker coverage, changelog and proof; no PR/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: current checkout; no branch/PR requested
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
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed. N/A: no package code.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof. N/A: metadata-only, no rendered route.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope. N/A: no browser surface.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named registry closure, tests, changelog, lint, review | Passed; evidence below |
| Bug reproduced before fix | yes | Completed audit proved current checker missed install closure | Audit ledger inventories 8 package, 23 registry, duplicate and stale rows |
| Targeted behavior verification | yes | Run focused registry proof | Checker passes; 11/11 focused tests pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | Registry checker passes inside www typecheck; broad command later fails on unrelated shared WIP listed below |
| Package exports or file layout changed | no | N/A | No package exports or public file layout changed |
| Package manifests, lockfile, or install graph changed | no | N/A | Registry metadata only; no workspace manifest/lock change |
| Agent rules or skills changed | no | N/A | No agent source changed |
| Workspace authority proof | yes | Run in owning repo/app | All commands ran in `/Users/zbeyens/git/plate-2`; checker ran through `www` |
| Browser surface changed | no | N/A | Metadata/checker only; no rendered route changed |
| Browser final proof | no | N/A | CLI copied-install closure is the owning proof surface |
| CI-controlled template output changed | no | N/A | Templates and registry build output untouched |
| Package behavior or public API changed | no | N/A | No package changeset; registry changelog owns this user-visible install fix |
| Registry-only component work changed | yes | Registry changelog | Source entry and generated projections updated |
| Docs or content changed | no | N/A | Plan and changelog only; no docs route content |
| High-risk mini gate | yes | Validate checker false positives/negatives | P2 hardened owner correlation, URL trust, CommonJS/TS/dynamic import coverage |
| Agent-native review for agent/tooling changes | no | N/A | No agent tooling changed |
| Local install corruption suspected | no | N/A | No environment-corruption signals |
| P2 autoreview for non-trivial implementation changes | yes | Scoped local review until clean | Final scoped review: no accepted/actionable P0-P2 findings |
| PR create or update | no | N/A | No PR requested |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR or browser image |
| Tracker sync-back | no | N/A | No tracker |
| Final handoff contract | yes | Fill fields below | Complete |
| Final lint | yes | Scoped equivalent | Biome passes all changed source/changelog files |
| Output budget discipline | yes | Bound broad output | Searches capped; scoped fixture used for review; changelog generator output was bounded |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run completion checker | Run after this ledger update |
| Registry impact classification | yes | Record delta | Published items install complete direct/copied closure without redundant declarations |
| Registry changelog source | yes | Add source MDX | `2026-08-13-fix-registry-install-dependencies.mdx` |
| Registry changelog generation | yes | Run `--write` | Wrote 59 events from 59 source entries |
| Registry changelog check | yes | Run `--check` | Passed: 59 events from 59 source entries |
| Registry generator test | no | N/A | Generator/schema/source layout unchanged |
| Registry package release split | yes | Record release artifact | Registry changelog only; no package code |
| Browser interaction proof | no | N/A | No rendered/browser behavior changed |
| Browser console/network check | no | N/A | No browser surface |
| Browser final proof artifact | no | N/A | No browser surface |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | audit ledger and skills read | implementation |
| Implementation | complete | metadata, checker, changelog repaired | verification |
| Verification | complete | closure/test/changelog/lint/diff/P2 green | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | plan finalized; completion checker next | final response |

Findings:
- The completed audit found eight missing package dependency pairs, 23 missing
  registry dependency pairs, one direct-owner registry dependency masked by a
  cycle, three duplicate package rows, one empty published catalog item, and a
  set of stale candidates requiring source-backed keep/remove decisions.

Decisions and tradeoffs:
- Metadata must mirror source ownership and fixed-point install closure. Keep
  deliberate optional feature, CSS/style, and teaching composition even when a
  direct import does not force it; remove only dependencies proven stale.
- Strengthen the owning checker instead of relying on another one-time audit.

Implementation notes:
- Repaired direct package and copied-registry ownership across blocks,
  components, examples, kits, and UI registries while preserving deliberate
  optional feature, style, teaching, collaboration, and classic composition.
- `check-registry-source.mts` parses ESM, export, CommonJS, TypeScript import
  equals, and dynamic imports; validates source and installed-target ownership;
  walks Plate/shadcn package closure; rejects unknown aliases and unsafe URL
  owner inference; and checks duplicate declarations.
- Internal `meta.registry: false` demos remain outside published install-closure
  enforcement, but still receive duplicate checks and corrected local metadata.

Review fixes:
- Correlated relative source owners with their installed target owners.
- Rejected unresolved project aliases and explicit missing asset/CSS imports.
- Normalized only recognized Plate/shadcn registry URLs and stopped trusting
  arbitrary external URL basenames.
- Covered `require`, TypeScript external module references, and Babel
  `ImportExpression` nodes.
- Expanded the changelog target list to every published item whose dependency
  metadata differs from HEAD; internal registry-disabled demos are excluded.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Used app-relative path with `pnpm --filter www exec tsx` | 1 | Run `tsx scripts/...` from the filtered app cwd | Passed |
| Assumed a nonexistent `registry:changelog` app script | 1 | Use the skill-owned root generator command | `--write` and `--check` passed |
| P2 review found checker/changelog gaps | 3 cycles | Patch only the same checker/changelog owners and re-review | Final review clean |

Verification evidence:
- `pnpm --filter www exec tsx scripts/check-registry-source.mts`: pass.
- `bun test apps/www/src/registry/registry.test.ts apps/www/scripts/registry-dependencies.test.mts`: 11 pass, 0 fail.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write`: wrote 59 events from 59 entries.
- Same generator with `--check`: pass.
- Scoped `pnpm exec biome check ...`: pass.
- Scoped `git diff --check -- ...`: pass.
- Scoped P2 autoreview fixture: clean, patch correct at 0.87 confidence.
- `pnpm --filter www typecheck`: registry generation/API/docs/checker stages pass;
  broad TypeScript then fails on unrelated shared WIP in list-base/list-kit,
  media-file-node-static, table-toolbar-button.spec, and package List,
  Suggestion, and Table plugin types. No affected metadata/checker error appears.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker
- Confidence line: 97%
- Flow table:
  - Reproduced: completed audit proved checker blind spots; browser N/A
  - Verified: checker + 11 tests + changelog + lint + P2; browser N/A
- Browser check: N/A: no rendered surface
- Outcome: published registry metadata has direct copied-file and package closure; durable checker prevents recurrence
- Caveat: broad www typecheck is blocked by unrelated shared package/component WIP
- Design:
  - Chosen boundary: registry declarations plus their source closure checker
  - Why not quick patch: metadata-only edits would leave the same checker blind spot
  - Why not broader change: runtime components, package manifests, and templates do not own copied-install metadata
- Verified: exact commands recorded above
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
- Issue / tracker: N/A: no tracker
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-08-13T19:48:50.617Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | Repair all audited registry dependency drift and prevent recurrence |
| What have I learned? | Existing checker misses full source/import install closure |
| What have I done? | Read source audit and governing skills; materialized execution plan |

Open risks:
- A naive stale-dependency cleanup could remove intentional optional, style, or
  teaching composition; every removal needs local source/registry evidence.
