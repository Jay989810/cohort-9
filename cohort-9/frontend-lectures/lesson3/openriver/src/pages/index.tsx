import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import Cards from '../components/Cards';
import MintModal from '../components/MintModal';
import { useReadContract } from 'wagmi';
import { openriverAbi, openriverAddress } from '../contracts';

/**
 * OpenRiver Home Page
 * Main application layout featuring hero banner, stats, tab navigation, marketplace grid, and minting workflow.
 */
const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'explore' | 'mint' | 'my-nfts'>('explore');
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  // Read total token supply minted on contract
  const { data: totalTokens, refetch: refetchTotal } = useReadContract({
    abi: openriverAbi,
    address: openriverAddress,
    functionName: 'tokenIds',
  });

  const handleOpenMint = () => {
    setIsMintModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-blue-500 selection:text-white">
      <Head>
        <title>OpenRiver | Next-Gen NFT Marketplace</title>
        <meta name="description" content="Discover, mint, and trade NFTs seamlessly on OpenRiver" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'mint') {
            setIsMintModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      <main className="flex-1">
        <section className="relative overflow-hidden py-16 px-6 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/50 via-slate-900/20 to-transparent">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Live on Sepolia Testnet
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Discover, Mint & Trade Digital Collectibles
              </h1>
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                OpenRiver is a decentralized marketplace powered by smart contracts. List your digital art or purchase items directly with low fees and instant settlement.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => setIsMintModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20"
                >
                  Create NFT
                </button>
                <a
                  href={`https://sepolia.etherscan.io/address/${openriverAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all"
                >
                  View Contract
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto min-w-[260px]">
              <div className="glass p-5 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                  Total Minted
                </span>
                <span className="text-3xl font-extrabold text-white">
                  {totalTokens ? Number(totalTokens) : 0}
                </span>
              </div>
              <div className="glass p-5 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                  Network
                </span>
                <span className="text-3xl font-extrabold text-cyan-400">
                  Sepolia
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6">
          <Cards filter={activeTab} onOpenMint={handleOpenMint} />
        </section>
      </main>

      {isMintModalOpen && (
        <MintModal
          onClose={() => setIsMintModalOpen(false)}
          onSuccess={() => {
            setIsMintModalOpen(false);
            refetchTotal();
          }}
        />
      )}

      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 OpenRiver Marketplace. Built for Cohort 9 Lesson 3.</p>
          <a
            href={`https://sepolia.etherscan.io/address/${openriverAddress}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Contract: {openriverAddress.slice(0, 6)}...{openriverAddress.slice(-4)}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
