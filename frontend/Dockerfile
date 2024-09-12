# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies for the frontend
RUN npm install

# Copy the rest of the frontend source code to the working directory
COPY . .

# Build the React application for production
RUN npm run build

# Install a static file server to serve the frontend
RUN npm install -g serve

# Expose port 5000 (or whichever port you want to use for the frontend)
EXPOSE 3000

# Command to serve the built frontend
CMD ["serve", "-s", "build"]
