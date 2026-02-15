import { H as createContentHighlighter, J as removeUndefined } from "./router-0MOvnyX6.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_chunks/_libs/@tanstack/react-router.mjs";
import "../_chunks/_libs/react.mjs";
import "../_libs/tiny-warning.mjs";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_chunks/_libs/@radix-ui/react-direction.mjs";
import "../_libs/next-themes.mjs";
import "./source-CiVroWBe.mjs";
import "node:path";
import "../_libs/fumadocs-mdx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/scroll-into-view-if-needed.mjs";
import "../_libs/compute-scroll-into-view.mjs";
import "../_chunks/_libs/@radix-ui/react-collapsible.mjs";
import "../_chunks/_libs/@radix-ui/primitive.mjs";
import "../_chunks/_libs/@radix-ui/react-context.mjs";
import "../_chunks/_libs/@radix-ui/react-use-controllable-state.mjs";
import "../_chunks/_libs/@radix-ui/react-use-layout-effect.mjs";
import "../_chunks/_libs/@radix-ui/react-compose-refs.mjs";
import "../_chunks/_libs/@radix-ui/react-primitive.mjs";
import "../_chunks/_libs/@radix-ui/react-slot.mjs";
import "../_chunks/_libs/@radix-ui/react-presence.mjs";
import "../_chunks/_libs/@radix-ui/react-id.mjs";
import "../_chunks/_libs/@radix-ui/react-scroll-area.mjs";
import "../_chunks/_libs/@radix-ui/react-use-callback-ref.mjs";
import "../_chunks/_libs/@radix-ui/number.mjs";
import "../_chunks/_libs/@radix-ui/react-popover.mjs";
import "../_chunks/_libs/@radix-ui/react-dismissable-layer.mjs";
import "../_chunks/_libs/@radix-ui/react-use-escape-keydown.mjs";
import "../_chunks/_libs/@radix-ui/react-focus-guards.mjs";
import "../_chunks/_libs/@radix-ui/react-focus-scope.mjs";
import "../_chunks/_libs/@radix-ui/react-popper.mjs";
import "../_chunks/_libs/@floating-ui/react-dom.mjs";
import "../_chunks/_libs/@floating-ui/dom.mjs";
import "../_chunks/_libs/@floating-ui/core.mjs";
import "../_chunks/_libs/@floating-ui/utils.mjs";
import "../_chunks/_libs/@radix-ui/react-arrow.mjs";
import "../_chunks/_libs/@radix-ui/react-use-size.mjs";
import "../_chunks/_libs/@radix-ui/react-portal.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_chunks/_libs/@radix-ui/react-tabs.mjs";
import "../_chunks/_libs/@radix-ui/react-roving-focus.mjs";
import "../_chunks/_libs/@radix-ui/react-collection.mjs";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/remark.mjs";
import "../_libs/unified.mjs";
import "../_libs/bail.mjs";
import "../_libs/extend.mjs";
import "../_libs/is-plain-obj.mjs";
import "../_libs/trough.mjs";
import "../_libs/vfile.mjs";
import "../_libs/vfile-message.mjs";
import "../_libs/unist-util-stringify-position.mjs";
import "node:process";
import "node:url";
import "../_libs/remark-parse.mjs";
import "../_libs/mdast-util-from-markdown.mjs";
import "../_libs/_CsVBVMCu.mjs";
import "../_libs/micromark-util-decode-string.mjs";
import "../_libs/_vrBDkZ3q.mjs";
import "../_libs/character-entities.mjs";
import "../_libs/_CuJVDrso.mjs";
import "../_libs/micromark.mjs";
import "../_libs/_DLD8nrUX.mjs";
import "../_libs/micromark-util-chunked.mjs";
import "../_libs/micromark-factory-space.mjs";
import "../_libs/micromark-util-character.mjs";
import "../_libs/micromark-core-commonmark.mjs";
import "../_libs/_B_D99lZj.mjs";
import "../_libs/micromark-util-resolve-all.mjs";
import "../_libs/micromark-util-subtokenize.mjs";
import "../_libs/micromark-factory-destination.mjs";
import "../_libs/micromark-factory-label.mjs";
import "../_libs/micromark-factory-title.mjs";
import "../_libs/micromark-factory-whitespace.mjs";
import "../_libs/micromark-util-html-tag-name.mjs";
import "../_libs/mdast-util-to-string.mjs";
import "../_libs/remark-stringify.mjs";
import "../_libs/mdast-util-to-markdown.mjs";
import "../_libs/zwitch.mjs";
import "../_libs/longest-streak.mjs";
import "../_libs/unist-util-visit.mjs";
import "../_libs/unist-util-visit-parents.mjs";
import "../_libs/unist-util-is.mjs";
import "../_libs/mdast-util-phrasing.mjs";
import "../_chunks/_libs/@takumi-rs/image-response.mjs";
import "../_chunks/_libs/@takumi-rs/core.mjs";
import "node:module";
import "../_chunks/_libs/@takumi-rs/helpers.mjs";
import "../_libs/lucide-react.mjs";
import "../_chunks/_libs/@orama/orama.mjs";
async function searchDocs(query, options) {
  const highlighter = createContentHighlighter(query);
  const list = [];
  const { index = "default", client, params: extraParams = {}, tag } = options;
  if (index === "crawler") {
    const result2 = await client.search({
      ...extraParams,
      term: query,
      where: {
        category: tag ? { eq: tag.slice(0, 1).toUpperCase() + tag.slice(1) } : void 0,
        ...extraParams.where
      },
      limit: 10
    });
    if (!result2) return list;
    for (const hit of result2.hits) {
      const doc = hit.document;
      list.push({
        id: hit.id,
        type: "page",
        content: highlighter.highlightMarkdown(doc.title),
        url: doc.path
      }, {
        id: "page" + hit.id,
        type: "text",
        content: highlighter.highlightMarkdown(doc.content),
        url: doc.path
      });
    }
    return list;
  }
  const params = {
    ...extraParams,
    term: query,
    where: removeUndefined({
      tag,
      ...extraParams.where
    }),
    groupBy: {
      properties: ["page_id"],
      maxResult: 7,
      ...extraParams.groupBy
    }
  };
  const result = await client.search(params);
  if (!result || !result.groups) return list;
  for (const item of result.groups) {
    let addedHead = false;
    for (const hit of item.result) {
      const doc = hit.document;
      if (!addedHead) {
        list.push({
          id: doc.page_id,
          type: "page",
          content: highlighter.highlightMarkdown(doc.title),
          breadcrumbs: doc.breadcrumbs,
          url: doc.url
        });
        addedHead = true;
      }
      list.push({
        id: doc.id,
        content: highlighter.highlightMarkdown(doc.content),
        type: doc.content === doc.section ? "heading" : "text",
        url: doc.section_id ? `${doc.url}#${doc.section_id}` : doc.url
      });
    }
  }
  return list;
}
export {
  searchDocs
};
