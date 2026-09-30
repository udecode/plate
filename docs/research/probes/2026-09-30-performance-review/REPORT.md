# Performance evidence and measurement

**Verdict: Pursue.** Cut the use of cached success labels as evidence of current
correctness or performance. Validate receipts before applying an explicitly
identified, frozen acceptance policy. Consolidate duplicate active target
definitions and S5 evaluator code at their existing owners.

This is a measurement architecture review. It authorizes no product repair,
benchmark campaign, public profiling API or new benchmark platform.

## Job and hard laws

A developer or CI consumer needs to know whether the measured operation did the
right work, whether its observations apply to the selected source and contract,
and whether they meet the criterion for the claim being made.

From first principles, the flow is receipt, validated observations, then
assessment against a frozen policy. Diagnosis and presentation consume those
facts. They cannot fill in missing observations or change the original policy.

- Preserve action, fixture, source, build, host, endpoint, sample and metric
  identity. Different clocks cannot silently become one comparison metric.
- Correct output and complete required observations precede acceptance.
  Missing evidence is not a fast measurement or a measured regression.
- Keep correctness, current-source eligibility, budget, adoption materiality,
  variability and diagnostic attribution distinct.
- Preserve failed observations, original policies and historical receipts.
  Completion of an experiment is not successful adoption or a met budget.
- Keep headless work, trusted browser interaction, sampled profiles, memory,
  compiler/build work and coverage declarations in their own domains.
- Keep measurement private unless a separate current user job earns a public API.

Redesign From First Principles changes the target from another result wrapper
to executable admission and assessment at the existing owners. Benchmark's
measurement method supplies the frozen-policy and paired-evidence laws.
Investigation stays read-only. The throughput checkpoint is not applicable.

## Coverage and dispositions

Six architecture units were selected and reviewed; all six have a disposition.
There are zero unassigned units. The registry census contains 55 executable
targets and 22 artifact definitions, with 17 shared IDs. Those counts describe
the control surface, not 60 deeply reviewed workloads.

Excluded jobs are runtime optimization adoption, an exhaustive fixture/workload
audit and fresh physical-device or browser coverage. Search remains deferred.
The Evidence Kit dependency is unavailable locally, so its CLI discovery
behavior remains an explicit gap within the registry unit.

| Unit | Disposition | Why and owner |
| --- | --- | --- |
| U1. Active target and command authority | Merge overlapping active control fields. Keep artifact adapters, research taxonomy and presentation metadata. | `benchmarks/targets/slate-v2.json` already owns executable target decisions. The lab registry duplicates commands, paths and membership. One concrete lab recipe references the absent `packages/slate-react` and `scripts/benchmarks/browser/react/rerender-breadth.tsx`; the target recipe points at the current donor path. All 17 shared command strings differ, but lexical difference alone does not establish semantic drift. |
| U2. Receipt and current-source admission | Change the existing loader boundary. | `benchmarks/editor/src/index.mjs` admits metric rows without reconciling recorded inputs. Preserve their historical measurements, but do not count them as current eligible proof. Bind a receipt to its measured contract instead of attaching today's command to an older ID/path match. |
| U3. Clocks, samples and correctness observations | Keep distinct metric domains; repair missing-clock handling and required-observation validation. | The code browser runner substitutes `performance.now()` after input when its `beforeinput` clock is absent. S5 can compare sampled parse/transaction time against trace publish-task time. Neither fallback establishes the original endpoint. Quantile arithmetic can share a small helper where domains agree; signed deltas and memory need their own validation. |
| U4. Frozen acceptance and diagnostic policy | Merge active S5 evaluator code; separate its validity, no-regression, work-gain and attribution judgments. | Wrong text and missing observations can pass the current evaluator. The two evaluator copies differ only in the profile-ratio upper bound, 1.20 versus 1.25. Preserve those as different recorded policies; neither is calibrated by this review. Keep external-text's conservative exit policy and Markdown's separate absolute/adoption verdicts. |
| U5. Persistence, history, health and presentation | Reuse atomic persistence; preserve observations before strict validation; derive eligible coverage and assessments from admitted facts. | Plugin-graph throws on a strict budget before writing its result. Schema architecture already writes measured facts before validating. Health's inventory, age and next-action job is useful but is not a performance gate. The landing renderer prefers saved history over current target definitions without checking their binding. |
| U6. Runtime instrumentation | Keep the existing private core/React hooks and opt-in diagnostic consumers. Stop a public profiling redesign. | `profiling.ts` and `render-profiler.ts` have real internal counter/attribution callers and no corresponding public package export. Their current overhead is not measured here. A new plugin, namespace or profiling package has no demonstrated independent job. |

The consumer census includes the target CLI and Autoresearch setup, target
contracts and CI, the lab's aggregation and health, comparison and internal
renderers, the landing index, standalone strict runners, and the S5 streaming
assessments. Current return shapes include scalar timings, distributions,
threshold records, ratios, completeness wrappers and readiness rows. Their
different jobs do not justify a universal row schema.

## Reproduced defects

Run the retained probe from the repository root:

```sh
node docs/research/probes/2026-09-30-performance-review/reproduce.mjs
```

[RESULTS.json](RESULTS.json) preserves the observations and the tested S5
summarizer hash. The probe uses synthetic receipts and temporary files, calls
the actual evaluator and exported aggregate helpers, and performs no workload
or browser measurement.

| Probe | Observed result | Consequence |
| --- | --- | --- |
| Valid three-pair control | `pass` | The arrangements exercise the real acceptance path. |
| Candidate text differs | `pass`, `finalTextsMatch: false` | Output equality is reported but omitted from acceptance. |
| All final text hashes absent | `pass`, `finalTextsMatch: true` | Equal nulls are treated as proof of output equality. |
| Candidate final clock absent | `pass`, `finalOk: true`; serialized candidate time is null | Filtering leaves an empty set and `Math.max` returns negative infinity. |
| Baseline profile work versus candidate trace work | `pass` | The operands have different meanings despite passing profile validation. |
| Threshold says passed, actual 100 ms, limit 1 ms | Aggregate emits `ok` | The threshold collector trusts cached `passed`. |
| Workload has no artifacts or adapters | Both library coverage rows emit `ok` | Coverage declarations are counted as measured coverage. |
| Existing `core-node-transforms` artifact | 6 of 7 recorded inputs mismatch; all 10 emitted rows are `ok` | Its observations cannot establish current-source performance. |
| Existing `collab-readiness` artifact | 7 of 7 recorded inputs mismatch; all 64 emitted rows are `ok` | The same current-source admission gap exists in another family. |
| Older ID/path receipt plus changed command and absent artifact | Displays the changed command with `recorded` status | Historical availability is retained, but original contract attribution is lost. |

The two existing artifacts establish a current source mismatch, not that their
original runs measured the wrong checkout or that their historical numbers are
false. Other artifacts without fingerprints establish unknown identity.
Likewise, these synthetic S5 counterexamples do not establish wrong output in
the retained production browser runs.

Two secondary helper probes found acceptance of sparse samples and aliasing of
the caller's sample array. No current caller exercising either input was found.
They belong in bounded boundary repair, not the headline justification.

Source inspection also found the code runner's missing input-clock fallback and
strict runners that throw before persisting failed observations. No native
input or failing workload was executed to reproduce those paths.

## History reconciled

- Retain `2026-09-07-performance-iteration-1`. Its 34 conditional experiments,
  endpoint caveats and source limits remain research evidence, not aggregate
  editor superiority or current adoption proof.
- Retain `2026-09-09-performance-iteration-2`. Its 26 independent dossiers and
  65-row prior-candidate reconciliation remain the starting point. Compiler,
  virtualization and full-DOM results keep their distinct contracts.
- Retain the limits of
  `2026-09-18-recovered-2026-09-07-editor-performance-research`. The recovery
  record is historical and unbound; its date and completion claim do not
  reconstruct original runtime proof.
- The September 10 execution resolves eight Pursue dossiers with five retained
  local changes and three no-adoption outcomes. The follow-through rejects six
  further interventions and preserves four absolute budget gaps. These accounts
  prevent rerunning already rejected candidates merely to create a source diff.
  Their other-scope or missing execution bindings are not repaired retroactively
  by this review.
- Retain the September 30 static-preview and content-root outcomes in their
  original scopes. The content-root work claims no speedup, while its reused
  summarizer still requires 20% and 100 ms work savings. The write-up explicitly
  applies no-regression checks instead. Six complete cells have passing
  latency/text checks; two AI-rich cells retain inconclusive profile attribution.
  The earlier 1.25 profile-guard analysis remains distinct from the 1.20 policy.

This review reopens executable evidence admission and assessment ownership.
It does not reopen the parser, static view, content-root or candidate-portfolio
architecture without contrary evidence.

## Alternatives and next owner

| Alternative | Decision |
| --- | --- |
| Keep the machinery and explain anomalies in prose | Reject. Concrete false-positive admission and verdict paths remain executable. |
| One new benchmark platform, result schema or public profiler | Reject. The independent measurement domains and private consumers do not pay for it. |
| Delete the lab registry, research catalogs and every historical renderer | Reject the blanket cut. Artifact adapters, original evidence and comparison presentation have independent jobs. Cut duplicated active control fields. |
| Canonical active control, private receipt admission and policy evaluation at existing owners | Pursue. It removes duplicate authority and prevents bad or ineligible observations from becoming a passing assessment. |
| Rerun every historical workload or rewrite the runtime | Defer outside this review. No measured runtime target has earned that scope. |

The remaining job couples ownership, private contracts, consumer adoption and
proof. Use one Task design plan:

```text
$task design plan performance-evidence: consolidate active target authority;
validate receipt identity, metric completeness and correctness before assessment;
separate frozen acceptance policies from observations and diagnosis; migrate
aggregate, health, report and S5 consumers; preserve original failed and historical
evidence, and repair missing-clock and write-before-validation paths.
```

The plan must prove its counterexamples cannot pass and its valid controls keep
their original policies. A fresh source-matched native code-input run is needed
for the clock repair. Representative receipt replay can prove evaluator and
report adoption without starting another full editor benchmark campaign.
Any new timing claim still needs its own paired Benchmark proof.

## Proof and limits

The retained probe ran successfully. `bench-targets check` validates 55 target
definitions. Saved history has 53 targets and differs from regeneration.
Read-only rich-text viewer and landing-index checks report stale generated
files. These are recorded maintenance failures, not newly measured regressions.

The review uses current source inspection, two bounded independent read-only
partitions and the lead's retained reproductions. It contains no new workload,
browser, build, timing, threshold-calibration or physical-device proof. No
product or benchmark implementation changed. Adoption of the assessed target
remains unestablished until its own execution and proof are recorded.

`node --check` passes for the retained probe. The scoped `pnpm lint:fix` command
finds no targets because Oxfmt and Oxlint explicitly exclude `docs/**`; it
supplies no lint pass. Research JSON uses the ledger's two-space format.
