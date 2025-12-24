  import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * DEPLOYMENT SCRIPT FOR MESSAGEBOARD CONTRACT
 * 
 * This uses Hardhat Ignition (the new deployment system in Hardhat 3)
 * to deploy our MessageBoard contract to the blockchain.
 * 
 * WHAT HAPPENS WHEN YOU DEPLOY:
 * 1. Your contract code is compiled to bytecode
 * 2. A transaction is sent to the blockchain with this bytecode
 * 3. The blockchain creates a new address for your contract
 * 4. Your contract now lives permanently at that address
 * 
 * GAS COST: Deploying costs gas (proportional to contract size)
 */

const MessageBoardModule = buildModule("MessageBoardModule", (m) => {
  // Deploy the MessageBoard contract
  // No constructor arguments needed for this simple contract
  const messageBoard = m.contract("MessageBoard");

  // Return the deployed contract so we can use it
  return { messageBoard };
});

export default MessageBoardModule;
