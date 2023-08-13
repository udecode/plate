;
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';





jsx;

export const imageValue: any = (
  <fragment>
    <hh2>📸 Image</hh2>
    <hp>Add images by either uploading them or providing the image URL:</hp>
    <himg url="https://source.unsplash.com/kFrdX5IeQzI" width="75%">
      <htext />
    </himg>
    <hp>Customize image captions and resize images.</hp>
  </fragment>
);

export const mediaValue: any = (
  <fragment>
    {imageValue}

    <hh2>📺 Embed</hh2>
    <hp>Embed various types of content, such as videos and tweets:</hp>
    <hmediaembed url="https://www.youtube.com/watch?v=MyiBAziEWUA">
      <htext />
    </hmediaembed>
    <hmediaembed url="https://twitter.com/CalebNoeTV/status/1684655893491662849">
      <htext />
    </hmediaembed>
  </fragment>
);