# Editing pending deletions

Status: Completed.

Objective:
Repair typing inside proposed deletions and cover the surrounding editing/review behavior observed in Google Docs.

Goal plan:
`docs/plans/2026-09-14-retained-deletion-editing.md`

Template:
`docs/plans/templates/regression.md` (bounded case; unrelated gates omitted).

Flow mode:
one-shot execution, local changes only.

Completion threshold:
Own-author retained editing works in the suggestion demo; original accepted content survives Reject, Accept removes the deletion, and related text/structural input, history and persistence have executable proof. No claim of complete Google Docs parity.

Verification surface:
Native authored tests, mounted authored-fragment provider tests, existing suggestion browser corpus and exact Chrome demo replay. Source-first affected typechecks and lint. Regression receipts bind final source and host.

Constraints:
Use the current next checkout. No commits, push, publication, extra plugin or registry/editor coupling. Preserve other authors' ownership and read-only views. Google probes use only a new disposable document tab; original tabs remain untouched.

Boundaries:
Native authored state/projection/history owns retained amendments. React input only resolves a retained coordinate and dispatches existing semantic commands. Root owns React adapter/tests/plan; retained_typing_diagnosis owns authored internals/core bridge/native tests. No overlapping writers.

Output budget strategy:
Read exact owners and bounded logs; executable tests hold lasting behavior, this plan holds run evidence.

Blocked condition:
Missing authoritative behavior or an unavailable proof surface that cannot be resolved through current tools. Do not substitute a live-boundary insertion for interior retained editing.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Behavior authority and reproduction | yes | Live Google Docs own-deletion probes and local Chrome swallowed-input RED recorded below |
| Current user scope and source owner | yes | Current next checkout; own deletion in suggestion demo; native authored state and React/DOM coordinate owners |
| Method and goal | yes | Task, Regression, native ownership and first-principles methods read; current native goal and this canonical plan |

Work Checklist:
- [x] Observe Google behavior rather than inferring from generic suggestion documentation.
- [x] Reproduce swallowed typing in the local Chrome demo.
- [x] Establish exact mounted/native RED and pre-edit affected baselines.
- [x] Implement authored-owned retained edits without changing the original accepted document.
- [x] Route keyboard/text/paste/break commands through the correct retained coordinates.
- [x] Prove editing, review decisions, history, persistence, permissions and follow-up input.
- [x] Replay existing suggestion browser corpus and fresh final Chrome route.
- [x] Complete affected checks, release note, doctrine/teaching changes if needed, and final receipts.

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Selected input and affected corpus | yes | 349 native, 112 React/DOM, 13 exact Chrome cases and 15 repeated journeys pass; source-bound receipts below |
| Original acceptance and scope | yes | Own-deletion input, original protection, decisions, history, persistence, permissions and follow-up input proved; original demo and Google tabs restored |
| Final source and delivery | yes | Source typechecks, scoped lint/format and diff checks pass; behavior docs and patch release note present; local delivery only |

Phase / pass table:
| Phase | State | Evidence | Next |
|---|---|---|---|
| Google and local reproduction | pass | Chrome observations below | exact RED |
| Native owner and DOM adoption | pass | authored amendments, protected originals, source and separate-view history/decisions | final corpus |
| Verification and closure | pass | 349 native, 112 mounted/DOM, 13 exact Chrome and 15 repeated journeys pass | complete |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---|---|---|---|---|---|---|---|---|---|---|
| retained-edit | User 2026-09-14 + Google Docs live scratch tab | Propose a word deletion; place an interior selection; type, delete, paste and Enter; undo and decide | Edits appear in the same retained deletion; accepted original remains untouched; reject restores original; accept removes entire deletion | upstream-contract: observed Google Docs own deletion; reporter: type within deleted word | e2e-required: mounted RED covers native mutation; real Chrome additionally suppresses input on noneditable content and races delayed selectionchange | runtime-modes: markup/propose + history, editable, Alice; fixture-scope: complete isolated word-deletion scenario; exact-route: /blocks/suggestion-demo | Playwright: apps/www/tests/browser/suggestion.spec.ts | completed | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | none: locally delivered |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
| retained-edit | reporter | current message | follow-up | Typing inside deleted word must work | required | model@after-action, dom-native@after-action, follow-up-input@follow-up | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#edits text inside a retained deletion without changing the accepted original | pass: native + mounted + exact Chrome typing observed |
| retained-edit | upstream | Google Docs scratch tab t.v1tro3f7a9ih | after-action | Interior X changes bravo to struck brXavo; card follows | required | model@after-action, dom-native@after-action | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#edits text inside a retained deletion without changing the accepted original | pass: observed Google behavior reproduced in owner tests |
| retained-edit | upstream | same Google probe | after-action | Paste YZ and Enter remain inside the deletion; Reject restores original bravo, Accept removes all deleted content | required | model@after-action, follow-up-input@follow-up | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#edits text inside a retained deletion without changing the accepted original | pass: observed Google behavior reproduced in owner tests |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
| retained-edit | model | after-action | yes | Same deletion id, amended retained text, unchanged accepted original | Live boundary insertion, lost original, blocked accept | package + dom | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#edits text inside a retained deletion without changing the accepted original | pass: native and mounted assertions plus pointer-first browser input |
| retained-edit | dom-native | after-action | yes | Input reaches mounted retained owner; native/view offsets continue within edited content | Swallowed input or caret mapped to live boundary | dom + browser | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#edits text inside a retained deletion without changing the accepted original | pass: native and mounted assertions plus pointer-first browser input |
| retained-edit | focus | follow-up | yes | Editor keeps focus and subsequent typing reaches retained target | Focus stolen by review card | browser + dom | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#edits text inside a retained deletion without changing the accepted original | pass: native and mounted assertions plus pointer-first browser input |
| retained-edit | pointer-feedback | after-action | no | N/A: no hover or pointer feedback change | N/A: outside this typing claim | N/A: outside this typing claim | N/A: outside this typing claim | N/A: outside this typing claim |
| retained-edit | popup | after-action | no | N/A: existing discussion open behavior is unchanged | N/A: outside this typing claim | N/A: outside this typing claim | N/A: outside this typing claim | N/A: outside this typing claim |
| retained-edit | geometry-paint | after-action | no | N/A: no new caret/paint claim; existing pixel tests replay as corpus | N/A: outside this typing claim | N/A: outside this typing claim | N/A: outside this typing claim | N/A: outside this typing claim |
| retained-edit | subscription-lifecycle | after-action | no | N/A: existing authored publication used, no new source lifecycle | N/A: outside this typing claim | N/A: outside this typing claim | N/A: outside this typing claim | N/A: outside this typing claim |
| retained-edit | runtime-errors | after-action | yes | No runtime errors during input and decisions | Exceptions, stale node lookup | dom + browser | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#edits text inside a retained deletion without changing the accepted original | pass: native and mounted assertions plus pointer-first browser input |
| retained-edit | follow-up-input | follow-up | yes | Second character, deletion, Enter, undo/redo and next edit preserve target | First input works but next input is swallowed or misplaced | dom + browser | test: packages/plitejs/test/react/authored-fragment-provider.test.tsx#edits text inside a retained deletion without changing the accepted original | pass: native and mounted assertions plus pointer-first browser input |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---|---|---|---|---|---|---|
| retained-edit | 0 | none: current native owner and command contracts retained | patch | N/A: internal authored owner repair preserves public commands | N/A: design decision recorded in Owner decision | pass: native and mounted owner regressions; both source markup and separate-view topologies |

Owner decision:
Accepted roots and deletion targets cannot be changed by retained editing: Google Reject restores the original. Reusing accepted-source edits fails that law and can block Accept. Reusing propose(changeId) targets the live proposed projection where deleted content is absent. Changing DOM editability alone does not implement canonical state, permissions or history. Extend the existing authored-owned retained projection/write context with immutable amendments in the existing state/commit/codec path; apply ordinary transforms locally to that fragment. The existing authored operation log, fragment projection and publication owners retain the state. Locality and serialization are covered by the native proof below.

The native hook applies ordinary commands to one retained fragment and records immutable amendments against the original deletion. Original atom provenance protects existing deleted characters. View input imports native retained coordinates synchronously. React observes the existing scoped fragment subscription so amended ranges update immediately.

Integration regressions found and repaired: source-owned markup must publish accepted content with accepted positions; Undo, Redo and review decisions require that same base. Enter must retain the structural identity that places the live suffix in the last retained paragraph. Amendment-only spans use their text-node boundary to resolve a live child slot. Both source and separate-view configurations have permanent tests.

Earlier prototype locality probe (25 alternating samples after 8 warmups; complete amendment + retained read + details): p50 3.00ms / p95 4.05ms with one paragraph; p50 6.51ms / p95 10.94ms with 10,000 unrelated paragraphs. Accepted children keep their array identity on every edit. This prototype measurement is historical; final performance benchmarking is outside this repair.

Google observations:
- Original retained characters resist Backspace, full-selection deletion and replacement: selecting ra in bravo and typing Q gives bQravo. Only newly inserted amendment content is removed. This correction supersedes the initial generic-deletion assumption.
- Created disposable Tab 3 in the user-authorized Google test document, preserving existing tabs.
- Editing baseline `Alpha bravo omega`; Suggesting deletion of `bravo`.
- Interior click after `br`, type X: retained `brXavo`; settled card `Delete: brXavo`.
- Select X and Backspace: retained returns to bravo, still one deletion.
- Interior paste YZ then Enter: retained `braYZ` / `vo`; settled card describes both lines.
- Reject: original single-line `Alpha bravo omega` restored; YZ and Enter disappear.
- Undo Reject restores amended retained deletion; Accept produces `Alpha  omega`.
- Both disposable probe tabs were deleted and original Tab 1/Editing mode restored; original tab contents were not changed.
- Other-author Google behavior and raw device IME are unverified; do not infer parity.

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---|---|---|---|---|---|
| retained-edit | native authored + React input | exact Chrome 152.0.7977.83 localhost:3306; exact-route: /blocks/suggestion-demo | PID89176 started 2026-09-14T09:50:09Z after final product edits; PLATE_WWW_PLITE=1 and PLATE_WWW_DEV_SOURCE=1; isolated .next-retained-typing | source app and source package tests; unchanged test harness dist included in receipt | pass: route compiled, original seed restored, complete exact Chrome corpus |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|---|---|---|---|---|---|---|
| Native authored + DOM input | retained-edit | pass: 115 native baseline; 57 provider tests; 11 Chromium journeys pass | 2026-09-14T09:59:37.855Z | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3306/blocks/suggestion-demo" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/suggestion.spec.ts" "--global-timeout" "90000" | sha256:b2ac30d2eeafa0afd4a63ee005eafd18c22bef47caf52b19891c4be9de611fe2 | pass: 13 exact Chrome journeys; 349 native and 112 mounted/DOM cases separately verified |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| retained-edit | 1 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3306/blocks/suggestion-demo" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/suggestion.spec.ts" "--global-timeout" "90000" | pass: exit 0 in 47969ms | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | sha256:b2ac30d2eeafa0afd4a63ee005eafd18c22bef47caf52b19891c4be9de611fe2 | 30 | apps/www/next.config.ts,apps/www/package.json,apps/www/playwright.config.ts,apps/www/src/registry/components/editor/discussion.tsx,apps/www/src/registry/components/editor/suggestion.tsx,apps/www/src/registry/examples/suggestion-demo.tsx,apps/www/tests/browser/suggestion.spec.ts,packages/plitejs/src/authored/authored.ts,packages/plitejs/src/authored/decisions.ts,packages/plitejs/src/authored/markup.ts,packages/plitejs/src/authored/read.ts,packages/plitejs/src/authored/render.ts,packages/plitejs/src/authored/retained.ts,packages/plitejs/src/authored/state.ts,packages/plitejs/src/core/authored-runtime.ts,packages/plitejs/src/dom/plugin/dom-editor.ts,packages/plitejs/src/dom/plugin/dom-fragment-view.ts,packages/plitejs/src/dom/utils/dom.ts,packages/plitejs/src/react/components/editable-text-blocks.tsx,packages/plitejs/src/react/editable/mutation-controller.ts,packages/plitejs/src/react/editable/mutation-history.ts,packages/plitejs/src/react/editable/selection-controller.ts,packages/plitejs/src/react/view-selection.ts,packages/plitejs/test/authored-fragment-index-contract.test.ts,packages/plitejs/test/authored-retained-edit-contract.test.ts,packages/plitejs/test/react/authored-fragment-provider.test.tsx,packages/test/dist/playwright/index.js,packages/test/src/playwright/harness.ts,packages/test/src/playwright/ready.ts,packages/test/src/playwright/runtime-errors.ts | pid:89176;started:2026-09-14T09:50:09.000Z;base-url:http://localhost:3306/blocks/suggestion-demo;browser:exact-chrome;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 152.0.7977.83 | 2026-09-14T09:59:37.855Z | 2026-09-14T10:02:46.616Z | 2026-09-14T10:03:34.587Z | 0 | sha256:bf87ee5842edbb8ad05c79f585332f0581f6514884111dba34e7a38193b914f5 |

| retained-edit | 1 | completed | "env" "PLAYWRIGHT_BASE_URL=http://localhost:3306/blocks/suggestion-demo" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/suggestion.spec.ts" "--global-timeout" "90000" "--grep" "types inside a deleted word\u007cpaints one caret" "--repeat-each" "5" | pass: exit 0 in 36653ms | dirty:5a899edcbea2c31f1bd34dc575c9dd3860c577d0 | sha256:b2ac30d2eeafa0afd4a63ee005eafd18c22bef47caf52b19891c4be9de611fe2 | 30 | apps/www/next.config.ts,apps/www/package.json,apps/www/playwright.config.ts,apps/www/src/registry/components/editor/discussion.tsx,apps/www/src/registry/components/editor/suggestion.tsx,apps/www/src/registry/examples/suggestion-demo.tsx,apps/www/tests/browser/suggestion.spec.ts,packages/plitejs/src/authored/authored.ts,packages/plitejs/src/authored/decisions.ts,packages/plitejs/src/authored/markup.ts,packages/plitejs/src/authored/read.ts,packages/plitejs/src/authored/render.ts,packages/plitejs/src/authored/retained.ts,packages/plitejs/src/authored/state.ts,packages/plitejs/src/core/authored-runtime.ts,packages/plitejs/src/dom/plugin/dom-editor.ts,packages/plitejs/src/dom/plugin/dom-fragment-view.ts,packages/plitejs/src/dom/utils/dom.ts,packages/plitejs/src/react/components/editable-text-blocks.tsx,packages/plitejs/src/react/editable/mutation-controller.ts,packages/plitejs/src/react/editable/mutation-history.ts,packages/plitejs/src/react/editable/selection-controller.ts,packages/plitejs/src/react/view-selection.ts,packages/plitejs/test/authored-fragment-index-contract.test.ts,packages/plitejs/test/authored-retained-edit-contract.test.ts,packages/plitejs/test/react/authored-fragment-provider.test.tsx,packages/test/dist/playwright/index.js,packages/test/src/playwright/harness.ts,packages/test/src/playwright/ready.ts,packages/test/src/playwright/runtime-errors.ts | pid:89176;started:2026-09-14T09:50:09.000Z;base-url:http://localhost:3306/blocks/suggestion-demo;browser:exact-chrome;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 152.0.7977.83 | 2026-09-14T09:59:37.855Z | 2026-09-14T10:04:59.767Z | 2026-09-14T10:05:36.421Z | 0 | sha256:58a1bc4151c0575b5eca6d6e6d473b35a935105b37543eb6620a664a5738ccb2 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|---|---|---|---|---|
| mounted retained input | expected brXavo, received bravo | intended RED | native amendment + input owner repair | pass: 59 provider cases in final 112-case React/DOM run |
| source markup history/review | corrupt offsets, missed child slot, unavailable Accept | integration coverage gap | accepted publication base and retained structural mapping | pass: full sequence plus both decision round trips, both editor configurations |
| caret geometry after arrows | immediate sample preceded paint; first arrow frame dx0 | premature test oracle | capture exact first arrow frame from keydown; strict 1px and pixel controls preserved | pass: full 13 exact Chrome and four focused repeats |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---|---|---|---|---|---|---|---|---|---|
| none | 0 | N/A: new input case | N/A: expected RED | N/A: no interior editing claim existed | N/A: expected RED | N/A: no failed fix | N/A: no repeated failure | N/A: owner design above | N/A: no failed fix |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---|---|---|---|---|---|
| retained-edit | native and mounted owner tests | agents authored/core/render; root React/mounted tests and browser coverage | source tests + 5 repeats each for both review paths and caret | pass: 349 native and 112 React/DOM; both source/view topologies; worker findings consumed | completed |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---|---|---|---|---|---|
| retained-edit | exact Chrome 152.0.7977.83 on localhost:3306 | 5 per path | pass: 5 Accept, 5 Reject, 5 first-frame caret journeys; 15/15 total | 0 | completed |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|---|---|---|---|---|---|
| retained-edit | pass: 349 native, 112 React/DOM, 13 exact Chrome + 15 repeat journeys | completed | own-author deletion input and review behavior observed in Google Docs | Other-author Google/physical IME/mobile/network behavior outside proof | none: locally delivered |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|---|---|---|---|---|---|
| retained-edit | prior tests covered caret movement and live-boundary restoration, not interior input | no-change | current method correctly requires exact input and accepted-source/retained distinction | new mounted case | untested behavior identified; prior caret claims remain separately covered |

Verification evidence:
- Native authored suite: 349 cases across 19 files pass; `/tmp/retained-native-accept-final-suite.log`.
- Mounted/provider, DOM coordinate, selection/controller and history corpus: 112 cases across 6 files pass; `/tmp/retained-root-final-react-suite.log`.
- Authored, React and DOM source typechecks pass. Scoped formatting, lint and diff checks pass; `/tmp/retained-final-lint.log`.
- Pointer-first Chrome typing, Backspace, Undo/Redo, Enter + next character, and Reject replayed manually on `/blocks/suggestion-demo`; original paragraph restored.
- Full exact Chrome corpus: 13/13 pass, retries 0; `/tmp/retained-final-browser-corpus.log`. The first full command hung during browser-worker shutdown after all 13 assertions passed; that log is preserved at `/tmp/retained-final-browser-corpus-teardown-hang.log`. A fresh complete run with a 90-second overall bound exited 0 in 47.3s.
- Release note `.changeset/plite-retained-editing.md` and concise behavior reference in `content/docs/(plugins)/(collaboration)/suggestion.mdx`. No public API or durable doctrine change; no registry source/generated output change.
- Final stability: 15/15 pass, retries 0 (five runs each of Accept, Reject and caret); `/tmp/retained-final-browser-stability.log`.
- Exact first-arrow-frame trace showed 0px drift; the earlier immediate DOM sample preceded paint. The permanent caret test captures the first frame directly from keydown, preserving strict alignment and single-caret pixel controls. `/tmp/retained-caret-frame-diagnostic.log` and `/tmp/retained-caret-first-frame-final.log` preserve diagnosis and four passing repeats.

Reboot status:
Completed; no required work remains for the selected own-deletion editing repair. Demo available at http://localhost:3306/blocks/suggestion-demo with its original seed restored.

Open risks:
Live Google Docs probes cover own-author deletions. Other-author Google behavior, physical IME, mobile and network-parity remain outside this proof. Native tests verify denied cross-author writes and same-author replica convergence.
