// Taken from https://stackoverflow.com/a/21015393


/**
  * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
  * 
  * @param {String} text The text to be rendered.
  * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
  * 
  * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
  */
export function getTextWidth(text: string, font: string): number {
  // re-use canvas object for better performance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canvas: HTMLCanvasElement = (getTextWidth as any).canvas || ((getTextWidth as any).canvas = document.createElement("canvas"));
  const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
  context.font = font;
  const metrics: TextMetrics = context.measureText(text);
  return metrics.width;
}

export function getCssStyle(element: Element, prop: string): string {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

export function getCanvasFont(el: HTMLElement = document.body): string {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
  const fontSize = getCssStyle(el, 'font-size') || '16px';
  const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';
  
  return `${fontWeight} ${fontSize} ${fontFamily}`;
}