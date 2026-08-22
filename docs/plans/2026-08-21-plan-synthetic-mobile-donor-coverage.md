# plan synthetic mobile donor coverage

Superseded on 2026-08-21: Quill is a legacy project and contributes no
implementation or decision authority. Use
`docs/plans/2026-08-21-execute-non-quill-synthetic-mobile-coverage.md`.

Objective:
Select the best synthetic mobile proof from all remaining editor donors; done
when every candidate has a verdict and one execution-ready plan passes checks;
plan docs/plans/2026-08-21-plan-synthetic-mobile-donor-coverage.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-21-plan-synthetic-mobile-donor-coverage.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- browser

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- Every remaining configured or durably harvested editor candidate other than
  ProseKit and Meowdown has one explicit `keep`, `move`, `defer`, `reject`, or
  `gate` verdict for synthetic mobile value.
- Exactly one best synthetic addition is specified with donor evidence, current
  owner, route or fixture, setup, action, model/DOM/selection/focus assertions,
  engine scope, retry-free stability gate, and an explicit list of claims it
  cannot make without direct Appium receipts.

Verification surface:
- Candidate registry and durable harvest reports under `docs/editor-audits` and
  `docs/editor-test-harvester`, refreshed against local donor commit cursors.
- Current Plite browser/mobile owners in `packages/browser`, `packages/plite-*`,
  `apps/plite`, and the smallest Plate media owner only when a candidate needs
  product UI.
- Planning-only source audits, exact browser execution commands for the chosen
  addition, and final `check-complete.mjs`.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Synthetic proof may claim event routing, DOM/model selection, focus owner,
  mutation count, and follow-up input only where observable. It may not claim
  Safari on iPhone/iPad, software-keyboard suppression, native handles,
  clipboard, IME, or other real-device behavior.
- Preserve the direct-Appium gate. Do not add product runtime code from a green
  or red synthetic case without a separate owner-level reproduction.
- Do not commit, push, open a PR, or implement the chosen test in this planning
  goal.

Boundaries:
- In scope: the six remaining named candidates in Editor Test Harvester:
  Lexical, ProseMirror, CodeMirror, Tiptap, Monaco, and Quill. Portable Text,
  Slate, Wordgard, and Yjs Collaboration are supporting negative controls
  because durable local harvests already exist. ProseKit and Meowdown are
  excluded because their accepted packets are already closed.
- CKEditor5 and TinyMCE scratch reports, Milkdown, Remirror, and arbitrary
  sibling clones are not part of the named-candidate closure. Their existence
  cannot silently expand this plan into another comprehensive harvest.
- Candidate behaviors include touch, pointer, mobile viewport, non-editable
  content, focus, selection, virtual-keyboard proxies, viewport changes,
  clipboard formats, IME, and browser input ordering.
- Source owners: `packages/browser`, `packages/plite-dom`,
  `packages/plite-react`, `apps/plite`, and their exact tests/fixtures.
- Non-goals: exhaustive architecture comparison, donor implementation ports,
  performance work, Windows CI design, high-run Markdown fuzz, hybrid Markdown
  product design, non-React adapters, and real-device execution while physical
  devices are unavailable.
- Direct Plate adoption owner: `packages/media` only if the winning case is a
  media-preview product behavior. Collaboration adoption is N/A because no
  collaboration behavior is in scope.

Output budget strategy:
- Inventory candidate directories and report headings first. Read only
  decision rows matching touch, pointer, mobile, focus, selection, viewport,
  keyboard, clipboard, IME, or non-editable content. Cap searches, exclude
  generated output, logs, build artifacts, `node_modules`, `.next`, `.turbo`,
  and donor-wide source dumps. Reopen exact donor files only when a report row
  is stale or lacks enough detail to choose the synthetic case.

Blocked condition:
- Block only if candidate ownership or source revision cannot be resolved from
  the local registry/reports and donor checkout after three distinct focused
  checks. Offline physical devices do not block this synthetic planning goal.

Plite Plan state:
- status: complete
- phase: prove-and-handoff
- next: user-review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Audit all other editor candidates, choose the best synthetic addition until real-device testing is available, plan only, and preserve the raw-device claim boundary. |
| Active goal and plan verified | yes | Active goal names this exact plan and requires one verdict per candidate plus one execution-ready synthetic plan. |
| Current owners read | yes | Read `packages/plite-dom/src/plugin/{host-codec,dom-clipboard-runtime}.ts`, `packages/plite-react/src/editable/{keyboard-input-strategy,composition-state}.ts`, the raw-mobile receipt owner, the plaintext example, and its browser tests. |
| Best API target resolved | no | N/A: target is browser proof only. Any discovered reusable runtime or public API need leaves this plan and routes through `best-api` before implementation. |
| Mode and execution boundary resolved | yes | Standard agent-led plan hardening; stop after a ready plan and wait for explicit acceptance before implementation. |
| Browser pack selected | yes | Synthetic browser behavior is the sole proposed executable change, so the browser pack is materialized. |
| Browser route / app surface identified | yes | Existing `/examples/plite/plaintext`; package proof lives in `packages/plite-dom/test/host-codec.test.ts`, mounted proof in `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts`. No new route is needed. |
| Browser tool decision recorded | yes | Use repository Playwright proof for synthetic pointer/touch dispatch and Browser for final visible route/focus/console inspection; Chrome/Computer are N/A unless native Chrome/OS UI becomes part of the chosen case. |
| Console/network caveat policy recorded | yes | Final execution must assert no unexpected console error. Network is N/A unless the chosen route loads remote media. |
| Observable browser case captured | yes | Case `synthetic-uri-list-only-paste` is specified below with Quill refs, exact payload, route, assertions, project scope, bad ref `0231a088c40911aa9a3dc41978d00a6fd41ff76f`, current fingerprints, and final fingerprint requirements. It remains `needs-repro` until execution records the expected red. |

Work Checklist:
- [x] Skill analysis, objective, mode, scope, claim boundary, and output budget
      are recorded before broad exploration.
- [x] Inventory every remaining configured or durably harvested editor donor,
      record its current cursor, and classify missing/stale harvest coverage.
- [x] Extract and deduplicate every synthetic mobile-relevant donor behavior.
- [x] Give each donor candidate one owner, proof boundary, risk, and verdict.
- [x] Select exactly one best synthetic addition and reject the strongest
      alternative with source evidence.
- [x] Specify the exact route/setup/target/action/outcome, observable fields,
      supported engines, narrow skips, and raw-device claims excluded.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every planning-readiness condition | Candidate accounting, winner, exact case, owner, slices, proof, claim boundary, and stop conditions are complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Local donor heads, exact Quill source/test, Plite host codecs, browser case, raw receipt registry, and device availability were read on 2026-08-21. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | No public call shape changes. Keep `text/uri-list` as an internal built-in host-codec fallback; reject a public normalizer or new browser-harness method. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/Benchmark/provenance work or give one scoped N/A reason | Browser execution is fully specified. Benchmark, public docs, collaboration, and release workflow changes do not apply. A patch changeset for `@platejs/plite-dom` does apply during execution. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Source hashes, bad ref, red-first test, focused commands, 5/5 projects, strict Plite checks, Browser inspection, and final fingerprints are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section is complete. |
| P1 autoreview | no | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Planning-only N/A. The accepted execution ends with one P1 `autoreview` invocation. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-plan-synthetic-mobile-donor-coverage.md` | Passed on 2026-08-21. |
| Browser interaction proof | no | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Planning-only N/A. Execution must use repository Playwright for the synthetic event and Browser for final visible text/focus/console inspection. |
| Browser console/network check | no | Record console/network state or why it is not applicable | Planning-only N/A. Execution asserts no console error and no request/navigation to either inserted URL. |
| Browser final proof artifact | no | Record screenshot/trace/route/native proof or exact caveat | Planning-only N/A. Execution records the focused Playwright reports and one Browser screenshot of the final two-line text state; it is not device proof. |
| Exact case replay | no | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Planning-only N/A; exact execution case is `synthetic-uri-list-only-paste` below and begins red on the accepted tree. |
| Final ref and fingerprints | no | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Planning-only N/A; exact files and current hashes are listed below for final replacement. |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | Planning-only N/A. An uncommitted execution result may be called a local candidate only. |
| Retry-free stability | no | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Planning-only N/A. Execution requires 5/5 in Chromium, Pixel-5 mobile Chromium, and desktop WebKit, all with retries disabled. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Named candidate set, supporting negative controls, current donor cursors, Plite owners, raw-device boundary, and exact gap are recorded. | Decide |
| Decide | complete | Quill URI-list fallback wins; generic iOS key arbitration is explicitly deferred. | Prove and hand off |
| Prove and hand off | complete | Red-first slices, browser case, commands, stability, fingerprints, and handoff are ready. | User review |

Decision brief:
- outcome: Adopt Quill's URI-list-only paste invariant as the single best
  synthetic mobile addition.
- chosen shape: Add an internal `text/uri-list` fallback host codec in
  `@platejs/plite-dom`. It normalizes URI-list transport into the existing
  plain-text `ContentSlice` path. `text/plain`, registered product codecs, and
  exact Plite fragments keep their current higher priority. No public API,
  route, schema, or device-proof contract changes.
- strongest rejected alternative: Do not broaden Plite's iOS Enter/Backspace
  keydown-to-native arbitration from synthetic evidence. Lexical,
  ProseMirror, CodeMirror, and Wordgard all provide useful pressure, but their
  value depends on real event order and software-keyboard state. Plite's
  current selector explicitly requires raw-device evidence for broader mobile
  routing.
- consequence: The fast lane proves that a URI-list-only clipboard payload is
  parsed once and inserted coherently in package and mounted-browser tests.
  It still cannot claim that an iOS share sheet exposes that payload, that
  Safari grants native clipboard access, or that a software keyboard behaves
  correctly.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lexical | Current durable report at `dd5c41b`; iOS key pass-through, Korean target ranges, and synthetic table touch are indexed. Plite already has iOS Korean Backspace arbitration plus broad target-range package/browser proof. | Keep current Plite input proof; do not import Lexical table-selection policy. | `packages/plite-react`; Plate Table for any whole-table touch policy | The remaining table row depends on a selection model Plite does not own, and several donor assertions only prove no throw. | none | Existing keyboard, selection-reconciler, plaintext, rich-text, and table rows; raw table touch remains Appium-only | Calling a pointer polyfill mobile proof would overstate it. | keep-covered |
| ProseMirror | Durable multi-repo report plus current `prosemirror-view` at `ca4c78e9`; source lets iOS Enter mutate natively before translating it back to commands. | Preserve as device-test pressure only. | `packages/plite-dom` input runtime and `packages/plite-react` keyboard strategy | The behavior is software-keyboard/event-order dependent and has no focused upstream mobile test. | none | Future raw `enter` receipt | A desktop WebKit key event cannot prove iOS keyboard state. | defer-device |
| CodeMirror | No durable report. Current dev cursor `c010426d`; view cursor `fbff59ba`. View source contains iOS pending keys, Android delayed keys, visual-viewport keyboard recovery, touch origin, and iOS selection handles; its only focused mobile test is Android-style newline after composition. | Keep source as a future device scenario catalogue; add no CodeMirror-shaped state. | Raw input, selection, and geometry owners | Source branches are useful leads but not portable tests, and CodeMirror's text-view model differs materially from Plite. | none | Existing composition proof; future Appium `enter`, `backspace`, selection, and inline-void receipts | Porting the hacks would add browser folklore without proof. | defer-device |
| Tiptap | Durable report lacks a source cursor; targeted current scan at `91c51be` found mobile focus timing and NodeView/MarkView mutation exceptions, but no focused mobile behavior test. | Keep ProseMirror-owned behavior out of raw Plite; no new test. | Plate React/plugin owners when a NodeView-like product surface exists | The code is wrapper/product policy and mostly inherits ProseMirror behavior. | none | Existing Plite focus/mutation/browser contracts | Treating wrapper guards as a raw invariant would duplicate ownership. | reject |
| Monaco | No durable report. Current wrapper cursor `7374dcb4` only imports `iPadShowKeyboard` from `monaco-editor-core`; the owning core source/test is absent from this checkout. | Do not infer a Plite behavior from an import-only wrapper. | Future Monaco-core harvest | There is no local owning implementation or portable test to evaluate. | none | A future current-source `monaco-editor-core` harvest | Import names are not behavior evidence. | gate |
| Quill | No durable report. Current cursor `539cbffd`; BSD-3-Clause. `clipboard.spec.ts` has an exact URI-list-only iOS share-sheet case, and `clipboard.ts` gives plain/HTML precedence, strips comment lines, and joins URI lines as text. Plite has no `text/uri-list` clipboard codec. | Add one internal URI-list fallback through Plite's existing plain-text `ContentSlice` parser. | `packages/plite-dom/src/plugin/host-codec.ts` | This is deterministic transport behavior, not a device heuristic. It is useful on any host that supplies the standard MIME format. | package unit plus existing plaintext route | Red unit; Chromium/mobile/WebKit synthetic ClipboardEvent; strict Plite checks | Wrong codec order could override plain text or product codecs; URL interpretation could accidentally become product policy. | adopt |
| Portable Text | Durable report, targeted current cursor `ad2a52d1`; mobile value is Android input-manager and IME transport already mapped to current Plite. | Keep current proof. | `packages/plite-react` | No distinct remaining synthetic mobile invariant. | none | Existing Android/composition contracts and browser IME rows | Synthetic IME is not raw IME. | keep-covered |
| Slate | Current durable report at `ec793483`; current mobile rows remain raw-device gates. PR #6084's native insert no-op is a separate desktop browser repro, not this mobile addition. | Do not bundle #6084 or deep-equality work here. | Separate Regression/Plite packet | It does not improve the selected mobile clipboard gap. | none | Report ledger and future exact repro | Bundling unrelated browser work hides the one-case proof boundary. | defer |
| Wordgard | Current durable report at `c715d4de`; source makes iOS/Android Enter and Backspace native-first, but the test tree does not prove that arbitration. | Keep as raw-device pressure only. | Plite input runtime | Same device-dependent alternative as ProseMirror/CodeMirror. | none | Future raw `enter` and `backspace` receipts | Synthetic success could select the wrong runtime owner. | defer-device |
| Yjs Collaboration | Durable aggregate report; no touch, keyboard, focus, clipboard, or viewport invariant relevant to this plan. | No mobile test. | Collaboration owner | Out of scope by behavior, not by lack of effort. | none | N/A | Adding collaboration here would be pure scope creep. | reject-not-applicable |

Candidate cursor and harvest accounting:

| Candidate cohort | Local cursor | Harvest state used for this decision |
| --- | --- | --- |
| Lexical | `dd5c41b13193efa9ab1574234d8593d2c9e4f988` | Durable current report, inventory, and test index. |
| ProseMirror | meta `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`; view `ca4c78e9b56f1b164c0b3758b59d8748f11b7534` | Durable multi-repo report plus targeted current view scan. |
| CodeMirror | dev `c010426d06689a7115aa9df08425126b6d3ead2f`; view `fbff59ba004d80d8c914f64c42586387b08706ac` | Missing durable report; targeted current source/test scan only. This plan does not claim full CodeMirror harvest closure. |
| Tiptap | `91c51be53c4655ef07e29ec489471524debfa0ca` | Durable 2026-05-10 report without a cursor, refreshed only for the scoped mobile source/test paths. |
| Monaco | `7374dcb41a787a63d5885a5be5e6bbc2e6bc338c` | Missing durable report; wrapper source/test inventory inspected. Core behavior remains gated. |
| Quill | `539cbffd0a13b18e9c65eb84dd35e6596e403158` | Missing durable report; 55-file test inventory plus exact clipboard source/test and BSD license inspected. No whole-repo closure claim. |
| Supporting reports | Portable Text `ad2a52d1`; Slate `ec793483`; Wordgard `c715d4de`; Yjs `da052300` | Used only as negative controls for already-mapped or irrelevant mobile families. |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Exact red | `packages/plite-dom/test/host-codec.test.ts` | Add `text/uri-list`-only cases: CRLF, comment removal, two URI lines, comment-only no-op, `text/plain` precedence, and a registered URI-list codec overriding the built-in fallback. | Accepted plan; no runtime edits. | Current source fails URI-only insertion while all negative controls are explicit. | `pnpm --filter @platejs/plite-dom exec bun test --preload ../../config/plite-source-test-setup.ts test/host-codec.test.ts` |
| 2. Internal fallback | `packages/plite-dom/src/plugin/host-codec.ts` | Reuse one internal plain-text slice parser from both codecs. Add built-in `text/uri-list` after product codecs and after `text/plain` in effective priority. Normalize line endings, discard comment/empty lines, preserve URI order and bytes, and return `null` when nothing remains. Never validate, fetch, navigate, or create links. | Slice 1 is red for the exact absence. | Unit matrix green; no export/public type changes; existing plain/custom codec order unchanged. | Focused unit, `pnpm turbo typecheck --filter=./packages/plite-dom` |
| 3. Mounted synthetic case | `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts` | Add `synthetic-uri-list-only-paste` on existing route. Inline a realm-native `DataTransfer`/`ClipboardEvent`; add no reusable browser helper or fixture route. | Package behavior is green. | Chromium, mobile Pixel-5 Chromium, and desktop WebKit show the exact model/DOM/selection/focus/follow-up state. Firefox has the existing narrow synthetic-clipboard skip. | Focused per-project commands below, retries zero. |
| 4. Package handoff | `@platejs/plite-dom` | Add one patch changeset; no docs, barrel, template, registry, migration, or public API edits. Run lint, affected and strict Plite checks, then one P1 autoreview. | Focused proof is green. | All checks green or a concrete unrelated blocker is reported; no P1 finding remains. | `pnpm lint:fix`; `pnpm check:plite:dev`; `pnpm check:plite`; P1 `autoreview` |
| 5. Future direct-device receipt | Existing raw-mobile runner | When physical devices are online, exercise the iOS half of existing `native-clipboard` with the URI-list-only payload and capture the normal receipt fields. Do not add a synthetic receipt or a new scenario ID. | Direct iOS Safari/Appium lane available. | Raw receipt proves actual payload exposure and insertion on the real device. | `bun test:mobile-device-proof:raw` and receipt readback |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Plite currently lacks URI-list fallback | Only the default `text/plain` host codec exists in `host-codec.ts`; repository search finds no clipboard `text/uri-list` handler. | Slice 1 must fail URI-only insertion before runtime edits. | needs-repro |
| URI-list transport becomes plain text without product policy | Quill source/test; Plite host-codec owner already turns host text into schema-valid `ContentSlice` values. | Unit asserts two blocks, comments absent, comment-only no-op, no link nodes, no URL fetch. | planned |
| Existing priorities stay intact | Current compiled codecs reverse configuration order and plain text is the final fallback. | Unit asserts registered codec > plain text > URI list, and exact Plite fragment remains first in `insertDOMData`. | planned |
| Mounted paste is one coherent semantic edit | Existing plaintext synthetic paste route and kernel trace owner. | One `paste`/`insert-data` trace, no repair fallback, exact block/model/DOM text, collapsed model/native selection, editor focus, and follow-up `!` at the second URI. | planned |
| Synthetic engine scope is honest | Current projects are Chromium, Pixel-5 mobile Chromium, Firefox, and desktop WebKit. Firefox already blocks script-populated ClipboardEvent data. | One pass plus 5/5 retry-free in Chromium, mobile, and WebKit; exact Firefox skip remains narrow. | planned |
| Raw iOS remains unproved | Receipt file is absent; physical iPhone and iPad are offline; Appium receipts require direct real-device identity/artifacts. | Existing direct-Appium `native-clipboard` receipt on iOS Safari. | hardware-gated |

Focused browser commands for Slice 3:

```bash
pnpm --filter plite test:plite-browser:project chromium donor/examples/plaintext.test.ts --grep 'imports URI-list-only clipboard data'
pnpm --filter plite test:plite-browser:project mobile donor/examples/plaintext.test.ts --grep 'imports URI-list-only clipboard data'
pnpm --filter plite test:plite-browser:project webkit donor/examples/plaintext.test.ts --grep 'imports URI-list-only clipboard data'
```

Run each command five times with retries disabled for the final focus and
selection stability ledger. The Firefox project is not reported green from a
proxy; it stays skipped because Firefox blocks the synthetic clipboard payload.

Observable browser case `synthetic-uri-list-only-paste`:

- Donor refs:
  `../quill/packages/quill/src/modules/clipboard.ts:184-210` and
  `../quill/packages/quill/test/unit/modules/clipboard.spec.ts:80-105`.
- Route: `/examples/plite/plaintext`.
- Setup: open a fresh page, install the existing render/runtime error recorder,
  focus the editable, and select its initial paragraph.
- Target: the mounted editable root.
- Action: dispatch one realm-native cancelable `paste` with only
  `text/uri-list` equal to
  `https://example.com\r\n# Comment\r\nhttps://example.com/a\r\n`.
  Do not set `text/plain`, `text/html`, or a Plite fragment.
- Expected result: the paste is handled; block texts are exactly
  `['https://example.com', 'https://example.com/a']`; model and DOM agree; the
  semantic and native selections are collapsed at `[1,0]` offset `21`; focus
  owner is the editor; exactly one paste insertion is traced; no repair insert
  occurs; typing `!` produces `https://example.com/a!` at offset `22`; there is
  no runtime/console error and no request or navigation to either URL.
- Supported scope: Chromium, Playwright's Pixel-5 mobile Chromium project, and
  desktop WebKit. This is browser-engine/event-routing proof only.
- Excluded claims: iPhone/iPad Safari, actual iOS share-sheet payload exposure,
  native clipboard permission, native paste menu, software keyboard, selection
  handles, IME, Android hardware, and Appium receipt completeness.
- Bad ref: `0231a088c40911aa9a3dc41978d00a6fd41ff76f` with no exact red test yet,
  therefore `needs-repro`, not a fixed/completed bug claim.
- Current fingerprints:
  `host-codec.ts` `cfb4ed1a...`, `host-codec.test.ts` `5b6ef193...`,
  `plaintext.test.ts` `a64e5169...`, plaintext route `9bb9ea14...`, and
  Playwright config `88b8621d...`. Execution records full final SHA-256 values
  for those five files plus the patch changeset; any later change invalidates
  the replay.

Conditional evidence:
- High-risk scenarios: codec priority regression, comment-only accidental empty
  insertion, multiple semantic updates, stale or divergent DOM selection,
  focus loss, product autolink leakage, and accidental URL navigation. Each has
  a named negative assertion above.
- External research: N/A. Local donor source, tests, license files, durable
  reports, and current Plite owners are sufficient. No web claim selects the
  result.
- Issue/PR provenance: Quill's exact case has no issue pointer in the checked
  source. Slate PR #6084 is explicitly rejected from this packet. No public
  tracker mutation applies.
- Browser/Benchmark/docs/release/behavior-law owners: Browser applies exactly
  as specified. Benchmark is N/A because no performance claim or hot path is
  selected. Public docs are N/A because no public call shape or configurable
  policy changes. Release workflow is N/A, but a patch changeset for
  `@platejs/plite-dom` is mandatory during execution. The raw mobile receipt
  law stays unchanged.

Findings:
- The named six-candidate set contains three kinds of mobile evidence:
  deterministic transports, synthetic browser mechanics, and device-dependent
  native behavior. Only the first can support a runtime change without a real
  device.
- Quill is the only remaining named candidate with an exact, portable,
  currently missing deterministic transport test: URI-list-only paste from an
  iOS share-sheet-shaped payload.
- Lexical already supplied most of Plite's useful synthetic input pressure:
  target ranges, Korean composition, and iOS Backspace arbitration contracts.
  Its remaining table touch case is Plate-owned and weaker than the mounted
  Plite proof standard.
- ProseMirror, CodeMirror, and Wordgard converge on native-first mobile
  Enter/Backspace handling. That convergence makes the future Appium test more
  important, not less. It does not make a desktop synthetic event authoritative.
- Tiptap's mobile guards are wrapper-level focus and mutation rules without a
  focused mobile test. Monaco's named iPad feature is import-only in the local
  wrapper repository. Neither can beat a directly tested transport invariant.
- Quill also has a source-only Android/Gboard composition-start guard. Plite
  already routes Android composition start through its Android manager and
  avoids generic predelete, so it is a useful future mounted row but not the
  best uncovered addition.
- `test-results/release-proof/mobile-device-proof.json` is absent. The physical
  iPhone and iPad are offline. Installed drivers do not turn a synthetic test
  into direct-device proof.

Decisions and tradeoffs:
- Put the behavior in the DOM host-codec owner, not React, Plate media, the
  browser test package, or a product paste plugin.
- Reuse the existing plain-text slice constructor. Do not duplicate schema,
  selection, mark, void, or multiline insertion policy in a URI parser.
- Preserve priority: exact Plite fragment and registered codecs keep their
  current authority; `text/plain` beats `text/uri-list`; URI list is last.
- Treat URI lines as text. Do not validate schemes, construct links, fetch
  URLs, or teach autolink policy in raw Plite.
- Keep the browser event inline in one test. A generic arbitrary-MIME browser
  helper is speculative for one row.
- Do not edit the raw-mobile scenario registry. The existing
  `native-clipboard` receipt owns later real-device confirmation.
- No public break, bridge, alias, migration, barrel, template, registry, docs,
  or collaboration adoption exists.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:
- Candidate source and report audit completed on 2026-08-21.
- Current Plate ref:
  `0231a088c40911aa9a3dc41978d00a6fd41ff76f`.
- Current Plite clipboard search found no behavior-level `text/uri-list`
  handler. The only repository hit outside the donor is a media MIME database.
- Quill donor source and exact test hashes:
  `clipboard.ts` `8fbfe21f48663f9ec278cceda802f16c5a1629b28027c683c1b7992c02e5c196`;
  `clipboard.spec.ts`
  `5a3fb12dbe21107286e713c318e01476f08d7bc0537c1359019d373aeceef809`.
- The raw receipt is absent and `xcrun xctrace list devices` reports the two
  physical iOS devices offline. This plan therefore makes no raw-iOS claim.
- Planning did not edit package/runtime/test code or run a green proxy.

Final handoff prepared:
- Ownership and target API/runtime: internal `@platejs/plite-dom` host-codec
  fallback; existing public clipboard API and route stay unchanged.
- Public breaks and Plate/collaboration adoption: none. No best-api repair,
  Plate media change, collaboration change, or migration.
- Applicable browser/Benchmark/docs/provenance decisions: focused package and
  Chromium/mobile/WebKit browser proof applies; Browser final inspection
  applies; Benchmark, public docs, and public issue updates do not.
- Proof and execution risks: priority, no-op, duplicate update, selection,
  focus, URL-navigation, engine skip, and raw-device overclaim are all gated.
- Execution order and user attention: accept this exact plan, then red unit,
  internal fallback, mounted case, changeset/checks/P1 review. Real-device
  `native-clipboard` proof remains a later hardware gate.

Timeline:
- 2026-08-21T16:54:32.870Z Plite Plan created.
- 2026-08-21 Audited the six remaining named Editor Test Harvester candidates
  at their local cursors and used four durable harvests as negative controls.
- 2026-08-21 Rejected mobile-key arbitration as synthetic runtime authority and
  selected Quill's deterministic URI-list-only clipboard case.
- 2026-08-21 Resolved owner, behavior, route, negative controls, engine scope,
  red-first slices, strict proof, changeset, fingerprints, and raw-device stop.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Plan complete; waiting for user review. |
| Where am I going? | Execute only after explicit acceptance of this exact plan. |
| What is the goal? | Add the best honest synthetic mobile-adjacent proof while direct device testing is unavailable. |
| What have I learned? | URI-list clipboard transport is the one deterministic uncovered winner; keyboard behavior stays device-gated. |
| What have I done? | Accounted for all named candidates and produced an execution-ready one-case plan. |

Open risks:
- Firefox cannot carry script-populated ClipboardEvent data in the current
  harness. Package proof covers format parsing; do not claim Firefox mounted
  behavior from another project.
- A real iOS share sheet may expose different payload combinations or native
  permission behavior. Only the later Appium receipt can settle that.
- The execution must preserve codec priority. A URI fallback that beats
  `text/plain` or a registered product codec is wrong even if the chosen test
  turns green.
