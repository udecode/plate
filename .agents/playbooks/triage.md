---
extends: investigation
when: Use it for `triage`, `triage label:<label>`, `triage discussions [<category>]`, `triage #<N>`, `triage plate-private#<N>`, `triage fix #<N>`, `triage fix plate-private#<N>`, `triage fix <domain>`, `triage fix next` or `triage status`, for `maintainer issues`, and for a udecode/plate or udecode/plate-private issue URL. A Slate issue stays with `maintainer slate-issue`, and a security-shaped report with `maintainer security`.
---

# Triage

Writes issue/discussion calls to `docs/triage/{issues,plate-private,discussions}.tsv` exclusively via `pnpm triage` (`tooling/scripts/triage.mjs`; `pnpm triage --help` lists all subcommands/flags). Each command reads one repo (`udecode/plate` default, `--repo plate-private` / `plate-private#<N>`, `--repo discussions` / `discussions#<N>`). Beta issues = `udecode/plate` issues on the 5 Beta milestones (`Slate regressions`, `Plate regressions`, `New Slate`, `New Plate`, `Experimental`) + all `udecode/plate-private` issues; other `udecode/plate` issues report `main` -> [Main reports](#main-reports). `maintainer` owns GitHub I/O (issue drafts, Slate issues, security, truth gate).

## Entry points

| Request | Scope | Ends with |
| --- | --- | --- |
| `triage`, `/triage`, `maintainer issues`, `triage label:<label>` | `pnpm triage queue` (both repos, opt `--label`) | records landed, comments posted, `pnpm triage status` summary |
| `triage discussions [<category>]` | `pnpm triage queue --repo discussions` | records landed, replies posted, `labels --repo discussions` |
| `triage #<N>`, `plate-private#<N>`, URL | issue N + neighbors | N's record (if current, print and stop) |
| `triage fix #<N>` / `<domain>` / `next` | issue/domain/next group (`plate-private` first) | claim, records, one Bug fix run over claimed kinds |
| `triage status` | `pnpm triage status` (`unfixed` / `claimed` / `ready to retest on beta`) | live summary per repo and domain |
| `triage retest #<N>` / `plate-private#<N>` | issue N's `fixed` record | retest comment, close on pass |

## Who records

Run `pnpm triage show <N>...` first (only `claim`, `queue` or `kinds` precedes it) and read every line including `seen:`. Only a root session meeting `triage.floor` (prefer Gemini 4 Neon `@high`; Opus/Sol `@high` also allowed) on every turn since reading the issue (or plate-bot) can record (`show`'s `session:` states eligibility; Codex runs outside sandbox and chunks saved files). Accounts outside `team` maintainers and `triage.gated` (`zbeyens-bot[bot]`) record `unconfirmed` until a maintainer confirms. Non-recording sessions still triage/draft and list `triage #<N>` (never spawn another session to record). Subagents may search; lead reads `show` and decides.

## Method

### Read

Read `show`, live `gh` neighbors (+ fresh gitcrawl archive) and `pnpm kb <area>` / `pnpm kb plate#<N>`. Challenge claims; send security reports to `maintainer security` immediately.

### Main reports

Replay non-Beta `udecode/plate` issues on `beta.platejs.org` (deployed SHA: `gh run list --repo udecode/plate --workflow deploy.yml --branch next --status success --limit 1 --json headSha`): works -> `works-on-beta` (`commit`, `proof`; post `Fixed in <commit>.` + clip; `release.yml` updates/closes on publish); fails -> `kind` (`labels` sets Beta milestone); removed/ruled out -> `not-bug` (`law:`; closes not planned); missing steps -> `needs-repro`.

### Duplicates

`dup` needs >=2 matching evidence categories (symptom, repro, fix area, linked PRs/discussion, browser/native edge, code surface; never title alone) covering every numbered repro. Split extra kinds into new `udecode/plate-private` issues (`maintainer` issue-draft, published without asking) with `moved:` on the kept issue (`split` if title names none).

### Kinds

One wrong result one fix removes: `owner:` (`path:line`), `cause:` (`read`|`inferred`), `scope:` (review-scope file), miss classes (`M1`-`M7`), priority (`regression` >= P1), opt `device:` (`ios`/`android`/`ime` -> [Device lane](#device-lane)), opt `regression:` (`slatejs.org`/`platejs.org` working URLs).

### Why tests missed it

`M1` no test (lowest-layer test + scenario catalog row); `M2` wrong layer (Plite browser test or `apps/www/tests/browser/regressions/`); `M3` wrong assertion (fix assertion + `test-audit`); `M4` engine gap (gated engine test); `M5` wiring gap (kit/demo check via `/pstack:correct`); `M6` composition gap (generated/formal check via `/pstack:create-formal-verification-skill`); `M7` spec gap (`docs/editor-behavior/markdown-editing-spec.md` row + test). Two kinds sharing a miss reason trigger `/pstack:correct` on the 2nd fix.

### Fit Gate

Requires all 8: (1) fits `VISION.md`/doctrine (else `not-bug` + `law:`), (2) live source, (3) clear owner, (4) observable repro + final-ref replay plan (else `needs-repro`), (5) no new feature/config/product call (else `spec`), (6) sufficient intake context, (7) no unauthorized creds/destructive/public mutations, (8) grounded beyond title or AI word.

### Record

Keys (`key: value; ...`): `kind` (`scope`, `priority`, `owner`, `cause`, opt `miss`/`moved`/`device`/`regression`); `dup` (`of`); `fixed` (`commit`, `owner`, `proof`, `retest`, `unchecked` unless `retest: none`, opt `clips`, `escaped` after failed retest); `needs-repro` (`missing`); `not-bug` (`law`); `split` (`into`); `spec` (`question`, opt `law`); `works-on-beta` (`commit`, `proof`; `udecode/plate` only). Write `issue outcome detail seen why` TSV -> `record --from <batch.tsv> --dry-run` -> record -> `land.mjs`.

### Drafts

Draft for `dup`, `needs-repro`, `not-bug`, `spec`, `fixed`/`works-on-beta`, or `kind` adding cause/owner (`**Cause.**`, `**Not traced.**`, `**Open decision.**`, `**Test.**`) with commit-pinned permalinks. Add `clip` media for visual/behavioral public answers (`gh issue comment --attach`); mark every draft via `pnpm --silent triage mark <draft.md>`. Pass `maintainer` truth gate before fixed comments and verify `deploy.yml` ancestor before claiming live on `beta.platejs.org`. `udecode/plate` `fixed`/`works-on-beta` opens with `Fixed in <commit>.` (auto-closed on publish by `release.yml` / `close-released-issues.mjs`). Once landed, `maintainer` posts marked drafts and runs `pnpm triage labels` automatically (owner's word, 2026-10-26/27); others list under Needs you (plate-bot emits comment blocks). Notify `team` reporters once via `notify`. Retests: `pnpm triage retest <N> --pass|--fail --on "<browser/device>" [--device ...] [--found <M>]` (pass closes; fail voids `fixed` to `retest-failed`; `--found` is `plate-private` only).

### Discussions

`docs/triage/discussions.tsv`; write replies in `.agents/pstack/rules/writing.md` Messages mode (no rigid templates) and call the release `platejs@beta` (never v2 or beta number): `answered` (`answer:`), `outdated` (`law:`, state what replaced it in `platejs@beta` and link the matching `beta.platejs.org` doc section), `moved` (open `udecode/plate` issue, `issue:`, check per Main reports), `dup` (`of:`), `feature` (`priority:` P1 Vision/plan, P2 common elsewhere, P3 else; `lean:` `pro`/`planned`/`not-planned`; no task; rank via `pnpm triage features`). Post marked draft via `gh api graphql` (`addDiscussionComment`), then `labels --repo discussions`.

### GitHub state

`pnpm triage labels` syncs only: `Triage` (`Triaged`, `Needs reproduction`, `Needs retest`, `Fixed in next release`, `Duplicate`), `Issue type` (`Bug`/`Feature`), `Priority` (P0-P3), `Scope` (review-scope options keeping `accessibility`/`performance`), `Platform` (human/publisher), 5 Beta milestones, `ime`/`regression` labels, completed/not-planned closes, discussion labels/closes (`planned`/`pro`/`not-planned`, resolved/outdated/duplicate).

## The global run

Save `pnpm triage queue` for both repos (`--label` if given), work scope by scope (conflicts, stale, unchecked, untriaged, unconfirmed), leave `unchecked` until readable.

## Sweep domains

Teammates file clear P0/P1 Beta blockers straight to `udecode/plate-private` (no waiting for a full domain to finish); `triage` groups open issues into failure kinds in `docs/triage/plate-private.tsv`, and `pnpm triage status` lists `unfixed`, `claimed`, and `ready to retest on beta`.

## Device lane

`device:` kinds + dups wait in `pnpm triage lane [<device>]`. Claims skip them unless `--drives <device>` after user confirms device testing (agent fixes desktop owner first; person rechecks on real device, 5 warm runs when required). Android emulator reproduces within limits only.

## Fix

1. **Claim first:** `pnpm triage claim` (`<N>`, `plate-private#<N>`, `--domain <scope> --repo plate-private` falling back to `--repo plate`, or `--next --repo plate-private` ranking Slate regressions > Plate regressions > new bugs by priority) + `--session <id>`. Checks live holds (claims, assignees, PRs, recent comments; 48h quiet prints `stale` and still holds), refuses domain/next claims while non-main issues are untriaged, and auto-assigns account. Exit 1 stops run (rerun once on post-push error, else `pnpm triage release`). `--take <holds> --why "<words>"` needs owner word (`babysit <PR>` authorizes PR author's holds; only maintainers take others'). Title multi-issue claims by domain.
2. **Triage claimed group:** record missing/stale issues; re-claim if group changed.
3. **Fix together:** one Bug fix run over all claimed kinds (2+ kinds on one owner = Redesign run; tag `[plate#N]`/`[plate-private#N]`; build missing M6 check before fixing; follow formal check skills).
4. **Close or release:** after landing, record `fixed` (`retest: none` only for exact non-device/non-mobile browser+input replay, else `retest:` + `unchecked:`; after failed retest also `escaped:` + new tagged test), post comments, or `pnpm triage release <N>... --why "<reason>"`.

## Steps

- **Replace** "Trace the code the question is about. For motivation questions, also route through the **why** skill.": `triage fix` runs Fix step 1 first (stop on exit 1), then Who records and Method (`how`/`why` optional).
- **Replace** "Throughput checkpoint stays one line": queue counts by state and scope order, or `n/a, one issue`.
- **Replace** "Produce the output": landed records, posted comments, `pnpm triage status` summary and unrecorded issues.
- **After** "Produce the output": `triage fix` -> Fix step 3; others hand back here.

**Reply:** record counts per outcome, remaining queue per repo, posted comments, Needs you commands, `labels` results, `triage status` counts, unrecorded `triage #<N>` lines.
