/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { EditorDocumentValue } from 'platejs';

jsx;

export const imageValue = {
  children: (
    <fragment>
      <hheading level={2}>Image</hheading>
      <hp>Add images by either uploading them or providing the image URL:</hp>
      <himg
        textAlign="center"
        url="https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width="55%"
      >
        <htext>Image caption</htext>
      </himg>
      <hp>Customize image captions and resize images.</hp>
    </fragment>
  ),
};

export const mediaPlaceholderValue = {
  children: (
    <fragment>
      <hheading level={2}>Upload</hheading>
      <hp>
        Our editor supports various media types for upload, including images,
        videos, audio, and files.
      </hp>
      <hfile
        name="sample.pdf"
        url="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf"
        width="80%"
      >
        <htext />
      </hfile>
      <hp indent={1} listType="bulleted">
        Real-time upload status and progress tracking
      </hp>
      <haudio
        textAlign="center"
        url="https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
        width="80%"
      >
        <htext />
      </haudio>
      <hp indent={1} listType="bulleted">
        Configurable file size limits and batch upload settings
      </hp>
      <hvideo
        textAlign="center"
        url="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4"
        width="80%"
        provider="file"
      >
        <htext />
      </hvideo>
      <hp indent={1} listType="bulleted">
        Clear error messages for any upload issues
      </hp>
      <hp indent={1} listType="bulleted">
        Try it now - drag an image from your desktop or click the upload button
        in the toolbar
      </hp>
    </fragment>
  ),
};

export const mediaValue: EditorDocumentValue = {
  children: (
    <fragment>
      {imageValue.children}
      {mediaPlaceholderValue.children}

      <hheading level={2}>Embed</hheading>
      <hp>Embed various types of content, such as videos and tweets:</hp>
      <hmediaembed
        textAlign="center"
        url="https://www.youtube.com/watch?v=MyiBAziEWUA"
      >
        <htext />
      </hmediaembed>
      {/* BUG */}
      {/* <hmediaembed
      textAlign="center"
      url="https://twitter.com/zbeyens/status/1677214892212776960"
    >
      <htext />
    </hmediaembed> */}
    </fragment>
  ),
};
