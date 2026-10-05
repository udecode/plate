# Needs you as a decision memo

Status: building the flow rail the owner picked, waiting on the trail review
Topic: plan-page

The owner could not tell from Needs you what a question asked or what each answer would do: "btw ""Needs you"" is quite bad, too much concise , i dont understand the question/answers rapidly.. please redesign from first principles with pstack skills". A throwaway prototype rendered three real questions four ways, and the owner picked the decision memo. Later prototypes made the page compact and colorful, and the owner picked layout A and the flow rail: "Rail is good."

## Brief

### What did you find?

The Needs you section shows each question in one line. It puts the facts below More. It does not tell you the result or the cost of each option.

### What will change?

Each question shows the facts, the result and the cost of each option, and the option that I select. A rail of pstack stages, from Plan to Reflect, replaces the status line.

### What do you need from me?

Examine this page. Commit the plate-2 sync, plan and guide changes when they are correct.

### What happens if I say go?

I will do no more work on this plan. You commit the plate-2 changes.

### What could go wrong?

Decision logs from before this change use other phase names. Their rails show some stages as skipped, although the work occurred. New rows use the stage phases.

## Main changes

- **Each open question is a decision memo.** The question line ends in a question mark, then `Why it needs you:`, the facts as plain bullets, each option as `- **<label>**: <what happens> Cost: <what it costs>`, `Why I pick it:` when one option is recommended, and `If you say go:`. Needs you renders each one as a numbered card with that order, the pick marked and its reason under it.
- **The renderer refuses an open plan's question that skips a part.** It names the missing part. An executed plan, or one with no state word, renders the parts it has, and a question with no options renders as plain text.
- **Color marks what to act on.** Needs you is one card with a pink border. Its head lists each decision's pick after a go badge, and the pick shows in pink with a My pick badge. Status words, review seats, finding severities and results each take a hue from a 12-hue palette that reads at 5:1 or better in both themes. Only badges have a background; everything else is text color and borders, as the owner asked.
- **The header shows the pstack flow.** A rail of the ten pstack stages, from Plan to Reflect, replaces the status sentence. It reads the decision log's stage phases, the Steps boxes and the Status, and the block's Plans and trails rule tells agents to log each stage under its phase. Seat chips drop `codex:` and show the effort as plain text.
- **The page is compact.** The brief is one card, the type and spacing are tighter, and everything below Needs you folds to one line.
- **Answers are in the owner's own words.** The radio buttons and the Copy answer line are gone. The Needs you head shows what go takes.
- **Agents read pages locally.** An agent reads a page from its rendered file under the plans directory or from the plan and subject files, never from the published claude.ai page, so a switched account cannot block it. A page is published again only while its work is active.
- **Workflow guides live in the repos.** Ellie gets `docs/development/agent-workflow.md`, plate-2 keeps `docs/development/agent-skills.md`, and both `AGENTS.md` files point there instead of at a claude.ai page.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Old questions in open plans | The renderer refuses them and names each missing part, like the brief rollout did | Render them in the new layout with the missing parts left out | "tolerate old questions" |
| Answer mechanics | Answers in the owner's own words, with no radio buttons or Copy answer line | Keep the radio buttons and the generated answer line | "keep radios" |
| A question with no recommendation | Allowed; it needs no `Why I pick it:`, and its `If you say go:` says that go leaves it open | Require a pick on every question | "always pick" |

## Steps

1. - [x] **Tests first.** Add plan-page tests for the memo render and for each refusal, and see each fail on the renderer before the change. Proof: the test run on the old renderer. Done: `scratchpad/needs-you/tests-before.log`; the legacy case failed with its guard removed.
2. - [x] **Renderer.** Parse and render the memo, refuse an open plan's incomplete question, and drop the radio buttons and the answer script. Proof: the plan-page tests and dotai's checks. Done: dotai `f6f04a9`, 93 tests pass, `validate-skills` passes.
3. - [x] **Rules.** Rewrite Open questions in `shape.md`, the page order, the block's Plan pages rule and the plan-page skill for the memo, own-words answers, local page reads and active-only publishing. Proof: `apply` and `verify` on Ellie and plate-2. Done: dotai `f6f04a9`; `verify` exit 0 on both in `scratchpad/needs-you/verify-*.txt`.
4. - [x] **Corpus.** Render every plan in Ellie and plate-2 with the old and new renderer, list each newly refused plan with its owner, and diff the bodies. Proof: the corpus log. Done: `scratchpad/needs-you/corpus/`; Ellie 0 of 1019 newly refused and no page body changed; plate-2 7 of 2140 newly refused, all from two live plans, which also leaves two subject pages unrendered, and one legacy page's Needs you changes with its text whole.
5. - [x] **Pages.** Render one real plan in each page mode, and this plan closed on its subject page, then publish the old and new versions. Proof: the published links. Done: the corpus rendered every mode locally, and the demo plan is published both ways, old at https://claude.ai/artifact/1D98Gm1KLE7odZvszzi8Hd and new at https://claude.ai/artifact/PAxD8xRrguXVnzxUCAcmhZ; this plan's closed render is in the decision log.
6. - [x] **Guides.** Write Ellie's repo guide and point both projects' `AGENTS.md` at their repo guides. Proof: the Ellie commit and plate-2's uncommitted edit. Done: Ellie `1ee6a3efd`; plate-2's `AGENTS.md` line and `docs/development/agent-skills.md` section are uncommitted for you.
7. - [x] **Compact page and rail.** Build the compact layout A and the flow rail the owner picked, with stages read from decision-log phases. Proof: the rail test failing on a word-match mutation, the corpus on the final bytes, and the smoke of the phase rule. Done: dotai `8fb790b`; `scratchpad/needs-you/rail-mutation.txt`, `corpus/final-summary.txt` and `smoke-rail.txt`.
8. - [ ] **Smoke and review.** Smoke the question-writing gate in both runtimes beside a baseline, then run the decision-trail review. Proof: the smoke answers and the trail answer.
9. - [ ] **Deliver.** Push dotai and Ellie; plate-2's sync, plan and guide edit stay for its owner. Proof: the commits.

## Open work

- The smokes named rule gaps that predate this change: a bare go can pick an option that spends a shared resource, which the Shared resources rule says needs a go-ahead for that target; the link-only reply contradicts plan-page's pin offer; and a Codex session's render-only hand-back contradicts the publish-before-reply rule. owner: Ziad, tracked here.
- `askOf` keeps one `last` variable for four kinds of continuation; split it if the memo grammar grows. owner: Ziad, tracked here.
