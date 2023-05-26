/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const imageValue: any = (
  <fragment>
    <hh2>📸 Image</hh2>
    <hp>
      In addition to nodes that contain editable text, you can also create other
      types of nodes, like images or videos.
    </hp>
    <himg url="https://source.unsplash.com/kFrdX5IeQzI" width="75%">
      <htext />
    </himg>
    <hp>
      This example shows images in action. It features two ways to add images.
      You can either add an image via the toolbar icon above, or if you want in
      on a little secret, copy an image URL to your keyboard and paste it
      anywhere in the editor! Additionally, you can customize the toolbar button
      to load an url asynchronously, for example showing a file picker and
      uploading a file to Amazon S3. You can also add a caption and resize the
      image.
    </hp>
  </fragment>
);

export const mediaValue: any = (
  <fragment>
    {imageValue}

    <hh2>📺 Embed</hh2>
    <hp>
      In addition to simple image nodes, you can actually create complex
      embedded nodes. For example, this one contains an input element that lets
      you change the video being rendered!
    </hp>
    <hmediaembed url="https://www.youtube.com/watch?v=4duqI8WyfqE">
      <htext />
    </hmediaembed>
    <hp>It also supports tweets:</hp>
    <hmediaembed url="https://twitter.com/reactjs/status/1508838714180612100">
      <htext />
    </hmediaembed>
  </fragment>
);
