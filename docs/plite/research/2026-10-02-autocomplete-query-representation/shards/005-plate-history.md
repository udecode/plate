# Shard 005: Plate history, why the 2024 query moved into an input element

Output of the `why` skill: three investigators (source control and pull requests, GitHub issues and discussions, Linear) and one synthesizer, all Opus, read-only. Raw investigator notes stayed in the session scratchpad.


### The Question

Why did Plate's 2024 combobox rework (PR #3168, `@udecode/plate-combobox` v34.0.0, released 2024-06-06, author Joe Anderson / @12joan) host the autocomplete query in a native `<input>` inside a transient inline void element? What problems with the earlier design drove it: IME, Android, Slate selection bugs, Ariakit, undo, marks, collaboration or something else? The user's version: "there was a reason we had this, no?"

Short answer: yes, there was one stated reason, and it was accessibility. The author wrote that a void was "the only way to get assistive technologies to consistently recognise that the cursor is inside a combobox." No source ties IME, Android, Ariakit, undo, marks or collaboration to the decision. That reason also lands on the gate the 2026 ordinary-text design has not passed yet: screen-reader navigation.

### The Code in Question

- v34 (2024-05-01..06-14): `packages/combobox/src/withTriggerCombobox.ts`, `hooks/useComboboxInput.ts`, `hooks/useHTMLInputCursorState.ts`, `types.ts`. In apps/www, `plate-ui/inline-combobox.tsx` and the `slash-`, `mention-` and `emoji-input-element.tsx` components. `ELEMENT_MENTION_INPUT` and `ELEMENT_SLASH_INPUT` became `isVoid: true`, and Ariakit's `<Combobox>` renders the `<input>`.
- v33, deleted in 27616fec43: `legacy-combobox-delete-me/**` (`comboboxStore`, `onChangeCombobox`, `getTextFromTrigger`, `useComboboxControls`), and `packages/mention/src/withMention.ts` (deleted in 4a5c168e96).
- 2026 counterpart: `packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts` (lines 195-198 set `aria-autocomplete`, `aria-controls` and `aria-activedescendant` on the Editable) and `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md`.

**Premise correction.** For mentions, the query was not in loose document text before v34. v33 mentions already used a transient inline `mention_input` element. Its query was the element's Slate text children (`git show 4a5c168e96^:apps/www/src/registry/default/plate-ui/mention-input-element.tsx` renders `<span>{children}</span>`). The `slash-command` package was created on 2024-04-29 (c469c75a9b, Felix Feng) by copying that design, and merged one day before the rework began (PR #3155, merged 2024-04-30). v34 made the element void and moved the query into a native `<input>`. Only emoji (`EmojiTriggeringController`) and the generic `createComboboxPlugin` / `getTextFromTrigger` path read the query from paragraph text. So the 2026 design is not a return to v33. v33 was a text-children inline element with no combobox semantics on the focused element. 2026 is plain text with ARIA on the Editable.

### What We Found

- **[Direct] The author gave assistive technology as the reason for the void.** Source: [PR #3168 comment](https://github.com/udecode/plate/pull/3168#issuecomment-2092943786), @12joan, 2024-05-03T12:43:56Z (spot-verified). Verbatim: "The main changes are a deprecation of the old combobox store (combobox state should now be managed by the developer) and using a void element for the mention input node. Switching to a void isn't a decision I took lightly, but I found it was the only way to get assistive technologies to consistently recognise that the cursor is inside a combobox." Scope: "I found" reports his own testing. The comment does not say which assistive technologies or browsers he tried, what "consistently" failed on, or which alternatives he ruled out. It names the mention input node; the same change was applied to slash and emoji.
- **[Direct] The rationale was given only on request, and nobody reviewed the void choice.** Source: same thread (verified). @dylans, 2024-05-03T00:37:47Z: "I suggest getting feedback from @nemanja-tosic … It took quite a bit of effort to get mentions working previously." Joe's comment above replies to this. @nemanja-tosic never replied. None of the 20+ inline review comments by @zbeyens and @12joan (verified via `pulls/3168/comments`) discusses the void or the native input. They cover naming, cmdk/Ariakit alignment and component extraction. The PR body says only "See changesets."
- **[Direct] The shipped changesets frame v34 as an API change and give no reason for the void.** Source: `.changeset/combobox.md`, `mention.md`, `slash.md` and `emoji.md`, deleted in 1b1efbaf57 and now in `packages/combobox/CHANGELOG.md` 34.0.0. They say: "Major rework. The combobox package is no longer a plugin", "`ELEMENT_MENTION_INPUT` is now an inline void element, and combobox functionality must now be handled in the component", "Removed `withMention` (no longer needed)". No commit body, code comment or test on the branch states an accessibility requirement. The only accessibility wording elsewhere is the `inline-combobox.mdx` description, "Enhance inline nodes with accessible comboboxes" (928823249b).
- **[Direct] Ariakit was treated as a swappable UI layer, not as the requirement.** Source: @12joan, PR #3168 inline review on `inline-combobox.tsx`, 2024-05-02T07:31:08Z (verified): "keeping all the Ariakit combobox stuff in one place … If they want to migrate from Ariakit to cmdk, they can make this change in one place without breaking the API". @zbeyens, 2024-05-02T11:08:38Z: "we can't package it since it's coupled to Ariakit." Ariakit first entered the repo in the prototype commit 437738e89a (2024-05-01, verified `@ariakit/react` import), in the same commit that introduced the void. Git therefore cannot separate the two.
- **[Direct] IME was a known defect of the v33 mention input, but the rework author had fixed its root cause upstream three months earlier.** Sources, all verified: [Plate #1501](https://github.com/udecode/plate/issues/1501) (labels `bug, ime`, opened 2022-04-22: Chinese input removes the `MentionInputElement`). @12joan, 2023-10-26: "This is also affecting my app." He filed [slate#5540](https://github.com/ianstormtaylor/slate/issues/5540) on 2023-10-27: "Plate's mention input node (an inline node that starts empty) closes when composition starts. This is because the selection is moved outside the mention input node, triggering Plate's logic that removes the input node." slate#5540 closed 2024-02-07, and @12joan closed #1501 the same day: "This should be fixed in the latest version of Slate." During the rework, @zbeyens pointed a Hangul IME reporter at the #3168 preview ([D#3197](https://github.com/udecode/plate/discussions/3197), 2024-05-13). The reporter concluded on 2024-05-17: "This was definitely not a bug, it was simply an issue with the slate version."
- **[Direct] The v33 focused element carried no combobox input semantics.** Source: `git show 27616fec43^:packages/combobox/src/legacy-combobox-delete-me/hooks/useComboboxControls.ts` (verified). It calls downshift's `getInputProps({}, { suppressRefError: true })`, discards the result, and returns only `closeMenu`, `getItemProps` and `getMenuProps`. The popup list could carry listbox semantics, but nothing tied the caret's element to it. This fact concerns structure; it does not show intent.
- **[Direct] In 2023 the lead maintainer called the input element a product choice.** Source: @zbeyens on [#2429](https://github.com/udecode/plate/issues/2429), 2023-06-12 (investigator, not re-verified): "The mention we have is more similar to Notion's one, because we have a mention input element … I'd be open to introduce an option `variant` to not use the mention input element and to behave more like GitHub."
- **[Direct] The native-input design brought its own defects, and the author documented them.** Sources:
  - 437738e89a, a code comment (verified): "Using autoFocus on the input element causes an error: Cannot resolve a Slate node from DOM node".
  - 4a5c168e96, also verified: an undo crash guard ("Removing the input at this point is incorrect and crashes the editor") and `forwardUndoRedoToEditor`, which bridges two undo stacks.
  - [PR #3285](https://github.com/udecode/plate/pull/3285), 2024-06-14 (verified): rerendering "was preventing the `<input>` from receiving keystrokes in Chrome and WebKit", and "`selectionchange` … not currently supported for `<input>` elements outside of Firefox".
  - #3853, @12joan on 2024-12-12: refocusing the input "is a bug in Chrome". Also, `cancelInputOnBlur: false` left an orphaned input until PR #4408 (2025-06).
  - The cancel-time reinsertion point regressed twice: #4031 → PR #4322, then #4778 → PR #4940 (2026-04).
  - [PR #4762](https://github.com/udecode/plate/pull/4762), merged 2025-12-14 (verified): "Fix combobox opening popover for all users in collaboration". v33 had fixed the same class of bug in 2022 (#1461).
- **[Supported] The v33 text-children input had a long record of crashes and defects before the rework, but no source links them to the decision.** Evidence:
  - Undo crashes: #1284 (2021), #3103 / PR #3107 (fixed 2024-04-06, three weeks before the prototype), and the v33 `withMention.ts` comment "Needed for undo - after an undo a mention insert we only receive an insert_node".
  - Insert and normalization crashes: #1232, #1843 (open 2022-08 to 2024-12) and #2533.
  - Blur and cleanup: #2609 / PR #2619, and #2919 / PR #2920, which Joe fixed in February 2024.
  - Typing closes the input depending on the slate-react version: #1549.
  - Pasting into the query: @dylans on #1501.
  - Android trigger detection: #1230 and D#2408 (2023).
  - The singleton store made plugins interfere with each other: #2429, #1926 and #1339.

### What We Can Reasonably Infer

- **[Inferred] The AT failure was probably about the focused element's role.** The caret sat in a contenteditable that did not expose itself as a combobox. Reasoning: in v33 the focused element had no combobox wiring (the discarded `getInputProps`). Joe's wording is "recognise that the cursor is inside a combobox", which names role recognition, not option navigation. Ariakit's `<Combobox>` renders a focusable `<input role="combobox">`. Given all three, the void most likely existed to move focus onto an element that AT announces as a combobox. Joe did not spell this mechanism out.
- **[Inferred] Fewer editor overrides was a benefit, and possibly a secondary motive.** Reasoning: v34 deleted `withMention`'s overrides for paste, deleteBackward, insertBreak, apply and selection removal ("no longer needed"). @zbeyens reviewed it as "Exciting how cleaner it gets!" A benefit seen after the fact is not a stated motive. The only stated motive is AT.
- **[Inferred] The rework appears to have started as dedup of mention and the new slash package, and the void arrived with the first prototype.** Reasoning: on PR #3155 (2024-04-29), @zbeyens wrote "A lot of common code with mention. Hopefully we can dedup this later" and "The common code will probably go to `combobox` package". Joe's prototype the next day (437738e89a) was built inside `slash-input-element.tsx`.
- **[Inferred] IME was not a live driver.** Reasoning: the author had already traced the v33 IME failure to Slate and closed it as fixed (2024-02-07). The one IME complaint during the rework resolved as a Slate-version problem. No rework artifact mentions IME.

### Competing Hypotheses

- **Hypothesis 1: AT recognition was the decisive reason for the void and the native input.**
  - Evidence for: the author's explicit statement (PR #3168 comment).
  - Evidence against or missing: no test, invariant, AT matrix or changeset encodes it. The statement came only when a reviewer asked. "The only way" has no recorded experiment behind it.
- **Hypothesis 2: escaping the fragile text-children inline was the real driver, and AT was the reason given when asked.**
  - Evidence for: the long v33 defect list. Joe personally fixed #2920 and slate#5540 before the rework. The overrides were deleted as "no longer needed".
  - Evidence against: the only attributable statement names AT alone. IME had been fixed upstream. No source links any v33 defect to #3168. Speculative.
- **Hypothesis 3: choosing Ariakit pulled the design toward a real `<input>`.**
  - Evidence for: Ariakit and the void landed in the same prototype commit, and Ariakit's `Combobox` is an input.
  - Evidence against: Joe framed Ariakit as replaceable by cmdk. cmdk's `Command.Input` is also an input, so this hypothesis and Hypothesis 1 predict the same structure and the record cannot separate them. Speculative.
- **Open sub-question that decides the 2026 call: did Joe try ARIA attributes on the contenteditable before choosing the void?**
  - If he did and it failed, the 2026 design repeats a rejected option.
  - If he did not, his "only way" never tested the 2026 approach. v33 had no such wiring at all.
  - Nothing in the record answers this. Only Joe can.

### What We Don't Know

- **Which assistive technologies failed, and how.** No source names a screen reader, browser or OS, or what "consistently" failed on. Searched: the PR #3168 conversation and inline reviews, every commit body on feat/combobox (all empty), code comments, changesets, docs, issues and discussions (`screen reader`, `aria combobox`, `aria-activedescendant`, `combobox a11y`, `accessibility combobox`, `ariakit`), and Linear.
- **Whether `aria-activedescendant` / `aria-autocomplete` on the contenteditable was tried in 2024.** Unknown (see the open sub-question above).
- **Whether IME, Android, undo, marks or collaboration factored in at all.** No source says so.
  - IME pickaxe `-G'composition|isComposing|android|IME'` over the combobox and mention code up to 2024-06-10: false positives only.
  - Issue searches `mention ime`, `mention android`, `combobox composition`: pre-v34 defects, none linked to #3168.
  - Marks: every hit concerns the final mention node, never the query.
- **Post-v34 screen-reader outcomes.** Issue and discussion searches from 2024-06 to 2026-10 found no AT reports about the input design. Absence of reports does not show the input worked for AT.
- **Chat.** Plate's Discord, where design talk likely happened (felixfeng33 pointed contributors to its `contribute` channel, D#383), was not searchable. The window to check is 2024-04-25 to 2024-05-03 (869f8689f5 is dated 2024-04-25).
- **People who would know.** Joe Anderson (@12joan) for the AT matrix and the alternatives he tried. @nemanja-tosic, who built the v33 input, never reviewed.
- **The 2026 record does not engage the 2024 reason.** `git grep` for `3168`, `assistive` and `screen.?reader` across the 2026 autocomplete plan, decision page and review records found no reference to PR #3168 or its comment (the `3168` hits were file-hash false positives). "Screen-reader navigation" appears only as an open gate: plan line 456, and `docs/research/decisions/autocomplete-ownership.md` line 190. Line 193 of the plan notes the earlier runner "does not settle … popup accessibility".

### Sources Consulted

- **Source control history**:
  - 20 seed commits: 437738e89a through 77f680615f, eb56eb1bb5, c469c75a9b and 869f8689f5.
  - `git log` 2021-01..2024-07 on the combobox, mention, slash-command and emoji packages, the plate-ui components and `.changeset`.
  - Pickaxe for `previousSelected`, `forwardUndoRedoToEditor`, `Cannot resolve a`, `auto-resizing`, `@ariakit/react` and IME terms.
  - v33 and v34 file reads, and the changesets deleted in 1b1efbaf57.
  - PRs read: #3168 (body, conversation, inline reviews), #3155, #3285, #3242, #3107, #2619, #2166, #2920, #2752, #1168, #1397, #1461, #2430, #1999, #3595, #4762, #4408, #4322, #4940, #4273, #4817, #1483 and #2224.
  - Current-tree grep for the rationale.
  - Synthesizer re-checks: #3168 comments and inline reviews, #3285, #4762, 437738e89a, 4a5c168e96, `useComboboxControls.ts` at 27616fec43^, the history of `withSlashCommand.ts`, and the 2026 plan's accessibility mentions.
- **Issue / ticket tracker (GitHub Issues and Discussions)**: 56 issues and 40 discussions read in full, plus timelines, from more than 60 keyword searches covering IME, Android, undo, selection, focus, marks, collaboration, ARIA, screen reader, Ariakit and the v33/v34 symbols. Followed out to ianstormtaylor/slate#5540. The synthesizer re-verified #1501 with all comments, slate#5540 and D#3197.
- **Issue / ticket tracker (Linear MCP)**: the connected workspace is "Informed Medical", a downstream product created 2025-02-13, so it cannot hold 2024 Plate records. 27 keyword searches and a full document list returned nothing relevant.
- **Long-form documents**: Google Drive connector unauthenticated (gap). Claude Docs connector not searched. It holds only documents created through that 2026 product, so it is unlikely to hold a 2024 note; this is a judgment skip, not proof.
- **Real-time team chat**: Not searched. No Discord or Slack MCP available (gap).
- **Infrastructure observability**: Vercel MCP present but skipped. The target is a client-side editor interaction design with no infra signal.
- **Error / exception tracking**: Not searched. No matching MCP available in this environment.
- **Product analytics warehouse**: Not searched. No matching MCP available in this environment.

### Confidence Summary

High confidence that the only stated reason was assistive-technology recognition of "cursor inside a combobox": one direct, verified statement from the author. Low confidence in its scope, because no AT matrix, failure description or record of alternatives exists, and nobody reviewed the choice. High confidence that IME, Android, Ariakit, undo, marks and collaboration were not stated motives. IME had been fixed upstream before the rework, and the native-input design later re-hit undo and collaboration bugs. Chat was unavailable, and Joe Anderson is the one person who can say what he tested.

---

## Preserve / Change / Avoid / Risk (for the 2026 keep-or-revert decision)

**Preserve**
- The 2024 requirement, as Joe stated it: assistive technology must consistently recognise that the caret is in a combobox (autocomplete) and must follow the active option. This is the one reason the input existed. Make the 2026 plan's open "screen-reader navigation" gate (plan line 456) the keep-or-revert gate for this change, and do not treat it as a follow-up. A Chromium automation pass cannot close it. It needs real screen readers, because "consistently" points to variation across AT.
- The behavior laws both eras paid for:
  - Undo never crashes and never reopens the popup (v33 #3103; v34's undo guard).
  - Popups open only for the local typist (#1461 in 2022, #4762 in 2025).
  - Leaving the query cleans up on blur and outside clicks (#2609, #3853).
  - Typing and composition stay inside the query. The v33 IME failure was selection leaving an inline element at composition start (slate#5540).
  - The 2026 plan already states most of these as hard laws (laws 5, 8 and 10). Keep them tested.

**Change**
- Drop the framing "ordinary text = going back to the old design." v33 mentions used a text-children inline element with no combobox semantics on the focused element. 2026 uses plain text with `aria-autocomplete`, `aria-controls` and `aria-activedescendant` on the Editable. Most v33 defects (inline insertion, normalization, selection moving into or out of an inline element) belong to the transient inline, not to text queries. They are weak evidence against 2026. The v33 plain-text path's defects are the relevant ones: a range that grows past the query (#2304) and singleton-store cross-talk (#2429, #1926).
- If AT proof fails, change the ARIA strategy before reviving the void. This is speculative, untested and has no evidence in this investigation. Candidates to test with real AT: a polite live region announcing the active option, or announcing popup open and count.

**Avoid**
- Do not claim the input existed for IME, Android, Ariakit, undo or marks. No source supports any of those.
- Do not read v34's "no longer needed" as proof that the input design was simpler overall. It moved complexity into focus, cursor-edge tracking, two undo stacks, cancel reinsertion and browser compatibility (PR #3285, #3853, #4031/#4322/#4778/#4940, #4762). Reverting brings all of that back.
- Do not count the absence of post-v34 screen-reader issues as evidence that the input worked for AT, or that ordinary text will fail it.

**Risk**
- The 2026 design may be exactly the configuration Joe found inconsistent: focus stays on a `role=textbox` contenteditable, and the combobox relationship lives only in `aria-autocomplete`, `aria-controls` and `aria-activedescendant`. The record cannot confirm he tried it. The following is general domain knowledge, not verified in this investigation: ARIA 1.2 allows `aria-activedescendant` and `aria-autocomplete` on `textbox` but not `aria-expanded` (which the 2026 plan dropped, line 394), and screen readers vary in how they announce active descendants on contenteditable hosts. Ask Joe Anderson what he tried before running the AT pass; it is cheap and could settle the question.
- Physical IME and Android proof is still open in 2026 (plan lines 452-453; the composition proof is synthetic CDP only). This risk belongs to the ordinary-text design itself. The 2024 record says nothing on it either way.
