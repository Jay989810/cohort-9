import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { openriverAbi, openriverAddress } from '../contracts';
import { fetchNFTMetadata, getFallbackImage, NFTItemData, formatPrice } from '../utils/nft';

// ==============================================================================
// BEGINNER REACT LESSON: Custom React Hooks
// A "Custom Hook" in React is a reusable function whose name starts with "use".
// It packages state variables (useState) and side effects (useEffect) so any
// page or component in our app can call `useNFTs()` to load NFT data easily!
// ==============================================================================

export function useNFTs() {
  // 1. Get current logged-in user's wallet address from wagmi library hook
  const { address } = useAccount();

  // 2. useState: Component memory to store the list of NFTs
  const [nfts, setNfts] = useState<NFTItemData[]>([]);

  // 3. useState: Component memory to track if data is still loading
  const [loading, setLoading] = useState<boolean>(true);

  // 4. READ CONTRACT: Get total number of NFTs minted so far ('tokenIds' function)
  const { data: totalTokens, refetch: refetchTotal } = useReadContract({
    abi: openriverAbi,
    address: openriverAddress,
    functionName: 'tokenIds',
  });

  // Convert contract BigInt count to regular JavaScript number (e.g. 5)
  const count = totalTokens ? Number(totalTokens) : 0;

  // 5. Build array of smart contract calls to fetch details for every token (1 to count)
  const calls = [];
  for (let i = 1; i <= count; i++) {
    const tid = BigInt(i);
    // Contract call 1: Get tokenURI (image/metadata link)
    calls.push({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'tokenURI',
      args: [tid],
    });
    // Contract call 2: Get owner address
    calls.push({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'ownerOf',
      args: [tid],
    });
    // Contract call 3: Get marketplace details (isListed, price, publisher, royalty)
    calls.push({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'marketplace',
      args: [tid],
    });
  }

  // 6. READ MULTIPLE CONTRACTS AT ONCE: Execute all read calls in a single network request
  const { data: rawData, refetch: refetchDetails, isLoading: detailsLoading } = useReadContracts({
    contracts: calls as any,
    query: {
      enabled: count > 0,
    }
  });

  // 7. Process raw smart contract data and update React state
  const loadAllNFTs = useCallback(async () => {
    // If no tokens exist yet, clear state and finish loading
    if (!count || !rawData || rawData.length === 0) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const items: NFTItemData[] = [];

    // Loop through each NFT ID from 1 to count
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

      // Default values if metadata or IPFS is missing or fails
      let metadata = null;
      let imageSrc = getFallbackImage(tokenId);
      let name = `NFT Item #${tokenId.toString()}`;
      let description = `OpenRiver NFT #${tokenId.toString()}`;

      // If tokenURI exists, try fetching metadata
      if (tokenURI) {
        metadata = await fetchNFTMetadata(tokenURI);
        if (metadata) {
          if (metadata.image) imageSrc = metadata.image;
          if (metadata.name) name = metadata.name;
          if (metadata.description) description = metadata.description;
        } else if (
          tokenURI.startsWith('http://') ||
          tokenURI.startsWith('https://') ||
          tokenURI.startsWith('ipfs://') ||
          tokenURI.startsWith('data:image')
        ) {
          // If metadata fetch failed, use tokenURI directly as image if it's a web/IPFS link
          imageSrc = tokenURI.startsWith('ipfs://')
            ? `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`
            : tokenURI;
        }
      }

      // Add formatted NFT item to array
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

    // Sort newest NFTs first (highest token ID at top)
    setNfts(items.reverse());
    setLoading(false);
  }, [count, rawData]);

  // 8. useEffect: Automatically runs loadAllNFTs when data changes
  useEffect(() => {
    loadAllNFTs();
  }, [loadAllNFTs]);

  // 9. Helper function to manually refresh contract data
  const refresh = useCallback(() => {
    refetchTotal();
    refetchDetails();
  }, [refetchTotal, refetchDetails]);

  // 10. Return values for React components to use
  return {
    nfts,                                 // Array of all NFTs
    totalTokens: count,                   // Total number of NFTs
    loading: loading || detailsLoading,  // Is page loading?
    refresh,                              // Function to reload data
    // Filtered list: NFTs owned by connected wallet
    userNFTs: nfts.filter((item) => address && item.owner.toLowerCase() === address.toLowerCase()),
    // Filtered list: NFTs currently listed for sale
    listedNFTs: nfts.filter((item) => item.isListed),
  };
}
