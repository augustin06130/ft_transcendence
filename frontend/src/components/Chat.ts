
import { div, h2, p, button, input, ul, li, span, form, h3 } from "@framework/tags"; // Adjust this according to your custom framework imports
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

const mockFriends:Friend[] = [
  { id: "1", name: "system_admin", online: true },
  { id: "2", name: "neural_net", online: true },
  { id: "3", name: "quantum_user", online: false, lastSeen: "2 hours ago" },
  { id: "4", name: "cyber_alice", online: true },
  { id: "5", name: "data_miner", online: false, lastSeen: "1 day ago" },
  { id: "6", name: "binary_bob", online: false, lastSeen: "3 days ago" },
  { id: "7", name: "crypto_charlie", online: true },
  { id: "8", name: "matrix_dave", online: false, lastSeen: "5 hours ago" },
];

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
};

function mockMessages(friend:Friend, currentUserId:string ) {
    const mockMessages = [];

    if (friend.id === "1") {
      mockMessages.push({
        id: "101",
        senderId: "1",
        receiverId: currentUserId,
        text: "Welcome to the system. How can I assist you today?",
        timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      });
      mockMessages.push({
        id: "102",
        senderId: currentUserId,
        receiverId: "1",
        text: "I need help accessing the quantum database.",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      });
      mockMessages.push({
        id: "103",
        senderId: "1",
        receiverId: currentUserId,
        text: "You need level 3 clearance for that. I've updated your permissions.",
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      });
    } else if (friend.id === "4") {
      mockMessages.push({
        id: "201",
        senderId: "4",
        receiverId: currentUserId,
        text: "Did you see the new security protocol?",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
      });
      mockMessages.push({
        id: "202",
        senderId: currentUserId,
        receiverId: "4",
        text: "Not yet. Is it important?",
        timestamp: new Date(Date.now() - 82800000), // 23 hours ago
      });
      mockMessages.push({
        id: "203",
        senderId: "4",
        receiverId: currentUserId,
        text: "Very. All systems are being upgraded tonight.",
        timestamp: new Date(Date.now() - 79200000), // 22 hours ago
      });
      mockMessages.push({
        id: "204",
        senderId: currentUserId,
        receiverId: "4",
        text: "Thanks for the heads up. I'll prepare my modules.",
        timestamp: new Date(Date.now() - 75600000), // 21 hours ago
      });
    } else {
      mockMessages.push({
        id: `${friend.id}01`,
        senderId: friend.id,
        receiverId: currentUserId,
        text: `Hello, this is ${friend.name}. How are you?`,
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
      });
      mockMessages.push({
        id: `${friend.id}02`,
        senderId: currentUserId,
        receiverId: friend.id,
        text: "I'm doing well, thanks for asking!",
        timestamp: new Date(Date.now() - 82800000), // 23 hours ago
      });
    }
    return mockMessages
}

export default class ChatPage {
  friends:Friend[];
  selectedFriend: Friend | null;
  currentUserId:string;
  messages:Message[];
  newMessage:string;

  constructor() {
    this.friends = mockFriends
    this.currentUserId = "current_user";
    this.selectedFriend = null;
    this.messages = [];
    this.newMessage = "";

    this.messagesEndRef = null; // This will be set in render
  }

  selectFriend(friend:Friend) {
    this.selectedFriend = friend;
    this.messages = mockMessages(friend, this.currentUserId);
    const el = document.getElementById("renderChatArea")
    el?.replaceChildren(this.renderChatArea())
  }

  sendMessage(e:Event) {
    e.preventDefault();

    if (!this.newMessage.trim() || !this.selectedFriend) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: this.currentUserId,
      receiverId: this.selectedFriend.id,
      text: this.newMessage,
      timestamp: new Date(),
    };

    this.messages = [...this.messages, newMsg];
    this.newMessage = "";

    // Simulate a reply after a delay for online friends
    if (this.selectedFriend.online) {
      setTimeout(() => {
        const replyMsg = {
          id: `reply_${Date.now()}`,
          senderId: this.selectedFriend.id,
          receiverId: this.currentUserId,
          text: this.getAutoReply(this.selectedFriend.name),
          timestamp: new Date(),
        };
        this.messages = [...this.messages, replyMsg];
        this.updateUI();
      }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
    }
  }

  getAutoReply(name:string) {
    const replies = [
      `This is ${name}. I received your message.`,
      "Interesting. Tell me more.",
      "I understand. Let me process that.",
      "Affirmative. Continuing protocol.",
      "Message received. Standing by for further instructions.",
      "Acknowledged. Proceeding with operation.",
      "Data received. Processing...",
      "Input accepted. What is your next command?",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  formatTime(date:Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  render() {
    return  div({ className: "mx-auto" },
      div({ className: "border border-green-500/30 rounded bg-black/80 shadow-lg shadow-green-500/10 flex flex-col md:flex-row h-[calc(100vh-12rem)]" },
        this.renderChatArea(),
        this.renderFriendsList()
      )
    );
  }

  renderChatArea() {
    return div({ id: "renderChatArea", className: "flex-1 flex flex-col border-r border-green-500/30" },
      this.renderChatHeader(),
      this.renderMessagesArea(),
      this.renderMessageInput()
    );
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
    const selectedFriend = div({ className: "h-full flex flex-col items-center justify-center text-green-500/50" },
      // Terminal({ className: "h-12 w-12 mb-4" }),
      TerminalIconSVG,
      p("Select a user to start chatting")
    );

    const lst = this.messages.map(message => (
      div({ id: message.id, className: `flex ${message.senderId === this.currentUserId ? "justify-end" : "justify-start"}` },
        div({ className: `max-w-[80%] p-2 rounded ${message.senderId === this.currentUserId ? "bg-green-500/20 border border-green-500/30" : "bg-black border border-green-500/30"}` },
          div({ className: "flex items-center gap-2 mb-1" },
            span({ className: "text-xs font-bold" }, 
              message.senderId === this.currentUserId ? "YOU" : this.selectedFriend?.name),
            span({ className: "text-xs text-green-500/50 flex items-center gap-1" },
              // Clock({ className: "h-3 w-3" }),
              ClockIconSVG,
              this.formatTime(message.timestamp)
            ),
          ),
          p({ className: "text-sm" }, message.text)
        )
      ))
    )

    const notSelectedFriend = div({},
      div({ className: "text-center text-green-500/50 text-xs border-b border-green-500/20 pb-2" },
        p(`Beginning of conversation with ${this.selectedFriend?.name}`),
        p("Encryption: Enabled • Channel: Secure")
      ),
      ...lst,
      // div({ ref: (el) => { this.messagesEndRef = el; } })
       // Auto-scroll anchor
    )

    return div({ className: "flex-1 overflow-y-auto p-4 space-y-4" },
      !this.selectedFriend ? selectedFriend : notSelectedFriend
    );
  }

  renderMessageInput() {
    return this.selectedFriend && div({ className: "p-4 border-t border-green-500/30" },
      form({ onsubmit: (e:Event) => this.sendMessage(e), className: "flex items-center gap-2" },
        div({ className: "flex-1 flex items-center border border-green-500/30 rounded bg-black/50" },
          span({ className: "text-green-500/70 pl-3" }, "$"),
          input({
            type: "text",
            value: this.newMessage,
            onchange: (e) => { 
              this.newMessage = (e.target as any)?.value;
              this.updateUI(); 
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
          // Send({ className: "h-5 w-5" })
          SendIconSVG,
        )
      )
    );
  }

  renderFriendsList() {
    return div({ className: "w-full md:w-64 border-t md:border-t-0 border-green-500/30 md:h-full overflow-y-auto" },
      div({ className: "p-4 border-b border-green-500/30" },
        h2({ className: "text-sm font-bold flex items-center gap-2" },
          // UserIconSVG({ className: "h-4 w-4" }),
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

  renderOnlineFriends() {
    const lstFriend = this.friends.filter(f => f.online).map(friend => (
      li({ id: friend.id },
        button({
          onclick: () => this.selectFriend(friend),
          className: `w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-green-500/10 transition ${this.selectedFriend?.id === friend.id ? "bg-green-500/20" : ""}`
        },
          // Circle({ className: "h-2 w-2 fill-green-500 text-green-500" }),
          CircleIconSVG,
          span({}, friend.name)
        )
      )
    ))

    return div({ className: "mb-4" },
      h3({ className: "text-xs text-green-500/70 px-2 py-1" }, "ONLINE"),
      ul({ className: "space-y-1" },
        ...lstFriend
      )
    );
  }

  renderOfflineFriends() {
    const lstFriend = this.friends.filter(f => !f.online).map(friend => (
      li({ id: friend.id },
        button({
          onclick: () => this.selectFriend(friend),
          className: `w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-green-500/10 transition text-green-500/50 ${this.selectedFriend?.id === friend.id ? "bg-green-500/10" : ""}`
        },
          // Circle({ className: "h-2 w-2 text-green-500/40" }),
          CircleIconSVG,
          span({}, friend.name),
          friend.lastSeen && span({ className: "text-xs text-green-500/30 ml-auto" }, friend.lastSeen)
        )
      )
    ))

    return div({ className: "mb-4" },
      h3({ className: "text-xs text-green-500/40 px-2 py-1" }, "OFFLINE"),
      ul({ className: "space-y-1" },
        ...lstFriend
      )
    );
  }
}
