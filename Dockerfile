FROM node:20-alpine
WORKDIR /app

# Install dependencies first for fast caching
COPY package*.json ./
RUN npm install

# Copy Prisma setup and generate definitions
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source
COPY . .

# Expose server port
EXPOSE 3000

# Run using your development configuration
CMD ["npm", "run dev"]
