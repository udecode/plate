---
'platejs': patch
---

- Let an HTML mapping's `prepareDocument` pass the `element` a loss is about to `report`, typed as `HtmlPrepareDiagnosticInput`. While the document still holds that element, the diagnostic names its place in the document at the time of the report. An earlier mapping's `prepareDocument`, such as List's, can move nodes first, so that place can differ from the pasted HTML. Two elements reported with the same message give two diagnostics.
