import request from 'supertest';
import app from '../app.js'; // Our testable app
import Equipment from '../models/Equipment.js'; // To check DB

// --- Helper Function for Authentication ---
// We'll use this to get tokens for different roles
const getAuthToken = async (role = 'student') => {
    const email = `${role}@example.com`;
    const password = 'password123';
    
    // Register the user
    await request(app)
        .post('/api/auth/register')
        .send({
            name: `${role} user`,
            email: email,
            password: password,
            role: role,
        });

    // Login and get the token
    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: email,
            password: password,
        });

    return res.body.token; // Return the JWT token
};
// ------------------------------------------


describe('Equipment Routes - /api/equipment', () => {

    let adminToken;
    let studentToken;
    let testEquipmentId;

    // --- Setup before each test ---
    // We run this before EACH test to ensure a clean state
    // This fixes the error where GET/PUT tests failed because
    // the item from the POST test was deleted by afterEach in setup.js
    beforeEach(async () => {
        // 1. Get fresh tokens for admin and student
        adminToken = await getAuthToken('admin');
        studentToken = await getAuthToken('student');

        // 2. Create a standard piece of equipment for tests to use
        const equipment = new Equipment({
            name: 'Test Laptop',
            category: 'Electronics',
            totalQuantity: 10,
            availableCount: 10,
        });
        await equipment.save();
        
        // 3. Store its ID for tests that need a param (PUT, DELETE)
        testEquipmentId = equipment._id.toString();
    });
    // ---------------------------------

    // --- Test POST (Create) ---
    describe('POST /api/equipment', () => {
        
        it('should allow an admin to create new equipment', async () => {
            const res = await request(app)
                .post('/api/equipment')
                .set('Authorization', `Bearer ${adminToken}`) // Use admin token
                .send({
                    name: 'New Camera',
                    category: 'Photography',
                    totalQuantity: 5,
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('name', 'New Camera');
            expect(res.body).toHaveProperty('availableCount', 5);
        });

        it('should FORBID a student from creating new equipment', async () => {
            const res = await request(app)
                .post('/api/equipment')
                .set('Authorization', `Bearer ${studentToken}`) // Use student token
                .send({
                    name: 'Student Laptop',
                    category: 'Electronics',
                    totalQuantity: 5,
                });
            
            expect(res.statusCode).toEqual(403); // Forbidden
            // --- FIX 1: Updated the expected error message ---
            expect(res.body).toHaveProperty('message', 'Forbidden - insufficient role');
        });
    });

    // --- Test GET (Read) ---
    describe('GET /api/equipment', () => {
        
        // --- THIS IS THE LINE I FIXED ---
        it('should allow an admin to get all equipment', async () => {
            const res = await request(app)
                .get('/api/equipment')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.statusCode).toEqual(200);
            // --- FIX 2: This test now works because of beforeEach ---
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].name).toEqual('Test Laptop');
        });

        it('should allow a student to get all equipment', async () => {
            const res = await request(app)
                .get('/api/equipment')
                .set('Authorization', `Bearer ${studentToken}`);
            
            expect(res.statusCode).toEqual(200);
            // --- FIX 2: This test now works because of beforeEach ---
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    // --- Test PUT (Update) ---
    describe('PUT /api/equipment/:id', () => {

        it('should allow an admin to update equipment', async () => {
            const res = await request(app)
                .put(`/api/equipment/${testEquipmentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Laptop Name',
                    condition: 'Good',
                    totalQuantity: 15,
                    availableCount: 12,
                });
            
            expect(res.statusCode).toEqual(200);
            // --- FIX 2: This test now works because of beforeEach ---
            expect(res.body).toHaveProperty('name', 'Updated Laptop Name');
            expect(res.body).toHaveProperty('availableCount', 12);
        });

        it('should FORBID a student from updating equipment', async () => {
            const res = await request(app)
                .put(`/api/equipment/${testEquipmentId}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ name: 'Student Update' });

            expect(res.statusCode).toEqual(403);
            // --- FIX 1: Updated the expected error message ---
            expect(res.body).toHaveProperty('message', 'Forbidden - insufficient role');
        });
    });

    // --- Test DELETE ---
    describe('DELETE /api/equipment/:id', () => {

        it('should FORBID a student from deleting equipment', async () => {
            const res = await request(app)
                .delete(`/api/equipment/${testEquipmentId}`)
                .set('Authorization', `Bearer ${studentToken}`);
            
            expect(res.statusCode).toEqual(403);
            // --- FIX 1: Updated the expected error message ---
            expect(res.body).toHaveProperty('message', 'Forbidden - insufficient role');
        });

        it('should allow an admin to delete equipment', async () => {
            const res = await request(app)
                .delete(`/api/equipment/${testEquipmentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Equipment deleted');

            // Verify it's actually gone from the DB
            const deletedItem = await Equipment.findById(testEquipmentId);
            expect(deletedItem).toBeNull();
        });
    });
});