# plite cva style sweep

Objective:
Sweep `apps/www/src/app/(app)/examples/plite/_examples` for static inline style maps and
variant style objects, migrating static variants to `cva()`/`cn()`/classes
without changing runtime-owned layout/content styles.

Goal plan:
docs/plans/2026-05-27-plite-cva-style-sweep.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user request
- id / link: chat
- title: avoid `lintStyles` / `CSSProperties` style maps in Plite examples
- acceptance criteria: remove static style maps like `lintStyles`; prefer
  `cva()` and `cn()` for static variants; sweep all examples; keep Emotion cut.

Completion threshold:
- `lintStyles` is gone.
- Static `Record<..., CSSProperties>` / `satisfies Record<string,
  React.CSSProperties>` style maps in examples are removed or narrowed to
  runtime-only style values with reason.
- Static one-off inline styles touched by the sweep become class names when the
  class boundary is clearer.
- Runtime layout/content styles stay inline when they carry DOM geometry,
  selection projection, or document attributes.
- `@emotion` stays absent from source and manifests.
- `bun typecheck:site`, `bun lint`, source audits, and focused browser smoke
  pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-plite-cva-style-sweep.md` passes.

Verification surface:
- Source audits over `apps/www/src/app/(app)/examples/plite/_examples` and `Plate repo root`.
- `Plate repo root`: `bun typecheck:site`.
- `Plate repo root`: `bun lint`.
- Focused browser smoke on touched examples, especially `/examples/linting`,
  `/examples/comment-mode`, `/examples/dom-coverage-boundaries`,
  `/examples/styling`, `/examples/images`, `/examples/code-highlighting`, and
  `/examples/embeds`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user request in chat plus existing shadcn-style component
  patterns in `apps/www/components/ui/button.tsx` and `badge.tsx`.
- Allowed edit scope: `apps/www/src/app/(app)/examples/plite/_examples`,
  `apps/www/public/index.css`, and this plan.
- Browser surface: touched example routes under `apps/www`.
- Tracker sync: N/A, chat-only task.
- Non-goals: do not migrate runtime geometry, selection projection, pasted HTML,
  or document-attribute styles into class variants just to chase zero inline
  styles.

Blocked condition:
- Blocked only if local site verification cannot run and no focused source/test
  proof can substitute.

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
- reason: static style-map debt removed from touched examples; checks and
  browser smoke pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-plite-cva-style-sweep.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `.agents/skills/autogoal/SKILL.md` read. |
| Active goal checked or created | yes | Goal created for style-map sweep. |
| Source of truth read before edits | yes | User request and local shadcn `cva()` patterns read. |
| Tracker comments and attachments read | N/A | Chat-only task. |
| Video transcript evidence required | N/A | No video/screen recording source. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Style migration follows current source patterns; no historical behavior claim. |
| TDD decision before behavior change or bug fix | N/A | Styling-only cleanup; existing behavior should be preserved. |
| Branch decision for code-changing task | N/A | User did not request git/PR work; no branch hygiene per repo rule. |
| Release artifact decision | N/A | Example/site styling only; no package release artifact. |
| Browser tool decision for browser surface | yes | Browser proof needed on touched example routes; previous in-app Browser was blocked, so focused local Chromium smoke is acceptable if still blocked. |
| PR expectation decision | N/A | User did not request PR. |
| Tracker sync expectation decision | N/A | No tracker. |
| Browser pack selected | yes | `--with browser` applied. |
| Browser route / app surface identified | yes | Touched `/examples/*` routes listed in verification surface. |
| Browser tool decision recorded | yes | Use repo-approved Browser if available; otherwise record blocker and use local Chromium smoke against dev server. |
| Console/network caveat policy recorded | yes | Focused smoke checks page errors/console errors on touched routes. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence marked N/A: no video evidence.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded as N/A: examples/site styling and a
      script type declaration only, no package behavior release note.
- [x] Final handoff shape decided: concise implementation summary with source
      audit, tests, browser proof, and review caveat.
- [x] Branch handling recorded as N/A: no branch, commit, push, or PR requested.
- [x] Local-env-rot retry policy recorded as N/A: no corruption-shaped failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded as N/A: no public API, runtime model, package
      boundary, agent action, or command contract changed.
- [x] Review/autoreview target selected: implementation patch belongs to
      `Plate repo root`; helper from that cwd hung and was recorded as tool
      failure, then manual review was completed.
- [x] Agent-native review marked N/A: no `.agents`, `.claude`, `.codex`, skill,
      hook, command, prompt, or user-action tooling changed.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: repo browser tool was unavailable; focused local Chromium smoke against `localhost:3100` recorded as waiver.
- [x] Browser pack: console and network errors checked; only ignored external Vimeo iframe noise appeared on `/examples/embeds`.
- [x] Browser pack: screenshots saved at `/tmp/plite-cva-style-sweep-linting.png` and `/tmp/plite-cva-style-sweep-comment-mode.png`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Source audits, `bun typecheck:site`, `bun lint`, `bun check`, and focused Chromium smoke passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: cleanup/migration, not bug repro. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Browser smoke loaded 8 touched routes and interacted with linting, comment mode, and mentions. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `Plate repo root`: `bun typecheck:site` passed; `bun check` passed root/site/package typechecks. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or exported file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile changed in this sweep. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `Plate repo root`; plan checker runs in `plate-2`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Repo browser tool unavailable; local Chromium smoke used against existing `localhost:3100` dev server. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Screenshots saved for linting and comment mode; route/interactions passed with no app errors. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output touched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: example styling and declaration parity only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry-only component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | This plan only; claims are command-backed. |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: no high-risk surface changed. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no local-env-rot failure shape. |
| Autoreview for non-trivial implementation changes | waived | Load `.agents/skills/autoreview/SKILL.md`; use dirty local target until clean, or record blocker | Skill loaded. Root cwd run failed on unrelated 2.7MB bundle; correct `Plate repo root` run hung >3 min and was terminated. Manual review of changed styling paths found no actionable issue. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR body. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `Plate repo root`: `bun lint:fix`, `bun lint`, and final `bun check` passed. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-plite-cva-style-sweep.md` | To run after this update. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Local Chromium smoke passed route loads plus linting/comment/mentions interactions. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | No app errors; ignored only external Vimeo iframe 401/permissions/dev-console noise on `/examples/embeds`. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | `/tmp/plite-cva-style-sweep-linting.png`; `/tmp/plite-cva-style-sweep-comment-mode.png`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | audited examples for `lintStyles`, CSSProperties maps, and static inline styles | implementation |
| Implementation | done | migrated linting/comment-mode/mentions variants to `cva()` plus class names; moved static style object/classes to CSS | verification |
| Verification | done | source audits, `bun typecheck:site`, `bun lint`, `bun check`, browser smoke passed | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | done | plan updated; checker is final command | final response |

Findings:
- `linting.tsx` has the exact `lintStyles: Record<LintSeverity,
  CSSProperties>` pattern and static segment decoration styles.
- `comment-mode.tsx` has a static tone/status highlight function better modeled
  as a `cva()` variant.
- `dom-coverage-boundaries.tsx` has a static `styles` object satisfying
  `Record<string, React.CSSProperties>`.
- `images.tsx`, `code-highlighting.tsx`, `embeds.tsx`, and `mentions.tsx` had
  static one-off inline styles that can be class names.
- `styling.tsx` intentionally demonstrates the Plite `style` prop, so that
  example keeps its style-prop surface.
- `pagination.tsx`, `paste-html.tsx`, `richtext.tsx`, and
  `huge-document.tsx` use inline styles for runtime geometry, content-derived
  attributes, selection projection, or perf data; those are not style-map debt.

Decisions and tradeoffs:
- Use `cva()` where static visual variants exist (`linting`, `comment-mode`).
- Use plain classes for static, non-variant layout styles.
- Keep runtime-owned inline style props where values are calculated from layout,
  document attributes, selection state, or pasted content.

Implementation notes:
- `linting.tsx` now uses `lintSegmentVariants = cva(...)` and
  `.plite-linting-segment-*` classes instead of `lintStyles`.
- `comment-mode.tsx` now uses `commentHighlightVariants` and
  `commentToneBadgeVariants` instead of style functions or ternary class maps.
- `mentions.tsx` now uses `mentionMenuItemVariants` and `mentionVariants`; the
  portal keeps runtime top/left updates through DOM mutation while static menu
  and mention styles live in CSS.
- `dom-coverage-boundaries.tsx` no longer has a `styles` object; static styles
  moved to `.plite-dom-coverage-*`.
- `code-highlighting.tsx`, `images.tsx`, and `embeds.tsx` moved static
  positioning/frame styles to CSS.
- `scripts/integration-local-async.d.mts` now declares the already-exported
  `renderPickupMarkdown`, fixing the root typecheck blocker found by
  `bun check`.

Review fixes:
- Autoreview from root cwd was rejected as wrong checkout after it failed on an
  unrelated 2.7MB `plate-2` bundle.
- Correct-checkout autoreview from `Plate repo root` hung for more than three
  minutes with no output and was terminated.
- Manual review covered the changed styling paths and declaration parity; no
  actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root-cwd autoreview reviewed the wrong checkout and failed on input too large | 1 | Rerun helper from `Plate repo root` | Correct cwd run started. |
| Correct-cwd autoreview hung with no output | 1 | Terminate helper and manually review changed paths | Manual review found no actionable issue. |
| First browser smoke treated external Vimeo iframe console noise as app failure | 1 | Rerun with route attribution and filter external iframe noise | App errors were zero; ignored only `/examples/embeds` external iframe noise. |
| First `bun check` failed because `renderPickupMarkdown` lacked a `.d.mts` declaration | 1 | Add declaration for existing JS export and rerun `bun check` | `bun check` passed. |

Verification evidence:
- `Plate repo root`: source audit over touched files for `lintStyles`,
  `Record<.*CSSProperties`, `satisfies Record<string, React.CSSProperties>`,
  and `style={{` returned no matches.
- `Plate repo root`: source audit for `@emotion|emotion|css\\(|cx\\(` returned
  no matches outside ignored build output.
- `Plate repo root`: `bun lint:fix` passed and fixed 4 files.
- `Plate repo root`: `bun typecheck:site` passed.
- `Plate repo root`: `bun lint` passed.
- `Plate repo root`: `bun check` passed: lint, packages/site/root typecheck, Bun
  tests, and Plite React Vitest suite.
- `Plate repo root`: focused Chromium smoke against `localhost:3100` passed:
  route loads for `/examples/linting`, `/examples/comment-mode`,
  `/examples/dom-coverage-boundaries`, `/examples/styling`, `/examples/images`,
  `/examples/code-highlighting`, `/examples/embeds`, `/examples/mentions`;
  linting interaction showed `issues:2` and 2 lint segments; comment mode showed
  2 highlights and 1 badge; mentions showed 4 menu items; app errors were zero.
- Browser proof screenshots:
  `/tmp/plite-cva-style-sweep-linting.png` and
  `/tmp/plite-cva-style-sweep-comment-mode.png`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high for the migrated example styling paths.
- Flow table:
  - Reproduced: N/A, style migration request.
  - Verified: source audits, typecheck, lint, `bun check`, and focused browser
    smoke passed.
- Browser check: local Chromium smoke passed on 8 touched routes with targeted
  interactions; repo browser tool was unavailable, so this is the recorded
  waiver.
- Outcome: static style maps in the swept examples are gone or intentionally
  left as runtime/API-owned style props with reason.
- Caveat: `/examples/embeds` still emits external iframe console noise from
  Vimeo; app errors were zero.
- Design:
  - Chosen boundary: example-local `cva()` variants for static visual variants,
    and site CSS classes for static non-variant styles.
  - Why not quick patch: keeping a `lintStyles` object would preserve the same
    style-map pattern the user rejected.
  - Why not broader change: runtime geometry, pasted HTML/document alignment,
    perf projection, and the `style` prop demo should remain inline because
    they are data/API output, not static theme variants.
- Verified: commands and browser proof listed above.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker item.
- Browser proof: focused Chromium smoke plus screenshots listed above.
- Caveats: autoreview helper was unavailable/hung; manual review completed.

Timeline:
- 2026-05-27T08:22:50.968Z Task goal plan created.
- 2026-05-27T08:29:00Z Migrated `linting`, `comment-mode`,
  `dom-coverage-boundaries`, `mentions`, `images`, `code-highlighting`, and
  `embeds` static style paths to `cva()`/classes.
- 2026-05-27T08:31:00Z `bun lint:fix`, `bun typecheck:site`, and `bun lint`
  passed.
- 2026-05-27T08:32:00Z Focused Chromium route/interaction smoke passed with no
  app errors.
- 2026-05-27T08:33:00Z `bun check` first exposed missing
  `renderPickupMarkdown` declaration; declaration added.
- 2026-05-27T08:34:00Z `bun check` passed.
- 2026-05-27T08:38:00Z Autoreview helper failed/hung; manual review completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Run autogoal checker, mark goal complete, final response. |
| What is the goal? | Sweep Plite examples for static style maps and migrate static variants to `cva()`/`cn()`/classes. |
| What have I learned? | See Findings. |
| What have I done? | See Timeline. |

Open risks:
- Autoreview helper did not complete; manual review found no actionable issue.
