import { useState } from 'react';
import './App.css';

function PhotoSendPage({ loggedInUser, onBack }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStatusMessage('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setStatusMessage('Image size must be less than 10MB');
        return;
      }

      setSelectedPhoto(file);
      setStatusMessage('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPhoto) {
      setStatusMessage('Please select a photo');
      return;
    }

    if (!recipientEmail) {
      setStatusMessage('Please enter recipient email');
      return;
    }

    if (!message.trim()) {
      setStatusMessage('Please enter a message');
      return;
    }

    setIsLoading(true);
    setStatusMessage('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedPhoto);
      formData.append('recipientEmail', recipientEmail);
      formData.append('message', message);
      formData.append('subject', subject || 'Photo from SendMeNow');
      formData.append('senderName', loggedInUser?.userName || 'Someone');

      const response = await fetch('http://localhost:5000/api/send-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage('Photo sent successfully!');
        // Reset form
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setRecipientEmail('');
        setMessage('');
        setSubject('');
        // Clear file input
        e.target.reset();
      } else {
        setStatusMessage(data.message || 'Failed to send photo');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatusMessage('Failed to connect to server. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Send Photo with Message</h1>
        <form onSubmit={handleSubmit} className="form-container photo-send-form">
          <div className="form-group">
            <label htmlFor="photo">Select Photo:</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="file-input"
            />
            {photoPreview && (
              <div className="photo-preview-container">
                <img src={photoPreview} alt="Preview" className="photo-preview" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="remove-photo-button"
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="recipientEmail">Recipient Email:</label>
            <input
              type="email"
              id="recipientEmail"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              placeholder="recipient@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject (optional):</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Photo from SendMeNow"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows="5"
              placeholder="Enter your message here..."
              className="message-textarea"
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Photo'}
          </button>

          {statusMessage && (
            <div className={`message ${statusMessage.includes('successfully') ? 'success' : 'error'}`}>
              {statusMessage}
            </div>
          )}

          {onBack && (
            <button type="button" onClick={onBack} className="back-button">
              Back to Dashboard
            </button>
          )}
        </form>
      </header>
    </div>
  );
}

export default PhotoSendPage;

