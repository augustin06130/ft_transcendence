import { FastifyRequest } from 'fastify';
import { WebSocket } from 'ws';
import { Database } from 'sqlite3';
import { saveMessage, getConversationMessages } from './db';

// Déclarez une interface pour les données des messages
interface ChatMessage {
    type: string;
    [key: string]: any;
}

// Stockage des connexions WebSocket actives
const activeConnections: Map<string, Set<WebSocket>> = new Map();

export function setupChatWebSocket(socket: WebSocket, request: FastifyRequest, db: Database) {
    const username = request.session.username;
    if (!username) {
        socket.send(JSON.stringify({
            type: 'error',
            message: 'Authentication required'
        }));
        socket.close();
        return;
    }

    console.log(`Nouvelle connexion WebSocket pour l'utilisateur: ${username}`);

    // Ajouter la connexion aux connexions actives
    if (!activeConnections.has(username)) {
		activeConnections.set(username, new Set());
    }
    activeConnections.get(username)?.add(socket);

    // Envoyer la liste des utilisateurs en ligne
    sendOnlineUsers(socket);

    socket.on('message', async (message: Buffer) => {
		try {
			const data = JSON.parse(message.toString());
            console.log(`Message reçu de ${username}:`, data);

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
				console.log(`Connexion WebSocket fermée pour l'utilisateur: ${username}`);
				// Supprimer la connexion des connexions actives
				const userConnections = activeConnections.get(username);
				if (userConnections) {
					userConnections.delete(socket);
					if (userConnections.size === 0) {
						activeConnections.delete(username);
					}
				}
				// Informer les autres utilisateurs du changement de statut
				broadcastUserStatus();
			});

			// Informer les autres utilisateurs qu'un nouvel utilisateur est en ligne
			broadcastUserStatus();
		}

async function handleSendMessage(
	senderUsername: string,
    data: ChatMessage,
    db: Database
) {
	const { receiver, message } = data;

    if (!receiver || !message) {
		throw new Error('Destinataire ou message manquant');
    }

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

    // Confirmer au sender que le message a été envoyé
    const senderConnections = activeConnections.get(senderUsername);
    if (senderConnections) {
		const confirmationPayload = JSON.stringify({
			type: 'message_sent',
            receiver: receiver,
            message: message,
            timestamp: new Date().toISOString()
        });

        senderConnections.forEach(socket => {
			if (socket.readyState === WebSocket.OPEN) {
				socket.send(confirmationPayload);
            }
        });
    }
}

async function handleLoadConversation(
	currentUsername: string,
    data: ChatMessage,
    socket: WebSocket,
    db: Database
) {
	const { target } = data;

    if (!target) {
		throw new Error('Cible de conversation manquante');
    }

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

function sendOnlineUsers(socket: WebSocket) {
	const onlineUsers = Array.from(activeConnections.keys());
    socket.send(JSON.stringify({
		type: 'online_users',
        users: onlineUsers
    }));
}

function broadcastUserStatus() {
	const onlineUsers = Array.from(activeConnections.keys());
    const statusUpdate = JSON.stringify({
		type: 'user_status_update',
        onlineUsers: onlineUsers
    });

    // Envoyer la mise à jour à tous les utilisateurs connectés
    for (const connections of activeConnections.values()) {
		for (const socket of connections) {
			if (socket.readyState === WebSocket.OPEN) {
				socket.send(statusUpdate);
            }
        }
    }
}

// Fonction utilitaire pour récupérer l'ID d'un utilisateur par son nom
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

