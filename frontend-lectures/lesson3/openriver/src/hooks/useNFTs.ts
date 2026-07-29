import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { openriverAbi, openriverAddress } from '../contracts';
import { fetchNFTMetadata, getFallbackImage, NFTItemData, formatPrice } from '../utils/nft';

// Custom React Hook to get all NFTs from the smart contract
export function useNFTs() {
  // Get connected user address from Wagmi
  const { address } = useAccount();

  // State to store list of NFTs
  const [nfts, setNfts] = useState<NFTItemData[]>([]);
  // State to track if data is loading
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Read total number of minted NFTs from smart contract ('tokenIds' function)
  const { data: totalTokens, refetch: refetchTotal } = useReadContract({
    abi: openriverAbi,
    address: openriverAddress,
    functionName: 'tokenIds',
  });

  // Convert total count to a regular number
  const count = totalTokens ? Number(totalTokens) : 0;

  // 2. Build array of contract read calls for token IDs 1 up to total count
  const calls = [];
  for (let i = 1; i <= count; i++) {
    const tid = BigInt(i);
    // Call tokenURI(i) to get metadata URL
    calls.push({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'tokenURI',
      args: [tid],
    });
    // Call ownerOf(i) to get owner address
    calls.push({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'ownerOf',
      args: [tid],
    });
    // Call marketplace(i) to get price and listing status
    calls.push({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'marketplace',
      args: [tid],
    });
  }

  // Execute all read calls at once
  const { data: rawData, refetch: refetchDetails, isLoading: detailsLoading } = useReadContracts({
    contracts: calls as any,
    query: {
      enabled: count > 0,
    }
  });

  // Function to process raw data and set the NFTs state
  const loadAllNFTs = useCallback(async () => {
    if (!count || !rawData || rawData.length === 0) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const items: NFTItemData[] = [];

    // Loop through each token ID and format data
    for (let i = 1; i <= count; i++) {
      const idx = (i - 1) * 3;
      const uriResult = rawData[idx]?.result as string | undefined;
      const ownerResult = rawData[idx + 1]?.result as string | undefined;
      const marketResult = rawData[idx + 2]?.result as [boolean, bigint, string, bigint] | undefined;

      const tokenId = BigInt(i);
      const tokenURI = uriResult || '';
      const owner = ownerResult || '0x0000000000000000000000000000000000000000';

      const isListed = Boolean(marketResult?.[0]);
      const price = marketResult?.[1] ? BigInt(marketResult[1].toString()) : BigInt(0);
      const publisher = marketResult?.[2] || owner;
      const royalty = marketResult?.[3] ? BigInt(marketResult[3].toString()) : BigInt(0);

      // Fetch metadata image and name
      let metadata = null;
      let imageSrc = getFallbackImage(tokenId);
      let name = `NFT Item #${tokenId.toString()}`;
      let description = `OpenRiver NFT #${tokenId.toString()}`;

      if (tokenURI) {
        metadata = await fetchNFTMetadata(tokenURI);
        if (metadata) {
          if (metadata.image) imageSrc = metadata.image;
          if (metadata.name) name = metadata.name;
          if (metadata.description) description = metadata.description;
        } else if (tokenURI.startsWith('http://') || tokenURI.startsWith('https://') || tokenURI.startsWith('ipfs://') || tokenURI.startsWith('data:image')) {
          imageSrc = tokenURI.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}` : tokenURI;
        }
      }

      // Add formatted NFT object to items list
      items.push({
        tokenId,
        tokenURI,
        owner,
        isListed,
        price,
        priceFormatted: formatPrice(price),
        publisher,
        royalty,
        metadata,
        imageSrc,
        name,
        description,
      });
    }

    // Show newest NFTs first
    setNfts(items.reverse());
    setLoading(false);
  }, [count, rawData]);

  // useEffect runs when component loads or dependencies change
  useEffect(() => {
    loadAllNFTs();
  }, [loadAllNFTs]);

  // Function to reload NFT data manually
  const refresh = useCallback(() => {
    refetchTotal();
    refetchDetails();
  }, [refetchTotal, refetchDetails]);

  // Return values for components to use
  return {
    nfts,
    totalTokens: count,
    loading: loading || detailsLoading,
    refresh,
    userNFTs: nfts.filter((item) => address && item.owner.toLowerCase() === address.toLowerCase()),
    listedNFTs: nfts.filter((item) => item.isListed),
  };
}
