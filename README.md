# Popkid WhatsApp Session Generator

This tool helps generate a WhatsApp session ID using a QR code login system with Baileys.

## Features

- Prints QR code in terminal for login
- Saves session as JSON
- Generates secure downloadable session link (e.g., `popkid~scl/fi/...`)
- Runs a local HTTP server to download sessions

## How to Use

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Run the bot:
   ```bash
   npm start
   ```

3. Scan the QR code using WhatsApp > Linked Devices.

4. After linking, a custom session download link will be shown:
   ```
   popkid~scl/fi/popkid-xxxxxxxxxxxx.json?rlkey=xxxxxxxx&dl=0
   ```

5. Open it in your browser at:
   ```
   http://localhost:8080/...
   ```

## Author

Popkid Md
