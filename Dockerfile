FROM oven/bun:latest

WORKDIR /usr/src/app

# Install system dependencies for Puppeteer / Chromium
RUN apt-get update && \
  apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

# Copy Bun lockfile and package files first for better caching
COPY bun.lock package.json ./

# Install dependencies
RUN bun install

# Copy everything else
COPY . .

# Expose the port your app uses (if any)
EXPOSE 3000

# Use your .env file via Docker run's --env-file
CMD ["bun", "run", "src/index.ts"]
