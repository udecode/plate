import { createPlateEditor } from './withPlate';

describe('createPlateEditor', () => {
  it.only('benchmark', () => {
    const minDuration = 10000;
    const batchSize = 1000;
    const start = performance.now();
    const minEnd = start + minDuration;
    let iterations = 0;
    while (performance.now() < minEnd) {
      for (let i = 0; i < batchSize; i++) {
        createPlateEditor();
      }
      iterations += batchSize;
    }
    const end = performance.now();
    const average = (end - start) / iterations;
    console.log(average);
  });

  it('logs resolvePlugin', () => {
    createPlateEditor({ id: 2 });
  });
});
