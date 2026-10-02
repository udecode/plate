# Cross-review only big work

Status: executed
Topic: pstack

## Public API

The line a finished reply ends with.

```text before
$cross-review <plan>    (every plan and execution, from either runtime)
```

```text after
$cross-review <plan> from Claude Code, /cross-review <plan> from Codex    (big work only)
```

A best-api-review verdict that recommends a change.

```text before
(no hand-off)
```

```text after
$cross-review docs/research/review-records/<id>.json
```

## Main changes

- **Only big work hands off to cross-review.** A public API or architecture change, high-risk work, a run that compacts or runs unattended, and each project's `bigWork` (plate-2: package exports, ledger decisions, multi-phase plans; Ellie: new routes or flows, multi-phase plans) end with the hand-off; other work ends without it unless you ask the lead. From Claude Code the line is `$cross-review`, from Codex `/cross-review`.
- **A best-api-review Pursue verdict hands off its review record.** Cross-review gains a verdict lane, findings only; Stop and Defer verdicts end as before.
- **autoreview and cross-review stay separate.** autoreview reviews a code diff for high-risk changes, as one commit in a detached worktree; cross-review reviews a plan, a verdict or an execution against what you asked.

## Defaults

- **Big work only.** Picked by you. Say "cross-review every plan" to reverse.
- **Pursue verdicts only.** Picked by you. Say "no verdict reviews" to reverse.
- **No merge of the two skills.** They review different things with different inputs; a merged skill would need a mode parameter. Say "merge the reviews" to reverse.

## Steps

1. - [x] **Hand-off rule.** The block's Cross-model review bullet names big work, and plate-2's Plan, Build and Perf issue playbooks hand off only big work. Proof: renders place every anchor; `sync-pstack verify` exit 0 on both projects; dotai `d2899b8`, Ellie `5350a9ffa`.
2. - [x] **Verdict lane.** cross-review reviews a review record, findings only; the API review playbook hands off a Pursue verdict's record. Proof: `scripts/validate-skills`; the global reinstall matches dotai; no end-to-end run on a real record yet.
3. - [x] **Close.** Smoke a small and a big request in both projects, verify, commit dotai and Ellie, republish the pstack page. Proof: smokes in both projects and runtimes, https://claude.ai/artifact/P2PqUfp91Yani3Jy8tDPFD.
