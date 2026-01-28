import { getExtensionConfigField } from './helpers/getExtensionConfigField.js';
import { callOrGet } from './utilities/callOrGet.js';

/**
 * Mark class is used to create Mark extensions.
 */
export class Mark {
  type = 'mark';

  name = 'mark';

  options;

  storage;

  isExternal;

  config = {
    name: this.name,
  };

  constructor(config) {
    this.config = {
      ...this.config,
      ...config,
    };

    this.name = this.config.name;

    this.isExternal = Boolean(this.config.isExternal);

    if (this.config.addOptions) {
      this.options = callOrGet(
        getExtensionConfigField(this, 'addOptions', {
          name: this.name,
        }),
      );
    }

    this.storage =
      callOrGet(
        getExtensionConfigField(this, 'addStorage', {
          name: this.name,
          options: this.options,
        }),
      ) || {};
  }

  /**
   * Static method for creating Mark extension.
   * @param args Arguments for the constructor.
   */
  static create(...args) {
    return new Mark(...args);
  }
}
