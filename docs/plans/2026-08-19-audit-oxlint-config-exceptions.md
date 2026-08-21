# Audit Oxlint config exceptions

Objective:
Audit every custom rule and override in `oxlint.config.ts`; finish when each
block has a source-backed fix, keep, defer, or reject decision in an exhaustive
ledger. Do not implement fixes in this audit.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-19-audit-oxlint-config-exceptions.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- none

Cleanup source:
- type: direct user request after one exact-file override was challenged
- id / link: `oxlint.config.ts`
- title: list every remaining Oxlint config item that should be fixed
- requested surface: every custom override, global rule override, ignore, and
  helper in `oxlint.config.ts`, with owning source sampled where needed
- cleanup intent: identify every config entry that is remote one-off debt,
  overly broad, redundant, misleading, or better fixed in source
- acceptance criteria: every parsed custom block is accounted for; each fix
  candidate names paths/rules, the best action, risk, owner, and proof; counts
  reconcile to the full config inventory

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence / cleanliness score: 60/100; prior cleanup removed
  structural duplication, but the media example proves the semantic/locality
  classification needs a complete second audit
- improvement loop: parse the effective config, inventory every block, inspect
  representative owners and strict-diagnostic behavior, then reconcile counts
- final score / loop closure: target >= 95/100 audit confidence with zero
  unclassified custom blocks

Completion threshold:
- An exhaustive ledger classifies every custom `oxlint.config.ts` concern as
  fix source, inline suppression, narrow/merge config, keep, defer, or reject.
- Inventory counts reconcile to the parsed config: imports/helpers, ignores,
  preset composition, override blocks, and global custom rules.
- Every recommended fix is based on rule ownership and semantics, never error
  count alone; risky behavior or API work is clearly separated.
- No source/config implementation changes are made beyond this plan because the
  user requested a list, not execution.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-audit-oxlint-config-exceptions.md`
  passes.

Verification surface:
- Parse/import `oxlint.config.ts` to enumerate every override selector/rule pair
  and root rule.
- Read the whole config in bounded sections and inspect representative source
  sites for each exception family.
- Compare locality with `../ellie` source-local suppression practice.
- Reconcile candidate counts against the parsed inventory and run the existing
  structural checker; no runtime/browser proof applies to a read-only audit.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: root config, effective imported config object, owning source
  sites, current Oxlint diagnostics, Ultracite rule policy, and `../ellie`
- Allowed edit scope: this audit plan plus temporary audit-only config/runner
  files that must be deleted before handoff; all product/config files are
  read-only
- Plite / Plate boundary: shared lint tooling; source owners remain unchanged
- Public API boundary: read-only; no API decisions implemented
- Browser surface: N/A: no behavior change
- Package/API surface: N/A: no package boundary change
- Non-goals: do not implement fixes, disable rules by diagnostic volume, add
  package-local configs, invent abstractions for lint, or treat every scoped
  exception as wrong

Output budget strategy:
- Parse counts first, read config in bounded line ranges, group selectors/rules
  mechanically, inspect only representative source slices, and store the full
  ledger in this plan rather than streaming raw diagnostics.

Blocked condition:
- Stop only if the effective config cannot be imported/parsed or a rule owner
  cannot be determined from config, source, diagnostics, and installed rule
  documentation after three distinct local checks.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: active

Current verdict:
- verdict: the prior structural cleanup removed indirection but retained a
  remote suppression ledger; only seven of sixty override blocks are clean
  configuration owners without further action
- cleanliness confidence: 96/100 audit confidence after isolated rule replay
- next owner: architecture-cleanup
- keep / revert / quarantine call: N/A: read-only audit
- reason: remote config suppressions can hide stale local debt even when the
  config itself is structurally deduplicated

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-audit-oxlint-config-exceptions.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exhaustive list, config-only scope, read-only boundary, and harsh semantic standard recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `architecture-cleanup` loaded | yes | full skill read on 2026-08-19 |
| Active goal checked or created | yes | dedicated audit goal created after confirming no active goal |
| Source of truth read before analysis | yes | config/media example and Ellie locality examples read; full config and Vision reads are the first audit phase |
| VISION fit gate read | yes | scheduled as the first source-map read before candidate classification |
| Plite / Plate boundary selected | yes | shared private tooling only; product owners stay separate |
| Cleanup surface selected | yes | every custom item in root `oxlint.config.ts` |
| Non-goals recorded | yes | read-only, no count-driven disabling, no config sprawl |
| Output budget strategy recorded | yes | parse/count first and bounded source reads |
| Implementation authority decided | yes | no implementation authority inferred from “list” |
| Proof strategy selected | yes | parsed inventory, source sampling, Ellie comparison, and count reconciliation |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`.
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof. N/A: this pass is read-only.
- [x] Each implementation packet ends keep, revert, or quarantine. N/A: no
      implementation packet was authorized.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded. N/A: no ownership moved; an oracle repair is listed.
- [x] Focused proof is run before broad proof for changed code. N/A: no code
      changed; isolated diagnostic replay was the focused audit proof.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes. N/A: none occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 60/60 override rows and 178/178 root rules reconciled; final checker recorded below |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | root private tooling owner, 1,500-line config, source owners, and checker recorded |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | remote one-offs, 14 stale selectors, overlaps, mega-lists, comments, ignore debt, and oracle gap recorded |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | thirteen ranked families below |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | each candidate records current -> proposed navigation cost |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | splits only follow stable semantic owners; package-local config split rejected |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | stale deletion, value merge, helper/source inlining, and policy simplification selected |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | local ownership and explicit boundaries fit current Vision; no durable taste change |
| Implementation packet gate | no | For every code packet, record keep/revert/quarantine and focused proof | N/A: read-only audit; no packet applied |
| Source-owner oracle gate | no | Repair or add tests/oracles when ownership moves, or N/A | N/A: no move; exception-audit repair is a future candidate |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | only this internal plan changed |
| Package/API proof | no | Run relevant package/export/type/build proof when package boundaries changed, or N/A | N/A: no package change |
| Browser proof | no | Run Browser/Playwright proof when visible behavior changed, or N/A | N/A: no visible change |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | structural checker and goal-plan checker recorded below; full CI would prove no new behavior here |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | diagnostics were summarized by rule/block and stored in this plan |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no duration requested |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | completed below |
| Autoreview | no | Reconcile the final ledger against the parsed config and challenge every keep/defer decision | N/A under autoreview's prose-only internal-notes exception; manual reconciliation covers 60/60 overrides and 178/178 root rules |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-audit-oxlint-config-exceptions.md` | final rerun passes after closeout evidence was recorded |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read config, Vision, Ellie, prior plan, and checker | source map |
| Source map | complete | parsed 60 overrides, 485 selectors, and 178 root rules | deslop inventory |
| Deslop inventory | complete | isolated every override and found stale/overlapping scopes | candidate matrix |
| Candidate matrix | complete | exhaustive override ledger and thirteen ranked categories below | verification |
| Cleanup packets / owner routing | complete | no packets applied; future owners named in matrix | verification |
| Verification | complete | parsed-count reconciliation, isolated replay, source sampling, and structural checker | closeout |
| Closeout | complete | temporary audit helpers removed; final handoff filled | final response |

Source map:
- Effective owner: `oxlint.config.ts`, 1,500 lines, 60 override blocks, 485
  selectors, 1,455 selector/rule pairs, and 178 root custom rules.
- Root policy: 161 explicit global offs, each with a P-tier reason; 17 enabled
  rules/options differ from the imported presets.
- Reused owner: `unsafeValueRules` supplies five type-aware rules to nine
  override blocks.
- Proof owners: `tooling/scripts/check-oxlint-config.mjs` checks structural
  duplicates/missing paths/reasons; isolated replay with the temporary audit
  config proves whether each suppression still masks a diagnostic.
- Product owners sampled: editor media, toolbars, preview dialog, hooks,
  effects, compiler boundaries, generated docs/registry adapters, Plite/Plate
  generic runtime boundaries, tests, declarations, scripts, and browser proof.

Deslop inventory:
- Remote one-offs: exact-file blocks disable a rule for every future line in a
  file even when only one expression currently violates it.
- Stale selectors: 14 exact file selectors no longer produce their disabled
  rule and therefore survive only as dead policy.
- Overlap: `**/*-value.tsx` in the test block overlaps both editor-value
  override blocks; the nested `values/cn/**` glob is redundant under
  `values/**`.
- Mega-lists: 61 app/config files and 139 package files flatten unrelated
  unsafe-value owners into two lists; isolated replay exposes 228 and 829
  diagnostics respectively.
- Broad test policy: one block hides 21,753 diagnostics across 1,209 files,
  mixing compiler scope, fixture syntax, Next false positives, unused
  expressions, and unsafe test-double types.
- Misleading comments: the media rationale hides missing caption support; the
  unsafe mega-list comments overclaim one owner; lines 1031-1032 discuss
  prompt/alert above an unrelated optional-chaining block.
- Oracle gap: the structural checker proves path existence but not whether an
  exact selector still suppresses the named rule.
- Ignore debt: five root-only patterns are subsets of existing recursive
  patterns, six patterns duplicate Ultracite core ignores, and five donor/Slate
  paths currently match no source owner.
- Root option inconsistency: empty catches are globally allowed and all empty
  arrow functions are globally allowed while 41 non-arrow empty functions are
  remotely exempted; syntax, not behavior, decides enforcement.

Override ledger:
| # | Rule/scope | Replay evidence | Best decision |
|---|------------|-----------------|---------------|
| 0 | Next rules in `apps/{plite,www}` | stable two-app framework scope | keep |
| 1 | unsafe values and misused promises in JS/JSX | 8,289 type-information false positives in 47 files | keep |
| 2 | broad tests and `*-value.tsx` | 21,753 diagnostics across unrelated rule families | split/defer: keep only proven test semantics; remove value overlap; phase ordinary-test unsafe repairs |
| 3 | `react/jsx-key` in Plite/editor-value fixtures | 66 fixture diagnostics in 41 files | split: keep Plite hyperscript path; inline the two exact outsiders |
| 4 | render-prop children in editable text blocks | 9 diagnostics in one public renderer owner | source-file directive |
| 5 | cloneElement in six unrelated files | 8 diagnostics | inline at each intentional clone |
| 6 | native images in ten exact files | 13 diagnostics in seven files; three stale selectors | delete three stale paths; use Next Image where honest, otherwise inline at seven native sinks |
| 7 | dangerous HTML in five files | 6 sinks | inline trust/sanitization reason at every sink |
| 8 | media captions in four files | 4 real missing-track diagnostics | inline honest debt; defer caption-track schema/product work |
| 9 | length-first heuristic in three files | 4 prefix-comparison false positives | inline at comparisons |
| 10 | commit-fence class component | 1 lifecycle class diagnostic | source-local directive on class |
| 11 | effect cleanup in five files | 6 false positives; source confirms cleanup handles | inline at allocations so new effects remain checked |
| 12 | exhaustive deps in twelve files | 40 diagnostics | inspect/fix each hook; inline only proven mutable-cell/identity contracts |
| 13 | rules of hooks in sixteen files | 45 diagnostics | inline at wrapper/harness calls; never disable whole files |
| 14 | prop-driven state adjustment in two files | 2 diagnostics | derive state where possible; inline only proven external-state transition |
| 15 | handler-only state in block menu | 1 diagnostic | replace with ref or inline exact event bridge |
| 16 | transition-all in mobile nav | 1 Tailwind false positive | inline at class expression |
| 17 | pass-data-to-parent in AI menu | 1 diagnostic | review cmdk ownership; inline only if post-commit sync is required |
| 18 | fetch-in-effect in two lazy loaders | 2 diagnostics | keep client ownership but inline at each guarded loader |
| 19 | class error-boundary test | 2 diagnostics | source-local test directive |
| 20 | permanent will-change in selection overlay | 1 diagnostic | verify measured drag need; inline at style if kept |
| 21 | Zod 3 calls in two owners | 4 version-mismatch diagnostics | inline at calls or scope the Zod-3 package, not both exact files remotely |
| 22 | JSX brace fixtures | 3 diagnostics | inline at fixture expressions |
| 23 | click keyboard support | 8 diagnostics in five files; one stale selector | delete stale path; fix real toolbar/preview controls; inline pointer-only propagation guards |
| 24 | interactive focus | 4 diagnostics in four files; one stale selector | delete stale path; fix split-button spans; inline valid composite-toolbar container |
| 25 | noninteractive handlers | 3 diagnostics | fix controls where interactive; inline input-focus/table propagation guards |
| 26 | static handlers | 5 diagnostics | inline two test fixtures; fix or document three preview pointer surfaces locally |
| 27 | iframe sandbox | 6 diagnostics in six files; one stale selector | delete stale path; design least-permissive provider sandboxes; never blanket-disable security |
| 28 | array index keys | 9 diagnostics in six files | use existing stable ids; inline only immutable positional projections |
| 29 | React Compiler boundaries | 107 diagnostics in 41 files | keep two imperative subsystem globs; move 28 exact files to source-file directives; defer rewrites |
| 30 | console in scripts/dev/bench/depset CLI | 156 diagnostics in 44 CLI files | keep semantic paths; add missing rationale |
| 31 | declaration-file rules | only `require-module-specifiers` reports 13 diagnostics | delete seven redundant rule entries; keep module-marker exception |
| 32 | unsafe values in type tests | 280 diagnostics in 15 compile-only files | keep |
| 33 | unsafe values in Playwright bridge | 279 diagnostics in 14 cross-realm files | keep |
| 34 | unsafe benchmark/dev values | 278 diagnostics in six dynamic harness files | keep |
| 35 | unsafe editor-value fixtures | 78 visible diagnostics, masked elsewhere by overlap | merge with #48 and remove nested `cn` glob |
| 36 | seven unrelated untyped adapters | 349 diagnostics | split by Fumadocs, locale, DOCX/XML, and config owner; repair types or localize |
| 37 | two CommonJS-only configs | 4 module diagnostics | keep |
| 38 | ts-comments in two negative type tests | 13 diagnostics | inline at each expected-error contract |
| 39 | namespaces in three HKT/JSX owners | 3 diagnostics | source-local directives at namespace declarations |
| 40 | triple-slash references in two declarations | 2 diagnostics | source-local directives at references |
| 41 | unbound methods in thirty files | 85 diagnostics | fix receiver loss where real; inline identity/bound-method checks locally |
| 42 | 61 app/config unsafe files | 228 diagnostics in 53 files; eight stale selectors | delete stale paths; split by generated/route/config/editor owner and repair/localize |
| 43 | 139 package unsafe files | 829 diagnostics | phased generic/runtime type repair; local directives only at proven erased boundaries |
| 44 | spread snapshots in three files | 10 diagnostics | inline at mutation snapshots |
| 45 | grapheme bitwise algorithm | 14 diagnostics | move to a source-file algorithm directive |
| 46 | negative-index suggestion in slice fitter | 2 false positives | inline at non-Array slice operations |
| 47 | set/map lookup heuristic in five files | 11 diagnostics | inline at fixed arrays/String.includes; use Set only when measured/semantic |
| 48 | editor-value string/expression rules | 1 visible diagnostic, masked by #2 | merge with #35; keep one semantic fixture block |
| 49 | import cycles in twenty files | 36 diagnostics | fix movable cycle edges; inline accepted import edges; do not disable whole files |
| 50 | script URLs in all tests | 13 diagnostics in seven tests | replace blanket test glob with local security-fixture directives |
| 51 | ambient declaration JavaScript rules | 7 diagnostics in two declarations | keep |
| 52 | empty functions in ten exact files | 41 diagnostics | resolve global arrow/non-arrow policy; inline or implement each intentional no-op |
| 53 | loop closures in twenty-two files | 35 diagnostics | verify bindings; inline false positives at callbacks, not files |
| 54 | first-item loops in three files | 4 diagnostics | inline at intentional iterator loops |
| 55 | indirectly-mutated loop conditions | 2 diagnostics | inline at two loops |
| 56 | unsafe optional chaining in four tests | 10 correctness diagnostics | prefer explicit fixture assertions; inline only exact proven accesses; delete stale prompt/alert comment |
| 57 | lone blocks in two merged tests | 6 diagnostics | source-local block directives or split fixture ownership if useful |
| 58 | inner declaration in public state | 1 diagnostic | inline at closure-owned declaration |
| 59 | console in debug/test owners | 2 diagnostics | inline at two diagnostic calls |

Root and ignore findings:
- Keep the 161 global `off` decisions as rule-policy decisions for this cleanup;
  every one has a P-tier semantic reason. Re-enabling
  `anti-slop/no-chained-type-assertions` alone produces 658 diagnostics in 175
  files, `no-unknown-returns` produces 201 in 93, and unsafe dictionary types
  produce 695 in 214. Those are separate migrations, not locality cleanup.
- Fix `no-empty: { allowEmptyCatch: true }`: 28 empty catches deserve local
  ownership because silent error swallowing is a correctness concern.
- Fix `no-empty-function: { allow: ['arrowFunctions'] }`: the syntax-based
  exemption permits roughly 515 empty arrows while exact-listing 41 non-arrow
  no-ops. Enforce one semantic policy, preferably shipped-source strictness plus
  test/fixture-local exceptions.
- Tighten `no-console` by removing `info` from the global allowlist; scripts are
  already semantically exempt and the shipped DebugPlugin can own its call.
- Inline one-use `nextAppOverride`; keep the reused unsafe-value recipe and the
  named project ignore list.
- Remove 14 stale exact selectors, merge the two value-fixture blocks, and add
  a non-default exception-audit command that detects zero-diagnostic exact
  selectors without making every ordinary lint run re-lint sixty variants.

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | proven | stale/redundant selectors and declaration rules (#6, #23, #24, #27, #31, #42) | 14 stale exact paths plus 7 dead rule entries | isolated replay is zero for stale entries; only one of eight declaration rules fires | 21 remote entries -> 0; proof clarity high -> exact | delete dead entries | tooling | isolated per-block replay | delete |
| 2 | proven | real accessibility and iframe findings (#23-#27) | toolbar, previews, tables, embeds, demos | interactive spans/images and unsandboxed or over-permissive iframes are real behavior/security debt | config + source -> source only; owner clarity mixed -> exact component | fix semantics; inline only true pointer/composite false positives | Plate UI / registry owners | source inspection plus rule replay | plan |
| 3 | proven | remote exact-file suppressions (#3-#29, #38-#41, #44-#50, #52-#59) | dozens of unrelated owners | whole-file disables hide future violations; most current findings are one-line contracts | config + file -> file only; proof locality remote -> adjacent | move intentional exceptions to exact source lines/files and fix real findings | each source owner | isolated diagnostics name each line | inline |
| 4 | proven | value-fixture overlap (#2, #35, #48) | editor values and `*-value.tsx` tests | selectors overlap and `values/cn/**` is redundant | 3 config blocks -> 1 semantic block; owner clarity low -> high | remove overlap and keep one value-fixture policy | editor fixture owner | selector intersection and replay | merge |
| 5 | proven | broad test mega-block (#2) | 1,209 files | 21,753 diagnostics mix ten unrelated rule families | 1 opaque block -> rule/owner groups; files-to-read 1,209 -> selected owners | split only by stable test semantics; repair ordinary tests in phases | test infrastructure plus package owners | per-rule totals | split |
| 6 | proven | untyped adapter/app/package mega-lists (#36, #42, #43) | 199 listed files | Fumadocs, locale, XML, route, generated, config, and editor generic boundaries are not one owner | 3 lists -> stable subsystem owners; proof clarity low -> medium/high | repair types by subsystem; localize only proven erased boundaries | adapter/app/package owners | 1,406 replayed diagnostics and source sampling | defer |
| 7 | proven | hooks/effects/compiler boundaries (#11-#20, #29) | 84 listed/source-matched files | cleanup rule is false-positive at six cleaned allocations; hook/compiler findings mix contracts and real rewrites | remote list -> exact hook/call; proof locality low -> high | inline proven contracts, fix hook bugs, retain only two imperative subsystem globs | React owners | replay plus effect cleanup source audit | defer |
| 8 | proven | root empty/console policy | root plus shipped/test/script sources | about 515 empty arrows are globally allowed, 41 non-arrow no-ops remotely exempted, and `console.info` is globally allowed | syntax policy -> semantic owner; rules-to-read 3 -> local call sites | make empty behavior policy consistent and remove global `info` allowance | tooling policy + source owners | configured options and call-site counts | simplify |
| 9 | strong | ignore-list debt | root ignore list | 5 subset duplicates, 6 likely core duplicates, and 5 stale donor paths | 16 entries -> 0-5 after semantics check; proof clarity medium -> high | delete proven subsets/stale paths; verify trailing-directory semantics before core dedupe | tooling | glob matching and imported preset inspection | simplify |
| 10 | proven | one-use config helper | `nextAppOverride` | shallow helper is consumed once; `unsafeValueRules` is reused nine times | 2 hops -> 1 for Next; reused helper remains 1 owner | inline Next helper; keep unsafe-value recipe and named ignores | tooling | import/object graph | inline |
| 11 | proven | stable semantic scopes (#0, #1, #30, #32-#34, #37, #51) | apps, JS/JSX, scripts, type tests, bridges, benchmarks, CJS, declarations | scopes express framework/runtime categories rather than exception ledgers; #30 only lacks rationale | stable 1-hop owner stays 1-hop | keep; add rationale to script console block | tooling | path semantics and isolated replay | keep |
| 12 | proven | exception audit oracle | checker script | current checker catches missing exact paths but not exact paths whose named rule no longer fires | manual 60-variant audit -> one explicit non-default command | add an expensive opt-in/scheduled re-enable audit; keep ordinary lint fast | tooling checker | this audit found 14 misses | plan |
| 13 | rejected | package-local Oxlint configs | packages/apps | moving remote lists into more config files would hide the same debt with worse policy discovery | 1 owner -> many owners; navigation strictly worse | keep one root policy owner; move exceptions into source, not child configs | tooling | Ellie comparison and ownership analysis | reject |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| audit only | no implementation authorized | tooling | this plan; temporary helpers removed | exhaustive ledger and final checks | keep plan; no config/source mutation | execute categories one at a time when authorized |

Cleanup counts:
- delete: 1 candidate family; 14 stale selectors and 7 redundant rule entries
- merge: 1 candidate family; three overlapping value-fixture blocks become one
- inline: 2 candidate families; remote exact suppressions and one-use helper
- simplify: 2 candidate families; root option policy and ignore list
- split: 1 candidate family; broad tests only along stable semantic owners
- keep: 1 candidate family; seven blocks unchanged, plus #30 after rationale
- defer: 2 candidate families; generic/adapter typing and React rewrites
- reject: 1 candidate family; package-local config sprawl
- plan: 2 candidate families; accessibility/security repair and audit oracle

Changed list:
- code/runtime/API: none
- tests/oracles: none; future exception-audit oracle listed
- docs/plans: this audit plan only
- skills/workflow: none
- reverted/quarantined: three temporary audit helpers deleted before handoff

Needs review:
- Caption-track product/schema ownership before fixing #8.
- Provider-specific least-permissive sandbox contracts before fixing #27.
- React Compiler/hook rewrites in #12-#20 and #29; do not bulk-autofix.
- Generic/runtime type migrations in #36, #42, and #43.
- Oxlint trailing-directory ignore semantics before deleting six imported-core
  duplicates.

Verification evidence:
- Workspace authority: all reads and commands ran from
  `/Users/zbeyens/git/plate-2`; root Oxlint owns the analyzed behavior.
- Parsed effective config: 60 override blocks, 485 selectors, 1,455
  selector/rule pairs, and 178 root custom rules.
- Isolated re-enable replay: every override block was removed alone and its
  resulting diagnostics were counted by rule/file; the ledger records all 60.
- Source audit: sampled every exception family, including every media/a11y/
  iframe sink and all six effect-cleanup diagnostics.
- Root-rule probes: re-enabled representative high-volume P-tier rules to test
  semantic fit instead of using counts as the decision.
- Existing checker: final command/result recorded after temporary helper
  deletion: `node tooling/scripts/check-oxlint-config.mjs` passed with 178 root
  rules and 1,455 selector/rule pairs; it found no structural duplicates,
  missing exact paths, redundant overrides, or unexplained global offs.
- Full CI, package, and browser proof: N/A because this audit changed no
  executable config or source.

Open risks:
- Oxlint/plugin upgrades can make exact suppressions stale again; the current
  checker cannot detect that semantic drift until candidate #12 is built.
- Isolated replay proves current diagnostics, not that every deferred source
  rewrite is behavior-safe; each owner still needs focused proof during
  implementation.

Final handoff contract:
- Source roots inspected: root config/tooling, apps, packages, tests, registry,
  docs/generated adapters, and `../ellie` source-local examples.
- Candidate count and top recommendation: 13 category candidates; first delete
  14 stale selectors and 7 dead declaration-rule entries.
- Cleanup counts: recorded above; 53 of 60 override blocks require action and
  seven are clean unchanged owners.
- Agent-navigation score changes: exact exceptions move from two-hop
  config-to-source discovery to adjacent source ownership; semantic global
  scopes remain centralized.
- Packets applied with keep/revert/quarantine result: none; read-only audit.
- Proof commands/source audits: effective-config parse, 60 isolated re-enable
  variants, root-rule probes, source sampling, structural checker, and plan
  checker.
- Rejected/deferred candidates: package-local config rejected; React rewrites,
  type migrations, captions, and sandbox contracts deferred to their owners.
- Needs-review list: recorded above.
- Residual risks: plugin behavior can change after upgrades; the current oracle
  will not detect newly stale exact selectors until candidate #12 is built.
- Next owner and exact first command/file: tooling; start in
  `oxlint.config.ts` by deleting the 14 proven stale selectors and seven dead
  declaration rules, then run `node tooling/scripts/check-oxlint-config.mjs`.

Timeline:
- 2026-08-19T20:04:01.597Z Architecture-cleanup goal plan created.
- 2026-08-19 Prompt requirements and read-only audit boundary recorded before
  the full config inventory.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Audit complete; hand off the ranked fix ledger |
| What is the goal? | Classify every custom Oxlint config item and list all fixes without implementing them |
| What have I learned? | Exact-file grouping can still be remote suppression debt even after structural deduplication |
