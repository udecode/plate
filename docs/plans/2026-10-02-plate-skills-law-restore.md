# Plate skills: restore lost law and fit pstack

Status: executed; the panel review in 2026-10-02-codex-panel-seats.md retired its cross-review hand-off, so no review is pending
Topic: pstack

## Public API

How you call the skills. Before is plate-2 before pstack (git `HEAD`).

```text before
$plate-plan [--quick|--standard|--deep] <Plate architecture/API question | accepted plan path>
$plite-plan [--quick|--standard|--deep] <Plite architecture/API question | accepted plan path>
$plate-review [all [plate|plite|both]] | [plugin|entrypoint|package|surface] <target>
$verify-plate [changed surface | package | route | cli | collaboration | browser-tool-issue]
$patch corpus <surface or cases>
$plite-research <question> [setup | doctor | next | log | state | promote-preview | shard | audit]
$editor-audit [audit [--target <surface|full>] <repo>...] | [sync ...]
$editor-test-harvester [<repo> [--since <commit>] [--issues ...] [--apply] ...] | plan ...
$issue-harvester <repo-key|owner/repo|ledger-path> [--state all|open|closed] [--refresh-only] [--slate-v2-only] [--plate-only] [--continue] [--batch-loop|timed 1h]
$clawsweeper [<update> | issue refs | cluster name | ledger batch | claim-sync | fork-dossier | ...]
$maintainer [heartbeat | issues | prs | security | queue | <issue-url|pr-url>] [--repo <owner/repo>]
$release-lanes [status | sync [dry-run] | promote [dry-run|execute] | verify | full <authorized release scope>]
$prototype <idea>
maintainer, sync-vision, issue-harvester: only when typed (blocked for the model)
```

```text after
$plate-architecture [quick | deep | audit] <question or plan path>
$plate-architecture audit <scope>
$verify [package | route | cli | collaboration | corpus] <target>
$verify corpus <surface or cases>
$research [audit | harvest | maintain | full] <topic, area or repo>
$research audit <repo>
$research harvest <repo>
$issue-harvester [slate] <repo or ledger>
$issue-harvester slate <update>
$maintainer [issues | prs | security | heartbeat | issue-draft] <url or text>
$release-lanes [status | verify | sync | promote] [dry-run | execute]
"prototype <idea>" in plain words runs pstack's Prototype playbook
maintainer, sync-vision, issue-harvester: typed, or loaded by a playbook that routes to them
```

## Main changes

- **Gates block again.** `plan-open.mjs` fails a Done plan on a gate row left `pending`, `TBD` or blank, and on an open box inside a numbered step, in every project synced from dotai. `validate-benchmark-plan.mjs --complete` refuses a plan whose verification evidence is missing or `Pending`. A plan with a Start Gates table is ready only once every row resolves.
- **Every pre-pstack code-quality law the two audits and the trail review found is back in the file an agent loads for that job**, except the doctrine fingerprint rows you cut on 2026-09-30 and the P1 autoreview gate, which the block's Review rule replaces. Restored laws include the scale catch-all, the hard cut's serialized-data counterweight, type-test exactness, constraint comments surviving `no-comments`, the whole-area sweep, the ban on weakening a gate to pass, evidence invalidation, diagnosis discipline, current-tree closure and module design tests.
- **Regression corpus is back** as `verify corpus`, with its validator and proof-receipt helper.
- **Plate Review's laws are back** in `plate-architecture audit`: the ownership and lifetime table, cache test, score caps and P0 to P3 scale. The scorer script stays deleted.
- **One owner per rule.** Failed-fix recovery lives only in the Bug fix playbook. `AGENTS.md` lost its lifecycle sections to the playbooks where they fire. `plate-plugins` and `plate-ui` point to `AGENTS.md`'s routing table.
- **Playbooks stop contradicting the block.** Build extends only pstack's Feature, and the lead writes the code in every playbook. No playbook inherits a pstack step that commits, pushes, replies on a PR without your word, writes snapshots or runs a separate writing pass the block forbids.
- **pstack is invoked, not restated.** Hard cuts and high-risk layers run `pstack:blast-radius`; `best-api-review` runs `pstack:why` before deleting a workaround; the Perf issue playbook points to its validator instead of copying its schema.
- **Failed fixes count only after the reporter assertion runs.** A crashed proof host is repaired and the same attempt restarts; the owner review compares deleting or merging owners before adding compensation.
- **Tests earn their place.** The testing audit and `issue-harvester` rank tests by the defect they catch, and score zero what a type, lint rule or existing test already catches.

## Defaults

- **No aliases.** Neither Claude Code nor Codex supports a user alias, so an alias is one more skill to load, drift and later retire. The daily loop runs on plain words through poteto-mode: "next", "review <scope>", "plan <goal>", "go", a bug report, "clean up PR <number>". Say "add aliases" to reverse.
- **Short argument hints, mode words first.** Codex shows no hint. Say "keep hints" to reverse.
- **Restore every lost law as text, and restore the corpus scripts.** Say "cut corpus" to keep the scripts out.
- **Keep Plate Review's scorer deleted, restore its laws as text.** Say "restore scorer" to bring the script back.
- **Keep `issue-harvester` separate from `research`.** Say "merge issue-harvester" to reverse.
- **Defer the `best-api` doctrine dedup against `docs/vision/plate.md`.** Say "dedup best-api" to run a measured pass.
- **Keep `best-api review`.** The plan said to fold it into `best-api-review`, but `best-api-review` itself says it does not replace detailed call-shape design, and the Babysit playbook and `plate-next` call `best-api review` for that. Say "fold best-api review" to reverse.

## Outcome

Every code-quality law the audits found holds again where it fired before pstack, each with one owner; the audits missed at least three failed-fix rules that a later review found, so the inventory is not proven complete. Lifecycle sits in playbooks. Every inherited pstack step that contradicts the block is either replaced in the project playbook or overridden by a named block rule. Plain words reach every skill the playbooks route to, in both runtimes.

## Steps

1. - [x] **Gate rows block closing.** `plan-open.mjs` (dotai `sync-pstack`, shared) fails a Done plan on an unresolved gate row; readiness needs only the Start Gates rows resolved; `validate-benchmark-plan.mjs --complete` already refused pending lanes, so it got no gate-row logic. Proof: dotai `4071dc0` (test failed first, then 37/37), Ellie `2ec916c70`, its decision-log row and the superseding readiness row.
2. - [x] **Restore the code-quality laws as text.** Every missing or weakened row in the two audits lands in its owner. Proof: the fresh law-loss recheck (59 held, 11 weakened, 6 cut on purpose, 0 missing), then a line check of the 14 sentences that close the weakened rows and the 3 failed-fix rules, each found once in its owner; `node --test .agents/rules/benchmark/scripts/benchmark-contract.test.mjs` 21/21.
3. - [x] **Regression corpus.** `validate-regression-plan.mjs`, `capture-proof-receipt.mjs`, their contract and tests, `references/corpus.md` and `templates/regression.md` restored under `.agents/rules/verify/`. Proof: 103/103 across the corpus and version tests, its decision-log row.
4. - [x] **Plate Review laws.** `plate-architecture.mdc` Audit section. Proof: its decision-log row.
5. - [x] **Playbooks stop contradicting the block.** Proof: a grep of all 7 `sync-pstack playbook` renders finds no inherited commit, push, snapshot or extra writing-pass step, and the remaining delegate lines fall under the block's widened lead-writes-code rule; its decision-log rows (the first superseded).
6. - [x] **One owner per rule.** Narrowed as the Defaults and its decision-log row state: Plan pages and the Feature review lookup stay in `AGENTS.md`, `maintainer` keeps its route table, `best-api-review` keeps its verdict-to-owner table, and `best-api review` stays. Proof: its decision-log row.
7. - [x] **Invoke pstack.** Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs .agents/rules/benchmark/templates/benchmark.md --complete` names each unresolved record, so `perf-issue.md` no longer copies the schema; its decision-log row.
8. - [x] **Invocation and hints.** Proof: dotai `9f76200` (hint parser), `sync-pstack verify` passed, `sync-pstack smoke` runs in Claude Code and Codex (next, a bug, clean up a PR, `$prototype`, an issue triage, go, plan and review) reached the right playbook 16 of 16; Codex's go answer was wrong until `build.md` stopped go on a Done plan, re-smoked in both; its decision-log rows.
9. - [x] **Close.** `bun x skiller@latest apply` and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` (exact); `node .agents/rules/plate-next/scripts/version.mjs validate`; `node --test` on the corpus, version and benchmark tests, 124/124; lint skip: `.agents/**` is ignored by `oxlint.config.ts` and `oxfmt.config.ts`; same-family decision-trail review and fresh law-loss recheck, findings applied per the decision log; one `unslop` pass; plan page republished.

## Claims

- No law from the two audits is lost without a recorded choice. Established by the fresh law-loss recheck and the line check of its 11 weakened rows; the testing reference dropped `costly` in favor of the block's newer Tests rule.
- Every rendered step that contradicts the block is replaced or covered by a named block override. Established by a grep of all 7 renders after the decision-trail review's fixes; the delegation steps in Bug fix, Refactoring, Perf issue and Hillclimb remain as text under the lead-writes-code override, which carries an override note for each.
- Plain words route correctly in both runtimes. Established by two `sync-pstack smoke` runs on 8 phrases: all 16 reached the right playbook, but Codex planned to build a Done plan on "go"; after `build.md`'s status check, a third smoke shows both runtimes stop.
- The cut `prototype` skill has a working replacement. Established by the smoke: `$prototype <idea>` reached pstack's Prototype playbook in Claude Code and Codex.
- Typed commands survive. Established by `sync-pstack verify` for cut modes; it skips names in `dropped`, so the `prototype` and `clawsweeper` cuts rest on the smoke and the retired-name map in `AGENTS.md` instead.

## Follow-ups

From `/pstack:reflect` after this run. Each is owner: zbeyens, tracked here until filed.

- Deferred, owner: zbeyens, tracked in this plan. `sync-pstack verify` fails an `In`, `Before` or `After` change on a step whose text a block `# overrides` note quotes.
- Deferred, owner: zbeyens, tracked in this plan. `hintModes` parses each `[...]` group on its own (today `[dry-run | execute]` hides `dry-run`), and `plan-open.mjs` fails a box line it cannot classify.
- Deferred, owner: zbeyens, tracked in this plan. `decisions-check.mjs` makes `corrected` and `superseded` rows name the row and plan step they replace; `plan-open.mjs` fails a step whose cited row is superseded.
- Deferred, owner: zbeyens, tracked in this plan. `verify` prints the typed count of every `dropped` name above 0 and wants a date and reason per entry.
- Deferred, owner: zbeyens, tracked in this plan. `apply --tag` and `verify` read `# overrides` notes on project rules outside the block (no-comments delete-on-doubt, duration typing, technical-writing hedging).
- Deferred, owner: zbeyens, tracked in this plan. `verify` with no project path checks every managed project.
- Deferred, owner: zbeyens, tracked in this plan. `verify` flags a routed skill that sets `disable-model-invocation: true`.
- Deferred, owner: zbeyens, tracked in this plan. plate-2 runs `node --test .agents/rules/*/scripts/*.test.mjs` from a script `pnpm check` runs.
- Deferred, owner: zbeyens, tracked in this plan. plate-2 Bug fix, Perf issue and Refactoring replace the delegation steps the block now overrides, instead of leaving their text.
- Deferred, owner: zbeyens, tracked in this plan. dotai gets a pre-push hook for `build-workflow --check` and the sync-pstack tests.
- Flagged, owner: zbeyens, tracked in this plan. Ellie's `docs/plans/2026-10-01-unified-broadcast-history.md` (another session's) still has `## Asks`, and the plan page renderer keeps mapping `asks` on purpose, so old plans' Asks render collapsed (closed by the shared-plan-pages plan).

## Evidence

- Law audits: about 380 laws checked in the implementation, API, test and bug-fix sources (24 lost: 9 missing, 15 weakened) and 1,353 in `AGENTS.md` and the other skills (52 lost: 8 missing, 44 weakened), against plate-2's git `HEAD` before pstack. Two independent Opus audits.
- Overlap review: 42 items, 14 keep, 21 trim, 4 merge, 3 cut.
- Invocation review: Codex ignores `argument-hint` and `disable-model-invocation` (inferred from Codex's migration notes and binary strings, not a live test); 432 of 471 plate-2 sessions are Codex.
- Commits: dotai `4071dc0`, `9f76200`, `1f93d13` (plan-open reads boxes nested in numbered steps, found while closing this plan) `83fd4f3` (the lead writes the code in every playbook) `4c2089c` (override notes for the three newly covered steps, plus the manifest the earlier commits left stale) `d9b7010` (the block states plan-open's gate-row check) and `f6eae59` (the approved reflect lessons), Ellie `2ec916c70`, `4547dc5c8`, `058014d11`, `2576d1026` and `86711650e`. plate-2 changes are uncommitted; the owner commits them.

## Proof

Each step names its proof. The checkout is shared with other sessions, so every check runs on this plan's paths.
