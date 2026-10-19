# Verify: one hand drive in a real browser

Status: executed; the trail review's race finding continues in docs/plans/2026-10-14-hand-drive-freshness.md
Topic: correct
Playbook: feature

The owner asked, after the lint run: "ok so would you /pstack:correct our /verify to always include browser (or chrome, pick best?) testing when relevant, even if covered by playwright ? as a one time test by agent to double check. and any drift found from there would be translated into a test ? what would you steal from https://github.com/tester-army/e2e/tree/main/skills/create-verification-skill ?" It followed the correction "yeah but there can be drifts from playwright no ? dont we need to double check with browser yourself ??"

## Brief

### What will change?

When a change shows in a browser, the agent opens it once in a real browser, even when Playwright passes. A helper picks the pages, widths and themes. Each problem found gets a test that fails on old code.

### What could go wrong?

Nothing checks that the agent looked at its screenshots or which browser opened a page. The stop check misses edits outside the agent's edit tools. Review cut the screenshot tie and the problem-log check, and the Close lists the gaps.

## Teach

Today verify proves a browser change mostly with Playwright specs, and a spec checks only what it asserts. In the lint run, eight green specs missed a page that scrolled sideways on a phone.

Now the www dev server writes down each page visit: the width, the theme, how wide the docs preview was, whether a robot drove it, and which code it served. A helper lists every page that shows the changed files, at phone and desktop widths, light and dark, plus the docs preview at its narrowest. A page counts as checked once a real browser page reported that state from the current code.

A visit goes stale when the code changes after it. In both agent apps, a stop check won't let a turn end while a page the change touches has no such visit. Looking at the screenshots is still the agent's job, and a problem it finds closes only with a test that failed on the old code.

## Main changes

- `apps/www/src/lib/docs-routes.ts` owns the rule that turns a docs source path into its URL and the rule that names a registry example's docs page. `apps/www/scripts/check-docs-source-parity.mts`, `apps/www/src/app/(app)/docs/[[...slug]]/doc-page.tsx` and the hand-drive helper import it instead of each keeping a copy.
- When www runs with `PLATE_WWW_DRIVE_DIR`, the root layout records `HEAD` and the blob of each dirty file under `apps`, `config`, `content` and `packages` when it renders a document (`apps/www/src/lib/drive-tree.ts`), and mounts a client beacon carrying that record's id. The beacon posts each visit with `navigator.sendBeacon` to `POST /api/dev/drive`, which appends it to `<dir>/visits.jsonl`: path, window width, painted theme, each docs preview's name and width, page errors with a rendered Not Found, whether the page sits in a frame, `navigator.webdriver` and the time the page sent it. Without the variable the layout mounts no beacon and the route answers 404.
- `tooling/scripts/hand-drive.mjs` derives the cells a change needs from `apps/www/src/__registry__/registry-metadata.json`, the `ComponentPreview` nodes in `content/docs/**/*.mdx`, the registry docs fallbacks and the Plite example loaders. It records a route for a file no owner maps (`route`) and judges the drive (`check`): a cell is covered by its page's latest top-level visit at that width and theme, not driven by webdriver, from the current bytes. The approved design also bound each screenshot to a marked visit (`shot`) and refused a `fixed` drift row without its red-run log; diff panel round 2 removed both, as the Close says.
- `hand-drive.mjs --hook` runs as a Stop hook in `.claude/settings.json` and `.codex/hooks.json`. It reads the files the session edited from Claude Code's Edit and Write calls and from the `FileChange` items Codex records for applied patches, and refuses to stop while a browser-visible one has open cells, unless background work is still running or the owner wrote "skip drive".
- `verify` gains a Hand drive section and a `references/hand-drive.md` reference, drops its fallback to Playwright-only proof when the interactive browser cannot deliver an input, and the Build and Bug-fix playbooks add a Hand drive row to Completion Gates.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which browser drives | The app's built-in browser; your Chrome only for checks about Chrome, a profile, an extension, the clipboard, a download or printing | Your own Chrome every time | chrome first | small |
| Where the visit record comes from | The www dev server writes down each visit itself, so the agent can't claim a width or theme the page never reported (look) | The agent labels each screenshot | agent labels | big |
| What each page gets | Phone and desktop in light, dark on the main page at both widths, the docs preview at its narrowest, Chinese pages at desktop | Every page at both widths in both themes | full matrix | small |
| How hard the stop check pushes | It refuses once per stop, skips while background work runs, and only you saying skip drive turns it off (look) | A reminder that never refuses | remind only | big |
| A file that reaches many pages | More than six pages from one file get a load check each, with screenshots only for its own pages | Screenshots on every page | shoot all | detail |
| The shared plan close tool | For now a row in the plan's close checklist runs the check; changing the shared close tool waits for a pstack update | Change the shared close tool in this run | close tool now | small |
| How a stale visit is proven | The drive's own fix for a problem it found made the real lint visits stale on the current code (look) | Replay an old screenshot on an older copy of the code, then make the next edit there | replay round 4 | detail |
| Proof before adopting the verify text | Compare old and new verify text on fresh Opus sessions with a request that only asks for a check plan (look) | Adopt with routing proof only | skip trial | detail |
| How a page counts as checked | A real browser page reported that width and theme from the current code; reading the screenshot is the agent's job (look) | Tie each screenshot to the visit it shows | tie shots | big |
| How a problem found closes | The verify text asks for a test that failed on the old code, and the check no longer reads problem rows (look) | The check refuses a fixed problem without its failing run | check problems | small |
| When the record can be wrong | Two rare cases go in Limits: a config file the server reads only at start, and a reload at the exact moment of an edit (look) | Drive a frozen copy of the code on its own server | frozen server | detail |
| What a visit proves | Some real browser reported that state, maybe a tab in the background, so the agent keeps one tab open (look) | Count only tabs in front, which the app's browser reports as hidden while its pane is closed | front tabs only | small |
| How much the trial must show | Adopt the new text on one request, three sessions per side and one grader, since it scored higher, though the key undercounted one old plan's manual browser pass (look) | Run more requests with a second grader before adopting | rerun trial | detail |

## Steps

- [x] 1. Move the docs route rules into `apps/www/src/lib/docs-routes.ts`: `sourcePathToDocsRoute` from `check-docs-source-parity.mts` and the example-slug rule from `doc-page.tsx`, and import them in both. Proof: the docs source parity check and the www typecheck pass, and `git grep` finds no other copy of either rule.
- [x] 2. Add the visit record: the client beacon, `POST /api/dev/drive`, a `data-preview-panel` attribute on the docs preview panel, and the mount in the root layout behind `PLATE_WWW_DRIVE_DIR`. Proof: on a dev server with the variable, visits at 375 and 1,280 px in light and dark on `/docs/lint` land in `visits.jsonl` with the painted theme and the preview width; without it the route answers 404 and the page has no beacon.
- [x] 3. Write `tooling/scripts/hand-drive.mjs` with `scope`, `shot`, `route` and `check`, and its tests in `tooling/scripts/hand-drive.test.mjs`. Proof: the tests pass, and each fails when its rule is removed; `scope` on the lint files at frozen commit `d037961ed07d7781` lists `/docs/examples/lint` and `/docs/components/lint`, the two pages the lint drive skipped.
  Deviation: diff panel round 2 removed `shot`, so the script has `scope`, `route` and `check`; its 30 tests pass in `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/final-tests-a1.log`.
- [x] 4. Add `hand-drive.mjs --hook` as a Stop hook in both runtimes. Proof: tests over Claude Code and Codex transcript fixtures; a live Claude Code session in a scratch worktree that edits a demo and stops gets refused with the open cells; the same for Codex, or a partial row naming what blocked it.
  Deviation: current Codex records applied patches as `FileChange` items, so the reader moved to them in diff panel round 2. A real 2026-10-13 rollout, its repository prefix moved to this checkout, blocks on its 4 package source files in `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/panel3-codex-rollout-replay-a2.log`, where round 2's reviewed script let the stop through (`docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/panel3-codex-rollout-replay-frozen-a1.log`).
- [x] 5. Write the verify Hand drive section and `references/hand-drive.md`, drop the Playwright-only fallback, add the Completion Gates row to the Build and Bug-fix playbooks, add the rules table row, then `pnpm run prepare` and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`. Proof: both commands pass and the generated skill holds the section.
- [x] 6. Prove the check on the lint run's real mistakes with a live drive in the built-in browser: screenshots of the lint pages go stale once a later edit to the demo lands, a Playwright run of the lint spec leaves those cells uncovered, and a full drive of the current lint pages passes. Proof: one `check` log per case under the run directory.
  Deviation: with the screenshot tie gone, the stale and webdriver cases are the tests "check calls a visit stale once a file it covers changes after it" and "check does not count a webdriver visit as a hand drive" in `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/final-tests-a1.log`, and the final drive check is the Hand drive gate below, `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/hand-drive-gate-a1.log`.
- [x] 7. Run the trial: fresh Opus sessions in a worktree with the old verify text and one with the new text get the same plain request for a check plan on a demo change; a separate agent writes the key and a blind grader scores both sets. Proof: the grader's scores and the transcripts' file reads.
  `docs/plans/artifacts/2026-10-13-verify-hand-drive/trial/grades.md`, with the file reads in the step-7 row of the decision log: the new text averaged 18.8 of 24 against 17.2, and every new plan scored full on driving a real browser itself and on failing-first tests; the new plans lost on tablet width, dark beyond the main page and the playground, which `hand-drive.md` step 2 now asks for.

## Open work

- `apps/www/src/lib/drive-tree.ts` runs git synchronously on each document render and on each beacon post while the drive server runs. owner: zbeyens. stop: the drive server feels slow, or the next change to `drive-tree.ts`. Tracked in `docs/plans/topics/correct.md` Open work.
- Codex runs `.codex/hooks.json`'s new Stop hook only after the owner trusts it in Codex `/hooks`; until then no live Codex stop has been refused, and step 4's Codex half rests on the rollout replay. owner: zbeyens. stop: the first Codex session in this checkout after the trust, whose first refused stop closes it. Tracked in `docs/plans/topics/correct.md` Open work.
- A component that sits inside another demo's value, such as a callout in the playground value, gets only a load check on that page, because `scope` reads no demo values. owner: zbeyens. stop: a drift found on such a page, or 2026-11-14. Tracked in `docs/plans/topics/correct.md` Open work.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Hand drive | yes | `node tooling/scripts/hand-drive.mjs check` on this plan's www edits, through `proof.mjs` | `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/hand-drive-gate-a1.log`: hand drive done, after the lint fix |
| Writing passes | yes | `deslop` and `no-comments` on code; `unslop` on the verify text, playbooks and plan | four `writing` rows in the decision log, one per build and per panel round |
| Diff panel | yes | A panel on the diff, since this adds a check and a hook | three rounds, `docs/plans/artifacts/2026-10-13-verify-hand-drive/panel-1`, `panel-2` and `panel-3`, the last under the cap |
| Last lint fix | yes | `pnpm lint:task` on the task's code files | `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/lint-task-a2.log`: 0 errors |
| Decision-trail review | yes | A codex seat reads the log against the transcript | `docs/plans/artifacts/2026-10-13-verify-hand-drive/trail/answer-sol.md`: 2 critical, 5 warnings and 1 nit, settled in the Close; the race critical moves to the next iteration |

## Close

Paths below are relative to `docs/plans/artifacts/2026-10-13-verify-hand-drive/`.

Reversals first.

- Diff panel round 2 removed the screenshot tie. The approved design bound each screenshot to a visit the page marked (`shot` and `window.__drive.mark()`). All three seats showed that a mark still binds a screenshot taken after a client navigation, a reload or in another tab. That was the tie's second patch, so under the panel rule it left. A cell is now covered by a visit alone, and reading the screenshot is the agent's job, which nothing checks.
- Round 2 also removed the drift check. `check --log` refused a `fixed` drift row without its red-run log. Astra showed that `proof-worktree`'s marker prints for a passing named test when another test fails, and Sol showed that a title sitting in a comment passed. Drift closure is now rule-only. The Drift section of `hand-drive.md` asks for the red run and its failing line.
- Round 2 replaced the Codex reader. It read `apply_patch` call text, but current Codex records an applied patch as a `FileChange` item, so it reads those now. A real 2026-10-13 rollout replayed onto this checkout blocks on its 4 package source files (`logs/panel3-codex-rollout-replay-a2.log`), where the round 2 script let the stop through (`logs/panel3-codex-rollout-replay-frozen-a1.log`).
- Step 6's proof changed with the tie. The stale and webdriver cases are unit tests, and the final drive is the Hand drive gate.
- Round 3 changed two claims instead of code, at the round cap. A background tab can post a visit, so a covered cell proves that some real top-level page reported that state, not that the agent's tab showed it. The Stop hook sees only the session's own edit tools and Codex `FileChange` items, so edits made through the shell, a subagent or a Codex worker go unseen.
- Round 3 reverted round 2's `scripts/` exclusion. A registry build script is unmapped again, and the agent reruns `build:registry` and restarts `www-drive` before it drives.
- Round 2 dismissed two critical findings about the served-tree record as rare and recoverable. A file that `next.config.ts` imports needs a server restart, and a reload at the instant of an edit can run the old module. Round 3 seats showed that the counts behind it covered only Claude tool calls, and the decision-trail review then showed that the race dismissal does not hold at all, as the trail review part below says. The `next.config.ts` dismissal stands.

What landed is in Main changes above: the docs route rules in one module, the dev-server visit record, `hand-drive.mjs` with `scope`, `route`, `check` and `--hook`, the Stop hook in both runtimes, and verify's Hand drive section with its reference and the Completion Gates rows.

Proof, each from its row's scope.

- The Hand drive gate ran `check` on this plan's www files and the lint spec after the lint fix. It printed hand drive done, with 18 cells covered and no file unmapped (`logs/hand-drive-gate-a1.log`). The lead drove the six cells the lint fix turned stale again in the built-in browser and read each screenshot (`final-drive/`). At 375 px both lint pages scroll no wider than the window.
- 30 tests pass (`logs/final-tests-a1.log`). Each round's fixes failed on the frozen script before them (`logs/panel2-tests-on-frozen-a1.log`, `logs/panel3-tests-on-frozen-a1.log`), and the round 3 guards each fail on their mutant (`logs/panel3-mutants-a1.log`).
- A fresh headless Claude Code session in a worktree edited `controlled.mdx`, and its first stop was refused with 4 open cells (`logs/step4-live-claude-a1.jsonl`). No live Codex stop has been refused yet, as Open work says.
- The drive found drift-1, where `/cn/docs/lint` showed the English demo text. Its spec case failed first with "Expected 检查, Received Linting" (`logs/drift-1-red-runner-a3.log`), and after the fix the lint spec passed 10 of 10 on Chromium (`logs/drift-1-green-lint-spec-a1.log`).
- The trial gave one request for a check plan to three fresh Opus sessions per side, with one key and one blind grader. The new text averaged 18.8 of 24 against 17.2. Every new plan scored full on the agent driving a real browser itself and on failing-first tests, and every old one half (`trial/grades.md`). One old plan did add a manual browser pass after its scripted matrix, the arrangement you asked for, and the key gave it half as an extra, so part of that gap is the key's. The new side ran the round 2 text, before the later cuts and wording changes. The new plans lost on tablet width, dark mode beyond the main page and the playground. `hand-drive.md` step 2 now asks for those, and that edit had no second trial.
- `pnpm run prepare` and `sync-resources --check` are exact, the docs parity check passes, and lint reports 0 errors (`logs/final-parity-a1.log`, `logs/lint-task-a2.log`). The www typecheck's one error is in `packages/platejs/src/migrations/migratePlateV54Suggestions.internal.ts`, another session's file (`logs/final-www-tsc-a1.log`).

Limits. Nothing checks that the agent read its screenshots, which browser posted a visit, or that a drift closed with a red run. The hook misses edits made outside the session's own edit tools. The record can be wrong for a file `next.config.ts` imports until a restart, for a render that starts within about 250 ms of an edit until the next iteration lands, and for data cached across reloads. The drive server serves www only, so a Plite page keeps its own proof.

The close counts 12 items, the 7 steps and the 5 gates. 10 are done, 2 partial, 0 skipped, 0 blocked and 0 open. Step 4 is partial because no live Codex stop was refused. Step 7 is partial on its small sample and accepted under the Defaults row "How much the trial must show".

What tester-army's `create-verification-skill` gave. Verify already had its Launch, Doctor, Drive, Evidence and Cleanup sections from pstack's port of that skill. This run took three more of its ideas:

- A proof that drives one convenient entry point is incomplete when other entry points exist. `scope` lists every page that shows a changed file, from the registry, the docs previews and the Plite loaders, and the Stop hook refuses while any cell is open.
- A finding counts once a test fails on it. Each drift closes with a test that fails on the old code.
- A verification skill that never ran is a draft. The hook ran live in Claude Code, the check ran on the lint run's real mistakes, and the text ran in a trial against the old one.

It left five:

- The hand-written feature map, because verify derives its inventory from existing owners and forbids a second map that can drift.
- The e2e runner, its MCP driver, `e2e explore` and the `.e2e/` folder, because Playwright specs and the built-in browser already own proof here, and verify forbids a parallel driver.
- Bug-bash charters and personas, because the ask is one check of a change, not open exploration of a feature.
- Preferring a production build, because the drive must see live edits on the dev server.
- The `.claude/skills` symlink, because `pnpm run prepare` already syncs skills.

The decision-trail review, gpt-6.1-sol at xhigh effort on the frozen log, found 2 critical findings, 5 warnings and 1 nit (`trail/answer-sol.md`).

- Critical: the drive found that a preview dragged narrower and released off its handle kept its old width in the visit record, and the fix closed without a test that failed first. `apps/www/src/components/drive-beacon.spec.tsx` now fails with "Expected: 375, Received: 1280" when the panel observation is removed (`trail/mutate/panel-resize-unobserved-a1.log`), and passes on the fix.
- Critical: round 2's dismissal of the render race does not hold. Rerun at 20 samples per delay, the page's record named bytes the page did not run in 6 of 20 renders at 0 ms, 12 of 20 at 50 and 100 ms, 3 of 20 at 150 ms and 0 of 20 at 250 ms (`logs/trail-race-window-a1.log`), and 19 of 187 real edit-then-load pairs came within 500 ms. The served-tree record had its one replacement in round 1, so under the panel rule it leaves the loop, and the next plan iteration replaces how freshness is decided.
- Warnings: the Teach and two Defaults rows still said a browser showed each state, now reworded to what a visit proves. The Close and the tester-army comparison were written after the reviewer's freeze. The www typecheck's error is attributed to another session's file without a base control, which the next iteration's final checks run. The trial's key gave one old plan half credit for a manual browser pass after its scripted matrix, the arrangement the owner asked for, now stated in the trial bullet. Row 33 left out the malformed-record half of an Opus round 1 finding, now logged as applied.
- Nit: rows 56 and 57 gave their run time as 23:3xZ; a corrected row gives each log's write time.

Open work is listed above, three items, each tracked in `docs/plans/topics/correct.md`.

### Attention

reviewed by gpt-6.1-sol
Prioritize the missing beacon regression and the unsupported race dismissal.
The final browser drive did happen after lint; the visit gate alone proves less.
Complete the tester-army comparison and correct the trial's scoring claim.
