# fix link popover row styling

Objective:
Fix link popover row styling; done when rows have no leaked shadow, the
separator is full-width, focused proof and Chrome verification pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-fix-link-popover-row-styling.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: reporter screenshot plus direct clarification
- id / link: local `/docs/examples/table` UI report; no public issue
- title: link popover input shadow and inset separator regression
- acceptance criteria: input rows render without their own box shadow; the
  horizontal separator reaches the popover's inner left and right edges; the
  popover retains its own surface shadow/border; unrelated toolbar modes keep
  their intended padding.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: one-shot repair
- initial confidence score: N/A: binary visual and geometry checks
- improvement loop: red proof, owner fix, focused green, registry generation,
  exact Chrome replay
- final score / loop closure: N/A: completion is command and browser gated

Completion threshold:
- The existing link-toolbar browser test fails before the fix and passes after
  asserting `box-shadow: none` on both inputs plus edge-to-edge separator
  geometry.
- The exact `/docs/examples/table` insert-link popup visibly matches those
  assertions in Chrome with no runtime errors.
- Registry output is generated from source on `next`; no `templates/**`,
  public API, commit, push, PR, tracker, release, or other-task mutation occurs.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-fix-link-popover-row-styling.md` passes.

Verification surface:
- `apps/www/tests/browser/link-floating-toolbar.spec.ts` focused link case,
  including pre-fix red and post-fix green.
- `pnpm --filter www build:registry` and the narrow registry-style test when
  generated registry inputs change.
- Exact Chrome replay on `/docs/examples/table`, including computed geometry,
  classified visual capture, and console check.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `apps/www/src/registry/components/editor/link.tsx`, the
  shared `Input` primitive, pinned generated style maps, and the reporter-visible
  `/docs/examples/table` popup.
- Allowed edit scope: link component, its existing focused browser test,
  source-generated registry output, and required registry changelog entry.
- Browser surface: `/docs/examples/table`, select paragraph text or place the
  caret, press `Meta+K`, inspect the two-row link insert popup.
- Browser strategy: use Chrome directly for the exact reported rendering. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or public issue was requested.
- Non-goals: no global shadcn marker rewrite unless the red proof proves it is
  the owner; no popup inverse scaling; no `templates/**`; no public API,
  package, Plite, commit, push, PR, deployment, or other-task mutation.

Output budget strategy:
- Read only the link component, shared input primitive, focused test, generator,
  and exact style rows. Cap searches with `head`; exclude `.next`, public
  generated archives, node_modules, templates, and unrelated packages.

Blocked condition:
- Stop only if the exact popup cannot be reproduced on a source-current host,
  Chrome cannot inspect the route, or the required owner expands into a public
  API/package decision outside this request.

Task state:
- task_type: local Plate registry UI regression
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: user handoff
- goal_status: complete

Current verdict:
- verdict: confirmed UI regression
- confidence: high
- next owner: Patch / Plate UI
- reason: the shared Input keeps its default `shadow-xs`, while the link
  popover's `p-1` necessarily insets the separator; both are visible in the
  exact Chrome popup and owned by the local link composition.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-fix-link-popover-row-styling.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | remove nested input shadow and inset separator; preserve popover surface and unrelated toolbar padding; exact Chrome proof; no extra mutation |
| Timed checkpoint parsed | N/A: none requested | one-shot repair |
| Skill analysis before edits | yes | Patch owns the case; Plate UI owns registry composition; shadcn establishes upstream primitive rules; Autogoal owns closure |
| Active goal checked or created | yes | goal created for this corrected reporter case |
| Source of truth read before edits | yes | link component, Input primitive, style transformer/maps, focused browser test, and exact Chrome DOM read |
| Tracker comments and attachments read | N/A: no tracker | user screenshot and correction are the full report |
| Video transcript evidence required | N/A: no video | static screenshot plus exact live route is sufficient |
| `docs/solutions` checked for non-trivial existing-code work | yes | scoped search found no relevant popover solution |
| TDD decision before behavior change or bug fix | yes | extend the existing link floating-toolbar Playwright case and record pre-fix red |
| Branch decision for code-changing task | N/A: no branch operation requested | remain on current checkout; no git mutation |
| Release artifact decision | yes | user-visible registry source change requires registry changelog; no package changeset |
| Browser tool decision for browser surface | yes | exact Chrome because the report is visible rendering on the user's Chrome tab |
| PR expectation decision | N/A: no PR requested | no commit, push, or PR |
| Tracker sync expectation decision | N/A: no tracker | no public mutation |
| Output budget strategy recorded | yes | exact capped owner/test reads only |
| Browser pack selected | yes | browser pack materialized in this plan |
| Browser route / app surface identified | yes | `/docs/examples/table`, `Meta+K`, two-row insert popup |
| Browser tool decision recorded | yes | exact Chrome final proof; current Chrome binding reused |
| Console/network caveat policy recorded | yes | console errors checked; network is out of scope unless route loading fails |
| Observable browser case captured | yes | `docs-table:link-insert-row-surface`; reporter screenshot and correction; Chrome/macOS; current dirty ref to be fingerprinted; input shadow and separator geometry are applicable paint claims |

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
- [x] Implementation fixes the local link composition: nested inputs neutralize
      their own surface and only form mode removes outer padding.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug report with root cause, files, red/green
      proof, Chrome result, registry generation/changelog, and no git/public sync.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      run `pnpm run reinstall` once only for the documented mixed-React/install
      corruption signals; otherwise fix the real failure.
- [x] Workspace authority recorded: every proof runs in
      `/Users/zbeyens/git/plate-2`; UI proof uses the exact local www route.
- [x] High-risk note: shared registry UI paint can regress every style variant;
      keep the fix local to link-row neutralizers and prove generated styles.
- [x] Review/P1 autoreview target: N/A because this is a trivial local class and
      focused-test repair, and repo policy forbids Autoreview on `next`.
- [x] Agent-native review decision: N/A because no agent/tooling file is in scope.
- [x] Output budget discipline recorded and followed: one initial style search
      was truncated; all following reads are exact file ranges and capped output.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Chrome proof was used for the exact reported rendering;
      no native OS UI required Computer Use.
- [x] Browser pack: console errors checked; the route has a pre-existing Next
      prerender warning and one Chrome-extension error; network is N/A because
      the route and all interaction assets loaded.
- [x] Browser pack: exact Chrome screenshot captured; no visual waiver used.
- [x] Browser pack: the focused Playwright case classified actual input,
      separator, and outer-surface pixels with positive and negative controls;
      exact Chrome then confirmed zero-shadow CSS and zero separator inset.
- [x] Browser pack: exact Chrome pre-fix reproduction recorded visible nested
      shadow plus 4px left/right separator inset; focused test failed for both
      claims before the owner edit.
- [x] Browser pack: final proof used a fresh Chrome tab on the final source,
      replayed `Meta+K`, rechecked focus, popup, paint, geometry, and errors,
      and recorded the dirty ref plus five issue-owned file fingerprints.
- [x] Browser pack: N/A for clean pushed proof; this is explicitly a local
      uncommitted candidate on a shared dirty checkout, not an integration or
      release claim.
- [x] Browser pack: N/A for 5/5 warm runs; this is deterministic static CSS
      composition, not native selection, caret, DnD, compositor timing, focus,
      or React lifecycle behavior.
- [x] Browser pack: no temporary stub, alias, route bypass, or scaffolding was
      used; generated registry files came only from the owning build command.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused red/green, typecheck, generation, lint, and exact Chrome proof | pass: all named gates below closed |
| Bug reproduced before fix | yes | Record failing test and exact Chrome diagnosis | pass: shadow assertion false/true mismatch; 4px inset versus required <=1px |
| Targeted behavior verification | yes | Run focused browser case | pass: 1/1 Chromium link case after final source formatting |
| TypeScript or typed config changed | yes | Run `pnpm --filter www typecheck` | pass: editor/API/docs/registry/typegen/tsc chain completed |
| Package exports or file layout changed | N/A: no package file/export move | no `pnpm brl` | source stays in the existing registry item |
| Package manifests, lockfile, or install graph changed | N/A: untouched | no install needed | no dependency mutation |
| Agent rules or skills changed | N/A: untouched | no skill sync | no agent file mutation |
| Workspace authority proof | yes | Run in `/Users/zbeyens/git/plate-2` and local www | pass: all commands and Chrome route owned by this checkout |
| Browser surface changed | yes | Capture exact Chrome proof | pass: fresh Chrome tab on `/docs/examples/table` |
| Browser final proof | yes | Replay `Meta+K` and inspect final UI | pass: transparent input shadows, 0px popup padding, 0px separator insets, outer shadow retained |
| CI-controlled template output changed | N/A: untouched | preserve templates | `git status --short -- templates` returned empty |
| Package behavior or public API changed | N/A: registry-only | no changeset | no package/public API file changed |
| Registry-only component work changed | yes | Add source entry, write/check JSON | pass: `2026-08-26-fix-link-popover-rows` and 84/84 check |
| Docs or content changed | N/A: no docs route source | changelog handled by registry gate | no documentation edit |
| High-risk mini gate | yes | Prove no global style-map regression | pass: local link composition only; registry build materialized 380 canonical payloads and 15 overlays |
| Agent-native review for agent/tooling changes | N/A: no agent/tooling changes | no review | no applicable files |
| Local install corruption suspected | N/A: no corruption signal | no reinstall | commands ran normally |
| P1 autoreview for non-trivial implementation changes | N/A: trivial patch and `next` forbids Autoreview | no invocation | focused source/test/browser proof used |
| PR create or update | N/A: not requested | no PR | no git/public mutation |
| Task-style PR body verified | N/A: no PR | no body | no PR exists in scope |
| PR proof image hosting | N/A: no PR | no hosting | Chrome proof stays local |
| Tracker sync-back | N/A: no tracker | no sync | no public mutation |
| Final handoff contract | yes | Fill exact outcome/proof/caveat | pass: fields below resolved |
| Final lint | yes | Run scoped Ultracite | pass: 3/3 files correctly formatted/linted |
| Output budget discipline | yes | Record truncation and correction | pass: one initial truncation; exact capped reads thereafter |
| Timed checkpoint | N/A: none requested | one-shot closeout | no timing contract |
| Goal plan complete | yes | Run `check-complete.mjs` | pass: final mechanical audit command recorded for this plan |
| Browser interaction proof | yes | Open exact popup in fresh Chrome | pass: `Paste link` focused and both rows visible |
| Browser console/network check | yes | Inspect fresh-tab logs | pass with caveat: pre-existing Next prerender and Chrome-extension errors only; route loaded |
| Browser final proof artifact | yes | Capture exact Chrome screenshot | pass: emitted final route screenshot with flat rows and full divider |
| Exact case replay | yes | `/docs/examples/table` -> paragraph -> `Meta+K` | pass: popup width 330px; separator width 330px and 0px insets |
| Final ref and fingerprints | yes | Record HEAD plus issue-owned SHA-256 | pass: HEAD `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; hashes below |
| Clean final runtime | N/A: local uncommitted candidate | do not claim pushed/integrated/released | shared dirty checkout and existing localhost process recorded |
| Retry-free stability | N/A: deterministic static CSS | one focused final run | no native timing-sensitive behavior |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | exact source, upstream shadcn docs, reporter correction, and Chrome route inspected | red proof |
| Red proof | completed | focused test failed on painted input shadow, then separately on 4px separator inset | owner fix |
| Implementation | completed | `shadow-none` on both inputs; `p-0` only for form mode; changelog and generated registry updated | verification |
| Verification | completed | focused 1/1, www typecheck, registry build, changelog 84/84, scoped lint, exact Chrome | closeout |
| PR / tracker sync | completed | N/A: neither requested | closeout |
| Closeout | completed | final fingerprints and local-only boundary recorded | final response |

Findings:
- The popup surface is correct; the nested `Input` components retain the shared
  primitive's `shadow-xs` because the link rows do not set `shadow-none`.
- `p-1` on the popup wrapper makes the separator four pixels narrower on each
  side. Row content already owns horizontal spacing, so input mode should use
  zero outer padding while button mode keeps `p-1`.
- Upstream shadcn treats PopoverContent as the surface and Input as an
  independently styled control. This compact two-row command-like composition
  must explicitly neutralize the nested Input surface.

Decisions and tradeoffs:
- Fix `link.tsx`, not the shared Input or global style map: ordinary inputs need
  their shadow and all shadcn popovers need their style-specific padding.
- Add row-specific `shadow-none` and input-mode `p-0`; keep button-mode `p-1`.

Implementation notes:
- `apps/www/src/registry/components/editor/link.tsx` neutralizes both nested
  inputs with `shadow-none`.
- Insert mode and edit-input mode merge `p-0`; edit-button mode retains the
  original `p-1`.
- Generated `apps/www/public/r/link.json` and registry changelog artifacts were
  rebuilt from source. No generated file was hand-edited.

Review fixes:
- N/A: scoped lint and source review found no actionable issue; Autoreview is
  forbidden on `next` and disproportionate for this trivial class repair.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined owner search exceeded the output cap | 1 | exact file ranges only | owner narrowed without further broad output |
| Final chained check found changelog JSON stale after MDX formatting | 1 | regenerate source-owned JSON, rerun check and registry build | 84/84 check and final registry build passed |

Verification evidence:
- RED 1: focused Chromium test failed because separator left inset was 4px.
- RED 2: focused Chromium test failed because the unfocused input retained a
  painted `shadow-xs`.
- GREEN: focused Chromium link case passed 1/1 after the owner edit and again
  after final formatting.
- `pnpm --filter www typecheck` passed the full www source/type chain.
- `pnpm --filter www build:registry` passed on final source and materialized
  380 canonical payloads plus 15 sparse overlays.
- Registry changelog source/generated check passed 84/84; scoped Ultracite
  passed all three authored files.
- Exact Chrome: input shadows contain only transparent colors; surface padding
  `0px`; popup and separator widths both `330px`; left/right inset `0px`; outer
  popover shadow/ring retained; `Paste link` focused.
- Final fingerprints: link source
  `6270fec8e35656c673356f8bacdeb0e02c3eb8f59fe5022fef8e9fbbd312d19f`;
  browser test
  `d052105e4116d7fb3941d79b043d5a3627fc34c7f805a443ade5f4e5af9f770e`;
  changelog source
  `bbe4ecc7fec6743999c32139a17a4b4672d5c15476266ac513663fe275d31c95`;
  changelog JSON
  `85aed5aafad5c3b480761dcd5bb3a5d959093ba08e3b7d8e18004cdf6ec8f07e`;
  generated link JSON
  `1ccf617c1cd776258af67f72f30d1c60d803e5f925643734c17ac5a459f6864c`.

Final handoff contract:
- PR line: N/A: no PR/commit/push requested
- Issue / tracker line: N/A: no public issue or tracker
- Confidence line: high for the local candidate; no integration/release claim
- Flow table:
  - Reproduced: focused Chromium red plus exact Chrome 0.05-alpha shadow and 4px inset
  - Verified: focused Chromium green plus exact Chrome transparent shadows and 0px insets
- Browser check: exact `/docs/examples/table` Chrome replay and screenshot passed
- Outcome: flat link inputs and edge-to-edge separator; outer popup preserved
- Caveat: local uncommitted candidate; unrelated Next prerender and extension console errors remain outside scope
- Design:
  - Chosen boundary: local link form composition
  - Why not quick patch: this is the smallest durable owner, backed by behavior proof
  - Why not broader change: shared Input shadows and style-specific Popover spacing are correct elsewhere
- Verified: red/green, typecheck, registry generation, changelog, lint, Chrome
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
- Issue / tracker: N/A: not requested
- Browser proof: exact Chrome route passed with final screenshot and geometry
- Caveats: uncommitted/unpushed local checkout; unrelated console errors noted

Timeline:
- 2026-08-26T11:39:18.847Z Task goal plan created.
- 2026-08-26T11:42Z Exact pre-fix Chrome measured painted input shadow and 4px separator insets.
- 2026-08-26T11:43Z Focused browser proof failed red on shadow and geometry.
- 2026-08-26T11:44Z Local link composition fixed; focused proof passed.
- 2026-08-26T11:46Z Changelog and registry generated; exact Chrome replay passed.
- 2026-08-26T11:49Z Typecheck, final generation, lint, hashes, and local-only boundary closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | closeout complete |
| Where am I going? | user handoff |
| What is the goal? | remove nested input shadows and make the link separator edge-to-edge without changing other popovers |
| What have I learned? | the defect is local link composition, not browser zoom or global shadcn scaling |
| What have I done? | reproduced, tested red, fixed the local owner, regenerated outputs, and passed focused/type/browser proof |

Open risks:
- No task-specific behavior risk remains in the local candidate. Integration
  remains uncommitted and unpushed; the exact Chrome route also reports
  unrelated pre-existing Next prerender and Chrome-extension console errors.
