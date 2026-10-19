# A plan page that answers first

Status: executed: dotai 46ec5b5 and 04a5fe0 and Ellie ea243328c are pushed; plate-2's sync and templates wait for your commit
Topic: plan-page

Plan pages open with a five-question brief, and the renderer folds everything else under it.

## Brief

### What did you find?

Plan pages printed the whole record, so you had to ask what each one meant. Cold readers answered all three basic questions only on the five-question page.

### What will change?

Every open plan's page now opens with these five answers and folds everything else to one line. It is live in Ellie and dotai, and in plate-2's working tree.

### What do you need from me?

Commit plate-2's sync, templates, plans and the reflect-lesson edits when ready. Nothing else waits on you.

### What happens if I say go?

Nothing more runs. This build is done, and your go on 2026-10-05 applied the reflect lessons.

### What could go wrong?

117 plate-2 and 29 Ellie plan files are refused at their next render until their leading open plan gets a brief. The refusal names exactly what to write.

## Main changes

- **The brief leads the page.** A plan's `## Brief` holds five `###` questions, always in this order: What did you find? What will change? What do you need from me? What happens if I say go? What could go wrong? The page renders it first, under the title.
- **Needs you follows the brief.** The open questions render as their own panel right after the five answers, so every answer stays on the first screen.
- **Everything else folds.** Close, Main changes, Defaults, the subject's state, earlier iterations, details and review history each collapse to one summary line. A plan's Public API pairs stay open under the brief when it changes them.
- **The renderer checks the brief.** An open plan that leads its page needs one, and any open plan's brief is refused when it skips or reorders a question, leaves an answer empty, or gives an answer more than 40 words. A page without a brief renders as before.
- The header names only the leading plan's own review round.
- plate-2's feature, benchmark and regression plan templates carry a brief skeleton.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Brief shape | Five fixed questions, the only variant whose cold reader answered all three checks | A prose brief | "prose brief" |
| Answer length | At most 40 words each | At most two sentences each | "two sentences" |
| Public API pairs | Open under the brief | Folded like the rest | "fold api" |
| Old open plans | Refused until the migration adds a brief, done in the same build | A warning only | "warn only" |
| The reply after a page | The page link alone, as today | The brief pasted into chat too | "brief in chat" |
| Build order | Build now, picked by you on 2026-10-05 | Panel first, or hold | "panel first" |

## Steps

Each step follows sync-pstack's Lesson mode and plan-page's Change mode.

1. - [x] Copy every managed project's plans, subject files and playbooks to scratch, and render them with today's renderer as the baseline. Proof: the baseline list of rendered and refused plans per project. Closed by scratch `brief-build/corpus.log` (exit 0) and `corpus-live.log`.
2. - [x] Render the brief, the folded sections and the badge in `skills/sync-pstack/assets/pstack/plan-page.mjs`. Proof: renderer tests that fail on today's renderer, one per behavior. Closed by dotai 46ec5b5 and 04a5fe0.
3. - [x] Add the brief refusal. Proof: a must-pass and a must-refuse test for each rule, including an executed plan without a brief that must still render. Closed by dotai 46ec5b5's tests.
4. - [x] Write a brief into every open plan in plate-2, Ellie and dotai. Proof: the new renderer refuses none of them, and the old-against-new diff lists only added briefs and folded sections. skip: guessing briefs for 85 other plans was wrong; only the leading open plan owes one (see Close).
5. - [x] Update the plan-page skill and its `shape.md`, and the block's Plan pages rule where it names the page order. Proof: `sync-pstack verify` passes in both projects. Closed by dotai 46ec5b5 and 04a5fe0; the block needed no change; verify exit 0 in both.
6. - [x] Rerun the cold-reader check on the real renderer output for three open plans. Proof: each reader answers what was found, what is needed and what "go" does from the first screen. Closed by scratch `brief-build/readers/` for two plans, narrowed in Close.
7. - [x] Sync plate-2 and Ellie, smoke both runtimes, run the decision-trail review, and push dotai. Proof: the sync output, the smoke answers and the trail review. Closed by scratch `brief-build/smoke-*.txt`, `trail-answer.txt`, and Ellie ea243328c.

## Close

**Reversals and deviations.**

- Step 4 was approved as "Write a brief into every open plan in plate-2, Ellie and dotai", with the Default "Refused until the migration adds a brief, done in the same build". The build wrote briefs only into this run's two plans. Only an open plan that leads its page owes a brief, so 117 plate-2 and 29 Ellie plan files are refused at their next render, including executed iterations whose subject's open leader has none. Say "migrate all" to reverse.
- The approved Main changes said "The header shows the state word, the open critical count and the review rounds". The header shows the leading plan's own review round and no count. Say "count criticals" to add it.
- The approved Main changes said "Needs you lives inside the brief". The trail review found that older questions inside it pushed the go answer below the first screen, so 04a5fe0 moved Needs you right after the brief.
- dotai 46ec5b5 was pushed before the smokes and the trail review, as sync-pstack's current Lesson step 5 says, though step 7 here said after.
- Step 6 checked two plans, not three, because a third brief would be a guess about another session's plan.

**What landed.** dotai 46ec5b5 and 04a5fe0 change the shared renderer, its tests and the plan-page skill. Ellie ea243328c syncs them. plate-2's working tree holds the sync, the reinstalled skill, brief skeletons in three plan templates with their mirrors, briefs in this plan and the skills redesign plan, and both decision logs, uncommitted for you.

**Proof and limits.** Four new renderer tests fail on the old renderer and pass on the new one; the suite passes 91. Old and new renderers over every plan in both projects render the same body for every plan both accept. The paired smoke shows both runtimes write a brief-first plan only with the change, and no clash report after the template fix; it proves routing, not a full feature plan. A cold reader answered all three questions from the first screen of the skills redesign page; the plan-page page's go answer sat below the fold until 04a5fe0, which no reader rechecked. The trail review by gpt-6.1-sol raised 8 flags, each answered by a log row.

**Counts.** 7 steps: 6 done, 1 skipped, 0 blocked, 0 open.

**Open work.**

- The Plate v2 workflow guide was not checked, because another account owns it and reading it needs your approval. owner: Ziad, tracked in the plan-page subject's Open work.
- The feature and regression templates hold their brief at the end, because they use `Label:` sections and a `## Brief` above them would swallow those lines. owner: Ziad, tracked in the plan-page subject's Open work.
- An open-critical count in the header. owner: Ziad, tracked in the plan-page subject's Open work.

## Evidence

- Prototype with four page shapes for the same plan: https://claude.ai/artifact/2TUGk3ZMQo87WSa2Uaq9AH (throwaway; scratch `page-proto/`).
- One fresh Opus reader per variant got only the text visible without scrolling and one plain prompt: what did it find, what does it need from me, what happens if I reply go. Today's page answered one of three. Brief first answered two. Where we are answered one and a half. Five questions answered three, and even that reader could not tell whether "go" meant "build now". Raw answers are in this session's transcript; the screen texts are in scratch `page-proto/readers/`.
- Today's skills redesign page rendered about 2,400 lines of text (measured), and its first screen ended inside the subject's unchanged Public API.
