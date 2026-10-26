# Move tests, plans and research into a private repo

Status: planning, waits for your pick of the repo layout
Page: https://claude.ai/artifact/Fvy3AvCJwNugx2L7FeU8ZM
Playbook: plan

Shipped code stays MIT and public. Tests, plans and research go private, agents keep one working folder, and every skill stays public in `.agents/`. The first design put the private files in a `private/` folder inside the public checkout. The plan panel's first round broke it before any build, so this plan waits for your pick of the layout. Nothing is built, and nothing has moved.

## Brief

### What will change?

The panel found that moving tests into a private folder breaks about a dozen tools. I stopped before building anything. You pick the layout, then I rewrite the plan and build it.

### What could go wrong?

The public copy reverses your no-duplicates call. Keeping the folder means fourteen fixes that can break again. Today the task ledger already sits on the public repo.

## Teach

Plate keeps each test next to the code it checks. A test finds its tools, such as its test library, by looking upward from its own folder. Many tests also read files by where they sit, like the package's settings.

The first design moved every test into one private folder at the top. From there a test looks upward and never reaches its package's tools or files. Each test runner needed its own patch to fake the old spot, and the reviewers found four runners and many file reads the patches miss.

Two layouts keep tests where they are. In the first, the team works in one private repo, and a script copies everything except tests, plans and research to the public repo. In the second, a second git repo tracks the test files inside the same folder.

## Open questions

### Repo layout

Which layout should hold the private tests?

Why it needs you: It reopens your no-duplicates call and moves where production releases run.

- All three reviewers found that moving tests out breaks about a dozen tools.
- Tests find their packages from their own folder, so they must stay in place.

- **Generated public copy** (recommended): The team works in one private repo, and a script publishes the public part. Cost: Public holds a generated copy nobody edits, and releases move to the private side.
- **Second git repo**: Tests stay in place, and a second git repo tracks them in the same folder. Cost: Every git command, worktree and landing needs a wrapper for the second repo.
- **Rebuild private folder**: I fix the folder design with package links, private CI and more loaders. Cost: Fourteen known breakages to fix, and a new test runner can break again.

Why I pick it: Nothing in the team's tree moves, so every tool keeps working unchanged.

Attention: look

## Outcome

- The public repository holds shipped code, `.agents`, `AGENTS.md`, `VISION.md` and the public docs. A fresh public clone installs and builds green, and holds no test, plan or research file.
- A team checkout runs `pnpm check --build` with the same test count as before.
- Private tests run only on private CI, so no public log or artifact shows them.
- The suggested-task ledger lives on the private remote.
- Agents work from one folder.

## Panel round 1

Three seats reviewed the plan: Opus, GPT-6 Astra and GPT-6.1 Sol, all at xhigh. They raised 14 critical findings, and the lead checked each against the code. Every one comes from the same premise: that a test can leave its folder. The findings and their proof are in the decision log.

| Layout | What the team's tree looks like | What it needs | What it removes |
| --- | --- | --- | --- |
| Generated public copy | Today's tree, unchanged, in a private repo | An export script on each landing, private CI, releases from private | Every loader, resolver and paired landing |
| Second git repo | Today's tree; a second git directory tracks the private files in place | A wrapper for git, worktrees, landing and cleanup; private CI | The loaders and resolvers |
| Rebuild private folder | Tests under `private/` at mirrored paths | Package links, four resolvers, edits to 157 files, generated configs split by checkout, paired landing, private CI | Nothing |

Two findings hold under every layout. Public CI logs and artifacts are world-readable, so private tests run only on private CI. The suggested-task ledger already pushes 5,019 rows to `refs/pstack/ledger` on the public repo today, so it moves to the private remote.

## Scope

### Moves to plate-private

The manifest at 238d4c3f08 lists 6,607 files (proof: the run directory's `move-manifest-238d4c3f08.txt`).

| Class | Paths | Files |
| --- | --- | --- |
| Tests | the `reviewPaths.tests` globs in `.agents/pstack.json`, plus `tooling/e2e/**` and `apps/plite/scripts/*.test.mjs`, minus `.agents/**` | 2,315 |
| Internal docs | `docs/**` except `docs/vision`, `docs/editor-behavior`, `docs/development` and `docs/README.md`. That covers plans, research, `docs/plite`, the harvesters, audits, triage, sync, transplant, maintainer runs and performance notes | 4,291, of which 20 are tests |
| Benchmark notes | `benchmarks/editor/{docs,research,iterations}` | 21 |

### Stays public

- Every workspace package, `package.json` and the lockfile. `private/` holds no `package.json`, so the move never changes the lockfile. `packages/test`, `apps/plite` and the `benchmarks/editor` runner stay public; only their test files and notes move.
- `.agents/` whole, including its own 10 test files, because a sweep's value is its manual checks, not its scripts.
- `AGENTS.md`, `VISION.md`, `docs/vision`, `docs/editor-behavior` and `docs/development`, because the public skills read them.

### Out of scope

- Rewriting public history. Old tests stay readable in past commits.
- Changing any package's license.

## Decisions

Owner decisions from the conversation:

- Plite and all shipped code stay MIT. Developers pay to save time, and a license does not stop an agent from copying a feature it can see.
- Tests, plans and research go private and only the team can read them. Contributors file issues with reproductions, and the team writes every fix and PR.
- `.agents` stays public, so contributors can still run the issue and reproduction skills.
- Agents run from one folder, and no file is kept in two repositories.
- Public history does not matter, because v2 has over 100 open bugs and a fork of today's tests gains little.

Lead decisions, from the first design. The panel's first round rejected the first three, and the fourth needs a manifest that sorts files by owner instead of by glob:

- **Private nests inside public.** Skills, hooks and `AGENTS.md` load from the public root, so the public root stays the one working folder. The reverse nesting would make every contributor clone a repository they cannot read.
- **A plain nested clone, not a submodule.** A submodule puts a private URL in every public clone and breaks `git clone --recursive` for contributors.
- **Twin paths, not import rewrites.** A private file sits at the public path under `private/`, and resolution falls back to the public twin. Tests keep their relative imports, and the move changes no file's contents.
- **One manifest owns the split.** The move script, the leak guard, the test-suite globs and the path codemod all read one list of globs, so the split never drifts between tools.
- **The overlay ships behind config before anything moves.** Phase 1 lands every loader and helper while `private/` is still empty, so the full check proves they change nothing. Phase 2 is then only the move.

## Main changes

No public call changes, and nothing is built yet. The panel rejected the first design's changes: twin loaders, paired worktrees and landing, a leak guard over a nested folder, and a private checkout in public CI. The rewritten plan lists the new changes after your pick.

## Steps

On hold. These steps build the first design, which the panel rejected. They get rewritten after your layout pick.

### Phase 1. The overlay ships with nothing moved

Exit: `private/` is empty or absent, and every check runs the same tests as before.

- [ ] Run a panel on this plan, attacking whether each phase beats keeping today's layout. Proof: the panel's `seats` rows in the decision log, and the challenge delta written in this plan.
- [ ] Add the manifest module under `tooling/config/` with the three classes above, and a script that lists its files. Proof: its list matches `move-manifest-238d4c3f08.txt` at the base commit, 6,607 files.
- [ ] Add the bun twin loader as a `bunfig.toml` preload, built from the probe's `twin-loader.ts` with `private/` as its root. Proof: with two specs moved into a scratch `private/` and deleted from public, `bun test` passes them, and the control run without the loader fails to resolve (the probe's `bun-twin-onload-a1.log` and `bun-no-resolver-a1.log` show this shape).
- [ ] Add a Vite `resolveId` twin plugin to `packages/test/vitest.config.ts` and `packages/plitejs/vitest.config.mjs`. Proof: one moved browser spec per suite passes in scratch, and fails without the plugin.
- [ ] Add `rootDirs: [".", "private"]` to the test and type-test tsconfigs, and add the private globs to each `include`. Proof: `tsc -p tooling/config/tsconfig.type-tests.json` and the test tsconfig pass with moved files in scratch, and fail with TS2307 without `rootDirs` (as in `tsc-control-no-rootdirs-a1.log`).
- [ ] Point the Playwright `testDir` of `apps/www` and `apps/plite` at the private twin when it exists. Proof: the managed `test:plite-browser:smoke` and one www browser spec run from scratch `private/` with the same case count.
- [ ] Make the test-suite globs in `tooling/config/test-suites.mjs`, the entrypoint partition test runner and `check.mjs`'s affected mapping also match files under `private/`, keyed to their public twin's package. Proof: `pnpm check --affected` on a scratch change to one private spec runs that package's tests.
- [ ] Make turbo hash private test files. Proof: editing one private spec turns a cached test task into a miss under `turbo run --dry`.
- [ ] Make oxlint, eslint and biome lint `private/` despite its gitignore. Proof: a planted lint error in a scratch private spec fails `pnpm lint`.
- [ ] In dotai, teach `setup.mjs`, `land.mjs`, `guard.mjs`, `review.mjs`, `cleanup`, `decisions-check.mjs`, `page-stop.mjs` and `plan-page.mjs` the `private` key, and render the rule text's plan paths from `plans` instead of a literal `docs/plans`. Proof: new sync-pstack test cases for a paired setup, a paired land and a paired cleanup pass, and a plate sync with the key unset changes no file.
- [ ] Full baseline proof. Proof: `TURBO_FORCE=true pnpm check --build` passes with the same test count as `next` at the same commit, logged through `proof.mjs`.

### Phase 2. The move script, rehearsed now, pushed later

Your five sessions keep editing tests and plans that move, so a move commit carried across their landings would conflict on thousands of files. The move is a script instead. The build rehearses it in this worktree, and at push time it reruns on a fresh `origin/next`, so it picks up whatever those sessions landed.

- [ ] Write the move script under `tooling/scripts/`. From a public checkout at any commit, it fills a private repository with `git filter-repo --paths-from-file` on the manifest, so each file keeps its history. It then removes the manifest files from public, adds `private/` to `.gitignore` and `!/private/` to a root `.ignore`, sets `"private": "private"` and points `plans` and `pageTopic.hub` into `private/` in `.agents/pstack.json`, and rewrites references to moved paths in public files outside the synced block. Proof: two runs on the same commit give the same public and private trees, the private file list equals the manifest, and `git log` shows history for three sampled files.
- [ ] Add the leak guard to `pnpm check`. Proof: a planted `foo.spec.ts` in public fails the step, and removing it passes.
- [ ] Teach agent rules to search with `rg` or `git -C private grep`, because the shell's `grep` wrapper skips ignored folders. Proof: `search-wrapper-a1.log` shows the wrapper missing `private/` and `rg` finding it.
- [ ] Add the private checkout step to `ci.yml`, reading a deploy key secret, and skip it when the secret is absent. Proof: the workflow lints, and the step's condition skips on a fork-style run with no secret.
- [ ] Rehearse the whole move in this worktree, with a local bare repository standing in for `udecode/plate-private`. Proof: `TURBO_FORCE=true pnpm check --build` runs the same test count as before the move. A fresh public clone of the rehearsal runs `pnpm install --frozen-lockfile`, build, typecheck and lint green, with zero manifest files. `rg -l` from the root finds a private plan, and `plan-page.mjs --check` passes on this plan at its new path. A new task worktree gets `private/` on its branch, and a trivial paired change lands to both bare remotes.

### Push, after your five sessions land

- [ ] Push gate. A script lists every worktree with commits not on `origin/next` or uncommitted changes that touch a manifest path, and its output is empty.
- [ ] Rebase this worktree onto `origin/next`, rerun the move script, and rerun the rehearsal's proof on that commit.
- [ ] Create `udecode/plate-private` as a private repository with no outside collaborators, push the private tree, and land public through `land.mjs`. Proof: both remotes show the paired commits, and CI on `next` shows the private checkout step and a green check once you add the deploy key.

### Phase 3. The contributor path without private/

- [ ] Without `private/`, `setup.mjs` prints one line saying the tests are team only, `pnpm check` skips its test steps with that line instead of failing, and skills that need plans or tests say so and go on. Proof: in a fresh public clone, smoke the issue draft, triage and verify routes, and read each transcript.
- [ ] Update `CONTRIBUTING.md` and the issue templates: file an issue with a reproduction, and the team writes the fix. Proof: the rendered GitHub preview of both.

## Proof

- Phase 1 closes on the full check passing with `private/` empty, at the same test count as `next`.
- Phase 2 closes on the cutover proof above: team checkout count equal to the baseline, a clean fresh public clone, a paired land and a paired worktree.
- Phase 3 closes on smoke transcripts from a fresh public clone.
- Proven so far, by throwaway probes: bun twin imports through an `onLoad` rewrite (16 pass, and the control fails), TypeScript `rootDirs` (passes, and the control fails with TS2307), and ripgrep seeing the ignored folder through `.ignore`. Bun's `onResolve` hook does not see imports, only the entry file, so the loader rewrites source in `onLoad`.
- Not proven yet: the vitest plugin, Playwright `testDir`, lint tools, turbo hashing, `check.mjs` affected mapping, and the dotai helpers. Each has its own Phase 1 step and control.

## Claims this plan reverses

- An earlier reply proposed mirroring files between two repositories. The plan keeps one nested clone and no copies.
- An earlier reply kept unit tests public and moved only browser tests. The plan moves every test outside `.agents`.
- An earlier reply moved `VISION.md` private. It stays public, because the public skills read it.
- An earlier reply moved the verify recipes private. `.agents` stays public whole.
- An earlier reply said the nested folder needed only a small loader and one type setting. The panel proved it needs far more, so the layout is open again.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What moves private | Every test, plan and research file outside the agent skills | Keep unit tests public and move only browser tests | keep unit tests | big |
| Agent skills and their own tests | Stay public whole | Move the skills' tests private too | move skill tests | small |
| Vision and editor behavior law | Stay public, because the public skills read them | Move them private | private vision | small |
| Benchmark runner | The runner stays public, and its notes and tests move | Move the whole benchmark package, which then needs its own install | private benchmarks | small |
| Old tests in public history | Stay readable in past commits | Rewrite history, which breaks every fork and open pull request | rewrite history | small |
| Where tests run in CI | The private repo runs every test on its own CI, and public CI only builds (look) | Public CI fetches the private repo with a read-only key | public CI | small |
| Who gets access | I create the repo with nobody added, and you add each person | I add the people you name | add people | detail |
| Plan review | A panel on this plan when you say go, before any build (look) | Build without a panel | skip panel | detail |
| Contributor guide | Tells people to file an issue with a reproduction, and the team writes the fix (look) | Keep inviting outside pull requests | keep outside PRs | small |
| When to build and push | Build and rehearse now in this worktree, and push after your five sessions land with nothing unlanded on a moving file | Push now and rebase those sessions | push now | detail |

## Open work

- A public test-results page per release, so users still see that the code is tested. Owner: the team after Phase 3. Stop: none.

Execution playbook: Build (`.agents/playbooks/build.md`).
