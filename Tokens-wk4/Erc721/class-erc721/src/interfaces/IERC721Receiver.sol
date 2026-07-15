// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ERC-721 Token Receiver
/// @dev Any contract that wants to accept safeTransferFrom must implement this.
///      https://eips.ethereum.org/EIPS/eip-721
interface IERC721Receiver {
    /// @notice Handle the receipt of an NFT
    /// @dev The ERC721 contract calls this on the recipient AFTER a transfer.
    ///      Return any value other than the selector below and the ENTIRE
    ///      transaction reverts. This lets a receiving contract explicitly
    ///      opt in, rather than silently accepting whatever lands on it.
    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data)
        external
        returns (bytes4);
}
