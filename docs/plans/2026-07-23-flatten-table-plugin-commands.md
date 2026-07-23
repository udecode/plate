# flatten table plugin commands

Objective:
Flatten Table plugin commands and codify scoped API naming; done when
callers/docs/types/skill sync and focused package/browser proofs pass; plan
docs/plans/2026-07-23-flatten-table-plugin-commands.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-flatten-table-plugin-commands.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- agent-native
- browser
- package-api

Mode:
- `standard`, accepted-plan execution. The user explicitly accepted the
  source-backed recommendation and said `go`.

Completion threshold:
- `TablePlugin` exposes `api.create()` and the flat updates `insert`,
  `insertColumn`, `insertRow`, `remove`, `removeColumn`, and `removeRow`.
- Zero active source/docs/changeset matches remain for scoped
  `api.createTable`, `update.insert.table*`, or `update.remove.table*`.
- Table package tests, typecheck, build, docs checks, generated skill sync,
  Browser `/blocks/table-demo`, autoreview, and `check-complete` pass or an
  unrelated owner failure is recorded precisely.

Verification surface:
- `bun test packages/table/src --bail 1`.
- `pnpm turbo typecheck --filter=./packages/table`.
- `pnpm --filter @platejs/table build`.
- `pnpm --filter www check:docs` and `pnpm --filter www build:source`.
- `pnpm install`, then source/mirror audit for the new `plate-next` rule.
- Focused `rg` audits for every rejected API spelling.
- Browser `/blocks/table-demo`: editor and table render; Table toolbar mutation
  path remains usable; console errors classified.

Constraints:
- The latest user instruction explicitly authorizes implementation.
- No public compatibility aliases or runtime shims.
- Preserve Table behavior and the current shared integration WIP.
- Do not edit frozen Core owners
  `mergePlugins.ts`, `resolvePlugins.ts`, or `resolvePlugins.spec.tsx`.
- Preserve the frozen `table-node.tsx` integration fix while mechanically
  adopting the accepted Table API names.
- Edit `.agents/rules/plate-next.mdc`, never the generated skill directly; run
  `pnpm install` to regenerate it.
- Keep one plan; no extra machine-readable artifact is warranted.

Boundaries:
- In scope: `packages/table`, active Table callers in `apps/www`, EN/CN Table
  docs, the existing Table changeset, `.agents/rules/plate-next.mdc`, its
  generated skill mirror, and this plan.
- Source owners: `BaseTablePlugin.ts` owns the API/tx contract; active callers
  and docs adopt it; the Plate Next rule owns reusable naming doctrine.
- Non-goals: no Table behavior change, no unrelated plugin migration, no
  generated registry JSON edits, no compatibility alias, no new helper files.
- Direct Plite boundary owners: N/A; existing plugin tx-group publication can
  express the accepted shape without a Plite/Core change.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if current plugin typing cannot express one owner group with flat
  scoped methods without a Core change, or if the demo cannot be exercised
  after package-owned proof and browser/runtime recovery are exhausted.

Plate Plan state:
- status: done
- phase: prove and hand off
- next: final response carries immutable receipt
- handoff: ready

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Flat scoped updates, `api.create`, Plate Next doctrine, and implementation/proof copied above |
| Active goal and plan verified | yes | Goal objective names this plan and the binary threshold |
| Current owners read | yes | `BaseTablePlugin.ts`, type contract, active callers, EN/CN docs, changeset, VISION, Plate/Common vision, and `origin/main` API evidence read |
| Mode and execution boundary resolved | yes | Standard accepted-plan execution; user said `go` |
| Docs pack selected | yes | Supporting plugin/API docs adoption |
| `docs-creator` loaded | yes | Full skill read before edits |
| Docs lane selected | yes | Plugin / feature API reference |
| Target docs and nearest sibling docs read | yes | EN/CN Table API sections read; sibling shape N/A because headings/signatures change without page topology or prose-shape redesign |
| Docs style doctrine read | yes | `docs-creator` current-state/reference rules read |
| Documented source owner identified | yes | `packages/table/src/lib/BaseTablePlugin.ts` |
| Agent-native pack selected | yes | Plate Next workflow rule and generated mirror change |
| Agent-facing action surface identified | yes | Future Plate Next reviews of scoped plugin API naming |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/plate-next.mdc`; regenerate `.agents/skills/plate-next/SKILL.md` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full skill read before edits |
| Browser pack selected | yes | Package and active www callers change |
| Browser route / app surface identified | yes | `/blocks/table-demo` |
| Browser tool decision recorded | yes | In-app Browser for ordinary local app proof |
| Console/network caveat policy recorded | yes | Fail new accessor/editor/runtime errors; classify the known random table-cell ID hydration mismatch separately |
| Package/API pack selected | yes | Breaking `@platejs/table` public API naming cut |
| Public surface or package boundary identified | yes | Scoped `TablePlugin.api` and `.update` |
| Release artifact path selected | yes | Update existing `.changeset/table-block-insert.md`; one published package |
| `changeset` skill loaded when `.changeset` is required | yes | Full skill read; release prose remains relative to `origin/main` |
| Barrel/export impact decision recorded | yes | The wider Table consolidation removes exported helper files, so `pnpm brl` is required even though this final naming cut changes only the inferred plugin surface |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Owner contract, complete adoption, docs/rule sync, package proof, and live interaction pass |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final repo-wide rejected-spelling audit is empty; current owner/type contract expose the accepted shape |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Package callers/tests, www consumers, EN/CN docs, changeset, skill source/mirrors, and Browser path are closed |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and outcomes are recorded below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Frozen receipt is prepared below; the receiving task was archived and its rollout file unavailable, so the final response carries the receipt |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <Table scope> --stream-engine-output`: clean, no accepted/actionable findings, confidence 0.82 |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-flatten-table-plugin-commands.md` | `[autogoal] complete` |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | EN/CN headings/signatures match `TableApi` and `TablePluginContract`; zero rejected spelling matches |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | No links or previews changed; current API headings parse and the leaf demo route renders |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www build:source` passed |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing Table manual/API page topology retained; only source-backed current API headings/signatures changed |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; source plus Codex/Claude skill mirrors contain the rule |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Exact rule sentence appears in `.agents/rules/plate-next.mdc` and both generated `plate-next` skills |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Source -> generated mirrors -> `pnpm install`/`rg` proof parity map passes; no hidden trigger or generated-only edit |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/table-demo`: Table heading, one editable root, one table; `Insert row after` changed 4 rows to 5 |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Route returned 200; console has only the pre-existing random `data-table-cell-id` hydration mismatch, with no accessor/editor/command error; no network-backed command applies |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Browser DOM/interaction proof recorded above; screenshot N/A because the exact row-count mutation was directly inspectable |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Type contract proves flat scoped portal plus namespaced root; `pnpm brl` validates the consolidated export layout |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published breaking `@platejs/table` API/types delta |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `.changeset/table-block-insert.md` is one-package `major` and shows the final scoped API |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry edits are consumers of a published package API cut, not a registry-only feature |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: the published package changeset above applies |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Table typecheck/build and 233-test suite pass; root type contracts and www source/docs/typecheck pass |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl`: 56/56 tasks passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | done | Live owner, callers, docs, release baseline, vision, and skill boundaries read | Decide |
| Decide | done | User accepted the flat scoped API recommendation | Execute |
| Execute | done | Owner, callers, tests, docs, changeset, and Plate Next source rule use the accepted shape | Prove and hand off |
| Prove and hand off | done | Package/docs/type/browser/barrel/agent-native/autoreview gates pass | Deliver immutable receipt |

Decision brief:
- outcome: one coherent scoped Table API with no legacy command taxonomy.
- chosen shape: primary-owner verbs are bare (`create`, `insert`, `remove`);
  secondary targets suffix the verb (`insertColumn`, `removeRow`).
- strongest rejected alternative: `update.insertTable`; flatter than current
  API but still repeats the already-scoped owner noun.
- consequence: breaking rename across package types/tests, active callers,
  EN/CN docs, release prose, and reusable Plate Next doctrine.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Table factory | `table.api.createTable()` | `table.api.create()` | `BaseTablePlugin.ts` | Plugin already supplies the owner noun | types/docs/changeset | typecheck + zero-old-name audit | destructured method is shorter but less globally named | rename |
| Insert/remove commands | `table.update.insert.table*` and `remove.table*` | `insert`, `insertColumn`, `insertRow`, `remove`, `removeColumn`, `removeRow` | Table owner tx group | One scoped owner namespace; no extra taxonomy hop or repeated `table` | package tests/types, www callers, EN/CN docs, changeset | table tests/typecheck/build + Browser | missed caller would fail typecheck/runtime | rearchitect |
| Plate Next doctrine | no explicit scoped-command naming rule | owner group flattens at portal; bare primary verbs and suffixed secondary targets | `.agents/rules/plate-next.mdc` | Prevents future plugin-scoped APIs from retaining global namespace residue | regenerate SKILL via `pnpm install` | source/mirror `rg` + agent-native review | over-generalization to genuine sub-capabilities | keep scoped exception in rule |
| Compatibility | old and new names could coexist | hard cut; no aliases | Table package | v2 API decision is explicit | changeset migration | zero-old-name audit | breaking callers | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Owner contract | `BaseTablePlugin.ts` | Merge insert/remove methods into the Table owner tx group; rename factory | accepted decision | inferred plugin contract exposes exact flat surface | focused typecheck/tests |
| 2. Adoption | package tests/types, www callers, EN/CN docs, changeset | Replace every active old spelling | owner contract lands | zero active old spellings | `rg`, docs checks, www typecheck as needed |
| 3. Doctrine sync | Plate Next source rule and generated skill | Add scoped command naming law and regenerate | wording is owner-generic, with genuine sub-capability exception | source and mirror match | `pnpm install`, source audit, agent-native review |
| 4. Closure | package/browser/review/plan | Run focused proof and fix accepted findings | slices 1-3 complete | all threshold rows pass | package checks, Browser, autoreview, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Flat portal typing | Current contract used three tx groups; Core already flattens the group matching the plugin owner | Table typecheck and root type contract compile exact flat scoped plus namespaced root calls | pass |
| Runtime parity | Existing methods remain in the same plugin owner and retain bodies | 233-test Table suite passes; live demo insert changes 4 rows to 5 | pass |
| Complete adoption | `rg` identified package, www, docs, and changeset callers | Repo-wide active-source audit reports zero rejected spellings | pass |
| Durable doctrine | Rule source/generation boundary is explicit | `pnpm install` plus source/Codex/Claude mirror audit | pass |

Conditional evidence:
- High-risk scenarios: stale callers fail compilation; duplicate old/new methods
  create ambiguity; moving command bodies changes transaction behavior. Hard
  cut all callers, keep bodies intact, and run type/runtime/browser proof.
- External research: N/A; local source and accepted user decision settle the API.
- Issue/PR provenance: N/A; user-directed local Plate v2 API work.
- Docs/registry/browser/release/behavior-law owners: EN/CN Table docs, active
  registry callers, `/blocks/table-demo`, existing Table changeset, and Plate
  Next source rule all apply.

Findings:
- The contract currently splits commands across `insert`, `remove`, and
  `table` tx groups. Only the group matching the plugin key flattens in the
  scoped portal, causing the inconsistent `update.insert.table()` versus
  `update.merge()` shape.
- Link already demonstrates the desired scoped primary verb:
  `editor.plugin(BaseLinkPlugin).update.insert()`.
- `origin/main` carries the nested names, so the final major changeset must
  teach the complete migration from main rather than describe branch-local
  intermediate names.
- Active rejected spellings span 21 package/app/docs/changeset files before the
  cut; generated registry JSON is excluded by repo policy.

Decisions and tradeoffs:
- Use the plugin-key tx group as the sole Table command owner so root aggregation
  remains `editor.update.table.*` while the scoped portal becomes flat.
- Bare verbs act on the primary plugin-owned table; column/row suffixes identify
  secondary targets.
- Do not keep `insertTable`/`removeTable`: they repeat the plugin owner and make
  destructuring/searchability win over the normal scoped call site.
- Do not add aliases; TypeScript errors are the adoption oracle.

Review fixes:
- None. Scoped autoreview returned `patch is correct` with no
  accepted/actionable findings (confidence `0.82`).

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial focused Table typecheck found root callers accidentally flattened to `editor.update.insert/remove*` during mechanical adoption | 1 | Restore owner namespace only at root editor call sites while keeping scoped plugin portals flat | Corrected to `editor.update.table.*`; one missed `source.update.removeColumn()` was corrected to `source.update.table.removeColumn()`; rerun passes |

Verification evidence:
- Source read: current Table contract, implementation groups, active callers,
  EN/CN reference sections, existing changeset, and `origin/main` nested API.
- `pnpm --filter @platejs/table typecheck`: pass.
- `bun test packages/table/src --bail 1`: 233 pass, 0 fail, 52 files.
- `pnpm --filter @platejs/table build`: pass.
- `pnpm test:types`: pass.
- `pnpm --filter @platejs/table lint:fix`: pass, no fixes.
- `pnpm exec biome check --write` on the changed active app/type-contract
  files: pass, no fixes.
- `pnpm --filter www build:source`: pass.
- `pnpm --filter www check:docs`: pass.
- `pnpm --filter www typecheck`: docs parity, registry source check, and both
  TypeScript configs pass.
- `pnpm install`: pass; generated Plate Next skills synced.
- `pnpm brl`: 56/56 package barrel tasks pass.
- Rejected API spelling audit: zero active matches repo-wide outside
  CI-generated registry/template output and this plan.
- Browser `/blocks/table-demo`: route 200; one editor/table; inserting a row
  through the Table toolbar changes 4 rows to 5; no new runtime errors.
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <Table
  scope> --stream-engine-output`: clean, no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-23-flatten-table-plugin-commands.md`: `[autogoal]
  complete`.

Final handoff prepared:
- Ownership and target API: `BaseTablePlugin.ts`; scoped `api.create()` and flat
  `update.insert*`/`remove*`, with root `editor.update.table.*`.
- Public breaks and adoption: hard cut complete across package tests/types,
  active www callers, EN/CN docs, and the major changeset; no aliases.
- Applicable runtime/package/docs/browser decisions: behavior bodies retained;
  docs are current-state; live Table toolbar mutation passes; Plate Next source
  rule and generated mirrors agree.
- Proof and execution risks: all focused gates pass; the known random table
  cell ID hydration mismatch is unchanged and outside this API packet.
- Execution order and user attention: the intended coordination task is no
  longer sendable; carry the immutable receipt in the final response.

Timeline:
- 2026-07-23T08:29:44.243Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove and hand off |
| Where am I going? | Finish checker and freeze |
| What is the goal? | Flat Table scoped API plus durable Plate Next naming law |
| What have I learned? | Extra tx groups are legacy global taxonomy inside a scoped owner |
| What have I done? | Implemented/adopted the hard cut and passed package/docs/type/browser/barrel/agent-native proof |

Open risks:
- `apps/www/src/registry/ui/table-node.tsx` contains a frozen integration fix;
  only its rejected Table API spellings may change, with the editor binding
  preserved.
- Existing random table-cell ID hydration mismatch is foreign noise unless its
  behavior changes during this packet.
- The intended coordination task was archived and its rollout file was absent;
  both direct send attempts failed without changing source. The final response
  is the authoritative frozen receipt.
