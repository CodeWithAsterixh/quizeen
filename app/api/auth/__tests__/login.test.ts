import { POST } from '@/app/api/auth/login/route';
import { createMockNextRequest } from '@/jest.setup';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

describe('Login Route Handler', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    fullName: 'Test User',
    role: 'student' as const
  };

  beforeEach(async () => {
    // Create a test user before each test
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await User.create({
      ...testUser,
      passwordHash: hashedPassword
    });
  });

  it('should authenticate valid credentials and set cookie', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(testUser.email);
    expect(data.user.passwordHash).toBeUndefined();

    // Verify cookie was set
    const cookies = response.headers.get('Set-Cookie');
    expect(cookies).toBeDefined();
    expect(cookies).toContain('token=');
    expect(cookies).toContain('HttpOnly');
  });

  it('should reject invalid email', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      body: {
        email: 'wrong@example.com',
        password: testUser.password
      }
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Invalid email or password');
  });

  it('should reject invalid password', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      body: {
        email: testUser.email,
        password: 'wrongpassword'
      }
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Invalid email or password');
  });

  it('should require email and password', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      body: {}
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Email and password are required');
  });
});