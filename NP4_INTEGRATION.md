# NP4 Integration Design Document

This document outlines the design and implementation strategy for integrating with the Neptune's Pride 4 (NP4) game server API to enable authenticated requests for game creation, management, and data retrieval.

## Overview

The NP 1v1 League System requires integration with the Neptune's Pride 4 game server to:
- Authenticate with user credentials
- Create new games with specific settings
- Retrieve game status and player information
- Manage game passwords and player access
- Monitor game progress and results

## Authentication Flow

### Bash Reference Implementation

The provided bash script demonstrates the authentication flow:

```bash
LOGIN_URL="https://np.ironhelmet.com/account_api/login"
PLAYER_URL="https://np.ironhelmet.com/account_api/init_player"
COOKIE_JAR="neptunes_pride_cookies.txt"

login() {
    echo "Attempting to log in as: $EMAIL"
    rm -f "$COOKIE_JAR"
    
    LOGIN_RESPONSE=$(curl -s -L -c "$COOKIE_JAR" \
        --data-urlencode "type=login" \
        --data-urlencode "alias=$EMAIL" \
        --data-urlencode "password=$PASSWORD" \
        "$LOGIN_URL")
}
```

### Authentication Workflow

1. **Session Cleanup**: Remove any existing session cookies
2. **Login Request**: POST credentials to the login endpoint
3. **Cookie Storage**: Persist session cookies for subsequent requests
4. **Session Validation**: Verify successful authentication
5. **Session Management**: Handle cookie expiration and renewal

## TypeScript Implementation Strategy

### Core Components

#### 1. NP4 Client Class

```typescript
export interface NP4Config {
  baseUrl: string;
  loginEndpoint: string;
  playerEndpoint: string;
  credentials: {
    email: string;
    password: string;
  };
}

export class NP4Client {
  private sessionCookies: string = '';
  private authenticated: boolean = false;
  private config: NP4Config;
  
  constructor(config: NP4Config) {
    this.config = config;
  }
  
  async login(): Promise<boolean>;
  async makeAuthenticatedRequest(endpoint: string, data?: any): Promise<any>;
  async createGame(gameSettings: GameSettings): Promise<GameInfo>;
  async getGameStatus(gameId: string): Promise<GameStatus>;
  private async refreshSession(): Promise<boolean>;
}
```

#### 2. HTTP Request Management

```typescript
import { fetch } from 'node-fetch'; // or native fetch in Node.js 18+

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | FormData;
  followRedirects?: boolean;
}

class HttpClient {
  private cookieJar: string = '';
  
  async request(url: string, options: RequestOptions): Promise<Response> {
    const headers = {
      'User-Agent': 'NP1v1-League-Bot/1.0',
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers,
    };
    
    if (this.cookieJar) {
      headers['Cookie'] = this.cookieJar;
    }
    
    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body,
      redirect: options.followRedirects ? 'follow' : 'manual',
    });
    
    // Extract and store cookies
    this.updateCookies(response.headers.get('set-cookie'));
    
    return response;
  }
  
  private updateCookies(setCookieHeader: string | null): void {
    if (setCookieHeader) {
      // Parse and update cookie jar
      this.cookieJar = this.parseCookies(setCookieHeader);
    }
  }
}
```

### Authentication Implementation

#### Login Process

```typescript
export class NP4Auth {
  private httpClient: HttpClient;
  private config: NP4Config;
  
  constructor(config: NP4Config) {
    this.config = config;
    this.httpClient = new HttpClient();
  }
  
  async authenticate(): Promise<AuthResult> {
    try {
      // Clear any existing session
      this.httpClient.clearCookies();
      
      // Prepare login data
      const loginData = new URLSearchParams({
        type: 'login',
        alias: this.config.credentials.email,
        password: this.config.credentials.password,
      });
      
      // Perform login request
      const response = await this.httpClient.request(this.config.loginEndpoint, {
        method: 'POST',
        body: loginData.toString(),
        followRedirects: true,
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.text();
      
      // Validate authentication success
      if (this.isLoginSuccessful(responseData)) {
        logger.info('NP4 authentication successful');
        return { success: true, sessionId: this.extractSessionId(responseData) };
      } else {
        logger.error('NP4 authentication failed', { response: responseData });
        return { success: false, error: 'Invalid credentials' };
      }
      
    } catch (error) {
      logger.error('NP4 authentication error', { error });
      return { success: false, error: error.message };
    }
  }
  
  private isLoginSuccessful(response: string): boolean {
    // Check response for success indicators
    // This depends on the actual NP4 API response format
    return !response.includes('error') && !response.includes('invalid');
  }
  
  private extractSessionId(response: string): string | null {
    // Extract session identifier from response if available
    // Implementation depends on NP4 API response format
    return null;
  }
}
```

### Session Management

#### Cookie Handling

```typescript
export class CookieManager {
  private cookies: Map<string, Cookie> = new Map();
  
  updateFromSetCookie(setCookieHeaders: string[]): void {
    setCookieHeaders.forEach(header => {
      const cookie = this.parseCookie(header);
      this.cookies.set(cookie.name, cookie);
    });
  }
  
  getCookieString(): string {
    return Array.from(this.cookies.values())
      .filter(cookie => !this.isExpired(cookie))
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
  }
  
  clear(): void {
    this.cookies.clear();
  }
  
  private parseCookie(setCookieHeader: string): Cookie {
    // Parse Set-Cookie header format
    const [nameValue, ...attributes] = setCookieHeader.split(';');
    const [name, value] = nameValue.split('=');
    
    return {
      name: name.trim(),
      value: value?.trim() || '',
      expires: this.parseExpires(attributes),
      path: this.parseAttribute(attributes, 'path'),
      domain: this.parseAttribute(attributes, 'domain'),
      secure: attributes.some(attr => attr.trim().toLowerCase() === 'secure'),
      httpOnly: attributes.some(attr => attr.trim().toLowerCase() === 'httponly'),
    };
  }
  
  private isExpired(cookie: Cookie): boolean {
    return cookie.expires ? new Date() > cookie.expires : false;
  }
}
```

#### Session Persistence

```typescript
export class SessionPersistence {
  private sessionFilePath: string;
  
  constructor(sessionPath: string = './np4_session.json') {
    this.sessionFilePath = sessionPath;
  }
  
  async saveSession(cookies: string, sessionId?: string): Promise<void> {
    const sessionData = {
      cookies,
      sessionId,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    
    await fs.writeFile(
      this.sessionFilePath, 
      JSON.stringify(sessionData, null, 2),
      'utf8'
    );
  }
  
  async loadSession(): Promise<SessionData | null> {
    try {
      const data = await fs.readFile(this.sessionFilePath, 'utf8');
      const sessionData = JSON.parse(data);
      
      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        await this.clearSession();
        return null;
      }
      
      return sessionData;
    } catch (error) {
      return null;
    }
  }
  
  async clearSession(): Promise<void> {
    try {
      await fs.unlink(this.sessionFilePath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }
}
```

### Authenticated Request Patterns

#### Base Request Handler

```typescript
export class NP4ApiClient {
  private auth: NP4Auth;
  private sessionPersistence: SessionPersistence;
  private rateLimiter: RateLimiter;
  
  constructor(config: NP4Config) {
    this.auth = new NP4Auth(config);
    this.sessionPersistence = new SessionPersistence();
    this.rateLimiter = new RateLimiter({ requestsPerMinute: 60 });
  }
  
  async makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    await this.rateLimiter.waitForSlot();
    
    try {
      // Ensure we have a valid session
      await this.ensureAuthenticated();
      
      const response = await this.auth.httpClient.request(
        `${this.config.baseUrl}${endpoint}`,
        options
      );
      
      if (response.status === 401 || response.status === 403) {
        // Session expired, re-authenticate and retry
        await this.reauthenticate();
        return this.makeRequest(endpoint, options);
      }
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error('NP4 API request failed', { endpoint, error });
      throw error;
    }
  }
  
  private async ensureAuthenticated(): Promise<void> {
    // Try to load existing session
    const savedSession = await this.sessionPersistence.loadSession();
    
    if (savedSession) {
      this.auth.httpClient.setCookies(savedSession.cookies);
      return;
    }
    
    // Need to authenticate
    await this.authenticate();
  }
  
  private async authenticate(): Promise<void> {
    const result = await this.auth.authenticate();
    
    if (!result.success) {
      throw new Error(`Authentication failed: ${result.error}`);
    }
    
    // Save session for reuse
    await this.sessionPersistence.saveSession(
      this.auth.httpClient.getCookies(),
      result.sessionId
    );
  }
  
  private async reauthenticate(): Promise<void> {
    await this.sessionPersistence.clearSession();
    await this.authenticate();
  }
}
```

### Game Management API

#### Game Creation

```typescript
export interface GameSettings {
  name: string;
  password: string;
  playerCount: number;
  gameType: '1v1' | 'tournament';
  settings: {
    turnTime: number; // hours
    tradeCost: number;
    startingStars: number;
    startingMoney: number;
    // ... other game settings
  };
}

export interface GameInfo {
  gameId: string;
  name: string;
  password: string;
  joinUrl: string;
  status: 'waiting' | 'active' | 'finished';
  players: PlayerInfo[];
}

export class GameManager {
  private apiClient: NP4ApiClient;
  
  constructor(apiClient: NP4ApiClient) {
    this.apiClient = apiClient;
  }
  
  async createGame(settings: GameSettings): Promise<GameInfo> {
    const gameData = this.formatGameSettings(settings);
    
    const response = await this.apiClient.makeRequest<any>('/api/create_game', {
      method: 'POST',
      body: JSON.stringify(gameData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return this.parseGameInfo(response);
  }
  
  async getGameStatus(gameId: string): Promise<GameStatus> {
    const response = await this.apiClient.makeRequest<any>(`/api/game/${gameId}/status`);
    return this.parseGameStatus(response);
  }
  
  async invitePlayer(gameId: string, playerAlias: string): Promise<boolean> {
    const response = await this.apiClient.makeRequest<any>(`/api/game/${gameId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ alias: playerAlias }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.success === true;
  }
  
  private formatGameSettings(settings: GameSettings): any {
    // Convert internal settings format to NP4 API format
    return {
      name: settings.name,
      password: settings.password,
      // ... map other settings
    };
  }
  
  private parseGameInfo(response: any): GameInfo {
    // Parse NP4 API response to internal format
    return {
      gameId: response.gameId || response.id,
      name: response.name,
      password: response.password,
      joinUrl: `https://np.ironhelmet.com/game/${response.gameId}`,
      status: this.parseGameStatus(response.status),
      players: response.players?.map(this.parsePlayerInfo) || [],
    };
  }
}
```

### Error Handling and Resilience

#### Retry Logic

```typescript
export class RequestRetry {
  private maxRetries: number = 3;
  private backoffMs: number = 1000;
  
  async withRetry<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: Error) => boolean = this.defaultShouldRetry
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries || !shouldRetry(lastError)) {
          throw lastError;
        }
        
        const delay = this.backoffMs * Math.pow(2, attempt);
        await this.sleep(delay);
        
        logger.warn('Retrying failed request', {
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
          delay,
          error: lastError.message,
        });
      }
    }
    
    throw lastError!;
  }
  
  private defaultShouldRetry(error: Error): boolean {
    // Retry on network errors and certain HTTP status codes
    return (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('503') ||
      error.message.includes('502')
    );
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### Rate Limiting

```typescript
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;
  
  constructor(options: { requestsPerMinute: number }) {
    this.maxRequests = options.requestsPerMinute;
    this.windowMs = 60 * 1000; // 1 minute
  }
  
  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      
      logger.debug('Rate limit reached, waiting', { waitTime });
      await this.sleep(waitTime);
      
      return this.waitForSlot(); // Recursive check
    }
    
    this.requests.push(now);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Security Considerations

#### Credential Management

```typescript
export class CredentialManager {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  
  static encryptCredentials(credentials: any, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, key);
    
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }
  
  static decryptCredentials(encryptedData: string, key: string): any {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(this.ENCRYPTION_ALGORITHM, key);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
```

#### Environment Configuration

```typescript
export interface NP4Configuration {
  credentials: {
    email: string;
    password: string;
  };
  api: {
    baseUrl: string;
    loginEndpoint: string;
    playerEndpoint: string;
    timeout: number;
    retries: number;
  };
  security: {
    encryptionKey?: string;
    sessionTimeout: number;
  };
}

export function loadNP4Config(): NP4Configuration {
  const requiredVars = ['NP4_EMAIL', 'NP4_PASSWORD'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required NP4 environment variables: ${missing.join(', ')}`);
  }
  
  return {
    credentials: {
      email: process.env.NP4_EMAIL!,
      password: process.env.NP4_PASSWORD!,
    },
    api: {
      baseUrl: process.env.NP4_BASE_URL || 'https://np.ironhelmet.com',
      loginEndpoint: '/account_api/login',
      playerEndpoint: '/account_api/init_player',
      timeout: parseInt(process.env.NP4_TIMEOUT || '30000'),
      retries: parseInt(process.env.NP4_RETRIES || '3'),
    },
    security: {
      encryptionKey: process.env.NP4_ENCRYPTION_KEY,
      sessionTimeout: parseInt(process.env.NP4_SESSION_TIMEOUT || '86400000'), // 24 hours
    },
  };
}
```

### Integration with Discord Bot

#### Game Creation Command

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { NP4ApiClient } from '../services/np4Client.js';
import { GameSettings } from '../types/game.js';

export const createGameCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('create-game')
    .setDescription('Create a new Neptune\'s Pride 4 game')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Game name')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('password')
        .setDescription('Game password')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('players')
        .setDescription('Number of players')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(8)),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    
    try {
      const name = interaction.options.getString('name')!;
      const password = interaction.options.getString('password')!;
      const playerCount = interaction.options.getInteger('players')!;
      
      const gameSettings: GameSettings = {
        name,
        password,
        playerCount,
        gameType: '1v1',
        settings: {
          turnTime: 24,
          tradeCost: 15,
          startingStars: 10,
          startingMoney: 500,
        },
      };
      
      const np4Client = new NP4ApiClient(loadNP4Config());
      const gameInfo = await np4Client.gameManager.createGame(gameSettings);
      
      await interaction.editReply({
        embeds: [{
          title: '🎮 Game Created Successfully',
          description: `Game "${gameInfo.name}" has been created!`,
          fields: [
            { name: 'Game ID', value: gameInfo.gameId, inline: true },
            { name: 'Password', value: `||${gameInfo.password}||`, inline: true },
            { name: 'Join URL', value: gameInfo.joinUrl, inline: false },
          ],
          color: 0x00ff00,
        }],
      });
      
      logger.info('Game created successfully', {
        gameId: gameInfo.gameId,
        name: gameInfo.name,
        discordUser: interaction.user.tag,
      });
      
    } catch (error) {
      logger.error('Failed to create game', { error, user: interaction.user.tag });
      
      await interaction.editReply({
        embeds: [{
          title: '❌ Game Creation Failed',
          description: 'An error occurred while creating the game. Please try again later.',
          color: 0xff0000,
        }],
      });
    }
  },
};
```

### Testing Strategy

#### Mock API Responses

```typescript
export class MockNP4Client extends NP4ApiClient {
  private mockResponses: Map<string, any> = new Map();
  
  setMockResponse(endpoint: string, response: any): void {
    this.mockResponses.set(endpoint, response);
  }
  
  async makeRequest<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const mockResponse = this.mockResponses.get(endpoint);
    
    if (mockResponse) {
      return mockResponse;
    }
    
    // Fall back to real implementation or throw error
    throw new Error(`No mock response configured for endpoint: ${endpoint}`);
  }
}

// Example test
describe('Game Creation', () => {
  let mockClient: MockNP4Client;
  
  beforeEach(() => {
    mockClient = new MockNP4Client(testConfig);
    mockClient.setMockResponse('/api/create_game', {
      gameId: 'test-game-123',
      name: 'Test Game',
      password: 'test-password',
      status: 'waiting',
    });
  });
  
  it('should create a game successfully', async () => {
    const gameSettings: GameSettings = {
      name: 'Test Game',
      password: 'test-password',
      playerCount: 2,
      gameType: '1v1',
      settings: { turnTime: 24, tradeCost: 15, startingStars: 10, startingMoney: 500 },
    };
    
    const result = await mockClient.gameManager.createGame(gameSettings);
    
    expect(result.gameId).toBe('test-game-123');
    expect(result.name).toBe('Test Game');
    expect(result.status).toBe('waiting');
  });
});
```

## Implementation Roadmap

### Phase 1: Core Authentication
- [ ] Implement basic HTTP client with cookie management
- [ ] Create authentication flow
- [ ] Add session persistence
- [ ] Implement error handling and retry logic

### Phase 2: API Integration
- [ ] Implement game creation API calls
- [ ] Add game status monitoring
- [ ] Create player invitation system
- [ ] Add rate limiting and request management

### Phase 3: Discord Integration
- [ ] Create Discord commands for game management
- [ ] Implement automated game creation for tournaments
- [ ] Add game status notifications
- [ ] Create admin commands for game oversight

### Phase 4: Testing and Validation
- [ ] Unit tests for all API components
- [ ] Integration tests with mock API
- [ ] End-to-end testing with real NP4 server
- [ ] Performance and reliability testing

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# NP4 Integration
NP4_EMAIL=your_neptunes_pride_email
NP4_PASSWORD=your_neptunes_pride_password
NP4_BASE_URL=https://np.ironhelmet.com
NP4_TIMEOUT=30000
NP4_RETRIES=3
NP4_SESSION_TIMEOUT=86400000
NP4_ENCRYPTION_KEY=your_32_character_encryption_key
```

## Security Notes

1. **Credential Storage**: Store NP4 credentials securely using environment variables
2. **Session Management**: Implement proper session timeout and renewal
3. **Rate Limiting**: Respect NP4 server rate limits to avoid being blocked
4. **Error Handling**: Don't expose sensitive information in error messages
5. **Logging**: Log API interactions for debugging but exclude sensitive data
6. **Encryption**: Consider encrypting stored session data

## Monitoring and Observability

- Monitor API response times and success rates
- Track authentication failures and session expirations
- Log game creation success/failure rates
- Monitor rate limit usage
- Alert on sustained API failures

This design provides a robust foundation for integrating the NP 1v1 League System with the Neptune's Pride 4 game server while maintaining security, reliability, and maintainability.