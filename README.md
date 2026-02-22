# MonadID

**Zero-Knowledge Proof-of-Humanity Protocol on Monad**

MonadID is a privacy-preserving identity layer that lets users prove they are real humans — without revealing any personal data. Built natively on Monad, it enables any dApp to verify identity with a single contract call: `identity.isHuman(user)`.

---

## The Problem

As high-throughput chains like Monad scale, they face critical identity challenges:

- **Sybil attacks** drain 50–80%+ of airdrops and incentive programs
- **DAO governance** breaks when 1 person = 20 wallets
- **Traditional KYC** exposes personal data and has terrible UX
- **No universal identity primitive** — every app reinvents anti-bot logic

Monad needs a chain-native identity layer without sacrificing privacy.

## The Solution

MonadID provides ZK-verified, user-owned identity proofs. Users scan their Aadhaar card QR code, a zero-knowledge proof is generated **entirely on their device**, and only a cryptographic commitment is stored on-chain.

**No personal data ever touches the blockchain.**

### User Flow

1. Connect wallet on Monad Testnet
2. Scan Aadhaar QR code (camera or upload)
3. ZK proof is generated locally in the browser
4. Submit proof on-chain → identity registered + soulbound token minted
5. Any dApp can now verify: `identity.isHuman(address)`

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User's Browser                    │
│                                                     │
│  Aadhaar QR → ZK Proof Generator → Groth16 Proof   │
│              (all local, no PII leaves device)       │
└──────────────────────┬──────────────────────────────┘
                       │ proof + public signals
                       ▼
┌──────────────────────────────────────────────────────┐
│                  Monad Blockchain                     │
│                                                      │
│  Groth16Verifier ──► IdentityRegistry ──► MonadHuman │
│  (verify proof)      (register identity)   Token     │
│                      isHuman[addr] = true  (SBT)     │
└──────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                   Any Monad dApp                     │
│                                                      │
│  modifier onlyHuman() {                              │
│    require(identity.isHuman(msg.sender));             │
│  }                                                   │
└──────────────────────────────────────────────────────┘
```

## Deployed Contracts (Monad Testnet)

| Contract | Address |
|----------|---------|
| IdentityRegistry | `0x2541a918E3274048b18e9841D6391b64CDdCC4b0` |
| MonadHumanToken (SBT) | `0xD19B625eE6199Ce3824054832300cA26198f9A28` |
| Groth16Verifier | `0x830D0f998d80BFefaE02293dF572b92FeDC3667b` |

**Chain:** Monad Testnet (Chain ID: 10143)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Wallet | Wagmi 3, Viem 2, WalletConnect |
| ZK Proofs | anon-aadhaar SDK (Groth16 zk-SNARKs) |
| QR Scanning | html5-qrcode (webcam + file upload) |
| Smart Contracts | Solidity 0.8.28, Hardhat, OpenZeppelin |
| Chain | Monad Testnet (EVM-compatible) |

## Project Structure

```
monad-id/
├── backend/          — Solidity contracts, Hardhat config, tests
│   ├── contracts/
│   │   ├── IdentityRegistry.sol      — Core identity registry
│   │   ├── MonadHumanToken.sol       — Soulbound ERC-721 token
│   │   ├── Groth16Verifier.sol       — ZK proof verifier
│   │   └── MonadIDSubscription.sol   — dApp subscription model
│   └── test/                         — Full test suite
├── frontend/         — Next.js app with verification UI
│   └── src/
│       ├── app/          — Pages (verify, dashboard, pricing, integrate)
│       ├── components/   — UI components (verify form, QR scanner, dashboard)
│       ├── hooks/        — Contract interaction hooks
│       ├── lib/          — ZK proof utilities, formatting
│       └── config/       — Contract addresses, wagmi config
└── docs/             — Project documentation
```

## Quick Start

### Backend

```bash
cd backend
pnpm install
pnpm hardhat compile
pnpm hardhat test
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet on Monad Testnet.

---

## Smart Contracts

### IdentityRegistry

The core contract that stores identity commitments and manages verification:

- `verifyAndRegister(proof, pubSignals)` — verify ZK proof and register identity
- `isHuman(address)` — check if an address is verified
- `revokeIdentity()` — user can revoke their own identity

### MonadHumanToken (SBT)

A non-transferable ERC-721 soulbound token minted upon successful verification. Serves as on-chain proof of humanity.

### dApp Integration

Any Monad dApp can integrate in 3 lines:

```solidity
IIdentityRegistry identity = IIdentityRegistry(0x2541a918...);

modifier onlyHuman() {
    require(identity.isHuman(msg.sender), "Not verified human");
    _;
}
```

**Use cases:** sybil-resistant airdrops, human-only DAOs, age-gated apps, fair token launches, bot-free social platforms.

---

## Why Monad?

- **Parallel execution** makes ZK verification fast and cheap
- **Sub-second finality** gives instant identity confirmation
- **High throughput** supports real consumer-scale apps
- **EVM-native** means drop-in Solidity integration
- **First identity primitive** — fills a major ecosystem gap

---

## Team

Built at Monad Blitz Mumbai 2025.

## License

MIT
