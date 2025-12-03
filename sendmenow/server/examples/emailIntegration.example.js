// Example: How to integrate email notifications into your server routes
// This file shows examples of using the email service in your API endpoints

const { sendEmailNotification, emailTemplates } = require('../utils/emailService');

// Example 1: Send welcome email on user registration
async function handleUserRegistration(req, res, db) {
  const { userName, userEmail, userPassword } = req.body;

  // Validate input
  if (!userName || !userEmail || !userPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  // Insert user into database
  const query = 'INSERT INTO users (user_name, user_mail, user_password) VALUES (?, ?, ?)';
  
  db.query(query, [userName, userEmail, userPassword], async (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error saving user to database',
        error: err.message 
      });
    }

    // Send welcome email (non-blocking - don't fail registration if email fails)
    try {
      const welcomeData = emailTemplates.welcome(userName, userEmail);
      await sendEmailNotification(welcomeData);
      console.log('Welcome email sent to:', userEmail);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  });
}

// Example 2: Send password reset email
async function handlePasswordResetRequest(req, res, db) {
  const { userEmail } = req.body;

  // Find user by email
  const query = 'SELECT * FROM users WHERE user_mail = ?';
  
  db.query(query, [userEmail], async (err, results) => {
    if (err || results.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(200).json({ 
        success: true, 
        message: 'If that email exists, a password reset link has been sent.' 
      });
    }

    const user = results[0];
    // Generate reset token (in production, use a secure token generation method)
    const resetToken = `reset_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // TODO: Save reset token to database with expiration time

    // Send password reset email
    try {
      const resetData = emailTemplates.passwordReset(user.user_name || user.userName, resetLink);
      resetData.to = userEmail;
      await sendEmailNotification(resetData);
      console.log('Password reset email sent to:', userEmail);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send password reset email' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    });
  });
}

// Example 3: Send custom notification email
async function sendCustomNotification(userEmail, userName, notificationMessage, details) {
  try {
    const notificationData = emailTemplates.notification(
      userName,
      notificationMessage,
      details
    );
    notificationData.to = userEmail;
    await sendEmailNotification(notificationData);
    console.log('Notification email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return { success: false, error: error.message };
  }
}

// Example 4: Send account verification email
async function sendAccountVerificationEmail(userEmail, userName, verificationToken) {
  try {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const verifyData = emailTemplates.accountVerification(userName, verificationLink);
    verifyData.to = userEmail;
    await sendEmailNotification(verifyData);
    console.log('Verification email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleUserRegistration,
  handlePasswordResetRequest,
  sendCustomNotification,
  sendAccountVerificationEmail
};

