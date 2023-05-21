/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const cloudValue: any = (
  <fragment>
    <hh2>☁️ Plate Cloud Uploads - Images and Attachments</hh2>
    <hp>
      Plate Cloud is Plate's official cloud upload service with support for
      attachments, images and image resizing. Includes server-side image
      resizing which delivers optimized images to each user. Supports high DPI
      files for retina devices and smaller files for faster delivery for
      non-high DPI devices.
    </hp>
    <hp>
      To upload a file, paste any file into this editor, or drag and drop the
      file into the editor. Images are automatically inserted as images and
      other files are inserted as attachments.
    </hp>
    <hh3>Resizing Images</hh3>
    <hp>
      Click an image and it will display a resize handle that you can drag to
      resize. Images are resized on the server saving bandwidth and improving
      download times for your users.
    </hp>
    <hh3>Local Setup</hh3>
    <hp>
      If you are running the examples locally, get a free Portive API Key from
      https://portive.com/, add a file at `/examples/apps/next/.env.local` with
      one line in it like `PORTIVE_API_KEY=PRTV_xxxx_xxxx` substituting your API
      key for `PRTV_xxxx_xxxx`.
    </hp>
    <hh3>Cloud Images</hh3>
    <hp>Samples of cloud images in various upload states.</hp>
    <element
      type="cloud_image"
      url="https://files.portive.com/f/demo/6hndj3bdag7eqbpb2794s--1920x1440.jpg"
      bytes={654196}
      width={160}
      height={120}
      maxWidth={1920}
      maxHeight={1440}
    >
      <htext />
    </element>
    <element
      type="cloud_image"
      url="#image-none"
      bytes={654196}
      width={160}
      height={120}
      maxWidth={1920}
      maxHeight={1440}
    >
      <htext />
    </element>
    <element
      type="cloud_image"
      url="#image-half"
      bytes={654196}
      width={160}
      height={120}
      maxWidth={1920}
      maxHeight={1440}
    >
      <htext />
    </element>
    <element
      type="cloud_image"
      url="#image-full"
      bytes={654196}
      width={160}
      height={120}
      maxWidth={1920}
      maxHeight={1440}
    >
      <htext />
    </element>
    <element
      type="cloud_image"
      url="#image-error"
      bytes={654196}
      width={160}
      height={120}
      maxWidth={1920}
      maxHeight={1440}
    >
      <htext />
    </element>
    <element
      type="cloud_image"
      url="#image-state-not-found"
      bytes={654196}
      width={160}
      height={120}
      maxWidth={1920}
      maxHeight={1440}
    >
      <htext />
    </element>
    <hh3>Cloud Attachments</hh3>
    <hp>Samples of cloud attachments in various upload states.</hp>
    <element
      type="cloud_attachment"
      url="https://gist.githubusercontent.com/prabansal/115387/raw/0e5911c791c03f2ffb9708d98cac70dd2c1bf0ba/HelloWorld.txt"
      filename="hello.txt"
      bytes={8}
    >
      <htext />
    </element>
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
