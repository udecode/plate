# scope copilot kit to demo

Objective:
Keep `CopilotKit` only in `copilot-demo`; remove it from every other editor
composition and synchronize registry metadata, tests, and changelog artifacts.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-scope-copilot-kit-to-demo.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: direct user correction
- id / link: current Codex task; no tracker
- title: Scope CopilotKit to its demo
- acceptance criteria: `editor-ai` and `markdown-streaming-demo` reuse canonical
  `EditorKit` without `CopilotKit`; `copilot-demo` remains the sole consumer
  composition that imports/appends `CopilotKit`; registry metadata, contract
  tests, changelog source/projections, and focused checks match that boundary.

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
- initial confidence score: N/A: binary source and metadata invariant
- improvement loop: N/A: one-shot correction
- final score / loop closure: N/A

Completion threshold:
- Among editor consumer compositions, only `copilot-demo.tsx` imports or
  appends `CopilotKit`; AI and Markdown streaming use `EditorKit` directly;
  their registry metadata no longer depends on `@plate/copilot-kit`; focused
  registry, generation, changelog, formatting, source-audit, and review gates
  pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-scope-copilot-kit-to-demo.md` passes.

Verification surface:
- Exact `CopilotKit` source/import audit; `www` editor generation check;
  registry contract test and source checker; changelog generator check;
  scoped Biome/diff check; proportional P2 autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the three editor consumers, their registry metadata and
  contract test, canonical `components/editor/editor.ts`, Copilot kit owner,
  and the current editor-runtime changelog event.
- Allowed edit scope: those exact registry sources, generated changelog
  projections, focused contract test, and this plan.
- Browser surface: N/A: plugin-array ownership only; no JSX/rendering change.
- Browser strategy: N/A for this correction. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker.
- Non-goals: changing `CopilotKit` itself, canonical `EditorKit`, plugin APIs,
  component rendering, package code, or unrelated registry compositions.

Output budget strategy:
- Read exact files and use narrow `rg` patterns under `apps/www/src/registry`;
  exclude generated blobs until generator verification and cap command output.

Blocked condition:
- Stop only if AI or Markdown streaming directly calls a Copilot capability
  absent from canonical `EditorKit`; source and type evidence decide this.

Task state:
- task_type: registry composition correction
- task_complexity: micro
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: previous change over-preserved `CopilotKit`; scope it to its demo
- confidence: high, subject to exact consumer capability audit
- next owner: task
- reason: feature-specific composition belongs only to the feature demo named
  by the user; other examples should consume the canonical editor unchanged.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-scope-copilot-kit-to-demo.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Only `copilot-demo` may consume `CopilotKit`; AI/Markdown streaming and all matching metadata/prose must stop doing so |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | Read `plate-ui`, `shadcn`, `registry-changelog`, and `autogoal`; shadcn component commands are N/A because no component is added or styled |
| Active goal checked or created | yes | No active goal existed; matching goal created for this plan |
| Source of truth read before edits | yes | Read AI, Copilot, Markdown streaming, and playground consumers; canonical editor; Copilot kit; registry metadata/test; and current changelog event |
| Tracker comments and attachments read | no | N/A: direct request without tracker or attachment |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro correction to the just-edited owner set |
| TDD decision before behavior change or bug fix | no | N/A: static composition ownership correction; existing registry contracts are the proof |
| Branch decision for code-changing task | no | N/A: no branch requested |
| Release artifact decision | yes | Update the existing registry changelog event; no package changeset |
| Browser tool decision for browser surface | no | N/A: no rendered surface changes |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact files and capped registry searches only |
| Docs pack selected | yes | Incidental registry changelog correction |
| `docs-creator` loaded | no | N/A: `registry-changelog` owns this artifact |
| Docs lane selected | yes | Existing registry changelog event and generated projections |
| Target docs and nearest sibling docs read | yes | Existing event is the target; sibling contract was read in the preceding packet and will be source-checked here |
| Docs style doctrine read | yes | `registry-changelog` authoring contract read completely |
| Documented source owner identified | yes | `apps/www/src/registry/changelog/entries/*.mdx` |

Work Checklist:
- [x] N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording.
- [x] Nearby repo instructions and registry ownership patterns read before edits.
- [x] Implementation fixes the consumer ownership boundary: only
      `copilot-demo` composes `CopilotKit`; its definition remains intact.
- [x] Release artifact requirement recorded: update existing registry changelog;
      package changeset N/A.
- [x] Final handoff shape decided: corrected consumers, metadata/prose, focused
      proof, browser N/A, no PR/tracker.
- [x] Branch handling N/A: no branch requested.
- [x] Local-env-rot policy: reinstall once only for documented corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note: copied-install metadata could retain a dead optional
      dependency; registry source checker and exact source audit own proof.
- [x] P2 autoreview ran against an isolated scoped bundle; one changelog
      omission was fixed and the second pass returned clean.
- [x] Agent-native review N/A: no agent/tooling change.
- [x] Output budget discipline recorded: exact files and capped searches only.
- [x] Docs pack: existing registry changelog event and MDX source owner recorded.
- [x] Docs pack: named registry items and composition claim will be checked against live source.
- [x] Docs pack: N/A for reference voice; this is a registry migration event.
- [x] Docs pack: N/A; no links, anchors, or previews.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run every named focused gate | Sole-consumer audit, editor generation, registry test/source checker, changelog check, Biome/diff, and P2 review pass |
| Bug reproduced before fix | yes | Record static pre-fix evidence | Audit found four consumer compositions and four copied dependency declarations before correction |
| Targeted behavior verification | yes | Verify composition and install metadata | Registry contract 5/5 with 159 expectations; source checker passes |
| TypeScript or typed config changed | yes | Run relevant typed checks | Editor generation passes; full `www` typecheck is red only in unrelated list, media, table, and suggestion owners, with no task-file diagnostics |
| Package exports or file layout changed | no | N/A | No package exports or public file layout changed |
| Package manifests, lockfile, or install graph changed | no | N/A | Only registry metadata changed; copied install closure passes |
| Agent rules or skills changed | no | N/A | No agent source changed |
| Workspace authority proof | yes | Run proof in owning repo/app | All commands ran in `/Users/zbeyens/git/plate-2`; app gates targeted `www` |
| Browser surface changed | yes | Attempt affected standalone routes | Browser attempted `/blocks/editor-ai` and `/blocks/playground` against local `www` |
| Browser final proof | no | Record exact blocker | Existing stale `src/__registry__/index.tsx` imports deleted `editor-kit.tsx` and `plate-types.ts`, producing 500 before task code loads; local `build:registry` is forbidden |
| CI-controlled template output changed | no | N/A | No template output changed |
| Package behavior or public API changed | no | N/A | No package changeset applies |
| Registry-only component work changed | yes | Update registry changelog owner | Existing MDX event and generated projections updated |
| Docs or content changed | yes | Verify source-backed changelog artifact | Generator checked all 59 events |
| High-risk mini gate | yes | Prove no dead copied dependency survives | Global registry test and exact `rg` audit prove only `copilot-demo` declares `@plate/copilot-kit` |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes |
| Local install corruption suspected | no | N/A | Browser failure is deterministic stale generated source, not install corruption |
| P2 autoreview for non-trivial implementation changes | yes | Run isolated scoped review until clean | First pass found changelog omission; fixed; second pass clean at 0.98 |
| PR create or update | no | N/A | No PR requested |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR or proof image |
| Tracker sync-back | no | N/A | No tracker |
| Final handoff contract | yes | Record exact outcome and caveats | Filled below |
| Final lint | yes | Run scoped equivalent | Biome checked 10 supported source/generated files; MDX is ignored and validated by its generator |
| Output budget discipline | yes | Keep output bounded | Exact-file reads and capped searches; one dev-server shutdown log was truncated after the blocker was already captured |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run completion checker | `check-complete.mjs` passes |
| Docs source-backed claim audit | yes | Compare event with live source | All five named registry items match the corrected composition packet |
| Docs links / routes / previews | no | N/A | Entry contains no links or anchors |
| Docs MDX/content parser | yes | Run owning parser/generator | Registry changelog generator write/check pass; `build:source:dev` also generated MDX before browser startup |
| Plugin page specifics | no | N/A | No plugin page changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | exact owner/consumer/metadata audit | implementation |
| Implementation | completed | only Copilot demo retains feature composition and dependency | verification |
| Verification | completed | focused source, generated, test, lint, and review gates pass | closeout |
| PR / tracker sync | completed | N/A: neither requested | final response |
| Closeout | completed | ledger and caveats recorded | final response |

Findings:
- `CopilotKit` is currently composed by four consumers: `copilot-demo`,
  `editor-ai`, `markdown-streaming-demo`, and internal `playground-demo`.
- `editor-ai` and Markdown streaming do not call Copilot APIs. They can consume
  canonical `EditorKit` directly.
- `playground-demo` installs `CopilotKit` only to disable `CopilotPlugin` for
  its normal path. Removing both the kit and that redundant disable branch
  satisfies the sole-consumer invariant without leaving a dangling configure.
- The Copilot kit definition and its own registry item remain; “only” applies
  to editor consumer composition, not to deleting the feature owner.

Decisions and tradeoffs:
- Apply the user's “only copilot demo” rule literally across all registry
  consumer compositions, including the internal playground.
- Use `plugins: EditorKit` when no terminal feature kit remains; a one-item
  spread copy would be pointless composition noise.

Implementation notes:
- AI and Markdown streaming now pass `EditorKit` directly.
- Playground removed `CopilotKit`, the redundant `CopilotPlugin` disable
  branch, and its copied dependency.
- `copilot-demo` remains unchanged as the sole feature consumer.
- Registry metadata/test and changelog source/projections enforce the boundary.

Review fixes:
- Accepted P2 finding: the changelog row omitted affected internal
  `playground-demo`; added it to the existing event and regenerated projections.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter www dev -- --port 3010` forwarded a literal `--` | 1 | Run `next dev --port 3010` directly after MDX generation | Dev server started correctly |
| Scoped Biome invocation named only ignored MDX | 1 | Validate TS/JSON with Biome and MDX with owning generator | Both owning checks pass |
| Full `www` typecheck reports unrelated existing errors | 1 | Inspect diagnostic paths and use focused owner gates | No diagnostic references a task file |
| Browser routes return 500 from stale generated registry imports | 2 | Preserve CI-owned generated output and record blocker | No source mutation; focused static/runtime compilation gates remain green |

Verification evidence:
- Sole-consumer source audit: only `copilot-kit.tsx` and `copilot-demo.tsx`
  contain `CopilotKit`; only `copilot-demo` declares `@plate/copilot-kit`.
- `pnpm --filter www editor:check`: canonical generated editor contract passes.
- `bun test apps/www/src/registry/registry.test.ts`: 5 passed, 0 failed,
  159 expectations.
- Registry source checker and 59-event changelog check pass.
- Scoped Biome and `git diff --check` pass.
- Final isolated P2 autoreview: clean, no accepted/actionable findings.
- Browser attempted both affected route families; stale CI-owned
  `src/__registry__/index.tsx` prevents app compilation before task code loads.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct request
- Confidence line: high for source/install ownership; browser blocked by unrelated generated debt
- Flow table:
  - Reproduced: four accidental consumers found by exact source audit
  - Verified: sole-consumer audit plus registry/generation/changelog/review gates
- Browser check: attempted; blocked before task code by stale generated imports
- Outcome: Copilot composition and dependency exist only in `copilot-demo`
- Caveat: app-wide typecheck and Browser are blocked by unrelated existing debt
- Design:
  - Chosen boundary: feature demo consumer; feature owner remains reusable
  - Why not quick patch: removing only AI would leave Markdown/playground drift
  - Why not broader change: Copilot kit implementation and canonical editor are correct
- Verified: exact source/install invariant and focused proof suite
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
- Issue / tracker: N/A: none
- Browser proof: blocked by stale CI-owned `src/__registry__` imports
- Caveats: unrelated full-app TypeScript errors remain outside this packet

Timeline:
- 2026-08-14T17:49:03.808Z Task goal plan created.
- 2026-08-14 Audited four consumers; removed Copilot composition and metadata
  from AI, Markdown streaming, and playground.
- 2026-08-14 Focused registry/generation/changelog/source checks passed.
- 2026-08-14 Accepted one review finding, repaired changelog coverage, and
  completed a clean second P2 review.
- 2026-08-14 Browser attempt exposed unrelated stale generated registry imports;
  no forbidden local registry build was run.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Keep CopilotKit only in copilot-demo |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- No task-local source or install risk remains. Browser proof is unavailable
  until CI regenerates the stale registry index; broad TypeScript debt remains
  outside this correction.
