
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

            if (id === myId) {
                    li.classList.add("my-message");
                    li.textContent = `${username}: ${text}`;
                } else {
                    li.classList.add("other-message");
                    li.textContent = `${username} : ${text}`;
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

        

        form.onsubmit = function (e) {
            e.preventDefault();
            const text = input.value.trim();
            // ws.send(JSON.stringify({ id: myId, username: username, text, type: 'chat' }))
            if(text === "") return;
            addMessage(myId, username, text);

            input.value = '';
            input.focus();
        }

        // ws.onerror = function (error) {
        //     console.error('WebSocket Error: ', error)
        // }
        
        // ws.onopen = () => {
        //     console.log("WebSocket Connected");
        // };
        