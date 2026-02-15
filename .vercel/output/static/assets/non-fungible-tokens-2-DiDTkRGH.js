import{j as e}from"./main-BXy83AsK.js";let a=`

In the [last tutorial], you implemented a simple NFT that users could mint, hold, and trade, but there was a serious flaw: each user could only hold one NFT at a time. In this tutorial, you'll improve your implementation to allow it to grant users multiple NFTs and with the tools you need to manage them.

:::tip
If you're already comfortable with Cadence and have found this page looking for information on how to build production-ready NFTs, check out the [NFT Guide] and the [Flow NFT Standard] repository.
:::

Objectives [#objectives]

After completing this tutorial, you'll be able to:

* Implement a collection [resource] that can manage multiple NFTs on behalf of a user.
* Create an [entitlement] to limit some functionality of a [resource] to the owner.
* Handle errors more elegantly with functions that generate error messages.

Storing multiple NFTs in a collection [#storing-multiple-nfts-in-a-collection]

Open the starter code for this tutorial in the Flow Playground: [play.flow.com/9da6f80f-cd79-4797-a067-47a57dc54770].

This tutorial continues from the last one, but we'll be doing significant refactoring. The provided starter contains the NFT resource, but **removes the code and transactions** for creating NFTs and capabilities to interact with them. You'll replace those with a more sophisticated approach that will allow collections of NFTs.

It also adds some constants for the paths we'll be using, so we don't need to worry about typos as we add them to several transactions and scripts.

As you've likely noticed, the setup and operations that we used in the previous tutorial are not very scalable. Users need a way to store multiple NFTs from a collection and tools to manage all of those NFTs from a single place.

Using a [dictionary] on its own to store our NFTs would solve the problem of having to use different storage paths for each NFT, but it doesn't solve all the problems.

Resources that own resources [#resources-that-own-resources]

Instead, we can use a powerful feature of Cadence — resources owning other resources! We'll define a new \`Collection\` resource as our NFT storage place to enable more sophisticated ways to interact with our NFTs. This pattern comes with interesting powers and side effects.

Since the \`Collection\` explicitly owns the NFTs in it, the owner could transfer all of the NFTs at once by just transferring the single collection. In addition to allowing easy batch transfers, this means that if a unique NFT wants to own another unique NFT, like a CryptoKitty owning a hat accessory, the Kitty literally stores the hat in its own fields and effectively owns it.

The hat belongs to the CryptoKitty that it is stored in, and the hat can be transferred separately or along with the CryptoKitty that owns it. Cadence is a fully object-oriented language, so ownership is indicated by where an object is stored, not just an entry in a ledger.

:::danger
When the NFT \`Collection\` resource is destroyed with the \`destroy\` command, all the resources stored in the dictionary are also \`destroy\`ed.
:::

Adding an NFT collection [#adding-an-nft-collection]

Add a public resource definition called \`Collection\` to the \`IntermediateNFT\` contract. In it, add a public [dictionary] called \`ownedNFTs\` that maps \`NFT\`s to their \`Uint64\` id numbers. Initialize \`ownedNFTs\` with an empty dictionary:

\`\`\`cadence
access(all) resource Collection {
    access(all) var ownedNFTs: @{UInt64: NFT}

    init () {
        self.ownedNFTs <- {}
    }
}
\`\`\`

:::tip
Cadence is an object-oriented language. Inside a composite type, such as a [resource], \`self\` refers to the instance of that type and **not** the contract itself.
:::
Dictionary definitions in Cadence don't always need the \`@\` symbol in the type specification, but because the \`ownedNFTs\` mapping stores resources, the whole field must become a resource type. Therefore, you need the \`@\` symbol indicating that \`ownedNFTs\` is a resource type.

As a result, all the rules that apply to resources apply to this type.

Writing utility functions [#writing-utility-functions]

It's helpful for a collection to be able to handle some basic operations, such as accepting an NFT into the collection, validating whether or not a token is present, or sharing a list of all token IDs.

1. Write a function in the \`Collection\` \`resource\` to \`deposit\` a token into \`ownedNFTs\`:
   \`\`\`cadence
   access(all) fun deposit(token: @NFT) {
       self.ownedNFTs[token.id] <-! token
   }
   \`\`\`
   * Notice that we're using the \`<-!\` force assignment operator to move the token. This will still give a runtime error if the location already has something else stored, but it won't give a typecheck error like the \`<-\` move operator would in this instance.
2. Write a function called \`idExists\` that returns a \`Bool\` - \`true\` if the id is present and \`false\` if it is not.
3. Write a function called \`getIDs\` that returns an array of the \`UInt64\` ids of all NFTs found in the collection. Make use of the built-in \`keys\` function present on the dictionary type:

   \`\`\`cadence
   access(all) view fun idExists(id: UInt64): Bool {
       return self.ownedNFTs[id] != nil
   }

   access(all) view fun getIDs(): [UInt64] {
       return self.ownedNFTs.keys
   }
   \`\`\`

Collection capabilities [#collection-capabilities]

For the NFT \`Collection\`, we will publish a capability to allow anyone to access the utility functions you just created — depositing NFTs into it, verifying if an NFT is in the collection, or getting the ids of all NFTs present. We'll also need functionality to withdraw an NFT and remove it from the collection, but we obviously **don't** want just anyone to be able to do that — *only* the owner.

Capability security [#capability-security]

This is where an important layer of access control comes in — Cadence utilizes [capability security], which means that for any given object, a user is allowed to access a field or method of that object if they either:

* are the owner of the object, or
* have a valid reference to that field or method (note that references can only be created from capabilities, and capabilities can only be created by the owner of the object).

When a user stores their NFT \`Collection\` in their account storage, it is by default not available for other users to access because it requires access to the authorized account object (\`auth(Storage) &Account\`) which is only accessible by a transaction that the owner authorizes and signs.

To give external accounts access to the \`access(all)\` fields and functions, the owner (usually with the help of a developer creating a transaction) creates a link to the object in storage.

This link creates a capability. From there, it could be passed as a parameter to a function for one-time-use, or it could be put in the \`/public/\` domain of the user's account so that anyone can access it.

You've done this already when you've written transactions to \`issue\` and \`publish\` capabilities.

Using entitlements [#using-entitlements]

We do not want everyone in the network to be able to call our \`withdraw\` function, though.

In Cadence, any reference can be freely up-casted or down-casted to any subtype or supertype that the reference conforms to. This means that if you had a reference of the type \`&ExampleNFT.Collection\`, this would expose all the \`access(all)\` functions on the \`Collection\`.

This is a powerful feature that is very useful, but it also means if there is any privileged functionality on a resource that has any capabilities created for it, public, or private, then this functionality cannot be \`access(all)\`.

It needs to use [entitlements].

Entitlements enable you to restrict the scope of access at a granular level, with the option to group restrictions under similarly named entitlements. Owners of resources can then use these entitlements to grant access to the subset of actions enabled by the authorized reference.

:::tip
If you're used to Solidity, you can think of this as being similar to frameworks that enable you to use modifiers to limit some functions to specific addresses with the correct role, such as \`onlyOwner\`. It's quite a bit more powerful, though!
:::

1. Define an [entitlement] called \`Withdraw\` in your contract at the contract level.

   \`\`\`cadence
   access(all) entitlement Withdraw
   \`\`\`

   * You've now effectively created a type of lock that can only be opened by someone with the right key - or the owner of the property, who always has access natively.

2. Implement a \`withdraw\` function inside the \`Collection\` resource. It should:

   * Only allow \`access\` with the \`Withdraw\` [entitlement].
   * Accept the id of the NFT to be withdrawn as an argument.
   * Return an error if the NFT with that id is not present in the account's \`ownedNFTs\`.
   * Return the **actual token resource**.

   You should end up with something similar to:

   \`\`\`cadence
   access(Withdraw) fun withdraw(withdrawID: UInt64): @NFT {
       let token <- self.ownedNFTs.remove(key: withdrawID)
           ?? panic("Could not withdraw an ExampleNFT.NFT with id="
                .concat(withdrawID.toString())
                .concat("Verify that the collection owns the NFT ")
                .concat("with the specified ID first before withdrawing it."))

      return <-token
   }
   \`\`\`

Providing an access scope of \`access(Withdraw)\` locks this functionality to only the owner who has the [resource] directly in their storage, **or** to any code possessing a reference to this resource that has the \`Withdraw\` entitlement.

As with other types defined in contracts, these are namespaced to the deployer and contract. The full name of \`Withdraw\` would be something like \`0x06.IntermediateNFT.Withdraw\`. More than one contract or account can declare separate and distinct entitlements with the same name.

Issuing an entitlement [#issuing-an-entitlement]

The owner of an object is the only one who can sign a transaction to create an entitled capability or reference.

In the above example, if you wanted to make the withdraw function publicly accessible, you could issue the capability as an *entitled* capability by specifying all the entitlements in the capability's type specification using the \`auth\` keyword:

\`\`\`cadence
// DANGEROUS CODE EXAMPLE - DO NOT USE
let cap = self.account.capabilities.storage
    .issue<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>(
        self.CollectionStoragePath
    )
self.account.capabilities.publish(cap, at: self.CollectionPublicPath)
\`\`\`

Now, anyone could borrow that capability as the entitled version it was issued as
and steal your NFT! This is why it is always so important to use well-defined entitlements in all your important functions and be very careful how you create your capabilities and publish them:

\`\`\`cadence
let entitledCollectionRef = recipient.capabilities
    .borrow<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>(ExampleNFT.CollectionPublicPath)
    ?? panic("Could not borrow a reference to the ExampleNFT.Collection")

let stolenNFT <- entitledCollectionRef.withdraw(withdrawID: 1)
\`\`\`

Later tutorials will cover more nuanced methods for sharing an [entitlement].

Creating empty collections [#creating-empty-collections]

Finally, your contract needs a way to create an empty collection to initialize the user's account when they start collecting your NFTs.

Add a function to create and return an empty \`Collection\`:

\`\`\`cadence
access(all) fun createEmptyCollection(): @Collection {
    return <- create Collection()
}
\`\`\`

Error handling [#error-handling]

Thinking ahead, many of the transactions that we might write (or other developers composing on our contracts) will need to borrow a reference to a user's collection. We can make everyone's lives easier by adding a function to help create that error in a nice and consistent manner.

Write a function at the contract level called \`collectionNotConfiguredError\` that accepts an \`address\` and returns a descriptive error message that the collection was not found:

\`\`\`cadence
access(all) fun collectionNotConfiguredError(address: Address): String {
    return "Could not borrow a collection reference to recipient's IntermediateNFT.Collection from the path \\(IntermediateNFT.CollectionPublicPath.toString()). Make sure account \\(address.toString()) has set up its account with an IntermediateNFT Collection."
    }
\`\`\`

Deploying the contract [#deploying-the-contract]

Deploy the \`IntermediateNFT\` contract with account \`0x06\`.

Creating collections [#creating-collections]

We'll need several transactions to manage our NFT collection. The first is one to allow users to create a collection on their account.

On your own, implement a transaction in \`CreateCollection.cdc\` to create and save a \`Collection\` in the caller's account, and also \`issue\` and \`publish\` a capability for that collection.

You should end up with something similar to:

\`\`\`cadence
import IntermediateNFT from 0x06

transaction {
    prepare(account: auth(SaveValue, Capabilities) &Account) {
        // You may want to make sure one doesn't exist, but the native error is descriptive as well
        let collection <- IntermediateNFT.createEmptyCollection()

        account.storage.save(<-collection, to: IntermediateNFT.CollectionStoragePath)

        log("Collection created")

        let cap = account.capabilities.storage.issue<&IntermediateNFT.Collection>(IntermediateNFT.CollectionStoragePath)
        account.capabilities.publish(cap, at: IntermediateNFT.CollectionPublicPath)

        log("Capability created")
    }
}
\`\`\`

Test your transaction by creating \`Collections\` for several accounts. Try it with accounts that do and do **not** have \`Collections\` already, and verify that the correct behavior occurs.

Minting an NFT [#minting-an-nft]

To mint an NFT:

1. Add a transaction to mint an NFT and grant it to the caller. Use the \`prepare\` phase to \`borrow\` a reference to the caller's \`Collection\` and store it in a transaction-level field.

2. Use \`execute\` to create the NFT and use the \`Collection\`'s \`deposit\` function to save it in the \`Collection\`.

   * It's a better practice to separate code that accesses accounts and storage to collect authorized references from the code that executes the changes to state. You can pass arguments, such as the \`String\` for the NFT \`description\` by defining parameters on the \`transaction\`.

   Your transaction should be similar to:

   \`\`\`cadence
   import IntermediateNFT from 0x06

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

3. Test your transaction by minting several NFTs for several accounts. Try it with accounts that do and do **not** have \`Collections\` and verify that the correct behavior occurs.

Printing the NFTs owned by an account [#printing-the-nfts-owned-by-an-account]

Remember, you can use scripts to access functionality that doesn't need authorization, such as the function to \`getIDs\` for all the NFTs in a \`Collection\`.

Write a script to \`PrintNFTs\` for the provided address.

You can also pass arguments into the \`main\` function in a script:

\`\`\`cadence
import IntermediateNFT from 0x06

access(all) fun main(address: Address): [UInt64] {
    let nftOwner = getAccount(address)

    let capability = nftOwner.capabilities.get<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)

    let receiverRef = nftOwner.capabilities
        .borrow<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)
        ?? panic(IntermediateNFT.collectionNotConfiguredError(address: address))


    log("Account "
      .concat(address.toString())
      .concat(" NFTs")
    )

    return receiverRef.getIDs()
}
\`\`\`

Transferring NFTs [#transferring-nfts]

Finally, you'll want to provide a method for users to \`Transfer\` NFTs to one another. To do so, you'll need to \`withdraw\` the NFT from the owner's \`Collection\` and \`deposit\` it to the recipient.

This transaction is **not** bound by the \`Withdraw\` capability, because the caller will be the account that has the NFT in storage, which automatically possesses full entitlement to everything in its own storage. It also doesn't need the permission of or a signature from the recipient, because we gave the \`deposit\` function \`access(all)\` and published a public capability to it.

1. Start by stubbing out a transaction that accepts a \`recipientAddress\` and \`tokenId\`. It should have a transaction-level field called \`transferToken\` to store the NFT temporarily, between the \`prepare\` and \`execute\` phases:

   \`\`\`cadence
   import IntermediateNFT from 0x06

   transaction(recipientAddress: Address, tokenId: UInt64) {
       let transferToken: @IntermediateNFT.NFT

       prepare(account: auth(BorrowValue) &Account) {
           // TODO
      }

      execute {
          // TODO
      }
   }
   \`\`\`

2. In \`prepare\`, get an entitled reference to the sender's \`Collection\` and use it to \`move (<-)\` the token out of their collection and into \`transferToken\`:

   \`\`\`cadence
   let collectionRef = account.storage
       .borrow<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>(from: IntermediateNFT.CollectionStoragePath)
       ?? panic(IntermediateNFT.collectionNotConfiguredError(address: account.address))

   self.transferToken <- collectionRef.withdraw(withdrawID: tokenId)
   \`\`\`

3. Use \`execute\` to execute the transfer by getting a public reference to the recipient's account, using that to get a reference to the capability for the recipient's \`Collection\`, and using the \`deposit\` function to \`move (<-)\` the NFT:

   \`\`\`cadence
   let recipient = getAccount(recipientAddress)

   let receiverRef = recipient.capabilities
       .borrow<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)
       ?? panic(IntermediateNFT.collectionNotConfiguredError(address: recipient.address))

   receiverRef.deposit(token: <-self.transferToken)

   log("NFT ID transferred to account \\(recipient.address.toString())")
   \`\`\`

4. Test your transaction by transferring several NFTs in several accounts. Try various combinations, and use the \`PrintNFTs\` script to make sure the NFTs move as expected.

Reviewing intermediate NFTs [#reviewing-intermediate-nfts]

In this tutorial, you learned how to expand the functionality of your basic NFT to allow users to create collections of NFTs, then mint and trade those collections. You also learned more about the details of [entitlements] and how you can use them to protect functionality so that only those who are supposed to be able to access something are able to.

Now that you have completed the tutorial, you should be able to:

* Implement a collection [resource] that can manage multiple NFTs on behalf of a user.
* Create an [entitlement] to limit some functionality of a [resource] to the owner.
* Handle errors more elegantly with functions that generate error messages.

In the next tutorial, you'll learn how to create fungible token collections.

Reference Solution [#reference-solution]

:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.
:::

* [Reference Solution]

{/* Reference-style links, will not render on the page */}

[NFT Guide]: https://developers.flow.com/build/guides/nft

[Flow NFT Standard]: https://github.com/onflow/flow-nft

[last tutorial]: ./non-fungible-tokens-1

[resource]: ../language/resources.mdx

[entitlement]: ../language/access-control.md

[dictionary]: ../language/values-and-types/dictionaries.md

[capability security]: ../language/capabilities.md

[entitlements]: ../language/access-control.md#entitlements

[Reference Solution]: https://play.flow.com/72bf4f76-fa1a-4b24-8f5e-f1e5aab9f39d

[play.flow.com/9da6f80f-cd79-4797-a067-47a57dc54770]: https://play.flow.com/9da6f80f-cd79-4797-a067-47a57dc54770
`,l={title:"Intermediate NFTs",description:"Learn how to manage collections of NFTs in Cadence"},h={contents:[{heading:void 0,content:"In the [last tutorial], you implemented a simple NFT that users could mint, hold, and trade, but there was a serious flaw: each user could only hold one NFT at a time. In this tutorial, you'll improve your implementation to allow it to grant users multiple NFTs and with the tools you need to manage them."},{heading:void 0,content:`:::tip
If you're already comfortable with Cadence and have found this page looking for information on how to build production-ready NFTs, check out the [NFT Guide] and the [Flow NFT Standard] repository.
:::`},{heading:"objectives",content:"After completing this tutorial, you'll be able to:"},{heading:"objectives",content:"Implement a collection [resource] that can manage multiple NFTs on behalf of a user."},{heading:"objectives",content:"Create an [entitlement] to limit some functionality of a [resource] to the owner."},{heading:"objectives",content:"Handle errors more elegantly with functions that generate error messages."},{heading:"storing-multiple-nfts-in-a-collection",content:"Open the starter code for this tutorial in the Flow Playground: [play.flow.com/9da6f80f-cd79-4797-a067-47a57dc54770]."},{heading:"storing-multiple-nfts-in-a-collection",content:"This tutorial continues from the last one, but we'll be doing significant refactoring. The provided starter contains the NFT resource, but **removes the code and transactions** for creating NFTs and capabilities to interact with them. You'll replace those with a more sophisticated approach that will allow collections of NFTs."},{heading:"storing-multiple-nfts-in-a-collection",content:"It also adds some constants for the paths we'll be using, so we don't need to worry about typos as we add them to several transactions and scripts."},{heading:"storing-multiple-nfts-in-a-collection",content:"As you've likely noticed, the setup and operations that we used in the previous tutorial are not very scalable. Users need a way to store multiple NFTs from a collection and tools to manage all of those NFTs from a single place."},{heading:"storing-multiple-nfts-in-a-collection",content:"Using a [dictionary] on its own to store our NFTs would solve the problem of having to use different storage paths for each NFT, but it doesn't solve all the problems."},{heading:"resources-that-own-resources",content:"Instead, we can use a powerful feature of Cadence — resources owning other resources! We'll define a new `Collection` resource as our NFT storage place to enable more sophisticated ways to interact with our NFTs. This pattern comes with interesting powers and side effects."},{heading:"resources-that-own-resources",content:"Since the `Collection` explicitly owns the NFTs in it, the owner could transfer all of the NFTs at once by just transferring the single collection. In addition to allowing easy batch transfers, this means that if a unique NFT wants to own another unique NFT, like a CryptoKitty owning a hat accessory, the Kitty literally stores the hat in its own fields and effectively owns it."},{heading:"resources-that-own-resources",content:"The hat belongs to the CryptoKitty that it is stored in, and the hat can be transferred separately or along with the CryptoKitty that owns it. Cadence is a fully object-oriented language, so ownership is indicated by where an object is stored, not just an entry in a ledger."},{heading:"resources-that-own-resources",content:":::danger\nWhen the NFT `Collection` resource is destroyed with the `destroy` command, all the resources stored in the dictionary are also `destroy`ed.\n:::"},{heading:"adding-an-nft-collection",content:"Add a public resource definition called `Collection` to the `IntermediateNFT` contract. In it, add a public [dictionary] called `ownedNFTs` that maps `NFT`s to their `Uint64` id numbers. Initialize `ownedNFTs` with an empty dictionary:"},{heading:"adding-an-nft-collection",content:":::tip\nCadence is an object-oriented language. Inside a composite type, such as a [resource], `self` refers to the instance of that type and **not** the contract itself.\n:::\nDictionary definitions in Cadence don't always need the `@` symbol in the type specification, but because the `ownedNFTs` mapping stores resources, the whole field must become a resource type. Therefore, you need the `@` symbol indicating that `ownedNFTs` is a resource type."},{heading:"adding-an-nft-collection",content:"As a result, all the rules that apply to resources apply to this type."},{heading:"writing-utility-functions",content:"It's helpful for a collection to be able to handle some basic operations, such as accepting an NFT into the collection, validating whether or not a token is present, or sharing a list of all token IDs."},{heading:"writing-utility-functions",content:"Write a function in the `Collection` `resource` to `deposit` a token into `ownedNFTs`:"},{heading:"writing-utility-functions",content:"Notice that we're using the `<-!` force assignment operator to move the token. This will still give a runtime error if the location already has something else stored, but it won't give a typecheck error like the `<-` move operator would in this instance."},{heading:"writing-utility-functions",content:"Write a function called `idExists` that returns a `Bool` - `true` if the id is present and `false` if it is not."},{heading:"writing-utility-functions",content:"Write a function called `getIDs` that returns an array of the `UInt64` ids of all NFTs found in the collection. Make use of the built-in `keys` function present on the dictionary type:"},{heading:"collection-capabilities",content:"For the NFT `Collection`, we will publish a capability to allow anyone to access the utility functions you just created — depositing NFTs into it, verifying if an NFT is in the collection, or getting the ids of all NFTs present. We'll also need functionality to withdraw an NFT and remove it from the collection, but we obviously **don't** want just anyone to be able to do that — *only* the owner."},{heading:"capability-security",content:"This is where an important layer of access control comes in — Cadence utilizes [capability security], which means that for any given object, a user is allowed to access a field or method of that object if they either:"},{heading:"capability-security",content:"are the owner of the object, or"},{heading:"capability-security",content:"have a valid reference to that field or method (note that references can only be created from capabilities, and capabilities can only be created by the owner of the object)."},{heading:"capability-security",content:"When a user stores their NFT `Collection` in their account storage, it is by default not available for other users to access because it requires access to the authorized account object (`auth(Storage) &Account`) which is only accessible by a transaction that the owner authorizes and signs."},{heading:"capability-security",content:"To give external accounts access to the `access(all)` fields and functions, the owner (usually with the help of a developer creating a transaction) creates a link to the object in storage."},{heading:"capability-security",content:"This link creates a capability. From there, it could be passed as a parameter to a function for one-time-use, or it could be put in the `/public/` domain of the user's account so that anyone can access it."},{heading:"capability-security",content:"You've done this already when you've written transactions to `issue` and `publish` capabilities."},{heading:"using-entitlements",content:"We do not want everyone in the network to be able to call our `withdraw` function, though."},{heading:"using-entitlements",content:"In Cadence, any reference can be freely up-casted or down-casted to any subtype or supertype that the reference conforms to. This means that if you had a reference of the type `&ExampleNFT.Collection`, this would expose all the `access(all)` functions on the `Collection`."},{heading:"using-entitlements",content:"This is a powerful feature that is very useful, but it also means if there is any privileged functionality on a resource that has any capabilities created for it, public, or private, then this functionality cannot be `access(all)`."},{heading:"using-entitlements",content:"It needs to use [entitlements]."},{heading:"using-entitlements",content:"Entitlements enable you to restrict the scope of access at a granular level, with the option to group restrictions under similarly named entitlements. Owners of resources can then use these entitlements to grant access to the subset of actions enabled by the authorized reference."},{heading:"using-entitlements",content:":::tip\nIf you're used to Solidity, you can think of this as being similar to frameworks that enable you to use modifiers to limit some functions to specific addresses with the correct role, such as `onlyOwner`. It's quite a bit more powerful, though!\n:::"},{heading:"using-entitlements",content:"Define an [entitlement] called `Withdraw` in your contract at the contract level."},{heading:"using-entitlements",content:"You've now effectively created a type of lock that can only be opened by someone with the right key - or the owner of the property, who always has access natively."},{heading:"using-entitlements",content:"Implement a `withdraw` function inside the `Collection` resource. It should:"},{heading:"using-entitlements",content:"Only allow `access` with the `Withdraw` [entitlement]."},{heading:"using-entitlements",content:"Accept the id of the NFT to be withdrawn as an argument."},{heading:"using-entitlements",content:"Return an error if the NFT with that id is not present in the account's `ownedNFTs`."},{heading:"using-entitlements",content:"Return the **actual token resource**."},{heading:"using-entitlements",content:"You should end up with something similar to:"},{heading:"using-entitlements",content:"Providing an access scope of `access(Withdraw)` locks this functionality to only the owner who has the [resource] directly in their storage, **or** to any code possessing a reference to this resource that has the `Withdraw` entitlement."},{heading:"using-entitlements",content:"As with other types defined in contracts, these are namespaced to the deployer and contract. The full name of `Withdraw` would be something like `0x06.IntermediateNFT.Withdraw`. More than one contract or account can declare separate and distinct entitlements with the same name."},{heading:"issuing-an-entitlement",content:"The owner of an object is the only one who can sign a transaction to create an entitled capability or reference."},{heading:"issuing-an-entitlement",content:"In the above example, if you wanted to make the withdraw function publicly accessible, you could issue the capability as an *entitled* capability by specifying all the entitlements in the capability's type specification using the `auth` keyword:"},{heading:"issuing-an-entitlement",content:`Now, anyone could borrow that capability as the entitled version it was issued as
and steal your NFT! This is why it is always so important to use well-defined entitlements in all your important functions and be very careful how you create your capabilities and publish them:`},{heading:"issuing-an-entitlement",content:"Later tutorials will cover more nuanced methods for sharing an [entitlement]."},{heading:"creating-empty-collections",content:"Finally, your contract needs a way to create an empty collection to initialize the user's account when they start collecting your NFTs."},{heading:"creating-empty-collections",content:"Add a function to create and return an empty `Collection`:"},{heading:"error-handling",content:"Thinking ahead, many of the transactions that we might write (or other developers composing on our contracts) will need to borrow a reference to a user's collection. We can make everyone's lives easier by adding a function to help create that error in a nice and consistent manner."},{heading:"error-handling",content:"Write a function at the contract level called `collectionNotConfiguredError` that accepts an `address` and returns a descriptive error message that the collection was not found:"},{heading:"deploying-the-contract",content:"Deploy the `IntermediateNFT` contract with account `0x06`."},{heading:"creating-collections",content:"We'll need several transactions to manage our NFT collection. The first is one to allow users to create a collection on their account."},{heading:"creating-collections",content:"On your own, implement a transaction in `CreateCollection.cdc` to create and save a `Collection` in the caller's account, and also `issue` and `publish` a capability for that collection."},{heading:"creating-collections",content:"You should end up with something similar to:"},{heading:"creating-collections",content:"Test your transaction by creating `Collections` for several accounts. Try it with accounts that do and do **not** have `Collections` already, and verify that the correct behavior occurs."},{heading:"minting-an-nft",content:"To mint an NFT:"},{heading:"minting-an-nft",content:"Add a transaction to mint an NFT and grant it to the caller. Use the `prepare` phase to `borrow` a reference to the caller's `Collection` and store it in a transaction-level field."},{heading:"minting-an-nft",content:"Use `execute` to create the NFT and use the `Collection`'s `deposit` function to save it in the `Collection`."},{heading:"minting-an-nft",content:"It's a better practice to separate code that accesses accounts and storage to collect authorized references from the code that executes the changes to state. You can pass arguments, such as the `String` for the NFT `description` by defining parameters on the `transaction`."},{heading:"minting-an-nft",content:"Your transaction should be similar to:"},{heading:"minting-an-nft",content:"Test your transaction by minting several NFTs for several accounts. Try it with accounts that do and do **not** have `Collections` and verify that the correct behavior occurs."},{heading:"printing-the-nfts-owned-by-an-account",content:"Remember, you can use scripts to access functionality that doesn't need authorization, such as the function to `getIDs` for all the NFTs in a `Collection`."},{heading:"printing-the-nfts-owned-by-an-account",content:"Write a script to `PrintNFTs` for the provided address."},{heading:"printing-the-nfts-owned-by-an-account",content:"You can also pass arguments into the `main` function in a script:"},{heading:"transferring-nfts",content:"Finally, you'll want to provide a method for users to `Transfer` NFTs to one another. To do so, you'll need to `withdraw` the NFT from the owner's `Collection` and `deposit` it to the recipient."},{heading:"transferring-nfts",content:"This transaction is **not** bound by the `Withdraw` capability, because the caller will be the account that has the NFT in storage, which automatically possesses full entitlement to everything in its own storage. It also doesn't need the permission of or a signature from the recipient, because we gave the `deposit` function `access(all)` and published a public capability to it."},{heading:"transferring-nfts",content:"Start by stubbing out a transaction that accepts a `recipientAddress` and `tokenId`. It should have a transaction-level field called `transferToken` to store the NFT temporarily, between the `prepare` and `execute` phases:"},{heading:"transferring-nfts",content:"In `prepare`, get an entitled reference to the sender's `Collection` and use it to `move (<-)` the token out of their collection and into `transferToken`:"},{heading:"transferring-nfts",content:"Use `execute` to execute the transfer by getting a public reference to the recipient's account, using that to get a reference to the capability for the recipient's `Collection`, and using the `deposit` function to `move (<-)` the NFT:"},{heading:"transferring-nfts",content:"Test your transaction by transferring several NFTs in several accounts. Try various combinations, and use the `PrintNFTs` script to make sure the NFTs move as expected."},{heading:"reviewing-intermediate-nfts",content:"In this tutorial, you learned how to expand the functionality of your basic NFT to allow users to create collections of NFTs, then mint and trade those collections. You also learned more about the details of [entitlements] and how you can use them to protect functionality so that only those who are supposed to be able to access something are able to."},{heading:"reviewing-intermediate-nfts",content:"Now that you have completed the tutorial, you should be able to:"},{heading:"reviewing-intermediate-nfts",content:"Implement a collection [resource] that can manage multiple NFTs on behalf of a user."},{heading:"reviewing-intermediate-nfts",content:"Create an [entitlement] to limit some functionality of a [resource] to the owner."},{heading:"reviewing-intermediate-nfts",content:"Handle errors more elegantly with functions that generate error messages."},{heading:"reviewing-intermediate-nfts",content:"In the next tutorial, you'll learn how to create fungible token collections."},{heading:"reference-solution",content:`:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!`},{heading:"reference-solution",content:`Reference solutions are functional, but may not be optimal.
:::`},{heading:"reference-solution",content:"[Reference Solution]"}],headings:[{id:"objectives",content:"Objectives"},{id:"storing-multiple-nfts-in-a-collection",content:"Storing multiple NFTs in a collection"},{id:"resources-that-own-resources",content:"Resources that own resources"},{id:"adding-an-nft-collection",content:"Adding an NFT collection"},{id:"writing-utility-functions",content:"Writing utility functions"},{id:"collection-capabilities",content:"Collection capabilities"},{id:"capability-security",content:"Capability security"},{id:"using-entitlements",content:"Using entitlements"},{id:"issuing-an-entitlement",content:"Issuing an entitlement"},{id:"creating-empty-collections",content:"Creating empty collections"},{id:"error-handling",content:"Error handling"},{id:"deploying-the-contract",content:"Deploying the contract"},{id:"creating-collections",content:"Creating collections"},{id:"minting-an-nft",content:"Minting an NFT"},{id:"printing-the-nfts-owned-by-an-account",content:"Printing the NFTs owned by an account"},{id:"transferring-nfts",content:"Transferring NFTs"},{id:"reviewing-intermediate-nfts",content:"Reviewing intermediate NFTs"},{id:"reference-solution",content:"Reference Solution"}]};const r=[{depth:2,url:"#objectives",title:e.jsx(e.Fragment,{children:"Objectives"})},{depth:2,url:"#storing-multiple-nfts-in-a-collection",title:e.jsx(e.Fragment,{children:"Storing multiple NFTs in a collection"})},{depth:3,url:"#resources-that-own-resources",title:e.jsx(e.Fragment,{children:"Resources that own resources"})},{depth:3,url:"#adding-an-nft-collection",title:e.jsx(e.Fragment,{children:"Adding an NFT collection"})},{depth:3,url:"#writing-utility-functions",title:e.jsx(e.Fragment,{children:"Writing utility functions"})},{depth:2,url:"#collection-capabilities",title:e.jsx(e.Fragment,{children:"Collection capabilities"})},{depth:3,url:"#capability-security",title:e.jsx(e.Fragment,{children:"Capability security"})},{depth:3,url:"#using-entitlements",title:e.jsx(e.Fragment,{children:"Using entitlements"})},{depth:3,url:"#issuing-an-entitlement",title:e.jsx(e.Fragment,{children:"Issuing an entitlement"})},{depth:3,url:"#creating-empty-collections",title:e.jsx(e.Fragment,{children:"Creating empty collections"})},{depth:2,url:"#error-handling",title:e.jsx(e.Fragment,{children:"Error handling"})},{depth:2,url:"#deploying-the-contract",title:e.jsx(e.Fragment,{children:"Deploying the contract"})},{depth:2,url:"#creating-collections",title:e.jsx(e.Fragment,{children:"Creating collections"})},{depth:2,url:"#minting-an-nft",title:e.jsx(e.Fragment,{children:"Minting an NFT"})},{depth:2,url:"#printing-the-nfts-owned-by-an-account",title:e.jsx(e.Fragment,{children:"Printing the NFTs owned by an account"})},{depth:2,url:"#transferring-nfts",title:e.jsx(e.Fragment,{children:"Transferring NFTs"})},{depth:2,url:"#reviewing-intermediate-nfts",title:e.jsx(e.Fragment,{children:"Reviewing intermediate NFTs"})},{depth:2,url:"#reference-solution",title:e.jsx(e.Fragment,{children:"Reference Solution"})}];function t(s){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["In the ",e.jsx(i.a,{href:"./non-fungible-tokens-1",children:"last tutorial"}),", you implemented a simple NFT that users could mint, hold, and trade, but there was a serious flaw: each user could only hold one NFT at a time. In this tutorial, you'll improve your implementation to allow it to grant users multiple NFTs and with the tools you need to manage them."]}),`
`,e.jsxs(i.p,{children:[`:::tip
If you're already comfortable with Cadence and have found this page looking for information on how to build production-ready NFTs, check out the `,e.jsx(i.a,{href:"https://developers.flow.com/build/guides/nft",children:"NFT Guide"})," and the ",e.jsx(i.a,{href:"https://github.com/onflow/flow-nft",children:"Flow NFT Standard"}),` repository.
:::`]}),`
`,e.jsx(i.h2,{id:"objectives",children:"Objectives"}),`
`,e.jsx(i.p,{children:"After completing this tutorial, you'll be able to:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Implement a collection ",e.jsx(i.a,{href:"../language/resources.mdx",children:"resource"})," that can manage multiple NFTs on behalf of a user."]}),`
`,e.jsxs(i.li,{children:["Create an ",e.jsx(i.a,{href:"../language/access-control.md",children:"entitlement"})," to limit some functionality of a ",e.jsx(i.a,{href:"../language/resources.mdx",children:"resource"})," to the owner."]}),`
`,e.jsx(i.li,{children:"Handle errors more elegantly with functions that generate error messages."}),`
`]}),`
`,e.jsx(i.h2,{id:"storing-multiple-nfts-in-a-collection",children:"Storing multiple NFTs in a collection"}),`
`,e.jsxs(i.p,{children:["Open the starter code for this tutorial in the Flow Playground: ",e.jsx(i.a,{href:"https://play.flow.com/9da6f80f-cd79-4797-a067-47a57dc54770",children:"play.flow.com/9da6f80f-cd79-4797-a067-47a57dc54770"}),"."]}),`
`,e.jsxs(i.p,{children:["This tutorial continues from the last one, but we'll be doing significant refactoring. The provided starter contains the NFT resource, but ",e.jsx(i.strong,{children:"removes the code and transactions"})," for creating NFTs and capabilities to interact with them. You'll replace those with a more sophisticated approach that will allow collections of NFTs."]}),`
`,e.jsx(i.p,{children:"It also adds some constants for the paths we'll be using, so we don't need to worry about typos as we add them to several transactions and scripts."}),`
`,e.jsx(i.p,{children:"As you've likely noticed, the setup and operations that we used in the previous tutorial are not very scalable. Users need a way to store multiple NFTs from a collection and tools to manage all of those NFTs from a single place."}),`
`,e.jsxs(i.p,{children:["Using a ",e.jsx(i.a,{href:"../language/values-and-types/dictionaries.md",children:"dictionary"})," on its own to store our NFTs would solve the problem of having to use different storage paths for each NFT, but it doesn't solve all the problems."]}),`
`,e.jsx(i.h3,{id:"resources-that-own-resources",children:"Resources that own resources"}),`
`,e.jsxs(i.p,{children:["Instead, we can use a powerful feature of Cadence — resources owning other resources! We'll define a new ",e.jsx(i.code,{children:"Collection"})," resource as our NFT storage place to enable more sophisticated ways to interact with our NFTs. This pattern comes with interesting powers and side effects."]}),`
`,e.jsxs(i.p,{children:["Since the ",e.jsx(i.code,{children:"Collection"})," explicitly owns the NFTs in it, the owner could transfer all of the NFTs at once by just transferring the single collection. In addition to allowing easy batch transfers, this means that if a unique NFT wants to own another unique NFT, like a CryptoKitty owning a hat accessory, the Kitty literally stores the hat in its own fields and effectively owns it."]}),`
`,e.jsx(i.p,{children:"The hat belongs to the CryptoKitty that it is stored in, and the hat can be transferred separately or along with the CryptoKitty that owns it. Cadence is a fully object-oriented language, so ownership is indicated by where an object is stored, not just an entry in a ledger."}),`
`,e.jsxs(i.p,{children:[`:::danger
When the NFT `,e.jsx(i.code,{children:"Collection"})," resource is destroyed with the ",e.jsx(i.code,{children:"destroy"})," command, all the resources stored in the dictionary are also ",e.jsx(i.code,{children:"destroy"}),`ed.
:::`]}),`
`,e.jsx(i.h3,{id:"adding-an-nft-collection",children:"Adding an NFT collection"}),`
`,e.jsxs(i.p,{children:["Add a public resource definition called ",e.jsx(i.code,{children:"Collection"})," to the ",e.jsx(i.code,{children:"IntermediateNFT"})," contract. In it, add a public ",e.jsx(i.a,{href:"../language/values-and-types/dictionaries.md",children:"dictionary"})," called ",e.jsx(i.code,{children:"ownedNFTs"})," that maps ",e.jsx(i.code,{children:"NFT"}),"s to their ",e.jsx(i.code,{children:"Uint64"})," id numbers. Initialize ",e.jsx(i.code,{children:"ownedNFTs"})," with an empty dictionary:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownedNFTs: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" () {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownedNFTs "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:[`:::tip
Cadence is an object-oriented language. Inside a composite type, such as a `,e.jsx(i.a,{href:"../language/resources.mdx",children:"resource"}),", ",e.jsx(i.code,{children:"self"})," refers to the instance of that type and ",e.jsx(i.strong,{children:"not"}),` the contract itself.
:::
Dictionary definitions in Cadence don't always need the `,e.jsx(i.code,{children:"@"})," symbol in the type specification, but because the ",e.jsx(i.code,{children:"ownedNFTs"})," mapping stores resources, the whole field must become a resource type. Therefore, you need the ",e.jsx(i.code,{children:"@"})," symbol indicating that ",e.jsx(i.code,{children:"ownedNFTs"})," is a resource type."]}),`
`,e.jsx(i.p,{children:"As a result, all the rules that apply to resources apply to this type."}),`
`,e.jsx(i.h3,{id:"writing-utility-functions",children:"Writing utility functions"}),`
`,e.jsx(i.p,{children:"It's helpful for a collection to be able to handle some basic operations, such as accepting an NFT into the collection, validating whether or not a token is present, or sharing a list of all token IDs."}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Write a function in the ",e.jsx(i.code,{children:"Collection"})," ",e.jsx(i.code,{children:"resource"})," to ",e.jsx(i.code,{children:"deposit"})," a token into ",e.jsx(i.code,{children:"ownedNFTs"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(token: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownedNFTs[token.id] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-!"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" token"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Notice that we're using the ",e.jsx(i.code,{children:"<-!"})," force assignment operator to move the token. This will still give a runtime error if the location already has something else stored, but it won't give a typecheck error like the ",e.jsx(i.code,{children:"<-"})," move operator would in this instance."]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Write a function called ",e.jsx(i.code,{children:"idExists"})," that returns a ",e.jsx(i.code,{children:"Bool"})," - ",e.jsx(i.code,{children:"true"})," if the id is present and ",e.jsx(i.code,{children:"false"})," if it is not."]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Write a function called ",e.jsx(i.code,{children:"getIDs"})," that returns an array of the ",e.jsx(i.code,{children:"UInt64"})," ids of all NFTs found in the collection. Make use of the built-in ",e.jsx(i.code,{children:"keys"})," function present on the dictionary type:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") view "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" idExists"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownedNFTs[id] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") view "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getIDs"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownedNFTs.keys"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,e.jsx(i.h2,{id:"collection-capabilities",children:"Collection capabilities"}),`
`,e.jsxs(i.p,{children:["For the NFT ",e.jsx(i.code,{children:"Collection"}),", we will publish a capability to allow anyone to access the utility functions you just created — depositing NFTs into it, verifying if an NFT is in the collection, or getting the ids of all NFTs present. We'll also need functionality to withdraw an NFT and remove it from the collection, but we obviously ",e.jsx(i.strong,{children:"don't"})," want just anyone to be able to do that — ",e.jsx(i.em,{children:"only"})," the owner."]}),`
`,e.jsx(i.h3,{id:"capability-security",children:"Capability security"}),`
`,e.jsxs(i.p,{children:["This is where an important layer of access control comes in — Cadence utilizes ",e.jsx(i.a,{href:"../language/capabilities.md",children:"capability security"}),", which means that for any given object, a user is allowed to access a field or method of that object if they either:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"are the owner of the object, or"}),`
`,e.jsx(i.li,{children:"have a valid reference to that field or method (note that references can only be created from capabilities, and capabilities can only be created by the owner of the object)."}),`
`]}),`
`,e.jsxs(i.p,{children:["When a user stores their NFT ",e.jsx(i.code,{children:"Collection"})," in their account storage, it is by default not available for other users to access because it requires access to the authorized account object (",e.jsx(i.code,{children:"auth(Storage) &Account"}),") which is only accessible by a transaction that the owner authorizes and signs."]}),`
`,e.jsxs(i.p,{children:["To give external accounts access to the ",e.jsx(i.code,{children:"access(all)"})," fields and functions, the owner (usually with the help of a developer creating a transaction) creates a link to the object in storage."]}),`
`,e.jsxs(i.p,{children:["This link creates a capability. From there, it could be passed as a parameter to a function for one-time-use, or it could be put in the ",e.jsx(i.code,{children:"/public/"})," domain of the user's account so that anyone can access it."]}),`
`,e.jsxs(i.p,{children:["You've done this already when you've written transactions to ",e.jsx(i.code,{children:"issue"})," and ",e.jsx(i.code,{children:"publish"})," capabilities."]}),`
`,e.jsx(i.h3,{id:"using-entitlements",children:"Using entitlements"}),`
`,e.jsxs(i.p,{children:["We do not want everyone in the network to be able to call our ",e.jsx(i.code,{children:"withdraw"})," function, though."]}),`
`,e.jsxs(i.p,{children:["In Cadence, any reference can be freely up-casted or down-casted to any subtype or supertype that the reference conforms to. This means that if you had a reference of the type ",e.jsx(i.code,{children:"&ExampleNFT.Collection"}),", this would expose all the ",e.jsx(i.code,{children:"access(all)"})," functions on the ",e.jsx(i.code,{children:"Collection"}),"."]}),`
`,e.jsxs(i.p,{children:["This is a powerful feature that is very useful, but it also means if there is any privileged functionality on a resource that has any capabilities created for it, public, or private, then this functionality cannot be ",e.jsx(i.code,{children:"access(all)"}),"."]}),`
`,e.jsxs(i.p,{children:["It needs to use ",e.jsx(i.a,{href:"../language/access-control.md#entitlements",children:"entitlements"}),"."]}),`
`,e.jsx(i.p,{children:"Entitlements enable you to restrict the scope of access at a granular level, with the option to group restrictions under similarly named entitlements. Owners of resources can then use these entitlements to grant access to the subset of actions enabled by the authorized reference."}),`
`,e.jsxs(i.p,{children:[`:::tip
If you're used to Solidity, you can think of this as being similar to frameworks that enable you to use modifiers to limit some functions to specific addresses with the correct role, such as `,e.jsx(i.code,{children:"onlyOwner"}),`. It's quite a bit more powerful, though!
:::`]}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Define an ",e.jsx(i.a,{href:"../language/access-control.md",children:"entitlement"})," called ",e.jsx(i.code,{children:"Withdraw"})," in your contract at the contract level."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Withdraw"})]})})})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"You've now effectively created a type of lock that can only be opened by someone with the right key - or the owner of the property, who always has access natively."}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Implement a ",e.jsx(i.code,{children:"withdraw"})," function inside the ",e.jsx(i.code,{children:"Collection"})," resource. It should:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Only allow ",e.jsx(i.code,{children:"access"})," with the ",e.jsx(i.code,{children:"Withdraw"})," ",e.jsx(i.a,{href:"../language/access-control.md",children:"entitlement"}),"."]}),`
`,e.jsx(i.li,{children:"Accept the id of the NFT to be withdrawn as an argument."}),`
`,e.jsxs(i.li,{children:["Return an error if the NFT with that id is not present in the account's ",e.jsx(i.code,{children:"ownedNFTs"}),"."]}),`
`,e.jsxs(i.li,{children:["Return the ",e.jsx(i.strong,{children:"actual token resource"}),"."]}),`
`]}),`
`,e.jsx(i.p,{children:"You should end up with something similar to:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(withdrawID: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" token "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownedNFTs."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"remove"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key: withdrawID)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        ??"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not withdraw an ExampleNFT.NFT with id="'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"             ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(withdrawID."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"             ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Verify that the collection owns the NFT "'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"             ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"with the specified ID first before withdrawing it."'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"))"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"   return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"token"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,e.jsxs(i.p,{children:["Providing an access scope of ",e.jsx(i.code,{children:"access(Withdraw)"})," locks this functionality to only the owner who has the ",e.jsx(i.a,{href:"../language/resources.mdx",children:"resource"})," directly in their storage, ",e.jsx(i.strong,{children:"or"})," to any code possessing a reference to this resource that has the ",e.jsx(i.code,{children:"Withdraw"})," entitlement."]}),`
`,e.jsxs(i.p,{children:["As with other types defined in contracts, these are namespaced to the deployer and contract. The full name of ",e.jsx(i.code,{children:"Withdraw"})," would be something like ",e.jsx(i.code,{children:"0x06.IntermediateNFT.Withdraw"}),". More than one contract or account can declare separate and distinct entitlements with the same name."]}),`
`,e.jsx(i.h3,{id:"issuing-an-entitlement",children:"Issuing an entitlement"}),`
`,e.jsx(i.p,{children:"The owner of an object is the only one who can sign a transaction to create an entitled capability or reference."}),`
`,e.jsxs(i.p,{children:["In the above example, if you wanted to make the withdraw function publicly accessible, you could issue the capability as an ",e.jsx(i.em,{children:"entitled"})," capability by specifying all the entitlements in the capability's type specification using the ",e.jsx(i.code,{children:"auth"})," keyword:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// DANGEROUS CODE EXAMPLE - DO NOT USE"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" cap = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.storage"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .issue"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionStoragePath"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cap, at: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsx(i.p,{children:`Now, anyone could borrow that capability as the entitled version it was issued as
and steal your NFT! This is why it is always so important to use well-defined entitlements in all your important functions and be very careful how you create your capabilities and publish them:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" entitledCollectionRef = recipient.capabilities"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ??"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow a reference to the ExampleNFT.Collection"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" stolenNFT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" entitledCollectionRef."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(withdrawID: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.p,{children:["Later tutorials will cover more nuanced methods for sharing an ",e.jsx(i.a,{href:"../language/access-control.md",children:"entitlement"}),"."]}),`
`,e.jsx(i.h3,{id:"creating-empty-collections",children:"Creating empty collections"}),`
`,e.jsx(i.p,{children:"Finally, your contract needs a way to create an empty collection to initialize the user's account when they start collecting your NFTs."}),`
`,e.jsxs(i.p,{children:["Add a function to create and return an empty ",e.jsx(i.code,{children:"Collection"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createEmptyCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"error-handling",children:"Error handling"}),`
`,e.jsx(i.p,{children:"Thinking ahead, many of the transactions that we might write (or other developers composing on our contracts) will need to borrow a reference to a user's collection. We can make everyone's lives easier by adding a function to help create that error in a nice and consistent manner."}),`
`,e.jsxs(i.p,{children:["Write a function at the contract level called ",e.jsx(i.code,{children:"collectionNotConfiguredError"})," that accepts an ",e.jsx(i.code,{children:"address"})," and returns a descriptive error message that the collection was not found:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" collectionNotConfiguredError"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:` "Could not borrow a collection reference to recipient's IntermediateNFT.Collection from the path `}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"IntermediateNFT.CollectionPublicPath.toString()). Make sure account "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'address.toString()) has set up its account with an IntermediateNFT Collection."'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})})]})})}),`
`,e.jsx(i.h2,{id:"deploying-the-contract",children:"Deploying the contract"}),`
`,e.jsxs(i.p,{children:["Deploy the ",e.jsx(i.code,{children:"IntermediateNFT"})," contract with account ",e.jsx(i.code,{children:"0x06"}),"."]}),`
`,e.jsx(i.h2,{id:"creating-collections",children:"Creating collections"}),`
`,e.jsx(i.p,{children:"We'll need several transactions to manage our NFT collection. The first is one to allow users to create a collection on their account."}),`
`,e.jsxs(i.p,{children:["On your own, implement a transaction in ",e.jsx(i.code,{children:"CreateCollection.cdc"})," to create and save a ",e.jsx(i.code,{children:"Collection"})," in the caller's account, and also ",e.jsx(i.code,{children:"issue"})," and ",e.jsx(i.code,{children:"publish"})," a capability for that collection."]}),`
`,e.jsx(i.p,{children:"You should end up with something similar to:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capabilities"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // You may want to make sure one doesn't exist, but the native error is descriptive as well"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" collection "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createEmptyCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".storage."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"collection, to: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionStoragePath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Collection created"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" cap = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.storage.issue"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionStoragePath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cap, at: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Capability created"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["Test your transaction by creating ",e.jsx(i.code,{children:"Collections"})," for several accounts. Try it with accounts that do and do ",e.jsx(i.strong,{children:"not"})," have ",e.jsx(i.code,{children:"Collections"})," already, and verify that the correct behavior occurs."]}),`
`,e.jsx(i.h2,{id:"minting-an-nft",children:"Minting an NFT"}),`
`,e.jsx(i.p,{children:"To mint an NFT:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Add a transaction to mint an NFT and grant it to the caller. Use the ",e.jsx(i.code,{children:"prepare"})," phase to ",e.jsx(i.code,{children:"borrow"})," a reference to the caller's ",e.jsx(i.code,{children:"Collection"})," and store it in a transaction-level field."]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"execute"})," to create the NFT and use the ",e.jsx(i.code,{children:"Collection"}),"'s ",e.jsx(i.code,{children:"deposit"})," function to save it in the ",e.jsx(i.code,{children:"Collection"}),"."]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["It's a better practice to separate code that accesses accounts and storage to collect authorized references from the code that executes the changes to state. You can pass arguments, such as the ",e.jsx(i.code,{children:"String"})," for the NFT ",e.jsx(i.code,{children:"description"})," by defining parameters on the ",e.jsx(i.code,{children:"transaction"}),"."]}),`
`]}),`
`,e.jsx(i.p,{children:"Your transaction should be similar to:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(description: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverRef: &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".receiverRef = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            .borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            ??"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"collectionNotConfiguredError"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".address))"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"   execute"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"       let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" newNFT "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mintNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(description: description)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"       self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".receiverRef."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(token: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"newNFT)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"       log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"NFT Minted and deposited to minter's Collection"`}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Test your transaction by minting several NFTs for several accounts. Try it with accounts that do and do ",e.jsx(i.strong,{children:"not"})," have ",e.jsx(i.code,{children:"Collections"})," and verify that the correct behavior occurs."]}),`
`]}),`
`]}),`
`,e.jsx(i.h2,{id:"printing-the-nfts-owned-by-an-account",children:"Printing the NFTs owned by an account"}),`
`,e.jsxs(i.p,{children:["Remember, you can use scripts to access functionality that doesn't need authorization, such as the function to ",e.jsx(i.code,{children:"getIDs"})," for all the NFTs in a ",e.jsx(i.code,{children:"Collection"}),"."]}),`
`,e.jsxs(i.p,{children:["Write a script to ",e.jsx(i.code,{children:"PrintNFTs"})," for the provided address."]}),`
`,e.jsxs(i.p,{children:["You can also pass arguments into the ",e.jsx(i.code,{children:"main"})," function in a script:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" nftOwner = "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = nftOwner.capabilities.get"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverRef = nftOwner.capabilities"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        .borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        ??"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"collectionNotConfiguredError"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: address))"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Account "'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" NFTs"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverRef."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getIDs"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"transferring-nfts",children:"Transferring NFTs"}),`
`,e.jsxs(i.p,{children:["Finally, you'll want to provide a method for users to ",e.jsx(i.code,{children:"Transfer"})," NFTs to one another. To do so, you'll need to ",e.jsx(i.code,{children:"withdraw"})," the NFT from the owner's ",e.jsx(i.code,{children:"Collection"})," and ",e.jsx(i.code,{children:"deposit"})," it to the recipient."]}),`
`,e.jsxs(i.p,{children:["This transaction is ",e.jsx(i.strong,{children:"not"})," bound by the ",e.jsx(i.code,{children:"Withdraw"})," capability, because the caller will be the account that has the NFT in storage, which automatically possesses full entitlement to everything in its own storage. It also doesn't need the permission of or a signature from the recipient, because we gave the ",e.jsx(i.code,{children:"deposit"})," function ",e.jsx(i.code,{children:"access(all)"})," and published a public capability to it."]}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Start by stubbing out a transaction that accepts a ",e.jsx(i.code,{children:"recipientAddress"})," and ",e.jsx(i.code,{children:"tokenId"}),". It should have a transaction-level field called ",e.jsx(i.code,{children:"transferToken"})," to store the NFT temporarily, between the ",e.jsx(i.code,{children:"prepare"})," and ",e.jsx(i.code,{children:"execute"})," phases:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(recipientAddress: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", tokenId: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" transferToken: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // TODO"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"   execute"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"       // TODO"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["In ",e.jsx(i.code,{children:"prepare"}),", get an entitled reference to the sender's ",e.jsx(i.code,{children:"Collection"})," and use it to ",e.jsx(i.code,{children:"move (<-)"})," the token out of their collection and into ",e.jsx(i.code,{children:"transferToken"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" collectionRef = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".storage"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionStoragePath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ??"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"collectionNotConfiguredError"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".address))"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".transferToken "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" collectionRef."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(withdrawID: tokenId)"})]})]})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"execute"})," to execute the transfer by getting a public reference to the recipient's account, using that to get a reference to the capability for the recipient's ",e.jsx(i.code,{children:"Collection"}),", and using the ",e.jsx(i.code,{children:"deposit"})," function to ",e.jsx(i.code,{children:"move (<-)"})," the NFT:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" recipient = "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(recipientAddress)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverRef = recipient.capabilities"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ??"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"collectionNotConfiguredError"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: recipient.address))"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"receiverRef."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(token: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".transferToken)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"NFT ID transferred to account '}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'recipient.address.toString())"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Test your transaction by transferring several NFTs in several accounts. Try various combinations, and use the ",e.jsx(i.code,{children:"PrintNFTs"})," script to make sure the NFTs move as expected."]}),`
`]}),`
`]}),`
`,e.jsx(i.h2,{id:"reviewing-intermediate-nfts",children:"Reviewing intermediate NFTs"}),`
`,e.jsxs(i.p,{children:["In this tutorial, you learned how to expand the functionality of your basic NFT to allow users to create collections of NFTs, then mint and trade those collections. You also learned more about the details of ",e.jsx(i.a,{href:"../language/access-control.md#entitlements",children:"entitlements"})," and how you can use them to protect functionality so that only those who are supposed to be able to access something are able to."]}),`
`,e.jsx(i.p,{children:"Now that you have completed the tutorial, you should be able to:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Implement a collection ",e.jsx(i.a,{href:"../language/resources.mdx",children:"resource"})," that can manage multiple NFTs on behalf of a user."]}),`
`,e.jsxs(i.li,{children:["Create an ",e.jsx(i.a,{href:"../language/access-control.md",children:"entitlement"})," to limit some functionality of a ",e.jsx(i.a,{href:"../language/resources.mdx",children:"resource"})," to the owner."]}),`
`,e.jsx(i.li,{children:"Handle errors more elegantly with functions that generate error messages."}),`
`]}),`
`,e.jsx(i.p,{children:"In the next tutorial, you'll learn how to create fungible token collections."}),`
`,e.jsx(i.h2,{id:"reference-solution",children:"Reference Solution"}),`
`,e.jsxs(i.p,{children:[`:::warning
You are `,e.jsx(i.strong,{children:"not"})," saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!"]}),`
`,e.jsx(i.p,{children:`Reference solutions are functional, but may not be optimal.
:::`}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://play.flow.com/72bf4f76-fa1a-4b24-8f5e-f1e5aab9f39d",children:"Reference Solution"})}),`
`]}),`
`]})}function o(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(t,{...s})}):t(s)}export{a as _markdown,o as default,l as frontmatter,h as structuredData,r as toc};
