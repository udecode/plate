# slate v2 cva cn class sweep

Objective:
Sweep `apps/www/src/app/(app)/examples/slate/_examples` for manual class string builders and
replace class composition with `cva()` / `cn()` where class names are involved.

Goal plan:
docs/plans/2026-05-27-slate-v2-cva-cn-class-sweep.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user request
- id / link: chat
- title: avoid manual array/filter/join class builders in examples
- acceptance criteria: migrate patterns like
  `['base', cond && 'is-x'].filter(Boolean).join(' ')` to `cva()`/`cn()`;
  review all examples for misses.

Completion threshold:
- No examples contain manual class array/filter/join builders.
- Remaining `.join(' ')` hits are documented as non-class data strings.
- Class composition uses `cva()` or `cn()` where applicable.
- Emotion remains absent from source.
- `Plate repo root` source audits, lint/typecheck/check, and focused browser
  proof pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-cva-cn-class-sweep.md` passes.

Verification surface:
- Source audits over `apps/www/src/app/(app)/examples/slate/_examples`.
- `Plate repo root`: `bun lint:fix`, `bun typecheck:site`, `bun lint`,
  `bun check`.
- Focused browser smoke on changed routes.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user correction in chat.
- Allowed edit scope: `apps/www/src/app/(app)/examples/slate/_examples`,
  `apps/www/public/index.css` only if styles need pairing, and this
  plan.
- Browser surface: changed example routes.
- Tracker sync: N/A, chat-only task.
- Non-goals: do not replace non-class data string joins or runtime arbitrary
  token class payloads with fake enumerated variants.

Blocked condition:
- Blocked only if verification cannot run and source audits cannot establish the
  requested class-composition cleanup.

Task state:
- task_type: implementation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: manual class builders are removed or documented as non-class data;
  verification passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-cva-cn-class-sweep.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Autogoal used because the sweep has measurable audit gates. |
| Active goal checked or created | yes | Goal created for class composition sweep. |
| Source of truth read before edits | yes | User correction read. |
| Tracker comments and attachments read | N/A | Chat-only task. |
| Video transcript evidence required | N/A | No video source. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Local style cleanup; no historical behavior claim. |
| TDD decision before behavior change or bug fix | N/A | Styling/class composition cleanup, not bug behavior. |
| Branch decision for code-changing task | N/A | No git/PR work requested. |
| Release artifact decision | N/A | Example-only code; no package release artifact. |
| Browser tool decision for browser surface | yes | Use focused local Chromium smoke if repo browser tool remains unavailable. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Browser pack selected | yes | `--with browser` applied. |
| Browser route / app surface identified | yes | Changed routes: `/examples/markdown-preview`, `/examples/code-highlighting`, `/examples/inlines`. |
| Browser tool decision recorded | yes | Local Chromium smoke acceptable if repo browser tool unavailable. |
| Console/network caveat policy recorded | yes | Browser smoke checks app/page errors. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence marked N/A: no video source.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded as N/A: examples/script declaration
      cleanup only, no published behavior.
- [x] Final handoff shape decided: concise summary with audits, commands, and
      browser proof.
- [x] Branch handling recorded as N/A: no git/PR work requested.
- [x] Local-env-rot retry policy recorded as N/A: no corruption-shaped failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note marked N/A: no public API/runtime/package boundary changed.
- [x] Review/autoreview target marked N/A: small follow-up to style-only sweep;
      prior helper hung on the same local diff class, manual audit plus full
      `bun check` and browser proof used.
- [x] Agent-native review marked N/A: no agent/tooling files changed.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: local Chromium smoke used against dev server on port 3210.
- [x] Browser pack: console and network errors checked; no app errors.
- [x] Browser pack: screenshot saved for markdown preview proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Source audits, `bun typecheck:site`, `bun lint`, `bun check`, and browser smoke passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: style cleanup request. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Browser smoke passed `/examples/markdown-preview`, `/examples/code-highlighting`, and `/examples/inlines`. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun typecheck:site` and `bun check` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifests or lockfile changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All checks ran in `Plate repo root`; plan checker runs from `plate-2`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Local Chromium smoke used; repo browser tool unavailable in this turn. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | `/tmp/slate-v2-cva-cn-class-sweep-markdown-preview.png`; JSON smoke result recorded. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output touched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: examples/declaration cleanup only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry-only component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | This plan only; claims are command-backed. |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: no high-risk surface. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no local-env-rot shape. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local target until clean, or record N/A | N/A: small style-followup; prior helper was unavailable/hung, manual audit plus full check/browser proof used. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR body. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `bun lint:fix`, `bun lint`, and `bun check` passed. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-cva-cn-class-sweep.md` | To run after this update. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Local Chromium smoke passed on changed routes. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Browser smoke reported `appErrors: []`. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Screenshot saved under `/tmp`; JSON counts recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | audited class composition patterns in examples | implementation |
| Implementation | done | migrated markdown-preview, code-highlighting, and inlines class composition | verification |
| Verification | done | source audits, lint/typecheck/check, and browser smoke passed | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | done | plan updated; checker is final command | final response |

Findings:
- `markdown-preview.tsx` used the exact bad
  `array.filter(Boolean).join(' ')` class builder.
- `code-highlighting.tsx` used `filter/map` before `cn()` for arbitrary Prism
  token class payloads; this can stay runtime-token driven but should not build
  classes manually.
- `inlines.tsx` had one ternary className that should be `cn(...)`.
- `multi-root-document.tsx` has `.join(' ')`, but it joins document text for a
  status label, not class names.

Decisions and tradeoffs:
- Use `cva()` for markdown preview’s known static token variants.
- Use `cn()` for arbitrary Prism token class payloads because those token names
  are runtime data, not a closed variant list.
- Leave non-class text joins alone.

Implementation notes:
- `markdown-preview.tsx` now uses `markdownSegmentVariants = cva(...)` and
  `cn(markdownSegmentVariants(...))`.
- `code-highlighting.tsx` now passes runtime token classes directly through
  `cn(...)` without manual filter/join.
- `inlines.tsx` now uses `cn(text.text === '' && ...)`.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `Plate repo root`: `rg -n 'filter\\(Boolean\\)|\\.join\\('\\'' '\\''\\)|const\\s+className\\s*=\\s*\\[|className=\\{[^}]*\\?[^}]*:' site/examples/ts`
  returned only `site/examples/ts/multi-root-document.tsx:38`, where
  `.join(' ')` builds document text for a status label, not class names.
- `Plate repo root`: `rg -n '@emotion|emotion|css\\(|cx\\(' . --glob '!site/.next/**' --glob '!site/out/**'`
  returned no matches.
- `Plate repo root`: `bun lint:fix` passed.
- `Plate repo root`: `bun typecheck:site` passed.
- `Plate repo root`: `bun lint` passed.
- `Plate repo root`: `bun check` passed: lint, package/site/root typecheck, Bun
  tests, and Slate React Vitest suite.
- `Plate repo root`: focused Chromium smoke against `localhost:3210` passed:
  `/examples/markdown-preview`, `/examples/code-highlighting`,
  `/examples/inlines`; markdown segments 5, code blocks 2, positioned code
  elements 33, inline badges 1, editor visible true, `appErrors: []`.
- Browser proof screenshot:
  `/tmp/slate-v2-cva-cn-class-sweep-markdown-preview.png`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, style-composition sweep.
  - Verified: source audits, lint/typecheck/check, and browser smoke passed.
- Browser check: local Chromium smoke passed on changed routes with zero app
  errors.
- Outcome: manual class builder pattern is gone from examples; markdown preview
  uses `cva()`, runtime arbitrary token classes use `cn()`, and ternary className
  miss uses `cn()`.
- Caveat: remaining `.join(' ')` is not class composition.
- Design:
  - Chosen boundary: static variants use `cva()`; dynamic class payloads use
    `cn()`.
  - Why not quick patch: swapping only the shown snippet would miss adjacent
    manual composition.
  - Why not broader change: non-class text joins and arbitrary Prism token names
    are runtime data, not a closed styling variant API.
- Verified: commands and browser proof above.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker item.
- Browser proof: focused Chromium smoke and screenshot listed above.
- Caveats: none beyond the documented non-class `.join(' ')`.

Timeline:
- 2026-05-27T08:44:06.946Z Task goal plan created.
- 2026-05-27T08:45:30Z Migrated `markdown-preview` manual class builder to
  `cva()`/`cn()`; tightened `code-highlighting` and `inlines`.
- 2026-05-27T08:47:00Z `bun lint:fix`, `bun typecheck:site`, and `bun lint`
  passed.
- 2026-05-27T08:48:30Z `bun check` found script declaration drift; added
  `commandKeyFor`, `getRunReuseDecision`, and `runId` typings.
- 2026-05-27T08:49:00Z `bun check` passed.
- 2026-05-27T08:51:00Z Focused Chromium smoke passed on changed routes.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Run checker, close goal, final response. |
| What is the goal? | Sweep Slate v2 examples for manual class builders and migrate to `cva()`/`cn()`. |
| What have I learned? | See Findings. |
| What have I done? | See Timeline. |

Open risks:
- None known.
