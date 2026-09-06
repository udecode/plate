# Preserve editor content and service requests

Objective:
Triage all ten reports in the intake batch and deliver the six accepted fixes in one verified PR.

Flow mode:
one-shot execution. No durable goal was requested; use this plan as the task ledger.

Goal plan:
docs/plans/2026-09-06-preserve-editor-content-and-service-requests.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)
- docs (docs/plans/templates/packs/docs.md)
- security-advisory (docs/plans/templates/packs/security-advisory.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request plus private repository reports
- id / link: private report identifiers and individual verdicts remain in the maintainer conversation
- title: Triage remaining reports; fix accepted work in one PR
- acceptance criteria: all ten dispositioned; six fixes; one PR containing the entire checkout; tests, artifact checks, browser proof and autoreview; no release or public advisory publication claimed
- exact PR: https://github.com/udecode/plate/pull/5120

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no time requirement
- initial confidence score: N/A: use pass/fail package checks
- improvement loop: focused tests, package artifacts, full check, review
- final score / loop closure: pnpm check, full www typecheck and final structured review pass

Completion threshold:
- All ten reports have a source-backed disposition. Six accepted fixes are implemented in one PR.
- The exact checkout is committed and pushed, including existing plan changes. No merge or release is requested.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-06-preserve-editor-content-and-service-requests.md` passes.

Verification surface:
- Focused Markdown round-trip and depset CLI tests; package typechecks and builds; built artifacts; a local Browser page using package output and real affected routes; pnpm check and full www typecheck; structured autoreview; gh PR and advisory readback.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: repository-scoped advisory API and discussions, installed source, integrity-verified npm tarballs, current package metadata.
- Allowed edit scope: packages/markdown, packages/math, packages/udecode/depset, registry renderers and API handlers, supporting docs, template generator inputs, pnpm-lock.yaml, three package changesets, registry changelog, this plan; include existing checkout plans as requested, with private details redacted before public delivery.
- Browser surface: local built Markdown fixture, /blocks/equation-demo, /blocks/media-demo, /docs/ai, /docs/copilot and /docs/media. depset and generated-template API handlers use executable tests; provider calls are mocked.
- Tracker sync: private safe dispositions. Keep accepted reports open until release; public PR describes behavior only.
- Non-goals: URL-policy redesign, legacy backports, merges, releases, exploit execution, public advisory publication, agent workflow changes.

Output budget strategy:
- Use exact owner paths; cap reads to a few thousand tokens; save private evidence outside the repository. No raw report payloads in public artifacts.

Blocked condition:
- Blocking check or review failure without a scoped fix; lost GitHub access. Merge/release remains a later owner and does not block the requested PR.

Task state:
- task_type: triage and package bug fixes
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: partially valid
- confidence: high from source and published artifact inspection
- next owner: maintainer merge and release follow-up; outside this PR task
- reason: six fixes, two duplicate reports, two reports without a demonstrated default boundary bypass

Pre-solution issue challenge:
- reporter claim: ten private reports; maintainer conversation contains exact findings
- suggested diagnosis or fix: keep text as text in Markdown serialization; pass dependency queries as process arguments
- repro ladder:
  - tests / source-level repro: harmless markup text yields a Markdown HTML node in the shipped artifact; shipped depset query audit confirms command-string construction; CLI regression will use only harmless literal data
  - Playwright / automated browser: N/A: no relevant existing application flow needed for these package contracts
  - Browser plugin: authenticated Chrome used to read all report discussions; local output fixture and actual demo/docs routes verified
  - screenshot / visual proof: benign rendering fixture and screenshot verified; no attack payload execution
- reproduction verdict: data-handling defects confirmed through shipped-source audit and harmless serializer execution
- validity verdict: six accepted owners, two duplicates, two no-boundary-bypass reports
- best long-term fix boundary: Markdown node classification and depset process invocation
- harsh honest feedback: report package attribution and claimed default exposure need narrowing; helper behavior alone is not a separate vulnerability
- hard-stop decision: no code changes for duplicate/invalid reports; patch accepted owners only

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-06-preserve-editor-content-and-service-requests.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no requested duration |
| Skill analysis before edits | yes | Required skills read; workflow and product scope separated |
| Active goal checked or created | no | N/A: no user request for a durable goal; developer tool contract permits plan-only execution |
| Source of truth read before edits | yes | All ten repository-scoped reports, source, integrity-verified npm tarballs |
| Tracker comments and attachments read | yes | Nine reports have zero comments; legacy report has five, all read through Chrome |
| Video transcript evidence required | no | N/A: no recordings |
| Pre-solution issue challenge required | yes | Recorded above |
| Reproduction verdict before implementation | yes | Shipped code audit and benign serializer proof |
| Repro escalation ladder selected | yes | Source/package tests, then benign Browser output and actual demo/docs routes; no exploit execution |
| Suggested fix reviewed against durable boundary | yes | Process arguments and Markdown serializer own the changes |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read prior argument-safe tooling solution; no reusable product implementation |
| TDD decision before behavior change or bug fix | yes | Behavior regression first with harmless input |
| Branch decision for code-changing task | yes | codex/preserve-query-and-link-data from main; entire checkout retained |
| Release artifact decision | yes | One patch changeset per affected package plus registry changelog |
| Browser tool decision for browser surface | yes | Connected Chrome via CUA |
| PR expectation decision | yes | User explicitly requested one PR; no merge/release |
| Dedicated task plan selected for exact PR | yes | This plan owns the single requested PR |
| Tracker sync expectation decision | yes | Private triage disposition; no public report details |
| Output budget strategy recorded | yes | Exact paths, capped output, private artifacts outside git |
| Security advisory pack selected | yes | Triage and private report safety |
| Advisory source read through correct authority or explicit access blocker | yes | gh api repos/udecode/plate/security-advisories; Chrome comments |
| Affected package, vulnerable range, and fixed-version target identified | yes | Latest markdown 53.3.3, math 53.0.0, depset 0.1.2, and deployable registry/template source at v53.3.11; actual release versions assigned by changesets later |
| Disclosure/release order recorded | yes | PR only; release before publication |
| Private/draft disclosure safety recorded | yes | Only benign tests and high-level behavior in public artifacts |
| CVE decision recorded | no | N/A: PR scope; release/publication follow-up owns requests |
| Package/API pack selected | yes | Three published package behavior fixes |
| Public surface or package boundary identified | yes | serializeMd, equations, depset CLI, image preview and copied service routes; preserve package signatures |
| Release artifact path selected | yes | Three .changeset files plus registry changelog |
| `changeset` skill loaded when `.changeset` is required | yes | Read .agents/rules/changeset.mdc |
| Barrel/export impact decision recorded | no | N/A: new math helpers are private; no public exports change |
| Agent-native pack selected | yes | CLI user-action tooling |
| Agent-facing action surface identified | yes | depset CLI options and logs |
| Source rule versus generated mirror boundary identified | no | N/A: no workflow rules or generated skills edited |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; parity review required before autoreview |

| `docs-creator` loaded | yes | Read .agents/rules/docs-creator.mdc |
| Docs lane selected | yes | Supporting plugin setup instructions, not a docs-only rewrite |
| Target docs and nearest sibling docs read | yes | AI, Copilot and Media setup pages with matching copied source |
| Docs style doctrine read | yes | Current-state reference prose; source-backed kit/manual snippets |
| Documented source owner identified | yes | Copied AI handlers, upload middleware, editor settings and plugin setup pages |
| Docs pack selected | yes | Supporting setup guidance under this task plan |
| Registry changelog pack selected | yes | Copied renderers and service handlers change |

| User-visible registry impact classified | yes | Six accepted fixes include copied renderer and service behavior |
| Source entry path selected | yes | apps/www/src/registry/changelog/entries/2026-09-06-editor-content-and-service-defaults.mdx |
| Generator command selected | yes | Source edit, --write and --check |

Work Checklist:
- [x] Skill analysis: security-triage, task, autogoal planning, changeset, tdd, agent-native-reviewer and autoreview. No workflow edits.
- [x] Explicit scope: triage all remaining reports, then fix accepted issues in a single PR using the entire checkout.
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL.
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
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Security advisory pack: advisory source, state, `cve_id` when available, credits/reporter when available, affected products, and current vulnerable ranges are recorded from the correct source authority or marked blocked by permissions.
- [x] Security advisory pack: public/global GHSA records are treated as read-only unless a repository security advisory owned by the current repo/org is located or created.
- [x] Security advisory pack: impact, root cause, reproduction, remediation, affected package, vulnerable range, and fixed version are recorded.
- [x] Security advisory pack: private, draft, embargoed, or not-yet-public reports avoid public PR/comment/release-note disclosure until the fixed version is available and disclosure is approved; any public pre-disclosure PR is sanitized or explicitly user-approved.
- [x] Security advisory pack: security regression proof is recorded, or N/A reason explains why proof is external/manual.
- [x] Security advisory pack: code fix, PR merge, release/version PR, npm/package publish, and GitHub release/tag are tracked when a published package is involved.
- [x] Security advisory pack: repository advisory vulnerability metadata is updated with package, vulnerable range excluding the fixed version, and patched version after the fixed version is published, or N/A reason is recorded for read-only public GHSA/non-GitHub sources.
- [x] Security advisory pack: repository advisory is published after the fixed version is available, or public GHSA/external/npm/private publication state or blocker is recorded.
- [x] Security advisory pack: CVE is requested when a repository advisory has empty `cve_id` and is eligible, unless the user explicitly declines or a blocker is recorded; public GHSA/non-GitHub sources record existing CVE, GitHub/global owner, external CNA/request owner, or N/A reason.
- [x] Security advisory pack: final readback records source, state, `published_at` when available, package, vulnerable range, patched version, CVE status, and propagation caveat or external-owner caveat.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. No actionable parity findings.

- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | pnpm check, full www typecheck, owning package artifacts, focused registry tests, Chrome routes and clean structured review pass |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Ten reports challenged; six accepted owners, two duplicates, two without a default boundary bypass |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Static/shipped audit, benign unit/process tests, and actual local Browser demo/docs routes; no active payload execution |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Harmless Markdown markup/punctuation and CLI literal-argument regressions failed before repair; other reports proved through source contracts without active payloads |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | 278 package cases plus 32 registry cases and built CLI passed; punctuation extension adds five passing Markdown cases |
| TypeScript or typed config changed | yes | Run relevant typecheck | Package graph, full www typecheck and final pnpm check pass, including the serializer change |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | pnpm brl: 52 tasks pass; internal helpers excluded from exports |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | pnpm install --no-frozen-lockfile passes; tinyexec 1.2.4 explicit dependency |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent workflow sources or generated skills changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands in /Users/zbeyens/git/plate; built entrypoints and local routes from that checkout |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Chrome local Markdown fixture, equation/media demo routes and three affected docs routes verified |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Desktop Browser AX and screenshots in task; no Windows, hosted API, provider spending, file upload or raw-device proof claimed |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: generated templates untouched; CI consumes tooling/templates inputs |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Patch changesets for @platejs/markdown, @platejs/math and depset; public signatures unchanged |
| User-visible registry output changed | yes | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | 2026-09-06-editor-content-and-service-defaults.mdx and generated JSON; generator --check passes |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | docs-creator and docs pack; current setup text and snippets in English/Chinese; content parser and Browser pass |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure modes, compatibility changes and owner boundaries recorded in Verification evidence and caveats |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Incremental parity review passes: existing CLI options, caller-key API and upload setup are discoverable and executable |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures were source/test issues, not install corruption |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Final gpt-5.5 local review: no accepted/actionable findings; patch correct |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | pnpm check passes; PR #5120 open with the verified checkout and task-style body |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | Exactly one task-plan body line; this tracked plan identifies https://github.com/udecode/plate/pull/5120; verify final pushed head before handoff |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | gh pr view 5120 --json body confirms required format, one plan line, no self-link and preserved auto-release block |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: PR uses textual browser evidence; screenshots remain in the maintainer task |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Six private comments link PR #5120; each comment and open state read back in Chrome; final API confirms six drafts and four closures |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Exact PR, dispositions, checks, Browser proof, setup changes and release/platform limits recorded below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | pnpm lint:fix passes; final pnpm check includes lint |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Bounded reads and logs outside checkout; initial oversized reads recorded and corrected |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-06-preserve-editor-content-and-service-requests.md` | check-complete.mjs passes on this completed task plan |
| Advisory source read | yes | Read repo advisories through `gh api repos/<owner>/<repo>/security-advisories/<GHSA_ID>`, public read-only GHSA records through `gh api advisories/<GHSA_ID>`, npm-only advisories through npm/advisory registry source, or private reports through the provided report source; otherwise record access blocker | Ten full repository-scoped reports plus all discussion comments read; canonical overlaps checked |
| Security repro / regression proof | yes | Record failing-before/passing-after proof, PoC validation, or N/A reason | Source/shipped audit and benign tests at owning boundaries; no active exploit or paid-service proof |
| Private disclosure guard | yes | For private/draft/embargoed/not-yet-public sources, use repository advisory/private fork or sanitized public artifacts until approved disclosure; otherwise record N/A: already public | New public plan and PR omit report IDs and payloads; six advisory descriptions narrowed privately |
| Patched version published | no | Verify npm/package publish and GitHub release/tag when a package release is part of the fix | N/A: user requested a PR; package/registry/template release is a subsequent owner |
| Advisory metadata updated | yes | For repository advisories, update affected product metadata with exact package, vulnerable range, and patched version; for public read-only GHSA/non-GitHub sources, record N/A with source owner/blocker | Six drafts have corrected package/registry attribution and ranges; patched_versions remain null until a release exists |
| Advisory published | no | Publish repository advisory after patched version availability, or record public GHSA/external/npm/private publication state or blocker | N/A: keep all six accepted reports private until release and publication approval |
| CVE request decision | no | Request CVE through repository advisory API when applicable, or record existing CVE, GitHub/global owner, external CNA/request owner, or N/A reason | N/A for this PR: no CVE requested; release/publication follow-up owns eligibility and request |
| Advisory final readback | yes | Read back repository advisory state, `published_at`, `cve_id`, vulnerabilities, and URL, or record equivalent public GHSA/external source readback | API confirms four closed and six draft; all unpublished, no new CVEs or patched versions |
| Propagation caveat | yes | Record GitHub review / Dependabot / advisory database propagation caveat, public GHSA/global owner, or external-source propagation owner in final handoff | PR does not publish npm packages, registry/templates, CVEs, advisories or hosted deployments |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | No public package signature or export changes; copied service defaults require caller credentials and application authorization |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Three published package fixes use patch changesets; copied code uses registry changelog |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | Three patch entries; no minor changesets or core/slate/platejs release declarations |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Source entry and generator output present; --check passes |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: three package changesets and registry changelog are required and present |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Owning graphs, full check after punctuation extension, full www typecheck, built math and CLI pass |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pnpm brl passes; no public barrel changes |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no agent rule sources changed |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | CLI --help, editor settings, API body and docs/template setup describe the actions |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | No actionable parity findings; deliberate production setup gate documented |

| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | /docs/ai, /docs/copilot, /docs/media and equation/media demo routes verified in Chrome |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | www typecheck includes build:source and docs parity, both pass |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Kit/manual instructions and credential/upload snippets match copied source; page hierarchy preserved |

| Registry changelog source | yes | Add/update `apps/www/src/registry/changelog/entries/*.mdx` or record N/A | apps/www/src/registry/changelog/entries/2026-09-06-editor-content-and-service-defaults.mdx |
| Registry changelog generation | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --write` when a source entry is required | --write generates event, index and component JSON |
| Registry changelog check | yes | Run `node tooling/scripts/generate-ui-changelog-entries.mjs --check` | --check validates 24 source events |
| Registry generator test | no | If generator/schema/source layout changed, run `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; otherwise N/A | N/A: generator, schema and source layout unchanged; --write/--check passed |
| Registry package release split | yes | Record `.changeset`, registry changelog, both, or N/A with reason | Both package changesets and registry changelog present; template output awaits CI |

| Docs source-backed claim audit | yes | Verify setup/API claims against source | Caller-key handlers, settings body and upload middleware match docs |
| Registry impact classification | yes | Record copied-code changes | Equation views, preview downloads, AI credentials, upload setup and two drag guards |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Ten reports read and dispositioned | implementation |
| Implementation | done | Six owners fixed; three package changesets and registry notes | verification |
| Verification | done | Full check, app typecheck, focused tests, built artifacts, Chrome proof and final review pass | closeout |
| PR / tracker sync | done | PR #5120 open; six private PR-link comments and advisory state readback verified | final response |
| Closeout | done | Required checks pass; task plan records exact PR; release limits retained | final response |

Findings:
- Ten reports dispositioned: six accepted owners, two duplicates, two without a demonstrated default boundary bypass. Four reports closed privately and read back as unpublished.
- Agent-native incremental review PASS: 3/3 CLI capabilities remain accessible through the same command: select package/scope/prefix, select latest/target version, apply changes with existing flags. CLI help, logs, cwd and install confirmation semantics are preserved; no new agent-only state or prompts.

Decisions and tradeoffs:
- Public signatures and normal bare-link output remain stable. Other link destinations use the existing Markdown link handler.
- Package queries use argument arrays and an explicit operand separator. tinyexec preserves Windows command discovery and escaping; nodePath:false preserves existing PATH lookup. Windows is source-reviewed, not run on this macOS host.
- Review baseline: user request for six-report triage plus two fixes in one PR; codex/preserve-query-and-link-data; Markdown serializer and depset query owners; original two-fix baseline superseded by four additional reports received during the same all-remaining intake. Final review covers six accepted owners and two one-line guards required by the full app typecheck. Full checkout included. No review scope expansion without a concrete in-scope blocker.

Implementation notes:
- Markdown: restrict literal-autolink serialization to destinations that retain their literal form.
- depset: invoke npm version lookup with structured process arguments and preserve nonzero-command failure handling.
- Three patch changesets and a registry changelog; no public exports change; registry changelog is generated from source.

Review fixes:
- Public-artifact review: inherited private media review plan sanitized and renamed; full original retained outside the public tree. Math changeset uses the CI-required double-quoted package key. Both findings are in-scope publication blockers; no runtime scope expansion.
- After two accepted patch cycles, remaining findings were reclassified: privacy and changeset CI only. Product scope remains frozen.
- First review finding rejected: tinyexec 1.2.4 explicitly exports exec in dist/main.mjs and dist/main.d.mts; built Node CLI passed. Accepted one Markdown punctuation finding; repaired the same serializer owner and added five benign round-trip cases. Final verification passes; structured review has no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Oversized initial report/source output | 2 | Exact file reads and bounded slices | Recovered |
| Guessed docs paths missing | 3 | rg --files discovered canonical content paths | Recovered |
| CLI process tests exceeded fast-suite budget | 1 | Use existing .slow.ts lane | Renamed; retained all five process tests |
| Lint overlapped barrel generation | 1 | Run lint after barrels finish | Subsequent lint passes |
| App typecheck required mutable test env and missing drag guards | 1 | Correct test env writes and add two source-node guards | Full www typecheck passes |

Verification evidence:
- Compatibility follow-up: 253 Markdown tests pass; an additional 90 URL/serializer-option round trips and 28 full equation HTML-import/normalization cases pass. Four actual npm queries return identical JSON with the previous and current argument layouts. The external compatibility probe remains outside the repository.
- Follow-up built-package Chrome proof at http://127.0.0.1:41239: three full contextual round trips with MDX enabled pass deep-equality assertions and display the preserved spaces, text and destinations. Screenshot captured in the task.
- Final follow-up review (gpt-5.5, local): no accepted/actionable findings. Full pnpm check passes after the parser correction; the newest push still requires its own hosted CI run.
- Follow-up compatibility review requested by the user: CI is green at 4a4a6052c9. Broader contextual round trips exposed a whitespace loss when angle-bracket HTTP links entered the incomplete-MDX fallback. The parser now skips complete HTTP autolinks while finding unmatched tags; 9 contextual serializer cases and 3 tag-stack cases cover the correction. The final pnpm check and structured local review pass after this correction. The built package preserves all three contextual cases in Chrome with MDX enabled.
- PR #5120 is OPEN against main. Initial code commit f91de4fa8d is pushed. Final plan-only closeout commit records exact ownership.
- All six accepted reports have private PR-link follow-ups with rendered comment and open-state readback; final repository API confirms four closed, six draft, all unpublished and no accepted patched-version claims.
- Final structured autoreview (gpt-5.5, local): clean, no accepted/actionable findings; patch correct.
- pnpm check passes after the punctuation repair. Subsequent edits only redact plan prose and correct equivalent changeset quoting.
- Final built Markdown fixture at http://127.0.0.1:41238/ preserves five links, including the final period in the destination; verified in Chrome.
- Review-requested punctuation cases: focused red, then 241 Markdown tests pass after requiring one unchanged GFM link token before emitting a bare literal.
- Built math entrypoint: four empty-value checks pass under Bun; raw Node import is not a supported CSS-loading harness because the package imports KaTeX CSS.
- Final built depset entrypoint: 5/5 process tests pass under Node after slow-lane rename.
- Final intake denominator: ten reports, including four received during initial verification. Four closed privately; six accepted as draft with narrowed descriptions and corrected package/registry attribution. All remain unpublished; accepted reports have no patched version or CVE yet.
- Additional shipped proof: integrity-verified @platejs/math 53.0.0; registry and template sources at the exact v53.3.11 release commit. Hosted registry JSON returned 403, so no hosted deployment claim is made.
- Additional fixes: equation import values stay strings; normalization and render/input fallbacks handle incomplete content; preview download checks allow supported image destinations; copied AI handlers require caller credentials; production upload middleware requires app-owned authorization.
- Full www typecheck uncovered two pre-existing optional dragEntry errors; two one-line guards close that gate. No DnD API change.
- bun test ./packages/udecode/depset/src/index.slow.ts packages/markdown/src packages/math/src: 278 pass, 0 fail, 434 assertions, 4 snapshots.
- Registry checks: 10 AI handler tests (mocked provider), 3 upload authorization tests, 11 preview download tests, 8 static/DOCX equation render tests pass.
- pnpm --filter www typecheck: pass, including docs parity, registry source, app TypeScript and package-integration graph.
- pnpm brl: 52 tasks pass, no public barrel changes; internal helpers remain private.
- bash -n tooling/scripts/update-template.sh and registry changelog --check: pass. Template README/env sources are copied by CI; generated templates not edited or locally regenerated.
- Browser: equation demo renders formulas, supports empty editing and recovery to x^2; media demo opens preview and exposes an enabled Download image action; /docs/ai, /docs/copilot and /docs/media show current setup instructions. Screenshots captured in the task. No paid AI call, upload, hostile browser payload or app deployment was performed.
- Docs lane: supporting plugin setup guidance, English and Chinese. Source owners are copied API handlers, settings request bodies and upload middleware.
- Agent-native incremental review: existing CLI actions remain accessible; caller-key APIs work identically for human UI and agents, and rejected credentials/setup return explicit failures. Updated docs and template inputs expose the setup contract.
- Cwd for all commands: /Users/zbeyens/git/plate.
- Red/green: harmless markup text originally produced an HTML node; whitespace-bearing dependency data originally split across arguments. Focused repaired tests pass.
- pnpm install --no-frozen-lockfile: pass; dependency lock includes tinyexec 1.2.4.
- pnpm turbo typecheck --filter=./packages/markdown --filter=./packages/udecode/depset: 14 successful tasks.
- bun test packages/markdown/src packages/udecode/depset/src: 253 pass, 0 fail, 419 assertions, 4 snapshots.
- pnpm --filter @platejs/markdown --filter depset build: both pass.
- DEPSET_TEST_ENTRY=<repo>/packages/udecode/depset/dist/index.js DEPSET_TEST_RUNTIME=node bun test packages/udecode/depset/src/index.slow.ts: 5 pass, 15 assertions.
- pnpm lint:fix: pass, 3291 files checked, one test formatted.
- Chrome at http://127.0.0.1:41237/: four benign built-package outputs rendered through marked, all display complete literal link text. Accessibility and screenshot captured; fixture source/output outside git. This is package-output proof, not an application route or Windows proof.
- High-risk mini gate: failure could change literal text or command argument boundaries. Tests cover normal links, resourceLink, harmless escaping, package scope/prefix/exact matching and target versions. Existing serializer and process invocation boundaries own the fixes.
- Package release and public advisory publication remain outside this PR task; accepted reports stay open.
- Windows command behavior is source-reviewed through tinyexec; execution proof is macOS/Node only.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5120
- Issue / tracker line: ten private repository reports; four closed, six draft, none published
- Confidence line: high for verified local behavior; explicit release and platform limits below
- Flow table:
  - Reproduced: benign data-handling regressions and shipped-source audit; no active exploit execution
  - Verified: focused package/registry tests, full app typecheck, built CLI/math and local Chrome routes; final structured review and pnpm check pass
- Browser check: local desktop Chrome fixture, equation/media routes and affected docs; API tests mock providers
- Outcome: ten reports dispositioned; six fixes committed and pushed in PR #5120, four reports closed privately
- Caveat: AI routes require caller keys; production uploads require app authorization; registry/template refresh, package releases, public advisories and CVEs remain a later task; Windows not executed
- Design:
  - Chosen boundary: package serialization/query/math owners and copied renderer/service handlers
  - Why not quick patch: input-only changes would miss persisted values and action-time handling
  - Why not broader change: no generic auth framework, core schema redesign, URL rewrite policy, legacy backport or release process change
- Verified: see named command and Browser evidence above; final review/check status is recorded in completion gates
- PR body verified: gh pr view 5120 --json body; exactly one task-plan line, required format, no self-link, generated auto-release block preserved

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  exactly one `🧭 Task plan: docs/plans/<plan>.md` line, then an emoji
  confidence line like `🟢 95-100% confidence`. The plan must exist at the
  exact PR head and identify that exact PR.
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
- PR: https://github.com/udecode/plate/pull/5120 (OPEN, base main, branch codex/preserve-query-and-link-data)
- Task plan at exact PR head: this tracked plan identifies PR #5120; final pushed-head readback is required before handoff
- Issue / tracker: six private draft metadata updates, six PR-link comments and four private closures verified; all ten remain unpublished
- Browser proof: local desktop Chrome observations and screenshots recorded in this task
- Caveats: releases/hosted propagation and Windows execution are unclaimed; production service setup changes documented

Timeline:
- 2026-09-06T14:19:04.559Z Task goal plan created.
- 2026-09-06 PR #5120 created after verification and clean review; six private tracker follow-ups verified.
- 2026-09-06 User requested a regression recheck; contextual Markdown whitespace correction verified and added to the same PR.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | PR #5120 delivered; private tracker sync complete |
| Where am I going? | Final handoff; merge and release are separate scope |
| What is the goal? | All ten triaged; six fixes in one verified PR |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Package release and public advisory publication remain outside this PR task; accepted reports stay open.
- Windows command behavior is source-reviewed through tinyexec; execution proof is macOS/Node only.
