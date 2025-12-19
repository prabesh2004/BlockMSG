Project: Web3 Learning dApp (React + Ethereum)
1. Objective

Build a Web3 learning project using React and Ethereum that:

Functions as a real decentralized application

Teaches the developer while building

Maintains clear progress tracking

Uses modern, minimal, black-themed UI

Avoids unnecessary complexity or visual noise

This project is educational-first, not hype-driven.

2. Core Philosophy (Very Important)

Every technical decision must be explained

No “magic” code

No silent abstractions

Learning is as important as completion

The system should behave like a senior developer pair-programming and explaining concepts.

3. Functional Requirements
3.1 Application Features

The application must support:

Wallet connection via MetaMask

Display of connected wallet address

Display of ETH balance

Sending ETH to another address

Writing a message to a smart contract

Reading messages from the blockchain

Displaying transaction status (pending, success, failure)

All interactions must use Ethereum Sepolia testnet.

4. Technical Stack (Mandatory)
Frontend

React (Vite or Next.js)

ethers.js

MetaMask

Smart Contracts

Solidity

Hardhat

Blockchain

Ethereum Sepolia Testnet

5. Learning & Documentation Requirements (Critical)
5.1 learn.md (Mandatory)

The agent must create and continuously update a file called:

learn.md


This file must:

Explain what was built

Explain why it was built

Explain how it works

Explain new concepts introduced

Each section should include:

Plain English explanations

Short examples

No unnecessary jargon

Example structure:

## Wallet Connection
What problem it solves
How MetaMask injects window.ethereum
What a provider is
What a signer is


The file must be updated after every major step.

5.2 progress.md (Mandatory)

The agent must maintain a progress log in:

progress.md


Purpose:

Allow backtracking

Show chronological development

Track decisions and milestones

Each entry must include:

### Step X – <Title>
Date:
What was implemented
Files changed
Why this step exists
What concepts were learned


No steps should be skipped.

6. Code Quality Requirements

Use functional React components only

Keep functions small and readable

Avoid premature optimization

Prefer clarity over cleverness

Explicit variable names

Bad example:

const x = await c.f();


Good example:

const transaction = await contract.sendMessage(message);

7. Smart Contract Rules

Contracts must be simple

No inheritance unless necessary

No advanced patterns (proxies, upgrades)

Every function must be commented

Explain gas implications in learn.md

8. UI / Design Requirements (Strict)
Color Theme

Primary: Black / Dark Gray

Secondary: White / Soft Gray

Accent: Subtle neutral tones only

Explicit Restrictions

❌ NO random gradients

❌ NO bright neon colors

❌ NO unnecessary animations

❌ NO glassmorphism

Design Style

Modern

Minimal

Developer-focused

High contrast

Clean typography

Opinionated rule:

If a visual element does not improve clarity, remove it.

9. Folder Structure (Recommended)
project-root/
 ├── contracts/
 ├── scripts/
 ├── frontend/
 │   ├── src/
 │   ├── styles/
 ├── learn.md
 ├── progress.md
 └── README.md

10. Teaching Behavior (Agent Instructions)

While implementing, the agent must:

Explain before or after writing code

Never assume prior Web3 knowledge

Explain errors and failures

Explain MetaMask popups and transactions

Explicitly state what is happening on-chain

The agent should act like a mentor, not an auto-generator.

11. Non-Goals (Out of Scope)

NFT marketplaces

Token launches

DeFi protocols

Metaverse features

Production mainnet deployment

These are intentionally excluded.

12. Success Criteria

This project is successful if the developer can:

Explain how wallets work

Explain how ETH is transferred

Explain what gas is

Explain how frontend talks to blockchain

Modify the smart contract confidently

Debug failed transactions

13. Final Instruction to Agent (Important)

Do not optimize for speed.
Optimize for understanding.
Teach first. Build second.