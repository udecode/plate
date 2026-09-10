---
'plitejs': patch
---

Keep text-flow DOM bindings local to each mounted editor view so shared editors resolve text points without document scans, including multi-record flows and surviving view teardown.
