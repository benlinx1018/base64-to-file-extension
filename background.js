importScripts("shared.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "base64-to-file",
    title: "Base64 to File Download",
    contexts: ["selection", "editable", "page"]
  });
});

function getExtension(mime) {
  const map = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/zip": "zip",
    "image/tiff": "tiff",
    "image/x-icon": "ico"
  };
  return map[mime] || "";
}

function shouldPreferQuotedCandidate(selectionText, quotedCandidate) {
  const normalizedSelection = normalizeBase64Value(selectionText);
  const normalizedQuoted = normalizeBase64Value(quotedCandidate);

  if (!normalizedQuoted) {
    return false;
  }

  if (!normalizedSelection) {
    return true;
  }

  if (normalizedSelection === normalizedQuoted) {
    return false;
  }

  if (normalizedQuoted.includes(normalizedSelection)) {
    return normalizedQuoted.length > normalizedSelection.length;
  }

  return false;
}
async function getBase64FromPage(tabId) {
  if (!tabId) {
    return null;
  }

  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: "GET_LAST_QUOTED_BASE64"
    });
    return response?.value || null;
  } catch (error) {
    console.error("Failed to read quoted base64 from content script:", error);
    return null;
  }
}

async function handleDownload(info, tab) {
  const quotedCandidate = await getBase64FromPage(tab?.id);
  let base64 = info.selectionText || "";

  if (shouldPreferQuotedCandidate(base64, quotedCandidate)) {
    base64 = quotedCandidate;
  } else if (!base64) {
    base64 = quotedCandidate;
  }

  if (!base64) {
    console.error("No selected text or quoted base64 string found at the cursor.");
    return;
  }

  const payload = parseBase64Payload(base64);
  if (!payload) {
    console.error("The detected value is empty after normalization.");
    return;
  }

  if (!isValidBase64(payload.b64)) {
    console.error("Invalid base64 payload.");
    return;
  }

  const dataUrl = `data:${payload.mime};base64,${payload.b64}`;
  const ext = getExtension(payload.mime);
  const filename = ext ? `download.${ext}` : "download";

  try {
    await chrome.downloads.download({
      url: dataUrl,
      filename,
      saveAs: true
    });
  } catch (error) {
    console.error("Download failed:", error);
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "base64-to-file") {
    return;
  }

  handleDownload(info, tab);
});
