# Web3 Learning Guide

**Purpose**: This document explains every concept you encounter while building this dApp.  
**Updated**: December 18, 2025

---

## What is Web3?

**Web3** is the idea of a decentralized internet built on blockchain technology.

- **Web1** (1990s-2000s): Static websites, read-only
- **Web2** (2000s-today): Interactive apps, but companies own your data (Facebook, Google)
- **Web3** (now): You own your data, interact directly with blockchains, no middlemen

### Key Difference
In Web2, when you send money via PayPal, PayPal controls the transaction.  
In Web3, when you send ETH, **you** control it directly through code on a blockchain.

---

## Core Concepts We'll Learn

### 1. Blockchain
A **blockchain** is a shared database that:
- Nobody owns (decentralized)
- Everyone can read
- Can only be changed by following rules (smart contracts)
- Records are permanent (immutable)

Think of it as a notebook that thousands of computers maintain together. You can't erase pages, only add new ones.

### 2. Ethereum
**Ethereum** is a blockchain that can run programs (smart contracts).
- **Bitcoin**: Digital money
- **Ethereum**: Digital money + programmable applications

We'll use **Sepolia**, which is Ethereum's test network. It works exactly like real Ethereum but uses fake ETH so you can experiment safely.

### 3. Wallet
A **wallet** is software that stores your:
- **Private Key**: Your password (NEVER share this)
- **Public Key**: Your account address (safe to share)

**MetaMask** is the most popular browser wallet. It's like a secure keychain for your crypto accounts.

### 4. Smart Contract
A **smart contract** is code that runs on the blockchain.

Example: 
```solidity
// This contract stores a message
contract MessageBoard {
    string public message;
    
    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}
```

Once deployed, this code runs forever on Ethereum. Anyone can call `setMessage()` to update it.

### 5. Gas Fees
Every action on Ethereum costs **gas** (paid in ETH).

Why? Because thousands of computers must:
1. Verify your transaction
2. Execute the code
3. Store the result forever

Writing data costs more gas than reading data. We'll see this in action.

### 6. Transactions
A **transaction** is any action that changes the blockchain:
- Sending ETH
- Calling a smart contract function
- Deploying a contract

Transactions:
- Cost gas
- Take time (10-30 seconds on Sepolia)
- Are permanent once confirmed

---

## What We're Building

A simple dApp that teaches you to:
1. Connect your MetaMask wallet
2. Check your ETH balance
3. Send ETH to someone
4. Write messages to a smart contract
5. Read messages from the blockchain

---

## Technical Stack Explained

### Frontend
- **React**: JavaScript library for building user interfaces
- **Vite**: Fast build tool (alternative to Create React App)
- **ethers.js**: Library to talk to Ethereum from JavaScript

### Smart Contracts
- **Solidity**: Programming language for Ethereum contracts
- **Hardhat**: Developer tool for compiling, testing, and deploying contracts

### Blockchain
- **Sepolia Testnet**: Safe testing environment with free fake ETH

---

## Smart Contract Development (In-Depth)

### Solidity Language Basics

**Solidity** is a programming language designed specifically for Ethereum smart contracts. It looks similar to JavaScript but has important differences.

#### Basic Structure
```solidity
// SPDX-License-Identifier: MIT        ← License (required)
pragma solidity ^0.8.27;               ← Compiler version

contract MyContract {                   ← Like a "class" in other languages
    // State variables (stored on blockchain)
    string public data;
    
    // Functions (executable code)
    function setData(string memory _data) public {
        data = _data;
    }
}
```

#### Key Types in Solidity
- `string` - Text data (expensive to store)
- `address` - Ethereum wallet address (20 bytes)
- `uint256` - Unsigned integer (0 to very large numbers)
- `bool` - true/false
- `bytes` - Raw binary data

#### Visibility Modifiers
- `public` - Anyone can call/read (external + internal)
- `private` - Only this contract can access
- `internal` - This contract + child contracts
- `external` - Only callable from outside

#### Function Modifiers
- `view` - Reads data but doesn't modify state (FREE)
- `pure` - Doesn't read or modify state (FREE)
- `payable` - Can receive ETH
- *(no modifier)* - Can modify state (COSTS GAS)

### Storage vs Memory vs Calldata

This is crucial for gas optimization:

- **storage** - Permanent blockchain storage (VERY EXPENSIVE)
  ```solidity
  string storage permanentData;  // Lives forever on blockchain
  ```

- **memory** - Temporary storage during function execution (CHEAPER)
  ```solidity
  function doSomething(string memory tempData) public {
      // tempData only exists during this function call
  }
  ```

- **calldata** - Read-only temporary storage (CHEAPEST)
  ```solidity
  function process(string calldata data) external {
      // data cannot be modified, only read
  }
  ```

### Understanding msg.sender and msg.value

Every function call has context variables:

- `msg.sender` - Address of whoever called the function
  ```solidity
  // If wallet 0x123... calls this, msg.sender = 0x123...
  address caller = msg.sender;
  ```

- `msg.value` - Amount of ETH sent with the transaction
  ```solidity
  function deposit() public payable {
      // If someone sends 1 ETH, msg.value = 1000000000000000000 wei
  }
  ```

- `msg.data` - Raw data of the transaction
- `block.timestamp` - Current time (Unix timestamp)
- `block.number` - Current block number

### Events: Cheap Logs vs Expensive Storage

Events are a way to "log" information that's cheaper than storage:

```solidity
// Define the event
event MessageSet(address indexed sender, string message);

// Emit the event
function setMessage(string memory _msg) public {
    message = _msg;
    emit MessageSet(msg.sender, _msg);  // Log it
}
```

**Why use events?**
- 90% cheaper than storing in state variables
- Frontend can listen for events in real-time
- Searchable using `indexed` parameters
- Creates an immutable audit trail

**Limitations:**
- Cannot be read by other smart contracts
- Only accessible off-chain (by frontends)

### Gas Costs Explained

Gas is paid in **gwei** (1 gwei = 0.000000001 ETH).

**Example costs (approximate):**
- Read a storage variable: ~2,100 gas
- Write a new storage variable: ~20,000 gas
- Update existing storage variable: ~5,000 gas
- Deploy a contract: ~100,000+ gas
- Send ETH: ~21,000 gas

**Your transaction cost = Gas Used × Gas Price**

If you use 50,000 gas and gas price is 20 gwei:
```
Cost = 50,000 × 20 gwei = 1,000,000 gwei = 0.001 ETH
```

On mainnet with ETH at $3,000, that's $3.

### Hardhat Development Environment

**Hardhat** provides three key features:

#### 1. Local Blockchain
```bash
npx hardhat node
```
This starts a local Ethereum blockchain on your computer:
- Instant transactions (no waiting)
- Free fake ETH in test accounts
- Reset anytime
- Perfect for development

#### 2. Contract Compilation
```bash
npx hardhat compile
```
This converts your `.sol` files into:
- **Bytecode** - Machine code that runs on Ethereum
- **ABI** (Application Binary Interface) - JSON that tells frontends how to interact with your contract

#### 3. Deployment System (Ignition)
Ignition is Hardhat's deployment tool. It:
- Manages complex deployments
- Tracks what's deployed where
- Handles failures gracefully
- Works across all networks (local, testnet, mainnet)

### Contract Lifecycle

1. **Write** - Create `.sol` file
2. **Compile** - `npx hardhat compile` → bytecode + ABI
3. **Test** - Run automated tests (we'll do this next)
4. **Deploy** - Send bytecode to blockchain
5. **Verify** - Publish source code (optional, for transparency)
6. **Interact** - Frontend calls functions

Once deployed, the contract:
- Lives at a specific address (like `0xabc123...`)
- Cannot be changed (immutable code)
- Costs gas to interact with
- Runs forever (or until blockchain stops)

### Security Considerations

Even simple contracts have security implications:

**Our MessageBoard is vulnerable to:**
- Spam (anyone can write anything)
- Gas griefing (writing very long messages costs the writer a lot)
- No censorship mechanism (once written, stays forever)

**For learning, this is fine.** In production, you'd add:
- Access control (only certain addresses can write)
- Message length limits
- Payment requirements
- Moderation capabilities

---

## Frontend Integration with Smart Contracts

Now that we have a deployed contract, we need to connect it to our React frontend. This is where the "dApp" (decentralized application) comes together.

### Contract Instance

A **contract instance** is a JavaScript object that represents your deployed smart contract.

```javascript
const contract = new ethers.Contract(
  address,  // Where the contract lives on blockchain
  abi,      // How to interact with it
  signer    // Who is calling it (your wallet)
);
```

**Think of it as**: A remote control for your smart contract. You press buttons (call functions) and it communicates with the blockchain.

### Two Types of Contract Functions

#### 1. View Functions (Read-Only) - FREE ⭐

**What they do:**
- Read data from blockchain
- Return information immediately
- No changes to blockchain state

**Examples:**
```javascript
const message = await contract.getMessage();
const [msg, writer, time] = await contract.getMessageInfo();
```

**Characteristics:**
- ✅ FREE - no gas cost
- ✅ Instant results
- ✅ No MetaMask approval needed
- ✅ No transaction created
- ✅ Can call unlimited times

**Why FREE?**
You're just reading data that already exists. Like reading a book from library - you don't pay each time you look at it. Your computer connects to any blockchain node and asks "what does this contract say?"

#### 2. State-Changing Functions (Write) - COSTS GAS 💰

**What they do:**
- Modify blockchain data
- Create a transaction
- Require miner processing

**Examples:**
```javascript
const tx = await contract.setMessage("Hello Web3!");
await tx.wait();  // Wait for confirmation
```

**Characteristics:**
- 💰 COSTS GAS - you pay miners
- ⏳ Takes time (2-15 seconds on mainnet, instant on local)
- 🔐 Requires MetaMask approval
- 📝 Creates transaction with hash
- ⛓️ Changes blockchain permanently

**Why COSTS GAS?**
You're asking thousands of computers to:
1. Process your transaction
2. Update their copy of blockchain
3. Store your data forever
4. Validate everything is correct

Miners do work, so they charge a fee (gas).

### Transaction Lifecycle Explained

When you call a state-changing function:

```
1. You call function
   ↓
2. ethers.js creates transaction
   ↓
3. MetaMask pops up with details
   ↓
4. You review: gas cost, function, parameters
   ↓
5. You click "Confirm" or "Reject"
   ↓
   [If Confirmed]
   ↓
6. Transaction sent to blockchain
   ↓
7. You get transaction HASH immediately
   ↓
8. Transaction sits in "mempool" (waiting area)
   ↓
9. Miners pick it up
   ↓
10. Miner includes it in a block
   ↓
11. Block is mined (solved cryptographic puzzle)
   ↓
12. Transaction CONFIRMED ✅
   ↓
13. Blockchain state updated
   ↓
14. Your function executed
   ↓
15. Data stored permanently
```

**Important**: Steps 6-15 happen on the blockchain, not in your app!

### Transaction Hash

Every transaction gets a unique **transaction hash** (txHash):
- Example: `0x1234abcd5678ef90...`
- 66 characters long
- Like a tracking number for packages
- You can look it up on block explorers (Etherscan)
- Proves transaction happened
- Can check status (pending/confirmed/failed)

### Transaction States

**Pending** ⏳
- Sent to network
- Waiting for miner
- Not yet confirmed
- Can still fail
- Gas not charged yet (but reserved)

**Success** ✅
- Confirmed in a block
- Permanently on blockchain
- Gas charged
- Function executed
- Changes applied

**Failed** ❌
- Either: User rejected (before sending - free)
- Or: Transaction reverted (sent but failed - gas still charged!)
- Blockchain unchanged
- If reverted, you still pay gas (miners did work)

### Gas in Detail

**What is Gas?**
Gas measures computational work. Each operation costs gas:
- Reading variable: 200 gas
- Writing variable: 20,000 gas
- Sending ETH: 21,000 gas

**Gas Price**:
- Measured in **Gwei** (1 Gwei = 0.000000001 ETH)
- You set how much you pay per gas unit
- Higher price = faster confirmation (miners prioritize)

**Total Cost**:
```
Total Cost = Gas Used × Gas Price
```

Example:
```
Gas Used: 50,000
Gas Price: 20 Gwei
Total Cost: 50,000 × 20 = 1,000,000 Gwei = 0.001 ETH
```

If ETH = $2,000, that's $2 for the transaction.

**On Local Blockchain:**
- Gas is FREE (you're the only miner)
- Transactions confirm instantly
- Perfect for learning!

### Contract ABI (Application Binary Interface)

**What is ABI?**
A JSON file describing your contract's interface:
- Function names
- Parameter types
- Return types
- Events

**Example ABI excerpt:**
```json
[
  {
    "name": "setMessage",
    "type": "function",
    "inputs": [
      {
        "name": "newMessage",
        "type": "string"
      }
    ],
    "outputs": []
  },
  {
    "name": "getMessage",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ]
  }
]
```

**Why Need ABI?**
Without it, ethers.js doesn't know:
- What functions exist
- How to call them
- What data to send
- How to decode responses

**Think of ABI as**: A menu at a restaurant. It tells you what you can order (functions) and what ingredients each dish needs (parameters).

### Reading vs Writing Comparison

| Feature | View Functions (Read) | State-Changing (Write) |
|---------|----------------------|------------------------|
| **Cost** | FREE ⭐ | Costs Gas 💰 |
| **Speed** | Instant ⚡ | 2-15 seconds ⏳ |
| **MetaMask** | No popup needed | Popup for approval 🔐 |
| **Transaction** | No transaction | Creates transaction 📝 |
| **Blockchain Change** | No changes | Permanent change ⛓️ |
| **Hash** | No hash | Get tx hash 🔖 |
| **Can Fail?** | Very rare | Can reject or revert ❌ |

### Real-World Analogy

**Reading (View Functions)**:
- Like checking your bank balance online
- Free to look
- Instant
- No approval needed

**Writing (State-Changing Functions)**:
- Like sending a wire transfer
- Costs fees
- Takes time to process
- Requires your signature
- Permanently recorded

### Events (Bonus Concept)

Smart contracts can **emit events** when things happen:

```solidity
event MessageSet(
    address indexed writer,
    string message,
    uint256 timestamp
);
```

**Why Events?**
- Cheaper than storing data
- Frontends can "listen" for them
- Create activity logs
- Enable real-time updates

**Example**: When someone posts a message, your app could automatically refresh to show it (even if you didn't post it).

### Complete Frontend Integration Flow

1. **User connects wallet** → MetaMask popup
2. **App gets signer** → Can sign transactions
3. **Create contract instance** → `new ethers.Contract(address, abi, signer)`
4. **Read current data** → `await contract.getMessage()` - FREE
5. **Display to user** → Show in UI
6. **User wants to write** → Types new message
7. **Call write function** → `await contract.setMessage(msg)`
8. **MetaMask pops up** → Shows gas estimate
9. **User approves** → Transaction sent
10. **Get tx hash** → `tx.hash`
11. **Show "pending"** → Loading state
12. **Wait for confirmation** → `await tx.wait()`
13. **Transaction confirmed** → ✅
14. **Re-read data** → Get updated message
15. **Update UI** → Show new message

### Common Errors and Meanings

**"User denied transaction"**
- User clicked "Reject" in MetaMask
- No gas charged
- Blockchain unchanged

**"Insufficient funds"**
- Not enough ETH to pay gas
- Need more ETH in wallet

**"Gas estimation failed"**
- Transaction would fail if sent
- Usually: function will revert
- Check require() conditions

**"Nonce too low"**
- Transaction already processed
- Or wrong transaction order
- Usually auto-fixes on retry

**"Replacement transaction underpriced"**
- Trying to replace pending transaction
- Need higher gas price

### Testing Your Integration

**Good tests to run:**
1. Connect wallet ✓
2. See message load automatically ✓
3. Write new message ✓
4. Approve in MetaMask ✓
5. See pending status ✓
6. See success status ✓
7. See message update ✓
8. Reject transaction ✓
9. See error status ✓
10. Disconnect and reconnect ✓

### What You've Mastered

By completing this integration, you now understand:
- ✅ Contract instances and how to create them
- ✅ Difference between view and state-changing functions
- ✅ Why some operations are free and others cost gas
- ✅ Complete transaction lifecycle
- ✅ Transaction states (pending/success/error)
- ✅ How to handle MetaMask interactions
- ✅ ABI and why it's necessary
- ✅ Reading and writing to blockchain
- ✅ Gas costs and estimation
- ✅ Transaction hashes and tracking

**You're now a Web3 developer!** 🎉

---

## Adding and Switching Networks via MetaMask RPC

Instead of manually typing network details, you can ask MetaMask to add/switch networks for you.

**Add network**
```javascript
await window.ethereum.request({
   method: 'wallet_addEthereumChain',
   params: [{
      chainId: '0x7A69',            // 31337 in hex
      chainName: 'Hardhat Local',
      rpcUrls: ['http://127.0.0.1:8545'],
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
   }],
});
```

**Switch network**
```javascript
await window.ethereum.request({
   method: 'wallet_switchEthereumChain',
   params: [{ chainId: '0x7A69' }],
});
```

**Common error**: `4902` means MetaMask doesn't know this chain → call `wallet_addEthereumChain` first, then switch again.

**Why this helps**: Avoids UI validation pain; ensures correct RPC URL and chain ID without manual entry.

---

## Listening to Contract Events for Live UI Updates

Events let your frontend react to on-chain changes without manual refresh.

**Contract event (Solidity)**
```solidity
event MessageSet(address indexed writer, string message, uint256 timestamp);
```

**Frontend listener (ethers.js v6)**
```javascript
contract.on('MessageSet', (writer, message, timestamp) => {
   setCurrentMessage(message);
   setLastWriter(writer);
   setLastUpdated(timestamp);
});
```

**Remember to clean up**
```javascript
return () => contract.off('MessageSet', handler);
```

**Why use events?**
- Cheaper than storing everything on-chain
- Great for real-time UI updates
- Works across accounts: if another wallet writes, your UI still updates

---

*This document grows as we build. Each concept is explained when we encounter it.*
