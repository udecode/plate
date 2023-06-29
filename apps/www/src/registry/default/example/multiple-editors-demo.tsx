import React from 'react';
import { Plate, PlateProps, PlateProvider } from '@udecode/plate-common';

import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { imagePlugins } from '@/plate/demo/plugins/imagePlugins';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { basicMarksValue } from '@/plate/demo/values/basicMarksValue';
import { imageValue } from '@/plate/demo/values/mediaValue';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { Separator } from '@/registry/default/plate-ui/separator';
import { TurnIntoDropdownMenu } from '@/registry/default/plate-ui/turn-into-dropdown-menu';
import { MyValue } from '@/types/plate-types';

function Editor(props: PlateProps<MyValue>) {
  return <Plate {...props}>{/* <MarkFloatingToolbar /> */}</Plate>;
}

export default function MultipleEditorsDemo() {
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
