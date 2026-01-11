// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AssetToken (Token đại diện cho tài sản thực)
 * @notice Token đại diện cho quyền sở hữu một phần tài sản.
 * @dev Contract này quản lí việc mua bán, bỏ phiếu cho việc thanh lý tài sản.
 *
 * Quy trình:
 * 1. Mua: Khách hàng dùng VNDhust mua tokem, Cap < 50%.
 * 2. Bỏ phiếu: Khách hàng bỏ phiếu có bán tài sản hay không, > 50% thì duyệt việc bán.
 * 3. Thanh lý: Liên minh tài chính nạp tiền.
 * 4. Rút tiền: Khách hàng đổi token lấy lại tiền sau khi được bán.
 */
contract AssetToken is ERC20, Ownable {
    // --- STATE VARIABLES ---

    /// @notice Các trạng thái vòng đời của tài sản
    enum AssetState {
        OPEN,       // Đang mở bán
        FOR_SALE,   // Đã duyệt bán
        SOLD        // Đã thanh lý
    }

    /// @notice Trạng thái hiện tại của tài sản
    AssetState public currentState;

    /// @notice Token dùng để thanh toán (VNDhust)
    IERC20 public paymentToken;

    /// @notice Tổng số cổ phần của tài sản
    uint256 public maxSupply;

    /// @notice Giá bán gốc của 1 Token Asset
    uint256 public pricePerToken;

    /// @notice Giá trị quy đổi cuối cùng sau khi bán tài sản (per Token)
    uint256 public finalRedeemPrice;

    /// @notice Giới hạn sở hữu tối đa (50%)
    uint256 public constant MAX_OWNERSHIP_PERCENT = 50;

    // --- VOTING VARIABLES ---

    /// @notice Mapping kiểm tra địa chi đã bỏ phiếu hay chưa
    mapping(address => bool) public hasVoted;

    /// @notice Tổng số Token đã bỏ phiếu đồng ý bán
    uint256 public votesForSale;

    // --- EVENTS ---
    event Bought(address indexed buyer, uint256 amount);
    event Voted(address indexed voter, uint256 amount);
    event Unvoted(address indexed voter, uint256 amount);
    event SaleApproval(uint256 totalVotes);
    event ProceedsDistributed(uint256 totalAmount, uint256 pricePerToken);
    event Redemmed(address indexed user, uint256 tokenAmount, uint256 valueReceived);

    /**
     * @notice Khởi tạo contract AssetToken.
     * @param _name Tên tài sản.
     * @param _symbol Mã Token tài sản.
     * @param _maxSupply Tổng số lượng token phát hành
     * @param _price Giá mỗi token thời điểm phát hành
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _price,
        address _paymentToken,
        address _admin
    ) ERC20(_name, _symbol) Ownable(_admin) {
        require(_maxSupply > 0, "Max supply must be > 0");
        maxSupply = _maxSupply;
        pricePerToken = _price;
        paymentToken = IERC20(_paymentToken);
        currentState = AssetState.OPEN;
    }

    // --- USER FUNCTIONS ---

    /**
     * @notice Mua token tài sản bằng VNDhust.
     */
    function buy(uint256 amount) external {
        require(currentState == AssetState.OPEN, "AssetToken: Not open for sale");
        require(amount > 0, "AssetToken: Amount must be > 0");

        require(totalSupply() + amount <= maxSupply, "AssetToken: Sold out / Not enough tokens left");

        uint256 userNewBalance = balanceOf(msg.sender) + amount;
        uint256 limit = (maxSupply * MAX_OWNERSHIP_PERCENT) / 100;

        require(userNewBalance <= limit, "AssetToken: Exceed 50% ownership limit");

        uint256 cost = amount * pricePerToken;
        require(paymentToken.transferFrom(msg.sender, address(this), cost), "AssetToken: Payment failed");

        _mint(msg.sender, amount);
        emit Bought(msg.sender, amount);
    }

    /**
     * @notice Bỏ phiếu thanh lý tài sản
     */
    function voteForSale() external {
        require(currentState == AssetState.OPEN, "AssetToken: Already for sale or sold");
        require(balanceOf(msg.sender) > 0, "AssetToken: Must hold tokens to vote");
        require(!hasVoted[msg.sender], "AssetToken: Already voted");

        uint256 amount = balanceOf(msg.sender);
        hasVoted[msg.sender] = true;
        votesForSale += amount;

        emit Voted(msg.sender, amount);

        if (votesForSale * 100 > maxSupply * 50) {
            currentState = AssetState.FOR_SALE;
            emit SaleApproval(votesForSale);
        }
    }

    /**
     * @notice Unvote
     */
    function unvote() external {
        require(currentState == AssetState.OPEN, "AssetToken: Cannot unvote now");
        require(hasVoted[msg.sender], "AssetToken: Have not voted yet");

        uint256 amount = balanceOf(msg.sender);

        hasVoted[msg.sender] = false;
        votesForSale -= amount;

        emit Unvoted(msg.sender, amount);
    }

    /**
     * @notice Rút tiền
     */
    function redeem() external {
        require(currentState == AssetState.SOLD, "AssetToken: Asset not yet sold");

        uint256 amount = balanceOf(msg.sender);
        require(amount > 0, "AssetToken: No Tokens to redeem");

        uint256 payout = amount * finalRedeemPrice;

        _burn(msg.sender, amount);

        require(paymentToken.transfer(msg.sender, payout), "AssetToken: Transfer failed");

        emit Redemmed(msg.sender, amount, payout);
    }

    // --- ADMIN FUNCTIONS ---

    function distributeProceeds(uint256 totalVNDAmount) external onlyOwner {
        require(currentState == AssetState.FOR_SALE, "AssetToken: Asset not ready for sale");
        require(totalVNDAmount > 0, "Amount must be > 0");
        require(paymentToken.transferFrom(msg.sender, address(this), totalVNDAmount), "Transfer failed");

        finalRedeemPrice = totalVNDAmount / totalSupply();

        currentState = AssetState.SOLD;
        emit ProceedsDistributed(totalVNDAmount, finalRedeemPrice);
    }
}
