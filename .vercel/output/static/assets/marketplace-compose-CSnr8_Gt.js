import{j as i}from"./main-BXy83AsK.js";let h=`

In this tutorial, we're going to create a simplified marketplace that uses both the fungible and non-fungible token (NFT) contracts that we built in previous tutorials.

:::warning
This tutorial uses the simplified fungible and non-fungible tokens you built in this series. It is not suitable for production. If you're ready to build or work with a production-quality marketplace, check out the [NFT storefront repo]. This contract is already deployed to testnet and mainnet and can be used by anyone for any generic NFT sale!
:::
Marketplaces are a popular application of blockchain technology and smart contracts. People with digital collectibles such as NFTs need to be able to buy and sell them — either with the network token or their fungible tokens.

More than just a convenience, marketplaces demonstrate one of the most compelling arguments for developing digital property on blockchains. In web 2, each developer needed to build their own bespoke systems for buying, selling, trading, and storing digital property. Onchain, if you build digital property that adheres to the appropriate standards, your digital collectibles, items, etc., will **automatically appear on several marketplace apps** built by experts in marketplaces who have made them the focus of their attention and business.

Objectives [#objectives]

After completing this tutorial, you'll be able to:

* Construct an NFT marketplace that allows users to buy and sell NFTs in exchange for $FLOW or your fungible token.
* Utilize [interfaces], [resources], and [capabilities] to write composable code that takes advantage of resources built by others and allows others to build on your products.
* Construct and emit [events] to share contract actions and states with other apps and services

Prerequisites [#prerequisites]

To complete this tutorial, you must have completed the [Marketplace Setup Tutorial]. If you need to, you can start from the [Setup Reference Solution], but you'll need to follow the [Marketplace Setup Tutorial] to deploy the contracts and call the setup transactions.

Building with composability [#building-with-composability]

Now that **there are** contracts deployed for both fungible and non-fungible tokens, we can build a marketplace that uses both. We've picked the words *there are* in the prior sentence on purpose. It doesn't matter that you created these contracts. If they were deployed onchain, instead of in the ephemeral simulation in the playground, **anyone** could complete this tutorial to build a marketplace that works with your NFTs and tokens.

It's one of the most powerful and useful properties of building onchain and it's called *composability* — the ability for developers to leverage shared resources, such as code, digital property, and user bases, and use them as building blocks for a new application.

This isn't an entirely new concept — we're used to reusing code, open source projects, etc. But the degree and scale are much higher. For example, if you're building an onchain version of a web forum, you don't need to do anything to allow your users to have a profile picture beyond allowing them to select which PFP they own from the list of PFP collections you choose to incorporate into your app.

You're happy because you get a solution that works for your users for minimal effort, and the PFP collection creator is happy because their work becomes more valuable and desirable the more places it can be used an seen. Everybody wins!

Flow is designed to enable composability through interfaces, resources and capabilities:

* [Interfaces] allow projects to support any generic type as long as it supports a standard set of functionality specified by an interface.
* [Resources] can be passed around and owned by accounts, contracts or even other resources, unlocking different use cases depending on where the resource is stored.
* [Capabilities] allow exposing user-controlled sets of functionality and permissions through special objects that enforce strict security with Cadence's type system.

The combination of these features allow developers to do more with less, re-using known safe code and design patterns to create new, powerful, and unique interactions!

Building a marketplace [#building-a-marketplace]

To create a marketplace, we need to integrate the functionality of both fungible and non-fungible tokens into a single contract that gives users control over their money and assets. To accomplish this, we'll create a composable smart contract.

Marketplace design [#marketplace-design]

A traditional way to implement a marketplace is to have a central smart contract that users deposit their NFTs and their price into, and anyone can come by and buy the token for that price.

This approach is reasonable, but it centralizes the process and takes away options from the owners. A better option that's possible with Cadence is to allow users to maintain ownership of the NFTs that they are trying to sell while they are trying to sell them. Instead of taking a centralized approach, each user can list a sale from within their own account.

They'll do this by using a marketplace contract you'll build to store an instance of a \`@SaleCollection\` resource in their account storage.

Then, the seller, independently or through an app, can either provide a link to their sale to an application that can list it centrally on a website, or even to a central sale aggregator smart contract if they want the entire transaction to stay onchain.

Validating setup [#validating-setup]

If you haven't just completed the [Marketplace Setup] tutorial, run the \`Validate Setup\` script to double-check that your contracts and accounts are in the correct state to begin building the marketplace.

:::note
Remember, we only need to do this again to ensure that the ephemeral state of the playground is set up correctly. Otherwise, you'd already have contracts and users with accounts that are configured ready to go.
:::
The following output appears if your accounts are set up correctly:

\`\`\`zsh
s.8250c68d2bb3c5398d7f9eac7114a4ac1b7df1d0984d92058b9373f696a1d6a9.OwnerInfo(acct8Balance: 40.00000000, acct9Balance: 40.00000000, acct8IDs: [1], acct9IDs: [])
\`\`\`

Setting up an NFT marketplace [#setting-up-an-nft-marketplace]

Add a new contract called \`BasicMarketplace\`. It needs to import both of the existing contracts:

\`\`\`cadence
import ExampleToken from 0x06
import IntermediateNFT from 0x07

access(all) contract BasicMarketplace {
    // TODO
}
\`\`\`

:::note
Remember, you don't need to own a contract to be able to import it or use any of its public functionality!
:::

Adding appropriate events [#adding-appropriate-events]

As in Solidity, Cadence smart contracts can emit developer-defined [events] during execution, which can be used to log data that can be observed offchain. This can be used by frontends, and other apps or platforms, including block explorers and data aggregators, which can monitor the state of the contract and related NFTs.

Events in Cadence are declared in a similar fashion as functions, but they start with an access control declaration. The \`event\` keyword follows, then the name and parameters in parentheses. You can use most of the same types as functions, but you cannot use resources. Resources are moved when used as an argument, and using them and events don't have a method to put them somewhere else or destroy them.

\`\`\`cadence
access(all) event ForSale(id: UInt64, price: UFix64, owner: Address?)
access(all) event PriceChanged(id: UInt64, newPrice: UFix64, owner: Address?)
access(all) event NFTPurchased(id: UInt64, price: UFix64, seller: Address?, buyer: Address?)
access(all) event SaleCanceled(id: UInt64, seller: Address?)
\`\`\`

We can anticipate that we'll want to emit events when users take standard actions with the contract, such as when NFTs are listed, purchased, the price is changed, or the sale is cancelled.

We're marking the addresses as optional, because there's some circumstances where an NFT might not have an owner, so those addresses would be \`nil\`.

Creating a resource to put items up for sale [#creating-a-resource-to-put-items-up-for-sale]

Next, we need to configure a [resource] that users can use to put their NFTs up for sale, and other users can use to then purchase those NFTs for fungible tokens. In it, you'll need to add:

* A [capability] to access the owner's collection.
* A place to store the prices of NFTs for sale.
* A [capability] to deposit tokens into the sellers vault when an NFT is purchased.

You'll also need functions to:

* Allow the owner to list an NFT for sale.
* Allow the owner to cancel a sale.
* Allow the owner to change the price.
* Allow a third party to buy the NFT, and deposit the purchase price in the seller's vault.

Definition and initialization [#definition-and-initialization]

To define and initialize:

1. Create the resource definition:

   \`\`\`cadence
   access(all) resource SaleCollection  {
       // TODO
   }
   \`\`\`

   <Callout type="info" title="Reminder">
     In this case, \`access(all)\` is giving public scope to the **definition** of the resource type, **not** any given instance of the resource or anything in one of those instances. It's good to make these public so that others can build contracts and apps that interact with yours.
   </Callout>

2. In it, add a variable to store a capability for the owner's collection with the ability to withdraw from the collection:

   \`\`\`cadence
   access(self) let ownerCollection: Capability<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>
   \`\`\`

   <Callout type="info" title="Reminder">
     You'll get errors until after you write the \`init\` function and assign values to these properties.
   </Callout>

3. Add a dictionary to relate NFT ids to the sale price for that NFT:

   \`\`\`cadence
   access(self) let prices: {UInt64: UFix64}
   \`\`\`

   <Callout type="info" title="reminder">
     \`access(self)\` limits access to the resource itself, from within the resource.
   </Callout>

4. Add a variable to store a capability for a sellers fungible token vault's receiver:

   \`\`\`cadence
   access(account) let ownerVault: Capability<&{ExampleToken.Receiver}>
   \`\`\`

Resource-owned capabilities [#resource-owned-capabilities]

You first learned about basic function and use of [capabilities] in the [capabilities tutorial]. They're links to private objects in account storage that specify and expose a subset of the resource they are linked to.

With the marketplace contract, we are utilizing a new feature of capabilities — they can be stored anywhere! Lots of functionality is contained within resources, and developers will sometimes want to be able to access some of the functionality of resources from within different resources or contracts.

We stored two different capabilities in the marketplace sale collection:

\`\`\`cadence
access(self) var ownerCollection: Capability<auth(ExampleNFT.Withdraw) &ExampleNFT.Collection>
access(account) let ownerVault: Capability<&{ExampleToken.Receiver}>
\`\`\`

If an object like a contract or resource owns a capability, they can borrow a reference to that capability at any time to access that functionality without having to get it from the owner's account every time.

This is especially important if the owner wants to expose some functionality that is only intended for one person, meaning that the link for the capability is not stored in a public path.

We do that in this example, because the sale collection stores a capability that can access the \`withdraw\` functionality of the \`IntermediateNFT.Collection\` with the \`IntermediateNFT.Withdraw\` entitlement. It needs this because it withdraws the specified NFT in the \`purchase()\` method to send to the buyer.

It is important to remember that control of a capability does not equal ownership of the underlying resource. You can use the capability to access that resource's functionality, but you can't use it to fake ownership. You need the actual resource (identified by the prefixed \`@\` symbol) to prove ownership.

Additionally, these capabilities can be stored anywhere, but if a user decides that they no longer want the capability to be used, they can revoke it by getting the controller for the capability from their account with the \`getControllers\` method and delete the capability with \`delete\`.

Here is an example that deletes all of the controllers for a specified storage path:

\`\`\`cadence
let controllers = self.account.capabilities.storage.getControllers(forPath: storagePath)
for controller in controllers {
    controller.delete()
}
\`\`\`

After this, any capabilities that use that storage path are rendered invalid.

Initializing the Resource [#initializing-the-resource]

Initialize the resource with arguments for the capabilities needed from the account calling the create transaction.

In \`init\`, we can take advantage of [preconditions] to make sure that the user has the appropriate capabilities needed to support this functionality by using [\`.check()\`] for the relevant capabilities.

You could use the pattern we've used before with errors, but since these won't be useful outside of \`init\`, we can also just include them inside it:

\`\`\`cadence
access(all) resource SaleCollection  {
    access(self) let ownerCollection: Capability<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>
    access(self) let prices: {UInt64: UFix64}
    access(account) let ownerVault: Capability<&{ExampleToken.Receiver}>

    init (ownerCollection: Capability<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>,
            ownerVault: Capability<&{ExampleToken.Receiver}>) {

        pre {
            // Check that the owner's collection capability is correct
            ownerCollection.check():
                "ExampleMarketplace.SaleCollection.init: "
                .concat("Owner's NFT Collection Capability is invalid! ")
                .concat("Make sure the owner has set up an \`IntermediateNFT.Collection\` ")
                .concat("in their account and provided a valid capability")

            // Check that the fungible token vault capability is correct
            ownerVault.check():
                "ExampleMarketplace.SaleCollection.init: "
                .concat("Owner's Receiver Capability is invalid! ")
                .concat("Make sure the owner has set up an \`ExampleToken.Vault\` ")
                .concat("in their account and provided a valid capability")
        }
        self.ownerCollection = ownerCollection
        self.ownerVault = ownerVault
        self.prices = {}
    }
}
\`\`\`

Owner functions [#owner-functions]

Next, we can add the functions that allow the owner to manage their sales. For this, you'll need to first create an [entitlement] to lock the functionality away so that only the owner can use it. Remember, entitlements are declared at the contract level:

\`\`\`cadence
// Existing events
access(all) event ForSale(id: UInt64, price: UFix64, owner: Address?)
access(all) event PriceChanged(id: UInt64, newPrice: UFix64, owner: Address?)
access(all) event NFTPurchased(id: UInt64, price: UFix64, seller: Address?, buyer: Address?)
access(all) event SaleCanceled(id: UInt64, seller: Address?)

// New entitlement
access(all) entitlement Owner
\`\`\`

:::note
Strictly speaking, we're not actually going to use this entitlement. We're using it to "lock" the functionality, but we're not giving the entitlement to any other accounts. The owner doesn't need to use this "key" to unlock the functions limited with it — they automatically have access.
:::

1. Add a function that the owner of the resource can use to list one of their tokens for sale, and \`emit\` an \`event\` that they've done so.

2. Use a \`pre\`condition to return an error if they don't own the token they're trying to list. As before, this is probably the only place where this error will be useful, so it can be placed directly in the function:

   \`\`\`cadence
   access(Owner) fun listForSale(tokenID: UInt64, price: UFix64) {
       pre {
           self.ownerCollection.borrow()!.idExists(id: tokenID):
               "ExampleMarketplace.SaleCollection.listForSale: "
               .concat("Cannot list token ID ").concat(tokenID.toString())
               .concat(" . This NFT ID is not owned by the seller.")
               .concat("Make sure an ID exists in the sellers NFT Collection")
               .concat(" before trying to list it for sale")
      }
      // store the price in the price array
      self.prices[tokenID] = price

      emit ForSale(id: tokenID, price: price, owner: self.owner?.address)
   }
   \`\`\`

3. Add a function to allow changing the price. It should also \`emit\` the appropriate \`event\`:

   \`\`\`cadence
   access(Owner) fun changePrice(tokenID: UInt64, newPrice: UFix64) {
       self.prices[tokenID] = newPrice

       emit PriceChanged(id: tokenID, newPrice: newPrice, owner: self.owner?.address)
   }
   \`\`\`

4. Add a function that allows the owner to cancel their sale. You don't need to do anything with the token itself, as it hasn't left the owners account:

   \`\`\`cadence
   access(Owner) fun cancelSale(tokenID: UInt64) {
       // remove the price
       self.prices.remove(key: tokenID)
       self.prices[tokenID] = nil

       // Nothing needs to be done with the actual token because it is already in the owner's collection
   }
   \`\`\`

:::note
Solidity devs, take note here! In Cadence, you can build an NFT marketplace without needing to transfer NFTs to a third party or needing to give a third party permission to take the NFT.
:::

Purchasing an NFT [#purchasing-an-nft]

Now, you need to add a function that anyone can call and use to purchase the NFT. It needs to accept arguments for:

* The token to be purchased.
* The recipient's collection that is going to receive the NFT.
* A vault containing the purchase price.

\`\`\`cadence
access(all) fun purchase(
        tokenID: UInt64,
        recipient: Capability<&IntermediateNFT.Collection>, buyTokens: @ExampleToken.Vault
    ) {
    // TODO
}
\`\`\`

:::warning
You are **not** providing the purchaser's vault here — that's an anti-pattern. Instead, create a temporary vault and use that to transfer the tokens.
:::
You'll also want to use \`pre\`conditions to check and provide errors as appropriate for:

* The NFT with the provided ID is for sale.
* The buyer has included the correct amount of tokens in the provided vault.
* The buyer has the collection capability needed to receive the NFT.

\`\`\`cadence
pre {
    self.prices[tokenID] != nil:
        "ExampleMarketplace.SaleCollection.purchase: "
        .concat("Cannot purchase NFT with ID ")
        .concat(tokenID.toString())
        .concat(" There is not an NFT with this ID available for sale! ")
        .concat("Make sure the ID to purchase is correct.")
    buyTokens.balance >= (self.prices[tokenID] ?? 0.0):
        "ExampleMarketplace.SaleCollection.purchase: "
        .concat(" Cannot purchase NFT with ID ")
        .concat(tokenID.toString())
        .concat(" The amount provided to purchase (")
        .concat(buyTokens.balance.toString())
        .concat(") is less than the price of the NFT (")
        .concat(self.prices[tokenID]!.toString())
        .concat("). Make sure the ID to purchase is correct and ")
        .concat("the correct amount of tokens have been used to purchase.")
    recipient.borrow != nil:
        "ExampleMarketplace.SaleCollection.purchase: "
        .concat(" Cannot purchase NFT with ID ")
        .concat(tokenID.toString())
        .concat(". The buyer's NFT Collection Capability is invalid.")
}
\`\`\`

Assuming these checks all pass, your function then needs to:

* Get a reference of the price of the token then clear it.
* Get a reference to the owner's vault and deposit the tokens from the transaction vault.
* Get a reference to the NFT receiver for the buyer.
* Deposit the NFT into the buyer's collection.
* Emit the appropriate event.

\`\`\`cadence
// get the value out of the optional
let price = self.prices[tokenID]!

self.prices[tokenID] = nil

let vaultRef = self.ownerVault.borrow()
    ?? panic("Could not borrow reference to owner token vault")

// deposit the purchasing tokens into the owners vault
vaultRef.deposit(from: <-buyTokens)

// borrow a reference to the object that the receiver capability links to
// We can force-cast the result here because it has already been checked in the pre-conditions
let receiverReference = recipient.borrow()!

// deposit the NFT into the buyers collection
receiverReference.deposit(token: <-self.ownerCollection.borrow()!.withdraw(withdrawID: tokenID))

emit NFTPurchased(id: tokenID, price: price, seller: self.owner?.address, buyer: receiverReference.owner?.address)
\`\`\`

The full function should be similar to:

\`\`\`cadence
// purchase lets a user send tokens to purchase an NFT that is for sale
access(all) fun purchase(tokenID: UInt64,
                            recipient: Capability<&IntermediateNFT.Collection>, buyTokens: @ExampleToken.Vault) {
    pre {
        self.prices[tokenID] != nil:
            "ExampleMarketplace.SaleCollection.purchase: "
            .concat("Cannot purchase NFT with ID ")
            .concat(tokenID.toString())
            .concat(" There is not an NFT with this ID available for sale! ")
            .concat("Make sure the ID to purchase is correct.")
        buyTokens.balance >= (self.prices[tokenID] ?? 0.0):
            "ExampleMarketplace.SaleCollection.purchase: "
            .concat(" Cannot purchase NFT with ID ")
            .concat(tokenID.toString())
            .concat(" The amount provided to purchase (")
            .concat(buyTokens.balance.toString())
            .concat(") is less than the price of the NFT (")
            .concat(self.prices[tokenID]!.toString())
            .concat("). Make sure the ID to purchase is correct and ")
            .concat("the correct amount of tokens have been used to purchase.")
        recipient.borrow != nil:
            "ExampleMarketplace.SaleCollection.purchase: "
            .concat(" Cannot purchase NFT with ID ")
            .concat(tokenID.toString())
            .concat(". The buyer's NFT Collection Capability is invalid.")
    }

    let price = self.prices[tokenID]!
    self.prices[tokenID] = nil

    let vaultRef = self.ownerVault.borrow()
        ?? panic("Could not borrow reference to owner token vault")
    vaultRef.deposit(from: <-buyTokens)

    // borrow a reference to the object that the receiver capability links to
    // We can force-cast the result here because it has already been checked in the pre-conditions
    let receiverReference = recipient.borrow()!

    receiverReference.deposit(token: <-self.ownerCollection.borrow()!.withdraw(withdrawID: tokenID))

    emit NFTPurchased(id: tokenID, price: price, seller: self.owner?.address, buyer: receiverReference.owner?.address)
}
\`\`\`

Views [#views]

Finally, add a couple of views so that others can read the prices for NFTs and which ones are for sale:

\`\`\`cadence
access(all) view fun idPrice(tokenID: UInt64): UFix64? {
    return self.prices[tokenID]
}

access(all) view fun getIDs(): [UInt64] {
    return self.prices.keys
}
\`\`\`

Creating a SaleCollection [#creating-a-salecollection]

Last, but not least, you need to add a contract-level function that allows users to create their own \`SaleCollection\` resource. It needs to accept the same arguments as the \`init\` for the resource, pass them into the \`create\` call, and return the newly-created resource:

:::warning
Make sure you don't accidentally put this function inside the \`SaleCollection\` resource!
:::

\`\`\`cadence
access(all) fun createSaleCollection(
    ownerCollection: Capability<auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>,
    ownerVault: Capability<&{ExampleToken.Receiver}>
): @SaleCollection
{
    return <- create SaleCollection(ownerCollection: ownerCollection, ownerVault: ownerVault)
}
\`\`\`

Marketplace contract summary [#marketplace-contract-summary]

That's it! You've completed the contract needed to allow anyone who owns the NFTs and fungible tokens you've created to sell one, accepting payment in the other! This marketplace contract has resources that function similarly to the NFT \`Collection\` you built in [Non-Fungible Tokens], with a few differences and additions.

This marketplace contract has methods to add and remove NFTs, but instead of storing the NFT resource object in the sale collection, the user provides a capability to their main collection that allows the listed NFT to be withdrawn and transferred when it is purchased. When a user wants to put their NFT up for sale, they do so by providing the ID and the price to the \`listForSale()\` function.

Then, another user can call the \`purchase()\` function, sending an \`ExampleToken.Vault\` that contains the currency they are using to make the purchase. The buyer also includes a capability to their NFT \`ExampleNFT.Collection\` so that the purchased token can be immediately deposited into their collection when the purchase is made.

The owner of the sale saves a capability to their Fungible Token \`Receiver\` within the sale. This allows the sale resource to be able to immediately deposit the currency that was used to buy the NFT into the owners \`Vault\` when a purchase is made.

Finally, a marketplace contract includes appropriate \`event\`s that are emitted when important actions happen. External apps can monitor these events to know the state of the smart contract.

Deployment [#deployment]

Deploy the marketplace contract with account \`0x0a\`.

Using the marketplace [#using-the-marketplace]

Now that you've set up your user accounts, and deployed the contracts for the NFT, fungible token, and marketplace, it's time to write a few \`transaction\`s to tie everything together.

:::note
One of the most useful features of Cadence is that transactions are code written in Cadence. You can use this to add functionality after deploying your contracts — you're not limited to only the functions you thought of when you wrote the contract.
:::

Building a transaction to create a sale [#building-a-transaction-to-create-a-sale]

Now it's time to write a \`transaction\` to \`create\` a \`SaleCollection\` and list account \`0x08\`'s token for sale.

:::tip
Depending on your app design, you might want to break these steps up into separate transactions to set up the the \`SaleCollection\` and add an NFT to it.
:::

1. Import the three contracts and add a \`prepare\` statement with auth to \`SaveValue\`, \`StorageCapabilities\`, and \`PublishCapability\`:

   \`\`\`cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   transaction {
       prepare(acct: auth(SaveValue, StorageCapabilities, PublishCapability) &Account) {
           // TODO
       }
   }
   \`\`\`

2. Complete the following in \`prepare\`:

   * Borrow a reference to the user's vault.
   * Create an entitled capability to the user's NFT collection.
   * Use these to to create a \`SaleCollection\` and store it in a constant.

   \`\`\`cadence
   let receiver = acct.capabilities.get<&{ExampleToken.Receiver}>(ExampleToken.VaultPublicPath)
   let collectionCapability = acct.capabilities.storage.issue
                               <auth(IntermediateNFT.Withdraw) &IntermediateNFT.Collection>
                               (IntermediateNFT.CollectionStoragePath)
   let sale <- BasicMarketplace.createSaleCollection(ownerCollection: collectionCapability, ownerVault: receiver)
   \`\`\`

3. Use your \`sale\` instance of the collection to create a sale. Afterwards, \`move (<-)\` it into account storage:

   \`\`\`cadence
   sale.listForSale(tokenID: 1, price: 10.0)
   acct.storage.save(<-sale, to: /storage/NFTSale)
   \`\`\`

   <Callout type="info">
     You might be tempted to change the order here to handle creating the \`SaleCollection\` and storing it first, then using it to create a sale.

     This won't work because resources can only be moved — they can't be copied. Once you \`move (<-)\` \`sale\` to storage, \`sale\` is no longer usable.
   </Callout>

4. Create and publish a public capability so that others can use the public functions of this resource to find and purchase NFTs:

   \`\`\`cadence
   let publicCap = acct.capabilities.storage.issue<&BasicMarketplace.SaleCollection>(/storage/NFTSale)
   acct.capabilities.publish(publicCap, at: /public/NFTSale)
   \`\`\`

5. Call the transaction with account \`0x08\`.

Checking for NFTs to purchase [#checking-for-nfts-to-purchase]

Let's create a script to ensure that the sale was created correctly:

1. Add a new one called \`GetSaleIDsAndPrices\`.

2. Import the contracts and stub out a script that accepts an \`Address\` as an argument and returns a \`UInt64\` array:

   \`\`\`cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   access(all)
   fun main(address: Address): [UInt64] {
      // TODO
   }
   \`\`\`

3. In the script:

   * Use the \`address\` to get a public account object for that address.
   * Attempt to borrow a reference to the public capability for the \`SaleCollection\` in that account:
     * Panic and return an error if it's not found.
     * Call \`getIDs\` if it is, and return the list of NFTs for sale.

   \`\`\`cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   access(all)
   fun main(address: Address): [UInt64] {

       let account = getAccount(address)

       let saleRef = account.capabilities.borrow<&BasicMarketplace.SaleCollection>(/public/NFTSale)
           ?? panic("Could not borrow a reference to the SaleCollection capability for the address provided")

       return saleRef.getIDs()
   }
   \`\`\`

4. Run the script. You should be part of the way there:

   \`\`\`zsh
   [1]
   \`\`\`

   The script returns an array containing the one NFT for sale, but what about the prices? We added a function to return the price of a given NFT, but not a list or array.

   We could update the contract since we own it (another power of Cadence), but even if we didn't, we could always add functionality via a script.

5. Update your script to create a \`struct\` to return the data in, then fetch the list of IDs, loop through them to get the prices, and return an array with the prices:

   \`\`\`cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   access(all) struct Pair {
       access(all) let id: UInt64
       access(all) let value: UFix64

       init(id: UInt64, value: UFix64) {
           self.id = id
           self.value = value
       }
   }

   access(all)
   fun main(address: Address): [Pair] {

       let account = getAccount(address)

       let saleRef = account.capabilities.borrow<&BasicMarketplace.SaleCollection>(/public/NFTSale)
           ?? panic("Could not borrow a reference to the SaleCollection capability for the address provided")

       let ids = saleRef.getIDs()

       let pricePairs: [Pair] = []

       for id in ids {
           let pair = Pair(id: id, value: saleRef.idPrice(tokenID: id) ?? 0.0)
           pricePairs.append(pair)
       }

       return pricePairs
   }
   \`\`\`

Purchasing an NFT [#purchasing-an-nft-1]

Finally, you can add a transaction that a buyer can use to purchase the seller's NFT with their fungible tokens.

1. Create a \`transaction\` called \`PurchaseNFT\`, import the contract, and stub it out:

   \`\`\`cadence
   import ExampleToken from 0x06
   import IntermediateNFT from 0x07
   import BasicMarketplace from 0x0a

   transaction(sellerAddress: Address, tokenID: UInt64, price: UFix64) {

       let collectionCapability: Capability<&IntermediateNFT.Collection>
       let temporaryVault: @ExampleToken.Vault

       prepare(acct: auth(BorrowValue) &Account) {
           // TODO
       }

       execute {
           // TODO
       }
   }
   \`\`\`

2. Complete the following in \`prepare\`:

   * \`get\` the \`collectionCapability\` for the caller's NFT collection.
   * \`borrow\` an authorized reference to the buyers token vault.
   * Withdraw the purchase price from the buyers vault and \`move (<-)\` it into the temporary vault.

   \`\`\`cadence
   self.collectionCapability = acct.capabilities.get<&IntermediateNFT.Collection>(IntermediateNFT.CollectionPublicPath)

   let vaultRef = acct
       .storage.borrow<auth(ExampleToken.Withdraw) &ExampleToken.Vault>(from: /storage/CadenceFungibleTokenTutorialVault)
       ?? panic("Could not borrow a reference to "
                    .concat("ExampleToken.Vault")
                    .concat(". Make sure the user has set up an account ")
                    .concat("with an ExampleToken Vault and valid capability."))

   self.temporaryVault <- vaultRef.withdraw(amount: price)
   \`\`\`

3. Complete the following in \`execute\`:

   * Get a reference to the public account for the \`sellerAddress\`.
   * \`borrow\` a reference to the seller's \`SaleCollection\`.
   * Call \`purchase\` with the \`tokenID\`, buyers collection capability, and the temporary vault.

   \`\`\`cadence
   let seller = getAccount(sellerAddress)

   let saleRef = seller.capabilities.get<&BasicMarketplace.SaleCollection>(/public/NFTSale)
                       .borrow()
       ?? panic("Could not borrow a reference to "
                    .concat("the seller's ExampleMarketplace.SaleCollection")
                    .concat(". Make sure the seller has set up an account ")
                    .concat("with an ExampleMarketplace SaleCollection and valid capability."))

   saleRef.purchase(tokenID: tokenID, recipient: self.collectionCapability, buyTokens: <-self.temporaryVault)
   \`\`\`

4. Call the transaction with account \`0x09\` to purchase the token with id \`1\` from \`0x08\` for \`10.0\` tokens.

Verifying the NFT was purchased correctly [#verifying-the-nft-was-purchased-correctly]

You've already written the scripts you need to check for NFT ownership and token balances. Copy them over from your earlier projects, or use the ones below:

\`\`\`cadence
import ExampleToken from 0x06

access(all)
fun main(address: Address): String {
    let account = getAccount(address)

    let accountReceiverRef = account.capabilities.get<&{ExampleToken.Balance}>(ExampleToken.VaultPublicPath)
                            .borrow()
            ?? panic(ExampleToken.vaultNotConfiguredError(address: address))

    return("Balance for "
        .concat(address.toString())
        .concat(": ").concat(accountReceiverRef.balance.toString())
        )
}
\`\`\`

\`\`\`cadence
import IntermediateNFT from 0x07

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

Creating a marketplace for any generic NFT [#creating-a-marketplace-for-any-generic-nft]

The previous examples show how a simple marketplace can be created for a specific class of NFTs. However, users will want to have a marketplace where they can buy and sell **any** NFT they want, regardless of its type.

To learn more about a completely decentralized example of a generic marketplace, check out the [NFT storefront repo]. This contract is already deployed to testnet and mainnet and can be used by anyone for any generic NFT sale!

Accepting payment in $FLOW [#accepting-payment-in-flow]

What about accepting payment in the network token, [$FLOW]? We can't quite update this simplified marketplace to accept it, but it's actually quite simple to do so because the network token follows the [Flow Fungible Token standard].

In other words, if you configure your marketplace to accept any token that follows the full standard, it will also be able to use the Flow token!

Conclusion [#conclusion]

In this tutorial, you constructed a simplified NFT marketplace on Flow using the composability of Cadence resources, interfaces, and capabilities. You learned how to:

* Build a marketplace contract that allows users to list, buy, and sell NFTs in exchange for fungible tokens.
* Leverage capabilities and entitlements to securely manage access and transfers.
* Emit and observe events to track marketplace activity.
* Write and execute transactions and scripts to interact with the marketplace and verify asset ownership and balances.

By completing this tutorial, you are now able to:

* Construct composable smart contracts that integrate multiple token standards.
* Implement secure and flexible resource management using Cadence's type system.
* Develop and test end-to-end flows for NFT sales and purchases on Flow.

If you're ready to take your skills further, explore the [NFT storefront repo] for a production-ready, generic NFT marketplace, or try extending your marketplace to support additional features and token types!

Reference solution [#reference-solution]

:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.
:::

* [Reference Solution]

{/* Reference-style links. Will not render on page. */}

[NFT storefront repo]: https://github.com/onflow/nft-storefront

[Marketplace Setup Tutorial]: ./marketplace-setup

[marketplace setup]: ./marketplace-setup

[Setup Reference Solution]: https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64

[Interfaces]: ../language/interfaces.mdx

[Resources]: ../language/resources.mdx

[Resource]: ../language/resources.mdx

[Capabilities]: ../language/capabilities.md

[capability]: ../language/capabilities.md

[events]: ../language/events.md

[preconditions]: ../language/functions.mdx#function-preconditions-and-postconditions

[\`.check()\`]: ../language/accounts/capabilities.mdx#checking-the-existence-of-public-capabilities

[entitlement]: ../language/access-control.md#entitlements

[Non-Fungible Tokens]: ./non-fungible-tokens-1

[capabilities tutorial]: ./capabilities

[$FLOW]: https://developers.flow.com/build/core-contracts/flow-token

[Flow Fungible Token standard]: https://github.com/onflow/flow-ft

[Reference Solution]: https://play.flow.com/d8906744-aa9b-4323-9f72-ccf78ab8e4b2
`,r={title:"Marketplace",description:"Build a composable NFT marketplace on Flow using Cadence, integrating fungible and non-fungible tokens, capabilities, and events."},c={contents:[{heading:void 0,content:"In this tutorial, we're going to create a simplified marketplace that uses both the fungible and non-fungible token (NFT) contracts that we built in previous tutorials."},{heading:void 0,content:`:::warning
This tutorial uses the simplified fungible and non-fungible tokens you built in this series. It is not suitable for production. If you're ready to build or work with a production-quality marketplace, check out the [NFT storefront repo]. This contract is already deployed to testnet and mainnet and can be used by anyone for any generic NFT sale!
:::
Marketplaces are a popular application of blockchain technology and smart contracts. People with digital collectibles such as NFTs need to be able to buy and sell them — either with the network token or their fungible tokens.`},{heading:void 0,content:"More than just a convenience, marketplaces demonstrate one of the most compelling arguments for developing digital property on blockchains. In web 2, each developer needed to build their own bespoke systems for buying, selling, trading, and storing digital property. Onchain, if you build digital property that adheres to the appropriate standards, your digital collectibles, items, etc., will **automatically appear on several marketplace apps** built by experts in marketplaces who have made them the focus of their attention and business."},{heading:"objectives",content:"After completing this tutorial, you'll be able to:"},{heading:"objectives",content:"Construct an NFT marketplace that allows users to buy and sell NFTs in exchange for $FLOW or your fungible token."},{heading:"objectives",content:"Utilize [interfaces], [resources], and [capabilities] to write composable code that takes advantage of resources built by others and allows others to build on your products."},{heading:"objectives",content:"Construct and emit [events] to share contract actions and states with other apps and services"},{heading:"prerequisites",content:"To complete this tutorial, you must have completed the [Marketplace Setup Tutorial]. If you need to, you can start from the [Setup Reference Solution], but you'll need to follow the [Marketplace Setup Tutorial] to deploy the contracts and call the setup transactions."},{heading:"building-with-composability",content:"Now that **there are** contracts deployed for both fungible and non-fungible tokens, we can build a marketplace that uses both. We've picked the words *there are* in the prior sentence on purpose. It doesn't matter that you created these contracts. If they were deployed onchain, instead of in the ephemeral simulation in the playground, **anyone** could complete this tutorial to build a marketplace that works with your NFTs and tokens."},{heading:"building-with-composability",content:"It's one of the most powerful and useful properties of building onchain and it's called *composability* — the ability for developers to leverage shared resources, such as code, digital property, and user bases, and use them as building blocks for a new application."},{heading:"building-with-composability",content:"This isn't an entirely new concept — we're used to reusing code, open source projects, etc. But the degree and scale are much higher. For example, if you're building an onchain version of a web forum, you don't need to do anything to allow your users to have a profile picture beyond allowing them to select which PFP they own from the list of PFP collections you choose to incorporate into your app."},{heading:"building-with-composability",content:"You're happy because you get a solution that works for your users for minimal effort, and the PFP collection creator is happy because their work becomes more valuable and desirable the more places it can be used an seen. Everybody wins!"},{heading:"building-with-composability",content:"Flow is designed to enable composability through interfaces, resources and capabilities:"},{heading:"building-with-composability",content:"[Interfaces] allow projects to support any generic type as long as it supports a standard set of functionality specified by an interface."},{heading:"building-with-composability",content:"[Resources] can be passed around and owned by accounts, contracts or even other resources, unlocking different use cases depending on where the resource is stored."},{heading:"building-with-composability",content:"[Capabilities] allow exposing user-controlled sets of functionality and permissions through special objects that enforce strict security with Cadence's type system."},{heading:"building-with-composability",content:"The combination of these features allow developers to do more with less, re-using known safe code and design patterns to create new, powerful, and unique interactions!"},{heading:"building-a-marketplace",content:"To create a marketplace, we need to integrate the functionality of both fungible and non-fungible tokens into a single contract that gives users control over their money and assets. To accomplish this, we'll create a composable smart contract."},{heading:"marketplace-design",content:"A traditional way to implement a marketplace is to have a central smart contract that users deposit their NFTs and their price into, and anyone can come by and buy the token for that price."},{heading:"marketplace-design",content:"This approach is reasonable, but it centralizes the process and takes away options from the owners. A better option that's possible with Cadence is to allow users to maintain ownership of the NFTs that they are trying to sell while they are trying to sell them. Instead of taking a centralized approach, each user can list a sale from within their own account."},{heading:"marketplace-design",content:"They'll do this by using a marketplace contract you'll build to store an instance of a `@SaleCollection` resource in their account storage."},{heading:"marketplace-design",content:"Then, the seller, independently or through an app, can either provide a link to their sale to an application that can list it centrally on a website, or even to a central sale aggregator smart contract if they want the entire transaction to stay onchain."},{heading:"validating-setup",content:"If you haven't just completed the [Marketplace Setup] tutorial, run the `Validate Setup` script to double-check that your contracts and accounts are in the correct state to begin building the marketplace."},{heading:"validating-setup",content:`:::note
Remember, we only need to do this again to ensure that the ephemeral state of the playground is set up correctly. Otherwise, you'd already have contracts and users with accounts that are configured ready to go.
:::
The following output appears if your accounts are set up correctly:`},{heading:"setting-up-an-nft-marketplace",content:"Add a new contract called `BasicMarketplace`. It needs to import both of the existing contracts:"},{heading:"setting-up-an-nft-marketplace",content:`:::note
Remember, you don't need to own a contract to be able to import it or use any of its public functionality!
:::`},{heading:"adding-appropriate-events",content:"As in Solidity, Cadence smart contracts can emit developer-defined [events] during execution, which can be used to log data that can be observed offchain. This can be used by frontends, and other apps or platforms, including block explorers and data aggregators, which can monitor the state of the contract and related NFTs."},{heading:"adding-appropriate-events",content:"Events in Cadence are declared in a similar fashion as functions, but they start with an access control declaration. The `event` keyword follows, then the name and parameters in parentheses. You can use most of the same types as functions, but you cannot use resources. Resources are moved when used as an argument, and using them and events don't have a method to put them somewhere else or destroy them."},{heading:"adding-appropriate-events",content:"We can anticipate that we'll want to emit events when users take standard actions with the contract, such as when NFTs are listed, purchased, the price is changed, or the sale is cancelled."},{heading:"adding-appropriate-events",content:"We're marking the addresses as optional, because there's some circumstances where an NFT might not have an owner, so those addresses would be `nil`."},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"Next, we need to configure a [resource] that users can use to put their NFTs up for sale, and other users can use to then purchase those NFTs for fungible tokens. In it, you'll need to add:"},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"A [capability] to access the owner's collection."},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"A place to store the prices of NFTs for sale."},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"A [capability] to deposit tokens into the sellers vault when an NFT is purchased."},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"You'll also need functions to:"},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"Allow the owner to list an NFT for sale."},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"Allow the owner to cancel a sale."},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"Allow the owner to change the price."},{heading:"creating-a-resource-to-put-items-up-for-sale",content:"Allow a third party to buy the NFT, and deposit the purchase price in the seller's vault."},{heading:"definition-and-initialization",content:"To define and initialize:"},{heading:"definition-and-initialization",content:"Create the resource definition:"},{heading:"definition-and-initialization",content:"In this case, `access(all)` is giving public scope to the **definition** of the resource type, **not** any given instance of the resource or anything in one of those instances. It's good to make these public so that others can build contracts and apps that interact with yours."},{heading:"definition-and-initialization",content:"In it, add a variable to store a capability for the owner's collection with the ability to withdraw from the collection:"},{heading:"definition-and-initialization",content:"You'll get errors until after you write the `init` function and assign values to these properties."},{heading:"definition-and-initialization",content:"Add a dictionary to relate NFT ids to the sale price for that NFT:"},{heading:"definition-and-initialization",content:"`access(self)` limits access to the resource itself, from within the resource."},{heading:"definition-and-initialization",content:"Add a variable to store a capability for a sellers fungible token vault's receiver:"},{heading:"resource-owned-capabilities",content:"You first learned about basic function and use of [capabilities] in the [capabilities tutorial]. They're links to private objects in account storage that specify and expose a subset of the resource they are linked to."},{heading:"resource-owned-capabilities",content:"With the marketplace contract, we are utilizing a new feature of capabilities — they can be stored anywhere! Lots of functionality is contained within resources, and developers will sometimes want to be able to access some of the functionality of resources from within different resources or contracts."},{heading:"resource-owned-capabilities",content:"We stored two different capabilities in the marketplace sale collection:"},{heading:"resource-owned-capabilities",content:"If an object like a contract or resource owns a capability, they can borrow a reference to that capability at any time to access that functionality without having to get it from the owner's account every time."},{heading:"resource-owned-capabilities",content:"This is especially important if the owner wants to expose some functionality that is only intended for one person, meaning that the link for the capability is not stored in a public path."},{heading:"resource-owned-capabilities",content:"We do that in this example, because the sale collection stores a capability that can access the `withdraw` functionality of the `IntermediateNFT.Collection` with the `IntermediateNFT.Withdraw` entitlement. It needs this because it withdraws the specified NFT in the `purchase()` method to send to the buyer."},{heading:"resource-owned-capabilities",content:"It is important to remember that control of a capability does not equal ownership of the underlying resource. You can use the capability to access that resource's functionality, but you can't use it to fake ownership. You need the actual resource (identified by the prefixed `@` symbol) to prove ownership."},{heading:"resource-owned-capabilities",content:"Additionally, these capabilities can be stored anywhere, but if a user decides that they no longer want the capability to be used, they can revoke it by getting the controller for the capability from their account with the `getControllers` method and delete the capability with `delete`."},{heading:"resource-owned-capabilities",content:"Here is an example that deletes all of the controllers for a specified storage path:"},{heading:"resource-owned-capabilities",content:"After this, any capabilities that use that storage path are rendered invalid."},{heading:"initializing-the-resource",content:"Initialize the resource with arguments for the capabilities needed from the account calling the create transaction."},{heading:"initializing-the-resource",content:"In `init`, we can take advantage of [preconditions] to make sure that the user has the appropriate capabilities needed to support this functionality by using [`.check()`] for the relevant capabilities."},{heading:"initializing-the-resource",content:"You could use the pattern we've used before with errors, but since these won't be useful outside of `init`, we can also just include them inside it:"},{heading:"owner-functions",content:"Next, we can add the functions that allow the owner to manage their sales. For this, you'll need to first create an [entitlement] to lock the functionality away so that only the owner can use it. Remember, entitlements are declared at the contract level:"},{heading:"owner-functions",content:`:::note
Strictly speaking, we're not actually going to use this entitlement. We're using it to "lock" the functionality, but we're not giving the entitlement to any other accounts. The owner doesn't need to use this "key" to unlock the functions limited with it — they automatically have access.
:::`},{heading:"owner-functions",content:"Add a function that the owner of the resource can use to list one of their tokens for sale, and `emit` an `event` that they've done so."},{heading:"owner-functions",content:"Use a `pre`condition to return an error if they don't own the token they're trying to list. As before, this is probably the only place where this error will be useful, so it can be placed directly in the function:"},{heading:"owner-functions",content:"Add a function to allow changing the price. It should also `emit` the appropriate `event`:"},{heading:"owner-functions",content:"Add a function that allows the owner to cancel their sale. You don't need to do anything with the token itself, as it hasn't left the owners account:"},{heading:"owner-functions",content:`:::note
Solidity devs, take note here! In Cadence, you can build an NFT marketplace without needing to transfer NFTs to a third party or needing to give a third party permission to take the NFT.
:::`},{heading:"purchasing-an-nft",content:"Now, you need to add a function that anyone can call and use to purchase the NFT. It needs to accept arguments for:"},{heading:"purchasing-an-nft",content:"The token to be purchased."},{heading:"purchasing-an-nft",content:"The recipient's collection that is going to receive the NFT."},{heading:"purchasing-an-nft",content:"A vault containing the purchase price."},{heading:"purchasing-an-nft",content:`:::warning
You are **not** providing the purchaser's vault here — that's an anti-pattern. Instead, create a temporary vault and use that to transfer the tokens.
:::
You'll also want to use \`pre\`conditions to check and provide errors as appropriate for:`},{heading:"purchasing-an-nft",content:"The NFT with the provided ID is for sale."},{heading:"purchasing-an-nft",content:"The buyer has included the correct amount of tokens in the provided vault."},{heading:"purchasing-an-nft",content:"The buyer has the collection capability needed to receive the NFT."},{heading:"purchasing-an-nft",content:"Assuming these checks all pass, your function then needs to:"},{heading:"purchasing-an-nft",content:"Get a reference of the price of the token then clear it."},{heading:"purchasing-an-nft",content:"Get a reference to the owner's vault and deposit the tokens from the transaction vault."},{heading:"purchasing-an-nft",content:"Get a reference to the NFT receiver for the buyer."},{heading:"purchasing-an-nft",content:"Deposit the NFT into the buyer's collection."},{heading:"purchasing-an-nft",content:"Emit the appropriate event."},{heading:"purchasing-an-nft",content:"The full function should be similar to:"},{heading:"views",content:"Finally, add a couple of views so that others can read the prices for NFTs and which ones are for sale:"},{heading:"creating-a-salecollection",content:"Last, but not least, you need to add a contract-level function that allows users to create their own `SaleCollection` resource. It needs to accept the same arguments as the `init` for the resource, pass them into the `create` call, and return the newly-created resource:"},{heading:"creating-a-salecollection",content:":::warning\nMake sure you don't accidentally put this function inside the `SaleCollection` resource!\n:::"},{heading:"marketplace-contract-summary",content:"That's it! You've completed the contract needed to allow anyone who owns the NFTs and fungible tokens you've created to sell one, accepting payment in the other! This marketplace contract has resources that function similarly to the NFT `Collection` you built in [Non-Fungible Tokens], with a few differences and additions."},{heading:"marketplace-contract-summary",content:"This marketplace contract has methods to add and remove NFTs, but instead of storing the NFT resource object in the sale collection, the user provides a capability to their main collection that allows the listed NFT to be withdrawn and transferred when it is purchased. When a user wants to put their NFT up for sale, they do so by providing the ID and the price to the `listForSale()` function."},{heading:"marketplace-contract-summary",content:"Then, another user can call the `purchase()` function, sending an `ExampleToken.Vault` that contains the currency they are using to make the purchase. The buyer also includes a capability to their NFT `ExampleNFT.Collection` so that the purchased token can be immediately deposited into their collection when the purchase is made."},{heading:"marketplace-contract-summary",content:"The owner of the sale saves a capability to their Fungible Token `Receiver` within the sale. This allows the sale resource to be able to immediately deposit the currency that was used to buy the NFT into the owners `Vault` when a purchase is made."},{heading:"marketplace-contract-summary",content:"Finally, a marketplace contract includes appropriate `event`s that are emitted when important actions happen. External apps can monitor these events to know the state of the smart contract."},{heading:"deployment",content:"Deploy the marketplace contract with account `0x0a`."},{heading:"using-the-marketplace",content:"Now that you've set up your user accounts, and deployed the contracts for the NFT, fungible token, and marketplace, it's time to write a few `transaction`s to tie everything together."},{heading:"using-the-marketplace",content:`:::note
One of the most useful features of Cadence is that transactions are code written in Cadence. You can use this to add functionality after deploying your contracts — you're not limited to only the functions you thought of when you wrote the contract.
:::`},{heading:"building-a-transaction-to-create-a-sale",content:"Now it's time to write a `transaction` to `create` a `SaleCollection` and list account `0x08`'s token for sale."},{heading:"building-a-transaction-to-create-a-sale",content:":::tip\nDepending on your app design, you might want to break these steps up into separate transactions to set up the the `SaleCollection` and add an NFT to it.\n:::"},{heading:"building-a-transaction-to-create-a-sale",content:"Import the three contracts and add a `prepare` statement with auth to `SaveValue`, `StorageCapabilities`, and `PublishCapability`:"},{heading:"building-a-transaction-to-create-a-sale",content:"Complete the following in `prepare`:"},{heading:"building-a-transaction-to-create-a-sale",content:"Borrow a reference to the user's vault."},{heading:"building-a-transaction-to-create-a-sale",content:"Create an entitled capability to the user's NFT collection."},{heading:"building-a-transaction-to-create-a-sale",content:"Use these to to create a `SaleCollection` and store it in a constant."},{heading:"building-a-transaction-to-create-a-sale",content:"Use your `sale` instance of the collection to create a sale. Afterwards, `move (<-)` it into account storage:"},{heading:"building-a-transaction-to-create-a-sale",content:"You might be tempted to change the order here to handle creating the `SaleCollection` and storing it first, then using it to create a sale."},{heading:"building-a-transaction-to-create-a-sale",content:"This won't work because resources can only be moved — they can't be copied. Once you `move (<-)` `sale` to storage, `sale` is no longer usable."},{heading:"building-a-transaction-to-create-a-sale",content:"Create and publish a public capability so that others can use the public functions of this resource to find and purchase NFTs:"},{heading:"building-a-transaction-to-create-a-sale",content:"Call the transaction with account `0x08`."},{heading:"checking-for-nfts-to-purchase",content:"Let's create a script to ensure that the sale was created correctly:"},{heading:"checking-for-nfts-to-purchase",content:"Add a new one called `GetSaleIDsAndPrices`."},{heading:"checking-for-nfts-to-purchase",content:"Import the contracts and stub out a script that accepts an `Address` as an argument and returns a `UInt64` array:"},{heading:"checking-for-nfts-to-purchase",content:"In the script:"},{heading:"checking-for-nfts-to-purchase",content:"Use the `address` to get a public account object for that address."},{heading:"checking-for-nfts-to-purchase",content:"Attempt to borrow a reference to the public capability for the `SaleCollection` in that account:"},{heading:"checking-for-nfts-to-purchase",content:"Panic and return an error if it's not found."},{heading:"checking-for-nfts-to-purchase",content:"Call `getIDs` if it is, and return the list of NFTs for sale."},{heading:"checking-for-nfts-to-purchase",content:"Run the script. You should be part of the way there:"},{heading:"checking-for-nfts-to-purchase",content:"The script returns an array containing the one NFT for sale, but what about the prices? We added a function to return the price of a given NFT, but not a list or array."},{heading:"checking-for-nfts-to-purchase",content:"We could update the contract since we own it (another power of Cadence), but even if we didn't, we could always add functionality via a script."},{heading:"checking-for-nfts-to-purchase",content:"Update your script to create a `struct` to return the data in, then fetch the list of IDs, loop through them to get the prices, and return an array with the prices:"},{heading:"purchasing-an-nft-1",content:"Finally, you can add a transaction that a buyer can use to purchase the seller's NFT with their fungible tokens."},{heading:"purchasing-an-nft-1",content:"Create a `transaction` called `PurchaseNFT`, import the contract, and stub it out:"},{heading:"purchasing-an-nft-1",content:"Complete the following in `prepare`:"},{heading:"purchasing-an-nft-1",content:"`get` the `collectionCapability` for the caller's NFT collection."},{heading:"purchasing-an-nft-1",content:"`borrow` an authorized reference to the buyers token vault."},{heading:"purchasing-an-nft-1",content:"Withdraw the purchase price from the buyers vault and `move (<-)` it into the temporary vault."},{heading:"purchasing-an-nft-1",content:"Complete the following in `execute`:"},{heading:"purchasing-an-nft-1",content:"Get a reference to the public account for the `sellerAddress`."},{heading:"purchasing-an-nft-1",content:"`borrow` a reference to the seller's `SaleCollection`."},{heading:"purchasing-an-nft-1",content:"Call `purchase` with the `tokenID`, buyers collection capability, and the temporary vault."},{heading:"purchasing-an-nft-1",content:"Call the transaction with account `0x09` to purchase the token with id `1` from `0x08` for `10.0` tokens."},{heading:"verifying-the-nft-was-purchased-correctly",content:"You've already written the scripts you need to check for NFT ownership and token balances. Copy them over from your earlier projects, or use the ones below:"},{heading:"creating-a-marketplace-for-any-generic-nft",content:"The previous examples show how a simple marketplace can be created for a specific class of NFTs. However, users will want to have a marketplace where they can buy and sell **any** NFT they want, regardless of its type."},{heading:"creating-a-marketplace-for-any-generic-nft",content:"To learn more about a completely decentralized example of a generic marketplace, check out the [NFT storefront repo]. This contract is already deployed to testnet and mainnet and can be used by anyone for any generic NFT sale!"},{heading:"accepting-payment-in-flow",content:"What about accepting payment in the network token, [$FLOW]? We can't quite update this simplified marketplace to accept it, but it's actually quite simple to do so because the network token follows the [Flow Fungible Token standard]."},{heading:"accepting-payment-in-flow",content:"In other words, if you configure your marketplace to accept any token that follows the full standard, it will also be able to use the Flow token!"},{heading:"conclusion",content:"In this tutorial, you constructed a simplified NFT marketplace on Flow using the composability of Cadence resources, interfaces, and capabilities. You learned how to:"},{heading:"conclusion",content:"Build a marketplace contract that allows users to list, buy, and sell NFTs in exchange for fungible tokens."},{heading:"conclusion",content:"Leverage capabilities and entitlements to securely manage access and transfers."},{heading:"conclusion",content:"Emit and observe events to track marketplace activity."},{heading:"conclusion",content:"Write and execute transactions and scripts to interact with the marketplace and verify asset ownership and balances."},{heading:"conclusion",content:"By completing this tutorial, you are now able to:"},{heading:"conclusion",content:"Construct composable smart contracts that integrate multiple token standards."},{heading:"conclusion",content:"Implement secure and flexible resource management using Cadence's type system."},{heading:"conclusion",content:"Develop and test end-to-end flows for NFT sales and purchases on Flow."},{heading:"conclusion",content:"If you're ready to take your skills further, explore the [NFT storefront repo] for a production-ready, generic NFT marketplace, or try extending your marketplace to support additional features and token types!"},{heading:"reference-solution",content:`:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!`},{heading:"reference-solution",content:`Reference solutions are functional, but may not be optimal.
:::`},{heading:"reference-solution",content:"[Reference Solution]"}],headings:[{id:"objectives",content:"Objectives"},{id:"prerequisites",content:"Prerequisites"},{id:"building-with-composability",content:"Building with composability"},{id:"building-a-marketplace",content:"Building a marketplace"},{id:"marketplace-design",content:"Marketplace design"},{id:"validating-setup",content:"Validating setup"},{id:"setting-up-an-nft-marketplace",content:"Setting up an NFT marketplace"},{id:"adding-appropriate-events",content:"Adding appropriate events"},{id:"creating-a-resource-to-put-items-up-for-sale",content:"Creating a resource to put items up for sale"},{id:"definition-and-initialization",content:"Definition and initialization"},{id:"resource-owned-capabilities",content:"Resource-owned capabilities"},{id:"initializing-the-resource",content:"Initializing the `Resource`"},{id:"owner-functions",content:"Owner functions"},{id:"purchasing-an-nft",content:"Purchasing an NFT"},{id:"views",content:"Views"},{id:"creating-a-salecollection",content:"Creating a `SaleCollection`"},{id:"marketplace-contract-summary",content:"Marketplace contract summary"},{id:"deployment",content:"Deployment"},{id:"using-the-marketplace",content:"Using the marketplace"},{id:"building-a-transaction-to-create-a-sale",content:"Building a transaction to create a sale"},{id:"checking-for-nfts-to-purchase",content:"Checking for NFTs to purchase"},{id:"purchasing-an-nft-1",content:"Purchasing an NFT"},{id:"verifying-the-nft-was-purchased-correctly",content:"Verifying the NFT was purchased correctly"},{id:"creating-a-marketplace-for-any-generic-nft",content:"Creating a marketplace for any generic NFT"},{id:"accepting-payment-in-flow",content:"Accepting payment in $FLOW"},{id:"conclusion",content:"Conclusion"},{id:"reference-solution",content:"Reference solution"}]};const d=[{depth:2,url:"#objectives",title:i.jsx(i.Fragment,{children:"Objectives"})},{depth:2,url:"#prerequisites",title:i.jsx(i.Fragment,{children:"Prerequisites"})},{depth:2,url:"#building-with-composability",title:i.jsx(i.Fragment,{children:"Building with composability"})},{depth:2,url:"#building-a-marketplace",title:i.jsx(i.Fragment,{children:"Building a marketplace"})},{depth:3,url:"#marketplace-design",title:i.jsx(i.Fragment,{children:"Marketplace design"})},{depth:3,url:"#validating-setup",title:i.jsx(i.Fragment,{children:"Validating setup"})},{depth:2,url:"#setting-up-an-nft-marketplace",title:i.jsx(i.Fragment,{children:"Setting up an NFT marketplace"})},{depth:3,url:"#adding-appropriate-events",title:i.jsx(i.Fragment,{children:"Adding appropriate events"})},{depth:3,url:"#creating-a-resource-to-put-items-up-for-sale",title:i.jsx(i.Fragment,{children:"Creating a resource to put items up for sale"})},{depth:3,url:"#definition-and-initialization",title:i.jsx(i.Fragment,{children:"Definition and initialization"})},{depth:3,url:"#resource-owned-capabilities",title:i.jsx(i.Fragment,{children:"Resource-owned capabilities"})},{depth:3,url:"#initializing-the-resource",title:i.jsxs(i.Fragment,{children:["Initializing the ",i.jsx("code",{children:"Resource"})]})},{depth:3,url:"#owner-functions",title:i.jsx(i.Fragment,{children:"Owner functions"})},{depth:3,url:"#purchasing-an-nft",title:i.jsx(i.Fragment,{children:"Purchasing an NFT"})},{depth:3,url:"#views",title:i.jsx(i.Fragment,{children:"Views"})},{depth:3,url:"#creating-a-salecollection",title:i.jsxs(i.Fragment,{children:["Creating a ",i.jsx("code",{children:"SaleCollection"})]})},{depth:3,url:"#marketplace-contract-summary",title:i.jsx(i.Fragment,{children:"Marketplace contract summary"})},{depth:3,url:"#deployment",title:i.jsx(i.Fragment,{children:"Deployment"})},{depth:2,url:"#using-the-marketplace",title:i.jsx(i.Fragment,{children:"Using the marketplace"})},{depth:3,url:"#building-a-transaction-to-create-a-sale",title:i.jsx(i.Fragment,{children:"Building a transaction to create a sale"})},{depth:3,url:"#checking-for-nfts-to-purchase",title:i.jsx(i.Fragment,{children:"Checking for NFTs to purchase"})},{depth:2,url:"#purchasing-an-nft-1",title:i.jsx(i.Fragment,{children:"Purchasing an NFT"})},{depth:2,url:"#verifying-the-nft-was-purchased-correctly",title:i.jsx(i.Fragment,{children:"Verifying the NFT was purchased correctly"})},{depth:2,url:"#creating-a-marketplace-for-any-generic-nft",title:i.jsx(i.Fragment,{children:"Creating a marketplace for any generic NFT"})},{depth:2,url:"#accepting-payment-in-flow",title:i.jsx(i.Fragment,{children:"Accepting payment in $FLOW"})},{depth:2,url:"#conclusion",title:i.jsx(i.Fragment,{children:"Conclusion"})},{depth:2,url:"#reference-solution",title:i.jsx(i.Fragment,{children:"Reference solution"})}];function t(s){const e={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components},{Callout:n}=e;return n||a("Callout"),i.jsxs(i.Fragment,{children:[i.jsx(e.p,{children:"In this tutorial, we're going to create a simplified marketplace that uses both the fungible and non-fungible token (NFT) contracts that we built in previous tutorials."}),`
`,i.jsxs(e.p,{children:[`:::warning
This tutorial uses the simplified fungible and non-fungible tokens you built in this series. It is not suitable for production. If you're ready to build or work with a production-quality marketplace, check out the `,i.jsx(e.a,{href:"https://github.com/onflow/nft-storefront",children:"NFT storefront repo"}),`. This contract is already deployed to testnet and mainnet and can be used by anyone for any generic NFT sale!
:::
Marketplaces are a popular application of blockchain technology and smart contracts. People with digital collectibles such as NFTs need to be able to buy and sell them — either with the network token or their fungible tokens.`]}),`
`,i.jsxs(e.p,{children:["More than just a convenience, marketplaces demonstrate one of the most compelling arguments for developing digital property on blockchains. In web 2, each developer needed to build their own bespoke systems for buying, selling, trading, and storing digital property. Onchain, if you build digital property that adheres to the appropriate standards, your digital collectibles, items, etc., will ",i.jsx(e.strong,{children:"automatically appear on several marketplace apps"})," built by experts in marketplaces who have made them the focus of their attention and business."]}),`
`,i.jsx(e.h2,{id:"objectives",children:"Objectives"}),`
`,i.jsx(e.p,{children:"After completing this tutorial, you'll be able to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Construct an NFT marketplace that allows users to buy and sell NFTs in exchange for $FLOW or your fungible token."}),`
`,i.jsxs(e.li,{children:["Utilize ",i.jsx(e.a,{href:"../language/interfaces.mdx",children:"interfaces"}),", ",i.jsx(e.a,{href:"../language/resources.mdx",children:"resources"}),", and ",i.jsx(e.a,{href:"../language/capabilities.md",children:"capabilities"})," to write composable code that takes advantage of resources built by others and allows others to build on your products."]}),`
`,i.jsxs(e.li,{children:["Construct and emit ",i.jsx(e.a,{href:"../language/events.md",children:"events"})," to share contract actions and states with other apps and services"]}),`
`]}),`
`,i.jsx(e.h2,{id:"prerequisites",children:"Prerequisites"}),`
`,i.jsxs(e.p,{children:["To complete this tutorial, you must have completed the ",i.jsx(e.a,{href:"./marketplace-setup",children:"Marketplace Setup Tutorial"}),". If you need to, you can start from the ",i.jsx(e.a,{href:"https://play.flow.com/463a9a08-deb0-455a-b2ed-4583ea6dcb64",children:"Setup Reference Solution"}),", but you'll need to follow the ",i.jsx(e.a,{href:"./marketplace-setup",children:"Marketplace Setup Tutorial"})," to deploy the contracts and call the setup transactions."]}),`
`,i.jsx(e.h2,{id:"building-with-composability",children:"Building with composability"}),`
`,i.jsxs(e.p,{children:["Now that ",i.jsx(e.strong,{children:"there are"})," contracts deployed for both fungible and non-fungible tokens, we can build a marketplace that uses both. We've picked the words ",i.jsx(e.em,{children:"there are"})," in the prior sentence on purpose. It doesn't matter that you created these contracts. If they were deployed onchain, instead of in the ephemeral simulation in the playground, ",i.jsx(e.strong,{children:"anyone"})," could complete this tutorial to build a marketplace that works with your NFTs and tokens."]}),`
`,i.jsxs(e.p,{children:["It's one of the most powerful and useful properties of building onchain and it's called ",i.jsx(e.em,{children:"composability"})," — the ability for developers to leverage shared resources, such as code, digital property, and user bases, and use them as building blocks for a new application."]}),`
`,i.jsx(e.p,{children:"This isn't an entirely new concept — we're used to reusing code, open source projects, etc. But the degree and scale are much higher. For example, if you're building an onchain version of a web forum, you don't need to do anything to allow your users to have a profile picture beyond allowing them to select which PFP they own from the list of PFP collections you choose to incorporate into your app."}),`
`,i.jsx(e.p,{children:"You're happy because you get a solution that works for your users for minimal effort, and the PFP collection creator is happy because their work becomes more valuable and desirable the more places it can be used an seen. Everybody wins!"}),`
`,i.jsx(e.p,{children:"Flow is designed to enable composability through interfaces, resources and capabilities:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"../language/interfaces.mdx",children:"Interfaces"})," allow projects to support any generic type as long as it supports a standard set of functionality specified by an interface."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"../language/resources.mdx",children:"Resources"})," can be passed around and owned by accounts, contracts or even other resources, unlocking different use cases depending on where the resource is stored."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"../language/capabilities.md",children:"Capabilities"})," allow exposing user-controlled sets of functionality and permissions through special objects that enforce strict security with Cadence's type system."]}),`
`]}),`
`,i.jsx(e.p,{children:"The combination of these features allow developers to do more with less, re-using known safe code and design patterns to create new, powerful, and unique interactions!"}),`
`,i.jsx(e.h2,{id:"building-a-marketplace",children:"Building a marketplace"}),`
`,i.jsx(e.p,{children:"To create a marketplace, we need to integrate the functionality of both fungible and non-fungible tokens into a single contract that gives users control over their money and assets. To accomplish this, we'll create a composable smart contract."}),`
`,i.jsx(e.h3,{id:"marketplace-design",children:"Marketplace design"}),`
`,i.jsx(e.p,{children:"A traditional way to implement a marketplace is to have a central smart contract that users deposit their NFTs and their price into, and anyone can come by and buy the token for that price."}),`
`,i.jsx(e.p,{children:"This approach is reasonable, but it centralizes the process and takes away options from the owners. A better option that's possible with Cadence is to allow users to maintain ownership of the NFTs that they are trying to sell while they are trying to sell them. Instead of taking a centralized approach, each user can list a sale from within their own account."}),`
`,i.jsxs(e.p,{children:["They'll do this by using a marketplace contract you'll build to store an instance of a ",i.jsx(e.code,{children:"@SaleCollection"})," resource in their account storage."]}),`
`,i.jsx(e.p,{children:"Then, the seller, independently or through an app, can either provide a link to their sale to an application that can list it centrally on a website, or even to a central sale aggregator smart contract if they want the entire transaction to stay onchain."}),`
`,i.jsx(e.h3,{id:"validating-setup",children:"Validating setup"}),`
`,i.jsxs(e.p,{children:["If you haven't just completed the ",i.jsx(e.a,{href:"./marketplace-setup",children:"Marketplace Setup"})," tutorial, run the ",i.jsx(e.code,{children:"Validate Setup"})," script to double-check that your contracts and accounts are in the correct state to begin building the marketplace."]}),`
`,i.jsx(e.p,{children:`:::note
Remember, we only need to do this again to ensure that the ephemeral state of the playground is set up correctly. Otherwise, you'd already have contracts and users with accounts that are configured ready to go.
:::
The following output appears if your accounts are set up correctly:`}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"s.8250c68d2bb3c5398d7f9eac7114a4ac1b7df1d0984d92058b9373f696a1d6a9.OwnerInfo(acct8Balance:"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 40.00000000,"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" acct9Balance:"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 40.00000000,"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" acct8IDs:"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [1], acct9IDs: [])"})]})})})}),`
`,i.jsx(e.h2,{id:"setting-up-an-nft-marketplace",children:"Setting up an NFT marketplace"}),`
`,i.jsxs(e.p,{children:["Add a new contract called ",i.jsx(e.code,{children:"BasicMarketplace"}),". It needs to import both of the existing contracts:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.p,{children:`:::note
Remember, you don't need to own a contract to be able to import it or use any of its public functionality!
:::`}),`
`,i.jsx(e.h3,{id:"adding-appropriate-events",children:"Adding appropriate events"}),`
`,i.jsxs(e.p,{children:["As in Solidity, Cadence smart contracts can emit developer-defined ",i.jsx(e.a,{href:"../language/events.md",children:"events"})," during execution, which can be used to log data that can be observed offchain. This can be used by frontends, and other apps or platforms, including block explorers and data aggregators, which can monitor the state of the contract and related NFTs."]}),`
`,i.jsxs(e.p,{children:["Events in Cadence are declared in a similar fashion as functions, but they start with an access control declaration. The ",i.jsx(e.code,{children:"event"})," keyword follows, then the name and parameters in parentheses. You can use most of the same types as functions, but you cannot use resources. Resources are moved when used as an argument, and using them and events don't have a method to put them somewhere else or destroy them."]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ForSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", owner: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" PriceChanged"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", newPrice: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", owner: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" NFTPurchased"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", seller: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?, buyer: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SaleCanceled"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", seller: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?)"})]})]})})}),`
`,i.jsx(e.p,{children:"We can anticipate that we'll want to emit events when users take standard actions with the contract, such as when NFTs are listed, purchased, the price is changed, or the sale is cancelled."}),`
`,i.jsxs(e.p,{children:["We're marking the addresses as optional, because there's some circumstances where an NFT might not have an owner, so those addresses would be ",i.jsx(e.code,{children:"nil"}),"."]}),`
`,i.jsx(e.h3,{id:"creating-a-resource-to-put-items-up-for-sale",children:"Creating a resource to put items up for sale"}),`
`,i.jsxs(e.p,{children:["Next, we need to configure a ",i.jsx(e.a,{href:"../language/resources.mdx",children:"resource"})," that users can use to put their NFTs up for sale, and other users can use to then purchase those NFTs for fungible tokens. In it, you'll need to add:"]}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:["A ",i.jsx(e.a,{href:"../language/capabilities.md",children:"capability"})," to access the owner's collection."]}),`
`,i.jsx(e.li,{children:"A place to store the prices of NFTs for sale."}),`
`,i.jsxs(e.li,{children:["A ",i.jsx(e.a,{href:"../language/capabilities.md",children:"capability"})," to deposit tokens into the sellers vault when an NFT is purchased."]}),`
`]}),`
`,i.jsx(e.p,{children:"You'll also need functions to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Allow the owner to list an NFT for sale."}),`
`,i.jsx(e.li,{children:"Allow the owner to cancel a sale."}),`
`,i.jsx(e.li,{children:"Allow the owner to change the price."}),`
`,i.jsx(e.li,{children:"Allow a third party to buy the NFT, and deposit the purchase price in the seller's vault."}),`
`]}),`
`,i.jsx(e.h3,{id:"definition-and-initialization",children:"Definition and initialization"}),`
`,i.jsx(e.p,{children:"To define and initialize:"}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsx(e.p,{children:"Create the resource definition:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(n,{type:"info",title:"Reminder",children:i.jsxs(e.p,{children:["In this case, ",i.jsx(e.code,{children:"access(all)"})," is giving public scope to the ",i.jsx(e.strong,{children:"definition"})," of the resource type, ",i.jsx(e.strong,{children:"not"})," any given instance of the resource or anything in one of those instances. It's good to make these public so that others can build contracts and apps that interact with yours."]})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsx(e.p,{children:"In it, add a variable to store a capability for the owner's collection with the ability to withdraw from the collection:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownerCollection: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,i.jsx(n,{type:"info",title:"Reminder",children:i.jsxs(e.p,{children:["You'll get errors until after you write the ",i.jsx(e.code,{children:"init"})," function and assign values to these properties."]})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsx(e.p,{children:"Add a dictionary to relate NFT ids to the sale price for that NFT:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" prices: {"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]})})})}),`
`,i.jsx(n,{type:"info",title:"reminder",children:i.jsxs(e.p,{children:[i.jsx(e.code,{children:"access(self)"})," limits access to the resource itself, from within the resource."]})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsx(e.p,{children:"Add a variable to store a capability for a sellers fungible token vault's receiver:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownerVault: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`]}),`
`]}),`
`,i.jsx(e.h3,{id:"resource-owned-capabilities",children:"Resource-owned capabilities"}),`
`,i.jsxs(e.p,{children:["You first learned about basic function and use of ",i.jsx(e.a,{href:"../language/capabilities.md",children:"capabilities"})," in the ",i.jsx(e.a,{href:"./capabilities",children:"capabilities tutorial"}),". They're links to private objects in account storage that specify and expose a subset of the resource they are linked to."]}),`
`,i.jsx(e.p,{children:"With the marketplace contract, we are utilizing a new feature of capabilities — they can be stored anywhere! Lots of functionality is contained within resources, and developers will sometimes want to be able to access some of the functionality of resources from within different resources or contracts."}),`
`,i.jsx(e.p,{children:"We stored two different capabilities in the marketplace sale collection:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownerCollection: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownerVault: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})]})})}),`
`,i.jsx(e.p,{children:"If an object like a contract or resource owns a capability, they can borrow a reference to that capability at any time to access that functionality without having to get it from the owner's account every time."}),`
`,i.jsx(e.p,{children:"This is especially important if the owner wants to expose some functionality that is only intended for one person, meaning that the link for the capability is not stored in a public path."}),`
`,i.jsxs(e.p,{children:["We do that in this example, because the sale collection stores a capability that can access the ",i.jsx(e.code,{children:"withdraw"})," functionality of the ",i.jsx(e.code,{children:"IntermediateNFT.Collection"})," with the ",i.jsx(e.code,{children:"IntermediateNFT.Withdraw"})," entitlement. It needs this because it withdraws the specified NFT in the ",i.jsx(e.code,{children:"purchase()"})," method to send to the buyer."]}),`
`,i.jsxs(e.p,{children:["It is important to remember that control of a capability does not equal ownership of the underlying resource. You can use the capability to access that resource's functionality, but you can't use it to fake ownership. You need the actual resource (identified by the prefixed ",i.jsx(e.code,{children:"@"})," symbol) to prove ownership."]}),`
`,i.jsxs(e.p,{children:["Additionally, these capabilities can be stored anywhere, but if a user decides that they no longer want the capability to be used, they can revoke it by getting the controller for the capability from their account with the ",i.jsx(e.code,{children:"getControllers"})," method and delete the capability with ",i.jsx(e.code,{children:"delete"}),"."]}),`
`,i.jsx(e.p,{children:"Here is an example that deletes all of the controllers for a specified storage path:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" controllers = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.storage."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getControllers"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(forPath: storagePath)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" controller "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" controllers {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    controller."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"delete"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.p,{children:"After this, any capabilities that use that storage path are rendered invalid."}),`
`,i.jsxs(e.h3,{id:"initializing-the-resource",children:["Initializing the ",i.jsx(e.code,{children:"Resource"})]}),`
`,i.jsx(e.p,{children:"Initialize the resource with arguments for the capabilities needed from the account calling the create transaction."}),`
`,i.jsxs(e.p,{children:["In ",i.jsx(e.code,{children:"init"}),", we can take advantage of ",i.jsx(e.a,{href:"../language/functions.mdx#function-preconditions-and-postconditions",children:"preconditions"})," to make sure that the user has the appropriate capabilities needed to support this functionality by using ",i.jsx(e.a,{href:"../language/accounts/capabilities.mdx#checking-the-existence-of-public-capabilities",children:i.jsx(e.code,{children:".check()"})})," for the relevant capabilities."]}),`
`,i.jsxs(e.p,{children:["You could use the pattern we've used before with errors, but since these won't be useful outside of ",i.jsx(e.code,{children:"init"}),", we can also just include them inside it:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownerCollection: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" prices: {"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownerVault: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (ownerCollection: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ownerVault: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        pre"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"            // Check that the owner's collection capability is correct"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ownerCollection."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"check"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"():"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'                "ExampleMarketplace.SaleCollection.init: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"Owner's NFT Collection Capability is invalid! "`}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Make sure the owner has set up an `IntermediateNFT.Collection` "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"in their account and provided a valid capability"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"            // Check that the fungible token vault capability is correct"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ownerVault."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"check"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"():"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'                "ExampleMarketplace.SaleCollection.init: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"Owner's Receiver Capability is invalid! "`}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Make sure the owner has set up an `ExampleToken.Vault` "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"in their account and provided a valid capability"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownerCollection = ownerCollection"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownerVault = ownerVault"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices = {}"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h3,{id:"owner-functions",children:"Owner functions"}),`
`,i.jsxs(e.p,{children:["Next, we can add the functions that allow the owner to manage their sales. For this, you'll need to first create an ",i.jsx(e.a,{href:"../language/access-control.md#entitlements",children:"entitlement"})," to lock the functionality away so that only the owner can use it. Remember, entitlements are declared at the contract level:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing events"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ForSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", owner: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" PriceChanged"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", newPrice: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", owner: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" NFTPurchased"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", seller: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?, buyer: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SaleCanceled"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", seller: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// New entitlement"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Owner"})]})]})})}),`
`,i.jsx(e.p,{children:`:::note
Strictly speaking, we're not actually going to use this entitlement. We're using it to "lock" the functionality, but we're not giving the entitlement to any other accounts. The owner doesn't need to use this "key" to unlock the functions limited with it — they automatically have access.
:::`}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Add a function that the owner of the resource can use to list one of their tokens for sale, and ",i.jsx(e.code,{children:"emit"})," an ",i.jsx(e.code,{children:"event"})," that they've done so."]}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Use a ",i.jsx(e.code,{children:"pre"}),"condition to return an error if they don't own the token they're trying to list. As before, this is probably the only place where this error will be useful, so it can be placed directly in the function:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Owner"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" listForSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    pre"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownerCollection."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"idExists"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: tokenID):"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "ExampleMarketplace.SaleCollection.listForSale: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Cannot list token ID "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" . This NFT ID is not owned by the seller."'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Make sure an ID exists in the sellers NFT Collection"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" before trying to list it for sale"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"   }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   // store the price in the price array"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"   self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] = price"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"   emit"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ForSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: tokenID, price: price, owner: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".owner?.address)"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Add a function to allow changing the price. It should also ",i.jsx(e.code,{children:"emit"})," the appropriate ",i.jsx(e.code,{children:"event"}),":"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Owner"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" changePrice"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", newPrice: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] = newPrice"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    emit"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" PriceChanged"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: tokenID, newPrice: newPrice, owner: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".owner?.address)"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsx(e.p,{children:"Add a function that allows the owner to cancel their sale. You don't need to do anything with the token itself, as it hasn't left the owners account:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Owner"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" cancelSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // remove the price"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices."}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"remove"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key: tokenID)"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"nil"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Nothing needs to be done with the actual token because it is already in the owner's collection"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,i.jsx(e.p,{children:`:::note
Solidity devs, take note here! In Cadence, you can build an NFT marketplace without needing to transfer NFTs to a third party or needing to give a third party permission to take the NFT.
:::`}),`
`,i.jsx(e.h3,{id:"purchasing-an-nft",children:"Purchasing an NFT"}),`
`,i.jsx(e.p,{children:"Now, you need to add a function that anyone can call and use to purchase the NFT. It needs to accept arguments for:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"The token to be purchased."}),`
`,i.jsx(e.li,{children:"The recipient's collection that is going to receive the NFT."}),`
`,i.jsx(e.li,{children:"A vault containing the purchase price."}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" purchase"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        tokenID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        recipient: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", buyTokens: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ) {"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(e.p,{children:[`:::warning
You are `,i.jsx(e.strong,{children:"not"}),` providing the purchaser's vault here — that's an anti-pattern. Instead, create a temporary vault and use that to transfer the tokens.
:::
You'll also want to use `,i.jsx(e.code,{children:"pre"}),"conditions to check and provide errors as appropriate for:"]}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"The NFT with the provided ID is for sale."}),`
`,i.jsx(e.li,{children:"The buyer has included the correct amount of tokens in the provided vault."}),`
`,i.jsx(e.li,{children:"The buyer has the collection capability needed to receive the NFT."}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"pre"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'        "ExampleMarketplace.SaleCollection.purchase: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Cannot purchase NFT with ID "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" There is not an NFT with this ID available for sale! "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Make sure the ID to purchase is correct."'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    buyTokens.balance "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"??"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'        "ExampleMarketplace.SaleCollection.purchase: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" Cannot purchase NFT with ID "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" The amount provided to purchase ("'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(buyTokens.balance."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'") is less than the price of the NFT ("'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID]"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"). Make sure the ID to purchase is correct and "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"the correct amount of tokens have been used to purchase."'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    recipient.borrow "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'        "ExampleMarketplace.SaleCollection.purchase: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" Cannot purchase NFT with ID "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`". The buyer's NFT Collection Capability is invalid."`}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.p,{children:"Assuming these checks all pass, your function then needs to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Get a reference of the price of the token then clear it."}),`
`,i.jsx(e.li,{children:"Get a reference to the owner's vault and deposit the tokens from the transaction vault."}),`
`,i.jsx(e.li,{children:"Get a reference to the NFT receiver for the buyer."}),`
`,i.jsx(e.li,{children:"Deposit the NFT into the buyer's collection."}),`
`,i.jsx(e.li,{children:"Emit the appropriate event."}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// get the value out of the optional"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" price = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID]"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"nil"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" vaultRef = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownerVault."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow reference to owner token vault"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// deposit the purchasing tokens into the owners vault"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"vaultRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"buyTokens)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// borrow a reference to the object that the receiver capability links to"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// We can force-cast the result here because it has already been checked in the pre-conditions"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverReference = recipient."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// deposit the NFT into the buyers collection"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"receiverReference."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(token: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownerCollection."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(withdrawID: tokenID))"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"emit"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" NFTPurchased"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: tokenID, price: price, seller: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".owner?.address, buyer: receiverReference.owner?.address)"})]})]})})}),`
`,i.jsx(e.p,{children:"The full function should be similar to:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// purchase lets a user send tokens to purchase an NFT that is for sale"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" purchase"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                            recipient: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", buyTokens: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    pre"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "ExampleMarketplace.SaleCollection.purchase: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Cannot purchase NFT with ID "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" There is not an NFT with this ID available for sale! "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Make sure the ID to purchase is correct."'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        buyTokens.balance "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"??"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "ExampleMarketplace.SaleCollection.purchase: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" Cannot purchase NFT with ID "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" The amount provided to purchase ("'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(buyTokens.balance."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'") is less than the price of the NFT ("'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID]"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"). Make sure the ID to purchase is correct and "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"the correct amount of tokens have been used to purchase."'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        recipient.borrow "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "ExampleMarketplace.SaleCollection.purchase: "'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" Cannot purchase NFT with ID "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`". The buyer's NFT Collection Capability is invalid."`}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" price = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID]"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID] = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"nil"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" vaultRef = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownerVault."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow reference to owner token vault"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    vaultRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"buyTokens)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // borrow a reference to the object that the receiver capability links to"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // We can force-cast the result here because it has already been checked in the pre-conditions"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverReference = recipient."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    receiverReference."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(token: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownerCollection."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(withdrawID: tokenID))"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    emit"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" NFTPurchased"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: tokenID, price: price, seller: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".owner?.address, buyer: receiverReference.owner?.address)"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h3,{id:"views",children:"Views"}),`
`,i.jsx(e.p,{children:"Finally, add a couple of views so that others can read the prices for NFTs and which ones are for sale:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" idPrice"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"? {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices[tokenID]"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getIDs"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".prices.keys"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(e.h3,{id:"creating-a-salecollection",children:["Creating a ",i.jsx(e.code,{children:"SaleCollection"})]}),`
`,i.jsxs(e.p,{children:["Last, but not least, you need to add a contract-level function that allows users to create their own ",i.jsx(e.code,{children:"SaleCollection"})," resource. It needs to accept the same arguments as the ",i.jsx(e.code,{children:"init"})," for the resource, pass them into the ",i.jsx(e.code,{children:"create"})," call, and return the newly-created resource:"]}),`
`,i.jsxs(e.p,{children:[`:::warning
Make sure you don't accidentally put this function inside the `,i.jsx(e.code,{children:"SaleCollection"}),` resource!
:::`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createSaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ownerCollection: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ownerVault: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaleCollection"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ownerCollection: ownerCollection, ownerVault: ownerVault)"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h3,{id:"marketplace-contract-summary",children:"Marketplace contract summary"}),`
`,i.jsxs(e.p,{children:["That's it! You've completed the contract needed to allow anyone who owns the NFTs and fungible tokens you've created to sell one, accepting payment in the other! This marketplace contract has resources that function similarly to the NFT ",i.jsx(e.code,{children:"Collection"})," you built in ",i.jsx(e.a,{href:"./non-fungible-tokens-1",children:"Non-Fungible Tokens"}),", with a few differences and additions."]}),`
`,i.jsxs(e.p,{children:["This marketplace contract has methods to add and remove NFTs, but instead of storing the NFT resource object in the sale collection, the user provides a capability to their main collection that allows the listed NFT to be withdrawn and transferred when it is purchased. When a user wants to put their NFT up for sale, they do so by providing the ID and the price to the ",i.jsx(e.code,{children:"listForSale()"})," function."]}),`
`,i.jsxs(e.p,{children:["Then, another user can call the ",i.jsx(e.code,{children:"purchase()"})," function, sending an ",i.jsx(e.code,{children:"ExampleToken.Vault"})," that contains the currency they are using to make the purchase. The buyer also includes a capability to their NFT ",i.jsx(e.code,{children:"ExampleNFT.Collection"})," so that the purchased token can be immediately deposited into their collection when the purchase is made."]}),`
`,i.jsxs(e.p,{children:["The owner of the sale saves a capability to their Fungible Token ",i.jsx(e.code,{children:"Receiver"})," within the sale. This allows the sale resource to be able to immediately deposit the currency that was used to buy the NFT into the owners ",i.jsx(e.code,{children:"Vault"})," when a purchase is made."]}),`
`,i.jsxs(e.p,{children:["Finally, a marketplace contract includes appropriate ",i.jsx(e.code,{children:"event"}),"s that are emitted when important actions happen. External apps can monitor these events to know the state of the smart contract."]}),`
`,i.jsx(e.h3,{id:"deployment",children:"Deployment"}),`
`,i.jsxs(e.p,{children:["Deploy the marketplace contract with account ",i.jsx(e.code,{children:"0x0a"}),"."]}),`
`,i.jsx(e.h2,{id:"using-the-marketplace",children:"Using the marketplace"}),`
`,i.jsxs(e.p,{children:["Now that you've set up your user accounts, and deployed the contracts for the NFT, fungible token, and marketplace, it's time to write a few ",i.jsx(e.code,{children:"transaction"}),"s to tie everything together."]}),`
`,i.jsx(e.p,{children:`:::note
One of the most useful features of Cadence is that transactions are code written in Cadence. You can use this to add functionality after deploying your contracts — you're not limited to only the functions you thought of when you wrote the contract.
:::`}),`
`,i.jsx(e.h3,{id:"building-a-transaction-to-create-a-sale",children:"Building a transaction to create a sale"}),`
`,i.jsxs(e.p,{children:["Now it's time to write a ",i.jsx(e.code,{children:"transaction"})," to ",i.jsx(e.code,{children:"create"})," a ",i.jsx(e.code,{children:"SaleCollection"})," and list account ",i.jsx(e.code,{children:"0x08"}),"'s token for sale."]}),`
`,i.jsxs(e.p,{children:[`:::tip
Depending on your app design, you might want to break these steps up into separate transactions to set up the the `,i.jsx(e.code,{children:"SaleCollection"}),` and add an NFT to it.
:::`]}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Import the three contracts and add a ",i.jsx(e.code,{children:"prepare"})," statement with auth to ",i.jsx(e.code,{children:"SaveValue"}),", ",i.jsx(e.code,{children:"StorageCapabilities"}),", and ",i.jsx(e.code,{children:"PublishCapability"}),":"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x0a"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"StorageCapabilities"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublishCapability"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Complete the following in ",i.jsx(e.code,{children:"prepare"}),":"]}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Borrow a reference to the user's vault."}),`
`,i.jsx(e.li,{children:"Create an entitled capability to the user's NFT collection."}),`
`,i.jsxs(e.li,{children:["Use these to to create a ",i.jsx(e.code,{children:"SaleCollection"})," and store it in a constant."]}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiver = acct.capabilities.get"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"VaultPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" collectionCapability = acct.capabilities.storage.issue"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"                            <auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                            ("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionStoragePath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" sale "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createSaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ownerCollection: collectionCapability, ownerVault: receiver)"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Use your ",i.jsx(e.code,{children:"sale"})," instance of the collection to create a sale. Afterwards, ",i.jsx(e.code,{children:"move (<-)"})," it into account storage:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sale."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"listForSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10.0"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"acct.storage."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"sale, to: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFTSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,i.jsxs(n,{type:"info",children:[i.jsxs(e.p,{children:["You might be tempted to change the order here to handle creating the ",i.jsx(e.code,{children:"SaleCollection"})," and storing it first, then using it to create a sale."]}),i.jsxs(e.p,{children:["This won't work because resources can only be moved — they can't be copied. Once you ",i.jsx(e.code,{children:"move (<-)"})," ",i.jsx(e.code,{children:"sale"})," to storage, ",i.jsx(e.code,{children:"sale"})," is no longer usable."]})]}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsx(e.p,{children:"Create and publish a public capability so that others can use the public functions of this resource to find and purchase NFTs:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" publicCap = acct.capabilities.storage.issue"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFTSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"acct.capabilities."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(publicCap, at: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFTSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Call the transaction with account ",i.jsx(e.code,{children:"0x08"}),"."]}),`
`]}),`
`]}),`
`,i.jsx(e.h3,{id:"checking-for-nfts-to-purchase",children:"Checking for NFTs to purchase"}),`
`,i.jsx(e.p,{children:"Let's create a script to ensure that the sale was created correctly:"}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Add a new one called ",i.jsx(e.code,{children:"GetSaleIDsAndPrices"}),"."]}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Import the contracts and stub out a script that accepts an ",i.jsx(e.code,{children:"Address"})," as an argument and returns a ",i.jsx(e.code,{children:"UInt64"})," array:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x0a"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsx(e.p,{children:"In the script:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:["Use the ",i.jsx(e.code,{children:"address"})," to get a public account object for that address."]}),`
`,i.jsxs(e.li,{children:["Attempt to borrow a reference to the public capability for the ",i.jsx(e.code,{children:"SaleCollection"})," in that account:",`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Panic and return an error if it's not found."}),`
`,i.jsxs(e.li,{children:["Call ",i.jsx(e.code,{children:"getIDs"})," if it is, and return the list of NFTs for sale."]}),`
`]}),`
`]}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x0a"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" saleRef = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFTSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow a reference to the SaleCollection capability for the address provided"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" saleRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getIDs"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsx(e.p,{children:"Run the script. You should be part of the way there:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[1]"})})})})}),`
`,i.jsx(e.p,{children:"The script returns an array containing the one NFT for sale, but what about the prices? We added a function to return the price of a given NFT, but not a list or array."}),`
`,i.jsx(e.p,{children:"We could update the contract since we own it (another power of Cadence), but even if we didn't, we could always add functionality via a script."}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Update your script to create a ",i.jsx(e.code,{children:"struct"})," to return the data in, then fetch the list of IDs, loop through them to get the prices, and return an array with the prices:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x0a"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Pair"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" value: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", value: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".id = id"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".value = value"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): ["}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Pair"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" saleRef = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFTSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow a reference to the SaleCollection capability for the address provided"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ids = saleRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getIDs"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pricePairs: ["}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Pair"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] = []"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ids {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pair = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Pair"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: id, value: saleRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"idPrice"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID: id) "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"??"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        pricePairs."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"append"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(pair)"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pricePairs"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,i.jsx(e.h2,{id:"purchasing-an-nft-1",children:"Purchasing an NFT"}),`
`,i.jsx(e.p,{children:"Finally, you can add a transaction that a buyer can use to purchase the seller's NFT with their fungible tokens."}),`
`,i.jsxs(e.ol,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Create a ",i.jsx(e.code,{children:"transaction"})," called ",i.jsx(e.code,{children:"PurchaseNFT"}),", import the contract, and stub it out:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x0a"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(sellerAddress: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", tokenID: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" collectionCapability: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" temporaryVault: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    execute"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // TODO"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Complete the following in ",i.jsx(e.code,{children:"prepare"}),":"]}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"get"})," the ",i.jsx(e.code,{children:"collectionCapability"})," for the caller's NFT collection."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"borrow"})," an authorized reference to the buyers token vault."]}),`
`,i.jsxs(e.li,{children:["Withdraw the purchase price from the buyers vault and ",i.jsx(e.code,{children:"move (<-)"})," it into the temporary vault."]}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".collectionCapability = acct.capabilities.get"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" vaultRef = acct"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .storage.borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CadenceFungibleTokenTutorialVault"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow a reference to "'})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                 ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ExampleToken.Vault"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                 ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'". Make sure the user has set up an account "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                 ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"with an ExampleToken Vault and valid capability."'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"))"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".temporaryVault "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" vaultRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"withdraw"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount: price)"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Complete the following in ",i.jsx(e.code,{children:"execute"}),":"]}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:["Get a reference to the public account for the ",i.jsx(e.code,{children:"sellerAddress"}),"."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"borrow"})," a reference to the seller's ",i.jsx(e.code,{children:"SaleCollection"}),"."]}),`
`,i.jsxs(e.li,{children:["Call ",i.jsx(e.code,{children:"purchase"})," with the ",i.jsx(e.code,{children:"tokenID"}),", buyers collection capability, and the temporary vault."]}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" seller = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(sellerAddress)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" saleRef = seller.capabilities.get"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BasicMarketplace"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaleCollection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFTSale"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                    ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow a reference to "'})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                 ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"the seller's ExampleMarketplace.SaleCollection"`}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                 ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'". Make sure the seller has set up an account "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                 ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"with an ExampleMarketplace SaleCollection and valid capability."'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"))"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"saleRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"purchase"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tokenID: tokenID, recipient: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".collectionCapability, buyTokens: "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-self"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".temporaryVault)"})]})]})})}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:["Call the transaction with account ",i.jsx(e.code,{children:"0x09"})," to purchase the token with id ",i.jsx(e.code,{children:"1"})," from ",i.jsx(e.code,{children:"0x08"})," for ",i.jsx(e.code,{children:"10.0"})," tokens."]}),`
`]}),`
`]}),`
`,i.jsx(e.h2,{id:"verifying-the-nft-was-purchased-correctly",children:"Verifying the NFT was purchased correctly"}),`
`,i.jsx(e.p,{children:"You've already written the scripts you need to check for NFT ownership and token balances. Copy them over from your earlier projects, or use the ones below:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" accountReceiverRef = "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.get"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Balance"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"VaultPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"                            ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ExampleToken"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"vaultNotConfiguredError"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: address))"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Balance for "'})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'": "'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(accountReceiverRef.balance."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        )"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x07"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" nftOwner = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address)"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = nftOwner.capabilities.get"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverRef = nftOwner.capabilities"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        .borrow"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"CollectionPublicPath"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        ??"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"IntermediateNFT"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"collectionNotConfiguredError"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: address))"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    log"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Account "'})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toString"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      ."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"concat"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" NFTs"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" receiverRef."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getIDs"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h2,{id:"creating-a-marketplace-for-any-generic-nft",children:"Creating a marketplace for any generic NFT"}),`
`,i.jsxs(e.p,{children:["The previous examples show how a simple marketplace can be created for a specific class of NFTs. However, users will want to have a marketplace where they can buy and sell ",i.jsx(e.strong,{children:"any"})," NFT they want, regardless of its type."]}),`
`,i.jsxs(e.p,{children:["To learn more about a completely decentralized example of a generic marketplace, check out the ",i.jsx(e.a,{href:"https://github.com/onflow/nft-storefront",children:"NFT storefront repo"}),". This contract is already deployed to testnet and mainnet and can be used by anyone for any generic NFT sale!"]}),`
`,i.jsx(e.h2,{id:"accepting-payment-in-flow",children:"Accepting payment in $FLOW"}),`
`,i.jsxs(e.p,{children:["What about accepting payment in the network token, ",i.jsx(e.a,{href:"https://developers.flow.com/build/core-contracts/flow-token",children:"$FLOW"}),"? We can't quite update this simplified marketplace to accept it, but it's actually quite simple to do so because the network token follows the ",i.jsx(e.a,{href:"https://github.com/onflow/flow-ft",children:"Flow Fungible Token standard"}),"."]}),`
`,i.jsx(e.p,{children:"In other words, if you configure your marketplace to accept any token that follows the full standard, it will also be able to use the Flow token!"}),`
`,i.jsx(e.h2,{id:"conclusion",children:"Conclusion"}),`
`,i.jsx(e.p,{children:"In this tutorial, you constructed a simplified NFT marketplace on Flow using the composability of Cadence resources, interfaces, and capabilities. You learned how to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Build a marketplace contract that allows users to list, buy, and sell NFTs in exchange for fungible tokens."}),`
`,i.jsx(e.li,{children:"Leverage capabilities and entitlements to securely manage access and transfers."}),`
`,i.jsx(e.li,{children:"Emit and observe events to track marketplace activity."}),`
`,i.jsx(e.li,{children:"Write and execute transactions and scripts to interact with the marketplace and verify asset ownership and balances."}),`
`]}),`
`,i.jsx(e.p,{children:"By completing this tutorial, you are now able to:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Construct composable smart contracts that integrate multiple token standards."}),`
`,i.jsx(e.li,{children:"Implement secure and flexible resource management using Cadence's type system."}),`
`,i.jsx(e.li,{children:"Develop and test end-to-end flows for NFT sales and purchases on Flow."}),`
`]}),`
`,i.jsxs(e.p,{children:["If you're ready to take your skills further, explore the ",i.jsx(e.a,{href:"https://github.com/onflow/nft-storefront",children:"NFT storefront repo"})," for a production-ready, generic NFT marketplace, or try extending your marketplace to support additional features and token types!"]}),`
`,i.jsx(e.h2,{id:"reference-solution",children:"Reference solution"}),`
`,i.jsxs(e.p,{children:[`:::warning
You are `,i.jsx(e.strong,{children:"not"})," saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!"]}),`
`,i.jsx(e.p,{children:`Reference solutions are functional, but may not be optimal.
:::`}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:i.jsx(e.a,{href:"https://play.flow.com/d8906744-aa9b-4323-9f72-ccf78ab8e4b2",children:"Reference Solution"})}),`
`]}),`
`]})}function o(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(t,{...s})}):t(s)}function a(s,e){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}export{h as _markdown,o as default,r as frontmatter,c as structuredData,d as toc};
