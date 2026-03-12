import { removeHtmlNodesBetweenComments } from './removeHtmlNodesBetweenComments';

describe('removeHtmlNodesBetweenComments', () => {
  it('removes all nodes between matching comments and drops the comments too', () => {
    const root = document.createElement('div');

    root.innerHTML =
      'before<!--start--><span>remove</span><em>me</em><!--end--><p>after</p>';

    removeHtmlNodesBetweenComments(root, 'start', 'end');

    expect(root.innerHTML).toBe('before<p>after</p>');
  });
});
