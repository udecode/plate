import * as platejs from 'platejs';

const getEditorPluginMock = mock();

mock.module('../LinkPlugin', () => ({
  LinkPlugin: { key: 'link' },
}));

describe('floating link triggers', () => {
  beforeEach(() => {
    spyOn(platejs, 'getEditorPlugin').mockImplementation(
      getEditorPluginMock as any
    );
    getEditorPluginMock.mockReset();
  });

  afterEach(() => {
    mock.restore();
  });

  it('opens insert mode with selected text when the current selection is eligible', async () => {
    const { triggerFloatingLinkInsert } = await import(
      `./triggerFloatingLinkInsert?test=${Math.random().toString(36).slice(2)}`
    );
    const setOption = mock();
    const show = mock();

    getEditorPluginMock.mockReturnValue({
      api: {
        floatingLink: { show },
      },
      getOptions: () => ({
        mode: '',
      }),
      setOption,
      type: 'a',
    });

    const editor = {
      api: {
        isAt: () => false,
        some: () => false,
        string: () => 'selected text',
      },
      id: 'editor-id',
      selection: { anchor: { path: [0, 0], offset: 0 } },
    } as any;

    expect(triggerFloatingLinkInsert(editor, { focused: true })).toBe(true);
    expect(setOption).toHaveBeenCalledWith('text', 'selected text');
    expect(show).toHaveBeenCalledWith('insert', 'editor-id');
  });

  it('loads link state into edit mode and strips duplicate url text', async () => {
    const { triggerFloatingLinkEdit } = await import(
      `./triggerFloatingLinkEdit?test=${Math.random().toString(36).slice(2)}`
    );
    const setOption = mock();

    getEditorPluginMock.mockReturnValue({
      setOption,
    });

    const editor = {
      api: {
        node: () => [{ target: '_blank', url: 'https://x.dev' }, [0]],
        string: () => 'https://x.dev',
      },
      getType: () => 'link',
    } as any;

    expect(triggerFloatingLinkEdit(editor)).toBe(true);
    expect(setOption).toHaveBeenCalledWith('url', 'https://x.dev');
    expect(setOption).toHaveBeenCalledWith('newTab', true);
    expect(setOption).toHaveBeenCalledWith('text', '');
    expect(setOption).toHaveBeenCalledWith('isEditing', true);
  });

  it('routes to edit when the floating link mode is edit', async () => {
    const { triggerFloatingLink } = await import(
      `./triggerFloatingLink?test=${Math.random().toString(36).slice(2)}`
    );
    const setOption = mock();

    getEditorPluginMock.mockReturnValue({
      getOption: () => 'edit',
      setOption,
    });

    const editor = {
      api: {
        node: () => [{ target: undefined, url: 'https://x.dev' }, [0]],
        string: () => 'hello',
      },
      getType: () => 'link',
    } as any;

    triggerFloatingLink(editor, { focused: true });

    expect(setOption).toHaveBeenCalledWith('url', 'https://x.dev');
    expect(setOption).toHaveBeenCalledWith('text', 'hello');
    expect(setOption).toHaveBeenCalledWith('isEditing', true);
  });
});
