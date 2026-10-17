# Plate proof commands

## Command Pitfalls

Automation should use the repo's known focused commands, not improvised command
shapes.

In `Plate repo root`, prefer these focused forms:

```bash
pnpm test
pnpm --filter <package> test <file-or-pattern>
bun test ./packages/<package>/src/<file>.spec.ts --test-name-pattern "<pattern>"
pnpm --filter <package> typecheck
```

Rules:

- run commands from the Plate repo root unless a package-local script requires
  the package cwd;
- keep docs, skill, runtime, package, benchmark, and Playwright scans rooted in
  the Plate repo. Do not search the donor checkout for current runtime facts;
- before running a focused test, resolve the actual runnable entrypoint from
  the owning surface, not memory: use targeted searches such as
  `rg --files packages/<pkg>/src tooling benchmarks | rg "<basename>|<suite>"`.
  Do this first, not after one failed command;
- match the runner to the resolved entrypoint: Bun specs under
  `packages/*/src/**` use `bun test ./...`. Plate has no durable Playwright
  lane. `pnpm e2e` reads `tooling/config/playwright.config.ts`, whose
  `testDir` is the missing `tooling/e2e`, so browser proof runs through
  `verify`'s Drive section;
- if Bun says "No test files found" or "filters did not match", stop
  guessing command variants. Locate the exact file or wrapper with `rg --files`
  / `rg -n`, then rerun once with the correct runner;
- do not run multiple Playwright commands in parallel, including through
  `multi_tool_use.parallel`. The Playwright config starts `pnpm dev` on port
  3000 and reuses any server already there, so concurrent runs can trip the
  Next build lock (`Another next build process is already running`) or prove
  the wrong stale server. Parallelize file reads, but serialize Playwright
  proofs;
- some commands exit 0 without running what they name. Read the output for
  these markers and rerun in the form that runs:
  - `None of the selected packages has a "<script>" script` from
    `pnpm --filter <package> <script>`: run the script from the package
    directory, where a missing script exits non-zero;
  - turbo's `Cached: N cached, M total`: set `TURBO_FORCE=true`;
  - a benchmark probe that prints no frozen lines and only a receipt: pass the
    frozen lines, as Benchmark's pre-acceptance step 4 requires;
- an independent integration runner that resolves workspace `dist` must build
  its actual artifact dependencies before execution. This requirement belongs
  to that runner, not every source-first package or browser check;
- a reported type regression in a published release starts from the tarballs: `npm pack` the bad and the last good version, compare their declaration entrypoints, and rebuild locally; when the rebuild is right and the tarball wrong, fix the release artifact path, not source;
- use `bun test ./path` only with repo-relative Bun test paths from
  `Plate repo root`, or with package-local paths after recording the package cwd.
  A path without `./` is a name filter that makes Bun scan the whole
  repository, ignored `.tmp` and `docs/plans/artifacts` included, which shows up
  as EMFILE, ENFILE or a ModuleNotFound under an ignored directory;
- if root `bun test ./packages/.../<file>.spec.ts` says the path filter did not
  match, inspect the actual file and its owning runner before retrying. The
  package entrypoint scripts select their current test files and preload;
  `tooling/config/test-suites.mjs` owns root aggregate discovery;
- do not claim a root package test directory proved anything until its output
  reports the expected file and pass counts. Compare discovery with the package
  owner's files; root aggregate commands and direct `bun test` have different
  selection rules;
- do not run `generic-*-contract.ts` or other type-contract files with
  top-level compile examples through `bun test`; they may contain deliberate
  runtime-invalid `@ts-expect-error` calls. Use the owning package `typecheck`
  script or the relevant `tsc --project ...` command instead;
- do not broad-scan every example/package test name into chat with
  `rg "test\\(" ...` when the lane is already scoped; use a curated file list,
  targeted `rg` filters, or write discovery output to an artifact;
- when Playwright imports a package through public exports such as
  `@platejs/playwright`, verify whether the export resolves built `dist`;
  after source changes to that package, run its focused build
  (`pnpm --filter @platejs/playwright build`) before claiming the rerun tested
  the patch;
- after package, runtime, example, or generated-site source edits, do not use
  a dev server already on port 3000 for final proof until you have restarted it
  or proven it rebuilt the current tree, because the Playwright config reuses
  it. Record the restart time as proof cost instead of trusting stale green or
  stale red results;
- for ad hoc route screenshot or DOM-metric proof, do not run raw `node` from
  outside the checkout and assume it can import `@playwright/test`; keep the
  script in the run directory so it resolves the root dependency;
- do not casually swap in raw `playwright`, or a custom wrapper unless the
  package script and argument forwarding are verified in the plan;
## Source-first package checks

A type probe compiles through `node tooling/scripts/type-probe.mjs [--tree <checkout or worktree>] [--package <name>] [--tsc <compiler>] <probe.ts>...`. It extends that package's tsconfig in the tree, prints each probe's errors and exits 1 when a probe has one. It exits 2 when it has no result to give: a bad argument, a missing file, or a compiler that did not run or did not read every probe. A runner that compiles many cases, such as a call-shape matrix or a mutation sweep, calls it instead of spawning `tsc` itself, so a compiler that never ran cannot pass as a probe with no errors. Packages here resolve through the `node_modules` links above the probe to each package's built `dist` declarations, so build the package first. A proof worktree links this checkout's `node_modules`, so a type probe in it reads this checkout's declarations. A base type control needs a worktree with its own install and build.

A throwaway probe that claims source behavior prints which package files it loaded, so a run that loaded `dist` cannot pass as source proof. Run it from the repository root as `bun test <abs path>`, so the preloads the root `bunfig.toml` lists under `[test]` apply. Bun applies them only to `bun test`, so a plain `bun run` resolves dependency packages from `dist`, and `tooling/config/bunTestSetup.ts` registers `afterEach` hooks that only `bun test` provides. Import by absolute path as `AGENTS.md` says, and print the `require.cache` keys under `/packages/` that the import added, dependency packages included. A scratch file outside the repository cannot resolve bare package names, so it imports by path. A probe with JSX lives in the run directory, because Bun resolves the JSX runtime it injects from the probe's own folder, which no import path can redirect. A probe that needs a DOM and runs without a preload that registers one, such as `tooling/config/bunTestSetup.ts`, calls `GlobalRegistrator.register()` from `@happy-dom/global-registrator` first and then loads React DOM and the code under test with `await import(...)`. Static imports run before any statement, so a probe that loads the editor before the DOM exists runs its layout effects as passive effects and proves nothing about them.

Default to source-first typecheck. Do not build packages just to run types.
Inspect the affected package/app `paths` and source-entry graph if stale
declarations or unresolved exports suggest built-output resolution. Repair
source-entry debt when appropriate; build when the actual claim concerns
release artifacts or a package intentionally has no source-first path.

Install dependencies when required by changed inputs or lockfile state. In a
tree other sessions are editing, install with `pnpm install --ignore-scripts`,
because the root `prepare` script regenerates agent outputs; add
`--frozen-lockfile` to check the lockfile as CI does, run `pnpm rebuild <pkg>`
when a dependency needs its own scripts, and run `pnpm run prepare` only on
purpose. A dependency or toolchain upgrade searches the whole repository for
every load form of the package, `import`, `require` and a `createRequire(...)`
call, and closes only on `pnpm check`. Then
use `pnpm turbo typecheck --filter=./packages/<modified-package>`. Run affected
lint and fix actual diagnostics before final verification. Useful forms:

```bash
pnpm turbo typecheck --filter=./packages/core --filter=./packages/plate
pnpm turbo typecheck --filter='[HEAD^1]'
pnpm turbo typecheck --filter='...[origin/main]'
pnpm --filter platejs typecheck
pnpm --filter platejs lint:fix
```

A typecheck that reports TS6305, a referenced project's output not built, checked nothing: it is neither a clean result nor evidence that its other errors are unrelated. Build the references instead.

Use root `pnpm lint:fix` when the affected lint scope needs that command.
`pnpm typecheck` builds the packages, then typechecks them; `pnpm build` builds
all packages only when needed. `pnpm test` is the fast aggregate test lane,
and `pnpm check` is the handoff check, not the default iteration command.

## Base worktree for a HEAD comparison

Run `node tooling/scripts/proof-worktree.mjs <path> <sha>`. It adds a detached
worktree at the base, links this checkout's root and workspace `node_modules`
and copies each package's untracked `.env` files, as `AGENTS.md`'s Git rule
says. It exits 1 when the new worktree's status shows anything besides those
links. Remove it with `git worktree remove --force <path>` when the run ends.
A package's own `node_modules` links its workspace siblings by relative path.
Through that link, a sibling import outside the TypeScript path aliases
resolves to this checkout's source, so a base proof that must run a sibling at
the base installs in the worktree instead. When the base lockfile differs or a
package's links are missing, install with scripts instead (`pnpm rebuild` first when an earlier install skipped them). A worktree that serves the app with `next dev` needs a real install, `pnpm install --frozen-lockfile --offline --ignore-scripts`, because Turbopack refuses a `node_modules` symlink that points outside the worktree. A step that fails in about a second, such as
`command not found`, is a broken install, not a result. Never copy candidate
files into the base worktree; replay them in a second worktree, and require the
helper's clean status, which ignores only its own links, before labeling any
run as base. A worktree in which a patched build or typecheck ran is never base, even after
`git apply -R`, because ignored build output such as `dist` and `.source`
survives; every base control runs in a fresh worktree.

The helper has four modes for these cases:

- `--with <file>` copies a candidate file from this checkout into the new
  worktree, and the helper prints `candidate:` instead of `base:`, so a new test
  runs against the base source without labeling that run base. Before creating
  anything, the helper refuses a `--with` that names no file inside this
  checkout or reaches it through a symlink.
- `--install` runs `pnpm install --offline --frozen-lockfile --ignore-scripts`
  instead of linking `node_modules`. A www server needs it, because Turbopack
  refuses `node_modules` linked from outside the worktree root. Then run
  `PLATE_WWW_DYNAMIC_DOCS=1 pnpm build:source:dev` in `apps/www` before
  `next dev`.
- `--dir <run directory> --name <name> -- <command>` runs the command in the
  worktree through `proof.mjs`, removes the worktree and exits with the
  command's status, or 1 when the command passed and the removal failed. It
  exits 2 when `proof.mjs` cannot load or refuses its arguments. Before
  creating anything, the helper refuses a `--dir` and `--name` whose log
  directory's real location lies inside the worktree. That comparison is
  case-sensitive. A script that starts a server for the command
  starts it with `set -m` and kills its process group on exit.
- `--expect-fail <text>`, repeatable beside a command, refuses a run in which
  the command passes or its output lacks a text. Each text counts only on a
  failing line in the last 16 MiB of the command's output, with terminal colors
  and links stripped, never in the log's command line. A failing line starts,
  after any indentation, with bun's `(fail)`, node:test's `✖` or `not ok`,
  Playwright's `✘` or `N) `, a `×` such as Biome prints before an error's
  message, or a `tsc --pretty false` line
  `<file>(<line>,<col>): error TS<code>:`. An ESLint error line never counts.
  Pass each case's failure line, such as bun's `(fail) <describe> > <title>`.
  For a Biome failure, pass the start of its message. A matcher
  line such as bun's `error: expect(received).toEqual(expected)` is not a
  failing line. A failure line also matches a longer title that starts the
  same way, and a match does not show which case printed it, so read the log
  to tie the failure to its defect. A
  case designed to pass at the base, such as a must-pass control or a case
  whose defect only a mutation shows, goes to `mutate.mjs` instead. The
  helper exits 0 when the command fails with every text, and 1 when the command
  passes, a text is missing or the worktree setup refuses. It exits 2 when
  `proof.mjs` cannot load or refuses its arguments, or the command cannot
  start, so read stderr.

Every path argument resolves from the current directory. Each write the helper
makes into the worktree, a `node_modules` link, a `.env` copy or a `--with`
copy, checks the directories on its path. Each copy replaces a symlink at its
own path, and the link replaces only a dangling one. It exits 1 and leaves the
worktree in place when a directory on that path resolves elsewhere, through a
symlink the base tracks or the helper's own `node_modules` link. The helper
does not guard git metadata: a `--with` under `.git`, in any letter case, can
point the worktree's git commands at another checkout.

## Local install recovery

When a local-only typecheck/build/dev/test failure does not match the change and
shows missing-module/package-resolution corruption, corrupted `.bun` files,
mixed `.bun`/`.pnpm` React paths, package-local `node_modules/react*`,
`Invalid hook call` or null `resolveDispatcher()`, run `pnpm run reinstall` once
and rerun the exact failing command before changing product code.

Reinstall removes root/workspace/app `node_modules`, `.turbo`, `apps/www/.next`
and `tsconfig.tsbuildinfo`, then runs
`pnpm install`. A changed/disappeared failure supports install corruption; an
unchanged failure returns to ordinary diagnosis.
Do not use reinstall to avoid fixing source errors or keep retrying unchanged
failures.
