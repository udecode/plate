import type { CodeDrawingLanguage } from './BaseCodeDrawingPlugin';

const mermaidInitialize = mock();
const mermaidRender = mock(async (id: string, content: string) => ({
  svg: `<svg data-id="${id}">${content}</svg>`,
}));
const plantUmlEncode = mock((content: string) => `encoded:${content}`);
const flowchartDrawSVG = mock((el: HTMLElement) => {
  el.innerHTML = '<svg>flowchart</svg>';
});
const flowchartParse = mock(() => ({
  drawSVG: flowchartDrawSVG,
}));
const graphvizRenderString = mock(
  async (_content: string, _options: unknown) => '<svg>graphviz</svg>'
);
const originalConsoleError = console.error;
const consoleErrorMock = mock(() => {});

console.error = consoleErrorMock as typeof console.error;

class VizMock {
  options: unknown;

  constructor(options: unknown) {
    this.options = options;
  }

  renderString = graphvizRenderString;
}

void mock.module('mermaid', () => ({
  default: {
    initialize: mermaidInitialize,
    render: mermaidRender,
  },
}));

void mock.module('plantuml-encoder', () => ({
  default: {
    encode: plantUmlEncode,
  },
}));

void mock.module('flowchart.js', () => ({
  default: {
    parse: flowchartParse,
  },
}));

void mock.module('viz.js', () => ({
  default: VizMock,
}));

void mock.module('viz.js/full.render', () => ({
  Module: 'module-stub',
  render: 'render-stub',
}));

const originalFetch = globalThis.fetch;
const fetchMock = mock(
  async (_input: RequestInfo | URL, _init?: RequestInit) =>
    new Response('<svg>plantuml</svg>')
);

globalThis.fetch = fetchMock as unknown as typeof fetch;

const { renderCodeDrawing } = await import('./renderers');

describe('renderPlantUml', () => {
  afterEach(() => {
    plantUmlEncode.mockClear();
    fetchMock.mockClear();
    flowchartDrawSVG.mockClear();
    flowchartParse.mockClear();
    graphvizRenderString.mockClear();
    mermaidRender.mockClear();
    consoleErrorMock.mockClear();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    mock.restore();
  });

  it('encodes the diagram, fetches the svg, and returns a data url', async () => {
    const result = await renderCodeDrawing(
      'plantuml',
      '@startuml\nAlice -> Bob\n@enduml'
    );

    expect(plantUmlEncode).toHaveBeenCalledWith(
      '@startuml\nAlice -> Bob\n@enduml'
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.plantuml.com/plantuml/svg/encoded:@startuml\nAlice -> Bob\n@enduml'
    );
    expect(result).toStartWith('data:image/svg+xml;base64,');
  });

  it('throws when the plantuml svg fetch fails', async () => {
    const failingFetch = mock(async () => new Response('', { status: 500 }));

    globalThis.fetch = failingFetch as unknown as typeof fetch;

    try {
      await expect(
        renderCodeDrawing('plantuml', '@startuml\nA\n@enduml')
      ).rejects.toThrow('Failed to fetch PlantUml SVG');
      expect(consoleErrorMock).toHaveBeenCalled();
    } finally {
      globalThis.fetch = fetchMock as unknown as typeof fetch;
    }
  });
});

describe('renderMermaid', () => {
  beforeEach(() => {
    mermaidInitialize.mockClear();
    mermaidRender.mockClear();
  });

  it('initializes mermaid once and returns data urls for repeated renders', async () => {
    const first = await renderCodeDrawing('mermaid', 'graph TD; A-->B');
    const second = await renderCodeDrawing('mermaid', 'graph TD; B-->C');

    expect(mermaidInitialize).toHaveBeenCalledTimes(1);
    expect(mermaidInitialize).toHaveBeenCalledWith({ startOnLoad: false });
    expect(mermaidRender).toHaveBeenCalledTimes(2);
    expect(mermaidRender.mock.calls[0]?.[0]).toMatch(/^mermaid-[a-z]{6}$/);
    expect(mermaidRender.mock.calls[1]?.[0]).toMatch(/^mermaid-[a-z]{6}$/);
    expect(first).toStartWith('data:image/svg+xml;base64,');
    expect(second).toStartWith('data:image/svg+xml;base64,');
  });
});

describe('renderCodeDrawing', () => {
  it('returns an empty string for blank content', async () => {
    await expect(renderCodeDrawing('mermaid', '   ')).resolves.toBe('');
  });

  it('throws for unsupported drawing types', async () => {
    await expect(
      renderCodeDrawing('Nope' as CodeDrawingLanguage, 'content')
    ).rejects.toThrow('Unsupported drawing language: Nope');
  });

  it('renders graphviz through the extensionless full.render fallback', async () => {
    const result = await renderCodeDrawing('graphviz', 'digraph { a -> b }');

    expect(graphvizRenderString).toHaveBeenCalledWith('digraph { a -> b }', {
      engine: 'dot',
      format: 'svg',
    });
    expect(result).toStartWith('data:image/svg+xml;base64,');
  });

  it('renders flowcharts with a temporary dom node and cleans it up', async () => {
    const before = document.body.childElementCount;
    const result = await renderCodeDrawing('flowchart', 'st=>start: Start');

    expect(flowchartParse).toHaveBeenCalledWith('st=>start: Start');
    expect(flowchartDrawSVG).toHaveBeenCalled();
    expect(document.body.childElementCount).toBe(before);
    expect(result).toStartWith('data:image/svg+xml;base64,');
  });

  it('dispatches graphviz and flowchart rendering by drawing type', async () => {
    await expect(
      renderCodeDrawing('graphviz', 'digraph { a -> b }')
    ).resolves.toStartWith('data:image/svg+xml;base64,');
    await expect(
      renderCodeDrawing('flowchart', 'st=>start: Start')
    ).resolves.toStartWith('data:image/svg+xml;base64,');
  });
});
