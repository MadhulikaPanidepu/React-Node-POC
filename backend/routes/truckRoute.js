const express = require('express');
const router = express.Router();

// Assume these are your service functions
const { getTruckByLicensePlate, updateTruck, sendEmail, getAllTrucks } = require('../services/truckService');

/**
 * @swagger
 * components:
 *   schemas:
 *     Truck:
 *       type: object
 *       properties:
 *         license_plate:
 *           type: string
 *           description: The truck's license plate number
 *         driver_name:
 *           type: string
 *           description: The driver's name
 *         driver_license:
 *           type: string
 *           description: The driver's license number
 *         entry_timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the truck entered the warehouse
 *         leave_timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the truck left the warehouse
 *         status:
 *           type: string
 *           description: The current status of the truck (Pending, Completed)
 *         loading_unloading:
 *           type: string
 *           description: Whether the truck is loading or unloading
 */

/**
 * @swagger
 * /api/trucks:
 *   get:
 *     summary: Retrieve a list of all trucks
 *     description: Retrieve all trucks currently stored in the warehouse database, including their status, entry/leave timestamps, and other details.
 *     responses:
 *       200:
 *         description: A list of trucks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Truck'
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create or update truck data
 *     description: Create a new truck entry or update its entry/exit times based on the license plate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               license_plate:
 *                 type: string
 *                 description: The truck's license plate number
 *     responses:
 *       200:
 *         description: Success, truck details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Truck'
 *       404:
 *         description: Truck not found
 *       500:
 *         description: Internal server error
 */


router.get('/api/trucks', async (req, res) => {
  if (!getAllTrucks) {
    return res.status(500).json({ message: 'Database not connected yet' });
  }

  try {
    const trucks = await getAllTrucks();  // Fetch all truck data
    res.json(trucks);
  } catch (error) {
    console.error('Error fetching truck data', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.post('/api/trucks', async (req, res) => {
  const { license_plate } = req.body;

  try {
    const truck = await getTruckByLicensePlate(license_plate);
    if (truck) {
      let updateData = {};
      if (!truck.entry_timestamp) {
        updateData = {
          entry_timestamp: new Date().toISOString(),
          status: 'Pending',
        };
        const emailMessage = `Welcome to the warehouse, ${truck.driver_name}! Your entry has been recorded.`;
        await sendEmail(truck.email, 'Warehouse Entry Confirmation', emailMessage);
      } else if (truck.entry_timestamp && !truck.leave_timestamp) {
        updateData = {
          leave_timestamp: new Date().toISOString(),
          status: 'Completed',
        };
        const goodbyeEmailMessage = `Goodbye from the warehouse, ${truck.driver_name}! Contact us if you need additional details.`;
        await sendEmail(truck.email, 'Warehouse Exit Confirmation', goodbyeEmailMessage);
      } else {
        return res.json({ success: false, message: 'Truck has already completed its loading/unloading' });
      }
      await updateTruck(license_plate, updateData);
      res.json({ success: true, truck: { ...truck, ...updateData } });
    } else {
      res.status(404).json({ success: false, message: 'Truck not found' });
    }
  } catch (error) {
    console.error('Error processing truck data', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});

module.exports = router;
