# Move tests, plans and research into a private repo inside Plate

Status: planning, waits for your five running sessions to land, then your go
Page: https://claude.ai/artifact/Fvy3AvCJwNugx2L7FeU8ZM
Playbook: plan

Shipped code stays MIT and public. Tests, plans and research move to a new private repository, `udecode/plate-private`, which the team clones at `private/` inside the public checkout. Public git ignores that folder. Agents keep one working folder, every skill stays in `.agents/`, and no file lives in both repositories. Nothing moves until the five running sessions land.

## Brief

### What will change?

Tests, plans and research move to a private repo. The team clones it into a folder inside Plate. Code and agent skills stay public, so contributors still file issues and agents still work from one folder.

### What could go wrong?

A test may import a public file in a way the loader doesn't catch, and break after the move. A file left off the list stays public. Contributors can't see the tests, so their bug reports get weaker.

## Teach

Today one public repository holds all of it: the code people install, the tests that prove it, and the plans and research behind it. Anyone can clone the lot and point an agent at the tests to rebuild what we built.

After the split, the team clones a second, private repository into a folder inside the public one, and public git ignores that folder. Each private file keeps its old path, moved under the private folder. When a test imports a file that used to sit next to it, a small loader finds that file in the public tree, so no import changes. The type checker gets the same rule from one setting.

Agents still work in one folder. Ripgrep, their main search tool, sees the private files, and the land helper commits to both repositories together. A contributor without access can still build and run the code, and files bugs with a reproduction.

## Outcome

- The public repository keeps packages, apps, templates, `content/docs`, `.agents`, `AGENTS.md`, `VISION.md`, `docs/vision`, `docs/editor-behavior` and `docs/development`. A fresh public clone installs, builds, typechecks and lints green, and holds no file from the move manifest.
- `private/` holds the 6,607 manifest files, each at its public path under `private/`.
- In a team checkout, `pnpm check --build` runs the same test count as the baseline taken at the start gate.
- One task worktree holds both repositories on one branch, and `land.mjs` lands both.

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

Lead decisions:

- **Private nests inside public.** Skills, hooks and `AGENTS.md` load from the public root, so the public root stays the one working folder. The reverse nesting would make every contributor clone a repository they cannot read.
- **A plain nested clone, not a submodule.** A submodule puts a private URL in every public clone and breaks `git clone --recursive` for contributors.
- **Twin paths, not import rewrites.** A private file sits at the public path under `private/`, and resolution falls back to the public twin. Tests keep their relative imports, and the move changes no file's contents.
- **One manifest owns the split.** The move script, the leak guard, the test-suite globs and the path codemod all read one list of globs, so the split never drifts between tools.
- **The overlay ships behind config before anything moves.** Phase 1 lands every loader and helper while `private/` is still empty, so the full check proves they change nothing. Phase 2 is then only the move.

## Main changes

No public call changes. Packages, entrypoints and their exports stay as they are.

- A `private` key in `.agents/pstack.json` names the overlay folder. With the key unset, every pstack helper behaves as today.
- Test resolution gains a twin fallback. A bun preload rewrites a private file's missing relative imports to the public twin, a Vite plugin does the same for the two vitest suites, and TypeScript's `rootDirs` lists both roots.
- `setup.mjs` pairs each task worktree with a private worktree on the same branch, and `cleanup` removes both. `land.mjs` commits and pushes both, and the private commit records the public commit it pairs with.
- `pnpm check` gains a leak-guard step. It fails when a tracked public file matches the manifest.
- Public CI checks out `plate-private` with a read-only deploy key on team branches and runs the full check.

## Steps

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

### Phase 2. Cutover

Start gate: the five running sessions landed. A script lists every worktree with commits not on `origin/next` or uncommitted changes that touch a manifest path, and its output is empty. Take the test-count baseline here.

- [ ] Create `udecode/plate-private` as a private repository with no outside collaborators. Fill it from a fresh clone with `git filter-repo --paths-from-file` on the manifest, so each file keeps its history. Proof: the private tree's file list equals the manifest, and `git log` shows history for three sampled files.
- [ ] Remove the manifest files from public, add `private/` to `.gitignore`, and add `!/private/` to a root `.ignore` so ripgrep sees it. Proof: `git status` in public shows no private file, and `rg -l` from the root finds a private plan (as in `search-probe-a1.log`).
- [ ] Set `"private": "private"` and point `plans` and `pageTopic.hub` into `private/` in `.agents/pstack.json`. Run a codemod over public files, outside the synced block, that rewrites references to moved paths. Proof: the knowledge check and the docs link check pass with `private/` present, and `plan-page.mjs --check` passes on this plan at its new path.
- [ ] Add the leak guard to `pnpm check`. Proof: a planted `foo.spec.ts` in public fails the step, and removing it passes.
- [ ] Teach agent rules to search with `rg` or `git -C private grep`, because the shell's `grep` wrapper skips ignored folders. Proof: `search-wrapper-a1.log` shows the wrapper missing `private/` and `rg` finding it. A smoke session asked to find a plan finds it.
- [ ] Add the deploy key secret and the private checkout step to `ci.yml`. Proof: CI on a team branch shows the checkout step and a green `pnpm check --build`.
- [ ] Full cutover proof. Proof: `TURBO_FORCE=true pnpm check --build` in a team checkout runs the baseline test count. A fresh public clone runs `pnpm install --frozen-lockfile`, build, typecheck and lint green, with zero manifest files. A new task worktree has `private/` on its branch. A trivial paired change lands through `land.mjs`, and both remotes show it.
- [ ] Land both repositories through `land.mjs`.

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

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the private repo lives | A folder inside Plate that public git ignores | Plate inside the private repo; or a submodule | submodule | big |
| What moves private | Every test, plan and research file outside the agent skills | Keep unit tests public and move only browser tests | keep unit tests | big |
| Agent skills and their own tests | Stay public whole | Move the skills' tests private too | move skill tests | small |
| Vision and editor behavior law | Stay public, because the public skills read them | Move them private | private vision | small |
| Benchmark runner | The runner stays public, and its notes and tests move | Move the whole benchmark package, which then needs its own install | private benchmarks | small |
| Old tests in public history | Stay readable in past commits | Rewrite history, which breaks every fork and open pull request | rewrite history | small |
| Where tests run in CI | Public CI fetches the private repo with a read-only key, on team branches only (look) | The private repo runs the tests on its own CI | private CI | small |
| Who gets access | I create the repo with nobody added, and you add each person | I add the people you name | add people | detail |
| Plan review | A panel on this plan when you say go, before any build (look) | Build without a panel | skip panel | detail |
| Contributor guide | Tells people to file an issue with a reproduction, and the team writes the fix (look) | Keep inviting outside pull requests | keep outside PRs | small |
| When to cut over | After your five sessions land and nothing unlanded touches a moving file | Cut over now and rebase those sessions | cut now | detail |

## Open work

- A public test-results page per release, so users still see that the code is tested. Owner: the team after Phase 3. Stop: none.

Execution playbook: Build (`.agents/playbooks/build.md`).
