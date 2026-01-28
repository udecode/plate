import JSZip from 'jszip';

/**
 * Take a list of blobs and file names and create a zip file
 * @param {Array[Blob]} blobs List of blobs to zip
 * @param {Array[string]} fileNames List of file names to zip
 * @returns {Promise<Blob>} The zipped file
 */
export async function createZip(blobs, fileNames) {
  const zip = new JSZip();

  blobs.forEach((blob, index) => {
    zip.file(fileNames[index], blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}
