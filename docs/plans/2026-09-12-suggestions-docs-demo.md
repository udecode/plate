# Suggestions docs demo

Status: Complete

The user wants the suggestion examples directly on the Suggestions docs page.
Keep its canonical `/docs/suggestion` route, existing API teaching, and a focused
Plate example. Do not replace it with the contributor sandbox.

- [x] Register a focused demo with separate insertion and deletion proposals.
- [x] Embed it above setup on the English and Chinese Suggestions pages.
- [x] Supply the copied dependencies, Code tab, and registry changelog.
- [x] Verify accept, reject, undo, redo, typing, and accepted-view switching in Chrome.
- [x] Repair the observed stale decoration ranges after initial view switching.
- [x] Verify final exact docs routes, source checks, generated output, and preserve evidence.

The first source editor policy did not initialize the mounted view. The demo
now initializes that policy from `useEditor()` inside its provider. Chrome
confirms markup mode and functioning review controls. A fresh-load screenshot
then exposed stale paint: the insertion initially lacked green highlighting,
and the deletion's accepted-coordinate decoration covered unchanged trailing
text. Clicking a review trigger refreshed it. Investigate the decoration view
invalidation owner; no forced dummy edit or fake store update.

Verification host: a fresh source-alias Next server from this checkout on port
3297, using `.next-suggestion-proof`. The user's port-3000 server remains owned
by its existing session. Logs are initially `/tmp/suggestions-docs-*.log` and
will be preserved under the existing authored-changes artifact directory.

The decoration manager now refreshes on authored view changes and compares
projected children when remounting. A regression failed before the repair and
passes after it; 109 tests across the five decoration/authored React suites
pass. React source and test typechecks pass. The Code tab also exposed missing
keys for folders, whose file paths are absent; the viewer now keys each root
entry by its unique sibling name. Chrome verifies that warning is gone.

Final proof: fresh source server, English and Chinese routes, correct insertion
and deletion colors on initial load, Accept, Undo, Redo, Reject, typed proposal,
Editing/Suggestion round trip, and the populated Code tab. The full www
typecheck (including MDX and docs/registry parity), registry generation,
16 registry/suggestion tests, targeted lint, and `git diff --check` pass.

Evidence: [screenshots, logs, and source fingerprints](artifacts/native-authored-changes/execution/suggestions-docs).
Screenshots 01 and 02 predate only the unrelated Code-tab key repair;
screenshots 03 and 04 use the final restarted server. No production deployment
or package release was requested.
