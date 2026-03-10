import React from 'react';

import { render } from '@testing-library/react';

import { createSlatePlugin } from '../../lib';
import { Plate, PlateContent } from '../components';
import { createPlateEditor } from '../editor';

describe('useEditableProps', () => {
  describe('default', () => {
    it('trigger decorate only once', () => {
      const decorate = mock();

      const editor = createPlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'a',
            decorate: () => {
              decorate();

              return [];
            },
          }),
        ],
      });

      render(
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      );

      expect(decorate).toHaveBeenCalledTimes(8);
    });
  });
});
