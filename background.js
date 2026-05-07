chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "base64-to-file",
    title: "Base64 to File Download",
    contexts: ["selection"]
  });
});

function base64ToBlob(base64) {
  const match = base64.match(/^data:([\w\-]+\/\w+);base64,(.*)$/);
  let mime = "application/octet-stream";
  let b64 = base64;
  if (match) {
    mime = match[1];
    b64 = match[2];
  }
  const byteCharacters = atob(b64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

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

function detectMimeFromBase64(b64) {
  // 取前幾個字元判斷常見格式
  if (b64.startsWith("iVBORw0KGgo")) return "image/png";
  if (b64.startsWith("/9j/")) return "image/jpeg";
  if (b64.startsWith("R0lGOD")) return "image/gif";
  if (b64.startsWith("JVBER")) return "application/pdf";
  if (b64.startsWith("UEsDB")) return "application/zip";
  if (b64.startsWith("UklGR")) return "image/tiff";
  if (b64.startsWith("AAABAAE")) return "image/x-icon";
  return "application/octet-stream";
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "base64-to-file" && info.selectionText) {
    let base64 = info.selectionText.trim();
    base64 = base64?.replaceAll("\\n","")?.replaceAll("\n","");
    const match = base64.match(/^data:([\w\-]+\/\w+);base64,(.*)$/);
    let mime = "application/octet-stream";
    let b64 = base64;
    if (match) {
      mime = match[1];
      b64 = match[2];
    } else {
      mime = detectMimeFromBase64(base64);
    }
    const dataUrl = `data:${mime};base64,${b64}`;
    const ext = getExtension(mime);
    const filename = ext ? `download.${ext}` : "download";
    chrome.downloads.download({
      url: dataUrl,
      filename,
      saveAs: true
    }).catch(x => {      console.error("Download failed:", x);
    });
  }
});
