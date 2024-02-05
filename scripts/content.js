// ---------------------
// 1. Utility Functions
// ---------------------

const isEndsWithPlusSign = (str) => {
  return str.trim().endsWith("+++");
};

const sendTriggerMessage = (text) => {
  //console.log(`Generating AI content for "${text}"`);
  insert(`~Generating AI content for “${text}”~`);
  // Send text to the background script 
  chrome.runtime.sendMessage({ 
    message: "generate_ai",
    content: text 
  });
};

// Update the target website input with the generated content
const insert = (content, replace = true) => {
  var element = document.activeElement;

  // Define a regular expression to find content within tildes
  const tildeContentRegex = /~.*?~/;

  // Check if the active element is a textarea or input field
  if (element.nodeName === "TEXTAREA" || element.nodeName === "INPUT") {
    if (replace) {
      // Replace the entire value if replace is true
      element.value = content;
    } else {
      // Replace only the content within tildes
      element.value = element.value.replace(tildeContentRegex, content);
    }
  } else {
    if (replace) {
      element.innerText = content;
    } else {
      element.innerText = element.innerText.replace(tildeContentRegex, content);
    }
  }

  return true;
};



// ---------------------
// 2. Main Logic
// ---------------------

// Process input events and check for "+++"
const handleInputEvent = (event) => {
  const target = event.target;
  var userInput = target.innerText || target.value;

  if (isEndsWithPlusSign(userInput)) {
    const prompt = userInput.slice(0, -3).trim(); // "Hello world+++" => "Hello world"
    sendTriggerMessage(prompt);
  }

  //console.log(userInput);
};

// Process incoming messages from the background script
const handleMessage = (request, sender, sendResponse) => {
  if (request.message === "inject_ai") {
    console.log(`Received from service worker: ${request.content}`);
    insert(request.content);
  }
};

// ---------------------
// 3. Event Listeners
// ---------------------

// Attach to input event of any open website with inputs where the plugin is enabled
document.addEventListener("input", handleInputEvent);

// Listening incoming messages
chrome.runtime.onMessage.addListener(handleMessage);
