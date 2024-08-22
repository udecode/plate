export type Intersection = 'center' | 'cover' | 'touch'


/**
 * Check if two DOM-Elements intersects each other.
 * @param a BoundingClientRect of the first element.
 * @param b BoundingClientRect of the second element.
 * @param mode Options are center, cover or touch.
 * @returns {boolean} If both elements intersects each other.
 */
export function intersects(a: DOMRect, b: DOMRect, mode: Intersection = 'touch'): boolean {
    switch (mode) {
        case 'center': {
            const bxc = b.left + b.width / 2;
            const byc = b.top + b.height / 2;

            return bxc >= a.left &&
                bxc <= a.right &&
                byc >= a.top &&
                byc <= a.bottom;
        }
        case 'cover': {
            return b.left >= a.left &&
                b.top >= a.top &&
                b.right <= a.right &&
                b.bottom <= a.bottom;
        }
        case 'touch': {
            return a.right >= b.left &&
                a.left <= b.right &&
                a.bottom >= b.top &&
                a.top <= b.bottom;
        }
    }
}

export function intersectsScroll(a: DOMRect, b: DOMRect, mode: Intersection = 'touch', container: HTMLElement): boolean {
    const containerRect = container.getBoundingClientRect()
    const scrollLeft = container.scrollLeft
    const scrollTop = container.scrollTop


    // 198 is container to left
    return a.right >= b.left - containerRect.left &&
        a.left + containerRect.left  <= b.right + scrollLeft &&
        // 94 is container to top
        a.bottom - scrollTop  >= b.top - containerRect.top &&
        a.top <= b.bottom - containerRect.top + scrollTop;
}
