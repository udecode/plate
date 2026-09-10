# Navigation feedback cut review

Objective:
Review the current navigation-feedback cut and its documentation, determine the smallest justified API, and report verified regressions and proof limits.

Mode:
Read-only product review. Local review artifacts and disposable verification are authorized; no product fixes, commits, publication or new checkout.

Completion threshold:
Trace the removed hook and changed attribute publisher through every current consumer, verify the affected docs and focused behavior, and return an evidence-backed cut verdict with actionable findings.

Verification surface:
NavigationFeedbackPlugin, removed useNavigationHighlight, shared view attribute publication and element rendering, copied footnote/heading/TOC consumers, English/Chinese navigation-feedback docs, package tests and real local routes.

Constraints:
Preserve current source and pre-existing proof. Compare the complete checkout with HEAD without changing the index. Do not call focused proof full native or release certification. No Autoreview on next; use Best API for the semantic decision and Verify Plate for proof. No subagents under the user's tool mapping.

Boundaries:
Review the navigation-feedback cut and materially different caller jobs. Other edits in the shared footnote file, such as combobox insertion, remain outside this review unless they affect the navigation verdict. Keep historical plan and performance claims separate from fresh source and runtime evidence.

Blocked condition:
An unavailable browser or compiler capability limits that proof claim; continue all independent source, type and runtime review before reporting the limitation.

Work Checklist:

- [x] Best API: trace the ideal deletion target, surviving semantic owner and JSX escape path from public source and current consumers.
- [x] Task and review: enumerate the bounded source and declaration changes against HEAD; separate introduced defects from existing debt.
- [x] Docs: read English/Chinese source, verify MDX structure, current public symbols, example semantics and exact rendered route.
- [x] Verify Plate and Testing: run meaningful affected contracts, inspect actual footnote/TOC interactions and retain errors, host identity and source fingerprints.
- [x] Best API scale gate: identify what runtime work the cut removes or retains; inspect the existing shared publisher measurement rather than infer performance.
- [x] Closeout: reconcile source-linked obligations, record exact findings and proof gaps, and complete this review goal without implementing fixes.

Verification evidence:
Local evidence is retained under `docs/plans/artifacts/navigation-feedback-cut-review/`.

Verdict:
Keep the `useNavigationHighlight` deletion. Retain `NavigationFeedbackPlugin`, its target/options contracts and navigation updates: TOC and footnotes have independent current navigation jobs. The deleted hook repeated active-target subscription and path matching already supplied by Plate's keyed rendered attributes. Also retain the cuts of the exported name constant and private stored-target type, and of the copied footnote attribute helper. Those are three public export removals and one local helper removal, not four independent user capabilities.

The maximum cut considered was deleting the navigation plugin or moving whole-node feedback into inline `decorate.attributes`. Neither fits its current job: the plugin owns transient navigation state, anchored target identity, expiration and navigation effects shared by TOC and footnotes; whole-node attributes have the existing `render.useViewElementAttributes` owner. Visual palette belongs to copied feature UI. No new hook, store, adapter or public rendering channel is needed.

Custom element JSX can branch on `props.attributes['data-nav-target'] === 'true'`; Plate merges those attributes before invoking the configured component in `pluginRenderElement.internal.tsx`. Metadata observers outside an element render can use the existing `usePluginStore(NavigationFeedbackPlugin, 'activeTarget')` or explicit-editor `useEditorPluginStore(editor, NavigationFeedbackPlugin, 'activeTarget')`. A CSS example alone does not explain these different consumer jobs; add that teaching when repairing the page.

Findings:

1. **P1, introduced: English MDX no longer compiles.** The diff deletes `</Steps>` together with the obsolete hook prose, while `<Steps>` remains at line 23. The missing close belongs before `## Plugins` at line 205. The MDX compiler rejects current English with `Expected a closing tag for <Steps>`, compiles HEAD English and current Chinese, and compiles current English when only that close is restored in memory. The real `/docs/navigation-feedback` route displays the compiler error. No source repair was made.
2. **P2, existing documentation debt retained in the edited page: nonexistent public API.** English lines 222, 234 and 240 and the Chinese equivalents teach `api.navigation.activeTarget`, `api.navigation.clear` and `api.navigation.isTarget`. Current runtime has no `editor.api.navigation`. Reads use plugin store selectors; clear is `editor.update.navigation.clear()` or `tx.navigation.clear()`. English lines 140/304 also cite nonexistent `editor.api.start`; source uses `editor.read.points.start`. The same stale navigation namespace appears in English/Chinese `content/docs/api/core/plate-editor*.mdx`. These are not introduced by the hook deletion.
3. **Minor existing Chinese reference inconsistency.** Its API options table says 800 ms at line 183, while configuration prose and current plugin default are 1600 ms.

Fresh proof:

| Check | Result | Evidence |
| --- | --- | --- |
| Navigation, footnote package, keyed attribute store and view hook-host contracts | 22 passed, 85 assertions, 4 files | `package-tests.log` |
| Copied footnote navigation | 1 passed, 8 assertions | `footnote-isolated.log` |
| Copied heading | 1 passed, 1 assertion | `heading-tests.log` |
| Copied TOC | 7 passed, 34 assertions | `toc-tests.log` |
| MDX structure | Current English fails; HEAD English and current Chinese pass | `mdx-compile.log`, `docs-error.png` |
| Public API/default runtime read | No `api.navigation` or `api.start`; clear function exists; duration 1600 | `public-api.log` |
| Footnote reference to definition | Meta-click highlights exactly one definition with navigation data and visible yellow background | `footnote-definition-state.json`, `footnote-definition.png` |
| Definition back to reference | Click highlights exactly one superscript; nested button receives its group-based background | `footnote-reference-state.json`, `footnote-reference.png` |
| TOC navigation | Click scrolls to Benefits of Using TOC and highlights exactly that heading; target later expires | `toc-state.json`, `toc.png` |

Total valid focused tests: **31 across 7 files, 128 assertions, zero failures**. The initial combined run is retained in `focused-tests.log` but is invalid as aggregate proof: the TOC file's global `mock.module('platejs/react')` omits `useComposedRef` and contaminates the copied footnote import. The independently run files pass. This is a test isolation issue, not evidence of a product runtime regression or an install-corruption signal.

Browser identity: existing server `http://localhost:3297`, listener PID 14712, process working directory `/Users/zbeyens/git/plate-2/apps/www`, in-app browser tab 3. All four saved screenshots were inspected. Navigation metadata observed includes alternating cycle, pulse, variant, target marker and `--plate-nav-feedback-duration: 1600ms`. The reference button's background and heading background were verified from computed styles as well as images. Source fingerprints at review close are in `source-manifest.json`.

Open risks:

- The removed hook, package export/type edits, navigation effect/publisher, shared attribute store and hook host, normal/fast/default element rendering, copied footnote/heading/TOC, both navigation pages, and matching core API references were inspected. Unrelated footnote combobox insertion changes are excluded.
- The shared publisher's historical 100/1,000/10,000-element receipt is supporting history only. None of its 13 source hashes matches this checkout (`historical-proof-hashes.json`). No current performance number or scale acceptance is claimed. Removing the redundant hook adds no runtime machinery, but current scale proof for the wider shared renderer remains unverified here.
- The focused tests cover flash/clear, repeat cycles, anchored movement/deletion, configuration and mocked focus/scroll. Live proof covers footnote and TOC feedback. This review does not certify full package typecheck, the complete browser matrix, native focus/IME/device behavior, or release readiness.
- No product fix, public documentation edit, doctrine change, index mutation, commit or publication occurred during this review. Review artifacts are the only writes.

Source-linked closeout:

- `.agents/skills/best-api/SKILL.md`: applied delete/merge/reuse counterfactuals, independent consumer jobs, source-backed removed-runtime accounting, and reported the stale scale receipt rather than approving it as current proof.
- `.agents/rules/task/references/workflow.md`, `.agents/skills/verify-plate/SKILL.md`, `.agents/skills/testing/SKILL.md`: retained review-only authority, current checkout identity, focused package contracts and actual affected browser routes; no Autoreview on `next`.
- `.agents/rules/task/references/docs.md`: checked public source, actual symbols, both locale sources, compiler behavior and the exact English route.
- Best API doctrine repair disposition: `.agents/rules/plate-ui.mdc:122`, `.agents/rules/best-api.mdc:434` and `docs/vision/plate.md:225` already assign whole-element attributes to the shared hook host, and Plate Next version history records that law. The required repair is the English/Chinese navigation teaching and corresponding core API references, including the existing attributes/store JSX paths. No additional durable architecture law was established by this read-only review. If a later authorized repair changes source doctrine, regenerate its mirrors and append the required version under the existing owners.

Next action:
Review complete. Return the findings and qualified architectural verdict. Product and documentation repairs remain separate from this review's completed scope.
