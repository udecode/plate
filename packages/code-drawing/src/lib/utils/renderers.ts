import type { CodeDrawingType } from '../constants';

/**
 * Generate a random string for unique IDs
 */
function randomString(
  length: number,
  type: 'lowerCase' | 'upperCase' = 'lowerCase'
): string {
  const chars =
    type === 'lowerCase'
      ? 'abcdefghijklmnopqrstuvwxyz'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Convert SVG string to data URL
 */
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
}

/**
 * Render PlantUml diagram
 * Uses plantuml-encoder to encode content and fetches SVG from PlantUml server
 */
export async function renderPlantUml(content: string): Promise<string> {
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
export async function renderGraphviz(content: string): Promise<string> {
  try {
    // Dynamic import of viz.js
    // Try different import patterns for compatibility
    let Viz: any;
    let Module: any;
    let render: any;

    try {
      const vizModule = await import('viz.js');
      Viz = vizModule.default || vizModule;

      const fullRender = await import('viz.js/full.render.js');
      Module = fullRender.Module;
      render = fullRender.render;
    } catch (_importError) {
      // Fallback: try alternative import
      const vizModule = await import('viz.js');
      Viz = vizModule.default || vizModule;
      const fullRender = await import('viz.js/full.render');
      Module = fullRender.Module;
      render = fullRender.render;
    }

    const viz = new Viz({ Module, render });
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
export async function renderFlowchart(content: string): Promise<string> {
  try {
    // Dynamic import of flowchart.js
    const flowchart = (await import('flowchart.js')).default;

    const chart = flowchart.parse(content);
    const el = document.createElement('div');
    el.style.display = 'none';
    document.body.appendChild(el);

    chart.drawSVG(el);
    const svg = el.innerHTML;
    document.body.removeChild(el);

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

export async function renderMermaid(content: string): Promise<string> {
  try {
    // Dynamic import of mermaid
    const mermaid = await import('mermaid');

    if (!mermaidInitialized) {
      mermaid.default.initialize({ startOnLoad: false });
      mermaidInitialized = true;
    }

    const id = `mermaid-${randomString(6, 'lowerCase')}`;
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
  type: CodeDrawingType,
  content: string
): Promise<string> {
  if (!content || !content.trim()) {
    return '';
  }

  switch (type) {
    case 'PlantUml':
      return renderPlantUml(content);
    case 'Graphviz':
      return renderGraphviz(content);
    case 'Flowchart':
      return renderFlowchart(content);
    case 'Mermaid':
      return renderMermaid(content);
    default:
      throw new Error(`Unsupported drawing type: ${type}`);
  }
}
