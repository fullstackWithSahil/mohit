# Use the official Python image as a base
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
RUN pip install facebook-business google-api-python-client Flask praw flask-cors

# Copy the script and requirements to the container
COPY . .

EXPOSE 5000


# Define the command to run the script
CMD ["python", "server.py"]
