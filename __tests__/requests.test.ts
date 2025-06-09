import request from 'supertest';
import { parseCookies } from '../lib/cookieParser';

const api = request('http://localhost:3000/dev');

let cookie: string;
let token: string;
let requestId: string;

beforeAll(async () => {
  const res = await api.post('/login').send({
    email: 'jestuser@example.com',
    password: 'testpassword123'
  });

  const rawCookie = res.headers['set-cookie']?.[0];
  console.log('Raw cookie:', rawCookie);

  const parsed = parseCookies(rawCookie);
  token = parsed.token;
  cookie = `token=${token}`;

  console.log('Used cookie:', cookie);

});

describe('POST /requests (authorized)', () => {
  it('should create a request with valid token', async () => {
    const res = await api
      .post('/requests')
      .set('Cookie', cookie)
      .send({
        tenantId: 'abc123',
        message: 'water pipe burst, flood',
        timestamp: new Date().toISOString()
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requestId');
    expect(res.body.priority).toBe("high");

    requestId = res.body.requestId;
  });
});

describe('PUT /requests/:id (authorized)', () => {
  it('should update status of existing request', async () => {
    const res = await api
      .put(`/requests/${requestId}`)
      .set('Cookie', cookie)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body).toBe('in_progress');
  });
});

describe('GET /requests (authorized)', () => {
  it('should return all requests without filter', async () => {
    const res = await api
      .get('/requests')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requests');
    expect(Array.isArray(res.body.requests)).toBe(true);
  });

  it('should return only high priority requests when filtered', async () => {
    const res = await api
      .get('/requests?priority=high')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requests');

    const allHigh = res.body.requests.every((r: any) => r.priority === 'high');
    expect(allHigh).toBe(true);
  });
});
