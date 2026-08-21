import { renderHook } from '@testing-library/react';

const setReference = mock();
const setFloating = mock();
const update = mock();
const useFloatingMock = mock(() => ({
  context: {},
  elements: {},
  floatingStyles: {},
  isPositioned: true,
  middlewareData: {},
  placement: 'bottom',
  refs: { setFloating, setReference },
  strategy: 'absolute',
  update,
  x: 10,
  y: 20,
}));

mock.module('./floating-ui', () => ({
  autoUpdate: mock(),
  useFloating: useFloatingMock,
}));

describe('floating hooks', () => {
  beforeEach(() => {
    setReference.mockClear();
    setFloating.mockClear();
    update.mockClear();
    useFloatingMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('controls a virtual reference and derives its floating style', async () => {
    const { useVirtualFloating } = await import(
      `./useFloating?virtual=${Math.random().toString(36).slice(2)}`
    );
    const rect = {
      bottom: 8,
      height: 4,
      left: 2,
      right: 6,
      top: 4,
      width: 4,
      x: 2,
      y: 4,
    };
    const { result } = renderHook(() =>
      useVirtualFloating({
        getBoundingClientRect: () => rect,
        open: false,
      })
    );

    expect(setReference).toHaveBeenCalledWith(
      result.current.virtualElementRef.current
    );
    expect(
      result.current.virtualElementRef.current.getBoundingClientRect()
    ).toBe(rect);
    expect(result.current.style).toEqual({
      display: 'none',
      left: 10,
      position: 'absolute',
      top: 20,
      visibility: undefined,
    });
    expect(update).toHaveBeenCalled();
  });
});
