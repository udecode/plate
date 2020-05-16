import { setPositionAtSelection } from 'components/utils';

const input = document.createElement('div');

const output = '1';

it('should be', () => {
  window.getSelection = () =>
    ({
      rangeCount: 1,
      getRangeAt: () => ({
        getBoundingClientRect: () => ({
          top: 1,
          left: 1,
          width: 100,
        }),
      }),
    } as any);

  setPositionAtSelection(input);
  expect(input.style.opacity).toEqual(output);
});
