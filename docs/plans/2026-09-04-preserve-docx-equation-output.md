# Preserve DOCX equation output

Objective:
Preserve supported DOCX equation output while ignoring unrelated XML; done when regression, package, repository, review, changeset, and task PR gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-04-preserve-docx-equation-output.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: maintainer bug task
- id / link: N/A: no public tracker
- title: Preserve DOCX equation output
- acceptance criteria: accept one supported equation root, retain equation-namespace content and attributes, ignore unrelated XML, preserve block and inline output, and ship focused proof plus a patch changeset

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: direct red-green and command gates are stronger
- improvement loop: N/A: one-shot bug fix
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:
- Public `htmlToDocxBlob` regressions fail before the fix and pass afterward.
- Supported block and inline equations retain their math content and attributes.
- Unrelated XML roots, descendants, attributes, and multiple roots are ignored.
- The DOCX package tests, typecheck/build, lint, and repository `check` pass.
- A patch changeset records the user-visible correction.
- Structured autoreview reports zero accepted/actionable findings.
- The task branch is pushed to a temporary review repository and a task-style PR names this exact plan once.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied, required verification is recorded, release-artifact and review
  gates are closed, PR sync is complete, and the plan checker passes.

Verification surface:
- Focused public `htmlToDocxBlob` equation tests and the full slow DOCX conversion suite.
- Exact generated `word/document.xml` inspection for accepted and ignored input.
- `@platejs/docx-io` typecheck/build, `pnpm lint:fix`, and `pnpm check`.
- Structured autoreview and final PR/body readback.

Constraints:
- Preserve existing user-facing behavior outside equation conversion.
- Keep validation at the shared equation-import boundary used by both rendering paths.
- Do not add a public API, dependency, browser policy, or caller-specific workaround.
- Keep unreleased report details out of commit, plan, changeset, and PR prose.

Boundaries:
- Source of truth: `htmlToDocxBlob`, both equation rendering paths, OOXML namespace definitions, and generated `word/document.xml`.
- Allowed edit scope: shared internal equation parser, its two callers, focused integration tests, one patch changeset, and this task plan.
- Browser surface: N/A: deterministic generated archive XML has no interactive or visual browser state.
- Tracker sync: N/A: no public tracker; temporary review PR readback owns sync.
- Non-goals: a new equation authoring API, arbitrary OOXML support, DOCX import, registry UI, documentation, publication, and package release.

Output budget strategy:
Read exact owner/test/type paths, cap searches and command output, and avoid generated/build trees except for named artifact verification.

Blocked condition:
Stop only if valid equation output regresses, package or repository checks cannot be repaired in scope, or the temporary review PR cannot be created after verification.

Task state:
- task_type: package bug fix
- task_complexity: non-trivial one-package runtime correction
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A: maintainer review, merge, release, and disclosure are separate work
- goal_status: ready_for_completion

Current verdict:
- verdict: valid
- confidence: high; direct public-API proof imported unrelated XML before the fix
- next owner: maintainer review
- reason: equation metadata was parsed as unrestricted XML at two package-owned sinks

Pre-solution issue challenge:
- reporter claim: DOCX equation metadata can contribute unrelated XML to generated document content.
- suggested diagnosis or fix: validate equation input at its import sites.
- repro ladder:
  - tests / source-level repro: public `htmlToDocxBlob` proof reproduced unrelated block and inline content before product edits.
  - Playwright / automated browser: N/A: archive XML is observable below the browser layer.
  - Browser plugin: N/A: no interaction or visual state changes.
  - screenshot / visual proof: N/A: no visual claim.
- reproduction verdict: reproduced
- validity verdict: valid
- best long-term fix boundary: one shared parser that accepts supported equation roots and keeps equation-namespace content only.
- harsh honest feedback: feeding an opaque metadata string into a general XML importer was the wrong contract.
- hard-stop decision: proceed with the shared owner fix and regression coverage.

Completion rule:
- Do not close the goal while any required checklist item remains unchecked.
- Do not close the goal until every completion threshold above is satisfied,
  final handoff evidence is recorded, and the plan checker passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | `task`, `autogoal`, `security-triage`, `tdd`, `changeset`, and `autoreview` selected |
| Active goal checked or created | yes | Exact work goal is active; confidential detail is kept outside the committable bundle |
| Source of truth read before edits | yes | Advisory, public API, both XML sinks, namespace owner, tests, package metadata, and upstream parser behavior read |
| Tracker comments and attachments read | yes | Repository report has zero comments and no attachments |
| Video transcript evidence required | no | N/A: no video |
| Pre-solution issue challenge required | yes | Validity, repro, and owner-boundary verdict recorded before code edits |
| Reproduction verdict before implementation | yes | Source and shipped-package public API repros both imported unrelated XML |
| Repro escalation ladder selected | yes | Generated archive XML is authoritative; browser layers are N/A |
| Suggested fix reviewed against durable boundary | yes | Shared parser fixes both sinks without duplicating caller policy |
| `docs/solutions` checked for existing work | yes | Narrow search found no applicable prior solution |
| TDD decision before behavior change | yes | Root, descendant, and attribute regressions were observed red then green |
| Branch decision for code-changing task | yes | Dedicated `codex/preserve-docx-equation-output` branch starts at current `origin/main` |
| Release artifact decision | yes | One patch changeset for `@platejs/docx-io` |
| Browser tool decision | no | N/A: no browser surface |
| PR expectation decision | yes | `task` requires a verified temporary review PR |
| Dedicated task plan selected | yes | This plan owns temporary review repository PR #1 only |
| Tracker sync expectation decision | no | N/A: no public tracker |
| Output budget strategy recorded | yes | Exact paths and capped output recorded above |
| Package/API pack selected | yes | Published `@platejs/docx-io` runtime behavior changes |
| Public surface identified | yes | `htmlToDocxBlob` is the tested public boundary; its signature and exports stay unchanged |
| Release artifact selected | yes | `.changeset/preserve-docx-equation-output.md` |
| `changeset` skill loaded | yes | Full skill read; patch level and imperative user-impact prose used |
| Barrel impact decided | yes | New file is internal and unexported; no barrel generation needed |

Work Checklist:
- [x] Goal, threshold, verification surface, constraints, boundaries, and blocker are concrete.
- [x] Task source, acceptance criteria, owner paths, package boundary, and non-goals are recorded.
- [x] Report claims were challenged with source and exact public-API reproduction before implementation.
- [x] The repro ladder is resolved; browser and screenshots are N/A for generated XML.
- [x] Nearby implementation and test patterns were read before edits.
- [x] The shared package owner is fixed instead of patching callers separately.
- [x] Red-green tests cover invalid roots, foreign descendants and attributes, multiple roots, and valid block/inline equations.
- [x] One patch changeset records the published package behavior correction.
- [x] Dedicated branch and exact per-PR task plan are selected.
- [x] Workspace authority is `/Users/zbeyens/git/plate`; all proof runs there.
- [x] High-risk failure mode and preservation proof are recorded.
- [x] Local autoreview reviewed the complete code patch; the final PR sync is plan-only.
- [x] Agent-native review is N/A because no agent/tooling files change.
- [x] Output is scoped and capped; one accidental broad dependency search was stopped and replaced by exact reads.
- [x] Final repository check, temporary review PR, body readback, and exact plan-at-head sync are complete.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused/package tests and exact `pnpm check` pass |
| Bug reproduced before fix | yes | Public API proof imported two unrelated nodes before product edits |
| Targeted behavior verification | yes | Six focused equation tests pass with nineteen assertions |
| Typed code changed | yes | Package source-first typecheck passes |
| Package exports changed | no | N/A: internal unexported utility only |
| Install graph changed | no | N/A: no manifest or lockfile change |
| Browser surface changed | no | N/A: deterministic archive XML only |
| CI template output changed | no | N/A: no template files changed |
| Package behavior changed | yes | Patch changeset added for `@platejs/docx-io` |
| Registry output changed | no | N/A: no registry surface |
| Docs or content changed | yes | Internal task plan only; no public reference docs change |
| High-risk mini gate | yes | Invalid XML must disappear while valid math remains; focused archive assertions cover both sides |
| Local install corruption suspected | no | N/A: type errors matched the new code and were fixed directly |
| Autoreview | yes | Final local review of the complete code patch reports zero findings and correctness 0.86; later sync is plan-only |
| PR create or update | yes | Exact `pnpm check` passed before temporary review repository PR #1 was created |
| Per-PR task ownership | yes | PR #1 has one task-plan line and this final plan commit is pushed to its head |
| Final lint | yes | `pnpm lint:fix` and repository lint passed with one pre-existing warning |
| Goal plan complete | yes | Resolved plan passes the mechanical checker |
| Package typecheck/build/test | yes | Focused/full conversion tests, typecheck, build, lint, and repository check required |
| Release and disclosure | no | N/A: merge, package publish, advisory metadata, CVE, and disclosure are separate maintainer actions |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Report, public API, sinks, dependencies, namespaces, and tests inspected | implementation |
| Reproduction | complete | Current source and exact shipped package both reproduced the invalid import | implementation |
| Implementation | complete | Shared parser validates the root and removes non-math content and attributes | verification |
| Verification | complete | Focused/package tests, build/typecheck, lint, repository check, and local autoreview pass | PR sync |
| PR / tracker sync | complete | Temporary review repository PR #1 is open, non-draft, and its body readback is correct | closeout |
| Closeout | complete | All task gates are resolved; merge, release, and disclosure remain separate maintainer actions | final response |

Findings:
- Both block and inline equation paths independently imported the same opaque string.
- The package already defines the Office Math namespace and exposes the affected conversion through `htmlToDocxBlob`.
- Valid Office Math can be preserved without retaining unrelated namespace content.

Decisions and tradeoffs:
- Validate once in a shared internal parser used by both paths.
- Accept one `oMath` or `oMathPara` root in the Office Math namespace.
- Preserve math-namespace descendants and math/XML attributes; remove unrelated elements and attributes.
- Keep existing fallback behavior when equation metadata is rejected.

Implementation notes:
- Added public-API integration coverage for block and inline paths.
- No public signature, option, export, dependency, or browser behavior changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad dependency search streamed minified output | 1 | Read exact type and source files with capped output | Owner and types were found without repeating the broad search |
| Initial package archive filename assumption was wrong | 1 | Inspect the produced archive name | Exact shipped package repro completed |
| Node ESM could not resolve an existing extensionless dependency import | 1 | Run the same repro with the repository's Bun runtime | Shipped-package repro completed |
| Bun test path lacked the explicit relative prefix | 1 | Use `./packages/...` | Focused suite ran normally |
| First utility draft used browser DOM globals instead of xmlbuilder node types | 1 | Derive narrow structural types from `XMLBuilder['node']` | Package typecheck passes without adding a dependency |
| First attribute-preservation assertion depended on serializer normalization | 1 | Assert preserved math attributes and observable text instead | Correct contract passes |
| Extra unit-test filename from an earlier note did not exist | 1 | Use the owning slow conversion suite and repository discovery | No product failure; exact 33-test owner suite and repository test batches pass |

Verification evidence:
- `/Users/zbeyens/git/plate`: source public-API repro before fix -> two unrelated XML nodes imported.
- Exact shipped `@platejs/docx-io` package: same public-API repro -> two unrelated XML nodes imported.
- `/Users/zbeyens/git/plate`: focused equation suite -> 6 pass, 0 fail, 19 assertions.
- `/Users/zbeyens/git/plate`: full `html-to-docx.slow.ts` -> 33 pass, 0 fail, 68 assertions.
- `/Users/zbeyens/git/plate`: package source-first typecheck -> 8/8 tasks pass.
- `/Users/zbeyens/git/plate`: package build -> pass.
- `/Users/zbeyens/git/plate`: `pnpm lint:fix` -> pass; one file formatted.
- `/Users/zbeyens/git/plate`: structured local autoreview with the focused suite in parallel -> zero findings, correctness 0.86.
- `/Users/zbeyens/git/plate`: exact `pnpm check` -> pass: lint, 54 builds, 54 typechecks, 3,463 fast tests, 358 slow tests, all additional batches, and timing enforcement.
- `/Users/zbeyens/git/plate`: exact public-API repro after fix -> zero unrelated XML nodes imported.
- Temporary review repository PR #1: open, non-draft, based on `main`, and owns this branch.
- PR body readback: auto-release block, one exact task-plan line, confidence, proof table, required sections, and no self-link confirmed.

Final handoff contract:
- PR line: temporary review repository PR #1, open and non-draft
- Issue / tracker line: N/A: no public tracker
- Confidence line: 95% in the implementation; all repository, review, and PR evidence gates are green
- Browser check: N/A: deterministic generated archive XML has no runnable interaction or visual surface
- Outcome: supported equation markup remains while unrelated XML is ignored.
- Caveat: custom non-math extensions inside equation metadata are intentionally discarded.
- Design: one shared internal parser owns both block and inline conversion paths.
- Verified: focused public-API regressions, full conversion suite, post-fix repro, package build/typecheck, lint, full repository check, and clean local autoreview.
- PR body verified: yes; auto-release block, exact plan line, confidence, proof table, required sections, and no self-link confirmed.

Task-style PR body contract:
- Start with `🐛 Fixes ➖ N/A`, then exactly one task-plan line, then `🟢 95-100% confidence`.
- Use the exact `| Phase | 🧪 Tests | 🌐 Browser |` header with Reproduced and Verified rows.
- Use bold emoji Outcome, Caveat, Design, and Verified sections.
- Do not link the current PR in its own body.
- Preserve any auto-release block required for the changeset.

Timeline:
- 2026-09-04: report read, reproduced in source and shipped package, regression tests added red-green, shared fix implemented, and package typecheck passed.
- 2026-09-04: full repository check and structured review passed; temporary private fork created, report accepted as draft, and task PR #1 opened.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verified private task PR closeout |
| Where am I going? | Maintainer review; merge, release, and disclosure are separate work |
| What is the goal? | Preserve supported DOCX equations while rejecting unrelated XML |
| What have I learned? | Both sinks shared one unrestricted import contract, and Office Math can be preserved by namespace |
| What have I done? | Reproduced, fixed, added six focused tests and a patch changeset, passed all gates, and opened verified private PR #1 |

Open risks:
- No open implementation risk. Merge, package release, advisory metadata/CVE work, and disclosure are separate maintainer actions.
