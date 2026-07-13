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
            loginScreen.style.display = "none";
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
        // クリックで進める（K)
        document.addEventListener("click", () => {

        // 選択肢が出ている時は進めない
        const choicesArea = document.getElementById("choices");
        if (choicesArea.children.length > 0) return;

        ws.send(JSON.stringify({
            type: "request-next-line",
            role: myRole
        }));
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

        ws.onmessage = (event)=>{

            const data = JSON.parse(event.data);

            // チャット開放（K)
            if(data.type === "toggle-chat"){
                    chatMode = data.mode; 
            }

            console.log("受信:", JSON.stringify(data, null, 2));

            //役割
            if(data.type === "assigned-role"){
                myRole = data.role;
                // console.log("役割:", myRole);
                username = data.role; // username = role名（K)
            }

            //シナリオ
            if(data.type === "next-line"){

                const line = data.data;


                // 選択肢の場合
                if(line.type === "choice"){

                    showChoices(line.choices);

                }else{

                    hideChoices();

                    showMessage(line.speaker,line.text);
                }
            }

            //チャット受信
            if(data.type === "chat"){

                addMessage( data.id, data.username, data.text);
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

        