# Obsidian Editor-Behavior Review

## Goal

Review `docs/editor-behavior` now that the Obsidian raw and research layers
exist, and identify where Obsidian is a stronger authority than Typora or the
current authority map admits.

## Phases

- [x] Inspect the current editor-behavior law and audit authority model
- [x] Inspect the Obsidian research layer for stronger authority lanes
- [x] Compare the two and identify concrete findings
- [x] Return a findings-first review with recommended doc changes

## Notes

- This is a review, not an implementation pass.
- Focus on authority lanes, not random wording nits.
- Strong candidates: linking, block references, search, navigation chrome,
  editing modes, and footnote scope.
- Outcome:
  - Obsidian is now first-class in the authority model.
  - Typora still owns markdown-native editing.
  - Obsidian now owns mode architecture and linked-note navigation/search
    surfaces.
  - Google Docs stays primary for linear document navigation, tables, review,
    and styling.
  - `editor-protocol-matrix.md` now splits current-file find from
    selection-seeded search and gives outline-click authority to Obsidian for
    persistent markdown navigation chrome.
