# Base64 To File Extension

## Overview
Base64 To File Extension is a Chrome extension that enables users to quickly convert selected base64 strings on any webpage into downloadable files. With a simple right-click, the extension automatically detects common file formats and assigns the correct file extension, streamlining the process of extracting files from base64 data.

## Features
- **Context Menu Integration:** Instantly convert selected base64 strings via the browser’s right-click menu.
- **Automatic Format Detection:** Recognizes common file types (PNG, JPEG, GIF, PDF, ZIP, TIFF, ICO) and applies the appropriate file extension.
- **Local and Secure:** All conversions and downloads are handled locally in your browser, ensuring privacy and security.
- **No Third-Party Uploads:** No need to copy, paste, or upload base64 data to external websites.

## Installation
1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the project folder.

## Usage
1. Select any base64 string on a webpage.
2. Right-click and choose **Base64 to File Download** from the context menu.
3. If nothing is selected, you can right-click directly inside a double-quoted base64 string in a page, input, or textarea. The extension will capture the full quoted value from the click position, including strings that are visually wrapped across multiple lines.
4. The extension will automatically detect the file type and download the file with the correct extension. If the type cannot be determined, the file will be named `download` without an extension.

## Permissions
- `contextMenus`: To add the custom right-click menu item.
- `downloads`: To save files directly to your device.

## Why Use This Extension?
- **Efficiency:** Save time by converting and downloading base64 data in one click.
- **Accuracy:** Automatic file type detection ensures correct file extensions.
- **Privacy:** All operations are performed locally, keeping your data secure.
- **Convenience:** No need for manual conversion or third-party tools.

## Supported Formats
- PNG
- JPEG
- GIF
- PDF
- ZIP
- TIFF
- ICO

## License
MIT

## Contact
For questions or feedback, please open an issue on GitHub or contact the maintainer.

## CI/CD
- **CI triggers:** GitHub Actions CI runs on every `pull_request` and every `push`.
- **CD trigger:** GitHub Actions CD runs on every push to `main`.
- **Artifact naming:** Packaged extension artifacts are named `base64-to-file-extension-v<manifest.version>.zip`.
- **GitHub Releases:** The CD workflow creates or updates a GitHub Release tagged `v<manifest.version>` and attaches the packaged extension zip.
- **Version source:** Release versioning is controlled only by `manifest.json` `version`.
- **Required secrets for Chrome Web Store publishing:**
  - `CHROME_EXTENSION_ID`
  - `CHROME_CLIENT_ID`
  - `CHROME_CLIENT_SECRET`
  - `CHROME_REFRESH_TOKEN`
- **Missing credentials behavior:** If those secrets are not configured yet, the CD workflow still packages and uploads the zip artifact, then skips the publish job and reports the missing secrets in the workflow summary.
- **Chrome Web Store setup:** Before automated publishing can work, you need to enable the Chrome Web Store API, create OAuth credentials, and generate a refresh token. See the Chrome Web Store API guide: https://developer.chrome.com/docs/webstore/using-api
