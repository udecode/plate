# Plate and pstack skills audit

Date: 2026-09-05. Read-only review. Final observed doctrine: 153.

The setup is about **7/10 overall**. The specialized engineering methods are strong. Runtime integration and proportionality are the weak parts. Adding more skills is not the next improvement.

The earlier 97/100 architecture score was too generous as a description of the running setup. It rated a preferred design using editorial judgments. It did not establish reliable execution, lower cost or better outcomes.

## What was reviewed

- All **94 installed Plate skill entries**: 38 project-owned and 56 shared/vendor installations.
- All **45 upstream pstack skills**, including the five not installed as separate pstack skills.
- All 11 pstack guide Markdown files, the four linked X post bodies and relevant replies, and the verification example README, skill entry and all 35 feature/index Markdown files. Embedded social-post images were not inspected.
- Current source routing, the Codex adapter, verification inventories, generated-resource checks and global/project naming collisions.

This builds on the preceding full readings. Final hashes match those readings for 84 project entries; the 10 changed entries were inspected, along with selected higher-risk unchanged methods. All 102 previously read upstream method files still match. This is **not** a claim that every unchanged file or every helper was freshly reread or executed. Coverage and hashes are recorded in [the evidence directory](/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-09-05-plate-pstack-audit/read-progress.json). Unrelated global plugin catalogs are outside this review; global overlaps affecting Plate were checked.

The final entrypoints contain about 129,000 whitespace-delimited words, before supporting references. That measures available instruction volume, not what every task automatically loads. Repeated mandatory routing and large entrypoints matter more than the raw number of skill folders.

## Setup score

These are integer engineering judgments, not measured productivity or model benchmarks. The overall score is the equal-weight average of these five dimensions. Individual skill scores below assess a different question: the usefulness and fitness of each installed method.

| Dimension | Score / 10 | Basis |
| --- | ---: | --- |
| Engineering methods | 9 | Strong API, native behavior, causal performance and provenance methods; substantial executable validation. |
| Ownership | 8 | Task and the technical owners are mostly clear; three remaining wrappers can be absorbed. |
| Runtime integration | 5 | Active sequential policy blocks independent workers; stale tool and platform instructions remain. |
| Verification readiness | 7 | Strong existing runners and proof contracts; route-to-journey discovery still requires reconstruction. |
| Proportionality | 6 | Simple explanations, modest retrospectives and long-run handoffs can trigger excessive machinery. |
| **Overall** | **7** | Useful and materially improved; still needs integration work and outcome evidence. |

## Findings, in priority order

### 1. The effective setup prohibits the parallel work its methods prescribe

The active [global tool map](/Users/zbeyens/.codex/AGENTS.md:19) maps subagents and parallel work to sequential execution in the main task. Arena, Swarm, Interrogate, Architect and parts of How expect independent workers. [Show Me Your Work](/Users/zbeyens/git/plate-2/.agents/skills/show-me-your-work/SKILL.md:68) requires a reviewer from a different model family.

The [Codex adapter](/Users/zbeyens/git/plate-2/.agents/skills/poteto-mode/references/codex-runtime.md:29) correctly respects available models and reports missing independence. That prevents false claims, but it cannot provide the benefit of independent candidates. This task exposes only OpenAI model choices; different provider/family review cannot be assumed. Missing `.agents/pstack-models.md` is **not** a defect: inheriting the parent is a valid supported default.

**Recommendation:** trace and repair the generator/source of the managed global tool map, then align the project adapter around bounded native delegation where it adds value. Keep explicit scope, task-creation and checkout authority. Preserve independent prompts and artifact review. Sequential analysis should be labelled as such. Global changes require their own scope; none were made here.

### 2. Merge three remaining wrappers into their existing owners

| Current skill | Target | What must survive |
| --- | --- | --- |
| Auto | Task, as its autonomous mode/reference | Argument grammar, adaptive checkpoint reconciliation, scope, deadlines, keep/revert/quarantine and domain routing. |
| Performance | Benchmark, as its design/review mode/reference | All fourteen detailed review leaves and workload-specific reasoning, without forcing measurement during a read-only design review. |
| Testing Review | Testing, as its periodic audit mode/reference | Fresh coverage and timing, test-value ranking, stale-suite investigation, locked roadmap and audit-only authority. |

[Auto](/Users/zbeyens/git/plate-2/.agents/skills/auto/SKILL.md:44) uses Task's plan, authority, stop rules and every technical owner. Its remaining checkpoint logic is a recipe Task can own. Performance already declares Benchmark the execution owner. Testing Review already obtains its test-value rules from Testing. Their methods are worthwhile; separate discovery names add little.

Do not collapse Best API, Plate Plan, Plite Plan, Plate UI, Plate Plugin Creator, Regression, Benchmark, Maintainer or Release Lanes into a generic master skill. They encode different current jobs and hard laws. Keep the short principle leaves conditional; their count is not the main source of overhead.

### 3. Compile one coherent Codex method instead of making adapters fight copied instructions

The adapter is sensible, but active port bodies still contain Cursor tool names, cloud assumptions, provider defaults and platform paths. [Poteto Mode](/Users/zbeyens/git/plate-2/.agents/skills/poteto-mode/SKILL.md:137) still says the PR playbook runs at the end of every other playbook. Local authority prevents automatic publication, so this is an instruction conflict rather than evidence that publication occurred.

Other concrete defects:

- [Orchestrator](/Users/zbeyens/git/plate-2/.agents/skills/orchestrator/SKILL.md:97) names unavailable `codex_app.set_thread_pinned`. Current tools expose `move_thread_to_sidebar_section` and `wait_threads`; its coordination method should use those supported contracts.
- [Recall](/Users/zbeyens/git/plate-2/.agents/skills/recall/SKILL.md:18) routes preference mining to uninstalled `automate-me`. Maintain Workflow is the existing source-maintenance route.
- [TDD](/Users/zbeyens/git/plate-2/.agents/skills/tdd/SKILL.md:170) repeatedly asks for user confirmation and plan approval even when the active request already supplies the decisions and authority.
- [Resolve PR Feedback](/Users/zbeyens/git/plate-2/.agents/skills/resolve-pr-feedback/SKILL.md:35) still calls ordinary mutable work an Autogoal dependency. The shared source should distinguish file-plan helpers from explicitly requested native continuation.
- [Video Transcripts](/Users/zbeyens/git/plate-2/.agents/skills/video-transcripts/SKILL.md:62) teaches tracker posting without stating message authority in that shared workflow. Current higher-priority rules still prohibit unauthorized posting.
- The [Autogoal composition helper](/Users/zbeyens/git/plate-2/.agents/skills/autogoal/scripts/create-goal-scratchpad.mjs:377) returns existing metadata unchanged. A template can receive a pack while retaining stale pack metadata. The previous local template correction avoids that case for current callers; the reusable helper still needs repair.

**Recommendation:** repair owned Dotai ports and current-project adaptations, preserving complete methods, worker prompts and examples. Keep original platform text as provenance instead of contradictory active directions. Do not hand-edit protected vendor skills or generated mirrors. Add focused routing/tool-contract checks for these observed failures.

### 4. Apply the verification research more completely to existing inventories

The most valuable upstream idea is a maintained loop with deterministic setup, controllable user actions, diagnostics, expected results, evidence and cleanup. That is consistent across the [verification announcement](https://x.com/poteto/status/2082874054483255805), [setup advice](https://x.com/poteto/status/2093414407196012990), [long-form guide](https://x.com/poteto/status/2094457600259842065) and [verification example](https://github.com/poteto/verification-skill-example/tree/d5abe70d0d8c671672b6cef4069363f26c488feb).

Verify Plate already has real runner ownership, exact-route requirements, native-input limits and final-evidence rules. Its [inventory table](/Users/zbeyens/git/plate-2/.agents/skills/verify-plate/SKILL.md:21) asks each run to derive user entry, setup, action, expected effect and gotchas from source and tests. The [Plite example registry](</Users/zbeyens/git/plate-2/apps/www/src/app/(app)/examples/plite/plite-example-registry.ts:1>) stores name/path tuples. This is an inventory, not a readily executable per-feature journey contract. Existing browser tests supply real proof; the gap is discoverability and repeatability, not an absence of tests.

**Recommendation:** extend the existing canonical example/test inventory, or adjacent metadata owned by it, with stable links to fixture prerequisites, driving recipes, expected visible behavior, important recovery cases and existing proof. Do not create a second feature map or duplicate test registry. Reuse current browser controls and runners. Make their readiness/doctor result easy to obtain through the existing tooling.

The [command reference](/Users/zbeyens/git/plate-2/.agents/rules/verify-plate/references/commands.md:133) also repeats shell-quoting lessons and includes research-ledger parsing. Move general command execution lessons to their shared owner and research instructions to research owners; encode repeated failure prevention in existing helpers where practical. Keep the actual runner and native-proof contracts.

The Atlas example is fictional and omits its driver. It demonstrates good journey documentation, not runnable proof that our setup or a different model performs better. No complete all-inventory live maintenance pass was demonstrated in this audit.

### 5. Reduce automatic ceremony and finish prose ownership at the call sites

[Reflect](/Users/zbeyens/git/plate-2/.agents/skills/reflect/SKILL.md:15) treats five tool calls as a complex-task trigger for three reviewers and a synthesizer. [How's simple path](/Users/zbeyens/git/plate-2/.agents/skills/how/SKILL.md:64) still delegates. Those triggers measure activity rather than uncertainty or consequence.

Keep retrospectives for a reusable failure, a consequential completed run or an explicit request. Answer straightforward source questions directly. Reserve panels for decisions that benefit from independent alternatives. Show Me Your Work should link existing receipts and remain small.

The writing consolidation was the right call: **Technical Writing is the prose owner**, with Plate's shadcn-style public-documentation mechanics in [Task's docs reference](/Users/zbeyens/git/plate-2/.agents/rules/task/references/docs.md). [Teach](/Users/zbeyens/git/plate-2/.agents/skills/teach/SKILL.md:20) still adds comma caps and rigid presentation rules; Poteto Mode also retains separate style rules. Move general prose decisions to Technical Writing and keep only task-specific explanation requirements in Teach.

Global Unslop remains installed and discoverable. Eleven project skill names also exist globally; seven have different contents. Some differences are legitimate project adaptations. The finding is ambiguous effective discovery and remaining prose overlap, not that all seven copies are stale. A separately scoped global cleanup should install the canonical Technical Writing owner, retire global Unslop and make project precedence explicit.

## What the original research does and does not establish

- `/goal` supplies a stopping/continuation contract; Poteto Mode supplies engineering methods. Task adds the project's scope, adoption, proof and delivery rules. Those jobs are compatible when each has one owner. The distinction also appears in the [linked discussion](https://x.com/damonchen/status/2092428977495503104).
- The [model setup guide](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/docs/guide/01-setup.md#pick-your-models) supports optional role choices and inherited defaults. Model names in examples do not establish availability in this runtime.
- The [create](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/create-verification-skill/SKILL.md) and [maintain](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/maintain-verification-skill/SKILL.md) methods are worth keeping in full. Bootstrap and drift maintenance have different jobs. They should both operate on Verify Plate and its existing inventory.
- High throughput and quality claims in the posts are author reports without a controlled comparison. They do not establish that a particular model, cloud agent or catalog caused the reported result. The useful engineering procedures can be adopted without accepting that causal claim.
- Keep `automate-me`, `bro` and `make-bot-ui` uninstalled here. Reuse existing TDD and merged Technical Writing instead of adding second TDD/Unslop installations.

## Agent-native review: needs work

| User action | Route and owner | Evidence | Status |
| --- | --- | --- | --- |
| Compare independent designs | Arena / Architect; Dotai ports and runtime adapter | Active global map requires sequential execution | Gap: independence unavailable under current policy |
| Coordinate persistent tasks | Orchestrator; shared skill and Codex app tools | Obsolete pin tool; supported move/wait tools are available | Gap: repair tool routing |
| Replay a selected user journey | Verify Plate; existing registry and browser tests | Real proof owners exist; prerequisites/actions must be reconstructed | Gap: improve discovery; no all-feature live proof claimed |
| Write and preserve Plate prose | Technical Writing; shared source and Task docs reference | One project prose owner; residual caller/global overlap identified | Route present; discovery cleanup remains |
| Regenerate and validate doctrine | Project source rules and owned sync/version scripts | Final resource and version checks pass | Pass for inspected source/mirror state |
| Publish or release | Task authority and Release Lanes | Explicit authority remains required by current policy | Outside this audit's execution scope |

Keep the existing source boundaries, inherited model default and distinct technical owners. Reject a second feature map, universal review panel, mandatory browser launch for prose-only work, or claims that sequential analysis supplies independent review.

## Current verification and limits

| Check | Final observed result |
| --- | --- |
| Pstack preservation across both installed mirrors | Pass: 40 ports, 99 preserved upstream files, zero errors. |
| Required generated resources | Pass: exact. |
| Doctrine validation | Pass: version 153, valid registry. |
| Full score coverage | 94 unique Plate rows and 45 unique pstack rows; no missing names. |
| Runtime tool inspection | Current pin/move and wait tools exist; old Orchestrator pin name is absent. |
| Application behavior, all-feature maintenance and model outcome comparison | Not run in this read-only skills audit. |

During the review, a source edit temporarily made Plate UI mirrors and the doctrine fingerprint stale. Other work regenerated the affected skills and advanced doctrine to 153. The relevant changes were inspected and checks rerun; the final state passes. This audit changed only its report and evidence artifacts. Historical test receipts were not represented as fresh test runs. See [check results](/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-09-05-plate-pstack-audit/checks.json).

The local pstack checkout matches remote HEAD `93b00b89ef425a9c1bac0d0b317dfc49c930ac99`; the example matches `d5abe70d0d8c671672b6cef4069363f26c488feb`. GitHub source was inspected in those local repositories. The X bodies were read through authenticated Chrome after public fetches failed.

## Recommended order

1. Resolve the delegation policy and stale tool contracts; repair contradictory shared teaching.
2. Absorb Auto, Performance and Testing Review intact into their owning modes. Keep meaningful technical owners separate.
3. Turn current verification inventories into easy-to-follow user journeys and improve existing readiness tooling.
4. Remove duplicate prose rules and, in separately authorized global scope, retire global Unslop.
5. Observe representative real work: simple copy, local repair, public API change, registry UI, native editor behavior, performance and release preparation. Track completion without rescue, elapsed time, token/tool cost, reruns and false completion. Use matched tasks and blind judging before claiming a model or method wins.

Shared repairs belong in Dotai and named current-project installations. The managed global tool map needs its actual generator/source owner. Broader propagation is a separate decision; configured candidate destinations include `better-convex`, `plate` and `informed-fe-v3`, whose current adaptations were not audited here.

## All Plate skills

Score assesses the **current installed fit**, including runtime constraints and redundancy. 9 means a strong, distinct method; 8 means keep with targeted refinement; 7 means useful with a material issue; 6 means merge or repair its execution; 5 and below means a poor current fit. A merge preserves the full method and supporting assets, not just its title. Principle leaves are scored as conditional references.

| Skill | Score / 10 | Decision | Reason |
| --- | ---: | --- | --- |
| [agent-native-reviewer](/Users/zbeyens/git/plate-2/.agents/skills/agent-native-reviewer/SKILL.md) | 8 | Keep | Distinct source, discovery, tool and proof audit; use on meaningful workflow changes, not every edit. |
| [architect](/Users/zbeyens/git/plate-2/.agents/skills/architect/SKILL.md) | 7 | Fix | Concrete competing designs are valuable; broad boundary triggers and mandatory Arena collide with sequential policy. |
| [architecture-cleanup](/Users/zbeyens/git/plate-2/.agents/skills/architecture-cleanup/SKILL.md) | 9 | Keep | Delete, merge and inline decisions grounded in actual ownership and caller cost; useful beyond formatting. |
| [arena](/Users/zbeyens/git/plate-2/.agents/skills/arena/SKILL.md) | 6 | Fix | Independent candidates and cross-judgment are strong; current sequential policy prevents the intended method. |
| [auto](/Users/zbeyens/git/plate-2/.agents/skills/auto/SKILL.md) | 6 | Merge into Task | Checkpoint reconciliation uses Task state, authority and all the same owners; preserve its full autonomous recipe under Task. |
| [autogoal](/Users/zbeyens/git/plate-2/.agents/skills/autogoal/SKILL.md) | 8 | Fix | Native continuation has a distinct job; keep explicit activation and repair the known composed-template metadata edge case. |
| [autoreview](/Users/zbeyens/git/plate-2/.agents/skills/autoreview/SKILL.md) | 7 | Keep conditional | Concrete review harness remains useful for authorized PR work; unavailable on next by project policy and no reason to load routinely. |
| [benchmark](/Users/zbeyens/git/plate-2/.agents/skills/benchmark/SKILL.md) | 9 | Keep | Matched comparisons, causal interventions, correctness and executable receipts justify a separate owner. |
| [best-api](/Users/zbeyens/git/plate-2/.agents/skills/best-api/SKILL.md) | 9 | Keep | Caller-first design, inference and negative proof encode real public API laws; substantial content earns conditional loading. |
| [blast-radius](/Users/zbeyens/git/plate-2/.agents/skills/blast-radius/SKILL.md) | 8 | Keep | Maps downstream callers, generated outputs and failure paths before acceptance; distinct from simply reading a diff. |
| [changeset](/Users/zbeyens/git/plate-2/.agents/skills/changeset/SKILL.md) | 8 | Keep | Package release baseline and user-impact rules differ from current-state docs and copied registry changes. |
| [clawsweeper](/Users/zbeyens/git/plate-2/.agents/skills/clawsweeper/SKILL.md) | 8 | Keep | Archive provenance, exact claim levels and private evidence handling are specialized; lengthy command details belong in references. |
| [create-verification-skill](/Users/zbeyens/git/plate-2/.agents/skills/create-verification-skill/SKILL.md) | 9 | Keep conditional | Bootstrap requires actual launch, doctor, one exercised feature and cleanup; use only to establish or repair the existing owner. |
| [diagnosing-bugs](/Users/zbeyens/git/plate-2/.agents/skills/diagnosing-bugs/SKILL.md) | 8 | Keep conditional | Reproduction, hypotheses and instrumentation strengthen Patch; keep it a method, not another lifecycle. |
| [editor-audit](/Users/zbeyens/git/plate-2/.agents/skills/editor-audit/SKILL.md) | 9 | Keep | Symmetric donor/local concept inventory and consistency validator prevent cherry-picked superiority claims. |
| [editor-test-harvester](/Users/zbeyens/git/plate-2/.agents/skills/editor-test-harvester/SKILL.md) | 9 | Keep | Harness separation, behavior-only transfer and current-owner proof prevent blind test copying. |
| [figure-it-out](/Users/zbeyens/git/plate-2/.agents/skills/figure-it-out/SKILL.md) | 7 | Fix | Useful bespoke method when narrow playbooks fail; heavy phases and independent-family checks need realistic runtime routing. |
| [github-issue-reporter](/Users/zbeyens/git/plate-2/.agents/skills/github-issue-reporter/SKILL.md) | 9 | Keep | Attachment identity, rendered evidence and uncertain-publication handling provide concrete capability beyond generic issue prose. |
| [gpt-pro](/Users/zbeyens/git/plate-2/.agents/skills/gpt-pro/SKILL.md) | 8 | Keep conditional | Self-contained evidence for an external reviewer is a separate job; preparation does not imply sending. |
| [grill-me](/Users/zbeyens/git/plate-2/.agents/skills/grill-me/SKILL.md) | 8 | Keep conditional | Useful for explicit preference discovery; source-answerable questions should still be investigated locally. |
| [grill-with-docs](/Users/zbeyens/git/plate-2/.agents/skills/grill-with-docs/SKILL.md) | 7 | Keep conditional | Domain-language interview has value; decisions must update existing doctrine rather than create a parallel design owner. |
| [hard-cut](/Users/zbeyens/git/plate-2/.agents/skills/hard-cut/SKILL.md) | 9 | Keep | Complete removal and caller cleanup are a real explicit job; retain non-obvious hard laws without compatibility wrappers. |
| [how](/Users/zbeyens/git/plate-2/.agents/skills/how/SKILL.md) | 7 | Fix | Grounded explanations and critic rubric are useful; even simple mode delegates, adding cost and conflicting with the active tool map. |
| [interrogate](/Users/zbeyens/git/plate-2/.agents/skills/interrogate/SKILL.md) | 6 | Fix | Independent adversarial review is useful; current sequential fallback cannot satisfy independence and must not masquerade as a panel. |
| [issue-harvester](/Users/zbeyens/git/plate-2/.agents/skills/issue-harvester/SKILL.md) | 9 | Keep | All-state issue accounting, provenance and incremental coverage have a distinct corpus job. |
| [maintain-verification-skill](/Users/zbeyens/git/plate-2/.agents/skills/maintain-verification-skill/SKILL.md) | 8 | Fix application | Strong source-plus-runtime maintenance method; Plate still needs stable user-journey recipes behind its route inventory. |
| [maintainer](/Users/zbeyens/git/plate-2/.agents/skills/maintainer/SKILL.md) | 9 | Keep | Public queue selection, private security boundaries and exact pushed-ref claims justify specialized ownership. |
| [no-comments](/Users/zbeyens/git/plate-2/.agents/skills/no-comments/SKILL.md) | 7 | Keep conditional | Preserves justified explanations and encodes constraints; named subagent and How/Why/Architect chain can be disproportionate. |
| [orchestrator](/Users/zbeyens/git/plate-2/.agents/skills/orchestrator/SKILL.md) | 5 | Fix | Persistent task coordination is distinct, but the installed tool list names obsolete pinning and omits native wait_threads. |
| [patch](/Users/zbeyens/git/plate-2/.agents/skills/patch/SKILL.md) | 8 | Keep | Exact reporter replay and native controls matter; load heavier evidence branches only for symptoms that need them. |
| [performance](/Users/zbeyens/git/plate-2/.agents/skills/performance/SKILL.md) | 6 | Merge into Benchmark | Keep all fourteen review leaves as conditional design/review methods under the existing measurement owner. |
| [plate-feature](/Users/zbeyens/git/plate-2/.agents/skills/plate-feature/SKILL.md) | 9 | Keep | Cross-package, copied UI, docs and release adoption requires one explicit feature manifest. |
| [plate-next](/Users/zbeyens/git/plate-2/.agents/skills/plate-next/SKILL.md) | 8 | Keep | Immutable doctrine and package fingerprints provide real maintenance checks; final doctrine version 153 and generated resources validate. |
| [plate-plan](/Users/zbeyens/git/plate-2/.agents/skills/plate-plan/SKILL.md) | 9 | Keep | Plate product composition and facade adoption are distinct from substrate implementation; preserve accepted target and proof contracts. |
| [plate-plugin-creator](/Users/zbeyens/git/plate-2/.agents/skills/plate-plugin-creator/SKILL.md) | 9 | Keep | Base-first authoring, inferred capability stages and host/consumer ownership are specialized implementation law. |
| [plate-review](/Users/zbeyens/git/plate-2/.agents/skills/plate-review/SKILL.md) | 8 | Keep | Read-only owner, lifetime and reachability scoring is distinct; numerical grades remain judgments, not performance measurements. |
| [plate-ui](/Users/zbeyens/git/plate-2/.agents/skills/plate-ui/SKILL.md) | 9 | Keep | Component and registry ownership are strong; final generated mirrors match the source and the redundant lint gate has been removed. |
| [plite-plan](/Users/zbeyens/git/plate-2/.agents/skills/plite-plan/SKILL.md) | 9 | Keep | Transactions, multi-view state, selection and native behavior need their own substrate adoption and proof owner. |
| [plite-research](/Users/zbeyens/git/plate-2/.agents/skills/plite-research/SKILL.md) | 8 | Keep | Discovery, rejection and promotion ledgers preserve negative evidence; do not turn every lead into implementation. |
| [poteto-mode](/Users/zbeyens/git/plate-2/.agents/skills/poteto-mode/SKILL.md) | 7 | Fix | Excellent shared method router; verbatim Cursor defaults and automatic-PR wording compete with the correct Codex adapter. |
| [principle-boundary-discipline](/Users/zbeyens/git/plate-2/.agents/skills/principle-boundary-discipline/SKILL.md) | 9 | Keep leaf | Validate at real untrusted boundaries; avoid repeating checks inside trusted typed code. |
| [principle-build-the-lever](/Users/zbeyens/git/plate-2/.agents/skills/principle-build-the-lever/SKILL.md) | 9 | Keep leaf | Repeated manual work should improve the owning command or mechanism; highly relevant to verification maintenance. |
| [principle-encode-lessons-in-structure](/Users/zbeyens/git/plate-2/.agents/skills/principle-encode-lessons-in-structure/SKILL.md) | 9 | Keep leaf | Turn recurring failures into types, helpers or checks instead of another paragraph of instructions. |
| [principle-exhaust-the-design-space](/Users/zbeyens/git/plate-2/.agents/skills/principle-exhaust-the-design-space/SKILL.md) | 8 | Keep leaf | Real alternatives improve consequential design; keep the effort proportional to reversibility and uncertainty. |
| [principle-experience-first](/Users/zbeyens/git/plate-2/.agents/skills/principle-experience-first/SKILL.md) | 9 | Keep leaf | Complete user operations should drive design and proof rather than internal implementation convenience. |
| [principle-fix-root-causes](/Users/zbeyens/git/plate-2/.agents/skills/principle-fix-root-causes/SKILL.md) | 9 | Keep leaf | Trace symptoms to the durable owner and prove the correction; avoid accumulating symptom guards. |
| [principle-foundational-thinking](/Users/zbeyens/git/plate-2/.agents/skills/principle-foundational-thinking/SKILL.md) | 8 | Keep leaf | Choose core models and structures before special cases; avoid re-architecting settled low-impact work. |
| [principle-guard-the-context-window](/Users/zbeyens/git/plate-2/.agents/skills/principle-guard-the-context-window/SKILL.md) | 9 | Keep leaf | Bound source reads and preserve evidence; current long entries and repeated adapters should follow their own rule. |
| [principle-laziness-protocol](/Users/zbeyens/git/plate-2/.agents/skills/principle-laziness-protocol/SKILL.md) | 8 | Keep leaf | Prefer the complete simple fix over minimizing touched lines; complements migration accounting. |
| [principle-make-operations-idempotent](/Users/zbeyens/git/plate-2/.agents/skills/principle-make-operations-idempotent/SKILL.md) | 9 | Keep leaf | Safe repetition is essential for generators, registry sync, caches and interrupted workflows. |
| [principle-migrate-callers-then-delete-legacy-apis](/Users/zbeyens/git/plate-2/.agents/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | 9 | Keep leaf | Complete adoption and delete obsolete paths while preserving actual runtime and serialized-data laws. |
| [principle-minimize-reader-load](/Users/zbeyens/git/plate-2/.agents/skills/principle-minimize-reader-load/SKILL.md) | 9 | Keep leaf | Clear naming, locality and direct control flow benefit both public APIs and the skill set itself. |
| [principle-model-the-domain](/Users/zbeyens/git/plate-2/.agents/skills/principle-model-the-domain/SKILL.md) | 9 | Keep leaf | Explicit states and variants prevent accidental combinations and duplicate truth. |
| [principle-never-block-on-the-human](/Users/zbeyens/git/plate-2/.agents/skills/principle-never-block-on-the-human/SKILL.md) | 8 | Keep leaf | Continue authorized work and source-answerable decisions; missing authority or a real preference is still a boundary. |
| [principle-outcome-oriented-execution](/Users/zbeyens/git/plate-2/.agents/skills/principle-outcome-oriented-execution/SKILL.md) | 9 | Keep leaf | Close the requested acceptance criteria rather than stopping at an attractive partial patch. |
| [principle-prove-it-works](/Users/zbeyens/git/plate-2/.agents/skills/principle-prove-it-works/SKILL.md) | 9 | Keep leaf | Require actual behavior evidence; distinguish source checks, browser proof and publication. |
| [principle-redesign-from-first-principles](/Users/zbeyens/git/plate-2/.agents/skills/principle-redesign-from-first-principles/SKILL.md) | 8 | Keep leaf | Reconsider the owner when requirements expose structural debt; do not make every small fix a redesign. |
| [principle-separate-before-serializing-shared-state](/Users/zbeyens/git/plate-2/.agents/skills/principle-separate-before-serializing-shared-state/SKILL.md) | 9 | Keep leaf | Independent state and write ownership prevent unnecessary locks and agent collisions. |
| [principle-sequence-verifiable-units](/Users/zbeyens/git/plate-2/.agents/skills/principle-sequence-verifiable-units/SKILL.md) | 9 | Keep leaf | Close bounded adoption and proof units before broadening a migration or sweep. |
| [principle-subtract-before-you-add](/Users/zbeyens/git/plate-2/.agents/skills/principle-subtract-before-you-add/SKILL.md) | 9 | Keep leaf | Delete duplicated owners and wrappers before introducing another control layer. |
| [principle-type-system-discipline](/Users/zbeyens/git/plate-2/.agents/skills/principle-type-system-discipline/SKILL.md) | 9 | Keep leaf | Constructive modeling, brands and negative type proof suit Plate public APIs. |
| [prototype](/Users/zbeyens/git/plate-2/.agents/skills/prototype/SKILL.md) | 8 | Keep conditional | Disposable logic and UI experiments answer uncertainty before committing production architecture. |
| [recall](/Users/zbeyens/git/plate-2/.agents/skills/recall/SKILL.md) | 7 | Fix | Targeted context recovery is useful; its automate-me route points to an uninstalled owner. |
| [reflect](/Users/zbeyens/git/plate-2/.agents/skills/reflect/SKILL.md) | 6 | Fix | Evidence-backed retrospectives are worthwhile; five tool calls is a poor trigger for three reviewers plus a synthesizer. |
| [registry-changelog](/Users/zbeyens/git/plate-2/.agents/skills/registry-changelog/SKILL.md) | 9 | Keep | Concrete event schema, registry identity and generator checks are separate from package changesets. |
| [regression](/Users/zbeyens/git/plate-2/.agents/skills/regression/SKILL.md) | 9 | Keep | Case/corpus semantics, exact replay, failed-fix repair and receipt freshness are executable domain machinery. |
| [release-lanes](/Users/zbeyens/git/plate-2/.agents/skills/release-lanes/SKILL.md) | 9 | Keep conditional | CI publishing and promotion contracts cannot be replaced by a generic PR playbook; activate only for release or sync requests. |
| [research-wiki](/Users/zbeyens/git/plate-2/.agents/skills/research-wiki/SKILL.md) | 8 | Keep | Compiled evidence and normative doctrine have different authority; preserve source metadata and update accounting. |
| [resolve-pr-feedback](/Users/zbeyens/git/plate-2/.agents/skills/resolve-pr-feedback/SKILL.md) | 7 | Fix shared teaching | Per-comment triage and resolution are useful; the entry still requires Autogoal for ordinary mutable work. |
| [setup-pstack](/Users/zbeyens/git/plate-2/.agents/skills/setup-pstack/SKILL.md) | 7 | Fix | Availability-checked inherit-parent defaults are sound; remove stale alwaysApply wording and align panel configuration with actual delegation policy. |
| [shadcn](/Users/zbeyens/git/plate-2/.agents/skills/shadcn/SKILL.md) | 8 | Keep conditional | Official CLI and registry mechanics are useful under Plate UI ownership; it is not the prose-style owner. |
| [shadcn-parity](/Users/zbeyens/git/plate-2/.agents/skills/shadcn-parity/SKILL.md) | 8 | Keep | Resolver and provider semantics differ from visual styling and update transport; preserve exact upstream behavior contracts. |
| [show-me-your-work](/Users/zbeyens/git/plate-2/.agents/skills/show-me-your-work/SKILL.md) | 7 | Fix | Compact decision evidence is useful; compulsory different-family review is unavailable in this runtime and should not burden every long run. |
| [slate-ar](/Users/zbeyens/git/plate-2/.agents/skills/slate-ar/SKILL.md) | 8 | Keep conditional | Wraps a real external research CLI with session identity and gate replay; do not substitute it for normal Task execution. |
| [slate-migration](/Users/zbeyens/git/plate-2/.agents/skills/slate-migration/SKILL.md) | 8 | Keep conditional | Migration inventories and behavioral adoption are distinct; keep supervision and publication under Task. |
| [swarm](/Users/zbeyens/git/plate-2/.agents/skills/swarm/SKILL.md) | 6 | Fix | Partition and drain semantics are useful; sequential policy and unavailable cloud parameters prevent its advertised execution here. |
| [sync-plate-ui](/Users/zbeyens/git/plate-2/.agents/skills/sync-plate-ui/SKILL.md) | 9 | Keep | Three-way adoption, fork accounting and target-owned state justify the full downstream sync method. |
| [sync-shadcn](/Users/zbeyens/git/plate-2/.agents/skills/sync-shadcn/SKILL.md) | 9 | Keep | Exact upstream ancestry, scoped denominators and fork decisions are more than copying files. |
| [sync-vision](/Users/zbeyens/git/plate-2/.agents/skills/sync-vision/SKILL.md) | 8 | Keep | Incremental durable-law accounting is distinct from ordinary prose edits and transient plans. |
| [tanstack-virtual](/Users/zbeyens/git/plate-2/.agents/skills/tanstack-virtual/SKILL.md) | 8 | Keep reference | Useful headless virtualization mechanics when measurements justify them; Plite owns geometry and lifetime semantics. |
| [task](/Users/zbeyens/git/plate-2/.agents/skills/task/SKILL.md) | 8 | Keep owner | Single scope, plan, authority and closure owner is the right architecture; absorb the remaining Auto wrapper recipe. |
| [tdd](/Users/zbeyens/git/plate-2/.agents/skills/tdd/SKILL.md) | 7 | Fix shared teaching | Behavior-first vertical slices and type proof are strong; repeated mandatory user approvals conflict with existing authorization. |
| [teach](/Users/zbeyens/git/plate-2/.agents/skills/teach/SKILL.md) | 7 | Fix | Mechanism-first explanations are useful; comma caps and mandatory diagram patterns duplicate or override Technical Writing judgment. |
| [technical-writing](/Users/zbeyens/git/plate-2/.agents/skills/technical-writing/SKILL.md) | 9 | Keep prose owner | Preservation, author voice, clear structure and selective Unslop rules combine well; Plate docs retain conditional shadcn mechanics. |
| [testing](/Users/zbeyens/git/plate-2/.agents/skills/testing/SKILL.md) | 8 | Keep owner | Test value, public contracts and runner mechanics deserve one owner; incorporate the periodic audit method intact. |
| [testing-review](/Users/zbeyens/git/plate-2/.agents/skills/testing-review/SKILL.md) | 7 | Merge into Testing | Coverage, suite-health and ranked backlog review are a useful mode of the existing test-value owner. |
| [typescript-advanced-types](/Users/zbeyens/git/plate-2/.agents/skills/typescript-advanced-types/SKILL.md) | 7 | Keep reference | Useful niche type reference; do not let generic wizardry override inference and public API clarity. |
| [typescript-best-practices](/Users/zbeyens/git/plate-2/.agents/skills/typescript-best-practices/SKILL.md) | 9 | Keep reference | Constructive types and worked patterns are a strong technical method under Best API domain law. |
| [vercel-composition-patterns](/Users/zbeyens/git/plate-2/.agents/skills/vercel-composition-patterns/SKILL.md) | 8 | Keep reference | Selected composition tactics help; generic defaults must remain subordinate to Plate component ownership. |
| [vercel-react-best-practices](/Users/zbeyens/git/plate-2/.agents/skills/vercel-react-best-practices/SKILL.md) | 8 | Keep reference | Rich performance leaves are useful for measured problems, not a mandatory whole-library read per React edit. |
| [verify-plate](/Users/zbeyens/git/plate-2/.agents/skills/verify-plate/SKILL.md) | 7 | Fix application | Strong exact-route and native-proof rules; inventory lacks stable per-feature journeys and the command reference accumulates unrelated lessons. |
| [video-transcripts](/Users/zbeyens/git/plate-2/.agents/skills/video-transcripts/SKILL.md) | 7 | Fix shared teaching | Actual helper output and evidence caching are useful; tracker-posting instructions need explicit message authority at the shared source. |
| [walkthrough](/Users/zbeyens/git/plate-2/.agents/skills/walkthrough/SKILL.md) | 8 | Keep conditional | Presents existing final evidence and preserves originals; it should not launch another verification lifecycle. |
| [why](/Users/zbeyens/git/plate-2/.agents/skills/why/SKILL.md) | 8 | Keep | Separates historical evidence from inferred intent across code, commits and discussions; use the full method only when history matters. |

## All upstream pstack skills

This score assesses the **method's value**, before Plate/runtime integration. The separate Plate column is the installed score above when a same-name skill exists. A strong upstream method can have a lower current installed score because independence is prohibited or its platform instructions conflict. These are editorial assessments, not measured model rankings.

| Upstream skill | Method / 10 | Plate / 10 | Decision | Reason |
| --- | ---: | ---: | --- | --- |
| [architect](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/architect/SKILL.md) | 8 | 7 | Adapt | Keep concrete alternative designs; invoke Arena for consequential uncertainty instead of every cross-function boundary. |
| [arena](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/arena/SKILL.md) | 9 | 6 | Adapt | Preserve independent candidates, isolated outputs and cross-judgment; real delegation is a prerequisite. |
| [automate-me](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/automate-me/SKILL.md) | 6 | — | Do not install | Preference mining can inform Maintain Workflow; another generated personal mode would duplicate current policy ownership. |
| [blast-radius](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/blast-radius/SKILL.md) | 9 | 8 | Keep port | Trace actual dependents, contracts, generated artifacts and downstream failure paths before claiming a change is local. |
| [bro](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/bro/SKILL.md) | 3 | — | Do not install | Plain-language restatement is already part of Technical Writing; forty words do not justify another skill. |
| [create-verification-skill](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/create-verification-skill/SKILL.md) | 9 | 9 | Keep port | One executable project driver with a proved launch, doctor, feature and cleanup is the most valuable bootstrap idea. |
| [figure-it-out](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/figure-it-out/SKILL.md) | 8 | 7 | Adapt | Useful for work with no fitting recipe; preserve evidence and decision gates while mapping unavailable cloud and model assumptions. |
| [how](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/how/SKILL.md) | 8 | 7 | Adapt | Retain grounded explanation and critique; make simple answers direct and reserve the full panel for consequential uncertainty. |
| [interrogate](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/interrogate/SKILL.md) | 8 | 6 | Adapt | Independent objections and synthesis pressure-test a settled proposal; sequential self-review is not equivalent. |
| [maintain-verification-skill](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/maintain-verification-skill/SKILL.md) | 9 | 8 | Keep port | Refresh both source-derived inventory and actual user flows; a daily schedule is a possible policy, not an automatic requirement here. |
| [make-bot-ui](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/make-bot-ui/SKILL.md) | 5 | — | Do not install | Useful for its webhook dashboard environment; Grok tools and infrastructure have no current Plate user job. |
| [no-comments](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/no-comments/SKILL.md) | 7 | 7 | Adapt | Useful constrained comment review and structural encoding; protect public contracts and avoid measuring quality by deletion count. |
| [poteto-mode](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/poteto-mode/SKILL.md) | 9 | 7 | Adapt | Best upstream organizing method; translate platform and authority semantics into one active Codex policy. |
| [principle-boundary-discipline](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-boundary-discipline/SKILL.md) | 9 | 9 | Keep conditional leaf | Validate at real untrusted boundaries; avoid repeating checks inside trusted typed code. |
| [principle-build-the-lever](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-build-the-lever/SKILL.md) | 9 | 9 | Keep conditional leaf | Repeated manual work should improve the owning command or mechanism; highly relevant to verification maintenance. |
| [principle-encode-lessons-in-structure](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-encode-lessons-in-structure/SKILL.md) | 9 | 9 | Keep conditional leaf | Turn recurring failures into types, helpers or checks instead of another paragraph of instructions. |
| [principle-exhaust-the-design-space](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-exhaust-the-design-space/SKILL.md) | 8 | 8 | Keep conditional leaf | Real alternatives improve consequential design; keep the effort proportional to reversibility and uncertainty. |
| [principle-experience-first](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-experience-first/SKILL.md) | 9 | 9 | Keep conditional leaf | Complete user operations should drive design and proof rather than internal implementation convenience. |
| [principle-fix-root-causes](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-fix-root-causes/SKILL.md) | 9 | 9 | Keep conditional leaf | Trace symptoms to the durable owner and prove the correction; avoid accumulating symptom guards. |
| [principle-foundational-thinking](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-foundational-thinking/SKILL.md) | 8 | 8 | Keep conditional leaf | Choose core models and structures before special cases; avoid re-architecting settled low-impact work. |
| [principle-guard-the-context-window](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-guard-the-context-window/SKILL.md) | 9 | 9 | Keep conditional leaf | Bound source reads and preserve evidence; current long entries and repeated adapters should follow their own rule. |
| [principle-laziness-protocol](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-laziness-protocol/SKILL.md) | 8 | 8 | Keep conditional leaf | Prefer the complete simple fix over minimizing touched lines; complements migration accounting. |
| [principle-make-operations-idempotent](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-make-operations-idempotent/SKILL.md) | 9 | 9 | Keep conditional leaf | Safe repetition is essential for generators, registry sync, caches and interrupted workflows. |
| [principle-migrate-callers-then-delete-legacy-apis](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | 9 | 9 | Keep conditional leaf | Complete adoption and delete obsolete paths while preserving actual runtime and serialized-data laws. |
| [principle-minimize-reader-load](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-minimize-reader-load/SKILL.md) | 9 | 9 | Keep conditional leaf | Clear naming, locality and direct control flow benefit both public APIs and the skill set itself. |
| [principle-model-the-domain](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-model-the-domain/SKILL.md) | 9 | 9 | Keep conditional leaf | Explicit states and variants prevent accidental combinations and duplicate truth. |
| [principle-never-block-on-the-human](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-never-block-on-the-human/SKILL.md) | 8 | 8 | Keep conditional leaf | Continue authorized work and source-answerable decisions; missing authority or a real preference is still a boundary. |
| [principle-outcome-oriented-execution](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-outcome-oriented-execution/SKILL.md) | 9 | 9 | Keep conditional leaf | Close the requested acceptance criteria rather than stopping at an attractive partial patch. |
| [principle-prove-it-works](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-prove-it-works/SKILL.md) | 9 | 9 | Keep conditional leaf | Require actual behavior evidence; distinguish source checks, browser proof and publication. |
| [principle-redesign-from-first-principles](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-redesign-from-first-principles/SKILL.md) | 8 | 8 | Keep conditional leaf | Reconsider the owner when requirements expose structural debt; do not make every small fix a redesign. |
| [principle-separate-before-serializing-shared-state](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-separate-before-serializing-shared-state/SKILL.md) | 9 | 9 | Keep conditional leaf | Independent state and write ownership prevent unnecessary locks and agent collisions. |
| [principle-sequence-verifiable-units](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-sequence-verifiable-units/SKILL.md) | 9 | 9 | Keep conditional leaf | Close bounded adoption and proof units before broadening a migration or sweep. |
| [principle-subtract-before-you-add](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-subtract-before-you-add/SKILL.md) | 9 | 9 | Keep conditional leaf | Delete duplicated owners and wrappers before introducing another control layer. |
| [principle-type-system-discipline](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/principle-type-system-discipline/SKILL.md) | 9 | 9 | Keep conditional leaf | Constructive modeling, brands and negative type proof suit Plate public APIs. |
| [recall](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/recall/SKILL.md) | 8 | 7 | Adapt | Targeted context reconstruction reduces repeated exploration; map its personal-mode route to an installed owner. |
| [reflect](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/reflect/SKILL.md) | 7 | 6 | Adapt | Retrospective lenses are useful; require a consequential lesson or explicit request instead of a five-call threshold. |
| [setup-pstack](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/setup-pstack/SKILL.md) | 8 | 7 | Adapt | Explicit role configuration and inherit-parent aliases are sound; use only available models and supported concurrency. |
| [show-me-your-work](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/show-me-your-work/SKILL.md) | 8 | 7 | Adapt | A small decision/evidence log improves reviewability; link existing receipts and honestly report unavailable independent review. |
| [swarm](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/swarm/SKILL.md) | 8 | 6 | Adapt | Frame, partition, drain and aggregate correctly; needs actual independent workers and explicit task/checkout authority. |
| [tdd](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/tdd/SKILL.md) | 8 | 7 | Reuse Testing and TDD | Cheap meaningful red-green loops are valuable; keep the stronger existing type-proof method and remove redundant approval gates. |
| [teach](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/teach/SKILL.md) | 8 | 7 | Adapt | Explain concrete mechanisms and appropriate visuals; let Technical Writing own prose instead of mechanical punctuation rules. |
| [technical-writing](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/technical-writing/SKILL.md) | 8 | 9 | Merged into prose owner | Audience, structure, sentence clarity and worked examples form the best base; add preservation-first editing and local house style. |
| [typescript-best-practices](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/typescript-best-practices/SKILL.md) | 9 | 9 | Keep port | Constructive modeling, total types and worked examples suit a public editor library. |
| [unslop](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/unslop/SKILL.md) | 6 | — | Merged selectively | Useful filler and pattern detection; absolute word bans and compulsory personality can damage technical prose. |
| [why](https://github.com/cursor/plugins/blob/93b00b89ef425a9c1bac0d0b317dfc49c930ac99/pstack/skills/why/SKILL.md) | 9 | 8 | Keep port | Source categories and explicit uncertainty distinguish recorded intent from plausible explanations. |

Machine-readable scorecards: [Plate](/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-09-05-plate-pstack-audit/plate-scores.json), [pstack](/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-09-05-plate-pstack-audit/pstack-scores.json). Scores describe this inspected state and should change when evidence or integration changes.
