# Triage claim: one command reserves an issue before its fix

Status: partial: the taskless offer waits on the word offer on claim
Topic: pstack
Playbook: build

On 2026-10-26 natamox wrote in Discord that natamox and Sin took four domain tasks, while an owner session had already started one of them. The owner asked "how can we prevent/save in progress state to avoid doing the same thing?", added that natamox and Sin should take the issues only a person on a device can test, asked for harsh feedback on the fix routes, then said "ok go all" to the eight proposals that followed. `architect` ran three runners at xhigh, and an arena with a blind cross-judge picked the base.

## Brief

### What will change?

Every fix of a public issue now starts with one claim command. It reserves the issue for this session on every clone and on GitHub, or stops the session because someone else already holds it.

### What could go wrong?

No claim has run against GitHub yet, only against a fake GitHub in the tests. Sessions carded before this skip the claim. A claim with no task stays off the chips board, because its approved offer is not built.

## Teach

Triage gives each open issue a record, and a fix run then fixes the issue's whole group. Before the fix, the session was supposed to check by hand whether someone else already works on it.

That check had gaps. A task's started row was the only marker that named a session, and a second one silently replaced the first. An issue with no task showed only its GitHub assignee, and all your sessions share one login.

The claim command keeps one log of who holds each issue, stored on GitHub beside the code. It decides on the newest copy and pushes. When another session pushed first, the push fails, so it rereads and decides again, and only one session wins. The winner gets the GitHub assignment and the task's start. Issues that need a real phone or input method wait for a person who drives one.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where claims live | A claims log of its own on GitHub, kept by the triage tool alone (look) | Claim rows in the shared task ledger, with a new shared push helper | claims in ledger | big |
| Issues with no task | Claimed without a task; the claim shows on the issue and in triage's own lists (look) | Offer and start a task for every claim, as proposed | offer on claim | big |
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
pnpm triage record <N> --outcome <outcome> --detail <detail> --seen <fingerprint> --why <why> [--dry-run]   (kind takes an optional device:)
pnpm triage record --from <batch.tsv> [--dry-run]
pnpm triage mark <draft.md>
pnpm triage labels
pnpm triage check [<register>]
```

## Main changes

- **A claims log.** `claims.tsv` on `refs/triage/claims` at the canonical remote holds one row per move on one issue: `ts issue move who session transcript task drives over why`, where `move` is `claim`, `take` or `release`. Folding the rows in push order gives each issue's live claim. The first live claim wins, `take` replaces it and keeps the hold keys it overrode in `over`, and `release` by the holder or a triage owner clears it. A claim also ends with no row once the issue closes, its head record on `next` reads `fixed` after the claim, its task lands after it, or its task is dismissed after the claim's own session started it. A record that waits unlanded in one checkout ends nothing, so every clone folds the same claims. Nothing under `.agents/pstack/` changes.
- **The push is the lock.** `claim` fetches the ref, decides on that tip, writes a commit whose parent is the tip and pushes it without force. A push rejected as `[rejected]` means another writer moved the tip, so it fetches, reads GitHub again and decides again, up to four tries; any other refusal stops at once. A loser never writes a row. A rerun after a lost push response finds its own claim and writes nothing.
- **Holds.** An issue is held when someone other than this actor has a live claim, another login is assigned, an open PR closes it or says in its title or body that it fixes, closes or resolves it, a non-bot comment from another login in the last 30 days claims it, or a task started by another session or by no named one names it in `repro:` and no claim row names that task. GitHub links a closing PR only when it targets the default branch, so a PR into `next` counts by its text. When the last 100 comments do not reach 30 days back, the claim refuses. An actor is a GitHub login plus a session id, from `--session`, the runtime's session id or its transcript, so two sessions of one login hold apart; a person at a terminal is one actor. A hold newer than the actor's own claim still holds, so a rerun stops once someone else took the issue. A hold quiet for 48 hours, with no commit on any local ref touching its kind's owner files, prints `stale` and still holds. A branch naming the issue and an open task whose finding names it are notes.
- **Whole units.** An issue target's group is the issue, the issues that hold its call, the open kinds that share an owner file with them, and every issue a `dup` record or an open task ties to one of these, down every chain. It claims whole or not at all, and skips the members that are closed, fixed or in another lane. A held member, or a root that is closed, fixed or in another lane, stops it. A domain or task target splits into units, each an issue with every issue its dups and open tasks tie it to, and skips each unit with a held member or with an issue outside the target. `--domain` without `--task` takes the domain's kinds and the offered tasks it covers whole, cards held elsewhere included, and skips started ones. `--domain` with `--task` takes that task's issues and the domain's kinds with no open task.
- **What a claim writes.** After the push, it assigns the actor on GitHub where the login is not yet assigned and reads the assignees back. Then it syncs the ledger, decides again on the shared ledger, and logs `started` with `session:` only on each offered, Ready task whose desktop issues the claim still covers whole, through `decisions-check.mjs append` and `setup.mjs` in the main checkout. It reads the shared ref back and retries the push twice, because `setup.mjs` returns at once while another start holds its lock. Exit 0 means the session holds work and GitHub shows it; exit 1 means stop, including a failed assignment, which keeps the claim and prints both the rerun that repairs it and the release that frees it.
- **Takeover.** `--take` lists the hold keys the refusal printed, such as `assignee:natamox` or `claim:zbeyens/local_…`, and `--why` quotes the owner's words. Only a triage owner takes over another login's hold. A take names every hold it takes, including the ones an earlier take overrode. Neither a take nor a release unassigns anyone; each prints the `--remove-assignee` command for the owner.
- **Device lane.** A `kind` record takes an optional `device:` list of `ios`, `android` and `ime`, and its dups share its lane. A claim skips a device kind and its dups unless `--drives` names one of its devices, which only a person who said they drive that device passes. A claim with `--drives` takes only that device's kinds and their dups, starts no task, and leaves the group's desktop kinds to an agent. When a desktop kind shares the device kind's owner file, the agent's run writes the fix there, and the person rechecks on the device once it lands. That recheck is the kind's device proof. `pnpm triage lane [<device>]` lists the open device kinds with their holders, highest priority first.
- **show.** `show` adds `claim:`, the live holder with its session, since and last activity, and `mentions:`, the open tasks whose findings name the issue outside `repro:`. `tasks:` and the stale reasons keep reading `repro:` alone.
- **Playbooks.** triage.md's Steps replace Investigation's `how` and `why` step with Fix step 1's claim, which runs before Who records or any read of the issues, and its Fix steps 1 and 2 become the claim, then triage of what it holds, with a second claim when the new records change the group. Offer fix runs leaves out held issues and device kinds, opens each domain task's finding with its claim line and sets `effort: xhigh` on it. Kinds and Record gain `device:`, and a Device lane section says who takes those kinds. bug-fix.md line 27 sends every public-issue fix through `triage fix #<N>`.

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

## Completion Gates

| Gate | Evidence |
| --- | --- |
| `verify` loaded before the first proof | loaded before the first test; after a compaction it was reloaded only once the mutants and smokes had run, on the method it set before |
| Tests rule read before the first test | read 2026-10-26 |
| `pstack:blast-radius` for a public API change | skip: no package API changes |
| `pstack:thermos` per slice | skip: the panel round on the diff applies both lenses |
| `oxlint --type-aware` before the panel | clean before the panel and again on the final code |
| Panel round on the diff | one round, three seats at xhigh: 7 critical findings applied, 16 warnings and nits applied, 2 deferred |
| Tests and mutants | 112 of 112 pass on the final code; 24 mutants, each reverting one guarded condition, fail their named tests |
| `deslop`, then `no-comments` | run on the build and again on the panel round's fixes |
| `unslop` on the plan and playbooks | run on the playbooks after the round, and on the plan at the close |
| `check-playbooks.mjs` | passes on the final text |
| Workflow smokes in Claude Code and Codex | four rounds of four prompts; in the two before the land, every fix route ran the claim before any read of the issues, except one Claude answer that chose `next`'s text; after the land, all four Codex answers ran it first, and the Claude half failed on an expired login |
| `land.mjs --check 'pnpm check --affected'` | the claim landed as d0404fa86b with all 11 steps passing, and the reflect record and these rows landed after it |
| chips Close | skip: this run offered no task; it only set `effort: xhigh` on t_aeb32d57 |
| Hand drive, playtest, `plate-docs` | skip: no browser or docs page changes |

## Close

One approved item is not built. A claim on an issue with no task was to offer and start a task whose `repro:` lists every issue. Instead the claim shows on the issue, in `show` and on GitHub, but not on the chips board. The word "offer on claim" builds it.

The other seven items landed: the claim command with its holds, its push lock, the GitHub assignment and the stale flag; the claim as the first step of both fix routes; `mentions:` in `show`; the owner's domain claim taking the tasks nobody started; domain tasks at xhigh; the device lane; and one fix entry point. All of it lives in this project. The code is `pnpm triage claim`, `release` and `lane` in `tooling/scripts/triage.mjs` and the new `tooling/scripts/triage-claims.mjs`. The text is Fix and the Device lane in `.agents/playbooks/triage.md` and the fix entry in `.agents/playbooks/bug-fix.md`. Fifteen kind records in `docs/triage/issues.tsv` now carry `device:`.

All 112 tests pass on the final code, and each of 24 mutants, which revert one guarded condition each, fails its named test. One panel round with three seats at xhigh found 7 critical findings. Each is fixed, and its test failed on the reviewed patch. In the last two smoke rounds, four prompts each in Claude Code and Codex, every fix route ran the claim before it read any issue, with one exception. One Claude answer chose `next`'s committed text, which has no claim until this lands. After the land, all four Codex answers ran the claim first again, and the Claude half could not run because the local `claude` login had expired. The proof stops short of GitHub writes. A read-only run of the claim's query against eight real issues came back with no errors, but the tests run against a fake `gh` and a local bare remote, so no claim push and no `gh issue edit` has run against udecode/plate. The smokes read the playbooks and ran no claim.

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

## Open work

- Tell natamox and Sin that t_67f3cb5e was already started by an owner session, that t_f3360813 is not started yet, and that #5243 and #5251 now wait in their device lane, against natamox's note. owner: zbeyens. stop: a team message the owner sends.
- Sessions carded before this lands follow their old briefs and skip the claim. owner: zbeyens. stop: none; their started rows still hold as legacy.
- A fork clone cannot push the claims ref and asks a maintainer. owner: zbeyens. stop: none.
- The approved "offer and start a new task whose `repro:` lists every issue" for a claim with no task is not built; such a claim shows on the issue and in triage's lists, not on the chips board. owner: zbeyens. stop: the word "offer on claim" builds it.
- A claim that ended because its issue closed comes back when the issue reopens, because ends are derived from today's state. It reads stale after 48 quiet hours, and a release or a take clears it. owner: zbeyens. stop: none.
- `CLAIM_PHRASE` misses "I'm working on a fix for this" and matches "I'd like to take this opportunity". Neither shows in the 403 comments probed. owner: zbeyens. stop: none.
- The assignment read-back checks only this login, so an assignee another person adds in the seconds between the decision and the read-back prints nothing. owner: zbeyens. stop: none.
- A push that the remote accepted but whose answer timed out refuses; a rerun finds its own rows and writes nothing. owner: zbeyens. stop: none.
- t_67f3cb5e's session started at `high`, so `record` refuses it and it works from the records it finds. owner: zbeyens. stop: none; its kinds are already recorded.
- Whether a session the owner starts from a card counts as the root session of their own launch, which `record` requires, is untested. A domain task that starts from a card may find it cannot record. owner: zbeyens. stop: the first domain card session's `show`, whose `session:` line says.
- A `/chips` sweep in another session checks each card's effort against chips.md's Title rule, which knows nothing of triage's xhigh override, so it may lower a domain task to `high`, and its session then cannot record. chips.md comes from the shared source, so this project cannot change it. owner: zbeyens. stop: a `sync-pstack` lesson that lets a task's finding keep its effort.
- `docs/plans/2026-10-24-issue-triage.md` still says the claim check is Fix step 2 and runs by hand, in its Capabilities row and its bug-fix.md quote. That plan is closed, so its text stays as the record of its run. owner: zbeyens. stop: none.
