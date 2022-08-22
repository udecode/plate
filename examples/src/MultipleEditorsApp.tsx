import React from 'react';
import { Plate, PlateProps } from '@udecode/plate';
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
  <>
    <Toolbar>
      <BasicElementToolbarButtons />
      <BasicMarkToolbarButtons />
    </Toolbar>

    <div style={styles.wrapper}>
      <Editor
        id="basic"
        plugins={basicNodesPlugins}
        initialValue={basicElementsValue}
      />
      <Editor
        id="marks"
        plugins={basicNodesPlugins}
        initialValue={basicMarksValue}
      />
      <Editor id="image" plugins={imagePlugins} initialValue={imageValue} />
    </div>
  </>
);
