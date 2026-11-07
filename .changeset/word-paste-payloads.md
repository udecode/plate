---
'platejs': patch
---

- Keep pictures pasted from Word when their address is `http`, `https`, `blob` or a raster `data` address, and rebuild local Word pictures from the RTF copy. A local picture the RTF copy lacks lands as its alt text, and the paste reports it.
- Leave out Word hidden text, rows hidden in a table copied from Excel, comment markers and the comment list on paste.
- Accept Word tracked changes on paste, so inserted text lands as plain text and deleted text is left out.
- Report each of these kinds once as a `lossy` paste diagnostic: hidden text, comments, tracked changes and a Word equation that Word paste cannot read. When Word paste leaves out the whole payload, the paste inserts nothing and reports `inserted: false`. When Word left something out and the cleaned HTML has more elements or deeper nesting than the HTML parser allows, it does the same and also reports that the content is too large or too deeply nested.
- Check the 5 MiB HTML byte limit against the Word payload itself, so a picture rebuilt from RTF or inlined Word styles no longer push an ordinary paste past it. A larger Word or Excel payload pastes as plain text.
