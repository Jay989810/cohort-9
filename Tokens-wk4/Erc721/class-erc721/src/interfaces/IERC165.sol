// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ERC-165: Standard Interface Detection
/// @dev https://eips.ethereum.org/EIPS/eip-165
interface IERC165 {
    /// @notice Query if a contract implements an interface
    /// @param interfaceId The interface identifier, as specified in ERC-165
    /// @dev MUST return true for interfaceId 0x01ffc9a7 (IERC165 itself),
    ///      MUST return false for 0xffffffff, and MUST use < 30,000 gas.
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
