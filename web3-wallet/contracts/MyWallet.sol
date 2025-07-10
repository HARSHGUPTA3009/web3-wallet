// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyWallet {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // deposit ETH
    receive() external payable {}

    // send ETH
    function sendETH(address payable _to, uint256 _amount) external {
        require(msg.sender == owner, "Only owner");
        _to.transfer(_amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
