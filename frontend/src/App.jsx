import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractData from './contracts/MessageBoard.json';

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

      // DEBUGGING: Check what network we're actually on
      const network = await web3Provider.getNetwork();
      console.log('🌐 Connected to network:', {
        name: network.name,
        chainId: network.chainId.toString(),
        expectedChainId: '31337'
      });
      setNetworkInfo({ name: network.name, chainId: network.chainId.toString() });

      // TEMPORARY: Network check disabled for testing
      // if (network.chainId.toString() !== '31337') {
      //   throw new Error(`Wrong network! Please switch to Hardhat Local (Chain ID: 31337). Currently on Chain ID: ${network.chainId}`);
      // }

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
      // Create contract instance using address, ABI, and signer
      const contractInstance = new ethers.Contract(
        contractData.address,  // Where the contract lives on blockchain
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
      setError(err.reason || err.message || 'Failed to write message');
      
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
        
        {/* Header Section with Glow Effect */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
            Web3 Learning dApp
          </h1>
          <p className="text-gray-400 text-lg">
            Your first step into decentralized applications
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="border border-red-500/30 bg-red-950/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-400 text-xl">⚠️</span>
              <span className="text-red-300"><strong>Error:</strong> {error}</span>
            </div>
          </div>
        )}

        {/* Wallet Connection Card */}
        <div className="border border-white/20 bg-black/40 backdrop-blur-xl rounded-2xl p-8 glow-border">
          <h2 className="text-2xl font-semibold mb-6 text-white">Wallet Connection</h2>
          
          {!walletAddress ? (
            // Not connected - show connect button
            <div className="space-y-4">
              <p className="text-gray-400 text-center mb-6">
                Connect your MetaMask wallet to get started
              </p>
              
              {!isMetaMaskInstalled() && (
                <div className="border border-yellow-500/30 bg-yellow-950/20 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300">
                    MetaMask not detected. Please install it from{' '}
                    <a 
                      href="https://metamask.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-yellow-100 transition-colors"
                    >
                      metamask.io
                    </a>
                  </p>
                </div>
              )}
              
              <div className="flex justify-center">
                <button 
                  className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-white/20 transform hover:scale-105"
                  onClick={connectWallet}
                  disabled={isConnecting || !isMetaMaskInstalled()}
                >
                  {isConnecting ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Connecting...</span>
                    </span>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Connected - show wallet info
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-gray-400">Connected Address</span>
                  <span className="font-mono text-sm text-white bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ETH Balance</span>
                  <span className="text-2xl font-bold text-white">
                    {balance ? `${parseFloat(balance).toFixed(4)} ETH` : (
                      <span className="text-gray-500 text-base">Loading...</span>
                    )}
                  </span>
                </div>
              </div>
              
              <button 
                className="w-full py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all duration-300"
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Network Status */}
        <div className="border border-white/15 bg-black/30 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-3 text-white">Network Status</h3>
          <p className="text-gray-300 mb-2">Expected: Hardhat Local (Chain ID 31337)</p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-200">
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15">
              Current chain: {networkInfo.chainId ?? 'unknown'}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15">
              Name: {networkInfo.name ?? 'unknown'}
            </span>
            {networkInfo.chainId && networkInfo.chainId !== '31337' && (
              <span className="px-3 py-1 rounded-lg bg-yellow-900/40 border border-yellow-400/40 text-yellow-200">
                Wrong network — switch below
              </span>
            )}
            {networkInfo.chainId === '31337' && (
              <span className="px-3 py-1 rounded-lg bg-green-900/30 border border-green-500/40 text-green-200">
                Correct network
              </span>
            )}
          </div>
        </div>

        {/* Network Helper */}
        <div className="border border-white/15 bg-black/30 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-3 text-white">Network Helper</h3>
          <p className="text-gray-400 text-sm mb-4">If MetaMask complains about Chain ID, use these buttons.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={addHardhatNetwork}
              className="w-full py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
            >
              ➕ Add Hardhat Network (31337)
            </button>
            <button
              onClick={switchToHardhatNetwork}
              className="w-full py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
            >
              🔄 Switch to Hardhat Network
            </button>
          </div>
        </div>

        {/* Smart Contract Section - Only shown when connected */}
        {walletAddress && (
          <div className="border border-white/20 bg-black/40 backdrop-blur-xl rounded-2xl p-8 glow-border">
            <h2 className="text-2xl font-semibold mb-6 text-white">📝 Message Board Contract</h2>
            
            {/* Current Message Display */}
            <div className="mb-6 border border-blue-500/30 bg-blue-950/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-300">Current Message on Blockchain</h3>
              {isLoadingMessage ? (
                <div className="text-gray-400 animate-pulse">Loading message...</div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <p className="text-white text-lg font-medium break-words">
                      "{currentMessage || 'No message set yet'}"
                    </p>
                  </div>
                  {lastWriter && lastWriter !== '0x0000000000000000000000000000000000000000' && (
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>
                        <span className="text-gray-500">Last writer:</span>{' '}
                        <span className="font-mono">{lastWriter.slice(0, 6)}...{lastWriter.slice(-4)}</span>
                      </p>
                      {lastUpdated && (
                        <p>
                          <span className="text-gray-500">Updated:</span>{' '}
                          {new Date(Number(lastUpdated) * 1000).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Write New Message */}
            <div className="border border-purple-500/30 bg-purple-950/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-300">Write New Message</h3>
              <div className="space-y-4">
                <div>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Enter your message to store on the blockchain..."
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                    rows="3"
                    disabled={isSending}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 This will cost gas! MetaMask will ask you to approve the transaction.
                  </p>
                </div>

                <button
                  onClick={writeMessage}
                  disabled={isSending || !newMessage.trim()}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isSending || !newMessage.trim()
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white glow-border'
                  }`}
                >
                  {isSending ? '⏳ Sending Transaction...' : '🚀 Post Message to Blockchain'}
                </button>

                {/* Transaction Status */}
                {txStatus === 'pending' && (
                  <div className="bg-yellow-950/30 border border-yellow-500/50 rounded-lg p-4">
                    <p className="text-yellow-300 font-semibold flex items-center space-x-2">
                      <span className="animate-spin">⏳</span>
                      <span>Transaction Pending...</span>
                    </p>
                    <p className="text-yellow-200/70 text-sm mt-2">
                      Waiting for blockchain confirmation. This may take a few seconds.
                    </p>
                    {txHash && (
                      <p className="text-xs text-yellow-200/50 mt-2 font-mono break-all">
                        TX: {txHash}
                      </p>
                    )}
                  </div>
                )}

                {txStatus === 'success' && (
                  <div className="bg-green-950/30 border border-green-500/50 rounded-lg p-4">
                    <p className="text-green-300 font-semibold flex items-center space-x-2">
                      <span>✅</span>
                      <span>Transaction Successful!</span>
                    </p>
                    <p className="text-green-200/70 text-sm mt-2">
                      Your message has been written to the blockchain!
                    </p>
                    {txHash && (
                      <p className="text-xs text-green-200/50 mt-2 font-mono break-all">
                        TX: {txHash}
                      </p>
                    )}
                  </div>
                )}

                {txStatus === 'error' && (
                  <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-300 font-semibold flex items-center space-x-2">
                      <span>❌</span>
                      <span>Transaction Failed</span>
                    </p>
                    {error && (
                      <p className="text-red-200/70 text-sm mt-2">{error}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contract Info */}
            <div className="mt-6 border border-white/10 bg-black/20 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-mono break-all">
                Contract: {contractData.address}
              </p>
            </div>
          </div>
        )}

        {/* Learning Section */}
        <div className="border border-white/10 bg-black/20 backdrop-blur-xl rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <span>📚</span>
            <span>What Just Happened?</span>
          </h3>
          <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
            {walletAddress ? (
              <>
                <div>
                  <p className="font-semibold text-white mb-2">You're connected to the blockchain!</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Your wallet address is now visible to this app</li>
                    <li>• We can read your ETH balance (free operation)</li>
                    <li>• Your private key stays safe in MetaMask - we never see it</li>
                  </ul>
                </div>
                
                {contract && (
                  <div className="border-t border-white/10 pt-3">
                    <p className="font-semibold text-white mb-2">Smart Contract Interaction:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <span className="text-blue-300">Reading messages</span> is FREE - no gas needed!</li>
                      <li>• <span className="text-purple-300">Writing messages</span> costs gas - you're changing blockchain data</li>
                      <li>• Each write transaction needs your approval in MetaMask</li>
                      <li>• Once confirmed, your message is stored forever on the blockchain</li>
                      <li>• Anyone can read it, but only you can write (with your signature)</li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="font-semibold text-white">Ready to connect?</p>
                <ul className="space-y-1 ml-4">
                  <li>• Clicking "Connect" opens MetaMask</li>
                  <li>• You choose which account to connect</li>
                  <li>• Your private key never leaves MetaMask</li>
                  <li>• You can disconnect anytime</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
