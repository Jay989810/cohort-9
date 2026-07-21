import { useWriteContract } from 'wagmi'
import Header from "./components/Header";
import { voteAbi, voteAddress } from "./contract/vote.ts";

export default function Home() {
  const { writeContract } = useWriteContract()

  const handle = () => {
    writeContract({
      abi: voteAbi,
      address: voteAddress,
      functionName: 'vote',
      args: [
        12n,
      ],
    })
  }

  return (
    <div className="">
      <Header />
      <p>Vote</p>
      <button className="" onClick={handle}>vote</button>
    </div>
  );
}