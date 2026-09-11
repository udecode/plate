import {
  releaseDOMTextFlowIndex,
  releaseDOMTextFlowRecordIndex,
  resolveDOMTextFlowInsertTarget,
  resolveDOMTextFlowOffset,
  resolveDOMTextFlowPoint,
  resolveDOMTextFlowStringOffset,
  setDOMTextFlowRecordIndex,
  setDOMTextFlowIndex,
} from '../../src/dom/internal';

test('maps raw and wrapped retained text in both directions', () => {
  const host = document.createElement('span');
  const raw = document.createTextNode('abc');
  const stringElement = document.createElement('span');
  const styledHead = document.createTextNode('de');
  const styledTail = document.createTextNode('fg');
  const tail = document.createTextNode('hi');

  stringElement.setAttribute('data-plite-string', 'true');
  stringElement.append(styledHead, styledTail);
  host.append(raw, stringElement, tail);
  setDOMTextFlowIndex(host, [
    {
      bindingHost: null,
      bindingRecord: null,
      domLength: 3,
      end: 3,
      start: 0,
      stringElement: null,
      textNode: raw,
    },
    {
      bindingHost: null,
      bindingRecord: null,
      domLength: 4,
      end: 7,
      start: 3,
      stringElement,
      textNode: styledHead,
    },
    {
      bindingHost: null,
      bindingRecord: null,
      domLength: 2,
      end: 9,
      start: 7,
      stringElement: null,
      textNode: tail,
    },
  ]);

  expect(resolveDOMTextFlowPoint(host, 3)).toEqual({ node: raw, offset: 3 });
  expect(resolveDOMTextFlowPoint(host, 3, undefined, 'forward')).toEqual({
    node: styledHead,
    offset: 0,
  });
  expect(resolveDOMTextFlowPoint(host, 6)).toEqual({
    node: styledTail,
    offset: 1,
  });
  expect(resolveDOMTextFlowOffset(host, styledTail, 1)).toBe(6);
  expect(resolveDOMTextFlowStringOffset(host, stringElement, 3)).toBe(6);

  tail.nodeValue = 'hXi';
  expect(resolveDOMTextFlowInsertTarget(host, tail, 2, 'X')).toEqual({
    insertOffset: 8,
    selectionOffset: 9,
  });

  releaseDOMTextFlowIndex(host);
  expect(resolveDOMTextFlowPoint(host, 3)).toBeNull();
  expect(resolveDOMTextFlowOffset(host, styledTail, 1)).toBeNull();
});

test('maps lazy suffix shifts without rewriting trailing segment offsets', () => {
  const host = document.createElement('span');
  const first = document.createTextNode('aXb');
  const second = document.createTextNode('cd');
  const third = document.createTextNode('ef');
  const record = {
    nodeKey: 'text',
    path: [0, 0],
    segments: [
      {
        bindingHost: null,
        bindingRecord: null,
        domLength: 3,
        end: 3,
        start: 0,
        stringElement: null,
        text: 'aXb',
        textNode: first,
      },
      {
        bindingHost: null,
        bindingRecord: null,
        domLength: 2,
        end: 4,
        start: 2,
        stringElement: null,
        text: 'cd',
        textNode: second,
      },
      {
        bindingHost: null,
        bindingRecord: null,
        domLength: 2,
        end: 6,
        start: 4,
        stringElement: null,
        text: 'ef',
        textNode: third,
      },
    ],
    shiftAfterSegment: 0,
    shiftDelta: 1,
    text: 'aXbcdef',
  };

  host.append(first, second, third);
  setDOMTextFlowRecordIndex(host, record);

  expect(resolveDOMTextFlowPoint(host, 4, 'text')).toEqual({
    node: second,
    offset: 1,
  });
  expect(resolveDOMTextFlowOffset(host, second, 1)).toBe(4);

  second.nodeValue = 'cYd';
  expect(resolveDOMTextFlowInsertTarget(host, second, 2, 'Y')).toEqual({
    insertOffset: 4,
    selectionOffset: 5,
  });

  releaseDOMTextFlowRecordIndex(host, 'text');
  expect(resolveDOMTextFlowOffset(host, second, 1)).toBeNull();
});

test('releases replaced segments when the same record receives a new segment array', () => {
  const host = document.createElement('span');
  const oldText = document.createTextNode('old');
  const nextText = document.createTextNode('next');
  const segment = (textNode: Text) => ({
    bindingHost: null,
    bindingRecord: null,
    domLength: textNode.length,
    end: textNode.length,
    start: 0,
    stringElement: null,
    textNode,
  });
  const record = {
    nodeKey: 'text',
    path: [0, 0],
    segments: [segment(oldText)],
  };

  host.append(oldText);
  setDOMTextFlowRecordIndex(host, record);
  record.segments = [segment(nextText)];
  host.replaceChildren(nextText);
  setDOMTextFlowRecordIndex(host, record);

  expect(resolveDOMTextFlowOffset(host, oldText, 1)).toBeNull();
  expect(resolveDOMTextFlowOffset(host, nextText, 1)).toBe(1);
  releaseDOMTextFlowIndex(host);
  expect(resolveDOMTextFlowOffset(host, nextText, 1)).toBeNull();
});

test('releases the previously bound text node when a retained segment adopts browser text', () => {
  const host = document.createElement('span');

  host.setAttribute('data-plite-string', 'true');
  const oldText = document.createTextNode('text');
  const nextText = document.createTextNode('text');
  const segment = {
    bindingHost: null,
    bindingRecord: null,
    domLength: 4,
    end: 4,
    start: 0,
    stringElement: host,
    textNode: oldText,
  };
  const record = {
    bindingDirtyFrom: undefined as number | undefined,
    nodeKey: 'text',
    path: [0, 0],
    segments: [segment],
  };

  host.append(oldText);
  setDOMTextFlowRecordIndex(host, record);
  segment.textNode = nextText;
  record.bindingDirtyFrom = 0;
  host.replaceChildren(nextText);
  setDOMTextFlowRecordIndex(host, record);
  expect(resolveDOMTextFlowOffset(host, oldText, 1)).toBeNull();
  expect(resolveDOMTextFlowOffset(host, nextText, 1)).toBe(1);
  releaseDOMTextFlowIndex(host);
  expect(resolveDOMTextFlowOffset(host, nextText, 1)).toBeNull();
});
