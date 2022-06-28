import React from 'react';
import { Plate, TEditableProps } from '@udecode/plate';

const editableProps: TEditableProps = {
  placeholder: 'Type...',
};

export default () => <Plate editableProps={editableProps} />;
