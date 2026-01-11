
import hre from "hardhat";
import { parseEther } from "viem";

async function main() {
    console.log("Deploying contracts...");

    // Deploy VNDhust
    const vndHust = await hre.viem.deployContract("VNDhust");
    console.log(`VNDhust deployed to: ${vndHust.address}`);

    // Deploy AssetFactory
    const assetFactory = await hre.viem.deployContract("AssetFactory");
    console.log(`AssetFactory deployed to: ${assetFactory.address}`);

    // Verify
    console.log("Deployment complete.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
