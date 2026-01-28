// app/grading/_doc-links.js
// import assign5 from '@/assets/docs/assign-5.docx?url';
// import assign2 from '@/assets/docs/assign-2.docx?url';
// import assign3 from '@/assets/docs/assign-3.docx?url';
// import assign4 from '@/assets/docs/assign-4.docx?url';
// import assign5 from '@/assets/docs/assign-5.docx?url';

import assign1B64 from '@/assets/docs/assign-1.js';
import assign2B64 from '@/assets/docs/assign-2.js';
import assign3B64 from '@/assets/docs/assign-3.js';
import assign4B64 from '@/assets/docs/assign-4.js';
import assign5B64 from '@/assets/docs/assign-5.js';

const base64ToDocx = (base64String, filename) => {
  try {
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const file = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      return file;
  } catch (error) {
      console.error('Error converting base64 to DOCX:', error);
  }
}

const assign1 = base64ToDocx(assign1B64, 'assign-1.docx');
const assign2 = base64ToDocx(assign2B64, 'assign-2.docx');
const assign3 = base64ToDocx(assign3B64, 'assign-3.docx');
const assign4 = base64ToDocx(assign4B64, 'assign-4.docx');
const assign5 = base64ToDocx(assign5B64, 'assign-5.docx');

export const docMap = {
  'assign-1': assign1,
  'assign-2': assign2,
  'assign-3': assign3,
  'assign-4': assign4,
  'assign-5': assign5,
};
