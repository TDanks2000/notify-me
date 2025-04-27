# Use the Node.js base image
FROM node:18

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
COPY bun.lock ./
RUN bun install

# Copy the rest of the application files
COPY . .

# Expose the application port (if needed)
EXPOSE 3000

# Run the app
CMD ["bun", "start"]
