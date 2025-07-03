---
"@platejs/link": patch
---

Fix markdown headings being incorrectly converted to links

The LinkPlugin's `validateUrl` function now properly distinguishes between markdown headings and anchor links. Previously, any string starting with `#` was treated as a valid link, causing markdown headings like `# heading1` to be converted to links when pasted. Now, the function checks for the markdown heading pattern (hash symbols followed by a space) and correctly rejects these as invalid URLs while still allowing valid anchor links like `#section-name`.