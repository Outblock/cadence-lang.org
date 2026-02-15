---
name: cadence-token-development
description: Build NFTs and fungible tokens on Flow — resource-based patterns, collection setup, minting, transfers, and production standards.
---

# Cadence Token Development

Practical guide to building NFTs and fungible tokens on Flow using Cadence's resource model. Every token is a resource with enforced ownership and scarcity.

## When to Use

- Creating NFT contracts or collections
- Building fungible token (FT) contracts
- Writing mint, transfer, or setup transactions
- Implementing the Flow NFT or FT standards

## Documentation

- NFT Tutorial: https://cadence-lang.org/docs/tutorial/non-fungible-tokens-1
- FT Tutorial: https://cadence-lang.org/docs/tutorial/fungible-tokens
- Flow NFT Standard: https://github.com/onflow/flow-nft
- Flow FT Standard: https://github.com/onflow/flow-ft

---

## NFT Contract Pattern

```cadence
access(all) contract BasicNFT {

    access(all) var totalSupply: UInt64
    access(all) event Minted(id: UInt64)
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)

    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath

    access(all) entitlement Withdraw

    access(all) resource NFT {
        access(all) let id: UInt64
        access(all) let metadata: {String: String}

        init(metadata: {String: String}) {
            self.id = self.uuid
            self.metadata = metadata
            BasicNFT.totalSupply = BasicNFT.totalSupply + 1
            emit Minted(id: self.id)
        }
    }

    access(all) resource Collection {
        access(self) var ownedNFTs: @{UInt64: NFT}

        access(all) fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        access(all) view fun borrowNFT(_ id: UInt64): &NFT? {
            return &self.ownedNFTs[id]
        }

        access(all) fun deposit(token: @NFT) {
            emit Deposit(id: token.id, to: self.owner?.address)
            self.ownedNFTs[token.id] <-! token
        }

        access(Withdraw) fun withdraw(id: UInt64): @NFT {
            let token <- self.ownedNFTs.remove(key: id)
                ?? panic("NFT not found in collection")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <- token
        }

        init() { self.ownedNFTs <- {} }
    }

    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    init() {
        self.totalSupply = 0
        self.CollectionStoragePath = /storage/basicNFTCollection
        self.CollectionPublicPath = /public/basicNFTCollection
    }
}
```

## NFT Setup Transaction (User)

```cadence
import BasicNFT from 0x01

transaction {
    prepare(signer: auth(SaveValue, PublishCapability, IssueStorageCapabilityController) &Account) {
        if signer.storage.type(at: BasicNFT.CollectionStoragePath) != nil { return }

        signer.storage.save(<- BasicNFT.createEmptyCollection(), to: BasicNFT.CollectionStoragePath)

        let cap = signer.capabilities.storage
            .issue<&BasicNFT.Collection>(BasicNFT.CollectionStoragePath)
        signer.capabilities.publish(cap, at: BasicNFT.CollectionPublicPath)
    }
}
```

## Mint Transaction

```cadence
import BasicNFT from 0x01

transaction(recipient: Address, name: String) {
    execute {
        let nft <- create BasicNFT.NFT(metadata: {"name": name})
        let receiver = getAccount(recipient).capabilities
            .borrow<&BasicNFT.Collection>(BasicNFT.CollectionPublicPath)
            ?? panic("Recipient has no collection")
        receiver.deposit(token: <- nft)
    }
}
```

## Transfer Transaction

```cadence
import BasicNFT from 0x01

transaction(recipient: Address, nftID: UInt64) {
    let withdrawRef: auth(BasicNFT.Withdraw) &BasicNFT.Collection
    let depositRef: &BasicNFT.Collection

    prepare(signer: auth(BorrowValue) &Account) {
        self.withdrawRef = signer.storage
            .borrow<auth(BasicNFT.Withdraw) &BasicNFT.Collection>(
                from: BasicNFT.CollectionStoragePath
            ) ?? panic("No collection")
        self.depositRef = getAccount(recipient).capabilities
            .borrow<&BasicNFT.Collection>(BasicNFT.CollectionPublicPath)
            ?? panic("Recipient has no collection")
    }

    execute {
        self.depositRef.deposit(token: <- self.withdrawRef.withdraw(id: nftID))
    }
}
```

## Query Script

```cadence
import BasicNFT from 0x01

access(all) fun main(address: Address): [UInt64] {
    return getAccount(address).capabilities
        .borrow<&BasicNFT.Collection>(BasicNFT.CollectionPublicPath)
        ?.getIDs() ?? []
}
```

---

## Fungible Token Pattern

```cadence
access(all) contract BasicToken {
    access(all) var totalSupply: UFix64
    access(all) entitlement Withdraw

    access(all) resource Vault {
        access(all) var balance: UFix64

        init(balance: UFix64) { self.balance = balance }

        access(all) fun deposit(from: @Vault) {
            self.balance = self.balance + from.balance
            from.balance = 0.0
            destroy from
        }

        access(Withdraw) fun withdraw(amount: UFix64): @Vault {
            pre { self.balance >= amount: "Insufficient balance" }
            self.balance = self.balance - amount
            return <- create Vault(balance: amount)
        }
    }

    access(all) fun createEmptyVault(): @Vault {
        return <- create Vault(balance: 0.0)
    }

    init() { self.totalSupply = 0.0 }
}
```

## Why Vaults Beat Ledgers

| Ledger Model (Solidity) | Vault Model (Cadence) |
|---|---|
| Contract stores all balances in a mapping | Each user holds their own Vault |
| Reentrancy attacks possible | Resources move atomically |
| Admin can freeze/modify any balance | Only holder can access their Vault |
| Balances are just numbers | Tokens are objects with enforced scarcity |
