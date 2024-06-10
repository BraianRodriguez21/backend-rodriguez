import { Router } from 'express';
import passport from 'passport';
import { User } from '../models/userModel.js';

const router = Router();

// Ruta de registro
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El email ya está registrado' });
        }
        const user = new User({ email, password });
        await user.save();
        res.json({ success: true, message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar usuario' });
    }
});

// Ruta de login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/products',
    failureRedirect: '/login',
    failureFlash: true
}));

// Ruta de logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// Ruta de autenticación con GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect('/products');
});

export { router as authRouter };
