/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

import type { TNodeProps } from '@udecode/plate-common';
import type { TExcalidrawElement } from '@udecode/plate-excalidraw';

export const excalidrawInitialData: TNodeProps<TExcalidrawElement> = {
  data: {
    elements: [
      {
        id: 'oDVXy8D6rom3H1-LLH2-f',
        angle: 0,
        backgroundColor: 'transparent',
        fillStyle: 'hachure',
        groupIds: [],
        height: 141.976_562_5,
        isDeleted: false,
        opacity: 100,
        roughness: 1,
        seed: 1_968_410_350,
        strokeColor: '#000000',
        strokeStyle: 'solid',
        strokeWidth: 1,
        type: 'rectangle',
        version: 141,
        versionNonce: 361_174_001,
        width: 186.472_656_25,
        x: 100.503_906_25,
        y: 93.675_781_25,
      },
      {
        id: '-xMIs_0jIFqvpx-R9UnaG',
        angle: 0,
        backgroundColor: 'transparent',
        fillStyle: 'hachure',
        groupIds: [],
        height: 129.511_718_75,
        isDeleted: false,
        opacity: 100,
        roughness: 1,
        seed: 957_947_807,
        strokeColor: '#000000',
        strokeStyle: 'solid',
        strokeWidth: 1,
        type: 'ellipse',
        version: 47,
        versionNonce: 1_128_618_623,
        width: 198.218_75,
        x: 300.570_312_5,
        y: 190.691_406_25,
      },
    ],
    state: { currentItemFontFamily: 1, viewBackgroundColor: '#AFEEEE' },
  },
};

export const excalidrawValue: any = (
  <fragment>
    <hh2>Excalidraw</hh2>
    <hp>
      Unleash your creativity with the Excalidraw plugin, which enables you to
      embed and draw diagrams directly within your editor.
    </hp>
    <hexcalidraw {...excalidrawInitialData} width="50%">
      <htext />
    </hexcalidraw>
  </fragment>
);
