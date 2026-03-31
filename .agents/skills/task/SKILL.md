---
description: Work a task end-to-end with lean context gathering, implementation, and verification
argument-hint: '[task description | issue id/link]'
disable-model-invocation: true
name: task
metadata:
  skiller:
    source: .agents/rules/task.mdc
---

# Work Task

Handle $ARGUMENTS. Be thorough, not ceremonial. Start from the source of truth, load extra skills only when they earn their keep, and verify before calling the task done.

<task>#$ARGUMENTS</task>

## Core Rules

- Read the task source first.
- Read local repo instructions and relevant files before editing.
- Search for existing patterns before inventing new ones.
- Prefer the best durable fix over the smallest local patch. If the root cause lives in an API or abstraction seam, change that seam even when it means a broader refactor or an intentional API change.
- Prefer targeted tests and checks during iteration.
- Keep the user updated at milestones.
- Verify the actual result before claiming done.
- Do not default to research swarms, review swarms, or browser proof.
- For verified code-changing work, default to creating or updating the PR unless the user explicitly said not to.
- Do not default to compounding.

## Intake

1. Classify the input:
   - Plain task text: the user prompt is the source of truth.
   - File path or spec path: read it first.
   - GitHub issue URL: fetch it with `gh issue view` first.
   - GitHub PR URL: fetch it with `gh pr view` first.
   - Bare GitHub issue like `#555`: resolve it against the current `gh` repo first, then fetch it with `gh issue view`.
   - Linear issue link/id: fetch it with the Linear integration first.
2. Read the full source-of-truth context before doing anything else.
3. If the task comes from a ticket or issue, also read the comments and attachments when available.
4. If the task comes from a tracker item and any attachment or linked media is a video or screen recording, you must have transcript output with `video-transcripts` before implementation.
   - The canonical shared cache lives in the tracker next to the evidence it describes.
   - Cache comment body should be XML only:

````md
```xml
<video-transcripts>
<video-transcript
  source-key="https://tracker-hosted-video/<stable-path-without-query>"
>
[00:00] (...)
</video-transcript>
</video-transcripts>
```
````

   - `source-key` must be the normalized stable identifier for the media. For signed tracker-hosted URLs like `uploads.linear.app`, strip the query string so rotating signatures do not bust the cache.
   - Do not add decorative metadata like `title` to cached `<video-transcript>` entries unless a later workflow truly needs it.
   - Group videos by source container before transcribing:
     - one cache comment for issue or PR body videos
     - GitHub: one dedicated top-level cache comment for each issue or PR comment that contains video(s)
     - Linear: one cache reply for each comment that contains video(s)
   - Keep the cache body pure XML. Do not prepend markers, prose, or YAML.
   - Before running the helper, scan existing tracker comments and, when relevant, Linear replies. Match by source container first, then check whether the cached `<video-transcript ... source-key="...">` entries cover every current video URL for that container after the same normalization.
   - If the matching cache fully covers the current normalized video keys for that source container, reuse the cached XML block and do not re-transcribe.
   - If the cache is missing any current video, or that source container has new video evidence, transcribe only the missing videos and create or update the matching cache comment or reply.
   - Use the helper in [$video-transcripts](/Users/zbeyens/git/plate/.agents/skills/video-transcripts/SKILL.md).
   - Run it once per relevant video attachment or URL.
   - For auth-gated tracker media like `uploads.linear.app` or private GitHub asset URLs, use the helper directly before declaring the video blocked. It can reuse local tracker auth when available.
   - Convert the video evidence into a normalized block in this exact shape before continuing:

```xml
<video-transcripts>
<video-transcript source-key="...">
[00:00] (...)
</video-transcript>
</video-transcripts>
```

   - Use the generated or cached transcript output as part of the tracker context.
   - Do not hand-write, paraphrase, or skip video evidence when the skill can run.
   - If the helper still cannot fetch or transcribe the media after a real attempt, hard stop and report the exact blocker you hit.
   - Do not continue implementation without the transcript when a real video is present.
5. If there are multiple videos, preserve each as its own `<video-transcript ...>` block under one `<video-transcripts>` wrapper.
6. Classify the task shape before choosing a workflow:
   - Testing or coverage work: triggered by coverage, regressions, test-suite phases, hotspots, package testing, or similar language.
   - Program or batch work: triggered by multiple packages, phases, buckets, or ordered slices.
   - Ordinary one-shot work: bug, feature, refactor, docs, review, or investigation that can be finished as a single slice.
7. Classify whether this is heavyweight framework or library work:
   - Heavyweight work: architecture or public API redesign, breaking changes, major cross-package refactors, benchmarking, profiling strategy, performance comparison, scalability work, framework comparison, migration analysis, RFCs, proposals, or spec-first major changes.
   - Non-heavyweight work: ordinary bugs, one-package features, docs-only edits, routine test work, small refactors, or normal issue execution even when non-trivial.
8. If the task is heavyweight work:
   - load `major-task` immediately
   - treat `major-task` as the source of truth for workflow and helper selection
   - do not quietly inflate this task flow into a research swarm
9. If the task is not heavyweight work, classify task complexity before implementation:
   - Non-trivial task: multi-step work, research-heavy work, phased execution, or anything likely to take more than a handful of tool calls.
   - Trivial task: quick question, small edit, or other work that does not need persistent working memory.
10. If the task is non-trivial:
   - load `planning-with-files` before implementation
   - use persistent planning files or the repo's equivalent planning structure so progress survives context loss
   - follow local repo overrides for where planning files live
11. If the task is testing or coverage work:
   - restate it as test work, not generic feature work
   - load `testing` first and use that testing policy as the source of truth
   - choose the smallest honest seam before loading `tdd`
12. If the task is program or batch work:
   - restate the ordered scope and hard constraints
   - do not treat the whole batch as one implementation unit
   - default to completing the first slice cleanly unless the user explicitly asks for a broader sweep
13. GitHub issue rules:
   - Resolve bare issue numbers like `#555` against the current repo with `gh repo view --json nameWithOwner -q '.nameWithOwner'`.
   - Fetch GitHub issues with:
     ```bash
     gh issue view <number-or-url> --comments --json number,title,body,comments,labels,state,url
     ```
   - Fetch GitHub PRs with `gh pr view ... --json`.
   - If the input is ambiguous and not clearly a GitHub issue token or URL, do not guess.
14. For any tracker source, restate for yourself:

- source type
- source id
- exact title
- task type: bug, feature, refactor, docs, review, investigation, testing, or batch work
- expected outcome or acceptance criteria
- caveats, blockers, or missing information from the tracker
- likely files, routes, or packages affected
- whether there is a real browser surface to verify
- likely root-cause layer: call site, helper, abstraction seam, or public API

15. Read repo instructions and nearby implementation patterns before editing.
16. If the task changes code:

- if already on a relevant feature branch, continue there
- otherwise check out `main`, pull the latest `main`, then create a repo-convention branch before editing
- if the task has a tracker id, prefer a branch name that includes it:
  - GitHub issue: `codex/555-short-slug`
  - Linear issue: `codex/LIN-123-short-slug`
- in this repo, otherwise prefer `codex/<slug>`
- run install or setup only when the repo or task actually needs it

17. If the task does not change code, skip branch and setup noise.
18. If anything important is still ambiguous after the source-of-truth pass and nearby code reading, ask the user the smallest useful clarifying question.

## Tracked Task Rules

Apply this section only when the task source is a tracker item.

### GitHub

- Treat the GitHub issue as the source of truth.
- Use `gh` for fetch and sync-back.
- If useful, rename the thread to `<issue-number> <issue-title>`.
- If the task is code-changing, prefer a branch name that includes the issue number.
- If the task changed code and reached a verified meaningful outcome, create or update the PR before any issue comment unless blocked or the user said not to.
- If the task reaches a meaningful outcome and came from the issue, post a concise issue comment after the PR exists unless blocked or the user said not to.

### Linear

- Keep the same fetch-first behavior as the dedicated Linear workflow.
- Read the issue, comments, and attachments before implementation.
- Keep comment-back QA-focused.
- Do not force browser proof unless the task actually has a browser surface.

### Tracked Task Non-Rules

- Do not require PR creation for tracker tasks that did not change code, ended blocked, or were purely investigative.
- Do not require browser screenshots for every tracked task.
- Do not require tracker comments for investigations that ended blocked or inconclusive unless sync-back is useful.

## Load Skills Only When Justified

- `planning-with-files`
  Use for any non-trivial task that needs persistent working memory, phased execution, or likely more than a handful of tool calls.
  Follow repo-specific overrides for where planning artifacts should live.
- `major-task`
  Use for architecture or public API redesign, benchmarking or scalability work, framework comparison or migration analysis, major cross-package refactors, or RFC and proposal work.
  When it triggers during intake, it becomes the source of truth instead of this file.
- `testing`
  Use when the task is primarily about tests, coverage, regression gaps, or phase-based suite work.
  Load it before `tdd` for testing programs.
- `tdd`
  Use for bugs and for feature work where behavior-level automated coverage is sane.
  For testing programs, load it only after choosing a concrete slice that should be done test-first.
  Skip for trivial docs, mechanical refactors, or painful UI-only plumbing.
- `learnings-researcher`
  Use for non-trivial work in a domain with documented solutions or when the task smells like a repeated issue.
  Do not load it for tiny isolated edits.
- `debug`
  Use when the failure mode is still fuzzy after the first repro pass or first failing test.
- `video-transcripts`
  Use when a tracker issue, PR, comment thread, or attachment set includes any video or screen recording that should become structured transcript evidence before implementation.
- `ce:brainstorm`
  Use when requirements are still ambiguous after reading the source of truth and nearby code.
- `framework-docs-researcher`
  Use when touching unfamiliar, version-sensitive, or unstable third-party APIs after checking local clones and docs per AGENTS.
- `dev-browser`
  Use only when there is a real browser surface to verify.
  Require real browser proof only for browser or UI tasks.
- `agent-browser-issue`
  Use when browser automation is blocked by a likely reusable tool-side issue that should be split into its own GitHub follow-up.
- `changeset`
  Use when verified work changes a published package under `packages/` and the repo expects release notes before completion.
  Do not create a package changeset for registry-only work under `apps/www/src/registry/`; update `docs/components/changelog.mdx` instead.
- `git-commit-push-pr`
  Use when verified work changed code and should ship as a PR.
  Create or update the PR before any tracker comment.
  The PR description should be the exact current final handoff, not a rewritten summary.
  If the task changes again in a later iteration, update the PR description to match the latest handoff.
- `ce-compound`
  Use only after verified, non-trivial work that produced reusable knowledge.
  Never load it at the start.
- `ce-review`, `correctness-reviewer`, `maintainability-reviewer`, `project-standards-reviewer`, `code-simplicity-reviewer`
  Use only for risky, large, user-facing, or architecture-sensitive changes.
- `agent-native-reviewer`
  Use only when the change touches `.agents/**`, `.claude/**`, AI/tooling surfaces, commands, or user actions that an agent should also be able to perform.

## Execution Path

### Bug

1. Reproduce first if possible.
2. If behavior-level coverage is sane, turn the repro into the smallest useful automated test and watch it fail for the right reason.
3. Find the real ownership boundary of the bug. Prefer fixing the abstraction, contract, or API that caused it instead of patching each caller around it.
4. If the best fix requires an API change, make it unless the task source or repo constraints explicitly rule that out. Do not preserve a bad API just to keep the diff small.
5. If you intentionally choose a narrower fix, state why the broader architecture fix was not worth shipping now.
6. Re-run targeted checks.
7. Re-run the browser flow only if the bug lives on a browser surface.

### Feature

1. Reduce the task to the smallest slice that fully satisfies the acceptance criteria.
2. Add behavior coverage when sane.
3. Prefer the cleanest long-term design that fits the slice, not the quickest bolt-on.
4. If existing patterns are the reason the design is weak, improve the pattern or API instead of copying it blindly.
5. Verify the user-facing outcome.

### Testing Or Coverage Work

1. Use the testing policy as the rulebook before choosing seams or commands.
2. Identify the smallest honest seam for the first hotspot or ordered slice.
3. Add or deepen the narrowest useful tests instead of spraying smoke coverage.
4. Verify with targeted test commands first.
5. Use broader suite checks only when repo rules or change scope justify them.

### Program Or Batch Work

1. Respect the explicit order from the task source.
2. Do not fan out across every listed slice immediately.
3. Define what "done for this slice" means before implementation.
4. Complete one slice at a time unless the user explicitly asks for broader execution.

### Refactor Or Chore

1. Preserve behavior.
2. Do not do fake TDD theater.
3. If the task exposes a bad API or abstraction, fix that seam instead of polishing around it.
4. Run the narrowest regression checks plus the relevant build, typecheck, or lint path for the touched area.

### Docs Or Content

1. Skip engineering ceremony.
2. Verify links, examples, formatting, and rendered output as appropriate.

### Review Or Investigation

1. Read the relevant diff, files, and surrounding context first.
2. For review tasks, report findings first, ordered by severity, with concrete file references.
3. For investigation tasks, identify the failure mode, probable cause, and next action before changing code.
4. Only implement changes if the user actually asked for them.

## Verification

Keep verification mandatory but proportional.

- Run targeted tests for changed behavior.
- Run package or app build and typecheck when relevant to the touched area.
- Run lint when code changed and the repo expects it.
- Run browser verification only for browser or UI tasks.
- Run broader repo-wide gates only when repo instructions require them or the change scope justifies them.
- If the repo has a standard final gate, run it last.
- If verified work changed code, create or update the PR before tracker sync-back unless the user explicitly said not to.
- If the task came from a tracked issue and the task reached a meaningful outcome, sync back unless the user said not to.
- If UI changed, capture proof from the real browser surface.
- Do not hardcode PR creation, screenshots, or tracker comments for every task.

## Final Handoff

Every final response must include:

- follow repo writing style here too:
  - be extremely concise
  - sacrifice grammar for concision
  - no filler, no narration, no polite padding
- two leading markdown tables in this exact format:
  - metadata table:
    - `| Check | Result |`
    - `| --- | --- |`
  - flow table:
    - `| Phase | 🧪 Tests | 🌐 Browser |`
    - `| --- | --- | --- |`
- use these metadata rows, in this order:
  - `PR`
  - `Issue`
  - `Confidence`
- use these flow rows, in this order:
  - `Reproduced`
  - `Verified`
- use markdown links for `PR` and `Issue` when they exist
- keep the `Issue` row stable; do not add issue comment links there
- use these exact status values in the tables:
  - `✅`
  - `❌`
  - `➖ N/A`
  - prefer specific browser caveat text over vague `⚠️ Partial`, for example `⚠️ Could not automate dropdown`
- in the `🧪 Tests` column:
  - use `🔴` in `Reproduced` when there was a real failing test first
  - use `🟢` in `Verified` when that test passed after the fix
  - use `✅` when test evidence exists but did not follow a real red-green loop
- use `➖ N/A` for rows or cells that do not apply; do not invent a PR, issue, or comment
- flow-table test cells mean test-based evidence, whether that came from TDD, a regression test, or another targeted test path
- if manual non-browser reproduction or verification happened, explain it in the prose below the tables rather than adding extra rows
- `Confidence` must stay `100%` or lower and use this format:
  - `🟢 95-100%`
  - `🟡 80-94%`
  - `🔴 below 80%`
- after the tables, use these short sections in this order:
  - `**🌐 Browser Check**`, only when browser verification applies
  - `**✅ Outcome**`
  - `**⚠️ Caveat**`
  - `**🏗️ Design**`
  - `**🧪 Verified**`
- keep those sections flat, concise, and easy to scan
- keep prose brutally short; prefer bullets over paragraphs here
- if browser verification applies, `**🌐 Browser Check**` must include the exact human steps to verify the fix in the browser
- `**🏗️ Design**` is mandatory for any non-trivial code-changing task and must include:
  - `Chosen seam: ...`
  - `Why not quick patch: ...`
  - `Why not broader change: ...` only if a broader API or abstraction change was a real option

### UI Or Browser Tasks

- Include at least one real browser proof screenshot in the final response.
- The screenshot must come from `dev-browser` or the real browser workflow used for verification.
- When `**🌐 Browser Check**` is present, put the screenshot immediately after that section.
- Otherwise, put the screenshot immediately after the two tables, before the completion summary.
- If no real browser proof exists, the task is not done unless the user explicitly waived it.
- If `dev-browser` is blocked on a likely reusable tool-side issue and the product task is still otherwise fixable, load `agent-browser-issue`.
- If that follow-up issue is opened, mention it in the caveat or handoff.
- `**🌐 Browser Check**` must be a flat bullet list:
  - keep it short and concrete
  - prefer the exact local URL as a markdown link when one exists, for example [http://localhost:3000/...](http://localhost:3000/...)
  - use the real page, route, and interaction names
  - focus on how to prove the fix, not on implementation detail

### Non-UI Tasks

- No screenshot is required.
- Omit `**🌐 Browser Check**` when there is no browser surface.
- Keep the final response concise and evidence-based.

### Testing Or Batch Work

- State which slice, bucket, or hotspot was completed.
- State what verification ran for that completed slice.
- State what remains queued by design.
- State any intentional deferral in generic terms only.

### Review Or Investigation Tasks

- Lead with findings or conclusion, not process notes.

## Post Back To Tracker

Apply this section only when the task came from a tracker item and reached a meaningful outcome.

### Pull Request

- When a PR exists, the PR description must match the exact current final handoff from chat:
  - same two tables
  - same screenshot when applicable
  - same `**✅ Outcome**`, `**🏗️ Design**`, `**🧪 Verified**`, `**⚠️ Caveat**`, and `**🌐 Browser Check**` sections when applicable
  - same caveats
  - same human browser verification steps when applicable
- PR description follows the same writing style:
  - extremely concise
  - grammar can be sacrificed for concision
  - no fluffy framing
- Do not publish a PR description with a dead local proof path.
- If screenshot proof is local, upload it first and only then write or update the final PR body with the hosted GitHub URL.
- For a brand-new PR, if the hosted proof URL is not ready yet:
  - create the PR with no proof image
  - upload the image immediately
  - replace the placeholder with the real hosted proof before handoff
- If the PR description includes a local image path for proof, do not leave it that way on GitHub.
- Use `dev-browser --connect http://127.0.0.1:9222` to upload the image through the PR comment file input as a staging area, then replace the local proof path in the PR body with the hosted GitHub attachment URL.
- Use the PR comment textarea only as staging:
  - upload image
  - read generated markdown or URL from the textarea
  - clear the textarea
  - do not submit the staging comment
- Do not spend time reloading the PR page just to verify hosted image rendering unless the user explicitly asks.
- Do not compress, adapt, or rewrite the handoff for the PR description.
- If a later iteration changes the fix, evidence, certainty, caveats, or verification, update the PR description again so it stays in sync.
- Update the PR description before writing the issue comment.

### GitHub Issue

- Use:
  ```bash
  gh issue comment <number-or-url> --body-file -
  ```
- Keep it user-facing and e2e-centric.
- Keep it extremely concise. Grammar can be sacrificed for concision.
- Start with a single plain line in this shape:
  - `✅ Fixed in #<pr-number>.`
- Follow with a flat bullet list only:
  - manual verification steps for the real user flow
  - optional final QA or caveat bullet when useful
- Do not mention:
  - Codex
  - file names
  - tests, typecheck, or lint
  - screenshot paths
  - branch names
  - commit, push, or staging mechanics
- Do not write the issue comment before the PR exists.
- If writing the comment after code-changing work, use the PR number form `#123`, not the full URL.

Example:

```md
✅ Fixed in #123.

- Open the affected page.
- Follow the real user flow that triggered the bug.
- Confirm the fixed behavior in the browser.
- Manual QA is still useful if browser verification was partial.
```

### Linear

- Keep proof local. Do not upload screenshots or other files to Linear.
- Post a concise issue comment using the Linear integration.
- Match the ticket style and write for QA, not developers.
- Keep the same terse style:
  - extremely concise
  - grammar can be sacrificed for concision
  - avoid file names, tests, typecheck, lint, branch names, PR mechanics, and screenshot paths

### Blocked Or Inconclusive Tracker Work

- If the task was blocked before meaningful progress, either skip the comment or post a short blocker note only if that helps the tracker owner.

## Success Criteria

- Source-of-truth context was read first.
- Relevant local instructions and code patterns were read before editing.
- Tracker items were fetched and summarized correctly when provided.
- Video attachments or screen recordings were turned into normalized `<video-transcripts>` evidence before implementation when tracker evidence required it.
- Bare GitHub issues like `#555` were resolved against the current `gh` repo instead of guessed.
- The chosen implementation fixed the highest-leverage seam available, not just the nearest symptom.
- Code-changing tasks that did not already start on a relevant feature branch checked out `main` and pulled latest before branching.
- Non-trivial work loaded `planning-with-files` or the repo-equivalent planning workflow before implementation.
- Testing work loaded the testing policy before implementation.
- Only the necessary skills were loaded.
- The implementation matched the task type instead of following a one-size-fits-all ritual.
- Batch work did not sprawl across multiple slices without explicit instruction.
- Verification matched the change scope.
- Final handoff matched the task type.
- Testing or batch handoff reported the completed slice, verification, and remaining queue when relevant.
- Any tracker, browser, review, or compound follow-up was done only if actually relevant.
