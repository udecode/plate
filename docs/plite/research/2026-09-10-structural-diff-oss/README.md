# Structural diff OSS validation

**Pursue the revised plan.** Keep ordinary schema-valid JSON and the native change/identity owners. Replace annotated diff nodes with immutable span correspondence and composable effects. Preserve every branch contribution in three-way comparisons; use pure resolution for detached merging and the native authored command for live review import.

The [amended plan](../../../plans/2026-09-10-structural-document-diff.md) has **43 production acceptance families**, including **14 structural quality scenarios**. This is a supported design direction, not proof of production quality.

## Question, scope and result

Question: does the plan choose the strongest durable model and cover the required structural comparison jobs when challenged by GitHub OSS?

Scope: structural matchers, JSON/rich-text delta engines, three-way merge/review and native identity. Initial gaps were branch-preserving redlining, granularity/count/filter semantics and readable-output proof. All four areas are captured as concrete acceptance requirements.

Stop rule: each material design lane has source evidence or a named gap; selected repositories have dispositions; retained leads have owner/proof packets. The focused shard meets this rule. Expected promotion owners remain Best API for public shape, Plite Plan for adoption, and Verify Plate/Testing/Benchmark for implementation evidence.

Exclusions: product implementation, prerequisite execution, proprietary code, source copying, dependency installation, external messages/publication, exhaustive GitHub issue closure and whole-editor audits.

| Denominator | Result |
| --- | ---: |
| Unique repository hits from three GitHub discovery queries | 29 |
| Registered repositories, including direct selected sources | 39 |
| Repositories inspected in focused local source slices | 13 |
| Remaining repositories screened/excluded from deep reading | 26 |
| Local source read slices / distinct files | 31 / 29 |
| Issue candidates / issue discussions read / PR bodies read | 10 / 3 / 0 |
| Kept unique leads | 11 |
| Duplicate leads merged | 6 |
| Rejected approaches | 9 |
| Promoted plan/test/benchmark packets | 11 |
| Structural quality scenarios specified | 14 |
| Source-pinned executable upstream witnesses | 7 / 7 passed |
| Production acceptance families certified by this research | 0 / 43 |

Repository counts include discovery, primary web leads and named local sources; 39 is not the number of search hits. Source inspection was bounded, not an exhaustive audit. One Mergiraf documentation page supplements the retained local source and issue records.

## Decisive changes

- A span can move, split/join, change wrappers and contain text/property edits together. One exclusive group-kind tag is insufficient.
- Three-way review keeps unilateral deletions, clean branch contributions, identical edits and all conflict alternatives. A merged-only result loses required review information.
- Comparison is immutable. Proposed resolveComparison derives a detached merge target from that fixed result; native proposal creation adds live-baseline/frontier validation and atomic publication.
- Logical structure, combined table changes, readable highlight masks, native concurrent moves and missing-history behavior have explicit proof rows.

[Shard findings and alternatives](shards/001-structural-diff.md) explain why drop-in AST/JSON diff engines, a mandatory public CRDT graph and a separate diff manager do not earn ownership of the full job. [Quality scenarios](quality-scenarios.md) map comparison requirements and 14 fixture recipes. [Packets](packets.md) retain the adoption and keep/failure gate for every lead.

## Top promoted leads

| Lead key | Grade | Owner | Proof command / boundary |
| --- | --- | --- | --- |
| diff:content-continuity:composite-effects | A | Best API / Plite Plan | future: bun test packages/plitejs/src/diff; extend current native change/schema tests for F36 |
| diff:three-way-review:branch-contributions | A | Best API / native authored | bun docs/plite/research/2026-09-10-structural-diff-oss/sources/semantic-probe.mjs (upstream witness only); future: authored/diff production cases |
| diff:readable-output:quality-corpus | A | Verify Plate / Benchmark | future: pnpm --filter plite test:plite-browser:chromium --grep 'structural diff'; requires registered F37-F40 cases |

Top rejected approaches are node-bijection as the entire span model, merge-only review output, and fuzzy/index patching as native import authority. Reopen conditions and merged duplicates are in the [rejected ledger](rejected-ledger.tsv). All scores rank lead investigation value; they do not score architectures.

## Verification and handoff

[Source identities](sources/source-identities.json) pin the 13 inspected repository commits and all 31 source slices. Every inspected file matched its recorded commit. Reused clones are not asserted to be latest; activity metadata is separate. [Runtime identities](sources/runtime-identities.json) pin all 28 source files used by the executable upstream witnesses.

[semantic-probe.json](sources/semantic-probe.json) records seven passing witnesses for identified move+edit, missing array identity, stale index application, merged-output provenance loss, unilateral deletion, three-way conflict alternatives and fuzzy application on a different baseline. Some witnesses verify expected library behavior that is unsuitable for native import; they are not accusations of library defects.

~~~sh
bun docs/plite/research/2026-09-10-structural-diff-oss/sources/semantic-probe.mjs
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-10-structural-document-diff.md
~~~

[Final artifact verification](verification.json) records ledger/link checks, 43 acceptance rows, 14 scenario rows, source/probe fingerprints and final artifact hashes. No Java/Rust suite, production Plite case or native device/browser behavior was verified.

Changed list: the existing structural diff plan and this research directory. No product package, public documentation, shared skill, Vision, Git publication or external message changed.

Workflow slowdowns: truncated broad web output, two incorrect source-path guesses, a CommonJS harness export mismatch and a report variable typo. Bounded re-reads, file inventories and harness/report corrections resolved them. No skill repair was needed: these were isolated execution errors, not repeated duplicate-heavy research.

Needs user attention: none for research. Production remains ordered after the separately owned native authored-changes plan.

Next search shard: **none**. Every material lane has sufficient evidence to select a target and concrete future proof. Reopen for a failed quality/native invariant or a materially stronger implementation. No independent-agent/model-family review is claimed.

Status: research and specification complete. Next owner: `$plite-plan docs/plans/2026-09-10-structural-document-diff.md`, starting at S0 only after native authored changes completes. Its first action is to reconcile the actual native API and replay continuity before implementing comparison.
