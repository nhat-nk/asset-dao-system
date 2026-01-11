// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./AssetToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetFactory is Ownable {
    event AssetCreated(address indexed assetAddress, string name, string symbol, uint256 maxSupply, uint256 price);

    constructor() Ownable(msg.sender) {}

    function createAsset(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _price,
        address _paymentToken
    ) external onlyOwner returns (address) {
        AssetToken newAsset = new AssetToken(
            _name,
            _symbol,
            _maxSupply,
            _price,
            _paymentToken,
            msg.sender // Admin is the owner of the new asset
        );

        emit AssetCreated(address(newAsset), _name, _symbol, _maxSupply, _price);
        return address(newAsset);
    }
}
