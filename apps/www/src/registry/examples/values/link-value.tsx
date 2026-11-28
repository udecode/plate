/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const linkValue: Value = (
  <fragment>
    <hheading level={2}>Link</hheading>
    <hp>
      Add{' '}
      <ha target="_blank" url="https://en.wikipedia.org/wiki/Hypertext">
        hyperlinks
      </ha>{' '}
      or internal references like <ha url="/docs">the Plate docs</ha> within
      your text. Click any link to preview, copy, edit, or unlink it, or hold{' '}
      <htext bold>Cmd/Ctrl</htext> and click to open it in a new tab.
    </hp>
    <hp>
      Select text and press <htext bold>Cmd/Ctrl+K</htext>, use the toolbar
      button, paste a URL over selected text, type{' '}
      <htext code>www.platejs.org</htext> followed by a space, or type{' '}
      <htext code>[Plate](https://platejs.org)</htext> to create a link.
    </hp>
  </fragment>
);
