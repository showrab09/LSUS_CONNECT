if (!process.env.JWT_SECRET) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
