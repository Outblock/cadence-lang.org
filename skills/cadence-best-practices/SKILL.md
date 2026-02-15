---
name: cadence-best-practices
description: Security patterns, anti-patterns, design patterns, and testing for production Cadence smart contracts.
---

# Cadence Best Practices

Security rules, design patterns, anti-patterns to avoid, and testing framework for production Cadence code on Flow.

## When to Use

- Reviewing Cadence code for security issues
- Designing contract architecture
- Writing tests for Cadence contracts
- Auditing access control and entitlements

## Documentation

- Security: https://cadence-lang.org/docs/security-best-practices
- Design Patterns: https://cadence-lang.org/docs/design-patterns
- Anti-Patterns: https://cadence-lang.org/docs/anti-patterns
- Testing: https://cadence-lang.org/docs/testing-framework

---

## Security Rules

### S1: Least Privilege Access

Start all fields as `access(self)`, widen only when needed:

```cadence
access(all) resource Vault {
    access(self) var balance: UFix64                        // private field
    access(all) view fun getBalance(): UFix64 { return self.balance }  // public read
    access(Withdraw) fun withdraw(amount: UFix64): @Vault { ... }      // entitled write
}
```

### S2: Never Use `access(all)` on State-Modifying Functions

```cadence
// BAD — anyone can drain
access(all) fun withdraw(amount: UFix64): @Vault { ... }

// GOOD — requires entitlement
access(Withdraw) fun withdraw(amount: UFix64): @Vault { ... }
```

### S3: Never Pass Authorized Account References as Parameters

```cadence
// BAD — gives full storage access
access(all) fun setup(admin: auth(Storage) &Account) { ... }

// GOOD — use capabilities
access(all) fun setup(adminCap: Capability<&Admin>) { ... }
```

### S4: Validate with Pre/Post Conditions

```cadence
access(Withdraw) fun withdraw(amount: UFix64): @Vault {
    pre { amount > 0.0: "Amount must be positive" }
    pre { self.balance >= amount: "Insufficient balance" }
    post { result.balance == amount: "Incorrect withdrawal" }
    post { self.balance == before(self.balance) - amount: "Balance mismatch" }
}
```

### S5: Meaningful Panic Messages

```cadence
// BAD
let ref = cap.borrow()!

// GOOD
let ref = cap.borrow()
    ?? panic("Could not borrow Vault: capability may be revoked")
```

### S6: Private Data Is Not Secret

All blockchain data is public. `access(self)` controls programmatic access, not data visibility. Never store secrets on-chain.

---

## Design Patterns

### D1: Named Constants for Paths

```cadence
access(all) contract MyToken {
    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath
    init() {
        self.VaultStoragePath = /storage/myTokenVault
        self.VaultPublicPath = /public/myTokenVault
    }
}
```

### D2: Init Singleton (Admin Resource)

```cadence
access(all) contract MyContract {
    access(all) resource Admin {
        access(all) fun adminFunction() { }
    }
    init() {
        // Only ONE Admin ever created
        self.account.storage.save(<- create Admin(), to: /storage/admin)
    }
}
```

### D3: Check Before Setup

```cadence
transaction {
    prepare(signer: auth(SaveValue) &Account) {
        if signer.storage.type(at: /storage/vault) != nil { return }
        signer.storage.save(<- MyToken.createEmptyVault(), to: /storage/vault)
    }
}
```

### D4: Batch Reads via Scripts

```cadence
access(all) fun main(addresses: [Address]): {Address: UFix64} {
    let balances: {Address: UFix64} = {}
    for addr in addresses {
        let ref = getAccount(addr).capabilities
            .borrow<&{FungibleToken.Balance}>(/public/vault)
        balances[addr] = ref?.balance ?? 0.0
    }
    return balances
}
```

---

## Anti-Patterns

### A1: Avoid Force-Unwrap Without Context

```cadence
// BAD
let vault <- signer.storage.load<@Vault>(from: /storage/vault)!

// GOOD
let vault <- signer.storage.load<@Vault>(from: /storage/vault)
    ?? panic("No vault at /storage/vault")
```

### A2: Don't Hard-Code Addresses

```cadence
// BAD
import FungibleToken from 0xf233dcee88fe0abe

// GOOD (with flow.json aliases)
import "FungibleToken"
```

### A3: Don't Use Public Mutable Fields

```cadence
// BAD
access(all) var balance: UFix64

// GOOD
access(self) var balance: UFix64
access(Owner) fun setBalance(_ new: UFix64) { self.balance = new }
```

---

## Testing Framework

Tests are Cadence scripts using the `Test` contract, run offchain via Flow CLI.

### Structure

```cadence
import Test

access(all) let blockchain = Test.newEmulatorBlockchain()
access(all) let admin = blockchain.createAccount()

access(all) fun setup() {
    let err = blockchain.deployContract(
        name: "MyNFT",
        code: Test.readFile("../contracts/MyNFT.cdc"),
        account: admin,
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all) fun testMint() {
    let tx = Test.Transaction(
        code: Test.readFile("../transactions/mint.cdc"),
        authorizers: [admin.address],
        signers: [admin],
        arguments: ["Cool NFT"]
    )
    let result = blockchain.executeTransaction(tx)
    Test.expect(result, Test.beSucceeded())
}

access(all) fun testQuery() {
    let result = blockchain.executeScript(
        Test.readFile("../scripts/get_ids.cdc"),
        [admin.address]
    )
    let ids = result.returnValue! as! [UInt64]
    Test.assertEqual(1, ids.length)
}
```

### Assertions

```cadence
Test.assertEqual(expected, actual)
Test.assert(condition, message: "reason")
Test.expect(result, Test.beSucceeded())
Test.expect(result, Test.beFailed())
Test.expect(err, Test.beNil())
```

### Events

```cadence
let events = Test.eventsOfType(Type<MyNFT.Minted>())
Test.assertEqual(1, events.length)
```

### Running

```bash
flow test tests/my_test.cdc
flow test --cover tests/my_test.cdc
```
