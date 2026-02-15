import{j as i}from"./main-BXy83AsK.js";let a=`

In the [Marketplace Tutorial], we're going to create a marketplace that uses both the fungible and non-fungible token (NFT) contracts that we have learned about in previous tutorials. First, you'll execute a series of transactions to set up the accounts that you'll need to complete the marketplace tutorial. Next, you'll build the marketplace itself.

:::warning
If you're farther along with your Cadence learning journey and found this page looking for a production-ready marketplace, check out the [NFTStorefront repo]!
:::

Objectives [#objectives]

In this tutorial, you'll simply execute transactions that you've already written and validate that the setup is complete. It's only necessary because the playground is not actually a blockchain, so the state is transient.

Getting started [#getting-started]

Open the starter code for this tutorial in the Flow Playground: [play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64].

Your goal for this exercise is to set up the ephemeral playground into the state the blockchain would be in when you begin building a marketplace. It's also a great chance to practice some of what you've learned already. You'll need to:

* Deploy the NFT contract on account \`0x06\`.
* Deploy the fungible token contract on account \`0x07\`.
* Set up account \`0x08\` and \`0x09\` to handle NFTs and tokens compatible with the simplified contracts you've built.
* Give fungible tokens to \`0x08\`.
* Give an NFT to \`0x09\`.

To start, you'll need to deploy some copies of the contracts you've built in the previous tutorials, and call transactions you've already built. For your convenience, they've been provided in the starter playground.

1. Open the \`ExampleToken\` contract. This is the same contract from the fungible token tutorial.
2. Deploy the \`ExampleToken\` code to account \`0x06\`.
3. Switch to the \`IntermediateNFT\` contract.
4. Deploy the NFT code to account \`0x07\` by selecting it as the deploying signer.

Account setup transactions [#account-setup-transactions]

Next, you'll need to execute transactions to set up accounts \`0x08\` and \`0x09\` to be able to work with the contracts for the marketplace. You've already built these transactions in previous exercises.

:::tip
**Remember**: On Flow, accounts must maintain a balance of $FLOW proportional to the amount of storage the account is using. Furthermore, placing something in the storage of an account requires that the receiving account has a capability that can accept the asset type. As a result, accounts can **not** accept arbitrary data (including tokens!) from random contracts without first executing a transaction to allow it.

This might seem like a burden, but it's **great!** Thanks to this feature, one of the most common causes of burning assets is impossible on Flow. You can **not** send property to a random address — only those that know how to receive it!
:::

NFT setup [#nft-setup]

Open the \`NFT Setup\` transaction:

\`\`\`cadence
import IntermediateNFT from 0x07

transaction() {
  prepare(acct: auth(SaveValue, Capabilities) &Account) {
    // Create an empty NFT collection
    acct.storage.save(<-IntermediateNFT.createEmptyCollection(), to: IntermediateNFT.CollectionStoragePath)

    // Create a public capability for the Collection
    let cap = acct.capabilities.storage.issue<&IntermediateNFT.Collection>(IntermediateNFT.CollectionStoragePath)
    acct.capabilities.publish(cap, at: IntermediateNFT.CollectionPublicPath)
  }

  execute {
    log("Empty NFT Collection Created")
  }
}
\`\`\`

This transaction will:

* \`prepare\` an account reference with permissions to create and save capabilities.
* Call \`createEmptyCollection()\` from the \`IntermediateNFT\` contract to create a collection.
* Create and publish public capabilities for the NFT collection.

Run the transaction using \`0x08\` as the signer, then run it again for \`0x09\`.

Fungible token setup [#fungible-token-setup]

Open the \`Fungible Token Setup\` transaction:

\`\`\`cadence
import ExampleToken from 0x06

transaction() {
    prepare(acct: auth(SaveValue, Capabilities) &Account) {
        // Create a vault and save it in account storage
        acct.storage.save(<-ExampleToken.createEmptyVault(), to: ExampleToken.VaultStoragePath)

        // Create and publish a receiver for the fungible tokens
        let cap = acct.capabilities.storage.issue<&ExampleToken.Vault>(
            ExampleToken.VaultStoragePath
        )

        acct.capabilities.publish(cap, at: ExampleToken.VaultPublicPath)
    }

    execute {
        log("Vault Created")
    }
}
\`\`\`

This transaction will:

* Instantiate a constant for and borrow a reference to the \`ExampleToken\` contract.
* Create and add an empty \`ExampleToken\` vault.
* Add the \`Receiver\` [capability] and [publish] it.

Run the transaction using \`0x08\` as the signer, then run it again for \`0x09\`.

Minting NFTs [#minting-nfts]

Now that you've set up both accounts to be able to receive NFTs, it's time to give account \`0x08\` an NFT to sell to \`0x09\`.

:::tip\\[Reminder]
The \`IntermediateNFT\` contract allows **anyone** to freely mint NFTs. You wouldn't want this ability in production, but it is in here to streamline the tutorial.
:::
You've already written a transaction to mint an NFT, so we've provided it here. You just need to call it:

\`\`\`cadence
import IntermediateNFT from 0x07

transaction(description: String) {
    let receiverRef: &IntermediateNFT.Collection

    prepare(account: auth(BorrowValue) &Account) {
        self.receiverRef = account.capabilities
            .borrow<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)
            ?? panic(IntermediateNFT.collectionNotConfiguredError(address: account.address))
    }

    execute {
        let newNFT <- IntermediateNFT.mintNFT(description: description)

        self.receiverRef.deposit(token: <-newNFT)

        log("NFT Minted and deposited to minter's Collection")
    }
}
\`\`\`

Mint an NFT with account \`0x08\`.

Minting fungible tokens [#minting-fungible-tokens]

You've also set up both accounts to be able to receive non-fungible tokens from \`ExampleToken\`.

:::tip\\[Reminder]
The \`ExampleToken\` contract only allows the owner of the contract to mint NFTs.
:::
You've already written a transaction to mint fungible tokens, so we've provided it here. You just need to call it:

\`\`\`cadence
import ExampleToken from 0x06

transaction(recipient: Address, amount: UFix64) {
    let mintingRef: &ExampleToken.VaultMinter
    var receiver: Capability<&{ExampleToken.Receiver}>

    prepare(signer: auth(BorrowValue) &Account) {
        self.mintingRef = signer.storage.borrow<&ExampleToken.VaultMinter>(from: /storage/CadenceFungibleTokenTutorialMinter)
            ?? panic(ExampleToken.vaultNotConfiguredError(address: recipient))

        let recipient = getAccount(recipient)

        // Consider further error handling if this fails
        self.receiver = recipient.capabilities.get<&{ExampleToken.Receiver}>
            (ExampleToken.VaultPublicPath)

    }

    execute {
        // Mint tokens and deposit them into the recipient's Vault
        self.mintingRef.mintTokens(amount: amount, recipient: self.receiver)

        log("Tokens minted and deposited to account "
            .concat(self.receiver.address.toString()))
    }
}
\`\`\`

Call \`Mint Tokens\` with account \`0x06\` as the signer to grant 40 tokens to \`0x09\` and 20 tokens to \`0x08\`.

Validating the setup [#validating-the-setup]

We've provided a script called \`Validate Setup\` that you can use to make sure you've completed the setup correctly.

Run the \`Validate Setup\` script and resolve any issues.

The script should not panic, and you should see something like this output:

\`\`\`zsh
...64807.OwnerInfo(acct8Balance: 40.00000000, acct9Balance: 40.00000000, acct8IDs: [1], acct9IDs: [])
\`\`\`

Conclusion [#conclusion]

With your playground now in the correct state, you're ready to continue with the next tutorial.

Now that you have completed this tutorial, you are able to:

* Set up accounts and deploy contracts required for a basic NFT marketplace on Flow.
* Configure account storage and capabilities for fungible and non-fungible tokens.
* Validate the correct setup of accounts and assets in preparation for marketplace operations.

You do not need to open a new playground session for the marketplace tutorial. You can just continue using this one.

Reference solution [#reference-solution]

:::warning
You are **not** saving time by skipping to the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.
:::

* [Reference Solution]

{/* Reference-style links, do not render on page */}

[Marketplace Tutorial]: ./marketplace-compose

[NFTStorefront repo]: https://github.com/onflow/nft-storefront

[capability]: ../language/capabilities.md

[publish]: ../language/accounts/capabilities.mdx#publishing-capabilities

[Reference Solution]: https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64

[play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64]: https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64
`,l={title:"Marketplace Setup"},h={contents:[{heading:void 0,content:"In the [Marketplace Tutorial], we're going to create a marketplace that uses both the fungible and non-fungible token (NFT) contracts that we have learned about in previous tutorials. First, you'll execute a series of transactions to set up the accounts that you'll need to complete the marketplace tutorial. Next, you'll build the marketplace itself."},{heading:void 0,content:`:::warning
If you're farther along with your Cadence learning journey and found this page looking for a production-ready marketplace, check out the [NFTStorefront repo]!
:::`},{heading:"objectives",content:"In this tutorial, you'll simply execute transactions that you've already written and validate that the setup is complete. It's only necessary because the playground is not actually a blockchain, so the state is transient."},{heading:"getting-started",content:"Open the starter code for this tutorial in the Flow Playground: [play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64]."},{heading:"getting-started",content:"Your goal for this exercise is to set up the ephemeral playground into the state the blockchain would be in when you begin building a marketplace. It's also a great chance to practice some of what you've learned already. You'll need to:"},{heading:"getting-started",content:"Deploy the NFT contract on account `0x06`."},{heading:"getting-started",content:"Deploy the fungible token contract on account `0x07`."},{heading:"getting-started",content:"Set up account `0x08` and `0x09` to handle NFTs and tokens compatible with the simplified contracts you've built."},{heading:"getting-started",content:"Give fungible tokens to `0x08`."},{heading:"getting-started",content:"Give an NFT to `0x09`."},{heading:"getting-started",content:"To start, you'll need to deploy some copies of the contracts you've built in the previous tutorials, and call transactions you've already built. For your convenience, they've been provided in the starter playground."},{heading:"getting-started",content:"Open the `ExampleToken` contract. This is the same contract from the fungible token tutorial."},{heading:"getting-started",content:"Deploy the `ExampleToken` code to account `0x06`."},{heading:"getting-started",content:"Switch to the `IntermediateNFT` contract."},{heading:"getting-started",content:"Deploy the NFT code to account `0x07` by selecting it as the deploying signer."},{heading:"account-setup-transactions",content:"Next, you'll need to execute transactions to set up accounts `0x08` and `0x09` to be able to work with the contracts for the marketplace. You've already built these transactions in previous exercises."},{heading:"account-setup-transactions",content:`:::tip
**Remember**: On Flow, accounts must maintain a balance of $FLOW proportional to the amount of storage the account is using. Furthermore, placing something in the storage of an account requires that the receiving account has a capability that can accept the asset type. As a result, accounts can **not** accept arbitrary data (including tokens!) from random contracts without first executing a transaction to allow it.`},{heading:"account-setup-transactions",content:`This might seem like a burden, but it's &#x2A;*great!** Thanks to this feature, one of the most common causes of burning assets is impossible on Flow. You can **not** send property to a random address — only those that know how to receive it!
:::`},{heading:"nft-setup",content:"Open the `NFT Setup` transaction:"},{heading:"nft-setup",content:"This transaction will:"},{heading:"nft-setup",content:"`prepare` an account reference with permissions to create and save capabilities."},{heading:"nft-setup",content:"Call `createEmptyCollection()` from the `IntermediateNFT` contract to create a collection."},{heading:"nft-setup",content:"Create and publish public capabilities for the NFT collection."},{heading:"nft-setup",content:"Run the transaction using `0x08` as the signer, then run it again for `0x09`."},{heading:"fungible-token-setup",content:"Open the `Fungible Token Setup` transaction:"},{heading:"fungible-token-setup",content:"This transaction will:"},{heading:"fungible-token-setup",content:"Instantiate a constant for and borrow a reference to the `ExampleToken` contract."},{heading:"fungible-token-setup",content:"Create and add an empty `ExampleToken` vault."},{heading:"fungible-token-setup",content:"Add the `Receiver` [capability] and [publish] it."},{heading:"fungible-token-setup",content:"Run the transaction using `0x08` as the signer, then run it again for `0x09`."},{heading:"minting-nfts",content:"Now that you've set up both accounts to be able to receive NFTs, it's time to give account `0x08` an NFT to sell to `0x09`."},{heading:"minting-nfts",content:`:::tip\\[Reminder]
The \`IntermediateNFT\` contract allows **anyone** to freely mint NFTs. You wouldn't want this ability in production, but it is in here to streamline the tutorial.
:::
You've already written a transaction to mint an NFT, so we've provided it here. You just need to call it:`},{heading:"minting-nfts",content:"Mint an NFT with account `0x08`."},{heading:"minting-fungible-tokens",content:"You've also set up both accounts to be able to receive non-fungible tokens from `ExampleToken`."},{heading:"minting-fungible-tokens",content:`:::tip\\[Reminder]
The \`ExampleToken\` contract only allows the owner of the contract to mint NFTs.
:::
You've already written a transaction to mint fungible tokens, so we've provided it here. You just need to call it:`},{heading:"minting-fungible-tokens",content:"Call `Mint Tokens` with account `0x06` as the signer to grant 40 tokens to `0x09` and 20 tokens to `0x08`."},{heading:"validating-the-setup",content:"We've provided a script called `Validate Setup` that you can use to make sure you've completed the setup correctly."},{heading:"validating-the-setup",content:"Run the `Validate Setup` script and resolve any issues."},{heading:"validating-the-setup",content:"The script should not panic, and you should see something like this output:"},{heading:"conclusion",content:"With your playground now in the correct state, you're ready to continue with the next tutorial."},{heading:"conclusion",content:"Now that you have completed this tutorial, you are able to:"},{heading:"conclusion",content:"Set up accounts and deploy contracts required for a basic NFT marketplace on Flow."},{heading:"conclusion",content:"Configure account storage and capabilities for fungible and non-fungible tokens."},{heading:"conclusion",content:"Validate the correct setup of accounts and assets in preparation for marketplace operations."},{heading:"conclusion",content:"You do not need to open a new playground session for the marketplace tutorial. You can just continue using this one."},{heading:"reference-solution",content:`:::warning
You are **not** saving time by skipping to the reference implementation. You'll learn much faster by doing the tutorials as presented!`},{heading:"reference-solution",content:`Reference solutions are functional, but may not be optimal.
:::`},{heading:"reference-solution",content:"[Reference Solution]"}],headings:[{id:"objectives",content:"Objectives"},{id:"getting-started",content:"Getting started"},{id:"account-setup-transactions",content:"Account setup transactions"},{id:"nft-setup",content:"NFT setup"},{id:"fungible-token-setup",content:"Fungible token setup"},{id:"minting-nfts",content:"Minting NFTs"},{id:"minting-fungible-tokens",content:"Minting fungible tokens"},{id:"validating-the-setup",content:"Validating the setup"},{id:"conclusion",content:"Conclusion"},{id:"reference-solution",content:"Reference solution"}]};const r=[{depth:2,url:"#objectives",title:i.jsx(i.Fragment,{children:"Objectives"})},{depth:2,url:"#getting-started",title:i.jsx(i.Fragment,{children:"Getting started"})},{depth:2,url:"#account-setup-transactions",title:i.jsx(i.Fragment,{children:"Account setup transactions"})},{depth:3,url:"#nft-setup",title:i.jsx(i.Fragment,{children:"NFT setup"})},{depth:3,url:"#fungible-token-setup",title:i.jsx(i.Fragment,{children:"Fungible token setup"})},{depth:2,url:"#minting-nfts",title:i.jsx(i.Fragment,{children:"Minting NFTs"})},{depth:2,url:"#minting-fungible-tokens",title:i.jsx(i.Fragment,{children:"Minting fungible tokens"})},{depth:2,url:"#validating-the-setup",title:i.jsx(i.Fragment,{children:"Validating the setup"})},{depth:2,url:"#conclusion",title:i.jsx(i.Fragment,{children:"Conclusion"})},{depth:2,url:"#reference-solution",title:i.jsx(i.Fragment,{children:"Reference solution"})}];function n(s){const e={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsxs(e.p,{children:["In the ",i.jsx(e.a,{href:"./marketplace-compose",children:"Marketplace Tutorial"}),", we're going to create a marketplace that uses both the fungible and non-fungible token (NFT) contracts that we have learned about in previous tutorials. First, you'll execute a series of transactions to set up the accounts that you'll need to complete the marketplace tutorial. Next, you'll build the marketplace itself."]}),`
`,i.jsxs(e.p,{children:[`:::warning
If you're farther along with your Cadence learning journey and found this page looking for a production-ready marketplace, check out the `,i.jsx(e.a,{href:"https://github.com/onflow/nft-storefront",children:"NFTStorefront repo"}),`!
:::`]}),`
`,i.jsx(e.h2,{id:"objectives",children:"Objectives"}),`
`,i.jsx(e.p,{children:"In this tutorial, you'll simply execute transactions that you've already written and validate that the setup is complete. It's only necessary because the playground is not actually a blockchain, so the state is transient."}),`
`,i.jsx(e.h2,{id:"getting-started",children:"Getting started"}),`
`,i.jsxs(e.p,{children:["Open the starter code for this tutorial in the Flow Playground: ",i.jsx(e.a,{href:"https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64",children:"play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64"}),"."]}),`
`,i.jsx(e.p,{children:"Your goal for this exercise is to set up the ephemeral playground into the state the blockchain would be in when you begin building a marketplace. It's also a great chance to practice some of what you've learned already. You'll need to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:["Deploy the NFT contract on account ",i.jsx(e.code,{children:"0x06"}),"."]}),`
`,i.jsxs(e.li,{children:["Deploy the fungible token contract on account ",i.jsx(e.code,{children:"0x07"}),"."]}),`
`,i.jsxs(e.li,{children:["Set up account ",i.jsx(e.code,{children:"0x08"})," and ",i.jsx(e.code,{children:"0x09"})," to handle NFTs and tokens compatible with the simplified contracts you've built."]}),`
`,i.jsxs(e.li,{children:["Give fungible tokens to ",i.jsx(e.code,{children:"0x08"}),"."]}),`
`,i.jsxs(e.li,{children:["Give an NFT to ",i.jsx(e.code,{children:"0x09"}),"."]}),`
`]}),`
`,i.jsx(e.p,{children:"To start, you'll need to deploy some copies of the contracts you've built in the previous tutorials, and call transactions you've already built. For your convenience, they've been provided in the starter playground."}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:["Open the ",i.jsx(e.code,{children:"ExampleToken"})," contract. This is the same contract from the fungible token tutorial."]}),`
`,i.jsxs(e.li,{children:["Deploy the ",i.jsx(e.code,{children:"ExampleToken"})," code to account ",i.jsx(e.code,{children:"0x06"}),"."]}),`
`,i.jsxs(e.li,{children:["Switch to the ",i.jsx(e.code,{children:"IntermediateNFT"})," contract."]}),`
`,i.jsxs(e.li,{children:["Deploy the NFT code to account ",i.jsx(e.code,{children:"0x07"})," by selecting it as the deploying signer."]}),`
`]}),`
`,i.jsx(e.h2,{id:"account-setup-transactions",children:"Account setup transactions"}),`
`,i.jsxs(e.p,{children:["Next, you'll need to execute transactions to set up accounts ",i.jsx(e.code,{children:"0x08"})," and ",i.jsx(e.code,{children:"0x09"})," to be able to work with the contracts for the marketplace. You've already built these transactions in previous exercises."]}),`
`,i.jsxs(e.p,{children:[`:::tip
`,i.jsx(e.strong,{children:"Remember"}),": On Flow, accounts must maintain a balance of $FLOW proportional to the amount of storage the account is using. Furthermore, placing something in the storage of an account requires that the receiving account has a capability that can accept the asset type. As a result, accounts can ",i.jsx(e.strong,{children:"not"})," accept arbitrary data (including tokens!) from random contracts without first executing a transaction to allow it."]}),`
`,i.jsxs(e.p,{children:["This might seem like a burden, but it's ",i.jsx(e.strong,{children:"great!"})," Thanks to this feature, one of the most common causes of burning assets is impossible on Flow. You can ",i.jsx(e.strong,{children:"not"}),` send property to a random address — only those that know how to receive it!
:::`]}),`
`,i.jsx(e.h3,{id:"nft-setup",children:"NFT setup"}),`
`,i.jsxs(e.p,{children:["Open the ",i.jsx(e.code,{children:"NFT Setup"})," transaction:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capabilities"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Create an empty NFT collection"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    acct.storage."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createEmptyCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(), to: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionStoragePath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Create a public capability for the Collection"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" cap = acct.capabilities.storage.issue"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionStoragePath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    acct.capabilities."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cap, at: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  execute"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    log"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Empty NFT Collection Created"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.p,{children:"This transaction will:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"prepare"})," an account reference with permissions to create and save capabilities."]}),`
`,i.jsxs(e.li,{children:["Call ",i.jsx(e.code,{children:"createEmptyCollection()"})," from the ",i.jsx(e.code,{children:"IntermediateNFT"})," contract to create a collection."]}),`
`,i.jsx(e.li,{children:"Create and publish public capabilities for the NFT collection."}),`
`]}),`
`,i.jsxs(e.p,{children:["Run the transaction using ",i.jsx(e.code,{children:"0x08"})," as the signer, then run it again for ",i.jsx(e.code,{children:"0x09"}),"."]}),`
`,i.jsx(e.h3,{id:"fungible-token-setup",children:"Fungible token setup"}),`
`,i.jsxs(e.p,{children:["Open the ",i.jsx(e.code,{children:"Fungible Token Setup"})," transaction:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capabilities"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Create a vault and save it in account storage"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        acct.storage."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createEmptyVault"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(), to: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"VaultStoragePath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Create and publish a receiver for the fungible tokens"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" cap = acct.capabilities.storage.issue"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"            ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"VaultStoragePath"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        )"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        acct.capabilities."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cap, at: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"VaultPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    execute"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        log"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Vault Created"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.p,{children:"This transaction will:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:["Instantiate a constant for and borrow a reference to the ",i.jsx(e.code,{children:"ExampleToken"})," contract."]}),`
`,i.jsxs(e.li,{children:["Create and add an empty ",i.jsx(e.code,{children:"ExampleToken"})," vault."]}),`
`,i.jsxs(e.li,{children:["Add the ",i.jsx(e.code,{children:"Receiver"})," ",i.jsx(e.a,{href:"../language/capabilities.md",children:"capability"})," and ",i.jsx(e.a,{href:"../language/accounts/capabilities.mdx#publishing-capabilities",children:"publish"})," it."]}),`
`]}),`
`,i.jsxs(e.p,{children:["Run the transaction using ",i.jsx(e.code,{children:"0x08"})," as the signer, then run it again for ",i.jsx(e.code,{children:"0x09"}),"."]}),`
`,i.jsx(e.h2,{id:"minting-nfts",children:"Minting NFTs"}),`
`,i.jsxs(e.p,{children:["Now that you've set up both accounts to be able to receive NFTs, it's time to give account ",i.jsx(e.code,{children:"0x08"})," an NFT to sell to ",i.jsx(e.code,{children:"0x09"}),"."]}),`
`,i.jsxs(e.p,{children:[`:::tip[Reminder]
The `,i.jsx(e.code,{children:"IntermediateNFT"})," contract allows ",i.jsx(e.strong,{children:"anyone"}),` to freely mint NFTs. You wouldn't want this ability in production, but it is in here to streamline the tutorial.
:::
You've already written a transaction to mint an NFT, so we've provided it here. You just need to call it:`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(description: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverRef: &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".receiverRef = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            .borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"collectionNotConfiguredError"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".address))"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    execute"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" newNFT "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mintNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(description: description)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".receiverRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(token: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"newNFT)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        log"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"NFT Minted and deposited to minter's Collection"`}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(e.p,{children:["Mint an NFT with account ",i.jsx(e.code,{children:"0x08"}),"."]}),`
`,i.jsx(e.h2,{id:"minting-fungible-tokens",children:"Minting fungible tokens"}),`
`,i.jsxs(e.p,{children:["You've also set up both accounts to be able to receive non-fungible tokens from ",i.jsx(e.code,{children:"ExampleToken"}),"."]}),`
`,i.jsxs(e.p,{children:[`:::tip[Reminder]
The `,i.jsx(e.code,{children:"ExampleToken"}),` contract only allows the owner of the contract to mint NFTs.
:::
You've already written a transaction to mint fungible tokens, so we've provided it here. You just need to call it:`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(recipient: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", amount: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" mintingRef: &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"VaultMinter"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiver: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".mintingRef = signer.storage.borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"VaultMinter"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CadenceFungibleTokenTutorialMinter"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"vaultNotConfiguredError"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: recipient))"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" recipient = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(recipient)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Consider further error handling if this fails"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".receiver = recipient.capabilities.get"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"VaultPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    execute"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Mint tokens and deposit them into the recipient's Vault"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".mintingRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mintTokens"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount: amount, recipient: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".receiver)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        log"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Tokens minted and deposited to account "'})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".receiver.address."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()))"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(e.p,{children:["Call ",i.jsx(e.code,{children:"Mint Tokens"})," with account ",i.jsx(e.code,{children:"0x06"})," as the signer to grant 40 tokens to ",i.jsx(e.code,{children:"0x09"})," and 20 tokens to ",i.jsx(e.code,{children:"0x08"}),"."]}),`
`,i.jsx(e.h2,{id:"validating-the-setup",children:"Validating the setup"}),`
`,i.jsxs(e.p,{children:["We've provided a script called ",i.jsx(e.code,{children:"Validate Setup"})," that you can use to make sure you've completed the setup correctly."]}),`
`,i.jsxs(e.p,{children:["Run the ",i.jsx(e.code,{children:"Validate Setup"})," script and resolve any issues."]}),`
`,i.jsx(e.p,{children:"The script should not panic, and you should see something like this output:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:".."}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:".64807.OwnerInfo"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"acct8Balance:"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 40.00000000,"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" acct9Balance:"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 40.00000000,"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" acct8IDs:"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [1], acct9IDs: [])"})]})})})}),`
`,i.jsx(e.h2,{id:"conclusion",children:"Conclusion"}),`
`,i.jsx(e.p,{children:"With your playground now in the correct state, you're ready to continue with the next tutorial."}),`
`,i.jsx(e.p,{children:"Now that you have completed this tutorial, you are able to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Set up accounts and deploy contracts required for a basic NFT marketplace on Flow."}),`
`,i.jsx(e.li,{children:"Configure account storage and capabilities for fungible and non-fungible tokens."}),`
`,i.jsx(e.li,{children:"Validate the correct setup of accounts and assets in preparation for marketplace operations."}),`
`]}),`
`,i.jsx(e.p,{children:"You do not need to open a new playground session for the marketplace tutorial. You can just continue using this one."}),`
`,i.jsx(e.h2,{id:"reference-solution",children:"Reference solution"}),`
`,i.jsxs(e.p,{children:[`:::warning
You are `,i.jsx(e.strong,{children:"not"})," saving time by skipping to the reference implementation. You'll learn much faster by doing the tutorials as presented!"]}),`
`,i.jsx(e.p,{children:`Reference solutions are functional, but may not be optimal.
:::`}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:i.jsx(e.a,{href:"https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64",children:"Reference Solution"})}),`
`]}),`
`]})}function c(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(n,{...s})}):n(s)}export{a as _markdown,c as default,l as frontmatter,h as structuredData,r as toc};
