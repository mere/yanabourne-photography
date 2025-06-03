FROM node:20

WORKDIR /workspaces/yanabourne-photography

# Expose port 3000
EXPOSE 3000

# Set environment variables for Next.js
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Start the development server
CMD ["npm", "run", "dev"] 

# Set proper permissions
# RUN chown -R node:node /workspaces/yanabourne-photography