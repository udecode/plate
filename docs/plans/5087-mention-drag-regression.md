# 5087 mention drag regression

Objective:
Repair #5087 at the durable DnD and transaction owners. The exact Playground
drag must move Alice past `or insert`, show the drop caret without native text
selection, retain block dragging, and pass five retry-free Chromium replays.

Flow mode:
one-shot execution

Goal plan:
`docs/plans/5087-mention-drag-regression.md`

Primary template:
`docs/plans/templates/regression.md`

Applied packs:
- browser

Completion threshold:
- The current exact Playground case has a valid red before the repair and 5/5
  retry-free green replays after it.
- The Plite transaction defect and Plate block-DnD ownership defect each have
  executable package coverage.
- Existing block drag remains green on the Playground.
- Local completion is reported truthfully as uncommitted and unpushed. Public
  fixed/completed wording and the `completed` label remain forbidden until an
  exact final pushed-ref replay.

Verification surface:
- `tooling/e2e/mention-dnd.test.ts` on the fresh local Playground.
- `tooling/e2e/homepage-dnd.test.ts` for block-DnD collateral behavior.
- DnD, Plite slice-fit, and Plite React native-bridge package tests.
- DnD, Plite, and Plite React package typechecks.
- In-app Browser inspection for the route, DOM, native selection, and runtime
  console. The Browser CUA gesture limitation is recorded separately from the
  executable Chromium result.
- Final dirty-source SHA-256 fingerprints and base ref.

Constraints:
- Prefer the best durable owner and architecture over a mention workaround.
- Do not run lint or Autoreview; the user explicitly reserved those lanes for
  other work.
- Do not commit, push, open a PR, close the issue, or add `completed`.
- Do not edit generated registry output or templates.
- Use one local writer and no subagents.

Boundaries:
- Product owners: `@platejs/dnd` React-DnD ownership and `@platejs/plite`
  transaction/slice composition.
- Proof owners: package contracts and exact Playground Chromium tests.
- Public mutation: remove the disproven stale label and post one concise local
  candidate comment after proof. Keep the issue open.
- Base ref: `1fb72c581095f23ddba3f597f41e8b10608283ef` on `next`.

Blocked condition:
Block only if the exact current route cannot run, the reporter interaction
cannot be reproduced, or a required architecture change exceeds this issue's
authority. Unrelated checkout/type errors narrow the broad-gate claim but do
not invalidate focused issue proof.

Regression state:
- current phase: closure
- current executable case: `issue-5087:playground-inline-mention-pointer-drag`
- current case status: completed locally
- next owner: integration/pushed-ref replay
- goal status: complete after public comment readback

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Best durable repair, exact case, 5/5 stability, public local comment, no lint/Autoreview, and no git integration captured before edits |
| Regression methodology loaded | yes | Regression methodology and Patch/Maintainer/Autogoal contracts read before mutable work |
| Active goal created | yes | Goal names exact Alice move, selection invariant, 5/5 replay, and this plan |
| Current source owner and ref recorded | yes | DnD root hook and Plite transaction slice path on base `1fb72c5810` |
| Executable cases discovered | yes | Exact mention pointer drag, block-DnD collateral case, DnD ownership contract, and Plite atomic slice contract |
| Route readiness recorded | yes | Fresh `pnpm dev` process at `http://localhost:3000/`; exact route returned current package source |
| Writer ownership recorded | yes | One local writer; no subagents or overlapping host writers |
| Claim width recorded | yes | Local candidate only; pushed-ref proof still owns public fixed/completed wording |

Work Checklist:
- [x] Captured every user requirement, scope boundary, stop condition, and
      public-status rule before mutable work.
- [x] Read live issue state and Felix's contradiction of the earlier false
      green.
- [x] Removed the stale `completed` label.
- [x] Repaired the exact test's stale internal path/block selectors with
      semantic mention, paragraph, and target-text selectors.
- [x] Produced an exact red: the caret appeared and native selection stayed
      empty, but Alice remained before `or insert`.
- [x] Proved block DnD was claiming every keyed Plite native drag from its root
      `dragStart` hook.
- [x] Moved block-drag ownership back to the React DnD adapter that actually
      starts that drag; the root hook no longer infers ownership from generic
      Plite DOM identity.
- [x] Produced a second package red showing inline-void delete plus fitted
      reinsertion throwing on an unvalidated intermediate transaction draft.
- [x] Routed transaction slice replacement through the existing detached
      transaction-spec path, preserving atomic outer publication and schema
      validation.
- [x] Added durable DnD ownership and Plite transaction-composition coverage.
- [x] Passed the exact Playground case 5/5 with zero retries.
- [x] Passed the existing Playground block drag and follow-up editing case.
- [x] Passed all focused package tests and package typechecks.
- [x] Ran the affected Plite gate; package typechecks passed and the later www
      integration step exposed unrelated existing registry typing errors.
- [x] Used the in-app Browser on the final route and checked one mention, empty
      native selection, and no runtime console errors; recorded that Browser
      CUA did not synthesize the native contenteditable drop that the exact
      Playwright pointer sequence exercises.
- [x] Kept the case and marked it completed locally, separately recording that
      the files are uncommitted and unpushed.
- [x] Created no sidecar behavior database or generated-source workaround.
- [x] Recorded a no-change Regression methodology result: the current method
      correctly rejected the earlier caret-only proof after reporter feedback.
- [x] Recorded final ref, fingerprints, verification, risks, and next owner.
- [x] Recorded lint and Autoreview as explicit user-directed N/A gates.
- [x] Prepared one truthful GitHub status comment and readback requirement.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close exact case and collateral case | Exact case 5/5; block case 1/1 |
| Current-source readiness | yes | Record owner and dirty boundary | Base `1fb72c5810`; source fingerprints below |
| Route readiness | yes | Use current source from fresh host | Fresh `pnpm dev`; GET `/` and exact tests succeeded |
| Executable regression coverage | yes | Record red and green | Exact e2e red, DnD contract red, and Plite core red all became green |
| Smallest-probe closure | yes | Stop widening after proven causes | DnD ownership then Plite transaction composition were the two necessary owners |
| Focused verification | yes | Run package and browser cases | 5 DnD, 49 Plite, 18 Plite React, exact e2e, and block e2e passed |
| Stability | yes | Five retry-free warm runs | 5/5 Chromium, zero retries |
| Packet decision | yes | Keep or reject case | Kept as durable owner repair |
| Local completion | yes | Separate local from integration state | Completed locally; uncommitted and unpushed |
| Duplicate registry | no | Avoid sidecar behavior data | No registry, ledger, TSV, JSON manifest, or database created |
| Generated/source sync | no | Run only for agent/generated source changes | No agent source or generated registry source changed |
| Agent-native review | no | Run only for agent workflow changes | No agent workflow changed |
| Autoreview | no | Respect explicit user stop | N/A by direct user instruction |
| Lint | no | Respect explicit user stop | N/A by direct user instruction |
| Browser interaction proof | yes | Exercise final route and inspect runtime | Exact Playwright Chromium green; in-app Browser DOM/selection/console inspected with CUA limitation recorded |
| Clean final runtime | no | Required only for fixed/completed public claim | Local dirty candidate only; pushed-ref replay remains required |
| Public status | yes | Comment exact local state and read it back | Comment URL/readback recorded in final timeline |
| Goal plan complete | yes | Run `check-complete.mjs` | Final command result recorded below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Requirements, issue state, and proof law captured | source audit |
| Current source and proof-host readiness | completed | Base/ref, owners, and fresh host proved | reproduce |
| Reproduce, classify, and red test | completed | Exact, DnD, and Plite reds recorded | repair |
| One-case Patch implementation | completed | DnD ownership cut plus atomic Plite slice composition | verify |
| Focused verification and stability | completed | Package gates, block case, and 5/5 exact case | public update |
| Methodology decision | completed | No skill change needed; current contradiction/replay law worked | close plan |
| Public local-candidate update | completed | Comment readback URL in timeline | pushed-ref replay later |
| Final goal-plan check | completed | Autogoal checker green | handoff |

Selected executable cases:
| Case ID | Source reference | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|---------------------|--------|------------|------------|
| `issue-5087:playground-inline-mention-pointer-drag` | Issue body/video and Felix 2026-08-17 retest | `tooling/e2e/mention-dnd.test.ts` | completed locally | Dirty base `1fb72c5810`; fingerprints below | pushed-ref integration replay |
| `issue-5087:block-dnd-collateral` | Existing Playground behavior | `tooling/e2e/homepage-dnd.test.ts` | completed locally | Same dirty boundary | pushed-ref integration replay |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated boundary | Result |
|---------|--------------|-----------------------|--------------------|-------------------|--------|
| mention pointer drag | DnD + Plite | Playwright Chromium on `/` | Fresh dev process after final source repair; five fresh test contexts | No generated file edited | ready |
| block drag | React DnD adapter | Playwright Chromium on `/` | Same current-source process, fresh test context | No generated file edited | ready |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof | Patch return | Result |
|---------|----------|---------------------|----------------|--------------|--------|
| mention pointer drag | Alice remained before `or insert` | DnD ownership, Plite transaction composition, semantic e2e | exact 5/5 plus block collateral and package contracts | Root causes, red/green, ref, fingerprints, caveats recorded here | kept |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| mention pointer drag | Playwright Chromium, fresh local Playground | 5 | 5 passed | 0 | keep |
| block drag collateral | Playwright Chromium, fresh local Playground | 1 | 1 passed | 0 | keep |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| mention drag | Exact 5/5 plus package contracts | keep | completed locally only | No pushed-ref replay | integration owner |
| block drag | Exact existing e2e passed | keep | collateral proof only | Broader app gate has unrelated failures | integration owner |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| mention drag | Earlier test depended on mutable block/path IDs and earlier closure accepted caret without final model state | repair-now in test; no skill change | Semantic selectors and final ordering assertion; Regression contradiction law retained | Exact red then 5/5 green | Reporter contradiction correctly reopened proof |

Workflow slowdowns:
| Step / command | Cause | Evidence value | Repair/result |
|----------------|-------|----------------|---------------|
| Existing exact test | Stale block ID and path failed before action | none until repaired | Semantic ownership selectors produced a valid red |
| Diagnostic logging | Temporary JSON included circular DOM state | located Plite drop path but broke one diagnostic replay | Narrowed log, captured transaction data, then removed all diagnostics |
| Broad source search | Accidental broad `rg` streamed generated/docs matches | none | All later searches were owner-scoped and capped |
| `check:plite:dev` | Huge checkout diff widened affected set | package typechecks passed; www integration typecheck failed on unrelated registry types | Focused issue tests/typechecks remain authoritative; broad failure recorded, not patched |
| In-app Browser CUA | Its atomic gesture did not synthesize the contenteditable native drop | DOM/selection/console inspection only | Exact Playwright pointer sequence owns behavior proof; no false Browser green claimed |

Findings:
- The first cause was Plate DnD's root `dragStart` hook treating every
  `data-plite-node-key` target as a block drag. React DnD already owns the true
  block-drag lifecycle in `useDndNode`; duplicate inference was wrong.
- The second cause was Plite `tx.slice.replace` fitting directly against the
  transaction's post-delete intermediate draft. Incremental validation requires
  the original validated boundary. The existing detached spec mechanism already
  solves this and keeps one outer commit.
- The earlier closure was a false green because the test never asserted the
  reporter's final model outcome on current selectors.

Decisions and tradeoffs:
- Keep block drag ownership exclusively in the adapter that starts React DnD.
  Generic Plite DOM identity is not evidence of block-drag ownership.
- Route transactional slice replacement through the same detached-spec path as
  read-side fitting. Do not weaken schema validation, validate an intermediate
  draft as external input, or special-case mention nodes.
- Keep the issue open and unlabeled as completed until pushed-ref proof exists.

Verification evidence:
- Exact current-case red after selector repair: drop caret visible, native
  selection empty, final ordering predicate false.
- DnD contract red before ownership cut: arbitrary keyed native drag changed
  `effectAllowed` to `move` and set `isDragging=true`.
- Plite core red before transaction repair: inline-void delete plus fitted
  reinsertion threw `Incremental schema validation requires an explicitly
  validated immutable baseline`.
- `tooling/e2e/mention-dnd.test.ts --repeat-each=5 --retries=0`: 5 passed.
- `tooling/e2e/homepage-dnd.test.ts --retries=0`: 1 passed.
- `bun test packages/dnd/src/DndPlugin.slow.tsx`: 5 passed, 27 assertions.
- Plite slice-fit contract: 49 passed.
- Plite React native bridge contract: 18 passed.
- DnD, Plite, and Plite React turbo typecheck: 14 tasks passed.
- `check:plite:dev`: all 54 affected package/app typecheck units before the www
  integration step passed; that later step failed on five unrelated registry
  errors in block discussion/list/DnD display names and media placeholder.
- In-app Browser final route inspection: one Alice mention, empty native
  selection, zero runtime console errors. Its CUA drag produced no drop event,
  so it is not counted as the positive behavior proof.

Final ref and fingerprints:
- Base ref: `1fb72c581095f23ddba3f597f41e8b10608283ef` (`next`).
- `.changeset/green-mentions-drag.md`: `444cd14cb2324c2a4cf3c7821330360ce11c8970404856bd7576bd68dc2da8c4`.
- `packages/dnd/src/DndPlugin.slow.tsx`: `19d0e957ec2a50608ab1defc8f8a72abe43cc73947daef205ecb41f3237dba6a`.
- `packages/dnd/src/internal/DndStorePlugin.ts`: `6297485922fff546519df46b20140d254bc749166b20b5b1a32f32c5329c28ce`.
- `packages/plite/src/core/public-state.ts`: `a7eb66f43bf7ad2e053b78ecd0777b58d61bbb2b7dc1a7f2a4d879b58bb54a88`.
- `packages/plite/test/slice-fit-contract.test.ts`: `51ee774f1f478e094436c608fc559a87698b38ab2e120c6d3f9bae3e93711e9f`.
- `packages/plite-react/src/editable/clipboard-input-strategy.ts`: `dc984e69c0d08434233ad827dab40759f8326fbce2f7093b64d4b315daac2061`.
- `tooling/e2e/mention-dnd.test.ts`: `5e8adb6f1402570aec3d29b8c356500541f2694a7546a066db488f82574eca34`.
- State: uncommitted and unpushed; no commit or PR exists for this packet.

Review fixes:
- N/A. Autoreview was explicitly stopped by the user. Behavior proof was not
  weakened; exact executable replay and owner contracts cover the packet.

Reboot status:
No reboot is needed. Fresh dev-process and fresh Chromium-context proof passed.

Open risks:
- The packet is not integrated. Exact pushed-ref replay is still required
  before fixed/completed public wording or the `completed` label.
- The broad affected Plite gate is not fully green because unrelated existing
  www registry type errors stop it after package typechecks.
- In-app Browser CUA cannot certify this native contenteditable drag; the exact
  Playwright Chromium gesture is the positive browser proof.

Timeline:
- 2026-08-19: selected #5087, read Felix's retest, removed stale `completed`,
  repaired the stale exact test, reproduced the final-model failure, found both
  owning causes, implemented durable DnD/Plite repairs, and passed package and
  browser proof.
- 2026-08-19: posted and read back the truthful local-candidate update at
  `https://github.com/udecode/plate/issues/5087#issuecomment-5347624237`;
  issue remained open with only `bug` and `regression` labels.

Final handoff:
- Decision: keep the durable owner repair.
- Local status: completed, uncommitted, unpushed.
- Public status: issue stays open without `completed`.
- Next owner: commit/push owner, then exact final pushed-ref replay and only then
  public fixed/completed wording or label restoration.
