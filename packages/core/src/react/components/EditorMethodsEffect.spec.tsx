import React from 'react';

import { renderHook } from '@testing-library/react-hooks';

import { EXPOSED_STORE_KEYS } from '../../lib';
import { createPlateEditor } from '../editor';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

describe('EditorMethodsEffect and redecorate', () => {
  it('should set redecorate method on editor', () => {
    const editor = createPlateEditor();

    const wrapper = () => (
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    renderHook(() => null, { wrapper });

    expect(editor.api.redecorate).toBeDefined();
  });

  // it('should trigger decorate when redecorate is called', () => {
  //   const decorate = jest.fn(() => []);
  //   const plugins = [createPlugin({ decorate, key: 'test' })];
  //   const editor = createPlateEditor({ plugins });
  //
  //   const wrapper = () => (
  //     <Plate decorate={decorate} editor={editor}>
  //       <PlateContent />
  //     </Plate>
  //   );
  //
  //   const { result } = renderHook(() => useRedecorate(), { wrapper });
  //
  //   act(() => {
  //     result.current();
  //   });
  //
  //   expect(decorate).toHaveBeenCalled();
  // });

  // it('should increment versionDecorate when redecorate is called', () => {
  //   const editor = createPlateEditor();
  //
  //   const wrapper = () => (
  //     <Plate editor={editor}>
  //       <PlateContent />
  //     </Plate>
  //   );
  //
  //   const { result: redecorateFn } = renderHook(() => useRedecorate(), {
  //     wrapper,
  //   });
  //   const { result: selectorsResult } = renderHook(() => usePlateSelectors(), {
  //     wrapper,
  //   });
  //
  //   const initialVersion = selectorsResult.current.versionDecorate();
  //
  //   act(() => {
  //     redecorateFn.current();
  //   });
  //
  //   expect(selectorsResult.current.versionDecorate()).toBe(initialVersion + 1);
  // });

  it('should set plate.set methods on editor', () => {
    const editor = createPlateEditor();

    const wrapper = () => (
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    renderHook(() => null, { wrapper });

    expect(editor.api.plate).toBeDefined();
    expect(editor.api.plate.set).toBeDefined();

    // Check if all EXPOSED_STORE_KEYS are present in editor.api.plate.set
    EXPOSED_STORE_KEYS.forEach((key) => {
      expect(editor.api.plate.set[key]).toBeDefined();
    });
  });
});
