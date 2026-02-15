import{j as n}from"./main-BXy83AsK.js";let o=`

Introduction [#introduction]

The Cadence Programming Language is a new high-level programming language intended for smart contract development.

The language's goals are, in order of importance:

* **Safety and security** — Provide a strong static type system, design by contract (preconditions and postconditions), and resources (inspired by linear types).
* **Auditability** — Focus on readability: Make it easy to verify what the code is doing, and make intentions explicit, at a small cost of verbosity.
* **Simplicity** — Focus on developer productivity and usability: Make it easy to write code and provide good tooling.

Terminology [#terminology]

In this document, the following terminology is used to describe syntax or behavior that is not allowed in the language:

* \`Invalid\` means that the invalid program will not even be allowed to run. The program error is detected and reported statically by the type checker.
* \`Run-time error\` means that the erroneous program will run, but bad behavior will result in the execution of the program being aborted.

Syntax and behavior [#syntax-and-behavior]

Much of the language's syntax is inspired by Swift, Kotlin, and TypeScript.

* Much of the syntax, types, and standard library is inspired by Swift, which popularized features including optionals and argument labels, and provides safe handling of integers and strings.
* Resources are based on linear types which were popularized by Rust.
* Events are inspired by Solidity.

:::note
In real Cadence code, all type definitions and code must be declared and contained in [contracts] or [transactions], but we omit these containers in examples for simplicity.
:::

{/* Relative links. Will not render on the page */}

[contracts]: ./contracts

[transactions]: ./transactions
`,r={title:"The Cadence Programming Language"},s={contents:[{heading:"introduction",content:"The Cadence Programming Language is a new high-level programming language intended for smart contract development."},{heading:"introduction",content:"The language's goals are, in order of importance:"},{heading:"introduction",content:"**Safety and security** — Provide a strong static type system, design by contract (preconditions and postconditions), and resources (inspired by linear types)."},{heading:"introduction",content:"**Auditability** — Focus on readability: Make it easy to verify what the code is doing, and make intentions explicit, at a small cost of verbosity."},{heading:"introduction",content:"**Simplicity** — Focus on developer productivity and usability: Make it easy to write code and provide good tooling."},{heading:"terminology",content:"In this document, the following terminology is used to describe syntax or behavior that is not allowed in the language:"},{heading:"terminology",content:"`Invalid` means that the invalid program will not even be allowed to run. The program error is detected and reported statically by the type checker."},{heading:"terminology",content:"`Run-time error` means that the erroneous program will run, but bad behavior will result in the execution of the program being aborted."},{heading:"syntax-and-behavior",content:"Much of the language's syntax is inspired by Swift, Kotlin, and TypeScript."},{heading:"syntax-and-behavior",content:"Much of the syntax, types, and standard library is inspired by Swift, which popularized features including optionals and argument labels, and provides safe handling of integers and strings."},{heading:"syntax-and-behavior",content:"Resources are based on linear types which were popularized by Rust."},{heading:"syntax-and-behavior",content:"Events are inspired by Solidity."},{heading:"syntax-and-behavior",content:`:::note
In real Cadence code, all type definitions and code must be declared and contained in [contracts] or [transactions], but we omit these containers in examples for simplicity.
:::`}],headings:[{id:"introduction",content:"Introduction"},{id:"terminology",content:"Terminology"},{id:"syntax-and-behavior",content:"Syntax and behavior"}]};const d=[{depth:2,url:"#introduction",title:n.jsx(n.Fragment,{children:"Introduction"})},{depth:2,url:"#terminology",title:n.jsx(n.Fragment,{children:"Terminology"})},{depth:2,url:"#syntax-and-behavior",title:n.jsx(n.Fragment,{children:"Syntax and behavior"})}];function i(t){const e={a:"a",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...t.components};return n.jsxs(n.Fragment,{children:[n.jsx(e.h2,{id:"introduction",children:"Introduction"}),`
`,n.jsx(e.p,{children:"The Cadence Programming Language is a new high-level programming language intended for smart contract development."}),`
`,n.jsx(e.p,{children:"The language's goals are, in order of importance:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Safety and security"})," — Provide a strong static type system, design by contract (preconditions and postconditions), and resources (inspired by linear types)."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Auditability"})," — Focus on readability: Make it easy to verify what the code is doing, and make intentions explicit, at a small cost of verbosity."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Simplicity"})," — Focus on developer productivity and usability: Make it easy to write code and provide good tooling."]}),`
`]}),`
`,n.jsx(e.h2,{id:"terminology",children:"Terminology"}),`
`,n.jsx(e.p,{children:"In this document, the following terminology is used to describe syntax or behavior that is not allowed in the language:"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"Invalid"})," means that the invalid program will not even be allowed to run. The program error is detected and reported statically by the type checker."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"Run-time error"})," means that the erroneous program will run, but bad behavior will result in the execution of the program being aborted."]}),`
`]}),`
`,n.jsx(e.h2,{id:"syntax-and-behavior",children:"Syntax and behavior"}),`
`,n.jsx(e.p,{children:"Much of the language's syntax is inspired by Swift, Kotlin, and TypeScript."}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Much of the syntax, types, and standard library is inspired by Swift, which popularized features including optionals and argument labels, and provides safe handling of integers and strings."}),`
`,n.jsx(e.li,{children:"Resources are based on linear types which were popularized by Rust."}),`
`,n.jsx(e.li,{children:"Events are inspired by Solidity."}),`
`]}),`
`,n.jsxs(e.p,{children:[`:::note
In real Cadence code, all type definitions and code must be declared and contained in `,n.jsx(e.a,{href:"./contracts",children:"contracts"})," or ",n.jsx(e.a,{href:"./transactions",children:"transactions"}),`, but we omit these containers in examples for simplicity.
:::`]}),`
`]})}function l(t={}){const{wrapper:e}=t.components||{};return e?n.jsx(e,{...t,children:n.jsx(i,{...t})}):i(t)}export{o as _markdown,l as default,r as frontmatter,s as structuredData,d as toc};
