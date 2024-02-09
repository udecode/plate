import { dmp } from './internal/utils/dmp';

describe('dmp', () => {
  it('modify BC -> FM', () => {
    const old_text = 'ABCD';
    const new_text = 'AFMD';
    const diff = dmp.diff_main(old_text, new_text);
    expect(JSON.stringify(diff)).toStrictEqual(
      JSON.stringify([
        [0, 'A'],
        [-1, 'BC'],
        [1, 'FM'],
        [0, 'D'],
      ])
    );
  });
  it('insert E and modify BC -> FM', () => {
    const old_text = 'ABCD';
    const new_text = 'AEFMD';
    const diff = dmp.diff_main(old_text, new_text);
    expect(JSON.stringify(diff)).toStrictEqual(
      JSON.stringify([
        [0, 'A'],
        [-1, 'BC'],
        [1, 'EFM'],
        [0, 'D'],
      ])
    );
  });
});
