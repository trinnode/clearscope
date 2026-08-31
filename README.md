# ClearScope

Compliance proofs without disclosure. Prove eligibility without revealing underlying data.

![CI](https://github.com/trinnode/clearscope/actions/workflows/ci.yml/badge.svg)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Built on [Midnight Network](https://midnight.network) with the [Compact](https://docs.midnight.network/compact) smart contract language.

---

## Table of contents

- [The problem](#the-problem)
- [The primitive](#the-primitive)
- [The flow](#the-flow)
- [Identity model](#identity-model)
- [Quick start](#quick-start-five-minutes)
- [Multi-identity walkthrough](#multi-identity-walkthrough)
- [Access management](#access-management)
- [Running the smart contracts on a local devnet](#running-the-smart-contracts-on-a-local-devnet)
- [Running the tests](#running-the-tests)
- [Deploying](#deploying)
- [Architecture](#architecture)
- [Edge cases handled](#edge-cases-handled)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## The problem

A person holds a credential that proves something about them. An institution needs to know **one fact** derived from that credential, such as whether the person is over 18, without receiving the underlying document or any fact beyond the one being asked.

ClearScope is the layer between the credential and the question. It does not store credentials. It does not replace the issuer. It answers a specific, scoped question on demand, and nothing more.

## The primitive

A **disclosure policy** is a named, versioned rule that takes a private credential attribute and a request context, and returns exactly one of:

| Result | Meaning |
| --- | --- |
| PASS | The check passed. |
| FAIL | The check ran and did not meet the bar. |
| INSUFFICIENT_SCOPE | There was nothing to check against. |

Nothing else ever leaves private state.

Three policies ship in Wave 1, each a different shape of the same primitive:

| Policy | Question answered | Private input | Public output |
| --- | --- | --- | --- |
| age-threshold-v1 | Is the holder older than N years? | Date of birth | boolean |
| kyc-tier-v1 | Is the holder KYC tier N or above? | Tier value (1 to 4) | boolean |
| jurisdiction-exclusion-v1 | Is the holder outside a named excluded set? | Jurisdiction code | boolean |

New policies can be **composed** with AND/OR logic from the console and registered on the policy registry, then used by verifiers like any base policy.

## The flow

1. **Verifier** creates a scoped request against a policy and shares a request link with the holder.
2. **Holder** opens the link, sees exactly what will and will not be shared, selects a credential, and generates a zero-knowledge proof.
3. **Verifier** receives PASS / FAIL / INSUFFICIENT_SCOPE plus a cryptographic proof reference. Never the raw data.
4. **Issuer** mints credentials into the holder's private state (e.g. a government ID with a date of birth, a KYC tier, a jurisdiction attestation).
5. **System** (the registry authority) composes and registers disclosure policies.
6. Both sides can pull a full audit trail from the disclosure log.

## Identity model

ClearScope runs as a **multi-account console**. Every party on the network is a distinct Midnight identity with its own key pair, derived address, and portal:

| Persona | Address derived from | Portal |
| --- | --- | --- |
| Holder | own seed phrase | Wallet, Disclosure log |
| Verifier | own seed phrase | Dashboard, New request |
| Issuer | own seed phrase | Issuer portal |
| System | own seed phrase | Governance console, Policy registry, Compose policy |

- Identities are created once (with a 24-word seed backup + verification step) and signed into later with the seed phrase — no forced re-creation on return.
- The console ships with **four pre-created demo personas** (one per role, with well-known seeds and addresses). The launcher offers **Continue as Demo Holder / Verifier / Issuer / System** so the walkthrough works with zero setup; each persona can still be re-created from scratch.
- Seeds are **never stored in the browser**. They are verified server-side on sign-in and held in memory for the session only.
- The public state exposed by the API never contains seed phrases (verified by design and by test).
- **Issuers and verifiers are licensed organizations, holders are individuals.** The demo store seeds active licenses for the demo issuer and demo verifier; every other identity must be accredited by the governance authority before it can act in an organizational role.

## Quick start (five minutes)

This gets you from a cold clone to a running console with no devnet or Midnight wallet needed.

```bash
git clone https://github.com/trinnode/clearscope.git
cd clearscope

npm install     # install dependencies

npm run dev     # start the app (default port 3000)
```

Open http://localhost:3000. From the landing page, click **Enter Console**.

> The app listens on port 3000 by default. If that port is busy, override it:
> `PORT=3001 npm run dev` (or set `PORT` in `.env.local`).

The first time you enter, you land on the **identity launcher** at `/identity`. Four demo personas are already seeded — hit **Continue as Demo …** to jump straight into any portal, or **Create … identity** to mint a brand-new key pair (with seed backup + verification) that replaces the demo persona for that role.

### Network status

The network chip in the holder wallet probes the local Midnight devnet (`node :9944`, `indexer :8088`, `proof-server :6300`) by default and shows **network online** when the devnet is up, or **network idle** otherwise. Switch probe targets with `CLEARSCOPE_NETWORK=preview|preprod|mainnet` in `.env.local`. The chip always reports the honest status of what it probed.

## Multi-identity walkthrough

A complete, realistic demo run uses all four personas:

1. **System** → open the **governance console** (`/governance`) and review the registry. The demo issuer and verifier ship pre-accredited; issue a license to a new entity to see the flow. Then compose a policy (e.g. "Regulated Adult KYC": AND of age-threshold + kyc-tier) and register it.
2. **Issuer** → issue credentials **to the holder wallet** (the issuer portal targets the specific holder by address; pick attributes that answer the base policies, e.g. a date of birth for the age policy).
3. **Holder** → verify the wallet now holds the issued credential; open the disclosure log.
4. **Verifier** → create a new request **addressed to the holder** (the request composer targets a specific holder by address, with a quick-pick chip for the registered holder), set parameters and expiry, copy the request link.
5. **Holder** → open the request link, select a credential, and generate a proof. See the PASS / FAIL / INSUFFICIENT_SCOPE result and the proof reference.
6. **Verifier** → open the same request and confirm the on-chain result and proof reference; the holder's disclosure log grows an entry.

### Targeted addressing at scale

Every credential and every request names its **target holder by address** (`holder`), and every credential names its issuer identity (`issuerAddress`). That is what keeps a deployment with 100 issuers, 1,000 verifiers, and 5,000 holders coherent:

- An **issuer** issues *to a specific holder*; the server rejects any target that is not a registered holder identity (403).
- A **verifier** creates a request *for a specific holder*; the server forces the `requester` to be the caller and rejects unknown targets (403).
- A **holder** only ever sees the credentials issued to them and the requests addressed to them; the disclosure log is scoped the same way.
- A **verifier** only sees the requests they originated, with the target holder shown in the requests table.
- An **issuer** only sees the credentials they issued.
- A **holder** cannot answer a request addressed to a different holder (403).

To move between personas, use **switch identity** in the sidebar (desktop) or drawer (mobile) — it returns you to `/identity` where you can continue, sign in with a seed phrase, or create a new persona.

## Access management

Every portal is **role-gated**, server side and client side, on top of a licensing model:

- **Client**: each page is wrapped in a `RoleGate` for its required persona. Opening a URL for another role's portal shows a *restricted area* screen with persona-switch actions instead of the content. Issuer and verifier portals additionally show a *pending accreditation* screen when the signed-in identity holds no active license for that role.
- **Server sessions (authentication)**: signing in verifies the seed phrase against the stored identity and issues an opaque **bearer token** bound to that role + address. Every mutation is authenticated with that token; the actor address is resolved **server-side from the session and never accepted from the client**. Forging an address in a request body is impossible.
- **Accreditation (authorization)**: issuer and verifier actions require the caller to hold a **live ACTIVE license** bound to their address in the governance registry. The server returns **403** with a distinct message for missing, suspended, revoked, or expired licenses. For example:
  - `issue credential` requires an accredited **issuer** license.
  - `create request` requires an accredited **verifier** license, and the request's `requester` is always the session's address.
  - `compose policy` and license management require the **system** identity (the governance authority — the bootstrapped trust anchor, mirroring the on-chain `registryAuthority`).
  - `respond to request` requires the **holder** identity.
  - Signing in with the wrong seed returns **401**.
- **Segregation of duties**: a verifier cannot verify a credential it issued itself — responding with a credential whose `issuerAddress` equals the request's `requester` is rejected (403).
- **Sessions**: bearer tokens are tracked per role in `localStorage` (`clearscope-tokens`); sign-in state and the active role live in `clearscope-session` / `clearscope-active-role`; seed phrases live in memory only and are never persisted to the browser.
- **Deleting an identity** removes it from the server, clears its sessions, and drops its credentials (holder credentials are part of the holder's private state).

This mirrors the on-chain authority model: `policy_registry.compact` gates `registerPolicy` to a single `registryAuthority` via `witnessCaller()`, and `disclosure_request.compact` keys each record by its requester address.

## Running the smart contracts on a local devnet

The contracts are real Compact. To compile and deploy them locally:

### Prerequisites

- Node.js 22+
- Docker and Docker Compose v2
- The [Compact compiler](https://docs.midnight.network/getting-started/installation)

### Steps

```bash
# 1. install the Compact toolchain
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

# 2. start the local devnet (node, indexer, proof server)
npm run devnet:up

# 3. compile the contracts into ZK circuits + TypeScript APIs
cd contracts
compact compile disclosure_request.compact managed/disclosure_request
compact compile policy_registry.compact managed/policy_registry
compact compile policies/age_threshold_v1.compact managed/age_threshold_v1
compact compile policies/kyc_tier_v1.compact managed/kyc_tier_v1
compact compile policies/jurisdiction_exclusion_v1.compact managed/jurisdiction_exclusion_v1
compact compile credential_store.compact managed/credential_store
cd ..

# 4. configure network endpoints
cp .env.example .env.local
```

The compiled output lands in `contracts/managed/`, consumed by the Midnight SDK layer in `src/lib/midnight/` (deploy, witnesses, config). With the devnet running, the console's network chip reports **network online**.

## Running the tests

```bash
npm test            # 13 policy unit tests (true, false, boundary, malformed cases)
npm run typecheck   # full TypeScript check (tsc --noEmit)
npm run build       # production build (Next.js)
```

### CI

The `.github/workflows/ci.yml` workflow runs the typecheck, all policy tests, the production build, and compiles every Compact contract. The badge at the top of this README is wired to that workflow's actual results.

## Deploying

The app is a server-backed Next.js app (see [Architecture](#architecture)) and ships with two deployment paths:

- **Vercel**: the included `vercel.json` imports the project as a Next.js app. The JSON data store (`/.data/db.json`) is created at runtime on the first request.
- **Docker**: `docker build` uses the multi-stage `Dockerfile` (which sets `STANDALONE=1` for the standalone output). Run it with the working directory containing `.data` for persistent state.

Environment variables (all optional) are documented in `.env.example`.

## Architecture

### Dual ledger model

Midnight keeps two parallel states. ClearScope uses the boundary deliberately:

- **Public ledger state**: request records `{ request_id, policy_id, params_hash, requester, expiry, status }` and the PASS / FAIL / INSUFFICIENT_SCOPE result. This is the only thing public. Private attribute values never touch a public field, which is verifiable by reading the struct definitions alone.
- **Private state**: the holder's credential attributes (date of birth, tier value, jurisdiction code), stored encrypted on the user device. They are only touched inside the witness / circuit computation that produces the boolean result.
- **The boundary function**: each policy is a pure function `(private_attribute, public_params) -> PolicyResult`. Same signature across all three policies. The attribute itself is never a return value.

### Contract structure

```
contracts/
  policy_registry.compact        # public: registered policy IDs, versions, hashes of logic; authority-gated registration
  disclosure_request.compact     # public: request lifecycle (created, responded, expired), keyed by requester
  PolicyResultModule.compact     # shared PolicyResult enum
  credential_store.compact       # private state: holder's attested attributes
  policies/
    age_threshold_v1.compact
    kyc_tier_v1.compact
    jurisdiction_exclusion_v1.compact
  managed/                       # compact-compiled ZK circuits + TypeScript contract APIs
  __tests__/
    policies.test.ts             # 13 policy unit tests
```

### Application structure

```
src/
  app/                           # Next.js App Router
    page.tsx                     # cinematic landing page (always dark)
    identity/page.tsx            # persona launcher: create / continue / sign in
    holder/                      # holder wallet, respond flow, disclosure log
    verifier/                    # dashboard, new request, request detail
    issuer/                      # issuer portal
    governance/                  # accreditation & license registry
    governance/policies/         # policy registry + compose policy
    api/
      state/                     # GET /api/state            (public DB, no seeds)
      auth/login/                # POST seed-verified sign-in -> bearer token (401 on mismatch)
      auth/logout/               # POST revoke a role's session
      identity/                  # POST/DELETE /api/identity (create / delete persona)
      identity/backup/           # POST seed-backup status
      network/                   # GET probes Midnight node / indexer / proof server
      accreditations/            # POST issue license        (system-gated)
      accreditations/[id]/       # PATCH suspend / revoke / reactivate (system-gated)
      credentials/               # POST issue credential      (accredited issuer, 403 otherwise)
      policies/                  # POST compose policy        (system-gated)
      requests/                  # POST create request        (accredited verifier)
      requests/[id]/respond/     # POST respond with proof    (holder-gated, segregation of duties)
      reset/                     # POST restore seed state
  components/
    AppShell.tsx                 # gate: loader / error / launcher / console shell
    IdentityLauncher.tsx         # persona create-continue-sign-in grid
    IdentityWizard.tsx           # key generation, seed backup + verification
    RoleGate.tsx                 # per-role + license access control for every portal page
    Sidebar.tsx / MobileNavbar.tsx  # role-filtered navigation + identity switcher (desktop/mobile drawer)
    ThemeToggle.tsx              # light / dark theme switch
    Toaster.tsx, EmptyState.tsx, MonoText.tsx, StatusBadge.tsx, PageHeader.tsx, ...
  data/
    provider.tsx                 # DataProvider / useData: state fetch, sessions, all mutations
    credentials.ts, policies.ts, requests.ts   # seed demo data
  lib/
    sdk/                         # isomorphic SDK: types, checks (evaluatePolicy), wallet (seeds/addresses)
    server/db.ts                 # JSON data store + all role-gated, license-gated operations
    server/sessions.ts           # server-side bearer sessions (in-memory, TTL 24h)
    server/actor.ts              # resolves the authenticated actor from the request
    midnight/                    # Midnight.js deploy, witnesses, config
    roles.ts                     # persona metadata (label, home, blurbs)
```

### Data layer

State is persisted in a single JSON file at `.data/db.json` (gitignored), seeded on first run, mutated serially through a lock, and served to the client through the API routes. The client `DataProvider` fetches `/api/state` and drives every mutation with loading states and toast feedback. Reset the console from the app or with `POST /api/reset`.

## Edge cases handled

- **Expired request**: clear expired state, not a silent failure.
- **Policy version mismatch**: requests stay bound to the version they were created against.
- **No matching credential**: returns INSUFFICIENT_SCOPE, never conflated with FAIL.
- **Credential revoked after response**: the receipt stays valid for the point in time it was generated, stated in the UI.
- **Duplicate response attempts**: rejected at the contract level.
- **Scope widening**: no code path or UI option allows asking for more than the policy answers.
- **Clock skew**: expiry is read from chain state, not the device clock.
- **Malformed params**: contract level input validation (for example N below 0 for age).
- **Proof failure mid flow**: clearly failed state, never an ambiguous "maybe it went through".
- **Cross-role access**: every mutation and every page is gated by persona — 403 server-side, restricted screen client-side.
- **Wrong seed / wrong persona sign-in**: explicit 401, no partial state.
- **Orphaned data**: deleting the holder identity removes its private credentials.

## Roadmap

- **Delegated verification**: let a verifier authorize an auditor to review the disclosure log.
- **Live on-chain deployment**: wire the console's mutations to deployed Compact contracts on a devnet/preview via `src/lib/midnight/` instead of the demo data store.
- **Cross chain portability (Cardano)**: a single forward looking line, Wave 3 territory.

## License

Apache 2.0. See [LICENSE](LICENSE).

## Acknowledgments

- [Midnight Network](https://midnight.network) dual ledger model and documentation
- [Compact](https://docs.midnight.network/compact) smart contract language and compiler
- Midnight.js SDK (`@midnight-ntwrk/midnight-js-*`) for providers and contract deployment
- [Aceternity UI](https://ui.aceternity.com) for restrained frontend components