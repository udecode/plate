## Outcome

Mention, slash, emoji and footnote queries remain ordinary editor text. A popup opens only when the user types a trigger in an Editable, and it belongs to that Editable and that occurrence. Filtering follows live IME preedit without publishing preedit as document content. Completion replaces the still-current query once; undo restores the literal query without reopening the popup. Escape closes the popup and leaves the text untouched.

This plan supersedes the native-input target of [the earlier design](2026-10-01-autocomplete-query-activation.md). Build executed it under the user's GO; [Execution](#execution) records what changed against the design.

## Hard laws

1. Canonical document text, marks, selection, history and collaboration remain Plite-owned. Query text follows normal save/share/history rules.
2. Preedit is view-local input state. The composition preview never writes into the document, changes focus/selection or creates history.
3. Match across adjacent formatted text in one editable text region. Stop at roots, blocks, inline atoms, noneditable content and hard line boundaries.
4. Preserve real feature space policy. Multiword mention and command labels remain usable within a bounded query; emoji shortcodes retain their own character policy.
5. Only a trigger typed locally in an Editable opens an occurrence. Caret placement, undo, redo, paste, migration and remote edits never open one; remote edits only map or close it. Escape ends the occurrence and leaves its text literal.
6. A selectable option belongs to the current feature, occurrence and query. The occurrence is a range anchor over its trigger span in one Editable. Replacing or deleting the trigger ends it, and equal text in another occurrence or mount does not qualify.
7. Completion settles native input, then rechecks the occurrence, the text from trigger to caret, the initiating mount, write permission and the absence of composition, then deletes and inserts in one transaction. A stale check or a callback refusal changes nothing; a thrown callback rolls back everything.
8. Completion creates one undo step. Undo restores the typed trigger/query and caret; redo restores the completed content.
9. Only the Editable where the trigger was typed exposes or activates its popup. Another view, root, inactive projection or read-only owner cannot adopt its interaction.
10. IME confirmation never selects an option. Live filtering does not permit keyboard completion during composition.
11. The most recently typed trigger wins; plugin order breaks a tie at one position. Every feature retains its actual product predicate and insertion/focus law.
12. Popup closure never restores an old caret over a later outside click. Post-completion focus belongs only to the surviving initiating mount.
13. Old input nodes cross an explicit detached migration boundary. Runtime creation, corrections and format parsing accept current schema only.

## Scope

Own Plate matching and atomic completion, one private combobox owner per mounted Editable, the `useCombobox` hook, four copied popup consumers, stored input migration, public types and teaching, generated registry output, and focused package/browser proof. Retain feature catalogs, ranking, completed node schemas, mention spacing, slash insertion/AI membership, footnote identity and focus policy, and emoji preferences.

Plite changes in two places, both under the native owner's review. An explicit option activation during composition needs a Plite-owned settle operation; history replay already runs a private version of that sequence. Keys that Plite consumes before Plate's keydown pipeline, such as projected editing keys in an owned content root, need an arbitration step that offers them to the open occurrence first. Phase 1 settles the exact shape of both with the native owner.

Exclude tag's dedicated select editor, search, the AI product UI/prompts, generic InputRules redesign, document history redesign, new release versions and live collaboration-room migrations. The latter stays with the app's persistence owner.