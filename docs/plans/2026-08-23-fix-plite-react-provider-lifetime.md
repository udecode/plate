# Fix Plite React provider lifetime

Objective:
Fix Plite React provider identity leaks; done when exact lifecycle repros turn green, package/browser proof passes 5/5, API doctrine is current, and P1 autoreview passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-23-fix-plite-react-provider-lifetime.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-approved local architecture finding
- id / link: PLITE-REACT-PROVIDER-LIFETIME-001; attachment `/Users/zbeyens/.codex/attachments/a518a0e5-1836-4aff-a426-e2a2852dacd9/pasted-text.txt`
- title: Plite React provider identity lifetime
- acceptance criteria: mounted provider identity has one explicit contract; queued work and selection state cannot cross editor/runtime ownership; keyed remount is the supported replacement path; exact red/green coverage, package proof, browser proof, changeset, doctrine repair, and P1 autoreview are complete.

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
- initial confidence score: N/A: binary red/green threshold is stronger
- improvement loop: reproduce -> contract audit -> fix -> 5/5 proof -> review
- final score / loop closure: N/A

Completion threshold:
- Red proof demonstrates editor/runtime identity replacement leaks queued selector work or editor-owned selection state before the repair.
- The selected public contract is explicit: one mounted provider owns one editor/runtime identity; replacement uses a keyed remount.
- Exact lifecycle tests pass 5 consecutive runs with zero cross-owner notification, selection, callback, or listener retention.
- `@platejs/plite-react` tests and typecheck, scoped lint, `pnpm check:plite:dev`, relevant Browser proof, changeset validation, doctrine/source mirror audit, and P1 autoreview pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-fix-plite-react-provider-lifetime.md` passes.

Verification surface:
- Focused Vitest contract tests in `packages/plite-react/test/**` with recorded red then 5/5 green results.
- `pnpm --filter @platejs/plite-react test`, `pnpm --filter @platejs/plite-react typecheck`, scoped Ultracite/lint, and `pnpm check:plite:dev` from `/Users/zbeyens/git/plate-2`.
- Fresh `apps/plite` route proof through Browser for provider replacement/focus behavior, including console state; exact route recorded before the run.
- Source audit of public JSDoc/docs, Vision/best-api source doctrine, generated skill mirrors, and package release artifact.
- P1 `autoreview --max-priority P1` over the actual changed-file boundary.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not preserve partial hot-swap behavior, add per-cache reset patches, or alter Plite core document semantics.
- Do not commit, push, create a PR, or mutate a public tracker.

Boundaries:
- Source of truth: `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `packages/plite-react` public types/implementation/tests, and current terminal consumers.
- Allowed edit scope: `packages/plite-react/**`, the smallest current-state Plite docs/JSDoc owner, one `.changeset/*.md`, `.agents/rules/best-api.mdc`, smallest relevant Vision owner, generated skill mirrors from `pnpm install`, and this plan.
- Browser surface: `apps/plite`, exact route selected from the existing Plite React examples; no new duplicate example tree.
- Browser strategy: Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: local user request names no issue or PR.
- Non-goals: Plite core redesign, generic React framework machinery, compatibility aliases, unrelated cleanup, release/public mutation, or support for editor/runtime hot-swapping inside one mounted provider.

Output budget strategy:
- Read exact owner files and capped `rg` call-site manifests; exclude generated/build trees. Run focused tests before broad gates and cap command output. Save verbose proof to existing test artifacts when available instead of streaming it.

Blocked condition:
- Stop only if the exact case cannot reproduce, current consumers prove hot-swapping is a required product job that contradicts the accepted contract, Browser cannot exercise any honest route, or three P1 review invocations leave an accepted actionable finding.

Task state:
- task_type: local Plite React behavior/API repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete in this ledger; the unrelated release-proof goal remains blocked and untouched

Current verdict:
- verdict: mounted provider identity should be immutable; replacement requires keyed remount
- confidence: high; exact red/green, package, docs, Browser, doctrine, agent-native, and P1 review gates passed
- next owner: user; commit/PR/release work was not requested
- reason: no terminal consumer needs live runtime-owner replacement, while keyed remount gives React one complete lifetime boundary and preserves supported root switching.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-fix-plite-react-provider-lifetime.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User approved execution of item 4; scope, non-goals, proof, release artifact, and handoff are explicit above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `autogoal`, `patch`, `best-api`, `docs-creator`, `changeset`, and Browser. `patch` owns the behavior repair; `best-api` owns the hard-cut contract and doctrine repair. |
| Active goal checked or created | yes | Existing goal is unrelated release-proof work already terminal-blocked. User explicitly said “go”; this plan records degraded goal control without hijacking that goal. |
| Source of truth read before edits | yes | Read root/common/Plite Vision, Best API behavior doctrine, provider implementations, contract tests, current docs, terminal consumers, and relevant solutions. |
| Tracker comments and attachments read | yes | User attachment and prior item-4 review consumed; N/A for tracker because none was named. |
| Video transcript evidence required | no | N/A: no video supplied or needed. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read Plite React runtime-owner and hook-proof solutions dated 2026-04-27 and 2026-05-08. |
| TDD decision before behavior change or bug fix | yes | Exact unsupported owner replacement and deferred root-notification cases must fail before source edits. |
| Branch decision for code-changing task | no | N/A: no commit or PR requested; branch state is intentionally not inspected. |
| Release artifact decision | yes | One patch changeset for `@platejs/plite-react`, written relative to `main`. |
| Browser tool decision for browser surface | yes | Use Browser on the existing `/examples/plite/huge-document` keyed-remount path; package Vitest proves unsupported replacement. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker target. |
| Output budget strategy recorded | yes | Exact files and capped searches only; focused tests precede broad gates. |
| Docs pack selected | yes | Supporting API-reference docs under the task primary template. |
| `docs-creator` loaded | yes | Loaded skill and `style-and-structure.md`. |
| Docs lane selected | yes | API reference/current-state behavior contract. |
| Target docs and nearest sibling docs read | yes | Read `plite.mdx` and `react-editor-setup.mdx`. |
| Docs style doctrine read | yes | Read docs-creator source and style reference. |
| Documented source owner identified | yes | `packages/plite-react` public JSDoc owns the contract; `content/docs/plite/libraries/plite-react/plite.mdx` teaches it. |
| Browser pack selected | yes | Browser pack materialized in this plan. |
| Browser route / app surface identified | yes | `/examples/plite/huge-document`; changing block count replaces the editor and increments the provider key. |
| Browser tool decision recorded | yes | In-app Browser for route interaction, DOM/focus, and console checks; no native Chrome-only surface. |
| Console/network caveat policy recorded | yes | Console errors are blocking; unrelated network noise is recorded with exact source. |
| Observable browser case captured | yes | `PLITE-REACT-PROVIDER-LIFETIME-001`: open huge-document, focus/type, change block count to trigger keyed editor remount, refocus/type; expect fresh document, valid focus/caret, no stale selection/error, 5/5 warm runs. Local dirty ref and final file fingerprints will bound the claim. |
| Package/API pack selected | yes | Package/API pack materialized in this plan. |
| Public surface or package boundary identified | yes | `<Plite editor>`, `<Plite root>`, `<PliteRuntime runtime>`, and `useEditorSelector` subscription lifecycle in `@platejs/plite-react`. |
| Release artifact path selected | yes | `.changeset/<slug>.md` for `@platejs/plite-react` patch. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before authoring. |
| Barrel/export impact decision recorded | yes | No new public export or exported-file relocation planned; `pnpm brl` is N/A unless implementation changes that. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Close every named proof lane. | Exact lifecycle tests passed 5/5 on final bytes; package, docs, lint, `check:plite:dev`, Browser, doctrine parity, agent-native audit, and P1 autoreview passed. |
| Bug reproduced before fix | yes | Record exact red behavior. | Initial focused run: 3 failed and 1 passed. Both mounted-owner replacements failed to throw; deferred root work produced one extra selector call, expected 3 and received 4. |
| Targeted behavior verification | yes | Prove the repaired lifecycle contract. | Five consecutive final focused runs each passed 2 files and 5 tests with 89 unrelated tests skipped. |
| TypeScript or typed config changed | yes | Run owning typecheck. | `pnpm --filter @platejs/plite-react typecheck` passed in `/Users/zbeyens/git/plate-2`. |
| Package exports or file layout changed | no | Record barrel decision. | N/A: no public export, exported file, or package topology changed; `pnpm brl` is not applicable. |
| Package manifests, lockfile, or install graph changed | yes | Regenerate source-owned agent mirrors and validate install graph. | `pnpm install` passed and regenerated the Best API mirror; no task-owned package manifest or dependency change was made. |
| Agent rules or skills changed | yes | Sync and compare source/mirror. | `pnpm install` passed; normalized `.agents/rules/best-api.mdc` and `.agents/skills/best-api/SKILL.md` content diffed clean. |
| Workspace authority proof | yes | Run proof in the owning repo/package/app. | All commands ran from `/Users/zbeyens/git/plate-2`; package proof used `@platejs/plite-react`, docs proof used `www`, and route proof used `apps/plite`. |
| Browser surface changed | yes | Exercise the existing keyed-remount consumer. | Browser ran `/examples/plite/huge-document` in React Strict Mode and alternated 1000/2 blocks across five warm runs. |
| Browser final proof | yes | Record state and caveat. | 5/5: requested block count rendered, editor remained active, selection stayed collapsed inside the textbox, follow-up text landed, and Browser logs contained no warnings or errors. Visual screenshot waived because no paint contract changed and semantic focus/selection state was the stronger proof. |
| CI-controlled template output changed | no | Avoid task-owned template edits. | N/A: no `templates/**` file was edited. |
| Package behavior or public API changed | yes | Add release artifact. | `.changeset/plite-react-provider-lifetime.md` records one patch for `@platejs/plite-react`; no forbidden minor bump. |
| Registry-only component work changed | no | Record registry artifact decision. | N/A: this is package runtime behavior, not registry-only work. |
| Docs or content changed | yes | Validate MDX and source parity. | Final `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed. |
| High-risk mini gate | yes | Name failure mode, boundary, and proof. | Failure mode was owner-bound callbacks/caches surviving identity replacement. The provider owns those resources, so the mounted runtime owner is immutable; keyed remount retires the whole subtree. Root switching stays supported and has an exact deferred-work test. |
| Agent-native review for agent/tooling changes | yes | Close route/source/mirror/proof gaps. | PASS: Best API is discoverable, `.mdc` is the source, the generated skill is current, package/docs/Browser proof is repeatable, and bounded skill audit found no stale replacement teaching. |
| Local install corruption suspected | no | Record retry decision. | N/A: failures matched the new invariant/test assumptions, not module-resolution or mixed-React install corruption; reinstall was not warranted. |
| P1 autoreview for non-trivial implementation changes | yes | Run the scoped helper once and close findings. | `autoreview --mode local --max-priority P1` completed two bounded passes with zero findings and overall correctness `patch is correct` at 0.99 confidence. |
| PR create or update | no | Record authority boundary. | N/A: user did not request a commit, push, PR, or PR body mutation. |
| Tracker sync-back | no | Record target boundary. | N/A: no issue or tracker target was named. |
| Final lint | yes | Run scoped formatter/linter. | Final targeted Ultracite passed all six implementation/test/changeset files. |
| Output budget discipline | yes | Record bounded evidence. | Searches were path/glob capped after one early broad call; verbose broad-gate output was consumed as a summarized receipt. |
| Timed checkpoint | no | Record timing decision. | N/A: no duration was requested. |
| Goal plan complete | yes | Run mechanical closure validator. | `[autogoal] complete: docs/plans/2026-08-23-fix-plite-react-provider-lifetime.md`. |
| Exact case replay and fingerprints | yes | Bind proof to final local bytes. | Ref `dirty:ea82e578400db911a882f7f6b1d685a2059af22f`; production, test, docs, doctrine, and unchanged huge-document harness SHA-256 values are recorded below. |
| Clean final runtime | no | Bound completion claim honestly. | N/A for shipped/final-ref certification: work is local and uncommitted. The claim is a verified current-checkout repair, not pushed, merged, released, or shipped. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Contract, owner, terminal consumers, docs, and proof route audited. | implementation |
| Implementation | complete | Mounted owner invariant, root-view deferred cleanup, tests, docs, doctrine, and changeset added. | verification |
| Verification | complete | Final focused 5/5, 1,083 package tests, typecheck, docs, lint, `check:plite:dev`, and Browser 5/5 are green. | closeout |
| PR / tracker sync | N/A | No PR or tracker mutation was requested or authorized. | final response |
| Closeout | complete | Agent-native review and one scoped P1 autoreview invocation passed with zero findings; fingerprints recorded. | final response |

Review scope baseline:
- Original request: implement the accepted repair for architecture finding 4.
- Violated invariant: a mounted provider could publish another editor/runtime owner while retaining owner-bound React state; deferred selector work also survived a supported root-view change.
- Target ref: current uncommitted checkout; no branch, commit, push, PR, or tracker mutation is authorized.
- Intended behavior: one mounted `Plite` or `PliteRuntime` binds one editor runtime owner; replacement requires keyed remount; root-view changes remain supported and cancel queued prior-view selector work.
- Owner boundary: `packages/plite-react` provider and selector lifecycle, with current-state docs, Plite Vision, Best API source doctrine, generated mirror, and one package changeset.
- Relevant sibling surfaces: `Plite`, `PliteRuntime`, `useEditorSelector`, existing provider unmount/callback tests, PlateRoot, and the keyed huge-document example.
- Public/security/product contracts: no new export, serialized-data change, security boundary, or hot-replacement compatibility layer. This is a deliberate hard cut of unsupported partial replacement behavior.
- Exact review files: `.agents/rules/best-api.mdc`, the generated `.agents/skills/best-api/SKILL.md` paragraph, `.changeset/plite-react-provider-lifetime.md`, `content/docs/plite/libraries/plite-react/{hooks,plite}.mdx`, `docs/vision/plite.md`, `packages/plite-react/src/components/plite.tsx`, `packages/plite-react/src/hooks/{use-editor-selector,use-plite-runtime}.tsx`, and `packages/plite-react/test/{provider-hooks-contract,plite-runtime-provider-contract.test}.tsx`.
- Unrelated checkout drift: other edits are user-owned. The Best API and Vision files also contain unrelated predicate/release-proof additions; review must ignore those hunks.

Findings:
- Root cause: provider internals retained editor/runtime-owned queues, caches, and callback cells while public props permitted another owner to appear in the same mounted React lifetime.
- Supported root-view changes shared the runtime owner but a deferred `useEditorSelector` callback remained queued across view editor identity change.
- Terminal consumers did not establish a live owner-replacement job. PlateRoot and the huge-document example already use keyed remounts when editor identity changes.
- Agent-native review: PASS, no actionable gaps.
- P1 autoreview: zero findings across two bounded passes; overall correctness `patch is correct`, confidence 0.99.

Decisions and tradeoffs:
- Bind each mounted `Plite` or `PliteRuntime` to the editor runtime owner captured by React state. Throw on a different owner and tell the caller to change the React key.
- Keep root views replaceable inside one runtime. Resubscribe selector delivery on view editor identity so cleanup deletes queued prior-view work.
- Reject selective cache resets and partial hot-replacement compatibility. They would preserve the bug class and create a lifecycle protocol no current consumer needs.
- Keep the owner guard internal. The public contract is expressed through existing provider props, JSDoc, current-state docs, runtime errors, and tests; no new export is justified.

Implementation notes:
- `useMountedEditorRuntimeOwner` is called unconditionally by both provider entrypoints and compares `getEditorRuntimeOwner` identities.
- `useEditorSelector` includes the current view editor in its subscription effect dependencies; existing unsubscribe logic removes both the live listener and any queued deferred callback.
- The keyed-remount tests cover `Plite` and `PliteRuntime`; the root-view test covers prior-view cancellation and one subsequent notification.
- Best API source doctrine, generated mirror, Plite Vision, Plite React docs, JSDoc, and the patch changeset teach the same final contract.

Review fixes:
- None. The scoped P1 reviewer returned zero findings, so no review-triggered patch cycle was needed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `<Plite>` call-site search included generated `apps/www/public` JSON and exceeded the intended output budget. | 1 | Restrict searches to `*.tsx` source and exclude generated/public trees. | Re-ran a bounded terminal-consumer manifest; no further broad output. |
| Initial package typecheck rejected an invariant `Editor`/`AnyEditor` hook parameter. | 1 | Derive the accepted input from the owner function instead of adding a cast or callback annotation. | `Parameters<typeof getEditorRuntimeOwner>[0]` restored source-owned inference; typecheck passed. |
| The abandoned-render callback test also swapped editor owners, which contradicted its actual callback-commit purpose after the hard cut. | 1 | Keep the owner stable and vary only the abandoned callback/render. | Focused and full package tests passed with the test again proving its named invariant. |
| The first Browser probe waited for a transient `Rendering...` label after the warm render had already finished. | 1 | Poll the stable block-count, textbox, focus, selection, and pending-block outputs instead. | Five semantic warm runs passed; the setup timing miss was not treated as product failure. |
| The first fingerprint command named a non-existent huge-document harness path. | 1 | Resolve the exact source with bounded `rg --files`. | Hashed `apps/www/src/app/(app)/examples/plite/_examples/huge-document.tsx`. |

Verification evidence:
- Red: focused lifecycle command failed 3/4 target cases before the repair. Both mounted-owner replacement cases did not throw, and deferred prior-root work caused one extra selector call (`expected 3`, `received 4`).
- Green stability: the final focused command ran five consecutive times; every run passed 2 files and 5 target tests with 89 skipped, in 1.43-1.45 seconds.
- Package: `pnpm --filter @platejs/plite-react typecheck` passed; `pnpm --filter @platejs/plite-react test` passed 74 files and 1,083 tests.
- Broad Plite development gate: `pnpm check:plite:dev` passed all mapped typechecks, package tests, browser core tests, contracts, and 3-test Chromium smoke in 111,308 ms.
- Docs: final `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed, including MDX generation, API-reference check, and source parity.
- Lint: targeted `pnpm exec ultracite check` passed the three production files, two contract-test files, and changeset.
- Doctrine: `pnpm install` passed; normalized Best API source/generated content diffed clean; bounded worker audit found no stale live-replacement teaching.
- Browser: in-app Browser on `http://localhost:3010/examples/plite/huge-document`, React Strict Mode enabled. Five retry-free warm runs alternated block counts `1000, 2, 1000, 2, 1000`; every run rendered the requested count, kept the textbox active with a collapsed in-editor selection, accepted follow-up text, and exposed the correct pending count. Browser error/warn logs were empty.
- Browser visual waiver: N/A screenshot. The change has no paint contract; DOM focus, selection, follow-up input, block count, pending count, and console state are the authoritative observable fields.
- Agent-native: PASS capability map: user action=`replace provider owner`; agent route=`patch` plus `best-api`; source=`packages/plite-react` plus `.agents/rules/best-api.mdc`; mirror/doc=`.agents/skills/best-api/SKILL.md` plus Plite docs/Vision; proof=focused/package/docs/Browser commands.
- P1 autoreview command: `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1 --prompt <exact task boundary> --stream-engine-output`; TruffleHog clean, 548,051-byte dirty bundle split into two passes, zero findings, `patch is correct`, 0.99 confidence. Unrelated dirty files/hunks were explicitly excluded from the review scope.
- Ref: local uncommitted checkout at `dirty:ea82e578400db911a882f7f6b1d685a2059af22f`; no shipped/final-ref claim.
- SHA-256 production: `plite.tsx=4b8688b5cf2d4b6960ea152f325ea8fd3f839a4d0b1f58403cb78d175b6f9266`; `use-editor-selector.tsx=15d0e02392cb4c507dd6874a336c1a6976c20fb48e4aa73df63f4d276c415bf3`; `use-plite-runtime.tsx=aebb0cbf0029ca8c3b71fc76e0eeec4fd8993d02ab045695ffab87984ec9495a`.
- SHA-256 tests/harness: `provider-hooks-contract.tsx=afb9adcfc49fd822cfb05c077b42fde0b408bfbe1b91b0b66d8178501d727504`; `plite-runtime-provider-contract.test.tsx=1aa35740ee4adb9081962f3ba98b5bb212cb55b57908f602d3e1a200b32a1153`; `huge-document.tsx=18763c247654e59d26dba6d2219d277aac3d4c3c973de8337f9e74e11e7cb2b7`.
- SHA-256 docs/doctrine/artifact: `hooks.mdx=5310374e3c8db679922a474be0a86fcec4bbb0f2ae0ba4986882f81f94318f45`; `plite.mdx=ab6f5eeed403548b6198f69a73a5880ee552c73bc4fca6453b98df95ffda7498`; `best-api.mdc=7cbcc2034ef6d29790adba8adff923a9889f26c68e1d02189c08725ca1ae6407`; generated `SKILL.md=a20072ef6bdbeeb91ec1c2066629f6637d4f2d92e63edf04ba7f3ca559bcba7a`; `docs/vision/plite.md=506a82415c8f3a6dbf04aaf76bb052565ef183eab0404672c1658d21aaaa5aa6`; changeset=`60da7a9155b8388b48ae6031b551ac99ac0e092c0f56c1fa6fd303289d46fddb`.

Final handoff contract:
- PR line: N/A: no commit, push, or PR requested
- Issue / tracker line: N/A: no tracker target named
- Confidence line: high for the local current-checkout repair; no shipped claim
- Flow table:
  - Reproduced: exact tests red; Browser route was already a valid keyed-remount consumer and served as post-fix integration proof
  - Verified: exact tests 5/5, package 1,083 tests, `check:plite:dev`, docs, lint, Browser 5/5, agent-native PASS, P1 autoreview clean
- Browser check: 5/5 Strict Mode warm runs, valid focus/collapsed selection/follow-up input, empty warning/error logs
- Outcome: mounted provider ownership is explicit and enforced; root changes cancel queued prior-view selector work
- Caveat: local uncommitted current checkout only; not pushed, merged, released, or shipped
- Design:
  - Chosen boundary: provider lifetime plus selector subscription cleanup, the owners of the retained state
  - Why not quick patch: resetting individual caches would leave other callbacks, listeners, and queues owner-bound
  - Why not broader change: no current user job justifies a live replacement protocol or new public API
- Verified: exact commands and immutable local fingerprints recorded above
- PR body verified: N/A: no PR exists or was requested

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
- Issue / tracker: N/A: not named
- Browser proof: 5/5 local Strict Mode integration runs on `/examples/plite/huge-document`
- Caveats: current dirty local checkout; unrelated user-owned changes were preserved and excluded from the task/review claim

Timeline:
- 2026-08-23T00:51:42.647Z Task goal plan created.
- 2026-08-23 Contract gate selected immutable mounted editor/runtime ownership plus keyed remount; root changes remain supported and must cancel old deferred selector work.
- 2026-08-23 Terminal consumers use stable hook-owned editors; PlateRoot and huge-document already key provider remounts when editor identity can change.
- 2026-08-23 Exact red proof captured 3 failures; implementation, docs, doctrine, and changeset completed.
- 2026-08-23 Final focused 5/5, package 1,083 tests, typecheck, docs, lint, broad Plite dev gate, and Browser 5/5 passed.
- 2026-08-23 Agent-native audit passed; scoped P1 autoreview completed two passes with zero findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final local handoff; optional commit/PR is a separate user decision |
| What is the goal? | Prevent editor/runtime-owned React state from crossing mounted provider identity while preserving root switching. |
| What have I learned? | Existing consumers already fit immutable mounted ownership; keyed remount is simpler and safer than maintaining a partial replacement protocol. |
| What have I done? | Enforced the owner lifetime, retired queued prior-root work, added red/green contracts, updated current teaching and release artifact, and closed every local proof/review gate. |

Open risks:
- No known code blocker remains. The render-time invariant uses React state, so abandoned renders cannot mutate the committed owner cell; the existing abandoned-render callback test passes.
- Publication remains outside this task. Local proof does not certify a pushed ref, CI artifact, merge, release, or physical-device behavior.
