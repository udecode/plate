# Code Block Demo Debug Plan

## Goal

Find the real cause of the `/blocks/code-block-demo` regression where typing triple backticks leaves the first two backticks in place in the live demo, even though package and app integration tests pass.

## Phases

- [completed] Search prior learnings on hydration, registry drift, and code-block behavior.
- [completed] Inspect generated block route and registry wiring used by `code-block-demo`.
- [completed] Reproduce on the live dev route and compare route state against expected editor/plugin state.
- [completed] Apply the smallest real fix and add regression coverage if the bug is in repo code.
- [completed] Rebuild and verify with tests, build/typecheck/lint, and live browser proof.
- [completed] Record reusable learning if this exposed non-obvious repo behavior.

## Findings

- Existing tests already prove the code-block input rule works in package and app-owned integration paths.
- The live fence regression was not a missing input rule after a clean restart. The rule wiring is present on `code-block-demo`, and typing triple backticks in a reset paragraph still creates a `code_block`.
- Repo learnings already warn about two likely classes of failure here:
  - static demo hydration drift from nondeterministic values
  - registry/generated-output drift where local source changes are not what the route is actually serving
- The real route bug was browser-only Python highlighting. Server render tokenized the Python sample, the browser threw during Highlight.js parsing and fell back to plaintext, and React then hit a hydration mismatch.
- Mounted-only demo rendering and lowlight preset changes were noise.
- The final fix was package-owned: `@platejs/code-block` now patches the passed
  `lowlight` instance with a browser-safe Python grammar before highlighting,
  so kits stay unchanged and Python still highlights.

## Progress

- Recovered prior context from the last session and active edits.
- Loaded `learnings-researcher`, `debug`, `testing`, `tdd`, `dev-browser`, and `planning-with-files`.
- Searched `docs/solutions/` for hydration, registry, and code-block failures before touching more code.
- Rebuilt registry output, wiped `apps/www/.next`, and restarted `apps/www` to get one clean repro surface.
- Reverted speculative demo-only changes after proving they were not the fix.
- Moved the Python grammar workaround into `packages/code-block` and reverted
  the app-level lowlight helper so kits remain stock.
- Verified the route in `dev-browser`: Python highlight succeeds, no hydration
  error, and triple backticks still promote to a code block.
- Added a reusable learning in `docs/solutions/logic-errors/2026-04-17-code-block-browser-highlight-must-match-server-output.md`.

## Errors

- None in this recovery step.
