# Centralize Oxlint root config

Objective:
Centralize Oxlint at the repo root; done when one config owns base, Next,
policy, and deferred rules with zero app-local config references.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-19-centralize-oxlint-root-config.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: N/A
- title: One root Oxlint entrypoint
- acceptance criteria: exactly one `oxlint.config.ts` at repo root; root config
  scopes Next rules to both Next apps; generated deferred-risk ownership is
  root-relative; no stale app-specific override exports; lint is not run in
  this session.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: exact source-audit threshold exists
- improvement loop: centralize composition, delete app configs, validate config
  loading and source references without linting
- final score / loop closure: one config and zero stale references

Completion threshold:
- `rg --files -g 'oxlint.config.*'` returns only root `oxlint.config.ts`.
- Root config scopes Next native and React Doctor rules to `apps/plite/**` and
  `apps/www/**`, then applies the full root-relative deferred-risk overrides.
- App-specific deferred-risk exports and generator branches have zero matches.
- Config can be imported successfully without invoking the linter.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-centralize-oxlint-root-config.md` passes.

Verification surface:
- Source audits for config count and stale symbols.
- Direct Node import of root `oxlint.config.ts` and structural assertions for
  Next app scope, options, settings, and deferred override composition.
- N/A lint/autoreview: explicitly prohibited by the user this session.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not run lint or autoreview.
- Preserve unrelated concurrent migration edits.

Boundaries:
- Source of truth: current Oxlint configs, shared config modules, generator,
  and installed Oxlint/Ultracite config schemas.
- Allowed edit scope: root/app Oxlint configs and shared deferred-risk
  composition/generator; package lint scripts remain outside this config-only
  request.
- Browser surface: N/A: tooling config only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker.
- Non-goals: running lint, changing rule policy, repairing deferred diagnostics,
  package-script cleanup, commits, pushes, PRs, or public comments.

Output budget strategy:
- Use exact config files and symbol searches; cap generated-file output and
  inspect summaries instead of printing large deferred entry chunks.

Blocked condition:
- Stop only if Oxlint's override schema cannot scope native and JS plugins to
  app paths; installed schema confirms both are supported.

Task state:
- task_type: tooling configuration consolidation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: Oxlint overrides support both native `plugins` and `jsPlugins`, so a
  root config can scope Next rules without app entrypoints.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-centralize-oxlint-root-config.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | One root config; root-run ownership; no lint/autoreview |
| Timed checkpoint parsed | no | N/A: no duration |
| Skill analysis before edits | yes | `task` plus `autogoal`; no public API owner needed |
| Active goal checked or created | yes | Goal created for exact config/source-audit threshold |
| Source of truth read before edits | yes | Three configs, shared modules, generator, and installed override schema read |
| Tracker comments and attachments read | no | N/A: direct request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: current config is the direct source of truth |
| TDD decision before behavior change or bug fix | no | N/A: config structure; direct import assertions fit |
| Branch decision for code-changing task | yes | Current checkout; no branch operation |
| Release artifact decision | no | N/A: no package behavior change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: local change only |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact files and capped searches only |

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
- [x] Required video or screen-recording evidence is N/A: no video or recording.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: root owns final
      composition; shared base owns reusable rules; generator owns quarantine.
- [x] Release artifact recorded: N/A, private tooling configuration only.
- [x] Final handoff shape decided: local config count and structural proof.
- [x] Branch handling recorded: current checkout, no branch operation.
- [x] Local-env-rot retry recorded: N/A, no corruption signal.
- [x] Workspace authority recorded: proof ran at `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: prevent Next-rule leakage and preserve deferred
      Next exceptions; structural assertions cover both.
- [x] Review/P1 autoreview recorded: N/A, user explicitly stopped autoreview.
- [x] Agent-native review recorded: N/A, no agent-native source changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run config/stale-symbol audits | One config; zero stale symbols |
| Bug reproduced before fix | yes | Record previous topology | Three config entrypoints existed |
| Targeted behavior verification | yes | Import root config and assert structure | Next/policy/deferred assertions pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | Targeted config typecheck passed |
| Package exports or file layout changed | no | N/A | No package barrels or exports |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifests changed |
| Agent rules or skills changed | no | N/A | Agent-native files untouched |
| Workspace authority proof | yes | Run proof in owning repo | `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | N/A | Tooling config only |
| Browser final proof | no | N/A | No browser surface |
| CI-controlled template output changed | no | N/A | `templates/**` untouched |
| Package behavior or public API changed | no | N/A | No package behavior or API |
| Registry-only component work changed | no | N/A | Registry untouched |
| Docs or content changed | no | N/A | Only internal goal plan added |
| High-risk mini gate | yes | Prove Next scope and deferred ordering | App glob, policy-final rule, and all ten deferred Next files asserted |
| Agent-native review for agent/tooling changes | no | N/A | No agent action surface |
| Local install corruption suspected | no | N/A | No corruption signal |
| P1 autoreview for non-trivial implementation changes | no | N/A | User explicitly stopped autoreview |
| PR create or update | no | N/A | Local change only |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR/browser proof |
| Tracker sync-back | no | N/A | No tracker |
| Final handoff contract | yes | Record outcome and proof | Filled below |
| Final lint | no | N/A | User explicitly prohibited lint this session |
| Output budget discipline | yes | Use bounded reads/searches | Generated entries summarized, not streamed |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-centralize-oxlint-root-config.md` | Final checker passes after phase closure |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Configs, schema, presets, and references read | implementation |
| Implementation | complete | Root centralized; app configs deleted; generator simplified | verification |
| Verification | complete | Audits, import assertions, typecheck, diff check pass | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker | final response |
| Closeout | complete | Goal plan mechanically checked | final response |

Findings:
- Oxlint overrides support native and JS plugins, but registering plugins once
  and scoping only their rules avoids replacing base plugins.
- Ten deferred files contain Next rules; root quarantine must include them after
  the scoped Next override.

Decisions and tradeoffs:
- Register Next plugins globally, scope Next rules to both app paths, then apply
  exact-file deferred overrides -> one config without leaking Next rules.
- Leave package lint-script topology unchanged -> this request owns the Oxlint
  config entrypoint; package command cleanup is a separate broad cut.

Implementation notes:
- Removed both app configs and app-relative quarantine projections.
- Root owns JS plugin settings, strict options, Next scope, Plate policy
  precedence, and all deferred exact-file overrides.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Targeted `tsc` omitted `--ignoreConfig` | 1 | Add TS 7 required flag | Resolved |
| Isolated typecheck exposed missing named-export typing and broad JS policy values | 1 | Use typed default preset settings and cast only the JS boundary | Resolved |

Verification evidence:
- Config audit -> only `oxlint.config.ts`.
- Stale-symbol audit -> zero app override/filter/policy-config matches.
- Direct import -> correct Next scope and policy, 1,493 overrides, strict
  options, and plugin settings.
- Deferred Next audit -> all ten files have root-relative final overrides.
- Targeted TypeScript config check and `git diff --check` -> pass.

Final handoff contract:
- PR line: N/A: local-only change
- Issue / tracker line: N/A: no tracker
- Confidence line: high; exact structural assertions and typecheck pass
- Flow table:
  - Reproduced: three config entrypoints; browser N/A
  - Verified: one root config and zero stale symbols; browser N/A
- Browser check: N/A: tooling config only
- Outcome: root is the sole Oxlint configuration entrypoint
- Caveat: lint was deliberately not run
- Design:
  - Chosen boundary: root final composition plus reusable shared base/generator
  - Why not quick patch: deleting app configs alone loses scoped rules/exceptions
  - Why not broader change: package script topology is separate config ownership
- Verified: imports, audits, targeted typecheck, and diff check
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
- PR: N/A: local-only change
- Issue / tracker: N/A: no tracker
- Browser proof: N/A: tooling config only
- Caveats: lint and autoreview intentionally not run

Timeline:
- 2026-08-19T13:31:50.170Z Task goal plan created.
- 2026-08-19 Root composition centralized and app configs deleted.
- 2026-08-19 Source, import, deferred Next, type, and diff checks passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | One root Oxlint config with preserved app policy |
| What have I learned? | Scoped rules plus exact-file overrides preserve lanes |
| What have I done? | Centralized ownership and verified final structure |

Open risks:
- None in config structure. Lint diagnostics were not executed by user
  instruction.
