import { cleanDocxSpacerun } from './cleanDocxSpacerun';

describe('cleanDocxSpacerun', () => {
  it('replaces spacerun spans with equivalent spaces', () => {
    const document = new DOMParser().parseFromString(
      '<div><span style="mso-spacerun: yes">   </span><span>keep</span></div>',
      'text/html'
    );
    const element = document.querySelector('span[style]')!;

    cleanDocxSpacerun(element);

    expect(document.body.textContent).toBe('   keep');
    expect(document.querySelector('span[style]')).toBeNull();
  });

  it('ignores spans without the exact spacerun marker', () => {
    const document = new DOMParser().parseFromString(
      '<div><span style="mso-spacerun:no">x</span></div>',
      'text/html'
    );
    const element = document.querySelector('span')!;

    cleanDocxSpacerun(element);

    expect(document.body.innerHTML).toBe(
      '<div><span style="mso-spacerun:no">x</span></div>'
    );
  });
});
