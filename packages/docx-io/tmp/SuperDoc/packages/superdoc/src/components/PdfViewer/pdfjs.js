import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer';
import workerSrc from './helpers/pdfjs-worker.js?raw';

pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
  new Blob([workerSrc], {
    type: 'application/javascript',
  }),
);

export { pdfjsLib, pdfjsViewer };
