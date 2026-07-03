# plate-next dom plugin scrolling drift

Objective:
Repair DOMPlugin/withScrolling drift; done when legacy withScrolling is cut, DOM auto-scroll and host focus proof pass, and no stale callers remain.

Goal plan:
docs/plans/2026-07-01-plate-next-dom-plugin-scrolling-drift.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked to repair `packages/core/src/lib/plugins/dom/withScrolling.ts` and `packages/core/src/lib/plugins/dom/DOMPlugin.ts` the same way as the NodeIdPlugin drift cleanup.
- mode: named file/API review, not broad Core sweep.
- target surface: DOM plugin auto-scroll API, host DOM focus forwarding, and legacy `withScrolling` helper.
- review target: best Plate v2 migration on top of Plite, not legacy compatibility.
- broad Core sweep: no; related correction sweep only.
- correction-triggered related Core sweep: yes.
- completion threshold summary: DOM auto-scroll has one clean API, stale `withScrolling` callers/exports/tests are removed or migrated, host DOM APIs are composed through a named Core DOM helper, focused Core/Plite DOM proof passes, and the removed-symbol audit has no active-source matches.

First checkpoint:
- Explicit target: `DOMPlugin.ts` and `withScrolling.ts`.
- Explicit prior Plate Next direction: no `with*` API pattern as final Plate/Plite shape; use current Plite-era `editor.update` and `tx.dom.autoScroll`.
- Scope boundary: Core DOM plugin, its tests, barrel export, and direct stale callers.
- Non-goal: broad Core sweep, package migration, public docs rewrite, rename pass, or browser route proof.
- Stop condition: close after best Plate v2 verdict, safe cleanup, related sweep, focused tests, `check:core`, and autogoal check.
- Final handoff: verdict, files changed, proof, Plite/Plate gap, related sweep, and next attention item.

Completion threshold:
- `withScrolling` is not exported or used as a public helper.
- DOM auto-scroll behavior remains covered through `tx.dom.autoScroll`.
- `DOMPlugin.ts` keeps the existing DOM owner and does not move product policy into a bridge.
- `DOMPlugin.ts` composes the host DOM API through a named helper, not inline callback destructuring.
- `DOMPlugin.ts` does not use hand-picked `Partial<Pick<DOMApi, ...>>` type sludge.
- Plite DOM owns the optional retry type for `focus`.
- Stale `tx.dom.withScrolling` caller is migrated.
- No `withScrolling`, `WithAutoScrollOptions`, or `tx.dom.withScrolling` matches remain in active TS/TSX/MDX source under the audited scope.
- `pnpm check:core` passes after `pnpm brl`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-dom-plugin-scrolling-drift.md` passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  - `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts`
- package proof:
  - `pnpm --filter @platejs/core typecheck`
  - `pnpm --filter @platejs/core lint`
  - `pnpm --filter @platejs/plite-dom typecheck`
  - `pnpm --filter @platejs/plite-dom lint`
  - `pnpm brl`
  - `pnpm check:core`
- source audits:
  - `rg -n "withScrolling|WithAutoScrollOptions|tx\\.dom\\.withScrolling|dom\\.withScrolling|isScrolling\\(" packages/core/src packages/core/type-tests apps content docs -g '*.ts' -g '*.tsx' -g '*.mdx'`
  - `rg -n "withScrolling|WithAutoScrollOptions" packages/core/src -g 'index.ts' -g '*.ts'`
- related Core sweep query / match count / patched count / deferred count: stale helper audit returned 0 matches after patch.
- Plite/Plate gap ledger: Plite DOM focus retry typing gap fixed in owner.
- broad Core drift ledger gate: N/A, scoped file/API review.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-dom-plugin-scrolling-drift.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, old `with*` helpers, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper dumps, broad casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of inventing a compatibility workaround.
- After every correction, run a related Core sweep across `packages/core/src` and relevant direct callers for the same symbol/pattern/smell.
- Review-mode rename freeze: no rename pass in this packet.
- Extracted-file recovery gate: every untracked/extracted file in scope must be inventoried and classified.
- For Core-only targets, ignore non-Core package errors unless the package is named, touched by the packet, or the failure proves a Core public API regression.

Boundaries:
- allowed edit scope: `packages/core/src/lib/plugins/dom/**`, direct stale caller `apps/www/src/registry/components/editor/plugins/ai-kit.tsx`, Plite DOM focus source/test lint cleanup under `packages/plite-dom/**`, and this plan.
- package/API surfaces: Core DOM plugin API.
- docs/browser surfaces: browser N/A because this is an API-name cleanup inside a registry plugin, not a route behavior change.
- non-goals: no broad Core sweep, no browser route proof, no release/docs copy update.
- out-of-scope package errors: `pnpm --filter www typecheck` remains broadly red from existing Plate migration fallout; after local annotation it no longer reports `ai-kit`, `withScrolling`, or `autoScroll`.

Output budget strategy:
- Use targeted `sed`/`rg` reads and capped command output.

Blocked condition:
- If `withScrolling` had live external package callers that could not be migrated to `tx.dom.autoScroll` without a broader public API plan, stop and route to `plate-plan`. This did not happen.

Current verdict:
- verdict: hard-cut stale `withScrolling`, keep DOMPlugin as the auto-scroll/base DOM fallback owner, compose existing Plite DOM methods through `createCoreDomApi`, migrate the one stale registry caller, and fix Plite DOM focus retry typing in the source owner.
- confidence: 100 for this scoped packet.
- next owner: plate-next.
- keep / revert / quarantine call: keep.
- reason: `tx.dom.autoScroll` is the single current mutation API; the deleted helper was a stale `with*` public surface and the focused proof is green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records exact files, scope, non-goals, stop condition, and proof |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned no active goal; scoped plan created without goal tool because user did not explicitly request a goal |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API review |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and constraints |
| Broad Core drift ledger initialized when in scope | N/A: not broad | Scoped DOM packet |
| Source of truth and allowed workspace recorded | yes | Boundaries section |
| Output budget strategy recorded | yes | Output budget strategy section |
| Public API fork routing checked | yes | Hard-cut stale helper, no new API fork |
| Gap policy checked | yes | No blocking Plite/Plate gap |
| Related Core sweep policy checked | yes | Source audit command recorded and passed |
| Review-mode rename freeze checked | yes | No rename pass |

Work Checklist:
- [x] Review `origin/main` DOMPlugin and withScrolling ownership.
- [x] Decide `withScrolling`: hard-cut stale public helper.
- [x] Patch DOM auto-scroll API and stale callers.
- [x] Patch host DOM API composition and Plite DOM focus retry typing.
- [x] Remove inline `const { dom }: { dom?: HostDomApi } = api` drift.
- [x] Remove `ExistingDomApi = Partial<Pick<DOMApi, ...>>` drift.
- [x] Run related source audit for old helper/caller names.
- [x] Run focused DOMPlugin test.
- [x] Run Core and Plite DOM typecheck/lint/check proof.
- [x] Fill review matrix, gap ledger, changed list, proof, open risks, and final score.
- [x] Run autogoal `check-complete`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused DOMPlugin test, Core typecheck, Core lint, Plite DOM typecheck, Plite DOM lint, `pnpm brl`, and `pnpm check:core` passed |
| Broad Core drift ledger coverage | N/A: not broad | Record N/A reason | Scoped DOM named packet |
| Score gate | yes | Prove scoped drift fixed or owned | Review matrix rows closed |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Recommendation table closed |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No blocking gap |
| Related Core sweep after correction | yes | Run same-class Core/direct caller search | Old-symbol audit returned 0 matches |
| Package/API proof | yes | Run focused typecheck/test/lint and Core gate | Commands listed in Proof |
| Non-Core package error triage | yes | Classify if any appear | `www` typecheck failures are unrelated broad migration fallout; touched file no longer appears in failure log |
| Source audit | yes | Run exact audit for removed helper names | 0 matches |
| Rename ledger | N/A: no rename pass | No rename pass | N/A |
| Extracted-file inventory | yes | Record untracked file command and row count | Inventory returned 0 rows |
| Autoreview / review | N/A: scoped packet | Plate Next review is the owning review | N/A |
| Final lint/check | yes | Run scoped lint/check | Core lint and `check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed files and risks recorded |
| Goal plan complete | yes | Run `check-complete.mjs` | final command passed |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| DOMPlugin/withScrolling named-file drift review | complete | Stale helper cut, old caller migrated, DOM restore/insert-node/focus regressions covered, inline DOM API destructuring removed, Core gate passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/dom/withScrolling.ts` | 4 -> 0 | hard-cut | DOMPlugin | Duplicated `tx.dom.autoScroll` as old `with*` public helper | deleted |
| `packages/core/src/lib/plugins/dom/withScrolling.spec.ts` | 2 -> 0 | merge-existing-owner | DOMPlugin tests | Useful restore semantics moved into `DOMPlugin.spec.ts` | deleted after proof moved |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 3 -> 0 | main-parity-cleanup | DOMPlugin | Correct owner; fixed `insert_node` regression, restore leak, host DOM API composition through `createCoreDomApi`, and removed hand-picked DOM API subset typing | keep |
| `packages/core/src/lib/plugins/dom/index.ts` | 2 -> 0 | hard-cut stale export | DOMPlugin barrel | Exported deleted helper | export removed |
| `apps/www/src/registry/components/editor/plugins/ai-kit.tsx` | 3 -> 1 | main-parity-cleanup | registry AI kit | One stale `tx.dom.withScrolling` caller | migrated to `tx.dom.autoScroll`; broader AI typing remains package migration debt |
| `packages/plite-dom/src/plugin/dom-editor.ts` | 2 -> 0 | move-to-plite | Plite DOM | `focus` runtime already allowed omitted retries but the public type required retries | optional retry type fixed |
| `packages/plite-dom/test/dom-coverage.ts` / `test/hotkeys.ts` | 1 -> 0 | main-parity lint cleanup | Plite DOM tests | Touched package lint required top-level regexes | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| DOM auto-scroll | Use `editor.update(tx => tx.dom.autoScroll(...))` only | Keep exported `withScrolling`, add alias, or expose both names | One mutation namespace is cleaner and typed | Low |
| Auto-scroll state | Keep internal `AUTO_SCROLL`/first-target state inside DOMPlugin | Export WeakMap for tests or callers | Runtime state is implementation detail; public read is `editor.api.dom.isAutoScrolling()` | Low |
| Host DOM API composition | Compose existing Plite DOM methods through `createCoreDomApi`; Core adds auto-scroll and base read-only fallback | Inline callback destructuring, renaming the Plate extension to `dom`, or replacing Plite DOM methods blindly | API capability name `dom` merges; extension name `dom` replaces | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| fixed Plite gap | Plite DOM `focus` type required `retries` despite runtime default | A Core cast would hide the wrong source owner | `packages/plite-dom/src/plugin/dom-editor.ts` | Plite DOM typecheck/lint and Core DOMPlugin spec | fixed |
| defer-with-owner | AI streaming still uses old `editor.tf` internally | Rewriting AI streaming inside DOM cleanup would broaden the packet | AI package / Plate package migration | AI package typecheck and behavior tests | defer |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| stale `withScrolling` API | `rg -n "withScrolling|WithAutoScrollOptions|tx\\.dom\\.withScrolling|dom\\.withScrolling|isScrolling\\(" packages/core/src packages/core/type-tests apps content docs -g '*.ts' -g '*.tsx' -g '*.mdx'` | 0 after patch | 1 stale caller patched before final audit | 0 | none in audited TS/TSX/MDX source |
| stale Core barrel export | `rg -n "withScrolling|WithAutoScrollOptions" packages/core/src -g 'index.ts' -g '*.ts'` | 0 after patch | 1 barrel patched | 0 | none |
| missing host focus forwarding | `rg -n "focus\\?:|focus: \\(editor|preserves host DOM focus API|autoScroll|scrollOperationIntoView|withScrolling" packages/core/src/lib/plugins/dom/DOMPlugin.ts packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts packages/plite-dom/src/plugin/dom-editor.ts` | expected focused matches | DOMPlugin forwarding patched; Plite DOM focus type patched; spec added | 0 | none |
| inline DOM API destructuring and hand-picked subset typing | `rg -n "ExistingDomApi|Partial<\\s*Pick|HostDomApi|const \\{ dom \\}:|withScrolling|tx\\.dom\\.withScrolling" packages/core/src/lib/plugins/dom packages/core/src packages/core/type-tests apps content docs -g '*.ts' -g '*.tsx' -g '*.mdx'` | 0 | inline destructuring and subset type removed; stale names absent | 0 | none |
| extracted DOM file inventory | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/dom apps/www/src/registry/components/editor/plugins | sort` | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: no.
- Manifest command: N/A.
- Manifest owner: N/A.
- Optional type-test owner: N/A.
- Ledger location: N/A.
- Expected row count: N/A.
- Actual row count: N/A.
- Missing row count: N/A.
- Extra row count: N/A.
- Score gate: N/A.
- Top drift rows: N/A.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 0 | main-parity-cleanup | DOMPlugin | Focused tests and Core gate | keep |
| `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` | 0 | main-parity proof | DOMPlugin tests | Restore, insert-node, and host focus composition rows cover real regressions | keep |
| `packages/core/src/lib/plugins/dom/index.ts` | 0 | stale export cut | DOMPlugin barrel | Old-symbol audit 0 matches | keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| DOM auto-scroll API cleanup | plate-next | Old `withScrolling` helper and `insert_node` scroll drift should not survive Plate Next | DOMPlugin, DOMPlugin.spec, DOM barrel, AI kit caller | keep | next Plate Next file review |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | N/A | no extracted DOM files | inventory command returned 0 rows |

Changed files:
- `packages/core/src/lib/plugins/dom/DOMPlugin.ts`
- `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts`
- `packages/core/src/lib/plugins/dom/index.ts`
- `packages/core/src/lib/plugins/dom/withScrolling.ts`
- `packages/core/src/lib/plugins/dom/withScrolling.spec.ts`
- `apps/www/src/registry/components/editor/plugins/ai-kit.tsx`
- `packages/plite-dom/src/plugin/dom-editor.ts`
- `packages/plite-dom/test/dom-coverage.ts`
- `packages/plite-dom/test/hotkeys.ts`
- `docs/plans/2026-07-01-plate-next-dom-plugin-scrolling-drift.md`

Proof:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts` passed, 7 tests.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm --filter @platejs/plite-dom typecheck` passed.
- `pnpm --filter @platejs/plite-dom lint` passed.
- `pnpm brl` passed.
- `pnpm check:core` passed after `pnpm brl`, 1874 pass, 85 skip, 0 fail.
- Old-symbol audit returned no matches.
- Extracted-file inventory returned no rows.
- `pnpm --filter www typecheck` fails on unrelated broad Plate migration errors; after local annotation, `rg "ai-kit|withScrolling|autoScroll" /tmp/plate-www-typecheck-dom.log` returned no matches.

Verification evidence:
- Auto-scroll still scrolls enabled text operations.
- Auto-scroll skips disabled operation types.
- Auto-scroll now scrolls enabled `insert_node` operations again.
- Auto-scroll options and state restore after no-op callbacks.
- Auto-scroll state restores when the callback throws.
- Host `editor.api.dom.focus?.({ retries: 1 })` forwards to the host DOM focus implementation.
- Inline `HostDomApi` destructuring and `Partial<Pick<DOMApi, ...>>` subset typing are gone; the only DOM composition helper is `createCoreDomApi`.
- `core-dom` remains intentionally distinct because Plite extension names replace, while API capability name `dom` merges.
- `withScrolling` helper, spec, and export are gone.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| DOM packet closed | Next packet is another Plate Next file review | One clean DOM auto-scroll API with no stale callers | Old helper proof exposed a real restore leak and insert-node scroll regression | Patch and proof complete |

Open risks:
- Broader `apps/www` and package typecheck still fail from existing Plate migration debt outside this packet.
- AI streaming still contains old `editor.tf` usage internally; that belongs to the AI package migration lane, not DOMPlugin cleanup.

Keep / revert / quarantine:
- keep.

Final score:
- 100 / 100 for the scoped DOMPlugin/withScrolling packet.
