import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { redis } from '../../shared/infra/cache/redis.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = 7 * 24 * 60 * 60;

class AuthServiceClass {
  generateAccessToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  }

  generateRefreshToken(user) {
    const jti = crypto.randomUUID();
    const token = jwt.sign({ id: user.id, jti }, JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_EXPIRES}s` });
    return { token, jti };
  }

  async register({ name, email, password }) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error('Email já cadastrado');
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    return { id: user.id, name: user.name, email: user.email };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Credenciais inválidas');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Credenciais inválidas');

    const accessToken = this.generateAccessToken(user);
    const { token: refreshToken, jti } = this.generateRefreshToken(user);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_EXPIRES * 1000) }
    });

    // FIX V3: 'EX' separado, não { EX: ... }
    await redis.set(`refresh:${jti}`, user.id.toString(), 'EX', REFRESH_EXPIRES);

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken };
  }

  async refresh(oldRefreshToken) {
    let decoded;
    try { decoded = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET); } catch { throw new Error('Refresh token inválido'); }

    const jti = decoded.jti;
    const userId = decoded.id;

    const exists = await redis.get(`refresh:${jti}`);
    if (!exists) throw new Error('Refresh token revogado');

    const tokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revoked) throw new Error('Refresh token inválido');

    await redis.del(`refresh:${jti}`);
    await prisma.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const accessToken = this.generateAccessToken(user);
    const { token: newRefreshToken, jti: newJti } = this.generateRefreshToken(user);
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    
    await prisma.refreshToken.create({
      data: { tokenHash: newHash, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_EXPIRES * 1000) }
    });
    await redis.set(`refresh:${newJti}`, user.id.toString(), 'EX', REFRESH_EXPIRES);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      await redis.del(`refresh:${decoded.jti}`);
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
    } catch {}
  }

  async me(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;
