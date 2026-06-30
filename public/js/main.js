
        const myId = crypto.randomUUID();
        const username = prompt("ユーザー名を入力してください") || "AI";

        const messageList = document.querySelector(".messages");
        const form = document.querySelector('.form');
        const input = document.querySelector('.input');

        //ゲーム情報の要素の取得
        const userinfo = document.getElementById("userinfo");
        const status = document.getElementById("status");
        const infolist = document.getElementById("itemList");
        const tasklist = document.getElementById("taskList");

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

        //オーバーレイの更新
        function updateStatus(text) {
            status.textContent = text;
        }

        function addItem(item) {
            const li = document.createElement("li");
            li.textContent = item;
            DataTransferItemList.appendChild(li);
        }

        function addTask(task) {
            const li = document.createElement("li");
            li.textContent = task;
            tasklist.appendChild(li);
        }
        // ws.onmessage = (event) => {
        //     const msg = JSON.parse(event.data)

        //     if (msg.type === 'chat') {
        //         addMessage(msg.id, msg.username, msg.text);
        //     }
        // };

        //メッセージ送信
        function sendMessage(text) {
            text = text.trim();
            if(text === "") return;

            // ws.send(JSON.stringify({ id: myId, username, text, type: "chat" }));

            addMessage(myId, username, text);

            input.value = "";
            input.focus();
        }

        //フォーム送信
        form.onsubmit = function (e) {
            e.preventDefault();
            sendMessage(input.value);
        }

        const choices = document.querySelectorAll(".choice");

        choices.forEach(choice => {
            choice.onclick = function () {
                sendMessage(choice.textContent);
            };
        });

        // ws.onerror = function (error) {
        //     console.error('WebSocket Error: ', error)
        // }
        
        // ws.onopen = () => {
        //     console.log("WebSocket Connected");
        // };
        