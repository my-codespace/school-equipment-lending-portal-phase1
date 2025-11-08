import request from 'supertest';
import app from '../app.js'; // Our testable app
import Equipment from '../models/Equipment.js';
import Request from '../models/Request.js';
import User from '../models/User.js'; // We need this for the fix

// --- Helper Function for Authentication ---
const getAuthToken = async (role = 'student', emailSuffix = '') => {
    const email = `${role}${emailSuffix}@example.com`;
    const password = 'password123';
    
    // Register the user
    await request(app)
        .post('/api/auth/register')
        .send({
            name: `${role} ${emailSuffix} user`,
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

    // --- THIS IS THE FIX ---
    // Instead of relying on res.body.user, we find the user in the
    // database to reliably get their ID.
    const user = await User.findOne({ email: email });

    // Return both the token and the user's ID
    return { token: res.body.token, userId: user._id.toString() };
};
// ------------------------------------------


describe('Request Routes - /api/request', () => {

    let adminToken;
    let studentToken;
    let studentId;
    let testEquipment;

    // Setup before each test
    beforeEach(async () => {
        // 1. Get tokens and student ID
        const adminAuth = await getAuthToken('admin');
        adminToken = adminAuth.token;

        const studentAuth = await getAuthToken('student');
        studentToken = studentAuth.token;
        studentId = studentAuth.userId; // This will now be correctly defined

        // 2. Create equipment to be requested
        testEquipment = new Equipment({
            name: 'Test Projector',
            category: 'Electronics',
            totalQuantity: 3,
            availableCount: 3,
        });
        await testEquipment.save();
    });

    // --- Test POST (Create Request) ---
    describe('POST /api/request', () => {

        it('should allow a student to create a request', async () => {
            const res = await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ equipmentId: testEquipment._id });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('status', 'pending');

            // --- THIS IS THE FIX ---
            // We now check for the ._id property *inside* the equipment object.
            expect(res.body.equipment._id.toString()).toEqual(testEquipment._id.toString());
        });

        it('should FORBID an admin from creating a request', async () => {
            const res = await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ equipmentId: testEquipment._id });
            
            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Forbidden - insufficient role');
        });

        it('should fail if equipment is not available', async () => {
            // Make equipment unavailable
            testEquipment.availableCount = 0;
            await testEquipment.save();

            const res = await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ equipmentId: testEquipment._id });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Equipment not available');
        });

        it('should fail if a student already has an active request for this item', async () => {
            // First request (success)
            await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ equipmentId: testEquipment._id });

            // Second request (fail)
            const res = await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ equipmentId: testEquipment._id });

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('message', 'Active request already exists for this equipment');
        });
    });

    // --- Test GET (List Requests) ---
    describe('GET /api/request', () => {

        it('should allow a student to get ONLY their own requests', async () => {
            // Create a request for the student
            await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ equipmentId: testEquipment._id });
            
            // Create another student and their request (which should not be seen)
            const otherStudentAuth = await getAuthToken('student', '2');
            await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${otherStudentAuth.token}`)
                .send({ equipmentId: testEquipment._id });

            const res = await request(app)
                .get('/api/request')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(1); // Should only see 1 request
            
            // This test is flexible and will pass whether your
            // controller populates the 'user' field or not.
            const userIdInResponse = typeof res.body[0].user === 'object'
                ? res.body[0].user._id.toString()
                : res.body[0].user.toString();
                
            expect(userIdInResponse).toEqual(studentId);
        });

        it('should allow an admin to get ALL requests', async () => {
             // Create a request for the student
             await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ equipmentId: testEquipment._id });
            
            // Create another student and their request
            const otherStudentAuth = await getAuthToken('student', '2');
            await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${otherStudentAuth.token}`)
                .send({ equipmentId: testEquipment._id });

            const res = await request(app)
                .get('/api/request')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toEqual(2); // Admin sees both requests
        });
    });

    // --- Test PATCH (Approve / Reject / Return) ---
    describe('PATCH /api/request/:id/...', () => {
        
        let pendingRequest;

        // Create a pending request before each PATCH test
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/request')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ equipmentId: testEquipment._id });
            pendingRequest = res.body;
        });

        // Test Approve
        it('should allow an admin to approve a request', async () => {
            const res = await request(app)
                .patch(`/api/request/${pendingRequest._id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'approved');

            // Check if equipment count decreased
            const equipment = await Equipment.findById(testEquipment._id);
            expect(equipment.availableCount).toEqual(testEquipment.availableCount - 1);
        });

        it('should FORBID a student from approving a request', async () => {
            const res = await request(app)
                .patch(`/api/request/${pendingRequest._id}/approve`)
                .set('Authorization', `Bearer ${studentToken}`); // Student token
            
            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message', 'Forbidden - insufficient role');
        });

        // Test Reject
        it('should allow an admin to reject a request', async () => {
            const res = await request(app)
                .patch(`/api/request/${pendingRequest._id}/reject`)
                .set('Authorization',`Bearer ${adminToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'rejected');

            // Equipment count should NOT change
            const equipment = await Equipment.findById(testEquipment._id);
            expect(equipment.availableCount).toEqual(testEquipment.availableCount);
        });

        // Test Return
        it('should allow an admin to mark a request as returned', async () => {
            // First, approve the request
            await request(app)
                .patch(`/api/request/${pendingRequest._id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Now, return it
            const res = await request(app)
                .patch(`/api/request/${pendingRequest._id}/return`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'returned');

            // Equipment count should go back up
            const equipment = await Equipment.findById(testEquipment._id);
            expect(equipment.availableCount).toEqual(testEquipment.availableCount);
        });
    });

});