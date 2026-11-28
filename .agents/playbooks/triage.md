---
extends: investigation
when: Use it for `triage`, `triage label:<label>`, `triage discussions [<category>]`, `triage #<N>`, `triage plate-private#<N>`, `triage fix #<N>`, `triage fix plate-private#<N>`, `triage fix <domain>`, `triage fix next` or `triage status`, for `maintainer issues`, and for a udecode/plate or udecode/plate-private issue URL. A Slate issue stays with `maintainer slate-issue`, and a security-shaped report with `maintainer security`.
---

# Triage

Stores triage state on `refs/triage/state` (in `udecode/plate-private`) and claims on `refs/triage/claims*` via `pnpm triage` (`tooling/scripts/triage.mjs`; `pnpm triage --help` lists all commands). `pnpm triage record` writes atomically to `refs/triage/state` and syncs GitHub fields, labels, milestones, and issue types directly, with zero git commits on `next` and no `land.mjs` wait. Each command targets one repo (`udecode/plate` default, `--repo plate-private` / `plate-private#<N>`, `--repo discussions` / `discussions#<N>`). Beta issues are `udecode/plate` issues on the 5 Beta milestones (`Slate regressions`, `Plate regressions`, `New Slate`, `New Plate`, `Experimental`) plus all `udecode/plate-private` issues; other `udecode/plate` issues report `main` -> [Main reports](#main-reports). `maintainer` owns issue drafts, Slate issues, security, and the public truth gate.

## Entry points

| Request | Scope | Ends with |
| --- | --- | --- |
| `triage`, `/triage`, `maintainer issues`, `triage label:<label>` | `pnpm triage queue` (both repos, opt `--label`) | records saved, GitHub synced, comments posted, `pnpm triage status` summary |
| `triage discussions [<category>]` | `pnpm triage queue --repo discussions` | records saved, replies posted, GitHub labels/closes synced |
| `triage #<N>`, `plate-private#<N>`, URL | issue N + neighbors | N's record (if current, print and stop) |
| `triage fix #<N>` / `<domain>` / `next` | issue/domain/next group (`plate-private` first) | claim, missing records, one Bug fix run over claimed kinds |
| `triage status` | `pnpm triage status` (`unfixed` / `claimed` / `ready to retest on beta`) | live summary per repo and domain |
| `triage retest #<N>` / `plate-private#<N>` | issue N's `fixed` record | retest comment, close on pass or return to fix queue on fail |

## Method

### Read

Run `pnpm triage show <N>...` (with `--repo plate-private` or `--repo discussions` when needed), check live neighbors and `pnpm kb <area>` / `pnpm kb plate#<N>`. Challenge claims; send security reports to `maintainer security` immediately. Accounts in `triage.gated` (`zbeyens-bot[bot]`) record `unconfirmed` until a maintainer records the issue again.

### Main reports

Replay non-Beta `udecode/plate` issues on `beta.platejs.org` (deployed SHA: `gh run list --repo udecode/plate --workflow deploy.yml --branch next --status success --limit 1 --json headSha`): works -> `works-on-beta` (`--commit`, `--why`; post `Fixed in <commit>.` + clip; `release.yml` updates and closes on publish); fails -> `kind` (syncs Beta milestone); removed or by design -> `not-bug` (`--why`; closes not planned); missing steps -> `needs-repro`.

### Duplicates

`dup` requires matching evidence (symptom, repro, fix area, or code surface; never title alone) covering every repro. Split unrelated bugs into new `udecode/plate-private` issues (`maintainer` issue-draft, published without asking) and record `split` (`--into`) on the original if needed.

### Kinds and Fit Gate

A `kind` is one wrong behavior that one fix removes. Record:

- `--priority P0|P1|P2|P3` (`regression` is at least P1)
- `--scope <slug>` (review-scope domain)
- optional `--owner <path:line>` (hint and shared-owner grouping)
- optional `--device ios|android|ime` (routes to [Device lane](#device-lane))
- optional `--regression slate|plate|<ref-url>` (ranks Slate regressions > Plate regressions > new bugs)
- `--why "<concise cause/repro note>"`

Before recording `kind`, verify it fits `VISION.md` (else `not-bug`), reproduces on live source with clear steps (else `needs-repro`), and requires no open product or API decision (else `spec`).

### Record

Record one issue directly:

```bash
pnpm triage record 300 --repo plate-private --outcome kind --priority P1 --scope selection --why "..."
```

Or batch multiple issues with `--from <batch.json|batch.tsv>` (JSON array of `{ issue|discussion|number, outcome, priority?, scope?, owner?, device?, regression?, of?, into?, commit?, retest?, lean?, targetIssue?, why? }`; for `moved` discussions, set `discussion` or `number` with `issue`, or set `targetIssue`; or 4-column TSV `issue\toutcome\tdetail\twhy`). Pass `--dry-run` to validate first, or `--no-sync` to skip GitHub field sync.

Outcomes for issues: `kind`, `dup` (`--of`), `needs-repro` (`--why`), `not-bug` (`--why`), `spec` (`--why`), `split` (`--into`), `fixed` (`--commit`, opt `--retest none|<steps>`, `--owner`, `--proof`), `works-on-beta` (`--commit`, opt `--proof`; `udecode/plate` only).

### Drafts and comments

Post a comment when it gives the reporter actionable information (`dup`, `needs-repro`, `not-bug`, `spec`, `fixed`/`works-on-beta`, or `kind` with a traced cause). Use commit-pinned permalinks, attach `clip` media for visual/behavioral public answers (`gh issue comment --attach`), and mark every posted comment via `pnpm --silent triage mark <draft.md>` so it does not trigger `new-comment` staleness. Pass `maintainer` truth gate before fixed comments and verify `deploy.yml` ancestry before claiming a fix is live on `beta.platejs.org`. `udecode/plate` `fixed`/`works-on-beta` comments open with `Fixed in <commit>.` so `release.yml` / `close-released-issues.mjs` rewrites and closes on publish. Notify `team` reporters once via `notify`.

Retests: `pnpm triage retest <N> --pass|--fail --on "<browser/device>" [--device ios|android|ime] [--found <M>] [--note "..."]`. A pass closes the issue; a fail reverts the `fixed` record back to `kind` (`retestFailed`) so it returns to the fix queue.

### Discussions

Record with `--repo discussions`: `answered` (`--why`), `outdated` (`--why`, state what replaced it in `platejs@beta` and link the matching `beta.platejs.org` doc section), `moved` (`--issue <N>`), `dup` (`--of <N>`), `feature` (`--priority P1-P3`, `--lean planned|pro|not-planned`; rank via `pnpm triage features`). Write replies in `.agents/pstack/rules/writing.md` Messages mode and call the release `platejs@beta`. Post marked reply via `gh api graphql` (`addDiscussionComment`), then run `pnpm triage labels --repo discussions --apply`.

### GitHub state

`pnpm triage record` syncs GitHub automatically (and `pnpm triage labels [--repo <name>] [--apply]` inspects or repairs drift): `Triage` (`Triaged`, `Needs reproduction`, `Needs retest`, `Fixed in next release`, `Duplicate`), `Issue type` (`Bug`/`Feature`), `Priority` (P0-P3), `Scope` (keeping `accessibility`/`performance`), 5 Beta milestones, `ime` label, completed/not-planned closes, and discussion labels/answers/closes.

## Device lane

`device` kinds and their duplicates wait in `pnpm triage lane [<device>]`. Claims skip them unless `--drives <device>` is passed after the user confirms real-device testing.

## Fix

1. **Claim first:** `pnpm triage claim` (`<N>`, `plate-private#<N>`, `--domain <scope> --repo plate-private`, or `--next --repo plate-private`) + `--session <id>`. Checks live holds (claims, assignees, PRs, 30d claim comments; 48h quiet prints `stale` and still holds) and auto-assigns `@me`. `--domain` never blocks on unrelated untriaged issues; `--next` skips untriaged issues with a one-line warning and claims the highest-priority triaged domain. Exit 1 stops the run. `--take <holds> --why "<words>"` requires owner authorization (only maintainers take others' holds).
2. **Triage claimed group:** record any missing or stale issues in the group; re-claim if grouping changed. Check `docs/plans/artifacts/queue.tsv` for matching-scope P0/P1 rows on the same owner and pull them into the run.
3. **Fix together:** one Bug fix run over all claimed kinds and pulled `queue.tsv` rows (2+ failure kinds on one owner = Redesign run; tag `[plate#N]`/`[plate-private#N]`; follow formal check skills).
4. **Record fix or release:** after landing, drop fixed `queue.tsv` rows. For any `plate-private` / team-reported issue, post one Discord notice via `notify` with a before-and-after `clip` attached (`--to <reporter>` when retest is needed, `--to channel` when `--retest none`, unless the commit carries a `Team:` trailer for `zbot`) before `pnpm triage record --outcome fixed` (`--commit <sha>`, `--retest none` only for exact non-device browser replay, else `--retest "<steps>"`), post comments, or run `pnpm triage release <N>... --why "<reason>"`.

## Steps

- **Replace** "Trace the code the question is about. For motivation questions, also route through the **why** skill.": `triage fix` runs Fix step 1 first (stop on exit 1), then Read and Method (`how`/`why` optional).
- **Replace** "Throughput checkpoint stays one line": queue counts by state and scope order, or `n/a, one issue`.
- **Replace** "Produce the output": saved records, synced GitHub fields, posted comments, and `pnpm triage status` summary.
- **After** "Produce the output": `triage fix` -> Fix step 3; others hand back here.

**Reply:** record counts per outcome, remaining queue per repo, posted comments (linking every issue, discussion, and PR inline per `writing.md`), and `triage status` counts.
