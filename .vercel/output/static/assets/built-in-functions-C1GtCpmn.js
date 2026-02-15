import{j as e}from"./main-BXy83AsK.js";let r=`

The following describes Cadence's built in functions. Examples are also provided.

panic [#panic]

\`\`\`cadence
view fun panic(_ message: String): Never
\`\`\`

Terminates the program unconditionally and reports a message, which explains why the unrecoverable error occurred.

\`\`\`cadence
panic("something went wrong: ...")
\`\`\`

assert [#assert]

\`\`\`cadence
view fun assert(_ condition: Bool, message: String)
\`\`\`

Terminates the program if the given condition is false, and reports a message that explains how the condition is false. Use this function for internal sanity checks.

The message argument is optional.

revertibleRandom [#revertiblerandom]

\`\`\`cadence
view fun revertibleRandom<T: FixedSizeUnsignedInteger>(modulo: T): T
\`\`\`

Returns a pseudo-random integer.

\`T\` can be any fixed-size unsigned integer type (\`FixedSizeUnsignedInteger\`, i.e., \`UInt8\`, \`UInt16\`, \`UInt32\`, \`UInt64\`, \`UInt128\`, \`UInt256\`, \`Word8\`, \`Word16\`, \`Word32\`, \`Word64\`, \`Word128\`, or \`Word256\`).

The modulo argument is optional. If provided, the returned integer is between \`0\` and \`modulo -1\`. If not provided, the returned integer is between \`0\` and the maximum value of \`T\`. The function errors if \`modulo\` is equal to 0.

The sequence of returned random numbers is independent for every transaction in each block. Under the hood, Cadence instantiates a cryptographically-secure pseudo-random number generator (CSPRG) for each transaction independently, where the seeds of any two transactions are different with near certainty.

The random numbers returned are unpredictable (unpredictable for miners at block construction time, and unpredictable for cadence logic at time of call), verifiable, as well as *unbiasable* by miners and previously-running Cadence code. See [Secure random number generator for Flow’s smart contracts] and [FLIP120] for more details.

Nevertheless, developers need to be mindful to use \`revertibleRandom()\` correctly.

:::danger
A transaction can atomically revert all of its action. This means that if you're letting users submit transactions, as opposed to you submitting them on your backend with a wallet you control, those users can submit the transaction in such a way that it reverts if the user doesn't like the outcome.
:::
The function usage remains safe when called by a trusted party that does not perform post-selection on the returned random numbers.

This limitation is inherent to any smart contract platform that allows transactions to roll back atomically and cannot be solved through safe randomness alone. In cases where a non-trusted party can interact through their own transactions with smart contracts generating random numbers, it is recommended to use [commit-reveal schemes].

RLP [#rlp]

Recursive Length Prefix (RLP) serialization allows the encoding of arbitrarily nested arrays of binary data.

Cadence provides RLP decoding functions in the built-in \`RLP\` contract, which does not need to be imported.

decodeString [#decodestring]

\`\`\`cadence
view fun decodeString(_ input: [UInt8]): [UInt8]
\`\`\`

Decodes an RLP-encoded byte array. RLP calls this a *string*. The byte array should only contain a single encoded value for a string.

* If the encoded value type does not match or if it has trailing unnecessary bytes, the program aborts.
* If the function encounters any error while decoding, the program aborts.

decodeList [#decodelist]

\`\`\`cadence
view fun decodeList(_ input: [UInt8]): [[UInt8]]\`
\`\`\`

Decodes an RLP-encoded list into an array of RLP-encoded items.

Note that this function does not recursively decode, so each element of the resulting array is RLP-encoded data. The byte array should only contain a single encoded value for a list.

* If the encoded value type does not match or if it has trailing unnecessary bytes, the program aborts.
* If the function encounters any error while decoding, the program aborts.

{/* Relative links. Will not render on the page */}

[Secure random number generator for Flow’s smart contracts]: https://forum.flow.com/t/secure-random-number-generator-for-flow-s-smart-contracts/5110

[FLIP120]: https://github.com/onflow/flips/pull/120

[commit-reveal schemes]: https://developers.flow.com/tutorials/native-vrf/commit-reveal-cadence

[tentative example]: https://github.com/onflow/flips/blob/main/protocol/20230728-commit-reveal.md#tutorials-and-examples
`,a={title:"Built-in Functions"},o={contents:[{heading:void 0,content:"The following describes Cadence's built in functions. Examples are also provided."},{heading:"panic",content:"Terminates the program unconditionally and reports a message, which explains why the unrecoverable error occurred."},{heading:"assert",content:"Terminates the program if the given condition is false, and reports a message that explains how the condition is false. Use this function for internal sanity checks."},{heading:"assert",content:"The message argument is optional."},{heading:"revertiblerandom",content:"Returns a pseudo-random integer."},{heading:"revertiblerandom",content:"`T` can be any fixed-size unsigned integer type (`FixedSizeUnsignedInteger`, i.e., `UInt8`, `UInt16`, `UInt32`, `UInt64`, `UInt128`, `UInt256`, `Word8`, `Word16`, `Word32`, `Word64`, `Word128`, or `Word256`)."},{heading:"revertiblerandom",content:"The modulo argument is optional. If provided, the returned integer is between `0` and `modulo -1`. If not provided, the returned integer is between `0` and the maximum value of `T`. The function errors if `modulo` is equal to 0."},{heading:"revertiblerandom",content:"The sequence of returned random numbers is independent for every transaction in each block. Under the hood, Cadence instantiates a cryptographically-secure pseudo-random number generator (CSPRG) for each transaction independently, where the seeds of any two transactions are different with near certainty."},{heading:"revertiblerandom",content:"The random numbers returned are unpredictable (unpredictable for miners at block construction time, and unpredictable for cadence logic at time of call), verifiable, as well as *unbiasable* by miners and previously-running Cadence code. See [Secure random number generator for Flow’s smart contracts] and [FLIP120] for more details."},{heading:"revertiblerandom",content:"Nevertheless, developers need to be mindful to use `revertibleRandom()` correctly."},{heading:"revertiblerandom",content:`:::danger
A transaction can atomically revert all of its action. This means that if you're letting users submit transactions, as opposed to you submitting them on your backend with a wallet you control, those users can submit the transaction in such a way that it reverts if the user doesn't like the outcome.
:::
The function usage remains safe when called by a trusted party that does not perform post-selection on the returned random numbers.`},{heading:"revertiblerandom",content:"This limitation is inherent to any smart contract platform that allows transactions to roll back atomically and cannot be solved through safe randomness alone. In cases where a non-trusted party can interact through their own transactions with smart contracts generating random numbers, it is recommended to use [commit-reveal schemes]."},{heading:"rlp",content:"Recursive Length Prefix (RLP) serialization allows the encoding of arbitrarily nested arrays of binary data."},{heading:"rlp",content:"Cadence provides RLP decoding functions in the built-in `RLP` contract, which does not need to be imported."},{heading:"decodestring",content:"Decodes an RLP-encoded byte array. RLP calls this a *string*. The byte array should only contain a single encoded value for a string."},{heading:"decodestring",content:"If the encoded value type does not match or if it has trailing unnecessary bytes, the program aborts."},{heading:"decodestring",content:"If the function encounters any error while decoding, the program aborts."},{heading:"decodelist",content:"Decodes an RLP-encoded list into an array of RLP-encoded items."},{heading:"decodelist",content:"Note that this function does not recursively decode, so each element of the resulting array is RLP-encoded data. The byte array should only contain a single encoded value for a list."},{heading:"decodelist",content:"If the encoded value type does not match or if it has trailing unnecessary bytes, the program aborts."},{heading:"decodelist",content:"If the function encounters any error while decoding, the program aborts."}],headings:[{id:"panic",content:"`panic`"},{id:"assert",content:"`assert`"},{id:"revertiblerandom",content:"`revertibleRandom`"},{id:"rlp",content:"`RLP`"},{id:"decodestring",content:"`decodeString`"},{id:"decodelist",content:"`decodeList`"}]};const d=[{depth:2,url:"#panic",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"panic"})})},{depth:2,url:"#assert",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"assert"})})},{depth:2,url:"#revertiblerandom",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"revertibleRandom"})})},{depth:2,url:"#rlp",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"RLP"})})},{depth:3,url:"#decodestring",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"decodeString"})})},{depth:3,url:"#decodelist",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"decodeList"})})}];function t(i){const n={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:"The following describes Cadence's built in functions. Examples are also provided."}),`
`,e.jsx(n.h2,{id:"panic",children:e.jsx(n.code,{children:"panic"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"view "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ message: "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Never"})]})})})}),`
`,e.jsx(n.p,{children:"Terminates the program unconditionally and reports a message, which explains why the unrecoverable error occurred."}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"panic"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"something went wrong: ..."'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`,e.jsx(n.h2,{id:"assert",children:e.jsx(n.code,{children:"assert"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"view "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" assert"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ condition: "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", message: "}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`,e.jsx(n.p,{children:"Terminates the program if the given condition is false, and reports a message that explains how the condition is false. Use this function for internal sanity checks."}),`
`,e.jsx(n.p,{children:"The message argument is optional."}),`
`,e.jsx(n.h2,{id:"revertiblerandom",children:e.jsx(n.code,{children:"revertibleRandom"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"view "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" revertibleRandom"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FixedSizeUnsignedInteger"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(modulo: "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"T"})]})})})}),`
`,e.jsx(n.p,{children:"Returns a pseudo-random integer."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"T"})," can be any fixed-size unsigned integer type (",e.jsx(n.code,{children:"FixedSizeUnsignedInteger"}),", i.e., ",e.jsx(n.code,{children:"UInt8"}),", ",e.jsx(n.code,{children:"UInt16"}),", ",e.jsx(n.code,{children:"UInt32"}),", ",e.jsx(n.code,{children:"UInt64"}),", ",e.jsx(n.code,{children:"UInt128"}),", ",e.jsx(n.code,{children:"UInt256"}),", ",e.jsx(n.code,{children:"Word8"}),", ",e.jsx(n.code,{children:"Word16"}),", ",e.jsx(n.code,{children:"Word32"}),", ",e.jsx(n.code,{children:"Word64"}),", ",e.jsx(n.code,{children:"Word128"}),", or ",e.jsx(n.code,{children:"Word256"}),")."]}),`
`,e.jsxs(n.p,{children:["The modulo argument is optional. If provided, the returned integer is between ",e.jsx(n.code,{children:"0"})," and ",e.jsx(n.code,{children:"modulo -1"}),". If not provided, the returned integer is between ",e.jsx(n.code,{children:"0"})," and the maximum value of ",e.jsx(n.code,{children:"T"}),". The function errors if ",e.jsx(n.code,{children:"modulo"})," is equal to 0."]}),`
`,e.jsx(n.p,{children:"The sequence of returned random numbers is independent for every transaction in each block. Under the hood, Cadence instantiates a cryptographically-secure pseudo-random number generator (CSPRG) for each transaction independently, where the seeds of any two transactions are different with near certainty."}),`
`,e.jsxs(n.p,{children:["The random numbers returned are unpredictable (unpredictable for miners at block construction time, and unpredictable for cadence logic at time of call), verifiable, as well as ",e.jsx(n.em,{children:"unbiasable"})," by miners and previously-running Cadence code. See ",e.jsx(n.a,{href:"https://forum.flow.com/t/secure-random-number-generator-for-flow-s-smart-contracts/5110",children:"Secure random number generator for Flow’s smart contracts"})," and ",e.jsx(n.a,{href:"https://github.com/onflow/flips/pull/120",children:"FLIP120"})," for more details."]}),`
`,e.jsxs(n.p,{children:["Nevertheless, developers need to be mindful to use ",e.jsx(n.code,{children:"revertibleRandom()"})," correctly."]}),`
`,e.jsx(n.p,{children:`:::danger
A transaction can atomically revert all of its action. This means that if you're letting users submit transactions, as opposed to you submitting them on your backend with a wallet you control, those users can submit the transaction in such a way that it reverts if the user doesn't like the outcome.
:::
The function usage remains safe when called by a trusted party that does not perform post-selection on the returned random numbers.`}),`
`,e.jsxs(n.p,{children:["This limitation is inherent to any smart contract platform that allows transactions to roll back atomically and cannot be solved through safe randomness alone. In cases where a non-trusted party can interact through their own transactions with smart contracts generating random numbers, it is recommended to use ",e.jsx(n.a,{href:"https://developers.flow.com/tutorials/native-vrf/commit-reveal-cadence",children:"commit-reveal schemes"}),"."]}),`
`,e.jsx(n.h2,{id:"rlp",children:e.jsx(n.code,{children:"RLP"})}),`
`,e.jsx(n.p,{children:"Recursive Length Prefix (RLP) serialization allows the encoding of arbitrarily nested arrays of binary data."}),`
`,e.jsxs(n.p,{children:["Cadence provides RLP decoding functions in the built-in ",e.jsx(n.code,{children:"RLP"})," contract, which does not need to be imported."]}),`
`,e.jsx(n.h3,{id:"decodestring",children:e.jsx(n.code,{children:"decodeString"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"view "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" decodeString"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ input: ["}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]): ["}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]})})})}),`
`,e.jsxs(n.p,{children:["Decodes an RLP-encoded byte array. RLP calls this a ",e.jsx(n.em,{children:"string"}),". The byte array should only contain a single encoded value for a string."]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"If the encoded value type does not match or if it has trailing unnecessary bytes, the program aborts."}),`
`,e.jsx(n.li,{children:"If the function encounters any error while decoding, the program aborts."}),`
`]}),`
`,e.jsx(n.h3,{id:"decodelist",children:e.jsx(n.code,{children:"decodeList"})}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"view "}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" decodeList"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ input: ["}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]): [["}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]]`"})]})})})}),`
`,e.jsx(n.p,{children:"Decodes an RLP-encoded list into an array of RLP-encoded items."}),`
`,e.jsx(n.p,{children:"Note that this function does not recursively decode, so each element of the resulting array is RLP-encoded data. The byte array should only contain a single encoded value for a list."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"If the encoded value type does not match or if it has trailing unnecessary bytes, the program aborts."}),`
`,e.jsx(n.li,{children:"If the function encounters any error while decoding, the program aborts."}),`
`]}),`
`]})}function h(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{r as _markdown,h as default,a as frontmatter,o as structuredData,d as toc};
