import request from 'supertest';

const api = request('http://localhost:3000/dev');

describe('POST /requests', () => {
    it('should reject request without authorization', async () => {
        const response = await api.post('/requests').send({
            tenantId: 'abc123',
            message: 'leak in the roof',
            timestamp: new Date().toISOString(),
        });
        expect(response.status).toBe(401);
    });
});

describe('GET /requests', () => {
    it('should reject request without authorization', async () => {
        const response = await api.get('/requests');
        expect(response.status).toBe(401);
    });
});

describe('PUT /requests/{id}', () => {
    it('should reject request without authorization', async () => {
        const response = await api.put('/requests/92efcf6c-90f0-4e09-8806-4169c710f603').send({
            status: 'in_progress',
        });
        expect(response.status).toBe(401);
    });
});

describe('Auth - Register and Login', () => {
  const testEmail = 'jestuser@example.com1';
  const testPassword = 'testpassword123';

  it('should register a new tenant successfully', async () => {
    const res = await api.post('/register').send({
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      password: testPassword
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body.email).toBe(testEmail);
  });

  it('should fail to register an already existing tenant', async () => {
    const res = await api.post('/register').send({
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      password: testPassword
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should fail to login with incorrect password', async () => {
    const res = await api.post('/login').send({
      email: testEmail,
      password: 'wrongpassword'
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should login successfully with correct credentials', async () => {
    const res = await api.post('/login').send({
      email: testEmail,
      password: testPassword
    });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});