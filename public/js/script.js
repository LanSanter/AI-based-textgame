let activeRoom = "room1"; // 預設聊天室
let message1 = []; //設定與對話紀錄

function switchChatRoom(event) {
  const room = event.target.dataset.room;
  activeRoom = room;
  console.log(room);

  setTimeout(() => {
    console.log(`切換至聊天室 ${room}`);
  }, 1000);//延遲
  // 切換 active class
  load_setting();
  updateChatArea();
  const chatRooms = document.querySelectorAll(".chat-room");
  chatRooms.forEach((room) => room.classList.remove("active"));
  event.target.classList.add("active");  
}

async function sendMessage() {
  const input = document.getElementById("user-message");
  const message = input.value.trim();
  input.value = "";

  if (message !== "") {
    // 送出訊息到系統的接口
    message1.push({role: 'user', content: message,});
    generate_respone();
    updateChatArea();//refresh
  }
}

function updateChatArea() {
  // 更新聊天室內容 
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = ""; // 先清空畫面，然後重新載入新的聊天訊息
  const messagesForActiveRoom = message1.filter((msg) => msg.role === 'assistant' || msg.role === 'user');

  // 將訊息加入 chatMessages 元素中
  messagesForActiveRoom.forEach((msg) => {
    const messageElement = document.createElement("li");
    messageElement.textContent = (msg.role === 'user') ? `玩家: ${msg.content}` : `系統: ${msg.content}`;
    chatMessages.appendChild(messageElement);
  });
}

async function load_setting() {
  await fetchSettingFile();
  await fetchLogFile();
}
async function fetchSettingFile() {
  try {
    const response = await fetch(`/get-file/${activeRoom}.txt`);
    const data = await response.text();
    
    // 將新設定輸入變數中
    while (message1.length > 0) {
      message1.shift();
    }
    message1.splice(0, 0, { role: 'system', content: data });
  } catch (error) {
    console.error('請求檔案失敗:', error);
  }
}
async function fetchLogFile() {
  try {
    const response = await fetch(`/get-file/${activeRoom}log.txt`);
    const data = await response.text();
    
    // 將對話紀錄輸入變數中
    const lines = data.split('\n');
    const roles = [];
    const contents = [];
    lines.forEach(line => {
      if(line === ''){return;}
      const [role, content] = line.split('/');
      roles.push(role);
      contents.push(content);
    });

    for (let i = 0; i < roles.length; i++) {
      message1.push({ role: roles[i], content: contents[i] });
    }

    updateChatArea();
  } catch (error) {
    console.error('請求檔案失敗:', error);
  }
}


function save_log(){
  fetch(`/api/send-message/${activeRoom}log.txt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(message1) // 將訊息轉換為 JSON 格式傳送
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('錯誤:', error);
    });
}

async function generate_respone() {
  try {
    // 使用 fetch 發送 POST 請求並等待回應
    const response = await fetch('/openaimessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message1), // 將參數以 JSON 格式傳送
    });

    // 解析伺服器端回應的 JSON
    const data = await response.json();    
    // 在這裡處理伺服器端回傳的結果
    message1.push({ role: 'assistant', content: data.result });
    console.log(message1);
    updateChatArea();
    save_log();
  } catch (error) {
    // 在這裡處理錯誤
    console.error('錯誤:', error);
  }
  
}

// 頁面載入時更新聊天室內容
document.addEventListener("DOMContentLoaded", () => {
  const messageInput = document.getElementById("user-message");
  messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {sendMessage();}
  });
  load_setting();
  updateChatArea();
});
