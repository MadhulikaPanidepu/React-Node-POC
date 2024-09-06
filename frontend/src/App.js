import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';  
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [licensePlate, setLicensePlate] = useState('');
  const [truckDetails, setTruckDetails] = useState(null);
  const [error, setError] = useState('');
  const [showEntryModal, setShowEntryModal] = useState(false);  // Modal state for entry
  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false); // Modal state for goodbye
  const [driverName, setDriverName] = useState('');

  const fetchTruckDetails = async () => {
    try {
      // Fetch truck details from the backend
      const response = await axios.post('http://localhost:5001/api/trucks', {
        license_plate: licensePlate,
      });
  
      if (response.data.success) {
        setTruckDetails(response.data.truck);
        setDriverName(response.data.truck.driver_name);  // Set driver name for pop-up
        setError('');

        if (!response.data.truck.leave_timestamp) {
          // Show entry modal if the truck just entered
          setShowEntryModal(true);
        } else if (response.data.truck.leave_timestamp) {
          // Show goodbye modal if the truck is leaving
          setShowGoodbyeModal(true);
        }
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
          <p>Leaving Timestamp: {truckDetails.leave_timestamp ? truckDetails.leave_timestamp : 'N/A'}</p>
          <p>Status: {truckDetails.status}</p>
        </div>
      )}

      {/* Bootstrap Modal for welcome message */}
      <Modal show={showEntryModal} onHide={() => setShowEntryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Welcome to the Warehouse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Welcome to the warehouse, {driverName}! Check your email for further details.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEntryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bootstrap Modal for goodbye message */}
      <Modal show={showGoodbyeModal} onHide={() => setShowGoodbyeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Goodbye from the Warehouse</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Goodbye, {driverName}! Good job!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGoodbyeModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
