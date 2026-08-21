import { DocumentIndex } from '../../../../packages/plite/src/core/change/document-index';
import { moveNodeChange } from '../../../../packages/plite/src/core/change/root-change';

const blockCount = 1000;
const operationCount = 32;
const nodes = Object.freeze(
  Array.from({ length: blockCount }, (_, index) =>
    Object.freeze({
      children: Object.freeze([Object.freeze({ text: `block-${index}` })]),
      type: 'paragraph',
    })
  )
);

const measure = (run: () => void) => {
  run();
  const samples = Array.from({ length: 11 }, () => {
    const start = performance.now();

    run();
    return performance.now() - start;
  }).sort((left, right) => left - right);

  return {
    median: samples[5],
    p95: samples[10],
    samples,
  };
};

const direct = measure(() => {
  let document = DocumentIndex.fromValue(nodes);

  for (let index = operationCount - 1; index >= 0; index--) {
    document = document.withMovedNode([index], [blockCount - 2]);
  }
});

const arrayOnly = measure(() => {
  let value = [...nodes];

  for (let index = operationCount - 1; index >= 0; index--) {
    const [node] = value.splice(index, 1);

    value.splice(blockCount - 2, 0, node!);
  }
});

const encodedChange = measure(() => {
  let document = DocumentIndex.fromValue(nodes);

  for (let index = operationCount - 1; index >= 0; index--) {
    document = moveNodeChange(document, [index], [blockCount - 1]).apply(
      document
    );
  }
});

console.log(JSON.stringify({ arrayOnly, direct, encodedChange }, null, 2));
