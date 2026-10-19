# Wordgard Plite command dispatch architecture

Objective:
Design Plite command dispatch architecture against Wordgard; done when the
complete live-source ledger, target API, deletion/adoption slices, and checker
pass.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-21-wordgard-plite-command-dispatch-architecture.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `deep`: the target crosses public command typing, middleware composition,
  transactions, extension configuration, Plate adoption, persistence, and hot
  dispatch paths; the user explicitly requires an exhaustive donor comparison.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Live source manifests for every command-related owner in `../wordgard`,
  `packages/plite*`, `packages/core`, direct Plate command/plugin adopters,
  History, Yjs, host packages, tests, docs, and benchmarks.
- A complete concept ledger with one classification and verdict per discovered
  mechanism; source-manifest reconciliation proves no discovered mechanism is
  unaccounted for.
- Type/API examples match the sole live factory syntax; focused execution proof
  runs per vertical slice before aggregate closure.
- `check-complete.mjs` passes after a fresh source-evidence audit.

Constraints:
- The user accepted this plan for uninterrupted implementation. Focused command
  proof may run during adoption; aggregate Plite/browser closure remains the
  final gate.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Breaking changes and major rewrites are allowed; local patches that avoid the
  owning abstraction are rejected.
- Preserve only Plite strengths proven better: JSON-native values, structural
  typing, multi-root documents, canonical `DocumentChange`, collaboration,
  React/browser behavior, and Plate extensibility.
- Do not trust older plans or completion reports; live source is authoritative.
- Do not copy Wordgard mechanisms whose apparent cleanliness comes from a
  narrower product surface or class identity.

Boundaries:
- In scope: the complete architecture behind command declaration, identity,
  payload/result typing, creation, dispatch, handling, fallback/chaining,
  composition, precedence, conflicts, state/transaction access, reentrancy,
  failure/rollback, metadata/effects, extension configuration, compilation,
  caching, serialization, history/Yjs consequences, host/React/DOM invocation,
  Plate plugin/adopter DX, testing, fuzzing, benchmarks, and deletion fallout.
- Named target: replace descriptor-owned registration methods and array-valued
  command slots with one extension factory that receives `handle` and `around`.
- Source owners: discover from live imports/exports in `../wordgard` and the
  current checkout; expected starting owners are Wordgard command/state/change
  modules, Plite editor commands/extensions/transactions, Plate plugin command
  registration and consumers, History, Yjs, DOM/React hosts, docs, tests, and
  benchmarks.
- Non-goals: compatibility design, unrelated editor ontology, and
  product-specific command menus/toolbars.
- Direct adoption owners: every live Plate package or app declaring, handling,
  dispatching, wrapping, or reflecting commands; Plite History/Yjs/host owners
  only where the target changes their contract.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if `../wordgard` or a live checkout owner is unreadable, or if a
  genuinely product-direction-changing ambiguity remains after source and
  doctrine evidence. Do not block while a dependency edge, test, type, or
  benchmark can resolve it.

Plite Plan state:
- status: ready-for-acceptance
- phase: prove-and-hand-off
- next: user acceptance or rejection
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | This plan records the exhaustive inventory, every requested classification/verdict/deliverable, hard-cut policy, live-source authority, accepted execution boundary, and exact command-handler target. |
| Active goal and plan verified | yes | Goal `019f8448-1f3e-7e02-bf3f-d94232149430` names this exact accepted architecture. |
| Current owners read | yes | The dependency graph was screened across 28 Wordgard command-connected files, 36 live Plite/host owner files, 43 current handler-registration files, current docs, type/public-surface tests, browser scenarios, History, and the absence of any Yjs command dependency. Exact reconciliation is below. |
| Mode and execution boundary resolved | yes | Deep, agent-led execution; no compatibility syntax and no pause between accepted slices. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have complete adoption/deletion answers; no bridge is allowed or needed.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] The dependency-derived concept inventory reconciles every relevant
      Wordgard and Plite/Plate source owner; no generic checklist or sample is
      substituted for the live graph.
- [x] Every concept classifies live Plite as `superior`, `inferior`,
      `equivalent`, or `different tradeoff`, with exact evidence from both repos
      and a blunt explanation.
- [x] Every Wordgard mechanism receives `keep`, `steal`, `rearchitect`,
      `hard-cut`, `move`, `reject`, or evidence-backed `defer`.
- [x] Suspicious current shapes answer owner, leaked detail, derivability,
      split/unification, permissiveness/order, DX, Plate glue, large-doc/
      collaboration/history/reconfiguration survivability, and deletion.
- [x] Final public API examples cover simple application dispatch, advanced
      composition, extension authors, Plate plugin authors, fallback/next,
      transaction-local invocation, typed results, and failure semantics.
- [x] Final internal design names compiled representation, invariants,
      lifecycle, ownership, caching, structural sharing, and fault isolation.
- [x] The plan explains precisely where the target exceeds Wordgard rather
      than merely cloning it.
- [x] The deletion ledger and adoption matrix cover every current API, helper,
      compatibility path, normalization loop, duplicated owner, obsolete test,
      Plite/Plate package, host, codec, History, Yjs, docs, example, fixture,
      benchmark, and downstream caller implicated by the live graph.
- [x] Ordered vertical slices each name owner, entry/exit, public breaks,
      adoption, focused tests, generated laws, browser proof, benchmarks, and
      hard-deletion gates.
- [x] Final closure audit proves every donor mechanism and preserved/rejected
      Plite strength is accounted for; no useful Wordgard mechanism remains.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Every ledger row has a classification, donor verdict, owner, adoption, proof, and risk; all breaks are assigned to slices. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Fresh `rg`/numbered-source audits on 2026-07-21 found 61 production registrations, 86 total registrations in 43 files, 18 production `next.after` calls, nine input-rewrite continuations, and no Yjs command import. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Five high-risk scenarios, 13 adoption owners, generated laws, focused browser rows, and command-dispatch benchmarks are specified below; issue provenance is inapplicable because this is a source-led architecture request. |
| Verification recorded | yes | Record fresh source and focused execution proof | Source reconciliation, implementation decisions, and focused proof are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section names the target, breaks, adoption, proof, risks, and acceptance boundary. |
| Autoreview | no | Run after aggregate implementation stabilizes | Focused command proof is green; aggregate execution ends with `autoreview`. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-21-wordgard-plite-command-dispatch-architecture.md` | Checker result is recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live donor/current dependency graph, docs, proof, and callers reconciled | Decide |
| Decide | complete | Forty-two concept decisions and eleven ranked changes resolved | Implement |
| Implement command declaration hard cut | complete | Factory declarations, typed custom-editor fixture, Plate composition, callers, and docs migrated | Aggregate proof |
| Prove and hand off | complete | Focused command laws, affected behavioral suites, source typechecks, and strict benchmark pass | Aggregate Plite/browser closure stays with the active parent architecture goal |

Decision brief:
- outcome: Improve the API. The current descriptor/pure-spec foundation is
  stronger than Wordgard, but the public callback shape and direct-update
  lowering are not good enough to keep.
- chosen shape: A frozen structurally typed `EditorCommand<Input, TEditor>`
  owns a stable `id`, optional pure input preparation, and a pure default
  builder. `commands: ({ handle, around }) => [...]` is the sole declaration
  API. `handle(descriptor, handler)` automatically falls through on `false`;
  only `around(descriptor, handler)` exposes continuation, input rewriting, and
  `next.after`. Commands stay under `editor.update.command`/`tx.command`;
  `editor.update.*` remains the normal discoverable mutation API and active
  `tx.*` remains primitive.
- TypeScript verdict: descriptor registration methods cannot contextually bind
  the actual extension editor through a heterogeneous command array without
  annotations, casts, or erased public types. The extension-owned factory binds
  `TEditor` first, then accepts the descriptor first so command input and editor
  state/tx namespaces infer together. Descriptor identity stays explicit; the
  descriptor exposes no registration methods.
- strongest rejected alternative: Copy Wordgard's function-identity command,
  full-editor handler, implicit truthy dispatch, and opaque `Command.bind`.
  It is shorter because Wordgard puts model, DOM, keymaps, menus, and dialogs
  behind one editor object; it loses structural identity, rollback safety,
  multi-root ownership, serializable change truth, and Plate's package boundary.
- consequence: Public command types and registrations break once. All payload
  `type` fields, raw string/token registrations, per-handler priority, the
  generic `next` parameter, the method-name lowering switch, and singular
  `EditorCommit.command` disappear. Sixty-one production registrations and
  their tests/docs adopt the clean split with no alias or dual signature.
- linked schema invariant: commands consume the compiled schema owner and never
  accept or synthesize identity. Plate omission selects
  `{ kind: 'derived', fingerprint }`; explicit `id/version` selects
  `{ kind: 'named', id, version, fingerprint }`; lineage is excluded from the
  fingerprint. Command specs therefore remain semantic and identity-agnostic.

Source inventory and reconciliation:

- Wordgard graph: 28 command-connected TypeScript files were screened. The
  defining owners are `src/command/{command,commands,helper,index,menu}.ts`,
  `src/state/{state,transaction,correction,index}.ts`,
  `src/editor/{editor,input,inputrule,keymap,menubar}.ts`,
  `src/history/history.ts`, `src/table/{cellselection,tablecommands,menu,index}.ts`,
  and schema contributors `src/schema/{block,image,imagedialog,list,mark}.ts`.
  Proof owners are `test/{test-commands,test-history,test-table-commands,
  webtest-commands,webtest-editor}.ts`. Every mechanism exposed by these files
  maps to rows C1-C42 below.
- Plite/host graph: the 36 implementation files matched by command definition,
  dispatch, handler lookup, direct lowering, or commit-command consumption are
  `packages/plite/src/core/{command-definition,command-registry,
  editor-commands,editor-runtime,public-state}.ts`, `create-editor.ts`,
  `editor-runtime-view.ts`, `interfaces/editor.ts`, public/internal indexes,
  ten legacy editor helper entrypoints plus `transforms-selection/move.ts`,
  `packages/plite-dom/src/plugin/{dom-clipboard-runtime,host-codec}.ts`,
  nine `packages/plite-react` runtime/input owners, the History extension, and
  three Plate core policy extensions. Yjs has no command import or
  `commit.command` dependency; it remains a canonical-change consumer.
- Registration graph: the pre-cut source audit found 86 command registrations
  in 43 files, of which 61 were production registrations in 33 files.
  Production owners are
  Plate `ai`, `code-block`, `combobox`, `core`, `link`, `list`, `legacy-list-model`,
  `selection`, `suggestion`, `table`, `tag`, `toggle`, `utils`, plus five Plite
  examples. The other ten files are Plite, React, History, and package proof.
  There are 18 production `next.after` calls and nine input-rewrite `next({...})`
  calls; the rest overwhelmingly expose `next` merely to say `return next()`.
- Public teaching/proof graph: `content/docs/plite/concepts/06-commands.mdx`,
  `walkthroughs/05-executing-commands.mdx`, `libraries/plite.mdx`, the five
  Plite examples, Plite command/transaction/extension/type/public-import tests,
  DOM clipboard tests, React mutation/Android/input/selection tests, History
  tests, browser richtext/inlines/tables/check-list/markdown/paste/stress rows,
  and command-profile ids were read. The concepts page currently teaches a
  nonexistent `insertText.execute(...)` at lines 61-66, proving docs and source
  already disagree.
- Reconciliation: 28 donor files + 36 current implementation files + 43
  registration files + the named docs/browser/benchmark surfaces are all
  assigned in the concept ledger, adoption matrix, deletion ledger, or an
  explicit rejection. No command-connected source owner remains unclassified.

Complete concept ledger:

| ID | Concept | Wordgard evidence | Live Plite/Plate evidence | Plite class | Ideal target and owner | Donor verdict | Adoption / proof / risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C1 | Concept and terminology | `command.ts:15-43` defines command as function, param, side effect/spec/false | `interfaces/editor.ts:1615-1719` calls the payload, descriptor, registration, and callback all “command” | inferior | Descriptor is `EditorCommand<Input>`; invocation data is `input`; registered behavior is `handle` or `around`; Plite core owns vocabulary | rearchitect | Rename public types and every callback; type/public-doc proof; risk is churn, not semantic ambiguity |
| C2 | Command identity | `command.ts:37-43,78-95` uses function identity | `command-registry.ts:42-59` uses an arbitrary string from descriptor, token, or raw string | different tradeoff | Frozen plain descriptor identity plus stable diagnostic `id`; compiled config rejects two descriptor identities for one id | reject function identity | Remove raw string references and tokens; collision/config laws; risk is hot-reload duplicate descriptors, which must fail loudly |
| C3 | Stable identifier | Wordgard has no stable name beyond function/debug identity | Every payload repeats `type`; registry and commit metadata use it (`interfaces/editor.ts:1615-1685`) | superior but wasteful | Descriptor owns namespaced `id`; input never repeats it; id is diagnostics/config identity, not document truth | keep and simplify | Remove all payload `type` fields/call-site literals; compile/type sweep |
| C4 | Input representation | `Command<Param>` keeps parameter separate (`command.ts:43,78-95`) | `EditorCommand` is an open object containing discriminator and `[key:string]: unknown` (`interfaces/editor.ts:1615-1618`) | inferior | `Input` is an exact readonly structural type independent of identity; `void` for no-input commands | steal | Rewrite built-in interfaces and 233-ish discriminator-bearing source/test matches; inference tests |
| C5 | Generic inference | Wordgard's function generic infers `Param`, but handler facet erases it through `any` (`command.ts:5-12,65-67`) | Definition/handler callbacks infer payload and editor state, but extension storage/registry erase through `any` and History casts its state (`interfaces/editor.ts:1638-1719,1967`; `history-extension.ts:235-258`) | different tradeoff | `EditorCommand<Input,TEditor>` preserves input and installed state; registration carries a private erased adapter with no exported `any` | rearchitect | History/defaults and generic type fixtures; risk is TS variance complexity, never papered over with callback annotations |
| C6 | Default implementation | The command function is both token and default (`command.ts:37-43,90-94`) | Descriptor has public `run(context)` (`command-definition.ts:16-40`) | superior | `defineCommand<Input,TEditor>(id, spec?)`; optional pure `build(state,input,options?)` default, false when absent | keep with rename | Migrate built-ins/History/tests; `build` must clearly mean no dispatch/handlers |
| C7 | Command without default | `undo`/`redo` are inert functions returning false and History registers handlers (`commands.ts:562-567`; `history.ts:102-110`) | Separate `defineCommandType` token exists but is only meaningfully exercised in tests; History instead uses private full definitions | equivalent | One descriptor constructor with optional default; delete token/reference variants | steal simplicity | Remove `defineCommandType`; public-import/docs/history tests; risk is accidental dispatch of unowned token, handled as false |
| C8 | Input preparation and snapshotting | Params pass through unchanged | `definePreparedCommand` stores a normalizer in a private WeakMap and re-prepares each override (`command-definition.ts:10-58`; replace slice at `editor-commands.ts:698-708`) | superior semantics, inferior shape | Optional pure `prepare(input): input` belongs to descriptor definition and runs on initial input and every around rewrite; no public WeakMap helper | rearchitect | ReplaceSlice immutable-input laws; no generic deep clone; risk is expensive preparation inside long chains |
| C9 | Pure/headless command | `Command.Pure` is state to false/spec and is directly unit tested (`command.ts:45-61`; `test-commands.ts:50-75`) | Defaults and handlers return immutable specs; command tests prove zero publication (`command-spec.test.ts:61-95`) | superior | Keep pure build as the only Plite command effect; headless `build` is explicit and bypasses registered policy | keep | Build/dispatch equivalence tests; docs must not invent `.execute` |
| C10 | Imperative/DOM command | Base command may receive full `Wordgard`, dispatch, open dialogs, or query geometry (`command.ts:15-32`; `commands.ts:108-130,491-532`) | Handlers receive read state/tags only; DOM host resolves geometry then dispatches model commands (`caret-engine.ts:438-750`) | superior | Plite commands remain model-pure; Plite DOM/React owns geometry/input; Plate/product code owns dialogs and external side effects | reject | Browser movement/input proof; risk is tempting plugin authors to close over editor side effects—document as invalid and abort-unsafe |
| C11 | Result algebra | `false`, truthy boolean, or spec; truthy side effects count handled (`command.ts:15-32,86-94`) | Exactly `false | TransactionSpec`, runtime asserted (`command-registry.ts:128-142`) | superior | Preserve `false | TransactionSpec`; dispatch returns boolean; empty spec is deliberate handled no-op | keep | Invalid-result and empty-spec tests |
| C12 | Primary application mutation API | Wordgard routes keymaps/menus through commands | Slate doctrine says `editor.update` and tx groups are primary; docs also show ordinary helpers, though they contradict custom-command execution | superior | Commands are semantic interception infrastructure, not `editor.commands`; app/Plate APIs remain discoverable `editor.update.*` and installed tx groups | reject command-first app API | Docs/examples/Plate shortcuts; risk is hiding a missing plugin tx method behind raw command dispatch |
| C13 | Dispatch boundary | `Command.dispatch` searches handlers, invokes default, then `wg.dispatch` (`command.ts:78-95`) | `editor.update.command`/`tx.command` run chain and apply one spec; host has internal `dispatchCommand` (`command-registry.ts:99-126,248-270`) | superior | Keep public dispatch under update lifecycle and internal host dispatcher; no root `editor.command` | keep | One-shot/active transaction/one-commit laws |
| C14 | Handler registration DX | `Command.handler(command, handler)` returns an extension (`command.ts:63-68`) | Descriptor-collocated registration preserves input inference only while the descriptor fixes the editor type (`command-definition.ts:24-33`) | inferior for extension-aware typing | Use the extension-owned `commands` factory with descriptor-first `handle`/`around`; the outer extension generic binds the actual editor before each command is checked | rearchitect | Custom installed-editor inference and extension tuple tests; zero annotations/casts |
| C15 | Ordinary fallback | Handlers return false; dispatcher automatically continues (`command.ts:84-91`) | False also continues, but virtually every caller receives `next` and spells `return next()` (`command-registry.ts:224-245`; 61 production registrations) | inferior | Factory `handle(descriptor, handler)` receives no continuation; false automatically continues; spec handles | steal | Mechanical simple-handler migration; generated handler-chain reference law |
| C16 | Around/delegating behavior | No explicit continuation; a handler cannot safely wrap/rewrite downstream behavior | Every handler gets `next`, input override, and `next.after` even when unused (`interfaces/editor.ts:1697-1710`) | superior power, inferior DX | The extension factory separates `handle(descriptor, handler)` from `around(descriptor, handler)`; only advanced registrations see continuation | rearchitect | 18 prefix and nine rewrite adopters; once-only/delegated-result laws |
| C17 | Input rewrite | Wordgard handler can call another function manually but cannot continue same chain with changed param | `next(overrideCommand)` is typed and re-prepared (`command-registry.ts:195-212`) | superior | `around` calls `next(nextInput)`; input contains no id to spread or corrupt | keep and simplify | Suggestion/code-block/table/affinity/input-rule adoption; rewrite-order laws |
| C18 | Prefix before downstream | Wordgard has no per-command equivalent; generic transaction merge/extenders are broader | `next.after(prefix,input?)` evaluates downstream on prefix state and atomically discards prefix if downstream declines (`public-state.ts:4230-4252`; command tests 740-839) | superior | Keep `next.after` only on advanced continuation | keep | Prefix selection/effect/tag/false/throw/generated composition laws |
| C19 | Post-processing downstream | Wordgard handlers stop at first truthy result; no typed post-composition | Plite can `state.transaction.extend(next(), fn)` and validates ancestry (`command-spec.test.ts:721-738,898-919`) | superior | Keep general transaction extension rather than adding command-specific `then` sugar | keep | Stale/cross-editor/lineage laws; risk is draft creation cost |
| C20 | Delegation misuse | No continuation means no misuse guard | Plite rejects double `next` and discarded downstream result (`command-registry.ts:184-241`; tests 689-718) | superior | Preserve guards for factory `around`; factory `handle` has no misuse surface | keep | Runtime contract tests |
| C21 | Handler ordering | Facet order uses five precedence bands then extension tree order (`state.ts:700-770`) | Numeric registration priority plus extension priority, sorted with module-global `commandOrder` (`command-registry.ts:31-86`; `editor-extension.ts:611-621`) | different tradeoff | One compiled extension order: extension priority/dependency resolution then declaration order; delete command-local priority and global counter | rearchitect | Reconfiguration/ordering laws and production priority audit; risk is changed tie order, fixed by explicit fixtures |
| C22 | Dependencies and conflicts | General extension tree/compartments have precedence but no named dependency/conflict contract | Extensions declare dependencies, peer dependencies, and conflicts (`interfaces/editor.ts:1967-1989`) | superior | Preserve named configuration graph as command pipeline owner | reject donor limitation | Failed dependency/conflict/cycle tests |
| C23 | Transactional reconfiguration | Compartments reconfigure through a transaction effect and configuration reuses facet values (`state.ts:622-670,773-801`) | Detached candidate config, revision publication, abort-safe validation/activation are tested (`extension-configuration.test.ts:33-187,457-525`) | superior | Compile an immutable command table inside each candidate configuration and atomically swap it with the revision | steal only transactional principle | Reconfigure while dispatch idle; collision failure leaves old pipeline; no mixed revision |
| C24 | Compiled representation/cache | Command facet combines a Map per state configuration (`command.ts:5-14`); keymap has WeakMap cache (`keymap.ts:285-315`) | Registry stores mutable arrays in `Map<string,unknown[]>`; sorts while registering and allocates continuation per handler (`extension-registry.ts:40-60`; registry) | inferior | Frozen `Map<descriptor, CompiledCommandPipeline>` plus `Map<id,descriptor>`; precomputed simple/around entries, local ranks, handler-presence bit; no dispatch sorting | rearchitect | Dispatch benchmark and immutable registry tests; risk is configuration rebuild memory |
| C25 | Handler-presence query | No equivalent; Wordgard always dispatches command | React/Android asks `hasCommandHandler` to choose native flush behavior (`runtime-before-input-events.ts:381-406`; Android manager 97-101) | superior necessity | Keep internal `hasCommandHandler(editor, descriptor)` backed by compiled pipeline; never accept raw string | keep | Android/native text flush proof; risk is false negative after reconfigure |
| C26 | Error and rollback | Imperative handlers may already have external side effects when a later step fails | Invalid results throw; transaction drafts abort; handler exceptions propagate | superior | Command errors are policy errors: propagate and abort atomically, never send to optional-provider error sink | keep | Handler/default/prepare/around throw laws; verify no commit, anchor move, config mutation, or DOM publication |
| C27 | Reentrancy and nesting | Commands can imperatively dispatch unless editor flush guard trips (`editor.ts:177-181`) | Public nested updates reject; `tx.command` permits explicit sequential semantic commands in one update (`command-spec.test.ts:139-188,192-210`) | superior | Preserve explicit transaction-local composition; command builders cannot start updates or see editor; add command recursion cycle/depth diagnostics | rearchitect | Self/mutual recursion and sequential-command laws; risk is legitimate recursive product algorithm, which should use primitives |
| C28 | State observed by downstream | Each Wordgard handler reads current editor state before any returned spec is dispatched | Plite can evaluate downstream on a prepared prefix draft (`next.after`) and exposes active tags (`command-registry.ts:156-219`) | superior | Preserve committed/draft read discipline: ordinary next sees same base; `next.after` sees prefix; no ambient editor read | keep | Generated state-observation and tag propagation laws |
| C29 | One-shot semantic helper vs active primitive | Wordgard does not expose this distinction; commands are the main action layer | Current tests intentionally make `editor.update.text.insert` intercepted and `tx.text.insert` primitive (`command-spec.test.ts:213-234`) | superior architecture, confusing teaching | Preserve the distinction: one-shot update methods represent public semantic intent, active tx methods are explicit primitive composition | keep and document | Direct/callback parity-by-contract tests; risk is callers assuming textual identity means identical interception |
| C30 | Direct-helper lowering owner | Wordgard keymap/input explicitly chooses command | Plite Proxy sends group/method strings through a 180-line switch (`editor-lifecycle-api.ts:398-458`; `editor-commands.ts:744-930`) | inferior | Command-backed one-shot methods declare their descriptor/lowering beside the method definition; the compiled update facade invokes it without string switches | hard-cut | Delete switch and `runDirectCommand`; method/command coverage contract; risk is a helper silently losing interception |
| C31 | Multi-root and read-only views | Wordgard commands target its single state/view | Plite routes command through the dispatching view root and rejects read-only view (`editor-runtime-view.ts:798-810`; tests 531-602) | superior | Preserve root-bound state/spec/selection and pre-dispatch read-only rejection | reject donor limitation | Multi-root main/named/read-only command laws and browser multi-root history |
| C32 | Commit command metadata | Wordgard records semantic `userEvent` annotations, not a command descriptor (`transaction.ts:189-273`) | Singular `EditorCommit.command` stores first active `{origin,type}`; React only checks origin (`interfaces/editor.ts:1682-1685`; `selection-runtime.ts:60-80`) | inferior | Delete singular command field. Dispatcher adds a reduced `semantic-command` update tag; command id remains profiler/kernel diagnostic, never commit/replay truth | rearchitect | React selection, browser last-commit fixtures, commit JSON/surface tests; risk is losing debugging detail, retained in kernel trace/profiler |
| C33 | Tags, effects, annotations | Wordgard transaction specs carry user event, annotations, effects and merge/map them (`transaction.ts:66-128,364-396`) | Plite specs carry root-aware changes, selection, typed effects/annotations/tags (`interfaces/editor.ts:1620-1634`) | superior | Keep Plite channels; commands inherit outer tags and may add spec tags; no command-policy metadata object | keep | Update-policy, history, effects, continuation laws |
| C34 | History | Wordgard installs undo/redo command handlers and menu buttons in one extension (`history.ts:98-159`) | Plite History has typed state/tx namespaces, private pure commands, versioned codec, root-aware selection (`history-extension.ts:61-101,225-259,396-441`) | superior boundary | Keep History state/tx API and pure internal command build; expose no Plite menu. Remove payload id and commit command dependency | move UI, keep substrate | History integrity/codec/multi-root/React hook/browser undo; risk is history interception expectations—none live by descriptor identity |
| C35 | Collaboration and persistence | Wordgard central transaction/change algebra can mark remote, but command identity is not wire truth | Yjs has no command dependency; Plite History/Yjs consume canonical changes/tags/effects | superior | Commands never serialize or replay; only `DocumentChange`, selections, registered effects/annotations/history codecs cross persistence/collab boundaries | keep | Static no-import audit, Yjs convergence/offline/undo, history round trip |
| C36 | DOM/input/browser boundary | Wordgard input maps input types/keymap directly to commands and allows view commands (`input.ts:545-575,725-792`) | Plite DOM/React dispatch replaceSlice/edit commands after host policy and geometry; Android branches on handler presence | superior ownership | Keep host dispatch but remove discriminator literals; DOM geometry produces typed input, never enters command state API | steal explicit mapping, reject view target | Clipboard, beforeinput, composition, Android, caret, paste browser proof |
| C37 | React consequence | Wordgard owns an imperative renderer | React selection suppresses one sync path based on singular commit command; browser handle exposes it (`selection-runtime.ts:60-80`; `browser-handle.ts:538-563`) | inferior local coupling | React uses reduced semantic-command/input tags plus canonical changed/selection queries; browser debug API reports tags and separate kernel command trace | rearchitect | Selection runtime + richtext/inlines/shadow/editable-void browser rows |
| C38 | Bound commands, keymaps, menus | `Command.bind` feeds Wordgard's core KeyBinding/Menu APIs (`command.ts:69-81`; `keymap.ts:65-100,300-315`; `menu.ts:95-138`) | Plite core has no menu/keymap product layer; Plate owns shortcuts and plugin tx/API commands | different tradeoff | Do not add `Command.bind`. JavaScript closures and Plate shortcut/plugin namespaces are the correct host/product bindings | reject | Plate shortcut tests and Plite custom keydown examples; adding an opaque call object would duplicate a live owner |
| C39 | General transaction extenders/appenders | Wordgard exposes dangerous transaction extenders/appenders (`transaction.ts:138-187`) | Plite has targeted commands, corrections, commit listeners, typed state/effects and canonical change publication | superior | Do not let command redesign revive general transaction middleware; use command policy before publication and corrections for invariants | reject | Zero new extender/appender API; correction/history/Yjs proof |
| C40 | Tests, docs, performance and agent DX | Wordgard pure command corpus is broad, but handler-chain proof is sparse (`test-commands.ts`; no test-side `Command.handler`) | Plite has deep delegation/root/atomicity tests and profile ids, but docs teach nonexistent `.execute`, callback names leak internals, and no generated chain model/dispatch benchmark exists | different tradeoff | Preserve behavior corpus; add reference-model generated laws, type examples, dispatch allocation/latency benchmark, and one truthful command guide | rearchitect | Exact proof matrix/slices below; risk is structural tests that protect dead names instead of behavior—delete them |
| C41 | Schema fitting, correction, normalization, and identity | Wordgard commands may request schema fit in change specs; corrections scan changed ranges but are implemented through the generic transaction extender (`commands.ts:26-30,47-53`; `state/correction.ts:13-86,99-130`) | Plite `replaceSlice` delegates to `state.slice.fit`; transaction finalization/corrections own canonical validity (`editor-commands.ts:698-708`; extension correction slot at `interfaces/editor.ts:1975`) | superior | Command dispatch never fits, normalizes, or constructs schema identity generically. A command default may call the compiled schema/slice owner; corrections remain transaction-finalization invariants; no after-each-handler normalization | keep | Slice fit/correction convergence, failed-fit atomicity, zero duplicate fitter/normalizer/identity plumbing audit |
| C42 | Built-in command granularity | Wordgard separates enter/line break, unit/word deletion, movement variants, marks, blocks, selection, History, and tables by interceptable intent (`commands.ts:20-567`; `tablecommands.ts`) | Plite exposes 17 definitions that correspond to independently intercepted one-shot intents (`editor-commands.ts:507-524`); live Plate handlers target all 17 | equivalent | Keep distinct descriptors where callers need independent policy; do not collapse them into a mega discriminated command or expand commands to every tx primitive | keep | Built-in catalog coverage table below, 17/17 definition/lowering/handler proof |

Blunt suspicious-shape audit:

| Current shape | Correct owner? | Leaked/forced detail | Wrong split or order | Survival verdict | Deletion unlocked |
| --- | --- | --- | --- | --- | --- |
| Descriptor-owned registration with a universal `next` callback | Descriptor registration belongs to Plite extension config; the callback shape does not | Invocation internals leak and every caller receives chain machinery | Ordinary fallback and advanced wrapping are incorrectly unified | Pure/spec semantics survive all targets; the current DX should not | Payload `type`, generic `next`, most `return next()` boilerplate |
| `EditorCommand = { type; [key:string]: unknown }` | No; descriptor should own identity | Caller repeats information Plite can derive; permissive index signature admits invalid payload | Identity and input are incorrectly unified | Bad for inference, validation, refactors, agent discovery | `EditorCommand`, token/reference union, call-site discriminator literals |
| `defineCommandType` and raw string references | No; configuration compiler owns descriptor identity | Internal registration escape hatch is public | Token and definition are unnecessarily separate | Collision-prone under reconfiguration and duplicated packages | Token/reference exports and tests |
| per-handler `priority` plus extension `priority` | No; extension compiler already owns order | Plugin author must reason about summed magic numbers | Two order systems are unnecessarily separate | Deterministic today, fragile across plugin recomposition | `EditorCommandOptions`, global `commandOrder`, command-local priority tests |
| `runEditorDirectUpdateCommand(tx, groupName, methodName,args)` | No; update method definition owns semantic lowering | String method names, unchecked args, giant switch | Public helper declaration and semantic owner are separated | Every added helper can silently bypass policy | Switch, Proxy hook, duplicate cast boilerplate |
| singular `commit.command` | No; commit metadata/tags own cause classes, profiler owns command ids | First nested command masquerades as whole commit cause | Execution trace and durable commit truth are unified | Misleading for multi-command updates/history/collab | command-context WeakMap, commit type/field, React/browser coupling |
| History default casts state to installed History API | No; command generic should carry installed editor type | Extension author supplies information generic inference should preserve | Raw/default editor state and extension state are split badly | Cast scales poorly to plugin commands | History casts and `any` erasure |
| docs `insertText.execute(...)` | No live owner at all | Invented API | Docs and runtime are disconnected | Already broken for humans and agents | Stale example and misleading prose |

Built-in command catalog decision:

| Descriptor group | Live pressure | Decision |
| --- | --- | --- |
| `addMark`, `removeMark`, `toggleMark` | Table/selection/suggestion policies distinguish direct add/remove/toggle | Keep three descriptors; ids `mark.add`, `mark.remove`, `mark.toggle` |
| `collapse`, `move`, `select`, `setSelection` | Caret engine, table cell selection, block selection need different selection intentions | Keep four; ids `selection.collapse`, `selection.move`, `selection.select`, `selection.update` |
| `delete`, `deleteFragment` | Unit direction and expanded-fragment policy have different list/table/code consumers | Keep two; ids `content.delete`, `fragment.delete` |
| `insertBreak`, `insertSoftBreak` | List/code/input rules handle paragraph and soft breaks independently | Keep two; ids `break.insert`, `break.insertSoft` |
| `insertText` | Native/composition/input rules/link/AI/combobox hot path | Keep; id `text.insert` |
| `insertNodes`, `removeNodes`, `setNodes` | Suggestion/table/block-selection policy intercepts generic one-shot node intentions | Keep three; ids `node.insert`, `node.remove`, `node.set`; active tx node methods remain primitive |
| `replaceSlice` | Clipboard/codec/paste/list/code/table all converge here | Keep one canonical fitted insertion command; id `slice.replace` |
| `toggleBlock` | Public one-shot block toggle and collapse semantics form one atomic action | Keep; id `block.toggle` |

Ranked worthwhile changes:

| Rank | Change | Dependency/value reason | Hard result |
| ---: | --- | --- | --- |
| 1 | Separate descriptor identity from input | Every other type, handler, dispatch, metadata, and adoption decision depends on it | `EditorCommand<Input,TEditor>` with descriptor `id`; zero payload `type` |
| 2 | Split factory `handle` from `around` | Removes dominant boilerplate without sacrificing the 27 advanced prefix/rewrite uses | Ordinary handlers have no continuation; advanced behavior retains exact composition |
| 3 | Compile descriptor-safe immutable pipelines | Makes identity collisions, ordering, reconfiguration, and hot dispatch one coherent owner | Frozen per-revision table; zero raw string/token registrations or global order counter |
| 4 | Make command typing extension-aware | Removes History/plugin casts and public `any` while preserving callback inference | Defaults/handlers infer installed state and tx namespaces |
| 5 | Move semantic lowering beside update methods | Deletes the switch and prevents new helper drift | Every semantic one-shot method declares exactly one descriptor/input lowering; tx stays primitive |
| 6 | Replace singular commit command with a reduced tag | Stops execution tracing from pretending to be durable truth | `semantic-command` tag for lifecycle; id only in profiler/kernel trace |
| 7 | Migrate Plite built-ins and host dispatch | Establishes canonical ids, preparation, root/read-only behavior before Plate adoption | Core/DOM/React/History compile and focused laws pass |
| 8 | Migrate all 61 production Plate/example registrations | Removes public old shape completely, simple handlers first then advanced around handlers | Zero old callback/payload/priority usage across 33 production files |
| 9 | Repair React/browser/history/Yjs consequences | Closes the consumers that can regress despite type-green source | Selection, Android, history, clipboard, multi-root and collaboration proof green |
| 10 | Replace teaching, exports, fixtures, and structural tests | Humans and agents get one truthful API; dead names stop being contractual | One guide, realistic examples, no old exports or invented `.execute` |
| 11 | Add generated chain laws and dispatch benchmarks | Prevents a clean API from hiding semantic or hot-path regressions | Reference interpreter parity and bounded allocation/latency across handler depth |

Final public API:

```ts
type EditorCommandResult = false | TransactionSpec;

type EditorCommand<Input = void, TEditor extends BaseEditor = Editor> =
  Readonly<{
    /** Stable diagnostics/configuration id. Input never repeats it. */
    id: string;

    /** Build only the descriptor default. Does not run installed handlers. */
    build: (
      state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>,
      input: Input
    ) => EditorCommandResult;
  }>;

type EditorCommandContinuation<Input> = {
  (nextInput?: Input): EditorCommandResult;
  /** Evaluate downstream against the state produced by prefix. */
  after(prefix: TransactionSpec, nextInput?: Input): EditorCommandResult;
};

declare function defineCommand<
  Input = void,
  TEditor extends BaseEditor = Editor,
>(
  id: string,
  spec?: {
    /** Pure snapshot/canonicalization before any handler observes input. */
    prepare?: (input: Input) => Input;
    build?: (context: {
      input: Readonly<Input>;
      state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>;
      tags: readonly EditorUpdateTag[];
    }) => EditorCommandResult;
  }
): EditorCommand<Input, TEditor>;

defineEditorExtension<CustomEditor>()({
  name: 'custom-policy',
  commands: ({ around, handle }) => [
    handle(customCommand, ({ input, state }) => {
      state.custom.read();

      return input.enabled
        ? state.transaction((tx) => {
            tx.custom.write();
          })
        : false;
    }),
    around(otherCommand, ({ input, next }) =>
      next({ ...input, normalized: true })
    ),
  ],
});
```

`void` commands get no-input overloads on `build`, `editor.update.command`, and
`tx.command`. `prepare` is pure and optional; it snapshots only command-owned
structural inputs, not a generic deep clone. Command registrations are opaque
extension-compiler data and are not exported as a public construction API.

Simple application use keeps Slate/Plite's primary lifecycle:

```ts
editor.update.text.insert('hello');

editor.update((tx) => {
  tx.nodes.set({ type: 'heading-one' });
  tx.marks.toggle('bold');
});

// Explicit semantic dispatch is available when the descriptor is the product API.
const handled = editor.update.command(editorCommands.delete, {
  direction: 'backward',
  unit: 'word',
});
```

Command definition and headless proof:

```ts
type InsertMentionInput = Readonly<{ id: string; label: string }>;

export const insertMention = defineCommand<InsertMentionInput>(
  'mention.insert',
  {
    build: ({ input, state }) =>
      state.transaction((tx) => {
        tx.nodes.insert({
          type: 'mention',
          mentionId: input.id,
          label: input.label,
          children: [{ text: '' }],
        });
      }),
  }
);

const spec = editor.read((state) =>
  insertMention.build(state, { id: 'ada', label: 'Ada' })
);
// `spec` is false or frozen; no commit has occurred.
```

Ordinary extension policy—the direct replacement for the user's example:

```ts
const listBehavior = defineEditorExtension({
  name: 'list-behavior',
  commands: ({ handle }) => [
    handle(editorCommands.delete, ({ input, state }) => {
      if (input.direction !== 'backward') return false;

      const block = state.nodes.block<Element>();
      const selection = state.selection();

      if (!block || !selection || !block[0].listType) return false;

      return state.transaction((tx) => {
        tx.nodes.unset('listType', { at: block[1] });
      });
    }),
  ],
});
```

Advanced input rewrite and prefix composition use the factory's `around`, so
`next` is no longer ambient ceremony:

```ts
const inputPolicy = defineEditorExtension({
  name: 'smart-input',
  priority: 100,
  commands: ({ around }) => [
    around(editorCommands.insertText, ({ input, next }) =>
      next({ ...input, text: input.text.toLocaleUpperCase() })
    ),

    around(editorCommands.insertBreak, ({ state, next }) => {
      const prefix = state.transaction((tx) => {
        tx.nodes.unset('listRestart');
      });

      return next.after(prefix);
    }),
  ],
});
```

Transaction-local composition remains explicit and publishes one commit:

```ts
editor.update({ tags: 'paste' }, (tx) => {
  tx.command(editorCommands.replaceSlice, { slice });
  tx.command(editorCommands.collapse, { edge: 'end' });
});
```

Extension-specific state inference is a first-class generic instead of a cast:

```ts
type HistoryEditor = Editor<Value, readonly [HistoryExtension]>;

const undoCommand = defineCommand<
  Readonly<{ root: RootKey }>,
  HistoryEditor
>('history.undo', {
  build: ({ input, state }) =>
    state.transaction((tx) => {
      // `state.history` and the installed History tx surface are inferred.
      applyHistoryAction(state, tx, 'undo', input.root);
    }),
});
```

Plate plugin authors keep product discoverability in the plugin tx namespace
while the private command descriptor supplies semantic interception:

```ts
const insertCalloutCommand = defineCommand<InsertCalloutInput>(
  'callout.insert',
  { build: buildInsertCallout }
);

export const withCallout: ExtendPlateEditorExtension<CalloutConfig> = () => ({
  commands: ({ handle }) => [
    handle(insertCalloutCommand, ({ input, state }) =>
      canInsertCallout(state, input) ? false : state.transaction(() => {})
    ),
  ],
  tx: {
    callout(tx) {
      return {
        insert(input: InsertCalloutInput) {
          return tx.command(insertCalloutCommand, input);
        },
      };
    },
  },
});

editor.update.callout.insert({ tone: 'info' });
```

The empty spec in the guard example is the explicit “handled no-op”; `false`
means “this policy does not apply, continue.” External side effects stay in the
button/dialog callback around the model update, never in the command builder.

Ideal compiled/internal representation:

```ts
type CompiledCommandEntry =
  | Readonly<{ kind: 'handle'; rank: number; run: ErasedHandle }>
  | Readonly<{ kind: 'around'; rank: number; run: ErasedAround }>;

type CompiledCommandPipeline = Readonly<{
  descriptor: EditorCommand<unknown, BaseEditor>;
  entries: readonly CompiledCommandEntry[];
  hasAround: boolean;
  id: string;
  prepare: (input: unknown) => unknown;
  runDefault: ErasedBuild;
}>;

type CompiledCommandRegistry = Readonly<{
  byDescriptor: ReadonlyMap<object, CompiledCommandPipeline>;
  byId: ReadonlyMap<string, object>;
  revision: number;
}>;
```

Internal invariants and lifecycle:

1. `defineCommand` creates one frozen plain descriptor. Its id is non-empty;
   the descriptor, not the id string, is the dispatch key.
2. Configuration compilation resolves dependencies, conflicts, enabled state,
   extension priority, and declaration order once. Two distinct descriptors
   with the same id reject the candidate configuration before publication.
3. The candidate command registry is frozen and swaps atomically with the rest
   of the extension revision. Dispatch never mutates, sorts, or repairs it.
4. `prepare` runs on initial input and each around rewrite. It may validate or
   canonicalize command-owned input and throw before publication. Untrusted
   HTML/clipboard/wire validation remains in codecs.
5. Dispatch resolves the active editor/view owner, rejects read-only views,
   captures the current root and reduced tags, and adds `semantic-command`.
6. A handle-only pipeline uses an iterative loop with no callable continuation
   allocation. An around pipeline uses a guarded continuation trampoline;
   continuation can be invoked once and its result or a proven extension must
   be returned.
7. `false` from a handle or non-delegating around entry advances to the next
   entry. A spec stops ordinary fallback. An empty spec is handled.
8. `next.after` creates one isolated structurally shared spec draft, applies the
   prefix, runs downstream against that draft, and discards both if downstream
   returns false or throws. No full document clone or normalization loop is
   allowed.
9. Outside an update, one spec is applied in one `editor.update`; inside an
   update, it applies to the active tx. Public updates remain non-nestable.
10. Document, selection, roots, fields, annotations, effects, and tags publish
    through `TransactionSpec`/`DocumentChange`; handlers and command ids never
    become replay, History, Yjs, or persistence truth.
11. Handler/default/prepare exceptions propagate and abort the draft. Optional
    provider fault isolation does not swallow command-policy bugs.
12. Profiler events retain command id and phase. Commits retain the reduced
    `semantic-command` tag, not a singular command object. Browser kernel trace
    remains a separate host diagnostic channel.
13. Runtime cost is O(number of handlers actually visited) and independent of
    document size except for the handler's own state query/spec. Input is not
    memoized; configuration and handler-presence are revision-cached.

Why this is better than Wordgard, not merely equal:

- It steals Wordgard's excellent `Param` separation and automatic false
  fallback without accepting function/class identity or `any`-erased facets.
- It is more composable: Wordgard cannot rewrite downstream input or evaluate
  the rest of a command after an atomic prefix; Plite retains both safely.
- It is more precise: command builders and handlers are pure and rollbackable;
  dialogs, DOM geometry, and external side effects have explicit host owners.
- It is more typed: descriptor identity, input, installed editor state, roots,
  tags, effects, and transaction specs remain linked through TypeScript.
- It is more honest: multiple commands in one update do not collapse into one
  fake durable command identity. Canonical changes and reduced tags own truth.
- It is more scalable: immutable pipelines compile once, simple handlers avoid
  continuation allocation, multi-root views are native, and dispatch never
  scans the document.
- It is a better substrate: raw Plite stays JSON-native and UI-free; Plate gets
  plugin tx/API discoverability instead of importing Wordgard's core menus,
  keymaps, dialogs, and imperative editor target.

Deletion ledger:

| Owner | Delete or rewrite | Gate proving deletion is safe |
| --- | --- | --- |
| `packages/plite/src/interfaces/editor.ts` | `EditorCommand` payload shape, `EditorCommandToken`, `EditorCommandReference`, `EditorCommandOptions`, old context/run/spec/next/handler variants, payload-bearing registration, `EditorCommitCommand`, `EditorCommit.command` | Public type/import smoke and bounded old-symbol search return zero; new type fixtures infer input/editor state |
| `core/command-definition.ts` | `defineCommandType`, `definePreparedCommand`, preparation WeakMap, descriptor `type`, descriptor registration methods | Descriptor preparation/collision/default/no-default laws pass |
| `core/command-registry.ts` | string-key lookup, global `commandOrder`, per-registration sort/priority, duplicated dispatch/input dispatch split, universal continuation allocation, command-context metadata push | Reference-model chain laws, allocation benchmark, root/read-only/abort tests pass |
| `core/editor-commands.ts` | Every payload `type`, `runEditorDirectUpdateCommand`, 180-line method switch and argument casts | Generated semantic-update-method coverage matches descriptors and direct/callback contract tests pass |
| lifecycle/runtime owners | `runDirectCommand` option and Proxy string interception; raw string/token internal API; singular command context WeakMaps | Update facade contract and one-commit tests pass |
| core helper entrypoints/DOM/React/History | Discriminator literals and `dispatchCommand` old signature; History state cast | Package typechecks and focused behavior tests pass |
| React/browser | `commit.command` selection branch, debug payload and `assertLastCommitCommand` fixtures | Equivalent tag/changed-selection proof plus kernel trace browser rows pass |
| Plate/extensions/examples | `command` callback property, ordinary `next`, advanced second-parameter next, type spreads/literals, command-local options | Zero old-shape scan across all 33 production files; package tests/browser examples pass |
| docs/exports | Old exported type list, raw token teaching, nonexistent `.execute`, duplicated plain-function/descriptor contradiction | Docs examples typecheck/import smoke; one canonical command guide |
| tests | Structural tests for `defineCommandType`, raw string registration, payload `type`, command-local priority, singular commit command, old callback arity | Behavior replacements cover collision/order/fallback/around/tags; no dead-code absence tests are added |
| benchmarks | No deletion owner exists today; add target then retain only current API metrics | Baseline/after artifact records 0/1/8/32 handlers and around-prefix cases |

Adoption matrix:

| Owner | Adoption | Explicit non-ownership | Required proof |
| --- | --- | --- | --- |
| `packages/plite` | New types/descriptors/compiler/dispatcher, built-in ids, method-local semantic lowering, tag metadata | No UI, DOM geometry, product commands, or persistence of commands | Core command/transaction/extension/type tests, generated laws, benchmark |
| `packages/plite-dom` | Descriptor/input host dispatch for clipboard/codec replaceSlice | No schema fitting duplication or command validation framework | Clipboard/host-codec tests |
| `packages/plite-react` | Mutation/caret/input dispatch, handler-presence query, semantic tag selection policy | No model command defaults or Plate product behavior | Mutation/Android/native/model input/caret/selection tests and browser proof |
| `packages/plite-history` | Extension-aware command typing, payload cleanup, tag-compatible undo/redo | No menu/keymap ownership | Integrity, codec, grouping, multi-root and React hook tests |
| `packages/yjs` | Audit only; prove commands remain absent from wire/lowering | No command replay/serialization | Focused convergence/offline/undo/shared-effect tests and static no-import audit |
| `packages/core` | Affinity, override, input-rule registrations; Plate-to-Plite extension priority remains order owner | No root transform facade or raw command token bridge | Core package tests/typecheck and input-rule browser rows |
| `ai`, `code-block`, `combobox`, `link`, `list`, `legacy-list-model` | Migrate simple handles and advanced around/prefix/input rewrites | No local continuation wrapper | Package focused tests plus list/code/paste examples |
| `selection`, `suggestion`, `table`, `tag`, `toggle`, `utils` | Same; table/selection multi-range specs retain advanced around composition | No duplicated command dispatcher | Package tests and tables/inlines/check-list browser rows |
| `apps/www` Plite examples | Teach the accepted API and preserve app-owned behavior | No compatibility snippets | Example typecheck and focused routes |
| `apps/plite` + `packages/browser` | Replace singular commit-command assertion with tags while preserving independent kernel command trace | No architecture inference from trace names | Richtext/stress/mentions/inlines/shadow/editable-void browser rows |
| `content/docs/plite` | One primary lifecycle, one advanced semantic policy guide, accurate headless build | No migration/changelog prose | Docs source/type/import audit |
| codecs/fixtures | Update command input fixtures only; serialized document/change/history/Yjs shapes stay stable | No command descriptor in JSON | Snapshot/codec round trips unchanged |
| downstream callers | Compile-break and migrate every old public symbol/callback/payload use | No aliases, ambient declarations, or deprecated overloads | Repo bounded search, affected typecheck, `check:plite:dev` |

Execution slices:

| Slice | Owner | Entry | Work and public breaks | Exit and hard deletion gate | Focused tests / laws | Browser / benchmark |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | Plite tests + benchmark owner | Accepted plan; live baseline still matches inventory | Add behavior-first reference interpreter and before metrics; freeze direct-vs-tx, prefix, tag, root, abort behavior without protecting old names | Baseline artifacts and failing new target type fixtures exist | Current command/transaction/extension suites plus generated model skeleton | Record 0/1/8/32 handler and prefix medians/allocations; no browser yet |
| 1 | Plite public types/definition | Slice 0 green | Introduce `EditorCommand<Input,TEditor>`, id/input separation, optional prepare/default, and the sole `commands: ({ handle, around }) => [...]` factory; break every old exported type/token/options signature | New definition tests/type fixtures green; delete descriptor registration methods, token/reference/options/preparation WeakMap, and old exports | Definition/default/no-default/prepare/collision plus annotation-free installed-editor inference laws | Not applicable; model-only |
| 2 | Plite extension compiler/registry | Slice 1 stable | Compile immutable descriptor pipelines in candidate config; use extension order only; handler presence by descriptor | Atomic swap/reconfigure/collision/order green; delete string registry, global order, local priority, mutable arrays | Generated 0..32 pipeline/reference parity, conflict/dependency/reconfigure/throw/recursion laws | Run dispatch benchmark; simple pipelines allocate no continuation; p50 no worse than baseline by >10% |
| 3 | Plite dispatcher/spec kernel | Slice 2 green | Implement handle fast path, around trampoline, input rewrite, prefix/post continuation, semantic tag, root/read-only/active-tx lifecycle | All old dispatcher functions/context metadata removed; one commit and canonical spec only | Existing deep continuation/stale/root/tag tests rewritten plus generated false/spec/throw laws | Prefix benchmark no >10% regression; document-size independence at 100 vs 20,000 blocks |
| 4 | Plite built-ins/update facade | Slice 3 green | Convert 17 built-ins to namespaced ids/input-only payloads; co-locate semantic lowering with update method declarations | Delete `runEditorDirectUpdateCommand`, `runDirectCommand`, method string switch; generated coverage proves every intended semantic helper mapped once | Built-in command, transaction, slice, selection, generic value/type tests | Core benchmark rerun |
| 5 | DOM/React/History/Yjs | Slice 4 API fixed | Migrate host dispatch/preparation, handler query, History typing, semantic tag; remove singular commit field; audit Yjs no dependency | Zero old payload/signature/commit-command use in substrate/hosts; History has no state cast; Yjs static audit clean | DOM clipboard/codec; React mutation/input/Android/caret/selection; History codec/integrity; Yjs focused proof | Chromium richtext command/tag, paste, multi-root history, Android viewport rows |
| 6 | Plate core + simple plugin policies | Slice 5 substrate green | Migrate every registration that only handles or falls through: `command` to `input`, `return next()` to `false`, no continuation | Bounded manifest accounts for every simple registration; no old callback arity in migrated owners | Core/ai/combobox/link/list/table/tag/utils focused package tests | Markdown/check-list/richtext/inlines focused rows |
| 7 | Plate advanced policies | Slice 6 green | Migrate all input rewrite, prefix, and post-extension registrations to factory `around`; preserve exact ordering and downstream draft semantics | All 18 prefix and nine rewrite sites accounted; zero factory `handle` callback with continuation | Code-block/list/legacy-list-model/suggestion/table/selection/toggle tests; reference traces match | Tables, list, code, paste HTML, composition/browser stress rows |
| 8 | Docs/examples/exports/fixtures | Slice 7 source complete | Rewrite docs/examples/public exports; delete `.execute`, tokens, payload type, singular command fixtures; keep latest-state prose only | Old-symbol and old-shape scan zero outside historical plans; docs imports/type examples green | Public package import smoke, docs/example typecheck, fixture round trips | Five Plite example routes focused in Chromium |
| 9 | Closure | Slices 0-8 green | Run affected then strict proof; update benchmark artifact and plan evidence; `autoreview` until no accepted finding | `check:plite:dev`, strict `check:plite`, bounded source audit, focused browser suite, full Chromium and matrix green; no compatibility code | All package tests/typechecks/lint/barrels when exports move | Before/after benchmark accepted; full browser matrix only here |

Exact accepted-execution commands are intentionally focused first:

```sh
bun test packages/plite/test/command-spec.test.ts packages/plite/test/transaction-contract.ts packages/plite/test/extension-methods-contract.ts packages/plite/test/extension-configuration.test.ts packages/plite/test/update-policy-contract.ts
bun test packages/plite-dom/test/clipboard-boundary.test.ts packages/plite-dom/test/host-codec.test.ts
bun test packages/plite-react/test/mutation-command-dispatch-contract.test.ts packages/plite-react/test/model-input-strategy-contract.test.ts packages/plite-react/test/android-input-manager-contract.test.ts packages/plite-react/test/selection-runtime-contract.test.ts
bun test packages/plite-history/test/history-contract.ts packages/plite-history/test/integrity-contract.ts
pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-dom --filter=./packages/plite-react --filter=./packages/plite-history --filter=./packages/core
pnpm check:plite:dev
pnpm --filter plite test:plite-browser:chromium richtext.test.ts
pnpm --filter plite test:plite-browser:chromium markdown-shortcuts.test.ts check-lists.test.ts inlines.test.ts tables.test.ts paste-html.test.ts
pnpm check:plite
pnpm check:plite:browser-matrix
pnpm lint:fix
```

Package-focused commands for each changed Plate owner run before the combined
Plite gates. `pnpm brl` runs if public exports move. The full Chromium and
matrix commands are closure-only, matching repository doctrine.

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Identity/input separation is cleaner and safer | Wordgard `Command<Param>` separates param; Plite repeats open `type` input | Type fixtures, collision validation, zero payload discriminator audit | specified |
| Simple fallback needs no continuation | Wordgard automatic false fallback; majority of 61 production registrations use next only to fall through | Generated reference-chain law and full adopter behavior tests | specified |
| Advanced composition is preserved | Current `next`, `next.after`, lineage and stale-base tests | Rewritten around input/prefix/post/false/throw laws plus Plate advanced adopters | specified |
| One lifecycle/change truth remains | Current dispatcher applies frozen spec inside/outside update; History/Yjs use changes | One-commit, active tx, abort, History/Yjs and serialization proof | specified |
| Semantic one-shot versus primitive tx is intentional | Live test `command-spec.test.ts:213-234` | Generated update-method map and direct/callback contract suite | specified |
| Reconfiguration is atomic and deterministic | Current extension candidate/revision tests; current command arrays mutable/string keyed | Collision/order/reconfigure abort/observer revision laws | specified |
| Multi-root/read-only behavior survives | Current view dispatch lines 798-810 and command tests 531-602 | Main/named/read-only type/runtime/browser proof | specified |
| React native-selection behavior survives metadata cut | Only current model consumer checks `commit.command?.origin` | Semantic-tag selection tests and richtext/native/composition browser rows | specified |
| Command dispatch is not a large-document tax | Current profiler proves no full runtime-index build for a simple command | 100 vs 20,000-block dispatch target, handler-depth latency/allocation artifact | specified |
| Docs and agents see one real API | Current docs contain nonexistent `.execute` | Typechecked snippets, import smoke, zero stale-shape docs search | specified |

Conditional evidence:
- High-risk scenarios:
  1. An around handler applies a prefix, downstream declines or throws, and the
     prefix leaks into document, selection, fields, tags, effects, anchors, or
     runtime ids. Required proof: generated atomic discard plus existing
     continuation/anchor tests.
  2. Native text input or Android composition reconfigures an insert-text
     handler while the host decides whether to flush pending DOM text. Required
     proof: revision-atomic handler-presence tests and Android/native browser
     rows; no stale pipeline cache.
  3. Several semantic commands run inside one update across a named root, then
     History undo/redo or Yjs lowering consumes the commit. Required proof:
     one canonical change, correct root/selection, reduced tag, no command
     descriptor in history/wire JSON.
  4. Two extensions define different descriptors with the same id, or equal
     priority handlers are reconfigured in a different install order. Required
     proof: candidate configuration rejects collision without publication and
     local compiled ranks are deterministic.
  5. Removing `commit.command` re-enables React DOM-selection synchronization
     during typed input and moves the caret twice. Required proof: semantic-tag
     selection policy unit tests plus desktop/mobile richtext and composition
     browser assertions.
- External research: the user explicitly named local `../wordgard`. Its command,
  transaction, extension, input, keymap, menu, History, table, and proof owners
  were read. Accepted mechanisms are param separation, false fallback, pure
  defaults, facet/config compilation principle, and explicit host mappings.
  Rejected mechanisms are function identity, imperative editor target,
  truthy/side-effect result, bound/menu/keymap substrate, generic transaction
  extenders, and class/instance extension dependence.
- Issue/PR provenance: not applicable. This is a checkout-source architecture
  request with no public claim, issue, PR, or security intake.
- Browser/benchmark/docs/release/behavior-law owners: browser proof applies
  because DOM input, Android, selection export, clipboard, History, tables,
  lists, and composition dispatch commands. Benchmarks apply because the target
  changes the hot dispatch loop and allocations. Docs and behavior laws apply
  because the public API breaks. Release/changeset work is execution-owned if
  package policy requires it; no release is authorized by plan acceptance.

Findings:
- Harsh answer: the example is not a good final API. Descriptor-collocated
  registration cannot infer an extension's installed editor type across a
  heterogeneous array. The extension factory fixes that owner boundary while
  removing `command` and universal `next` from the common case.
- Wordgard is cleaner in the narrow command lane because `Command<Param>` has
  one identity/function and one separate param, false automatically falls
  through, and bound commands plug into its owned keymap/menu system.
- Wordgard's cleanliness does not generalize to Plate: its handlers receive the
  whole imperative editor, identity is function/class-instance based, the
  private handler facet uses `any`, side effects are not rollbackable, and it
  bundles UI/input owners Plite deliberately separates.
- Live Plite is already materially stronger in immutable specs, typed
  continuation, prefix-state evaluation, validation, multi-root views,
  transactional extension configuration, canonical change truth, History/Yjs,
  and DOM/React ownership. Replacing it wholesale with Wordgard would be a
  regression.
- The biggest current architectural bug is not callback spelling. A Proxy and
  180-line group/method string switch decide whether the same-looking one-shot
  and tx methods enter semantic policy. That lowering must live with method
  declarations so adding a helper cannot silently bypass commands.
- Singular `EditorCommit.command` is false precision: sequential semantic
  commands in one update still publish one commit. A reduced tag is the correct
  lifecycle signal; profiler/kernel traces own exact command diagnostics.
- Current docs already drifted far enough to teach nonexistent `.execute`, so
  docs/source/type examples must close in the same hard cut.

Decisions and tradeoffs:
- Keep `commands: ({ handle, around }) => [...]` as the extension slot. It binds
  the installed editor type before heterogeneous descriptors are registered and
  already participates in transactional configuration.
- Keep `handle(descriptor, handler)` for ordinary pure fallback and
  `around(descriptor, handler)` for continuation. Descriptor-owned registration
  methods are deleted.
- Keep explicit `editor.update.command` and `tx.command`; do not add root
  `editor.commands`, a chain API, or a callable descriptor.
- Keep one-shot `editor.update.*` semantic and active `tx.*` primitive. This is
  the Slate/Plite vision: update is the lifecycle and tx is the composition
  power API. Repair the lowering owner and teaching instead of erasing the
  useful distinction.
- Keep extension priority as the single shared ordering source. Delete
  command-local priority; do not copy Wordgard's second precedence wrapper.
- Use descriptor object identity for dispatch plus stable id for validation and
  diagnostics. Do not serialize descriptor identity or accept raw string
  registration.
- Keep command builders pure. Imperative UI actions remain ordinary Plate/app
  functions around an update; DOM geometry remains host-owned.
- Reject a public bound-command object. Wordgard needs it because core owns
  keymaps/menus. Plate already owns shortcut/plugin APIs, and JavaScript
  closures cover app callbacks without another abstraction.
- No compatibility aliases, overload bridges, raw token escape hatch, or
  deprecated payload discriminator survive any slice.

Wordgard mechanism closure audit:

| Mechanism | Ledger | Final accounting |
| --- | --- | --- |
| Function command/default duality | C2, C6 | Pure default retained on structural descriptor; function identity rejected |
| Separate generic param | C4 | Stolen exactly, made readonly and descriptor-typed |
| Pure command subtype/headless run | C9 | Kept as explicit descriptor build |
| Handler facet/map | C14, C23, C24 | Rearchitected into immutable transactional extension pipeline |
| Automatic false fallback | C15 | Stolen; becomes the factory `handle` law |
| Truthy imperative handling | C10, C11, C26 | Rejected |
| Bound command | C38 | Rejected for lack of correct Plite owner/consumer |
| Dispatch | C13 | Kept under read/update lifecycle, not copied as root static helper |
| Precedence bands/tree order | C21-C23 | Transactional compilation principle kept; duplicate precedence system rejected |
| Facet caching/equality | C23-C24 | Configuration reuse principle kept; command input memoization rejected |
| Compartment reconfiguration | C23 | Transactional principle already exceeded by Plite named config graph |
| Keymap/input command maps | C36, C38 | Explicit host mapping kept; keymap product API stays outside Plite core |
| Menu buttons/core UI | C38 | Moved/rejected; Plate/product owner |
| History command handlers/buttons | C34 | Pure history action kept; UI moved; state/tx/codec boundary remains Plite History |
| Table cell-selection handlers | C31, C36 | Behavior retained through typed Plate table policies and Plite selection substrate |
| Transaction spec merge/mapping | C18, C19, C33 | Plite `DocumentChange`/spec composition kept as superior |
| Transaction extender/appender | C39 | Rejected; commands/corrections/typed effects own narrower responsibilities |
| User-event/effect/annotation metadata | C32-C35 | Typed Plite tags/effects/annotations kept; singular command field cut |
| Imperative geometry commands | C10, C36 | Moved to Plite DOM/React host before pure model dispatch |
| Donor command tests | C40 | Pure behavior corpus principle kept; missing handler model laws added |
| Schema fitting and corrections | C41 | One fitter/correction owner kept; generic command normalization rejected |
| Command catalog granularity | C42 | Independently intercepted intents kept; mega-command and every-primitive expansion rejected |

Plite strength closure audit:

| Strength | Decision |
| --- | --- |
| Plain JSON nodes/values and structural typing | Preserved; command descriptors are frozen plain objects, inputs are structural |
| Canonical `DocumentChange` and immutable `TransactionSpec` | Preserved as sole mutation/commit truth |
| Paths, anchors, runtime ids, multi-root views | Preserved; command pipeline is root-bound and identity-neutral |
| Typed fields/facets/effects/annotations/tags | Preserved and used instead of command persistence |
| Transactional extension dependencies/conflicts/reconfiguration | Preserved and made the sole command compilation owner |
| React renderer and DOM/input/IME/mobile ownership | Preserved; no imperative command target leaks into model core |
| History and Yjs | Preserved as change consumers; command descriptors never enter codecs/wire |
| Plate product ownership | Preserved; commands support plugin policy but do not import product nodes/UI into Plite |
| Discoverable read/update/state/tx lifecycle | Strengthened; commands remain an advanced slot, not a competing root API |
| Lazy change queries/subscriptions/scheduler | Unchanged; semantic tag replaces one misleading commit field |

Nothing useful remains to pull from Wordgard for this target after these rows:
its useful simplicity is captured by separate input and false fallback; its
configuration principle is already exceeded; its remaining command mechanisms
depend on narrower single-view/UI ownership or weaker identity/effect rules.

Review fixes:
- Rejected the tempting rename-only plan after live source showed the direct
  update lowering switch and singular commit metadata were part of the same
  architecture problem.
- Rejected copying `Command.bind` after tracing Wordgard's core keymap/menu
  ownership against Plate's existing shortcut/plugin namespaces.
- Split normal and advanced registrations only after counting live pressure:
  61 production registrations, with 18 prefix and nine input-rewrite sites.
- Added extension-aware command typing after locating the live History cast.
- Added React/browser adoption after locating the only model consumer of
  `commit.command` and the browser fixtures that assert it.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:
- 2026-07-21 fresh numbered-source reads covered Wordgard command definition,
  commands, state/facet/configuration, transaction/extender/appender, editor
  dispatch, input, keymap, menu, History, table cell selection, and tests.
- Fresh current-source reads covered Plite definitions/types/registry, 17
  built-ins, the 180-line direct lowering switch, update Proxy/runtime/view,
  transactional extension registry, deep command tests, History, DOM codecs,
  React input/selection/Android owners, docs, browser command fixtures, and
  all registration matches.
- Reconciliation counts: 28 donor files; 36 current implementation owner files;
  86 registrations in 43 files; 61 production registrations in 33 files; 18
  production `next.after`; nine production input rewrites; zero Yjs command
  dependency.
- Command declaration hard cut verified: descriptor registration methods and
  array-valued command slots have zero live source/docs callers. A custom
  extension fixture infers command input plus installed state/tx namespaces
  without annotations or casts. Plate composes repeated implicit command
  factories in declaration order.
- Focused execution proof: Plite command laws pass 40/40; the Plate command
  composition, Override, table fit, and related command suites pass 77/77; the
  table slow suite passes 16/16. Plite and Plite React source typechecks pass.
- Strict dispatch benchmark proof: all correctness/allocation/budget gates pass;
  worst budget ratio is `0.818`, 20,000/100-block simple p50 ratio is `1.187`,
  continuation failures are `0`, and reference parity is `1`.
- Final mechanical result: on 2026-07-21,
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-21-wordgard-plite-command-dispatch-architecture.md`
  returned `[autogoal] complete:
  docs/plans/2026-07-21-wordgard-plite-command-dispatch-architecture.md`.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns structural descriptors,
  immutable compiled pipelines, pure spec dispatch, update/tx lowering, and
  reduced semantic tag. DOM/React owns host input/geometry; Plate owns product
  commands/shortcuts/UI.
- Public breaks and Plate/collaboration adoption: hard-cut payload `type`,
  token/string refs, local priority, universal next, method-name switch, and
  singular commit command. Migrate all 61 production registrations; History
  and hosts adopt; Yjs remains change-only.
- Applicable browser/benchmark/docs/provenance decisions: focused native,
  Android, clipboard, composition, list/table, History, and multi-root browser
  proof; handler-depth/prefix/large-doc benchmark; docs/type examples repaired;
  no issue provenance.
- Proof and execution risks: prefix rollback, atomic reconfigure/handler
  presence, multi-command roots/history/Yjs, collision/order, and React caret
  policy are explicit gated scenarios.
- Execution order and user attention: the hard cut is accepted. Continue slices
  0-9 uninterrupted until aggregate proof or a real blocker.

Timeline:
- 2026-07-21T10:52:08.884Z Plite Plan created.
- 2026-07-21T10:52Z Requirements checkpoint materialized before broad source
  exploration.
- 2026-07-21 live donor/current command dependency graphs reconciled; prior
  architecture plans were treated only as search pointers, never authority.
- 2026-07-21 forty-two concept decisions, eleven ranked changes, public API,
  internal compiler/lifecycle, deletion/adoption matrices, ten vertical slices,
  and closure audits completed.
- 2026-07-21 user accepted uninterrupted execution. TypeScript contextual
  inference forced the command declaration factory; direct descriptor methods
  were rejected rather than patched with caller annotations or casts.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Command declaration hard cut complete; aggregate architecture closure in progress |
| Where am I going? | Finish remaining accepted slices and aggregate proof without pausing |
| What is the goal? | Resolve the ideal command dispatch architecture from complete live Wordgard and Plite/Plate evidence. |
| What have I learned? | Plite's pure spec engine is stronger, but input identity, universal next, duplicate ordering, method-string lowering, and singular commit command are real architectural debt. |
| What have I done? | Reconciled all live target owners; implemented the sole typed factory API; migrated callers/docs; repaired Plate factory composition and advanced delegation drift; ran focused proof. |

Open risks:
- Some Plate policies combine simple fallback and advanced post-processing in
  one callback. They correctly use factory `around`; do not split behavior
  merely to maximize factory `handle` counts.
- The benchmark threshold must compare same-machine before/after artifacts.
  A >10% median regression in simple or prefix dispatch blocks closure unless
  measurement proves noise and a repeated run clears it.
- Browser matrix infrastructure is expensive. Focused Chromium rows run during
  adoption; the full matrix stays closure-only and is not evidence for changing
  model architecture if process startup fails before product code.

## 2026-07-22 aggregate closure checkpoint

- Command declaration, dispatch, and adopter deletion remain complete; the
  current source audit still finds no root `editor.tf` or `editor.transforms`
  mutation facade.
- `check:core` and the fresh 10-package/31-subpath packed consumer pass. Browser
  runner contracts pass 49/49 with zero retries.
- Aggregate browser proof is not product-red: the managed runner reaches server
  startup and the sandbox rejects `127.0.0.1:3102` with `EPERM`. Command plan
  completion stays valid; the parent execution goal remains open for browser
  and review closure.
- The final package rerun passes Plite 1,371/1,371 and Plite DOM 192/192. The
  clipboard benchmark coordinator proves distinct support/cut/issue worker
  processes with three measured samples, zero retries, and unchanged budgets.
