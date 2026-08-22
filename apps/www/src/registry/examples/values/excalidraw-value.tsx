/** @jsxRuntime classic */
/** @jsx jsx */
import type { ExcalidrawElement } from '@platejs/excalidraw';
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const excalidrawInitialData: Partial<
  Pick<ExcalidrawElement, 'data' | 'width'>
> = {
  data: {
    elements: [
      {
        id: 'oDVXy8D6rom3H1-LLH2-f',
        angle: 0,
        backgroundColor: 'transparent',
        boundElements: null,
        fillStyle: 'hachure',
        frameId: null,
        groupIds: [],
        height: 141.9765625,
        isDeleted: false,
        index: null,
        link: null,
        locked: false,
        opacity: 100,
        roundness: null,
        roughness: 1,
        seed: 1_968_410_350,
        strokeColor: '#000000',
        strokeStyle: 'solid',
        strokeWidth: 1,
        type: 'rectangle',
        updated: 1,
        version: 141,
        versionNonce: 361_174_001,
        width: 186.47265625,
        x: 100.50390625,
        y: 93.67578125,
      },
      {
        id: '-xMIs_0jIFqvpx-R9UnaG',
        angle: 0,
        backgroundColor: 'transparent',
        boundElements: null,
        fillStyle: 'hachure',
        frameId: null,
        groupIds: [],
        height: 129.51171875,
        isDeleted: false,
        index: null,
        link: null,
        locked: false,
        opacity: 100,
        roundness: null,
        roughness: 1,
        seed: 957_947_807,
        strokeColor: '#000000',
        strokeStyle: 'solid',
        strokeWidth: 1,
        type: 'ellipse',
        updated: 1,
        version: 47,
        versionNonce: 1_128_618_623,
        width: 198.21875,
        x: 300.5703125,
        y: 190.69140625,
      },
    ],
    state: { currentItemFontFamily: 1, viewBackgroundColor: '#AFEEEE' },
  },
};

export const excalidrawValue = (
  <fragment>
    <hheading level={2}>Excalidraw</hheading>
    <hp>
      Unleash your creativity with the Excalidraw plugin, which enables you to
      embed and draw diagrams directly within your editor.
    </hp>
    <hexcalidraw {...excalidrawInitialData} width="50%">
      <htext />
    </hexcalidraw>
  </fragment>
) as Value;
