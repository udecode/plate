export const headerNavTemplate = ({navItems, getAccessKeyHTML}) =>
    `<div class="fw-container fw-nav-container">
    ${navItems
        .map(
            (navItem, index) =>
                `<p class="fw-nav-item ${navItem.active ? "active-menu-wrapper" : ""}" role="presentation">
                <a class="fw-header-navigation-text" href="${navItem.url}" title="${navItem.title}" role="menuitem" data-index=${index}>
                    ${getAccessKeyHTML(navItem.text, navItem.keys)}
                </a>
            </p>`
        )
        .join("")}
    </div>`
