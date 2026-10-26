# Review guardrails: count what review misses, close the land race, undo a session

Status: planning: waiting on your go to build phase 1
Topic: pstack
Playbook: plan

On 2026-10-26 the owner shared Addy Osmani's post on how the Claude Code team does code review and asked "anything we should steal into our potato workflow / babysit , while keeping our fast dev-no PR vision? harsh honest feedback". The reply ranked five steals and one Babysit fix. The owner answered "and which item fixed "Babysit has no carve-out for old code" ?? i agree from 1 to 5, but do plan poteto just to make sure." None of the five covered the Babysit fix, so it joins this plan as item 6. Delivery stays trunk through `land.mjs`, and no pull request is added anywhere. The Build playbook executes this plan.

## Brief

### What will change?

Each fix names the commit that broke things, so you can count bugs that slip through. Raced landings rerun their checks, and you get a seat scorecard, one-command session undo, a reviewer replay, and Babysit skips old code.

### What could go wrong?

Every pstack project gets the stricter fix rule at once, and agents may dodge it by saying no commit caused the bug. Raced landings take longer. The replay waits until ten bugs are traced and costs model time per run.

## Teach

Landing on next has no pull request. A session's change passes its checks, rebases onto next and pushes, and you review it afterwards. Panels of three models review the risky diffs before they land.

Today nothing links a fix to the landing that caused it, so nobody can say how often a landing ships a bug. Panel logs name who found each critical bug in free words that no script can count. And when next moves during a push, the landing script rebases and pushes without running its checks again. In a test run, two changes that each passed their checks landed together and broke the check.

Each fix will name the commit it repairs. That one line gives a count of bugs that slipped through, a target for an undo, and test cases for replaying the reviewers. The recheck stops the race, and the scorecard shows which reviewer models earn their place.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Projects that get the stricter fix rule | Every pstack project at once (look) | Only projects that turn it on in their settings | opt in | big |
| Where replay cases come from | Only fixes that name a traced commit, starting once ten exist (look) | Guess the causing commit from history now | mine history | big |
| Name of the new line | Introduced-by, naming the commit, or none | Fixes, as Linux writes it | fixes line | small |
| Which commits need it | Only fix commits | Every commit that changes code | every commit | small |
| Checks after a race with another landing | Rerun the lint fix and every check each time (look) | Rerun only when the incoming commits touch the same files | overlap only | small |
| Who gets credit for a serious finding | Every reviewer that raised it, at any severity, by model name | Only the reviewers that called it serious | critical only | small |
| Where a session revert runs | From any worktree cut from next, through the normal checks | It makes its own worktree and installs dependencies | own worktree | small |
| How a revert lands | As a fix that names each reverted commit, so reverts count as bugs that slipped through | A new revert commit type | revert type | small |
| Babysit and old code | Findings on code the pull request does not change go to open work, as Build already does | Babysit fixes every finding | fix all | small |
| Review of this plan | No panel on the plan; each tool change gets its one panel review (look) | A three-model panel on this plan first | panel | small |
| A traced commit that never landed | Refused; it must already be on next | Any commit the clone knows | any commit | detail |
| Old panel rows | The scorecard reads them best effort and prints how many it could not place | Count only rows written after the new rule | new rows only | detail |
| Replay size per run | Up to six cases, so a run fits the hour; a bigger run becomes a task | Every case on every run | every case | detail |
| Design pass | This plan's own comparison, without the three-model design contest | Run the design contest on the revert and scorecard | architect | detail |

## Main changes

- **A raced landing checks again.** When a push is refused because `next` moved, `land.mjs` rebases, reruns the lint fix and every `--check`, and records the commit only once they pass. Today it records the rebased commit as checked and pushes it.
- **Fix commits name their cause.** `land.mjs` refuses a `fix` commit without an `Introduced-by: <sha>` line for a commit already on the branch, or `Introduced-by: none`. `review.mjs` keeps that line out of the `Beyond the ask:` text it shows.
- **Panel findings name their seats.** `decisions-check.mjs` refuses a new `critical` row that does not list, in brackets, the seats from its round's `seats` row that raised it. A new `scorecard.mjs` counts findings per seat and fixes per introducing commit.
- **A session undoes in one command.** `review.mjs --revert <session>` reverts every commit a session landed and lands the revert through `land.mjs`.
- **A seat change can be replayed.** A new `replay.mjs` runs the panel seats on commits that later needed a fix and judges which seat named the bug.
- **Babysit leaves old code alone.** Its code-quality review sends a finding on code the pull request does not change to Open work, as the Build playbook does.

## Scope

In scope: the shared helpers in dotai's `skills/sync-pstack/assets/pstack/` (`land.mjs`, `review.mjs`, `decisions-check.mjs`, a new `scorecard.mjs` and a new `replay.mjs`), their rules (`rules/land.md`, `rules/panel.md`), their tests (`skills/sync-pstack/scripts/trunk.test.mjs`, `skills/sync-pstack/scripts/sync-pstack.test.mjs`), and plate's `.agents/playbooks/babysit.md` and `.agents/playbooks/bug-fix.md`. Every pstack project receives the helper changes through `sync-pstack apply`.

Out of scope: pull requests, approvals, CODEOWNERS, a merge queue service, feature flags, staged rollouts and a blocking security review. pstack's own playbooks stay unedited, as `AGENTS.md` requires.

## Decisions

The trailer names the cause, not the fix. `Introduced-by:` cannot be mistaken for GitHub's `Fixes #123` issue keyword, which plate's triage commits already use. The value is a commit the fetched branch contains, or `none` when no landed commit introduced the bug, such as code that never worked or a cause older than the history. Blame cannot fill it in. In a sample of 15 recent fixes, 13 touched lines under 14 days old, yet several mixed recent and old origins. So the agent that traced the cause writes the line, and the helper only checks it.

| Recheck after a raced rebase | Cost | What it misses |
| --- | --- | --- |
| Record the rebased commit as checked (today) | none | every semantic clash between two landings |
| Rerun only when incoming commits touch the task's files | one diff per race | clashes across files, such as a renamed export |
| Rerun the lint fix and every check each time (pick) | one more check run per race | nothing the checks cover |

The shortcut came in with the empty-GH006 retries in dotai `b64163d` on 2026-10-24, and that commit states no reason a clean rebase is safe. In the last 30 days, 80 of 536 landings on `next` came within five minutes of another session's.

| Session revert runs | Needs | Picked |
| --- | --- | --- |
| In the caller's worktree cut from `origin/next` | a clean worktree, the project's `--check` values | yes |
| In a worktree it makes itself | a dependency install and the setup hook's arguments | no |
| Prints the commands only | a second manual step | no |

The scorecard is a new helper. `levels.mjs` audits model and effort, `plan-page.mjs` counts seat participation for one page, and `status.mjs` reads one file, so none of them owns cross-plan finding counts.

Replay cases come only from `Introduced-by:` lines that name a commit. A historical bootstrap would need a reproduction at each guessed origin, and only 3 of the 15 sampled origins had a plan with panel rows to compare against.

## Steps

### Phase 1. Close the land race and name each bug's cause

- [ ] In dotai's `land.mjs`, move the lint fix, the checks, the dirty-tree refusal and `markChecked` into one function. Call it after the first rebase and after each rebase onto a moved branch, in place of the bare `markChecked()` in the push loop (`land.mjs:252–266`). Update the header comment (`land.mjs:31–35`) and the record sentence in `rules/land.md`. Proof: `trunk.test.mjs` gains the race from `race.sh`, in which B's check passes alone, A lands during it, and B's land then fails on the recheck with its commit local and no record. The test at `trunk.test.mjs:211–232`, which expects one check run across an internal rebase, flips to expect two. A race whose incoming commit leaves the check green lands after a second run, and a GH006 retry still reuses the record. `race.sh` against the new `land.mjs` prints "the combined check passes on next".
- [ ] In `validate()` (`land.mjs:141–149`), a `fix` subject, with or without scope and `!`, needs one or more `Introduced-by: <sha>` lines whose commit the fetched branch contains, or one `Introduced-by: none`. Other types need none. The refusal names how to trace the commit (`git log -L`, blame, bisect) and when `none` fits. Proof: the invalid-message fixture at `trunk.test.mjs:419–434` gains a missing line, an empty value, an unknown sha and a sha off the branch, each refused, and a landed sha, `none` and a `feat` with no line, each accepted, plus a rerun that takes HEAD's message. Corpus: the last 30 days of plate's `fix` messages are all refused by the new validator, and every other message still passes.
- [ ] In `review.mjs`, the `Beyond the ask:` extraction (`review.mjs:129`) stops at `Introduced-by:` as it stops at `Session:` and `Plan:`. Proof: a `trunk.test.mjs` case whose body puts `Introduced-by:` after the Beyond line shows only the Beyond text.
- [ ] Dotai's `rules/land.md` states the line, its values and what `none` means. Plate's Bug fix playbook, in its "Binary-search the cause" bullet, carries the traced commit into the commit message. Proof: `check-playbooks.mjs` passes, and one `unslop` pass covers both edits.
- [ ] Plate's Babysit playbook, in its code-quality bullet before "Stop at the human's line", sends a finding on code the pull request does not change to Open work with its `owner:`, as `.agents/playbooks/build.md:19` does. Proof: `check-playbooks.mjs` passes.
- [ ] Deliver phase 1 through `sync-pstack`'s Lesson mode: the writing passes, `node --test skills/sync-pstack/scripts/trunk.test.mjs`, `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` and `scripts/validate-skills` in dotai, one panel round on the helper diff, the smoke, the dotai push, `apply` and `verify` for each pstack project, and plate's sync landed through `land.mjs`. Proof: each project's `verify` passes and plate's land log names the commit.
- [ ] Phase 1 exit. Keep the recheck once its test passes. Keep the trailer while the scorecard's escape table shows most plate fixes naming a commit two weeks after the sync; when most say `none`, quarantine the refusal to a warning and log why. Proof: the escape table in the plan's Close.

### Phase 2. Count the seats and undo a session

- [ ] In `decisions-check.mjs`, a new panel `critical` row opens with `critical [<seat>, ...]:`, each seat a model name on its round's `seats` row or `lead`. Committed rows stay exempt. `rules/panel.md`'s critical-row sentence names the form and asks for every seat that raised the issue at any severity. Proof: the accepting case at `sync-pstack.test.mjs:2688–2693` (`critical The seat writes files`) flips to refused, a row naming roster models passes, a name off the roster is refused and `lead` passes. Corpus: `decisions-check.mjs --all` over every project's logs, before and after, finds no newly failing committed row.
- [ ] Add `scorecard.mjs` to dotai's assets and to `HELPER_FILES` in `sync-pstack.mjs`. It reads every committed decision log and places each critical row's reporters through its round's `seats` row, by model name, by the aliases opus, astra and sol, or by letter or number in roster order. Per model it prints the rounds sat, the criticals raised, applied, dismissed, open and other, and the applied ones it alone raised. It also prints the rows it could not place. A second table reads `Introduced-by:` lines on the branch: fixes per week, the share that name a commit, the share of `none`, the median days from landing to fix, and how many introducing commits had panel rows in their plan's log. Proof: a fixture log covers letters, a fallback row such as "opus for gpt-6-astra", which counts as opus, and a severity-qualified row. On plate it places at least the 3,054 of 3,262 rows the explorer's simple parser placed, and a hand check of 20 random rows matches its attribution.
- [ ] Add `review.mjs --revert <session> [--check <command>]...`. It refuses the main checkout and a worktree with commits ahead of `origin/<branch>`, finds every first-parent commit whose body holds that exact `Session:` line whatever its review state or tier, refuses a merge commit, and reverts newest first. On a conflict it stops with the paths. Otherwise it writes `fix(revert): undo session <first 8 characters>` with a body listing each commit, `Beyond the ask: none` and one `Introduced-by:` line per commit, then runs `land.mjs` with the `--check` values. Proof: in `trunk.test.mjs`, two interleaved sessions land, and reverting the first lands one commit that restores its files and keeps the second's. The message passes the new validator. A conflict stops mid-revert with nothing pushed, an unknown session and the main checkout are refused, and a failed check leaves the revert local.
- [ ] Deliver phase 2 as in phase 1. Proof: each project's `verify` passes and plate's land log names the commit.
- [ ] Phase 2 exit. Run `scorecard.mjs` on plate and write both tables in the Close. A seat whose solely raised and applied criticals are under 5% of the panel's goes to the owner as a models-sheet question, with its numbers. Proof: the tables in the Close.

### Phase 3. Replay the reviewers on traced bugs

Start once the escape table counts at least ten fixes that name a commit.

- [ ] Add `replay.mjs` to dotai's assets. It picks up to six cases, each an introducing commit and its fix, builds a review packet from the introducing commit's diff and its plan when it has one, and runs the models sheet's panel seats through `seats.mjs`. One Opus judge per case reads each seat's answer beside the fix's diff and test and records whether the seat named the defect. It also replays two commits that no fix has named after 30 days and has the judge rate each critical finding there real or not. A run fits the hour; a bigger sample becomes a suggested task with `via: time`. Proof: a fixture case with a planted obvious bug is caught, and on the first real run the judge's verdicts match a hand reading of the seat answers.
- [ ] Dotai's panel rule says a change to the panel seats in a models sheet runs `replay.mjs` once before the next panel relies on it. Proof: the smoke for that rule loads it on a plain "switch astra to high" request.
- [ ] Deliver phase 3 as in phase 1. Proof: each project's `verify` passes and plate's land log names the commit.
- [ ] Phase 3 exit. Keep the replay when two seats' recall on the same cases differs by at least two of six, or it catches a seat change that loses a case. Otherwise quarantine it as a manual command. Proof: the replay table in the Close.

## Proof

Each step's proof is a test or command run in the repository it changes, as the `verify` skill's library-only rule asks. No step changes something a browser shows, so no step has a hand drive.

The base controls ran on plate's installed helpers, which match dotai's sources byte for byte, in scratch bare repositories. Each step's claimed failure reproduced:

| Item | Control | Result at base |
| --- | --- | --- |
| Raced landing | two sessions land, B's check sleeps while A lands | B rebases onto A and lands without rechecking, and `next` fails the combined check |
| Fix trailer | land `fix: repair c` with no line | lands |
| Beyond line | land a body with `Introduced-by:` after the Beyond line | `review.mjs` shows "Beyond the ask: none Introduced-by: 0123456789abcdef" |
| Session revert | `review.mjs --revert <session>` | exits 2 with the usage line |
| Seat names | append a `critical` row that names no seat | appended |

The decision log cites each control's log.

## Open work

- `refs/pstack/reviewed` is unset in this clone, so `review.mjs` shows only the last 20 commits and records no post-landing review. owner: zbeyens. stop: the owner says whether that review happens elsewhere, or starts marking sessions with `--done`.
