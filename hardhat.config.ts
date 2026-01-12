import type { HardhatUserConfig } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-node-test-runner";
// import "@nomicfoundation/hardhat-ignition-viem";
// import "@nomicfoundation/hardhat-viem";
import "dotenv/config";

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        }
    },
};

export default config;
