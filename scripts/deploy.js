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

  // Read ABI from Hardhat artifacts (avoids relying on ethers-specific interfaces)
  const { abi } = await hre.artifacts.readArtifact("MessageBoard");

  console.log("📝 Deploying MessageBoard contract...");

  // Hardhat v3 + hardhat-viem expose viem per-network connection.
  // hardhat run --network sepolia will make this connect to Sepolia.
  const { viem } = await hre.network.connect();

  // This will send the deployment transaction and wait for it to be mined.
  console.log("⏳ Sending deployment transaction...");
  const messageBoard = await viem.deployContract("MessageBoard");

  // Get the deployed contract address (viem contract instances expose `.address`)
  const address = messageBoard.address ?? (await messageBoard.getAddress?.());
  
  console.log("\n✅ MessageBoard deployed successfully!");
  console.log("📍 Contract Address:", address);
  
  // Save contract address and ABI to frontend
  const contractData = {
    address: address,
    abi
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
