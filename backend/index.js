const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const trucksFilePath = './trucks.json';

function getTrucksData() {
    const trucksData = fs.readFileSync(trucksFilePath);
    return JSON.parse(trucksData);
}

function saveTrucksData(data) {
    fs.writeFileSync(trucksFilePath, JSON.stringify(data, null, 2));
}


app.get('/', (req,res) => {
    res.send("working ehe")
});


app.post('/api/trucks', (req, res) => {
    const { license_plate } = req.body;

    let trucksData = getTrucksData();

    const truck = trucksData.trucks.find(t => t.license_plate === license_plate);

    if (truck) {
        if (truck.entry_timestamp && !truck.leave_timestamp) {
            truck.leave_timestamp = new Date().toISOString();
            truck.status = "Completed";
        } else if (!truck.entry_timestamp) {
            truck.entry_timestamp = new Date().toISOString();
        } else {
            res.json({ success: false, message: "Truck has already completed its loading/unloading" });
            return;
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
