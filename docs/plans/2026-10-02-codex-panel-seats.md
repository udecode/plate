# Panel reviews with Codex seats

Status: executed
Topic: pstack

## Public API

How a review runs. Before is today.

```text before
$cross-review <plan> from Claude Code, /cross-review <plan> from Codex    (big work only)
$cross-review docs/research/review-records/<id>.json
.agents/skills/autoreview/scripts/autoreview --engine codex --model gpt-6.1-sol ...    (high-risk diffs)
interrogate reviewers: opus, opus, opus
arena runners: opus, opus, opus
decision-trail reviewer: a same-family Opus subagent
```

```text after
(nothing to type: big work runs /pstack:interrogate, then asks Build now / Another round / Hold)
(nothing to type: a Pursue verdict's record gets the same panel)
/pstack:interrogate on one commit in a detached worktree    (high-risk diffs)
interrogate reviewers: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
arena runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
decision-trail reviewer: a codex:gpt-6.1-sol @xhigh seat
node .agents/pstack/cross.mjs --to codex --model gpt-6-astra --effort high --timeout 1800 --prompt-file <file>    (one Codex seat)
$cross-review <plan>    (typed only)
```

## Main changes

- **pstack's panels get their model diversity back.** `interrogate` and `arena` seat Opus, gpt-6-astra at high and gpt-6.1-sol at xhigh instead of three Opus runs, so the adversarial signal comes from different models, as pstack designs it.
- **A Codex seat runs through `cross.mjs`, read-only.** `node .agents/pstack/cross.mjs --to codex --model <model> --effort <effort>` runs `codex exec --sandbox read-only` on the filled prompt file, in both runtimes, and exits non-zero when the seat gives no answer. Reversed from the approved "A Codex seat is a thin Sonnet subagent. OpenAI's `codex-plugin-cc` (pinned `v1.0.6`, project scope, like pstack) ships `codex:codex-rescue`, which forwards one prompt to Codex's task runner and returns the answer unchanged." Panel round 1 showed that forwarder re-tokenizes the prompt, so a `--model` token in a reviewed diff swaps the seat's model, defaults to `--write`, and runs each task in one Bash call a long review outlasts.
- **Big work reviews itself and then asks you.** When a big plan is ready or a big execution finishes, the lead runs `interrogate` with the Codex seats, applies or dismisses each finding with a logged reason, repeats once when an applied critical finding remains, and then asks Build now, Another round or Hold. Small plans ask Build now or Hold.
- **cross-review and autoreview stop being stages.** The manual relay goes, and high-risk code gets `interrogate` on one commit in a detached worktree instead of a separate autoreview run. Both stay installed for when you type them.
- **The page shows the review.** Its header tags the round count and the latest seats, and a review history at the bottom lists each round's findings by severity with what was applied and dismissed.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Seats | Opus, gpt-6-astra at high, gpt-6.1-sol at xhigh, picked by you | Two Opus seats | "two Opus seats" |
| Seat path | `cross.mjs`, no plugin; reversed from your "Project scope, pinned" pick for `codex-plugin-cc` | The plugin's `codex:codex-rescue` agent, pinned at project scope | "pin the codex plugin" |
| Code arena | Every slot on Opus, because a `cross.mjs` seat cannot write | A write-capable Codex seat in its own worktree | "codex arena for code" |
| Arena seats | Unproven until the first design arena runs through them, because only interrogate rounds ran here. owner: user, tracked here | Run a small design arena now | "prove the arena" |
| Severity scale | interrogate's own `critical`, `warning`, `nit`; a critical finding blocks | Map to cross-review's P0 to P3 | "use P levels" |
| plate-2 gate key | Keep the `P1 autoreview` gate row key that `check-plate-feature.mjs` matches; its text now names the panel review. owner: user, tracked here | Rename the key and migrate the open plans that carry it | "rename the gate" |
| Models files | I updated the panel lines in `~/.claude/pstack-models.md` and `~/.codex/pstack-models.md` and dropped their Opus-only and manual-relay notes | Leave them | "leave my models files" |

## Steps

1. - [x] **Seat path.** Approved as "Pin the plugin": sync-pstack pinned `codex@openai-codex` beside pstack. Reversed after panel round 1: `cross.mjs` takes `--model` and `--effort` and is a core helper no `skip` removes, and the pin code is gone. Proof: tests that fail first; both projects' `.claude/settings.json` match git. Done: `skills/sync-pstack/assets/pstack/cross.mjs` and `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` in dotai; `git diff .claude/settings.json` is empty in plate-2 and Ellie.
2. - [x] **Seat override.** The block says a panel entry `codex:<model> @<effort>` runs `cross.mjs --to codex` in place of the panel skill's `Agent` call and its rejected-slug fallback, as a background `Bash` call beside the other seats' `Agent` calls; Codex runs its `opus` seat through `cross.mjs --to claude`. A seat that exits non-zero or returns nothing is reported missing, never replaced silently. The review intent quotes your typed asks verbatim. Proof: a real `interrogate` round on this execution through the exact seat commands. Done: the Panel review rule in dotai `skills/sync-pstack/assets/block.md`; panel round 2 ran both Codex seats through `node .agents/pstack/cross.mjs` from plate-2 (decision-log `panel` rows).
3. - [x] **Review flow.** Replace the Cross-model review bullet with the automatic panel and the build question; the Decision-trail review's reviewer is the gpt-6.1-sol seat; the Review rule runs `interrogate` on the high-risk commit, with every seat in that worktree. Proof: smoke a small and a big request in both projects and both runtimes. Done: `node skills/sync-pstack/scripts/sync-pstack.mjs smoke` in plate-2 and Ellie (decision-log row 'Smoke routing after the round-2 fixes').
4. - [x] **Page.** The renderer counts rounds from `seats` rows, tags the count and the latest seats in the header, and lists the review history at the bottom from every iteration's log; `decisions-check` refuses a panel finding without a severity or before a `seats` row. Proof: tests that fail first; this plan's page shows its own review rounds. Done: `skills/sync-pstack/assets/pstack/plan-page.mjs` and `decisions-check.mjs`, with their tests in `sync-pstack.test.mjs`; `node .agents/pstack/plan-page.mjs docs/plans/2026-10-02-codex-panel-seats.md`.
5. - [x] **Cut.** Retire the automatic cross-review hand-off and the autoreview gate in both projects. Both skills stay installed for manual use, because you typed `cross-review` 16 times this week (plate-2 5, Ellie 11) and `autoreview` 27 times overall (`typedInvocations`, all history), and the Agent files rule keeps typed commands as entry points. Bare `cross-review` lists the latest sessions that ended on a reply. Proof: `sync-pstack verify` on both projects. Done: `node skills/sync-pstack/scripts/sync-pstack.mjs verify` on plate-2 and Ellie; `skills/cross-review/scripts/session.mjs` with `session.test.mjs`.
6. - [x] **Close.** Writing passes, verify, commits, the pstack page republished. Done: dotai commit 68b880b and Ellie commit 3fbd198c5, both pushed; plate-2 stays uncommitted for you; the page at https://claude.ai/artifact/P2PqUfp91Yani3Jy8tDPFD.
