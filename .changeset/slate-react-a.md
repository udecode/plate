---
'@udecode/slate-react': major
---

Types:

- Remove `TReactEditor` type, as it's now integrated into the main `TEditor` type in `@udecode/slate`. Use `TEditor` instead.
- Replace `V extends Value` with `E extends TEditor` for improved type inference
- NEW `TEditableProps`, `TRenderElementProps`
