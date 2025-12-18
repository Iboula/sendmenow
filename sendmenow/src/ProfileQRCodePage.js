import { useState, useEffect } from 'react';
import './App.css';
import API_BASE_URL from './config';

function ProfileQRCodePage({ loggedInUser, onBack }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loggedInUser || !loggedInUser.id) {
      setError('User information not available');
      setIsLoading(false);
      return;
    }

    const fetchQRCode = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/user-profile-qrcode/${loggedInUser.id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setQrCodeDataUrl(data.dataUrl);
          setProfileData(data.profileData);
        } else {
          setError(data.message || 'Failed to generate QR code');
        }
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError('Failed to connect to server. Please make sure the backend server is running.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRCode();
  }, [loggedInUser]);

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `profile-qrcode-${loggedInUser.userName || loggedInUser.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>My Profile QR Code</h1>
          <div className="loading-container">
            <p>Generating QR code...</p>
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

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>My Profile QR Code</h1>
          <div className="message error">{error}</div>
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
        <h1>My Profile QR Code</h1>
        <div className="qrcode-container">
          <div className="qrcode-card">
            <div className="qrcode-image-container">
              {qrCodeDataUrl && (
                <img
                  src={qrCodeDataUrl}
                  alt="Profile QR Code"
                  className="qrcode-image"
                />
              )}
            </div>
            
            {profileData && (
              <div className="profile-info">
                <h3>Profile Information</h3>
                <p><strong>Name:</strong> {profileData.userName}</p>
                <p><strong>Email:</strong> {profileData.userEmail}</p>
                <p><strong>User ID:</strong> {profileData.id}</p>
              </div>
            )}

            <div className="qrcode-actions">
              <button onClick={handleDownload} className="submit-button">
                Download QR Code
              </button>
            </div>

            <div className="qrcode-instructions">
              <p>Scan this QR code to share your profile information.</p>
              <p>The QR code contains your profile details in JSON format.</p>
            </div>
          </div>
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

export default ProfileQRCodePage;


