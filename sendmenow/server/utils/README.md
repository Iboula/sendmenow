# Email Service Documentation

This directory contains the email notification service for SendMeNow.

## Files

- `emailService.js` - Main email service with template support
- `emailService.example.js` - Usage examples
- `../templates/emailTemplate.html` - HTML email template

## Setup

### 1. Install Dependencies

Make sure `nodemailer` is installed:
```bash
npm install nodemailer
```

### 2. Configure Environment Variables

Add the following to your `.env` file in the `server` directory:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@sendmenow.com
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup

If using Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password (not your regular password) in `EMAIL_PASSWORD`

### Other Email Providers

- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587
- **Custom SMTP**: Use your provider's SMTP settings

## Usage

### Basic Usage

```javascript
const { sendEmailNotification } = require('./utils/emailService');

// Send a custom email
await sendEmailNotification({
  to: 'user@example.com',
  subject: 'Welcome to SendMeNow!',
  greeting: 'Hello John!',
  message: 'Thank you for joining us.',
  details: '<p>Your account has been created successfully.</p>',
  buttonText: 'Get Started',
  buttonUrl: 'http://localhost:3000',
  additionalInfo: 'If you have questions, contact support.'
});
```

### Using Predefined Templates

```javascript
const { sendEmailNotification, emailTemplates } = require('./utils/emailService');

// Welcome email
const welcomeData = emailTemplates.welcome('John Doe', 'john@example.com');
await sendEmailNotification(welcomeData);

// Password reset email
const resetData = emailTemplates.passwordReset('John Doe', 'https://example.com/reset?token=abc123');
resetData.to = 'john@example.com';
await sendEmailNotification(resetData);

// Account verification
const verifyData = emailTemplates.accountVerification('John Doe', 'https://example.com/verify?token=xyz789');
verifyData.to = 'john@example.com';
await sendEmailNotification(verifyData);

// Generic notification
const notifyData = emailTemplates.notification(
  'John Doe',
  'Your settings have been updated.',
  '<p>Changes: Email preferences updated</p>'
);
notifyData.to = 'john@example.com';
await sendEmailNotification(notifyData);
```

### Integration with Server Routes

Example: Send welcome email on user registration

```javascript
const { sendEmailNotification, emailTemplates } = require('./utils/emailService');

app.post('/api/users', async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;
  
  // ... save user to database ...
  
  // Send welcome email (non-blocking)
  try {
    const welcomeData = emailTemplates.welcome(userName, userEmail);
    await sendEmailNotification(welcomeData);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't fail the registration if email fails
  }
  
  res.status(201).json({ 
    success: true, 
    message: 'User registered successfully',
    userId: result.insertId 
  });
});
```

## Email Template Structure

The email template (`emailTemplate.html`) supports the following placeholders:

- `{{subject}}` - Email subject
- `{{greeting}}` - Greeting message (e.g., "Hello John!")
- `{{message}}` - Main message content
- `{{details}}` - Additional details (HTML supported)
- `{{buttonText}}` - Call-to-action button text (optional)
- `{{buttonUrl}}` - Call-to-action button URL (optional)
- `{{additionalInfo}}` - Additional information (optional)
- `{{year}}` - Current year (auto-filled)

## Error Handling

The email service throws errors that should be caught:

```javascript
try {
  await sendEmailNotification({...});
} catch (error) {
  console.error('Email error:', error.message);
  // Handle error appropriately
}
```

## Testing

For development/testing without real email credentials, you can use:
- **Ethereal Email**: https://ethereal.email (automatically used if EMAIL_USER is not set in development)
- **Mailtrap**: https://mailtrap.io (set EMAIL_HOST to smtp.mailtrap.io)

## Notes

- Emails are sent asynchronously
- The service includes both HTML and plain text versions
- Template supports conditional blocks for optional content
- All HTML in details/additionalInfo is preserved

