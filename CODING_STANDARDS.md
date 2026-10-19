# Coding standards

Read this file in full before you write, review or deslop any source, test or tooling file. `AGENTS.md` holds the workflow; this file holds the code rules and what enforces each one.

## TypeScript and inference

- Type inference is mandatory for Plate/Plite callback APIs. Do not add explicit callback parameter annotations like `(tx: EditorUpdateTransaction)` to silence TypeScript when the API should infer them; fix the owning generic/API type instead. `plate/no-annotated-inferred-callback` rejects them on editor reads, updates, transactions and selector hooks; other callback APIs stay a judgment call. Explicit annotations are only acceptable at exported public signatures or true external boundary adapters. pstack's `typescript-best-practices` does not override this law. Neither it nor `pstack:principle-type-system-discipline` decides duration types here: a plain number admits a negative duration, so validate a duration at its boundary and brand it, and a typed escape hatch stays only with a specific reason and a deletion gate.
- These TypeScript bans also override `pstack:typescript-best-practices`. Plate and Plite source never repairs inference with `satisfies` on a builder result, a local helper or `Pick` type alias, or `Parameters<typeof fn>` plumbing; fix the owning API type so the call site stays inferred. A local whose initializer infers its type takes no annotation; only empty arrays, deliberate narrowing or widening, exported signatures and external boundary callbacks are annotated. Production source never uses `any`; a deliberate local test escape is the only exception. No `unknown` cast or structural guard hides a missing typed Plite or Plate API; repair the owning API type instead.
- Prefer inline when used once; extract constants only when reused.

## Components

- Inline local component prop types at the signature. Keep named prop types for real cross-file or published contracts; `docs/vision/plate.md` owns the convention and `plate-ui` applies it. Apply it during implementation and review, without a dedicated lint gate.

## Comments and JSDoc

- JSDoc must be first-class for agents. The `no-comments` pass keeps public JSDoc and the intentional `@ts-expect-error` assertions that prove invalid public calls are rejected. It also keeps a non-obvious reason in our own code until an authorized, verified structural change makes it redundant, and a constraint comment whose type, test or lint encoding is not authorized stays in place with the missing encoding reported. A comment whose claim is still ambiguous or unverified after the check stays in place as an open finding; the `no-comments` and comment-sicko rule to delete on doubt does not apply.

## Tests

- Before writing or changing a test, invoke the `verify` skill and read the shared Tests rule in `.agents/pstack/rules/tests.md` and `verify`'s [testing reference](.agents/rules/verify/references/testing.md); it holds Plate's test shape, runners, type-test and assertion rules. Beyond the pstack block's Tests rule, do not write TDD cases for dead code/legacy removal assertions (for example: "should not contain old API X anymore"). Remove the dead path directly and keep tests focused on current behavior. The block's `.skip` ban does not cover a runtime capability gate, a skip that runs only when the browser, platform or engine lacks what the test needs; an unconditional `.skip` or `.only` stays banned.
- Write a throwaway probe as a scratch script run from the package directory with its `[test]` preloads passed as `--preload`, as `verify`'s command recipes say, and importing by absolute path, never as a `*.spec.*` file in the repository, where the Stop hook stages it. A probe that needs a DOM and runs without a preload that registers one registers it before it loads React or the code under test, as `verify`'s command recipes describe.
- A test that proves a rule of `docs/editor-behavior/markdown-editing-spec.md` ends its title with the rule's tag, such as `[EDIT-TABLE-TAB-001]`, and `pnpm kb gaps` lists the locked rules that no running test carries. Add a tag only after reading the test's fixture, action and assertions against the rule's scenario, because the tag turns a claim into proof that `pnpm kb gaps` accepts. `pnpm kb <rule ID or issue ref>` joins a rule or issue to the tests tagged with it, and `pnpm kb check` is the `knowledge` step of `pnpm check`.

## Generated output

- Templates: `templates/**` is CI-controlled output. Never manually edit or commit template source, manifests, or lockfiles. Fix the source registry, package, or workflow inputs and let CI regenerate templates. If local verification rewrites template files, restore them before handoff.
- Barrels: If you change package exports, move public files, add/remove files under exported folders, or CI says `pnpm brl` produced changes, run `pnpm brl` before final verification/commit and include the generated barrel updates.
- On `next`, run `pnpm --filter www build:registry` when registry source changes or current generated registry output is required for verification, and include its generated registry output. Do not edit generated registry files by hand. Other branches keep registry generation in CI unless the user explicitly authorizes it.

## Lint and format

- Ultracite owns repository formatting and linting through Oxfmt and Oxlint. Run `pnpm lint:fix` at the root or the owning package's `lint:fix` script. When other sessions have work in the tree, run `pnpm lint:task <files…>` on the task's files instead. It runs `ultracite fix`, `oxfmt`, `ultracite check` and `oxlint --type-aware` on them, says how many of the paths lint ignores, such as `docs/**`, `AGENTS.md`, `.agents/**` and `.claude/**`, and exits 2 when it ignores them all. With `--allow-ignored`, which `land.mjs` passes, it exits 0 instead. A lint-clean claim covers only the files it linted.
- Never run Prettier directly on source files covered by Ultracite; the workspace exposes Prettier only as a transitive dependency and has no active Prettier configuration, so its defaults violate repository style.

## Third-party material

- Commit only material permitted under applicable EU copyright law. Copying or adapting third-party code, tests, fixtures or documentation requires a verified license, permission or other valid legal basis, with all applicable conditions satisfied, including notices and source-disclosure obligations. Lawful references, independent implementations and compliant reuse are allowed; omit material whose legal basis remains unresolved.

## Gates

Gates are not weakened to get green. Before changing a rule or gate that blocks code, decide whether the rule is stale or the code is defective. Justify the better rule and repair its source before aligning consumers; never silently violate a gate or weaken it just to clear a failure, and never weaken a completion or proof gate because a past run found it annoying. When an expectation conflicts with evidence safety, record the conflict and take the safer option.

`pnpm check` runs `tooling/scripts/check.mjs`, the step list CI runs. `pnpm check <step>` runs one step, `pnpm check --affected` runs the steps that the changes since `origin/next` reach, and `pnpm generate` runs every step's writer. Every Bun test run gives fast-check the seed `FAST_CHECK_SEED` names, a fixed default when it is unset, or a fresh one when it says `random`. A rule marked baseline fails on any finding its baseline does not list. `tooling/oxlint/plate-baseline.json` lists the `plate/*` lint findings and `tooling/scripts/plate-schema-adoption-baseline.json` the Plate schema adoption findings, each by rule, file and the trimmed text of the line it flags, so trading a fixed finding for a new one in the same file fails unless both lines read the same. Both run through `tooling/scripts/finding-baseline.mjs`. `pnpm lint:baseline` and `node tooling/scripts/check-plate-schema-adoption.mjs` only drop entries the tree no longer holds. A baseline that lists a finding its base commit's copy does not fails, so a widened rule's new finds are fixed or excepted. The base commit is `HEAD` unless `PLATE_BASELINE_BASE` names another. A run that adds or re-keys a baseline sets it to the run's intake base until the change ships, because an owner's mid-run commit is not a reviewed base.

An exception to a `plate/*` rule goes on the line as `// oxlint-disable-next-line plate/<rule> -- <reason>; expires <YYYY-MM-DD>; approved <name>`. It lasts at most 90 days, and a human approves it before it lands; the rule checks only the format and the dates. A run that needs an unapproved exception leaves it as open work for its owner and keeps going.

[`docs/development/enforcement.md`](docs/development/enforcement.md) pairs each code rule with what enforces it. Read it in full before you add, change or cite a check, a baseline or a rule's enforcer. Read it too before you write code in an area where one of its rows names an owner, such as the authored review tree's walks, Plite placement, a selection's root, a type change's kept properties, DOM parsing or a paste's target root.
