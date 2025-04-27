FROM oven/bun:latest

WORKDIR /usr/src/app

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
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
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
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
    libu2f-udev \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 bun && \
    useradd --uid 1001 --gid bun --shell /bin/bash --create-home bun

COPY --chown=bun:bun bun.lock package.json ./
RUN bun install --frozen-lockfile

COPY --chown=bun:bun . .

USER bun

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
