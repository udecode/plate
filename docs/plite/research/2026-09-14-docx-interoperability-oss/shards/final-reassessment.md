# Documents final adversarial reassessment

Read-only Best API Review reassessment, 2026-09-14. This corrects and extends
the earlier source audit without rewriting its historical observations.

## Conclusion

The `Pursue` verdict survives, but the earlier target was incomplete. The
largest remaining public cuts are:

1. delete `exportAuthoredToDocx` in favor of one projection-aware
   `exportToDocx` result;
2. delete `ImportDocxResult.nodes` and always adopt one canonical document on
   success;
3. delete file-import `rtf` because it belongs to clipboard input;
4. rename `DocxPlugin`, which is actually a Word HTML/RTF paste adapter;
5. add structured success/loss diagnostics and bounded untrusted-input policy.

These supersede the first review's narrower focus on sidecar authority and the
parallel review serializer. Those two cuts remain required.

## New source observations

- [importDocx.ts:43](/Users/zbeyens/git/plate-2/packages/platejs/src/docx/import/lib/importDocx.ts:43)
  returns both `nodes` and optional `document`; the copied action consumes only
  `nodes` at
  [import-toolbar-button.tsx:60](/Users/zbeyens/git/plate-2/apps/www/src/registry/components/editor/import-toolbar-button.tsx:60).
- [importDocx.ts:52](/Users/zbeyens/git/plate-2/packages/platejs/src/docx/import/lib/importDocx.ts:52)
  exposes `rtf`; the only scoped use outside implementation is its direct unit
  test. Paste already reads `text/rtf` from the transfer source at
  [DocxPlugin.ts:151](/Users/zbeyens/git/plate-2/packages/platejs/src/docx/paste/lib/DocxPlugin.ts:151).
- [exportToDocx.tsx:77](/Users/zbeyens/git/plate-2/packages/platejs/src/docx/export/lib/exportToDocx.tsx:77)
  and
  [authoredDocx.ts:327](/Users/zbeyens/git/plate-2/packages/platejs/src/docx/export/lib/authoredDocx.ts:327)
  expose two functions for the same file-export job. Review mode reads the
  editor again after its await at line 348.
- The public `DocxPlugin` has only clipboard codecs; file import and export are
  standalone subpaths. Its noun therefore overstates its responsibility.
- `EditorDocumentValue` includes `meta` and named `roots`, while ordinary and
  accepted/proposed DOCX export pass only `document.children`. Visible support
  or loss reporting for roots does not exist.
- `DocxComment.references` is `Point[]`. Import derives those points from
  Mammoth comment-reference anchors and does not reconstruct Word range
  start/end or comment author/date/thread/resolution facts.
- Revision collection inspects `word/document.xml`, keeps the first metadata
  per ID, sorts by parsed timestamp, and generates a fresh package plus Mammoth
  conversion for the baseline and every cumulative revision. Causal order and
  cross-part review semantics are not proved.
- `JSZip.loadAsync`, per-part expansion, repeated package generation, DOM/XML
  parsing, and Mammoth conversion have no observed public resource/cancellation
  contract. This establishes a missing trust boundary, not an exploit claim.

## Correction

The earlier audit's instruction to preserve paste images and table geometry
was overconfident. The current deletion is deliberate and lossy, but keeping
Word clipboard payloads safely requires destination media/upload policy,
payload-size limits, and table-specific evidence. The documents design should
make omission explicit and defer that policy instead of silently preserving
data URIs, local/CID references, remote resources, or Word layout debris.

Standard installed link parsing already applies its URL policy, and this path
does not enable Mammoth external-file access. No generic HTML-script
vulnerability is claimed.

## Proof reuse

No product behavior changed. The 135 unique passing existing tests and two
historical bug-observation probes from the run receipt remain applicable to
their matching source. They do not cover native Word/LibreOffice, browser
paste, packed install, full slow suites, performance, comment ranges, named
roots, cancellation, resource limits, or arbitrary lossless roundtrip.
