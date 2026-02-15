import{j as i}from"./main-BXy83AsK.js";let t=`

When declaring a constant or variable, an optional *type annotation* can be provided, to make it explicit what type the declaration has.

If no type annotation is provided, the type of the declaration is [inferred from the initial value].

For function parameters, a type annotation must be provided:

\`\`\`cadence
// Declare a variable named \`boolVarWithAnnotation\`, which has an explicit type annotation.
//
// \`Bool\` is the type of booleans.
//
var boolVarWithAnnotation: Bool = false

// Declare a constant named \`integerWithoutAnnotation\`, which has no type annotation
// and for which the type is inferred to be \`Int\`, the type of arbitrary-precision integers.
//
// This is based on the initial value which is an integer literal.
// Integer literals are always inferred to be of type \`Int\`.
//
let integerWithoutAnnotation = 1

// Declare a constant named \`smallIntegerWithAnnotation\`, which has an explicit type annotation.
// Because of the explicit type annotation, the type is not inferred.
// This declaration is valid because the integer literal \`1\` fits into the range of the type \`Int8\`,
// the type of 8-bit signed integers.
//
let smallIntegerWithAnnotation: Int8 = 1
\`\`\`

If a type annotation is provided, the initial value must be of this type. All new values assigned to variables must match their type. This type safety is explained in more detail in [this article]:

\`\`\`cadence
// Invalid: declare a variable with an explicit type \`Bool\`,
// but the initial value has type \`Int\`.
//
let booleanConstant: Bool = 1

// Declare a variable that has the inferred type \`Bool\`.
//
var booleanVariable = false

// Invalid: assign a value with type \`Int\` to a variable which has the inferred type \`Bool\`.
//
booleanVariable = 1
\`\`\`

{/* Relative links. Will not render on the page */}

[inferred from the initial value]: ./type-inference

[this article]: ./type-safety
`,l={title:"Type Annotations"},h={contents:[{heading:void 0,content:"When declaring a constant or variable, an optional *type annotation* can be provided, to make it explicit what type the declaration has."},{heading:void 0,content:"If no type annotation is provided, the type of the declaration is [inferred from the initial value]."},{heading:void 0,content:"For function parameters, a type annotation must be provided:"},{heading:void 0,content:"If a type annotation is provided, the initial value must be of this type. All new values assigned to variables must match their type. This type safety is explained in more detail in [this article]:"}],headings:[]};const r=[];function s(n){const e={a:"a",code:"code",em:"em",p:"p",pre:"pre",span:"span",...n.components};return i.jsxs(i.Fragment,{children:[i.jsxs(e.p,{children:["When declaring a constant or variable, an optional ",i.jsx(e.em,{children:"type annotation"})," can be provided, to make it explicit what type the declaration has."]}),`
`,i.jsxs(e.p,{children:["If no type annotation is provided, the type of the declaration is ",i.jsx(e.a,{href:"./type-inference",children:"inferred from the initial value"}),"."]}),`
`,i.jsx(e.p,{children:"For function parameters, a type annotation must be provided:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a variable named `boolVarWithAnnotation`, which has an explicit type annotation."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// `Bool` is the type of booleans."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" boolVarWithAnnotation: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"false"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a constant named `integerWithoutAnnotation`, which has no type annotation"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// and for which the type is inferred to be `Int`, the type of arbitrary-precision integers."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This is based on the initial value which is an integer literal."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Integer literals are always inferred to be of type `Int`."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" integerWithoutAnnotation = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a constant named `smallIntegerWithAnnotation`, which has an explicit type annotation."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Because of the explicit type annotation, the type is not inferred."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This declaration is valid because the integer literal `1` fits into the range of the type `Int8`,"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// the type of 8-bit signed integers."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" smallIntegerWithAnnotation: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]})]})})}),`
`,i.jsxs(e.p,{children:["If a type annotation is provided, the initial value must be of this type. All new values assigned to variables must match their type. This type safety is explained in more detail in ",i.jsx(e.a,{href:"./type-safety",children:"this article"}),":"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: declare a variable with an explicit type `Bool`,"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// but the initial value has type `Int`."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" booleanConstant: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a variable that has the inferred type `Bool`."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" booleanVariable = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"false"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: assign a value with type `Int` to a variable which has the inferred type `Bool`."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"booleanVariable = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]})]})})}),`
`]})}function o(n={}){const{wrapper:e}=n.components||{};return e?i.jsx(e,{...n,children:i.jsx(s,{...n})}):s(n)}export{t as _markdown,o as default,l as frontmatter,h as structuredData,r as toc};
