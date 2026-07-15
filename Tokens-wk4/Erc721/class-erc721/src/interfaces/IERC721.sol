// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC165} from "./IERC165.sol";

/// @title ERC-721 Non-Fungible Token Standard
/// @dev https://eips.ethereum.org/EIPS/eip-721
interface IERC721 is IERC165 {
    /// @dev Emitted on any ownership change. Emitted with `_from` == address(0)
    ///      when a token is minted, and `_to` == address(0) when a token is burned.
    ///      At the time this event fires, the approved address for `_tokenId`
    ///      (if any) has already been reset to none.
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

    /// @dev Emitted when the approved address for an NFT is changed or reaffirmed.
    ///      The zero address means "no approved address".
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

    /// @dev Emitted when an operator is enabled or disabled for an owner.
    ///      The operator can manage all of the owner's NFTs.
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /// @notice Count all NFTs assigned to `_owner`
    /// @dev Throws for the zero address — NFTs assigned to address(0) are invalid.
    function balanceOf(address _owner) external view returns (uint256);

    /// @notice Find the owner of an NFT
    /// @dev Throws if `_tokenId` does not correspond to a currently-owned, valid NFT.
    function ownerOf(uint256 _tokenId) external view returns (address);

    /// @notice Transfer ownership of an NFT, checking that `_to` can receive NFTs
    /// @dev Throws unless `msg.sender` is the current owner, an approved address,
    ///      or an authorized operator for `_tokenId`. Throws if `_from` is not the
    ///      current owner, if `_to` is the zero address, or if `_tokenId` is invalid.
    ///      If `_to` is a contract, calls `onERC721Received` and reverts unless it
    ///      returns the ERC721 magic value.
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external payable;

    /// @notice Same as the four-argument version, with `data` defaulted to ""
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;

    /// @notice Transfer ownership of an NFT WITHOUT checking whether `_to` can
    ///         accept NFTs. The caller is responsible for that check — if `_to`
    ///         cannot handle NFTs, the asset may be permanently lost.
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;

    /// @notice Change or reaffirm the approved address for an NFT
    /// @dev Throws unless `msg.sender` is the current owner or an authorized operator.
    ///      Set `_approved` to address(0) to clear the approval.
    function approve(address _approved, uint256 _tokenId) external payable;

    /// @notice Enable or disable `_operator` as an operator for `msg.sender`'s
    ///         entire NFT collection (present and future).
    function setApprovalForAll(address _operator, bool _approved) external;

    /// @notice Get the approved address for a single NFT
    /// @dev Throws if `_tokenId` is not a valid NFT.
    function getApproved(uint256 _tokenId) external view returns (address);

    /// @notice Query if `_operator` is an authorized operator for `_owner`
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}
