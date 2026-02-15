import{j as e}from"./main-BXy83AsK.js";let t=`

This is an opinionated list of best practices that Cadence developers should follow to write more secure Cadence code.

Some practices listed below might overlap with advice in the [Cadence Anti-Patterns] article, which is a recommended read as well.

Access Control [#access-control]

Do not use the \`access(all)\` modifier on fields and functions unless absolutely necessary. Prefer \`access(self)\`, \`access(contract)\`, \`access(account)\`, or \`access(SomeEntitlement)\`. Unintentionally declaring fields or functions as \`access(all)\` can expose vulnerabilities in your code.

When writing definitions for contracts, structs, or resources, start by declaring all your fields and functions as \`access(self)\`. If there is a function that needs to be accessible by external code, only declare it as \`access(all)\` if it is a \`view\` function or if you definitely want it to be accessible by anyone in the network.

\`\`\`cadence
/// Simplified Bank Account implementation
access(all) resource BankAccount {

    /// Fields should default to access(self) to be safe
    /// and be readable through view functions
    access(self) var balance: UFix64

    /// It is okay to make this function access(all) because it is a view function
    /// and all blockchain data is public
    access(all) view fun getBalance(): UFix64 {
        return self.balance
    }
}
\`\`\`

If there are any functions that modify privileged state that also need to be callable from external code, use [entitlements] for the access modifiers for those functions:

\`\`\`cadence
/// Simplified Vault implementation
/// Simplified Bank Account implementation
access(all) resource BankAccount {

    /// Declare Entitlements for state-modifying functions
    access(all) entitlement Owner

    /// Fields should default to access(self) just to be safe
    access(self) var balance: UFix64

    /// All non-view functions should be something other than access(all),
    
    /// This is only callable by other functions in the type, so it is \`access(self)\`
    access(self) fun updateBalance(_ new: UFix64) {
        self.balance = new
    }

    /// This function is external, but should only be called by the owner
    /// so we use the \`Owner\` entitlement
    access(Owner) fun withdrawFromAccount(_ amount: UFix64): @BankAccount {
        self.updateBalance(self.balance - amount)
        return <-create BankAccount(balance: amount)
    }

    /// This is also state-modifying, but we intend for it to be callable by anyone
    /// so we can make it access(all)
    access(all) fun depositToAccount(_ from: @BankAccount) {
        self.updateBalance(self.balance + from.getBalance())
        destroy from
    }
}
\`\`\`

Access Control for Composite-typed Fields [#access-control-for-composite-typed-fields]

Declaring a field as [\`access(all)\`] only protects from replacing the field's value, but the value itself can still be mutated if it is mutable. Remember that containers, like dictionaries and arrays, are mutable and composite fields like structs and resources are still mutable through their own functions.

:::danger
This means that if you ever have a field that is a resource, struct, or capability, it should ALWAYS be \`access(self)\`! If it is \`access(all)\`, anyone could access it and call its functions, which could be a major vulnerability.

You can still allow external code to access that field, but only through functions that you have defined with \`access(SomeEntitlement)\`. This way, you can explicitly define how external code can access these fields.
:::

Capabilities [#capabilities]

Issuing Capabilities [#issuing-capabilities]

Don't issue and publish capabilities unless absolutely necessary. Anyone can access capabilities that are published. If public access is needed, follow the [principle of least privilege/authority]: make sure that the capability type only grants access to the fields and functions that should be exposed, and nothing else. Ideally, create a capability with a reference type that is unauthorized.

When issuing a capability, a capability of the same type might already be present. It is a good practice to check if a capability already exists with \`getControllers()\` before creating it. If it already exists, you can reuse it instead of issuing a new one. This prevents you from overloading your account storage and overpaying because of redundant capabilities.

\`\`\`cadence
    // Capability to find or issue
    var flowTokenVaultCap: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>? = nil

    // Get all the capabilities that have already been issued for the desired storage path
    let flowTokenVaultCaps = account.capabilities.storage.getControllers(forPath: /storage/flowTokenVault)

    // Iterate through them to see if there is already one of the needed type
    for cap in flowTokenVaultCaps {
        if let cap = cap as? Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault> {
            flowTokenVaultCap = cap
            break
        }
    }

    // If no capabilities of the needed type are already present,
    // issue a new one
    if flowTokenVaultCap == nil {
        // issue a new entitled capability to the flow token vault
        flowTokenVaultCap = account.capabilities.storage.issue<auth(FungibleToken.Withdraw) &FlowToken.Vault>(/storage/flowTokenVault)
    }
\`\`\`

Publishing Capabilities [#publishing-capabilities]

When publishing a capability, a published capability might already be present. It is a good practice to check if a capability already exists with \`borrow\` before creating it. This function will return \`nil\` if the capability does not exist.

\`\`\`cadence
// Check if the published capability already exists
if account.capabilities.borrow<&FlowToken.Vault>(/public/flowTokenReceiver) == nil {
    // since it doesn't exist yet, we should publish a new one that we created earlier
    signer.capabilities.publish(
        receiverCapability,
        at: /public/flowTokenReceiver
    )
}
\`\`\`

Checking Capabilities [#checking-capabilities]

If it is necessary to handle the case where borrowing a capability might fail, the \`account.check\` function can be used to verify that the target exists and has a valid type:

\`\`\`cadence
// check if the capability is valid
if capability.check() {
    let reference = capability.borrow()
} else {
    // do something else if the capability isn't valid
}
\`\`\`

Capability Access [#capability-access]

Ensure capabilities cannot be accessed by unauthorized parties. For example, capabilities should not be accessible through a public field, including public dictionaries or arrays. Exposing a capability in such a way allows anyone to borrow it and to perform all actions that the capability allows, including \`access(all)\` fields and functions that aren't even in the restricted type of the capability.

References [#references]

[References] are ephemeral values and cannot be stored. If persistence is required, store a capability and borrow it when needed.

When exposing functionality in an account, struct, or resource, provide the least access necessary. When creating an authorized reference with [entitlements], create it with only the minimal set of [entitlements] required to achieve the desired functionality.

Accounts [#accounts]

Account storage [#account-storage]

Don't trust a user's [account storage]. Users have full control over their data and may reorganize it as they see fit. Users may store values in any path, so paths may store values of *unexpected* types. These values may be instances of types in contracts that the user deployed.

Always [borrow] with the specific type that is expected. Or, check if the value is an instance of the expected type.

Authorized account references [#authorized-account-references]

Access to an authorized account reference (\`auth(...) &Account\`) gives access to entitled operations (e.g., the account's storage, keys, and contracts).

Therefore, avoid passing an entitled account reference to a function, and when defining a function, only specify an account reference parameter with the fine-grained entitlements required to perform the necessary operations.

It is preferable to use capabilities over direct account storage access when exposing account data. Using capabilities allows the revocation of access and limits the access to a single value with a certain set of functionality.

Transactions [#transactions]

Audits of Cadence code should also include [transactions], as they may contain arbitrary code, just like in contracts. In addition, they are given full access to the accounts of the transaction's signers (i.e., the transaction is allowed to manipulate the signer's account storage, contracts, and keys).

Signing a transaction gives access to the operations accessible by the entitlements specified in the parameter types of the \`prepare\` block.

For example, the account reference type \`auth(Storage) &Auth\` is authorized to perform any storage operation.

When signing a transaction, audit which entitlements are requested.

When authoring a transaction, follow the [principle of least privilege/authority], and only request the least and most fine-grained account entitlements necessary to perform the operations of the transactions.

Types [#types]

Use [intersection types and interfaces]. Always use the most specific type possible, following the principle of least privilege. Types should always be as restrictive as possible, especially for resource types.

If given a less-specific type, cast to the more specific type that is expected. For example, when implementing the fungible token standard, a user may deposit any fungible token, so the implementation should cast to the expected concrete fungible token type.

{/* Relative links. Will not render on the page */}

[Cadence Anti-Patterns]: ./design-patterns

[References]: ./language/references

[account storage]: ./language/accounts/storage

[borrow]: ./language/capabilities#capabilities-in-accounts

[principle of least privilege/authority]: https://en.wikipedia.org/wiki/Principle_of_least_privilege

[transactions]: ./language/transactions

[principle of least privilege/authority]: https://en.wikipedia.org/wiki/Principle_of_least_privilege

[intersection types and interfaces]: ./language/types-and-type-system/intersection-types

[\`access(all)\`]: ./language/access-control

[entitlements]: ./language/access-control
`,l={title:"Cadence Security Best Practices"},c={contents:[{heading:void 0,content:"This is an opinionated list of best practices that Cadence developers should follow to write more secure Cadence code."},{heading:void 0,content:"Some practices listed below might overlap with advice in the [Cadence Anti-Patterns] article, which is a recommended read as well."},{heading:"access-control",content:"Do not use the `access(all)` modifier on fields and functions unless absolutely necessary. Prefer `access(self)`, `access(contract)`, `access(account)`, or `access(SomeEntitlement)`. Unintentionally declaring fields or functions as `access(all)` can expose vulnerabilities in your code."},{heading:"access-control",content:"When writing definitions for contracts, structs, or resources, start by declaring all your fields and functions as `access(self)`. If there is a function that needs to be accessible by external code, only declare it as `access(all)` if it is a `view` function or if you definitely want it to be accessible by anyone in the network."},{heading:"access-control",content:"If there are any functions that modify privileged state that also need to be callable from external code, use [entitlements] for the access modifiers for those functions:"},{heading:"access-control-for-composite-typed-fields",content:"Declaring a field as [`access(all)`] only protects from replacing the field's value, but the value itself can still be mutated if it is mutable. Remember that containers, like dictionaries and arrays, are mutable and composite fields like structs and resources are still mutable through their own functions."},{heading:"access-control-for-composite-typed-fields",content:":::danger\nThis means that if you ever have a field that is a resource, struct, or capability, it should ALWAYS be `access(self)`! If it is `access(all)`, anyone could access it and call its functions, which could be a major vulnerability."},{heading:"access-control-for-composite-typed-fields",content:"You can still allow external code to access that field, but only through functions that you have defined with `access(SomeEntitlement)`. This way, you can explicitly define how external code can access these fields.\n:::"},{heading:"issuing-capabilities",content:"Don't issue and publish capabilities unless absolutely necessary. Anyone can access capabilities that are published. If public access is needed, follow the [principle of least privilege/authority]: make sure that the capability type only grants access to the fields and functions that should be exposed, and nothing else. Ideally, create a capability with a reference type that is unauthorized."},{heading:"issuing-capabilities",content:"When issuing a capability, a capability of the same type might already be present. It is a good practice to check if a capability already exists with `getControllers()` before creating it. If it already exists, you can reuse it instead of issuing a new one. This prevents you from overloading your account storage and overpaying because of redundant capabilities."},{heading:"publishing-capabilities",content:"When publishing a capability, a published capability might already be present. It is a good practice to check if a capability already exists with `borrow` before creating it. This function will return `nil` if the capability does not exist."},{heading:"checking-capabilities",content:"If it is necessary to handle the case where borrowing a capability might fail, the `account.check` function can be used to verify that the target exists and has a valid type:"},{heading:"capability-access",content:"Ensure capabilities cannot be accessed by unauthorized parties. For example, capabilities should not be accessible through a public field, including public dictionaries or arrays. Exposing a capability in such a way allows anyone to borrow it and to perform all actions that the capability allows, including `access(all)` fields and functions that aren't even in the restricted type of the capability."},{heading:"references",content:"[References] are ephemeral values and cannot be stored. If persistence is required, store a capability and borrow it when needed."},{heading:"references",content:"When exposing functionality in an account, struct, or resource, provide the least access necessary. When creating an authorized reference with [entitlements], create it with only the minimal set of [entitlements] required to achieve the desired functionality."},{heading:"account-storage",content:"Don't trust a user's [account storage]. Users have full control over their data and may reorganize it as they see fit. Users may store values in any path, so paths may store values of *unexpected* types. These values may be instances of types in contracts that the user deployed."},{heading:"account-storage",content:"Always [borrow] with the specific type that is expected. Or, check if the value is an instance of the expected type."},{heading:"authorized-account-references",content:"Access to an authorized account reference (`auth(...) &Account`) gives access to entitled operations (e.g., the account's storage, keys, and contracts)."},{heading:"authorized-account-references",content:"Therefore, avoid passing an entitled account reference to a function, and when defining a function, only specify an account reference parameter with the fine-grained entitlements required to perform the necessary operations."},{heading:"authorized-account-references",content:"It is preferable to use capabilities over direct account storage access when exposing account data. Using capabilities allows the revocation of access and limits the access to a single value with a certain set of functionality."},{heading:"transactions",content:"Audits of Cadence code should also include [transactions], as they may contain arbitrary code, just like in contracts. In addition, they are given full access to the accounts of the transaction's signers (i.e., the transaction is allowed to manipulate the signer's account storage, contracts, and keys)."},{heading:"transactions",content:"Signing a transaction gives access to the operations accessible by the entitlements specified in the parameter types of the `prepare` block."},{heading:"transactions",content:"For example, the account reference type `auth(Storage) &Auth` is authorized to perform any storage operation."},{heading:"transactions",content:"When signing a transaction, audit which entitlements are requested."},{heading:"transactions",content:"When authoring a transaction, follow the [principle of least privilege/authority], and only request the least and most fine-grained account entitlements necessary to perform the operations of the transactions."},{heading:"types",content:"Use [intersection types and interfaces]. Always use the most specific type possible, following the principle of least privilege. Types should always be as restrictive as possible, especially for resource types."},{heading:"types",content:"If given a less-specific type, cast to the more specific type that is expected. For example, when implementing the fungible token standard, a user may deposit any fungible token, so the implementation should cast to the expected concrete fungible token type."}],headings:[{id:"access-control",content:"Access Control"},{id:"access-control-for-composite-typed-fields",content:"Access Control for Composite-typed Fields"},{id:"capabilities",content:"Capabilities"},{id:"issuing-capabilities",content:"Issuing Capabilities"},{id:"publishing-capabilities",content:"Publishing Capabilities"},{id:"checking-capabilities",content:"Checking Capabilities"},{id:"capability-access",content:"Capability Access"},{id:"references",content:"References"},{id:"accounts",content:"Accounts"},{id:"account-storage",content:"Account storage"},{id:"authorized-account-references",content:"Authorized account references"},{id:"transactions",content:"Transactions"},{id:"types",content:"Types"}]};const h=[{depth:2,url:"#access-control",title:e.jsx(e.Fragment,{children:"Access Control"})},{depth:2,url:"#access-control-for-composite-typed-fields",title:e.jsx(e.Fragment,{children:"Access Control for Composite-typed Fields"})},{depth:1,url:"#capabilities",title:e.jsx(e.Fragment,{children:"Capabilities"})},{depth:2,url:"#issuing-capabilities",title:e.jsx(e.Fragment,{children:"Issuing Capabilities"})},{depth:2,url:"#publishing-capabilities",title:e.jsx(e.Fragment,{children:"Publishing Capabilities"})},{depth:2,url:"#checking-capabilities",title:e.jsx(e.Fragment,{children:"Checking Capabilities"})},{depth:2,url:"#capability-access",title:e.jsx(e.Fragment,{children:"Capability Access"})},{depth:2,url:"#references",title:e.jsx(e.Fragment,{children:"References"})},{depth:1,url:"#accounts",title:e.jsx(e.Fragment,{children:"Accounts"})},{depth:2,url:"#account-storage",title:e.jsx(e.Fragment,{children:"Account storage"})},{depth:2,url:"#authorized-account-references",title:e.jsx(e.Fragment,{children:"Authorized account references"})},{depth:2,url:"#transactions",title:e.jsx(e.Fragment,{children:"Transactions"})},{depth:2,url:"#types",title:e.jsx(e.Fragment,{children:"Types"})}];function n(s){const i={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",p:"p",pre:"pre",span:"span",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"This is an opinionated list of best practices that Cadence developers should follow to write more secure Cadence code."}),`
`,e.jsxs(i.p,{children:["Some practices listed below might overlap with advice in the ",e.jsx(i.a,{href:"./design-patterns",children:"Cadence Anti-Patterns"})," article, which is a recommended read as well."]}),`
`,e.jsx(i.h2,{id:"access-control",children:"Access Control"}),`
`,e.jsxs(i.p,{children:["Do not use the ",e.jsx(i.code,{children:"access(all)"})," modifier on fields and functions unless absolutely necessary. Prefer ",e.jsx(i.code,{children:"access(self)"}),", ",e.jsx(i.code,{children:"access(contract)"}),", ",e.jsx(i.code,{children:"access(account)"}),", or ",e.jsx(i.code,{children:"access(SomeEntitlement)"}),". Unintentionally declaring fields or functions as ",e.jsx(i.code,{children:"access(all)"})," can expose vulnerabilities in your code."]}),`
`,e.jsxs(i.p,{children:["When writing definitions for contracts, structs, or resources, start by declaring all your fields and functions as ",e.jsx(i.code,{children:"access(self)"}),". If there is a function that needs to be accessible by external code, only declare it as ",e.jsx(i.code,{children:"access(all)"})," if it is a ",e.jsx(i.code,{children:"view"})," function or if you definitely want it to be accessible by anyone in the network."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/// Simplified Bank Account implementation"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BankAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Fields should default to access(self) to be safe"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// and be readable through view functions"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" balance: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// It is okay to make this function access(all) because it is a view function"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// and all blockchain data is public"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") view "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getBalance"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".balance"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["If there are any functions that modify privileged state that also need to be callable from external code, use ",e.jsx(i.a,{href:"./language/access-control",children:"entitlements"})," for the access modifiers for those functions:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/// Simplified Vault implementation"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/// Simplified Bank Account implementation"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"resource"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BankAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Declare Entitlements for state-modifying functions"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"entitlement"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Owner"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Fields should default to access(self) just to be safe"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" balance: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// All non-view functions should be something other than access(all),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    "})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// This is only callable by other functions in the type, so it is `access(self)`"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" updateBalance"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ new: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".balance = new"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// This function is external, but should only be called by the owner"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// so we use the `Owner` entitlement"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Owner"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" withdrawFromAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ amount: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BankAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"updateBalance"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".balance "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" amount)"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        return"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-create"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BankAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(balance: amount)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// This is also state-modifying, but we intend for it to be callable by anyone"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// so we can make it access(all)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" depositToAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"BankAccount"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"updateBalance"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".balance "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBalance"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        destroy"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" from"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"access-control-for-composite-typed-fields",children:"Access Control for Composite-typed Fields"}),`
`,e.jsxs(i.p,{children:["Declaring a field as ",e.jsx(i.a,{href:"./language/access-control",children:e.jsx(i.code,{children:"access(all)"})})," only protects from replacing the field's value, but the value itself can still be mutated if it is mutable. Remember that containers, like dictionaries and arrays, are mutable and composite fields like structs and resources are still mutable through their own functions."]}),`
`,e.jsxs(i.p,{children:[`:::danger
This means that if you ever have a field that is a resource, struct, or capability, it should ALWAYS be `,e.jsx(i.code,{children:"access(self)"}),"! If it is ",e.jsx(i.code,{children:"access(all)"}),", anyone could access it and call its functions, which could be a major vulnerability."]}),`
`,e.jsxs(i.p,{children:["You can still allow external code to access that field, but only through functions that you have defined with ",e.jsx(i.code,{children:"access(SomeEntitlement)"}),`. This way, you can explicitly define how external code can access these fields.
:::`]}),`
`,e.jsx(i.h1,{id:"capabilities",children:"Capabilities"}),`
`,e.jsx(i.h2,{id:"issuing-capabilities",children:"Issuing Capabilities"}),`
`,e.jsxs(i.p,{children:["Don't issue and publish capabilities unless absolutely necessary. Anyone can access capabilities that are published. If public access is needed, follow the ",e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Principle_of_least_privilege",children:"principle of least privilege/authority"}),": make sure that the capability type only grants access to the fields and functions that should be exposed, and nothing else. Ideally, create a capability with a reference type that is unauthorized."]}),`
`,e.jsxs(i.p,{children:["When issuing a capability, a capability of the same type might already be present. It is a good practice to check if a capability already exists with ",e.jsx(i.code,{children:"getControllers()"})," before creating it. If it already exists, you can reuse it instead of issuing a new one. This prevents you from overloading your account storage and overpaying because of redundant capabilities."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Capability to find or issue"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" flowTokenVaultCap: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FlowToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"? = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"nil"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Get all the capabilities that have already been issued for the desired storage path"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" flowTokenVaultCaps = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.storage."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getControllers"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(forPath: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowTokenVault)"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Iterate through them to see if there is already one of the needed type"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" cap "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" flowTokenVaultCaps {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        if"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" cap = cap "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"as"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"? "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FlowToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            flowTokenVaultCap = cap"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            break"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // If no capabilities of the needed type are already present,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // issue a new one"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    if"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" flowTokenVaultCap "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // issue a new entitled capability to the flow token vault"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        flowTokenVaultCap = "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.storage.issue"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<auth"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FungibleToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Withdraw"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FlowToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowTokenVault)"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})})]})})}),`
`,e.jsx(i.h2,{id:"publishing-capabilities",children:"Publishing Capabilities"}),`
`,e.jsxs(i.p,{children:["When publishing a capability, a published capability might already be present. It is a good practice to check if a capability already exists with ",e.jsx(i.code,{children:"borrow"})," before creating it. This function will return ",e.jsx(i.code,{children:"nil"})," if the capability does not exist."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Check if the published capability already exists"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" account"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".capabilities.borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FlowToken"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowTokenReceiver) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" nil"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // since it doesn't exist yet, we should publish a new one that we created earlier"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signer.capabilities."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"publish"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        receiverCapability,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        at: "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowTokenReceiver"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"checking-capabilities",children:"Checking Capabilities"}),`
`,e.jsxs(i.p,{children:["If it is necessary to handle the case where borrowing a capability might fail, the ",e.jsx(i.code,{children:"account.check"})," function can be used to verify that the target exists and has a valid type:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// check if the capability is valid"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"if"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" capability."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"check"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" reference = capability."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"borrow"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"} "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // do something else if the capability isn't valid"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"capability-access",children:"Capability Access"}),`
`,e.jsxs(i.p,{children:["Ensure capabilities cannot be accessed by unauthorized parties. For example, capabilities should not be accessible through a public field, including public dictionaries or arrays. Exposing a capability in such a way allows anyone to borrow it and to perform all actions that the capability allows, including ",e.jsx(i.code,{children:"access(all)"})," fields and functions that aren't even in the restricted type of the capability."]}),`
`,e.jsx(i.h2,{id:"references",children:"References"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.a,{href:"./language/references",children:"References"})," are ephemeral values and cannot be stored. If persistence is required, store a capability and borrow it when needed."]}),`
`,e.jsxs(i.p,{children:["When exposing functionality in an account, struct, or resource, provide the least access necessary. When creating an authorized reference with ",e.jsx(i.a,{href:"./language/access-control",children:"entitlements"}),", create it with only the minimal set of ",e.jsx(i.a,{href:"./language/access-control",children:"entitlements"})," required to achieve the desired functionality."]}),`
`,e.jsx(i.h1,{id:"accounts",children:"Accounts"}),`
`,e.jsx(i.h2,{id:"account-storage",children:"Account storage"}),`
`,e.jsxs(i.p,{children:["Don't trust a user's ",e.jsx(i.a,{href:"./language/accounts/storage",children:"account storage"}),". Users have full control over their data and may reorganize it as they see fit. Users may store values in any path, so paths may store values of ",e.jsx(i.em,{children:"unexpected"})," types. These values may be instances of types in contracts that the user deployed."]}),`
`,e.jsxs(i.p,{children:["Always ",e.jsx(i.a,{href:"./language/capabilities#capabilities-in-accounts",children:"borrow"})," with the specific type that is expected. Or, check if the value is an instance of the expected type."]}),`
`,e.jsx(i.h2,{id:"authorized-account-references",children:"Authorized account references"}),`
`,e.jsxs(i.p,{children:["Access to an authorized account reference (",e.jsx(i.code,{children:"auth(...) &Account"}),") gives access to entitled operations (e.g., the account's storage, keys, and contracts)."]}),`
`,e.jsx(i.p,{children:"Therefore, avoid passing an entitled account reference to a function, and when defining a function, only specify an account reference parameter with the fine-grained entitlements required to perform the necessary operations."}),`
`,e.jsx(i.p,{children:"It is preferable to use capabilities over direct account storage access when exposing account data. Using capabilities allows the revocation of access and limits the access to a single value with a certain set of functionality."}),`
`,e.jsx(i.h2,{id:"transactions",children:"Transactions"}),`
`,e.jsxs(i.p,{children:["Audits of Cadence code should also include ",e.jsx(i.a,{href:"./language/transactions",children:"transactions"}),", as they may contain arbitrary code, just like in contracts. In addition, they are given full access to the accounts of the transaction's signers (i.e., the transaction is allowed to manipulate the signer's account storage, contracts, and keys)."]}),`
`,e.jsxs(i.p,{children:["Signing a transaction gives access to the operations accessible by the entitlements specified in the parameter types of the ",e.jsx(i.code,{children:"prepare"})," block."]}),`
`,e.jsxs(i.p,{children:["For example, the account reference type ",e.jsx(i.code,{children:"auth(Storage) &Auth"})," is authorized to perform any storage operation."]}),`
`,e.jsx(i.p,{children:"When signing a transaction, audit which entitlements are requested."}),`
`,e.jsxs(i.p,{children:["When authoring a transaction, follow the ",e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Principle_of_least_privilege",children:"principle of least privilege/authority"}),", and only request the least and most fine-grained account entitlements necessary to perform the operations of the transactions."]}),`
`,e.jsx(i.h2,{id:"types",children:"Types"}),`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.a,{href:"./language/types-and-type-system/intersection-types",children:"intersection types and interfaces"}),". Always use the most specific type possible, following the principle of least privilege. Types should always be as restrictive as possible, especially for resource types."]}),`
`,e.jsx(i.p,{children:"If given a less-specific type, cast to the more specific type that is expected. For example, when implementing the fungible token standard, a user may deposit any fungible token, so the implementation should cast to the expected concrete fungible token type."}),`
`]})}function r(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{t as _markdown,r as default,l as frontmatter,c as structuredData,h as toc};
