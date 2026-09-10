# Felix's incoming next commits

Objective:
Review every incoming Felix commit before integrating remote `next`, identify
textual and semantic conflicts with the current checkout, and recommend what
to keep, adapt or discard, especially around the package-owned Comments work.

Completion threshold:
All five incoming commits and all 30 changed paths have a disposition; a
non-mutating three-way simulation identifies exact text conflicts; meaningful
source/behavior checks distinguish compatible fixes from obsolete APIs and
generated artifacts; the handoff states integration order and proof limits.

Scope:
- Local base: `a6afd55c30e97c74fe895d1ad005ca75413110f3`.
- Fetched remote: `f03d2b8c2397638acfe8b50abf4e90139778360f`.
- Incoming: `6d8108b91f`, `05d25a581b`, `58a6755ece`, `1a52e4b5bc`, `f03d2b8c23`.
- `HEAD...origin/next`: zero local commits, five incoming commits, all Felix.
- Current working files are the local implementation under review; compare
  their saved hashes before handoff to detect concurrent changes.

Verification surface:
Pinned Git blobs, local working files, per-file `git merge-file -p` simulation,
current package/copied UI contracts and focused existing tests or disposable
read-only probes. No branch, index or working-source mutation is needed.

Constraints:
Source-backed recommendations only. Preserve the user's package-owned Comments
design and established fixtures; assess fixes by behavior, not by author or
whether a patch uses an older API. No claims of integrated/runtime safety from
clean text merging alone.

Boundaries:
Fetch and audit artifacts are authorized. No pull, merge, stash, reset, commit,
push, discarded work, product edit, external message or new checkout.

Blocked condition:
Only an unavailable source or indispensable proof capability can block the
dependent conclusion; continue every independent commit review.

Task state:
- status: active
- current_phase: conditional publication verification
- next: establish a stable passing publication snapshot while preserving concurrent work

Work Checklist:
- [x] Read Poteto Principles and Task authority; use Investigation and Blast Radius within the read-only request.
- [x] Fetch live next and establish the complete incoming author/commit/path denominator.
- [x] Read every commit patch and classify each changed source, test, generated file, changeset and plan.
- [x] Simulate three-way integration with real Git merge machinery without changing the index or checkout; save local source identities.
- [x] Review Comments package/UI ownership, activation regressions and preserved main fixtures against incoming work.
- [x] Review AI streaming/drawing, date navigation and inline deletion behaviors, including relevant downstream contracts.
- [x] Run narrow meaningful proofs for decisive claims; explicitly label source-only and unproven integration claims.
- [x] Give all five commits and all 30 paths a keep/adapt/discard/regenerate disposition with exact evidence.
- [x] Reconcile sources, source drift, decision log and completion checker; deliver safe integration order without performing it.

Throughput:
One sequential reviewer under the user's tool mapping; parallelize independent
reads and existing checks only. No Autoreview on next or independent panel is
claimed. Read-only investigation does not start implementation/design workflows.

Decision log:
`.audit/felix-next-incoming-review/decisions.tsv`.

Verification evidence:
Completed below; raw receipts are in `docs/plans/artifacts/felix-next-incoming-review/`.

Open risks:
Local implementation is uncommitted and may overlap remote fixes or generated
outputs. A clean textual result may still import obsolete Comments APIs.


Review verdict:
Keep all five commits. Preserve our package-owned Comments model. The incoming
Comments change is two regression tests, not a runtime repair or competing
Comments implementation. Port their setup and selectors instead of restoring
copied plugins or replacing our current four tests.

Commit decisions:
| Commit | Scope | Decision |
| --- | --- | --- |
| `6d8108b91f` | Tailscale development origin | Keep the exact origin; combine with our `PLATE_WWW_DIST_DIR` setting. |
| `05d25a581b` | Complete AI streamed edits | Keep. Current local code truncates the same multi-chunk example to `This`; the merged code preserves the full result. |
| `58a6755ece` | Date navigation, generic deletion, Comments tests | Keep Date and deletion fixes together. Port both Comments activation tests and retain our four cases. |
| `1a52e4b5bc` | Static codeDrawing support and bilingual Details examples | Keep source changes and test; regenerate outputs from reconciled sources. |
| `f03d2b8c23` | AI streaming architecture and demo repair plans | Keep as draft/history. It authorizes no redesign and claims no completed demo repair. |

Text conflicts:
There are six conflicting files across thirty incoming paths: eighteen
incoming-only paths, six clean three-way combinations, five ordinary text
conflicts and one add/add conflict.

- `apps/www/next.config.ts`: retain our environment-selected build directory and
  his exact `allowedDevOrigins` entry.
- `apps/www/src/registry/components/editor/comment.spec.tsx`: combine behaviors;
  the old `commentPlugin`, `discussionPlugin`, `discussionValue` import and
  `.plite-comment` selector cannot be restored as the test's setup.
- Four generated outputs: `apps/www/public/r/editor-plugins-static.json`,
  `apps/www/src/__registry__/index.tsx`,
  `apps/www/src/registry/changelog/components.json`, and
  `apps/www/src/registry/changelog/index.json`. Rebuild from sources.

All seven incoming generated outputs should be regenerated, including those
without textual conflicts. Felix's static registry snapshot embeds the old
BaseCommentKit composition; selecting his entire generated file would undo our
kit changes. Selecting ours alone would omit his codeDrawing dependency.

Semantic findings:
- The strongest justified cut is obsolete test wiring and generated snapshots,
  not Felix's fixes or our Comments package. Keep one package owner for records,
  native anchors, loading and lifecycle; copied UI keeps presentation.
- The clean AI merge retains our adapter removal, suggestion-ID review loop,
  combobox initialization and preview lifecycle changes. Incoming streaming
  updates reuse live replacement keys and merge subsequent preview history.
- One Undo after Accept remains defective. Both the baseline and candidate make
  two undo batches; one Undo brings back transient suggestion metadata. In the
  candidate, the raw text includes removed and inserted alternatives. This is
  consistent with the draft plan's separately acknowledged history problem;
  it is not a reason to throw away the truncation fix.
- The static kit's existing codeDrawing plugin is the right owner for loading
  and serializing drawing-containing documents. No second parser is needed.
  An early API-break suspicion was withdrawn after the exact incoming
  `editor.api.markdown.serialize()` test passed. The portal call also passes;
  no runtime incompatibility is claimed for that test.
- Both Details additions leave the raw and normalized first four document blocks
  unchanged, including the comment-bearing paragraph. They add one outer
  Details block per locale and serialize through the actual merged static kit.
- The new architecture plan is explicitly provisional: retain raw model source,
  reuse current Markdown codecs, prove one accepted undoable operation, and
  validate any independent draft/rendering design before adoption. It is not
  evidence that the Markdown streaming demo or partial-selection duplication
  is fixed. Historical Comments-store references need refreshing if that plan
  is later executed against our package-owned implementation.

Fresh verification:
All tests ran from this checkout. A Bun source loader substituted only saved
incoming/three-way files in memory; it never wrote to product source or the
index. The comparison receipt records the exact source blobs and local hashes.
These are package/component integration probes, not native-browser or final
pushed-ref proof.

| Proof | Result | Receipt |
| --- | --- | --- |
| Incoming regressions against local source | 65 pass / 5 fail: AI truncation, three Date policies, adjacent atom deletion | `artifacts/felix-next-incoming-review/baseline-tests-v2.log` |
| Merged AI/Date/delete selected corpus | 81 pass / 0 fail; 779 unrelated cases filtered out | `artifacts/felix-next-incoming-review/candidate-tests-v2.log` |
| Complete four-file AI/Date corpus without name filtering | 64 pass / 0 fail | `artifacts/felix-next-incoming-review/candidate-full-ai-date.log` |
| Exact incoming static test | 1 pass / 0 fail | `artifacts/felix-next-incoming-review/static-legacy-v2.log` |
| Bilingual fixture preservation and Details serialization | 2 pass / 0 fail | `artifacts/felix-next-incoming-review/fixtures-v2.log` |
| Current Comments package activation and composer/subscriber tests | 9 pass / 0 fail | `artifacts/felix-next-incoming-review/current-comments-tests.log` |
| Ported first-click/dismiss/reopen cases on linked and plain segments | 2 pass / 0 fail; 25 assertions | `artifacts/felix-next-incoming-review/comment-ported-v5.log` |
| Accept followed by one Undo | Defect observed in baseline and candidate; diagnostic test asserts accepted text only | `artifacts/felix-next-incoming-review/undo-probe-baseline.log`, `artifacts/felix-next-incoming-review/undo-probe-v2.log` |

Counts overlap and must not be summed into a unique total. Ported Comments
probes reuse the current Discussion demo's value and records, full EditorKit,
DiscussionKit and CommentsPlugin. Their disposable harness exposes those local
constants, uses the valid test origin, supplies React for the root runner's
classic JSX transform, and allows 20 seconds for cold imports. The first
5-second run timed out before delivering the linked-text click; that failure
is retained and is not labeled a product regression or retry-free native proof.
Early loader/alias/import setup errors and the incorrect raw fixture-index
assertion are retained as verifier failures, not product defects. The corrected
fixture check compares both actual normalized editor values.

Integration order:
1. Checkpoint the entire current checkout before integrating the fetched
   branch. Ordinary pull cannot preserve overlapping uncommitted files by
   silently applying these three-way choices.
2. Integrate all five commits and resolve the two authored-file conflicts using
   the choices above. Preserve our Comments implementation and all existing
   tests; port the two incoming tests to its current contracts.
3. Keep both MDX changelog entries and regenerate registry/changelog outputs
   from the reconciled source using the repository generators, including
   `pnpm --filter www build:registry` on next.
4. Run affected source typechecks, Comments/AI/Date/delete tests and actual
   affected browser routes on the integrated tree. Resolve any failures before
   treating the integration as ready to push. The separate AI Undo issue needs
   its own repair scope and proof.
5. Push only with publication authority and read back the remote ref.

No pull, merge, stash, reset, source discard, product edit, commit, push or
external message occurred in this review. The fetched commit range remains the
review target; historical plans are evidence, not instructions for this task.

Per-file decisions:
| Path | Text merge | Disposition | Reason |
| --- | --- | --- | --- |
| `.changeset/fix-ai-streamed-edits.md` | incoming-only | keep | Accurate streaming/discard scope; does not claim one-step Undo after Accept. |
| `.changeset/fix-date-arrow-navigation.md` | incoming-only | keep | Date arrow-skip behavior is reproduced locally and fixed in the overlay. |
| `.changeset/fix-inline-atom-deletion.md` | incoming-only | keep | Ship with the Date change; preserves the character beside a skipped inline void. |
| `apps/www/next.config.ts` | text-conflict | combine | Keep PLATE_WWW_DIST_DIR and add the exact Tailscale allowedDevOrigins entry; no either-side wholesale replacement. |
| `apps/www/public/r/editor-plugins-static.json` | text-conflict | regenerate | Resolve owned source and retain both changelog MDX entries, then use the registry/changelog generators; do not hand-merge snapshots. |
| `apps/www/public/r/registry.json` | clean-three-way | regenerate | Resolve owned source and retain both changelog MDX entries, then use the registry/changelog generators; do not hand-merge snapshots. |
| `apps/www/src/__registry__/index.tsx` | text-conflict | regenerate | Resolve owned source and retain both changelog MDX entries, then use the registry/changelog generators; do not hand-merge snapshots. |
| `apps/www/src/registry/changelog/2026-09-07-playground-details.json` | incoming-only | regenerate | Resolve owned source and retain both changelog MDX entries, then use the registry/changelog generators; do not hand-merge snapshots. |
| `apps/www/src/registry/changelog/2026-09-09-ai-code-drawing-context.json` | incoming-only | regenerate | Resolve owned source and retain both changelog MDX entries, then use the registry/changelog generators; do not hand-merge snapshots. |
| `apps/www/src/registry/changelog/components.json` | text-conflict | regenerate | Resolve owned source and retain both changelog MDX entries, then use the registry/changelog generators; do not hand-merge snapshots. |
| `apps/www/src/registry/changelog/entries/2026-09-07-playground-details.mdx` | incoming-only | keep | Draft source event for the actual Details examples. |
| `apps/www/src/registry/changelog/entries/2026-09-09-ai-code-drawing-context.mdx` | incoming-only | keep | Draft source event for static kit codeDrawing support. |
| `apps/www/src/registry/changelog/index.json` | text-conflict | regenerate | Resolve owned source and retain both changelog MDX entries, then use the registry/changelog generators; do not hand-merge snapshots. |
| `apps/www/src/registry/components/editor/comment.spec.tsx` | add-add-conflict | port and combine | Keep our four composer/subscriber cases; adapt Felix's two activation cases to CommentsPlugin, DiscussionKit, activeIds, data-comment-id and the current discussion fixture. Both adapted cases pass. |
| `apps/www/src/registry/components/editor/plugins-static.spec.ts` | incoming-only | keep | Exact incoming serialization test passes with merged kit/value; editor.api.markdown is runtime-valid. |
| `apps/www/src/registry/components/editor/plugins-static.ts` | clean-three-way | merge | Add BaseCodeDrawingKit to our current kit; do not restore BaseCommentKit composition. |
| `apps/www/src/registry/examples/values/cn/playground-value.tsx` | clean-three-way | merge | Keep nested Details; raw and normalized comment-bearing prefix is unchanged. |
| `apps/www/src/registry/examples/values/playground-value.tsx` | clean-three-way | merge | Keep nested Details; raw and normalized comment-bearing prefix is unchanged. |
| `apps/www/src/registry/registry-features.ts` | clean-three-way | merge | Add code-drawing-static dependency while preserving our current static kit composition. |
| `docs/plans/2026-09-09-fix-improve-writing-stream-truncation.md` | incoming-only | keep as evidence | Retain scoped historical proof and later sync note; current audit independently reproduces the truncation fix. |
| `docs/plans/2026-09-09-restore-local-ai-writing-requests.md` | incoming-only | keep as evidence | Retain codeDrawing schema diagnosis; explicitly leaves partial-selection duplication outside its success claim. |
| `docs/plans/2026-09-10-ai-streaming-and-markdown-demo-architecture.md` | incoming-only | keep as draft | Not an accepted redesign or execution authority. Raw source and one-commit direction is sensible; draft-view/performance hypotheses and current Comments integration require new proof. |
| `docs/plans/2026-09-10-repair-markdown-streaming-demo-correction-cycle.md` | incoming-only | keep as pointer | Explicitly superseded by the architecture draft; does not claim the demo repaired. |
| `docs/plans/5125-5126-date-navigation-and-comment-activation-regression.md` | incoming-only | keep as evidence | Date fixed, Comments needs-repro remains explicit. Legacy owner/fixture references describe that proof snapshot. |
| `packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts` | incoming-only | keep | Three incoming regressions run against our current graph and merged runtime. |
| `packages/platejs/src/ai/react/AIChatPlugin.ts` | clean-three-way | merge | Keep live replacement-key/history fix and our adapter, suggestion-review and lifecycle changes. One-step accepted Undo remains a separate defect. |
| `packages/platejs/src/features/date/lib/BaseDatePlugin.spec.tsx` | incoming-only | keep | Retain desired arrow-crossing assertions and unchanged-value checks. |
| `packages/platejs/src/features/date/lib/BaseDatePlugin.ts` | incoming-only | keep | Existing selectable schema flag owns arrow entry; no new key handler. |
| `packages/plitejs/src/transforms-text/delete-text.ts` | incoming-only | keep | Canonical deletion owner checks the adjacent skipped atom before widening into text. |
| `packages/plitejs/test/delete-contract.ts` | incoming-only | keep | Retain both directions and selectable variants; run via runtime-contracts.test.ts. |

Final readback:
- HEAD remains `a6afd55c30e97c74fe895d1ad005ca75413110f3`; live origin/next
  remains `f03d2b8c2397638acfe8b50abf4e90139778360f`.
- All thirty incoming working-file identities match the initial snapshot.
- All thirty dispositions, proof links and decision-trail evidence paths checked.
- Autogoal completion checker passes. This closes the audit, not integration.
- No independent review is claimed; review stayed sequential under the user's
  tool mapping and no Autoreview ran on next.


Integration authorization (2026-09-10):
The user accepted the review and said “ok go pull and resolve”. This supersedes
the audit-only boundary for integrating the five reviewed commits and their
required resolutions. Preserve the whole checkout and its staged/unstaged
content. No new commit, push, PR, unrelated bug repair or new checkout.

Integration outcome:
Local next contains all five reviewed commits; our local work is restored; no
unmerged index entries remain; two authored conflicts and generated outputs
are resolved; focused package/component, type and real-route checks pass.
One-step AI accepted Undo remains an acknowledged independent defect.

Integration checklist:
- [x] Read Poteto Principles and the Task Git/proof contract; reuse the accepted review and its behavior probes.
- [x] Refresh remote next and confirm the same five-commit range.
- [x] Save the entire local working/index state in a retained Git stash and record its object identity.
- [x] Pull the reviewed next range in the current checkout, restore local work, and preserve unaffected staging/content.
- [x] Combine next.config and port both Comments activation cases without restoring obsolete exports or replacing our four tests.
- [x] Regenerate registry/changelog outputs from reconciled source; never manually edit generated files.
- [x] Prove unrelated checkout content and index entries survived, and no unresolved merge entries remain.
- [x] Run the actual integrated AI/Date/deletion/Comments/static tests, relevant source typechecks and scoped formatting.
- [x] Verify the affected Discussion/Date/AI or playground routes through the available browser on a source-bound server; retain exact limitations.
- [x] Reconcile the final source, proof, plan and Git readback; keep backup and report local-only integration.

Integration method:
The accepted review already owns the resolution plan; no competing design, new
API, doctrine repair or independent review is needed. The Comments test port is
a behavior-preserving adaptation to current package/UI owners. Preserve every
existing characterization case. Separate Before Serializing Shared State keeps
Git/index and generation operations sequential; Prove It Works requires real
integrated source checks, not the earlier loader overlay. No Autoreview on next.

Integration evidence:
`.audit/felix-next-integration/` owns snapshots, exact commands and readback.
Append integration decisions to the existing decision trail. Current checkout
contains both staged and unstaged work; record and restore both. Registry and
changelog generation stay serial; independent read-only package checks may run
in parallel. No install is needed unless actual dependency state requires it.

Verified integration result:
- `next` and live `origin/next` both point to
  `f03d2b8c2397638acfe8b50abf4e90139778360f`. Pull was a fast-forward containing
  all five reviewed commits. No new commit or push was made.
- Backup stash `c3c397ad7d9cabb09e0ba91e2e7434a5599107e4` remains available.
  Applying its index directly failed on overlapping files; ordinary stash
  application restored the working files, then the saved index entries restored
  the original staging outside the thirty incoming paths. Final readback has
  zero unrelated index differences and zero unmerged entries.
- Ten staged additions that were intentionally deleted in the working tree
  were restored to that original deleted state after stash application.
  Five performance ledgers advanced before the stash checkpoint; their newer
  content was kept. Twenty-nine unrelated files changed after restoration;
  those concurrent changes were preserved. The plan records its own update
  separately. No template content changed through this integration.
- The Comments test file contains all four existing cases and both incoming
  activation cases, mounted through the real Discussion demo. Its test host
  supplies and restores the origin and React binding required by Bun. Early
  import/host/ambiguous-textbox failures are retained as verifier failures.
  Final tests run through the repository runner without source overlays.

| Integrated check | Result | Receipt under `artifacts/felix-next-integration/` |
| --- | --- | --- |
| AI streaming/suggestions, BaseAI, Date and package Comments | 69 pass, 0 fail | `package-tests.log` |
| Plite deletion contracts | 43 pass, 0 fail; 753 unrelated cases filtered | `deletion-tests.log` |
| Copied Comments, static kit and Markdown | 13 pass, 0 fail; 63 assertions | `copied-tests-v3.log` |
| Platejs and Plitejs source typecheck graph | 85 tasks successful | `package-typecheck.log` |
| www package-integration TypeScript project | Exit 0 | `ui-typecheck.log` |
| Scoped formatting/lint | Exit 0 | `scoped-lint.log`, `comment-lint-final.log` |
| Registry build after final source formatting | 367 canonical payloads and 15 sparse overlays | `registry-build-final.log` |
| Changelog generator check | 159 events checked; exit 0 | `changelog-check-final.log` |
| Source-bound browser checks | Discussion activation/dismiss/reopen; Date arrows/deletion/Undo/calendar; playground nested Details and both original comment threads | `browser-proof.json` |
| Git and preservation readback | No unmerged entries; original unrelated staging intact | `final-git-readback.json`, `final-other-drift.json` |

The three test rows are disjoint: 125 passing tests. Browser proof used the
available Codex browser at `localhost:3319`, served from this checkout with
`PLATE_WWW_DEV_SOURCE=1` and a dedicated build directory. A temporary missing
registry error occurred during regeneration; the regenerated routes then
loaded and completed the interactions above. This is local browser proof,
not a hosted, native-device or external AI-provider claim. The pre-existing
AI Accept/Undo defect remains outside this integration's repair scope.

Review source snapshots are retained in
`artifacts/felix-next-incoming-review/source-snapshots.tar.gz`; archiving those
copies prevents test runners from discovering historical `.spec.ts` files as
live tests. Original runnable review probes remain under `.audit/`.

Conditional push authorization (2026-09-10):
The user said “let's push if ci green (another task is working so make sure to
not push files that are the cause of red ci)”. Prepare and push the completed
current-checkout changes after the actual CI gates pass. Exclude unfinished
concurrent work and preserve its working and staged content. No PR, forced
push, release promotion or new checkout.

Publication checklist:
- [x] Read Task publication/closure and Verify Plate; reuse this plan and the standing Autogoal request.
- [x] Read live remote checks and coordinate every active same-checkout product writer.
- [x] Diagnose the remote release-helper and benchmark-page deployment failures, retaining exact logs.
- [x] Establish and checkpoint the included/excluded file and dependency boundary using independent source hashes.
- [x] Pass the serialized root check and actual CI package/public-type/CLI gates on the final candidate.
- [x] Verify generated registry/API output, the production website, full website types and the affected real browser journeys.
- [x] Verify the exact index candidate and unchanged tested source, then commit and push.
- [x] Read back the remote ref and actual CI state; preserve and verify all excluded work and dependencies.
- [x] Reconcile the source-linked obligations, decision trail, plan and native goal.

Publication source obligations:
Task owns actual Git authority, `pnpm check`, current-checkout proof and final
remote readback. No Autoreview runs on next. Verify Plate owns effective
source/fixture/runner identity. Package/dist writers and the final root check
run sequentially to keep the type context stable. Barrels, registry and API
facts use their existing generators; templates are untouched. This publication
does not close the separate performance plan or claim its full browser matrix.

Included fixes required by the push:
- The release helper discovers the current `packages/*` workspace without
  scanning the deleted `packages/udecode` directory. Four existing tests and
  the real CLI pass; no changeset files changed.
- The www build supplies an 8 GB Node heap default while preserving caller
  Node flags. The full production graph builds 1,274 pages, including the
  previously failing `/dev/editor-perf` page.
- The API-reference manifest records the integrated Date schema's
  `selectable: false` fact. No API config or other generated fact changed.
- The integrated Comments regression tests have correct Bun matcher and
  submit-callback types; all six cases remain intact.

Excluded work and preservation:
- Tailwind patch removal: 24 pre-existing paths, its unfinished plan and
  artifacts. Every reconstructed baseline file matched the independent
  intake hash. Exact current bytes, modes, deletions and index entries were
  checkpointed under `.audit/felix-next-push/tailwind-frozen/`. The baseline
  was temporarily restored in this checkout; frozen dependency install passed.
- Comments docs examples: three new, unregistered example files were
  checkpointed under `.audit/felix-next-push/comments-frozen/` and temporarily
  removed from the compile graph. Its new plan is excluded.
- AuthoredChanges: the active planning document and its artifacts are excluded;
  that task owns no unfinished product/package edits.
- All three owners acknowledged the source/generator window. Restore every
  excluded file and its dependency graph, verify checkpoint hashes and release
  the window immediately after the candidate is committed/pushed.

Publication evidence:
`.audit/felix-next-push/` owns the intake/index snapshots, exclusion checkpoints,
source fingerprints, remote logs and final checks. The performance task's
`artifacts/2026-09-10-editor-performance-follow-through/` owns the package and
browser receipts reused below.

| Check | Result | Receipt |
| --- | --- | --- |
| Full frozen production build | 5 tasks pass; 1,274 pages; 2m55s | `www-build-frozen.log` |
| Full www typecheck pipeline | Exit 0, including editor/API/docs/registry checks and both TypeScript projects | `frozen-www-handoff.log` in performance artifacts |
| Affected www browser journeys | 65/65 pass: 13 cases repeated five times | `frozen-final-www-browser.log` in performance artifacts |
| Native CodeMirror interaction | Viewing to Editing, typing and Undo pass; no errors | `frozen-native-codemirror.json` in performance artifacts |
| CI package gates | Source types, package tests, runner/benchmark contracts, 48 benchmark targets and packed public types pass | `frozen-final-plite-strict.log` in performance artifacts |
| Serialized root check | Exit 0: 2,125 Bun tests, 515 Node tests, no failures | `check-frozen-serialized.log` |
| Explicit CLI tests | Exit 0: 86 tests, 263 assertions | `frozen-cli-test.log` in performance artifacts |
| Full strict/matrix closure | Incomplete; not claimed by this push | Separate performance plan remains open |

Verification qualifications:
The first 4 GB production attempt exhausted its heap before prerendering; the
8 GB default is verified by the final build. Earlier source-changing browser
runs were interrupted and are not used as final passing evidence. A typed-lint
diagnostic during concurrent package work disagreed with the owning compiler;
no HTML parser edit or suppression is retained. The final HTML source is
byte-identical to the frozen build input. The final root check runs only after
package writers stop. An auxiliary lint-policy audit reported existing findings
in unchanged files/config; no policy-audit green result is claimed.

Publication interleaving:
An external actor committed and pushed `b77cba1680bbf17d5ddbbf134a15b02766304831`
(`v2`) during final checks. This thread did not create that commit. Its product
source matches the frozen candidate, but it omitted the required untracked
Tailwind patch and README. Its CI and release jobs fail at dependency install
with the missing patch path; the exact logs are retained. It also committed the
active planning documents and later workflow guide, so those files can no
longer be described as excluded from that external commit. This thread leaves
that published history intact and adds the exact patch bytes used by the green
local checks. The generated release-status working change remains unstaged.
The Tailwind implementation and three Comments example source files remain
checkpointed for immediate restoration after the patch follow-up.

Remote CI source-type repair:
The missing-patch follow-up `1a2e1c0c9f` passed remote dependency installation,
the release/changelog job and Vercel deployment. Main CI then reported 163
typed-lint annotations. The local built declarations had masked two source
configuration gaps: Plate's normal project excluded its test files, and the
CLI was absent from the canonical Plate/Plite source-path generator.

The follow-up keeps Plate tests in their normal source project and generates
the CLI's complete source paths through the existing owner. Partitioned
production typechecks keep their own explicit test exclusions. A regression
uses the real parsed project and a resolver that denies workspace `dist`
files; it fails before the configuration fix and passes afterward. All 12
source-configuration tests and generator consistency checks pass. With that
source context repaired, the HTML value-type erasure requires one precise
Oxlint exception: the owning compiler proves the intermediate `unknown` cast
is required, and emitted JavaScript remains identical. No runtime expression
or public API changed; no rule was globally disabled.

The corrected full local check passes typed lint, all 93 package typecheck
tasks, 2,125 Bun tests and 516 Node tests with no failures. Published follow-up
`d785ce1022` clears all 163 previous remote typed-lint annotations. Its release
job and Vercel deployment pass. Main CI rejects the local HTML exception as
unused, while all four Chromium shards stop at test discovery because their
fresh checkout lacks `plitejs/dist/index.js`. No browser behavior assertion
ran in those failed shards.

The final lint repair uses the rule's existing `typesToIgnore` option for the
exact erased `EditorCoreStateView` type and removes the unstable inline
directive. The rule remains enabled; TypeScript still checks the asserted
contract. This avoids platform-dependent unused-directive failures without
changing runtime expressions. The CI producer builds the canonical four
runtime packages once and includes their dist outputs in its cache and shared
artifact. Shards receive those outputs before discovering Node-side tests;
the existing app and proof-manifest checks retain their own freshness rules.

The focused strict typed-lint check and complete `pnpm check` pass: 93 package
typecheck tasks, 2,125 Bun tests and 516 Node tests, with zero failures. All four
canonical runtime package builds pass, and Playwright discovers all 752
Chromium tests across 51 files. Workflow YAML parsing and idempotent scoped
formatting pass. This test listing proves imports and discovery, not browser
behavior; the live remote follow-up must still pass.

Original failures, source fingerprints and new logs remain in
`.audit/felix-next-push/typed-lint-source-fix/`. The final three source/config
hashes are in `final-ci-setup-candidate.json`; full check output is in
`check-stable-option.log`. Publish only this workflow, lint configuration,
HTML comment removal and plan. The resumed Tailwind and Comments work stays
local. The auxiliary strict lint-policy audit still reports the same existing
findings outside these changes; its result is not counted as passing.

Remote follow-up `37dfaff9f8`:
The full root check, release workflow, Vercel deployment, all four Chromium
shards and their coverage merge pass. Main CI then reaches the package tests
and fails one table case: the 2,000-column resize fixture exceeds Bun's default
5-second watchdog at 5,274.96 ms. The other 235 table cases pass. The unchanged
case passes locally; this failure does not assert a resize latency budget.

The test retains all 2,000 columns, 201 deltas and width/preview assertions,
with one explicit 30-second watchdog for shared CI setup. No runtime behavior,
benchmark acceptance threshold or assertion changes. The full table partition
passes all 236 cases and 19,063 assertions after that test-only correction.
The final local `pnpm check` passes all 93 typecheck tasks, 2,125 Bun tests
and 516 Node tests with zero failures. Final remote checks remain required
before publication closure.
`final-main-ci-failure.log`, `table-resize-baseline.log` and
`table-partition-timeout.log` retain the failure and focused verification.
`check-table-timeout.log` retains the full check; the exact test input is
fingerprinted in `table-timeout-candidate.json`. This follow-up publishes only
that test and this plan. All other ongoing edits stay local.

Focus repair case `ci-focus-explicit-blur`:
On pushed `e92dceb4fe`, root checks and the corrected table gate pass; the
React-core partition reports one failure among 294 cases. Under StrictMode,
`BlockPlaceholderPlugin.spec.tsx` focuses the mounted view, shows its empty
block placeholder, calls that view's `api.dom.blur()`, and still sees the
placeholder afterward. The exact local partition passes, so its immediate
assertion alone does not prove delayed focus work has settled.

Class: DOM focus-request ownership, in Plite. Candidate cause:
`DOMEditor.focus` schedules retry and delayed settlement work; `DOMEditor.blur`
clears focused state but does not invalidate the request owning that work.
The existing DOM scheduler tests will deterministically exercise public focus,
explicit blur and pending callbacks. Expected: native focus stays outside the
editor and its focused state stays false; a later explicit focus still works,
and blurring an older editor cannot cancel a sibling's current request.
Retain the three placeholder host variants, StrictMode and post-blur oracle.
Fix the existing request owner only if those cases reproduce. Required proof:
red/green DOM cases, full DOM and React-core partitions, actual browser focus
behavior, source types, root check and final pushed CI. No placeholder policy,
new public API, selection clearing, or unrelated product changes are in scope.


Attempt 1 final verification was rejected, not published. The exact browser
fixture failed 9/15 retry-free Chromium rows after draining queued work, and
Chrome retained the focused editor and placeholder. Frozen-byte native tracing
shows explicit blur reaches BODY, then the layout effect in
`selection-reconciler.ts` calls `Selection.setBaseAndExtent`; that native write
reacquires editor focus without an HTMLElement.focus call. The original
scheduler fix is necessary but does not govern this independent write owner.
The browser fixture uses all three original host variants and the complete
one/nonempty plus empty-paragraph selection setup under StrictMode.

Best API / Plite Plan decision for attempt 2:
The public mounted-view `api.dom.focus()` and `api.dom.blur()` calls retain their
existing jobs. The strongest justified cut is the reconciler's permission to
export selection into an unfocused view merely because BODY is active. Reuse
the existing view focus authority before passive selection reconciliation;
retain explicit focus's owned retry/settlement cancellation. No new flag,
controller, timer, selection model, public API or plugin is warranted. Removing
focus settlement wholesale would break the separately proved incidental host
loss repair. Clearing model selection on blur would destroy preserved selection.
Plite owns both DOM mechanics; Plate placeholders consume the resulting view
state and require no policy patch. One constant focus check adds no per-node
work, allocation or scheduler. This is a correctness guard in an existing
lifecycle, with no new runtime layer or performance claim.

Execution slice: gate the existing React selection layout effect on live view
focus before any external-text/native selection export; rerun deterministic
DOM cancellation and sibling cases, original React-core partition, all three
browser hosts five times with zero retries, source types and root checks.
Risks to prove: initial selected but unfocused mounts must not steal focus;
explicit focus and follow-up typing must still work; sibling focus and native
incidental-loss repair must remain intact. No rollback of concurrent work.

Regression workflow repair uses the project-owned source under
`.agents/rules/regression`, not a vendor/global skill. Its validator rejects a
failed focus-state packet that traces explicit focus but omits DOM selection
writes and their before/after active element. The negative fixture is red before
the validator change. Source generation runs through pnpm install. Agent-native
review: existing Patch failed-fix routing reaches Regression, its source and
mirrors expose the diagnostic, and the executable validator enforces it. No
external project installation or additional review panel is in scope.

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---|---|---|---|---|---|---|---|---|---|---|
| ci-focus-explicit-blur | CI 34504393785; packages/platejs/src/react/utils/BlockPlaceholderPlugin.spec.tsx | Focus the mounted view, explicitly blur, let reconciliation finish, focus again and type | Unfocused view has no block placeholder until a later focus request | existing-contract: original post-blur placeholder assertions and DOM blur | e2e-required: JSDOM scheduler tests do not reproduce browser focus induced by Selection.setBaseAndExtent | exact-route: /focus-blur; Chromium and Chrome on macOS; runtime-modes: writable mounted StrictMode, no suggestions or history; fixture-scope: complete two-paragraph original fixture across DIV/P/SECTION hosts | apps/plite/tests/plite-browser/focus-blur.test.ts; pnpm --filter plite exec node scripts/run-plite-browser.mjs direct --project=chromium tests/plite-browser/focus-blur.test.ts | completed | dirty:e92dceb4feb941b65da762cef12df921be41158d | Final publication |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---|---|---|---|---|---|---|---|---|---|
| ci-focus-explicit-blur | 1 | 9/15 mounted browser cases regain focus after blur | final-verification | yes: DOM-only green cannot close mounted behavior | repair-now: .agents/rules/regression/scripts/validate-regression-plan.mjs traces selection writes | pass: node --test .agents/rules/regression/scripts/validate-regression-plan.test.mjs | yes: timer-focus-correctness | best-api and plite-plan: existing focus authority gates passive reconciliation, decision above | reproduced: native matrix trace on unchanged product bytes; diagnostic: after blur BODY becomes editor during selection layout export; focus-state-trace: native + dom-api + react-context; selection-focus-trace: selection-write + active-before + active-after; selection-focus-result: selection-reconciler setBaseAndExtent refocuses editor; runtime-owner: pass; mutation-owner: pass |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---|---|---|---|---|---|---|
| ci-focus-explicit-blur | 1 | timer-focus-correctness | escalate | required: best-api: retain semantic focus/blur, cut passive unfocused selection export | plite-plan: attempt 2 slice above | pass: 20 exact Chrome rows plus final strict Plite and five-project matrix; DOM sibling repair preserves incidental settlement |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---|---|---|---|---|---|
| ci-focus-explicit-blur | packages/plitejs/src/dom/plugin/dom-editor.ts and src/react/editable/selection-reconciler.ts | exact-route: /focus-blur; owned static server PID 6808 http://127.0.0.1:3399, cwd apps/plite; repository direct browser runner | doctor app digest ed9ab43e5539c82dd7d11a16ed0017b10b6bd4c0eaa3d875580529d42db1dad3; fresh app and browser inputs | source aliases built by owned Next exporter; no generated edits | pass: frozen attempt 1 host, rebuild required after attempt 2 |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|---|---|---|---|---|---|
| ci-focus-explicit-blur | explicit focus traces miss selection-induced native focus | repair-now |  .agents/rules/regression/scripts/validate-regression-plan.mjs, rule and methodology; generated mirrors via pnpm install | pass: 148 tests; focus-workflow-red.log and focus-workflow-final.log | executable negative packet fails; complete diagnostic packet passes |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
| ci-focus-explicit-blur | base-acceptance | packages/platejs/src/react/utils/BlockPlaceholderPlugin.spec.tsx | after-action | Explicit blur clears the block placeholder and focused state | required | dom-native@after-action, focus@after-action | test: apps/plite/tests/plite-browser/focus-blur.test.ts#explicit blur cancels queued focus | pass: 20 exact-Chrome rows and final configured matrix |
| ci-focus-explicit-blur | base-acceptance | packages/plitejs/test/dom/dom-coverage.ts | follow-up | A later explicit focus remains usable with preserved selection | required | follow-up-input@follow-up | test: apps/plite/tests/plite-browser/focus-blur.test.ts#explicit blur cancels queued focus | pass: later explicit focus and native typing; 20 exact-Chrome rows and final matrix |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
| ci-focus-explicit-blur | model | after-action | no | N/A: focus state repair, no document mutation claimed | N/A: focus state repair | N/A: focus state repair | N/A: focus state repair | N/A: focus state repair |
| ci-focus-explicit-blur | dom-native | after-action | yes | Mounted public blur clears original paragraph placeholder attributes and class; runtime-owner: mounted useEditor command owner; mutation-owner: public DOM blur | Placeholder survives passive reconciliation | Browser with real Selection behavior | test: apps/plite/tests/plite-browser/focus-blur.test.ts#explicit blur cancels queued focus | pass: runtime-owner: pass; mutation-owner: pass; placeholder stays absent after queued selection work |
| ci-focus-explicit-blur | focus | after-action | yes | Native editor focus and focus-state stay false after explicit blur and queued work | Editor regains native focus through selection export | Browser mounted view and DOM scheduler | test: apps/plite/tests/plite-browser/focus-blur.test.ts#explicit blur cancels queued focus | pass: explicit blur remains unfocused after queued callbacks |
| ci-focus-explicit-blur | follow-up-input | follow-up | yes | Later explicit focus inserts text into the preserved empty second paragraph | Focus remains canceled or text goes into the first paragraph | Browser native typing | test: apps/plite/tests/plite-browser/focus-blur.test.ts#explicit blur cancels queued focus | pass: later explicit focus and native typing; 20 exact-Chrome rows and final matrix |
| ci-focus-explicit-blur | pointer-feedback | after-action | no | N/A: no pointer affordance change | N/A: no pointer affordance change | N/A: no pointer affordance change | N/A: no pointer affordance change | N/A: no pointer affordance change |
| ci-focus-explicit-blur | popup | after-action | no | N/A: no popup | N/A: no popup | N/A: no popup | N/A: no popup | N/A: no popup |
| ci-focus-explicit-blur | geometry-paint | after-action | no | N/A: attribute and native focus contract, no pixel claim | N/A: attribute and native focus contract, no pixel claim | N/A: attribute and native focus contract, no pixel claim | N/A: attribute and native focus contract, no pixel claim | N/A: attribute and native focus contract, no pixel claim |
| ci-focus-explicit-blur | subscription-lifecycle | after-action | no | N/A: no subscription implementation change | N/A: no subscription implementation change | N/A: no subscription implementation change | N/A: no subscription implementation change | N/A: no subscription implementation change |
| ci-focus-explicit-blur | runtime-errors | after-action | no | N/A: native focus assertion is the reported failure, runtime exceptions still fail runner | N/A: native focus assertion is the reported failure, runtime exceptions still fail runner | N/A: native focus assertion is the reported failure, runtime exceptions still fail runner | N/A: native focus assertion is the reported failure, runtime exceptions still fail runner | N/A: native focus assertion is the reported failure, runtime exceptions still fail runner |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ci-focus-explicit-blur | 2 | completed | "env" "PLAYWRIGHT_BASE_URL=http://127.0.0.1:3399" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "plite" "exec" "node" "scripts/run-plite-browser.mjs" "direct" "--project=chromium" "tests/plite-browser/focus-blur.test.ts" "tests/plite-browser/runtime-entrypoints.test.ts" "--repeat-each=5" | pass: exit 0 in 12108ms | dirty:e92dceb4feb941b65da762cef12df921be41158d | sha256:4a03fd4ce5983c23454b39b569a5b1286be9e3208d37d17520a75a67f088b188 | 15 | apps/plite/next.config.ts,apps/plite/out/.plite-proof-build.json,apps/plite/playwright.config.ts,apps/plite/scripts/run-plite-browser.mjs,apps/plite/src/app/focus-blur/page.tsx,apps/plite/src/runtime-entrypoint-proof.generated.ts,apps/plite/tests/plite-browser/focus-blur.test.ts,apps/plite/tests/plite-browser/runtime-entrypoints.test.ts,packages/platejs/src/react/utils/BlockPlaceholderPlugin.spec.tsx,packages/platejs/src/react/utils/BlockPlaceholderPlugin.tsx,packages/plitejs/src/dom/plugin/dom-editor.ts,packages/plitejs/src/react/editable/runtime-root-engine.ts,packages/plitejs/src/react/editable/selection-reconciler.ts,packages/plitejs/test/dom/dom-coverage.ts,packages/plitejs/test/react/selection-reconciler-contract.test.tsx | pid:6847;started:2026-09-10T20:05:49.000Z;base-url:http://127.0.0.1:3399;browser:exact-chrome;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 152.0.7977.83 | 2026-09-10T18:07:32.807Z | 2026-09-10T20:06:09.608Z | 2026-09-10T20:06:21.717Z | 0 | sha256:2d00d111ddb9a823a839f6dce6c5f7b3ba799c230d1c24fdb21106dfe0ed5646 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|---|---|---|---|---|---|---|
| Plite DOM and mounted selection | ci-focus-explicit-blur | red: original native 9/15 refocus and deterministic queued callback cases | 2026-09-10T18:07:32.807Z | "env" "PLAYWRIGHT_BASE_URL=http://127.0.0.1:3399" "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "pnpm" "--filter" "plite" "exec" "node" "scripts/run-plite-browser.mjs" "direct" "--project=chromium" "tests/plite-browser/focus-blur.test.ts" "tests/plite-browser/runtime-entrypoints.test.ts" "--repeat-each=5" | sha256:4a03fd4ce5983c23454b39b569a5b1286be9e3208d37d17520a75a67f088b188 | pass: 20 final exact-Chrome executions; full affected AI corpus and configured matrix also pass as linked below |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|---|---|---|---|---|
| native focus | 9/15 browser cases refocus | product | passive selection export gated on existing live view focus | pass: 20 exact-Chrome rows; focus-final-native-receipt.log |
| plite app typecheck | generated runtime proof nominal descriptor incompatible | existing generated fixture type contract | generated export-reflection adapter asserts the nominally validated plugin input type; source generator owns output | pass: pnpm --filter plite typecheck; focus-app-types-final.log |


Final focused candidate evidence (publication remains held):
- Full `pnpm check`: 93 typecheck tasks, 2,125 Bun tests and 516 Node tests,
  all passing in `check-focus-final.log`.
- Plite DOM partition: 241 cases; Plate React-core: 294 cases; Plite React
  partition: 1,252 cases; all pass.
- Two additional Android callback tests reproduce native refocus before the
  queued frame and between frame/spellcheck export. Both are red before the
  callback guard and green afterward; the complete reconciler contract has
  26 passing cases. Five existing isolated export tests explicitly provide
  their focused-view precondition while retaining every prior assertion.
- Final source-built host PID 24419 on port 3399 passes 20 exact Chrome
  152.0.7977.83 rows: three host variants plus runtime entrypoints, five
  repetitions each, zero retries. The receipt binds all 15 named inputs.
- Regression workflow proof: all 148 tests pass and generated mirrors match.

A newly started affected-www corpus reports the AI menu's Escape action closes
its shell without restoring focus to the mounted editor. The performance owner
is tracing that exact case on frozen product bytes before proposing a repair.
This prevents publication despite the focused candidate passing. The remaining
case and its original native evidence are owned by
`docs/plans/2026-09-10-editor-performance-follow-through.md`; do not erase the
broader requirement or borrow the narrow blur proof to close it. Both DOM focus
and selection-reconciler sources remain frozen during that diagnosis.

Excluded staged content:
Another actor staged broad Comments/Tailwind/docs work during verification.
No commit or staging action from this task has occurred in this attempt. The
publication operation must preserve those excluded index entries and working
bytes, using only the final explicit repair paths after every required gate
passes. Do not commit the entire index or restore excluded files.

Final publication intake: the completed performance handoff closes the AI affected corpus (65 exact-Chrome executions), strict Plite and all five configured browser projects (2,395 passes, 623 declared skips, no missing/duplicate/unexpected cases). The final AI repair preserves model-only update semantics, binds close focus to the mounted API, and makes copied acceptance controls request focus explicitly. Browser fixture repairs establish visible pointer/row preconditions without changing product behavior. See `artifacts/2026-09-10-editor-performance-follow-through/handoff-verification-summary.json` and the source readback for exact commands and hashes. This supersedes the earlier AI publication hold.

The user confirms the other task finished and explicitly requests fixing CI and pushing, with no messages to other tasks. Completed Comments and Tailwind changes have local completion records and are included with their generated output and dependency changes. Unfinished authored-change/structural-diff research and temporary release status remain excluded. A fresh root check precedes publication; remote CI remains the final gate.

Publication checks: fresh `pnpm check` passes (`.audit/felix-next-push/check-publication-final.log`); final source-built exact-Chrome replay passes 20/20 with zero retries (`focus-publication-receipt.log`); Regression semantic completion, generated changelog consistency and exact workflow mirrors pass. Commit scope contains 101 completed paths. Twenty research/temporary paths and their index entries are preserved separately. Remote CI is still pending publication.

Final remote closure: `ec1ce5bf509922176ad08995f29860e6d9ef8ee0` is published at `origin/next`. Main CI `34524496720`, Plite CI `34524496732` (all four Chromium shards and coverage), ReleaseOrVersionPR `34524496629`, and Vercel all report success on that exact commit. All 20 excluded working files and index entries matched immediately after this task committed. A later readback detects concurrent changes in the excluded structural-diff research; this task leaves those files untouched. No messages were sent to other tasks after the user prohibited them. This local closeout records results obtained after the published commit.
