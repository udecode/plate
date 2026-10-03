Same-family review: the author and I both run Opus 5.5. `decisions-check` passes on all 67 rows, including the new 21:13:05Z rows. `plan-open` reports 8 open boxes, which is expected while the plan is blocked. I re-ran `bun test device-witness` (16 pass), `node --test check-plite.test.mjs` (32 pass), the device `tsc` typecheck (exit 0) and `sync-resources --check` (exact).

## P1

1. **The deslop and lint pass invalidated the paste proof, and nothing records it.** Row 17:06:53Z (verified paste transport), the paste box (plan:347-354) and topic:105 still cite the chromium 381, firefox 340, webkit 352 and mobile 155 runs.
   - The paste code changed after those runs: `harness-input.ts` at 20:42Z, `dom-text.ts` at 20:44Z, `plaintext.test.ts` (the red-then-green proof) at 20:45Z, and `dom-text-actions.ts` (`didPasteApplyText`, the success oracle) at 20:49Z.
   - The only re-run I found is a scratch log no row cites, `paste-chromium-deslop.log` (20:48Z). It ran chromium only, 120 passed in 8 batches, and it came before the 20:49Z edit.
   - The same problem hits the trace box (plan:261-268). Its proof ran at 15:57Z, but `native-event-trace.ts` changed at 20:38Z (`pointerdown` plus deslop). Rows 16:00:32Z and 17:41:22Z (helper "recovery proven") predate edits to `macos-ime.swift` (20:41Z) and `native-chrome.mjs` (20:49Z).
   - **Fix:** re-run the paste specs per project plus the trace browser test, append the rows, and supersede 17:06:53Z, or mark those boxes partial.

2. **The stated cause of the adb witness limit is contradicted by the raw traces.** Plan:538-542, shard 010:77-80, rows 21:01:52Z (two of them), `device-witness.test.ts:47,63-66`, `record-witness-fixtures.mjs:284-285` and `bypass.device.ts:106-107` all say adb replays look like a real tap "only while Gboard composes".
   - Neither recording has any composition event in the `adb-input-*-inside` windows. In the old fixture (`device-witness-traces.before.json`) the replays arrived as `Unidentified` with no composition at all. In the new one they carry `a` and `x`.
   - Shard 010 itself says "English Gboard never composed", and the bypass test types in English.
   - Row 12:49:56Z ("proven: distinct keydown signatures for … adb input text") is narrowed by this finding but was never superseded. Plan:668-670 still lists it as a settled fact.
   - **Fix:** restate the limit as "adb inside a tap is sometimes indistinguishable; cause unknown", supersede 12:49:56Z, and fix the comments.

3. **"Fails outside this change" is unproven.** Row 17:06:53Z (exclude two tests) is honest: its evidence says "inferred: not rerun at HEAD". But the paste box (plan:352-354) and topic:105 state the claim as fact.
   - The second excluded test, `paste-html.test.ts:1279`, is a `pasteHtml` test on chromium and webkit. Before this change it could have passed through the deleted `insertData` fallback, so this change may have caused the failure. AGENTS.md says a failure counts as pre-existing only after a detached-worktree run at HEAD.
   - "9 failed outside paste" also contradicts row 17:06:53Z (mobile-webkit failures), which says two of the nine are paste tests.
   - **Fix:** run both tests at HEAD in a detached worktree. Until then, word the box as "excluded, cause unproven".

4. **The topic page cites a review that does not exist.** Topic:114-116 states a release-trust rule and cites review `2026-10-02-proof-release-trust`.
   - No such file exists under `git ls-files`, and `review-ledger lookup proof` shows no such record. No log row mentions it, and the Phase 3 box (plan:639-641) is still open.
   - **Fix:** remove the citation or record the review, then close or keep the box to match.

## P2

5. **"Chrome pid on all 35 runs" proves nothing.** Plan:581-583 and row 21:13:05Z (re-proof) make this claim.
   - The pid is read once in `global-setup.ts:141`. `lane.ts:717-719` then copies that same state value into every case annotation, so it can never differ between runs.
   - Only 30 runs carry the annotation; the bypass test does not use the `device` fixture.
   - **Fix:** re-read `chromePid(serial)` in each test's teardown, or narrow the claim to "one pid at setup; the target resolved on each worker attach".

6. **An "unchanged code" claim with no check behind it.** Row 21:13:05Z and plan:590-592 say "the lock, doctor and reattach code did not change since" the restart and interrupt records (`device-interrupt.log` and `device-restart.log`, 19:49Z).
   - The files that hold that code changed later: `android.ts` (doctor and restore) at 20:55Z, `android.mjs` (the restore force-stop) at 20:49Z, `lane.ts` (the worker reattach) at 20:52Z and `global-setup.ts` at 20:59Z.
   - Rows 18:52:42Z and 20:07:11Z (restore) are still marked verified on those earlier bytes.
   - **Fix:** re-run the kill-restore and forced-restart cases, or mark both rows partial and name the check (a diff) that would show no change.

7. **"Same named product failure in 5 of 5" shows only that the assertion threw.**
   - `lane.ts:611-613` records only the error's first line, which in `reproof-device.json` is `Error: expect(received).toBe(expected) // Object.is equality`, with no received value. The `BecuasegoBecause ` value on topic:108 and the drafts' "fails the same way" have no per-run evidence.
   - The autocorrect draft has no committed trace, against the Default at plan:110-112 ("records its trace").
   - Results are not kept: the config uses `reporter: 'list'`, and `outputDir` is wiped on every run. That contradicts the Default at plan:67-68 ("kept as Playwright reports with per-run attachments").
   - **Fix:** put the received value in the annotation, commit one autocorrect trace, and record the reporter change as a deviation.

8. **Approved items changed with no row in the Execution deviations table.**
   - Row 17:06:53Z (the paste-html example fix) overrides the Default that bugs become local drafts.
   - Restore force-stops Chrome (`tooling/device/android.mjs:45-55`), against "Restore only owned resources" (plan:474-477).
   - The key-map cache key (`android.ts:546-553`) has no orientation or shift state, against the Default at plan:53-54. `confirmKeyboard` (`lane.ts:435-450`) never checks shift, yet the box at plan:501-503 is ticked.
   - `doctor` refuses on a stale lock rather than a stale restore file (`android.ts:737-744`), against plan:478-479.
   - The spec lives at `apps/www/tests/native/homepage-ime-native.spec.ts`, not the path in plan:269 and Scope:194.
   - The `reporter` change from item 7.
   - Row 21:03:17Z narrowed `review_scopes`.
   - **Fix:** add a table row for each.

9. **The Status line says "everything else built", which is false.** Several items are not built, and some have no owner:
   - The DOM-only production control was never run (row 17:35:56Z, benchmark drivers, partial), and the plan's "Still open" note (plan:395-400) omits it.
   - Two benchmark drivers are blocked for reasons that are not owner steps, and none of these open items names an `owner:`.
   - The Proof section (plan:701-705) requires owner rows for physical phones and other keyboards. None exist; `grep physical` finds only the Do Not Disturb note.
   - **Fix:** list these items in Status and add owner rows.

10. **The topic page contradicts itself and the plan.**
    - Topic:86 says "production entries carry none of it", but topic:49-51 and row 17:35:56Z (Plate barrel left open) say `platejs/react` still carries the handle.
    - Topic:110 says the spec is built, and topic:60 says the helper "drives the real macOS Pinyin". No row records the spec, config or setup being built, the plan box has no "Built:" note, and Pinyin selection never succeeded (rows 17:41:22Z).
    - **Fix:** correct topic:86 and :60, and add a build row for the native spec.

11. **Row 17:40:22Z's reason for skipping a doctrine version does not hold.** It says no Plate Next doctrine version is needed "because the change is test infrastructure". But the change adds exports to `plitejs/react` and `platejs/react` and removes Editable's default attach. The topic's Hard cuts section and two changesets document that with migration notes.
    - **Fix:** give a reason that matches the evidence, or append the version.

## P3

12. **The deviations table has no decision-log row column**, although its own header (plan:119-120) and row 20:29:38Z (deviations table) say every item names its row.
13. **The witness checks less than the plan says.**
    - Plan:520 and shard 010:74 claim that composition updates are paired with a `keydown`. `witness.ts:118-131` pairs only `beforeinput`.
    - Row 20:29:38Z (`pointerdown` trace type) claims the `missing-pointer` rule runs "on the recorded fixtures". No fixture or test exercises `missing-pointer`, `overlap` or `unexpected-pointer`.
14. **Two bypass and fixture checks prove less than they look.**
    - `bypass.device.ts:108` accepts an empty rule set as "equivalent", which would also pass if the replay never reached the page.
    - In the fixture `adb-input-keyevent-inside`, the "real h" tap actually inserted `c`. The recorder never confirms which keyboard layout is showing.
15. **Plan and topic disagree on Public API.**
    - The plan's Public API has no pair for the public trace-entry change. The topic already shows it and both other pairs as current, which contradicts plan:136-137 ("subject records current behavior until execution proves").
    - The topic's fence paraphrases `TRACED_EVENTS` instead of copying the real call site.
16. **Smaller trail defects.**
    - Row 21:01:52Z (superseded) names a claim, not an earlier row.
    - Row 21:13:05Z (supersede) says the topic page was fixed, but the topic was last modified at 20:31Z.
    - Rows 20:21:01Z, 21:01:52Z and 21:13:05Z cite session-scratch evidence, which row 13:14:32Z already ruled teammates cannot open.
17. **A Default kept a premise the probe refuted.** Plan:99-101 still says a handle selection keeps typing "on the native fast path". `browser-handle-preference-probe.result.json` shows model-owned input on both paths, with native input not allowed.
18. **The cut case 5 gap has conflicting owners.** Row 20:07:11Z says owner zbeyens, "tracked in" the autocomplete plan. That plan was not updated (last modified Oct 1), and its line 452 names "input/Verify" as owner.

Counts: 67 rows read, 21 plan boxes read (13 ticked), about 55 files opened, including 9 scratch artifacts. My scratch todo is in `/private/tmp/claude-501/-Users-zbeyens-git-plate-2/bba16f67-b19c-4548-98f5-0e135fd40303/scratchpad/proof-plan/trail-review/`.
