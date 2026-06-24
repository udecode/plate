# Lexical Full All Issues Robustness Harvest

Objective:
Full all-state `facebook/lexical` issue-body harvest for portable Plite robustness gaps, checkpointed across every issue without stopping for soft questions.

Goal plan:
docs/plans/2026-06-03-lexical-full-all-issues-robustness-harvest.md

Template:
docs/plans/templates/editor-test-harvester.md

Primary template:
docs/plans/templates/editor-test-harvester.md

Applied packs:
- none

Completion threshold:
- This is a full issue-body harvest over every open and closed Lexical issue
  currently visible through GitHub issue metadata/body access.
- Done means:
  - all-state issue metadata/body corpus is fetched to scratch artifacts;
  - all 2,741 known issues are assigned exactly one primary disposition:
    `keep-portable`, `plate-owned`, `defer`, `skip`, or `needs-follow-up`;
  - issue-body batches are checkpointed without pausing for soft questions;
  - skipped Lexical/framework/product/support/docs/release issues have explicit
    skip families;
  - kept/deferred/Plate-owned invariants map to current `.tmp/plite` or
    Plate owners;
  - every non-skip matrix row names owner, proof kind, verification command, or
    defer reason;
  - no runtime/package patch is made before owner/proof/command exists;
  - `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-lexical-full-all-issues-robustness-harvest.md` passes.
- Issue comments are a follow-up layer unless a body references a specific
  comment-only proof; do not block the all-body pass on full comment expansion.

Verification surface:
- Target repo: `../lexical`.
- Issue body corpus:
  `.tmp/editor-issue-harvester/lexical/full/issues-all-with-bodies.json`.
- Checkpoint artifacts:
  `.tmp/editor-issue-harvester/lexical/full/checkpoints/checkpoint-*.md`.
- Full classification:
  `.tmp/editor-issue-harvester/lexical/full/classified-issues.json`,
  `.tmp/editor-issue-harvester/lexical/full/classified-issues.tsv`.
- Full matrix/report:
  `.tmp/editor-issue-harvester/lexical/full/report.md`,
  `.tmp/editor-issue-harvester/lexical/full/matrix.md`.
- Existing context:
  `.tmp/editor-issue-harvester/lexical/matrix.md` first-pass matrix and
  `docs/editor-test-harvester/lexical/*` durable test harvest.
- Verification commands:
  - `jq length .tmp/editor-issue-harvester/lexical/full/issues-all-with-bodies.json`
  - `node .tmp/editor-issue-harvester/lexical/full/classify-issues.mjs --verify`
  - `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-lexical-full-all-issues-robustness-harvest.md`

Constraints:
- License mode controls output placement: permissive artifacts under
  `docs/editor-test-harvester/<repo>/`; behavior-only artifacts under
  `.tmp/editor-test-harvester/<repo>/`.
- Behavior-only source material must stay scratch-only. Durable/versioned output
  uses fresh invariant wording and local proof language.
- Do not browse GitHub files. Use local checkouts or clone missing repos under
  `..`.
- Do not edit `.tmp/plite`, Plate packages, docs, examples, or build config
  unless the user explicitly requested an apply run.

Boundaries:
- Target repo: `../lexical`.
- Report directory: `.tmp/editor-issue-harvester/lexical/full/`.
- Allowed edit scope: this plan and `.tmp/editor-issue-harvester/lexical/full/**`.
- Non-goals:
  - no Plite runtime/package/test/example patch during corpus classification;
  - no GitHub issue mutation, comments, labels, PR, branch, commit, or push;
  - no full issue-comment expansion unless a specific body row requires it;
  - no copying Lexical ontology or issue prose into versioned Plite/Plate output.

Blocked condition:
- Do not stop for soft taste/product questions; queue them in the final handoff.
- Hard-block only if GitHub issue body access, `../lexical`, `.tmp/plite`,
  local license evidence, or artifact write access is unavailable, or if every
  remaining issue row requires a user-only authority decision.

Harvest state:
- target_repo: ../lexical
- repo_key: lexical
- license_mode: permissive
- output_mode: scratch full issue-body mode
- report_path: .tmp/editor-issue-harvester/lexical/full/report.md
- inventory_path: .tmp/editor-issue-harvester/lexical/full/issues-all-with-bodies.json
- test_index_path: docs/editor-test-harvester/lexical/test-index.md
- issue_mode: yes
- issue_state: all
- issue_report_dir: .tmp/editor-issue-harvester/lexical/full
- issue_index_path: .tmp/editor-issue-harvester/lexical/full/classified-issues.tsv
- issue_cluster_path: .tmp/editor-issue-harvester/lexical/full/report.md
- issue_matrix_path: .tmp/editor-issue-harvester/lexical/full/matrix.md
- invocation_mode: full-loop without soft stops
- checkpoint_policy: process all issue-body batches and queue soft decisions
- current_pass: closure-review
- current_pass_status: complete
- next_pass: apply selected high-value matrix subfamilies when requested

Current verdict:
- verdict: full issue-body classification complete
- score: 0.93
- next owner: `plite-automation` apply slice or `plite-plan` for table/mobile/yjs/perf owner decisions
- reason: all 2,741 issues were fetched with bodies, assigned a disposition,
  checkpointed in 14 batches, mapped to 11 matrix families, and every non-skip
  family has owner/proof/command or defer reason.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, report artifacts are current, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-lexical-full-all-issues-robustness-harvest.md` passes.
- Do not create hook state for this goal. This
  file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `plite-automation`; read/used `editor-test-harvester`, `clawsweeper`, and `vision` policy from current context and generated skills. |
| Active goal checked or created | yes | Created active goal for full Lexical all-issues robustness harvest. |
| Source of truth read before edits | yes | Used `../lexical`, MIT license evidence, previous issue artifacts, existing `docs/editor-test-harvester/lexical/*`, and current `.tmp/plite` proof owners. |

Work Checklist:
- [x] Short objective plus outcome, score threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] License gate complete before selecting report directory.
- [x] Existing report, inventory, and test-index read before rerun updates, or
      marked N/A with reason.
- [x] Full inventory command recorded with total count, classified count, and
      unresolved count.
- [x] Every inventory file classified as portable, portable-mixed, plate-owned,
      skip, harness, product-shell, or uncertain. N/A for issue-body inventory;
      every issue is classified as `keep-portable`, `plate-owned`, `defer`, or
      `skip`, while the existing durable test harvest covers test-file classes.
- [x] Test-name extraction complete for every runnable portable,
      portable-mixed, and uncertain file, or skipped with reason. Existing
      durable test-index remains the test-source owner; this run is issue-body
      classification.
- [x] Negative-control skip pressure applied to large skip families.
- [x] Behavior rows extracted with source ref, tag, invariant, proof kind,
      owner coverage, and action.
- [x] `.tmp/plite` coverage searches recorded for raw Plite rows.
- [x] Plate owner searches recorded for plugin/product rows.
- [x] Every create/refactor/copy/fresh-invariant/defer/plate-owned row names
      target owner, proof kind, and command or defer reason.
- [x] Behavior-only hygiene checked: no durable/versioned output copies or
      mechanically translates source code, fixtures, snapshots, helpers,
      expected output blobs, or expressive prose.
- [x] Browser/IME/mobile claims have honest runtime proof route or explicit
      defer reason.
- [x] TDD used before apply-run behavior changes with a sane test surface, or
      marked N/A with reason.
- [x] Browser proof captured for browser-surface apply changes, or marked N/A
      with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Verify all issue-body rows are classified and non-skip rows have owner/proof/command. | `node .tmp/editor-issue-harvester/lexical/full/classify-issues.mjs --verify` passed for 2,741 issues. |
| Harvest artifacts current | yes | Verify full report, body corpus, checkpoints, TSV, JSON, matrix, and coverage map exist. | Full artifact set exists under `.tmp/editor-issue-harvester/lexical/full/`. |
| Behavior-only hygiene | yes | Verify no runtime/versioned Plite/Plate output copied external issue prose or tests. | Only scratch `.tmp` issue artifacts and this plan changed; no runtime patch. |
| Final harvest handoff | yes | Emit full harvest handoff with changed list, needs attention, and stopping checkpoints. | Final response will include artifact anchors and recommended next owners. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-lexical-full-all-issues-robustness-harvest.md` | Final mechanical check recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and boundary | complete | Full-loop/no-soft-stop boundary recorded; runtime patching held until owner/proof/command matrix exists. | inventory |
| Inventory | complete | `issues-all-with-bodies.json` contains 2,741 issues, 2,722 with body text. | classification pressure |
| Test-name extraction | complete | Existing durable Lexical test harvest context consulted; no new test-source extraction needed for issue-body pass. | classification pressure |
| Classification pressure | complete | Classifier tightened after false positives from body boilerplate, `hr`, screenshot `image`, and standalone `linebreak`. | behavior extraction |
| Behavior extraction | complete | Every issue has a primary disposition and matrix key in `classified-issues.tsv`. | coverage mapping |
| Plite/Plate coverage mapping | complete | `coverage-map.md` records current proof posture for all 11 non-skip matrix families. | action planning |
| Action planning | complete | `matrix.md` groups non-skip rows with owner/proof/action/command. | ecosystem synthesis |
| Ecosystem synthesis | complete | Full corpus collapses into subfamily proof work, not 1,330 new tests. | closure review |
| Closure review | complete | Classifier verification passed; autogoal check will run after this plan patch. | final handoff |

Confidence score:
| Dimension | Weight | Score | Evidence | Cap hit |
|-----------|-------:|------:|----------|---------|
| Inventory completeness | 0.20 | 0.99 | All 2,741 issue rows fetched and classified; 14 checkpoint files cover the corpus. | issue comments not expanded |
| Behavior extraction depth | 0.20 | 0.91 | Full bodies used with deterministic classification; classifier repaired after false-positive audit. | heuristic classification, not human body review of each issue |
| Skip precision and negative controls | 0.15 | 0.90 | Docs/release/support/package/API/product skip families separated; Plate policy split from raw Plite. | some borderline product/raw split rows need review before apply |
| Plite/Plate coverage mapping accuracy | 0.20 | 0.93 | Current proof rows checked for IME, paste, tables, history/collab, shadow DOM, and synced selection. | no runtime proof executed because this is harvest-only |
| Actionability of copy/refactor/create plan | 0.15 | 0.94 | 11 matrix families and all non-skip rows have owner/proof/action/command or defer lane. | apply order still needs packet execution |
| Provenance and reproducibility | 0.10 | 0.97 | Raw corpus, classifier, JSON, TSV, matrix, report, coverage map, and checkpoints are all in scratch. | none |

License gate:
| Field | Value |
|-------|-------|
| License mode | permissive |
| Evidence files | `../lexical/LICENSE`, `../lexical/package.json` |
| Output directory | `.tmp/editor-issue-harvester/lexical/full/` |
| Output mode | scratch issue-body mode |
| Versioned copy policy | No versioned upstream issue/test copy; scratch-only classification and paraphrased invariant groups. |

Inventory accounting:
| Count | Value | Evidence |
|-------|-------|----------|
| issue rows fetched | 2741 | `issues-all-with-bodies.json` |
| issue rows with non-empty body | 2722 | `jq` corpus count |
| issue rows classified | 2741 | `classified-issues.json`, `classified-issues.tsv` |
| keep-portable | 1330 | classifier disposition count |
| plate-owned | 468 | classifier disposition count |
| defer | 107 | classifier disposition count |
| skipped | 836 | classifier disposition count |
| checkpoint batches | 14 | `checkpoints/checkpoint-01.md` through `checkpoint-14.md` |
| test files found | 271 | existing durable test harvest plus scratch inventory |
| uncertain | 0 | no `needs-follow-up` issue rows remain |

Matrix accounting:
| Source ref | Test ref | Tag | Behavior invariant | Proof kind | Owner coverage | Action |
|------------|----------|-----|--------------------|------------|----------------|--------|
| `classified-issues.tsv` | `coverage-map.md` | 11 matrix families | All non-skip rows grouped by portable/Plate/deferred invariant family. | package/browser/raw-device/benchmark/defer | `.tmp/plite` and Plate owner surfaces named per row | `matrix.md` names action and verification/defer command |

Skips and negative controls:
| Source / family | Reason | Negative-control evidence |
|-----------------|--------|---------------------------|
| docs-release-website | Website/docs/release/changelog issues do not define editor robustness invariants. | 519 rows classified as skip. |
| support-question-discussion | Questions, support, generic requests, and discussions stay out without a concrete invariant. | 137 rows classified as skip. |
| package-build-infra | Build, packaging, lint, Flow/TS, CI, and package-manager issues are not Plite behavior proof. | 46 rows classified as skip. |
| lexical-api-ontology | Node class/command/editor-state ontology is not copied into Plite. | Rows skipped unless another portable cluster matched first. |
| product/plugin policy | Lists, links, markdown, toolbar, typeahead, stickers, comments, playground UX route to Plate unless a raw invariant is split. | 468 rows classified Plate-owned. |

Next slice:
| Row | Owner | Action | Target | Verification / defer reason |
|-----|-------|--------|--------|-----------------------------|
| selection subfamily | `plite-patch` / `tdd` | split highest-risk word movement/delete and multi-leaf native selection rows | `generated-editing.test.ts`, richtext/plaintext/inlines examples | focused Playwright grep from `matrix.md` |
| clipboard subfamily | `plite-patch` | add only missing source-specific paste corpus rows | `paste-html.test.ts`, `clipboard-boundary.ts` | focused paste-html/clipboard commands from `matrix.md` |
| table subfamily | `plite-plan` or table owner first | define accepted whole-table/nested-table semantics before broad tests | `tables.test.ts`, future table model owner | current table containment rows exist; full model is not accepted |
| raw mobile | raw mobile proof lane | defer | device proof owner | `bun test:mobile-device-proof:raw` only on real devices |
| perf | `plite-ar-fast` / benchmark target | defer until target exists | benchmark target registry | benchmark required before runtime optimization |

Report artifacts:
| Artifact | Path | Status |
|----------|------|--------|
| full report | `.tmp/editor-issue-harvester/lexical/full/report.md` | current |
| full matrix | `.tmp/editor-issue-harvester/lexical/full/matrix.md` | current |
| coverage map | `.tmp/editor-issue-harvester/lexical/full/coverage-map.md` | current |
| raw issue body corpus | `.tmp/editor-issue-harvester/lexical/full/issues-all-with-bodies.json` | current |
| classified JSON | `.tmp/editor-issue-harvester/lexical/full/classified-issues.json` | current |
| classified TSV | `.tmp/editor-issue-harvester/lexical/full/classified-issues.tsv` | current |
| checkpoint files | `.tmp/editor-issue-harvester/lexical/full/checkpoints/checkpoint-*.md` | current |
| classifier | `.tmp/editor-issue-harvester/lexical/full/classify-issues.mjs` | current |

Behavior-only hygiene:
- status: passed
- evidence: External issue content stayed in scratch `.tmp` artifacts; no
  runtime/test/versioned Plite or Plate output copied issue prose or tests.

Findings:
- Full corpus collapses into 11 non-skip matrix families, not thousands of
  unique Plite actions.
- Strongest current Plite coverage is paste/html corpus, IME desktop/browser,
  history contracts, shadow DOM, table containment, and synced-block selection.
- Biggest residual lanes are raw mobile/device proof, benchmark-owned perf, and
  accepted semantics for whole-table/nested-table behavior.
- Many product/plugin issues are useful Plate pressure, not raw Plite law.

Decisions and tradeoffs:
- Kept full issue bodies and classification scratch-only.
- Treated comments as follow-up unless a body row requires comment-only proof.
- Refused to generate one local test per issue because that would be noisy
  maintenance garbage; grouped by behavior subfamily instead.
- Did not patch runtime in the corpus pass.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First classifier overmatched body boilerplate and screenshot markdown | 1 | Weight title/labels first; tighten body regex; remove unbounded `hr`, generic `image`, and standalone `linebreak` matches. | Classifier rerun verified 2,741 rows with saner disposition counts. |

Verification evidence:
- `gh issue list --repo facebook/lexical --state all --limit 5000 --json ... body`
  fetched 2,741 issue rows into `issues-all-with-bodies.json`.
- `jq` verified 2,741 total issues, 419 open, 2,322 closed, and 2,722 non-empty
  bodies.
- `node .tmp/editor-issue-harvester/lexical/full/classify-issues.mjs --verify`
  passed: 2,741 classified issues and no non-skip row missing owner/proof/command.
- `classified-issues.json` disposition counts: 1,330 keep-portable, 468
  Plate-owned, 107 deferred, 836 skipped.
- `ls` verified 14 checkpoint files.
- Targeted proof-row searches found named existing Plite rows for IME,
  paste, tables, history/collab, and shadow DOM.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure review complete for full issue-body harvest. |
| Where am I going? | Final handoff, then apply selected matrix subfamilies only when requested. |
| What is the goal? | Full all-state Lexical issue-body harvest with checkpointed classification and action matrix. |
| What have I learned? | Full corpus maps to subfamily proof lanes; raw mobile/perf/table-model remain deferred owners. |
| What have I done? | Fetched bodies, classified every issue, wrote checkpoints/report/matrix/coverage map, and verified artifacts. |

Timeline:
- 2026-06-03T20:18:25.258Z Goal plan created.
- 2026-06-03T20:20Z Full issue-body corpus fetched: 2,741 rows.
- 2026-06-03T20:24Z Initial classifier overmatched; repaired regex and product routing.
- 2026-06-03T20:29Z Final classifier verified all rows and wrote 14 checkpoints.
- 2026-06-03T20:33Z Coverage map written from current Plite proof rows.

Open risks:
- Classification is deterministic and full-body, but still heuristic; borderline
  product/raw rows should be reviewed before apply.
- Issue comments are not expanded; if an apply row points to comment-only proof,
  fetch that issue's comments then.
- Raw mobile, yjs browser, table model, and perf rows are intentionally deferred
  until their proof/architecture owners exist.

Packet ledger:
| Packet | Owner | Change / evidence | Decision | Next owner |
|--------|-------|-------------------|----------|------------|
| full-body-corpus | editor-test-harvester | fetched all issue bodies to scratch | keep | classifier |
| classifier | editor-test-harvester | added deterministic classifier and checkpoint generator | keep | coverage-map |
| classifier-repair | slate-automation | fixed overmatching from body boilerplate and product terms | keep | matrix consumers |
| coverage-map | slate-automation | mapped 11 matrix families to current Plite/Plate proof posture | keep | apply slice |

Changed list:
- code/runtime/API: none
- tests/oracles/browser proof: none
- benchmarks/metrics/targets: none
- examples/docs: updated this plan; wrote scratch issue harvest artifacts
- skills/workflow: none
- reverted/quarantined packets: none

Needs your attention:
- Review whether the 468 Plate-owned rows should trigger a Plate-side harvest
  pass. Recommendation: defer until raw Plite matrix slices are applied.
- Review table-model semantics before broad nested/whole-table issue work.
  Recommendation: use `plite-plan`, not local table example patches.
- Review raw mobile proof lane availability. Recommendation: do not apply
  mobile rows without real device artifacts.

Stopping checkpoints to unblock:
- none. Soft decisions were routed to matrix owners and final review attention.
