---
'@udecode/plate-core': patch
---

- slate `DefaultLeaf` does not spread the props to the rendered span so we're using our own `DefaultLeaf` component which does it. It enables us to override the props leaves without having to register a component (e.g. fontColor) 
