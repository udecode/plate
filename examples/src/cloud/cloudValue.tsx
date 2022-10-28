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

    <hh3>Cloud Images</hh3>
    <hp>Samples of cloud images.</hp>
    <element
      type="cloud_image"
      url="https://files.portive.com/f/demo/6hndj3bdag7eqbpb2794s--1920x1440.jpg"
      bytes={654196}
      width={320}
      height={240}
      maxWidth={1920}
      maxHeight={1440}
    >
      <htext />
    </element>
    <hh3>Cloud Attachments</hh3>
    <hp>Samples of cloud attachments.</hp>
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
    <element type="cloud_attachment" url="#a" filename="hello.txt" bytes={1024}>
      <htext />
    </element>
    <element type="cloud_attachment" url="#b" filename="hello.txt" bytes={1024}>
      <htext />
    </element>
    <element type="cloud_attachment" url="#c" filename="hello.txt" bytes={1024}>
      <htext />
    </element>
    <element type="cloud_attachment" url="#d" filename="hello.txt" bytes={1024}>
      <htext />
    </element>
    <element type="cloud_attachment" url="#e" filename="hello.txt" bytes={1024}>
      <htext />
    </element>
    <element
      type="cloud_attachment"
      url="#state-not-found"
      filename="hello.txt"
      bytes={1024}
    >
      <htext />
    </element>
  </fragment>
);
