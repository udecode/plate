/**
 * Tests for Image Properties (Phase 4.4)
 *
 * Tests advanced image formatting properties including:
 * - Effect extent (shadows, glows)
 * - Text wrapping
 * - Positioning (floating images)
 * - Anchor configuration
 * - Cropping
 * - Visual effects
 */

import { Document } from '../../src/core/Document';
import { Image } from '../../src/elements/Image';
import { ImageRun } from '../../src/elements/ImageRun';
import { Table } from '../../src/elements/Table';
import { promises as fs } from 'fs';
import { join } from 'path';

// Test image path
const TEST_IMAGE_PATH = join(__dirname, '..', 'fixtures', 'test-image.png');
const OUTPUT_DIR = join(__dirname, '..', 'output');

/**
 * Helper to create a test image buffer (1x1 PNG)
 */
function createTestImageBuffer(): Buffer {
  // 1x1 transparent PNG
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82,
  ]);
}

describe('Image Properties - Effect Extent', () => {
  it('should set and get effect extent for shadows', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    // Set effect extent for shadow
    image.setEffectExtent(25400, 25400, 25400, 25400); // 0.25 inches on all sides

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    // Save and reload
    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-effect-extent.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images.length).toBe(1);
    const extent = images[0]?.image.getEffectExtent();
    expect(extent).toBeDefined();
    expect(extent!.left).toBe(25400);
    expect(extent!.top).toBe(25400);
    expect(extent!.right).toBe(25400);
    expect(extent!.bottom).toBe(25400);
  });

  it('should handle zero effect extent', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setEffectExtent(0, 0, 0, 0);

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    const extent = images[0]?.image.getEffectExtent();
    expect(extent).toBeDefined();
    expect(extent!.left).toBe(0);
  });
});

describe('Image Properties - Text Wrapping', () => {
  it('should set square wrap with both sides', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setWrap('square', 'bothSides', {
      top: 10000,
      bottom: 10000,
      left: 10000,
      right: 10000,
    });

    // Make it floating
    image.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });

    image.setPosition(
      { anchor: 'page', offset: 914400 },
      { anchor: 'page', offset: 914400 }
    );

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-wrap-square.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    const wrap = images[0]?.image.getWrap();
    expect(wrap).toBeDefined();
    expect(wrap!.type).toBe('square');
    expect(wrap!.side).toBe('bothSides');
    expect(wrap!.distanceTop).toBe(10000);
  });

  it('should set tight wrap with left side', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setWrap('tight', 'left');
    image.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });
    image.setPosition(
      { anchor: 'page', alignment: 'left' },
      { anchor: 'page', alignment: 'top' }
    );

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-wrap-tight.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    const wrap = images[0]?.image.getWrap();
    expect(wrap!.type).toBe('tight');
    expect(wrap!.side).toBe('left');
  });

  it('should set top and bottom wrap', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setWrap('topAndBottom');
    image.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });
    image.setPosition(
      { anchor: 'page', alignment: 'center' },
      { anchor: 'page', alignment: 'center' }
    );

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-wrap-topbottom.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images[0]?.image.getWrap()!.type).toBe('topAndBottom');
  });
});

describe('Image Properties - Positioning', () => {
  it('should set absolute positioning with offset', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 1828800, 1828800); // 2 inches

    image.setPosition(
      { anchor: 'page', offset: 1828800 }, // 2 inches from left
      { anchor: 'page', offset: 1828800 }  // 2 inches from top
    );

    image.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-position-absolute.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    const position = images[0]?.image.getPosition();
    expect(position).toBeDefined();
    expect(position!.horizontal.anchor).toBe('page');
    expect(position!.horizontal.offset).toBe(1828800);
    expect(position!.vertical.offset).toBe(1828800);
  });

  it('should set relative positioning with alignment', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setPosition(
      { anchor: 'margin', alignment: 'center' },
      { anchor: 'margin', alignment: 'center' }
    );

    image.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-position-relative.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    const position = images[0]?.image.getPosition();
    expect(position!.horizontal.alignment).toBe('center');
    expect(position!.vertical.alignment).toBe('center');
    expect(position!.horizontal.anchor).toBe('margin');
  });

  it('should anchor to column', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setPosition(
      { anchor: 'column', alignment: 'right' },
      { anchor: 'paragraph', alignment: 'top' }
    );

    image.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-position-column.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images[0]?.image.getPosition()!.horizontal.anchor).toBe('column');
    expect(images[0]?.image.getPosition()!.vertical.anchor).toBe('paragraph');
  });
});

describe('Image Properties - Anchor Configuration', () => {
  it('should set floating image behind text', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setAnchor({
      behindDoc: true,
      locked: false,
      layoutInCell: true,
      allowOverlap: true,
      relativeHeight: 251658240,
    });

    image.setPosition(
      { anchor: 'page', alignment: 'center' },
      { anchor: 'page', alignment: 'center' }
    );

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-anchor-behind.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    const anchor = images[0]?.image.getAnchor();
    expect(anchor).toBeDefined();
    expect(anchor!.behindDoc).toBe(true);
    expect(anchor!.allowOverlap).toBe(true);
  });

  it('should set locked floating image', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setAnchor({
      behindDoc: false,
      locked: true,
      layoutInCell: false,
      allowOverlap: false,
      relativeHeight: 500000000,
    });

    image.setPosition(
      { anchor: 'page', offset: 914400 },
      { anchor: 'page', offset: 914400 }
    );

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-anchor-locked.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images[0]?.image.getAnchor()!.locked).toBe(true);
    expect(images[0]?.image.getAnchor()!.layoutInCell).toBe(false);
  });
});

describe('Image Properties - Cropping', () => {
  it('should set image crop on all sides', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 1828800, 1828800);

    // Crop 10% from each side
    image.setCrop(10, 10, 10, 10);

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-crop.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    const crop = images[0]?.image.getCrop();
    expect(crop).toBeDefined();
    expect(crop!.left).toBe(10);
    expect(crop!.top).toBe(10);
    expect(crop!.right).toBe(10);
    expect(crop!.bottom).toBe(10);
  });

  it('should clamp crop values to 0-100', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    // Try to set invalid crop values
    image.setCrop(-10, 150, 50, 75);

    const crop = image.getCrop();
    expect(crop!.left).toBe(0);   // Clamped to 0
    expect(crop!.top).toBe(100);  // Clamped to 100
    expect(crop!.right).toBe(50);
    expect(crop!.bottom).toBe(75);
  });
});

describe('Image Properties - Visual Effects', () => {
  it('should set brightness and contrast', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setEffects({
      brightness: 25,
      contrast: -15,
    });

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-effects-brightness.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    const effects = images[0]?.image.getEffects();
    expect(effects).toBeDefined();
    expect(effects!.brightness).toBe(25);
    expect(effects!.contrast).toBe(-15);
  });

  it('should set grayscale effect', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setEffects({
      grayscale: true,
    });

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-effects-grayscale.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images[0]?.image.getEffects()!.grayscale).toBe(true);
  });
});

describe('Image Properties - Combined Properties', () => {
  it('should handle multiple properties together', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 1828800, 1828800);

    // Set all properties
    image.setEffectExtent(25400, 25400, 25400, 25400);
    image.setWrap('square', 'bothSides', { top: 10000, bottom: 10000, left: 10000, right: 10000 });
    image.setPosition(
      { anchor: 'page', offset: 914400 },
      { anchor: 'page', offset: 914400 }
    );
    image.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });
    image.setCrop(5, 5, 5, 5);
    image.setEffects({ brightness: 10, contrast: 5 });

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-combined.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images[0]?.image.getEffectExtent()).toBeDefined();
    expect(images[0]?.image.getWrap()).toBeDefined();
    expect(images[0]?.image.getPosition()).toBeDefined();
    expect(images[0]?.image.getAnchor()).toBeDefined();
    expect(images[0]?.image.getCrop()).toBeDefined();
    expect(images[0]?.image.getEffects()).toBeDefined();
  });

  it('should preserve all properties through multiple save/load cycles', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setEffectExtent(12700, 12700, 12700, 12700);
    image.setCrop(15, 15, 15, 15);

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    // First cycle
    const buffer1 = await doc.toBuffer();
    const doc2 = await Document.loadFromBuffer(buffer1);

    // Second cycle
    const buffer2 = await doc2.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-multicycle.docx'), buffer2);
    const doc3 = await Document.loadFromBuffer(buffer2);

    const images = doc3.getImages();
    expect(images[0]?.image.getEffectExtent()!.left).toBe(12700);
    expect(images[0]?.image.getCrop()!.left).toBe(15);
  });
});

describe('Image Properties - Inline vs Floating', () => {
  it('should correctly identify inline images', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    // No anchor or position = inline
    expect(image.isFloating()).toBe(false);

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    const doc2 = await Document.loadFromBuffer(buffer);

    expect(doc2.getImages()[0]?.image.isFloating()).toBe(false);
  });

  it('should correctly identify floating images', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });

    image.setPosition(
      { anchor: 'page', alignment: 'center' },
      { anchor: 'page', alignment: 'center' }
    );

    expect(image.isFloating()).toBe(true);

    // Add image to document (registers it with ImageManager)
    doc.addImage(image);

    const buffer = await doc.toBuffer();
    const doc2 = await Document.loadFromBuffer(buffer);

    expect(doc2.getImages()[0]?.image.isFloating()).toBe(true);
  });
});

describe('Image Properties - Rotation', () => {
  it('should preserve rotation through save/load cycle', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    // Set rotation to 90 degrees
    image.rotate(90);
    expect(image.getRotation()).toBe(90);

    // Add image to document
    doc.addImage(image);

    // Save and reload
    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-rotation.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images.length).toBe(1);
    expect(images[0]?.image.getRotation()).toBe(90);
  });

  it('should preserve 180 degree rotation', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.rotate(180);

    doc.addImage(image);

    const buffer = await doc.toBuffer();
    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images[0]?.image.getRotation()).toBe(180);
  });

  it('should preserve 270 degree rotation', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    image.rotate(270);

    doc.addImage(image);

    const buffer = await doc.toBuffer();
    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images[0]?.image.getRotation()).toBe(270);
  });

  it('should handle zero rotation (no attribute)', async () => {
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);

    // Don't set rotation - should remain 0
    expect(image.getRotation()).toBe(0);

    doc.addImage(image);

    const buffer = await doc.toBuffer();
    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images[0]?.image.getRotation()).toBe(0);
  });
});

describe('Image Properties - Edge Cases', () => {
  it('should handle images with fractional rotation', async () => {
    // Test that fractional rotation values (e.g., 45 degrees) work correctly
    const doc = Document.create();
    const image = await Image.fromBuffer(createTestImageBuffer(), 'png', 457200, 457200);

    // Set a non-90-degree rotation
    image.rotate(45);
    expect(image.getRotation()).toBe(45);

    doc.addImage(image);

    // Save and reload
    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-image-rotation-45.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    // Rotation should be preserved
    expect(images.length).toBe(1);
    expect(images[0]?.image.getRotation()).toBe(45);
  });

  it('should handle multiple images with different properties', async () => {
    const doc = Document.create();

    // Image 1: inline with effect extent
    const image1 = await Image.fromBuffer(createTestImageBuffer(), 'png', 914400, 914400);
    image1.setEffectExtent(25400, 25400, 25400, 25400);
    doc.addImage(image1);

    // Image 2: rotated
    const image2 = await Image.fromBuffer(createTestImageBuffer(), 'png', 457200, 457200);
    image2.rotate(45);
    doc.addImage(image2);

    // Image 3: floating with wrap
    const image3 = await Image.fromBuffer(createTestImageBuffer(), 'png', 685800, 685800);
    image3.setWrap('square', 'bothSides');
    image3.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    });
    image3.setPosition(
      { anchor: 'page', offset: 914400 },
      { anchor: 'page', offset: 914400 }
    );
    doc.addImage(image3);

    // Save and reload
    const buffer = await doc.toBuffer();
    await fs.writeFile(join(OUTPUT_DIR, 'test-multiple-images.docx'), buffer);

    const doc2 = await Document.loadFromBuffer(buffer);
    const images = doc2.getImages();

    expect(images.length).toBe(3);

    // Verify image 1 effect extent
    const extent1 = images[0]?.image.getEffectExtent();
    expect(extent1?.left).toBe(25400);

    // Verify image 2 rotation
    expect(images[1]?.image.getRotation()).toBe(45);

    // Verify image 3 wrap
    const wrap3 = images[2]?.image.getWrap();
    expect(wrap3?.type).toBe('square');
  });
});
