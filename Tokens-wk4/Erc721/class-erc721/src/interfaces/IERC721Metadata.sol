// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ERC-721 Metadata extension (optional)
interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    /// @dev Throws if `_tokenId` is not a valid NFT.
    function tokenURI(uint256 _tokenId) external view returns (string memory);
}
