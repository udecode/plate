---
'@platejs/cli': patch
---

Add `plate codemod plite-to-plate` to automate migrating Plite projects to Plate (rewriting imports, JSX components, `DOMEditor` calls, plugin options, and `package.json`, with structured diagnostics and `TODO` comments for manual steps), and mark `platejs` as an optional peer dependency
