import { d as distExports } from "../_libs/path-to-regexp.mjs";
import { F as redirect } from "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
const createMiddleware = (options, __opts) => {
  const resolvedOptions = {
    type: "request",
    ...__opts || options
  };
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createMiddleware(
        {},
        Object.assign(resolvedOptions, { middleware })
      );
    },
    inputValidator: (inputValidator) => {
      return createMiddleware(
        {},
        Object.assign(resolvedOptions, { inputValidator })
      );
    },
    client: (client) => {
      return createMiddleware(
        {},
        Object.assign(resolvedOptions, { client })
      );
    },
    server: (server) => {
      return createMiddleware(
        {},
        Object.assign(resolvedOptions, { server })
      );
    }
  };
};
function dedupeSerializationAdapters(deduped, serializationAdapters) {
  for (let i = 0, len = serializationAdapters.length; i < len; i++) {
    const current = serializationAdapters[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) {
        dedupeSerializationAdapters(deduped, current.extends);
      }
    }
  }
}
const createStart = (getOptions) => {
  return {
    getOptions: async () => {
      const options = await getOptions();
      if (options.serializationAdapters) {
        const deduped = /* @__PURE__ */ new Set();
        dedupeSerializationAdapters(
          deduped,
          options.serializationAdapters
        );
        options.serializationAdapters = Array.from(deduped);
      }
      return options;
    },
    createMiddleware
  };
};
function rewritePath(source, destination) {
  const matcher = distExports.match(source, { decode: false });
  const compiler = distExports.compile(destination, { encode: false });
  return { rewrite(pathname) {
    const result = matcher(pathname);
    if (!result) return false;
    return compiler(result.params);
  } };
}
const { rewrite: rewriteLLM } = rewritePath(
  "/docs{/*path}.mdx",
  "/llms.mdx/docs{/*path}"
);
const llmMiddleware = createMiddleware().server(({ next, request }) => {
  const url = new URL(request.url);
  const path = rewriteLLM(url.pathname);
  if (path) {
    throw redirect({ href: new URL(path, url).toString() });
  }
  return next();
});
const startInstance = createStart(() => {
  return {
    requestMiddleware: [llmMiddleware]
  };
});
export {
  startInstance
};
