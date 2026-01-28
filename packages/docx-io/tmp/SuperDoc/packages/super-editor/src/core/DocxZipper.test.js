import path from 'path';
import fs from 'fs';
import { describe, it, expect, beforeEach } from 'vitest';
import DocxZipper from './DocxZipper';

async function readFileAsBuffer(filePath) {
  const resolvedPath = path.resolve(__dirname, filePath);
  return new Promise((resolve, reject) => {
    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // Convert file content to a Buffer
        const buffer = Buffer.from(data);
        resolve(buffer);
      }
    });
  });
}

describe('DocxZipper - file extraction', () => {
  let zipper;
  beforeEach(() => {
    zipper = new DocxZipper();
  });

  it('It can unzip a docx', async () => {
    const fileContent = await readFileAsBuffer('../tests/data/Hello docx world.docx');
    const fileObject = Buffer.from(fileContent);
    const unzippedXml = await zipper.unzip(fileObject);
    expect(unzippedXml).toHaveProperty('files');
  });

  it('It can extract xml files', async () => {
    const fileContent = await readFileAsBuffer('../tests/data/Hello docx world.docx');
    const fileObject = Buffer.from(fileContent);
    const unzippedXml = await zipper.getDocxData(fileObject);
    expect(unzippedXml).toBeInstanceOf(Array);

    unzippedXml.forEach((file) => {
      expect(file).toHaveProperty('name');
      expect(file).toHaveProperty('content');
      expect(file.content).toMatch(/<\?xml/);
    });

    // Make sure we have document.xml
    const documentXml = unzippedXml.find((file) => file.name === 'word/document.xml');
    expect(documentXml).toBeTruthy();
  });
});
