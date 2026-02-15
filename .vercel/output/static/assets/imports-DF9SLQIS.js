import{j as e}from"./main-BXy83AsK.js";let s=`

Programs can import declarations (types, functions, variables, and so on) from other programs.

Importing contracts [#importing-contracts]

Imports are declared using the \`import\` keyword. You can import your contracts using **one** of the following three options:

1. Import your contracts by name, which you must use if you're using the [Flow CLI]. For example:

   \`\`\`cadence
   import "HelloWorld"
   \`\`\`

   This will automatically import the contract, based on the configuration found \`flow.json\`. It will automatically handle address changes between mainnet, testnet, and emulator, as long as those are present in \`flow.json\`.

2. Import your contracts by an address, which imports all declarations. Both [Flow playground] and [Flow runner] require importing by address.

3. Import your contracts by the names of the declarations that should be imported, followed by the \`from\` keyword, and then followed by the address.

   * If importing a local file, the location is a string literal, as well as the path to the file. Deployment of code with file imports requires usage of the [Flow CLI].
   * If importing an external type in a different account, the location is an address literal, as well as the address of the account where the declarations are deployed to and published.

   \`\`\`cadence
   // Import the type \`Counter\` from a local file.
   //
   import Counter from "./examples/counter.cdc"

   // Import the type \`Counter\` from an external account.
   //
   import Counter from 0x299F20A29311B9248F12
   \`\`\`

{/* Relative links. Will not render on the page */}

[Flow CLI]: https://developers.flow.com/tools/flow-cli/index.md

[Flow playground]: https://play.flow.com/

[Flow runner]: https://run.dnz.dev/
`,r={title:"Imports"},a={contents:[{heading:void 0,content:"Programs can import declarations (types, functions, variables, and so on) from other programs."},{heading:"importing-contracts",content:"Imports are declared using the `import` keyword. You can import your contracts using **one** of the following three options:"},{heading:"importing-contracts",content:"Import your contracts by name, which you must use if you're using the [Flow CLI]. For example:"},{heading:"importing-contracts",content:"This will automatically import the contract, based on the configuration found `flow.json`. It will automatically handle address changes between mainnet, testnet, and emulator, as long as those are present in `flow.json`."},{heading:"importing-contracts",content:"Import your contracts by an address, which imports all declarations. Both [Flow playground] and [Flow runner] require importing by address."},{heading:"importing-contracts",content:"Import your contracts by the names of the declarations that should be imported, followed by the `from` keyword, and then followed by the address."},{heading:"importing-contracts",content:"If importing a local file, the location is a string literal, as well as the path to the file. Deployment of code with file imports requires usage of the [Flow CLI]."},{heading:"importing-contracts",content:"If importing an external type in a different account, the location is an address literal, as well as the address of the account where the declarations are deployed to and published."}],headings:[{id:"importing-contracts",content:"Importing contracts"}]};const l=[{depth:2,url:"#importing-contracts",title:e.jsx(e.Fragment,{children:"Importing contracts"})}];function o(t){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"Programs can import declarations (types, functions, variables, and so on) from other programs."}),`
`,e.jsx(n.h2,{id:"importing-contracts",children:"Importing contracts"}),`
`,e.jsxs(n.p,{children:["Imports are declared using the ",e.jsx(n.code,{children:"import"})," keyword. You can import your contracts using ",e.jsx(n.strong,{children:"one"})," of the following three options:"]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Import your contracts by name, which you must use if you're using the ",e.jsx(n.a,{href:"https://developers.flow.com/tools/flow-cli/index.md",children:"Flow CLI"}),". For example:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "HelloWorld"'})]})})})}),`
`,e.jsxs(n.p,{children:["This will automatically import the contract, based on the configuration found ",e.jsx(n.code,{children:"flow.json"}),". It will automatically handle address changes between mainnet, testnet, and emulator, as long as those are present in ",e.jsx(n.code,{children:"flow.json"}),"."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Import your contracts by an address, which imports all declarations. Both ",e.jsx(n.a,{href:"https://play.flow.com/",children:"Flow playground"})," and ",e.jsx(n.a,{href:"https://run.dnz.dev/",children:"Flow runner"})," require importing by address."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Import your contracts by the names of the declarations that should be imported, followed by the ",e.jsx(n.code,{children:"from"})," keyword, and then followed by the address."]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["If importing a local file, the location is a string literal, as well as the path to the file. Deployment of code with file imports requires usage of the ",e.jsx(n.a,{href:"https://developers.flow.com/tools/flow-cli/index.md",children:"Flow CLI"}),"."]}),`
`,e.jsx(n.li,{children:"If importing an external type in a different account, the location is an address literal, as well as the address of the account where the declarations are deployed to and published."}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Import the type `Counter` from a local file."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Counter"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "./examples/counter.cdc"'})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Import the type `Counter` from an external account."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Counter"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x299F20A29311B9248F12"})]})]})})}),`
`]}),`
`]}),`
`]})}function h(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(o,{...t})}):o(t)}export{s as _markdown,h as default,r as frontmatter,a as structuredData,l as toc};
