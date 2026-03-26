# Fix Code Block Language Rehighlight

## Goal

Make code-block syntax highlighting refresh for the whole block immediately after `lang` changes.

## Plan

- Add regression coverage around `withCodeBlock` language changes.
- Update `withCodeBlock.apply` to detect real `lang` transitions, clear cache, then trigger `editor.api.redecorate()`.
- Verify with targeted tests, package build, package typecheck, and `lint:fix`.

## Notes

- Package-level fix only.
- No registry UI changes.
