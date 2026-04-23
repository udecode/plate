# Footnote Combobox UI

## Goal

Replace the current overbuilt footnote definition editing block with a simpler
footnote UX closer to Obsidian, and explore footnote insertion through an
inline combobox that suggests the next identifier first while reusing existing
combobox patterns.

## Phases

- [x] Gather learnings and existing footnote / combobox seams
- [x] Define the target UX and minimal spec change
- [x] Implement the UI/behavior change with tests first where sane
- [x] Verify the live result in the browser

## Notes

- Keep this scoped to current Plate footnote surfaces, not fantasy new note-link systems.
- Prefer reusing the emoji/combobox infrastructure over inventing another popup.
- The current pain points are:
  - the "Editor Definition" block feels too heavy
  - inserting refs should feel lighter and more inline
- Outcome:
  - footnote definitions now render as compact numbered rows instead of boxed
    cards with a visible "Back to reference" control
  - typing `[^` on an empty line in the live docs editor opens a combobox with
    the next free id first
  - selecting the new-footnote row inserted `[4]` inline and created a compact
    `4` definition row below without jumping into a heavy definition card
