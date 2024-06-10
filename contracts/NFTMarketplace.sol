//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is Ownable {
    
    struct NFTItem {
        uint256 id;
        address creator;
        string uri;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => NFTItem) private _items;
    uint256 private _itemIds;
    uint256 private _itemsSold;

    event ItemCreated(uint256 indexed itemId, address indexed creator, string uri, uint256 price);
    event ItemSold(uint256 indexed itemId, address indexed buyer, uint256 price);

    constructor() Ownable(msg.sender) {}

    function createItem(string memory uri, uint256 price) public onlyOwner {
        _itemIds++;
        uint256 itemId = _itemIds;

        _items[itemId] = NFTItem(itemId, msg.sender, uri, price, false);

        emit ItemCreated(itemId, msg.sender, uri, price);
    }

    function buyItem(uint256 itemId) public payable {
        NFTItem storage item = _items[itemId];
        require(item.sold == false, "Item already sold");
        require(msg.value >= item.price, "Insufficient funds");

        item.sold = true;
        _itemsSold++;

        emit ItemSold(itemId, msg.sender, item.price);

        payable(item.creator).transfer(item.price);
    }

    function getItem(uint256 itemId) public view returns (uint256 id, address creator, string memory uri, uint256 price, bool sold) {
        NFTItem storage item = _items[itemId];
        id = item.id;
        creator = item.creator;
        uri = item.uri;
        price = item.price;
        sold = item.sold;
    }

    function getItemsSold() public view returns (uint256) {
        return _itemsSold;
    }
}
