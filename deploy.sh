#!/bin/bash

# Script to automatically deploy the backend and frontend applications on EC2.

# Exit immediately if a command exits with a non-zero status.
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR" || exit 1
VENV_DIR="$SCRIPT_DIR/venv"
LOG_FILE="$SCRIPT_DIR/deploy.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Plated Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Pull changes from git repository
echo -e "${YELLOW}Pulling latest changes from git repository...${NC}"
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to pull from git repository. Exiting.${NC}"
    exit 1
fi
echo -e "${GREEN}Successfully pulled latest changes.${NC}"
echo ""

# Step 2: Set up Python virtual environment and install dependencies
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create virtual environment. Exiting.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Virtual environment created.${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists. Skipping creation.${NC}"
    # Activate the existing virtual environment
    source "$VENV_DIR/bin/activate"
fi  

# Step 3: Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install backend dependencies. Exiting.${NC}"
    exit 1
fi
echo -e "${GREEN}Backend dependencies installed.${NC}"
echo ""

# Step 4: Kill all backend Python processes and restart the backend server

# Find process IDs (PIDs) of scripts matching 'python ... app.py'
# - ps aux: Lists all running processes.
# - grep "[p]ython.*app\.py": Filters for lines containing 'python' and 'app.py'.
#   - The [p] prevents the grep command itself from appearing in the results.
#   - '.*' matches any characters between 'python' and 'app.py'.
#   - '\.' matches a literal dot.
# - awk '{print $2}': Extracts the second column, which is the PID.
PIDS=$(ps aux | grep "[p]ython.*app\.py" | awk '{print $2}')

# Check if any PIDS were found
if [ -z "$PIDS" ]; then
  echo -e "${YELLOW}No Python processes running 'app.py' were found.${NC}"
  exit 0
fi

echo -e "${YELLOW}Found the following PIDs running 'app.py':${NC}"
echo "$PIDS"

# Loop through all found PIDs and stop them
# Using kill -15 (SIGTERM) is a graceful shutdown request.
# The process is given a chance to clean up before exiting.
echo -e "${YELLOW}Stopping backend server processes...${NC}"
kill -15 $PIDS

# Start the backend server in the background
echo -e "${YELLOW}Starting backend server...${NC}"
nohup python3 app.py > backend.log 2>&1 &
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start backend server. Exiting.${NC}"
    exit 1
fi
echo -e "${GREEN}Backend server started successfully.${NC}"
echo ""

# Step 5: Start the frontend server using npm
echo -e "${YELLOW}Starting frontend server...${NC}"
cd ../frontend || exit 1
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install frontend dependencies. Exiting.${NC}"
    exit 1
fi
nohup npm run deploy > frontend.log 2>&1 &
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start frontend server. Exiting.${NC}"
    exit 1
fi
echo -e "${GREEN}Frontend server started successfully.${NC}"
echo ""

echo -e "${GREEN}Deployment completed successfully!${NC}"

