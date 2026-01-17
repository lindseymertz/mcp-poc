import { promises as fs } from 'fs';
import path from 'path';
import { Credentials } from 'google-auth-library';

const TOKEN_PATH = path.join(process.cwd(), '.google-tokens.json');

export async function saveTokens(tokens: Credentials): Promise<void> {
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

export async function loadTokens(): Promise<Credentials | null> {
  try {
    const data = await fs.readFile(TOKEN_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await fs.unlink(TOKEN_PATH);
  } catch {
    // Ignore if file doesn't exist
  }
}
