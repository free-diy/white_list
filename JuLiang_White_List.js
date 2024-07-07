/*
Jejz
巨量白名单自动替换
WxPusher一对一：设置WP_APP_TOKEN_ONE和WP_APP_MAIN_UID自动启动
*/

// 定义trade_no(业务编号)和key(提取API页面最下面)
const trade_no = '';
const key= '';
// 一对一通知
const WP_APP_TOKEN_ONE = '';
const WP_APP_MAIN_UID = '';


const fs = require('fs');
const request = require('request');
const notify = require('./sendNotify');
const crypto = require('crypto');
const ipFileName = 'juliangIp.txt';

function readSavedIp() {
  try {
    const data = fs.readFileSync(ipFileName, 'utf8');
    return data.trim();
  } catch (error) {
    return null;
  }
}

function saveIp(ip) {
  fs.writeFileSync(ipFileName, ip);
}

// 获取当前IP
async function getCurrentIp() {
  const getIpUrl = 'http://ident.me';
  try {
    const currentIP = await new Promise((resolve, reject) => {
      request.get(getIpUrl, (getIpError, getIpResponse, currentIP) => {
        if (getIpError) {
          reject(getIpError);
        } else {
          resolve(currentIP);
        }
      });
    });
    emojis = ['😊', '😎', '🚀', '🎉', '👍', '💡'];
    randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    console.log(randomEmoji + ' 当前IP:', currentIP);
    await delay(2000);
    return currentIP;
  } catch (error) {
    console.error('获取当前IP发生错误:', error);
    return null;
  }
}

// 添加IP到白名单
async function addIpToWhiteList(currentIP) {
  const inputString  = `new_ip=${currentIP}&old_ip=${readSavedIp()}&trade_no=${trade_no}&key=${key}`;
  const sign = crypto.createHash('md5').update(inputString).digest('hex');
  const addIpUrl = `http://v2.api.juliangip.com/dynamic/replaceWhiteIp?new_ip=${currentIP}&old_ip=${readSavedIp()}&trade_no=${trade_no}&sign=${sign}`;
  try {
    const addIpResponse = await new Promise((resolve, reject) => {
      request.get(addIpUrl, (addIpError, addIpResponse, addIpBody) => {
        if (addIpError) {
          reject(addIpError);
        } else {
          resolve({ response: addIpResponse, body: addIpBody });
        }
      });
    });
    emojis = ['😊', '😎', '🚀', '🎉', '👍', '💡'];
    randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    successCondition = addIpResponse.body.includes('请求成功');
    message = successCondition ? `IP地址已更新：${currentIP}` : `IP地址添加失败: ${addIpResponse.body}`;
    title = successCondition ? "携趣白名单更换成功 ✅" : "携趣白名单更换失败 ❌"; 
    console.log(randomEmoji + ' 添加IP到白名单的响应:', addIpResponse.body);
    message = `IP地址已更新：${currentIP}`;
    await delay(1000);
    return { success: successCondition, title, message };
  } catch (error) {
    console.error('添加IP到白名单发生错误:', error);
    message = `'IP地址添加失败:',${error}`;
    return { success: false, title: "携趣白名单更换失败 ❌", message };
  }
}

// 发送通知
async function sendNotification(messageInfo) {
  const { title, message } = messageInfo;
  notify.sendNotify(title, message);
}

async function main() {
  const currentIP = await getCurrentIp();

  if (currentIP) {
    saveIp(currentIP);

    resultMessage = await addIpToWhiteList(currentIP);

    await sendNotification(resultMessage);

    const wxpusherResponse = await wxpusherNotify(
      resultMessage.title,
      resultMessage.message
    );
  }
}

main();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function wxpusherNotify(text, desp, strsummary = "") {
    return new Promise((resolve) => {
        if (WP_APP_TOKEN_ONE && WP_APP_MAIN_UID) {
            var WPURL = "";            
            if (strsummary && strsummary.length > 96) {
                strsummary = strsummary.substring(0, 95) + "...";
            }
            let uids = [];
            for (let i of WP_APP_MAIN_UID.split(";")) {
                if (i.length != 0)
                    uids.push(i);
            };
            let topicIds = [];

            //desp = `<font size="3">${desp}</font>`;
            desp = desp.replace(/[\n\r]/g, '<br>'); // 默认为html, 不支持plaintext
            desp = `<section style="width: 24rem; max-width: 100%;border:none;border-style:none;margin:2.5rem auto;" id="shifu_imi_57"
    donone="shifuMouseDownPayStyle(&#39;shifu_imi_57&#39;)">
    <section
        style="margin: 0px auto;text-align: left;border: 2px solid #212122;padding: 10px 0px;box-sizing:border-box; width: 100%; display:inline-block;"
        class="ipaiban-bc">
        <section style="margin-top: 1rem; float: left; margin-left: 1rem; margin-left: 1rem; font-size: 1.3rem; font-weight: bold;">
            <p style="margin: 0; color: black">
                ${text}
            </p>
        </section>
        <section style="display: block;width: 0;height: 0;clear: both;"></section>
        <section
            style="margin-top:20px; display: inline-block; border-bottom: 1px solid #212122; padding: 4px 20px; box-sizing:border-box;"
            class="ipaiban-bbc">
            <section
                style="width:25px; height:25px; border-radius:50%; background-color:#212122;display:inline-block;line-height: 25px"
                class="ipaiban-bg">
                <p style="text-align:center;font-weight:1000;margin:0">
                    <span style="color: #ffffff;font-size:20px;">📢</span>
                </p>
            </section>
            <section style="display:inline-block;padding-left:10px;vertical-align: top;box-sizing:border-box;">
            </section>
        </section>
        <section style="margin-top:0rem;padding: 0.8rem;box-sizing:border-box;">
            <p style=" line-height: 1.6rem; font-size: 1.1rem; ">
                ${desp} 
			</p>            
        </section>
    </section>
</section>`;

            const body = {
                appToken: `${WP_APP_TOKEN_ONE}`,
                content: `${desp}`,
                summary: `${text} ${strsummary}`,
                contentType: 2,
                topicIds: topicIds,
                uids: uids,
                url: `${WPURL}`,
            };
            const options = {
                url: `http://wxpusher.zjiecode.com/api/send/message`,
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 15000,
            };
            request.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log("WxPusher 发送通知调用 API 失败！！\n");
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.code === 1000) {
                            console.log("WxPusher 发送通知消息成功!\n");
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                }
                finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}