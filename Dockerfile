# Use the official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /usr/src/app

# Copy manifest and lockfile
COPY package.json bun.lock ./

# Install dependencies exactly as in bun.lock
RUN bun install --frozen-lockfile

# Copy the rest of your app
COPY . .

# Expose your app port
EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"]
