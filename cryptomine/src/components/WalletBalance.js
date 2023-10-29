import React from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from './UserRoleContext';

const WalletBalance = () => {
const { userImg, userEmail, userFullName, userID, userPhoneNo, userRole, userBalance, setUserBalance } = useFirebase();
  return (
    <div className="wallet-balance-container">
      <div className="wallet-header">
        <h2>Your Wallet Balance</h2>
      </div>

      <div className="wallet-balance">
        <div className="balance-amount">
          <span className="currency-symbol">₦</span>
          <span className="balance-value">{userBalance}</span>
        </div>

        <button className="add-funds-button">Withdraw</button>
      </div>
        <button className='my-4 mb-4 btn-theme'><Link to='/activate_account' className="">Activate Account</Link></button>
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <ul className="transaction-list">
          <li className="transaction-item">Transaction 1</li>
          <li className="transaction-item">Transaction 2</li>
          <li className="transaction-item">Transaction 3</li>
        </ul>
      </div>
    </div>
  );
};

export default WalletBalance;
