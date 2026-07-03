const express = require ('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// 日付取得
function getTodayString() {
    const now = new Date(); //現在時刻を取得
    const month = now.getMonth() + 1; // 月
    const date = now.getDate(); // 日
    // 曜日
    const dayList = ["日", "月", "火", "水", "木", "金", "土"];
    const day = dayList[now.getDay()];
    return `${month} 月 ${date} 日の ${day} 曜日`;
}

// シナリオデータ
const todayText = getTodayString(); // 日付関数

const scenarioD_WakeUp = [
    { speaker: "システム", text: "【Cランク地区9-505棟】" },
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

    { speaker: "システム", text: "【仕事場】" },
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
    { speaker: "システム", text: "【Bランク地区-avocadoビルディング】" },
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

    { speaker: "システム", text: "【仕事場】" },
    { speaker: "Ai Wo", text: "コールがかかるまでお待ちください" },

    { speaker: "Ai Wo", text: "コール受信" },
    { speaker: "Ai Wo", text: "簡易処理のためAIによるサポートが実施されます。" },
    { speaker: "Ai Wo", text: "エラーナンバーは『1-0-2』です。" },
    { speaker: "P-0901", type: "choice", choices:["[1-0-2] マニュアルを開く"]}
];

const scenarioP_manualTutorial = [
    { speaker: "マニュアル", type: "img"},
    { speaker: "P-0901", type: "choice", choices:["システムを再起動してください"]}
];

const scenarioP_wait = [
    { speaker: "Ai Wo", text: "エラー対処完了。"},
    { speaker: "Ai Wo", text: "素晴らしい 対応能力です。"},
    { speaker: "Ai Wo", text: "コールがかかるまでお待ちください"}
];

const scenarioP_called = [
    { speaker: "Ai Wo", text: "コール受信"}
]

const scenario_Connected = [
    { speaker: "Ai Wo", text: "コール相手との通信を開始しました。" },
    { speaker: "システム", text: "ここからは任意操作となります。" }
];

const scenarioD_CallNotice = [
    { speaker: "Ai Wo", text: "サポートセンターからの指示をお待ちください。適切でない操作をすると仕事評価の著しい低下または失職の可能性があります。" },
    { speaker: "システム", text: "[※送信したメッセージと〇色のテキストは通信相手にも表示されます]" }
];

const scenarioP_CallNotice = [
    { speaker: "Ai Wo", text: "エラーナンバーは4-0-2-9です。適切な対処をお願い致します。" },
    { speaker: "システム", text: "[※送信したメッセージと〇色のテキストは通信相手にも表示されます]" },
    { speaker: "P-0901", type: "choice", choices: ["マニュアルを開く[4-0-2-9]"] }
];

let playerCount = 0 // 接続人数

let currentLineD = 0; // D-シナリオ〇行目
let currentLineP = 0; // P-シナリオ〇行目

let activeScenarioD = scenarioD_WakeUp; // Dシナリオ
let activeScenarioP = scenarioP_WakeUp; // Pシナリオ

// 誰かがサーバーに接続したときの処理
io.on('connection', (socket) => {

    if(playerCount >= 2){
        console.log('満員の為、第三者の接続を拒否しました。');
        socket.emit('room-full', 'サーバーが満員です。時間をおいてお試しください');
        socket.disconnect();
        return;
    }
    playerCount++;
    console.log('新しいプレイヤーが接続しました。現在の接続人数：${playerCount}人');

    if (playerCount === 1) {
        socket.join('room-D') // 1人目がディス
        socket.emit('assiged-role', 'D-2519');
        console.log('一人目のプレイヤーに割り当て')
    } else if (playerCount === 2){
        socket.join('room-P') // 2人目がピア
        socket.emit('assiged-role', 'P-0901');
        console.log('二人目のプレイヤーに割り当て ゲームを開始');

        startGame();
    }
    
    //プレイヤーが画面をクリック
    socket.on('request-next-line', (role) => {
        handleNextLine(role);
    });

    //プレイヤーチャット
    socket.on('chat-message',(msg) => {
        io.emit('broadcast-message', msg);
        console.log(`プレイヤーチャットを受信: ${msg}`);
    });

    //選択肢
    socket.on('player-choice', (data) => {
        console.log(`${data.role}が選択: ${data.choice}`);

        if(data.role === 'D-2519'){
            if(data.choice === '定期検査'){
                io.to('room-D').emit('receive-scenario', scenarioD_inspection);
            } else if (data.choice === '隣人評価'){
                io.to('room-D').emit('receive-scenario', scenarioD_report);
            } else if (data.choice === 'なし'){
                io.to('room-D').emit('receive-scenario', scenarioD_Work);
            }
        }else if(data.role === 'P-0901'){
            if(data.choice === '確認した'){
                io.to('room-P').emit('receive-scenario', scenarioP_Work);
            }else if (data.choice === '[1-0-2] マニュアルを開く'){
                io.to('room-P').emit('receive-scenario', scenarioP_manualTutorial);
            }else if (data.choice === 'システムを再起動してください'){
                io.to('room-P').emit('receive-scenario', scenarioP_wait);
            }
        }
    });

    //通信切断
    socket.on('disconnect', () => {
        playerCount--;
        console.log(`プレイヤーが切断しました。ゲームを強制終了します`);
        if(playerCount < 0) playerCount = 0;
    });
});

// ゲーム開始
function startGame() {
    io.emit('system-message', '接続が確立されました。ゲームを開始します');

    currentLineD = 0; // D初期化
    currentLineP = 0; // P初期化
    activeScenarioD = scenarioD_WakeUp;
    activeScenarioP = scenarioP_WakeUp;
    
    io.to('room-D').emit('next-line', acriveScenarioD[currentLineD]);
    io.to('room-P').emit('next-line', activeScenarioP[currentLineP]);
}

// チャット開放
function connectCall() {
    activeScenarioD = scenario_Connected;
    activeScenarioP = scenario_Connected;
    currentLineD = 0;
    currentLineP = 0;

    io.to('room-D').emit('next-line', activeScenarioD[currentLineD]);
    io.to('room-P').emit('next-line', activeScenarioP[currentLineP]);

    io.emit('toggle-chat', { enabled: true }); 
}

// シナリオ読み込み
function handleNextLine(role) {
    if (role === 'D-2519') {
        currentLineD++; 
        if (currentLineD < activeScenarioD.length) {
            io.to('room-D').emit('next-line', activeScenarioD[currentLineD]);
        } else {
            // 通信
            if (activeScenarioD === scenarioD_CallStart) {
                connectCall();
            } else if (activeScenarioD === scenario_Connected) {
                changeScenarioD(scenarioD_CallNotice);
            } else {
                io.to('room-D').emit('scenario-end');
            }
        }

    } else if (role === 'P-0901') {
        currentLineP++; 
        if (currentLineP < activeScenarioP.length) {
            io.to('room-P').emit('next-line', activeScenarioP[currentLineP]);
        } else {
            // 通信
            if (activeScenarioP === scenarioP_CallStart) {
                connectCall();
            } else if (activeScenarioP === scenario_Connected) {
                changeScenarioP(scenarioP_CallNotice);
            } else {
                io.to('room-P').emit('scenario-end');
            }
        }
    }
}

// Dシナリオ切り替え
function changeScenarioD(newScenario) {
    activeScenarioD = newScenario;
    currentLineD = 0; // 行数リセット
    io.to('room-D').emit('next-line', activeScenarioD[currentLineD]);
}

// Pシナリオ切り替え
function changeScenarioP(newScenario) {
    activeScenarioP = newScenario;
    currentLineP = 0; // 行数リセット
    io.to('room-P').emit('next-line', activeScenarioP[currentLineP]);
}

//サーバー起動
http.listen(PORT, '0.0.0.0', () => {
    console.log(`サーバーが正常に起動しました。`)
    console.log(`ブラウザで http://localhost:${PORT} を開くとゲームが遊べます。`)
})