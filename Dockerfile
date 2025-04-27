# 1. Use the latest Node.js image (v23)
FROM node:23

# 2. Enable Corepack (bundled with Node 18+) so `yarn` is available
RUN corepack enable

# 3. Set working directory
WORKDIR /usr/src/app

# 4. Copy only the lockfile and manifest for install
COPY package.json yarn.lock ./

# 5. Install prod dependencies only & honor the lockfile
RUN yarn install --frozen-lockfile --production

# 6. Copy the rest of your source code
COPY . .

# 7. Expose the application port
EXPOSE 3000

# 8. Default command
CMD ["yarn", "start"]
