"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importStar(require("react"));
var theme_common_1 = require("@docusaurus/theme-common");
var useHideableNavbar_1 = __importDefault(require("@theme/hooks/useHideableNavbar"));
var useLockBodyScroll_1 = __importDefault(require("@theme/hooks/useLockBodyScroll"));
var useThemeContext_1 = __importDefault(require("@theme/hooks/useThemeContext"));
var useWindowSize_1 = __importStar(require("@theme/hooks/useWindowSize"));
var IconMenu_1 = __importDefault(require("@theme/IconMenu"));
var Logo_1 = __importDefault(require("@theme/Logo"));
var NavbarItem_1 = __importDefault(require("@theme/NavbarItem"));
var SearchBar_1 = __importDefault(require("@theme/SearchBar"));
var Toggle_1 = __importDefault(require("@theme/Toggle"));
var clsx_1 = __importDefault(require("clsx"));
var index_1 = __importDefault(require("./components/QuickSocialLinksView/index"));
var styles_module_css_1 = __importDefault(require("./styles.module.css"));
// retrocompatible with v1
var DefaultNavItemPosition = 'right';
// If split links by left/right
// if position is unspecified, fallback to right (as v1)
function splitNavItemsByPosition(items) {
    var leftItems = items.filter(function (item) { var _a; return ((_a = item.position) !== null && _a !== void 0 ? _a : DefaultNavItemPosition) === 'left'; });
    var rightItems = items.filter(function (item) { var _a; return ((_a = item.position) !== null && _a !== void 0 ? _a : DefaultNavItemPosition) === 'right'; });
    return {
        leftItems: leftItems,
        rightItems: rightItems,
    };
}
function Navbar() {
    var _a;
    var _b = theme_common_1.useThemeConfig(), _c = _b.navbar, items = _c.items, hideOnScroll = _c.hideOnScroll, style = _c.style, disableColorModeSwitch = _b.colorMode.disableSwitch;
    var _d = react_1.useState(false), sidebarShown = _d[0], setSidebarShown = _d[1];
    var _e = useThemeContext_1["default"](), isDarkTheme = _e.isDarkTheme, setLightTheme = _e.setLightTheme, setDarkTheme = _e.setDarkTheme;
    var _f = useHideableNavbar_1["default"](hideOnScroll), navbarRef = _f.navbarRef, isNavbarVisible = _f.isNavbarVisible;
    useLockBodyScroll_1["default"](sidebarShown);
    var showSidebar = react_1.useCallback(function () {
        setSidebarShown(true);
    }, [setSidebarShown]);
    var hideSidebar = react_1.useCallback(function () {
        setSidebarShown(false);
    }, [setSidebarShown]);
    var onToggleChange = react_1.useCallback(function (e) { return (e.target.checked ? setDarkTheme() : setLightTheme()); }, [setLightTheme, setDarkTheme]);
    var windowSize = useWindowSize_1["default"]();
    react_1.useEffect(function () {
        if (windowSize === useWindowSize_1.windowSizes.desktop) {
            setSidebarShown(false);
        }
    }, [windowSize]);
    var hasSearchNavbarItem = items.some(function (item) { return item.type === 'search'; });
    var _g = splitNavItemsByPosition(items), leftItems = _g.leftItems, rightItems = _g.rightItems;
    return (react_1["default"].createElement("nav", { ref: navbarRef, className: clsx_1["default"]('navbar', 'navbar--fixed-top', (_a = {
                'navbar--dark': style === 'dark',
                'navbar--primary': style === 'primary',
                'navbar-sidebar--show': sidebarShown
            },
            _a[styles_module_css_1["default"].navbarHideable] = hideOnScroll,
            _a[styles_module_css_1["default"].navbarHidden] = hideOnScroll && !isNavbarVisible,
            _a)) },
        react_1["default"].createElement("div", { className: "navbar__inner" },
            react_1["default"].createElement("div", { className: "navbar__items" },
                items != null && items.length !== 0 && (react_1["default"].createElement("button", { "aria-label": "Navigation bar toggle", className: "navbar__toggle", type: "button", tabIndex: 0, onClick: showSidebar, onKeyDown: showSidebar },
                    react_1["default"].createElement(IconMenu_1["default"], null))),
                react_1["default"].createElement(Logo_1["default"], { className: "navbar__brand", imageClassName: "navbar__logo", titleClassName: clsx_1["default"]('navbar__title') }),
                leftItems.map(function (item, i) { return (react_1["default"].createElement(NavbarItem_1["default"], __assign({}, item, { key: i }))); })),
            react_1["default"].createElement("div", { className: "navbar__items navbar__items--right" },
                rightItems.map(function (item, i) { return (react_1["default"].createElement(NavbarItem_1["default"], __assign({}, item, { key: i }))); }),
                react_1["default"].createElement(index_1["default"], { className: styles_module_css_1["default"].displayOnlyInLargeViewport }),
                !disableColorModeSwitch && (react_1["default"].createElement(Toggle_1["default"], { className: styles_module_css_1["default"].displayOnlyInLargeViewport, "aria-label": "Dark mode toggle", checked: isDarkTheme, onChange: onToggleChange })),
                !hasSearchNavbarItem && react_1["default"].createElement(SearchBar_1["default"], null))),
        react_1["default"].createElement("div", { role: "presentation", className: "navbar-sidebar__backdrop", onClick: hideSidebar }),
        react_1["default"].createElement("div", { className: "navbar-sidebar" },
            react_1["default"].createElement("div", { className: "navbar-sidebar__brand" },
                react_1["default"].createElement(Logo_1["default"], { className: "navbar__brand", imageClassName: "navbar__logo", titleClassName: "navbar__title", onClick: hideSidebar }),
                !disableColorModeSwitch && sidebarShown && (react_1["default"].createElement(Toggle_1["default"], { "aria-label": "Dark mode toggle in sidebar", checked: isDarkTheme, onChange: onToggleChange }))),
            react_1["default"].createElement("div", { className: "navbar-sidebar__items" },
                react_1["default"].createElement("div", { className: "menu" },
                    react_1["default"].createElement("ul", { className: "menu__list" }, items.map(function (item, i) { return (react_1["default"].createElement(NavbarItem_1["default"], __assign({ mobile: true }, item, { onClick: hideSidebar, key: i }))); })))))));
}
exports["default"] = Navbar;
