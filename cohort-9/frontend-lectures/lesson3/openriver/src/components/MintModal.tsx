import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { openriverAbi, openriverAddress } from '../contracts';

interface MintModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80',
];

/**
 * MintModal Component
 * Modal dialog for minting a new NFT collectible directly onto the blockchain contract.
 */
export default function MintModal({ onClose, onSuccess }: MintModalProps) {
  const [tokenURI, setTokenURI] = useState(PRESET_IMAGES[0]);
  const [royalty, setRoyalty] = useState('5');
  const [errorMsg, setErrorMsg] = useState('');

  // Hook for minting (newItem contract call)
  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  // Monitor minting transaction block inclusion
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenURI.trim()) {
      setErrorMsg('Please enter a valid Token URI or Image URL.');
      return;
    }

    setErrorMsg('');
    writeContract({
      abi: openriverAbi,
      address: openriverAddress,
      functionName: 'newItem',
      args: [tokenURI.trim(), BigInt(royalty || 0)],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass max-w-lg w-full rounded-2xl p-6 relative border border-slate-700/60 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create New NFT</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleMint} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Token URI / Image Link
            </label>
            <input
              type="text"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
              placeholder="ipfs://... or https://..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <div className="mt-2 flex gap-2 overflow-x-auto py-1">
              <span className="text-xs text-slate-400 flex items-center">Presets:</span>
              {PRESET_IMAGES.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setTokenURI(img)}
                  className={`h-8 w-8 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    tokenURI === img ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Preset" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Royalty Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={royalty}
              onChange={(e) => setRoyalty(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {(errorMsg || error) && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              {errorMsg || error?.message}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {isPending
                ? 'Confirm in Wallet...'
                : isConfirming
                ? 'Minting NFT...'
                : 'Mint NFT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
