import React, { useState } from 'react';
import { BrowserProvider, parseUnits } from 'ethers';

function SendEth() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transactionHash, setTransactionHash] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendEth = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed!');
      return;
    }

    if (!recipientAddress) {
      setError('Recipient address is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Connect to MetaMask
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      console.log('Sending ETH...');

      // Define transaction parameters
      const tx = {
        to: recipientAddress,
        value: parseUnits('0.05', 'ether'), // Sending 0.05 ETH
        gasLimit: 21000, // Standard gas limit for ETH transfer
        gasPrice: parseUnits('50', 'gwei'), // Example gas price
      };

      // Send the transaction
      const transactionResponse = await signer.sendTransaction(tx);
      console.log('Transaction sent:', transactionResponse.hash);

      // Wait for transaction confirmation
      await transactionResponse.wait();
      
      setTransactionHash(transactionResponse.hash);
    } catch (err) {
      console.error('Error sending ETH:', err);
      setError(err.message || 'Failed to send ETH.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Send ETH</h1>
      
       {/* Input Field for Recipient Address */}
       <div>
         <label htmlFor="recipient">Recipient Address:</label>
         <input
           type="text"
           id="recipient"
           placeholder="Enter recipient wallet address"
           value={recipientAddress}
           onChange={(e) => setRecipientAddress(e.target.value)}
         />
       </div>

       {/* Send Button */}
       <button onClick={sendEth} disabled={loading}>
         {loading ? 'Sending...' : 'Send 0.05 ETH'}
       </button>

       {/* Display Transaction Hash */}
       {transactionHash && (
         <p>
           Transaction Hash: <strong>{transactionHash}</strong>
         </p>
       )}

       {/* Display Error */}
       {error && <p style={{ color: 'red' }}>{error}</p>}
     </div>
   );
}

export default SendEth;


