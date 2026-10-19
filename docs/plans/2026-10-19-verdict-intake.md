# Verdict: one intake for any input, chips for every open question

Status: building: Slice 1 reviewed, landing it next
Topic: pstack
Playbook: plan

The owner wants to run verdict on any intake, draft or issue and ask "what would you do from that?", instead of a full triage every so often. They picked: "Reverse the Chips priority override (design questions become decide chips in topic review-<scope>), reshape verdict into the intake and deep paths, drop its next picker and handoff, then run Dylan's doc through it." Then: "YES go potato full. reshape the skill/playbook/ledger etc first, then run the verdict on dylan doc without pursuing the output yet."

## Brief

### What will change?

Verdict on any doc, draft or issue gives one page: pushback, an outcome per item and what to do first. Every open question becomes a chip, a proposed removal aside, and "next" shows the chips board.

### What could go wrong?

An intake could call an item settled on too little reading. New design questions sit in the lower tier, which the default board only counts. "next" now lands somewhere new.

## Teach

Verdict is the review step of the v2 loop. Today it takes one ledger scope, or "next" to pick one, and judges it with a full review page: requirements, lanes, dependents and front matter the ledger checks. That fits one scope, not a teammate's five-feature spec full of bugs and contradictions.

Questions also get lost. A new design question goes onto its scope's review page, but the ledger only reads verdicts, so a question on a closed scope never reaches the board. "next" and verdict's handoff repeat the chips board.

After this change verdict has two paths. Intake reads any input and writes one page that closes at once: pushback, one outcome per item and an order. Each open item becomes a chip. The deep path is today's verdict, run on one scope by its exact id, from a design-question chip about a ledger scope, or from inside another playbook. Chips hold questions, and the ledger keeps answers.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where open questions live | The chips board, as design-question tasks; the review ledger keeps answers, and hard cuts stay ledger questions | Review pages and new scope files, as today | keep ledger questions | big |
| What "next" shows | The chips board, read only, release work first and the rest as counts (look) | Every open task by name | next shows all | small |
| What picks the deep path | An exact scope id, an audit of a scope or group, a design-question chip about a ledger scope, or a verdict another playbook runs; any other input, a file path included, is intake | Any argument the ledger's lookup maps to one scope | lookup picks deep | small |
| Verdicts other playbooks run mid-run | The deep path on the scope that owns the target, as today | Intake like any other input | intake in-run | small |
| The intake page | A one-off page that closes at once and changes no scope's record | One review page per scope the input touches | page per scope | small |
| Cards after an intake | None; the intake offers its chips, running chips in its session cards them, and this run's own close runs no sweep | A sweep at the close that cards them | card at close | small |
| The ledger triage audit | Removed; each open scope already gets its own release-tier card | Keep the one-page audit of every open scope | keep triage | small |
| Hard-cut questions | Stay scope files, and an intake writes one for a proposed removal and offers no chip; they already reach the board as release-tier design questions | Lower-tier design-question tasks like other questions | cut chips | small |
| Bug priority from an intake | The release tier only when this session reran the repro or the tree has a failing test; otherwise the lower tier with the reported steps | The release tier for any exact steps | trust steps | small |
| A Defer that waits on an outside event | A lowest-tier chip that names the event; only an answer or your drop closes it | No chip, listed under Open work | no event chips | small |
| The ledger's next command | Deleted; typing it prints the usage line | Keep it as a read-only alias | keep next command | small |
| Review depth | Architect, one panel round on this plan, and one round on the diff, which also reviews this plan's fixes as built | A second plan round before the build | another plan round | detail |
| The shared block | Re-rendered from a clean copy of the shared source at the commit this checkout last synced from, because its checkout holds another session's uncommitted edits and its newer commit changes chips files | Wait for that session to commit | wait for dotai | detail |
| Topic page link | A new page at https://claude.ai/artifact/XaMiMyTT4RWb4m9QK3zjhp, because https://claude.ai/artifact/BurYxpPqSKECrCQvFQpNo6 no longer opens (look) | Publish no page for this subject | no page | detail |

## Public API

`next` changes owner, a scope review takes its exact id, and an intake is a new call.

```text before
next                     (verdict picks the next ledger item and writes its review page)
verdict <scope>          (a Stop, Pursue or Defer review of one scope)
```

```text after
next                                    (the chips board, read only; writes nothing)
verdict <scope id>                      (a Stop, Pursue or Defer review of one scope)
verdict <a doc, draft, issue or idea>   (pushback, an outcome per item, an order, and a chip for each open one)
```

## Main changes

- **Verdict has two paths.** Intake runs on any `verdict <material>` and writes a one-off page with no front matter: Pushback, Items with one of five outcomes and Order. The deep path is today's Stop, Pursue or Defer review of one scope, started by an exact scope id, `audit`, a `decide` chip in a `review-<id>` topic, or a verdict another playbook runs mid-run.
- **Questions go to chips.** `AGENTS.md`'s Chips priority now sends a new design question to a `decide` chip in topic `review-<scope>`, P1 with `ship: X` when scope X has an open ship item and P2 otherwise, except a hard cut's question, which stays a ledger scope. The review ledger keeps answers, and `review-ledger.mjs ship` still offers its open scopes as P1 tasks.
- **"next" reads the board.** "next" and "what's next" run the chips skill's read-only answer and write no page, by a routing row in `AGENTS.md` that overrides the Plan pages rule and the `plan-page` skill on a "next" answer. `review-ledger.mjs next` is gone, so typing it prints the usage line; verdict's raw session handoff and the ledger triage audit are gone; `ship`'s busy flag and the chips cards carry their jobs.
- **Every Defer lands on the board.** A Defer, from intake or the deep path, offers a chip for the evidence it names. A deep Defer also offers a successor design-question chip that waits on that evidence and owns the renewed verdict.
- **Build closes through chips.** The Build playbook's close runs the chips sweep itself instead of Verdict's One item per session section, and keeps its check that a landed build's item only misses its record.

## Shape

The contract `.agents/playbooks/verdict.md` implements.

**Paths.** The deep path runs on:

- `verdict <scope id>` or `review <scope id>` when the argument is exactly the id of a file in `docs/research/review-scopes/`, and the scope is not a PR;
- `audit <scope or group id>` and `verdict <group id>`, which give each scope of the set a verdict, as today's `audit <scope>` does;
- a `decide` chip whose topic is `review-<id>`, when `<id>` names a file in `docs/research/review-scopes/` or the chip's `writes:` names `docs/research/review-scopes/<id>.json`;
- a `verdict` that another playbook or skill runs inside its own run, on the scope that owns its target, or on a scope file it adds for that target when no scope owns it: Build's verdict on a replaced panel-fix mechanism (`build.md:22`), Bug fix's verdict on an owner after failed fixes (`bug-fix.md:14`), `best-api repair`'s verdict on a correction (`best-api.mdc:87`) and `research`'s Stop, Pursue or Defer assessment (`research.mdc:93`).

Any other `verdict <material>` or "what would you do from <material>" runs intake: a pasted doc, a file path even when `lookup` maps it to one scope, an issue, a PR, a draft or a one-line idea. Intake uses `lookup` only for context. A bare `verdict` takes the material already in the request and asks for some when there is none. A paste with no ask is not a verdict request. "again" reruns the same path on the same target in the same session; an intake run again folds what it finds into its own earlier offers and offers nothing twice. A `decide` chip in any other topic, a `review-` topic that names no scope included, answers its question on its own plan page with the deep path's method, and touches the ledger only when a scope owns its question. "review PR <number>", a lone bug report and work on a public issue keep their owners.

**Outcomes.** "Open question" is an item outcome, never the page's `## Open questions` section.

| Outcome | Intake gives it when | Evidence bar | Writes |
| --- | --- | --- | --- |
| Bug | Current behavior breaks a law, a decision or the user's job | The defect at a path and line read this session, within the claim width of `docs/vision/common.md`'s Claim Width table; P0 or P1 only when this session reran the repro or a failing test exists, otherwise P2 with the reported steps | A `fix` chip, a `decide` chip when the fix is itself a design choice, or a `folded` row on the open task that covers it |
| Settled | Current law, a review head, a subject decision or landed code with its test answers the exact question, or the input's own later decision withdrew the proposal | The deciding artifact; a ledger head whose `lookup` freshness is `matching` | Nothing; `open <n>` reverses it |
| Stop | The proposal earns no further work: a false premise, a law it breaks without arguing against it, or a shipped API that already does the job | The law or fact at a path and line, with the incumbent shown; missing evidence is never Stop, and an argument that the law is wrong is an Open question | Nothing and no scope verdict; `open <n>` reverses it |
| Defer | A named observation or prerequisite can change the answer | What would settle it and which result changes the answer | A chip for that evidence: one that waits on a real task, plan or PR where one exists, a P3 measurement chip when the measure cannot fit the hour, or, for an outside event no wait can name, a P3 chip whose finding names the event and where to look |
| Open question | A real choice remains between owners, stored shapes, APIs or behaviors, the input argues that a standing decision is wrong, or it proposes removing behavior | The question, the evidence and the lanes seen, not judged | A `decide` chip by the Topics rules. For a proposed removal the owner did not ask for, intake instead keeps the behavior, writes a scope file for its question, as the architecture reference's Hard cut says, and offers no chip, because `ship` offers that scope |

**Depth.** Intake settles an item only on an artifact it read this session, and only as wide as that artifact proves: a source trace shows ownership, not a browser or screen-reader result. It never changes a scope's accepted architecture and never gives a Pursue, because those need the deep path's requirements, lanes and dependents. An outside probe or a confidence label is a claim, not evidence. An item that needs more than its cited spans and the governing law becomes an Open question or a Defer. When in doubt, it offers the chip.

**Topics.** A chip reuses topic `review-<scope>` only when that scope's ledger question owns the item; a different question takes `review-<new id>`, and its deep session writes the scope file. Its `writes:` names `docs/plans/topics/<scope>.md` and the paths the answer would change, plus `docs/research/review-scopes/<new id>.json` for a new scope, never the whole `docs/plans` folder, because the chips skill's Offer mode makes a task wait on every active plan whose files it writes. A `decide` chip is P1 with `ship: X` when scope X has an open ship item and P2 otherwise. Intake reads `chips all --session <id>`, or searches the ledger for each item's terms where the runtime's session tool gives no id, and the `chips brief` of each task whose title or topic touches an item, because the default board only counts P2 and P3 work. For an Open question or Defer on scope X, the first rule that matches decides, and a chip carries every wait the rules above it found:

1. An open task already asks the same question: a `folded` row onto it when it is offered with no card, with `kind: decide` when it was a fix; an offered `decide` chip that waits on it with `task:` when it holds a card or is started.
2. X is unreviewed, a fork or pursue-not-adopted, no task serves its ship item and `ship` does not mark it busy: the ship item's own offer, with `ship: X`, as `kind: decide` for pursue-not-adopted, with the intake question in its finding. A busy item goes on to the rules below.
3. The question challenges a design that an open task or plan builds: a `decide` chip that waits on nothing, whose finding names that task or plan.
4. A plan that `lookup` lists for X with an active, held or planning `Status:` answers the question: a `decide` chip that waits on `run:` with that plan.
5. Otherwise: an offered `decide` chip.

When `append` refuses a row, follow its message. A fold onto a closed task becomes a new offer, and Pushback names the input's stale reference.

**Page.** `docs/plans/<date>-<slug>-intake.md` and its decision log, with no front matter and no `Topic:`, so it changes no scope's head, busy flag or subject page. `Status: done: <n> items, <k> chips offered, <f> folded` closes it at once, and `Playbook: verdict`. Sections: a lead paragraph, Brief, Pushback, Items (`#`, item, outcome, scope, strongest reason, evidence, next: a chip id or none), Order, Defaults for real picks only, Close. It paraphrases the input and cites it by section, because it lands on the public branch. It lands through `land.mjs` before the hand-back, so card sessions can read it, and publishes with `page-stop.mjs stop`. The reply is the link, the landed commit and one line naming the chips it offered, which `/chips` in this session cards, or `/chips all` once this session is archived.

**Bounds.** Intake runs no lanes, `architect`, panel, arena or research, and writes no review page, subject file, code, test or doc besides its page and log, and no scope file besides a proposed removal's. It reads the input, the spans it cites, the governing law, `lookup` for the scopes it touches and the chips board as Topics says, plus one repro rerun of at most ten minutes for each claimed P0 or P1 bug. It gives no Pursue, plan, build or scope verdict, sends no public message, runs no chips sweep and takes one input per session.

**Deep path.** A started `decide` chip in a `review-<id>` topic logs its task's rows from its brief, then creates the scope file when its `writes:` names one that does not exist yet and the subject file when the scope has none, both moved from the deleted first stop. It gets a verdict on its own question first, even on a pursued or busy scope, and a Pursue that keeps the head's target then goes to the Plan playbook or back to the open plan. A Defer sets `Status: blocked: waiting on <evidence>`, offers its evidence chip by the Defer row and offers a successor `decide` chip in topic `review-<scope>` that waits on the evidence chip, and also on the started task when a `decide` chip ran the review; the successor owns the renewed verdict. A record fix lands its fix and ends. The close keeps today's quick chips sweep, except in a session a card started, which runs none, as the Suggested tasks rule says. The Verdicts table, the rule-is-wrong lane, the reconcile step, the front matter, `check` and Never leave a verdict unwritten stay as they are.

**Sessions.** One input, one scope or one audit's set per session. A session that already gave a verdict leaves other inputs and scopes to chips: it offers a chip that runs `verdict` on the new one, and the owner starts it from a card or with "start <id>". "again", a verdict another playbook runs mid-run, and a Pursue's own plan and build are the exceptions. The session title rule stays.

## Design

Architect ran three runners, Opus, gpt-6-astra and gpt-6.1-sol, all at xhigh, on one brief. All three converged on this shape: a one-off intake page, chips for open work in the existing grammar, P2 by default, the ledger's `next` deleted and no shared file changed. A blind Opus judge and the lead both picked the Opus candidate as the base, 27 to 27 to 24.

- Grafts from gpt-6.1-sol: "next" overrides the Plan pages "next" answer page from `AGENTS.md`; a Defer whose only prerequisite is an outside event still offers a chip instead of turning into a Stop; a proposal the input withdrew is Settled.
- Grafts from gpt-6-astra: the claim-width evidence bar; any `verdict <material>` is intake, PRs and one-line questions included; an Open question outcome is never a page question.
- From the judge: intake offers chips and runs no sweep, and hard cuts stay scope files, because `ship` already offers a new hard-cut scope as a P1 `decide` chip.
- Rejected: gpt-6.1-sol's `ship` busy extension, because a Pursue's own session keeps its plan in flight and reading the shared chips parser would change what `chips.md` says busy means; gpt-6-astra's empty review keys, because a missing front matter already does the same.
- Control: editing only the Chips priority line and adding one intake bullet keeps `next`, the handoff and the triage audit, which misses the owner's "drop its next picker and handoff".

### Plan panel

One round, Opus, gpt-6-astra and gpt-6.1-sol at xhigh, found seven critical problems, each checked against the code:

- Landing the intake page would also land the unreviewed Slice 1, because `land.mjs` squashes the whole worktree. Slice 1 now closes, gets its diff panel and lands before Slice 2 starts.
- This build's own close would card the intake's chips. The close now skips the sweep, on the owner's "without pursuing".
- Other playbooks run `verdict` mid-run and expect a full verdict. Those calls keep the deep path.
- "A `decide` chip runs the deep path and creates a scope" would have turned 62 design-question topics outside `review-*` into ledger scopes. Only `review-<id>` chips touch the ledger now.
- Re-rendering from dotai `origin/main` would also have pulled in its newer chips files. The render now uses the commit this checkout last synced from.
- `lookup` maps a plan path to its scope, so `verdict <a review doc>` could have started a deep review and a build. Only an exact scope id picks the deep path now.
- This plan carried review front matter without `review_scopes`, which `review-ledger.mjs check` refuses; it now has none, like the other pstack plans.

The warnings added the Topics precedence, the caller sweep's missing subject files and live brief, the schema lines that still create scope files at intake, the explicit hard-cut exception, the deep Defer successor, the card-session sweep rule and the stronger proofs below.

Limits the build keeps: no check fails when an intake item that needs a chip has none, so Slice 2's proof checks it by hand; `append` validates and appends without a lock, so two sessions offering on one topic at once can race; every Pursue still becomes a P1 build through `ship`, as the owner set on 2026-10-19; a challenge to a build someone already carded cannot make that build wait, so its chip's finding names the build; and an outside-event chip has no wait that clears on the event, so only an answer or the owner's drop closes it.

Diff panel

One round on the Slice 1 diff, the same three seats at xhigh, found five critical problems, each checked against the text and applied:

- A started design-question chip on a pursued or busy scope skipped its verdict. It now gets one first, and rule 2 passes a busy ship item on to the rules below.
- A proposed removal had no intake route. Intake now keeps the behavior, writes the removal's scope file and offers no chip.
- A `review-` topic that names no scope would have created a scope file. The deep path now needs a real scope id, or a `writes:` that names the new scope file.
- A `writes:` naming all of `docs/plans` would have made every chip wait on every active plan. It names the subject file instead.
- A typed verdict's Defer got no successor. Every Defer now offers one.

Twelve warnings were applied, three dismissed and one deferred to the dotai chips skill. `review-ledger.mjs next` now prints the usage line, because the task that still ran it has landed.

## Scope

- In: `.agents/playbooks/verdict.md`, `.agents/rules/verdict.mdc` and its generated skill, `AGENTS.md` outside the pstack block plus the block's re-rendered playbook line, `.agents/playbooks/build.md`, `.agents/playbooks/references/architecture.md`, `tooling/scripts/review-ledger.mjs` and its tests, `docs/research/schema.md`, `docs/development/agent-skills.md`, `docs/development/enforcement.md`, the subject files `correct.md`, `plan-page.md` and `react.md` where they teach the deleted steps, the two open `next` items in `docs/plans/2026-10-06-reflect-lessons.md`, and `pstack.md` at the close. Then one intake run on Dylan's spec doc.
- Out: shared files (`chips.md`, the chips skill, `decisions-check.mjs`, `tasks.mjs`, `pages.md`, the block template); dated plans and review records that mention `next` or the triage audit as history; fixing, planning or building any item the intake finds; carding its chips.

## Steps

### Slice 1. Reshape verdict, chips routing and the ledger

- [x] 1.1 Rewrite `.agents/playbooks/verdict.md` to the Shape above: its `when:`, the paths, intake's outcomes, depth, topics, page, bounds and steps, then the deep path, sessions and words. Proof: `check-playbooks.mjs` passes; its `when:` names no "next"; `git grep` finds no `review-ledger.mjs next`, `start_session` handoff or ledger triage audit in it; and it holds the Outcomes table and the five Topics rules.
- [x] 1.2 Rewrite `.agents/rules/verdict.mdc`'s description, argument hint and body, then run `pnpm run prepare`. Proof: `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` passes and the generated skill shows the new hint.
- [x] 1.3 Edit `AGENTS.md` outside the block: reverse Chips priority with the hard-cut exception, and fix the routing rows, one of them sending "next" and "what's next" to the chips skill's read-only answer with no page. Re-render the block from the clean dotai copy at `db0651a`, the `synced.source` in `.agents/pstack.json`. Proof: `sync-pstack check` from that copy passes, the block's diff is the Verdict line alone, and `git diff --stat -- .agents/pstack` is empty.
- [x] 1.4 Delete `next`, `uncommittedMembers` and their dispatch from `review-ledger.mjs`, drop `next` from its usage line, and make `review-ledger.mjs next` exit non-zero with a line saying "next" now reads the chips board and `ship` lists the open scopes, because a started task's brief still calls it. Port the 14-day expiry test to `ship`'s busy flag, cut the two other `next` tests and switch the smoke assertion. Proof: `node --test tooling/scripts/review-ledger.test.mjs` passes, the ported test fails when `ship` ignores the expiry, and `review-ledger.mjs next` prints that line and exits non-zero where it exited 0 at base.
- [x] 1.5 Repoint callers: `build.md`'s close, `architecture.md`'s hard-cut sentence, `schema.md`'s open-questions paragraph, its new-proposal sentence and its Commands row, `enforcement.md`'s in-flight row, `agent-skills.md`'s rows, its cards paragraph and its verdict line, `correct.md`'s `next` decision, `plan-page.md`'s first-stop, triage-audit and "next" answer lines and its open-work item, `react.md`'s open-work item on a `next` flag, and the two `next` items under `2026-10-06-reflect-lessons.md`'s open work. Proof: `git grep -n -E 'review-ledger(\.mjs)? next|One item per session|first stop'` over `AGENTS.md`, `.agents/`, `docs/development/`, `docs/research/schema.md` and `docs/plans/topics/*.md` prints nothing, and `git grep -n 'triage audit'` there prints only links to the dated 2026-10-04 audit.
- [x] 1.6 Smoke the changed routes and their neighbours with `sync-pstack smoke`: a pasted spec with "what would you do from this?", `verdict docs/plans/2026-05-29-plite-pagination-architecture-review.md`, `verdict pagination`, "next", a lone bug report and "review PR 123". Proof: each answer names the expected path and where it stops, the path answer picks intake, and "next" writes no page, logged in the run directory.
- [x] 1.7 Writing passes on Slice 1: `unslop` on the changed rules, docs and this plan; `deslop` and `no-comments` on the ledger diff. Then one panel round on the Slice 1 diff; its fixes land without another round. Land Slice 1 through `land.mjs`.

### Slice 2. Run the intake on Dylan's doc

- [ ] 2.1 In this worktree after Slice 1 lands, run the new verdict intake on `input-plite-feature-specs.md`: page, offers and order, with no fix, plan, build, card or sweep. Land only the page and its log. Proof: `plan-page.mjs --check` passes on the intake page; every Bug, Defer and Open question row names a chip id that `chips brief` prints or a task it folded into, and every Settled and Stop row cites a path; the ledger's new rows are only `offered` and `folded`; `review-ledger.mjs show` gives every scope the input touches the same head before and after; and the landed commit changes only the page and its log.

### Close

- [ ] Fold the delta into `docs/plans/topics/pstack.md`: its Public API, the "next takes the move" and hand-back sweep lines, and its stale Verdict handoff item under Open work. Write the Close and publish the page.
- [ ] skip: the chips sweep at this close, because the owner said "without pursuing".
- [ ] Run `/pstack:correct` on the class "wording a change removes from one doc stays in another", the rule-only row of `docs/development/enforcement.md` that the panel's caller-sweep finding repeats.

## Proof

Logs go to `docs/plans/artifacts/2026-10-19-verdict-intake/` in the main checkout through `node .agents/pstack/proof.mjs`. The base control at `98e4608f4d` already showed that a fixture intake page with no front matter leaves `review-ledger.mjs status` and `check` output unchanged and passes `plan-page.mjs --check`, and that `next` exits 0 there.
