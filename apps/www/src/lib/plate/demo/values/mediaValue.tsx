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
    <hp>
      Our editor supports various media types for upload, including images,
      videos, audio, and files.
    </hp>
    <hfile
      name="sample.pdf"
      align="center"
      url="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf"
      width="80%"
      isUpload
    >
      <htext />
    </hfile>
    <hp indent={1} listStyleType="disc">
      Real-time upload status and progress tracking
    </hp>
    <haudio
      align="center"
      url="https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
      width="80%"
    >
      <htext />
    </haudio>
    <hp indent={1} listStyleType="disc">
      Configurable file size limits and batch upload settings
    </hp>
    <hvideo
      align="center"
      url="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4"
      width="80%"
      isUpload
    >
      <htext />
    </hvideo>
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
