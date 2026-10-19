# Decoration rendering gap review

Objective:
Answer whether Plite or Plate lacks a clean custom rendering contract for transient decorations, verify Yjs caret customization, and inventory every authored Plate registry leaf renderer replaced by attributes/CSS or overlays.

Goal plan:
docs/plans/2026-09-08-decoration-rendering-gap-review.md

Template:
docs/plans/templates/task.md

Task source:
- User asks about Plite/Plate gaps, custom Yjs carets, the full removed-leaf list and Find highlights after the editor-static comment-style discussion.

Completion threshold:
- Source-backed distinction between marks, inline decorations and positioned widgets; exact current extension limits and owning layer; complete bounded historical leaf inventory with per-entry dispositions; clear current recommendation and proof limits.

Verification surface:
- Current Plite decoration types, renderer, widget/Yjs hooks; Plate descriptor lowering, live/static rendering, Find/Comments/code/Yjs consumers; authored registry components/examples in local origin/main 8f65d77f8b4709833436e63661e4d061f709258f versus the current filesystem; accepted historical cut plans and tests.

Constraints:
- Read-only product review. Only this plan and its review artifacts may be written. No source repair, publication, branch switch, worktree, external communication or test/performance claims without direct proof.

Boundaries:
- Historical named registry leaf functions plus materially equivalent anonymous renderers in the cut consumers. Framework renderer plumbing and raw Plite proof examples are reported separately; persisted mark components must not be counted as removed decorations. Historical plans establish intent; current source establishes capability.

Timing:
- N/A; no requested budget. Throughput checkpoint: n/a, read-only investigation.

Blocked condition:
- Missing historical source or untraceable current owner is reported as an explicit inventory gap; continue other source questions. No new runtime API is accepted without the required native, static and scale proof.

Task state:
- current_phase: complete
- next: none; an optional inline component contract needs a separately accepted design and proof plan
- status: done

Work Checklist:
- [x] Read Poteto Principles and Investigation playbook; use existing runtime mapping, source inspection and concise technical writing.
- [x] Capture user questions, authority, complete-denominator requirement and applicable source-linked obligations.
- [x] Reconcile Plite/Plate inline rendering and exact-view widget contracts.
- [x] Generate and review the complete historical named-leaf inventory; supplement anonymous cut renderers.
- [x] Check current consumers, relevant proof owners and accepted plans against every material conclusion.
- [x] Apply Best API deletion/canonical-owner counterfactual; distinguish unsupported custom markup from a justified feature request.
- [x] Record final findings, truthful limits and required teaching/proof repairs for any proposed API change.
- [x] Reconcile all user questions and original checklists before completion.

Method obligations:
- Task workflow and Autogoal: one plan; current authority remains review-only.
- Best API: current public types and call sites, cleanest existing owner first, no runtime extension accepted from paper performance reasoning. A read-only recommendation reports doctrine repair instead of editing rules.
- How/Investigation: trace source to output and separate capability from motivation; perform bounded angles sequentially under the user's agent-tool mapping. No independent multi-model review is claimed.
- Laziness Protocol: reject a new renderer owner when existing widget components already do the job.
- Build the Lever: retain a rerunnable historical/current named-leaf inventory as the denominator evidence.
- Technical Writing: final explanation leads with the gap verdict, then the complete comparable list and concrete source links.
- Verification: no product changes; source/type contract and existing executable test inspection suffice for API availability. No fresh browser, benchmark, package or release certification is promised.
- Autoreview: N/A on next. This is a source/API investigation, not a diff or PR review.

Findings and remaining work:
- Yjs already installs a copied RemoteCursorOverlay with a custom React caret and label. Inline decorations remain attribute-only in Plite and Plate live/static output.
- All 17 baseline named registry leaf declarations have a reviewed disposition: seven removed, ten retained, plus one current addition. Comments (two), Find (one), code syntax (three including DOCX) and Markdown preview (one) account for every named removal.
- The report separately accounts for old Yjs selection rectangles, generic CursorOverlay, raw Plite proof examples, anonymous callbacks and framework plumbing. No extra named feature leaf was identified in the baseline package search.
- Source inspection identifies current capabilities and replacement owners. Existing tests and prior proof plans were inspected; no tests/browser/benchmarks were rerun and no runtime certification is claimed.

Final handoff:
- Findings: `docs/plans/artifacts/decoration-rendering-gap-review/report.md`.
- Complete declaration evidence and rerunnable denominator: `inventory.json` and `inventory.mjs` in the same artifact directory.
- Original obligations reconciled: read-only authority, exact user questions, bounded denominator, Best API owner/deletion analysis, current source versus historical proof distinction, optional future doctrine/proof obligations, no publication. Autoreview is N/A on next; no independent agent review was claimed.

Verification evidence:
- Fresh final inventory rerun on 2026-09-08: 362 baseline registry source files, 316 current source files, 17 baseline named leaves, 11 current names, seven absent baseline names. Script syntax check passes.
- Final artifact reconciliation passes: all 17 baseline declarations have report rows, all current declaration file hashes match the inspected filesystem, and the 10 retained + 7 removed / 10 retained + 1 added denominators reconcile.
- Current decoration types, live/static span rendering, exact-view Yjs hooks, copied caret JSX and DOCX CSS/whitespace path inspected directly. Runtime tests were inspected only; runtime/browser/performance proof is outside this source review.

Open risks:
- Historical denominator is the pinned local origin/main snapshot, not every intermediate revision or downstream copy.
- Optional inline component rendering is an identified capability gap. Its final public shape, native behavior and performance remain unproven and require a separate accepted design/proof plan.
