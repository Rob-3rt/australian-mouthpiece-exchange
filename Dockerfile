FROM node:18-alpine

WORKDIR /app

# Copy backend package files first
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy the rest of the backend code (including prisma schema)
COPY backend/ ./

# Generate Prisma client (now that schema is available)
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"] 