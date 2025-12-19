/**
 * DEPLOYMENT SCRIPT FOR MESSAGEBOARD CONTRACT
 * 
 * This script deploys the MessageBoard contract to the blockchain.
 * 
 * WHAT HAPPENS:
 * 1. Compile the contract to bytecode
 * 2. Get a signer (account with ETH to pay gas)
 * 3. Deploy the contract
 * 4. Wait for confirmation
 * 5. Print the contract address
 * 
 * RUN: npx hardhat run scripts/deploy.js --network localhost
 */

import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get the contract factory
  // This prepares the contract for deployment
  const MessageBoard = await hre.ethers.getContractFactory("MessageBoard");
  
  console.log("📝 Deploying MessageBoard contract...");
  
  // Deploy the contract
  // This sends a transaction with the contract bytecode
  const messageBoard = await MessageBoard.deploy();
  
  // Wait for deployment to be mined
  console.log("⏳ Waiting for deployment transaction to be mined...");
  await messageBoard.waitForDeployment();
  
  // Get the contract address
  const address = await messageBoard.getAddress();
  
  console.log("\n✅ MessageBoard deployed successfully!");
  console.log("📍 Contract Address:", address);
  
  // Save contract address and ABI to frontend
  const contractData = {
    address: address,
    abi: JSON.parse(messageBoard.interface.formatJson())
  };
  
  const frontendDir = path.join(process.cwd(), 'frontend', 'src');
  const contractsDir = path.join(frontendDir, 'contracts');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  // Write contract data
  fs.writeFileSync(
    path.join(contractsDir, 'MessageBoard.json'),
    JSON.stringify(contractData, null, 2)
  );
  
  console.log("💾 Contract address and ABI saved to frontend/src/contracts/MessageBoard.json");
  console.log("\n✨ Deployment complete! Your contract is ready to use.\n");
  
  return address;
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
