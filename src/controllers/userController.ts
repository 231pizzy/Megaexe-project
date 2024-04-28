import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signInValidationSchema, userValidationSchema } from '../utils/validation';

export const signUp: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    try {
        const { error, value } = userValidationSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { name, email, password, picture } = value;

        // Check if a user with the provided email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            picture,
            password: hashedPassword,
        });

        // Save the new user to the database
        await newUser.save();

        // Return user information in the response
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        };

        res.status(201).json({ message: 'Registration successful', user: userResponse });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// User sign in
export const signIn: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    try {
        // Validate incoming email and password
        const { error, value } = signInValidationSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { email, password } = value;
        const normalizedEmail = email.toLowerCase();

        // Find the user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, `${process.env.JWT_SECRET}`, { expiresIn: '1h' });

        // Return the token and user information in the response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
        };

        res.status(200).json({ message: 'Authentication successful', token, user: userResponse });
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};