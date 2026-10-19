# ProseKit: collaboration

## Yjs and Loro

- **Yjs and Loro.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/yjs.test.ts` (L8) pins that two editors bound to one Yjs document converge after an edit in either. Plite covers it in `apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts` and in the Yjs contracts under `packages/plitejs/test/yjs/`. ProseKit also ships a Loro binding (`prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/extensions/src/loro/index.ts`); open issue #1219 reports its commit viewer resetting under streaming Loro updates (`docs/editor-test-harvester/prosekit/report.md:147`, 161; `docs/editor-issue-harvester/prosekit/full/issues.md:81`).
