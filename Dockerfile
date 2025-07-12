FROM node:18-alpine

WORKDIR /app

# Copy backend package files first
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the backend code
COPY backend/ ./

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"] 