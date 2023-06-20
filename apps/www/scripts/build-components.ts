import fs from 'node:fs';
import path, { basename, dirname } from 'node:path';
import { components } from '../src/config/components';

const payload = components
  .map((component) => {
    const files = component.files?.map((file) => {
      const content = fs.readFileSync(
        path.join(process.cwd(), 'src', file),
        'utf8'
      );

      return {
        name: basename(file),
        dir: dirname(file),
        content,
      };
    });

    return {
      ...component,
      files,
    };
  })
  .sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

fs.writeFileSync(
  path.join(process.cwd(), 'src/pages/api/components.json'),
  JSON.stringify(payload, null, 2)
);
