import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { openriverAbi, openriverAddress } from '../contracts';

interface ListModalProps {
  tokenId: number;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * ListModal Component
 * Modal dialog for listing an owned NFT on the OpenRiver marketplace at a user-specified ETH price.
 */
export default function ListModal({ tokenId, onClose, onSuccess }: ListModalProps) {
  const [price, setPrice] = useState('0.05');
  const [errorMsg, setErrorMsg] = useState('');

  // Hook to send listOnMarketplace contract write transaction
  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  // Hook to monitor transaction mining on Sepolia blockchain
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Automatically trigger onSuccess callback once transaction is confirmed
  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const handleList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || parseFloat(price) <= 0) {
      setErrorMsg('Please enter a valid price in ETH.');
      return;
    }

    try {
      // Convert ETH string input (e.g. "0.05") into Wei BigInt format using viem
      const priceWei = parseEther(price);
      setErrorMsg('');
      writeContract({
        abi: openriverAbi,
        address: openriverAddress,
        functionName: 'listOnMarketplace',
        args: [BigInt(tokenId), priceWei],
      });
    } catch {
      setErrorMsg('Invalid price input.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass max-w-md w-full rounded-2xl p-6 relative border border-slate-700/60 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">List NFT #{tokenId}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleList} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Listing Price (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.0001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.05"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors pr-16"
              />
              <span className="absolute right-4 top-2.5 text-xs font-semibold text-slate-400">
                ETH
              </span>
            </div>
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
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {isPending
                ? 'Confirming...'
                : isConfirming
                ? 'Listing...'
                : 'Confirm Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
