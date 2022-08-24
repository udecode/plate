import React, { useState } from 'react';
import { Plate, TEditableProps } from '@udecode/plate-core';
import { OnAddThread } from '../src';
import { Comments } from './Comments';
import { Playground } from './Playground';

export const App = () => {
  return (
    <div>
      <Playground />
    </div>
  );
};
