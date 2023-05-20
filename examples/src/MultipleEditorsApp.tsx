import React from 'react';
import { Plate, PlateProps, PlateProvider } from '@udecode/plate';
import { MyValue } from 'examples-next/src/lib/plate/typescript/plateTypes';
import { MarkBalloonToolbar } from './balloon-toolbar/MarkBalloonToolbar';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { BasicMarkToolbarButtons } from './basic-marks/BasicMarkToolbarButtons';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { imagePlugins } from './media/imagePlugins';
import { imageValue } from './media/mediaValue';
import { Toolbar } from './toolbar/Toolbar';

const styles = {
  wrapper: {
    display: 'flex',
  },
};

function Editor(props: PlateProps<MyValue>) {
  return (
    <Plate {...props}>
      <MarkBalloonToolbar />
    </Plate>
  );
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
          <Toolbar>
            <BasicElementToolbarButtons />
            <BasicMarkToolbarButtons />
          </Toolbar>

          <div style={styles.wrapper}>
            <Editor />
            <Editor id="marks" />
            <Editor id="image" />
          </div>
        </PlateProvider>
      </PlateProvider>
    </PlateProvider>
  );
}
