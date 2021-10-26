---
'@udecode/plate-table-ui': minor
---

- new deps: `@udecode/plate-ui-button` and `@udecode/plate-ui-popover`
- `TableCellElement` new prop:
  - `hideBorder`
- `TableElement`:
  - wrapping the table with `TablePopover` which displays a popover when selected.
  - new prop: `popoverProps`, can be used to override the popover content
- new components:
  - `TablePopover` which displays a button to delete the table
  - `TableRowElement`
