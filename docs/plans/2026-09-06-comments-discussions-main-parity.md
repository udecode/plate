# Comments and Discussions UX parity with main

The local audit repaired three regressions and retained two improvements. The
public example again presents a normal mixed review document; formatting and
block-deletion cards describe the actual change. Discussion actions work with
keyboard and touch input, and annotations remain reachable in every covered
block. No confirmed Comments/Discussion regression remains in the audited
flows. Nothing was committed, pushed or published.

Objective:
Complete one Improve audit of Comments against main, preserve or improve the
scoped UI and UX contracts, and prove that Comments and Suggestions work
together through Discussions.

Completion threshold:
Every scoped owner, consumer and comparison scenario has an evidence-backed
disposition. Confirmed defects are repaired and the affected package, website,
visual, type and registry checks pass on the final source.

Verification surface:
Pinned main source and its exact deployed build, current authored source,
package and mounted tests, real website scenarios, native browser interactions,
desktop and 390px screenshots, and source-bound receipts.

Constraints:
Preserve editor selection, history, native input, permission and data ownership.
Work locally in the current `next` checkout. No publication, external messages,
other checkout or parallel agents are authorized. Main establishes useful user
jobs; its legacy editor internals are not the implementation target.

Boundaries:
Comments, Suggestions, shared Discussion presentation, their consumers and
teaching, and the affected audits opened by Improve. This is not a whole-site
pixel match or a release-quality certification of every editor feature.

Blocked condition:
Missing baseline access or required proof capability prevents all remaining
useful work. No such blocker remains for this scope. The separate root lint
result below is not a Comments defect or a claim of whole-project health.

Budget:
One complete iteration, without a time or token budget. The existing native goal
uses this plan.

Work Checklist:
- [x] Pin main source and the successful deployment that serves it.
- [x] Inventory and disposition all baseline owners and current consumers.
- [x] Refresh the complete expanded docs and registry source audits.
- [x] Challenge owner deletion before accepting the implementation target.
- [x] Compare the public mixed document at desktop and 390px widths.
- [x] Prove comment, suggestion, grouping, history and source-lifetime behavior.
- [x] Repair the confirmed UI regressions and retain proved improvements.
- [x] Verify current package, browser, native, type and registry inputs.
- [x] Reconcile final fingerprints, findings and bounded proof limitations.
- [x] Finish the completion record and reconcile the existing goal obligations.

Findings and decisions:

| Priority | Finding | Final behavior and proof |
| --- | --- | --- |
| P2 | The public Discussion demo exposed anchor-failure controls and separate proof editors, losing main's ordinary mixed review example and full toolbar. | The public route uses the canonical EditorKit with two threads, their replies, and three suggestions in one paragraph. The existing failure, static and reviewer scenarios live in the development-only `/blocks/discussion-proof` fixture and keep their executable tests. Desktop and 390px main/candidate cases pass. |
| P2 | Formatting suggestion cards omitted removed properties and affected text. | Cards describe removals and additions together with the text. Structured property values remain readable. The mounted red case reports `Update: italic`; the final case requires `Remove bold`, `Add italic` and `Revised emphasis`. Multiline summaries use one text paragraph, avoiding duplicate row keys. |
| P2 | A deleted block could be summarized only as `Paragraph`. | Reviewers see the block's actual content, with the block label reserved for empty content and line breaks kept distinct. The red case misses `Retire the obsolete paragraph.`; the final mounted case passes. |
| P2 | Comment and suggestion action buttons were skipped by keyboard navigation and depended on hover. This also affected main. | Controls retain the quiet hover appearance, reveal on focus within their card, and remain visible on devices without hover. Native Tab/Shift+Tab, menu activation, acceptance and touch-emulated taps pass. |
| P2 | A comment or suggestion spanning multiple blocks had only a first-block trigger. This also affected main. | The existing keyed index includes every covered comment block and every actually marked suggestion block. A suggestion spanning disjoint marked blocks does not acquire a trigger in the gap. Split-inside-comment, merge, undo/redo and external-anchor movement cases pass. |

No P0, P1 or P3 defect was established in this bounded comparison. The first
three rows are regressions against main; the last two improve both main and
the starting candidate. Red logs distinguish actual symptoms from fixture
setup and stale assertion failures.

The strongest justified cut removes proof controls from the copied public
example. It preserves their job in one development fixture that imports the
same production components. No new package, plugin, index or data store is
introduced. Comments retains editor activation and Annotation integration;
Suggestion owns document edits; the application channel owns messages and
permissions; Discussion owns the combined presentation and keyed block index.
Removing any of those owners would move an independent job into another layer.

`SuggestionReview.blockIndices` replaces its misleading first-block field.
The only production consumer is Discussion; all callers and generated registry
payloads use the new membership. The bounding range still positions the popup,
while actual marked-node membership determines suggestion block triggers.
The Best API teaching audit found no source rule, public document or other
consumer teaching the replaced field. Existing ownership doctrine already
covers this repair; no product-specific workflow rule or doctrine bump was
needed. The existing doctrine validator passes at version 158.

Runtime work remains bounded by actual annotation membership. There is one
index and one subscription path. App-only body writes still cause zero anchor
resolution and zero editor-node refreshes in the browser oracle. Keyed block
summaries retain unchanged identities. No performance speedup is claimed.

Rule coverage:

| Rule family | Governed set | Disposition | Evidence |
| --- | --- | --- | --- |
| Improve, Task, Autogoal, Poteto Mode, Show Me Your Work | Entire invocation, one plan, sequential execution, owner cuts and proof | Complete | This plan and `decisions.tsv` |
| Plate UI, Shadcn tactics, Verify Plate, Testing | Comment, Suggestion, Discussion, public demo and proof fixture | Complete | Five repaired rows; 171 owner cases; 36 website cases; native interaction |
| Best API and architecture | Source ownership, membership semantics, current consumers and lifetime | Complete | One existing index; inferred callbacks; canonical Annotation ranges; caller/source teaching audit |
| Documentation | All 309 authored MDX sources | Complete contextual audit | 308 unchanged inputs reuse prior review; the changed code-block page was reread; app docs/source parity and affected EN/CN routes pass |
| Registry | All 380 authored TypeScript sources | Complete contextual audit | 372 unchanged inputs reuse prior review; eight changed sources reread; final generation produces 367 canonical payloads and 15 overlays |
| Agent workflow | Applicable source rules, mirrors and proof discovery | Complete; no workflow edit required | Doctrine validation; existing runner ownership; development-only fixture; baseline files stored as non-executable text |
| Autoreview, release, package barrels | Current branch and change shape | Not applicable | `next` disallows structured Autoreview; no publication or package export change |
| Unrelated feature execution | Other editor features, hosting, releases, OS/device certification | Outside this request | Contextual source review does not certify every feature at runtime |

Coverage and baseline:

- Main commit: `9ec2c8efcb39b22a0f707a4a391dadf328a6de2a`, freshly fetched
  from `origin/main` when the comparison began. The successful deployment
  `6270144493`, created September 4, serves the exact pinned build at
  `https://plate-l267204gi-udecode.vercel.app`.
- [baseline.json](artifacts/comments-discussions-main-parity/baseline.json)
  inventories 84 baseline source files by owner and user job. UI owners were
  compared directly; legacy package behavior families map to the consolidated
  current package tests. Baseline sources are text snapshots, not a second
  checkout or runnable v2 test suite.
- [coverage.json](artifacts/comments-discussions-main-parity/coverage.json)
  reconciles all 689 expanded source rows: 680 unchanged inputs retain their
  prior contextual review and nine changed inputs were reread. There are no
  unlisted current MDX or registry TypeScript files in those governed sets.
- Current production consumers include the public Discussion demo, Editor AI,
  the comment toolbar, AI menu/chat adapter, editor plugin kit, static suggestion
  and media renderers. The new proof fixture is an explicit development owner.
  No Plite app runner or package consumes the moved public diagnostic controls.
- The existing full-kernel proof remains prior context. This invocation replays
  the affected package and website owners; it does not relabel prior broad
  proof as a fresh strict-Plite run.

Main-comparison matrix:

| User contract | Main evidence | Current evidence and disposition |
| --- | --- | --- |
| Normal mixed demo and full editor toolbar | Pinned `/blocks/discussion-demo`, baseline value and Discussion kit | Matched 1280px/390px browser cases; restored public example |
| Popup width, height, scrolling and unboxed cards | Main desktop/narrow screenshots and BlockDiscussion | Same 380px design bounded to viewport and half-height; browser geometry plus native scrolling |
| Author, timestamp, excerpt, body and replies | Main Comment and BlockSuggestion cards | Same useful fields; mounted metadata and rich-body cases; native reply proof |
| Comment and suggestion colors, overlap and active paint | Main comment/suggestion renderers | Browser paint/static/active oracle; matched screenshots |
| Ordered overlapping comment activation | Main marked text and first-active implementation | Current exact ordered overlap group; native click plus package/browser assertions |
| Block-caret and selected-text creation | Main comment toolbar/draft transform | Browser creation case; native `Mod+Shift+M` creates and submits a heading comment |
| Empty Enter, Shift+Enter and normal submission | Main rich comment composer | Desktop/narrow Enter cases; empty and pending drafts retained; Shift+Enter preserves a line break |
| Continued typing after reply submission | Main reply composer job | Native Enter then immediate typing retains the entire follow-up draft; browser repeats the flow |
| Edit, delete and resolve permissions | Main CommentMore and resolution handlers | Browser author actions and channel permission tests |
| Keyboard and no-hover actions | Main hover-only wrappers | Improved focus-within and no-hover behavior; native keyboard and touch-emulated cases |
| Outside click, Escape and focus return | Main popover and draft dismissal | Existing website dismissal and native Escape cases |
| Inline comment plus suggestion at one location | Main mixed paragraph and block popup | Exact clicked subset opens; accepting the suggestion preserves the range thread |
| Suggestion replies and accept/reject | Main BlockSuggestion and application records | Attached threads disappear with the suggestion and return with undo without changing resolution intent |
| Insert, remove, replacement and formatting descriptions | Main description/card code | Actual text and removed/added formatting; package and mounted summary cases |
| Block, line-break, inline-node and static suggestions | Main suggestion wrappers, transforms and static kit | Fast/slow package cases, link integration and static/HTML browser proof |
| Every annotated block has a trigger | Main first-block ownership index | Improved complete membership, with disjoint suggestion gaps excluded |
| Split, merge, move, boundary edits and history | Main transform/query behavior families | Browser interior/boundary/replace/delete cases; package range move/split/merge cases |
| Fully deleted comment remains reachable | Main thread/review job | Collapsed anchor falls back to its block trigger; repeated undo/redo restores exact range |
| Source error and recovery | Current Annotation source law; main used embedded marks | Canonical last-good projection and retry pass in the retained proof fixture |
| Independent editable, reviewer and static views | Main editable/static jobs | Distinct native sources retain their document-bound ranges after primary edits |
| AI provisional comments and suggestion review | Main review jobs plus current AI consumer | Browser AI Accept/Reject and provisional-state checks; package AI suggestion cases |
| Docs, registry and streaming consumer lifetime | Current teaching and registry ownership | EN/CN Comment/Suggestion/Discussion routes, registry generation and ten streaming lifecycle cases |

Verification evidence:

- [verification.json](artifacts/comments-discussions-main-parity/verification.json)
  records all 36 passing browser cases, zero retries/skips/failures, native
  interaction results and unchanged source fingerprints. All 822 recorded
  inputs match before and after the final run. PID 97818 serves this checkout's
  `apps/www` at `http://localhost:3000`; it is an existing server, not a process
  created or stopped by this invocation.
- [owners-verified.log](artifacts/comments-discussions-main-parity/owners-verified.log):
  171 tests across nine files, 540 assertions, zero failures. This includes
  Comments, Suggestion fast/slow behavior, app channel/Discussion/static UI,
  AI suggestions and link integration.
- [types-verified.log](artifacts/comments-discussions-main-parity/types-verified.log):
  website source-first types, package integration types, docs/API parity,
  registry-source parity and Next route generation pass.
- Affected-file formatting/lint and type-aware lint pass. Final registry
  generation and doctrine validation pass. The source audit establishes
  contextual coverage, not execution of every unrelated registry example.
- Matched screenshots use 1280×844 and 390×844 Chromium viewports with finite
  animations disabled. Main and candidate both show the same fallback avatars
  while remote images load; direct browser inspection also verified loaded
  avatars. The manual narrow browser reports 433 CSS pixels because of its
  existing zoom; exact 390px proof comes from the owned website runner.

Visual evidence:

| View | Main | Candidate |
| --- | --- | --- |
| Desktop | [Main](artifacts/comments-discussions-main-parity/main-1280-mixed.png) | [Candidate](artifacts/comments-discussions-main-parity/candidate-1280-mixed.png) |
| Narrow | [Main](artifacts/comments-discussions-main-parity/main-390-mixed.png) | [Candidate](artifacts/comments-discussions-main-parity/candidate-390-mixed.png) |

Open risks:
None within the confirmed Comments/Discussion findings and defined comparison
matrix. Actual Android/iOS devices and every browser engine were not tested;
mobile evidence here is Chromium viewport/touch emulation. No whole-site pixel
identity or release claim is made.

The broader root `pnpm lint` reports a formatting issue in the concurrently
edited `apps/www/src/registry/changelog/entries/2026-09-06-code-block-docs-preview.mdx`.
That unrelated file is unchanged by this task. The affected-file lint passes;
this audit does not claim root `pnpm check` is green.

Next action:
No further local repair remains in this scope. Review the local demo or source
before any separately authorized publication.
