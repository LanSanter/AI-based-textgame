const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const openai = require('./openai_gpt');
const path = require('path');
const fs = require('fs');


// 設定首頁路由
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
//設定檔案路由
app.get('/get-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'setting', filename);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('讀取角色文件失敗:', err);
        res.status(500).send('讀取檔案失敗');} else {
        res.send(data);}
    });
})

// 設定靜態資料夾
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 處理接收訊息的路由
app.post("/api/send-message/:filename", (req, res) => {
  const filename = req.params.filename;
  const text = req.body
  .filter(({ role }) => role !== 'system') // 過濾role為'system'的內容
  .map(({ role, content }) => `${role}/${content}`)
  .join('\n');
  const filePath = path.join(__dirname, 'setting', filename);
  fs.writeFile(filePath, text, 'utf8', (err) => {
    if (err) {
      console.error('寫入檔案失敗:', err);
    } else {
      console.log('資料已成功存入檔案:', filename);
    }
  });
  res.status(200).send("訊息已接收");
});
app.post('/openaimessage', async (req, res) => {
  //console.log(req.body);
  const param1 = req.body; // 取得第一個參數
  const result = await openai.openAiMessage(param1, 'gpt-3.5-turbo');
  console.log(result);
  // 將結果回傳給網頁端
  res.json({ result });
});

app.listen(port, () => {
  console.log(`應用程式正在監聽 http://localhost:${port}`);
});
