# Editor architecture: performance

## Mount and split cost

- On the nine-editor common fixture of 2026-09-09, at 10,000 equal paragraphs the mount and split p95 were 528.3 ms and 95.7 ms for Plite, 1,018.5 ms and 139.9 ms for Plate, and 51.9 ms and 11.0 ms for ProseMirror. The fixture had 945 cells (933 passing, six unsupported, six failing). These are Chromium measurements of frozen bundles on one M5 Max host, and the interaction clocks stopped at a frame opportunity, not at verified paint. Source: `docs/editor-audits/reports/editor-performance-research-iteration-2-2026-09-09.md:21-26`. Limit: the Plite and Plate source revisions are not pinned in the preserved summary; rerun before citing a current gap.
