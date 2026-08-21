/// <reference types="@testing-library/jest-dom" />

import { createReactEditor } from '@platejs/plite-react';
import { act, render } from '@testing-library/react';
import React from 'react';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { PlateTest } from './PlateTest';

const value = [{ children: [{ text: 'one' }], type: 'paragraph' }] as const;

describe('PlateTest', () => {
  it('extends a provided Plite editor before rendering', async () => {
    const editor = createReactEditor();

    let rendered!: ReturnType<typeof render>;
    try {
      await act(async () => {
        rendered = render(
          <PlateTest
            editor={editor}
            schema={{
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

const assertPlateTestSchemaContract = () => {
  const editor = createReactEditor();

  // @ts-expect-error raw editors require persisted schema lineage
  return <PlateTest editor={editor} schema={{ overrides: [] }} />;
};

void assertPlateTestSchemaContract;
