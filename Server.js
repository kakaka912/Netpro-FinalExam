const express = require('express');
const expressWs = require('express-ws');
const puzzleID = "[A1412D3]"
const puzzlePASS = "[2146]";
let puzzleSolved = false;

const app = express();
expressWs(app);

const port = process.env.PORT || 3000;
let connects = []; // 接続されているWebSocketのリスト
let playerCount = 0; // 接続人数
let chatEnabled = false; //チャット有効フラグ（初期設定：無効）
let typingCount = 0; // タイピングに成功した回数
let pReachedWait = false; // Pが合流シナリオに到達 

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 日付取得
function getTodayString() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayList = ["日", "月", "火", "水", "木", "金", "土"];
    const day = dayList[now.getDay()];
    return `${month} 月 ${date} 日の ${day} 曜日`;
}

// シナリオデータ
const todayText = getTodayString();

const scenarioD_WakeUp = [
    { speaker: "System", text: "※チャットは通信相手に見えません" },
    { speaker: "System", text: "【Cランク地区9-505棟】" },
    { speaker: "Ai Min", text: "起床時刻です。" },
    { speaker: "Ai Min", text: `ただいま ${todayText} 8 時 00 分。本日の最高気温は 38 ℃ 最低気温は 29 ℃。` },
    { speaker: "Ai Min", text: "D-2519 特別予定 2件"},
    { speaker: "Ai Min", text: "・定期検査B" },
    { speaker: "Ai Min", text: "・隣人評価" },
    { speaker: "Ai Min", text: "疑問点は ありますか。" },
    { speaker: "D-2519", type: "choice", choices:["定期検査", "隣人報告", "なし"]}
];

const scenarioD_inspection = [
    { speaker: "D-2519", text: "定期検査" },
    { speaker: "Ai Min", text: "『〇〇の市民は 健康状態の把握 また 管理のため 定期的に 健康診断を受けることが 義務付けられています。" },
    { speaker: "Ai Min", text: "100日ごとに受ける A検査と 10日ごとに受ける B検査が あります。"},
    { speaker: "Ai Min", text: "本日は B検査 です。』" },
    { speaker: "Ai Min", text: "疑問点は ありますか。" },
    { speaker: "D-2519", type: "choice", choices:["定期検査", "隣人報告", "なし"]}
];

const scenarioD_report = [
    { speaker: "D-2519", text: "隣人評価" },
    { speaker: "Ai Min", text: "『〇〇の市民は 治安維持のため 反政府組織の疑いがある人物を 報告することが 義務付けられています。" },
    { speaker: "Ai Min", text: "提出要請は 不定期かつ公平な審査のもと行われます。』" },
    { speaker: "Ai Min", text: "疑問点は ありますか。" },
    { speaker: "D-2519", type: "choice", choices:["定期検査", "隣人報告", "なし"]}
];

const scenarioD_Work = [
    { speaker: "Ai Min", text: "幸せな日々の為に。" },
    { speaker: "System", text: "【仕事場】" },
    { speaker: "Computer", type: "typing"}
];

const scenarioD_Trouble = [
    { speaker: "Ai Wo", text: "システムエラーが発生。原因調査中" },
    { speaker: "Ai Wo", text: "内部プロトコルに異常検知。自動修復実行" },
    { speaker: "Ai Wo", text: "自動修復に失敗。アプリケーションを再起動" }
];

const scenarioD_CallStart = [
    { speaker: "Ai Wo", text: "内部プロトコルに異常検知。サポートセンターにコール" }   
];

const scenarioP_WakeUp = [
    { speaker: "System", text: "※チャットは通信相手に見えません" },
    { speaker: "System", text: "【Bランク地区-avocadoビルディング】" },
    { speaker: "Ai Min", text: "おはようございます！ 本日も素晴らしい朝がやってきました。" },
    { speaker: "Ai Min", text: `ただいま ${todayText} 8 時 00 分です。最高気温は 38℃ 最低気温は 29℃の予報です。` },
    { speaker: "Ai Min", text: "P-0901様に 特別な連絡が 2 件ございます。" },
    { speaker: "Ai Min", text: "・隣人報告のお願い" },
    { speaker: "Ai Min", text: "詳細をお読みします。" },
    { speaker: "Ai Min", text: "『〇〇の市民は 治安維持のため 反政府組織の疑いがある人物を 報告することが 義務付けられています。" },
    { speaker: "Ai Min", text: "提出要請は 不定期かつ公平な審査のもと行われます。』" },
    { speaker: "P-0901", type: "choice", choices:["確認した"]}
];

const scenarioP_Work = [
    { speaker: "Ai Min", text: "幸せな日々の為に。" },
    { speaker: "System", text: "【仕事場】" },
    { speaker: "Ai Wo", text: "コールがかかるまでお待ちください" },
    { speaker: "Ai Wo", text: "コール受信" },
    { speaker: "Ai Wo", text: "簡易処理のためAIによるサポートが実施されます。" },
    { speaker: "Ai Wo", text: "エラーナンバーは『1-0-2』です。" },
    { speaker: "P-0901", type: "choice", choices:["[1-0-2] マニュアルを開く"]}
];

const scenarioP_manualTutorial = [
    { speaker: "Manual", type: "img"},
    { speaker: "P-0901", type: "choice", choices:["システムを再起動してください"]}
];

const scenarioP_wait = [
    { speaker: "Ai Wo", text: "エラー対処完了。"},
    { speaker: "Ai Wo", text: "素晴らしい 対応能力です。"},
    { speaker: "Ai Wo", text: "コールがかかるまでお待ちください"}
];

const scenarioP_called = [
    { speaker: "Ai Wo", text: "コール受信"}
];

const scenario_Connected = [
    { speaker: "Ai Wo", text: "コール相手との通信を開始しました。" },
    { speaker: "System", text: "ここからは任意操作となります。" }
];

const scenarioD_CallNotice = [
    { speaker: "Ai Wo", text: "サポートセンターからの指示をお待ちください。適切でない操作をすると仕事評価の著しい低下または失職の可能性があります。" },
    { speaker: "System", text: "[※ここから送信したメッセージは通信相手にも表示されます]" }
];

const scenarioP_CallNotice = [
    { speaker: "Ai Wo", text: "エラーナンバーは4-0-2-9です。適切な対処をお願い致します。" },
    { speaker: "System", text: "[※ここから送信したメッセージと〇色のテキストは通信相手にも表示されます]" },
    { speaker: "P-0901", type: "choice", choices: ["マニュアルを開く[4-0-2-9]"] }
];

// 謎解きパート開始

const scenarioD_puzzleID = [
    { speaker: "Ai Wo", text: "ID を [] で囲いチャットに送信してください。" },
    { speaker: "Manual", type: "img", src: "D_2.png"}
];

const scenarioP_puzzleID = [
    { speaker: "Manual", type: "img", src: "P_2.png"}
];

const scenarioD_puzzlePass = [
    { speaker: "Ai Wo", text: "パスワード を [] で囲いチャットに送信してください。" },
    { speaker: "Manual", type: "img", src: "D_1.png"}
];

const scenarioP_puzzlePass = [
    { speaker: "Manual", type: "img", src: "P_1.png"}
];


//謎解きパート終了

const scenario_ending = [
    { speaker: "Ai Wo", text: "エラー対処完了。" },
    { speaker: "Ai Wo", text: "素晴らしい働きです。" },
    { speaker: "Ai Wo", text: "今回の報告書を作成中…" },
    { speaker: "Ai Wo", text: "作成失敗。権限の失効を確認。" },
    { speaker: "Ai Wo", text: "規定により責任者からのメッセージを公開します。" },
    { speaker: "Cheese", text: "「α版はこれにて終了。テストの協力に感謝する」" },
    { speaker: "System", type: "end" }
];



let currentLineD = 0;
let currentLineP = 0;

let activeScenarioD = scenarioD_WakeUp;
let activeScenarioP = scenarioP_WakeUp;

// 通信時
app.ws('/ws', (ws, req) => {
    
    // 満員チェック
    if (playerCount >= 2) {
        console.log('満員の為、第三者の接続を拒否しました。');
        ws.send(JSON.stringify({ type: 'room-full', text: 'サーバーが満員です。時間をおいてお試しください。' }));
        ws.close();
        return;
    }

    connects.push(ws);
    playerCount++;
    console.log(`新しいプレイヤーが接続しました。現在の接続人数：${playerCount}人`);

    // 接続した順番で役割（Role）を割り振って本人に通知
    if (playerCount === 1) {
        ws.role = 'D-2519';
        ws.send(JSON.stringify({ type: 'assigned-role', role: 'D-2519'}));
        ws.send(JSON.stringify({ type: 'toggle-chat', mode: 'local'}));
        console.log('一人目のプレイヤーにD-2519を割り当て');
    } else if (playerCount === 2) {
        ws.role = 'P-0901';
        ws.send(JSON.stringify({ type: 'assigned-role', role: 'P-0901'}));
                ws.send(JSON.stringify({ type: 'toggle-chat', mode: 'local'}));
        console.log('二人目のプレイヤーにP-0901を割り当て ゲームを開始');

        startGame();
    }

    // クライアントからメッセージを受け取った時の処理
    ws.on('message', (raw) => {
        try{
            const data = JSON.parse(raw.toString());

        // 1. 画面をクリックして次のセリフを要求された時
        if (data.type === 'request-next-line') {
            handleNextLine(data.role);
        }

        // 2. プレイヤー同士のチャット（テキストをそのままブロードキャスト）
        if (data.type === 'chat') {

            if(!chatEnabled) {
                ws.send(JSON.stringify({
                    type: "chat",
                    id: data.id,
                    username: data.username,
                    text: data.text,
                    local: true
                }));
                return;
            }
            const sendData = {
                type: 'chat',
                id: data.id,
                username: data.username || ws.username || '名無し',
                text: data.text || ''
            };
            broadcast(sendData);
            console.log(`プレイヤーチャットを受信: ${data.role || '不明'}: ${data.text}`);

            if (ws.role === "D-2519" && !puzzleSolved) {

            if (data.text.trim() === puzzleID) {
                sendToRole("D-2519", { type: "system-message", text: "ID 認証成功" });

                changeScenarioD(scenarioD_puzzlePass);
                changeScenarioP(scenarioP_puzzlePass);
            }

            if (data.text.trim() === puzzlePASS) {
                sendToRole("D-2519", { type: "system-message", text: "パスワード 認証成功" });
                puzzleSolved = true;

                changeScenarioD(scenario_ending);
                changeScenarioP(scenario_ending);
            }
        }
    }
        

        // 3. タイピング成功
        if (data.type === "typing-success") {
        typingCount++;
        checkMergeCondition();
        }


        // 4. 選択肢ボタンが押された時
        if (data.type === 'player-choice') {
            console.log(`${data.role}が選択: ${data.choice}`);

            if (data.role === 'D-2519') {
                if (data.choice === '定期検査') {
                    changeScenarioD(scenarioD_inspection);
                } else if (data.choice === '隣人評価' || data.choice === '隣人報告') {
                    changeScenarioD(scenarioD_report);
                } else if (data.choice === 'なし') {
                    changeScenarioD(scenarioD_Work);
                }
            } else if (data.role === 'P-0901') {
                if (data.choice === '確認した') {
                    changeScenarioP(scenarioP_Work);
                } else if (data.choice === '[1-0-2] マニュアルを開く') {
                    changeScenarioP(scenarioP_manualTutorial);
                } else if (data.choice === 'システムを再起動してください') {
                    changeScenarioP(scenarioP_wait);
                }
            }
        }
    }catch(e){
        console.error('データの解析または処理に失敗しました', e)
        }
    });

    // 接続が切れたとき
    ws.on('close', () => {
        connects = connects.filter((conn) => conn !== ws);
        playerCount--;
        console.log(`プレイヤーが切断しました。現在の接続人数：${playerCount}人`);
        if (playerCount < 0) playerCount = 0;
    });
});

// 全員にデータを一斉送信する関数
function broadcast(obj) {
    const msg = JSON.stringify(obj);
    connects.forEach((socket) => {
        if (socket.readyState === 1) {
            socket.send(msg);
        }
    });
}

// 特定の役割（DかPか）のプレイヤーだけに送信する関数
function sendToRole(role, obj) {
    const msg = JSON.stringify(obj);
    connects.forEach((socket) => {
        if (socket.role === role && socket.readyState === 1) {
            socket.send(msg);
        }
    });
}

// ゲーム開始
function startGame() {
    broadcast({ type: 'system-message', text: '接続が確立されました。ゲームを開始します' });

    currentLineD = 0;
    currentLineP = 0;
    activeScenarioD = scenarioD_WakeUp;
    activeScenarioP = scenarioP_WakeUp;
    
    sendToRole('D-2519', { type: 'next-line', data: activeScenarioD[currentLineD] });
    sendToRole('P-0901', { type: 'next-line', data: activeScenarioP[currentLineP] });
}

// チャット開放
function connectCall() {
    chatEnabled = true;

    activeScenarioD = scenario_Connected;
    activeScenarioP = scenario_Connected;
    currentLineD = 0;
    currentLineP = 0;

    sendToRole('D-2519', { type: 'next-line', data: activeScenarioD[currentLineD] });
    sendToRole('P-0901', { type: 'next-line', data: activeScenarioP[currentLineP] });

    broadcast({ type: 'toggle-chat', mode: "global"}); 
}

// 合流
function checkMergeCondition() {
    if (typingCount >= 3 && pReachedWait) {
        changeScenarioD(scenarioD_Trouble);
    }
}

// シナリオ読み込み
function handleNextLine(role) {
    if (role === 'D-2519') {
        currentLineD++; 
        if (currentLineD < activeScenarioD.length) {
            sendToRole('D-2519', { type: 'next-line', data: activeScenarioD[currentLineD] });
        } else {
            if (activeScenarioD === scenarioD_CallStart) {
                connectCall();
            } else if (activeScenarioD === scenario_Connected) {
                changeScenarioD(scenarioD_CallNotice);
            } else if (activeScenarioD === scenarioD_Trouble) {
                changeScenarioD(scenarioD_CallStart);
            } else if (avtiveScenarioD === scenarioD_CallStart) {
                connectCall(); // 合流＆チャット解放
            } else {
                sendToRole('D-2519', { type: 'scenario-end' });
            }
        }
    } else if (role === 'P-0901') {
        currentLineP++; 
        if (currentLineP < activeScenarioP.length) {
            sendToRole('P-0901', { type: 'next-line', data: activeScenarioP[currentLineP] });
        } else {
            if(activeScenarioP === scenarioP_wait) {
                setTimeout(() => {
                    pReachedWait = true;
                    changeScenarioP(scenarioP_called);
                }, 3000);
            } else if (activeScenarioP === scenarioP_CallStart) {
                connectCall();
            } else if (activeScenarioP === scenario_Connected) {
                changeScenarioP(scenarioP_CallNotice);
            } else {
                sendToRole('P-0901', { type: 'scenario-end' });
            }
        }
    }
}

// Dシナリオ切り替え
function changeScenarioD(newScenario) {
    activeScenarioD = newScenario;
    currentLineD = 0;
    sendToRole('D-2519', { type: 'next-line', data: activeScenarioD[currentLineD] });
}

// Pシナリオ切り替え
function changeScenarioP(newScenario) {
    activeScenarioP = newScenario;
    currentLineP = 0;
    sendToRole('P-0901', { type: 'next-line', data: activeScenarioP[currentLineP] });
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});