import { describe, it, before } from "node:test";
import assert from "node:assert";

import hre from "hardhat";

import { parseEther } from "viem";

describe("RWA Tokenization Flow (Hardhat 3)", () => {
    let vndHust: any;
    let assetFactory: any;
    let assetToken: any;

    let owner: any;
    let user1: any;
    let user2: any;
    let publicClient: any;
    let viem: any;

    before(async () => {
        const connection = await hre.network.connect();
        viem = connection.viem;

        [owner, user1, user2] = await viem.getWalletClients();
        publicClient = await viem.getPublicClient();

        vndHust = await viem.deployContract("VNDhust", [], {
            client: { wallet: owner },
        });

        assetFactory = await viem.deployContract("AssetFactory", [], {
            client: { wallet: owner },
        });
    });

    it("should create a new asset", async () => {
        const tx = await assetFactory.write.createAsset([
            "Real Estate 01",
            "RE01",
            parseEther("20"),
            10n,
            vndHust.address,
        ]);

        const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

        const log = receipt.logs.at(-1)!;
        const assetAddress = (`0x${log.topics[1].slice(26)}`) as `0x${string}`;

        assetToken = await viem.getContractAt("AssetToken", assetAddress);

        const name = await assetToken.read.name();
        assert.strictEqual(name, "Real Estate 01");
    });

    it("should allow users to buy AssetToken", async () => {
        await vndHust.write.faucet({ account: user1.account });
        await vndHust.write.faucet({ account: user2.account });

        const price = await assetToken.read.pricePerToken();

        const buy1 = parseEther("10");
        const cost1 = buy1 * price;

        await vndHust.write.approve(
            [assetToken.address, cost1],
            { account: user1.account }
        );
        await assetToken.write.buy([buy1], { account: user1.account });

        const buy2 = parseEther("1");
        const cost2 = buy2 * price;

        await vndHust.write.approve(
            [assetToken.address, cost2],
            { account: user2.account }
        );
        await assetToken.write.buy([buy2], { account: user2.account });

        const bal = await assetToken.read.balanceOf([user1.account.address]);
        assert.equal(bal, buy1);
    });

    it("should allow voting", async () => {
        await assetToken.write.voteForSale({ account: user1.account });
        await assetToken.write.voteForSale({ account: user2.account });

        const state = await assetToken.read.currentState();
        assert.equal(state, 1);
    });

    it("should distribute proceeds", async () => {
        await vndHust.write.faucet({ account: owner.account });

        const total = parseEther("200");

        await vndHust.write.approve(
            [assetToken.address, total],
            { account: owner.account }
        );

        await assetToken.write.distributeProceeds(
            [total],
            { account: owner.account }
        );

        const finalPrice = await assetToken.read.finalRedeemPrice();
        assert.equal(finalPrice, 18n);
    });

    it("should allow redeem", async () => {
        const before = await vndHust.read.balanceOf([user1.account.address]);

        await assetToken.write.redeem({ account: user1.account });

        const after = await vndHust.read.balanceOf([user1.account.address]);
        const diff = after - before;

        assert.equal(diff, parseEther("180"));

        const assetBal = await assetToken.read.balanceOf([user1.account.address]);
        assert.equal(assetBal, 0n);
    });
});
