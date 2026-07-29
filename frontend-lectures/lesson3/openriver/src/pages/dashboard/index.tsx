import { useWriteContract } from "wagmi";
import { openriverAbi, openriverAddress } from "../../contracts";
import { useState } from "react";

// Simple Dashboard Component
const Dashboard = () => {
    // Wagmi hook to handle mint contract call
    const { writeContract: mintNFT } = useWriteContract();
    
    // Simple state variables for form inputs
    const [tokenUrI, setTokenUrI] = useState("");
    const [royalty, setRoyalty] = useState(0);

    // Mint NFT function handler
    const handleMintNFT = async () => {
        mintNFT({
            abi: openriverAbi,
            address: openriverAddress,
            functionName: "newItem",
            args: [
                tokenUrI,
                royalty
            ]
        });
    };

    return (
        <div className="simple-card p-6 max-w-md mx-auto space-y-4">
            <h2 className="text-lg font-bold text-white">Dashboard - Mint NFT</h2>
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Token URI (Image Link)"
                    onChange={(e) => setTokenUrI(e.target.value)}
                    className="simple-input w-full px-3 py-2 text-xs rounded"
                />
                <input
                    type="number"
                    placeholder="Royalty Percentage"
                    onChange={(e) => setRoyalty(Number(e.target.value))}
                    className="simple-input w-full px-3 py-2 text-xs rounded"
                />
                <button onClick={handleMintNFT} className="btn-primary w-full py-2 text-xs font-semibold">
                    Mint NFT
                </button>
            </div>
        </div>
    );
};

export default Dashboard;