import AuthService from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await AuthService.login(req.body);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.json({ user, accessToken });
  } catch (err) { next(err); }
};

export const refresh = async (req, res, next) => {
  try {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) return res.status(401).json({ message: 'Refresh token não fornecido' });
    
    const { accessToken, refreshToken } = await AuthService.refresh(oldToken);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.json({ accessToken });
  } catch (err) { next(err); }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await AuthService.logout(token);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout OK' });
  } catch (err) { next(err); }
};

export const me = async (req, res, next) => {
  try {
    const user = await AuthService.me(req.user.id);
    res.json(user);
  } catch (err) { next(err); }
};

// ===== NOVO: RECUPERAR SENHA =====

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email obrigatório' });
    
    const result = await AuthService.forgotPassword(email);
    res.json(result);
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token e nova senha obrigatórios' });
    }
    
    const result = await AuthService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) { next(err); }
};