// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract NFT {
    string public text;
    address public owner;
    address payable public creator;
    uint256 public lastSaleAmount;

    constructor(string memory _text) {
        text = _text;
        creator = payable(msg.sender);
        owner = msg.sender;
    }

    function buy() public payable {
        require(
            msg.value > lastSaleAmount,
            "the amount of money must be greater than the previos sale"
        );

        owner = msg.sender;
        lastSaleAmount = msg.value;
    }

    function setText(string memory _text) public {
        require(msg.sender == owner, "you are not the owner");
        text = _text;
    }

    function claim() public {
        require(msg.sender == creator, "only creator can claim funds");

        creator.transfer(address(this).balance);
    }

    function finalize() public onlyCreator {
        selfdestruct(creator);
    }

    modifier onlyCreator() {
        require(msg.sender == creator);
        _;
    }
}
