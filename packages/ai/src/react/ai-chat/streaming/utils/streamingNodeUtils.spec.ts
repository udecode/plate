describe('ai chat streaming node utils', () => {
  it('marks restarted lists only when previous list context is absent', async () => {
    const { getListNode } = await import(
      `./getListNode?test=${Math.random().toString(36).slice(2)}`
    );

    const editor = {
      api: {
        previous: () => {},
      },
      selection: { focus: { path: [0, 0], offset: 0 } },
    } as any;

    expect(
      getListNode(editor, {
        listStart: 3,
        listStyleType: 'decimal',
        type: 'p',
      } as any)
    ).toEqual({
      listRestartPolite: 3,
      listStart: 3,
      listStyleType: 'decimal',
      type: 'p',
    });
  });

  it('compares paragraph list style types before falling back to plain types', async () => {
    const { isSameNode } = await import(
      `./isSameNode?test=${Math.random().toString(36).slice(2)}`
    );

    const editor = {
      getType: () => 'p',
    } as any;

    expect(
      isSameNode(
        editor,
        { listStyleType: 'disc', type: 'p' } as any,
        { listStyleType: 'disc', type: 'p' } as any
      )
    ).toBe(true);
    expect(
      isSameNode(
        editor,
        { listStyleType: 'disc', type: 'p' } as any,
        { listStyleType: 'decimal', type: 'p' } as any
      )
    ).toBe(false);
  });

  it('merges element and text props while preserving text content', async () => {
    const { nodesWithProps } = await import(
      `./nodesWithProps?test=${Math.random().toString(36).slice(2)}`
    );

    const editor = {
      api: {
        previous: () => {},
      },
      selection: { focus: { path: [0, 0], offset: 0 } },
    } as any;

    expect(
      nodesWithProps(
        editor,
        [
          {
            children: [{ text: 'leaf' }],
            listStart: 2,
            listStyleType: 'decimal',
            type: 'p',
          } as any,
        ],
        {
          elementProps: { foo: 'bar' },
          textProps: { bold: true },
        } as any
      )
    ).toEqual([
      {
        foo: 'bar',
        children: [{ bold: true, text: 'leaf' }],
        listRestartPolite: 2,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'p',
      },
    ]);
  });
});
