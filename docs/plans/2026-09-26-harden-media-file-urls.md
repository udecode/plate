# Harden media file URLs

Objective:
Harden copied media file links; done when unsafe schemes lose href, allowed URLs persist, checks and review pass, and PR opens; plan docs/plans/2026-09-26-harden-media-file-urls.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-26-harden-media-file-urls.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)
- security-advisory (docs/plans/templates/packs/security-advisory.md)

Task source:
- type: closed private GitHub repository security advisory plus maintainer hardening request
- id / link: private report identifier omitted from this public task plan
- title: Harden copied media file links after a rejected security report
- acceptance criteria: copied live and static file renderers omit `href` for unsafe schemes, preserve HTTP(S), blob, and relative file URLs, add behavior coverage, update the registry changelog, verify the media demo, and open a reviewed PR.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary acceptance criteria
- improvement loop: red-green test, focused checks, browser proof, autoreview
- final score / loop closure: completion gates and clean review

Completion threshold:
- Both registry renderers suppress unsafe URL schemes while retaining supported file URLs; focused tests, www typecheck, lint, registry changelog checks, browser proof, and autoreview pass; a task-style PR is open.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-26-harden-media-file-urls.md` passes.

Verification surface:
- `bun test apps/www/src/registry/ui/media-file-node.spec.tsx`
- `pnpm --filter www typecheck`
- `pnpm lint:fix`
- registry changelog `--write` and `--check`
- Browser proof at `/blocks/media-demo` that the valid PDF link retains its URL and download name
- `.agents/skills/autoreview/scripts/autoreview --mode local`
- GitHub PR body and exact-head task-plan readback

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Preserve valid HTTP(S), blob, and relative file downloads.
- Keep the fix in copied registry UI; do not change `@platejs/media` semantics or publish a package advisory.
- Keep public branch, commit, tests, changelog, and PR wording disclosure-safe and omit the closed advisory identifier.

Boundaries:
- Source of truth: maintainer request following a closed private report and the current registry component behavior.
- Allowed edit scope: `media-file-node` live/static renderers and specs, registry changelog source/generated output, this plan, and PR metadata.
- Browser surface: `apps/www` route `/blocks/media-demo`.
- Tracker sync: advisory stays closed; existing closure comment already promises possible ordinary hardening, so no additional advisory comment is required.
- Non-goals: math API changes, package API changes, React 18 compatibility, publishing an advisory, CVE request, npm release, and broader media URL policy.

Output budget strategy:
- Use exact-file reads, focused `rg` with `head`, and capped command output; exclude generated/build/dependency trees except named changelog artifacts.

Blocked condition:
- Stop only if the focused component test cannot exercise both renderers, the required app route cannot start after one install-corruption reset, GitHub access prevents PR creation, or the URL policy needs a broader product decision.

Task state:
- task_type: registry UI hardening
- task_complexity: normal
- current_phase: PR / tracker sync
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: partially valid
- confidence: high
- next owner: task
- reason: raw unsafe URL emission is real, while the claimed app-origin XSS did not reproduce; low-risk scheme validation is still worthwhile.

Pre-solution issue challenge:
- reporter claim: document-controlled executable URL schemes create an unsafe file-link navigation path.
- suggested diagnosis or fix: sanitize the copied live/static file link with an allowlist.
- repro ladder:
  - tests / source-level repro: current component renders the raw URL; add a failing component test before implementation.
  - Playwright / automated browser: N/A: existing component spec can observe `href`; browser route is reserved for valid-link regression proof.
  - Browser plugin: prior exact-anchor Chrome and Safari proof did not execute the payload; post-fix media demo will verify preserved valid-link behavior.
  - screenshot / visual proof: N/A: attribute behavior is non-visual; exact route and DOM attribute readback are stronger evidence.
- reproduction verdict: raw attribute reproduced; claimed app-origin execution not reproduced.
- validity verdict: partially valid.
- best long-term fix boundary: local copied registry renderers, using the existing shared URL sanitizer with an explicit file scheme allowlist.
- harsh honest feedback: the report overstated the impact and targeted a package that does not ship the copied component, but identified a real hardening gap.
- hard-stop decision: proceed only with ordinary registry hardening; do not publish or change package metadata.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-26-harden-media-file-urls.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `task`, `autogoal`, `tdd`, `plate-ui`, `shadcn`, `registry-changelog`, and `autoreview` read |
| Active goal checked or created | yes | no prior goal; goal created for this plan |
| Source of truth read before edits | yes | private repo advisory fetched with `gh api`; relevant source and shipped registry behavior inspected; identifier omitted from this public plan |
| Tracker comments and attachments read | yes | no attachments; maintainer closure comment and advisory state reviewed |
| Video transcript evidence required | no | N/A: no video |
| Pre-solution issue challenge required | yes | recorded above as partially valid |
| Reproduction verdict before implementation | yes | raw href reproduced; claimed XSS rejected by prior Chrome/Safari activation proof |
| Repro escalation ladder selected | yes | component test first, browser valid-link regression proof after fix |
| Suggested fix reviewed against durable boundary | yes | sanitizer stays in copied live/static UI; package remains unchanged |
| `docs/solutions` checked for non-trivial existing-code work | yes | focused search found no matching solution |
| TDD decision before behavior change or bug fix | yes | add one failing unsafe-scheme behavior test before implementation |
| Branch decision for code-changing task | yes | created `codex/harden-media-file-urls` from current `origin/main` before code edits |
| Release artifact decision | yes | registry changelog required; package changeset N/A |
| Browser tool decision for browser surface | yes | approved Browser tool on `/blocks/media-demo` after focused checks |
| PR expectation decision | yes | `task` requires commit, push, and PR after checks |
| Dedicated task plan selected for exact PR | yes | this plan owns exactly one PR; PR number recorded after creation |
| Tracker sync expectation decision | yes | no further advisory comment; existing comment already records hardening intent |
| Output budget strategy recorded | yes | exact reads and capped searches recorded above |
| Browser pack selected | yes | applied browser pack |
| Browser route / app surface identified | yes | `apps/www` `/blocks/media-demo` |
| Browser tool decision recorded | yes | Browser tool after dev server starts |
| Console/network caveat policy recorded | yes | inspect console errors; unrelated external PDF/network failures are caveated |
| Registry changelog pack selected | yes | applied registry-changelog pack |
| User-visible registry impact classified | yes | unsafe file links lose click targets; valid downloads remain |
| Source entry path selected | yes | `apps/www/src/registry/changelog/entries/2026-09-27-harden-media-file-urls.mdx` |
| Generator command selected | yes | scaffold with `--new`, then `--write` and `--check` |
| Security advisory pack selected | yes | applied security-advisory pack for closed-report provenance |
| Advisory source read through correct authority or explicit access blocker | yes | repository security-advisory API; private identifier omitted from this public plan |
| Affected package, vulnerable range, and fixed-version target identified | no | N/A: invalid report; component is copied registry UI and advisory package/range metadata is malformed |
| Disclosure/release order recorded | no | N/A: closed without publication; sanitized ordinary hardening PR has no package release dependency |
| Private/draft disclosure safety recorded | yes | closed private report; public artifacts omit GHSA id and exploit narrative |
| CVE decision recorded | no | N/A: invalid closed advisory with no eligible vulnerability |

Work Checklist:
- [x] No duration was requested; objective, outcome, thresholds, constraints, boundaries, and blocker are concrete.
- [x] The task source, acceptance criteria, affected files, package boundary, route, and root-cause layer are recorded without exposing the private report identifier.
- [x] Video evidence is N/A because the report contained no video.
- [x] The report was challenged before implementation and classified partially valid: raw URL emission reproduced, while the reported execution impact did not.
- [x] The repro ladder used a failing focused component test first and the approved Browser tool for the preserved valid-link path; visual proof of a non-visual unsafe attribute is delegated to the exact test.
- [x] The partial-validity pivot and durable copied-renderer boundary are recorded.
- [x] Repo instructions, nearby implementation, sanitizer behavior, tests, changelog rules, and shadcn project context were read before edits.
- [x] Live and static copied renderers enforce the same policy; the media package remains unchanged.
- [x] Registry changelog applies; package changeset is N/A because no package source or public API changed.
- [x] Dedicated branch `codex/harden-media-file-urls`, one task invocation, one plan, and one PR ownership are recorded.
- [x] Local environment reset is N/A because no install-corruption signal occurred.
- [x] Verification commands ran from `/Users/zbeyens/git/plate`; Browser proof ran against the `apps/www` dev server.
- [x] The high-risk failure mode, proof plan, and ownership boundary are recorded.
- [x] Local autoreview ran against the actual dirty diff and returned no findings.
- [x] Agent-native review is N/A because no agent rules, skills, hooks, prompts, or commands changed.
- [x] Output stayed bounded through exact-file reads, scoped searches, and capped command output.
- [x] Browser route, expected PDF row, approved tool, HTTP 200 result, and exact unsafe-attribute caveat are recorded.
- [x] Registry impact, valid source entry, real `media-file-node` id, generator-produced JSON, and successful generator check are recorded.
- [x] Private-report handling is disclosure-safe: the public branch, plan, changelog, commit, tests, and PR omit its identifier and exploit narrative.
- [x] Security regression proof records failing-before and passing-after component behavior; package release, advisory publication/metadata, and CVE work are N/A for a rejected, closed report.
- [x] Final private-source readback records closed, unpublished, no CVE, rejected submission, malformed package/range metadata, and no patched version; exact private fields stay outside public artifacts.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named checks and proof | Focused tests, www typecheck, lint, changelog check, Browser route, autoreview, and `pnpm check` passed |
| Pre-solution issue challenge verdict | yes | Record claim, repro, validity, boundary, and pivot | Recorded as partially valid before implementation; ordinary copied-renderer hardening selected |
| Repro escalation ladder | yes | Record focused and Browser outcomes | Failing component test reproduced raw href; approved Browser tool proved the valid demo path; screenshot is unnecessary for an attribute assertion |
| Bug reproduced before fix | yes | Record failing proof | Unsafe live URL test failed before the sanitizer because React retained a blocked JavaScript URL string |
| Targeted behavior verification | yes | Run focused proof | `bun test apps/www/src/registry/ui/media-file-node.spec.tsx` passed 6 tests and 7 assertions |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed |
| Package exports or file layout changed | no | Run `pnpm brl` when applicable | N/A: no package export or exported file layout changed |
| Package manifests, lockfile, or install graph changed | no | Run install checks when applicable | N/A: no manifest, lockfile, or dependency graph changed |
| Agent rules or skills changed | no | Run sync when applicable | N/A: no agent files changed |
| Workspace authority proof | yes | Run proof in owning surfaces | Commands ran from `/Users/zbeyens/git/plate`; Browser proof used the live `apps/www` route |
| Browser surface changed | yes | Capture approved Browser proof | `/blocks/media-demo` returned 200 and rendered `sample.pdf` with the editor content |
| Browser final proof | yes | Record artifact or exact caveat | Route and visible file row were inspected; unsafe href suppression is an exact component assertion because the demo has no unsafe fixture |
| CI-controlled template output changed | no | Restore when applicable | N/A: `templates/**` is untouched |
| Package behavior or public API changed | no | Add changeset when applicable | N/A: copied registry UI changed; no package source or API changed |
| User-visible registry output changed | yes | Add source entry and regenerate | Source entry added; `--write` and `--check` completed with 25 events |
| Docs or content changed | no | Apply docs workflow when applicable | N/A: only the required task plan changed under `docs/plans`; no product docs/content changed |
| High-risk mini gate | yes | Record failure mode, proof, and boundary | Blob/relative-link regression risk, focused proof, and copied-anchor ownership are recorded |
| Agent-native review for agent/tooling changes | no | Review when applicable | N/A: no agent/tooling files changed |
| Local install corruption suspected | no | Reinstall once when applicable | N/A: no corruption signal occurred |
| Autoreview for non-trivial implementation changes | yes | Run local autoreview to clean | Local autoreview returned no findings and judged the patch correct |
| PR create or update | yes | Run `check` and create task-style PR | `pnpm check` passed; first commit and PR creation are the next closeout action |
| Per-PR task ownership | yes | Verify one plan line and exact head | This dedicated plan owns one PR; exact PR readback follows creation |
| Task-style PR body verified | yes | Read back body after creation | Task-style body prepared; GitHub readback follows creation |
| PR proof image hosting | no | Host images when needed | N/A: PR body needs no screenshot; exact route and component-test evidence suffice |
| Tracker sync-back | no | Sync when applicable | N/A: the private report is closed and already has the required closure comment |
| Final handoff contract | yes | Fill after PR creation | Evidence fields are prepared and will receive the exact PR URL after creation |
| Final lint | yes | Run `pnpm lint:fix` | Final rerun passed with no fixes |
| Output budget discipline | yes | Keep output bounded | Exact-file reads, scoped searches, and capped outputs were used |
| Timed checkpoint | no | Honor duration when requested | N/A: no duration requested |
| Goal plan complete | yes | Run completion checker after PR sync | Checker will run against the exact PR-head plan |
| Browser interaction proof | yes | Exercise target route | Approved Browser tool rendered `/blocks/media-demo` and its valid PDF row |
| Browser console/network check | yes | Record state or limitation | Server showed a clean 200 with no route error; exposed Browser API lacked direct console/network inspection |
| Browser final proof artifact | yes | Record proof or caveat | Visible route proof recorded; non-visual unsafe attribute is covered by focused tests |
| Registry impact classification | yes | Record delta | Unsupported schemes lose the click target; HTTP(S), blob, and relative URLs remain supported |
| Registry changelog source | yes | Add source entry | `entries/2026-09-27-harden-media-file-urls.mdx` added with valid frontmatter and item id |
| Registry changelog generation | yes | Run generator write | `node tooling/scripts/generate-ui-changelog-entries.mjs --write` completed |
| Registry changelog check | yes | Run generator check | `node tooling/scripts/generate-ui-changelog-entries.mjs --check` passed with 25 events |
| Registry generator test | no | Test generator only when changed | N/A: generator, schema, and source layout are unchanged |
| Registry package release split | yes | Record artifact choice | Registry changelog only; package changeset N/A |
| Advisory source read | yes | Read correct repository authority | Private repository advisory read through `gh api`; identifier stays outside public artifacts |
| Security repro / regression proof | yes | Record before/after proof | Focused unsafe-URL test failed before the fix and all 6 cases pass after it |
| Private disclosure guard | yes | Sanitize public artifacts | Public branch, plan, changelog, tests, commit, and PR omit the private identifier and exploit narrative |
| Patched version published | no | Verify release when applicable | N/A: rejected closed report, copied registry component, and no package release |
| Advisory metadata updated | no | Update metadata when applicable | N/A: report stays rejected and closed; its package/range metadata is invalid |
| Advisory published | no | Publish when applicable | N/A: report remains closed and unpublished |
| CVE request decision | no | Request when eligible | N/A: rejected report is not CVE-eligible |
| Advisory final readback | yes | Read final private state | Readback: closed, unpublished, no CVE, submission rejected, no patched version; private values omitted here |
| Propagation caveat | no | Record propagation owner when applicable | N/A: no published advisory or package version to propagate |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | source, ownership, route, tests, and advisory metadata recorded | implementation |
| Implementation | complete | live/static renderers sanitize URLs; component coverage and registry changelog added | verification |
| Verification | complete | 6 focused tests, www typecheck, lint, changelog check, browser route, autoreview, and full `pnpm check` pass | PR sync |
| PR / tracker sync | in_progress | task-style body prepared after the full PR gate | create PR and verify exact head |
| Closeout | queued | completion checker follows exact-head PR readback | final response |

Findings:
- `@platejs/media` returns an intentionally named `unsafeUrl`; the copied UI owns the anchor policy.
- Existing `sanitizeUrl` accepts an explicit scheme allowlist and preserves `/` and `#` relative targets.
- `media-file-node` includes both live and static renderers; `media-demo` contains a valid HTTPS PDF link.
- The private report is closed, unpublished, and has malformed package-range metadata; no package or CVE work applies.

Decisions and tradeoffs:
- Allow `http`, `https`, and `blob`, plus relative URLs preserved by `sanitizeUrl`; reject executable and unrelated custom schemes.
- Apply the same policy in live and static copied renderers to avoid SSR/export drift.
- Keep a tiny local allowlist duplicated across the sibling open-code files per Plate UI ownership guidance.

Implementation notes:
- Live and static `media-file-node` renderers call `sanitizeUrl` with `blob`, `http`, and `https`; `permitInvalid` preserves browser-resolved relative paths while parsed custom/executable schemes are rejected.
- Unsafe URLs become `undefined`, so React omits `href`; the file label and caption remain visible.
- The existing component spec now covers live and static unsafe URLs plus relative-path preservation.

High-risk note:
- realistic failure mode: an overly strict filter could disable valid uploaded file links, especially blob or relative URLs.
- proof plan: component tests cover HTTPS, relative paths, and unsafe suppression; the real media demo proves its HTTPS PDF remains visible; typecheck and registry source checks cover copied-code integration.
- boundary: the copied anchor owns click behavior, while `@platejs/media` intentionally exposes `unsafeUrl` for renderers with different policies.

Review fixes:
- None: local autoreview returned no findings and judged the patch correct.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `bun test apps/www/src/registry/ui/media-file-node.spec.tsx` (repo root) -> 6 passing, 0 failing, 7 assertions.
- `pnpm --filter www typecheck` (repo root / `apps/www`) -> passed, including docs and registry source parity.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` and `--check` (repo root) -> 25 events generated and checked.
- `pnpm lint:fix` (repo root) -> final rerun passed with no fixes.
- Browser `http://localhost:3000/blocks/media-demo` -> HTTP 200; editor rendered the valid `sample.pdf` file row and media content without route/server error. Exact unsafe `href` suppression remains owned by the component test because the demo intentionally has no malicious fixture.
- `.agents/skills/autoreview/scripts/autoreview --mode local --stream-engine-output` (repo root) -> no findings; patch correct with 0.86 confidence on the final implementation diff.
- `pnpm check` (repo root) -> passed the full lint, package build/typecheck, fast, slow, and slowest test gates; only existing warnings were emitted.

Final handoff contract:
- PR line: create after the first verified commit, then record its exact URL in this plan.
- Issue / tracker line: N/A: private report is closed and its closure comment already records why.
- Confidence line: `🟢 95-100% confidence`.
- Flow table:
  - Reproduced: `🔴` raw unsafe href retained before the sanitizer; Browser N/A for the intentionally unsafe fixture.
  - Verified: `🟢` 6 focused tests plus `pnpm check`; `🟢` `/blocks/media-demo` valid PDF row.
- Browser check: approved Browser tool rendered the live route at HTTP 200 with `sample.pdf` visible.
- Outcome: copied file nodes accept HTTP(S), blob, and relative URLs while unsupported schemes render without a click target.
- Caveat: Browser proof covers the valid demo path; exact unsafe-attribute suppression is covered by component tests.
- Design:
  - Chosen boundary: copied live and static file renderers own link activation policy.
  - Why not quick patch: sanitizing only the live component would leave static/export behavior inconsistent.
  - Why not broader change: the media package intentionally exposes raw URLs so custom renderers can choose their own policy.
- Verified: focused tests, www typecheck, lint, changelog write/check, Browser route, autoreview, and full `pnpm check`.
- PR body verified: exact GitHub readback follows PR creation.

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
- PR: pending
- Task plan at exact PR head: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-09-26T23:41:54.557Z Task goal plan created.
- 2026-09-27 Source advisory, registry ownership, shadcn project context, route, test surface, and release policy read; pre-solution verdict recorded.
- 2026-09-27 Created `codex/harden-media-file-urls` from `origin/main`; reproduced raw unsafe href with a failing live component test.
- 2026-09-27 Added live and static scheme validation, passing regression coverage, and registry changelog source/generated artifacts.
- 2026-09-27 Focused tests, www typecheck, lint, changelog check, and `/blocks/media-demo` browser proof passed.
- 2026-09-27 Expanded supported-URL coverage to blob and static relative URLs; final focused suite passed 6/6.
- 2026-09-27 Local autoreview returned no findings; full `pnpm check` passed against the final implementation diff.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementation and verification complete; PR creation next |
| Where am I going? | Commit, push, PR exact-head sync, completion checker, and closeout |
| What is the goal? | Suppress unsafe file hrefs without breaking supported downloads |
| What have I learned? | The copied live/static renderers own link policy; no package release applies |
| What have I done? | Implemented both renderers, added 6 passing behavior tests, generated the changelog, passed full checks/review, and verified the real demo route |

Open risks:
- Browser proof can validate the preserved HTTPS download path; unsafe-scheme suppression is best proven by component tests because the demo contains no malicious fixture.
