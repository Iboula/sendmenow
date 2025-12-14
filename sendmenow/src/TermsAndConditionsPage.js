import { useState } from 'react';
import './App.css';

function TermsAndConditionsPage({ onAccept }) {
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (scrolledToBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  const handleAccept = () => {
    if (hasScrolled) {
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      if (onAccept) {
        onAccept();
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Terms and Conditions</h1>
        <div className="terms-container">
          <div 
            className="terms-content" 
            onScroll={handleScroll}
          >
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on SendMeNow's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on SendMeNow's website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2>3. User Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
            </p>

            <h2>4. Content and Privacy</h2>
            <p>
              You are responsible for the content you send through this service. We respect your privacy and handle your data in accordance with our Privacy Policy. However, you acknowledge that:
            </p>
            <ul>
              <li>You will not send any illegal, harmful, or offensive content</li>
              <li>You will not use the service to spam or harass others</li>
              <li>You grant us permission to store and transmit your content as necessary to provide the service</li>
            </ul>

            <h2>5. Prohibited Uses</h2>
            <p>
              You may not use our service:
            </p>
            <ul>
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
            </ul>

            <h2>6. Disclaimer</h2>
            <p>
              The materials on SendMeNow's website are provided on an 'as is' basis. SendMeNow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2>7. Limitations</h2>
            <p>
              In no event shall SendMeNow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SendMeNow's website, even if SendMeNow or a SendMeNow authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h2>8. Revisions</h2>
            <p>
              SendMeNow may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with applicable laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us through the appropriate channels.
            </p>

            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(97, 218, 251, 0.1)', borderRadius: '5px' }}>
              <p style={{ fontStyle: 'italic', color: '#61dafb' }}>
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="terms-actions">
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                checked={hasScrolled}
                onChange={() => {}}
                disabled
                className="terms-checkbox"
              />
              <span>I have read and scrolled through all the terms and conditions</span>
            </label>
            <button
              onClick={handleAccept}
              className="submit-button"
              disabled={!hasScrolled}
            >
              Accept Terms and Continue
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default TermsAndConditionsPage;
