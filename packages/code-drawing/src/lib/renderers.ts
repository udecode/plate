import type { CodeDrawingLanguage } from './BaseCodeDrawingPlugin';

/**
 * Convert SVG string to data URL
 */
function svgToDataUrl(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return `data:image/svg+xml;base64,${window.btoa(binary)}`;
}

/**
 * Render PlantUml diagram
 * Uses plantuml-encoder to encode content and fetches SVG from PlantUml server
 */
async function renderPlantUml(content: string): Promise<string> {
  try {
    // Dynamic import of plantuml-encoder
    const plantumlEncoder = await import('plantuml-encoder');
    const encoded = plantumlEncoder.default.encode(content);
    const svgUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;

    // Fetch SVG
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch PlantUml SVG');
    }
    const svg = await response.text();
    return svgToDataUrl(svg);
  } catch (error) {
    console.error('PlantUml rendering error:', error);
    throw error;
  }
}

/**
 * Render Graphviz diagram
 * Uses viz.js to render Graphviz DOT syntax to SVG
 */
async function renderGraphviz(content: string): Promise<string> {
  try {
    const vizModule = await import('viz.js');
    const Viz = vizModule.default;
    let fullRender: typeof import('viz.js/full.render.js');

    try {
      fullRender = await import('viz.js/full.render.js');
    } catch {
      fullRender = await import('viz.js/full.render');
    }

    const viz = new Viz(fullRender);
    const svg = await viz.renderString(content, {
      format: 'svg',
      engine: 'dot',
    });

    return svgToDataUrl(svg);
  } catch (error) {
    console.error('Graphviz rendering error:', error);
    throw error;
  }
}

/**
 * Render Flowchart diagram
 * Uses flowchart.js to parse and render flowchart syntax
 */
async function renderFlowchart(content: string): Promise<string> {
  try {
    // Dynamic import of flowchart.js
    const flowchartModule = await import('flowchart.js');
    const flowchart = flowchartModule.default;

    const chart = flowchart.parse(content);
    const el = document.createElement('div');
    el.style.display = 'none';
    document.body.appendChild(el);

    chart.drawSVG(el);
    const svg = el.innerHTML;
    el.remove();

    return svgToDataUrl(svg);
  } catch (error) {
    console.error('Flowchart rendering error:', error);
    throw error;
  }
}

/**
 * Render Mermaid diagram
 * Uses mermaid to render Mermaid syntax
 */
let mermaidInitialized = false;

async function renderMermaid(content: string): Promise<string> {
  try {
    // Dynamic import of mermaid
    const mermaid = await import('mermaid');

    if (!mermaidInitialized) {
      mermaid.default.initialize({ startOnLoad: false });
      mermaidInitialized = true;
    }

    const id = `mermaid-${Array.from({ length: 6 }, () =>
      'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26))
    ).join('')}`;
    const { svg } = await mermaid.default.render(id, content);

    if (svg) {
      return svgToDataUrl(svg);
    }

    throw new Error('Mermaid rendering failed');
  } catch (error) {
    console.error('Mermaid rendering error:', error);
    throw error;
  }
}

/**
 * Render code drawing based on type
 */
export async function renderCodeDrawing(
  language: CodeDrawingLanguage,
  content: string
): Promise<string> {
  if (!content || !content.trim()) {
    return '';
  }

  switch (language) {
    case 'plantuml': {
      return renderPlantUml(content);
    }
    case 'graphviz': {
      return renderGraphviz(content);
    }
    case 'flowchart': {
      return renderFlowchart(content);
    }
    case 'mermaid': {
      return renderMermaid(content);
    }
    default: {
      throw new Error(`Unsupported drawing language: ${String(language)}`);
    }
  }
}
