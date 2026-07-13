import { renderHook } from '@testing-library/react';

const useTocObserverMock = mock();

mock.module('./useTocObserver', () => ({
  useTocObserver: useTocObserverMock,
}));

describe('useTocController', () => {
  beforeEach(() => {
    useTocObserverMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('scrolls the toc wrapper toward the active item when it falls out of view', async () => {
    const { useTocController } = await import(
      `./useTocController?test=${Math.random().toString(36).slice(2)}`
    );
    const scrollTo = mock();
    const wrapper = document.createElement('div');
    const root = document.createElement('nav');

    wrapper.id = 'toc_wrap';
    wrapper.scrollTop = 20;
    wrapper.scrollTo = scrollTo;
    root.append(wrapper);

    useTocObserverMock.mockReturnValue({ offset: 15, visible: false });

    renderHook(() =>
      useTocController({
        activeId: 'h1',
        isObserve: true,
        tocRef: { current: root },
      })
    );

    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'instant', top: 35 });
  });
});
