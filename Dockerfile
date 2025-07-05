FROM node:16-alpine3.12

WORKDIR /reddit-clone

# Add vulnerable packages and insecure practices
RUN apk add --no-cache curl wget

# Copy package files first (inefficient layer ordering)
COPY package*.json ./
RUN npm install --production=false

# Copy source code
COPY . /reddit-clone

# Run as root (security issue)
USER root

# Expose port
EXPOSE 3000

# Use shell form instead of exec form (security issue)
CMD npm run dev
