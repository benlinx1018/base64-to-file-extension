function isEscapedQuote(text, quoteIndex) {
  let backslashCount = 0;
  let currentIndex = quoteIndex - 1;

  while (currentIndex >= 0 && text[currentIndex] === "\\") {
    backslashCount += 1;
    currentIndex -= 1;
  }

  return backslashCount % 2 === 1;
}

function findQuotedBounds(text, caretIndex) {
  if (typeof text !== "string" || typeof caretIndex !== "number") {
    return null;
  }

  let leftQuote = -1;
  for (let index = caretIndex - 1; index >= 0; index -= 1) {
    if (text[index] === "\"" && !isEscapedQuote(text, index)) {
      leftQuote = index;
      break;
    }
  }

  let rightQuote = -1;
  for (let index = caretIndex; index < text.length; index += 1) {
    if (text[index] === "\"" && !isEscapedQuote(text, index)) {
      rightQuote = index;
      break;
    }
  }

  if (leftQuote === -1 || rightQuote === -1 || leftQuote >= rightQuote) {
    return null;
  }

  return {
    start: leftQuote,
    end: rightQuote + 1,
    valueStart: leftQuote + 1,
    valueEnd: rightQuote,
    value: text.slice(leftQuote + 1, rightQuote)
  };
}

function selectQuotedTextInEditable() {
  const activeElement = document.activeElement;
  if (
    !activeElement ||
    !(
      activeElement.tagName === "TEXTAREA" ||
      (activeElement.tagName === "INPUT" &&
        typeof activeElement.selectionStart === "number" &&
        typeof activeElement.selectionEnd === "number")
    )
  ) {
    return null;
  }

  if (activeElement.selectionStart !== activeElement.selectionEnd) {
    return null;
  }

  const bounds = findQuotedBounds(activeElement.value, activeElement.selectionStart);
  if (!bounds) {
    return null;
  }

  if (!isLikelyDownloadableBase64(bounds.value)) {
    return null;
  }

  activeElement.focus();
  activeElement.setSelectionRange(bounds.valueStart, bounds.valueEnd);
  return bounds.value;
}

window.selectQuotedBase64FromFocusedEditable = function () {
  return selectQuotedTextInEditable();
};
