// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MyNFT} from "../src/MyNFT.sol";

/// @notice Deploys MyNFT with constructor args pulled from environment
///         variables so nothing gets hardcoded and committed.
///
/// Required env vars (see .env.example):
///   PRIVATE_KEY   - deployer key, becomes the contract's immutable `owner`
///   NFT_NAME      - e.g. "MyNFT"
///   NFT_SYMBOL    - e.g. "MNFT"
///   NFT_BASE_URI  - e.g. "ipfs://<metadataDirCID>/" (must end so that
///                   baseURI + tokenId resolves to a real file - see
///                   metadata/README.md)
///   NFT_MAX_SUPPLY- e.g. "1000"
contract DeployMyNFT is Script {
    function run() external returns (MyNFT nft) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        string memory name_ = vm.envString("NFT_NAME");
        string memory symbol_ = vm.envString("NFT_SYMBOL");
        string memory baseURI_ = vm.envString("NFT_BASE_URI");
        uint256 maxSupply_ = vm.envUint("NFT_MAX_SUPPLY");

        vm.startBroadcast(deployerKey);
        nft = new MyNFT(name_, symbol_, baseURI_, maxSupply_);
        vm.stopBroadcast();

        console.log("MyNFT deployed at:", address(nft));
    }
}
