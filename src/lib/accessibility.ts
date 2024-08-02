export type MouseElementEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLElement;
}

export type KeyboardElementEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLElement;
}

export const IsMouseEvent = (e?: MouseElementEvent | KeyboardElementEvent): e is MouseElementEvent => {
    return e != undefined && "button" in e;
}

export const IsKeyboardEvent = (e?: MouseElementEvent | KeyboardElementEvent): e is KeyboardElementEvent => {
    return e !== undefined && "key" in e;
}

export function IsInteraction(e: MouseElementEvent): boolean
export function IsInteraction(e: KeyboardElementEvent): boolean
export function IsInteraction(e: MouseElementEvent | KeyboardElementEvent): boolean
export function IsInteraction(e: MouseElementEvent | KeyboardElementEvent): boolean {
    if (IsMouseEvent(e)) {
        return e.button == 0;
    }
    else if (IsKeyboardEvent(e)) {
        return e.key === "Enter" || e.key === " ";
    }
    return false; // This should never occur but it's here anyway
}
export function isInteraction(e?: KeyboardElementEvent): boolean {
    if (e !== undefined) {
        return e.key === "Enter" || e.key === " ";
    }
    else {
        return true;
    }
}

export function GetInteractType(e: MouseElementEvent): InteractType
export function GetInteractType(e: KeyboardElementEvent): InteractType
export function GetInteractType(e: MouseElementEvent | KeyboardElementEvent): InteractType {
    let iType = InteractType.INVALID
    if (IsInteraction(e)) {
        // If ctrl + shift are pressed, the user may have done the wrong action
        // this may pose accessibility issues depending on how a users tools work however.
        if (e.ctrlKey && !e.shiftKey) {
            iType = InteractType.MULTISELECT;
        }
        else if (e.shiftKey && !e.ctrlKey) {
            iType = InteractType.RANGESELECT;
        }
        else if (!e.ctrlKey && !e.shiftKey) {
            iType = e.detail === 2 ? InteractType.DOUBLE : InteractType.BASIC;
        }
    }
    else if (IsKeyboardEvent(e)) {
        if (e.key === "Escape") {
            iType = InteractType.ESCAPE
        }
    }
    // Add logic for ALT interaction and DOUBLE interaction types
    return iType;
}

export enum InteractType {
    BASIC, // Left-click or equivalent
    ALT, // Right-click or equivalent
    DOUBLE, // Double click or equivalent
    MULTISELECT, // Ctrl + Left click or equivalent
    RANGESELECT, // Shift + Left click or equivalent
    ESCAPE,
    INVALID // Anything else / Not an interaction
}