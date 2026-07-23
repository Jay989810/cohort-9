import { useEffect, useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { openriverAbi, openriverAddress } from '../contracts';

interface CardProps {
  tokenId: number;
  userAddress?: `0x${string}`;
  onListClick?: (tokenId: number) => void;
  filter?: string;
  onOwnershipFetched?: (tokenId: number, isOwner: boolean) => void;
}

/**
 * Card Component
 * Represents an individual NFT item card. Reads metadata, contract state (owner, listing status),
 * and handles user interactions (Buy, List, Delist).
 */
export default function Card({ tokenId, userAddress, onListClick, filter, onOwnershipFetched }: CardProps) {
  const [metadata, setMetadata] = useState<{ name?: string; image?: string; description?: string }>({});
  const [loadingMeta, setLoadingMeta] = useState(false);

  // 1. Fetch token URI from smart contract
  const { data: uri } = useReadContract({
    abi: openriverAbi,
    address: openriverAddress,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  // 2. Fetch current token owner from ERC721 smart contract
  const { data: owner, refetch: refetchOwner } = useReadContract({
    abi: openriverAbi,
    address: openriverAddress,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
  });

  // 3. Fetch listing info (listing status, price, publisher) from marketplace mapping
  const { data: marketData, refetch: refetchMarket } = useReadContract({
    abi: openriverAbi,
    address: openriverAddress,
    functionName: 'marketplace',
    args: [BigInt(tokenId)],
  });

  // 4. Hook for executing contract write operations (buy / delist)
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // 5. Wait for transaction confirmation on blockchain
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refetch contract state immediately after a successful write transaction (e.g., after purchase or delisting)
  useEffect(() => {
    if (isSuccess) {
      refetchMarket();
      refetchOwner();
    }
  }, [isSuccess, refetchMarket, refetchOwner]);

  // Fetch & normalize off-chain NFT metadata (handles IPFS links and direct image URLs)
  useEffect(() => {
    if (!uri) return;

    let tokenUriStr = String(uri);
    // Convert IPFS protocol links to HTTP gateway URLs for browser fetching
    if (tokenUriStr.startsWith('ipfs://')) {
      tokenUriStr = tokenUriStr.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    // Direct image URL fallback check
    if (tokenUriStr.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) || tokenUriStr.startsWith('data:image')) {
      setMetadata({ image: tokenUriStr, name: `River NFT #${tokenId}` });
      return;
    }

    setLoadingMeta(true);
    fetch(tokenUriStr)
      .then((res) => res.json())
      .then((data) => {
        let img = data.image || data.image_url || '';
        if (img.startsWith('ipfs://')) {
          img = img.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        setMetadata({
          name: data.name || `River NFT #${tokenId}`,
          image: img,
          description: data.description,
        });
      })
      .catch(() => {
        setMetadata({ image: tokenUriStr, name: `River NFT #${tokenId}` });
      })
      .finally(() => setLoadingMeta(false));
  }, [uri, tokenId]);

  // Helper variables for marketplace status and price formatting
  const isListed = marketData ? Boolean(marketData[0]) : false;
  const priceWei = marketData ? (marketData[1] as bigint) : BigInt(0);
  const formattedPrice = priceWei ? formatEther(priceWei) : '0';

  // Check if connected wallet address matches current NFT owner
  const isOwner = owner && userAddress ? owner.toLowerCase() === userAddress.toLowerCase() : false;

  // Notify parent container of ownership state for tab filtering
  useEffect(() => {
    if (onOwnershipFetched) {
      onOwnershipFetched(tokenId, isOwner);
    }
  }, [tokenId, isOwner, onOwnershipFetched]);

  // If user selected "My NFTs" tab and doesn't own this NFT, hide the card
  if (filter === 'my-nfts' && !isOwner) {
    return null;
  }

  // Handle purchasing listed NFT
  const handleBuy = () => {
    if (!priceWei) return;
    writeContract({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'purchase',
      args: [BigInt(tokenId)],
      value: priceWei,
    });
  };

  // Handle delisting NFT from marketplace
  const handleDelist = () => {
    writeContract({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'removeFromMarketplace',
      args: [BigInt(tokenId)],
    });
  };

  const fallbackImage = `https://picsum.photos/seed/${tokenId}/400/400`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between">
      <div className="relative aspect-square w-full bg-slate-900 overflow-hidden group">
        <img
          src={metadata.image || fallbackImage}
          alt={metadata.name || `NFT #${tokenId}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold glass text-white">
          #{tokenId}
        </div>
        {isListed && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/80 text-white backdrop-blur-md">
            Listed
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-lg text-white truncate">
            {metadata.name || `OpenRiver #${tokenId}`}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Owner: {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : 'Loading...'}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="font-bold text-white text-base">
              {isListed ? `${formattedPrice} ETH` : 'Not Listed'}
            </span>
          </div>

          <div className="flex gap-2">
            {isOwner ? (
              isListed ? (
                <button
                  onClick={handleDelist}
                  disabled={isPending || isConfirming}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 text-white transition-all disabled:opacity-50"
                >
                  {isPending || isConfirming ? 'Removing...' : 'Delist'}
                </button>
              ) : (
                <button
                  onClick={() => onListClick && onListClick(tokenId)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20"
                >
                  List Item
                </button>
              )
            ) : isListed ? (
              <button
                onClick={handleBuy}
                disabled={isPending || isConfirming}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {isPending || isConfirming ? 'Processing...' : 'Buy Now'}
              </button>
            ) : (
              <span className="text-xs text-slate-500 self-center">Unlisted</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}