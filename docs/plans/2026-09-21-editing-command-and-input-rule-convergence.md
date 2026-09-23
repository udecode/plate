---
review_scopes:
  - editing
review_basis:
  - 2026-09-21-editing-command-final-pass
work_kind: implementation
---

# Editing command and input-rule convergence

Status: Complete

Objective:

Make input-rule matching read-only and accepted application atomic; replace the
factory meta-language with ordinary typed rule-family functions; move
structural policy to exact feature-owned rule values; and repair Plite's
selection and insertion-admission owners without merging unrelated feature
semantics.

Flow mode:
agent-led plan hardening

Goal plan:
`docs/plans/2026-09-21-editing-command-and-input-rule-convergence.md`

Template:
`docs/plans/templates/plate-plan.md`

Primary template:
`docs/plans/templates/plate-plan.md`

Applied packs:

- performance-observability (`docs/plans/templates/packs/performance-observability.md`)

Mode:

- `deep`: the break spans Plite command semantics, Plate plugin compilation,
  eighteen production rule families, copied registry kits, public docs,
  behavior law, generated exports and a per-keystroke hot path.

Completion threshold:

- A rule can decline only before a transaction exists. Exactly one accepted
  rule may apply, and its result is either consumed input or one typed
  continuation composed through `next.after(prefix, input?)`.
- Package rule families use ordinary TypeScript functions plus
  `defineInputRule(owner, rule)`. Match payloads and owner-specific transaction
  groups infer without callback annotations or the seven-family factory DSL.
- Structural rule conditions live on the exact action they resolve; the global
  `rules.match` family shadow, its cache and its query union are gone.
- Plite preserves range direction through lift/unwrap and enforces `maxLength`
  before command-owned full-block replacement. Imported canonical changes keep
  their explicit admission exemption.
- Single-content and trailing-block policies preserve complete content and
  construct schema-valid nodes. The path/type-only normalizer is deleted.
- Focused package, type, behavior, browser, generated-registry, docs and ledger
  checks pass on final source, including a production rerun of the benchmark
  contract frozen below.

Verification surface:

- Plate input-rule compiler/runtime/types, all feature-owned rule families and
  public package type inference.
- Plate exact structural-rule resolution, Exit Break, Single Block, Single
  Line, Trailing Block and the forced-layout registry example.
- Plite command text replacement, lift/unwrap selection mapping, public static
  exports and affected structural contracts.
- Native browser typing for text substitution, block prefixes, code/math
  fences, autolink, Enter continuation and paste continuation.
- Current docs, API reference, registry output, behavior law, Vision and
  project-owned workflow doctrine.

Constraints:

- `next` may break public APIs; no compatibility aliases, deprecated wrappers
  or dual signatures.
- Keep code, math, link, list and basic-node semantics in their feature owners.
  This plan changes their shared authoring/execution contract, not their
  product meaning.
- Keep `SingleBlockPlugin` and `SingleLinePlugin` separate. Their multiline and
  one-line jobs are distinct.
- Keep the compiled input-rule trigger/MIME/priority index private and preserve
  deterministic first-match ordering.
- A dynamic plugin-name guard remains an intentionally erased optional
  dependency boundary. Do not introduce hard package dependencies to improve
  its typing.
- Do not fold the deferred adjacent-text representation cleanup or nested
  block-void parent grammar into this migration without their missing focused
  probes.
- No commit, push, PR, release or external message is authorized.

Boundaries:

- In scope: input-rule declaration, compilation, dispatch, continuation and
  feature factories; exact structural rule resolution; exit insertion reuse;
  `NormalizeTypesPlugin`, Single Block/Line and Trailing Block; Plite
  insertion admission, lift/unwrap selection mapping and duplicate singular
  insert export; copied examples, docs, behavior law, doctrine and generation.
- Source owners: `packages/platejs/src/lib/plugins/input-rules/**`,
  `packages/platejs/src/lib/plugins/override/OverridePlugin.ts`, affected
  feature plugins, `packages/platejs/src/utils/plugins/**`,
  `packages/plitejs/src/core/editor-commands.ts`,
  `packages/plitejs/src/core/insert-limit.ts`, lift/unwrap transforms, registry
  examples/kits and current docs.
- Non-goals: a generic behavior engine, one merged editing plugin, a public
  transaction-candidate API, automatic activation of optional shortcuts,
  representation cleanup unrelated to the reproduced direction bug, or a
  nested block-void grammar decision.
- Direct Plite boundary owners: insertion admission and selection mapping only.
  Input-rule declarations and feature policy remain Plate-owned command
  middleware over Plite.

Output budget strategy:

- Work by owner and execution slice. Retain type/benchmark/browser receipts
  under
  `docs/plans/artifacts/editing-command-and-input-rule-convergence/`; summarize
  decisive results here instead of streaming package-wide output.

Blocked condition:

- Only a final-source contradiction in command composition, an unexecutable
  package/browser proof owner, or a schema/content case that cannot preserve
  the hard laws can block execution. A losing prototype or a required feature
  migration is not a blocking condition.

Plate Plan state:

- phase: execution complete
- next: none for the authorized local outcome
- handoff: local implementation and proof complete; no publication authorized

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | pass | Governing review, user-requested final pass and `go` are reconciled in this plan. |
| Task plan and execution authority verified | pass | Design was completed first; the user's subsequent `go` authorized local implementation and proof. |
| Current owners read | pass | Input runtime/types/factory/compiler, all production factories, structural override, utility plugins, Plite command/limit/lift/unwrap owners, consumers, docs and tests were inspected on `next`. |
| Best API target resolved | pass | Review `2026-09-21-editing-command-final-pass` governs; this plan resolves its open atomic outcome, factory and per-rule predicate shapes. |
| Runtime scale applicability resolved | pass | Input matching runs on every relevant character/Enter/paste; scale variables are candidate count and accepted position. Structural repairs are operation-bound and retain focused correctness proof. |
| Pre-acceptance Benchmark probe selected | pass | Matched current runtime and disposable read-before-transaction prototype, 1/16/64/256 candidates, none/first/last match, fixed max-length fixture and deterministic resolve/apply/transaction counters. |
| Mode and execution boundary resolved | pass | Deep design followed by authorized local execution; no publication. |
| Performance pack selected | pass | Input-rule hot path uses the performance-observability pack; other slices have source-backed zero-fan-out or correctness-only scope. |
| User-facing operation and runtime owner identified | pass | Typing one character through `editorCommands.insertText`; private Plate input-rule middleware is current and target owner. |
| Scale variables and cohorts fixed | pass | Candidate count 1/16/64/256 and accepted position none/first/last; 1 is normal, 16 large, 64 stress and 256 pathological. |
| Budget frozen before target measurement | pass | Nonmatch target p95 <=1.10x current or <=current+2ms/batch; accepted target p95 <=1.20x current or <=current+2ms/batch; exact output and transaction counts mandatory. |
| Baseline and target probe selected | pass | Current `InputRulesPlugin` versus disposable command middleware that resolves before opening the accepted transaction. |
| Correctness guard selected | pass | Both paths preserve the empty `maxLength: 0` fixture; execution adds all three targets, continuation, history and browser behavior. |
| Production detector decision recorded | pass | N/A: synchronous local editor command code has no production telemetry or protected-data boundary; deterministic tests, browser runtime-error capture and the private benchmark own regression detection. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source and the immutable
      review artifacts.
- [x] Reusable public call shape has one governing Best API Review verdict and
      a compiled target type probe.
- [x] The scale-sensitive input-rule target has a passing executable
      current-owner versus disposable-target benchmark receipt.
- [x] Every concept-level decision has owner, adoption, proof, risk and verdict.
- [x] Canonical model versus exact-view presentation is N/A; no render or
      mounted-view ownership changes.
- [x] Public breaks and private executor cuts have complete adoption/deletion
      answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Deferred representation and nested block-void work retain explicit
      separate proof gates rather than leaking into this plan.
- [x] Performance evidence records matched fixtures, interleaving, warmups,
      p50/p95, cold duration, deterministic work and correctness.
- [x] Final production-path rerun and browser correctness are assigned to the
      execution plan.

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every architecture/API/adoption/proof decision | pass: decision ledger and seven slices below |
| Fresh source evidence | yes | Recheck decision-changing owners and governing review | pass: live sources match the reproduced contract; benchmark receipt carries source hashes |
| Best API review | yes | Resolve atomic outcome, factory job and false public executor nouns | pass: strict read/match then apply contract and owner-bound overload compile |
| Pre-acceptance scale proof | yes | Compare matched baseline/target under frozen cohorts and budgets | pass: all 12 benchmark cases pass; nonmatches open zero target transactions and accepted cases open one |
| Production scale rerun contract | yes | Rerun identical contract on final production middleware | pass: 12/12 final-source cohorts meet the frozen budget; receipt linked below |
| Conditional risk and adoption | yes | Cover public breaks, docs, registry, behavior law and structural edge cases | pass: adoption and proof are explicit per slice |
| Verification recorded | yes | Preserve design commands/results and prior reproduced bugs | pass: artifacts and verification section below |
| Handoff prepared | yes | Summarize API, ownership, breaks, proof and execution order | pass: final handoff below |
| P1 autoreview | no | Never invoke Task Autoreview on `next` | N/A: branch policy forbids it |
| Goal plan complete | yes | Run the Autogoal plan checker | pass: checker reports complete |
| Warm latency budget | yes | Keep target within frozen p95 limits | pass in disposable target; final production rerun remains an execution gate |
| Large/stress scaling | yes | Exercise 16/64/256 candidates and none/first/last acceptance | pass in all applicable benchmark cases |
| Cold and failure paths | yes | Record cold compile/first command and prove throw aborts publication | cold duration is in the receipt; throw/abort proof is assigned to slice 1 |
| Payload and fan-out | yes | Record scalar input and rule-visit/transaction counts | fixed one-character payload; exact resolves/applies/transactions in receipt; no query/subscription/network fan-out |
| Production-path rerun | yes | Run the same benchmark after final source migration | pass: production path measured against the frozen baseline with exact work counters |
| Correctness guard | yes | Keep output, selection, history and native browser behavior green | pass: affected package lane, native Chromium cases and benchmark output guard |
| Before/after receipt | yes | Preserve current/target matched evidence | `input-rule-runtime-benchmark.json` |
| Detector and privacy | no | No production detector is justified | N/A: local editor operation, no protected data and no server boundary |
| Performance regression check | yes | Run benchmark and affected package checks | pass: final benchmark and affected package lane |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | 33/33 review census, live owner reads and four reproduced defects | Done |
| Decide | complete | Exact API/ownership ledger, compiled type probe and rejected alternatives | Done |
| Prove and hand off | complete | Matched benchmark, proof matrix, execution slices and closure commands | Execute slice 1 when authorized |
| Execute and reconcile | complete | Source migration, package/browser/registry proof and execution record below | No local action remaining |

Decision brief:

- outcome: one command pipeline where read-only matching selects at most one
  input rule, one accepted transaction publishes atomically, and structural
  policies delegate to exact canonical owners.
- chosen shape: `defineInputRule(rule)` for unbound custom rules and
  `defineInputRule(owner, rule)` for owner-capability inference; ordinary
  feature functions own options/defaults; exact action resolvers replace
  `rules.match`; Plite anchors and insertion admission repair structural laws.
- strongest rejected alternative: isolate a speculative transaction for every
  candidate and retain `apply(): false` as post-mutation decline. It can be
  correct, but it preserves an invalid state and pays transaction setup before
  knowing whether a rule matches.
- consequence: `apply` can no longer decline. Feature rules move all admission
  checks into `enabled`/`resolve`, return `next(...)` only to continue after an
  accepted prefix, and use the supplied `tx` for every mutation.

## Target public API

The current factory mixes public-option defaults, seven rule families,
descriptor binding and execution outcomes:

```ts
const createListRule = createRuleFactory(BaseListPlugin);

export const BulletedListRules = {
  markdown: createListRule<{}, { variant: '*' | '-' }>({
    type: 'blockStart',
    variant: '-',
    trigger: ' ',
    match: ({ variant }) => variant,
    apply: ({ tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.list.toggle({ type: ListType.Bulleted });
      return true;
    },
  }),
};
```

The target uses an ordinary function for ordinary options and a two-argument
overload only when owner-specific transaction capabilities are needed:

```ts
export const BulletedListRules = {
  markdown: ({ variant = '-' }: { variant?: '*' | '-' } = {}) =>
    defineInputRule(BaseListPlugin, {
      target: 'insertText',
      trigger: ' ',
      resolve: (context) => matchBlockStart(context, { match: variant }),
      apply: ({ tx }, match) => {
        tx.text.delete({ at: match.range });
        tx.list.toggle({ type: ListType.Bulleted });
      },
    }),
};
```

`defineInputRule(owner, rule)` uses `owner` as a compile-time capability
witness. Runtime ownership still comes from the plugin whose `inputRules`
declaration installs the returned rule. The overload must infer both `match`
from `resolve` and owner portals such as `tx.list`, `tx.heading` and `tx.link`
without explicit callback parameter annotations. The existing one-argument
form remains the unbound app/custom-rule shape.

The execution contract separates read and write phases:

```ts
type InputRule<TMatch, TRead, TApply> = {
  enabled?: (context: TRead) => boolean;
  resolve?: (context: TRead) => TMatch | undefined;
  apply: (
    context: TApply & { next: InputRuleNext; tx: EditorUpdateTransaction },
    match: TMatch
  ) => InputRuleContinuation | void;
};
```

- `TRead.editor` is exactly a read projection: top-level `read`, plus a
  descriptor-aware `plugin(...)` portal exposing `api`, `read`, `schema`,
  `selectors` and `store.get`. It omits top-level `update`, plugin `update` and
  store mutation. `TApply` reuses that projection and adds the sole mutation
  owner, `tx`.
- `enabled` and `resolve` receive a read-projected editor/context with no `tx`
  or continuation. `undefined` from `resolve` is the only match decline.
- Priority, trigger and MIME gates run before `resolve`. All candidates inspect
  the same immutable command state. Highest priority wins; plugin order then
  rule order remain deterministic tie-breakers.
- The first accepted rule opens one transaction. `apply` returning `void`
  consumes the command. It cannot return `boolean`.
- `next()` returns an opaque continuation token for the original command input.
  Insert-text and insert-data overloads may accept replacement input; Enter has
  no replacement argument. The token has no side effect until the runtime
  composes it once through `next.after(prefix, replacement?)`.
- A thrown matcher/apply error publishes no candidate spec and propagates. A
  rule that needs native fallback after feature work returns `next(...)`; it
  does not mutate and then pretend the rule declined.
- Semantic family options keep their declared feature fields. If a family
  retains common `enabled`/`priority` options, feature safety and caller
  `enabled` predicates compose with logical AND; a caller may narrow activation
  but may not bypass a feature invariant. Priority remains an explicit scalar
  override.

Decision ledger:

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rule attempt | One shared speculative transaction covers all candidates; `apply:false` may leak or disappear by target | Trigger/MIME/priority and read-only match first; one accepted rule gets one transaction | Private Plate input-rule middleware | Makes mutate-then-decline unrepresentable and avoids nonmatch transactions | Migrate all rule callbacks; delete boolean results | Three-target atomicity/history tests and production benchmark | Hidden apply-time preconditions must move into resolve or continue explicitly | rearchitect |
| Continuation | Side-effect callbacks plus boolean handling differ by text/Enter/data | `next(input?)` returns one opaque outcome; runtime alone calls command `next.after` once | Input-rule context/runtime | One composable command result for all targets | Link autolink and any custom continuation callers | Text/Enter/data continuation tests, including prefix + native fallback | Replacement-input overloads must preserve target/options/root | rearchitect |
| Read context | `enabled`/`resolve` receive live `tx` and a mutable editor | Read-projected context; `tx` exists only in `apply` | Public input-rule types | Matching should not own speculative writes | Replace `tx.nodes.some` with read APIs; preserve lazy selection helpers | Type assertions plus mutation-leak regression | Plugin portal projection must preserve read/store/schema inference | rearchitect |
| Feature family authoring | `createRuleFactory` is an 800-line seven-family DSL with required/default generic ordering and bivariant callbacks | Ordinary option functions + `defineInputRule(owner, rule)`; specialized matcher/builders remain reusable | Feature packages + Plate input-rule types | Preserves real package-author inference with much less API | Migrate 18 production definitions and tests/docs; delete factory and factory-only types | Compiled owner/match inference probe, package typecheck | Overload must not widen portable unbound rules | cut/replace |
| Shared family options | Factory declaration can defeat caller `enabled:false` | Feature gate AND caller gate; explicit priority override | Each semantic family | Caller can disable/narrow without bypassing feature policy | Preserve only common options actually documented/used | Focused option precedence tests | Hard break for callers that forced unsafe activation | rearchitect |
| Helper injection | `inputRules: ({ rule }) => [...]` and builder/context types | Explicit arrays only | Plugin definition/compiler | Zero production callers; duplicates public authoring language | Delete function union, builder construction and tests/docs | Typecheck and deleted-symbol sweep | Generated API references must refresh | cut |
| Executor descriptor | Public `InputRulesPlugin`/key despite always-installed private role | Private core descriptor/name; no public install/config surface | Core plugin assembly | Implementation identity is not a user job | Internal imports/barrels/key/API reference | Public import negative type/package smoke | Avoid breaking compiler lookup by public key string | move private |
| Structural predicate | Global `rules.match(rule)` shadows a whole family by first matching plugin | Each action value may be a scalar or resolver returning action/`undefined`; exact-key contributor index then node-type fallback | Plugin rule definition/compiler + private structural middleware | Predicate and action belong together; no unrelated family shadow | Blockquote and list declarations, compiler cache, tests/docs | Collision/order tests per exact key | `false` is a valid merge decision and must differ from `undefined` | rearchitect |
| Structural executor descriptor | Public `OverridePlugin` for always-installed lowering | Private core structural middleware; no public key/API | Core plugin assembly | Same false-public-owner problem as input rules | Barrels, keys, core assembly and API reference | Public import sweep and runtime tests | Do not rename it to a generic public Editing plugin | move private |
| Exit structure | Utility plugin and structural rule duplicate node construction/ancestor laws | One private schema-aware `insertExitBlock` mutation reused by both; public `ExitBreakPlugin` keeps user job | Plate structural utility over `tx.blocks.insertAfter`/node insertion | Shortcut and declarative rule must choose the same valid ancestor/default | Delegate plugin update methods and rule actions | Nested/root/named-root/before/after/history tests | Parent acceptance and root identity must be tested before sharing | consolidate |
| Normalize Types | Public path/type language can create schema-invalid heading values | Delete; forced-layout example owns one explicit correction that creates/replaces a complete schema-valid heading value | Registry example | The generic language cannot express its only real consumer correctly | Remove plugin, state/types/key/docs/API references; add local example plugin | Forced-layout package/browser test | Avoid converting this into another generic slot framework | cut |
| Single Block | Empty text projection can delete non-text content | Lossless root-block join with `\n`; unsupported non-text block insertion is rejected before publication, never silently removed | `SingleBlockPlugin` + canonical slice/command admission | One block and content preservation are both hard laws | Replace text-empty deletion heuristic; keep soft Enter | Text/marks/inline void/block void/paste/undo tests | Generic lossless joining must use schema fit/admission, not stringify | repair |
| Single Line | Same deletion risk plus newline stripping | Lossless one-line join with no separator; strip line-break code points; reject unrepresentable block content | `SingleLinePlugin` + canonical slice/command admission | Distinct one-line job | Keep separate plugin and demo editor; repair admission/correction | Same matrix plus all newline forms | Do not flatten rich non-text content silently | repair |
| Trailing Block | Hand-built `{type, children}` and callback capturing correction transaction | Build with `tx.schema.create(type)`; correction owns insertion directly; delete `insert` callback unless a current consumer appears; prove configured level events | `TrailingBlockPlugin` | Schema owns required defaults; leaked transaction callback has no production job | Migrate state/docs/tests and nested-level behavior | Root/nested/named-root/schema-required-property tests | Nested correction event reachability may require query repair | repair |
| `maxLength` replacement | Full selected sibling replacement constructs complete node before insert limiter | Limit text against the replaced range before constructing command replacement; direct transaction and command agree | Plite command builder + insert-limit helper | Admission belongs before every ordinary insertion path | Internal helper wiring, focused contracts | Selected siblings/node selection/named root/undo and max 0/partial tests | Preserve explicit imported-change exemption | repair |
| Lift/unwrap selection | Special branches sort edges and reconstruct a forward range with depth assumptions | Capture canonical live anchors for original anchor/focus, transform, resolve in original order, release | Plite lift/unwrap | Mapping owner already handles structural changes and direction | Delete manual forward reconstruction | Forward/backward/collapsed/named-root/nested/undo tests | Dropped endpoints require defined no-selection behavior | repair |
| Singular insert export | `editor/insert-node.ts` duplicates static dispatcher body | Delete file/export; canonical `EditorApi.insertNode(s)` dispatch remains | Plite public editor interface | One command entry point | Barrels/import smoke | Generated barrels may expose stale symbol path | cut |
| Examples/docs | Stale helper injection, nested `editor.update`, wrong `+` list claim, reset overclaim, editor recreation and orphan soft-break values | Current-only docs and stable demos for shipped APIs/behavior | Registry/docs/behavior owners | Teaching currently contradicts runtime and target | Update EN/CN where maintained; delete unconsumed values; preserve distinct examples | Docs parity, registry build, browser journeys | Generated registry must come from source | repair |
| Deferred cleanup | Adjacent-text rescans and nested block-void insertion remain unresolved | Keep unchanged and link separate proof prerequisites | Plite representation/block-void owners | No matched performance/parent-grammar proof | No product edits in this plan | Source sweep ensures no accidental inclusion | Scope creep | defer |

## Exact structural-rule resolution

Each leaf action accepts a scalar or an exact resolver:

```ts
type RuleDecision<TAction, TContext> =
  | TAction
  | ((context: TContext) => TAction | undefined);

const liftBlockquoteChild = (context: StructuralRuleContext) =>
  isLiftableBlockquoteChild(context) ? 'lift' : undefined;

BaseBlockquotePlugin.configure({
  rules: {
    break: { empty: liftBlockquoteChild },
    delete: { start: liftBlockquoteChild },
  },
});

BaseListPlugin.configure({
  rules: {
    merge: {
      removeEmpty: ({ node }) => (isListItem(node) ? false : undefined),
    },
  },
});
```

The compiler indexes contributors by exact key such as `break.empty` or
`merge.removeEmpty`. At runtime it evaluates non-type contributors in stable
plugin order and takes the first result that is not `undefined`; it then falls
back to the node-type owner's exact value. `false`, `'none'` and other valid
actions are decisions, not absence. There is no family replacement and no
string `MatchRules` query passed through feature code.

Execution slices:

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Atomic input-rule runtime | Plate input-rule types/compiler/private middleware | Split read/apply contexts; resolve before transaction; typed opaque continuation; deterministic ordering; internalize executor | Current tests and four reproduced defects | Mutate-then-decline type/path deleted; text/Enter/data consume/continue/history agree | Focused input-rule tests, new atomic matrix, benchmark target wired to production |
| 2. Typed authoring cut | Plate feature packages | Add owner overload; migrate 18 definitions; ordinary options/defaults; remove factory/helper injection and factory-only types | Slice 1 types stable | No `createRuleFactory`, builder injection or explicit callback annotations; all feature portals infer | Type probe moved into package contract, feature tests, typecheck, symbol census |
| 3. Exact structural policy | Plate plugin compiler/private structural middleware and feature owners | Leaf resolver values, exact-key cache, blockquote/list migration, private executor, shared exit mutation | Slices 1-2 green | `rules.match`, `MatchRules`, global family scan and duplicated exit laws gone | Override/Exit Break tests including collisions, named roots and history |
| 4. Plite structural laws | Plite core/transform owners | Limit full-block replacement; anchor-preserving lift/unwrap; delete duplicate singular dispatcher | Existing probes reproduce | Command/transaction admission agree and structural selection keeps direction/root | Plite focused contracts, prior probe upgraded to assertions, `pnpm check:plite:dev` |
| 5. Utility policy repair | Plate utilities + registry forced-layout owner | Delete Normalize Types; lossless Single Block/Line admission; schema-created trailing block; truthful correction lifetime | Structural primitives green | No silent non-text deletion or schema-invalid synthesis; local forced-layout correction owns exact title | Utility tests, package integration, focused browser demos |
| 6. Teaching and generation | Docs/registry/behavior/Vision/workflow owners | Rewrite current API, delete stale values, fix examples, doctrine repair, barrels/API reference/registry generation, Plate Next version | Public surface final | No deleted API or false behavior remains in current teaching/generated output | Source audits, docs parity, `pnpm brl`, `pnpm --filter www build:registry` |
| 7. Final proof and reconciliation | Task/Verify Plate/Benchmark/ledger | Production benchmark rerun, source-first package checks, managed browser, broad affected gates, execution record and ledger reconciliation | All code/docs settled | All gates pass on final source; adopted/proved execution linked to review | Exact commands below, plan checker and ledger checks |

Proof matrix:

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Declined rules cannot commit writes | Current probe shows target-dependent leak/discard; target removes post-write decline | Boolean apply rejected by type contract; focused text/Enter/data and history cases pass in package lane | pass |
| Nonmatching input avoids speculative transactions | Current source opens one transaction before loop | Final production benchmark records zero transactions on no match | pass |
| Accepted rules retain hot-path cost | Matched disposable target passes all first/last cohorts | Final production benchmark passes all 12 frozen cohorts | pass |
| Owner-bound definition infers feature transaction and match payload | Repository compiler passes `input-rule-target-type-probe.ts` with `tx.list` and inferred fields | Permanent package type contract and source-first typecheck pass | pass |
| Continuation is exactly once and native-equivalent | Command contract already owns `next.after(prefix)`; current wrappers diverge | Focused command tests and eight native Chromium cases pass; space autolink inserts in its accepted transaction | pass |
| Exact rule predicates do not shadow unrelated actions | Current global matcher replaces whole families | Override and feature-owner tests pass in the affected package lane | pass |
| Exit commands share schema/root law | Current two bodies create different nodes/ancestors | Exit Break package tests pass in the affected lane | pass |
| Full-block replacement respects admission | Reproduced 9 characters under max 5 through command versus 5 through tx | Plite max-length contract passes in the affected lane | pass |
| Lift/unwrap preserve direction | Reproduced backward-to-forward conversion | Plite transform contracts pass in the affected lane | pass |
| Single-content policies never infer emptiness from text projection | Source removes second block when string is empty | Single Block/Line package tests pass in the affected lane | pass |
| Trailing nodes are schema-valid | Source hand-builds type/text only | Trailing Block and nested correction package tests pass in the affected lane | pass |
| Docs and generated surfaces teach only final APIs | Current docs teach helper injection, nested update and incorrect options | Website typecheck includes API reference, docs parity and registry source checks; deleted-symbol sweep is clean | pass |

Scale contract:

- applicability and source evidence: applies to private input-rule command
  middleware. `insertText` is per keystroke; current source creates a
  transaction before knowing whether any indexed candidate matches.
- user operation, current owner, proposed owner: one headless
  `editorCommands.insertText` dispatch at a collapsed selection; current owner
  is `InputRulesPlugin`, target owner is its private read-before-transaction
  replacement.
- independent scale variables and cohorts: candidate count 1/16/64/256 and
  accepted position none/first/last. Every candidate shares the same trigger so
  the probe measures the disputed post-index scan. The document remains an
  empty paragraph at `maxLength: 0`, keeping state size fixed.
- frozen absolute/relative budget and noise rule: nonmatch target p95 must be
  <=1.10x current or <=current+2ms per batch; accepted target p95 must be
  <=1.20x or <=current+2ms. Correct output, exact visit counts and target
  transactions (zero on no match, one on accepted match) are mandatory. Nine
  measured samples follow three warmups; baseline/target order alternates.
- current baseline command/artifact and source identity:
  `cd packages/platejs && bun --preload ../../config/plite-source-aliases.ts ../../docs/plans/artifacts/editing-command-and-input-rule-convergence/input-rule-runtime-benchmark.ts`;
  source hashes are embedded in `input-rule-runtime-benchmark.json`.
- target command/artifact or disposable prototype and source identity: same
  command and artifact; `input-rule-runtime-benchmark.ts` contains the smallest
  command middleware prototype and is not production code.
- deterministic work indicators plus timing result: exact resolve/apply and
  transaction counts, cold duration, warm p50/p95. All 12 cases pass. Current
  no-match opens one transaction per operation; target opens zero. Accepted
  paths both open one. Target accepted p95 ratios remain within budget; target
  no-match is materially faster in every cohort in this receipt.
- payload/fan-out: one scalar character, no serialization, queries,
  subscriptions, renders, network or protected data. Candidate visits are the
  only fan-out and are recorded exactly.
- correctness/native guard: both paths preserve the empty max-length fixture;
  final execution adds command result, selection, undo/history and managed
  browser behavior for feature rules.
- final production-path rerun owner and exact command: Benchmark/Task rerun the
  same command after the disposable target has been replaced by final source,
  then run the focused Plate tests and
  `pnpm --filter www test:www-browser:chromium apps/www/tests/browser/autoformat.spec.ts`.

Conditional evidence:

- High-risk scenarios: apply throws after draft mutation; continuation changes
  insert text/data input; a previous candidate matches false after expensive
  reads; equal priorities across plugins; feature safety plus caller gate;
  named-root insertion; backward multi-block selection; max-length replacement
  with zero/partial capacity; block/inline voids in single-content fields;
  required schema properties in trailing/forced blocks; undo/redo after every
  structural path.
- External research: consumed from the governing review. Local ProseMirror,
  Tiptap and Lexical sources support declarative indexed rules and accepted-only
  publication. The stricter read-before-transaction target is Plate-specific
  and has its own executable receipt.
- Issue/PR provenance: N/A; this is a repository architecture review/plan, not
  a reporter-backed issue or publication request.
- Docs/registry/browser/release/behavior-law owners: current English docs and
  maintained Chinese mirrors where touched; registry source and generated
  output; managed Chromium autoformat and focused utility journeys;
  `docs/editor-behavior/markdown-editing-spec.md`; Plate/Plite Vision and
  affected Best API/Plate Next teaching. Release is N/A.
- Performance pack, pre-acceptance receipt and final rerun: design receipt is
  retained beside this plan; final-source rerun is mandatory in slice 7.

Findings:

- The review's candidate-transaction suggestion was still too conservative.
  `apply:false` is the source of the invalid state. Removing post-mutation
  decline gives a smaller contract and avoids transaction setup on misses.
- The package-author factory job is real, but the factory DSL is not. A
  two-argument overload on the existing `defineInputRule` preserves the hard
  inference requirement; ordinary functions already solve required/default
  options better than generic parameter ordering.
- `rules.match` is not merely slow or awkward. It gives one predicate authority
  over unrelated members of an entire family and even names affinity although
  affinity bypasses it. Exact leaf resolution is the smallest truthful model.
- The structural regressions are owner bugs, not evidence for a new editing
  abstraction. Insert admission belongs in Plite's command path; selection
  direction belongs in canonical anchors/mapping.
- `NormalizeTypesPlugin` has one app consumer and cannot construct that
  consumer's current heading schema. Deleting it is safer than generalizing a
  positional slot language.
- Single Block/Line and Trailing Block remain useful policies, but their current
  text-projection and hand-built-node shortcuts violate complete-content and
  schema laws.

Decisions and tradeoffs:

- Keep `enabled` and `resolve` as separate read phases because package policy
  and syntax matching are independent authoring jobs. Remove `tx` from both.
- Keep specialized input-rule matchers/builders as public reusable algorithms
  when they retain direct custom-rule use. Do not preserve factory-only types.
- Keep public semantic families (`HeadingRules`, `ListRules`, `MathRules`, and
  peers); their names carry feature meaning and avoid copied matcher code.
- Keep `ExitBreakPlugin` because explicit before/after exit commands and chosen
  shortcuts are a user job. Consolidate its mutation body with rule exits.
- Do not promote a generic exit command to Plite. The disputed ancestor policy
  depends on Plate feature/schema semantics, while Plite's existing insertion
  primitives are sufficient once Plate resolves the target.
- Reject automatic flattening of unrepresentable block voids in single-content
  fields. Preserve content by rejecting the insertion/invalid transaction
  explicitly; never delete it because its text projection is empty.
- Keep the two deferred audit rows unchanged. They need separate parent-grammar
  and complete-operation mapping/performance evidence.

Review fixes:

- Replaced speculative per-candidate transactions with read-before-transaction
  selection after proving the latter's type and hot-path shape.
- Replaced the undecided factory comparison with the smaller
  `defineInputRule(owner, rule)` target and compiled it against `tx.list`.
- Resolved global matcher replacement as exact leaf action resolvers, including
  the important `false` versus `undefined` distinction.
- Resolved exit consolidation without adding a public Plite exit noun.

Error attempts:

| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| One-off `tsc` file invocation skipped repository JSX/config | 1 | Add a tiny extending project config | Type probe passes with repository compiler settings |
| Benchmark plugin names used hyphenated IDs rejected by Plate | 1 | Generate camel-case benchmark names | Benchmark editors initialize correctly |
| First benchmark workload was disproportionate for planning | 1 | Freeze a smaller fixed evaluation budget while retaining all cohorts and nine samples | Final receipt completes with stable counters/percentiles |
| Benchmark receipt read source hashes relative to package cwd | 1 | Resolve files from `import.meta.dir` to repository root | Final JSON embeds source hashes |

Verification evidence:

- Reused governing baseline: 35 input-rule tests, 85 assertions, plus executed
  probes for target-dependent mutation fallback, factory enabled precedence,
  selected-sibling `maxLength` bypass and backward-selection reversal in
  `docs/plans/artifacts/editing-api-review/proof.json`.
- `pnpm exec tsc -p docs/plans/artifacts/editing-command-and-input-rule-convergence/tsconfig.json`
  passes. The probe requires inferred `match.marker`, `match.url` and
  descriptor-bound `tx.list` without callback annotations.
- `input-rule-runtime-benchmark.ts` produces
  `input-rule-runtime-benchmark.json`; all twelve cohort/position cases pass the
  frozen budget and correctness guard.
- The plan checker reports complete. `review-ledger check` exits successfully;
  it reports an unrelated stale `capability/audio` inventory while the `editing`
  review source itself remains `matching` and this plan is linked as `planned`.

Final handoff prepared:

- Ownership and target API: private Plate command middleware; one- or
  two-argument `defineInputRule`; ordinary semantic family functions; exact
  structural leaf resolvers; Plite owns admission and mapped selection.
- Public breaks and adoption: delete `createRuleFactory`, helper injection,
  public input/override executor descriptors and `NormalizeTypesPlugin`; migrate
  all callers/docs/generated references in the same execution.
- Applicable runtime/package/docs/browser decisions: all seven slices name
  source owners and focused proof; registry changes regenerate on `next`.
- Scale applicability, design receipt and production rerun contract: complete
  above; final production rerun is an execution gate.
- Proof and execution risks: continuation/root fidelity, plugin read
  projection, exact rule collision order, unrepresentable single-content nodes
  and nested trailing correction reachability.
- Execution order and user attention: slices 1-2 lock the public contract,
  slices 3-5 migrate structural/policy owners, slice 6 teaches/generates, slice
  7 proves and records adoption. No user decision is currently required.

Timeline:

- 2026-09-21: plan created from review
  `2026-09-21-editing-command-final-pass`.
- 2026-09-21: live owners and consumers re-read; candidate-transaction target
  challenged from first principles.
- 2026-09-21: owner-bound API type probe passed and matched hot-path benchmark
  accepted across normal through pathological cohorts.
- 2026-09-21: exact structural/action, utility-policy and Plite repair adoption
  resolved; handoff prepared.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Local implementation and required proof complete |
| Where am I going? | No further authorized local action |
| What is the goal? | One atomic command pipeline with exact feature policy and canonical structural laws |
| What have I learned? | Match-before-transaction avoids speculative rollback; native input may carry an explicit range equal to the live selection |
| What have I done? | Migrated the owners and callers, repaired native math/autolink, generated output, and proved the final source |

Open risks:

- The exact read projection must retain feature read/store/schema inference
  while compile-time negative assertions keep top-level update, plugin update
  and store mutation inaccessible.
- Some existing `apply` callbacks use mutation success as a late branch. Each
  must choose consume or explicit `next(...)`; no boolean compatibility path is
  allowed.
- Single-content rejection must surface as a stable command/admission result and
  must not create correction loops or silently preserve an invalid two-block
  state.
- Trailing Block's nested `level` may require a broader correction event query.
  The plan keeps the feature only if focused nested mutation proof is green.

## Local execution outcome

The seven slices are implemented in this checkout. Input-rule resolution reads
the pre-command state, selects one rule, and opens one accepted transaction.
Owner-bound `defineInputRule` and ordinary feature functions replace the factory
DSL. Exact structural leaf rules replace family-wide `rules.match`; exit
insertion shares one owner. Plite admits complete replacements under
`maxLength` and preserves lift/unwrap direction. Single-content and trailing
policies preserve content and schema requirements; Normalize Types is deleted.
Callers, current docs, behavior law, doctrine and generated registry output use
the final shape.

Native Chromium proof exposed two additional boundary errors and they were
repaired before closure. Native `insertText` may supply `options.at` equal to
the current selection; math and link input rules accept that range while still
declining a different explicit target. A space after a link at the end of a
paragraph stays in that paragraph: link exit does not jump into a following
block, and the accepted rule inserts the space in the same transaction.

Final-source proof:

The concise command receipt is
`docs/plans/artifacts/editing-command-and-input-rule-convergence/final-verification.json`.

- `pnpm check:plite:dev`: passed at the first execution checkpoint. The final
  shared-checkout rerun reaches package tests but does not pass: the
  `@platejs/test` aggregate sees partition cache misses after its tasks run.
  Its direct package entrypoint passes 37 tasks. The separate Plite React
  partition has two authority-audit failures in concurrently changed
  `selection-void-target.ts`; the editing-owned Plite core partition passes
  1,670 tests, Plate passes 137 package test tasks, and direct Plite browser
  smoke passes 3 cases.
- `pnpm --filter platejs typecheck`: pass, 88 source-first tasks.
- `pnpm --filter www typecheck`: pass, including editor generation check, API
  reference, docs source parity, registry source check and TypeScript.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www
  test:www-browser:chromium tests/browser/autoformat.spec.ts`: 8/8 native
  interaction cases pass without runtime errors. Cases cover substitution,
  heading, list, code fence, inline and block math, autolink space/Enter and
  paste payload; space autolink also proves continued typing and the following
  paragraph.
- `pnpm brl`, `pnpm --filter www build:registry`, `pnpm install`, and Plate
  Next version validation: pass.
- Production input-rule benchmark: 12/12 frozen cohorts meet the budget,
  preserve exact work counters and the `maxLength: 0` guard. The source-linked
  receipt is
  `docs/plans/artifacts/editing-command-and-input-rule-convergence/input-rule-runtime-benchmark.json`.
- Deleted public-name sweep over package source, type contracts, registry and
  docs: no matches.

Full shared-checkout CI is not green. Package-wide lint has unrelated unused
`NodeApi` and `PathApi` imports in media and formatting in the Plite caret
engine and object-selection test. The Plite React test partition has the two
authority-audit failures above. Editing-owner files pass focused Oxlint and
format checks. These concurrent files are outside this plan's ownership; no
commit, push, PR or release was requested.
