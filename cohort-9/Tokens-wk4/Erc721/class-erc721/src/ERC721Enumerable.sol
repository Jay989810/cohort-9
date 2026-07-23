// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "./ERC721.sol";
import {IERC165} from "./interfaces/IERC165.sol";

interface IERC721Enumerable {
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 index) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}

/// @title ERC721Enumerable — optional extension, O(1) reads by design
/// @notice The spec only requires that enumeration NOT rely on unbounded
///         for/while loops as supply grows. This implementation keeps two
///         parallel index arrays (all-tokens, and per-owner) with O(1)
///         insert/remove via swap-and-pop, so every function here stays flat
///         cost regardless of collection size.
/// @dev Costs extra SSTOREs on every mint/transfer/burn to keep those indexes
///      in sync — that tradeoff is the point: pay a bounded, constant amount
///      per transfer instead of an unbounded amount per enumeration call.
abstract contract ERC721Enumerable is ERC721, IERC721Enumerable {
    // All existing tokenIds, in an order with NO specified meaning.
    uint256[] private _allTokens;
    // tokenId => its index within _allTokens.
    mapping(uint256 => uint256) private _allTokensIndex;

    // owner => ordered list of tokenIds they hold.
    mapping(address => uint256[]) private _ownedTokens;
    // tokenId => its index within _ownedTokens[owner].
    mapping(uint256 => uint256) private _ownedTokensIndex;

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }

    function totalSupply() public view virtual returns (uint256) {
        return _allTokens.length;
    }

    function tokenByIndex(uint256 index) public view virtual returns (uint256) {
        require(index < _allTokens.length, "ERC721Enumerable: index out of bounds");
        return _allTokens[index];
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) public view virtual returns (uint256) {
        require(index < balanceOf(owner), "ERC721Enumerable: owner index out of bounds");
        return _ownedTokens[owner][index];
    }

    // ─────────────────────────────────────────────────────────────────────
    // Index maintenance — hooked into the base contract's mint/transfer/burn
    // ─────────────────────────────────────────────────────────────────────

    function _mint(address to, uint256 tokenId) internal virtual override {
        super._mint(to, tokenId);
        _addTokenToAllTokensEnumeration(tokenId);
        _addTokenToOwnerEnumeration(to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override {
        address owner = ownerOf(tokenId);
        super._burn(tokenId);
        _removeTokenFromOwnerEnumeration(owner, tokenId);
        _removeTokenFromAllTokensEnumeration(tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal virtual override {
        super._transfer(from, to, tokenId);
        _removeTokenFromOwnerEnumeration(from, tokenId);
        _addTokenToOwnerEnumeration(to, tokenId);
    }

    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length;
        _ownedTokens[to].push(tokenId);
    }

    /// @dev Swap-and-pop: move the last element into the removed slot, then
    ///      pop. O(1) regardless of array size — never shifts the whole array.
    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
        uint256 lastIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if (tokenIndex != lastIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        delete _ownedTokensIndex[tokenId];
        _ownedTokens[from].pop();
    }

    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
        uint256 lastIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];

        uint256 lastTokenId = _allTokens[lastIndex];
        _allTokens[tokenIndex] = lastTokenId;
        _allTokensIndex[lastTokenId] = tokenIndex;

        delete _allTokensIndex[tokenId];
        _allTokens.pop();
    }
}
