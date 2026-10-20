---
'platejs': major
---

Require React and React DOM 19.2 or newer.

- Move date insertion to `editor.update.date.insert(input?, nodeOptions?)`
- Register date element properties in compiled schemas
- Persist one required `value` string for canonical dates or authored date text
- Remove the standalone `insertDate` and unused `isPointNextToNode` helpers
- Remove `getDateDisplayLabel` and `normalizeDateValue`; the copied `date` and `date-static` components build their own labels
- Store a string passed to `insert` as written, trimmed; pass a `Date` or `formatDateValue(date)` to store a day, because a `toDateString()` string such as `Mon Mar 23 2026` is stored as text
- Convert a v1 `date` written by `toDateString()`, such as `Mon Mar 23 2026`, into the day `2026-03-23` during the v54 migration
- Keep `toDateString()` text that names an impossible day or the wrong weekday, such as `Fri Feb 30 2026` or `Tue Mar 23 2026`, as text when reading Markdown, instead of converting it; v1 shifted `Fri Feb 30 2026` to `2026-03-02`
- Write authored text as `<date text="…" />`, so it reads back unchanged; the reader still accepts `<date>` child text

**Migration:** Replace `insertDate(editor, options)` with `editor.update.date.insert(input?, nodeOptions?)` or `editor.plugin(BaseDatePlugin).update.insert(input?, nodeOptions?)`. Use Plite point and node reads directly for custom adjacency checks.

Replace Date node `date` / `rawDate` properties with `value` and pass `{ value }` to the insert update.

Update the copied `date` and `date-static` components for their own labels. Replace `normalizeDateValue(input)` before an insert by passing the input to `editor.update.date.insert({ value: input })`, which skips an invalid `Date` or a blank string and inserts today when the input is missing. To build the stored value yourself, as `normalizeDateValue` did without its `toDateString()` conversion:

```ts
const value =
  input instanceof Date
    ? Number.isNaN(input.getTime())
      ? undefined
      : formatDateValue(input)
    : input?.trim() || undefined;
```
