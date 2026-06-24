---
"slate-hyperscript": major
---

Update hyperscript fixtures for the Slate v2 runtime and ESM package exports.

**Migration:** Import `jsx`, `createHyperscript`, `createEditor`, and `createText` from the root package export. Generated editors initialize through the v2 editor runtime, so fixture children, selections, marks, and custom tags follow the current Slate transaction model.
