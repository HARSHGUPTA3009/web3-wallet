import { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import MyWallet from "./MyWallet.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [contractBalance, setContractBalance] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);

    await updateBalances(provider, signer);
  }

  async function updateBalances(provider, signer) {
    const contract = new Contract(contractAddress, MyWallet.abi, provider);

    const bal = await contract.getBalance();
    setContractBalance(formatEther(bal));

    const userBal = await provider.getBalance(await signer.getAddress());
    setBalance(formatEther(userBal));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚀 My Wallet DApp</h1>
      <button onClick={connectWallet}>Connect Wallet</button>

      {account && (
        <>
          <p>Connected Account: {account}</p>
          <p>Your Balance: {balance} ETH</p>
          <p>Contract Balance: {contractBalance} ETH</p>
        </>
      )}
    </div>
  );
}

export default App;
