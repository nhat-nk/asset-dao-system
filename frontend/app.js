import { createPublicClient, createWalletClient, custom, parseEther, formatEther, defineChain } from 'https://esm.sh/viem';

// --- Configuration ---
const localChain = defineChain({
    id: 31337,
    name: 'Localhost',
    network: 'localhost',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: ['http://127.0.0.1:8545'] }, public: { http: ['http://127.0.0.1:8545'] } }
});

const FACTORY_ADDRESS = '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9';
const VNDHUST_ADDRESS = '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0';

// --- ABIs ---
const FACTORY_ABI = [
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "assetAddress", "type": "address" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "maxSupply", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }], "name": "AssetCreated", "type": "event" },
    { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }, { "internalType": "uint256", "name": "_maxSupply", "type": "uint256" }, { "internalType": "uint256", "name": "_price", "type": "uint256" }, { "internalType": "address", "name": "_paymentToken", "type": "address" }], "name": "createAsset", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }
];

const VNDHUST_ABI = [
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "faucet", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
];

const ASSET_ABI = [
    { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "pricePerToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "maxSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "currentState", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "buy", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "voteForSale", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "totalVNDAmount", "type": "uint256" }], "name": "distributeProceeds", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "redeem", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "hasVoted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "votesForSale", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

// --- State ---
let publicClient;
let walletClient;
let userAddress;

// --- Initialization ---
async function init() {
    if (window.ethereum) {
        publicClient = createPublicClient({ chain: localChain, transport: custom(window.ethereum) });
        walletClient = createWalletClient({ chain: localChain, transport: custom(window.ethereum) });

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                userAddress = accounts[0];
                document.getElementById('user-address').innerText = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
                updateBalance();
                loadAssets(); // Reload assets to update voting status/balances
            } else {
                // Disconnected
                userAddress = null;
                document.getElementById('user-address').innerText = 'Not connected';
                document.getElementById('connect-btn').disabled = false;
                document.getElementById('connect-btn').innerText = 'Connect Wallet';
            }
        });

        return true;
    } else {
        alert("Please install MetaMask!");
        return false;
    }
}

// --- UI Helpers ---
function showLoading(id, show = true) {
    const el = document.getElementById(id);
    if (el) el.style.opacity = show ? '0.5' : '1';
}

// --- Wallet Functions ---
async function connectWallet() {
    const initialized = await init();
    if (!initialized) return;

    try {
        const [address] = await walletClient.requestAddresses();
        userAddress = address;

        // Update UI
        document.getElementById('user-address').innerText = `${address.slice(0, 6)}...${address.slice(-4)}`;
        document.getElementById('connect-btn').innerText = 'Connected';
        document.getElementById('connect-btn').disabled = true;
        document.getElementById('faucet-btn').disabled = false;
        document.getElementById('create-asset-btn').disabled = false;

        await updateBalance();
        await loadAssets();
    } catch (e) {
        console.error("Connection failed", e);
        alert("Failed to connect wallet");
    }
}

async function updateBalance() {
    if (!userAddress) return;
    try {
        const balance = await publicClient.readContract({
            address: VNDHUST_ADDRESS,
            abi: VNDHUST_ABI,
            functionName: 'balanceOf',
            args: [userAddress]
        });
        document.getElementById('vnd-balance').innerText = formatEther(balance);

        const ethBalance = await publicClient.getBalance({ address: userAddress });
        document.getElementById('eth-balance').innerText = formatEther(ethBalance);
    } catch (e) {
        console.error("Error fetching balance", e);
    }
}

async function getFaucet() {
    try {
        const btn = document.getElementById('faucet-btn');
        btn.disabled = true;
        btn.innerText = 'Requesting...';

        const hash = await walletClient.writeContract({
            address: VNDHUST_ADDRESS,
            abi: VNDHUST_ABI,
            functionName: 'faucet',
            account: userAddress
        });
        await publicClient.waitForTransactionReceipt({ hash });

        alert("Faucet success! You received 1,000,000 VNDH");
        await updateBalance();
    } catch (e) {
        console.error(e);
        alert("Faucet failed: " + e.message);
    } finally {
        const btn = document.getElementById('faucet-btn');
        btn.disabled = false;
        btn.innerText = 'Get 1,000,000 VNDH (Faucet)';
    }
}

// --- Asset Management ---
async function createAsset() {
    const name = document.getElementById('asset-name').value;
    const symbol = document.getElementById('asset-symbol').value;
    const supply = document.getElementById('asset-supply').value;
    const price = document.getElementById('asset-price').value;

    if (!name || !symbol || !supply || !price) return alert("Please fill all fields");

    try {
        const btn = document.getElementById('create-asset-btn');
        btn.disabled = true;
        btn.innerText = 'Creating...';

        const hash = await walletClient.writeContract({
            address: FACTORY_ADDRESS,
            abi: FACTORY_ABI,
            functionName: 'createAsset',
            args: [name, symbol, parseEther(supply), BigInt(price), VNDHUST_ADDRESS],
            account: userAddress
        });
        await publicClient.waitForTransactionReceipt({ hash });

        alert("Asset Created Successfully!");

        // Clear inputs
        document.getElementById('asset-name').value = '';
        document.getElementById('asset-symbol').value = '';
        document.getElementById('asset-supply').value = '';
        document.getElementById('asset-price').value = '';

        await loadAssets();
    } catch (e) {
        console.error(e);
        alert("Create failed: " + e.message);
    } finally {
        const btn = document.getElementById('create-asset-btn');
        btn.disabled = false;
        btn.innerText = 'Create Asset';
    }
}

async function loadAssets() {
    const list = document.getElementById('assets-list');
    list.innerHTML = '<div class="loading">Loading assets from blockchain...</div>';

    try {
        const logs = await publicClient.getContractEvents({
            address: FACTORY_ADDRESS,
            abi: FACTORY_ABI,
            eventName: 'AssetCreated',
            fromBlock: 'earliest'
        });

        list.innerHTML = '';

        if (logs.length === 0) {
            list.innerHTML = '<div class="loading">No assets found. Create one!</div>';
            return;
        }

        for (const log of logs) {
            const { assetAddress, name, symbol, maxSupply, price } = log.args;
            const card = document.createElement('div');
            card.className = 'asset-card';
            card.innerHTML = `
                <div class="asset-header">
                    <div>
                        <div class="asset-title">${name}</div>
                        <div class="asset-symbol">${symbol}</div>
                    </div>
                    <div class="status-badge" id="status-${assetAddress}">Loading...</div>
                </div>
                <div class="asset-details" id="details-${assetAddress}">
                    <p><span>Price</span> <b>${price} VNDH</b></p>
                    <p><span>Max Supply</span> <b>${formatEther(maxSupply)}</b></p>
                    <div id="dynamic-details-${assetAddress}">Loading details...</div>
                </div>
            `;
            list.appendChild(card);
            // Load details asynchronously
            loadAssetDetails(assetAddress, price);
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = '<div class="loading" style="color: #ef4444">Error loading assets. Ensure local node is running.</div>';
    }
}

async function loadAssetDetails(address, price) {
    const detailsDiv = document.getElementById(`dynamic-details-${address}`);
    const statusBadge = document.getElementById(`status-${address}`);

    try {
        const totalSupply = await publicClient.readContract({ address, abi: ASSET_ABI, functionName: 'totalSupply' });
        const state = await publicClient.readContract({ address, abi: ASSET_ABI, functionName: 'currentState' });
        const userBal = userAddress ? await publicClient.readContract({ address, abi: ASSET_ABI, functionName: 'balanceOf', args: [userAddress] }) : 0n;
        const votes = await publicClient.readContract({ address, abi: ASSET_ABI, functionName: 'votesForSale' });
        const hasVoted = userAddress ? await publicClient.readContract({ address, abi: ASSET_ABI, functionName: 'hasVoted', args: [userAddress] }) : false;

        const states = ["OPEN", "FOR SALE", "SOLD"];
        const stateClasses = ["status-open", "status-sale", "status-sold"];

        statusBadge.innerText = states[state];
        statusBadge.className = `status-badge ${stateClasses[state]}`;

        let html = `
            <p><span>Sold</span> <b>${formatEther(totalSupply)}</b></p>
            <p><span>Your Balance</span> <b>${formatEther(userBal)}</b></p>
            <p><span>Votes for Sale</span> <b>${formatEther(votes)}</b></p>
            <div class="asset-actions">
        `;

        if (state === 0) { // OPEN
            html += `
                <input type="number" id="buy-amount-${address}" placeholder="Amount to buy">
                <button onclick="window.buyAsset('${address}', '${price}')">Buy Tokens</button>
                <button class="secondary" onclick="window.voteAsset('${address}')" ${hasVoted ? 'disabled' : ''}>
                    ${hasVoted ? 'Voted for Sale' : 'Vote for Sale'}
                </button>
            `;
        } else if (state === 1) { // FOR_SALE
            html += `
                <div style="margin-bottom: 0.5rem; color: #facc15; font-size: 0.9rem;">Asset approved for sale! Admin can distribute proceeds.</div>
                <input type="number" id="distribute-amount-${address}" placeholder="Total Proceeds (VNDH)">
                <button onclick="window.distribute('${address}')">Distribute Proceeds (Admin)</button>
            `;
        } else if (state === 2) { // SOLD
            html += `
                <div style="margin-bottom: 0.5rem; color: #4ade80; font-size: 0.9rem;">Asset Sold! Redeem your share.</div>
                <button onclick="window.redeem('${address}')">Redeem VNDH</button>
            `;
        }
        html += `</div>`;

        detailsDiv.innerHTML = html;
    } catch (e) {
        console.error(e);
        detailsDiv.innerText = "Error loading details";
    }
}

// --- Window Exports (for HTML onclick) ---
window.buyAsset = async (address, price) => {
    const amount = document.getElementById(`buy-amount-${address}`).value;
    if (!amount) return alert("Enter amount");

    try {
        const totalCost = parseEther(amount) * BigInt(price);

        // Approve
        const confirmApprove = confirm(`Approve payment of ${formatEther(totalCost)} VNDH?`);
        if (!confirmApprove) return;

        let hash = await walletClient.writeContract({
            address: VNDHUST_ADDRESS,
            abi: VNDHUST_ABI,
            functionName: 'approve',
            args: [address, totalCost],
            account: userAddress
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Buy
        hash = await walletClient.writeContract({
            address: address,
            abi: ASSET_ABI,
            functionName: 'buy',
            args: [parseEther(amount)],
            account: userAddress
        });
        await publicClient.waitForTransactionReceipt({ hash });

        alert("Purchase Successful!");
        loadAssetDetails(address, price);
        updateBalance();
    } catch (e) {
        console.error(e);
        alert("Buy failed: " + e.message);
    }
};

window.voteAsset = async (address) => {
    try {
        const hash = await walletClient.writeContract({
            address: address,
            abi: ASSET_ABI,
            functionName: 'voteForSale',
            account: userAddress
        });
        await publicClient.waitForTransactionReceipt({ hash });
        alert("Vote Cast!");
        loadAssets(); // Reload to update state if vote threshold met
    } catch (e) {
        console.error(e);
        alert("Vote failed: " + e.message);
    }
};

window.distribute = async (address) => {
    const amount = document.getElementById(`distribute-amount-${address}`).value;
    if (!amount) return alert("Enter amount");

    try {
        const totalProceeds = parseEther(amount);

        // Approve
        let hash = await walletClient.writeContract({
            address: VNDHUST_ADDRESS,
            abi: VNDHUST_ABI,
            functionName: 'approve',
            args: [address, totalProceeds],
            account: userAddress
        });
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await walletClient.writeContract({
            address: address,
            abi: ASSET_ABI,
            functionName: 'distributeProceeds',
            args: [totalProceeds],
            account: userAddress
        });
        await publicClient.waitForTransactionReceipt({ hash });

        alert("Proceeds Distributed!");
        loadAssets();
    } catch (e) {
        console.error(e);
        alert("Distribute failed: " + e.message);
    }
};

window.redeem = async (address) => {
    try {
        const hash = await walletClient.writeContract({
            address: address,
            abi: ASSET_ABI,
            functionName: 'redeem',
            account: userAddress
        });
        await publicClient.waitForTransactionReceipt({ hash });
        alert("Redeemed Successfully!");
        updateBalance();
        loadAssets();
    } catch (e) {
        console.error(e);
        alert("Redeem failed: " + e.message);
    }
};

// --- Event Listeners ---
document.getElementById('connect-btn').addEventListener('click', connectWallet);
document.getElementById('faucet-btn').addEventListener('click', getFaucet);
document.getElementById('create-asset-btn').addEventListener('click', createAsset);
document.getElementById('refresh-assets-btn').addEventListener('click', loadAssets);
