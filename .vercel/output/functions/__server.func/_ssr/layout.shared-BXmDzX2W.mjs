import { L as Link, B as useSearchContext, b as buttonVariants$1, C as useI18n, P as Popover$1, D as PopoverTrigger$1, E as PopoverContent$1, z as usePathname, A as isActive } from "./router-0MOvnyX6.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { z } from "../_libs/next-themes.mjs";
import { S as Search, p as Sun, M as Moon, q as Airplay } from "../_libs/lucide-react.mjs";
function LinkItem({ ref, item, ...props }) {
  const pathname = usePathname();
  const activeType = item.active ?? "url";
  const active = activeType !== "none" && isActive(item.url, pathname, activeType === "nested-url");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
    ref,
    href: item.url,
    external: item.external,
    ...props,
    "data-active": active,
    children: props.children
  });
}
function SearchToggle({ hideIfDisabled, size = "icon-sm", color = "ghost", ...props }) {
  const { setOpenSearch, enabled } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
    type: "button",
    className: twMerge(buttonVariants$1({
      size,
      color
    }), props.className),
    "data-search": "",
    "aria-label": "Open Search",
    onClick: () => {
      setOpenSearch(true);
    },
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, {})
  });
}
function LargeSearchToggle({ hideIfDisabled, ...props }) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (hideIfDisabled && !enabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", {
    type: "button",
    "data-search-full": "",
    ...props,
    className: twMerge("inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground", props.className),
    onClick: () => {
      setOpenSearch(true);
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4" }),
      text.search,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
        className: "ms-auto inline-flex gap-0.5",
        children: hotKey.map((k, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", {
          className: "rounded-md border bg-fd-background px-1.5",
          children: k.display
        }, i))
      })
    ]
  });
}
function resolveLinkItems({ links = [], githubUrl }) {
  const result = [...links];
  if (githubUrl) result.push({
    type: "icon",
    url: githubUrl,
    text: "Github",
    label: "GitHub",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", {
      role: "img",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" })
    }),
    external: true
  });
  return result;
}
function renderTitleNav({ title, url = "/" }, props) {
  if (typeof title === "function") return title({
    href: url,
    ...props
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
    href: url,
    ...props,
    children: title
  });
}
function useLinkItems({ githubUrl, links }) {
  return reactExports.useMemo(() => {
    const all = resolveLinkItems({
      links,
      githubUrl
    });
    const navItems = [];
    const menuItems = [];
    for (const item of all) switch (item.on) {
      case "menu":
        menuItems.push(item);
        break;
      case "nav":
        navItems.push(item);
        break;
      default:
        navItems.push(item);
        menuItems.push(item);
    }
    return {
      navItems,
      menuItems,
      all
    };
  }, [links, githubUrl]);
}
function LanguageToggle(props) {
  const context = useI18n();
  if (!context.locales) throw new Error("Missing `<I18nProvider />`");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover$1, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger$1, {
    "aria-label": context.text.chooseLanguage,
    ...props,
    className: twMerge(buttonVariants$1({
      color: "ghost",
      className: "gap-1.5 p-1.5"
    }), props.className),
    children: props.children
  }), /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent$1, {
    className: "flex flex-col overflow-x-hidden p-0",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
      className: "mb-1 p-2 text-xs font-medium text-fd-muted-foreground",
      children: context.text.chooseLanguage
    }), context.locales.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
      type: "button",
      className: twMerge("p-2 text-start text-sm", item.locale === context.locale ? "bg-fd-primary/10 font-medium text-fd-primary" : "hover:bg-fd-accent hover:text-fd-accent-foreground"),
      onClick: () => {
        context.onChange?.(item.locale);
      },
      children: item.name
    }, item.locale))]
  })] });
}
function LanguageToggleText(props) {
  const context = useI18n();
  const text = context.locales?.find((item) => item.locale === context.locale)?.name;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", {
    ...props,
    children: text
  });
}
const itemVariants = cva("size-6.5 p-1.5 text-fd-muted-foreground", { variants: { active: {
  true: "bg-fd-accent text-fd-accent-foreground",
  false: "text-fd-muted-foreground"
} } });
const full = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Airplay]
];
function ThemeToggle({ className, mode = "light-dark", ...props }) {
  const { setTheme, theme, resolvedTheme } = z();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  const container = twMerge("inline-flex items-center rounded-full border p-1 *:rounded-full", className);
  if (mode === "light-dark") {
    const value2 = mounted ? resolvedTheme : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
      className: container,
      "aria-label": `Toggle Theme`,
      onClick: () => setTheme(value2 === "light" ? "dark" : "light"),
      "data-theme-toggle": "",
      children: full.map(([key, Icon]) => {
        if (key === "system") return;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {
          fill: "currentColor",
          className: twMerge(itemVariants({ active: value2 === key }))
        }, key);
      })
    });
  }
  const value = mounted ? theme : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    className: container,
    "data-theme-toggle": "",
    ...props,
    children: full.map(([key, Icon]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
      "aria-label": key,
      className: twMerge(itemVariants({ active: value === key })),
      onClick: () => setTheme(key),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {
        className: "size-full",
        fill: "currentColor"
      })
    }, key))
  });
}
function baseOptions() {
  return {
    nav: {
      title: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/img/logo.svg", alt: "Cadence", style: { height: "2rem" } })
    },
    links: [
      { text: "Learn", url: "/docs" },
      { text: "Playground", url: "https://play.flow.com/", external: true },
      { text: "Community", url: "/community" },
      {
        text: "Security",
        url: "https://flow.com/flow-responsible-disclosure/",
        external: true
      },
      { text: "Language Reference", url: "/docs/language" },
      {
        type: "icon",
        url: "https://github.com/onflow/cadence",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", fill: "currentColor", width: "20", height: "20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" }) }),
        external: true
      },
      {
        type: "icon",
        url: "https://discord.com/invite/J6fFnh2xx6",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 16 16", fill: "currentColor", width: "20", height: "20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" }) }),
        external: true
      }
    ]
  };
}
export {
  LargeSearchToggle as L,
  SearchToggle as S,
  ThemeToggle as T,
  LanguageToggle as a,
  baseOptions as b,
  LanguageToggleText as c,
  LinkItem as d,
  renderTitleNav as r,
  useLinkItems as u
};
