import{j as s}from"./main-BXy83AsK.js";let t=`

A [contract] is a collection of data (its state) and code (its functions) that lives in the contract storage area of an account. When a contract is *updated*, it is important to make sure that the changes introduced do not lead to runtime inconsistencies for already stored data.

Cadence maintains this state consistency by validating the contracts and all their components before an update.

Validation goals [#validation-goals]

The contract update validation ensures that:

* Stored data doesn't change its meaning when a contract is updated.
* Decoding and using stored data does not lead to runtime crashes.
  * For example, it is invalid to add a field because the existing stored data won't have the new field.
  * Loading the existing data will result in garbage/missing values for such fields.
  * A static check of the access of the field would be valid, but the interpreter would crash when accessing the field because the field has a missing/garbage value.

However, it does **not** ensure any program that imports the updated contract stays valid. For example, an updated contract may remove an existing field or may change a function signature. In this case, any program that uses that field/function will get semantic errors.

Updating a contract [#updating-a-contract]

Changes to contracts can be introduced by adding new contracts, removing existing contracts, or updating existing contracts. However, some of these changes may lead to data inconsistencies as stated above.

**Valid changes**

* Adding a new contract is valid.
* Removing a contract/contract-interface that doesn't have enum declarations is valid.
* Updating a contract is valid under the restrictions described in the following sections.

**Invalid changes**

* Removing a contract/contract-interface that contains enum declarations is not valid.
  * Removing a contract allows adding a new contract with the same name.
  * The new contract could potentially have enum declarations with the same names as in the old contract, but with different structures.
  * This could change the meaning of the already stored values of those enum types.

A contract may consist of fields and other declarations such as composite types, functions, constructors, and so on. When an existing contract is updated, all of its inner declarations are also validated.

Contract fields [#contract-fields]

When a contract is deployed, the fields of the contract are stored in an account's contract storage. Changing the fields of a contract only changes the way the program treats the data, but does not change the already-stored data itself, which could potentially result in runtime inconsistencies as mentioned in the previous section.

See [Fields] for any possible updates that can be made to the fields, and the restrictions imposed on changing the fields of a contract.

Nested declarations [#nested-declarations]

Contracts can have nested composite type declarations such as structs, resources, interfaces, and enums. When a contract is updated, its nested declarations are checked because:

* They can be used as type annotations for the fields of the same contract, directly or indirectly.
* Any third-party contract can import the types defined in this contract and use them as type annotations.
* Hence, changing the type definition is the same as changing the type annotation of such a field (which is also invalid, as described in the [Fields] section below).

Changes that can be performed on the nested declarations and the update restrictions are described in the following sections:

* [Structs, resources, and interfaces]
* [Enums]
* [Functions]
* [Events]
* [Constructors]

Fields [#fields]

A field may belong to a contract, struct, resource, or interface:

**Valid changes**

* Removing a field is valid
  \`\`\`cadence
  // Existing contract

  access(all)
  contract Foo {
    
      access(all)
      var a: String

      access(all)
      var b: Int
  }

  // Updated contract

  access(all)
  contract Foo {
      access(all)
      var a: String
  }
  \`\`\`
  * It leaves data for the removed field unused at the storage, as it is no longer accessible.
  * However, it does not cause any runtime crashes.

* Changing the order of fields is valid.
  \`\`\`cadence
  // Existing contract

  access(all)
  contract Foo {

      access(all)
      var a: String

      access(all)
      var b: Int
  }

  // Updated contract

  access(all)
  contract Foo {

      access(all)
      var b: Int

      access(all)
      var a: String
  }
  \`\`\`

* Changing the access modifier of a field is valid.
  \`\`\`cadence
  // Existing contract

  access(all)
  contract Foo {
      access(all)
      var a: String
  }

  // Updated contract

  access(all)
  contract Foo {
      access(self)
      var a: String   // access modifier changed to 'access(self)'
  }
  \`\`\`

**Invalid changes**

* Adding a new field is not valid:
  \`\`\`cadence
  // Existing contract

  access(all)
  contract Foo {
      access(all)
      var a: String
  }

  // Updated contract

  access(all)
  contract Foo {
    
      access(all)
      var a: String

      access(all)
      var b: Int      // Invalid new field
  }
  \`\`\`
  * The initializer of a contract only runs once, when the contract is deployed for the first time. It does not rerun when the contract is updated. However, it is still required to be present in the updated contract to satisfy type checks.
  * Thus, the stored data won't have the new field, as the initializations for the newly added fields do not get executed.
  * Decoding stored data will result in garbage or missing values for such fields.

* Changing the type of an existing field is not valid.
  \`\`\`cadence
  // Existing contract

  access(all)
  contract Foo {

      access(all)
      var a: String
  }

  // Updated contract

  access(all)
  contract Foo {

      access(all)
      var a: Int      // Invalid type change
  }
  \`\`\`
  * In an already stored contract, the field \`a\` would have a value of type \`String\`.
  * Changing the type of the field \`a\` to \`Int\`  would make the runtime read the already stored \`String\` value as an \`Int\`, which will result in deserialization errors.
  * Changing the field type to a subtype/supertype of the existing type is also not valid, as it would also potentially cause issues while decoding/encoding.
    * For example: changing an \`Int64\` field to \`Int8\` — Stored field could have a numeric value\`624\`, which exceeds the value space for \`Int8\`.
    * However, this is a limitation in the current implementation; future versions of Cadence may support changing the type of field to a subtype by providing means to migrate existing fields.

Structs, resources, and interfaces [#structs-resources-and-interfaces]

**Valid changes**

* Adding a new struct, resource, or interface is valid.
* Adding an interface conformance to a struct/resource is valid, since the stored data only stores concrete type/value, but doesn't store the conformance info:
  \`\`\`cadence
  // Existing struct

  access(all)
  struct Foo {
  }

  // Updated struct

  access(all)
  struct Foo: T {
  }
  \`\`\`
  * However, if adding a conformance also requires changing the existing structure (e.g., adding a new field that is enforced by the new conformance), then the other restriction(such as [restrictions on fields]) may prevent performing such an update.

**Invalid changes**

* Removing an existing declaration is not valid.
  * Removing a declaration allows adding a new declaration with the same name, but with a different structure.
  * Any program that uses stored data belonging to that type would face inconsistencies.
* Renaming a declaration is not valid. It can have the same effect as removing an existing declaration and adding a new one.
* Changing the type of declaration is not valid (i.e., changing from a struct to an interface, and vise versa).
  \`\`\`cadence
  // Existing struct

  access(all)
  struct Foo {
  }

  // Changed to a struct interface

  access(all)
  struct interface Foo {    // Invalid type declaration change
  }
  \`\`\`
* Removing an interface conformance of a struct/resource is not valid.
  \`\`\`cadence
  // Existing struct

  access(all)
  struct Foo: T {
  }

  // Updated struct

  access(all)
  struct Foo {
  }
  \`\`\`
  * Otherwise, types that used to conform to an interface would no longer conform to that interface, which would lead to [type safety] issues at runtime.

Updating members [#updating-members]

Similar to contracts, the composite declarations structs, resources, and interfaces can also have fields and other nested declarations as its member. Updating such a composite declaration would also include updating all of its members.

The following sections describe the restrictions imposed on updating the members of a struct, resource, or interface:

* [Fields]
* [Enums]
* [Functions]
* [Constructors]

Enums [#enums]

**Valid changes**

* Adding a new enum declaration is valid.

**Invalid changes**

* Removing an existing enum declaration is invalid.
  * Otherwise, it is possible to remove an existing enum and add a new enum declaration with the same name, but with a different structure.
  * The new structure could potentially have incompatible changes (such as changed types, changed enum-cases, and so on).
* Changing the name is invalid, as it is equivalent to removing an existing enum and adding a new one.
* Changing the raw type is invalid:
  \`\`\`cadence
  // Existing enum with \`Int\` raw type

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case BLUE
  }

  // Updated enum with \`UInt8\` raw type

  access(all)
  enum Color: UInt8 {    // Invalid change of raw type

    access(all)
    case RED

    access(all)
    case BLUE
  }
  \`\`\`
  * When the enum value is stored, the raw value associated with the enum case gets stored.
  * If the type is changed, then deserializing could fail if the already stored values are not in the same value space as the updated type.

Updating enum cases [#updating-enum-cases]

Enums consist of enum-case declarations, and updating an enum may also include changing the enum's cases as well. Enum cases are represented using their raw value at the Cadence interpreter and runtime. Hence, any change that causes an enum case to change its raw value is not permitted. Otherwise, a changed raw value could cause an already stored enum  value to have a different meaning than what it originally was (type confusion).

**Valid changes**

* Adding an enum case at the end of the existing enum cases is valid:
  \`\`\`cadence
  // Existing enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case BLUE
  }

  // Updated enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case BLUE

    access(all)
    case GREEN    // valid new enum-case at the bottom
  }
  \`\`\`

**Invalid changes**

* Adding an enum-case at the top or in the middle of the existing enum cases is invalid:
  \`\`\`cadence
  // Existing enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case BLUE
  }

  // Updated enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case GREEN    // invalid new enum-case in the middle

    access(all)
    case BLUE
  }
  \`\`\`

* Changing the name of an enum case is invalid.
  \`\`\`cadence
  // Existing enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case BLUE
  }

  // Updated enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case GREEN    // invalid change of names
  }
  \`\`\`
  * Previously stored raw values for \`Color.BLUE\` now represents \`Color.GREEN\` (i.e., the stored values have changed their meaning, and hence not a valid change).
  * Similarly, it is possible to add a new enum with the old name \`BLUE\`, which gets a new raw value. Then, the same enum case \`Color.BLUE\` may have used two raw values at runtime, before and after the change, which is also invalid.

* Removing the enum case is invalid. Removing allows one to add and remove an enum case, which has the same effect as renaming:
  \`\`\`cadence
  // Existing enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case BLUE
  }

  // Updated enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    // invalid removal of \`case BLUE\`
  }
  \`\`\`

* Changing the order of enum cases is not permitted.
  \`\`\`cadence
  // Existing enum

  access(all)
  enum Color: Int {

    access(all)
    case RED

    access(all)
    case BLUE
  }

  // Updated enum

  access(all)
  enum Color: UInt8 {

    access(all)
    case BLUE   // invalid change of order
    
    access(all)
    case RED
  }
  \`\`\`
  * The raw value of an enum is implicit and corresponds to the defined order.
  * Changing the order of enum-cases has the same effect as changing the raw value, which could cause storage inconsistencies and type-confusions as described earlier.

Functions [#functions]

Adding, changing, and deleting a function definition is always valid, as function definitions are never stored as data (function definitions are part of the code, but not data).

* Adding a function is valid.
* Deleting a function is valid.
* Changing a function signature (parameters, return types) is valid.
* Changing a function body is valid.
* Changing the access modifiers is valid.

However, changing a *function type* may or may not be valid, depending on where it is used: if a function type is used in the type annotation of a composite type field (direct or indirect), then changing the function type signature is the same as changing the type annotation of that field (which is invalid).

Events [#events]

Events are not stored onchain. Any changes made to events have no impact on the stored data. Hence, adding, removing, and modifying events in a contract is valid.

Constructors [#constructors]

Similar to functions, constructors are also not stored. Hence, any changes to constructors are valid.

Imports [#imports]

A contract may import declarations (types, functions, variables, and so on) from other programs. These imported programs are already validated at the time of their deployment. Hence, there is no need to validate any declaration every time they are imported.

The #removedType pragma [#the-removedtype-pragma]

Under normal circumstances, it is not valid to remove a type declaration, whether a composite or an interface. However, a special pragma can be used when this is necessary to enable composite declarations to be *tombstoned*, removing them from a contract and preventing any declarations from being re-added with the same name. This pragma cannot be used with interfaces.

To use this pragma, simply add a \`#removedType(T)\` line to the contract containing the type \`T\` you want to remove, at the same scope as the declaration of \`T\`.

For example, to remove a resource definition \`R\` defined like so:

\`\`\`cadence
access(all) contract Foo {

  access(all) resource R {
     // definition of R ...
  }

  // other stuff ... 
}
\`\`\`

change the contract to:

\`\`\`cadence
access(all) contract Foo {

  #removedType(R)

  // other stuff ... 
}
\`\`\`

This prevents any type named \`R\` from ever being declared again as a nested declaration in \`Foo\`, preventing the security issues normally posed by removing a type.  Specifically, when a \`#removedType(T)\` pragma is present at a certain scope level in a contract, no new type named \`T\` can be added at that scope. Additionally, once added, a \`#removedType\` pragma can never be removed, as this would allow circumventing the above restriction.

Please note that this pragma's behavior is not necessarily final and is subject to change.

{/* Relative links. Will not render on the page */}

[contract]: ./contracts

[Fields]: #fields

[restrictions on fields]: #fields

[Structs, resources, and interfaces]: #structs-resources-and-interfaces

[Enums]: #enums

[Functions]: #functions

[Events]: #events

[Constructors]: #constructors

[type safety]: ./types-and-type-system/type-safety
`,l={title:"Contract Updatability"},h={contents:[{heading:void 0,content:"A [contract] is a collection of data (its state) and code (its functions) that lives in the contract storage area of an account. When a contract is *updated*, it is important to make sure that the changes introduced do not lead to runtime inconsistencies for already stored data."},{heading:void 0,content:"Cadence maintains this state consistency by validating the contracts and all their components before an update."},{heading:"validation-goals",content:"The contract update validation ensures that:"},{heading:"validation-goals",content:"Stored data doesn't change its meaning when a contract is updated."},{heading:"validation-goals",content:"Decoding and using stored data does not lead to runtime crashes."},{heading:"validation-goals",content:"For example, it is invalid to add a field because the existing stored data won't have the new field."},{heading:"validation-goals",content:"Loading the existing data will result in garbage/missing values for such fields."},{heading:"validation-goals",content:"A static check of the access of the field would be valid, but the interpreter would crash when accessing the field because the field has a missing/garbage value."},{heading:"validation-goals",content:"However, it does **not** ensure any program that imports the updated contract stays valid. For example, an updated contract may remove an existing field or may change a function signature. In this case, any program that uses that field/function will get semantic errors."},{heading:"updating-a-contract",content:"Changes to contracts can be introduced by adding new contracts, removing existing contracts, or updating existing contracts. However, some of these changes may lead to data inconsistencies as stated above."},{heading:"updating-a-contract",content:"**Valid changes**"},{heading:"updating-a-contract",content:"Adding a new contract is valid."},{heading:"updating-a-contract",content:"Removing a contract/contract-interface that doesn't have enum declarations is valid."},{heading:"updating-a-contract",content:"Updating a contract is valid under the restrictions described in the following sections."},{heading:"updating-a-contract",content:"**Invalid changes**"},{heading:"updating-a-contract",content:"Removing a contract/contract-interface that contains enum declarations is not valid."},{heading:"updating-a-contract",content:"Removing a contract allows adding a new contract with the same name."},{heading:"updating-a-contract",content:"The new contract could potentially have enum declarations with the same names as in the old contract, but with different structures."},{heading:"updating-a-contract",content:"This could change the meaning of the already stored values of those enum types."},{heading:"updating-a-contract",content:"A contract may consist of fields and other declarations such as composite types, functions, constructors, and so on. When an existing contract is updated, all of its inner declarations are also validated."},{heading:"contract-fields",content:"When a contract is deployed, the fields of the contract are stored in an account's contract storage. Changing the fields of a contract only changes the way the program treats the data, but does not change the already-stored data itself, which could potentially result in runtime inconsistencies as mentioned in the previous section."},{heading:"contract-fields",content:"See [Fields] for any possible updates that can be made to the fields, and the restrictions imposed on changing the fields of a contract."},{heading:"nested-declarations",content:"Contracts can have nested composite type declarations such as structs, resources, interfaces, and enums. When a contract is updated, its nested declarations are checked because:"},{heading:"nested-declarations",content:"They can be used as type annotations for the fields of the same contract, directly or indirectly."},{heading:"nested-declarations",content:"Any third-party contract can import the types defined in this contract and use them as type annotations."},{heading:"nested-declarations",content:"Hence, changing the type definition is the same as changing the type annotation of such a field (which is also invalid, as described in the [Fields] section below)."},{heading:"nested-declarations",content:"Changes that can be performed on the nested declarations and the update restrictions are described in the following sections:"},{heading:"nested-declarations",content:"[Structs, resources, and interfaces]"},{heading:"nested-declarations",content:"[Enums]"},{heading:"nested-declarations",content:"[Functions]"},{heading:"nested-declarations",content:"[Events]"},{heading:"nested-declarations",content:"[Constructors]"},{heading:"fields",content:"A field may belong to a contract, struct, resource, or interface:"},{heading:"fields",content:"**Valid changes**"},{heading:"fields",content:"Removing a field is valid"},{heading:"fields",content:"It leaves data for the removed field unused at the storage, as it is no longer accessible."},{heading:"fields",content:"However, it does not cause any runtime crashes."},{heading:"fields",content:"Changing the order of fields is valid."},{heading:"fields",content:"Changing the access modifier of a field is valid."},{heading:"fields",content:"**Invalid changes**"},{heading:"fields",content:"Adding a new field is not valid:"},{heading:"fields",content:"The initializer of a contract only runs once, when the contract is deployed for the first time. It does not rerun when the contract is updated. However, it is still required to be present in the updated contract to satisfy type checks."},{heading:"fields",content:"Thus, the stored data won't have the new field, as the initializations for the newly added fields do not get executed."},{heading:"fields",content:"Decoding stored data will result in garbage or missing values for such fields."},{heading:"fields",content:"Changing the type of an existing field is not valid."},{heading:"fields",content:"In an already stored contract, the field `a` would have a value of type `String`."},{heading:"fields",content:"Changing the type of the field `a` to `Int`  would make the runtime read the already stored `String` value as an `Int`, which will result in deserialization errors."},{heading:"fields",content:"Changing the field type to a subtype/supertype of the existing type is also not valid, as it would also potentially cause issues while decoding/encoding."},{heading:"fields",content:"For example: changing an `Int64` field to `Int8` — Stored field could have a numeric value`624`, which exceeds the value space for `Int8`."},{heading:"fields",content:"However, this is a limitation in the current implementation; future versions of Cadence may support changing the type of field to a subtype by providing means to migrate existing fields."},{heading:"structs-resources-and-interfaces",content:"**Valid changes**"},{heading:"structs-resources-and-interfaces",content:"Adding a new struct, resource, or interface is valid."},{heading:"structs-resources-and-interfaces",content:"Adding an interface conformance to a struct/resource is valid, since the stored data only stores concrete type/value, but doesn't store the conformance info:"},{heading:"structs-resources-and-interfaces",content:"However, if adding a conformance also requires changing the existing structure (e.g., adding a new field that is enforced by the new conformance), then the other restriction(such as [restrictions on fields]) may prevent performing such an update."},{heading:"structs-resources-and-interfaces",content:"**Invalid changes**"},{heading:"structs-resources-and-interfaces",content:"Removing an existing declaration is not valid."},{heading:"structs-resources-and-interfaces",content:"Removing a declaration allows adding a new declaration with the same name, but with a different structure."},{heading:"structs-resources-and-interfaces",content:"Any program that uses stored data belonging to that type would face inconsistencies."},{heading:"structs-resources-and-interfaces",content:"Renaming a declaration is not valid. It can have the same effect as removing an existing declaration and adding a new one."},{heading:"structs-resources-and-interfaces",content:"Changing the type of declaration is not valid (i.e., changing from a struct to an interface, and vise versa)."},{heading:"structs-resources-and-interfaces",content:"Removing an interface conformance of a struct/resource is not valid."},{heading:"structs-resources-and-interfaces",content:"Otherwise, types that used to conform to an interface would no longer conform to that interface, which would lead to [type safety] issues at runtime."},{heading:"updating-members",content:"Similar to contracts, the composite declarations structs, resources, and interfaces can also have fields and other nested declarations as its member. Updating such a composite declaration would also include updating all of its members."},{heading:"updating-members",content:"The following sections describe the restrictions imposed on updating the members of a struct, resource, or interface:"},{heading:"updating-members",content:"[Fields]"},{heading:"updating-members",content:"[Enums]"},{heading:"updating-members",content:"[Functions]"},{heading:"updating-members",content:"[Constructors]"},{heading:"enums",content:"**Valid changes**"},{heading:"enums",content:"Adding a new enum declaration is valid."},{heading:"enums",content:"**Invalid changes**"},{heading:"enums",content:"Removing an existing enum declaration is invalid."},{heading:"enums",content:"Otherwise, it is possible to remove an existing enum and add a new enum declaration with the same name, but with a different structure."},{heading:"enums",content:"The new structure could potentially have incompatible changes (such as changed types, changed enum-cases, and so on)."},{heading:"enums",content:"Changing the name is invalid, as it is equivalent to removing an existing enum and adding a new one."},{heading:"enums",content:"Changing the raw type is invalid:"},{heading:"enums",content:"When the enum value is stored, the raw value associated with the enum case gets stored."},{heading:"enums",content:"If the type is changed, then deserializing could fail if the already stored values are not in the same value space as the updated type."},{heading:"updating-enum-cases",content:"Enums consist of enum-case declarations, and updating an enum may also include changing the enum's cases as well. Enum cases are represented using their raw value at the Cadence interpreter and runtime. Hence, any change that causes an enum case to change its raw value is not permitted. Otherwise, a changed raw value could cause an already stored enum  value to have a different meaning than what it originally was (type confusion)."},{heading:"updating-enum-cases",content:"**Valid changes**"},{heading:"updating-enum-cases",content:"Adding an enum case at the end of the existing enum cases is valid:"},{heading:"updating-enum-cases",content:"**Invalid changes**"},{heading:"updating-enum-cases",content:"Adding an enum-case at the top or in the middle of the existing enum cases is invalid:"},{heading:"updating-enum-cases",content:"Changing the name of an enum case is invalid."},{heading:"updating-enum-cases",content:"Previously stored raw values for `Color.BLUE` now represents `Color.GREEN` (i.e., the stored values have changed their meaning, and hence not a valid change)."},{heading:"updating-enum-cases",content:"Similarly, it is possible to add a new enum with the old name `BLUE`, which gets a new raw value. Then, the same enum case `Color.BLUE` may have used two raw values at runtime, before and after the change, which is also invalid."},{heading:"updating-enum-cases",content:"Removing the enum case is invalid. Removing allows one to add and remove an enum case, which has the same effect as renaming:"},{heading:"updating-enum-cases",content:"Changing the order of enum cases is not permitted."},{heading:"updating-enum-cases",content:"The raw value of an enum is implicit and corresponds to the defined order."},{heading:"updating-enum-cases",content:"Changing the order of enum-cases has the same effect as changing the raw value, which could cause storage inconsistencies and type-confusions as described earlier."},{heading:"functions",content:"Adding, changing, and deleting a function definition is always valid, as function definitions are never stored as data (function definitions are part of the code, but not data)."},{heading:"functions",content:"Adding a function is valid."},{heading:"functions",content:"Deleting a function is valid."},{heading:"functions",content:"Changing a function signature (parameters, return types) is valid."},{heading:"functions",content:"Changing a function body is valid."},{heading:"functions",content:"Changing the access modifiers is valid."},{heading:"functions",content:"However, changing a *function type* may or may not be valid, depending on where it is used: if a function type is used in the type annotation of a composite type field (direct or indirect), then changing the function type signature is the same as changing the type annotation of that field (which is invalid)."},{heading:"events",content:"Events are not stored onchain. Any changes made to events have no impact on the stored data. Hence, adding, removing, and modifying events in a contract is valid."},{heading:"constructors",content:"Similar to functions, constructors are also not stored. Hence, any changes to constructors are valid."},{heading:"imports",content:"A contract may import declarations (types, functions, variables, and so on) from other programs. These imported programs are already validated at the time of their deployment. Hence, there is no need to validate any declaration every time they are imported."},{heading:"the-removedtype-pragma",content:"Under normal circumstances, it is not valid to remove a type declaration, whether a composite or an interface. However, a special pragma can be used when this is necessary to enable composite declarations to be *tombstoned*, removing them from a contract and preventing any declarations from being re-added with the same name. This pragma cannot be used with interfaces."},{heading:"the-removedtype-pragma",content:"To use this pragma, simply add a `#removedType(T)` line to the contract containing the type `T` you want to remove, at the same scope as the declaration of `T`."},{heading:"the-removedtype-pragma",content:"For example, to remove a resource definition `R` defined like so:"},{heading:"the-removedtype-pragma",content:"change the contract to:"},{heading:"the-removedtype-pragma",content:"This prevents any type named `R` from ever being declared again as a nested declaration in `Foo`, preventing the security issues normally posed by removing a type.  Specifically, when a `#removedType(T)` pragma is present at a certain scope level in a contract, no new type named `T` can be added at that scope. Additionally, once added, a `#removedType` pragma can never be removed, as this would allow circumventing the above restriction."},{heading:"the-removedtype-pragma",content:"Please note that this pragma's behavior is not necessarily final and is subject to change."}],headings:[{id:"validation-goals",content:"Validation goals"},{id:"updating-a-contract",content:"Updating a contract"},{id:"contract-fields",content:"Contract fields"},{id:"nested-declarations",content:"Nested declarations"},{id:"fields",content:"Fields"},{id:"structs-resources-and-interfaces",content:"Structs, resources, and interfaces"},{id:"updating-members",content:"Updating members"},{id:"enums",content:"Enums"},{id:"updating-enum-cases",content:"Updating enum cases"},{id:"functions",content:"Functions"},{id:"events",content:"Events"},{id:"constructors",content:"Constructors"},{id:"imports",content:"Imports"},{id:"the-removedtype-pragma",content:"The `#removedType` pragma"}]};const c=[{depth:2,url:"#validation-goals",title:s.jsx(s.Fragment,{children:"Validation goals"})},{depth:2,url:"#updating-a-contract",title:s.jsx(s.Fragment,{children:"Updating a contract"})},{depth:3,url:"#contract-fields",title:s.jsx(s.Fragment,{children:"Contract fields"})},{depth:3,url:"#nested-declarations",title:s.jsx(s.Fragment,{children:"Nested declarations"})},{depth:2,url:"#fields",title:s.jsx(s.Fragment,{children:"Fields"})},{depth:2,url:"#structs-resources-and-interfaces",title:s.jsx(s.Fragment,{children:"Structs, resources, and interfaces"})},{depth:3,url:"#updating-members",title:s.jsx(s.Fragment,{children:"Updating members"})},{depth:2,url:"#enums",title:s.jsx(s.Fragment,{children:"Enums"})},{depth:3,url:"#updating-enum-cases",title:s.jsx(s.Fragment,{children:"Updating enum cases"})},{depth:2,url:"#functions",title:s.jsx(s.Fragment,{children:"Functions"})},{depth:2,url:"#events",title:s.jsx(s.Fragment,{children:"Events"})},{depth:2,url:"#constructors",title:s.jsx(s.Fragment,{children:"Constructors"})},{depth:2,url:"#imports",title:s.jsx(s.Fragment,{children:"Imports"})},{depth:2,url:"#the-removedtype-pragma",title:s.jsxs(s.Fragment,{children:["The ",s.jsx("code",{children:"#removedType"})," pragma"]})}];function n(e){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...e.components};return s.jsxs(s.Fragment,{children:[s.jsxs(i.p,{children:["A ",s.jsx(i.a,{href:"./contracts",children:"contract"})," is a collection of data (its state) and code (its functions) that lives in the contract storage area of an account. When a contract is ",s.jsx(i.em,{children:"updated"}),", it is important to make sure that the changes introduced do not lead to runtime inconsistencies for already stored data."]}),`
`,s.jsx(i.p,{children:"Cadence maintains this state consistency by validating the contracts and all their components before an update."}),`
`,s.jsx(i.h2,{id:"validation-goals",children:"Validation goals"}),`
`,s.jsx(i.p,{children:"The contract update validation ensures that:"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Stored data doesn't change its meaning when a contract is updated."}),`
`,s.jsxs(i.li,{children:["Decoding and using stored data does not lead to runtime crashes.",`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"For example, it is invalid to add a field because the existing stored data won't have the new field."}),`
`,s.jsx(i.li,{children:"Loading the existing data will result in garbage/missing values for such fields."}),`
`,s.jsx(i.li,{children:"A static check of the access of the field would be valid, but the interpreter would crash when accessing the field because the field has a missing/garbage value."}),`
`]}),`
`]}),`
`]}),`
`,s.jsxs(i.p,{children:["However, it does ",s.jsx(i.strong,{children:"not"})," ensure any program that imports the updated contract stays valid. For example, an updated contract may remove an existing field or may change a function signature. In this case, any program that uses that field/function will get semantic errors."]}),`
`,s.jsx(i.h2,{id:"updating-a-contract",children:"Updating a contract"}),`
`,s.jsx(i.p,{children:"Changes to contracts can be introduced by adding new contracts, removing existing contracts, or updating existing contracts. However, some of these changes may lead to data inconsistencies as stated above."}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Valid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Adding a new contract is valid."}),`
`,s.jsx(i.li,{children:"Removing a contract/contract-interface that doesn't have enum declarations is valid."}),`
`,s.jsx(i.li,{children:"Updating a contract is valid under the restrictions described in the following sections."}),`
`]}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Invalid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["Removing a contract/contract-interface that contains enum declarations is not valid.",`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Removing a contract allows adding a new contract with the same name."}),`
`,s.jsx(i.li,{children:"The new contract could potentially have enum declarations with the same names as in the old contract, but with different structures."}),`
`,s.jsx(i.li,{children:"This could change the meaning of the already stored values of those enum types."}),`
`]}),`
`]}),`
`]}),`
`,s.jsx(i.p,{children:"A contract may consist of fields and other declarations such as composite types, functions, constructors, and so on. When an existing contract is updated, all of its inner declarations are also validated."}),`
`,s.jsx(i.h3,{id:"contract-fields",children:"Contract fields"}),`
`,s.jsx(i.p,{children:"When a contract is deployed, the fields of the contract are stored in an account's contract storage. Changing the fields of a contract only changes the way the program treats the data, but does not change the already-stored data itself, which could potentially result in runtime inconsistencies as mentioned in the previous section."}),`
`,s.jsxs(i.p,{children:["See ",s.jsx(i.a,{href:"#fields",children:"Fields"})," for any possible updates that can be made to the fields, and the restrictions imposed on changing the fields of a contract."]}),`
`,s.jsx(i.h3,{id:"nested-declarations",children:"Nested declarations"}),`
`,s.jsx(i.p,{children:"Contracts can have nested composite type declarations such as structs, resources, interfaces, and enums. When a contract is updated, its nested declarations are checked because:"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"They can be used as type annotations for the fields of the same contract, directly or indirectly."}),`
`,s.jsx(i.li,{children:"Any third-party contract can import the types defined in this contract and use them as type annotations."}),`
`,s.jsxs(i.li,{children:["Hence, changing the type definition is the same as changing the type annotation of such a field (which is also invalid, as described in the ",s.jsx(i.a,{href:"#fields",children:"Fields"})," section below)."]}),`
`]}),`
`,s.jsx(i.p,{children:"Changes that can be performed on the nested declarations and the update restrictions are described in the following sections:"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#structs-resources-and-interfaces",children:"Structs, resources, and interfaces"})}),`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#enums",children:"Enums"})}),`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#functions",children:"Functions"})}),`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#events",children:"Events"})}),`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#constructors",children:"Constructors"})}),`
`]}),`
`,s.jsx(i.h2,{id:"fields",children:"Fields"}),`
`,s.jsx(i.p,{children:"A field may belong to a contract, struct, resource, or interface:"}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Valid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Removing a field is valid"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"It leaves data for the removed field unused at the storage, as it is no longer accessible."}),`
`,s.jsx(i.li,{children:"However, it does not cause any runtime crashes."}),`
`]}),`
`]}),`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Changing the order of fields is valid."}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Changing the access modifier of a field is valid."}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   // access modifier changed to 'access(self)'"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Invalid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Adding a new field is not valid:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" b: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Invalid new field"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"The initializer of a contract only runs once, when the contract is deployed for the first time. It does not rerun when the contract is updated. However, it is still required to be present in the updated contract to satisfy type checks."}),`
`,s.jsx(i.li,{children:"Thus, the stored data won't have the new field, as the initializations for the newly added fields do not get executed."}),`
`,s.jsx(i.li,{children:"Decoding stored data will result in garbage or missing values for such fields."}),`
`]}),`
`]}),`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Changing the type of an existing field is not valid."}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated contract"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" a: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Invalid type change"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["In an already stored contract, the field ",s.jsx(i.code,{children:"a"})," would have a value of type ",s.jsx(i.code,{children:"String"}),"."]}),`
`,s.jsxs(i.li,{children:["Changing the type of the field ",s.jsx(i.code,{children:"a"})," to ",s.jsx(i.code,{children:"Int"}),"  would make the runtime read the already stored ",s.jsx(i.code,{children:"String"})," value as an ",s.jsx(i.code,{children:"Int"}),", which will result in deserialization errors."]}),`
`,s.jsxs(i.li,{children:["Changing the field type to a subtype/supertype of the existing type is also not valid, as it would also potentially cause issues while decoding/encoding.",`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["For example: changing an ",s.jsx(i.code,{children:"Int64"})," field to ",s.jsx(i.code,{children:"Int8"})," — Stored field could have a numeric value",s.jsx(i.code,{children:"624"}),", which exceeds the value space for ",s.jsx(i.code,{children:"Int8"}),"."]}),`
`,s.jsx(i.li,{children:"However, this is a limitation in the current implementation; future versions of Cadence may support changing the type of field to a subtype by providing means to migrate existing fields."}),`
`]}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,s.jsx(i.h2,{id:"structs-resources-and-interfaces",children:"Structs, resources, and interfaces"}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Valid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Adding a new struct, resource, or interface is valid."}),`
`,s.jsxs(i.li,{children:["Adding an interface conformance to a struct/resource is valid, since the stored data only stores concrete type/value, but doesn't store the conformance info:",`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing struct"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated struct"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"T"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["However, if adding a conformance also requires changing the existing structure (e.g., adding a new field that is enforced by the new conformance), then the other restriction(such as ",s.jsx(i.a,{href:"#fields",children:"restrictions on fields"}),") may prevent performing such an update."]}),`
`]}),`
`]}),`
`]}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Invalid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["Removing an existing declaration is not valid.",`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Removing a declaration allows adding a new declaration with the same name, but with a different structure."}),`
`,s.jsx(i.li,{children:"Any program that uses stored data belonging to that type would face inconsistencies."}),`
`]}),`
`]}),`
`,s.jsx(i.li,{children:"Renaming a declaration is not valid. It can have the same effect as removing an existing declaration and adding a new one."}),`
`,s.jsxs(i.li,{children:["Changing the type of declaration is not valid (i.e., changing from a struct to an interface, and vise versa).",`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing struct"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Changed to a struct interface"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {    "}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid type declaration change"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,s.jsxs(i.li,{children:["Removing an interface conformance of a struct/resource is not valid.",`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing struct"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"T"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated struct"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["Otherwise, types that used to conform to an interface would no longer conform to that interface, which would lead to ",s.jsx(i.a,{href:"./types-and-type-system/type-safety",children:"type safety"})," issues at runtime."]}),`
`]}),`
`]}),`
`]}),`
`,s.jsx(i.h3,{id:"updating-members",children:"Updating members"}),`
`,s.jsx(i.p,{children:"Similar to contracts, the composite declarations structs, resources, and interfaces can also have fields and other nested declarations as its member. Updating such a composite declaration would also include updating all of its members."}),`
`,s.jsx(i.p,{children:"The following sections describe the restrictions imposed on updating the members of a struct, resource, or interface:"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#fields",children:"Fields"})}),`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#enums",children:"Enums"})}),`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#functions",children:"Functions"})}),`
`,s.jsx(i.li,{children:s.jsx(i.a,{href:"#constructors",children:"Constructors"})}),`
`]}),`
`,s.jsx(i.h2,{id:"enums",children:"Enums"}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Valid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Adding a new enum declaration is valid."}),`
`]}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Invalid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["Removing an existing enum declaration is invalid.",`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Otherwise, it is possible to remove an existing enum and add a new enum declaration with the same name, but with a different structure."}),`
`,s.jsx(i.li,{children:"The new structure could potentially have incompatible changes (such as changed types, changed enum-cases, and so on)."}),`
`]}),`
`]}),`
`,s.jsx(i.li,{children:"Changing the name is invalid, as it is equivalent to removing an existing enum and adding a new one."}),`
`,s.jsxs(i.li,{children:["Changing the raw type is invalid:",`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing enum with `Int` raw type"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated enum with `UInt8` raw type"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {    "}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Invalid change of raw type"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"When the enum value is stored, the raw value associated with the enum case gets stored."}),`
`,s.jsx(i.li,{children:"If the type is changed, then deserializing could fail if the already stored values are not in the same value space as the updated type."}),`
`]}),`
`]}),`
`]}),`
`,s.jsx(i.h3,{id:"updating-enum-cases",children:"Updating enum cases"}),`
`,s.jsx(i.p,{children:"Enums consist of enum-case declarations, and updating an enum may also include changing the enum's cases as well. Enum cases are represented using their raw value at the Cadence interpreter and runtime. Hence, any change that causes an enum case to change its raw value is not permitted. Otherwise, a changed raw value could cause an already stored enum  value to have a different meaning than what it originally was (type confusion)."}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Valid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["Adding an enum case at the end of the existing enum cases is valid:",`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" GREEN"}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // valid new enum-case at the bottom"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`]}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Invalid changes"})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Adding an enum-case at the top or in the middle of the existing enum cases is invalid:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" GREEN"}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // invalid new enum-case in the middle"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Changing the name of an enum case is invalid."}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" GREEN"}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // invalid change of names"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:["Previously stored raw values for ",s.jsx(i.code,{children:"Color.BLUE"})," now represents ",s.jsx(i.code,{children:"Color.GREEN"})," (i.e., the stored values have changed their meaning, and hence not a valid change)."]}),`
`,s.jsxs(i.li,{children:["Similarly, it is possible to add a new enum with the old name ",s.jsx(i.code,{children:"BLUE"}),", which gets a new raw value. Then, the same enum case ",s.jsx(i.code,{children:"Color.BLUE"})," may have used two raw values at runtime, before and after the change, which is also invalid."]}),`
`]}),`
`]}),`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Removing the enum case is invalid. Removing allows one to add and remove an enum case, which has the same effect as renaming:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // invalid removal of `case BLUE`"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,s.jsxs(i.li,{children:[`
`,s.jsx(i.p,{children:"Changing the order of enum cases is not permitted."}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Existing enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Updated enum"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Color"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLUE"}),s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   // invalid change of order"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  case"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" RED"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"The raw value of an enum is implicit and corresponds to the defined order."}),`
`,s.jsx(i.li,{children:"Changing the order of enum-cases has the same effect as changing the raw value, which could cause storage inconsistencies and type-confusions as described earlier."}),`
`]}),`
`]}),`
`]}),`
`,s.jsx(i.h2,{id:"functions",children:"Functions"}),`
`,s.jsx(i.p,{children:"Adding, changing, and deleting a function definition is always valid, as function definitions are never stored as data (function definitions are part of the code, but not data)."}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsx(i.li,{children:"Adding a function is valid."}),`
`,s.jsx(i.li,{children:"Deleting a function is valid."}),`
`,s.jsx(i.li,{children:"Changing a function signature (parameters, return types) is valid."}),`
`,s.jsx(i.li,{children:"Changing a function body is valid."}),`
`,s.jsx(i.li,{children:"Changing the access modifiers is valid."}),`
`]}),`
`,s.jsxs(i.p,{children:["However, changing a ",s.jsx(i.em,{children:"function type"})," may or may not be valid, depending on where it is used: if a function type is used in the type annotation of a composite type field (direct or indirect), then changing the function type signature is the same as changing the type annotation of that field (which is invalid)."]}),`
`,s.jsx(i.h2,{id:"events",children:"Events"}),`
`,s.jsx(i.p,{children:"Events are not stored onchain. Any changes made to events have no impact on the stored data. Hence, adding, removing, and modifying events in a contract is valid."}),`
`,s.jsx(i.h2,{id:"constructors",children:"Constructors"}),`
`,s.jsx(i.p,{children:"Similar to functions, constructors are also not stored. Hence, any changes to constructors are valid."}),`
`,s.jsx(i.h2,{id:"imports",children:"Imports"}),`
`,s.jsx(i.p,{children:"A contract may import declarations (types, functions, variables, and so on) from other programs. These imported programs are already validated at the time of their deployment. Hence, there is no need to validate any declaration every time they are imported."}),`
`,s.jsxs(i.h2,{id:"the-removedtype-pragma",children:["The ",s.jsx(i.code,{children:"#removedType"})," pragma"]}),`
`,s.jsxs(i.p,{children:["Under normal circumstances, it is not valid to remove a type declaration, whether a composite or an interface. However, a special pragma can be used when this is necessary to enable composite declarations to be ",s.jsx(i.em,{children:"tombstoned"}),", removing them from a contract and preventing any declarations from being re-added with the same name. This pragma cannot be used with interfaces."]}),`
`,s.jsxs(i.p,{children:["To use this pragma, simply add a ",s.jsx(i.code,{children:"#removedType(T)"})," line to the contract containing the type ",s.jsx(i.code,{children:"T"})," you want to remove, at the same scope as the declaration of ",s.jsx(i.code,{children:"T"}),"."]}),`
`,s.jsxs(i.p,{children:["For example, to remove a resource definition ",s.jsx(i.code,{children:"R"})," defined like so:"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" R"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"     // definition of R ..."})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // other stuff ... "})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsx(i.p,{children:"change the contract to:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Foo"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  #"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"removedType"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"R"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // other stuff ... "})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.p,{children:["This prevents any type named ",s.jsx(i.code,{children:"R"})," from ever being declared again as a nested declaration in ",s.jsx(i.code,{children:"Foo"}),", preventing the security issues normally posed by removing a type.  Specifically, when a ",s.jsx(i.code,{children:"#removedType(T)"})," pragma is present at a certain scope level in a contract, no new type named ",s.jsx(i.code,{children:"T"})," can be added at that scope. Additionally, once added, a ",s.jsx(i.code,{children:"#removedType"})," pragma can never be removed, as this would allow circumventing the above restriction."]}),`
`,s.jsx(i.p,{children:"Please note that this pragma's behavior is not necessarily final and is subject to change."}),`
`]})}function r(e={}){const{wrapper:i}=e.components||{};return i?s.jsx(i,{...e,children:s.jsx(n,{...e})}):n(e)}export{t as _markdown,r as default,l as frontmatter,h as structuredData,c as toc};
