import{j as i}from"./main-BXy83AsK.js";let t=`

This article provides an overview of the cryptographic primitives and operations available in Cadence.

It covers the supported hash and signature algorithms, the structure and validation of public keys, signature verification processes, and advanced features such as BLS multi-signature aggregation and key lists for multi-signature verification.

Hash algorithms [#hash-algorithms]

The built-in [enumeration] \`HashAlgorithm\` provides the set of supported hashing algorithms:

\`\`\`cadence
access(all)
enum HashAlgorithm: UInt8 {
    /// SHA2_256 is SHA-2 with a 256-bit digest (also referred to as SHA256).
    access(all)
    case SHA2_256 = 1

    /// SHA2_384 is SHA-2 with a 384-bit digest (also referred to as  SHA384).
    access(all)
    case SHA2_384 = 2

    /// SHA3_256 is SHA-3 with a 256-bit digest.
    access(all)
    case SHA3_256 = 3

    /// SHA3_384 is SHA-3 with a 384-bit digest.
    access(all)
    case SHA3_384 = 4

    /// KMAC128_BLS_BLS12_381 is an instance of KECCAK Message Authentication Code (KMAC128) mac algorithm.
    /// Although this is a MAC algorithm, KMAC is included in this list as it can be used as a hash
    /// when the key is used as a non-public customizer.
    /// KMAC128_BLS_BLS12_381 is used in particular as the hashing algorithm for the BLS signature scheme on the curve BLS12-381.
    /// It is a customized version of KMAC128 that is compatible with the hashing to curve
    /// used in BLS signatures.
    /// It is the same hasher used by signatures in the internal Flow protocol.
    access(all)
    case KMAC128_BLS_BLS12_381 = 5

    /// KECCAK_256 is the legacy Keccak algorithm with a 256-bit digest, as per the original submission to the NIST SHA3 competition.
    /// KECCAK_256 is different than SHA3 and is used by Ethereum.
    access(all)
    case KECCAK_256 = 6

    /// Returns the hash of the given data
    access(all)
    view fun hash(_ data: [UInt8]): [UInt8]

    /// Returns the hash of the given data and tag
    access(all)
    view fun hashWithTag(_ data: [UInt8], tag: string): [UInt8]
}
\`\`\`

The hash algorithms provide two ways to hash input data into digests, \`hash\` and \`hashWithTag\`.

Hashing [#hashing]

\`hash\` hashes the input data using the chosen hashing algorithm. \`KMAC\` is the only MAC algorithm on the list and configured with specific parameters (detailed in [KMAC128 for BLS]).

For example, to compute a SHA3-256 digest:

\`\`\`cadence
let data: [UInt8] = [1, 2, 3]
let digest = HashAlgorithm.SHA3_256.hash(data)
\`\`\`

Hashing with a domain tag [#hashing-with-a-domain-tag]

\`hashWithTag\` hashes the input data along with an input tag. It allows instantiating independent hashing functions customized with a domain separation tag (DST). For most of the hashing algorithms, mixing the data with the tag is done by prefixing the data with the tag and hashing the result.

* \`SHA2_256\`, \`SHA2_384\`, \`SHA3_256\`, \`SHA3_384\`, and \`KECCAK_256\`: if the tag is non-empty, the hashed message is \`bytes(tag) || data\`, where \`bytes()\` is the UTF-8 encoding of the input string, padded with zeros till 32 bytes. Therefore, tags must not exceed 32 bytes. If the tag used is empty, no data prefix is applied, and the hashed message is simply \`data\` (same as \`hash\` output).
* \`KMAC128_BLS_BLS12_381\`: See [KMAC128 for BLS] for details.

KMAC128 for BLS [#kmac128-for-bls]

\`KMAC128_BLS_BLS12_381\` is an instance of the cSHAKE-based KMAC128. Although this is a MAC algorithm, KMAC can be used as a hash when the key is used as a non-private customizer. \`KMAC128_BLS_BLS12_381\` is used in particular as the hashing algorithm for the BLS signature scheme on the curve BLS12-381. It is a customized instance of KMAC128 and is compatible with the hashing to curve used by BLS signatures. It is the same hasher used by the internal Flow protocol, and can be used to verify Flow protocol signatures on Cadence.

To define the MAC instance, \`KMAC128(customizer, key, data, length)\` is instantiated with the following parameters (as referred to by the NIST [SHA-3 Derived Functions]):

* \`customizer\` is the UTF-8 encoding of \`"H2C"\`.
* \`key\` is the UTF-8 encoding of \`"FLOW--V00-CS00-with-BLS_SIG_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"\` when \`hash\` is used. It includes the input \`tag\` when \`hashWithTag\` is used and key becomes the UTF-8 encoding of \`"FLOW-" || tag || "-V00-CS00-with-BLS_SIG_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"\`.
* \`data\` is the input data to hash.
* \`length\` is 1024 bytes.

Signature algorithms [#signature-algorithms]

The built-in [enumeration] \`SignatureAlgorithm\` provides the set of supported signature algorithms:

\`\`\`cadence
access(all)
enum SignatureAlgorithm: UInt8 {
    /// ECDSA_P256 is ECDSA on the NIST P-256 curve.
    access(all)
    case ECDSA_P256 = 1

    /// ECDSA_secp256k1 is ECDSA on the secp256k1 curve.
    access(all)
    case ECDSA_secp256k1 = 2

    /// BLS_BLS12_381 is BLS signature scheme on the BLS12-381 curve.
    /// The scheme is set-up so that signatures are in G_1 (subgroup of the curve over the prime field)
    /// while public keys are in G_2 (subgroup of the curve over the prime field extension).
    access(all)
    case BLS_BLS12_381 = 3
}
\`\`\`

Public keys [#public-keys]

\`PublicKey\` is a built-in structure that represents a cryptographic public key of a signature scheme:

\`\`\`cadence
access(all)
struct PublicKey {

    access(all)
    let publicKey: [UInt8]

    access(all)
    let signatureAlgorithm: SignatureAlgorithm

    /// Verifies a signature under the given tag, data and public key.
    /// It uses the given hash algorithm to hash the tag and data.
    access(all)
    view fun verify(
        signature: [UInt8],
        signedData: [UInt8],
        domainSeparationTag: String,
        hashAlgorithm: HashAlgorithm
    ): Bool

    /// Verifies the proof of possession of the private key.
    /// This function is only implemented if the signature algorithm
    /// of the public key is BLS (BLS_BLS12_381).
    /// If called with any other signature algorithm, the program aborts
    access(all)
    view fun verifyPoP(_ proof: [UInt8]): Bool

    // creating a PublicKey is a view operation
    access(all)
    view init()
}
\`\`\`

\`PublicKey\` supports two methods: \`verify\` and \`verifyPoP\`. \`verify\` is the [signature verification] function, while \`verifyPoP\` is covered under [BLS multi-signature].

Public key construction [#public-key-construction]

A \`PublicKey\` can be constructed using the raw key and the signing algorithm:

\`\`\`cadence
let publicKey = PublicKey(
    publicKey: "010203".decodeHex(),
    signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
)
\`\`\`

The raw key value depends on the supported signature scheme:

* \`ECDSA_P256\` and \`ECDSA_secp256k1\`: The public key is an uncompressed curve point \`(X,Y)\`, where \`X\` and \`Y\` are two prime field elements. The raw key is represented as \`byte (X) || bytes(Y)\`, where \`||\` is the concatenation operation, and \`bytes()\` is the bytes big-endian encoding left padded by zeros to the byte length of the field prime. The raw public key is 64-bytes long.

* \`BLS_BLS_12_381\`: The public key is a G\\_2 element (on the curve over the prime field extension). The encoding follows the compressed serialization defined in the [IETF draft-irtf-cfrg-pairing-friendly-curves-08]. A public key is 96-bytes long.

Public key validation [#public-key-validation]

A public key is validated at the time of creation. Only valid public keys can be created. The validation of the public key depends on the supported signature scheme:

* \`ECDSA_P256\` and \`ECDSA_secp256k1\`: The given \`X\` and \`Y\` coordinates are correctly serialized, represent valid prime field elements, and the resulting point is on the correct curve (no subgroup check needed since the cofactor of both supported curves is 1).

* \`BLS_BLS_12_381\`: The given key is correctly serialized following the compressed serialization in [IETF draft-irtf-cfrg-pairing-friendly-curves-08]. The coordinates represent valid prime field extension elements. The resulting point is on the curve, and is on the correct subgroup G\\_2. Note that the point at infinity is accepted and yields the identity public key. This identity key can be useful when aggregating multiple keys.

Since the validation happens only at the time of creation, public keys are immutable.

\`\`\`cadence
publicKey.signatureAlgorithm = SignatureAlgorithm.ECDSA_secp256k1   // Not allowed
publicKey.publicKey = []                                            // Not allowed

publicKey.publicKey[2] = 4      // No effect
\`\`\`

Invalid public keys cannot be constructed so public keys are always valid.

Signature verification [#signature-verification]

A signature can be verified using the \`verify\` function of the \`PublicKey\`:

\`\`\`cadence
let pk = PublicKey(
    publicKey: "96142CE0C5ECD869DC88C8960E286AF1CE1B29F329BA4964213934731E65A1DE480FD43EF123B9633F0A90434C6ACE0A98BB9A999231DB3F477F9D3623A6A4ED".decodeHex(),
    signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
)

let signature = "108EF718F153CFDC516D8040ABF2C8CC7AECF37C6F6EF357C31DFE1F7AC79C9D0145D1A2F08A48F1A2489A84C725D6A7AB3E842D9DC5F8FE8E659FFF5982310D".decodeHex()
let message : [UInt8] = [1, 2, 3]

let isValid = pk.verify(
    signature: signature,
    signedData: message,
    domainSeparationTag: "",
    hashAlgorithm: HashAlgorithm.SHA2_256
)
// \`isValid\` is false
\`\`\`

The inputs to \`verify\` depend on the signature scheme used, which are described in the following sections.

**ECDSA (\`ECDSA_P256\` and \`ECDSA_secp256k1\`)**

* \`signature\` expects the couple \`(r,s)\`. It is serialized as \`bytes(r) || bytes(s)\`, where \`||\` is the concatenation operation, and \`bytes()\` is the bytes big-endian encoding left padded by zeros to the byte-length of the curve order. The signature is 64 bytes long for both curves.
* \`signedData\` is the arbitrary message to verify the signature against.
* \`domainSeparationTag\` is the expected domain tag (i.e., the value that a correctly generated signature is expected to use). The domain tag prefixes the message during the signature generation or verification before the hashing step (more details in [\`hashWithTag\`]). The tag's purpose is to separate different contexts or domains so that a signature can't be re-used for a different context other than its original one. An application should define its own arbitrary domain tag value to distance its users' signatures from other applications. The application tag should be enforced for valid signature generations and verifications. See [Hashing with a domain tag] for requirements on the string value.
* \`hashAlgorithm\` is either \`SHA2_256\`, \`SHA3_256\` or \`KECCAK_256\`. It is the algorithm used to hash the message along with the given tag (see [Hashing with a domain tag]).

As noted in [\`hashWithTag\`] for \`SHA2_256\`, \`SHA3_256\`, and \`KECCAK_256\`, using an empty \`tag\` results in hashing the input data only. If a signature verification needs to be computed against data without any domain tag, an empty domain tag \`""\` should be passed.

ECDSA verification is implemented as defined in ANS X9.62 (also referred by [FIPS 186-4] and [SEC 1, Version 2.0]). A valid signature would be generated using the expected \`signedData\`, \`domainSeparationTag\`, and \`hashAlgorithm\` used to verify.

**BLS (\`BLS_BLS_12_381\`)**

* \`signature\` expects a G\\_1 point (on the curve over the prime field). The encoding follows the compressed serialization defined in the [IETF draft-irtf-cfrg-pairing-friendly-curves-08]. A signature is 48-bytes long.
* \`signedData\` is the arbitrary message to verify the signature against.
* \`domainSeparationTag\` is the expected domain tag (i.e., the value that a correctly generated signature is expected to use). The domain tag is mixed with the message during the signature generation or verification as specified in [KMAC128 for BLS]. The tag's purpose is to separate different contexts or domains so that a signature can't be re-used for a different context other than its original one. An application should define its own arbitrary domain tag value to distance its user's signatures from other applications. The application tag should be enforced for valid signature generations and verifications. All string values are valid as tags in BLS (check [KMAC128 for BLS]).
* \`hashAlgorithm\` only accepts \`KMAC128_BLS_BLS12_381\`. It is the algorithm used to hash the message along with the given tag (check [KMAC128 for BLS]).

BLS verification performs the necessary membership check on the signature, while the membership check of the public key is performed at the creation of the \`PublicKey\` object. It is not repeated during the signature verification. In order to prevent equivocation issues, a verification under the identity public key always returns \`false\`.

The verification uses a hash-to-curve algorithm to hash the \`signedData\` into a \`G_1\` point, following the \`hash_to_curve\` method described in [draft-irtf-cfrg-hash-to-curve-14]. While KMAC128 is used as a hash-to-field method resulting in two field elements, the mapping to curve is implemented using the [simplified SWU].

A valid signature should be generated using the expected \`signedData\` and \`domainSeparationTag\`, as well the same hashing to curve process.

BLS multi-signature [#bls-multi-signature]

BLS signature scheme allows efficient multi-signature features. Multiple signatures can be aggregated into a single signature, which can be verified against an aggregated public key. This allows authenticating multiple signers with a single signature verification. While BLS provides multiple aggregation techniques, Cadence supports basic aggregation tools that cover a wide list of use cases. These tools are defined in the built-in \`BLS\` contract, which does not need to be imported.

Proof of Possession (PoP) [#proof-of-possession-pop]

Multi-signature verification in BLS requires a defense against rogue public-key attacks. Multiple ways are available to protect BLS verification. Cadence provides the PoP of a private key as a defense tool. The PoP of a private key is a BLS signature over the public key itself. The PoP signature follows the same requirements of a BLS signature (detailed in [Signature verification]), except it uses a special domain separation tag. The key expected to be used in KMAC128 is the UTF-8 encoding of \`"BLS_POP_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"\`. The expected message to be signed by the PoP is the serialization of the BLS public key corresponding to the signing private key ([serialization details]). The PoP can only be verified using the \`PublicKey\` method \`verifyPoP\`.

BLS signature aggregation [#bls-signature-aggregation]

\`\`\`cadence
view fun aggregateSignatures(_ signatures: [[UInt8]]): [UInt8]?
\`\`\`

* Aggregates multiple BLS signatures into one.

Signatures can be generated from the same or distinct messages, and they can also be the aggregation of other signatures. The order of the signatures in the slice does not matter since the aggregation is commutative. There is no subgroup membership check performed on the input signatures. If the array is empty or if decoding one of the signatures fails, the program aborts.

The output signature can be verified against an aggregated public key to authenticate multiple signers at once. Since the \`verify\` method accepts a single data to verify against, it is only possible to verify multiple signatures of the same message.

BLS public key aggregation [#bls-public-key-aggregation]

\`\`\`cadence
view fun aggregatePublicKeys(_ publicKeys: [PublicKey]): PublicKey?
\`\`\`

* Aggregates multiple BLS public keys into one.

The order of the public keys in the slice does not matter since the aggregation is commutative. The input keys are guaranteed to be in the correct subgroup since subgroup membership is checked at the key creation time. If the array is empty or any of the input keys is not a BLS key, the program aborts. Note that the identity public key is a valid input to this function and it represents the identity element of aggregation.

The output public key can be used to verify aggregated signatures to authenticate multiple signers at once. Since the \`verify\` method accepts a single data to verify against, it is only possible to verify multiple signatures of the same message. The identity public key is a possible output of the function, though signature verifications against identity result in \`false\`.

In order to prevent rogue key attacks when verifying aggregated signatures, it is important to verify the [PoP] of each individual key involved in the aggregation process.

Crypto contract [#crypto-contract]

The built-in contract \`Crypto\` can be used to perform cryptographic operations. The contract can be imported using \`import Crypto\`.

Key lists [#key-lists]

The crypto contract allows creating key lists to be used for multi-signature verification.

A key list is basically a list of public keys where each public key is assigned a key index, a hash algorithm, and a weight. A list of \`KeyListSignature\` can be verified against a key list where each signature entry specifies the public key index to be used against. The list verification is successful if all signatures from the list are valid, each public key is used at most once, and the used keys weights add up to at least \`1\`.

The verification of each signature uses the Cadence single signature verification function with the key entry hash algorithm and the input domain separation tag (see [Signature verification] for more information).

It is possible to disable a public key by revoking it. The revoked keys remain in the list and retain the same index. Only signatures against non-revoked keys are considered valid.

For example, to verify two signatures with equal weights for some signed data:

\`\`\`cadence
import Crypto

access(all)
fun test main() {
    let keyList = Crypto.KeyList()

    let publicKeyA = PublicKey(
        publicKey:
            "db04940e18ec414664ccfd31d5d2d4ece3985acb8cb17a2025b2f1673427267968e52e2bbf3599059649d4b2cce98fdb8a3048e68abf5abe3e710129e90696ca".decodeHex(),
        signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
    )
    keyList.add(
        publicKeyA,
        hashAlgorithm: HashAlgorithm.SHA3_256,
        weight: 0.5
    )

    let publicKeyB = PublicKey(
        publicKey:
            "df9609ee588dd4a6f7789df8d56f03f545d4516f0c99b200d73b9a3afafc14de5d21a4fc7a2a2015719dc95c9e756cfa44f2a445151aaf42479e7120d83df956".decodeHex(),
        signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
    )
    keyList.add(
        publicKeyB,
        hashAlgorithm: HashAlgorithm.SHA3_256,
        weight: 0.5
    )

    let signatureSet = [
        Crypto.KeyListSignature(
            keyIndex: 0,
            signature:
                "8870a8cbe6f44932ba59e0d15a706214cc4ad2538deb12c0cf718d86f32c47765462a92ce2da15d4a29eb4e2b6fa05d08c7db5d5b2a2cd8c2cb98ded73da31f6".decodeHex()
        ),
        Crypto.KeyListSignature(
            keyIndex: 1,
            signature:
                "bbdc5591c3f937a730d4f6c0a6fde61a0a6ceaa531ccb367c3559335ab9734f4f2b9da8adbe371f1f7da913b5a3fdd96a871e04f078928ca89a83d841c72fadf".decodeHex()
        )
    ]

    // "foo", encoded as UTF-8, in hex representation
    let signedData = "666f6f".decodeHex()

    let isValid = keyList.verify(
        signatureSet: signatureSet,
        signedData: signedData,
        domainSeparationTag: "FLOW-V0.0-user",
    )
}
\`\`\`

The following shows the implementation details of the key list and the signature list:

\`\`\`cadence
access(all)
struct KeyListEntry {

    access(all)
    let keyIndex: Int

    access(all)
    let publicKey: PublicKey

    access(all)
    let hashAlgorithm: HashAlgorithm

    access(all)
    let weight: UFix64

    access(all)
    let isRevoked: Bool

    init(
        keyIndex: Int,
        publicKey: PublicKey,
        hashAlgorithm: HashAlgorithm,
        weight: UFix64,
        isRevoked: Bool
    )
}

access(all)
struct KeyList {

    init()

    /// Adds a new key with the given weight
    access(all)
    fun add(
        _ publicKey: PublicKey,
        hashAlgorithm: HashAlgorithm,
        weight: UFix64
    )

    /// Returns the key at the given index, if it exists.
    /// Revoked keys are always returned, but they have \`isRevoked\` field set to true
    access(all)
    fun get(keyIndex: Int): KeyListEntry?

    /// Marks the key at the given index revoked, but does not delete it
    access(all)
    fun revoke(keyIndex: Int)

    /// Returns true if the given signatures are valid for the given signed data
    /// \`domainSeparationTag\` is used to specify a scope for each signature,
    /// and is implemented the same way as \`PublicKey\`'s verify function.
    access(all)
    fun verify(
        signatureSet: [KeyListSignature],
        signedData: [UInt8],
        domainSeparationTag: String
    ): Bool
}

access(all)
struct KeyListSignature {

    access(all)
    let keyIndex: Int
    
    access(all)
    let signature: [UInt8]

    access(all)
    init(keyIndex: Int, signature: [UInt8])
}
\`\`\`

{/* Relative links. Will not render on the page */}

[\`hashWithTag\`]: #hashing-with-a-domain-tag

[BLS multi-signature]: #proof-of-possession-pop

[draft-irtf-cfrg-hash-to-curve-14]: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-14#section-3

[enumeration]: ./enumerations

[FIPS 186-4]: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf

[Hashing with a domain tag]: #hashing-with-a-domain-tag

[IETF draft-irtf-cfrg-pairing-friendly-curves-08]: https://www.ietf.org/archive/id/draft-irtf-cfrg-pairing-friendly-curves-08.html#name-point-serialization-procedu

[KMAC128 for BLS]: #kmac128-for-bls

[SEC 1, Version 2.0]: https://www.secg.org/sec1-v2.pdf

[serialization details]: #public-key-construction

[SHA-3 Derived Functions]: https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-185.pdf

[signature verification]: #signature-verification

[Signature verification]: #signature-verification

[simplified SWU]: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-14#section-6.6.3

[PoP]: #proof-of-possession-pop
`,h={title:"Crypto"},l={contents:[{heading:void 0,content:"This article provides an overview of the cryptographic primitives and operations available in Cadence."},{heading:void 0,content:"It covers the supported hash and signature algorithms, the structure and validation of public keys, signature verification processes, and advanced features such as BLS multi-signature aggregation and key lists for multi-signature verification."},{heading:"hash-algorithms",content:"The built-in [enumeration] `HashAlgorithm` provides the set of supported hashing algorithms:"},{heading:"hash-algorithms",content:"The hash algorithms provide two ways to hash input data into digests, `hash` and `hashWithTag`."},{heading:"hashing",content:"`hash` hashes the input data using the chosen hashing algorithm. `KMAC` is the only MAC algorithm on the list and configured with specific parameters (detailed in [KMAC128 for BLS])."},{heading:"hashing",content:"For example, to compute a SHA3-256 digest:"},{heading:"hashing-with-a-domain-tag",content:"`hashWithTag` hashes the input data along with an input tag. It allows instantiating independent hashing functions customized with a domain separation tag (DST). For most of the hashing algorithms, mixing the data with the tag is done by prefixing the data with the tag and hashing the result."},{heading:"hashing-with-a-domain-tag",content:"`SHA2_256`, `SHA2_384`, `SHA3_256`, `SHA3_384`, and `KECCAK_256`: if the tag is non-empty, the hashed message is `bytes(tag) || data`, where `bytes()` is the UTF-8 encoding of the input string, padded with zeros till 32 bytes. Therefore, tags must not exceed 32 bytes. If the tag used is empty, no data prefix is applied, and the hashed message is simply `data` (same as `hash` output)."},{heading:"hashing-with-a-domain-tag",content:"`KMAC128_BLS_BLS12_381`: See [KMAC128 for BLS] for details."},{heading:"kmac128-for-bls",content:"`KMAC128_BLS_BLS12_381` is an instance of the cSHAKE-based KMAC128. Although this is a MAC algorithm, KMAC can be used as a hash when the key is used as a non-private customizer. `KMAC128_BLS_BLS12_381` is used in particular as the hashing algorithm for the BLS signature scheme on the curve BLS12-381. It is a customized instance of KMAC128 and is compatible with the hashing to curve used by BLS signatures. It is the same hasher used by the internal Flow protocol, and can be used to verify Flow protocol signatures on Cadence."},{heading:"kmac128-for-bls",content:"To define the MAC instance, `KMAC128(customizer, key, data, length)` is instantiated with the following parameters (as referred to by the NIST [SHA-3 Derived Functions]):"},{heading:"kmac128-for-bls",content:'`customizer` is the UTF-8 encoding of `"H2C"`.'},{heading:"kmac128-for-bls",content:'`key` is the UTF-8 encoding of `"FLOW--V00-CS00-with-BLS_SIG_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"` when `hash` is used. It includes the input `tag` when `hashWithTag` is used and key becomes the UTF-8 encoding of `"FLOW-" || tag || "-V00-CS00-with-BLS_SIG_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"`.'},{heading:"kmac128-for-bls",content:"`data` is the input data to hash."},{heading:"kmac128-for-bls",content:"`length` is 1024 bytes."},{heading:"signature-algorithms",content:"The built-in [enumeration] `SignatureAlgorithm` provides the set of supported signature algorithms:"},{heading:"public-keys",content:"`PublicKey` is a built-in structure that represents a cryptographic public key of a signature scheme:"},{heading:"public-keys",content:"`PublicKey` supports two methods: `verify` and `verifyPoP`. `verify` is the [signature verification] function, while `verifyPoP` is covered under [BLS multi-signature]."},{heading:"public-key-construction",content:"A `PublicKey` can be constructed using the raw key and the signing algorithm:"},{heading:"public-key-construction",content:"The raw key value depends on the supported signature scheme:"},{heading:"public-key-construction",content:"`ECDSA_P256` and `ECDSA_secp256k1`: The public key is an uncompressed curve point `(X,Y)`, where `X` and `Y` are two prime field elements. The raw key is represented as `byte (X) || bytes(Y)`, where `||` is the concatenation operation, and `bytes()` is the bytes big-endian encoding left padded by zeros to the byte length of the field prime. The raw public key is 64-bytes long."},{heading:"public-key-construction",content:"`BLS_BLS_12_381`: The public key is a G\\_2 element (on the curve over the prime field extension). The encoding follows the compressed serialization defined in the [IETF draft-irtf-cfrg-pairing-friendly-curves-08]. A public key is 96-bytes long."},{heading:"public-key-validation",content:"A public key is validated at the time of creation. Only valid public keys can be created. The validation of the public key depends on the supported signature scheme:"},{heading:"public-key-validation",content:"`ECDSA_P256` and `ECDSA_secp256k1`: The given `X` and `Y` coordinates are correctly serialized, represent valid prime field elements, and the resulting point is on the correct curve (no subgroup check needed since the cofactor of both supported curves is 1)."},{heading:"public-key-validation",content:"`BLS_BLS_12_381`: The given key is correctly serialized following the compressed serialization in [IETF draft-irtf-cfrg-pairing-friendly-curves-08]. The coordinates represent valid prime field extension elements. The resulting point is on the curve, and is on the correct subgroup G\\_2. Note that the point at infinity is accepted and yields the identity public key. This identity key can be useful when aggregating multiple keys."},{heading:"public-key-validation",content:"Since the validation happens only at the time of creation, public keys are immutable."},{heading:"public-key-validation",content:"Invalid public keys cannot be constructed so public keys are always valid."},{heading:"signature-verification",content:"A signature can be verified using the `verify` function of the `PublicKey`:"},{heading:"signature-verification",content:"The inputs to `verify` depend on the signature scheme used, which are described in the following sections."},{heading:"signature-verification",content:"**ECDSA (`ECDSA_P256` and `ECDSA_secp256k1`)**"},{heading:"signature-verification",content:"`signature` expects the couple `(r,s)`. It is serialized as `bytes(r) || bytes(s)`, where `||` is the concatenation operation, and `bytes()` is the bytes big-endian encoding left padded by zeros to the byte-length of the curve order. The signature is 64 bytes long for both curves."},{heading:"signature-verification",content:"`signedData` is the arbitrary message to verify the signature against."},{heading:"signature-verification",content:"`domainSeparationTag` is the expected domain tag (i.e., the value that a correctly generated signature is expected to use). The domain tag prefixes the message during the signature generation or verification before the hashing step (more details in [`hashWithTag`]). The tag's purpose is to separate different contexts or domains so that a signature can't be re-used for a different context other than its original one. An application should define its own arbitrary domain tag value to distance its users' signatures from other applications. The application tag should be enforced for valid signature generations and verifications. See [Hashing with a domain tag] for requirements on the string value."},{heading:"signature-verification",content:"`hashAlgorithm` is either `SHA2_256`, `SHA3_256` or `KECCAK_256`. It is the algorithm used to hash the message along with the given tag (see [Hashing with a domain tag])."},{heading:"signature-verification",content:'As noted in [`hashWithTag`] for `SHA2_256`, `SHA3_256`, and `KECCAK_256`, using an empty `tag` results in hashing the input data only. If a signature verification needs to be computed against data without any domain tag, an empty domain tag `""` should be passed.'},{heading:"signature-verification",content:"ECDSA verification is implemented as defined in ANS X9.62 (also referred by [FIPS 186-4] and [SEC 1, Version 2.0]). A valid signature would be generated using the expected `signedData`, `domainSeparationTag`, and `hashAlgorithm` used to verify."},{heading:"signature-verification",content:"**BLS (`BLS_BLS_12_381`)**"},{heading:"signature-verification",content:"`signature` expects a G\\_1 point (on the curve over the prime field). The encoding follows the compressed serialization defined in the [IETF draft-irtf-cfrg-pairing-friendly-curves-08]. A signature is 48-bytes long."},{heading:"signature-verification",content:"`signedData` is the arbitrary message to verify the signature against."},{heading:"signature-verification",content:"`domainSeparationTag` is the expected domain tag (i.e., the value that a correctly generated signature is expected to use). The domain tag is mixed with the message during the signature generation or verification as specified in [KMAC128 for BLS]. The tag's purpose is to separate different contexts or domains so that a signature can't be re-used for a different context other than its original one. An application should define its own arbitrary domain tag value to distance its user's signatures from other applications. The application tag should be enforced for valid signature generations and verifications. All string values are valid as tags in BLS (check [KMAC128 for BLS])."},{heading:"signature-verification",content:"`hashAlgorithm` only accepts `KMAC128_BLS_BLS12_381`. It is the algorithm used to hash the message along with the given tag (check [KMAC128 for BLS])."},{heading:"signature-verification",content:"BLS verification performs the necessary membership check on the signature, while the membership check of the public key is performed at the creation of the `PublicKey` object. It is not repeated during the signature verification. In order to prevent equivocation issues, a verification under the identity public key always returns `false`."},{heading:"signature-verification",content:"The verification uses a hash-to-curve algorithm to hash the `signedData` into a `G_1` point, following the `hash_to_curve` method described in [draft-irtf-cfrg-hash-to-curve-14]. While KMAC128 is used as a hash-to-field method resulting in two field elements, the mapping to curve is implemented using the [simplified SWU]."},{heading:"signature-verification",content:"A valid signature should be generated using the expected `signedData` and `domainSeparationTag`, as well the same hashing to curve process."},{heading:"bls-multi-signature",content:"BLS signature scheme allows efficient multi-signature features. Multiple signatures can be aggregated into a single signature, which can be verified against an aggregated public key. This allows authenticating multiple signers with a single signature verification. While BLS provides multiple aggregation techniques, Cadence supports basic aggregation tools that cover a wide list of use cases. These tools are defined in the built-in `BLS` contract, which does not need to be imported."},{heading:"proof-of-possession-pop",content:'Multi-signature verification in BLS requires a defense against rogue public-key attacks. Multiple ways are available to protect BLS verification. Cadence provides the PoP of a private key as a defense tool. The PoP of a private key is a BLS signature over the public key itself. The PoP signature follows the same requirements of a BLS signature (detailed in [Signature verification]), except it uses a special domain separation tag. The key expected to be used in KMAC128 is the UTF-8 encoding of `"BLS_POP_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"`. The expected message to be signed by the PoP is the serialization of the BLS public key corresponding to the signing private key ([serialization details]). The PoP can only be verified using the `PublicKey` method `verifyPoP`.'},{heading:"bls-signature-aggregation",content:"Aggregates multiple BLS signatures into one."},{heading:"bls-signature-aggregation",content:"Signatures can be generated from the same or distinct messages, and they can also be the aggregation of other signatures. The order of the signatures in the slice does not matter since the aggregation is commutative. There is no subgroup membership check performed on the input signatures. If the array is empty or if decoding one of the signatures fails, the program aborts."},{heading:"bls-signature-aggregation",content:"The output signature can be verified against an aggregated public key to authenticate multiple signers at once. Since the `verify` method accepts a single data to verify against, it is only possible to verify multiple signatures of the same message."},{heading:"bls-public-key-aggregation",content:"Aggregates multiple BLS public keys into one."},{heading:"bls-public-key-aggregation",content:"The order of the public keys in the slice does not matter since the aggregation is commutative. The input keys are guaranteed to be in the correct subgroup since subgroup membership is checked at the key creation time. If the array is empty or any of the input keys is not a BLS key, the program aborts. Note that the identity public key is a valid input to this function and it represents the identity element of aggregation."},{heading:"bls-public-key-aggregation",content:"The output public key can be used to verify aggregated signatures to authenticate multiple signers at once. Since the `verify` method accepts a single data to verify against, it is only possible to verify multiple signatures of the same message. The identity public key is a possible output of the function, though signature verifications against identity result in `false`."},{heading:"bls-public-key-aggregation",content:"In order to prevent rogue key attacks when verifying aggregated signatures, it is important to verify the [PoP] of each individual key involved in the aggregation process."},{heading:"crypto-contract",content:"The built-in contract `Crypto` can be used to perform cryptographic operations. The contract can be imported using `import Crypto`."},{heading:"key-lists",content:"The crypto contract allows creating key lists to be used for multi-signature verification."},{heading:"key-lists",content:"A key list is basically a list of public keys where each public key is assigned a key index, a hash algorithm, and a weight. A list of `KeyListSignature` can be verified against a key list where each signature entry specifies the public key index to be used against. The list verification is successful if all signatures from the list are valid, each public key is used at most once, and the used keys weights add up to at least `1`."},{heading:"key-lists",content:"The verification of each signature uses the Cadence single signature verification function with the key entry hash algorithm and the input domain separation tag (see [Signature verification] for more information)."},{heading:"key-lists",content:"It is possible to disable a public key by revoking it. The revoked keys remain in the list and retain the same index. Only signatures against non-revoked keys are considered valid."},{heading:"key-lists",content:"For example, to verify two signatures with equal weights for some signed data:"},{heading:"key-lists",content:"The following shows the implementation details of the key list and the signature list:"}],headings:[{id:"hash-algorithms",content:"Hash algorithms"},{id:"hashing",content:"Hashing"},{id:"hashing-with-a-domain-tag",content:"Hashing with a domain tag"},{id:"kmac128-for-bls",content:"KMAC128 for BLS"},{id:"signature-algorithms",content:"Signature algorithms"},{id:"public-keys",content:"Public keys"},{id:"public-key-construction",content:"Public key construction"},{id:"public-key-validation",content:"Public key validation"},{id:"signature-verification",content:"Signature verification"},{id:"bls-multi-signature",content:"BLS multi-signature"},{id:"proof-of-possession-pop",content:"Proof of Possession (PoP)"},{id:"bls-signature-aggregation",content:"BLS signature aggregation"},{id:"bls-public-key-aggregation",content:"BLS public key aggregation"},{id:"crypto-contract",content:"Crypto contract"},{id:"key-lists",content:"Key lists"}]};const r=[{depth:2,url:"#hash-algorithms",title:i.jsx(i.Fragment,{children:"Hash algorithms"})},{depth:2,url:"#hashing",title:i.jsx(i.Fragment,{children:"Hashing"})},{depth:2,url:"#hashing-with-a-domain-tag",title:i.jsx(i.Fragment,{children:"Hashing with a domain tag"})},{depth:3,url:"#kmac128-for-bls",title:i.jsx(i.Fragment,{children:"KMAC128 for BLS"})},{depth:2,url:"#signature-algorithms",title:i.jsx(i.Fragment,{children:"Signature algorithms"})},{depth:2,url:"#public-keys",title:i.jsx(i.Fragment,{children:"Public keys"})},{depth:3,url:"#public-key-construction",title:i.jsx(i.Fragment,{children:"Public key construction"})},{depth:3,url:"#public-key-validation",title:i.jsx(i.Fragment,{children:"Public key validation"})},{depth:3,url:"#signature-verification",title:i.jsx(i.Fragment,{children:"Signature verification"})},{depth:2,url:"#bls-multi-signature",title:i.jsx(i.Fragment,{children:"BLS multi-signature"})},{depth:3,url:"#proof-of-possession-pop",title:i.jsx(i.Fragment,{children:"Proof of Possession (PoP)"})},{depth:3,url:"#bls-signature-aggregation",title:i.jsx(i.Fragment,{children:"BLS signature aggregation"})},{depth:3,url:"#bls-public-key-aggregation",title:i.jsx(i.Fragment,{children:"BLS public key aggregation"})},{depth:2,url:"#crypto-contract",title:i.jsx(i.Fragment,{children:"Crypto contract"})},{depth:3,url:"#key-lists",title:i.jsx(i.Fragment,{children:"Key lists"})}];function n(s){const e={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsx(e.p,{children:"This article provides an overview of the cryptographic primitives and operations available in Cadence."}),`
`,i.jsx(e.p,{children:"It covers the supported hash and signature algorithms, the structure and validation of public keys, signature verification processes, and advanced features such as BLS multi-signature aggregation and key lists for multi-signature verification."}),`
`,i.jsx(e.h2,{id:"hash-algorithms",children:"Hash algorithms"}),`
`,i.jsxs(e.p,{children:["The built-in ",i.jsx(e.a,{href:"./enumerations",children:"enumeration"})," ",i.jsx(e.code,{children:"HashAlgorithm"})," provides the set of supported hashing algorithms:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" HashAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// SHA2_256 is SHA-2 with a 256-bit digest (also referred to as SHA256)."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SHA2_256"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// SHA2_384 is SHA-2 with a 384-bit digest (also referred to as  SHA384)."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SHA2_384"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// SHA3_256 is SHA-3 with a 256-bit digest."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SHA3_256"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// SHA3_384 is SHA-3 with a 384-bit digest."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SHA3_384"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"4"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// KMAC128_BLS_BLS12_381 is an instance of KECCAK Message Authentication Code (KMAC128) mac algorithm."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Although this is a MAC algorithm, KMAC is included in this list as it can be used as a hash"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// when the key is used as a non-public customizer."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// KMAC128_BLS_BLS12_381 is used in particular as the hashing algorithm for the BLS signature scheme on the curve BLS12-381."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// It is a customized version of KMAC128 that is compatible with the hashing to curve"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// used in BLS signatures."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// It is the same hasher used by signatures in the internal Flow protocol."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" KMAC128_BLS_BLS12_381"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"5"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// KECCAK_256 is the legacy Keccak algorithm with a 256-bit digest, as per the original submission to the NIST SHA3 competition."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// KECCAK_256 is different than SHA3 and is used by Ethereum."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" KECCAK_256"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"6"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Returns the hash of the given data"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" hash"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ data: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]): ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Returns the hash of the given data and tag"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" hashWithTag"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ data: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"], tag: string): ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(e.p,{children:["The hash algorithms provide two ways to hash input data into digests, ",i.jsx(e.code,{children:"hash"})," and ",i.jsx(e.code,{children:"hashWithTag"}),"."]}),`
`,i.jsx(e.h2,{id:"hashing",children:"Hashing"}),`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"hash"})," hashes the input data using the chosen hashing algorithm. ",i.jsx(e.code,{children:"KMAC"})," is the only MAC algorithm on the list and configured with specific parameters (detailed in ",i.jsx(e.a,{href:"#kmac128-for-bls",children:"KMAC128 for BLS"}),")."]}),`
`,i.jsx(e.p,{children:"For example, to compute a SHA3-256 digest:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" data: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] = ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" digest = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SHA3_256"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hash"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(data)"})]})]})})}),`
`,i.jsx(e.h2,{id:"hashing-with-a-domain-tag",children:"Hashing with a domain tag"}),`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"hashWithTag"})," hashes the input data along with an input tag. It allows instantiating independent hashing functions customized with a domain separation tag (DST). For most of the hashing algorithms, mixing the data with the tag is done by prefixing the data with the tag and hashing the result."]}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"SHA2_256"}),", ",i.jsx(e.code,{children:"SHA2_384"}),", ",i.jsx(e.code,{children:"SHA3_256"}),", ",i.jsx(e.code,{children:"SHA3_384"}),", and ",i.jsx(e.code,{children:"KECCAK_256"}),": if the tag is non-empty, the hashed message is ",i.jsx(e.code,{children:"bytes(tag) || data"}),", where ",i.jsx(e.code,{children:"bytes()"})," is the UTF-8 encoding of the input string, padded with zeros till 32 bytes. Therefore, tags must not exceed 32 bytes. If the tag used is empty, no data prefix is applied, and the hashed message is simply ",i.jsx(e.code,{children:"data"})," (same as ",i.jsx(e.code,{children:"hash"})," output)."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"KMAC128_BLS_BLS12_381"}),": See ",i.jsx(e.a,{href:"#kmac128-for-bls",children:"KMAC128 for BLS"})," for details."]}),`
`]}),`
`,i.jsx(e.h3,{id:"kmac128-for-bls",children:"KMAC128 for BLS"}),`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"KMAC128_BLS_BLS12_381"})," is an instance of the cSHAKE-based KMAC128. Although this is a MAC algorithm, KMAC can be used as a hash when the key is used as a non-private customizer. ",i.jsx(e.code,{children:"KMAC128_BLS_BLS12_381"})," is used in particular as the hashing algorithm for the BLS signature scheme on the curve BLS12-381. It is a customized instance of KMAC128 and is compatible with the hashing to curve used by BLS signatures. It is the same hasher used by the internal Flow protocol, and can be used to verify Flow protocol signatures on Cadence."]}),`
`,i.jsxs(e.p,{children:["To define the MAC instance, ",i.jsx(e.code,{children:"KMAC128(customizer, key, data, length)"})," is instantiated with the following parameters (as referred to by the NIST ",i.jsx(e.a,{href:"https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-185.pdf",children:"SHA-3 Derived Functions"}),"):"]}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"customizer"})," is the UTF-8 encoding of ",i.jsx(e.code,{children:'"H2C"'}),"."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"key"})," is the UTF-8 encoding of ",i.jsx(e.code,{children:'"FLOW--V00-CS00-with-BLS_SIG_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"'})," when ",i.jsx(e.code,{children:"hash"})," is used. It includes the input ",i.jsx(e.code,{children:"tag"})," when ",i.jsx(e.code,{children:"hashWithTag"})," is used and key becomes the UTF-8 encoding of ",i.jsx(e.code,{children:'"FLOW-" || tag || "-V00-CS00-with-BLS_SIG_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"'}),"."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"data"})," is the input data to hash."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"length"})," is 1024 bytes."]}),`
`]}),`
`,i.jsx(e.h2,{id:"signature-algorithms",children:"Signature algorithms"}),`
`,i.jsxs(e.p,{children:["The built-in ",i.jsx(e.a,{href:"./enumerations",children:"enumeration"})," ",i.jsx(e.code,{children:"SignatureAlgorithm"})," provides the set of supported signature algorithms:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"enum"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" SignatureAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// ECDSA_P256 is ECDSA on the NIST P-256 curve."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ECDSA_P256"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// ECDSA_secp256k1 is ECDSA on the secp256k1 curve."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ECDSA_secp256k1"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// BLS_BLS12_381 is BLS signature scheme on the BLS12-381 curve."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// The scheme is set-up so that signatures are in G_1 (subgroup of the curve over the prime field)"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// while public keys are in G_2 (subgroup of the curve over the prime field extension)."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    case"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" BLS_BLS12_381"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.h2,{id:"public-keys",children:"Public keys"}),`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"PublicKey"})," is a built-in structure that represents a cryptographic public key of a signature scheme:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" publicKey: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signatureAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SignatureAlgorithm"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Verifies a signature under the given tag, data and public key."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// It uses the given hash algorithm to hash the tag and data."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" verify"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signature: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signedData: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        domainSeparationTag: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        hashAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ): "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Verifies the proof of possession of the private key."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// This function is only implemented if the signature algorithm"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// of the public key is BLS (BLS_BLS12_381)."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// If called with any other signature algorithm, the program aborts"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" verifyPoP"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ proof: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]): "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // creating a PublicKey is a view operation"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"PublicKey"})," supports two methods: ",i.jsx(e.code,{children:"verify"})," and ",i.jsx(e.code,{children:"verifyPoP"}),". ",i.jsx(e.code,{children:"verify"})," is the ",i.jsx(e.a,{href:"#signature-verification",children:"signature verification"})," function, while ",i.jsx(e.code,{children:"verifyPoP"})," is covered under ",i.jsx(e.a,{href:"#proof-of-possession-pop",children:"BLS multi-signature"}),"."]}),`
`,i.jsx(e.h3,{id:"public-key-construction",children:"Public key construction"}),`
`,i.jsxs(e.p,{children:["A ",i.jsx(e.code,{children:"PublicKey"})," can be constructed using the raw key and the signing algorithm:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" publicKey = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    publicKey: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"010203"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decodeHex"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signatureAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SignatureAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ECDSA_P256"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})})]})})}),`
`,i.jsx(e.p,{children:"The raw key value depends on the supported signature scheme:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"ECDSA_P256"})," and ",i.jsx(e.code,{children:"ECDSA_secp256k1"}),": The public key is an uncompressed curve point ",i.jsx(e.code,{children:"(X,Y)"}),", where ",i.jsx(e.code,{children:"X"})," and ",i.jsx(e.code,{children:"Y"})," are two prime field elements. The raw key is represented as ",i.jsx(e.code,{children:"byte (X) || bytes(Y)"}),", where ",i.jsx(e.code,{children:"||"})," is the concatenation operation, and ",i.jsx(e.code,{children:"bytes()"})," is the bytes big-endian encoding left padded by zeros to the byte length of the field prime. The raw public key is 64-bytes long."]}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"BLS_BLS_12_381"}),": The public key is a G_2 element (on the curve over the prime field extension). The encoding follows the compressed serialization defined in the ",i.jsx(e.a,{href:"https://www.ietf.org/archive/id/draft-irtf-cfrg-pairing-friendly-curves-08.html#name-point-serialization-procedu",children:"IETF draft-irtf-cfrg-pairing-friendly-curves-08"}),". A public key is 96-bytes long."]}),`
`]}),`
`]}),`
`,i.jsx(e.h3,{id:"public-key-validation",children:"Public key validation"}),`
`,i.jsx(e.p,{children:"A public key is validated at the time of creation. Only valid public keys can be created. The validation of the public key depends on the supported signature scheme:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"ECDSA_P256"})," and ",i.jsx(e.code,{children:"ECDSA_secp256k1"}),": The given ",i.jsx(e.code,{children:"X"})," and ",i.jsx(e.code,{children:"Y"})," coordinates are correctly serialized, represent valid prime field elements, and the resulting point is on the correct curve (no subgroup check needed since the cofactor of both supported curves is 1)."]}),`
`]}),`
`,i.jsxs(e.li,{children:[`
`,i.jsxs(e.p,{children:[i.jsx(e.code,{children:"BLS_BLS_12_381"}),": The given key is correctly serialized following the compressed serialization in ",i.jsx(e.a,{href:"https://www.ietf.org/archive/id/draft-irtf-cfrg-pairing-friendly-curves-08.html#name-point-serialization-procedu",children:"IETF draft-irtf-cfrg-pairing-friendly-curves-08"}),". The coordinates represent valid prime field extension elements. The resulting point is on the curve, and is on the correct subgroup G_2. Note that the point at infinity is accepted and yields the identity public key. This identity key can be useful when aggregating multiple keys."]}),`
`]}),`
`]}),`
`,i.jsx(e.p,{children:"Since the validation happens only at the time of creation, public keys are immutable."}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"publicKey.signatureAlgorithm = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SignatureAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ECDSA_secp256k1"}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   // Not allowed"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"publicKey.publicKey = []                                            "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Not allowed"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"publicKey.publicKey["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] = "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"4"}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // No effect"})]})]})})}),`
`,i.jsx(e.p,{children:"Invalid public keys cannot be constructed so public keys are always valid."}),`
`,i.jsx(e.h3,{id:"signature-verification",children:"Signature verification"}),`
`,i.jsxs(e.p,{children:["A signature can be verified using the ",i.jsx(e.code,{children:"verify"})," function of the ",i.jsx(e.code,{children:"PublicKey"}),":"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pk = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    publicKey: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"96142CE0C5ECD869DC88C8960E286AF1CE1B29F329BA4964213934731E65A1DE480FD43EF123B9633F0A90434C6ACE0A98BB9A999231DB3F477F9D3623A6A4ED"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decodeHex"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signatureAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SignatureAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ECDSA_P256"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signature = "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"108EF718F153CFDC516D8040ABF2C8CC7AECF37C6F6EF357C31DFE1F7AC79C9D0145D1A2F08A48F1A2489A84C725D6A7AB3E842D9DC5F8FE8E659FFF5982310D"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decodeHex"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" message : ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] = ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" isValid = pk."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"verify"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signature: signature,"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    signedData: message,"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    domainSeparationTag: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'""'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    hashAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SHA2_256"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// `isValid` is false"})})]})})}),`
`,i.jsxs(e.p,{children:["The inputs to ",i.jsx(e.code,{children:"verify"})," depend on the signature scheme used, which are described in the following sections."]}),`
`,i.jsx(e.p,{children:i.jsxs(e.strong,{children:["ECDSA (",i.jsx(e.code,{children:"ECDSA_P256"})," and ",i.jsx(e.code,{children:"ECDSA_secp256k1"}),")"]})}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"signature"})," expects the couple ",i.jsx(e.code,{children:"(r,s)"}),". It is serialized as ",i.jsx(e.code,{children:"bytes(r) || bytes(s)"}),", where ",i.jsx(e.code,{children:"||"})," is the concatenation operation, and ",i.jsx(e.code,{children:"bytes()"})," is the bytes big-endian encoding left padded by zeros to the byte-length of the curve order. The signature is 64 bytes long for both curves."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"signedData"})," is the arbitrary message to verify the signature against."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"domainSeparationTag"})," is the expected domain tag (i.e., the value that a correctly generated signature is expected to use). The domain tag prefixes the message during the signature generation or verification before the hashing step (more details in ",i.jsx(e.a,{href:"#hashing-with-a-domain-tag",children:i.jsx(e.code,{children:"hashWithTag"})}),"). The tag's purpose is to separate different contexts or domains so that a signature can't be re-used for a different context other than its original one. An application should define its own arbitrary domain tag value to distance its users' signatures from other applications. The application tag should be enforced for valid signature generations and verifications. See ",i.jsx(e.a,{href:"#hashing-with-a-domain-tag",children:"Hashing with a domain tag"})," for requirements on the string value."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"hashAlgorithm"})," is either ",i.jsx(e.code,{children:"SHA2_256"}),", ",i.jsx(e.code,{children:"SHA3_256"})," or ",i.jsx(e.code,{children:"KECCAK_256"}),". It is the algorithm used to hash the message along with the given tag (see ",i.jsx(e.a,{href:"#hashing-with-a-domain-tag",children:"Hashing with a domain tag"}),")."]}),`
`]}),`
`,i.jsxs(e.p,{children:["As noted in ",i.jsx(e.a,{href:"#hashing-with-a-domain-tag",children:i.jsx(e.code,{children:"hashWithTag"})})," for ",i.jsx(e.code,{children:"SHA2_256"}),", ",i.jsx(e.code,{children:"SHA3_256"}),", and ",i.jsx(e.code,{children:"KECCAK_256"}),", using an empty ",i.jsx(e.code,{children:"tag"})," results in hashing the input data only. If a signature verification needs to be computed against data without any domain tag, an empty domain tag ",i.jsx(e.code,{children:'""'})," should be passed."]}),`
`,i.jsxs(e.p,{children:["ECDSA verification is implemented as defined in ANS X9.62 (also referred by ",i.jsx(e.a,{href:"https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf",children:"FIPS 186-4"})," and ",i.jsx(e.a,{href:"https://www.secg.org/sec1-v2.pdf",children:"SEC 1, Version 2.0"}),"). A valid signature would be generated using the expected ",i.jsx(e.code,{children:"signedData"}),", ",i.jsx(e.code,{children:"domainSeparationTag"}),", and ",i.jsx(e.code,{children:"hashAlgorithm"})," used to verify."]}),`
`,i.jsx(e.p,{children:i.jsxs(e.strong,{children:["BLS (",i.jsx(e.code,{children:"BLS_BLS_12_381"}),")"]})}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"signature"})," expects a G_1 point (on the curve over the prime field). The encoding follows the compressed serialization defined in the ",i.jsx(e.a,{href:"https://www.ietf.org/archive/id/draft-irtf-cfrg-pairing-friendly-curves-08.html#name-point-serialization-procedu",children:"IETF draft-irtf-cfrg-pairing-friendly-curves-08"}),". A signature is 48-bytes long."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"signedData"})," is the arbitrary message to verify the signature against."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"domainSeparationTag"})," is the expected domain tag (i.e., the value that a correctly generated signature is expected to use). The domain tag is mixed with the message during the signature generation or verification as specified in ",i.jsx(e.a,{href:"#kmac128-for-bls",children:"KMAC128 for BLS"}),". The tag's purpose is to separate different contexts or domains so that a signature can't be re-used for a different context other than its original one. An application should define its own arbitrary domain tag value to distance its user's signatures from other applications. The application tag should be enforced for valid signature generations and verifications. All string values are valid as tags in BLS (check ",i.jsx(e.a,{href:"#kmac128-for-bls",children:"KMAC128 for BLS"}),")."]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"hashAlgorithm"})," only accepts ",i.jsx(e.code,{children:"KMAC128_BLS_BLS12_381"}),". It is the algorithm used to hash the message along with the given tag (check ",i.jsx(e.a,{href:"#kmac128-for-bls",children:"KMAC128 for BLS"}),")."]}),`
`]}),`
`,i.jsxs(e.p,{children:["BLS verification performs the necessary membership check on the signature, while the membership check of the public key is performed at the creation of the ",i.jsx(e.code,{children:"PublicKey"})," object. It is not repeated during the signature verification. In order to prevent equivocation issues, a verification under the identity public key always returns ",i.jsx(e.code,{children:"false"}),"."]}),`
`,i.jsxs(e.p,{children:["The verification uses a hash-to-curve algorithm to hash the ",i.jsx(e.code,{children:"signedData"})," into a ",i.jsx(e.code,{children:"G_1"})," point, following the ",i.jsx(e.code,{children:"hash_to_curve"})," method described in ",i.jsx(e.a,{href:"https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-14#section-3",children:"draft-irtf-cfrg-hash-to-curve-14"}),". While KMAC128 is used as a hash-to-field method resulting in two field elements, the mapping to curve is implemented using the ",i.jsx(e.a,{href:"https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-hash-to-curve-14#section-6.6.3",children:"simplified SWU"}),"."]}),`
`,i.jsxs(e.p,{children:["A valid signature should be generated using the expected ",i.jsx(e.code,{children:"signedData"})," and ",i.jsx(e.code,{children:"domainSeparationTag"}),", as well the same hashing to curve process."]}),`
`,i.jsx(e.h2,{id:"bls-multi-signature",children:"BLS multi-signature"}),`
`,i.jsxs(e.p,{children:["BLS signature scheme allows efficient multi-signature features. Multiple signatures can be aggregated into a single signature, which can be verified against an aggregated public key. This allows authenticating multiple signers with a single signature verification. While BLS provides multiple aggregation techniques, Cadence supports basic aggregation tools that cover a wide list of use cases. These tools are defined in the built-in ",i.jsx(e.code,{children:"BLS"})," contract, which does not need to be imported."]}),`
`,i.jsx(e.h3,{id:"proof-of-possession-pop",children:"Proof of Possession (PoP)"}),`
`,i.jsxs(e.p,{children:["Multi-signature verification in BLS requires a defense against rogue public-key attacks. Multiple ways are available to protect BLS verification. Cadence provides the PoP of a private key as a defense tool. The PoP of a private key is a BLS signature over the public key itself. The PoP signature follows the same requirements of a BLS signature (detailed in ",i.jsx(e.a,{href:"#signature-verification",children:"Signature verification"}),"), except it uses a special domain separation tag. The key expected to be used in KMAC128 is the UTF-8 encoding of ",i.jsx(e.code,{children:'"BLS_POP_BLS12381G1_XOF:KMAC128_SSWU_RO_POP_"'}),". The expected message to be signed by the PoP is the serialization of the BLS public key corresponding to the signing private key (",i.jsx(e.a,{href:"#public-key-construction",children:"serialization details"}),"). The PoP can only be verified using the ",i.jsx(e.code,{children:"PublicKey"})," method ",i.jsx(e.code,{children:"verifyPoP"}),"."]}),`
`,i.jsx(e.h3,{id:"bls-signature-aggregation",children:"BLS signature aggregation"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" aggregateSignatures"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ signatures: [["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]]): ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]?"})]})})})}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Aggregates multiple BLS signatures into one."}),`
`]}),`
`,i.jsx(e.p,{children:"Signatures can be generated from the same or distinct messages, and they can also be the aggregation of other signatures. The order of the signatures in the slice does not matter since the aggregation is commutative. There is no subgroup membership check performed on the input signatures. If the array is empty or if decoding one of the signatures fails, the program aborts."}),`
`,i.jsxs(e.p,{children:["The output signature can be verified against an aggregated public key to authenticate multiple signers at once. Since the ",i.jsx(e.code,{children:"verify"})," method accepts a single data to verify against, it is only possible to verify multiple signatures of the same message."]}),`
`,i.jsx(e.h3,{id:"bls-public-key-aggregation",children:"BLS public key aggregation"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"view "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" aggregatePublicKeys"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(_ publicKeys: ["}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]): "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?"})]})})})}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsx(e.li,{children:"Aggregates multiple BLS public keys into one."}),`
`]}),`
`,i.jsx(e.p,{children:"The order of the public keys in the slice does not matter since the aggregation is commutative. The input keys are guaranteed to be in the correct subgroup since subgroup membership is checked at the key creation time. If the array is empty or any of the input keys is not a BLS key, the program aborts. Note that the identity public key is a valid input to this function and it represents the identity element of aggregation."}),`
`,i.jsxs(e.p,{children:["The output public key can be used to verify aggregated signatures to authenticate multiple signers at once. Since the ",i.jsx(e.code,{children:"verify"})," method accepts a single data to verify against, it is only possible to verify multiple signatures of the same message. The identity public key is a possible output of the function, though signature verifications against identity result in ",i.jsx(e.code,{children:"false"}),"."]}),`
`,i.jsxs(e.p,{children:["In order to prevent rogue key attacks when verifying aggregated signatures, it is important to verify the ",i.jsx(e.a,{href:"#proof-of-possession-pop",children:"PoP"})," of each individual key involved in the aggregation process."]}),`
`,i.jsx(e.h2,{id:"crypto-contract",children:"Crypto contract"}),`
`,i.jsxs(e.p,{children:["The built-in contract ",i.jsx(e.code,{children:"Crypto"})," can be used to perform cryptographic operations. The contract can be imported using ",i.jsx(e.code,{children:"import Crypto"}),"."]}),`
`,i.jsx(e.h3,{id:"key-lists",children:"Key lists"}),`
`,i.jsx(e.p,{children:"The crypto contract allows creating key lists to be used for multi-signature verification."}),`
`,i.jsxs(e.p,{children:["A key list is basically a list of public keys where each public key is assigned a key index, a hash algorithm, and a weight. A list of ",i.jsx(e.code,{children:"KeyListSignature"})," can be verified against a key list where each signature entry specifies the public key index to be used against. The list verification is successful if all signatures from the list are valid, each public key is used at most once, and the used keys weights add up to at least ",i.jsx(e.code,{children:"1"}),"."]}),`
`,i.jsxs(e.p,{children:["The verification of each signature uses the Cadence single signature verification function with the key entry hash algorithm and the input domain separation tag (see ",i.jsx(e.a,{href:"#signature-verification",children:"Signature verification"})," for more information)."]}),`
`,i.jsx(e.p,{children:"It is possible to disable a public key by revoking it. The revoked keys remain in the list and retain the same index. Only signatures against non-revoked keys are considered valid."}),`
`,i.jsx(e.p,{children:"For example, to verify two signatures with equal weights for some signed data:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Crypto"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"fun"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" test "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"main"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"() {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" keyList = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Crypto"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"KeyList"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" publicKeyA = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        publicKey:"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "db04940e18ec414664ccfd31d5d2d4ece3985acb8cb17a2025b2f1673427267968e52e2bbf3599059649d4b2cce98fdb8a3048e68abf5abe3e710129e90696ca"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decodeHex"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signatureAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SignatureAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ECDSA_P256"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    keyList."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        publicKeyA,"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        hashAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SHA3_256"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        weight: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0.5"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" publicKeyB = "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        publicKey:"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'            "df9609ee588dd4a6f7789df8d56f03f545d4516f0c99b200d73b9a3afafc14de5d21a4fc7a2a2015719dc95c9e756cfa44f2a445151aaf42479e7120d83df956"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decodeHex"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(),"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signatureAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"SignatureAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"ECDSA_P256"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    keyList."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        publicKeyB,"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        hashAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"SHA3_256"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        weight: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0.5"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signatureSet = ["})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        Crypto"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"KeyListSignature"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            keyIndex: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            signature:"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'                "8870a8cbe6f44932ba59e0d15a706214cc4ad2538deb12c0cf718d86f32c47765462a92ce2da15d4a29eb4e2b6fa05d08c7db5d5b2a2cd8c2cb98ded73da31f6"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decodeHex"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ),"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"        Crypto"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"KeyListSignature"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            keyIndex: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"            signature:"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'                "bbdc5591c3f937a730d4f6c0a6fde61a0a6ceaa531ccb367c3559335ab9734f4f2b9da8adbe371f1f7da913b5a3fdd96a871e04f078928ca89a83d841c72fadf"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decodeHex"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        )"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ]"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'    // "foo", encoded as UTF-8, in hex representation'})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signedData = "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"666f6f"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"decodeHex"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" isValid = keyList."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"verify"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signatureSet: signatureSet,"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signedData: signedData,"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        domainSeparationTag: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"FLOW-V0.0-user"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(e.p,{children:"The following shows the implementation details of the key list and the signature list:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" KeyListEntry"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" keyIndex: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" publicKey: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" hashAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" weight: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" isRevoked: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        keyIndex: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        publicKey: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        hashAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        weight: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        isRevoked: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" KeyList"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Adds a new key with the given weight"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" add"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        _ publicKey: "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"PublicKey"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        hashAlgorithm: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"HashAlgorithm"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        weight: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UFix64"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    )"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Returns the key at the given index, if it exists."})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Revoked keys are always returned, but they have `isRevoked` field set to true"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" get"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(keyIndex: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"): "}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"KeyListEntry"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Marks the key at the given index revoked, but does not delete it"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" revoke"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(keyIndex: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// Returns true if the given signatures are valid for the given signed data"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// `domainSeparationTag` is used to specify a scope for each signature,"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    /// and is implemented the same way as `PublicKey`'s verify function."})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    fun"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" verify"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signatureSet: ["}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"KeyListSignature"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        signedData: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        domainSeparationTag: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"String"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ): "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Bool"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"struct"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" KeyListSignature"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" keyIndex: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    "})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" signature: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    access"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"all"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    init"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(keyIndex: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Int"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", signature: ["}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"UInt8"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"])"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]})}function d(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(n,{...s})}):n(s)}export{t as _markdown,d as default,h as frontmatter,l as structuredData,r as toc};
