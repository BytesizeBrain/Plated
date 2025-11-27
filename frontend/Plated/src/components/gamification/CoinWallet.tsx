import './CoinWallet.css';

interface CoinWalletProps {
  coins: number;
  onClick?: () => void;
  showLabel?: boolean;
}

function CoinWallet({ coins, onClick, showLabel = true }: CoinWalletProps) {
  const formatCoins = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <button
      className="coin-wallet"
      onClick={onClick}
      aria-label={`${coins} coins`}
    >
      <div className="coin-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="10" fill="#FFD700" />
          <circle cx="12" cy="12" r="7" fill="#FFA500" />
          <text
            x="12"
            y="16"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            fill="#FFFFFF"
          >
            C
          </text>
        </svg>
      </div>
      <div className="coin-amount">
        <span className="coin-value">{formatCoins(coins)}</span>
        {showLabel && <span className="coin-label">Coins</span>}
      </div>
    </button>
  );
}

export default CoinWallet;
