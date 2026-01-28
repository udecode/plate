// NodeJS polyfill for File class (use if node version < 22.0.0)
class File {
    constructor(fileParts, fileName, options) {
      this.fileParts = fileParts;
      this.fileName = fileName;
      this.options = options || {};
      this.size = this.fileParts.reduce((total, part) => total + part.length, 0);
      this.type = this.options.type || '';
    }
  }
  
  global.File = File;