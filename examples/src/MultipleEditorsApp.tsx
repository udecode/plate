import React from 'react';
import { HeadingToolbar, Plate, PlateProps } from '@udecode/plate';
import { MarkBallonToolbar } from './balloon-toolbar/MarkBallonToolbar';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { BasicMarkToolbarButtons } from './basic-marks/BasicMarkToolbarButtons';
import { imagePlugins } from './image/imagePlugins';
import { imageValue } from './image/imageValue';
import { MyValue } from './typescript/plateTypes';

const styles = {
  wrapper: {
    display: 'flex',
  },
};

const Editor = (props: PlateProps<MyValue>) => (
  <Plate {...props}>
    <MarkBallonToolbar />
  </Plate>
);

export default () => (
  <>
    <HeadingToolbar>
      <BasicElementToolbarButtons />
      <BasicMarkToolbarButtons />
    </HeadingToolbar>

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
