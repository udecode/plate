// @ts-check
import { createImageNodeValidator } from './nodes/image/image-validator.js';
import { createLinkMarkValidator } from './nodes/link/link-validator.js';

/**
 * @typedef {Object} StateValidators
 * @property {import('../../types.js').StateValidator} imageNodeValidator - Validator for image nodes.
 * @property {import('../../types.js').StateValidator} linkMarkValidator - Validator for link marks.
 */
export const StateValidators = {
  imageNodeValidator: createImageNodeValidator,
  linkMarkValidator: createLinkMarkValidator,
};
