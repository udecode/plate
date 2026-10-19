import { describe, expect, it } from 'bun:test';

import {
  getCurrentReleaseMajorGroups,
  getOlderReleaseMajorGroups,
  getReleaseMajorAnchor,
  getReleaseMajorPath,
  type ReleaseIndexRelease,
} from './releases';

const release = (tag: string): ReleaseIndexRelease => ({
  content: tag,
  date: '2026-01-01',
  tag,
  title: tag,
  url: `https://example.com/${tag}`,
});

describe('release major grouping', () => {
  const releases = [
    release('v53.0.1'),
    release('v53.0.0'),
    release('v52.3.0'),
    release('v51.0.0'),
    release('v50.0.0'),
    release('v49.0.0'),
  ];

  it('keeps the latest two release majors current', () => {
    expect(
      getCurrentReleaseMajorGroups(releases).map((group) => group.major)
    ).toEqual(['53', '52']);
  });

  it('keeps older majors available as dedicated release pages', () => {
    expect(
      getOlderReleaseMajorGroups(releases).map((group) => group.major)
    ).toEqual(['51', '50', '49']);
  });

  it('uses stable anchors and routes for major release groups', () => {
    expect(getReleaseMajorAnchor('51')).toBe('release-major-v51');
    expect(getReleaseMajorPath('51')).toBe('/docs/releases/51');
  });
});
