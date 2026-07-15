# Metadata files

`MyNFT.tokenURI(id)` is `baseTokenURI + toString(id)` with **no separator or
extension appended**. That means each metadata file in your final IPFS
directory must be named exactly the decimal token id — `0`, `1`, `2`, ...
(no `.json` suffix) — for `tokenURI()` to resolve correctly.

`0` in this folder is a template. Duplicate it per token id, filling in the
`image` field with your uploaded image's `ipfs://<CID>` (or `ipfs://<CID>/filename`
if you uploaded a folder of images), then upload this whole `metadata/`
directory to IPFS as one pin — the resulting directory CID plus a trailing
slash becomes your `baseTokenURI` constructor argument, e.g.:

```
ipfs://<metadataDirCID>/
```
