# Promote Plate block content read

Objective:
Ship `editor.read.schema.isBlockContent(element)` and schema-driven Node
Selection. Completion requires package/UI tests, current-state docs, Browser
proof, release artifacts, Best API doctrine sync, and the Autogoal checker.

Flow mode:
one-shot execution

Goal plan:
`docs/plans/2026-08-26-promote-plate-block-content-read.md`

Mode:
standard

Completion threshold:
The Plate read is public and typed, Node Selection has no plugin-name
blacklist, structural nodes follow `blockContent`, Table owns its selection
geometry, all applicable tests and docs gates pass, and the final local proof
boundary is explicit.

Verification surface:
- Core runtime and type contracts for the Plate schema facade.
- Table schema and copied Editor component tests.
- `www` source, docs, registry, package-integration, and TypeScript checks.
- Browser replay on `/blocks/table-demo`, including focus, native selection,
  overlay ownership, stability, screenshot, and console state.
- Changeset, registry changelog, doctrine source/mirror parity, worker audit,
  Agent-Native review, and the Autogoal checker.

Constraints:
- The accepted target is `editor.read.schema.isBlockContent(element)` composed
  with `editor.read.nodes.isSelectable(element)`.
- Do not add a Plite API, public group constant, Node Selection plugin, schema
  presentation field, compatibility alias, or structural `selectable: false`.
- Keep Table selectable and keep its custom geometry in copied UI.
- Edit `.agents/rules/**`, then sync generated mirrors with `pnpm install`.
- Do not commit, push, or create a PR.

Boundaries:
- `@platejs/core` owns compiled Plate block-content meaning and its public read.
- Copied Editor UI owns marquee candidate policy and generic overlays.
- Copied Table UI owns Table-specific selection geometry.
- Plite keeps its existing selection model and dynamic `isSelectable` veto.
- Docs teach current state; changeset and registry changelog own release notes.
- Existing unrelated checkout edits remain outside the implementation claim.

Blocked condition:
Stop only if Core cannot project the compiled Plate fact without a Plite
change, or if no runnable Browser route can exercise the copied UI. Neither
condition occurred.

Plate Plan state:
- status: complete
- phase: complete
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Public read, default Editor UI, structural plugin audit, Table geometry, docs, tests, and no unnecessary E2E were copied into this plan. |
| Active goal and plan verified | yes | Autogoal created this exact objective and named this plan. |
| Current owners read | yes | Core compiler/facade/types, copied Editor/Table UI, Node Selection/Block Menu docs, Vision, and relevant rules were read. |
| Best API target resolved | yes | `best-api` selected one semantic Plate read and rejected private carrier exposure, plugin-name lists, and a Plite API. |
| Mode and execution boundary resolved | yes | Standard one-shot local implementation; no Git publication authority. |
| Package/API and browser packs selected | yes | Core package API plus Browser proof on the standalone table demo. |
| Release artifact path selected | yes | Existing Core patch changeset plus one registry behavior changelog. |
| Barrel/export impact decided | yes | No file/export topology changed, so `pnpm brl` does not apply. |
| Observable browser case captured | yes | `/blocks/table-demo`; drag from blank right gutter across the table; expect model selection, Table-owned paint, editor focus, empty native selection, and clean console. |
| Docs lane and source owner resolved | yes | Current-state plugin guide and Node Selection pages, including `.cn.mdx` twins; runtime source is Core plus copied Editor/Table UI. |
| Agent source/mirror boundary resolved | yes | `.agents/rules/best-api*` are source; `.agents/skills/best-api*` are generated mirrors. |
| Agent-native reviewer loaded | yes | Review applied to API discoverability, source ownership, mirror sync, and rerunnable proof. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision has owner, adoption, proof, risk, and verdict.
- [x] Public shape and private presentation contract have complete adoption answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Package API, browser, docs, release, doctrine, and handoff gates are resolved.
- [x] Core package impact is recorded with a patch changeset.
- [x] Registry behavior impact is recorded with a generated changelog event.
- [x] No compatibility alias, migration shim, or Plite API was added.
- [x] Core and Table package tests/typechecks pass.
- [x] No barrel generation applies because no exported file topology changed.
- [x] Browser route, interaction, end state, console, screenshot, and 5/5 stability are recorded.
- [x] The focus and Shift-anchor failures have component RED/GREEN proof.
- [x] Docs use current-state reference voice and real APIs/components.
- [x] English and Chinese docs pass MDX/source parity and final Unslop audit.
- [x] Best API source rules were edited and generated mirrors were synced.
- [x] Relevant worker rules were audited for stale teaching.
- [x] Agent-Native review found a complete action route with no P0/P1 gap.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | API, UI, docs, release, doctrine, tests, and Browser proof are complete. |
| Fresh source evidence | yes | Recheck decision-changing claims | Final owner and consumer searches were run after the last source edit. |
| Best API review | yes | Resolve P0/P1 call-shape findings | PASS: named Core read; private group, plugin lists, Plite API, and presentation policy rejected. |
| Conditional risk and adoption | yes | Close structural/Table/adoption risks | Custom structural, `selectable: false`, unknown type, Table, nested candidates, and Shift anchor are covered. |
| Verification recorded | yes | Record exact commands and outcomes | See Verification evidence and fingerprint ledger below. |
| Handoff prepared | yes | State ownership, proof, and boundary | Prepared below; local candidate only. |
| P1 autoreview | no | Respect branch policy | Current branch is `next`; repository policy forbids `autoreview` there. Targeted lint, source review, Best API review, and Agent-Native review passed. |
| Goal plan complete | yes | Run Autogoal checker | Final checker follows this sealed ledger. |
| Public API / package boundary proof | yes | Audit types, facade, compiler, and call site | Core runtime/type tests and Core/Table typechecks pass. |
| Published package changeset | yes | Record Core patch behavior | `.changeset/plate-schema-contract.md` adds the public read under `@platejs/core: patch`. |
| Registry changelog | yes | Generate and validate event | `2026-08-26-schema-driven-block-selection` generated and checked across 83 events. |
| Package typecheck/build/test | yes | Run owning checks | Core 57/57, Table 31/31, Core/Table Turbo typecheck 15/15. |
| Barrel/export generation | no | Explain omission | No public file, barrel, or export layout changed; the editor type is extended in its existing owner. |
| Browser interaction proof | yes | Exercise copied UI | Fresh Browser tab on `/blocks/table-demo`; final five drags all passed. |
| Browser console/network check | yes | Inspect runtime logs | Final Browser tab reported zero warning/error entries; no request failure affected the route. |
| Browser final proof artifact | yes | Capture visible state | Final Browser screenshot shows the selected Table and its floating controls after the drag. |
| Exact case replay | no | Classify provenance | User-directed architecture work, not a reporter-backed production case; component REDs and the named local Browser case are the executable oracle. |
| Final ref and fingerprints | yes | Record local ref and hashes | Local `next` candidate at base HEAD `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; hashes below. |
| Clean final runtime | no | State publication boundary | This is an unpushed dirty-checkout candidate using the existing local dev server, so it cannot support shipped/fixed-at-ref wording. |
| Retry-free stability | yes | Run five warm interactions | 5/5: 17 Table-owned masks, zero generic masks, one owner marker, no marquee residue, editor focused, empty native selection, clean logs. |
| Docs source-backed claim audit | yes | Check APIs and component behavior | Docs match Core types, copied Editor predicate, Table marker, and `useElementSelected`. |
| Required Unslop pass | yes | Audit all four edited docs | Node Selection EN/CN: zero; Plugin CN: zero; Plugin EN only reports seven older title-case headings outside this edit. |
| Requirements disclosure | yes | Separate package, copied UI, and private detail | Docs distinguish Core schema meaning, node selectability, copied UI, and Table presentation. |
| Docs links / routes / previews | yes | Verify real leaf/component targets | Node Selection points at `/docs/node-selection` and `<ComponentSource name="editor" />`; `www` source checks pass. |
| Docs MDX/content parser | yes | Run source build | Included in final `pnpm --filter www typecheck`; docs source parity passed. |
| Plugin page specifics | yes | Apply current kit/manual/API teaching | The page says Editor owns visual UI and no Node Selection plugin/store is required. |
| Agent source / generated sync | yes | Sync rules and verify mirrors | `pnpm install` succeeded; source/mirror `cmp` and phrase searches pass. |
| Agent action discoverability | yes | Audit route an agent reads | Best API main rule and schema rule expose the named read and forbid rebuilding private identity. |
| Agent-native review | yes | Map action to route/owner/proof | PASS with no finding; capability map below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, call sites, docs, rules, and structural schemas read | Decision locked |
| Decide | completed | Best API hard-cut chose one Core read and private copied-UI marker | Implementation proved |
| Prove and hand off | completed | Tests, typechecks, docs, registry, Browser 5/5, and parity checks pass | User review |

Decision brief:
- Add `editor.read.schema.isBlockContent(element)` to the existing Plate schema
  facade. It projects the private compiled group without publishing it.
- Node Selection candidates are block content that also pass the independent
  dynamic `nodes.isSelectable` veto.
- Canonicalize prospective paths with `SelectionApi.nodes` before choosing
  anchor/focus, preserving the existing selection invariant owner.
- Table remains a selectable normal-flow block. Its copied component privately
  marks itself as the custom selection-geometry owner.
- Keep Node Selection and Block Menu docs separate: Node Selection owns editor
  model/UI behavior; Block Menu owns context-menu targeting. Cut plugin-install
  fiction from Node Selection rather than merging unrelated jobs.

Decision ledger:
| Surface | Target | Owner | Adoption | Proof | Verdict |
| --- | --- | --- | --- | --- | --- |
| Plate block-content read | Named semantic read | `@platejs/core` | Facade, type surface, docs | Runtime/type tests | rearchitect |
| Marquee candidate policy | `isBlockContent && isSelectable` | copied Editor | Predicate and tests | Component + Browser | rearchitect |
| Candidate path law | Canonical paths before endpoints | `SelectionApi.nodes` | Marquee helper | Focus and Shift RED/GREEN | reuse |
| Table paint | Table-owned private geometry | copied Table | DOM owner marker | Component + Browser | keep |
| Plite selectability | Independent dynamic veto | Plite | No change | Existing plus consumer tests | keep |

Consumer audit:
- Adopted: copied Node Selection is the one caller whose job is normal-flow
  block eligibility.
- Kept separate: `tabbable.tsx` owns keyboard traversal; `dnd.tsx` owns drag
  geometry; Find Replace scans text-bearing block structure; Footnote fragment
  logic validates structural blocks; Table navigation owns cell-local movement;
  Block Menu owns context-menu targeting.
- No other exact plugin-name blacklist reconstructs normal-flow membership.

Proof matrix:
| Claim | Execution proof | Status |
| --- | --- | --- |
| Non-inline defaults and structural opt-out are truthful | Core runtime contract covers flow, `selectable: false`, `blockContent: false`, inline, and unknown nodes | pass |
| Table is block content; rows/cells are not | Table package contract | pass |
| Public call is typed | Core type-contract compile | pass |
| Generic UI follows schema and selectability | Copied Editor component tests | pass |
| Nested candidates keep valid focus and Shift anchor | Two genuine component RED failures followed by GREEN | pass |
| Table uses only its custom geometry | Browser 5/5 plus component-owned-overlay test | pass |
| No Plite API is needed | Source audit; existing `SelectionApi.nodes` and `nodes.isSelectable` reused unchanged | pass |

Agent-Native Review:

Verdict:
PASS

Capability Map:
| User action | Agent route | Source owner | Mirror/doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Author/read normal-flow Plate blocks | `best-api` plus package/docs owners | Core compiler and editor facade | Best API mirror plus plugin guide | Core runtime/typecheck | pass |
| Maintain copied Node Selection behavior | `plate-ui` and Browser | copied Editor/Table files | Node Selection docs and registry payload | component tests and Browser 5/5 | pass |
| Review future private semantic carriers | `best-api` | `.agents/rules/best-api*` | `.agents/skills/best-api*` | `pnpm install`, `cmp`, phrase audit | pass |

Findings:
- No P0/P1 agent route, source-owner, mirror, proof, or discoverability gap.

Accepted / Rejected:
- Accepted: expose compiled Plate meaning through the existing schema facade.
- Rejected: public group identity, plugin-name reconstruction, a new Plite API,
  a Node Selection plugin, and a schema field for overlay presentation.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
| --- | ---: | --- | --- |
| Runtime RED: schema read method absent | 1 | Add facade projection after capturing failure | Core runtime test GREEN |
| Type RED: `isBlockContent` absent | 1 | Extend existing Plate schema read type | Core typecheck GREEN |
| Browser/component RED: descendant chosen as focus after ancestor canonicalization | 1 | Reuse `SelectionApi.nodes` before endpoint choice | Component GREEN; Browser clean |
| Component RED: Shift base anchor removed by ancestor canonicalization | 1 | Retain base anchor only when it remains in canonical nodes | Component GREEN |
| Unslop command used wrong CN directory | 1 | Use `.cn.mdx` sibling paths | Four final audits completed |

Verification evidence:
- `bun test ./packages/core/src/lib/editor/withPlite.slow.ts` -> 57 pass.
- `bun test ./packages/table/src/lib/BaseTablePlugin.spec.ts` -> 31 pass.
- `bun test ./apps/www/src/registry/components/editor/node-selection.spec.tsx` -> 8 pass.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/table` -> 15/15 tasks.
- `pnpm --filter www typecheck` -> editor generation, API reference, MDX source,
  docs parity, registry source, route types, app TypeScript, and package
  integration all pass.
- Targeted `pnpm exec ultracite check` -> nine files pass; only environment
  module-type warnings.
- `pnpm --filter www build:registry` -> 380 canonical payloads and 15 sparse
  overlays generated.
- Registry changelog generator `--write` and `--check` -> 83/83 events.
- Final Unslop audits -> zero new finding; seven older English guide heading
  style findings are outside this edit.
- Best API source/mirror `cmp` and discoverability searches -> pass.
- Browser `/blocks/table-demo` -> 5/5 final runs with one owner marker,
  17/17 owner-contained Table masks, zero generic mask, zero marquee residue,
  editor focus, empty native selection, clean logs, and final screenshot.

Fingerprint ledger:
- Local base HEAD: `168a4490e2ccf90dd9b1bd3230fb2f528460caa2` on `next`.
- Core compiler: `3dd7727710708f0ccf6df7dafe03c56bcf665ead1c4ade2ebc89a7948e8e2e97`.
- Core facade: `1c6067ce6b79256143dea1f07e35b1ff4a9adb3d34f08b05b6f50947933b05c7`.
- Core public types: `2e53e538dfff64c8c9115ca5080b23d4b5fbe58005e8772bdd782649b21e747a`.
- Copied Node Selection: `8d8a6420e021115982ab5e011ff9ddf38a130c13c88534eb613515bfac65e00d`.
- Copied Table: `5fafa8caf66566830757734701d21099dc98781232e95082516763fc522eebc7`.
- Core runtime test: `37d4a56a2952f8ec014bf16c0ee217ee9a71996439193877a11340b6d1c582f0`.
- Core type contract: `b8833fba21f5f6a3fa9cf66673a0ad997379fe2ae5a2745338b028d8bcfd62af`.
- Node Selection component test: `2384301c8d87ea9e5b1747d33456481e5a1f23f73baf979a4c8a7eba4992265c`.
- Table contract test: `af2306ed59c0fc88351bd24c8f13af88e9807fe62fc12b22b59a605126b8745e`.
- Browser fixture demo: `5abb34010d45af9e1a925d466617af3799bdba6542667efb75bdd09f48e81b9a`.
- Browser fixture value: `6b1f6c40c25b0c9a62214942a3b6323b031793155ef15daf10b072d456df47cf`.

Review fixes:
- Browser observation promoted descendant-path canonicalization into a durable
  component test and implementation fix.
- Symmetric Shift-anchor validation was added before closeout.
- Changelog wording states Table-owned geometry instead of a false one-overlay
  count.
- Docs say “editor reads,” not “schema reads,” for the composed predicate.

Final handoff prepared:
- Ownership: Core meaning/read; copied Editor policy; copied Table paint.
- Public delta: one Core schema read with a patch changeset.
- Registry delta: schema-driven selection plus Table-owned presentation, with a
  generated behavior changelog.
- Proof: package/UI tests, Core/Table/www typechecks, lint, docs/registry
  generation, doctrine parity, Agent-Native PASS, and Browser 5/5.
- Boundary: local unpushed candidate on a dirty `next` checkout; no shipped or
  immutable-ref claim.

Timeline:
- 2026-08-26: owners and accepted API grounded; implementation completed;
  Browser exposed focus canonicalization; focus and Shift anchor fixed; all
  final gates closed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete local implementation and proof |
| Where am I going? | User review or explicit Git publication request |
| What is the goal? | Schema-driven default Node Selection through a public Plate read |
| What have I learned? | Compiled membership was already the right source; endpoint canonicalization had to stay under `SelectionApi.nodes`. |
| What have I done? | Implemented, documented, released, doctrine-synced, tested, and Browser-verified the accepted target. |

Open risks:
- No known local behavior blocker. Publication proof remains outside scope
  because the candidate is unpushed and the Browser used an existing local dev
  server rather than an immutable clean checkout.
