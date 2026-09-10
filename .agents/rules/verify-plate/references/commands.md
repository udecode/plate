## Command Pitfalls

Automation should use the repo's known focused commands, not improvised command
shapes.

In `Plate repo root`, prefer these focused forms:

```bash
pnpm check:plite:dev
pnpm --filter plite test:plite-browser:chromium <file-or--grep>
pnpm check:plite
pnpm check:plite:browser-matrix
PLAYWRIGHT_BASE_URL=http://localhost:3102 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/<suite>.test.ts -g "<pattern>"
pnpm --filter platejs test -- <file-or-pattern>
bun test ./packages/platejs/<file>.test.ts --test-name-pattern "<pattern>"
```

Rules:

- `pnpm check:plite:dev` is the normal affected development lane.
- Add `--dry-run` to inspect its exact proof selection. Local changes and
  `PLITE_CHECK_BASE=<ref>` use the same planner as Plite CI. Planner or runner
  test edits run their Node contracts; shared configuration keeps full proof.
  Package tasks reuse the existing entrypoint dependency cache.
- `pnpm check:plite` is the strict handoff lane. Transplant parity, docs
  audits, benchmark target audits, www typecheck, and the browser matrix are
  not part of the affected development loop.
- `pnpm --filter plite test:plite-browser:chromium <file-or--grep>` is
  the focused changed-row browser lane. `apps/plite` imports its Plite examples
  from `apps/www`; never maintain a second example source tree.
- WebKit, mobile viewport, and the full Playwright app matrix are closure
  gates through `pnpm check:plite:browser-matrix`.
- run commands from the Plate repo root unless a package-local script requires
  the package cwd;
- keep docs, skill, runtime, package, benchmark, and Playwright scans rooted in
  the Plate repo. Do not search the donor checkout for current runtime facts;
- before running a focused test, resolve the actual runnable entrypoint from
  the owning surface, not memory: use targeted searches such as
  `rg --files packages/<pkg>/test apps/plite/tests tooling benchmarks | rg
  "<basename>|<suite>"`, or run the same search from the package cwd for
  package-local Vitest. Do this first, not after one failed command. Many owner
  files are imported by a `*.test.*` wrapper, while some root Bun contract files
  intentionally do not use `.test.*`;
- match the runner to the resolved entrypoint: Plite browser specs under
  `apps/plite/tests/plite-browser/**` use `pnpm --filter plite
  test:plite-browser:chromium`; root Bun contracts under
  `packages/*/test/*.ts` use `bun test ./...`; package-local Vitest wrappers
  use the package cwd and package script;
- if Bun or Vitest says "No test files found" or "filters did not match", stop
  guessing command variants. Locate the exact file or wrapper with `rg --files`
  / `rg -n`, then rerun once with the correct runner;
- run Plite package checks through the entrypoint-aware `plitejs` scripts, such
  as `pnpm --filter plitejs typecheck`; do not target deleted package roots;
- use `pnpm --filter plite test:plite-browser:chromium ...` for focused Plite
  browser specs; do not send Playwright specs through `bun test` or the
  `apps/www` docs app;
- do not run multiple managed Playwright commands in parallel,
  including through `multi_tool_use.parallel`. The managed route builds and
  serves the Next example app, and concurrent runs can trip the Next build lock
  (`Another next build process is already running`) or prove the wrong stale
  server. Parallelize file reads and package-level non-server tests, but
  serialize managed Playwright proofs unless one checkpoint explicitly owns a
  prebuilt server plus `PLAYWRIGHT_BASE_URL`;
- the managed Plite runner validates its app and browser build manifests.
  An explicit `PLAYWRIGHT_BASE_URL` delegates serving to that instance; bind
  its source/build identity before trusting it. If it serves stale content,
  stop only an instance owned by this run or choose a fresh port, then re-drive;
- every integration entrypoint that imports public package exports during
  Playwright, including async/local wrappers, must route through its owned
  managed browser runner; raw `playwright test` is a stale-dist footgun
  when `@platejs/test/playwright` changes;
- if an integration wrapper captures `--reporter=json` from Playwright stdout,
  do not run the full managed browser-proof command as that child command. Run
  the required package build as a separate preflight, then run the repo-owned
  Playwright config with JSON stdout so `report.json` stays parseable;
- the Plite browser runner owns preparation through
  `apps/plite/scripts/build-browser-if-stale.mjs` for `@platejs/test` and
  `build-app-if-stale.mjs` for the source-based proof app. Let their input and
  output manifests validate reuse. Do not prepend unconditional package builds
  or set force flags for ordinary proof. An explicit external server still
  requires checking its serving source identity;
- an independent integration runner that resolves workspace `dist` must build
  its actual artifact dependencies before execution. This requirement belongs
  to that runner, not every source-first package or browser check;
- when running packed/external-consumer package smoke, start from the live
  export/type contracts such as
  `packages/platejs/test/public-package-import-smoke.slow.ts` and
  `packages/plitejs/test/public-package-types-smoke.ts`. Do not invent public
  function call examples from memory. Prefer type-importing exported names and
  doing only tiny value references unless the package docs/source were just
  inspected for that exact signature;
- `tooling/entrypoints/entrypoint-dag.mjs` owns public JS imports, runtime
  classes and descriptor-call recipes. `entrypoint-turbo.mjs` derives package
  partitions and their test paths. Use
  `pnpm --filter <package> typecheck:partition:<partition>` and
  `test:partition:<partition>` for an existing nonempty test partition.
  For `@platejs/test`, select `test:react`, `test:dom`, or a named partition;
  focused arguments through its aggregate `test` do not select those runners;
- `pnpm plite:release:packages` builds and checks packed artifacts through
  `tooling/scripts/check-plite-release-artifacts.mjs`. The managed
  `tests/plite-browser/runtime-entrypoints.test.ts` drives `/runtime-entrypoints`
  for client imports. These runners derive membership from the DAG; type-only
  exports and CSS assets retain their separate proof scope;
- split external consumer type smoke by claim width. App-facing Slate packages
  should compile with strict Slate declaration checking. `slate-browser`
  Playwright subpaths may need a separate config with third-party lib checking
  skipped so Playwright/Node ambient declarations do not hide the Slate package
  result. Record the split as proof scope, not as a product exemption;
- use `bun test ./path` only with repo-relative Bun test paths from
  `Plate repo root`, or with package-local paths after recording the package cwd;
- if root `bun test ./packages/.../<file>.test.ts` says the path filter did not
  match, inspect the actual file and its owning runner before retrying. The
  package entrypoint scripts select their current test files and preload;
  `tooling/config/test-suites.mjs` owns root aggregate discovery;
- do not claim a root package test directory proved anything until its output
  reports the expected file and pass counts. Compare discovery with the package
  owner's files; root aggregate commands and direct `bun test` have different
  selection rules. Use package scripts such as
  `pnpm --filter @platejs/test test:proof` for their named contracts;
- for package Vitest contracts, target the actual `*.test.*` entrypoint. Some
  contract bodies live in imported siblings such as `surface-contract.tsx`;
  running the sibling path directly fails the Vitest include filter and proves
  only a command-shape miss. Before running Vitest against any target path that
  does not already match `*.test.*`, locate the wrapper with
  `rg -n "<imported-file-basename>" <package>/test --glob "*.test.*"`;
- `packages/plitejs/test/react` contracts are Vitest-owned. Run them from
  `packages/plitejs` as
  `bun run test:react test/react/<file>.test.tsx`; do not run them through root
  `bun test ./packages/plitejs/test/react/...`;
- do not run `generic-*-contract.ts` or other type-contract files with
  top-level compile examples through `bun test`; they may contain deliberate
  runtime-invalid `@ts-expect-error` calls. Use the owning package `typecheck`
  script or the relevant `tsc --project ...` command instead;
- do not broad-scan every example/package test name into chat with
  `rg "test\\(" ...` when the lane is already scoped; use a curated file list,
  targeted `rg` filters, or write discovery output to an artifact;
- when durable Slate v2 docs contain absolute checkout paths, verify the path
  exists before reusing the command. Current Slate v2 runtime/package commands
  belong to the Plate repo root; stale donor-checkout command snippets should
  be repaired unless the doc explicitly names a historical draft/source
  checkout such as `slate-v2-draft`;
- when Playwright imports a package through public exports such as
  `@platejs/test/playwright`, verify whether the export resolves built `dist`;
  after source changes to those packages, run the focused package build (for
  example `pnpm --filter @platejs/test build`) before claiming the rerun tested
  the patch, and patch any wrapper script that bypasses that build path;
- after package, runtime, example, or generated-site source edits, do not use an
  already-running `PLAYWRIGHT_BASE_URL` dev server for final proof until you
  have restarted it or proven it rebuilt the current tree. If freshness is
  uncertain, omit `PLAYWRIGHT_BASE_URL` once and let Playwright run its managed
  build/server path, then record the extra time as proof cost instead of trusting
  stale green or stale red results;
- for ad hoc route screenshot or DOM-metric proof outside a managed Playwright
  spec, do not run raw `node` and assume it can import `playwright`. Prefer the
  repo-managed `pnpm --filter plite test:plite-browser:chromium` path for
  Slate proof when the proof should be durable;
- do not casually swap in raw `playwright`, or a custom wrapper unless the
  package script and argument forwarding are verified in the plan;
- if a command fails because of command shape, classify it as a workflow
  slowdown, repair the owning skill/script when reusable, and rerun the focused
  proof with the corrected command.
