# Prove one-pass tsdown on Plite

Objective:
Prove the cleanest and fastest tsdown 0.22.13 setup on `packages/plite`; stop before expanding to any other package.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-upgrade-tsdown-tooling.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user request
- id / link: N/A: no external ticket
- title: Upgrade tsdown and prove a one-package one-pass build POC
- acceptance criteria:
  - Verify the current latest stable tsdown release from an official source.
  - Upgrade the workspace dependency and lockfile to that release.
  - Read every upstream changelog entry between the installed and target versions.
  - Benchmark the existing three-process `packages/plite` build.
  - Replace only `packages/plite` with one tsdown process for ESM and bundled declarations.
  - Create no `.plite-types` staging tree and never rewrite `packages/plite/package.json`.
  - Prove public runtime imports, public declaration entries, NodeNext and Bundler declaration consumers, private-brand audit, package typecheck, and focused build contracts.
  - Report repeatable before/after timings and stop before migrating another package.

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
- initial confidence score: N/A: binary acceptance criteria and command gates are stronger
- improvement loop: N/A: no timed checkpoint
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:
- Official latest stable version is installed in the workspace manifest and lockfile.
- All release notes from the prior pin through the target are audited against live code.
- `packages/plite` builds JavaScript and bundled declarations in one tsdown process, with a focused contract and no `.plite-types` residue.
- Its package manifest is byte-identical before and after the build; NodeNext and Bundler consumers compile against `dist`.
- No other package is migrated during this POC.
- Type/lint/package checks named below pass, or an unrelated pre-existing failure is isolated with exact evidence and does not invalidate the focused artifact proof.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-upgrade-tsdown-tooling.md` passes.

Verification surface:
- Official npm metadata plus the locally checked-out upstream tsdown changelog.
- `node --test tooling/scripts/build-plite-package.test.mjs`.
- `pnpm --filter @platejs/plite build` and `pnpm --filter @platejs/plite typecheck`.
- Node runtime imports plus temporary NodeNext and Bundler declaration consumers resolved through `@platejs/plite` package exports.
- Alternating/repeated timing against the former shared three-process runner once competing Plite checks are idle.
- Scoped source audit for dependency pins, declaration configuration, package-manifest mutation, and leftover `.plite-types` directories.
- Scoped lint/typecheck or config-load checks for every changed owner.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: official npm package metadata; upstream tsdown repository changelog/docs; live workspace manifests, lockfile, and Plite build tooling.
- Allowed edit scope: root tsdown/Node dependency contract and lockfile; `packages/plite/package.json`; `packages/plite/tsdown.config.mts`; the focused shared-runner contract test needed to exempt the POC; this goal plan. Source architecture edits made by another concurrent task are dependencies, not this POC's output.
- Browser surface: N/A: build/declaration tooling has no browser-facing behavior.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no ticket or PR requested.
- Non-goals: no second package migration, no shared build-runner rewrite, no application behavior change, no compatibility aliases, no manual edits to generated package output or templates, no commit/push/PR.

Output budget strategy:
- Use exact manifest/config/script paths and version-bounded changelog reads. Exclude `node_modules`, build outputs, `.turbo`, `.next`, and unrelated dirty files. Count/file-list first; cap command output to about 4k-12k tokens. Save large package-manager/build logs to a temp artifact and inspect only failures.

Blocked condition:
- Stop only if the official latest package cannot be resolved/installed after the repo-approved narrow release-age handling, or the real release-artifact build exposes an owning upstream regression that cannot be safely fixed or pinned without changing the user's requested target.

Task state:
- task_type: dependency/toolchain upgrade plus one-package build POC
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: stop before expansion
- goal_status: complete

Current verdict:
- verdict: use one package-owned tsdown process; reject declaration staging and package-manifest generation for the POC
- confidence: high after stable timing plus build, typecheck, runtime, and declaration-consumer proof
- next owner: user acceptance before expansion
- reason: one-package POC threshold is fully met

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-upgrade-tsdown-tooling.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above capture upgrade, changelog audit, useful improvements, and verified handoff. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `task` and `autogoal`; task + package-api plan selected because build release artifacts are in scope. |
| Active goal checked or created | yes | `get_goal` returned no active goal; static plan created before `create_goal`. |
| Source of truth read before edits | yes | Read current manifests/configs/build runner, official npm metadata, all stable upstream release notes from 0.16.7 through 0.22.13, and latest tsdown dts/dependency/CI docs plus source. |
| Tracker comments and attachments read | no | N/A: direct request, no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read Plite ESM/declaration, multi-subpath, and published declaration-artifact incident docs; release declarations are the contract to preserve. |
| TDD decision before behavior change or bug fix | yes | Preserve/extend build-runner contracts before changing scratch or declaration behavior; dependency-only parts use artifact proof. |
| Branch decision for code-changing task | no | N/A: user requested local execution only; do not inspect/switch/create a branch. |
| Release artifact decision | yes | N/A: internal build-tool dependency/config only; no published package user-visible delta is intended. Generated artifacts still require proof. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact paths, bounded changelog range, generated trees excluded, capped output as stated above. |
| Package/API pack selected | yes | `package-api` protects release-artifact and package-boundary proof. |
| Public surface or package boundary identified | yes | No intended public API change; Plite release declaration/runtime artifacts are the protected boundary. |
| Release artifact path selected | no | N/A: internal-only dev tooling/lockfile; no published user-visible delta from main. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset expected. |
| Barrel/export impact decision recorded | yes | No export/file-layout change intended; rerun `pnpm brl` only if audit forces one. |

Work Checklist:
- [x] No duration was requested; completion is binary proof plus measured before/after time.
- [x] The narrowed prompt, one-package scope, stop condition, deliverables, and verification surface are recorded.
- [x] Objective, threshold, constraints, owner, and blocker condition are concrete.
- [x] Direct-request source is classified; browser, tracker, PR, branch, and video work are N/A.
- [x] Repo instructions, the Plite build runner, contract tests, and official tsdown releases/docs/source were read.
- [x] Ownership is package-local: only `packages/plite` leaves the shared runner.
- [x] Release artifact is N/A: generated runtime/types remain parity-only; no changeset or registry changelog applies.
- [x] Workspace authority is `/Users/zbeyens/git/plate-2`; proof runs through `@platejs/plite`.
- [x] Package-boundary risks are tested: missing entries, manifest mutation, private brands, consumer resolution, and dependency bundling.
- [x] Autoreview was attempted on the frozen scope; unrelated sensitive untracked files blocked bundling, so the exact POC diff received manual review.
- [x] Agent-native review is N/A because no agent/rule/skill surface changed.
- [x] Commands and searches were path-bounded and output-capped.
- [x] Package/API pack is closed: exports stay identical, no compatibility change exists, build/type/test/consumer proof passes, and barrels are N/A.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove one-pass output and timing | 760ms five-run average; all focused gates pass. |
| Bug reproduced before fix | no | N/A | Optimization POC, not a product bug; baseline was measured first. |
| Targeted behavior verification | yes | Build and consume artifacts | Runtime, NodeNext, Bundler, brand audit, and package hash proof pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter @platejs/plite typecheck` passes. |
| Package exports or file layout changed | no | N/A | Public export targets and source layout are unchanged. |
| Package manifests, lockfile, or install graph changed | yes | Install and verify | `pnpm install` completed; tsdown 0.22.13 is pinned in manifest and lockfile. |
| Agent rules or skills changed | no | N/A | No agent-owned file changed. |
| Workspace authority proof | yes | Run in owning checkout | All proof ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | Build tooling only. |
| Browser final proof | no | N/A | No browser route or UI exists for this work. |
| CI-controlled template output changed | no | N/A | No template path touched. |
| Package behavior or public API changed | no | N/A | Runtime/types API is parity-only. |
| Registry-only component work changed | no | N/A | No registry path touched. |
| Docs or content changed | yes | Verify plan claims | This execution plan records source-backed commands and timings. |
| High-risk mini gate | yes | Prove package boundary | Hook plus runtime, DTS consumers, hash, pack, and private-brand proofs pass. |
| Agent-native review for agent/tooling changes | no | N/A | No agent action/tool surface changed. |
| Local install corruption suspected | no | N/A | No install-rot signal occurred. |
| Autoreview for non-trivial implementation changes | yes | Review frozen POC scope | Helper refused unrelated sensitive untracked files; manual exact-diff review fixed the Node range and found no remaining issue. |
| PR create or update | no | N/A | User did not request PR work. |
| Task-style PR body verified | no | N/A | No PR exists. |
| PR proof image hosting | no | N/A | No PR or browser image. |
| Tracker sync-back | no | N/A | Direct request with no tracker. |
| Final handoff contract | yes | Record outcome and caveats | Completed below. |
| Final lint | yes | Run scoped equivalent | Biome checked the POC files cleanly. |
| Output budget discipline | yes | Keep output bounded | Searches/diffs were path-scoped and output-capped. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run completion checker | `check-complete.mjs` passes after closure update. |
| Public API / package boundary proof | yes | Audit exports/artifacts | Export map unchanged; both public subpaths compile and import from `dist`. |
| Release artifact classification | yes | Classify | Internal build-tooling optimization with artifact parity. |
| Published package changeset | no | N/A | No user-visible runtime, API, or type delta. |
| Registry changelog | no | N/A | Not registry work. |
| No release artifact | yes | Record reason | Build implementation only; published behavior remains equivalent. |
| Package typecheck/build/test | yes | Run owner proof | Build, typecheck, 9 tests, runtime import, and two DTS consumers pass. |
| Barrel/export generation | no | N/A | No exported source file or barrel changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Official release/docs/source and live owners audited | done |
| Implementation | completed | One-pass package-local config and focused contract | done |
| Verification | completed | Build/type/runtime/DTS/lint/timing proof green | done |
| PR / tracker sync | completed | N/A: neither requested | done |
| Closeout | completed | Plan and handoff evidence recorded | final response |

Findings:
- Current pin is `tsdown@0.16.6`; npm `latest` is `0.22.13`, published 2026-07-21.
- `0.22.13` requires Node `^22.18.0 || >=24.11.0`; CI already selects Node 22 and the local proof runtime is Node 24.14.1, while the root manifest still claims Node >=18.12.0.
- `0.22.5` added TypeScript 7 support. Latest `rolldown-plugin-dts` can infer the `tsgo` generator when TypeScript 7 is installed, so the separate TS7 `tsc -> .plite-types -> tsdown` path is a candidate for deletion, subject to real artifact parity.
- `0.21.0` deprecated top-level `external` for `deps.neverBundle`; `0.22.13` adds `deps.neverBundle: true`, which exactly replaces the declaration config's bare-import regex.
- `0.21.0` changed `failOnWarn` default from CI-only to false. The upgrade should set CI warning policy explicitly rather than silently weakening builds.
- Package validation (`publint`/`attw`) is useful but already belongs to the release-artifact checker; enabling it inside every package build would duplicate ownership and slow iteration.

Decisions and tradeoffs:
- Upgrade to stable `0.22.13`, not beta; add the narrow release-age exception required by the repo's seven-day policy because the user explicitly requested latest.
- Keep the experiment to `packages/plite`; every other package remains on the shared runner until explicit expansion.
- Use one ESM tsdown build with direct DTS, `deps.neverBundle: true`, package-manifest generation disabled, CI warning failures explicit, and a post-build artifact/private-brand assertion.
- Reject `isolatedDeclarations`: TS7 panics on live Plite source, and broad annotation churn is not justified at 760ms.
- Keep package validation out of every build; release-level packing/consumer checks own that broader cost.

Implementation notes:
- `packages/plite/package.json` invokes tsdown directly instead of the three-process shared runner.
- `packages/plite/tsdown.config.mts` emits ESM plus bundled DTS and validates generated artifacts.
- Root tsdown is 0.22.13 and Node engines exactly match its supported runtime range.
- The runner contract test preserves shared behavior for untouched packages and records Plite's POC exception.

Review fixes:
- Tightened root Node engines from over-broad `>=22.18.0` to `^22.18.0 || >=24.11.0`.
- Derived artifact assertions from the entry map to avoid a second subpath list.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct DTS hit an unnameable private `unique symbol` while concurrent schema work rewrote source | 1 | Keep direct DTS and wait for the owning token to become declaration-safe | Concurrent schema work produced a nameable token; direct builds pass without a POC source edit. |
| Initial timings were contaminated by concurrent `check:plite:dev` and www typecheck | 1 | Wait for competing processes, then repeat five clean builds | Stable samples are 741/764/865/764/667ms. |
| `isolatedDeclarations` trial panicked inside TypeScript 7 | 1 | Reject the option instead of annotating around an unstable compiler path | Normal direct DTS is retained. |
| Autoreview refused unrelated sensitive untracked files | 1 | Preserve user files and manually review the frozen POC diff | One engine-range issue fixed; no remaining actionable finding. |

Verification evidence:
- Baseline shared runner: 3228/3351/3010ms, average 3196ms.
- POC: 741/764/865/764/667ms, average 760ms; 4.21x faster and 76% less wall time.
- Node 22.22.1 CI-mode `pnpm --filter @platejs/plite build`: pass.
- `packages/plite/package.json` SHA-1 before/after: `720d33e5db736b2b7d1737ecf94f76b5d10089f9`.
- Runtime imports: root 61 exports, internal 169 exports.
- NodeNext and Bundler consumers compile with `skipLibCheck: false` against package exports.
- `node --test tooling/scripts/build-plite-package.test.mjs`: 9/9 pass.
- `pnpm --filter @platejs/plite typecheck`: pass.
- Private declaration-brand audit: pass; no declaration staging residue.
- `npm pack --dry-run --json`: both JS/DTS entries and shared chunks included; no bundled dependencies.
- Scoped Biome check: pass.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct request.
- Confidence line: high; all one-package acceptance gates pass.
- Flow table:
  - Reproduced: 3196ms three-process baseline; browser N/A.
  - Verified: 760ms one-process average plus build/type/runtime/DTS proof; browser N/A.
- Browser check: N/A: build tooling only.
- Outcome: Plite has a clean one-process tsdown POC that is 4.21x faster.
- Caveat: Expansion is intentionally not started; `isolatedDeclarations` remains blocked by a TS7 panic.
- Design:
  - Chosen boundary: package-local build config for the one-package experiment.
  - Why not quick patch: declaration staging was the overhead; the POC deletes it.
  - Why not broader change: user required proof on one package before expansion.
- Verified: exact commands and measurements above.
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
- PR: N/A: not requested.
- Issue / tracker: N/A: none.
- Browser proof: N/A: no browser surface.
- Caveats: no other package migrated; autoreview could not bundle unrelated dirty files.

Timeline:
- 2026-07-22T08:30:15.843Z Task goal plan created.
- 2026-07-22 POC narrowed to `packages/plite`; shared-tooling experiments reverted.
- 2026-07-22 One-pass build implemented, benchmarked, reviewed, and verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete one-package POC handoff |
| Where am I going? | Stop and wait for explicit expansion approval |
| What is the goal? | Prove the fastest clean one-pass tsdown setup on `packages/plite` |
| What have I learned? | Direct DTS is 4.21x faster; isolated declarations are not viable on current TS7 |
| What have I done? | Upgraded tsdown, replaced Plite's build only, and closed artifact/type/timing proof |

Open risks:
- No POC blocker. Expansion must migrate and prove each remaining package separately; some packages may expose declaration shapes direct DTS cannot name.
