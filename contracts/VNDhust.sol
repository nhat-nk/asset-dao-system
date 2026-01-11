// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title VNDhust
 * @author 
 * @notice Token mô phỏng VND để thanh toán trong hệ thống.
 * @dev Token này có decimal 18 và tích hợp Faucet cho môi trường test.
 */
contract VNDhust is ERC20 {

    /**
     * @notice Khởi tạo token với tên VNDhust và symbol VNDH.
     */
    constructor() ERC20("VNDhust", "VNDH") {}

    /**
     * @notice Hàm Faucet cho phép người dùng nhận token miễn phí để test.
     * @dev Chỉ dùng cho môi trường testnet/local, mint 1,000,000 token cho 'msg.sender'.
     */
    function faucet() external {
        // Mint 1 ti token.
        // 10**decimals() là để xử lý số thập phân (mặc định 18 số 0).
        _mint(msg.sender, 1_000_000 * 10**decimals());
    }
}
