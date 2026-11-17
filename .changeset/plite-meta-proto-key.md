---
'plitejs': patch
---

- Refuse a document whose `meta` holds a `__proto__` key, on load and on `value.replace`, instead of dropping that key on replace; `defineStateField` and plugin installation refuse a state field keyed `__proto__`
- Fix `value.replace` keeping a meta key such as `constructor` or `toString` as a function when the new `meta` leaves it out
