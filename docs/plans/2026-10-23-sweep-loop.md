---
review_scopes: [proof]
review_basis: []
work_kind: workflow
review_commit: be4cac3bd50723e842895d50d69f3e5d85c79952
review_inputs: [docs/plans/2026-10-15-regression-sweep.md, docs/plans/2026-10-19-sweep-r1.md, .agents/rules/verify.mdc, .agents/rules/verify/references/sweep.md, .agents/rules/verify/references/playtest.md, .agents/playbooks/bug-fix.md, .agents/rules/maintainer/references/issue-draft.md, .agents/rules/maintainer/scripts/publish-issue.sh, .agents/rules/maintainer/scripts/self-test.sh, .agents/rules/maintainer/assets/issue-body.md, docs/plans/2026-10-23-formal-verification-intake.md]
---

# Sweep loop: agents test, domains triage, fixes close the testing gap

Status: executed: the loop is rewritten, round 1 is triaged and the formal-check intake is merged; natamox files each domain from the triage
Playbook: plan

## Brief

### What will change?

Agents test each beta page, then a person retests. Each domain's finds become one issue per cause and one fix run that adds the missing test. Round 1 is triaged, and each verification skill has its step.

### What could go wrong?

The triage comes from reading code and the testers' notes, not from rerunning anything, so a fix run may split some groups. natamox still has to file and merge the issues, and nobody has tested the six moves yet.

## Teach

The sweep is how the team hunts beta bugs. Each beta page is tested beside the page it should match. The old guide had a person test by hand and fix each find alone, but round 1 had agents test first while natamox and Sin retested.

The guide now matches that. A tested domain's finds are grouped by the code that causes them and filed once per cause, and one fix run takes the whole domain. That run names why the tests missed each bug and adds the check that would have caught it. A miss that keeps coming back becomes a check of its own.

Two kinds of check share the work. A bug a test sees without a browser gets a formal check where its rules keep breaking, which tries every short sequence so nobody guesses the steps. A bug only a browser shows stays with the sweep, and its fix adds a browser test.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who tests first | Agents run each session, then a person retests each find; only people test the iPhone, other-language keyboards, pasting from other apps and dragging images (look) | People test by hand first, agents in a later plan | people first | big |
| When finds are filed | After a domain's triage groups them by cause, one issue per cause (look) | File every find, then merge the similar ones | file then merge | big |
| How fixes run | One fix run per domain; two causes in the same code make it a redesign | One fix per find, one at a time | one at a time | big |
| What a fix adds | The check that would have caught it; the same reason for a miss, seen twice, goes to the correct skill | The fix's own test only | test only | big |
| Formal checks | The intake's three, each its own small skill: autoformat, suggestion recording, Yjs peers. Native input and selection get none, since only a browser shows those bugs | A formal check for every domain | formal everywhere | small |
| Keeping formal checks true | A fix follows the check's own skill; the maintain skill runs over every check once per round | The maintain skill in every fix run | every fix | detail |
| How issues get their videos | gh uploads each image and video straight into the issue | Object storage or a browser upload | old upload | small |
| Adding finds to an open issue | One comment with the new repros and their clips | Edit the issue's body | edit body | small |
| The six moves | Kept as the list agents and people improvise from, with no trial behind them | Drop them until a trial backs them | drop moves | small |
| What a domain is | The review scope that owns the page's demo | The docs section the page sits in | docs sections | small |
| Round 1 triage | Drafted here only; nothing filed, merged or closed (look) | File and merge the issues now | file now | small |
| Where finds are recorded | Whatever the round plan names, such as natamox's sheet, exported to the run folder | A table inside the round plan | plan table | detail |
| The older sweep plans | Their open steps point at the new loop; their history stays | Leave them as they were | leave plans | detail |
| Plan review | No panel, since this changes the workflow and no public API | Run a panel on the plan | panel | detail |
| Page link | A new proof page, XqsY1CcceaevUNqabTFPbw, because claude.ai now reads Evweke9u3BjCdc42mnonEk as another account's and refuses updates | Keep trying the old page | old page | detail |
| Which runs may offer a P2 or P3 chip | A verdict run, a babysit run and a measurement the Time budget rule hands off, each naming its route as `via:`; `append` refuses any other new P2 or P3 offer (look) | Only verdict and babysit runs; a measurement goes to Open work | no measurement chips | small |
| A hard cut's question outside a verdict | A line in the plan's Open work, unless it is P0 or P1 | A `decide` chip, as before | hard cut chips | detail |
| A sweep's owner question that no law answers | A `decide` task only when it is P0 or P1; otherwise the sweep's report lists it | A `decide` task at any priority | sweep decide chips | detail |
| Workflow trouble a card session cannot fix | Its last report names it, and the lead fixes it in its next sweep; no task | A P3 task that names the lead's session | friction chips | detail |
| A docs fix such as a dead link | P2, so a plain run lists it in Open work; repository tooling such as lint output is P3 | P1 as a user-visible bug with a repro | docs P1 | detail |

## Outcome

The sweep has one guide, `.agents/rules/verify/references/sweep.md`, that runs agents first, triages each domain into one issue per failure kind, fixes each domain in one run and names, for each kind, why tests missed it and what closes that gap. Beta issues upload their media through `gh --attach`, and new members of a known kind reach its issue as a comment. Round 1's open issues and finds are triaged into kinds with owners, miss classes, redesign candidates and the merges natamox can publish.

## Scope

- The sweep guide, its pointers in `verify`, playtest and the Bug fix playbook, and the open steps of the two sweep plans.
- The issue-draft method, its template and the publisher with its self-test.
- A read-only triage of the 24 `target:beta` issues and round 1's 123 find occurrences from `round1-finds.md`.

Out of scope: filing, merging or closing any issue; the fix runs; new tests or checks, which each domain's fix run and the offered chips add.

## Decisions

**Agents first.** natamox ran round 1 with agents first and retested by hand, and Codex drives desktop browsers better than Claude's built-in Chromium, which suits pixel checks. The guide now says so, and keeps for people only what no agent can drive.

**Triage before filing.** zbeyens asked on 2026-10-20 that a domain's issues be audited and merged before fixing, so `verify` and `/pstack:correct` learn from them. Grouping before filing gives the same result without opening and closing duplicates in public.

**One run per domain.** The Bug fix playbook's Redesign runs already treat two failure kinds with one owner as a design cause. A triaged domain hands that run every kind at once, so the trigger fires at triage instead of after a second failed fix.

**Miss classes.** Each seat that read an issue named why its nearby tests passed. Seven classes cover every answer: no test, wrong layer, wrong assertion, engine gap, wiring gap, composition gap and spec gap. Each class names what closes it. Two kinds that missed for the same reason go to `/pstack:correct`, which prefers a check over a rule. A class alone does not, because every class showed up in two or more kinds of round 1.

**Formal checks.** The formal-check intake, `docs/plans/2026-10-23-formal-verification-intake.md`, settled where they pay off. They fit logic a test sees without a browser, where a written rule gives the right answer. Its tasks build three checks. The autoformat rules check is t_30422a81 and covers K7 to K9. The suggestion recording check is t_a998edbb and covers K31's kind. The Yjs peers check is t_dd929413 and covers K34. Composition and selection get none, because only a browser shows those bugs. The composition redesign gets a generated browser matrix instead. Each check's gate run takes seconds and runs only when its own files change, and t_df2f315f runs the deeper sizes daily, so landing stays fast. A fix that changes covered code follows that check's own skill. `/pstack:maintain-formal-verification-skill` runs over every check once per round, to catch a change that skipped it. Once two checks exist, t_589db800 adds the Bug fix rule that a fix in covered code first makes its check catch the bug.

**gh attachments.** gh 2.102 uploads images and videos with `--attach` on `issue create` and `issue comment`, and swaps a local reference for the uploaded URL. That removes the object store, the presigned upload and the Chrome file-picker flows.

## The loop

| Step | Who | Guide |
| --- | --- | --- |
| List pages and check they load | agent | sweep.md, Pages |
| One session per page, scope and browser | agent; Codex for Chrome, Safari and Firefox, Claude's browser for pixel checks | sweep.md, A session |
| Retest each find on live beta | person | sweep.md, A session |
| iPhone, OS input methods, paste from other apps, drag images | person | sweep.md, A session |
| Group a domain's finds into failure kinds, one issue each | agent drafts, tester publishes | sweep.md, Triage a domain; issue-draft, Sweep finds |
| Fix the whole domain, redesign when kinds share an owner | Bug fix run | sweep.md, Fix a domain |
| Add what each kind's miss class calls for | the fix run, `/pstack:correct`, the formal verification skills | sweep.md, Why tests missed it |
| Next round once beta serves the fixes | agent prepares, both test | sweep.md, Preparing round N and After a round |

### Verification skills in the loop

| Skill | When it runs | What it leaves |
| --- | --- | --- |
| `verify` | Prepares each round, drives the agent pass through its playtest and drives each fix run's proof | The round plan, and each fix's test at the lowest layer that sees the bug |
| `/pstack:maintain-verification-skill` | After a round, for each feature an agent could not drive, such as the iPhone, OS input methods and the Hocuspocus server | A harness or inventory fix in `verify`, so the next agent pass drives it |
| `/pstack:create-formal-verification-skill` | A kind whose miss is M6, in a rule set or state machine with no check, whose bug shows without a browser | One small skill per check, with its coverage record and a gate run of seconds |
| The check's own skill, such as `authored-decision-order` | Each fix that changes code the check covers | The check rerun on the fix |
| `/pstack:maintain-formal-verification-skill` | Once after each round, over every formal check | Each check back in step with code that changed without it |
| `/pstack:correct` | Two kinds that missed for the same reason, in one round or across rounds | The reason encoded as a check, a type or a lint |

## Round 1 triage

Five Codex seats read the 24 `target:beta` issues, round 1's record and the code; the lead mapped each owner file to its review scope with `review-ledger.mjs lookup`. Every cause below is read from source or inferred from it, as marked; no fix run has reproduced it yet. Round 1's record holds 123 find occurrences: 82 in 24 clusters and 41 single finds. 26 of them match an existing issue and 97 are unfiled. 25 rows are blocked, 23 of them iPhone sessions that only desktop or Android covered.

### Redesign candidates

Two or more kinds with one owner start a redesign run, as the Bug fix playbook's Redesign runs say.

| Run | Kinds | Owner | Why one run |
| --- | --- | --- | --- |
| Composition and typing marks | K1 to K4, K50 to K52 | `packages/plitejs/src/react/editable/composition-state.ts`, `android-composition.ts`, `native-input-strategy.ts` (inferred) | Every kind loses where composed or typed text lands or which marks it takes; the native scope's last verdict was Stop, so the failed-fix review runs `verdict` on it first |
| Autoformat input rules | K7 and K9, and K8 once its fix run traces it to `createInputRules.ts` instead of `BaseMarkPlugins.ts` | `packages/platejs/src/lib/plugins/input-rules/createInputRules.ts` in plate-api, and the kit's rule table in `apps/www/src/registry/components/editor/autoformat.tsx` in editing (read, strong) | Rules match one at a time over a sequence another rule already consumed; the intake's autoformat check, t_30422a81, types every short sequence through the whole kit |
| Yjs bridge | K34's three kinds | `packages/plitejs/src/yjs/core/selection.ts:13`, `controller.ts:1810`, `text-runs.ts:822` (read) | Peers diverge, remote edits leave the caret behind, concurrent replacement loses letters |
| Page geometry | K36's kinds | `packages/plitejs/src/pagination/react.tsx:573`, `page-geometry.internal.ts:27` (read) | Block boxes merge fragments across pages, so hit testing, selection paint and reflow disagree |

Each run has its task. Composition is t_1d843b2a, which took in t_94ffdd65 and moves one composition case onto the insert-text command, after t_eeed716f kept the desktop composition write as a bridge. Autoformat is t_c4407e94, and the two rule-order fixes t_167ab658 and t_dceb960e answer its question, so the next `/chips` merges them into it. The Yjs bridge is already the cut-join storage build, t_9c25c288, with its split question t_649d2131, so K34's members become round 2 rechecks and t_dd929413 checks convergence. Page geometry is t_8276a635, after the container-measuring question t_c8441921.

### Kinds by domain

Members name the page route and the browser the find came from. A kind with "unfiled" gets a new issue; one with an issue number adds its new members to that issue as a comment. Priority follows chips.md's Priority. A kind filed in batch 1 or 2 keeps the priority natamox approved in that batch's prep. Every other kind carries this triage's priority, and its batch's prep may change it.

| Kind | Domain | What breaks | Members | Issue | Owner | Miss | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| K1 | native | Composition over a selection does not replace it in place | `/docs/block-menu`, `/docs/examples/huge-document`, `/examples/plite/huge-document`, `/examples/plite/plaintext` (Android); `/examples/plite/mentions` (Chrome) | #5244 | `composition-state.ts:1086` on desktop, `android-composition.ts:894` on Android (inferred) | M4, M6 | P1 |
| K2 | native | A mark turned on is lost on composed text | `/docs/subscript`, `/docs/underline` (Android); `/docs/subscript` (desktop; browser and input method not recorded) | #5245 | `composition-state.ts:1072` on desktop; the Android path returns at `:1065` before it, and its owner is not traced (read) | M4, M6 | P1 |
| K3 | native | Composing in a new empty paragraph lands in the block above, or crashes on Return or undo | `/docs/indent` ×2, `/docs/list` ×2, `/examples/plite/forced-layout`, `/examples/plite/richtext` (Safari; Chrome keeps the text on the last two) | #5242 | composition state, no stack captured (inferred) | M4, M6 | P0 |
| K4 | native | A mark turned off by its shortcut still formats the next text | `/docs/basic-marks` ×2, `/docs/bold`, `/docs/installation/react`, `/docs/italic`, `/docs/strikethrough` | #5224, whose Repro 2 to 4 are `/docs/installation/react`, `/docs/italic` and `/docs/strikethrough` | `native-input-strategy.ts:56` (inferred) | M2, M5 | P1 |
| K5 | native | Undo inside an input in a void runs the editor's undo | `/examples/plite/editable-voids`, `/examples/plite/embeds` | #5246 | `keyboard-input-strategy.ts:492` (read) | M1, M6 | P1 |
| K6 | native | Option with a digit fires no heading shortcut in Safari | `/docs/basic-blocks` | #5225 | `packages/plitejs/src/dom/utils/hotkey-match.ts:182` (inferred) | M2, M4 | P2 |
| K7 | plate-api | An early substitution eats a longer syntax's delimiters | `==` highlight, `!>=`, `!<=`, `!~=`, `H~2~O`, `X^2^` on `/docs/autoformat` | #5201, which took in #5202 and #5204 as Repro 2 and 3 | `autoformat.tsx:16` to `:123`, `createInputRules.ts:479` (inferred, strong) | M3, M5, M6 | P1 |
| K8 | basic | Triple asterisks stay literal | `/docs/autoformat` | #5203 | `BaseMarkPlugins.ts:198` (inferred, strong) | M3, M6 | P2 |
| K9 | plate-api | Closing an inline-code backtick joins the next paragraph | `/docs/code` | #5226, fix in PR #5237 | `createInputRules.ts:112` (read) | M3, M6 | P1 |
| K10 | list | Tab is refused where the indent command applies | Details summary, a two-paragraph range on `/docs/indent` | #5199, which took in #5200 as Repro 2 | `BaseIndentPlugin.ts:196` (inferred, strong) | M2, M6 | P1 |
| K11 | list | Indenting keeps the old list marker | `/docs/list` (Safari) | unfiled | not traced | M1 | P2 |
| K12 | basic | Enter in the font size field keeps focus there; Safari ignores the size | `/docs/font`, `/docs/toolbar`, `/docs/footnote` | unfiled | `font-size-toolbar-button.tsx:154` (read) | M1 | P1 |
| K13 | basic | The keyboard-key toggle on a mixed selection keeps the keycaps | `/docs/kbd` | unfiled | not traced | M1 | P2 |
| K14 | ui | A floating toolbar menu closes the toolbar or does not open | `/docs/kbd`, `/docs/block-menu` (Firefox, Safari, Chrome), Turn into on `/docs/footnote` | #5241 for the Safari first click and Turn into; #5209, closed, covers the second click, which no longer reproduces in Firefox on `/docs/block-menu` or `/docs/kbd` | `more-toolbar-button.tsx:23`, `floating-toolbar.tsx:156` (read) | M2, M4, M6 | P1 |
| K15 | ui | Swiping the toolbar opens Turn into | `/docs/highlight`, `/docs/underline` (Android) | unfiled | dropdown trigger (inferred) | M4 | P2 |
| K16 | ui | A long press selects text instead of opening the block menu | `/docs/block-menu` (Android) | unfiled | not traced | M4 | P1 |
| K17 | link | Edit link shows an empty text field, and saving hides the toolbar | `/blocks/playground`, `/docs/link` ×2 | #5228 covers the empty field | `link.tsx:161` to `:410` (read; cause inferred) | M2, M3 | P2 |
| K18 | dnd | A block drag copies instead of moving | `/docs/dnd`, `/blocks/playground` ×3 (Firefox) | #5223, whose Repro 2 and 3 are the playground's quote and code-block copies | drag session in `clipboard-input-strategy.ts:640` (inferred) | M1, M4 | P1 |
| K19 | dnd | An inline void drag copies, or lands at the paragraph start | `/examples/plite/inline-void-drag` ×2, and once on Android | unfiled | `dom-drag.ts:571` (inferred) | M1 | P1 |
| K20 | dnd | Block selection stops scrolling past the viewport edge | `/blocks/playground` (Safari, Firefox) | #5208, with Safari and Firefox as Repro 2; 5983e2d60e on `codex/sin/fix-details-blockSelection` targets it but never reached `next` | `dom-drag-scroll.ts:113` (read) | M3 | P1 |
| K21 | accessibility | Clicking empty editor padding focuses with no caret | `/docs/examples/editor-full-width`, `/docs/installation/manual` (Firefox) | #5227, whose Repro 2 is `/docs/installation/manual` | `runtime-focus-mouse-events.ts:78` (inferred) | M2, M3, M4 | P2 |
| K22 | runtime | Clicks inside an inline button place no caret | `/examples/plite/inlines` | unfiled | not traced | M1 | P1 |
| K23 | react | A read-only editor still shows a caret and the edit menu | `/examples/plite/read-only`, `/docs/examples/html-export` | #5252 | `editable.tsx:516` (read) | M1 | P1 |
| K24 | react | With several views, history buttons and blank clicks miss the editor | `/examples/plite/external-text` ×2 | #5259 | `editable-dom-runtime.ts:257`, `use-plite-history.ts:153` (read) | M6 | P2 |
| K25 | history | Plite examples install no history, so undo does nothing | 16 example pages | #5269, whose Repro 1 is recheck 24's run | the 16 example files (read) | M5 | P1 |
| K26 | history | Content completion splits undo and adds empty steps | `/examples/plite/content-completion` ×2 | #5271 | `history-merge-policy.ts:311` and `history-plugin.ts:582` (read) | M1 | P2 |
| K27 | commands | Shift+↑ and Backspace miss a synced block, and typing over a whole block hides the text | `/examples/plite/synced-blocks` ×2 (Chromium) | #5270 | `selection-controller.ts:361`, and `synced-blocks.tsx:111` gives the block hidden text of its own (inferred) | M6 | P1 |
| K28 | editing | Enter and paste split a read-only guard, and blocked typing moves the caret | `/examples/plite/schema-reconfiguration` ×2, and Enter on Android | #5250 | `insert-text.ts:45` against `insert-break.ts:75` (read) | M6 | P1 |
| K29 | commands | A drag from one root into another throws | `/examples/plite/multi-root-document` (Chromium) | #5268 | `view-boundary-graph-core.ts:304` throws, and its caller is not traced (read) | M1 | P0 |
| K30 | commands | Backspace over all of a heading's text deletes the heading | `/docs/heading` (Firefox) | unfiled | `editor-commands.ts:620` (read) | M7 | P2 |
| K31 | authored | Editing across a pending join leaves the paragraphs split | `/docs/suggestion` | #5194 | `ledger.ts:1254`, `record.ts:3362` (inferred) | M3, M6 | P1 |
| K32 | authored | Preview input throws, and a click at a proposed line end throws | `/examples/plite/authored-changes` | unfiled; #5195 closed is a neighbor | `authored-changes.tsx:603`, the preview lens (read) | M2, M6 | P0 |
| K33 | authored | Three single authored-changes kinds: media deletion leaves no paragraph, atomic deletions show no mark, suggest-mode code edits throw | `/examples/plite/authored-changes` | unfiled | not traced | M1 | P0 |
| K34 | collaboration | Enter at a mark edge splits peers, remote edits leave the caret behind, concurrent replacement loses letters | `/examples/plite/collaboration-demo` | unfiled | `yjs/core/selection.ts:13`, `controller.ts:1810`, `text-runs.ts:822` (read) | M1, M6 | P0 |
| K35 | collaboration | Copy or paste over a whole line clears it for every peer | `/examples/plite/yjs-collaboration` | unfiled | the example's line handler, copied in the Hocuspocus example (read) | M1 | P0 |
| K36 | pagination | A spanning block covers its page; Safari selection stalls, overlaps and reflows; typing lags | `/examples/plite/pagination` ×2, `/docs/pagination` ×3 | Four issues, because their causes differ: #5253 for the spanning block, #5257 for Safari's reflow and overlap, #5260 for Safari's Shift+Down and #5258 for the typing lag | `pagination/react.tsx:573`, `page-geometry.internal.ts:27` (read) | M1, M4 | P1; #5260 P2 |
| K37 | pagination | The docs sidebar covers the paper and clips the right page | `/examples/plite/pagination` | #5254 for the sidebar and #5255 for the clipped page, because the page is still clipped at 1000 px, where the sidebar covers nothing | `plite-example-styles.css:877` for the sidebar, `pagination.tsx:941` for the first zoom (read) | M1 | P1 |
| K38 | documents | DOCX import refuses common files and drops formatting | `/docs/docx` | unfiled | `importDocx.ts:2020`, `import-toolbar-button.tsx:255` (read) | M1, M7 | P1 |
| K39 | documents | An exported Word file names html-to-docx as its author | `/docs/examples/export` | unfiled | not traced | M1 | P2 |
| K40 | docs | Chinese pages show English content | `/cn/docs/footnote`, `/cn/docs/pagination`, `/cn/docs/underline` | unfiled | `doc-page.tsx:76` falls back to English; `underline.cn.mdx` holds English (read) | M1 | P2 |
| K41 | clipboard | Paste on Android inserts the text twice | `/examples/plite/editable-voids`, `huge-document`, `markdown-preview`, `plaintext`, `shadow-dom`, `comment-mode`, `document-state`, `inline-void-drag`, `schema-reconfiguration` (Android) | #5262 | `android-input-manager.ts:995` schedules the paste without cancelling the event (read); that Chrome also inserts the text is inferred | M4 | P1 |
| K42 | editing | Paste over a tapped guard crashes the page | `/examples/plite/schema-reconfiguration` (Android) | #5243 | not traced; it may share K28's guard handling (inferred) | M4 | P0 |
| K43 | ui | A long press turns the paragraph into a block selection with no Copy | `/docs/docx`, `/docs/examples/export` (Android) | unfiled | `block-menu.tsx:158` disables the context menu on touch, but its `onContextMenu` handler still runs and `:192` replaces the word selection (read) | M4, M7 | P1 |
| K44 | clipboard | Copy after typing writes nothing to the clipboard | `/examples/plite/huge-document` (Android) | #5263 | `clipboard-input-strategy.ts:330`, `dom-clipboard-runtime.ts:539` (inferred) | M4 | P1 |
| K45 | selection | After a blur, the first long press selects no word | `/examples/plite/richtext`, `/examples/plite/comment-mode` (Android) | #5264 | `selection-reconciler.ts:1432` writes the stale caret back on focusin (inferred) | M4 | P2 |
| K46 | native | No caret handle after a tap | `/examples/plite/markdown-preview`, `plaintext`, `shadow-dom` (Android) | #5247 | not traced | M4 | P1 |
| K47 | react | A long press in a nested editor drags the whole card and loses the next keystroke | `/examples/plite/editable-voids` (Android) | #5251 | `plite-void-shell.tsx:21` renders the card draggable; the error comes from `selection-protocol.ts:780` (read) | M4 | P0 |
| K48 | media | Insert via URL throws and inserts no image | `/docs/docx`, `/docs/media` (Chromium) | unfiled | `media-toolbar-button.tsx:200` passes `name: undefined`, which `update.insert` at `:204` refuses (read) | M1 | P0 |
| K49 | dnd | The column handle cannot move a column to the right of its neighbor | `/docs/column` (Firefox) | unfiled; #5001, closed, tracks the stable site's fix and stays closed | `column.tsx:119` calls `startBlockDrag`, the block handle's entry at `dnd.tsx:305` (read); it may share K18's cause (inferred) | M1 | P2 |
| K50 | native | The placeholder stays visible over a composition | `/examples/plite/custom-placeholder` (Firefox) | #5248 | `hidePlaceholder` at `android-composition.ts:469` hides it, and only the Android path calls it (read) | M4 | P1 |
| K51 | native | Backspace in a composition inside `[]` deletes the left bracket | `/docs/footnote` (Safari) | #5249 | not traced | M4 | P1 |
| K52 | native | iPhone pinyin in an editable-void child root leaves raw letters, and Backspace deletes the void | `/examples/plite/editable-voids` (iPhone) | #5240, filed by felixfeng33 | not traced | M4 | P1 |
| K53 | external-text | Shift+Tab cannot move focus out of an external text textarea | `/examples/plite/external-text` | #5261 | `external-text-runtime.ts:523` hands focus back to the textarea (read) | M1 | P2 |
| K54 | ui | On Android the docs editable-voids card overflows, and a tap in its nested editor shifts the card sideways | `/docs/examples/editable-voids` (Android Chrome and Via) | #5256 | not traced | M4 | P1 |
| K55 | clipboard | A multi-line paste splits the code-highlighting example's JSX block into CSS blocks | `/examples/plite/code-highlighting` (Safari, Chrome) | #5265 | `code-highlighting.tsx:112` handles Enter, and the example has no paste handling (read); the split is inferred | M1 | P2 |
| K56 | clipboard | Select all and Copy give a payload that changes with collapsed sections, and both forms are malformed | `/examples/plite/dom-coverage-boundaries` (Chromium) | #5266 | `dom-clipboard-runtime.ts:548` writes from the model and `:576` clones the DOM (read) | M1 | P2 |
| K57 | docs | Tabbing to Keep selection visible scrolls the demo sentence out of the docs preview | `/docs/selection` (Firefox) | #5267 | `inactive-selection-demo.tsx:27` fixes the editor at 650 px inside a 648 px frame (read); the focus scroll is inferred | M1 | P2 |
| K58 | history | Undoing Unsync puts the caret at the document start | `/examples/plite/synced-blocks` (Chromium) | #5272 | `history-carets.ts:38`, `:163` (inferred) | M1 | P2 |

K41 to K49 come from finds recorded after this triage, mostly natamox's Android retest; K48 and K49 are earlier finds the triage missed. K50 and K51 are single composition finds filed in batch 1, and K52 is #5240, an open issue that matches the editable-voids find on iPhone. K53 and K54 split off in batch 2. K53 was K24's third member, whose owner sits in external-text. K54 is the Android editable-voids card, which this triage had joined to K37's layout work, though its page, device and likely cause differ. K55 to K57 are single finds that batch 3 filed as kinds of their own. Batch 4 split K58 off K29, because undoing Unsync and the cross-root throw differ in cause and severity. K27 lost its schema-reconfiguration member in batch 4: on 2026-10-24 an agent replayed it on the live Beta in headless Chromium and WebKit, in the short form and in natamox's recorded steps, and Return no longer jumped to the top editor. Whether Chinese input there still vanishes needs a real input method.

Ten more single finds are unfiled kinds of their own, each M1 until its fix run says otherwise: forced-layout split and merge leave an empty paragraph, its placeholder never shows, cross-cell delete breaks a table, `@r` shows no mention at the document end, Excalidraw focus jumps to the outer editor, footnotes show doubled numbers, hidden-content blocks redraw stale text, an `inclusive: false` mark extends on typing, an unregistered inline link renders as a block, and the docs Demo example starts empty. huge-document's sideways scroll on a phone has no recording and no element found that widens the page, so it is not filed.

### Issue merges natamox can publish

| Kind | Keep | Then |
| --- | --- | --- |
| K7 | #5201, retitled to the kind | Close #5202 and #5204 as its duplicates; their repros become numbered repros of #5201 |
| K10 | #5199, retitled to the kind | Close #5200 as its duplicate |
| K4 | #5224 | Add the five sweep members as a comment; its title drops "in Firefox", since Chrome and Safari show it too |
| K18 | #5223 | Add the playground's quote and code-block copies as a comment |
| K17 | #5228 | Add the post-save toolbar loss as a repro, once its fix run confirms one fix removes both (inferred) |
| K14 | new issue | First-click and Turn into failures; link closed #5209 as the neighbor |

natamox published the K7, K10, K4, K18 and K14 rows on 2026-10-24 (UTC); the K14 issue is #5241. K17 still waits for its fix run.

natamox published batch 1 the same day: nine new issues, #5242 to #5250, for K1 to K3, K5, K28, K42, K46, K50 and K51. Every native and editing kind now has an issue. natamox reproduced #5242's Repro 3 and 4 by hand in Safari on 2026-10-24 (PT), after earlier retests had not, and Chrome keeps the text in both.

natamox published batch 2 the same day: eleven new issues, #5251 to #5261, for K23, K24, K36, K37, K47, K53 and K54. K36 became four issues and K37 two, because one fix does not remove all their members. The six pagination issues link to each other. Every react and pagination kind now has an issue.

natamox published batch 3 the same day: six new issues, #5262 to #5267, for K41, K44, K45 and three single finds that became K55 to K57. Every clipboard and selection kind now has an issue.

natamox published batch 4 the same day: five new issues, #5268 to #5272, for K29, K25, K27, K26 and K58. Before publishing, an agent replayed each repro on the live Beta, and all but K27's schema-reconfiguration member still failed. Every history and commands kind now has an issue, except Sin's K30, which waits for a spec row.

### Not bugs yet

- #5197 and #5198 propose new suggestion policies and capabilities, and the tests pin today's behavior on purpose. Scenario S14 in `docs/editor-behavior/scenarios/suggestions.md` promises list continuation that the tests refuse, so the catalog and the tests disagree. Both go to `verdict`.
- #5205, outdent before Backspace joins, and #5211, Callout in the Insert menu, are proposals for `verdict`.
- K30's heading case conflicts with whole-block deletion the testers accepted on lists and checklists; it needs a spec row before a test.
- #5196's ghost text is fixed on `next` by f3202e1c61 and did not reproduce in four engines later in the round; natamox closed it on 2026-10-24 (UTC), with iPhone unchecked, and closed #5125, fixed by 58a6755ece, the same day. #5149 is a report against the stable packages, so the Beta rechecks leave it open.
- #22's table pinyin and #37's Escape in a comment draft did not reproduce when natamox retested them on 2026-10-23 (PT), so neither is filed.
- On `/examples/plite/schema-reconfiguration`, a click still puts the caret in the guard and edits its text after the switch to a non-selectable schema, on desktop and Android. No kind holds it, and natamox marked it pending on 2026-10-24 (UTC).
- On `/examples/plite/editable-voids`, natamox judged three differences from Slate not bugs on 2026-10-24 (UTC): a click in the gap above the card puts the caret in its nested editor, Add on Android leaves focus on the page, and a new card's nested editor starts empty.
- #5195, #5209, #5210, #5212 and #5213 are closed. #5210 and #5213 gained tests with their fixes, and #5212's fix added none.

### Why tests missed them

| Class | Kinds | What closes it this time |
| --- | --- | --- |
| M6 composition gap | 15: K1 to K3, K5, K7 to K10, K14, K24, K27, K28, K31, K32, K34 | The intake's formal checks: autoformat for K7 to K9 (t_30422a81), suggestion recording for K31 (t_a998edbb) and Yjs peers for K34 (t_dd929413); a generated browser matrix of composition, selection and block for the composition redesign; `authored-decision-order`'s skill when K31's fix touches its coverage |
| M4 engine gap | 21: K1 to K3, K6, K14 to K16, K18, K21, K36, K41 to K47, K50 to K52, K54 | Gate `apps/www/tests/browser/regressions/` in CI, whose trigger in the sweep plan's step 2.1 has fired; `/pstack:maintain-verification-skill` on what agents could not drive: iPhone, OS input methods and the Hocuspocus server |
| M3 wrong assertion | 7: K7 to K9, K17, K20, K21, K31 | `/pstack:correct` on expected-failure tests, because K7's full-kit test, `apps/www/src/__tests__/package-integration/autoformat/current-kit.spec.tsx:31`, catches the bug and is marked `it.failing`, so it gates nothing; `test-audit` on the input-rule and link tests |
| M2 wrong layer | 7: K4, K6, K10, K14, K17, K21, K32 | Tests at the shortcut, click or render the user takes, not the command beneath it; `/pstack:correct` when the next round repeats it |
| M5 wiring gap | 3: K4, K7, K25, plus #5212 and #5198 | `/pstack:correct` on a check over the shipped examples and kits: every Plite example installs history unless it says why, toolbar hints come from the kit's binding, and authored fixtures keep production vetoes |
| M7 spec gap | 3: K30, K38, K43, plus the four proposals | Spec rows first, through `verdict` |
| M1 no test | the rest | The fix's own test and a scenario catalog row |

One finding sits under every class: `apps/www` browser specs run only by hand, Plite's Firefox and WebKit jobs run only on demand, and pull requests into `next` skip CI. A test written at the right layer still gates nothing until a lane runs it. The formal checks have the same gap at their deeper sizes, which no step runs; t_df2f315f adds them to the daily full check.

## Main changes

- `.agents/rules/verify/references/tester-pass.md` became `sweep.md`. Agents run each session first and a person retests. Each domain is triaged into failure kinds before filing, fixed in one run, and each kind's miss class names the check its fix adds.
- `.agents/rules/maintainer/scripts/publish-issue.sh` publishes through `gh issue create --attach`, and `--comment-on <number>` posts new members to an open issue through `gh issue comment --attach`. It reads back the issue or comment and refuses a gh without `--attach`. The object store, presigned upload and Chrome flows are gone from it and from `issue-draft.md`.
- The Bug fix playbook's sweep delta takes a whole domain and lets a tag cover one numbered repro of a merged issue.

## Steps

The execution playbook is Build (`.agents/playbooks/build.md`).

- [x] 1 Rewrite the tester guide as `sweep.md`, point `verify.mdc`, `playtest.md` and the Bug fix playbook at it, and run `pnpm run prepare`. Proof: `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` exits 0, and pstack's `check-playbooks.mjs` passes from the project root.
- [x] 2 Publish beta issues through `gh --attach`, with a comment mode, and rewrite `issue-draft.md` and its template. Proof: `self-test.sh` passes, and a copy of the publisher with its readback check removed makes it fail.
- [x] 3 Point the open steps of the sweep plan and round 1's plan at the new loop. Proof: `node tooling/scripts/review-ledger.mjs check` on each plan and `plan-page.mjs --check` on this one exit 0.
- [x] 4 Triage round 1. Proof: the five seat answers and the scope lookup log in the run folder, cited in the decision log.
- [x] 5 Merge the formal-check intake: its three checks replace this plan's own picks, `sweep.md` names each verification skill at its step, and the triage's kinds sit in their owners' scopes. Proof: `sync-resources.mjs --check` exits 0 after `pnpm run prepare`, and no chip this plan offers repeats an intake task.
- [x] 6 Smoke the changed routes in Claude Code and Codex with plain prompts. Proof: each session's transcript loads `verify` and reads `sweep.md` for "round 1 is done for the autoformat pages, what next?", and loads `maintainer` and reads `issue-draft.md` for "draft a beta issue from these two clips".
- [x] 7 Run the writing passes and land through `land.mjs`. Proof: the `writing` row and `land.mjs`'s log.
- [x] 8 Offer each redesign run, and each hardening task the intake did not already offer, as a chip. Proof: the chips ledger rows.

## Proof

Each step names its proof, and the decision log cites each log by path.

## Open work

- natamox files each domain from the triage: new issues per unfiled kind, the merges in the table and the member comments. owner: natamox. stop: every round 1 domain filed.
- natamox filed the native domain on 2026-10-24 (UTC), so t_1d843b2a can start; it took in t_94ffdd65. Autoformat's kinds K7 to K9 hold #5201, #5203 and #5226, so t_c4407e94 can start too. natamox filed the pagination domain the same day, so t_8276a635 can start after its container-measuring question t_c8441921. owner: zbeyens. stop: each lands or is dropped.
- The published domains' other fix runs are tasks in the ledger. Four were offered on 2026-10-24 (UTC) after batches 1 and 2 had skipped sweep.md's Triage step 6: t_4b6a74a2 for the editing domain (K28, K42; P0), t_ad6343ea for the react domain (K23, K24, K47; P0), t_3a884321 for K37's example layout (P1) and t_6b7dd7e5 for the native kinds outside t_1d843b2a (K5, K6, K46; P1). Batch 3 added t_78f4628e for the clipboard domain (K41, K44, K55, K56; P1). Batch 4 added t_cf942036 for the commands domain (K27, K29; P0) and t_d3d835a6 for the history domain (K25, K26, K58; P1). zbeyens's `/chips all` takes them over. owner: zbeyens. stop: each lands or is dropped.
- Four published domains hold only P2 kinds, so they get no task, as step 6 says: external-text's K53 (#5261), link's K17 (#5228), accessibility's K21 (#5227) and selection's K45 (#5264). K17's post-save toolbar loss joins #5228 once its fix confirms one cause. owner: zbeyens. stop: each issue closes, or round 2 rechecks it.
- The four hardening items have no chips, because a run offers chips only for new P0 and P1 finds (owner's word, 2026-10-23). Each belongs to the loop step that names it. Gating `apps/www/tests/browser/regressions/` in CI is the regression sweep's step 2.1. The expected-failure tests and the shipped-wiring check go to `/pstack:correct` from the first domain fix run that hits them. `/pstack:maintain-verification-skill` runs in After a round. owner: zbeyens. stop: round 2 starts.
- The intake's first formal check, t_30422a81, landed. The other four run in its order: t_a998edbb, t_dd929413, t_df2f315f, then t_589db800 once two checks exist. owner: zbeyens. stop: each lands or is dropped.
- The six moves still have no trial. owner: zbeyens. stop: round 2's tally, or 2027-01-15.

## Close

Reversals first. The intake's three formal checks replaced this plan's own pick of composition state, because only a browser shows native input bugs. `/pstack:maintain-formal-verification-skill` moved from every fix run to once per round, and a fix now follows the check's own skill. `/pstack:correct` now fires on two kinds that missed for the same reason, because "a class in two kinds" fired on all seven classes in round 1. The publisher no longer refuses a `#` in a file name, because gh 2.102 keeps an existing path whole. K7 moved to plate-api after the smoke found the autoformat run spanned three scopes. t_eeed716f had landed, so round 1's composition kinds went to a new question, t_94ffdd65, instead of a fold. The page was published once at the close instead of at each stage. After the close, the four P3 hardening tasks were dropped and their cards withdrawn, on the owner's word that a run offers chips only for new P0 and P1 finds; their items stay in Open work. That rule now binds every project through dotai. A run offers a suggested task only for a new P0 or P1 finding, and `append` refuses a new P2 or P3 offer unless it names `via: verdict`, `via: babysit` or `via: time`. It narrows two earlier dotai lessons: ace87c9, which sent every follow-up to the ledger, and 1df128d, which gave a card session a task for workflow trouble it could not fix. That trouble now goes in the session's last report, and the lead fixes it in its next sweep.

This run landed `sweep.md` in place of the tester guide, with its pointers in `verify`, playtest and the Bug fix playbook; the publisher on `gh --attach` with a comment mode, and the issue-draft method and template that teach it; the open steps of the two sweep plans; and this plan's round 1 triage, verification-skill table and merged intake picks. Three tasks stay on the board, t_94ffdd65, t_c4407e94 and t_8276a635, for the redesigns.

Proof and its limits. The mirrors match their sources after `pnpm run prepare`, and every project playbook still anchors. The publisher's self-test passes, and two mutants fail it: one without the body readback check and one with the `#` guard put back. The three plans pass the review ledger check, and this plan passes the page check. The smoke ran both prompts in Claude Code and Codex before the intake merge, whose sentences change no route. Every triage cause is read from source or inferred, and no fix run has reproduced one. The six moves have no trial. For the chips rule, the new `append` refuses a replay of this run's own P3 offer t_5de986e5, which the installed helper still takes, and takes it with `via: verdict`. The dotai tests pass. In the fifth smoke round, after four rounds of fixes to the rule text, Claude Code and Codex both kept a lint warning and a dead docs link out of the ledger, kept card-session trouble in the last report, and offered a verdict's P2 question with `via: verdict`. `corpus` shows no difference, because the check runs only on new rows. The change shipped fast, with no panel on the helper diff.

The review covered `docs/plans/2026-10-15-regression-sweep.md`, `docs/plans/2026-10-19-sweep-r1.md`, `.agents/rules/verify.mdc`, `.agents/rules/verify/references/sweep.md`, `.agents/rules/verify/references/playtest.md`, `.agents/playbooks/bug-fix.md`, `.agents/rules/maintainer/references/issue-draft.md`, `.agents/rules/maintainer/scripts/publish-issue.sh`, `.agents/rules/maintainer/scripts/self-test.sh`, `.agents/rules/maintainer/assets/issue-body.md` and `docs/plans/2026-10-23-formal-verification-intake.md`.

The owner asked six things, and all six are done: restructure the workflow, group the open issues into redesigns, name why tests missed them, use the formal verification skills, merge the intake, and say how the verification skills fit the loop. Open work is above.
