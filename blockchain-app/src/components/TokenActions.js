import React, { useState } from "react";
import { ethers } from "ethers";
import "./TokenActions.css";

function TokenActions({ walletAddress, goBack }) {
  const [recipient, setRecipient] = useState(""); // Address to send tokens
  const [nativeAmount, setNativeAmount] = useState(""); // Amount of native tokens to send
  const [tokenContractAddress, setTokenContractAddress] = useState(""); // ERC20 token contract address
  const [tokenAmount, setTokenAmount] = useState(""); // Amount of ERC20 tokens to send
  const [transactionHash, setTransactionHash] = useState(""); // Transaction hash after sending
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(false); // Loading state for async operations

  // ERC20 ABI (simplified for transfer function)
  const erc20ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  /** Function to validate Ethereum addresses */
  const validateEthereumAddress = (address) => {
    const pattern = /^0x[a-fA-F0-9]{40}$/;
    return pattern.test(address);
  };

  /** Function to restrict input to valid Ethereum characters */
  const restrictInputToEthereumCharacters = (input) => {
    const pattern = /[^0-9a-fA-Fx]/g;
    return input.replace(pattern, "");
  };

  /** Function to send native tokens like ETH or MATIC */
  const sendNativeTokens = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed!");
      return;
    }

    if (!validateEthereumAddress(recipient)) {
      setError("Invalid recipient address. Please check the input.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a provider and signer using ethers.js
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      console.log(`Sending ${nativeAmount} native tokens to ${recipient}...`);

      // Send transaction
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(nativeAmount), // Convert amount to Wei
      });

      console.log("Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      await tx.wait();

      console.log("Transaction confirmed!");
      setTransactionHash(tx.hash); // Save transaction hash
    } catch (err) {
      console.error("Error sending native tokens:", err);
      setError(err.message || "Failed to send native tokens.");
    } finally {
      setLoading(false);
    }
  };

  /** Function to send ERC20 tokens */
  const sendERC20Tokens = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed!");
      return;
    }

    if (!validateEthereumAddress(recipient)) {
      setError("Invalid recipient address. Please check the input.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a provider and signer using ethers.js
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!tokenContractAddress) {
        throw new Error("Token contract address is required!");
      }

      console.log(`Sending ${tokenAmount} tokens to ${recipient}...`);

      // Connect to the ERC20 token contract
      const tokenContract = new ethers.Contract(tokenContractAddress, erc20ABI, signer);

      // Get the token decimals
      const decimals = await tokenContract.decimals();

      // Convert token amount to smallest unit (e.g., Wei for ETH)
      const amountInWei = ethers.parseUnits(tokenAmount.toString(), decimals);

      // Call the transfer function
      const tx = await tokenContract.transfer(recipient, amountInWei);

      console.log("Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      await tx.wait();

      console.log("Transaction confirmed!");
      setTransactionHash(tx.hash); // Save transaction hash
    } catch (err) {
      console.error("Error sending ERC20 tokens:", err);
      setError(err.message || "Failed to send ERC20 tokens.");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="token-actions">
      <h2>Token Actions</h2>
  
      {/* Go Back Button */}
      <button onClick={goBack} className="back-button">Go Back</button>
  
      {/* Form for Sending Native Tokens */}
      <h3>Send Native Tokens</h3>
      <form onSubmit={(e) => { e.preventDefault(); sendNativeTokens(); }}>
        <div className="form-group">
          <label htmlFor="nativeRecipient">Recipient Address:</label>
          <input
            type="text"
            id="nativeRecipient"
            value={recipient}
            onChange={(e) =>
              setRecipient(restrictInputToEthereumCharacters(e.target.value))
            }
            placeholder="Enter recipient address"
          />
          {!validateEthereumAddress(recipient) && recipient.length > 0 && (
            <p className="error">Invalid Ethereum address.</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="nativeAmount">Amount:</label>
          <input
            type="number"
            id="nativeAmount"
            value={nativeAmount}
            onChange={(e) => setNativeAmount(e.target.value)}
            placeholder="Enter amount in ETH/MATIC/etc."
          />
        </div>
        <button type="submit" className="action-button" disabled={loading}>
          {loading ? "Processing..." : "Send Native Tokens"}
        </button>
      </form>
  
      {/* Form for Sending ERC20 Tokens */}
      <h3>Send ERC20 Tokens</h3>
      <form onSubmit={(e) => { e.preventDefault(); sendERC20Tokens(); }}>
        <div className="form-group">
          <label htmlFor="erc20TokenAddress">Token Contract Address:</label>
          <input
            type="text"
            id="erc20TokenAddress"
            value={tokenContractAddress}
            onChange={(e) =>
              setTokenContractAddress(
                restrictInputToEthereumCharacters(e.target.value)
              )
            }
            placeholder="Enter ERC20 contract address"
          />
        </div>
        <div className="form-group">
          <label htmlFor="erc20Recipient">Recipient Address:</label>
          <input
            type="text"
            id="erc20Recipient"
            value={recipient}
            onChange={(e) =>
              setRecipient(restrictInputToEthereumCharacters(e.target.value))
            }
            placeholder="Enter recipient address"
          />
          {!validateEthereumAddress(recipient) && recipient.length > 0 && (
            <p className="error">Invalid Ethereum address.</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="erc20Amount">Amount:</label>
          <input
            type="number"
            id="erc20Amount"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="Enter amount of tokens"
          />
        </div>
        <button type="submit" className="action-button" disabled={loading}>
          {loading ? "Processing..." : "Send ERC20 Tokens"}
        </button>
      </form>
  
      {/* Display Transaction Hash */}
      {transactionHash && (
        <p className="success">
          Transaction Sent! Etherscan Hash:{" "}
          <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">
            {transactionHash}
          </a>
        </p>
      )}
  
      {/* Error Message */}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default TokenActions;