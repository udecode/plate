export const portiveValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

const PORTRAIT_IMAGE =
  'https://files.dev.portive.com/f/demo/ktjairhr4jy5i3qr6ow43--1920x2880.jpg';
const LANDSCAPE_IMAGE =
  'https://files.dev.portive.com/f/demo/4q494y5quamrcrwvce23n--1920x1281.jpg';
const SQUARE_IMAGE =
  'https://files.dev.portive.com/f/demo/hibbzu5uks7jrnl91yxei--1920x1920.jpg';
const ICON_IMAGE =
  'https://files.dev.portive.com/f/demo/qckv9tvtxqh76y0kncow6--40x40.png';
const TEXT_FILE =
  'https://files.dev.portive.com/f/demo/jsyd2e136k4ki4i4f5sz7.txt';
const PDF_FILE =
  'https://files.dev.portive.com/f/demo/gxvst8tkd7ta0fmr4htp2.pdf';

const IMAGE_PATH_REGEXP = /[/][a-zA-Z0-9]+--([0-9]+)x([0-9]+)[.][a-z]+/i;

type HostedFileInfo = {
  type: 'image';
  url: string;
  originSize: [number, number]; // size of origin image on server
  currentSize: [number, number]; // current size
};

function getHostedImageInfo(url: string | URL): HostedFileInfo {
  url = new URL(url);
  const match = url.pathname.match(IMAGE_PATH_REGEXP);
  if (match === null) throw new Error(\`Expected url to match an Image URL\`);
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  return {
    type: 'image',
    url: url.href,
    originSize: [width, height],
    currentSize: [width, height],
  };
}

export const images: Record<string, HostedFileInfo> = {
  portrait: getHostedImageInfo(PORTRAIT_IMAGE),
  landscape: getHostedImageInfo(LANDSCAPE_IMAGE),
  square: getHostedImageInfo(SQUARE_IMAGE),
  icon: getHostedImageInfo(ICON_IMAGE),
};

export const portiveValue: any = (
  <fragment>
    <hh2>Portive</hh2>
    <hp>Generic files</hp>
    <element
      type="attachment-block"
      originKey="pdf"
      filename="sherlock-holmes.pdf"
      bytes={771277}
    >
      <htext />
    </element>
    <himg originKey="icon" originSize={images.icon.originSize} size={[40, 40]}>
      <htext />
    </himg>

    <hp>Completed upload with origin id</hp>
  </fragment>
);
`;

export const portiveValueFile = {
  '/portive/portiveValue.tsx': portiveValueCode,
};
