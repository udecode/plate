---
"@udecode/plate-ui-table": minor
---

Light breaking changes:
- `TableElementBase` has been removed for `TableElement`
- in v16, `TableElement` `onRenderContainer` prop has been removed for `floatingOptions`. However, `TablePopover` has other props which you may want to control. So this release adds `popoverProps` prop has been added and `floatingOptions` prop is moved into `popoverProps.floatingOptions`.
