import{j as e}from"./main-BXy83AsK.js";let a=`

Access control allows making certain parts of a program accessible/visible and making other parts inaccessible/invisible.

In Cadence, access control is used in two ways:

1. Access control on objects in account storage, using [capability security].

   A user is not able to access an object unless they own the object or have a reference to that object. This means that nothing is truly public by default.

   Other accounts cannot read or write the objects in an account unless the owner of the account has granted them access by providing references to the objects.

   This kind of access control is covered in [capabilities] and [capability management].

2. Access control within contracts and objects, using access modifiers (\`access\` keyword).

This page covers the second part of access control, using access modifiers.

:::warning
Remember that in this case, \`private\` refers to programmatic access to the data with a script or transaction.  It is **not safe** to store secret or private information in a user's account.  The raw data is still public and could be decoded by reading the public blockchain data directly.
:::

The access keyword [#the-access-keyword]

All declarations, such as [functions], [composite types], and fields, must be prefixed with an access modifier using the \`access\` keyword.

The access modifier determines where the declaration is accessible/visible. Fields can only be assigned to and mutated from within the same or inner scope.

For example, to make a function publicly accessible (\`access(all)\` is explained below):

\`\`\`
access(all)
fun test() {}
\`\`\`

:::danger
If you prefix a function with \`access(all)\`, you are likely granting complete and open access for **anyone using any account to call that function.** It is critical that you properly use [entitlements] to restrict sensitive functions to the accounts that need access.

For example, if you create a vault for your users and give the \`withdraw\` function \`access(all)\`, anyone can drain that vault if they know where to find it.
:::

Types of access control [#types-of-access-control]

There are five levels of access control:

* **Public access** — the declaration is accessible/visible in all scopes. This includes the current scope, inner scopes, and the outer scopes.

  A declaration is made publicly accessible using the \`access(all)\` modifier.

  For example, a public field in a type can be accessed on an instance of the type in an outer scope.

* **Entitled access** — the declaration is only accessible/visible to the owner/holder of the object, or to [references] that are authorized to the required [entitlements].

  A declaration is made accessible through entitlements by using the \`access(E)\` syntax, where \`E\` is a set of one or more entitlements, or a single [entitlement mapping].

  An entitled field acts like an \`access(all)\` field ONLY if the caller actually holds the concrete resource object and not just a reference to it. In that case, an authorized reference is needed.

  A reference is considered authorized to an entitlement if that entitlement appears in the \`auth\` portion of the reference type.

  For example, an \`access(E, F)\` field on a resource \`R\` can only be accessed by an owned (\`@R\`-typed) value, or a reference to \`R\` that is authorized to the \`E\` and \`F\` entitlements (\`auth(E, F) &R\`).

* **Account access** — the declaration is only accessible/visible in the scope of the entire account where it is defined. This means that other contracts in the account are able to access it.

  A declaration is made accessible by code in the same account, for example other contracts, by using the \`access(account)\` keyword.

* **Contract access** — the declaration is only accessible/visible in the scope of the contract that defined it. This means that other declarations that are defined in the same contract can access it, but not other contracts in the same account.

  A declaration is made accessible by code in the same contract by using the \`access(contract)\` keyword.

* **Private access** — the declaration is only accessible/visible in the current and inner scopes.

  A declaration is made accessible by code in the same containing type by using the \`access(self)\` keyword.

  For example, an \`access(self)\` field can only be accessed by functions of the type it is part of, not by code in an outer scope.

To summarize the behavior for variable declarations, constant declarations, and fields:

| Declaration kind | Access modifier    | Accessible in                                       | Assignable in     | Mutable in        |
| :--------------- | :----------------- | :-------------------------------------------------- | :---------------- | :---------------- |
| \`let\`            | \`access(self)\`     | Current and inner                                   | *None*            | Current and inner |
| \`let\`            | \`access(contract)\` | Current, inner, and containing contract             | *None*            | Current and inner |
| \`let\`            | \`access(account)\`  | Current, inner, and other contracts in same account | *None*            | Current and inner |
| \`let\`            | \`access(all)\`      | **All**                                             | *None*            | Current and inner |
| \`let\`            | \`access(E)\`        | **All** with required entitlements                  | *None*            | Current and inner |
| \`var\`            | \`access(self)\`     | Current and inner                                   | Current and inner | Current and inner |
| \`var\`            | \`access(contract)\` | Current, inner, and containing contract             | Current and inner | Current and inner |
| \`var\`            | \`access(account)\`  | Current, inner, and other contracts in same account | Current and inner | Current and inner |
| \`var\`            | \`access(all)\`      | **All**                                             | Current and inner | Current and inner |
| \`var\`            | \`access(E)\`        | **All** with required entitlements                  | Current and inner | Current and inner |

Declarations of [composite types] must be public. However, even though the declarations/types are publicly visible, resources can only be created, and events can only be emitted from inside the contract they are declared in:

\`\`\`cadence
// Declare a private constant, inaccessible/invisible in outer scope.
//
access(self)
let a = 1

// Declare a public constant, accessible/visible in all scopes.
//
access(all)
let b = 2
\`\`\`

\`\`\`cadence
// Declare a public struct, accessible/visible in all scopes.
//
access(all)
struct SomeStruct {

    // Declare a private constant field, which is only readable
    // in the current and inner scopes.
    //
    access(self)
    let a: Int

    // Declare a public constant field, which is readable in all scopes.
    //
    access(all)
    let b: Int

    // Declare a private variable field, which is only readable
    // and writable in the current and inner scopes.
    //
    access(self)
    var c: Int

    // Declare a public variable field, which is not settable,
    // so it is only writable in the current and inner scopes,
    // and readable in all scopes.
    //
    access(all)
    var d: Int

    // Arrays and dictionaries declared without (set) cannot be
    // mutated in external scopes
    access(all)
    let arr: [Int]

    // The initializer is omitted for brevity.

    // Declare a private function, which is only callable
    // in the current and inner scopes.
    //
    access(self)
    fun privateTest() {
        // ...
    }

    // Declare a public function, which is callable in all scopes.
    //
    access(all)
    fun publicTest() {
        // ...
    }

    // The initializer is omitted for brevity.

}

let some = SomeStruct()

// Invalid: cannot read private constant field in outer scope.
//
some.a

// Invalid: cannot set private constant field in outer scope.
//
some.a = 1

// Valid: can read public constant field in outer scope.
//
some.b

// Invalid: cannot set public constant field in outer scope.
//
some.b = 2

// Invalid: cannot read private variable field in outer scope.
//
some.c

// Invalid: cannot set private variable field in outer scope.
//
some.c = 3

// Valid: can read public variable field in outer scope.
//
some.d

// Invalid: cannot set public variable field in outer scope.
//
some.d = 4

// Invalid: cannot mutate a public field in outer scope.
//
some.f.append(0)

// Invalid: cannot mutate a public field in outer scope.
//
some.f[3] = 1

// Valid: can call non-mutating methods on a public field in outer scope
some.f.contains(0)
\`\`\`

Entitlements [#entitlements]

Entitlements provide granular access control to each member of a composite. Entitlements are declared using the syntax \`entitlement E\`, where \`E\` is the name of the entitlement.

For example, the following code declares two entitlements called \`E\` and \`F\`:

\`\`\`cadence
entitlement E
entitlement F
\`\`\`

Entitlements can be imported from other contracts and used the same way as other types. When using entitlements defined in another contract, the same qualified name syntax is used as for other types:

\`\`\`cadence
contract C {
    entitlement E
}
\`\`\`

Outside of \`C\`, \`E\` is used with \`C.E\` syntax.

Entitlements exist in the same namespace as types, so if a contract declares a resource called \`R\`, it is impossible to declare an entitlement that is also called \`R\`.

Entitlements can be used in access modifiers of composite members (fields and functions) to specify which references to those composites are allowed to access those members.

An access modifier can include more than one entitlement, joined with either an \`|\`, to indicate disjunction ("or"), or a \`,\`, to indicate conjunction ("and"). The two kinds of separators cannot be combined in the same set.

For example:

\`\`\`cadence
access(all)
resource SomeResource {

  // requires a reference to have an \`E\` entitlement to read this field
  access(E)
  let a: Int

  // requires a reference to have either an \`E\` OR an \`F\` entitlement 
  // to read this field.
  access(E | F)
  let b: Int

  // requires a reference to have both an \`E\` AND an \`F\` entitlement 
  // to read this field.
  access(E, F)
  let c: Int

  // intializers omitted for brevity
  // ...
}
\`\`\`

Assuming the following constants exist, which have owned or [reference] types:

\`\`\`cadence
let r: @SomeResource = // ...
let refE: auth(E) &SomeResource = // ...
let refF: auth(F) &SomeResource = // ...
let refEF: auth(E, F) &SomeResource = // ...
let refEOrF: auth(E | F) &SomeResource = // ...
\`\`\`

The references can be used as follows:

\`\`\`cadence
// valid, because \`r\` is owned and thus is "fully entitled"
r.a
// valid, because \`r\` is owned and thus is "fully entitled"
r.b
// valid, because \`r\` is owned and thus is "fully entitled"
r.c

// valid, because \`refE\` has an \`E\` entitlement as required
refE.a
// valid, because \`refE\` has one of the two required entitlements
refE.b
// invalid, because \`refE\` only has one of the two required entitlements
refE.c

// invalid, because \`refF\` has an \`E\` entitlement, not an \`F\`
refF.a
// valid, because \`refF\` has one of the two required entitlements
refF.b
// invalid, because \`refF\` only has one of the two required entitlements
refF.c

// valid, because \`refEF\` has an \`E\` entitlement
refEF.a
// valid, because \`refEF\` has both of the two required entitlements
refEF.b
// valid, because \`refEF\` has both of the two required entitlements
refEF.c

// invalid, because \`refEOrF\` might not have an \`E\` entitlement 
// (it may have \`F\` instead)
refEOrF.a
// valid, because \`refEOrF\` has one of the two entitlements necessary
refEOrF.b
// invalid, because \`refEOrF\` is only known to have one of the two 
// required entitlements
refEOrF.c
\`\`\`

Note that, particularly in this example, how the owned value \`r\` can access all entitled members on \`SomeResource\`. Owned values are not affected by entitled declarations.

See [Authorized References] for more information.

Entitlement mappings [#entitlement-mappings]

Entitlement mappings are a way to statically declare how entitlements are propagated from parents to child objects in a nesting hierarchy.

When objects have fields that are child objects, entitlement mappings can be used to grant access to the inner object based on the entitlements of the reference to the parent object.

Consider the following example, which uses entitlements to control access to an inner resource:

\`\`\`cadence
entitlement OuterEntitlement
entitlement InnerEntitlement

resource InnerResource {

    access(all)
    fun foo() { ... }

    access(InnerEntitlement)
    fun bar() { ... }
}

resource OuterResource {
    access(self)
    let childResource: @InnerResource

    init(childResource: @InnerResource) {
        self.childResource <- childResource
    }

    // The parent resource has to provide two accessor functions
    // which return a reference to the inner resource.
    //
    // If the reference to the outer resource is unauthorized
    // and does not have the OuterEntitlement entitlement,
    // the outer resource allows getting an unauthorized reference
    // to the inner resource.
    //
    // If the reference to the outer resource is authorized
    // and it has the OuterEntitlement entitlement,
    // the outer resource allows getting an authorized reference
    // to the inner resource.

    access(all)
    fun getPubRef(): &InnerResource {
        return &self.childResource as &InnerResource
    }

    access(OuterEntitlement)
    fun getEntitledRef(): auth(InnerEntitlement) &InnerResource {
        return &self.childResource as auth(InnerEntitlement) &InnerResource
    }
}
\`\`\`

With this pattern, it is possible to store a \`InnerResource\` in an \`OuterResource\`, and create different ways to access that nested resource depending on the entitlement one possesses.

An unauthorized reference to \`OuterResource\` can only be used to call the \`getPubRef\` function, and thus can only obtain an unauthorized reference to \`InnerResource\`. That reference to the \`InnerResource\` then only allows calling the function \`foo\`, which is publicly accessible, but not function \`bar\`, as it needs the \`InnerEntitlement\` entitlement, which is not granted.

However an \`OuterEntitlement\`-authorized reference to the \`OuterResource\` can be used to call the \`getEntitledRef\` function, which returns a \`InnerEntitlement\`-authorized reference to \`InnerResource\`, which in turn can be used to call function \`bar\`.

This pattern is functional, but it is unfortunate that the accessor functions to \`InnerResource\` have to be "duplicated".

Entitlement mappings should be used to avoid this duplication.

Entitlement mappings are declared by using the syntax:

\`\`\`cadence
entitlement mapping M {
    // ...
}
\`\`\`

Where \`M\` is the name of the mapping.

The body of the mapping contains zero or more rules of the form \`A -> B\`, where \`A\` and \`B\` are entitlements. Each rule declares that, given a reference with the entitlement on the left, a reference with the entitlement on the right is produced.

An entitlement mapping thus defines a function from an input set of entitlements (called the *domain*) to an output set (called the *range* or the *image*).

Using entitlement mappings, the above example could be more concisely written as:

\`\`\`cadence
entitlement OuterEntitlement
entitlement InnerEntitlement

// Specify a mapping for entitlements called \`OuterToInnerMap\`,
// which maps the entitlement \`OuterEntitlement\` to the entitlement \`InnerEntitlement\`.
entitlement mapping OuterToInnerMap {
    OuterEntitlement -> InnerEntitlement
}

resource InnerResource {
  
    access(all)
    fun foo() { ... }

    access(InnerEntitlement)
    fun bar() { ... }
}

resource OuterResource {
    // Use the entitlement mapping \`OuterToInnerMap\`.
    //
    // This declares that when the field \`childResource\` is accessed
    // using a reference authorized with the entitlement \`OuterEntitlement\`,
    // then a reference with the entitlement \`InnerEntitlement\` is returned.
    //
    // This is equivalent to the two accessor functions
    // that were necessary in the previous example.
    //
    access(mapping OuterToInnerMap)
    let childResource: @InnerResource

    init(childResource: @InnerResource) {
        self.childResource <- childResource
    }

    // No accessor functions are needed.
}

// given some value \`r\` of type \`@OuterResource\`

let pubRef = &r as &OuterResource
let pubInnerRef = pubRef.childResource // has type \`&InnerResource\`

let entitledRef = &r as auth(OuterEntitlement) &OuterResource
let entitledInnerRef = entitledRef.childResource  // has type 
    // \`auth(InnerEntitlement) &InnerResource\`,as \`OuterEntitlement\` 
    // is defined to map to \`InnerEntitlement\`.

// \`r\` is an owned value, and is thus considered "fully-entitled" 
// to \`OuterResource\`, so this access yields a value authorized to the 
// entire  image of \`OuterToInnerMap\`, in this case \`InnerEntitlement\`, 
// and thus can call \`bar\`
r.childResource.bar()
\`\`\`

Entitlement mappings can be used either in accessor functions (as in the example above), in fields whose types are either references, or containers (composite types, dictionaries, and arrays).

Entitlement mappings need not be 1:1. It is valid to define a mapping where many inputs map to the same output, or where one input maps to many outputs.

Entitlement mappings preserve the "kind" of the set they are mapping. That is, mapping a conjunction ("and") set produces a conjunction set, and mapping a disjunction ("or") set produces a disjunction set.

Because entitlement separators cannot be combined in the same set, attempting to map disjunction ("or") sets through certain complex mappings can result in a type error.

For example, given the following entitlement mapping:

\`\`\`cadence
entitlement mapping M {
  A -> B
  A -> C
  D -> E
}
\`\`\`

Attempting to map \`(A | D)\` through \`M\` will fail, since \`A\` should map to \`(B, C)\` and \`D\` should map to \`E\`, but these two outputs cannot be combined into a disjunction ("or") set.

A good example of how entitlement mappings can be used is the [\`Account\` type].

The Identity entitlement mapping [#the-identity-entitlement-mapping]

\`Identity\` is a special built-in entitlement mapping that maps every input to itself as the output. Any entitlement set passed through the \`Identity\` map will come out unchanged in the output.

For instance:

\`\`\`cadence
entitlement X

resource InnerResource {
    // ...
}

resource OuterResource {
    access(mapping Identity)
    let childResource: @InnerResource

    access(mapping Identity)
    getChildResource(): auth(mapping Identity) &InnerResource {
        return &self.childResource
    }

    init(childResource: @InnerResource) {
        self.childResource <- childResource
    }
}

fun example(outerRef: auth(X) &OuterResource) {
    let innerRef = outerRef.childResource // \`innerRef\` has type \`auth(X) &InnerResource\`,
        // as \`outerRef\` was authorized with entitlement \`X\`
}
\`\`\`

One important point to note about the \`Identity\` mapping, however, is that its full output range is unknown and theoretically infinite. Because of that, accessing an \`Identity\`-mapped field or function with an owned value will yield an empty output set.

For example, calling \`getChildResource()\` on an owned \`OuterResource\` value will produce an unauthorized \`&InnerResource\` reference.

Mapping composition [#mapping-composition]

Entitlement mappings can be composed. In the definition of an entitlement mapping, it is possible to include the definition of one or more other mappings, to copy over their mapping relations.

An entitlement mapping is included into another entitlement mapping using the \`include M\` syntax, where \`M\` is the name of the entitlement mapping to be included.

In general, an \`include M\` statement in the definition of an entitlement mapping \`N\` is equivalent to simply copy-pasting all the relations defined in \`M\` into \`N\`'s definition.

Support for \`include\` is provided primarily to reduce code reuse and promote composition.

For example:

\`\`\`cadence
entitlement mapping M {
  X -> Y
  Y -> Z
}

entitlement mapping N {
  E -> F
}

entitlement mapping P {
  include M
  include N
  F -> G
}
\`\`\`

The entitlement mapping \`P\` includes all of the relations defined in \`M\` and \`N\`, along with the additional relations defined in its own definition.

It is also possible to include the \`Identity\` mapping. Any mapping \`M\` that includes the \`Identity\` mapping will map its input set to itself, along with any additional relations defined in the mapping or in other included mappings.

For instance:

\`\`\`cadence
entitlement mapping M {
    include Identity
    X -> Y
}
\`\`\`

The mapping \`M\` maps the entitlement set \`(X)\` to \`(X, Y)\`, and \`(Y)\` to \`(Y)\`.

Includes that produce a cyclical mapping are rejected by the type-checker.

Built-in mutability entitlements [#built-in-mutability-entitlements]

A prominent use case of entitlements is to control access to objects based on mutability.

For example, in a composite, the author would want to control the access to certain fields to be read-only, and some fields to be mutable, and so on.

In order to support this, the following built-in entitlements can be used:

* \`Insert\`
* \`Remove\`
* \`Mutate\`

These are primarily used by the built-in [array] and [dictionary] functions, but are available to be used in access modifiers of any declaration.

While Cadence does not support entitlement composition or inheritance, the \`Mutate\` entitlement is intended to be used as an equivalent form to the conjunction of the \`(Insert, Remove)\` entitlement set.

{/* Relative links. Will not render on the page */}

[\`Account\` type]: ./accounts/index

[array]: ./values-and-types/arrays

[Authorized References]: ./references#authorized-references

[capabilities]: ./capabilities

[capability management]: ./accounts/capabilities

[capability security]: ./capabilities

[composite types]: ./types-and-type-system/composite-types

[dictionary]: ./values-and-types/dictionaries

[entitlement mapping]: #entitlement-mappings

[entitlements]: #entitlements

[functions]: ./functions

[reference]: ./references

[references]: ./references
`,l={title:"Access Control"},h={contents:[{heading:void 0,content:"Access control allows making certain parts of a program accessible/visible and making other parts inaccessible/invisible."},{heading:void 0,content:"In Cadence, access control is used in two ways:"},{heading:void 0,content:"Access control on objects in account storage, using [capability security]."},{heading:void 0,content:"A user is not able to access an object unless they own the object or have a reference to that object. This means that nothing is truly public by default."},{heading:void 0,content:"Other accounts cannot read or write the objects in an account unless the owner of the account has granted them access by providing references to the objects."},{heading:void 0,content:"This kind of access control is covered in [capabilities] and [capability management]."},{heading:void 0,content:"Access control within contracts and objects, using access modifiers (`access` keyword)."},{heading:void 0,content:"This page covers the second part of access control, using access modifiers."},{heading:void 0,content:":::warning\nRemember that in this case, `private` refers to programmatic access to the data with a script or transaction.  It is **not safe** to store secret or private information in a user's account.  The raw data is still public and could be decoded by reading the public blockchain data directly.\n:::"},{heading:"the-access-keyword",content:"All declarations, such as [functions], [composite types], and fields, must be prefixed with an access modifier using the `access` keyword."},{heading:"the-access-keyword",content:"The access modifier determines where the declaration is accessible/visible. Fields can only be assigned to and mutated from within the same or inner scope."},{heading:"the-access-keyword",content:"For example, to make a function publicly accessible (`access(all)` is explained below):"},{heading:"the-access-keyword",content:":::danger\nIf you prefix a function with `access(all)`, you are likely granting complete and open access for &#x2A;*anyone using any account to call that function.** It is critical that you properly use [entitlements] to restrict sensitive functions to the accounts that need access."},{heading:"the-access-keyword",content:"For example, if you create a vault for your users and give the `withdraw` function `access(all)`, anyone can drain that vault if they know where to find it.\n:::"},{heading:"types-of-access-control",content:"There are five levels of access control:"},{heading:"types-of-access-control",content:"**Public access** — the declaration is accessible/visible in all scopes. This includes the current scope, inner scopes, and the outer scopes."},{heading:"types-of-access-control",content:"A declaration is made publicly accessible using the `access(all)` modifier."},{heading:"types-of-access-control",content:"For example, a public field in a type can be accessed on an instance of the type in an outer scope."},{heading:"types-of-access-control",content:"**Entitled access** — the declaration is only accessible/visible to the owner/holder of the object, or to [references] that are authorized to the required [entitlements]."},{heading:"types-of-access-control",content:"A declaration is made accessible through entitlements by using the `access(E)` syntax, where `E` is a set of one or more entitlements, or a single [entitlement mapping]."},{heading:"types-of-access-control",content:"An entitled field acts like an `access(all)` field ONLY if the caller actually holds the concrete resource object and not just a reference to it. In that case, an authorized reference is needed."},{heading:"types-of-access-control",content:"A reference is considered authorized to an entitlement if that entitlement appears in the `auth` portion of the reference type."},{heading:"types-of-access-control",content:"For example, an `access(E, F)` field on a resource `R` can only be accessed by an owned (`@R`-typed) value, or a reference to `R` that is authorized to the `E` and `F` entitlements (`auth(E, F) &R`)."},{heading:"types-of-access-control",content:"**Account access** — the declaration is only accessible/visible in the scope of the entire account where it is defined. This means that other contracts in the account are able to access it."},{heading:"types-of-access-control",content:"A declaration is made accessible by code in the same account, for example other contracts, by using the `access(account)` keyword."},{heading:"types-of-access-control",content:"**Contract access** — the declaration is only accessible/visible in the scope of the contract that defined it. This means that other declarations that are defined in the same contract can access it, but not other contracts in the same account."},{heading:"types-of-access-control",content:"A declaration is made accessible by code in the same contract by using the `access(contract)` keyword."},{heading:"types-of-access-control",content:"**Private access** — the declaration is only accessible/visible in the current and inner scopes."},{heading:"types-of-access-control",content:"A declaration is made accessible by code in the same containing type by using the `access(self)` keyword."},{heading:"types-of-access-control",content:"For example, an `access(self)` field can only be accessed by functions of the type it is part of, not by code in an outer scope."},{heading:"types-of-access-control",content:"To summarize the behavior for variable declarations, constant declarations, and fields:"},{heading:"types-of-access-control",content:"Declaration kind"},{heading:"types-of-access-control",content:"Access modifier"},{heading:"types-of-access-control",content:"Accessible in"},{heading:"types-of-access-control",content:"Assignable in"},{heading:"types-of-access-control",content:"Mutable in"},{heading:"types-of-access-control",content:"`let`"},{heading:"types-of-access-control",content:"`access(self)`"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"*None*"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`let`"},{heading:"types-of-access-control",content:"`access(contract)`"},{heading:"types-of-access-control",content:"Current, inner, and containing contract"},{heading:"types-of-access-control",content:"*None*"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`let`"},{heading:"types-of-access-control",content:"`access(account)`"},{heading:"types-of-access-control",content:"Current, inner, and other contracts in same account"},{heading:"types-of-access-control",content:"*None*"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`let`"},{heading:"types-of-access-control",content:"`access(all)`"},{heading:"types-of-access-control",content:"**All**"},{heading:"types-of-access-control",content:"*None*"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`let`"},{heading:"types-of-access-control",content:"`access(E)`"},{heading:"types-of-access-control",content:"**All** with required entitlements"},{heading:"types-of-access-control",content:"*None*"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`var`"},{heading:"types-of-access-control",content:"`access(self)`"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`var`"},{heading:"types-of-access-control",content:"`access(contract)`"},{heading:"types-of-access-control",content:"Current, inner, and containing contract"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`var`"},{heading:"types-of-access-control",content:"`access(account)`"},{heading:"types-of-access-control",content:"Current, inner, and other contracts in same account"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`var`"},{heading:"types-of-access-control",content:"`access(all)`"},{heading:"types-of-access-control",content:"**All**"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"`var`"},{heading:"types-of-access-control",content:"`access(E)`"},{heading:"types-of-access-control",content:"**All** with required entitlements"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"Current and inner"},{heading:"types-of-access-control",content:"Declarations of [composite types] must be public. However, even though the declarations/types are publicly visible, resources can only be created, and events can only be emitted from inside the contract they are declared in:"},{heading:"entitlements",content:"Entitlements provide granular access control to each member of a composite. Entitlements are declared using the syntax `entitlement E`, where `E` is the name of the entitlement."},{heading:"entitlements",content:"For example, the following code declares two entitlements called `E` and `F`:"},{heading:"entitlements",content:"Entitlements can be imported from other contracts and used the same way as other types. When using entitlements defined in another contract, the same qualified name syntax is used as for other types:"},{heading:"entitlements",content:"Outside of `C`, `E` is used with `C.E` syntax."},{heading:"entitlements",content:"Entitlements exist in the same namespace as types, so if a contract declares a resource called `R`, it is impossible to declare an entitlement that is also called `R`."},{heading:"entitlements",content:"Entitlements can be used in access modifiers of composite members (fields and functions) to specify which references to those composites are allowed to access those members."},{heading:"entitlements",content:'An access modifier can include more than one entitlement, joined with either an `|`, to indicate disjunction ("or"), or a `,`, to indicate conjunction ("and"). The two kinds of separators cannot be combined in the same set.'},{heading:"entitlements",content:"For example:"},{heading:"entitlements",content:"Assuming the following constants exist, which have owned or [reference] types:"},{heading:"entitlements",content:"The references can be used as follows:"},{heading:"entitlements",content:"Note that, particularly in this example, how the owned value `r` can access all entitled members on `SomeResource`. Owned values are not affected by entitled declarations."},{heading:"entitlements",content:"See [Authorized References] for more information."},{heading:"entitlement-mappings",content:"Entitlement mappings are a way to statically declare how entitlements are propagated from parents to child objects in a nesting hierarchy."},{heading:"entitlement-mappings",content:"When objects have fields that are child objects, entitlement mappings can be used to grant access to the inner object based on the entitlements of the reference to the parent object."},{heading:"entitlement-mappings",content:"Consider the following example, which uses entitlements to control access to an inner resource:"},{heading:"entitlement-mappings",content:"With this pattern, it is possible to store a `InnerResource` in an `OuterResource`, and create different ways to access that nested resource depending on the entitlement one possesses."},{heading:"entitlement-mappings",content:"An unauthorized reference to `OuterResource` can only be used to call the `getPubRef` function, and thus can only obtain an unauthorized reference to `InnerResource`. That reference to the `InnerResource` then only allows calling the function `foo`, which is publicly accessible, but not function `bar`, as it needs the `InnerEntitlement` entitlement, which is not granted."},{heading:"entitlement-mappings",content:"However an `OuterEntitlement`-authorized reference to the `OuterResource` can be used to call the `getEntitledRef` function, which returns a `InnerEntitlement`-authorized reference to `InnerResource`, which in turn can be used to call function `bar`."},{heading:"entitlement-mappings",content:'This pattern is functional, but it is unfortunate that the accessor functions to `InnerResource` have to be "duplicated".'},{heading:"entitlement-mappings",content:"Entitlement mappings should be used to avoid this duplication."},{heading:"entitlement-mappings",content:"Entitlement mappings are declared by using the syntax:"},{heading:"entitlement-mappings",content:"Where `M` is the name of the mapping."},{heading:"entitlement-mappings",content:"The body of the mapping contains zero or more rules of the form `A -> B`, where `A` and `B` are entitlements. Each rule declares that, given a reference with the entitlement on the left, a reference with the entitlement on the right is produced."},{heading:"entitlement-mappings",content:"An entitlement mapping thus defines a function from an input set of entitlements (called the *domain*) to an output set (called the *range* or the *image*)."},{heading:"entitlement-mappings",content:"Using entitlement mappings, the above example could be more concisely written as:"},{heading:"entitlement-mappings",content:"Entitlement mappings can be used either in accessor functions (as in the example above), in fields whose types are either references, or containers (composite types, dictionaries, and arrays)."},{heading:"entitlement-mappings",content:"Entitlement mappings need not be 1:1. It is valid to define a mapping where many inputs map to the same output, or where one input maps to many outputs."},{heading:"entitlement-mappings",content:'Entitlement mappings preserve the "kind" of the set they are mapping. That is, mapping a conjunction ("and") set produces a conjunction set, and mapping a disjunction ("or") set produces a disjunction set.'},{heading:"entitlement-mappings",content:'Because entitlement separators cannot be combined in the same set, attempting to map disjunction ("or") sets through certain complex mappings can result in a type error.'},{heading:"entitlement-mappings",content:"For example, given the following entitlement mapping:"},{heading:"entitlement-mappings",content:'Attempting to map `(A | D)` through `M` will fail, since `A` should map to `(B, C)` and `D` should map to `E`, but these two outputs cannot be combined into a disjunction ("or") set.'},{heading:"entitlement-mappings",content:"A good example of how entitlement mappings can be used is the [`Account` type]."},{heading:"the-identity-entitlement-mapping",content:"`Identity` is a special built-in entitlement mapping that maps every input to itself as the output. Any entitlement set passed through the `Identity` map will come out unchanged in the output."},{heading:"the-identity-entitlement-mapping",content:"For instance:"},{heading:"the-identity-entitlement-mapping",content:"One important point to note about the `Identity` mapping, however, is that its full output range is unknown and theoretically infinite. Because of that, accessing an `Identity`-mapped field or function with an owned value will yield an empty output set."},{heading:"the-identity-entitlement-mapping",content:"For example, calling `getChildResource()` on an owned `OuterResource` value will produce an unauthorized `&InnerResource` reference."},{heading:"mapping-composition",content:"Entitlement mappings can be composed. In the definition of an entitlement mapping, it is possible to include the definition of one or more other mappings, to copy over their mapping relations."},{heading:"mapping-composition",content:"An entitlement mapping is included into another entitlement mapping using the `include M` syntax, where `M` is the name of the entitlement mapping to be included."},{heading:"mapping-composition",content:"In general, an `include M` statement in the definition of an entitlement mapping `N` is equivalent to simply copy-pasting all the relations defined in `M` into `N`'s definition."},{heading:"mapping-composition",content:"Support for `include` is provided primarily to reduce code reuse and promote composition."},{heading:"mapping-composition",content:"For example:"},{heading:"mapping-composition",content:"The entitlement mapping `P` includes all of the relations defined in `M` and `N`, along with the additional relations defined in its own definition."},{heading:"mapping-composition",content:"It is also possible to include the `Identity` mapping. Any mapping `M` that includes the `Identity` mapping will map its input set to itself, along with any additional relations defined in the mapping or in other included mappings."},{heading:"mapping-composition",content:"For instance:"},{heading:"mapping-composition",content:"The mapping `M` maps the entitlement set `(X)` to `(X, Y)`, and `(Y)` to `(Y)`."},{heading:"mapping-composition",content:"Includes that produce a cyclical mapping are rejected by the type-checker."},{heading:"built-in-mutability-entitlements",content:"A prominent use case of entitlements is to control access to objects based on mutability."},{heading:"built-in-mutability-entitlements",content:"For example, in a composite, the author would want to control the access to certain fields to be read-only, and some fields to be mutable, and so on."},{heading:"built-in-mutability-entitlements",content:"In order to support this, the following built-in entitlements can be used:"},{heading:"built-in-mutability-entitlements",content:"`Insert`"},{heading:"built-in-mutability-entitlements",content:"`Remove`"},{heading:"built-in-mutability-entitlements",content:"`Mutate`"},{heading:"built-in-mutability-entitlements",content:"These are primarily used by the built-in [array] and [dictionary] functions, but are available to be used in access modifiers of any declaration."},{heading:"built-in-mutability-entitlements",content:"While Cadence does not support entitlement composition or inheritance, the `Mutate` entitlement is intended to be used as an equivalent form to the conjunction of the `(Insert, Remove)` entitlement set."}],headings:[{id:"the-access-keyword",content:"The `access` keyword"},{id:"types-of-access-control",content:"Types of access control"},{id:"entitlements",content:"Entitlements"},{id:"entitlement-mappings",content:"Entitlement mappings"},{id:"the-identity-entitlement-mapping",content:"The `Identity` entitlement mapping"},{id:"mapping-composition",content:"Mapping composition"},{id:"built-in-mutability-entitlements",content:"Built-in mutability entitlements"}]};const c=[{depth:2,url:"#the-access-keyword",title:e.jsxs(e.Fragment,{children:["The ",e.jsx("code",{children:"access"})," keyword"]})},{depth:2,url:"#types-of-access-control",title:e.jsx(e.Fragment,{children:"Types of access control"})},{depth:2,url:"#entitlements",title:e.jsx(e.Fragment,{children:"Entitlements"})},{depth:3,url:"#entitlement-mappings",title:e.jsx(e.Fragment,{children:"Entitlement mappings"})},{depth:3,url:"#the-identity-entitlement-mapping",title:e.jsxs(e.Fragment,{children:["The ",e.jsx("code",{children:"Identity"})," entitlement mapping"]})},{depth:3,url:"#mapping-composition",title:e.jsx(e.Fragment,{children:"Mapping composition"})},{depth:3,url:"#built-in-mutability-entitlements",title:e.jsx(e.Fragment,{children:"Built-in mutability entitlements"})}];function s(n){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Access control allows making certain parts of a program accessible/visible and making other parts inaccessible/invisible."}),`
`,e.jsx(i.p,{children:"In Cadence, access control is used in two ways:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Access control on objects in account storage, using ",e.jsx(i.a,{href:"./capabilities",children:"capability security"}),"."]}),`
`,e.jsx(i.p,{children:"A user is not able to access an object unless they own the object or have a reference to that object. This means that nothing is truly public by default."}),`
`,e.jsx(i.p,{children:"Other accounts cannot read or write the objects in an account unless the owner of the account has granted them access by providing references to the objects."}),`
`,e.jsxs(i.p,{children:["This kind of access control is covered in ",e.jsx(i.a,{href:"./capabilities",children:"capabilities"})," and ",e.jsx(i.a,{href:"./accounts/capabilities",children:"capability management"}),"."]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:["Access control within contracts and objects, using access modifiers (",e.jsx(i.code,{children:"access"})," keyword)."]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:"This page covers the second part of access control, using access modifiers."}),`
`,e.jsxs(i.p,{children:[`:::warning
Remember that in this case, `,e.jsx(i.code,{children:"private"})," refers to programmatic access to the data with a script or transaction.  It is ",e.jsx(i.strong,{children:"not safe"}),` to store secret or private information in a user's account.  The raw data is still public and could be decoded by reading the public blockchain data directly.
:::`]}),`
`,e.jsxs(i.h2,{id:"the-access-keyword",children:["The ",e.jsx(i.code,{children:"access"})," keyword"]}),`
`,e.jsxs(i.p,{children:["All declarations, such as ",e.jsx(i.a,{href:"./functions",children:"functions"}),", ",e.jsx(i.a,{href:"./types-and-type-system/composite-types",children:"composite types"}),", and fields, must be prefixed with an access modifier using the ",e.jsx(i.code,{children:"access"})," keyword."]}),`
`,e.jsx(i.p,{children:"The access modifier determines where the declaration is accessible/visible. Fields can only be assigned to and mutated from within the same or inner scope."}),`
`,e.jsxs(i.p,{children:["For example, to make a function publicly accessible (",e.jsx(i.code,{children:"access(all)"})," is explained below):"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"access(all)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"fun test() {}"})})]})})}),`
`,e.jsxs(i.p,{children:[`:::danger
If you prefix a function with `,e.jsx(i.code,{children:"access(all)"}),", you are likely granting complete and open access for ",e.jsx(i.strong,{children:"anyone using any account to call that function."})," It is critical that you properly use ",e.jsx(i.a,{href:"#entitlements",children:"entitlements"})," to restrict sensitive functions to the accounts that need access."]}),`
`,e.jsxs(i.p,{children:["For example, if you create a vault for your users and give the ",e.jsx(i.code,{children:"withdraw"})," function ",e.jsx(i.code,{children:"access(all)"}),`, anyone can drain that vault if they know where to find it.
:::`]}),`
`,e.jsx(i.h2,{id:"types-of-access-control",children:"Types of access control"}),`
`,e.jsx(i.p,{children:"There are five levels of access control:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Public access"})," — the declaration is accessible/visible in all scopes. This includes the current scope, inner scopes, and the outer scopes."]}),`
`,e.jsxs(i.p,{children:["A declaration is made publicly accessible using the ",e.jsx(i.code,{children:"access(all)"})," modifier."]}),`
`,e.jsx(i.p,{children:"For example, a public field in a type can be accessed on an instance of the type in an outer scope."}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Entitled access"})," — the declaration is only accessible/visible to the owner/holder of the object, or to ",e.jsx(i.a,{href:"./references",children:"references"})," that are authorized to the required ",e.jsx(i.a,{href:"#entitlements",children:"entitlements"}),"."]}),`
`,e.jsxs(i.p,{children:["A declaration is made accessible through entitlements by using the ",e.jsx(i.code,{children:"access(E)"})," syntax, where ",e.jsx(i.code,{children:"E"})," is a set of one or more entitlements, or a single ",e.jsx(i.a,{href:"#entitlement-mappings",children:"entitlement mapping"}),"."]}),`
`,e.jsxs(i.p,{children:["An entitled field acts like an ",e.jsx(i.code,{children:"access(all)"})," field ONLY if the caller actually holds the concrete resource object and not just a reference to it. In that case, an authorized reference is needed."]}),`
`,e.jsxs(i.p,{children:["A reference is considered authorized to an entitlement if that entitlement appears in the ",e.jsx(i.code,{children:"auth"})," portion of the reference type."]}),`
`,e.jsxs(i.p,{children:["For example, an ",e.jsx(i.code,{children:"access(E, F)"})," field on a resource ",e.jsx(i.code,{children:"R"})," can only be accessed by an owned (",e.jsx(i.code,{children:"@R"}),"-typed) value, or a reference to ",e.jsx(i.code,{children:"R"})," that is authorized to the ",e.jsx(i.code,{children:"E"})," and ",e.jsx(i.code,{children:"F"})," entitlements (",e.jsx(i.code,{children:"auth(E, F) &R"}),")."]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Account access"})," — the declaration is only accessible/visible in the scope of the entire account where it is defined. This means that other contracts in the account are able to access it."]}),`
`,e.jsxs(i.p,{children:["A declaration is made accessible by code in the same account, for example other contracts, by using the ",e.jsx(i.code,{children:"access(account)"})," keyword."]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Contract access"})," — the declaration is only accessible/visible in the scope of the contract that defined it. This means that other declarations that are defined in the same contract can access it, but not other contracts in the same account."]}),`
`,e.jsxs(i.p,{children:["A declaration is made accessible by code in the same contract by using the ",e.jsx(i.code,{children:"access(contract)"})," keyword."]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Private access"})," — the declaration is only accessible/visible in the current and inner scopes."]}),`
`,e.jsxs(i.p,{children:["A declaration is made accessible by code in the same containing type by using the ",e.jsx(i.code,{children:"access(self)"})," keyword."]}),`
`,e.jsxs(i.p,{children:["For example, an ",e.jsx(i.code,{children:"access(self)"})," field can only be accessed by functions of the type it is part of, not by code in an outer scope."]}),`
`]}),`
`]}),`
`,e.jsx(i.p,{children:"To summarize the behavior for variable declarations, constant declarations, and fields:"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{style:{textAlign:"left"},children:"Declaration kind"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Access modifier"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Accessible in"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Assignable in"}),e.jsx(i.th,{style:{textAlign:"left"},children:"Mutable in"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"let"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(self)"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.em,{children:"None"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"let"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(contract)"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current, inner, and containing contract"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.em,{children:"None"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"let"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(account)"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current, inner, and other contracts in same account"}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.em,{children:"None"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"let"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(all)"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.strong,{children:"All"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.em,{children:"None"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"let"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(E)"})}),e.jsxs(i.td,{style:{textAlign:"left"},children:[e.jsx(i.strong,{children:"All"})," with required entitlements"]}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.em,{children:"None"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"var"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(self)"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"var"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(contract)"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current, inner, and containing contract"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"var"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(account)"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current, inner, and other contracts in same account"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"var"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(all)"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.strong,{children:"All"})}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"var"})}),e.jsx(i.td,{style:{textAlign:"left"},children:e.jsx(i.code,{children:"access(E)"})}),e.jsxs(i.td,{style:{textAlign:"left"},children:[e.jsx(i.strong,{children:"All"})," with required entitlements"]}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"}),e.jsx(i.td,{style:{textAlign:"left"},children:"Current and inner"})]})]})]}),`
`,e.jsxs(i.p,{children:["Declarations of ",e.jsx(i.a,{href:"./types-and-type-system/composite-types",children:"composite types"})," must be public. However, even though the declarations/types are publicly visible, resources can only be created, and events can only be emitted from inside the contract they are declared in:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a private constant, inaccessible/invisible in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a public constant, accessible/visible in all scopes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Declare a public struct, accessible/visible in all scopes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SomeStruct"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Declare a private constant field, which is only readable"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // in the current and inner scopes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Declare a public constant field, which is readable in all scopes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Declare a private variable field, which is only readable"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // and writable in the current and inner scopes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" c: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Declare a public variable field, which is not settable,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // so it is only writable in the current and inner scopes,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // and readable in all scopes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" d: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Arrays and dictionaries declared without (set) cannot be"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // mutated in external scopes"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" arr: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // The initializer is omitted for brevity."})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Declare a private function, which is only callable"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // in the current and inner scopes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" privateTest"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Declare a public function, which is callable in all scopes."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" publicTest"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // The initializer is omitted for brevity."})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" some = "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SomeStruct"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: cannot read private constant field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.a"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: cannot set private constant field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.a = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Valid: can read public constant field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.b"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: cannot set public constant field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.b = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: cannot read private variable field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.c"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: cannot set private variable field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.c = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Valid: can read public variable field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.d"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: cannot set public variable field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.d = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"4"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: cannot mutate a public field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.f."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"append"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid: cannot mutate a public field in outer scope."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.f["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] = "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Valid: can call non-mutating methods on a public field in outer scope"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"some.f."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"contains"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsx(i.h2,{id:"entitlements",children:"Entitlements"}),`
`,e.jsxs(i.p,{children:["Entitlements provide granular access control to each member of a composite. Entitlements are declared using the syntax ",e.jsx(i.code,{children:"entitlement E"}),", where ",e.jsx(i.code,{children:"E"})," is the name of the entitlement."]}),`
`,e.jsxs(i.p,{children:["For example, the following code declares two entitlements called ",e.jsx(i.code,{children:"E"})," and ",e.jsx(i.code,{children:"F"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" E"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" F"})]})]})})}),`
`,e.jsx(i.p,{children:"Entitlements can be imported from other contracts and used the same way as other types. When using entitlements defined in another contract, the same qualified name syntax is used as for other types:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" C"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" E"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["Outside of ",e.jsx(i.code,{children:"C"}),", ",e.jsx(i.code,{children:"E"})," is used with ",e.jsx(i.code,{children:"C.E"})," syntax."]}),`
`,e.jsxs(i.p,{children:["Entitlements exist in the same namespace as types, so if a contract declares a resource called ",e.jsx(i.code,{children:"R"}),", it is impossible to declare an entitlement that is also called ",e.jsx(i.code,{children:"R"}),"."]}),`
`,e.jsx(i.p,{children:"Entitlements can be used in access modifiers of composite members (fields and functions) to specify which references to those composites are allowed to access those members."}),`
`,e.jsxs(i.p,{children:["An access modifier can include more than one entitlement, joined with either an ",e.jsx(i.code,{children:"|"}),', to indicate disjunction ("or"), or a ',e.jsx(i.code,{children:","}),', to indicate conjunction ("and"). The two kinds of separators cannot be combined in the same set.']}),`
`,e.jsx(i.p,{children:"For example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SomeResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // requires a reference to have an `E` entitlement to read this field"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // requires a reference to have either an `E` OR an `F` entitlement "})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // to read this field."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" | "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"F"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // requires a reference to have both an `E` AND an `F` entitlement "})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // to read this field."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"F"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" c: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // intializers omitted for brevity"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["Assuming the following constants exist, which have owned or ",e.jsx(i.a,{href:"./references",children:"reference"})," types:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SomeResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refE: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SomeResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refF: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"F"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SomeResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refEF: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"F"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SomeResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refEOrF: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"E"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" | "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"F"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SomeResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ..."})]})]})})}),`
`,e.jsx(i.p,{children:"The references can be used as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// valid, because `r` is owned and thus is "fully entitled"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r.a"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// valid, because `r` is owned and thus is "fully entitled"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r.b"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// valid, because `r` is owned and thus is "fully entitled"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r.c"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// valid, because `refE` has an `E` entitlement as required"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refE.a"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// valid, because `refE` has one of the two required entitlements"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refE.b"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// invalid, because `refE` only has one of the two required entitlements"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refE.c"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// invalid, because `refF` has an `E` entitlement, not an `F`"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refF.a"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// valid, because `refF` has one of the two required entitlements"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refF.b"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// invalid, because `refF` only has one of the two required entitlements"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refF.c"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// valid, because `refEF` has an `E` entitlement"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refEF.a"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// valid, because `refEF` has both of the two required entitlements"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refEF.b"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// valid, because `refEF` has both of the two required entitlements"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refEF.c"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// invalid, because `refEOrF` might not have an `E` entitlement "})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// (it may have `F` instead)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refEOrF.a"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// valid, because `refEOrF` has one of the two entitlements necessary"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refEOrF.b"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// invalid, because `refEOrF` is only known to have one of the two "})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// required entitlements"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"refEOrF.c"})})]})})}),`
`,e.jsxs(i.p,{children:["Note that, particularly in this example, how the owned value ",e.jsx(i.code,{children:"r"})," can access all entitled members on ",e.jsx(i.code,{children:"SomeResource"}),". Owned values are not affected by entitled declarations."]}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"./references#authorized-references",children:"Authorized References"})," for more information."]}),`
`,e.jsx(i.h3,{id:"entitlement-mappings",children:"Entitlement mappings"}),`
`,e.jsx(i.p,{children:"Entitlement mappings are a way to statically declare how entitlements are propagated from parents to child objects in a nesting hierarchy."}),`
`,e.jsx(i.p,{children:"When objects have fields that are child objects, entitlement mappings can be used to grant access to the inner object based on the entitlements of the reference to the parent object."}),`
`,e.jsx(i.p,{children:"Consider the following example, which uses entitlements to control access to an inner resource:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OuterEntitlement"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InnerEntitlement"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() { ... }"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerEntitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() { ... }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OuterResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" childResource: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(childResource: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".childResource "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" childResource"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // The parent resource has to provide two accessor functions"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // which return a reference to the inner resource."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // If the reference to the outer resource is unauthorized"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // and does not have the OuterEntitlement entitlement,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // the outer resource allows getting an unauthorized reference"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // to the inner resource."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // If the reference to the outer resource is authorized"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // and it has the OuterEntitlement entitlement,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // the outer resource allows getting an authorized reference"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // to the inner resource."})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getPubRef"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".childResource "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"OuterEntitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getEntitledRef"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerEntitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".childResource "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerEntitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["With this pattern, it is possible to store a ",e.jsx(i.code,{children:"InnerResource"})," in an ",e.jsx(i.code,{children:"OuterResource"}),", and create different ways to access that nested resource depending on the entitlement one possesses."]}),`
`,e.jsxs(i.p,{children:["An unauthorized reference to ",e.jsx(i.code,{children:"OuterResource"})," can only be used to call the ",e.jsx(i.code,{children:"getPubRef"})," function, and thus can only obtain an unauthorized reference to ",e.jsx(i.code,{children:"InnerResource"}),". That reference to the ",e.jsx(i.code,{children:"InnerResource"})," then only allows calling the function ",e.jsx(i.code,{children:"foo"}),", which is publicly accessible, but not function ",e.jsx(i.code,{children:"bar"}),", as it needs the ",e.jsx(i.code,{children:"InnerEntitlement"})," entitlement, which is not granted."]}),`
`,e.jsxs(i.p,{children:["However an ",e.jsx(i.code,{children:"OuterEntitlement"}),"-authorized reference to the ",e.jsx(i.code,{children:"OuterResource"})," can be used to call the ",e.jsx(i.code,{children:"getEntitledRef"})," function, which returns a ",e.jsx(i.code,{children:"InnerEntitlement"}),"-authorized reference to ",e.jsx(i.code,{children:"InnerResource"}),", which in turn can be used to call function ",e.jsx(i.code,{children:"bar"}),"."]}),`
`,e.jsxs(i.p,{children:["This pattern is functional, but it is unfortunate that the accessor functions to ",e.jsx(i.code,{children:"InnerResource"}),' have to be "duplicated".']}),`
`,e.jsx(i.p,{children:"Entitlement mappings should be used to avoid this duplication."}),`
`,e.jsx(i.p,{children:"Entitlement mappings are declared by using the syntax:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" M"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["Where ",e.jsx(i.code,{children:"M"})," is the name of the mapping."]}),`
`,e.jsxs(i.p,{children:["The body of the mapping contains zero or more rules of the form ",e.jsx(i.code,{children:"A -> B"}),", where ",e.jsx(i.code,{children:"A"})," and ",e.jsx(i.code,{children:"B"})," are entitlements. Each rule declares that, given a reference with the entitlement on the left, a reference with the entitlement on the right is produced."]}),`
`,e.jsxs(i.p,{children:["An entitlement mapping thus defines a function from an input set of entitlements (called the ",e.jsx(i.em,{children:"domain"}),") to an output set (called the ",e.jsx(i.em,{children:"range"})," or the ",e.jsx(i.em,{children:"image"}),")."]}),`
`,e.jsx(i.p,{children:"Using entitlement mappings, the above example could be more concisely written as:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OuterEntitlement"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InnerEntitlement"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Specify a mapping for entitlements called `OuterToInnerMap`,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// which maps the entitlement `OuterEntitlement` to the entitlement `InnerEntitlement`."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OuterToInnerMap"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    OuterEntitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InnerEntitlement"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" foo"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() { ... }"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerEntitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" bar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() { ... }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OuterResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Use the entitlement mapping `OuterToInnerMap`."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // This declares that when the field `childResource` is accessed"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // using a reference authorized with the entitlement `OuterEntitlement`,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // then a reference with the entitlement `InnerEntitlement` is returned."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // This is equivalent to the two accessor functions"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // that were necessary in the previous example."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OuterToInnerMap"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" childResource: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(childResource: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".childResource "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" childResource"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // No accessor functions are needed."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// given some value `r` of type `@OuterResource`"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pubRef = &r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"OuterResource"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pubInnerRef = pubRef.childResource "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// has type `&InnerResource`"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" entitledRef = &r "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"OuterEntitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"OuterResource"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" entitledInnerRef = entitledRef.childResource  "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// has type "})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // `auth(InnerEntitlement) &InnerResource`,as `OuterEntitlement` "})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // is defined to map to `InnerEntitlement`."})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// `r` is an owned value, and is thus considered "fully-entitled" '})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// to `OuterResource`, so this access yields a value authorized to the "})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// entire  image of `OuterToInnerMap`, in this case `InnerEntitlement`, "})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// and thus can call `bar`"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r.childResource."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]})]})})}),`
`,e.jsx(i.p,{children:"Entitlement mappings can be used either in accessor functions (as in the example above), in fields whose types are either references, or containers (composite types, dictionaries, and arrays)."}),`
`,e.jsx(i.p,{children:"Entitlement mappings need not be 1:1. It is valid to define a mapping where many inputs map to the same output, or where one input maps to many outputs."}),`
`,e.jsx(i.p,{children:'Entitlement mappings preserve the "kind" of the set they are mapping. That is, mapping a conjunction ("and") set produces a conjunction set, and mapping a disjunction ("or") set produces a disjunction set.'}),`
`,e.jsx(i.p,{children:'Because entitlement separators cannot be combined in the same set, attempting to map disjunction ("or") sets through certain complex mappings can result in a type error.'}),`
`,e.jsx(i.p,{children:"For example, given the following entitlement mapping:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" M"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  A"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" B"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  A"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" C"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  D"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" E"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["Attempting to map ",e.jsx(i.code,{children:"(A | D)"})," through ",e.jsx(i.code,{children:"M"})," will fail, since ",e.jsx(i.code,{children:"A"})," should map to ",e.jsx(i.code,{children:"(B, C)"})," and ",e.jsx(i.code,{children:"D"})," should map to ",e.jsx(i.code,{children:"E"}),', but these two outputs cannot be combined into a disjunction ("or") set.']}),`
`,e.jsxs(i.p,{children:["A good example of how entitlement mappings can be used is the ",e.jsxs(i.a,{href:"./accounts/index",children:[e.jsx(i.code,{children:"Account"})," type"]}),"."]}),`
`,e.jsxs(i.h3,{id:"the-identity-entitlement-mapping",children:["The ",e.jsx(i.code,{children:"Identity"})," entitlement mapping"]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"Identity"})," is a special built-in entitlement mapping that maps every input to itself as the output. Any entitlement set passed through the ",e.jsx(i.code,{children:"Identity"})," map will come out unchanged in the output."]}),`
`,e.jsx(i.p,{children:"For instance:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" X"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // ..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OuterResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Identity"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" childResource: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Identity"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    getChildResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Identity"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        return"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" &"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".childResource"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(childResource: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"InnerResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".childResource "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" childResource"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" example"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(outerRef: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"X"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"OuterResource"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" innerRef = outerRef.childResource "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// `innerRef` has type `auth(X) &InnerResource`,"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // as `outerRef` was authorized with entitlement `X`"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["One important point to note about the ",e.jsx(i.code,{children:"Identity"})," mapping, however, is that its full output range is unknown and theoretically infinite. Because of that, accessing an ",e.jsx(i.code,{children:"Identity"}),"-mapped field or function with an owned value will yield an empty output set."]}),`
`,e.jsxs(i.p,{children:["For example, calling ",e.jsx(i.code,{children:"getChildResource()"})," on an owned ",e.jsx(i.code,{children:"OuterResource"})," value will produce an unauthorized ",e.jsx(i.code,{children:"&InnerResource"})," reference."]}),`
`,e.jsx(i.h3,{id:"mapping-composition",children:"Mapping composition"}),`
`,e.jsx(i.p,{children:"Entitlement mappings can be composed. In the definition of an entitlement mapping, it is possible to include the definition of one or more other mappings, to copy over their mapping relations."}),`
`,e.jsxs(i.p,{children:["An entitlement mapping is included into another entitlement mapping using the ",e.jsx(i.code,{children:"include M"})," syntax, where ",e.jsx(i.code,{children:"M"})," is the name of the entitlement mapping to be included."]}),`
`,e.jsxs(i.p,{children:["In general, an ",e.jsx(i.code,{children:"include M"})," statement in the definition of an entitlement mapping ",e.jsx(i.code,{children:"N"})," is equivalent to simply copy-pasting all the relations defined in ",e.jsx(i.code,{children:"M"})," into ",e.jsx(i.code,{children:"N"}),"'s definition."]}),`
`,e.jsxs(i.p,{children:["Support for ",e.jsx(i.code,{children:"include"})," is provided primarily to reduce code reuse and promote composition."]}),`
`,e.jsx(i.p,{children:"For example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" M"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  X"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Y"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  Y"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Z"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" N"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  E"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" F"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" P"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  include "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"M"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  include "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"N"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  F"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" G"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["The entitlement mapping ",e.jsx(i.code,{children:"P"})," includes all of the relations defined in ",e.jsx(i.code,{children:"M"})," and ",e.jsx(i.code,{children:"N"}),", along with the additional relations defined in its own definition."]}),`
`,e.jsxs(i.p,{children:["It is also possible to include the ",e.jsx(i.code,{children:"Identity"})," mapping. Any mapping ",e.jsx(i.code,{children:"M"})," that includes the ",e.jsx(i.code,{children:"Identity"})," mapping will map its input set to itself, along with any additional relations defined in the mapping or in other included mappings."]}),`
`,e.jsx(i.p,{children:"For instance:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" mapping"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" M"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    include "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Identity"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    X"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Y"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["The mapping ",e.jsx(i.code,{children:"M"})," maps the entitlement set ",e.jsx(i.code,{children:"(X)"})," to ",e.jsx(i.code,{children:"(X, Y)"}),", and ",e.jsx(i.code,{children:"(Y)"})," to ",e.jsx(i.code,{children:"(Y)"}),"."]}),`
`,e.jsx(i.p,{children:"Includes that produce a cyclical mapping are rejected by the type-checker."}),`
`,e.jsx(i.h3,{id:"built-in-mutability-entitlements",children:"Built-in mutability entitlements"}),`
`,e.jsx(i.p,{children:"A prominent use case of entitlements is to control access to objects based on mutability."}),`
`,e.jsx(i.p,{children:"For example, in a composite, the author would want to control the access to certain fields to be read-only, and some fields to be mutable, and so on."}),`
`,e.jsx(i.p,{children:"In order to support this, the following built-in entitlements can be used:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"Insert"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"Remove"})}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:"Mutate"})}),`
`]}),`
`,e.jsxs(i.p,{children:["These are primarily used by the built-in ",e.jsx(i.a,{href:"./values-and-types/arrays",children:"array"})," and ",e.jsx(i.a,{href:"./values-and-types/dictionaries",children:"dictionary"})," functions, but are available to be used in access modifiers of any declaration."]}),`
`,e.jsxs(i.p,{children:["While Cadence does not support entitlement composition or inheritance, the ",e.jsx(i.code,{children:"Mutate"})," entitlement is intended to be used as an equivalent form to the conjunction of the ",e.jsx(i.code,{children:"(Insert, Remove)"})," entitlement set."]}),`
`]})}function r(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(s,{...n})}):s(n)}export{a as _markdown,r as default,l as frontmatter,h as structuredData,c as toc};
