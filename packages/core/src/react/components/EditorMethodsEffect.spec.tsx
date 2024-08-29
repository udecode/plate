import React from 'react';

import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';

import { createPlateEditor } from '../editor';
import { usePlateStore } from '../stores';
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
  //   const plugins = [createSlatePlugin({ decorate, key: 'test' })];
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

  it('should set setPlateState on editor', () => {
    const editor = createPlateEditor();

    const wrapper = () => (
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    renderHook(() => null, { wrapper });

    expect(editor.setPlateState).toBeDefined();
  });

  it('should set setPlateState on editor', () => {
    const editor = createPlateEditor();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>
        <PlateContent />
        {children}
      </Plate>
    );

    renderHook(() => null, { wrapper });

    expect(editor.setPlateState).toBeDefined();
  });

  it('should update allowed keys using setPlateState', () => {
    const editor = createPlateEditor();

    const TestComponent = () => {
      const readOnly = usePlateStore().get.readOnly();

      return <div data-testid="readOnly">{readOnly ? 'true' : 'false'}</div>;
    };

    const { getByTestId } = render(
      <Plate editor={editor}>
        <PlateContent />
        <TestComponent />
      </Plate>
    );

    act(() => {
      editor.setPlateState('readOnly', true);
    });

    expect(getByTestId('readOnly')).toHaveTextContent('true');
  });
});
