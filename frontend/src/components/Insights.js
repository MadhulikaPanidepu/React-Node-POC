import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import axios from 'axios';

// Define colors for Pending, Completed, and Other trucks (swapped Pending and Total)
const COLORS = ['#FFBB28', '#00C49F', '#0088FE']; // Yellow, Green, Blue

function Insights() {
  const [truckData, setTruckData] = useState({
    pending: 0,
    completed: 0,
    other: 0
  });
  const [totalTrucks, setTotalTrucks] = useState(0);
  const [transactions, setTransactions] = useState([]); // Holds the list of transactions
  const [error, setError] = useState(null);

  // Define the time window for recent transactions (e.g., last 24 hours)
  const RECENT_TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Fetch the truck data from the API
  useEffect(() => {
    const fetchTruckData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/trucks');
        const trucks = response.data;
        const currentTime = new Date();

        // Process data based on status
        const total = trucks.length;
        const pending = trucks.filter(truck => truck.status?.toLowerCase() === 'pending').length;
        const completed = trucks.filter(truck => truck.status?.toLowerCase() === 'completed').length;
        const other = total - (pending + completed); // Other trucks (status not 'pending' or 'completed')

        // Filter recent transactions (entry or leave happened within the last 24 hours)
        const recentTransactions = trucks.filter(truck => {
          const entryTime = new Date(truck.entry_timestamp).getTime();
          const leaveTime = new Date(truck.leave_timestamp).getTime();

          // Check if either entry or leave time is within the recent time window
          return (
            (truck.entry_timestamp && currentTime - entryTime <= RECENT_TIME_WINDOW) ||
            (truck.leave_timestamp && currentTime - leaveTime <= RECENT_TIME_WINDOW)
          );
        });

        // Update the state with the processed data
        setTruckData({ pending, completed, other });
        setTotalTrucks(total);
        setTransactions(recentTransactions); // Save only recent transactions
        setError(null); // Clear error state if successful
      } catch (error) {
        console.error('Error fetching truck data:', error);
        setError('Error fetching truck data. Please try again later.');
      }
    };

    fetchTruckData();
  }, []);

  // Data array for the PieChart (Pending, Completed, and Other Trucks)
  const data = [
    { name: 'Pending', value: truckData.pending },
    { name: 'Completed', value: truckData.completed },
    { name: 'Other', value: truckData.other } // Trucks without status or in unknown state
  ];

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Insights of IOB</h2>

      {/* Display Total Trucks, Pending Trucks, and Completed Trucks in separate layouts */}
      <div className="flex justify-center space-x-6 mb-6">
        {/* Total Trucks Layout (now Blue) */}
        <div className="text-center">
          <h3 className="text-xl font-semibold">Total Trucks</h3>
          <div className="bg-blue-500 text-white font-bold text-4xl py-4 rounded-lg shadow-lg w-32 mx-auto">
            {totalTrucks}
          </div>
        </div>

        {/* Pending Trucks Layout (now Yellow) */}
        <div className="text-center">
          <h3 className="text-xl font-semibold">Pending Trucks</h3>
          <div className="bg-yellow-500 text-white font-bold text-4xl py-4 rounded-lg shadow-lg w-32 mx-auto">
            {truckData.pending}
          </div>
        </div>

        {/* Completed Trucks Layout */}
        <div className="text-center">
          <h3 className="text-xl font-semibold">Completed Trucks</h3>
          <div className="bg-green-500 text-white font-bold text-4xl py-4 rounded-lg shadow-lg w-32 mx-auto">
            {truckData.completed}
          </div>
        </div>
      </div>

      {/* Conditionally render an error message if there's an issue */}
      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}

      {/* Conditionally render the PieChart only if data is available */}
      {!error && totalTrucks > 0 ? (
        <PieChart width={600} height={600} className="mx-auto">
          <Pie
            data={data}
            cx={300}
            cy={300}
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      ) : (
        <div className="text-gray-500 text-center">No truck data available</div>
      )}

      {/* Transactions Table */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Recent Transactions (Last 24 hours)</h3>
        <table className="table-auto w-full bg-white shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">License Plate</th>
              <th className="px-4 py-2">Driver Name</th>
              <th className="px-4 py-2">Entry Timestamp</th>
              <th className="px-4 py-2">Leave Timestamp</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((truck) => (
              <tr key={truck.license_plate}>
                <td className="border px-4 py-2">{truck.license_plate}</td>
                <td className="border px-4 py-2">{truck.driver_name}</td>
                <td className="border px-4 py-2">{truck.entry_timestamp || 'N/A'}</td>
                <td className="border px-4 py-2">{truck.leave_timestamp || 'N/A'}</td>
                <td className="border px-4 py-2">{truck.status || 'Unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Insights;
