import { onDestroy } from 'svelte';

/**
 * Creates a vertical debug line on the screen.
 * This is useful for aligning items or visualizing component boundaries.
 * The line is automatically removed when the component that created it is destroyed.
 *
 * @param {string | number} [position] - The position of the vertical line
 * @param {string} [label] - A label to display on the line.
 * @param {string} [color='red'] - The color of the line and label.
 */
export function addDebugVerticalLine(position: string | number, id?: string | number, label?: string, color: string = 'red') {
    if (typeof window === 'undefined') {
        // Don't run on the server
        return;
    }
    const left = typeof position === "number" ? position + 'px' : position;

    let line;
    if (id) {
        id = id.toString();
        line = document.getElementById(id) ?? document.createElement('div');
        line.id = id;
    } else {
        line = document.createElement('div');
    }

    line.style.position = 'fixed';
    line.style.top = '0';
    line.style.bottom = '0';
    line.style.left = left;
    line.style.width = '1px';
    line.style.backgroundColor = color;
    line.style.zIndex = '99999';
    line.style.pointerEvents = 'none'; // Allow clicking through the line

    let labelEl = line.querySelector('span');
    if (!labelEl && label) {
        labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.position = 'absolute';
        labelEl.style.top = '10px';
        labelEl.style.left = '5px';
        labelEl.style.color = 'white';
        labelEl.style.backgroundColor = color;
        labelEl.style.padding = '2px 5px';
        labelEl.style.fontSize = '12px';
        labelEl.style.borderRadius = '3px';
        line.appendChild(labelEl);
    } else if (labelEl && label) {
        labelEl.textContent = label;
        labelEl.style.backgroundColor = color;
    } else if (labelEl && !label) {
        line.removeChild(labelEl);
    }

    document.body.appendChild(line);

    // Use Svelte's onDestroy to clean up the element
    onDestroy(() => {
        if (line.parentElement) {
            line.parentElement.removeChild(line);
        }
    });
}