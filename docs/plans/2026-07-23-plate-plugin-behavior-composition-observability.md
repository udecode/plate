# Plate plugin extension composition and observability

Status: superseded

Superseded by the behavior-promotion doctrine in
`docs/research/systems/editor-behavior-architecture.md` and
`.agents/rules/best-api.mdc`. Do not execute this plan: its `withBehaviors`,
profile runtime, serialization, fingerprint, receipt, and live-switching target
was rejected in favor of ordinary plugin composition for proven substitutable
capabilities.

Objective:
Close the Plate per-behavior composition and observability decision. The plan
is complete when every current Plate/Plite mechanism, relevant Wordgard
mechanism, and named architecture candidate has an explicit verdict; one
execution-ready API and ownership model is selected; and the planning checker
passes.

Flow mode:
collaborative planning

Goal plan:
docs/plans/2026-07-23-plate-plugin-behavior-composition-observability.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- none

Mode:

- `standard`, with a TARGET-specific exhaustive Wordgard comparison because
  the user named that checkout as architecture evidence.

Completion threshold:

- Binary readiness: live claims are sourced, each responsibility has one
  owner, every decision is resolved, every public break has adoption and proof,
  execution slices are concrete, conditional gates are resolved, and
  `check-complete` passes.
- Every relevant mechanism inside the declared TARGET graph in current Plate,
  Plite, Wordgard, and
  `docs/analysis/editor-architecture-candidates.md` is classified as adopted,
  surpassed, rejected, or deferred with exact evidence.
- Three questions have binary answers:
  1. Users cannot currently omit an individual Table behavior through a
     supported API without reconstructing or forking the plugin.
  2. Users cannot currently identify, trace, time, and selectively disable each
     Table behavior.
  3. Composition mechanics already exist in Plite; typed Plate exposure and
     owner-attributed Plite instrumentation are the material gaps.
- One coherent target API is selected: a Plate behavior is the public
  composition/profile/attribution unit; it lowers to existing named Plite
  extensions and may also own Plate/React resources. Plite remains the sole
  composition/publication graph; Plite and host dispatchers execute their own
  resources against the same published activation revision.
- The ordinary static path remains native Plate composition:
  `Plugin.withBehaviors({...})` is placed in the existing `plugins`/kit array.
  Users do not define profiles, install variants, or learn the normalized
  policy IR unless they need cross-plugin reuse, serialization, or live
  switching.
- The selected API survives a future-scale audit covering preset composition,
  dependency/capability selection, cross-plugin coordination, ownership and
  naming, static/live configuration, serialization/reproduction, inspection,
  profiling cardinality, failure isolation, lazy loading, and type inference.
- Every convenience method is justified against one canonical declarative
  behavior-policy model so the API does not grow into unrelated
  `omit`/`replace`/`enable`/`profile` entrypoints.

Verification surface:

- Live Table plugin contract, seven editor-extension fragments, React handlers,
  callers, tests, docs, and public barrels.
- Plate Core plugin builders, resolution, publication, plugin portal,
  `plate:runtime`, DebugPlugin, and docs.
- Plite extension compilation, registry, slots, reconfiguration, command/query/
  correction/listener/transaction pipelines, lifecycle, profiling, and tests.
- TARGET-bounded Wordgard source inventory.
- `docs/analysis/editor-architecture-candidates.md`, the completed command
  dispatch plan, and the completed Table colocation plan.
- Final source refresh plus:

  ```sh
  node .agents/skills/autogoal/scripts/check-complete.mjs \
    docs/plans/2026-07-23-plate-plugin-behavior-composition-observability.md
  ```

Constraints:

- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No public compatibility aliases, runtime shims, or restored `withTable*`
  files.
- Keep owner-first colocation and inferred callback types. Behavior
  composability must not recreate helper-file sprawl or standalone functions
  that ferry `editor`/`tx`.
- Do not create a second execution runtime. A Plate behavior is a compile-time
  catalog, composition, and attribution boundary that lowers to existing Plite
  extensions and tags Plate/React resources. Every behavior, including a
  React-only behavior, has one Plite-published activation record that all host
  dispatchers consult.
- Do not represent structural composition as mutable plugin `options`; changing
  the option store does not recompile an extension graph.
- Treat `.extendBehaviors()` and `.withBehaviors()` as plugin authoring. Package
  definitions and behavior selection finish before an app or registry applies
  its one terminal `.configure()` consumer override.
- Do not add one `disableX` option per behavior.
- Do not use child plugins for command/query/correction fragments. Child plugins
  remain appropriate for independent schema/product owners such as Table row,
  cell, and header-cell.
- Do not add command-local priority. Extension dependencies, extension
  priority, and declaration order remain the sole ordering model.
- Explicit API and update capabilities remain callable regardless of ambient
  behavior selection. Publicly selectable behaviors are shape-neutral;
  schema/API/tx/state contributions remain required plugin capabilities or
  independent plugins. Runtime changes are limited to compiler-approved local
  behaviors.

Boundaries:

- TARGET: declarative behavior identity, profiles, static selection/replacement,
  ordering, inspection, logging, performance timing, diagnostics, and
  impact-bounded local runtime activation of independently meaningful behavior
  inside large Plate plugins, with Table as the proving surface.
- In scope: `packages/table`, Plate Core plugin contracts/builders/resolution/
  diagnostics, directly consumed Plite extension/runtime owners,
  `packages/plite-react` profiler integration where required, `../wordgard`,
  and the named architecture analysis.
- Primary owner: Plate Core owns typed behavior/variant/capability catalogs,
  profiles, host activation/order, behavior-to-resource provenance, receipts,
  and debug AX. Table owns behavior identities, defaults, constraints, and
  local/static intent.
- Direct Plite owners: extension compilation/registry/reconfiguration,
  execution attribution, published behavior activation, lifecycle health, and
  the host-agnostic diagnostics hub.
- Non-goals: implementation during this turn, restoring split helper files,
  repo-wide migration of every plugin, a second behavior execution engine, a
  new generic middleware engine, command API redesign, arbitrary live
  schema/document-law switching, or copying Wordgard's anonymous extension
  tree.

Output budget strategy:

- Read named owners first and expand only by evidence.
- Exclude generated registry JSON, `dist`, `node_modules`, build output, and
  unrelated Wordgard subsystems.
- Use exact symbol searches and bounded semantic ranges rather than dumping
  large files.

Blocked condition:

- None. All decision-owning local sources and the Wordgard checkout were
  available.

Plate Plan state:

- status: ready
- phase: prove and hand off
- next: user accepts, rejects, or narrows the final tiered façade
- handoff: prepared below

Start Gates:

| Gate                                 | Applies | Evidence                                                                                                                                               |
| ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prompt requirements captured         | yes     | Table omission, old `withTable*` composability, debugging/logging/perf, runtime disablement, Wordgard, and candidate-doc comparison are explicit above |
| Active goal and plan verified        | yes     | Active goal points to this exact artifact                                                                                                              |
| Current owners read                  | yes     | Table, Core builder/resolution, Plite extension runtime/profiler, DebugPlugin, docs, Wordgard, VISION, and referenced plans were read                  |
| Mode and execution boundary resolved | yes     | Standard planning; implementation requires explicit acceptance                                                                                         |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current Table selective composition was audited.
- [x] Current plugin/extension/resource identity, order, diagnostics, timing,
      and disablement were audited.
- [x] Relevant Wordgard mechanisms were classified.
- [x] Relevant architecture-candidate claims were resolved.
- [x] Missing capabilities were assigned to Plate or Plite.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Every decision row has owner, adoption, proof, risk, and verdict.
- [x] Public changes and internal bridges have adoption/deletion answers.
- [x] Execution slices and focused proof are concrete.
- [x] Conditional work and final handoff are resolved.
- [x] Red-team the proposed API against large preset composition, capability
      dependency closure, cross-plugin overrides, configuration reproduction,
      lazy extension loading, and profiling cardinality.
- [x] Decide whether `.omitExtension` and `.replaceExtension` are canonical
      primitives, convenience methods over one profile/patch input, or the
      wrong abstraction.
- [x] Resolve whether stable extension handles need semantic capabilities,
      provenance/version identity, and serializable configuration separate
      from executable descriptors.
- [x] Re-run independent architecture review and update the decision ledger,
      examples, execution slices, risks, and final handoff.
- [x] Resolve cross-runtime activation/order, idle-boundary publication, and
      host-agnostic profiling ownership.
- [x] Define one normalized selection/activation IR, pure variant/capability
      descriptors, initialization adoption, preflight classes, and receipt
      channel without global registries.
- [x] Separate permission axes, transitive runtime impact, lifecycle health
      attribution, reproducibility, and bounded metric identity.
- [x] Reconcile the façade with current immutable Plate plugin builders,
      ordinary kit arrays, Plite `editor.update` grouping, and the Vision rule
      that profiles decide behavior without making profiles mandatory syntax.

Completion Gates:

| Gate                          | Applies         | Required action                                                         | Evidence                                                                                  |
| ----------------------------- | --------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Binary readiness              | yes             | Resolve every readiness condition                                       | Decision brief, ledger, slices, and proof matrix below                                    |
| Fresh source evidence         | yes             | Recheck decision-changing current claims                                | Table/Core/Plite/Wordgard source refreshed on 2026-07-23                                  |
| Conditional risk and adoption | yes             | Resolve runtime safety, collaboration, docs, browser, release, and perf | High-risk and adoption sections below                                                     |
| Verification recorded         | yes             | Record planning proof and exact execution gates                         | Verification evidence below                                                               |
| Handoff prepared              | yes             | Name ownership, changes, proof, risks, and execution order              | Final handoff section below                                                               |
| Autoreview                    | no for planning | Run after implementation stabilizes                                     | Execution slice 10 requires `autoreview`; no product source changed in this planning turn |
| Goal plan complete            | yes             | Run `check-complete` against this plan                                  | Recorded in Verification evidence                                                         |

Phase / pass table:

| Phase              | Status   | Evidence                                                                                                                                                                     | Next        |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Ground             | complete | Live owners, doctrine, historical composition, and Wordgard reconciled                                                                                                       | Decide      |
| Decide             | complete | Five red-teams selected the behavior/profile model; the final Slate/Plate façade checkpoint kept plugin/kit composition primary and made profiles an earned advanced surface | Prove       |
| Prove and hand off | complete | Revised API, owners, adoption, risks, proof, and execution slices are explicit                                                                                               | User review |

Decision brief:

- outcome: Replace the earlier extension-surgery API. Colocation was correct;
  erasing independently meaningful identities was not, but exposing raw Plite
  extensions as Plate's product contract is also too narrow.
- chosen ontology:
  1. A **capability** is what a plugin/editor can explicitly do. Plugin
     API/update/schema/state shape stays stable across behavior profiles.
  2. A **behavior** is Plate's stable public composition, profile, and
     attribution unit. It can own a Plite extension subtree and Plate/React
     handlers or shortcuts.
  3. An **editor extension** is Plite's compiled execution/lifecycle unit.
     Plite remains the only runtime graph.
  4. A **profile** is serializable selection/activation policy over opaque
     behavior handles and named implementation refs. Executable code remains
     in pure variants attached to the editor-local catalog.
- chosen shape: Keep implementations inline in each plugin owner. Authors
  declare one inferred behavior record; ordinary consumers derive immutable
  plugin variants through one keyed policy map and place them in the existing
  plugin/kit array. That familiar Plate path is sugar over the same profile
  compiler, so the runtime remains profile-driven without forcing profile
  ceremony on static users. Named cross-plugin profiles exist only for reuse,
  serialization, initial product modes, or live switching. Plate compiles
  behaviors into authoritative outer Plite slots and tags non-Plite resources
  with the same provenance.
- authoring example:

  ```ts
  export const BaseTablePlugin = createBasePlugin({
    key: "table",
    // schema, options, API, and tx stay with the plugin owner
  }).extendBehaviors({
    paste: {
      activation: "local",
      exposure: "public",
      presence: "optional",
      replacement: "compatible",
      extension: ({ editor }) => ({
        commands: ({ handle }) => [
          // inferred editor, command input, state, and transaction types
        ],
      }),
    },
    normalize: {
      activation: "static",
      exposure: "internal",
      presence: "required",
      replacement: "closed",
      extension: ({ editor }) => ({
        corrections: [
          // document law: inspectable, but not casually selectable
        ],
      }),
    },
  });
  ```

- React ownership uses the same manifest grammar without moving code out of the
  component plugin:

  ```ts
  export const TablePlugin = toPlatePlugin(BaseTablePlugin).extendBehaviors({
    navigation: {
      activation: "local",
      exposure: "public",
      presence: "optional",
      replacement: "closed",
      handlers: ({ editor }) => ({
        onKeyDown: ({ event }) => {
          // thin DOM transport and colocated navigation policy
        },
      }),
    },
  });
  ```

- ordinary static consumer example:

  ```ts
  const AppEditorKit = [
    TablePlugin.withBehaviors({
      paste: false,
      navigation: false,
      delete: {
        extension: ({ editor }) => ({
          commands: ({ handle }) => [
            // inferred editor, input, state, and transaction types
          ],
        }),
      },
    }),
    LinkPlugin.withBehaviors({
      autoLink: false,
    }),
  ];

  const editor = createPlateEditor({
    plugins: AppEditorKit,
  });
  ```

  One-use replacement code stays inline and fully inferred. The resulting
  editor-local policy is intentionally nonportable.

- reusable variant and profile example:

  ```ts
  const AppDeleteBehavior = TablePlugin.behaviors.delete.variant({
    id: "app/table-delete",
    extension: ({ editor }) => ({
      commands: ({ handle }) => [
        // complete, contract-preserving replacement
      ],
    }),
  });

  const LeanEditingProfile = defineBehaviorProfile({
    disable: [
      TablePlugin.behaviors.paste,
      TablePlugin.behaviors.navigation,
      LinkPlugin.behaviors.autoLink,
    ],
    id: "app/lean-editing",
    use: [AppDeleteBehavior],
  });

  const editor = createPlateEditor({
    plugins: [TablePlugin, LinkPlugin],
  });

  const receipt = editor.update.behaviors.apply(LeanEditingProfile);
  ```

  The code profile carries its referenced pure variants. Its JSON form contains
  only stable references; resolving a JSON profile requires the app's explicit
  variant catalog. `preflight`, expected revisions, reasons, exact scopes, and
  capability bindings remain advanced controls rather than baseline syntax.
  If this is the initial product mode, pass
  `behaviorProfiles: [LeanEditingProfile]` to `createPlateEditor` instead of
  applying it after creation.

- inspection and profiling example:

  ```ts
  const graph = editor.api.behaviors.inspect({
    include: [TablePlugin],
  });

  const profile = editor.api.debug.profile({
    include: [TablePlugin, TablePlugin.behaviors.paste],
    resources: ["command", "query", "correction", "handler"],
    traces: { maxTraces: 100, sampleRate: 0.01, slowMs: 8 },
  });

  profile.snapshot();
  profile.subscribe((batch) => {
    // delivered after execution, never inline in a command/query
  });
  profile.stop();
  ```

- API semantics:

  - `extendBehaviors(record)` is the batch authoring API. Literal keys are
    retained in a manifest generic; metadata is static and factories for
    omitted behaviors are never evaluated. Singular `extendBehavior` is
    optional sugar only if real usage justifies it.
  - `plugin.behaviors[key]` is a frozen typed semantic handle
    `(pluginName, localKey)`, not an executable descriptor and not object
    identity. Replaceable public handles expose one pure
    `.variant(definition)` constructor, matching Plite's existing
    `defineExtensionSlot(...).of(...)` handle pattern while preserving the
    exact behavior contract. Closed/internal handles do not expose it. Renaming
    a public key is breaking.
  - Each definition has independent `exposure: 'public' | 'internal'`,
    `presence: 'required' | 'optional'`,
    `activation: 'static' | 'local'`, and
    `replacement: 'closed' | 'compatible'` axes. Naming and tracing a behavior
    grants no composition permission. `presence: 'required'` forbids both
    omission and deactivation; `activation` classifies legal transitions, it
    does not grant permission to deactivate required law.
  - The canonical normalized policy is an ordered, JSON-safe decision IR:

    ```ts
    type BehaviorPolicyDecision = {
      activation?: "enabled" | "disabled";
      behavior: { behaviorKey: string; pluginName: string };
      implementation?: null | {
        fingerprint: string;
        id: string;
        version: number | string;
      };
    };

    type BehaviorPolicy = {
      bindings?: {
        capabilityId: string;
        provider: { behaviorKey: string; pluginName: string };
      }[];
      decisions: BehaviorPolicyDecision[];
      exact?: {
        axis: "activation" | "implementation";
        behaviorKeys: string[];
        pluginName: string;
      }[];
      formatVersion: 1;
      id: string;
      lineage?: {
        fingerprint: string;
        id: string;
        version: number | string;
      }[];
      version: number | string;
    };
    ```

    This is the portable wire IR, not the normal authoring input. Missing
    decision fields inherit. `implementation: null` statically omits an
    optional behavior; a named implementation selects a registered compatible
    variant. Exact scopes state which axis they pin and affect only the named
    plugin catalog. Code-authored local profiles may omit portable
    version/fingerprint metadata and receive an editor-local revision; export
    rejects until every referenced profile and variant has exact portable
    metadata.

  - `withBehaviors(record)` is typed plugin-local sugar over the same IR:
    absent keys inherit, `false` emits `implementation: null`, `true` restores
    the declared implementation after an earlier layer, an inline definition
    creates an editor-local replacement, and a compatible
    behavior handle's `.variant(...)` descriptor selects a reusable
    replacement. Inline definitions are the preferred one-use path, not an
    escape hatch, but they cannot enter the serializable IR; inspection marks
    them nonportable with only an editor-local revision.
  - Default implementations and reusable replacements have stable
    implementation IDs plus build/version/fingerprint provenance.
    `handle.variant({ id, extension, handlers, ... })` returns a pure frozen
    descriptor using the same inferred resource grammar as the owning
    behavior. It is the sole public variant constructor; a redundant
    top-level `defineBehaviorVariant(handle, ...)` export is rejected.
    Portable variants require version/build fingerprint metadata at their
    serialization boundary: package/default fingerprints come from the
    published build catalog; app variants use a build-generated constant.
    Never hash a closure at runtime.
    `withBehaviors` and code-authored profiles attach referenced variants to the
    editor-local catalog as they select them. An advanced install-only input is
    justified only for a prepared variant that must remain dormant until a
    later JSON policy selects it; it is not ordinary editor construction.
    Serialized selections without an installed exact
    `(behavior, id, version, fingerprint)` fail. Portability is derived by
    resolution, never trusted as a boolean from user data. There is no
    process-global mutable variant registry, and receipts never claim anonymous
    closures are reproducible across editors.
  - Package/app code may layer policies; the compiler retains default, preset,
    app, replacement, and debug provenance. Last explicit decision wins only
    across an explicitly ordered layer stack. Conflicting decisions at the
    same precedence and multiple replacements fail instead of depending on
    array accident. Plate may still merge repeated compatible plugin
    descriptors by key: one nominal catalog owner exists per
    `(pluginName, behaviorKey)`, and repeated descriptors contribute ordered
    policy layers only when catalog identity matches.
  - `defineBehaviorProfile` is the typed authoring form of the normalized IR.
    Its ordinary input is ergonomic `enable`, `disable`, and `use` collections
    of opaque behavior/variant descriptors. Exact scopes and capability
    bindings are advanced fields. The helper lowers all of them to the explicit
    wire references above; normal app code never authors `decisions`,
    `implementation`, fingerprints, or plugin/behavior string pairs.
    Code may extend explicit profile objects and use scoped exact policy so
    package-owned presets do not silently gain future behaviors. Definition
    eagerly flattens parents into decisions plus immutable
    `lineage`/fingerprints; serialized policy never depends on an ambient
    profile registry. Missing or mismatched catalog variants fail during
    preflight. Cycles and same-precedence conflicts fail with provenance.
  - `createPlateEditor({ behaviorProfiles })` is the explicit advanced
    initialization path for reusable cross-plugin product modes. Ordinary
    static composition stays
    `createPlateEditor({ plugins: [Plugin.withBehaviors({...})] })`; both paths
    resolve through the same compiler before behavior factories and model
    publication. Static omission skips factory evaluation, materialization,
    and registration; it does not claim the inline module was never loaded.
  - Selection and activation are distinct. Static omission removes an
    implementation and requires editor recreation to restore. A selected local
    behavior may be active or dormant; runtime disable/re-enable preserves the
    exact materialized implementation and never re-evaluates its factory.
    Activation decisions target selected optional behaviors only; a static
    activation change is classified as recreation-required or invalid.
  - Hard dependencies/conflicts target handles. Substitutable cross-plugin
    contracts use nominal handles created by
    `defineBehaviorCapability<T>(id, { cardinality })`; definitions declare
    `provides`/`requires`, and the policy `bindings` field resolves ambiguous
    providers. Capability handles are pure frozen descriptors resolved from the
    editor-local catalog, never a global registry. Cardinality-one requires one
    provider/binding; cardinality-many preserves published effective order.
    These are Plate composition contracts, not Plite's current string-keyed API
    capability bucket. Optional integration is an explicit bridge behavior;
    missing hard dependencies never silently cascade-disable.
    Within one `extendBehaviors` record, dependency metadata receives the
    record's fully inferred handle map, so forward references are cycle-free to
    author: `requires: ({ behaviors }) => [behaviors.fragment,
OtherPlugin.behaviors.x]`. Typos and cycles fail before factories run.
  - `activation: 'static' | 'local'` describes allowed transition scope; it
    does not claim semantic safety. `local` uses a positive resource whitelist:
    interactive command/clipboard/query registrations and dispatch-gated host
    handlers/shortcuts/input rules after owner proof. Schema, public
    API/tx/state shape, fields, facets/effects, selection codecs, corrections,
    change listeners, activation/ready/cleanup, render/decorate/hook/injector/
    parser topology, and shared protocols are static. New resource kinds start
    static until classified.
  - Impact is transitive. The strongest class propagates backward through hard
    dependencies and bound capability providers, so a query/command provider
    required by correction or shared law cannot remain locally toggleable.
  - Every selected behavior has one Plite-published activation record. Plite
    owns composition/publication, not every executor. Plate/React dispatchers
    capture one activation revision at each root host event, gate every
    behavior-owned resource against it, and use published effective resource
    order. Legacy handlers receive deterministic synthetic ownership/order
    during migration. Live apply is allowed only at an idle root boundary and
    rejects while a behavior resource, host event, or editor update is active;
    devtools may queue for the next boundary. The next root dispatch therefore
    observes the complete new revision without retaining an old Plite graph or
    maintaining separately mutable React state.
  - `editor.api.behaviors.preflight(policy)` returns the graph diff, dependency
    closure, expected revision, fingerprints, and one classification per
    decision: `applicable-live`, `requires-editor-recreation`, or `invalid`,
    with structured cause/fix/dependency chain.
  - Canonical live mutation is
    `editor.update.behaviors.apply(policy, options?)`, matching Plite's grouped
    update vocabulary. The common call needs only the profile and returns a
    receipt. Expected revision, reason, and preflight are opt-in advanced
    controls. It owns one synchronous editor update and returns the receipt
    after commit. Rejection throws a structured error carrying the rejected
    receipt. Receipt states are `rejected`, `committed`, and
    `committed-degraded`; they include before/after fingerprints, revision,
    source/reason, decisions, and lifecycle diagnostics. A transaction-local
    staging API remains internal until a real same-transaction consumer
    justifies a public draft/after-commit receipt channel.
  - Devtools temporary disabling is a named debug policy-layer lease, not an
    ordinary app write. Disposing the lease removes only that layer and
    compare-and-swap refuses restoration after an incompatible policy-stack
    change.
  - Compilation, migration, validation, transaction, or publication failure
    preserves the old graph. Post-publication activation/ready failure marks
    the new installed revision degraded. Cleanup failure belongs to the
    removed/replaced revision and transition tombstone, degrades editor/
    publication health, and does not falsely mark the replacement
    implementation failed. The current Plite lifecycle does not roll
    activation back.
  - Inspection is core discovery, not debug logging. Profiling is a bounded
    per-editor session with aggregate metrics by default and sampled traces
    only on request. With no session, execution performs no clock read, event
    allocation, dynamic string construction, or user callback.
  - Aggregate identity is stable behavior/slot + named implementation ID +
    declared resource kind/id + phase. Configuration revision/fingerprint is
    session-epoch metadata, not a default time-series dimension; graph changes
    reset or roll a bounded epoch ring. Sampled traces carry exact revision and
    parent/command/transaction/commit/React correlation. Aggregates report
    count/outcome/error/total/self/max and a bounded histogram.
  - Commands derive a resource ID from behavior + command descriptor + phase
    only when that tuple is unique; duplicate registrations require a literal
    registration key. Corrections and every otherwise-array resource require a
    declared key. Array index is never durable identity.
  - Paths, document/input values, runtime node IDs, and error messages never
    become metric dimensions.
  - Every JSON-safe policy, graph snapshot, receipt, diagnostic export, and
    profiling export carries its own `formatVersion`, independent of profile,
    catalog, implementation, and graph revisions.

- strongest rejected alternative: Canonical
  `.omitExtension`/`.replaceExtension`/`setEnabled` methods. They fix one
  plugin but do not represent profiles, batch atomicity, React ownership,
  provenance, exact presets, or dependency closure and invite future verb
  soup. `withExtensions({...})` is a viable smaller API but still exposes
  Plite's internal unit as Plate's product contract. A generic editor
  `profiles` option is also rejected as vague; the advanced initializer is
  explicitly `behaviorProfiles`. A redundant top-level
  `defineBehaviorVariant(handle, ...)` export is rejected: the typed behavior
  handle owns the sole `.variant(...)` constructor, while all mutation verbs
  remain on plugin policy maps or `editor.update.behaviors`.
- consequence: Core and Plite gain additive manifest/registry APIs and internal
  attribution; Table adopts them without splitting files. Default Table
  consumers require no migration. Removed `withTable*` helpers remain
  unsupported rather than receiving aliases.

Decision ledger:

| Surface                           | Current                                                                                                                          | Target                                                                                                                                                                                                           | Owner                           | Adoption                                                                     | Proof                                                                                   | Risk                                                      | Verdict                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| File topology                     | `BaseTablePlugin.ts` owns the coherent implementation                                                                            | Keep one owner file; inline one-use logic                                                                                                                                                                        | Table                           | No source split                                                              | package lint/typecheck                                                                  | Large file navigation                                     | keep                                        |
| Whole-plugin composition          | `enabled`, `override.enabled`, dependencies, priority at `PluginConfig.ts:204-258,346-351`                                       | Keep for whole features                                                                                                                                                                                          | Plate Core                      | None                                                                         | existing resolve tests                                                                  | None                                                      | keep                                        |
| Child plugins                     | Row/cell/header are flattened full plugin owners at `resolvePlugins.ts:1003-1098`                                                | Keep only for independent schema/product owners                                                                                                                                                                  | Plate Core/Table                | None                                                                         | existing plugin graph tests                                                             | Microplugin abuse                                         | keep narrowly                               |
| Table behavior identity           | Seven anonymous Plite calls and three React handlers have no shared public identity                                              | Name coherent Plate behaviors in the same owner file; lower them to outer Plite slots and tag React resources                                                                                                    | Table + Plate Core              | Behavior manifest and focused tests                                          | catalog/runtime snapshots and behavior tests                                            | Naming implementation atoms instead of product behaviors  | adopt                                       |
| Authoring API                     | Repeated keyed `.extendExtension` accepts a literal but discards it from the returned type and copies the accumulated array      | One `.extendBehaviors(record)` retains every key, contract, dependency, and policy before evaluating factories                                                                                                   | Plate Core                      | New manifest generic/compiler; keep singular form only as justified sugar    | compile-only inference/scale fixtures                                                   | Type-instantiation growth                                 | adopt batch record                          |
| Static selection                  | `.configure()` cannot remove one fragment                                                                                        | One sparse `.withBehaviors({ paste: false })` authoring map before terminal consumer configuration                                                                                                               | Plate Core                      | Builder/compiler/docs/Table example                                          | valid/unknown/required/internal key and post-config terminal tests                      | Policy layering ambiguity                                 | adopt with explicit layer provenance        |
| Static replacement                | Raw same-name Plite replacement conflates logical slot and implementation                                                        | `withBehaviors` accepts one-use inferred inline definitions; `handle.variant(...)` names only reused or portable replacements                                                                                    | Plate Core                      | Behavior contract type, editor-local catalog, outer slot                     | inline inference plus replacement/provenance/round-trip/type tests                      | Anonymous code is not reproducible                        | inline local by default; name on reuse      |
| Behavior handle                   | No typed plugin-facing semantic handle                                                                                           | `plugin.behaviors[key]` identifies `(pluginName, localKey)` and compatible public handles expose one pure `.variant(...)` constructor                                                                             | Plate Core                      | Manifest generics, frozen typed handle, barrels                              | literal-key, permission-sensitive method, and rename fixtures                           | Leaking executable descriptors or method soup             | adopt one constructor only                  |
| Identity/provenance               | Extension name currently conflates semantic address and concrete code                                                            | Separate behavior/slot identity, implementation identity, installed revision, and resource identity; version/build/layer are provenance                                                                          | Plate Core + Plite              | Catalog and compiled record metadata                                         | replacement metrics never aggregate across implementations                              | Version used as identity                                  | adopt four-level model                      |
| Composition permission            | Named fragments are implicitly addressable but not classified                                                                    | Independent exposure, presence, activation, and replacement axes; tracing grants no operation                                                                                                                    | Feature owner + Core            | Manifest metadata and public-handle filtering                                | forbidden selection/activation/replacement tests                                        | Permanent exposure of internals                           | adopt                                       |
| Profile                           | No cross-plugin behavior policy                                                                                                  | `defineBehaviorProfile({ enable, disable, use, ...advanced })` lowers typed handles to the normalized JSON-safe decision IR                                                                                      | Plate Core                      | Profile/compiler/serialization/fingerprint                                   | ergonomic-input/layering/exact/round-trip/init/live tests                               | Executable closures in JSON                               | named variants only at portability boundary |
| Presets/kits                      | App/plugin kits are arrays of configured descriptors                                                                             | Ordinary static policy uses `Plugin.withBehaviors(...)` before an optional final `configure(...)` inside those arrays; named profiles are only for reuse, serialization, initialization modes, or live switching | Plate/apps                      | No second preset runtime                                                     | kit/layer/conflict/provenance and terminal-config tests                                 | Wrapper abstraction with no owner                         | keep existing kit shape                     |
| Catalog state                     | Tombstones disappear from Plite's resolved registry                                                                              | Join available, selected, installed, active, omitted, replaced, blocked, and degraded states                                                                                                                     | Plate Core + Plite              | Persistent catalog plus runtime snapshot                                     | explain snapshots across transitions                                                    | Re-evaluating factories on enable                         | restore selected materialization            |
| Runtime change                    | Plite can stage slot replacements; Plate has no behavior catalog or batch policy                                                 | Revision-checked `editor.update.behaviors.apply(policy)` returning a receipt                                                                                                                                     | Plate Core + Plite              | Catalog-backed activation records and batch compiler                         | atomic activation batch, stale revision, restore/receipt tests                          | Schema/state/collab divergence                            | selected local behaviors only               |
| Plugin options                    | Ad hoc flags such as `disableMerge`; `setOptions` only mutates the option store                                                  | Keep options for values/policies, never graph membership                                                                                                                                                         | Feature owners                  | Remove no existing legitimate option                                         | option mutation tests                                                                   | Option soup                                               | reject as composition                       |
| Explicit API/update methods       | Table has 43 API members and 17 update methods                                                                                   | Keep stable; profiles select ambient behavior, not capability/type shape                                                                                                                                         | Table/Core                      | None                                                                         | typecheck/current behavior tests                                                        | Disabled automatic policy can still be invoked explicitly | accepted and documented                     |
| Logical slot and implementation   | Current keyed normalization lets an explicit child name override `plugin:key`; slot owner is not an ordering contract            | Authoritative outer slot owns the selected implementation subtree; logical ID survives replacement                                                                                                               | Plate Core + Plite              | Slot expansion/order/compiler changes                                        | dependency/replacement/order tests                                                      | Child name bypasses handle                                | adopt                                       |
| Dependencies and capabilities     | Plite uses exact string names; slot-parent ownership is not ordered                                                              | Typed behavior handles for hard deps/conflicts/order; typed capabilities for substitution                                                                                                                        | Plate Core + Plite              | Manifest resolution and Plite group ordering                                 | closure/cycle/ambiguity/explicit-omit tests                                             | Hidden auto-install/cascade                               | fail with full chain                        |
| Ordering                          | Registry exposes declaration `order`; execution resolves dependency/priority order separately                                    | Publish declaration and effective order for logical slots, implementations, and resources                                                                                                                        | Plite                           | Fix registry reporting                                                       | execution order equals inspection                                                       | Diagnostics can lie                                       | adopt/fix                                   |
| Command attribution               | Entries keep descriptor/kind/run only at `command-registry.ts:38-95`; timings use command id/phase                               | Retain behavior, logical slot, implementation ID, keyed resource, epoch, and nesting                                                                                                                             | Plite                           | Registry/compiler/profiler                                                   | duplicate registrations and replacements stay distinguishable                           | Hot-path overhead                                         | adopt                                       |
| Query attribution                 | Raw functions at `query-middleware.ts:141-205`                                                                                   | Owner/resource/phase/outcome timing                                                                                                                                                                              | Plite                           | Registry/compiler/query runtime                                              | ordered query trace tests                                                               | Middleware allocation                                     | adopt                                       |
| Correction attribution            | Index-derived correction id and aggregate timing                                                                                 | Require stable declared resource IDs and law fingerprint metadata                                                                                                                                                | Plite                           | Compiler/correction loop                                                     | correction trace and loop diagnostic tests                                              | High event volume                                         | bounded aggregation                         |
| Listener/tx/lifecycle attribution | Raw sets or aggregate timings                                                                                                    | Attribute every executable resource and lifecycle/configuration phase                                                                                                                                            | Plite                           | Registry/public-state/lifecycle                                              | listener/tx/lifecycle/config trace tests                                                | Profiler affects execution                                | buffered and isolated                       |
| `plate:runtime`                   | All Plate API/tx contributions collapse to one extension at `resolvePlugins.ts:756-787`                                          | Preserve plugin/behavior provenance without splitting stable capabilities merely for timing                                                                                                                      | Plate Core                      | Runtime publication bridge                                                   | plugin/behavior attribution tests                                                       | Public API churn                                          | internal metadata only                      |
| Core discovery                    | Public registry omits priority, revision, provenance, health, resources, disabled entries, and effective order                   | Immutable JSON-safe catalog/live-graph snapshot with explain/preflight                                                                                                                                           | Plite + Plate Core              | Join Plate catalog with Plite registry                                       | omitted/replaced/degraded/explain snapshots                                             | Debug-only truth                                          | core API, not DebugPlugin                   |
| Profiling                         | Global synchronous sink and unbounded React collector                                                                            | Per-editor bounded aggregate-first session; optional sampled causal traces                                                                                                                                       | Plite + Plate Core              | Diagnostics hub and typed Plate bridge                                       | limits, drop counts, batching, error isolation                                          | Cardinality/data leakage                                  | opt-in metadata-only                        |
| React Table handlers              | Copy/cut/onKeyDown share one config at `TablePlugin.tsx:19-230`; onKeyDown bundles navigation                                    | Behavior ownership spans Plite and React; keep DOM transport thin                                                                                                                                                | Table + Plate React             | Tag/refactor inline handlers without helper files                            | React tests + Browser                                                                   | DOM timing noise                                          | adopt bounded split                         |
| Cross-runtime activation          | `pipeHandler` snapshots plugin handlers and invokes them without extension state                                                 | One Plite-published behavior activation record gates Plite and host resources at a captured root-dispatch revision                                                                                               | Plite + Plate Core React        | Activation lookup/token and host dispatcher bridge                           | atomic enable/disable and effective-order parity across Plite/React                     | Split publication truth                                   | adopt hard law                              |
| Resource taxonomy                 | Plate ambient resources span handlers, shortcuts, input rules, decorate/render/hooks, injectors, parsers, and more               | Extensible resource-kind registry; every new kind is static until its ownership/gating/ordering law is classified                                                                                                | Plate Core/React + Plite bridge | Table implements only proven kinds; others remain explicit capability/static | taxonomy exhaustiveness and forbidden-local tests                                       | Table-only wrapper                                        | adopt framework law                         |
| Runtime eligibility               | Plite accepts arbitrary slot replacement and author `safe` cannot prove semantics                                                | `static` default; positive local-resource whitelist; shared/document law rejected until coordinated protocol exists                                                                                              | Plate Core + Plite              | Compiler-derived impact plus author intent                                   | negative footprint/collab/forged-handle tests                                           | False safety claims                                       | adopt exact classes                         |
| Lifecycle failure                 | Plite publishes before activation and isolates lifecycle errors                                                                  | Activation/ready degrade the installed revision; cleanup degrades the transition/old tombstone; pre-publication failures rollback                                                                                | Plite                           | Health registry, transition records, structured diagnostics                  | current contract plus attribution assertions                                            | False rollback or blame                                   | preserve actual law                         |
| Collaboration law                 | Yjs guards schema identity but peers with different corrections can apply different law                                          | Fingerprint schema/corrections/versioned shared protocols; local behavior excluded                                                                                                                               | Plite + Yjs                     | Compatibility adapter only when law becomes configurable                     | mismatch and synchronized-transition tests                                              | Function hashing is dishonest                             | declared semantic ID/version                |
| Lazy loading                      | Extension factories and lifecycle are synchronous                                                                                | Keep handles/catalog metadata eager; host imports a prepared named variant before preflight and synchronous atomic publication                                                                                   | Plate/host                      | No v1 async dispatch/lifecycle                                               | omitted factory is not evaluated/materialized/registered; prepared module install later | Hot-path suspension                                       | future-compatible, defer loader API         |
| Wordgard recursive arrays         | Anonymous arrays/object identity and five precedence bands at `state.ts:700-770`                                                 | Named graph with dependency order                                                                                                                                                                                | none                            | None                                                                         | comparison only                                                                         | Opaque identity                                           | surpassed/reject                            |
| Wordgard compartments             | Explicit wrapped subtree replacement at `state.ts:773-802`                                                                       | Named atomic Plite slots                                                                                                                                                                                         | none                            | None                                                                         | existing Plite reconfigure tests                                                        | User must pre-wrap                                        | surpassed                                   |
| Wordgard feature bundles          | Full bundle plus smaller public pieces across Table/schema packages                                                              | Full default plugin plus constrained typed behavior catalog                                                                                                                                                      | Table/feature packages          | Table first; later package migration only by evidence                        | default and partial-preset tests                                                        | Treating every callback as public                         | adopt principle                             |
| Wordgard Table                    | `tables()` always installs theme/selection/correction/paste/drop/menu and exposes only some pieces at `src/table/table.ts:45-96` | Faithfully composable default without implementation exports                                                                                                                                                     | Table                           | Named manifest                                                               | parity of default + omission tests                                                      | Partial preset silently invalid                           | surpass                                     |
| Wordgard observability            | Compile-time log flags, exception sink, timestamps; no profiler/registry                                                         | Native graph snapshot, health, bounded profiler                                                                                                                                                                  | Plite/Plate                     | No donor code                                                                | local proof                                                                             | Reinventing devtools                                      | local design required                       |
| Tiptap candidate                  | Product/extension ergonomics benchmark at `editor-architecture-candidates.md:106-118`                                            | Match discoverable packaging, not engine model                                                                                                                                                                   | Plate                           | Docs/examples                                                                | API review                                                                              | Product surface bloat                                     | adopt product pressure                      |
| Portable Text candidate           | Event/guard/action vocabulary and browser specs at `:138-151`                                                                    | Keep command vocabulary; adopt scenario proof, not XState/value model                                                                                                                                            | Plite/Plate                     | Browser cases                                                                | focused Browser tests                                                                   | Parallel behavior runtime                                 | reject runtime copy                         |
| urql candidate                    | Optional composable pipeline inspiration at `:227-238`                                                                           | Keep as future Plate systems pressure; no exchange engine in Plite                                                                                                                                               | none here                       | None                                                                         | comparison only                                                                         | Mega middleware bucket                                    | defer                                       |
| VS Code/LSP candidate             | Separates manifest/dependency/capability/registration/status identity                                                            | Adopt identity and structured diagnostic distinctions, not process/plugin-host complexity                                                                                                                        | Plate/Plite                     | Local manifest/registry only                                                 | architecture and snapshot review                                                        | Overbuilding host infrastructure                          | adopt distinction                           |
| Long-horizon behavior profiles    | Doctrine says capabilities expose and profiles decide                                                                            | Establish the minimal serializable profile algebra over Plate behaviors now                                                                                                                                      | Plate Core                      | Table proving profile; no global event engine                                | profile composition and fingerprint tests                                               | Premature mega-framework                                  | adopt narrow catalog/profile layer          |

Table behavior manifest:

| Key             | Current source                 | Target role                                                        | Exposure | Presence                                  | Activation                             | Replacement                           |
| --------------- | ------------------------------ | ------------------------------------------------------------------ | -------- | ----------------------------------------- | -------------------------------------- | ------------------------------------- |
| `selection`     | `BaseTablePlugin.ts:4492-4548` | selection clamping plus cell-index cache invalidation              | internal | required                                  | static                                 | closed until cache lifecycle is split |
| `delete`        | `:4549-4606`                   | deletion interception                                              | public   | optional                                  | local candidate                        | compatible                            |
| `fragment`      | `:4607-4643`                   | fragment query adaptation                                          | public   | optional, pending paste dependency audit  | local candidate                        | compatible                            |
| `paste`         | `:4644-4888`                   | replace-slice/table paste policy                                   | public   | optional                                  | local candidate                        | compatible                            |
| `insertText`    | `:4889-4927`                   | expanded multi-cell typing policy                                  | public   | optional                                  | local candidate                        | compatible                            |
| `normalize`     | `:4928-5011`                   | grid/sizing/index correction law                                   | internal | required                                  | static and collaboration-fingerprinted | closed                                |
| `cellSelection` | `:5012-5177`                   | selection codec, commands, mark/setNodes interception, marks query | public   | optional only with a supported transition | static in first packet                 | compatible                            |
| `clipboard`     | `TablePlugin.tsx:19-44`        | browser copy/cut transport                                         | public   | optional                                  | local after thin-transport proof       | closed in first packet                |
| `navigation`    | `TablePlugin.tsx:45-230`       | keyboard navigation/select-all/tab policy                          | public   | optional after coherent extraction        | local after Browser proof              | closed in first packet                |

Naming these rows does not promise the power set. Table owns constraints and
package-supported profiles. Exact dependency/contract audit may merge or hide
rows before publication; arbitrary callback/resource identity remains
inspectable without becoming publicly selectable.

Execution slices:

| Slice                                 | Owner                        | Scope                                                                                                                                                                                                                                                                                                                              | Entry                                                         | Exit                                                                                                                                              | Proof                                                                                                                        |
| ------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1. Plite graph truth                  | Plite                        | Make outer logical slots authoritative for subtree order/deps; publish behavior activation tokens, declaration/effective order, parent ownership, revision, transition-aware health, implementation provenance, and stable resource IDs                                                                                            | Current slot expansion and extension registry                 | One immutable composition/publication graph that hosts can consult without guessing                                                               | focused registry/slot/order/reconfigure/lifecycle/receipt tests and typecheck                                                |
| 2. Host-agnostic diagnostics hub      | Plite + plite-react          | Preserve owner/resource identity across Plite execution/config phases; replace the global sink with a per-editor aggregate-first bounded hub; expose a generic external-span bridge; let plite-react emit only its own render spans                                                                                                | Current `profileCoreDuration` and render profiler             | Disabled fast path is inert; core sessions accept bounded internal/external spans without Plate/React concepts                                    | clock/allocation assertions, generator-resume timing, nested self/inclusive timing, batching/limits/drop/error tests         |
| 3. Plate behavior type/catalog model  | Plate Core                   | Add a manifest generic separate from aggregate API/tx/state; batch `extendBehaviors`; independent exposure/presence/activation/replacement axes; frozen typed handles with one permission-sensitive variant constructor; forward-reference handle context; resource-kind taxonomy; pure named variants                             | Existing keyed `.extendExtension` literal is discarded        | Literal catalog is inferred without type subtraction, global registries, or chained intersection growth                                           | valid/invalid/forward-ref/typo/cycle/contract/repeated-compatible-plugin and 1,000-key compile fixtures                      |
| 4. Plate policy compiler              | Plate Core                   | Define one normalized decision IR; plugin-local `withBehaviors` as the ordinary static façade; ergonomic flattened serializable profiles; scoped exactness; editor-local variant catalog; nominal capability/bindings; advanced initialization input; preflight classification/diff; fingerprints; receipt-returning runtime apply | Immutable plugin descriptors plus Plite batch reconfiguration | Both plugin-local and named-profile inputs compile before factories/model; live policy applies only selected local activations in one publication | inline inference/kit/layer/exact/closure/capability/round-trip/init/recreation/stale-revision/receipt/restore/rollback tests |
| 5. Plate host activation and ordering | Plate Core React             | Tag selected handlers/shortcuts/input rules with behavior tokens; capture one activation revision per root event; gate before invoke; dispatch behavior resources in published effective order; assign legacy handlers deterministic synthetic owners; enforce idle-boundary live apply                                            | Current `pipeHandler` snapshots plugin-list handlers          | Plite and DOM paths observe one atomic behavior revision/order with no retained old graph or mutable React mirror                                 | reentrant rejection/queued-next-boundary, legacy interleaving, effective-order parity, Browser                               |
| 6. Plate discovery/debug AX           | Plate Core + React           | Join authored catalog and live Plite graph; expose inspect/explain/preflight separately from bounded profiling; emit behavior-tagged host spans through the generic bridge; add CAS debug-layer leases                                                                                                                             | Plite graph/hub plus host activation                          | One truthful answer for what/why/health/slow and temporary debug control across all Plate resources                                               | JSON-safe snapshots, omitted/replaced/degraded/transition history, leases, filters, redaction, subscriber isolation          |
| 7. Table adoption                     | Table                        | Declare only coherent public behaviors inline, keep required law/capabilities stable, preserve default full bundle, refactor React transport inline, and publish supported profiles/constraints                                                                                                                                    | Seven anonymous extensions and three React handlers           | Default parity plus supported partial composition without helper-file sprawl                                                                      | full Table suite, policy/variant tests, React navigation/clipboard tests, Browser, typecheck                                 |
| 8. Collaboration-law gate             | Plite + Yjs + Table          | Keep local policy out of shared fingerprint; cover configurable schema/corrections/versioned shared protocols before any document-law profile is allowed                                                                                                                                                                           | Schema-only Yjs identity guard                                | Peers cannot silently run divergent configurable document law                                                                                     | mismatch/compatibility tests; otherwise normalize remains required/static                                                    |
| 9. Docs, examples, release            | Core/Plite/Table docs owners | Current-state behavior/profile/discovery/profiling/Table docs, initialization/live examples, one partial Table example, exports/barrels, changesets                                                                                                                                                                                | Stable implementation                                         | Composition and performance AX are discoverable without migration prose in reference docs                                                         | docs links/type snippets, `pnpm brl`, changeset checks, www typecheck                                                        |
| 10. Aggregate proof and review        | Parent implementation owner  | Lint, package checks, scale/perf, Browser, full affected checks, autoreview                                                                                                                                                                                                                                                        | All slices integrated                                         | No accepted finding and all gates green                                                                                                           | commands below and final diff/source sweeps                                                                                  |

Proof matrix:

| Claim                                       | Planning evidence                                                                                                      | Execution proof                                                                                                                                                                                            | Status    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Current Table cannot omit one behavior      | Seven unnamed extension fragments merge by name in `withPlite.ts:203-278`; no behavior policy exists                   | Regression fixture fails on old source and passes with `.withBehaviors({ paste: false })`                                                                                                                  | specified |
| Default behavior is unchanged               | Full plugin remains default preset                                                                                     | Existing full Table suite plus before/after default registry snapshot                                                                                                                                      | specified |
| Literal keys infer without flattening       | Keyed overload currently accepts literal key but discards it from plugin type                                          | valid-key, forward-reference, typo, cycle, contract replacement, and no API subtraction compile tests                                                                                                      | specified |
| Public behavior spans executors atomically  | Table navigation/clipboard live in React while other policy lives in Plite; `pipeHandler` currently snapshots handlers | one published activation revision gates Plite/React resources; reentrant apply rejects/queues and next idle root event sees the commit                                                                     | specified |
| Cross-runtime order is truthful             | Plate handlers use plugin-list order while Plite computes dependency/priority order                                    | behavior-owned host handlers and Plite resources match published effective order; legacy synthetic order is deterministic                                                                                  | specified |
| Runtime patch and receipt are atomic        | Plite stages multiple reconfigurations in one update; public update callbacks return void                              | receipt-returning top-level activation batch, stale-revision/pre-publication rejection receipt, committed-degraded lifecycle receipt                                                                       | specified |
| Runtime impact is honest and transitive     | Selection/schema/state/correction/listener/lifecycle can invalidate runtime truth                                      | positive-whitelist negatives plus correction→query provider propagation and forged-handle tests                                                                                                            | specified |
| Activation failure law is truthful          | Plite publishes then isolates activation failure at `editor-extension.ts:2027-2060`; tests retain new config           | new graph remains installed with `activation-failed`; cleanup failure attaches to old transition/tombstone                                                                                                 | specified |
| Effective order is truthful                 | Current registry omits priority/effective position                                                                     | dependency/priority/declaration-order execution equals inspection output                                                                                                                                   | specified |
| Profiles reproduce policy                   | Wordgard `fromJSON` requires extensions again and closures are not serializable                                        | code profiles carry referenced pure variants; flattened JSON IR stores exact refs; explicit app catalog resolves JSON; exact build fingerprint, missing-parent/variant, and nonportable-inline diagnostics | specified |
| Initialization and live policy share one IR | Static behavior changes are illegal after publication                                                                  | ordinary `.withBehaviors` and advanced `createPlateEditor({ behaviorProfiles })` resolve before factories/model; live preflight reports applicable/recreate/invalid                                        | specified |
| Capabilities are nominal and bound          | Current Plite capability bucket is string API-key discovery                                                            | type/cardinality/provider/binding/ambiguity tests without a global registry                                                                                                                                | specified |
| Per-behavior timing is attributable         | Current command buckets include command id only                                                                        | logical behavior, named implementation ID, keyed resource, epoch, and phase stay distinct across replacement                                                                                               | specified |
| Resource IDs never use indexes              | Commands can have duplicate same-phase registrations and corrections are index-derived                                 | duplicate command registration requires literal key; every array resource has a stable declared key                                                                                                        | specified |
| Profiler-off overhead is negligible         | Current profiler has a global sink check but incomplete resource coverage                                              | zero clock/allocation/string/filter/user-callback assertion plus strict command benchmark                                                                                                                  | specified |
| Query/correction/listener work is visible   | Current resources lose owner or aggregate timing; query middleware may yield                                           | focused traces for each resource kind; generator measures active resume segments only                                                                                                                      | specified |
| Profiling is bounded                        | Current React collector appends indefinitely                                                                           | max series/traces/spans/pending work and drop counters remain exact under load                                                                                                                             | specified |
| Export formats can evolve                   | Current profiler events have no versioned graph/policy receipt contract                                                | graph/policy/receipt/diagnostic/profile exports each carry tested `formatVersion`                                                                                                                          | specified |
| React behavior remains correct              | Table `onKeyDown` owns DOM-sensitive navigation                                                                        | `/blocks/table-demo` keyboard/copy/cut/selection Browser rows and React tests                                                                                                                              | specified |
| Partial preset is constrained               | Old split files did not prove every subset valid                                                                       | supported profile omits paste/navigation; invalid required/dependency combination explains the full chain                                                                                                  | specified |
| Collaboration law cannot drift              | Yjs currently guards schema but corrections still run on remote updates                                                | configurable law fingerprint mismatch rejects connection/transition, or document-law behavior remains required/static                                                                                      | specified |

Conditional evidence:

- High-risk scenarios:
  1. Omit/select one optional named variant without changing the default Table
     plugin, public capability types, or required document law; anonymous
     replacement export is explicitly nonportable.
  2. Enforce exposure/presence/activation/replacement independently and reject
     misspelled, forbidden, incompatible, or cross-plugin missing handles with
     structured diagnostics.
  3. Compile a package-owned exact profile that does not silently enable a new
     default behavior after a package upgrade; exact scope never affects an
     unknown plugin catalog.
  4. Resolve the same flattened, versioned policy at initialization and live
     preflight; static changes report `requires-editor-recreation`.
  5. Apply multiple local activation decisions in one revision; stale expected
     revisions and dependency-conflicting batches return rejected receipts and
     publish nothing.
  6. Preserve the currently selected materialized implementation across
     disable/re-enable instead of re-evaluating a factory or restoring the
     package default.
  7. Reject live schema/API/tx/state/field/facet/effect/selection/correction/
     change-listener/lifecycle/render-hook/shared-protocol resources even when
     declared `local`; propagate static impact through dependencies/providers.
  8. Preserve the new published graph and return `committed-degraded` when
     activation/ready fails; attach cleanup failure to the old transition/
     tombstone; preserve the old graph for pre-publication failure.
  9. Ensure peers may differ on local paste/navigation policy but cannot
     silently differ on schema/correction/shared protocol law.
  10. Ensure one captured activation revision and effective order govern a root
      DOM event; reentrant apply rejects or queues to the next idle boundary,
      and legacy handlers have deterministic interleaving.
  11. Ensure profiling subscribers cannot affect command result, transaction
      rollback, lifecycle, or editor publication and never run inline.
  12. Ensure nested/around command timing attributes each visited registration
      with inclusive and self time; generator query suspension is not timed.
  13. Ensure effective order in diagnostics exactly matches execution after
      logical-slot dependency/priority resolution and replacement.
  14. Ensure profiler-off dispatch performs no clock read, event allocation,
      dynamic string construction, arbitrary predicate, or user callback.
  15. Enforce bounded metrics/traces/cardinality/epoch history and report every
      dropped series/span/batch.
  16. Ensure duplicate command-phase registrations and array resources require
      stable declared keys rather than indexes.
  17. Ensure a debug policy lease restores only its own layer and CAS-refuses
      after an incompatible app-policy change.
  18. Ensure repeated compatible plugin descriptors layer policy while
      incompatible catalog definitions or same-precedence decisions fail.
  19. Ensure code-authored profiles attach referenced named variants, explicit
      app catalogs resolve JSON profiles, and missing/mismatched fingerprints
      or capability bindings fail without global registries.
  20. Ensure a configured partial Table still supports explicit create/insert/
      remove APIs and rejects invalid documents through the remaining model.
  21. Ensure a behavior/resource can be inspected and profiled without thereby
      becoming publicly selectable or replaceable.
- Performance:
  - Reuse the strict command-dispatch benchmark from the completed command plan.
  - Add a configuration benchmark with 100 plugins, 1,000 behaviors, and a
    sparse dependency graph. Catalog/profile/graph compilation must stay
    `O(nodes + edges)`; batch authoring must not create chained conditional-type
    or array-copy growth.
  - Gate the disabled profiler fast path by structural assertions and require
    no material median regression in the existing benchmark. Record aggregate
    and sampled-trace overhead separately; never hide enabled costs in the
    baseline.
  - Benchmark the always-on root-event activation snapshot and resource gate/
    order lookup with 1,000 installed behaviors and profiling off. Capture one
    immutable token/bitset per event; forbid per-handler maps, strings, filter
    callbacks, and allocations.
  - Stress fixed limits for metric series, trace/span buffers, subscriber
    batches, pending asynchronous drain work, and configuration history.
- External research: local checkouts supplied source evidence for Wordgard,
  Tiptap StarterKit, Portable Text typography/behaviors, urql debug
  composition, VS Code extension manifests/status, and LSP registration/
  diagnostic identity. Adopted conclusions are recorded in the ledger; no
  donor runtime is copied.
- Issue/PR provenance: not applicable; this is a source-led architecture
  decision without a public ticket.
- Docs/registry/browser/release:
  - Docs: plugin methods/API, debugging, Plite extensions, and Table reference
    in English/Chinese where a paired page exists.
  - Registry example: source registry only; never edit generated templates.
  - Browser: start the relevant www dev server and verify
    `/blocks/table-demo`; add/use a standalone partial-preset demo if needed.
  - Release: changesets for each published package whose public surface changes.
  - Barrels: run `pnpm brl` after exported handles/types change.

Findings:

- The current answer is not “we already have it.” Plate users can disable a
  whole plugin and authors can key a raw Plite extension, but Table does not
  expose a supported partial preset.
- The old `withTable*` layout exposed implementation pieces, not a coherent
  user contract. `BaseTablePlugin` still installed the full override, and
  partial reconstruction depended on private assumptions.
- Table's 5,179-line owner is readable as one coherent unit. The architectural
  loss came from merging seven ambient execution families under one `table`
  name, not from colocation.
- Plate's current keyed overload is not a manifest: it discards the literal
  key from the returned type, flattens API/tx/state into intersections, permits
  explicit child names to override the implicit key, and intentionally merges
  repeated keys. Type subtraction or a stable public handle cannot be bolted
  onto that shape soundly.
- Plite already surpasses Wordgard for named compilation, dependency/conflict
  validation, slot replacement, and staged publication. Rebuilding
  compartments or anonymous extension arrays would be regression.
- Plite's `ExtensionRecord.owner` means slot-parent lifecycle ownership, not
  Plate provenance. These identities must remain separate.
- Plite's activation failure law publishes the candidate first and isolates
  lifecycle failure afterward. The earlier rollback claim was false.
- Wordgard's durable product lesson is the full-default-plus-granular-pieces
  pattern. Its Table implementation only partially achieves that pattern.
- Tiptap validates the one declarative map AX; Portable Text validates
  preset/add/subtract policy; VS Code/LSP validate separate manifest,
  capability, registration, status, and diagnostic identities. None supplies
  Plate's complete runtime model.
- Current profiling cannot answer “which Table behavior consumed 18 ms?”
  because compiled command/query/listener records discard extension ownership.
- Current profiling is also structurally unscalable: one global synchronous
  sink, an unbounded React event array, no logical/implementation revision
  split, and no honest generator-query or nested self-time model.
- `DebugPlugin` is a manual sink. Discovery belongs in a core immutable graph;
  opt-in profiling belongs in a bounded per-editor diagnostics session.
- `TablePlugin.extensions.paste` would still be the wrong public ontology:
  Table navigation/clipboard live in React handlers while other policy lives in
  Plite. A Plate behavior can own both without adding a second runtime.
- Current React `pipeHandler` snapshots plugin-list handlers and never consults
  extension state, so provenance alone cannot make runtime activation atomic.
  Host dispatch needs the Plite-published behavior activation record and
  effective order.
- Current `editor.update` callbacks and extension reconfiguration return
  `void`; the receipt promise requires a dedicated top-level update method
  rather than pretending a transaction callback can return it.
- Current Plite capabilities are string-keyed API buckets, not nominal
  substitutable behavior contracts. Plate composition capabilities need an
  explicit typed handle/provider/binding law.
- The completed Table colocation plan intentionally said explicit extension
  names are for separate identities and left a composition gap conditional.
  This user requirement triggers that condition; it does not reverse the
  colocation decision.

Decisions and tradeoffs:

- File, plugin, capability, behavior, Plite extension, implementation,
  installed revision, and resource identities are distinct. One owner file can
  declare many behaviors and extensions.
- Public behavior identity is stable `(pluginName, localKey)`. Package/build/
  version/policy layer are provenance, never identity. Replacements preserve
  the logical handle and change implementation/revision identity.
- A name makes work inspectable; it does not make it publicly selectable.
  Feature owners classify exposure, presence, activation, and replacement
  independently and publish only supported profile combinations.
- Plite is the sole composition/publication graph, not the sole executor.
  Host resources consult the same published activation token/order and live
  policy changes occur only at idle root boundaries.
- Static policy is broad but constrained by contracts/dependencies. Runtime
  policy is deliberately local because schema, selections, state, corrections,
  history, lifecycle, shared effects, and collaboration can make removal
  unsafe.
- Explicit API/update methods stay present because callable capabilities have
  no ambient runtime cost. Profiles never subtract public capability types.
- Sparse user policies inherit future defaults; scoped exact package presets
  deliberately pin a known set. Missing hard dependencies are errors, not
  implicit cascade or plugin installation.
- One flattened, versioned decision IR drives editor initialization and live
  preflight/apply. Named variants are pure code descriptors attached to the
  editor-local catalog; anonymous code stays nonportable.
- Static app composition remains the existing Plate story: immutable plugin
  descriptors in plugin/kit arrays. `.withBehaviors` compiles a plugin-local
  policy layer; it does not create a parallel preset or runtime concept.
- One-use replacements stay inline and inferred. A behavior handle's
  `.variant(...)` constructor and `defineBehaviorProfile` appear only when
  reuse, cross-plugin coordination, serialization, or live switching justifies
  durable identity.
- The normalized decision IR, fingerprint bookkeeping, and explicit variant
  resolution are tooling/portability surfaces, not the baseline authoring API.
  A generic `profiles` editor option and mutation-method families on behavior
  handles are deliberately absent; the single pure `.variant(...)` constructor
  is retained because the handle is the best type-inference and discovery
  owner.
- Nominal composition capabilities are separate from plugin API capabilities
  and Plite's runtime API-key discovery.
- Lazy code may be imported by the host before graph compilation; dispatch,
  activation, and atomic publication remain synchronous.
- Central instrumentation is mandatory. Wrapping every plugin callback would
  duplicate policy, lose ordering truth, and impose avoidable overhead.
- Inspection, profiling, and composition are separate responsibilities.
  Profiling never decides execution and never invokes user code inside the hot
  path.

Review fixes:

- Rejected the initial `.omitExtension`/`.replaceExtension` API after
  large-profile, type, runtime, collaboration, and observability red-teams.
- Reversed the earlier rejection of a Plate behavior catalog. It is required as
  a compile-time cross-runtime product boundary, while named Plite extensions
  remain the execution unit.
- Rejected child microplugins after confirming they carry full schema/product
  identity.
- Rejected type subtraction and arbitrary replacement after confirming the
  keyed builder flattens per-key contributions and runtime slots accept
  unrelated replacement shapes.
- Replaced author-declared `safe` and single `setEnabled` with compiler-derived
  impact, explicit `static`/`local` intent, and one atomic batch apply.
- Replaced raw synchronous observation with core graph discovery, aggregate
  profiling, and bounded sampled traces.
- Corrected lifecycle rollback semantics and added active/degraded health.
- Added exact presets, policy provenance, semantic capabilities, collaboration
  law fingerprints, preflight/diffs, lazy pre-resolution, React ownership, and
  bounded cardinality.
- Split composition permission into four axes; defined the normalized decision
  IR, pure named variants, flattened profile lineage, construction-time
  application, receipt states, and debug leases.
- Added the missing cross-runtime activation/order bridge, idle-boundary law,
  host-agnostic external spans, conservative resource taxonomy, and transitive
  runtime impact.
- Re-ran the public façade against live Plate/Plite conventions. Kept
  `.extendBehaviors`, `.withBehaviors`, frozen typed handles with one
  permission-sensitive `.variant(...)` constructor, and grouped
  `editor.update.behaviors.apply`; moved ordinary static composition back into
  existing plugin/kit arrays; made one-use replacements inline; and demoted
  named profiles, variants, preflight, revisions, and wire IR to earned
  advanced surfaces.

Error attempts:

| Error / failed attempt                                         | Count | Next different move                                                                 | Resolution                                                                                               |
| -------------------------------------------------------------- | ----: | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Broad docs/options search produced truncated historical output |     1 | Restrict reads to named current owners and exact symbols                            | Current claims now use bounded source ranges                                                             |
| Refresh queries used shell-sensitive backtick patterns         |     2 | Use single-quoted patterns and keep syntax terms out of double-quoted shell strings | Follow-up audits used safe single-quoted patterns; no source or plan content was changed by either query |

Verification evidence:

- Read current Table extension blocks, options/API/update contract, React
  handlers, exports, tests, and configured callers.
- Read current Plate plugin config/builders, keyed extension normalization,
  unnamed merging, plugin resolution/publication, runtime bridge, plugin portal,
  DebugPlugin, React `pipeHandler` snapshot/order semantics, and current docs.
- Read current Plite extension descriptor/registry/slots/reconfiguration,
  ordering, command/query/correction/listener/tx/lifecycle execution, profiling,
  activation-failure contracts, and focused tests.
- Read current `EditorUpdate`/transaction return contracts, `afterCommit`,
  string-keyed Plite capability discovery, and synchronous lifecycle constraints
  before finalizing receipts, nominal capabilities, and idle-boundary apply.
- Read the complete TARGET-bounded Wordgard mechanism graph: extension
  flattening/facets/fields/compartments/order, command/keymap/handler pipelines,
  Table bundle and standalone pieces, lifecycle, logging, tests, and absence of
  profiler/devtools.
- Read VISION/common/Plate doctrine, the candidate analysis, completed command
  architecture decisions, and completed Table colocation constraints.
- Re-read root VISION plus common, Plate, and Plite detail doctrine for the
  final public façade checkpoint. Confirmed that Plate owns
  plugins/kits/product ergonomics, Plite owns the grouped update and
  publication substrate, and profile-driven runtime law does not require
  profiles as ordinary static syntax.
- Re-read current immutable plugin builders at
  `createBasePlugin.ts:464-700`, Plate method typing at
  `PlatePlugin.ts:680-864`, the existing `TableKit` plugin array, Plite grouped
  extension reconfiguration at `interfaces/editor.ts:398-404`, and immutable
  extension handles at `extension-slot.ts:52-69`.
- Ran independent read-only red-teams for composition/profile AX, advanced
  TypeScript and identity, runtime graph/collaboration, observability/
  cardinality, and ecosystem architecture. All rejected omit/replace as the
  canonical API; runtime/identity reviewers independently selected a Plate
  behavior catalog over a raw public extension catalog.
- Ran a final source-backed adversarial plan review. It forced the cross-runtime
  activation/order bridge, receipt channel, four permission axes, normalized
  wire IR, editor-local variant/profile resolution, initialization path,
  conservative/transitive runtime impact, versioned exports, and idle-boundary
  law now recorded above.
- The final adversarial re-read confirmed the install-only variant/fingerprint
  closure and reported no remaining architecture blocker or contradiction.
- Read local Tiptap, Portable Text, urql, VS Code, and LSP owners named by the
  ecosystem review before adopting their manifest/profile/diagnostic lessons.
- Planning-only artifact lint:

  ```sh
  node .agents/skills/autogoal/scripts/check-complete.mjs \
    docs/plans/2026-07-23-plate-plugin-behavior-composition-observability.md
  ```

  Result: `[autogoal] complete`.

- Final refresh reconfirmed seven unnamed Table `.extendExtension` calls,
  `plate:runtime`, and command-id/phase-only timing labels.
- `git diff --check` passed for this plan, and the unresolved-marker scan
  returned no matches.

Execution verification commands:

```sh
pnpm turbo typecheck \
  --filter=./packages/plite \
  --filter=./packages/core \
  --filter=./packages/table \
  --filter=./packages/plite-react

pnpm --filter @platejs/plite test -- \
  generic-extension-install-contract \
  extension-configuration \
  command-spec

pnpm --filter @platejs/core test -- \
  createBasePlugin \
  resolvePlugins

pnpm --filter @platejs/table test
pnpm check:plite:dev
pnpm check:core
pnpm brl
pnpm lint:fix
```

At aggregate closure, run the relevant www typecheck, Browser proof, strict
`pnpm check:plite` because Plite runtime changes, package changeset checks, and
`autoreview`.

Final handoff prepared:

- Ownership and target API: Plate Core owns behavior manifests, handles,
  profiles/variants, policy compilation, host activation/order, provenance, and
  discovery/debug AX; Plite owns the host-agnostic composition/publication
  graph, group ordering, atomic publication, lifecycle health, resource
  attribution, and diagnostics collection; Table owns the behavior catalog,
  constraints, and supported profiles.
- Public changes: additive `extendBehaviors`, ordinary plugin-local
  `withBehaviors`, frozen `plugin.behaviors` handles with a pure
  `.variant(...)` constructor only where replacement is allowed,
  `defineBehaviorCapability`, ergonomic `defineBehaviorProfile`, advanced
  `createPlateEditor({ behaviorProfiles })`, core inspect/preflight,
  receipt-returning `editor.update.behaviors.apply`, debug policy leases, and
  bounded profiling. The normalized IR, variant catalogs, fingerprints, and
  expected revisions stay out of baseline examples. No generic `profiles`
  option, top-level variant constructor, omit/replace/toggle method family,
  global registries, or old helper aliases.
- Runtime/package/docs/browser decisions: all specified above, including
  paired docs, source registry example, changesets, barrels, package proof, and
  `/blocks/table-demo`.
- Main risk: inventing a second behavior runtime, splitting host/Plite
  publication truth, or claiming arbitrary live policy is safe. The plan keeps
  behavior declarative, Plite authoritative, host dispatch revision-gated, and
  runtime changes optional/local/transitively impact-checked at idle boundaries.
- Execution order: Plite graph truth, diagnostics hub, Plate behavior catalog,
  policy compiler, host activation/order, discovery/debug AX, Table adoption,
  collaboration-law gate, docs/release, aggregate proof/review.
- User attention: accept or reject the Plate behavior ontology and tiered
  façade: `.withBehaviors` in normal plugin/kit arrays; named variants/profiles
  only when identity is earned; grouped runtime apply for live modes.
  `.withExtensions({...})` remains the explicit smaller fallback;
  `.omitExtension`/`.replaceExtension` is rejected.

Timeline:

- 2026-07-23T08:34:13.788Z: plan created and TARGET declared.
- 2026-07-23: current Plate/Table/Plite owners and doctrine reconciled.
- 2026-07-23: Wordgard exhaustive TARGET audit completed.
- 2026-07-23: initial named-extension design selected and behavior-profile
  direction rejected; this decision was later superseded by the future-scale
  red-team. Child microplugins remain rejected.
- 2026-07-23: adoption, proof, performance, browser, release, and handoff
  sections completed.
- 2026-07-23: user challenged whether the proposed `omitExtension` /
  `replaceExtension` surface is the absolute best scalable API; handoff
  withdrawn and future-scale red-team opened.
- 2026-07-23: five independent red-teams rejected method-based extension
  surgery; source correction found post-publication activation failure does not
  roll back.
- 2026-07-23: target revised to a Plate behavior manifest, declarative static
  policy, serializable cross-plugin profiles, revisioned batch runtime apply,
  immutable graph discovery, and bounded aggregate/trace diagnostics.
- 2026-07-23: final adversarial review closed cross-runtime gating/order,
  receipts, profile/variant resolution, permission-axis, local-impact,
  reproducibility, and observability-cardinality gaps.
- 2026-07-23: follow-up adversarial re-read found no remaining blocker; final
  plan checker and whitespace/unresolved audits passed.
- 2026-07-23: Vision/Plate/Plite façade checkpoint rejected the still-too-wide
  public example. Static composition returned to ordinary plugin/kit arrays,
  one-use replacements became inline, and profiles/variants/wire controls
  became earned advanced surfaces without changing the behavior/extension
  ownership model.
- 2026-07-23: live Plite slot-handle evidence refined the reusable variant API
  to `TablePlugin.behaviors.delete.variant(...)`; the separate top-level
  constructor was removed from the target surface.

Reboot status:

| Question             | Answer                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where am I?          | Final Slate/Plate façade is source-reviewed and ready                                                                                                                   |
| Where am I going?    | Wait for user acceptance before implementation                                                                                                                          |
| What is the goal?    | A canonical scalable composition and observability model, not merely local Table helpers                                                                                |
| What have I learned? | Behaviors are Plate's product unit; extensions remain Plite's runtime unit; profiles select behavior internally, but static users should still compose plugins and kits |
| What have I done?    | Preserved the behavior architecture while removing profile/variant/wire ceremony from the ordinary public path                                                          |

Open risks:

- The exact `local` footprint must be enforced by compiler and runtime
  validation and transitive dependency closure; author intent alone is
  insufficient.
- Behavior, Plite parent owner, implementation provenance, and installed
  revision must survive replacement/publication without identity conflation.
- Table navigation refactoring must preserve DOM geometry, IME, multi-cell
  selection, native event ownership, effective order, and idle-boundary gating.
- Exact Table behavior boundaries/dependencies may require merging or hiding
  draft rows; naming does not authorize every subset.
- Enabled profiling can be expensive but must stay bounded; disabled profiling
  cannot touch the hot path.
- Configurable correction/shared-protocol law cannot ship for collaboration
  until a semantic compatibility fingerprint and transition protocol exist.
