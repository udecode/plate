import React, { useMemo, useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { pipe } from '../utils/pipe';
import { EditablePlugins } from './index';
import { SlatePlugins } from './SlatePlugins';

describe('SlatePlugins', () => {
  describe('when uncontrolled', () => {
    it('should render', () => {
      const EditorEmpty = () => {
        return (
          <SlatePlugins>
            <EditablePlugins data-testid="EditablePlugins" />
          </SlatePlugins>
        );
      };

      const { getAllByTestId } = render(<EditorEmpty />);

      expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
    });
  });
});
