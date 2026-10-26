# Triage claim: one command reserves an issue before its fix

Status: partial: P2 and P3 claims wait on the word claim route
Topic: pstack
Playbook: build

On 2026-10-26 natamox wrote in Discord that natamox and Sin took four domain tasks, while an owner session had already started one of them. The owner asked "how can we prevent/save in progress state to avoid doing the same thing?", added that natamox and Sin should take the issues only a person on a device can test, asked for harsh feedback on the fix routes, then said "ok go all" to the eight proposals that followed. `architect` ran three runners at xhigh, and an arena with a blind cross-judge picked the base.

## Brief

### What will change?

Each public-issue fix starts with a claim that reserves the issue and starts a task when none covers it. A fixed issue closes only on proof of the report; otherwise its reporter retests it on beta.platejs.org and closes it.

### What could go wrong?

No claim or close has run against GitHub, only fakes in tests. Sessions carded before the claim skip it. Claims on P2, P3 or unrecorded issues start no task, and closes and labels wait until you run them.

## Teach

Triage gives each open issue a record, and a fix run then fixes the issue's whole group. Before the fix, the session was supposed to check by hand whether someone else already works on it.

That check had gaps. A task's started row was the only marker that named a session, and a second one silently replaced the first. An issue with no task showed only its GitHub assignee, and all your sessions share one login.

The claim command keeps one log of who holds each issue, stored on GitHub beside the code. It decides on the newest copy and pushes. When another session pushed first, the push fails, so it rereads and decides again, and only one session wins. The winner gets the GitHub assignment and the task's start, or a new task when none covers its P0 or P1 issues. Issues that need a real phone or input method wait for a person who drives one.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where claims live | A claims log of its own on GitHub, kept by the triage tool alone (look) | Claim rows in the shared task ledger, with a new shared push helper | claims in ledger | big |
| Issues with no task | The claim offers one task naming the issues it holds that no open task covers, and starts it for its own session (look) | Claimed without a task; the claim shows on the issue and in triage's own lists | no offer on claim | big |
| A claim on P2 or P3 issues, or on an issue with no record | Offers no task and prints why; the rerun after the records land offers it | A new claim route in the shared chips rule, so a claim offers any priority | claim route | small |
| A claim of one task, or by a person on a device | Offers no task, because the domain kinds a task claim adds belong to that task's run, and a person on a device starts no task | Offers a second task for what no task covers | offer beside task | detail |
| The offered task's name | Fix plate#N and plate#M, filed under the lowest issue number, with each issue's priority, scope, owner file and GitHub title in its finding | A title written from the issues' GitHub titles | title from issue titles | detail |
| A claim that starts a task and holds other kinds no task covers | Offers a second task beside the one it starts | Folds those kinds into the task it starts | fold into start | detail |
| Review of the offer and of the fixed issue's exit | One fresh reviewer on each diff, since neither adds a public API | A three-seat panel round | panel | detail |
| Takeover | You name the exact holds to take, quoted in your words | One takeover covers every hold at that moment | take all holds | small |
| Domain fix task effort | xhigh, so the session can record triage, overriding the task title rule for these tasks | high, and the session drafts records for an xhigh session | domain tasks at high | small |
| Device issues | Marked iOS, Android or input method; agents skip them and a lane lists them | A free-text device note on each issue | device text | small |
| A comment claiming the issue | A recent "I'll take this" comment from someone else holds it (look) | Such comments only show as notes | comments as notes | small |
| A branch naming the issue | Shown as a note | Holds the issue | branches hold | detail |
| Task start on the board | Logged after the claim and pushed through the existing ledger sync; a failed push leaves a note | A new shared push helper | shared ledger push | detail |
| Review | One panel round on the diff | No panel | skip panel | detail |
| #5243 and #5251 | Marked android, so agents skip them; the agent tasks fix the desktop cause they share, and a person checks each on a phone (look) | Left off the device lane, as natamox's note asked | keep 5243 5251 in agent tasks | small |
| Taking over an earlier take | The new take names every hold again, the earlier take's included | A take inherits the holds the claim it takes had taken | take carries holds | detail |
| Release and take on GitHub | Each prints the command that removes the old assignee, for the owner to run | The claim removes the old assignee itself | release unassigns | detail |
| A hold newer than the claim | Holds, so a rerun stops and the session reports who took the issue (look) | Prints a note and the claim stands, as the build first did | late holds as notes | small |
| A domain task that names an issue of another domain | The domain claim skips that task's issues and prints the other one as outside | The domain claim takes the other domain's issue too | domain takes outside | small |
| A claim by a person who drives a device | Takes only that device's kinds and their dups, and starts no task | Also takes the group's desktop kinds | drives takes desktop | small |
| A task dismissed after a claim | Ends the claim only when it stops the claim's own start | Any dismissal after the claim ends it | any dismissal ends | detail |
| A device kind on a desktop kind's owner file | The agent's run that holds the desktop kind writes the fix; the person rechecks on the device and fixes only what still fails | The person's session writes the shared fix too | person writes shared fix | small |
| Device proof | The person's recheck on the device, five times where the Bug fix playbook asks for five warm runs | An emulator run counts as the device proof | emulator proves device | detail |
| The subject page link | A new page at https://claude.ai/artifact/2hz8UXsyGd6wYpE6YsUwDj, because https://claude.ai/artifact/5NABpdSVKTYNJ57igZeY98 no longer opens | Publish no page for this subject | no page | detail |
| A fixed record that says nothing about a retest | Waits for its reporter's retest, so the two fixed records from before this wait too | Every fixed record must say whether it needs a retest, and those two are recorded again | retest required | small |
| A device issue whose fixed record says no retest is needed | The record command refuses it, so a device fix waits for a retest on the device | Allowed when the proof names a device run | device closes on proof | small |
| The label a fixed issue waits under | needs retest | fixed on next | label fixed on next | detail |
| Where the reporter retests | beta.platejs.org, which deploys every push to next, once that deploy finishes | After the next release | retest after release | small |

## Public API

The commands a maintainer, a tester or a card session types.

```text before
triage fix #<N>                (triage, then Bug fix over the issue's whole group)
triage fix <domain>            (records, then one Bug fix run over every kind of the domain)
pnpm triage show <N>...        [--brief] [--json]
pnpm triage queue              [--label <label>] [--json]
pnpm triage record <N> --outcome <outcome> --detail <detail> --seen <fingerprint> --why <why> [--dry-run]
pnpm triage record --from <batch.tsv> [--dry-run]
pnpm triage mark <draft.md>
pnpm triage labels
pnpm triage check [<register>]
```

```text after
triage fix #<N>                (claim, records, then Bug fix over what the claim holds)
triage fix <domain>            (claim, records, then one Bug fix run over every kind the claim holds)
pnpm triage claim <N>...       [--take <hold>,... --why "<owner's words>"] [--drives ios|android|ime] [--session <id>]
pnpm triage claim --domain <scope> [--task <id>] [same flags]
pnpm triage claim --task <id>  [same flags]
pnpm triage release <N>... --why "<reason>" [--session <id>]
pnpm triage lane [ios|android|ime]
pnpm triage show <N>...        [--brief] [--json]   (adds claim: and mentions: lines)
pnpm triage queue              [--label <label>] [--json]
pnpm triage record <N> --outcome <outcome> --detail <detail> --seen <fingerprint> --why <why> [--dry-run]   (kind takes an optional device:, fixed an optional retest:)
pnpm triage record --from <batch.tsv> [--dry-run]
pnpm triage mark <draft.md>
pnpm triage labels             (prints the close for a fixed record with retest: none, and the needs retest label for every other)
pnpm triage check [<register>]
```

## Main changes

- **A claims log.** `claims.tsv` on `refs/triage/claims` at the canonical remote holds one row per move on one issue: `ts issue move who session transcript task drives over why`, where `move` is `claim`, `take` or `release`. Folding the rows in push order gives each issue's live claim. The first live claim wins, `take` replaces it and keeps the hold keys it overrode in `over`, and `release` by the holder or a triage owner clears it. A claim also ends with no row once the issue closes, its head record on `next` reads `fixed` after the claim, its task lands after it, or its task is dismissed after the claim's own session started it. A record that waits unlanded in one checkout ends nothing, so every clone folds the same claims. Nothing under `.agents/pstack/` changes.
- **The push is the lock.** `claim` fetches the ref, decides on that tip, writes a commit whose parent is the tip and pushes it without force. A push rejected as `[rejected]` means another writer moved the tip, so it fetches, reads GitHub again and decides again, up to four tries; any other refusal stops at once. A loser never writes a row. A rerun after a lost push response finds its own claim and writes nothing.
- **Holds.** An issue is held when someone other than this actor has a live claim, another login is assigned, an open PR closes it or says in its title or body that it fixes, closes or resolves it, a non-bot comment from another login in the last 30 days claims it, or a task started by another session or by no named one names it in `repro:` and no claim row names that task. GitHub links a closing PR only when it targets the default branch, so a PR into `next` counts by its text. When the last 100 comments do not reach 30 days back, the claim refuses. An actor is a GitHub login plus a session id, from `--session`, the runtime's session id or its transcript, so two sessions of one login hold apart; a person at a terminal is one actor. A hold newer than the actor's own claim still holds, so a rerun stops once someone else took the issue. A hold quiet for 48 hours, with no commit on any local ref touching its kind's owner files, prints `stale` and still holds. A branch naming the issue and an open task whose finding names it are notes.
- **Whole units.** An issue target's group is the issue, the issues that hold its call, the open kinds that share an owner file with them, and every issue a `dup` record or an open task ties to one of these, down every chain. It claims whole or not at all, and skips the members that are closed, fixed or in another lane. A held member, or a root that is closed, fixed or in another lane, stops it. A domain or task target splits into units, each an issue with every issue its dups and open tasks tie it to, and skips each unit with a held member or with an issue outside the target. `--domain` without `--task` takes the domain's kinds and the offered tasks it covers whole, cards held elsewhere included, and skips started ones. `--domain` with `--task` takes that task's issues and the domain's kinds with no open task.
- **What a claim writes.** After the push, it assigns the actor on GitHub where the login is not yet assigned and reads the assignees back. Then it syncs the ledger, decides again on the shared ledger, and logs `started` with `session:` only on each offered, Ready task whose desktop issues the claim still covers whole, through `decisions-check.mjs append` and `setup.mjs` in the main checkout. It reads the shared ref back and retries the push twice, because `setup.mjs` returns at once while another start holds its lock. An issue or domain claim, without `--task` or `--drives`, may hold kinds and their dups that no open task covers. When their worst priority is P0 or P1, it takes a fresh task id, logs an `offered` row in the same way and starts that task. The row's `repro:` lists those issues, `writes:` their owner files, `topic:` is `plate-<lowest number>` and `session:` is this session, and its finding gives each issue's title. The claim rows name the new task, so a release frees it and its landing ends the claim. A rerun after the records land writes one more claim row per issue, which only names the task. Before it offers, the claim also reads the main checkout's ledger file. A start whose push failed leaves its rows there, so the claim offers nothing when a task in that file covers those issues. Otherwise it offers none and prints why, such as an issue with no record yet or a worst priority of P2 or P3. chips.md lets only a verdict, babysit or time run offer a P2 or P3 task. Exit 0 means the session holds work and GitHub shows it; exit 1 means stop, including a failed assignment, which keeps the claim and prints both the rerun that repairs it and the release that frees it.
- **Takeover.** `--take` lists the hold keys the refusal printed, such as `assignee:natamox` or `claim:zbeyens/local_…`, and `--why` quotes the owner's words. Only a triage owner takes over another login's hold. A take names every hold it takes, including the ones an earlier take overrode. Neither a take nor a release unassigns anyone; each prints the `--remove-assignee` command for the owner.
- **Device lane.** A `kind` record takes an optional `device:` list of `ios`, `android` and `ime`, and its dups share its lane. A claim skips a device kind and its dups unless `--drives` names one of its devices, which only a person who said they drive that device passes. A claim with `--drives` takes only that device's kinds and their dups, starts no task, and leaves the group's desktop kinds to an agent. When a desktop kind shares the device kind's owner file, the agent's run writes the fix there, and the person rechecks on the device once it lands. That recheck is the kind's device proof. `pnpm triage lane [<device>]` lists the open device kinds with their holders, highest priority first.
- **A fixed issue's exit.** A `fixed` record takes an optional `retest:`. `retest: none` says its proof replays the reporter's own steps. `labels` then prints `gh issue close <N> --reason completed` once that record has landed on `next` and neither its kind nor the kind its dup chain leads to needs a device. Every other current fixed record gets the `needs retest` label, `labels` prints the command that creates that label, and the fix comment asks the reporter to retest on beta.platejs.org and close the issue once it passes. A current record of any other outcome drops the label. `record` refuses `retest: none` when the issue's kind, or the kind its dup chain leads to, has `device:`. A later commit to a fixed record's owner files leaves the record current, because its commit has landed and its tagged test guards the fix.
- **show.** `show` adds `claim:`, the live holder with its session, since and last activity, and `mentions:`, the open tasks whose findings name the issue outside `repro:`. `tasks:` and the stale reasons keep reading `repro:` alone.
- **Playbooks.** triage.md's Steps replace Investigation's `how` and `why` step with Fix step 1's claim, which runs before Who records or any read of the issues, and its Fix steps 1 and 2 become the claim, then triage of what it holds, with a second claim when the new records change the group or when the first claim offered no task because an issue had no record. Fix step 4 logs `landed` on each task the claim started. Offer fix runs leaves out held issues and device kinds, opens each domain task's finding with its claim line and sets `effort: xhigh` on it. Kinds and Record gain `device:`, and a Device lane section says who takes those kinds. bug-fix.md line 27 sends every public-issue fix through `triage fix #<N>`.

## Steps

### Phase 1. The claim command

- [x] 1. Teach the test harness's fake `gh` `issue edit --add-assignee` and `--remove-assignee` (logged), the light open list and the live-signals GraphQL query, then write the red test: two sessions claim one issue at once, and exactly one holds it with one claim row. Proof: the test fails on the base because `claim` is not a command, logged through `proof.mjs`.
- [x] 2. Build `tooling/scripts/triage-claims.mjs` (the log fold, units, holds and the decision) and wire `claim`, `release` and `lane` into `tooling/scripts/triage.mjs`, with `device:` on `kind`, `claim:` and `mentions:` in `show`, and one test per failure mode the Main changes name. Proof: `node --test tooling/scripts/triage.test.mjs` passes, logged through `proof.mjs`.
- [x] 3. Revert one condition at a time in a detached worktree: the fast-forward push, the take-key filter, the device skip, the derived end, the whole-unit rule and the assignment read-back. Proof: each mutant fails its own test with that test's message, each logged through `proof.mjs`.
- [x] 4. Probe the comment pattern on the open issues' comments from the last 30 days. Proof: a log listing every hit; the pattern narrows until no hit is a false claim.

### Phase 2. The playbook text

- [x] 5. Rewrite triage.md's Entry points, Kinds, Record, Fit Gate, Offer fix runs and Fix steps 1 and 2, add the Device lane section, and change bug-fix.md line 27. Proof: `check-playbooks.mjs` passes, and a smoke of each changed route in Claude Code and Codex reads the new text.

### Phase 3. Device records

- [x] 6. Read each kind whose miss names an iOS, Android or input-method engine gap with `show`, and re-record each one a desktop browser cannot reproduce with `device:`. Proof: the `record` output and `pnpm triage check`.

### Close

- [x] 7. Writing passes, one panel round on the diff, `oxlint`, land through `land.mjs` with `--check 'pnpm check --affected'`, then chips Close.

### Phase 4. The claim's task offer

- [x] 8. In `decide()`, list the kinds and dups an issue or domain claim holds that no open task covers, with their worst priority and owner files. In `claimCommand`, offer one task for them under a fresh task id through `decisions-check.mjs append`, then start it with the existing start. Update triage.md's Fix steps 1, 2 and 4 to match. Proof: one test each for the offer and its start on the ledger ref, the P2 note, a `--task` or `--drives` claim, a dup of an issue an open task covers, a rerun, a rerun after a failed ledger push, a release, and a claim that ends when the task its later row names lands; each mutant that reverts one of those conditions fails its test, logged through `proof.mjs`; `check-playbooks.mjs` passes.
- [x] 9. Writing passes, one fresh reviewer on the diff, lint, land through `land.mjs` with `--check 'pnpm check --affected'`, then chips Close.

### Phase 5. The fixed issue's exit

- [x] 10. Give `fixed` an optional `retest:`. Have `labels` print the close for `retest: none` and the `needs retest` label for every other current fixed record, and have `record` refuse `retest: none` on a device kind. Rewrite triage.md's Record, Drafts and Fix step 4 to match. Proof: one test each for the close, the label, the refusal and a close that a stale, unlanded or device-lane record withholds; each mutant that reverts one of those conditions fails its test, logged through `proof.mjs`; `check-playbooks.mjs` passes.
- [x] 11. Draft the retest follow-ups for #5248 and #5249, run the writing passes and one fresh reviewer on the diff, lint, and land through `land.mjs` with `--check 'pnpm check --affected'`.
- [x] 12. Keep a fixed record current when a later commit touches its owner files, which the reflect after the land found on #5249. Proof: a test that fails at 4893d136e0 and passes after the change, and the full suite.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| `verify` loaded before the first proof | loaded before the first test; after a compaction it was reloaded only once the mutants and smokes had run, on the method it set before; for the offer, reloaded after the last compaction, before its gates closed; for the exit, reloaded after the last compaction, before its final mutants and suite ran |
| Tests rule read before the first test | read 2026-10-26 |
| `pstack:blast-radius` for a public API change | skip: no package API changes |
| `pstack:thermos` per slice | skip: the panel round on the diff applies both lenses |
| `oxlint --type-aware` before the panel | clean before the panel and again on the final code; `ultracite check` and `oxlint --type-aware` are clean on the offer's final code and on the exit's |
| Panel round on the diff | one round, three seats at xhigh: 7 critical findings applied, 16 warnings and nits applied, 2 deferred; the offer got one fresh reviewer instead, and five of its six findings are fixed, while the sixth stays as the Defaults row "fold into start"; the exit got one fresh reviewer after the first stopped on the weekly API limit, and its three warnings and six of its eight nits are fixed |
| Tests and mutants | 112 of 112 passed on the claim's final code, and 24 mutants, each reverting one guarded condition, failed their named tests; with the offer, 120 of 120 pass, and 13 more mutants, each reverting one condition of the offer, fail their named tests; with the exit, 123 of 123 pass, and 14 more mutants, each reverting one condition of the close, the label or the device refusal, fail their named tests; with the staleness fix, 124 of 124 pass, and its mutant fails its test |
| `deslop`, then `no-comments` | run on the build and again on the panel round's fixes; on the offer, deslop cut nothing and comment-sicko kept its three comments; on the exit, comment-sicko's two reshapes became `laneHeadOf` and `replaysReport`, and deslop cut nothing from the review fixes, which add no comment line |
| `unslop` on the plan and playbooks | run on the playbooks after the round, and on the plan at the close; for the offer, run on its plan text, its playbook steps, this Close and its commit message; for the exit, run on its plan text, its playbook text, the two retest drafts, this Close and its commit message |
| `check-playbooks.mjs` | passes on the final text |
| Workflow smokes in Claude Code and Codex | four rounds of four prompts; in the two before the land, every fix route ran the claim before any read of the issues, except one Claude answer that chose `next`'s text; after the land, all four Codex answers ran it first, and the Claude half failed on an expired login; one more round on the offer's text ran the claim first in both runtimes and logged `landed` on each task it started, but neither answer named the offer |
| `land.mjs --check 'pnpm check --affected'` | the claim landed as d0404fa86b with all 11 steps passing, and the reflect record and these rows landed after it; the offer landed as feb5f0c12a and the exit as 4893d136e0, each with all 11 steps passing; the staleness fix lands with the same check in the commit that carries this row |
| chips Close | skip: this run offered no task; it only set `effort: xhigh` on t_aeb32d57, and the offer's tests offered tasks only on sandbox ledgers |
| Hand drive, playtest, `plate-docs` | skip: no browser or docs page changes |

## Close

The eighth approved item is built, narrower than asked. The run's own Defaults row limits the offer to P0 and P1 kinds, because chips.md lets only a verdict, babysit or time run offer a P2 or P3 task. A claim on P2, P3 or unrecorded issues still holds them and prints why it offers no task, so Status stays partial until the word "claim route".

An issue or domain claim without `--task` or `--drives` now lists the kinds it holds that no open task covers, with their dups. When their worst priority is P0 or P1, it logs one `offered` task whose `repro:` lists those issues and starts it for the claiming session. The claim rows name that task, so a release frees it for the next session and its landing ends the claim. Before it offers, the claim reads the main checkout's ledger file, so a rerun after a failed ledger push offers no second task. The code is `offerOf` in `tooling/scripts/triage-claims.mjs` and `offerTask` in `tooling/scripts/triage.mjs`, and Fix steps 1, 2 and 4 of `.agents/playbooks/triage.md` say what it writes.

The first seven items landed in d0404fa86b: the claim command with its holds, its push lock, the GitHub assignment and the stale flag; the claim as the first step of both fix routes; `mentions:` in `show`; the owner's domain claim taking the tasks nobody started; domain tasks at xhigh; the device lane; and one fix entry point. All of it lives in this project. The code is `pnpm triage claim`, `release` and `lane` in `tooling/scripts/triage.mjs` and the new `tooling/scripts/triage-claims.mjs`. The text is Fix and the Device lane in `.agents/playbooks/triage.md` and the fix entry in `.agents/playbooks/bug-fix.md`. Fifteen kind records in `docs/triage/issues.tsv` now carry `device:`.

At that land, all 112 tests passed, and each of 24 mutants, which revert one guarded condition each, failed its named test. One panel round with three seats at xhigh found 7 critical findings. Each is fixed, and its test failed on the reviewed patch. In the last two smoke rounds, four prompts each in Claude Code and Codex, every fix route ran the claim before it read any issue, with one exception. One Claude answer chose `next`'s committed text, which has no claim until this lands. After the land, all four Codex answers ran the claim first again, and the Claude half could not run because the local `claude` login had expired. The proof stops short of GitHub writes. A read-only run of the claim's query against eight real issues came back with no errors, but the tests run against a fake `gh` and a local bare remote, so no claim push and no `gh issue edit` has run against udecode/plate. The smokes read the playbooks and ran no claim.

For the offer, all 120 tests pass on the final code, and each of 13 more mutants, which revert one condition of the offer each, fails its named test. One fresh reviewer found six issues, and five are fixed. The claim rows did not name the offered task, a rerun after a failed ledger push offered a second task, the finding quoted a field that holds only read or inferred, the tests missed a dup and an unsorted claim, and the playbook said "one of them". The sixth asked to fold held kinds into a task the claim starts, and it stays as the Defaults row "fold into start". A smoke in Claude Code and Codex ran the claim first and logged `landed` on each task the claim started, but neither answer named the offer. Like the claim, the offer has run only against a fake `gh` and local bare remotes, never on udecode/plate or the shared ledger.

The fixed issue's exit, asked for after the offer landed, is built as asked. A `fixed` record takes an optional `retest:`. `pnpm triage labels` prints `gh issue close <N> --reason completed` only for a current fixed record with `retest: none` that has landed on `next`, and only when neither its kind nor the kind its dup chain leads to needs a device. Every other current fixed record gets the `needs retest` label, and `record` refuses `retest: none` on a device kind. Fix step 4 of `.agents/playbooks/triage.md` allows `retest: none` only when the proof replays the reporter's own steps in their browser and input method on the pushed commit. Its Drafts section has the fix comment ask the reporter to retest on beta.platejs.org and close the issue once the steps pass. #5248 and #5249 are input-method kinds, so their fixed records wait for natamox's retest. Two follow-up drafts in the run directory correct their posted comments, which implied a wait for the next release.

All 123 tests pass on the final code, and each of 14 mutants, which revert one condition of the close, the label or the device refusal each, fails its named test. The first fresh reviewer stopped on the weekly API limit before it reported. The second found no critical bug and three warnings, and all three are fixed. `labels` could print a close for a record that had not landed, or for an issue whose kind gained `device:` after its fixed record, and three planted bugs survived the first tests. Six of its eight nits are fixed, and two stay in Open work. Like the claim, the close and the label have run only against a fake `gh`, never on udecode/plate.

The exit landed as 4893d136e0. The reflect after it found that `labels` would remove `triaged` from #5249 and never add `needs retest`, because a later commit to its owner file had made its fixed record stale. A fixed record now stays current when its owner files change, and the test for it failed at 4893d136e0. The same reflect found that the two retest drafts rested on a partial read of `maintainer`'s truth gate. With the skill loaded in full, both drafts pass: they say "candidate fix", leave the close to natamox, and the newest successful Deploy run on `next`, at 4893d136e0, contains 40b8fc5c7a. On the owner's word, both drafts are posted unchanged, and #5248 and #5249 carry `needs retest`, so natamox closes each one after the retest.

On the owner's word, the v54 milestone now marks a Beta issue instead of the `target:beta` label and the `[Beta]: ` title prefix. Milestone #30, v54, holds the 100 issues and 3 closed PRs that carried the label: 91 open and 12 closed. The label is deleted, and so are the 28 other milestones, `1` to `19` and `v.2` to `v.10`, none of which held an open issue. `publish-issue.sh` creates a new issue with the Bug type on v54, refuses a title with a bracket prefix such as `[Beta]: ` or `[Bug]: `, and checks the milestone on readback. The issue-draft method, the sweep reference and the triage playbook's Sweep domains name the milestone. The 91 open `[Beta]: ` titles stay, because a title edit makes each issue's triage record stale. The publisher self-test passes, and each of 3 mutants, which drop the milestone flag, its readback check or the prefix refusal, fails it. The publisher has run only against a fake `gh`.

On the owner's word, issue fields replace the domain labels. The org's multi-select Scope field holds one option for each of the 71 review scopes. `pnpm triage labels` now sets Scope and Priority from each current kind record, in one `setIssueFieldValue` call per issue that differs. When a record's scope has no option, it leaves that issue's Scope alone and names the issue. `record` refuses a `scope:` with no file in `docs/research/review-scopes/`, and warns when that scope lists none of the record's owner files. The Priority options are renamed P0 to P3, with Urgent, High, Medium and Low as their descriptions. The rename gave the options new ids and dropped every value, so all 89 values were set again from a snapshot and read back. The old labels moved to Scope on 405 issues, 314 of them closed. 84 took their kind record's scope and 321 took the scopes their `plugin:*`, `plate-ui` or `dom` labels map to, and 17 of those got more than one. All 405 read back. Then 64 labels were deleted, which leaves 22: triage's four, seven facets and eleven that bots and PR tooling use. The owner had already removed the unused Task issue type and the empty Effort, Start date and Target date fields. `publish-issue.sh --labels` now takes only the seven facet labels, the issue forms no longer prefix a title with `[Bug]: ` or `[Feature]: `, and the triage playbook's GitHub state table lists each label and field with what sets it. The `plugin:*` labels on PRs are gone with no copy, because issue fields exist only on issues.

## Reflect

One Opus reviewer ran the judgment, tooling and divergent lenses over this session, from the first reflect's call to this one, and I synthesized its 28 findings with pstack's synthesizer prompt as the checklist.

I applied nothing to a rule or helper in this run. No finding fixes a helper that crashes on or refuses a case its rule allows, and none rewords a rule without adding words. Three findings changed this run instead. The claim's GitHub query got a read-only run against eight real issues, and GitHub answered it with no errors. The note to natamox and Sin now says #5243 and #5251 moved to their device lane. The smoke ran again on the landed text.

Accepted, then moved to Backlog. Each has owner: zbeyens and stop: the owner takes or drops it.

- Give `lead.mjs` one resolver that returns the desktop session id and the transcript id under different names, so Fix step 1 can drop its `--session` sentence (`sync-pstack` helpers).
- Make `reread.mjs --dir` print its `reload:` line too, or have `proof.mjs` warn when a compaction came after the last load of `verify`. This run reloaded `verify` only after its mutant proofs (`sync-pstack` helpers).
- Deny an unquoted shell word that starts with `=` in a hook. An earlier reflect found it too, and it cost three reruns here.
- Teach `verify`'s testing reference to start a competing push from a `reference-transaction` hook when it tests a compare-and-swap race. A pre-push hook fires too late, so a force-push bug passes.
- Name `pnpm exec ultracite check <files>` as the lint gate for tooling scripts in `verify`'s command recipes. oxlint alone misses formatting, and Prettier is not this repository's formatter.
- Say in chips.md that `decisions-check.mjs append` writes only the main checkout's ledger file, that other clones see a row only after `setup.mjs` pushes `refs/pstack/ledger`, and that `setup.mjs` exits 0 when that push fails (`sync-pstack`).
- Have `page-stop.mjs` read the live page before a session's first publish to an existing subject page, which the tool otherwise refuses once (`plan-page`).
- Tell co-tenant records apart by `version` alone in reflect.md. A `parentUuid` walk drops parallel tool results and stops at a compaction boundary (`sync-pstack`).
- When a step moves to first, search the playbook for every other sentence that says it runs first (`workflow-change.md`). Who records step 1 and the Steps list still put `show` first until the panel caught them.
- Run a panel on the plan, not only on the diff, for a design that defines a lock or a fold across clones (`sync-pstack` panel rule). The diff panel found 7 criticals that were rules of the design.
- Treat a red test whose failure is the command's usage line as proof only that the command was missing, and have `decisions-check.mjs` refuse it as red evidence (`verify`).
- Pair a mutant run with a list of the cases the design never names, such as two writers between a read and a push, state that lives in one clone, and links two steps away (`verify`). Every mutant died before the panel found 7 missing conditions.
- Run one live read-only call of a helper's exact remote query before it lands (`verify`). This run ran it after landing.
- Make the standing OK to assign on claim a switch in `.agents/pstack.json` that the owner controls, whose default prints the `gh issue edit` command instead (`triage.md`).
- Give "who is on this issue" one answer. Either `decisions-check.mjs append` pushes `started` rows, or the chips board reads `refs/triage/claims` (`sync-pstack` chips rule). The Defaults row "shared ledger push" deferred this.
- Tell smoke readers that the checkout's text is the current rule, or smoke after landing (`sync-pstack` smoke). Before the land, readers spent their conflict slots on the gap between this checkout and `next`.
- Name in a delegate's brief the helper that owns each fact it needs (`poteto-mode`, upstream). The delegate's own session-id chain and the lead's scan for prose mentions were both wrong.

Rejected:

- GitHub's closing-PR list misses PRs into `next`. The claim's query now reads cross-referenced PRs, and no check by hand remains.
- The worktree guard refuses Write in the run directory. land.md already says a worktree session writes there with the shell, and t_08bb9e40 holds the helper.
- Rebuilding the reviewed bytes with a scratch index. It is one run's technique.
- Loading a deferred tool in its own call. The Calls rule already keeps a retitle out of a call of its own, so the cost was execution.
- Reading a named session's state before a coordination answer. The claims ref and the GitHub assignment now answer it.
- "What's next" after a triage. a04bf5d24c already makes every triage hand-back offer the domain fix runs.
- Measuring a refusal's hit rate before building it. The run did that.
- A writing delegate ran in the lead's worktree. land.md and poteto-mode already give it its own, so this was a deviation, not a gap.
- The note to natamox and Sin left out #5243 and #5251. Open work now says it.

A second reflect ran after the fixed issue's exit landed. One Opus reviewer applied the three lenses to the session from the first reflect's call to this one, and I synthesized its 17 findings with pstack's synthesizer prompt as the checklist. It applied nothing to a rule or helper, for the same reasons as the first. Three findings changed this run. A fixed record no longer goes stale when its owner files change, the retest drafts were checked against `maintainer`'s full truth gate, and lint ran before the last proof instead of during it.

Accepted, then moved to Backlog. Each has owner: zbeyens and stop: the owner takes or drops it.

- Say in `maintainer`'s truth gate and issue-draft method that beta.platejs.org deploys every push to `next`, so no comment promises a release before a retest.
- Decide whether `record` refuses `retest: none` on an issue with a browser label such as `safari` unless the proof names that browser. Today only the device half of the truth gate is code, and the browser half is Fix step 4's text (`triage.md`).
- Give `proof-worktree.mjs` a mutation mode that takes from and to pairs and refuses an anchor that does not match exactly once. Each phase of this run wrote its own mutate script, and one anchor went stale (`verify` command recipes).
- Say in `verify`'s command recipes that `pnpm lint:task` rewrites files, so it runs before any proof that copies files or names mutant anchors.
- Deny an unquoted shell word that starts with `=` in a hook. It came back a third time after the first reflect's Backlog item, and reflect.md's build rule covers no mechanism that blocks.
- Treat a red test that fails at setup as proof only that the behavior is missing. This repeats the first reflect's item, and its mechanism refuses, so it is not built here either (`verify`).
- Warn when a message carries only a deferred-tool load or a retitle, which the Calls rule forbids. The first reflect rejected this as execution, and it came back (`sync-pstack` Calls rule).
- Have a smoke's prompt set up the precondition of each branch the change adds, and report a branch it never reached as not exercised. The offer's smoke could not reach the offer (`sync-pstack` smoke).
- Cut a test as redundant only after the mutant it alone kills survives without it (`tests.md`).
- Let a reflect send a mistake class that repeats after an earlier reflect's Backlog item to `/pstack:correct`, instead of to Backlog again (`reflect.md`).
- Add "which session posted, ran or committed X" to `agent-session-resume`'s description, so the lookup starts from the ledger's `session:` and reads one transcript instead of scanning every project's.

Rejected:

- Name each outcome's exit. This change built the fixed record's, and `labels` already prints the close or label of a dup, `needs-repro` and `spec`.
- Let a claim offer a P2 or P3 task. Open work already holds it under the word "claim route".
- Document the two stale rules for fixed records. This run removed the owner-file one for fixed records, and Drafts already says the marker keeps a posted draft out of the fingerprint.

## Open work

- Tell natamox and Sin that t_67f3cb5e was already started by an owner session, that t_f3360813 is not started yet, and that #5243 and #5251 now wait in their device lane, against natamox's note. owner: zbeyens. stop: a team message the owner sends.
- #5304, #5301, #5285, #5284, #5283, #5279, #5278, #5277, #5274, #5271, #5262, #5246, #5244, #5243, #5205 and #5194 lost `triaged` on the owner's word, because later commits moved their owner files. The next `triage` run records them again. owner: zbeyens. stop: none.
- A reporter's "still fails" comment changes the issue's fingerprint, so its fixed record goes stale and keeps `needs retest`, because `labels` only removes `triaged` from a stale record. The next `triage #<N>` records it again and clears it. owner: zbeyens. stop: none.
- `retest: None`, or `none` with extra spaces, reads as a retest the reporter must run, and `record` says nothing. It fails safe. owner: zbeyens. stop: none.
- Sessions carded before this lands follow their old briefs and skip the claim. owner: zbeyens. stop: none; their started rows still hold as legacy.
- A fork clone cannot push the claims ref and asks a maintainer. owner: zbeyens. stop: none.
- A claim on P2 or P3 issues that no task covers offers no task, because chips.md lets only a verdict, babysit or time run offer one. The claim still holds them and shows on the issue and in `show`. owner: zbeyens. stop: the word "claim route".
- A release leaves the task its claim started open as started on the chips board, until its session or a sweep settles it. owner: zbeyens. stop: none.
- A claim that ended because its issue closed comes back when the issue reopens, because ends are derived from today's state. It reads stale after 48 quiet hours, and a release or a take clears it. owner: zbeyens. stop: none.
- `CLAIM_PHRASE` misses "I'm working on a fix for this" and matches "I'd like to take this opportunity". Neither shows in the 403 comments probed. owner: zbeyens. stop: none.
- The assignment read-back checks only this login, so an assignee another person adds in the seconds between the decision and the read-back prints nothing. owner: zbeyens. stop: none.
- A push that the remote accepted but whose answer timed out refuses; a rerun finds its own rows and writes nothing. owner: zbeyens. stop: none.
- t_67f3cb5e's session started at `high`, so `record` refuses it and it works from the records it finds. owner: zbeyens. stop: none; its kinds are already recorded.
- Whether a session the owner starts from a card counts as the root session of their own launch, which `record` requires, is untested. A domain task that starts from a card may find it cannot record. owner: zbeyens. stop: the first domain card session's `show`, whose `session:` line says.
- A `/chips` sweep in another session checks each card's effort against chips.md's Title rule, which knows nothing of triage's xhigh override, so it may lower a domain task to `high`, and its session then cannot record. chips.md comes from the shared source, so this project cannot change it. owner: zbeyens. stop: a `sync-pstack` lesson that lets a task's finding keep its effort.
- #5296 and #5305 record `scope: docs`, which has no review-scope file, so `labels` leaves the Scope their old labels gave them. `triage #5296` and `triage #5305` in a session at xhigh record them again. owner: zbeyens. stop: none.
- A Beta issue filed through an issue form gets no v54 milestone, because a form cannot set one, so a person adds it. owner: zbeyens. stop: none.
- The Scope field is not pinned to the Bug type, so an issue shows it only once it has a value. owner: zbeyens. stop: the owner pins it in the org's issue field settings.
- `docs/plans/2026-10-24-issue-triage.md` still says the claim check is Fix step 2 and runs by hand, in its Capabilities row and its bug-fix.md quote. That plan is closed, so its text stays as the record of its run. owner: zbeyens. stop: none.
