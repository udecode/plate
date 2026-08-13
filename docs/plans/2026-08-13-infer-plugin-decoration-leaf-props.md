# infer plugin decoration leaf props

Objective:
Infer plugin-owned transient decoration fields in live and static leaf props,
remove every same-class escape, and preserve decoration rendering behavior.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-infer-plugin-decoration-leaf-props.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api
- agent-native
- browser

Mode:
- `standard`

Completion threshold:
- Core carries the inferred decoration payload from plugin authoring into
  `PlateLeafProps<typeof Plugin>` and `PliteLeafProps<typeof Plugin>`.
- Every production cast, `Reflect.get`, raw-node alias, or structural mirror
  used only to recover plugin-owned decoration fields is removed or given an
  independently justified owner.
- Positive and negative compile contracts, Core/package builds, focused live
  and static rendering tests, doctrine/release proof, browser proof or exact
  blocker, P2 review, zero-match audits, and `check-complete` close.

Verification surface:
- Full-repo AST/text audit of decorator payload declarations and renderer-leaf
  escape patterns.
- Compile-only Core contracts for inferred decoration fields and rejection of
  unknown fields.
- Core, code-block, and affected app/source checks plus focused live/static
  syntax-rendering tests.
- `pnpm install` after source-rule repair, package changeset classification,
  Browser proof on the code-block demo, P2 autoreview, and the goal checker.

Constraints:
- The user's `go fix` explicitly accepts execution; do not stop for another
  plan approval.
- No public compatibility aliases or runtime shims.
- Do not persist transient presentation fields in schema merely to make types
  compile.
- Do not replace escapes with local structural leaf types, explicit callback
  annotations, `any`, or another cast.
- Preserve existing syntax-highlight rendering and DOCX color/style mapping.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: decoration callback typing, normalized plugin definitions,
  descriptor-owned renderer props, every production same-class escape, tests,
  registry adoption, release prose, and durable API doctrine.
- Source owners: `packages/core`, `packages/code-block`, affected production
  consumers, `.agents/rules/best-api.mdc`, Plate Vision, and the owning Core
  changeset.
- Non-goals: changing decoration runtime semantics, persisted document schema,
  syntax token classes, Highlight.js behavior, unrelated renderer cleanup, or
  compatibility overloads.
- Direct Plite boundary owners: `DecoratedRange` and text-leaf merge runtime in
  `packages/plite`; change only if generic payload typing cannot remain a Plate
  product-layer concern without duplicating the substrate contract.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if contextual inference cannot carry one plugin's decoration
  payload without recursive/declaration failure after three distinct owner
  designs, or browser/package proof is externally unavailable after the exact
  source and focused-test alternatives are exhausted.

Plate Plan state:
- status: active
- phase: ground
- next: decide
- handoff: not-prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full sweep and owning fix, not three local casts; preserve runtime behavior |
| Active goal and plan verified | yes | This exact plan is the one-shot execution ledger |
| Current owners read | yes | Code-block decorator, live/static renderer props, plugin definition/compiler, and current consumers inspected |
| Best API target resolved | yes | Descriptor leaf props include plugin-authored transient decoration fields; raw decoration remains non-persisted |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by `go fix` |
| Package/API pack selected | yes | Core public renderer-prop inference changes |
| Public surface or package boundary identified | yes | `PlateLeafProps` / `PliteLeafProps` and plugin authoring definition inference |
| Release artifact path selected | pending | Choose one: `.changeset`, registry changelog, or `N/A: no published user-visible delta` |
| `changeset` skill loaded when `.changeset` is required | pending | pending |
| Barrel/export impact decision recorded | pending | pending |
| Agent-native pack selected | yes | Reusable no-cast decoration inference law |
| Agent-facing action surface identified | yes | `best-api` and Plate Next must reject renderer casts hiding lost plugin payload inference |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` through `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | pending | pending |
| Browser pack selected | yes | Registry code-block syntax classes are rendered UI |
| Browser route / app surface identified | yes | Standalone code-block demo route discovered before final proof |
| Browser tool decision recorded | yes | Use in-app Browser; no native Chrome behavior involved |
| Console/network caveat policy recorded | yes | Record route, visible syntax token classes, console/network state, or exact unrelated blocker |

Work Checklist:
- [ ] Outcome, scope, non-goals, constraints, and owners are concrete.
- [ ] Current API/docs/tests/exports claims cite live source.
- [ ] Reusable public call shape has one `best-api` verdict before target lock.
- [ ] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [ ] Public breaks and any private bridge have complete adoption/deletion answers.
- [ ] Execution slices and focused proof matrix are concrete.
- [ ] Conditional work and final handoff are resolved without generic N/A matrices.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.
- [ ] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [ ] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [ ] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [ ] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pending | Resolve every readiness condition | pending |
| Fresh source evidence | pending | Recheck decision-changing current claims | pending |
| Best API review | pending | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | pending |
| Conditional risk and adoption | pending | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | pending |
| Verification recorded | pending | Record fresh planning proof and exact execution gates | pending |
| Handoff prepared | pending | Prepare concise ownership, breaks, proof, risks, and execution order | pending |
| P2 autoreview | pending | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-infer-plugin-decoration-leaf-props.md` | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pending |
| Agent action discoverability | pending | Source-audit the skill/rule path an agent will read | pending |
| Agent-native review | pending | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pending |
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | in_progress | Plan created | Decide |
| Decide | pending | | Prove and hand off |
| Prove and hand off | pending | | User review |

Decision brief:
- outcome: plugin component props infer persisted schema fields and transient
  decoration fields from the same descriptor without casts.
- chosen shape: normalize the decoration payload into the descriptor's exact
  definition and derive rendered `leaf` from schema text plus that payload.
- strongest rejected alternative: add `className` to code-block schema;
  rejected because it would lie that presentation-only decoration data is
  persisted document state.
- consequence: Core gains one internal decoration type carrier; authoring and
  renderer call sites remain annotation-free.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Decoration payload | `decorate` normalizes to boolean `true`, losing returned range fields | Carry exact non-Range payload in plugin definition | Core plugin compiler | Descriptor is the honest owner of renderer inference | Sweep all decorators and leaf consumers | Compile contracts + Core build + renderer tests | Recursive callback inference or union widening | rearchitect |
| Syntax leaf consumers | `Reflect.get(..., 'className') as string` bypasses exact props | Direct `props.leaf.className` inferred as optional string | Code-block + registry | Eliminate cast and preserve transient semantics | Three known consumers plus full related sweep | App/package typecheck + browser/static proof | Missing optionality or output drift | cut |
| Doctrine | Existing descriptor-props law covers schema only | Require inferred transient decoration payload and reject local escapes | Best API + Plate Vision + Plate Next versioned doctrine if edited | Prevent recurrence | Source rule, generated mirror, migration check | `pnpm install` + agent-native review | Doctrine fingerprint/version churn | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| Core inference | Core | definition carrier, compiler normalization, props derivation, type tests | Accepted target | Exact payload reaches live/static leaf props | Core build/contracts/tests |
| Full adoption | Code-block and all matched consumers | Remove every related escape; retain only independently owned dynamic access | Core inference compiles | Zero unjustified matches | Source audit, package/app checks, focused render tests |
| Doctrine/release | Rule, Vision, changeset | Teach final rule and classify published Core delta | Final API stable | No stale teaching or release gap | `pnpm install`, source parity, changeset checks |
| Closure | All touched owners | Browser proof, P2 autoreview, final audits/checker | Focused proof green | No accepted P0-P2 findings and checker passes | Browser + helper + `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| `decorate` callback preserves its exact payload without annotations | Current callback produces `CodeBlockDecoration` but definition stores only `true` | Compile-only inferred payload contract | pending |
| Live/static descriptor leaf props expose optional decoration fields | Props currently expose schema text only | Positive direct-access and negative unknown-field contracts | pending |
| No production type escape remains for lost decoration inference | Three known `Reflect.get` matches; full class audit pending | Zero-match source audit with every survivor classified | pending |
| Syntax rendering is unchanged | Current token class strings and DOCX mapping are source-backed | Focused tests and Browser route | pending |

Conditional evidence:
- High-risk scenarios: payload accidentally becomes persisted schema; callback
  inference widens to `object`; dependency decoration payload leaks into a
  descriptor-local component. Each needs a negative type/runtime proof.
- External research: N/A; current Plate/Plite type ownership is authoritative.
- Issue/PR provenance: N/A; user-directed local architecture repair.
- Docs/registry/browser/release/behavior-law owners: Core changeset, registry
  code-block UI, Plate Vision, and API doctrine apply.

Findings:
- `BasePluginDefinition.decorate` stores only `true`; the descriptor cannot
  recover fields returned by its decorator.
- Code syntax emits transient `{ codeSyntax: true, className: string }` ranges,
  while its persisted schema correctly owns only the `codeSyntax` mark.
- All three current registry consumers use the same `Reflect.get` plus cast
  bandage; the value is actually optional.

Decisions and tradeoffs:
- Keep decorations transient and descriptor-owned for renderer inference.
- Carry only the payload beyond `Range`/`merge`, not callback/editor internals.
- Descriptor-local props exclude dependency payloads, matching existing schema
  locality.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:
- Pending.

Final handoff prepared:
- Ownership and target API: pending.
- Public breaks and adoption: pending.
- Applicable runtime/package/docs/browser decisions: pending.
- Proof and execution risks: pending.
- Execution order and user attention: pending.

Timeline:
- 2026-08-13T10:43:13.661Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ground |
| Where am I going? | Implement Core inference, adopt all matches, prove behavior |
| What is the goal? | Remove all decoration-field type escapes through owner-correct inference |
| What have I learned? | The normalized descriptor drops decoration payload shape |
| What have I done? | Accepted target and execution ledger established |

Open risks:
- Pending.
