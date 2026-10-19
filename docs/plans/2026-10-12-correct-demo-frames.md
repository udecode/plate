# Correct: Demo and Teach frames pass the ledger check

Status: executed: waiting on your commit
Page: https://claude.ai/artifact/K1XW4XniHvZzr5CCw4sVP8
Playbook: bug-fix

The owner asked to stop `node tooling/scripts/review-ledger.mjs check` from failing review plans only because their `## Demo` and `## Teach` images point into the git-ignored `docs/plans/artifacts/`, and to pick one rule: the ledger accepts those links, or frames move to a tracked place and the plan-page shape says so. This iteration takes the first rule. `.agents/pstack/plan-page.mjs` inlines each frame into the page as a data URI. The plan-page shape already says a frame missing on the rendering machine shows its path instead, so the shared source needs no change.

## Brief

### What will change?

Review plans can show screenshots again without failing the check. A screenshot in a Demo step or in How it works can stay in the run folder, because the page has its own copy.

### What could go wrong?

A typo in a screenshot's path now passes, and the page shows the path instead. Six review plans still fail on logs and notes in that folder. A change to which pictures the page shows won't reach the check.

## Teach

The review check reads every review plan. It fails when a link points at a file that a fresh copy of the repo won't have. Git ignores the run folder, where agents keep logs and screenshots, so nothing in it reaches a fresh copy.

Agents show their screenshots in Demo and How it works by linking into that folder. The page tool copies each picture into the page. So the link in the plan breaks in a fresh copy, but the page still shows the picture. The check failed those plans anyway.

Now the check lets a screenshot in the run folder pass when it sits in a Demo step or in How it works, the two places the page copies pictures from. Logs, notes and pictures anywhere else still fail.

## Main changes

- `tooling/scripts/review-ledger.mjs` `check` accepts an image link in a review page's `## Teach`, or in a numbered step of its `## Demo`, whose target is a `.gif`, `.jpg`, `.jpeg`, `.png`, `.svg` or `.webp` file under `docs/plans/artifacts/`, because `.agents/pstack/plan-page.mjs` inlines those frames into the page. Every other link into that ignored directory still fails. `CODING_STANDARDS.md`'s row "A local check sees only what a fresh checkout has" names the exception.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where screenshots live | They stay in the run folder, and the page keeps its own copy | Commit every screenshot to the repo and change the shared page rules | commit screenshots | big |
| Pictures above the first Demo step | Still fail, because the page does not show them | Pass like pictures in a step | intro pictures pass | detail |
| The mistake-proofing page | A new page at https://claude.ai/artifact/Qxu6zx2D9K614NCtkDZueK, because https://claude.ai/artifact/Bvdfs4Byv9ZWaGGRPTeAyM no longer opens | Drop the new page and leave that subject without one | drop the new mistake-proofing page | detail |

## Steps

- [x] The check accepts Demo step and Teach frames under the run folder and still refuses its other links. Proof: `docs/plans/artifacts/2026-10-12-ledger-demo-frames/tests-a1.log` and `docs/plans/artifacts/2026-10-12-ledger-demo-frames/compare-a1.log`.
- [x] The new test fails on the old check and on a mutant that counts Demo intro pictures. Proof: `docs/plans/artifacts/2026-10-12-ledger-demo-frames/base-candidate-a2.log` and `docs/plans/artifacts/2026-10-12-ledger-demo-frames/mutant-a1.log`.
- [x] The rules table names the exception. Proof: `CODING_STANDARDS.md`, row "A local check sees only what a fresh checkout has".

## Open work

- `pnpm check review-ledger` is red in the working tree on 2026-10-12 on six review pages that cite git-ignored run files in `review_inputs` or in links that are not Demo or Teach frames: `2026-10-08-emoji-review`, `2026-10-09-authored-structural`, `2026-10-09-uploads-review`, `2026-10-10-authored-values`, `2026-10-10-list-review` and `2026-10-11-authored-redesign`, from `docs/plans/artifacts/2026-10-12-ledger-demo-frames/compare-a1.log`. owner: zbeyens; stop: each page cites tracked files instead, or 2026-11-11; tracked: `docs/plans/topics/correct.md` Open work, which this item replaces.
- `review-ledger.mjs` copies from `plan-page.mjs` which image types and sections the page inlines, and `plan-page.mjs` exports nothing, so a renderer change can drift from the check unseen. A side-effect-free frame reader in the shared source, used by both, removes the copy. owner: zbeyens, through sync-pstack; stop: the shared source exports that reader and the ledger uses it, or the owner drops it; tracked: `docs/plans/topics/correct.md` Open work.

## Close

Landed, uncommitted on `next`:

- `tooling/scripts/review-ledger.mjs` gains `inlinedFrames`, and `pageProblems` skips its targets in the fresh-checkout link check.
- `tooling/scripts/review-ledger.test.mjs` gains one case. A review page with Teach frames, a Demo intro picture, a Demo step frame, a Demo step log link and an Evidence picture, all in an ignored run folder, fails with exactly the intro picture, the log and the Evidence picture.
- `CODING_STANDARDS.md`'s fresh-checkout row names the exception.

Proof, each a log in `docs/plans/artifacts/2026-10-12-ledger-demo-frames/`:

- `tests-a1.log` shows all 48 ledger tests pass on the final code.
- `base-candidate-a2.log` runs the new test in a fresh worktree at `HEAD`. It fails there, and the old check's message lists the Teach and Demo step frames among its refusals.
- `mutant-a1.log` reverts the numbered-step limit. The test fails, because the check no longer refuses the intro picture.
- `compare-a1.log` runs both checks on this checkout's real plans. `HEAD`'s check reports 164 problems and the new one 153. The 11 removed are all Demo or Teach frames, in seven plans, and none were added. `2026-10-08-authored-review` and `2026-10-12-link-upsert-edges` now pass.
- `lint-task-a1.log` shows `pnpm lint:task` clean on both script files, with no edits.

Limits. The check never reads the frame file, so a mistyped frame path passes and the page shows the path. Checking it would make a local run differ from CI, which has no run folder. The check matches `## Demo` and `## Teach` exactly, while the page tool ignores case, so a lowercase heading still fails. `pnpm check review-ledger` still exits 1 for the six plans under Open work.

Counts, for the 16 items on the run's todo list: 12 done, 4 skipped, 0 partial, 0 blocked, 0 open. Three skips are bug-fix playbook steps. The design fan-out and delegation step does not apply, because the fix sits in one call site of one module and the lead writes the code here. The commit staging and PR steps wait on the owner, who owns commits on `next`. The fourth skip is the decision-trail review, which this project-owned check with no decision log does not trigger.

Nothing was reversed. One finding changed the fix. The first version also passed pictures above the first Demo step, which the page never shows. The comment review caught it, and the check and the test now cover it. On the same review's advice, the name `inlinedFrames` replaced the code comment.
