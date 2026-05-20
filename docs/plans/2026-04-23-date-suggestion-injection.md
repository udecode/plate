# Date Suggestion Injection Plan

## Goal

Move date suggestion styling out of `apps/www/src/registry/ui/date-node.tsx` so the node no longer imports suggestion helpers directly. Suggestion state should be injected from the suggestion plugin layer.

## Scope

- Add a test that proves suggestion styling reaches the date trigger through plugin injection.
- Refactor `date-node` to expose a stable trigger slot only.
- Update suggestion rendering to inject date-specific styling through `inject.nodeProps`.
- Keep static rendering aligned if the same dependency split is needed there.

## Notes

- This is registry work under `apps/www/src/registry/`; no package changeset expected.
- Relevant prior learning: inline void suggestions need real metadata handling and cannot assume plain text ranges only.

## Phases

- [x] Inspect current date, suggestion, and injection paths
- [ ] Add regression test for injected date suggestion styling
- [ ] Refactor date node and suggestion kit
- [ ] Verify build-first checks and lint
- [ ] Evaluate compound-worthy learning
