/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const cloudValue: any = (
  <fragment>
    <hh2>☁️ Cloud Uploads - Images and Attachments</hh2>
    <hp>
      Plate's official cloud upload service with attachments and images.
      Includes server-side image resizing which delivers optimized images to
      each user. Supports high DPI files for retina devices and regular files
      for speedier delivery for everyone else.
    </hp>
    <element
      type="cloud_attachment"
      url="https://gist.githubusercontent.com/prabansal/115387/raw/0e5911c791c03f2ffb9708d98cac70dd2c1bf0ba/HelloWorld.txt"
      filename="hello.txt"
      bytes={8}
    >
      <htext />
    </element>
    <hp>
      You can upload images and attachments directly to this page by pasting a
      file, drag and dropping a file or clicking the insert file or insert
      attachment button in the toolbar.
    </hp>
  </fragment>
);
