# Maintainer Heartbeat

A maintainer heartbeat is one local Codex activation that improves repo
maintenance without needing a custom prompt.

Use it for:

```txt
maintainer heartbeat
maintainer queue
maintain repo
```

The heartbeat is not a daemon. It picks one safe item, routes or executes the
safe local slice, verifies the result, and hands off the next useful action.

## Read First

1. Latest user request.
2. Active goal plan, if any.
3. `VISION.md`.
4. Relevant `docs/vision/*.md`.
5. `docs/maintainer/standing-orders.md`.
6. Public intake docs:
   - `CONTRIBUTING.md`
   - `.github/PULL_REQUEST_TEMPLATE.md`
   - `.github/ISSUE_TEMPLATE/*.yml`
   - `SECURITY.md`
7. Live GitHub state for the selected issue, PR, advisory, or queue slice.
8. Owner skill before execution.

## Queue Snapshot

Start broad maintainer runs by refreshing the local queue ledger:

```bash
node .agents/rules/maintainer/scripts/queue-snapshot.mjs \
  --repo udecode/plate \
  --limit 20 \
  --out docs/maintainer/queue.md \
  --json .tmp/maintainer/queue-snapshot.json
```

If `gh` auth or network is blocked, record the blocker and continue from the
latest `docs/maintainer/queue.md` only as stale context. Do not call stale
queue rows live proof.

The script ranks candidates. It does not authorize comments, labels, closures,
reviews, merges, branches, commits, or PR creation.

## Queue Order

Scan the smallest useful slice, in this order:

1. Security advisories or public security-shaped reports.
2. PRs blocked on review, checks, merge attention, or maintainer action.
3. Issues needing triage, duplicate/claim guard, or missing reproduction.
4. Stale user-visible bugs with enough public intake for local Codex.
5. Docs/setup breakage with clear proof.
6. One internal `slate-auto` fallback checkpoint only when no public item is
   safe and fallback is allowed.

Do not pad the matrix with weak candidates. Three strong rows beat twenty noisy
rows.

## Run Artifact

At the end of a non-trivial heartbeat, write a compact run note under
`docs/maintainer/runs/` when it would prevent duplicate future work:

```txt
docs/maintainer/runs/YYYY-MM-DD-<mode-or-item>.md
```

Record queue snapshot freshness, selected item, rejected candidates, owner
route, proof command or blocker, public mutation boundary, changed files,
needs-attention rows, and next heartbeat.

Skip a run artifact only for trivial read-only answers where the final response
already contains all durable state.

## Candidate Matrix

Record compact rows:

| Field | Meaning |
| --- | --- |
| rank | why this item is higher or lower than alternatives |
| item | issue/PR/advisory URL or local maintenance item |
| live state | current GitHub state and updated time when available |
| category | Slate, Plate, docs, security, PR review, support/noise, internal fallback |
| VISION fit | yes, no, unclear |
| intake | agent-ready, needs-repro, thin, N/A |
| duplicate/claim guard | clear, active owner, related PR, skipped with reason |
| owner | selected execution skill/package/docs owner |
| proof | focused command, source audit, browser proof, or blocker |
| authority | none, explicit, blocked |
| decision | route, execute-safe-slice, brief-only, skip, defer, blocked |

## Selection Rule

Pick at most one autonomous item.

Prefer the item that has:

- clear VISION fit;
- complete public intake;
- no duplicate/claim conflict;
- narrow owner;
- honest proof path;
- no public mutation needed to make progress.

If no public item is safe, say that directly. Only then use the allowed fallback
ladder.

## Allowed Outcomes

- **route:** hand off to a narrower owner with proof path.
- **execute-safe-slice:** patch local files/tests/docs when authority allows.
- **brief-only:** produce the decision the maintainer needs to make.
- **skip:** concrete reason, usually support/noise/duplicate/out of scope.
- **defer:** owner exists but current proof/authority is not available.
- **blocked:** no autonomous move remains.

## Handoff

Keep the handoff short:

- repo and mode;
- queue snapshot path and freshness;
- queue slice inspected;
- selected item and owner;
- rejected/skipped candidates with reasons;
- live GitHub proof or auth blocker;
- duplicate/claim guard;
- proof command or proof blocker;
- public mutations: `none` unless explicitly authorized;
- changed files;
- needs your attention;
- next heartbeat recommendation.

The maintainer should be able to approve the next action without reading raw
issue dumps or raw diffs.
