
// import { div, h2, p, button, input, ul, li, span, form, h3 } from "@framework/tags"; // Adjust this according to your custom framework imports
// import { UserIconSVG } from "@Icon/User";
// import { CircleIconSVG } from "@Icon/Circle";
// import { SendIconSVG } from "@Icon/Send";
// import { TerminalIconSVG } from "@Icon/Terminal";
// import { ClockIconSVG } from "@Icon/Clock";

// // Types
// type Friend = {
//   id: string;
//   name: string;
//   online: boolean;
//   lastSeen?: string;
// };

// const mockFriends:Friend[] = [
//   { id: "1", name: "system_admin", online: true },
//   { id: "2", name: "neural_net", online: true },
//   { id: "3", name: "quantum_user", online: false, lastSeen: "2 hours ago" },
//   { id: "4", name: "cyber_alice", online: true },
//   { id: "5", name: "data_miner", online: false, lastSeen: "1 day ago" },
//   { id: "6", name: "binary_bob", online: false, lastSeen: "3 days ago" },
//   { id: "7", name: "crypto_charlie", online: true },
//   { id: "8", name: "matrix_dave", online: false, lastSeen: "5 hours ago" },
// ];

// type Message = {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   text: string;
//   timestamp: Date;
// };

// function mockMessages(friend:Friend, currentUserId:string ) {
//     const mockMessages = [];

//     if (friend.id === "1") {
//       mockMessages.push({
//         id: "101",
//         senderId: "1",
//         receiverId: currentUserId,
//         text: "Welcome to the system. How can I assist you today?",
//         timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
//       });
//       mockMessages.push({
//         id: "102",
//         senderId: currentUserId,
//         receiverId: "1",
//         text: "I need help accessing the quantum database.",
//         timestamp: new Date(Date.now() - 3600000), // 1 hour ago
//       });
//       mockMessages.push({
//         id: "103",
//         senderId: "1",
//         receiverId: currentUserId,
//         text: "You need level 3 clearance for that. I've updated your permissions.",
//         timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
//       });
//     } else if (friend.id === "4") {
//       mockMessages.push({
//         id: "201",
//         senderId: "4",
//         receiverId: currentUserId,
//         text: "Did you see the new security protocol?",
//         timestamp: new Date(Date.now() - 86400000), // 1 day ago
//       });
//       mockMessages.push({
//         id: "202",
//         senderId: currentUserId,
//         receiverId: "4",
//         text: "Not yet. Is it important?",
//         timestamp: new Date(Date.now() - 82800000), // 23 hours ago
//       });
//       mockMessages.push({
//         id: "203",
//         senderId: "4",
//         receiverId: currentUserId,
//         text: "Very. All systems are being upgraded tonight.",
//         timestamp: new Date(Date.now() - 79200000), // 22 hours ago
//       });
//       mockMessages.push({
//         id: "204",
//         senderId: currentUserId,
//         receiverId: "4",
//         text: "Thanks for the heads up. I'll prepare my modules.",
//         timestamp: new Date(Date.now() - 75600000), // 21 hours ago
//       });
//     } else {
//       mockMessages.push({
//         id: `${friend.id}01`,
//         senderId: friend.id,
//         receiverId: currentUserId,
//         text: `Hello, this is ${friend.name}. How are you?`,
//         timestamp: new Date(Date.now() - 86400000), // 1 day ago
//       });
//       mockMessages.push({
//         id: `${friend.id}02`,
//         senderId: currentUserId,
//         receiverId: friend.id,
//         text: "I'm doing well, thanks for asking!",
//         timestamp: new Date(Date.now() - 82800000), // 23 hours ago
//       });
//     }
//     return mockMessages
// }

// export default class ChatPage {
//   friends:Friend[];
//   selectedFriend: Friend | null;
//   currentUserId:string;
//   messages:Message[];
//   newMessage:string;
//   private socket: WebSocket | null = null;

//   constructor() {
//     this.friends = mockFriends
//     this.currentUserId = "current_user";
//     this.selectedFriend = null;
//     this.messages = [];
//     this.newMessage = "";

//     this.initWebSocket();

//     // this.messagesEndRef = null; // This will be set in render
//   }

//   private initWebSocket() {
//     this.socket = new WebSocket('ws://votre-url-websocket/chat');

//     this.socket.onopen = () => {
//       console.log('Connexion WebSocket établie');
//     };

//     this.socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);

//       switch (data.type) {
//         case 'new_message':
//           this.handleNewMessage(data);
//           break;
//         case 'conversation_loaded':
//           this.handleConversationLoaded(data.messages);
//           break;
//         case 'error':
//           console.error('Erreur WebSocket:', data.message);
//           break;
//       }
//     };

//     this.socket.onerror = (error) => {
//       console.error('Erreur WebSocket:', error);
//     };

//     this.socket.onclose = () => {
//       console.log('Connexion WebSocket fermée');
//       // Optionnel : tentative de reconnexion
//       setTimeout(() => this.initWebSocket(), 5000);
//     };
//   }

//   private handleNewMessage(messageData: any) {
//     if (this.selectedFriend && messageData.sender === this.selectedFriend.name) {
//       const newMessage = {
//         id: `msg_${Date.now()}`,
//         senderId: messageData.sender,
//         receiverId: this.currentUserId,
//         text: messageData.message,
//         timestamp: new Date(messageData.timestamp)
//       };

//       this.messages = [...this.messages, newMessage];
//       this.updateUI();
//     }
//   }

//   private handleConversationLoaded(messages: any[]) {
//     this.messages = messages.map(msg => ({
//       id: msg.id.toString(),
//       senderId: msg.sender_username,
//       receiverId: msg.receiver_username,
//       text: msg.content,
//       timestamp: new Date(msg.timestamp)
//     }));
//     this.updateUI();
//   }

//   selectFriend(friend: Friend) {
//     this.selectedFriend = friend;

//     // Charger l'historique de la conversation via WebSocket
//     if (this.socket) {
//       this.socket.send(JSON.stringify({
//         type: 'load_conversation',
//         target: friend.name
//       }));
//     }

//     const el = document.getElementById("renderChatArea")
//     el?.replaceChildren(this.renderChatArea())
//   }

//   sendMessage(e: Event) {
//     e.preventDefault();

//     if (!this.newMessage.trim() || !this.selectedFriend || !this.socket) return;

//     // Envoyer le message via WebSocket
//     this.socket.send(JSON.stringify({
//       type: 'send_message',
//       receiver: this.selectedFriend.name,
//       message: this.newMessage
//     }));

//     const newMsg = {
//       id: `msg_${Date.now()}`,
//       senderId: this.currentUserId,
//       receiverId: this.selectedFriend.id,
//       text: this.newMessage,
//       timestamp: new Date(),
//     };

//     this.messages = [...this.messages, newMsg];
//     this.newMessage = "";
//     this.updateUI();
//   }

//   // Méthode utilitaire pour mettre à jour l'UI
//   private updateUI() {
//     const el = document.getElementById("renderChatArea")
//     if (el) {
//       el.replaceChildren(this.renderChatArea());
//     }
//   }

//   getAutoReply(name:string) {
//     const replies = [
//       `This is ${name}. I received your message.`,
//       "Interesting. Tell me more.",
//       "I understand. Let me process that.",
//       "Affirmative. Continuing protocol.",
//       "Message received. Standing by for further instructions.",
//       "Acknowledged. Proceeding with operation.",
//       "Data received. Processing...",
//       "Input accepted. What is your next command?",
//     ];
//     return replies[Math.floor(Math.random() * replies.length)];
//   }

//   formatTime(date:Date) {
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   }

//   render() {
//     return  div({ className: "mx-auto" },
//       div({ className: "border border-green-500/30 rounded bg-black/80 shadow-lg shadow-green-500/10 flex flex-col md:flex-row h-[calc(100vh-12rem)]" },
//         this.renderChatArea(),
//         this.renderFriendsList()
//       )
//     );
//   }

//   renderChatArea() {
//     return div({ id: "renderChatArea", className: "flex-1 flex flex-col border-r border-green-500/30" },
//       this.renderChatHeader(),
//       this.renderMessagesArea(),
//       this.renderMessageInput()
//     );
//   }

//   renderChatHeader() {
//     return div({ className: "p-4 border-b border-green-500/30 flex items-center gap-2" },
//       div({ className: "h-3 w-3 rounded-full bg-green-500" }),
//       p({ className: "text-xs" }, "terminal@user:~/chat"),
//       this.selectedFriend && p({ className: "ml-4 text-sm" },
//         span({ className: "text-green-400/70" }, "ACTIVE CHANNEL:"),
//         ` ${this.selectedFriend.name}`
//       )
//     );
//   }

//   renderMessagesArea() {
//     const selectedFriend = div({ className: "h-full flex flex-col items-center justify-center text-green-500/50" },
//       // Terminal({ className: "h-12 w-12 mb-4" }),
//       TerminalIconSVG,
//       p("Select a user to start chatting")
//     );

//     const lst = this.messages.map(message => (
//       div({ id: message.id, className: `flex ${message.senderId === this.currentUserId ? "justify-end" : "justify-start"}` },
//         div({ className: `max-w-[80%] p-2 rounded ${message.senderId === this.currentUserId ? "bg-green-500/20 border border-green-500/30" : "bg-black border border-green-500/30"}` },
//           div({ className: "flex items-center gap-2 mb-1" },
//             span({ className: "text-xs font-bold" },
//               message.senderId === this.currentUserId ? "YOU" : this.selectedFriend?.name),
//             span({ className: "text-xs text-green-500/50 flex items-center gap-1" },
//               // Clock({ className: "h-3 w-3" }),
//               ClockIconSVG,
//               this.formatTime(message.timestamp)
//             ),
//           ),
//           p({ className: "text-sm" }, message.text)
//         )
//       ))
//     )

//     const notSelectedFriend = div({},
//       div({ className: "text-center text-green-500/50 text-xs border-b border-green-500/20 pb-2" },
//         p(`Beginning of conversation with ${this.selectedFriend?.name}`),
//         p("Encryption: Enabled • Channel: Secure")
//       ),
//       ...lst,
//       // div({ ref: (el) => { this.messagesEndRef = el; } })
//        // Auto-scroll anchor
//     )

//     return div({ className: "flex-1 overflow-y-auto p-4 space-y-4" },
//       !this.selectedFriend ? selectedFriend : notSelectedFriend
//     );
//   }

//   renderMessageInput() {
//     return this.selectedFriend && div({ className: "p-4 border-t border-green-500/30" },
//       form({ onsubmit: (e:Event) => this.sendMessage(e), className: "flex items-center gap-2" },
//         div({ className: "flex-1 flex items-center border border-green-500/30 rounded bg-black/50" },
//           span({ className: "text-green-500/70 pl-3" }, "$"),
//           input({
//             type: "text",
//             value: this.newMessage,
//             onchange: (e) => {
//               this.newMessage = (e.target as any)?.value;
//               this.updateUI();
//             },
//             placeholder: "Type your message...",
//             className: "w-full bg-transparent border-none outline-none p-2 text-green-500 placeholder-green-500/30"
//           })
//         ),
//         button({
//           type: "submit",
//           className: "p-2 border border-green-500/30 rounded hover:bg-green-500/20 transition",
//           disabled: !this.newMessage.trim()
//         },
//           // Send({ className: "h-5 w-5" })
//           SendIconSVG,
//         )
//       )
//     );
//   }

//   renderFriendsList() {
//     return div({ className: "w-full md:w-64 border-t md:border-t-0 border-green-500/30 md:h-full overflow-y-auto" },
//       div({ className: "p-4 border-b border-green-500/30" },
//         h2({ className: "text-sm font-bold flex items-center gap-2" },
//           // UserIconSVG({ className: "h-4 w-4" }),
//           UserIconSVG,
//           span({}, "CONTACTS")
//         )
//       ),
//       div({ className: "p-2" },
//         this.renderOnlineFriends(),
//         this.renderOfflineFriends()
//       )
//     );
//   }

//   renderOnlineFriends() {
//     const lstFriend = this.friends.filter(f => f.online).map(friend => (
//       li({ id: friend.id },
//         button({
//           onclick: () => this.selectFriend(friend),
//           className: `w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-green-500/10 transition ${this.selectedFriend?.id === friend.id ? "bg-green-500/20" : ""}`
//         },
//           // Circle({ className: "h-2 w-2 fill-green-500 text-green-500" }),
//           CircleIconSVG,
//           span({}, friend.name)
//         )
//       )
//     ))

//     return div({ className: "mb-4" },
//       h3({ className: "text-xs text-green-500/70 px-2 py-1" }, "ONLINE"),
//       ul({ className: "space-y-1" },
//         ...lstFriend
//       )
//     );
//   }

//   renderOfflineFriends() {
//     const lstFriend = this.friends.filter(f => !f.online).map(friend => (
//       li({ id: friend.id },
//         button({
//           onclick: () => this.selectFriend(friend),
//           className: `w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-green-500/10 transition text-green-500/50 ${this.selectedFriend?.id === friend.id ? "bg-green-500/10" : ""}`
//         },
//           // Circle({ className: "h-2 w-2 text-green-500/40" }),
//           CircleIconSVG,
//           span({}, friend.name),
//           friend.lastSeen && span({ className: "text-xs text-green-500/30 ml-auto" }, friend.lastSeen)
//         )
//       )
//     ))

//     return div({ className: "mb-4" },
//       h3({ className: "text-xs text-green-500/40 px-2 py-1" }, "OFFLINE"),
//       ul({ className: "space-y-1" },
//         ...lstFriend
//       )
//     );
//   }
// }




import { div, h2, p, button, input, ul, li, span, form, h3 } from "@framework/tags";
import { UserIconSVG } from "@Icon/User";
import { CircleIconSVG } from "@Icon/Circle";
import { SendIconSVG } from "@Icon/Send";
import { TerminalIconSVG } from "@Icon/Terminal";
import { ClockIconSVG } from "@Icon/Clock";

// Types
type Friend = {
  id: string;
  name: string;
  online: boolean;
  lastSeen?: string;
};

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
};
  type WSMessage =
    | { type: 'new_message', sender: string, message: string, timestamp: string }
    | { type: 'conversation_loaded', messages: any[] }
    | { type: 'user_status_update', onlineUsers: string[] }
    | { type: 'online_users', users: string[] }
    | { type: 'error', message: string };

export default class ChatPage {
  friends: Friend[];
  selectedFriend: Friend | null;
  currentUserId: string;
  currentUsername: string;
  messages: Message[];
  newMessage: string;
  private socket: WebSocket | null = null;
  private authToken: string;

  constructor() {
    this.friends = [];
    this.currentUserId = "current_user";
    this.currentUsername = ""; // Sera défini lors de la connexion
    this.selectedFriend = null;
    this.messages = [];
    this.newMessage = "";

    // Récupérer l'utilisateur actuel depuis le session storage ou le contexte
    this.getCurrentUser();

    this.authToken = localStorage.getItem('authToken') || '';
    if (!this.authToken) {
      throw new Error('Utilisateur non authentifié');
    }
    this.initWebSocket();
  }

  private getCurrentUser() {
    // Cette méthode peut être adaptée selon votre gestion d'authentification
    // Par exemple, récupérer depuis un cookie ou sessionStorage
    try {
      const storedUsername = sessionStorage.getItem('username');
      if (storedUsername) {
        this.currentUsername = storedUsername;
      } else {
        console.error("Nom d'utilisateur non trouvé dans la session");
      }
    } catch (e) {
      console.error("Erreur lors de la récupération de l'utilisateur:", e);
    }
  }


  private initWebSocket() {
      // Récupérer le token JWT depuis le stockage local
      const token = localStorage.getItem('authToken');
      if (!token) {
          console.error('No authentication token found');
          return;
      }

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Utilisez le host actuel pour la connexion WebSocket
      // const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const connect = (attempt = 0) => {
        const maxDelay = 30000; // 30s max delay
        const delay = Math.min(1000 * Math.pow(2, attempt), maxDelay);

      this.socket = new WebSocket(
        `${wsProtocol}//${window.location.host}/chat-ws`,
        [this.authToken]
      );

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        // Resubscribe to current conversation if any
        if (this.selectedFriend) {
          this.loadConversation(this.selectedFriend);
        }
      };

      this.socket.onclose = () => {
        console.log(`WebSocket closed. Reconnecting in ${delay/1000}s...`);
        setTimeout(() => connect(attempt + 1), delay);
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Message WebSocket reçu:', data);

        switch (data.type) {
          case 'new_message':
            this.handleNewMessage(data);
            break;
          case 'conversation_loaded':
            this.handleConversationLoaded(data.messages);
            break;
          case 'user_status_update':
            this.handleUserStatusUpdate(data.onlineUsers);
            break;
          case 'online_users':
            this.handleOnlineUsers(data.users);
            break;
          case 'error':
            console.error('Erreur WebSocket:', data.message);
            break;
        }
      };

      this.socket.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

      this.socket.onclose = () => {
        console.log('Connexion WebSocket fermée');
        // Tentative de reconnexion après un délai
        setTimeout(() => connect(attempt + 1), delay);
      };
    };

    connect();
  }

  private handleNewMessage(messageData: any) {
    // Vérifier si le message provient de l'ami sélectionné ou est destiné à l'utilisateur actuel
    const senderFriend = this.findFriendByName(messageData.sender);

    if (senderFriend) {
      // Mettre à jour la liste des messages si c'est l'ami sélectionné
      if (this.selectedFriend && messageData.sender === this.selectedFriend.name) {
        const newMessage = {
          id: `msg_${Date.now()}`,
          senderId: messageData.sender,
          receiverId: this.currentUsername,
          text: messageData.message,
          timestamp: new Date(messageData.timestamp)
        };

        this.messages = [...this.messages, newMessage];
        this.updateUI();
      }
    }
  }

  private handleConversationLoaded(messages: any[]) {
    this.messages = messages.map(msg => ({
      id: msg.id.toString(),
      senderId: msg.sender_username,
      receiverId: msg.receiver_username,
      text: msg.content,
      timestamp: new Date(msg.timestamp)
    }));
    this.updateUI();
  }

  private handleUserStatusUpdate(onlineUsers: string[]) {
    // Mettre à jour le statut de tous les amis
    this.friends.forEach(friend => {
      const isOnline = onlineUsers.includes(friend.name);
      friend.online = isOnline;
      if (!isOnline && !friend.lastSeen) {
        friend.lastSeen = 'Just now';
      }
    });
    this.updateUI();
  }

  private handleOnlineUsers(users: string[]) {
    // Convertir les utilisateurs en ligne en amis
    const updatedFriends: Friend[] = users
      .filter(username => username !== this.currentUsername) // Exclure l'utilisateur actuel
      .map(username => {
        // Vérifier si cet ami existe déjà
        const existingFriend = this.friends.find(f => f.name === username);
        if (existingFriend) {
          existingFriend.online = true;
          return existingFriend;
        }
        // Sinon, créer un nouvel ami
        return {
          id: `user_${username}`,
          name: username,
          online: true
        };
      });

    this.friends = updatedFriends;
    this.updateUI();
  }

  private findFriendByName(name: string): Friend | undefined {
    return this.friends.find(f => f.name === name);
  }

selectFriend(friend: Friend) {
  this.selectedFriend = friend;
  this.loadConversation(friend);
  this.scrollToBottom(); // Scroll after loading new conversation
  this.updateUI();
}

// Improved message sending
private async sendMessage(e: Event) {
  e.preventDefault();

  if (this.socket?.readyState === WebSocket.OPEN) {
    this.socket.send(JSON.stringify({
      ...e,
      token: this.authToken
    }));
  }


  if (!this.newMessage.trim() || !this.selectedFriend || !this.socket) return;

  try {
    const messageToSend = this.newMessage;
    this.newMessage = ""; // Clear input immediately for better UX

    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    const newMsg = {
      id: tempId,
      senderId: this.currentUsername,
      receiverId: this.selectedFriend.name,
      text: messageToSend,
      timestamp: new Date(),
    };

    this.messages = [...this.messages, newMsg];
    this.updateUI();

    // Actual send
    this.socket.send(JSON.stringify({
      type: 'send_message',
      receiver: this.selectedFriend.name,
      message: messageToSend
    }));

    // Scroll to bottom
    this.scrollToBottom();

  } catch (error) {
    console.error('Failed to send message:', error);
    // Show error to user
  }
}

  // Méthode utilitaire pour mettre à jour l'UI
  private updateUI() {
    const chatArea = document.getElementById("renderChatArea");
    if (chatArea) {
      chatArea.replaceChildren(this.renderChatArea());
    }

    const friendsList = document.getElementById("renderFriendsList");
    if (friendsList) {
      friendsList.replaceChildren(this.renderFriendsList());
    }
  }

  formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  private renderConnectionStatus() {
    const status = this.socket?.readyState;
    let text = '';
    let color = '';

    switch(status) {
      case WebSocket.OPEN:
        text = 'Connected';
        color = 'green';
        break;
      case WebSocket.CONNECTING:
        text = 'Connecting...';
        color = 'yellow';
        break;
      default:
        text = 'Disconnected';
        color = 'red';
    }

    return div({ className: `connection-status ${color}` }, text);
  }

  render() {
    return div({ className: "mx-auto" },
      this.renderConnectionStatus(),
      div({ className: "border border-green-500/30 rounded bg-black/80 shadow-lg shadow-green-500/10 flex flex-col md:flex-row h-[calc(100vh-12rem)]" },
        div({ id: "renderChatArea", className: "flex-1 flex flex-col border-r border-green-500/30" },
          this.renderChatArea()
        ),
        div({ id: "renderFriendsList", className: "w-full md:w-64 border-t md:border-t-0 border-green-500/30 md:h-full overflow-y-auto" },
          this.renderFriendsList()
        )
      )
    );
  }


renderChatArea() {
  return div({ className: "flex-1 flex flex-col border-r border-green-500/30" },
      this.renderChatHeader(),
      this.renderMessagesArea(),
      this.renderMessageInput()
  );
}

renderFriendsList() {
  return div({ className: "w-full md:w-64 border-t md:border-t-0 border-green-500/30 md:h-full overflow-y-auto" },
      div({ className: "p-4 border-b border-green-500/30" },
          h2({ className: "text-sm font-bold flex items-center gap-2" },
              UserIconSVG,
              span({}, "CONTACTS")
          )
      ),
      div({ className: "p-2" },
          this.renderOnlineFriends(),
          this.renderOfflineFriends()
      )
  );
}

private loadConversation(friend: Friend) {
  if (this.socket && this.socket.readyState === WebSocket.OPEN) {
    this.socket.send(JSON.stringify({
      type: 'load_conversation',
      target: friend.name
    }));
  }
}

private scrollToBottom() {
  const messagesEnd = document.getElementById("messagesEnd");
  messagesEnd?.scrollIntoView({ behavior: "smooth" });
}

// renderFriendsList() {
//   return [
//     div({ className: "p-4 border-b border-green-500/30" },
//       h2({ className: "text-sm font-bold flex items-center gap-2" },
//         UserIconSVG,
//         span({}, "CONTACTS")
//       )
//     ),
//     div({ className: "p-2" },
//       this.renderOnlineFriends(),
//       this.renderOfflineFriends()
//     )
//   ];
// }
private handleWebSocketError(error: any) {
  console.error('WebSocket error:', error);

  // Show user-friendly error message
  const chatArea = document.getElementById("renderChatArea");
  if (chatArea) {
    chatArea.innerHTML = '';
    chatArea.appendChild(
      div(
        { className: "error-message" },
        "Connection error. Reconnecting..."
      )
    );
  }
}

  renderChatHeader() {
    return div({ className: "p-4 border-b border-green-500/30 flex items-center gap-2" },
      div({ className: "h-3 w-3 rounded-full bg-green-500" }),
      p({ className: "text-xs" }, "terminal@user:~/chat"),
      this.selectedFriend && p({ className: "ml-4 text-sm" },
        span({ className: "text-green-400/70" }, "ACTIVE CHANNEL:"),
        ` ${this.selectedFriend.name}`
      )
    );
  }

  renderMessagesArea() {
    if (!this.selectedFriend) {
      return div({ className: "h-full flex flex-col items-center justify-center text-green-500/50" },
        TerminalIconSVG,
        p("Select a user to start chatting")
      );
    }

    const msgElements = this.messages.map(message => (
      div({ id: message.id, className: `flex ${message.senderId === this.currentUsername ? "justify-end" : "justify-start"}` },
        div({ className: `max-w-[80%] p-2 rounded ${message.senderId === this.currentUsername ? "bg-green-500/20 border border-green-500/30" : "bg-black border border-green-500/30"}` },
          div({ className: "flex items-center gap-2 mb-1" },
            span({ className: "text-xs font-bold" },
              message.senderId === this.currentUsername ? "YOU" : message.senderId),
            span({ className: "text-xs text-green-500/50 flex items-center gap-1" },
              ClockIconSVG,
              this.formatTime(message.timestamp)
            ),
          ),
          p({ className: "text-sm" }, message.text)
        )
      ))
    );

    return div({ className: "flex-1 overflow-y-auto p-4 space-y-4" },
      div({ className: "text-center text-green-500/50 text-xs border-b border-green-500/20 pb-2" },
        p(`Beginning of conversation with ${this.selectedFriend.name}`),
        p("Encryption: Enabled • Channel: Secure")
      ),
      ...msgElements,
      div({ id: "messagesEnd" })
    );
  }

  renderMessageInput() {
    if (!this.selectedFriend) return null;

    return div({ className: "p-4 border-t border-green-500/30" },
      form({ onsubmit: (e: Event) => this.sendMessage(e), className: "flex items-center gap-2" },
        div({ className: "flex-1 flex items-center border border-green-500/30 rounded bg-black/50" },
          span({ className: "text-green-500/70 pl-3" }, "$"),
          input({
            type: "text",
            value: this.newMessage,
            oninput: (e) => {
              this.newMessage = (e.target as HTMLInputElement).value;
            },
            placeholder: "Type your message...",
            className: "w-full bg-transparent border-none outline-none p-2 text-green-500 placeholder-green-500/30"
          })
        ),
        button({
          type: "submit",
          className: "p-2 border border-green-500/30 rounded hover:bg-green-500/20 transition",
          disabled: !this.newMessage.trim()
        },
          SendIconSVG
        )
      )
    );
  }


  renderOnlineFriends() {
    const onlineFriends = this.friends.filter(f => f.online);

    if (onlineFriends.length === 0) {
      return div({ className: "mb-4" },
        h3({ className: "text-xs text-green-500/70 px-2 py-1" }, "ONLINE"),
        p({ className: "text-xs text-green-500/40 italic px-2" }, "No users online")
      );
    }

    const friendItems = onlineFriends.map(friend => (
      li({ id: friend.id },
        button({
          onclick: () => this.selectFriend(friend),
          className: `w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-green-500/10 transition ${this.selectedFriend?.id === friend.id ? "bg-green-500/20" : ""}`
        },
          CircleIconSVG,
          span({}, friend.name)
        )
      )
    ));

    return div({ className: "mb-4" },
      h3({ className: "text-xs text-green-500/70 px-2 py-1" }, "ONLINE"),
      ul({ className: "space-y-1" },
        ...friendItems
      )
    );
  }

  renderOfflineFriends() {
    const offlineFriends = this.friends.filter(f => !f.online);

    if (offlineFriends.length === 0) {
      return null;
    }

    const friendItems = offlineFriends.map(friend => (
      li({ id: friend.id },
        button({
          onclick: () => this.selectFriend(friend),
          className: `w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-green-500/10 transition text-green-500/50 ${this.selectedFriend?.id === friend.id ? "bg-green-500/10" : ""}`
        },
          CircleIconSVG,
          span({}, friend.name),
          friend.lastSeen && span({ className: "text-xs text-green-500/30 ml-auto" }, friend.lastSeen)
        )
      )
    ));

    return div({ className: "mb-4" },
      h3({ className: "text-xs text-green-500/40 px-2 py-1" }, "OFFLINE"),
      ul({ className: "space-y-1" },
        ...friendItems
      )
    );
  }
}
