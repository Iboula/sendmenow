import { useState, useEffect } from 'react';
import './App.css';
import API_BASE_URL from './config';

function MarketPage({ loggedInUser, onBack }) {
  const [marketItems, setMarketItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ['all', 'photos', 'services', 'digital', 'premium'];

  useEffect(() => {
    fetchMarketItems();
  }, []);

  const fetchMarketItems = async () => {
    setIsLoading(true);
    setError('');

    try {
      // For now, using mock data. Replace with actual API call when backend is ready
      // const response = await fetch(`${API_BASE_URL}/api/market/items`);
      // const data = await response.json();
      
      // Mock market items
      const mockItems = [
        {
          id: 1,
          title: 'Premium Photo Package',
          description: 'Get 10 high-quality photo sends with priority processing',
          category: 'premium',
          price: 9.99,
          image: null,
          seller: 'SendMeNow',
          rating: 4.8
        },
        {
          id: 2,
          title: 'Digital Art Collection',
          description: 'Access to exclusive digital art pieces',
          category: 'digital',
          price: 19.99,
          image: null,
          seller: 'Art Gallery',
          rating: 4.5
        },
        {
          id: 3,
          title: 'Photo Editing Service',
          description: 'Professional photo editing for your images',
          category: 'services',
          price: 14.99,
          image: null,
          seller: 'PhotoPro',
          rating: 4.9
        },
        {
          id: 4,
          title: 'Photo Storage Upgrade',
          description: 'Expand your photo storage to 100GB',
          category: 'services',
          price: 4.99,
          image: null,
          seller: 'SendMeNow',
          rating: 4.7
        },
        {
          id: 5,
          title: 'Premium Templates',
          description: 'Beautiful message templates for special occasions',
          category: 'digital',
          price: 7.99,
          image: null,
          seller: 'Design Studio',
          rating: 4.6
        },
        {
          id: 6,
          title: 'Bulk Photo Send',
          description: 'Send photos to multiple recipients at once',
          category: 'services',
          price: 12.99,
          image: null,
          seller: 'SendMeNow',
          rating: 4.8
        }
      ];

      setMarketItems(mockItems);
    } catch (err) {
      console.error('Error fetching market items:', err);
      setError('Failed to load market items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = marketItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = async (item) => {
    if (!loggedInUser) {
      setError('Please log in to make a purchase');
      return;
    }

    try {
      // TODO: Implement actual purchase API call
      // const response = await fetch(`${API_BASE_URL}/api/market/purchase`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     itemId: item.id,
      //     userId: loggedInUser.id
      //   })
      // });

      alert(`Purchase initiated for: ${item.title}\nPrice: $${item.price.toFixed(2)}\n\nNote: This is a demo. Actual payment processing will be implemented.`);
    } catch (err) {
      console.error('Error processing purchase:', err);
      setError('Failed to process purchase. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Marketplace</h1>
          <div className="loading-container">
            <p>Loading market items...</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="back-button">
              Back to Dashboard
            </button>
          )}
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Marketplace</h1>
        
        <div className="market-container">
          {/* Search and Filter */}
          <div className="market-filters">
            <div className="form-group">
              <label htmlFor="search">Search Items:</label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for items..."
                className="search-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="message error">{error}</div>
          )}

          {/* Market Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="empty-messages">
              <p>No items found matching your criteria.</p>
              <p>Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="market-items-grid">
              {filteredItems.map(item => (
                <div key={item.id} className="market-item-card">
                  <div className="market-item-header">
                    <h3>{item.title}</h3>
                    <div className="market-item-rating">
                      ⭐ {item.rating}
                    </div>
                  </div>
                  
                  <div className="market-item-category">
                    <span className="category-badge">{item.category}</span>
                  </div>
                  
                  <p className="market-item-description">{item.description}</p>
                  
                  <div className="market-item-seller">
                    <strong>Seller:</strong> {item.seller}
                  </div>
                  
                  <div className="market-item-footer">
                    <div className="market-item-price">
                      ${item.price.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handlePurchase(item)}
                      className="purchase-button"
                    >
                      Purchase
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {onBack && (
          <button onClick={onBack} className="back-button">
            Back to Dashboard
          </button>
        )}
      </header>
    </div>
  );
}

export default MarketPage;
