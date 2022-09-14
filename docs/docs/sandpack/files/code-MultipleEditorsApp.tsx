export const multipleEditorsAppCode = `import React from 'react';
import { Plate, PlateProps, PlateProvider } from '@udecode/plate';
import { MarkBalloonToolbar } from './balloon-toolbar/MarkBalloonToolbar';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { BasicMarkToolbarButtons } from './basic-marks/BasicMarkToolbarButtons';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { imagePlugins } from './media/imagePlugins';
import { imageValue } from './media/mediaValue';
import { Toolbar } from './toolbar/Toolbar';
import { MyValue } from './typescript/plateTypes';

const styles = {
  wrapper: {
    display: 'flex',
  },
};

const Editor = (props: PlateProps<MyValue>) => (
  <Plate {...props}>
    <MarkBalloonToolbar />
  </Plate>
);

export default () => (
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
`;

export const multipleEditorsAppFile = {
  '/MultipleEditorsApp.tsx': multipleEditorsAppCode,
};
