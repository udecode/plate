# Fix DocContent duplicate link key

Objective:
Fix DocContent duplicate link key on AI MDX generation; done when exact red/green coverage, 5/5 Browser replay, and P1 review pass; plan docs/plans/2026-08-31-fix-doccontent-duplicate-link-key.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-fix-doccontent-duplicate-link-key.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user console-error report and interaction path
- id / link: N/A: no external tracker target
- title: Duplicate `/docs/components/link` React key after AI “Generate MDX sample”
- acceptance criteria: reproduce the exact click path; fix the `DocContent`
  identity owner without dropping valid generated links; add behavior coverage;
  pass focused tests, typed/lint checks, fresh Browser 5/5, and P1 review.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- Captured requirements:
  - Remove the `/docs/components/link` duplicate-key error reported from
    `apps/www/src/app/(app)/docs/[[...slug]]/doc-content.tsx:72`.
  - Reproduce and verify the exact AI → “Generate MDX sample” interaction,
    rather than the previously fixed command-menu path.
  - Preserve every distinct generated MDX/link item that legitimately shares a
    destination.
  - Verify under Next.js 16.3.2 Turbopack in the real `apps/www` UI.
  - Deliver a local repair only; no commit, push, PR, or tracker mutation was
    requested.
  - Stop after exact red/green proof, scoped typed/lint checks, fresh Browser
    5/5, P1 autoreview, and the final goal checker; otherwise report a blocker.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary proof gates apply
- improvement loop: N/A: one-shot repair loop
- final score / loop closure: N/A: completion is evidence-gated

Completion threshold:
- The exact AI MDX action reproduces the reported warning before the fix.
- Focused behavior coverage fails before and passes after the owning repair.
- On a fresh app process/page, five retry-free exact interactions preserve all
  distinct generated link entries and emit zero `/docs/components/link`
  duplicate-key errors.
- Relevant typecheck/lint and P1 autoreview pass with zero accepted findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-doccontent-duplicate-link-key.md` passes.

Verification surface:
- Focused `DocContent` or owning data-render test discovered during intake.
- `apps/www` TypeScript and scoped Ultracite checks for changed code.
- Fresh `apps/www` dev process and in-app Browser replay of the reporter's
  actual docs route and AI “Generate MDX sample” action, including DOM counts
  and console logs.
- P1 autoreview over the exact local repair boundary.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user stack/action report and current `DocContent` render path.
- Allowed edit scope: the canonical `DocContent`/generated-item identity owner,
  focused test coverage, and this goal plan.
- Browser surface: the current `apps/www` docs page exposing AI “Generate MDX
  sample”; exact route resolved from the live Browser before edits.
- Browser strategy: in-app Browser on a fresh page/process. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker target or authority.
- Non-goals: changing docs content to erase valid aliases, changing the already
  verified command-menu fix, public API/package behavior, release artifacts,
  or git mutation.

Output budget strategy:
- Read the exact stack owner, nearby tests, and direct call/data sources. Use
  capped path-scoped searches; exclude `public/r`, `__registry__`, `.next`,
  generated output, logs, coverage, `node_modules`, and unrelated dirty work.

Blocked condition:
- Stop only if the exact AI action cannot be located or reproduced after the
  current page/source path and Browser recovery are exhausted, or the UI needs
  external credentials/data unavailable in the current session.

Task state:
- task_type: local Plate website React rendering bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: fixed locally
- confidence: high for the reported duplicate-key invariant
- next owner: user for any separate AI schema-validation repair
- reason: the route-only key collided for two valid badges; route plus resolved
  title is stable and unique for those distinct entries.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-doccontent-duplicate-link-key.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact stack, action, scope, proof, handoff, and stop conditions are captured above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `autogoal` and `patch`; patch owns this distinct local behavior case and requires exact replay, red proof, durable identity, Browser proof, and P1 review |
| Active goal checked or created | yes | Prior goal was complete; `get_goal` returned none and this new goal was created |
| Source of truth read before edits | yes | User supplied exact stack, route key, owner file, action label, and Next.js runtime; current source is read next before product edits |
| Tracker comments and attachments read | no | N/A: no tracker or attachments supplied |
| Video transcript evidence required | no | N/A: no video supplied |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused filename search found MDX guidance but no relevant React-key repair |
| TDD decision before behavior change or bug fix | yes | Add focused red behavior coverage before the product fix |
| Branch decision for code-changing task | no | N/A: patch owns the current checkout; no git mutation requested |
| Release artifact decision | no | N/A: expected owner is private `apps/www` code |
| Browser tool decision for browser surface | yes | Use in-app Browser for the exact ordinary app interaction |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker target |
| Output budget strategy recorded | yes | Exact paths and capped searches; generated/build/unrelated trees excluded |
| Browser pack selected | yes | Browser pack is materialized in this plan |
| Browser route / app surface identified | yes | `apps/www` docs `DocContent`; exact live route is resolved before edit from the reporter interaction surface |
| Browser tool decision recorded | yes | Browser first; native Chrome/Computer is not needed for a React console warning |
| Console/network caveat policy recorded | yes | The reported warning must be absent; unrelated current errors are named, not hidden; network is checked only if the action depends on a request |
| Observable browser case captured | yes | `www-doccontent:ai-generate-mdx-duplicate-link-key`; current docs page, activate AI, click “Generate MDX sample,” expect generated content with every distinct link and no `/docs/components/link` same-key error; macOS in-app Chromium; runtime-error claim; final local ref and production/test/data fingerprints required |

Work Checklist:
- [x] N/A: no duration requested; binary evidence gates apply.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording was supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A; private `apps/www` render fix.
      N/A with reason.
- [x] Final handoff shape decided: local bug-fix result, tests, Browser proof,
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: N/A; no branch or git mutation requested.
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded: N/A; no install-corruption signal.
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: repo tests/typecheck and `apps/www` Browser.
      owns the changed behavior.
- [x] High-risk note recorded: React identity only; exact action and console replayed.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected: isolated exact two-file local bundle.
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded: N/A; no agent/tooling files changed.
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: searches were path-scoped.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: `/docs/link`, AI, “Generate MDX sample,” and zero duplicate-key errors recorded.
- [x] Browser pack: in-app Browser used; native Chrome/Computer was unnecessary.
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console checked; separate AI schema error recorded out of scope.
- [x] Browser pack: visual waiver; this is a console/React-identity claim.
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: N/A; no paint claim.
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: red `/docs/link` console proof captured before the fix.
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: fresh process and five fresh pages replayed the exact action.
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: local candidate only; no pushed-ref or clean-checkout claim.
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: 5/5 retry-free React lifecycle action replays passed.
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no stub, alias, generated edit, or route bypass used.
      or unshipped scaffolding is counted as final behavior proof.

Resolved completion evidence:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Browser final proof | pending | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| P1 autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-doccontent-duplicate-link-key.md` | pending |
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |
| Exact case replay | pending | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | pending |
| Final ref and fingerprints | pending | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | pending |
| Clean final runtime | pending | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | pending |
| Retry-free stability | pending | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | `/docs/link` frontmatter contains two valid `/docs/components/link` badges | done |
| Implementation | completed | `DocContent` keys badges by route and resolved title; regression test added | done |
| Verification | completed | red/green test, TypeScript, Oxlint/format, fresh-process Browser 5/5, P1 review | done |
| PR / tracker sync | N/A | no PR, tracker, commit, or push requested | done |
| Closeout | completed | exact local evidence and remaining caveat recorded | final response |

Findings:
- The warning existed on initial `/docs/link` render; AI generation merely
  triggered another render. Two legitimate badges shared one route-only key.

Decisions and tradeoffs:
- Preserve both badges and make identity include the resolved title. Deduping by
  route would silently delete distinct documentation labels.

Implementation notes:
- Changed `key={item.route}` to
  `key={`${item.route}:${getDocTitle(item)}`}` in the canonical renderer.

Review fixes:
- None; P1 autoreview returned no findings at 0.98 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Red: focused Bun test failed with the exact `/docs/components/link` warning.
- Green: focused Bun test passed, 1/1 with three assertions.
- `apps/www`: `pnpm exec tsc --noEmit -p tsconfig.json --pretty false` passed.
- Changed files: Oxlint `--no-ignore --deny-warnings` and Oxfmt stdin diffs passed.
- Fresh `pnpm --filter www dev`: five retry-free Browser runs opened AI, clicked
  “Generate MDX sample,” and logged zero matching duplicate-key errors.
- P1 autoreview exact two-file local bundle: clean, no actionable findings.

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; no tracker supplied.
- Confidence line: high for the duplicate-key fix.
- Flow table:
  - Reproduced: focused red test and live `/docs/link` console warning.
  - Verified: focused green test and fresh-process Browser 5/5.
- Browser check: exact action emitted zero duplicate-key errors in 5/5 runs.
- Outcome: distinct same-route badges keep stable unique React identities.
- Caveat: AI generation separately surfaces an existing editor schema-validation
  error in this checkout; it is a different owner and warning class.
- Design:
  - Chosen boundary: canonical `DocContent` badge renderer.
  - Why not quick patch: changing frontmatter would hide a legitimate badge.
  - Why not broader change: no public API or registry behavior needs changing.
- Verified: test, typecheck, formatting, lint, Browser, and P1 review.
- PR body verified: N/A; no PR requested.

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
- PR: N/A; no PR requested.
- Issue / tracker: N/A; no tracker supplied.
- Browser proof: fresh-process exact action, 5/5, zero matching warnings.
- Caveats: separate AI editor schema-validation error remains out of scope.

Timeline:
- 2026-08-31T06:45:48.044Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Eliminate the `DocContent` duplicate React key without dropping valid badges |
| What have I learned? | AI generation exposes a warning already present on initial docs render |
| What have I done? | Fixed identity, added red/green coverage, and passed exact Browser plus P1 review |

Open risks:
- Separate `EditorSchemaValidationError` after AI-generated MDX remains outside
  this duplicate-key repair. No commit, push, PR, or release proof was made.
