import bot from './assets/bot.svg';
import user from './assets/user.svg';
const form = document.querySelector('form'); // call the query selector as a function and provide it's id or tag name ("form")
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  // add every dot (text element) to the text content after every 300 ms
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300) 
} 

// Typing motion of the chat bot
function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
      // set the element equal to the charater of the whole text if the index is less than the whole text
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
      }
      else {
        clearInterval(interval);
      }
    }, 20)
}

// Generate Unique ID
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNum = Math.random();
  const hexString = randomNum.toString(16);
  return `id-${timeStamp}-${hexString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
              type="image/svg+xml"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

// trigger to get the AI generated botResponse
const handleSubmit = async(e) => {
  e.preventDefault(); // prevent default behaviour of the browser

  const data = new FormData(form);

  // Users chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  // Clear text area input
  form.reset(); 

  // AI Bot chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // Put new message in view
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // Fetch data from server --> bot's botResponse
  const botResponse = await fetch("https://ai-code-analyzer.onrender.com/", {
    // const botResponse = await fetch("http://localhost:5000", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // The request includes a header with the content type set to 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt') // body contains data comming from our text element
    })
  })

  // clear the dots so we can add the message
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(botResponse.ok) {
    const data = await botResponse.json(); // botResponse from the BE
    const parsedData = data.bot.trim(); // we gotta parse the botResponse

    console.log({parsedData})

    // Pass the parsed data to the typeText function
    typeText(messageDiv, parsedData); 

  } else {
    const err = await botResponse.text();
    messageDiv.innerHTML = "Uh Oh! Something went wrong";
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
// If the enter key is pressed handle the submit too
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})
