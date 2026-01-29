/**
 * ImageRun - A run that contains an image (drawing)
 * Extends Run class for type-safe paragraph content
 *
 * This is a specialized Run that contains a drawing instead of text.
 * It generates proper w:r (run) XML with w:drawing child element.
 */

import { Run } from './Run';
import { Image } from './Image';
import { XMLElement } from '../xml/XMLBuilder';

/**
 * ImageRun - A run containing an embedded image
 *
 * In WordprocessingML, images are embedded in runs as drawing elements:
 * <w:r>
 *   <w:drawing>
 *     <wp:inline>
 *       ... image data ...
 *     </wp:inline>
 *   </w:drawing>
 * </w:r>
 */
export class ImageRun extends Run {
  private imageElement: Image;

  /**
   * Creates a new image run
   * @param image The image to embed in this run
   */
  constructor(image: Image) {
    // Call parent constructor with empty text
    // The text is irrelevant for image runs
    super('');
    this.imageElement = image;
  }

  /**
   * Gets the image element
   * @returns Image instance
   */
  getImageElement(): Image {
    return this.imageElement;
  }

  /**
   * Override toXML to generate image-specific XML
   * Generates a w:r element containing w:drawing instead of w:t
   * @returns XMLElement with w:r containing w:drawing
   */
  toXML(): XMLElement {
    const drawing = this.imageElement.toXML();
    return {
      name: 'w:r',
      children: [drawing]
    };
  }
}
