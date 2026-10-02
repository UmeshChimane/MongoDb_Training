import { describe, test, expect } from "vitest";
const request = require("supertest");

process.env.JWT_SECRET = "test-secret";

const app = require("../app");

describe("Auth and Notes API", () => {

    test("Register → login → create note → read note", async () => {

        const email = `user${Date.now()}@test.com`;
        const password = "123456";

        const agent = request.agent(app);

        // Register
        const registerResponse = await agent
            .post("/auth/register")
            .send({
                email,
                password
            });

        expect(registerResponse.status).toBe(201);

        // Login
        const loginResponse = await agent
            .post("/auth/login")
            .send({
                email,
                password
            });

        expect(loginResponse.status).toBe(200);

        // Create note
        const createResponse = await agent
            .post("/notes")
            .send({
                title: "Test Note",
                content: "This is a test note"
            });

        expect(createResponse.status).toBe(201);

        expect(createResponse.body.success).toBe(true);

        const noteId = createResponse.body.data.id;

        // Read note
        const readResponse = await agent
            .get(`/notes/${noteId}`);

        expect(readResponse.status).toBe(200);

        expect(readResponse.body.success).toBe(true);

        expect(readResponse.body.data.title)
            .toBe("Test Note");

        expect(readResponse.body.data.content)
            .toBe("This is a test note");
    });


    test("Reject request without a valid token", async () => {

        const response = await request(app)
            .get("/notes");

        expect(response.status).toBe(401);
    });


    test("Reject another user's note", async () => {

        const user1Email = `user1-${Date.now()}@test.com`;
        const user2Email = `user2-${Date.now()}@test.com`;

        const password = "123456";

        const user1 = request.agent(app);
        const user2 = request.agent(app);

        // Register User 1
        await user1
            .post("/auth/register")
            .send({
                email: user1Email,
                password
            });

        // Login User 1
        await user1
            .post("/auth/login")
            .send({
                email: user1Email,
                password
            });

        // User 1 creates a note
        const createResponse = await user1
            .post("/notes")
            .send({
                title: "User 1 Note",
                content: "This note belongs to user 1"
            });

        expect(createResponse.status).toBe(201);

        const noteId = createResponse.body.data.id;

        // Register User 2
        await user2
            .post("/auth/register")
            .send({
                email: user2Email,
                password
            });

        // Login User 2
        await user2
            .post("/auth/login")
            .send({
                email: user2Email,
                password
            });

        // User 2 tries to access User 1's note
        const response = await user2
            .get(`/notes/${noteId}`);

        expect(response.status).toBe(404);

        expect(response.body.message)
            .toBe("Note not found");
    });

});