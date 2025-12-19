import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Connect to the local Hardhat network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get the first account (it has 10000 ETH)
  const signer = await provider.getSigner(0);
  console.log("📝 Deploying from account:", await signer.getAddress());

  // Load the contract artifact (compiled contract)
  const artifactPath = path.join(__dirname, '../artifacts/contracts/MessageBoard.sol/MessageBoard.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Create a contract factory
  const MessageBoard = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );

  console.log("⏳ Deploying MessageBoard contract...");
  
  // Deploy the contract
  const messageBoard = await MessageBoard.deploy();
  
  // Wait for deployment
  await messageBoard.waitForDeployment();
  
  const address = await messageBoard.getAddress();
  
  console.log("\n✅ MessageBoard deployed successfully!");
  console.log("📍 Contract Address:", address);
  
  // Save contract info for frontend
  const contractData = {
    address: address,
    abi: artifact.abi
  };
  
  const contractsDir = path.join(__dirname, '../frontend/src/contracts');
  const outputPath = path.join(contractsDir, 'MessageBoard.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
  
  console.log("💾 Contract address saved to:", outputPath);
  console.log("\n✨ Deployment complete!\n");
  console.log("📌 Important Info:");
  console.log("   - Blockchain: http://127.0.0.1:8545");
  console.log("   - Contract:", address);
  console.log("   - Network: Hardhat Local");
  console.log("\n💡 Next: Start the frontend and connect your wallet!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  });
