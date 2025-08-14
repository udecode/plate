---
"@platejs/autoformat": patch
---

Fix: Optimize autoformat performance for number input by indexing rules by trigger character. This resolves the issue where typing numbers in tables was significantly slower than typing letters due to checking many number-specific autoformat rules (superscripts, subscripts, fractions, etc.) on every keystroke.