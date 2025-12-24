export default function Deploy() {
  return (
    <div className="space-y-6">
      <div className="border border-white/10 bg-black/20 backdrop-blur-xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">🧱 Deploy</h2>
        <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
          <div className="border border-white/10 bg-black/30 rounded-xl p-4">
            <p className="text-white font-semibold">Project repo</p>
            <p className="text-gray-400 mt-1">
              <a
                href="https://github.com/prabesh2004/BlockMSG"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors break-all"
              >
                https://github.com/prabesh2004/BlockMSG
              </a>
            </p>
          </div>

          <p>
            This repo has two parts: Hardhat (smart contract + deploy scripts) and a Vite React frontend.
            Deploying produces a contract address that the frontend can call.
          </p>

          <div className="border-t border-white/10 pt-4">
            <p className="font-semibold text-white mb-2">1) Install dependencies</p>
            <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-auto text-xs text-gray-200">
              <code>{`npm install\ncd frontend\nnpm install`}</code>
            </pre>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="font-semibold text-white mb-2">2) Configure Sepolia (project root)</p>
            <p className="text-gray-400">
              Put your RPC URL and deployer private key into <span className="text-white">.env</span> (never commit it).
            </p>
            <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-auto text-xs text-gray-200">
              <code>{`SEPOLIA_RPC_URL=https://...\nDEPLOYER_PRIVATE_KEY=0x...`}</code>
            </pre>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="font-semibold text-white mb-2">3) Deploy</p>
            <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-auto text-xs text-gray-200">
              <code>{`npx hardhat compile\nnpx hardhat run scripts/deploy.js --network sepolia`}</code>
            </pre>
            <p className="text-gray-400">
              The deploy script writes the address + ABI into{' '}
              <span className="text-white">frontend/src/contracts/MessageBoard.json</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
