import React from 'react';
import { Plate, TEditableProps } from '@udecode/plate';

const editableProps: TEditableProps = {
  placeholder: 'Type...',
  style: {
    padding: 15,
  },
};

export default () => <Plate editableProps={editableProps} />;
