import{j as e}from"./main-BXy83AsK.js";import{_ as a}from"./deploybox-BH20AVSo.js";const i="/assets/flow-playground-B2molG-x.png",r="/assets/playground-intro-Bhgu4L-K.png",c="/assets/playground-account-view-u3o6FD-9.png",s="/assets/full-storage-CAaS3Xh5.png";let h=`











<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
  <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} src="https://www.youtube.com/embed/Mtqs4JHjiyI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
</div>

Welcome to our series of guides that get you up to speed on [Cadence] as quickly as possible! In this program, we jump right into making meaningful projects. Don't worry, we'll point you to the important parts of the language reference as each concept is introduced.

This series makes use of the [Flow Playground], an online IDE that enables you to easily write and test Cadence code in a simulated environment.

:::tip
If you already know Solidity, you might want to review the [Cadence Guide for Solidity Developers]. It compares the two languages and points out the most impactful differences from the perspective of a Solidity dev.
:::

Objectives [#objectives]

After completing this tutorial, you'll be able to:

* Write, deploy, and interact with Cadence code in the Flow Playground.
* Select and utilize accounts in the Flow Playground.
* Run Cadence transactions and scripts from the playground.
* Explore the contracts and storage associated with test accounts.

The Flow Developer Playground [#the-flow-developer-playground]

<img alt="Flow Playground" src={__img0} placeholder="blur" />

The [Flow Playground] includes an in-browser editor and Flow emulator that you can use to experiment with Flow Cadence. Using the Flow Playground, you can write Cadence smart contracts, deploy them to a local Flow emulated blockchain, and submit transactions.

It has been primarily tested and optimized for Google Chrome, but other browsers should also work.

The playground comes pre-loaded with contract and transaction templates that correspond to each of the tutorials in this series. The tutorials also include a link (e.g., [play.flow.com/367d1462-f291-481f-aa14-02bb5ce3e897]), which opens the tutorial code in a new tab. The contracts, transactions, and scripts are loaded into the templates in the Playground for you to use.

You'll need to navigate between the editor and this tutorial to read the instructions and make changes to your code.

What is a smart contract? [#what-is-a-smart-contract]

In regular terms, a contract is an agreement between two parties to exchange information or assets. Normally, the terms of a contract are supervised and enforced by a trusted and empowered third party, such as a bank or a lawyer.

A smart contract is a computer program stored in a blockchain that verifies and executes the performance of a contract without the need for any trusted third party. The code itself is public and will perform all operations in an open, repeatable, and testable manner.

Programs that run on blockchains are commonly referred to as smart contracts because they facilitate important functions, such as managing digital currency, without relying on a central authority like a bank.

Flow can run smart contracts written in [Cadence]. It can also run contracts written in Solidity on [Flow EVM]. These guides focus on learning Cadence.

Accounts [#accounts]

Accounts are the primary conduit for user interaction with on-chain code and assets. Users authorize transactions with their accounts and store their owned assets in their account storage.

:::warning
Flow is different from other blockchains in that contracts, assets, and information owned by a user or associated with their wallet address **are stored in the user's account**.
:::
We use the \`warning\` label above to get your attention, but this is a **good thing**! In most other chains, a coding error that accidentally changes a single number in a ledger can destroy, change, or duplicate ownership of an asset or assets. It's like a medieval shop with a bunch of paper IOUs having a gust of wind blow through vs. having the gold in your pocket.

The model of ownership in Cadence makes this kind of loss nearly impossible.

The Flow playground comes with pre-created accounts that you can use for testing and experimentation.

They're listed in the \`Accounts\` section on the bottom left part of the playground window.

<img alt="Playground Intro" src={__img1} placeholder="blur" />

Click on a few of the accounts. They're empty when first created, but you'll see contracts and storage data here as you go through the tutorials.

<img alt="Account View" src={__img2} placeholder="blur" />

Contracts [#contracts]

The playground organizes contract source files under the \`Contracts\` folder in the nav panel on the left side of the window. Until deployed, these are source files not associated with an account or address.

Deploying a contract [#deploying-a-contract]

The default contract in a new playground session is a simple \`HelloWorld\` contract. To deploy:

1. Open the Cadence code in the account editor that contains a contract.
2. Click the \`Deploy\` button in the bottom-right of the screen to deploy that contract to the currently selected account.
   <img alt="Deploy Contract" src={__img3} placeholder="blur" />
   <dl><dd><em>The contract deploys after a few seconds.</em></dd></dl>
3. Select \`0x06-Default\` in the **ACCOUNTS** list.

Here's what happens:

* The name of the contract and the block height it was deployed at appear in the list of \`Deployed Contracts\`.
* \`FlowToken\` objects are listed in the \`Account Storage\` section.
* Every Flow account is created with the ability to manage Flow Tokens.

<img alt="Full Storage View" src={__img4} placeholder="blur" />

Scripts [#scripts]

In Cadence, scripts are simple, transaction-like snippets of code that you can use to **read** onchain data that is public.

Open the \`GetGreeting\` script and \`Execute\` it.

This script loads the instance of the \`HelloWorld\` contract you deployed with account \`0x06\` and returns the result of calling the \`hello\` function, which is the value stored onchain in the contract's \`greeting\` field.

You'll see the \`result\` logged in the console.

Transactions [#transactions]

Cadence transactions are also written in Cadence.

Executing a transaction [#executing-a-transaction]

In the \`Transactions\` folder, you'll find an example of one:

1. Open the \`ChangeGreeting\` transaction.
2. Enter a new \`greeting\` and \`Send\` it.
   * This executes a transaction to call \`changeGreeting\` and update the value in \`greeting\` for this specific instance of \`HelloWorld\`, deployed by address \`0x06\`.
   * Once the transaction completes, you'll see the output in the \`Log\` at the bottom of the window.
3. Open the \`GetGreeting\` script and \`Execute\` it again.

You'll now see your new greeting returned in the log!

Say Hello, World! [#say-hello-world]

You're now ready to write your own contract and say "Hello World!"

Now that you have completed the tutorial, you can:

* Write, deploy, and interact with Cadence code in the Flow Playground.
* Select and utilize accounts in the Flow Playground.
* Run Cadence transactions and scripts from the playground.
* Explore the contracts and storage associated with test accounts.

{/* Relative links. Will not render on the page */}

[Cadence]: ../index.md

[Flow Playground]: https://play.flow.com

[Cadence Guide for Solidity Developers]: ../solidity-to-cadence.md

[Flow EVM]: https://developers.flow.com/evm/about

[Account Model]: ../docs/language/accounts/

[play.flow.com/367d1462-f291-481f-aa14-02bb5ce3e897]: https://play.flow.com/367d1462-f291-481f-aa14-02bb5ce3e897
`,u={title:"First Steps"},p={contents:[{heading:void 0,content:"Welcome to our series of guides that get you up to speed on [Cadence] as quickly as possible! In this program, we jump right into making meaningful projects. Don't worry, we'll point you to the important parts of the language reference as each concept is introduced."},{heading:void 0,content:"This series makes use of the [Flow Playground], an online IDE that enables you to easily write and test Cadence code in a simulated environment."},{heading:void 0,content:`:::tip
If you already know Solidity, you might want to review the [Cadence Guide for Solidity Developers]. It compares the two languages and points out the most impactful differences from the perspective of a Solidity dev.
:::`},{heading:"objectives",content:"After completing this tutorial, you'll be able to:"},{heading:"objectives",content:"Write, deploy, and interact with Cadence code in the Flow Playground."},{heading:"objectives",content:"Select and utilize accounts in the Flow Playground."},{heading:"objectives",content:"Run Cadence transactions and scripts from the playground."},{heading:"objectives",content:"Explore the contracts and storage associated with test accounts."},{heading:"the-flow-developer-playground",content:"The [Flow Playground] includes an in-browser editor and Flow emulator that you can use to experiment with Flow Cadence. Using the Flow Playground, you can write Cadence smart contracts, deploy them to a local Flow emulated blockchain, and submit transactions."},{heading:"the-flow-developer-playground",content:"It has been primarily tested and optimized for Google Chrome, but other browsers should also work."},{heading:"the-flow-developer-playground",content:"The playground comes pre-loaded with contract and transaction templates that correspond to each of the tutorials in this series. The tutorials also include a link (e.g., [play.flow.com/367d1462-f291-481f-aa14-02bb5ce3e897]), which opens the tutorial code in a new tab. The contracts, transactions, and scripts are loaded into the templates in the Playground for you to use."},{heading:"the-flow-developer-playground",content:"You'll need to navigate between the editor and this tutorial to read the instructions and make changes to your code."},{heading:"what-is-a-smart-contract",content:"In regular terms, a contract is an agreement between two parties to exchange information or assets. Normally, the terms of a contract are supervised and enforced by a trusted and empowered third party, such as a bank or a lawyer."},{heading:"what-is-a-smart-contract",content:"A smart contract is a computer program stored in a blockchain that verifies and executes the performance of a contract without the need for any trusted third party. The code itself is public and will perform all operations in an open, repeatable, and testable manner."},{heading:"what-is-a-smart-contract",content:"Programs that run on blockchains are commonly referred to as smart contracts because they facilitate important functions, such as managing digital currency, without relying on a central authority like a bank."},{heading:"what-is-a-smart-contract",content:"Flow can run smart contracts written in [Cadence]. It can also run contracts written in Solidity on [Flow EVM]. These guides focus on learning Cadence."},{heading:"accounts",content:"Accounts are the primary conduit for user interaction with on-chain code and assets. Users authorize transactions with their accounts and store their owned assets in their account storage."},{heading:"accounts",content:`:::warning
Flow is different from other blockchains in that contracts, assets, and information owned by a user or associated with their wallet address **are stored in the user's account**.
:::
We use the \`warning\` label above to get your attention, but this is a **good thing**! In most other chains, a coding error that accidentally changes a single number in a ledger can destroy, change, or duplicate ownership of an asset or assets. It's like a medieval shop with a bunch of paper IOUs having a gust of wind blow through vs. having the gold in your pocket.`},{heading:"accounts",content:"The model of ownership in Cadence makes this kind of loss nearly impossible."},{heading:"accounts",content:"The Flow playground comes with pre-created accounts that you can use for testing and experimentation."},{heading:"accounts",content:"They're listed in the `Accounts` section on the bottom left part of the playground window."},{heading:"accounts",content:"Click on a few of the accounts. They're empty when first created, but you'll see contracts and storage data here as you go through the tutorials."},{heading:"contracts",content:"The playground organizes contract source files under the `Contracts` folder in the nav panel on the left side of the window. Until deployed, these are source files not associated with an account or address."},{heading:"deploying-a-contract",content:"The default contract in a new playground session is a simple `HelloWorld` contract. To deploy:"},{heading:"deploying-a-contract",content:"Open the Cadence code in the account editor that contains a contract."},{heading:"deploying-a-contract",content:"Click the `Deploy` button in the bottom-right of the screen to deploy that contract to the currently selected account.\n\nThe contract deploys after a few seconds."},{heading:"deploying-a-contract",content:"Select `0x06-Default` in the **ACCOUNTS** list."},{heading:"deploying-a-contract",content:"Here's what happens:"},{heading:"deploying-a-contract",content:"The name of the contract and the block height it was deployed at appear in the list of `Deployed Contracts`."},{heading:"deploying-a-contract",content:"`FlowToken` objects are listed in the `Account Storage` section."},{heading:"deploying-a-contract",content:"Every Flow account is created with the ability to manage Flow Tokens."},{heading:"scripts",content:"In Cadence, scripts are simple, transaction-like snippets of code that you can use to **read** onchain data that is public."},{heading:"scripts",content:"Open the `GetGreeting` script and `Execute` it."},{heading:"scripts",content:"This script loads the instance of the `HelloWorld` contract you deployed with account `0x06` and returns the result of calling the `hello` function, which is the value stored onchain in the contract's `greeting` field."},{heading:"scripts",content:"You'll see the `result` logged in the console."},{heading:"transactions",content:"Cadence transactions are also written in Cadence."},{heading:"executing-a-transaction",content:"In the `Transactions` folder, you'll find an example of one:"},{heading:"executing-a-transaction",content:"Open the `ChangeGreeting` transaction."},{heading:"executing-a-transaction",content:"Enter a new `greeting` and `Send` it."},{heading:"executing-a-transaction",content:"This executes a transaction to call `changeGreeting` and update the value in `greeting` for this specific instance of `HelloWorld`, deployed by address `0x06`."},{heading:"executing-a-transaction",content:"Once the transaction completes, you'll see the output in the `Log` at the bottom of the window."},{heading:"executing-a-transaction",content:"Open the `GetGreeting` script and `Execute` it again."},{heading:"executing-a-transaction",content:"You'll now see your new greeting returned in the log!"},{heading:"say-hello-world",content:`You're now ready to write your own contract and say "Hello World!"`},{heading:"say-hello-world",content:"Now that you have completed the tutorial, you can:"},{heading:"say-hello-world",content:"Write, deploy, and interact with Cadence code in the Flow Playground."},{heading:"say-hello-world",content:"Select and utilize accounts in the Flow Playground."},{heading:"say-hello-world",content:"Run Cadence transactions and scripts from the playground."},{heading:"say-hello-world",content:"Explore the contracts and storage associated with test accounts."}],headings:[{id:"objectives",content:"Objectives"},{id:"the-flow-developer-playground",content:"The Flow Developer Playground"},{id:"what-is-a-smart-contract",content:"What is a smart contract?"},{id:"accounts",content:"Accounts"},{id:"contracts",content:"Contracts"},{id:"deploying-a-contract",content:"Deploying a contract"},{id:"scripts",content:"Scripts"},{id:"transactions",content:"Transactions"},{id:"executing-a-transaction",content:"Executing a transaction"},{id:"say-hello-world",content:"Say Hello, World!"}]};const g=[{depth:2,url:"#objectives",title:e.jsx(e.Fragment,{children:"Objectives"})},{depth:2,url:"#the-flow-developer-playground",title:e.jsx(e.Fragment,{children:"The Flow Developer Playground"})},{depth:2,url:"#what-is-a-smart-contract",title:e.jsx(e.Fragment,{children:"What is a smart contract?"})},{depth:2,url:"#accounts",title:e.jsx(e.Fragment,{children:"Accounts"})},{depth:2,url:"#contracts",title:e.jsx(e.Fragment,{children:"Contracts"})},{depth:3,url:"#deploying-a-contract",title:e.jsx(e.Fragment,{children:"Deploying a contract"})},{depth:2,url:"#scripts",title:e.jsx(e.Fragment,{children:"Scripts"})},{depth:2,url:"#transactions",title:e.jsx(e.Fragment,{children:"Transactions"})},{depth:3,url:"#executing-a-transaction",title:e.jsx(e.Fragment,{children:"Executing a transaction"})},{depth:2,url:"#say-hello-world",title:e.jsx(e.Fragment,{children:"Say Hello, World!"})}];function o(n){const t={a:"a",code:"code",h2:"h2",h3:"h3",img:"img",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",maxWidth:"100%"},children:e.jsx("iframe",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%"},src:"https://www.youtube.com/embed/Mtqs4JHjiyI",title:"YouTube video player",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:!0})}),`
`,e.jsxs(t.p,{children:["Welcome to our series of guides that get you up to speed on ",e.jsx(t.a,{href:"../index.md",children:"Cadence"})," as quickly as possible! In this program, we jump right into making meaningful projects. Don't worry, we'll point you to the important parts of the language reference as each concept is introduced."]}),`
`,e.jsxs(t.p,{children:["This series makes use of the ",e.jsx(t.a,{href:"https://play.flow.com",children:"Flow Playground"}),", an online IDE that enables you to easily write and test Cadence code in a simulated environment."]}),`
`,e.jsxs(t.p,{children:[`:::tip
If you already know Solidity, you might want to review the `,e.jsx(t.a,{href:"../solidity-to-cadence.md",children:"Cadence Guide for Solidity Developers"}),`. It compares the two languages and points out the most impactful differences from the perspective of a Solidity dev.
:::`]}),`
`,e.jsx(t.h2,{id:"objectives",children:"Objectives"}),`
`,e.jsx(t.p,{children:"After completing this tutorial, you'll be able to:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Write, deploy, and interact with Cadence code in the Flow Playground."}),`
`,e.jsx(t.li,{children:"Select and utilize accounts in the Flow Playground."}),`
`,e.jsx(t.li,{children:"Run Cadence transactions and scripts from the playground."}),`
`,e.jsx(t.li,{children:"Explore the contracts and storage associated with test accounts."}),`
`]}),`
`,e.jsx(t.h2,{id:"the-flow-developer-playground",children:"The Flow Developer Playground"}),`
`,e.jsx(t.p,{children:e.jsx(t.img,{alt:"Flow Playground",src:i,placeholder:"blur"})}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.a,{href:"https://play.flow.com",children:"Flow Playground"})," includes an in-browser editor and Flow emulator that you can use to experiment with Flow Cadence. Using the Flow Playground, you can write Cadence smart contracts, deploy them to a local Flow emulated blockchain, and submit transactions."]}),`
`,e.jsx(t.p,{children:"It has been primarily tested and optimized for Google Chrome, but other browsers should also work."}),`
`,e.jsxs(t.p,{children:["The playground comes pre-loaded with contract and transaction templates that correspond to each of the tutorials in this series. The tutorials also include a link (e.g., ",e.jsx(t.a,{href:"https://play.flow.com/367d1462-f291-481f-aa14-02bb5ce3e897",children:"play.flow.com/367d1462-f291-481f-aa14-02bb5ce3e897"}),"), which opens the tutorial code in a new tab. The contracts, transactions, and scripts are loaded into the templates in the Playground for you to use."]}),`
`,e.jsx(t.p,{children:"You'll need to navigate between the editor and this tutorial to read the instructions and make changes to your code."}),`
`,e.jsx(t.h2,{id:"what-is-a-smart-contract",children:"What is a smart contract?"}),`
`,e.jsx(t.p,{children:"In regular terms, a contract is an agreement between two parties to exchange information or assets. Normally, the terms of a contract are supervised and enforced by a trusted and empowered third party, such as a bank or a lawyer."}),`
`,e.jsx(t.p,{children:"A smart contract is a computer program stored in a blockchain that verifies and executes the performance of a contract without the need for any trusted third party. The code itself is public and will perform all operations in an open, repeatable, and testable manner."}),`
`,e.jsx(t.p,{children:"Programs that run on blockchains are commonly referred to as smart contracts because they facilitate important functions, such as managing digital currency, without relying on a central authority like a bank."}),`
`,e.jsxs(t.p,{children:["Flow can run smart contracts written in ",e.jsx(t.a,{href:"../index.md",children:"Cadence"}),". It can also run contracts written in Solidity on ",e.jsx(t.a,{href:"https://developers.flow.com/evm/about",children:"Flow EVM"}),". These guides focus on learning Cadence."]}),`
`,e.jsx(t.h2,{id:"accounts",children:"Accounts"}),`
`,e.jsx(t.p,{children:"Accounts are the primary conduit for user interaction with on-chain code and assets. Users authorize transactions with their accounts and store their owned assets in their account storage."}),`
`,e.jsxs(t.p,{children:[`:::warning
Flow is different from other blockchains in that contracts, assets, and information owned by a user or associated with their wallet address `,e.jsx(t.strong,{children:"are stored in the user's account"}),`.
:::
We use the `,e.jsx(t.code,{children:"warning"})," label above to get your attention, but this is a ",e.jsx(t.strong,{children:"good thing"}),"! In most other chains, a coding error that accidentally changes a single number in a ledger can destroy, change, or duplicate ownership of an asset or assets. It's like a medieval shop with a bunch of paper IOUs having a gust of wind blow through vs. having the gold in your pocket."]}),`
`,e.jsx(t.p,{children:"The model of ownership in Cadence makes this kind of loss nearly impossible."}),`
`,e.jsx(t.p,{children:"The Flow playground comes with pre-created accounts that you can use for testing and experimentation."}),`
`,e.jsxs(t.p,{children:["They're listed in the ",e.jsx(t.code,{children:"Accounts"})," section on the bottom left part of the playground window."]}),`
`,e.jsx(t.p,{children:e.jsx(t.img,{alt:"Playground Intro",src:r,placeholder:"blur"})}),`
`,e.jsx(t.p,{children:"Click on a few of the accounts. They're empty when first created, but you'll see contracts and storage data here as you go through the tutorials."}),`
`,e.jsx(t.p,{children:e.jsx(t.img,{alt:"Account View",src:c,placeholder:"blur"})}),`
`,e.jsx(t.h2,{id:"contracts",children:"Contracts"}),`
`,e.jsxs(t.p,{children:["The playground organizes contract source files under the ",e.jsx(t.code,{children:"Contracts"})," folder in the nav panel on the left side of the window. Until deployed, these are source files not associated with an account or address."]}),`
`,e.jsx(t.h3,{id:"deploying-a-contract",children:"Deploying a contract"}),`
`,e.jsxs(t.p,{children:["The default contract in a new playground session is a simple ",e.jsx(t.code,{children:"HelloWorld"})," contract. To deploy:"]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsx(t.li,{children:"Open the Cadence code in the account editor that contains a contract."}),`
`,e.jsxs(t.li,{children:["Click the ",e.jsx(t.code,{children:"Deploy"}),` button in the bottom-right of the screen to deploy that contract to the currently selected account.
`,e.jsx(t.img,{alt:"Deploy Contract",src:a,placeholder:"blur"}),`
`,e.jsx("dl",{children:e.jsx("dd",{children:e.jsx("em",{children:"The contract deploys after a few seconds."})})})]}),`
`,e.jsxs(t.li,{children:["Select ",e.jsx(t.code,{children:"0x06-Default"})," in the ",e.jsx(t.strong,{children:"ACCOUNTS"})," list."]}),`
`]}),`
`,e.jsx(t.p,{children:"Here's what happens:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["The name of the contract and the block height it was deployed at appear in the list of ",e.jsx(t.code,{children:"Deployed Contracts"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"FlowToken"})," objects are listed in the ",e.jsx(t.code,{children:"Account Storage"})," section."]}),`
`,e.jsx(t.li,{children:"Every Flow account is created with the ability to manage Flow Tokens."}),`
`]}),`
`,e.jsx(t.p,{children:e.jsx(t.img,{alt:"Full Storage View",src:s,placeholder:"blur"})}),`
`,e.jsx(t.h2,{id:"scripts",children:"Scripts"}),`
`,e.jsxs(t.p,{children:["In Cadence, scripts are simple, transaction-like snippets of code that you can use to ",e.jsx(t.strong,{children:"read"})," onchain data that is public."]}),`
`,e.jsxs(t.p,{children:["Open the ",e.jsx(t.code,{children:"GetGreeting"})," script and ",e.jsx(t.code,{children:"Execute"})," it."]}),`
`,e.jsxs(t.p,{children:["This script loads the instance of the ",e.jsx(t.code,{children:"HelloWorld"})," contract you deployed with account ",e.jsx(t.code,{children:"0x06"})," and returns the result of calling the ",e.jsx(t.code,{children:"hello"})," function, which is the value stored onchain in the contract's ",e.jsx(t.code,{children:"greeting"})," field."]}),`
`,e.jsxs(t.p,{children:["You'll see the ",e.jsx(t.code,{children:"result"})," logged in the console."]}),`
`,e.jsx(t.h2,{id:"transactions",children:"Transactions"}),`
`,e.jsx(t.p,{children:"Cadence transactions are also written in Cadence."}),`
`,e.jsx(t.h3,{id:"executing-a-transaction",children:"Executing a transaction"}),`
`,e.jsxs(t.p,{children:["In the ",e.jsx(t.code,{children:"Transactions"})," folder, you'll find an example of one:"]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Open the ",e.jsx(t.code,{children:"ChangeGreeting"})," transaction."]}),`
`,e.jsxs(t.li,{children:["Enter a new ",e.jsx(t.code,{children:"greeting"})," and ",e.jsx(t.code,{children:"Send"})," it.",`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["This executes a transaction to call ",e.jsx(t.code,{children:"changeGreeting"})," and update the value in ",e.jsx(t.code,{children:"greeting"})," for this specific instance of ",e.jsx(t.code,{children:"HelloWorld"}),", deployed by address ",e.jsx(t.code,{children:"0x06"}),"."]}),`
`,e.jsxs(t.li,{children:["Once the transaction completes, you'll see the output in the ",e.jsx(t.code,{children:"Log"})," at the bottom of the window."]}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:["Open the ",e.jsx(t.code,{children:"GetGreeting"})," script and ",e.jsx(t.code,{children:"Execute"})," it again."]}),`
`]}),`
`,e.jsx(t.p,{children:"You'll now see your new greeting returned in the log!"}),`
`,e.jsx(t.h2,{id:"say-hello-world",children:"Say Hello, World!"}),`
`,e.jsx(t.p,{children:`You're now ready to write your own contract and say "Hello World!"`}),`
`,e.jsx(t.p,{children:"Now that you have completed the tutorial, you can:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Write, deploy, and interact with Cadence code in the Flow Playground."}),`
`,e.jsx(t.li,{children:"Select and utilize accounts in the Flow Playground."}),`
`,e.jsx(t.li,{children:"Run Cadence transactions and scripts from the playground."}),`
`,e.jsx(t.li,{children:"Explore the contracts and storage associated with test accounts."}),`
`]}),`
`]})}function y(n={}){const{wrapper:t}=n.components||{};return t?e.jsx(t,{...n,children:e.jsx(o,{...n})}):o(n)}export{h as _markdown,y as default,u as frontmatter,p as structuredData,g as toc};
