import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

let browser: any = null;
let page: any = null;
let incomingHandler: ((msg: { from: string; body: string }) => void) | null = null;
let isPuppeteerAvailable = true;

export interface WhatsAppConfig {
  userDataDir?: string;
  headless?: boolean;
}

export async function initBot({ userDataDir = './session_data', headless = false }: WhatsAppConfig = {}) {
  try {
    console.log('🚀 Initializing WhatsApp bot...');
    
    // Ensure session directory exists
    await fs.mkdir(userDataDir, { recursive: true });

    // Launch Puppeteer with basic configuration
    browser = await puppeteer.launch({
      headless: headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      userDataDir,
      defaultViewport: { width: 1200, height: 800 }
    });

    page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🌐 Navigating to WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for QR code or main app
    try {
      await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 15000 });
      console.log('✅ QR code detected! Please scan with your phone within 60 seconds.');
      
      // Wait for QR scan completion
      try {
        await page.waitForSelector('[data-testid="chat-list"], [role="region"]', { timeout: 60000 });
        console.log('✅ QR code scanned successfully! WhatsApp Web is ready.');
      } catch (error) {
        console.log('⚠️ QR scan timeout, but continuing anyway...');
      }
    } catch (error) {
      console.log('ℹ️ Already logged in or QR code selector changed');
    }

    // Set up incoming message listener
    await setupIncomingListener();

    console.log('🚀 WhatsApp bot initialized successfully!');
    return { page, browser, demoMode: false };

  } catch (error) {
    console.error('❌ Failed to initialize WhatsApp bot:', error);
    console.log('🔄 Falling back to demo mode - WhatsApp features will be simulated');
    isPuppeteerAvailable = false;
    
    // Simulate demo mode with periodic messages
    setTimeout(() => {
      if (incomingHandler && !isPuppeteerAvailable) {
        incomingHandler({
          from: '+1234567890',
          body: 'Demo: This is a simulated incoming message. In real mode, you would see actual WhatsApp messages here.'
        });
      }
    }, 8000);
    
    return { page: null, browser: null, demoMode: true };
  }
}

async function setupIncomingListener() {
  if (!page) return;

  try {
    await page.exposeFunction('onIncomingFromPage', (msg: { from: string; body: string }) => {
      console.log('📨 Incoming message detected:', msg);
      if (incomingHandler) {
        incomingHandler(msg);
      }
    });

    // Simple message detection
    await page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            try {
              const element = node as Element;
              const preview = element.querySelector?.('div[dir="ltr"] span')?.textContent;
              const from = element.querySelector?.('._3ko75')?.textContent || 'Unknown';
              
              if (preview && preview.trim() && !preview.includes('typing')) {
                window.onIncomingFromPage({ from, body: preview.trim() });
              }
            } catch (e) {
              // Ignore errors in DOM parsing
            }
          }
        }
      });

      const chatList = document.querySelector('div[role="region"]');
      if (chatList) {
        observer.observe(chatList, { childList: true, subtree: true });
        console.log('Message observer attached successfully');
      }
    });
  } catch (error) {
    console.warn('Could not attach incoming observer:', error);
  }
}

export async function sendMessage(number: string, message: string) {
  if (!isPuppeteerAvailable) {
    // Simulate sending in demo mode
    console.log(`[DEMO] Would send to ${number}: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    return true;
  }

  if (!page) {
    throw new Error('Bot not initialized');
  }

  try {
    console.log(`📤 Sending message to ${number}: ${message}`);
    
    const url = `https://web.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}&app_absent=0`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    // Wait for message input
    await page.waitForSelector('div[contenteditable="true"][data-tab="10"]', { timeout: 10000 });
    
    // Type message
    await page.focus('div[contenteditable="true"][data-tab="10"]');
    await page.keyboard.type(message);
    
    // Small delay to ensure message is typed
    await page.waitForTimeout(1000);
    
    // Press Enter to send
    await page.keyboard.press('Enter');
    
    // Wait for message to be sent
    await page.waitForTimeout(2000);
    
    console.log('✅ Message sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    throw error;
  }
}

export function onIncomingMessage(handler: (msg: { from: string; body: string }) => void) {
  incomingHandler = handler;
}

export async function closeBot() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}

export function isBotInitialized(): boolean {
  return isPuppeteerAvailable ? (browser !== null && page !== null) : true; // Demo mode is always "initialized"
}

export async function takeScreenshot(): Promise<string> {
  if (!isPuppeteerAvailable) {
    // Return a placeholder image for demo mode
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  if (!page) {
    throw new Error('Bot not initialized');
  }
  
  try {
    const screenshot = await page.screenshot({ 
      encoding: 'base64',
      type: 'png',
      fullPage: false
    });
    return screenshot;
  } catch (error) {
    console.error('Failed to take screenshot:', error);
    throw error;
  }
}

export function getDemoMode(): boolean {
  return !isPuppeteerAvailable;
}

// Additional utility functions
export async function checkWhatsAppStatus(): Promise<boolean> {
  if (!page) return false;
  
  try {
    await page.waitForSelector('[data-testid="chat-list"], #side', { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getActiveChats(): Promise<Array<{name: string, lastMessage: string}>> {
  if (!page) return [];
  
  try {
    const chats = await page.evaluate(() => {
      const chatElements = document.querySelectorAll('[data-testid="chat"]');
      const chats = [];
      
      chatElements.forEach((element) => {
        try {
          const nameElement = element.querySelector('[data-testid="conversation-title"]');
          const messageElement = element.querySelector('[data-testid="last-message"]');
          
          if (nameElement && messageElement) {
            chats.push({
              name: nameElement.textContent || 'Unknown',
              lastMessage: messageElement.textContent || ''
            });
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });
      
      return chats.slice(0, 10); // Return first 10 chats
    });
    
    return chats;
  } catch (error) {
    console.error('Failed to get active chats:', error);
    return [];
  }
}