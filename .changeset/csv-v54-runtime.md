---
'platejs': major
---

Remove `CsvPlugin`, `editor.api.csv` and the `PLUGINS.csv` key; `@platejs/csv` has no `platejs/csv` replacement, and `papaparse` is no longer a peer dependency.

- Spreadsheet copies from Google Sheets and Excel still paste as tables through their HTML.
- Comma-separated plain text now pastes as text instead of a table.

**Migration:** Remove `CsvPlugin` from your plugin list and uninstall `@platejs/csv` and `papaparse`. To convert a CSV string into a table, parse it with your own CSV library and insert table nodes.
