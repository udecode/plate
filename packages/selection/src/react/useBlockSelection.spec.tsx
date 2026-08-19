import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';
import type { NodeKey } from '@platejs/plite';

const useEditorMock = mock();
const useElementContextMock = mock();
const usePluginStoreMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  usePluginStore: usePluginStoreMock,
}));
mock.module('@platejs/core/react/internal', () => ({
  useElementContext: useElementContextMock,
}));

const loadHooks = () =>
  import(`./useBlockSelection?test=${Math.random().toString(36).slice(2)}`);

describe('block selection hooks', () => {
  afterEach(() => {
    mock.restore();
    useEditorMock.mockReset();
    useElementContextMock.mockReset();
    usePluginStoreMock.mockReset();
  });

  it('reads selected state from the typed plugin portal', async () => {
    const element = { children: [{ text: '' }], type: 'paragraph' };
    const nodeKey = 'runtime:a' as NodeKey;

    useElementContextMock.mockReturnValue({ element, path: [0] });
    useEditorMock.mockReturnValue({
      key: () => nodeKey,
    });
    usePluginStoreMock.mockImplementation(
      (_plugin, key, id) => key === 'isSelected' && id === nodeKey
    );

    const { useBlockSelected } = await loadHooks();

    expect(renderHook(() => useBlockSelected()).result.current).toBe(true);
    expect(
      renderHook(() => useBlockSelected('runtime:b' as NodeKey)).result.current
    ).toBe(false);
  });
});
