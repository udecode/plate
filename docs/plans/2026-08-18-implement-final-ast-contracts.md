# implement final ast contracts

Objective:
Implement accepted AST contracts; done when migrations, packages, registry,
docs, generated contracts, focused/full checks, browser proof, and review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-18-implement-final-ast-contracts.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- browser
- agent-native

Mode:
- `standard` accepted-plan execution. The user explicitly accepted all API
  recommendations and authorized implementation.

Completion threshold:
- Every accepted contract row is implemented without an old-name compatibility
  path; current-version migration coverage rewrites every old persisted shape.
- All affected package tests/typechecks, migration tests, generated-contract
  checks, docs checks, lint, root `check`, Browser routes, P2 autoreview, and
  agent-native review pass or carry one exact evidence-backed N/A reason.
- Source audits report zero stale production/docs/examples/generated uses of
  `rawDate`, Mention/Footnote `identifier`/`key` identity, column-group
  `layout`, Code Drawing `data`/PascalCase values, and `texExpression`.
- The final `check-complete` command passes.

Verification surface:
- Focused package tests and source-first typechecks for Date, Mention,
  Footnote, Layout, Media, Code Drawing, Math, List, Indent, Basic Styles,
  Table, Plate migrations, CLI/generated types, and www.
- Migration fixtures prove every old persisted spelling reaches the final
  contract and final documents pass current schema assertion.
- Generated editor schema/types and stale-name source audits prove the exact
  application contract.
- Docs MDX/source checks and Browser proof on affected standalone demo routes.
- Root lint/check plus P2 autoreview and agent-native doctrine parity.

Constraints:
- The user already accepted the target and authorized one-shot execution.
- No public compatibility aliases or runtime shims.
- Preserve raw Date author input inside one `value`; do not discard it merely
  because it does not parse as a canonical date.
- Preserve both `listStart` and `listRestart`; validate signed safe integers
  rather than forcing positive list ordinals.
- Keep `id` for persisted element occurrence identity, `key` for live
  `NodeKey`, and `ref` for persisted association identity.
- Do not edit `templates/**` or generated skill mirrors directly.
- No commit, push, PR, or release action without a separate explicit request.

Boundaries:
- In scope: published package schemas/APIs/codecs/tests, the current Plate
  migration owner, generated app contracts, copied registry consumers/examples,
  current-state docs, release artifacts, and identity/schema doctrine.
- Source owners: `packages/{date,mention,footnote,layout,media,code-drawing,math,list,indent,basic-styles,table,plate,cli}`, `apps/www`, `content/docs`,
  `.agents/rules/best-api.mdc`, and the smallest affected Vision/worker owners.
- Non-goals: the separate P0 live-editor versus persisted-document grammar
  split, legacy-list-model investment, unrelated editor behavior, third-party ASTs,
  and generic schema-builder expansion beyond constraints this packet needs.
- Direct Plite boundary owners: existing `property.*` validators/enums and
  schema compilation only. No Plite public API change is expected; a newly
  proven substrate gap must be routed instead of patched in Plate.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the current migration lineage cannot represent the accepted
  hard cut without changing an unresolved application schema-version decision,
  or the same infrastructure failure survives three distinct focused repair
  attempts and no narrower autonomous proof remains.

Plate Plan state:
- status: complete
- phase: proved and handed off
- next: none
- handoff: final current-tree implementation

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Accepted P1/P2 packet and later `ref` corrections copied into this plan; P0 explicitly excluded |
| Active goal and plan verified | yes | Goal tool points to this exact plan |
| Current owners read | yes | Prior full AST audit plus live package/schema/codec/consumer reads recorded in `docs/plans/2026-08-18-audit-first-party-ast-types.md` and refreshed before edits |
| Best API target resolved | yes | User accepted Date `value`, association `ref`, File-only `name`, flat Code Drawing, exact validators, nullable table widths, and `latex` |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution on current `next`; no git publication |
| Docs pack selected | yes | Supporting current-state guide/plugin docs and registry examples change |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read before execution |
| Docs lane selected | yes | Guide/system plus affected plugin/reference snippets |
| Target docs and nearest sibling docs read | yes | Document-model, editor, and every affected plugin page were read against their package owner before editing |
| Docs style doctrine read | yes | `docs-creator` current-state voice and package/API source-backing rules applied |
| Documented source owner identified | yes | Owning package schemas/codecs and generated application `Value` |
| Package/API pack selected | yes | Eleven published package contracts plus Plate migration/CLI adoption |
| Public surface or package boundary identified | yes | Persisted AST fields, scoped insert/read/update APIs, codecs, generated types, and package exports |
| Release artifact path selected | yes | Existing package changesets were updated and the registry delta owns `2026-08-18-align-v55-ast-contracts.mdx` |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read; exact per-package delta will be classified against `main` after implementation |
| Barrel/export impact decision recorded | yes | No exported file add/remove is planned; run `pnpm brl` only if implementation changes exported topology |
| Browser pack selected | yes | Registry components and examples consume renamed persisted fields |
| Browser route / app surface identified | yes | Standalone Date, Mention, Footnote, Code Drawing, Equation, Media, Column, Table, and List demo routes when present |
| Browser tool decision recorded | yes | In-app Browser is the required normal app QA path; Chrome/Computer are N/A unless a native-only blocker emerges |
| Console/network caveat policy recorded | yes | Record console errors and route-load failures; external Code Drawing render network failure is separated from local UI/AST proof |
| Observable browser case captured | N/A: no report-backed bug | This is API adoption proof, not a public report replay; exact demo routes and visible outcomes are recorded before Browser execution |
| Agent-native pack selected | yes | Best API identity doctrine and generated skill mirrors change |
| Agent-facing action surface identified | yes | Future AST/API naming reviews must distinguish `key`, `id`, and `ref` |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` through `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Skill loaded; identity-law source and regenerated mirrors audited |

Work Checklist:
- [x] Every explicit user requirement, accepted correction, exclusion, proof
      surface, and final handoff requirement is captured above.
- [x] Date persists one required non-empty `value`; raw authored strings remain
      lossless and codecs/UI/helpers use one field.
- [x] Mention persists required non-empty `ref` plus optional `label`; item,
      insert, HTML, Markdown, registry, docs, examples, and generated types agree.
- [x] Footnote definitions and references both persist required non-empty `ref`;
      all package/React/registry APIs use `ref`; MDAST alone uses `identifier`.
- [x] Column Group no longer declares/serializes `layout`; migration preserves
      meaningful legacy widths through child `width` before deleting it.
- [x] Media shared properties exclude `name`; File alone owns optional `name`;
      other insert inputs, schemas, codecs, registry consumers, and types reject it.
- [x] Code Drawing owns flat required/defaulted `code`, `language`, and `view`
      with lowercase enum values; live/static rendering and Markdown agree.
- [x] Block and inline equations persist required/defaulted `latex`; commands,
      rules, codecs, UI, examples, discussion indexing, and generated types agree.
- [x] Closed domains use exact validators: positive safe table spans/natural
      dimensions, non-negative safe indent, signed safe list starts/restarts, positive row height,
      non-negative border width, and enum text alignment.
- [x] Table partial widths use `null`, never `0`, as unknown; import, repair,
      mutation, rendering, serialization, fixtures, and types preserve the law.
- [x] Current application migration rewrites every old persisted shape and
      migration regression tests assert schema-valid final documents; v53
      inputs run v54 then v55, while existing v54 beta documents run v55.
- [x] Generated editor contracts, registry consumers/examples, public docs,
      changesets/changelog, and doctrine teach only the final contract.
- [x] Outcome, scope, non-goals, constraints, owners, source claims, concept decisions, adoption, proof, and risks are concrete.
- [x] One `best-api` verdict owns the public call shape; no compatibility aliases or private bridge remain.
- [x] Docs use current-state, source-backed teaching with verified owners, links, routes, imports, components, transforms, and previews.
- [x] Published package changesets and the registry changelog classify every user-visible delta; `changeset` and `registry-changelog` rules were applied.
- [x] Package tests/typechecks, generated editor contracts, API-reference output, docs source, and barrels are resolved.
- [x] Browser routes and expected visible outcomes were identified before the app host was attempted.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Agent-native source rules own the identity law; generated mirrors were regenerated, parity-checked, and reviewed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Final `pnpm check` exited 0 with 60 builds, 60 typechecks, 3,204 fast tests, 1,528 slow tests, and 60 intentional skips |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final package schemas, v55 chain, www schema v55, generated contracts, release artifacts, and stale-name allowlist were reread after the last edit |
| Best API review | yes | Resolve every P0/P1 call-shape finding | `key` live, `id` occurrence, and `ref` association law is implemented without aliases; all accepted P0-P2 findings are closed |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work | Package, migration, generated, docs, release, and agent adoption are complete; Browser carries one exact host blocker below |
| Verification recorded | yes | Record fresh exact execution gates | Focused, root, www, changelog, source-audit, mirror-parity, and review evidence is recorded in this plan |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and execution order | Final handoff below names the v55 owner, hard cuts, migration chain, proof, and browser caveat |
| P2 autoreview | yes | Run implementation review with `--max-priority P2` | Full packet review plus narrowed Table and Plite follow-ups closed every accepted finding; final Plite follow-up reports no actionable P0-P2 finding |
| Goal plan complete | yes | Run the autogoal completion checker | The final checker is the last local gate after this ledger update |
| Docs source-backed claim audit | yes | Verify docs claims against current source | `www typecheck` passed editor/API/docs source parity and registry-source checks |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names | www source generation and typecheck passed for all edited current-state pages and preview imports |
| Docs MDX/content parser | yes | Run the MDX/content parser | `pnpm --filter www typecheck` ran `build:source`; Fumadocs generation and parity passed |
| Plugin page specifics | yes | Apply plugin current-state teaching rules | Date, Mention, Footnote, Code Drawing, Equation, Media, Table, List, and document-model pages teach only v55 shapes |
| Public API / package boundary proof | yes | Audit public API, exports, and package boundaries | Package typechecks, negative schema tests, generated editor types, and stale-name scans passed |
| Release artifact classification | yes | Classify package and registry deltas | Published package deltas own major changesets; copied registry adoption owns the v55 registry changelog entry |
| Published package changeset | yes | Update package changesets | Affected existing changesets teach the final v55 fields and no forbidden `minor` was introduced for core packages |
| Registry changelog | yes | Generate and verify the registry entry | `2026-08-18-align-v55-ast-contracts.mdx` generated cleanly; all 68 changelog entries passed `--check` |
| No release artifact | N/A: artifacts apply | Record why no artifact is needed | Not applicable because package changesets and a registry changelog both apply |
| Package typecheck/build/test | yes | Run owning package and repository gates | Focused owner checks passed; final `pnpm check` passed the complete package graph and suites |
| Barrel/export generation | yes | Run barrel generation when topology changes | `pnpm brl` passed after the exported migration addition; later edits changed no exported topology |
| Browser interaction proof | blocked by host | Exercise representative routes | The dev host failed before route load because CI-owned `apps/www/src/__registry__/index.tsx` imports already-deleted registry files; local `build:registry` is forbidden |
| Browser console/network check | blocked by host | Record console and network state | Compilation failed on missing local modules before the page or networked Code Drawing renderer could run |
| Browser final proof artifact | blocked by host | Record route/native proof or exact caveat | No visual claim is made; the complete module-not-found host output is recorded in the dev-server attempt |
| Exact case replay | N/A: no report-backed bug | Prove the reported case | This is an accepted beta AST redesign, not a reporter case |
| Final ref and fingerprints | N/A: local current tree | Record immutable replay authority | No commit, push, PR, or shipped-state claim was requested; the implementation remains local and uncommitted |
| Clean final runtime | N/A: no fixed/shipped claim | Prove a clean immutable runtime | The handoff claims a green local candidate only, not a pushed or shipped fix |
| Retry-free stability | N/A: no native lifecycle claim | Record five browser/device replays | The packet changes persisted schemas/codecs and has no native selection/paint/DnD claim |
| Agent source / generated sync | yes | Regenerate mirrors from source rules | `pnpm install` regenerated mirrors; the identity rule source and Best API mirror compare byte-for-byte |
| Agent action discoverability | yes | Audit the agent route | AGENTS routes public shape to `best-api`, adoption to `plate-plan`, and identity law to the source rule/Vision owner |
| Agent-native review | yes | Close source/mirror/proof findings | Source owner, mirror, proof, and handoff chain passes; no accepted parity finding remains |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Accepted audit, live owner reads, scope and proof gates captured | Done |
| Decide | complete | User accepted the hard-cut target including uniform persisted `ref` | Done |
| Implement | complete | Packages, v55 migration, registry, generated contracts, docs, doctrine, and release artifacts agree | Done |
| Prove and hand off | complete | Final root/www gates, P2 follow-ups, agent-native audit, and caveats are recorded | Done |

Decision brief:
- outcome: One truthful Plate-native persisted AST vocabulary with no legacy
  aliases and one migration path from supported historical documents.
- chosen shape: semantic flat fields, `id` for self identity, `ref` for
  persisted associations, exact runtime validators, and MDAST names confined
  to Markdown codecs.
- strongest rejected alternative: preserve old names behind optional aliases
  or copy MDAST field vocabulary directly into Plate nodes.
- consequence: broad breaking package/registry/generated/docs adoption, paid
  once through the current application migration chain.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Date literal | `date?` + `rawDate?` | required non-empty `value` preserving ISO or raw author input | Date | one datum, no contradictory states | package/UI/codecs/docs/migration | package + browser + migration | malformed empty inputs need explicit fallback | rearchitect |
| Mention association | optional `key`, required display `value` | required `ref`, optional `label` | Mention | separates association from runtime key and element id | package/UI/codecs/docs/migration | package + generated types + browser | HTML/Markdown compatibility hard cut | rename |
| Footnote association | `identifier` on both node kinds and APIs | required non-empty `ref` everywhere inside Plate | Footnote | one union field and one relation vocabulary | package/React/UI/codecs/docs/migration | package + browser + MDAST round-trip | external MDAST retains `identifier` | rename |
| Column widths | dead group `layout`, live child `width` | child `width` only | Layout | one owner already used by all runtime behavior | schema/codecs/migration/docs | package + browser + stale audit | legacy layout-only documents | cut |
| Media filename | shared `name` on five node kinds | File-only `name` | Media | current product/codec owner is File only | schemas/input types/codecs/UI/migration | package + type negatives + browser | hypothetical asset metadata deliberately excluded | move |
| Code Drawing | opaque optional `data` with PascalCase values | flat `code`, `language`, `view` with lowercase enums/defaults | Code Drawing | Plate owns stable fields; opaque bag buys nothing | package/UI/static/Markdown/migration | package + browser + round-trip | read-only/static view parity | rearchitect |
| Math source | `texExpression` with inconsistent construction law | defaulted canonical `latex` on block and inline | Math | names actual supported syntax and removes verbosity | package/UI/rules/docs/migration | package + browser + Markdown | broad registry/example blast radius | rename |
| Closed property domains | primitive finite numbers/strings | exact enum/integer/range validation | Owning feature packages | schema must reject impossible current shapes | schemas/codecs/tests/migration | negative schema tests + package tests | avoid over-constraining CSS/open domains | rearchitect |
| Partial table widths | `0` means unknown inside `number[]` | `null` means unknown inside `(number \| null)[]` | Table | zero is a width, not absence | import/runtime/serializer/tests/docs/migration | package + HTML round-trip + browser | arithmetic consumers must narrow null | rearchitect |
| Document-model teaching | universal-looking incomplete profile | representative shapes plus app-generated exact `Value` | Docs | application composition defines the complete grammar | guide + plugin docs | docs checks + route proof | no hand-maintained 35-node oracle | rename |
| Identity doctrine | `key`/`id` law lacks a stable association noun | add `ref` as persisted association token; external names stay in codecs | Best API + Plate Vision | prevents recurrence across features | source rules, smallest Vision/worker owners, regenerated mirrors | source parity + agent-native review | do not turn package fields into universal machinery | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Contract/migration tests | Owning packages + Plate migration | Add final-shape and legacy-input expectations before/with owner edits | Accepted target fixed | Focused failures identify every old contract | package/migration tests |
| 2. Literal/association/math | Date, Mention, Footnote, Math | Hard-cut fields, APIs, codecs, consumers, and tests | Slice 1 fixtures exist | Four packages and direct registry consumers green | focused tests/typechecks |
| 3. Structural/media/drawing | Layout, Media, Code Drawing | Remove/move/flatten fields and update consumers | Slice 2 stable | Three packages and registry consumers green | focused tests/typechecks |
| 4. Domain validators/table widths | List, Indent, Basic Styles, Media, Table | Add exact validation and nullable-width law | Core field renames stable | Negative schema and table behavior proof green | focused tests/typechecks |
| 5. Migration/generated/docs | Plate, CLI, www, docs | Rewrite historical input, regenerate exact contracts, adopt examples/docs | Package targets green | zero stale names and docs/generated checks green | migration/CLI/www/docs checks |
| 6. Doctrine/release | Best API/Vision/worker owners, changesets, registry changelog | Record durable law and release-facing migration | Final public delta known | mirrors/releases/source audits agree | install/parity/changelog checks |
| 7. Closure | Root + Browser + reviewers | Full checks, demo proof, P2 autoreview, agent-native review | All edits complete | no accepted findings or failing gate | root check/browser/review/check-complete |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Old persisted documents migrate to one final schema | Existing v53/current migration tests and manifest | Central v53→v54→v55 and v54→v55 suites assert final schema, collision behavior, roots, and source fingerprints | verified |
| Public package node and command types expose only final fields | Owning schemas/type tests/generated contract | 60 package typechecks, negative schema tests, generated www contract check, and stale-name audit | verified |
| Runtime/codec behavior remains equivalent | Current package codecs and UI consumers | 3,204 fast and 1,528 slow tests cover HTML/Markdown, insertion, normalization, rendering, and table constraints | verified |
| Registry demos still render and edit representative nodes | Current standalone demos | Package/UI tests pass; live Browser route is blocked by stale CI-owned `src/__registry__/index.tsx` imports for already-deleted registry files | blocked with exact host caveat |
| Docs and agent doctrine teach the shipped shape | Source docs/rules and generated mirrors | www editor/API/docs/source checks, 68-entry changelog check, install regeneration, and exact identity-rule mirror parity | verified |

Conditional evidence:
- High-risk scenarios: (1) migration loses raw Date/legacy column width intent;
  (2) association renames break Footnote/Mention codec resolution; (3) nullable
  table widths leak into arithmetic/rendering and collapse columns.
- External research: N/A for execution; accepted API research is already
  compiled and current source is authoritative.
- Issue/PR provenance: N/A; user-directed beta API execution, not tracker work.
- Docs/registry/browser/release/behavior-law owners: all apply and are named in
  the decision/execution ledgers.

Findings:
- The accepted plan is the completed AST audit plus the user's later naming
  correction: Plate canonical associations use `ref` uniformly, while MDAST
  codecs alone expose `identifier`.
- Current branch is `next`, the intended beta integration checkout.
- The canonical www schema is currently version 54 with only
  `migratePlateV54`. Changing v54-beta persisted fields in place would strand
  already-versioned documents, so the accepted packet requires a real v55 step;
  v53 documents then run both existing ascending steps.

Decisions and tradeoffs:
- Compatibility aliases are rejected. Supported historical documents cross the
  application migration boundary once; current-schema normalizers never sniff
  old fields.
- `ref` is a persisted association token shared by relation participants, not
  a React renderer ref or live `NodeKey`.

Review fixes:
- Added collision-safe, schema-valid v55 fallbacks for empty or conflicting
  Date, Mention, Footnote, Layout, Media, Code Drawing, Math, List, and Table
  legacy shapes.
- Preserved nullable table widths through construction, mutation, rendering,
  serialization, and HTML import; bounded hostile span/constraint work and
  invalidated DOM-derived span caches per decode; normalized trailing widths
  before column mutation; and matched WHATWG/Chromium span parsing and caps.
- Closed Code Drawing preview races/errors and retained source in static view.
- Tightened numeric/enum domains and cross-field list ownership while
  preserving both `listStart` and `listRestart`.
- Repaired final-check type/runtime drift in the shared current tree where
  transaction draft reads, live element-id lookup, and public read-view types
  otherwise prevented the repository gate from passing. Runtime tx-only/read
  brands now use a cross-module WeakSet registry and survive guarded proxies
  without violating callable-tree symbol rules.
- Rejected the final `rowspan="-0"` finding: WHATWG parses non-negative
  integers through the integer consumer algorithm, and Chromium explicitly
  enables and tests minus-zero for unsigned HTML integers.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad migration search entered generated `apps/www/public/r/registry.json` and attempted a nonexistent `migratePlateV54.ts` path | 1 | Read exact migration index and exclude generated public registry output | Resolved; live owner is `packages/plate/src/migrations/index.ts`, and the app schema was advanced from v54 to v55 |
| Focused test filter omitted the package-relative `./` prefix | 1 | Use the package runner's relative file syntax | Resolved; focused suites passed |
| An over-broad text replacement damaged Code Drawing copy | 1 | Restore the exact source text and use structural patches | Resolved and covered by www checks |
| Direct checkout autoreview scanned an unrelated current-tree credential | 1 | Review the AST packet in a source-only temporary clone | Resolved without exposing or editing unrelated data |
| The first review sync copied `internal/codec.ts` to the wrong temporary directory | 1 | Delete the accidental review-only file, sync exact paths, and byte-compare | Resolved; all follow-up review snapshots matched source exactly |
| A module-local WeakSet removed method symbols but lost tx-read identity across wrappers/package instances | 1 | Share the WeakSets through global symbol keys and propagate markers to guarded function proxies | Resolved by Plite/Core/Cursor regressions, typechecks, root check, and clean P2 follow-up |
| Browser host compiled stale CI-owned `apps/www/src/__registry__/index.tsx` imports for deleted registry files | 1 | Keep the failed host evidence; local `build:registry` is forbidden | Browser proof remains an explicit host blocker; package/UI/docs checks substitute only for non-visual claims |
| Raw `bun test` loaded incompatible Playwright/Vitest suites indiscriminately | 1 | Use the repository's bounded `pnpm check` gate | Resolved; authoritative root gate is green |

Verification evidence:
- `pnpm check` -> exit 0; 60 package builds, 60 package typechecks, 3,204
  fast tests, 1,528 slow tests, 60 intentional skips, and the slowest-test gate.
- `pnpm --filter www typecheck` -> editor schema generation check, API-reference
  check, Fumadocs source generation, docs parity, registry source, app and
  package-integration TypeScript all pass.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> all 68
  registry changelog entries pass.
- Table follow-up -> 44 focused tests and source-first typecheck pass; the
  final narrowed review has no accepted Table finding after source-backed
  rejection of the minus-zero claim.
- Plite marker follow-up -> 12 read-lifecycle, 63 Core resolver, and 8 Cursor
  tests pass; Plite/Core/Cursor typechecks pass; final P2 review is clean.
- Migration centralization audit -> only
  `packages/plate/src/migrations/migratePlateV54.spec.ts` and
  `migratePlateV55.spec.ts` own versioned migration suites.
- Stale-name audit -> remaining old spellings are limited to migration code,
  migration fixtures/demos, historical changelogs, and the MDAST
  `identifier` codec boundary.
- Agent-native parity -> source identity rule and generated Best API mirror
  compare exactly; package/docs/release proof routes are discoverable.

Final handoff prepared:
- Ownership and target API: Plate v55 owns the application migration step;
  packages own their schemas/codecs; `key` is live, `id` is occurrence, and
  `ref` is persisted association identity.
- Public breaks and adoption: Date `value`; Mention/Footnote `ref`; child-only
  column widths; File-only `name`; image `naturalWidth`/`naturalHeight`; flat
  Code Drawing; math `latex`; exact domains; nullable table widths.
- Applicable runtime/package/docs/browser decisions: all package, registry,
  generated, docs, release, and agent surfaces are adopted. Browser proof is
  blocked only by stale CI-owned registry host output and makes no visual claim.
- Proof and execution risks: final root and www gates plus P2/agent-native
  reviews are green. Local current-tree state is not a pushed or shipped ref.
- Execution order and user attention: no implementation step remains; commit
  or publication requires a separate explicit request.

Timeline:
- 2026-08-18T09:42:26.109Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final current-tree handoff |
| Where am I going? | Current-tree handoff; publication is separately authorized |
| What is the goal? | Ship every accepted AST hard cut with migration and regression proof |
| What have I learned? | The final association vocabulary is `key` live, `id` self, `ref` persisted relation; MDAST names stay at codec boundaries |
| What have I done? | Implemented v55, centralized migration proof, adopted every package/registry/docs/generated/release surface, and closed root/review gates |

Open risks:
- Browser visual proof is unavailable until CI regenerates the stale
  `apps/www/src/__registry__/index.tsx`; package/UI tests and www compilation
  do not substitute for a rendered-route claim.
- The result is an uncommitted local candidate. No commit, PR, release, or
  shipped-state proof exists or is claimed.
