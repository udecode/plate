---
'@udecode/plate-core': patch
---

Fix Url encoded HTML nodes on adding an image #1189.
Updated function `serializeHtml` to use `decodeURIComponent` per node, instead of complete text. 
This is fixing problem when combination of image and i.e. paragraph nodes would result in paragraph node not decoded.
