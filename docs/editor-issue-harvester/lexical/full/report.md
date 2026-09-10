# Lexical Full All-Issues Robustness Harvest

status: full issue-body classification complete
target: `facebook/lexical`
local checkout: `../lexical`
artifact_dir: `docs/editor-issue-harvester/lexical/full`

## Verdict

Classified all 2741 open and closed Lexical issues with issue bodies. Every issue has one primary disposition. Non-skip dispositions map to an owner, proof kind, and verification/defer command in [matrix.md](./matrix.md).

No runtime/package patch was made in this harvest pass.

## Disposition Counts

| Disposition | Count |
| --- | ---: |
| keep-portable | 1330 |
| skip | 836 |
| plate-owned | 468 |
| defer | 107 |

## Cluster Counts

| Cluster | Count |
| --- | ---: |
| docs-release-website | 519 |
| plate-plugin-policy | 468 |
| clipboard-paste-serialization | 421 |
| selection-dom-caret | 416 |
| table-grid-selection | 248 |
| support-question-discussion | 137 |
| unrelated-or-product-unclear | 108 |
| void-decoration-atom | 71 |
| mobile-device-keyboard | 66 |
| ime-beforeinput-keyboard | 65 |
| collaboration-remote-rebase | 63 |
| package-build-infra | 46 |
| large-doc-performance | 41 |
| history-undo-redo | 38 |
| lexical-api-ontology | 22 |
| shadow-dom-browser | 8 |
| low-signal | 4 |

## Matrix Counts

| Matrix key | Count |
| --- | ---: |
| Plate-owned rich text/plugin/product policy | 468 |
| Clipboard, paste, copy, cut, HTML, markdown, and serialization | 421 |
| DOM selection, caret, range, focus, and native movement | 416 |
| Table selection, navigation, paste, and nested table robustness | 248 |
| Void, decorator, image, mention, token, and inline atom boundaries | 71 |
| Raw mobile keyboard, tap, selection, and IME | 66 |
| IME and beforeinput transport | 65 |
| Remote/collaborative edit rebasing, selection, and history | 63 |
| Large document, transform, memory, and freeze performance | 41 |
| History, undo/redo, and batch boundaries | 38 |
| Shadow DOM and non-document-root browser selection | 8 |

## Artifacts

- `issues-all-with-bodies.json`: raw all-state body corpus.
- `classified-issues.json`: all issue rows with disposition and owner/proof mapping.
- `classified-issues.tsv`: compact all-issue review table.
- `matrix.md`: grouped action matrix.
- `checkpoints/checkpoint-*.md`: batch checkpoint summaries.
