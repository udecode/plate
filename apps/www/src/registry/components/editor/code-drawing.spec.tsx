import { afterAll, beforeEach, expect, it, mock, spyOn } from 'bun:test';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

const renderDiagram = mock(async () => 'data:image/svg+xml;base64,PHN2Zy8+');
let selected = true;
let readOnly = false;
const element = {
  type: 'codeDrawing',
  code: 'graph TD; A-->B',
  language: 'mermaid',
  view: 'preview',
  children: [{ text: '' }],
};
mock.module('platejs/code-drawing', () => ({
  CODE_DRAWING_LANGUAGES: ['flowchart', 'graphviz', 'mermaid', 'plantuml'],
  CODE_DRAWING_VIEWS: ['code', 'preview', 'split'],
  renderCodeDrawing: renderDiagram,
}));
mock.module('platejs/code-drawing/react', () => ({
  CodeDrawingPlugin: { configure: () => ({}) },
}));
mock.module('platejs/react', () => ({
  PlateElement: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  useEditor: () => ({}),
  useEditorReadOnly: () => readOnly,
  useEditorSelector: () => true,
  useElement: () => element,
  useElementSelected: () => selected,
  useFocusedLast: () => true,
}));
mock.module('@/registry/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));
mock.module('@/registry/components/editor/floating-popover', () => ({
  FloatingPopover: ({ children }: React.PropsWithChildren) => <>{children}</>,
  FloatingPopoverAnchor: ({
    element: anchor,
  }: {
    element: React.ReactNode;
  }) => <>{anchor}</>,
  FloatingPopoverContent: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));
beforeEach(() => {
  cleanup();
  renderDiagram.mockClear();
  renderDiagram.mockImplementation(
    async () => 'data:image/svg+xml;base64,PHN2Zy8+'
  );
  selected = true;
  readOnly = false;
  Object.assign(element, {
    code: 'graph TD; A-->B',
    language: 'mermaid',
    view: 'preview',
  });
});
afterAll(() => mock.restore());

it('uses the selected rendering server and downloads PNG through its own document', async () => {
  const { CodeDrawingElement } = await import('./code-drawing');
  const props = {
    element,
    attributes: {},
    children: null,
  } as unknown as React.ComponentProps<typeof CodeDrawingElement>;
  const view = render(
    <CodeDrawingElement
      {...props}
      plantUmlServer="https://diagrams.example.test/plantuml"
    />
  );
  const button = await view.findByTitle('Export');
  expect(renderDiagram).toHaveBeenCalledWith('mermaid', element.code, {
    plantUmlServer: 'https://diagrams.example.test/plantuml',
  });
  const { ownerDocument } = button;
  const image = ownerDocument.createElement('img');
  const canvas = ownerDocument.createElement('canvas');
  const link = ownerDocument.createElement('a');
  const drawImage = mock();
  const draw = spyOn(canvas, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  const encode = spyOn(canvas, 'toDataURL').mockReturnValue(
    'data:image/png;base64,downloaded'
  );
  const click = spyOn(link, 'click').mockImplementation(() => {});
  Object.defineProperties(image, {
    naturalWidth: { value: 320 },
    naturalHeight: { value: 240 },
  });
  const originalCreate = ownerDocument.createElement.bind(ownerDocument);
  const create = spyOn(ownerDocument, 'createElement').mockImplementation(
    (tag: string, options?: ElementCreationOptions) => {
      if (tag === 'img') return image;
      if (tag === 'canvas') return canvas;
      if (tag === 'a') return link;
      return originalCreate(tag, options);
    }
  );
  try {
    fireEvent.click(button);
    fireEvent.load(image);
    fireEvent.load(image);
    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(240);
    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(encode).toHaveBeenCalledWith('image/png');
    expect(link.download).toBe('code-drawing.png');
    expect(link.href).toBe('data:image/png;base64,downloaded');
    expect(click).toHaveBeenCalledTimes(1);
  } finally {
    create.mockRestore();
    draw.mockRestore();
    encode.mockRestore();
    click.mockRestore();
    view.unmount();
  }
});

const mount = async (initialServer = 'https://server.example.test') => {
  let server = initialServer;
  const { CodeDrawingElement } = await import('./code-drawing');
  const props = {
    element,
    attributes: {},
    children: null,
  } as unknown as React.ComponentProps<typeof CodeDrawingElement>;
  const node = () => <CodeDrawingElement {...props} plantUmlServer={server} />;
  const view = render(node());
  return {
    ...view,
    update: () => view.rerender(node()),
    server: (next: string) => {
      server = next;
      view.rerender(node());
    },
  };
};
const timers = () => {
  const pending = new Map<number, { run: () => void; delay: number }>();
  let id = 0;
  const start = spyOn(window, 'setTimeout').mockImplementation(((
    run: () => void,
    delay: number
  ) => {
    id += 1;
    pending.set(id, { run, delay });
    return id;
  }) as typeof window.setTimeout);
  const stop = spyOn(window, 'clearTimeout').mockImplementation((timerId) => {
    pending.delete(Number(timerId));
  });
  return {
    pending,
    async run() {
      const all = [...pending.values()];
      pending.clear();
      await act(async () => {
        for (const timer of all) timer.run();
        await Promise.resolve();
      });
    },
    restore() {
      start.mockRestore();
      stop.mockRestore();
    },
  };
};
it('does no work for inactive code, then renders the latest input once on demand and reuses it', async () => {
  const clock = timers();
  selected = false;
  element.view = 'code';
  const view = await mount();
  try {
    element.code = 'latest';
    view.update();
    expect(clock.pending.size).toBe(0);
    expect(renderDiagram).toHaveBeenCalledTimes(0);
    element.view = 'preview';
    view.update();
    expect([...clock.pending.values()].map((t) => t.delay)).toEqual([0]);
    await clock.run();
    expect(renderDiagram).toHaveBeenCalledTimes(1);
    expect(renderDiagram).toHaveBeenLastCalledWith('mermaid', 'latest', {
      plantUmlServer: 'https://server.example.test',
    });
    element.view = 'code';
    view.update();
    selected = true;
    view.update();
    expect(clock.pending.size).toBe(0);
    expect(renderDiagram).toHaveBeenCalledTimes(1);
    expect(view.getByTitle('Export')).toBeTruthy();
    element.code = 'newest';
    view.update();
    expect(view.queryByTitle('Export')).toBeNull();
    expect([...clock.pending.values()].map((t) => t.delay)).toEqual([500]);
    await clock.run();
    expect(renderDiagram).toHaveBeenCalledTimes(2);
    expect(view.getByTitle('Export')).toBeTruthy();
  } finally {
    view.unmount();
    clock.restore();
  }
});
it.each(['flowchart', 'graphviz', 'mermaid', 'plantuml'])(
  'drops stale and unmounted %s completions',
  async (language) => {
    const clock = timers();
    element.language = language;
    const pending: Array<(value: string) => void> = [];
    renderDiagram.mockImplementation(
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        })
    );
    const view = await mount();
    try {
      await clock.run();
      expect(pending.length).toBe(1);
      element.code = 'latest';
      view.update();
      await clock.run();
      expect(pending.length).toBe(2);
      await act(async () => pending[1]('data:image/svg+xml;base64,bmV3'));
      expect(view.container.querySelector('img')?.src).toBe(
        'data:image/svg+xml;base64,bmV3'
      );
      await act(async () => pending[0]('data:image/svg+xml;base64,b2xk'));
      expect(view.container.querySelector('img')?.src).toBe(
        'data:image/svg+xml;base64,bmV3'
      );
      element.code = 'unmounted';
      view.update();
      await clock.run();
      view.unmount();
      await act(async () =>
        pending[2]('data:image/svg+xml;base64,dW5tb3VudGVk')
      );
      expect(clock.pending.size).toBe(0);
      expect(view.container.childElementCount).toBe(0);
    } finally {
      view.unmount();
      clock.restore();
    }
  }
);
it('cancels scheduled work on inactive code or unmount and changes server before export', async () => {
  const clock = timers();
  const view = await mount();
  try {
    element.view = 'code';
    selected = false;
    view.update();
    expect(clock.pending.size).toBe(0);
    await clock.run();
    expect(renderDiagram).toHaveBeenCalledTimes(0);
    selected = true;
    view.update();
    await clock.run();
    expect(view.getByTitle('Export')).toBeTruthy();
    view.server('https://other.example.test');
    expect(view.queryByTitle('Export')).toBeNull();
    await clock.run();
    expect(renderDiagram).toHaveBeenLastCalledWith('mermaid', element.code, {
      plantUmlServer: 'https://other.example.test',
    });
    element.code = 'cancel';
    view.update();
    view.unmount();
    expect(clock.pending.size).toBe(0);
    expect(renderDiagram).toHaveBeenCalledTimes(2);
  } finally {
    view.unmount();
    clock.restore();
  }
});
it('settles read-only preview errors and skips blank input', async () => {
  const clock = timers();
  readOnly = true;
  element.code = '  ';
  const log = spyOn(console, 'error').mockImplementation(() => {});
  const view = await mount();
  try {
    expect(clock.pending.size).toBe(0);
    renderDiagram.mockImplementation(async () => {
      throw new Error('Invalid diagram');
    });
    element.code = 'invalid';
    view.update();
    await clock.run();
    expect(view.getByTitle('Invalid diagram')).toBeTruthy();
    expect(view.queryByTitle('Export')).toBeNull();
    expect(clock.pending.size).toBe(0);
  } finally {
    view.unmount();
    clock.restore();
    log.mockRestore();
  }
});
