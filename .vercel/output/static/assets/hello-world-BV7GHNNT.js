import{j as e}from"./main-BXy83AsK.js";import{_ as a}from"./deploybox-BH20AVSo.js";let c=`



<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
  <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} src="https://www.youtube.com/embed/bAvlVE7Wd7w" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
</div>

It's time to write your own "Hello World" contract. In this instance, the contract accomplishes the following:

1. Create and initialize a smart contract with a single field of type \`String\`.
2. Initialize the field with the phrase "Hello, World!".
3. Create a function in the contract that returns our greeting.

We will deploy this contract in an account, use a transaction to interact with the contract, and finally, explore the role of signers in a transaction.

Objectives [#objectives]

After completing this tutorial, you'll be able to:

* Declare a public Cadence smart contract.
* Initialize a public \`String\` variable.
* Write simple transactions and scripts in Cadence.
* Describe the role of signers in a Cadence transaction.

How to implement Hello World [#how-to-implement-hello-world]

Open the starter code for this tutorial in the Flow Playground, which is empty: [play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4].

Declare your contract by entering the following:

\`\`\`cadence
access(all) contract HelloWorld {
  // Todo
}
\`\`\`

Declaring a Contract-Level Constant [#declaring-a-contract-level-constant]

The line \`access(all) contract HelloWorld \` declares a contract with [Access Control] that is accessible in all scopes, including public.

Add a public constant \`String\` field to store your greeting:

\`\`\`cadence
// Incomplete code example
// An error is expected here, see below

// Declare a public (access(all)) field of type String.
access(all) let greeting: String
\`\`\`

:::warning
Cadence follows the same pattern as Swift where the \`let\` keyword is used to declare a constant. The \`var\` keyword is used to declare a variable.
:::
As before, you're using the \`access\` keyword to set the scope to \`all\` and make the constant public. The \`let\` keyword declares a state constant named \`greeting\`, and the [type annotation] declares it as a \`String\`.

You'll probably notice the following error in your code:

\`\`\`text
missing initializer for field \`greeting\` in type \`HelloWorld\`
\`\`\`

[Composite Types], which includes contracts, have a special initializer function that is run exactly once, upon object creation. It's optional, but constants declared at the contract level must have a value set in the initializer.

Add the following initializer and initialize your \`greeting\`:

\`\`\`cadence
// The initializer is required if the contract contains any fields.
init() {
  self.greeting = "Hello, World!"
}
\`\`\`

Adding a View Function [#adding-a-view-function]

After you create a contract and initialized the \`"Hello, World!"\` \`String\`, the next step is to implement a \`view\` function to return the \`greeting\` constant:

\`\`\`cadence
// Public function that returns our friendly greeting!
access(all) view fun hello(): String {
    return self.greeting
}
\`\`\`

Once again, the access level is public. Anyone who imports this contract into their own contract, transaction, or script can read the public fields, use the public types, and call the public contract functions — the ones that have \`access(all)\` specified.

The \`view\` annotation indicates that the function is permitted to view, but not modify blockchain state.

Accounts [#accounts]

Each user has an account controlled by one or more private keys with configurable weight. This means that support for accounts/wallets with [multiple controllers] is built into the protocol by default.

An account is divided into several areas:

* *Contracts*
* *Account Storage*
* *Capabilities*
* *Keys*

Contract Area [#contract-area]

The first area is the [contract area], or \`account.contracts\`.

This is the area that stores smart contracts deployed to the account. These contracts contain type definitions, fields, and functions that relate to common functionality. There is no limit to the number of smart contracts an account can store.

:::tip
Much of the functionality that you'd find in a Solidity smart contract is instead written in [transactions] or scripts for Cadence apps. These exist outside the smart contract, which means you don't need to anticipate absolutely everything you might want to do or view before deploying the contract.
:::
The information in the contract area cannot be directly accessed in a transaction unless the transaction imports the contract or returns (reads) a copy of the code deployed to an account.

The owner of an account can directly add or update contracts that are deployed to it.

:::warning\\[Important]
On Flow Cadence, **smart contracts *are* upgradeable**. If you make a mistake, you can often [update] it, constrained by some rules, in a public and transparent manner.
:::

Account Storage [#account-storage]

The second area is where you'll find [account storage], or \`account.storage\`. This area is where an account stores the objects that it owns. This is an important differentiator between Cadence and other languages, because in other languages, assets that accounts own are usually stored in the centralized smart contract ledger that defines the assets.

:::warning\\[Important]
In Cadence, each account **stores its assets as objects directly in its own account storage**, similar to how you store your own possessions in your own house in real life!
:::
The account storage section also stores code that declares the capabilities for controlling how these stored objects can be accessed. We'll cover account storage and capabilities in more detail in a later tutorial.

In this tutorial, we'll use the account with the address \`0x06\` to store our \`HelloWorld\` contract.

Capabilities [#capabilities]

[Capabilities], or \`account.capabilities\`, are a part of the security model in Cadence. They represent the right to access parts of or all of an object and perform operations on it. For example, a user might possess a vault that holds fungible tokens. In this case, they'll have the capability that allows anyone to deposit tokens into the vault, and may choose to grant the capability to withdraw tokens to their broker's account.

Keys [#keys]

[Keys], or \`account.keys\`, are used to sign [transactions]. In Cadence, an account can have many keys. These keys can be shared or revoked, providing native version of [account abstraction] that is extremely powerful. For example, you can use it to [build an app] that pulls NFTs in an embedded wallet in one app into that user's browser wallet and then use them in your app.

Deploying the HelloWorld Contract [#deploying-the-helloworld-contract]

To deploy a contract, make sure that the account \`0x06\` tab is selected and that the \`HelloWorld.cdc\` file is in the editor. Then, click the \`Deploy\` button to deploy the contents of the editor to account \`0x06\`:

<img alt="Deploy Contract" src={__img0} placeholder="blur" />

You should see a log in the output area indicating that the deployment succeeded:

\`\`\`text
Deployed Contract To: 0x06
\`\`\`

You'll also see the name of the contract in the selected account tab underneath the number for the account. This indicates that the \`HelloWorld\` contract has been deployed to the account.

You can always look at this tab to verify which contracts are in which accounts.

Transactions [#transactions]

A [Transaction] in Flow is defined as an arbitrary-sized block of Cadence code that is authorized by one or more accounts.

When an account authorizes a transaction, the code in that transaction has access to the authorizers' private storage.

An account authorizes a transaction by performing a cryptographic signature on the transaction with the account's private key, which should only be accessible to the account owner.

In addition to being able to access the authorizer's private assets, transactions can also read and call functions in public contracts, and access public functions in other users' accounts.

Importing a transaction [#importing-a-transaction]

This tutorial uses a transaction to call our \`hello()\` function:

1. Open the \`CallHello\` file in the \`Transactions\` folder.
2. Import the **deployed instance** of \`HelloWorld\` from account \`0x06\`. If you haven't deployed the smart contract from the account, the transaction won't have access to it and the import will fail.
3. Add an \`import\` at the top of the file:
   \`\`\`cadence
   import HelloWorld from 0x06
   \`\`\`
   This imports the entire contract code from \`HelloWorld\`, including type definitions and public functions, so that the transaction can use them to interact with the \`HelloWorld\` contract in account \`0x06\`.
4. To import any smart contract from any account, use this format:
   \`\`\`cadence
   // Replace {ContractName} with the name of the contract you want to import
   // and {Address} with the account you want to import it from
   import {ContractName} from {Address}
   \`\`\`
   Transactions are written in Cadence and are declared with the \`transaction\` keyword.
5. Declare an empty \`transaction\`:
   \`\`\`cadence
   transaction {
     // TODO
   }
   \`\`\`

Working with a Transaction Process [#working-with-a-transaction-process]

Transactions are divided into two main phases, \`prepare\` and \`execute\`.

The [\`prepare\`] phase is required and is used to identify the account(s) that will sign the transaction. It's also used when the transaction needs to access the account(s) that signed the transaction. The latter is not needed for this simple transaction.

1. Add an empty \`prepare\` statement to your transaction:
   \`\`\`cadence
   prepare(acct: &Account) {
     // Nothing is needed here for now
   }
   \`\`\`
   The \`execute\` phase is the main body of a transaction. It can call functions on external contracts and objects and perform operations on data that was initialized in the transaction.
2. Add an \`execute\` block to your transaction and use it to \`log\` the output of the \`hello()\` function from the imported \`HelloWorld\` contract to the console:
   \`\`\`cadence
   execute {
     log(HelloWorld.hello())
   }
   \`\`\`
   In this example, the \`execute\` phase calls \`HelloWorld.hello()\`. This executes the \`hello()\` function in the \`HelloWorld\` contract and logs the result(\`log(HelloWorld.hello())\`) to the console.
3. In the box at the bottom right of the editor, select Account \`0x06\` as the transaction signer.
4. Click the \`Send\` button to submit the transaction
   You should see something similar to the following in the transaction results at the bottom of the screen:
   \`\`\`text
   16:46:56
   Simple Transaction
   [1]
   Cadence log: "Hello, World!"
   \`\`\`

Congratulations, you just executed your first Cadence transaction with the account \`0x06\` as the signer!

This tutorial shows you the same result if you use different signers for the transaction but later tutorials will use more complex examples that have different results, depending on the signer.

Conclusion [#conclusion]

This tutorial covered an introduction to Cadence, including terms such as accounts, transactions, and signers. We implemented a smart contract that is accessible in all scopes. The smart contract had a \`String\` field initialized with the value \`Hello, World!\` and a function to return (read) this value.

Next, we deployed this contract in an account and implemented a transaction to call the function in the smart contract and log the result to the console. Finally, we used the account \`0x06\` as the signer for this transaction.

Now that you have completed the tutorial, you can:

* Declare a public Cadence smart contract.
* Initialize a public \`String\` variable.
* Write simple transactions in Cadence.
* Describe the role of signers in a Cadence transaction.

Reference Solution [#reference-solution]

:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.
:::

* [Reference Solution]

{/* Relative links.  Will not render on the page */}

[Cadence]: ../index.md

[Access Control]: ../language/access-control.md

[variable]: ../language/constants-and-variables.md

[type annotation]: ../language/types-and-type-system/type-annotations.md

[Composite Types]: ../language/types-and-type-system/composite-types.mdx

[multiple controllers]: https://www.coindesk.com/learn/what-is-a-multisig-wallet

[contract area]: ../language/accounts/contracts

[update]: ../language/contract-updatability.md

[account storage]: ../language/accounts/storage.mdx

[Capabilities]: ../language/capabilities.md

[Keys]: ../language/accounts/keys.mdx

[account abstraction]: https://ethereum.org/en/roadmap/account-abstraction

[build an app]: https://developers.flow.com/build/guides/account-linking-with-dapper

[Transaction]: ../language/transactions.md

[transactions]: ../language/transactions.md

[\`prepare\`]: ../language/transactions.md#prepare-phase

[Cadence types]: ../language/values-and-types/index.md

[Reference Solution]: https://play.flow.com/edba10ad-1232-4720-bc1b-cd34cb12b6dc

[play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4]: https://play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4
`,r={title:"Hello World",description:"A smart contract tutorial for Cadence."},l={contents:[{heading:void 0,content:`It's time to write your own "Hello World" contract. In this instance, the contract accomplishes the following:`},{heading:void 0,content:"Create and initialize a smart contract with a single field of type `String`."},{heading:void 0,content:'Initialize the field with the phrase "Hello, World!".'},{heading:void 0,content:"Create a function in the contract that returns our greeting."},{heading:void 0,content:"We will deploy this contract in an account, use a transaction to interact with the contract, and finally, explore the role of signers in a transaction."},{heading:"objectives",content:"After completing this tutorial, you'll be able to:"},{heading:"objectives",content:"Declare a public Cadence smart contract."},{heading:"objectives",content:"Initialize a public `String` variable."},{heading:"objectives",content:"Write simple transactions and scripts in Cadence."},{heading:"objectives",content:"Describe the role of signers in a Cadence transaction."},{heading:"how-to-implement-hello-world",content:"Open the starter code for this tutorial in the Flow Playground, which is empty: [play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4]."},{heading:"how-to-implement-hello-world",content:"Declare your contract by entering the following:"},{heading:"declaring-a-contract-level-constant",content:"The line `access(all) contract HelloWorld ` declares a contract with [Access Control] that is accessible in all scopes, including public."},{heading:"declaring-a-contract-level-constant",content:"Add a public constant `String` field to store your greeting:"},{heading:"declaring-a-contract-level-constant",content:":::warning\nCadence follows the same pattern as Swift where the `let` keyword is used to declare a constant. The `var` keyword is used to declare a variable.\n:::\nAs before, you're using the `access` keyword to set the scope to `all` and make the constant public. The `let` keyword declares a state constant named `greeting`, and the [type annotation] declares it as a `String`."},{heading:"declaring-a-contract-level-constant",content:"You'll probably notice the following error in your code:"},{heading:"declaring-a-contract-level-constant",content:"[Composite Types], which includes contracts, have a special initializer function that is run exactly once, upon object creation. It's optional, but constants declared at the contract level must have a value set in the initializer."},{heading:"declaring-a-contract-level-constant",content:"Add the following initializer and initialize your `greeting`:"},{heading:"adding-a-view-function",content:'After you create a contract and initialized the `"Hello, World!"` `String`, the next step is to implement a `view` function to return the `greeting` constant:'},{heading:"adding-a-view-function",content:"Once again, the access level is public. Anyone who imports this contract into their own contract, transaction, or script can read the public fields, use the public types, and call the public contract functions — the ones that have `access(all)` specified."},{heading:"adding-a-view-function",content:"The `view` annotation indicates that the function is permitted to view, but not modify blockchain state."},{heading:"accounts",content:"Each user has an account controlled by one or more private keys with configurable weight. This means that support for accounts/wallets with [multiple controllers] is built into the protocol by default."},{heading:"accounts",content:"An account is divided into several areas:"},{heading:"accounts",content:"*Contracts*"},{heading:"accounts",content:"*Account Storage*"},{heading:"accounts",content:"*Capabilities*"},{heading:"accounts",content:"*Keys*"},{heading:"contract-area",content:"The first area is the [contract area], or `account.contracts`."},{heading:"contract-area",content:"This is the area that stores smart contracts deployed to the account. These contracts contain type definitions, fields, and functions that relate to common functionality. There is no limit to the number of smart contracts an account can store."},{heading:"contract-area",content:`:::tip
Much of the functionality that you'd find in a Solidity smart contract is instead written in [transactions] or scripts for Cadence apps. These exist outside the smart contract, which means you don't need to anticipate absolutely everything you might want to do or view before deploying the contract.
:::
The information in the contract area cannot be directly accessed in a transaction unless the transaction imports the contract or returns (reads) a copy of the code deployed to an account.`},{heading:"contract-area",content:"The owner of an account can directly add or update contracts that are deployed to it."},{heading:"contract-area",content:`:::warning\\[Important]
On Flow Cadence, **smart contracts *are* upgradeable**. If you make a mistake, you can often [update] it, constrained by some rules, in a public and transparent manner.
:::`},{heading:"account-storage",content:"The second area is where you'll find [account storage], or `account.storage`. This area is where an account stores the objects that it owns. This is an important differentiator between Cadence and other languages, because in other languages, assets that accounts own are usually stored in the centralized smart contract ledger that defines the assets."},{heading:"account-storage",content:`:::warning\\[Important]
In Cadence, each account **stores its assets as objects directly in its own account storage**, similar to how you store your own possessions in your own house in real life!
:::
The account storage section also stores code that declares the capabilities for controlling how these stored objects can be accessed. We'll cover account storage and capabilities in more detail in a later tutorial.`},{heading:"account-storage",content:"In this tutorial, we'll use the account with the address `0x06` to store our `HelloWorld` contract."},{heading:"capabilities",content:"[Capabilities], or `account.capabilities`, are a part of the security model in Cadence. They represent the right to access parts of or all of an object and perform operations on it. For example, a user might possess a vault that holds fungible tokens. In this case, they'll have the capability that allows anyone to deposit tokens into the vault, and may choose to grant the capability to withdraw tokens to their broker's account."},{heading:"keys",content:"[Keys], or `account.keys`, are used to sign [transactions]. In Cadence, an account can have many keys. These keys can be shared or revoked, providing native version of [account abstraction] that is extremely powerful. For example, you can use it to [build an app] that pulls NFTs in an embedded wallet in one app into that user's browser wallet and then use them in your app."},{heading:"deploying-the-helloworld-contract",content:"To deploy a contract, make sure that the account `0x06` tab is selected and that the `HelloWorld.cdc` file is in the editor. Then, click the `Deploy` button to deploy the contents of the editor to account `0x06`:"},{heading:"deploying-the-helloworld-contract",content:"You should see a log in the output area indicating that the deployment succeeded:"},{heading:"deploying-the-helloworld-contract",content:"You'll also see the name of the contract in the selected account tab underneath the number for the account. This indicates that the `HelloWorld` contract has been deployed to the account."},{heading:"deploying-the-helloworld-contract",content:"You can always look at this tab to verify which contracts are in which accounts."},{heading:"transactions",content:"A [Transaction] in Flow is defined as an arbitrary-sized block of Cadence code that is authorized by one or more accounts."},{heading:"transactions",content:"When an account authorizes a transaction, the code in that transaction has access to the authorizers' private storage."},{heading:"transactions",content:"An account authorizes a transaction by performing a cryptographic signature on the transaction with the account's private key, which should only be accessible to the account owner."},{heading:"transactions",content:"In addition to being able to access the authorizer's private assets, transactions can also read and call functions in public contracts, and access public functions in other users' accounts."},{heading:"importing-a-transaction",content:"This tutorial uses a transaction to call our `hello()` function:"},{heading:"importing-a-transaction",content:"Open the `CallHello` file in the `Transactions` folder."},{heading:"importing-a-transaction",content:"Import the **deployed instance** of `HelloWorld` from account `0x06`. If you haven't deployed the smart contract from the account, the transaction won't have access to it and the import will fail."},{heading:"importing-a-transaction",content:"Add an `import` at the top of the file:"},{heading:"importing-a-transaction",content:"This imports the entire contract code from `HelloWorld`, including type definitions and public functions, so that the transaction can use them to interact with the `HelloWorld` contract in account `0x06`."},{heading:"importing-a-transaction",content:"To import any smart contract from any account, use this format:"},{heading:"importing-a-transaction",content:"Transactions are written in Cadence and are declared with the `transaction` keyword."},{heading:"importing-a-transaction",content:"Declare an empty `transaction`:"},{heading:"working-with-a-transaction-process",content:"Transactions are divided into two main phases, `prepare` and `execute`."},{heading:"working-with-a-transaction-process",content:"The [`prepare`] phase is required and is used to identify the account(s) that will sign the transaction. It's also used when the transaction needs to access the account(s) that signed the transaction. The latter is not needed for this simple transaction."},{heading:"working-with-a-transaction-process",content:"Add an empty `prepare` statement to your transaction:"},{heading:"working-with-a-transaction-process",content:"The `execute` phase is the main body of a transaction. It can call functions on external contracts and objects and perform operations on data that was initialized in the transaction."},{heading:"working-with-a-transaction-process",content:"Add an `execute` block to your transaction and use it to `log` the output of the `hello()` function from the imported `HelloWorld` contract to the console:"},{heading:"working-with-a-transaction-process",content:"In this example, the `execute` phase calls `HelloWorld.hello()`. This executes the `hello()` function in the `HelloWorld` contract and logs the result(`log(HelloWorld.hello())`) to the console."},{heading:"working-with-a-transaction-process",content:"In the box at the bottom right of the editor, select Account `0x06` as the transaction signer."},{heading:"working-with-a-transaction-process",content:"Click the `Send` button to submit the transaction\nYou should see something similar to the following in the transaction results at the bottom of the screen:"},{heading:"working-with-a-transaction-process",content:"Congratulations, you just executed your first Cadence transaction with the account `0x06` as the signer!"},{heading:"working-with-a-transaction-process",content:"This tutorial shows you the same result if you use different signers for the transaction but later tutorials will use more complex examples that have different results, depending on the signer."},{heading:"conclusion",content:"This tutorial covered an introduction to Cadence, including terms such as accounts, transactions, and signers. We implemented a smart contract that is accessible in all scopes. The smart contract had a `String` field initialized with the value `Hello, World!` and a function to return (read) this value."},{heading:"conclusion",content:"Next, we deployed this contract in an account and implemented a transaction to call the function in the smart contract and log the result to the console. Finally, we used the account `0x06` as the signer for this transaction."},{heading:"conclusion",content:"Now that you have completed the tutorial, you can:"},{heading:"conclusion",content:"Declare a public Cadence smart contract."},{heading:"conclusion",content:"Initialize a public `String` variable."},{heading:"conclusion",content:"Write simple transactions in Cadence."},{heading:"conclusion",content:"Describe the role of signers in a Cadence transaction."},{heading:"reference-solution",content:`:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!`},{heading:"reference-solution",content:`Reference solutions are functional, but may not be optimal.
:::`},{heading:"reference-solution",content:"[Reference Solution]"}],headings:[{id:"objectives",content:"Objectives"},{id:"how-to-implement-hello-world",content:"How to implement Hello World"},{id:"declaring-a-contract-level-constant",content:"Declaring a Contract-Level Constant"},{id:"adding-a-view-function",content:"Adding a View Function"},{id:"accounts",content:"Accounts"},{id:"contract-area",content:"Contract Area"},{id:"account-storage",content:"Account Storage"},{id:"capabilities",content:"Capabilities"},{id:"keys",content:"Keys"},{id:"deploying-the-helloworld-contract",content:"Deploying the HelloWorld Contract"},{id:"transactions",content:"Transactions"},{id:"importing-a-transaction",content:"Importing a transaction"},{id:"working-with-a-transaction-process",content:"Working with a Transaction Process"},{id:"conclusion",content:"Conclusion"},{id:"reference-solution",content:"Reference Solution"}]};const h=[{depth:2,url:"#objectives",title:e.jsx(e.Fragment,{children:"Objectives"})},{depth:2,url:"#how-to-implement-hello-world",title:e.jsx(e.Fragment,{children:"How to implement Hello World"})},{depth:3,url:"#declaring-a-contract-level-constant",title:e.jsx(e.Fragment,{children:"Declaring a Contract-Level Constant"})},{depth:3,url:"#adding-a-view-function",title:e.jsx(e.Fragment,{children:"Adding a View Function"})},{depth:2,url:"#accounts",title:e.jsx(e.Fragment,{children:"Accounts"})},{depth:3,url:"#contract-area",title:e.jsx(e.Fragment,{children:"Contract Area"})},{depth:3,url:"#account-storage",title:e.jsx(e.Fragment,{children:"Account Storage"})},{depth:3,url:"#capabilities",title:e.jsx(e.Fragment,{children:"Capabilities"})},{depth:3,url:"#keys",title:e.jsx(e.Fragment,{children:"Keys"})},{depth:2,url:"#deploying-the-helloworld-contract",title:e.jsx(e.Fragment,{children:"Deploying the HelloWorld Contract"})},{depth:2,url:"#transactions",title:e.jsx(e.Fragment,{children:"Transactions"})},{depth:3,url:"#importing-a-transaction",title:e.jsx(e.Fragment,{children:"Importing a transaction"})},{depth:3,url:"#working-with-a-transaction-process",title:e.jsx(e.Fragment,{children:"Working with a Transaction Process"})},{depth:2,url:"#conclusion",title:e.jsx(e.Fragment,{children:"Conclusion"})},{depth:2,url:"#reference-solution",title:e.jsx(e.Fragment,{children:"Reference Solution"})}];function i(n){const t={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",maxWidth:"100%"},children:e.jsx("iframe",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%"},src:"https://www.youtube.com/embed/bAvlVE7Wd7w",title:"YouTube video player",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:!0})}),`
`,e.jsx(t.p,{children:`It's time to write your own "Hello World" contract. In this instance, the contract accomplishes the following:`}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Create and initialize a smart contract with a single field of type ",e.jsx(t.code,{children:"String"}),"."]}),`
`,e.jsx(t.li,{children:'Initialize the field with the phrase "Hello, World!".'}),`
`,e.jsx(t.li,{children:"Create a function in the contract that returns our greeting."}),`
`]}),`
`,e.jsx(t.p,{children:"We will deploy this contract in an account, use a transaction to interact with the contract, and finally, explore the role of signers in a transaction."}),`
`,e.jsx(t.h2,{id:"objectives",children:"Objectives"}),`
`,e.jsx(t.p,{children:"After completing this tutorial, you'll be able to:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Declare a public Cadence smart contract."}),`
`,e.jsxs(t.li,{children:["Initialize a public ",e.jsx(t.code,{children:"String"})," variable."]}),`
`,e.jsx(t.li,{children:"Write simple transactions and scripts in Cadence."}),`
`,e.jsx(t.li,{children:"Describe the role of signers in a Cadence transaction."}),`
`]}),`
`,e.jsx(t.h2,{id:"how-to-implement-hello-world",children:"How to implement Hello World"}),`
`,e.jsxs(t.p,{children:["Open the starter code for this tutorial in the Flow Playground, which is empty: ",e.jsx(t.a,{href:"https://play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4",children:"play.flow.com/e559739d-603e-40d5-b2f1-b9957051cdc4"}),"."]}),`
`,e.jsx(t.p,{children:"Declare your contract by entering the following:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloWorld"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // Todo"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(t.h3,{id:"declaring-a-contract-level-constant",children:"Declaring a Contract-Level Constant"}),`
`,e.jsxs(t.p,{children:["The line ",e.jsx(t.code,{children:"access(all) contract HelloWorld "})," declares a contract with ",e.jsx(t.a,{href:"../language/access-control.md",children:"Access Control"})," that is accessible in all scopes, including public."]}),`
`,e.jsxs(t.p,{children:["Add a public constant ",e.jsx(t.code,{children:"String"})," field to store your greeting:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Incomplete code example"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// An error is expected here, see below"})}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a public (access(all)) field of type String."})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" greeting: "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]})]})})}),`
`,e.jsxs(t.p,{children:[`:::warning
Cadence follows the same pattern as Swift where the `,e.jsx(t.code,{children:"let"})," keyword is used to declare a constant. The ",e.jsx(t.code,{children:"var"}),` keyword is used to declare a variable.
:::
As before, you're using the `,e.jsx(t.code,{children:"access"})," keyword to set the scope to ",e.jsx(t.code,{children:"all"})," and make the constant public. The ",e.jsx(t.code,{children:"let"})," keyword declares a state constant named ",e.jsx(t.code,{children:"greeting"}),", and the ",e.jsx(t.a,{href:"../language/types-and-type-system/type-annotations.md",children:"type annotation"})," declares it as a ",e.jsx(t.code,{children:"String"}),"."]}),`
`,e.jsx(t.p,{children:"You'll probably notice the following error in your code:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"missing initializer for field `greeting` in type `HelloWorld`"})})})})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"../language/types-and-type-system/composite-types.mdx",children:"Composite Types"}),", which includes contracts, have a special initializer function that is run exactly once, upon object creation. It's optional, but constants declared at the contract level must have a value set in the initializer."]}),`
`,e.jsxs(t.p,{children:["Add the following initializer and initialize your ",e.jsx(t.code,{children:"greeting"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// The initializer is required if the contract contains any fields."})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"init"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  self"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".greeting = "}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Hello, World!"'})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(t.h3,{id:"adding-a-view-function",children:"Adding a View Function"}),`
`,e.jsxs(t.p,{children:["After you create a contract and initialized the ",e.jsx(t.code,{children:'"Hello, World!"'})," ",e.jsx(t.code,{children:"String"}),", the next step is to implement a ",e.jsx(t.code,{children:"view"})," function to return the ",e.jsx(t.code,{children:"greeting"})," constant:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Public function that returns our friendly greeting!"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") view "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" hello"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" self"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".greeting"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(t.p,{children:["Once again, the access level is public. Anyone who imports this contract into their own contract, transaction, or script can read the public fields, use the public types, and call the public contract functions — the ones that have ",e.jsx(t.code,{children:"access(all)"})," specified."]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"view"})," annotation indicates that the function is permitted to view, but not modify blockchain state."]}),`
`,e.jsx(t.h2,{id:"accounts",children:"Accounts"}),`
`,e.jsxs(t.p,{children:["Each user has an account controlled by one or more private keys with configurable weight. This means that support for accounts/wallets with ",e.jsx(t.a,{href:"https://www.coindesk.com/learn/what-is-a-multisig-wallet",children:"multiple controllers"})," is built into the protocol by default."]}),`
`,e.jsx(t.p,{children:"An account is divided into several areas:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:e.jsx(t.em,{children:"Contracts"})}),`
`,e.jsx(t.li,{children:e.jsx(t.em,{children:"Account Storage"})}),`
`,e.jsx(t.li,{children:e.jsx(t.em,{children:"Capabilities"})}),`
`,e.jsx(t.li,{children:e.jsx(t.em,{children:"Keys"})}),`
`]}),`
`,e.jsx(t.h3,{id:"contract-area",children:"Contract Area"}),`
`,e.jsxs(t.p,{children:["The first area is the ",e.jsx(t.a,{href:"../language/accounts/contracts",children:"contract area"}),", or ",e.jsx(t.code,{children:"account.contracts"}),"."]}),`
`,e.jsx(t.p,{children:"This is the area that stores smart contracts deployed to the account. These contracts contain type definitions, fields, and functions that relate to common functionality. There is no limit to the number of smart contracts an account can store."}),`
`,e.jsxs(t.p,{children:[`:::tip
Much of the functionality that you'd find in a Solidity smart contract is instead written in `,e.jsx(t.a,{href:"../language/transactions.md",children:"transactions"}),` or scripts for Cadence apps. These exist outside the smart contract, which means you don't need to anticipate absolutely everything you might want to do or view before deploying the contract.
:::
The information in the contract area cannot be directly accessed in a transaction unless the transaction imports the contract or returns (reads) a copy of the code deployed to an account.`]}),`
`,e.jsx(t.p,{children:"The owner of an account can directly add or update contracts that are deployed to it."}),`
`,e.jsxs(t.p,{children:[`:::warning[Important]
On Flow Cadence, `,e.jsxs(t.strong,{children:["smart contracts ",e.jsx(t.em,{children:"are"})," upgradeable"]}),". If you make a mistake, you can often ",e.jsx(t.a,{href:"../language/contract-updatability.md",children:"update"}),` it, constrained by some rules, in a public and transparent manner.
:::`]}),`
`,e.jsx(t.h3,{id:"account-storage",children:"Account Storage"}),`
`,e.jsxs(t.p,{children:["The second area is where you'll find ",e.jsx(t.a,{href:"../language/accounts/storage.mdx",children:"account storage"}),", or ",e.jsx(t.code,{children:"account.storage"}),". This area is where an account stores the objects that it owns. This is an important differentiator between Cadence and other languages, because in other languages, assets that accounts own are usually stored in the centralized smart contract ledger that defines the assets."]}),`
`,e.jsxs(t.p,{children:[`:::warning[Important]
In Cadence, each account `,e.jsx(t.strong,{children:"stores its assets as objects directly in its own account storage"}),`, similar to how you store your own possessions in your own house in real life!
:::
The account storage section also stores code that declares the capabilities for controlling how these stored objects can be accessed. We'll cover account storage and capabilities in more detail in a later tutorial.`]}),`
`,e.jsxs(t.p,{children:["In this tutorial, we'll use the account with the address ",e.jsx(t.code,{children:"0x06"})," to store our ",e.jsx(t.code,{children:"HelloWorld"})," contract."]}),`
`,e.jsx(t.h3,{id:"capabilities",children:"Capabilities"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"../language/capabilities.md",children:"Capabilities"}),", or ",e.jsx(t.code,{children:"account.capabilities"}),", are a part of the security model in Cadence. They represent the right to access parts of or all of an object and perform operations on it. For example, a user might possess a vault that holds fungible tokens. In this case, they'll have the capability that allows anyone to deposit tokens into the vault, and may choose to grant the capability to withdraw tokens to their broker's account."]}),`
`,e.jsx(t.h3,{id:"keys",children:"Keys"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"../language/accounts/keys.mdx",children:"Keys"}),", or ",e.jsx(t.code,{children:"account.keys"}),", are used to sign ",e.jsx(t.a,{href:"../language/transactions.md",children:"transactions"}),". In Cadence, an account can have many keys. These keys can be shared or revoked, providing native version of ",e.jsx(t.a,{href:"https://ethereum.org/en/roadmap/account-abstraction",children:"account abstraction"})," that is extremely powerful. For example, you can use it to ",e.jsx(t.a,{href:"https://developers.flow.com/build/guides/account-linking-with-dapper",children:"build an app"})," that pulls NFTs in an embedded wallet in one app into that user's browser wallet and then use them in your app."]}),`
`,e.jsx(t.h2,{id:"deploying-the-helloworld-contract",children:"Deploying the HelloWorld Contract"}),`
`,e.jsxs(t.p,{children:["To deploy a contract, make sure that the account ",e.jsx(t.code,{children:"0x06"})," tab is selected and that the ",e.jsx(t.code,{children:"HelloWorld.cdc"})," file is in the editor. Then, click the ",e.jsx(t.code,{children:"Deploy"})," button to deploy the contents of the editor to account ",e.jsx(t.code,{children:"0x06"}),":"]}),`
`,e.jsx(t.p,{children:e.jsx(t.img,{alt:"Deploy Contract",src:a,placeholder:"blur"})}),`
`,e.jsx(t.p,{children:"You should see a log in the output area indicating that the deployment succeeded:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"Deployed Contract To: 0x06"})})})})}),`
`,e.jsxs(t.p,{children:["You'll also see the name of the contract in the selected account tab underneath the number for the account. This indicates that the ",e.jsx(t.code,{children:"HelloWorld"})," contract has been deployed to the account."]}),`
`,e.jsx(t.p,{children:"You can always look at this tab to verify which contracts are in which accounts."}),`
`,e.jsx(t.h2,{id:"transactions",children:"Transactions"}),`
`,e.jsxs(t.p,{children:["A ",e.jsx(t.a,{href:"../language/transactions.md",children:"Transaction"})," in Flow is defined as an arbitrary-sized block of Cadence code that is authorized by one or more accounts."]}),`
`,e.jsx(t.p,{children:"When an account authorizes a transaction, the code in that transaction has access to the authorizers' private storage."}),`
`,e.jsx(t.p,{children:"An account authorizes a transaction by performing a cryptographic signature on the transaction with the account's private key, which should only be accessible to the account owner."}),`
`,e.jsx(t.p,{children:"In addition to being able to access the authorizer's private assets, transactions can also read and call functions in public contracts, and access public functions in other users' accounts."}),`
`,e.jsx(t.h3,{id:"importing-a-transaction",children:"Importing a transaction"}),`
`,e.jsxs(t.p,{children:["This tutorial uses a transaction to call our ",e.jsx(t.code,{children:"hello()"})," function:"]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Open the ",e.jsx(t.code,{children:"CallHello"})," file in the ",e.jsx(t.code,{children:"Transactions"})," folder."]}),`
`,e.jsxs(t.li,{children:["Import the ",e.jsx(t.strong,{children:"deployed instance"})," of ",e.jsx(t.code,{children:"HelloWorld"})," from account ",e.jsx(t.code,{children:"0x06"}),". If you haven't deployed the smart contract from the account, the transaction won't have access to it and the import will fail."]}),`
`,e.jsxs(t.li,{children:["Add an ",e.jsx(t.code,{children:"import"})," at the top of the file:",`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloWorld"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]})})})}),`
`,"This imports the entire contract code from ",e.jsx(t.code,{children:"HelloWorld"}),", including type definitions and public functions, so that the transaction can use them to interact with the ",e.jsx(t.code,{children:"HelloWorld"})," contract in account ",e.jsx(t.code,{children:"0x06"}),"."]}),`
`,e.jsxs(t.li,{children:["To import any smart contract from any account, use this format:",`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Replace {ContractName} with the name of the contract you want to import"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// and {Address} with the account you want to import it from"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ContractName"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"} "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]})]})})}),`
`,"Transactions are written in Cadence and are declared with the ",e.jsx(t.code,{children:"transaction"})," keyword."]}),`
`,e.jsxs(t.li,{children:["Declare an empty ",e.jsx(t.code,{children:"transaction"}),":",`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // TODO"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,e.jsx(t.h3,{id:"working-with-a-transaction-process",children:"Working with a Transaction Process"}),`
`,e.jsxs(t.p,{children:["Transactions are divided into two main phases, ",e.jsx(t.code,{children:"prepare"})," and ",e.jsx(t.code,{children:"execute"}),"."]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.a,{href:"../language/transactions.md#prepare-phase",children:e.jsx(t.code,{children:"prepare"})})," phase is required and is used to identify the account(s) that will sign the transaction. It's also used when the transaction needs to access the account(s) that signed the transaction. The latter is not needed for this simple transaction."]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Add an empty ",e.jsx(t.code,{children:"prepare"})," statement to your transaction:",`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"prepare"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: &"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // Nothing is needed here for now"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,"The ",e.jsx(t.code,{children:"execute"})," phase is the main body of a transaction. It can call functions on external contracts and objects and perform operations on data that was initialized in the transaction."]}),`
`,e.jsxs(t.li,{children:["Add an ",e.jsx(t.code,{children:"execute"})," block to your transaction and use it to ",e.jsx(t.code,{children:"log"})," the output of the ",e.jsx(t.code,{children:"hello()"})," function from the imported ",e.jsx(t.code,{children:"HelloWorld"})," contract to the console:",`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"execute"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  log"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloWorld"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hello"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,"In this example, the ",e.jsx(t.code,{children:"execute"})," phase calls ",e.jsx(t.code,{children:"HelloWorld.hello()"}),". This executes the ",e.jsx(t.code,{children:"hello()"})," function in the ",e.jsx(t.code,{children:"HelloWorld"})," contract and logs the result(",e.jsx(t.code,{children:"log(HelloWorld.hello())"}),") to the console."]}),`
`,e.jsxs(t.li,{children:["In the box at the bottom right of the editor, select Account ",e.jsx(t.code,{children:"0x06"})," as the transaction signer."]}),`
`,e.jsxs(t.li,{children:["Click the ",e.jsx(t.code,{children:"Send"}),` button to submit the transaction
You should see something similar to the following in the transaction results at the bottom of the screen:`,`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"16:46:56"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"Simple Transaction"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:"[1]"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{children:'Cadence log: "Hello, World!"'})})]})})}),`
`]}),`
`]}),`
`,e.jsxs(t.p,{children:["Congratulations, you just executed your first Cadence transaction with the account ",e.jsx(t.code,{children:"0x06"})," as the signer!"]}),`
`,e.jsx(t.p,{children:"This tutorial shows you the same result if you use different signers for the transaction but later tutorials will use more complex examples that have different results, depending on the signer."}),`
`,e.jsx(t.h2,{id:"conclusion",children:"Conclusion"}),`
`,e.jsxs(t.p,{children:["This tutorial covered an introduction to Cadence, including terms such as accounts, transactions, and signers. We implemented a smart contract that is accessible in all scopes. The smart contract had a ",e.jsx(t.code,{children:"String"})," field initialized with the value ",e.jsx(t.code,{children:"Hello, World!"})," and a function to return (read) this value."]}),`
`,e.jsxs(t.p,{children:["Next, we deployed this contract in an account and implemented a transaction to call the function in the smart contract and log the result to the console. Finally, we used the account ",e.jsx(t.code,{children:"0x06"})," as the signer for this transaction."]}),`
`,e.jsx(t.p,{children:"Now that you have completed the tutorial, you can:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Declare a public Cadence smart contract."}),`
`,e.jsxs(t.li,{children:["Initialize a public ",e.jsx(t.code,{children:"String"})," variable."]}),`
`,e.jsx(t.li,{children:"Write simple transactions in Cadence."}),`
`,e.jsx(t.li,{children:"Describe the role of signers in a Cadence transaction."}),`
`]}),`
`,e.jsx(t.h2,{id:"reference-solution",children:"Reference Solution"}),`
`,e.jsxs(t.p,{children:[`:::warning
You are `,e.jsx(t.strong,{children:"not"})," saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!"]}),`
`,e.jsx(t.p,{children:`Reference solutions are functional, but may not be optimal.
:::`}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"https://play.flow.com/edba10ad-1232-4720-bc1b-cd34cb12b6dc",children:"Reference Solution"})}),`
`]}),`
`]})}function d(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}export{c as _markdown,d as default,r as frontmatter,l as structuredData,h as toc};
