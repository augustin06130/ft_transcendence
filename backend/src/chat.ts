import { FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import { Database } from 'sqlite3';
import { saveMessage, getConversationMessages } from './db'; // Assurez-vous d'ajouter ces fonctions à db.ts

// Stockage des connexions WebSocket actives
const activeConnections: Map<string, Set<WebSocket>> = new Map();

// Add these interfaces
interface ChatMessage {
    type: string;
    [key: string]: any;
  }

  interface SendMessageData extends ChatMessage {
    type: 'send_message';
    receiver: string;
    message: string;
  }

  interface LoadConversationData extends ChatMessage {
    type: 'load_conversation';
    target: string;
  }

  // Improved session validation
  function validateSession(request: FastifyRequest): string {
    const username = request.session.username;
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid session');
    }
    return username;
  }

export function setupChatWebSocket(socket: WebSocket, request: FastifyRequest, db: Database) {
    const username = request.session.username;
    if (!username) {
        socket.send(JSON.stringify({
            type: 'error',
            message: 'Vous devez être connecté'
        }));
        socket.close();
        return;
    }

    // Ajouter la connexion aux connexions actives
    if (!activeConnections.has(username)) {
        activeConnections.set(username, new Set());
    }
    activeConnections.get(username)?.add(socket);

    socket.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'send_message':
                    await handleSendMessage(username, data, db);
                    break;

                case 'load_conversation':
                    await handleLoadConversation(username, data, socket, db);
                    break;
            }
        } catch (error) {
            console.error('Erreur de traitement du message:', error);
            socket.send(JSON.stringify({
                type: 'error',
                message: 'Erreur de traitement du message'
            }));
        }
    });

    socket.on('close', () => {
        // Supprimer la connexion des connexions actives
        const userConnections = activeConnections.get(username);
        if (userConnections) {
            userConnections.delete(socket);
            if (userConnections.size === 0) {
                activeConnections.delete(username);
            }
        }
    });
}

  // Improved message handling
    async function handleSendMessage(
        senderUsername: string,
        data: SendMessageData,
        db: Database
    ) {
        // Validate message content
        if (!data.message || data.message.length > 1000) {
        throw new Error('Invalid message content');
        }
    const { receiver, message } = data;

    // Récupérer les ID des utilisateurs
    const [senderId, receiverId] = await Promise.all([
        getUserIdByUsername(senderUsername, db),
        getUserIdByUsername(receiver, db)
    ]);

    if (!senderId || !receiverId) {
        throw new Error('Utilisateur invalide');
    }

    // Sauvegarder le message en base de données
    const messageId = await saveMessage(db, senderId, receiverId, message);

    // Envoyer le message au destinataire s'il est connecté
    const receiverConnections = activeConnections.get(receiver);
    if (receiverConnections) {
        const messagePayload = JSON.stringify({
            type: 'new_message',
            sender: senderUsername,
            message: message,
            timestamp: new Date().toISOString()
        });

        receiverConnections.forEach(socket => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(messagePayload);
            }
        });
    }
}

async function handleLoadConversation(
    currentUsername: string,
    data: any,
    socket: WebSocket,
    db: Database
) {
    const { target } = data;

    // Récupérer les ID des utilisateurs
    const [currentUserId, targetUserId] = await Promise.all([
        getUserIdByUsername(currentUsername, db),
        getUserIdByUsername(target, db)
    ]);

    if (!currentUserId || !targetUserId) {
        throw new Error('Utilisateur invalide');
    }

    // Charger l'historique des messages
    const messages = await getConversationMessages(
        db,
        currentUserId,
        targetUserId
    );

    // Envoyer l'historique au client
    socket.send(JSON.stringify({
        type: 'conversation_loaded',
        messages: messages
    }));
}

// Fonction utilitaire pour récupérer l'ID d'un utilisateur par son nom
// Fonction utilitaire corrigée pour TypeScript
async function getUserIdByUsername(username: string, db: Database): Promise<number | null> {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT id FROM users WHERE username = ?',
            [username],
            (err, row: { id?: number } | undefined) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row?.id ?? null);
                }
            }
        );
    });
}
