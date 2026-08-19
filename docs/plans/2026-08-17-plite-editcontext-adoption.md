# Plite EditContext adoption

Objective:
Close the Plite EditContext adoption decision; done when binary readiness gates pass; plan docs/plans/2026-08-17-plite-editcontext-adoption.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-17-plite-editcontext-adoption.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard` because the proposal crosses browser input, DOM, selection, IME,
  collaboration pressure, and fallback behavior.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Chrome read-back of the named X post and its original EditContext thread.
- Current W3C EditContext draft plus Chromium, Gecko, and WebKit implementation
  status from their owning sources.
- Focused source audit of Plite DOM/input, selection, composition, React, and
  browser-proof owners; no repo-wide scan.
- Mechanical `check-complete` against this exact plan after all decision rows
  and execution-proof gates are resolved.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: whether and how Plite should adopt the browser `EditContext` API as
  a text-input backend, including fallback, IME, selection geometry, DOM
  ownership, and browser proof.
- Source owners: root Plite doctrine; live Plite DOM/input, selection,
  composition, React, and browser-test owners identified during Ground.
- Non-goals: React Context; implementation; replacing Plite's document model,
  operations, rendering, or public editor API; claiming cross-browser support
  from Chromium-only proof.
- Direct Plate/collaboration adoption owners: inspect only consumers whose IME
  or remote-update behavior materially challenges the decision.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the live Plite input owner or browser behavior cannot be read or
  exercised enough to distinguish an optional backend from a replacement.

Plite Plan state:
- status: ready
- phase: prove-and-handoff
- next: user review; do not execute while the revisit trigger is unmet
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Decide whether the X post's browser `EditContext` API is a good Plite improvement candidate; inspect it through Chrome; planning only under standard Plite Plan. |
| Active goal and plan verified | yes | Active goal names this exact plan path. |
| Current owners read | yes | `VISION.md`; `docs/vision/plite.md`; `docs/plite/agent-start.md`; current `plite`, `plite-dom`, `plite-react`, and Chromium browser-proof owners; existing June EditContext research packet. |
| Best API target resolved | no | N/A: the decision keeps the public surface unchanged. A future public transport option is explicitly gated on `best-api review`. |
| Mode and execution boundary resolved | yes | Standard, agent-led plan hardening; no implementation before explicit acceptance of this exact plan. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock. N/A: no public call shape changes; any later option reopens this gate.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers. N/A: none are proposed.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All ledger rows have a verdict; the result is an evidence-triggered defer, not an unresolved decision. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Live package source, current Chrome 150 capability, current W3C draft, Mozilla implementation tracker, and WebKit tracker checked on 2026-08-17. |
| Best API review | no | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | N/A: keep the public surface unchanged. A future `Editable` prop or `dom()` option must run `best-api review` before target lock. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Browser and high-risk input cases are resolved below; benchmark, release, and public provenance are N/A because no performance, release, or public issue claim is made. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Proof matrix and verification evidence below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section is complete. |
| P2 autoreview | no | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | N/A: planning-only; no runtime, API, tests, or public docs changed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-plite-editcontext-adoption.md` | Passed on the final plan state. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | X thread, W3C/browser status, Plite doctrine, live source, existing research, and proof owners read | Decide |
| Decide | completed | Keep current backend; defer a runtime adapter; keep EditContext as proof pressure | Prove and hand off |
| Prove and hand off | completed | Source/proof matrix, revisit triggers, conditional execution slices, and handoff recorded | User review |

Decision brief:
- outcome: `EditContext` is a useful Plite proof oracle and future backend
  candidate, but it is not a good runtime investment today.
- chosen shape: keep the current `contenteditable` + `DOMInputRuntime`/
  editing-kernel path. Revisit a private, capability-gated `plite-dom` backend
  only after a named trigger proves it can delete or uniquely fix real input
  complexity. Keep React and the public editor API unchanged.
- strongest rejected alternative: a Chromium-only second backend or universal
  replacement today. It duplicates the fallback indefinitely, freezes a draft
  flat-text projection into Plite, and cannot replace rich `beforeinput`,
  clipboard/drop, spellcheck, selection, or geometry responsibilities.
- consequence: no runtime work should start from this post alone. Continue to
  use EditContext's explicit text/selection/layout contract to pressure Plite
  browser proof. Reopen when Gecko ships by default plus WebKit has an active
  implementation, or when an exact high-value Chromium bug is only fixable by
  EditContext and the adapter deletes more complexity than it adds.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Browser text-input backend | `Editable` is a `contenteditable` root; native `beforeinput`/`input`/composition events feed one private root runtime | Keep as the only shipping backend | `@platejs/plite-dom` `DOMRootRuntime`/`DOMInputRuntime`; `@platejs/plite-react` event workers | Cross-browser, already deep, and backed by exact IME/collaboration cases | No Plate/public adoption | Existing focused package and browser suites | Existing complexity remains, but it is already required for Safari and fallback | keep |
| EditContext runtime adapter | No package runtime use; only research/docs references | Revisit as a private full-DOM backend after a named trigger, never from feature enthusiasm alone | `@platejs/plite-dom`; thin lifecycle wiring in `@platejs/plite-react` | It could remove Chromium DOM text mutation/repair and improve native text-service control, but today it adds a second backend without retiring the first | No public prop/API in the first slice; Plate inherits automatic host selection only after proof | Dedicated Chromium `textupdate`/composition/geometry rows plus the unchanged fallback matrix | Draft API, no WebKit plan, incomplete Gecko shipping, new platform bugs | defer |
| Event and mutation authority | `DOMInputRuntime` plus the editing kernel chooses ownership, selection policy, repair, and legal trace; canonical editor updates remain model truth | Any future EditContext events normalize into this owner; no parallel kernel or direct React mutation authority | `@platejs/plite-dom` input runtime | The platform transport changes; Plite's document law does not | None outside internal workers | Legal trace, `EditorCommit`, model/DOM/selection/focus assertions | Parallel authority would create duplicate/stale composition commits | keep |
| Flat text projection | Plite has path/range projection and DOM point/geometry mapping, but no one root-wide EditContext buffer or reversible flat-offset map | If reopened, add one private root-local projection from EditContext UTF-16 offsets to live Plite points/segments; fail closed for voids, unsupported selection kinds, and unmounted content | `@platejs/plite-dom`, consuming Plite state/range projection | Rich blocks, marks, voids, cross-block ranges, named roots, and partial DOM make a naive `NodeApi.string()` buffer ambiguous | Internal only; no serialized or public model field | Unit laws for offset round-trip and edit application across every named case | Wrong separator/void policy silently edits the wrong model range | gate |
| Selection and geometry | DOM selection import/export, caret engine, DOM geometry, and visual proof already own model/native agreement | Keep those owners; a future adapter only supplies `updateSelection`, selection/control bounds, and requested character bounds through them | `@platejs/plite-dom` geometry and `@platejs/plite-react` selection workers | EditContext makes existing obligations explicit; it does not remove them | None | Bidi, zoom, transform, scroll, shadow-root, multi-root, and follow-up typing proof | Candidate windows can be visibly wrong while model assertions pass | keep |
| Composition and remote/model changes | Plite tracks composition epochs and already tests nontrivial model edits during active Chromium IME | Keep current behavior law; EditContext must replay the same overlap/non-overlap policy before adoption | Plite input kernel; collaboration remains a canonical commit consumer | The tweet's strongest benefit is already materially covered by current Plite proof | No Plate-specific bridge | Existing rich-text IME cases plus future exact EditContext replay | Stale `textupdate` or `compositionend` can double-insert after remote edits | keep |
| IME-owned formatting | No EditContext `textformatupdate` transport; prior research treats it as a future overlay lane | Keep as raw-device/real-IME backlog until an adapter and platform decoration proof exist | Future input/overlay owner under `plite-plan` | Synthetic Playwright rows cannot prove native candidate decoration or double paint | N/A today | Raw device/real IME visual capture | A synthetic green path could overclaim user-visible IME correctness | defer |
| Public API | No `EditContext` object, `Editable` boolean, or `dom()` transport option | Keep absent | `best-api` only if a later host-control job is proven | Browser transport is not an ordinary app authoring choice | Zero caller migration | Public surface audit remains zero | A premature flag fossilizes an experimental backend and multiplies docs/support states | keep |
| Performance claim | No EditContext benchmark claim | Make no claim during planning; benchmark only if a future adapter claims latency or repair-cost improvement | Future Plite perf lane | Correctness and code deletion are the first adoption gates | N/A | Existing behavior proof first; then fair same-browser comparison if claimed | A faster micro-path can hide geometry or composition regressions | gate |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Reopen decision | `plite-plan` | Refresh W3C/vendor status and name the exact Plite gap or deletable repair owner | Gecko ships by default plus WebKit has active implementation, or an exact high-value Chromium issue is uniquely fixed by EditContext | One evidence-backed reason to build, one current fallback lifetime, and one accepted private target | Current vendor sources, exact repro, and live owner audit |
| 1. Projection oracle | `@platejs/plite-dom` | Private reversible text-buffer projection for full-DOM roots; no host attachment and no public API | Slice 0 passes | Round-trip laws cover collapsed, backward, marked, cross-text, cross-block, void-adjacent, named-root, and composition ranges; unsupported cases fail closed | Focused `plite-dom`/`plite` tests and source-first typecheck |
| 2. Private Chromium backend | `@platejs/plite-dom` with thin `@platejs/plite-react` lifecycle wiring | Attach one EditContext per mounted root behind an internal test override; normalize `textupdate`, composition, focus, and geometry requests into the existing kernel | Slice 1 passes and current Chrome API matches the tested contract | Raw-text input on this path causes no browser DOM text mutation/repair; canonical changes, traces, and fallback stay single-owned | Focused package tests plus dedicated Chromium browser rows |
| 3. Behavior parity gate | Plite browser proof | Replay current typing, deletion, formatting, clipboard/drop, history, IME, remote/model overlap, bidi, shadow, multi-root, and geometry cases through both paths | Slice 2 passes | EditContext path is green in Chromium; current backend remains green in Chromium/Firefox/WebKit/mobile claim classes; no public surface was added | `pnpm check:plite`, focused Chromium greps, then `pnpm check:plite:browser-matrix` at closure |
| 4. Adoption decision | `plite-plan` + `best-api` only if host control is proven | Decide auto-enable, continue experimental, or delete the adapter | Slice 3 evidence exists | Auto-enable only if the adapter uniquely improves behavior or deletes more owned complexity than it adds; otherwise delete/defer | Diff/source audit, exact behavior receipts, and optional fair perf evidence if a perf claim is made |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| The post concerns browser EditContext, not React Context | Chrome read-back of the named X post and original thread | N/A | confirmed |
| EditContext decouples raw text input from DOM mutation but leaves selection/layout/rich-intent work to the author | Current W3C draft and Chrome owner guidance | Dedicated adapter contract tests if reopened | confirmed |
| Plite already has one private root input owner | `packages/plite-dom/src/plugin/dom-input-runtime.ts`; `dom-root-runtime.ts`; `packages/plite-react/src/editable/editing-kernel.ts` | Existing package contracts; future adapter must emit the same legal trace | confirmed |
| Current Plite uses `contenteditable` and has no runtime EditContext adapter | `packages/plite-react/src/components/editable.tsx`; focused `rg` found EditContext only in docs/research | Public/internal surface audit after any future work | confirmed |
| The primary claimed benefit is partly covered already | `runtime-composition-events.ts`, `composition-state.ts`, and rich-text Chromium IME cases including model insert/delete/paste during composition and cross-paragraph replacement | Replay the exact rows through the future backend | confirmed |
| Cross-browser replacement is not available | Chromium shipped; Gecko implementation/shipping work remains open; WebKit says no active plan | Fresh vendor refresh at Slice 0 | confirmed-current on 2026-08-17 |
| A public API change is unnecessary | Transport can remain root-runtime internal; no author job is proven | Zero new public exports/props/options in Slices 1-3 | resolved |
| EditContext improves Plite today | Existing proof shows no exact open Plite defect or deletable owner that justifies a second backend now | Exact repro or code-deletion evidence required at Slice 0 | not established; defer |

Conditional evidence:
- High-risk scenarios:
  1. A remote/model insert, delete, or paste occurs before or across the active
     composition; stale platform updates must not double-insert or resurrect
     deleted text.
  2. One EditContext replacement spans marked siblings, paragraphs, void
     boundaries, or named roots; flat offsets must map to one exact Plite range
     or fail closed.
  3. Bidi text, zoom/transforms, scroll, shadow DOM, and partial/virtualized DOM
     request selection or character bounds; the candidate window must follow
     the real caret without double paint.
  4. Focus moves between multiple roots or an internal control while composing;
     the old root must deactivate and receive no stale text update.
  5. Formatting, spellcheck replacement, clipboard/drop, undo/redo, and
     structural deletion must remain on the existing rich-intent/kernel path;
     EditContext handles raw text only.
- External research: The named X post accurately describes EditContext's core
  purpose, but its 2023 "game changer" framing predates current implementation
  status. The June 2026 Plite research packet already rejected a runtime rewrite
  and promoted the API's explicit text/selection/layout contract into proof
  doctrine. Fresh browser-owner evidence does not clear the revisit gate.
- Issue/PR provenance: N/A for Plate public-queue policy; this is an internal
  architecture question. Mozilla and WebKit trackers are external-source
  evidence, not Plate completion authority.
- Browser/benchmark/docs/release/behavior-law owners: browser and behavior-law
  gates apply and are named above. Benchmark is N/A because no performance
  claim is made. Public docs/release are N/A because the chosen target changes
  neither; prior research/selection coverage remains current.

Findings:
- Chrome read-back: the named post asks whether Chromium's `EditContext` will
  change rich-text editors and links an original thread describing DOM/input
  decoupling. It is not about React Context.
- The current W3C draft makes the application own text, selection offsets,
  selection/control/character bounds, composition rendering, and rich-text
  `beforeinput` handling while the browser supplies the OS text-input channel.
- Chromium shipped EditContext in Chrome/Edge 121. Gecko is actively
  implementing it but still tracks shipping blockers. WebKit reported no active
  implementation plan in 2026, with prioritization rather than a design veto.
- Current Chrome 150 exposes `EditContext`, `HTMLElement.editContext`, and the
  expected text, selection, bounds, composition, and formatting methods/events.
- Plite already has the architectural shape the API encourages: model-owned
  canonical updates, one root input authority, explicit selection import/export,
  geometry owners, composition epochs, DOM repair, and legal browser traces.
- Plite does not have an EditContext runtime adapter. Focused source search found
  the term only in existing research/coverage docs.
- Existing Chromium browser proof already covers active-mark composition,
  select-all replacement, multiple formatted siblings, rapid multi-block IME,
  model insertion/deletion/paste during composition, and cross-paragraph IME.
  This materially weakens the post's claim that adopting the API itself is the
  missing improvement.
- The June 2026 research verdict already said to keep EditContext as proof
  pressure and future adapter research. The only material status change is
  active Gecko implementation; WebKit still prevents retiring the fallback.

Decisions and tradeoffs:
- Treat 2023 advocacy as a lead, not architecture authority; current browser
  support and Plite's live input owner decide adoption.
- Defer the adapter, not the invariants. Selection/layout/composition proof
  remains mandatory because EditContext exposes exactly where browsers fail.
- Prefer one mature backend over two until the second can delete owned
  complexity or uniquely close a user-visible defect.
- Keep browser transport private. If a future host needs control, prove that job
  and run `best-api` instead of leaking an experimental boolean from `Editable`.

Review fixes:
- Initial hypothesis changed from "optional capability-gated backend" to
  "defer runtime adoption" after reading current source, the existing June
  research packet, the current IME browser corpus, and WebKit's status.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Chrome high-level evaluation sandbox could not expose ordinary page globals for capability detection | 3 | Read the documented tab CDP capability and run one read-only `Runtime.evaluate` | Resolved: Chrome 150 exposes the complete expected EditContext surface |

Verification evidence:
- Chrome: named X post and original thread read in the user's signed-in Chrome;
  read-only CDP confirmed the Chrome 150 API surface.
- External owners: current W3C draft; Chrome shipping guidance; open Gecko
  implementation/shipping tracker; WebKit bug 269922 with no active plan.
- Source audit: `VISION.md`, `docs/vision/plite.md`, Plite entrypoint/claim docs,
  `packages/plite-dom/src/plugin/dom-input-runtime.ts`,
  `packages/plite-dom/src/plugin/dom-root-runtime.ts`,
  `packages/plite-react/src/components/editable.tsx`, current input/composition/
  selection workers, and the rich-text Chromium IME rows.
- Absence audit: `rg -n 'EditContext|editContext' packages/plite packages/plite-dom packages/plite-react apps/plite content/docs/plite docs/plite` found docs/research references and no package runtime adapter.
- Historical decision audit:
  `docs/plite/research/2026-06-13-editcontext-native-input-oracles/README.md`
  and its source shard match the current owner split; vendor status was refreshed.
- Mechanical gate: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-plite-editcontext-adoption.md` passed.

Final handoff prepared:
- Ownership and target API/runtime: keep `DOMInputRuntime`/editing-kernel
  authority and current backend; defer one private `plite-dom` adapter until a
  revisit trigger passes.
- Public breaks and Plate/collaboration adoption: none. No public prop, option,
  export, compatibility path, or Plate bridge.
- Applicable browser/benchmark/docs/provenance decisions: browser and behavior
  proof apply; no benchmark/release/public-issue claim. Existing research and
  selection coverage stay authoritative.
- Proof and execution risks: flat rich-text mapping, composition overlap,
  geometry, focus, and raw-device IME formatting are explicit gates.
- Execution order and user attention: do not execute now. Reopen at Slice 0
  only when the vendor/unique-bug trigger is met; then proceed projection ->
  private backend -> parity -> adoption decision.

Timeline:
- 2026-08-17T15:57:37.144Z Plite Plan created.
- 2026-08-17 Grounded the named X post in Chrome and refreshed current W3C and
  browser-vendor status before the Plite source audit.
- 2026-08-17 Read current Plite DOM/input/React/browser owners and discovered
  the existing June EditContext research verdict.
- 2026-08-17 Resolved the decision as evidence-triggered defer and prepared the
  conditional execution/proof handoff.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ready planning handoff |
| Where am I going? | User review; no runtime execution while the revisit trigger is unmet |
| What is the goal? | Resolve whether EditContext should be a Plite input backend and define the adoption/proof boundary. |
| What have I learned? | It validates Plite's current architecture, but the second-backend cost exceeds current value because Plite already covers the key cases and Safari still lacks a path. |
| What have I done? | Grounded the post, refreshed platform status, audited live owners/proof, reconciled prior research, resolved every decision row, and prepared a conditional future path. |

Open risks:
- Gecko may ship soon, so vendor status is intentionally a Slice-0 refresh
  rather than permanent doctrine.
- WebKit has no active implementation plan; the current backend cannot be
  retired on Apple platforms.
- Real candidate-window placement and IME-owned formatting still require a raw
  device/real IME lane; synthetic Playwright proof must not widen that claim.
