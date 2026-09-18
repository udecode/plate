---
title: Suggestion review semantics
type: decision
status: provisional
updated: 2026-09-17
review_scope: suggestions
current_review: 2026-09-14-suggestions-view-initialization-api
review_history:
  - ../review-records/2026-09-13-suggestions-google-docs-audit.json
  - ../review-records/2026-09-13-suggestions-omission-audit.json
  - ../review-records/2026-09-13-suggestions-entrypoint-review.json
  - ../review-records/2026-09-14-suggestions-content-attributes.json
  - ../review-records/2026-09-14-suggestions-initialization.json
  - ../review-records/2026-09-14-suggestions-view-initialization-api.json
source_refs:
  - ../../plans/artifacts/google-docs-suggestion-audit/audit.md
  - ../../plans/artifacts/google-docs-suggestion-audit/coverage-crosswalk.json
  - ../../plans/artifacts/google-docs-suggestion-audit/omission-synthesis.md
related:
  - authored-change-ownership.md
  - ../reviews.md#suggestions
---

# Suggestion review semantics

## Input mode and review projection

Suggestion mode controls the intent of subsequent input, not the visibility or status of existing changes. Both Editing and Suggesting use the markup projection. Closing Suggesting therefore keeps pending insertions, retained deletions, replacements, review cards, and linked comments visible.

Editing writes only targets that map exactly to accepted content. Pending insertions, retained deletion fragments, and selections that mix accepted and pending content are review-only until the user switches to Suggesting. The mode control never accepts, rejects, deletes, or serializes a change, and it creates no undo step. Applications that need a clean accepted-only view set `{ intent: 'edit', projection: 'accepted' }` explicitly.

This keeps one native authored view owner. It does not add a mode store, a second document, or suggestion-specific paint state. Each mounted view retains its own intent and selection, while accepted content, authored records, IDs, authors, and comments remain shared document facts.

## Document initialization

The initialization review's **Pursue** direction is adopted. `rich-text-editor.tsx`
loads a prepared native authored document through `initialValue` and matching
threads through CommentsPlugin's `initialState.initialThreads`. The mounted
component performs no fixture edit replay, temporary author switching, history
suppression or delayed thread attachment. Stable saved change identities let
threads refer to suggestions before the editor mounts.

The API reassessment keeps `EditorRoot authored` as the public initialization
contract. Authored intent and projection configure one exact mounted view
before its first render. `SuggestionPlugin` configuration would instead be an
editor-wide default that needs hidden precedence, a late effect, or a new
generic plugin-to-view initialization protocol. A feature-specific wrapper or
mode helper adds a second setup vocabulary without removing the native policy.
The explicit authored object is lower-level than `setMode('suggesting')`, but
that difference is truthful: the root owns view policy and the plugin owns the
suggestion product vocabulary and controls.

Configuring suggestion behavior through its plugin is appropriate. Adding an
independent `initialState.suggestions` store is not: authored data includes
accepted content, retained content, attribution and decisions that must load
together. A helper that replays the same commands on every mount only relocates
the problem. Native import can prepare an example fixture outside the mounted
editor lifecycle; ordinary document loading already has a checkpoint path.

Plate EditorRoot forwards the native `authored` view input through its existing
model to the actual editable lifetime. Public typing requires the inferred
authored capability; the private native facade preserves component identity
while carrying that policy beside its erased editor specialization. Native
reconciliation compares intent/projection values so an equivalent inline prop
does not reset an in-view mode command on an unrelated parent render. Generic
copied Editor skins remain independent of optional plugins.

The fixture's accepted document contains no empty link placeholder. Alice
suggests the complete link and adjacent text; the other authors' independent
edits precede that structural proposal during offline fixture creation. This
preserves visible content while permitting independent accept/reject and undo.

This reaffirms native authored ownership and optional presentation. Focused
source/runtime contracts and 20 Chromium journeys prove this bounded adoption;
the execution plan records package, registry, installation and typecheck
outcomes. No performance improvement or broader Google Docs parity is claimed.

## Optional content presentation

The September 14 review returns **Pursue** for plugin-owned
`render.contentAttributes`. This reverses the same day's unrecorded choice to
put suggestion selectors in generic Editor skins. Feature-specific CSS and
data-attribute knowledge are coupling even without an import; behavior tests
cannot waive that existing ownership law.

The generic Editor and EditorStatic presentation files contain no suggestion
or comment selectors. Copied SuggestionKit configures its existing package
plugin with safe content attributes; CommentKit retains `decorate.attributes`.
Plate's existing plugin compiler composes editable/read-only attribute values,
and the content components apply them to their existing roots. Plite already
accepts DOM props and needs no suggestion-aware primitive for this job.

Keeping the wrapper leaves unnecessary structure. Reusing `render.attributes`
or keyed view-element attributes targets nodes rather than the content root.
Using only `decorate.attributes` misses retained fragments that are not ordinary
editable ranges. Changing the retained-content renderer would introduce another
presentation path for a job satisfied by existing semantic markers. A broad
content-props bag, extra hook host, imperative DOM effect, companion plugin, or
host-forwarded class bag adds work without improving this job. The chosen
field accepts a static safe attribute object or null, preserving existing
event and lifecycle owners.

The bounded construction/SSR probe compares style-only wrappers with compiled
attributes for 1/10/100 plugins and 1/1000 nodes. Its artifacts live under
`docs/plans/artifacts/content-attributes-probe/`; it is an owner-level cost
guard, not a browser-performance or full suggesting-parity certificate. The
execution and proof receipt stays in the existing
`2026-09-13-suggestion-package-over-authored-changes.md` plan.

This presentation decision supersedes that portion of the earlier target and
reaffirms the independent suggestion feature over native authored authority.
The broader Google Docs coverage findings and their limits remain separate.

**Pursue a complete semantic review contract over native authored changes.**
Cut the assumption that a change kind and text ranges are enough to describe
every reviewable edit. Paragraph boundaries, property values, lists, and table
operations need their actual meaning and locations exposed by their owner.

Plite owns authored identity, retained content, properties, dependencies, views,
and atomic decisions. Ordinary feature commands own valid schema changes.
Plate owns human descriptions, markers, navigation, and review interaction;
applications own access policy. Native per-change detail reads must reuse
retained facts without requiring whole-document serialization or a second
suggestion store. Current discussion source consumes `read.authored.details`;
its full behavior and adoption are not certified by this source review.

The corrected audit contains 44 selected families: 37 Google-facing
interaction/review families and seven Plate/Plite platform/lifecycle families.
Its 25 live probes remain a bounded sample. A machine crosswalk maps all 48
current Google request union members and all earlier F01–F32 contracts to an
explicit family. No family has complete parity certification.

Gaps observed in the earlier audits included a card feed limited to the first 200 pending
changes, omitted conflicted changes, generic descriptions, and silent handling
of blocked or stale review decisions. Native structural-delta tests do not
prove that each Enter, list, or table command produces the correct attributed
action and complete visible review lifecycle.

## Plate suggestion entrypoint

The bounded entrypoint review also returns **Pursue**. A `platejs/suggestion`
feature should own reusable suggestion review behavior over native authored
changes, with React integration behind `platejs/suggestion/react`. The copied
source currently owns semantic membership comparisons, commit invalidation,
decoration observation and hit testing alongside Tailwind classes and comments
composition. Move the durable behavior to its feature owner; keep cards,
styling, toolbar layout and `SuggestionKit` composition in the registry.

Cut the copied `getSuggestionEditor` cast protocol through inferred plugin
composition. Reuse native authored reads and atomic decisions instead of
publishing parallel accept/reject aliases or another change store. Preserve
`platejs/authored` for native authorship, selective history, AI and format jobs
that do not require human suggestion UI. Comments remain optional composition;
do not move the mirrored thread map and first-thread policy into a mandatory
suggestion dependency.

The exact feature contract remains provisional. Design must settle mounted-view
active state, projection-aware subscriptions, neutral paint markers and review
outcomes. Compare reusing native retained-fragment markers with the remaining
necessary decoration work before retaining observers or caches, then measure
the selected runtime. Current discussion source already reads semantic details
and presents blocked/stale outcomes, so the earlier audits' corresponding gap
statements are historical observations. This review reaffirms their native
ownership verdict without replaying their wider behavior audit.

Next: `$task design plan suggestion: package reusable review behavior over
authored changes and keep presentation in the registry`.

The review contract must also cover producer action/group cardinality, explicit
author withdrawal, durable closed review history, partial publication failure,
global targets, and live paging recovery. Existing AI, external-text, format,
anchor, retained-history, codec, and mounted-view owners constrain the design;
they cannot be inferred from a Google toolbar-operation matrix.

The pinned `main` Suggestion package supplies useful behavioral expectations
for text, paragraph boundaries, marks, and voids. Its boolean-oriented mark
rejection, paragraph-only split handling, and incomplete structural/clipboard
proof disqualify restoring its independent mutation engine as the target.

## Relationship to earlier work

The corrected audit reaffirms [native authored ownership](authored-change-ownership.md)
and preserves the direct-checkpoint performance receipt within its measured
scope. It corrects the interpretation of the September 10 adoption plan's
broad F01–F32 completion summary: those receipts do not establish full
Google Docs-style suggestion coverage, particularly actual list/table commands,
feature review UI, and cross-feature lifecycle combinations. It also supersedes
the first audit's 32-family completeness boundary while preserving that audit's
observations and architecture verdict. Earlier immutable records remain unchanged.

## Next owner and proof limit

Task's design/planning workflow owns the coupled API, adoption, and proof job.
Start with real paragraph split/merge and valued-mark actions through preview,
accept/reject, follow-up typing, history, and reload. Include review discovery,
closed history, withdrawal/capabilities, and actionable stale or partial
outcomes in the same boundary. Relevant dependent-author cases and
complete-operation scale comparisons gate the chosen contract.

This is a Pursue verdict, not implementation acceptance. No product source,
runtime representation, package export, or test suite changed in this review.
See the [audit and source index](../../plans/artifacts/google-docs-suggestion-audit/audit.md)
for all dispositions, alternatives, sources, and unresolved Google behavior.
