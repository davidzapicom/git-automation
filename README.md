# <img src="./git.png" alt="Git Logo" width="100"/>

# Git Automation

This project automates Git tasks (staging, committing, and pushing) across multiple repositories and sends a summary of the logs through mail.

---

## Features

- Automates Git tasks for multiple repositories.
- Logs the status of each repository in a log file.
- Sends the log summary via email using Nodemailer.
- Ensures the script runs periodically using `crontab`.
- Uses `pm2` to ensure the script restarts after system shutdowns or restarts.

---

## Prerequisites

1. **Node.js**:
   - Install Node.js.
   - Recommendation: Use [nvm](https://github.com/nvm-sh/nvm) for managing Node.js versions.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/davidzapicom/git-automation.git
cd git-automation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (e.g. -> .env.example):

- **`EMAIL_HOST`**: The SMTP host for sending emails (e.g., smtp.example.com).
- **`EMAIL_PORT`**: The SMTP port (e.g., 587 for TLS or 465 for SSL).
- **`EMAIL_USER`**: The username or email address for authentication.
- **`EMAIL_PASS`**: The password for authentication.
- **`EMAIL_RECIPIENT`**: The recipient email address for notifications.
- **`LOG_FILE_PATH`**: The file path where logs should be saved.

### 4. Add Your Repositories

Add your repositories to the `repos.json` file in the following format (e.g. -> repos.example.json):

```json
[
  {
    "name": "Repo 1",
    "path": "/absolute/path/to/repo1"
  },
  {
    "name": "Repo 2",
    "path": "/absolute/path/to/repo2"
  }
]
```

### 5. Test the Script

Run the script manually to ensure it works as expected:

```bash
node index.js
```

---

## Automating Execution

### Set Up Crontab

1. Open the crontab file for editing:

   ```bash
   crontab -e
   ```

2. Add the following line to schedule the script to run every day at 23:45h:

   ```bash
   45 23 * * * /Users/david/.nvm/versions/node/v22.11.0/bin/node /Users/david/Documents/code/git-cron/index.js
   ```

   - **`45 23 * * *`**: Cron schedule for 11:45 PM daily.
   - Replace `/Users/david/.nvm/versions/node/v22.11.0/bin/node` with the path to your Node.js binary.
   - Replace `/Users/david/Documents/code/git-cron/index.js` with the absolute path to your script.

3. Save and exit the crontab editor.

---

### Use PM2 for Persistent Execution

`pm2` ensures that the script remains active even after system shutdowns or restarts.

#### Install PM2 Globally

```bash
npm install -g pm2
```

#### Start the Script with PM2

```bash
pm2 start /Users/david/Documents/code/git-cron/index.js --name git-automation
```

- **`--name git-automation`**: Assigns a name to the process for easier management.

#### Save PM2 Processes

To ensure the process restarts after a reboot:

```bash
pm2 save
pm2 startup
```

Follow the instructions displayed in the terminal to complete the setup.

#### Manage PM2 Processes

- View all processes:

  ```bash
  pm2 list
  ```

- Restart the script:

  ```bash
  pm2 restart git-automation
  ```

- Stop the script:

  ```bash
  pm2 stop git-automation
  ```

- Delete the process:
  ```bash
  pm2 delete git-automation
  ```

---

## Debugging

### View Logs

1. View the `info.log` file to see the status of Git tasks:

   ```bash
   cat ./info.log
   ```

2. If using PM2, view live logs:
   ```bash
   pm2 logs git-automation
   ```

---

🚀 Happy Coding 🛰️
