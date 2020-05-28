import { setPositionAtSelection } from 'components/Toolbar/BalloonToolbar';

const input = document.createElement('div');

const output = '1px';

it('should be', () => {
  window.getSelection = () =>
    ({
      rangeCount: 1,
      getRangeAt: () => ({
        getBoundingClientRect: () => ({
          bottom: 1,
          left: 1,
          width: 100,
        }),
      }),
    } as any);

  setPositionAtSelection(input, 'bottom');
  expect(input.style.top).toEqual(output);
});
