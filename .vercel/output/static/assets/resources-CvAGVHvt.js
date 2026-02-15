import{j as e}from"./main-BXy83AsK.js";let a=`

<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
  <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} src="https://www.youtube.com/embed/oHo6-bnb97Y" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
</div>

This tutorial builds your understanding of [accounts] and how to interact with them by introducing [resources]. Resources are a special type found in Cadence that are used for any virtual items, properties, or any other sort of data that are **owned** by an account. They can **only exist in one place at a time**, which means they can be moved or borrowed, but they **cannot be copied**.

Working with resources requires you to take a few more steps to complete some tasks, but this level of explicit control makes it nearly impossible to accidentally duplicate, break, or burn an asset.

Objectives [#objectives]

After completing this tutorial, you'll be able to:

* Instantiate a \`resource\` in a smart contract with the \`create\` keyword.
* Save, move, and load resources using the [Account Storage API] and the [move operator] (\`<-\`).
* Use [\`borrow\`] to access and use a function in a resource.
* Use the \`prepare\` phase of a transaction to load resources from account storage.
* Set and use variables in both the \`prepare\` and \`execute\` phase.
* Use the [nil-coalescing operator (\`??\`)] to \`panic\` if a resource is not found.

Resources [#resources]

[Resources] are one of the most important and unique features in Cadence. They're a composite type, like a struct or a class in other languages, but with some special rules designed to avoid many of the traditional dangers in smart contract development. The short version is that resources can only exist in one location at a time — they cannot be copied, duplicated, or have multiple references.

Here is an example definition of a resource:

\`\`\`cadence
access(all) resource Money {
    access(all) let balance: Int

    init() {
        self.balance = 0
    }
}
\`\`\`

As you can see, it looks just like a regular \`struct\` definition. The difference, however, is in the behavior.

Resources are useful when you want to model **direct ownership** of an asset or an object. By **direct ownership**, we mean the ability to own an **actual object** in **your storage** that represents your asset, instead of just a password or certificate that allows you to access it somewhere else.

Traditional structs or classes from other conventional programming languages are not an ideal way to represent direct ownership because they can be **copied**. This means that a coding error can easily result in creating multiple copies of the same asset, which breaks the scarcity requirements needed for these assets to have real value.

We must consider loss and theft at the scale of a house, a car, a bank account, or even a horse. It's worth a little bit of extra code to avoid accidentally duplicating ownership of one of these properties!

Resources solve this problem by making creation, destruction, and movement of assets explicit.

Implementing a contract with resources [#implementing-a-contract-with-resources]

Open the starter code for this tutorial in the Flow Playground at [play.flow.com/b999f656-5c3e-49fa-96f2-5b0a4032f4f1].

The \`HelloResource.cdc\` file contains the following code:

\`\`\`cadence HelloResource.cdc
access(all) contract HelloResource {
  // TODO
}
\`\`\`

Defining a resource [#defining-a-resource]

Similar to other languages, Cadence can declare type definitions within deployed contracts. A type definition is simply a description of how a particular set of data is organized. It **is not** a copy or instance of that data on its own.

Any account can import these definitions to interact with objects of those types.

The key difference between a \`resource\` and a \`struct\` or \`class\` is the access scope for resources:

* Each instance of a resource can only exist in exactly one *location* and cannot be copied.
  * Here, location refers to account storage, a temporary variable in a function, a storage field in a contract, and so on.
* Resources must be explicitly moved from one location to another when accessed.
* Resources also cannot go out of scope at the end of function execution. They must be explicitly stored somewhere or explicitly destroyed.
* A resource can only be created in the scope that it is defined in.
  * This prevents anyone from being able to create arbitrary amounts of resource objects that others have defined.

These characteristics make it impossible to accidentally lose a resource from a coding mistake.

Add a \`resource\` called \`HelloAsset\` that contains a function to return a string containing "Hello Resources!":

\`\`\`cadence HelloResource.cdc
access(all) contract HelloResource {
    access(all) resource HelloAsset {
        // A transaction can call this function to get the "Hello Resources!"
        // message from the resource.
        access(all) view fun hello(): String {
            return "Hello Resources!"
        }
    }
}
\`\`\`

A few notes on this function:

* \`access(all)\` makes the function publicly accessible.
* \`view\` indicates that the function does not modify state.
* The function return type is a \`String\`.
* The function is **not** present on the contract itself and cannot be called by interacting with the contract.

:::warning
If you're used to Solidity, you'll want to take note that the \`view\` keyword in Cadence is used in the same cases as both \`view\` and \`pure\` in Solidity.
:::

Creating a resource [#creating-a-resource]

The following steps show you how to create a resource with the \`create\` keyword and the [move operator] (\`<-\`).

You use the \`create\` keyword to initialize a resource. Resources can only be created by the contract that defines them and **must** be created before they can be used.

The move operator \`<-\` is used to move a resource — you cannot use the assignment operator \`=\`. When you initialize them or assign then to a new variable, you use the move operator \`<-\` to **literally move** the resource from one location to another. The old variable or location that was holding it will no longer be valid after the move.

1. Create a resource called \`first_resource\`:
   \`\`\`cadence
   // Note the \`@\` symbol to specify that it is a resource
   var first_resource: @AnyResource <- create AnyResource()
   \`\`\`
2. Move the resource:
   \`\`\`cadence
   var second_resource <- first_resource
   \`\`\`
   The name \`first_resource\` is **no longer valid or usable**:
   \`\`\`cadence
   // Bad code, will generate an error
   var third_resource <- first_resource
   \`\`\`
3. Add a function called \`createHelloAsset\` that creates and returns a \`HelloAsset\` resource:
   \`\`\`cadence HelloResource.cdc
   access(all) fun createHelloAsset(): @HelloAsset {
       return <-create HelloAsset()
   }
   \`\`\`
   * Unlike the \`hello()\` function, this function **does** exist on the contract and can be called directly. Doing so creates an instance of the \`HelloAsset\` resource, **moves** it through the \`return\` of the function to the location calling the function — the same as you'd expect for other languages.
   * Remember, when resources are referenced, the \`@\` symbol is placed at the beginning. In the function above, the return type is a resource of the \`HelloAsset\` type.
4. Deploy this code to account \`0x06\` by clicking the \`Deploy\` button.

Creating a Hello transaction [#creating-a-hello-transaction]

The following shows you how to create a transaction that calls the \`createHelloAsset()\` function and saves a \`HelloAsset\` resource to the account's storage.

Open the transaction named \`Create Hello\`, which contains the following code:

\`\`\`cadence create_hello.cdc
import HelloResource from 0x06

transaction {
  // TODO
}
\`\`\`

We've already imported the \`HelloResource\` contract for you and stubbed out a \`transaction\`. Unlike the transaction in Hello World, you will need to modify the user's account, which means you will need to use the \`prepare\` phase to access and modify the account that is going to get an instance of the resource.

Prepare phase [#prepare-phase]

To prepare:

1. Create a \`prepare\` phase with the \`SaveValue\` authorization [entitlement] to the user's account. This authorizes the transaction to save values or objects anywhere in account storage.  You'll learn more about entitlements in the next lesson.

2. Use \`create\` to create a new instance of the \`HelloAsset\`.

3. Save the new resource in the user's account.

4. Inside the \`transaction\`, stub out the \`prepare\` phase with the authorization [entitlement]:

   \`\`\`cadence
   import HelloResource from 0x06

   transaction {
     prepare(acct: auth(SaveValue) &Account) {
       // TODO
     }
   }
   \`\`\`

5. Use the \`createHelloAsset\` function in \`HelloResource\` to \`create\` an instance of the resource inside of the \`prepeare\` and *move* it into a constant:
   \`\`\`cadence
   let newHello <- HelloResource.createHelloAsset()
   \`\`\`

You'll get an error for \`loss of resource\`, which is one of the best features of Cadence! The language **prevents you from accidentally destroying a resource** at the syntax level.

Storage paths [#storage-paths]

In Cadence Accounts, objects are stored in [paths]. Paths represent a file system for user accounts, where an object can be stored at any user-defined path. Usually, contracts will specify for the user where objects from that contract should be stored. This enables any code to know how to access these objects in a standard way.

Paths start with the character \`/\`, followed by the domain, the path separator \`/\`, and finally the identifier. The identifier must start with a letter and can only be followed by letters, numbers, or the underscore \`_\`. For example, the path \`/storage/test\` has the domain \`storage\` and the identifier \`test\`.

There are two valid domains: \`storage\` and \`public\`.

Paths in the storage domain have type \`StoragePath\`, and paths in the public domain have the type \`PublicPath\`. Both \`StoragePath\` and \`PublicPath\` are subtypes of \`Path\`.

Paths are **not** strings and do **not** have quotes around them.

Next, use the account reference with the \`SaveValue\` authorization [entitlement] to move the new resource into storage located in \`/storage/HelloAssetTutorial\`:

\`\`\`cadence
acct.storage.save(<-newHello, to: /storage/HelloAssetTutorial)
\`\`\`

The first parameter in \`save\` is the object that is being stored, and the \`to\` parameter is the path that the object is being stored at. The path must be a storage path, so only the domain \`/storage/\` is allowed in the \`to\` parameter.

Notice that the error for \`loss of resource\` has been resolved.

If there is already an object stored under the given path, the program aborts. Remember, the Cadence type system ensures that a resource can never be accidentally lost. When moving a resource to a field, into an array, into a dictionary, or into storage, there is the possibility that the location already contains a resource.

Cadence forces the developer to explicitly handle the case of an existing resource so that it is not accidentally lost through an overwrite.

It is also very important when choosing the name of your paths to pick an identifier that is very specific and unique to your project.

Currently, account storage paths are global, so there is a chance that projects could use the same storage paths, **which could cause path conflicts**! This could be a headache for you, so choose unique path names to avoid this problem.

Execute phase [#execute-phase]

Use the \`execute\` phase to \`log\` a message that the resource was successfully saved:

\`\`\`cadence
execute {
    log("Saved Hello Resource to account.")
}
\`\`\`

We'll learn more realistic uses of this phase soon.

You should have something similar to:

\`\`\`cadence
import HelloResource from 0x06

transaction {
        prepare(acct: auth(SaveValue) &Account) {
        let newHello <- HelloResource.createHelloAsset()
        acct.storage.save(<-newHello, to: /storage/HelloAssetTutorial)
    }

	execute {
        log("Saved Hello Resource to account.")
	}
}
\`\`\`

This is our first transaction using the \`prepare\` phase!

The \`prepare\` phase is the only place that has access to the signing account, via [account references (\`&Account\`)].

Account references have access to many different methods that are used to interact with an account, such as to \`save\` a resource to the account's storage.

By not allowing the execute phase to access account storage and using entitlements, we can statically verify which assets and areas/paths of the signers' account a given transaction can modify.

Browser wallets and applications that submit transactions for users can use this to show what a transaction could alter, giving users information about transactions that wallets will be executing for them, and confidence that they aren't getting fed a malicious or dangerous transaction from an app or wallet.

To execute:

1. Select account \`0x06\` as the only signer.
2. Click the \`Send\` button to submit the transaction.
   *You'll see in the log:*
   \`\`\`text
   "Saved Hello Resource to account."
   \`\`\`
3. Use \`Send\` to send the transaction again from account \`0x06\`
   *You'll now get an error, because there's already a resource in \`/storage/HelloAssetTutorial\`:*
   \`\`\`text
   execution error code 1: [Error Code: 1101] error caused by: 1 error occurred:
      * transaction execute failed: [Error Code: 1101] cadence runtime error: Execution failed:
   error: failed to save object: path /storage/HelloAssetTutorial in account 0x0000000000000009 already stores an object
     --> 805f4e247a920635abf91969b95a63964dcba086bc364aedc552087334024656:19:8
      |
   19 |         acct.storage.save(<-newHello, to: /storage/HelloAssetTutorial)
      |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   \`\`\`
4. Remove the line of code that saves \`newHello\` to storage.
   * Again, you'll get an error for \`newHello\` that says \`loss of resource\`. This means that you are not handling the resource properly. Remember that if you ever see this error in any of your programs, it means there is a resource somewhere that is not being explicitly stored or destroyed. **Add the line back before you forget!**

Review storage [#review-storage]

Now that you have executed the transaction, account \`0x06\` has the newly created \`HelloWorld.HelloAsset\` resource stored in its storage. You can verify this by clicking on account \`0x06\` on the bottom left. This opens a view of the different contracts and objects in the account.

The resource you created appears in Account Storage:

\`\`\`
{
    "value": [
        {
            "key": {
                "value": "value",
                "type": "String"
            },
            "value": {
                "value": {
                    "id": "A.0000000000000006.HelloResource.HelloAsset",
                    "fields": [
                        {
                            "value": {
                                "value": "269380348805120",
                                "type": "UInt64"
                            },
                            "name": "uuid"
                        }
                    ]
                },
                "type": "Resource"
            }
        },
        {
            "key": {
                "value": "type",
                "type": "String"
            },
            "value": {
                "value": "A.0000000000000006.HelloResource.HelloAsset",
                "type": "String"
            }
        },
        {
            "key": {
                "value": "path",
                "type": "String"
            },
            "value": {
                "value": {
                    "domain": "storage",
                    "identifier": "HelloAssetTutorial"
                },
                "type": "Path"
            }
        }
    ],
    "type": "Dictionary"
}
\`\`\`

You'll also see \`FlowToken\` objects and the \`HelloResource\` Contract.

Run the transaction from account \`0x07\` and compare the differences between the accounts.

Check for existing storage [#check-for-existing-storage]

In real applications, you need to check the location path you are storing in to make sure both cases are handled properly.

1. Update the authorization [entitlement] in the prepare phase to include \`BorrowValue\`:
   \`\`\`cadence
   prepare(acct: auth(BorrowValue, SaveValue) &Account) {
       // Existing code...
   }
   \`\`\`
   This [entitlement] makes it so you can borrow a reference to a value in the account's storage in addition to being able to save a value.

2. Add a \`transaction\`-level (similar to contract-level or class-level) variable to store a result \`String\`.

   * Similar to a class-level variable in other languages, these go at the top, inside the \`transaction\` scope, but not inside anything else. They are accessible in both the \`prepare\` and \`execute\` statements of a transaction:

   \`\`\`cadence
   import HelloResource from 0x06

   transaction {
       var result: String
       // Other code...
   }
   \`\`\`

   * You'll get an error: \`missing initialization of field 'result' in type 'Transaction'. not initialized\`
   * In transactions, variables at the \`transaction\` level must be initialized in the \`prepare\` phase.

3. Initialize the \`result\` message and create a constant for the storage path:
   \`\`\`cadence
   self.result = "Saved Hello Resource to account."
   let storagePath = /storage/HelloAssetTutorial
   \`\`\`

:::warning
In Cadence, storage paths are a type. They are **not** \`Strings\` and are not enclosed by quotes.
:::
One way to check whether or not a storage path has an object in it is to use the built-in [\`storage.check\`] function with the type and path. If the result is \`true\`, then there is an object in account storage that matches the type requested. If it's \`false\`, there is not.

:::warning
A response of \`false\` does **not** mean the location is empty. If you ask for an apple and the location contains an orange, this function will return \`false\`.

This is not likely to occur because projects are encouraged to create storage and public paths that are very unique, but is theoretically possible if projects don't follow this best practice or if there is a malicious app that tries to store things in other projects' paths.
:::
Depending on the needs of your app, you'll use this pattern to decide what to do in each case. For this example, we'll simply use it to change the log message if the storage is in use or create and save the \`HelloAsset\` if it is not.

1. Refactor your prepare statement to check and see if the storage path is in use. If it is, update the \`result\` message. Otherwise, create and save a \`HelloAsset\`:

   \`\`\`cadence
   if acct.storage.check<@HelloResource.HelloAsset>(from: storagePath) {
       self.result = "Unable to save, resource already present."
   } else {
       let newHello <- HelloResource.createHelloAsset()
       acct.storage.save(<-newHello, to: storagePath)
   }
   \`\`\`

   * When you \\[\`check\`] a resource, you must put the type of the resource to be borrowed inside the \`<>\` after the call to \`borrow\`, before the parentheses. The \`from\` parameter is the storage path to the object you are borrowing.

2. Update the \`log\` in execute to use \`self.result\` instead of the hardcoded string:

   \`\`\`cadence
   execute {
       log(self.result)
   }
   \`\`\`

   You should end up with something similar to:

   \`\`\`cadence
   import HelloResource from 0x06

   transaction {
     var result: String

     prepare(acct: auth(BorrowValue, SaveValue) &Account) {
       self.result = "Saved Hello Resource to account."
       let storagePath = /storage/HelloAssetTutorial

       if acct.storage.check<@HelloResource.HelloAsset>(from: storagePath) {
         self.result = "Unable to save, resource already present."
       } else {
         let newHello <- HelloResource.createHelloAsset()
         acct.storage.save(<-newHello, to: storagePath)
       }
     }

     execute {
       log(self.result)
     }
   }
   \`\`\`

3. Use \`Send\` to send the transaction again, both with accounts that have and have not yet created and stored an instance of \`HelloAsset\`.

Now you'll see an appropriate log whether or not a new resource was created and saved.

Loading a Hello transaction [#loading-a-hello-transaction]

The following shows you how to use a transaction to call the \`hello()\` method from the \`HelloAsset\` resource.

1. Open the transaction named \`Load Hello\`, which is empty.

2. Stub out a transaction that imports \`HelloResource\` and passes in an account [reference] with the \`BorrowValue\` authorization entitlement, which looks something like this:

   \`\`\`cadence load_hello.cdc
   import HelloResource from 0x06

   transaction {

       prepare(acct: auth(BorrowValue) &Account) {
           // TODO
       }
   }
   \`\`\`

   * You just learned how to [\`borrow\`] a [reference] to a resource. You could use an \`if\` statement to handle the possibility that the resource isn't there, but if you want to simply terminate execution, a common practice is to combine a \`panic\` statement with the [nil-coalescing operator (\`??\`)].
   * This operator executes the statement on the left side. If that is \`nil\`, the right side is evaluated and returned. In this case, the return is irrelevant, because we're going to cause a \`panic\` and terminate execution.

3. Create a variable with a [reference] to the \`HelloAsset\` resource stored in the user's account. Use \`panic\` if this resource is not found:
   \`\`\`cadence
   let helloAsset = acct.storage.borrow<&HelloResource.HelloAsset>(from: /storage/HelloAssetTutorial)
       ?? panic("The signer does not have the HelloAsset resource stored at /storage/HelloAssetTutorial. Run the \`Create Hello\` Transaction to store the resource")
   \`\`\`

4. Use \`log\` to log the return from a call to the \`hello()\` function.

:::danger
Borrowing a [reference] does **not** allow you to move or destroy a resource, but it **does allow** you to mutate data inside that resource via one of the resource's functions.
:::
Your transaction should be similar to:

\`\`\`cadence
import HelloResource from 0x06

transaction {
    prepare(acct: auth(BorrowValue, LoadValue, SaveValue) &Account) {
        let helloAsset = acct.storage.borrow<&HelloResource.HelloAsset>(from: /storage/HelloAssetTutorial)
            ?? panic("The signer does not have the HelloAsset resource stored at /storage/HelloAssetTutorial. Run the \`Create Hello\` Transaction again to store the resource")

        log(helloAsset.hello())
    }
}
\`\`\`

In Cadence, we have the resources to leave very detailed error messages. Check out the error messages in the [Non-Fungible Token Contract] and [Generic NFT Transfer transaction] in the Flow NFT GitHub repo for examples of production error messages.

Test your transaction with several accounts to evaluate all possible cases.

Reviewing the resource contract [#reviewing-the-resource-contract]

In this tutorial you learned how to \`create\` [resources] in Cadence. You implemented a smart contract that is accessible in all scopes. The smart contract has a resource declared that implemented a function called \`hello()\`, that returns the string \`"Hello, World!"\`. It also declares a function that can create a resource.

Next, you implemented a transaction to create the resource and save it in the account calling it.

Finally, you used a transaction to [borrow] a [reference] to the \`HelloAsset\` resource from account storage and call the \`hello\` method

Now that you have completed the tutorial, you can:

* Instantiate a \`resource\` in a smart contract with the \`create\` keyword.
* Save, move, and load resources using the [Account Storage API] and the [move operator] (\`<-\`).
* Use [\`borrow\`] to access and use a function in a resource.
* Use the \`prepare\` phase of a transaction to load resources from account storage.
* Set and use variables in both the \`prepare\` and \`execute\` phase.
* Use the [nil-coalescing operator (\`??\`)] to \`panic\` if a resource is not found.

Reference Solution [#reference-solution]

:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!

Reference solutions are functional, but may not be optimal.
:::

* [Reference Solution]

{/* Relative links.  Will not render on the page */}

[resources]: ../language/resources.mdx

[Resources]: ../language/resources.mdx

[move operator]: ../language/operators/assign-move-force-swap.md#move-operator--

[Account Storage API]: ../language/accounts/storage.mdx

[\`storage.check\`]: ../language/accounts/storage.mdx#accountstorage

[\`borrow\`]: ../language/accounts/storage.mdx#accessing-objects

[borrow]: ../language/accounts/storage.mdx#accessing-objects

[entitlement]: ../language/access-control#entitlements

[account references (\`&Account\`)]: ../language/accounts/index.mdx

[paths]: ../language/accounts/paths.mdx

[accounts]: ../language/accounts/index.mdx

[reference]: ../language/references.mdx

[nil-coalescing operator (\`??\`)]: ../language/operators/optional-operators.md#nil-coalescing-operator-

[Non-Fungible Token Contract]: https://github.com/onflow/flow-nft/blob/master/contracts/NonFungibleToken.cdc#L115-L121

[Generic NFT Transfer transaction]: https://github.com/onflow/flow-nft/blob/master/transactions/generic_transfer_with_address_and_type.cdc#L46-L50

[Reference Solution]: https://play.flow.com/8b28da4e-0235-499f-8653-1f55e1b3b725

[play.flow.com/b999f656-5c3e-49fa-96f2-5b0a4032f4f1]: https://play.flow.com/b999f656-5c3e-49fa-96f2-5b0a4032f4f1
`,r={title:"Resources and the Move (<-) Operator",description:"An introduction to resources, capabilities, and account storage in Cadence"},o={contents:[{heading:void 0,content:"This tutorial builds your understanding of [accounts] and how to interact with them by introducing [resources]. Resources are a special type found in Cadence that are used for any virtual items, properties, or any other sort of data that are **owned** by an account. They can **only exist in one place at a time**, which means they can be moved or borrowed, but they **cannot be copied**."},{heading:void 0,content:"Working with resources requires you to take a few more steps to complete some tasks, but this level of explicit control makes it nearly impossible to accidentally duplicate, break, or burn an asset."},{heading:"objectives",content:"After completing this tutorial, you'll be able to:"},{heading:"objectives",content:"Instantiate a `resource` in a smart contract with the `create` keyword."},{heading:"objectives",content:"Save, move, and load resources using the [Account Storage API] and the [move operator] (`<-`)."},{heading:"objectives",content:"Use [`borrow`] to access and use a function in a resource."},{heading:"objectives",content:"Use the `prepare` phase of a transaction to load resources from account storage."},{heading:"objectives",content:"Set and use variables in both the `prepare` and `execute` phase."},{heading:"objectives",content:"Use the [nil-coalescing operator (`??`)] to `panic` if a resource is not found."},{heading:"resources",content:"[Resources] are one of the most important and unique features in Cadence. They're a composite type, like a struct or a class in other languages, but with some special rules designed to avoid many of the traditional dangers in smart contract development. The short version is that resources can only exist in one location at a time — they cannot be copied, duplicated, or have multiple references."},{heading:"resources",content:"Here is an example definition of a resource:"},{heading:"resources",content:"As you can see, it looks just like a regular `struct` definition. The difference, however, is in the behavior."},{heading:"resources",content:"Resources are useful when you want to model **direct ownership** of an asset or an object. By **direct ownership**, we mean the ability to own an **actual object** in **your storage** that represents your asset, instead of just a password or certificate that allows you to access it somewhere else."},{heading:"resources",content:"Traditional structs or classes from other conventional programming languages are not an ideal way to represent direct ownership because they can be **copied**. This means that a coding error can easily result in creating multiple copies of the same asset, which breaks the scarcity requirements needed for these assets to have real value."},{heading:"resources",content:"We must consider loss and theft at the scale of a house, a car, a bank account, or even a horse. It's worth a little bit of extra code to avoid accidentally duplicating ownership of one of these properties!"},{heading:"resources",content:"Resources solve this problem by making creation, destruction, and movement of assets explicit."},{heading:"implementing-a-contract-with-resources",content:"Open the starter code for this tutorial in the Flow Playground at [play.flow.com/b999f656-5c3e-49fa-96f2-5b0a4032f4f1]."},{heading:"implementing-a-contract-with-resources",content:"The `HelloResource.cdc` file contains the following code:"},{heading:"defining-a-resource",content:"Similar to other languages, Cadence can declare type definitions within deployed contracts. A type definition is simply a description of how a particular set of data is organized. It **is not** a copy or instance of that data on its own."},{heading:"defining-a-resource",content:"Any account can import these definitions to interact with objects of those types."},{heading:"defining-a-resource",content:"The key difference between a `resource` and a `struct` or `class` is the access scope for resources:"},{heading:"defining-a-resource",content:"Each instance of a resource can only exist in exactly one *location* and cannot be copied."},{heading:"defining-a-resource",content:"Here, location refers to account storage, a temporary variable in a function, a storage field in a contract, and so on."},{heading:"defining-a-resource",content:"Resources must be explicitly moved from one location to another when accessed."},{heading:"defining-a-resource",content:"Resources also cannot go out of scope at the end of function execution. They must be explicitly stored somewhere or explicitly destroyed."},{heading:"defining-a-resource",content:"A resource can only be created in the scope that it is defined in."},{heading:"defining-a-resource",content:"This prevents anyone from being able to create arbitrary amounts of resource objects that others have defined."},{heading:"defining-a-resource",content:"These characteristics make it impossible to accidentally lose a resource from a coding mistake."},{heading:"defining-a-resource",content:'Add a `resource` called `HelloAsset` that contains a function to return a string containing "Hello Resources!":'},{heading:"defining-a-resource",content:"A few notes on this function:"},{heading:"defining-a-resource",content:"`access(all)` makes the function publicly accessible."},{heading:"defining-a-resource",content:"`view` indicates that the function does not modify state."},{heading:"defining-a-resource",content:"The function return type is a `String`."},{heading:"defining-a-resource",content:"The function is **not** present on the contract itself and cannot be called by interacting with the contract."},{heading:"defining-a-resource",content:":::warning\nIf you're used to Solidity, you'll want to take note that the `view` keyword in Cadence is used in the same cases as both `view` and `pure` in Solidity.\n:::"},{heading:"creating-a-resource",content:"The following steps show you how to create a resource with the `create` keyword and the [move operator] (`<-`)."},{heading:"creating-a-resource",content:"You use the `create` keyword to initialize a resource. Resources can only be created by the contract that defines them and **must** be created before they can be used."},{heading:"creating-a-resource",content:"The move operator `<-` is used to move a resource — you cannot use the assignment operator `=`. When you initialize them or assign then to a new variable, you use the move operator `<-` to **literally move** the resource from one location to another. The old variable or location that was holding it will no longer be valid after the move."},{heading:"creating-a-resource",content:"Create a resource called `first_resource`:"},{heading:"creating-a-resource",content:"Move the resource:"},{heading:"creating-a-resource",content:"The name `first_resource` is **no longer valid or usable**:"},{heading:"creating-a-resource",content:"Add a function called `createHelloAsset` that creates and returns a `HelloAsset` resource:"},{heading:"creating-a-resource",content:"Unlike the `hello()` function, this function **does** exist on the contract and can be called directly. Doing so creates an instance of the `HelloAsset` resource, **moves** it through the `return` of the function to the location calling the function — the same as you'd expect for other languages."},{heading:"creating-a-resource",content:"Remember, when resources are referenced, the `@` symbol is placed at the beginning. In the function above, the return type is a resource of the `HelloAsset` type."},{heading:"creating-a-resource",content:"Deploy this code to account `0x06` by clicking the `Deploy` button."},{heading:"creating-a-hello-transaction",content:"The following shows you how to create a transaction that calls the `createHelloAsset()` function and saves a `HelloAsset` resource to the account's storage."},{heading:"creating-a-hello-transaction",content:"Open the transaction named `Create Hello`, which contains the following code:"},{heading:"creating-a-hello-transaction",content:"We've already imported the `HelloResource` contract for you and stubbed out a `transaction`. Unlike the transaction in Hello World, you will need to modify the user's account, which means you will need to use the `prepare` phase to access and modify the account that is going to get an instance of the resource."},{heading:"prepare-phase",content:"To prepare:"},{heading:"prepare-phase",content:"Create a `prepare` phase with the `SaveValue` authorization [entitlement] to the user's account. This authorizes the transaction to save values or objects anywhere in account storage.  You'll learn more about entitlements in the next lesson."},{heading:"prepare-phase",content:"Use `create` to create a new instance of the `HelloAsset`."},{heading:"prepare-phase",content:"Save the new resource in the user's account."},{heading:"prepare-phase",content:"Inside the `transaction`, stub out the `prepare` phase with the authorization [entitlement]:"},{heading:"prepare-phase",content:"Use the `createHelloAsset` function in `HelloResource` to `create` an instance of the resource inside of the `prepeare` and *move* it into a constant:"},{heading:"prepare-phase",content:"You'll get an error for `loss of resource`, which is one of the best features of Cadence! The language **prevents you from accidentally destroying a resource** at the syntax level."},{heading:"storage-paths",content:"In Cadence Accounts, objects are stored in [paths]. Paths represent a file system for user accounts, where an object can be stored at any user-defined path. Usually, contracts will specify for the user where objects from that contract should be stored. This enables any code to know how to access these objects in a standard way."},{heading:"storage-paths",content:"Paths start with the character `/`, followed by the domain, the path separator `/`, and finally the identifier. The identifier must start with a letter and can only be followed by letters, numbers, or the underscore `_`. For example, the path `/storage/test` has the domain `storage` and the identifier `test`."},{heading:"storage-paths",content:"There are two valid domains: `storage` and `public`."},{heading:"storage-paths",content:"Paths in the storage domain have type `StoragePath`, and paths in the public domain have the type `PublicPath`. Both `StoragePath` and `PublicPath` are subtypes of `Path`."},{heading:"storage-paths",content:"Paths are **not** strings and do **not** have quotes around them."},{heading:"storage-paths",content:"Next, use the account reference with the `SaveValue` authorization [entitlement] to move the new resource into storage located in `/storage/HelloAssetTutorial`:"},{heading:"storage-paths",content:"The first parameter in `save` is the object that is being stored, and the `to` parameter is the path that the object is being stored at. The path must be a storage path, so only the domain `/storage/` is allowed in the `to` parameter."},{heading:"storage-paths",content:"Notice that the error for `loss of resource` has been resolved."},{heading:"storage-paths",content:"If there is already an object stored under the given path, the program aborts. Remember, the Cadence type system ensures that a resource can never be accidentally lost. When moving a resource to a field, into an array, into a dictionary, or into storage, there is the possibility that the location already contains a resource."},{heading:"storage-paths",content:"Cadence forces the developer to explicitly handle the case of an existing resource so that it is not accidentally lost through an overwrite."},{heading:"storage-paths",content:"It is also very important when choosing the name of your paths to pick an identifier that is very specific and unique to your project."},{heading:"storage-paths",content:"Currently, account storage paths are global, so there is a chance that projects could use the same storage paths, **which could cause path conflicts**! This could be a headache for you, so choose unique path names to avoid this problem."},{heading:"execute-phase",content:"Use the `execute` phase to `log` a message that the resource was successfully saved:"},{heading:"execute-phase",content:"We'll learn more realistic uses of this phase soon."},{heading:"execute-phase",content:"You should have something similar to:"},{heading:"execute-phase",content:"This is our first transaction using the `prepare` phase!"},{heading:"execute-phase",content:"The `prepare` phase is the only place that has access to the signing account, via [account references (`&Account`)]."},{heading:"execute-phase",content:"Account references have access to many different methods that are used to interact with an account, such as to `save` a resource to the account's storage."},{heading:"execute-phase",content:"By not allowing the execute phase to access account storage and using entitlements, we can statically verify which assets and areas/paths of the signers' account a given transaction can modify."},{heading:"execute-phase",content:"Browser wallets and applications that submit transactions for users can use this to show what a transaction could alter, giving users information about transactions that wallets will be executing for them, and confidence that they aren't getting fed a malicious or dangerous transaction from an app or wallet."},{heading:"execute-phase",content:"To execute:"},{heading:"execute-phase",content:"Select account `0x06` as the only signer."},{heading:"execute-phase",content:"Click the `Send` button to submit the transaction.\n&#x2A;You'll see in the log:*"},{heading:"execute-phase",content:"Use `Send` to send the transaction again from account `0x06`\n&#x2A;You'll now get an error, because there's already a resource in `/storage/HelloAssetTutorial`:*"},{heading:"execute-phase",content:"Remove the line of code that saves `newHello` to storage."},{heading:"execute-phase",content:"Again, you'll get an error for `newHello` that says `loss of resource`. This means that you are not handling the resource properly. Remember that if you ever see this error in any of your programs, it means there is a resource somewhere that is not being explicitly stored or destroyed. &#x2A;*Add the line back before you forget!**"},{heading:"review-storage",content:"Now that you have executed the transaction, account `0x06` has the newly created `HelloWorld.HelloAsset` resource stored in its storage. You can verify this by clicking on account `0x06` on the bottom left. This opens a view of the different contracts and objects in the account."},{heading:"review-storage",content:"The resource you created appears in Account Storage:"},{heading:"review-storage",content:"You'll also see `FlowToken` objects and the `HelloResource` Contract."},{heading:"review-storage",content:"Run the transaction from account `0x07` and compare the differences between the accounts."},{heading:"check-for-existing-storage",content:"In real applications, you need to check the location path you are storing in to make sure both cases are handled properly."},{heading:"check-for-existing-storage",content:"Update the authorization [entitlement] in the prepare phase to include `BorrowValue`:"},{heading:"check-for-existing-storage",content:"This [entitlement] makes it so you can borrow a reference to a value in the account's storage in addition to being able to save a value."},{heading:"check-for-existing-storage",content:"Add a `transaction`-level (similar to contract-level or class-level) variable to store a result `String`."},{heading:"check-for-existing-storage",content:"Similar to a class-level variable in other languages, these go at the top, inside the `transaction` scope, but not inside anything else. They are accessible in both the `prepare` and `execute` statements of a transaction:"},{heading:"check-for-existing-storage",content:"You'll get an error: `missing initialization of field 'result' in type 'Transaction'. not initialized`"},{heading:"check-for-existing-storage",content:"In transactions, variables at the `transaction` level must be initialized in the `prepare` phase."},{heading:"check-for-existing-storage",content:"Initialize the `result` message and create a constant for the storage path:"},{heading:"check-for-existing-storage",content:":::warning\nIn Cadence, storage paths are a type. They are **not** `Strings` and are not enclosed by quotes.\n:::\nOne way to check whether or not a storage path has an object in it is to use the built-in [`storage.check`] function with the type and path. If the result is `true`, then there is an object in account storage that matches the type requested. If it's `false`, there is not."},{heading:"check-for-existing-storage",content:":::warning\nA response of `false` does **not** mean the location is empty. If you ask for an apple and the location contains an orange, this function will return `false`."},{heading:"check-for-existing-storage",content:"This is not likely to occur because projects are encouraged to create storage and public paths that are very unique, but is theoretically possible if projects don't follow this best practice or if there is a malicious app that tries to store things in other projects' paths.\n:::\nDepending on the needs of your app, you'll use this pattern to decide what to do in each case. For this example, we'll simply use it to change the log message if the storage is in use or create and save the `HelloAsset` if it is not."},{heading:"check-for-existing-storage",content:"Refactor your prepare statement to check and see if the storage path is in use. If it is, update the `result` message. Otherwise, create and save a `HelloAsset`:"},{heading:"check-for-existing-storage",content:"When you \\[`check`] a resource, you must put the type of the resource to be borrowed inside the `<>` after the call to `borrow`, before the parentheses. The `from` parameter is the storage path to the object you are borrowing."},{heading:"check-for-existing-storage",content:"Update the `log` in execute to use `self.result` instead of the hardcoded string:"},{heading:"check-for-existing-storage",content:"You should end up with something similar to:"},{heading:"check-for-existing-storage",content:"Use `Send` to send the transaction again, both with accounts that have and have not yet created and stored an instance of `HelloAsset`."},{heading:"check-for-existing-storage",content:"Now you'll see an appropriate log whether or not a new resource was created and saved."},{heading:"loading-a-hello-transaction",content:"The following shows you how to use a transaction to call the `hello()` method from the `HelloAsset` resource."},{heading:"loading-a-hello-transaction",content:"Open the transaction named `Load Hello`, which is empty."},{heading:"loading-a-hello-transaction",content:"Stub out a transaction that imports `HelloResource` and passes in an account [reference] with the `BorrowValue` authorization entitlement, which looks something like this:"},{heading:"loading-a-hello-transaction",content:"You just learned how to [`borrow`] a [reference] to a resource. You could use an `if` statement to handle the possibility that the resource isn't there, but if you want to simply terminate execution, a common practice is to combine a `panic` statement with the [nil-coalescing operator (`??`)]."},{heading:"loading-a-hello-transaction",content:"This operator executes the statement on the left side. If that is `nil`, the right side is evaluated and returned. In this case, the return is irrelevant, because we're going to cause a `panic` and terminate execution."},{heading:"loading-a-hello-transaction",content:"Create a variable with a [reference] to the `HelloAsset` resource stored in the user's account. Use `panic` if this resource is not found:"},{heading:"loading-a-hello-transaction",content:"Use `log` to log the return from a call to the `hello()` function."},{heading:"loading-a-hello-transaction",content:`:::danger
Borrowing a [reference] does **not** allow you to move or destroy a resource, but it **does allow** you to mutate data inside that resource via one of the resource's functions.
:::
Your transaction should be similar to:`},{heading:"loading-a-hello-transaction",content:"In Cadence, we have the resources to leave very detailed error messages. Check out the error messages in the [Non-Fungible Token Contract] and [Generic NFT Transfer transaction] in the Flow NFT GitHub repo for examples of production error messages."},{heading:"loading-a-hello-transaction",content:"Test your transaction with several accounts to evaluate all possible cases."},{heading:"reviewing-the-resource-contract",content:'In this tutorial you learned how to `create` [resources] in Cadence. You implemented a smart contract that is accessible in all scopes. The smart contract has a resource declared that implemented a function called `hello()`, that returns the string `"Hello, World!"`. It also declares a function that can create a resource.'},{heading:"reviewing-the-resource-contract",content:"Next, you implemented a transaction to create the resource and save it in the account calling it."},{heading:"reviewing-the-resource-contract",content:"Finally, you used a transaction to [borrow] a [reference] to the `HelloAsset` resource from account storage and call the `hello` method"},{heading:"reviewing-the-resource-contract",content:"Now that you have completed the tutorial, you can:"},{heading:"reviewing-the-resource-contract",content:"Instantiate a `resource` in a smart contract with the `create` keyword."},{heading:"reviewing-the-resource-contract",content:"Save, move, and load resources using the [Account Storage API] and the [move operator] (`<-`)."},{heading:"reviewing-the-resource-contract",content:"Use [`borrow`] to access and use a function in a resource."},{heading:"reviewing-the-resource-contract",content:"Use the `prepare` phase of a transaction to load resources from account storage."},{heading:"reviewing-the-resource-contract",content:"Set and use variables in both the `prepare` and `execute` phase."},{heading:"reviewing-the-resource-contract",content:"Use the [nil-coalescing operator (`??`)] to `panic` if a resource is not found."},{heading:"reference-solution",content:`:::warning
You are **not** saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!`},{heading:"reference-solution",content:`Reference solutions are functional, but may not be optimal.
:::`},{heading:"reference-solution",content:"[Reference Solution]"}],headings:[{id:"objectives",content:"Objectives"},{id:"resources",content:"Resources"},{id:"implementing-a-contract-with-resources",content:"Implementing a contract with resources"},{id:"defining-a-resource",content:"Defining a resource"},{id:"creating-a-resource",content:"Creating a resource"},{id:"creating-a-hello-transaction",content:"Creating a Hello transaction"},{id:"prepare-phase",content:"Prepare phase"},{id:"storage-paths",content:"Storage paths"},{id:"execute-phase",content:"Execute phase"},{id:"review-storage",content:"Review storage"},{id:"check-for-existing-storage",content:"Check for existing storage"},{id:"loading-a-hello-transaction",content:"Loading a Hello transaction"},{id:"reviewing-the-resource-contract",content:"Reviewing the resource contract"},{id:"reference-solution",content:"Reference Solution"}]};const l=[{depth:2,url:"#objectives",title:e.jsx(e.Fragment,{children:"Objectives"})},{depth:2,url:"#resources",title:e.jsx(e.Fragment,{children:"Resources"})},{depth:2,url:"#implementing-a-contract-with-resources",title:e.jsx(e.Fragment,{children:"Implementing a contract with resources"})},{depth:3,url:"#defining-a-resource",title:e.jsx(e.Fragment,{children:"Defining a resource"})},{depth:3,url:"#creating-a-resource",title:e.jsx(e.Fragment,{children:"Creating a resource"})},{depth:2,url:"#creating-a-hello-transaction",title:e.jsx(e.Fragment,{children:"Creating a Hello transaction"})},{depth:3,url:"#prepare-phase",title:e.jsx(e.Fragment,{children:"Prepare phase"})},{depth:3,url:"#storage-paths",title:e.jsx(e.Fragment,{children:"Storage paths"})},{depth:3,url:"#execute-phase",title:e.jsx(e.Fragment,{children:"Execute phase"})},{depth:3,url:"#review-storage",title:e.jsx(e.Fragment,{children:"Review storage"})},{depth:3,url:"#check-for-existing-storage",title:e.jsx(e.Fragment,{children:"Check for existing storage"})},{depth:2,url:"#loading-a-hello-transaction",title:e.jsx(e.Fragment,{children:"Loading a Hello transaction"})},{depth:2,url:"#reviewing-the-resource-contract",title:e.jsx(e.Fragment,{children:"Reviewing the resource contract"})},{depth:2,url:"#reference-solution",title:e.jsx(e.Fragment,{children:"Reference Solution"})}];function n(i){const s={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",maxWidth:"100%"},children:e.jsx("iframe",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%"},src:"https://www.youtube.com/embed/oHo6-bnb97Y",title:"YouTube video player",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:!0})}),`
`,e.jsxs(s.p,{children:["This tutorial builds your understanding of ",e.jsx(s.a,{href:"../language/accounts/index.mdx",children:"accounts"})," and how to interact with them by introducing ",e.jsx(s.a,{href:"../language/resources.mdx",children:"resources"}),". Resources are a special type found in Cadence that are used for any virtual items, properties, or any other sort of data that are ",e.jsx(s.strong,{children:"owned"})," by an account. They can ",e.jsx(s.strong,{children:"only exist in one place at a time"}),", which means they can be moved or borrowed, but they ",e.jsx(s.strong,{children:"cannot be copied"}),"."]}),`
`,e.jsx(s.p,{children:"Working with resources requires you to take a few more steps to complete some tasks, but this level of explicit control makes it nearly impossible to accidentally duplicate, break, or burn an asset."}),`
`,e.jsx(s.h2,{id:"objectives",children:"Objectives"}),`
`,e.jsx(s.p,{children:"After completing this tutorial, you'll be able to:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Instantiate a ",e.jsx(s.code,{children:"resource"})," in a smart contract with the ",e.jsx(s.code,{children:"create"})," keyword."]}),`
`,e.jsxs(s.li,{children:["Save, move, and load resources using the ",e.jsx(s.a,{href:"../language/accounts/storage.mdx",children:"Account Storage API"})," and the ",e.jsx(s.a,{href:"../language/operators/assign-move-force-swap.md#move-operator--",children:"move operator"})," (",e.jsx(s.code,{children:"<-"}),")."]}),`
`,e.jsxs(s.li,{children:["Use ",e.jsx(s.a,{href:"../language/accounts/storage.mdx#accessing-objects",children:e.jsx(s.code,{children:"borrow"})})," to access and use a function in a resource."]}),`
`,e.jsxs(s.li,{children:["Use the ",e.jsx(s.code,{children:"prepare"})," phase of a transaction to load resources from account storage."]}),`
`,e.jsxs(s.li,{children:["Set and use variables in both the ",e.jsx(s.code,{children:"prepare"})," and ",e.jsx(s.code,{children:"execute"})," phase."]}),`
`,e.jsxs(s.li,{children:["Use the ",e.jsxs(s.a,{href:"../language/operators/optional-operators.md#nil-coalescing-operator-",children:["nil-coalescing operator (",e.jsx(s.code,{children:"??"}),")"]})," to ",e.jsx(s.code,{children:"panic"})," if a resource is not found."]}),`
`]}),`
`,e.jsx(s.h2,{id:"resources",children:"Resources"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.a,{href:"../language/resources.mdx",children:"Resources"})," are one of the most important and unique features in Cadence. They're a composite type, like a struct or a class in other languages, but with some special rules designed to avoid many of the traditional dangers in smart contract development. The short version is that resources can only exist in one location at a time — they cannot be copied, duplicated, or have multiple references."]}),`
`,e.jsx(s.p,{children:"Here is an example definition of a resource:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Money"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" balance: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".balance = "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["As you can see, it looks just like a regular ",e.jsx(s.code,{children:"struct"})," definition. The difference, however, is in the behavior."]}),`
`,e.jsxs(s.p,{children:["Resources are useful when you want to model ",e.jsx(s.strong,{children:"direct ownership"})," of an asset or an object. By ",e.jsx(s.strong,{children:"direct ownership"}),", we mean the ability to own an ",e.jsx(s.strong,{children:"actual object"})," in ",e.jsx(s.strong,{children:"your storage"})," that represents your asset, instead of just a password or certificate that allows you to access it somewhere else."]}),`
`,e.jsxs(s.p,{children:["Traditional structs or classes from other conventional programming languages are not an ideal way to represent direct ownership because they can be ",e.jsx(s.strong,{children:"copied"}),". This means that a coding error can easily result in creating multiple copies of the same asset, which breaks the scarcity requirements needed for these assets to have real value."]}),`
`,e.jsx(s.p,{children:"We must consider loss and theft at the scale of a house, a car, a bank account, or even a horse. It's worth a little bit of extra code to avoid accidentally duplicating ownership of one of these properties!"}),`
`,e.jsx(s.p,{children:"Resources solve this problem by making creation, destruction, and movement of assets explicit."}),`
`,e.jsx(s.h2,{id:"implementing-a-contract-with-resources",children:"Implementing a contract with resources"}),`
`,e.jsxs(s.p,{children:["Open the starter code for this tutorial in the Flow Playground at ",e.jsx(s.a,{href:"https://play.flow.com/b999f656-5c3e-49fa-96f2-5b0a4032f4f1",children:"play.flow.com/b999f656-5c3e-49fa-96f2-5b0a4032f4f1"}),"."]}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:"HelloResource.cdc"})," file contains the following code:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // TODO"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.h3,{id:"defining-a-resource",children:"Defining a resource"}),`
`,e.jsxs(s.p,{children:["Similar to other languages, Cadence can declare type definitions within deployed contracts. A type definition is simply a description of how a particular set of data is organized. It ",e.jsx(s.strong,{children:"is not"})," a copy or instance of that data on its own."]}),`
`,e.jsx(s.p,{children:"Any account can import these definitions to interact with objects of those types."}),`
`,e.jsxs(s.p,{children:["The key difference between a ",e.jsx(s.code,{children:"resource"})," and a ",e.jsx(s.code,{children:"struct"})," or ",e.jsx(s.code,{children:"class"})," is the access scope for resources:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Each instance of a resource can only exist in exactly one ",e.jsx(s.em,{children:"location"})," and cannot be copied.",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Here, location refers to account storage, a temporary variable in a function, a storage field in a contract, and so on."}),`
`]}),`
`]}),`
`,e.jsx(s.li,{children:"Resources must be explicitly moved from one location to another when accessed."}),`
`,e.jsx(s.li,{children:"Resources also cannot go out of scope at the end of function execution. They must be explicitly stored somewhere or explicitly destroyed."}),`
`,e.jsxs(s.li,{children:["A resource can only be created in the scope that it is defined in.",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"This prevents anyone from being able to create arbitrary amounts of resource objects that others have defined."}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(s.p,{children:"These characteristics make it impossible to accidentally lose a resource from a coding mistake."}),`
`,e.jsxs(s.p,{children:["Add a ",e.jsx(s.code,{children:"resource"})," called ",e.jsx(s.code,{children:"HelloAsset"}),' that contains a function to return a string containing "Hello Resources!":']}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'        // A transaction can call this function to get the "Hello Resources!"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // message from the resource."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") view "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" hello"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            return"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Hello Resources!"'})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.p,{children:"A few notes on this function:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"access(all)"})," makes the function publicly accessible."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"view"})," indicates that the function does not modify state."]}),`
`,e.jsxs(s.li,{children:["The function return type is a ",e.jsx(s.code,{children:"String"}),"."]}),`
`,e.jsxs(s.li,{children:["The function is ",e.jsx(s.strong,{children:"not"})," present on the contract itself and cannot be called by interacting with the contract."]}),`
`]}),`
`,e.jsxs(s.p,{children:[`:::warning
If you're used to Solidity, you'll want to take note that the `,e.jsx(s.code,{children:"view"})," keyword in Cadence is used in the same cases as both ",e.jsx(s.code,{children:"view"})," and ",e.jsx(s.code,{children:"pure"}),` in Solidity.
:::`]}),`
`,e.jsx(s.h3,{id:"creating-a-resource",children:"Creating a resource"}),`
`,e.jsxs(s.p,{children:["The following steps show you how to create a resource with the ",e.jsx(s.code,{children:"create"})," keyword and the ",e.jsx(s.a,{href:"../language/operators/assign-move-force-swap.md#move-operator--",children:"move operator"})," (",e.jsx(s.code,{children:"<-"}),")."]}),`
`,e.jsxs(s.p,{children:["You use the ",e.jsx(s.code,{children:"create"})," keyword to initialize a resource. Resources can only be created by the contract that defines them and ",e.jsx(s.strong,{children:"must"})," be created before they can be used."]}),`
`,e.jsxs(s.p,{children:["The move operator ",e.jsx(s.code,{children:"<-"})," is used to move a resource — you cannot use the assignment operator ",e.jsx(s.code,{children:"="}),". When you initialize them or assign then to a new variable, you use the move operator ",e.jsx(s.code,{children:"<-"})," to ",e.jsx(s.strong,{children:"literally move"})," the resource from one location to another. The old variable or location that was holding it will no longer be valid after the move."]}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:["Create a resource called ",e.jsx(s.code,{children:"first_resource"}),":",`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Note the `@` symbol to specify that it is a resource"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" first_resource: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyResource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" AnyResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]})]})})}),`
`]}),`
`,e.jsxs(s.li,{children:["Move the resource:",`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" second_resource "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" first_resource"})]})})})}),`
`,"The name ",e.jsx(s.code,{children:"first_resource"})," is ",e.jsx(s.strong,{children:"no longer valid or usable"}),":",`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Bad code, will generate an error"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" third_resource "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" first_resource"})]})]})})}),`
`]}),`
`,e.jsxs(s.li,{children:["Add a function called ",e.jsx(s.code,{children:"createHelloAsset"})," that creates and returns a ",e.jsx(s.code,{children:"HelloAsset"})," resource:",`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createHelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-create"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Unlike the ",e.jsx(s.code,{children:"hello()"})," function, this function ",e.jsx(s.strong,{children:"does"})," exist on the contract and can be called directly. Doing so creates an instance of the ",e.jsx(s.code,{children:"HelloAsset"})," resource, ",e.jsx(s.strong,{children:"moves"})," it through the ",e.jsx(s.code,{children:"return"})," of the function to the location calling the function — the same as you'd expect for other languages."]}),`
`,e.jsxs(s.li,{children:["Remember, when resources are referenced, the ",e.jsx(s.code,{children:"@"})," symbol is placed at the beginning. In the function above, the return type is a resource of the ",e.jsx(s.code,{children:"HelloAsset"})," type."]}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["Deploy this code to account ",e.jsx(s.code,{children:"0x06"})," by clicking the ",e.jsx(s.code,{children:"Deploy"})," button."]}),`
`]}),`
`,e.jsx(s.h2,{id:"creating-a-hello-transaction",children:"Creating a Hello transaction"}),`
`,e.jsxs(s.p,{children:["The following shows you how to create a transaction that calls the ",e.jsx(s.code,{children:"createHelloAsset()"})," function and saves a ",e.jsx(s.code,{children:"HelloAsset"})," resource to the account's storage."]}),`
`,e.jsxs(s.p,{children:["Open the transaction named ",e.jsx(s.code,{children:"Create Hello"}),", which contains the following code:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // TODO"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["We've already imported the ",e.jsx(s.code,{children:"HelloResource"})," contract for you and stubbed out a ",e.jsx(s.code,{children:"transaction"}),". Unlike the transaction in Hello World, you will need to modify the user's account, which means you will need to use the ",e.jsx(s.code,{children:"prepare"})," phase to access and modify the account that is going to get an instance of the resource."]}),`
`,e.jsx(s.h3,{id:"prepare-phase",children:"Prepare phase"}),`
`,e.jsx(s.p,{children:"To prepare:"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Create a ",e.jsx(s.code,{children:"prepare"})," phase with the ",e.jsx(s.code,{children:"SaveValue"})," authorization ",e.jsx(s.a,{href:"../language/access-control#entitlements",children:"entitlement"})," to the user's account. This authorizes the transaction to save values or objects anywhere in account storage.  You'll learn more about entitlements in the next lesson."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Use ",e.jsx(s.code,{children:"create"})," to create a new instance of the ",e.jsx(s.code,{children:"HelloAsset"}),"."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsx(s.p,{children:"Save the new resource in the user's account."}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Inside the ",e.jsx(s.code,{children:"transaction"}),", stub out the ",e.jsx(s.code,{children:"prepare"})," phase with the authorization ",e.jsx(s.a,{href:"../language/access-control#entitlements",children:"entitlement"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // TODO"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Use the ",e.jsx(s.code,{children:"createHelloAsset"})," function in ",e.jsx(s.code,{children:"HelloResource"})," to ",e.jsx(s.code,{children:"create"})," an instance of the resource inside of the ",e.jsx(s.code,{children:"prepeare"})," and ",e.jsx(s.em,{children:"move"})," it into a constant:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" newHello "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createHelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]})})})}),`
`]}),`
`]}),`
`,e.jsxs(s.p,{children:["You'll get an error for ",e.jsx(s.code,{children:"loss of resource"}),", which is one of the best features of Cadence! The language ",e.jsx(s.strong,{children:"prevents you from accidentally destroying a resource"})," at the syntax level."]}),`
`,e.jsx(s.h3,{id:"storage-paths",children:"Storage paths"}),`
`,e.jsxs(s.p,{children:["In Cadence Accounts, objects are stored in ",e.jsx(s.a,{href:"../language/accounts/paths.mdx",children:"paths"}),". Paths represent a file system for user accounts, where an object can be stored at any user-defined path. Usually, contracts will specify for the user where objects from that contract should be stored. This enables any code to know how to access these objects in a standard way."]}),`
`,e.jsxs(s.p,{children:["Paths start with the character ",e.jsx(s.code,{children:"/"}),", followed by the domain, the path separator ",e.jsx(s.code,{children:"/"}),", and finally the identifier. The identifier must start with a letter and can only be followed by letters, numbers, or the underscore ",e.jsx(s.code,{children:"_"}),". For example, the path ",e.jsx(s.code,{children:"/storage/test"})," has the domain ",e.jsx(s.code,{children:"storage"})," and the identifier ",e.jsx(s.code,{children:"test"}),"."]}),`
`,e.jsxs(s.p,{children:["There are two valid domains: ",e.jsx(s.code,{children:"storage"})," and ",e.jsx(s.code,{children:"public"}),"."]}),`
`,e.jsxs(s.p,{children:["Paths in the storage domain have type ",e.jsx(s.code,{children:"StoragePath"}),", and paths in the public domain have the type ",e.jsx(s.code,{children:"PublicPath"}),". Both ",e.jsx(s.code,{children:"StoragePath"})," and ",e.jsx(s.code,{children:"PublicPath"})," are subtypes of ",e.jsx(s.code,{children:"Path"}),"."]}),`
`,e.jsxs(s.p,{children:["Paths are ",e.jsx(s.strong,{children:"not"})," strings and do ",e.jsx(s.strong,{children:"not"})," have quotes around them."]}),`
`,e.jsxs(s.p,{children:["Next, use the account reference with the ",e.jsx(s.code,{children:"SaveValue"})," authorization ",e.jsx(s.a,{href:"../language/access-control#entitlements",children:"entitlement"})," to move the new resource into storage located in ",e.jsx(s.code,{children:"/storage/HelloAssetTutorial"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"acct.storage."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"newHello, to: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`,e.jsxs(s.p,{children:["The first parameter in ",e.jsx(s.code,{children:"save"})," is the object that is being stored, and the ",e.jsx(s.code,{children:"to"})," parameter is the path that the object is being stored at. The path must be a storage path, so only the domain ",e.jsx(s.code,{children:"/storage/"})," is allowed in the ",e.jsx(s.code,{children:"to"})," parameter."]}),`
`,e.jsxs(s.p,{children:["Notice that the error for ",e.jsx(s.code,{children:"loss of resource"})," has been resolved."]}),`
`,e.jsx(s.p,{children:"If there is already an object stored under the given path, the program aborts. Remember, the Cadence type system ensures that a resource can never be accidentally lost. When moving a resource to a field, into an array, into a dictionary, or into storage, there is the possibility that the location already contains a resource."}),`
`,e.jsx(s.p,{children:"Cadence forces the developer to explicitly handle the case of an existing resource so that it is not accidentally lost through an overwrite."}),`
`,e.jsx(s.p,{children:"It is also very important when choosing the name of your paths to pick an identifier that is very specific and unique to your project."}),`
`,e.jsxs(s.p,{children:["Currently, account storage paths are global, so there is a chance that projects could use the same storage paths, ",e.jsx(s.strong,{children:"which could cause path conflicts"}),"! This could be a headache for you, so choose unique path names to avoid this problem."]}),`
`,e.jsx(s.h3,{id:"execute-phase",children:"Execute phase"}),`
`,e.jsxs(s.p,{children:["Use the ",e.jsx(s.code,{children:"execute"})," phase to ",e.jsx(s.code,{children:"log"})," a message that the resource was successfully saved:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"execute"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    log"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Saved Hello Resource to account."'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.p,{children:"We'll learn more realistic uses of this phase soon."}),`
`,e.jsx(s.p,{children:"You should have something similar to:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" newHello "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createHelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        acct.storage."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"newHello, to: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"	execute"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        log"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Saved Hello Resource to account."'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"	}"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["This is our first transaction using the ",e.jsx(s.code,{children:"prepare"})," phase!"]}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.code,{children:"prepare"})," phase is the only place that has access to the signing account, via ",e.jsxs(s.a,{href:"../language/accounts/index.mdx",children:["account references (",e.jsx(s.code,{children:"&Account"}),")"]}),"."]}),`
`,e.jsxs(s.p,{children:["Account references have access to many different methods that are used to interact with an account, such as to ",e.jsx(s.code,{children:"save"})," a resource to the account's storage."]}),`
`,e.jsx(s.p,{children:"By not allowing the execute phase to access account storage and using entitlements, we can statically verify which assets and areas/paths of the signers' account a given transaction can modify."}),`
`,e.jsx(s.p,{children:"Browser wallets and applications that submit transactions for users can use this to show what a transaction could alter, giving users information about transactions that wallets will be executing for them, and confidence that they aren't getting fed a malicious or dangerous transaction from an app or wallet."}),`
`,e.jsx(s.p,{children:"To execute:"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:["Select account ",e.jsx(s.code,{children:"0x06"})," as the only signer."]}),`
`,e.jsxs(s.li,{children:["Click the ",e.jsx(s.code,{children:"Send"}),` button to submit the transaction.
`,e.jsx(s.em,{children:"You'll see in the log:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'"Saved Hello Resource to account."'})})})})}),`
`]}),`
`,e.jsxs(s.li,{children:["Use ",e.jsx(s.code,{children:"Send"})," to send the transaction again from account ",e.jsx(s.code,{children:"0x06"}),`
`,e.jsxs(s.em,{children:["You'll now get an error, because there's already a resource in ",e.jsx(s.code,{children:"/storage/HelloAssetTutorial"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"execution error code 1: [Error Code: 1101] error caused by: 1 error occurred:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"   * transaction execute failed: [Error Code: 1101] cadence runtime error: Execution failed:"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"error: failed to save object: path /storage/HelloAssetTutorial in account 0x0000000000000009 already stores an object"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"  --> 805f4e247a920635abf91969b95a63964dcba086bc364aedc552087334024656:19:8"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"   |"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"19 |         acct.storage.save(<-newHello, to: /storage/HelloAssetTutorial)"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"   |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"})})]})})}),`
`]}),`
`,e.jsxs(s.li,{children:["Remove the line of code that saves ",e.jsx(s.code,{children:"newHello"})," to storage.",`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Again, you'll get an error for ",e.jsx(s.code,{children:"newHello"})," that says ",e.jsx(s.code,{children:"loss of resource"}),". This means that you are not handling the resource properly. Remember that if you ever see this error in any of your programs, it means there is a resource somewhere that is not being explicitly stored or destroyed. ",e.jsx(s.strong,{children:"Add the line back before you forget!"})]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(s.h3,{id:"review-storage",children:"Review storage"}),`
`,e.jsxs(s.p,{children:["Now that you have executed the transaction, account ",e.jsx(s.code,{children:"0x06"})," has the newly created ",e.jsx(s.code,{children:"HelloWorld.HelloAsset"})," resource stored in its storage. You can verify this by clicking on account ",e.jsx(s.code,{children:"0x06"})," on the bottom left. This opens a view of the different contracts and objects in the account."]}),`
`,e.jsx(s.p,{children:"The resource you created appears in Account Storage:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"{"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'    "value": ['})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'            "key": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "value": "value",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "type": "String"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"            },"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'            "value": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "value": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                    "id": "A.0000000000000006.HelloResource.HelloAsset",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                    "fields": ['})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                        {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                            "value": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                                "value": "269380348805120",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                                "type": "UInt64"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                            },"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                            "name": "uuid"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                        }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                    ]"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                },"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "type": "Resource"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"            }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        },"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'            "key": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "value": "type",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "type": "String"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"            },"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'            "value": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "value": "A.0000000000000006.HelloResource.HelloAsset",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "type": "String"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"            }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        },"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        {"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'            "key": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "value": "path",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "type": "String"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"            },"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'            "value": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "value": {'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                    "domain": "storage",'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                    "identifier": "HelloAssetTutorial"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"                },"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'                "type": "Path"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"            }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"        }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"    ],"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:'    "type": "Dictionary"'})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["You'll also see ",e.jsx(s.code,{children:"FlowToken"})," objects and the ",e.jsx(s.code,{children:"HelloResource"})," Contract."]}),`
`,e.jsxs(s.p,{children:["Run the transaction from account ",e.jsx(s.code,{children:"0x07"})," and compare the differences between the accounts."]}),`
`,e.jsx(s.h3,{id:"check-for-existing-storage",children:"Check for existing storage"}),`
`,e.jsx(s.p,{children:"In real applications, you need to check the location path you are storing in to make sure both cases are handled properly."}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Update the authorization ",e.jsx(s.a,{href:"../language/access-control#entitlements",children:"entitlement"})," in the prepare phase to include ",e.jsx(s.code,{children:"BorrowValue"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Existing code..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["This ",e.jsx(s.a,{href:"../language/access-control#entitlements",children:"entitlement"})," makes it so you can borrow a reference to a value in the account's storage in addition to being able to save a value."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Add a ",e.jsx(s.code,{children:"transaction"}),"-level (similar to contract-level or class-level) variable to store a result ",e.jsx(s.code,{children:"String"}),"."]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Similar to a class-level variable in other languages, these go at the top, inside the ",e.jsx(s.code,{children:"transaction"})," scope, but not inside anything else. They are accessible in both the ",e.jsx(s.code,{children:"prepare"})," and ",e.jsx(s.code,{children:"execute"})," statements of a transaction:"]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" result: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Other code..."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["You'll get an error: ",e.jsx(s.code,{children:"missing initialization of field 'result' in type 'Transaction'. not initialized"})]}),`
`,e.jsxs(s.li,{children:["In transactions, variables at the ",e.jsx(s.code,{children:"transaction"})," level must be initialized in the ",e.jsx(s.code,{children:"prepare"})," phase."]}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Initialize the ",e.jsx(s.code,{children:"result"})," message and create a constant for the storage path:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".result = "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Saved Hello Resource to account."'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" storagePath = "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"})]})]})})}),`
`]}),`
`]}),`
`,e.jsxs(s.p,{children:[`:::warning
In Cadence, storage paths are a type. They are `,e.jsx(s.strong,{children:"not"})," ",e.jsx(s.code,{children:"Strings"}),` and are not enclosed by quotes.
:::
One way to check whether or not a storage path has an object in it is to use the built-in `,e.jsx(s.a,{href:"../language/accounts/storage.mdx#accountstorage",children:e.jsx(s.code,{children:"storage.check"})})," function with the type and path. If the result is ",e.jsx(s.code,{children:"true"}),", then there is an object in account storage that matches the type requested. If it's ",e.jsx(s.code,{children:"false"}),", there is not."]}),`
`,e.jsxs(s.p,{children:[`:::warning
A response of `,e.jsx(s.code,{children:"false"})," does ",e.jsx(s.strong,{children:"not"})," mean the location is empty. If you ask for an apple and the location contains an orange, this function will return ",e.jsx(s.code,{children:"false"}),"."]}),`
`,e.jsxs(s.p,{children:[`This is not likely to occur because projects are encouraged to create storage and public paths that are very unique, but is theoretically possible if projects don't follow this best practice or if there is a malicious app that tries to store things in other projects' paths.
:::
Depending on the needs of your app, you'll use this pattern to decide what to do in each case. For this example, we'll simply use it to change the log message if the storage is in use or create and save the `,e.jsx(s.code,{children:"HelloAsset"})," if it is not."]}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Refactor your prepare statement to check and see if the storage path is in use. If it is, update the ",e.jsx(s.code,{children:"result"})," message. Otherwise, create and save a ",e.jsx(s.code,{children:"HelloAsset"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" acct.storage.check"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<@"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": storagePath) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".result = "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Unable to save, resource already present."'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"} "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" newHello "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createHelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    acct.storage."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"newHello, to: storagePath)"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["When you [",e.jsx(s.code,{children:"check"}),"] a resource, you must put the type of the resource to be borrowed inside the ",e.jsx(s.code,{children:"<>"})," after the call to ",e.jsx(s.code,{children:"borrow"}),", before the parentheses. The ",e.jsx(s.code,{children:"from"})," parameter is the storage path to the object you are borrowing."]}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Update the ",e.jsx(s.code,{children:"log"})," in execute to use ",e.jsx(s.code,{children:"self.result"})," instead of the hardcoded string:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"execute"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    log"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".result)"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(s.p,{children:"You should end up with something similar to:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" result: "}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".result = "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Saved Hello Resource to account."'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" storagePath = "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    if"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" acct.storage.check"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<@"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": storagePath) {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".result = "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Unable to save, resource already present."'})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    } "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" newHello "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createHelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      acct.storage."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"newHello, to: storagePath)"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  execute"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    log"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".result)"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Use ",e.jsx(s.code,{children:"Send"})," to send the transaction again, both with accounts that have and have not yet created and stored an instance of ",e.jsx(s.code,{children:"HelloAsset"}),"."]}),`
`]}),`
`]}),`
`,e.jsx(s.p,{children:"Now you'll see an appropriate log whether or not a new resource was created and saved."}),`
`,e.jsx(s.h2,{id:"loading-a-hello-transaction",children:"Loading a Hello transaction"}),`
`,e.jsxs(s.p,{children:["The following shows you how to use a transaction to call the ",e.jsx(s.code,{children:"hello()"})," method from the ",e.jsx(s.code,{children:"HelloAsset"})," resource."]}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Open the transaction named ",e.jsx(s.code,{children:"Load Hello"}),", which is empty."]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Stub out a transaction that imports ",e.jsx(s.code,{children:"HelloResource"})," and passes in an account ",e.jsx(s.a,{href:"../language/references.mdx",children:"reference"})," with the ",e.jsx(s.code,{children:"BorrowValue"})," authorization entitlement, which looks something like this:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // TODO"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["You just learned how to ",e.jsx(s.a,{href:"../language/accounts/storage.mdx#accessing-objects",children:e.jsx(s.code,{children:"borrow"})})," a ",e.jsx(s.a,{href:"../language/references.mdx",children:"reference"})," to a resource. You could use an ",e.jsx(s.code,{children:"if"})," statement to handle the possibility that the resource isn't there, but if you want to simply terminate execution, a common practice is to combine a ",e.jsx(s.code,{children:"panic"})," statement with the ",e.jsxs(s.a,{href:"../language/operators/optional-operators.md#nil-coalescing-operator-",children:["nil-coalescing operator (",e.jsx(s.code,{children:"??"}),")"]}),"."]}),`
`,e.jsxs(s.li,{children:["This operator executes the statement on the left side. If that is ",e.jsx(s.code,{children:"nil"}),", the right side is evaluated and returned. In this case, the return is irrelevant, because we're going to cause a ",e.jsx(s.code,{children:"panic"})," and terminate execution."]}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Create a variable with a ",e.jsx(s.a,{href:"../language/references.mdx",children:"reference"})," to the ",e.jsx(s.code,{children:"HelloAsset"})," resource stored in the user's account. Use ",e.jsx(s.code,{children:"panic"})," if this resource is not found:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" helloAsset = acct.storage.borrow"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    ??"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"The signer does not have the HelloAsset resource stored at /storage/HelloAssetTutorial. Run the `Create Hello` Transaction to store the resource"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`]}),`
`,e.jsxs(s.li,{children:[`
`,e.jsxs(s.p,{children:["Use ",e.jsx(s.code,{children:"log"})," to log the return from a call to the ",e.jsx(s.code,{children:"hello()"})," function."]}),`
`]}),`
`]}),`
`,e.jsxs(s.p,{children:[`:::danger
Borrowing a `,e.jsx(s.a,{href:"../language/references.mdx",children:"reference"})," does ",e.jsx(s.strong,{children:"not"})," allow you to move or destroy a resource, but it ",e.jsx(s.strong,{children:"does allow"}),` you to mutate data inside that resource via one of the resource's functions.
:::
Your transaction should be similar to:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x06"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    prepare"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(acct: "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BorrowValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"LoadValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" helloAsset = acct.storage.borrow"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloResource"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAsset"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HelloAssetTutorial"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            ??"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" panic"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"The signer does not have the HelloAsset resource stored at /storage/HelloAssetTutorial. Run the `Create Hello` Transaction again to store the resource"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        log"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(helloAsset."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hello"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(s.p,{children:["In Cadence, we have the resources to leave very detailed error messages. Check out the error messages in the ",e.jsx(s.a,{href:"https://github.com/onflow/flow-nft/blob/master/contracts/NonFungibleToken.cdc#L115-L121",children:"Non-Fungible Token Contract"})," and ",e.jsx(s.a,{href:"https://github.com/onflow/flow-nft/blob/master/transactions/generic_transfer_with_address_and_type.cdc#L46-L50",children:"Generic NFT Transfer transaction"})," in the Flow NFT GitHub repo for examples of production error messages."]}),`
`,e.jsx(s.p,{children:"Test your transaction with several accounts to evaluate all possible cases."}),`
`,e.jsx(s.h2,{id:"reviewing-the-resource-contract",children:"Reviewing the resource contract"}),`
`,e.jsxs(s.p,{children:["In this tutorial you learned how to ",e.jsx(s.code,{children:"create"})," ",e.jsx(s.a,{href:"../language/resources.mdx",children:"resources"})," in Cadence. You implemented a smart contract that is accessible in all scopes. The smart contract has a resource declared that implemented a function called ",e.jsx(s.code,{children:"hello()"}),", that returns the string ",e.jsx(s.code,{children:'"Hello, World!"'}),". It also declares a function that can create a resource."]}),`
`,e.jsx(s.p,{children:"Next, you implemented a transaction to create the resource and save it in the account calling it."}),`
`,e.jsxs(s.p,{children:["Finally, you used a transaction to ",e.jsx(s.a,{href:"../language/accounts/storage.mdx#accessing-objects",children:"borrow"})," a ",e.jsx(s.a,{href:"../language/references.mdx",children:"reference"})," to the ",e.jsx(s.code,{children:"HelloAsset"})," resource from account storage and call the ",e.jsx(s.code,{children:"hello"})," method"]}),`
`,e.jsx(s.p,{children:"Now that you have completed the tutorial, you can:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Instantiate a ",e.jsx(s.code,{children:"resource"})," in a smart contract with the ",e.jsx(s.code,{children:"create"})," keyword."]}),`
`,e.jsxs(s.li,{children:["Save, move, and load resources using the ",e.jsx(s.a,{href:"../language/accounts/storage.mdx",children:"Account Storage API"})," and the ",e.jsx(s.a,{href:"../language/operators/assign-move-force-swap.md#move-operator--",children:"move operator"})," (",e.jsx(s.code,{children:"<-"}),")."]}),`
`,e.jsxs(s.li,{children:["Use ",e.jsx(s.a,{href:"../language/accounts/storage.mdx#accessing-objects",children:e.jsx(s.code,{children:"borrow"})})," to access and use a function in a resource."]}),`
`,e.jsxs(s.li,{children:["Use the ",e.jsx(s.code,{children:"prepare"})," phase of a transaction to load resources from account storage."]}),`
`,e.jsxs(s.li,{children:["Set and use variables in both the ",e.jsx(s.code,{children:"prepare"})," and ",e.jsx(s.code,{children:"execute"})," phase."]}),`
`,e.jsxs(s.li,{children:["Use the ",e.jsxs(s.a,{href:"../language/operators/optional-operators.md#nil-coalescing-operator-",children:["nil-coalescing operator (",e.jsx(s.code,{children:"??"}),")"]})," to ",e.jsx(s.code,{children:"panic"})," if a resource is not found."]}),`
`]}),`
`,e.jsx(s.h2,{id:"reference-solution",children:"Reference Solution"}),`
`,e.jsxs(s.p,{children:[`:::warning
You are `,e.jsx(s.strong,{children:"not"})," saving time by skipping the reference implementation. You'll learn much faster by doing the tutorials as presented!"]}),`
`,e.jsx(s.p,{children:`Reference solutions are functional, but may not be optimal.
:::`}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:e.jsx(s.a,{href:"https://play.flow.com/8b28da4e-0235-499f-8653-1f55e1b3b725",children:"Reference Solution"})}),`
`]}),`
`]})}function h(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}export{a as _markdown,h as default,r as frontmatter,o as structuredData,l as toc};
