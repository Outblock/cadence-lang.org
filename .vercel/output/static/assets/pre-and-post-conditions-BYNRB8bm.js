import{j as n}from"./main-BXy83AsK.js";let o=`

Pre-conditions and post-conditions are a unique and powerful feature of Cadence that allow you to specify conditions for execution that must be met for transactions and functions. If they're not met, execution stops and the transaction is reverted. One use is to define specific inputs and outputs for a transaction that make it easy to see what will be transferred, regardless of how complex the transaction execution becomes. This property is particularly useful in using code written by an AI.

To mock out an example:

> **Pre-condition**: The user has 50 Flow.

> **Execution**: Massively complex operation involving swaps between three different currencies, two dexes, and an NFT marketplace.

> **Post-condition**: The user has at least 30 Flow remaining, and owns SuperCoolCollection NFT #54.

Function pre-conditions and post-conditions [#function-pre-conditions-and-post-conditions]

Functions may have pre-conditions and may have post-conditions. They can be used to restrict the inputs (values for parameters) and output (return value) of a function.

* Pre-conditions must be true right before the execution of the function. They are part of the function and introduced by the \`pre\` keyword, followed by the condition block.
* Post-conditions must be true right after the execution of the function. Post-conditions are part of the function and introduced by the \`post\` keyword, followed by the condition block.
* A conditions block consists of one or more conditions. Conditions are expressions evaluating to a boolean.
* Conditions may be written on separate lines, or multiple conditions can be written on the same line, separated by a semicolon. This syntax follows the syntax for [statements].
* Following each condition, an optional description can be provided after a colon. The condition description is used as an error message when the condition fails.
* All conditions **must** appear as the first statements in a function definition and pre-conditions **must** be defined before post-conditions.

In post-conditions, the special constant \`result\` refers to the result of the function:

\`\`\`cadence
fun factorial(_ n: Int): Int {
    pre {
        // Require the parameter \`n\` to be greater than or equal to zero.
        //
        n >= 0:
            "factorial is only defined for integers greater than or equal to zero"
    }
    post {
        // Ensure the result will be greater than or equal to 1.
        //
        result >= 1:
            "the result must be greater than or equal to 1"
    }

    if n < 1 {
       return 1
    }

    return n * factorial(n - 1)
}

factorial(5)  // is \`120\`

// Run-time error: The given argument does not satisfy
// the pre-condition \`n >= 0\` of the function, the program aborts.
//
factorial(-2)
\`\`\`

In post-conditions, the special function \`before\` can be used to get the value of an expression just before the function is called:

\`\`\`cadence
var n = 0

fun incrementN() {
    post {
        // Require the new value of \`n\` to be the old value of \`n\`, plus one.
        //
        n == before(n) + 1:
            "n must be incremented by 1"
    }

    n = n + 1
}
\`\`\`

Both pre-conditions and post-conditions are considered [\`view\` contexts]; any operations that are not legal in functions with \`view\` annotations are also not allowed in conditions. In particular, this means that if you wish to call a function in a condition, that function must be \`view\`.

Transaction pre-conditions [#transaction-pre-conditions]

Transaction pre-conditions function in the same way as [pre-conditions of functions].

Pre-conditions are optional and are declared in a \`pre\` block. They are executed after the \`prepare\` phase, and are used for checking if explicit conditions hold before executing the remainder of the transaction. The block can have zero or more conditions.

For example, a pre-condition might check the balance before transferring tokens between accounts:

\`\`\`cadence
pre {
    sendingAccount.balance > 0
}
\`\`\`

If any of the pre-conditions fail, then the remainder of the transaction is not executed and it is completely reverted.

Transaction post-conditions [#transaction-post-conditions]

Transaction post-conditions are just like [post-conditions of functions].

Post-conditions are optional and are declared in a \`post\` block. They are executed after the execution phase, and are used to verify that the transaction logic has been executed properly. The block can have zero or more conditions.

For example, a token transfer transaction can ensure that the final balance has a certain value:

\`\`\`cadence
post {
    signer.balance == 30.0: "Balance after transaction is incorrect!"
}
\`\`\`

If any of the post-conditions fail, then the transaction fails and is completely reverted.

Pre- and post-conditions in interfaces [#pre--and-post-conditions-in-interfaces]

Interfaces can also define pre- and post-conditions. See the [interfaces] article for more information.

{/* Relative links. Will not render on the page */}

[interfaces]: ./interfaces

[pre-conditions of functions]: #function-pre-conditions-and-post-conditions

[post-conditions of functions]: #function-pre-conditions-and-post-conditions

[statements]: ./syntax#semicolons

[\`view\` contexts]: ./functions#view-functions

[Interfaces in types]: ./interfaces#interfaces-in-types
`,a={title:"Pre- and Post-Conditions"},r={contents:[{heading:void 0,content:"Pre-conditions and post-conditions are a unique and powerful feature of Cadence that allow you to specify conditions for execution that must be met for transactions and functions. If they're not met, execution stops and the transaction is reverted. One use is to define specific inputs and outputs for a transaction that make it easy to see what will be transferred, regardless of how complex the transaction execution becomes. This property is particularly useful in using code written by an AI."},{heading:void 0,content:"To mock out an example:"},{heading:void 0,content:"> **Pre-condition**: The user has 50 Flow."},{heading:void 0,content:"> **Execution**: Massively complex operation involving swaps between three different currencies, two dexes, and an NFT marketplace."},{heading:void 0,content:"> **Post-condition**: The user has at least 30 Flow remaining, and owns SuperCoolCollection NFT #54."},{heading:"function-pre-conditions-and-post-conditions",content:"Functions may have pre-conditions and may have post-conditions. They can be used to restrict the inputs (values for parameters) and output (return value) of a function."},{heading:"function-pre-conditions-and-post-conditions",content:"Pre-conditions must be true right before the execution of the function. They are part of the function and introduced by the `pre` keyword, followed by the condition block."},{heading:"function-pre-conditions-and-post-conditions",content:"Post-conditions must be true right after the execution of the function. Post-conditions are part of the function and introduced by the `post` keyword, followed by the condition block."},{heading:"function-pre-conditions-and-post-conditions",content:"A conditions block consists of one or more conditions. Conditions are expressions evaluating to a boolean."},{heading:"function-pre-conditions-and-post-conditions",content:"Conditions may be written on separate lines, or multiple conditions can be written on the same line, separated by a semicolon. This syntax follows the syntax for [statements]."},{heading:"function-pre-conditions-and-post-conditions",content:"Following each condition, an optional description can be provided after a colon. The condition description is used as an error message when the condition fails."},{heading:"function-pre-conditions-and-post-conditions",content:"All conditions **must** appear as the first statements in a function definition and pre-conditions **must** be defined before post-conditions."},{heading:"function-pre-conditions-and-post-conditions",content:"In post-conditions, the special constant `result` refers to the result of the function:"},{heading:"function-pre-conditions-and-post-conditions",content:"In post-conditions, the special function `before` can be used to get the value of an expression just before the function is called:"},{heading:"function-pre-conditions-and-post-conditions",content:"Both pre-conditions and post-conditions are considered [`view` contexts]; any operations that are not legal in functions with `view` annotations are also not allowed in conditions. In particular, this means that if you wish to call a function in a condition, that function must be `view`."},{heading:"transaction-pre-conditions",content:"Transaction pre-conditions function in the same way as [pre-conditions of functions]."},{heading:"transaction-pre-conditions",content:"Pre-conditions are optional and are declared in a `pre` block. They are executed after the `prepare` phase, and are used for checking if explicit conditions hold before executing the remainder of the transaction. The block can have zero or more conditions."},{heading:"transaction-pre-conditions",content:"For example, a pre-condition might check the balance before transferring tokens between accounts:"},{heading:"transaction-pre-conditions",content:"If any of the pre-conditions fail, then the remainder of the transaction is not executed and it is completely reverted."},{heading:"transaction-post-conditions",content:"Transaction post-conditions are just like [post-conditions of functions]."},{heading:"transaction-post-conditions",content:"Post-conditions are optional and are declared in a `post` block. They are executed after the execution phase, and are used to verify that the transaction logic has been executed properly. The block can have zero or more conditions."},{heading:"transaction-post-conditions",content:"For example, a token transfer transaction can ensure that the final balance has a certain value:"},{heading:"transaction-post-conditions",content:"If any of the post-conditions fail, then the transaction fails and is completely reverted."},{heading:"pre--and-post-conditions-in-interfaces",content:"Interfaces can also define pre- and post-conditions. See the [interfaces] article for more information."}],headings:[{id:"function-pre-conditions-and-post-conditions",content:"Function pre-conditions and post-conditions"},{id:"transaction-pre-conditions",content:"Transaction pre-conditions"},{id:"transaction-post-conditions",content:"Transaction post-conditions"},{id:"pre--and-post-conditions-in-interfaces",content:"Pre- and post-conditions in interfaces"}]};const c=[{depth:2,url:"#function-pre-conditions-and-post-conditions",title:n.jsx(n.Fragment,{children:"Function pre-conditions and post-conditions"})},{depth:2,url:"#transaction-pre-conditions",title:n.jsx(n.Fragment,{children:"Transaction pre-conditions"})},{depth:2,url:"#transaction-post-conditions",title:n.jsx(n.Fragment,{children:"Transaction post-conditions"})},{depth:2,url:"#pre--and-post-conditions-in-interfaces",title:n.jsx(n.Fragment,{children:"Pre- and post-conditions in interfaces"})}];function s(e){const i={a:"a",blockquote:"blockquote",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...e.components};return n.jsxs(n.Fragment,{children:[n.jsx(i.p,{children:"Pre-conditions and post-conditions are a unique and powerful feature of Cadence that allow you to specify conditions for execution that must be met for transactions and functions. If they're not met, execution stops and the transaction is reverted. One use is to define specific inputs and outputs for a transaction that make it easy to see what will be transferred, regardless of how complex the transaction execution becomes. This property is particularly useful in using code written by an AI."}),`
`,n.jsx(i.p,{children:"To mock out an example:"}),`
`,n.jsxs(i.blockquote,{children:[`
`,n.jsxs(i.p,{children:[n.jsx(i.strong,{children:"Pre-condition"}),": The user has 50 Flow."]}),`
`]}),`
`,n.jsxs(i.blockquote,{children:[`
`,n.jsxs(i.p,{children:[n.jsx(i.strong,{children:"Execution"}),": Massively complex operation involving swaps between three different currencies, two dexes, and an NFT marketplace."]}),`
`]}),`
`,n.jsxs(i.blockquote,{children:[`
`,n.jsxs(i.p,{children:[n.jsx(i.strong,{children:"Post-condition"}),": The user has at least 30 Flow remaining, and owns SuperCoolCollection NFT #54."]}),`
`]}),`
`,n.jsx(i.h2,{id:"function-pre-conditions-and-post-conditions",children:"Function pre-conditions and post-conditions"}),`
`,n.jsx(i.p,{children:"Functions may have pre-conditions and may have post-conditions. They can be used to restrict the inputs (values for parameters) and output (return value) of a function."}),`
`,n.jsxs(i.ul,{children:[`
`,n.jsxs(i.li,{children:["Pre-conditions must be true right before the execution of the function. They are part of the function and introduced by the ",n.jsx(i.code,{children:"pre"})," keyword, followed by the condition block."]}),`
`,n.jsxs(i.li,{children:["Post-conditions must be true right after the execution of the function. Post-conditions are part of the function and introduced by the ",n.jsx(i.code,{children:"post"})," keyword, followed by the condition block."]}),`
`,n.jsx(i.li,{children:"A conditions block consists of one or more conditions. Conditions are expressions evaluating to a boolean."}),`
`,n.jsxs(i.li,{children:["Conditions may be written on separate lines, or multiple conditions can be written on the same line, separated by a semicolon. This syntax follows the syntax for ",n.jsx(i.a,{href:"./syntax#semicolons",children:"statements"}),"."]}),`
`,n.jsx(i.li,{children:"Following each condition, an optional description can be provided after a colon. The condition description is used as an error message when the condition fails."}),`
`,n.jsxs(i.li,{children:["All conditions ",n.jsx(i.strong,{children:"must"})," appear as the first statements in a function definition and pre-conditions ",n.jsx(i.strong,{children:"must"})," be defined before post-conditions."]}),`
`]}),`
`,n.jsxs(i.p,{children:["In post-conditions, the special constant ",n.jsx(i.code,{children:"result"})," refers to the result of the function:"]}),`
`,n.jsx(n.Fragment,{children:n.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:n.jsxs(i.code,{children:[n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),n.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" factorial"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ n: "}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    pre"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Require the parameter `n` to be greater than or equal to zero."})}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //"})}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        n "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "factorial is only defined for integers greater than or equal to zero"'})}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    post"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Ensure the result will be greater than or equal to 1."})}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //"})}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        result "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "the result must be greater than or equal to 1"'})}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,n.jsx(i.span,{className:"line"}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    if"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" n "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"       return"}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,n.jsx(i.span,{className:"line"}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" n "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"*"}),n.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" factorial"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(n "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,n.jsx(i.span,{className:"line"}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"factorial"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"5"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")  "}),n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// is `120`"})]}),`
`,n.jsx(i.span,{className:"line"}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Run-time error: The given argument does not satisfy"})}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// the pre-condition `n >= 0` of the function, the program aborts."})}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"factorial"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,n.jsxs(i.p,{children:["In post-conditions, the special function ",n.jsx(i.code,{children:"before"})," can be used to get the value of an expression just before the function is called:"]}),`
`,n.jsx(n.Fragment,{children:n.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:n.jsxs(i.code,{children:[n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" n = "}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"})]}),`
`,n.jsx(i.span,{className:"line"}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),n.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" incrementN"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    post"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Require the new value of `n` to be the old value of `n`, plus one."})}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //"})}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        n "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),n.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" before"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(n) "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "n must be incremented by 1"'})}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,n.jsx(i.span,{className:"line"}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    n = n "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,n.jsxs(i.p,{children:["Both pre-conditions and post-conditions are considered ",n.jsxs(i.a,{href:"./functions#view-functions",children:[n.jsx(i.code,{children:"view"})," contexts"]}),"; any operations that are not legal in functions with ",n.jsx(i.code,{children:"view"})," annotations are also not allowed in conditions. In particular, this means that if you wish to call a function in a condition, that function must be ",n.jsx(i.code,{children:"view"}),"."]}),`
`,n.jsx(i.h2,{id:"transaction-pre-conditions",children:"Transaction pre-conditions"}),`
`,n.jsxs(i.p,{children:["Transaction pre-conditions function in the same way as ",n.jsx(i.a,{href:"#function-pre-conditions-and-post-conditions",children:"pre-conditions of functions"}),"."]}),`
`,n.jsxs(i.p,{children:["Pre-conditions are optional and are declared in a ",n.jsx(i.code,{children:"pre"})," block. They are executed after the ",n.jsx(i.code,{children:"prepare"})," phase, and are used for checking if explicit conditions hold before executing the remainder of the transaction. The block can have zero or more conditions."]}),`
`,n.jsx(i.p,{children:"For example, a pre-condition might check the balance before transferring tokens between accounts:"}),`
`,n.jsx(n.Fragment,{children:n.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:n.jsxs(i.code,{children:[n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"pre"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    sendingAccount.balance "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0"})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,n.jsx(i.p,{children:"If any of the pre-conditions fail, then the remainder of the transaction is not executed and it is completely reverted."}),`
`,n.jsx(i.h2,{id:"transaction-post-conditions",children:"Transaction post-conditions"}),`
`,n.jsxs(i.p,{children:["Transaction post-conditions are just like ",n.jsx(i.a,{href:"#function-pre-conditions-and-post-conditions",children:"post-conditions of functions"}),"."]}),`
`,n.jsxs(i.p,{children:["Post-conditions are optional and are declared in a ",n.jsx(i.code,{children:"post"})," block. They are executed after the execution phase, and are used to verify that the transaction logic has been executed properly. The block can have zero or more conditions."]}),`
`,n.jsx(i.p,{children:"For example, a token transfer transaction can ensure that the final balance has a certain value:"}),`
`,n.jsx(n.Fragment,{children:n.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:n.jsxs(i.code,{children:[n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"post"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,n.jsxs(i.span,{className:"line",children:[n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.balance "}),n.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),n.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 30.0"}),n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),n.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Balance after transaction is incorrect!"'})]}),`
`,n.jsx(i.span,{className:"line",children:n.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,n.jsx(i.p,{children:"If any of the post-conditions fail, then the transaction fails and is completely reverted."}),`
`,n.jsx(i.h2,{id:"pre--and-post-conditions-in-interfaces",children:"Pre- and post-conditions in interfaces"}),`
`,n.jsxs(i.p,{children:["Interfaces can also define pre- and post-conditions. See the ",n.jsx(i.a,{href:"./interfaces",children:"interfaces"})," article for more information."]}),`
`]})}function h(e={}){const{wrapper:i}=e.components||{};return i?n.jsx(i,{...e,children:n.jsx(s,{...e})}):s(e)}export{o as _markdown,h as default,a as frontmatter,r as structuredData,c as toc};
