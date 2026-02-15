import{j as e}from"./main-BXy83AsK.js";const n="/assets/capabilities-entitlements-BgizJ2Ui.jpg";let c=`



This tutorial builds on your understanding of [accounts] and [resources]. You'll learn how to interact with resources using [capabilities] and [entitlements].

:::tip\\[Reminder]
In Cadence, resources are a composite type like a \`struct\` or a class in other languages, but with some **special rules**:

* Each instance of a resource can only exist in exactly one location and cannot be copied.
* Resources must be explicitly moved from one location to another when accessed.
* Resources also cannot go out of scope at the end of function execution — they must be explicitly stored somewhere or destroyed.
  :::

Objectives [#objectives]

After completing this tutorial, you'll be able to:

* Interact with [resources] created using transactions.
* Use entitlements to secure the privileged functionality in your resources that would be vulnerable otherwise.
* Write transactions to create [capabilities] that extend resource access scope from the owner to anyone (\`public\`).
* Write and execute a script that interacts with the resource through the capability.

Use cases for capabilities and entitlements [#use-cases-for-capabilities-and-entitlements]

Let's look at why you would want to use capabilities and entitlements to expand and secure access to resources in a real-world context. A real user's account and stored objects will contain functions and fields that need varying levels of access scope and privacy.

If you're working on an app that allows users to exchange tokens, you'll want different features available in different use cases. While you definitely want anybody to be able to call the function to give you tokens (\`access(all)\`), you would of course want to ensure that any features or functions that access privileged functionality like withdrawing tokens from an account are only able to be called by the owner, (\`access(Owner)\`). The \`Owner\` specification in this case is an \\[entitlement], and it is vitally important that you use entitlements correctly in order to secure the digital property created and managed in your contracts and transactions.

:::note
In Cadence, users have complete control over their storage, and their storage is tied directly to their accounts. This feature allows amazing benefits including peer-to-peer transfers of property and it being impossible to accidentally burn an asset by sending it to an unused address. The one mixed blessing is that you can't airdrop tokens or NFTs without the recipient signing a transaction. Less spam, but you'll need to use a claim mechanism if the recipient doesn't already have a vault for your asset.
:::
Capabilities and entitlements are what allows for this detailed control of access to owned assets. They allow a user to indicate which of the functionality of their account and owned objects should be accessible to themselves, their trusted friends, and the public.

<img alt="Capabilities and Entitlements" src={__img0} placeholder="blur" />

For example, a user might want to allow a friend of theirs to use some of their money to spend. In this case, they could create an object that gives the friend access to only this part of their account, instead of having to hand over full control of their account.

:::note
In the last tutorial, you wrote transactions to access an account with \`&Account\` object containing specifications about which functionality the transaction was allowed to access,  such as \`auth(BorrowValue, SaveValue)\`. When you wrote that transaction, you were using entitlements.  They can also apply to accounts, resources, and structs!
:::
Another example is when a user authenticates a trading app for the first time, the trading app could ask the user for an object that allows the app to access the trading functionality of a user's account so that the app doesn't need to ask the user for a signature every time it wants to do a trade. The user can choose to empower the app, and that app alone, for this functionality and this functionality alone.

Access resources with capabilities [#access-resources-with-capabilities]

As a smart contract developer, you need explicit permission from the owner of an account to access its [storage]. Capabilities allow an account owner to grant access to objects stored in their private account storage. Think of them as a pointer to the object that allows you to access all the \`access(all)\` fields and functions in that object.

First, you'll write a transaction in which you'll issue a new capability using the \`issue\` function. This capability creates a link to the user's \`HelloAsset\` resource object. It then publishes that link to the account's public space, so others can access it.

Next, you'll write a script that accesses that public capability and calls its \`hello()\` function.

Creating capabilities and references to stored resources [#creating-capabilities-and-references-to-stored-resources]

Continue working with your code from the previous tutorial. Alternately, open a fresh copy here: [https://play.flow.com/8b28da4e-0235-499f-8653-1f55e1b3b725].

If you started with the playground linked above, be sure to deploy the \`HelloResource\` contract with account \`0x06\` and call the \`Create Hello\` transaction, also with \`0x06\`.

Preparing the account capabilities [#preparing-the-account-capabilities]

To prepare:

1. Create a new transaction called \`Create Link\`.

2. Import \`HelloResource\` and stub out a \`transaction\` with a \`prepare\` phase.

   * Cadence allows for static analysis of imported contracts. You'll get errors in the transactions and scripts that import \`HelloResource\` from \`0x06\` if you haven't deployed that contract.

   \`\`\`cadence create_link.cdc
   import HelloResource from 0x06

   transaction {
     prepare() {
       // TODO
     }
   }
   \`\`\`

3. Pass an \`&Account\` reference into \`prepare\` with the [entitlements] needed to give the \`transaction\` the ability to create and publish a capability:

   \`\`\`cadence create_link.cdc
   import HelloResource from 0x06

   transaction {
     prepare(account: auth(
       IssueStorageCapabilityController,
       PublishCapability
     ) &Account) {
       // TODO
     }
   }
   \`\`\`

The [\`IssueStorageCapabilityController\`] entitlement allows the transaction to [issue] a new capability, which includes storing that capability to the user's account. [\`PublishCapability\`] allows the transaction to [publish] a capability and make it available to other users — in this case, we'll make it public.

Capability-based access control [#capability-based-access-control]

[Capabilities] allow the owners of objects to specify what functionality of their private objects is available to others. Think of it kind of like an account's API, if you're familiar with the concept.

The account owner has private objects stored in their storage, like their collectibles or their money, but they might still want others to be able to see what collectibles they have in their account, or they want to allow anyone to access the deposit functionality for a certain asset.

Since these objects are stored in private storage by default, the owner must provide authorization to open up access to them.

We create capabilities to accomplish this, and the account owner must sign a transaction to [issue] and [publish] them.

Every capability has a \`borrow\` method, which creates a reference to the object that the capability is linked to. This reference is used to read fields or call methods on the object they reference, **as if the owner of the reference had the actual object**.

It is important to remember that someone else who has access to a capability cannot move or destroy the object that the capability is linked to! They can access **ALL \`access(all)\` fields and functions** though, which is why privileged functionality must be protected by [entitlements].
In addition to the \`access(all)\` fields, the holder of the capability can access entitled fields and functions but only if the owner has explicitly declared them in the type specification and authorization level of the [issue] method.

Issuing the capability [#issuing-the-capability]

Capabilities are created with the [issue] function and can be stored in variables or constants.

In the \`prepare\` phase, issue a capability to allow access to the \`HelloAsset\` [resource] instance in the \`Create Hello\` transaction saved in \`/storage/HelloAssetTutorial\`:

\`\`\`cadence
let capability = account
  .capabilities
  .storage
  .issue<&HelloResource.HelloAsset>(/storage/HelloAssetTutorial)
\`\`\`

:::danger
In our capability example, we had the user sign a transaction that gave public access to **everything** found in the \`HelloAsset\` resource!

When you're writing real transactions, follow the principle of giving minimal access. While the capability cannot move or destroy an object, **it might be able to mutate data inside of it** in a way that the owner does not desire.

For example, if you added a function to allow the owner of the resource to change the greeting message, this code would open that function up to anyone and everyone! This is why those functions need to be protected by [entitlements]!
:::

\`\`\`cadence
let capability = account
  .capabilities
  .storage
  .issue<&HelloResource.HelloAsset>(/storage/HelloAssetTutorial)
\`\`\`

The capability says that whoever borrows a reference from this capability has access to the fields and methods that are specified by the type and entitlements in \`<>\`. The specified type has to be a subtype of the object type being linked to, meaning that it cannot contain any fields or functions that the linked object doesn't have.

A reference is referred to by the \`&\` symbol. Here, the capability references the \`HelloAsset\` object, so we specify \`<&HelloResource.HelloAsset>\` as the type, which gives access to **EVERY \`access(all)\` field and function** in the \`HelloAsset\` object.

The argument to the \`issue\` function is the path to the object in storage that it is linked to. When a capability is issued, a [capability controller] is created for it in \`account.capabilities\`. This controller allows the creator of the capability to have fine-grained control over the capability.

Capabilities usually link to objects in the \`/storage/\` domain, but can also be created for \`Account\` objects. Account capabilities will **not** be covered in this tutorial.

Publishing the capability [#publishing-the-capability]

Now that your transaction has created the capability with the [issue] function and saved it in a constant, you can use the [publish] function to store the capability in a place where it can be used by anyone.

In the \`prepare\` phase, use the [publish] function to publish the \`capability\` at \`/public/HelloAssetTutorial\`:

\`\`\`cadence
account.capabilities.publish(capability, at: /public/HelloAssetTutorial)
\`\`\`

You should end up with a transaction similar to:

\`\`\`cadence Create Link.cdc
import HelloResource from 0x06

transaction {
  prepare(account: auth(
    IssueStorageCapabilityController,
    PublishCapability
  ) &Account) {
    let capability = account
      .capabilities
      .storage
      .issue<&HelloResource.HelloAsset>(/storage/HelloAssetTutorial)

    account
      .capabilities
      .publish(capability, at: /public/HelloAssetTutorial)
  }
}
\`\`\`

Executing the transaction to publish the capability [#executing-the-transaction-to-publish-the-capability]

:::warning
It is expected that the following implementation will work the first time and fail the second. The object cannot be saved because something is already at the path.
:::

1. Ensure account \`0x06\` is still selected as a transaction signer.
2. Click the \`Send\` button to send the transaction.
3. Send it a second time.

As you learned in the [resources tutorial], Cadence prevents you from writing code that might accidentally overwrite an object in storage, thus mutating or even destroying a piece of your users' digital property.

On your own, refactor your \`Create Link\` transaction to elegantly handle a scenario where an object is already stored at \`/public/HelloAssetTutorial\`.

Using the capability in a script [#using-the-capability-in-a-script]

Now that you've published the capability with \`public\` \`access\`, **anyone** who wants to can write transactions or scripts that make use of it.

1. Create a script called \`GetGreeting\`.

2. Import \`HelloResource\` and give it public \`access\`. To avoid syntax errors while writing the function, you may wish to add a temporary and obvious \`return\` value:

   \`\`\`cadence GetGreeting.cdc
   import HelloResource from 0x06

   access(all) fun main(): String {
     // TODO
     return "TODO";
   }
   \`\`\`

   * You'll need a reference to the public account object for the \`0x06\` account to be able to access public capabilities within it.

3. Use \`getAccount\` to get a reference to account \`0x06\`. Hardcode it for now:
   \`\`\`cadence
   let helloAccount = getAccount(0x06)
   \`\`\`
   * Addresses are **not** strings and thus do **not** have quotes around them.

4. Use \`borrow\` to borrow the public capability for your \`Create Link\` transaction saved in \`/public/HelloAssetTutorial\`.

   * Your script should return \`helloReference.hello()\`.
   * You've already borrowed something before. Try to implement this on your own. **Hint:** this time, you're borrowing a \`capability\` from the account, **not** something from \`storage\`. Don't forget to handle the case where the object can't be found!
     <dl><dd><em>You should end up with a script similar to:</em></dd></dl>

   \`\`\`cadence GetGreeting.cdc
   import HelloResource from 0x06

   access(all) fun main(): String {
       let helloAccount = getAccount(0x06)

       let helloReference = helloAccount
           .capabilities
           .borrow<&HelloResource.HelloAsset>(/public/HelloAssetTutorial)
           ?? panic("Could not borrow a reference to the HelloAsset capability")

       return helloReference.hello()
   }
   \`\`\`

5. Use \`Execute\` to execute your script.
   <dl><dd><em>You'll see \`"Hello, World!"\` logged to the console.</em></dd></dl>

Note that scripts don't need any authorization and can only access public information. You've enabled the user to make this capability public through the transaction you wrote and they signed. **Anyone** can write their own scripts to interact with your contracts this way!

At the end of the script execution, the \`helloReference\` value is lost, but that is ok because while it references a resource, it isn't the actual resource itself. It's ok to lose it.

Deleting capabilities [#deleting-capabilities]

:::danger
While most apps will need to depend on users storing resources that allow the user to interact with the app, avoid constructing your app logic such that it depends on something in a user's storage for important data. They own their storage and can delete anything in it at any time without asking anyone.

For example, if you stored the amount of debt for tokens you'd lent a user as a standalone resource in their account, they could simply **delete the storage and erase the debt**. Instead, store that data in your smart contract.
:::
The owner of an object can effectively [revoke capabilities] they have created by using the \`delete\` method on the Capability Controller that was created for the capability when it was issued.

Additionally, if the referenced object in storage is moved, capabilities that have been created from that storage path are invalidated.

Reviewing capabilities [#reviewing-capabilities]

This tutorial expanded on the idea of resources in Cadence by expanding access scope to a resource using capabilities and covering more account storage API use cases.

You deployed a smart contract with a resource, then created a capability to grant access to that resource. With the capability, you used the \`borrow\` method in a script to create a reference to the capability. You then used the reference to call the resource's \`hello()\` function. This is important because scripts cannot access account storage without using capabilities.

Now that you have completed the tutorial, you should be able to:

* Interact with [resources] created using transactions.
* Write transactions to create [capabilities] to extend resource access scope from the owner to anyone (\`public\`).
* Write and execute a script that interacts with the resource through the capability.

You're on the right track to building more complex applications with Cadence. Now is a great time to check out the [Cadence Best Practices document], [Anti-patterns document], and the first NFT tutorial!

Reference Solution [#reference-solution]

:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.
:::

* [Reference Solution]

{/* Reference-style links, will not render on page */}

[accounts]: ../language/accounts/index.mdx

[storage]: ../language/accounts/storage.mdx

[resources]: ../language/resources.mdx

[resource]: ../language/resources.mdx

[capabilities]: ../language/capabilities.md

[Capabilities]: ../language/capabilities.md

[entitlements]: ../language/access-control.md#entitlements

[reference]: ../language/references.mdx

[\`IssueStorageCapabilityController\`]: ../language/accounts/capabilities.mdx#accountstoragecapabilities-and-accountaccountcapabilities

[\`PublishCapability\`]: /language/accounts/capabilities.mdx#accountcapabilities

[issue]: ../language/accounts/capabilities.mdx#issuing-capabilities

[publish]: ../language/accounts/capabilities.mdx#publishing-capabilities

[resources tutorial]: ./resources

[capability controller]: ../language/accounts/capabilities.mdx#accountcapabilities

[revoke capabilities]: ../language/accounts/capabilities.mdx#revoking-capabilities

[Cadence Best Practices document]: ../design-patterns.md

[Anti-patterns document]: ../anti-patterns.md

[Reference Solution]: https://play.flow.com/6f74fe85-465d-4e4f-a534-1895f6a3c0a6

[https://play.flow.com/8b28da4e-0235-499f-8653-1f55e1b3b725]: https://play.flow.com/8b28da4e-0235-499f-8653-1f55e1b3b725
`,o={title:"Capabilities and Entitlements",description:"An introduction to capabilities, entitlements, and how they interact with resources in Cadence"},l={contents:[{heading:void 0,content:"This tutorial builds on your understanding of [accounts] and [resources]. You'll learn how to interact with resources using [capabilities] and [entitlements]."},{heading:void 0,content:":::tip\\[Reminder]\nIn Cadence, resources are a composite type like a `struct` or a class in other languages, but with some **special rules**:"},{heading:void 0,content:"Each instance of a resource can only exist in exactly one location and cannot be copied."},{heading:void 0,content:"Resources must be explicitly moved from one location to another when accessed."},{heading:void 0,content:`Resources also cannot go out of scope at the end of function execution — they must be explicitly stored somewhere or destroyed.
:::`},{heading:"objectives",content:"After completing this tutorial, you'll be able to:"},{heading:"objectives",content:"Interact with [resources] created using transactions."},{heading:"objectives",content:"Use entitlements to secure the privileged functionality in your resources that would be vulnerable otherwise."},{heading:"objectives",content:"Write transactions to create [capabilities] that extend resource access scope from the owner to anyone (`public`)."},{heading:"objectives",content:"Write and execute a script that interacts with the resource through the capability."},{heading:"use-cases-for-capabilities-and-entitlements",content:"Let's look at why you would want to use capabilities and entitlements to expand and secure access to resources in a real-world context. A real user's account and stored objects will contain functions and fields that need varying levels of access scope and privacy."},{heading:"use-cases-for-capabilities-and-entitlements",content:"If you're working on an app that allows users to exchange tokens, you'll want different features available in different use cases. While you definitely want anybody to be able to call the function to give you tokens (`access(all)`), you would of course want to ensure that any features or functions that access privileged functionality like withdrawing tokens from an account are only able to be called by the owner, (`access(Owner)`). The `Owner` specification in this case is an \\[entitlement], and it is vitally important that you use entitlements correctly in order to secure the digital property created and managed in your contracts and transactions."},{heading:"use-cases-for-capabilities-and-entitlements",content:`:::note
In Cadence, users have complete control over their storage, and their storage is tied directly to their accounts. This feature allows amazing benefits including peer-to-peer transfers of property and it being impossible to accidentally burn an asset by sending it to an unused address. The one mixed blessing is that you can't airdrop tokens or NFTs without the recipient signing a transaction. Less spam, but you'll need to use a claim mechanism if the recipient doesn't already have a vault for your asset.
:::
Capabilities and entitlements are what allows for this detailed control of access to owned assets. They allow a user to indicate which of the functionality of their account and owned objects should be accessible to themselves, their trusted friends, and the public.`},{heading:"use-cases-for-capabilities-and-entitlements",content:"For example, a user might want to allow a friend of theirs to use some of their money to spend. In this case, they could create an object that gives the friend access to only this part of their account, instead of having to hand over full control of their account."},{heading:"use-cases-for-capabilities-and-entitlements",content:":::note\nIn the last tutorial, you wrote transactions to access an account with `&Account` object containing specifications about which functionality the transaction was allowed to access,  such as `auth(BorrowValue, SaveValue)`. When you wrote that transaction, you were using entitlements.  They can also apply to accounts, resources, and structs!\n:::\nAnother example is when a user authenticates a trading app for the first time, the trading app could ask the user for an object that allows the app to access the trading functionality of a user's account so that the app doesn't need to ask the user for a signature every time it wants to do a trade. The user can choose to empower the app, and that app alone, for this functionality and this functionality alone."},{heading:"access-resources-with-capabilities",content:"As a smart contract developer, you need explicit permission from the owner of an account to access its [storage]. Capabilities allow an account owner to grant access to objects stored in their private account storage. Think of them as a pointer to the object that allows you to access all the `access(all)` fields and functions in that object."},{heading:"access-resources-with-capabilities",content:"First, you'll write a transaction in which you'll issue a new capability using the `issue` function. This capability creates a link to the user's `HelloAsset` resource object. It then publishes that link to the account's public space, so others can access it."},{heading:"access-resources-with-capabilities",content:"Next, you'll write a script that accesses that public capability and calls its `hello()` function."},{heading:"creating-capabilities-and-references-to-stored-resources",content:"Continue working with your code from the previous tutorial. Alternately, open a fresh copy here: [https://play.flow.com/8b28da4e-0235-499f-8653-1f55e1b3b725]."},{heading:"creating-capabilities-and-references-to-stored-resources",content:"If you started with the playground linked above, be sure to deploy the `HelloResource` contract with account `0x06` and call the `Create Hello` transaction, also with `0x06`."},{heading:"preparing-the-account-capabilities",content:"To prepare:"},{heading:"preparing-the-account-capabilities",content:"Create a new transaction called `Create Link`."},{heading:"preparing-the-account-capabilities",content:"Import `HelloResource` and stub out a `transaction` with a `prepare` phase."},{heading:"preparing-the-account-capabilities",content:"Cadence allows for static analysis of imported contracts. You'll get errors in the transactions and scripts that import `HelloResource` from `0x06` if you haven't deployed that contract."},{heading:"preparing-the-account-capabilities",content:"Pass an `&Account` reference into `prepare` with the [entitlements] needed to give the `transaction` the ability to create and publish a capability:"},{heading:"preparing-the-account-capabilities",content:"The [`IssueStorageCapabilityController`] entitlement allows the transaction to [issue] a new capability, which includes storing that capability to the user's account. [`PublishCapability`] allows the transaction to [publish] a capability and make it available to other users — in this case, we'll make it public."},{heading:"capability-based-access-control",content:"[Capabilities] allow the owners of objects to specify what functionality of their private objects is available to others. Think of it kind of like an account's API, if you're familiar with the concept."},{heading:"capability-based-access-control",content:"The account owner has private objects stored in their storage, like their collectibles or their money, but they might still want others to be able to see what collectibles they have in their account, or they want to allow anyone to access the deposit functionality for a certain asset."},{heading:"capability-based-access-control",content:"Since these objects are stored in private storage by default, the owner must provide authorization to open up access to them."},{heading:"capability-based-access-control",content:"We create capabilities to accomplish this, and the account owner must sign a transaction to [issue] and [publish] them."},{heading:"capability-based-access-control",content:"Every capability has a `borrow` method, which creates a reference to the object that the capability is linked to. This reference is used to read fields or call methods on the object they reference, **as if the owner of the reference had the actual object**."},{heading:"capability-based-access-control",content:"It is important to remember that someone else who has access to a capability cannot move or destroy the object that the capability is linked to! They can access **ALL `access(all)` fields and functions** though, which is why privileged functionality must be protected by [entitlements].\nIn addition to the `access(all)` fields, the holder of the capability can access entitled fields and functions but only if the owner has explicitly declared them in the type specification and authorization level of the [issue] method."},{heading:"issuing-the-capability",content:"Capabilities are created with the [issue] function and can be stored in variables or constants."},{heading:"issuing-the-capability",content:"In the `prepare` phase, issue a capability to allow access to the `HelloAsset` [resource] instance in the `Create Hello` transaction saved in `/storage/HelloAssetTutorial`:"},{heading:"issuing-the-capability",content:":::danger\nIn our capability example, we had the user sign a transaction that gave public access to **everything** found in the `HelloAsset` resource!"},{heading:"issuing-the-capability",content:"When you're writing real transactions, follow the principle of giving minimal access. While the capability cannot move or destroy an object, **it might be able to mutate data inside of it** in a way that the owner does not desire."},{heading:"issuing-the-capability",content:`For example, if you added a function to allow the owner of the resource to change the greeting message, this code would open that function up to anyone and everyone! This is why those functions need to be protected by [entitlements]!
:::`},{heading:"issuing-the-capability",content:"The capability says that whoever borrows a reference from this capability has access to the fields and methods that are specified by the type and entitlements in `<>`. The specified type has to be a subtype of the object type being linked to, meaning that it cannot contain any fields or functions that the linked object doesn't have."},{heading:"issuing-the-capability",content:"A reference is referred to by the `&` symbol. Here, the capability references the `HelloAsset` object, so we specify `<&HelloResource.HelloAsset>` as the type, which gives access to **EVERY `access(all)` field and function** in the `HelloAsset` object."},{heading:"issuing-the-capability",content:"The argument to the `issue` function is the path to the object in storage that it is linked to. When a capability is issued, a [capability controller] is created for it in `account.capabilities`. This controller allows the creator of the capability to have fine-grained control over the capability."},{heading:"issuing-the-capability",content:"Capabilities usually link to objects in the `/storage/` domain, but can also be created for `Account` objects. Account capabilities will **not** be covered in this tutorial."},{heading:"publishing-the-capability",content:"Now that your transaction has created the capability with the [issue] function and saved it in a constant, you can use the [publish] function to store the capability in a place where it can be used by anyone."},{heading:"publishing-the-capability",content:"In the `prepare` phase, use the [publish] function to publish the `capability` at `/public/HelloAssetTutorial`:"},{heading:"publishing-the-capability",content:"You should end up with a transaction similar to:"},{heading:"executing-the-transaction-to-publish-the-capability",content:`:::warning
It is expected that the following implementation will work the first time and fail the second. The object cannot be saved because something is already at the path.
:::`},{heading:"executing-the-transaction-to-publish-the-capability",content:"Ensure account `0x06` is still selected as a transaction signer."},{heading:"executing-the-transaction-to-publish-the-capability",content:"Click the `Send` button to send the transaction."},{heading:"executing-the-transaction-to-publish-the-capability",content:"Send it a second time."},{heading:"executing-the-transaction-to-publish-the-capability",content:"As you learned in the [resources tutorial], Cadence prevents you from writing code that might accidentally overwrite an object in storage, thus mutating or even destroying a piece of your users' digital property."},{heading:"executing-the-transaction-to-publish-the-capability",content:"On your own, refactor your `Create Link` transaction to elegantly handle a scenario where an object is already stored at `/public/HelloAssetTutorial`."},{heading:"using-the-capability-in-a-script",content:"Now that you've published the capability with `public` `access`, **anyone** who wants to can write transactions or scripts that make use of it."},{heading:"using-the-capability-in-a-script",content:"Create a script called `GetGreeting`."},{heading:"using-the-capability-in-a-script",content:"Import `HelloResource` and give it public `access`. To avoid syntax errors while writing the function, you may wish to add a temporary and obvious `return` value:"},{heading:"using-the-capability-in-a-script",content:"You'll need a reference to the public account object for the `0x06` account to be able to access public capabilities within it."},{heading:"using-the-capability-in-a-script",content:"Use `getAccount` to get a reference to account `0x06`. Hardcode it for now:"},{heading:"using-the-capability-in-a-script",content:"Addresses are **not** strings and thus do **not** have quotes around them."},{heading:"using-the-capability-in-a-script",content:"Use `borrow` to borrow the public capability for your `Create Link` transaction saved in `/public/HelloAssetTutorial`."},{heading:"using-the-capability-in-a-script",content:"Your script should return `helloReference.hello()`."},{heading:"using-the-capability-in-a-script",content:"You've already borrowed something before. Try to implement this on your own. &#x2A;*Hint:** this time, you're borrowing a `capability` from the account, **not** something from `storage`. Don't forget to handle the case where the object can't be found!\nYou should end up with a script similar to:"},{heading:"using-the-capability-in-a-script",content:'Use `Execute` to execute your script.\nYou\'ll see `"Hello, World!"` logged to the console.'},{heading:"using-the-capability-in-a-script",content:"Note that scripts don't need any authorization and can only access public information. You've enabled the user to make this capability public through the transaction you wrote and they signed. **Anyone** can write their own scripts to interact with your contracts this way!"},{heading:"using-the-capability-in-a-script",content:"At the end of the script execution, the `helloReference` value is lost, but that is ok because while it references a resource, it isn't the actual resource itself. It's ok to lose it."},{heading:"deleting-capabilities",content:`:::danger
While most apps will need to depend on users storing resources that allow the user to interact with the app, avoid constructing your app logic such that it depends on something in a user's storage for important data. They own their storage and can delete anything in it at any time without asking anyone.`},{heading:"deleting-capabilities",content:"For example, if you stored the amount of debt for tokens you'd lent a user as a standalone resource in their account, they could simply **delete the storage and erase the debt**. Instead, store that data in your smart contract.\n:::\nThe owner of an object can effectively [revoke capabilities] they have created by using the `delete` method on the Capability Controller that was created for the capability when it was issued."},{heading:"deleting-capabilities",content:"Additionally, if the referenced object in storage is moved, capabilities that have been created from that storage path are invalidated."},{heading:"reviewing-capabilities",content:"This tutorial expanded on the idea of resources in Cadence by expanding access scope to a resource using capabilities and covering more account storage API use cases."},{heading:"reviewing-capabilities",content:"You deployed a smart contract with a resource, then created a capability to grant access to that resource. With the capability, you used the `borrow` method in a script to create a reference to the capability. You then used the reference to call the resource's `hello()` function. This is important because scripts cannot access account storage without using capabilities."},{heading:"reviewing-capabilities",content:"Now that you have completed the tutorial, you should be able to:"},{heading:"reviewing-capabilities",content:"Interact with [resources] created using transactions."},{heading:"reviewing-capabilities",content:"Write transactions to create [capabilities] to extend resource access scope from the owner to anyone (`public`)."},{heading:"reviewing-capabilities",content:"Write and execute a script that interacts with the resource through the capability."},{heading:"reviewing-capabilities",content:"You're on the right track to building more complex applications with Cadence. Now is a great time to check out the [Cadence Best Practices document], [Anti-patterns document], and the first NFT tutorial!"},{heading:"reference-solution",content:`:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!`},{heading:"reference-solution",content:`Reference solutions are functional, but may not be optimal.
:::`},{heading:"reference-solution",content:"[Reference Solution]"}],headings:[{id:"objectives",content:"Objectives"},{id:"use-cases-for-capabilities-and-entitlements",content:"Use cases for capabilities and entitlements"},{id:"access-resources-with-capabilities",content:"Access resources with capabilities"},{id:"creating-capabilities-and-references-to-stored-resources",content:"Creating capabilities and references to stored resources"},{id:"preparing-the-account-capabilities",content:"Preparing the account capabilities"},{id:"capability-based-access-control",content:"Capability-based access control"},{id:"issuing-the-capability",content:"Issuing the capability"},{id:"publishing-the-capability",content:"Publishing the capability"},{id:"executing-the-transaction-to-publish-the-capability",content:"Executing the transaction to publish the capability"},{id:"using-the-capability-in-a-script",content:"Using the capability in a script"},{id:"deleting-capabilities",content:"Deleting capabilities"},{id:"reviewing-capabilities",content:"Reviewing capabilities"},{id:"reference-solution",content:"Reference Solution"}]};const r=[{depth:2,url:"#objectives",title:e.jsx(e.Fragment,{children:"Objectives"})},{depth:2,url:"#use-cases-for-capabilities-and-entitlements",title:e.jsx(e.Fragment,{children:"Use cases for capabilities and entitlements"})},{depth:2,url:"#access-resources-with-capabilities",title:e.jsx(e.Fragment,{children:"Access resources with capabilities"})},{depth:2,url:"#creating-capabilities-and-references-to-stored-resources",title:e.jsx(e.Fragment,{children:"Creating capabilities and references to stored resources"})},{depth:3,url:"#preparing-the-account-capabilities",title:e.jsx(e.Fragment,{children:"Preparing the account capabilities"})},{depth:3,url:"#capability-based-access-control",title:e.jsx(e.Fragment,{children:"Capability-based access control"})},{depth:3,url:"#issuing-the-capability",title:e.jsx(e.Fragment,{children:"Issuing the capability"})},{depth:3,url:"#publishing-the-capability",title:e.jsx(e.Fragment,{children:"Publishing the capability"})},{depth:3,url:"#executing-the-transaction-to-publish-the-capability",title:e.jsx(e.Fragment,{children:"Executing the transaction to publish the capability"})},{depth:2,url:"#using-the-capability-in-a-script",title:e.jsx(e.Fragment,{children:"Using the capability in a script"})},{depth:2,url:"#deleting-capabilities",title:e.jsx(e.Fragment,{children:"Deleting capabilities"})},{depth:2,url:"#reviewing-capabilities",title:e.jsx(e.Fragment,{children:"Reviewing capabilities"})},{depth:2,url:"#reference-solution",title:e.jsx(e.Fragment,{children:"Reference Solution"})}];function s(i){const t={a:"a",code:"code",h2:"h2",h3:"h3",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["This tutorial builds on your understanding of ",e.jsx(t.a,{href:"../language/accounts/index.mdx",children:"accounts"})," and ",e.jsx(t.a,{href:"../language/resources.mdx",children:"resources"}),". You'll learn how to interact with resources using ",e.jsx(t.a,{href:"../language/capabilities.md",children:"capabilities"})," and ",e.jsx(t.a,{href:"../language/access-control.md#entitlements",children:"entitlements"}),"."]}),`
`,e.jsxs(t.p,{children:[`:::tip[Reminder]
In Cadence, resources are a composite type like a `,e.jsx(t.code,{children:"struct"})," or a class in other languages, but with some ",e.jsx(t.strong,{children:"special rules"}),":"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Each instance of a resource can only exist in exactly one location and cannot be copied."}),`
`,e.jsx(t.li,{children:"Resources must be explicitly moved from one location to another when accessed."}),`
`,e.jsx(t.li,{children:`Resources also cannot go out of scope at the end of function execution — they must be explicitly stored somewhere or destroyed.
:::`}),`
`]}),`
`,e.jsx(t.h2,{id:"objectives",children:"Objectives"}),`
`,e.jsx(t.p,{children:"After completing this tutorial, you'll be able to:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Interact with ",e.jsx(t.a,{href:"../language/resources.mdx",children:"resources"})," created using transactions."]}),`
`,e.jsx(t.li,{children:"Use entitlements to secure the privileged functionality in your resources that would be vulnerable otherwise."}),`
`,e.jsxs(t.li,{children:["Write transactions to create ",e.jsx(t.a,{href:"../language/capabilities.md",children:"capabilities"})," that extend resource access scope from the owner to anyone (",e.jsx(t.code,{children:"public"}),")."]}),`
`,e.jsx(t.li,{children:"Write and execute a script that interacts with the resource through the capability."}),`
`]}),`
`,e.jsx(t.h2,{id:"use-cases-for-capabilities-and-entitlements",children:"Use cases for capabilities and entitlements"}),`
`,e.jsx(t.p,{children:"Let's look at why you would want to use capabilities and entitlements to expand and secure access to resources in a real-world context. A real user's account and stored objects will contain functions and fields that need varying levels of access scope and privacy."}),`
`,e.jsxs(t.p,{children:["If you're working on an app that allows users to exchange tokens, you'll want different features available in different use cases. While you definitely want anybody to be able to call the function to give you tokens (",e.jsx(t.code,{children:"access(all)"}),"), you would of course want to ensure that any features or functions that access privileged functionality like withdrawing tokens from an account are only able to be called by the owner, (",e.jsx(t.code,{children:"access(Owner)"}),"). The ",e.jsx(t.code,{children:"Owner"})," specification in this case is an [entitlement], and it is vitally important that you use entitlements correctly in order to secure the digital property created and managed in your contracts and transactions."]}),`
`,e.jsx(t.p,{children:`:::note
In Cadence, users have complete control over their storage, and their storage is tied directly to their accounts. This feature allows amazing benefits including peer-to-peer transfers of property and it being impossible to accidentally burn an asset by sending it to an unused address. The one mixed blessing is that you can't airdrop tokens or NFTs without the recipient signing a transaction. Less spam, but you'll need to use a claim mechanism if the recipient doesn't already have a vault for your asset.
:::
Capabilities and entitlements are what allows for this detailed control of access to owned assets. They allow a user to indicate which of the functionality of their account and owned objects should be accessible to themselves, their trusted friends, and the public.`}),`
`,e.jsx(t.p,{children:e.jsx(t.img,{alt:"Capabilities and Entitlements",src:n,placeholder:"blur"})}),`
`,e.jsx(t.p,{children:"For example, a user might want to allow a friend of theirs to use some of their money to spend. In this case, they could create an object that gives the friend access to only this part of their account, instead of having to hand over full control of their account."}),`
`,e.jsxs(t.p,{children:[`:::note
In the last tutorial, you wrote transactions to access an account with `,e.jsx(t.code,{children:"&Account"})," object containing specifications about which functionality the transaction was allowed to access,  such as ",e.jsx(t.code,{children:"auth(BorrowValue, SaveValue)"}),`. When you wrote that transaction, you were using entitlements.  They can also apply to accounts, resources, and structs!
:::
Another example is when a user authenticates a trading app for the first time, the trading app could ask the user for an object that allows the app to access the trading functionality of a user's account so that the app doesn't need to ask the user for a signature every time it wants to do a trade. The user can choose to empower the app, and that app alone, for this functionality and this functionality alone.`]}),`
`,e.jsx(t.h2,{id:"access-resources-with-capabilities",children:"Access resources with capabilities"}),`
`,e.jsxs(t.p,{children:["As a smart contract developer, you need explicit permission from the owner of an account to access its ",e.jsx(t.a,{href:"../language/accounts/storage.mdx",children:"storage"}),". Capabilities allow an account owner to grant access to objects stored in their private account storage. Think of them as a pointer to the object that allows you to access all the ",e.jsx(t.code,{children:"access(all)"})," fields and functions in that object."]}),`
`,e.jsxs(t.p,{children:["First, you'll write a transaction in which you'll issue a new capability using the ",e.jsx(t.code,{children:"issue"})," function. This capability creates a link to the user's ",e.jsx(t.code,{children:"HelloAsset"})," resource object. It then publishes that link to the account's public space, so others can access it."]}),`
`,e.jsxs(t.p,{children:["Next, you'll write a script that accesses that public capability and calls its ",e.jsx(t.code,{children:"hello()"})," function."]}),`
`,e.jsx(t.h2,{id:"creating-capabilities-and-references-to-stored-resources",children:"Creating capabilities and references to stored resources"}),`
`,e.jsxs(t.p,{children:["Continue working with your code from the previous tutorial. Alternately, open a fresh copy here: ",e.jsx(t.a,{href:"https://play.flow.com/8b28da4e-0235-499f-8653-1f55e1b3b725",children:"https://play.flow.com/8b28da4e-0235-499f-8653-1f55e1b3b725"}),"."]}),`
`,e.jsxs(t.p,{children:["If you started with the playground linked above, be sure to deploy the ",e.jsx(t.code,{children:"HelloResource"})," contract with account ",e.jsx(t.code,{children:"0x06"})," and call the ",e.jsx(t.code,{children:"Create Hello"})," transaction, also with ",e.jsx(t.code,{children:"0x06"}),"."]}),`
`,e.jsx(t.h3,{id:"preparing-the-account-capabilities",children:"Preparing the account capabilities"}),`
`,e.jsx(t.p,{children:"To prepare:"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Create a new transaction called ",e.jsx(t.code,{children:"Create Link"}),"."]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Import ",e.jsx(t.code,{children:"HelloResource"})," and stub out a ",e.jsx(t.code,{children:"transaction"})," with a ",e.jsx(t.code,{children:"prepare"})," phase."]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Cadence allows for static analysis of imported contracts. You'll get errors in the transactions and scripts that import ",e.jsx(t.code,{children:"HelloResource"})," from ",e.jsx(t.code,{children:"0x06"})," if you haven't deployed that contract."]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // TODO"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Pass an ",e.jsx(t.code,{children:"&Account"})," reference into ",e.jsx(t.code,{children:"prepare"})," with the ",e.jsx(t.a,{href:"../language/access-control.md#entitlements",children:"entitlements"})," needed to give the ",e.jsx(t.code,{children:"transaction"})," the ability to create and publish a capability:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    IssueStorageCapabilityController"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    PublishCapability"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ) &"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // TODO"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#accountstoragecapabilities-and-accountaccountcapabilities",children:e.jsx(t.code,{children:"IssueStorageCapabilityController"})})," entitlement allows the transaction to ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#issuing-capabilities",children:"issue"})," a new capability, which includes storing that capability to the user's account. ",e.jsx(t.a,{href:"/language/accounts/capabilities.mdx#accountcapabilities",children:e.jsx(t.code,{children:"PublishCapability"})})," allows the transaction to ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#publishing-capabilities",children:"publish"})," a capability and make it available to other users — in this case, we'll make it public."]}),`
`,e.jsx(t.h3,{id:"capability-based-access-control",children:"Capability-based access control"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"../language/capabilities.md",children:"Capabilities"})," allow the owners of objects to specify what functionality of their private objects is available to others. Think of it kind of like an account's API, if you're familiar with the concept."]}),`
`,e.jsx(t.p,{children:"The account owner has private objects stored in their storage, like their collectibles or their money, but they might still want others to be able to see what collectibles they have in their account, or they want to allow anyone to access the deposit functionality for a certain asset."}),`
`,e.jsx(t.p,{children:"Since these objects are stored in private storage by default, the owner must provide authorization to open up access to them."}),`
`,e.jsxs(t.p,{children:["We create capabilities to accomplish this, and the account owner must sign a transaction to ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#issuing-capabilities",children:"issue"})," and ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#publishing-capabilities",children:"publish"})," them."]}),`
`,e.jsxs(t.p,{children:["Every capability has a ",e.jsx(t.code,{children:"borrow"})," method, which creates a reference to the object that the capability is linked to. This reference is used to read fields or call methods on the object they reference, ",e.jsx(t.strong,{children:"as if the owner of the reference had the actual object"}),"."]}),`
`,e.jsxs(t.p,{children:["It is important to remember that someone else who has access to a capability cannot move or destroy the object that the capability is linked to! They can access ",e.jsxs(t.strong,{children:["ALL ",e.jsx(t.code,{children:"access(all)"})," fields and functions"]})," though, which is why privileged functionality must be protected by ",e.jsx(t.a,{href:"../language/access-control.md#entitlements",children:"entitlements"}),`.
In addition to the `,e.jsx(t.code,{children:"access(all)"})," fields, the holder of the capability can access entitled fields and functions but only if the owner has explicitly declared them in the type specification and authorization level of the ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#issuing-capabilities",children:"issue"})," method."]}),`
`,e.jsx(t.h3,{id:"issuing-the-capability",children:"Issuing the capability"}),`
`,e.jsxs(t.p,{children:["Capabilities are created with the ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#issuing-capabilities",children:"issue"})," function and can be stored in variables or constants."]}),`
`,e.jsxs(t.p,{children:["In the ",e.jsx(t.code,{children:"prepare"})," phase, issue a capability to allow access to the ",e.jsx(t.code,{children:"HelloAsset"})," ",e.jsx(t.a,{href:"../language/resources.mdx",children:"resource"})," instance in the ",e.jsx(t.code,{children:"Create Hello"})," transaction saved in ",e.jsx(t.code,{children:"/storage/HelloAssetTutorial"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  .capabilities"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  .storage"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  .issue"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(t.p,{children:[`:::danger
In our capability example, we had the user sign a transaction that gave public access to `,e.jsx(t.strong,{children:"everything"})," found in the ",e.jsx(t.code,{children:"HelloAsset"})," resource!"]}),`
`,e.jsxs(t.p,{children:["When you're writing real transactions, follow the principle of giving minimal access. While the capability cannot move or destroy an object, ",e.jsx(t.strong,{children:"it might be able to mutate data inside of it"})," in a way that the owner does not desire."]}),`
`,e.jsxs(t.p,{children:["For example, if you added a function to allow the owner of the resource to change the greeting message, this code would open that function up to anyone and everyone! This is why those functions need to be protected by ",e.jsx(t.a,{href:"../language/access-control.md#entitlements",children:"entitlements"}),`!
:::`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  .capabilities"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  .storage"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  .issue"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(t.p,{children:["The capability says that whoever borrows a reference from this capability has access to the fields and methods that are specified by the type and entitlements in ",e.jsx(t.code,{children:"<>"}),". The specified type has to be a subtype of the object type being linked to, meaning that it cannot contain any fields or functions that the linked object doesn't have."]}),`
`,e.jsxs(t.p,{children:["A reference is referred to by the ",e.jsx(t.code,{children:"&"})," symbol. Here, the capability references the ",e.jsx(t.code,{children:"HelloAsset"})," object, so we specify ",e.jsx(t.code,{children:"<&HelloResource.HelloAsset>"})," as the type, which gives access to ",e.jsxs(t.strong,{children:["EVERY ",e.jsx(t.code,{children:"access(all)"})," field and function"]})," in the ",e.jsx(t.code,{children:"HelloAsset"})," object."]}),`
`,e.jsxs(t.p,{children:["The argument to the ",e.jsx(t.code,{children:"issue"})," function is the path to the object in storage that it is linked to. When a capability is issued, a ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#accountcapabilities",children:"capability controller"})," is created for it in ",e.jsx(t.code,{children:"account.capabilities"}),". This controller allows the creator of the capability to have fine-grained control over the capability."]}),`
`,e.jsxs(t.p,{children:["Capabilities usually link to objects in the ",e.jsx(t.code,{children:"/storage/"})," domain, but can also be created for ",e.jsx(t.code,{children:"Account"})," objects. Account capabilities will ",e.jsx(t.strong,{children:"not"})," be covered in this tutorial."]}),`
`,e.jsx(t.h3,{id:"publishing-the-capability",children:"Publishing the capability"}),`
`,e.jsxs(t.p,{children:["Now that your transaction has created the capability with the ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#issuing-capabilities",children:"issue"})," function and saved it in a constant, you can use the ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#publishing-capabilities",children:"publish"})," function to store the capability in a place where it can be used by anyone."]}),`
`,e.jsxs(t.p,{children:["In the ",e.jsx(t.code,{children:"prepare"})," phase, use the ",e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#publishing-capabilities",children:"publish"})," function to publish the ",e.jsx(t.code,{children:"capability"})," at ",e.jsx(t.code,{children:"/public/HelloAssetTutorial"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(capability, at: "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`,e.jsx(t.p,{children:"You should end up with a transaction similar to:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    IssueStorageCapabilityController"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    PublishCapability"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ) &"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      .capabilities"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      .storage"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      .issue"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    account"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      .capabilities"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      ."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(capability, at: "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(t.h3,{id:"executing-the-transaction-to-publish-the-capability",children:"Executing the transaction to publish the capability"}),`
`,e.jsx(t.p,{children:`:::warning
It is expected that the following implementation will work the first time and fail the second. The object cannot be saved because something is already at the path.
:::`}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Ensure account ",e.jsx(t.code,{children:"0x06"})," is still selected as a transaction signer."]}),`
`,e.jsxs(t.li,{children:["Click the ",e.jsx(t.code,{children:"Send"})," button to send the transaction."]}),`
`,e.jsx(t.li,{children:"Send it a second time."}),`
`]}),`
`,e.jsxs(t.p,{children:["As you learned in the ",e.jsx(t.a,{href:"./resources",children:"resources tutorial"}),", Cadence prevents you from writing code that might accidentally overwrite an object in storage, thus mutating or even destroying a piece of your users' digital property."]}),`
`,e.jsxs(t.p,{children:["On your own, refactor your ",e.jsx(t.code,{children:"Create Link"})," transaction to elegantly handle a scenario where an object is already stored at ",e.jsx(t.code,{children:"/public/HelloAssetTutorial"}),"."]}),`
`,e.jsx(t.h2,{id:"using-the-capability-in-a-script",children:"Using the capability in a script"}),`
`,e.jsxs(t.p,{children:["Now that you've published the capability with ",e.jsx(t.code,{children:"public"})," ",e.jsx(t.code,{children:"access"}),", ",e.jsx(t.strong,{children:"anyone"})," who wants to can write transactions or scripts that make use of it."]}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Create a script called ",e.jsx(t.code,{children:"GetGreeting"}),"."]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Import ",e.jsx(t.code,{children:"HelloResource"})," and give it public ",e.jsx(t.code,{children:"access"}),". To avoid syntax errors while writing the function, you may wish to add a temporary and obvious ",e.jsx(t.code,{children:"return"})," value:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // TODO"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "TODO"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["You'll need a reference to the public account object for the ",e.jsx(t.code,{children:"0x06"})," account to be able to access public capabilities within it."]}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Use ",e.jsx(t.code,{children:"getAccount"})," to get a reference to account ",e.jsx(t.code,{children:"0x06"}),". Hardcode it for now:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(t.code,{children:e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" helloAccount = "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0x06"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Addresses are ",e.jsx(t.strong,{children:"not"})," strings and thus do ",e.jsx(t.strong,{children:"not"})," have quotes around them."]}),`
`]}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Use ",e.jsx(t.code,{children:"borrow"})," to borrow the public capability for your ",e.jsx(t.code,{children:"Create Link"})," transaction saved in ",e.jsx(t.code,{children:"/public/HelloAssetTutorial"}),"."]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Your script should return ",e.jsx(t.code,{children:"helloReference.hello()"}),"."]}),`
`,e.jsxs(t.li,{children:["You've already borrowed something before. Try to implement this on your own. ",e.jsx(t.strong,{children:"Hint:"})," this time, you're borrowing a ",e.jsx(t.code,{children:"capability"})," from the account, ",e.jsx(t.strong,{children:"not"})," something from ",e.jsx(t.code,{children:"storage"}),`. Don't forget to handle the case where the object can't be found!
`,e.jsx("dl",{children:e.jsx("dd",{children:e.jsx("em",{children:"You should end up with a script similar to:"})})})]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(t.code,{children:[e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" helloAccount = "}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0x06"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" helloReference = helloAccount"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        .capabilities"})}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        .borrow"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloResource"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        ??"}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Could not borrow a reference to the HelloAsset capability"'}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(t.span,{className:"line"}),`
`,e.jsxs(t.span,{className:"line",children:[e.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" helloReference."}),e.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hello"}),e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(t.span,{className:"line",children:e.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,e.jsxs(t.li,{children:[`
`,e.jsxs(t.p,{children:["Use ",e.jsx(t.code,{children:"Execute"}),` to execute your script.
`,e.jsx("dl",{children:e.jsx("dd",{children:e.jsxs("em",{children:["You'll see ",e.jsx(t.code,{children:'"Hello, World!"'})," logged to the console."]})})})]}),`
`]}),`
`]}),`
`,e.jsxs(t.p,{children:["Note that scripts don't need any authorization and can only access public information. You've enabled the user to make this capability public through the transaction you wrote and they signed. ",e.jsx(t.strong,{children:"Anyone"})," can write their own scripts to interact with your contracts this way!"]}),`
`,e.jsxs(t.p,{children:["At the end of the script execution, the ",e.jsx(t.code,{children:"helloReference"})," value is lost, but that is ok because while it references a resource, it isn't the actual resource itself. It's ok to lose it."]}),`
`,e.jsx(t.h2,{id:"deleting-capabilities",children:"Deleting capabilities"}),`
`,e.jsx(t.p,{children:`:::danger
While most apps will need to depend on users storing resources that allow the user to interact with the app, avoid constructing your app logic such that it depends on something in a user's storage for important data. They own their storage and can delete anything in it at any time without asking anyone.`}),`
`,e.jsxs(t.p,{children:["For example, if you stored the amount of debt for tokens you'd lent a user as a standalone resource in their account, they could simply ",e.jsx(t.strong,{children:"delete the storage and erase the debt"}),`. Instead, store that data in your smart contract.
:::
The owner of an object can effectively `,e.jsx(t.a,{href:"../language/accounts/capabilities.mdx#revoking-capabilities",children:"revoke capabilities"})," they have created by using the ",e.jsx(t.code,{children:"delete"})," method on the Capability Controller that was created for the capability when it was issued."]}),`
`,e.jsx(t.p,{children:"Additionally, if the referenced object in storage is moved, capabilities that have been created from that storage path are invalidated."}),`
`,e.jsx(t.h2,{id:"reviewing-capabilities",children:"Reviewing capabilities"}),`
`,e.jsx(t.p,{children:"This tutorial expanded on the idea of resources in Cadence by expanding access scope to a resource using capabilities and covering more account storage API use cases."}),`
`,e.jsxs(t.p,{children:["You deployed a smart contract with a resource, then created a capability to grant access to that resource. With the capability, you used the ",e.jsx(t.code,{children:"borrow"})," method in a script to create a reference to the capability. You then used the reference to call the resource's ",e.jsx(t.code,{children:"hello()"})," function. This is important because scripts cannot access account storage without using capabilities."]}),`
`,e.jsx(t.p,{children:"Now that you have completed the tutorial, you should be able to:"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["Interact with ",e.jsx(t.a,{href:"../language/resources.mdx",children:"resources"})," created using transactions."]}),`
`,e.jsxs(t.li,{children:["Write transactions to create ",e.jsx(t.a,{href:"../language/capabilities.md",children:"capabilities"})," to extend resource access scope from the owner to anyone (",e.jsx(t.code,{children:"public"}),")."]}),`
`,e.jsx(t.li,{children:"Write and execute a script that interacts with the resource through the capability."}),`
`]}),`
`,e.jsxs(t.p,{children:["You're on the right track to building more complex applications with Cadence. Now is a great time to check out the ",e.jsx(t.a,{href:"../design-patterns.md",children:"Cadence Best Practices document"}),", ",e.jsx(t.a,{href:"../anti-patterns.md",children:"Anti-patterns document"}),", and the first NFT tutorial!"]}),`
`,e.jsx(t.h2,{id:"reference-solution",children:"Reference Solution"}),`
`,e.jsxs(t.p,{children:[`:::warning
You are `,e.jsx(t.strong,{children:"not"})," saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!"]}),`
`,e.jsx(t.p,{children:`Reference solutions are functional, but may not be optimal.
:::`}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"https://play.flow.com/6f74fe85-465d-4e4f-a534-1895f6a3c0a6",children:"Reference Solution"})}),`
`]}),`
`]})}function h(i={}){const{wrapper:t}=i.components||{};return t?e.jsx(t,{...i,children:e.jsx(s,{...i})}):s(i)}export{c as _markdown,h as default,o as frontmatter,l as structuredData,r as toc};
