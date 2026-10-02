---
'platejs': patch
---

Drop blocks inside blockquotes, details bodies, columns, table cells and footnote definitions wherever their schema accepts them. Every block drag, keyboard move and `editor.api.transfer` call keeps table rows in their table, keeps cells in place, keeps columns in their group, keeps the details summary first, lands footnote definitions only at the top level and moves a list item with its nested items. With `nativeDrop`, `UploadPlugin` places dropped files at the edge under the pointer, inserts nothing where an upload cannot land and replaces an empty block only where the file block fits.
