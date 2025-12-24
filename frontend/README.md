# BlockMSG Frontend

This folder contains the BlockMSG UI (React + Vite).

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Routing
The app uses hash-based routing so static hosts work without special rewrite rules:
- `/#/learn`
- `/#/deploy`
- `/#/demo`

## Contract configuration (hosting)
The Demo page needs a deployed `MessageBoard` contract.

For hosted builds (Netlify / GitHub Pages), set these environment variables at build time:
- `VITE_CONTRACT_ADDRESS` (your deployed contract address)
- `VITE_CONTRACT_CHAIN_ID` (decimal chain id, e.g. `11155111` for Sepolia)

If you’re running locally, the Hardhat deploy script writes a fallback address + ABI into:
- `src/contracts/MessageBoard.json`
