// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonadHumanToken is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    address public identityRegistry;

    error NonTransferable();
    error OnlyRegistry();
    error AlreadyMinted();

    mapping(address => bool) public hasMinted;
    mapping(address => uint256) public tokenOfOwner;

    constructor() ERC721("Monad Human Token", "MHT") Ownable(msg.sender) {}

    function setIdentityRegistry(address _registry) external onlyOwner {
        identityRegistry = _registry;
    }

    function mint(address to) external returns (uint256) {
        if (msg.sender != identityRegistry) revert OnlyRegistry();
        if (hasMinted[to]) revert AlreadyMinted();

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        hasMinted[to] = true;
        tokenOfOwner[to] = tokenId;
        return tokenId;
    }

    function burn(uint256 tokenId) external {
        if (msg.sender != identityRegistry) revert OnlyRegistry();
        address owner = ownerOf(tokenId);
        hasMinted[owner] = false;
        delete tokenOfOwner[owner];
        _burn(tokenId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            revert NonTransferable();
        }
        return from;
    }
}
