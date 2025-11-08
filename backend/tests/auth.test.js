import request from 'supertest';
import app from '../app.js'; // Our testable app
import User from '../models/user.js'; // Used for the duplicate email test

// Test suite for Authentication
describe('Auth Routes - /api/auth', () => {

    // Test case for User Registration
    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'student',
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Registration successful');
        });

        it('should fail to register a user with a duplicate email', async () => {
            // First, create the user
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'student',
                });

            // Then, try to create the same user again
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User 2',
                    email: 'test@example.com',
                    password: 'password456',
                    role: 'staff',
                });
            
            // We assume your controller correctly returns a 400
            expect(res.statusCode).toEqual(400); 
            expect(res.body).toHaveProperty('message', 'User already exists');
        });
    });

    // Test case for User Login
    describe('POST /login', () => {
        
        // Setup a user to login with
        beforeEach(async () => {
            // We use beforeEach to ensure a fresh user for each login test
            // This is better than beforeAll if tests modify data
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Login User',
                    email: 'login@example.com',
                    password: 'password123',
                    role: 'student',
                });
        });

        it('should login a registered user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.email).toEqual('login@example.com');
        });

        it('should fail to login with an incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Incorrect password');
        });

        it('should fail to login a non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nouser@example.com',
                    password: 'password123',
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User not found');
        });
    });
});