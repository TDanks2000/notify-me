FROM oven/bun:latest

# Puppeteer skips downloading Chromium — we'll provide our own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app

# Install system dependencies for headless Chrome
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
    libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install Google Chrome Stable
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/google.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/google.gpg arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy your app
COPY . .

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Expose your app port
EXPOSE 3000

# Run your app with env file
CMD ["bun", "run", "src/index.ts"]
