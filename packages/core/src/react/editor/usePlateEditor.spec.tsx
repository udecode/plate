import { renderHook } from '@testing-library/react';

import { createStaticEditor } from '../../static/editor/withStatic';
import { usePlateEditor } from './usePlateEditor';
import { usePlateViewEditor } from './usePlateViewEditor';

describe('usePlateEditor', () => {
  it('creates a derived-schema editor without options', () => {
    const { result } = renderHook(() => usePlateEditor());

    expect(result.current.read.schema.identity()?.kind).toBe('derived');
  });

  it('preserves the enabled result contract', () => {
    const { result } = renderHook(() => usePlateEditor({ enabled: false }));
    const disabled: null = result.current;

    expect(disabled).toBeNull();
  });

  it('creates static editors and view editors without options', () => {
    const staticEditor = createStaticEditor();
    const { result } = renderHook(() => usePlateViewEditor());

    expect(staticEditor.read.schema.identity()?.kind).toBe('derived');
    expect(result.current.read.schema.identity()?.kind).toBe('derived');
  });
});
