import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar, Nav, Modal, Button } from 'react-bootstrap';  
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tailwindcss/tailwind.css';  
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faEnvelope, faPhone, faWarehouse, faTruckLoading, faUser } from '@fortawesome/free-solid-svg-icons'; 
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import Insights from './components/Insights';
import americoldLogo from './assets/americold_logo.jpeg';


function App() {
  const [licensePlate, setLicensePlate] = useState('');
  const [truckDetails, setTruckDetails] = useState(null);
  const [error, setError] = useState('');
  const [showEntryModal, setShowEntryModal] = useState(false);  
  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false); 
  const [driverName, setDriverName] = useState('');
  const [activeTab, setActiveTab] = useState('home'); 
  const [totalTrucks, setTotalTrucks] = useState(0);  

  useEffect(() => {
      const fetchTruckCount = async () => {
        try {
          const response = await axios.get('http://localhost:5001/api/trucks');
          setTotalTrucks(response.data.length); 
        } catch (err) {
          console.error('Error fetching truck data', err);
        }
      };

      fetchTruckCount();
  }, []);

  const fetchTruckDetails = async () => {
      try {
        const response = await axios.post('http://localhost:5001/api/trucks', {
          license_plate: licensePlate,
        });
    
        if (response.data.success) {
          setTruckDetails(response.data.truck);
          setDriverName(response.data.truck.driver_name);
          setError('');

          if (!response.data.truck.leave_timestamp) {
            setShowEntryModal(true);
          } else if (response.data.truck.leave_timestamp) {
            setShowGoodbyeModal(true);
          }
        }

      } catch (err) {
        setError('Truck not found or an error occurred');
        setTruckDetails(null);
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar bg="light" expand="lg" className="shadow-sm py-6">
        <div className="container flex items-center justify-between">
          <Navbar.Brand href="#" className="font-bold text-3xl sm:text-5xl text-blue-600 flex items-center">
          <img src={americoldLogo} alt="Americold Logo" className="mr-2" style={{ height: '60px', width: '130px' }} /> 
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto flex space-x-4 sm:space-x-6">
              <Nav.Link
                href="#home"
                className={`text-blue-500 hover:text-blue-700 text-lg sm:text-xl ${activeTab === 'home' ? 'font-bold' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                Home
              </Nav.Link>
              <Nav.Link
                href="#ongoing"
                className={`text-blue-500 hover:text-blue-700 text-lg sm:text-lg ${activeTab === 'ongoing' ? 'font-bold' : ''}`}
                onClick={() => setActiveTab('ongoing')}
              >
                Ongoing
              </Nav.Link>
              <Nav.Link
                href="#insights"
                className={`text-blue-500 hover:text-blue-700 text-lg sm:text-lg ${activeTab === 'insights' ? 'font-bold' : ''}`}
                onClick={() => setActiveTab('insights')}
              >
                Insights of IOB
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
      
      <div className="flex-grow container mx-auto flex flex-col justify-center items-center p-4 sm:p-6">
        
        {activeTab === 'ongoing' && (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 w-full max-w-2xl">
              <input
                type="text"
                placeholder="Enter License Plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="border rounded-lg p-4 w-full sm:max-w-xs shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 text-lg w-full sm:w-auto"
                onClick={fetchTruckDetails}
              >
                Fetch Truck Details
              </button>
            </div>

            {error && <p className="text-red-500 text-center text-xl">{error}</p>}
            
            {truckDetails && (
              <div className="bg-gray-50 p-4 sm:p-8 rounded-lg shadow-lg mt-4 w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Truck Details</h2>
                <p className="text-lg"><strong>License Plate:</strong> {truckDetails.license_plate}</p>
                <p className="text-lg"><strong>Driver Name:</strong> {truckDetails.driver_name}</p>
                <p className="text-lg"><strong>Driver License:</strong> {truckDetails.driver_license}</p>
                <p className="text-lg"><strong>Entry Timestamp:</strong> {truckDetails.entry_timestamp}</p>
                <p className="text-lg"><strong>Leaving Timestamp:</strong> {truckDetails.leave_timestamp ? truckDetails.leave_timestamp : 'N/A'}</p>
                <p className="text-lg">
                  <strong>Status:</strong> 
                  <span className={truckDetails.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}>
                    {truckDetails.status}
                  </span>
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'home' && (
          <div className="p-8 sm:p-8  max-w-4xl text-gray-700">
            <article className="prose prose-lg">
              <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-blue-700">
                <FontAwesomeIcon icon={faWarehouse} className="mr-2" /> Welcome to Warehouse Management System
              </h1>
              <p className="mb-6">
                <FontAwesomeIcon icon={faTruckLoading} className="mr-2" /> This application helps warehouse owners manage and track all transactions related to inbound and outbound trucks.
                You can monitor the entry and exit times of trucks, track how long it takes to complete tasks, and ensure that all
                processes run smoothly. This system allows warehouse management to keep a record of all activities efficiently.
              </p>
              <p className="mb-6">
                <FontAwesomeIcon icon={faTruck} className="mr-2" /> The warehouse is currently handling <strong>{totalTrucks}</strong> trucks in total. Our system ensures a smooth workflow and keeps track of all the data related to truck operations.
              </p>
              <p className="mb-6">
                <FontAwesomeIcon icon={faUser} className="mr-2" /> The IOB Truck Management System is maintained by the warehouse owner, John Doe, and is designed to optimize operational efficiency.
              </p>
              <p className="mt-8">
                For any queries, feel free to reach us at:
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Email: support@iob.com <br />
                <FontAwesomeIcon icon={faPhone} className="mr-2" /> Phone: +1 234 567 8900
              </p>
            </article>
          </div>
        )}

        {activeTab === 'insights' && <Insights/>}
      </div>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm">
            © 2024 IOB Truck Management. All Rights Reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="mailto:support@iob.com" className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-white" />
              <span>Contact Us</span>
            </a>
            <a href="tel:+1234567890" className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faPhone} className="text-white" />
              <span>+1 234 567 890</span>
            </a>
          </div>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faFacebook} className="text-white text-lg" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faTwitter} className="text-white text-lg" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} className="text-white text-lg" />
            </a>
          </div>
        </div>
      </footer>

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
