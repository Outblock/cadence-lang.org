import{j as e}from"./main-BXy83AsK.js";let d=`

Core events are events emitted directly from the Flow Virtual Machine (FVM). The events have the same name on all networks and do not follow the standard naming (they have no address).

Refer to the [public key section] for more details on the information provided for account key events.

Account Created [#account-created]

Event that is emitted when a new account gets created.

Event name: \`flow.AccountCreated\`

\`\`\`cadence
access(all)
event AccountCreated(address: Address)
\`\`\`

| Field     | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| \`address\` | \`Address\` | The address of the newly created account |

Account Key Added [#account-key-added]

Event that is emitted when a key gets added to an account.

Event name: \`flow.AccountKeyAdded\`

\`\`\`cadence
access(all)
event AccountKeyAdded(
    address: Address,
    publicKey: PublicKey,
    weight: UFix64,
    hashAlgorithm: HashAlgorithm,
    keyIndex: Int
)
\`\`\`

| Field           | Type            | Description                                    |
| --------------- | --------------- | ---------------------------------------------- |
| \`address\`       | \`Address\`       | The address of the account the key is added to |
| \`publicKey\`     | \`PublicKey\`     | The public key added to the account            |
| \`weight\`        | \`UFix64\`        | Weight of the new account key                  |
| \`hashAlgorithm\` | \`HashAlgorithm\` | HashAlgorithm of the new account key           |
| \`keyIndex\`      | \`Int\`           | Index of the new account key                   |

Account Key Removed [#account-key-removed]

Event that is emitted when a key gets removed from an account.

Event name: \`flow.AccountKeyRemoved\`

\`\`\`cadence
access(all)
event AccountKeyRemoved(
    address: Address,
    publicKey: PublicKey
)
\`\`\`

| Field       | Type      | Description                                        |
| ----------- | --------- | -------------------------------------------------- |
| \`address\`   | \`Address\` | The address of the account the key is removed from |
| \`publicKey\` | \`Int\`     | Index of public key removed from the account       |

Account Contract Added [#account-contract-added]

Event that is emitted when a contract gets deployed to an account.

Event name: \`flow.AccountContractAdded\`

\`\`\`cadence
access(all)
event AccountContractAdded(
    address: Address,
    codeHash: [UInt8],
    contract: String
)
\`\`\`

| Field      | Type      | Description                                              |
| ---------- | --------- | -------------------------------------------------------- |
| \`address\`  | \`Address\` | The address of the account the contract gets deployed to |
| \`codeHash\` | \`[UInt8]\` | Hash of the contract source code                         |
| \`contract\` | \`String\`  | The name of the contract                                 |

Account Contract Updated [#account-contract-updated]

Event that is emitted when a contract gets updated on an account.

Event name: \`flow.AccountContractUpdated\`

\`\`\`cadence
access(all)
event AccountContractUpdated(
    address: Address,
    codeHash: [UInt8],
    contract: String
)
\`\`\`

| Field      | Type      | Description                                                       |
| ---------- | --------- | ----------------------------------------------------------------- |
| \`address\`  | \`Address\` | The address of the account where the updated contract is deployed |
| \`codeHash\` | \`[UInt8]\` | Hash of the contract source code                                  |
| \`contract\` | \`String\`  | The name of the contract                                          |

Account Contract Removed [#account-contract-removed]

Event that is emitted when a contract gets removed from an account.

Event name: \`flow.AccountContractRemoved\`

\`\`\`cadence
access(all)
event AccountContractRemoved(
    address: Address,
    codeHash: [UInt8],
    contract: String
)
\`\`\`

| Field      | Type      | Description                                               |
| ---------- | --------- | --------------------------------------------------------- |
| \`address\`  | \`Address\` | The address of the account the contract gets removed from |
| \`codeHash\` | \`[UInt8]\` | Hash of the contract source code                          |
| \`contract\` | \`String\`  | The name of the contract                                  |

Inbox Value Published [#inbox-value-published]

Event that is emitted when a Capability is published from an account.

Event name: \`flow.InboxValuePublished\`

\`\`\`cadence
access(all)
event InboxValuePublished(provider: Address, recipient: Address, name: String, type: Type)
\`\`\`

| Field       | Type      | Description                                  |
| ----------- | --------- | -------------------------------------------- |
| \`provider\`  | \`Address\` | The address of the publishing account        |
| \`recipient\` | \`Address\` | The address of the intended recipient        |
| \`name\`      | \`String\`  | The name associated with the published value |
| \`type\`      | \`Type\`    | The type of the published value              |

:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::

Inbox Value Unpublished [#inbox-value-unpublished]

Event that is emitted when a Capability is unpublished from an account.

Event name: \`flow.InboxValueUnpublished\`

\`\`\`cadence
access(all)
event InboxValueUnpublished(provider: Address, name: String)
\`\`\`

| Field      | Type      | Description                                  |
| ---------- | --------- | -------------------------------------------- |
| \`provider\` | \`Address\` | The address of the publishing account        |
| \`name\`     | \`String\`  | The name associated with the published value |

:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::

Inbox Value Claimed [#inbox-value-claimed]

Event that is emitted when a Capability is claimed by an account.

Event name: \`flow.InboxValueClaimed\`

\`\`\`cadence
access(all)
event InboxValueClaimed(provider: Address, recipient: Address, name: String)
\`\`\`

| Field       | Type      | Description                                  |
| ----------- | --------- | -------------------------------------------- |
| \`provider\`  | \`Address\` | The address of the publishing account        |
| \`recipient\` | \`Address\` | The address of the claiming recipient        |
| \`name\`      | \`String\`  | The name associated with the published value |

:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::

Storage Capability Controller Issued [#storage-capability-controller-issued]

Event that is emitted when a storage capability controller is created and issued to an account.

Event name: \`flow.StorageCapabilityControllerIssued\`

\`\`\`cadence
access(all)
event StorageCapabilityControllerIssued(id: UInt64, address: Address, type: Type, path: Path)
\`\`\`

| Field     | Type      | Description                                                                       |
| --------- | --------- | --------------------------------------------------------------------------------- |
| \`id\`      | \`UInt64\`  | The ID of the issued capability controller                                        |
| \`address\` | \`Address\` | The address of the account which the controller targets                           |
| \`type\`    | \`Type\`    | The kind of reference that can be obtained with capabilities from this controller |
| \`path\`    | \`Path\`    | The storage path this controller manages                                          |

Account Capability Controller Issued [#account-capability-controller-issued]

Event that is emitted when an account capability controller is created and issued to an account.

Event name: \`flow.AccountCapabilityControllerIssued\`

\`\`\`cadence
access(all)
event AccountCapabilityControllerIssued(id: UInt64, address: Address, type: Type)
\`\`\`

| Field     | Type      | Description                                                                       |
| --------- | --------- | --------------------------------------------------------------------------------- |
| \`id\`      | \`UInt64\`  | The ID of the issued capability controller                                        |
| \`address\` | \`Address\` | The address of the account which the controller targets                           |
| \`type\`    | \`Type\`    | The kind of reference that can be obtained with capabilities from this controller |

Storage Capability Controller Deleted [#storage-capability-controller-deleted]

Event that is emitted when a storage capability controller is deleted.

Event name: \`flow.StorageCapabilityControllerDeleted\`

\`\`\`cadence
access(all)
event StorageCapabilityControllerDeleted(id: UInt64, address: Address)
\`\`\`

| Field     | Type      | Description                                             |
| --------- | --------- | ------------------------------------------------------- |
| \`id\`      | \`UInt64\`  | The ID of the issued capability controller              |
| \`address\` | \`Address\` | The address of the account which the controller targets |

Account Capability Controller Deleted [#account-capability-controller-deleted]

Event that is emitted when an account capability controller is deleted.

Event name: \`flow.AccountCapabilityControllerDeleted\`

\`\`\`cadence
access(all)
event AccountCapabilityControllerDeleted(id: UInt64, address: Address)
\`\`\`

| Field     | Type      | Description                                             |
| --------- | --------- | ------------------------------------------------------- |
| \`id\`      | \`UInt64\`  | The ID of the issued capability controller              |
| \`address\` | \`Address\` | The address of the account which the controller targets |

Storage Capability Controller Target Changed [#storage-capability-controller-target-changed]

Event that is emitted when a storage capability controller's path is changed.

Event name: \`flow.StorageCapabilityControllerTargetChanged\`

\`\`\`cadence
access(all)
event StorageCapabilityControllerTargetChanged(id: UInt64, address: Address, path: Path)
\`\`\`

| Field     | Type      | Description                                             |
| --------- | --------- | ------------------------------------------------------- |
| \`id\`      | \`UInt64\`  | The ID of the issued capability controller              |
| \`address\` | \`Address\` | The address of the account which the controller targets |
| \`path\`    | \`Path\`    | The new path this controller manages                    |

Capability Published [#capability-published]

Event that is emitted when a capability is published.

Event name: \`flow.CapabilityPublished\`

\`\`\`cadence
access(all)
event CapabilityPublished(address: Address, path: Path, capability: Capability)
\`\`\`

| Field        | Type         | Description                                             |
| ------------ | ------------ | ------------------------------------------------------- |
| \`address\`    | \`Address\`    | The address of the account which the capability targets |
| \`path\`       | \`Path\`       | The path this capability is published at                |
| \`capability\` | \`Capability\` | The published capability                                |

Capability Unpublished [#capability-unpublished]

Event that is emitted when a capability is unpublished.

Event name: \`flow.CapabilityUnpublished\`

\`\`\`cadence
access(all)
event CapabilityUnpublished(address: Address, path: Path)
\`\`\`

| Field     | Type      | Description                                              |
| --------- | --------- | -------------------------------------------------------- |
| \`address\` | \`Address\` | The address of the account which the capability targeted |
| \`path\`    | \`Path\`    | The path this capability was published at                |

{/* Relative links. Will not render on the page */}

[public key section]: ./crypto#public-keys
`,a={title:"Core Events"},c={contents:[{heading:void 0,content:"Core events are events emitted directly from the Flow Virtual Machine (FVM). The events have the same name on all networks and do not follow the standard naming (they have no address)."},{heading:void 0,content:"Refer to the [public key section] for more details on the information provided for account key events."},{heading:"account-created",content:"Event that is emitted when a new account gets created."},{heading:"account-created",content:"Event name: `flow.AccountCreated`"},{heading:"account-created",content:"Field"},{heading:"account-created",content:"Type"},{heading:"account-created",content:"Description"},{heading:"account-created",content:"`address`"},{heading:"account-created",content:"`Address`"},{heading:"account-created",content:"The address of the newly created account"},{heading:"account-key-added",content:"Event that is emitted when a key gets added to an account."},{heading:"account-key-added",content:"Event name: `flow.AccountKeyAdded`"},{heading:"account-key-added",content:"Field"},{heading:"account-key-added",content:"Type"},{heading:"account-key-added",content:"Description"},{heading:"account-key-added",content:"`address`"},{heading:"account-key-added",content:"`Address`"},{heading:"account-key-added",content:"The address of the account the key is added to"},{heading:"account-key-added",content:"`publicKey`"},{heading:"account-key-added",content:"`PublicKey`"},{heading:"account-key-added",content:"The public key added to the account"},{heading:"account-key-added",content:"`weight`"},{heading:"account-key-added",content:"`UFix64`"},{heading:"account-key-added",content:"Weight of the new account key"},{heading:"account-key-added",content:"`hashAlgorithm`"},{heading:"account-key-added",content:"`HashAlgorithm`"},{heading:"account-key-added",content:"HashAlgorithm of the new account key"},{heading:"account-key-added",content:"`keyIndex`"},{heading:"account-key-added",content:"`Int`"},{heading:"account-key-added",content:"Index of the new account key"},{heading:"account-key-removed",content:"Event that is emitted when a key gets removed from an account."},{heading:"account-key-removed",content:"Event name: `flow.AccountKeyRemoved`"},{heading:"account-key-removed",content:"Field"},{heading:"account-key-removed",content:"Type"},{heading:"account-key-removed",content:"Description"},{heading:"account-key-removed",content:"`address`"},{heading:"account-key-removed",content:"`Address`"},{heading:"account-key-removed",content:"The address of the account the key is removed from"},{heading:"account-key-removed",content:"`publicKey`"},{heading:"account-key-removed",content:"`Int`"},{heading:"account-key-removed",content:"Index of public key removed from the account"},{heading:"account-contract-added",content:"Event that is emitted when a contract gets deployed to an account."},{heading:"account-contract-added",content:"Event name: `flow.AccountContractAdded`"},{heading:"account-contract-added",content:"Field"},{heading:"account-contract-added",content:"Type"},{heading:"account-contract-added",content:"Description"},{heading:"account-contract-added",content:"`address`"},{heading:"account-contract-added",content:"`Address`"},{heading:"account-contract-added",content:"The address of the account the contract gets deployed to"},{heading:"account-contract-added",content:"`codeHash`"},{heading:"account-contract-added",content:"`[UInt8]`"},{heading:"account-contract-added",content:"Hash of the contract source code"},{heading:"account-contract-added",content:"`contract`"},{heading:"account-contract-added",content:"`String`"},{heading:"account-contract-added",content:"The name of the contract"},{heading:"account-contract-updated",content:"Event that is emitted when a contract gets updated on an account."},{heading:"account-contract-updated",content:"Event name: `flow.AccountContractUpdated`"},{heading:"account-contract-updated",content:"Field"},{heading:"account-contract-updated",content:"Type"},{heading:"account-contract-updated",content:"Description"},{heading:"account-contract-updated",content:"`address`"},{heading:"account-contract-updated",content:"`Address`"},{heading:"account-contract-updated",content:"The address of the account where the updated contract is deployed"},{heading:"account-contract-updated",content:"`codeHash`"},{heading:"account-contract-updated",content:"`[UInt8]`"},{heading:"account-contract-updated",content:"Hash of the contract source code"},{heading:"account-contract-updated",content:"`contract`"},{heading:"account-contract-updated",content:"`String`"},{heading:"account-contract-updated",content:"The name of the contract"},{heading:"account-contract-removed",content:"Event that is emitted when a contract gets removed from an account."},{heading:"account-contract-removed",content:"Event name: `flow.AccountContractRemoved`"},{heading:"account-contract-removed",content:"Field"},{heading:"account-contract-removed",content:"Type"},{heading:"account-contract-removed",content:"Description"},{heading:"account-contract-removed",content:"`address`"},{heading:"account-contract-removed",content:"`Address`"},{heading:"account-contract-removed",content:"The address of the account the contract gets removed from"},{heading:"account-contract-removed",content:"`codeHash`"},{heading:"account-contract-removed",content:"`[UInt8]`"},{heading:"account-contract-removed",content:"Hash of the contract source code"},{heading:"account-contract-removed",content:"`contract`"},{heading:"account-contract-removed",content:"`String`"},{heading:"account-contract-removed",content:"The name of the contract"},{heading:"inbox-value-published",content:"Event that is emitted when a Capability is published from an account."},{heading:"inbox-value-published",content:"Event name: `flow.InboxValuePublished`"},{heading:"inbox-value-published",content:"Field"},{heading:"inbox-value-published",content:"Type"},{heading:"inbox-value-published",content:"Description"},{heading:"inbox-value-published",content:"`provider`"},{heading:"inbox-value-published",content:"`Address`"},{heading:"inbox-value-published",content:"The address of the publishing account"},{heading:"inbox-value-published",content:"`recipient`"},{heading:"inbox-value-published",content:"`Address`"},{heading:"inbox-value-published",content:"The address of the intended recipient"},{heading:"inbox-value-published",content:"`name`"},{heading:"inbox-value-published",content:"`String`"},{heading:"inbox-value-published",content:"The name associated with the published value"},{heading:"inbox-value-published",content:"`type`"},{heading:"inbox-value-published",content:"`Type`"},{heading:"inbox-value-published",content:"The type of the published value"},{heading:"inbox-value-published",content:`:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::`},{heading:"inbox-value-unpublished",content:"Event that is emitted when a Capability is unpublished from an account."},{heading:"inbox-value-unpublished",content:"Event name: `flow.InboxValueUnpublished`"},{heading:"inbox-value-unpublished",content:"Field"},{heading:"inbox-value-unpublished",content:"Type"},{heading:"inbox-value-unpublished",content:"Description"},{heading:"inbox-value-unpublished",content:"`provider`"},{heading:"inbox-value-unpublished",content:"`Address`"},{heading:"inbox-value-unpublished",content:"The address of the publishing account"},{heading:"inbox-value-unpublished",content:"`name`"},{heading:"inbox-value-unpublished",content:"`String`"},{heading:"inbox-value-unpublished",content:"The name associated with the published value"},{heading:"inbox-value-unpublished",content:`:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::`},{heading:"inbox-value-claimed",content:"Event that is emitted when a Capability is claimed by an account."},{heading:"inbox-value-claimed",content:"Event name: `flow.InboxValueClaimed`"},{heading:"inbox-value-claimed",content:"Field"},{heading:"inbox-value-claimed",content:"Type"},{heading:"inbox-value-claimed",content:"Description"},{heading:"inbox-value-claimed",content:"`provider`"},{heading:"inbox-value-claimed",content:"`Address`"},{heading:"inbox-value-claimed",content:"The address of the publishing account"},{heading:"inbox-value-claimed",content:"`recipient`"},{heading:"inbox-value-claimed",content:"`Address`"},{heading:"inbox-value-claimed",content:"The address of the claiming recipient"},{heading:"inbox-value-claimed",content:"`name`"},{heading:"inbox-value-claimed",content:"`String`"},{heading:"inbox-value-claimed",content:"The name associated with the published value"},{heading:"inbox-value-claimed",content:`:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::`},{heading:"storage-capability-controller-issued",content:"Event that is emitted when a storage capability controller is created and issued to an account."},{heading:"storage-capability-controller-issued",content:"Event name: `flow.StorageCapabilityControllerIssued`"},{heading:"storage-capability-controller-issued",content:"Field"},{heading:"storage-capability-controller-issued",content:"Type"},{heading:"storage-capability-controller-issued",content:"Description"},{heading:"storage-capability-controller-issued",content:"`id`"},{heading:"storage-capability-controller-issued",content:"`UInt64`"},{heading:"storage-capability-controller-issued",content:"The ID of the issued capability controller"},{heading:"storage-capability-controller-issued",content:"`address`"},{heading:"storage-capability-controller-issued",content:"`Address`"},{heading:"storage-capability-controller-issued",content:"The address of the account which the controller targets"},{heading:"storage-capability-controller-issued",content:"`type`"},{heading:"storage-capability-controller-issued",content:"`Type`"},{heading:"storage-capability-controller-issued",content:"The kind of reference that can be obtained with capabilities from this controller"},{heading:"storage-capability-controller-issued",content:"`path`"},{heading:"storage-capability-controller-issued",content:"`Path`"},{heading:"storage-capability-controller-issued",content:"The storage path this controller manages"},{heading:"account-capability-controller-issued",content:"Event that is emitted when an account capability controller is created and issued to an account."},{heading:"account-capability-controller-issued",content:"Event name: `flow.AccountCapabilityControllerIssued`"},{heading:"account-capability-controller-issued",content:"Field"},{heading:"account-capability-controller-issued",content:"Type"},{heading:"account-capability-controller-issued",content:"Description"},{heading:"account-capability-controller-issued",content:"`id`"},{heading:"account-capability-controller-issued",content:"`UInt64`"},{heading:"account-capability-controller-issued",content:"The ID of the issued capability controller"},{heading:"account-capability-controller-issued",content:"`address`"},{heading:"account-capability-controller-issued",content:"`Address`"},{heading:"account-capability-controller-issued",content:"The address of the account which the controller targets"},{heading:"account-capability-controller-issued",content:"`type`"},{heading:"account-capability-controller-issued",content:"`Type`"},{heading:"account-capability-controller-issued",content:"The kind of reference that can be obtained with capabilities from this controller"},{heading:"storage-capability-controller-deleted",content:"Event that is emitted when a storage capability controller is deleted."},{heading:"storage-capability-controller-deleted",content:"Event name: `flow.StorageCapabilityControllerDeleted`"},{heading:"storage-capability-controller-deleted",content:"Field"},{heading:"storage-capability-controller-deleted",content:"Type"},{heading:"storage-capability-controller-deleted",content:"Description"},{heading:"storage-capability-controller-deleted",content:"`id`"},{heading:"storage-capability-controller-deleted",content:"`UInt64`"},{heading:"storage-capability-controller-deleted",content:"The ID of the issued capability controller"},{heading:"storage-capability-controller-deleted",content:"`address`"},{heading:"storage-capability-controller-deleted",content:"`Address`"},{heading:"storage-capability-controller-deleted",content:"The address of the account which the controller targets"},{heading:"account-capability-controller-deleted",content:"Event that is emitted when an account capability controller is deleted."},{heading:"account-capability-controller-deleted",content:"Event name: `flow.AccountCapabilityControllerDeleted`"},{heading:"account-capability-controller-deleted",content:"Field"},{heading:"account-capability-controller-deleted",content:"Type"},{heading:"account-capability-controller-deleted",content:"Description"},{heading:"account-capability-controller-deleted",content:"`id`"},{heading:"account-capability-controller-deleted",content:"`UInt64`"},{heading:"account-capability-controller-deleted",content:"The ID of the issued capability controller"},{heading:"account-capability-controller-deleted",content:"`address`"},{heading:"account-capability-controller-deleted",content:"`Address`"},{heading:"account-capability-controller-deleted",content:"The address of the account which the controller targets"},{heading:"storage-capability-controller-target-changed",content:"Event that is emitted when a storage capability controller's path is changed."},{heading:"storage-capability-controller-target-changed",content:"Event name: `flow.StorageCapabilityControllerTargetChanged`"},{heading:"storage-capability-controller-target-changed",content:"Field"},{heading:"storage-capability-controller-target-changed",content:"Type"},{heading:"storage-capability-controller-target-changed",content:"Description"},{heading:"storage-capability-controller-target-changed",content:"`id`"},{heading:"storage-capability-controller-target-changed",content:"`UInt64`"},{heading:"storage-capability-controller-target-changed",content:"The ID of the issued capability controller"},{heading:"storage-capability-controller-target-changed",content:"`address`"},{heading:"storage-capability-controller-target-changed",content:"`Address`"},{heading:"storage-capability-controller-target-changed",content:"The address of the account which the controller targets"},{heading:"storage-capability-controller-target-changed",content:"`path`"},{heading:"storage-capability-controller-target-changed",content:"`Path`"},{heading:"storage-capability-controller-target-changed",content:"The new path this controller manages"},{heading:"capability-published",content:"Event that is emitted when a capability is published."},{heading:"capability-published",content:"Event name: `flow.CapabilityPublished`"},{heading:"capability-published",content:"Field"},{heading:"capability-published",content:"Type"},{heading:"capability-published",content:"Description"},{heading:"capability-published",content:"`address`"},{heading:"capability-published",content:"`Address`"},{heading:"capability-published",content:"The address of the account which the capability targets"},{heading:"capability-published",content:"`path`"},{heading:"capability-published",content:"`Path`"},{heading:"capability-published",content:"The path this capability is published at"},{heading:"capability-published",content:"`capability`"},{heading:"capability-published",content:"`Capability`"},{heading:"capability-published",content:"The published capability"},{heading:"capability-unpublished",content:"Event that is emitted when a capability is unpublished."},{heading:"capability-unpublished",content:"Event name: `flow.CapabilityUnpublished`"},{heading:"capability-unpublished",content:"Field"},{heading:"capability-unpublished",content:"Type"},{heading:"capability-unpublished",content:"Description"},{heading:"capability-unpublished",content:"`address`"},{heading:"capability-unpublished",content:"`Address`"},{heading:"capability-unpublished",content:"The address of the account which the capability targeted"},{heading:"capability-unpublished",content:"`path`"},{heading:"capability-unpublished",content:"`Path`"},{heading:"capability-unpublished",content:"The path this capability was published at"}],headings:[{id:"account-created",content:"Account Created"},{id:"account-key-added",content:"Account Key Added"},{id:"account-key-removed",content:"Account Key Removed"},{id:"account-contract-added",content:"Account Contract Added"},{id:"account-contract-updated",content:"Account Contract Updated"},{id:"account-contract-removed",content:"Account Contract Removed"},{id:"inbox-value-published",content:"Inbox Value Published"},{id:"inbox-value-unpublished",content:"Inbox Value Unpublished"},{id:"inbox-value-claimed",content:"Inbox Value Claimed"},{id:"storage-capability-controller-issued",content:"Storage Capability Controller Issued"},{id:"account-capability-controller-issued",content:"Account Capability Controller Issued"},{id:"storage-capability-controller-deleted",content:"Storage Capability Controller Deleted"},{id:"account-capability-controller-deleted",content:"Account Capability Controller Deleted"},{id:"storage-capability-controller-target-changed",content:"Storage Capability Controller Target Changed"},{id:"capability-published",content:"Capability Published"},{id:"capability-unpublished",content:"Capability Unpublished"}]};const h=[{depth:3,url:"#account-created",title:e.jsx(e.Fragment,{children:"Account Created"})},{depth:3,url:"#account-key-added",title:e.jsx(e.Fragment,{children:"Account Key Added"})},{depth:3,url:"#account-key-removed",title:e.jsx(e.Fragment,{children:"Account Key Removed"})},{depth:3,url:"#account-contract-added",title:e.jsx(e.Fragment,{children:"Account Contract Added"})},{depth:3,url:"#account-contract-updated",title:e.jsx(e.Fragment,{children:"Account Contract Updated"})},{depth:3,url:"#account-contract-removed",title:e.jsx(e.Fragment,{children:"Account Contract Removed"})},{depth:3,url:"#inbox-value-published",title:e.jsx(e.Fragment,{children:"Inbox Value Published"})},{depth:3,url:"#inbox-value-unpublished",title:e.jsx(e.Fragment,{children:"Inbox Value Unpublished"})},{depth:3,url:"#inbox-value-claimed",title:e.jsx(e.Fragment,{children:"Inbox Value Claimed"})},{depth:3,url:"#storage-capability-controller-issued",title:e.jsx(e.Fragment,{children:"Storage Capability Controller Issued"})},{depth:3,url:"#account-capability-controller-issued",title:e.jsx(e.Fragment,{children:"Account Capability Controller Issued"})},{depth:3,url:"#storage-capability-controller-deleted",title:e.jsx(e.Fragment,{children:"Storage Capability Controller Deleted"})},{depth:3,url:"#account-capability-controller-deleted",title:e.jsx(e.Fragment,{children:"Account Capability Controller Deleted"})},{depth:3,url:"#storage-capability-controller-target-changed",title:e.jsx(e.Fragment,{children:"Storage Capability Controller Target Changed"})},{depth:3,url:"#capability-published",title:e.jsx(e.Fragment,{children:"Capability Published"})},{depth:3,url:"#capability-unpublished",title:e.jsx(e.Fragment,{children:"Capability Unpublished"})}];function n(t){const i={a:"a",code:"code",h3:"h3",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.p,{children:"Core events are events emitted directly from the Flow Virtual Machine (FVM). The events have the same name on all networks and do not follow the standard naming (they have no address)."}),`
`,e.jsxs(i.p,{children:["Refer to the ",e.jsx(i.a,{href:"./crypto#public-keys",children:"public key section"})," for more details on the information provided for account key events."]}),`
`,e.jsx(i.h3,{id:"account-created",children:"Account Created"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a new account gets created."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.AccountCreated"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" AccountCreated"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsx(i.tbody,{children:e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the newly created account"})]})})]}),`
`,e.jsx(i.h3,{id:"account-key-added",children:"Account Key Added"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a key gets added to an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.AccountKeyAdded"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" AccountKeyAdded"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    publicKey: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    weight: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    hashAlgorithm: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    keyIndex: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account the key is added to"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"publicKey"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"PublicKey"})}),e.jsx(i.td,{children:"The public key added to the account"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"weight"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"UFix64"})}),e.jsx(i.td,{children:"Weight of the new account key"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"hashAlgorithm"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"HashAlgorithm"})}),e.jsx(i.td,{children:"HashAlgorithm of the new account key"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"keyIndex"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Int"})}),e.jsx(i.td,{children:"Index of the new account key"})]})]})]}),`
`,e.jsx(i.h3,{id:"account-key-removed",children:"Account Key Removed"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a key gets removed from an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.AccountKeyRemoved"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" AccountKeyRemoved"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    publicKey: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account the key is removed from"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"publicKey"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Int"})}),e.jsx(i.td,{children:"Index of public key removed from the account"})]})]})]}),`
`,e.jsx(i.h3,{id:"account-contract-added",children:"Account Contract Added"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a contract gets deployed to an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.AccountContractAdded"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" AccountContractAdded"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    codeHash: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    contract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account the contract gets deployed to"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"codeHash"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"[UInt8]"})}),e.jsx(i.td,{children:"Hash of the contract source code"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"contract"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"String"})}),e.jsx(i.td,{children:"The name of the contract"})]})]})]}),`
`,e.jsx(i.h3,{id:"account-contract-updated",children:"Account Contract Updated"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a contract gets updated on an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.AccountContractUpdated"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" AccountContractUpdated"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    codeHash: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    contract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account where the updated contract is deployed"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"codeHash"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"[UInt8]"})}),e.jsx(i.td,{children:"Hash of the contract source code"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"contract"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"String"})}),e.jsx(i.td,{children:"The name of the contract"})]})]})]}),`
`,e.jsx(i.h3,{id:"account-contract-removed",children:"Account Contract Removed"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a contract gets removed from an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.AccountContractRemoved"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" AccountContractRemoved"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    codeHash: ["}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    contract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account the contract gets removed from"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"codeHash"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"[UInt8]"})}),e.jsx(i.td,{children:"Hash of the contract source code"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"contract"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"String"})}),e.jsx(i.td,{children:"The name of the contract"})]})]})]}),`
`,e.jsx(i.h3,{id:"inbox-value-published",children:"Inbox Value Published"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a Capability is published from an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.InboxValuePublished"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InboxValuePublished"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(provider: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", recipient: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", name: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", type: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Type"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"provider"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the publishing account"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"recipient"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the intended recipient"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"name"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"String"})}),e.jsx(i.td,{children:"The name associated with the published value"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"type"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Type"})}),e.jsx(i.td,{children:"The type of the published value"})]})]})]}),`
`,e.jsx(i.p,{children:`:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::`}),`
`,e.jsx(i.h3,{id:"inbox-value-unpublished",children:"Inbox Value Unpublished"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a Capability is unpublished from an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.InboxValueUnpublished"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InboxValueUnpublished"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(provider: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", name: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"provider"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the publishing account"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"name"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"String"})}),e.jsx(i.td,{children:"The name associated with the published value"})]})]})]}),`
`,e.jsx(i.p,{children:`:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::`}),`
`,e.jsx(i.h3,{id:"inbox-value-claimed",children:"Inbox Value Claimed"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a Capability is claimed by an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.InboxValueClaimed"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" InboxValueClaimed"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(provider: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", recipient: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", name: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"provider"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the publishing account"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"recipient"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the claiming recipient"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"name"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"String"})}),e.jsx(i.td,{children:"The name associated with the published value"})]})]})]}),`
`,e.jsx(i.p,{children:`:::tip
To reduce the potential for spam, we recommend that user agents that display events do not display this event as-is to their users, and allow users to restrict whom they see events from.
:::`}),`
`,e.jsx(i.h3,{id:"storage-capability-controller-issued",children:"Storage Capability Controller Issued"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a storage capability controller is created and issued to an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.StorageCapabilityControllerIssued"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" StorageCapabilityControllerIssued"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", type: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Type"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", path: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Path"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"id"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"UInt64"})}),e.jsx(i.td,{children:"The ID of the issued capability controller"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account which the controller targets"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"type"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Type"})}),e.jsx(i.td,{children:"The kind of reference that can be obtained with capabilities from this controller"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"path"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Path"})}),e.jsx(i.td,{children:"The storage path this controller manages"})]})]})]}),`
`,e.jsx(i.h3,{id:"account-capability-controller-issued",children:"Account Capability Controller Issued"}),`
`,e.jsx(i.p,{children:"Event that is emitted when an account capability controller is created and issued to an account."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.AccountCapabilityControllerIssued"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" AccountCapabilityControllerIssued"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", type: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Type"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"id"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"UInt64"})}),e.jsx(i.td,{children:"The ID of the issued capability controller"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account which the controller targets"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"type"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Type"})}),e.jsx(i.td,{children:"The kind of reference that can be obtained with capabilities from this controller"})]})]})]}),`
`,e.jsx(i.h3,{id:"storage-capability-controller-deleted",children:"Storage Capability Controller Deleted"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a storage capability controller is deleted."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.StorageCapabilityControllerDeleted"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" StorageCapabilityControllerDeleted"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"id"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"UInt64"})}),e.jsx(i.td,{children:"The ID of the issued capability controller"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account which the controller targets"})]})]})]}),`
`,e.jsx(i.h3,{id:"account-capability-controller-deleted",children:"Account Capability Controller Deleted"}),`
`,e.jsx(i.p,{children:"Event that is emitted when an account capability controller is deleted."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.AccountCapabilityControllerDeleted"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" AccountCapabilityControllerDeleted"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"id"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"UInt64"})}),e.jsx(i.td,{children:"The ID of the issued capability controller"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account which the controller targets"})]})]})]}),`
`,e.jsx(i.h3,{id:"storage-capability-controller-target-changed",children:"Storage Capability Controller Target Changed"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a storage capability controller's path is changed."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.StorageCapabilityControllerTargetChanged"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" StorageCapabilityControllerTargetChanged"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(id: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", path: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Path"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"id"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"UInt64"})}),e.jsx(i.td,{children:"The ID of the issued capability controller"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account which the controller targets"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"path"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Path"})}),e.jsx(i.td,{children:"The new path this controller manages"})]})]})]}),`
`,e.jsx(i.h3,{id:"capability-published",children:"Capability Published"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a capability is published."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.CapabilityPublished"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" CapabilityPublished"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", path: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Path"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", capability: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Capability"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account which the capability targets"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"path"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Path"})}),e.jsx(i.td,{children:"The path this capability is published at"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"capability"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Capability"})}),e.jsx(i.td,{children:"The published capability"})]})]})]}),`
`,e.jsx(i.h3,{id:"capability-unpublished",children:"Capability Unpublished"}),`
`,e.jsx(i.p,{children:"Event that is emitted when a capability is unpublished."}),`
`,e.jsxs(i.p,{children:["Event name: ",e.jsx(i.code,{children:"flow.CapabilityUnpublished"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"event"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" CapabilityUnpublished"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(address: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Address"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", path: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Path"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})]})})}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Type"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"address"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Address"})}),e.jsx(i.td,{children:"The address of the account which the capability targeted"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"path"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"Path"})}),e.jsx(i.td,{children:"The path this capability was published at"})]})]})]}),`
`]})}function l(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(n,{...t})}):n(t)}export{d as _markdown,l as default,a as frontmatter,c as structuredData,h as toc};
