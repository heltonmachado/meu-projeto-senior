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
    
    // Seta cookie httpOnly com refresh token - Staff pattern
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // true em produção com HTTPS
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
