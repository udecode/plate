import React from 'react';
import { HeadingToolbar } from '@udecode/slate-plugins-toolbar';
import { SlatePlugins } from '../../../../packages/core/src/components/SlatePlugins';
import {
  initialValueImages,
  initialValuePlainText,
} from '../../../../stories/config/initialValues';
import { ToolbarButtonsBasicElements } from '../../../../stories/config/Toolbars';
import { pluginsImage } from './index';

const A = () => {
  const MultipleEditor = ({ id, initialValue, plugins }) => (
    <div className="flex-1 border border-gray-200 rounded-md m-2 p-4">
      <SlatePlugins
        id={id}
        plugins={plugins}
        components={components}
        options={options}
        initialValue={initialValue}
      />
    </div>
  );

  return (
    <div>
      <HeadingToolbar>
        <ToolbarButtonsBasicElements />
      </HeadingToolbar>

      <div className="flex">
        <MultipleEditor
          plugins={pluginsBasic}
          initialValue={initialValueBasic}
        />
        <MultipleEditor
          id="image"
          plugins={pluginsImage}
          initialValue={initialValueImages}
        />
        <MultipleEditor
          id="core"
          plugins={pluginsCore}
          initialValue={initialValuePlainText}
        />
      </div>
    </div>
  );
};
