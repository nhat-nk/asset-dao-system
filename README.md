# RWA Tokenization Platform

Nền tảng Token hóa Tài sản Thực (Real World Asset) phi tập trung, cho phép tạo, mua bán và quản lý tài sản trên Blockchain.

## 📋 Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) (v18 trở lên)
- [Git](https://git-scm.com/)

## 🛠 Cài đặt

1.  **Clone project:**
    ```bash
    git clone <repo-url>
    cd rwa-tokenization
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Cấu hình môi trường:**
    -   Copy file `.env.example` thành `.env`:
        ```bash
        cp .env.example .env
    # Hoặc trên Windows CMD:
        copy .env.example .env
        ```
    -   Cập nhật thông tin trong `.env` (nếu dùng Testnet):
        -   `PRIVATE_KEY`: Private key ví deploy (cần có ETH Sepolia).
        -   `SEPOLIA_RPC_URL`: URL RPC của mạng Sepolia (lấy từ Alchemy/Infura).

---

## 🚀 Hướng dẫn chạy

### 1. Chạy trên Localhost (Khuyên dùng cho Dev/Test)

Môi trường Localhost dùng mạng blockchain giả lập trên máy, tốc độ nhanh, tiền ETH miễn phí, reset dễ dàng.

**Bước 1: Khởi chạy Local Blockchain**
Mở một terminal **mới** và chạy:
```bash
npx hardhat node
```
*Giữ terminal này chạy suốt quá trình dev.*

**Bước 2: Deploy Smart Contracts**
Mở một terminal **khác** và chạy:
```bash
npx ts-node scripts/deploy_viem.ts
```
*Lệnh này sẽ deploy contract và **tự động** cập nhật địa chỉ vào file `frontend/app.js`.*

**Bước 3: Chạy Frontend**
Trong terminal thứ 2 (hoặc mở cái mới), chạy:
```bash
python -m http.server 8000 --directory frontend
```
*Truy cập [http://localhost:8000](http://localhost:8000) để sử dụng.*

> **Lưu ý:** Mỗi lần bạn tắt/bật lại `npx hardhat node`, bạn **bắt buộc** phải chạy lại lệnh deploy (Bước 2) để cập nhật contract mới.

---

### 2. Chạy trên Sepolia Testnet (Demo/Production)

Môi trường Testnet dữ liệu được lưu vĩnh viễn, phù hợp để demo sản phẩm.

**Bước 1: Chuẩn bị ví**
- Đảm bảo trong `.env` đã có `PRIVATE_KEY` và `SEPOLIA_RPC_URL`.
- Ví deploy phải có sẵn **Sepolia ETH** (lấy tại [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) hoặc [LearnWeb3 Faucet](https://learnweb3.io/faucets/sepolia/)).

**Bước 2: Deploy Smart Contracts**
Chạy lệnh deploy với mạng Sepolia:
```bash
npx hardhat run scripts/deploy_viem.ts --network sepolia
```

**Bước 3: Chạy Frontend**
```bash
python -m http.server 8000 --directory frontend
```
*Lúc này Frontend sẽ kết nối với contract trên Sepolia. Nhớ chuyển ví Metamask sang mạng **Sepolia** khi sử dụng.*

---

## 📂 Cấu trúc Project

- `contracts/`: Source code Solidity (VNDhust.sol, AssetFactory.sol, AssetToken.sol).
- `scripts/`: Script deploy (deploy_viem.ts).
- `frontend/`: Giao diện web đơn giản (HTML/CSS/JS).
- `hardhat.config.ts`: Cấu hình Hardhat.
- `test/`: Unit tests.

## ❓ Troubleshooting

**Lỗi: `Nonce too high` hoặc Transaction bị pending mãi trên Localhost**
- **Nguyên nhân:** Do Metamask lưu cache nonce cũ của lần chạy node trước.
- **Khắc phục:** Mở Metamask -> Settings -> Advanced -> **Clear activity tab data**.

**Lỗi: Frontend không hiện dữ liệu**
- Kiểm tra xem đã chạy `npx hardhat node` chưa?
- Kiểm tra xem đã chạy `deploy` lại sau khi restart node chưa?
- Kiểm tra Metamask đã kết nối đúng mạng (Localhost 8545) chưa?
