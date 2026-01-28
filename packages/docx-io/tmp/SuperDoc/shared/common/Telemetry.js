/**
 * @typedef {Object} TelemetryConfig
 * @property {string} [licenseKey] - License key for telemetry service
 * @property {boolean} [enabled=true] - Whether telemetry is enabled
 * @property {string} endpoint - service endpoint
 * @property {string} superdocId - SuperDoc id
 * @property {string} superdocVersion - SuperDoc version
 */

import crc32 from 'buffer-crc32';

function randomBytes(length) {
  const array = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

class Telemetry {
  /** @type {boolean} */
  enabled;

  /** @type {string} */
  superdocId;

  /** @type {string} */
  superdocVersion;

  /** @type {string} */
  licenseKey;

  /** @type {string} */
  endpoint;

  /** @type {string} */
  sessionId;

  /** @type {Object} */
  statistics = {
    nodeTypes: {},
    markTypes: {},
    attributes: {},
    errorCount: 0,
  };

  /** @type {Array} */
  unknownElements = [];

  /** @type {Array} */
  errors = [];

  /** @type {Object} */
  fileStructure = {
    totalFiles: 0,
    maxDepth: 0,
    totalNodes: 0,
    files: [],
  };

  /** @type {Object} */
  documentInfo = null;

  /** @type {string} */
  static COMMUNITY_LICENSE_KEY = 'community-and-eval-agplv3';

  /** @type {string} */
  static DEFAULT_ENDPOINT = 'https://ingest.superdoc.dev/v1/collect';

  /**
   * Initialize telemetry service
   * @param {TelemetryConfig} config
   */
  constructor(config = {}) {
    this.enabled = config.enabled ?? true;

    this.licenseKey = config.licenseKey ?? Telemetry.COMMUNITY_LICENSE_KEY;
    this.endpoint = config.endpoint ?? Telemetry.DEFAULT_ENDPOINT;
    this.superdocId = config.superdocId;

    this.superdocVersion = config.superdocVersion;
    this.sessionId = this.generateId();
  }

  /**
   * Get browser environment information
   * @returns {Object} Browser information
   */
  getBrowserInfo() {
    return {
      userAgent: window.navigator.userAgent,
      currentUrl: window.location.href,
      hostname: window.location.hostname,
      referrerUrl: document.referrer,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
  }

  /**
   * Track document usage event
   * @param {string} name - Event name
   * @param {Object} properties - Additional properties
   */
  async trackUsage(name, properties = {}) {
    if (!this.enabled) return;

    const event = {
      id: this.generateId(),
      type: 'usage',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      superdocId: this.superdocId,
      superdocVersion: this.superdocVersion,
      file: this.documentInfo,
      browser: this.getBrowserInfo(),
      name,
      properties,
    };

    await this.sendDataToTelemetry(event);
  }

  /**
   * Track parsing statistics
   * @param {string} category - Statistic category
   * @param {string|Object} data - Statistic data
   */
  trackStatistic(category, data) {
    if (category === 'node') {
      this.statistics.nodeTypes[data.elementName] = (this.statistics.nodeTypes[data.elementName] || 0) + 1;
      this.fileStructure.totalNodes++;
    } else if (category === 'unknown') {
      const addedElement = this.unknownElements.find((e) => e.elementName === data.elementName);
      if (addedElement) {
        addedElement.count += 1;
        addedElement.attributes = {
          ...addedElement.attributes,
          ...data.attributes,
        };
      } else {
        this.unknownElements.push({
          ...data,
          count: 1,
        });
      }
    } else if (category === 'error') {
      this.errors.push(data);
      this.statistics.errorCount++;
    }

    if (data.marks?.length) {
      data.marks.forEach((mark) => {
        this.statistics.markTypes[mark.type] = (this.statistics.markTypes[mark.type] || 0) + 1;
      });
    }

    // Style attributes
    if (data.attributes && Object.keys(data.attributes).length) {
      const styleAttributes = [
        'textIndent',
        'textAlign',
        'spacing',
        'lineHeight',
        'indent',
        'list-style-type',
        'listLevel',
        'textStyle',
        'order',
        'lvlText',
        'lvlJc',
        'listNumberingType',
        'numId',
      ];
      Object.keys(data.attributes).forEach((attribute) => {
        if (!styleAttributes.includes(attribute)) return;
        this.statistics.attributes[attribute] = (this.statistics.attributes[attribute] || 0) + 1;
      });
    }
  }

  /**
   * Track file structure
   * @param {Object} structure - File structure information
   * @param {File} fileSource - original file
   * @param {String} documentId - document ID
   * @param {string} internalId - document ID form settings.xml
   */
  async trackFileStructure(structure, fileSource, documentId, internalId) {
    this.fileStructure = structure;
    this.documentInfo = await this.processDocument(fileSource, {
      id: documentId,
      internalId: internalId,
    });
  }

  /**
   * Process document metadata
   * @param {File} file - Document file
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Document metadata
   */
  async processDocument(file, options = {}) {
    if (!file) {
      console.warn('Telemetry: missing file source');
      return {};
    }

    let hash = '';
    try {
      hash = await this.generateCrc32Hash(file);
    } catch (error) {
      console.error('Failed to generate file hash:', error);
    }

    return {
      id: options.id,
      name: file.name,
      size: file.size,
      crc32: hash,
      lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      type: file.type || 'docx',
      internalId: options.internalId,
    };
  }

  /**
   * Generate CRC32 hash for a file
   * @param {File} file - File to hash
   * @returns {Promise<string>} CRC32 hash
   * @private
   */
  async generateCrc32Hash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hashBuffer = crc32(buffer);
    return hashBuffer.toString('hex');
  }

  isTelemetryDataChanged() {
    const initialStatistics = {
      nodeTypes: {},
      markTypes: {},
      styleTypes: {},
      unknownElements: [],
      errorCount: 0,
    };
    const initialFileStructure = {
      totalFiles: 0,
      maxDepth: 0,
      totalNodes: 0,
      files: [],
    };
    // Empty document case
    if (Object.keys(this.statistics.nodeTypes).length <= 1) return;

    return (
      this.statistics !== initialStatistics ||
      initialFileStructure !== this.fileStructure ||
      this.errors.length > 0 ||
      this.unknownElements.length > 0
    );
  }

  /**
   * Sends current report
   * @returns {Promise<void>}
   */
  async sendReport() {
    if (!this.enabled || !this.isTelemetryDataChanged()) return;

    const report = [
      {
        id: this.generateId(),
        type: 'parsing',
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        superdocId: this.superdocId,
        superdocVersion: this.superdocVersion,
        file: this.documentInfo,
        browser: this.getBrowserInfo(),
        statistics: this.statistics,
        fileStructure: this.fileStructure,
        unknownElements: this.unknownElements,
        errors: this.errors,
      },
    ];

    await this.sendDataToTelemetry(report);
  }

  /**
   * Sends data to the service
   * @returns {Object} payload
   * @returns {Promise<void>}
   */
  async sendDataToTelemetry(data) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-License-Key': this.licenseKey,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      } else {
        this.resetStatistics();
      }
    } catch (error) {
      console.error('Failed to upload telemetry:', error);
    }
  }

  /**
   * Generate unique identifier
   * @returns {string} Unique ID
   * @private
   */
  generateId() {
    const timestamp = Date.now();
    const random = randomBytes(4).toString('hex');
    return `${timestamp}-${random}`;
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.statistics = {
      nodeTypes: {},
      markTypes: {},
      styleTypes: {},
      unknownElements: [],
      errorCount: 0,
    };

    this.fileStructure = {
      totalFiles: 0,
      maxDepth: 0,
      totalNodes: 0,
      files: [],
    };

    this.unknownElements = [];

    this.errors = [];
  }
}

export { Telemetry };
