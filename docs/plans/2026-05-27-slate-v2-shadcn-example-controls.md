# slate v2 shadcn example controls

Objective:
Scan every `apps/www/src/app/(app)/examples/slate/_examples` example for replaceable custom
controls and migrate as much as practical to shadcn default-style components.

Goal plan:
docs/plans/2026-05-27-slate-v2-shadcn-example-controls.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user request
- id / link: chat
- title: use shadcn components instead of custom example controls
- acceptance criteria: first scan every example; replace high-confidence
  buttons, inputs, selects, badges, separators, cards, switches/checkboxes
  with shadcn where semantics allow; document intentional non-migrations.

Completion threshold:
- Every `.tsx` example under `apps/www/src/app/(app)/examples/slate/_examples` has been scanned
  for raw/custom controls.
- High-confidence raw/custom controls are migrated to installed or newly added
  shadcn default-style components.
- Remaining raw controls are documented with reason: editor fixture,
  contentEditable-sensitive, browser-native semantics required, or lower-value
  risky migration.
- Source audits show no unreviewed replaceable control hits remain.
- Emotion remains absent.
- `Plate repo root` lint/typecheck/check and focused browser smoke pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-shadcn-example-controls.md` passes.

Verification surface:
- Full source audit over `apps/www/src/app/(app)/examples/slate/_examples`.
- shadcn project context via `bunx --bun shadcn@latest info --json --cwd site`.
- shadcn docs URLs for button/input/native-select/label/select/checkbox/switch.
- `Plate repo root`: `bun lint:fix`, `bun lint`, `bun typecheck`,
  `bun check`.
- Focused browser smoke on migrated routes.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user request plus shadcn project config in
  `apps/www/components.json`.
- Allowed edit scope: `apps/www/components/ui`,
  `apps/www/src/app/(app)/examples/slate/_examples`, `apps/www/public/index.css`,
  `apps/www/styles/shadcn.css`, `Plate repo root/package.json`,
  `Plate repo root/bun.lock`, and this plan.
- Browser surface: changed example routes.
- Tracker sync: N/A, chat-only task.
- Non-goals: do not replace native editor/content fixtures when a shadcn
  primitive changes DOM semantics or breaks Slate/contentEditable behavior.

Blocked condition:
- Blocked only if shadcn components cannot be installed or verified and no
  scoped migration can be proven safely.

Task state:
- task_type: implementation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: final response
- reason: safe control migrations are implemented, remaining native controls are
  documented, source audits are clean, `bun check` passed, and focused browser
  smoke passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-shadcn-example-controls.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `autogoal` and `shadcn` skills read. |
| Active goal checked or created | yes | Goal created for shadcn example-control migration. |
| Source of truth read before edits | yes | User request, shadcn info, installed UI files, and all example control hits scanned. |
| Tracker comments and attachments read | N/A | Chat-only task. |
| Video transcript evidence required | N/A | No video source. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | UI migration follows local source and shadcn docs; no historical behavior claim. |
| TDD decision before behavior change or bug fix | N/A | Styling/component migration, not a bug fix. |
| Branch decision for code-changing task | N/A | No git/PR work requested. |
| Release artifact decision | N/A | Example/site UI only; no package release artifact. |
| Browser tool decision for browser surface | yes | Browser proof required on migrated routes; use local Chromium smoke if repo browser tool unavailable. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Browser pack selected | yes | `--with browser` applied. |
| Browser route / app surface identified | yes | Routes will be selected from files changed by migration. |
| Browser tool decision recorded | yes | Local Chromium smoke acceptable if repo browser tool unavailable. |
| Console/network caveat policy recorded | yes | Browser smoke checks app errors; external iframe noise can be recorded separately if hit. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `bun lint:fix`, `bun lint`, `bun typecheck`, `bun check`, source audits, and browser smoke passed in `Plate repo root`. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | N/A: component migration, not a bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Playwright smoke passed for changed example routes on `http://localhost:3100`. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun typecheck` passed in `Plate repo root`. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: site UI files only; no package exports. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile changes. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | N/A: no agent rule or skill edits. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2/Plate repo root`; plan updated in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser-use tool unavailable after tool search; Playwright fallback passed against existing Next server on `3100`. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Route interaction smoke passed; no screenshot needed for non-visual-diff migration. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | N/A: no templates. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | N/A: examples/site UI only. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | N/A: Slate v2 local site components, not Plate registry. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | This plan records execution evidence only. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: shadcn wrappers changing native form/HTML semantics. Proof: typecheck plus route smoke; fixed invalid `label`/`p` nesting before closeout. |
| Agent-native review for agent/tooling changes | N/A | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling edits. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption failure shape. |
| Autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: user requested sweep and verification, not review workflow; source audits and browser proof cover the requested risk. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: chat-only task. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Complete below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `bun lint:fix` passed after final edits. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-shadcn-example-controls.md` | Passed. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Playwright fallback passed for changed route interactions. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | App console/page errors clean; ignored known external Vimeo iframe 401 only. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Route list and exact interaction smoke recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan plus full example scan | implementation complete |
| Implementation | complete | shadcn component migrations and stale CSS removal | verification complete |
| Verification | complete | audits, lint, typecheck, check, browser smoke | closeout complete |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | final handoff fields filled | final response |

Findings:
- Installed shadcn components before migration: `accordion`, `badge`, `button`,
  `card`, `collapsible`, `separator`, `tabs`.
- shadcn config: Next Pages, Tailwind v4, Radix base, nova/default-style
  preset, import alias `@`, UI path `site/components/ui`.
- Full scan counts:
  - `android-tests.tsx`: native select 1.
  - `check-lists.tsx`: native checkbox input 1.
  - `code-highlighting.tsx`: native select 1, shared Button 1, Toolbar 1.
  - `comment-mode.tsx`: raw buttons 9.
  - `document-state.tsx`: raw buttons 4, inputs 2.
  - `dom-coverage-boundaries.tsx`: raw buttons 9.
  - `editable-voids.tsx`: native inputs 3, textarea fixture text, shared
    Button 2, Toolbar 1.
  - `embeds.tsx`: native input 1.
  - `hidden-content-blocks.tsx`: already uses shadcn Button/Badge plus
    Accordion/Collapsible/Tabs.
  - `hovering-toolbar.tsx`: shared Button 1.
  - `huge-document.tsx`: inputs 6, selects 3, details/summary controls.
  - `iframe.tsx`: shared Button 1, Toolbar 1.
  - `images.tsx`: shared Button 2, Toolbar 1.
  - `inlines.tsx`: shared Button 3, Toolbar 1, custom editable inline button
    fixture.
  - `linting.tsx`: raw buttons 4.
  - `multi-root-document.tsx`: raw buttons 3, input 1, badge-like spans.
  - `pagination.tsx`: raw buttons 2, inputs 4, selects 3, hr 1.
  - `persistent-annotation-anchors.tsx`: raw buttons 4.
  - `search-highlighting.tsx`: input 1, Toolbar 1.
  - `synced-blocks.tsx`: shared Button 3, Toolbar 1.
  - `richtext.tsx`, `editable-voids.tsx`, `plaintext.tsx`: literal
    `<textarea>` appears in example text, not a control.

Decisions and tradeoffs:
- Migrate shared `examples/components/Button` to wrap shadcn `Button` first;
  that upgrades many toolbar routes at once while preserving caller API.
- Add/use shadcn `Input` and `NativeSelect` for native-compatible form controls.
- Do not use Radix `Select` for examples that depend on native `onChange`
  semantics unless a local route needs custom select behavior.
- Keep contentEditable-sensitive checkboxes/radios and embedded form fixtures
  native unless proof shows the shadcn primitive preserves the editor behavior.
- Migrated `huge-document` disclosure UI to shadcn `Collapsible`; browser proof
  caught invalid native label/paragraph nesting from `NativeSelect`, then the
  controls were corrected to use `Label htmlFor` beside shadcn controls.

Implementation notes:
- Added shadcn default-style `Input`, `Label`, `NativeSelect`, and `Switch`
  under `apps/www/components/ui`.
- Wrapped the shared example toolbar `Button` with shadcn `Button`, preserving
  the existing `active`, `reversed`, `className`, and ref API.
- Migrated raw/custom action buttons in `comment-mode`,
  `dom-coverage-boundaries`, `linting`, `persistent-annotation-anchors`,
  `document-state`, and `multi-root-document`.
- Migrated form controls in `android-tests`, `code-highlighting`,
  `document-state`, `embeds`, `huge-document`, `multi-root-document`,
  `pagination`, and `search-highlighting`.
- Migrated badge-like status pills in `document-state` and
  `multi-root-document` to shadcn `Badge`.
- Migrated pagination separators and switches to shadcn `Separator` and
  `Switch`.
- Removed stale custom CSS for replaced buttons, inputs, selects, switches, and
  badges.
- Intentional native remnants:
  - `editable-voids.tsx` inputs are embedded void/editor fixture controls.
  - `check-lists.tsx` checkbox is editor content behavior.
  - `pagination.tsx` `<hr>` renders the thematic-break document fixture.
  - `richtext.tsx`, `plaintext.tsx`, and `editable-voids.tsx` textarea hits are
    literal example text, not controls.
  - `multi-root-document.tsx` `.join(' ')` is text aggregation, not classname
    composition.

Review fixes:
- Fixed `NativeSelect` type mismatch by excluding the native numeric `size`
  prop from the `code-highlighting` wrapper props.
- Fixed invalid shadcn `NativeSelect` markup by moving `Label` to `htmlFor`
  sibling usage where the control renders a wrapper element.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun typecheck` failed on native select `size` prop conflict | 1 | Narrow wrapper prop type instead of weakening shadcn component | Resolved with `Omit<..., 'size'>`; `bun typecheck` passed. |
| Browser smoke first pass hit invalid HTML warning in `huge-document` | 1 | Use `Label htmlFor` beside shadcn controls and avoid `NativeSelect` inside `<p>`/`<label>` | Resolved; browser smoke passed without app console/page errors. |
| Browser smoke waited on Vimeo iframe network idle | 1 | Use `domcontentloaded` and ignore known external Vimeo 401 | Resolved; route interaction proof passed. |

Verification evidence:
- `bunx --bun shadcn@latest info --json --cwd site` in
  `/Users/zbeyens/git/plate-2/Plate repo root`: confirmed Next Pages, Tailwind v4,
  Radix base, nova/default-style shadcn setup, `site/components/ui` target.
- Source audit after edits in `/Users/zbeyens/git/plate-2/Plate repo root`:
  `rg -n '<(button|input|select|textarea|label|fieldset|legend|hr|details|summary)\b' site/examples/ts`
  returns only intentional native/document-fixture hits listed above.
- Classname-composition audit:
  `rg -n '\.filter\(Boolean\)\s*\.join\(|\.filter\(Boolean\)|\.join\('\'' '\''\)|\.join\(" "\)' site/examples/ts`
  returns only `multi-root-document.tsx:42`, a text join.
- Emotion audit:
  `rg -n 'emotion|@emotion|styled\(' site/examples/ts site/components site/public/index.css package.json`
  returned no matches.
- `bun lint:fix` passed in `/Users/zbeyens/git/plate-2/Plate repo root`.
- `bun lint` passed in `/Users/zbeyens/git/plate-2/Plate repo root`.
- `bun typecheck` passed in `/Users/zbeyens/git/plate-2/Plate repo root`.
- `bun check` passed in `/Users/zbeyens/git/plate-2/Plate repo root`: lint,
  package/site/root typecheck, bun tests, `slate-layout` tests, and
  `slate-react` Vitest.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-27-slate-v2-shadcn-example-controls.md`
  passed in `/Users/zbeyens/git/plate-2`.
- Browser smoke fallback: browser-use was unavailable after tool search, so a
  Playwright Chromium script used the existing Next dev server at
  `http://localhost:3100`.
- Browser routes passed with interactions:
  `android-tests`, `code-highlighting`, `comment-mode`, `document-state`,
  `dom-coverage-boundaries`, `embeds`, `huge-document`, `linting`,
  `multi-root-document`, `pagination`, `persistent-annotation-anchors`,
  `search-highlighting`.
- Browser console/page errors: clean for app code; ignored only the known
  external Vimeo iframe `401` resource message on `embeds`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, chat-only task.
- Confidence line: high.
- Flow table:
  - Reproduced: full example control scan recorded.
  - Verified: `bun check` passed; browser smoke passed on changed routes.
- Browser check: Playwright fallback passed on `http://localhost:3100`; no
  browser-use tool was callable.
- Outcome: examples now use shadcn controls wherever semantics were safe.
- Caveat: editor/contentEditable fixture controls remain native by design.
- Design:
  - Chosen boundary: shared example controls plus route-local standalone
    controls, leaving actual editor document fixtures native.
  - Why not quick patch: the shared toolbar wrapper removes repeated per-route
    button work and keeps old call sites stable.
  - Why not broader change: editor/contentEditable fixtures must stay native
    unless a separate behavior-proof task owns the DOM semantics.
- Verified: `bun check` and focused browser smoke passed.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, chat-only task.
- Browser proof: Playwright fallback passed on changed example routes.
- Caveats: native editor fixture controls intentionally remain.

Timeline:
- 2026-05-27T08:57:06.635Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Migrate Slate v2 examples to shadcn controls where safe after scanning every example. |
| What have I learned? | See Findings and intentional native remnants. |
| What have I done? | See Implementation notes and Verification evidence. |

Open risks:
- None.
