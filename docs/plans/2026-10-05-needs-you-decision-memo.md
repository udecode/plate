# Needs you as a decision memo

Status: building the decision memo the owner picked
Topic: plan-page

The owner could not tell from Needs you what a question asked or what each answer would do: "btw ""Needs you"" is quite bad, too much concise , i dont understand the question/answers rapidly.. please redesign from first principles with pstack skills". A throwaway prototype rendered three real questions four ways, and the owner picked the decision memo.

## Brief

### What did you find?

The Needs you section shows each question in one line. It puts the facts below More. It does not tell you the result or the cost of each option.

### What will change?

Each question will show the facts, the result and the cost of each option, and the option that I select. A timeline will show the complete steps.

### What do you need from me?

Examine the two example pages. Write go to put this design in the renderer.

### What happens if I say go?

I will put this design in the renderer. I will sync Ellie and plate-2. Then I will publish this page again.

### What could go wrong?

Two open plate-2 plans contain questions in the format before this change. Their pages will not show until their sessions write the questions again.

## Main changes

- **Each open question is a decision memo.** The question line ends in a question mark, then `Why it needs you:`, the facts as plain bullets, each option as `- **<label>**: <what happens> Cost: <what it costs>`, `Why I pick it:` when one option is recommended, and `If you say go:`. Needs you renders each one as a numbered card with that order, the pick marked and its reason under it.
- **The renderer refuses an open plan's question that skips a part.** It names the missing part. An executed plan, or one with no state word, renders the parts it has, and a question with no options renders as plain text.
- **Needs you is colored for a glance.** A green strip on top lists each decision's pick as a chip, or an amber chip when a decision has none. The panel has an amber title and rule, each card an amber stripe, and the pick a green border and title. Only badges have a background; everything else is text color and borders, as the owner asked.
- **Answers are in the owner's own words.** The radio buttons and the Copy answer line are gone. Needs you says that go takes the pick on every decision that has one.
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
7. - [ ] **Smoke and review.** Smoke the question-writing gate in both runtimes beside a baseline, then run the decision-trail review. Proof: the smoke answers and the trail answer.
8. - [ ] **Deliver.** Push dotai and Ellie; plate-2's sync, plan and guide edit stay for its owner. Proof: the commits.

## Open work

- plate-2's `docs/plans/2026-10-05-green-ci.md` ("Workflow guide") and `docs/plans/2026-10-05-history-sync-replay-result.md` ("Build") hold old-format questions, so seven plate-2 renders refuse until their sessions rewrite them as memos. owner: Ziad, tracked here.
- The smokes named rule gaps that predate this change: a bare go can pick an option that spends a shared resource, which the Shared resources rule says needs a go-ahead for that target; the link-only reply contradicts plan-page's pin offer; and a Codex session's render-only hand-back contradicts the publish-before-reply rule. owner: Ziad, tracked here.
- `askOf` keeps one `last` variable for four kinds of continuation; split it if the memo grammar grows. owner: Ziad, tracked here.
