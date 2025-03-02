import ChatAPI from "./api/ChatAPI";

// В этом классе вы будете реализовывать логику для вашего чата:
export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.websocket = null;
    this.messages = []; // Хранение сообщений 
    this.messageInput = document.querySelector('.chat__messages-input');
    this.chat = document.querySelector('.chat__messages-container');
    this.ws = new WebSocket('wss://ahj-homeworks-sse-ws-server.onrender.com/ws');
    this.chatUserlist = document.querySelector('chat__userlist');
  }

  async init() {
    await this.fetchMessages(); // Загружаем сообщения при инициализации  
    this.bindToDOM(); // Привязываем элементы к DOM  
    this.registerEvents(); // Регистрируем события  
    this.subscribeOnEvents(); // Регистрируем обработчики событий  
  }

  // дополнительный метод, может и не нужен...
  async fetchMessages() {
    try {
      //this.messages = await this.ws.fetchMessages();
      this.renderMessages(); // Рендерим сообщения на экран  
    } catch (error) {
      //console.error('Ошибка при получении сообщений:' + error);
    }
  }

  bindToDOM() {
    // Создание элементов интерфейса для чата  

  }

  registerEvents() {
    // this.sendButton.onclick = () => this.onEnterChatHandler(); // Обработка клика на кнопку  
    // this.messageInput.onkeypress = (event) => {
    //   if (event.key === 'Enter') {
    //     this.onEnterChatHandler(); // Отправка сообщения по нажатию клавиши Enter  
    //   }
    // };
  }

  subscribeOnEvents() {
    // слушаем кнопку ввода имени
    const inputName = document.querySelector('.modal__input');

    document.querySelector('.chat__connect').addEventListener('click', (e) => {
      const userName = inputName.value;

      if (userName) {
        // Отправляем запрос на создание нового пользователя через API  
        fetch('/new-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName })
        })
          .then(response => response.json())
          .then(data => {
            // После успешного создания пользователя мы добавляем его в список  
            if (data.status === "ok") {
              this.addUserToList(data.user);
              document.querySelector('.modal__background').classList.add('hidden');
            } else {
              alert(data.message); // Обработка ошибок  
            }
          });
      }
      // if (userName) {  
      //   const userId = randomUUID(); // Генерация уникального ID для пользователя  
      //   this.ws.send(JSON.stringify({ type: 'new-user', user: { id: userId, name: userName } }));  
      //   document.querySelector('.modal__background').classList.add('hidden');  
      // }  

      // структура отправки имени пользователя на сервер
      // this.ws.send(JSON.stringify({ type: 'new-user', name: inputName.value }));  
      // document.querySelector('.modal__background').classList.add('hidden');
    });


    this.ws.addEventListener('error', (e) => {
      console.log(e);

      console.log('ws error');
    });

    this.ws.addEventListener('open', (e) => {
      console.log(e);

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

      document.addEventListener('DOMContentLoaded', () => {


        // Добавление пользователя в список  
        if (Array.isArray(data)) {
          this.chatUserlist.innerHTML = ' '; // Очищаем текущий список  
          data.forEach(user => this.addUserToList(user)); // Добавляем всех пользователей  
        }

        // Добавление пользователя в список  
        if (Array.isArray(data)) {
          this.chatUserlist.innerHTML = ' '; // Очищаем текущий список  
          data.forEach(user => this.addUserToList(user)); // Добавляем всех пользователей  
        }

        // Обработка сообщений о выходе пользователя  
        if (data.type === 'user-left') {
          this.removeUserFromList(data.user); // Удаляем пользователя из списка  
        }
      });

      // обработка пользователя
      // if (data.type === 'user-added') {  
      //   const userItem = document.createElement('div');  
      //   userItem.className = 'chat__user';  
      //   userItem.textContent = data.user.name; // Используйте имя нового пользователя  
      //   userItem.dataset.id = user.id; // Сохраняем ID для удаления  
      //   this.chatUserlist.appendChild(userItem);  
      // } else if (data.type === 'user-left') {  
      //   // Удаляем пользователя из списка  
      //   const userItem = this.chatUserlist.querySelector(`.chat__user[data-id="${data.user.id}"]`);  
      //   if (userItem) {  
      //     this.chatUserlist.removeChild(userItem);  
      //   }  
      // }  

      // генерация блока сообщения и отправка его в чат
      const msgConteiner = document.createElement('div');
      msgConteiner.className = 'message__container';

      const msgHeader = document.createElement('div');
      msgHeader.className = 'message__header';
      msgHeader.textContent = 'User 1';

      const msgText = document.createElement('div');
      msgText.className = 'message__container-yourself';
      msgText.textContent = data.text;

      msgConteiner.appendChild(msgHeader);
      msgConteiner.appendChild(msgText);
      this.chat.appendChild(msgConteiner);

      // messages.forEach(message => {
      //   chat.appendChild(document.createTextNode(message + '/n'));
      // });

      console.log('ws message');
    });






    // Пример: подписка на событие нажатия клавиши  
    // это можно использовать для отправки в чат
    this.messageInput.onkeypress = (event) => {
      if (event.key === 'Enter') {
        this.onEnterChatHandler(); // Отправка сообщения по нажатию Enter  
      }
    };

    // Пример событий для кнопки отправки  
    // this.sendButton.onclick = () => {
    //   this.onEnterChatHandler(); // Отправка сообщения при клике на кнопку  
    // };
  }

  addUserToList(user) {
    const userItem = document.createElement('div');
    userItem.className = 'chat__user';
    userItem.textContent = user.name; // Имя пользователя  
    userItem.dataset.id = user.id; // Сохраняем ID для удаления  
    this.chatUserlist.appendChild(userItem);
  }

  removeUserFromList(user) {
    const userItem = this.chatUserlist.querySelector(`.chat__user[data-id="${user.id}"]`);
    if (userItem) {
      this.chatUserlist.removeChild(userItem);
    }
  }



  onEnterChatHandler() {
    const message = this.messageInput.value;
    if (message) {
      this.sendMessage(message);
      this.messageInput.value = ''; // Очищаем поле ввода  
    }
  }

  // async sendMessage(message) {
  //   try {
  //     this.messages.push(message);
  //     await this.ws.send(JSON.stringify({ type: 'send', text: message }));
  //     console.log('chat text:', message);
  //     // await this.api.sendMessage({ text: message }); // Отправка сообщения через API  
  //     // Вызываем fetchMessages только если вам нужно обновлять состояние 
  //     // this.fetchMessages(); // Обновляем список сообщений после отправки  
  //   } catch (error) {
  //     console.error('Ошибка при отправке сообщения: ' + error);
  //   }
  // }
  // второй sendMessage
  async sendMessage(message) {
    try {
      const msgObj = {
        type: 'send',
        message: message,
        user: {
          name: this.myUserName // Здесь нужно хранить имя пользователя  
        }
      };
      this.ws.send(JSON.stringify(msgObj));
    } catch (error) {
      console.error('Ошибка при отправке сообщения: ' + error);
    }
  }

  renderMessages() {
    // Рендерим пришедшие сообщения  
    //this.chat.innerHTML = ''; // Очищаем контейнер  
    this.messages.forEach(msg => {
      const msgConteiner = document.createElement('div');
      msgConteiner.className = 'message__container';

      const msgHeader = document.createElement('div');
      msgHeader.className = 'message__header';
      msgHeader.textContent = 'User 1';

      const msgText = document.createElement('div');
      msgText.className = 'message__container-yourself';
      msgText.textContent = msg.text;

      msgConteiner.appendChild(msgHeader);
      msgConteiner.appendChild(msgText);
      this.chat.appendChild(msgConteiner);
    });
  }
}