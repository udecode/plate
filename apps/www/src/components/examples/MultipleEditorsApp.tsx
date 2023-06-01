import React from 'react';
import { Plate, PlateProps, PlateProvider } from '@udecode/plate';

import { Separator } from '@/components/ui/separator';
import { HeadingToolbar } from '@/plate/aui/heading-toolbar';
import { TurnIntoDropdownMenu } from '@/plate/bcomponents/turn-into-dropdown-menu';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { imagePlugins } from '@/plate/demo/plugins/imagePlugins';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { basicMarksValue } from '@/plate/demo/values/basicMarksValue';
import { imageValue } from '@/plate/demo/values/mediaValue';
import { MyValue } from '@/types/plate.types';

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
          <HeadingToolbar>
            <TurnIntoDropdownMenu />
          </HeadingToolbar>

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
