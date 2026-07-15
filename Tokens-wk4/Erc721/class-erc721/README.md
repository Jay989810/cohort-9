# Hand-Rolled ERC-721 — No OpenZeppelin

A from-scratch ERC-721 implementation, structured the same way as your
hand-rolled ERC-20: full interfaces, custom errors, and an auditor's comment
at every point that actually matters rather than boilerplate NatSpec.

## Layout

```
src/
  interfaces/
    IERC165.sol            ERC-165 detection interface
    IERC721.sol             Core spec interface (extends IERC165)
    IERC721Receiver.sol      Safe-transfer callback interface
    IERC721Metadata.sol      Optional name/symbol/tokenURI interface
  ERC721.sol                 Core abstract implementation (balanceOf, ownerOf,
                              transferFrom, safeTransferFrom x2, approve,
                              setApprovalForAll, getApproved, isApprovedForAll,
                              _mint/_safeMint/_burn)
  ERC721Enumerable.sol        Optional extension — O(1) swap-and-pop indexing,
                              not the naive unbounded-loop version
  MyNFT.sol                   Concrete example: owner-gated sequential mint,
                              base-URI tokenURI, burn
test/
  MyNFT.t.sol                 Foundry test suite (happy paths + revert paths
                              + a fuzz test), including GoodReceiver /
                              BadReceiver / WrongSelectorReceiver harnesses
                              for exercising the onERC721Received callback
```

## Dropping into your Foundry project

```bash
cp -r src/* <your-project>/src/
cp -r test/* <your-project>/test/
forge install foundry-rs/forge-std   # if not already installed
forge build
forge test -vvv
```

## Design decisions worth knowing about

- **No Enumerable by default.** `MyNFT` inherits `ERC721`, not
  `ERC721Enumerable`. Enumeration is rarely needed on-chain (subgraphs/
  indexers cover it) and costs extra SSTOREs on every mint/transfer/burn to
  maintain. Swap the parent contract if you actually need
  `tokenByIndex`/`tokenOfOwnerByIndex` on-chain.
- **Approval is cleared before the `Transfer` event fires**, not after — a
  stale approval must never survive past the moment ownership changes.
- **`_transfer` completes all state changes before `safeTransferFrom`'s
  external call to the receiver** (checks-effects-interactions). The
  `onERC721Received` hook is still an external call into arbitrary code —
  if you add hooks of your own on top of this base, keep reentrancy in mind.
- **`ownerOf`/`getApproved`/`tokenURI` all revert on a non-existent token**
  rather than returning a zero value, matching the spec's "MUST throw"
  requirement — silently returning `address(0)` is a compliance gap that
  breaks integrations relying on the revert.
- **Interface IDs are computed via `type(X).interfaceId`** (Solidity's
  built-in XOR-of-selectors), and were independently cross-checked against
  the canonical EIP-721 values (`0x80ac58cd`, `0x5b5e139f`, `0x780e9d63`,
  `0x01ffc9a7`) — see `check_interface_ids.js` if you want to re-verify
  after modifying any interface.
- **`MyNFT`'s tokenIds are sequential and therefore predictable** — flagged
  in-line since predictable IDs can leak mint-order/rarity information for
  collections that rely on a later "reveal." Swap in a different ID scheme
  (e.g. commit-reveal, or a shuffled index) if that matters for your use case.

## What's deliberately NOT here

- No access control library — `MyNFT` uses a single `immutable owner` and a
  bare `onlyOwner` modifier, not a full `Ownable`/`AccessControl` — add one if
  you need multi-role permissions or ownership transfer.
- No royalty standard (EIP-2981) — out of scope for the base spec; say the
  word if you want it layered on.
- No upgradeability — this is a plain, non-upgradeable set of contracts.
