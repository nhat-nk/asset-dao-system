import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RWAModule = buildModule("RWAModule", (m) => {
    const vndHust = m.contract("VNDhust");
    const assetFactory = m.contract("AssetFactory");

    return { vndHust, assetFactory };
});

export default RWAModule;
