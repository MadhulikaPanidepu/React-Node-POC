const express = require('express');
const fs = require('fs');
const cors = require('cors');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const trucksFilePath = './trucks.json';

// Twilio credentials
const accountSid = 'ACPNd360958565b80d443e314168ccc1caeb';
const authToken = '1435800d7cd59ffb95cc89de6709f479';
const client = twilio(accountSid, authToken);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({ 
    service: 'gmail',
    auth: {
      user: 'prettymadhulika@gmail.com',
      pass: 'vauzmwwxiuowkxvg',  // App password (not regular Gmail password)
    },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error in transporter configuration:', error);
  } else {
    console.log('Transporter is ready to send messages');
  }
});

// Helper function to get trucks data
function getTrucksData() {
    const trucksData = fs.readFileSync(trucksFilePath);
    return JSON.parse(trucksData);
}

// Helper function to save trucks data
function saveTrucksData(data) {
    fs.writeFileSync(trucksFilePath, JSON.stringify(data, null, 2));
}

async function sendEmail(to, subject, message) {
    try {
        console.log("Attempting to send email...");
        const mailOptions = {
            from: 'prettymadhulika@gmail.com',
            to: to,
            subject: subject,
            text: message,
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendSMS(to, message) {
    try {
        console.log("Attempting to send SMS...");
        const smsInfo = await client.messages.create({
            body: message,
            from: '+18665988346',  // Twilio phone number
            to: to,
        });
        console.log('SMS sent successfully:', smsInfo.sid);
    } catch (error) {
        console.error('Error sending SMS:', error);
        if (error.code === 21608) {
            console.error('You need to verify this number if using a trial account.');
        }
    }
}

// Main POST API to update truck details and send notifications
app.post('/api/trucks', async (req, res) => {
    const { license_plate } = req.body;

    let trucksData = getTrucksData();
    const truck = trucksData.trucks.find((t) => t.license_plate === license_plate);

    if (truck) {
        if (!truck.entry_timestamp) {
            // Update entry_timestamp for the first time
            truck.entry_timestamp = new Date().toISOString();

            // Send email and SMS notification
            const emailMessage = `Welcome to the warehouse, ${truck.driver_name}! Your entry has been recorded.`;
            await sendEmail(truck.email, 'Warehouse Entry Confirmation', emailMessage);

            const smsMessage = `Welcome to the warehouse, ${truck.driver_name}! Your entry has been recorded.`;
            await sendSMS(truck.phone_number, smsMessage);
        } else if (truck.entry_timestamp && !truck.leave_timestamp) {
            truck.leave_timestamp = new Date().toISOString();
            truck.status = 'Completed';
        } else {
            return res.json({ success: false, message: 'Truck has already completed its loading/unloading' });
        }

        // Save updated data
        saveTrucksData(trucksData);
        res.json({ success: true, truck });
    } else {
        res.status(404).json({ success: false, message: 'Truck not found' });
    }
});

// task to reset entry and leave timestamps/status after 24 hours
setInterval(() => {
    console.log("Checking for trucks to reset...");

    let trucksData = getTrucksData();
    const currentTime = new Date();

    trucksData.trucks.forEach(truck => {
        if (truck.status === "Completed" && truck.leave_timestamp) {
            const leaveTime = new Date(truck.leave_timestamp);
            const timeDifference = currentTime - leaveTime;

            // 24 hours 
            if (timeDifference >= 86400000) {
                truck.entry_timestamp = null;
                truck.leave_timestamp = null;
                truck.status = null;
            }
        }
    });

    // Save updated data back to trucks.json post resetting
    saveTrucksData(trucksData);
    console.log("Reset completed for trucks with completed status.");
}, 60000); 

app.listen(port, () => {
    console.log(`Backend is running on port ${port}`);
});
