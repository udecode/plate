// prettier-ignore
import { expect } from 'vitest';
import { getTextFromNode, getExportedResult, testListNodes } from '../export-helpers/index';

describe('[orderedlist_interrupted1.docx] interrupted ordered list tests', async () => {
  const fileName = 'orderedlist_interrupted1.docx';
  let data;
  let body;

  beforeAll(async () => {
    data = await getExportedResult(fileName);
    body = data.elements?.find((el) => el.name === 'w:body');
  });

  it('correctly exports first list item', () => {
    const firstList = body.elements[0];
    const firstListText = getTextFromNode(firstList);
    expect(firstListText).toBe('a');
    testListNodes({ node: firstList, expectedLevel: 0, expectedNumPr: 0 });
  });

  it('correctly exports non-list interruption text', () => {
    const interruptedTextNode = body.elements[2];
    const textNode = interruptedTextNode.elements[1].elements[0].elements[0].text;
    expect(textNode).toBe('Some title');
  });

  it('correctly exports second list', () => {
    const secondList = body.elements[4];
    const secondListText = getTextFromNode(secondList);
    expect(secondListText).toBe('c');
  });

  it('exports correct node structure for pPr', () => {
    const firstList = body.elements[0];

    // Check if pPr is correct
    const firstListPprList = firstList.elements.filter((n) => n.name === 'w:pPr');
    expect(firstListPprList.length).toBe(1);

    const firstListPpr = firstListPprList[0];
    expect(firstListPpr.elements.length).toBe(2);

    // Ensure that we only have 1 pPr tag
    const firstListNumPrList = firstListPpr.elements.filter((n) => n.name === 'w:numPr');
    expect(firstListNumPrList.length).toBe(1);

    // Ensure that the pPr tag has the correct children
    const firstListNumPr = firstListNumPrList[0];
    expect(firstListNumPr.elements.length).toBe(2);
  });
});

describe('[custom_list1.docx] interrupted ordered list tests', async () => {
  const fileName = 'custom-list1.docx';
  let data;
  let body;

  beforeAll(async () => {
    data = await getExportedResult(fileName);
    body = data.elements?.find((el) => el.name === 'w:body');
  });

  it('exports custom list definition correctly', () => {
    const firstList = body.elements[0];
    const firstListPprList = firstList.elements.filter((n) => (n.name = 'w:pPr' && n.elements.length));
    const firstListPpr = firstListPprList[0];
    expect(firstListPpr.elements.length).toBe(5);

    const numPr = firstListPpr.elements.find((n) => n.name === 'w:numPr');
    const numIdTag = numPr.elements.find((n) => n.name === 'w:numId');
    const numId = numIdTag.attributes['w:val'];
    expect(numId).toBe('4');

    expect(body.elements.length).toBe(6);

    const secondList = body.elements[1];
    const secondListRun = secondList.elements.find((n) => n.name === 'w:r');
    const secondListText = secondListRun.elements.find((n) => n.name === 'w:t');
    const secondText = secondListText.elements[0].text;
    expect(secondText).toBe('Num 1.1');

    const fourthList = body.elements[3];
    const fourthListRun = fourthList.elements.find((n) => n.name === 'w:r');
    const fourthListText = fourthListRun.elements.find((n) => n.name === 'w:t');
    const fourthText = fourthListText.elements[0].text;
    expect(fourthText).toBe('Num 1.2.1');
  });
});
