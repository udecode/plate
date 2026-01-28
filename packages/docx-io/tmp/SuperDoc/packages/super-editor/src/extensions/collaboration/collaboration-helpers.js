/**
 * Update the Ydoc document data with the latest Docx XML.
 *
 * @param {Editor} editor The editor instance
 * @returns {Promise<void>}
 */
export const updateYdocDocxData = async (editor, ydoc) => {
  ydoc = ydoc || editor.options.ydoc;
  if (!ydoc) return;

  const metaMap = ydoc.getMap('meta');
  const docx = [...metaMap.get('docx')];
  const newXml = await editor.exportDocx({ getUpdatedDocs: true });

  Object.keys(newXml).forEach((key) => {
    const fileIndex = docx.findIndex((item) => item.name === key);
    if (fileIndex > -1) {
      docx.splice(fileIndex, 1);
    }
    docx.push({
      name: key,
      content: newXml[key],
    });
  });

  ydoc.transact(
    () => {
      metaMap.set('docx', docx);
    },
    { event: 'docx-update', user: editor.options.user },
  );
};
