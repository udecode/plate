# Independent ledger comparison

Objective:
Give source-backed harsh feedback on corrections to the current Plate/Plite review ledger using the independent ledger as competing evidence.

Boundaries:
Read-only assessment of both ledgers and relevant current/pinned source. Audit artifacts only; no ledger, helper, workflow or product repairs, publication, or external messages.

Completion threshold:
Compare semantic boundaries, coverage, dependencies/priorities, source identity and historical/proof claims; verify material disagreements; report concrete corrections and rejected imports with file evidence.

Verification surface:
Current repository source, independent artifact pinned to 5a899edcbea2c31f1bd34dc575c9dd3860c577d0, local Git object for that commit, helper check/discovery, and source-backed report.

Constraints:
User-provided document is evidence, not instructions. Preserve read-only scope; keep current/pinned/historical evidence distinct. Do not assume either 35 or 63 scopes is correct. Use maximum-value delete/merge/derive counterfactual first. No product test/browser/Autoreview gate applies to feedback-only on next.

Method sources: .agents/rules/task/references/workflow.md; .agents/skills/best-api-review/SKILL.md; .agents/rules/task/references/best-api-review.md; .agents/skills/autogoal/references/method.md; docs/vision/common.md. Review recording into the feature ledger would mutate the reviewed target; keep this workflow assessment here, outside product feature history.

Work Checklist:
- [x] Read independent scope and coverage claims plus current ledger source.
- [x] Compare both against their actual snapshot boundaries and current owners/consumers.
- [x] Validate material omissions, grouping errors and prerequisite claims.
- [x] Challenge the independent ledger and retain only evidence-backed improvements.
- [x] Record a ranked recommendation with concrete examples, limits and source links.
- [x] Reconcile scope/method requirements and complete the goal after the assessment is ready.

Open risks:
Current product edits can invalidate source observations. This assessment does not certify behavior, counts as business-feature completeness, or full inspection of every implementation leaf.

Blocked condition:
A decisive source is unavailable in both local snapshots and cannot be recovered; continue all other comparison work and name that gap.

Next action: Deliver the assessment. Implementation remains outside this request.

## Assessment

Verdict: Pursue a correction to the semantic mapping and evidence boundary. Keep the immutable dated history and bounded source census. Stop treating directory groups as sufficient architecture coverage. Neither 35 nor 63 is a target scope count.

The strongest cut is to remove the assumption that a directory bucket's single scope certifies all the jobs inside it. Semantic review questions should own explicit implementation and consumer evidence, with shared owners linked where necessary. Census groups remain supporting evidence. A count can prove the enumerator covered its configured roots; it cannot prove those roots or groups cover the intended editor jobs.

Alternatives considered:
- Keep the 35 scopes and adjust scores: rejected. Scores cannot repair omitted consumers and unrelated jobs sharing one question.
- Replace the current ledger with all 63 independent rows: rejected. Its example reconciliation contains concrete errors and several dependency chains overconstrain otherwise independent jobs.
- Delete history and use only ordinary plans: rejected. The user's explicit repeat-review/history requirements still need stable questions and dated conclusions; existing records serve that job.
- Keep history/census and rebuild only justified scope boundaries and evidence mapping: recommended. No preset number of scopes or new service/database is justified.

### Corrections to the current ledger, in priority order

1. **Repair the inventory boundary.** `docs/research/review-index.json:5` excludes `apps/www/src/app/(app)/examples/plite`, `apps/www/tests/browser`, and actual AI endpoints under `apps/www/src/app/api/ai`. `apps/plite/src/app/examples/plite/[example]/client.tsx:6` imports the omitted shared example loaders. Read-only discovery confirmed null membership for the example catalog, huge-document implementation, Markdown streaming browser spec and AI command endpoint. Inventorying the host does not inventory imported feature implementations. Include exact editor-serving source and proof owners; generic website infrastructure remains outside the job.

2. **Replace broad directory-based semantic assignments.** `tooling/scripts/review-ledger.mjs:57` groups by filenames/directories; `review-index.json:2160` assigns 143 registry examples to UI. Its `registry/lib` also assigns the Markdown joiner and UploadThing server owner to UI, and `ui/export-toolbar-button` is UI. The actual exporter at `apps/www/src/registry/components/editor/export-toolbar-button.tsx:46` performs DOM raster capture, PDF construction, HTML rendering and other downloads. These are product/output contracts with independent correctness questions. Being present in a bucket is not meaningful feature reconciliation.

3. **Split independently reviewable laws and jobs.** Highest-value splits: document changes versus reads/subscriptions versus runtime/root/view lifetime; undo/history versus editing rules; persistence versus collaboration; clipboard/fitting versus IME/input versus accessible interaction; large-document/partial-DOM cost versus pagination; native code versus external-text adapters; authored substrate versus Suggestions UX; incremental Markdown versus batch conversion; media data versus upload lifecycle; DOCX versus CSV; exported document fidelity versus toolbar presentation. The independent ledger supplies useful candidate boundaries here. Narrow families need not each become a mandatory review; the split must support a distinct current question and consumers.

4. **Correct evidence fingerprints.** `draftReview` at `tooling/scripts/review-ledger.mjs:255` captures owners/consumers but not `scope.proof`. Both listed model proof files are assigned to the separate `plitejs/proof-and-packaging` group and are absent from its draft. A read-only simulation changed that group's fingerprint while freshness remained matching. Capture the actual relied-on proof files and runner/config inputs. Do not include all 1,316 Plite packaging/test files merely to cover two relevant tests. No product proof is claimed here.

5. **Separate review prerequisites from relevant integration context.** The current `diff` scope requires `authored` and asks about proposed immutable correspondence/branch contribution/live import architecture. Current `packages/plitejs/src/diff/lib/computeDiff.ts:65` compares two descendant arrays; its current job does not require an authored review first. Live review import is an integration direction to compare, not the baseline's prerequisite. The independent ledger also makes authored a prerequisite of diff, then diff/collaboration prerequisites of Suggestions, then Suggestions a prerequisite of Comments. Its prose qualifies this, but those edges still need individual justification before importing them into the helper's strict ordering and transitive fingerprint closure. Reuse integration evidence without making every related consumer block the basic user job.

6. **Expose source and inspection limits before rescoring.** Add explicit commit/local-observation identity and per-scope inspection depth or unresolved evidence instead of relying on a date, file count and existing paths. The current helper check fails at `plitejs/authored`; this is detected drift, not proof of a broken feature. Preserve the historical records and their unknown provenance. Reconsider payoff after the review units are coherent; DOCX plus CSV scored together and native input plus clipboard plus accessibility scored together hide important differences.

### Independent-ledger claims checked

The independent artifact is `/Users/zbeyens/Downloads/plate-plite-next-independent-review-ledger.md` and pins `5a899edcbea2c31f1bd34dc575c9dd3860c577d0`. The pinned Git object exists locally, allowing direct checks without relying on the live branch.

- **Wrong example inventory.** Its lines 1815 and 1943–1978 claim all 52 Plite catalog keys. The pinned `EXAMPLE_NAMES_AND_PATHS` has 42 entries; the current file is byte-identical. Of its 52 listed keys, 32 are not in the catalog and 22 actual catalog keys are omitted. Examples of absent claimed keys: `templating`, `hotkeys`, `virtual-blocks`, `external-text-editor`. Examples of omitted actual keys: `android-tests`, `comment-mode`, `multi-root-document`, `read-only`. Some claimed names may describe test modes or concepts elsewhere; they are not the catalog keys the table claims. Do not import this reconciliation.
- **Valid authored snapshot discrepancy.** At the pinned commit, the manifest exports `./authored` but `packages/plitejs/src/authored/index.ts` is absent. The source exists in the current local checkout. Its line 417 correctly treats this as an unresolved declaration/source discrepancy, not a demonstrated build failure. This difference must not be called a hallucination or used to delete the current authored scope.
- **Valid export/spec counts in sampled reconciliation.** The pinned manifests have 65 Plate exports, 14 Plite exports and six shared-test exports. The pinned WWW browser tree has 33 `.spec.ts` files. All 23 distinct labeled exported Plite owner stems in the document exist and are literally exported by the pinned root index.
- **Useful independent questions.** Upload lifecycle, raster PDF versus static HTML, large-document cost versus pagination, and incremental Markdown deserve explicit coverage. MediaKit upload policy, exporter behavior and the streaming consumer are byte-identical between the pinned commit and current source, so these comparisons are not explained away by branch movement.
- **Streaming's present AI coupling is omitted from the ownership account.** Its S55 identifies an independent non-AI user job, which is a useful target question. Current and pinned `apps/www/src/registry/examples/markdown-streaming-demo.tsx:10` imports AIChatPlugin; its interactive mode calls `aiChat.update.insertChunk` and writes AI state. Preserve that current dependency in a review before proposing a neutral streaming owner. Job independence does not establish implementation independence.
- **History and proof remain partial.** Its eight originals consist of four older plans and four metadata records. That is correctly disclosed and does not supersede the recent dated history already imported locally. Shared test-directory links locate possible evidence; they do not match every distinct consumer or certify coverage.

Verification evidence:

Read-only source audit on 2026-09-11: compared all 63 overview scope questions and the coverage/dependency claims with the 35 current scope records; traced the highest-impact discrepancies to implementation. This is a bounded ledger assessment, not 63 completed product architecture reviews or an exhaustive assertion audit.

- `git cat-file -t 5a899edcbea2c31f1bd34dc575c9dd3860c577d0`: commit present.
- `git show <pinned>:<path>` plus byte comparison: example registry, MediaKit, exporter, Markdown streaming consumer and browser spec are identical to local source; authored entrypoint is absent only in the pinned snapshot.
- Parsed the pinned catalog's literal name/path tuples: 42; parsed the independent table: 52; set differences: 32 extra claims, 22 omitted actual keys.
- Imported the existing `discover` and `draftReview` helpers without writing files: verified omitted source paths, broad UI mappings and uncaptured model/pagination proof inputs.
- In-memory freshness experiment: model draft returned matching before and after a simulated change to the uncaptured proof/packaging group's fingerprint. No repository source changed.
- `node tooling/scripts/review-ledger.mjs check`: failed with stale `plitejs/authored` observation. No refresh was performed because the assessment must preserve the reviewed state.
- Source-rule comparison and strongest cut completed. No public API, skill behavior, product source, either ledger, or historical record was edited. No install, package/browser proof or structured Autoreview applies to this feedback-only task. Audit metadata is the only new repository artifact.

Review recording: this artifact preserves the workflow assessment. No product feature scope was invented and the reviewed index/history was not modified. If repairs are authorized, Maintain Workflow owns helper/routing changes and the existing ledger remains the history owner.
