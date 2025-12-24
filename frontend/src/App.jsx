import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractData from './contracts/MessageBoard.json';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';

import Learn from './pages/Learn.jsx';
import Deploy from './pages/Deploy.jsx';
import Demo from './pages/Demo.jsx';

// Allow Netlify/production deployments to override the contract address and chain.
// Vite exposes environment variables that start with VITE_.
const ENV_CONTRACT_ADDRESS = import.meta.env?.VITE_CONTRACT_ADDRESS;
const ENV_CHAIN_ID = import.meta.env?.VITE_CONTRACT_CHAIN_ID;

// Default Hardhat local deployment address (so we can warn when hosting).
const LOCAL_HARDHAT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Fallback to the generated JSON (typically produced by the Hardhat deploy script).
const CONTRACT_ADDRESS = (ENV_CONTRACT_ADDRESS || contractData.address || '').trim();
const TARGET_CHAIN_ID = (ENV_CHAIN_ID || '').trim(); // decimal string (e.g., "11155111" for Sepolia)

// Normalize chain IDs so we can compare consistently.
const normalizeChainId = (value) => {
  if (!value) return null;
  if (typeof value === 'bigint') return value;
  const stringValue = value.toString();
  if (stringValue.startsWith('0x')) return BigInt(stringValue);
  return BigInt(stringValue);
};

const toDecimalChainId = (value) => {
  const normalized = normalizeChainId(value);
  return normalized ? normalized.toString() : null;
};

const isRpcOverloadedError = (err) => {
  const message = (err?.message || err?.error?.message || '').toLowerCase();
  const innerCode = err?.error?.code;
  return (
    innerCode === -32002 ||
    message.includes('rpc endpoint returned too many errors') ||
    message.includes('too many errors')
  );
};

const IS_LOCALHOST_HOST =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const chainLabelFromDecimalId = (decimalChainId) => {
  switch (decimalChainId) {
    case '1':
      return 'Ethereum Mainnet';
    case '11155111':
      return 'Sepolia';
    case '31337':
      return 'Hardhat Local';
    default:
      return `Chain ID ${decimalChainId}`;
  }
};

/**
 * MAIN APP COMPONENT
 * 
 * This is the heart of our dApp. It handles:
 * 1. Wallet connection
 * 2. Displaying user info
 * 3. Smart contract interactions
 * 
 * LEARNING NOTE: We use React "hooks" (useState, useEffect) to:
 * - useState: Store data that can change (wallet address, balance, etc.)
 * - useEffect: Run code when component loads or data changes
 */

function App() {
  // ===== STATE VARIABLES =====
  // These store the current state of our app
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Contract state
  const [contract, setContract] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [lastWriter, setLastWriter] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // null, 'pending', 'success', 'error'
  const [txHash, setTxHash] = useState(null);
  const [networkInfo, setNetworkInfo] = useState({ name: null, chainId: null });

  /**
   * CHECK IF METAMASK IS INSTALLED
   * 
   * MetaMask injects a global object called "window.ethereum"
   * If this exists, MetaMask is installed
   */
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  /**
   * CONNECT WALLET FUNCTION
   * 
   * This is called when user clicks "Connect Wallet"
   * 
   * WHAT HAPPENS:
   * 1. Check if MetaMask exists
   * 2. Request account access (MetaMask popup)
   * 3. Create provider (connection to blockchain)
   * 4. Create signer (can sign transactions)
   * 5. Get wallet address
   * 6. Get ETH balance
   */
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Check MetaMask
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install it from metamask.io');
      }

      // Step 2: Request accounts (triggers MetaMask popup)
      // This asks user: "Allow this site to connect?"
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Step 3: Create provider
      // Provider = read-only connection to blockchain
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      // Check what network we're actually on
      const network = await web3Provider.getNetwork();
      const connectedChainId = network.chainId.toString();
      const expectedChainId = toDecimalChainId(TARGET_CHAIN_ID);

      console.log('🌐 Connected to network:', {
        name: network.name,
        chainId: connectedChainId,
        expectedChainId: expectedChainId || 'not enforced'
      });

      setNetworkInfo({ name: network.name, chainId: connectedChainId });

      // Enforce the configured chain (important for Netlify/production deployments)
      if (expectedChainId && connectedChainId !== expectedChainId) {
        throw new Error(`Wrong network. Connect to chain ID ${expectedChainId} (current: ${connectedChainId}).`);
      }

      // Step 4: Create signer
      // Signer = can sign transactions (needs MetaMask)
      const web3Signer = await web3Provider.getSigner();
      setSigner(web3Signer);

      // Step 5: Get address
      const address = accounts[0];
      setWalletAddress(address);

      // Step 6: Get balance
      await updateBalance(web3Provider, address);

      console.log('✅ Wallet connected:', address);
    } catch (err) {
      console.error('❌ Connection error:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * UPDATE BALANCE FUNCTION
   * 
   * Fetches ETH balance for the given address
   * 
   * NOTE: This is FREE - reading blockchain data doesn't cost gas
   */
  const updateBalance = async (web3Provider, address) => {
    try {
      // getBalance returns value in "wei" (smallest ETH unit)
      // 1 ETH = 1,000,000,000,000,000,000 wei
      const balanceWei = await web3Provider.getBalance(address);
      
      // Convert wei to ETH for human reading
      const balanceEth = ethers.formatEther(balanceWei);
      
      setBalance(balanceEth);
      console.log('💰 Balance:', balanceEth, 'ETH');
    } catch (err) {
      console.error('❌ Balance fetch error:', err);
    }
  };

  /**
   * DISCONNECT WALLET FUNCTION
   * 
   * Clears all wallet data from our app
   * (Doesn't actually disconnect MetaMask, just resets our state)
   */
  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setCurrentMessage('');
    setNewMessage('');
    setNetworkInfo({ name: null, chainId: null });
    setError(null);
    console.log('👋 Wallet disconnected');
  };

  /**
   * ADD HARDHAT NETWORK TO METAMASK
   *
   * Uses the wallet_addEthereumChain RPC to programmatically add the network
   * so the user doesn't have to fight MetaMask's UI.
   */
  const addHardhatNetwork = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed.');
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x7A69', // 31337 in hex
            chainName: 'Hardhat Local',
            rpcUrls: ['http://127.0.0.1:8545'],
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      });
      setError(null);
    } catch (err) {
      console.error('Failed to add network:', err);
      setError(err.message || 'Failed to add Hardhat network');
    }
  };

  /**
   * SWITCH TO HARDHAT NETWORK
   *
   * Tries to switch; if network not found, it will add then switch.
   */
  const switchToHardhatNetwork = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed.');
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }],
      });
      setError(null);
    } catch (err) {
      // 4902: Unrecognized chain
      if (err && err.code === 4902) {
        await addHardhatNetwork();
      } else {
        console.error('Failed to switch network:', err);
        setError(err.message || 'Failed to switch to Hardhat network');
      }
    }
  };

  /**
   * INITIALIZE CONTRACT
   * 
   * Creates a contract instance we can use to interact with the blockchain
   * 
   * LEARNING NOTE: A contract instance is like a "remote control" for your
   * smart contract. It lets you call functions on the blockchain.
   * 
   * @param {Object} signer - The wallet that will sign transactions
   */
  const initializeContract = (signer) => {
    try {
      if (!CONTRACT_ADDRESS) {
        setError('Missing contract address. Set VITE_CONTRACT_ADDRESS or regenerate frontend/src/contracts/MessageBoard.json.');
        return null;
      }

      // If we're not on localhost and the address is the Hardhat default, warn the user.
      if (!TARGET_CHAIN_ID && !IS_LOCALHOST_HOST && CONTRACT_ADDRESS.toLowerCase() === LOCAL_HARDHAT_ADDRESS.toLowerCase()) {
        setError('The contract address points to a local Hardhat deployment. Set VITE_CONTRACT_ADDRESS and VITE_CONTRACT_CHAIN_ID for your hosted environment.');
        return null;
      }

      // Create contract instance using address, ABI, and signer
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,      // Where the contract lives on blockchain
        contractData.abi,      // How to talk to the contract
        signer                 // Who is calling the contract
      );
      setContract(contractInstance);
      return contractInstance;
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      setError('Failed to connect to smart contract');
      return null;
    }
  };

  /**
   * READ MESSAGE FROM BLOCKCHAIN
   * 
   * Calls the getMessage() and getMessageInfo() functions on our smart contract
   * 
   * LEARNING NOTE: This is a "view" function - it's FREE! No gas needed
   * because we're only reading data, not changing anything on the blockchain.
   */
  const readMessage = async (contractInstance) => {
    if (!contractInstance) return;
    
    setIsLoadingMessage(true);
    try {
      // Call the getMessage function (returns just the message string)
      const message = await contractInstance.getMessage();
      setCurrentMessage(message || 'No message set yet');

      // Call getMessageInfo to get additional details
      const [msg, writer, timestamp] = await contractInstance.getMessageInfo();
      setLastWriter(writer);
      setLastUpdated(timestamp);

    } catch (err) {
      console.error('Failed to read message:', err);
      setError('Failed to read message from blockchain');
    } finally {
      setIsLoadingMessage(false);
    }
  };

  /**
   * WRITE MESSAGE TO BLOCKCHAIN
   * 
   * Calls the setMessage() function on our smart contract
   * 
   * LEARNING NOTE: This is a "state-changing" function - it COSTS GAS!
   * We're writing data to the blockchain, so miners need to process it.
   * MetaMask will pop up asking you to approve the transaction and pay gas.
   */
  const writeMessage = async () => {
    if (!contract || !newMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSending(true);
    setTxStatus('pending');
    setError(null);
    
    try {
      // Call setMessage on the contract
      // This returns a transaction object immediately
      const tx = await contract.setMessage(newMessage);
      setTxHash(tx.hash);
      
      console.log('Transaction sent:', tx.hash);
      console.log('Waiting for confirmation...');
      
      // Wait for the transaction to be mined (confirmed)
      const receipt = await tx.wait();
      
      console.log('Transaction confirmed!', receipt);
      setTxStatus('success');
      
      // Clear input and read updated message
      setNewMessage('');
      await readMessage(contract);
      
      // Clear success message after 5 seconds
      setTimeout(() => setTxStatus(null), 5000);
      
    } catch (err) {
      console.error('Failed to write message:', err);
      setTxStatus('error');

      if (isRpcOverloadedError(err)) {
        setError(
          'Your wallet RPC endpoint is overloaded/rate-limited. In MetaMask: switch Sepolia RPC to a different provider (or the default), wait ~30–60s, then try again. If you have stuck/pending txs, reset account in MetaMask (Advanced → Clear activity).'
        );
      } else {
        setError(err.reason || err.message || 'Failed to write message');
      }
      
      // Clear error after 8 seconds
      setTimeout(() => setTxStatus(null), 8000);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * LISTEN FOR ACCOUNT CHANGES
   * 
   * If user switches accounts in MetaMask, update our app
   * This runs once when component mounts
   */
  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnectWallet();
        } else {
          // User switched accounts
          console.log('🔄 Account changed to:', accounts[0]);
          setWalletAddress(accounts[0]);
          if (provider) {
            updateBalance(provider, accounts[0]);
          }
        }
      });

      // Listen for chain changes (network changes)
      window.ethereum.on('chainChanged', () => {
        // Reload page on network change (simplest approach)
        window.location.reload();
      });
    }

    // Cleanup listeners when component unmounts
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [provider]);

  /**
   * INITIALIZE CONTRACT WHEN SIGNER IS AVAILABLE
   * 
   * Once we have a signer (wallet connected), create the contract instance
   * and load the current message from the blockchain
   */
  useEffect(() => {
    if (signer) {
      const contractInstance = initializeContract(signer);
      if (contractInstance) {
        readMessage(contractInstance);
      }
    }
  }, [signer]);

  /**
   * LISTEN FOR CONTRACT EVENTS
   *
   * Auto-refresh the message when MessageSet is emitted (any account).
   */
  useEffect(() => {
    if (!contract) return;

    const handleMessageSet = (writer, message, timestamp) => {
      setCurrentMessage(message || '');
      setLastWriter(writer);
      setLastUpdated(timestamp);
    };

    contract.on('MessageSet', handleMessageSet);

    return () => {
      contract.off('MessageSet', handleMessageSet);
    };
  }, [contract]);

  // ===== RENDER UI =====
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
            BlockMSG
          </h1>
          <p className="text-gray-400 text-lg">Blockchain learning app with a live example</p>
          <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
        </div>

        {/* Top Nav */}
        <div className="border border-white/15 bg-black/30 backdrop-blur-xl rounded-2xl p-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { to: '/learn', label: '📚 Learn' },
              { to: '/deploy', label: '🧱 Deploy' },
              { to: '/demo', label: '🧪 Demo' },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `py-3 rounded-xl border transition-colors font-semibold text-center ${
                    isActive
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/10 bg-transparent hover:bg-white/5 text-gray-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="border border-red-500/30 bg-red-950/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-400 text-xl">⚠️</span>
              <span className="text-red-300">
                <strong>Error:</strong> {error}
              </span>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/learn" replace />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route
            path="/demo"
            element={
              <Demo
                walletAddress={walletAddress}
                balance={balance}
                isConnecting={isConnecting}
                connectWallet={connectWallet}
                disconnectWallet={disconnectWallet}
                isMetaMaskInstalled={isMetaMaskInstalled}
                networkInfo={networkInfo}
                TARGET_CHAIN_ID={TARGET_CHAIN_ID}
                IS_LOCALHOST_HOST={IS_LOCALHOST_HOST}
                toDecimalChainId={toDecimalChainId}
                chainLabelFromDecimalId={chainLabelFromDecimalId}
                addHardhatNetwork={addHardhatNetwork}
                switchToHardhatNetwork={switchToHardhatNetwork}
                contract={contract}
                contractData={contractData}
                CONTRACT_ADDRESS={CONTRACT_ADDRESS}
                isLoadingMessage={isLoadingMessage}
                currentMessage={currentMessage}
                lastWriter={lastWriter}
                lastUpdated={lastUpdated}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                writeMessage={writeMessage}
                isSending={isSending}
                txStatus={txStatus}
                txHash={txHash}
                error={error}
              />
            }
          />
          <Route path="*" element={<Navigate to="/learn" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
