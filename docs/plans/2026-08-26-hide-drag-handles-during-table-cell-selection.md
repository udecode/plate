# hide drag handles during table cell selection

Objective:
Hide block drag handles while table cells are selected; done when the exact table case fails before the fix, passes focused proof and 5/5 Browser replays, and lint passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-hide-drag-handles-during-table-cell-selection.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user-reported screenshot regression
- id / link: attached image `codex-clipboard-ba6f8767-5960-4523-8d85-ad6336931735.png`
- title: Hide drag handles during table cell selection
- acceptance criteria: selecting table cells never reveals block drag handles for table-contained paragraphs; normal block drag handles remain available outside a table-cell selection.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary regression proof
- improvement loop: reproduce, patch the copied Plate UI owner, verify
- final score / loop closure: N/A: binary completion threshold

Completion threshold:
- The reporter-valid table-cell selection case fails before the fix and passes after it.
- Focused automated proof and scoped lint pass in `/Users/zbeyens/git/plate-2`.
- The exact Chromium row passes 5/5 retry-free runs, and a fresh in-app Browser page visually proves the selected-cell state hides generic handles while the selected-cell move control remains observable.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-hide-drag-handles-during-table-cell-selection.md` passes.

Verification surface:
- Focused `apps/www` browser test selected after owner inspection.
- Scoped Ultracite/lint for changed source and test files.
- In-app Browser on the canonical table demo route with visible/absent pixel controls, console check, and 5/5 interaction replay.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: copied Plate UI drag-handle component, table-selection state owner, canonical table demo, and focused browser test.
- Allowed edit scope: `apps/www/src/registry/components/editor/**`, focused `apps/www` browser tests, registry changelog source if required, and this plan. Never edit `templates/**` or generated registry output.
- Browser surface: canonical `apps/www` table demo, preferably `/blocks/table-demo` if present.
- Browser strategy: in-app Browser. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no public issue or tracker requested.
- Non-goals: no package/public API changes, no table model changes, no registry build, no commit/push/PR.

Output budget strategy:
- Use owner-scoped `rg`, exact file slices, and capped command output. Exclude generated registry JSON, templates, build output, dependency folders, and unrelated tests.

Blocked condition:
- Stop only if the canonical route cannot reproduce from current source after all safe local route/process checks, or the in-app Browser cannot execute the table-cell selection interaction.

Task state:
- task_type: Plate copied-UI browser regression
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready for completion

Current verdict:
- verdict: candidate-local complete
- confidence: high on the recorded dirty ref
- next owner: user/commit owner
- reason: exact red-to-green, 5/5 Chromium, Browser visual proof, typecheck, lint, changelog, and isolated P1 review pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-hide-drag-handles-during-table-cell-selection.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact screenshot case, scope, non-goals, proof threshold, and handoff requirements are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `patch`, `plate-ui`, `shadcn`, `autogoal`, and in-app Browser skills completely; shadcn project context and button/tooltip docs were checked. |
| Active goal checked or created | yes | `get_goal` returned no active goal; create after this plan checkpoint. |
| Source of truth read before edits | yes | Read screenshot, prior drag-handle paint plan, table-selection plans/solution hits, `dnd.tsx`, `table.tsx`, and focused table-selection browser spec. |
| Tracker comments and attachments read | yes | User screenshot and current request read; no tracker exists. |
| Video transcript evidence required | no | N/A: screenshot only. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Owner-scoped search found table selection/DnD guidance; no existing rule covers hiding table drag chrome during cell selection. |
| TDD decision before behavior change or bug fix | yes | Add a reporter-valid failing browser assertion before editing product source. |
| Branch decision for code-changing task | no | N/A: user requested a local fix, not branch or Git mutation. |
| Release artifact decision | yes | Registry changelog decision after owner inspection; no package changeset expected. |
| Browser tool decision for browser surface | yes | In-app Browser is the required ordinary app QA surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker requested. |
| Output budget strategy recorded | yes | Owner-scoped searches and capped output; generated and build trees excluded. |
| Browser pack selected | yes | `browser` pack materialized in this plan. |
| Browser route / app surface identified | yes | Canonical `apps/www` table demo; exact route will be confirmed from registry metadata before proof. |
| Browser tool decision recorded | yes | In-app Browser, not exact Chrome, because the report names no browser-native requirement. |
| Console/network caveat policy recorded | yes | Check console errors; network failures are relevant only if they affect the local route or interaction. |
| Observable browser case captured | yes | `table-cell-selection:hides-block-handles`; source screenshot; open canonical table demo, select multiple cells, hover/move at selected top-left cell, expect zero visible block drag handles inside/adjacent to the table; known-visible control is an ordinary top-level block handle; claim fields: DOM visibility, actual pixels, pointer target, cell selection, console; local dirty ref and SHA-256 fingerprints recorded at final proof. |

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
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
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
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-visible and
      known-absent controls through the identical capture path. Computed style,
      DOM state, selection text, and an unclassified screenshot are diagnostics,
      not final paint proof.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Exact red-to-green, final 5/5 Chromium, Browser visual, `www` typecheck, scoped lint, changelog check, and P1 review pass. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Exact Chromium row failed: expected zero visible generic block handles, received one. Browser screenshot showed the same table-root gutter. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Full DnD plus table-selection browser set passed 5/5; final exact row passed 5/5. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed after final bytes. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or file moves. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no dependency graph change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/zbeyens/git/plate-2`; Browser exercised `apps/www` `/blocks/table-demo`. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | In-app Browser final screenshot shows two selected cells, intentional table handles, and no generic table block gutter. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Fresh page on current source: selected `2`, visible generic block handles `0`, selected-cell move handle visible, console errors `0`. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` change; registry build belongs to CI. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: copied registry UI only; no published package/API delta. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Added registry changelog entry and generated JSON; generator `--check` passed. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: goal plan/changelog are task/release artifacts, not public teaching. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk was hiding intentional table DnD or all gutters permanently; test proves normal table-root gutter before selection and selected-cell move handle during selection. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling source changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures were deterministic source/test issues, not install corruption. |
| P1 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Current checkout review failed closed on unrelated secret-like dirty content; isolated exact task bundle passed P1 with `0` findings and `0.97` correctness. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped Ultracite fix/check passed on all task source files. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One broad plan search was truncated and recorded; subsequent reads were exact/capped. Changelog output was a bounded 87-event list. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-hide-drag-handles-during-table-cell-selection.md` | Run after this final ledger update. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | In-app Browser real drag on `/blocks/table-demo` passed. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Final Browser tab reported zero console errors; local route loaded successfully. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Final full-page Browser screenshot visibly shows selected cells with no generic gutter and the intentional table controls still painted. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Final Browser: two selected cells, zero visible generic block handles, intentional selected-cell handle visible; Chromium row passed 5/5. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Dirty ref `d282fd8a33affb40d2b60103b6c1ce370140d2eb`; SHA-256 values recorded in Verification evidence. |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: candidate-local only; no commit/push was requested. Fresh task-owned `www` server proved the RED; final Browser used the already-running current-source Plite server on `3001` after a second fresh-server attempt correctly refused the active Next lock. |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Final exact Chromium row passed `5/5` with retries disabled after the final test fingerprint. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Exact screenshot/Browser repro; DnD/table owners and adjacent plans/tests read. | implementation |
| Implementation | completed | Copied DnD gutter subscribes to expanded table-cell selection and omits only generic handles. | verification |
| Verification | completed | Red-to-green, full adjacent browser set, final 5/5, Browser visual, typecheck, lint, changelog, P1 review. | closeout |
| PR / tracker sync | completed | N/A: neither requested. | final response |
| Closeout | completed | Final ledger and candidate-local caveat recorded. | final response |

Findings:
- Exact Browser repro: selecting the first two cells leaves the table root's generic `Drag block` gutter visibly painted next to the intentional row and selected-cell handles.
- Literal owner: `apps/www/src/registry/components/editor/dnd.tsx` renders generic block gutters without checking the installed table plugin's expanded cell selection.
- The table's `Move selected cells` handle is intentional and must remain available; the fix suppresses generic block gutters only while a multi-cell selection exists.

Decisions and tradeoffs:
- Hide generic block drag gutters for the duration of any expanded table-cell selection -> block DnD and cell DnD are mutually exclusive states -> preserves the table-owned selected-cell move handle and avoids table-specific CSS masking.

Implementation notes:
- Subscribe at the copied DnD wrapper to `BaseTablePlugin.read.selection()` and omit only generic gutters when more than one cell key is selected.

Review fixes:
- P1 autoreview reported zero accepted/actionable findings. The first whole-checkout invocation failed closed before review on unrelated secret-like dirty content; the isolated exact bundle passed cleanly.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First owner search streamed too many historical plan matches | 1 | Restrict subsequent searches to exact files/patterns and cap lines | Recovered; no more broad plan output. |
| Fresh `apps/www` route failed because a test assertion itself contained the doubly escaped Tailwind utility candidate it forbids | 1 | Split the expected string so Tailwind source discovery cannot treat the test oracle as a utility | Patched the test-only compile blocker; rerun its focused test and the route before the behavior repro. |
| Initial in-app Browser multi-tab loop acted before hydration; later CUA attempts were inconsistent | 2 | Gate on hydrated block handles and use the deterministic Chromium row for the 5/5 ledger; keep Browser for one exact visual replay | One fresh Browser replay passed with zero console errors; Chromium exact case passed 5/5. |
| `www` typecheck found an adjacent DOM listener inferred as generic `Event` | 1 | Type the test-only DOM boundary as `PointerEvent` | Patched; rerun `www` typecheck and the resize-handle row. |

Verification evidence:
- RED: `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www test:www-browser:chromium tests/browser/table-selection.spec.ts --grep "table:hide-block-handles-during-cell-selection"` failed at the exact invariant, expected visible generic handle count `0`, received `1`.
- GREEN breadth: DnD plus the complete table-selection browser files passed `5/5` tests.
- GREEN stability: final exact Chromium row passed `5/5` with retries disabled after the final harness bytes.
- Browser: `/blocks/table-demo` fresh page selected two cells, showed zero generic `Drag block` handles, kept `Move selected cells` visible, emitted zero console errors, and produced the final visible screenshot.
- Typecheck: `pnpm --filter www typecheck` passed.
- Lint: scoped Ultracite fix/check passed on all task source files.
- Tailwind oracle: `pnpm --filter www exec bun test src/lib/tailwind-registry-source.test.ts` passed `1/1`.
- Registry changelog: generator `--write` and final `--check` passed for 87 events. Registry build was not run because CI owns it.
- Review: isolated `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1` passed with zero findings and `0.97` correctness.
- Ref: `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`.
- SHA-256 `dnd.tsx`: `3fb68fa2c40b0c35120462a1918f7d330df9d92d09a18e1ce4a67e78b86342b2`.
- SHA-256 `table-selection.spec.ts`: `a4bcf8b0a3119325e498ad871d3af106540a008be1204ab9d5344b0629d160b2`.
- SHA-256 `tailwind-registry-source.test.ts`: `92892fbf52370560cf625fff9232676a064273b49c3a8fa6f6160633070fa1eb`.
- SHA-256 changelog MDX: `e078db3032b42ecd9b8981941df9a78c64cee891b1871ae6daece0e82e4e4850`.
- SHA-256 changelog JSON: `61ba7b21908123eb1b76bf44945b85e0177cd6aff7913763b936c1a1fc2e176c`.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker supplied.
- Confidence line: High for the recorded candidate-local bytes; shipping proof remains unclaimed.
- Flow table:
  - Reproduced: exact Chromium RED and matching Browser visual RED.
  - Verified: full adjacent browser set `5/5`, exact final stability `5/5`, Browser visual green, zero console errors.
- Browser check: current-source `/blocks/table-demo`, two selected cells, zero generic handles, intentional selected-cell handle visible.
- Outcome: generic block drag gutters do not compete with table-cell selection.
- Caveat: local uncommitted candidate; no final pushed-ref or release claim.
- Design:
  - Chosen boundary: copied `dnd.tsx` component subscribes to the optional Base Table selection portal.
  - Why not quick patch: CSS opacity on the table demo would mask state without removing the competing control from interaction/DOM.
  - Why not broader change: table and Plite model semantics are correct; only generic Plate DnD presentation lacked the guard.
- Verified: exact commands and Browser evidence recorded above.
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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no tracker supplied.
- Browser proof: exact current-source table drag passed; final screenshot and zero-console result recorded.
- Caveats: no commit/push/release proof; no local registry build per CI-owned registry rule.

Timeline:
- 2026-08-26T11:58:22.299Z Task goal plan created.
- 2026-08-26 Source read identified Plate-owned table drag chrome and a separate test-oracle compile blocker; split that oracle string before the reporter repro.
- 2026-08-26 Exact Browser and focused Chromium repro both showed one generic table block handle during a two-cell selection; added the owner-level selector and suppression.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Hide generic block handles during expanded table-cell selection without removing table-owned controls. |
| What have I learned? | The stale visible control was the root table's generic DnD gutter, not a table selection/model defect. |
| What have I done? | Reproduced, patched copied DnD owner, added durable browser proof/changelog, and closed typecheck/lint/Browser/review gates. |

Open risks:
- Candidate is uncommitted/unpushed, so no final-ref shipping claim.
- Registry build output is CI-owned and was intentionally not generated locally.
