import React from 'react';
import { Plate, PlateProps, PlateProvider } from '@udecode/plate';

import { Separator } from '@/components/ui/separator';
import { basicElementsValue } from '@/plate/basic-elements/basicElementsValue';
import { basicMarksValue } from '@/plate/basic-marks/basicMarksValue';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { imagePlugins } from '@/plate/media/imagePlugins';
import { imageValue } from '@/plate/media/mediaValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { TurnIntoDropdownMenu } from '@/plate/toolbar/TurnIntoDropdownMenu';
import { MyValue } from '@/plate/typescript/plateTypes';

function Editor(props: PlateProps<MyValue>) {
  return <Plate {...props}>{/* <MarkBalloonToolbar /> */}</Plate>;
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
