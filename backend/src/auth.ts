import jwt from 'jsonwebtoken';
import { FastifyRequest } from 'fastify';

// Définir une constante pour JWT_SECRET avec une assertion de non-nullité
const JWT_SECRET: string = process.env.JWT_SECRET || '';

interface JwtPayload {
  userId: number;
  username: string;
}

export function createAuthToken(userId: number, username: string): string {
  if (!userId || !username) {
    throw new Error('userId et username sont requis');
  }

  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    {
      expiresIn: '1h',
      algorithm: 'HS256'
    }
  );
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): JwtPayload {
  if (!token) {
    throw new Error('Token non fourni');
  }

  try {
    // Utiliser un type plus précis pour le résultat de verify
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    // Validation des propriétés attendues dans le payload
    const payload = decoded as Record<string, any>;
    if (typeof payload.userId !== 'number' || typeof payload.username !== 'string') {
      throw new Error('Format de token invalide');
    }

    return {
      userId: payload.userId,
      username: payload.username
    };
  } catch (err) {
    throw new Error('Token invalide ou expiré');
  }
}

/**
 * Middleware d'authentification pour Fastify
 */
export async function authenticate(request: FastifyRequest): Promise<JwtPayload> {
  const token = extractToken(request);
  return verifyToken(token);
}

/**
 * Extrait le token de l'en-tête Authorization ou WebSocket
 */
function extractToken(request: FastifyRequest): string {
  // Pour les requêtes HTTP standard
  if (request.headers.authorization) {
    const parts = request.headers.authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Format Authorization: Bearer <token> requis');
    }
    return parts[1];
  }

  // Pour les connexions WebSocket
  const wsProtocol = request.headers['sec-websocket-protocol'];
  if (wsProtocol) {
    const token = Array.isArray(wsProtocol) ? wsProtocol[0] : wsProtocol;
    if (!token) throw new Error('Token WebSocket manquant');
    return token;
  }

  throw new Error('Aucun token trouvé dans la requête');
}
