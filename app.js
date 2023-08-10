import { createOpenAPI, createWebsocket } from "qq-guild-bot";
import axios from "axios";
import { config } from "./config.js";
import Query from "mcquery/lib/index.js";

const HOST = process.env.MC_SERVER || "mc3.roselle.vip";
const PORT = process.env.MC_PORT || 29236;

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

// 马的，这 mcquery 的 sb 回调函数，搞心态。暂时不知道更好的实现办法
let query, last_channel_id, last_msg_id;

ws.on("GUILD_MESSAGES", (data) => {
  if (data.msg.content.includes("/list")) {
    query = new Query(HOST, PORT);
    query
      .connect()
      .then(() => {
        console.log("Asking for full_stat");
        last_channel_id = data.msg.channel_id;
        last_msg_id = data.msg.id;
        query.full_stat(fullStatBack);
      })
      .catch((err) => {
        console.error("error connecting", err);
      });
  }
});

function fullStatBack(err, stat) {
  if (err) {
    console.error(err);
  }

  const respone = {
    online: stat.numplayers,
    maxplayers: stat.maxplayers,
    players: stat.player_,
  };

  sendMessage(
    last_channel_id,
    last_msg_id,
    `在线玩家（${respone.online}/${respone.maxplayers}）：` +
      respone.players.join("，")
  );

  shouldWeClose();
}

function shouldWeClose() {
  // have we got all answers
  if (query.outstandingRequests === 0) {
    query.close();
  }
}

function sendMessage(channel_id, msg_id, message) {
  client.messageApi
    .postMessage(channel_id, {
      msg_id: msg_id,
      content: message,
    })
    .catch((err) => {
      console.log(err);
    });
}
