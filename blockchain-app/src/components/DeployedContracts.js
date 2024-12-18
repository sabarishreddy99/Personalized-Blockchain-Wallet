
import React, { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import "./DeployedContracts.css";
import { useNavigate } from "react-router-dom";

function DeployedContracts({ walletAddress, selectedNetwork, goBack }) {
  const [apiKey, setApiKey] = useState(""); // State for user-provided API key
  const [contracts, setContracts] = useState([]); // Store deployed contracts
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(false); // Loading state
  const [showApiInput, setShowApiInput] = useState(true); // Toggle API key input visibility
  const [showAll, setShowAll] = useState(false); // Toggle between showing two and all contracts

  const fetchDeployedContracts = async () => {
    if (!apiKey) {
      setError("Please provide a valid Etherscan API key.");
      return;
    }

    if (!selectedNetwork) {
      setError("Please select a network.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const networkApiEndpoint =
        selectedNetwork === "homestead"
          ? "https://api.etherscan.io/api"
          : `https://api-${selectedNetwork}.etherscan.io/api`;

      const response = await axios.get(networkApiEndpoint, {
        params: {
          module: "account",
          action: "txlist",
          address: walletAddress,
          startblock: 0,
          endblock: 99999999,
          sort: "asc",
          apikey: apiKey,
        },
      });

      if (response.data.status === "1") {
        setContracts(response.data.result);
      } else {
        setError("Failed to fetch contracts. Please check your API key and network.");
      }
    } catch (err) {
      setError("An error occurred while fetching contracts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deployed-contracts-container">
      <h2>Deployed Contracts</h2>
      {showApiInput && (
        <div className="form-group">
          <label htmlFor="apiKey">Etherscan API Key</label>
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Etherscan API key"
          />
          <div className="button-group">
            <button onClick={fetchDeployedContracts} className="fetch-button">
              Fetch Contracts
            </button>
            <button onClick={goBack} className="back-button">Go Back</button>
          </div>
        </div>
      )}
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {contracts.length > 0 && (
        <div className="contracts-list">
          <ul>
            {(showAll ? contracts : contracts.slice(0, 2)).map((contract, index) => (
              <li key={index}>
                <p>
                  <strong>Contract Address:</strong>{" "}
                  <a
                    href={`https://sepolia.etherscan.io/address/${contract.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contract.to}
                  </a>
                </p>
                <p>
                  <strong>Transaction Hash:</strong>{" "}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${contract.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contract.hash}
                  </a>
                </p>
                <p><strong>Date Created:</strong> {new Date(contract.timeStamp * 1000).toLocaleString()}</p>
                <p><strong>Gas Used:</strong> {contract.gasUsed}</p>
                <p><strong>Amount:</strong> {ethers.formatEther(contract.value)} ETH</p>
              </li>
            ))}
          </ul>
          {/* More/Less Button */}
          {contracts.length > 2 && (
            <button onClick={() => setShowAll(!showAll)} className="toggle-button">
              {showAll ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DeployedContracts;
