---
review_scopes: [proof]
review_basis: []
work_kind: workflow
review_commit: b1e70bb257d7a33c3a2f6160759a8ecb79e44500
review_inputs: [docs/plans/topics/proof.md, .agents/rules/verify.mdc, .agents/rules/verify/references/hand-drive.md, .agents/rules/verify/references/editor-proof.md, .agents/playbooks/bug-fix.md, .agents/playbooks/plan.md, .agents/playbooks/references/workflow-change.md, .agents/rules/maintainer/references/issue-draft.md, tooling/scripts/knowledge/knowledge.mjs, tooling/scripts/check.mjs, tooling/scripts/ci-workflow.test.mjs, tooling/scripts/hand-drive.mjs, tooling/scripts/proof-worktree.mjs, apps/www/playwright.config.ts, apps/www/src/app/(app)/docs/[[...slug]]/doc-page.tsx, apps/www/src/components/component-installation.tsx, apps/www/src/app/(app)/examples/plite/plite-example-registry.ts, docs/research/probes/2026-10-15-regression-sweep/REPORT.md, docs/research/raw/2026-10-15-regression-sweep/census/census-a.tsv, docs/research/raw/2026-10-15-regression-sweep/census/census-b.tsv, docs/research/raw/2026-10-15-regression-sweep/trial/, docs/research/raw/2026-10-15-regression-sweep/lifecycle/, docs/research/raw/2026-10-15-regression-sweep/aim/, docs/research/raw/2026-10-15-regression-sweep/design/, docs/research/raw/2026-10-15-regression-sweep/design2/]
---

# Sweep: aim the team's hands-on beta pass at what tests missed

Status: building: round 1 is ready to run on live beta, without the planted-bug trial
Topic: proof
Playbook: plan

## Brief

### What will change?

Round 1 is ready: 117 beta pages split between natamox and Sin, each with a browser and a time limit, and 25 rechecks that cover every open beta bug. Twelve pages wait for their plugin's refactor.

### What could go wrong?

Round 1 skips the planted-bug trial, so we still do not know whether the six set moves beat free clicking. The page script always fails in WebKit, which warns about a header on the 45 pages with Plate Plus frames.

## Teach

A sweep is one round of hands-on testing. For each page, a tester opens beta next to the page it should match, such as the Slate example, records the screen and tests for a few minutes. Anything that differs from the reference is a possible bug, unless it is a feature only beta has.

We first tried writing checks ahead. In two trials, those lists held a past bug's exact steps in 1 of 60 tries; each bug needed a specific sequence nobody wrote down. So the tester picks each next action live. Six set moves, such as repeating an action at a second spot, wait for a later round's trial against free clicking; round 1 uses free clicking on every page.

Each find becomes an issue, then a fix with a test tagged by the issue. The issue stays on a recheck list until CI runs its test, so hand rechecks shrink as tests land.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a tester does on a page | A timed, recorded session beside the reference page; the tester picks each next action live. The page list and time per page start untested; they are the least we can add to today's clicking around (look) | Checklists written ahead | checklists | big |
| Six set moves | Untested for now; a later round's planted-bug trial decides whether they stay | Adopt them now; drop them now | moves now; no moves | big |
| When the trial runs | A later round, because no seeded preview came for round 1, so round 1 runs on live beta with free clicking on every page | Hold round 1 until a seeded preview exists | wait for preview | big |
| What the trial compares | Six set moves against free clicking, today's way of testing, with the same time per page | Add a third group of pages tested with written checklists, which leaves 4 old bugs per group | checklist arm | small |
| Who puts the old bugs back | You start that session, so natamox never sees which pages have them (look) | natamox's own session | natamox seeds | big |
| A sweep skill | None. The verify skill prepares each round from a short guide for the tester, because in trials the skill's own rules did no better on the tasks tried (look) | Build the thin sweep rule and playbook anyway | skill anyway | big |
| What aims the session | The six moves, each covering a kind of bug past fixes missed; no page gets its own list | Aim each page at its own past bugs | per-page aim | big |
| Plate pages in P2 | Every docs page with a live demo, the example pages no docs page shows, and the playground, next to the same page on platejs.org; about 83 pages | Only the docs example pages; every generated docs route | examples only; every route | big |
| Time per page | 8 minutes for a P1 or P2 page and 6 for P3 or P4, every round. This plan does not shrink it; a later plan decides from rounds 1 and 2 (look) | Halve the time on pages that stay clean | halve clean pages | big |
| Round size | One session for every page whose plugin's refactor has landed; about two and a half days with two testers in round 1; P6 starts only after the whole pass | Two tester days, with leftover pages waiting a round | two days | big |
| Pages of plugins still being refactored | Wait until natamox says the plugin is ready or its review closes, then join the round under way; 12 Plate pages wait in round 1 (look) | Test every page | every page | big |
| Open beta issues | Every open beta bug is a round 1 recheck, even on a held page; feature requests go to a verdict | Recheck only the issues this plan named | named issues | small |
| Browsers per page | One per round, staggered by page so each round covers Chrome, Safari, Firefox and the iPhone; each page sees all four in four rounds | Every browser every round | every browser | big |
| Order of work | Your order: test P1 to P5, then fix in that order, then test again | Fix P1 bugs before testing P2 | fix as found | big |
| Agent-run testing | A step further, after the hand rounds work, in a later plan | Agents run sessions from round one | agents first | big |
| Prepared checks | Only for known bugs: open issues, bugs our probe found, and each new find until CI runs its test | None | no rechecks | small |
| Browsers per recheck | Every browser and device, unless the issue names the ones where the bug shows | Only the browser where it was found | found browser | small |
| When a recheck stops | Once the fix's test runs in CI: a unit or integration test for every browser, a browser test only in the engines CI runs it in | Never; people rerun every recheck | keep all | small |
| A covering test that changes later | Its recheck comes back until the changed test fails, on the code before the fix, at the assertion that sees the bug | One hand run puts it away again | one hand run | small |
| New features on a P1 or P2 page | Their own P3 or P4 session on the same page, not a difference from the reference | Treat every difference as a find | every difference | small |
| When the sweep is done | A round gives every page its session, finds nothing new in P1 to P4, leaves no recheck blocked and no page unresolved, and every P5 gap has a verdict | No new finds is enough | finds only | small |
| Page errors | A script opens every docs and example page on beta in three browser engines each round; people check P1 pages on the iPhone | People open every page in every browser | by hand | small |
| Recording a failure | A one-line note at the recording's timestamp; after the round, an issue draft from the clip, rechecked on live beta first | Draft each find on the spot | draft on the spot | small |
| Gaps against other editors | Proposals that go through a verdict, not bug fixes | Treat each gap as a bug | gaps as bugs | small |
| Public issues | Drafts; natamox publishes each confirmed one before its fix, so its test can carry the issue number | Fix from the local draft | fix from draft | small |
| What beta is compared with | The live Slate and stable Plate sites | A pinned local Slate build | pinned slate | small |
| Who tests | natamox and Sin, each on a Mac and a real iPhone, splitting the pages by who fixed what recently; Android waits for a real Android phone | One tester; the Android emulator | one tester; emulator | small |
| Running Plate browser tests in CI | Added with the first fix whose test is a Plate browser test, inside the check every pull request runs, for the tests in one regressions folder | Add it now for the whole suite | gate now | small |
| The hidden Android page | Left to the Android device lane, not the hand rounds | Test it in P1 | android in P1 | detail |
| Fix sessions | One session per find, one at a time per set of files | Suggested-task cards | cards | detail |
| Videos | Session recordings stay on natamox's machine or on the issue, never in the repo | Store clips in the repo | store clips | detail |
| Page link | A new proof page, Evweke9u3BjCdc42mnonEk, because the earlier ones, Y6QsX8Ny4kbj1XG5XC3Pd1 and E6bAkaDFgx3iSEVtRV2oSH, now read as another account's and refuse updates | Keep trying the old pages | old page | detail |
| Plan review | Three models designed it twice, trials tested each part an agent can run, then three review rounds read it | Skip review | skip review | detail |
| Hand-built example pages | HTML Export and Server-Side join P2, because the plan pairs HTML Export with its stable page | Leave them out of P2 | registry examples only | small |
| Chinese pages in the page check | Check only Chinese pages that have their own text; the rest just show the English page, which is already checked. This is less than step 1.4 asked (look) | Open every Chinese address too | every chinese page | small |
| Pages renamed on platejs.org | Eight pairs set by hand, such as Find with Find Replace and Details with Toggle; five pages marked beta-only, such as Pagination and the Selection guide; the Demo example page stays unresolved, because main's source has it but platejs.org answers 404 (look) | Leave each one unresolved until you pair it | pair later | small |
| Two issue-draft checks | The main and next case is skipped, and the one-video case ran on a P1 recording instead of a P3 one, because both paths keep their old text and the Slate and one-video drafts passed (look) | Record a main and next pair and a P3 find, then run both | main pair check | small |
| The knowledge check in step 1.2 | Step 1.2 closes with the same failures as before, because that check was already failing before this work and another task owns fixing it (look) | Keep step 1.2 open until the knowledge check passes | kb green first | small |
| Who the tester guide names | The tester, so a second tester can follow it unchanged | Name natamox | name natamox | detail |
| Pages with no editor by design | Server-Side and the annotation anchors page load without waiting for an editor | Report them as missing an editor | flag editorless | detail |
| Docs app pages in the page check | The page check also opens the docs pages that have no doc file, in English and Chinese, and the old release pages. Of these, only a Chinese copy of a demo page waits for the editor to load | Open only the routes step 1.4 names | step routes only | detail |
| What a test hash covers | The test's exact text, so even reformatting it changes the hash, and its recheck stays on the list until someone checks the test again | Ignore whitespace, which also hid a changed expected string | ignore whitespace | detail |

## Changed since the last page

Steps 1.1 to 1.5 landed on `next`. You skipped the planted-bug trial, so round 1 runs on live beta with free clicking on every page, and the six moves wait for a later round.

Round 1's plan, `docs/plans/2026-10-19-sweep-r1.md`, gives 117 pages a tester, a browser and a time limit; the Sessions page, https://claude.ai/artifact/SuEuEtP6c7fyirnCGKSwh5, shows its table with filters. It tests only plugins whose refactor has landed, so 12 Plate pages wait: AI, Copilot, Combobox, Date, Discussion, Find, Suggestion, Version History and four Markdown pages. The styles and toc refactors landed on 2026-10-19, so the mark pages and the table of contents run. Sin now tests beside natamox, and the round takes about two and a half days.

Its 25 rechecks cover every open beta bug, 14 of them filed on 2026-10-19, even when the bug sits on a held page, plus the open issues this plan named and the probe finds. The four open beta feature requests go to a verdict instead.

Before that, round 5's panel asked for trials of the round bookkeeping and the card-picking section, and both ran. The bookkeeping trial tied, so the sweep rule, its playbook and the card status script are gone. The picking trial caught 0 of 12 bugs either way, and across both picking trials the checklists held a past bug's exact steps in 1 of 60 tries. So a second design round replaced checklists with timed sessions where the tester picks each action live.

## What other editors do

The subject's table compares input drivers and stays current. This table adds how each editor keeps a found regression from coming back, read from local clones on 2026-10-15 with `git ls-files`; nothing was run.

| Editor | Where a found regression goes | Who checks it again |
| --- | --- | --- |
| CKEditor 5 `14e73cc31b` | 359 manual test pages under `tests/manual/`, each a `.md` of human steps beside a runnable page; 49 of them sit under `tests/manual/tickets/<issue>/` | a person, by hand, forever |
| Lexical `dd5c41b13` | 29 Playwright specs under `packages/lexical-playground/__tests__/regression/`, each named by its issue number | CI |
| Slate `945a484df` | 23 Playwright specs under `playwright/integration/`, one per example, not per issue | CI |
| Plate today | a test at whatever layer the fixer picked; 26 test files carry 112 law tags, no test carries a `[plate#N]` tag, and some titles name an issue in prose, such as `Issue 5127` in `apps/www/tests/browser/comment.spec.ts:495` | CI for unit tests and Plite browser tests; nobody for the www browser suite |

Plate keeps CKEditor's written human steps only for known bugs. Like Lexical, it ends each regression in a test named by its issue, with Plate browser regressions in one folder CI runs. A recheck names the test that replaces it, so the human list shrinks instead of growing forever as CKEditor's does.

## Layer and owner

| Delta | Current capability | Layer | Package | Why |
| --- | --- | --- | --- | --- |
| added | Sweep rounds | workflow | one plan per round, `docs/plans/<date>-sweep-r<N>.md`, written with `verify` | Holds the round's sessions, rechecks and results; no new rule or playbook |
| added | Tester pass | knowledge | `.agents/rules/verify/references/tester-pass.md`, linked from `verify.mdc` | The session, the six moves, the find note, the browser rotation, rechecks and how to prepare round N, in one home |
| added | Test source hash | proof tooling | `tooling/scripts/knowledge/knowledge.mjs`, printed by `pnpm kb` | A recheck records its test's hash, so a changed test brings the recheck back |
| added | Page list and page health | proof tooling | `tooling/scripts/page-health.mjs` | Lists the round's session pages, and opens every deployed docs and example route in three engines |
| added | Plate browser test gate | proof tooling | a lane in `tooling/scripts/check.mjs` over `apps/www/tests/browser/regressions/` | A recheck whose test is a www browser spec can leave the hand list |

## Native behavior and proof

| Delta | Behavior | Current evidence | Limit |
| --- | --- | --- | --- |
| added | Native drag image | Playwright intercepts drags; `791a53f92c` shipped an opaque drag box while the drag spec passed 105 of 105 in Firefox | Its recheck stays human until a real OS drag capture exists |
| added | Selection paint after a toolbar action | `088a82c84c` claimed a 5 of 5 pixel proof for #5091; the reporter still saw a second, darker selection layer | The width-only pixel check accepted two layers |
| added | Focus after a floating-toolbar click | #5085's proof covered Bold only; Comment and Turn Into still failed | One control's proof was taken for its siblings |
| added | Popup first click from the reporter's state | `665b2bb598`: the browser proof started with focus on the page body and passed, while the reporter's heading selection failed | Proof started from a different state than the report |
| added | iPhone Bold toggle | The WebDriverAgent lane saw Bold close the keyboard in 4 of 4 real-iPhone runs while the simulator passed 3 of 3; filed as Slate #6022 (`docs/plans/2026-10-10-proof-android-review.md:116`) | A P1 regression only if Slate's richtext page keeps the keyboard on the same iPhone |
| added | Enter at the end of the forced-layout title | On beta, Enter adds no line and the next letter joins the title, in Chromium and WebKit; Slate adds a line. The Chromium sweep logged `Editor primary root cannot contain "title".` on that page | A P1 find from the probe, not yet hand-checked |
| added | Undo in eight Slate examples | On beta, Cmd+Z after a word delete in hovering-toolbar restored nothing in Chromium and WebKit; Slate restored it in WebKit. Source shows the same gap on eight pages: check-lists, hovering-toolbar, iframe, images, markdown-preview, search-highlighting, shadow-dom and tables wire no history in `apps/www/src/app/(app)/examples/plite/_examples/`, while each Slate original at `945a484df` uses `withHistory` (`docs/research/raw/2026-10-15-regression-sweep/design/undo-class-a1.log`). All three first-trial arms flagged it | A P1 class from the probe and source; only hovering-toolbar was run |
| added | Menus placed from the caret on an empty line | Beta puts the caret on a `<br>` with no rectangle, by design (`packages/plitejs/src/react/components/zero-width-string.tsx:27`), and #5149 and #5112 report menus at the page's top-left | A hypothesis for round 1's rechecks |
| added | Regression browser tests run | 44 of the 93 census fixes changed `apps/www/tests/browser` specs, which no CI job runs; for 10 of them that spec was the only changed test | A recheck whose only test is such a spec never leaves the hand list until step 2.1's lane runs it |
| added | A deployed page loads | `98bc0c0` passed all 22 Plite CI jobs, then the deployed `/view/plate-to-html` threw a schema error. Plite browser tests run on `apps/plite`'s proof route, not the deployed www page | `page-health.mjs` opens every deployed docs and example route each round; that check never retires |

## Main changes

- `.agents/rules/verify/references/tester-pass.md` holds the tester's session, the six moves as round 1's candidate, the find note, the browser rotation, the rechecks and how to prepare a round. `verify.mdc` links it, and `verify` prepares each round from it.
- `tooling/scripts/page-health.mjs --list` prints each round's session pages by priority from the example registry, the docs reader and the registry's example list. It asks platejs.org whether each P2 page has a twin at the same path, and its `STABLE_TWINS` and `BETA_ONLY` tables settle the pages that differ. Without a flag it opens every deployed docs and example route in Chromium, Firefox and WebKit and prints its page errors.
- The docs reader moves out of `hand-drive.mjs` into `tooling/scripts/docs-sources.mjs`, which both scripts import, so the page list and the hand drive read the same docs pages.
- `pnpm kb` prints each test's source hash beside its gate, from the parse it already makes.
- Maintainer's issue-draft takes a Slate, stable Plate or other-editor recording as the baseline of a two-video report and labels it by its source, instead of assuming `main` and `next`.
- The project Bug fix playbook puts a sweep find's test at the lowest layer that sees it, tags it with the published issue as `[plate#N]`, writes the test and its hash on the find's recheck, and puts a Plate browser test in `apps/www/tests/browser/regressions/`.
- `tooling/scripts/check.mjs` gains a lane that runs that folder in Chromium against a dev-source www server, added with the first fix that needs it.

## Outcome

The owner's priorities, quoted from the team chat:

> P1: slate regressions. P2: plate regressions. P3: new plite examples bugs. P4: new plate examples bugs. P5: gaps against other standard editors. P6: start fixing one by one with agents, then repeat P1-P5 testing.

On test layers, the owner said unit and integration tests catch most bugs and browser tests catch a few, such as cursor drift; manual testing finds the rest, "each bug means the test is missing or wrong", and the target is zero manual testing over time. In this session the owner added that "the main workflow is to ease the full human testing P1-P6, agent testing is a step further".

When this plan is done:

- Round 1 gives every P1 to P5 page whose plugin's refactor has landed one session, in about two and a half days with two testers, then P6 fixes its finds in that order. A later round's planted-bug trial decides whether the six moves stay.
- Later rounds repeat until one gives every page its session and finds nothing new in P1 to P4, or until 2026-12-15, when the open work hands off.
- Every find a test can see gets a fix and a test tagged with its issue, which failed before the fix. CI runs it where a gate covers its browser. A test for a Safari-only find runs only when someone starts it, so its recheck stays human.
- A find only a person can see is fixed and keeps its recheck.
- Hand rechecks shrink as tests land. Session time per page stays the same in this plan.
- natamox owns the build. Agent-run sessions are a later plan.

Two of your asks stay partly unmet, and the plan says so on its page. There is no verdict-style skill, because its rules did no better than `verify` on the two tasks the trials tried; neither trial showed they add nothing elsewhere. The round loop lives in `tester-pass.md` instead. And nothing yet shows that sessions find more than today's clicking around or that discovery time can shrink safely; a later round tests the moves, and a later plan decides on shrinking from rounds 1 and 2.

Out of scope: a sweep skill, checklists written ahead, shrinking session time, agent-run testing, the comparison script, the test-helper focus change, a check for untested rules, interaction rule files, natamox's generated book, YAML case files, an edit-time reminder hook, and splitting the behavior spec.

## Where our proof is blind

Four read-only Codex lanes read every non-merge `fix` commit on `next` from 2026-08-15 to 2026-10-15 that touched product code or tests (105 commits, 93 behavioral after dropping lint and build fixes), the regression plans, the plate notes and the `udecode/plate` issues opened since 2026-08-01. Their tables, summaries and prompts are in `docs/research/raw/2026-10-15-regression-sweep/`, and the probe is in `docs/research/probes/2026-10-15-regression-sweep/`, whose `REPORT.md` maps both. Kinds of miss are the readers' judgment, counted per commit. The census does not establish how many of the 93 reached beta users, or had a passing test before the fix.

- 62 of the 93 fixes could have been caught without a real browser, 17 could not and 14 are unclear (inferred).
- 65 of the 93 commits do not say who or what found the bug; of the rest, 11 came from owner reports, 8 from public issues, 4 from videos, 4 from CI and 2 from agent reviews (observed).
- 44 changed `apps/www/tests/browser` specs, which no CI job runs; for 10 of them that spec was the only changed test (observed with `census/tally.py`).
- Most fixes sit in Plate features that the Slate examples lack. The census `area` column puts selection (9), details (7), suggestion selection (5) and list (3) at the top, so P2 covers the plugin demos and the playground, not only the docs example pages.

The trial's `misses.md` groups 88 of the 93 fixes into ten kinds: focus and first click in popups and toolbars (14), caret and selection paint (10), native keys (10), layout that moves during a gesture (10), features used together (24), demo wiring and deploy (8), drag and drop (3), clipboard and paste (4), input methods and mobile (2) and tests that pinned the bug (3). Each kind maps to one of the six moves in step 1.5. The open editing issues the lanes found are #5149, #5142, #5127, #5126, #5125, #5093 and #5088; round 1's rechecks start with them, the forced-layout Enter find, the eight-page undo class, the empty-line menu hypothesis and the iPhone Bold drift.

## Decisions

The job is to make the team's hands-on P1 to P5 pass cheap to prepare and aimed at where tests missed, to turn each find into a fix plus its missing test, and to shrink the pass as tests take over.

| Target | What it adds | Aims people at past misses? | Hand testing shrinks? | Verdict |
| --- | --- | --- | --- | --- |
| T0, today's flow | nothing; a tester clicks around, records a video, an agent fixes it | no | no; nothing names what a test replaced | the baseline of round 1's trial, with the same time boxes |
| T1, natamox's draft | YAML case files per area, a generated book with animated cards, an edit hook, a five-job skill, three checks, moving 224 rules | no; it records promises but never ranks where to look | for locked cases only | rejected: tooling before the first sweep and a second law format |
| T2, a full checklist | every Scenario Generator gesture on every page in every browser | no; 22 P1 pages times eleven gestures times five browsers is over a thousand checks | no | rejected: nobody runs a thousand checks twice |
| T3, agents first (an earlier page) | agents, phone lanes and a comparison script first; people for the rest | yes | yes | rejected by the owner: agent testing comes after the hand pass |
| T4, a section in `verify` | five aimed checks per page from the census summaries | yes | not by itself | rejected: 1 of 12 in the first trial and 0 of 12 in the picking trial |
| T5, the full sweep skill | a thin rule over a project playbook that picks cards by the miss table and keeps rounds | yes | yes | rejected: its picking lost the first trial and its bookkeeping tied `verify` in the second |
| T6, sweep bookkeeping with `verify` picking | T5's rounds, card files and card status script, with cards picked by `verify` | yes | yes | rejected: the bookkeeping trial scored it 18 of 18, the same as `verify` alone |
| T7, `verify` writes checklists each round | round plans with up to five cards per page, issue-tagged tests and a browser gate | yes | yes | rejected: `verify`'s cards held 0 of 24 held-out bugs across the two picking trials |
| T8, picked: timed sessions | a recorded session per page, the tester choosing each action live, six moves on trial, rechecks only for known bugs | yes, through the moves, if round 1's trial keeps them | rechecks, by the gated test each one names; session time not yet | picked by the second design round and trimmed by review round 6; its moves stay a candidate until round 1's trial |

**Design.** `architect` ran twice, each time with `claude-opus-5-5 @high`, `gpt-6-astra @xhigh` and `gpt-6.1-sol @xhigh` and a blind judge on Opus.

- **First round** (`docs/research/raw/2026-10-15-regression-sweep/design/`). All three runners reached a thin entry like `verdict`, a project playbook over pstack's `investigation`, scenarios per page aimed by the census, finds through issue-draft, P6 through Bug fix, and retirement once a gated test covers a scenario. The trials then removed its entry, playbook and scenario picking.
- **Second round** (`docs/research/raw/2026-10-15-regression-sweep/design2/`), on the finding that checklists held 1 of 60. All three runners replaced checklists with a timed, recorded session per page and kept exact checks only for known bugs. The judge scored Astra 16, Sol 15 and Opus 14 of 18. The plan takes Astra's sessions, Opus's six moves and Sol's first-visit budgets. It departs from the judge in three places: the trial's baseline is free clicking, today's flow, not checklists; one seeded build hides which pages hold planted bugs; and the method lives in its own `verify` reference, not in `hand-drive.md`, which every agent drive reads. Review round 6 then removed the time-halving rule and the rule that dropped clean pages, which no trial had tested.

Grafts from the first round that remain: issue-draft's two-video baseline fix (Astra); P3 covers hidden and experimental examples, whoever tags a test reads the find and tags only a test that checks all of it, and a deleted, skipped or ungated test puts its recheck back (Sol and Astra); a round starts on a beta build that holds every fix since the last round.

The lead ran the premises that existing code does something, instead of only reading them. `pnpm kb EDIT-CAPTION-NAV-003` lists both media-caption tests with their gate, `manual (chromium, firefox, webkit)`. In a throwaway worktree, a planted Plite browser test tagged `[plate#99991]` listed under `pnpm kb plate#99991` as `plite CI (chromium)`, a www browser spec tagged `[plate#99992]` listed as `manual (chromium, firefox, webkit)`, and an untagged id listed no test (`docs/research/raw/2026-10-15-regression-sweep/design/kb-issue-tag-a1.log`). So finding a recheck's test through the published issue's tag needs no change to the knowledge tool. `kb` gives every `pnpm check` runner no engines and Plite browser tests Chromium (`tooling/scripts/knowledge/knowledge.mjs:705-753`), so a unit test retires its recheck by layer, not by engine. The tool parses each test node with its location (`knowledge.mjs:632-645`), so a source hash needs no new parser. The P1 and P3 lists are literal arrays in `plite-example-registry.ts:3-90`: 23 upstream paths, of which `android-tests` is hidden, and 21 other examples. `hand-drive.mjs:68-110` reads every docs page's `<ComponentPreview>` names: 71 English docs pages show 68 distinct demos. `getRegistryStaticParams` in `doc-page.tsx:93-102` adds a route for each of 135 registry components and 82 examples; 14 of those examples appear on no docs page, two of them frames of other products, and a component route renders an editor only when the component has examples (`component-installation.tsx:146`). Issue-draft's two-video branch assumes `main` and `next` (`.agents/rules/maintainer/references/issue-draft.md:61-72`). `ci.yml` may gate only through `pnpm check` (`tooling/scripts/ci-workflow.test.mjs:80-94`), and `pnpm dev:plite` serves www with `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1` (`apps/www/package.json:19`), which the www browser specs run against (`apps/www/playwright.config.ts:51-55`). `tooling/scripts/proof-worktree.mjs` takes `--expect-fail <text>`, so a red run can name the assertion that must fail.

Challenge delta: improved. Round 5's findings brought the two trials, whose results removed the sweep skill and then checklists, and a second design round replaced checklists with timed sessions. Round 6, the last before the review cap, with all three seats, removed the untested time-halving and page-dropping rules, cut P2 from every generated route to the pages that show a demo, made round 1 cover every page before any fix, made the trial blind and balanced, and named the asks the plan leaves unmet.

## Skill trials

`.agents/playbooks/plan.md:15` runs a paired trial on the first working prototype before the plan's panel, and `.agents/playbooks/references/workflow-change.md:7` keeps the answer key from the lead until grading ends. Each trial's frozen files, arm prompts and answers, blind copies, grade, label map, key and transcript check are in `docs/research/raw/2026-10-15-regression-sweep/`, under `trial/`, `lifecycle/` and `aim/`. Every arm ran once in a fresh session on `claude-opus-5-5 @high`, so only its instructions differed, and every grader was `gpt-6-astra @xhigh`, blind to which arm was which. Each key came from a separate agent that the lead never read before grading.

| Trial | Question | Arms | Key | Result |
| --- | --- | --- | --- | --- |
| First | Which method writes the best checklist for the 22 P1 pages? | the sweep prototype's picking (A), `verify` alone (B), `verify` plus a five-line section aiming at the census's kinds of miss (C) | 12 bugs from Slate's own fix history on those pages | A 0, B 0, C 1 of 12 |
| Bookkeeping | Which method prepares round 2 best from round 1's record and a test index? | the sweep prototype's `round 2` mode (P), `verify` alone (V), `verify` plus a five-line section (S) | 16 checks with planted coverage changes, plus 2 pages | P, V and S each 18 of 18 |
| Picking | Does the aiming section help on 16 Plate docs pages? | `verify` alone (B), `verify` plus the section (C) | 12 bugs from `origin/main` fixes from 2025-06-01 to 2026-08-14 that the census never read | B 0, C 0 of 12 |

By each trial's keep rule, frozen before its arms ran, `verify` alone stayed every time.

- **What the checklists missed.** Each arm wrote a full checklist inside its 150 minutes. Across the 60 pairs of a checklist and a key bug, over 24 distinct bugs, one checklist held a bug's exact triggering steps. That measures what a written list reaches, not what a person following it would notice. Six of the pairs needed an Android keyboard, which the request left out, and the picking trial's arms could not open the live sites. The key bugs are specific sequences, such as marquee-selecting two paragraphs then typing, or reopening a block menu at a second spot. Every first-trial arm found one real beta gap the key did not hold: the eight examples with no undo history.
- **What the bookkeeping trial showed.** The key's index already stated, for each test, what it covers and whether its body changed since someone last read it against the check. Every arm decided correctly from those facts, though `verify` alone kept fewer browsers on three checks and still scored full points. So the tie supports keeping `verify` alone for that task. It does not show that written rules add nothing elsewhere. It also shows that someone must record those facts, so each recheck keeps its covering test and the test's source hash, and `pnpm kb` prints the hash. The arms' first runs could not open inputs outside their snapshot and were rerun with only the paths changed.

### Round 1's planted-bug trial

Round 1 skipped this trial, as step 1.6 records; it runs as written in the first round that has a seeded preview. Only a person can run a session, so this trial runs inside a round, after this review, as the When the trial runs default says. Both arms get the same time boxes, browser rotation and recording; the six moves are the only difference.

- **Seeding.** zbeyens starts a seeder session, so natamox never sees its branch or diff. The seeder draws past behavioral fixes for pages in the round: Plate fixes before 2026-08-15 for P2 to P4 pages, and for P1 pages, upstream Slate fixes or `packages/slate*` fixes on `next` before 2026-08-15. It leaves out every commit in the census, `trial/key.md` and `aim/key.md`. It plants each bug in one preview build of the round's beta commit, by reverting the fix when the revert applies and otherwise by putting the bug back by hand from the fix's diff, in one commit with a neutral message that stays off the shared remote. It keeps a plant only when the bug shows on the preview and not on the reference page or on the same beta commit without plants, and records the browsers where it shows. It stops at 12 such plants, in 6 pairs of the same kind of miss.
- **Arms.** Once it has chosen the plants, the seeder assigns one page of each pair to the moves and the other to free clicking at random, then splits every other page at random, balanced across P1 to P4. The round plan shows each page's arm, so natamox knows the method but not which pages hold a plant. The seeder seals the plant list and replies with only its path, the preview's address and the assignment.
- **Running.** natamox runs the whole round on the preview. Finds are drafted after the round ends, so no find is checked against live beta while sessions are still running.
- **Grading.** A separate blind grader, on the other model family from the seeder, matches each find note and draft to the sealed list. A plant counts as found when a note on its page describes its visible failure. A plant counts as a chance only when its page's session ran in a browser where the seeder saw it.
- **Keep rule**, frozen here before any seeding. Only a pair whose two plants were both chances counts, so each arm has the same number. The trial is inconclusive below 4 such pairs, and then it runs again in round 2 with fresh plants. The moves stay when, within those pairs, their pages find at least 3 plants and at least 2 more than the free pages. Otherwise free sessions stay, and the moves leave `tester-pass.md`. With 4 to 6 counted pairs and the same catch rate in both arms, this rule keeps useless moves 12 to 19 percent of the time; a wrongly kept move costs a few lines of guidance, which round 2's tally can catch.

## Steps

The execution playbook is Build (`.agents/playbooks/build.md`). natamox runs it, except step 1.6, which zbeyens starts. Each phase ends with a keep, revert or quarantine row in this plan's decision log. Load `verify` before running any proof below. Before editing an agent file, read `.agents/pstack/rules/reflect.md` (its Agent files rule) and `.agents/playbooks/references/workflow-change.md`.

### Phase 1. Build the round inputs and run round 1

- [x] 1.1 Fix issue-draft's two-video baseline. In `.agents/rules/maintainer/references/issue-draft.md:61-72`, two recordings are a baseline and a current beta bug; the baseline keeps its source label, `main`, Slate, stable Plate or another editor's name, and the one question asked when the evidence is ambiguous names those sources. A find with no reference page keeps issue-draft's one-video and text paths. Proof: a draft from a beta recording and a Slate recording of the forced-layout Enter find labels Slate as its baseline and asks no `main` or `next` question; a draft from a `main` and a `next` recording reads as before; a P3 draft from one video reads as before. Closed by `docs/plans/artifacts/2026-10-15-regression-sweep/build/trial/e-slate-pair.answer.md` and `docs/plans/artifacts/2026-10-15-regression-sweep/build/trial/g-one-video.answer.md`; the main and next case did not run, as the main pair check default says.
- [x] 1.2 Print each test's source hash. `tooling/scripts/knowledge/knowledge.mjs` hashes each test's own source from the parse it already makes (`knowledge.mjs:632-645`), and `pnpm kb <id>` prints the hash beside the test's gate. Proof: a knowledge test where editing one test's body changes its hash, while editing another test in the same file or a line outside both leaves it; `pnpm -s kb check` passes. Closed by `docs/plans/artifacts/2026-10-15-regression-sweep/build/mutate/hash-whole-file-a2.log` and `docs/plans/artifacts/2026-10-15-regression-sweep/build/mutate/hash-title-only-a2.log`; `docs/plans/artifacts/2026-10-15-regression-sweep/build/kb-check-a1.log` holds the same 18 findings, each printed twice, as `docs/plans/artifacts/2026-10-15-regression-sweep/build/kb-check-head-a1.log` at base, so the check still fails, as the kb green first default says.
- [x] 1.3 Tag sweep finds in Bug fix. Add one delta to `.agents/playbooks/bug-fix.md`. When the report is a sweep find, the test lands at the lowest layer that sees the bug, and its title carries the published issue's `[plate#N]` tag beside any `[EDIT-…]` tag. The fixer reads the issue first and tags only a test that checks all of it. Then it writes `covered-by:` on the find's recheck in the round's plan: the test's path, its title and the hash `pnpm kb plate#N` prints. A Plate browser test goes in `apps/www/tests/browser/regressions/`, which step 2.1's lane runs. Proof: `check-playbooks.mjs` passes with the delta's anchor, and the playbook text names the tag, the layer, the whole-issue rule, `covered-by` and the folder. Closed by `docs/plans/artifacts/2026-10-15-regression-sweep/build/check-playbooks-a1.log`.
- [x] 1.4 Write the page script. Closed by `docs/plans/artifacts/2026-10-15-regression-sweep/build/mutate/no-twin-counts-as-paired-a3.log`, `docs/plans/artifacts/2026-10-15-regression-sweep/build/page-health-planted-a2.log`, `docs/plans/artifacts/2026-10-15-regression-sweep/build/page-health-unplanted-a1.log` and `docs/plans/artifacts/2026-10-15-regression-sweep/pr/page-health-beta-a3.log`. `tooling/scripts/page-health.mjs --list` prints the round's session pages by priority:
  - P1 is every path in `UPSTREAM_PLITE_EXAMPLE_PATHS` that `HIDDEN_EXAMPLES` leaves out, 22 today, beside its Slate page; `android-tests` belongs to the Android device lane.
  - P2 is every English docs page that `readSources` in `tooling/scripts/docs-sources.mjs` finds with a `<ComponentPreview>`, every registry example that no such page shows except the frames of other products, and the playground, beside the same page on platejs.org; about 83 pages. Component routes are left out, because each one either shows no editor or repeats an example's demo. One table in the script holds the pairs whose names differ, such as `slate-to-html` and `html-export`.
  - P3 is every other registered Plite example, hidden and experimental ones included. P4 is a P2 page with no stable twin.
  - A page whose pairing is unsettled prints as unresolved and keeps the round open.

  With no flag, the script opens every docs and example route that `doc-page.tsx` and the example registry serve on beta, component routes included, in Chromium, Firefox and WebKit. It waits for the page to load, and for its editor only on a page that shows a demo, then prints each page error, rendered Not Found or failed status. Proof: tests over a fixture registry and docs tree put each session page in exactly one of P1 to P4 or unresolved, and leave a component route out of the session list but in the health run; a run against a local www server with one demo planted to throw on load reports that page alone; then one logged run against beta.
- [x] 1.5 Write the tester reference. Closed by `docs/plans/artifacts/2026-10-15-regression-sweep/build/sync-resources-a2.log`, `docs/plans/artifacts/2026-10-15-regression-sweep/build/trial/b-round2.grade.txt` and `docs/plans/artifacts/2026-10-15-regression-sweep/build/trial/c-next.answer.md`. Create `.agents/rules/verify/references/tester-pass.md` and link it from `.agents/rules/verify.mdc`. It says:
  - A session is one recorded, timed visit to one page and scope in one browser: 8 minutes for P1 and P2, 6 for P3 and P4. P1 and P2 sessions have the reference page beside beta and cover shared behavior; a paired page whose beta adds features gets a second session for them in P3 or P4. The tester builds state instead of resetting it, follows anything odd at once, and never clicks to repair focus.
  - The six moves, applied live to each control the tester finds: then-type (act, then type without clicking, Backspace, Enter, undo, type again); again-elsewhere (repeat at a second spot, after Escape and after undo); other-route (keyboard, toolbar, slash menu, block menu, the browser's own menus, native pickers, plain-text paste, paste from another app); edge-start (start at a block, cell or mark boundary, an empty block, or beside a void, table or image); inside-other (inside each other block type on the page, and in suggesting or read-only mode); moved-ground (scrolled, inside a scrolled container, in a narrow window, or with content taller than the screen). The tester watches the caret, selection paint, focus, where menus land and layout during each move. The moves map the census kinds: features used together to inside-other, focus and first click to then-type and again-elsewhere, native keys and clipboard to other-route, layout during a gesture to moved-ground, drag and drop to edge-start, and caret and selection paint to the watch list. The section says the moves are a candidate until round 1's trial.
  - Browsers take turns along Chrome, Safari, Firefox, iPhone. In round 1, the first page in the list starts in Chrome, the second in Safari, the third in Firefox, the fourth on the iPhone, and so on. Each later round moves every page one step along, so each round covers all four and each page sees all four in four rounds.
  - A find note is one line, `mm:ss browser: what differed`, written during the session. After the round, natamox rechecks each find on live beta, and an agent drafts each one that reproduces with issue-draft from the clip.
  - Rechecks hold only known bugs, each pointing at its issue, with its minutes, `covered-by`, and every browser and device unless the issue names the ones where the bug shows. A recheck leaves when its test is present, not skipped, gated at the bug's layer or above, with the same hash, and, for a browser-layer recheck, gated in every engine it names. A changed test keeps it due until `tooling/scripts/proof-worktree.mjs --expect-fail <the assertion's message>` shows the test failing at the fix's parent, and then the new hash is written.
  - Preparing round N: list the pages with `page-health.mjs --list`, give each page and scope its session and browser, carry every due recheck with `pnpm kb`'s output for its issue tag, and reserve, in order, setup and breaks, rechecks, find notes, the P5 session against other editors and the iPhone page checks on P1 pages. Every page gets its session before P6 starts, and the round plan says how many tester days that takes.
  - After a round: natamox drafts and publishes the finds; P6 fixes them one at a time, P1 first, through the Bug fix playbook; the next round starts once beta serves every fix. The sweep is done when a round gives every page and scope its session, finds no new P1 to P4 bug, leaves no recheck blocked and no page unresolved, and every P5 gap has a verdict. At the 2026-12-15 handoff, every open find, blocked recheck and unvisited or unresolved page moves to the proof subject's Open work.

  Run `pnpm run prepare`. Proof: `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` passes; a fresh session asked "prepare natamox's round 1 hands-on pass over the beta pages" loads `verify` and reads `tester-pass.md`, read from its transcript; one asked "prepare round 2 from <a fixture round 1 plan>" gives every page its session and browser by the rotation and carries each due recheck; one asked "round 1 of the sweep is done, what happens next?" names drafting the finds, P6 in priority order and waiting for a beta build with the fixes; one asked "diagnose: Enter at the end of the forced-layout title adds no line" loads the Bug fix playbook instead.
- [x] 1.6 Seed round 1's trial. Skipped: natamox confirmed on 2026-10-19 that no seeded preview is coming, so the trial is inconclusive and round 1 runs on live beta with free sessions on every page, as this step's fallback says. zbeyens starts a separate seeder session that does what Round 1's planted-bug trial says and replies with only the sealed list's path, the preview's address and the page assignment. How the preview deploys without the plants reaching the shared remote is the seeder's first task; when no private preview is possible, the trial is inconclusive and round 1 runs on live beta with free sessions on every page. owner: zbeyens. Proof: the sealed file's hash and the assignment file in the decision log before step 1.7; the preview serves every page `page-health.mjs --list` prints; the assignment covers each of those pages once.
- [x] 1.7 Write round 1's plan. Written as `docs/plans/2026-10-19-sweep-r1.md`, with no Arm column and only the plugin pages whose review is closed; its decision log names the check and the page counts. The round's lead writes `docs/plans/<date>-sweep-r1.md` under the Plan playbook, as `tester-pass.md` says. It holds a Sessions table (page, scope, priority, arm, browser, box, then minutes used, recording and find notes), the Rechecks (the open issues, the forced-layout Enter find, the eight-page undo class, the empty-line menu hypothesis, and the iPhone Bold drift after Slate's richtext page is checked on the same phone), the P5 areas and the schedule. #5142 goes straight to the fix list. Proof: `node .agents/pstack/plan-page.mjs <round plan> --check` passes; every page and scope `--list` and the scope rule give has one session row; the schedule adds up to the stated tester days with every reserve.
- [ ] 1.8 Run round 1 on live beta, since step 1.6 was skipped. The round's lead runs `page-health.mjs` against beta. natamox and Sin split the sessions, rechecks and P5 areas as the round plan says, natamox runs the iPhone page checks, and each runs their own sessions, recording the screen and writing find notes. After the round, natamox rechecks each find on live beta, and an agent drafts each one that reproduces with issue-draft, with the beta recording and, when the page has a reference, the reference recording. Proof: the script's log; every session row filled with minutes, recording and notes; every recheck marked pass, find or blocked with its browser and beta build.
- [x] 1.9 Grade round 1's trial before any fix starts. Skipped with step 1.6: there is no sealed list to grade, and the six moves stay a candidate. A separate blind grader matches every find note and draft to the sealed list. Then the round's lead opens the list and applies the keep rule. When the moves lose, remove them from `tester-pass.md` and run `pnpm run prepare`. Proof: the grader's answer, and one decision-log row with each arm's chances, finds and the verdict.
- [ ] 1.10 Fix round 1's finds, P1 first, then P2 to P4; P5 gaps go to `verdict` as proposals. natamox publishes each confirmed draft before its fix starts. The round's lead starts one session per find, one at a time per set of files, and each runs the Bug fix playbook with step 1.3's delta. A test that sees the defect runs red at the fix's parent with `tooling/scripts/proof-worktree.mjs --expect-fail`. Proof: each fix's red and green logs, or its recorded human check, in its own plan.
- [ ] 1.11 Phase 1 decision. Tally round 1's finds by priority, browser and move, finds per minute per page, and minutes against the schedule. Proof: one decision-log row with the tally.

### Phase 2. Close the gaps round 1 shows

- [ ] 2.1 Gate Plate browser tests, with the first fix whose test sits in `apps/www/tests/browser/regressions/`, in any round. Add a lane to `tooling/scripts/check.mjs`, which `ci.yml` runs through `pnpm check`. It starts the www dev server with `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1`, as `pnpm dev:plite` does, and runs every spec in that folder in Chromium, so later specs join with no edit. Teach `kb`'s runner map that the folder runs gated in Chromium. Proof: `tooling/scripts/ci-workflow.test.mjs` passes; a spec seeded to fail turns the check red and names only that spec, and removing the seed turns it green; `pnpm kb plate#N` lists the spec as gated in Chromium; the minutes the lane adds to `pnpm check` are logged. Until such a fix lands, this step stays open. owner: natamox. stop: the first such fix, or the 2026-12-15 handoff.
- [ ] 2.2 Phase 2 decision. Keep, quarantine or revert each change by its proof. Proof: one decision-log row per change.

### Phase 3. Later rounds

- [ ] 3.1 Prepare round 2 with `verify` and `tester-pass.md` once beta serves a build with every round 1 fix, on live beta unless the trial reruns. Proof: round 2's plan gives every page and scope its session in the rotation's next browser, lists each recheck that left with the test and gate it relied on, each recheck back with its reason, and the new pages.
- [ ] 3.2 Run and fix round 2 as steps 1.8 and 1.10 do. Proof: as those steps.
- [ ] 3.3 Repeat or hand off. A round that finds bugs or leaves a recheck blocked gets another round after its fixes. The sweep is done when a round gives every page and scope its session, finds no new P1 to P4 bug, leaves no recheck blocked and no page unresolved, and every P5 gap has a verdict. On 2026-12-15, every open find, blocked recheck, unvisited page and unresolved page moves to the proof subject's Open work with an owner and a stop, and the round loop stays in `tester-pass.md`. Proof: each round's tally row, and the handoff list.

## Proof

This plan builds nothing. What it claims rests on:

- the census lanes' tables, summaries and prompts in `docs/research/raw/2026-10-15-regression-sweep/`, written by `codex gpt-6.1-sol @medium`, with every SHA and plan line cited above checked by the lead at its source;
- the comparison probe in `docs/research/probes/2026-10-15-regression-sweep/probe/`, run headless in Chromium against the live sites on 2026-10-15, and the targeted reruns in its `confirm/` in Chromium and WebKit;
- both design rounds' groundings, briefs, candidates, judge verdicts and syntheses, and the premise logs, in `docs/research/raw/2026-10-15-regression-sweep/design/` and `design2/`;
- the three trials' frozen files, answers and grades in `docs/research/raw/2026-10-15-regression-sweep/trial/`, `lifecycle/` and `aim/`;
- panel rounds 1 to 3 on an earlier page, and rounds 4 to 6 on this page, in `docs/plans/artifacts/2026-10-15-regression-sweep/panel/`.

Each step names the proof that closes it. A phase's keep row cites those proofs, never this plan's numbers.

## Open work

Tracked here until phase 1 closes, then in the proof subject's Open work.

- Shrinking session time: a later plan decides, from rounds 1 and 2's finds per minute, whether clean pages get less time or leave the hand pass, with a planted-bug trial of its own. owner: zbeyens. stop: round 2's tally, or 2027-01-15.
- A private preview for the seeded build, so the plants never reach the shared remote. owner: zbeyens. stop: the first round that runs the planted-bug trial.
- Agent-run sessions: an agent applies the moves to the pages a browser can observe before people start. owner: zbeyens. stop: a plan that adds it after round 2, or 2027-01-15.
- A real OS drag-image capture, so the drag image recheck can leave the hand list. owner: natamox. stop: a plan that adds it or drops it, or 2027-01-15.
- Real Safari for Mac through `safaridriver`, so Safari rechecks can leave the hand list; it needs `safaridriver --enable` once with an admin password on the machine that runs it (inferred from Apple's setup, not run). owner: natamox. stop: a plan that adds it or drops it, or 2027-01-15.
- A real Android phone, for Android rechecks and the device lane, which the proof subject's Android review is waiting on. owner: zbeyens. stop: that review's plan closes.
- A test weakened through a shared helper keeps its hash, because the hash covers the test's own source only. owner: natamox. stop: round 2's tally shows whether a retired recheck's bug came back, or 2027-01-15.
- The HTML Export page no longer shows a server error on beta. On 2026-10-19 it renders and logs React error 418, a text mismatch between the server and browser renders. Round 1's step 1 page check sends that error to the find list, and session 55 tests the page. owner: natamox. stop: round 1's step 1.
- WebKit logs on 45 docs pages that the Plate Plus frames send an X-Frame-Options allow-from directive naming next.platejs.org, which it does not recognize and ignores. Whether any frame fails to load is unchecked. owner: zbeyens. stop: zbeyens checks those frames on beta, or drops it.
- The Demo example page has no settled twin. The source on `main` routes it, but platejs.org answers 404, so the page list prints it unresolved. Round 1 runs it with no reference. owner: natamox. stop: round 1's step 2 names its twin or lists it as beta-only.
- With two testers, the planted-bug trial needs both pages of each pair in one tester's pages. owner: natamox. stop: the first round that runs the trial.
- Three small `page-health.mjs` changes the diff review deferred: find routes in one place with `docs-sources.mjs`, keep known third-party frame noise from turning the exit code red, and warn about a `STABLE_TWINS` or `BETA_ONLY` entry that matches no page. owner: natamox. stop: round 1's step 2, which edits those tables, or the next change to how the script finds routes.

## Close

### Diff review before the PR, 2026-10-16

natamox asked for a review of this build and a PR into `next` for zbeyens to merge, because natamox may not be able to push `next`. Two diff panel rounds ran with all three seats, beside a thermo-nuclear review. Nothing is committed until the PR.

**Reversals and deviations.** Firefox now runs in the page check. The script gives Playwright's Firefox its own app-data folder, as the repository's Playwright configs already do. So the firefox first default and its Open work item are gone, and step 1.4's beta proof covers all three engines. The page check also opens the docs pages built as app pages, English and Chinese, and the release pages of older majors, beyond the routes step 1.4 names. A Chinese app page waits for an editor when its English page does. A test's hash now covers its exact source, so a reformat changes it too. Each of the last two is a Defaults row.

**What landed.**

- `knowledge.mjs` hashes each test's exact source instead of its whitespace-collapsed display text.
- `page-health.mjs` opens the English and Chinese docs app pages and the release pages of older majors, and launches Firefox with its own app-data folder.
- `verify.mdc`, its skill copy and step 1.4 name `docs-sources.mjs` as the home of `readSources`, and `verify.mdc` names `healthRoutes` as the list of every route the page check opens.

**Proof and its limits.**

- Reverting each fix alone on frozen commit `60018211` fails its test: the hash test on a string's inner whitespace and a line break after a comment, and the page-health test on the docs app pages and on a dynamic route segment.
- Firefox launched in 1.4 s with the folder set, and timed out after 45 s without it.
- The beta run opened 590 routes per engine. Chromium and Firefox reported only the broken HTML Export page. WebKit also reported the embeds example's third-party frame errors and the Plate Plus header on 45 pages; the Potion page reported nothing this time.
- Round 2's fixes bring the check to 600 routes. Reverting each alone on frozen commit `b5763ef7` fails the page-health test: the Chinese app pages, the older release pages, the Chinese editor wait and the Chinese Server-Side page. On beta, the 123 Chinese routes report only the Chinese HTML Export copy in all three engines, plus the Plate Plus header in WebKit. The five release routes report nothing.
- `pnpm check` fails in lint, type-aware lint, the lint baseline and typecheck, each on files this PR does not touch. The working tree differs from `HEAD` only in this PR's files. The lead stopped the run in its test step to apply the fixes, after a slow list test had timed out.

**Counts.** Two panel rounds. Round 1 applied 1 critical and 3 warnings and deferred 3 nits to Open work. Round 2 found no critical; it applied 2 warnings and 2 nits and dismissed 1 nit. The thermo-nuclear review found no structural problem beyond two of round 1's points.

**Attention**, panel round 1 on claude-opus-5-5 @high, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh, with each response:

- **Critical.** A test's hash ignored whitespace inside strings and line breaks after comments, so a weakened test kept its hash (Sol, Astra; Opus as a warning). The hash now reads the exact source.
- **Warning.** The page check left out the docs app pages, such as `/docs/plugins` (Sol, Astra). It now opens them.
- **Warning.** Firefox failed because the script set no app-data folder, not because of the machine (Opus). It now sets one.
- **Warning.** Two instructions still placed `readSources` in `hand-drive.mjs` (Opus; Sol and Astra as nits). Both now name `docs-sources.mjs`.
- **Warning, round 2.** The release pages of older majors were still left out (Sol, Astra; Opus as a nit). The check now opens them from the app's own release helper.
- **Warning, round 2.** The Chinese docs app pages were left out, though the plan checks Chinese pages with their own text (Opus). The check now opens them, each with its English page's editor wait.

### Build of steps 1.1 to 1.5, 2026-10-16

natamox's session built steps 1.1 to 1.5 once natamox said to start. Step 1.6 stays with zbeyens. Nothing is committed; the owner commits after review.

**Reversals and deviations.** No approved pick changed. The build made these calls, each a Defaults row: HTML Export and Server-Side join P2; eight renamed pages are paired by hand and five are marked beta-only, while the Demo example page stays unresolved; Server-Side and the annotation anchors page load without waiting for an editor; and the tester guide says "the tester" instead of natamox. Four proofs ran narrower than approved, and each closes on a look default with an accepted log row. Step 1.4's page check leaves out Chinese pages that have no file of their own, and its beta run covered Chromium and WebKit, because Firefox does not launch on this Mac. Step 1.1 skipped the main and next draft case, because two recordings of issue 5088 showed no block selection on either site, and ran its one-video case on a P1 recording. Step 1.2's knowledge check fails at base with the same findings.

**What landed.**

- `tooling/scripts/page-health.mjs` and its test. The docs reader moved into `tooling/scripts/docs-sources.mjs`, which `hand-drive.mjs` now imports.
- `pnpm kb` prints each test's source hash beside its gate.
- The project Bug fix playbook's sweep-find delta.
- Issue-draft's two-video baseline from `main`, Slate, stable Plate or another editor.
- `.agents/rules/verify/references/tester-pass.md`, its section in `verify.mdc`, and the generated skill copies.

**Proof and its limits.**

- The page-health tests pass, and six mutants that break the priorities, the twin check, the frame and Chinese filters and the component flag each fail them, on frozen commit `069a53b6`.
- A dev server from a worktree at `fa0ac06f55`, with the plaintext example planted to throw, reported that page alone among 44 Plite routes in Chromium, and nothing once the plant was removed.
- The beta run opened 586 routes per engine. Chromium reported only the broken HTML Export page. WebKit also reported third-party Vimeo and Cloudflare frame errors on the embeds example, the Plate Plus header error on 45 pages and the Potion header error on one. Firefox timed out at launch.
- The hash test passes, and hashing the whole file or only the title fails it. `pnpm -s kb check` stays red with the same 18 findings at base, each printed twice; suggested task `t_3ea68f2e` owns that check.
- `check-playbooks.mjs` passes on the Bug fix delta under pstack 0.9.67, the version cached on this machine, while `.claude/settings.json` pins 0.9.84.
- Headless Opus sessions ran the plan's prompts. On the guide's final text, the round 1, round 2 and after-round prompts loaded `verify` and read `tester-pass.md`. Round 2 gave 129 of 129 pages the next browser and carried 10 of 10 rechecks, and the after-round answer named drafting, fixes P1 first and waiting until beta serves every fix. In the first run, the diagnose prompt read the Bug fix playbook and never opened the tester guide. The Slate-pair draft labeled Slate as its baseline and asked no `main` or `next` question. The one-video draft kept its old path, though it used a P1 recording and read the script beside it.

**Finds.** The first page check found the HTML Export page broken on beta (`docs/plans/artifacts/2026-10-15-regression-sweep/build/html-export-beta.png`), while its platejs.org twin renders. It joins round 1's rechecks, as Open work says. natamox also proposed splitting round 1 between two testers by priority; that waits on zbeyens, as Open work says.

**Counts.** This close covers 13 items: 7 done, 3 partial, 3 skipped, 0 blocked and 0 open. The steps are 1.3 and 1.5 done, and 1.1, 1.2 and 1.4 partial, each closed on a look default. The gates done are the writing passes, the lint, the decision-trail review, the chips sweep and the page. The gates skipped are thermos, because no package or plugin code changed, a diff panel, because no reviews row owes one, and reflect, because the owner corrected no workflow.

**Attention**, reviewed by gpt-6.1-sol, with each response:

- **Critical.** Step 1.2 closed while its knowledge check fails, with no partial row or look default. The log now holds the partial row, the kb green first default and its accepted row.
- **Warning.** Step 1.4 left out Chinese fallback routes without saying so. A partial row and the every chinese page default now cover it, and this Close names it.
- **Warning.** Step 1.1's one-video case ran on a P1 recording. A partial row and the widened main pair check default cover it.
- **Warning.** The Demo example page was marked beta-only, though the source on `main` routes it. It now prints as unresolved, and Open work settles it at step 1.7.
- **Warning.** The tester guide still taught `null` in the twin table. It now names `BETA_ONLY`, and three fresh sessions reran on the final text.
- **Warning.** The editorless fix row cited the first beta run. A corrected row cites the final run.
- **Warning.** The frame-header item claimed a cause the log does not show. Open work now states what WebKit logs and that frame loading is unchecked.
- **Nit.** The knowledge and Plate Plus counts were off. This Close now says 18 findings, and 45 Plate Plus pages plus one Potion page.

### Planning, 2026-10-15

This run wrote a plan and its evidence, and nothing in product code. Every step above is open for natamox to build after your go.

**Reversals.** The earlier pages promised a verdict-style sweep skill, prepared cards per page and two tester days for round 1. This plan builds no skill, replaces prepared cards with timed sessions, and gives round 1 about three tester days.

**Deviations.** Round 1's planted-bug trial runs after this review, because only a person can run a session. The Defaults row for round 1's trial asks your go for it. The bookkeeping trial's three arms and the picking trial's arm C ran twice, because their first runs could not open inputs outside their snapshot; the frozen rules, graders and templates kept their hashes. Before the last compaction, the lead printed the first trial's blind copies' titles and so saw its label map before grading, which the log records.

**Proof and its limits.**

- Three paired trials ran before their reviews, each with a sealed key from a separate agent and a blind grader. Their results decided the drops by keep rules frozen before any arm ran. They measure what a written list or an agent reaches on the tasks tried, never what a person finds.
- Two `architect` rounds, each with three runners and a blind judge, chose the frame and then the sessions.
- Three review rounds since your restart ran with all three seats each, and round 6 reached the review cap. Every critical finding got a fix, and one still waits on your go, as Attention says.
- Defaults names the untested parts: the page list and time per page, and the moves until round 1's trial.

**Attention**, reviewed by gpt-6.1-sol, with each response:

- **Critical.** Round 1's trial still runs after review, and nothing on record shows your approval. It stays open until your go, which the Status line and the Round 1's trial default ask for.
- **Warning.** The pivot's reason and the bookkeeping conclusion said more than the trials measured. The Brief, Teach, Defaults and Outcome now speak only of the tasks tried, and a checklist arm for round 1's trial is a Defaults choice.
- **Warning.** The trial could compare unequal chances. Now only pairs where both plants were chances count.
- **Warning.** The round loop's lasting home lacked the steps after a round. `tester-pass.md` now holds them, with a fresh-session proof.
- **Nits.** "1 in 60" came from two trials, not three; the run had not tracked the first design round's candidates; a log row counted 90 rules where the archive says 89. The lead fixed the wording, tracked the candidates in `design/`, and added a corrective log row for the count.

**Reflect**, one Opus reviewer from your "are we aligned" message on. Its answer is in `docs/plans/artifacts/2026-10-15-regression-sweep/reflect/review.md`.

- Applied: none. No lesson was a crash fix or a rewording that adds no words, so each one waits for your word.
- Backlog, offered as suggested tasks: t_cd60e5cf decides what lets a trial separate its arms; t_c4abe78e fixes the `cross.mjs`, `decisions-check.mjs` and `freeze.mjs` gaps the trials hit; t_68844aa2 has each review seat state your goal before it judges feasibility; t_5560efa4 closes the shell rules' `=` word and `grep` gaps; t_3466481a names the docs page listers in `verify`; t_67705ddd keeps each claim's scope through the plain-language pass.
- Rejected: the `pnpm kb` probe recipe and the lint no-op on docs, which `verify` and the Delivery rule already cover; the ping files in `/tmp`, a one-off; the raw files you must commit, which the Delivery rule already makes your call.

**Counts.** The plan's 16 steps are all open, for natamox to build after your go. This run closed 13 gates, with 12 done, 1 skipped, and none partial, blocked or open. The done gates are two `architect` rounds, three trials, review rounds 4 to 6, the writing passes, the trail review, reflect and the chips sweep. The run skipped the lint fix, because every file it changed is under `docs/`, which lint and format ignore.
