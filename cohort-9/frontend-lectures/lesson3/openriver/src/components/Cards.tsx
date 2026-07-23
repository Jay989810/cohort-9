import { useState, useCallback } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import Card from './Card';
import ListModal from './ListModal';
import { openriverAbi, openriverAddress } from '../contracts';

interface CardsProps {
  filter: 'explore' | 'mint' | 'my-nfts' | 'all' | 'listed' | string;
  onOpenMint: () => void;
}

/**
 * Cards Container Component
 * Reads total minted supply from the smart contract, generates an array of token IDs,
 * handles empty/disconnected UI states, and renders individual Card components.
 */
export function Cards({ filter, onOpenMint }: CardsProps) {
  const { address } = useAccount();
  const [selectedTokenForListing, setSelectedTokenForListing] = useState<number | null>(null);
  
  // Track tokens owned by the connected wallet to present friendly empty states
  const [ownedTokenIds, setOwnedTokenIds] = useState<Set<number>>(new Set());

  // Read total token count minted from the contract
  const { data: totalTokens, refetch } = useReadContract({
    abi: openriverAbi,
    address: openriverAddress,
    functionName: 'tokenIds',
  });

  const count = totalTokens ? Number(totalTokens) : 0;
  // Generate list of token IDs in descending order (latest minted first)
  const tokenList = Array.from({ length: count }, (_, i) => count - i);

  // Callback passed to Card components to track ownership in parent state
  const handleOwnershipFetched = useCallback((tokenId: number, isOwner: boolean) => {
    setOwnedTokenIds((prev) => {
      const next = new Set(prev);
      if (isOwner) {
        next.add(tokenId);
      } else {
        next.delete(tokenId);
      }
      return next;
    });
  }, []);

  // Show wallet connect state if user selects "My NFTs" tab while disconnected
  if (filter === 'my-nfts' && !address) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
          <p className="text-sm text-slate-400">
            Please connect your Web3 wallet using the header button to view your collected NFTs.
          </p>
        </div>
      </div>
    );
  }

  const isMyNftsEmpty = filter === 'my-nfts' && address && ownedTokenIds.size === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {count === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
          <p className="text-sm text-slate-400 mb-6">
            Be the first creator to mint an NFT on the OpenRiver Marketplace!
          </p>
          <button
            onClick={onOpenMint}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            Create First NFT
          </button>
        </div>
      ) : isMyNftsEmpty ? (
        <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto my-12 border border-slate-800">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Owned NFTs</h3>
          <p className="text-sm text-slate-400 mb-6">
            You don't own any NFTs in your connected wallet yet. Explore the marketplace or mint a new one!
          </p>
          <button
            onClick={onOpenMint}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            Mint NFT Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tokenList.map((id) => (
            <Card
              key={id}
              tokenId={id}
              userAddress={address}
              filter={filter}
              onOwnershipFetched={handleOwnershipFetched}
              onListClick={(tokenId) => setSelectedTokenForListing(tokenId)}
            />
          ))}
        </div>
      )}

      {selectedTokenForListing !== null && (
        <ListModal
          tokenId={selectedTokenForListing}
          onClose={() => setSelectedTokenForListing(null)}
          onSuccess={() => {
            setSelectedTokenForListing(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

export default Cards;
