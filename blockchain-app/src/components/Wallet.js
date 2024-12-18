import React, { useState } from "react";
import { ethers } from "ethers";
import TokenBalances from "./TokenBalances";
import Transactions from "./Transactions";
import NFTs from "./NFTs";
import DeployContractForm from "./DeployContractForm"; // Import the deploy contract component
import TokenActions from "./TokenActions"; // Import the TokenActions component
import DeployedContracts from "./DeployedContracts"; // Import the DeployedContracts component
import "./Wallet.css"; // Import CSS file
import { useNavigate } from "react-router-dom";

function Wallet() {
  const [isConnected, setIsConnected] = useState(false); // Wallet connection state
  const [walletAddress, setWalletAddress] = useState(""); // Wallet address
  const [walletBalance, setWalletBalance] = useState(null); // Store wallet balance
  const [networkName, setNetworkName] = useState(""); // Store connected network name
  const [selectedNetwork, setSelectedNetwork] = useState(""); // Selected network
  const [resetComponents, setResetComponents] = useState(false); // Trigger to reset child components
  const [showDeployForm, setShowDeployForm] = useState(false); // Toggle for DeployContractForm
  const [showTokenActions, setShowTokenActions] = useState(false); // Toggle for TokenActions
  const [showDeployedContracts, setShowDeployedContracts] = useState(false); // Toggle for Deployed Contracts


  // List of supported networks
  const networks = {
    homestead: "Ethereum Mainnet",
    goerli: "Goerli Testnet",
    sepolia: "Sepolia Testnet",
    rinkeby: "Rinkeby Testnet",
    ropsten: "Ropsten Testnet",
    kovan: "Kovan Testnet",
    polygon: "Polygon Mainnet",
    mumbai: "Mumbai Testnet",
  };

  // Connect to Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        setIsConnected(true);

        if (selectedNetwork) {
          await fetchWalletDetails(accounts[0], selectedNetwork);
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed! Please install it from https://metamask.io/");
    }
  };

  // Fetch wallet details (balance and network name)
  const fetchWalletDetails = async (walletAddress, network) => {
    try {
      const provider = ethers.getDefaultProvider(network);
      const networkDetails = await provider.getNetwork();
      setNetworkName(networkDetails.name || "Unknown Network");

      const balanceWei = await provider.getBalance(walletAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setWalletBalance(balanceEth);
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    }
  };

  // Clear token balances, transactions, and NFTs
  const handleClear = () => {
    setWalletBalance(null); // Clear wallet balance
    setNetworkName(""); // Clear network name
    setSelectedNetwork(""); // Clear selected network

    // Reset child components by toggling resetComponents state
    setResetComponents(true);
    setTimeout(() => setResetComponents(false), 100); // Allow time for child components to detect reset
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setIsConnected(false); // Set connection state to false
    setWalletAddress(""); // Clear wallet address
    setWalletBalance(null); // Clear wallet balance
    setNetworkName(""); // Clear network name
    setSelectedNetwork(""); // Clear selected network
    handleClear(); // Reset child components (balances, transactions, etc.)
  };

  // Go back to the home page
  const navigate = useNavigate();
  const goBack = () => {
    navigate("/");
  };
 

  return (
    <div>

      
      {!isConnected ? (
        <button onClick={connectWallet} className="connect">Connect to Wallet</button>
      ) : (
        <div>
          {!showDeployForm && !showTokenActions && !showDeployedContracts ? (
            <>
            <p className="address">Address: {walletAddress}</p>
              
              <div className="button">
              <button onClick={goBack} className="home" >Home</button>
              <button  onClick={() => setShowDeployForm(true)} className="dsm">
                Deploy Smart Contract
              </button>

              {/* Open Token Actions Button */}
              <button  onClick={() => setShowTokenActions(true)} className="transfer">
                Open Token Actions
              </button>

              {/* Deployed Contracts Button */}
              <button  onClick={() => setShowDeployedContracts(true)} className="deployed">
                Deployed Contracts
              </button>

              {/* Disconnect Wallet Button */}
              <button 
                 
                onClick={disconnectWallet} className="disconnect"
              >
                Disconnect Wallet
              </button>
              </div>
              <p className="p">Wallet Connected!</p>
             

              {/* Network Selection Dropdown */}
              <div  className="select">
                <label htmlFor="network-select">Select Network:</label>
                <select className="select-network"
                  id="network-select"
                  value={selectedNetwork}
                  onChange={(e) => {
                    setSelectedNetwork(e.target.value);
                    if (walletAddress) fetchWalletDetails(walletAddress, e.target.value);
                  }}
                >
                  <option value="" >-- Select a Network --</option>
                  {Object.keys(networks).map((key) => (
                    <option key={key} value={key}>
                      {networks[key]}
                    </option>
                  ))}
                </select>
                <button onClick={handleClear} className="clear">Clear</button>
              </div>
              

              {/* Show Balances, Transactions, and NFTs */}
              {selectedNetwork && (
                <>
                  <div className="container">
  <div className="token">
    <TokenBalances 
      walletAddress={walletAddress}
      selectedNetwork={selectedNetwork}
      reset={resetComponents}
    />
  </div>
  
  <div className="content">
    {/* Left-Aligned NFTs */}
    <div className="nfts">
      <NFTs
        walletAddress={walletAddress}
        selectedNetwork={selectedNetwork}
        reset={resetComponents}
      />
    </div>

    {/* Right-Aligned Transactions */}
    <div className="transaction">
      <Transactions
        walletAddress={walletAddress}
        selectedNetwork={selectedNetwork}
        reset={resetComponents}
      />
    </div>
  </div>
</div>
                </>
              )}

              {/* Deploy Smart Contract Button */}
             
            </>
          ) : showDeployForm ? (
            <DeployContractForm walletAddress={walletAddress} goBack={() => setShowDeployForm(false)} 
          /> /* Render DeployContractForm when toggled */
          ) : showTokenActions ? (
            <TokenActions 
              walletAddress={walletAddress} 
              goBack={() => setShowTokenActions(false)} 
            /> /* Render TokenActions when toggled */
          ) : (
            /* Render Deployed Contracts */
            <DeployedContracts walletAddress={walletAddress} selectedNetwork={selectedNetwork} goBack={() => setShowDeployedContracts(false)} 
/>
          )}
        </div>
      )}
    </div>
  );
}

export default Wallet;