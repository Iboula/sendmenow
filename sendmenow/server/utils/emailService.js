const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email configuration from environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
  }
};

// Create reusable transporter object
let transporter = null;

// Initialize email transporter
function initializeTransporter() {
  if (!transporter) {
    // Check if we have valid email credentials
    const hasAuth = emailConfig.auth && emailConfig.auth.user && emailConfig.auth.pass;
    
    if (!hasAuth && process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Email credentials not configured. Email sending may fail.');
      console.warn('   Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
    }

    const transporterConfig = {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
    };

    // Only add auth if credentials are provided
    if (hasAuth) {
      transporterConfig.auth = emailConfig.auth;
    } else if (process.env.NODE_ENV === 'development') {
      // For development without credentials, log a warning but don't fail
      console.warn('⚠️  Running without email credentials. Emails will not be sent.');
    }

    transporter = nodemailer.createTransport(transporterConfig);
  }
  return transporter;
}

// Load email template
function loadEmailTemplate() {
  const templatePath = path.join(__dirname, '../templates/emailTemplate.html');
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error('Error loading email template:', error);
    return null;
  }
}

// Replace template placeholders
function replaceTemplatePlaceholders(template, data) {
  let html = template;
  
  // Replace simple placeholders
  const placeholders = {
    subject: data.subject || 'Notification from SendMeNow',
    greeting: data.greeting || 'Hello!',
    message: data.message || '',
    details: data.details || '',
    buttonText: data.buttonText || '',
    buttonUrl: data.buttonUrl || '#',
    additionalInfo: data.additionalInfo || '',
    year: new Date().getFullYear()
  };
  
  Object.keys(placeholders).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, placeholders[key]);
  });
  
  // Handle conditional blocks (simple implementation)
  if (!data.details) {
    html = html.replace(/{{#if details}}[\s\S]*?{{\/if}}/g, '');
  } else {
    html = html.replace(/{{#if details}}/g, '').replace(/{{\/if}}/g, '');
  }
  
  if (!data.buttonText) {
    html = html.replace(/{{#if buttonText}}[\s\S]*?{{\/if}}/g, '');
  } else {
    html = html.replace(/{{#if buttonText}}/g, '').replace(/{{\/if}}/g, '');
  }
  
  if (!data.additionalInfo) {
    html = html.replace(/{{#if additionalInfo}}[\s\S]*?{{\/if}}/g, '');
  } else {
    html = html.replace(/{{#if additionalInfo}}/g, '').replace(/{{\/if}}/g, '');
  }
  
  return html;
}

// Send email notification
async function sendEmailNotification(options) {
  const {
    to,
    subject,
    greeting,
    message,
    details,
    buttonText,
    buttonUrl,
    additionalInfo,
    attachments
  } = options;

  // Validate required fields
  if (!to || !subject || !message) {
    throw new Error('Missing required email fields: to, subject, and message are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error(`Invalid email address: ${to}`);
  }

  try {
    // Initialize transporter
    const mailTransporter = initializeTransporter();
    
    // Check if we have credentials
    const hasAuth = emailConfig.auth && emailConfig.auth.user && emailConfig.auth.pass;
    if (!hasAuth) {
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
    }
    
    // Load and process template
    const template = loadEmailTemplate();
    let htmlContent;
    
    if (template) {
      htmlContent = replaceTemplatePlaceholders(template, {
        subject,
        greeting: greeting || 'Hello!',
        message,
        details,
        buttonText,
        buttonUrl: buttonUrl || '#',
        additionalInfo
      });
    } else {
      // Fallback HTML if template doesn't exist
      htmlContent = `
        <html>
          <body>
            <h2>${greeting || 'Hello!'}</h2>
            <p>${message}</p>
            ${details ? `<div>${details}</div>` : ''}
            ${buttonText && buttonUrl ? `<p><a href="${buttonUrl}" style="background-color: #61dafb; color: #282c34; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">${buttonText}</a></p>` : ''}
            ${additionalInfo ? `<p>${additionalInfo}</p>` : ''}
          </body>
        </html>
      `;
    }

    // Determine sender email
    const fromEmail = process.env.EMAIL_FROM || emailConfig.auth.user || 'noreply@sendmenow.com';

    // Email options
    const mailOptions = {
      from: fromEmail,
      to: to,
      subject: subject,
      html: htmlContent,
      // Plain text fallback
      text: `${greeting || 'Hello!'}\n\n${message}\n\n${details ? details.replace(/<[^>]*>/g, '') : ''}\n\n${additionalInfo || ''}`
    };

    // Add attachments if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    // Send email
    const info = await mailTransporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide more helpful error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your EMAIL_USER and EMAIL_PASSWORD in .env file');
    } else if (error.code === 'ECONNECTION') {
      throw new Error(`Failed to connect to email server (${emailConfig.host}:${emailConfig.port}). Please check your EMAIL_HOST and EMAIL_PORT settings.`);
    } else if (error.message.includes('credentials')) {
      throw error;
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

// Predefined email templates for common scenarios
const emailTemplates = {
  // Welcome email for new user registration
  welcome: (userName, userEmail) => ({
    to: userEmail,
    subject: 'Welcome to SendMeNow!',
    greeting: `Hello ${userName}!`,
    message: 'Thank you for registering with SendMeNow. We are excited to have you on board!',
    details: `<p><strong>Account Details:</strong></p>
              <p>Username: <span class="highlight">${userName}</span></p>
              <p>Email: <span class="highlight">${userEmail}</span></p>`,
    additionalInfo: 'If you have any questions, feel free to reach out to our support team.',
    buttonText: 'Get Started',
    buttonUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  }),

  // Password reset email
  passwordReset: (userName, resetLink) => ({
    to: '', // Will be set by caller
    subject: 'Password Reset Request - SendMeNow',
    greeting: `Hello ${userName}!`,
    message: 'You have requested to reset your password. Click the button below to create a new password.',
    details: '<p>This link will expire in 1 hour for security reasons.</p>',
    buttonText: 'Reset Password',
    buttonUrl: resetLink,
    additionalInfo: 'If you did not request this password reset, please ignore this email or contact support if you have concerns.'
  }),

  // Account verification email
  accountVerification: (userName, verificationLink) => ({
    to: '', // Will be set by caller
    subject: 'Verify Your SendMeNow Account',
    greeting: `Hello ${userName}!`,
    message: 'Please verify your email address to complete your account setup.',
    buttonText: 'Verify Email',
    buttonUrl: verificationLink,
    additionalInfo: 'This verification link will expire in 24 hours.'
  }),

  // Generic notification
  notification: (userName, notificationMessage, details) => ({
    to: '', // Will be set by caller
    subject: 'Notification from SendMeNow',
    greeting: `Hello ${userName}!`,
    message: notificationMessage,
    details: details || '',
    additionalInfo: 'Thank you for using SendMeNow!'
  })
};

// Verify email configuration
function verifyEmailConfig() {
  const hasAuth = emailConfig.auth && emailConfig.auth.user && emailConfig.auth.pass;
  const hasHost = emailConfig.host;
  const hasPort = emailConfig.port;
  
  return {
    configured: hasAuth && hasHost && hasPort,
    hasAuth: hasAuth,
    hasHost: hasHost,
    hasPort: hasPort,
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    from: process.env.EMAIL_FROM || emailConfig.auth?.user || 'noreply@sendmenow.com'
  };
}

module.exports = {
  sendEmailNotification,
  emailTemplates,
  initializeTransporter,
  verifyEmailConfig
};

