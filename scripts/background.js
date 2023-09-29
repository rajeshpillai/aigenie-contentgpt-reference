chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.message === "generate_ai") {
    //console.log("BACKEND: ", request.content);
    const prompt = getPrompt(request.content);
    //console.log(prompt);
    generateAiResponse(prompt);
  }
});

const getPrompt = (str) => {
  const index = str.indexOf(":");
  const command = str.slice(0, index);
  const text = str.slice(index + 1);

  return { command, text };
};

const generateAiResponse = async ({ command, text }) => {
  sendResponseMessage("AIGenie is generating content...");
  try {
    // Step #1: Create new prompt based on user's command
    var prompt = "";
    switch (command) {
      case "tweet":
        prompt = `Write me a tweet about ${text}`;
        break;
      case "blog":
        prompt = `Write me a blog post about ${text}`;
        break;
      case "japanese":
        prompt = `Translate the below text to Japanese: ${text}`;
        break;
      case "javascript":
        prompt = `Write a Javascript code that ${text}. I do not want any explainations, notes or text reply other than code blocks at all. Please reponse in the format of code blocks only.`;
        break;
      default:
        prompt = text;
    }

    console.log("New prompt: ", prompt);

    // Step #2: Generate content with new prompt
    const response = await generateContent(prompt); 
    const result = response.replace(/^\n\n/, "");  // Remove the first "\n\n" from the response

    console.log("Generated content: ", result);
    sendResponseMessage(result);

  } catch (error) {
    console.log(error);
  }
};

// Fetch api key from local storage
const getApiKey = async () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("apiKey", function (data) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (data.apiKey) {
        const decodedKey = atob(data.apiKey); // decode the API key
        resolve(decodedKey);
      } else {
        resolve(null);
      }
    });
  });
};


const generateContent = async (prompt) => {
  const key = await getApiKey();
  const url = "https://api.openai.com/v1/completions";

  // Call completions endpoint
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.75,
    }),
  });

  // Get the completion from OpenAI in JSON
  const completion = await response.json();

  // Handle error message
  if (completion.error) {
    throw new Error(completion.error.code);
  }

  // Get the generated text from the completion
  return completion.choices[0]["text"];
};

// Send the generated content to the content script
const sendResponseMessage = async (content) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  chrome.tabs.sendMessage(tab.id, {
    message: "inject_ai",
    content,
  });
};