import React from 'react';
import { Plate, PlateProps, PlateProvider } from '@udecode/plate-common';

import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { TurnIntoDropdownMenu } from '@/components/plate-ui/turn-into-dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { imagePlugins } from '@/plate/demo/plugins/imagePlugins';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { basicMarksValue } from '@/plate/demo/values/basicMarksValue';
import { imageValue } from '@/plate/demo/values/mediaValue';
import { MyValue } from '@/plate/plate.types';

function Editor(props: PlateProps<MyValue>) {
  return <Plate {...props}>{/* <MarkFloatingToolbar /> */}</Plate>;
}

export default function MultipleEditorsApp() {
  return (
    <PlateProvider<MyValue>
      plugins={basicNodesPlugins}
      initialValue={basicElementsValue}
    >
      <PlateProvider<MyValue>
        id="marks"
        plugins={basicNodesPlugins}
        initialValue={basicMarksValue}
      >
        <PlateProvider<MyValue>
          id="image"
          plugins={imagePlugins}
          initialValue={imageValue}
        >
          <FixedToolbar>
            <TurnIntoDropdownMenu />
          </FixedToolbar>

          <div>
            <Editor />
            <Separator />
            <Editor id="marks" />
            <Separator />
            <Editor id="image" />
          </div>
        </PlateProvider>
      </PlateProvider>
    </PlateProvider>
  );
}
