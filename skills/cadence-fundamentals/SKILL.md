---
name: cadence-fundamentals
description: Complete guide to the Cadence smart contract language — resources, capabilities, transactions, contracts, and account storage on Flow.
---

# Cadence Language Fundamentals

Comprehensive reference for writing Cadence smart contracts on the Flow blockchain. Covers the core type system, resource-oriented programming, capability-based security, transactions, and account storage.

## When to Use

- Writing new Cadence smart contracts or transactions
- Reviewing Cadence code for correctness
- Migrating from Solidity to Cadence
- Understanding Flow's resource-oriented model
- Debugging Cadence type errors or access control issues

## Documentation

- Full docs: https://cadence-lang.org/docs
- LLM-optimized: https://cadence-lang.org/llms.txt
- Complete dump: https://cadence-lang.org/llms-full.txt
- Per-page markdown: append `.mdx` to any doc URL

---

## 1. Syntax & Types

### Variables

```cadence
let constant: Int = 42        // Immutable
var variable: String = "hi"   // Mutable
```

### Basic Types

| Type | Example | Notes |
|------|---------|-------|
| `Int` | `42` | Arbitrary precision |
| `UInt64` | `100` | 64-bit unsigned |
| `UFix64` | `1.5` | Fixed-point, 8 decimals |
| `Bool` | `true` | |
| `String` | `"hello"` | UTF-8 |
| `Address` | `0x1234` | Account address |
| `[T]` | `[1, 2, 3]` | Array |
| `{K: V}` | `{"a": 1}` | Dictionary |
| `T?` | `nil` | Optional |
| `@T` | | Resource type |
| `&T` | | Reference type |

### Optionals

```cadence
let maybe: Int? = nil
let result: Int = maybe ?? 0               // nil-coalescing
if let unwrapped = maybe { }               // optional binding
let forced: Int = value!                    // force-unwrap (panics if nil)
let length: Int? = maybe?.toString().length // optional chaining
```

### Functions

```cadence
access(all) fun greet(name: String, greeting: String): String {
    return "\(greeting), \(name)!"
}

// View function (read-only, no side effects)
access(all) view fun getTotal(): Int { return self.count }

// Pre/post conditions
access(all) fun withdraw(amount: UFix64): @Vault {
    pre { amount > 0.0: "Amount must be positive" }
    post { result.balance == amount: "Incorrect amount" }
}
```

### Structs vs Resources

```cadence
// Struct — copyable value type
access(all) struct Point {
    access(all) let x: Int
    access(all) let y: Int
    init(x: Int, y: Int) { self.x = x; self.y = y }
}
let p1 = Point(x: 1, y: 2)
let p2 = p1  // COPY — both exist

// Resource — unique, non-copyable
access(all) resource Token {
    access(all) let id: UInt64
    init() { self.id = self.uuid }
}
let t1 <- create Token()
let t2 <- t1  // MOVE — t1 is now invalid
```

---

## 2. Resources & Ownership

Resources are Cadence's core innovation — first-class types representing digital assets with enforced ownership.

### Rules

1. Resources exist in **one location** at a time — cannot be copied
2. Must be explicitly **moved** (`<-`), **stored**, or **destroyed**
3. Use `@` prefix in type annotations: `@NFT`, `@{String: Vault}`
4. Use `create` to instantiate, `destroy` to destroy

### Core Syntax

```cadence
// Define
access(all) resource NFT {
    access(all) let id: UInt64
    access(all) let metadata: {String: String}
    init(metadata: {String: String}) {
        self.id = self.uuid
        self.metadata = metadata
    }
}

// Create and move
let token: @NFT <- create NFT(metadata: {"name": "Rare Item"})
let newOwner <- token  // `token` now INVALID

// Function with resource parameter
access(all) fun deposit(token: @NFT) {
    // must store or destroy before function ends
    destroy token
}
deposit(token: <- newOwner)

// Resource collections
let items: @[NFT] <- []
let named: @{String: NFT} <- {}

// Force-assign to dictionary (panics if key exists)
self.ownedNFTs[token.id] <-! token
```

### Destroy & Events

```cadence
access(all) resource Vault {
    access(all) var balance: UFix64
    // Event emitted automatically on destroy
    access(all) event ResourceDestroyed(balance: UFix64 = self.balance)
    init(balance: UFix64) { self.balance = balance }
}
```

---

## 3. Access Control & Entitlements

### Access Modifiers

| Modifier | Visibility |
|----------|-----------|
| `access(all)` | Public — anyone can read/call |
| `access(self)` | Private — only within the type |
| `access(contract)` | Same contract only |
| `access(account)` | Same account only |
| `access(E)` | Requires entitlement `E` |

### Entitlements

```cadence
access(all) entitlement Withdraw
access(all) entitlement Owner

access(all) resource Vault {
    access(self) var balance: UFix64

    // Public read — safe
    access(all) view fun getBalance(): UFix64 { return self.balance }

    // Restricted — requires Withdraw entitlement
    access(Withdraw) fun withdraw(amount: UFix64): @Vault {
        self.balance = self.balance - amount
        return <- create Vault(balance: amount)
    }

    // Public write — anyone can deposit
    access(all) fun deposit(from: @Vault) {
        self.balance = self.balance + from.balance
        destroy from
    }
}
```

### References

```cadence
let ref: &NFT = &myNFT                          // basic reference
let authRef: auth(Withdraw) &Vault = &myVault    // entitled reference

// Borrow from storage
let vaultRef = signer.storage.borrow<auth(Withdraw) &Vault>(from: /storage/vault)
    ?? panic("Could not borrow")
```

---

## 4. Capabilities

Capabilities grant access to stored objects. Nothing is public by default.

```cadence
// Save to storage
signer.storage.save(<- create Vault(balance: 100.0), to: /storage/vault)

// Issue a capability (creates a controller)
let cap = signer.capabilities.storage.issue<&Vault>(/storage/vault)

// Publish for others to borrow
signer.capabilities.publish(cap, at: /public/vault)

// Borrow from a published capability
let ref = account.capabilities.borrow<&Vault>(/public/vault)
    ?? panic("Could not borrow")

// Issue entitled capability (grants specific access)
let ownerCap = signer.capabilities.storage
    .issue<auth(Withdraw) &Vault>(/storage/vault)

// Revoke via controller
let controller = signer.capabilities.storage
    .getController(byCapabilityID: capID) ?? panic("Not found")
controller.delete()
```

---

## 5. Transactions & Scripts

### Transaction Structure

```cadence
import FungibleToken from 0x01

transaction(amount: UFix64, recipient: Address) {
    let vault: auth(FungibleToken.Withdraw) &FungibleToken.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage
            .borrow<auth(FungibleToken.Withdraw) &FungibleToken.Vault>(
                from: /storage/vault
            ) ?? panic("No vault")
    }

    pre { amount > 0.0: "Amount must be positive" }

    execute {
        let tokens <- self.vault.withdraw(amount: amount)
        let receiver = getAccount(recipient).capabilities
            .borrow<&{FungibleToken.Receiver}>(/public/receiver)
            ?? panic("No receiver")
        receiver.deposit(from: <- tokens)
    }
}
```

### Phases: `prepare` → `pre` → `execute` → `post`

| Phase | Purpose |
|-------|---------|
| `prepare(signer: &Account)` | Access signer accounts |
| `pre { }` | Validate preconditions |
| `execute { }` | Perform state changes |
| `post { }` | Verify results |

### Signer Authorization

```cadence
prepare(signer: auth(Storage) &Account) { }         // read/write storage
prepare(signer: auth(BorrowValue) &Account) { }     // borrow from storage
prepare(signer: auth(Contracts) &Account) { }       // deploy/update contracts
prepare(signer: auth(Keys) &Account) { }            // manage keys
prepare(signer: auth(Capabilities) &Account) { }    // manage capabilities
```

### Scripts (read-only, free)

```cadence
access(all) fun main(address: Address): UFix64 {
    let ref = getAccount(address).capabilities
        .borrow<&{FungibleToken.Balance}>(/public/balance)
        ?? panic("No balance")
    return ref.balance
}
```

---

## 6. Contracts

```cadence
access(all) contract MyToken {
    access(all) var totalSupply: UInt64
    access(all) event TokenMinted(id: UInt64)
    access(all) let StoragePath: StoragePath
    access(all) let PublicPath: PublicPath

    access(all) resource NFT {
        access(all) let id: UInt64
        init() {
            self.id = self.uuid
            MyToken.totalSupply = MyToken.totalSupply + 1
            emit TokenMinted(id: self.id)
        }
    }

    // Initializer — runs once on deployment
    init() {
        self.totalSupply = 0
        self.StoragePath = /storage/myToken
        self.PublicPath = /public/myToken
    }
}
```

### Imports

```cadence
import FungibleToken from 0xf233dcee88fe0abe   // by address
import "FungibleToken"                           // by name (modern)
```

---

## 7. Account Storage

```cadence
// Save
signer.storage.save(<- create NFT(), to: /storage/nft)

// Borrow (non-destructive reference)
let ref = signer.storage.borrow<&NFT>(from: /storage/nft)

// Load (removes from storage)
let nft <- signer.storage.load<@NFT>(from: /storage/nft)

// Check type
let type: Type? = signer.storage.type(at: /storage/nft)

// Iterate
signer.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
    return true  // continue
})

// Account info (anyone can read)
let acct = getAccount(0x01)
acct.balance             // FLOW balance
acct.storage.used        // bytes used
acct.storage.capacity    // bytes available
```

---

## 8. Interfaces & Attachments

### Interfaces

```cadence
access(all) resource interface Provider {
    access(Withdraw) fun withdraw(amount: UFix64): @Vault {
        post { result.balance == amount }
    }
}

access(all) resource interface Receiver {
    access(all) fun deposit(from: @Vault)
}

// Restricted capability — only expose interface
let cap = signer.capabilities.storage
    .issue<&{Receiver}>(/storage/vault)
```

### Attachments (extend types you don't own)

```cadence
access(all) attachment Metadata for NFT {
    access(all) let description: String
    init(description: String) { self.description = description }
    access(all) fun getTokenID(): UInt64 { return base.id }
}

let enhanced <- attach Metadata(description: "Rare") to <- nft
let meta = enhanced[Metadata]  // &Metadata?
```

---

## Naming Conventions

- **PascalCase**: contracts, resources, structs, events, interfaces
- **camelCase**: functions, variables, parameters
- Contract paths: define as `let` fields, not hardcoded strings
