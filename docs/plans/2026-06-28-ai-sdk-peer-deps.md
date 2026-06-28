# ai sdk peer deps

Objective:
Set AI SDK as `@platejs/ai` optional peers with a minor changeset; done when manifest, changeset, package check, PR update, and plan check pass.

Goal plan:
docs/plans/2026-06-28-ai-sdk-peer-deps.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user prompt
- id / link: N/A
- title: make leaked AI SDK types explicit peers and minor bump
- acceptance criteria: add `ai` and `@ai-sdk/react` as `@platejs/ai` peer dependencies, keep them as dev dependencies, mark peers optional, and change the `@platejs/ai` changeset to minor.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `packages/ai/package.json` exposes `ai` and `@ai-sdk/react` as optional peer dependencies while keeping dev dependencies for local builds.
- `.changeset/ai-sdk-v7-chat-types.md` bumps `@platejs/ai` as `minor`.
- `@platejs/ai` typecheck and root lock/install graph proof pass or have a concrete blocker.
- PR #5045 is updated after commit/push.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-ai-sdk-peer-deps.md` passes.

Verification surface:
- Source audit of `packages/ai/package.json` and `.changeset/ai-sdk-v7-chat-types.md`.
- `pnpm install`, `pnpm --filter @platejs/ai typecheck`, `pnpm lint:fix`, `git diff --check`.
- PR #5045 body/check readback after push.

Constraints:
- Do not broaden the AI SDK migration.
- Do not change runtime imports for `@platejs/ai`.
- Keep formal autoreview waived per earlier user instruction.

Boundaries:
- Source of truth: latest user prompt and current `@platejs/ai` manifest/types.
- Allowed edit scope: `packages/ai/package.json`, `.changeset/ai-sdk-v7-chat-types.md`, lockfile if install changes it, this plan, and PR body metadata.
- Browser surface: N/A; package manifest/types only.
- Tracker sync: PR #5045 body and branch push.
- Non-goals: structural type rewrite, docs rewrite, registry/template changes.

Output budget strategy:
- Use focused reads and audits for exact files only; no broad generated output.

Blocked condition:
- Stop if package manager cannot resolve the new optional peer graph or `@platejs/ai` typecheck fails with an API incompatibility that requires a broader design choice.

Task state:
- task_type: package release follow-up
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: commit and push
- goal_status: locally complete

Current verdict:
- verdict: valid
- confidence: high
- next owner: current agent
- reason: exported declarations mention AI SDK types, so devDependency-only is the wrong package contract.

Pre-solution issue challenge:
- reporter claim: N/A; no tracker bug.
- suggested diagnosis or fix: user selected option 2 from the prior analysis.
- repro ladder:
  - tests / source-level repro: source audit is enough for package manifest/type contract.
  - Playwright / automated browser: N/A.
  - Browser plugin: N/A.
  - screenshot / visual proof: N/A.
- reproduction verdict: N/A.
- validity verdict: valid.
- best long-term fix boundary: `@platejs/ai` package peer metadata.
- harsh honest feedback: devDependency-only is wrong when emitted public types reference external packages.
- hard-stop decision: no hard stop.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied and the plan checker passes.
- Do not create hook state for this goal.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | Used `autogoal`, `task`, and `changeset`; package-api pack selected. |
| Active goal checked or created | yes | `get_goal` returned none; created this follow-up goal. |
| Source of truth read before edits | yes | Read user prompt and `packages/ai/package.json` exported dependency surface. |
| Tracker comments and attachments read | N/A | No tracker item. |
| Video transcript evidence required | N/A | No video evidence. |
| Pre-solution issue challenge required | N/A | No public tracker bug; source audit recorded. |
| Reproduction verdict before implementation | N/A | Package metadata follow-up, not behavior bug. |
| Repro escalation ladder selected | N/A | No user-visible browser/runtime bug. |
| Suggested fix reviewed against durable boundary | yes | Durable boundary is peer metadata on `@platejs/ai`. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Micro package manifest follow-up. |
| TDD decision before behavior change or bug fix | N/A | No runtime behavior change. |
| Branch decision for code-changing task | yes | Continue existing PR #5045 branch; open PR follow-up authorizes commit/push. |
| Release artifact decision | yes | Existing `.changeset/ai-sdk-v7-chat-types.md` will become minor. |
| Browser tool decision for browser surface | N/A | No browser surface changed. |
| PR expectation decision | yes | Update PR #5045 after push. |
| Tracker sync expectation decision | yes | PR body is the tracker sync. |
| Output budget strategy recorded | yes | Focused reads/audits only. |
| Package/API pack selected | yes | Public package peer/type boundary changed. |
| Public surface or package boundary identified | yes | `@platejs/ai` emitted types reference `ai` and `@ai-sdk/react`. |
| Release artifact path selected | yes | `.changeset/ai-sdk-v7-chat-types.md`. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `changeset` skill. |
| Barrel/export impact decision recorded | yes | N/A: no export or barrel layout changes. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless explicitly marked hard stop; when no better metric exists, initial and final confidence scores are recorded. N/A: no duration requested.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or suggested fixes, reporter claims are challenged before implementation with a recorded verdict. N/A: no tracker bug.
- [x] Repro escalation ladder followed for bug/behavior claims. N/A: no bug behavior.
- [x] Hard-stop rule followed for bug/behavior claims. N/A: no bug behavior.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or N/A with reason.
- [x] Final handoff shape decided: PR body update plus concise final.
- [x] Branch handling recorded for code-changing work.
- [x] Local-env-rot retry policy recorded. N/A unless checks show install corruption.
- [x] Workspace authority recorded: proof commands run in `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded for public package-boundary change.
- [x] Review/autoreview target selected or marked N/A. N/A: user cut autoreview earlier.
- [x] Agent-native review decision recorded. N/A: no agent-native files.
- [x] Output budget discipline recorded and followed.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: not registry-only.
- [x] Package/API pack: no-artifact decisions state why the diff has no published user-visible delta from `main`. N/A: release artifact required.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded before closeout.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no barrels/export layout changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source audits and package checks | Passed source audit, install, `@platejs/ai` typecheck, lint, diff check, and `pnpm check`. |
| Pre-solution issue challenge verdict | N/A | Record challenge verdict | No tracker bug; source audit validates package-boundary fix. |
| Repro escalation ladder | N/A | Record ladder outcomes | No behavior bug. |
| Bug reproduced before fix | N/A | Record failing repro or reason | No behavior bug. |
| Targeted behavior verification | N/A | Run focused behavior proof | No runtime behavior change. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter @platejs/ai typecheck` to be recorded. |
| Package exports or file layout changed | N/A | Run `pnpm brl` | No exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed; lockfile stayed up to date. |
| Agent rules or skills changed | N/A | Run sync proof | No agent files changed. |
| Workspace authority proof | yes | Run proof in owning repo | `/Users/zbeyens/git/plate` commands to be recorded. |
| Browser surface changed | N/A | Capture browser proof or caveat | Manifest/types only. |
| Browser final proof | N/A | Attach proof or caveat | No browser surface. |
| CI-controlled template output changed | N/A | Restore or justify | No template output touched. |
| Package behavior or public API changed | yes | Add changeset | Existing changeset changed to minor. |
| User-visible registry output changed | N/A | Registry changelog pack | No registry files changed in this follow-up. |
| Docs or content changed | N/A | Docs proof | No docs changed. |
| High-risk mini gate | yes | Record failure mode, proof plan, boundary | Failure mode: consumers miss peer install/type alignment; proof: manifest audit and typecheck; boundary: package metadata. |
| Agent-native review for agent/tooling changes | N/A | Run review | No agent/tooling changes. |
| Local install corruption suspected | N/A | Reinstall retry | Not suspected. |
| Autoreview for non-trivial implementation changes | N/A | Run or record reason | Waived by user's earlier "cut the autoreview". |
| PR create or update | yes | Run required check/proof and sync PR body | PR #5045 body updated before commit/push with peer/minor follow-up and task format. |
| Task-style PR body verified | yes | Verify with `gh pr view --json body` | `gh pr view 5045 --repo udecode/plate --json body --jq .body` showed auto-release block, task table, outcome, caveat, design, and verified sections. |
| PR proof image hosting | N/A | Host images if needed | No image proof. |
| Tracker sync-back | N/A | Post tracker sync | PR body is the only tracker surface. |
| Final handoff contract | yes | Fill final handoff fields | Final handoff fields recorded below. |
| Final lint | yes | Run `pnpm lint:fix` | Passed; no fixes applied. |
| Output budget discipline | yes | Verify no noisy output | Focused commands only. |
| Timed checkpoint | N/A | Close timed loop | No duration requested. |
| Goal plan complete | yes | Run plan checker | Passed at 2026-06-28T18:52Z. |
| Public API / package boundary proof | yes | Source-audit package boundary | `packages/ai/package.json` now has optional peers and devDeps for `ai@^7.0.0` and `@ai-sdk/react@^4.0.0`. |
| Release artifact classification | yes | Record artifact type | Published package type/peer metadata; minor changeset. |
| Published package changeset | yes | Update changeset and prove no forbidden minor | `@platejs/ai` minor is allowed; forbidden packages untouched. |
| Registry changelog | N/A | Add registry changelog if registry-only | No registry changes in this follow-up. |
| No release artifact | N/A | Record reason | Release artifact required. |
| Package typecheck/build/test | yes | Run owning package check | `pnpm --filter @platejs/ai typecheck` and root `pnpm check` passed. |
| Barrel/export generation | N/A | Run `pnpm brl` when required | No export layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User prompt and package surface read | implementation |
| Implementation | complete | Added optional peers and changed changeset to minor | verification done |
| Verification | complete | Install, typecheck, lint, diff check, and root check passed | commit and push |
| PR / tracker sync | complete | PR #5045 body updated and verified | commit and push |
| Closeout | complete | Plan ready for checker | final response |

Findings:
- `@platejs/ai` exported types reference `UseChatHelpers` from `@ai-sdk/react` and `ChatRequestOptions`/`UIMessage` from `ai`.
- Therefore the package contract should expose those packages as optional peers if the types stay public.

Decisions and tradeoffs:
- Choose peer + dev dependency: peers document the consumer contract; dev deps keep local build/typecheck working.
- Mark peers optional so non-AI-chat consumers are not forced into runtime installs unless their usage needs the typed helper surface.
- Use minor, not patch, because the package compatibility contract changes but this is not a runtime breaking API removal.

Implementation notes:
- Added `ai` and `@ai-sdk/react` to `@platejs/ai` peer dependencies.
- Added optional peer metadata for both AI SDK packages.
- Kept both packages in dev dependencies for local build/typecheck.
- Changed `.changeset/ai-sdk-v7-chat-types.md` from patch to minor.

Review fixes:
- None.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `/Users/zbeyens/git/plate`: source audit showed `@platejs/ai` has `peerDependencies` and `peerDependenciesMeta` for `ai@^7.0.0` and `@ai-sdk/react@^4.0.0`, and keeps matching dev dependencies.
- `/Users/zbeyens/git/plate`: source audit showed `.changeset/ai-sdk-v7-chat-types.md` uses `minor` for `@platejs/ai`.
- `/Users/zbeyens/git/plate`: `pnpm install` passed; lockfile was already up to date.
- `/Users/zbeyens/git/plate`: `pnpm --filter @platejs/ai typecheck` passed.
- `/Users/zbeyens/git/plate`: `pnpm lint:fix` passed with no fixes.
- `/Users/zbeyens/git/plate`: `git diff --check` passed.
- `/Users/zbeyens/git/plate`: `pnpm check` passed; existing unrelated sidebar hook warning remains a warning only.
- `/Users/zbeyens/git/plate`: `gh pr view 5045 --repo udecode/plate --json body --jq .body` verified the task-style PR body.
- `/Users/zbeyens/git/plate`: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-ai-sdk-peer-deps.md` passed.

Final handoff contract:
- PR line: PR #5045 updated after push.
- Issue / tracker line: N/A.
- Confidence line: high after focused checks.
- Flow table:
  - Reproduced: source audit, browser N/A.
  - Verified: package/type/install checks, browser N/A.
- Browser check: N/A.
- Outcome: optional peers plus minor changeset.
- Caveat: remote CI will rerun after push.
- Design:
  - Chosen boundary: `@platejs/ai` package metadata.
  - Why not quick patch: devDependency-only hides a public type contract.
  - Why not broader change: structural type rewrite was not requested.
- Verified: install, typecheck, lint, diff check, root check, source audit.
- PR body verified: yes.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block.
- Use task PR format with `🐛 Fixes ➖ N/A`, confidence line, `| Phase | 🧪 Tests | 🌐 Browser |`, and bold emoji sections.
- Proof is `gh pr view --json body`.

Final handoff / sync:
- PR: #5045 body updated and verified; branch push follows commit.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: remote CI will rerun after push.

Timeline:
- 2026-06-28T18:45:57.951Z Task goal plan created.
- 2026-06-28T18:46Z Active goal created and plan filled.
- 2026-06-28T18:49Z Added optional peers, changed changeset to minor, and ran local proof.
- 2026-06-28T18:51Z Updated and verified PR #5045 body.
- 2026-06-28T18:52Z Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout before commit/push. |
| Where am I going? | Run plan checker, commit, push, and read PR checks. |
| What is the goal? | Make AI SDK packages optional peers and set `@platejs/ai` changeset to minor. |
| What have I learned? | Public types leak AI SDK types, so peer metadata is correct. |
| What have I done? | Added optional peers, switched changeset to minor, verified locally, and updated PR body. |

Open risks:
- Remote CI can still lag or fail after push; local package proof is the required fast gate.
