import {
  dom,
  type DataTransferReport,
  type DOMPlugin,
} from '../../../dom/plite-dom.internal';
import type { Editor } from '../../editor';

const DATA_TRANSFER_REPORT_HANDLERS = new WeakMap<
  object,
  (report: DataTransferReport) => void
>();

export const setPlateDataTransferReportHandler = (
  editor: Editor,
  handler: ((report: DataTransferReport) => void) | undefined
) => {
  if (handler) DATA_TRANSFER_REPORT_HANDLERS.set(editor, handler);
  else DATA_TRANSFER_REPORT_HANDLERS.delete(editor);
};

/** One exact DOM descriptor shared by Base and React capability lookup. */
export const plateDOMPlugin: DOMPlugin = dom({
  onDataTransferReport: (report, editor) => {
    DATA_TRANSFER_REPORT_HANDLERS.get(editor)?.(report);
  },
});
