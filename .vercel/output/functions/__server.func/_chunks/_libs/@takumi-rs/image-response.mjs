import { R as Renderer, e as extractResourceUrls } from "./core.mjs";
import { s as se, O as O$1 } from "./helpers.mjs";
var n, R = { format: "webp" };
async function u(t) {
  if (t && "renderer" in t) return t.renderer;
  if (!n) return n = new Renderer(t), n;
  if (t?.fonts) for (let e of t.fonts) await n.loadFont(e);
  if (t?.persistentImages) for (let e of t.persistentImages) await n.putPersistentImage(e.src, e.data);
  return n;
}
function f(t, e) {
  if (e?.fetchedResources) return e.fetchedResources;
  let r = extractResourceUrls(t);
  return O$1(r);
}
function O(t, e) {
  return new ReadableStream({ async start(r) {
    try {
      let a = await u(e), s = await se(t, e?.jsx), i = await f(s, e), p = await a.render(s, { ...e, fetchedResources: i }, e?.signal);
      r.enqueue(p), r.close();
    } catch (a) {
      r.error(a);
    }
  } });
}
var y = { webp: "image/webp", png: "image/png", jpeg: "image/jpeg", WebP: "image/webp", Jpeg: "image/jpeg", Png: "image/png", raw: "application/octet-stream" }, o = class extends Response {
  constructor(e, r) {
    let a = O(e, r), s = new Headers(r?.headers);
    s.get("content-type") || s.set("content-type", y[r?.format ?? R.format]), super(a, { status: r?.status, statusText: r?.statusText, headers: s });
  }
};
export {
  o
};
