# Use official Node.js image
FROM node:20

# Create app directory
WORKDIR /app

# Copy only package.json and package-lock.json first
COPY package*.json ./

# Install dependencies INSIDE Docker
RUN npm install

# Copy the rest of your code
COPY . .

# Build the app
RUN npm run build

# Expose app port
EXPOSE 5000

# Start the app
CMD ["npm", "run", "start"]
