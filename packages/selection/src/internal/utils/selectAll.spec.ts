import { selectAll } from './selectAll';

describe('selectAll', () => {
  it('resolves selectors against the provided document', () => {
    const doc = document.implementation.createHTMLDocument('selection');

    doc.body.innerHTML = `
      <div class="alpha"></div>
      <div class="beta"></div>
    `;

    expect(selectAll('.alpha', doc)).toEqual([doc.querySelector('.alpha')!]);
  });

  it('merges explicit elements with selector results in list order', () => {
    const doc = document.implementation.createHTMLDocument('selection');

    doc.body.innerHTML = `
      <div class="alpha"></div>
      <div class="beta"></div>
    `;

    const beta = doc.querySelector('.beta')!;

    expect(selectAll([beta, '.alpha'], doc)).toEqual([
      beta,
      doc.querySelector('.alpha')!,
    ]);
  });
});
