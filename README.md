# BlockMSG

BlockMSG is a Web3 learning app with a real on-chain demo.

It’s structured as three pages:
- **Learn**: rendered from a Markdown guide
- **Deploy**: how to deploy the contract + wire the frontend
- **Demo**: connect MetaMask and post/read a message from the blockchain


## What you’ll learn
- How a React dApp talks to MetaMask via `window.ethereum`
- The difference between **reads** (free) and **writes** (cost gas)
- How to deploy a Solidity contract and pass its address to a frontend
- How to make static hosting work (Netlify / GitHub Pages) using environment-based config

## App architecture
- **Smart contract**: `contracts/MessageBoard.sol`
- **Hardhat (v3)**: compile + deploy from the repo root
- **Frontend**: Vite + React in `frontend/`
  - Uses hash-based routing so static hosts don’t need server rewrites
  - Loads Learn content from `frontend/src/content/blockchain.md`

## Smart contract snapshot
- **State**: `message`, `lastWriter`, `lastUpdated`
- **Write**: `setMessage(string)` (requires gas)
- **Read**: `getMessage()`, `getMessageInfo()` (free)

## Run locally (Hardhat + Vite)
### 1) Install deps
```bash
npm install
cd frontend
npm install
```

### 2) Start a local chain
In the project root:
```bash
npx hardhat node
```

### 3) Deploy the contract to localhost
In another terminal (project root):
```bash
npx hardhat run scripts/deploy.js --network localhost
```
This writes the ABI + deployed address to `frontend/src/contracts/MessageBoard.json`.

### 4) Start the frontend
```bash
cd frontend
npm run dev
```
Open the app and go to:
- `/#/learn`
- `/#/deploy`
- `/#/demo`

## Deploy to Sepolia
### 1) Configure secrets (project root)
Create a `.env` file (do not commit it):
```bash
SEPOLIA_RPC_URL=https://...
DEPLOYER_PRIVATE_KEY=0x...
```

### 2) Deploy
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## Host the frontend (Netlify)
This repo includes [netlify.toml](netlify.toml) with:
- base: `frontend`
- build: `npm run build`
- publish: `dist`

Set these Netlify environment variables (so the hosted build talks to Sepolia):
- `SEPOLIA_RPC_URL` = Your URL
- `DEPLOYER_PRIVATE_KEY` = Your private key

Important: Vite env vars are baked into the build output. Set them before building on Netlify.

## Repo layout
- `contracts/` Solidity contract(s)
- `scripts/` Hardhat deployment scripts (Hardhat v3 uses a viem-based deploy)
- `frontend/` React + Vite UI
- `frontend/src/pages/` Learn / Deploy / Demo pages
- `frontend/src/content/blockchain.md` Learn content source
