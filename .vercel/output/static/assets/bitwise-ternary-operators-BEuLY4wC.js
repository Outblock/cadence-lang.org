import{j as i}from"./main-BXy83AsK.js";let r=`

Bitwise operators [#bitwise-operators]

Bitwise operators enable the manipulation of individual bits of unsigned and signed integers. They're often used in low-level programming.

* Bitwise AND: \`a & b\`

  Returns a new integer whose bits are 1 only if the bits were 1 in *both* input integers:

  \`\`\`cadence
  let firstFiveBits = 0b11111000
  let lastFiveBits  = 0b00011111
  let middleTwoBits = firstFiveBits & lastFiveBits  // is 0b00011000
  \`\`\`

* Bitwise OR: \`a | b\`

  Returns a new integer whose bits are 1 only if the bits were 1 in *either* input integers:

  \`\`\`cadence
  let someBits = 0b10110010
  let moreBits = 0b01011110
  let combinedbits = someBits | moreBits  // is 0b11111110
  \`\`\`

* Bitwise XOR: \`a ^ b\`

  Returns a new integer whose bits are 1 where the input bits are different, and are 0 where the input bits are the same:

  \`\`\`cadence
  let firstBits = 0b00010100
  let otherBits = 0b00000101
  let outputBits = firstBits ^ otherBits  // is 0b00010001
  \`\`\`

Bitwise shifting operators [#bitwise-shifting-operators]

* Bitwise LEFT SHIFT: \`a << b\`

  Returns a new integer with all bits moved to the left by a certain number of places:

  \`\`\`cadence
  let someBits = 4  // is 0b00000100
  let shiftedBits = someBits << 2   // is 0b00010000
  \`\`\`

* Bitwise RIGHT SHIFT: \`a >> b\`

  Returns a new integer with all bits moved to the right by a certain number of places:

  \`\`\`cadence
  let someBits = 8  // is 0b00001000
  let shiftedBits = someBits >> 2   // is 0b00000010
  \`\`\`

For unsigned integers, the bitwise shifting operators perform [logical shifting]; for signed integers, they perform [arithmetic shifting]. Also note that for \`a << b\` or \`a >> b\`, \`b\` must fit into a 64-bit integer.

Ternary conditional operator [#ternary-conditional-operator]

There is only one ternary conditional operator (e.g., \`a ? b : c\`).

It behaves like an if-statement, but is an expression: if the first operator value is true, the second operator value is returned. If the first operator value is false, the third value is returned.

The first value must be a boolean, or resolve to one (and must have the type \`Bool\`). The second value and third value can be of any type. The result type is the least common supertype of the second and third value.

\`\`\`cadence
let x = 1 > 2 ? 3 : 4
// \`x\` is \`4\` and has type \`Int\`

let y = 1 > 2 ? nil : 3
// \`y\` is \`3\` and has type \`Int?\`
\`\`\`

{/* Relative links. Will not render on the page */}

[logical shifting]: https://en.wikipedia.org/wiki/Logical_shift

[arithmetic shifting]: https://en.wikipedia.org/wiki/Arithmetic_shift
`,h={title:"Bitwise and Ternary Conditional Operators"},a={contents:[{heading:"bitwise-operators",content:"Bitwise operators enable the manipulation of individual bits of unsigned and signed integers. They're often used in low-level programming."},{heading:"bitwise-operators",content:"Bitwise AND: `a & b`"},{heading:"bitwise-operators",content:"Returns a new integer whose bits are 1 only if the bits were 1 in *both* input integers:"},{heading:"bitwise-operators",content:"Bitwise OR: `a | b`"},{heading:"bitwise-operators",content:"Returns a new integer whose bits are 1 only if the bits were 1 in *either* input integers:"},{heading:"bitwise-operators",content:"Bitwise XOR: `a ^ b`"},{heading:"bitwise-operators",content:"Returns a new integer whose bits are 1 where the input bits are different, and are 0 where the input bits are the same:"},{heading:"bitwise-shifting-operators",content:"Bitwise LEFT SHIFT: `a << b`"},{heading:"bitwise-shifting-operators",content:"Returns a new integer with all bits moved to the left by a certain number of places:"},{heading:"bitwise-shifting-operators",content:"Bitwise RIGHT SHIFT: `a >> b`"},{heading:"bitwise-shifting-operators",content:"Returns a new integer with all bits moved to the right by a certain number of places:"},{heading:"bitwise-shifting-operators",content:"For unsigned integers, the bitwise shifting operators perform [logical shifting]; for signed integers, they perform [arithmetic shifting]. Also note that for `a << b` or `a >> b`, `b` must fit into a 64-bit integer."},{heading:"ternary-conditional-operator",content:"There is only one ternary conditional operator (e.g., `a ? b : c`)."},{heading:"ternary-conditional-operator",content:"It behaves like an if-statement, but is an expression: if the first operator value is true, the second operator value is returned. If the first operator value is false, the third value is returned."},{heading:"ternary-conditional-operator",content:"The first value must be a boolean, or resolve to one (and must have the type `Bool`). The second value and third value can be of any type. The result type is the least common supertype of the second and third value."}],headings:[{id:"bitwise-operators",content:"Bitwise operators"},{id:"bitwise-shifting-operators",content:"Bitwise shifting operators"},{id:"ternary-conditional-operator",content:"Ternary conditional operator"}]};const l=[{depth:2,url:"#bitwise-operators",title:i.jsx(i.Fragment,{children:"Bitwise operators"})},{depth:3,url:"#bitwise-shifting-operators",title:i.jsx(i.Fragment,{children:"Bitwise shifting operators"})},{depth:2,url:"#ternary-conditional-operator",title:i.jsx(i.Fragment,{children:"Ternary conditional operator"})}];function t(s){const e={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsx(e.h2,{id:"bitwise-operators",children:"Bitwise operators"}),`
`,i.jsx(e.p,{children:"Bitwise operators enable the manipulation of individual bits of unsigned and signed integers. They're often used in low-level programming."}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Bitwise AND: ",i.jsx(e.code,{children:"a & b"})]}),`
`,i.jsxs(e.p,{children:["Returns a new integer whose bits are 1 only if the bits were 1 in ",i.jsx(e.em,{children:"both"})," input integers:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" firstFiveBits = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0b11111000"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" lastFiveBits  = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0b00011111"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" middleTwoBits = firstFiveBits & lastFiveBits  "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// is 0b00011000"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Bitwise OR: ",i.jsx(e.code,{children:"a | b"})]}),`
`,i.jsxs(e.p,{children:["Returns a new integer whose bits are 1 only if the bits were 1 in ",i.jsx(e.em,{children:"either"})," input integers:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" someBits = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0b10110010"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" moreBits = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0b01011110"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" combinedbits = someBits | moreBits  "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// is 0b11111110"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Bitwise XOR: ",i.jsx(e.code,{children:"a ^ b"})]}),`
`,i.jsx(e.p,{children:"Returns a new integer whose bits are 1 where the input bits are different, and are 0 where the input bits are the same:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" firstBits = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0b00010100"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" otherBits = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0b00000101"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" outputBits = firstBits ^ otherBits  "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// is 0b00010001"})]})]})})}),`
`]}),`
`]}),`
`,i.jsx(e.h3,{id:"bitwise-shifting-operators",children:"Bitwise shifting operators"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Bitwise LEFT SHIFT: ",i.jsx(e.code,{children:"a << b"})]}),`
`,i.jsx(e.p,{children:"Returns a new integer with all bits moved to the left by a certain number of places:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" someBits = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"4"}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // is 0b00000100"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" shiftedBits = someBits "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<<"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2"}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   // is 0b00010000"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Bitwise RIGHT SHIFT: ",i.jsx(e.code,{children:"a >> b"})]}),`
`,i.jsx(e.p,{children:"Returns a new integer with all bits moved to the right by a certain number of places:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" someBits = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"8"}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // is 0b00001000"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" shiftedBits = someBits "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">>"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2"}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   // is 0b00000010"})]})]})})}),`
`]}),`
`]}),`
`,i.jsxs(e.p,{children:["For unsigned integers, the bitwise shifting operators perform ",i.jsx(e.a,{href:"https://en.wikipedia.org/wiki/Logical_shift",children:"logical shifting"}),"; for signed integers, they perform ",i.jsx(e.a,{href:"https://en.wikipedia.org/wiki/Arithmetic_shift",children:"arithmetic shifting"}),". Also note that for ",i.jsx(e.code,{children:"a << b"})," or ",i.jsx(e.code,{children:"a >> b"}),", ",i.jsx(e.code,{children:"b"})," must fit into a 64-bit integer."]}),`
`,i.jsx(e.h2,{id:"ternary-conditional-operator",children:"Ternary conditional operator"}),`
`,i.jsxs(e.p,{children:["There is only one ternary conditional operator (e.g., ",i.jsx(e.code,{children:"a ? b : c"}),")."]}),`
`,i.jsx(e.p,{children:"It behaves like an if-statement, but is an expression: if the first operator value is true, the second operator value is returned. If the first operator value is false, the third value is returned."}),`
`,i.jsxs(e.p,{children:["The first value must be a boolean, or resolve to one (and must have the type ",i.jsx(e.code,{children:"Bool"}),"). The second value and third value can be of any type. The result type is the least common supertype of the second and third value."]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" x = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ? "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" : "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"4"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// `x` is `4` and has type `Int`"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" y = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ? "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"nil"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" : "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// `y` is `3` and has type `Int?`"})})]})})}),`
`]})}function o(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(t,{...s})}):t(s)}export{r as _markdown,o as default,h as frontmatter,a as structuredData,l as toc};
