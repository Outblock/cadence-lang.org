async function O$1(e, t) {
  let n = AbortSignal.timeout(5e3), o = globalThis.fetch, m2 = t?.throwOnError ?? true, u2 = [...new Set(e)].map(async (r) => {
    let i = await o(r, { signal: n });
    if (!i.ok) throw new Error(`HTTP ${i.status}: ${i.statusText} for ${r}`);
    let a2 = await i.arrayBuffer();
    return { src: r, data: a2 };
  });
  return m2 ? Promise.all(u2) : (await Promise.allSettled(u2)).filter((r) => r.status === "fulfilled").map((r) => r.value);
}
function u(e, t) {
  t && Object.keys(t).length > 0 && (e.style = t);
}
function h(e, t) {
  t && Object.keys(t).length > 0 && (e.preset = t);
}
function d(e) {
  let t = { type: "container", children: e.children };
  return e.tw && (t.tw = e.tw), h(t, e.preset), u(t, e.style), t;
}
function m(e, t) {
  if (typeof e == "string") {
    let n = { type: "text", text: e };
    return u(n, t), n;
  }
  let r = { type: "text", text: e.text };
  return e.tw && (r.tw = e.tw), h(r, e.preset), u(r, e.style), r;
}
function R(e) {
  let t = { type: "image", src: e.src, width: e.width, height: e.height };
  return e.tw && (t.tw = e.tw), h(t, e.preset), u(t, e.style), t;
}
function b(e) {
  return `${e}%`;
}
var k = { body: { margin: 8 }, p: { marginTop: "1em", marginBottom: "1em", display: "block" }, blockquote: { marginTop: "1em", marginBottom: "1em", marginLeft: 40, marginRight: 40, display: "block" }, center: { textAlign: "center", display: "block" }, hr: { marginTop: "0.5em", marginBottom: "0.5em", marginLeft: "auto", marginRight: "auto", borderWidth: 1, display: "block" }, h1: { fontSize: "2em", marginTop: "0.67em", marginBottom: "0.67em", marginLeft: 0, marginRight: 0, fontWeight: "bold", display: "block" }, h2: { fontSize: "1.5em", marginTop: "0.83em", marginBottom: "0.83em", marginLeft: 0, marginRight: 0, fontWeight: "bold", display: "block" }, h3: { fontSize: "1.17em", marginTop: "1em", marginBottom: "1em", marginLeft: 0, marginRight: 0, fontWeight: "bold", display: "block" }, h4: { marginTop: "1.33em", marginBottom: "1.33em", marginLeft: 0, marginRight: 0, fontWeight: "bold", display: "block" }, h5: { fontSize: "0.83em", marginTop: "1.67em", marginBottom: "1.67em", marginLeft: 0, marginRight: 0, fontWeight: "bold", display: "block" }, h6: { fontSize: "0.67em", marginTop: "2.33em", marginBottom: "2.33em", marginLeft: 0, marginRight: 0, fontWeight: "bold", display: "block" }, u: { textDecoration: "underline", display: "inline" }, strong: { fontWeight: "bold", display: "inline" }, b: { fontWeight: "bold", display: "inline" }, i: { fontStyle: "italic", display: "inline" }, em: { fontStyle: "italic", display: "inline" }, code: { fontFamily: "monospace", display: "inline" }, kbd: { fontFamily: "monospace", display: "inline" }, pre: { fontFamily: "monospace", margin: "1em 0", display: "block" }, mark: { backgroundColor: "yellow", color: "black", display: "inline" }, big: { fontSize: "1.2em", display: "inline" }, small: { fontSize: "0.8em", display: "inline" }, s: { textDecoration: "line-through", display: "inline" }, span: { display: "inline" }, img: { display: "inline" }, svg: { display: "inline" } };
var I = /* @__PURE__ */ new Set(["head", "meta", "link", "style", "script"]);
function E(e) {
  return I.has(e.type);
}
function g(e, t) {
  return e.type === t && "props" in e;
}
function P(e) {
  return e.replace(/([A-Z])/g, "-$1").toLowerCase();
}
function a(e) {
  return typeof e == "object" && e !== null && "type" in e;
}
function l(e) {
  return typeof e == "function";
}
var J = /* @__PURE__ */ Symbol.for("react.forward_ref"), z = /* @__PURE__ */ Symbol.for("react.memo"), j = /* @__PURE__ */ Symbol.for("react.fragment");
function N(e) {
  return e.$$typeof === J;
}
function C(e) {
  return e.$$typeof === z;
}
function x(e) {
  return e.type === j;
}
function B(e) {
  return typeof e == "string" || typeof e == "number";
}
function T(e) {
  return e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function W(e) {
  return Object.keys(e).map((t) => `${t.replace(/([A-Z])/g, "-$1").toLowerCase()}:${String(e[t]).trim()}`).join(";");
}
var M = /* @__PURE__ */ new Set(["stopColor", "stopOpacity", "strokeWidth", "strokeDasharray", "strokeDashoffset", "strokeLinecap", "strokeLinejoin", "fillRule", "clipRule", "colorInterpolationFilters", "floodColor", "floodOpacity", "accentHeight", "alignmentBaseline", "arabicForm", "baselineShift", "capHeight", "clipPath", "clipPathUnits", "colorInterpolation", "colorProfile", "colorRendering", "enableBackground", "fillOpacity", "fontFamily", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontWeight", "glyphName", "glyphOrientationHorizontal", "glyphOrientationVertical", "horizAdvX", "horizOriginX", "imageRendering", "letterSpacing", "lightingColor", "markerEnd", "markerMid", "markerStart", "overlinePosition", "overlineThickness", "paintOrder", "preserveAspectRatio", "pointerEvents", "shapeRendering", "strokeMiterlimit", "strokeOpacity", "textAnchor", "textDecoration", "textRendering", "transformOrigin", "underlinePosition", "underlineThickness", "unicodeBidi", "unicodeRange", "unitsPerEm", "vectorEffect", "vertAdvY", "vertOriginX", "vertOriginY", "vAlphabetic", "vHanging", "vIdeographic", "vMathematical", "wordSpacing", "writingMode"]);
function _(e, t) {
  if (e === "children" || t == null) return;
  let r;
  if (e === "className" ? r = "class" : M.has(e) ? r = P(e) : r = e, typeof t == "boolean") return `${r}="${String(t)}"`;
  if (e === "style" && typeof t == "object") {
    let n = W(t);
    if (n) return `style="${T(n)}"`;
  }
  return `${r}="${T(String(t))}"`;
}
function H(e) {
  return Object.entries(e).map(([t, r]) => _(t, r)).filter((t) => t !== void 0);
}
var X = (e, t) => {
  let r = e.props || {};
  if (l(e.type)) return f(e.type(e.props));
  if (typeof e.type == "symbol" || typeof e.type != "string") return "";
  let n = H(r), i = r.children, o = Array.isArray(i) ? i.map((s) => t(s)).join("") : t(i);
  return `<${e.type}${n.length > 0 ? ` ${n.join(" ")}` : ""}>${o}</${e.type}>`;
}, f = (e) => e == null || e === false ? "" : B(e) ? String(e) : Array.isArray(e) ? e.map(f).join("") : a(e) ? X(e, f) : "";
function v(e) {
  let t = e.props || {};
  if (!("xmlns" in t)) {
    let r = { ...e, props: { ...t, xmlns: "http://www.w3.org/2000/svg" } };
    return f(r) || "";
  }
  return f(e) || "";
}
async function se(e, t) {
  let r = await p(e, { presets: D(t), tailwindClassesProperty: t?.tailwindClassesProperty ?? "tw" });
  return r.length === 0 ? d({}) : r.length === 1 && r[0] !== void 0 ? r[0] : d({ children: r, style: { width: b(100), height: b(100) } });
}
async function p(e, t) {
  if (e == null || e === false) return [];
  if (e instanceof Promise) return p(await e, t);
  if (typeof e == "object" && Symbol.iterator in e) return q(e, t);
  if (a(e)) {
    let r = await F(e, t);
    return Array.isArray(r) ? r : r ? [r] : [];
  }
  return [m({ text: String(e), preset: t.presets?.span })];
}
function D(e) {
  if (e?.defaultStyles !== false) return e?.defaultStyles ?? k;
}
function V(e, t) {
  if (!(typeof e.type != "object" || e.type === null)) {
    if (N(e.type) && "render" in e.type) {
      let r = e.type;
      return p(r.render(e.props, null), t);
    }
    if (C(e.type) && "type" in e.type) {
      let n = e.type.type;
      if (l(n)) return p(n(e.props), t);
      let i = { ...e, type: n };
      return F(i, t);
    }
  }
}
function A(e) {
  if (!a(e)) return;
  let t = typeof e.props == "object" && e.props !== null && "children" in e.props ? e.props.children : void 0;
  if (typeof t == "string") return t;
  if (typeof t == "number") return String(t);
  if (Array.isArray(t) || typeof t == "object" && t !== null && Symbol.iterator in t) return O(t);
  if (a(t) && x(t)) return A(t);
}
function O(e) {
  let t = "";
  for (let r of e) {
    if (a(r)) return;
    if (typeof r == "string") {
      t += r;
      continue;
    }
    if (typeof r == "number") {
      t += String(r);
      continue;
    }
    return;
  }
  return t;
}
async function F(e, t) {
  if (l(e.type)) return p(e.type(e.props), t);
  let r = V(e, t);
  if (r !== void 0) return r;
  if (x(e)) return await L(e, t) || [];
  if (E(e)) return [];
  if (g(e, "br")) return [m({ text: `
`, preset: t.presets?.span })];
  if (g(e, "img")) return [Y(e, t)];
  if (g(e, "svg")) return [K(e, t)];
  let { preset: n, style: i } = S(e, t), o = w(e, t), s = A(e);
  if (s !== void 0) return [m({ text: s, preset: n, style: i, tw: o })];
  let c = await L(e, t);
  return [d({ children: c, preset: n, style: i, tw: o })];
}
function Y(e, t) {
  if (!e.props.src) throw new Error("Image element must have a 'src' prop.");
  let { preset: r, style: n } = S(e, t), i = w(e, t), o = e.props.width !== void 0 ? Number(e.props.width) : void 0, s = e.props.height !== void 0 ? Number(e.props.height) : void 0;
  return R({ src: e.props.src, width: o, height: s, preset: r, style: n, tw: i });
}
function K(e, t) {
  let { preset: r, style: n } = S(e, t), i = w(e, t), o = v(e), s = e.props.width !== void 0 ? Number(e.props.width) : void 0, c = e.props.height !== void 0 ? Number(e.props.height) : void 0;
  return R({ preset: r, width: s, height: c, style: n, src: o, tw: i });
}
function S(e, t) {
  let r, n, i = t.presets;
  i && typeof e.type == "string" && e.type in i && (r = i[e.type]);
  let o = typeof e.props == "object" && e.props !== null && "style" in e.props && typeof e.props.style == "object" && e.props.style !== null ? e.props.style : void 0;
  if (o) {
    for (let s in o) if (Object.hasOwn(o, s)) {
      n = o;
      break;
    }
  }
  return { preset: r, style: n };
}
function w(e, t) {
  let r = t.tailwindClassesProperty;
  if (typeof e.props != "object" || e.props === null || !(r in e.props)) return;
  let n = e.props[r];
  if (typeof n == "string") return n;
}
function L(e, t) {
  return typeof e.props != "object" || e.props === null || !("children" in e.props) ? Promise.resolve([]) : p(e.props.children, t);
}
var U = 8;
async function q(e, t) {
  let r = [], n = /* @__PURE__ */ new Set(), i = 0;
  for (let s of e) {
    let c = i;
    i += 1;
    let y = p(s, t).then(($) => {
      r[c] = $;
    }).finally(() => n.delete(y));
    n.add(y), n.size >= U && await Promise.race(n);
  }
  await Promise.all(n);
  let o = [];
  for (let s of r) s && o.push(...s);
  return o;
}
export {
  O$1 as O,
  se as s
};
