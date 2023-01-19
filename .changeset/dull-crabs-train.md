---
"@udecode/plate-break": patch
---

adds a new option relative?: boolean to the exit break plugin that allows the exit point ("level" property) to be relative to the current level rather than absolute. It is optional and default false to not introduce any breaking change. Also adds a passing fix to a doc typo. This allows the exit break plugin to be useful in editors with nested blocks e.g. tables (fixes #2128)
