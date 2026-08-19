/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const linkValue = (
  <fragment>
    <hheading level={2}>Link</hheading>
    <hp>
      Add{' '}
      <ha target="_blank" url="https://en.wikipedia.org/wiki/Hypertext">
        hyperlinks
      </ha>{' '}
      within your text to reference external sources or provide additional
      information using the Link plugin.
    </hp>
    <hp>
      Effortlessly create hyperlinks using the toolbar or by pasting a URL while
      selecting the desired text.
    </hp>
  </fragment>
);
