import { collaborationFixtures } from './fixtures';

describe('yjs collaboration', () => {
  afterEach(() => {
    mock.restore();
  });

  for (const fixture of collaborationFixtures) {
    it(fixture.name.replaceAll('_', ' '), fixture.run);
  }
});
