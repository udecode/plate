// Get the index number of currently focused selement. This it to set tyhe focus close by after doing some dom changes.

export const getFocusIndex = () => {
    return Array.from(
        document.querySelectorAll(
            "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]"
        )
    ).findIndex(el => el === document.activeElement)
}

export const setFocusIndex = index => {
    const focusableElements = Array.from(
        document.querySelectorAll(
            "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]"
        )
    )
    if (index >= 0 && index < focusableElements.length) {
        focusableElements[index].focus()
    }
}
