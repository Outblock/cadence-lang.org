import{j as i}from"./main-BXy83AsK.js";let a=`

In this tutorial, we're going to deploy, store, and transfer **Non-Fungible Tokens (NFTs)**. The NFT is an integral part of blockchain technology. An NFT is a digital asset that represents ownership of something unique and indivisible. Unlike fungible tokens, which operate more like money, you can't divide an NFT, and the owner is likely to be upset if you were to swap one for another without their consent. Examples of NFTs include: [CryptoKitties], [Top Shot Moments], tickets to a really fun concert, or even real property such as a horse or a house!

Production-quality NFTs on Flow implement the [Flow NFT Standard], which defines a basic set of properties for NFTs on Flow.

This tutorial teaches you a basic method of creating simple NFTs to illustrate important language concepts, but will not use the full NFT Standard for the sake of simplicity.

:::tip
If you're already comfortable with Cadence and have found this page looking for information on how to build production-ready NFTs, check out the [NFT Guide] and [Flow NFT Standard] repository.
:::

Objectives [#objectives]

After completing this tutorial, you'll be able to:

* Deploy a basic NFT contract and type definitions.
* Create an NFT object and store it in a user's account storage.
* Write a transaction to mint an NFT and create a capability so others can view it.
* Transfer an NFT from one account to another.
* Use a script to see if an NFT is stored in an account.
* Implement and utilize a dictionary in Cadence.

NFTs on Cadence [#nfts-on-cadence]

Instead of being represented in a central ledger, like in most smart contract languages, Cadence represents each NFT as a **[resource] object that users store in their accounts**. This strategy is a response to the lessons learned by the Flow team (the Chief Architect of Flow is the original proposer and co-author of the [ERC-721 NFT standard]).

It allows NFTs to benefit from the resource ownership rules that are enforced by the [type system] — resources can only have a single owner, they cannot be duplicated, and they cannot be lost due to accidental or malicious programming errors. These protections ensure that owners know that their NFT is safe and can represent an asset that has real value, and helps prevent developers from breaking this trust with easy-to-make programming mistakes.

When users on Flow want to **transact** with each other, they can do so **peer-to-peer**, without having to interact with a central NFT contract, by calling resource-defined methods in both users' accounts.

NFTs in a real-world context make it possible to trade assets and prove who the owner of an asset is. On Flow, NFTs are interoperable: they can be used in different smart contracts and app contexts in an account.

The simplest possible NFT [#the-simplest-possible-nft]

Open the starter code for this tutorial in the Flow Playground: [play.flow.com/ea3aadb6-1ce6-4734-9792-e8fd334af7dc].

At their core, NFTs are simply a way to create true ownership of unique digital property. The simplest possible implementation is a resource with a unique id number.

Implement a simple NFT by creating a [resource] with a constant \`id\` that is assigned in \`init\`. The \`id\` should be public:

\`\`\`cadence
access(all) resource NFT {

    access(all) let id: UInt64

    init(initID: UInt64) {
        self.id = initID
    }
}
\`\`\`

Adding basic metadata [#adding-basic-metadata]

An NFT is also usually expected to include some metadata like a name, description, traits, or a picture. Historically, most of this metadata has been stored off-chain, and the on-chain token only contains a URL or something similar that points to the off-chain metadata.

This practice was necessary due to the original costs of doing anything onchain, but it created the illusion that the actual content of an NFT was permanent and onchain.  Unfortunately, the metadata and images for many older NFT collections can vanish (and sadly, sometimes *have* vanished) at any time.

In Flow, storing this data offchain is possible, but you can—*and normally should*—store all the metadata associated with a token directly on-chain. Unlike many other blockchain networks, **you do not need to consider string storage or manipulation as particularly expensive**.

:::tip
This tutorial describes a simplified implementation. Check out the [the NFT metadata guide] if you want to learn how to do this in production.
:::
Add a public \`metadata\` variable to your NFT. For now, it can be a simple \`String\`-to-\`String\` [dictionary]. Update the \`init\` to also initialize a \`description\` in your metadata. It should now look similar to:

\`\`\`cadence
access(all) resource NFT {
    access(all) let id: UInt64
    access(all) var metadata: {String: String}

    init(initID: UInt64, initDescription: String) {
        self.id = initID
        self.metadata = {"description": initDescription}
    }
}
\`\`\`

Creating the NFT [#creating-the-nft]

As with any complex type in any language, now that you've created the definition for the type, you need to add a way to instantiate new instances of that type, since these instances are the NFTs. This simple NFT type must be initialized with an id number and a \`String\` description.

Traditionally, NFTs are provided with id numbers that indicate the order in which they were minted. To handle this, you can use a simple counter:

1. Add a public, contract-level field to keep track of the last assigned id number.
   \`\`\`cadence
   access(contract) var counter: UInt64
   \`\`\`
   * You're going to immediately get an error in the editor with \`counter\`.
   * Contract-level fields must be initialized in the \`init\` function.
2. Add an \`init\` function to the \`BasicNFT\` contract and initialize \`counter\` to zero:
   \`\`\`cadence
   init() {
       self.counter = 0
   }
   \`\`\`
3. Add a public function to increment the counter and \`create\` and \`return\` an \`NFT\` with a provided description.

:::warning
We're creating a **public** function that allows **anyone** to provide **any** string. Take care when building real apps that will be exposed to humanity.
:::

\`\`\`cadence
access(all) fun mintNFT(description: String): @NFT {
    self.counter = self.counter + 1
    return <- create NFT(initID: self.counter, initDescription: description)
}
\`\`\`

Remember, when you work with a [resource], you must use the [move operator] (\`<-\`) to **move** it from one location to another.

Adding an NFT to your account [#adding-an-nft-to-your-account]

You've gone through the trouble of creating this NFT contract — you deserve the first NFT!

Protect yourself from snipers by updating the \`init\` function to give yourself the first \`NFT\`. You'll need to mint it and save it to your account storage:

\`\`\`cadence
self
    .account
    .storage
    .save(<-self.mintNFT(description: "First one for me!"), to: /storage/BasicNFTPath)
\`\`\`

NFT capability [#nft-capability]

Saving the NFT to your account will give you one, but it will be locked away where no apps can see or access it. Since you've just learned how to create capabilities in the previous tutorial, you can use the same techniques here to create a capability to give others the ability to access the NFT.

:::warning
In Cadence, users own and control their data. A user can destroy a capability such as this whenever they choose. If you want complete control over NFTs or other data, you'd need to store it directly in the contract.

Most of the time, you probably won't want to do this because it will limit what your users can do with their own property without your permission. You don't want to end up in a situation where your users would buy more of your umbrellas to use for shade on sunny days, except you've made it so that they only open when it's raining.
:::
Cadence contracts are deployed to the account of the deployer. As a result, the contract is in the deployer's storage, and the contract itself has read and write access to the storage of the account that they are deployed to by using the built-in [\`self.account\`] field. This is an [account reference] (\`&Account\`), authorized and entitled to access and manage all aspects of the account, such as account storage, capabilities, keys, and contracts.

You can access any of the account functions with \`self.account\` by updating the \`init\` function to create and publish a [capability] allowing public access to the NFT:

\`\`\`cadence
let capability = self
    .account
    .capabilities
    .storage
    .issue<&NFT>(/storage/BasicNFTPath)

self
    .account
    .capabilities
    .publish(capability, at: /public/BasicNFTPath)
\`\`\`

:::danger
The capability you are creating gives everyone full access to all properties of the resource. It does **not** allow other users or developers to move or destroy the resource and is thus harmless.

However, if the resource contained functions to mutate data within the token, this capability would **allow anyone to call it and mutate the data!**
:::
You might be tempted to add this code to \`mintNFT\` so that you can reuse it for anyone who wants to mint the NFT and automatically create the related capability.

The code will work, but it will **not** function the way you're probably expecting it to. In the context of being called from a function inside a contract, \`self.account\` refers to the account of the contract deployer, not the caller of the function. That's you!

Adding \`self.account.save\` or \`self.account.publish\` to \`mintNFT\` allows anyone to attempt to mint and publish capabilities to **your** account, so don't do it!

:::danger
Passing a [fully authorized account reference] as a function parameter is a dangerous anti-pattern.

::::

Deploying and testing [#deploying-and-testing]

Deploy the contract and check the storage for account \`0x06\`.

You'll be able to find your NFT in the storage for \`0x06\`:

\`\`\`text
"value": {
    "value": {
        "id": "A.0000000000000006.BasicNFT.NFT",
        "fields": [
            {
                "value": {
                    "value": "41781441855488",
                    "type": "UInt64"
                },
                "name": "uuid"
            },
            {
                "value": {
                    "value": "1",
                    "type": "UInt64"
                },
                "name": "id"
            },
            {
                "value": {
                    "value": [
                        {
                            "key": {
                                "value": "description",
                                "type": "String"
                            },
                            "value": {
                                "value": "First one for me!",
                                "type": "String"
                            }
                        }
                    ],
                    "type": "Dictionary"
                },
                "name": "metadata"
            }
        ]
    },
    "type": "Resource"
}
\`\`\`

Getting the number of an NFT owned by a user [#getting-the-number-of-an-nft-owned-by-a-user]

We can see the NFT from the storage view for each account, but it's much more useful to write a script or transaction that can do that for any account. You can follow a similar technique as the last tutorial and create a script to use the capability.

Add a script called \`GetNFTNumber\` that returns the id number of the NFT owned by an address. It should accept the \`Address\` of the account you wish to check as an argument.

Try to do this on your own. You should end up with something similar to:

\`\`\`cadence
import BasicNFT from 0x06

access(all) fun main(address: Address): UInt64 {
  let account = getAccount(address)

  let nftReference = account
    .capabilities
    .borrow<&BasicNFT.NFT>(/public/BasicNFTPath)
    ?? panic("Could not borrow a reference\\n")

    return nftReference.id
}
\`\`\`

Minting with a transaction [#minting-with-a-transaction]

You usually don't want a contract with just one NFT given to the account holder. One strategy is to allow anyone who wants to mint an NFT. To do this, you can simply create a transaction that calls the \`mintNFT\` function you added to your contract, and adds the capability for others to view the NFT:

1. Create a transaction called \`MintNFT.cdc\` that mints an NFT for the caller with the \`description\` they provide. You'll need entitlements to borrow values, save values, and issue and publish capabilities.
2. Verify that the NFT isn't already stored in the location used by the contract:
   \`\`\`cadence MintNFT.cdc
   import BasicNFT from 0x06

   transaction {
      prepare(account: auth(
         BorrowValue,
         SaveValue,
         IssueStorageCapabilityController,
         PublishCapability
         ) &Account) {
         if account.storage.borrow<&BasicNFT.NFT>(from: /storage/BasicNFTPath) != nil {
             panic("This user has a token already!")
         }
         // TODO
      }
   }
   \`\`\`
3. Use the \`mintNFT\` function to create an NFT, and then save that NFT in the user's account storage:
   \`\`\`cadence
   account.storage
      .save(<-BasicNFT.mintNFT(description: "Hi there!"), to: /storage/BasicNFTPath)
   \`\`\`
4. Create and publish a capability to access the NFT:
   \`\`\`cadence
   let capability = account
      .capabilities
      .storage
      .issue<&BasicNFT.NFT>(/storage/BasicNFTPath)

   account
      .capabilities
      .publish(capability, at: /public/BasicNFTPath)
   \`\`\`
5. Call the \`MintNFT\` transaction from account \`0x06\`.
   * It will fail because you minted an NFT with \`0x06\` when you deployed the contract.
6. Call \`MintNFT\` from account \`0x07\`. Then, \`Execute\` the \`GetNFTNumber\` script for account \`0x07\`.

You'll see the NFT number \`2\` returned in the log.

Performing a basic transfer [#performing-a-basic-transfer]

Users, independently or with the help of other developers, have the **inherent ability to delete or transfer any resources in their accounts**, including those created by your contracts. To perform a basic transfer:

1. Open the \`Basic Transfer\` transaction. We've stubbed out the beginnings of a transfer transaction for you. Note that we're preparing account references for not one, but **two** accounts: the sender and the recipient.
   \`\`\`cadence Basic Transfer.cdc
   import BasicNFT from 0x06

   transaction {
      prepare(
         signer1: auth(LoadValue) &Account,
         signer2: auth(SaveValue) &Account
      ) {
         // TODO
      }
   }
   \`\`\`
   * While a transaction is open, you can select one or more accounts to sign a transaction. This is because, in Flow, multiple accounts can sign the same transaction, giving access to their private storage.
2. Write a transaction to execute the transfer. You'll need to \`load()\` the NFT from \`signer1\`'s storage and \`save()\` it into \`signer2\`'s storage:
   \`\`\`cadence
   import BasicNFT from 0x06

   transaction {
      prepare(
         signer1: auth(LoadValue) &Account,
         signer2: auth(SaveValue) &Account
      ) {
         let nft <- signer1.storage.load<@BasicNFT.NFT>(from: /storage/BasicNFTPath)
             ?? panic("Could not load NFT from the first signer's storage")

         // WARNING:  Incomplete code, see below
         signer2.storage.save(<-nft, to: /storage/BasicNFTPath)
      }
   }
   \`\`\`
3. Select both account \`0x06\` and account \`0x08\` as the signers. Make sure account \`0x06\` is the first signer.
4. Click the \`Send\` button to send the transaction.
5. Verify the NFT is in account storage for account \`0x08\`.
6. Run the \`GetNFTNumber\` script to check account \`0x08\` to see if a user has an NFT.
   * **You'll get an error here.** The reason is that you haven't created or published the capability on account \`0x08\` to access and return the id number of the NFT owned by that account. You can do this as a part of your transaction, but remember that it isn't required. Another dev, or sophisticated user, could do the transfer **without** publishing a capability.
7. On your own, refactor your transaction to publish a capability in the new owner's account.
   * You're also not making sure that the recipient doesn't already have an NFT in the storage location, so go ahead and add that check as well.

You should end up with something similar to:

\`\`\`cadence
import BasicNFT from 0x06

transaction {
    prepare(
        signer1: auth(LoadValue) &Account,
        signer2: auth(
            SaveValue,
            IssueStorageCapabilityController,
            PublishCapability) &Account
    ) {
        let nft <- signer1.storage.load<@BasicNFT.NFT>(from: /storage/BasicNFTPath)
            ?? panic("Could not load NFT from the first signer's storage")

        if signer2.storage.check<&BasicNFT.NFT>(from: /storage/BasicNFTPath) {
            panic("The recipient already has an NFT")
        }

        signer2.storage.save(<-nft, to: /storage/BasicNFTPath)

        let capability = signer2
        .capabilities
        .storage
        .issue<&BasicNFT.NFT>(/storage/BasicNFTPath)

        signer2
            .capabilities
            .publish(capability, at: /public/BasicNFTPath)
    }
}
\`\`\`

Capabilities referencing moved objects [#capabilities-referencing-moved-objects]

What about the capability you published for account \`0x06\` to access the NFT? What happens to that?

Run \`GetNFTNumber\` for account \`0x06\` to find out.

**You'll get an error** here as well, but this is expected. Capabilities that reference an object in storage return \`nil\` if that storage path is empty.

:::danger

The capability itself is not deleted. If you move an object of the same type back to the storage location reference by the capability, the capability **will** function again.
:::

Reviewing Basic NFTs [#reviewing-basic-nfts]

In this tutorial, you learned how to create a basic NFT with minimal functionality. Your NFT can be held, viewed, and transferred, though it does **not** adhere to the official standard, doesn't allow anyone to own more than one, and is missing other features.

Now that you have completed the tutorial, you should be able to:

* Deploy a basic NFT contract and type definitions.
* Create an NFT object and store it in a user's account storage.
* Write a transaction to mint an NFT and create a capability so others can view it.
* Transfer an NFT from one account to another.
* Use a script to see if an NFT is stored in an account.

In the next tutorial, you'll learn how to make more complete NFTs that allow each user to possess many NFTs from your collection.

Reference Solution [#reference-solution]

:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.
:::

* [Reference Solution]

***

{/* Reference-style links, does not render on page */}

[NFT Guide]: https://developers.flow.com/build/guides/nft

[CryptoKitties]: https://www.cryptokitties.co/

[Top Shot Moments]: https://nbatopshot.com/

[resource]: ../language/resources.mdx

[ERC-721 NFT standard]: https://github.com/ethereum/eips/issues/721

[type system]: ../language/values-and-types/index.md

[Flow NFT Standard]: https://github.com/onflow/flow-nft

[the NFT metadata guide]: https://developers.flow.com/build/advanced-concepts/metadata-views

[dictionary]: ../language/values-and-types/dictionaries.md#dictionary-types

[move operator]: ../language/operators/assign-move-force-swap.md#move-operator--

[\`self.account\`]: ../language/contracts.mdx

[account reference]: ../language/accounts/index.mdx

[capability]: ../language/capabilities.md

[fully authorized account reference]: ../anti-patterns.md#avoid-using-fully-authorized-account-references-as-a-function-parameter

[Reference Solution]: https://play.flow.com/4a74242f-bf77-4efd-9742-31a2b7580b8e

[play.flow.com/ea3aadb6-1ce6-4734-9792-e8fd334af7dc]: https://play.flow.com/ea3aadb6-1ce6-4734-9792-e8fd334af7dc
`,h={title:"Basic NFT",description:"An introduction to a simplified version of NFTs on Cadence."},l={contents:[{heading:void 0,content:"In this tutorial, we're going to deploy, store, and transfer &#x2A;*Non-Fungible Tokens (NFTs)**. The NFT is an integral part of blockchain technology. An NFT is a digital asset that represents ownership of something unique and indivisible. Unlike fungible tokens, which operate more like money, you can't divide an NFT, and the owner is likely to be upset if you were to swap one for another without their consent. Examples of NFTs include: [CryptoKitties], [Top Shot Moments], tickets to a really fun concert, or even real property such as a horse or a house!"},{heading:void 0,content:"Production-quality NFTs on Flow implement the [Flow NFT Standard], which defines a basic set of properties for NFTs on Flow."},{heading:void 0,content:"This tutorial teaches you a basic method of creating simple NFTs to illustrate important language concepts, but will not use the full NFT Standard for the sake of simplicity."},{heading:void 0,content:`:::tip
If you're already comfortable with Cadence and have found this page looking for information on how to build production-ready NFTs, check out the [NFT Guide] and [Flow NFT Standard] repository.
:::`},{heading:"objectives",content:"After completing this tutorial, you'll be able to:"},{heading:"objectives",content:"Deploy a basic NFT contract and type definitions."},{heading:"objectives",content:"Create an NFT object and store it in a user's account storage."},{heading:"objectives",content:"Write a transaction to mint an NFT and create a capability so others can view it."},{heading:"objectives",content:"Transfer an NFT from one account to another."},{heading:"objectives",content:"Use a script to see if an NFT is stored in an account."},{heading:"objectives",content:"Implement and utilize a dictionary in Cadence."},{heading:"nfts-on-cadence",content:"Instead of being represented in a central ledger, like in most smart contract languages, Cadence represents each NFT as a **[resource] object that users store in their accounts**. This strategy is a response to the lessons learned by the Flow team (the Chief Architect of Flow is the original proposer and co-author of the [ERC-721 NFT standard])."},{heading:"nfts-on-cadence",content:"It allows NFTs to benefit from the resource ownership rules that are enforced by the [type system] — resources can only have a single owner, they cannot be duplicated, and they cannot be lost due to accidental or malicious programming errors. These protections ensure that owners know that their NFT is safe and can represent an asset that has real value, and helps prevent developers from breaking this trust with easy-to-make programming mistakes."},{heading:"nfts-on-cadence",content:"When users on Flow want to **transact** with each other, they can do so **peer-to-peer**, without having to interact with a central NFT contract, by calling resource-defined methods in both users' accounts."},{heading:"nfts-on-cadence",content:"NFTs in a real-world context make it possible to trade assets and prove who the owner of an asset is. On Flow, NFTs are interoperable: they can be used in different smart contracts and app contexts in an account."},{heading:"the-simplest-possible-nft",content:"Open the starter code for this tutorial in the Flow Playground: [play.flow.com/ea3aadb6-1ce6-4734-9792-e8fd334af7dc]."},{heading:"the-simplest-possible-nft",content:"At their core, NFTs are simply a way to create true ownership of unique digital property. The simplest possible implementation is a resource with a unique id number."},{heading:"the-simplest-possible-nft",content:"Implement a simple NFT by creating a [resource] with a constant `id` that is assigned in `init`. The `id` should be public:"},{heading:"adding-basic-metadata",content:"An NFT is also usually expected to include some metadata like a name, description, traits, or a picture. Historically, most of this metadata has been stored off-chain, and the on-chain token only contains a URL or something similar that points to the off-chain metadata."},{heading:"adding-basic-metadata",content:"This practice was necessary due to the original costs of doing anything onchain, but it created the illusion that the actual content of an NFT was permanent and onchain.  Unfortunately, the metadata and images for many older NFT collections can vanish (and sadly, sometimes *have* vanished) at any time."},{heading:"adding-basic-metadata",content:"In Flow, storing this data offchain is possible, but you can—*and normally should*—store all the metadata associated with a token directly on-chain. Unlike many other blockchain networks, **you do not need to consider string storage or manipulation as particularly expensive**."},{heading:"adding-basic-metadata",content:":::tip\nThis tutorial describes a simplified implementation. Check out the [the NFT metadata guide] if you want to learn how to do this in production.\n:::\nAdd a public `metadata` variable to your NFT. For now, it can be a simple `String`-to-`String` [dictionary]. Update the `init` to also initialize a `description` in your metadata. It should now look similar to:"},{heading:"creating-the-nft",content:"As with any complex type in any language, now that you've created the definition for the type, you need to add a way to instantiate new instances of that type, since these instances are the NFTs. This simple NFT type must be initialized with an id number and a `String` description."},{heading:"creating-the-nft",content:"Traditionally, NFTs are provided with id numbers that indicate the order in which they were minted. To handle this, you can use a simple counter:"},{heading:"creating-the-nft",content:"Add a public, contract-level field to keep track of the last assigned id number."},{heading:"creating-the-nft",content:"You're going to immediately get an error in the editor with `counter`."},{heading:"creating-the-nft",content:"Contract-level fields must be initialized in the `init` function."},{heading:"creating-the-nft",content:"Add an `init` function to the `BasicNFT` contract and initialize `counter` to zero:"},{heading:"creating-the-nft",content:"Add a public function to increment the counter and `create` and `return` an `NFT` with a provided description."},{heading:"creating-the-nft",content:`:::warning
We're creating a **public** function that allows **anyone** to provide **any** string. Take care when building real apps that will be exposed to humanity.
:::`},{heading:"creating-the-nft",content:"Remember, when you work with a [resource], you must use the [move operator] (`<-`) to **move** it from one location to another."},{heading:"adding-an-nft-to-your-account",content:"You've gone through the trouble of creating this NFT contract — you deserve the first NFT!"},{heading:"adding-an-nft-to-your-account",content:"Protect yourself from snipers by updating the `init` function to give yourself the first `NFT`. You'll need to mint it and save it to your account storage:"},{heading:"nft-capability",content:"Saving the NFT to your account will give you one, but it will be locked away where no apps can see or access it. Since you've just learned how to create capabilities in the previous tutorial, you can use the same techniques here to create a capability to give others the ability to access the NFT."},{heading:"nft-capability",content:`:::warning
In Cadence, users own and control their data. A user can destroy a capability such as this whenever they choose. If you want complete control over NFTs or other data, you'd need to store it directly in the contract.`},{heading:"nft-capability",content:"Most of the time, you probably won't want to do this because it will limit what your users can do with their own property without your permission. You don't want to end up in a situation where your users would buy more of your umbrellas to use for shade on sunny days, except you've made it so that they only open when it's raining.\n:::\nCadence contracts are deployed to the account of the deployer. As a result, the contract is in the deployer's storage, and the contract itself has read and write access to the storage of the account that they are deployed to by using the built-in [`self.account`] field. This is an [account reference] (`&Account`), authorized and entitled to access and manage all aspects of the account, such as account storage, capabilities, keys, and contracts."},{heading:"nft-capability",content:"You can access any of the account functions with `self.account` by updating the `init` function to create and publish a [capability] allowing public access to the NFT:"},{heading:"nft-capability",content:`:::danger
The capability you are creating gives everyone full access to all properties of the resource. It does **not** allow other users or developers to move or destroy the resource and is thus harmless.`},{heading:"nft-capability",content:"However, if the resource contained functions to mutate data within the token, this capability would &#x2A;*allow anyone to call it and mutate the data!**\n:::\nYou might be tempted to add this code to `mintNFT` so that you can reuse it for anyone who wants to mint the NFT and automatically create the related capability."},{heading:"nft-capability",content:"The code will work, but it will **not** function the way you're probably expecting it to. In the context of being called from a function inside a contract, `self.account` refers to the account of the contract deployer, not the caller of the function. That's you!"},{heading:"nft-capability",content:"Adding `self.account.save` or `self.account.publish` to `mintNFT` allows anyone to attempt to mint and publish capabilities to **your** account, so don't do it!"},{heading:"nft-capability",content:`:::danger
Passing a [fully authorized account reference] as a function parameter is a dangerous anti-pattern.`},{heading:"nft-capability",content:"::::"},{heading:"deploying-and-testing",content:"Deploy the contract and check the storage for account `0x06`."},{heading:"deploying-and-testing",content:"You'll be able to find your NFT in the storage for `0x06`:"},{heading:"getting-the-number-of-an-nft-owned-by-a-user",content:"We can see the NFT from the storage view for each account, but it's much more useful to write a script or transaction that can do that for any account. You can follow a similar technique as the last tutorial and create a script to use the capability."},{heading:"getting-the-number-of-an-nft-owned-by-a-user",content:"Add a script called `GetNFTNumber` that returns the id number of the NFT owned by an address. It should accept the `Address` of the account you wish to check as an argument."},{heading:"getting-the-number-of-an-nft-owned-by-a-user",content:"Try to do this on your own. You should end up with something similar to:"},{heading:"minting-with-a-transaction",content:"You usually don't want a contract with just one NFT given to the account holder. One strategy is to allow anyone who wants to mint an NFT. To do this, you can simply create a transaction that calls the `mintNFT` function you added to your contract, and adds the capability for others to view the NFT:"},{heading:"minting-with-a-transaction",content:"Create a transaction called `MintNFT.cdc` that mints an NFT for the caller with the `description` they provide. You'll need entitlements to borrow values, save values, and issue and publish capabilities."},{heading:"minting-with-a-transaction",content:"Verify that the NFT isn't already stored in the location used by the contract:"},{heading:"minting-with-a-transaction",content:"Use the `mintNFT` function to create an NFT, and then save that NFT in the user's account storage:"},{heading:"minting-with-a-transaction",content:"Create and publish a capability to access the NFT:"},{heading:"minting-with-a-transaction",content:"Call the `MintNFT` transaction from account `0x06`."},{heading:"minting-with-a-transaction",content:"It will fail because you minted an NFT with `0x06` when you deployed the contract."},{heading:"minting-with-a-transaction",content:"Call `MintNFT` from account `0x07`. Then, `Execute` the `GetNFTNumber` script for account `0x07`."},{heading:"minting-with-a-transaction",content:"You'll see the NFT number `2` returned in the log."},{heading:"performing-a-basic-transfer",content:"Users, independently or with the help of other developers, have the **inherent ability to delete or transfer any resources in their accounts**, including those created by your contracts. To perform a basic transfer:"},{heading:"performing-a-basic-transfer",content:"Open the `Basic Transfer` transaction. We've stubbed out the beginnings of a transfer transaction for you. Note that we're preparing account references for not one, but **two** accounts: the sender and the recipient."},{heading:"performing-a-basic-transfer",content:"While a transaction is open, you can select one or more accounts to sign a transaction. This is because, in Flow, multiple accounts can sign the same transaction, giving access to their private storage."},{heading:"performing-a-basic-transfer",content:"Write a transaction to execute the transfer. You'll need to `load()` the NFT from `signer1`'s storage and `save()` it into `signer2`'s storage:"},{heading:"performing-a-basic-transfer",content:"Select both account `0x06` and account `0x08` as the signers. Make sure account `0x06` is the first signer."},{heading:"performing-a-basic-transfer",content:"Click the `Send` button to send the transaction."},{heading:"performing-a-basic-transfer",content:"Verify the NFT is in account storage for account `0x08`."},{heading:"performing-a-basic-transfer",content:"Run the `GetNFTNumber` script to check account `0x08` to see if a user has an NFT."},{heading:"performing-a-basic-transfer",content:"**You'll get an error here.** The reason is that you haven't created or published the capability on account `0x08` to access and return the id number of the NFT owned by that account. You can do this as a part of your transaction, but remember that it isn't required. Another dev, or sophisticated user, could do the transfer **without** publishing a capability."},{heading:"performing-a-basic-transfer",content:"On your own, refactor your transaction to publish a capability in the new owner's account."},{heading:"performing-a-basic-transfer",content:"You're also not making sure that the recipient doesn't already have an NFT in the storage location, so go ahead and add that check as well."},{heading:"performing-a-basic-transfer",content:"You should end up with something similar to:"},{heading:"capabilities-referencing-moved-objects",content:"What about the capability you published for account `0x06` to access the NFT? What happens to that?"},{heading:"capabilities-referencing-moved-objects",content:"Run `GetNFTNumber` for account `0x06` to find out."},{heading:"capabilities-referencing-moved-objects",content:"**You'll get an error** here as well, but this is expected. Capabilities that reference an object in storage return `nil` if that storage path is empty."},{heading:"capabilities-referencing-moved-objects",content:":::danger"},{heading:"capabilities-referencing-moved-objects",content:`The capability itself is not deleted. If you move an object of the same type back to the storage location reference by the capability, the capability **will** function again.
:::`},{heading:"reviewing-basic-nfts",content:"In this tutorial, you learned how to create a basic NFT with minimal functionality. Your NFT can be held, viewed, and transferred, though it does **not** adhere to the official standard, doesn't allow anyone to own more than one, and is missing other features."},{heading:"reviewing-basic-nfts",content:"Now that you have completed the tutorial, you should be able to:"},{heading:"reviewing-basic-nfts",content:"Deploy a basic NFT contract and type definitions."},{heading:"reviewing-basic-nfts",content:"Create an NFT object and store it in a user's account storage."},{heading:"reviewing-basic-nfts",content:"Write a transaction to mint an NFT and create a capability so others can view it."},{heading:"reviewing-basic-nfts",content:"Transfer an NFT from one account to another."},{heading:"reviewing-basic-nfts",content:"Use a script to see if an NFT is stored in an account."},{heading:"reviewing-basic-nfts",content:"In the next tutorial, you'll learn how to make more complete NFTs that allow each user to possess many NFTs from your collection."},{heading:"reference-solution",content:`:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!`},{heading:"reference-solution",content:`Reference solutions are functional, but may not be optimal.
:::`},{heading:"reference-solution",content:"[Reference Solution]"}],headings:[{id:"objectives",content:"Objectives"},{id:"nfts-on-cadence",content:"NFTs on Cadence"},{id:"the-simplest-possible-nft",content:"The simplest possible NFT"},{id:"adding-basic-metadata",content:"Adding basic metadata"},{id:"creating-the-nft",content:"Creating the NFT"},{id:"adding-an-nft-to-your-account",content:"Adding an NFT to your account"},{id:"nft-capability",content:"NFT capability"},{id:"deploying-and-testing",content:"Deploying and testing"},{id:"getting-the-number-of-an-nft-owned-by-a-user",content:"Getting the number of an NFT owned by a user"},{id:"minting-with-a-transaction",content:"Minting with a transaction"},{id:"performing-a-basic-transfer",content:"Performing a basic transfer"},{id:"capabilities-referencing-moved-objects",content:"Capabilities referencing moved objects"},{id:"reviewing-basic-nfts",content:"Reviewing Basic NFTs"},{id:"reference-solution",content:"Reference Solution"}]};const r=[{depth:2,url:"#objectives",title:i.jsx(i.Fragment,{children:"Objectives"})},{depth:2,url:"#nfts-on-cadence",title:i.jsx(i.Fragment,{children:"NFTs on Cadence"})},{depth:2,url:"#the-simplest-possible-nft",title:i.jsx(i.Fragment,{children:"The simplest possible NFT"})},{depth:3,url:"#adding-basic-metadata",title:i.jsx(i.Fragment,{children:"Adding basic metadata"})},{depth:3,url:"#creating-the-nft",title:i.jsx(i.Fragment,{children:"Creating the NFT"})},{depth:2,url:"#adding-an-nft-to-your-account",title:i.jsx(i.Fragment,{children:"Adding an NFT to your account"})},{depth:3,url:"#nft-capability",title:i.jsx(i.Fragment,{children:"NFT capability"})},{depth:3,url:"#deploying-and-testing",title:i.jsx(i.Fragment,{children:"Deploying and testing"})},{depth:2,url:"#getting-the-number-of-an-nft-owned-by-a-user",title:i.jsx(i.Fragment,{children:"Getting the number of an NFT owned by a user"})},{depth:2,url:"#minting-with-a-transaction",title:i.jsx(i.Fragment,{children:"Minting with a transaction"})},{depth:2,url:"#performing-a-basic-transfer",title:i.jsx(i.Fragment,{children:"Performing a basic transfer"})},{depth:3,url:"#capabilities-referencing-moved-objects",title:i.jsx(i.Fragment,{children:"Capabilities referencing moved objects"})},{depth:2,url:"#reviewing-basic-nfts",title:i.jsx(i.Fragment,{children:"Reviewing Basic NFTs"})},{depth:2,url:"#reference-solution",title:i.jsx(i.Fragment,{children:"Reference Solution"})}];function n(s){const e={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsxs(e.p,{children:["In this tutorial, we're going to deploy, store, and transfer ",i.jsx(e.strong,{children:"Non-Fungible Tokens (NFTs)"}),". The NFT is an integral part of blockchain technology. An NFT is a digital asset that represents ownership of something unique and indivisible. Unlike fungible tokens, which operate more like money, you can't divide an NFT, and the owner is likely to be upset if you were to swap one for another without their consent. Examples of NFTs include: ",i.jsx(e.a,{href:"https://www.cryptokitties.co/",children:"CryptoKitties"}),", ",i.jsx(e.a,{href:"https://nbatopshot.com/",children:"Top Shot Moments"}),", tickets to a really fun concert, or even real property such as a horse or a house!"]}),`
`,i.jsxs(e.p,{children:["Production-quality NFTs on Flow implement the ",i.jsx(e.a,{href:"https://github.com/onflow/flow-nft",children:"Flow NFT Standard"}),", which defines a basic set of properties for NFTs on Flow."]}),`
`,i.jsx(e.p,{children:"This tutorial teaches you a basic method of creating simple NFTs to illustrate important language concepts, but will not use the full NFT Standard for the sake of simplicity."}),`
`,i.jsxs(e.p,{children:[`:::tip
If you're already comfortable with Cadence and have found this page looking for information on how to build production-ready NFTs, check out the `,i.jsx(e.a,{href:"https://developers.flow.com/build/guides/nft",children:"NFT Guide"})," and ",i.jsx(e.a,{href:"https://github.com/onflow/flow-nft",children:"Flow NFT Standard"}),` repository.
:::`]}),`
`,i.jsx(e.h2,{id:"objectives",children:"Objectives"}),`
`,i.jsx(e.p,{children:"After completing this tutorial, you'll be able to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Deploy a basic NFT contract and type definitions."}),`
`,i.jsx(e.li,{children:"Create an NFT object and store it in a user's account storage."}),`
`,i.jsx(e.li,{children:"Write a transaction to mint an NFT and create a capability so others can view it."}),`
`,i.jsx(e.li,{children:"Transfer an NFT from one account to another."}),`
`,i.jsx(e.li,{children:"Use a script to see if an NFT is stored in an account."}),`
`,i.jsx(e.li,{children:"Implement and utilize a dictionary in Cadence."}),`
`]}),`
`,i.jsx(e.h2,{id:"nfts-on-cadence",children:"NFTs on Cadence"}),`
`,i.jsxs(e.p,{children:["Instead of being represented in a central ledger, like in most smart contract languages, Cadence represents each NFT as a ",i.jsxs(e.strong,{children:[i.jsx(e.a,{href:"../language/resources.mdx",children:"resource"})," object that users store in their accounts"]}),". This strategy is a response to the lessons learned by the Flow team (the Chief Architect of Flow is the original proposer and co-author of the ",i.jsx(e.a,{href:"https://github.com/ethereum/eips/issues/721",children:"ERC-721 NFT standard"}),")."]}),`
`,i.jsxs(e.p,{children:["It allows NFTs to benefit from the resource ownership rules that are enforced by the ",i.jsx(e.a,{href:"../language/values-and-types/index.md",children:"type system"})," — resources can only have a single owner, they cannot be duplicated, and they cannot be lost due to accidental or malicious programming errors. These protections ensure that owners know that their NFT is safe and can represent an asset that has real value, and helps prevent developers from breaking this trust with easy-to-make programming mistakes."]}),`
`,i.jsxs(e.p,{children:["When users on Flow want to ",i.jsx(e.strong,{children:"transact"})," with each other, they can do so ",i.jsx(e.strong,{children:"peer-to-peer"}),", without having to interact with a central NFT contract, by calling resource-defined methods in both users' accounts."]}),`
`,i.jsx(e.p,{children:"NFTs in a real-world context make it possible to trade assets and prove who the owner of an asset is. On Flow, NFTs are interoperable: they can be used in different smart contracts and app contexts in an account."}),`
`,i.jsx(e.h2,{id:"the-simplest-possible-nft",children:"The simplest possible NFT"}),`
`,i.jsxs(e.p,{children:["Open the starter code for this tutorial in the Flow Playground: ",i.jsx(e.a,{href:"https://play.flow.com/ea3aadb6-1ce6-4734-9792-e8fd334af7dc",children:"play.flow.com/ea3aadb6-1ce6-4734-9792-e8fd334af7dc"}),"."]}),`
`,i.jsx(e.p,{children:"At their core, NFTs are simply a way to create true ownership of unique digital property. The simplest possible implementation is a resource with a unique id number."}),`
`,i.jsxs(e.p,{children:["Implement a simple NFT by creating a ",i.jsx(e.a,{href:"../language/resources.mdx",children:"resource"})," with a constant ",i.jsx(e.code,{children:"id"})," that is assigned in ",i.jsx(e.code,{children:"init"}),". The ",i.jsx(e.code,{children:"id"})," should be public:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(initID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".id = initID"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h3,{id:"adding-basic-metadata",children:"Adding basic metadata"}),`
`,i.jsx(e.p,{children:"An NFT is also usually expected to include some metadata like a name, description, traits, or a picture. Historically, most of this metadata has been stored off-chain, and the on-chain token only contains a URL or something similar that points to the off-chain metadata."}),`
`,i.jsxs(e.p,{children:["This practice was necessary due to the original costs of doing anything onchain, but it created the illusion that the actual content of an NFT was permanent and onchain.  Unfortunately, the metadata and images for many older NFT collections can vanish (and sadly, sometimes ",i.jsx(e.em,{children:"have"})," vanished) at any time."]}),`
`,i.jsxs(e.p,{children:["In Flow, storing this data offchain is possible, but you can—",i.jsx(e.em,{children:"and normally should"}),"—store all the metadata associated with a token directly on-chain. Unlike many other blockchain networks, ",i.jsx(e.strong,{children:"you do not need to consider string storage or manipulation as particularly expensive"}),"."]}),`
`,i.jsxs(e.p,{children:[`:::tip
This tutorial describes a simplified implementation. Check out the `,i.jsx(e.a,{href:"https://developers.flow.com/build/advanced-concepts/metadata-views",children:"the NFT metadata guide"}),` if you want to learn how to do this in production.
:::
Add a public `,i.jsx(e.code,{children:"metadata"})," variable to your NFT. For now, it can be a simple ",i.jsx(e.code,{children:"String"}),"-to-",i.jsx(e.code,{children:"String"})," ",i.jsx(e.a,{href:"../language/values-and-types/dictionaries.md#dictionary-types",children:"dictionary"}),". Update the ",i.jsx(e.code,{children:"init"})," to also initialize a ",i.jsx(e.code,{children:"description"})," in your metadata. It should now look similar to:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" metadata: {"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(initID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", initDescription: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".id = initID"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".metadata = {"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"description"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": initDescription}"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h3,{id:"creating-the-nft",children:"Creating the NFT"}),`
`,i.jsxs(e.p,{children:["As with any complex type in any language, now that you've created the definition for the type, you need to add a way to instantiate new instances of that type, since these instances are the NFTs. This simple NFT type must be initialized with an id number and a ",i.jsx(e.code,{children:"String"})," description."]}),`
`,i.jsx(e.p,{children:"Traditionally, NFTs are provided with id numbers that indicate the order in which they were minted. To handle this, you can use a simple counter:"}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:["Add a public, contract-level field to keep track of the last assigned id number.",`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counter: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"})]})})})}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:["You're going to immediately get an error in the editor with ",i.jsx(e.code,{children:"counter"}),"."]}),`
`,i.jsxs(e.li,{children:["Contract-level fields must be initialized in the ",i.jsx(e.code,{children:"init"})," function."]}),`
`]}),`
`]}),`
`,i.jsxs(e.li,{children:["Add an ",i.jsx(e.code,{children:"init"})," function to the ",i.jsx(e.code,{children:"BasicNFT"})," contract and initialize ",i.jsx(e.code,{children:"counter"})," to zero:",`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".counter = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:["Add a public function to increment the counter and ",i.jsx(e.code,{children:"create"})," and ",i.jsx(e.code,{children:"return"})," an ",i.jsx(e.code,{children:"NFT"})," with a provided description."]}),`
`]}),`
`,i.jsxs(e.p,{children:[`:::warning
We're creating a `,i.jsx(e.strong,{children:"public"})," function that allows ",i.jsx(e.strong,{children:"anyone"})," to provide ",i.jsx(e.strong,{children:"any"}),` string. Take care when building real apps that will be exposed to humanity.
:::`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" mintNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(description: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".counter = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".counter "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(initID: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".counter, initDescription: description)"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(e.p,{children:["Remember, when you work with a ",i.jsx(e.a,{href:"../language/resources.mdx",children:"resource"}),", you must use the ",i.jsx(e.a,{href:"../language/operators/assign-move-force-swap.md#move-operator--",children:"move operator"})," (",i.jsx(e.code,{children:"<-"}),") to ",i.jsx(e.strong,{children:"move"})," it from one location to another."]}),`
`,i.jsx(e.h2,{id:"adding-an-nft-to-your-account",children:"Adding an NFT to your account"}),`
`,i.jsx(e.p,{children:"You've gone through the trouble of creating this NFT contract — you deserve the first NFT!"}),`
`,i.jsxs(e.p,{children:["Protect yourself from snipers by updating the ",i.jsx(e.code,{children:"init"})," function to give yourself the first ",i.jsx(e.code,{children:"NFT"}),". You'll need to mint it and save it to your account storage:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .storage"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mintNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(description: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"First one for me!"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"), to: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,i.jsx(e.h3,{id:"nft-capability",children:"NFT capability"}),`
`,i.jsx(e.p,{children:"Saving the NFT to your account will give you one, but it will be locked away where no apps can see or access it. Since you've just learned how to create capabilities in the previous tutorial, you can use the same techniques here to create a capability to give others the ability to access the NFT."}),`
`,i.jsx(e.p,{children:`:::warning
In Cadence, users own and control their data. A user can destroy a capability such as this whenever they choose. If you want complete control over NFTs or other data, you'd need to store it directly in the contract.`}),`
`,i.jsxs(e.p,{children:[`Most of the time, you probably won't want to do this because it will limit what your users can do with their own property without your permission. You don't want to end up in a situation where your users would buy more of your umbrellas to use for shade on sunny days, except you've made it so that they only open when it's raining.
:::
Cadence contracts are deployed to the account of the deployer. As a result, the contract is in the deployer's storage, and the contract itself has read and write access to the storage of the account that they are deployed to by using the built-in `,i.jsx(e.a,{href:"../language/contracts.mdx",children:i.jsx(e.code,{children:"self.account"})})," field. This is an ",i.jsx(e.a,{href:"../language/accounts/index.mdx",children:"account reference"})," (",i.jsx(e.code,{children:"&Account"}),"), authorized and entitled to access and manage all aspects of the account, such as account storage, capabilities, keys, and contracts."]}),`
`,i.jsxs(e.p,{children:["You can access any of the account functions with ",i.jsx(e.code,{children:"self.account"})," by updating the ",i.jsx(e.code,{children:"init"})," function to create and publish a ",i.jsx(e.a,{href:"../language/capabilities.md",children:"capability"})," allowing public access to the NFT:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .capabilities"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .storage"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .issue"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .capabilities"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(capability, at: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,i.jsxs(e.p,{children:[`:::danger
The capability you are creating gives everyone full access to all properties of the resource. It does `,i.jsx(e.strong,{children:"not"})," allow other users or developers to move or destroy the resource and is thus harmless."]}),`
`,i.jsxs(e.p,{children:["However, if the resource contained functions to mutate data within the token, this capability would ",i.jsx(e.strong,{children:"allow anyone to call it and mutate the data!"}),`
:::
You might be tempted to add this code to `,i.jsx(e.code,{children:"mintNFT"})," so that you can reuse it for anyone who wants to mint the NFT and automatically create the related capability."]}),`
`,i.jsxs(e.p,{children:["The code will work, but it will ",i.jsx(e.strong,{children:"not"})," function the way you're probably expecting it to. In the context of being called from a function inside a contract, ",i.jsx(e.code,{children:"self.account"})," refers to the account of the contract deployer, not the caller of the function. That's you!"]}),`
`,i.jsxs(e.p,{children:["Adding ",i.jsx(e.code,{children:"self.account.save"})," or ",i.jsx(e.code,{children:"self.account.publish"})," to ",i.jsx(e.code,{children:"mintNFT"})," allows anyone to attempt to mint and publish capabilities to ",i.jsx(e.strong,{children:"your"})," account, so don't do it!"]}),`
`,i.jsxs(e.p,{children:[`:::danger
Passing a `,i.jsx(e.a,{href:"../anti-patterns.md#avoid-using-fully-authorized-account-references-as-a-function-parameter",children:"fully authorized account reference"})," as a function parameter is a dangerous anti-pattern."]}),`
`,i.jsx(e.p,{children:"::::"}),`
`,i.jsx(e.h3,{id:"deploying-and-testing",children:"Deploying and testing"}),`
`,i.jsxs(e.p,{children:["Deploy the contract and check the storage for account ",i.jsx(e.code,{children:"0x06"}),"."]}),`
`,i.jsxs(e.p,{children:["You'll be able to find your NFT in the storage for ",i.jsx(e.code,{children:"0x06"}),":"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'"value": {'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'    "value": {'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'        "id": "A.0000000000000006.BasicNFT.NFT",'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'        "fields": ['})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"            {"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                "value": {'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                    "value": "41781441855488",'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                    "type": "UInt64"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"                },"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                "name": "uuid"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"            },"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"            {"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                "value": {'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                    "value": "1",'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                    "type": "UInt64"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"                },"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                "name": "id"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"            },"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"            {"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                "value": {'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                    "value": ['})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"                        {"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                            "key": {'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                                "value": "description",'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                                "type": "String"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"                            },"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                            "value": {'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                                "value": "First one for me!",'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                                "type": "String"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"                            }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"                        }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"                    ],"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                    "type": "Dictionary"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"                },"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'                "name": "metadata"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"            }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"        ]"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"    },"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:'    "type": "Resource"'})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{children:"}"})})]})})}),`
`,i.jsx(e.h2,{id:"getting-the-number-of-an-nft-owned-by-a-user",children:"Getting the number of an NFT owned by a user"}),`
`,i.jsx(e.p,{children:"We can see the NFT from the storage view for each account, but it's much more useful to write a script or transaction that can do that for any account. You can follow a similar technique as the last tutorial and create a script to use the capability."}),`
`,i.jsxs(e.p,{children:["Add a script called ",i.jsx(e.code,{children:"GetNFTNumber"})," that returns the id number of the NFT owned by an address. It should accept the ",i.jsx(e.code,{children:"Address"})," of the account you wish to check as an argument."]}),`
`,i.jsx(e.p,{children:"Try to do this on your own. You should end up with something similar to:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" nftReference = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .capabilities"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow a reference'}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" nftReference.id"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h2,{id:"minting-with-a-transaction",children:"Minting with a transaction"}),`
`,i.jsxs(e.p,{children:["You usually don't want a contract with just one NFT given to the account holder. One strategy is to allow anyone who wants to mint an NFT. To do this, you can simply create a transaction that calls the ",i.jsx(e.code,{children:"mintNFT"})," function you added to your contract, and adds the capability for others to view the NFT:"]}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:["Create a transaction called ",i.jsx(e.code,{children:"MintNFT.cdc"})," that mints an NFT for the caller with the ",i.jsx(e.code,{children:"description"})," they provide. You'll need entitlements to borrow values, save values, and issue and publish capabilities."]}),`
`,i.jsxs(e.li,{children:["Verify that the NFT isn't already stored in the location used by the contract:",`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"   prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"      BorrowValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"      SaveValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"      IssueStorageCapabilityController"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"      PublishCapability"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      ) &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      if"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".storage.borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"          panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"This user has a token already!"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:["Use the ",i.jsx(e.code,{children:"mintNFT"})," function to create an NFT, and then save that NFT in the user's account storage:",`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".storage"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mintNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(description: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Hi there!"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"), to: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:["Create and publish a capability to access the NFT:",`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   .capabilities"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   .storage"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   .issue"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   .capabilities"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(capability, at: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:["Call the ",i.jsx(e.code,{children:"MintNFT"})," transaction from account ",i.jsx(e.code,{children:"0x06"}),".",`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:["It will fail because you minted an NFT with ",i.jsx(e.code,{children:"0x06"})," when you deployed the contract."]}),`
`]}),`
`]}),`
`,i.jsxs(e.li,{children:["Call ",i.jsx(e.code,{children:"MintNFT"})," from account ",i.jsx(e.code,{children:"0x07"}),". Then, ",i.jsx(e.code,{children:"Execute"})," the ",i.jsx(e.code,{children:"GetNFTNumber"})," script for account ",i.jsx(e.code,{children:"0x07"}),"."]}),`
`]}),`
`,i.jsxs(e.p,{children:["You'll see the NFT number ",i.jsx(e.code,{children:"2"})," returned in the log."]}),`
`,i.jsx(e.h2,{id:"performing-a-basic-transfer",children:"Performing a basic transfer"}),`
`,i.jsxs(e.p,{children:["Users, independently or with the help of other developers, have the ",i.jsx(e.strong,{children:"inherent ability to delete or transfer any resources in their accounts"}),", including those created by your contracts. To perform a basic transfer:"]}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:["Open the ",i.jsx(e.code,{children:"Basic Transfer"})," transaction. We've stubbed out the beginnings of a transfer transaction for you. Note that we're preparing account references for not one, but ",i.jsx(e.strong,{children:"two"})," accounts: the sender and the recipient.",`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"   prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      signer1: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"LoadValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      signer2: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   ) {"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"While a transaction is open, you can select one or more accounts to sign a transaction. This is because, in Flow, multiple accounts can sign the same transaction, giving access to their private storage."}),`
`]}),`
`]}),`
`,i.jsxs(e.li,{children:["Write a transaction to execute the transfer. You'll need to ",i.jsx(e.code,{children:"load()"})," the NFT from ",i.jsx(e.code,{children:"signer1"}),"'s storage and ",i.jsx(e.code,{children:"save()"})," it into ",i.jsx(e.code,{children:"signer2"}),"'s storage:",`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"   prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      signer1: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"LoadValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      signer2: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   ) {"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" nft "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signer1.storage.load"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<@"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"          ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"Could not load NFT from the first signer's storage"`}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // WARNING:  Incomplete code, see below"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      signer2.storage."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft, to: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:["Select both account ",i.jsx(e.code,{children:"0x06"})," and account ",i.jsx(e.code,{children:"0x08"})," as the signers. Make sure account ",i.jsx(e.code,{children:"0x06"})," is the first signer."]}),`
`,i.jsxs(e.li,{children:["Click the ",i.jsx(e.code,{children:"Send"})," button to send the transaction."]}),`
`,i.jsxs(e.li,{children:["Verify the NFT is in account storage for account ",i.jsx(e.code,{children:"0x08"}),"."]}),`
`,i.jsxs(e.li,{children:["Run the ",i.jsx(e.code,{children:"GetNFTNumber"})," script to check account ",i.jsx(e.code,{children:"0x08"})," to see if a user has an NFT.",`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.strong,{children:"You'll get an error here."})," The reason is that you haven't created or published the capability on account ",i.jsx(e.code,{children:"0x08"})," to access and return the id number of the NFT owned by that account. You can do this as a part of your transaction, but remember that it isn't required. Another dev, or sophisticated user, could do the transfer ",i.jsx(e.strong,{children:"without"})," publishing a capability."]}),`
`]}),`
`]}),`
`,i.jsxs(e.li,{children:["On your own, refactor your transaction to publish a capability in the new owner's account.",`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"You're also not making sure that the recipient doesn't already have an NFT in the storage location, so go ahead and add that check as well."}),`
`]}),`
`]}),`
`]}),`
`,i.jsx(e.p,{children:"You should end up with something similar to:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signer1: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"LoadValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signer2: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"            SaveValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"            IssueStorageCapabilityController"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"            PublishCapability"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ) {"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" nft "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signer1.storage.load"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<@"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"Could not load NFT from the first signer's storage"`}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        if"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signer2.storage.check"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"            panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"The recipient already has an NFT"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signer2.storage."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft, to: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = signer2"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        .capabilities"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        .storage"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        .issue"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signer2"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            .capabilities"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(capability, at: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicNFTPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h3,{id:"capabilities-referencing-moved-objects",children:"Capabilities referencing moved objects"}),`
`,i.jsxs(e.p,{children:["What about the capability you published for account ",i.jsx(e.code,{children:"0x06"})," to access the NFT? What happens to that?"]}),`
`,i.jsxs(e.p,{children:["Run ",i.jsx(e.code,{children:"GetNFTNumber"})," for account ",i.jsx(e.code,{children:"0x06"})," to find out."]}),`
`,i.jsxs(e.p,{children:[i.jsx(e.strong,{children:"You'll get an error"})," here as well, but this is expected. Capabilities that reference an object in storage return ",i.jsx(e.code,{children:"nil"})," if that storage path is empty."]}),`
`,i.jsx(e.p,{children:":::danger"}),`
`,i.jsxs(e.p,{children:["The capability itself is not deleted. If you move an object of the same type back to the storage location reference by the capability, the capability ",i.jsx(e.strong,{children:"will"}),` function again.
:::`]}),`
`,i.jsx(e.h2,{id:"reviewing-basic-nfts",children:"Reviewing Basic NFTs"}),`
`,i.jsxs(e.p,{children:["In this tutorial, you learned how to create a basic NFT with minimal functionality. Your NFT can be held, viewed, and transferred, though it does ",i.jsx(e.strong,{children:"not"})," adhere to the official standard, doesn't allow anyone to own more than one, and is missing other features."]}),`
`,i.jsx(e.p,{children:"Now that you have completed the tutorial, you should be able to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Deploy a basic NFT contract and type definitions."}),`
`,i.jsx(e.li,{children:"Create an NFT object and store it in a user's account storage."}),`
`,i.jsx(e.li,{children:"Write a transaction to mint an NFT and create a capability so others can view it."}),`
`,i.jsx(e.li,{children:"Transfer an NFT from one account to another."}),`
`,i.jsx(e.li,{children:"Use a script to see if an NFT is stored in an account."}),`
`]}),`
`,i.jsx(e.p,{children:"In the next tutorial, you'll learn how to make more complete NFTs that allow each user to possess many NFTs from your collection."}),`
`,i.jsx(e.h2,{id:"reference-solution",children:"Reference Solution"}),`
`,i.jsxs(e.p,{children:[`:::warning
You are `,i.jsx(e.strong,{children:"not"})," saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!"]}),`
`,i.jsx(e.p,{children:`Reference solutions are functional, but may not be optimal.
:::`}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:i.jsx(e.a,{href:"https://play.flow.com/4a74242f-bf77-4efd-9742-31a2b7580b8e",children:"Reference Solution"})}),`
`]}),`
`,i.jsx(e.hr,{}),`
`]})}function c(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(n,{...s})}):n(s)}export{a as _markdown,c as default,h as frontmatter,l as structuredData,r as toc};
