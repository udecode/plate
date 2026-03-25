import { cleanDocxTabCount } from './cleanDocxTabCount';

describe('cleanDocxTabCount', () => {
  it('replaces tab-count markers with text nodes containing tabs', () => {
    const document = new DOMParser().parseFromString(
      '<div><span style="mso-tab-count:3"></span><span>keep</span></div>',
      'text/html'
    );
    const element = document.querySelector('span[style]')!;

    cleanDocxTabCount(element);

    expect(document.body.textContent).toBe('\t\t\tkeep');
    expect(document.querySelector('span[style]')).toBeNull();
  });

  it('ignores non-tab-count styles', () => {
    const document = new DOMParser().parseFromString(
      '<div><span style="color:red"></span></div>',
      'text/html'
    );
    const element = document.querySelector('span')!;

    cleanDocxTabCount(element);

    expect(document.body.innerHTML).toBe(
      '<div><span style="color:red"></span></div>'
    );
  });
});
