# Privacy Policy

Base64 To File Extension is designed to run locally in the user's browser.

## Data Collection

This extension does not collect, transmit, sell, or share user data.

The extension does not send webpage content, selected text, base64 strings, downloaded files, browsing history, or any other user data to any external server.

## Local Processing

All base64 detection, file type detection, and file conversion happen locally in the browser.

When the user chooses the extension's right-click menu item, the extension may run a local helper on the active tab to inspect the focused input or textarea and determine whether the cursor is inside a double-quoted base64 string that matches supported downloadable file signatures. If it matches, the extension selects that string locally so the user can trigger the download action.

This local text-selection behavior is used only to support the extension's base64-to-file workflow.

## Permissions

- `contextMenus` is used to add the extension action to the browser's right-click menu.
- `downloads` is used to save the converted file to the user's device.
- `activeTab` is used to access the current tab only after the user invokes the extension.
- `scripting` is used to run packaged helper scripts locally on the active tab after the user's right-click action.

## Remote Code

This extension does not use remote code. All JavaScript files are packaged with the extension.

## Contact

For questions about this privacy policy, please open an issue in this repository.
