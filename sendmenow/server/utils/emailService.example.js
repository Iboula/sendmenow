// Example usage of the email service

const { sendEmailNotification, emailTemplates } = require('./emailService');

// Example 1: Send a custom email
async function sendCustomEmail() {
  try {
    const result = await sendEmailNotification({
      to: 'user@example.com',
      subject: 'A new message',
      greeting: 'Hello John!',
      message: 'You just received a new message on your sendmenow account.',
      details: '<p><strong>Order Details:</strong></p><p>Order ID: #12345</p><p>Total: $99.99</p>',
      buttonText: 'Log in to your account',
      buttonUrl: {FRONTEND_URL: 'http://localhost:3000'},
      additionalInfo: 'You will receive a shipping confirmation email once your order ships.'
    });
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Example 2: Send welcome email using template
async function sendWelcomeEmail() {
  try {
    const welcomeData = emailTemplates.welcome('John Doe', 'john@example.com');
    const result = await sendEmailNotification(welcomeData);
    console.log('Welcome email sent:', result);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

// Example 3: Send password reset email
async function sendPasswordResetEmail() {
  try {
    const resetData = emailTemplates.passwordReset('John Doe', 'https://example.com/reset?token=abc123');
    resetData.to = 'john@example.com'; // Set recipient
    const result = await sendEmailNotification(resetData);
    console.log('Password reset email sent:', result);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

// Example 4: Send notification email
async function sendNotificationEmail() {
  try {
    const notificationData = emailTemplates.notification(
      'John Doe',
      'Your account settings have been updated successfully.',
      '<p>Changes made:</p><ul><li>Email preferences updated</li><li>Notification settings changed</li></ul>'
    );
    notificationData.to = 'john@example.com';
    const result = await sendEmailNotification(notificationData);
    console.log('Notification email sent:', result);
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
}

// Uncomment to test:
// sendCustomEmail();
// sendWelcomeEmail();
// sendPasswordResetEmail();
// sendNotificationEmail();

module.exports = {
  sendCustomEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail
};

