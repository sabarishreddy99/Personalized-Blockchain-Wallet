import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Transactions.css"; // Import the CSS file

function Transactions({ walletAddress, selectedNetwork, reset }) {
  const [transactions, setTransactions] = useState([]); // Transaction data
  const [showTransactions, setShowTransactions] = useState(false); // Toggle visibility
  const [apiKey, setApiKey] = useState(""); // User's Etherscan API key
  const [error, setError] = useState(null); // Error handling
  const [showApiKey, setShowApiKey] = useState(false); // Toggle API key visibility
  const [showAllTransactions, setShowAllTransactions] = useState(false); // Toggle for showing all transactions

  // Map supported networks to their Etherscan API endpoints
  const networkEndpoints = {
    homestead: "https://api.etherscan.io/api",
    goerli: "https://api-goerli.etherscan.io/api",
    sepolia: "https://api-sepolia.etherscan.io/api",
  };

  const fetchTransactions = async () => {
    if (!apiKey || !networkEndpoints[selectedNetwork]) {
      setError("Please provide a valid API key and select a supported network.");
      return;
    }

    try {
      setError(null); // Clear any previous errors

      const response = await axios.get(
        `${networkEndpoints[selectedNetwork]}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`
      );

      if (response.data && Array.isArray(response.data.result)) {
        setTransactions(response.data.result);
        setShowTransactions(true);
      } else {
        setError("No transactions found or invalid data.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions. Please check your API key.");
    }
  };

  // Reset state when the reset prop changes to true
  useEffect(() => {
    if (reset) {
      resetToDefaultState();
    }
  }, [reset]);

  const resetToDefaultState = () => {
    setTransactions([]); // Clear previous transactions
    setShowTransactions(false); // Hide transactions
    setApiKey(""); // Clear API key input
    setError(null); // Clear errors
  };

  const formatTimestamp = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // Format as human-readable date and time
  };

  // Determine which transactions to display based on the toggle state
  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 2);

  return (
    <div className="transactions-container">
      <h2>Transactions</h2>

      {/* Input for API Key */}
      <div className="form-group">
        <label htmlFor="apiKey">Etherscan API Key:</label>
        <input
          type={showApiKey ? "text" : "password"} // Toggle between text and password input types
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Etherscan API key"
        />
        <button className="button-show" onClick={() => setShowApiKey(!showApiKey)}>
          {showApiKey ? "Hide API Key" : "Show API Key"}
        </button>
        <button className="fetch-button" onClick={fetchTransactions}>
          Fetch Transactions
        </button>
        {showTransactions && (
          <button className="clear-button" onClick={() => resetToDefaultState()}>
            Clear Transactions
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Display Transactions */}
      {showTransactions && transactions.length > 0 ? (
        <>
          <ul className="transactions-list">
            {displayedTransactions.map((txn) => (
              <li key={txn.hash} className="transaction-item">
                <p><strong>Transaction Hash:</strong> {txn.hash}</p>
                <p><strong>From:</strong> {txn.from}</p>
                <p><strong>To:</strong> {txn.to || "Contract Creation"}</p>
                <p><strong>Value:</strong> {txn.value / 10 ** 18} ETH</p>
                <p><strong>Date & Time:</strong> {formatTimestamp(txn.timeStamp)}</p>
                <p><strong>Block Number:</strong> {txn.blockNumber}</p>
                <p><strong>Gas Used:</strong> {txn.gasUsed}</p>
                <p><strong>Gas Price:</strong> {txn.gasPrice / 10 ** 9} Gwei</p>
                <p><strong>Status:</strong> {txn.isError === "0" ? "Success" : "Failed"}</p>
              </li>
            ))}
          </ul>

          {/* Toggle Button */}
          {transactions.length > 2 && (
            <button onClick={() => setShowAllTransactions(!showAllTransactions)} className="toggle-button">
              {showAllTransactions ? "Show Less" : "Show More"}
            </button>
          )}
        </>
      ) : (
        showTransactions && !error && <p>No transactions to display.</p>
      )}
    </div>
  );
}

export default Transactions;