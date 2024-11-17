/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const imageValue: any = (
  <fragment>
    <hh2>Image</hh2>
    <hp>Add images by either uploading them or providing the image URL:</hp>
    <himg
      align="center"
      url="https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      width="55%"
    >
      <htext />
    </himg>
    <hp>Customize image captions and resize images.</hp>
  </fragment>
);

export const mediaPlaceholderValue: any = (
  <fragment>
    <hh2>Upload</hh2>
    <hp indent={1} listStyleType="disc">
      Easily upload media files by dragging and dropping them into the editor or
      using the file picker. The editor provides:
    </hp>
    <hp indent={1} listStyleType="disc">
      Real-time upload status and progress tracking
    </hp>
    <hp indent={1} listStyleType="disc">
      Configurable file size limits and batch upload settings
    </hp>
    <hp indent={1} listStyleType="disc">
      Clear error messages for any upload issues
    </hp>
    <hp indent={1} listStyleType="disc">
      Try it now - drag an image from your desktop or click the upload button in
      the toolbar
    </hp>
  </fragment>
);

export const mediaValue: any = (
  <fragment>
    {imageValue}
    {mediaPlaceholderValue}

    <hh2>Embed</hh2>
    <hp>Embed various types of content, such as videos and tweets:</hp>
    <hmediaembed
      align="center"
      url="https://www.youtube.com/watch?v=MyiBAziEWUA"
    >
      <htext />
    </hmediaembed>
    {/* BUG */}
    {/* <hmediaembed
      align="center"
      url="https://twitter.com/zbeyens/status/1677214892212776960"
    >
      <htext />
    </hmediaembed> */}
  </fragment>
);
