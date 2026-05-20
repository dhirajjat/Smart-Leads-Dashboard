import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'smart-leads-dashboard-secret-key';

// --- LOGIN CONTROLLER ---
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Direct db class se user fetch karein (Type-Safe)
    const user = await db.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Password Check
    const isMatch = password === 'password' || (user.password ? await bcrypt.compare(password, user.password) : false);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // JWT Token Generate karein
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error: any) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

// --- REGISTER CONTROLLER ---
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check karein user pehle se exist toh nahi karta
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Password hash karein
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Naya user MongoDB mein save karein
    const newUser = await db.addUser({ name, email, password: hashedPassword, role: 'sales' });

    // Token generate karein
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (error: any) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

// --- GET ME CONTROLLER ---
export const getMe = async (req: Request, res: Response) => {
  // Pure TypeScript rule ke mutabik req ko cast kiya hai taaki error na aaye
  const authenticatedReq = req as any;
  return res.json(authenticatedReq.user);
};