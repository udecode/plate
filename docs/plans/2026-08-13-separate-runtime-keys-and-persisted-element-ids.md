# separate runtime keys and persisted element ids

Objective:
Separate live `NodeKey` identity from optional persisted element identity across
TOC, DOCX export, Markdown, AI, Core, registry policy, tests, and docs.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-separate-runtime-keys-and-persisted-element-ids.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- TOC/live navigation uses `NodeKey` and does not install `ElementIdPlugin`.
- DOCX TOC uses runtime keys and export-local bookmark names.
- Markdown `withBlockId` remains backed by `ElementIdPlugin` and proves a
  serialized identity round trip.
- AI uses runtime keys/request refs unless a real cross-session protocol opts
  into persisted IDs.
- `ElementIdPlugin.read.id(key)` resolves the persisted boundary without a
  caller node lookup.
- `ElementIdPlugin` remains framework-optional; registry installation is
  explicit product policy.
- Focused package tests/typechecks, docs/browser proof where runnable, source
  audits, lint, changeset/registry release evidence, P2 autoreview, and
  `check-complete` pass.

Verification surface:
- Focused Core, TOC, DOCX, Markdown, AI, and registry tests.
- Source-first typecheck for every changed package and `apps/www` when changed.
- `rg` audits for implicit `ElementIdPlugin` dependencies, stale AI persisted-ID
  modes, and live navigation using persisted IDs.
- Standalone registry demo/browser proof for affected TOC/Markdown surfaces, or
  an exact blocked-route reason.
- `pnpm lint:fix`, applicable changesets/registry changelog, P2 autoreview, and
  the autogoal completion checker.

Constraints:
- The user explicitly accepted the architecture and authorized execution.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Runtime keys never serialize. Persisted IDs never become a hidden dependency
  of live feature behavior.
- Preserve unrelated shared checkout work.

Boundaries:
- In scope: Core `ElementIdPlugin`; TOC live/static UI; DOCX export; Markdown
  block-ID conversion; AI prompts/request refs; relevant registry kits/docs,
  tests, release prose, and durable identity doctrine.
- Source owners: `packages/core`, `packages/toc`, `packages/docx`,
  `packages/markdown`, `packages/ai`, and affected `apps/www` registry owners.
- Non-goals: making `ElementIdPlugin` mandatory; serializing `NodeKey`; changing
  unrelated plugin identity/schema APIs; inventing a general cross-session AI
  protocol.
- Direct Plite boundary owners: existing `NodeKey`, `editor.key`, and keyed node
  lookup primitives only. Change Plite only if live proof exposes a missing
  substrate operation.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only when the same external browser/environment or owner-generic failure
  recurs three times and no in-scope source/test alternative can prove the law.

Plate Plan state:
- status: complete-with-shared-tree-caveats
- phase: prove-and-handoff
- next: none in this owner boundary
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Completion threshold copies every requested TOC, DOCX, Markdown, AI, ElementId, and registry-policy requirement. |
| Active goal and plan verified | yes | Active goal names this exact plan and binary threshold. |
| Current owners read | yes | Core ElementId, TOC, DOCX, Markdown, AI, registry, docs, and identity doctrine audited from live source. |
| Best API target resolved | yes | `best-api review`: `NodeKey` owns live identity; `ElementIdPlugin` owns optional persisted identity; add `read.id(NodeKey)` and keep `withBlockId` only as serialized identity. |
| Mode and execution boundary resolved | yes | Standard one-shot execution explicitly authorized by the user. |

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
| Binary readiness | yes | Resolve every readiness condition | All accepted source contracts and focused proof complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final `rg` audits find no live persisted-ID dependency in TOC/DOCX/AI. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Key-to-ID conversion and explicit persistence policy are recorded in best-api and Vision. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Docs and release artifacts pass; browser blocker is exact and outside this owner. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | See Verification evidence and Error attempts. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff below. |
| P2 autoreview | blocked | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Helper refused an unrelated untracked generated schema over its 180 KB safety limit before review. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-separate-runtime-keys-and-persisted-element-ids.md` | Final checker passes after this evidence row is resolved. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live owners and doctrine read; explicit requirements captured. | Execute |
| Decide | complete | User accepted the identity split and public boundary. | Execute |
| Execute | complete | Core, TOC, DOCX, Markdown, AI, registry policy, docs, release artifacts, and doctrine adopted. | Prove and hand off |
| Prove and hand off | complete-with-caveats | 52/52 focused tests; TOC typecheck, docs, generators, lint, and audits pass. Shared-tree type/browser/review blockers recorded exactly. | Final handoff |

Decision brief:
- outcome: live features address nodes by runtime key; only real serialized or
  cross-session boundaries consume persisted element IDs.
- chosen shape: `editor.key(node)` / request refs internally,
  `editor.plugin(ElementIdPlugin).read.id(key)` at the persistence boundary,
  and explicit registry installation only where product policy requires it.
- strongest rejected alternative: silently installing `ElementIdPlugin`
  through TOC or substituting runtime keys in Markdown serialization.
- consequence: TOC/DOCX/AI no longer force persisted IDs; Markdown remains the
  deliberate durable-ID consumer and must prove round-trip behavior.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Live TOC | Persisted `id` and implicit `ElementIdPlugin` dependency | `NodeKey` | TOC | Live navigation is editor-session behavior | Adopt TOC state/UI/tests | Navigation/scroll tests and dependency audit | Keys must survive moves in-session | rearchitect |
| DOCX TOC | Static heading anchors reuse persisted IDs | Export-local bookmark map derived from runtime keys | DOCX export | Export anchors are local to one document export | Adopt exporter/static render path | DOCX output tests | Stable deterministic bookmark naming | rearchitect |
| Markdown IDs | `withBlockId` emits persisted wrappers | Keep persisted IDs and prove serialize/deserialize round trip | Markdown + ElementIdPlugin | Markdown crosses a serialized identity boundary | Tests/docs/codecs | Exact round-trip test | Nonstandard MDX must remain deliberate | keep |
| AI | Dormant persisted-ID modes coexist with request refs | Keys and request-local refs only; persisted IDs require a separate future protocol | AI + registry transport | Current requests do not survive editor lifetime | Remove stale modes/docs/tests | Prompt/request-ref tests and source audit | Do not weaken current refs | cut |
| Persisted boundary lookup | `read.id(element)` makes key consumers retrieve nodes | Overload `read.id(key)` | Core ElementIdPlugin | Boundary conversion belongs in the ID owner | Types/tests/docs/callers | Core unit/type proof | Missing keys must return `undefined` | rearchitect |
| Installation policy | Feature dependencies can install IDs transitively | Framework optional; registry explicit | Core + kits | Persistence policy belongs to the product | Remove TOC dependency; inspect kits | Dependency and generated-kit audit | Markdown calls must fail clearly without IDs when requested | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core boundary | Core | Add typed key-to-ID read overload and tests/docs | Accepted decision | Key conversion works without caller node lookup | Core focused tests/typecheck |
| 2. Live TOC | TOC + registry UI | Replace persisted heading IDs with `NodeKey`; remove dependency | Slice 1 | Live TOC works without ElementIdPlugin | TOC tests/typecheck/browser |
| 3. DOCX export | DOCX + static registry | Generate export-local bookmarks from keys | Slice 2 | TOC links/headings share deterministic export-local names | DOCX tests/typecheck/browser/export proof |
| 4. Markdown durable IDs | Markdown | Keep `withBlockId`; close round-trip ownership/tests/docs | Slice 1 | Serialized IDs restore through deserialize | Markdown tests/typecheck |
| 5. AI adoption | AI + registry transport | Remove dormant persisted-ID request modes; retain refs | Slice 1 | Current AI prompt flows use refs/keys only | AI tests/typecheck |
| 6. Policy/release/proof | Docs/registry/changesets | Make registry installs explicit; update current docs/release artifacts; run proof | Slices 1-5 | No stale paths; browser and review gates close | Audits, lint, changesets, browser, P2 autoreview |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| `ElementIdPlugin.read.id(NodeKey)` is typed and coherent | Core implementation/tests | Core focused test passes; deleted keys return `undefined`; broad Core typecheck blocked by unrelated compilePlateModel toggle errors | proven |
| TOC has no persisted-ID dependency | TOC source and kit audit | TOC tests and package typecheck pass; Browser blocked before mount by unrelated stale registry import | proven except browser |
| DOCX bookmarks are export-local | DOCX/static source audit | DOCX package-integration HTML test pairs href/bookmark without IDs | proven |
| Markdown IDs survive round trip | Markdown serializer/deserializer audit | Ordinary and flat-list round-trip tests pass | proven |
| AI current protocol uses refs/keys | AI and registry source audit | Focused prompt/action tests and zero stale-mode audit pass | proven |
| Optionality and explicit registry policy hold | Dependency/kit source audit | Generated editor definitions/check pass; ElementId is explicit in product definitions and absent from TOC | proven |

Conditional evidence:
- High-risk scenarios: moved TOC headings retain navigation identity; DOCX
  heading/bookmark references stay paired without persisted IDs; Markdown
  `withBlockId` rejects missing ID capability and restores exact IDs; AI refs
  never serialize raw keys.
- External research: N/A; the user accepted a source-grounded internal identity
  law and no external editor claim determines implementation.
- Issue/PR provenance: N/A; this is user-directed local architecture work.
- Docs/registry/browser/release/behavior-law owners: applies to current API docs,
  copied registry kits/UI, package changesets or registry changelog as dictated
  by `main` delta, browser demos, and durable Plate identity doctrine.

Findings:
- TOC currently imports `ElementIdPlugin` in its Base owner and exposes heading
  identity as `id`, coupling live navigation to persisted data.
- Static headings read persisted IDs for anchors, conflating runtime navigation
  with export identity.
- Markdown `withBlockId` is the one legitimate persisted-ID consumer and emits
  MDX wrappers; its complete round-trip contract needs focused proof.
- Current registry AI transport already maps compact request refs to `NodeKey`;
  old `*WithBlockId` modes are stale protocol surface.

Decisions and tradeoffs:
- Runtime keys are intentionally editor-local and must never enter Markdown,
  JSON, databases, prompts, or DOCX bookmark contracts.
- Export-local DOCX names do not need globally durable element identity.
- `ElementIdPlugin` remains optional because persistence is product policy, not
  an editor correctness invariant.

Review fixes:
- Kept the live-key existence check after a deletion regression test proved a
  reverse-index-only lookup could return a stale persisted ID.
- Inlined DOCX bookmark naming into each independently copied registry file;
  a new shared registry helper would have broken copied-item independence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Removed the `state.nodes.get(key)` check as a micro-optimization | 1 | Restore the explicit live-key guard | Deletion test failed with stale `"source"`; guard restored and 52/52 pass. |
| `pnpm turbo typecheck` | 1 | Run owners independently and classify exact upstream errors | TOC passes; Core is blocked by existing compilePlateModel toggle errors; Markdown/AI by existing List/Suggestion/Table property errors. |
| `/blocks/toc-demo` Browser proof | 1 | Inspect build overlay and preserve the obsolete-type hard cut | App fails before mount on existing generated `@/registry/components/editor/plate-types.ts` import. |
| P2 autoreview | 1 | Record helper safety refusal; do not stage/commit or mutate unrelated generated files | Refused unrelated untracked `editor.schema.json` larger than 180 KB. |

Verification evidence:
- `bun test ...`: 53 pass, 0 fail across Core ElementId, TOC Base/React,
  Markdown, AI Markdown/placeholders/actions, and DOCX integration.
- `pnpm --filter @platejs/toc typecheck`: pass.
- `pnpm --filter www editor:generate && pnpm --filter www editor:check`: pass.
- `pnpm --filter www check:docs`: pass, including API reference, MDX source,
  and docs parity.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: 57/57
  registry changelog events agree with source.
- Focused Biome check: 21 changed source/test files clean. The required broad
  `pnpm lint:fix` formatted task files but exits on unrelated existing unused
  declarations in `block-selection.tsx` and `table-node.tsx`.
- `git diff --check`: pass.
- Source audits: no `WithBlockId`/`withBlockId`/`blockId` in AI; no
  `ElementIdPlugin`, `item.id`, or `activeContentId` in live TOC/DOCX owners.

Final handoff prepared:
- Ownership and target API: runtime `NodeKey`; optional persistence conversion
  through `ElementIdPlugin.read.id(key)`.
- Public breaks and adoption: TOC `Heading.id/path` becomes `Heading.key`; AI
  persisted-ID Markdown modes are cut; registry products install ElementId
  explicitly.
- Runtime/package/docs/browser decisions: Markdown alone keeps durable block
  IDs; DOCX creates export-local bookmarks; all current docs/release owners
  match.
- Proof and execution risks: focused behavior is green. Shared-tree broad
  typecheck, browser, and autoreview blockers are unrelated and listed above.
- Execution order and user attention: no further identity work remains; repair
  shared List/Suggestion/Table types and stale registry generated import in
  their owners before demanding whole-tree green/browser proof.

Timeline:
- 2026-08-13T13:53:36.690Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ground |
| Where am I going? | Execute six vertical slices, prove, prepare handoff |
| What is the goal? | Separate live keys from optional persisted IDs without regressing Markdown durable identity. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Broad typecheck remains blocked by existing Core/List/Suggestion/Table and
  registry UI errors outside this task.
- The TOC demo cannot mount until the registry index stops importing the
  deliberately removed `plate-types.ts`.
- Structured P2 review could not form a safe full local bundle because another
  untracked generated schema exceeds the review helper limit.
