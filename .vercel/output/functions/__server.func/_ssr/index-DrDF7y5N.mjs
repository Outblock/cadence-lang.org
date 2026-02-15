import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { b as buttonVariants$1, u as useIsScrollTop, L as Link$1 } from "./router-0MOvnyX6.mjs";
import { u as useLinkItems, r as renderTitleNav, L as LargeSearchToggle, T as ThemeToggle, a as LanguageToggle, S as SearchToggle, c as LanguageToggleText, d as LinkItem } from "./layout.shared-BXmDzX2W.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { R as Root2, L as List, a as Link, N as NavigationMenuItem$1, T as Trigger, C as Content, V as Viewport } from "../_chunks/_libs/@radix-ui/react-navigation-menu.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { o as Languages, b as ChevronDown } from "../_libs/lucide-react.mjs";
const NavigationMenu = Root2;
const NavigationMenuList = List;
const NavigationMenuItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuItem$1, {
  ref,
  className: twMerge("list-none", className),
  ...props,
  children
}));
NavigationMenuItem.displayName = NavigationMenuItem$1.displayName;
const NavigationMenuTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, {
  ref,
  className: twMerge("data-[state=open]:bg-fd-accent/50", className),
  ...props,
  children
}));
NavigationMenuTrigger.displayName = Trigger.displayName;
const NavigationMenuContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Content, {
  ref,
  className: twMerge("absolute inset-x-0 top-0 overflow-auto fd-scroll-container max-h-[80svh] data-[motion=from-end]:animate-fd-enterFromRight data-[motion=from-start]:animate-fd-enterFromLeft data-[motion=to-end]:animate-fd-exitToRight data-[motion=to-start]:animate-fd-exitToLeft", className),
  ...props
}));
NavigationMenuContent.displayName = Content.displayName;
const NavigationMenuLink = Link;
const NavigationMenuViewport = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
  ref,
  className: "flex w-full justify-center",
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport, {
    ...props,
    className: twMerge("relative h-(--radix-navigation-menu-viewport-height) w-full origin-[top_center] overflow-hidden transition-[width,height] duration-300 data-[state=closed]:animate-fd-nav-menu-out data-[state=open]:animate-fd-nav-menu-in", className)
  })
}));
NavigationMenuViewport.displayName = Viewport.displayName;
const navItemVariants = cva("[&_svg]:size-4", {
  variants: { variant: {
    main: "inline-flex items-center gap-1 p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary",
    button: buttonVariants$1({
      color: "secondary",
      className: "gap-1.5"
    }),
    icon: buttonVariants$1({
      color: "ghost",
      size: "icon"
    })
  } },
  defaultVariants: { variant: "main" }
});
function Header({ nav = {}, i18n = false, links, githubUrl, themeSwitch = {}, searchToggle = {} }) {
  const { navItems, menuItems } = useLinkItems({
    links,
    githubUrl
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(HeaderNavigationMenu, {
    transparentMode: nav.transparentMode,
    children: [
      renderTitleNav(nav, { className: "inline-flex items-center gap-2.5 font-semibold" }),
      nav.children,
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
        className: "flex flex-row items-center gap-2 px-6 max-sm:hidden",
        children: navItems.filter((item) => !isSecondary(item)).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLinkItem, {
          item,
          className: "text-sm"
        }, i))
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex flex-row items-center justify-end gap-1.5 flex-1 max-lg:hidden",
        children: [
          searchToggle.enabled !== false && (searchToggle.components?.lg ?? /* @__PURE__ */ jsxRuntimeExports.jsx(LargeSearchToggle, {
            className: "w-full rounded-full ps-2.5 max-w-[240px]",
            hideIfDisabled: true
          })),
          themeSwitch.enabled !== false && (themeSwitch.component ?? /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, { mode: themeSwitch?.mode })),
          i18n && /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageToggle, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", {
            className: "flex flex-row gap-2 items-center empty:hidden",
            children: navItems.filter(isSecondary).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLinkItem, {
              className: twMerge(item.type === "icon" && "-mx-1 first:ms-0 last:me-0"),
              item
            }, i))
          })
        ]
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", {
        className: "flex flex-row items-center ms-auto -me-1.5 lg:hidden",
        children: [searchToggle.enabled !== false && (searchToggle.components?.sm ?? /* @__PURE__ */ jsxRuntimeExports.jsx(SearchToggle, {
          className: "p-2",
          hideIfDisabled: true
        })), /* @__PURE__ */ jsxRuntimeExports.jsxs(NavigationMenuItem, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuTrigger, {
          "aria-label": "Toggle Menu",
          className: twMerge(buttonVariants$1({
            size: "icon",
            color: "ghost",
            className: "group [&_svg]:size-5.5"
          })),
          onPointerMove: nav.enableHoverToOpen ? void 0 : (e) => e.preventDefault(),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "transition-transform duration-300 group-data-[state=open]:rotate-180" })
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs(NavigationMenuContent, {
          className: "flex flex-col p-4 sm:flex-row sm:items-center sm:justify-end",
          children: [menuItems.filter((item) => !isSecondary(item)).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNavigationMenuLinkItem, {
            item,
            className: "sm:hidden"
          }, i)), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "-ms-1.5 flex flex-row items-center gap-2 max-sm:mt-2",
            children: [
              menuItems.filter(isSecondary).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNavigationMenuLinkItem, {
                item,
                className: twMerge(item.type === "icon" && "-mx-1 first:ms-0")
              }, i)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
                role: "separator",
                className: "flex-1"
              }),
              i18n && /* @__PURE__ */ jsxRuntimeExports.jsxs(LanguageToggle, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageToggleText, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3 text-fd-muted-foreground" })
              ] }),
              themeSwitch.enabled !== false && (themeSwitch.component ?? /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, { mode: themeSwitch?.mode }))
            ]
          })]
        })] })]
      })
    ]
  });
}
function isSecondary(item) {
  if ("secondary" in item && item.secondary != null) return item.secondary;
  return item.type === "icon";
}
function HeaderNavigationMenu({ transparentMode = "none", ...props }) {
  const [value, setValue] = reactExports.useState("");
  const isTop = useIsScrollTop({ enabled: transparentMode === "top" }) ?? true;
  const isTransparent = transparentMode === "top" ? isTop : transparentMode === "always";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenu, {
    value,
    onValueChange: setValue,
    asChild: true,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("header", {
      id: "nd-nav",
      ...props,
      className: twMerge("sticky h-14 top-0 z-40", props.className),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: twMerge("backdrop-blur-lg border-b transition-colors *:mx-auto *:max-w-(--fd-layout-width)", value.length > 0 && "max-lg:shadow-lg max-lg:rounded-b-2xl", (!isTransparent || value.length > 0) && "bg-fd-background/80"),
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuList, {
          className: "flex h-14 w-full items-center px-4",
          asChild: true,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { children: props.children })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuViewport, {})]
      })
    })
  });
}
function NavigationMenuLinkItem({ item, ...props }) {
  if (item.type === "custom") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    ...props,
    children: item.children
  });
  if (item.type === "menu") {
    const children = item.items.map((child, j) => {
      if (child.type === "custom") return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: child.children }, j);
      const { banner = child.icon ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4",
        children: child.icon
      }) : null, ...rest } = child.menu ?? {};
      return /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLink, {
        asChild: true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, {
          href: child.url,
          external: child.external,
          ...rest,
          className: twMerge("flex flex-col gap-2 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground", rest.className),
          children: rest.children ?? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            banner,
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-base font-medium",
              children: child.text
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
              className: "text-sm text-fd-muted-foreground empty:hidden",
              children: child.description
            })
          ] })
        })
      }, `${j}-${child.url}`);
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(NavigationMenuItem, {
      ...props,
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuTrigger, {
        className: twMerge(navItemVariants(), "rounded-md"),
        children: item.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, {
          href: item.url,
          external: item.external,
          children: item.text
        }) : item.text
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuContent, {
        className: "grid grid-cols-1 gap-2 p-4 md:grid-cols-2 lg:grid-cols-3",
        children
      })]
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuItem, {
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLink, {
      asChild: true,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkItem, {
        item,
        "aria-label": item.type === "icon" ? item.label : void 0,
        className: twMerge(navItemVariants({ variant: item.type })),
        children: item.type === "icon" ? item.icon : item.text
      })
    })
  });
}
function MobileNavigationMenuLinkItem({ item, ...props }) {
  if (item.type === "custom") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: twMerge("grid", props.className),
    children: item.children
  });
  if (item.type === "menu") {
    const header = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [item.icon, item.text] });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: twMerge("mb-4 flex flex-col", props.className),
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "mb-1 text-sm text-fd-muted-foreground",
        children: item.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLink, {
          asChild: true,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, {
            href: item.url,
            external: item.external,
            children: header
          })
        }) : header
      }), item.items.map((child, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(MobileNavigationMenuLinkItem, { item: child }, i))]
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationMenuLink, {
    asChild: true,
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LinkItem, {
      item,
      className: twMerge({
        main: "inline-flex items-center gap-2 py-1.5 transition-colors hover:text-fd-popover-foreground/50 data-[active=true]:font-medium data-[active=true]:text-fd-primary [&_svg]:size-4",
        icon: buttonVariants$1({
          size: "icon",
          color: "ghost"
        }),
        button: buttonVariants$1({
          color: "secondary",
          className: "gap-1.5 [&_svg]:size-4"
        })
      }[item.type ?? "main"], props.className),
      "aria-label": item.type === "icon" ? item.label : void 0,
      children: [item.icon, item.type === "icon" ? void 0 : item.text]
    })
  });
}
function HomeLayout(props) {
  const { nav = {}, links, githubUrl, i18n, themeSwitch = {}, searchToggle, ...rest } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", {
    id: "nd-home-layout",
    ...rest,
    className: twMerge("flex flex-1 flex-col [--fd-layout-width:1400px]", rest.className),
    children: [nav.enabled !== false && (nav.component ?? /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {
      links,
      nav,
      themeSwitch,
      searchToggle,
      i18n,
      githubUrl
    })), props.children]
  });
}
export {
  HomeLayout as H
};
