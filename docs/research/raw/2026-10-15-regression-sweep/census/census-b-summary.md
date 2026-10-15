observed: The exact requested git log returned 48 non-merge fix commits. The census retains 44 behavioral fixes and excludes 4 cleanup commits. Counts are per commit, not per defect; multi-symptom commits get one primary surface.

observed: Excluded SHAs: 72d40d2ce1 (lint/provenance only); 85f7fdab36 (lint formatting only); 9a0e7ce0e4 (test removal/docs only; no runtime behavior changed); c70bacbd4a (build, registry checking, knowledge tooling and test/type cleanup only).

observed: sha/date/subject are git metadata. Symptoms and test file changes are observed. Inferred: area, primary surface, model-reproducible and miss-class are classifications; enum fields retain the requested literal values. Unknown found-by means the inspected evidence does not identify discovery, not that no human discovered it.

observed: test-added counts new or strengthened behavioral coverage, including updated transition expectations; package slow/component/jsdom/integration tests count as unit. File lists include modified tests, so not every listed file adds coverage. A reverted test, removed assertion, or import-only edit does not count as a newly covered fix.

inferred: Counts by primary surface: model 12, serialization 6, native-keyboard 5, scroll-or-layout 5, render 3, caret-or-selection-paint 3, pointer-or-mouse 3, popover-or-toolbar-ui 2, clipboard-or-paste 2, drag-and-drop 2, other 1.

observed: Counts by test-added: both 18, unit 14, none 6, browser 6.

inferred: Counts by model-reproducible: yes 29, no 8, unclear 7. A yes means a test without a real browser can expose the defect; unclear includes mixed model/paint defects. These are judgments, not fresh reproductions.

inferred: Five most frequent miss classes:

inferred: nested structure and command combinations missing: 12; examples 2dae3b3f8b, 57808288f1.

inferred: native events and live geometry missing: 9; examples 236bb63e9b, 03f2dffc21.

inferred: integration and configuration drift: 8; examples b1e70bb257, 0ba70d6abc.

inferred: selection ownership and paint mismatch: 5; examples 209e00b948, 26cc4b2c49.

inferred: authored views and identity lifecycle missing: 5; examples bbd722a6bd, dfb26fd6eb.

observed: Fixes landing without new/strengthened behavioral test coverage (surface inferred): b1e70bb257 — render; ada2fa7601 — render; b7beade69f — model; b74bca3a52 — scroll-or-layout; 791a53f92c — drag-and-drop; e33b195adf — pointer-or-mouse.

observed: Explicit passing-existing-test / missing-behavior evidence: 791a53f92c, docs/plans/2026-10-07-dnd-translucent-drag-image.md, Close, says the full Firefox run passed 105/105 at baseline b1a8eba4eb, as well as on the change. Its body records the opaque box. The same Close says Playwright intercepts drags and proves content/origin, not native paint. Test source: apps/www/tests/browser/dnd.spec.ts, dnd:block-preview-origin. Inferred: this is a confirmed baseline green suite that could not certify the human-visible native image.

observed: 332c1a161d, docs/plans/2026-10-10-html-presentation-context.md, behavior table, says the two existing fallback tests stay green while its before column says installed live afterNodeChildren drew under a presentation. Close says the export-menu browser spec passed 4/4 and no registry block reaches these new paths. Tests: packages/platejs/src/static/renderStaticHtml.presentation.spec.tsx and packages/platejs/src/static/pipeRenderElementStatic.spec.tsx; browser source apps/www/tests/browser/docx.spec.ts. Inferred: green checks missed an API path absent from the demo corpus. Observed: discovery was code review; the evidence does not establish production reach or a human-reported shipped failure.

observed: Existing tests explicitly encoded bad expectations in three other cases, but I found no pre-fix execution result proving they passed: 78705693fb removes the hidden-caption text stop expected in apps/www/tests/browser/media-caption.spec.ts (introduced/retained in 0ba70d6abc); e1fb01295e is followed by 9a0e7ce0e4, whose body says two apps/www/src/__tests__/package-integration/markdown-rich/serializeMarkdown.spec.tsx tests pinned output with a lost break and stray backslash; ada2fa7601 deletes active-heading assertions from apps/www/src/registry/components/editor/toc.spec.tsx while its body states the owner rejects that behavior. Inferred: these are wrong-oracle cases, not proven historical green runs.

observed: b74bca3a52 reports review finding flaws after f0a73ca1f9 added text-selection browser/unit tests, but supplies no pass result for the flawed implementation. Observed: 44a71e0c11 changes read-only-close expectations from 47b920c039; again no baseline pass result was read. These cannot be counted as proven green-while-shipped cases.

inferred: Test-layer implication for the lead: put deterministic nesting, numbering, identity and conversion predicates in package tests. Browser cases should add native ownership, focus, real scrolling and paint assertions. Native drag-image paint remains a human/OS check because browser drag interception cannot certify it. No new tests were run in this read-only census.

observed: Coverage limits: all commit bodies were read; all stats and all changed test diffs were captured, but test hunks were inspected partly rather than exhaustively, especially large fixtures/setup. This is not an exhaustive certification of every test assertion or every historical pass. No artifact-directory evidence was opened.
