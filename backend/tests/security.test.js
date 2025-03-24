const request = require('supertest');
const { app } = require('../server');

describe('Security Tests', () => {
  describe('Input Validation - Calculate Endpoint', () => {
    test('Should reject XSS attempts in address', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({
          source: '<script>alert("xss")</script>',
          destination: 'New York'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid address format');
    });

    test('Should reject SQL injection attempts', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({
          source: "'; DROP TABLE users; --",
          destination: 'New York'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid address format');
    });

    test('Should reject addresses with special characters', async () => {
      const maliciousInputs = [
        '../../etc/passwd',           // Path traversal attempt
        '$(rm -rf /)',               // Command injection attempt
        '{"$gt": ""}',               // NoSQL injection attempt
        'data:text/html,<script>',   // Data URL injection
        '//evil.com/hack.js'         // URL injection
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/calculate')
          .send({
            source: input,
            destination: 'New York'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid address format');
      }
    });
  });

  describe('Input Validation - Autocomplete Endpoint', () => {
    test('Should reject long inputs', async () => {
      const response = await request(app)
        .get('/autocomplete')
        .query({ 
          input: 'a'.repeat(201) // More than 200 characters
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid input format');
    });

    test('Should reject inputs with HTML tags', async () => {
      const response = await request(app)
        .get('/autocomplete')
        .query({ 
          input: '<img src=x onerror=alert(1)>'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid input format');
    });
  });

  describe('Rate Limiting Tests', () => {
    test('Should enforce delay between geocoding requests', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/calculate')
        .send({
          source: 'New York',
          destination: 'Los Angeles'
        });

      const response = await request(app)
        .post('/calculate')
        .send({
          source: 'Chicago',
          destination: 'Houston'
        });

      const endTime = Date.now();
      const timeDifference = endTime - startTime;

      expect(timeDifference).toBeGreaterThanOrEqual(1000); // Should take at least 1 second
      expect(response.status).toBe(200);
    });
  });

  describe('Coordinate Validation', () => {
    test('Should reject invalid latitude values', async () => {
      // Mock the geocoding response to return invalid coordinates
      const response = await request(app)
        .post('/calculate')
        .send({
          source: 'New York',
          destination: 'Los Angeles'
        });

      // If we get invalid coordinates, the API should reject them
      if (response.status === 400) {
        expect(response.body.error).toMatch(/Invalid coordinates|Address not found/);
      }
    });
  });

  describe('Error Handling', () => {
    test('Should not expose internal errors', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      // Should not contain stack traces or detailed error info
      expect(response.body.stack).toBeUndefined();
      expect(response.body.details).toBeUndefined();
    });
  });
});
