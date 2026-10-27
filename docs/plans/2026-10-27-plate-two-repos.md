# Split Plate into a public repo and a private team repo in one folder

Status: building fast, every phase in this session, and the cutover waits for you to create udecode/plate-private
Page: https://claude.ai/artifact/8NHa1yQXVp3ZuBbFLa48PR
Playbook: plan

Shipped code stays in `udecode/plate`. Tests, plans and research move to a new private repository, `udecode/plate-private`. Both repositories track files in the same folder, so no file moves, no import changes and nothing is copied. This plan replaces the generated public copy, `2026-10-26-plate-public-export.md`, after you turned down copies of any kind.

## Brief

### What will change?

One folder holds two git repos. The public one tracks the code. A private one tracks tests, plans and research where they are now. One land, one pull and one session start each handle both repos.

### What could go wrong?

Git treats private files as ignored, so a checkout from before the split or a worktree removal can delete them unseen. Guards refuse those commands, each agent turn saves private work, and every git-listing script must learn both repos.

## Teach

Today one repo tracks every file in the folder. After the split, each file belongs to one of two repos, and the folder on disk looks the same. A public file lists the private paths. The public repo ignores them, and a second git folder in the checkout tracks them for the private repo. Test runners, lint, the build cache and code search read the disk, so they still find every test.

Nobody runs an extra command. The session hook adds the private half to each new worktree in about 4 seconds, and a pull updates both halves. The landing script commits both, checks the whole folder, then pushes the public commit and then the private one.

A contributor clones the public repo and gets the code without the tests. They file issues with reproductions, and the team writes every fix.

## Folder after the split

```
~/git/plate-2/
├─ .git            udecode/plate           code, .agents, AGENTS.md, VISION.md, public docs
├─ .git-private    udecode/plate-private   tests, plans, research
├─ .gitprivate     public                  the list of paths that belong to plate-private
├─ packages/plitejs/src/diff/lib/compare.ts        public
├─ packages/plitejs/src/diff/lib/compare.spec.ts   plate-private, still imports './compare'
└─ docs/plans/…                                    plate-private
```

A team clone points public git's `core.excludesFile` at `.gitprivate`. `.git-private` tracks the same paths, `git status` shows public changes, and `node tooling/scripts/git-private.mjs status` shows private ones. In a session worktree, `.git-private` is a file that points at a linked worktree of the main checkout's private repository.

## No overhead

| Day-to-day action | What handles both repos |
| --- | --- |
| Start a session | The app makes the public worktree. Git's post-checkout hook, which `init` installs, attaches the private half, which took 4 seconds and 1 MB in the POC |
| Set up a team clone | One `node tooling/scripts/git-private.mjs init` per clone. The cutover runs it here, and each teammate's agent runs it once |
| Land | `land.mjs` commits both halves, runs the checks over the whole folder and pushes both |
| Pull, or the app's base-branch sync | Git's post-merge hook, which `init` installs, merges `udecode/plate-private`'s `next` into the private branch |
| Rebase | `land.mjs` rebases both halves, and the post-rewrite hook restores any private file git removed |
| Keep unsaved private work | The Stop hook autosaves it at the end of every agent turn, in about 0.6 seconds |
| See what changed | `git status` shows only the public half, because git cannot show a second repository there. `land.mjs`, the session hook and `git-private.mjs status` show both. No step depends on an agent reading private status, because `land.mjs` commits every change and the autosave keeps the rest |

## No loss

Each path below is a way git or a script can lose private work. Where a path says what git did, the POC ran it against local copies of both repositories (`risks-a1.log`, `autosave-time-a1.log` in the run directory).

- **A worktree folder is removed.** `git worktree remove` without `--force` deleted a session folder whose only changes were private, and exited 0, because git counts ignored files as clean. The private half is a linked worktree of the main checkout's `.git-private`, so its commits live outside the folder and survived. The autosave kept the unsaved edit and the new spec. `guard.mjs` refuses `git worktree remove` of a folder that still holds `.git-private` and names `git-private.mjs detach`, which autosaves and then unlinks the private half. The cleanup scan runs `detach` before it removes such a worktree.
- **`git clean -x` or `-X`.** Either would delete 641 entries, 420 of them spec files. Plain `git clean -d` deletes none. `guard.mjs` refuses `-x` and `-X` in a split checkout, and refuses any `git clean` through `.git-private`, which would delete every public file. `git-private.mjs clean` refuses too.
- **A checkout, switch, reset, merge or rebase to a commit from before the split.** Git overwrote an unsaved private edit without asking and exited 0. Going back deleted all 6,931 private files from disk. `guard.mjs` refuses those targets and names `git show <rev>:<path>` and a detached worktree instead. The post-checkout, post-merge and post-rewrite hooks restore every missing private file from the private index; in the POC, all 6,931 came back. The autosave keeps edits up to the last turn.
- **One half of a landing is refused.** `land.mjs` pushes public first, then private. A refused push rebases and retries, as today. If it is still refused, both commits stay local, the worktree stays, and the next `land.mjs` run pushes the missing half before anything else.
- **A teammate's first pull of the split.** Git refused the pull while a private file had an unsaved edit, so nothing was lost. With no edits, the pull removed the private files from disk and kept an untracked new spec. Attaching `.git-private` restored all of them, and both statuses were clean.
- **A branch cut before the split.** Its commits touch private paths that public git no longer tracks. `land.mjs` stops it and names `git-private.mjs migrate`. That command saves the whole branch and its unsaved changes as a ref and a patch, splits the change by `.gitprivate`, resets the worktree to public `next`, attaches the private half, and applies each half with a three-way merge as uncommitted changes. The next `land.mjs --message` lands both. In the POC, the private half held a committed spec edit, an unsaved spec edit and a new spec, and it merged cleanly with a change private `next` already had. A source line both sides changed stopped with conflict markers holding both, as a rebase does. This covers natamox, sin6626 and felixfeng33's branches and the old worktrees. A branch that still runs its old `land.mjs` fails its rebase or the private check instead of landing private files.
- **A team checkout without its private half.** Its tests are not on disk, so `pnpm check` would pass with nothing tested. `pnpm check` refuses in a team clone, which `init` marks, when `.git-private` is missing or a private file is missing from disk. A contributor's clone and CI skip the 12 steps that read private files and run the rest.
- **A script that lists or reads files through git.** It sees only the public half. Each such script asks `git-private.mjs` instead, which reads a private file at a public commit from the private commit whose `Lands-With:` line names that commit.

## Outcome

- `udecode/plate` tracks 4,700 files: shipped code, `.agents`, `.claude`, `.github`, `AGENTS.md`, `VISION.md` and the public docs. A fresh clone holds no test, plan or research file outside `.agents` and `.claude`.
- `udecode/plate-private` tracks the other 6,931 files at the same paths. No file is in both.
- Every file stays where it is today, and no import, config or test runner changes for that reason.
- A team checkout and every session worktree hold both halves, and `pnpm check` runs over the whole folder as it does today.
- `land.mjs` lands a public commit and its private commit together.
- No copy, mirror or export script exists.

## Layouts compared

| Layout | What moves | What it costs | Verdict |
| --- | --- | --- | --- |
| One folder, two git dirs | Nothing on disk. Public git stops tracking 6,931 files, and `.git-private` starts | A second git dir that worktrees, landing, cleanup and every git-listing script must know about | Pick. The POC passes on the real tree |
| Sibling folder `../plate-private`, tests import `../plate/...` | 6,931 files, and the relative imports of 1,089 spec and test files | Rewritten imports and resolvers, two roots for agents, and the 14 findings the first panel raised against tests that leave their folders | Rejected, because it pays every cost of this layout plus the move |
| One public repo, as today | Nothing | Tests, plans and research stay public | Rejected by your policy |

## Decisions

Your decisions:

- Plite and all shipped code stay MIT. Tests, plans and research go private for the team only. Contributors file issues with reproductions, and the team writes every fix.
- `.agents` stays public, and agents run from one folder.
- No file is maintained in two places, and nothing copies or generates files toward the public repo: "yup i dont like copies. no script to generate/copy. i dont care about 2 commits at once. agent is taking care of all that. there is no human in private repo. only agents. plumbing rewritten  no worries as well"
- The organization stays on GitHub Free: "yes free".
- "before building the whole, you should POC that it works and i can review the full plan / shape"
- Relayed by a forked session: "Interesting so we can pull twice in the same tree ? Ok go that direction just make sure we'll have no loss with scripts like land. But no overhead please".
- The private repository's name: "go plate-private".
- "lets go build all fast, no worries for the other sessions." Every phase builds now on the main lane, with no panel, and the push no longer waits for your other sessions.

Lead decisions:

- **`.gitprivate` is the one list of private paths.** It is public and uses `.gitignore` syntax. It lists rules, not files, in this order: root entries are private unless named, then the test globs, then the files that test, measure or probe the code, and last the public exceptions. It reproduces the export manifest's classification exactly, with one change: `.github` stays public, because the workflows keep running in the public repository.
- **Public git reads `.gitprivate` through `core.excludesFile`.** `.gitignore` would hide the tests from `rg`, and so from agents' searches. `rg` does not read a repository's own `core.excludesFile`, so it still lists all 71 specs in the POC package. `.gitignore` outranks `core.excludesFile`, so its re-include lines under `docs/plans/artifacts` move out, and `.git-private` tracks those files.
- **`.git-private` holds the private repository.** It has `status.showUntrackedFiles=no`, because the public files would otherwise show as untracked. `git-private.mjs status` lists the new private files that neither repository tracks yet, using public git's own matching against `.gitprivate`.
- **A session's private half is a linked worktree.** Git's post-checkout hook adds a linked worktree of the main checkout's `.git-private`, on a branch named like the public one, and checks it out over the session folder. Its commits live in the main checkout, as public commits do, so removing the folder loses no committed private work. The POC took 4 seconds and 1 MB, where a separate clone took 33 MB. When the folder goes, `git-private.mjs detach` removes that one record from the private repository.
- **`.gitprivate` arrives with the split commit.** Every script reads a commit without `.gitprivate` as one from before the split, which still tracks the private files. If the list landed with the tooling, `land.mjs` would refuse every older branch until the cutover, and the guard and hooks would treat commits between the tooling and the split as split. So Phase 1 lands the tooling alone, and the cutover commit adds `.gitprivate`, the `.gitignore` edit and the lint baseline split. The kit for that commit, `cutover.sh` with its inputs, waits in the run directory. The post-checkout hook attaches a private half only to a commit that has the list.
- **Public lands first.** A public commit without its private commit only lacks its test for a moment. A private commit without its public commit would fail every other checkout's tests.
- **Git hooks keep the halves in step.** `init` installs post-checkout, post-merge and post-rewrite hooks into the clone's shared hooks folder. They attach a missing private half to a new worktree, merge private `next` after a pull, and restore missing private files from the private index. Each hook exits at once in a checkout that has no `git-private.mjs`, such as one at an old commit.
- **Autosave every turn.** The project's Stop hook writes the private half's unsaved edits and new files to `refs/git-private/autosave/<branch>` in the main checkout's `.git-private`, without touching the branch or the index. A save never records a deletion, and while HEAD stays put each save starts from the last one, so a command that deleted private files cannot overwrite the save of their edits.
- **`guard.mjs` refuses what deletes private files.** In a split checkout it refuses `git clean -x` and `-X`, any `git clean` through `.git-private`, any checkout, switch, reset, merge or rebase to a commit without `.gitprivate`, and the removal of a worktree that still holds `.git-private`. That change goes through `udecode/dotai`.
- **`git-private.mjs migrate` moves old branches.** `land.mjs` refuses a branch cut before `.gitprivate` existed on `origin/next` and names the command, which No loss describes. The command runs the main checkout's copy, because an old branch has none.
- **`pnpm check` refuses a team checkout without its private half.** A clone with no private half, such as CI's or a contributor's, skips the steps marked `private` and runs the rest.
- **Every git read covers both repositories.** `git-private.mjs` exports the readers: tracked, changed and new private files, `git grep` over both, and a file's content, existence or history at a public commit. A public commit maps to the private commit whose `Lands-With:` line names it or its nearest first-parent ancestor, and a commit from before the split still holds its private files. `pnpm check --affected` finds a spec-only change through it.
- **pstack learns a companion git dir.** `land.mjs`, `guard.mjs`, `setup.mjs`, `tasks.mjs` and the cleanup scan read `companion` from `.agents/pstack.json`. That change goes through `udecode/dotai`, as every pstack change does.
- **Guards in `pnpm check`.** The `private` step refuses a public file that `.gitprivate` matches, which catches a forced add, a public code file that imports a private file or a test runner, and a team checkout without its private half.
- **The lint baseline splits by path at the cutover.** `tooling/oxlint/plate-baseline.json` keeps the 78 public files' entries, and `tooling/oxlint/plate-baseline.private.json`, which plate-private tracks, keeps the 31 private files' entries, because each entry holds the flagged line's text. Lint reads both, the check enforces each against its own files, and the base commit's two copies together bound growth.
- **The private repository starts at the split.** Before the split commit, public history still holds every test, plan and research change.
- **The task list and triage claims move.** `setup.mjs` keeps `refs/pstack/ledger`, and `triage.mjs` keeps `refs/triage/claims` and reads the ledger, on `udecode/plate-private` once the checkout is split.
- **Nothing changes on GitHub's public side.** No export app, no new rulesets and no access changes, because the team keeps pushing `udecode/plate` as it does today. Every script that `plite-ci.yml` runs goes private, so that one workflow moves to `udecode/plate-private`, as the Plite CI default says. `land.mjs` runs every other check locally, as today.

## Main changes

- The cutover commit adds `.gitprivate`, which stays public, and `.gitignore` drops its re-includes under `docs/plans/artifacts` and adds `/.git-private`, which matches the folder and the session file. `cutover.sh prepare` builds that commit in a fresh worktree, and `cutover.sh finish` pushes the matching first commit of `udecode/plate-private`.
- `tooling/scripts/git-private.mjs`: `init` sets up a clone and installs the git hooks, `attach` and `detach` add and remove a session's linked worktree, `migrate` moves an old branch, `sync` merges private `next` after a pull, `restore` puts back missing private files, `autosave` saves unsaved private work, `status` shows both repositories and the untracked private files, `check` is the `private` step, and any other command runs git against `.git-private`. It also exports the readers that Decisions lists.
- The project's Stop hook runs `git-private.mjs autosave`, and `.agents/pstack.json` names the companion: its git dir, its list, `migrate` and `detach`.
- The readers move to `git-private.mjs`: `check.mjs`, `review-ledger.mjs`, `knowledge.mjs`, `kb.mjs`, `finding-baseline.mjs`, `teaching-sweep.mjs`, `check-removed-api-teaching.mjs`, `triage.mjs` and the schema adoption check.
- `check.mjs` marks 12 steps `private`: type-tests, test, plite-test, authored-order, autoformat-rules, bench-targets, cli-test, bench-report, review-ledger, knowledge, triage and core-audits.
- The lint plugin and its check read a second baseline file when one exists, and the cutover moves the private files' entries into it.
- Through dotai: `land.mjs`'s paired landing, its resume and its old-branch refusal, `guard.mjs`'s refusals, the ledger on the companion in `setup.mjs`, plans read from the companion in `tasks.mjs`, `detach` before the cleanup scan removes a worktree, and a Companion repository rule in `land.md`.
- `AGENTS.md`'s Source authority rule and the review-comment rule sent searches to `git grep --untracked`, which cannot see private files. They send searches to `rg --hidden` and `rg --files --hidden` instead. A new `.rgignore` skips `.git`. In this worktree the two commands list every `.agents` file and no `.git` entry, and under `docs/plans/artifacts` and `.tmp` they list only the 9 files git tracks.
- The export work drops out: `export-public.mjs`, its manifest, its test and its workflow, `main-remote.mjs` and its readers' changes, and the workflow gate and prune edits. The base URL move to `plite-static-server.mjs` and the private paths `plite-yjs.mdx` stopped naming stay.

## Steps

### Phase 1. Tooling and guards, in this worktree

Exit: a rehearsal with two local bare repositories splits the tree, attaches a session worktree, lands a paired fix through `land.mjs`, and runs `pnpm check --affected` green in the split worktree, including a run that a spec-only change starts. It also runs every path under No loss and ends with no private edit, commit or file missing.

- [x] Run a panel on this plan after your go. skip: fast, because you said "lets go build all fast".
- [x] Build the cutover kit: `.gitprivate`, the `.gitignore` edit, the baseline split and `cutover.sh`. Proof: the rehearsal's cutover leaves both statuses clean and no file tracked by both, and the two repositories together track the Phase 1 files plus `.gitprivate` and the private baseline. The POC matched `.gitprivate` to the export classifier's list minus `.github` at `850875f612`.
- [x] Add `git-private.mjs` with its test. Proof: the test covers `init`, `attach`, `detach`, `sync`, `restore`, `autosave`, `status` listing an untracked private file, and passthrough.
- [ ] Install the git hooks through `init`, and run `autosave` from the Stop hook. Proof: a test where a pull, a checkout across the split and a rebase each leave no private file missing, and one where an unsaved edit and a new private file survive the folder's removal. `autosave` takes under a second on the full tree.
- [ ] Move the readers to the exports of `git-private.mjs`. Proof: a test that a spec-only change appears in the affected list, and each reader's own test.
- [ ] Add the three `pnpm check` guards. Proof: each one fails on its planted case, a forced add, a private import and a team clone without `.git-private`, and passes on the split tree and on a contributor's clone. The planted cases pass in `git-private.test.mjs`; the rehearsal runs the split tree and the contributor's clone.
- [x] Split the lint baseline at the cutover. Proof: the baseline check passes before the split with one file, public lint in a fresh public clone passes, and lint in the split checkout reports the same findings as before the split.
- [x] Through dotai, teach `land.mjs`, `guard.mjs`, `setup.mjs` and `tasks.mjs` the companion git dir, `land.mjs` the paired push and the old-branch move, and `guard.mjs` its refusals, and sync it here. Proof: each script's test with a companion fixture, including a refused private push that the next run completes, and the sync commit.
- [x] Teach the cleanup scan private changes. Proof: its test with a worktree whose only changes are private. The scan runs the companion's `detach` before it removes such a worktree, and its test passes (30 of 30).
- [ ] Rehearse the split, a session worktree, a paired landing and each No loss path. Proof: the rehearsal logs, including an old branch with committed, unsaved and new private changes landing both halves, and a fresh public clone that installs, builds and lints.

### Phase 2. Cutover, after Phase 1 lands

Exit: both repositories are live, this clone and every teammate's clone hold both halves, and the first paired landing reaches both.

- [x] Wait for your word that your five sessions have landed, and for natamox, sin6626 and felixfeng33 to say theirs have too. skip: you said "no worries for the other sessions", and their branches move on their next `land.mjs` run.
- [ ] Land Phase 1 on public `next` through `land.mjs`. Proof: the land log.
- [ ] Yours: create `udecode/plate-private` as a private repository with `next` as its default branch, and add the team. Proof: `gh repo view udecode/plate-private` shows it private.
- [ ] Run the split: `cutover.sh prepare` in a fresh worktree at `origin/next`, `land.mjs` to land the public commit that stops tracking the private files, then `cutover.sh finish` to push the first `udecode/plate-private` commit that tracks them, and the task list and claims refs. Proof: `git ls-remote` on both, and a fresh clone of each.
- [ ] Move `plite-ci.yml` to `udecode/plate-private` in the split. It runs only when dispatched, checks out `udecode/plate` at the commit its `Lands-With:` line names, and `check-plite-release-proof.mjs` reads its artifact there. The daily full check gains an opt-in Plite browser step. Before the split, that step would also run in public CI beside `plite-ci.yml`. Proof: a dispatched run whose release proof passes `pnpm plite:release:proof`.
- [ ] Run `git-private.mjs init` once in `~/git/plate-2`, and each teammate runs it once in their clone, before or after their pull. Old branches and worktrees move on their next `land.mjs` run. Proof: both statuses clean and no private file missing in each clone.
- [ ] Land this plan and its decision log on `udecode/plate-private`, then watch the first paired landing. Proof: the commit on each repository.

### Phase 3. After the move

- [ ] `VISION.md` records your policy: shipped code stays MIT, tests, plans and research are team-only, and contributors file issues while the team writes every fix. Proof: the commit.
- [ ] The contributor guide, the issue templates and `content/docs/plite/general/contributing.mdx` say to file an issue with a reproduction. Proof: the commit.
- [ ] Delete or keep the old public task list, per the Old task list question. Proof: `git ls-remote udecode/plate refs/pstack/ledger`.

## Proof

The POC ran on this branch's tree at `850875f612`, with local bare repositories standing in for both GitHub repositories (`poc-a3-a1.log`, `poc-tools-a1.log` in the run directory).

- `.gitprivate` marks 6,931 of the 11,630 tracked files private, exactly the export classifier's list minus `.github`, with no file on either side alone.
- After the split, both repositories report a clean status, no file is tracked by both, and together they track every file from before plus `.gitprivate`.
- A fresh clone of the public repository holds 4,700 files, none of them a spec or test outside `.agents` and `.claude`, and its `docs` holds only `README.md`, `development`, `plite` and `vision`.
- A session worktree got its `.git-private` in 3 seconds and 33 MB, with every file in place and both statuses clean.
- A paired fix put `compare.ts` and a new `poc-new.ts` on public `next`, and `compare.spec.ts` and the new `poc-new.spec.ts` on private `next`. The new-file finder listed the new spec before anyone tracked it.
- In that worktree, the install took 29 seconds, and the package's diff partition ran 50 tests across 6 files with none failing. Turbo's lint hash changed when only the ignored spec changed, and the partition's lint caught a planted `debugger` in that spec.
- `rg` lists all 71 specs in the package, and `git grep --untracked` lists none.
- The loss-path POC (`risks-a1.log`) found the paths that No loss lists and what each guard keeps. A session's linked worktree took 4 seconds and 1 MB. The autosave took about 0.6 seconds once `comm` replaced `grep -f` (`autosave-time-a1.log`).
- Not proven yet: `land.mjs` landing a pair, `pnpm check --affected` over a split tree, a fresh public clone's build and lint, the hooks, guards and autosave as built, and the pstack changes. Phase 1 proves each.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Layout | One folder with two git folders (look) | A sibling plate-private folder, with tests moved and their imports rewritten | sibling repos | big |
| How the public repo skips private files | Its own ignore setting reads the list of private paths, so code search still sees tests | The repo's local exclude file, which code search also reads, so agents' searches lose the tests | info exclude | small |
| Workflows | The workflows folder stays public and keeps running there | Private, as in the export plan | private workflows | small |
| Private repo history | Starts at the split, and public history keeps the rest | Copy every private file's history into the private repo | private history | small |
| Who writes the public repo | The team, as today (look) | Only admins and a landing bot | lock public | small |
| Design comparison | My own table and the POC, because your no-copies rule leaves one family of layouts (look) | A full architect run before the build | architect | detail |
| Review | None, because you said build fast (look) | A panel on the plan, then on the diff | full | detail |
| A session's private half | A linked worktree of the main checkout's private repo, so its commits outlive the folder | A separate clone per session, 33 MB each | session clone | small |
| Unsaved private work | Autosaved at the end of every agent turn (look) | Saved only when a session lands | land only | small |
| Branches cut before the split | Land moves them onto both repos after saving a patch | Land refuses them, and the agent moves them | refuse old branches | small |
| Team clone setup | One setup command per clone, after which git's hooks give every new worktree its private half | The session start hook runs that setup in every session | init on start | detail |
| Plite CI | The Plite CI workflow moves to the private repo and runs only when dispatched, for the release proof, so it stays inside Free's 2,000 minutes. Its per-push browser run moves to the daily full check (look) | It stays public and checks out the private repo with a deploy key, so public logs and artifacts show test names and failures | public plite ci | small |
| A session's list of private paths | Uses the main checkout's copy, so a branch's edit to the list applies once it lands | Each session uses its own branch's copy | worktree gitprivate | detail |

## Open questions

### Old task list

Should I delete the old task list and claims from the public repo?

Why it needs you: It deletes data this run did not create.

- Anyone can read its 5,019 team rows and the claims' session ids today.
- After the move, new rows and claims go to the private repo only.

- **Delete it** (recommended): I delete the public copy once the private repo holds every row. Cost: Old links to it stop working.
- **Keep it**: The public copy stays, frozen at today's rows. Cost: Anyone can still read old team notes.

Why I pick it: The rows are team notes, and the private repository keeps all of them.

Attention: look

## Open work

- Old public commits keep their tests, plans and research. Owner: you. Stop: none, since you said public history does not matter.
- `AGENTS.md`'s Worktrees rule says GitHub's default branch stays `main`, but `udecode/plate`'s default branch is `next` today. Owner: the lead. Stop: none.
- A public test-results page per release, so users still see that the code is tested. Owner: the team after cutover. Stop: none.
- The import check reads no `.d.ts` file, so a public declaration file could import a private one unseen. One `.d.ts` file in the repository has a relative import today, and it is private. Owner: the lead. Stop: none.
- `review.mjs` lists a landing's public commits only, so a review of a paired landing does not show its private commit. Owner: the lead. Stop: none.
- `verify`'s base-control recipe applies the task's saved patch to a detached worktree, which holds only the public half, so a control misses the task's private changes. The recipe needs a step that saves and applies the private patch too. Owner: the lead. Stop: none.
- `seed-repos.mjs` still lists files through public git. Owner: the lead. Stop: none.
- I could not read what the desktop app checks before it removes a session's worktree. Committed private work lives in the main checkout and the autosave keeps the rest, so a removal loses at most edits made after the session's last turn. Owner: the lead. Stop: the Phase 1 rehearsal archives a session and checks.

## Claims

- The export plan kept the whole tree in the private repository and generated public `next`. Here each file lives in one repository, and nothing is copied.
- The export plan said the private repository needs GitHub Team for its environments, rulesets and Actions minutes. This layout runs only the dispatched release proof there, so Free is enough while those runs stay inside its 2,000 minutes.
- The export plan let only admins and an export app write the public repository, under four new rulesets. Here the team keeps pushing `udecode/plate` as it does today.
- The first draft of this plan said each teammate must set up `.git-private` before pulling the split, or lose private files. The POC shows git refuses that pull over unsaved private edits and removes only unmodified files, which the private repo restores, so the order does not matter.
- The first draft gave each session a separate 33 MB clone. A linked worktree keeps its commits in the main checkout, where removing the folder cannot reach them.

Execution playbook: Build (`.agents/playbooks/build.md`).
