# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies for the backend
RUN npm install

# Copy the rest of the backend source code to the working directory
COPY . .

# Expose the backend application port (change if necessary)
EXPOSE 5001

# Command to run the backend application
CMD ["npm", "start"]
