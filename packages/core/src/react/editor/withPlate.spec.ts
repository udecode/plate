import { createPlateEditor } from './withPlate';

describe('createPlateEditor', () => {
  it('performance', () => {
    const warmupRuns = 500;
    const testRuns = 5000;
    const times: number[] = [];

    // Warm-up
    for (let i = 0; i < warmupRuns; i++) {
      createPlateEditor();
    }

    // Test runs
    for (let i = 0; i < testRuns; i++) {
      const start = performance.now();
      createPlateEditor();
      const end = performance.now();
      times.push(end - start);
    }

    const average = times.reduce((a, b) => a + b) / times.length;
    const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
    const p95 = times[Math.floor(times.length * 0.95)];

    console.info(`Average: ${average.toFixed(3)}ms`);
    console.info(`Median: ${median.toFixed(3)}ms`);
    console.info(`95th percentile: ${p95.toFixed(3)}ms`);

    expect(average).toBeLessThan(0.5); // Adjust threshold as needed
    expect(p95).toBeLessThan(1); // Adjust threshold as needed
  });
});
