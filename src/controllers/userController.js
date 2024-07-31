import User from '../models/userModel.js';
import { findUserByEmail, createUser } from '../dao/userDao.js';
import { generateToken } from '../config/jwtConfig.js';
import bcrypt from 'bcrypt';
import { config } from '../config/config.js';

// Cambiar el rol de un usuario
export const changeUserRole = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.role = user.role === 'user' ? 'premium' : 'user';
        await user.save();

        res.status(200).json({ message: `Rol del usuario actualizado a ${user.role}` });
    } catch (error) {
        next(error);
    }
};

export const registerUser = async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El email ya está registrado' });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await createUser({ first_name, last_name, email, age, password: hashedPassword });
        res.json({ success: true, message: 'Usuario registrado exitosamente', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar usuario' });
    }
};

export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ success: false, message: 'Credenciales incorrectas' });
        }
        const token = generateToken(user);
        res.json({ success: true, token });
    } catch (error) {
        next(error);
    }
};

export const loginAdmin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (email === config.adminEmail && password === config.adminPassword) {
            const adminUser = { email, role: 'admin' };
            const token = generateToken(adminUser);
            return res.json({ success: true, token });
        } else {
            return res.status(400).json({ success: false, message: 'Credenciales de admin incorrectas' });
        }
    } catch (error) {
        next(error);
    }
};
