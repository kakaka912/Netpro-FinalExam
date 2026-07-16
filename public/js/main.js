    const ws = new WebSocket("wss://netpro-finalexam.onrender.com/ws");
    const myId = crypto.randomUUID();

        let username = "";
        let myRole = "";
        let chatMode = "local" //(K)

        const loginScreen = document.getElementById("loginScreen");
        const usernameInput = document. getElementById("usernameInput");
        const loginButton = document.getElementById("loginButton");

        const chatScreen = document.querySelector(".container");

        //(K)
        // loginButton.onclick = () => {
        //    const name = usernameInput.value.trim();

        //    if(name === "") {
        //        alert("ユーザー名を入力してください");
        //        return;
        //    }

        //    username = name;

        //    loginScreen.style.display = "none";
        //    chatScreen.style.display = "flex";
        //    input.focus();
        // }
        window.onload = () => {
            // loginScreen.style.display = "none";
            chatScreen.style.display = "flex";
        };

        const messageList = document.querySelector(".messages");
        const form = document.querySelector('.form');
        const input = document.querySelector('.input');

        const toggleOverlay = document.getElementById("toggleOverlay");
        const overlay = document.getElementById("overlay");

        toggleOverlay.onclick = () => {
            overlay.classList.toggle("hidden");
            toggleOverlay.classList.toggle("closed");

            if (!overlay.classList.contains("hidden")) {
                setTimeout(resizeCanvas, 300);
            }
        }

        //ゲーム情報の要素の取得
        const userinfo = document.getElementById("userinfo");
        const status = document.getElementById("status");
        const infolist = document.getElementById("itemList");
        const tasklist = document.getElementById("taskList");


        // ゲームシナリオ表示（K）
        function showMessage(speaker, text){
            addMessage("system-id", speaker, text);
        }

        const chat = document.querySelector(".chat");

        // クリックで進める（K)
        chat.addEventListener("click", (e) => {

            // 選択肢ボタンでは進めない
            if(e.target.classList.contains("choice")) return;    

            // 選択肢が出ている時は進めない
            const choicesArea = document.getElementById("choices");
            if (choicesArea.children.length > 0) return;

            ws.send(JSON.stringify({
            type: "request-next-line",
            role: myRole
            }));
        });

    // 成功判定 (K)
    document.addEventListener("keydown", (e) => {
        if (!currentLetter) return;

        const key = e.key.toUpperCase();

        if (key === currentLetter) {
            addMessage(myId, username, key);
            typingCountLocal++;

            ws.send(JSON.stringify({
                type: "typing-success",
                role: myRole
        }));

        // 次の文字へ
        showNextLetter();
    }
});



        //メッセージを画面に追加
        function addMessage(id, username, text) {
            const li = document.createElement("li");

             //ユーザ名
            const name = document.createElement("span");
            name.classList.add("username");
            name.textContent = username;

            //吹き出し
            const bubble = document.createElement("div");
            bubble.classList.add("bubble");
            bubble.textContent = text;

            if (id === myId) {
                    li.classList.add("message", "my");

                    li.appendChild(name);
                    li.appendChild(bubble);
                } else {
                    li.classList.add("message", "other");

                    li.appendChild(bubble);
                    li.appendChild(name);
                }

                messageList.appendChild(li)
                messageList.scrollTop = messageList.scrollHeight;
        }

        ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("受信:", JSON.stringify(data, null, 2));

    // チャット開放
    if (data.type === "toggle-chat") {
        chatMode = data.mode;
        currentLetter = null; // surrentLetter → currentLetter に修正
        return;
    }

    // 役割
    if (data.type === "assigned-role") {
        myRole = data.role;
        username = data.role; // role名をそのままユーザー名に
        return;
    }

    // シナリオ
    if (data.type === "next-line") {
        const line = data.data;

        hideChoices(); // 毎回いったん消す

        // 選択肢
        if (line.type === "choice") {
            showChoices(line.choices);
            return;
        }

        // タイピング開始
        if (line.type === "typing") {
            startTypingGame();
            return;
        }

        // 画像表示
        if (line.type === "img") {
            showImage(line.src);
            return;
        }

        // 通常メッセージ
        showMessage(line.speaker, line.text);
        return;
    }

    // チャット受信
    if (data.type === "chat") {
        addMessage(data.id, data.username, data.text);
        return;
    }
};


        //選択肢表示関数
        function showChoices(choices){

            const area = document.getElementById("choices");
            area.innerHTML="";

            choices.forEach(choice=>{
                const button = document.createElement("button");
                button.className="choice";
                button.textContent=choice;
                
                button.onclick=()=>{
                    ws.send(JSON.stringify({ type:"player-choice", role:myRole, choice:choice }));
                    hideChoices();
                };
                area.appendChild(button);
            });
            //選択肢表示後にスクロール
            messageList.scrollTop = messageList.scrollHeight;
        }

        //選択肢を閉じる
        function hideChoices(){

            const area = document.getElementById("choices");
            area.innerHTML="";
        }

        //オーバーレイの更新
        function updateStatus(text) {
            status.textContent = text;
        }

        function addItem(item) {
            const li = document.createElement("li");
            li.textContent = item;
            infolist.appendChild(li);
        }

        function addTask(task) {
            const li = document.createElement("li");
            li.textContent = task;
            tasklist.appendChild(li);
        }

        //メッセージ送信
        function sendMessage(text) {
            text = text.trim();
            if(text === "") return;

            // 自分だけに見えるチャット（K)
            if(chatMode === "local"){
                addMessage(myId, username, text);
                input.value = "";
                return;
            }

            // 相手にも送るチャット（K)
            if(chatMode === "global"){
                // 以下、既存の処理
            ws.send(JSON.stringify({ id: myId, username: username, text: text, type: "chat" }));

            input.value = "";
            input.focus();
            }
        }

        // タイピングゲーム (K)
        function startTypingGame() {
        typingCountLocal = 0;
        showNextLetter();
        }

        function showNextLetter() {
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        currentLetter = letter;

        addMessage("system-id", "Computer", `【${letter}】 `);
    }


        // 画像表示定義 (K)
        function showImage(src){
            const li = document.createElement("li");
            li.classList.add("message", "other");

            const img = document.createElement("img");
            img.src = "/img/" + src;
            img.classList.add("scenario-image");

            li.appendChild(img);
            messageList.appendChild(li);
            messageList.scrollTop = messageList.scrollHeight;
        }




        //フォーム送信
        form.onsubmit = function (e) {
            e.preventDefault();
            sendMessage(input.value);
        }

        // ws.onerror = function (error) {
        //     console.error('WebSocket Error: ', error)
        // }
        
    
    //クライアント接続時（K)
    ws.onopen = () => {
        ws.send(JSON.stringify({
            type: "register",
            id: myId,
        }));
    };

    //オーバーレイの内容
    const settingTab = document.getElementById("settingTab");
    const memoTab = document.getElementById("memoTab");

    const settingPanel = document.getElementById("settingPanel");
    const memoPanel = document.getElementById("memoPanel");

    settingTab.onclick = () => {
        settingTab.classList.add("active");
        memoTab.classList.remove("active");

        settingPanel.classList.remove("hidden");
        memoPanel.classList.add("hidden");
    };

    memoTab.onclick = () => {
        memoTab.classList.add("active");
        settingTab.classList.remove("active");

        memoPanel.classList.remove("hidden");
        settingPanel.classList.add("hidden");
    }

    //メモキャンバス
    const canvas = document.getElementById("memoCanvas");
    const ctx = canvas.getContext("2d");

    //描画オプション
    let currentWidth = 5;
    let eraser = false;

    const penBtn = document.getElementById("penBtn");
    const eraserBtn = document.getElementById("eraserBtn");
    const clearBtn = document.getElementById("clearBtn");
    
    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

         //線の設定
        ctx.lineWidth = currentWidth;
        ctx.lineCap = "round";
        ctx.strokeStyle = penColor.value;
    }

    window.addEventListener("load", () => {
        resizeCanvas();

        ctx.fillStyle = "909ab1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    let drawing = false;

    //マウスをクリック
    canvas.addEventListener("mousedown", (e) => {
        drawing = true;

        ctx.lineWidth = currentWidth;

        if (eraser) {
            ctx.strokeStyle = "#909ab1";
        } else {
            ctx.strokeStyle = penColor.value;
        }

        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });

    //マウスを動かす
    canvas.addEventListener("mousemove", (e) => {

        if (!drawing) return;
        
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    });

    //マウスを離す
    canvas.addEventListener("mouseup", () => {
        drawing = false;
    });

    //キャンバス外
    canvas.addEventListener("mouseleave", () => {
        drawing = false;
    });

    

    document.querySelectorAll(".width-btn").forEach(btn => {

        btn.onclick = () => {
            document.querySelector(".width-btn.active")?.classList.remove("active");
            btn.classList.add("active");

            currentWidth = Number(btn.dataset.width);
        }
    })

    //消しゴム
    penBtn.onclick = () => {
        eraser = false;
    }

    eraserBtn.onclick = () => {
        eraser = true;
    }

    clearBtn.onclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#909ab1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    //設定(文字サイズ変更)
    const fontSize = document.getElementById("fontSize");

    fontSize.addEventListener("input", () => {
        const size = parseInt(fontSize.value);
        
        if(!isNaN(size)) {
            chat.style.fontSize = size + "px";
        }
    });

    //設定(色覚補正モード)
    const colorMode = document.getElementById("colorMode");

    colorMode.onchange = () => {
        chat.classList.remove("protanopia", "deuteranopia", "tritanopia");
        if(colorMode.value !== "off") {
            chat.classList.add(colorMode.value);
        }
};
