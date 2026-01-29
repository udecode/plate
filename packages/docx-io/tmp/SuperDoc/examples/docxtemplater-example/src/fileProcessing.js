import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { getFileObject } from '@harbour-enterprises/superdoc';

// extract js object from code editor string
export const getTemplateValueObjectFromCode = (codeString) => {
  // search for text between "doc.render( and )"
  const regex = /doc\.render\(\s*{([^}]*)}\s*\)/;
  const match = codeString.match(regex) || null;
  if (!match) return {};

  // find object in doc.render call
  let templateValueString = match.length > 1 ? match[1] : null;
  if (!templateValueString) return {};
  // remove render call
  const removeValues = ["doc.render(", ")", /\n/g, /\t/g, / /g];

  removeValues.forEach((value) => {
    templateValueString = templateValueString.replace(value, "");
  });

  templateValueString = templateValueString.trim();

  // convert string to object
  const templateValueObject = {};
  templateValueString.split(",").forEach((item) => {
    const [key, value] = item.split(":");
    if (!key || !value) return;
    templateValueObject[key] = value.replace(/"/g, "");
  });

  return templateValueObject;
};

// process template file with docxtemplater, get file blob
const getPopulatedTemplateFileBlob = async ({ file, name, templateValueObject }) => {
  if (!file || !templateValueObject) {
    console.error("getPopulatedTemplateFileBlob - Missing file or template values");
    console.error("getPopulatedTemplateFileBlob - file:", file);
    console.error("getPopulatedTemplateFileBlob - templateValueObject:", templateValueObject);
    return null;
  }

  const templateFileArrayBuffer = await file.arrayBuffer(); // docxtemplater needs arrayBuffer
  const zip = new PizZip(templateFileArrayBuffer);
  
  // handle missing template values
  const nullGetter = (part, scopeManager) => {
    if (!part.module) return "";
  }
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, nullGetter });
  // render template
  doc.render(templateValueObject);

  const blob = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });

  const outputFile = new File([blob], name, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  return outputFile;
};

// process template with docxtemplater and code string containing template values,
// get file blob.
export const getProcessedTemplateFromCode = async ({ codeString, templateFileBlob }) => {
  const templateValueObject = getTemplateValueObjectFromCode(codeString);
  const populatedTemplate = await getPopulatedTemplateFileBlob({
    file: templateFileBlob,
    name: "template.docx",
    templateValueObject: templateValueObject,
  });
  console.log('getProcessedTemplateFromCode - templateValueObject:', templateValueObject);
  console.log('getProcessedTemplateFromCode - populatedTemplate:', populatedTemplate);
  if (!populatedTemplate) return null;

  // superdoc needs url
  const url = URL.createObjectURL(populatedTemplate);
  const file = await getFileObject(url, "output.docx");

  return file;
};