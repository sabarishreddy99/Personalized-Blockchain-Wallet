import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function TokenBalances({ walletAddress, selectedNetwork, reset }) {
  const [nativeBalance, setNativeBalance] = useState(null); // Store native token balance
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    if (reset) {
      resetToDefaultState();
    } else if (walletAddress && selectedNetwork) {
      fetchNativeBalance();
    }
  }, [walletAddress, selectedNetwork, reset]);

  const fetchNativeBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching native token balance for ${walletAddress} on ${selectedNetwork}...`);

      // Create a provider for the selected network
      const provider = ethers.getDefaultProvider(selectedNetwork);

      // Fetch the wallet's native token balance (in Wei)
      const balanceWei = await provider.getBalance(walletAddress);

      // Convert balance from Wei to Ether (or native token unit)
      const balanceEth = ethers.formatEther(balanceWei); // Converts from Wei to ETH

      console.log(`Native Balance in ETH: ${balanceEth}`);
      setNativeBalance(balanceEth);
    } catch (err) {
      console.error("Error fetching native token balance:", err);
      setError("Failed to fetch native token balance.");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaultState = () => {
    setNativeBalance(null); // Clear balances
    setError(null); // Clear errors
    setLoading(false); // Reset loading state
  };

  return (
    <div>
      <h2>Token Balances</h2>

      {/* Loading State */}
      {loading && <p>Loading...</p>}

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display Native Token Balance */}
      {!loading && !error && (
        <div>
          <p><strong> Token Balance:</strong> {nativeBalance ? `${nativeBalance} ETH` : "N/A"}</p>
        </div>
      )}
    </div>
  );
}

export default TokenBalances;