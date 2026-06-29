'use server'

import crypto from 'crypto';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

function base64url(str: string | Buffer): string {
  const base64 = typeof str === 'string' 
    ? Buffer.from(str).toString('base64') 
    : str.toString('base64');
  return base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export const tokenProvider = async (userId: string) => {
    if (!userId) throw new Error('user is not logged in');
    if (!apiKey) throw new Error('No API key');
    if (!apiSecret) throw new Error('No API secret');
    
    // We bypass high-overhead node-sdk requirements entirely by generating 
    // a valid cryptographically secure GetStream JWT token using Node's native 'crypto' hmac utility.
    const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64url(JSON.stringify({ 
      user_id: userId, 
      exp: Math.round(new Date().getTime() / 1000) + 60 * 60,
      issued: Math.floor(Date.now() / 1000) - 60
    }));
    
    const hmac = crypto.createHmac('sha256', apiSecret);
    hmac.update(`${header}.${payload}`);
    const signature = base64url(hmac.digest());
    
    return `${header}.${payload}.${signature}`;
};