# triage GHSA 4q39 docx io

Objective:
Triage GHSA-4q39 for @platejs/docx-io; done when source readback, shipped-state evidence, verdict, and public-safe advisory redraft are recorded.

Goal plan:
docs/plans/2026-07-03-triage-ghsa-4q39-docx-io.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- security-advisory (docs/plans/templates/packs/security-advisory.md)

Task source:
- type: GitHub repository security advisory
- id / link: GHSA-4q39-2jhr-7qx8 / https://github.com/udecode/plate/security/advisories/GHSA-4q39-2jhr-7qx8
- title: SSRF with Response Disclosure in DOCX Image Embedding
- acceptance criteria: inspect repo-scoped advisory and SECURITY.md, verify affected package/range and shipped state, inspect owning code path without public exploit disclosure, decide fix/keep-open/publish readiness, and produce public-safe advisory wording.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: concrete checklist threshold
- improvement loop: N/A: no timed checkpoint requested
- final score / loop closure: N/A: no timed checkpoint requested

Completion threshold:
- Done when the advisory source and SECURITY.md are read, @platejs/docx-io affected range and shipped/latest package state are recorded, the implicated package code boundary is inspected, the maintainer verdict is recorded, a public-safe advisory redraft is included or existing wording is declared safe, security/release next actions are named, and the goal plan checker passes.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-triage-ghsa-4q39-docx-io.md` passes.

Verification surface:
- `gh api repos/udecode/plate/security-advisories/GHSA-4q39-2jhr-7qx8` readback.
- `SECURITY.md` source audit when present.
- focused source audit of @platejs/docx-io code and package metadata.
- shipped-state audit through npm/package metadata plus repo tags/releases as useful.
- final public wording hygiene review that strips exploit-enabling detail.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not echo private exploit details, payloads, reproduction steps, bypass variants, or patch mechanics in public-facing output.

Boundaries:
- Source of truth: repo-scoped GitHub security advisory, local Plate source, SECURITY.md, npm package metadata, tags/releases where relevant.
- Allowed edit scope: this goal plan and, only if required, minimal source/advisory-support files; no PR/comment/publish without explicit need.
- Browser surface: N/A unless code changes affect a runnable UI route; advisory triage is package/server-side.
- Tracker sync: N/A unless final evidence says an advisory update/comment is needed and safe.
- Non-goals: no public exploit walkthrough, no broad repo refactor, no release/publish unless required by verified shipped-state gap.

Output budget strategy:
- Use focused `sed`, `rg --files`, `rg -n` with explicit package/security terms, and capped `gh api --jq` summaries. Avoid streaming full private advisory bodies or broad repo search output; store or summarize sensitive detail privately in the plan at high level only.

Blocked condition:
- Blocked only if repo-scoped advisory access is denied and no public/global source plus local code/package state can support a safe verdict.

Task state:
- task_type: security advisory triage
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready for completion

Current verdict:
- verdict: fix now; local patch prepared and draft advisory redrafted
- confidence: high
- next owner: maintainer release lane
- reason: latest npm `@platejs/docx-io` is still 53.1.0 and advisory remains unpublished with no patched version metadata until release

Pre-solution issue challenge:
- reporter claim: advisory reports SSRF with response disclosure in DOCX image embedding for @platejs/docx-io.
- suggested diagnosis or fix: valid; safest durable boundary is to disable remote image fetching by default and require explicit trusted opt-in or trusted data URIs.
- repro ladder:
  - tests / source-level repro: source audit confirmed remote image fetch path; regression test added for no default fetch.
  - Playwright / automated browser: N/A unless a browser route owns the behavior.
  - Browser plugin: N/A unless a browser route owns the behavior.
  - screenshot / visual proof: N/A unless visual/browser state matters.
- reproduction verdict: valid by source audit plus regression guard; no public PoC repeated.
- validity verdict: valid shipped package vulnerability.
- best long-term fix boundary: package default behavior in @platejs/docx-io DOCX export.
- harsh honest feedback: IP blocklists would be weaker here; arbitrary remote fetch in a document converter is the bug.
- hard-stop decision: proceed with local fix and safe advisory redraft; stop before PR/release because user did not authorize git/PR/publish.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-triage-ghsa-4q39-docx-io.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no timed checkpoint requested |
| Skill analysis before edits | yes | Read `autogoal` and `security-triage` skills before advisory/source work |
| Active goal checked or created | yes | `get_goal` returned no active goal before plan creation; `create_goal` created the active goal after plan contract was filled |
| Source of truth read before edits | yes | `gh api repos/udecode/plate/security-advisories/GHSA-4q39-2jhr-7qx8`; local package source; npm package metadata |
| Tracker comments and attachments read | no | N/A: no external tracker thread named beyond GitHub advisory |
| Video transcript evidence required | no | N/A: advisory has no video/screen-recording evidence requirement |
| Pre-solution issue challenge required | yes | Validity challenged against source and shipped package state before code patch |
| Reproduction verdict before implementation | yes | Source-level verdict: valid remote fetch path in shipped @platejs/docx-io |
| Repro escalation ladder selected | yes | Source audit plus focused package regression; browser N/A for package/server-side converter |
| Suggested fix reviewed against durable boundary | yes | Disable remote fetch by default at package boundary; data URI images continue |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: security advisory source and package code are the authority; no implementation yet |
| TDD decision before behavior change or bug fix | yes | Added focused regression in `render-document-file.spec.ts` |
| Branch decision for code-changing task | no | N/A: no code change planned at intake |
| Release artifact decision | yes | package changeset added: `.changeset/fix-docx-remote-images.md` |
| Browser tool decision for browser surface | no | N/A: @platejs/docx-io advisory triage has no browser surface unless source audit proves otherwise |
| PR expectation decision | no | N/A: user asked for triage/go, not PR creation |
| Tracker sync expectation decision | no | N/A: no safe public tracker sync requested |
| Output budget strategy recorded | yes | Focused/capped reads and summaries; avoid streaming exploit details |
| Package/API pack selected | yes | package-api pack applied because affected package is published npm package @platejs/docx-io |
| Public surface or package boundary identified | yes | Published package boundary: @platejs/docx-io |
| Release artifact path selected | yes | `.changeset/fix-docx-remote-images.md` |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/rules/changeset.mdc` and `.agents/skills/changeset/SKILL.md` |
| Barrel/export impact decision recorded | no | N/A: no exported file layout/barrel change |
| Security advisory pack selected | yes | security-advisory pack applied for GHSA triage |
| Advisory source read through correct authority or explicit access blocker | yes | Repo-scoped advisory endpoint read; state `triage`, `published_at: null` |
| Affected package, vulnerable range, and fixed-version target identified | yes | `@platejs/docx-io <= 53.1.0`; patched version waits for next release containing local fix |
| Disclosure/release order recorded | yes | Keep advisory unpublished until patched package is available, then update metadata and publish |
| Private/draft disclosure safety recorded | yes | Draft body redrafted to public-safe text; readback found no PoC/payload/code-location terms |
| CVE decision recorded | yes | `cve_id: null`; request CVE during publication/release closeout, not before patched package exists |

Work Checklist:
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Advisory readback, source audit, local patch, tests, typecheck, build, lint, and draft advisory redaction readback complete |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Valid shipped vulnerability; durable fix is package default behavior, not IP blocklist |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Source-level audit plus focused package regression; Browser N/A because package/server-side converter |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Source audit found default remote fetch path; public PoC intentionally not repeated |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter @platejs/docx-io test -- src/lib/internal/helpers/render-document-file.spec.ts` via Corepack PATH passed, 93 tests |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/docx-io` via Corepack PATH passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export file layout or barrel change |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `corepack pnpm install` passed after PATH pnpm 11.7 mismatch was identified; no intentional lockfile edit |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: this turn did not edit repo agent rules or skills |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All verification ran in `/Users/zbeyens/git/plate`; package owner `packages/docx-io` |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no `content/**`, `apps/www/**`, or runnable UI route changed |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: package/server-side behavior only |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` edit |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/fix-docx-remote-images.md` added for @platejs/docx-io patch |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry output change |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: only goal plan and changeset documentation |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: server-side remote fetch from untrusted HTML; proof: no-default-fetch regression, typecheck, build |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling change this turn |
| Local install corruption suspected | yes | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | Wrong PATH pnpm 11.7 caused non-TTY/policy failures; Corepack pnpm 9.15 install and checks passed |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: focused security hotfix with local source/test/typecheck/build/lint proof; no PR requested |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not authorize PR/commit/push |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR created |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: advisory draft itself updated; no tracker issue named |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff section filled |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm --filter @platejs/docx-io lint:fix` via Corepack PATH passed, no fixes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One `rg` included a missing README path error and broad matches; recovered with focused reads and capped output |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no timed checkpoint requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-triage-ghsa-4q39-docx-io.md` | To run after this update |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `DocumentOptions.allowRemoteImages` added; default false; no export layout change |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime/type behavior change |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.changeset/fix-docx-remote-images.md` is one patch changeset for @platejs/docx-io |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: not registry-only |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changeset required and added |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Test, typecheck, build passed for @platejs/docx-io |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported file layout changed |
| Advisory source read | yes | Read repo advisories through `gh api repos/<owner>/<repo>/security-advisories/<GHSA_ID>`, public read-only GHSA records through `gh api advisories/<GHSA_ID>`, npm-only advisories through npm/advisory registry source, or private reports through the provided report source; otherwise record access blocker | Repo advisory endpoint read and final readback complete |
| Security repro / regression proof | yes | Record failing-before/passing-after proof, PoC validation, or N/A reason | Regression test proves no default fetch; public PoC not repeated |
| Private disclosure guard | yes | For private/draft/embargoed/not-yet-public sources, use repository advisory/private fork or sanitized public artifacts until approved disclosure; otherwise record N/A: already public | Advisory is `triage`, `published_at: null`; draft body sanitized and still unpublished |
| Patched version published | no | Verify npm/package publish and GitHub release/tag when a package release is part of the fix | Not published; npm latest remains 53.1.0. Next owner must release package before publishing advisory |
| Advisory metadata updated | partial | For repository advisories, update affected product metadata with exact package, vulnerable range, and patched version; for public read-only GHSA/non-GitHub sources, record N/A with source owner/blocker | Description updated; package/range already `@platejs/docx-io <=53.1.0`; patched version remains null until release |
| Advisory published | no | Publish repository advisory after patched version availability, or record public GHSA/external/npm/private publication state or blocker | Not published; correct because patched package is not available |
| CVE request decision | yes | Request CVE through repository advisory API when applicable, or record existing CVE, GitHub/global owner, external CNA/request owner, or N/A reason | `cve_id: null`; request during publication closeout after patched package exists |
| Advisory final readback | yes | Read back repository advisory state, `published_at`, `cve_id`, vulnerabilities, and URL, or record equivalent public GHSA/external source readback | Readback: state triage, unpublished, cve null, high, CWE-918, CVSS 8.2, range <=53.1.0 |
| Propagation caveat | yes | Record GitHub review / Dependabot / advisory database propagation caveat, public GHSA/global owner, or external-source propagation owner in final handoff | After release, update patched version and request CVE before publication; GitHub/Dependabot propagation follows publication |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Advisory/SECURITY/npm/source reads complete | implementation |
| Implementation | complete | Local package fix, regression test, changeset, and advisory redraft complete | verification |
| Verification | complete | install, test, typecheck, build, lint, advisory readback passed | closeout |
| PR / tracker sync | N/A | No PR requested; advisory draft updated directly and not published | final response |
| Closeout | complete | goal checker row closed; checker command rerun next | final response |

Findings:
- No `SECURITY.md` is present in the repo root.
- Repo advisory `GHSA-4q39-2jhr-7qx8` is private/unpublished (`state: triage`, `published_at: null`), severity high, CWE-918, CVSS 8.2, reporter EQSTLab.
- Advisory metadata names `@platejs/docx-io <=53.1.0`; npm latest for `@platejs/docx-io` is 53.1.0, so users do not yet have a patched package.
- Local source fetched remote image URLs by default during DOCX export. The fix disables remote image fetching by default and preserves trusted data URI image support.
- Draft advisory body was redrafted to public-safe sections: Summary, Impact, Patched versions, Workarounds, Credits. Readback checks found no PoC, payload, code-location, or Dockerfile terms.

Decisions and tradeoffs:
- Disable remote image fetching by default instead of trying to denylist private IP ranges. The former removes the unsafe default; the latter is brittle.
- Keep `allowRemoteImages: true` as an explicit opt-in for trusted HTML only. This preserves an escape hatch without keeping unsafe behavior as the default.
- Do not publish the advisory yet because no patched package is available.

Implementation notes:
- Added `allowRemoteImages?: boolean` to `DocumentOptions` and internal document state, defaulting to false.
- Guarded remote image fetch paths in `render-document-file.ts` and `xml-builder.ts`.
- Added a regression test proving remote image URLs do not call `fetch` or media embedding by default.
- Added a sanitized @platejs/docx-io patch changeset.

Review fixes:
- Fixed initial patch footgun where a blocked remote URL could fall through as if it were data; remote URLs now embed only when explicitly allowed.
- Fixed test mock typing after TypeScript reported Bun's `fetch` type shape.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter @platejs/docx-io test` used PATH pnpm 11.7 and hit non-TTY/policy install failure | 2 | Use Corepack pnpm 9.15 and force shim first in PATH for nested scripts | `corepack pnpm install` passed; checks rerun with Corepack PATH |
| First broad `rg` included missing `packages/docx-io/README.md` path and noisy registry matches | 1 | Focus reads to package source and advisory fields | Recovered with capped source reads |

Verification evidence:
- `corepack pnpm install` passed in `/Users/zbeyens/git/plate`.
- `pnpm --filter @platejs/docx-io test -- src/lib/internal/helpers/render-document-file.spec.ts` via Corepack PATH passed: 93 tests, including no-default-fetch regression.
- `pnpm turbo typecheck --filter=./packages/docx-io` via Corepack PATH passed.
- `pnpm --filter @platejs/docx-io build` via Corepack PATH passed.
- `pnpm --filter @platejs/docx-io lint:fix` via Corepack PATH passed with no fixes.
- Advisory readback: state triage, unpublished, cve null, range `<=53.1.0`, description length 1288, unsafe term checks false.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: Draft GHSA updated directly; no separate issue/tracker named.
- Confidence line: High confidence.
- Flow table:
  - Reproduced: source audit yes, browser N/A.
  - Verified: package tests/typecheck/build/lint yes, browser N/A.
- Browser check: N/A: package/server-side DOCX converter; no route/UI changed.
- Outcome: valid advisory; local fix prepared; draft advisory sanitized and still unpublished.
- Caveat: patched package is not published yet, advisory patched version metadata is still null, and CVE request is deferred to publication closeout.
- Design:
  - Chosen boundary: @platejs/docx-io remote image fetch default.
  - Why not quick patch: host/IP filtering is weaker than disabling arbitrary fetch by default.
  - Why not broader change: no need to refactor DOCX conversion beyond the unsafe network boundary.
- Verified: install, tests, typecheck, build, lint, advisory readback.
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
- PR: N/A: no PR requested or created.
- Issue / tracker: GHSA draft body updated; no public comment posted.
- Browser proof: N/A: no browser surface.
- Caveats: release next, then advisory patched metadata/CVE/publication.

Timeline:
- 2026-07-03T14:24:55.535Z Task goal plan created.
- 2026-07-03T14:33:55Z GHSA draft advisory description patched to public-safe text; advisory remained unpublished.
- 2026-07-03 Local @platejs/docx-io fix, regression test, and changeset added.
- 2026-07-03 Verification passed: install, package test, package typecheck, package build, package lint.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run goal checker and final response |
| What is the goal? | Triage GHSA-4q39, fix local package boundary, sanitize advisory draft, record next release actions |
| What have I learned? | Latest npm package is still vulnerable; advisory is unpublished and sanitized; patched package/release remains next |
| What have I done? | Local fix, regression, changeset, advisory redraft, verification |

Open risks:
- Patched package is not published; advisory must not be published until release exists.
- Advisory `patched_versions` is still null; update after release.
- `cve_id` is null; request CVE during publication closeout.
