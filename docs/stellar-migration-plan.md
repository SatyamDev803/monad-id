# MonadID → StellarID: Complete Migration Plan

> **Document Version:** 1.0  
> **Date:** February 23, 2026  
> **Scope:** Migrate the MonadID ZK proof-of-humanity protocol from Monad (EVM) to Stellar blockchain  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture (Monad/EVM)](#2-current-architecture-monadevm)
3. [Stellar Architecture Overview](#3-stellar-architecture-overview)
4. [Key Differences: Monad vs Stellar](#4-key-differences-monad-vs-stellar)
5. [Migration Strategy](#5-migration-strategy)
6. [Phase 1 — Smart Contract Migration (Soroban)](#6-phase-1--smart-contract-migration-soroban)
7. [Phase 2 — Frontend Migration](#7-phase-2--frontend-migration)
8. [Phase 3 — Wallet & Provider Migration](#8-phase-3--wallet--provider-migration)
9. [Phase 4 — Hooks & Contract Interaction Layer](#9-phase-4--hooks--contract-interaction-layer)
10. [Phase 5 — Deployment & Infrastructure](#10-phase-5--deployment--infrastructure)
11. [Phase 6 — Testing & QA](#11-phase-6--testing--qa)
12. [File-by-File Migration Map](#12-file-by-file-migration-map)
13. [New Dependencies](#13-new-dependencies)
14. [Risk Assessment](#14-risk-assessment)
15. [Timeline Estimate](#15-timeline-estimate)
16. [Appendix: Contract Code Sketches](#16-appendix-contract-code-sketches)

---

## 1. Executive Summary

MonadID is a ZK proof-of-humanity protocol that currently runs on **Monad Testnet** (EVM-compatible, chain ID 10143). The project uses:

- **Solidity 0.8.28** smart contracts (Hardhat + Ignition)
- **Wagmi + Viem** for frontend blockchain interaction
- **MetaMask (injected)** wallet connector
- **Next.js 16** frontend with React 19

Migrating to **Stellar** means replacing the EVM smart contracts with **Soroban smart contracts** (Rust-based), swapping the wallet layer from MetaMask to **Freighter**, and replacing Wagmi/Viem with the **Stellar SDK** + **Soroban client**.

### What Changes

| Layer | Current (Monad) | Target (Stellar) |
|-------|-----------------|-------------------|
| Smart Contracts | Solidity 0.8.28 | Rust (Soroban SDK) |
| Contract Framework | Hardhat + Ignition | Stellar CLI (`stellar contract`) |
| Wallet | MetaMask (injected) | Freighter Wallet |
| Frontend SDK | Wagmi 3.5 + Viem 2.46 | `@stellar/stellar-sdk` + `@stellar/freighter-api` |
| Chain | Monad Testnet (EVM, chain 10143) | Stellar Testnet (Soroban) |
| Account Model | Ethereum accounts (20-byte address) | Stellar accounts (Ed25519 public key, G... format) |
| Token Standard | ERC-721 (OpenZeppelin) | Soroban custom token / SAC |
| Native Currency | MON | XLM (test lumens) |
| Explorer | monadexplorer.com | stellar.expert / stellarchain.io |
| RPC | JSON-RPC (EVM) | Soroban RPC (JSON-RPC 2.0) |

### What Stays the Same

- **Next.js 16 frontend** — framework stays, only blockchain interaction code changes
- **QR Scanner** — `html5-qrcode` is chain-agnostic
- **ZK proof generation** — local SHA-256 nullifier logic is chain-agnostic
- **UI components** — All shadcn/ui components, Tailwind CSS, Framer Motion
- **Aadhaar verification flow** — scan → prove → submit pattern is identical
- **Project structure** — `frontend/` + `backend/` monorepo layout

---

## 2. Current Architecture (Monad/EVM)

### Smart Contracts (4 Solidity files)

| Contract | Address (Monad Testnet) | Purpose |
|----------|------------------------|---------|
| `Groth16Verifier` | `0x830D0f998d80BFefaE02293dF572b92FeDC3667b` | Mock ZK proof verifier (always returns true) |
| `IdentityRegistry` | `0x2541a918E3274048b18e9841D6391b64CDdCC4b0` | Core: verify proof → register identity → mint SBT |
| `MonadHumanToken` | `0xD19B625eE6199Ce3824054832300cA26198f9A28` | Soulbound ERC-721 (non-transferable) |
| `MonadIDSubscription` | `0xEb935EA7Dd87d6C8097A5Fd73A73D43334C6FA69` | Tiered subscription (Free/Pro/Enterprise) |

### Frontend Hooks (Wagmi-based)

| Hook | File | Purpose |
|------|------|---------|
| `useVerify()` | `hooks/use-verify.ts` | `writeContract` → `verifyAndRegister()` |
| `useIdentity()` | `hooks/use-identity.ts` | `readContracts` → `getIdentity()` + `tokenOfOwner()` |
| `useRevoke()` | `hooks/use-revoke.ts` | `writeContract` → `revokeIdentity()` |
| `useSubscription()` | `hooks/use-subscription.ts` | `readContract` + `writeContract` → subscription CRUD |

### Key Config Files

| File | Purpose |
|------|---------|
| `config/wagmi.ts` | Monad Testnet chain definition + Wagmi config |
| `config/contracts.ts` | Contract addresses + ABIs |
| `providers/web3-provider.tsx` | `WagmiProvider` + `QueryClientProvider` + `AnonAadhaarProvider` |
| `lib/aadhaar.ts` | Proof formatting (Groth16 tuple → on-chain args) |

---

## 3. Stellar Architecture Overview

### Soroban Smart Contracts

Stellar's smart contract platform is **Soroban** — contracts are written in **Rust**, compiled to WASM, and deployed on the Stellar network.

Key concepts:
- **No EVM, no Solidity** — everything is Rust with `soroban-sdk`
- **Invocations, not transactions** — you invoke contract functions via Soroban RPC
- **Storage model** — Instance storage (contract-level), Persistent storage (data), Temporary storage (ephemeral)
- **No `msg.sender`** — caller authentication is done via `env.require_auth(&address)`
- **No inheritance** — Rust uses traits, not inheritance. No equivalent of OpenZeppelin base contracts
- **No native NFT standard** — you build custom token logic or use the Stellar Asset Contract (SAC)
- **TTL & rent** — storage entries have a time-to-live and require periodic rent bumps

### Freighter Wallet

Freighter is the primary Stellar wallet browser extension (equivalent to MetaMask):
- **`@stellar/freighter-api`** — browser-side API for signing Soroban transactions
- Returns Ed25519 public keys (G... format)
- Supports Testnet, Futurenet, and Mainnet

### Stellar SDK

- **`@stellar/stellar-sdk`** — core SDK for building transactions, calling Soroban RPC
- **`SorobanRpc.Server`** — JSON-RPC 2.0 client for simulating and submitting transactions
- **Contract client** — auto-generated TypeScript bindings from contract spec

---

## 4. Key Differences: Monad vs Stellar

### Account Model

| Aspect | Monad (EVM) | Stellar |
|--------|-------------|---------|
| Address format | `0x...` (20 bytes hex) | `G...` (Ed25519 public key, 56 chars) |
| Account creation | Implicit (first tx creates) | Explicit (must be funded with min XLM) |
| Signing | secp256k1 (ECDSA) | Ed25519 |
| Wallet | MetaMask | Freighter |

### Contract Interaction

| Aspect | Monad (EVM) | Stellar (Soroban) |
|--------|-------------|-------------------|
| Call pattern | `writeContract({ functionName, args })` | Build tx → simulate → sign → submit |
| Read data | `readContract()` (free, no tx) | `contract.call()` simulation (free) |
| Gas | Gas price × gas used (MON) | Resource fees (XLM) — compute, storage, bandwidth |
| Events | `emit Event(...)` | `env.events().publish(...)` |
| Error handling | `revert("message")` / custom errors | `panic!` / `Err(Error)` |
| ABI format | JSON ABI | Contract spec (XDR-based) |

### Token Standards

| Aspect | Monad (EVM) | Stellar |
|--------|-------------|---------|
| Fungible | ERC-20 | SEP-41 / SAC |
| NFT | ERC-721 | No standard — custom Soroban contract |
| Soulbound | ERC-721 + transfer block | Custom: mint/burn with no transfer function |

---

## 5. Migration Strategy

### Approach: **Parallel Rewrite** (Not Incremental)

Since Solidity → Rust is a complete language change, the backend must be rewritten from scratch. The frontend migration is more surgical — only the blockchain interaction layer changes.

### Migration Order

```
Phase 1: Smart Contracts (Soroban/Rust)          ← Backend rewrite
Phase 2: Frontend Config & Provider              ← Replace Wagmi with Stellar SDK
Phase 3: Wallet Integration                      ← Replace MetaMask with Freighter
Phase 4: Hooks & Contract Calls                  ← Rewrite all 4 hooks
Phase 5: Deployment & Infrastructure             ← Deploy to Stellar Testnet
Phase 6: Testing & QA                            ← End-to-end validation
```

---

## 6. Phase 1 — Smart Contract Migration (Soroban)

### 6.1 Project Setup

**Replace the entire `backend/` directory structure:**

```
backend/
├── Cargo.toml                          # Workspace root
├── contracts/
│   ├── identity-registry/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── lib.rs                  # Core identity contract
│   ├── human-token/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── lib.rs                  # Soulbound token contract
│   ├── groth16-verifier/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── lib.rs                  # Mock verifier contract
│   └── subscription/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs                  # Subscription contract
└── tests/
    └── integration.rs                  # Cross-contract integration tests
```

**Initialize:**

```bash
# Install Stellar CLI
cargo install stellar-cli --locked

# Create workspace
mkdir -p backend && cd backend
cargo init --lib contracts/identity-registry
cargo init --lib contracts/human-token
cargo init --lib contracts/groth16-verifier
cargo init --lib contracts/subscription
```

**Root `Cargo.toml`:**

```toml
[workspace]
members = [
    "contracts/identity-registry",
    "contracts/human-token",
    "contracts/groth16-verifier",
    "contracts/subscription",
]

[workspace.dependencies]
soroban-sdk = "22.0.0"

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true
```

### 6.2 Contract: Groth16Verifier (Mock)

**Current Solidity:**
```solidity
contract Groth16Verifier {
    function verifyProof(uint[2], uint[2][2], uint[2], uint[2]) external pure returns (bool) {
        return true;
    }
}
```

**Target Soroban (Rust):**

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Vec, I256};

#[contract]
pub struct Groth16Verifier;

#[contractimpl]
impl Groth16Verifier {
    /// Mock verifier — always returns true for MVP.
    /// Replace with actual Groth16 verification logic in production.
    pub fn verify_proof(
        _env: Env,
        _p_a: Vec<I256>,
        _p_b: Vec<Vec<I256>>,
        _p_c: Vec<I256>,
        _pub_signals: Vec<I256>,
    ) -> bool {
        true
    }
}
```

### 6.3 Contract: HumanToken (Soulbound)

**Key changes from ERC-721:**
- No inheritance from OpenZeppelin — implement mint/burn/ownership from scratch
- No `_safeMint` — Soroban uses `env.storage()` directly
- Non-transferability enforced by simply not having a `transfer` function
- Token ownership stored in persistent storage with `DataKey` enum

**Target Soroban (Rust):**

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

#[contracttype]
pub enum DataKey {
    Admin,
    Registry,
    Counter,
    TokenOwner(u64),       // token_id → owner address
    OwnerToken(Address),   // owner → token_id
    HasMinted(Address),    // owner → bool
}

#[contract]
pub struct HumanToken;

#[contractimpl]
impl HumanToken {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Counter, &0u64);
    }

    pub fn set_registry(env: Env, registry: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Registry, &registry);
    }

    pub fn mint(env: Env, to: Address) -> u64 {
        let registry: Address = env.storage().instance().get(&DataKey::Registry).unwrap();
        registry.require_auth();

        let has_minted: bool = env.storage().persistent()
            .get(&DataKey::HasMinted(to.clone()))
            .unwrap_or(false);
        if has_minted {
            panic!("already minted");
        }

        let mut counter: u64 = env.storage().instance().get(&DataKey::Counter).unwrap();
        counter += 1;
        env.storage().instance().set(&DataKey::Counter, &counter);

        env.storage().persistent().set(&DataKey::TokenOwner(counter), &to);
        env.storage().persistent().set(&DataKey::OwnerToken(to.clone()), &counter);
        env.storage().persistent().set(&DataKey::HasMinted(to.clone()), &true);

        env.events().publish(
            (symbol_short!("mint"), to.clone()),
            counter,
        );

        counter
    }

    pub fn burn(env: Env, token_id: u64) {
        let registry: Address = env.storage().instance().get(&DataKey::Registry).unwrap();
        registry.require_auth();

        let owner: Address = env.storage().persistent()
            .get(&DataKey::TokenOwner(token_id))
            .unwrap();

        env.storage().persistent().remove(&DataKey::TokenOwner(token_id));
        env.storage().persistent().remove(&DataKey::OwnerToken(owner.clone()));
        env.storage().persistent().set(&DataKey::HasMinted(owner.clone()), &false);

        env.events().publish(
            (symbol_short!("burn"), owner),
            token_id,
        );
    }

    pub fn owner_of(env: Env, token_id: u64) -> Address {
        env.storage().persistent().get(&DataKey::TokenOwner(token_id)).unwrap()
    }

    pub fn token_of(env: Env, owner: Address) -> u64 {
        env.storage().persistent().get(&DataKey::OwnerToken(owner)).unwrap_or(0)
    }
}
```

### 6.4 Contract: IdentityRegistry (Core)

**Key changes:**
- No `msg.sender` — use `user.require_auth()` where user is passed as parameter
- No `mapping(address => struct)` — use `env.storage().persistent()` with `DataKey` enum
- Cross-contract calls use `env.invoke_contract()` or generated client
- Events use `env.events().publish()` instead of `emit`

**Target Soroban (Rust):**

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, I256, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct Identity {
    pub is_human: bool,
    pub is_over_18: bool,
    pub commitment_hash: I256,
    pub token_id: u64,
    pub verified_at: u64,
}

#[contracttype]
pub enum DataKey {
    Verifier,
    HumanToken,
    Identity(Address),
    UsedCommitment(I256),
}

const AGE_THRESHOLD: i128 = 18;

#[contract]
pub struct IdentityRegistry;

#[contractimpl]
impl IdentityRegistry {
    pub fn initialize(env: Env, verifier: Address, human_token: Address) {
        env.storage().instance().set(&DataKey::Verifier, &verifier);
        env.storage().instance().set(&DataKey::HumanToken, &human_token);
    }

    pub fn verify_and_register(
        env: Env,
        user: Address,
        p_a: Vec<I256>,
        p_b: Vec<Vec<I256>>,
        p_c: Vec<I256>,
        pub_signals: Vec<I256>,
    ) {
        user.require_auth();

        // Check not already verified
        let existing: Option<Identity> = env.storage().persistent()
            .get(&DataKey::Identity(user.clone()));
        if existing.is_some() && existing.unwrap().is_human {
            panic!("already verified");
        }

        let commitment = pub_signals.get(0).unwrap();
        let age_threshold = pub_signals.get(1).unwrap();

        if i128::from(age_threshold.clone()) != AGE_THRESHOLD {
            panic!("invalid age threshold");
        }

        let used: bool = env.storage().persistent()
            .get(&DataKey::UsedCommitment(commitment.clone()))
            .unwrap_or(false);
        if used {
            panic!("commitment already used");
        }

        // Cross-contract call to verifier
        let verifier: Address = env.storage().instance()
            .get(&DataKey::Verifier).unwrap();
        let valid: bool = env.invoke_contract(
            &verifier,
            &soroban_sdk::Symbol::new(&env, "verify_proof"),
            (p_a, p_b, p_c, pub_signals.clone()).try_into_val(&env).unwrap(),
        );
        if !valid {
            panic!("invalid proof");
        }

        // Cross-contract call to mint token
        let human_token: Address = env.storage().instance()
            .get(&DataKey::HumanToken).unwrap();
        let token_id: u64 = env.invoke_contract(
            &human_token,
            &soroban_sdk::Symbol::new(&env, "mint"),
            (user.clone(),).try_into_val(&env).unwrap(),
        );

        let identity = Identity {
            is_human: true,
            is_over_18: true,
            commitment_hash: commitment.clone(),
            token_id,
            verified_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Identity(user.clone()), &identity);
        env.storage().persistent().set(&DataKey::UsedCommitment(commitment), &true);

        env.events().publish(
            (symbol_short!("verified"), user),
            token_id,
        );
    }

    pub fn revoke_identity(env: Env, user: Address) {
        user.require_auth();

        let identity: Identity = env.storage().persistent()
            .get(&DataKey::Identity(user.clone()))
            .expect("not verified");

        if !identity.is_human {
            panic!("not verified");
        }

        let human_token: Address = env.storage().instance()
            .get(&DataKey::HumanToken).unwrap();
        env.invoke_contract::<()>(
            &human_token,
            &soroban_sdk::Symbol::new(&env, "burn"),
            (identity.token_id,).try_into_val(&env).unwrap(),
        );

        env.storage().persistent().remove(&DataKey::Identity(user.clone()));

        env.events().publish(
            (symbol_short!("revoked"), user),
            identity.token_id,
        );
    }

    pub fn is_human(env: Env, user: Address) -> bool {
        env.storage().persistent()
            .get(&DataKey::Identity(user))
            .map(|id: Identity| id.is_human)
            .unwrap_or(false)
    }

    pub fn is_over_18(env: Env, user: Address) -> bool {
        env.storage().persistent()
            .get(&DataKey::Identity(user))
            .map(|id: Identity| id.is_over_18)
            .unwrap_or(false)
    }

    pub fn get_identity(env: Env, user: Address) -> Identity {
        env.storage().persistent()
            .get(&DataKey::Identity(user))
            .unwrap()
    }
}
```

### 6.5 Contract: Subscription

**Key changes:**
- `msg.value` doesn't exist in Soroban — use Stellar native token (XLM) transfers via SAC
- `payable` keyword doesn't exist — handle token transfer explicitly
- `block.timestamp` → `env.ledger().timestamp()`

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, symbol_short, token};

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum Tier {
    Free = 0,
    Pro = 1,
    Enterprise = 2,
}

#[contracttype]
#[derive(Clone)]
pub struct Subscription {
    pub tier: Tier,
    pub expires_at: u64,
    pub verifications_used: u64,
    pub verification_limit: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    NativeToken,   // XLM SAC address
    Subscription(Address),
}

const PRO_PRICE: i128 = 100_0000000;       // 100 XLM (7 decimals)
const ENTERPRISE_PRICE: i128 = 1000_0000000; // 1000 XLM
const SUBSCRIPTION_DURATION: u64 = 30 * 24 * 60 * 60; // 30 days in seconds
const FREE_LIMIT: u64 = 100;
const PRO_LIMIT: u64 = 10_000;
const ENTERPRISE_LIMIT: u64 = u64::MAX;

#[contract]
pub struct StellarIDSubscription;

#[contractimpl]
impl StellarIDSubscription {
    pub fn initialize(env: Env, admin: Address, native_token: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NativeToken, &native_token);
    }

    pub fn subscribe(env: Env, subscriber: Address, tier: Tier) {
        subscriber.require_auth();

        match tier {
            Tier::Free => {
                let existing: Option<Subscription> = env.storage().persistent()
                    .get(&DataKey::Subscription(subscriber.clone()));
                if existing.is_some() {
                    panic!("already subscribed");
                }
                let sub = Subscription {
                    tier: Tier::Free,
                    expires_at: u64::MAX,
                    verifications_used: 0,
                    verification_limit: FREE_LIMIT,
                };
                env.storage().persistent().set(&DataKey::Subscription(subscriber.clone()), &sub);
            }
            Tier::Pro | Tier::Enterprise => {
                let (price, limit) = match tier {
                    Tier::Pro => (PRO_PRICE, PRO_LIMIT),
                    Tier::Enterprise => (ENTERPRISE_PRICE, ENTERPRISE_LIMIT),
                    _ => panic!("invalid tier"),
                };

                // Transfer XLM from subscriber to contract
                let native_token: Address = env.storage().instance()
                    .get(&DataKey::NativeToken).unwrap();
                let admin: Address = env.storage().instance()
                    .get(&DataKey::Admin).unwrap();
                token::Client::new(&env, &native_token)
                    .transfer(&subscriber, &admin, &price);

                let expires_at = env.ledger().timestamp() + SUBSCRIPTION_DURATION;
                let sub = Subscription {
                    tier,
                    expires_at,
                    verifications_used: 0,
                    verification_limit: limit,
                };
                env.storage().persistent().set(&DataKey::Subscription(subscriber.clone()), &sub);
            }
        }

        env.events().publish(
            (symbol_short!("subscr"), subscriber),
            0u32,
        );
    }

    pub fn get_subscription(env: Env, subscriber: Address) -> Subscription {
        env.storage().persistent()
            .get(&DataKey::Subscription(subscriber))
            .unwrap()
    }

    pub fn is_active(env: Env, subscriber: Address) -> bool {
        let sub: Option<Subscription> = env.storage().persistent()
            .get(&DataKey::Subscription(subscriber));
        match sub {
            None => false,
            Some(s) => {
                if s.tier == Tier::Free { true }
                else { env.ledger().timestamp() < s.expires_at }
            }
        }
    }
}
```

### 6.6 Build & Deploy Commands

```bash
# Build all contracts
cd backend
stellar contract build

# This produces WASM files in:
# target/wasm32-unknown-unknown/release/groth16_verifier.wasm
# target/wasm32-unknown-unknown/release/human_token.wasm
# target/wasm32-unknown-unknown/release/identity_registry.wasm
# target/wasm32-unknown-unknown/release/subscription.wasm

# Deploy to Stellar Testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/groth16_verifier.wasm \
  --network testnet \
  --source <YOUR_SECRET_KEY>

# Deploy returns a contract ID like: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG6R7WN7KNLQJP5LZW5

# Initialize contracts (after deploying all four)
stellar contract invoke \
  --id <IDENTITY_REGISTRY_ID> \
  --network testnet \
  --source <SECRET_KEY> \
  -- initialize \
  --verifier <VERIFIER_CONTRACT_ID> \
  --human_token <HUMAN_TOKEN_CONTRACT_ID>
```

---

## 7. Phase 2 — Frontend Migration

### 7.1 Remove EVM Dependencies

**Uninstall:**

```bash
cd frontend
pnpm remove wagmi viem @tanstack/react-query @anon-aadhaar/core @anon-aadhaar/react
```

### 7.2 Install Stellar Dependencies

```bash
pnpm add @stellar/stellar-sdk @stellar/freighter-api
```

### 7.3 Replace `config/wagmi.ts` → `config/stellar.ts`

**Delete:** `frontend/src/config/wagmi.ts`

**Create:** `frontend/src/config/stellar.ts`

```typescript
import { SorobanRpc } from "@stellar/stellar-sdk";

export const STELLAR_NETWORK = "TESTNET";
export const STELLAR_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const SOROBAN_RPC_URL = 
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
export const STELLAR_EXPLORER_URL = "https://stellar.expert/explorer/testnet";

export const sorobanServer = new SorobanRpc.Server(SOROBAN_RPC_URL);
```

### 7.4 Replace `config/contracts.ts`

**Before (EVM addresses + ABI):**
```typescript
export const CONTRACTS = {
  identityRegistry: {
    address: "0x2541a918..." as `0x${string}`,
    abi: identityRegistryAbi,
  },
  // ...
};
```

**After (Soroban contract IDs):**

```typescript
export const CONTRACTS = {
  identityRegistry: {
    id: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG6R7WN7KNLQJP5LZW5", // placeholder
  },
  humanToken: {
    id: "CBXH5ERYAHOG2JFHLFYW7QL5DPXFBGZTMHXZ5K4HPKMKN7DW5MHIQRQ", // placeholder
  },
  groth16Verifier: {
    id: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM", // placeholder
  },
  subscription: {
    id: "CAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // placeholder
  },
} as const;
```

### 7.5 Delete ABI Files

The entire `frontend/src/abi/` directory can be deleted — Soroban uses contract specs (XDR), not JSON ABIs. Contract bindings are generated differently:

```bash
# Generate TypeScript bindings from deployed contract
stellar contract bindings typescript \
  --network testnet \
  --contract-id <CONTRACT_ID> \
  --output-dir frontend/src/contracts/identity-registry
```

This generates a full TypeScript client with typed methods.

### 7.6 Simplify `next.config.ts`

Remove all the webpack fallbacks and snarkjs workarounds:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No more ignoreBuildErrors needed (anon-aadhaar removed)
  // No more webpack Node.js builtins fallbacks (no snarkjs)
};

export default nextConfig;
```

---

## 8. Phase 3 — Wallet & Provider Migration

### 8.1 Replace `providers/web3-provider.tsx`

**Before (Wagmi + AnonAadhaar):**
```tsx
<WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <AnonAadhaarProvider _appName="MonadID" _useTestAadhaar={true}>
      {children}
    </AnonAadhaarProvider>
  </QueryClientProvider>
</WagmiProvider>
```

**After (Stellar context):**

```tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isConnected, getAddress, getNetworkDetails, signTransaction } from "@stellar/freighter-api";

interface StellarContextType {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTx: (xdr: string) => Promise<string>;
}

const StellarContext = createContext<StellarContextType>({
  address: null,
  isConnected: false,
  isLoading: true,
  connect: async () => {},
  disconnect: () => {},
  signTx: async () => "",
});

export function StellarProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await isConnected();
      if (connected.isConnected) {
        const addr = await getAddress();
        setAddress(addr.address);
      }
    } catch {
      // Freighter not installed
    } finally {
      setLoading(false);
    }
  };

  const connect = useCallback(async () => {
    try {
      const addr = await getAddress();
      setAddress(addr.address);
    } catch (err) {
      console.error("Failed to connect Freighter:", err);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const signTx = useCallback(async (xdr: string) => {
    const result = await signTransaction(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    return result.signedTxXdr;
  }, []);

  return (
    <StellarContext.Provider
      value={{
        address,
        isConnected: !!address,
        isLoading: loading,
        connect,
        disconnect,
        signTx,
      }}
    >
      {children}
    </StellarContext.Provider>
  );
}

export const useStellar = () => useContext(StellarContext);
```

### 8.2 Replace Wallet Connect Component

**Before:** Used Wagmi's `useAccount()`, `useConnect()`, `useDisconnect()`

**After:** Use the `useStellar()` context hook:

```tsx
"use client";

import { useStellar } from "@/providers/stellar-provider";

export function WalletConnect() {
  const { address, isConnected, connect, disconnect, isLoading } = useStellar();

  if (isLoading) return <Button disabled>Loading...</Button>;

  if (isConnected) {
    return (
      <Button variant="outline" onClick={disconnect}>
        {address?.slice(0, 4)}...{address?.slice(-4)}
      </Button>
    );
  }

  return <Button onClick={connect}>Connect Freighter</Button>;
}
```

---

## 9. Phase 4 — Hooks & Contract Interaction Layer

### 9.1 Soroban Transaction Helper

Create a shared utility for building, simulating, and submitting Soroban transactions:

**Create:** `frontend/src/lib/soroban.ts`

```typescript
import {
  Contract,
  TransactionBuilder,
  Networks,
  SorobanRpc,
  xdr,
  Keypair,
  Address,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { sorobanServer, STELLAR_NETWORK_PASSPHRASE } from "@/config/stellar";

/**
 * Build, simulate, and prepare a Soroban contract invocation transaction.
 * Returns the XDR string ready for signing.
 */
export async function buildContractTx(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Promise<string> {
  const account = await sorobanServer.getAccount(sourceAddress);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulated = await sorobanServer.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  const prepared = SorobanRpc.assembleTransaction(tx, simulated).build();
  return prepared.toXDR();
}

/**
 * Submit a signed transaction XDR and wait for confirmation.
 */
export async function submitTx(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE);
  const response = await sorobanServer.sendTransaction(tx);

  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${response.errorResult}`);
  }

  // Poll for confirmation
  let result = await sorobanServer.getTransaction(response.hash);
  while (result.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1000));
    result = await sorobanServer.getTransaction(response.hash);
  }

  if (result.status === "FAILED") {
    throw new Error("Transaction failed on-chain");
  }

  return response.hash;
}

/**
 * Read-only contract call (no transaction submission).
 */
export async function readContract(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
): Promise<xdr.ScVal | undefined> {
  const account = await sorobanServer.getAccount(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF" // dummy for reads
  ).catch(() => {
    // For simulation-only calls, use a placeholder
    return { accountId: () => "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF" } as any;
  });

  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulated = await sorobanServer.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Read failed: ${simulated.error}`);
  }

  if ("result" in simulated && simulated.result) {
    return simulated.result.retval;
  }

  return undefined;
}
```

### 9.2 Rewrite `hooks/use-verify.ts`

**Before (Wagmi):**
```typescript
const { writeContract } = useWriteContract();
writeContract({
  ...CONTRACTS.identityRegistry,
  functionName: "verifyAndRegister",
  args: [pA, pB, pC, pubSignals],
});
```

**After (Stellar):**

```typescript
"use client";

import { useState } from "react";
import { useStellar } from "@/providers/stellar-provider";
import { CONTRACTS } from "@/config/contracts";
import { buildContractTx, submitTx } from "@/lib/soroban";
import { nativeToScVal, Address } from "@stellar/stellar-sdk";
import type { AadhaarProofData } from "@/lib/aadhaar";

export function useVerify() {
  const { address, signTx } = useStellar();
  const [hash, setHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const verifyWithAadhaar = async (proofData: AadhaarProofData) => {
    if (!address) return;

    try {
      setIsPending(true);
      setError(null);

      // Convert proof data to Soroban ScVal format
      const args = [
        new Address(address).toScVal(),                           // user
        nativeToScVal(proofData.groth16Proof.pi_a, { type: "Vec" }),  // p_a
        nativeToScVal(proofData.groth16Proof.pi_b, { type: "Vec" }),  // p_b
        nativeToScVal(proofData.groth16Proof.pi_c, { type: "Vec" }),  // p_c
        nativeToScVal([proofData.nullifier, "18"], { type: "Vec" }),   // pub_signals
      ];

      const txXdr = await buildContractTx(
        address,
        CONTRACTS.identityRegistry.id,
        "verify_and_register",
        args,
      );

      const signedXdr = await signTx(txXdr);
      setIsPending(false);
      setIsConfirming(true);

      const txHash = await submitTx(signedXdr);
      setHash(txHash);
      setIsConfirming(false);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  const reset = () => {
    setHash(null);
    setIsPending(false);
    setIsConfirming(false);
    setIsSuccess(false);
    setError(null);
  };

  return { verifyWithAadhaar, hash, isPending, isConfirming, isSuccess, error, reset };
}
```

### 9.3 Rewrite `hooks/use-identity.ts`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useStellar } from "@/providers/stellar-provider";
import { CONTRACTS } from "@/config/contracts";
import { readContract } from "@/lib/soroban";
import { Address, scValToNative } from "@stellar/stellar-sdk";

export function useIdentity() {
  const { address } = useStellar();
  const [isLoading, setIsLoading] = useState(true);
  const [identity, setIdentity] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchIdentity = async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await readContract(
        CONTRACTS.identityRegistry.id,
        "get_identity",
        [new Address(address).toScVal()],
      );

      if (result) {
        const parsed = scValToNative(result);
        setIdentity(parsed);
      }
    } catch {
      // Not verified yet — this is expected
      setIdentity(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentity();
  }, [address]);

  return {
    isHuman: identity?.is_human ?? false,
    isOver18: identity?.is_over_18 ?? false,
    isUnique: identity?.commitment_hash != null,
    commitmentHash: identity?.commitment_hash ?? 0n,
    tokenId: BigInt(identity?.token_id ?? 0),
    verifiedAt: BigInt(identity?.verified_at ?? 0),
    isLoading,
    error,
    refetch: fetchIdentity,
  };
}
```

### 9.4 Rewrite `hooks/use-revoke.ts`

```typescript
"use client";

import { useState } from "react";
import { useStellar } from "@/providers/stellar-provider";
import { CONTRACTS } from "@/config/contracts";
import { buildContractTx, submitTx } from "@/lib/soroban";
import { Address } from "@stellar/stellar-sdk";

export function useRevoke() {
  const { address, signTx } = useStellar();
  const [hash, setHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const revoke = async () => {
    if (!address) return;

    try {
      setIsPending(true);
      setError(null);

      const txXdr = await buildContractTx(
        address,
        CONTRACTS.identityRegistry.id,
        "revoke_identity",
        [new Address(address).toScVal()],
      );

      const signedXdr = await signTx(txXdr);
      setIsPending(false);
      setIsConfirming(true);

      const txHash = await submitTx(signedXdr);
      setHash(txHash);
      setIsConfirming(false);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  const reset = () => {
    setHash(null);
    setIsPending(false);
    setIsConfirming(false);
    setIsSuccess(false);
    setError(null);
  };

  return { revoke, hash, isPending, isConfirming, isSuccess, error, reset };
}
```

### 9.5 Rewrite `hooks/use-subscription.ts`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useStellar } from "@/providers/stellar-provider";
import { CONTRACTS } from "@/config/contracts";
import { buildContractTx, submitTx, readContract } from "@/lib/soroban";
import { Address, nativeToScVal, scValToNative } from "@stellar/stellar-sdk";

const TIER_NAMES = ["Free", "Pro", "Enterprise"] as const;

export function useSubscription() {
  const { address, signTx } = useStellar();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hash, setHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    if (!address) { setIsLoading(false); return; }
    try {
      const result = await readContract(
        CONTRACTS.subscription.id,
        "get_subscription",
        [new Address(address).toScVal()],
      );
      if (result) setSubscription(scValToNative(result));
    } catch { setSubscription(null); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchSubscription(); }, [address]);

  const subscribe = async (tier: number) => {
    if (!address) return;
    try {
      setIsPending(true);
      setError(null);
      const txXdr = await buildContractTx(
        address,
        CONTRACTS.subscription.id,
        "subscribe",
        [new Address(address).toScVal(), nativeToScVal(tier, { type: "u32" })],
      );
      const signedXdr = await signTx(txXdr);
      setIsPending(false); setIsConfirming(true);
      const txHash = await submitTx(signedXdr);
      setHash(txHash); setIsConfirming(false); setIsSuccess(true);
      await fetchSubscription();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setIsPending(false); setIsConfirming(false);
    }
  };

  const reset = () => {
    setHash(null); setIsPending(false); setIsConfirming(false);
    setIsSuccess(false); setError(null);
  };

  return {
    tier: subscription?.tier ?? -1,
    tierName: subscription ? TIER_NAMES[subscription.tier] ?? "Unknown" : "None",
    expiresAt: BigInt(subscription?.expires_at ?? 0),
    verificationsUsed: BigInt(subscription?.verifications_used ?? 0),
    verificationLimit: BigInt(subscription?.verification_limit ?? 0),
    isActive: subscription != null,
    isLoading,
    subscribe,
    hash, isPending, isConfirming, isSuccess, error, reset,
    refetch: fetchSubscription,
  };
}
```

### 9.6 Update `lib/aadhaar.ts`

The proof formatting needs to change from EVM tuple format to Soroban ScVal format. However, **the core data structures (`AadhaarProofData`, `Groth16Proof`) stay the same** — only the `formatProofForContract` and `buildAadhaarPublicSignals` functions need to be updated or can be removed (since conversion happens in the hook now).

---

## 10. Phase 5 — Deployment & Infrastructure

### 10.1 Stellar Testnet Deployment Checklist

```
[ ] Install Rust toolchain: rustup target add wasm32-unknown-unknown
[ ] Install Stellar CLI: cargo install stellar-cli --locked
[ ] Generate deployer keypair: stellar keys generate deployer --network testnet
[ ] Fund account via Friendbot: https://friendbot.stellar.org/?addr=<PUBLIC_KEY>
[ ] Build contracts: stellar contract build
[ ] Deploy Groth16Verifier
[ ] Deploy HumanToken
[ ] Deploy IdentityRegistry (pass verifier + token contract IDs)
[ ] Deploy Subscription
[ ] Initialize HumanToken (set registry)
[ ] Initialize IdentityRegistry (set verifier + token)
[ ] Test invocations via CLI
[ ] Update frontend/src/config/contracts.ts with contract IDs
```

### 10.2 Vercel Deployment

Frontend deployment remains the same on Vercel, with updated env variables:

```
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
```

### 10.3 Explorer Links

Update all `monadexplorer.com` references to:

| Purpose | URL |
|---------|-----|
| Transaction | `https://stellar.expert/explorer/testnet/tx/{hash}` |
| Account | `https://stellar.expert/explorer/testnet/account/{address}` |
| Contract | `https://stellar.expert/explorer/testnet/contract/{contractId}` |

---

## 11. Phase 6 — Testing & QA

### 11.1 Backend Tests (Rust)

```rust
// tests/integration.rs
#[cfg(test)]
mod tests {
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_verify_and_register() {
        let env = Env::default();
        // ... create contracts, initialize, invoke verify_and_register
    }

    #[test]
    fn test_soulbound_no_transfer() {
        // Verify no transfer function exists on HumanToken
    }

    #[test]
    fn test_revoke_identity() { /* ... */ }

    #[test]
    fn test_subscription_tiers() { /* ... */ }

    #[test]
    fn test_duplicate_commitment_rejected() { /* ... */ }
}
```

Run with:
```bash
cd backend
cargo test
```

### 11.2 Frontend E2E Checklist

```
[ ] Freighter wallet connects and shows G... address
[ ] QR scanner works (camera + upload)
[ ] Proof generation produces valid nullifier
[ ] "Register Identity" triggers Freighter signing popup
[ ] Transaction confirms on Stellar Testnet
[ ] Transaction hash links to stellar.expert
[ ] Dashboard shows verified identity
[ ] Revoke identity works
[ ] Subscription purchase works (XLM transfer)
[ ] All pages render without errors
```

---

## 12. File-by-File Migration Map

### Files to DELETE

| File | Reason |
|------|--------|
| `backend/hardhat.config.ts` | Replaced by Cargo.toml |
| `backend/package.json` | Replaced by Cargo.toml |
| `backend/pnpm-lock.yaml` | No more npm in backend |
| `backend/tsconfig.json` | Rust, not TypeScript |
| `backend/contracts/*.sol` | All 5 Solidity files → Rust |
| `backend/test/*.test.ts` | All 3 test files → Rust tests |
| `backend/ignition/` | Entire directory (Hardhat Ignition → Stellar CLI) |
| `backend/artifacts/` | Entire directory (EVM artifacts → WASM) |
| `backend/cache/` | Hardhat cache |
| `backend/typechain-types/` | Entire directory (TypeChain → Soroban bindings) |
| `frontend/src/abi/` | Entire directory (3 ABI files) |
| `frontend/src/config/wagmi.ts` | Replaced by stellar.ts |

### Files to CREATE

| File | Purpose |
|------|---------|
| `backend/Cargo.toml` | Rust workspace root |
| `backend/contracts/groth16-verifier/src/lib.rs` | Mock verifier |
| `backend/contracts/human-token/src/lib.rs` | Soulbound token |
| `backend/contracts/identity-registry/src/lib.rs` | Core identity |
| `backend/contracts/subscription/src/lib.rs` | Subscription tiers |
| `frontend/src/config/stellar.ts` | Stellar network config |
| `frontend/src/providers/stellar-provider.tsx` | Freighter wallet context |
| `frontend/src/lib/soroban.ts` | TX building utilities |
| `frontend/src/contracts/` | Generated TypeScript bindings |

### Files to MODIFY

| File | Changes |
|------|---------|
| `frontend/src/config/contracts.ts` | EVM addresses → Soroban contract IDs |
| `frontend/src/hooks/use-verify.ts` | Wagmi `writeContract` → Soroban TX |
| `frontend/src/hooks/use-identity.ts` | Wagmi `readContracts` → Soroban read |
| `frontend/src/hooks/use-revoke.ts` | Wagmi `writeContract` → Soroban TX |
| `frontend/src/hooks/use-subscription.ts` | Full rewrite with Stellar token ops |
| `frontend/src/providers/web3-provider.tsx` | Delete or replace with `StellarProvider` |
| `frontend/src/components/wallet/` | MetaMask → Freighter |
| `frontend/src/components/verify/verify-status.tsx` | Update explorer URLs |
| `frontend/src/lib/aadhaar.ts` | Remove EVM-specific formatting |
| `frontend/next.config.ts` | Remove snarkjs/webpack hacks |
| `frontend/package.json` | Remove wagmi/viem, add stellar-sdk |
| `README.md` | Update architecture, tech stack, contract IDs |

### Files UNCHANGED

| File | Reason |
|------|--------|
| `frontend/src/components/verify/aadhaar-verify-form.tsx` | Chain-agnostic (QR scan + proof gen) |
| `frontend/src/components/verify/qr-scanner.tsx` | Chain-agnostic (html5-qrcode) |
| `frontend/src/components/ui/*` | All shadcn/ui components |
| `frontend/src/components/landing/*` | Static landing page components |
| `frontend/src/components/pricing/*` | Static pricing UI |
| `frontend/src/app/globals.css` | Tailwind CSS |
| `frontend/src/app/layout.tsx` | Only provider import changes |
| `frontend/src/lib/utils.ts` | `cn()` utility — chain-agnostic |
| `frontend/src/lib/format.ts` | Formatting utilities |
| `frontend/src/lib/proof.ts` | Local proof generation |
| `frontend/postcss.config.mjs` | PostCSS config |
| `frontend/tailwind.config.ts` | Tailwind config |

---

## 13. New Dependencies

### Backend (Rust)

```toml
[dependencies]
soroban-sdk = "22.0.0"

[dev-dependencies]
soroban-sdk = { version = "22.0.0", features = ["testutils"] }
```

### Frontend (npm)

| Package | Version | Purpose |
|---------|---------|---------|
| `@stellar/stellar-sdk` | `^12.x` | Core Stellar + Soroban SDK |
| `@stellar/freighter-api` | `^2.x` | Freighter wallet integration |

### Tooling

| Tool | Installation | Purpose |
|------|-------------|---------|
| `rustup` | `curl https://sh.rustup.rs -sSf \| sh` | Rust toolchain |
| `wasm32 target` | `rustup target add wasm32-unknown-unknown` | WASM compilation |
| `stellar-cli` | `cargo install stellar-cli --locked` | Deploy & invoke contracts |
| Freighter Wallet | Browser extension | Signing transactions |

---

## 14. Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Groth16 verification in Soroban** | Soroban has limited crypto primitives — real BN128 pairing is not natively supported | Keep mock verifier for MVP. For production, explore off-chain verification with on-chain attestation |
| **Storage rent / TTL** | Soroban storage entries expire if not bumped | Implement TTL bumps in contract initialization and user interactions. Set generous TTL (1 year+) |
| **Cross-contract call limits** | Soroban has strict resource limits per transaction | Test that identity registration (verifier + token mint) fits within single tx limits |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Freighter adoption** | Fewer users have Freighter vs MetaMask | Provide clear install instructions. Consider WalletConnect for Stellar if available |
| **SDK maturity** | `@stellar/stellar-sdk` Soroban features are newer | Pin specific versions, test thoroughly |
| **I256 type handling** | Groth16 proof values are 256-bit — Soroban's native number types may not suffice | Use `I256` from `soroban-sdk` or encode proof elements as `Bytes` |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Frontend migration | Most UI is chain-agnostic | Only 6 files need blockchain-specific changes |
| QR scanning | Completely chain-agnostic | No changes needed |
| Vercel deployment | Same hosting, fewer workarounds needed | Simpler `next.config.ts` |

---

## 15. Timeline Estimate

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| **Phase 1** | Soroban contracts (Rust) — write, compile, test | 5–7 days |
| **Phase 2** | Frontend config & provider migration | 1 day |
| **Phase 3** | Wallet integration (Freighter) | 1 day |
| **Phase 4** | Hooks & contract interaction rewrite | 2–3 days |
| **Phase 5** | Deployment to Stellar Testnet | 1 day |
| **Phase 6** | Testing & QA | 2–3 days |
| | **Total** | **12–16 days** |

### Critical Path

```
Rust contracts (Phase 1) → Deploy (Phase 5) → Get contract IDs → Hook rewrite (Phase 4)
```

Phases 2 & 3 (frontend config + wallet) can be done in **parallel** with Phase 1.

---

## 16. Appendix: Contract Code Sketches

### A. Cargo.toml for Each Contract

```toml
# contracts/identity-registry/Cargo.toml
[package]
name = "identity-registry"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { workspace = true }

[dev-dependencies]
soroban-sdk = { workspace = true, features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true
```

### B. Generating TypeScript Bindings

After deploying contracts, generate typed clients:

```bash
stellar contract bindings typescript \
  --network testnet \
  --contract-id <IDENTITY_REGISTRY_ID> \
  --output-dir frontend/src/contracts/identity-registry

stellar contract bindings typescript \
  --network testnet \
  --contract-id <SUBSCRIPTION_ID> \
  --output-dir frontend/src/contracts/subscription
```

This generates typed TypeScript clients with methods like:

```typescript
import { Client as IdentityRegistryClient } from "@/contracts/identity-registry";

const client = new IdentityRegistryClient({
  contractId: CONTRACTS.identityRegistry.id,
  networkPassphrase: Networks.TESTNET,
  rpcUrl: SOROBAN_RPC_URL,
});

// Typed method call
const result = await client.is_human({ user: address });
```

### C. Quick Reference: Solidity → Rust Patterns

| Solidity | Soroban (Rust) |
|----------|---------------|
| `msg.sender` | `user: Address` param + `user.require_auth()` |
| `mapping(address => T)` | `env.storage().persistent().get(&DataKey::Key(addr))` |
| `require(condition, "msg")` | `if !condition { panic!("msg") }` |
| `emit Event(...)` | `env.events().publish((topic,), data)` |
| `block.timestamp` | `env.ledger().timestamp()` |
| `address(this).balance` | Query via SAC token client |
| `payable` | Explicit `token::Client::transfer()` |
| `modifier onlyOwner` | `admin.require_auth()` at function start |
| `immutable` | Set once in `initialize()`, read from instance storage |
| `constructor(args)` | `pub fn initialize(env, args)` — called once post-deploy |
| `revert CustomError()` | `panic!("custom error message")` or return `Err(Error)` |
| `type(uint256).max` | `u64::MAX` or `i128::MAX` |

---

## Summary

The migration from Monad (EVM) to Stellar (Soroban) is a **moderate-complexity rewrite** primarily affecting:

1. **Backend**: Complete rewrite from Solidity to Rust (4 contracts)
2. **Frontend blockchain layer**: Replace Wagmi/Viem with Stellar SDK (~6 files)
3. **Wallet**: MetaMask → Freighter
4. **Infrastructure**: Hardhat → Stellar CLI

The good news: **~70% of the frontend codebase is chain-agnostic** (UI components, QR scanner, proof generation, styling) and requires zero changes. The migration is surgical on the frontend side.

The main challenge is the Rust smart contracts — Soroban's programming model is fundamentally different from EVM, requiring careful attention to storage TTL, authentication patterns, and cross-contract calls.
