# Block drop landing policy

Question: what decides where a dragged block may land, which nodes get a drag handle, and where per-container limits live, in other editors and in Plate today? This run feeds `docs/plans/2026-10-02-dnd-schema-derived-landing.md`.

Scope: `dnd`. Layer: Plite transfer and DOM, with Plate feature rules and the copied `dnd.tsx`.

Files:

- `editors.tsv` reads ProseMirror, Tiptap, BlockNote, Lexical, ProseKit, Slate and CKEditor 5 in local source at recorded revisions, without running them. Every row is graded A.
- `ground-facts.tsv` maps the current transfer pipeline, the hover walk, every block container, the feature rules, the copied UI, the docs and the proof, with file and line for each claim, on the 2026-10-02 working tree.

Verdict: the schema decides where a dragged block may land in every surveyed editor except Lexical, whose block plugin reorders root children only. "Rows stay in their table" and "columns stay in their group" live in a dedicated table or column gesture, never in the generic block drop. Plate's root-only default is the outlier, and Column and Table each restate the widening it blocks.
