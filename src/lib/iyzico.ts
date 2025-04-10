import crypto from 'crypto';

interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export function createIyzicoConfig(apiKey: string, secretKey: string, sandbox: boolean = false): IyzicoConfig {
  console.log("İyzico config oluşturuldu - Sandbox modu:", sandbox ? "Aktif" : "Kapalı");
  return {
    apiKey,
    secretKey,
    baseUrl: sandbox ? 'https://sandbox-api.iyzipay.com' : 'https://api.iyzipay.com'
  };
}

export function generateAuthorizationHeader(config: IyzicoConfig, uri: string, body: any = {}): string {
  const randomStr = Math.random().toString(10).substring(2);
  body = typeof body === 'string' ? body : JSON.stringify(body);
  
  // PKI String oluşturma
  let pki = `[${randomStr}${config.apiKey}${uri}${body}${config.secretKey}]`;
  
  // Hash hesaplama
  const hash = crypto.createHash('sha1').update(pki).digest('base64');
  
  // Authorization header
  return `IYZWS ${config.apiKey}:${hash}`;
}

export async function makeIyzicoRequest(config: IyzicoConfig, method: string, uri: string, body: any = {}): Promise<any> {
  const url = `${config.baseUrl}${uri}`;
  const authHeader = generateAuthorizationHeader(config, uri, body);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Accept': 'application/json',
        'x-iyzi-client-version': 'iyzico-node-client-1.0.0',
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.errorMessage || 'Iyzico API isteği başarısız oldu');
    }
    
    return data;
  } catch (error) {
    console.error('Iyzico API hatası:', error);
    throw error;
  }
}

// Test bağlantısı için kullanılan fonksiyon
export async function testIyzicoConnection(config: IyzicoConfig): Promise<boolean> {
  try {
    console.log("İyzico bağlantı testi yapılıyor:", config.baseUrl);
    const result = await makeIyzicoRequest(config, 'GET', '/payment/test');
    console.log("İyzico test sonucu:", result);
    return result.status === 'success';
  } catch (error) {
    console.error('Iyzico bağlantı testi hatası:', error);
    return false;
  }
}

// Ödeme formu başlatma
export async function createPaymentCheckoutForm(config: IyzicoConfig, options: any): Promise<any> {
  try {
    return await makeIyzicoRequest(config, 'POST', '/payment/iyzipos/checkoutform/initialize', options);
  } catch (error) {
    console.error('Iyzico ödeme formu oluşturma hatası:', error);
    throw error;
  }
}

// Ödeme durumunu sorgulama
export async function retrievePayment(config: IyzicoConfig, token: string): Promise<any> {
  try {
    return await makeIyzicoRequest(config, 'POST', '/payment/iyzipos/checkoutform/auth/ecom/detail', {
      token
    });
  } catch (error) {
    console.error('Iyzico ödeme sorgulama hatası:', error);
    throw error;
  }
}

// İptal işlemi
export async function cancelPayment(config: IyzicoConfig, paymentId: string, description?: string): Promise<any> {
  try {
    return await makeIyzicoRequest(config, 'POST', '/payment/cancel', {
      paymentId,
      ip: '85.34.78.112', // Sunucu IP adresi ile değiştirin
      description: description || 'Sipariş iptal edildi'
    });
  } catch (error) {
    console.error('Iyzico iptal hatası:', error);
    throw error;
  }
}

// İade işlemi
export async function refundPayment(config: IyzicoConfig, paymentTransactionId: string, price: number, description?: string): Promise<any> {
  try {
    return await makeIyzicoRequest(config, 'POST', '/payment/refund', {
      paymentTransactionId,
      price,
      ip: '85.34.78.112', // Sunucu IP adresi ile değiştirin
      description: description || 'Sipariş iade edildi'
    });
  } catch (error) {
    console.error('Iyzico iade hatası:', error);
    throw error;
  }
} 