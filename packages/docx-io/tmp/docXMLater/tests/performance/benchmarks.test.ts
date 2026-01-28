/**
 * Performance Benchmark Tests
 *
 * These tests establish performance baselines to detect regressions.
 * Run with: npm test tests/performance
 */

import { Document } from '../../src/core/Document';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Performance Benchmarks', () => {
  const tempDir = tmpdir();
  const testFiles: string[] = [];

  afterAll(async () => {
    // Cleanup test files
    for (const file of testFiles) {
      try {
        await fs.unlink(file);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  /**
   * Benchmark: 100-page document creation
   * Expected: < 5 seconds
   */
  it('should create 100-page document in < 5 seconds', async () => {
    const filePath = join(tempDir, `benchmark-100p-${Date.now()}.docx`);
    testFiles.push(filePath);

    const start = Date.now();
    const doc = Document.create();

    // Generate 100 pages (approx 50 paragraphs per page)
    for (let page = 0; page < 100; page++) {
      for (let para = 0; para < 50; para++) {
        doc.createParagraph(`Page ${page + 1}, Paragraph ${para + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`);
      }
    }

    await doc.save(filePath);
    const duration = Date.now() - start;

    console.log(`  ⏱️  100-page document created in ${duration}ms`);

    // Verify file was created
    const stats = await fs.stat(filePath);
    expect(stats.size).toBeGreaterThan(10000); // At least 10KB

    // Performance assertion
    expect(duration).toBeLessThan(5000); // < 5 seconds
  }, 30000); // 30 second timeout

  /**
   * Benchmark: Document with 1000 paragraphs
   * Expected: < 2 seconds
   */
  it('should create document with 1000 paragraphs in < 2 seconds', async () => {
    const filePath = join(tempDir, `benchmark-1000p-${Date.now()}.docx`);
    testFiles.push(filePath);

    const start = Date.now();
    const doc = Document.create();

    // Create 1000 paragraphs
    for (let i = 0; i < 1000; i++) {
      doc.createParagraph(`Paragraph ${i + 1}: This is test content for performance benchmarking.`);
    }

    await doc.save(filePath);
    const duration = Date.now() - start;

    console.log(`  ⏱️  1000 paragraphs created in ${duration}ms`);

    expect(duration).toBeLessThan(2000); // < 2 seconds
  }, 5000);

  /**
   * Benchmark: Load and save existing document
   * Expected: < 1 second
   */
  it('should load and re-save document in < 1 second', async () => {
    // Create a test document first
    const originalPath = join(tempDir, `benchmark-load-${Date.now()}.docx`);
    const savedPath = join(tempDir, `benchmark-resave-${Date.now()}.docx`);
    testFiles.push(originalPath, savedPath);

    const doc1 = Document.create();
    for (let i = 0; i < 50; i++) {
      doc1.createParagraph(`Test paragraph ${i + 1}`);
    }
    await doc1.save(originalPath);

    // Benchmark load and save
    const start = Date.now();
    const doc2 = await Document.load(originalPath);
    await doc2.save(savedPath);
    const duration = Date.now() - start;

    console.log(`  ⏱️  Load and save completed in ${duration}ms`);

    expect(duration).toBeLessThan(1000); // < 1 second
  }, 5000);

  /**
   * Benchmark: Memory usage with large document
   * Expected: < 100MB memory growth
   */
  it('should handle 500 paragraphs without excessive memory growth', async () => {
    const filePath = join(tempDir, `benchmark-memory-${Date.now()}.docx`);
    testFiles.push(filePath);

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const initialMem = process.memoryUsage().heapUsed;

    const doc = Document.create();

    // Create 500 paragraphs with formatted text
    for (let i = 0; i < 500; i++) {
      const para = doc.createParagraph();
      para.addText(`Paragraph ${i + 1}: `, { bold: true });
      para.addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ', { italic: true });
      para.addText('Suspendisse varius enim in eros elementum tristique.', { color: '0000FF' });
    }

    await doc.save(filePath);

    const finalMem = process.memoryUsage().heapUsed;
    const memGrowth = finalMem - initialMem;
    const memGrowthMB = memGrowth / (1024 * 1024);

    console.log(`  💾 Memory growth: ${memGrowthMB.toFixed(2)}MB`);

    // Should use less than 100MB for this size document
    expect(memGrowth).toBeLessThan(100 * 1024 * 1024); // < 100MB
  }, 10000);

  /**
   * Benchmark: Formatted content performance
   * Expected: < 3 seconds
   */
  it('should create highly formatted document in < 3 seconds', async () => {
    const filePath = join(tempDir, `benchmark-formatted-${Date.now()}.docx`);
    testFiles.push(filePath);

    const start = Date.now();
    const doc = Document.create();

    // Create 200 paragraphs with mixed formatting
    for (let i = 0; i < 200; i++) {
      const para = doc.createParagraph();

      // Add various formatted runs
      para.addText('Bold ', { bold: true });
      para.addText('Italic ', { italic: true });
      para.addText('Underline ', { underline: true });
      para.addText('Red ', { color: 'FF0000' });
      para.addText('Large ', { size: 16 });
      para.addText('Small ', { size: 8 });
      para.addText('Highlighted', { highlight: 'yellow' });

      // Set paragraph formatting
      para.setAlignment(i % 2 === 0 ? 'left' : 'center');
      para.setSpaceBefore(120);
      para.setSpaceAfter(120);
    }

    await doc.save(filePath);
    const duration = Date.now() - start;

    console.log(`  ⏱️  Formatted document created in ${duration}ms`);

    expect(duration).toBeLessThan(3000); // < 3 seconds
  }, 5000);

  /**
   * Benchmark: Concurrent operations
   * Expected: Should complete without errors
   */
  it('should handle concurrent document creation', async () => {
    const start = Date.now();

    // Create 5 documents concurrently
    const promises = Array.from({ length: 5 }, async (_, index) => {
      const filePath = join(tempDir, `benchmark-concurrent-${Date.now()}-${index}.docx`);
      testFiles.push(filePath);

      const doc = Document.create();
      for (let i = 0; i < 100; i++) {
        doc.createParagraph(`Document ${index}, Paragraph ${i}`);
      }
      await doc.save(filePath);
    });

    await Promise.all(promises);
    const duration = Date.now() - start;

    console.log(`  ⏱️  5 concurrent documents created in ${duration}ms`);

    // Should complete in reasonable time
    expect(duration).toBeLessThan(5000); // < 5 seconds for all
  }, 10000);
});

describe('Performance Regression Detection', () => {
  /**
   * This test establishes a baseline for future performance monitoring
   * If this test fails, it indicates a performance regression
   */
  it('should meet performance SLA for typical document', async () => {
    const tempPath = join(tmpdir(), `benchmark-sla-${Date.now()}.docx`);

    try {
      const doc = Document.create({
        properties: {
          title: 'Performance Test Document',
          creator: 'DocXML Benchmark Suite',
        },
      });

      // Typical document: 20 pages, 1000 paragraphs
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        doc.createParagraph(`This is paragraph ${i + 1} with some test content.`);
      }

      await doc.save(tempPath);
      const duration = Date.now() - start;

      console.log(`\n  📊 Performance SLA Metrics:`);
      console.log(`     Document: 1000 paragraphs`);
      console.log(`     Duration: ${duration}ms`);
      console.log(`     Throughput: ${((1000 / duration) * 1000).toFixed(0)} paragraphs/sec\n`);

      // SLA: 1000 paragraphs should take < 2 seconds
      expect(duration).toBeLessThan(2000);
    } finally {
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }, 5000);
});
