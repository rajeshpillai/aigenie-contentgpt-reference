// Attach to input event of any open website with inputs where the plugin is enabled
document.addEventListener("input", (event) => {
  const target = event.target;
  var userInput = target.innerText || target.value;

  if (isEndsWithPlusSign(userInput)) {
    const prompt = userInput.slice(0, -3).trim(); // "Hello world+++" => "Hello world"
    sendTriggerMessage(prompt);
  }

  //console.log(userInput);
});

// Listening incoming messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "inject_ai") {
    insert(request.content);
  }
});

const isEndsWithPlusSign = (str) => {
  return str.trim().endsWith("+++");
};

const sendTriggerMessage = (text) => {
  //console.log(`Generating AI content for "${text}"`);
  insert(`Generating AI content for “${text}”`);
  // Send text to the background script 
  chrome.runtime.sendMessage({ 
    message: "generate_ai",
    content: text 
  });
};

// Update the target website input with the generated content
const insert = (content) => {
  var element = document.activeElement;

  if (element.nodeName === "TEXTAREA" || element.nodeName === "INPUT") {
    element.value = content;
  } else {
    element.innerText = content;
  }

  return true;
};