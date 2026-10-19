# Slash AI completion in a suggested paragraph

Status: Complete

## Scope and acceptance

Source: the user's September 16 recordings at 12:57:53 and 13:32:03.
On the homepage in suggesting mode, Enter after `/AI` must remove the slash
input and open AI. The caret must remain in the new empty paragraph; Escape
must return typing to that paragraph. Mouse activation is the adjacent case.
Local repair only; no publication or unrelated checkout cleanup.

- [x] Reproduce Enter failing in a newly suggested paragraph.
- [x] Fix the owning combobox API binding and preserve the original caret fix.
- [x] Prove package and mounted React behavior, including view read-only state.
- [x] Prove Enter/click, visible inactive caret geometry, Escape and next typing in Chromium on the homepage.
- [x] Finish affected lint and registry generation.

## Diagnosis and evidence

The API factory captured the source editor from `.extend`, while the component
read through the active view. The slash node existed only in the proposed
document, so the captured editor rejected completion as stale. Taking `editor`
from the API factory context binds completion, cancellation and history actions
to the calling view. No UI focus workaround is required.

The mounted `slash.spec.tsx` reproduction failed before this change and passed
after it. The focused combobox/inline-combobox/slash tests report 27 passing
tests. The combobox partition typecheck and affected source lint pass.

Homepage browser Enter and click cases pass through prompt focus, preserved
empty-paragraph selection, Escape, native/model selection agreement and next
typing. The explicit dev server at localhost:3000 imports source via the app's
TypeScript aliases; HMR reported recompilation after the owning fix. Final
browser verification checks the inactive caret's paragraph geometry and asserts
the toolbar is in Suggestion mode. Both Enter and click passed in the final run
(2 tests, 4.5 seconds), with no captured runtime errors.

An earlier test attempt stopped before activation because a broad combobox
locator included code-block controls. Scoping to the inline input repaired the
test target; that failed attempt proves no product behavior.

## Closure

`pnpm --filter www build:registry` completed and the generated slash payload
contains the AI focus behavior. Affected formatting/lint and `git diff --check`
pass. The package patch changeset records active-view completion. Focused
diff review is complete; structured Autoreview was not run on `next` under
branch policy. No outstanding local repair work. Browser scope is Chromium only;
this is not a full CI or release certification.
