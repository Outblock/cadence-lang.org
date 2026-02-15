import { u as unified } from "./unified.mjs";
import { r as remarkParse } from "./remark-parse.mjs";
import { r as remarkStringify } from "./remark-stringify.mjs";
const remark = unified().use(remarkParse).use(remarkStringify).freeze();
export {
  remark as r
};
