import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

interface HeaderProps {
  activeTab: 'explore' | 'mint' | 'my-nfts';
  setActiveTab: (tab: 'explore' | 'mint' | 'my-nfts') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            OpenRiver
          </span>
        </div>

        <nav className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'explore'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('mint')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'mint'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Create NFT
          </button>
          <button
            onClick={() => setActiveTab('my-nfts')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'my-nfts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            My NFTs
          </button>
        </nav>

        <div>
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </header>
  );
}