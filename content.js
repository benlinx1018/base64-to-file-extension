let lastQuotedBase64 = null;

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

function getSearchRoot(node) {
  let current = node?.nodeType === Node.TEXT_NODE ? node.parentNode : node;

  while (current && current !== document.body) {
    if (current.matches?.("pre, code, samp, kbd, blockquote")) {
      return current;
    }
    current = current.parentNode;
  }

  return document.body;
}

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode);
    currentNode = walker.nextNode();
  }

  return textNodes;
}

function getFirstTextNode(node) {
  if (!node) {
    return null;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return node;
  }

  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  return walker.nextNode();
}

function getLastTextNode(node) {
  if (!node) {
    return null;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return node;
  }

  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let lastNode = null;
  let currentNode = walker.nextNode();

  while (currentNode) {
    lastNode = currentNode;
    currentNode = walker.nextNode();
  }

  return lastNode;
}

function resolveTextPosition(node, offset) {
  if (!node) {
    return null;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return {
      node,
      offset: Math.min(offset, node.textContent?.length || 0)
    };
  }

  const beforeChild = offset > 0 ? node.childNodes[offset - 1] : null;
  const afterChild = node.childNodes[offset] || null;
  const fromBefore = getLastTextNode(beforeChild);
  if (fromBefore) {
    return {
      node: fromBefore,
      offset: fromBefore.textContent?.length || 0
    };
  }

  const fromAfter = getFirstTextNode(afterChild || node);
  if (fromAfter) {
    return {
      node: fromAfter,
      offset: 0
    };
  }

  return null;
}

function getQuotedDataFromRoot(root, targetNode, targetOffset) {
  const textNodes = collectTextNodes(root);
  if (textNodes.length === 0) {
    return null;
  }

  let fullText = "";
  let caretIndex = null;

  for (const textNode of textNodes) {
    if (textNode === targetNode) {
      caretIndex = fullText.length + targetOffset;
    }

    fullText += textNode.textContent || "";
  }

  if (caretIndex === null) {
    return null;
  }

  const bounds = findQuotedBounds(fullText, caretIndex);
  if (!bounds) {
    return null;
  }

  if (!isLikelyDownloadableBase64(bounds.value)) {
    return null;
  }

  let runningLength = 0;
  let startPosition = null;
  let endPosition = null;

  for (const textNode of textNodes) {
    const nodeText = textNode.textContent || "";
    const nextLength = runningLength + nodeText.length;

    if (
      !startPosition &&
      bounds.valueStart >= runningLength &&
      bounds.valueStart <= nextLength
    ) {
      startPosition = {
        node: textNode,
        offset: bounds.valueStart - runningLength
      };
    }

    if (
      !endPosition &&
      bounds.valueEnd >= runningLength &&
      bounds.valueEnd <= nextLength
    ) {
      endPosition = {
        node: textNode,
        offset: bounds.valueEnd - runningLength
      };
    }

    runningLength = nextLength;
  }

  if (!startPosition || !endPosition) {
    return null;
  }

  return {
    value: bounds.value,
    startPosition,
    endPosition
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

function selectQuotedTextAtPoint(event) {
  let pointNode = null;
  let pointOffset = 0;

  if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(event.clientX, event.clientY);
    if (position?.offsetNode) {
      pointNode = position.offsetNode;
      pointOffset = position.offset;
    }
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (range?.startContainer) {
      pointNode = range.startContainer;
      pointOffset = range.startOffset;
    }
  }

  if (!pointNode) {
    pointNode = event.target;
    pointOffset = 0;
  }

  const resolvedPosition = resolveTextPosition(pointNode, pointOffset);
  if (!resolvedPosition) {
    return null;
  }

  const root = getSearchRoot(resolvedPosition.node);
  const quotedData = getQuotedDataFromRoot(
    root,
    resolvedPosition.node,
    resolvedPosition.offset
  );

  if (!quotedData) {
    return null;
  }

  const selection = window.getSelection();
  const range = document.createRange();
  range.setStart(quotedData.startPosition.node, quotedData.startPosition.offset);
  range.setEnd(quotedData.endPosition.node, quotedData.endPosition.offset);
  selection.removeAllRanges();
  selection.addRange(range);
  return quotedData.value;
}

document.addEventListener(
  "contextmenu",
  (event) => {
    lastQuotedBase64 = selectQuotedTextInEditable() || selectQuotedTextAtPoint(event);
  },
  true
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "GET_LAST_QUOTED_BASE64") {
    return;
  }

  sendResponse({ value: lastQuotedBase64 });
});
