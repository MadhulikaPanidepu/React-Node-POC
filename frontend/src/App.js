import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [licensePlate, setLicensePlate] = useState('');
  const [truckDetails, setTruckDetails] = useState(null);
  const [error, setError] = useState('');

  const fetchTruckDetails = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/trucks', {
        license_plate: licensePlate,
      });

      if (response.data.success) {
        setTruckDetails(response.data.truck);
        setError('');
      }
    } catch (err) {
      setError('Truck not found or an error occurred');
      setTruckDetails(null);
    }
  };

  return (
    <div>
      <h1>IOB</h1>
      <input
        type="text"
        placeholder="Enter License Plate"
        value={licensePlate}
        onChange={(e) => setLicensePlate(e.target.value)}
      />
      <button onClick={fetchTruckDetails}>Fetch Truck Details</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {truckDetails && (
        <div>
          <h2>Truck Details</h2>
          <p>License Plate: {truckDetails.license_plate}</p>
          <p>Driver Name: {truckDetails.driver_name}</p>
          <p>Driver License: {truckDetails.driver_license}</p>
          <p>Entry Timestamp: {truckDetails.entry_timestamp}</p>
          <p>Leaving Timestamp: {truckDetails.leave_timestamp}</p>
          <p>Status: {truckDetails.status}</p>
        </div>
      )}
    </div>
  );
}

export default App;
