import { renderHook } from '@testing-library/react';

import { createStaticEditor } from '../../static/editor/withStatic';
import { useCreateEditor } from './useCreateEditor';
import { useStaticEditor } from './useStaticEditor';

describe('useCreateEditor', () => {
  it('creates a derived-schema editor without options', () => {
    const { result } = renderHook(() => useCreateEditor());

    expect(result.current.read.schema.identity()?.kind).toBe('derived');
  });

  it('preserves the enabled result contract', () => {
    const { result } = renderHook(() => useCreateEditor({ enabled: false }));
    const disabled: null = result.current;

    expect(disabled).toBeNull();
  });

  it('creates static editors and view editors without options', () => {
    const staticEditor = createStaticEditor();
    const { result } = renderHook(() => useStaticEditor());

    expect(staticEditor.read.schema.identity()?.kind).toBe('derived');
    expect(result.current.read.schema.identity()?.kind).toBe('derived');
  });
});
