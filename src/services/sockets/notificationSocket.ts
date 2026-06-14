import { secureStore } from '@/storage';
import { getBaseUrl } from '@/app/axios/axiosBaseQuery';

export type MessageListener = (message: Record<string, unknown>) => void;
export type OpenListener = () => void;
export type CloseListener = (event: Event) => void;
export type ErrorListener = (error: Event) => void;
export type UnsubscribeCallback = () => void;

export interface NotificationSocketMessage {
  event: string;
  data: Record<string, unknown>;
}

/**
 * Notification WebSocket
 * Handles real-time notification connection and events with strict typing.
 */
class NotificationSocket {
  private socket: WebSocket | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 3000;

  private messageListeners: MessageListener[] = [];
  private openListeners: OpenListener[] = [];
  private closeListeners: CloseListener[] = [];
  private errorListeners: ErrorListener[] = [];

  /**
   * Build websocket URL
   * @param token - The JWT access token
   * @returns The fully formatted WebSocket URL
   */
  private buildSocketUrl(token: string): string {
    const httpBaseUrl = getBaseUrl();
    const wsBaseUrl = httpBaseUrl.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
    const cleanWsBaseUrl = wsBaseUrl.endsWith('/') ? wsBaseUrl.slice(0, -1) : wsBaseUrl;
    return `${cleanWsBaseUrl}/ws/?token=${encodeURIComponent(token)}`;
  }

  /**
   * Connect websocket
   * @returns A promise resolving to the connected WebSocket instance
   */
  public connect = async (): Promise<WebSocket | null> => {
    try {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return this.socket;
      }

      if (this.isConnecting) {
        return this.socket;
      }

      this.isConnecting = true;

      const tokens = await secureStore.getAuthTokens?.();
      const token = tokens?.accessToken;

      if (!token) {
        throw new Error('No access token found for websocket connection');
      }

      const socketUrl = this.buildSocketUrl(token);
      this.socket = new WebSocket(socketUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        this.openListeners.forEach((callback) => {
          try {
            callback();
          } catch (error) {
            console.error('WebSocket open listener error:', error);
          }
        });
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const parsedMessage = JSON.parse(event.data as string) as Record<string, unknown>;

          this.messageListeners.forEach((callback) => {
            try {
              callback(parsedMessage);
            } catch (error) {
              console.error('WebSocket message listener error:', error);
            }
          });
        } catch (error) {
          console.error('Failed to parse websocket message:', error);
        }
      };

      this.socket.onerror = (error: Event) => {
        this.errorListeners.forEach((callback) => {
          try {
            callback(error);
          } catch (listenerError) {
            console.error('WebSocket error listener error:', listenerError);
          }
        });
      };

      this.socket.onclose = (event: Event) => {
        this.isConnecting = false;
        this.closeListeners.forEach((callback) => {
          try {
            callback(event);
          } catch (error) {
            console.error('WebSocket close listener error:', error);
          }
        });

        this.handleReconnect();
      };

      return this.socket;
    } catch (error) {
      this.isConnecting = false;
      console.error('WebSocket connect error:', error);
      throw error;
    }
  };

  /**
   * Disconnect websocket manually
   */
  public disconnect = (): void => {
    this.reconnectAttempts = this.maxReconnectAttempts;

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  };

  /**
   * Reconnect logic
   */
  private handleReconnect = (): void => {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts += 1;

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('WebSocket reconnect failed:', error);
      }
    }, this.reconnectDelay);
  };

  /**
   * Send raw websocket message
   * @param message - The object to serialize and send
   */
  public send = <T extends Record<string, unknown>>(message: T): void => {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }

    this.socket.send(JSON.stringify(message));
  };

  /**
   * Mark notification as read via websocket
   * @param notificationId - The UUID of the notification
   */
  public markAsRead = (notificationId: string): void => {
    this.send({
      event: 'mark_as_read',
      data: {
        notificationId,
      },
    });
  };

  /**
   * Register message listener
   * @param callback - Function to invoke when a message arrives
   * @returns Unsubscribe function
   */
  public onMessage = (callback: MessageListener): UnsubscribeCallback => {
    this.messageListeners.push(callback);

    return () => {
      this.messageListeners = this.messageListeners.filter((listener) => listener !== callback);
    };
  };

  /**
   * Register open listener
   * @param callback - Function to invoke when socket opens
   * @returns Unsubscribe function
   */
  public onOpen = (callback: OpenListener): UnsubscribeCallback => {
    this.openListeners.push(callback);

    return () => {
      this.openListeners = this.openListeners.filter((listener) => listener !== callback);
    };
  };

  /**
   * Register close listener
   * @param callback - Function to invoke when socket closes
   * @returns Unsubscribe function
   */
  public onClose = (callback: CloseListener): UnsubscribeCallback => {
    this.closeListeners.push(callback);

    return () => {
      this.closeListeners = this.closeListeners.filter((listener) => listener !== callback);
    };
  };

  /**
   * Register error listener
   * @param callback - Function to invoke when socket encounters an error
   * @returns Unsubscribe function
   */
  public onError = (callback: ErrorListener): UnsubscribeCallback => {
    this.errorListeners.push(callback);

    return () => {
      this.errorListeners = this.errorListeners.filter((listener) => listener !== callback);
    };
  };

  /**
   * Check if socket is connected
   * @returns True if connected, false otherwise
   */
  public isConnected = (): boolean => {
    return this.socket?.readyState === WebSocket.OPEN;
  };
}

const notificationSocket = new NotificationSocket();

export default notificationSocket;
