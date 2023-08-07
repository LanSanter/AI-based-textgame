const { Configuration, OpenAIApi, } = require('openai');
require('dotenv').config();
const configuration = new Configuration({
  //apiKey: process.env.API_KEY,
  apiKey: process.env.API_KEY,
});
const openAI = new OpenAIApi(configuration);

const embeddingmodelId = "text-embedding-ada-002";



async function openAiMessage(messages, model) {
    try {
      const completion = await openAI.createChatCompletion({
        model: model,
        messages,
        max_tokens: 600,
        temperature: 0.6,
      });
  
      return completion.data.choices[0].message.content.trim(); // OpenAI 回傳時都會有許多空白，因此要使用 trim 去除前後空白
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      console.log(error.response.status);
      console.log(error.response.statusText);
      return `對不起，我發生 **${error.response.status} - ${error.response.statusText}** 錯誤，所以不知道該怎麼回你 QQ`;
    }
}
async function embeddingText(message) {
    try {
        const embedding = await openAI.createEmbedding({
            model: embeddingmodelId,
            input: message,
        });
        return embedding.data.data[0].embedding
    }catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        console.log(error.response.status);
        console.log(error.response.statusText);
        console.log("嵌入出現錯誤");
        return null;
      }
}
module.exports = {
    openAiMessage,embeddingText,
};
/*(async () => {
  const response = await openAiMessage([{role: "user", content: "你好啊"}]);
  const vector = await embeddingText("早安");
  console.log(1);
  console.log(response);
  console.log(vector);
  console.log(process.env.API_KEY);
})();*///測試用代碼
