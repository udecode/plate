---
review_scopes: [html, exports]
review_basis: []
work_kind: implementation
review_commit: 332c1a161dcd267a70b0ff58e002a7510ee38674
review_inputs: [apps/www/src/registry/components/editor/export-toolbar-button.tsx, packages/platejs/src/ai/react/CopilotPlugin.tsx]
---

# Export failure message and Copilot ghost text

Status: done: in pull request #5157 into next; folded into the html subject
Playbook: bug-fix

The owner asked to start with item A of the export finishing list. A held three small fixes. The export menu showed nothing when an export threw. Copilot's ghost text made every export of an editor with Copilot warn, and strict Word refused the file. The third item would have turned a drawing that throws during Word export into a warning. This iteration lands the first two and drops the third, because the static guide already says such a drawing rejects the export.

## Brief

### What will change?

When an HTML or Word export fails, the export menu now shows a red message. Exports from an editor with Copilot no longer warn about its grey suggestion text, and strict Word export no longer refuses the file.

### What could go wrong?

I skipped the third fix on purpose. A crashing drawing still fails Word export, as the docs promise, but you now see a message. Copilot's fix is tested in code only, since no demo page has both.

## Teach

The demo app's export menu turns what you wrote into an HTML or Word file. Each item builds the file, downloads it and shows any warnings as small messages in the corner.

Before this fix, if building the file crashed, for example because one block's drawing broke, nothing happened. No file came down and no message showed. The error only reached the browser console. Copilot had its own problem. While you type, it shows grey suggestion text. Export looked for an export version of that text, found none and counted it as lost content. Strict Word export then refused to make the file.

Now each export catches the crash and says the file could not be exported. Copilot marks its grey text as something only the editor shows, with a flag other plugins already use, so export skips it quietly. Everything Copilot does while you type works as before.

## Demo

1. Open http://localhost:3000/blocks/docx-demo, click Export and pick Export as HTML, then Export as Word. Both files download as before, with no new message.
2. When an export fails, a red message appears in the bottom right corner instead of nothing. The run forced the failure with a temporary crash in the paragraph drawing, removed afterwards. ![after](artifacts/html-export-finishing/browser/a1-after-toast.png)

## Main changes

- `CopilotPlugin` sets `editOnly: { on: false }`, so `renderStaticHtml` and `exportDocx` with a `presentation` skip its slots instead of reporting a `missing-static-presentation` diagnostic. Live editing keeps the same behavior. The live runtime reads `editOnly` for DOM handlers, leaf rendering, read-only content attributes and injected node props. `on: false` keeps Copilot's DOM handlers, such as the blur that rejects a suggestion, running in read-only mode, and Copilot uses none of the others.
- The registry export toolbar catches a thrown HTML or Word export, logs it with `console.error` and shows an error toast. The Markdown item is unchanged, because its serializer already returns failures as a result.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When a drawing crashes in Word export | Keep failing, and show the message (look) | Make the file anyway with a warning | warn on Word drawing crashes | small |
| Markdown export crashes | Leave alone, it already reports its own failures | Catch crashes there too | catch Markdown crashes | detail |
| Generated registry files | Rebuilt in this commit, like earlier commits on this branch | Let CI rebuild them | leave registry to CI | detail |
| Copilot while the editor is read-only | Works as before, and leaving the editor still clears its suggestion | Turn its event handling off too, like other edit-only plugins | turn off Copilot handlers when read-only | detail |

## Steps

- [x] Reproduce A2 on the copilot demo's real plugin set, with Discussion and Find as the other editing-UI kits. Proof: `docs/plans/artifacts/html-export-finishing/repro/a2-audit-before-a6.log`
- [x] A2 test first, red for the named defect. Proof: `docs/plans/artifacts/html-export-finishing/red/a2-red-a1.log`
- [x] Mark the drawings of `CopilotPlugin` edit-only and rerun every Copilot test. Proof: `docs/plans/artifacts/html-export-finishing/build/a2-green-a2.log`, `docs/plans/artifacts/html-export-finishing/build/a2-audit-after-a2.log`, `docs/plans/artifacts/html-export-finishing/build/typecheck-ai-react-a1.log`, with `docs/plans/artifacts/html-export-finishing/build/typecheck-ai-react-bogus-a1.log` as the control that fails
- [x] A1 tests first, red for the named defect. Proof: `docs/plans/artifacts/html-export-finishing/red/a1-red-a1.log`
- [x] Catch a thrown HTML or Word export in the toolbar. Proof: `docs/plans/artifacts/html-export-finishing/build/a1-green-a1.log`
- [x] Browser check of A1 before and after, plus a control with no forced failure. Proof: `docs/plans/artifacts/html-export-finishing/browser/a1-before-a5.log`, then on the final bytes `docs/plans/artifacts/html-export-finishing/browser/a1-after-a5.log` and `docs/plans/artifacts/html-export-finishing/browser/a1-control-a5.log`
- [x] The repository's Word and HTML browser spec on the final bytes, against the bound dev server. Proof: `docs/plans/artifacts/html-export-finishing/browser/docx-spec-a1.log`, `docs/plans/artifacts/html-export-finishing/browser/doctor-3001-a1.txt`
- [x] Changeset bullet, registry changelog entry and regenerated registry output. Proof: `docs/plans/artifacts/html-export-finishing/build/registry-changelog-check-a1.log`, `docs/plans/artifacts/html-export-finishing/build/www-registry-check-a2.log`
- [x] Writing passes on the code, lint fix and the narrow checks on the final bytes. Proof: `docs/plans/artifacts/html-export-finishing/comment-sicko/reply.md`, `docs/plans/artifacts/html-export-finishing/build/lint-fix-a1.log`, `docs/plans/artifacts/html-export-finishing/build/final-tests-a2.log`, `docs/plans/artifacts/html-export-finishing/build/final-package-tests-a1.log`, `docs/plans/artifacts/html-export-finishing/build/copilot-slow-a3.log`
- [x] Writing passes on the plan, changeset, changelog entry and commit body. Proof: the writing rows of `docs/plans/2026-10-10-html-export-finishing.decisions.tsv`

## Open work

- Two cleanup nits from the comment pass, both in code this fix did not change. The style prop `paddingBottom: ''` does nothing in the export toolbar and in the HTML export block, and the comment above `lossPolicy` says the toasts report what was lost when they report only a count. It moves to the subject's Open work when this plan folds. owner: the owner. stop: a later cleanup round of the export work lands them, or the owner drops them.

## Close

**Reversal.** The approved A list said a component that throws during Word export would give a warning instead of an error. That item is dropped. The static guide says a drawing that throws rejects the export, and `exportDocx` keeps every other caller error as a throw, the way `renderStaticHtml` does. Turning one into a diagnostic would hide the stack and split HTML from Word. With A1, the export menu shows a message for that case. The Defaults row "When a drawing crashes in Word export" reverses it.

**Deviation.** The first A2 fix set `editOnly: true`. The comment pass noted that this also turns off Copilot's DOM handlers in read-only mode, and the blur handler there clears a shown suggestion. The fix narrowed to `editOnly: { on: false }`, which changes only what exports draw.

**What landed.** For A1, the export toolbar shows "The HTML file could not be exported." or "The Word document could not be exported." when that export throws. For A2, the drawings of `CopilotPlugin` are edit-only, so an export with a presentation leaves out the ghost text with no diagnostic, and strict Word export succeeds.

**Proof and limits.** A1 ran in Chromium on the docx demo. Before the fix, a forced crash left no file, no message and an uncaught page error. After it, the menu showed the message and no page error. The control exported both files, and the repository's Word and HTML browser spec passed all 4 tests on the final bytes. The crash came from a tagged probe in the static paragraph drawing, because the demo documents export without one, as the control run shows. The run drove that check with a throwaway Playwright script, because the Codex browser lane needs a Chrome profile this machine does not have. A2 ran through `renderStaticHtml` and `exportDocx` with the copilot demo's plugin set. No page mounts both Copilot and the export menu, so A2 has no browser check.

**Review inputs.** The plan read `apps/www/src/registry/components/editor/export-toolbar-button.tsx` and `packages/platejs/src/ai/react/CopilotPlugin.tsx`.

**Open work.** One cleanup item, listed under Open work.
