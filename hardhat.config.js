import { defineConfig } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem";

// Loads variables from a local .env (not committed).
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
const sepoliaUrl = process.env.SEPOLIA_RPC_URL;
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

const normalizePrivateKey = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withPrefix = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return withPrefix;
};

const isProbablyValidPrivateKey = (value) => {
  if (!value) return false;
  const trimmed = value.trim();
  const hex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  return /^[0-9a-fA-F]{64}$/.test(hex);
};

const networks = {
  localhost: {
    type: "http",
    url: "http://127.0.0.1:8545",
  },
};

// Only enable Sepolia when the required env vars exist.
// This avoids errors for new users who haven't configured .env yet.
const normalizedPrivateKey = normalizePrivateKey(deployerPrivateKey);

if (sepoliaUrl && normalizedPrivateKey) {
  if (!/^https?:\/\//.test(sepoliaUrl.trim())) {
    throw new Error(
      "Invalid SEPOLIA_RPC_URL in .env. It must start with http:// or https://"
    );
  }
  if (!isProbablyValidPrivateKey(normalizedPrivateKey)) {
    throw new Error(
      "Invalid DEPLOYER_PRIVATE_KEY in .env. It must be 64 hex chars (with or without 0x prefix)."
    );
  }
  networks.sepolia = {
    type: "http",
    url: sepoliaUrl.trim(),
    accounts: [normalizedPrivateKey],
  };
}

export default defineConfig({
  solidity: "0.8.27", // Latest stable Solidity version
  networks,
  plugins: [hardhatViem],
});
