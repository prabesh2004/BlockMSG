export default function Demo(props) {
  const {
    // Wallet
    walletAddress,
    balance,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled,

    // Network
    networkInfo,
    TARGET_CHAIN_ID,
    IS_LOCALHOST_HOST,
    toDecimalChainId,
    chainLabelFromDecimalId,
    addHardhatNetwork,
    switchToHardhatNetwork,

    // Contract
    contract,
    contractData,
    CONTRACT_ADDRESS,
    isLoadingMessage,
    currentMessage,
    lastWriter,
    lastUpdated,
    newMessage,
    setNewMessage,
    writeMessage,
    isSending,
    txStatus,
    txHash,
    error,
  } = props;

  return (
    <div className="space-y-6">
      {/* Demo prerequisites */}
      <div className="border border-white/10 bg-black/20 backdrop-blur-xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">📄 Demo prerequisites</h2>
        {(() => {
          const expectedChainId = toDecimalChainId(TARGET_CHAIN_ID);
          const hasExpectedChain = expectedChainId ? networkInfo.chainId === expectedChainId : true;
          const hasSomeEth = !!balance && Number.parseFloat(balance) > 0;
          const checks = [
            { ok: isMetaMaskInstalled(), label: 'MetaMask installed' },
            { ok: !!walletAddress, label: 'Wallet connected' },
            {
              ok: hasExpectedChain,
              label: expectedChainId
                ? `On ${chainLabelFromDecimalId(expectedChainId)} (Chain ID ${expectedChainId})`
                : 'On the correct network (not enforced)',
            },
            { ok: hasSomeEth, label: 'Has some test ETH for gas' },
          ];

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {checks.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between border border-white/10 bg-black/30 rounded-xl p-4"
                >
                  <span className="text-gray-200">{c.label}</span>
                  <span className={c.ok ? 'text-green-300' : 'text-yellow-200'}>{c.ok ? '✅' : '⚠️'}</span>
                </div>
              ))}
              <div className="md:col-span-2 border border-white/10 bg-black/30 rounded-xl p-4 text-gray-400">
                Writes (posting a message) will open MetaMask and cost gas. Reads are free.
              </div>
            </div>
          );
        })()}
      </div>

      {/* Wallet Connection Card */}
      <div className="border border-white/20 bg-black/40 backdrop-blur-xl rounded-2xl p-8 glow-border">
        <h2 className="text-2xl font-semibold mb-6 text-white">Wallet Connection</h2>

        {!walletAddress ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-center mb-6">Connect your MetaMask wallet to get started</p>

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
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
                  {balance ? (
                    `${Number.parseFloat(balance).toFixed(4)} ETH`
                  ) : (
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
        {(() => {
          const expectedChainId = toDecimalChainId(TARGET_CHAIN_ID) || (IS_LOCALHOST_HOST ? '31337' : null);
          const expectedLabel = expectedChainId
            ? `${chainLabelFromDecimalId(expectedChainId)} (Chain ID ${expectedChainId})`
            : 'Not enforced';
          return <p className="text-gray-300 mb-2">Expected: {expectedLabel}</p>;
        })()}
        <div className="flex flex-wrap gap-3 text-sm text-gray-200">
          <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15">
            Current chain: {networkInfo.chainId ?? 'unknown'}
          </span>
          <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15">
            Name: {networkInfo.name ?? 'unknown'}
          </span>
        </div>
      </div>

      {/* Network Helper (Hardhat-only) */}
      {(() => {
        const expectedChainId = toDecimalChainId(TARGET_CHAIN_ID) || (IS_LOCALHOST_HOST ? '31337' : null);
        if (expectedChainId !== '31337') return null;

        return (
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
        );
      })()}

      {/* Contract */}
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
                  <p className="text-white text-lg font-medium break-words">"{currentMessage || 'No message set yet'}"</p>
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
                <p className="text-xs text-gray-500 mt-2">💡 This will cost gas! MetaMask will ask you to approve the transaction.</p>
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

              {txStatus === 'pending' && (
                <div className="bg-yellow-950/30 border border-yellow-500/50 rounded-lg p-4">
                  <p className="text-yellow-300 font-semibold flex items-center space-x-2">
                    <span className="animate-spin">⏳</span>
                    <span>Transaction Pending...</span>
                  </p>
                  <p className="text-yellow-200/70 text-sm mt-2">Waiting for blockchain confirmation.</p>
                  {txHash && <p className="text-xs text-yellow-200/50 mt-2 font-mono break-all">TX: {txHash}</p>}
                </div>
              )}

              {txStatus === 'success' && (
                <div className="bg-green-950/30 border border-green-500/50 rounded-lg p-4">
                  <p className="text-green-300 font-semibold flex items-center space-x-2">
                    <span>✅</span>
                    <span>Transaction Successful!</span>
                  </p>
                  {txHash && <p className="text-xs text-green-200/50 mt-2 font-mono break-all">TX: {txHash}</p>}
                </div>
              )}

              {txStatus === 'error' && (
                <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-300 font-semibold flex items-center space-x-2">
                    <span>❌</span>
                    <span>Transaction Failed</span>
                  </p>
                  {error && <p className="text-red-200/70 text-sm mt-2">{error}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Contract Info */}
          <div className="mt-6 border border-white/10 bg-black/20 rounded-lg p-4">
            <p className="text-xs text-gray-500 font-mono break-all">
              Contract: {CONTRACT_ADDRESS || contractData.address}
            </p>
          </div>
        </div>
      )}

      {!walletAddress && error && (
        <div className="border border-red-500/30 bg-red-950/20 backdrop-blur-sm rounded-lg p-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {walletAddress && !contract && (
        <div className="border border-white/10 bg-black/20 backdrop-blur-xl rounded-2xl p-8">
          <p className="text-gray-400 text-sm">
            Connect to the correct network and ensure the contract address is configured. Then refresh or reconnect.
          </p>
        </div>
      )}

      {walletAddress && contract && (
        <div className="border border-white/10 bg-black/20 backdrop-blur-xl rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <span>📚</span>
            <span>What just happened?</span>
          </h3>
          <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
            <ul className="space-y-1 ml-4">
              <li>• Your wallet signed a transaction (write) when you posted a message.</li>
              <li>• The transaction was sent to the network via RPC.</li>
              <li>• Validators included it in a block, updating on-chain state.</li>
              <li>• This UI re-read contract state to show the new message.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
