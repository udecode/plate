/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const dndDocumentValue: Value = (
  <fragment>
    <hp>
      Both views show this document. Drag a block from one view to the other and
      it moves.
    </hp>
    <hp>
      Hold Option on macOS, or Ctrl elsewhere, when you drop to copy it instead.
    </hp>
    <hp>Alpha</hp>
    <hp>Beta</hp>
    <hp>Gamma</hp>
  </fragment>
);

export const dndOtherEditorValue: Value = (
  <fragment>
    <hp>
      This is a separate editor. A block dropped here is copied, and its source
      keeps it.
    </hp>
    <hp>Delta</hp>
  </fragment>
);
