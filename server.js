const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cors({
    origin: '*',
  })
);

app.post('/submit-form', async (req, res) => {
  console.log('received');

  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ];

  const auth = new GoogleAuth({
    keyFile: 'credentials.json',
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID || '1O4K2iYovnMvtN_wmpc5gwOXlekvFt7feP2ZMbb4jz3g';
  const sheetName = process.env.SHEET_NAME || 'Contact';

  const { full_name, email, subject, message } = req.body;

  const allowedSubjects = [
  "Artiste Booking",
  "Press & Media",
  "Partnership & Sponsorship",
  "General Inquiry",
];


  if (!full_name || !email || !subject || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide all Fields',
    });
  }


  if (!allowedSubjects.includes(subject)) {
  return res.status(400).json({
    status: "error",
    message: "Invalid inquiry type selected.",
  });
}

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[full_name, email, subject, message]],
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Form submitted successfully',
    });
  } catch (error) {
    console.error('Sheets API error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Unable to submit form at the moment.',
      error: error.message,
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
