# separate plugin and schema identity

Objective:
Separate plugin names from persisted schema type/key; done when Core, adopters,
doctrine, tests, and a zero-use audit prove no AST/schema operation uses a
plugin capability name as its storage identity.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-02-separate-plugin-and-schema-identity.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`, accepted-target execution.

Completion threshold:
- Core supports a definition-owned element `type` distinct from plugin `name`,
  defaults omitted element types to `name`, and exposes no element type on
  behavior-only plugins.
- Exact schema portals expose their authored/default `type` or `key` even when
  the plugin is not installed; raw-string portals use that string. Consumers
  never branch on `installed` to recover schema identity.
- Mark/property storage keys remain schema-owned and are never sourced from a
  plugin capability name after schema compilation.
- Every production AST construction, node match, codec, injection, schema
  target, test fixture, example, and current doc in scope uses the resolved
  type/key or an explicit persisted literal, never `name` as a type/key proxy.
- Public types preserve literal inference for default and overridden element
  types; invalid behavior-plugin `.type` access is rejected.
- Applicable focused tests, Core/package/app typechecks, lint, browser proof,
  API doctrine repair, autoreview, source audits, and `check-complete` pass.

Verification surface:
- Core plugin/schema compile tests and compile-only descriptor/portal tests.
- Focused tests for every affected feature package plus source-first typechecks.
- `rg`/AST audit over `packages/**`, `apps/www/**`, and `content/**` classifying
  every `.name`/`{ name }` flow into persisted `type` or property `key`.
- `pnpm install`, generated skill validation, changeset checks, barrels when
  exports change, lint, applicable www typecheck, Browser route proof, and
  final `autoreview`.

Constraints:
- User explicitly accepted execution in the current task.
- No public compatibility aliases or runtime shims.
- `type` is definition-owned and cannot be changed by `.configure()`.
- Do not restore `getType`, `NODES`, reverse lookup APIs, or universal fake
  `type` fields on behavior plugins.
- Preserve unrelated shared WIP and do not edit templates or generated
  registry payloads.

Boundaries:
- In scope: Plate Core plugin/schema authoring, normalization, compilation,
  portals, feature adopters, tests, current docs/examples, release notes, and
  agent doctrine required by the hard cut.
- Source owners: `packages/core`, directly affected `packages/*`,
  `apps/www/src/registry`, `content`, `.agents/rules`, `VISION.md`, and
  `docs/vision/plate.md`.
- Non-goals: unrelated plugin API redesign, registry generation, device testing,
  old compatibility aliases, and broad Plite schema redesign.
- Direct Plite boundary owners: schema element/property definitions and handles
  are read-only unless Plate cannot express the accepted identity law without a
  substrate fix.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the accepted identity split requires an incompatible Plite
  substrate decision that cannot be resolved from current source, or the same
  external/tooling blocker recurs three times with no narrower proof path.

Plate Plan state:
- status: complete
- phase: complete
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Accepted split, definition-only override, no fake behavior type, full adoption, doctrine repair, and zero name-as-type/key audit are recorded above. |
| Active goal and plan verified | yes | Active goal points to this plan. |
| Current owners read | yes | `PluginDefinition.ts`, `compilePlateModel.ts`, current doctrine and prior identity plan inspected. |
| Best API target resolved | yes | Accepted law: `name` capability; element `type`/property `key` storage identities, defaulting to name but independently declarable. |
| Mode and execution boundary resolved | yes | One-shot execution explicitly authorized by user. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pass | Resolve every readiness condition | Core/adopters/docs/doctrine implemented; only final review remains. |
| Fresh source evidence | pass | Recheck decision-changing current claims | Final Core portal/compiler/types and every adoption audit reread after implementation. |
| Best API review | pass | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Final law recorded below; no unresolved P0/P1 API question. |
| Conditional risk and adoption | pass | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Docs, changeset, registry, Browser route, collision/wrong-kind/type inference cases covered; device testing remains the accepted non-goal. |
| Verification recorded | pass | Record fresh planning proof and exact execution gates | Commands and results recorded below. |
| Handoff prepared | pass | Prepare concise ownership, breaks, proof, risks, and execution order | Recorded below. |
| Autoreview | pass | Run for implementation changes or record planning-only N/A | Final scoped Codex run: clean, no accepted/actionable findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-02-separate-plugin-and-schema-identity.md` | Running as the final ledger gate. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live compiler, portal, schema, adopter, docs, and doctrine owners audited. | Decide |
| Decide | complete | Accepted law: capability `name`; persisted element `type`; persisted property `key`; default equality only. | Prove and hand off |
| Prove and hand off | complete | Implementation, adoption, lint, types, tests, source audit, Browser proof, and structured review green. | Complete |

Decision brief:
- outcome: Schema identity is independent from capability identity without
  adding consumer fallback ceremony.
- chosen shape: Definitions own `type`/`key`, omission defaults to `name`, and
  exact or raw-string portals expose deterministic schema identity whether or
  not the plugin is installed. `installed` gates runtime capability only.
- strongest rejected alternative: Keep `name` as storage identity or require
  `portal.installed ? portal.type : literal`; both preserve the original lie
  and spread fallback logic across consumers.
- consequence: Persisted identities can evolve independently, behavior plugins
  cannot masquerade as schema plugins, and ordinary callers use one direct
  portal field.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Capability identity | Compiler equates `name` with storage identity | `name` locates capability only | Core plugin runtime | Capability and persisted documents evolve independently | Keep descriptor/name callers; migrate AST/schema callers | Core runtime and type tests | Wrong lookup domain | rearchitect |
| Element identity | Compiler hardwires `plugin.name` | Optional definition-owned `type`, default `name`; resolved element portals expose it | Core schema compiler | Honest persisted identity without ceremony | Migrate element owners and callers | distinct-name/type regression plus type proof | Broad caller blast radius | rearchitect |
| Mark/property identity | Compiler keys marks with `plugin.name` | Definition-owned schema key, default `name`; never universal element type | Core schema compiler | Property key is not element type | Migrate mark/property owners and callers | distinct-name/key regression | Generic property inference | rearchitect |
| First-party catalog | `PLUGINS` values are treated as both domains | `PLUGINS` remains capability-name catalog; first-party schema defaults may equal it | Utils/registry | Avoid second global catalog while keeping ontology honest | Replace storage-sensitive uses with descriptor/schema identity or persisted literals | zero semantic misuse audit | Copied registry needs raw values | keep with narrowed contract |
| Doctrine | `best-api` contradicts Plate vision and accepted law | One consistent default-not-invariant rule | Vision and agent rules | Prevent recurrence | Repair source rules, regenerate skills | skill validation and source audit | Generated drift | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core contract | Core plugin/schema | public types, definition normalization, compiler bindings, portals | Accepted target | distinct/default identities compile and run | focused Core runtime + type tests |
| 2. Feature adoption | affected packages | replace `name` storage proxies with inferred/resolved type/key | Core green | package source contains no semantic misuse | focused tests + source-first typechecks |
| 3. App/docs/release adoption | registry/current docs/changesets | migrate raw examples and teaching; preserve copied-source independence | packages green | current surfaces teach final API | www typecheck + Browser + docs checks |
| 4. Doctrine and closure | rules/Vision/generated skills | best-api repair, worker alignment, audit, lint, autoreview | API stable | zero accepted finding and plan checker green | `pnpm install`, skill validation, audits, lint, autoreview, check-complete |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| `name !== type` works | Initial compiler hardwired equality | Core distinct identity runtime/type regression | pass |
| omitted `type` infers `name` | Constructors infer the name literal | compile-only default regression plus uninstalled portal runtime proof | pass |
| behavior plugin has no `type` | Initial portal/binding fabricated one | negative type/runtime regression | pass |
| no name-as-storage misuse | Initial bounded audit found many proxies | 4,220-file schema adoption audit | pass |
| docs and doctrine agree | Initial Plate doctrine contradicted itself | Plate Next v47 validation and regenerated skills | pass |

Conditional evidence:
- High-risk scenarios: type/name collisions, configured/custom persisted types,
  and behavior plugins receiving fake document identity require focused proof.
- External research: N/A; accepted target and live owners are sufficient.
- Issue/PR provenance: N/A; user-directed local architecture hard cut.
- Docs/registry/browser/release/behavior-law owners: current docs/examples and
  package public API are affected; changeset, www typecheck, and one standalone
  registry route Browser proof apply. Raw device testing remains deferred.

Findings:
- The initial compiler targeted elements and properties with `plugin.name`;
  compiled schema identity now owns those bindings.
- Exact uninstalled schema descriptors are sufficient to resolve authored or
  default identity. Installation is irrelevant to identity but remains required
  for APIs, stores, descriptor access, and other runtime capabilities.
- Same-name descriptors from different schema families must resolve the
  requested descriptor's identity without granting access to the installed
  family's capabilities.
- `definePlatePlugin` needed the same constructor identity grammar and callback
  inference as `defineBasePlugin`; otherwise explicit React `type` values
  widened or disappeared in consumers.
- The final AST checker rejects name-as-storage flows, installed identity
  fallbacks, and spread-wrapped literal arrays in both source and docs fences.

Decisions and tradeoffs:
- Equality is a zero-config default, not a compiler invariant. This retains the
  common one-string path without coupling capability renames to persisted data.
- Resolved element type/property key must flow through inferred plugin/schema
  context; package code must not translate through `name`.
- No compatibility channel survives; stale name-as-storage calls are migrated.

Review fixes:
- Restored the Markdown hyperscript `@jsx jsxt` pragma found by the final app
  typecheck; kept the expected horizontal-rule identity descriptor-owned.
- Preserved literal `key`/`type` through Core normalization and propagated exact
  React constructor identity into callback types.
- Accepted autoreview P2: two legacy properties targeting one canonical key
  now throw instead of overwriting; focused migration tests and Utils typecheck
  pass.
- Accepted autoreview P2: Base constructor `api`/`read` callbacks preserve
  explicit creation-owned `type`/`key` literals without widening the inferred
  schema; Core declaration contracts cover both element and property owners.
- Accepted final autoreview P1: aggregate `schema.properties` contributors no
  longer receive a fake primary `.key`. Types require a mark, explicit key, or
  an actually matching declared property; compilation rejects explicit keys
  that own no property.
- Accepted final autoreview P2: the current Plite-to-Plate guide's three fresh
  editor examples use the current `paragraph` persisted type, not legacy `p`.
- Rejected autoreview's opaque-factory wrong-kind runtime finding: exact
  descriptor portal types already make the wrong field unavailable. Enforcing
  the same result after a caller deliberately erases the descriptor type would
  require eagerly executing author schema code or a new discriminated schema
  factory syntax. Neither belongs in this identity adoption, and returning the
  conventional identity for the requested raw/dynamically erased portal is the
  deliberate JavaScript fallback.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Conditional exact-descriptor return type caused TypeScript memory/performance regression | 1 | Keep one shallow portal shape and enforce wrong-kind access with exact overload/type contracts | Rejected; final Core contracts compile source-first. |
| Eagerly threading the full schema generic through every callback destabilized inference | 1 | Propagate only the constructor identity fields through the existing Plate callback owner | Resolved with exact `TType`/`TPropertyKey` generics. |
| Final `www` typecheck lost custom hyperscript JSX elements | 1 | Inspect the changed fixture instead of changing JSX globals | Restored its required `@jsx jsxt` pragma; standalone `www` typecheck passes. |

Verification evidence:
- `pnpm lint:fix` -> pass; 15 pre-existing oversized artifact warnings, zero errors.
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> Plate Next v47,
  42 active packages and 1 retired package valid; doctrine fingerprint
  `sha256:9e3513f7b250f00d0588649f1ea37ea7313172899827d454fc2e15c49d06c28b`.
- `node --test tooling/scripts/check-plate-schema-adoption.test.mjs` -> 56/56.
- `node tooling/scripts/check-plate-schema-adoption.mjs` -> pass across 4,220
  source and documentation files.
- Source-first recursive typecheck -> all 24 affected projects pass, followed by
  a standalone final `pnpm --filter www typecheck` pass after restoring the JSX
  pragma.
- `bun run test` -> 3,045/3,045 main tests plus every secondary fast suite pass.
- Focused Core portal/React/injection tests -> 25/25; focused Markdown tests ->
  34/34.
- Browser `/blocks/playground-demo` -> editor renders with contenteditable,
  headings, table, and code blocks. Console contains only the known script-tag
  warning and random table-cell-id hydration mismatch, unrelated to identity.
- Agent-native review -> pass: `plate-next` is discoverable from `AGENTS.md`,
  `.agents/rules/**` owns doctrine, `pnpm install` synced generated skills,
  v47 validates the mirror, and the AST checker plus tests provide repeatable
  proof.
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt-file
  docs/plans/2026-08-02-separate-plugin-and-schema-identity.md ...` -> clean;
  no accepted/actionable findings.

Final handoff prepared:
- Ownership and target API: Core definitions/compiled schema own persisted
  identity; portals expose it directly; `installed` owns capability presence.
- Public breaks and adoption: name-as-storage calls and installed identity
  fallbacks are hard-cut across packages, registry, tests, docs, and release
  prose; no compatibility alias remains.
- Applicable runtime/package/docs/browser decisions: direct portal identity is
  proved installed and uninstalled; behavior and known-shape wrong-kind access
  remain rejected, exact opaque-factory portals are statically kind-safe, and
  the registry playground renders.
- Proof and execution risks: automated proof is green; known Browser console
  warnings are unrelated existing issues; raw-device proof remains deferred.
- Execution order and user attention: implementation and every review/proof
  gate are complete; no user decision remains.

Timeline:
- 2026-08-02T07:51:41.718Z Plate Plan created.
- 2026-08-02 Core identity, portals, adopters, checker, doctrine, docs, and
  release prose migrated; Plate Next bumped and synced to v47.
- 2026-08-02 Final lint, 4,220-file audit, 24-project type graph, 3,042-test
  suite, focused regressions, and Browser playground proof passed.
- 2026-08-02 Review fixes closed migration collisions, Base callback identity,
  aggregate-property key inference, and stale paragraph docs; final suite is
  3,045/3,045 and scoped autoreview is clean.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | User handoff |
| What is the goal? | Separate capability and persisted schema identities with zero semantic misuse. |
| What have I learned? | Identity must be deterministic without installation; capability access must not be. |
| What have I done? | Implemented the hard cut and proved Core, packages, app, docs, doctrine, and browser adoption. |

Open risks:
- None in the accepted identity contract. Existing Browser script/hydration
  warnings and deferred raw-device testing are outside this task.
