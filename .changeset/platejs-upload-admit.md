---
'platejs': patch
---

- Add `admit` and `fill` to the upload plugin's update API. A plugin with its own insert, such as one that wraps each file's placeholder in a container, checks a batch with `admit`, inserts the placeholders it returns and gives each file its placeholder with `fill`.
