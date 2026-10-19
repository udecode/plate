# Separate registry migrations

Objective:
Move document lineage and migrations out of the copied `editor-kit` registry
item into the dedicated migration example.

Goal plan:
docs/plans/2026-08-18-separate-registry-migrations.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Task source:
- type: accepted Best API/Plate UI ownership correction
- id / link: N/A
- title: Separate registry migrations
- acceptance criteria: `plugins.ts` exports only `EditorKit`; `editor-default`
  has no schema/migration setup; `document-migration-demo` owns its exact
  schema, fingerprint, and migration chain; optional generated contracts and
  registry metadata/changelog agree; zero stale cross-owner imports; tests,
  typecheck, Browser or exact blocker, lint, and P2 review close.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A: binary ownership/proof gates apply.
- improvement loop: hard-cut exports/callers, regenerate the optional contract,
  repair metadata/changelog/tests, then widen proof.
- final score / loop closure: zero default-editor migration references and all
  selected checks closed.

Completion threshold:
- Default copied editor composition contains no application schema lineage or
  migration machinery. The migration demo is self-contained and still proves
  v53→v55 behavior. Generated editor contracts reflect a derived schema.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-separate-registry-migrations.md` passes.

Verification surface:
- Focused migration and CLI generation tests; `plate generate --check`; www
  typecheck; registry source/changelog checks; zero-symbol audit; root lint;
  Browser on `editor-default` and `document-migration-demo`; P2 autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not redesign Core's migration API in this packet; only correct registry
  ownership accepted by the user.
- Keep application migration behavior available in the dedicated demo.
- No compatibility reexports from `editor-kit`.

Boundaries:
- Source of truth: live registry/CLI/Core source, accepted Best API verdict,
  Plate UI, hard-cut, Vision, tests, generated contracts, and registry metadata.
- Allowed edit scope: `plugins.ts`, `editor-default`, migration demo, their
  generated contract/metadata/tests, one registry changelog event, this plan;
  docs only if stale default-path teaching is found.
- Browser surface: `/blocks/editor-default` and
  `/blocks/document-migration-demo` if live metadata exposes those routes.
- Browser strategy: Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue/PR requested.
- Non-goals: Core/CLI API redesign, package API changes, migration algorithm
  changes, new schema identity names for real applications, or registry build.

Output budget strategy:
- Search only exact exports/consumers/metadata/docs and cap generated/test logs.

Blocked condition:
- Block only if the migration demo cannot own a valid app schema without a Core
  API change, or CI-controlled stale registry output prevents runtime proof.

Task state:
- task_type: registry ownership hard cut
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete after checker

Current verdict:
- verdict: `editor-kit` owns only `EditorKit`; migration lineage belongs solely
  to the dedicated example/app persistence owner.
- confidence: high; deterministic proof and final P2 review are clean.
- next owner: `plate-ui`
- reason: a copied default kit must not prescribe application persistence policy.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-separate-registry-migrations.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Latest `go` accepts the exact move-out/default cleanup stated above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Autogoal, Plate UI, Best API, hard-cut, registry changelog, and shadcn routing read. |
| Active goal checked or created | yes | Goal points to this exact plan. |
| Source of truth read before edits | yes | Exact exports, consumers, docs, Core types, CLI contracts, and Vision inspected. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: accepted ownership correction is settled by current source/skills/Vision. |
| TDD decision before behavior change or bug fix | no | N/A: ownership refactor; existing migration/CLI tests own behavior. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | yes | Registry changelog only; no package changeset. |
| Browser tool decision for browser surface | yes | In-app Browser; exact compile blocker recorded if stale generated registry persists. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact searches and capped proof logs. |
| Browser pack selected | yes | Registry examples are visible surfaces. |
| Browser route / app surface identified | yes | Default editor and document migration demos, resolved from metadata. |
| Browser tool decision recorded | yes | Browser; no native Chrome boundary. |
| Console/network caveat policy recorded | yes | Inspect console; stale generated registry failures are separate blockers. |
| Observable browser case captured | no | N/A: architecture cleanup, not report-backed bug. |
| Registry changelog pack selected | yes | Copied install/example API changes. |
| User-visible registry impact classified | yes | `editor-kit`, `editor-default`, `document-migration-demo`. |
| Source entry path selected | yes | `apps/www/src/registry/changelog/entries/2026-08-18-separate-document-migrations.mdx`. |
| Generator command selected | yes | Create/edit MDX, then `--write` and `--check`. |

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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source/type/test/generated/review gates | 110/110 migration+CLI, 18/18 generator, full www typecheck, lint, registry/changelog, v100, mirrors, zero symbols, clean P2. |
| Bug reproduced before fix | no | N/A | N/A: accepted ownership/API cleanup, not a behavior bug. |
| Targeted behavior verification | yes | Preserve migration behavior | Plate/CLI migration tests 110/110. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Full www typecheck passed. |
| Package exports or file layout changed | no | N/A | N/A: registry source only; no package barrel. |
| Package manifests, lockfile, or install graph changed | no | N/A | N/A: no manifest/lock change. |
| Agent rules or skills changed | yes | Sync and verify | `pnpm install`; mirrors exact; Plate Next v100 valid. |
| Workspace authority proof | yes | Run in owning workspace | All commands ran in `/Users/zbeyens/git/plate-2` with www/CLI/tooling owners selected. |
| Browser surface changed | yes | Capture proof or exact blocker | Both routes blocked before target modules by stale CI-owned generated imports. |
| Browser final proof | yes | Record caveat | Build Error from `src/__registry__/index.tsx`; local registry build forbidden. |
| CI-controlled template output changed | no | N/A | N/A: no `templates/**`; editor contract intentionally regenerated. |
| Package behavior or public API changed | no | N/A | N/A: copied registry API only; registry changelog owns release evidence. |
| Registry-only component work changed | yes | Use registry changelog | Source event and generated projections pass 70/70 check. |
| Docs or content changed | yes | Verify doctrine | Plate Vision and source-owned rules updated; mirrors exact. |
| High-risk mini gate | yes | Record boundary and proof | Prevent copied consumers sharing `plate-www-editor`; demo preserves advanced path; generated identity is derived. |
| Agent-native review for agent/tooling changes | yes | Close capability map | PASS: rule to source to mirror to v100 to proof; no gap. |
| Local install corruption suspected | no | N/A | N/A: deterministic stale generated host imports, not install rot. |
| P2 autoreview for non-trivial implementation changes | yes | Run P2 review | First pass found changelog mapping; fixes landed; final three-chunk review clean. |
| PR create or update | no | N/A | N/A: no PR requested. |
| Task-style PR body verified | no | N/A | N/A: no PR. |
| PR proof image hosting | no | N/A | N/A: no PR or valid runtime screenshot. |
| Tracker sync-back | no | N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill final fields | Recorded below. |
| Final lint | yes | Run `pnpm lint:fix` | Passed with configured oversized-artifact warnings only. |
| Output budget discipline | yes | Verify bounded output | Focused logs used; one large dev-server stop output recorded and not repeated. |
| Timed checkpoint | no | N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run completion checker | Pass after this update. |
| Browser interaction proof | yes | Exercise exact routes | Both exact routes reached unrelated generated Build Error. |
| Browser console/network check | yes | Record state | Console shows pre-target module-not-found failures; target runtime never starts. |
| Browser final proof artifact | no | N/A | N/A: screenshot would show only unrelated Build Error; DOM/log evidence recorded. |
| Exact case replay | no | N/A | N/A: not report-backed behavior repair. |
| Final ref and fingerprints | no | N/A | N/A: local candidate; generated fingerprint `fnv1a64:983f2e92578bb5da`. |
| Clean final runtime | no | N/A | N/A: local candidate and CI-owned runtime host blocker. |
| Retry-free stability | no | N/A | N/A: no native browser behavior claim. |
| Registry impact classification | yes | Record delta | `editor-plugins`, `editor-default`, `document-migration-demo`. |
| Registry changelog source | yes | Add source | `2026-08-18-separate-document-migrations.mdx`. |
| Registry changelog generation | yes | Run `--write` | Generated 70 events and projections. |
| Registry changelog check | yes | Run `--check` | Passed; target files resolve without diagnostics. |
| Registry generator test | yes | Run focused suite | 18/18; custom root and file-URL cases covered. |
| Registry package release split | yes | Classify release | Registry changelog only; no package changeset. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted boundary and exact source graph | implementation |
| Implementation | complete | kit/default cleaned; demo self-contained; contract/doctrine/changelog generated | verification |
| Verification | complete | deterministic gates green; exact Browser blocker recorded | closeout |
| PR / tracker sync | complete | N/A: none requested | closeout |
| Closeout | complete | final P2 review clean and handoff recorded | final response |

Findings:
- `editor-plugins` carried application-specific schema/migrations into every
  copied default editor despite only two examples consuming them.
- Generated exact types do not need named persisted identity; regeneration
  preserves the schema fingerprint with `identity.kind: derived`.
- Changelog file inference assumed item ID equals filename and ignored explicit
  registry `files`; the reviewed fix now resolves declared files correctly.

Decisions and tradeoffs:
- Keep Core's current migration API unchanged in this packet.
- Keep the full v53→v55 chain private to `document-migration-demo`; add no
  compatibility reexports.
- Preserve `EditorKit` as the copied composition and derive generated schema
  types without application lineage.

Implementation notes:
- Removed `EditorSchema`, `EditorMigrations`, migration imports, and the manual
  fingerprint constant from `plugins.ts`.
- Removed migration/schema options from `editor-default`.
- Added private demo-specific schema/migrations to `document-migration-demo`.
- Regenerated `plugins.schema.json` to derived identity.
- Repaired Best API, Plate UI, Plate Vision, mirrors, and Plate Next v100
  without advancing package attestations.
- Added registry changelog source/projections and explicit-file inference.

Review fixes:
- P2: resolve registry-declared source files when item IDs differ from filenames.
- P2: honor custom `--registry-root` during that resolution.
- P2: use `pathToFileURL` for portable direct-script execution.
- Added two generator regressions; final review clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser routes compile stale generated registry | 2 | Stop; local registry build forbidden | Exact module-not-found blocker recorded for CI owner. |
| Autoreview rejected oversized schema JSON | 1 | Supply semantic excerpt plus real generate check | Review proceeded without weakening artifact proof. |
| First P2 review found missing changelog target files | 1 | Fix resolver at tooling owner | Target resolves; 18 tests and final review clean. |

Verification evidence:
- Plate/CLI migration and generator suites: 110 passed, 286 expectations.
- Changelog generator suite: 18 passed.
- Full www typecheck and `plate generate --check`: passed.
- Generated identity is derived with fingerprint `fnv1a64:983f2e92578bb5da`.
- Registry source and 70-event changelog checks: passed.
- Root lint: passed with configured large-artifact warnings.
- Plate Next version tests: 14/14; v100 and mirrors exact.
- Zero default-kit lineage/migration symbols in selected source/contract.
- Final isolated P2 autoreview: clean across three chunks.
- Both exact Browser routes blocked before target code by stale CI-owned imports.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: High for source/type/test/release ownership; runtime visual
  proof blocked externally.
- Flow table:
  - Reproduced: tests N/A (ownership cleanup), browser Build Error from stale host
  - Verified: tests/type/generated/release/review green, browser blocked
- Browser check: both exact routes blocked by stale `src/__registry__/index.tsx`.
- Outcome: copied default composition is migration-free; the dedicated demo
  owns lineage and migrations.
- Caveat: CI-generated registry host must refresh before visual verification.
- Design:
  - Chosen boundary: reusable `EditorKit` versus dedicated persistence example.
  - Why not quick patch: aliases would keep the wrong public owner alive.
  - Why not broader change: Core migration API redesign was not accepted here.
- Verified: exact commands listed above.
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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: blocked by stale CI-generated registry imports.
- Caveats: runtime proof awaits generated-host refresh; source lane is clean.

Timeline:
- 2026-08-18T21:40:56.538Z Task goal plan created.
- 2026-08-18 Hard-cut default lineage, moved demo policy, regenerated contract.
- 2026-08-19 Repaired doctrine/tooling, closed review findings, final proof green.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Keep copied editor composition migration-free |
| What have I learned? | Derived contracts need no persisted identity; changelog mapping needed explicit metadata support |
| What have I done? | Hard-cut default lineage, moved demo policy, regenerated contracts, repaired doctrine/tooling, verified |

Open risks:
- CI must refresh generated `src/__registry__` before Browser can verify the
  exact routes. No source/type/test/review risk remains open.
