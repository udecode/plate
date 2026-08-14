# Harden runtime node identity

Objective:
Harden live node identity and remove AI durable-ID misuse; done when foreign
keys fail closed and focused Plite/Plate proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-harden-runtime-node-identity.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard` accepted-target execution. The user accepted the immediately
  preceding `best-api` recommendation with “go do all your suggestions”.

Completion threshold:
- A key created by editor A resolves in A and returns `null` in editor B,
  including when both editors contain the same local ordinal.
- Runtime ownership is private, independent of configurable `editor.id`, stable
  through moves/immutable replacement, and absent from persisted formats.
- Plite DOM/React node binding and hydration-facing markup retain one coherent,
  tested key representation.
- AI comments and table-cell references use request-local tokens backed by
  `NodeKey`; AI registry/package code no longer installs or reads
  `ElementIdPlugin` for request-local work.
- Durable element identity remains an optional `ElementIdPlugin` capability.
- Focused Plite, Plite React, Core, AI, and registry/type proof passes; required
  release/doctrine artifacts, P2 autoreview, and `check-complete` pass.

Verification surface:
- Focused Plite node-key/snapshot/change tests, including the pre-fix
  cross-editor alias repro.
- Focused Plite React DOM-binding and SSR/rendered-shape proof.
- Core `ElementIdPlugin` proof to preserve the durable bridge.
- AI plugin tests plus www typecheck/focused tests for request-token adoption.
- Package source-first typechecks, lint/Biome, source audits, changesets,
  doctrine sync, P2 autoreview, and final goal checker.

Constraints:
- Preserve the public `editor.key`, `state.key`, `tx.key`, `NodeKey`, and
  `nodes.path` call shapes; the key string format stays opaque.
- Do not derive runtime ownership from public/configurable `editor.id`.
- Do not persist runtime keys or send their raw representation as AI protocol.
- Do not weaken `ElementIdPlugin` durability, uniqueness, migration, or index
  behavior.
- Preserve SSR/hydration-safe DOM behavior; do not accept random server/client
  attribute drift.
- No public compatibility aliases or runtime shims.
- Preserve unrelated shared checkout work.

Boundaries:
- In scope: Plite node-key allocation/validation, Plite React DOM binding needed
  by that representation, exact tests, AI request-local reference ownership,
  identity doctrine/skills, release notes, and directly affected registry code.
- Source owners: `packages/plite`, `packages/plite-react`, `packages/core` only
  for durable-ID regression proof, `packages/ai`, and the AI registry/API prompt
  consumers under `apps/www`.
- Non-goals: changing persisted element-ID schema, making runtime keys survive
  reloads/processes/clients, redesigning `editor.id`, or unrelated TOC/Markdown
  durable-ID adoption.
- Direct Plate adoption owners: AI package and AI registry kit/chat/server
  prompt. Collaboration is N/A because runtime keys remain non-serializable.

Output budget strategy:
- Read named owners first; use bounded `rg` counts/file lists before source
  slices; exclude generated manifests/templates/build output unless a named
  verification owner requires them; cap command output and keep test logs terse.

Blocked condition:
- Stop only if three distinct owner-level implementations cannot simultaneously
  preserve foreign-key rejection, immutable-update stability, and SSR/DOM
  correctness, or a required local verifier is unavailable after the repo's
  prescribed reinstall recovery.

Plite Plan state:
- status: complete
- phase: prove-and-handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | All immediate accepted suggestions are explicit in threshold, constraints, boundaries, decisions, slices, and proof matrix |
| Active goal and plan verified | yes | Goal `019ff6e8-42c2-7023-a6f8-9640f6e0efa1`; this plan is its named ledger |
| Current owners read | yes | `node-keys.ts`, editor construction/types, snapshot index, Plite React DOM binding, `ElementIdPlugin`, `AIChatPlugin`, AI registry consumers |
| Best API target resolved | yes | Accepted review: private runtime ownership, foreign-key fail-closed, no `editor.id` seed, durable identity remains separate |
| Mode and execution boundary resolved | yes | One-shot standard execution authorized by “go do all your suggestions” |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one accepted `best-api` verdict.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public call shape is retained; internal representation break and durable bridge have adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Implement runtime ownership and regression proof.
- [x] Preserve and prove DOM/SSR bindings.
- [x] Replace AI request-local durable IDs with token-to-`NodeKey` maps.
- [x] Repair reusable doctrine/skill source and release artifacts.
- [x] Run focused/broad verification and P2 autoreview.
- [x] Resolve final handoff, risks, and goal checker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | complete | Resolve every readiness condition | Owning packages, behavior tests, release generators, doctrine, and browser proof pass; unrelated aggregate failures are recorded below |
| Fresh source evidence | complete | Recheck decision-changing current claims | Final source audits show no production AI durable-ID dependency or stale request API |
| Best API review | complete | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Public calls stay unchanged; private ownership and request-token law recorded in Vision and `best-api` |
| Conditional risk and adoption | complete | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Chromium editing row passes; www AI route blocker recorded; benchmark and provenance are scoped N/A |
| Verification recorded | complete | Record fresh planning proof and exact execution gates | Exact commands and counts are recorded below |
| Handoff prepared | complete | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section is complete |
| P2 autoreview | complete | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Final scoped local run: clean, no accepted/actionable P0-P2 findings |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-harden-runtime-node-identity.md` | final checker pending immediately after this ledger update |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live source and direct repro show cross-editor `n0` aliases | Execute |
| Decide | complete | User accepted private runtime scope and AI request-token target | Execute |
| Execute | complete | Runtime ownership, hydration adoption, AI request refs, doctrine, and release artifacts implemented | Prove and hand off |
| Prove and hand off | complete | Focused tests/typechecks/browser/generators/audits and clean P2 autoreview | Final user handoff |

Decision brief:
- outcome: foreign runtime keys cannot alias local nodes; request-local AI work
  no longer requires persisted element IDs.
- chosen shape: one opaque `NodeKey` carrying private runtime ownership, with
  unchanged public calls and request tokens mapped to local keys.
- strongest rejected alternative: derive keys from `editor.id`; rejected
  because it is public/configurable and cannot prove node continuity across
  reloads or clients.
- consequence: internal key/DOM plumbing may change, but runtime keys stay
  ephemeral and `ElementIdPlugin` keeps durable identity exclusively.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Live node ownership | Per-editor ordinal strings alias across editors | Encode or validate immutable private editor scope; foreign lookup returns `null` | Plite runtime | Enforce the documented editor-local identity law | Preserve public calls; update internal index/change/DOM consumers | Cross-editor regression plus snapshot/change suites | Key representation touches hot paths and DOM | rearchitect |
| DOM node binding | DOM attribute stores the raw current string key | Keep one coherent hydration-safe binding while internal ownership becomes unambiguous | Plite React/DOM | Avoid SSR/client drift and selector ambiguity | Update only internal binding helpers/types if required | Rendered DOM, provider, selection, and SSR-facing proof | Random/private scopes could cause hydration mismatch | gate |
| Durable identity | Optional element `id` maps to live `NodeKey` | Keep `ElementIdPlugin` unchanged except compatibility with the new opaque key | Core | Runtime uniqueness cannot establish cross-reload continuity | No consumer migration for durable references | Existing ElementId tests and typecheck | Accidental conflation would bloat/persist runtime identity | keep |
| AI request references | Comments/registry table prompt use persisted IDs; package tables already use `cN -> NodeKey` | Generalize request-local token maps for blocks/cells and remove AI `ElementIdPlugin` usage | AI package and registry | Requests need temporary correlation, not durable document identity | AI kit/chat/server prompt and tests adopt deterministic request tokens | AI tests, www typecheck, source audit | Server and client token order must agree or tokenized context must be client-owned | rearchitect |
| Identity doctrine | Says keys are editor-local but does not require foreign-key failure | Require foreign keys to fail closed and forbid deriving ownership from `editor.id` | Vision + `best-api` source rule | Prevent recurrence of the silent alias bug | Regenerate skills with `pnpm install` | Source audit and generated skill sync | Overprescribing representation could constrain DOM implementation | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Runtime key ownership | Plite | Allocation, parsing/validation, snapshot/change integration, focused tests | Accepted target and baseline repro | Foreign key cannot resolve in another editor; moves/replacements preserve key | Focused Plite tests and typecheck |
| 2. DOM/React adoption | Plite React/DOM | Key binding, attributes, selectors, hydration/render proof | Slice 1 stable | DOM lookup and rendering remain correct without leaking persistence | Focused Plite React tests/typecheck/browser route if runnable |
| 3. Durable bridge proof | Core | `ElementIdPlugin` live index compatibility | Slices 1-2 stable | Durable ID resolves the corresponding new live key | Focused Core ElementId tests/typecheck |
| 4. AI ephemeral refs | AI + www registry/API | Block/comment/table tokens, local maps, remove AI durable-ID membership | Slice 1 stable | No AI production dependency/read of `ElementIdPlugin`; responses resolve live nodes | AI tests/typecheck and www proof |
| 5. Doctrine/release/closure | rules, Vision, changesets | Identity law, generated skills, release notes, lint/review/checker | Runtime/adoption final | Sources and teaching describe one law; all gates pass | `pnpm install`, source audits, checks, P2 autoreview, goal checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Foreign keys fail closed | Direct repro: A `n0` resolves B `[0]` before fix | Plite regression asserts distinct keys, local resolution, foreign `null`, and rejected foreign assignment | passed |
| Same-runtime logical identity survives legal edits | Existing snapshot/change/key inheritance implementation and tests | Plite document-change suite 68/68 | passed |
| DOM/React remains coherent | DOM attributes drive maps and selectors | Hydration 2/2, DOM/provider/selection 21/21, Plite Chromium 1/1; rerender retains full mounted key | passed |
| Durable IDs remain separate | `ElementIdPlugin` indexes `id -> { nodeKey, path, root }` | Core durable bridge plus www integration 12/12 | passed |
| AI uses ephemeral correlation | Package table flow established `cN -> NodeKey` | AI 77/77, explicit slow 8/8, named-root request regression, zero production AI `ElementIdPlugin` matches | passed |

Conditional evidence:
- High-risk scenarios were covered: foreign key rejection, immutable mapping,
  SSR/client hydration plus rerender, moved comment targets, named-root request
  context, and table-cell response application.
- External research: N/A; accepted target came from current-source behavior and
  no external editor claim controls implementation.
- Issue/PR provenance: N/A; user-directed local architecture correction.
- Browser: official Plite Chromium typing row passes. The www AI demo cannot
  compile because the shared generated registry imports missing
  `@/registry/components/editor/plate-types.ts`; no changed AI code loads.
- Benchmark: N/A. Allocation remains one string per live node; the change adds
  a private per-editor scope lookup, not a new per-node data structure or loop.
- Docs/release: Plate/Plite Vision, `best-api` source and generated skill,
  package changesets, API-reference manifest, and registry changelog are synced.

Findings:
- `NodeKey` is a branded string but allocation is a per-editor `nN` counter.
- Direct proof before implementation: editor A's `n0` resolves editor B path
  `[0]`, violating editor-local ownership.
- Node-object key storage is already scoped by editor via nested `WeakMap`s;
  reverse lookup loses that scope because only the repeated string reaches the
  snapshot index.
- `editor.id` defaults to a process counter but accepts arbitrary caller input,
  so it cannot be the authority for private runtime ownership.
- Plite React writes raw keys into DOM attributes, making hydration behavior a
  required implementation gate.
- AI package table references already demonstrate the desired `cN -> NodeKey`
  pattern; registry comments/table prompts still use `ElementIdPlugin`.

Decisions and tradeoffs:
- Keep the public API unchanged; repair internal identity truth instead of
  adding another runtime-ID API.
- Keep durable IDs separate; global uniqueness while live does not provide
  cross-reload node continuity.
- Reject public `editor.id` as key seed; private ownership must remain valid
  even for caller-selected/reused editor IDs.
- Do not expose raw runtime key syntax to AI; request tokens isolate protocol
  from internal identity format.

Review fixes:
- Agent-native review passed: `best-api` action route, source owner, generated
  skill mirror, and `pnpm install` regeneration path remain coherent.
- P2 cycle 1 accepted named-root request provenance and rejected the selection
  marker finding after verifying committed `serializePromptBlocks` never added
  those markers; the latter is pre-existing prompt debt, not this regression.
- P2 cycle 2 accepted a mounted-DOM P1: every React rerender could restore the
  hydration-only short token. Ownership moved to a hydration-aware React hook,
  and the hydration test now asserts the full key survives a later rerender.
- After the required two-cycle pause, both fixes remained inside the original
  identity boundary. Final P2 autoreview returned no actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Bare Bun hydration test had no DOM | 1 | Use the package Vitest jsdom lane | Hydration suite passed 2/2 |
| Existing cross-editor equality assertions assumed globally reusable key bytes | 1 | Compare deterministic local DOM tokens while separately proving full-key isolation | Plite 68/68 |
| Initial slow AI test command omitted the explicit relative path | 1 | Run the two named slow files with `./` paths | 8/8 passed |
| AI fixture retained stale persisted `id` fields under the closed schema | 1 | Remove fixture-only IDs; test request refs directly | AI tests passed |
| API-reference check exposed the new internal helper | 1 | Exclude the internal helper and regenerate the manifest | `api-reference:check` passed |
| www AI browser route fails before changed code loads | 1 | Record the exact missing generated `plate-types.ts` owner; do not hand-create generated registry source | scoped browser blocker recorded |
| Full affected-tree typecheck reaches shared heading/List/Suggestion/Table failures | 2 | Prove owning files/packages and record exact external failures | Plite/React typechecks pass; AI changed files have no diagnostics |
| Full local autoreview could not safely scan an unrelated large untracked generated schema | 1 | Build a temporary Git review bundle containing only this change's baseline/live files | final scoped P2 review clean |
| First scoped review wrapper used a forbidden cleanup trap | 1 | Retain the isolated `/tmp` directory and rerun without deletion | review executed safely |

Verification evidence:
- `pnpm --filter @platejs/plite test -- document-change.test.ts`: 68/68.
- `pnpm --filter @platejs/plite-react test -- editable-hydration-contract.test.tsx rendered-dom-shape-contract.tsx provider-hooks-contract.tsx selection-reconciler-contract.test.tsx`: 23/23.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-react`: 6/6 tasks.
- `pnpm --filter @platejs/ai test`: 77/77.
- `bun test --preload ./config/plite-source-test-setup.ts ./packages/ai/src/react/AIChatPlugin.submit.slow.ts ./packages/ai/src/react/AIChatPlugin.actions.slow.ts`: 8/8.
- Core durable-ID and www comment-range integration: 12/12.
- `pnpm --filter plite test:plite-browser:chromium --grep "inserts text when typed"`: 1/1.
- Targeted Biome: clean. Earlier root `pnpm lint:fix`: clean except existing
  oversized audit-data warnings.
- Registry changelog generator: 56/56 source entries; API reference check: pass.
- Production source audit: zero AI `ElementIdPlugin`, `tableCellWithId`, or AI
  `blockId` matches. Durable-ID test-only matches remain intentional.
- `pnpm check:plite:dev` is externally blocked by heading renderer union
  incompatibility, List property inference, and Table inference/depth errors.
- Final scoped `.agents/skills/autoreview/scripts/autoreview --mode local
  --max-priority P2`: clean, no accepted/actionable findings.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns opaque live `NodeKey`; Plite React
  owns hydration-only DOM tokens; AI owns request-local refs; Core owns durable
  element IDs.
- Public breaks and Plate adoption: public key calls are unchanged. AI request
  payload/result fields hard-cut `blockId`/cell `id` to `blockRef`/`ref`, and
  `tableCellWithId` to `tableCellWithRef`.
- Browser/benchmark/docs/provenance: Chromium passed; benchmark and public
  provenance N/A; Vision, skill, changesets, API reference, and registry
  changelog are current.
- Remaining risk: aggregate typecheck and the www AI demo remain blocked by
  unrelated shared generated/schema-generic work, named above. No identity
  owner proof is failing.
- Execution order and user attention: no further identity work is required;
  repair the shared heading/List/Suggestion/Table lanes separately.

Timeline:
- 2026-08-13T11:57:04.376Z Plite Plan created.
- 2026-08-13: Accepted `best-api` target, direct cross-editor alias repro, and
  one-shot execution requirements recorded before source edits.
- 2026-08-13: Runtime ownership, hydration adoption, AI request refs,
  named-root repair, doctrine/release artifacts, browser proof, and clean final
  P2 autoreview completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final handoff |
| Where am I going? | Goal checker and completion |
| What is the goal? | Foreign live keys fail closed and request-local AI references use `NodeKey` without weakening durable IDs |
| What have I learned? | Private scope must survive reverse lookup and mounted DOM; request refs must preserve root provenance without exposing keys |
| What have I done? | Implemented and proved runtime scope, hydration-safe DOM adoption, AI request refs, durable separation, doctrine, release artifacts, browser behavior, and review closure |

Open risks:
- No open in-scope identity risk remains after final P2 review.
- Unrelated shared heading/List/Suggestion/Table type failures and the missing
  generated registry `plate-types.ts` prevent aggregate checkout closure; they
  do not invalidate the focused identity proof.
