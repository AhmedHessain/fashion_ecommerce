import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (email, url) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: "fashion@ic.com>",
    to: email,
    subject: "Password reset request",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f1fa; /* Updated background color to match your design */
            color: #333333;
            padding: 20px;
            line-height: 1.6;
            margin: 0; /* Remove default margin */
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff; /* White background for the email content */
            padding: 30px; /* Increased padding for better spacing */
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #4a4a4a; /* Darker heading color */
            text-align: center; /* Center-align heading */
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 20px;
            color: #ffffff;
            background-color: #B487C9; /* Primary button color */
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px; /* Increased font size for button */
            text-align: center; /* Center text in button */
            }
            .btn:hover {
                opacity:75%
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #666666;
            text-align: center; /* Center-align footer text */
        }
        .footer a {
            color: #007bff; /* Match link color with button color */
            text-decoration: underline; /* Underline links in footer */
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You are receiving this email because we received a request to reset the password for your account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${url}" class="btn">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <p>Thank you,<br>The Team</p>
        <div class="footer">
            <p>If you're having trouble with the button above, copy and paste the following URL into your web browser:</p>
            <p><a style="word-break: break-all;" href="${url}">${url}</a></p>
        </div>
    </div>
</body>
</html>
        `,
  });
};
