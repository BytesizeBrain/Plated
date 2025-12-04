import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../stores/gamificationStore';
import BottomNav from '../../components/navigation/BottomNav';
import './StorePage.css';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isImagePath?: boolean; // true if image is a path to an actual image file
  type: 'sticker' | 'cosmetic' | 'mystery';
  owned: boolean;
  comingSoon?: boolean;
}

// Available stickers and cosmetics using actual images
const STORE_ITEMS: StoreItem[] = [
  // Available Stickers - Using actual gamification images
  {
    id: 'sticker-cat-timer',
    name: 'Cat Timer',
    description: 'A cute cat with a timer - perfect for timed recipes!',
    price: 1000,
    image: '/assets/gamification/CatTimer.jpg',
    isImagePath: true,
    type: 'sticker',
    owned: false,
  },
  {
    id: 'sticker-challenge-completed',
    name: 'Challenge Completed',
    description: 'Show everyone you conquered the challenge!',
    price: 1000,
    image: '/assets/gamification/ChallengeCompleted.jpg',
    isImagePath: true,
    type: 'sticker',
    owned: false,
  },
  {
    id: 'sticker-challenge-failed',
    name: 'Try Again',
    description: 'Sometimes we fail, but we try again!',
    price: 1000,
    image: '/assets/gamification/ChallengeFailed.jpg',
    isImagePath: true,
    type: 'sticker',
    owned: false,
  },
  {
    id: 'sticker-cooking-with-cat',
    name: 'Cooking With Cat',
    description: 'Cook alongside your furry friend!',
    price: 1000,
    image: '/assets/gamification/CookingWithCat.jpg',
    isImagePath: true,
    type: 'sticker',
    owned: false,
  },
  {
    id: 'sticker-eating',
    name: 'Eating',
    description: 'Enjoying a delicious meal!',
    price: 1000,
    image: '/assets/gamification/Eating.jpg',
    isImagePath: true,
    type: 'sticker',
    owned: false,
  },
  {
    id: 'sticker-happy-cooking',
    name: 'Happy Cooking',
    description: 'Spread joy in the kitchen!',
    price: 1000,
    image: '/assets/gamification/HappyCooking.jpg',
    isImagePath: true,
    type: 'sticker',
    owned: false,
  },
  {
    id: 'sticker-level-up',
    name: 'Level Up',
    description: 'Challenge accepted and leveled up!',
    price: 1000,
    image: '/assets/gamification/LevelUp.jpg',
    isImagePath: true,
    type: 'sticker',
    owned: false,
  },
  // Mystery Items - Coming Soon
  {
    id: 'mystery-1',
    name: 'Mystery Sticker',
    description: 'What could it be?',
    price: 1000,
    image: '❓',
    type: 'mystery',
    owned: false,
    comingSoon: true,
  },
  {
    id: 'mystery-2',
    name: 'Secret Recipe Badge',
    description: 'Unlock exclusive content',
    price: 1000,
    image: '🎁',
    type: 'mystery',
    owned: false,
    comingSoon: true,
  },
  {
    id: 'mystery-3',
    name: 'Rare Collection',
    description: 'Coming soon...',
    price: 1000,
    image: '🎭',
    type: 'mystery',
    owned: false,
    comingSoon: true,
  },
  {
    id: 'mystery-4',
    name: 'Special Frame',
    description: 'Coming soon...',
    price: 1000,
    image: '🖼️',
    type: 'mystery',
    owned: false,
    comingSoon: true,
  },
];

export const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const { rewards, spendCoins } = useGamificationStore();
  const coins = rewards?.coins ?? 0;
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());

  const handlePurchase = (item: StoreItem) => {
    if (item.comingSoon) return;
    if (coins < item.price) return;
    if (ownedItems.has(item.id)) return;

    // Spend coins and add to owned items
    spendCoins(item.price);
    setOwnedItems(new Set([...ownedItems, item.id]));
    setPurchaseSuccess(true);
    setSelectedItem(null);
    
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 3000);
  };

  const availableItems = STORE_ITEMS.filter(item => !item.comingSoon);
  const comingSoonItems = STORE_ITEMS.filter(item => item.comingSoon);

  return (
    <div className="store-page">
      {/* Header */}
      <header className="store-header">
        <button className="back-btn" onClick={() => navigate('/feed')} aria-label="Go back to feed">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="store-title">🛍️ Cosmetic Store</h1>
        <div className="coin-balance">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{coins.toLocaleString()}</span>
        </div>
      </header>

      {/* Purchase Success Toast */}
      {purchaseSuccess && (
        <div className="purchase-toast">
          <span className="toast-icon">🎉</span>
          <span>Purchase successful!</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="store-hero">
        <div className="hero-content">
          <h2 className="hero-title">Customize Your Experience</h2>
          <p className="hero-subtitle">
            Trade in your hard-earned coins for exclusive stickers and cosmetics!
          </p>
          <div className="price-tag">
            <span className="price-icon">🪙</span>
            <span className="price-amount">1,000</span>
            <span className="price-label">coins per item</span>
          </div>
        </div>
        <div className="hero-decoration">
          <span className="deco-item deco-1">🎨</span>
          <span className="deco-item deco-2">✨</span>
          <span className="deco-item deco-3">🌟</span>
        </div>
      </div>

      {/* Available Items Section */}
      <section className="store-section">
        <div className="section-header">
          <h2 className="section-title">🎨 Available Now</h2>
          <p className="section-subtitle">Stickers to decorate your posts</p>
        </div>
        <div className="items-grid">
          {availableItems.map((item) => {
            const isOwned = ownedItems.has(item.id);
            const canAfford = coins >= item.price;
            
            return (
              <div
                key={item.id}
                className={`store-item ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'cannot-afford' : ''}`}
                onClick={() => !isOwned && setSelectedItem(item)}
              >
                <div className="item-glow"></div>
                {isOwned && (
                  <div className="owned-badge">
                    <span>✓ Owned</span>
                  </div>
                )}
                <div className={`item-image ${item.isImagePath ? 'has-image' : ''}`}>
                  {item.isImagePath ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>{item.image}</span>
                  )}
                </div>
                <div className="item-info">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                </div>
                <div className="item-price">
                  <span className="price-coin">🪙</span>
                  <span className="price-value">{item.price.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="store-section coming-soon-section">
        <div className="section-header">
          <h2 className="section-title">🔮 Coming Soon</h2>
          <p className="section-subtitle">Mystery items and exclusive cosmetics</p>
        </div>
        <div className="items-grid">
          {comingSoonItems.map((item) => (
            <div key={item.id} className="store-item mystery">
              <div className="mystery-overlay">
                <span className="mystery-text">Coming Soon</span>
              </div>
              <div className="item-image mystery-image">
                <span>{item.image}</span>
              </div>
              <div className="item-info">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>
              </div>
              <div className="item-price locked">
                <span className="price-coin">🔒</span>
                <span className="price-value">???</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="store-info">
        <div className="info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h3>How to earn coins?</h3>
            <ul>
              <li>Complete recipes: +10 coins</li>
              <li>Finish skill tracks: +50 coins</li>
              <li>Daily challenges: +25 coins</li>
              <li>Engage with the community: +5 coins</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Purchase Modal */}
      {selectedItem && (
        <div className="purchase-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="purchase-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>
              ×
            </button>
            <div className={`modal-item-preview ${selectedItem.isImagePath ? 'has-image' : ''}`}>
              {selectedItem.isImagePath ? (
                <img src={selectedItem.image} alt={selectedItem.name} className="modal-item-image" />
              ) : (
                <span className="modal-item-image">{selectedItem.image}</span>
              )}
            </div>
            <h2 className="modal-item-name">{selectedItem.name}</h2>
            <p className="modal-item-description">{selectedItem.description}</p>
            <div className="modal-price">
              <span className="price-coin">🪙</span>
              <span className="price-value">{selectedItem.price.toLocaleString()}</span>
            </div>
            <div className="modal-balance">
              Your balance: <span className="balance-amount">🪙 {coins.toLocaleString()}</span>
            </div>
            {coins >= selectedItem.price ? (
              <button className="purchase-btn" onClick={() => handlePurchase(selectedItem)}>
                Purchase Now
              </button>
            ) : (
              <div className="insufficient-funds">
                <p>Not enough coins!</p>
                <span className="needed">Need {(selectedItem.price - coins).toLocaleString()} more coins</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default StorePage;
