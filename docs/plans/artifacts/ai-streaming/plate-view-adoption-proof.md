# PlateView clipboard adoption proof

Case: `ai-streaming:plate-view-controlled-clipboard`.
Status: local completion of the bounded adoption case, uncommitted and unpushed.

`PlateView` forwarded `value` to `PlateStatic` but intercepted copy using the canonical editor document. The rich clipboard payload therefore disagreed with displayed/plain text. The exact mounted owner RED copied `canon` without bold while displaying `draft` with bold.

The duplicate clipboard handler is deleted. `PlateView` directly aliases `PlateStatic`, preserving its generic props, optional controlled value, and custom `onCopy` override. Static document selection and serialization have one owner.

Durable test: `packages/platejs/src/react/components/PlateView.spec.tsx`.

- RED: 2 pass, 1 fail; `/tmp/ai-plate-view-red.log`.
- GREEN and affected static corpus: 16 pass, 0 fail, 49 assertions; `/tmp/ai-plate-view-green.log`.
- Covered explicit draft value with marks, default canonical value, canonical document/publication invariants, and custom handler override.
- Scoped lint and formatting pass.
- No additional E2E test: the mounted owner test is exact. The five-run native `PlateStatic` clipboard receipt remains separately scoped in `clipboard-proof.md`; this change introduces no second renderer or event handler.
- Methodology: no-change; the read-only caller audit caught a missed adoption site, and exact owner RED preceded deletion.
- Changeset coverage: `.changeset/ai-detached-streaming.md` covers static displayed-document clipboard extraction.
- Autoreview is prohibited on `next`; parent receives source-backed readback and focused proof.

Command:

```sh
bun test ./packages/platejs/src/react/components/PlateView.spec.tsx ./packages/platejs/src/static/components/PlateStatic.value.spec.tsx ./packages/platejs/src/static/utils/getSelectedDomFragment.spec.tsx ./packages/platejs/src/static/internal/writeStaticSelectionClipboardData.spec.ts
```

Ref: `dirty:f03d2b8c2397638acfe8b50abf4e90139778360f`.

- `48f203fb33c39a77cb3388a5db5fef32e3934bafca350a377fbf24b182369fb6` `packages/platejs/src/react/components/PlateView.tsx`
- `81e928c1b60e522cda0b68343b1d80d0513280b7c974c6cc9525b29073a25ada` `packages/platejs/src/react/components/PlateView.spec.tsx`
