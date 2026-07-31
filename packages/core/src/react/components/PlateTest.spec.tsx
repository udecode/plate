/// <reference types="@testing-library/jest-dom" />

import type { Value } from '@platejs/plite';
import { createReactEditor } from '@platejs/plite-react';

import { act, render } from '@testing-library/react';
import React from 'react';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { PlateTest } from './PlateTest';

const value: Value = [{ children: [{ text: 'one' }], type: 'p' }];

describe('PlateTest', () => {
  it('extends a provided Plite editor before rendering', async () => {
    const editor = createReactEditor();

    let rendered!: ReturnType<typeof render>;
    try {
      await act(async () => {
        rendered = render(
          <PlateTest
            editor={editor}
            schemaIdentity={{
              id: 'plate-test:core:react-components-platetest:editor-1',
              version: 1,
            }}
            initialValue={value}
          />
        );
      });
    } catch (error) {
      if (error instanceof AggregateError) {
        throw error.errors[0];
      }

      throw error;
    }

    const { getByTestId } = rendered;

    expect(getByTestId('plite-content-editable')).toBeInTheDocument();
    expect(
      getPlateRuntime(editor).pluginList.some((plugin) => plugin.name === 'dom')
    ).toBe(true);
  });
});
