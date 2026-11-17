/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const formatPainterValue: Value = (
  <fragment>
    <hheading level={2}>Format Painter</hheading>
    <hp>
      Select{' '}
      <htext bold color="#df4538">
        this bold red word
      </htext>
      , click the paintbrush in the toolbar, then drag over other text to give
      it the same look. Double-click the paintbrush to keep painting until you
      press <htext code>Esc</htext>.
    </hp>
    <hp>
      Without the toolbar, press <htext code>Mod+Alt+C</htext> to copy the look
      and <htext code>Mod+Alt+V</htext> to paste it onto the selection.
    </hp>
    <hheading level={3}>Paint a heading onto a paragraph</hheading>
    <hp>
      Select the heading above, arm the brush, then drag over this whole
      paragraph to turn it into a heading.
    </hp>
    <hp lineHeight={2} textAlign="center">
      Paint the red word onto this whole centered paragraph. It takes the look
      and keeps its alignment and line height.
    </hp>
  </fragment>
);
