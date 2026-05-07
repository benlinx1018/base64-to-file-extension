function detectMimeFromBase64(b64) {
  if (b64.startsWith("iVBORw0KGgo")) return "image/png";
  if (b64.startsWith("/9j/")) return "image/jpeg";
  if (b64.startsWith("R0lGOD")) return "image/gif";
  if (b64.startsWith("JVBER")) return "application/pdf";
  if (b64.startsWith("UEsDB")) return "application/zip";
  if (b64.startsWith("UklGR")) return "image/tiff";
  if (b64.startsWith("AAABAAE")) return "image/x-icon";
  return "application/octet-stream";
}

function normalizeBase64Value(value) {
  const normalized = value?.trim()?.replaceAll("\\n", "")?.replaceAll("\n", "") || "";
  if (normalized.startsWith("\"") && normalized.endsWith("\"")) {
    return normalized.slice(1, -1);
  }
  return normalized;
}

function parseBase64Payload(rawValue) {
  const base64 = normalizeBase64Value(rawValue);
  if (!base64) {
    return null;
  }

  const match = base64.match(/^data:([\w.+-]+\/[\w.+-]+);base64,(.*)$/);
  let mime = "application/octet-stream";
  let b64 = base64;

  if (match) {
    mime = match[1];
    b64 = match[2];
  } else {
    mime = detectMimeFromBase64(base64);
  }

  return { mime, b64 };
}

function isValidBase64(value) {
  try {
    atob(value);
    return true;
  } catch {
    return false;
  }
}

function isLikelyDownloadableBase64(value) {
  const payload = parseBase64Payload(value);
  if (!payload || payload.mime === "application/octet-stream") {
    return false;
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(payload.b64) || payload.b64.length < 16) {
    return false;
  }

  return isValidBase64(payload.b64);
}
