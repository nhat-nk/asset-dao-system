import { createPublicClient, createWalletClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';

// Localhost Chain Definition
const localChain = defineChain({
    id: 31337,
    name: 'Localhost',
    network: 'localhost',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: ['http://127.0.0.1:8545'] }, public: { http: ['http://127.0.0.1:8545'] } }
});

// Hardhat default Account #0 Private Key
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
    console.log("Deploying with pure Viem...");

    const account = privateKeyToAccount(PRIVATE_KEY);

    const client = createWalletClient({
        account,
        chain: localChain,
        transport: http()
    });

    const publicClient = createPublicClient({
        chain: localChain,
        transport: http()
    });

    // Read Artifacts
    const vndArtifact = JSON.parse(fs.readFileSync(path.resolve('artifacts/contracts/VNDhust.sol/VNDhust.json'), 'utf8'));
    const factoryArtifact = JSON.parse(fs.readFileSync(path.resolve('artifacts/contracts/AssetFactory.sol/AssetFactory.json'), 'utf8'));
    const assetArtifact = JSON.parse(fs.readFileSync(path.resolve('artifacts/contracts/AssetToken.sol/AssetToken.json'), 'utf8'));


    // Deploy VNDhust
    console.log("Deploying VNDhust...");
    const hash1 = await client.deployContract({
        abi: vndArtifact.abi as any,
        bytecode: vndArtifact.bytecode,
    });
    const receipt1 = await publicClient.waitForTransactionReceipt({ hash: hash1 });
    const vndAddress = receipt1.contractAddress!;
    console.log("VNDhust deployed at:", vndAddress);

    // Deploy AssetFactory
    console.log("Deploying AssetFactory...");
    const hash2 = await client.deployContract({
        abi: factoryArtifact.abi as any,
        bytecode: factoryArtifact.bytecode,
    });
    const receipt2 = await publicClient.waitForTransactionReceipt({ hash: hash2 });
    const factoryAddress = receipt2.contractAddress!;
    console.log("AssetFactory deployed at:", factoryAddress);

    // Generate config.js
    const configContent = `
export const FACTORY_ADDRESS = '${factoryAddress}';
export const VNDHUST_ADDRESS = '${vndAddress}';

export const FACTORY_ABI = ${JSON.stringify(factoryArtifact.abi, null, 3)};
export const VNDHUST_ABI = ${JSON.stringify(vndArtifact.abi, null, 3)};
export const ASSET_ABI = ${JSON.stringify(assetArtifact.abi, null, 3)};
`;

    fs.writeFileSync(path.resolve('frontend/config.js'), configContent);
    console.log("Generated frontend/config.js with new addresses and ABIs.");
}

main().catch(console.error);
