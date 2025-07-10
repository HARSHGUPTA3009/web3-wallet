"use client";
import { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import MyWallet from "../MyWallet.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [contractBalance, setContractBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("bg-black", "text-white");
  }, []);

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      await updateBalances(provider, signer);
      toast.success("Wallet connected");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function updateBalances(provider: BrowserProvider, signer: Awaited<ReturnType<BrowserProvider["getSigner"]>>) {
    const contract = new Contract(contractAddress, MyWallet.abi, provider);
    const bal = await contract.getBalance();
    setContractBalance(formatEther(bal));

    const userBal = await provider.getBalance(await signer.getAddress());
    setBalance(formatEther(userBal));
  }

  async function depositETH() {
    try {
      setLoading(true);
      if (!window.ethereum) throw new Error("MetaMask not installed");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: contractAddress,
        value: parseEther(amount),
      });
      await tx.wait();

      toast.success(`Deposited ${amount} ETH`);
      await updateBalances(provider, signer);
      setAmount("");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function withdrawETH() {
    try {
      setLoading(true);
      if (!window.ethereum) throw new Error("MetaMask not installed");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, MyWallet.abi, signer);

      const tx = await contract.sendETH(account, parseEther(amount));
      await tx.wait();

      toast.success(`Withdrew ${amount} ETH`);
      await updateBalances(provider, signer);
      setAmount("");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <Toaster richColors />
      <Card className="bg-neutral-900 border border-neutral-700 shadow-2xl hover:scale-[1.02] transition duration-300 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-cyan-400">💳 Your Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm break-all mb-2">Account:</p>
          <p className="text-lg font-mono mb-4">{account || "Not connected"}</p>
          <p className="mt-2 text-xl font-semibold text-lime-400">Balance: {balance} ETH</p>
          <Button className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            onClick={connectWallet}>
            Connect MetaMask
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border border-neutral-700 shadow-2xl hover:scale-[1.02] transition duration-300 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-pink-400">🏦 Smart Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm break-all mb-2">Contract:</p>
          <p className="text-xs font-mono mb-4">{contractAddress}</p>
          <p className="mt-2 text-xl font-semibold text-yellow-300">Balance: {contractBalance} ETH</p>

          <Input
            placeholder="Amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-6 bg-neutral-800 border border-neutral-600 text-white placeholder:text-neutral-400"
          />

          <div className="flex gap-4 mt-6">
            <Button
              onClick={depositETH}
              disabled={loading}
              className="w-1/2 bg-green-600 hover:bg-green-700"
            >
              Deposit
            </Button>
            <Button
              onClick={withdrawETH}
              disabled={loading}
              className="w-1/2 border border-red-600 text-red-400 hover:bg-red-700 hover:text-white"
              variant="outline"
            >
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
