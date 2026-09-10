---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. Discovers available MCPs and queries each evidence category (source control, issue tracker, long-form docs, real-time chat, infrastructure observability, error tracking, product analytics warehouse) in parallel, then returns a cited read on decisions and tradeoffs. Use how for runtime behavior."
---

Read the [Codex runtime adapter](../poteto-mode/references/codex-runtime.md) before applying this skill. It maps platform tools and authority; the complete engineering method below remains in force.

# Why

Investigate the motivation and intent behind code. Why was it built this way? What edge cases were considered? What product, business, or operational constraints shaped the design? What alternatives were rejected, and why?

Companion to the `how` skill. `how` answers what the code does and how it works. `why` answers what forces led to its shape.

## How this skill works

Historical context spreads across seven evidence categories: source control history, issue or ticket tracking, long-form documents, real-time team chat, infrastructure observability, error or exception tracking, and product analytics warehouses. You cannot predict from the question alone which one holds the answer, so the skill enumerates available MCPs at run time, maps each to a category, queries all seven in parallel, then synthesizes with explicit confidence calibration. Null results from searched categories are first-class evidence about how the decision was made; report them alongside positive findings. The default is coverage, not minimalism.

## Operating Posture

Operate as a careful, cautious, precise investigator. Think like a detective piecing together a historical case from fragmentary records. When the record is thin, say so.

Concretely:

- **Evidence before narrative.** Collect the pieces first, then see what story they support. Never pick a story and recruit the evidence that fits it.
- **Precision over polish.** Prefer the exact quote and citation over a smooth paraphrase. A reader should be able to follow any claim back to its source and verify it in under a minute.
- **Consider what you haven't seen.** The evidence you find is a sample, not the whole truth. Before concluding, ask what you would expect to see if an alternative explanation were true, and whether you looked for it.
- **Name the gaps.** If a thread goes cold, a source isn't searchable, or a question has no answer, document the gap. Don't paper it over with an authoritative-sounding guess.
- **Hedge on purpose.** When evidence is indirect, your language should signal it ("appears to", "likely", "suggests"). Confidence-matching phrasing is a feature of the output, not a stylistic choice the synthesizer may override.
- **No shortcut by code-reading.** The code tells you what it does, rarely why it exists. Resist inferring intent from code shape.

This posture is the working method, not a disclaimer.

## Core Epistemics

This skill builds a **patchwork understanding** from fragmented historical evidence. Tickets go stale. Chat threads get deleted. Commit messages lie. People change their minds between the PR description and the implementation. The original author may have left the company.

Be ruthlessly honest about what you know versus what you're inferring. The goal is not a satisfying story; it is to surface evidence, calibrate confidence, and let the user decide.

Principles:

- **Cite everything.** Every claim about intent should reference a specific commit hash, PR number, ticket ID, doc URL, chat permalink, or code comment. If you can't cite it, it's inference, not fact, and must be labeled as such.
- **Prefer "appears to" over "because".** Hedge when evidence is indirect. Reserve confident language for direct, explicit evidence.
- **Surface contradictions.** If two sources disagree, show both. Don't quietly pick the one that fits your narrative.
- **Acknowledge gaps.** If a question has no answer in any source you searched, say so. An honest "we couldn't find out why" beats a confident guess.
- **Multiple hypotheses are valid.** When the evidence fits several stories, present them all with the evidence for each. Let the user triangulate.
- **Beware rationalization.** Code that makes sense today may have been written for reasons that no longer apply, or for no good reason at all. Don't retrofit intent.

Read `references/epistemics.md` for the full confidence framework and phrasing guide. The synthesizer must follow it.

## Step 1. Understand the Target and the Question

Parse what the user is asking. The **target** is usually a chunk of code, a pattern, a feature, or a named design decision. The **question** is usually one of:

- "Why was X designed this way?" Design rationale.
- "Why do we do X instead of Y?" Tradeoff or alternatives.
- "What edge cases motivated this?" Defensive reasoning.
- "What business or product constraint led to this?" External forcing function.
- "Why does this code still exist?" Dead-code territory.
- "What's the history of X?" Broad archaeological sweep.

If the target is vague ("why do we do it this way?" with no clear referent), make your best guess from conversation context (open files, recent edits, cursor location, what was just discussed). State your interpretation briefly so the user can redirect if you're off, then proceed.

## Step 2. Establish the Code Anchor

Before spawning investigators, anchor the investigation in concrete code. You need:

- The relevant file path(s) and line range(s)
- The key symbols (function names, class names, constants)
- An initial commit list. The last few commits touching the target.
- PR numbers from merge commits (pattern `(#1234)` in the subject line)

Build this inline. It's cheap, and every investigator needs it.

```bash
# Blame target lines for last-touch commits
git blame -L <start>,<end> <file>

# Full file history, with patches, through renames
git log --follow -p -- <file>

# Last N commits touching the file, PR numbers visible
git log --oneline -20 -- <file>

# Extract PR numbers from a commit message
git log -1 --format=%B <commit>
```

Pull PR bodies and discussion via `gh` for any substantive commits:

```bash
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews
```

Capture this as seed context (file paths, symbols, commits, PR numbers, linked ticket IDs). Pass it to the investigators so they don't rediscover it.

## Step 3. Spawn Parallel Investigators (default posture)

**Default to the full parallel investigation.** Each evidence category lives in a different kind of system, and you cannot tell from the question alone which one holds the answer without looking. So look across every available category, in parallel, by default.

### Discovery

Before spawning investigators, list the available MCPs from the Cursor environment. Use the available-tools map when present. Otherwise inspect the `mcps/` directory Cursor exposes for enabled MCP servers.

Map each available MCP to one evidence category:

1. Source control history
2. Issue / ticket tracker
3. Long-form documents
4. Real-time team chat
5. Infrastructure observability
6. Error / exception tracking
7. Product analytics warehouse

Source control is always available through git and `gh`. For the other six, classify using the MCP name, server instructions, tool names, and resource descriptors. If an MCP could fit more than one category, choose the one matching its primary evidence. Record ambiguous cases in the coverage map.

Aim for a complete **coverage map**, not a minimal one. A null result from an issue tracker is evidence the decision was not ticketed, a useful fact in itself. Document the null, don't skip the search.

Launch all matching investigators in a single message so they run concurrently. One investigator per category lets each specialize in one tool's query vocabulary and result shape. Don't ask one agent to cover multiple MCPs.

Subagent config (each):
- `subagent_type`: `generalPurpose`
- `model`: your configured why-investigators model (default `inherit-parent`)
- `readonly`: `false` (agent mode). **Do not use readonly/Ask mode.** It strips MCP access, which disables MCP-backed investigators entirely. The source control investigator would be safe in readonly, but keep modes uniform. Investigators still shouldn't write anything. That's a posture, not a sandbox.

Each investigator gets:
1. The base prompt from `references/investigator-prompt.md`
2. The category playbook `references/sources/<source>.md` for the selected MCP, adapted from the examples in `references/source-playbook.md`
3. The cross-cutting `references/sources/incident-postmortem.md` **if the target code looks defensive** (null checks, retry logic, timeout handling, rate limiting, feature flags, egress guards, OOM handlers)
4. The code anchor from Step 2 (file paths, symbols, commit hashes, PR numbers, ticket IDs)
5. The user's original question

### Investigator roster. One per available evidence category

Spawn one investigator per category that has a matching MCP. Each owns exactly one tool or MCP.

Each entry lists what the category physically contains and the kind of "why" it uniquely surfaces. Use it to know what to expect back, how to name a gap when a category returns empty, and (only in the rare provably-irrelevant case) to justify a skip. Every category overlaps, but each owns a kind of evidence the others cannot recover.

1. **Source control investigator**. Git history, `gh` for PRs, code comments, tests. Always spawn; the only guaranteed source. Best at surfacing *implementation-time rationale captured during review*. PR descriptions stating the problem, review threads debating alternatives, inline comments encoding non-obvious constraints, test names that encode motivating edge cases, and commit messages linking tickets or incidents. Most trustworthy because it ties directly to the diff that shipped.

2. **Issue / ticket tracker investigator** (e.g. Linear, Jira, GitHub Issues, Plane, Shortcut MCP). Tickets, project docs, status updates, spec attachments. Best at surfacing *the product or business forcing function*. Customer requests ("Acme needs X for their SOC2 audit"), compliance deadlines, parent-initiative framing ("Q3 enterprise readiness"), ticket-level scope changes, and labels that categorize the motivation (`customer:*`, `incident-followup`, `compliance`, `perf-regression`). Strongest when the why is external to engineering.

3. **Long-form documents investigator** (e.g. Notion, Confluence, Google Docs, Coda MCP). PRDs, specs, RFCs, design docs, ADRs, postmortems, team pages, meeting notes. Best at surfacing *long-form design rationale*. Problem statements, explicit "alternatives considered" and "rejected approaches" sections, strategy documents that set priorities, ADRs with finalized decisions, and postmortem action items that tie directly to code. Where the why is written out before it becomes code.

4. **Real-time team chat investigator** (e.g. Slack, Discord, Microsoft Teams, Mattermost MCP). Feature-name and symbol searches, PR URL mentions, incident channels (`#sev-*`, `#incident-*`), author-handle activity around the ship date. Best at surfacing *real-time deliberation that never reached a doc*. Fire-drill decisions during incidents, Q&A between the PR author and reviewers, casual "we decided X because Y" threads, and rationale for small changes that didn't warrant a PRD. Especially important when the source control, ticket, and doc paper trail is thin.

5. **Infrastructure observability investigator** (e.g. Datadog, New Relic, Honeycomb, Grafana, Splunk MCP). Metrics, monitors, dashboards, logs, APM traces, formal incidents. Infra/runtime view. Best at surfacing *infrastructure and runtime reality that motivated the code*. Monitor thresholds whose numbers match code constants, metric spikes in the window right before a PR merge, dashboards created as postmortem action items, incident timelines that reference the target. Strongest when the target reacts to an infra signal (timeouts, retries, rate limits, circuit breakers).

6. **Error / exception tracking investigator** (e.g. Sentry, Rollbar, Bugsnag, Airbrake MCP). Issues, events, stack traces, releases. Best at surfacing *the specific exceptions and error trajectories that motivated defensive or corrective code*. Stack traces that pass through the target function, issues whose first-seen/last-seen windows bracket the PR ship date, release correlations that show an error stopping at a specific version. Strongest for catch blocks, null guards, type checks, retries, and other defenses.

7. **Product analytics warehouse investigator** (e.g. Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift MCP). Product-analytics events, experiment and feature-flag exposure tables, usage and billing events, query history, warehouse telemetry. Product/data view. Complements infrastructure observability by covering *user behavior and data reality* around the ship date rather than infra metrics. Best at surfacing *product and data reality that shaped the code*. Feature-usage trajectories (a step-function ramp from zero is strong evidence that this PR launched it), experiment/flag exposure data tied to ship decisions, pre-ship distributions that reveal where a threshold constant came from (e.g., `limit = 128 * 1024` matching the p99 of an upload-size column), and data-pipeline scale evidence for migrations/backfills. Strongest for flag-gated code, experiment-driven ships, data migrations, and "where did this number come from" questions.

### When to skip an investigator

Only skip with an **explicit, written justification** that goes in the final "Sources Consulted" section. Two valid reasons:

- **No MCP is available for that category** in this environment. Flag this as a gap, not a choice. Example: "Real-time team chat skipped. No matching MCP available, so the conversational record was not searchable."
- **The source is provably irrelevant**, not just "probably irrelevant." A high bar. Example: "Error / exception tracking skipped. Target is a build-time script with no runtime code path." Not "probably not in error tracking, it's a feature not an error."

"It's pure feature code, error tracking won't have anything" is **not** sufficient, and neither is "I doubt long-form docs would have this." Run the search; let the null result speak. The cost of an investigator returning empty is one subagent. The cost of missing a design doc that actually exists is a wrong answer.

If your scope assessment suggests a single-commit trivial target where the PR description already contains the complete answer, you may answer inline **only after** confirming all seven available category searches would be redundant. Say so explicitly. This should be rare.

## Step 4. Synthesize

Spawn one synthesizer subagent:

- `subagent_type`: `generalPurpose`
- `model`: your configured why-synthesizer model (default `inherit-parent`)
- `readonly`: `false` (agent mode). The synthesizer's quality check spot-verifies citations, which can require MCP access. Readonly/Ask mode strips MCPs and defeats that.

The synthesizer gets:
1. The investigator findings, including any null results and any categories skipped with justification
2. The code anchor from Step 2 (file paths, symbols, commit hashes, PR numbers, ticket IDs)
3. The user's original question
4. The epistemics framework from `references/epistemics.md`
5. The synthesizer prompt template from `references/synthesizer-prompt.md`

Its job is the final output: a confidence-weighted, evidence-cited narrative with clearly separated "what we know" and "what we're inferring" sections, plus honest acknowledgment of gaps and null-result sources.

## Step 5. Present

Take the synthesizer's output and present it to the user. You may lightly edit for clarity or add context from the conversation, but **do not rewrite the confidence language**. The epistemic framing is the product. Dropping the hedges to sound more authoritative is the exact failure mode this skill exists to prevent.

## Output Format

The final output uses this structure. Adapt as needed, but keep the confidence separation intact.

**The Question**. Restate what the user asked, concisely.

**The Code in Question**. File paths, line ranges, and key symbols. One or two lines so the reader is anchored.

**What We Found (direct evidence)**. Claims with explicit citations (PR #, ticket ID, doc URL, chat permalink, commit hash, code comment with file:line). Each bullet is a thing we have textual evidence for. Use present tense and quote or paraphrase the source.

**What We Can Reasonably Infer**. Claims well-supported by indirect evidence or combinations of signals, but not explicitly stated anywhere. Each bullet must explain the inference chain: "Given A and B, it's likely that C." Use hedged language ("appears to", "likely", "suggests").

**Competing Hypotheses**. If the evidence fits multiple stories, list them. For each, give the hypothesis, the evidence for it, and the evidence against it. Don't force a winner when the record doesn't support one. (Skip this section if there's a clear answer.)

**What We Don't Know**. Explicit gaps. Questions the user asked that the evidence didn't answer. Sources we searched and came up empty. Be specific. "We searched the issue tracker for 'rate limit' and found no ticket discussing this specific threshold" is more useful than "we don't know why."

**Sources Consulted**. One line per investigator, including the ones that returned nothing. The reader should see at a glance (a) which MCPs were queried, (b) which came back empty, and (c) which were skipped and why. This coverage map lets the user judge breadth and redirect if something obvious was missed.

Format each line as: `- <Source>: <what was searched>. <what was found, or "no relevant results," or "skipped. reason">.`

Example:
- Source control (git/gh): `git log --follow backend/retry.ts`, PRs #49074, #47812. Found PR #49074 introduced exponential backoff and linked ENG-4421.
- Issue tracker (Linear): searched for "retry" and ENG-4421. Found ENG-4421 parent issue but no discussion of backoff parameters.
- Long-form docs (Notion): searched for "retry policy," "backend retries," "ENG-4421." No relevant results.
- Real-time team chat (Slack): skipped. No matching MCP available in this environment. Gap: conversational record not searched.
- Infrastructure observability (Datadog): searched for `retry_count` metric and monitors around 2024-08-14. Found monitor "Upstream 5xx rate > 1%" created same day as PR #49074.
- Error / exception tracking (Sentry): searched for issues first-seen in Aug 2024 with stack through `retry.ts`. Found issue SENTRY-3821 spiking in the week before the PR.
- Product analytics warehouse (Databricks): queried `<your_analytics_db>.<schema>.stg_backend_upstream_retry` for the 30-day window around 2024-08-14. Daily failure-classified event count fell from ~1.2k/day pre-PR to <50/day post-PR. Also checked `system.query.history` for relevant migration queries. None found.

After the Sources Consulted block, if the user's `why` question is a precursor to actually changing this code, convert the lineage findings into a Preserve / Change / Avoid / Risk constraint set suitable for planning the change.

## Common Failure Modes to Avoid

- **Confident storytelling**. A plausible narrative built from thin evidence. A bullet with no citation goes in "inferred" or "hypotheses," not "what we found."
- **Citing the code as evidence for its own intent**. "Handles the null case because it checks for null" is mechanics, not motivation. Motivation comes from an external source (PR discussion, ticket, comment, conversation) or is labeled as inference.
- **Recency bias**. Assuming the most recent commit is authoritative. The current shape is often the accretion of many earlier decisions. Trace back.
- **Sycophantic agreement**. If the user suggests a reason ("I assume this is for performance?"), treat it as a hypothesis and check the evidence independently, don't just confirm it.
- **Skipping the gaps section**. An honest accounting of what you couldn't find out is part of the value.
- **Skipping investigators by anticipation**. Deciding up front that "long-form docs probably don't have this" or "this isn't an error tracking thing" without searching. The default-to-all-seven posture prevents this. A null result is a data point; a skipped search is a blind spot.
- **Collapsing investigators into one agent**. Each MCP has its own query vocabulary, result shape, and pitfalls; pooling them dilutes specialization and makes coverage harder to reason about. Always one investigator per category.

## Reference Files

- `references/epistemics.md`. Confidence tiers and phrasing guide. The synthesizer must follow it.
- `references/investigator-prompt.md`. Base prompt template for investigator subagents.
- `references/source-playbook.md`. Index pointing at the category playbooks below.
- `references/sources/*.md`. One self-contained example playbook per category, plus cross-cutting `incident-postmortem.md`. Give an investigator the single file that matches its category and adapt it to the available MCP.
- `references/synthesizer-prompt.md`. Prompt template for the synthesizer subagent, including the output format.
