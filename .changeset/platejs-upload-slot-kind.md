---
'platejs': patch
---

- Report an unsupported file type first when a file of another kind is picked for an upload placeholder, before the size and configuration checks.
- Send the file of an upload placeholder's submit once when a transaction spec that holds it is applied twice, and report its refusal once.
- Keep the file of a placeholder submit in a transaction spec when an update applies the spec after another commit or a Cancel.
- Answer a placeholder submit from the placeholder as the update left it, such as one the update inserted, retagged, moved into a read-only element or removed.
- Send the newest file an update gave a placeholder when the update ends with a refused submit.
