# Web3 Learning dApp

A teaching-grade React + Ethereum experience that walks you through connecting MetaMask, reading balances, sending ETH, and storing a single message on-chain.

## Table of Contents
- Overview
- Architecture & Flow
- Smart Contract Snapshot
- Getting Started
	- Prerequisites
	- Hardhat workflow
	- Frontend workflow
- Deploy the UI on Netlify
- Documentation & Learning Assets
- Repository Layout

## Overview
- Connect MetaMask, display the address and Sepolia balance, and keep the UI in sync with whichever network you choose (Hardhat local, Sepolia, etc.).
- Send ETH, sign transactions with your wallet, and write to a writable `MessageBoard` smart contract while the UI surfaces wallet and transaction states.
- Read the current message, the last writer, and the timestamp without paying gas, and watch every status update in the React interface.

## Architecture & Flow
1. **Browser (React + Vite)** – The UI under `frontend/src` calls `ethers.js`, interacts with MetaMask, and renders wallet details, transaction states, and messages.
2. **MetaMask** – Provides the `window.ethereum` provider/signer pair, triggers connection and signing prompts, and pushes transactions to your selected network.
3. **Hardhat + MessageBoard.sol** – Compiles/deploys the contract; `scripts/deploy.js` ships the address + ABI to `frontend/src/contracts/MessageBoard.json` so the UI knows where to send calls.
4. **Ethereum network (Sepolia/local)** – `setMessage` writes data and costs gas; `getMessage` / `getMessageInfo` remain view-only and free.

## Smart Contract Snapshot
- **Contract**: `MessageBoard.sol` (Solidity 0.8.27)
	- State: `message`, `lastWriter`, `lastUpdated`
	- Event: `MessageSet(address indexed writer, string message, uint256 timestamp)` so the frontend can react to new messages without polling.
	- Functions: `setMessage(string memory)` (state-changing, gas-heavy), `getMessage()` and `getMessageInfo()` (view-only, free).
- **Deployment**: Run `npx hardhat run scripts/deploy.js --network sepolia` (or `localhost`). The script waits for the transaction, prints the address, and writes `{ address, abi }` to `frontend/src/contracts/MessageBoard.json`.
- **Gas notes**: Writing updates three storage slots plus an event (~50k gas) while reads stay free; the UI explicitly calls this out for teaching purposes.

## Getting Started
### Prerequisites
- Node.js 18+ (needed for Hardhat 3.x and Vite 7).
- npm (bundled with Node).
- MetaMask (pointed to Sepolia or your local Hardhat node).
- Optional: Faucet ETH for Sepolia if you are targeting testnet deployment.

### Hardhat workflow (project root)
```bash
npm install
npx hardhat compile
npx hardhat test
```
- For local testing, spin up a node with `npx hardhat node`.
- For Sepolia deployments:
	- Copy `.env.example` → `.env` and fill `SEPOLIA_RPC_URL` + `DEPLOYER_PRIVATE_KEY`.
	- Deploy the message board: `npx hardhat run scripts/deploy.js --network sepolia` (swap `--network localhost` if you prefer a local deployment).
	- The script logs the deployed address and updates `frontend/src/contracts/MessageBoard.json` so the UI knows the ABI + address.
	- Commit that JSON if you want Netlify to serve the right contract data.

### Frontend workflow (`frontend/`)
```bash
cd frontend
npm install
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # production bundle in dist/
npm run preview    # locally serve the production build
```
- `App.jsx` handles wallet connection, balance display, status messages, and calls into the contract (importing `frontend/src/contracts/MessageBoard.json`).
- If the JSON file is missing or outdated, rerun the deployment script or copy the address + ABI from Hardhat’s output before starting the frontend.

## Deploy the UI on Netlify
1. Push this repository to GitHub (or another git provider) and log into Netlify.
2. Create a **New site from Git** and connect your repo/branch.
3. Netlify can auto-detect settings via `netlify.toml` (already included).
	 - If you prefer manual settings:
	 - **Base directory**: `frontend`
	 - **Build command**: `npm run build`
	 - **Publish directory**: `dist`
4. Set **Environment variables** so the hosted UI targets the right network:
	- `VITE_CONTRACT_ADDRESS` = your deployed contract address (e.g., Sepolia address)
	- `VITE_CONTRACT_CHAIN_ID` = chain ID in decimal (e.g., `11155111` for Sepolia)
5. Important: a hosted dApp cannot talk to your local Hardhat node. Deploy the contract to Sepolia (or another public network) and use that address/chain ID.
6. Netlify will install dependencies, run the build inside `frontend`, and publish the static bundle.
7. Ensure `frontend/src/contracts/MessageBoard.json` is present (kept as a fallback) but the env vars above will be used in production builds to avoid Hardhat-local addresses breaking the UI.
8. Optional: configure a custom domain or HTTPS redirects in Netlify’s Site settings.


## Repository Layout
- `contracts/` – Solidity sources (`MessageBoard.sol`).
- `scripts/` – Deployment helpers (`deploy.js`, `deploy.cjs`, helpers for saving ABI/address).
- `frontend/` – Vite + React UI. `src/contracts/MessageBoard.json` is the contract metadata consumed by the UI.
- `artifacts/`, `cache/`, `test/` – Hardhat build output and tests.
