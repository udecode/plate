# repair public issue verification

Objective:
Audit Felix's replies to the pushed issue fixes and repair the verification
workflow; done when every reply is classified and future false-fix comments are
blocked by source rules, synced mirrors, and smoke proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-repair-public-issue-verification.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- browser (docs/plans/templates/packs/browser.md)

Expectation:
- user expectation: inspect all Felix replies in the authenticated GitHub
  notifications view, explain how prior fixes were verified incorrectly, and
  repair the owning skill so the same false-positive verification cannot recur
- observed miss: several locally verified and later pushed issue fixes were
  reported as fixed, but Felix says many remain broken; the prior workflow let
  synthetic/local evidence outrank the reporter's exact interaction and shipped
  behavior
- owning skill/template/helper: primary owner `.agents/rules/patch.mdc`;
  coordinator enforcement in `.agents/rules/maintainer.mdc`; mechanical plan
  gates in `docs/plans/templates/maintainer.md` and the Browser pack
- repair classification: derived-skill proof/completion-rule repair, not a
  generic autogoal rewrite

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: binary reply ledger and proof gates apply
- improvement loop: audit replies -> reconstruct false proof -> patch smallest
  source owner -> sync mirrors -> smoke/review
- final score / loop closure: N/A: close only when every reply and repair gate
  has evidence

Completion threshold:
- Every Felix reply visible in the current GitHub notifications queue that
  challenges these fixes is captured with issue number, exact complaint, prior
  verification claim, and current classification.
- The workflow cannot call a public behavior issue fixed or add `completed`
  from implementation-path proof, unit tests, DOM geometry, or one visually
  adjacent proxy alone. It requires a fresh clean-session replay of the exact
  reporter steps on the exact claimed surface from a fresh clean runtime at the
  final pushed ref, in the exact claimed browser/device; any limitation blocks
  fixed/completed wording.
- When the reporter says a pushed fix is still broken, the issue returns to
  `needs-repro`/open investigation; prior `completed` status and comments are
  treated as disproven evidence, not defended by local tests.
- The repaired workflow adopts the case-ledger method from
  `docs/plans/2026-08-17-rewrite-regression-harness-closure.md`: one externally
  observable case, stable identity, source provenance, explicit claim fields,
  final ref/fingerprint, deterministic red proof, and retry-free warm replay.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-repair-public-issue-verification.md` passes.

Verification surface:
- Authenticated Chrome audit of `https://github.com/notifications` and linked
  issue replies; live `gh issue view` read-back may structure facts but cannot
  replace the Chrome audit requested by the user.
- Source audit of every affected rule owner and generated `.agents`/`.claude`
  skill mirror after `pnpm install`.
- Goal-repair template smoke/checker proof, agent-native review, scoped lint,
  and P2 autoreview when the resulting rule diff is non-trivial.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.
- Use the user's authenticated Chrome session; do not substitute Browser or a
  public unauthenticated page.
- Read only: do not reply, label, close, reopen, assign, mark done, or otherwise
  mutate GitHub state during this audit.
- Do not re-fix every product issue in this task; produce the exact issue ledger
  and durable workflow repair. Product repairs remain separate owner tasks.
- Preserve unrelated checkout changes. Do not inspect git status, branches, or
  worktrees; do not commit, push, or create a PR.

Boundaries:
- Source of truth: latest user correction, authenticated GitHub notification
  replies, linked live issues, current source rules, and synced generated mirrors.
- Allowed edit scope: this plan; `.agents/rules/patch.mdc`;
  `.agents/rules/maintainer.mdc`; the aligned public-status line in
  `.agents/AGENTS.md`; `docs/plans/templates/maintainer.md`;
  `docs/plans/templates/packs/browser.md`; generated root/`.agents`/`.claude`
  mirrors through `pnpm install`.
- Derived skill scope: public issue coordinator (`maintainer`) and local
  behavior repair owner (`patch`). `plate-ui` is deliberately not patched
  because the miss spans package, DnD, selection, crash, and registry cases.
- Non-goals: application-code fixes, new wrapper skills, generic autogoal
  doctrine, GitHub writes, commits, pushes, PRs, releases, and unrelated cleanup.

Output budget strategy:
- Read notification rows and linked replies in bounded Chrome snapshots. Build
  a compact issue ledger in this plan instead of streaming full pages. Use exact
  `rg` patterns and short rule-file slices; exclude generated apps, builds,
  dependencies, logs, and broad issue queues unless a named reply points there.

Blocked condition:
- Stop only if Chrome is unavailable/unauthenticated after its documented
  recovery path, the notification page does not expose the replies and live
  issue state cannot identify them, or source ownership remains ambiguous after
  reading the three candidate rule owners.

Repair state:
- repair_type: derived skill proof/completion repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready for completion check

Current verdict:
- verdict: repair `patch` proof law and `maintainer` public-status acceptance;
  add mechanical case/replay gates to the maintainer template and Browser pack
- confidence: high
- next owner: `patch repair reporter-valid final-ref proof`
- reason: Chrome shows five exact failures and three incomplete workflows after
  local green claims; prior plans lack final pushed refs/fingerprints and several
  oracles checked only an intermediate or proxy state

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-repair-public-issue-verification.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Chrome reply audit, false-proof diagnosis, durable skill repair, proof, and non-goals recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Exact expectation and observed miss recorded above |
| Active goal checked | yes | `get_goal` returned none before plan creation |
| Named plan or skill read | yes | Read complete Chrome, maintainer, autogoal repair, skill-creator, and agent-native-reviewer skills |
| Owning source selected | yes | Primary patch proof owner, maintainer public-status owner, aligned AGENTS/template/browser-pack gates; plate-ui rejected as non-common owner |
| Repair classification selected | yes | Derived-skill proof/completion repair |
| Safety conflict checked | yes | Stronger reporter-valid proof raises, not weakens, evidence safety |
| Output budget strategy recorded | yes | Bounded Chrome snapshots and exact source reads; issue ledger stored here |
| Agent-native pack selected | yes | Skill/rule action and generated mirror parity are in scope |
| Agent-facing action surface identified | yes | Public issue fix verification and verified-fix comment/label decision |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `.agents`/`.claude` mirrors with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read complete skill before repair |
| Browser pack selected | yes | Authenticated Chrome notification/reply evidence is mandatory |
| Browser route / app surface identified | yes | `https://github.com/notifications` and linked Plate issue replies |
| Browser tool decision recorded | yes | Explicit `@Chrome` request; use Chrome only |
| Console/network caveat policy recorded | yes | N/A for reading GitHub reply text; record access/auth failures only |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with Chrome, issue, prior-plan,
      and durable-test evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified: maintainer accepts the packet/public
      status; maintainer template and Browser pack enforce the proof mechanically;
      `.agents/AGENTS.md` keeps root policy aligned.
- [x] Patch touches source-of-truth files only; generated skills/root AGENTS are
      produced by `pnpm install`.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded:
      patch/maintainer own this lane-specific miss; generic autogoal is unchanged.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded below.
- [x] Final response shape is recorded: verdict, exact issue ledger, false-proof
      cause, repaired owners/gates, verification, unchanged GitHub state, and next work.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from patch,
      maintainer, root AGENTS, and the plan templates.
- [x] Agent-native pack: generated mirrors are synced with final `pnpm install`.
- [x] Agent-native pack: accepted agent-native and P2 review findings are fixed;
      the unrelated pre-existing Plate UI generated-sync finding is rejected below.
- [x] Browser pack: notification route, issue links, and expected reply ledger were recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. Chrome was
      explicitly requested and used for the authenticated queue/replies.
- [x] Browser pack: console and network errors are N/A for authoritative GitHub
      reply-text reading; access/auth succeeded.
- [x] Browser pack: screenshot waived because Chrome DOM exposed exact comment
      text, author, timestamp, URL, state, and labels; pixels add no authority.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `patch.mdc` exact-case/final-pushed-ref law; `maintainer.mdc` acceptance/invalidation law; aligned AGENTS/templates |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | Final `pnpm install` passed; Codex/Claude patch and maintainer mirrors are byte-identical |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Fresh maintainer+browser smoke contained case, pushed-ref, clean-runtime, repeat, and contradiction gates; smoke deleted afterward |
| Incomplete-plan guard | yes | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | Checker exited 1 and named every new unresolved gate |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | Template exposes all case/status/evidence fields; both forward tests produced complete packets without source/template edits |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no helper or checker script changed |
| P2 autoreview / review | yes | Run applicable autoreview gate with `--max-priority P2`; P3 is opt-in only, or record N/A for docs-only/source-rule-only repair | Three accepted loopholes fixed across review cycles; final isolated P2 review clean, correctness 0.94 |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | `git diff --check` passed; Markdown/MDC sources have no owning formatter command |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Chrome/page reads and source audits were bounded; one combined skill read truncated and was reread in exact chunks |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-repair-public-issue-verification.md` | Final pass complete after the self-evidence row was filled |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Final install passed; `.agents` and `.claude` patch/maintainer mirrors match; root AGENTS contains aligned public-status rule |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Exact terms found in source rules, generated skills, root AGENTS, maintainer template, and Browser pack |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Capability map below passes; no missing route/source/mirror/proof link remains |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Authenticated Chrome read notifications and every linked Felix reply/body |
| Browser console/network check | no | Record console/network state or why it is not applicable | N/A: read-only GitHub text audit; authentication/navigation succeeded and runtime health is not the claim |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Felix reply ledger below records exact issue URLs, author text, state, and classifications; screenshot waived as non-authoritative duplicate |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | completed | Requirements, skills, authority, and proof gates recorded | Chrome reply audit |
| Chrome reply audit | completed | All ten notification-derived issue replies and challenged bodies were read | target selection |
| Target selection | completed | Reply ledger plus prior test/plan audit selected patch as proof owner and maintainer as public-status owner | patch |
| Patch | completed | Source rules, public status rule, maintainer template, and Browser pack enforce the repaired method | verification |
| Verification | completed | Sync/parity, template smoke, forward tests, agent-native map, diff check, and clean final P2 review | closeout |
| Closeout | completed | Plan evidence and residual product/GitHub risks recorded | final response |

Findings:
- Prior #5091 verification proved that an explicit focus call removed stale
  paint in one local homepage run. That did not prove the pushed checkout or
  the reporter's repeated environment stayed fixed, and the workflow treated a
  single proxy observation as closure.
- Chrome notification audit found ten Felix replies: five exact failures
  (#5085-#5088, #5091), three incomplete or residual workflows (#5064, #5065,
  #5070), and two confirmed fixes (#5071, #5084).
- The prior broad plan recorded all ten rows as `completed` without a tested
  final commit/ref or source fingerprint. Its proofs were tied to an evolving
  dirty checkout, so the accumulated pushed result was never replayed.
- #5088's durable test checked native selection during the drag but not after
  mouseup and never asserted that the floating toolbar stayed closed. Felix now
  sees block styling plus native selection and the floating toolbar together.
- #5091 treated disappearance of the selection highlight as success although
  acceptance required the selection to remain aligned with the resized text.
- #5085-#5087 had plausible exact local Playwright flows, but no final pushed-ref
  replay. A green local route cannot certify a later accumulated push.
- #5065 proved cell-to-cell movement and editor focus, but not destination
  selection shape; Felix reports every destination cell becomes fully selected.
- #5064 and #5070 fixed the named crash but left lag/caret symptoms in the same
  workflow. The workflow needs an explicit residual-case disposition, never a
  blanket `completed` label.
- The rewrite-regression plan supplies the missing method: stable observable
  case identity; source refs; claim fields for model, DOM, selection/caret,
  focus, popup/toolbar, errors, and follow-up input; final ref/fingerprint;
  retry-free warm repeats; and methodology repair when the real route cannot run.

Felix reply ledger:
| Issue | Chrome reply | Verdict | Prior proof gap |
| --- | --- | --- | --- |
| #5064 | Crash fixed; noticeable lag remains | incomplete workflow | Crash-only oracle omitted performance symptom/disposition |
| #5065 | Navigation works; destination cell text is fully selected | incomplete workflow | Focus/cell movement oracle omitted selection shape |
| #5070 | `removeChild` crash fixed; unexpected inline caret remains | incomplete workflow | Crash/order/typing oracle omitted drag-time caret rendering |
| #5071 | ArrowLeft boundary behavior confirmed fixed | confirmed | none exposed by reporter retest |
| #5084 | Vertical caret flash confirmed fixed | confirmed | none exposed by reporter retest |
| #5085 | Floating Bold still clears/fails to format | false fixed | no replay on final pushed ref/fingerprint |
| #5086 | Seeded suggestion still crashes with `removeChild` | false fixed | no replay on final pushed ref/fingerprint |
| #5087 | Drop caret appears but mention does not move | false fixed | no replay on final pushed ref/fingerprint |
| #5088 | Block styling appears alongside native text selection/toolbar | false fixed | post-mouseup selection and toolbar state were not asserted |
| #5091 | Stale previous-width highlight remains | false fixed | disappearance was accepted instead of aligned-selection preservation; no final-ref replay |

Decisions and tradeoffs:
- Patch `patch.mdc` as the primary owner because it creates and certifies the
  behavior proof packet. Patch `maintainer.mdc` only to reject incomplete
  packets and distinguish a local candidate from a fixed/completed final ref.
- Add mechanical plan rows to the maintainer template and Browser pack because
  prose-only proof gates already failed in five cases.
- Do not patch `plate-ui`: the miss spans package, DnD, selection, crash, and
  registry cases; UI doctrine is not the common owner.
- Do not implement the full 60-demo harness here. Reuse its one-case method and
  stop at the public-issue workflow repair requested by the user.

Review fixes:
- Accepted P2: unpushed commits could qualify as fixed -> fixed/completed now
  requires replay on the exact final pushed ref.
- Accepted P2: Chrome could be only a spot check -> when Chrome is claimed, the
  entire final replay and 5/5 warm ledger must run in exact Chrome.
- Accepted P1: a fresh page could reuse a stale/dirty dev server -> fixed proof
  now requires a fresh process from a clean final-pushed-ref checkout or
  immutable CI artifact with zero issue-owned runtime-input drift.
- Rejected P2: generated root AGENTS also synced an unrelated Plate UI ownership
  change -> that source change pre-existed this repair and parity generation is
  mandatory; the final isolated review excluded that unrelated generated delta.
- Accepted P2: `patch` still advertised regression clusters -> clusters,
  harness rewrites, and closure loops now route to `auto regression`, which
  delegates one normalized observable case at a time.
- Final isolated `autoreview --mode local --max-priority P2 --no-web-search`:
  clean, no accepted/actionable findings, correctness 0.94.

Repair patch notes:
- `patch`: exact reporter-derived case contract; proxy/stub refusal; complete
  end-state fields; fresh process; clean final pushed ref; fingerprints; exact
  browser; 5/5 warm runs; candidate-local handoff; one-case-only routing.
- `maintainer`: local candidates cannot be fixed/completed; label authority
  cannot waive proof; pushed-ref replay is mandatory; reporter contradiction
  invalidates prior proof; residual symptoms cannot keep blanket completion.
- Maintainer template and Browser pack: mechanically materialize exact-case,
  final-ref, clean-runtime, fingerprint, repeat, exact-browser, and reporter
  contradiction gates.
- `.agents/AGENTS.md`: aligned public issue status rule; `pnpm install`
  regenerated root and Codex/Claude skill mirrors.

Deliberate non-repairs:
- Product bugs #5064, #5065, #5070, #5085-#5088, and #5091 are not re-fixed in
  this workflow task; each needs a separate normalized case through
  `auto regression`/`patch`.
- GitHub labels/comments are not mutated. Eight open issues still have stale
  `completed` labels and need a separately authorized correction pass.
- The full 60-demo rewrite harness is not implemented here; only its proven
  one-case methodology is adopted.
- `plate-ui` is not patched because it is not the cross-issue proof owner.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First structured issue-body extraction used a locator before GitHub rendered it | 1 | Wait for DOM content and use a read-only document query per notification-derived URL | All seven challenged issue bodies extracted |
| Combined generated-skill mirror audit put a backtick inside a double-quoted shell pattern | 1 | Use a single-quoted `rg` pattern | Mirror parity/source audit passed |
| Initial broad skill read was truncated | 1 | Reread each selected skill separately and the missing autogoal range by exact lines | Every selected skill and referenced methodology plan read completely |
| P2 review found unpushed-ref and partial-Chrome loopholes | 1 | Require final pushed ref and full exact-Chrome replay/ledger | Fixed and mirrors resynced |
| P2 review found stale/dirty runtime loophole | 1 | Require fresh process from clean final-pushed-ref checkout or immutable artifact | Fixed and mirrors resynced |
| P2 review found regression-cluster bypass | 1 | Route clusters to `auto regression`; keep patch one case | Fixed and final P2 review clean |

Verification evidence:
- Chrome `https://github.com/notifications`: ten Plate notifications audited;
  linked issue replies/body text read under authenticated user state.
- Felix ledger: five exact failures, three incomplete/residual workflows, two
  confirmed fixes.
- `pnpm install`: final source-to-Codex/Claude/root generation passed.
- `cmp -s` for patch and maintainer Codex/Claude mirrors: passed.
- Source audit found candidate-local, clean final pushed ref, exact-browser
  replay, reporter invalidation, and auto-regression routing in generated skills.
- Fresh maintainer+Browser smoke plan contained every new gate; `check-complete`
  rejected the untouched smoke plan with the new rows unresolved.
- Forward test #5091: returned `needs-repro`; rejected disappearance of the
  required selection as acceptance failure.
- Forward test #5086: allowed only a `candidate-local` progress comment; rejected
  `completed` despite prior label authority; required exact Chrome and final
  pushed-ref 5/5 replay.
- Agent-native capability map below: every action has a route, source owner,
  generated/discoverable output, and proof.
- `git diff --check` on owned source/generated/template/plan paths: passed.
- Final isolated P2 autoreview: clean, no accepted P0-P2 finding, correctness 0.94.

Agent-native capability map:
| User action | Agent route | Source owner | Mirror / plan | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Fix one reported behavior | `maintainer` -> `patch` | `.agents/rules/patch.mdc` | Codex/Claude patch skills | #5091 forward test | pass |
| Handle a regression cluster | `auto regression` -> one-case `patch` | `.agents/rules/auto.mdc` + patch route | generated auto/patch skills | source audit + clean P2 | pass |
| Comment or label public status | `maintainer` | `.agents/rules/maintainer.mdc` + `.agents/AGENTS.md` | maintainer skill + root AGENTS | #5086 forward test | pass |
| Invalidate false prior proof | live GitHub/Chrome -> `maintainer` | reporter-invalidation section | maintainer skill/template | ten-reply Chrome audit | pass |
| Create an issue proof plan | maintainer template + Browser pack | `docs/plans/templates/**` | instantiated runtime plan | smoke + failing incomplete checker | pass |
| Sync agent instructions | `pnpm install` | `.agents/rules/**`, `.agents/AGENTS.md` | `.agents`/`.claude`/root mirrors | cmp + rg parity audit | pass |

Final repair handoff:
- Expectation: reporter-valid verification must block false fixed/completed claims
- Repaired owner: primary `patch`; coordinator `maintainer`; mechanical
  maintainer-template/Browser-pack gates; aligned root agent policy
- Files changed: `.agents/rules/{patch,maintainer}.mdc`, `.agents/AGENTS.md`,
  generated root/Codex/Claude mirrors, maintainer template, Browser pack, and
  this repair plan
- Verification: Chrome ten-reply audit, template/checker smoke, final sync and
  parity, two forward tests, agent-native map, diff check, clean final P2 review
- Caveat: product fixes and stale public labels remain separate authorized work

Timeline:
- 2026-08-17T10:06:20.607Z Goal repair plan created.
- 2026-08-17 Authenticated Chrome audit read all ten Plate notification replies
  and linked issue bodies; no GitHub write was made.
- 2026-08-17 Read the full rewrite-regression harness plan and adopted its
  stable-case, claim-field, final-ref, fingerprint, and warm-replay method.
- 2026-08-17 Audited prior plans and durable Playwright rows; selected
  `patch` as primary proof owner and `maintainer` as public-status owner.
- 2026-08-17 Patched source rules/templates, synced generated skills, and
  forward-tested #5091 and #5086 raw evidence in fresh contexts.
- 2026-08-17 Closed four review cycles: pushed-ref truth, exact Chrome,
  clean-runtime provenance, and one-case routing; final P2 review clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final goal check and user handoff |
| What is the goal? | Audit every Felix correction and make reporter-valid exact replay mandatory before fixed/completed claims |
| What have I learned? | Five exact failures, three incomplete cases, and two confirmed fixes expose final-ref and claim-width gaps |
| What have I done? | Audited every reply, repaired/synced the workflow, smoke-tested plans, forward-tested behavior, and closed P2 review |

Open risks:
- Existing open issues still carry stale `completed` labels. This audit has no
  GitHub mutation authority, so label correction and product re-fixes remain
  explicit follow-up work.
