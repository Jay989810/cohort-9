#!/usr/bin/env bash
# Pin the NFT image and metadata/ directory to IPFS via Pinata's API.
#
# Setup: Pinata dashboard -> API Keys -> New Key (needs pinFileToIPFS
# permission) -> copy the JWT -> export PINATA_JWT=<jwt>
#
# Usage:
#   ./script/pinata-upload.sh image images/myimage.png
#       -> pins one file, prints its ipfs:// URI
#   ./script/pinata-upload.sh metadata
#       -> pins the metadata/ directory (all files except README.md),
#          prints the ipfs:// base URI to use as NFT_BASE_URI
set -euo pipefail

: "${PINATA_JWT:?Set PINATA_JWT in your environment (Pinata dashboard > API Keys)}"

usage() {
    echo "Usage:"
    echo "  $0 image <path-to-image-file>"
    echo "  $0 metadata"
    exit 1
}

cmd="${1:-}"

case "$cmd" in
    image)
        file="${2:?Usage: $0 image <path>}"
        resp=$(curl -s -X POST https://api.pinata.cloud/pinning/pinFileToIPFS \
            -H "Authorization: Bearer $PINATA_JWT" \
            -F "file=@${file}")
        cid=$(echo "$resp" | jq -r '.IpfsHash // empty')
        if [ -z "$cid" ]; then
            echo "Upload failed:" >&2
            echo "$resp" >&2
            exit 1
        fi
        echo "ipfs://$cid"
        ;;
    metadata)
        dir="metadata"
        args=()
        for f in "$dir"/*; do
            name=$(basename "$f")
            [ "$name" = "README.md" ] && continue
            args+=(-F "file=@${f};filename=metadata/${name}")
        done
        if [ "${#args[@]}" -eq 0 ]; then
            echo "No metadata files found in $dir/ (besides README.md)" >&2
            exit 1
        fi
        resp=$(curl -s -X POST https://api.pinata.cloud/pinning/pinFileToIPFS \
            -H "Authorization: Bearer $PINATA_JWT" \
            "${args[@]}" \
            -F 'pinataMetadata={"name":"MyNFT metadata"}')
        cid=$(echo "$resp" | jq -r '.IpfsHash // empty')
        if [ -z "$cid" ]; then
            echo "Upload failed:" >&2
            echo "$resp" >&2
            exit 1
        fi
        echo "ipfs://$cid/"
        ;;
    *)
        usage
        ;;
esac
