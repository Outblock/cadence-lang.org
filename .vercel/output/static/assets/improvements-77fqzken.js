import{j as e}from"./main-BXy83AsK.js";let a=`

💫 New features [#-new-features]

Cadence 1.0 was released in October of 2024.  This page provides a historical reference of changes.

<details>
  <summary>
    View Functions added (

    [FLIP 1056]

    )
  </summary>

  💡 Motivation [#-motivation]

  View functions enable developers to enhance the reliability and safety of their programs, facilitating a clearer understanding of the impacts of their own code and that of others.

  Developers can mark their functions as \`view\`, which disallows the function from performing state changes. That also makes the intent of functions clear to other programmers, as it allows them to distinguish between functions that change state and ones that do not.

  ℹ️ Description [#ℹ️-description]

  Cadence has added support for annotating functions with the \`view\` keyword, which enforces that no *mutating* operations occur inside the body of the function. The \`view\` keyword is placed before the \`fun\` keyword in a function declaration or function expression.

  If a function has no \`view\` annotation, it is considered *non-view*, and users should encounter no difference in behavior in these functions from what they are used to.

  If a function does have a \`view\` annotation, then the following mutating operations are not allowed:

  * Writing to, modifying, or destroying any resources
  * Writing to or modifying any references
  * Assigning to or modifying any variables that cannot be determined to have been created locally inside of the \`view\` function in question. In particular, this means that captured and global variables cannot be written in these functions
  * Calling a non-\`view\` function

  This feature was proposed in [FLIP 1056]. To learn more, please consult the FLIP and documentation.

  🔄 Adoption [#-adoption]

  You can adopt view functions by adding the \`view\` modifier to all functions that do not perform mutating operations.

  ✨ Example [#-example]

  Before:
  The function \`getCount\` of a hypothetical NFT collection returns the number of NFTs in the collection.

  \`\`\`cadence
  access(all)
  resource Collection {

    access(all)
    var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

    init () {
      self.ownedNFTs <- {}
    }

    access(all)
    fun getCount(): Int {
      returnself.ownedNFTs.length
    }

    /* ... rest of implementation ... */
  }
  \`\`\`

  After:
  The function \`getCount\` does not perform any state changes, it only reads the length of the collection and returns it. Therefore it can be marked as \`view.\`

  \`\`\`cadence
      access(all)
      view fun getCount(): Int {
  //  ^^^^ addedreturnself.ownedNFTs.length
      }
  \`\`\`
</details>

<details>
  <summary>
    Interface Inheritance Added (

    [FLIP 40]

    )
  </summary>

  💡 Motivation [#-motivation-1]

  Previously, interfaces could not inherit from other interfaces, which required developers to repeat code.
  Interface inheritance allows code abstraction and code reuse.

  ℹ️ Description and ✨ Example [#ℹ️-description-and--example]

  Interfaces can now inherit from other interfaces of the same kind. This makes it easier for developers to structure their conformances and reduces a lot of redundant code.

  For example, suppose there are two resource interfaces, \`Receiver\` and \`Vault\`, and suppose all implementations of the \`Vault\` would also need to conform to the interface \`Receiver\`.

  Previously, there was no way to enforce this. Anyone who implements the \`Vault\` would have to explicitly specify that their concrete type also implements the \`Receiver\`. But it was not always guaranteed that all implementations would follow this informal agreement.
  With interface inheritance, the \`Vault\` interface can now inherit/conform to the \`Receiver\` interface.

  \`\`\`cadence
  access(all)
  resource interface Receiver {
    access(all)
    fun deposit(_ something:@AnyResource)
  }

  access(all)
  resource interface Vault: Receiver {
    access(all)
    fun withdraw(_ amount: Int):@Vault
  }
  \`\`\`

  Thus, anyone implementing the \`Vault\` interface would also have to implement the \`Receiver\` interface as well.

  \`\`\`cadence
  access(all)
  resource MyVault: Vault {
    // Required!
    access(all)
    fun withdraw(_ amount: Int):@Vault {}
    // Required!
    access(all)
    fun deposit(_ something:@AnyResource) {}
  }
  \`\`\`

  This feature was proposed in [FLIP 40]. To learn more, please consult the FLIP and documentation.
</details>

⚡ Breaking improvements [#-breaking-improvements]

Many of the improvements of Cadence 1.0 are fundamentally changing how Cadence works and how it is used. However, that also means it is necessary to break existing code to release this version, which will guarantee stability (no more planned breaking changes) going forward.

Once Cadence 1.0 is live, breaking changes will simply not be acceptable.

So we have, and need to use, this last chance to fix and improve Cadence, so it can deliver on its promise of being a language that provides security and safety, while also providing composability and simplicity.

We fully recognize the frustration developers feel when updates break their code, necessitating revisions. Nonetheless, we are convinced that this inconvenience is justified by the substantial enhancements to Cadence development. These improvements not only make development more effective and enjoyable but also empower developers to write and deploy immutable contracts.

The improvements were intentionally bundled into one release to avoid breaking Cadence programs multiple times.

<details>
  <summary>
     

    **2024-04-24**

     Public Capability Acquisition No Longer Returns Optional Capabilities (

    [FLIP 242]

    )
  </summary>

  **Note** This is a recent change that may not be reflected in emulated migrations or all tools yet.  Likewise, this may affect existing staged contracts which do not conform to this new requirement.  Please ensure your contracts are updated and re-staged, if necessary, to match this new requirement.

  💡 Motivation [#-motivation-2]

  In the initial implementation of the new Capability Controller API (a change that is new in Cadence 1.0, proposed in [FLIP 798]), \`capabilities.get<T>\` would return an optional capability, \`Capability<T>?\`.  When the no capability was published under the requested path, or when type argument \`T\` was not a subtype of the runtime type of the capability published under the requested path, the capability would be \`nil\`.

  This was a source of confusion among developers, as previously \`account.getCapability<T>\` did not return an optional capability, but rather one that would simply fail \`capability.borrow\` if the capability was invalid.

  It was concluded that this new behavior was not ideal, and that there a benefit to an invalid Capability not being \`nil\`, even if it is not borrowable. A \`nil\` capability lacked information that was previously available with an invalid capability - primarily the type and address of the capability.  Developers may have wanted to make use of this information, and react to the capability being invalid, as opposed to an uninformative \`nil\` value and encountering a panic scenario.

  ℹ️ Description [#ℹ️-description-1]

  The \`capabilities.get<T>\` function now returns an invalid capability when no capability is published under the requested path, or when the type argument \`T\` is not a subtype of the runtime type of the capability published under the requested path.

  This capability has the following properties:

  * Always return \`false\` when \`Capability<T>.check\` is called.
  * Always return \`nil\` when \`Capability<T>.borrow\` is called.
  * Have an ID of \`0\`.
  * Have a runtime type that is the same as the type requested in the type argument of \`capabilities.get<T>\`.

  <br />

  🔄 Adoption [#-adoption-1]

  If you have not updated your code to Cadence 1.0 yet, you will need to follow the same guidelines for updating to the Capability Controller API as you would have before, but you will need to handle the new invalid capability type instead of an optional capability.

  If you have already updated your code to use \`capabilities.get<T>\`, and are handling the capability as an optional type, you may need to update your code to handle the new non-optional invalid capability type instead.

  ✨ Example [#-example-1]

  **Before:**

  \`\`\`cadence
  let capability = account.capabilities.get<&MyNFT.Collection>(/public/NFTCollection)
  if capability == nil {
      // Handle the case where the capability is nil
  }
  \`\`\`

  **After:**

  \`\`\`cadence
  let capability = account.capabilities.get<&MyNFT.Collection>(/public/NFTCollection)
  if !capability.check() {
      // Handle the case where the capability is invalid
  }
  \`\`\`
</details>

<details>
  <summary>
    **2024-04-23**

     Matching Access Modifiers for Interface Implementation Members are now Required (

    [FLIP 262]

    )
  </summary>

  **Note** This is a recent change that may not be reflected in emulated migrations or all tools yet.  Likewise, this may affect existing staged contracts which do not conform to this new requirement.  Please ensure your contracts are updated and re-staged, if necessary, to match this new requirement.

  💡 Motivation [#-motivation-3]

  Previously, the access modifier of a member in a type conforming to / implementing an interface
  could not be more restrictive than the access modifier of the member in the interface.
  That meant an implementation may have choosen to use a more permissive access modifier than the interface.

  This may have been surprising to developers, as they may have assumed that the access modifier of the member
  in the interface was a *requirement* / *maximum*, not just a minimum, especially when using
  a non-public / non-entitled access modifier (e.g., \`access(contract)\`, \`access(account)\`).

  Requiring access modifiers of members in the implementation to match the access modifiers
  of members given in the interface, helps avoid confusion and potential footguns.

  ℹ️ Description [#ℹ️-description-2]

  If an interface member has an access modifier, a composite type that conforms to it / implements
  the interface must use exactly the same access modifier.

  🔄 Adoption [#-adoption-2]

  Update the access modifiers of members in composite types that conform to / implement interfaces if they do not match the access modifiers of the members in the interface.

  ✨ Example [#-example-2]

  **Before:**

  \`\`\`cadence
  access(all)
  resource interface I {
    access(account)
    fun foo()
  }

  access(all)
  resource R: I {
    access(all)
    fun foo() {}
  }
  \`\`\`

  **After:**

  \`\`\`cadence
  access(all)
  resource interface I {
    access(account)
    fun foo()
  }

  access(all)
  resource R: I {
    access(account)
    fun foo() {}
  }
  \`\`\`
</details>

<details>
  <summary>
    Conditions No Longer Allow State Changes (

    [FLIP 1056]

    )
  </summary>

  💡 Motivation [#-motivation-4]

  In the current version of Cadence, pre-conditions and post-conditions may perform state changes, e.g., by calling a function that performs a mutation. This may result in unexpected behavior, which might lead to bugs.

  To make conditions predictable, they are no longer allowed to perform state changes.

  ℹ️ Description [#ℹ️-description-3]

  Pre-conditions and post-conditions are now considered \`view\` contexts, meaning that any operations that would be prevented inside of a \`view\` function are also not permitted in a pre-condition or post-condition.

  This is to prevent underhanded code wherein a user modifies global or contract state inside of a condition, where they are meant to simply be asserting properties of that state.

  In particular, since only expressions were permitted inside conditions already, this means that if users wish to call any functions in conditions, these functions must now be made \`view\` functions.

  This improvement was proposed in [FLIP 1056]. To learn more, please consult the FLIP and documentation.

  🔄 Adoption [#-adoption-3]

  Conditions that perform mutations will now result in the error *Impure operation performed in view context*.
  Adjust the code in the condition so it does not perform mutations.

  The condition may be considered mutating, because it calls a mutating, i.e., non-\`view\` function. It might be possible to mark the called function as \`view\`, and the body of the function may need to get updated in turn.

  ✨ Example [#-example-3]

  **Before:**

  The function \`withdraw\` of a hypothetical NFT collection interface allows the withdrawal of an NFT with a specific ID. In its post-condition, the function states that at the end of the function, the collection should have exactly one fewer item than at the beginning of the function.

  \`\`\`cadence
  access(all)
  resource interface Collection {

    access(all)
    fun getCount(): Int

    access(all)
    fun withdraw(id: UInt64):@NFT {
      post {
        getCount() == before(getCount()) - 1
      }
    }

    /* ... rest of interface ... */
  }
  \`\`\`

  **After:**

  The calls to \`getCount\` in the post-condition are not allowed and result in the error *Impure operation performed in view context*, because the \`getCount\` function is considered a mutating function, as it does not have the \`view\` modifier.

  Here, as the \`getCount\` function only performs a read-only operation and does not change any state, it can be marked as \`view\`.

  \`\`\`cadence
      access(all)
      view fun getCount(): Int
  //  ^^^^
  \`\`\`
</details>

<details>
  <summary>
    Missing or Incorrect Argument Labels Get Reported
  </summary>

  💡 Motivation [#-motivation-5]

  Previously, missing or incorrect argument labels of function calls were not reported. This had the potential to confuse developers or readers of programs, and could potentially lead to bugs.

  ℹ️ Description [#ℹ️-description-4]

  Function calls with missing argument labels are now reported with the error message *missing argument label*, and function calls with incorrect argument labels are now reported with the error message *incorrect argument label*.

  🔄 Adoption [#-adoption-4]

  * Function calls with missing argument labels should be updated to include the required argument labels.
  * Function calls with incorrect argument labels should be fixed by providing the correct argument labels.

  ✨ Example [#-example-4]

  Contract \`TestContract\` deployed at address \`0x1\`:

  \`\`\`cadence
  access(all)
  contract TestContract {

    access(all)
    structTestStruct {

    access(all)
    let a: Int

    access(all)
    let b: String

    init(first: Int, second: String) {
      self.a = first
      self.b = second
      }
    }
  }
  \`\`\`

  **Incorrect program**:

  The initializer of \`TestContract.TestStruct\` expects the argument labels \`first\` and \`second\`.

  However, the call of the initializer provides the incorrect argument label \`wrong\` for the first argument, and is missing the label for the second argument.

  \`\`\`cadence
  // Script
  import TestContract from 0x1

  access(all)
  fun main() {
    TestContract.TestStruct(wrong: 123, "abc")
  }
  \`\`\`

  This now results in the following errors:

  \`\`\`
  error: incorrect argument label
    --> script:4:34
     |
   4 |           TestContract.TestStruct(wrong: 123, "abc")
     |                                   ^^^^^ expected \`first\`, got \`wrong\`

  error: missing argument label: \`second\`
    --> script:4:46
     |
   4 |           TestContract.TestStruct(wrong: 123, "abc")
     |                                               ^^^^^
  \`\`\`

  **Corrected program**:

  \`\`\`cadence
  // Script
  import TestContract from 0x1

  access(all)
  fun main() {
    TestContract.TestStruct(first: 123, second: "abc")
  }
  \`\`\`

  We would like to thank community member @justjoolz for reporting this bug.
</details>

<details>
  <summary>
    Incorrect Operators In Reference Expressions Get Reported (

    [FLIP 941]

    )
  </summary>

  💡 Motivation [#-motivation-6]

  Previously, incorrect operators in reference expressions were not reported.

  This had the potential to confuse developers or readers of programs, and could potentially lead to bugs.

  ℹ️ Description [#ℹ️-description-5]

  The syntax for reference expressions is \`&v as &T\`, which represents taking a reference to value \`v\` as type \`T\`.
  Reference expressions that used other operators, such as \`as?\` and \`as!\`, e.g., \`&v as! &T\`, were incorrect and were previously not reported as an error.

  The syntax for reference expressions improved to just \`&v\`. The type of the resulting reference must still be provided explicitly.
  If the type is not explicitly provided, the error *cannot infer type from reference expression: requires an explicit type annotation* is reported.

  For example, existing expressions like \`&v as &T\` provide an explicit type, as they statically assert the type using \`as &T\`. Such expressions thus keep working and do *not* have to be changed.

  Another way to provide the type for the reference is by explicitly typing the target of the expression, for example, in a variable declaration, e.g., via \`let ref: &T = &v\`.

  This improvement was proposed in [FLIP 941]. To learn more, please consult the FLIP and documentation.

  🔄 Adoption [#-adoption-5]

  Reference expressions which use an operator other than \`as\` need to be changed to use the \`as\` operator.
  In cases where the type is already explicit, the static type assertion (\`as &T\`) can be removed.

  ✨ Example [#-example-5]

  **Incorrect program**:
  The reference expression uses the incorrect operator \`as!\`.

  \`\`\`cadence
  let number = 1
  let ref = &number as! &Int
  \`\`\`

  This now results in the following error:

  \`\`\`bash
  error: cannot infer type from reference expression: requires an explicit type annotation
   --> test:3:17
    |
  3 |let ref = &number as! &Int
    |           ^
  \`\`\`

  **Corrected program**:

  \`\`\`cadence
  let number = 1
  let ref = &number as &Int
  \`\`\`

  Alternatively, the same code can now also be written as follows:

  \`\`\`cadence
  let number = 1
  let ref: &Int = &number
  \`\`\`
</details>

<details>
  <summary>
    Tightening Of Naming Rules
  </summary>

  💡 Motivation [#-motivation-7]

  Previously, Cadence allowed language keywords (e.g., \`continue\`, \`for\`, etc.) to be used as names. For example, the following program was allowed:

  \`\`\`cadence
  fun continue(import: Int, break: String) { ... }
  \`\`\`

  This had the potential to confuse developers or readers of programs, and could potentially lead to bugs.

  ℹ️ Description [#ℹ️-description-6]

  Most language keywords are no longer allowed to be used as names.
  Some keywords are still allowed to be used as names, as they have limited significance within the language. These allowed keywords are as follows:

  * \`from\`: only used in import statements \`import foo from ...\`
  * \`account\`: used in access modifiers \`access(account) let ...\`
  * \`all\`: used in access modifier \`access(all) let ...\`
  * \`view\`: used as a modifier for function declarations and expressions \`view fun foo()...\`, let \`f = view fun () ...\`
    Any other keywords will raise an error during parsing, such as:

  \`\`\`cadence
  let break: Int = 0
  //  ^ error: expected identifier after start of variable declaration, got keyword break
  \`\`\`

  🔄 Adoption [#-adoption-6]

  Names that use language keywords must be renamed.

  ✨ Example [#-example-6]

  **Before:**
  A variable is named after a language keyword.

  \`\`\`cadence
  let contract = signer.borrow<&MyContract>(name: "MyContract")
  //  ^ error: expected identifier after start of variable declaration, got keyword contract
  \`\`\`

  **After:**
  The variable is renamed to avoid the clash with the language keyword.

  \`\`\`cadence
  let myContract = signer.borrow<&MyContract>(name: "MyContract")
  \`\`\`
</details>

<details>
  <summary>
    Result of 

    \`toBigEndianBytes()\`

     for 

    \`U?Int(128|256)\`

     Fixed
  </summary>

  💡 Motivation [#-motivation-8]

  Previously, the implementation of \`.toBigEndianBytes()\` was incorrect for the large integer types \`Int128\`, \`Int256\`, \`UInt128\`, and \`UInt256\`.

  This had the potential to confuse developers or readers of programs, and could potentially lead to bugs.

  ℹ️ Description [#ℹ️-description-7]

  Calling the \`toBigEndianBytes\` function on smaller sized integer types returns the exact number of bytes that fit into the type, left-padded with zeros. For instance, \`Int64(1).toBigEndianBytes()\` returns an array of 8 bytes, as the size of \`Int64\` is 64 bits, 8 bytes.

  Previously, the \`toBigEndianBytes\` function erroneously returned variable-length byte arrays without padding for the large integer types \`Int128\`, \`Int256\`, \`UInt128\`, and \`UInt256\`. This was inconsistent with the smaller fixed-size numeric types, such as \`Int8\` and \`Int32\`.

  To fix this inconsistency, \`Int128\` and \`UInt128\` now always return arrays of 16 bytes, while \`Int256\` and \`UInt256\` return 32 bytes.

  ✨ Example [#-example-7]

  \`\`\`cadence
  let someNum: UInt128 = 123456789
  let someBytes: [UInt8] = someNum.toBigEndianBytes()
  // OLD behavior;
  // someBytes = [7, 91, 205, 21]
  // NEW behavior:
  // someBytes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 91, 205, 21]
  \`\`\`

  🔄 Adoption [#-adoption-7]

  Programs that use \`toBigEndianBytes\` directly, or indirectly by depending on other programs, should be checked for how the result of the function is used. It might be necessary to adjust the code to restore existing behavior.

  If a program relied on the previous behavior of truncating the leading zeros, then the old behavior can be recovered by first converting to a variable-length type, \`Int\` or \`UInt\`, as the \`toBigEndianBytes\` function retains the variable-length byte representations, i.e., the result has no padding bytes.

  \`\`\`cadence
  let someNum: UInt128 = 123456789
  let someBytes: [UInt8] = UInt(someNum).toBigEndianBytes()
  // someBytes = [7, 91, 205, 21]
  \`\`\`
</details>

<details>
  <summary>
    Syntax for Function Types Improved (

    [FLIP 43]

    )
  </summary>

  💡 Motivation [#-motivation-9]

  Previously, function types were expressed using a different syntax from function declarations or expressions. The previous syntax was unintuitive for developers, making it hard to write and read code that used function types.

  ℹ️ Description and ✨ examples [#ℹ️-description-and--examples]

  Function types are now expressed using the \`fun\` keyword, just like expressions and declarations. This improves readability and makes function types more obvious.

  For example, given the following function declaration:

  \`\`\`cadence
  fun foo(n: Int8, s: String): Int16 { /* ... */ }
  \`\`\`

  The function \`foo\` now has the type \`fun(Int8, String): Int16\`.
  The \`:\` token is right-associative, so functions that return other functions can have their types written without nested parentheses:

  \`\`\`cadence
  fun curriedAdd(_ x: Int): fun(Int): Int {
    return fun(_ y: Int): Int {
      return x+ y
    }
  }
  // function \`curriedAdd\` has the type \`fun(Int): fun(Int): Int\`
  \`\`\`

  To further bring the syntax for function types closer to the syntax of function declarations expressions, it is now possible to omit the return type, in which case the return type defaults to \`Void\`.

  \`\`\`cadence
  fun logTwice(_ value: AnyStruct) {// Return type is implicitly \`Void\`
    log(value)
    log(value)
  }

  // The function types of these variables are equivalent
  let logTwice1: fun(AnyStruct): Void = logTwice
  let logTwice2: fun(AnyStruct) = logTwice
  \`\`\`

  As a bonus consequence, it is now allowed for any type to be parenthesized. This is useful for complex type signatures, or for expressing optional functions:

  \`\`\`cadence
  // A function that returns an optional Int16
  let optFun1: fun (Int8): Int16? =
    fun (_: Int8): Int? { return nil }

  // An optional function that returns an Int16
  let optFun2: (fun (Int8): Int16)? = nil
  \`\`\`

  This improvement was proposed in [FLIP 43].

  🔄 Adoption [#-adoption-8]

  Programs that use the old function type syntax need to be updated by replacing the surrounding parentheses of function types with the \`fun\` keyword.

  **Before:**

  \`\`\`cadence
  let baz: ((Int8, String): Int16) = foo
        // ^                     ^
        // surrounding parentheses of function type
  \`\`\`

  **After:**

  \`\`\`cadence
  let baz: fun (Int8, String): Int16 = foo
  \`\`\`
</details>

<details>
  <summary>
    Entitlements and Safe Down-casting (

    [FLIP 54]

     & 

    [FLIP 94]

    )
  </summary>

  💡 Motivation [#-motivation-10]

  Previously, Cadence’s main access-control mechanism, restricted reference types, has been a source of confusion and mistakes for contract developers.

  Developers new to Cadence often were surprised and did not understand why access-restricted functions, like the \`withdraw\` function of the fungible token \`Vault\` resource type, were declared as \`pub\`, making the function publicly accessible — access would later be restricted through a restricted type.

  It was too easy to accidentally give out a \`Capability\` with a more permissible type than intended, leading to security problems.
  Additionally, because what fields and functions were available to a reference depended on what the type of the reference was, references could not be downcast, leading to ergonomic issues.

  ℹ️ Description [#ℹ️-description-8]

  Access control has improved significantly.
  When giving another user a reference or \`Capability\` to a value you own, the fields and functions that the user can access is determined by the type of the reference or \`Capability\`.

  Previously, access to a value of type \`T\`, e.g., via a reference \`&T\`, would give access to all fields and functions of \`T\`. Access could be restricted, by using a restricted type. For example, a restricted reference \`&T{I}\` could only access members that were \`pub\` on \`I\`. Since references could not be downcast, any members defined on \`T\` but not on \`I\` were unavailable to this reference, even if they were \`pub\`.

  Access control is now handled using a new feature called Entitlements, as originally proposed across [FLIP 54] and [FLIP 94].

  A reference can now be *entitled* to certain facets of an object. For example, the reference \`auth(Withdraw) &Vault\` is entitled to access fields and functions of \`Vault\` which require the \`Withdraw\` entitlement.

  Entitlements can be are declared using the new \`entitlement\` syntax.

  Members can be made to require entitlements using the access modifier syntax \`access(E)\`, where \`E\` is an entitlement that the user must posses.

  For example:

  \`\`\`cadence
  entitlement Withdraw

  access(Withdraw)
  fun withdraw(amount: UFix64): @Vault
  \`\`\`

  References can now always be down-casted, the standalone \`auth\` modifier is not necessary anymore, and has been removed.

  For example, the reference \`&{Provider}\` can now be downcast to \`&Vault\`, so access control is now handled entirely through entitlements, rather than types.

  See [Entitlements] for more information.

  🔄 Adoption [#-adoption-9]

  The access modifiers of fields and functions need to be carefully audited and updated.

  Fields and functions that have the \`pub\` access modifier are now callable by anyone with any reference to that type. If access to the member should be restricted, the \`pub\` access modifier needs to be replaced with an entitlement access modifier.

  When creating a \`Capability\` or a reference to a value, **it must be carefully considered which entitlements are provided to the recipient of that \`Capability\` or reference** — only the entitlements which are necessary and not more should be include in the \`auth\` modifier of the reference type.

  ✨ Example [#-example-8]

  **Before:**
  The \`Vault\` resource was originally written like so:

  \`\`\`cadence
  access(all)
  resource interface Provider {
    access(all)
    funwithdraw(amount:UFix64): @Vault {
    // ...
    }
  }

  access(all)
  resource Vault: Provider, Receiver, Balance {
    access(all)
    fun withdraw(amount:UFix64): @Vault {
    // ...
    }

    access(all)
    fun deposit(from: @Vault) {
    // ...
    }

    access(all)
    var balance: UFix64
  }
  \`\`\`

  **After:**
  The \`Vault\` resource might now be written like this:

  \`\`\`cadence
  access(all) entitlement Withdraw

  access(all)
  resource interface Provider {
    access(Withdraw)
    funwithdraw(amount:UFix64): @Vault {
    // ...
    }
  }

  access(all)
  resource Vault: Provider, Receiver, Balance {

    access(Withdraw)// withdrawal requires permission
    fun withdraw(amount:UFix64): @Vault {
    // ...
    }

    access(all)
    fun deposit(from: @Vault) {
    // ...
    }

    access(all)
    var balance: UFix64
  }
  \`\`\`

  Here, the \`access(Withdraw)\` syntax means that a reference to \`Vault\` must possess the \`Withdraw\` entitlement in order to be allowed to call the \`withdraw\` function, which can be given when a reference or \`Capability\` is created by using a new syntax: \`auth(Withdraw) &Vault\`.

  This would allow developers to safely downcast \`&{Provider}\` references to \`&Vault\` references if they want to access functions like \`deposit\` and \`balance\`, without enabling them to call \`withdraw\`.
</details>

<details>
  <summary>
    Removal of 

    \`pub\`

     and 

    \`priv\`

     Access Modifiers (

    [FLIP 84]

    )
  </summary>

  💡 Motivation [#-motivation-11]

  With the previously mentioned entitlements feature, which uses \`access(E)\` syntax to denote entitled access, the \`pub\`, \`priv\`, and \`pub(set)\` modifiers became the only access modifiers that did not use the \`access\` syntax.

  This made the syntax inconsistent, making it harder to read and understand programs.

  In addition, \`pub\` and \`priv\` already had alternatives/equivalents: \`access(all)\` and \`access(self)\`.

  ℹ️ Description [#ℹ️-description-9]

  The \`pub\`, \`priv\` and \`pub(set)\` access modifiers are being removed from the language, in favor of their more explicit \`access(all)\` and \`access(self)\` equivalents (for \`pub\` and \`priv\`, respectively).

  This makes access modifiers more uniform and better match the new entitlements syntax.

  This improvement was originally proposed in [FLIP 84].

  🔄 Adoption [#-adoption-10]

  Users should replace any \`pub\` modifiers with \`access(all)\`, and any \`priv\` modifiers with \`access(self)\`.

  Fields that were defined as \`pub(set)\` will no longer be publicly assignable, and no access modifier now exists that replicates this old behavior. If the field should stay publicly assignable, a \`access(all)\` setter function that updates the field needs to be added, and users have to switch to using it instead of directly assigning to the field.

  ✨ Example [#-example-9]

  **Before:**
  Types and members could be declared with \`pub\` and \`priv\`:

  \`\`\`cadence
  pub resource interface Collection {
    pub fun getCount(): Int

    priv fun myPrivateFunction()

    pub(set) let settableInt: Int

    /* ... rest of interface ... */
  }
  \`\`\`

  **After:**
  The same behavior can be achieved with \`access(all)\` and \`access(self)\`

  \`\`\`cadence
  access(all)
  resource interface Collection {

    access(all)
    fun getCount(): Int

    access(self)
    fun myPrivateFunction()

    access(all)
    let settableInt: Int

    // Add a public setter method, replacing pub(set)
    access(all)
    fun setIntValue(_ i:Int): Int

    /* ... rest of interface ... */
  }
  \`\`\`
</details>

<details>
  <summary>
    Replacement of Restricted Types with Intersection Types (

    [FLIP 85]

    )
  </summary>

  💡 Motivation [#-motivation-12]

  With the improvements to access control enabled by entitlements and safe down-casting, the restricted type feature is redundant.

  ℹ️ Description [#ℹ️-description-10]

  Restricted types have been removed. All types, including references, can now be down-casted, restricted types are no longer used for access control.

  At the same time intersection types got introduced. Intersection types have the syntax \`{I1, I2, ... In}\`, where all elements of the set of types (\`I1, I2, ... In\`) are interface types. A value is part of the intersection type if it conforms to all the interfaces in the intersection type’s interface set. This functionality is equivalent to restricted types that restricted \`AnyStruct\` and \`AnyResource.\`

  This improvement was proposed in [FLIP 85]. To learn more, please consult the FLIP and documentation.

  🔄 Adoption [#-adoption-11]

  Code that relies on the restriction behavior of restricted types can be safely changed to just use the concrete type directly, as entitlements will make this safe. For example, \`&Vault{Balance}\` can be replaced with just \`&Vault\`, as access to \`&Vault\` only provides access to safe operations, like getting the balance — **privileged operations, like withdrawal, need additional entitlements.**

  Code that uses \`AnyStruct\` or \`AnyResource\` explicitly as the restricted type, e.g., in a reference, \`&AnyResource{I}\`, needs to remove the use of \`AnyStruct\` / \`AnyResource\`. Code that already uses the syntax \`&{I}\` can stay as-is.

  ✨ Example [#-example-10]

  **Before:**

  This function accepted a reference to a \`T\` value, but restricted what functions were allowed to be called on it to those defined on the \`X\`, \`Y\`, and \`Z\` interfaces.

  \`\`\`cadence
  access(all)
  resource interface X {
    access(all)
    fun foo()
  }

  access(all)
  resource interface Y {
    access(all)
    fun bar()
  }

  access(all)
  resource interface Z {
    access(all)
    fun baz()
  }

  access(all)
  resource T: X, Y, Z {
    // implement interfaces
    access(all)
    fun qux() {
    // ...
    }
  }

  access(all)
  fun exampleFun(param: &T{X, Y, Z}) {
    // \`param\` cannot call \`qux\` here, because it is restricted to
    // \`X\`, \`Y\` and \`Z\`.
  }
  \`\`\`

  **After:**
  This function can be safely rewritten as:

  \`\`\`cadence
  access(all)
  resource interface X {
    access(all)
    fun foo()
  }

  access(all)
  resource interface Y {
    access(all)
    fun bar()
  }

  resource interface Z {
    access(all)
    fun baz()
  }

  access(all)
  entitlement Q

  access(all)
  resource T: X, Y, Z {
    // implement interfaces
    access(Q)
    fun qux() {
    // ...
    }
  }

  access(all)
  fun exampleFun(param: &T) {
    // \`param\` still cannot call \`qux\` here, because it lacks entitlement \`Q\`
  }
  \`\`\`

  Any functions on \`T\` that the author of \`T\` does not want users to be able to call publicly should be defined with entitlements, and thus will not be accessible to the unauthorized \`param\` reference, like with \`qux\` above.
</details>

<details>
  <summary>
    Account Access Got Improved (

    [FLIP 92]

    )
  </summary>

  💡 Motivation [#-motivation-13]

  Previously, access to accounts was granted wholesale: Users would sign a transaction, authorizing the code of the transaction to perform any kind of operation, for example, write to storage, but also add keys or contracts.

  Users had to trust that a transaction would only perform supposed access, e.g., storage access to withdraw tokens, but still had to grant full access, which would allow the transaction to perform other operations.

  Dapp developers who require users to sign transactions should be able to request the minimum amount of access to perform the intended operation, i.e., developers should be able to follow the principle of least privilege (PoLA).

  This allows users to trust the transaction and Dapp.

  ℹ️ Description [#ℹ️-description-11]

  Previously, access to accounts was provided through the built-in types \`AuthAccount\` and \`PublicAccount\`: \`AuthAccount\` provided full *write* access to an account, whereas \`PublicAccount\` only provided *read* access.

  With the introduction of entitlements, this access is now expressed using entitlements and references, and only a single \`Account\` type is necessary. In addition, storage related functionality were moved to the field \`Account.storage\`.

  Access to administrative account operations, such as writing to storage, adding keys, or adding contracts, is now gated by both coarse grained entitlements (e.g., \`Storage\`, which grants access to all storage related functions, and \`Keys\`, which grants access to all key management functions), as well as fine-grained entitlements (e.g., \`SaveValue\` to save a value to storage, or \`AddKey\` to add a new key to the account).

  Transactions can now request the particular entitlements necessary to perform the operations in the transaction.

  This improvement was proposed in [FLIP 92]. To learn more, consult the FLIP and the documentation.

  🔄 Adoption [#-adoption-12]

  Code that previously used \`PublicAccount\` can simply be replaced with an unauthorized account reference, \`&Account.\`

  Code that previously used \`AuthAccount\` must be replaced with an authorized account reference. Depending on what functionality of the account is accessed, the appropriate entitlements have to be specified.

  For example, if the \`save\` function of \`AuthAccount\` was used before, the function call must be replaced with \`storage.save\`, and the \`SaveValue\` or \`Storage\` entitlement is required.

  ✨ Example [#-example-11]

  **Before:**

  The transactions wants to save a value to storage. It must request access to the whole account, even though it does not need access beyond writing to storage.

  \`\`\`cadence
  transaction {
    prepare(signer: AuthAccount) {
      signer.save("Test", to: /storage/test)
    }
  }
  \`\`\`

  **After:**

  The transaction requests the fine-grained account entitlement \`SaveValue\`, which allows the transaction to call the \`save\` function.

  \`\`\`cadence
  transaction {
    prepare(signer: auth(SaveValue)&Account) {
      signer.storage.save("Test", to: /storage/test)
    }
  }
  \`\`\`

  If the transaction attempts to perform other operations, such as adding a new key, it is rejected:

  \`\`\`cadence
  transaction {
    prepare(signer: auth(SaveValue)&Account) {
      signer.storage.save("Test", to: /storage/test)
      signer.keys.add(/* ... */)
      //          ^^^ Error: Cannot call function, requires \`AddKey\` or \`Keys\` entitlement
    }
  }
  \`\`\`
</details>

<details>
  <summary>
    Deprecated Key Management API Got Removed
  </summary>

  💡 Motivation [#-motivation-14]

  Cadence provides two key management APIs:

  * The original, low-level API, which worked with RLP-encoded keys
  * The improved, high-level API, which works with convenient data types like \`PublicKey\`, \`HashAlgorithm\`, and \`SignatureAlgorithm\`
    The improved API was introduced, as the original API was difficult to use and error-prone.
    The original API was deprecated in early 2022.

  ℹ️ Description [#ℹ️-description-12]

  The original account key management API has been removed. Instead, the improved key management API should be used.
  To learn more,

  🔄 Adoption [#-adoption-13]

  Replace uses of the original account key management API functions with equivalents of the improved API:

  | Removed                     | Replacement         |
  | --------------------------- | ------------------- |
  | AuthAccount.addPublicKey    | Account.keys.add    |
  | AuthAccount.removePublicKey | Account.keys.revoke |

  See [Account keys] for more information.

  ✨ Example [#-example-12]

  **Before:**

  \`\`\`cadence
  transaction(encodedPublicKey: [UInt8]) {
    prepare(signer: AuthAccount) {
      signer.addPublicKey(encodedPublicKey)
    }
  }
  \`\`\`

  **After:**

  \`\`\`cadence
  transaction(publicKey: [UInt8]) {
    prepare(signer: auth(Keys) &Account) {
      signer.keys.add(
        publicKey: PublicKey(
          publicKey: publicKey,
          signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
        ),
        hashAlgorithm: HashAlgorithm.SHA3_256,
        weight: 100.0
      )
    }
  }
  \`\`\`
</details>

<details>
  <summary>
    Resource Tracking for Optional Bindings Improved
  </summary>

  💡 Motivation [#-motivation-15]

  Previously, resource tracking for optional bindings (*if-let statements*) was implemented incorrectly, leading to errors for valid code.
  This required developers to add workarounds to their code.

  ℹ️ Description [#ℹ️-description-13]

  Resource tracking for optional bindings (*if-let statements*) was fixed.

  For example, the following program used to be invalid, reporting a resource loss error for \`optR\`:

  \`\`\`cadence
  resource R {}
  fun asOpt(_ r: @R): @R? {
    return <-r
  }

  fun test() {
    let r <- create R()
    let optR <- asOpt(<-r)
    if let r2 <- optR {
        destroy r2
    }
  }
  \`\`\`

  This program is now considered valid.

  🔄 Adoption [#-adoption-14]

  New programs do not need workarounds anymore, and can be written naturally.

  Programs that previously resolved the incorrect resource loss error with a workaround, for example by invalidating the resource also in the else-branch or after the if-statement, are now invalid:

  \`\`\`cadence
  fun test() {
    let r <- createR()
    let optR <-asOpt(<-r)
    if let r2 <- optR {
      destroy r2
    } else {
      destroy optR
      // unnecessary, but added to avoid error
    }
  }
  \`\`\`

  The unnecessary workaround needs to be removed.
</details>

<details>
  <summary>
    Definite Return Analysis Got Improved
  </summary>

  💡 Motivation [#-motivation-16]

  Definite return analysis determines if a function always exits, in all possible execution paths, e.g., through a \`return\` statement, or by calling a function that never returns, like \`panic\`.

  This analysis was incomplete and required developers to add workarounds to their code.

  ℹ️ Description [#ℹ️-description-14]

  The definite return analysis got significantly improved.

  This means that the following program is now accepted: both branches of the if-statement exit, one using a \`return\` statement, the other using a function that never returns, \`panic\`:

  \`\`\`cadence
  resource R {}

  fun mint(id: UInt64):@R {
    if id > 100 {
      return <- create R()
    } else {
      panic("bad id")
    }
  }
  \`\`\`

  The program above was previously rejected with a *missing return statement* error — even though we can convince ourselves that the function will exit in both branches of the if-statement, and that any code after the if-statement is unreachable, the type checker was not able to detect that — it now does.

  🔄 Adoption [#-adoption-15]

  New programs do not need workarounds anymore, and can be written naturally.
  Programs that previously resolved the incorrect error with a workaround, for example by adding an additional exit at the end of the function, are now invalid:

  \`\`\`cadence
  resource R {}

  fun mint(id: UInt64):@R {
    if id > 100 {
      return <- create R()
    } else {
      panic("bad id")
    }

    // unnecessary, but added to avoid error
    panic("unreachable")
  }
  \`\`\`

  The improved type checker now detects and reports the unreachable code after the if-statement as an error:

  \`\`\`bash
  error: unreachable statement
  --> test.cdc:12:4
    |
  12|  panic("unreachable")
    |  ^^^^^^^^^^^^^^^^^^^^
  exit status 1
  \`\`\`

  To make the code valid, simply remove the unreachable code.
</details>

<details>
  <summary>
    Semantics for Variables in For-Loop Statements Got Improved (

    [FLIP 13]

    )
  </summary>

  💡 Motivation [#-motivation-17]

  Previously, the iteration variable of \`for-in\` loops was re-assigned on each iteration.

  Even though this is a common behavior in many programming languages, it is surprising behavior and a source of bugs.

  The behavior was improved to the often assumed/expected behavior of a new iteration variable being introduced for each iteration, which reduces the likelihood for a bug.

  ℹ️ Description [#ℹ️-description-15]

  The behavior of \`for-in\` loops improved, so that a new iteration variable is introduced for each iteration.

  This change only affects a few programs, as the behavior change is only noticeable if the program captures the iteration variable in a function value (closure).

  This improvement was proposed in [FLIP 13]. To learn more, consult the FLIP and documentation.

  ✨ Example [#-example-13]

  Previously, \`values\` would result in \`[3, 3, 3]\`, which might be surprising and unexpected. This is because \`x\` was *reassigned* the current array element on each iteration, leading to each function in \`fs\` returning the last element of the array.

  \`\`\`cadence
  // Capture the values of the array [1, 2, 3]
  let fs: [((): Int)] = []
  for x in [1, 2, 3] {
    // Create a list of functions that return the array value
    fs.append(fun (): Int {
      return x
    })
  }

  // Evaluate each function and gather all array values
  let values: [Int] = []
  for f in fs {
    values.append(f())
  }
  \`\`\`
</details>

<details>
  <summary>
    References to Resource-Kinded Values Get Invalidated When the Referenced Values Are Moved (

    [FLIP 1043]

    )
  </summary>

  💡 Motivation [#-motivation-18]

  Previously, when a reference is taken to a resource, that reference remains valid even if the resource was moved, for example when created and moved into an account, or moved from one account into another.

  In other words, references to resources stayed alive forever. This could be a potential safety foot-gun, where one could gain/give/retain unintended access to resources through references.

  ℹ️ Description [#ℹ️-description-16]

  References are now invalidated if the referenced resource is moved after the reference was taken. The reference is invalidated upon the first move, regardless of the origin and the destination.

  This feature was proposed in [FLIP 1043]. To learn more, please consult the FLIP and documentation.

  ✨ Example [#-example-14]

  \`\`\`cadence
  // Create a resource.
  let r <-createR()

  // And take a reference.
  let ref = &r as &R

  // Then move the resource into an account.
  account.save(<-r, to: /storage/r)

  // Update the reference.
  ref.id = 2

  \`\`\`

  Old behavior:

  \`\`\`cadence

  // This will also update the referenced resource in the account.
  ref.id = 2

  \`\`\`

  The above operation will now result in a static error.

  \`\`\`cadence

  // Trying to update/access the reference will produce a static error:
  //     "invalid reference: referenced resource may have been moved or destroyed"
  ref.id = 2

  \`\`\`

  However, not all scenarios can be detected statically. e.g:

  \`\`\`cadence
  fun test(ref: &R) {
    ref.id = 2
  }
  \`\`\`

  In the above function, it is not possible to determine whether the resource to which the reference was taken has been moved or not. Therefore, such cases are checked at run-time, and a run-time error will occur if the resource has been moved.

  🔄 Adoption [#-adoption-16]

  Review code that uses references to resources, and check for cases where the referenced resource is moved. Such code may now be reported as invalid, or result in the program being aborted with an error when a reference to a moved resource is de-referenced.
</details>

<details>
  <summary>
    Capability Controller API Replaced Existing Linking-based Capability API (

    [FLIP 798]

    )
  </summary>

  💡 Motivation [#-motivation-19]

  Cadence encourages a capability-based security model. Capabilities are themselves a new concept that most Cadence programmers need to understand.

  The existing API for capabilities was centered around *links* and *linking*, and the associated concepts of the public and private storage domains led to capabilities being even confusing and awkward to use.

  A better API is easier to understand and easier to work with.

  ℹ️ Description [#ℹ️-description-17]

  The existing linking-based capability API has been replaced by a more powerful and easier-to-use API based on the notion of Capability Controllers. The new API makes the creation of new capabilities and the revocation of existing capabilities simpler.

  This improvement was proposed in [FLIP 798]. To learn more, consult the FLIP and the documentation.

  🔄 Adoption [#-adoption-17]

  Existing uses of the linking-based capability API must be replaced with the new Capability Controller API.

  | Removed                                                        | Replacement                                                                                                                                                                                                      |
  | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | \`AuthAccount.link\`, with private path                          | \`Account.capabilities.storage.issue\`                                                                                                                                                                             |
  | \`AuthAccount.link\`, with public path                           | \`Account.capabilities.storage.issue\` and \`Account.capabilities.publish\`                                                                                                                                          |
  | \`AuthAccount.linkAccount\`                                      | \`AuthAccount.capabilities.account.issue\`                                                                                                                                                                         |
  | \`AuthAccount.unlink\`, with private path                        | - Get capability controller: \`Account.capabilities.storage/account.get\` <br /> - Revoke controller: \`Storage/AccountCapabilityController.delete\`                                                                 |
  | \`AuthAccount.unlink\`, with public path                         | - Get capability controller: \`Account.capabilities.storage/account.get\` <br /> - Revoke controller: \`Storage/AccountCapabilityController.delete\` <br /> - Unpublish capability: \`Account.capabilities.unpublish\` |
  | \`AuthAccount/PublicAccount.getCapability\`                      | \`Account.capabilities.get\`                                                                                                                                                                                       |
  | \`AuthAccount/PublicAccount.getCapability\` with followed borrow | \`Account.capabilities.borrow\`                                                                                                                                                                                    |
  | \`AuthAccount.getLinkTarget\`                                    | N/A                                                                                                                                                                                                              |

  ✨ Example [#-example-15]

  Assume there is a \`Counter\` resource which stores a count, and it implements an interface \`HasCount\` which is used to allow read access to the count.

  \`\`\`cadence
  access(all)
  resource interface HasCount {
    access(all)
    count: Int
  }

  access(all)
  resource Counter: HasCount {
    access(all)
    var count: Int

    init(count: Int) {
      self.count = count
    }
  }
  \`\`\`

  Granting access, before:

  \`\`\`cadence
  transaction {
    prepare(signer: AuthAccount) {
      signer.save(
        <-create Counter(count: 42),
        to: /storage/counter
      )
      signer.link<&{HasCount}>(
        /public/hasCount,
        target: /storage/counter
      )
    }
  }
  \`\`\`

  Granting access, after:

  \`\`\`cadence
  transaction {
    prepare(signer: auth(Storage, Capabilities)&Account) {
      signer.save(
        <-create Counter(count: 42),
        to: /storage/counter
      )
      let cap = signer.capabilities.storage.issue<&{HasCount}>(
        /storage/counter
      )
      signer.capabilities.publish(cap, at: /public/hasCount)
    }
  }
  \`\`\`

  Getting access, before:

  \`\`\`cadence
  access(all)
  fun main(): Int {
    let counterRef = getAccount(0x1)
      .getCapabilities<&{HasCount}>(/public/hasCount)
      .borrow()!
    return counterRef.count
  }
  \`\`\`

  Getting access, after:

  \`\`\`cadence
  access(all)
  fun main(): Int {
    let counterRef = getAccount(0x1)
      .capabilities
      .borrow<&{HasCount}>(/public/hasCount)!
    return counterRef.count
  }
  \`\`\`
</details>

<details>
  <summary>
    External Mutation Improvement (

    [FLIP 89]

     & 

    [FLIP 86]

    )
  </summary>

  💡 Motivation [#-motivation-20]

  A previous version of Cadence (*Secure Cadence*), attempted to prevent a common safety foot-gun: Developers might use the \`let\` keyword for a container-typed field, assuming it would be immutable.

  Though Secure Cadence implements the [Cadence mutability restrictions FLIP], it did not fully solve the problem / prevent the foot-gun and there were still ways to mutate such fields, so a proper solution was devised.

  To learn more about the problem and motivation to solve it, please read the associated [Vision] document.

  ℹ️ Description [#ℹ️-description-18]

  The mutability of containers (updating a field of a composite value, key of a map, or index of an array) through references has changed:
  When a field/element is accessed through a reference, a reference to the accessed inner object is returned, instead of the actual object. These returned references are unauthorized by default, and the author of the object (struct/resource/etc.) can control what operations are permitted on these returned references by using entitlements and entitlement mappings.
  This improvement was proposed in two FLIPs:

  * [FLIP 89: Change Member Access Semantics]
  * [FLIP 86: Introduce Built-in Mutability Entitlements]

  To learn more, please consult the FLIPs and the documentation.

  🔄 Adoption [#-adoption-18]

  As mentioned in the previous section, the most notable change in this improvement is that, when a field/element is accessed through a reference, a reference to the accessed inner object is returned, instead of the actual object. So developers would need to change their code to:

  * Work with references, instead of the actual object, when accessing nested objects through a reference.
  * Use proper entitlements for fields when they declare their own \`struct\` and \`resource\` types.

  <br />

  ✨ Example [#-example-16]

  Consider the followinbg resource collection:

  \`\`\`cadence
  pub resource MasterCollection {
    pub let kittyCollection: @Collection
    pub let topshotCollection: @Collection
  }

  pub resource Collection {
    pub(set)
    var id: String

    access(all)
    var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

    access(all)
    fun deposit(token:@NonFungibleToken.NFT) {... }
  }
  \`\`\`

  Earlier, it was possible to mutate the inner collections, even if someone only had a reference to the \`MasterCollection\`. e.g:

  \`\`\`cadence
  var masterCollectionRef:&MasterCollection =... // Directly updating the field
  masterCollectionRef.kittyCollection.id = "NewID"

  // Calling a mutating function
  masterCollectionRef.kittyCollection.deposit(<-nft)

  // Updating via the referencelet ownedNFTsRef=&masterCollectionRef.kittyCollection.ownedNFTs as &{UInt64: NonFungibleToken.NFT}
  destroy ownedNFTsRef.insert(key: 1234, <-nft)

  \`\`\`

  Once this change is introduced, the above collection can be re-written as below:

  \`\`\`cadence
  pub resource MasterCollection {
    access(KittyCollectorMapping)
    let kittyCollection: @Collection

    access(TopshotCollectorMapping)
    let topshotCollection: @Collection
  }

  pub resource Collection {
    pub(set)
    var id: String

    access(Identity)
    var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

    access(Insert)
    fun deposit(token:@NonFungibleToken.NFT) { /* ... */ }
  }

  // Entitlements and mappings for \`kittyCollection\`

  entitlement KittyCollector

  entitlement mapping KittyCollectorMapping {
    KittyCollector -> Insert
    KittyCollector -> Remove
  }

  // Entitlements and mappings for \`topshotCollection\`

  entitlement TopshotCollector

  entitlement mapping TopshotCollectorMapping {
    TopshotCollector -> Insert
    TopshotCollector -> Remove
  }
  \`\`\`

  Then for a reference with no entitlements, none of the previously mentioned operations would be allowed:

  \`\`\`cadence
  var masterCollectionRef:&MasterCollection <- ... // Error: Cannot update the field. Doesn't have sufficient entitlements.
  masterCollectionRef.kittyCollection.id = "NewID"

  // Error: Cannot directly update the dictionary. Doesn't have sufficient entitlements.
  destroy masterCollectionRef.kittyCollection.ownedNFTs.insert(key: 1234,<-nft)
  destroy masterCollectionRef.ownedNFTs.remove(key: 1234)

  // Error: Cannot call mutating function. Doesn't have sufficient entitlements.
  masterCollectionRef.kittyCollection.deposit(<-nft)

  // Error: \`masterCollectionRef.kittyCollection.ownedNFTs\` is already a non-auth reference.// Thus cannot update the dictionary. Doesn't have sufficient entitlements.
  let ownedNFTsRef = &masterCollectionRef.kittyCollection.ownedNFTsas&{UInt64: NonFungibleToken.NFT}
  destroy ownedNFTsRef.insert(key: 1234, <-nft)
  \`\`\`

  To perform these operations on the reference, one would need to have obtained a reference with proper entitlements:

  \`\`\`cadence
  var masterCollectionRef: auth{KittyCollector} &MasterCollection <- ... // Directly updating the field
  masterCollectionRef.kittyCollection.id = "NewID"

  // Updating the dictionary
  destroy masterCollectionRef.kittyCollection.ownedNFTs.insert(key: 1234, <-nft)
  destroy masterCollectionRef.kittyCollection.ownedNFTs.remove(key: 1234)

  // Calling a mutating function
  masterCollectionRef.kittyCollection.deposit(<-nft)
  \`\`\`
</details>

<details>
  <summary>
    Removal Of Nested Type Requirements (

    [FLIP 118]

    )
  </summary>

  💡 Motivation [#-motivation-21]

  [Nested Type Requirements] were a fairly advanced concept of the language.

  Just like an interface could require a conforming type to provide a certain field or function, it could also have required the conforming type to provide a nested type.

  This is an uncommon feature in other programming languages and hard to understand.

  In addition, the value of nested type requirements was never realized. While it was previously used in the FT and NFT contracts, the addition of other language features like interface inheritance and events being emittable from interfaces, there were no more uses case compelling enough to justify a feature of this complexity.

  ℹ️ Description [#ℹ️-description-19]

  Contract interfaces can no longer declare any concrete types (\`struct\`, \`resource\` or \`enum\`) in their declarations, as this would create a type requirement. \`event\` declarations are still allowed, but these create an \`event\` type limited to the scope of that contract interface; this \`event\` is not inherited by any implementing contracts. Nested interface declarations are still permitted, however.

  This improvement was proposed in [FLIP 118].

  🔄 Adoption [#-adoption-19]

  Any existing code that made use of the type requirements feature should be rewritten not to use this feature.
</details>

<details>
  <summary>
    Event Definition And Emission In Interfaces (

    [FLIP 111]

    )
  </summary>

  💡 Motivation [#-motivation-22]

  In order to support the removal of nested type requirements, events have been made define-able and emit-able from contract interfaces, as events were among the only common uses of the type requirements feature.

  ℹ️ Description [#ℹ️-description-20]

  Contract interfaces may now define event types, and these events can be emitted from function conditions and default implementations in those contract interfaces.

  This improvement was proposed in [FLIP 111].

  🔄 Adoption [#-adoption-20]

  Contract interfaces that previously used type requirements to enforce that concrete contracts that implement the interface should also declare a specific event, should instead define and emit that event in the interface.

  ✨ Example [#-example-17]

  **Before:**

  A contract interface like the one below (\`SomeInterface\`) used a type requirement to enforce that contracts which implement the interface also define a certain event (\`Foo\`):

  \`\`\`cadence
  contract interface SomeInterface {
    event Foo()
  //^^^^^^^^^^^ type requirement

    fun inheritedFunction()
  }

  contract MyContract: SomeInterface {
    event Foo()
  //^^^^^^^^^^^ type definition to satisfy type requirement

    fun inheritedFunction() {
  //  ...
      emit Foo()
    }
  }
  \`\`\`

  **After:**

  This can be rewritten to emit the event directly from the interface, so that any contracts that implement \`Intf\` will always emit \`Foo\` when \`inheritedFunction\` is called:

  \`\`\`cadence
  contract interface Intf {
    event Foo()
  //^^^^^^^^^^^ type definition

    fun inheritedFunction() {
      pre {
        emit Foo()
      }
    }
  }
  \`\`\`
</details>

<details>
  <summary>
    Force Destruction of Resources (

    [FLIP 131]

    )
  </summary>

  💡 Motivation [#-motivation-23]

  It was previously possible to panic in the body of a resource or attachment’s \`destroy\` method, effectively preventing the destruction or removal of that resource from an account. This could be used as an attack vector by handing people undesirable resources or hydrating resources to make them extremely large or otherwise contain undesirable content.

  ℹ️ Description [#ℹ️-description-21]

  Contracts may no longer define \`destroy\` functions on their resources, and are no longer required to explicitly handle the destruction of resource fields. These will instead be implicitly destroyed whenever a resource is destroyed.
  Additionally, developers may define a \`ResourceDestroyed\` event in the body of a resource definition using default arguments, which will be lazily evaluated and then emitted whenever a resource of that type is destroyed.
  This improvement was proposed in [FLIP 131].

  🔄 Adoption [#-adoption-21]

  Contracts that previously used destroy methods will need to remove them, and potentially define a ResourceDestroyed event to track destruction if necessary.

  ✨ Example [#-example-18]

  A pair of resources previously written as:

  \`\`\`cadence
  event E(id: Int)

  resource SubResource {
    let id: Int
    init(id: Int) {
      self.id = id
    }

    destroy() {
      emit E(id: self.id)
    }
  }

  resource R {
    let subR: @SubResource

    init(id: Int) {
      self.subR <- create SubResource(id: id)
    }

    destroy() {
      destroy self.subR
    }
  }
  \`\`\`

  can now be equivalently written as:

  \`\`\`cadence
  resource SubResource {
    event ResourceDestroyed(id: Int = self.id)
    let id: Int

    init(id: Int) {
      self.id = id
    }
  }

  resource R {
    let subR: @SubResource

    init(id: Int) {
      self.subR <- create SubResource(id: id)
    }
  }
  \`\`\`
</details>

<details>
  <summary>
    New 

    \`domainSeparationTag\`

     parameter added to 

    \`Crypto.KeyList.verify\`
  </summary>

  💡 Motivation [#-motivation-24]

  \`KeyList\`’s \`verify\` function used to hardcode the domain separation tag (\`"FLOW-V0.0-user"\`) used to verify each signature from the list. This forced users to use the same domain tag and didn’t allow them to scope their signatures to specific use-cases and applications. Moreover, the \`verify\` function didn’t mirror the \`PublicKey\` signature verification behavior which accepts a domain tag parameter.

  ℹ️ Description [#ℹ️-description-22]

  \`KeyList\`’s \`verify\` function requires an extra parameter to specify the domain separation tag used to verify the input signatures. The tag is is a single \`string\` parameter and is used with all signatures. This mirrors the behavior of the simple public key (see  [Signature verification] for more information).

  🔄 Adoption [#-adoption-22]

  Contracts that use \`KeyList\` need to update the calls to \`verify\` by adding the new domain separation tag parameter. Using the tag as \`"FLOW-V0.0-user"\` would keep the exact same behavior as before the breaking change. Applications may also define a new domain tag for their specific use-case and use it when generating valid signatures, for added security against signature replays. See [Signature verification] and specifically [Hashing with a domain tag] for details on how to generate valid signatures with a tag.

  ✨ Example [#-example-19]

  A previous call to \`KeyList\`’s \`verify\` is written as:

  \`\`\`cadence
  let isValid = keyList.verify(
    signatureSet: signatureSet,
    signedData: signedData
  )
  \`\`\`

  can now be equivalently written as:

  \`\`\`cadence
  let isValid = keyList.verify(
    signatureSet: signatureSet,
    signedData: signedData,
    domainSeparationTag: "FLOW-V0.0-user"
  )
  \`\`\`

  Instead of the existing hardcoded domain separation tag, a new domain tag can be defined, but it has to be also used when generating valid signatures, e.g., \`"my_app_custom_domain_tag"\`.
</details>

FT / NFT standard changes [#ft--nft-standard-changes]

In addition to the upcoming language changes, the Cadence 1.0 upgrade also includes breaking changes to core contracts, such as the FungibleToken and NonFungibleToken standards. All Fungible and Non-Fungible Token contracts will need to be updated to the new standard.

These interfaces are being upgraded to allow for multiple tokens per contract, fix some issues with the original standards, and introduce other various improvements suggested by the community.

* Original Proposal: [Flow forum]
* Fungible Token Changes PR (WIP): [V2 FungibleToken Standard by joshuahannan — Pull Request #77 — onflow/flow-ft]
* NFT Changes PR: [GitHub]

It will involve upgrading your token contracts with changes to events, function signatures, resource interface conformances, and other small changes.

There are some existing guides for upgrading your token contracts to the new standard:

* [Upgrading Fungible Token Contracts]
* [Upgrading Non-Fungible Token Contracts]

More resources [#more-resources]

If you have any questions or need help with the upgrade, feel free to reach out to the Flow team on the [Flow Discord].

Help is also available during the [Cadence 1.0 Office Hours] each week at 10:00AM PST on the Flow Developer Discord.

{/* Relative links. Will not render on the page */}

[FLIP 1043]: https://github.com/onflow/flips/blob/main/cadence/20220708-resource-reference-invalidation.md

[FLIP 1056]: https://github.com/onflow/flips/blob/main/cadence/20220715-cadence-purity-analysis.md

[FLIP 111]: https://github.com/onflow/flips/blob/main/cadence/20230417-events-emitted-from-interfaces.md

[FLIP 118]: https://github.com/onflow/flips/blob/main/cadence/20230711-remove-type-requirements.md

[FLIP 13]: https://github.com/onflow/flips/blob/main/cadence/20221011-for-loop-semantics.md

[FLIP 131]: https://github.com/onflow/flips/pull/131

[FLIP 242]: https://github.com/onflow/flips/blob/main/cadence/20240123-capcon-get-capability-api-improvement.md

[FLIP 262]: https://github.com/onflow/flips/blob/main/cadence/20240415-remove-non-public-entitled-interface-members.md

[FLIP 40]: https://github.com/onflow/flips/blob/main/cadence/20221024-interface-inheritance.md

[FLIP 43]: https://github.com/onflow/flips/blob/main/cadence/20221018-change-fun-type-syntax.md

[FLIP 54]: https://github.com/onflow/flips/blob/main/cadence/20221214-auth-remodel.md

[FLIP 798]: https://github.com/onflow/flips/blob/main/cadence/20220203-capability-controllers.md

[FLIP 84]: https://github.com/onflow/flips/blob/main/cadence/20230505-remove-priv-and-pub.md

[FLIP 85]: https://github.com/onflow/flips/blob/main/cadence/20230505-remove-restricted-types.md

[FLIP 86: Introduce Built-in Mutability Entitlements]: https://github.com/onflow/flips/blob/main/cadence/20230519-built-in-mutability-entitlements.md

[FLIP 86]: https://github.com/onflow/flips/blob/main/cadence/20230519-built-in-mutability-entitlements.md

[FLIP 89: Change Member Access Semantics]: https://github.com/onflow/flips/blob/main/cadence/20230517-member-access-semnatics.md

[FLIP 89]: https://github.com/onflow/flips/blob/main/cadence/20230517-member-access-semnatics.md

[FLIP 92]: https://github.com/onflow/flips/blob/main/cadence/20230525-account-type.md

[FLIP 94]: https://github.com/onflow/flips/blob/main/cadence/20230623-entitlement-improvements.md

[FLIP 941]: https://github.com/onflow/flips/blob/main/cadence/20220516-reference-creation-semantics.md

[Account keys]: https://developers.flow.com/cadence/language/accounts#account-keys

[Cadence 1.0 Office Hours]: https://calendar.google.com/calendar/ical/c_47978f5cd9da636cadc6b8473102b5092c1a865dd010558393ecb7f9fd0c9ad0%40group.calendar.google.com/public/basic.ics

[Cadence mutability restrictions FLIP]: https://github.com/onflow/flips/blob/main/cadence/20211129-cadence-mutability-restrictions.md

[Entitlements]: https://cadence-lang.org/docs/1.0/language/access-control#entitlements

[Flow Discord]: https://discord.gg/flowblockchain.

[Flow forum]: http://forum.flow.com/t/streamlined-token-standards-proposal/3075

[GitHub]: https://github.com/onflow/flow-nft/pull/126

[Hashing with a domain tag]: https://cadence-lang.org/docs/1.0/language/crypto#hashing-with-a-domain-tag

[Nested Type Requirements]: https://docs.onflow.org/cadence/language/interfaces/#nested-type-requirements

[Signature verification]: https://cadence-lang.org/docs/1.0/language/crypto#signature-verification

[Upgrading Fungible Token Contracts]: ./ft-guide

[Upgrading Non-Fungible Token Contracts]: ./nft-guide

[Vision]: https://github.com/onflow/flips/blob/main/cadence/vision/mutability-restrictions.md

[V2 FungibleToken Standard by joshuahannan — Pull Request #77 — onflow/flow-ft]: https://github.com/onflow/flow-ft/pull/77
`,l={title:"Cadence 1.0 Improvements & New Features"},h={contents:[{heading:"-new-features",content:"Cadence 1.0 was released in October of 2024.  This page provides a historical reference of changes."},{heading:"-motivation",content:"View functions enable developers to enhance the reliability and safety of their programs, facilitating a clearer understanding of the impacts of their own code and that of others."},{heading:"-motivation",content:"Developers can mark their functions as `view`, which disallows the function from performing state changes. That also makes the intent of functions clear to other programmers, as it allows them to distinguish between functions that change state and ones that do not."},{heading:"ℹ️-description",content:"Cadence has added support for annotating functions with the `view` keyword, which enforces that no *mutating* operations occur inside the body of the function. The `view` keyword is placed before the `fun` keyword in a function declaration or function expression."},{heading:"ℹ️-description",content:"If a function has no `view` annotation, it is considered *non-view*, and users should encounter no difference in behavior in these functions from what they are used to."},{heading:"ℹ️-description",content:"If a function does have a `view` annotation, then the following mutating operations are not allowed:"},{heading:"ℹ️-description",content:"Writing to, modifying, or destroying any resources"},{heading:"ℹ️-description",content:"Writing to or modifying any references"},{heading:"ℹ️-description",content:"Assigning to or modifying any variables that cannot be determined to have been created locally inside of the `view` function in question. In particular, this means that captured and global variables cannot be written in these functions"},{heading:"ℹ️-description",content:"Calling a non-`view` function"},{heading:"ℹ️-description",content:"This feature was proposed in [FLIP 1056]. To learn more, please consult the FLIP and documentation."},{heading:"-adoption",content:"You can adopt view functions by adding the `view` modifier to all functions that do not perform mutating operations."},{heading:"-example",content:"Before:\nThe function `getCount` of a hypothetical NFT collection returns the number of NFTs in the collection."},{heading:"-example",content:"After:\nThe function `getCount` does not perform any state changes, it only reads the length of the collection and returns it. Therefore it can be marked as `view.`"},{heading:"-motivation-1",content:`Previously, interfaces could not inherit from other interfaces, which required developers to repeat code.
Interface inheritance allows code abstraction and code reuse.`},{heading:"ℹ️-description-and--example",content:"Interfaces can now inherit from other interfaces of the same kind. This makes it easier for developers to structure their conformances and reduces a lot of redundant code."},{heading:"ℹ️-description-and--example",content:"For example, suppose there are two resource interfaces, `Receiver` and `Vault`, and suppose all implementations of the `Vault` would also need to conform to the interface `Receiver`."},{heading:"ℹ️-description-and--example",content:"Previously, there was no way to enforce this. Anyone who implements the `Vault` would have to explicitly specify that their concrete type also implements the `Receiver`. But it was not always guaranteed that all implementations would follow this informal agreement.\nWith interface inheritance, the `Vault` interface can now inherit/conform to the `Receiver` interface."},{heading:"ℹ️-description-and--example",content:"Thus, anyone implementing the `Vault` interface would also have to implement the `Receiver` interface as well."},{heading:"ℹ️-description-and--example",content:"This feature was proposed in [FLIP 40]. To learn more, please consult the FLIP and documentation."},{heading:"-breaking-improvements",content:"Many of the improvements of Cadence 1.0 are fundamentally changing how Cadence works and how it is used. However, that also means it is necessary to break existing code to release this version, which will guarantee stability (no more planned breaking changes) going forward."},{heading:"-breaking-improvements",content:"Once Cadence 1.0 is live, breaking changes will simply not be acceptable."},{heading:"-breaking-improvements",content:"So we have, and need to use, this last chance to fix and improve Cadence, so it can deliver on its promise of being a language that provides security and safety, while also providing composability and simplicity."},{heading:"-breaking-improvements",content:"We fully recognize the frustration developers feel when updates break their code, necessitating revisions. Nonetheless, we are convinced that this inconvenience is justified by the substantial enhancements to Cadence development. These improvements not only make development more effective and enjoyable but also empower developers to write and deploy immutable contracts."},{heading:"-breaking-improvements",content:"The improvements were intentionally bundled into one release to avoid breaking Cadence programs multiple times."},{heading:"-breaking-improvements",content:"**Note** This is a recent change that may not be reflected in emulated migrations or all tools yet.  Likewise, this may affect existing staged contracts which do not conform to this new requirement.  Please ensure your contracts are updated and re-staged, if necessary, to match this new requirement."},{heading:"-motivation-2",content:"In the initial implementation of the new Capability Controller API (a change that is new in Cadence 1.0, proposed in [FLIP 798]), `capabilities.get<T>` would return an optional capability, `Capability<T>?`.  When the no capability was published under the requested path, or when type argument `T` was not a subtype of the runtime type of the capability published under the requested path, the capability would be `nil`."},{heading:"-motivation-2",content:"This was a source of confusion among developers, as previously `account.getCapability<T>` did not return an optional capability, but rather one that would simply fail `capability.borrow` if the capability was invalid."},{heading:"-motivation-2",content:"It was concluded that this new behavior was not ideal, and that there a benefit to an invalid Capability not being `nil`, even if it is not borrowable. A `nil` capability lacked information that was previously available with an invalid capability - primarily the type and address of the capability.  Developers may have wanted to make use of this information, and react to the capability being invalid, as opposed to an uninformative `nil` value and encountering a panic scenario."},{heading:"ℹ️-description-1",content:"The `capabilities.get<T>` function now returns an invalid capability when no capability is published under the requested path, or when the type argument `T` is not a subtype of the runtime type of the capability published under the requested path."},{heading:"ℹ️-description-1",content:"This capability has the following properties:"},{heading:"ℹ️-description-1",content:"Always return `false` when `Capability<T>.check` is called."},{heading:"ℹ️-description-1",content:"Always return `nil` when `Capability<T>.borrow` is called."},{heading:"ℹ️-description-1",content:"Have an ID of `0`."},{heading:"ℹ️-description-1",content:"Have a runtime type that is the same as the type requested in the type argument of `capabilities.get<T>`."},{heading:"-adoption-1",content:"If you have not updated your code to Cadence 1.0 yet, you will need to follow the same guidelines for updating to the Capability Controller API as you would have before, but you will need to handle the new invalid capability type instead of an optional capability."},{heading:"-adoption-1",content:"If you have already updated your code to use `capabilities.get<T>`, and are handling the capability as an optional type, you may need to update your code to handle the new non-optional invalid capability type instead."},{heading:"-example-1",content:"**Before:**"},{heading:"-example-1",content:"**After:**"},{heading:"-example-1",content:"**Note** This is a recent change that may not be reflected in emulated migrations or all tools yet.  Likewise, this may affect existing staged contracts which do not conform to this new requirement.  Please ensure your contracts are updated and re-staged, if necessary, to match this new requirement."},{heading:"-motivation-3",content:`Previously, the access modifier of a member in a type conforming to / implementing an interface
could not be more restrictive than the access modifier of the member in the interface.
That meant an implementation may have choosen to use a more permissive access modifier than the interface.`},{heading:"-motivation-3",content:"This may have been surprising to developers, as they may have assumed that the access modifier of the member\nin the interface was a *requirement* / *maximum*, not just a minimum, especially when using\na non-public / non-entitled access modifier (e.g., `access(contract)`, `access(account)`)."},{heading:"-motivation-3",content:`Requiring access modifiers of members in the implementation to match the access modifiers
of members given in the interface, helps avoid confusion and potential footguns.`},{heading:"ℹ️-description-2",content:`If an interface member has an access modifier, a composite type that conforms to it / implements
the interface must use exactly the same access modifier.`},{heading:"-adoption-2",content:"Update the access modifiers of members in composite types that conform to / implement interfaces if they do not match the access modifiers of the members in the interface."},{heading:"-example-2",content:"**Before:**"},{heading:"-example-2",content:"**After:**"},{heading:"-motivation-4",content:"In the current version of Cadence, pre-conditions and post-conditions may perform state changes, e.g., by calling a function that performs a mutation. This may result in unexpected behavior, which might lead to bugs."},{heading:"-motivation-4",content:"To make conditions predictable, they are no longer allowed to perform state changes."},{heading:"ℹ️-description-3",content:"Pre-conditions and post-conditions are now considered `view` contexts, meaning that any operations that would be prevented inside of a `view` function are also not permitted in a pre-condition or post-condition."},{heading:"ℹ️-description-3",content:"This is to prevent underhanded code wherein a user modifies global or contract state inside of a condition, where they are meant to simply be asserting properties of that state."},{heading:"ℹ️-description-3",content:"In particular, since only expressions were permitted inside conditions already, this means that if users wish to call any functions in conditions, these functions must now be made `view` functions."},{heading:"ℹ️-description-3",content:"This improvement was proposed in [FLIP 1056]. To learn more, please consult the FLIP and documentation."},{heading:"-adoption-3",content:`Conditions that perform mutations will now result in the error *Impure operation performed in view context*.
Adjust the code in the condition so it does not perform mutations.`},{heading:"-adoption-3",content:"The condition may be considered mutating, because it calls a mutating, i.e., non-`view` function. It might be possible to mark the called function as `view`, and the body of the function may need to get updated in turn."},{heading:"-example-3",content:"**Before:**"},{heading:"-example-3",content:"The function `withdraw` of a hypothetical NFT collection interface allows the withdrawal of an NFT with a specific ID. In its post-condition, the function states that at the end of the function, the collection should have exactly one fewer item than at the beginning of the function."},{heading:"-example-3",content:"**After:**"},{heading:"-example-3",content:"The calls to `getCount` in the post-condition are not allowed and result in the error *Impure operation performed in view context*, because the `getCount` function is considered a mutating function, as it does not have the `view` modifier."},{heading:"-example-3",content:"Here, as the `getCount` function only performs a read-only operation and does not change any state, it can be marked as `view`."},{heading:"-motivation-5",content:"Previously, missing or incorrect argument labels of function calls were not reported. This had the potential to confuse developers or readers of programs, and could potentially lead to bugs."},{heading:"ℹ️-description-4",content:"Function calls with missing argument labels are now reported with the error message *missing argument label*, and function calls with incorrect argument labels are now reported with the error message *incorrect argument label*."},{heading:"-adoption-4",content:"Function calls with missing argument labels should be updated to include the required argument labels."},{heading:"-adoption-4",content:"Function calls with incorrect argument labels should be fixed by providing the correct argument labels."},{heading:"-example-4",content:"Contract `TestContract` deployed at address `0x1`:"},{heading:"-example-4",content:"**Incorrect program**:"},{heading:"-example-4",content:"The initializer of `TestContract.TestStruct` expects the argument labels `first` and `second`."},{heading:"-example-4",content:"However, the call of the initializer provides the incorrect argument label `wrong` for the first argument, and is missing the label for the second argument."},{heading:"-example-4",content:"This now results in the following errors:"},{heading:"-example-4",content:"**Corrected program**:"},{heading:"-example-4",content:"We would like to thank community member @justjoolz for reporting this bug."},{heading:"-motivation-6",content:"Previously, incorrect operators in reference expressions were not reported."},{heading:"-motivation-6",content:"This had the potential to confuse developers or readers of programs, and could potentially lead to bugs."},{heading:"ℹ️-description-5",content:"The syntax for reference expressions is `&v as &T`, which represents taking a reference to value `v` as type `T`.\nReference expressions that used other operators, such as `as?` and `as!`, e.g., `&v as! &T`, were incorrect and were previously not reported as an error."},{heading:"ℹ️-description-5",content:"The syntax for reference expressions improved to just `&v`. The type of the resulting reference must still be provided explicitly.\nIf the type is not explicitly provided, the error *cannot infer type from reference expression: requires an explicit type annotation* is reported."},{heading:"ℹ️-description-5",content:"For example, existing expressions like `&v as &T` provide an explicit type, as they statically assert the type using `as &T`. Such expressions thus keep working and do *not* have to be changed."},{heading:"ℹ️-description-5",content:"Another way to provide the type for the reference is by explicitly typing the target of the expression, for example, in a variable declaration, e.g., via `let ref: &T = &v`."},{heading:"ℹ️-description-5",content:"This improvement was proposed in [FLIP 941]. To learn more, please consult the FLIP and documentation."},{heading:"-adoption-5",content:"Reference expressions which use an operator other than `as` need to be changed to use the `as` operator.\nIn cases where the type is already explicit, the static type assertion (`as &T`) can be removed."},{heading:"-example-5",content:"**Incorrect program**:\nThe reference expression uses the incorrect operator `as!`."},{heading:"-example-5",content:"This now results in the following error:"},{heading:"-example-5",content:"**Corrected program**:"},{heading:"-example-5",content:"Alternatively, the same code can now also be written as follows:"},{heading:"-motivation-7",content:"Previously, Cadence allowed language keywords (e.g., `continue`, `for`, etc.) to be used as names. For example, the following program was allowed:"},{heading:"-motivation-7",content:"This had the potential to confuse developers or readers of programs, and could potentially lead to bugs."},{heading:"ℹ️-description-6",content:`Most language keywords are no longer allowed to be used as names.
Some keywords are still allowed to be used as names, as they have limited significance within the language. These allowed keywords are as follows:`},{heading:"ℹ️-description-6",content:"`from`: only used in import statements `import foo from ...`"},{heading:"ℹ️-description-6",content:"`account`: used in access modifiers `access(account) let ...`"},{heading:"ℹ️-description-6",content:"`all`: used in access modifier `access(all) let ...`"},{heading:"ℹ️-description-6",content:"`view`: used as a modifier for function declarations and expressions `view fun foo()...`, let `f = view fun () ...`\nAny other keywords will raise an error during parsing, such as:"},{heading:"-adoption-6",content:"Names that use language keywords must be renamed."},{heading:"-example-6",content:`**Before:**
A variable is named after a language keyword.`},{heading:"-example-6",content:`**After:**
The variable is renamed to avoid the clash with the language keyword.`},{heading:"-motivation-8",content:"Previously, the implementation of `.toBigEndianBytes()` was incorrect for the large integer types `Int128`, `Int256`, `UInt128`, and `UInt256`."},{heading:"-motivation-8",content:"This had the potential to confuse developers or readers of programs, and could potentially lead to bugs."},{heading:"ℹ️-description-7",content:"Calling the `toBigEndianBytes` function on smaller sized integer types returns the exact number of bytes that fit into the type, left-padded with zeros. For instance, `Int64(1).toBigEndianBytes()` returns an array of 8 bytes, as the size of `Int64` is 64 bits, 8 bytes."},{heading:"ℹ️-description-7",content:"Previously, the `toBigEndianBytes` function erroneously returned variable-length byte arrays without padding for the large integer types `Int128`, `Int256`, `UInt128`, and `UInt256`. This was inconsistent with the smaller fixed-size numeric types, such as `Int8` and `Int32`."},{heading:"ℹ️-description-7",content:"To fix this inconsistency, `Int128` and `UInt128` now always return arrays of 16 bytes, while `Int256` and `UInt256` return 32 bytes."},{heading:"-adoption-7",content:"Programs that use `toBigEndianBytes` directly, or indirectly by depending on other programs, should be checked for how the result of the function is used. It might be necessary to adjust the code to restore existing behavior."},{heading:"-adoption-7",content:"If a program relied on the previous behavior of truncating the leading zeros, then the old behavior can be recovered by first converting to a variable-length type, `Int` or `UInt`, as the `toBigEndianBytes` function retains the variable-length byte representations, i.e., the result has no padding bytes."},{heading:"-motivation-9",content:"Previously, function types were expressed using a different syntax from function declarations or expressions. The previous syntax was unintuitive for developers, making it hard to write and read code that used function types."},{heading:"ℹ️-description-and--examples",content:"Function types are now expressed using the `fun` keyword, just like expressions and declarations. This improves readability and makes function types more obvious."},{heading:"ℹ️-description-and--examples",content:"For example, given the following function declaration:"},{heading:"ℹ️-description-and--examples",content:"The function `foo` now has the type `fun(Int8, String): Int16`.\nThe `:` token is right-associative, so functions that return other functions can have their types written without nested parentheses:"},{heading:"ℹ️-description-and--examples",content:"To further bring the syntax for function types closer to the syntax of function declarations expressions, it is now possible to omit the return type, in which case the return type defaults to `Void`."},{heading:"ℹ️-description-and--examples",content:"As a bonus consequence, it is now allowed for any type to be parenthesized. This is useful for complex type signatures, or for expressing optional functions:"},{heading:"ℹ️-description-and--examples",content:"This improvement was proposed in [FLIP 43]."},{heading:"-adoption-8",content:"Programs that use the old function type syntax need to be updated by replacing the surrounding parentheses of function types with the `fun` keyword."},{heading:"-adoption-8",content:"**Before:**"},{heading:"-adoption-8",content:"**After:**"},{heading:"-motivation-10",content:"Previously, Cadence’s main access-control mechanism, restricted reference types, has been a source of confusion and mistakes for contract developers."},{heading:"-motivation-10",content:"Developers new to Cadence often were surprised and did not understand why access-restricted functions, like the `withdraw` function of the fungible token `Vault` resource type, were declared as `pub`, making the function publicly accessible — access would later be restricted through a restricted type."},{heading:"-motivation-10",content:"It was too easy to accidentally give out a `Capability` with a more permissible type than intended, leading to security problems.\nAdditionally, because what fields and functions were available to a reference depended on what the type of the reference was, references could not be downcast, leading to ergonomic issues."},{heading:"ℹ️-description-8",content:"Access control has improved significantly.\nWhen giving another user a reference or `Capability` to a value you own, the fields and functions that the user can access is determined by the type of the reference or `Capability`."},{heading:"ℹ️-description-8",content:"Previously, access to a value of type `T`, e.g., via a reference `&T`, would give access to all fields and functions of `T`. Access could be restricted, by using a restricted type. For example, a restricted reference `&T{I}` could only access members that were `pub` on `I`. Since references could not be downcast, any members defined on `T` but not on `I` were unavailable to this reference, even if they were `pub`."},{heading:"ℹ️-description-8",content:"Access control is now handled using a new feature called Entitlements, as originally proposed across [FLIP 54] and [FLIP 94]."},{heading:"ℹ️-description-8",content:"A reference can now be *entitled* to certain facets of an object. For example, the reference `auth(Withdraw) &Vault` is entitled to access fields and functions of `Vault` which require the `Withdraw` entitlement."},{heading:"ℹ️-description-8",content:"Entitlements can be are declared using the new `entitlement` syntax."},{heading:"ℹ️-description-8",content:"Members can be made to require entitlements using the access modifier syntax `access(E)`, where `E` is an entitlement that the user must posses."},{heading:"ℹ️-description-8",content:"For example:"},{heading:"ℹ️-description-8",content:"References can now always be down-casted, the standalone `auth` modifier is not necessary anymore, and has been removed."},{heading:"ℹ️-description-8",content:"For example, the reference `&{Provider}` can now be downcast to `&Vault`, so access control is now handled entirely through entitlements, rather than types."},{heading:"ℹ️-description-8",content:"See [Entitlements] for more information."},{heading:"-adoption-9",content:"The access modifiers of fields and functions need to be carefully audited and updated."},{heading:"-adoption-9",content:"Fields and functions that have the `pub` access modifier are now callable by anyone with any reference to that type. If access to the member should be restricted, the `pub` access modifier needs to be replaced with an entitlement access modifier."},{heading:"-adoption-9",content:"When creating a `Capability` or a reference to a value, **it must be carefully considered which entitlements are provided to the recipient of that `Capability` or reference** — only the entitlements which are necessary and not more should be include in the `auth` modifier of the reference type."},{heading:"-example-8",content:"**Before:**\nThe `Vault` resource was originally written like so:"},{heading:"-example-8",content:"**After:**\nThe `Vault` resource might now be written like this:"},{heading:"-example-8",content:"Here, the `access(Withdraw)` syntax means that a reference to `Vault` must possess the `Withdraw` entitlement in order to be allowed to call the `withdraw` function, which can be given when a reference or `Capability` is created by using a new syntax: `auth(Withdraw) &Vault`."},{heading:"-example-8",content:"This would allow developers to safely downcast `&{Provider}` references to `&Vault` references if they want to access functions like `deposit` and `balance`, without enabling them to call `withdraw`."},{heading:"-motivation-11",content:"With the previously mentioned entitlements feature, which uses `access(E)` syntax to denote entitled access, the `pub`, `priv`, and `pub(set)` modifiers became the only access modifiers that did not use the `access` syntax."},{heading:"-motivation-11",content:"This made the syntax inconsistent, making it harder to read and understand programs."},{heading:"-motivation-11",content:"In addition, `pub` and `priv` already had alternatives/equivalents: `access(all)` and `access(self)`."},{heading:"ℹ️-description-9",content:"The `pub`, `priv` and `pub(set)` access modifiers are being removed from the language, in favor of their more explicit `access(all)` and `access(self)` equivalents (for `pub` and `priv`, respectively)."},{heading:"ℹ️-description-9",content:"This makes access modifiers more uniform and better match the new entitlements syntax."},{heading:"ℹ️-description-9",content:"This improvement was originally proposed in [FLIP 84]."},{heading:"-adoption-10",content:"Users should replace any `pub` modifiers with `access(all)`, and any `priv` modifiers with `access(self)`."},{heading:"-adoption-10",content:"Fields that were defined as `pub(set)` will no longer be publicly assignable, and no access modifier now exists that replicates this old behavior. If the field should stay publicly assignable, a `access(all)` setter function that updates the field needs to be added, and users have to switch to using it instead of directly assigning to the field."},{heading:"-example-9",content:"**Before:**\nTypes and members could be declared with `pub` and `priv`:"},{heading:"-example-9",content:"**After:**\nThe same behavior can be achieved with `access(all)` and `access(self)`"},{heading:"-motivation-12",content:"With the improvements to access control enabled by entitlements and safe down-casting, the restricted type feature is redundant."},{heading:"ℹ️-description-10",content:"Restricted types have been removed. All types, including references, can now be down-casted, restricted types are no longer used for access control."},{heading:"ℹ️-description-10",content:"At the same time intersection types got introduced. Intersection types have the syntax `{I1, I2, ... In}`, where all elements of the set of types (`I1, I2, ... In`) are interface types. A value is part of the intersection type if it conforms to all the interfaces in the intersection type’s interface set. This functionality is equivalent to restricted types that restricted `AnyStruct` and `AnyResource.`"},{heading:"ℹ️-description-10",content:"This improvement was proposed in [FLIP 85]. To learn more, please consult the FLIP and documentation."},{heading:"-adoption-11",content:"Code that relies on the restriction behavior of restricted types can be safely changed to just use the concrete type directly, as entitlements will make this safe. For example, `&Vault{Balance}` can be replaced with just `&Vault`, as access to `&Vault` only provides access to safe operations, like getting the balance — &#x2A;*privileged operations, like withdrawal, need additional entitlements.**"},{heading:"-adoption-11",content:"Code that uses `AnyStruct` or `AnyResource` explicitly as the restricted type, e.g., in a reference, `&AnyResource{I}`, needs to remove the use of `AnyStruct` / `AnyResource`. Code that already uses the syntax `&{I}` can stay as-is."},{heading:"-example-10",content:"**Before:**"},{heading:"-example-10",content:"This function accepted a reference to a `T` value, but restricted what functions were allowed to be called on it to those defined on the `X`, `Y`, and `Z` interfaces."},{heading:"-example-10",content:`**After:**
This function can be safely rewritten as:`},{heading:"-example-10",content:"Any functions on `T` that the author of `T` does not want users to be able to call publicly should be defined with entitlements, and thus will not be accessible to the unauthorized `param` reference, like with `qux` above."},{heading:"-motivation-13",content:"Previously, access to accounts was granted wholesale: Users would sign a transaction, authorizing the code of the transaction to perform any kind of operation, for example, write to storage, but also add keys or contracts."},{heading:"-motivation-13",content:"Users had to trust that a transaction would only perform supposed access, e.g., storage access to withdraw tokens, but still had to grant full access, which would allow the transaction to perform other operations."},{heading:"-motivation-13",content:"Dapp developers who require users to sign transactions should be able to request the minimum amount of access to perform the intended operation, i.e., developers should be able to follow the principle of least privilege (PoLA)."},{heading:"-motivation-13",content:"This allows users to trust the transaction and Dapp."},{heading:"ℹ️-description-11",content:"Previously, access to accounts was provided through the built-in types `AuthAccount` and `PublicAccount`: `AuthAccount` provided full *write* access to an account, whereas `PublicAccount` only provided *read* access."},{heading:"ℹ️-description-11",content:"With the introduction of entitlements, this access is now expressed using entitlements and references, and only a single `Account` type is necessary. In addition, storage related functionality were moved to the field `Account.storage`."},{heading:"ℹ️-description-11",content:"Access to administrative account operations, such as writing to storage, adding keys, or adding contracts, is now gated by both coarse grained entitlements (e.g., `Storage`, which grants access to all storage related functions, and `Keys`, which grants access to all key management functions), as well as fine-grained entitlements (e.g., `SaveValue` to save a value to storage, or `AddKey` to add a new key to the account)."},{heading:"ℹ️-description-11",content:"Transactions can now request the particular entitlements necessary to perform the operations in the transaction."},{heading:"ℹ️-description-11",content:"This improvement was proposed in [FLIP 92]. To learn more, consult the FLIP and the documentation."},{heading:"-adoption-12",content:"Code that previously used `PublicAccount` can simply be replaced with an unauthorized account reference, `&Account.`"},{heading:"-adoption-12",content:"Code that previously used `AuthAccount` must be replaced with an authorized account reference. Depending on what functionality of the account is accessed, the appropriate entitlements have to be specified."},{heading:"-adoption-12",content:"For example, if the `save` function of `AuthAccount` was used before, the function call must be replaced with `storage.save`, and the `SaveValue` or `Storage` entitlement is required."},{heading:"-example-11",content:"**Before:**"},{heading:"-example-11",content:"The transactions wants to save a value to storage. It must request access to the whole account, even though it does not need access beyond writing to storage."},{heading:"-example-11",content:"**After:**"},{heading:"-example-11",content:"The transaction requests the fine-grained account entitlement `SaveValue`, which allows the transaction to call the `save` function."},{heading:"-example-11",content:"If the transaction attempts to perform other operations, such as adding a new key, it is rejected:"},{heading:"-motivation-14",content:"Cadence provides two key management APIs:"},{heading:"-motivation-14",content:"The original, low-level API, which worked with RLP-encoded keys"},{heading:"-motivation-14",content:"The improved, high-level API, which works with convenient data types like `PublicKey`, `HashAlgorithm`, and `SignatureAlgorithm`\nThe improved API was introduced, as the original API was difficult to use and error-prone.\nThe original API was deprecated in early 2022."},{heading:"ℹ️-description-12",content:`The original account key management API has been removed. Instead, the improved key management API should be used.
To learn more,`},{heading:"-adoption-13",content:"Replace uses of the original account key management API functions with equivalents of the improved API:"},{heading:"-adoption-13",content:"Removed"},{heading:"-adoption-13",content:"Replacement"},{heading:"-adoption-13",content:"AuthAccount.addPublicKey"},{heading:"-adoption-13",content:"Account.keys.add"},{heading:"-adoption-13",content:"AuthAccount.removePublicKey"},{heading:"-adoption-13",content:"Account.keys.revoke"},{heading:"-adoption-13",content:"See [Account keys] for more information."},{heading:"-example-12",content:"**Before:**"},{heading:"-example-12",content:"**After:**"},{heading:"-motivation-15",content:`Previously, resource tracking for optional bindings (*if-let statements*) was implemented incorrectly, leading to errors for valid code.
This required developers to add workarounds to their code.`},{heading:"ℹ️-description-13",content:"Resource tracking for optional bindings (*if-let statements*) was fixed."},{heading:"ℹ️-description-13",content:"For example, the following program used to be invalid, reporting a resource loss error for `optR`:"},{heading:"ℹ️-description-13",content:"This program is now considered valid."},{heading:"-adoption-14",content:"New programs do not need workarounds anymore, and can be written naturally."},{heading:"-adoption-14",content:"Programs that previously resolved the incorrect resource loss error with a workaround, for example by invalidating the resource also in the else-branch or after the if-statement, are now invalid:"},{heading:"-adoption-14",content:"The unnecessary workaround needs to be removed."},{heading:"-motivation-16",content:"Definite return analysis determines if a function always exits, in all possible execution paths, e.g., through a `return` statement, or by calling a function that never returns, like `panic`."},{heading:"-motivation-16",content:"This analysis was incomplete and required developers to add workarounds to their code."},{heading:"ℹ️-description-14",content:"The definite return analysis got significantly improved."},{heading:"ℹ️-description-14",content:"This means that the following program is now accepted: both branches of the if-statement exit, one using a `return` statement, the other using a function that never returns, `panic`:"},{heading:"ℹ️-description-14",content:"The program above was previously rejected with a *missing return statement* error — even though we can convince ourselves that the function will exit in both branches of the if-statement, and that any code after the if-statement is unreachable, the type checker was not able to detect that — it now does."},{heading:"-adoption-15",content:`New programs do not need workarounds anymore, and can be written naturally.
Programs that previously resolved the incorrect error with a workaround, for example by adding an additional exit at the end of the function, are now invalid:`},{heading:"-adoption-15",content:"The improved type checker now detects and reports the unreachable code after the if-statement as an error:"},{heading:"-adoption-15",content:"To make the code valid, simply remove the unreachable code."},{heading:"-motivation-17",content:"Previously, the iteration variable of `for-in` loops was re-assigned on each iteration."},{heading:"-motivation-17",content:"Even though this is a common behavior in many programming languages, it is surprising behavior and a source of bugs."},{heading:"-motivation-17",content:"The behavior was improved to the often assumed/expected behavior of a new iteration variable being introduced for each iteration, which reduces the likelihood for a bug."},{heading:"ℹ️-description-15",content:"The behavior of `for-in` loops improved, so that a new iteration variable is introduced for each iteration."},{heading:"ℹ️-description-15",content:"This change only affects a few programs, as the behavior change is only noticeable if the program captures the iteration variable in a function value (closure)."},{heading:"ℹ️-description-15",content:"This improvement was proposed in [FLIP 13]. To learn more, consult the FLIP and documentation."},{heading:"-example-13",content:"Previously, `values` would result in `[3, 3, 3]`, which might be surprising and unexpected. This is because `x` was *reassigned* the current array element on each iteration, leading to each function in `fs` returning the last element of the array."},{heading:"-motivation-18",content:"Previously, when a reference is taken to a resource, that reference remains valid even if the resource was moved, for example when created and moved into an account, or moved from one account into another."},{heading:"-motivation-18",content:"In other words, references to resources stayed alive forever. This could be a potential safety foot-gun, where one could gain/give/retain unintended access to resources through references."},{heading:"ℹ️-description-16",content:"References are now invalidated if the referenced resource is moved after the reference was taken. The reference is invalidated upon the first move, regardless of the origin and the destination."},{heading:"ℹ️-description-16",content:"This feature was proposed in [FLIP 1043]. To learn more, please consult the FLIP and documentation."},{heading:"-example-14",content:"Old behavior:"},{heading:"-example-14",content:"The above operation will now result in a static error."},{heading:"-example-14",content:"However, not all scenarios can be detected statically. e.g:"},{heading:"-example-14",content:"In the above function, it is not possible to determine whether the resource to which the reference was taken has been moved or not. Therefore, such cases are checked at run-time, and a run-time error will occur if the resource has been moved."},{heading:"-adoption-16",content:"Review code that uses references to resources, and check for cases where the referenced resource is moved. Such code may now be reported as invalid, or result in the program being aborted with an error when a reference to a moved resource is de-referenced."},{heading:"-motivation-19",content:"Cadence encourages a capability-based security model. Capabilities are themselves a new concept that most Cadence programmers need to understand."},{heading:"-motivation-19",content:"The existing API for capabilities was centered around *links* and *linking*, and the associated concepts of the public and private storage domains led to capabilities being even confusing and awkward to use."},{heading:"-motivation-19",content:"A better API is easier to understand and easier to work with."},{heading:"ℹ️-description-17",content:"The existing linking-based capability API has been replaced by a more powerful and easier-to-use API based on the notion of Capability Controllers. The new API makes the creation of new capabilities and the revocation of existing capabilities simpler."},{heading:"ℹ️-description-17",content:"This improvement was proposed in [FLIP 798]. To learn more, consult the FLIP and the documentation."},{heading:"-adoption-17",content:"Existing uses of the linking-based capability API must be replaced with the new Capability Controller API."},{heading:"-adoption-17",content:"Removed"},{heading:"-adoption-17",content:"Replacement"},{heading:"-adoption-17",content:"`AuthAccount.link`, with private path"},{heading:"-adoption-17",content:"`Account.capabilities.storage.issue`"},{heading:"-adoption-17",content:"`AuthAccount.link`, with public path"},{heading:"-adoption-17",content:"`Account.capabilities.storage.issue` and `Account.capabilities.publish`"},{heading:"-adoption-17",content:"`AuthAccount.linkAccount`"},{heading:"-adoption-17",content:"`AuthAccount.capabilities.account.issue`"},{heading:"-adoption-17",content:"`AuthAccount.unlink`, with private path"},{heading:"-adoption-17",content:"- Get capability controller: `Account.capabilities.storage/account.get`  - Revoke controller: `Storage/AccountCapabilityController.delete`"},{heading:"-adoption-17",content:"`AuthAccount.unlink`, with public path"},{heading:"-adoption-17",content:"- Get capability controller: `Account.capabilities.storage/account.get`  - Revoke controller: `Storage/AccountCapabilityController.delete`  - Unpublish capability: `Account.capabilities.unpublish`"},{heading:"-adoption-17",content:"`AuthAccount/PublicAccount.getCapability`"},{heading:"-adoption-17",content:"`Account.capabilities.get`"},{heading:"-adoption-17",content:"`AuthAccount/PublicAccount.getCapability` with followed borrow"},{heading:"-adoption-17",content:"`Account.capabilities.borrow`"},{heading:"-adoption-17",content:"`AuthAccount.getLinkTarget`"},{heading:"-adoption-17",content:"N/A"},{heading:"-example-15",content:"Assume there is a `Counter` resource which stores a count, and it implements an interface `HasCount` which is used to allow read access to the count."},{heading:"-example-15",content:"Granting access, before:"},{heading:"-example-15",content:"Granting access, after:"},{heading:"-example-15",content:"Getting access, before:"},{heading:"-example-15",content:"Getting access, after:"},{heading:"-motivation-20",content:"A previous version of Cadence (*Secure Cadence*), attempted to prevent a common safety foot-gun: Developers might use the `let` keyword for a container-typed field, assuming it would be immutable."},{heading:"-motivation-20",content:"Though Secure Cadence implements the [Cadence mutability restrictions FLIP], it did not fully solve the problem / prevent the foot-gun and there were still ways to mutate such fields, so a proper solution was devised."},{heading:"-motivation-20",content:"To learn more about the problem and motivation to solve it, please read the associated [Vision] document."},{heading:"ℹ️-description-18",content:`The mutability of containers (updating a field of a composite value, key of a map, or index of an array) through references has changed:
When a field/element is accessed through a reference, a reference to the accessed inner object is returned, instead of the actual object. These returned references are unauthorized by default, and the author of the object (struct/resource/etc.) can control what operations are permitted on these returned references by using entitlements and entitlement mappings.
This improvement was proposed in two FLIPs:`},{heading:"ℹ️-description-18",content:"[FLIP 89: Change Member Access Semantics]"},{heading:"ℹ️-description-18",content:"[FLIP 86: Introduce Built-in Mutability Entitlements]"},{heading:"ℹ️-description-18",content:"To learn more, please consult the FLIPs and the documentation."},{heading:"-adoption-18",content:"As mentioned in the previous section, the most notable change in this improvement is that, when a field/element is accessed through a reference, a reference to the accessed inner object is returned, instead of the actual object. So developers would need to change their code to:"},{heading:"-adoption-18",content:"Work with references, instead of the actual object, when accessing nested objects through a reference."},{heading:"-adoption-18",content:"Use proper entitlements for fields when they declare their own `struct` and `resource` types."},{heading:"-example-16",content:"Consider the followinbg resource collection:"},{heading:"-example-16",content:"Earlier, it was possible to mutate the inner collections, even if someone only had a reference to the `MasterCollection`. e.g:"},{heading:"-example-16",content:"Once this change is introduced, the above collection can be re-written as below:"},{heading:"-example-16",content:"Then for a reference with no entitlements, none of the previously mentioned operations would be allowed:"},{heading:"-example-16",content:"To perform these operations on the reference, one would need to have obtained a reference with proper entitlements:"},{heading:"-motivation-21",content:"[Nested Type Requirements] were a fairly advanced concept of the language."},{heading:"-motivation-21",content:"Just like an interface could require a conforming type to provide a certain field or function, it could also have required the conforming type to provide a nested type."},{heading:"-motivation-21",content:"This is an uncommon feature in other programming languages and hard to understand."},{heading:"-motivation-21",content:"In addition, the value of nested type requirements was never realized. While it was previously used in the FT and NFT contracts, the addition of other language features like interface inheritance and events being emittable from interfaces, there were no more uses case compelling enough to justify a feature of this complexity."},{heading:"ℹ️-description-19",content:"Contract interfaces can no longer declare any concrete types (`struct`, `resource` or `enum`) in their declarations, as this would create a type requirement. `event` declarations are still allowed, but these create an `event` type limited to the scope of that contract interface; this `event` is not inherited by any implementing contracts. Nested interface declarations are still permitted, however."},{heading:"ℹ️-description-19",content:"This improvement was proposed in [FLIP 118]."},{heading:"-adoption-19",content:"Any existing code that made use of the type requirements feature should be rewritten not to use this feature."},{heading:"-motivation-22",content:"In order to support the removal of nested type requirements, events have been made define-able and emit-able from contract interfaces, as events were among the only common uses of the type requirements feature."},{heading:"ℹ️-description-20",content:"Contract interfaces may now define event types, and these events can be emitted from function conditions and default implementations in those contract interfaces."},{heading:"ℹ️-description-20",content:"This improvement was proposed in [FLIP 111]."},{heading:"-adoption-20",content:"Contract interfaces that previously used type requirements to enforce that concrete contracts that implement the interface should also declare a specific event, should instead define and emit that event in the interface."},{heading:"-example-17",content:"**Before:**"},{heading:"-example-17",content:"A contract interface like the one below (`SomeInterface`) used a type requirement to enforce that contracts which implement the interface also define a certain event (`Foo`):"},{heading:"-example-17",content:"**After:**"},{heading:"-example-17",content:"This can be rewritten to emit the event directly from the interface, so that any contracts that implement `Intf` will always emit `Foo` when `inheritedFunction` is called:"},{heading:"-motivation-23",content:"It was previously possible to panic in the body of a resource or attachment’s `destroy` method, effectively preventing the destruction or removal of that resource from an account. This could be used as an attack vector by handing people undesirable resources or hydrating resources to make them extremely large or otherwise contain undesirable content."},{heading:"ℹ️-description-21",content:"Contracts may no longer define `destroy` functions on their resources, and are no longer required to explicitly handle the destruction of resource fields. These will instead be implicitly destroyed whenever a resource is destroyed.\nAdditionally, developers may define a `ResourceDestroyed` event in the body of a resource definition using default arguments, which will be lazily evaluated and then emitted whenever a resource of that type is destroyed.\nThis improvement was proposed in [FLIP 131]."},{heading:"-adoption-21",content:"Contracts that previously used destroy methods will need to remove them, and potentially define a ResourceDestroyed event to track destruction if necessary."},{heading:"-example-18",content:"A pair of resources previously written as:"},{heading:"-example-18",content:"can now be equivalently written as:"},{heading:"-motivation-24",content:'`KeyList`’s `verify` function used to hardcode the domain separation tag (`"FLOW-V0.0-user"`) used to verify each signature from the list. This forced users to use the same domain tag and didn’t allow them to scope their signatures to specific use-cases and applications. Moreover, the `verify` function didn’t mirror the `PublicKey` signature verification behavior which accepts a domain tag parameter.'},{heading:"ℹ️-description-22",content:"`KeyList`’s `verify` function requires an extra parameter to specify the domain separation tag used to verify the input signatures. The tag is is a single `string` parameter and is used with all signatures. This mirrors the behavior of the simple public key (see  [Signature verification] for more information)."},{heading:"-adoption-22",content:'Contracts that use `KeyList` need to update the calls to `verify` by adding the new domain separation tag parameter. Using the tag as `"FLOW-V0.0-user"` would keep the exact same behavior as before the breaking change. Applications may also define a new domain tag for their specific use-case and use it when generating valid signatures, for added security against signature replays. See [Signature verification] and specifically [Hashing with a domain tag] for details on how to generate valid signatures with a tag.'},{heading:"-example-19",content:"A previous call to `KeyList`’s `verify` is written as:"},{heading:"-example-19",content:"can now be equivalently written as:"},{heading:"-example-19",content:'Instead of the existing hardcoded domain separation tag, a new domain tag can be defined, but it has to be also used when generating valid signatures, e.g., `"my_app_custom_domain_tag"`.'},{heading:"ft--nft-standard-changes",content:"In addition to the upcoming language changes, the Cadence 1.0 upgrade also includes breaking changes to core contracts, such as the FungibleToken and NonFungibleToken standards. All Fungible and Non-Fungible Token contracts will need to be updated to the new standard."},{heading:"ft--nft-standard-changes",content:"These interfaces are being upgraded to allow for multiple tokens per contract, fix some issues with the original standards, and introduce other various improvements suggested by the community."},{heading:"ft--nft-standard-changes",content:"Original Proposal: [Flow forum]"},{heading:"ft--nft-standard-changes",content:"Fungible Token Changes PR (WIP): [V2 FungibleToken Standard by joshuahannan — Pull Request #77 — onflow/flow-ft]"},{heading:"ft--nft-standard-changes",content:"NFT Changes PR: [GitHub]"},{heading:"ft--nft-standard-changes",content:"It will involve upgrading your token contracts with changes to events, function signatures, resource interface conformances, and other small changes."},{heading:"ft--nft-standard-changes",content:"There are some existing guides for upgrading your token contracts to the new standard:"},{heading:"ft--nft-standard-changes",content:"[Upgrading Fungible Token Contracts]"},{heading:"ft--nft-standard-changes",content:"[Upgrading Non-Fungible Token Contracts]"},{heading:"more-resources",content:"If you have any questions or need help with the upgrade, feel free to reach out to the Flow team on the [Flow Discord]."},{heading:"more-resources",content:"Help is also available during the [Cadence 1.0 Office Hours] each week at 10:00AM PST on the Flow Developer Discord."}],headings:[{id:"-new-features",content:"💫 New features"},{id:"-motivation",content:"💡 Motivation"},{id:"ℹ️-description",content:"ℹ️ Description"},{id:"-adoption",content:"🔄 Adoption"},{id:"-example",content:"✨ Example"},{id:"-motivation-1",content:"💡 Motivation"},{id:"ℹ️-description-and--example",content:"ℹ️ Description and ✨ Example"},{id:"-breaking-improvements",content:"⚡ Breaking improvements"},{id:"-motivation-2",content:"💡 Motivation"},{id:"ℹ️-description-1",content:"ℹ️ Description"},{id:"-adoption-1",content:"🔄 Adoption"},{id:"-example-1",content:"✨ Example"},{id:"-motivation-3",content:"💡 Motivation"},{id:"ℹ️-description-2",content:"ℹ️ Description"},{id:"-adoption-2",content:"🔄 Adoption"},{id:"-example-2",content:"✨ Example"},{id:"-motivation-4",content:"💡 Motivation"},{id:"ℹ️-description-3",content:"ℹ️ Description"},{id:"-adoption-3",content:"🔄 Adoption"},{id:"-example-3",content:"✨ Example"},{id:"-motivation-5",content:"💡 Motivation"},{id:"ℹ️-description-4",content:"ℹ️ Description"},{id:"-adoption-4",content:"🔄 Adoption"},{id:"-example-4",content:"✨ Example"},{id:"-motivation-6",content:"💡 Motivation"},{id:"ℹ️-description-5",content:"ℹ️ Description"},{id:"-adoption-5",content:"🔄 Adoption"},{id:"-example-5",content:"✨ Example"},{id:"-motivation-7",content:"💡 Motivation"},{id:"ℹ️-description-6",content:"ℹ️ Description"},{id:"-adoption-6",content:"🔄 Adoption"},{id:"-example-6",content:"✨ Example"},{id:"-motivation-8",content:"💡 Motivation"},{id:"ℹ️-description-7",content:"ℹ️ Description"},{id:"-example-7",content:"✨ Example"},{id:"-adoption-7",content:"🔄 Adoption"},{id:"-motivation-9",content:"💡 Motivation"},{id:"ℹ️-description-and--examples",content:"ℹ️ Description and ✨ examples"},{id:"-adoption-8",content:"🔄 Adoption"},{id:"-motivation-10",content:"💡 Motivation"},{id:"ℹ️-description-8",content:"ℹ️ Description"},{id:"-adoption-9",content:"🔄 Adoption"},{id:"-example-8",content:"✨ Example"},{id:"-motivation-11",content:"💡 Motivation"},{id:"ℹ️-description-9",content:"ℹ️ Description"},{id:"-adoption-10",content:"🔄 Adoption"},{id:"-example-9",content:"✨ Example"},{id:"-motivation-12",content:"💡 Motivation"},{id:"ℹ️-description-10",content:"ℹ️ Description"},{id:"-adoption-11",content:"🔄 Adoption"},{id:"-example-10",content:"✨ Example"},{id:"-motivation-13",content:"💡 Motivation"},{id:"ℹ️-description-11",content:"ℹ️ Description"},{id:"-adoption-12",content:"🔄 Adoption"},{id:"-example-11",content:"✨ Example"},{id:"-motivation-14",content:"💡 Motivation"},{id:"ℹ️-description-12",content:"ℹ️ Description"},{id:"-adoption-13",content:"🔄 Adoption"},{id:"-example-12",content:"✨ Example"},{id:"-motivation-15",content:"💡 Motivation"},{id:"ℹ️-description-13",content:"ℹ️ Description"},{id:"-adoption-14",content:"🔄 Adoption"},{id:"-motivation-16",content:"💡 Motivation"},{id:"ℹ️-description-14",content:"ℹ️ Description"},{id:"-adoption-15",content:"🔄 Adoption"},{id:"-motivation-17",content:"💡 Motivation"},{id:"ℹ️-description-15",content:"ℹ️ Description"},{id:"-example-13",content:"✨ Example"},{id:"-motivation-18",content:"💡 Motivation"},{id:"ℹ️-description-16",content:"ℹ️ Description"},{id:"-example-14",content:"✨ Example"},{id:"-adoption-16",content:"🔄 Adoption"},{id:"-motivation-19",content:"💡 Motivation"},{id:"ℹ️-description-17",content:"ℹ️ Description"},{id:"-adoption-17",content:"🔄 Adoption"},{id:"-example-15",content:"✨ Example"},{id:"-motivation-20",content:"💡 Motivation"},{id:"ℹ️-description-18",content:"ℹ️ Description"},{id:"-adoption-18",content:"🔄 Adoption"},{id:"-example-16",content:"✨ Example"},{id:"-motivation-21",content:"💡 Motivation"},{id:"ℹ️-description-19",content:"ℹ️ Description"},{id:"-adoption-19",content:"🔄 Adoption"},{id:"-motivation-22",content:"💡 Motivation"},{id:"ℹ️-description-20",content:"ℹ️ Description"},{id:"-adoption-20",content:"🔄 Adoption"},{id:"-example-17",content:"✨ Example"},{id:"-motivation-23",content:"💡 Motivation"},{id:"ℹ️-description-21",content:"ℹ️ Description"},{id:"-adoption-21",content:"🔄 Adoption"},{id:"-example-18",content:"✨ Example"},{id:"-motivation-24",content:"💡 Motivation"},{id:"ℹ️-description-22",content:"ℹ️ Description"},{id:"-adoption-22",content:"🔄 Adoption"},{id:"-example-19",content:"✨ Example"},{id:"ft--nft-standard-changes",content:"FT / NFT standard changes"},{id:"more-resources",content:"More resources"}]};const r=[{depth:2,url:"#-new-features",title:e.jsx(e.Fragment,{children:"💫 New features"})},{depth:4,url:"#-motivation",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-1",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-and--example",title:e.jsx(e.Fragment,{children:"ℹ️ Description and ✨ Example"})},{depth:2,url:"#-breaking-improvements",title:e.jsx(e.Fragment,{children:"⚡ Breaking improvements"})},{depth:4,url:"#-motivation-2",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-1",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-1",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-1",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-3",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-2",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-2",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-2",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-4",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-3",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-3",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-3",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-5",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-4",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-4",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-4",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-6",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-5",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-5",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-5",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-7",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-6",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-6",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-6",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-8",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-7",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-example-7",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-adoption-7",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-motivation-9",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-and--examples",title:e.jsx(e.Fragment,{children:"ℹ️ Description and ✨ examples"})},{depth:4,url:"#-adoption-8",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-motivation-10",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-8",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-9",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-8",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-11",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-9",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-10",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-9",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-12",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-10",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-11",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-10",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-13",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-11",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-12",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-11",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-14",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-12",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-13",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-12",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-15",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-13",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-14",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-motivation-16",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-14",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-15",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-motivation-17",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-15",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-example-13",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-18",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-16",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-example-14",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-adoption-16",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-motivation-19",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-17",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-17",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-15",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-20",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-18",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-18",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-16",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-21",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-19",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-19",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-motivation-22",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-20",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-20",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-17",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-23",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-21",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-21",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-18",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:4,url:"#-motivation-24",title:e.jsx(e.Fragment,{children:"💡 Motivation"})},{depth:4,url:"#ℹ️-description-22",title:e.jsx(e.Fragment,{children:"ℹ️ Description"})},{depth:4,url:"#-adoption-22",title:e.jsx(e.Fragment,{children:"🔄 Adoption"})},{depth:4,url:"#-example-19",title:e.jsx(e.Fragment,{children:"✨ Example"})},{depth:2,url:"#ft--nft-standard-changes",title:e.jsx(e.Fragment,{children:"FT / NFT standard changes"})},{depth:2,url:"#more-resources",title:e.jsx(e.Fragment,{children:"More resources"})}];function n(s){const i={a:"a",code:"code",em:"em",h2:"h2",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"-new-features",children:"💫 New features"}),`
`,e.jsx(i.p,{children:"Cadence 1.0 was released in October of 2024.  This page provides a historical reference of changes."}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["View Functions added (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220715-cadence-purity-analysis.md",children:"FLIP 1056"}),")"]}),e.jsx(i.h4,{id:"-motivation",children:"💡 Motivation"}),e.jsx(i.p,{children:"View functions enable developers to enhance the reliability and safety of their programs, facilitating a clearer understanding of the impacts of their own code and that of others."}),e.jsxs(i.p,{children:["Developers can mark their functions as ",e.jsx(i.code,{children:"view"}),", which disallows the function from performing state changes. That also makes the intent of functions clear to other programmers, as it allows them to distinguish between functions that change state and ones that do not."]}),e.jsx(i.h4,{id:"ℹ️-description",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["Cadence has added support for annotating functions with the ",e.jsx(i.code,{children:"view"})," keyword, which enforces that no ",e.jsx(i.em,{children:"mutating"})," operations occur inside the body of the function. The ",e.jsx(i.code,{children:"view"})," keyword is placed before the ",e.jsx(i.code,{children:"fun"})," keyword in a function declaration or function expression."]}),e.jsxs(i.p,{children:["If a function has no ",e.jsx(i.code,{children:"view"})," annotation, it is considered ",e.jsx(i.em,{children:"non-view"}),", and users should encounter no difference in behavior in these functions from what they are used to."]}),e.jsxs(i.p,{children:["If a function does have a ",e.jsx(i.code,{children:"view"})," annotation, then the following mutating operations are not allowed:"]}),e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Writing to, modifying, or destroying any resources"}),`
`,e.jsx(i.li,{children:"Writing to or modifying any references"}),`
`,e.jsxs(i.li,{children:["Assigning to or modifying any variables that cannot be determined to have been created locally inside of the ",e.jsx(i.code,{children:"view"})," function in question. In particular, this means that captured and global variables cannot be written in these functions"]}),`
`,e.jsxs(i.li,{children:["Calling a non-",e.jsx(i.code,{children:"view"})," function"]}),`
`]}),e.jsxs(i.p,{children:["This feature was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220715-cadence-purity-analysis.md",children:"FLIP 1056"}),". To learn more, please consult the FLIP and documentation."]}),e.jsx(i.h4,{id:"-adoption",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["You can adopt view functions by adding the ",e.jsx(i.code,{children:"view"})," modifier to all functions that do not perform mutating operations."]}),e.jsx(i.h4,{id:"-example",children:"✨ Example"}),e.jsxs(i.p,{children:[`Before:
The function `,e.jsx(i.code,{children:"getCount"})," of a hypothetical NFT collection returns the number of NFTs in the collection."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownedNFTs: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NonFungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" () {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".ownedNFTs "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    returnself.ownedNFTs.length"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  /* ... rest of implementation ... */"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:[`After:
The function `,e.jsx(i.code,{children:"getCount"})," does not perform any state changes, it only reads the length of the collection and returns it. Therefore it can be marked as ",e.jsx(i.code,{children:"view."})]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    view "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//  ^^^^ addedreturnself.ownedNFTs.length"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Interface Inheritance Added (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20221024-interface-inheritance.md",children:"FLIP 40"}),")"]}),e.jsx(i.h4,{id:"-motivation-1",children:"💡 Motivation"}),e.jsx(i.p,{children:`Previously, interfaces could not inherit from other interfaces, which required developers to repeat code.
Interface inheritance allows code abstraction and code reuse.`}),e.jsx(i.h4,{id:"ℹ️-description-and--example",children:"ℹ️ Description and ✨ Example"}),e.jsx(i.p,{children:"Interfaces can now inherit from other interfaces of the same kind. This makes it easier for developers to structure their conformances and reduces a lot of redundant code."}),e.jsxs(i.p,{children:["For example, suppose there are two resource interfaces, ",e.jsx(i.code,{children:"Receiver"})," and ",e.jsx(i.code,{children:"Vault"}),", and suppose all implementations of the ",e.jsx(i.code,{children:"Vault"})," would also need to conform to the interface ",e.jsx(i.code,{children:"Receiver"}),"."]}),e.jsxs(i.p,{children:["Previously, there was no way to enforce this. Anyone who implements the ",e.jsx(i.code,{children:"Vault"})," would have to explicitly specify that their concrete type also implements the ",e.jsx(i.code,{children:"Receiver"}),`. But it was not always guaranteed that all implementations would follow this informal agreement.
With interface inheritance, the `,e.jsx(i.code,{children:"Vault"})," interface can now inherit/conform to the ",e.jsx(i.code,{children:"Receiver"})," interface."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Receiver"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ something:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ amount: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:["Thus, anyone implementing the ",e.jsx(i.code,{children:"Vault"})," interface would also have to implement the ",e.jsx(i.code,{children:"Receiver"})," interface as well."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyVault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // Required!"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ amount: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // Required!"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ something:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:["This feature was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20221024-interface-inheritance.md",children:"FLIP 40"}),". To learn more, please consult the FLIP and documentation."]})]}),`
`,e.jsx(i.h2,{id:"-breaking-improvements",children:"⚡ Breaking improvements"}),`
`,e.jsx(i.p,{children:"Many of the improvements of Cadence 1.0 are fundamentally changing how Cadence works and how it is used. However, that also means it is necessary to break existing code to release this version, which will guarantee stability (no more planned breaking changes) going forward."}),`
`,e.jsx(i.p,{children:"Once Cadence 1.0 is live, breaking changes will simply not be acceptable."}),`
`,e.jsx(i.p,{children:"So we have, and need to use, this last chance to fix and improve Cadence, so it can deliver on its promise of being a language that provides security and safety, while also providing composability and simplicity."}),`
`,e.jsx(i.p,{children:"We fully recognize the frustration developers feel when updates break their code, necessitating revisions. Nonetheless, we are convinced that this inconvenience is justified by the substantial enhancements to Cadence development. These improvements not only make development more effective and enjoyable but also empower developers to write and deploy immutable contracts."}),`
`,e.jsx(i.p,{children:"The improvements were intentionally bundled into one release to avoid breaking Cadence programs multiple times."}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:[" ",e.jsx(i.strong,{children:"2024-04-24"})," Public Capability Acquisition No Longer Returns Optional Capabilities (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20240123-capcon-get-capability-api-improvement.md",children:"FLIP 242"}),")"]}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Note"})," This is a recent change that may not be reflected in emulated migrations or all tools yet.  Likewise, this may affect existing staged contracts which do not conform to this new requirement.  Please ensure your contracts are updated and re-staged, if necessary, to match this new requirement."]}),e.jsx(i.h4,{id:"-motivation-2",children:"💡 Motivation"}),e.jsxs(i.p,{children:["In the initial implementation of the new Capability Controller API (a change that is new in Cadence 1.0, proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220203-capability-controllers.md",children:"FLIP 798"}),"), ",e.jsx(i.code,{children:"capabilities.get<T>"})," would return an optional capability, ",e.jsx(i.code,{children:"Capability<T>?"}),".  When the no capability was published under the requested path, or when type argument ",e.jsx(i.code,{children:"T"})," was not a subtype of the runtime type of the capability published under the requested path, the capability would be ",e.jsx(i.code,{children:"nil"}),"."]}),e.jsxs(i.p,{children:["This was a source of confusion among developers, as previously ",e.jsx(i.code,{children:"account.getCapability<T>"})," did not return an optional capability, but rather one that would simply fail ",e.jsx(i.code,{children:"capability.borrow"})," if the capability was invalid."]}),e.jsxs(i.p,{children:["It was concluded that this new behavior was not ideal, and that there a benefit to an invalid Capability not being ",e.jsx(i.code,{children:"nil"}),", even if it is not borrowable. A ",e.jsx(i.code,{children:"nil"})," capability lacked information that was previously available with an invalid capability - primarily the type and address of the capability.  Developers may have wanted to make use of this information, and react to the capability being invalid, as opposed to an uninformative ",e.jsx(i.code,{children:"nil"})," value and encountering a panic scenario."]}),e.jsx(i.h4,{id:"ℹ️-description-1",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"capabilities.get<T>"})," function now returns an invalid capability when no capability is published under the requested path, or when the type argument ",e.jsx(i.code,{children:"T"})," is not a subtype of the runtime type of the capability published under the requested path."]}),e.jsx(i.p,{children:"This capability has the following properties:"}),e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Always return ",e.jsx(i.code,{children:"false"})," when ",e.jsx(i.code,{children:"Capability<T>.check"})," is called."]}),`
`,e.jsxs(i.li,{children:["Always return ",e.jsx(i.code,{children:"nil"})," when ",e.jsx(i.code,{children:"Capability<T>.borrow"})," is called."]}),`
`,e.jsxs(i.li,{children:["Have an ID of ",e.jsx(i.code,{children:"0"}),"."]}),`
`,e.jsxs(i.li,{children:["Have a runtime type that is the same as the type requested in the type argument of ",e.jsx(i.code,{children:"capabilities.get<T>"}),"."]}),`
`]}),e.jsx("br",{}),e.jsx(i.h4,{id:"-adoption-1",children:"🔄 Adoption"}),e.jsx(i.p,{children:"If you have not updated your code to Cadence 1.0 yet, you will need to follow the same guidelines for updating to the Capability Controller API as you would have before, but you will need to handle the new invalid capability type instead of an optional capability."}),e.jsxs(i.p,{children:["If you have already updated your code to use ",e.jsx(i.code,{children:"capabilities.get<T>"}),", and are handling the capability as an optional type, you may need to update your code to handle the new non-optional invalid capability type instead."]}),e.jsx(i.h4,{id:"-example-1",children:"✨ Example"}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"Before:"})}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.get"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MyNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFTCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Handle the case where the capability is nil"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"After:"})}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.get"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MyNFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFTCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" !"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"capability."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"check"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Handle the case where the capability is invalid"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:[e.jsx(i.strong,{children:"2024-04-23"})," Matching Access Modifiers for Interface Implementation Members are now Required (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20240415-remove-non-public-entitled-interface-members.md",children:"FLIP 262"}),")"]}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Note"})," This is a recent change that may not be reflected in emulated migrations or all tools yet.  Likewise, this may affect existing staged contracts which do not conform to this new requirement.  Please ensure your contracts are updated and re-staged, if necessary, to match this new requirement."]}),e.jsx(i.h4,{id:"-motivation-3",children:"💡 Motivation"}),e.jsx(i.p,{children:`Previously, the access modifier of a member in a type conforming to / implementing an interface
could not be more restrictive than the access modifier of the member in the interface.
That meant an implementation may have choosen to use a more permissive access modifier than the interface.`}),e.jsxs(i.p,{children:[`This may have been surprising to developers, as they may have assumed that the access modifier of the member
in the interface was a `,e.jsx(i.em,{children:"requirement"})," / ",e.jsx(i.em,{children:"maximum"}),`, not just a minimum, especially when using
a non-public / non-entitled access modifier (e.g., `,e.jsx(i.code,{children:"access(contract)"}),", ",e.jsx(i.code,{children:"access(account)"}),")."]}),e.jsx(i.p,{children:`Requiring access modifiers of members in the implementation to match the access modifiers
of members given in the interface, helps avoid confusion and potential footguns.`}),e.jsx(i.h4,{id:"ℹ️-description-2",children:"ℹ️ Description"}),e.jsx(i.p,{children:`If an interface member has an access modifier, a composite type that conforms to it / implements
the interface must use exactly the same access modifier.`}),e.jsx(i.h4,{id:"-adoption-2",children:"🔄 Adoption"}),e.jsx(i.p,{children:"Update the access modifiers of members in composite types that conform to / implement interfaces if they do not match the access modifiers of the members in the interface."}),e.jsx(i.h4,{id:"-example-2",children:"✨ Example"}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"Before:"})}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" I"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"I"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"After:"})}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" I"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"I"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {}"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Conditions No Longer Allow State Changes (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220715-cadence-purity-analysis.md",children:"FLIP 1056"}),")"]}),e.jsx(i.h4,{id:"-motivation-4",children:"💡 Motivation"}),e.jsx(i.p,{children:"In the current version of Cadence, pre-conditions and post-conditions may perform state changes, e.g., by calling a function that performs a mutation. This may result in unexpected behavior, which might lead to bugs."}),e.jsx(i.p,{children:"To make conditions predictable, they are no longer allowed to perform state changes."}),e.jsx(i.h4,{id:"ℹ️-description-3",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["Pre-conditions and post-conditions are now considered ",e.jsx(i.code,{children:"view"})," contexts, meaning that any operations that would be prevented inside of a ",e.jsx(i.code,{children:"view"})," function are also not permitted in a pre-condition or post-condition."]}),e.jsx(i.p,{children:"This is to prevent underhanded code wherein a user modifies global or contract state inside of a condition, where they are meant to simply be asserting properties of that state."}),e.jsxs(i.p,{children:["In particular, since only expressions were permitted inside conditions already, this means that if users wish to call any functions in conditions, these functions must now be made ",e.jsx(i.code,{children:"view"})," functions."]}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220715-cadence-purity-analysis.md",children:"FLIP 1056"}),". To learn more, please consult the FLIP and documentation."]}),e.jsx(i.h4,{id:"-adoption-3",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["Conditions that perform mutations will now result in the error ",e.jsx(i.em,{children:"Impure operation performed in view context"}),`.
Adjust the code in the condition so it does not perform mutations.`]}),e.jsxs(i.p,{children:["The condition may be considered mutating, because it calls a mutating, i.e., non-",e.jsx(i.code,{children:"view"})," function. It might be possible to mark the called function as ",e.jsx(i.code,{children:"view"}),", and the body of the function may need to get updated in turn."]}),e.jsx(i.h4,{id:"-example-3",children:"✨ Example"}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"Before:"})}),e.jsxs(i.p,{children:["The function ",e.jsx(i.code,{children:"withdraw"})," of a hypothetical NFT collection interface allows the withdrawal of an NFT with a specific ID. In its post-condition, the function states that at the end of the function, the collection should have exactly one fewer item than at the beginning of the function."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    post"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"      getCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" before"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  /* ... rest of interface ... */"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"After:"})}),e.jsxs(i.p,{children:["The calls to ",e.jsx(i.code,{children:"getCount"})," in the post-condition are not allowed and result in the error ",e.jsx(i.em,{children:"Impure operation performed in view context"}),", because the ",e.jsx(i.code,{children:"getCount"})," function is considered a mutating function, as it does not have the ",e.jsx(i.code,{children:"view"})," modifier."]}),e.jsxs(i.p,{children:["Here, as the ",e.jsx(i.code,{children:"getCount"})," function only performs a read-only operation and does not change any state, it can be marked as ",e.jsx(i.code,{children:"view"}),"."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    view "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//  ^^^^"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsx("summary",{children:"Missing or Incorrect Argument Labels Get Reported"}),e.jsx(i.h4,{id:"-motivation-5",children:"💡 Motivation"}),e.jsx(i.p,{children:"Previously, missing or incorrect argument labels of function calls were not reported. This had the potential to confuse developers or readers of programs, and could potentially lead to bugs."}),e.jsx(i.h4,{id:"ℹ️-description-4",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["Function calls with missing argument labels are now reported with the error message ",e.jsx(i.em,{children:"missing argument label"}),", and function calls with incorrect argument labels are now reported with the error message ",e.jsx(i.em,{children:"incorrect argument label"}),"."]}),e.jsx(i.h4,{id:"-adoption-4",children:"🔄 Adoption"}),e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Function calls with missing argument labels should be updated to include the required argument labels."}),`
`,e.jsx(i.li,{children:"Function calls with incorrect argument labels should be fixed by providing the correct argument labels."}),`
`]}),e.jsx(i.h4,{id:"-example-4",children:"✨ Example"}),e.jsxs(i.p,{children:["Contract ",e.jsx(i.code,{children:"TestContract"})," deployed at address ",e.jsx(i.code,{children:"0x1"}),":"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TestContract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  structTestStruct {"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(first: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", second: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".a = first"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".b = second"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Incorrect program"}),":"]}),e.jsxs(i.p,{children:["The initializer of ",e.jsx(i.code,{children:"TestContract.TestStruct"})," expects the argument labels ",e.jsx(i.code,{children:"first"})," and ",e.jsx(i.code,{children:"second"}),"."]}),e.jsxs(i.p,{children:["However, the call of the initializer provides the incorrect argument label ",e.jsx(i.code,{children:"wrong"})," for the first argument, and is missing the label for the second argument."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Script"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TestContract"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x1"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  TestContract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"TestStruct"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(wrong: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"123"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"abc"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"This now results in the following errors:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"error: incorrect argument label"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  --> script:4:34"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"   |"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:' 4 |           TestContract.TestStruct(wrong: 123, "abc")'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"   |                                   ^^^^^ expected `first`, got `wrong`"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"error: missing argument label: `second`"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  --> script:4:46"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"   |"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:' 4 |           TestContract.TestStruct(wrong: 123, "abc")'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"   |                                               ^^^^^"})})]})})}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Corrected program"}),":"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Script"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TestContract"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0x1"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  TestContract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"TestStruct"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(first: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"123"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", second: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"abc"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"We would like to thank community member @justjoolz for reporting this bug."})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Incorrect Operators In Reference Expressions Get Reported (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220516-reference-creation-semantics.md",children:"FLIP 941"}),")"]}),e.jsx(i.h4,{id:"-motivation-6",children:"💡 Motivation"}),e.jsx(i.p,{children:"Previously, incorrect operators in reference expressions were not reported."}),e.jsx(i.p,{children:"This had the potential to confuse developers or readers of programs, and could potentially lead to bugs."}),e.jsx(i.h4,{id:"ℹ️-description-5",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["The syntax for reference expressions is ",e.jsx(i.code,{children:"&v as &T"}),", which represents taking a reference to value ",e.jsx(i.code,{children:"v"})," as type ",e.jsx(i.code,{children:"T"}),`.
Reference expressions that used other operators, such as `,e.jsx(i.code,{children:"as?"})," and ",e.jsx(i.code,{children:"as!"}),", e.g., ",e.jsx(i.code,{children:"&v as! &T"}),", were incorrect and were previously not reported as an error."]}),e.jsxs(i.p,{children:["The syntax for reference expressions improved to just ",e.jsx(i.code,{children:"&v"}),`. The type of the resulting reference must still be provided explicitly.
If the type is not explicitly provided, the error `,e.jsx(i.em,{children:"cannot infer type from reference expression: requires an explicit type annotation"})," is reported."]}),e.jsxs(i.p,{children:["For example, existing expressions like ",e.jsx(i.code,{children:"&v as &T"})," provide an explicit type, as they statically assert the type using ",e.jsx(i.code,{children:"as &T"}),". Such expressions thus keep working and do ",e.jsx(i.em,{children:"not"})," have to be changed."]}),e.jsxs(i.p,{children:["Another way to provide the type for the reference is by explicitly typing the target of the expression, for example, in a variable declaration, e.g., via ",e.jsx(i.code,{children:"let ref: &T = &v"}),"."]}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220516-reference-creation-semantics.md",children:"FLIP 941"}),". To learn more, please consult the FLIP and documentation."]}),e.jsx(i.h4,{id:"-adoption-5",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["Reference expressions which use an operator other than ",e.jsx(i.code,{children:"as"})," need to be changed to use the ",e.jsx(i.code,{children:"as"}),` operator.
In cases where the type is already explicit, the static type assertion (`,e.jsx(i.code,{children:"as &T"}),") can be removed."]}),e.jsx(i.h4,{id:"-example-5",children:"✨ Example"}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Incorrect program"}),`:
The reference expression uses the incorrect operator `,e.jsx(i.code,{children:"as!"}),"."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" number = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ref = &number "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as!"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]})]})})}),e.jsx(i.p,{children:"This now results in the following error:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"error:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cannot"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" infer"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reference"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" expression:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" requires"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" an"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" explicit"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" annotation"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" --"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"test:3:17"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  |"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ref"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"number"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" as!"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Int"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"           ^"})]})]})})}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Corrected program"}),":"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" number = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ref = &number "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]})]})})}),e.jsx(i.p,{children:"Alternatively, the same code can now also be written as follows:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" number = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ref: &"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = &number"})]})]})})})]}),`
`,e.jsxs("details",{children:[e.jsx("summary",{children:"Tightening Of Naming Rules"}),e.jsx(i.h4,{id:"-motivation-7",children:"💡 Motivation"}),e.jsxs(i.p,{children:["Previously, Cadence allowed language keywords (e.g., ",e.jsx(i.code,{children:"continue"}),", ",e.jsx(i.code,{children:"for"}),", etc.) to be used as names. For example, the following program was allowed:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" continue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"break"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") { ... }"})]})})})}),e.jsx(i.p,{children:"This had the potential to confuse developers or readers of programs, and could potentially lead to bugs."}),e.jsx(i.h4,{id:"ℹ️-description-6",children:"ℹ️ Description"}),e.jsx(i.p,{children:`Most language keywords are no longer allowed to be used as names.
Some keywords are still allowed to be used as names, as they have limited significance within the language. These allowed keywords are as follows:`}),e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"from"}),": only used in import statements ",e.jsx(i.code,{children:"import foo from ..."})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"account"}),": used in access modifiers ",e.jsx(i.code,{children:"access(account) let ..."})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"all"}),": used in access modifier ",e.jsx(i.code,{children:"access(all) let ..."})]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"view"}),": used as a modifier for function declarations and expressions ",e.jsx(i.code,{children:"view fun foo()..."}),", let ",e.jsx(i.code,{children:"f = view fun () ..."}),`
Any other keywords will raise an error during parsing, such as:`]}),`
`]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" break"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//  ^ error: expected identifier after start of variable declaration, got keyword break"})})]})})}),e.jsx(i.h4,{id:"-adoption-6",children:"🔄 Adoption"}),e.jsx(i.p,{children:"Names that use language keywords must be renamed."}),e.jsx(i.h4,{id:"-example-6",children:"✨ Example"}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Before:"}),`
A variable is named after a language keyword.`]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" contract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = signer.borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MyContract"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(name: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"MyContract"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//  ^ error: expected identifier after start of variable declaration, got keyword contract"})})]})})}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"After:"}),`
The variable is renamed to avoid the clash with the language keyword.`]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" myContract = signer.borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MyContract"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(name: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"MyContract"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Result of ",e.jsx(i.code,{children:"toBigEndianBytes()"})," for ",e.jsx(i.code,{children:"U?Int(128|256)"})," Fixed"]}),e.jsx(i.h4,{id:"-motivation-8",children:"💡 Motivation"}),e.jsxs(i.p,{children:["Previously, the implementation of ",e.jsx(i.code,{children:".toBigEndianBytes()"})," was incorrect for the large integer types ",e.jsx(i.code,{children:"Int128"}),", ",e.jsx(i.code,{children:"Int256"}),", ",e.jsx(i.code,{children:"UInt128"}),", and ",e.jsx(i.code,{children:"UInt256"}),"."]}),e.jsx(i.p,{children:"This had the potential to confuse developers or readers of programs, and could potentially lead to bugs."}),e.jsx(i.h4,{id:"ℹ️-description-7",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["Calling the ",e.jsx(i.code,{children:"toBigEndianBytes"})," function on smaller sized integer types returns the exact number of bytes that fit into the type, left-padded with zeros. For instance, ",e.jsx(i.code,{children:"Int64(1).toBigEndianBytes()"})," returns an array of 8 bytes, as the size of ",e.jsx(i.code,{children:"Int64"})," is 64 bits, 8 bytes."]}),e.jsxs(i.p,{children:["Previously, the ",e.jsx(i.code,{children:"toBigEndianBytes"})," function erroneously returned variable-length byte arrays without padding for the large integer types ",e.jsx(i.code,{children:"Int128"}),", ",e.jsx(i.code,{children:"Int256"}),", ",e.jsx(i.code,{children:"UInt128"}),", and ",e.jsx(i.code,{children:"UInt256"}),". This was inconsistent with the smaller fixed-size numeric types, such as ",e.jsx(i.code,{children:"Int8"})," and ",e.jsx(i.code,{children:"Int32"}),"."]}),e.jsxs(i.p,{children:["To fix this inconsistency, ",e.jsx(i.code,{children:"Int128"})," and ",e.jsx(i.code,{children:"UInt128"})," now always return arrays of 16 bytes, while ",e.jsx(i.code,{children:"Int256"})," and ",e.jsx(i.code,{children:"UInt256"})," return 32 bytes."]}),e.jsx(i.h4,{id:"-example-7",children:"✨ Example"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" someNum: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt128"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"123456789"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" someBytes: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] = someNum."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBigEndianBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// OLD behavior;"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// someBytes = [7, 91, 205, 21]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// NEW behavior:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// someBytes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 91, 205, 21]"})})]})})}),e.jsx(i.h4,{id:"-adoption-7",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["Programs that use ",e.jsx(i.code,{children:"toBigEndianBytes"})," directly, or indirectly by depending on other programs, should be checked for how the result of the function is used. It might be necessary to adjust the code to restore existing behavior."]}),e.jsxs(i.p,{children:["If a program relied on the previous behavior of truncating the leading zeros, then the old behavior can be recovered by first converting to a variable-length type, ",e.jsx(i.code,{children:"Int"})," or ",e.jsx(i.code,{children:"UInt"}),", as the ",e.jsx(i.code,{children:"toBigEndianBytes"})," function retains the variable-length byte representations, i.e., the result has no padding bytes."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" someNum: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt128"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"123456789"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" someBytes: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(someNum)."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"toBigEndianBytes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// someBytes = [7, 91, 205, 21]"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Syntax for Function Types Improved (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20221018-change-fun-type-syntax.md",children:"FLIP 43"}),")"]}),e.jsx(i.h4,{id:"-motivation-9",children:"💡 Motivation"}),e.jsx(i.p,{children:"Previously, function types were expressed using a different syntax from function declarations or expressions. The previous syntax was unintuitive for developers, making it hard to write and read code that used function types."}),e.jsx(i.h4,{id:"ℹ️-description-and--examples",children:"ℹ️ Description and ✨ examples"}),e.jsxs(i.p,{children:["Function types are now expressed using the ",e.jsx(i.code,{children:"fun"})," keyword, just like expressions and declarations. This improves readability and makes function types more obvious."]}),e.jsx(i.p,{children:"For example, given the following function declaration:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(n: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", s: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int16"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* ... */"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]})})})}),e.jsxs(i.p,{children:["The function ",e.jsx(i.code,{children:"foo"})," now has the type ",e.jsx(i.code,{children:"fun(Int8, String): Int16"}),`.
The `,e.jsx(i.code,{children:":"})," token is right-associative, so functions that return other functions can have their types written without nested parentheses:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" curriedAdd"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ x: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ y: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" x"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" y"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// function `curriedAdd` has the type `fun(Int): fun(Int): Int`"})})]})})}),e.jsxs(i.p,{children:["To further bring the syntax for function types closer to the syntax of function declarations expressions, it is now possible to omit the return type, in which case the return type defaults to ",e.jsx(i.code,{children:"Void"}),"."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" logTwice"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ value: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyStruct"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Return type is implicitly `Void`"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(value)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(value)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// The function types of these variables are equivalent"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" logTwice1: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyStruct"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Void"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = logTwice"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" logTwice2: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"AnyStruct"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") = logTwice"})]})]})})}),e.jsx(i.p,{children:"As a bonus consequence, it is now allowed for any type to be parenthesized. This is useful for complex type signatures, or for expressing optional functions:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// A function that returns an optional Int16"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" optFun1: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int16"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"? ="})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (_: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"? { "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// An optional function that returns an Int16"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" optFun2: ("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int16"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")? = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"nil"})]})]})})}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20221018-change-fun-type-syntax.md",children:"FLIP 43"}),"."]}),e.jsx(i.h4,{id:"-adoption-8",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["Programs that use the old function type syntax need to be updated by replacing the surrounding parentheses of function types with the ",e.jsx(i.code,{children:"fun"})," keyword."]}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"Before:"})}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" baz: (("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int16"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") = foo"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // ^                     ^"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // surrounding parentheses of function type"})})]})})}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"After:"})}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" baz: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int16"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = foo"})]})})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Entitlements and Safe Down-casting (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20221214-auth-remodel.md",children:"FLIP 54"})," & ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230623-entitlement-improvements.md",children:"FLIP 94"}),")"]}),e.jsx(i.h4,{id:"-motivation-10",children:"💡 Motivation"}),e.jsx(i.p,{children:"Previously, Cadence’s main access-control mechanism, restricted reference types, has been a source of confusion and mistakes for contract developers."}),e.jsxs(i.p,{children:["Developers new to Cadence often were surprised and did not understand why access-restricted functions, like the ",e.jsx(i.code,{children:"withdraw"})," function of the fungible token ",e.jsx(i.code,{children:"Vault"})," resource type, were declared as ",e.jsx(i.code,{children:"pub"}),", making the function publicly accessible — access would later be restricted through a restricted type."]}),e.jsxs(i.p,{children:["It was too easy to accidentally give out a ",e.jsx(i.code,{children:"Capability"}),` with a more permissible type than intended, leading to security problems.
Additionally, because what fields and functions were available to a reference depended on what the type of the reference was, references could not be downcast, leading to ergonomic issues.`]}),e.jsx(i.h4,{id:"ℹ️-description-8",children:"ℹ️ Description"}),e.jsxs(i.p,{children:[`Access control has improved significantly.
When giving another user a reference or `,e.jsx(i.code,{children:"Capability"})," to a value you own, the fields and functions that the user can access is determined by the type of the reference or ",e.jsx(i.code,{children:"Capability"}),"."]}),e.jsxs(i.p,{children:["Previously, access to a value of type ",e.jsx(i.code,{children:"T"}),", e.g., via a reference ",e.jsx(i.code,{children:"&T"}),", would give access to all fields and functions of ",e.jsx(i.code,{children:"T"}),". Access could be restricted, by using a restricted type. For example, a restricted reference ",e.jsx(i.code,{children:"&T{I}"})," could only access members that were ",e.jsx(i.code,{children:"pub"})," on ",e.jsx(i.code,{children:"I"}),". Since references could not be downcast, any members defined on ",e.jsx(i.code,{children:"T"})," but not on ",e.jsx(i.code,{children:"I"})," were unavailable to this reference, even if they were ",e.jsx(i.code,{children:"pub"}),"."]}),e.jsxs(i.p,{children:["Access control is now handled using a new feature called Entitlements, as originally proposed across ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20221214-auth-remodel.md",children:"FLIP 54"})," and ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230623-entitlement-improvements.md",children:"FLIP 94"}),"."]}),e.jsxs(i.p,{children:["A reference can now be ",e.jsx(i.em,{children:"entitled"})," to certain facets of an object. For example, the reference ",e.jsx(i.code,{children:"auth(Withdraw) &Vault"})," is entitled to access fields and functions of ",e.jsx(i.code,{children:"Vault"})," which require the ",e.jsx(i.code,{children:"Withdraw"})," entitlement."]}),e.jsxs(i.p,{children:["Entitlements can be are declared using the new ",e.jsx(i.code,{children:"entitlement"})," syntax."]}),e.jsxs(i.p,{children:["Members can be made to require entitlements using the access modifier syntax ",e.jsx(i.code,{children:"access(E)"}),", where ",e.jsx(i.code,{children:"E"})," is an entitlement that the user must posses."]}),e.jsx(i.p,{children:"For example:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Withdraw"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"})]})]})})}),e.jsxs(i.p,{children:["References can now always be down-casted, the standalone ",e.jsx(i.code,{children:"auth"})," modifier is not necessary anymore, and has been removed."]}),e.jsxs(i.p,{children:["For example, the reference ",e.jsx(i.code,{children:"&{Provider}"})," can now be downcast to ",e.jsx(i.code,{children:"&Vault"}),", so access control is now handled entirely through entitlements, rather than types."]}),e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"https://cadence-lang.org/docs/1.0/language/access-control#entitlements",children:"Entitlements"})," for more information."]}),e.jsx(i.h4,{id:"-adoption-9",children:"🔄 Adoption"}),e.jsx(i.p,{children:"The access modifiers of fields and functions need to be carefully audited and updated."}),e.jsxs(i.p,{children:["Fields and functions that have the ",e.jsx(i.code,{children:"pub"})," access modifier are now callable by anyone with any reference to that type. If access to the member should be restricted, the ",e.jsx(i.code,{children:"pub"})," access modifier needs to be replaced with an entitlement access modifier."]}),e.jsxs(i.p,{children:["When creating a ",e.jsx(i.code,{children:"Capability"})," or a reference to a value, ",e.jsxs(i.strong,{children:["it must be carefully considered which entitlements are provided to the recipient of that ",e.jsx(i.code,{children:"Capability"})," or reference"]})," — only the entitlements which are necessary and not more should be include in the ",e.jsx(i.code,{children:"auth"})," modifier of the reference type."]}),e.jsx(i.h4,{id:"-example-8",children:"✨ Example"}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Before:"}),`
The `,e.jsx(i.code,{children:"Vault"})," resource was originally written like so:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Provider"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  funwithdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Provider"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Balance"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" balance: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"After:"}),`
The `,e.jsx(i.code,{children:"Vault"})," resource might now be written like this:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Withdraw"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Provider"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  funwithdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Provider"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Receiver"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Balance"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// withdrawal requires permission"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" balance: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:["Here, the ",e.jsx(i.code,{children:"access(Withdraw)"})," syntax means that a reference to ",e.jsx(i.code,{children:"Vault"})," must possess the ",e.jsx(i.code,{children:"Withdraw"})," entitlement in order to be allowed to call the ",e.jsx(i.code,{children:"withdraw"})," function, which can be given when a reference or ",e.jsx(i.code,{children:"Capability"})," is created by using a new syntax: ",e.jsx(i.code,{children:"auth(Withdraw) &Vault"}),"."]}),e.jsxs(i.p,{children:["This would allow developers to safely downcast ",e.jsx(i.code,{children:"&{Provider}"})," references to ",e.jsx(i.code,{children:"&Vault"})," references if they want to access functions like ",e.jsx(i.code,{children:"deposit"})," and ",e.jsx(i.code,{children:"balance"}),", without enabling them to call ",e.jsx(i.code,{children:"withdraw"}),"."]})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Removal of ",e.jsx(i.code,{children:"pub"})," and ",e.jsx(i.code,{children:"priv"})," Access Modifiers (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230505-remove-priv-and-pub.md",children:"FLIP 84"}),")"]}),e.jsx(i.h4,{id:"-motivation-11",children:"💡 Motivation"}),e.jsxs(i.p,{children:["With the previously mentioned entitlements feature, which uses ",e.jsx(i.code,{children:"access(E)"})," syntax to denote entitled access, the ",e.jsx(i.code,{children:"pub"}),", ",e.jsx(i.code,{children:"priv"}),", and ",e.jsx(i.code,{children:"pub(set)"})," modifiers became the only access modifiers that did not use the ",e.jsx(i.code,{children:"access"})," syntax."]}),e.jsx(i.p,{children:"This made the syntax inconsistent, making it harder to read and understand programs."}),e.jsxs(i.p,{children:["In addition, ",e.jsx(i.code,{children:"pub"})," and ",e.jsx(i.code,{children:"priv"})," already had alternatives/equivalents: ",e.jsx(i.code,{children:"access(all)"})," and ",e.jsx(i.code,{children:"access(self)"}),"."]}),e.jsx(i.h4,{id:"ℹ️-description-9",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"pub"}),", ",e.jsx(i.code,{children:"priv"})," and ",e.jsx(i.code,{children:"pub(set)"})," access modifiers are being removed from the language, in favor of their more explicit ",e.jsx(i.code,{children:"access(all)"})," and ",e.jsx(i.code,{children:"access(self)"})," equivalents (for ",e.jsx(i.code,{children:"pub"})," and ",e.jsx(i.code,{children:"priv"}),", respectively)."]}),e.jsx(i.p,{children:"This makes access modifiers more uniform and better match the new entitlements syntax."}),e.jsxs(i.p,{children:["This improvement was originally proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230505-remove-priv-and-pub.md",children:"FLIP 84"}),"."]}),e.jsx(i.h4,{id:"-adoption-10",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["Users should replace any ",e.jsx(i.code,{children:"pub"})," modifiers with ",e.jsx(i.code,{children:"access(all)"}),", and any ",e.jsx(i.code,{children:"priv"})," modifiers with ",e.jsx(i.code,{children:"access(self)"}),"."]}),e.jsxs(i.p,{children:["Fields that were defined as ",e.jsx(i.code,{children:"pub(set)"})," will no longer be publicly assignable, and no access modifier now exists that replicates this old behavior. If the field should stay publicly assignable, a ",e.jsx(i.code,{children:"access(all)"})," setter function that updates the field needs to be added, and users have to switch to using it instead of directly assigning to the field."]}),e.jsx(i.h4,{id:"-example-9",children:"✨ Example"}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Before:"}),`
Types and members could be declared with `,e.jsx(i.code,{children:"pub"})," and ",e.jsx(i.code,{children:"priv"}),":"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"pub"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  pub"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  priv"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" myPrivateFunction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  pub"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(set) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" settableInt: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  /* ... rest of interface ... */"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"After:"}),`
The same behavior can be achieved with `,e.jsx(i.code,{children:"access(all)"})," and ",e.jsx(i.code,{children:"access(self)"})]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" myPrivateFunction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" settableInt: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // Add a public setter method, replacing pub(set)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" setIntValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ i:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  /* ... rest of interface ... */"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Replacement of Restricted Types with Intersection Types (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230505-remove-restricted-types.md",children:"FLIP 85"}),")"]}),e.jsx(i.h4,{id:"-motivation-12",children:"💡 Motivation"}),e.jsx(i.p,{children:"With the improvements to access control enabled by entitlements and safe down-casting, the restricted type feature is redundant."}),e.jsx(i.h4,{id:"ℹ️-description-10",children:"ℹ️ Description"}),e.jsx(i.p,{children:"Restricted types have been removed. All types, including references, can now be down-casted, restricted types are no longer used for access control."}),e.jsxs(i.p,{children:["At the same time intersection types got introduced. Intersection types have the syntax ",e.jsx(i.code,{children:"{I1, I2, ... In}"}),", where all elements of the set of types (",e.jsx(i.code,{children:"I1, I2, ... In"}),") are interface types. A value is part of the intersection type if it conforms to all the interfaces in the intersection type’s interface set. This functionality is equivalent to restricted types that restricted ",e.jsx(i.code,{children:"AnyStruct"})," and ",e.jsx(i.code,{children:"AnyResource."})]}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230505-remove-restricted-types.md",children:"FLIP 85"}),". To learn more, please consult the FLIP and documentation."]}),e.jsx(i.h4,{id:"-adoption-11",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["Code that relies on the restriction behavior of restricted types can be safely changed to just use the concrete type directly, as entitlements will make this safe. For example, ",e.jsx(i.code,{children:"&Vault{Balance}"})," can be replaced with just ",e.jsx(i.code,{children:"&Vault"}),", as access to ",e.jsx(i.code,{children:"&Vault"})," only provides access to safe operations, like getting the balance — ",e.jsx(i.strong,{children:"privileged operations, like withdrawal, need additional entitlements."})]}),e.jsxs(i.p,{children:["Code that uses ",e.jsx(i.code,{children:"AnyStruct"})," or ",e.jsx(i.code,{children:"AnyResource"})," explicitly as the restricted type, e.g., in a reference, ",e.jsx(i.code,{children:"&AnyResource{I}"}),", needs to remove the use of ",e.jsx(i.code,{children:"AnyStruct"})," / ",e.jsx(i.code,{children:"AnyResource"}),". Code that already uses the syntax ",e.jsx(i.code,{children:"&{I}"})," can stay as-is."]}),e.jsx(i.h4,{id:"-example-10",children:"✨ Example"}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"Before:"})}),e.jsxs(i.p,{children:["This function accepted a reference to a ",e.jsx(i.code,{children:"T"})," value, but restricted what functions were allowed to be called on it to those defined on the ",e.jsx(i.code,{children:"X"}),", ",e.jsx(i.code,{children:"Y"}),", and ",e.jsx(i.code,{children:"Z"})," interfaces."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" X"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Y"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Z"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" baz"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" T"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"X"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Y"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Z"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // implement interfaces"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" qux"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" exampleFun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(param: &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"X"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Y"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Z"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}) {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // `param` cannot call `qux` here, because it is restricted to"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // `X`, `Y` and `Z`."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"After:"}),`
This function can be safely rewritten as:`]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" X"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Y"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Z"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" baz"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Q"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" T"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"X"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Y"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Z"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // implement interfaces"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Q"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" qux"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" exampleFun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(param: &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"T"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // `param` still cannot call `qux` here, because it lacks entitlement `Q`"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:["Any functions on ",e.jsx(i.code,{children:"T"})," that the author of ",e.jsx(i.code,{children:"T"})," does not want users to be able to call publicly should be defined with entitlements, and thus will not be accessible to the unauthorized ",e.jsx(i.code,{children:"param"})," reference, like with ",e.jsx(i.code,{children:"qux"})," above."]})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Account Access Got Improved (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230525-account-type.md",children:"FLIP 92"}),")"]}),e.jsx(i.h4,{id:"-motivation-13",children:"💡 Motivation"}),e.jsx(i.p,{children:"Previously, access to accounts was granted wholesale: Users would sign a transaction, authorizing the code of the transaction to perform any kind of operation, for example, write to storage, but also add keys or contracts."}),e.jsx(i.p,{children:"Users had to trust that a transaction would only perform supposed access, e.g., storage access to withdraw tokens, but still had to grant full access, which would allow the transaction to perform other operations."}),e.jsx(i.p,{children:"Dapp developers who require users to sign transactions should be able to request the minimum amount of access to perform the intended operation, i.e., developers should be able to follow the principle of least privilege (PoLA)."}),e.jsx(i.p,{children:"This allows users to trust the transaction and Dapp."}),e.jsx(i.h4,{id:"ℹ️-description-11",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["Previously, access to accounts was provided through the built-in types ",e.jsx(i.code,{children:"AuthAccount"})," and ",e.jsx(i.code,{children:"PublicAccount"}),": ",e.jsx(i.code,{children:"AuthAccount"})," provided full ",e.jsx(i.em,{children:"write"})," access to an account, whereas ",e.jsx(i.code,{children:"PublicAccount"})," only provided ",e.jsx(i.em,{children:"read"})," access."]}),e.jsxs(i.p,{children:["With the introduction of entitlements, this access is now expressed using entitlements and references, and only a single ",e.jsx(i.code,{children:"Account"})," type is necessary. In addition, storage related functionality were moved to the field ",e.jsx(i.code,{children:"Account.storage"}),"."]}),e.jsxs(i.p,{children:["Access to administrative account operations, such as writing to storage, adding keys, or adding contracts, is now gated by both coarse grained entitlements (e.g., ",e.jsx(i.code,{children:"Storage"}),", which grants access to all storage related functions, and ",e.jsx(i.code,{children:"Keys"}),", which grants access to all key management functions), as well as fine-grained entitlements (e.g., ",e.jsx(i.code,{children:"SaveValue"})," to save a value to storage, or ",e.jsx(i.code,{children:"AddKey"})," to add a new key to the account)."]}),e.jsx(i.p,{children:"Transactions can now request the particular entitlements necessary to perform the operations in the transaction."}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230525-account-type.md",children:"FLIP 92"}),". To learn more, consult the FLIP and the documentation."]}),e.jsx(i.h4,{id:"-adoption-12",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["Code that previously used ",e.jsx(i.code,{children:"PublicAccount"})," can simply be replaced with an unauthorized account reference, ",e.jsx(i.code,{children:"&Account."})]}),e.jsxs(i.p,{children:["Code that previously used ",e.jsx(i.code,{children:"AuthAccount"})," must be replaced with an authorized account reference. Depending on what functionality of the account is accessed, the appropriate entitlements have to be specified."]}),e.jsxs(i.p,{children:["For example, if the ",e.jsx(i.code,{children:"save"})," function of ",e.jsx(i.code,{children:"AuthAccount"})," was used before, the function call must be replaced with ",e.jsx(i.code,{children:"storage.save"}),", and the ",e.jsx(i.code,{children:"SaveValue"})," or ",e.jsx(i.code,{children:"Storage"})," entitlement is required."]}),e.jsx(i.h4,{id:"-example-11",children:"✨ Example"}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"Before:"})}),e.jsx(i.p,{children:"The transactions wants to save a value to storage. It must request access to the whole account, even though it does not need access beyond writing to storage."}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"AuthAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Test"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", to: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"test)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"After:"})}),e.jsxs(i.p,{children:["The transaction requests the fine-grained account entitlement ",e.jsx(i.code,{children:"SaveValue"}),", which allows the transaction to call the ",e.jsx(i.code,{children:"save"})," function."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")&"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.storage."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Test"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", to: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"test)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"If the transaction attempts to perform other operations, such as adding a new key, it is rejected:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SaveValue"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")&"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.storage."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Test"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", to: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"test)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.keys."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* ... */"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //          ^^^ Error: Cannot call function, requires `AddKey` or `Keys` entitlement"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsx("summary",{children:"Deprecated Key Management API Got Removed"}),e.jsx(i.h4,{id:"-motivation-14",children:"💡 Motivation"}),e.jsx(i.p,{children:"Cadence provides two key management APIs:"}),e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"The original, low-level API, which worked with RLP-encoded keys"}),`
`,e.jsxs(i.li,{children:["The improved, high-level API, which works with convenient data types like ",e.jsx(i.code,{children:"PublicKey"}),", ",e.jsx(i.code,{children:"HashAlgorithm"}),", and ",e.jsx(i.code,{children:"SignatureAlgorithm"}),`
The improved API was introduced, as the original API was difficult to use and error-prone.
The original API was deprecated in early 2022.`]}),`
`]}),e.jsx(i.h4,{id:"ℹ️-description-12",children:"ℹ️ Description"}),e.jsx(i.p,{children:`The original account key management API has been removed. Instead, the improved key management API should be used.
To learn more,`}),e.jsx(i.h4,{id:"-adoption-13",children:"🔄 Adoption"}),e.jsx(i.p,{children:"Replace uses of the original account key management API functions with equivalents of the improved API:"}),e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Removed"}),e.jsx(i.th,{children:"Replacement"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"AuthAccount.addPublicKey"}),e.jsx(i.td,{children:"Account.keys.add"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"AuthAccount.removePublicKey"}),e.jsx(i.td,{children:"Account.keys.revoke"})]})]})]}),e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"https://developers.flow.com/cadence/language/accounts#account-keys",children:"Account keys"})," for more information."]}),e.jsx(i.h4,{id:"-example-12",children:"✨ Example"}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"Before:"})}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(encodedPublicKey: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"AuthAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addPublicKey"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(encodedPublicKey)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"After:"})}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(publicKey: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Keys"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.keys."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      publicKey: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        publicKey: publicKey,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signatureAlgorithm: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SignatureAlgorithm"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ECDSA_P256"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      ),"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      hashAlgorithm: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SHA3_256"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      weight: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100.0"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsx("summary",{children:"Resource Tracking for Optional Bindings Improved"}),e.jsx(i.h4,{id:"-motivation-15",children:"💡 Motivation"}),e.jsxs(i.p,{children:["Previously, resource tracking for optional bindings (",e.jsx(i.em,{children:"if-let statements"}),`) was implemented incorrectly, leading to errors for valid code.
This required developers to add workarounds to their code.`]}),e.jsx(i.h4,{id:"ℹ️-description-13",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["Resource tracking for optional bindings (",e.jsx(i.em,{children:"if-let statements"}),") was fixed."]}),e.jsxs(i.p,{children:["For example, the following program used to be invalid, reporting a resource loss error for ",e.jsx(i.code,{children:"optR"}),":"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" asOpt"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ r: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"? {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" optR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" asOpt"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r2 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" optR {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r2"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"This program is now considered valid."}),e.jsx(i.h4,{id:"-adoption-14",children:"🔄 Adoption"}),e.jsx(i.p,{children:"New programs do not need workarounds anymore, and can be written naturally."}),e.jsx(i.p,{children:"Programs that previously resolved the incorrect resource loss error with a workaround, for example by invalidating the resource also in the else-branch or after the if-statement, are now invalid:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" optR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"asOpt"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r2 "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" optR {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r2"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" optR"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // unnecessary, but added to avoid error"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"The unnecessary workaround needs to be removed."})]}),`
`,e.jsxs("details",{children:[e.jsx("summary",{children:"Definite Return Analysis Got Improved"}),e.jsx(i.h4,{id:"-motivation-16",children:"💡 Motivation"}),e.jsxs(i.p,{children:["Definite return analysis determines if a function always exits, in all possible execution paths, e.g., through a ",e.jsx(i.code,{children:"return"})," statement, or by calling a function that never returns, like ",e.jsx(i.code,{children:"panic"}),"."]}),e.jsx(i.p,{children:"This analysis was incomplete and required developers to add workarounds to their code."}),e.jsx(i.h4,{id:"ℹ️-description-14",children:"ℹ️ Description"}),e.jsx(i.p,{children:"The definite return analysis got significantly improved."}),e.jsxs(i.p,{children:["This means that the following program is now accepted: both branches of the if-statement exit, one using a ",e.jsx(i.code,{children:"return"})," statement, the other using a function that never returns, ",e.jsx(i.code,{children:"panic"}),":"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" mint"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 100"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"bad id"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:["The program above was previously rejected with a ",e.jsx(i.em,{children:"missing return statement"})," error — even though we can convince ourselves that the function will exit in both branches of the if-statement, and that any code after the if-statement is unreachable, the type checker was not able to detect that — it now does."]}),e.jsx(i.h4,{id:"-adoption-15",children:"🔄 Adoption"}),e.jsx(i.p,{children:`New programs do not need workarounds anymore, and can be written naturally.
Programs that previously resolved the incorrect error with a workaround, for example by adding an additional exit at the end of the function, are now invalid:`}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {}"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" mint"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"):"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 100"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"bad id"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // unnecessary, but added to avoid error"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  panic"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"unreachable"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"The improved type checker now detects and reports the unreachable code after the if-statement as an error:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"error:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" unreachable"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" statement"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"test.cdc:12:4"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  |"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"12"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"|"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  panic("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:'"unreachable"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  ^^^^^^^^^^^^^^^^^^^^"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"exit"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" status"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]})]})})}),e.jsx(i.p,{children:"To make the code valid, simply remove the unreachable code."})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Semantics for Variables in For-Loop Statements Got Improved (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20221011-for-loop-semantics.md",children:"FLIP 13"}),")"]}),e.jsx(i.h4,{id:"-motivation-17",children:"💡 Motivation"}),e.jsxs(i.p,{children:["Previously, the iteration variable of ",e.jsx(i.code,{children:"for-in"})," loops was re-assigned on each iteration."]}),e.jsx(i.p,{children:"Even though this is a common behavior in many programming languages, it is surprising behavior and a source of bugs."}),e.jsx(i.p,{children:"The behavior was improved to the often assumed/expected behavior of a new iteration variable being introduced for each iteration, which reduces the likelihood for a bug."}),e.jsx(i.h4,{id:"ℹ️-description-15",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["The behavior of ",e.jsx(i.code,{children:"for-in"})," loops improved, so that a new iteration variable is introduced for each iteration."]}),e.jsx(i.p,{children:"This change only affects a few programs, as the behavior change is only noticeable if the program captures the iteration variable in a function value (closure)."}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20221011-for-loop-semantics.md",children:"FLIP 13"}),". To learn more, consult the FLIP and documentation."]}),e.jsx(i.h4,{id:"-example-13",children:"✨ Example"}),e.jsxs(i.p,{children:["Previously, ",e.jsx(i.code,{children:"values"})," would result in ",e.jsx(i.code,{children:"[3, 3, 3]"}),", which might be surprising and unexpected. This is because ",e.jsx(i.code,{children:"x"})," was ",e.jsx(i.em,{children:"reassigned"})," the current array element on each iteration, leading to each function in ",e.jsx(i.code,{children:"fs"})," returning the last element of the array."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Capture the values of the array [1, 2, 3]"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fs: [((): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")] = []"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" x "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // Create a list of functions that return the array value"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  fs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"append"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" x"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  })"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Evaluate each function and gather all array values"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" values: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] = []"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" f "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fs {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  values."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"append"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"f"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["References to Resource-Kinded Values Get Invalidated When the Referenced Values Are Moved (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220708-resource-reference-invalidation.md",children:"FLIP 1043"}),")"]}),e.jsx(i.h4,{id:"-motivation-18",children:"💡 Motivation"}),e.jsx(i.p,{children:"Previously, when a reference is taken to a resource, that reference remains valid even if the resource was moved, for example when created and moved into an account, or moved from one account into another."}),e.jsx(i.p,{children:"In other words, references to resources stayed alive forever. This could be a potential safety foot-gun, where one could gain/give/retain unintended access to resources through references."}),e.jsx(i.h4,{id:"ℹ️-description-16",children:"ℹ️ Description"}),e.jsx(i.p,{children:"References are now invalidated if the referenced resource is moved after the reference was taken. The reference is invalidated upon the first move, regardless of the origin and the destination."}),e.jsxs(i.p,{children:["This feature was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220708-resource-reference-invalidation.md",children:"FLIP 1043"}),". To learn more, please consult the FLIP and documentation."]}),e.jsx(i.h4,{id:"-example-14",children:"✨ Example"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Create a resource."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createR"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// And take a reference."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ref = &r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"R"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Then move the resource into an account."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r, to: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Update the reference."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ref.id = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"})]})]})})}),e.jsx(i.p,{children:"Old behavior:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This will also update the referenced resource in the account."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ref.id = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"})]})]})})}),e.jsx(i.p,{children:"The above operation will now result in a static error."}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Trying to update/access the reference will produce a static error:"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'//     "invalid reference: referenced resource may have been moved or destroyed"'})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"ref.id = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"})]})]})})}),e.jsx(i.p,{children:"However, not all scenarios can be detected statically. e.g:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(ref: &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ref.id = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"In the above function, it is not possible to determine whether the resource to which the reference was taken has been moved or not. Therefore, such cases are checked at run-time, and a run-time error will occur if the resource has been moved."}),e.jsx(i.h4,{id:"-adoption-16",children:"🔄 Adoption"}),e.jsx(i.p,{children:"Review code that uses references to resources, and check for cases where the referenced resource is moved. Such code may now be reported as invalid, or result in the program being aborted with an error when a reference to a moved resource is de-referenced."})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Capability Controller API Replaced Existing Linking-based Capability API (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220203-capability-controllers.md",children:"FLIP 798"}),")"]}),e.jsx(i.h4,{id:"-motivation-19",children:"💡 Motivation"}),e.jsx(i.p,{children:"Cadence encourages a capability-based security model. Capabilities are themselves a new concept that most Cadence programmers need to understand."}),e.jsxs(i.p,{children:["The existing API for capabilities was centered around ",e.jsx(i.em,{children:"links"})," and ",e.jsx(i.em,{children:"linking"}),", and the associated concepts of the public and private storage domains led to capabilities being even confusing and awkward to use."]}),e.jsx(i.p,{children:"A better API is easier to understand and easier to work with."}),e.jsx(i.h4,{id:"ℹ️-description-17",children:"ℹ️ Description"}),e.jsx(i.p,{children:"The existing linking-based capability API has been replaced by a more powerful and easier-to-use API based on the notion of Capability Controllers. The new API makes the creation of new capabilities and the revocation of existing capabilities simpler."}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20220203-capability-controllers.md",children:"FLIP 798"}),". To learn more, consult the FLIP and the documentation."]}),e.jsx(i.h4,{id:"-adoption-17",children:"🔄 Adoption"}),e.jsx(i.p,{children:"Existing uses of the linking-based capability API must be replaced with the new Capability Controller API."}),e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Removed"}),e.jsx(i.th,{children:"Replacement"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"AuthAccount.link"}),", with private path"]}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Account.capabilities.storage.issue"})})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"AuthAccount.link"}),", with public path"]}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"Account.capabilities.storage.issue"})," and ",e.jsx(i.code,{children:"Account.capabilities.publish"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"AuthAccount.linkAccount"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"AuthAccount.capabilities.account.issue"})})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"AuthAccount.unlink"}),", with private path"]}),e.jsxs(i.td,{children:["- Get capability controller: ",e.jsx(i.code,{children:"Account.capabilities.storage/account.get"})," ",e.jsx("br",{})," - Revoke controller: ",e.jsx(i.code,{children:"Storage/AccountCapabilityController.delete"})]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"AuthAccount.unlink"}),", with public path"]}),e.jsxs(i.td,{children:["- Get capability controller: ",e.jsx(i.code,{children:"Account.capabilities.storage/account.get"})," ",e.jsx("br",{})," - Revoke controller: ",e.jsx(i.code,{children:"Storage/AccountCapabilityController.delete"})," ",e.jsx("br",{})," - Unpublish capability: ",e.jsx(i.code,{children:"Account.capabilities.unpublish"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"AuthAccount/PublicAccount.getCapability"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Account.capabilities.get"})})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"AuthAccount/PublicAccount.getCapability"})," with followed borrow"]}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Account.capabilities.borrow"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"AuthAccount.getLinkTarget"})}),e.jsx(i.td,{children:"N/A"})]})]})]}),e.jsx(i.h4,{id:"-example-15",children:"✨ Example"}),e.jsxs(i.p,{children:["Assume there is a ",e.jsx(i.code,{children:"Counter"})," resource which stores a count, and it implements an interface ",e.jsx(i.code,{children:"HasCount"})," which is used to allow read access to the count."]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HasCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  count: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Counter"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HasCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" count: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(count: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".count = count"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"Granting access, before:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"AuthAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      <-create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Counter"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(count: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"42"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      to: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"counter"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.link"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HasCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      /"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hasCount,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      target: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"counter"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"Granting access, after:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"transaction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  prepare"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(signer: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Storage"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capabilities"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")&"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      <-create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Counter"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(count: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"42"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      to: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"counter"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" cap = signer.capabilities.storage.issue"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HasCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      /"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"counter"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.capabilities."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(cap, at: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hasCount)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"Getting access, before:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counterRef = "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0x1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .getCapabilities"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HasCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hasCount)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counterRef.count"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"Getting access, after:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counterRef = "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0x1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .capabilities"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    .borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&{"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"HasCount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hasCount)"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" counterRef.count"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["External Mutation Improvement (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230517-member-access-semnatics.md",children:"FLIP 89"})," & ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230519-built-in-mutability-entitlements.md",children:"FLIP 86"}),")"]}),e.jsx(i.h4,{id:"-motivation-20",children:"💡 Motivation"}),e.jsxs(i.p,{children:["A previous version of Cadence (",e.jsx(i.em,{children:"Secure Cadence"}),"), attempted to prevent a common safety foot-gun: Developers might use the ",e.jsx(i.code,{children:"let"})," keyword for a container-typed field, assuming it would be immutable."]}),e.jsxs(i.p,{children:["Though Secure Cadence implements the ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20211129-cadence-mutability-restrictions.md",children:"Cadence mutability restrictions FLIP"}),", it did not fully solve the problem / prevent the foot-gun and there were still ways to mutate such fields, so a proper solution was devised."]}),e.jsxs(i.p,{children:["To learn more about the problem and motivation to solve it, please read the associated ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/vision/mutability-restrictions.md",children:"Vision"})," document."]}),e.jsx(i.h4,{id:"ℹ️-description-18",children:"ℹ️ Description"}),e.jsx(i.p,{children:`The mutability of containers (updating a field of a composite value, key of a map, or index of an array) through references has changed:
When a field/element is accessed through a reference, a reference to the accessed inner object is returned, instead of the actual object. These returned references are unauthorized by default, and the author of the object (struct/resource/etc.) can control what operations are permitted on these returned references by using entitlements and entitlement mappings.
This improvement was proposed in two FLIPs:`}),e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230517-member-access-semnatics.md",children:"FLIP 89: Change Member Access Semantics"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230519-built-in-mutability-entitlements.md",children:"FLIP 86: Introduce Built-in Mutability Entitlements"})}),`
`]}),e.jsx(i.p,{children:"To learn more, please consult the FLIPs and the documentation."}),e.jsx(i.h4,{id:"-adoption-18",children:"🔄 Adoption"}),e.jsx(i.p,{children:"As mentioned in the previous section, the most notable change in this improvement is that, when a field/element is accessed through a reference, a reference to the accessed inner object is returned, instead of the actual object. So developers would need to change their code to:"}),e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Work with references, instead of the actual object, when accessing nested objects through a reference."}),`
`,e.jsxs(i.li,{children:["Use proper entitlements for fields when they declare their own ",e.jsx(i.code,{children:"struct"})," and ",e.jsx(i.code,{children:"resource"})," types."]}),`
`]}),e.jsx("br",{}),e.jsx(i.h4,{id:"-example-16",children:"✨ Example"}),e.jsx(i.p,{children:"Consider the followinbg resource collection:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"pub"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MasterCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  pub"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" kittyCollection: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  pub"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" topshotCollection: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"pub"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  pub"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(set)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownedNFTs: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NonFungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(token:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NonFungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {... }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsxs(i.p,{children:["Earlier, it was possible to mutate the inner collections, even if someone only had a reference to the ",e.jsx(i.code,{children:"MasterCollection"}),". e.g:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" masterCollectionRef:&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MasterCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" =... "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Directly updating the field"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"masterCollectionRef.kittyCollection.id = "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"NewID"'})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Calling a mutating function"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"masterCollectionRef.kittyCollection."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updating via the referencelet ownedNFTsRef=&masterCollectionRef.kittyCollection.ownedNFTs as &{UInt64: NonFungibleToken.NFT}"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownedNFTsRef."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"insert"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1234"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft)"})]})]})})}),e.jsx(i.p,{children:"Once this change is introduced, the above collection can be re-written as below:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"pub"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MasterCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"KittyCollectorMapping"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" kittyCollection: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"TopshotCollectorMapping"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" topshotCollection: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Collection"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"pub"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Collection"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  pub"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(set)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Identity"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownedNFTs: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NonFungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Insert"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(token:"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NonFungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") { "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* ... */"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Entitlements and mappings for `kittyCollection`"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" KittyCollector"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" KittyCollectorMapping"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  KittyCollector"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Insert"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  KittyCollector"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Remove"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Entitlements and mappings for `topshotCollection`"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TopshotCollector"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TopshotCollectorMapping"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  TopshotCollector"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Insert"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  TopshotCollector"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Remove"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"Then for a reference with no entitlements, none of the previously mentioned operations would be allowed:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" masterCollectionRef:&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MasterCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ... "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Error: Cannot update the field. Doesn't have sufficient entitlements."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"masterCollectionRef.kittyCollection.id = "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"NewID"'})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Error: Cannot directly update the dictionary. Doesn't have sufficient entitlements."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" masterCollectionRef.kittyCollection.ownedNFTs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"insert"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1234"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" masterCollectionRef.ownedNFTs."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"remove"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1234"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Error: Cannot call mutating function. Doesn't have sufficient entitlements."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"masterCollectionRef.kittyCollection."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Error: `masterCollectionRef.kittyCollection.ownedNFTs` is already a non-auth reference.// Thus cannot update the dictionary. Doesn't have sufficient entitlements."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownedNFTsRef = &masterCollectionRef.kittyCollection.ownedNFTsas&{"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NonFungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"NFT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ownedNFTsRef."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"insert"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1234"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft)"})]})]})})}),e.jsx(i.p,{children:"To perform these operations on the reference, one would need to have obtained a reference with proper entitlements:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" masterCollectionRef: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"KittyCollector"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"} &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"MasterCollection"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ... "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Directly updating the field"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"masterCollectionRef.kittyCollection.id = "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"NewID"'})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updating the dictionary"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" masterCollectionRef.kittyCollection.ownedNFTs."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"insert"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1234"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" masterCollectionRef.kittyCollection.ownedNFTs."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"remove"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1234"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Calling a mutating function"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"masterCollectionRef.kittyCollection."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"nft)"})]})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Removal Of Nested Type Requirements (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230711-remove-type-requirements.md",children:"FLIP 118"}),")"]}),e.jsx(i.h4,{id:"-motivation-21",children:"💡 Motivation"}),e.jsxs(i.p,{children:[e.jsx(i.a,{href:"https://docs.onflow.org/cadence/language/interfaces/#nested-type-requirements",children:"Nested Type Requirements"})," were a fairly advanced concept of the language."]}),e.jsx(i.p,{children:"Just like an interface could require a conforming type to provide a certain field or function, it could also have required the conforming type to provide a nested type."}),e.jsx(i.p,{children:"This is an uncommon feature in other programming languages and hard to understand."}),e.jsx(i.p,{children:"In addition, the value of nested type requirements was never realized. While it was previously used in the FT and NFT contracts, the addition of other language features like interface inheritance and events being emittable from interfaces, there were no more uses case compelling enough to justify a feature of this complexity."}),e.jsx(i.h4,{id:"ℹ️-description-19",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["Contract interfaces can no longer declare any concrete types (",e.jsx(i.code,{children:"struct"}),", ",e.jsx(i.code,{children:"resource"})," or ",e.jsx(i.code,{children:"enum"}),") in their declarations, as this would create a type requirement. ",e.jsx(i.code,{children:"event"})," declarations are still allowed, but these create an ",e.jsx(i.code,{children:"event"})," type limited to the scope of that contract interface; this ",e.jsx(i.code,{children:"event"})," is not inherited by any implementing contracts. Nested interface declarations are still permitted, however."]}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230711-remove-type-requirements.md",children:"FLIP 118"}),"."]}),e.jsx(i.h4,{id:"-adoption-19",children:"🔄 Adoption"}),e.jsx(i.p,{children:"Any existing code that made use of the type requirements feature should be rewritten not to use this feature."})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Event Definition And Emission In Interfaces (",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230417-events-emitted-from-interfaces.md",children:"FLIP 111"}),")"]}),e.jsx(i.h4,{id:"-motivation-22",children:"💡 Motivation"}),e.jsx(i.p,{children:"In order to support the removal of nested type requirements, events have been made define-able and emit-able from contract interfaces, as events were among the only common uses of the type requirements feature."}),e.jsx(i.h4,{id:"ℹ️-description-20",children:"ℹ️ Description"}),e.jsx(i.p,{children:"Contract interfaces may now define event types, and these events can be emitted from function conditions and default implementations in those contract interfaces."}),e.jsxs(i.p,{children:["This improvement was proposed in ",e.jsx(i.a,{href:"https://github.com/onflow/flips/blob/main/cadence/20230417-events-emitted-from-interfaces.md",children:"FLIP 111"}),"."]}),e.jsx(i.h4,{id:"-adoption-20",children:"🔄 Adoption"}),e.jsx(i.p,{children:"Contract interfaces that previously used type requirements to enforce that concrete contracts that implement the interface should also declare a specific event, should instead define and emit that event in the interface."}),e.jsx(i.h4,{id:"-example-17",children:"✨ Example"}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"Before:"})}),e.jsxs(i.p,{children:["A contract interface like the one below (",e.jsx(i.code,{children:"SomeInterface"}),") used a type requirement to enforce that contracts which implement the interface also define a certain event (",e.jsx(i.code,{children:"Foo"}),"):"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SomeInterface"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//^^^^^^^^^^^ type requirement"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" inheritedFunction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" MyContract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SomeInterface"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//^^^^^^^^^^^ type definition to satisfy type requirement"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" inheritedFunction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//  ..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    emit"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:e.jsx(i.strong,{children:"After:"})}),e.jsxs(i.p,{children:["This can be rewritten to emit the event directly from the interface, so that any contracts that implement ",e.jsx(i.code,{children:"Intf"})," will always emit ",e.jsx(i.code,{children:"Foo"})," when ",e.jsx(i.code,{children:"inheritedFunction"})," is called:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Intf"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//^^^^^^^^^^^ type definition"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" inheritedFunction"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    pre"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      emit"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["Force Destruction of Resources (",e.jsx(i.a,{href:"https://github.com/onflow/flips/pull/131",children:"FLIP 131"}),")"]}),e.jsx(i.h4,{id:"-motivation-23",children:"💡 Motivation"}),e.jsxs(i.p,{children:["It was previously possible to panic in the body of a resource or attachment’s ",e.jsx(i.code,{children:"destroy"})," method, effectively preventing the destruction or removal of that resource from an account. This could be used as an attack vector by handing people undesirable resources or hydrating resources to make them extremely large or otherwise contain undesirable content."]}),e.jsx(i.h4,{id:"ℹ️-description-21",children:"ℹ️ Description"}),e.jsxs(i.p,{children:["Contracts may no longer define ",e.jsx(i.code,{children:"destroy"}),` functions on their resources, and are no longer required to explicitly handle the destruction of resource fields. These will instead be implicitly destroyed whenever a resource is destroyed.
Additionally, developers may define a `,e.jsx(i.code,{children:"ResourceDestroyed"}),` event in the body of a resource definition using default arguments, which will be lazily evaluated and then emitted whenever a resource of that type is destroyed.
This improvement was proposed in `,e.jsx(i.a,{href:"https://github.com/onflow/flips/pull/131",children:"FLIP 131"}),"."]}),e.jsx(i.h4,{id:"-adoption-21",children:"🔄 Adoption"}),e.jsx(i.p,{children:"Contracts that previously used destroy methods will need to remove them, and potentially define a ResourceDestroyed event to track destruction if necessary."}),e.jsx(i.h4,{id:"-example-18",children:"✨ Example"}),e.jsx(i.p,{children:"A pair of resources previously written as:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" E"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SubResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".id = id"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    emit"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" E"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".id)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" subR: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SubResource"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".subR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SubResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: id)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".subR"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),e.jsx(i.p,{children:"can now be equivalently written as:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SubResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ResourceDestroyed"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".id)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".id = id"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" subR: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SubResource"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".subR "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SubResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: id)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]}),`
`,e.jsxs("details",{children:[e.jsxs("summary",{children:["New ",e.jsx(i.code,{children:"domainSeparationTag"})," parameter added to ",e.jsx(i.code,{children:"Crypto.KeyList.verify"})]}),e.jsx(i.h4,{id:"-motivation-24",children:"💡 Motivation"}),e.jsxs(i.p,{children:[e.jsx(i.code,{children:"KeyList"}),"’s ",e.jsx(i.code,{children:"verify"})," function used to hardcode the domain separation tag (",e.jsx(i.code,{children:'"FLOW-V0.0-user"'}),") used to verify each signature from the list. This forced users to use the same domain tag and didn’t allow them to scope their signatures to specific use-cases and applications. Moreover, the ",e.jsx(i.code,{children:"verify"})," function didn’t mirror the ",e.jsx(i.code,{children:"PublicKey"})," signature verification behavior which accepts a domain tag parameter."]}),e.jsx(i.h4,{id:"ℹ️-description-22",children:"ℹ️ Description"}),e.jsxs(i.p,{children:[e.jsx(i.code,{children:"KeyList"}),"’s ",e.jsx(i.code,{children:"verify"})," function requires an extra parameter to specify the domain separation tag used to verify the input signatures. The tag is is a single ",e.jsx(i.code,{children:"string"})," parameter and is used with all signatures. This mirrors the behavior of the simple public key (see  ",e.jsx(i.a,{href:"https://cadence-lang.org/docs/1.0/language/crypto#signature-verification",children:"Signature verification"})," for more information)."]}),e.jsx(i.h4,{id:"-adoption-22",children:"🔄 Adoption"}),e.jsxs(i.p,{children:["Contracts that use ",e.jsx(i.code,{children:"KeyList"})," need to update the calls to ",e.jsx(i.code,{children:"verify"})," by adding the new domain separation tag parameter. Using the tag as ",e.jsx(i.code,{children:'"FLOW-V0.0-user"'})," would keep the exact same behavior as before the breaking change. Applications may also define a new domain tag for their specific use-case and use it when generating valid signatures, for added security against signature replays. See ",e.jsx(i.a,{href:"https://cadence-lang.org/docs/1.0/language/crypto#signature-verification",children:"Signature verification"})," and specifically ",e.jsx(i.a,{href:"https://cadence-lang.org/docs/1.0/language/crypto#hashing-with-a-domain-tag",children:"Hashing with a domain tag"})," for details on how to generate valid signatures with a tag."]}),e.jsx(i.h4,{id:"-example-19",children:"✨ Example"}),e.jsxs(i.p,{children:["A previous call to ",e.jsx(i.code,{children:"KeyList"}),"’s ",e.jsx(i.code,{children:"verify"})," is written as:"]}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" isValid = keyList."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"verify"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  signatureSet: signatureSet,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  signedData: signedData"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),e.jsx(i.p,{children:"can now be equivalently written as:"}),e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" isValid = keyList."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"verify"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  signatureSet: signatureSet,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  signedData: signedData,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  domainSeparationTag: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"FLOW-V0.0-user"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),e.jsxs(i.p,{children:["Instead of the existing hardcoded domain separation tag, a new domain tag can be defined, but it has to be also used when generating valid signatures, e.g., ",e.jsx(i.code,{children:'"my_app_custom_domain_tag"'}),"."]})]}),`
`,e.jsx(i.h2,{id:"ft--nft-standard-changes",children:"FT / NFT standard changes"}),`
`,e.jsx(i.p,{children:"In addition to the upcoming language changes, the Cadence 1.0 upgrade also includes breaking changes to core contracts, such as the FungibleToken and NonFungibleToken standards. All Fungible and Non-Fungible Token contracts will need to be updated to the new standard."}),`
`,e.jsx(i.p,{children:"These interfaces are being upgraded to allow for multiple tokens per contract, fix some issues with the original standards, and introduce other various improvements suggested by the community."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Original Proposal: ",e.jsx(i.a,{href:"http://forum.flow.com/t/streamlined-token-standards-proposal/3075",children:"Flow forum"})]}),`
`,e.jsxs(i.li,{children:["Fungible Token Changes PR (WIP): ",e.jsx(i.a,{href:"https://github.com/onflow/flow-ft/pull/77",children:"V2 FungibleToken Standard by joshuahannan — Pull Request #77 — onflow/flow-ft"})]}),`
`,e.jsxs(i.li,{children:["NFT Changes PR: ",e.jsx(i.a,{href:"https://github.com/onflow/flow-nft/pull/126",children:"GitHub"})]}),`
`]}),`
`,e.jsx(i.p,{children:"It will involve upgrading your token contracts with changes to events, function signatures, resource interface conformances, and other small changes."}),`
`,e.jsx(i.p,{children:"There are some existing guides for upgrading your token contracts to the new standard:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"./ft-guide",children:"Upgrading Fungible Token Contracts"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"./nft-guide",children:"Upgrading Non-Fungible Token Contracts"})}),`
`]}),`
`,e.jsx(i.h2,{id:"more-resources",children:"More resources"}),`
`,e.jsxs(i.p,{children:["If you have any questions or need help with the upgrade, feel free to reach out to the Flow team on the ",e.jsx(i.a,{href:"https://discord.gg/flowblockchain.",children:"Flow Discord"}),"."]}),`
`,e.jsxs(i.p,{children:["Help is also available during the ",e.jsx(i.a,{href:"https://calendar.google.com/calendar/ical/c_47978f5cd9da636cadc6b8473102b5092c1a865dd010558393ecb7f9fd0c9ad0%40group.calendar.google.com/public/basic.ics",children:"Cadence 1.0 Office Hours"})," each week at 10:00AM PST on the Flow Developer Discord."]}),`
`]})}function d(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{a as _markdown,d as default,l as frontmatter,h as structuredData,r as toc};
