import { applicationName } from '../constants';

import generateCoreXML from './core';

describe('generateCoreXML', () => {
  it('renders the provided metadata fields and ISO timestamps', () => {
    const xml = generateCoreXML(
      'Title',
      'Subject',
      'Creator',
      ['one', 'two'],
      'Description',
      'Modifier',
      3,
      new Date('2024-01-02T03:04:05.000Z'),
      new Date('2024-02-03T04:05:06.000Z')
    );

    expect(xml).toContain('<dc:title>Title</dc:title>');
    expect(xml).toContain('<dc:subject>Subject</dc:subject>');
    expect(xml).toContain('<dc:creator>Creator</dc:creator>');
    expect(xml).toContain('<cp:keywords>one, two</cp:keywords>');
    expect(xml).toContain('<cp:lastModifiedBy>Modifier</cp:lastModifiedBy>');
    expect(xml).toContain('<cp:revision>3</cp:revision>');
    expect(xml).toContain('2024-01-02T03:04:05.000Z');
    expect(xml).toContain('2024-02-03T04:05:06.000Z');
  });

  it('uses default app metadata and omits keywords for non-array inputs', () => {
    const xml = generateCoreXML(undefined, undefined, undefined, 'bad' as any);

    expect(xml).toContain(`<dc:creator>${applicationName}</dc:creator>`);
    expect(xml).toContain(
      `<cp:lastModifiedBy>${applicationName}</cp:lastModifiedBy>`
    );
    expect(xml).not.toContain('<cp:keywords>');
  });
});
