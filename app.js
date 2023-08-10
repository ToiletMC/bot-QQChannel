import { createOpenAPI, createWebsocket } from "qq-guild-bot";
import axios from "axios";
import { config } from "./config.js";

const botConfig = {
  appID: config.appID, // 申请机器人时获取到的机器人 BotAppID
  token: config.token, // 申请机器人时获取到的机器人 BotToken
  intents: ["GUILD_MESSAGES"], // 事件订阅,用于开启可接收的消息类型
  sandbox: false, // 沙箱支持，可选，默认false. v2.7.0+
};

// 创建 client
const client = createOpenAPI(botConfig);
// 创建 websocket 连接
const ws = createWebsocket(botConfig);

ws.on("GUILD_MESSAGES", (data) => {
  if (data.msg.content.includes("/list")) {
    axios
      .get("https://mcapi.us/server/status?ip=play.toiletmc.net")
      .then((respone) => {
        const onlinePlayers = respone.data.players.sample.map(
          (item) => item.name
        );
        client.messageApi
          .postMessage(data.msg.channel_id, {
            msg_id: data.msg.id,
            content:
              `在线玩家（${respone.data.players.now}/${respone.data.players.max}）：` +
              onlinePlayers.join(", "),
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});
