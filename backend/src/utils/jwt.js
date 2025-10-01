// JWT Token Yönetimi
export class JWTManager {
  constructor(secret) {
    this.secret = secret;
  }

  async sign(payload, expiresIn = '7d') {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.parseExpiration(expiresIn);
    
    const jwtPayload = { ...payload, iat: now, exp: exp };
    
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));
    
    const signature = await this.createSignature(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  async verify(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Geçersiz token formatı');

    const [header, payload, signature] = parts;
    const expectedSignature = await this.createSignature(`${header}.${payload}`);
    
    if (signature !== expectedSignature) throw new Error('Geçersiz imza');

    const decodedPayload = JSON.parse(this.base64UrlDecode(payload));
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token süresi dolmuş');
    }

    return decodedPayload;
  }

  async createSignature(data) {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return this.base64UrlEncode(new Uint8Array(signature));
  }

  base64UrlEncode(data) {
    if (typeof data === 'string') data = new TextEncoder().encode(data);
    const base64 = btoa(String.fromCharCode(...data));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  base64UrlDecode(data) {
    data = data.replace(/-/g, '+').replace(/_/g, '/');
    while (data.length % 4) data += '=';
    return atob(data);
  }

  parseExpiration(expiresIn) {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 3600;
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }
}