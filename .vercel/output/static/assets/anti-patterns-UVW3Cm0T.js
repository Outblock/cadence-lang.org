import{j as s}from"./main-BXy83AsK.js";let t=`

This is an opinionated list of issues that can be improved if they are found in Cadence code intended for production.

Avoid using fully authorized account references as a function parameter [#avoid-using-fully-authorized-account-references-as-a-function-parameter]

Problem [#problem]

A developer may choose to authenticate or perform operations for their users by using the users' account reference or addresses.
In order to do this, they might add a parameter to a function which has an authorized account reference type (\`auth(...) &Account\`),
as an authorized account reference can only be obtained by signing a transaction.

If it is a fully authorized account reference, this is problematic,
as the fully-authorized account reference allows access to some sensitive operations on the account,
for example, to write to storage, which provides the opportunity for bad actors to take advantage of.

Example: [#example]

\`\`\`cadence
...
// BAD CODE
// DO NOT COPY

// Imagine this code is in a contract that uses a \`auth(Storage) &Account\` parameter
// to authenticate users to transfer NFTs

// They could deploy the contract with an Ethereum-style access control list functionality

access(all)
fun transferNFT(id: UInt64, owner: auth(Storage) &Account) {
    assert(owner(id) == owner.address)

    transfer(id)
}

// But they could upgrade the function to have the same signature
// so it looks like it is doing the same thing, but they could also drain a little bit
// of FLOW from the user's vault, a totally separate piece of the account that
// should not be accessible in this function
// BAD

access(all)
fun transferNFT(id: UInt64, owner: auth(Storage) &Account) {
    assert(owner(id) == owner.address)

    transfer(id)

    // Sneakily borrow a reference to the user's Flow Token Vault
    // and withdraw a bit of FLOW
    // BAD
    let vaultRef = owner.borrow<&FlowToken.Vault>(/storage/flowTokenVault)!
    let stolenTokens <- vaultRef.withdraw(amount: 0.1)

    // deposit the stolen funds in the contract owners vault
    // BAD
    contractVault.deposit(from: <-stolenTokens)
}
...
\`\`\`

Solution [#solution]

Projects should find other ways to authenticate users, such as using resources and capabilities as authentication objects.
They should also expect to perform most storage and linking operations within transaction bodies
rather than inside contract utility functions.

There are some scenarios where using an authorized account reference (\`auth(...) &Account\`) is necessary,
such as a cold storage multi-sig,
but those cases are rare and should only be used if it is a very restricted subset
of account functionality that is required.

Public functions and fields should be avoided [#public-functions-and-fields-should-be-avoided]

Problem [#problem-1]

Be sure to keep track of access modifiers when structuring your code, and make public only what should be public.
Accidentally exposed fields can be a security hole.

Solution [#solution-1]

When writing your smart contract, look at every field and function and make sure
that any functions that you don't want every user to be able to access require access through an [entitlement](./language/access-control.md#entitlements) (\`access(E)\`),
or use a non-public [access modifier](./language/access-control) like \`access(self)\`, \`access(contract)\`, or \`access(account)\`.
Declaring a function as \`access(all)\` is a deliberate design decision to allow completely open and unrestricted access to read that field or call that function and should not be taken lightly.

The only functions that should be \`access(all)\` are \`view\` functions and functions the everyone should be able to access and the only fields that should be \`access(all)\` are basic types like numbers or addresses.
Complex fields like arrays, dictionaries, structs, resources, or capabilities should always be \`access(self)\`.

Capability-Typed public fields are a security hole [#capability-typed-public-fields-are-a-security-hole]

This is a specific case of "Public Functions And Fields Should Be Avoided", above.

Problem [#problem-2]

The values of public fields can be copied. Capabilities are value types,
so if they are used as a public field, anyone can copy it from the field
and call the functions that it exposes.
This almost certainly is not what you want if a capability
has been stored as a field on a contract or resource in this way.

Solution [#solution-2]

For public access to a capability, place it in an accounts public area so this expectation is explicit.

Public admin resource creation functions are unsafe [#public-admin-resource-creation-functions-are-unsafe]

This is a specific case of "Public Functions And Fields Should Be Avoided", above.

Problem [#problem-3]

A public function on a contract that creates a resource can be called by any account.
If that resource provides access to admin functions then the creation function should not be public.

Solution [#solution-3]

To fix this, a single instance of that resource should be created in the contract's initializer,
and then a new creation function can be potentially included within the admin resource, if necessary.

Example [#example-1]

\`\`\`cadence
// Pseudo-code

// BAD
access(all)
contract Currency {

    access(all)
    resource Admin {

        access(all)
        fun mintTokens()
    }

    // Anyone in the network can call this function
    // And use the Admin resource to mint tokens
    access(all)
    fun createAdmin(): @Admin {
        return <-create Admin()
    }
}

// This contract makes the admin creation private and in the initializer
// so that only the one who controls the account can mint tokens
// GOOD
access(all)
contract Currency {

    access(all)
    resource Admin {

        access(all)
        fun mintTokens()

        // Only an admin can create new Admins
        access(all)
        fun createAdmin(): @Admin {
            return <-create Admin()
        }
    }

    init() {
        // Create a single admin resource
        let firstAdmin <- create Admin()

        // Store it in private account storage, so only the admin can use it
        self.account.storage.save(<-firstAdmin, to: /storage/currencyAdmin)
    }
}
\`\`\`

Do not modify smart contract state or emit events in public struct initializers [#do-not-modify-smart-contract-state-or-emit-events-in-public-struct-initializers]

This is another example of the risks of having publicly accessible parts to your smart contract.

Problem [#problem-4]

Data structure definitions in Cadence currently must be declared as public so that they can be used by anyone.
Structs do not have the same restrictions that resources have on them,
which means that anyone can create a new instance of a struct without going through any authorization.

Solution [#solution-4]

Any contract state-modifying operations related to the creation of structs
should be contained in resources instead of the initializers of structs.

Example [#example-2]

This used to be a bug in the NBA Top Shot smart contract, so we'll use that as an example.
Before, when it created a new play,
[it would initialize the play record with a struct,](https://github.com/dapperlabs/nba-smart-contracts/blob/55645478594858a6830e4ab095034068ef9753e9/contracts/TopShot.cdc#L155-L158)
which increments the number that tracks the play IDs and emits an event:

\`\`\`cadence
// Simplified Code
// BAD
//
access(all)
contract TopShot {

    // The Record that is used to track every unique play ID
    access(all)
    var nextPlayID: UInt32

    access(all)
    struct Play {

        access(all)
        let playID: UInt32

        init() {

            self.playID = TopShot.nextPlayID

            // Increment the ID so that it isn't used again
            TopShot.nextPlayID = TopShot.nextPlayID + 1

            emit PlayCreated(id: self.playID, metadata: metadata)
        }
    }
}
\`\`\`

This is a risk because anyone can create the \`Play\` struct as many times as they want,
which could increment the \`nextPlayID\` field to the max \`UInt32\` value,
effectively preventing new plays from being created. It also would emit bogus events.

This bug was fixed by
[instead updating the contract state in the admin function](https://github.com/dapperlabs/nba-smart-contracts/blob/master/contracts/TopShot.cdc#L682-L685)
that creates the plays.

\`\`\`cadence
// Update contract state in admin resource functions
// GOOD
//
access(all)
contract TopShot {

    // The Record that is used to track every unique play ID
    access(all)
    var nextPlayID: UInt32

    access(all)
    struct Play {

        access(all)
        let playID: UInt32

        init() {
            self.playID = TopShot.nextPlayID
        }
    }

    access(all)
    resource Admin {

        // Protected within the private admin resource
        access(all)
        fun createPlay() {
            // Create the new Play
            var newPlay = Play()

            // Increment the ID so that it isn't used again
            TopShot.nextPlayID = TopShot.nextPlayID + UInt32(1)

            emit PlayCreated(id: newPlay.playID, metadata: metadata)

            // Store it in the contract storage
            TopShot.playDatas[newPlay.playID] = newPlay
        }
    }
}
\`\`\`
`,l={title:"Cadence Anti-Patterns"},h={contents:[{heading:void 0,content:"This is an opinionated list of issues that can be improved if they are found in Cadence code intended for production."},{heading:"problem",content:"A developer may choose to authenticate or perform operations for their users by using the users' account reference or addresses.\nIn order to do this, they might add a parameter to a function which has an authorized account reference type (`auth(...) &Account`),\nas an authorized account reference can only be obtained by signing a transaction."},{heading:"problem",content:`If it is a fully authorized account reference, this is problematic,
as the fully-authorized account reference allows access to some sensitive operations on the account,
for example, to write to storage, which provides the opportunity for bad actors to take advantage of.`},{heading:"solution",content:`Projects should find other ways to authenticate users, such as using resources and capabilities as authentication objects.
They should also expect to perform most storage and linking operations within transaction bodies
rather than inside contract utility functions.`},{heading:"solution",content:`There are some scenarios where using an authorized account reference (\`auth(...) &Account\`) is necessary,
such as a cold storage multi-sig,
but those cases are rare and should only be used if it is a very restricted subset
of account functionality that is required.`},{heading:"problem-1",content:`Be sure to keep track of access modifiers when structuring your code, and make public only what should be public.
Accidentally exposed fields can be a security hole.`},{heading:"solution-1",content:"When writing your smart contract, look at every field and function and make sure\nthat any functions that you don't want every user to be able to access require access through an entitlement (`access(E)`),\nor use a non-public access modifier like `access(self)`, `access(contract)`, or `access(account)`.\nDeclaring a function as `access(all)` is a deliberate design decision to allow completely open and unrestricted access to read that field or call that function and should not be taken lightly."},{heading:"solution-1",content:"The only functions that should be `access(all)` are `view` functions and functions the everyone should be able to access and the only fields that should be `access(all)` are basic types like numbers or addresses.\nComplex fields like arrays, dictionaries, structs, resources, or capabilities should always be `access(self)`."},{heading:"capability-typed-public-fields-are-a-security-hole",content:'This is a specific case of "Public Functions And Fields Should Be Avoided", above.'},{heading:"problem-2",content:`The values of public fields can be copied. Capabilities are value types,
so if they are used as a public field, anyone can copy it from the field
and call the functions that it exposes.
This almost certainly is not what you want if a capability
has been stored as a field on a contract or resource in this way.`},{heading:"solution-2",content:"For public access to a capability, place it in an accounts public area so this expectation is explicit."},{heading:"public-admin-resource-creation-functions-are-unsafe",content:'This is a specific case of "Public Functions And Fields Should Be Avoided", above.'},{heading:"problem-3",content:`A public function on a contract that creates a resource can be called by any account.
If that resource provides access to admin functions then the creation function should not be public.`},{heading:"solution-3",content:`To fix this, a single instance of that resource should be created in the contract's initializer,
and then a new creation function can be potentially included within the admin resource, if necessary.`},{heading:"do-not-modify-smart-contract-state-or-emit-events-in-public-struct-initializers",content:"This is another example of the risks of having publicly accessible parts to your smart contract."},{heading:"problem-4",content:`Data structure definitions in Cadence currently must be declared as public so that they can be used by anyone.
Structs do not have the same restrictions that resources have on them,
which means that anyone can create a new instance of a struct without going through any authorization.`},{heading:"solution-4",content:`Any contract state-modifying operations related to the creation of structs
should be contained in resources instead of the initializers of structs.`},{heading:"example-2",content:`This used to be a bug in the NBA Top Shot smart contract, so we'll use that as an example.
Before, when it created a new play,
it would initialize the play record with a struct,
which increments the number that tracks the play IDs and emits an event:`},{heading:"example-2",content:"This is a risk because anyone can create the `Play` struct as many times as they want,\nwhich could increment the `nextPlayID` field to the max `UInt32` value,\neffectively preventing new plays from being created. It also would emit bogus events."},{heading:"example-2",content:`This bug was fixed by
instead updating the contract state in the admin function
that creates the plays.`}],headings:[{id:"avoid-using-fully-authorized-account-references-as-a-function-parameter",content:"Avoid using fully authorized account references as a function parameter"},{id:"problem",content:"Problem"},{id:"example",content:"Example:"},{id:"solution",content:"Solution"},{id:"public-functions-and-fields-should-be-avoided",content:"Public functions and fields should be avoided"},{id:"problem-1",content:"Problem"},{id:"solution-1",content:"Solution"},{id:"capability-typed-public-fields-are-a-security-hole",content:"Capability-Typed public fields are a security hole"},{id:"problem-2",content:"Problem"},{id:"solution-2",content:"Solution"},{id:"public-admin-resource-creation-functions-are-unsafe",content:"Public admin resource creation functions are unsafe"},{id:"problem-3",content:"Problem"},{id:"solution-3",content:"Solution"},{id:"example-1",content:"Example"},{id:"do-not-modify-smart-contract-state-or-emit-events-in-public-struct-initializers",content:"Do not modify smart contract state or emit events in public struct initializers"},{id:"problem-4",content:"Problem"},{id:"solution-4",content:"Solution"},{id:"example-2",content:"Example"}]};const r=[{depth:2,url:"#avoid-using-fully-authorized-account-references-as-a-function-parameter",title:s.jsx(s.Fragment,{children:"Avoid using fully authorized account references as a function parameter"})},{depth:3,url:"#problem",title:s.jsx(s.Fragment,{children:"Problem"})},{depth:3,url:"#example",title:s.jsx(s.Fragment,{children:"Example:"})},{depth:3,url:"#solution",title:s.jsx(s.Fragment,{children:"Solution"})},{depth:2,url:"#public-functions-and-fields-should-be-avoided",title:s.jsx(s.Fragment,{children:"Public functions and fields should be avoided"})},{depth:3,url:"#problem-1",title:s.jsx(s.Fragment,{children:"Problem"})},{depth:3,url:"#solution-1",title:s.jsx(s.Fragment,{children:"Solution"})},{depth:2,url:"#capability-typed-public-fields-are-a-security-hole",title:s.jsx(s.Fragment,{children:"Capability-Typed public fields are a security hole"})},{depth:3,url:"#problem-2",title:s.jsx(s.Fragment,{children:"Problem"})},{depth:3,url:"#solution-2",title:s.jsx(s.Fragment,{children:"Solution"})},{depth:2,url:"#public-admin-resource-creation-functions-are-unsafe",title:s.jsx(s.Fragment,{children:"Public admin resource creation functions are unsafe"})},{depth:3,url:"#problem-3",title:s.jsx(s.Fragment,{children:"Problem"})},{depth:3,url:"#solution-3",title:s.jsx(s.Fragment,{children:"Solution"})},{depth:3,url:"#example-1",title:s.jsx(s.Fragment,{children:"Example"})},{depth:2,url:"#do-not-modify-smart-contract-state-or-emit-events-in-public-struct-initializers",title:s.jsx(s.Fragment,{children:"Do not modify smart contract state or emit events in public struct initializers"})},{depth:3,url:"#problem-4",title:s.jsx(s.Fragment,{children:"Problem"})},{depth:3,url:"#solution-4",title:s.jsx(s.Fragment,{children:"Solution"})},{depth:3,url:"#example-2",title:s.jsx(s.Fragment,{children:"Example"})}];function n(e){const i={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",...e.components};return s.jsxs(s.Fragment,{children:[s.jsx(i.p,{children:"This is an opinionated list of issues that can be improved if they are found in Cadence code intended for production."}),`
`,s.jsx(i.h2,{id:"avoid-using-fully-authorized-account-references-as-a-function-parameter",children:"Avoid using fully authorized account references as a function parameter"}),`
`,s.jsx(i.h3,{id:"problem",children:"Problem"}),`
`,s.jsxs(i.p,{children:[`A developer may choose to authenticate or perform operations for their users by using the users' account reference or addresses.
In order to do this, they might add a parameter to a function which has an authorized account reference type (`,s.jsx(i.code,{children:"auth(...) &Account"}),`),
as an authorized account reference can only be obtained by signing a transaction.`]}),`
`,s.jsx(i.p,{children:`If it is a fully authorized account reference, this is problematic,
as the fully-authorized account reference allows access to some sensitive operations on the account,
for example, to write to storage, which provides the opportunity for bad actors to take advantage of.`}),`
`,s.jsx(i.h3,{id:"example",children:"Example:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// BAD CODE"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// DO NOT COPY"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Imagine this code is in a contract that uses a `auth(Storage) &Account` parameter"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// to authenticate users to transfer NFTs"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// They could deploy the contract with an Ethereum-style access control list functionality"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" transferNFT"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", owner: "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Storage"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    assert"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"owner"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id) "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" owner.address)"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    transfer"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id)"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// But they could upgrade the function to have the same signature"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// so it looks like it is doing the same thing, but they could also drain a little bit"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// of FLOW from the user's vault, a totally separate piece of the account that"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// should not be accessible in this function"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// BAD"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" transferNFT"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", owner: "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"auth"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Storage"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") &"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Account"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    assert"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"owner"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id) "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=="}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" owner.address)"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    transfer"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id)"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Sneakily borrow a reference to the user's Flow Token Vault"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // and withdraw a bit of FLOW"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // BAD"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" vaultRef = owner.borrow"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"&"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"FlowToken"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Vault"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"flowTokenVault)"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" stolenTokens "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" vaultRef."}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"withdraw"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(amount: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0.1"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // deposit the stolen funds in the contract owners vault"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // BAD"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    contractVault."}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deposit"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"stolenTokens)"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})})]})})}),`
`,s.jsx(i.h3,{id:"solution",children:"Solution"}),`
`,s.jsx(i.p,{children:`Projects should find other ways to authenticate users, such as using resources and capabilities as authentication objects.
They should also expect to perform most storage and linking operations within transaction bodies
rather than inside contract utility functions.`}),`
`,s.jsxs(i.p,{children:["There are some scenarios where using an authorized account reference (",s.jsx(i.code,{children:"auth(...) &Account"}),`) is necessary,
such as a cold storage multi-sig,
but those cases are rare and should only be used if it is a very restricted subset
of account functionality that is required.`]}),`
`,s.jsx(i.h2,{id:"public-functions-and-fields-should-be-avoided",children:"Public functions and fields should be avoided"}),`
`,s.jsx(i.h3,{id:"problem-1",children:"Problem"}),`
`,s.jsx(i.p,{children:`Be sure to keep track of access modifiers when structuring your code, and make public only what should be public.
Accidentally exposed fields can be a security hole.`}),`
`,s.jsx(i.h3,{id:"solution-1",children:"Solution"}),`
`,s.jsxs(i.p,{children:[`When writing your smart contract, look at every field and function and make sure
that any functions that you don't want every user to be able to access require access through an `,s.jsx(i.a,{href:"./language/access-control.md#entitlements",children:"entitlement"})," (",s.jsx(i.code,{children:"access(E)"}),`),
or use a non-public `,s.jsx(i.a,{href:"./language/access-control",children:"access modifier"})," like ",s.jsx(i.code,{children:"access(self)"}),", ",s.jsx(i.code,{children:"access(contract)"}),", or ",s.jsx(i.code,{children:"access(account)"}),`.
Declaring a function as `,s.jsx(i.code,{children:"access(all)"})," is a deliberate design decision to allow completely open and unrestricted access to read that field or call that function and should not be taken lightly."]}),`
`,s.jsxs(i.p,{children:["The only functions that should be ",s.jsx(i.code,{children:"access(all)"})," are ",s.jsx(i.code,{children:"view"})," functions and functions the everyone should be able to access and the only fields that should be ",s.jsx(i.code,{children:"access(all)"}),` are basic types like numbers or addresses.
Complex fields like arrays, dictionaries, structs, resources, or capabilities should always be `,s.jsx(i.code,{children:"access(self)"}),"."]}),`
`,s.jsx(i.h2,{id:"capability-typed-public-fields-are-a-security-hole",children:"Capability-Typed public fields are a security hole"}),`
`,s.jsx(i.p,{children:'This is a specific case of "Public Functions And Fields Should Be Avoided", above.'}),`
`,s.jsx(i.h3,{id:"problem-2",children:"Problem"}),`
`,s.jsx(i.p,{children:`The values of public fields can be copied. Capabilities are value types,
so if they are used as a public field, anyone can copy it from the field
and call the functions that it exposes.
This almost certainly is not what you want if a capability
has been stored as a field on a contract or resource in this way.`}),`
`,s.jsx(i.h3,{id:"solution-2",children:"Solution"}),`
`,s.jsx(i.p,{children:"For public access to a capability, place it in an accounts public area so this expectation is explicit."}),`
`,s.jsx(i.h2,{id:"public-admin-resource-creation-functions-are-unsafe",children:"Public admin resource creation functions are unsafe"}),`
`,s.jsx(i.p,{children:'This is a specific case of "Public Functions And Fields Should Be Avoided", above.'}),`
`,s.jsx(i.h3,{id:"problem-3",children:"Problem"}),`
`,s.jsx(i.p,{children:`A public function on a contract that creates a resource can be called by any account.
If that resource provides access to admin functions then the creation function should not be public.`}),`
`,s.jsx(i.h3,{id:"solution-3",children:"Solution"}),`
`,s.jsx(i.p,{children:`To fix this, a single instance of that resource should be created in the contract's initializer,
and then a new creation function can be potentially included within the admin resource, if necessary.`}),`
`,s.jsx(i.h3,{id:"example-1",children:"Example"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Pseudo-code"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// BAD"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Currency"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    resource"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Admin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        fun"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" mintTokens"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Anyone in the network can call this function"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // And use the Admin resource to mint tokens"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createAdmin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Admin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        return"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-create"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Admin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// This contract makes the admin creation private and in the initializer"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// so that only the one who controls the account can mint tokens"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// GOOD"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Currency"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    resource"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Admin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        fun"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" mintTokens"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Only an admin can create new Admins"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        fun"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createAdmin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(): "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"@"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Admin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            return"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <-create"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Admin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Create a single admin resource"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" firstAdmin "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" create"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Admin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Store it in private account storage, so only the admin can use it"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        self"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"account"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".storage."}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"save"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<-"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"firstAdmin, to: "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"storage"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"currencyAdmin)"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsx(i.h2,{id:"do-not-modify-smart-contract-state-or-emit-events-in-public-struct-initializers",children:"Do not modify smart contract state or emit events in public struct initializers"}),`
`,s.jsx(i.p,{children:"This is another example of the risks of having publicly accessible parts to your smart contract."}),`
`,s.jsx(i.h3,{id:"problem-4",children:"Problem"}),`
`,s.jsx(i.p,{children:`Data structure definitions in Cadence currently must be declared as public so that they can be used by anyone.
Structs do not have the same restrictions that resources have on them,
which means that anyone can create a new instance of a struct without going through any authorization.`}),`
`,s.jsx(i.h3,{id:"solution-4",children:"Solution"}),`
`,s.jsx(i.p,{children:`Any contract state-modifying operations related to the creation of structs
should be contained in resources instead of the initializers of structs.`}),`
`,s.jsx(i.h3,{id:"example-2",children:"Example"}),`
`,s.jsxs(i.p,{children:[`This used to be a bug in the NBA Top Shot smart contract, so we'll use that as an example.
Before, when it created a new play,
`,s.jsx(i.a,{href:"https://github.com/dapperlabs/nba-smart-contracts/blob/55645478594858a6830e4ab095034068ef9753e9/contracts/TopShot.cdc#L155-L158",children:"it would initialize the play record with a struct,"}),`
which increments the number that tracks the play IDs and emits an event:`]}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Simplified Code"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// BAD"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // The Record that is used to track every unique play ID"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" nextPlayID: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt32"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    struct"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Play"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" playID: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt32"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        init"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            self"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".playID = "}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".nextPlayID"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"            // Increment the ID so that it isn't used again"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"            TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".nextPlayID = "}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".nextPlayID "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            emit"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" PlayCreated"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"self"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".playID, metadata: metadata)"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.p,{children:["This is a risk because anyone can create the ",s.jsx(i.code,{children:"Play"}),` struct as many times as they want,
which could increment the `,s.jsx(i.code,{children:"nextPlayID"})," field to the max ",s.jsx(i.code,{children:"UInt32"}),` value,
effectively preventing new plays from being created. It also would emit bogus events.`]}),`
`,s.jsxs(i.p,{children:[`This bug was fixed by
`,s.jsx(i.a,{href:"https://github.com/dapperlabs/nba-smart-contracts/blob/master/contracts/TopShot.cdc#L682-L685",children:"instead updating the contract state in the admin function"}),`
that creates the plays.`]}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Update contract state in admin resource functions"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// GOOD"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"contract"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // The Record that is used to track every unique play ID"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" nextPlayID: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt32"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    struct"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Play"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        let"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" playID: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt32"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        init"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            self"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".playID = "}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".nextPlayID"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    resource"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Admin"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"        // Protected within the private admin resource"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        access"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"        fun"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createPlay"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"            // Create the new Play"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            var"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" newPlay = "}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Play"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"            // Increment the ID so that it isn't used again"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"            TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".nextPlayID = "}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".nextPlayID "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" UInt32"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"            emit"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" PlayCreated"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: newPlay.playID, metadata: metadata)"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"            // Store it in the contract storage"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"            TopShot"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:".playDatas[newPlay.playID] = newPlay"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]})}function c(e={}){const{wrapper:i}=e.components||{};return i?s.jsx(i,{...e,children:s.jsx(n,{...e})}):n(e)}export{t as _markdown,c as default,l as frontmatter,h as structuredData,r as toc};
