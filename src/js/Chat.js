// В этом классе вы будете реализовывать логику для вашего чата:
export default class Chat {
  constructor(container) {
    this.container = container;
    this.messageInput = document.querySelector('.chat__messages-input');
    this.chat = document.querySelector('.chat__messages-container');
    this.ws = new WebSocket('wss://ahj-homeworks-sse-ws-server.onrender.com/ws');
    this.chatUserlist = document.querySelector('.chat__userlist');
    this.myUserName = '';
    this.inactiveTimeout = 5 * 60 * 1000; // 5 минут
    this.userActivityMap = new Map(); // Хранит время последней активности пользователей
  }

  async init() {
    // Сначала проверяем есть ли имя в localStorage
    const savedUserName = localStorage.getItem('myUserName');
    if (savedUserName) {
      this.myUserName = savedUserName; // Загружаем сохраненное имя
    }

    this.subscribeOnEvents(); // Регистрируем обработчики событий

    this.closeSession();

    // Запускаем таймер для проверки активности каждые 30 секунд
    setInterval(this.checkInactiveUsers, 10 * 1000);
  }

  // Функция проверки активности
  checkInactiveUsers() {
    // chek for LINT
    const now = Date.now();
    this.userActivityMap.forEach((lastActiveTime, userName) => {
      if (now - lastActiveTime > this.inactiveTimeout) {
        this.userActivityMap.delete(userName); // Удаляем неактивного пользователя
        this.removeUserFromList(userName); // Здесь вы должны реализовать функцию для удаления пользователя из UI
      }
    });
  }

  subscribeOnEvents() {
    // слушаем кнопку ввода имени
    const inputName = document.querySelector('.modal__input');

    document.querySelector('.chat__connect').addEventListener('click', () => {
      const userName = inputName.value;

      if (userName) {
        // Отправляем запрос на создание нового пользователя через API
        fetch('https://ahj-homeworks-sse-ws-server.onrender.com/new-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName }),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                alert(data.message); // Выводим сообщение об ошибке на экран
              });
            }
            return response.json();
          })
          .then((data) => {
            // После успешного создания пользователя мы добавляем его в список
            if (data.status === 'ok') {
              this.myUserName = userName;
              localStorage.setItem('myUserName', userName); // Сохраняем в localStorage
              this.addUserToList(data.user);
              document.querySelector('.modal__background').classList.add('hidden');
            } else {
              alert(data.message); // Обработка ошибок
            }
          });
      }
    });

    this.ws.addEventListener('error', (e) => {
      console.log(e);

      console.log('ws error');
    });

    this.ws.addEventListener('open', (e) => {
      console.log(e);

      // Если в localStorage есть имя пользователя, отправляем его на сервер
      if (localStorage.getItem('myUserName')) {
        const newUserMessage = {
          type: 'new-user',
          user: {
            name: localStorage.getItem('myUserName'),
          },
        };
        this.ws.send(JSON.stringify(newUserMessage));
      }

      console.log('ws open');
    });

    this.ws.addEventListener('close', (e) => {
      console.log(e);

      console.log('ws close');
    });

    this.ws.addEventListener('message', (e) => {
      console.log(e);
      const data = JSON.parse(e.data);
      console.log('data: ', data);

      if (Array.isArray(data)) {
        // Если это список пользователей
        this.chatUserlist.innerHTML = ''; // Очищаем текущий список
        data.forEach((user) => this.addUserToList(user)); // Добавляем всех пользователей
      } else if (data.type === 'send') {
        // Если это сообщение
        this.renderMessages(data);
      }

      console.log('ws message');
    });

    // Подписка на событие нажатия клавиши, для отправки в чат
    this.messageInput.onkeypress = (event) => {
      if (event.key === 'Enter') {
        this.onEnterChatHandler(); // Отправка сообщения по нажатию Enter
      }
    };
  }

  addUserToList(user) {
    const userItem = document.createElement('div');
    userItem.className = 'chat__user';
    userItem.textContent = user.name; // Имя пользователя
    userItem.dataset.id = user.id; // Сохраняем ID для удаления
    this.chatUserlist.appendChild(userItem);
  }

  removeUserFromList(userName) {
    const userElements = document.querySelectorAll('.chat__user');
    userElements.forEach((userElement) => {
      if (userElement.textContent === userName) {
        console.log('завершилось время ожидания активности');
        userElement.remove(); // Удаляем элемент пользователя из DOM

        // Отправляем сигнал на сервер о выходе пользователя
        if (this.myUserName) {
          const exitMessage = {
            type: 'exit',
            user: {
              name: this.myUserName,
            },
          };
          this.ws.send(JSON.stringify(exitMessage)); // Отправляем сообщение на сервер
        }

        // уведомление об отключении
        console.log('Session closed! Please restart the website.');
        alert('Session closed! Please restart the website.');
        localStorage.removeItem('myUserName'); // Удаляем имя из localStorage при закрытии окна
        document.querySelector('.modal__background').classList.remove('hidden');
      }
    });
  }

  onEnterChatHandler() {
    const message = this.messageInput.value;
    if (message) {
      this.sendMessage(message);
      this.messageInput.value = ''; // Очищаем поле ввода
    }
  }

  //  отправка сообщения
  async sendMessage(message) {
    try {
      const msgObj = {
        type: 'send',
        message,
        user: {
          name: this.myUserName, // Здесь имя пользователя
        },
      };
      this.ws.send(JSON.stringify(msgObj));
    } catch (error) {
      console.error(`Ошибка при отправке сообщения: ${error}`);
    }
  }

  renderMessages(data) {
    const msgConteiner = document.createElement('div');
    if (this.myUserName === data.user.name) {
      msgConteiner.className = 'message__container-y';

      const msgHeader = document.createElement('div');
      msgHeader.className = 'message__header-y';
      msgHeader.textContent = this.myUserName;

      const msgText = document.createElement('div');
      msgText.className = 'message__container-yourself';
      msgText.textContent = data.message;

      msgConteiner.appendChild(msgHeader);
      msgConteiner.appendChild(msgText);

      // Обновляем время активности пользователя
      this.userActivityMap.set(this.myUserName, Date.now());
    } else {
      msgConteiner.className = 'message__container-i';

      const msgHeader = document.createElement('div');
      msgHeader.className = 'message__header-i';
      msgHeader.textContent = data.user.name; // имя отправитетя

      const msgText = document.createElement('div');
      msgText.className = 'message__container-interlocutor';
      msgText.textContent = data.message;

      msgConteiner.appendChild(msgHeader);
      msgConteiner.appendChild(msgText);

      // Обновляем время активности пользователя
      this.userActivityMap.set(data.user.name, Date.now());
    }
    this.chat.appendChild(msgConteiner); // Добавляем сообщение в общий чат
  }

  closeSession() {
    window.addEventListener('beforeunload', () => {
      console.log('закрылась вкладка или окно браузера');
      // Отправляем сигнал на сервер о выходе пользователя
      if (this.myUserName) {
        const exitMessage = {
          type: 'exit',
          user: {
            name: this.myUserName,
          },
        };
        this.ws.send(JSON.stringify(exitMessage)); // Отправляем сообщение на сервер
      }

      // уведомление об отключении
      console.log('Session closed! Please restart the website.');
      alert('Session closed! Please restart the website.');
      localStorage.removeItem('myUserName'); // Удаляем имя из localStorage при закрытии окна
      document.querySelector('.modal__background').classList.remove('hidden');
    });
  }
}
