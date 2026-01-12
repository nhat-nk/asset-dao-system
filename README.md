# 🏢 Real World Asset (RWA) Tokenization DAO

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.28-363636.svg?logo=solidity)
![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow.svg)
![Viem](https://img.shields.io/badge/Frontend-Viem-orange)

Một hệ thống **DAO (Decentralized Autonomous Organization)** đơn giản cho phép token hóa tài sản thực (Real World Assets), mở bán cho cộng đồng, và quản lý quy trình thanh lý tài sản thông qua cơ chế bỏ phiếu on-chain.

Dự án bao gồm Smart Contracts (Solidity) và giao diện Frontend (Vanilla JS) để tương tác trực tiếp với Localhost Blockchain.

---

## 🌟 Tính Năng Chính

*   **🏭 Asset Factory:** Tạo các tài sản mới (Asset Token) một cách dễ dàng với Factory Partner.
*   **🪙 Token Hóa Tài Sản:** Mỗi tài sản là một ERC20 token riêng biệt.
*   **💰 Mua Bán (Invest):** Người dùng dùng token thanh toán (`VNDhust`) để mua cổ phần tài sản (giới hạn tối đa 50% mỗi người).
*   **🗳️ Bỏ Phiếu Thanh Lý (DAO Voting):** Cổ đông có thể bỏ phiếu `Vote for Sale`. Nếu >50% cổ phần đồng ý, trạng thái tài sản chuyển sang `FOR_SALE`.
*   **💸 Phân Phối Lợi Nhuận:** Admin (hoặc người mua lại tài sản thực) nạp lại tiền vào Contract để mua lại toàn bộ token.
*   **🔥 Redeem (Rút Vốn):** Cổ đông đổi (burn) token tài sản để nhận lại tiền (`VNDhust`) + lợi nhuận sau khi thanh lý.

---

## 🛠️ Công Nghệ Sử Dụng

*   **Smart Contracts:** Solidity `^0.8.28`, OpenZeppelin (ERC20, Ownable).
*   **Blockchain Framework:** Hardhat, Hardhat Ignition (Deployment).
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript.
*   **Web3 Library:** [Viem](https://viem.sh/) (thư viện tương tác Blockchain hiệu năng cao).
*   **Local Network:** Hardhat Node.

---

## 🚀 Cài Đặt & Chạy Dự Án

### 1. Yêu Cầu
*   [Node.js](https://nodejs.org/) (v16 trở lên)
*   [MetaMask](https://metamask.io/) (Extension trình duyệt)

### 2. Cài Đặt Dependencies
Mở terminal tại thư mục gốc của dự án và chạy:

```bash
npm install
```

### 3. Khởi Động Local Blockchain
Chạy Hardhat Node để tạo mạng blockchain cục bộ (lưu ý: **không** tắt terminal này khi đang test):

```bash
npx hardhat node
```
*Terminal này sẽ hiển thị danh sách 20 ví test có sẵn 10,000 ETH.*

### 4. Deploy Smart Contracts
Mở một terminal **mới**, chạy lệnh deploy sử dụng Hardhat Ignition:

```bash
npx hardhat ignition deploy ./ignition/modules/RWA.ts --network localhost
```
*Lưu lại địa chỉ contract `VNDhust` và `AssetFactory` nếu cần, hoặc hệ thống frontend sẽ tự động đọc từ file config nếu đã được cấu hình.*

### 5. Config Frontend (Tự động hoặc Thủ công)
Kiểm tra file `frontend/config.js`. Đảm bảo địa chỉ contract khớp với địa chỉ vừa deploy (thường Hardhat Localhost sẽ giữ nguyên địa chỉ nếu không reset node, nhưng hãy kiểm tra lại nếu frontend không load được).

### 6. Chạy Frontend
Dùng `http-server` để chạy giao diện web:

```bash
npx http-server frontend
```
Truy cập trình duyệt tại: `http://127.0.0.1:8080`

---

## 📚 Hướng Dẫn Sử Dụng Chi Tiết

### B1: Kết Nối Ví (MetaMask)
1.  Cài đặt mạng **Localhost 8545** trong MetaMask (Chain ID: `31337`, RPC: `http://127.0.0.1:8545`).
2.  Import một trong các Private Key từ terminal chạy `npx hardhat node` vào MetaMask.
3.  Nhấn nút **Connect Wallet** trên giao diện web.

### B2: Nhận Tiền Test (Faucet)
*   Nhấn nút **Get 1,000,000 VNDH (Faucet)** để nhận tiền giả định dùng cho việc mua tài sản.

### B3: Tạo Tài Sản (Create Asset)
*   Nhập thông tin: `Tên`, `Mã (Symbol)`, `Tổng Cung`, `Giá (VNDH)`.
*   Nhấn **Create Asset**.
*   Xác nhận giao dịch trên MetaMask.

### B4: Mua Tài Sản (Buy)
*   Chọn tài sản trong danh sách.
*   Nhập số lượng muốn mua.
*   Nhấn **Buy Tokens** -> Hệ thống sẽ yêu cầu 2 transactions: **Approve** (cho phép trừ tiền) và **Buy** (mua).

### B5: Bỏ Phiếu (Vote for Sale)
*   Khi muốn bán tài sản, nhấn **Vote for Sale**.
*   Khi đủ >50% số phiếu, trạng thái tài sản sẽ chuyển sang màu vàng: **FOR SALE**.

### B6: Thanh Lý & Phân Phối (Distribute - Admin/Buyer)
*   Khi trạng thái là **FOR SALE**, ô nhập tiền phân phối sẽ hiện ra.
*   Nhập tổng số tiền thực nhận được khi bán tài sản (VNDH).
*   Nhấn **Distribute Proceeds**. Trạng thái chuyển sang màu xanh: **SOLD**.

### B7: Rút Tiền (Redeem)
*   Người dùng nhấn **Redeem VNDH**.
*   Token tài sản sẽ bị đốt (burn) và người dùng nhận lại số VNDH tương ứng với tỷ lệ sở hữu.

---

## 📂 Cấu Trúc Dự Án

```
rwa-tokenization/
├── contracts/              # Smart Contracts logic
│   ├── AssetFactory.sol    # Quản lý tạo mới tài sản
│   ├── AssetToken.sol      # Logic của từng tài sản (Vote, Buy, Redeem)
│   └── VNDhust.sol         # Token thanh toán (Faucet)
├── frontend/               # Giao diện người dùng
│   ├── app.js              # Logic tương tác Blockchain (Viem)
│   ├── config.js           # Chứa ABI và Address contract
│   ├── index.html          # Giao diện chính
│   └── styles.css          # Styling
├── ignition/               # Script deploy (Hardhat Ignition)
│   └── modules/
│       └── RWA.ts
├── hardhat.config.ts       # Cấu hình Hardhat
└── package.json            # Dependencies
```

## 📜 License
Dự án được phát hành dưới giấy phép [MIT](LICENSE).
