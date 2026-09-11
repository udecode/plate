# Repeatable architecture review and research history

Objective:
Assess which existing documentation and workflow owners should support a global review queue, repeated model-led reassessment, incremental external research, and reusable decision history.

Flow mode:
Source-backed assessment. The user is refining the audit design before starting the global feature ledger.

Completion threshold:
Identify the current documentation owners, give each relevant owner a keep/change/consolidate disposition, specify the smallest shared history and reuse contract, and identify the editable skill sources. Save the assessment and verify its source links and completion checklist.

Verification surface:
Current repository documentation, schemas, representative research records, audit cursors, workflow source and helper reads. No runtime or external-source claims are required.

Constraints:
Preserve first-principles reconsideration, negative results, prior iterations, independent proof statuses, and the user's AI-last ordering. A new model may motivate a deliberate reassessment without new source evidence. Avoid another competing behavior specification, research archive, or implementation roadmap.

Boundaries:
Only this assessment file may be written. Existing docs, skills, runtime code, external repositories, and the global feature ledger remain assessment subjects. No commits, publication, scheduling, or external discovery run is requested.

Blocked condition:
An unavailable canonical source could leave its edit owner unresolved; inspect available provenance and report the precise limit without inventing ownership.

Work Checklist:
- [x] Read the user-named Best API Review and Plite Research methods and applicable first-principles and workflow routing. Evidence: current generated skills, Best API decision sections, Task workflow, and Maintain Workflow ownership method.
- [x] Resolve standing goal applicability and authority. Evidence: Autogoal entrypoint and full method; native goal was absent; current branch read as next before artifact creation.
- [x] Inspect editor-behavior's specification, scenario, parity, reference, and roadmap contracts. Evidence: file map and exact-path checks below.
- [x] Inspect compiled research decisions/schema/log, dated research ledgers, and independent external audit cursors. Evidence: 44 research directories, header inventory, research schema, and 11 registered external audits.
- [x] Inspect representative recent iterations and source/helper consumers for actual history and deduplication behavior. Evidence: September 9 performance iteration, September 10 authored changes and structural diff, prior-candidate reconciler, and research helper dispatch.
- [x] Compare reuse, consolidation, a new store, and skill-local history; select one minimal target with exact file dispositions. Evidence: alternatives and selected ownership below.
- [x] Define stable identity, evidence freshness, re-review triggers, model provenance, negative-result reuse, and historical backfill rules. Evidence: repeated-review contract below.
- [x] Verify canonical editable workflow sources and recommend the first bounded follow-up. Evidence: shared Best API Review source exists and matches its Plate installation; project adaptations identified below.
- [x] Save a source-linked assessment and validate local links. Evidence: 44 local links resolve; the final plan checker is the closing verification command.

Method obligations:
- Best API Review: treat existing document and skill boundaries as deletable, distinguish facts from judgments, and recommend one next owner without executing downstream work.
- Plite Research: examine the existing query/read/lead/rejection/promotion owners and commit-aware evidence. Its external-search counts, promotion run, and new research ledgers are not applicable because this task assesses the workflow rather than researching external editor designs.
- Maintain Workflow: distinguish shared source from project adaptation and generated installations. Proposed workflow changes are not applied by this assessment.
- Autogoal and Task: retain one assessment plan, source-linked obligations, scope and proof limits. Browser, package tests, registry generation, doctrine repair, and Agent Native Reviewer are not applicable because no workflow or product source changes are made.
- Technical Writing: preserve measured counts and their limits; label proposed files and behavior; verify links and distinguish this assessment from implementation.

Evidence and findings:
**Pursue: connect the existing research and decision owners before building the global review queue.** Keep behavioral contracts in editor-behavior, normalized decisions in the compiled research layer, dated review evidence beside the existing run artifacts, and upstream audit cursors with Editor Audit. Add one shared review index. Neither Best API Review nor each model needs its own history store.

## What exists and what is missing

The repository already implements most of the intended storage boundaries:

- [Editor Behavior](../editor-behavior/README.md) separates behavior, scenario coverage, family coverage, external evidence, and implementation sequence. [Markdown Standards](../editor-behavior/markdown-standards.md#spec-id-scheme) already requires stable spec IDs and test mapping.
- [Research](../research/README.md) explicitly exists to prevent agents rediscovering the same decisions. [Decision pages](../research/decisions/README.md) already own the question, winning answer, rationale, overruled position, and source support.
- [The research schema](../research/schema.md) gives decisions proposed/accepted/superseded status and an updated date. It has no required review ID, prior-review relation, model/method provenance, source version, or reopening reason. Those fields are needed for repeated architecture assessments; they need not burden every source summary or concept page.
- [The external audit registry](../editor-audits/index.json) contains 11 audit entries. Its architecture commit, test-harvest commit, and issue-refresh timestamp are independent. Preserve that separation.
- Dated Plite research contains 44 immediate run directories. Among their immediate TSV files, 41 lead ledgers have 11 distinct ordered headers; 40 read logs have 17; 38 rejection ledgers have 10. These are schema-shape counts, not a count of erroneous rows. Some differences are legitimate extra fields, but future lookup cannot assume one uniform historical format.
- [Performance iteration 2](../plite/research/2026-09-09-editor-performance-iteration-2/README.md) already reconciles earlier candidates. Its [reconciler](../plite/research/2026-09-09-editor-performance-iteration-2/reconcile-prior-candidates.mjs) hardcodes the preceding run's queue and matrices. This proves the job is real and supplies a useful example; it is not a general cross-run lookup.
- [Authored changes](../plite/research/2026-09-10-authored-changes/README.md) retains decisions and rejected alternatives. [Structural diff OSS validation](../plite/research/2026-09-10-structural-diff-oss/README.md) records exact upstream commits in source refs. Neither run, nor September 9 performance iteration 2, is linked by its exact run-directory name from the current research index or log.
- [The July Best API Review](../analysis/best-api-review.md) lives at an undated filename. Treat its conclusions as dated evidence, then reconcile them with current owners.

Exact-path inspection of backticked, non-glob source references found 69 missing paths out of 125 unique literal paths in [the parity matrix](../editor-behavior/markdown-parity-matrix.md), and 17 out of 22 in [the protocol matrix](../editor-behavior/editor-protocol-matrix.md). The scan included paths starting with packages/, apps/, or content/ and excluded whitespace, wildcard, and line-suffixed values. These are stale-reference observations, not missing-feature counts or behavior-test failures. They are sufficient to reject inheriting current coverage from the prose without reconciliation.

## File dispositions

Coverage: all 10 selected documentation-owner groups below have dispositions. Their schemas, entry points, and representative consumers were inspected; the contained historical decisions were not exhaustively re-reviewed. The global feature denominator remains the subsequent ledger task.

| Existing owner | Disposition | Role in repeated reviews |
| --- | --- | --- |
| [Editor Behavior README](../editor-behavior/README.md), [standards](../editor-behavior/markdown-standards.md), and [editing spec](../editor-behavior/markdown-editing-spec.md) | Keep; clarify current scope and link the review index | Supply current jobs, behavior requirements, accepted product policies, and stable spec IDs. Distinguish actual hard constraints from revisable implementation assumptions. Do not duplicate their normative text in the review queue. |
| [Protocol matrix](../editor-behavior/editor-protocol-matrix.md) and [parity matrix](../editor-behavior/markdown-parity-matrix.md) | Repair evidence references; connect existing IDs to review scopes | Retain scenario and family coverage. Resolve current proof owners before inheriting tested/locked status. These matrices contribute to the global denominator; current exports, runtime owners, registry consumers, and proof inventories complete it. |
| [Behavior reference audit](../editor-behavior/markdown-editing-reference-audit.md) | Keep as a scoped evidence view | Reference the shared source and decision records. Preserve what each historical reference actually established and its date. Avoid another parallel decision history here. |
| [Behavior master roadmap](../editor-behavior/master-roadmap.md) and [operator commands](../editor-behavior/commands/README.md) | Reconcile scope and simplify routing | The roadmap owns accepted implementation order for this lane. The new index owns review order. Commands should route discovery, reassessment, and implementation to their existing skills without forcing every new model through another interview or full research pass. |
| [Research README](../research/README.md), [index](../research/index.md), [schema](../research/schema.md), [decisions](../research/decisions/README.md), and [log](../research/log.md) | Extend as the common knowledge owner | Make the index the entry point. Add the repeated-review metadata to the schema. Decision pages show the current conclusion and links to its immutable review history; the log records a concise operational entry, not a duplicate decision body. |
| [Research systems](../research/systems/README.md), including [the architecture landscape](../research/systems/editor-architecture-landscape.md) | Retain scoped summaries; reconcile historical scope | Link current decisions and their source basis. The existing landscape describes the earlier overlay comparison; do not promote its ranked editors into universal architectural winners. |
| [Dated Plite research](../plite/research) | Keep raw investigation history; standardize future records | Keep query, read, lead, rejection, and promotion evidence in its existing run. Add stable decision references and explicit source identity. Search across runs before creating another investigation. Preserve historical headers and provenance during import. |
| [External audit registry](../editor-audits/index.json), [test harvests](../editor-test-harvester), and [issue harvests](../editor-issue-harvester) | Reuse independent cursors and detailed evidence | Refresh changed external source and affected dependencies. Link audit runs to the global decision scope. A new model or a refreshed GitHub issue must not advance the architecture or test cursor without that lane's work. |
| [Plans](.), their artifacts, and [the historical API review](../analysis/best-api-review.md) | Preserve historical records; index their material decisions | Keep active implementation in its owning plan. Save each completed review as a dated immutable record under its existing run artifacts; a short standalone review can use the existing decision page for an appended dated record. Backfill links to old findings instead of rewriting old iterations. Mark the July report's historical role in its entry point. |
| [Solutions](../solutions), [Vision](../vision), and [Plite inventories](../plite/ledgers/README.md) | Reuse selectively | Link recurring failure lessons and current durable law. Use migration/test inventories as provenance until source reconciliation proves them current. Keep [Plate Next doctrine versions](../../.agents/rules/plate-next/versions.json) as doctrine/adoption history; review attempts are a different record. |

The proposed new files are `docs/research/review-index.json` and a generated `docs/research/reviews.md` view. They do not exist yet. The JSON owns stable review-scope identity, feature membership, decision/history links, dependency edges, opportunity score with its reason, execution wave, and explicit scheduling overrides such as AI last. The Markdown is a generated view, so it cannot become a second manually maintained queue. Detailed findings, research evidence, and proof remain with their existing owners.

## Why this target wins

| Alternative | Verdict | Reason |
| --- | --- | --- |
| Only tell agents to search existing docs more carefully | Stop | The inconsistent headers, disconnected run entry points, and run-specific reconciliation already make lookup depend on bespoke searches. More prose does not make history reliably discoverable. |
| Put the whole ledger and history in editor-behavior | Stop | Its current independent job is behavior law and coverage. Research sources, architecture alternatives, and model-led reassessments have broader scopes. |
| Create a new knowledge database or separate history for each skill | Stop | Research decisions, dated run artifacts, and external audit cursors already own those records. Another writable copy adds synchronization work. |
| Merge all documentation and research runs into one large ledger | Stop | It mixes current requirements, historical claims, review priorities, and implementation/proof status. Preserve those jobs while joining them by stable IDs. |
| Reuse existing records with one shared index and small lookup/validation support | Pursue | Future reviews can retrieve earlier questions, source reads, decisions, and exact reopening conditions before spending time. It adds the missing discovery and scheduling job while preserving each evidence owner. |

Conceptual flow:

```text
current job + behavior/spec IDs
  -> shared review scope and current decision
  -> earlier review records + source/read/lead evidence
  -> changed-source research or deliberate new-model reassessment
  -> Stop / Pursue / Defer record with relation to prior review
  -> current decision summary and review queue
  -> accepted implementation plan and its independent proof, when authorized
```

## Repeated-review contract

1. **Stable identity.** Features map to a review scope; a scope can cover several features sharing one ownership question. Keep a stable question/decision ID through package or symbol renames. New research leads reference that decision and their own normalized invariant/proof-family key. Similar titles alone do not prove duplication; exact semantic mapping remains a judgment.
2. **A small current record, preserved iterations.** The current decision page links the latest effective review and prior dated records. Each completed record captures the question, current requirements, alternatives, verdict, material rationale, source and consumer references, proof limits, reopening reason, and relation to the prior review. Keep Stop and Defer records too. Stop creates no implementation backlog.
3. **Known provenance.** Save review/run ID, date, available model identity, method/rubric revision, relevant local source identity, and upstream revisions. For uncommitted local work, HEAD alone is insufficient; preserve the relevant file hashes or the existing run fingerprint. Unknown historical models or source versions remain unknown. Store a concise user-request summary, not private system instructions or hidden reasoning.
4. **Independent state.** Review freshness, Stop/Pursue/Defer, opportunity score, execution order, adoption, and behavior/performance proof are separate. Preserve the basis of old scores so a changed rubric cannot masquerade as architectural progress. The queue's score estimates review payoff; it does not certify architecture.
5. **Source reuse.** Reuse a prior source observation when its exact source version, relevant dependency context, and question still match. A file read for another question may still need inspection. A changed path, source revision, caller, law, or proof basis selects what to recheck; it does not invalidate unrelated reviews.
6. **Model reassessment.** An explicit new-model review is a valid trigger even when the code is unchanged. State that the run is reconsidering the reasoning with the same evidence. First sketch the ideal under current jobs and hard laws, then confront the prior alternatives and explain why the conclusion is reaffirmed, superseded, reversed, or deferred. Earlier verdicts must not become unquestionable law.
7. **Research refresh.** Prior rejected leads carry reasons and reopening conditions. Query all indexed runs before deep reading. Refresh the relevant upstream commits and dynamic issue/PR state, retain the search scope and checked time, and append support to an existing lead when the new source proves the same invariant. A new browser law, proof family, current requirement, contradiction, stronger counterargument, or deliberately requested model review may justify reopening.
8. **Historical import.** Seed the index from existing plans, research runs, and material candidates. Keep their original files and dates. Classify recovered records as historical or unverified until current source/requirements are reconciled. Missing fingerprints, incomplete coverage, and ambiguous matching stay explicit. Do not invent a new design decision to fill a blank field or mark an old plan's implementation/proof complete.

No system can promise zero repeated reading. The useful guarantee is that each repeated investigation names what changed or why a deliberate reassessment is worthwhile, and preserves its result for the next run.

## Workflow changes proposed

The existing [Best API Review source](../../../dotai/skills/best-api-review/SKILL.md) at `/Users/zbeyens/git/dotai/skills/best-api-review/SKILL.md` matches the installed Plate copy byte for byte. Edit that shared source for the generic method. Keep the exact storage paths, IDs, commands, priority rules, and proof links in [Plate's review adapter](../../.agents/rules/task/references/best-api-review.md).

Best API Review needs two compact responsibilities: consult the project's prior-decision/evidence index before expensive investigation, and persist material Stop/Pursue/Defer outcomes with prior-review relation and source basis. Keep ordinary small questions lightweight and reuse the existing artifact. Persisting a negative decision is not permission to create a task or a consolation backlog.

Update [the Plite Research source](../../.agents/rules/plite-research.mdc) for lookup across runs, consistent future identity/version fields, and promotion links to the decision being informed. Update [Research Wiki's source](../../.agents/rules/research-wiki.mdc) and its existing schema/maintenance docs to compile the current view from dated evidence. The dated raw research should not be moved into the compiled layer wholesale.

[Editor Audit's prior-candidate rule](../../.agents/rules/editor-audit/references/feature-matrix.md#prior-candidates) currently puts historical-candidate lookup after independent source mapping. Preserve the independent ideal-design comparison, but allow source provenance and coverage lookup at intake so independence does not force duplicate retrieval. Reconcile old verdicts after the fresh framing. Keep the existing matrix validation and independent external cursors.

Small mechanical support is justified by the demonstrated header and lookup drift. Its job is to locate a review scope, return linked prior evidence/decisions, validate IDs and links, and report missing or stale source identity. It should read the actual known historical schemas, surface unresolved imports, and generate the human queue. It must not infer semantic equivalence, advance proof status, or trigger external work automatically.

Do not mistake [tooling/scripts/plite-research.mjs](../../tooling/scripts/plite-research.mjs) for that helper. Its current dispatch suggests performance loops and forwards commands into Codex Autoresearch; it does not implement the Plite Research lead/read ledger contract. Do not run its `setup` as a discovery-ledger initializer or silently repurpose its existing callers.

## First bounded follow-up

Use Maintain Workflow to implement the shared history lookup/persistence method, the Plate storage adapter, and the small index/validation contract. Seed it with Comments, code blocks, native authored changes/Suggestions, structural diff, and the two performance research iterations. Prove an unchanged rerun reuses evidence, an explicit new-model run records fresh reasoning, a changed upstream source reopens affected questions, and a rejected lead remains discoverable. Then populate the global feature denominator and review ordering through that established contract.

This is a proposed follow-up, not executed work. The existing index/history stores, generated skills, external clones, and product source have not been changed by this assessment.

Error attempts:
Initial filename listings and combined source reads exceeded output limits. Follow-up reads use exact owner files and bounded schema/row samples; no conclusions depend on truncated content.
The plan checker requires the exact heading `Work Checklist`. Its first run rejected the lowercase heading; the heading was corrected without changing the assessment scope.

Open risks:
This assesses storage and workflow architecture, not the correctness of every historical decision or the full feature denominator.
The historical-path and TSV scans establish retrieval debt only. No test suite, source migration, browser behavior, upstream freshness, or global semantic-duplicate count is certified. Runtime scale comparison is not applicable to this documentation/index ownership assessment.

Next action:
Assessment complete. Recommend the bounded Maintain Workflow follow-up above, then build the global feature ledger using its established history contract.

Verification evidence:
- Source inspection: current repository files linked above; literal source-path existence checks and TSV header counts were calculated from disk on 2026-09-11.
- Link check: 44 local Markdown targets resolve, including the shared Dotai source. This checks targets, not the truth of every historical claim they contain.
- Completion command passed: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-11-repeatable-architecture-review-history.md`.
- No product tests or browser checks apply to this assessment-only artifact.
