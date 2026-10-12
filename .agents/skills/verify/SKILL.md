---
description: Verify Plate packages, browser editor behavior, CLI artifacts, collaboration and tests at their actual owners. Load before selecting, changing or waiving proof, writing tests or claiming a fix works.
argument-hint: '[package | route | cli | collaboration | testing audit] <target>'
name: verify
metadata:
  skiller:
    source: .agents/rules/verify.mdc
---

# Verify

The project driver for pstack. State the setup, input, expected result and
required follow-up before choosing proof. Reporter corrections extend that
contract. A smaller green case cannot discard an unresolved requirement.

Read the relevant package scripts and `tooling/config/test-suites.mjs` before
running commands. Use `pnpm test` for the fast aggregate, focused
`bun test ./<actual-spec>` for a resolved Bun entrypoint, and the package's
typecheck for its current graph. Root `pnpm typecheck` builds packages first.
Check that output names the intended files and actually ran them. "No test
files found", an unmatched package filter and a cached result prove no fresh
execution.

For package behavior, inspect exports and real consumers. Separate source
checks from packed declarations and Node import proof. Rebuild the affected
dist boundary when the selected consumer resolves it. For a CLI, build the
actual package, run its `--help` and requested command in a disposable
consumer, inspect emitted output and confirm the input was preserved.

For browser behavior, read the actual demo or reporter route under
`apps/www/src/app` and its registry owner. Start the www app on an owned free
port through its existing script or `pnpm --filter www exec next dev --port
<port>` when the script would generate CI-owned output. Bind process cwd,
source/build identity and URL. A listening port or HTTP 200 is not proof that
the editor renders correctly.

Drive through available browser or native app controls after reading their
documentation. Prefer an existing managed Playwright spec and its runner when
one covers the case. Do not invent a second browser controller. A standalone
`/blocks/<id>-demo` route is useful unless the reporter named another route.
Preserve the named browser/profile, auth state, fixture and interaction.

Inspect model state, rendered DOM, focus owner, native selection and follow-up
typing where the claim needs them. Capture and open screenshots for paint,
visibility, layout and animation claims. Synthetic events and mobile viewport
emulation retain that limited scope. Raw device or OS input needs that device.
Native focus, selection, drag, paint and React lifecycle risks require five
warm executions without retries; one failure keeps the case open.

Capture runtime errors and fail on unexplained uncaught exceptions even when
the test runner reports success. Collaboration claims need two clients,
provider, awareness, disconnect/reconnect and history proof. A fallback stream
or connection label does not prove the external service worked. When a live
Potion comparison is needed, read [Potion Yjs Browser Test](references/potion-yjs.md).
Use it only when the available tool proves per-page network isolation.

Before accepting implementation, inspect the final owner and materially
different consumers. An effect, observer, timer, cache or save/restore protocol
needs a real requirement and correct lifetime. Passing tests do not accept
wrong ownership. Run final proof after writing and review repairs.

Keep logs, fingerprints, routes, observed results and screenshots under the
run's ignored `docs/plans/artifacts/` directory. Separate local candidate proof
from final pushed-ref claims. Attribute a failure to base only after the same
command fails the same way in a detached base worktree. Link dependencies and
copy needed env files there; never swap tracked source in the live checkout.

For tests, read `.agents/pstack/rules/tests.md`. Use adjacent specs, public
contracts, literal expected outcomes and compile-only type tests. Restore
spies, spread real modules when mocking one export, and keep package tests
independent of app registry imports. `testing audit` inventories uncovered
contracts through [Testing audit](references/testing-audit.md);
`test-audit` prunes existing low-value tests.

For recognizable install corruption, run `pnpm run reinstall` once and retry
the exact command. Stop only processes this run started. Preserve evidence
before cleaning disposable consumers or fixtures.
