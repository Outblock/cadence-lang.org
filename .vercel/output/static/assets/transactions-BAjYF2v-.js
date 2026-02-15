import{j as e}from"./main-BXy83AsK.js";let t=`

Transactions are objects that are signed with keys of one or more [accounts] and are sent to the chain to interact with it and perform state changes.

Transactions can [import] any number of types from any account using the import syntax:

\`\`\`cadence
import FungibleToken from 0x01
\`\`\`

A transaction is declared using the \`transaction\` keyword and its contents are contained in curly braces.

The body of the transaction can declare local variables that are valid throughout the whole of the transaction:

\`\`\`cadence
transaction {
    // transaction contents
    let localVar: Int

    // ...
}
\`\`\`

Transaction parameters [#transaction-parameters]

Transactions can have parameters and they are declared like function parameters. The arguments for the transaction are passed along with the transaction.

Transaction parameters are accessible throughout the whole of the transaction:

\`\`\`cadence
// Declare a transaction which has one parameter named \`amount\`
// that has the type \`UFix64\`
//
transaction(amount: UFix64) {

}
\`\`\`

Transaction phases [#transaction-phases]

Transactions are executed in four phases: preparation, pre-conditions, execution, and post-conditions, in that order. The preparation and execution phases are blocks of code that execute sequentially. The pre-conditions and post-condition are just like [conditions in functions].

The following empty Cadence transaction has no logic, but demonstrates the syntax for each phase, in the order these phases are executed:

\`\`\`cadence
transaction {
    prepare(signer1: &Account, signer2: &Account) {
        // ...
    }

    pre {
        // ...
    }

    execute {
        // ...
    }

    post {
        // ...
    }
}
\`\`\`

Although optional, each phase serves a specific purpose when executing a transaction. It's recommended that developers use these phases when creating their transactions. These phases **must** be defined in this order.

Prepare phase [#prepare-phase]

The \`prepare\` phase is used when the transaction needs access to the accounts that signed (authorized) the transaction.

Access to the signing accounts is **only possible inside the \`prepare\` phase**.

For each signer of the transaction, a [reference] to the signing account is passed as an argument to the \`prepare\` phase. The reference may be authorized, requesting certain [access to the account].

For example, if the transaction has two signers, the prepare **must** have two parameters of type \`&Account\`:

\`\`\`cadence
prepare(signer1: &Account, signer2: &Account) {
    // ...
}
\`\`\`

For instance, to request write access to an [account's storage], the transaction can request an authorized reference:

\`\`\`cadence
prepare(signer: auth(Storage) &Account) {
    // ...
}
\`\`\`

As a best practice, only use the \`prepare\` phase to define and execute logic that requires [write access] to the signing accounts, and *move all other logic elsewhere*.

Modifications to accounts can have significant implications, so keep this phase clear of unrelated logic. This ensures that users can easily read and understand the logic of the transaction and how it affects their account.

The prepare phase serves a similar purpose as the [initializer of a composite].

For example, if a transaction performs a token transfer, put the withdrawal in the \`prepare\` phase since it requires access to the account storage, but perform the deposit in the \`execute\` phase.

Pre-conditions [#pre-conditions]

Pre-conditions are optional and are declared in a \`pre\` block and are executed after the \`prepare\` phase. For example, a pre-condition might check the balance before transferring tokens between accounts:

\`\`\`cadence
pre {
    sendingAccount.balance > 0
}
\`\`\`

If any of the pre-conditions fail, then the remainder of the transaction is not executed and it is completely reverted.

See [pre-conditions] for more information.

Execute phase [#execute-phase]

The \`execute\` block executes the main logic of the transaction. This phase is optional, but it is a best practice to add your main transaction logic in this section so it is explicit.

It is impossible to access the references to the transaction's signing accounts in the \`execute\` phase:

\`\`\`cadence
transaction {
    prepare(signer: auth(LoadValue) &Account) {}

    execute {
        // Invalid: Cannot access the \`signer\` account reference, as it is not in scope
        let resource <- signer.storage.load<@Resource>(from: /storage/resource)
        destroy resource

        // Valid: Can obtain an unauthorized reference to any account
        let otherAccount = getAccount(0x3)
    }
}
\`\`\`

Post-conditions [#post-conditions]

Transaction post-conditions are just like [post-conditions of functions].

Post-conditions are optional and are declared in a \`post\` block. They are executed after the execution phase and are used to verify that the transaction logic has been executed properly. The block can have zero or more conditions.

For example, a token transfer transaction can ensure that the final balance has a certain value:

\`\`\`cadence
post {
    signer.balance == 30.0: "Balance after transaction is incorrect!"
}
\`\`\`

If any of the post-conditions fail, then the transaction fails and is completely reverted.

See [post-conditions] for details.

Summary [#summary]

Transactions use phases to make the transaction's code/intent more readable. They provide a way for developers to separate the transaction logic. Transactions also provide a way to check the state prior/after transaction execution, to prevent the transaction from running, or reverting changes made by the transaction if needed.

The following is a brief summary of how to use the \`prepare\`, \`pre\`, \`execute\`, and \`post\` blocks in a transaction to implement the transaction's phases:

\`\`\`cadence
transaction {
    prepare(signer1: &Account) {
        // Access signing accounts of the transaction.
        //
        // Avoid logic that does not need access to the signing accounts.
        //
        // The signing accounts can't be accessed anywhere else in the transaction.
    }

    pre {
        // Define conditions that must be true
        // for the transaction to execute.
        //
        // Define the expected state of things
        // as they should be before the transaction is executed.
    }

    execute {
        // The main transaction logic goes here, but you can access
        // any public information or resources published by any account.
    }

    post {
        // Define conditions that must be true
        // for the transaction to be committed.
        //
        // Define the expected state of things
        // as they should be after the transaction executed.
        //
        // Also used to provide information about what changes
        // the transaction will make to the signing accounts.
    }
}
\`\`\`

{/* Relative links. Will not render on the page */}

[access to the account]: ./accounts/index#accessing-an-account

[account's storage]: ./accounts/storage

[accounts]: ./accounts/index

[conditions in functions]: ./pre-and-post-conditions#function-pre-conditions-and-post-conditions

[import]: ./imports

[initializer of a composite]: ./types-and-type-system/composite-types#composite-type-fields

[post-conditions of functions]: ./pre-and-post-conditions#transaction-post-conditions

[post-conditions]: ./pre-and-post-conditions#transaction-post-conditions

[pre-conditions]: ./pre-and-post-conditions#transaction-pre-conditions

[reference]: ./references

[using pre-conditons and post-conditions]: ./pre-and-post-conditions#using-pre-conditions-and-post-conditions

[write access]: ./accounts/index#write-operations
`,r={title:"Transactions"},h={contents:[{heading:void 0,content:"Transactions are objects that are signed with keys of one or more [accounts] and are sent to the chain to interact with it and perform state changes."},{heading:void 0,content:"Transactions can [import] any number of types from any account using the import syntax:"},{heading:void 0,content:"A transaction is declared using the `transaction` keyword and its contents are contained in curly braces."},{heading:void 0,content:"The body of the transaction can declare local variables that are valid throughout the whole of the transaction:"},{heading:"transaction-parameters",content:"Transactions can have parameters and they are declared like function parameters. The arguments for the transaction are passed along with the transaction."},{heading:"transaction-parameters",content:"Transaction parameters are accessible throughout the whole of the transaction:"},{heading:"transaction-phases",content:"Transactions are executed in four phases: preparation, pre-conditions, execution, and post-conditions, in that order. The preparation and execution phases are blocks of code that execute sequentially. The pre-conditions and post-condition are just like [conditions in functions]."},{heading:"transaction-phases",content:"The following empty Cadence transaction has no logic, but demonstrates the syntax for each phase, in the order these phases are executed:"},{heading:"transaction-phases",content:"Although optional, each phase serves a specific purpose when executing a transaction. It's recommended that developers use these phases when creating their transactions. These phases **must** be defined in this order."},{heading:"prepare-phase",content:"The `prepare` phase is used when the transaction needs access to the accounts that signed (authorized) the transaction."},{heading:"prepare-phase",content:"Access to the signing accounts is **only possible inside the `prepare` phase**."},{heading:"prepare-phase",content:"For each signer of the transaction, a [reference] to the signing account is passed as an argument to the `prepare` phase. The reference may be authorized, requesting certain [access to the account]."},{heading:"prepare-phase",content:"For example, if the transaction has two signers, the prepare **must** have two parameters of type `&Account`:"},{heading:"prepare-phase",content:"For instance, to request write access to an [account's storage], the transaction can request an authorized reference:"},{heading:"prepare-phase",content:"As a best practice, only use the `prepare` phase to define and execute logic that requires [write access] to the signing accounts, and *move all other logic elsewhere*."},{heading:"prepare-phase",content:"Modifications to accounts can have significant implications, so keep this phase clear of unrelated logic. This ensures that users can easily read and understand the logic of the transaction and how it affects their account."},{heading:"prepare-phase",content:"The prepare phase serves a similar purpose as the [initializer of a composite]."},{heading:"prepare-phase",content:"For example, if a transaction performs a token transfer, put the withdrawal in the `prepare` phase since it requires access to the account storage, but perform the deposit in the `execute` phase."},{heading:"pre-conditions",content:"Pre-conditions are optional and are declared in a `pre` block and are executed after the `prepare` phase. For example, a pre-condition might check the balance before transferring tokens between accounts:"},{heading:"pre-conditions",content:"If any of the pre-conditions fail, then the remainder of the transaction is not executed and it is completely reverted."},{heading:"pre-conditions",content:"See [pre-conditions] for more information."},{heading:"execute-phase",content:"The `execute` block executes the main logic of the transaction. This phase is optional, but it is a best practice to add your main transaction logic in this section so it is explicit."},{heading:"execute-phase",content:"It is impossible to access the references to the transaction's signing accounts in the `execute` phase:"},{heading:"post-conditions",content:"Transaction post-conditions are just like [post-conditions of functions]."},{heading:"post-conditions",content:"Post-conditions are optional and are declared in a `post` block. They are executed after the execution phase and are used to verify that the transaction logic has been executed properly. The block can have zero or more conditions."},{heading:"post-conditions",content:"For example, a token transfer transaction can ensure that the final balance has a certain value:"},{heading:"post-conditions",content:"If any of the post-conditions fail, then the transaction fails and is completely reverted."},{heading:"post-conditions",content:"See [post-conditions] for details."},{heading:"summary",content:"Transactions use phases to make the transaction's code/intent more readable. They provide a way for developers to separate the transaction logic. Transactions also provide a way to check the state prior/after transaction execution, to prevent the transaction from running, or reverting changes made by the transaction if needed."},{heading:"summary",content:"The following is a brief summary of how to use the `prepare`, `pre`, `execute`, and `post` blocks in a transaction to implement the transaction's phases:"}],headings:[{id:"transaction-parameters",content:"Transaction parameters"},{id:"transaction-phases",content:"Transaction phases"},{id:"prepare-phase",content:"Prepare phase"},{id:"pre-conditions",content:"Pre-conditions"},{id:"execute-phase",content:"Execute phase"},{id:"post-conditions",content:"Post-conditions"},{id:"summary",content:"Summary"}]};const c=[{depth:2,url:"#transaction-parameters",title:e.jsx(e.Fragment,{children:"Transaction parameters"})},{depth:2,url:"#transaction-phases",title:e.jsx(e.Fragment,{children:"Transaction phases"})},{depth:3,url:"#prepare-phase",title:e.jsx(e.Fragment,{children:"Prepare phase"})},{depth:3,url:"#pre-conditions",title:e.jsx(e.Fragment,{children:"Pre-conditions"})},{depth:3,url:"#execute-phase",title:e.jsx(e.Fragment,{children:"Execute phase"})},{depth:3,url:"#post-conditions",title:e.jsx(e.Fragment,{children:"Post-conditions"})},{depth:2,url:"#summary",title:e.jsx(e.Fragment,{children:"Summary"})}];function i(n){const s={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",strong:"strong",...n.components};return e.jsxs(e.Fragment,{children:[e.jsxs(s.p,{children:["Transactions are objects that are signed with keys of one or more ",e.jsx(s.a,{href:"./accounts/index",children:"accounts"})," and are sent to the chain to interact with it and perform state changes."]}),`
`,e.jsxs(s.p,{children:["Transactions can ",e.jsx(s.a,{href:"./imports",children:"import"})," any number of types from any account using the import syntax:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" FungibleToken"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x01"})]})})})}),`
`,e.jsxs(s.p,{children:["A transaction is declared using the ",e.jsx(s.code,{children:"transaction"})," keyword and its contents are contained in curly braces."]}),`
`,e.jsx(s.p,{children:"The body of the transaction can declare local variables that are valid throughout the whole of the transaction:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // transaction contents"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" localVar: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.h2,{id:"transaction-parameters",children:"Transaction parameters"}),`
`,e.jsx(s.p,{children:"Transactions can have parameters and they are declared like function parameters. The arguments for the transaction are passed along with the transaction."}),`
`,e.jsx(s.p,{children:"Transaction parameters are accessible throughout the whole of the transaction:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a transaction which has one parameter named `amount`"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// that has the type `UFix64`"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.h2,{id:"transaction-phases",children:"Transaction phases"}),`
`,e.jsxs(s.p,{children:["Transactions are executed in four phases: preparation, pre-conditions, execution, and post-conditions, in that order. The preparation and execution phases are blocks of code that execute sequentially. The pre-conditions and post-condition are just like ",e.jsx(s.a,{href:"./pre-and-post-conditions#function-pre-conditions-and-post-conditions",children:"conditions in functions"}),"."]}),`
`,e.jsx(s.p,{children:"The following empty Cadence transaction has no logic, but demonstrates the syntax for each phase, in the order these phases are executed:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer1: &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", signer2: &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    pre"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    execute"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    post"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["Although optional, each phase serves a specific purpose when executing a transaction. It's recommended that developers use these phases when creating their transactions. These phases ",e.jsx(s.strong,{children:"must"})," be defined in this order."]}),`
`,e.jsx(s.h3,{id:"prepare-phase",children:"Prepare phase"}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:"prepare"})," phase is used when the transaction needs access to the accounts that signed (authorized) the transaction."]}),`
`,e.jsxs(s.p,{children:["Access to the signing accounts is ",e.jsxs(s.strong,{children:["only possible inside the ",e.jsx(s.code,{children:"prepare"})," phase"]}),"."]}),`
`,e.jsxs(s.p,{children:["For each signer of the transaction, a ",e.jsx(s.a,{href:"./references",children:"reference"})," to the signing account is passed as an argument to the ",e.jsx(s.code,{children:"prepare"})," phase. The reference may be authorized, requesting certain ",e.jsx(s.a,{href:"./accounts/index#accessing-an-account",children:"access to the account"}),"."]}),`
`,e.jsxs(s.p,{children:["For example, if the transaction has two signers, the prepare ",e.jsx(s.strong,{children:"must"})," have two parameters of type ",e.jsx(s.code,{children:"&Account"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer1: &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", signer2: &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["For instance, to request write access to an ",e.jsx(s.a,{href:"./accounts/storage",children:"account's storage"}),", the transaction can request an authorized reference:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Storage"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["As a best practice, only use the ",e.jsx(s.code,{children:"prepare"})," phase to define and execute logic that requires ",e.jsx(s.a,{href:"./accounts/index#write-operations",children:"write access"})," to the signing accounts, and ",e.jsx(s.em,{children:"move all other logic elsewhere"}),"."]}),`
`,e.jsx(s.p,{children:"Modifications to accounts can have significant implications, so keep this phase clear of unrelated logic. This ensures that users can easily read and understand the logic of the transaction and how it affects their account."}),`
`,e.jsxs(s.p,{children:["The prepare phase serves a similar purpose as the ",e.jsx(s.a,{href:"./types-and-type-system/composite-types#composite-type-fields",children:"initializer of a composite"}),"."]}),`
`,e.jsxs(s.p,{children:["For example, if a transaction performs a token transfer, put the withdrawal in the ",e.jsx(s.code,{children:"prepare"})," phase since it requires access to the account storage, but perform the deposit in the ",e.jsx(s.code,{children:"execute"})," phase."]}),`
`,e.jsx(s.h3,{id:"pre-conditions",children:"Pre-conditions"}),`
`,e.jsxs(s.p,{children:["Pre-conditions are optional and are declared in a ",e.jsx(s.code,{children:"pre"})," block and are executed after the ",e.jsx(s.code,{children:"prepare"})," phase. For example, a pre-condition might check the balance before transferring tokens between accounts:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"pre"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    sendingAccount.balance "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.p,{children:"If any of the pre-conditions fail, then the remainder of the transaction is not executed and it is completely reverted."}),`
`,e.jsxs(s.p,{children:["See ",e.jsx(s.a,{href:"./pre-and-post-conditions#transaction-pre-conditions",children:"pre-conditions"})," for more information."]}),`
`,e.jsx(s.h3,{id:"execute-phase",children:"Execute phase"}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:"execute"})," block executes the main logic of the transaction. This phase is optional, but it is a best practice to add your main transaction logic in this section so it is explicit."]}),`
`,e.jsxs(s.p,{children:["It is impossible to access the references to the transaction's signing accounts in the ",e.jsx(s.code,{children:"execute"})," phase:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"LoadValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {}"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    execute"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Invalid: Cannot access the `signer` account reference, as it is not in scope"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" resource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signer.storage.load"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<@"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Resource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/resource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        destroy"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" resource"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Valid: Can obtain an unauthorized reference to any account"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" otherAccount = "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0x3"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.h3,{id:"post-conditions",children:"Post-conditions"}),`
`,e.jsxs(s.p,{children:["Transaction post-conditions are just like ",e.jsx(s.a,{href:"./pre-and-post-conditions#transaction-post-conditions",children:"post-conditions of functions"}),"."]}),`
`,e.jsxs(s.p,{children:["Post-conditions are optional and are declared in a ",e.jsx(s.code,{children:"post"})," block. They are executed after the execution phase and are used to verify that the transaction logic has been executed properly. The block can have zero or more conditions."]}),`
`,e.jsx(s.p,{children:"For example, a token transfer transaction can ensure that the final balance has a certain value:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"post"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.balance "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 30.0"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Balance after transaction is incorrect!"'})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.p,{children:"If any of the post-conditions fail, then the transaction fails and is completely reverted."}),`
`,e.jsxs(s.p,{children:["See ",e.jsx(s.a,{href:"./pre-and-post-conditions#transaction-post-conditions",children:"post-conditions"})," for details."]}),`
`,e.jsx(s.h2,{id:"summary",children:"Summary"}),`
`,e.jsx(s.p,{children:"Transactions use phases to make the transaction's code/intent more readable. They provide a way for developers to separate the transaction logic. Transactions also provide a way to check the state prior/after transaction execution, to prevent the transaction from running, or reverting changes made by the transaction if needed."}),`
`,e.jsxs(s.p,{children:["The following is a brief summary of how to use the ",e.jsx(s.code,{children:"prepare"}),", ",e.jsx(s.code,{children:"pre"}),", ",e.jsx(s.code,{children:"execute"}),", and ",e.jsx(s.code,{children:"post"})," blocks in a transaction to implement the transaction's phases:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer1: &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Access signing accounts of the transaction."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Avoid logic that does not need access to the signing accounts."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // The signing accounts can't be accessed anywhere else in the transaction."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    pre"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Define conditions that must be true"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // for the transaction to execute."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Define the expected state of things"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // as they should be before the transaction is executed."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    execute"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // The main transaction logic goes here, but you can access"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // any public information or resources published by any account."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    post"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Define conditions that must be true"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // for the transaction to be committed."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Define the expected state of things"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // as they should be after the transaction executed."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        //"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Also used to provide information about what changes"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // the transaction will make to the signing accounts."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]})}function o(n={}){const{wrapper:s}=n.components||{};return s?e.jsx(s,{...n,children:e.jsx(i,{...n})}):i(n)}export{t as _markdown,o as default,r as frontmatter,h as structuredData,c as toc};
