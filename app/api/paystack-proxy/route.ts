import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'session-key') {
    // In Paystack production environment, check session cookie / authorization header
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';

    // If environment variable is configured in deployment environment
    const envKey = process.env.PAYSTACK_SECRET_KEY || process.env.NEXT_PUBLIC_PAYSTACK_TEST_KEY;
    if (envKey) {
      return NextResponse.json({ testSecretKey: envKey, source: 'environment' });
    }

    // In production Paystack hosting (paystack.com), forward session cookie to Paystack Auth Gateway
    if (cookieHeader.includes('paystack_session') || authHeader) {
      try {
        const authRes = await fetch('https://api.paystack.co/integration/keys', {
          headers: {
            Cookie: cookieHeader,
            Authorization: authHeader,
          },
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData?.data?.secret_key) {
            return NextResponse.json({ testSecretKey: authData.data.secret_key, source: 'session' });
          }
        }
      } catch {
        // Fall back to null if unauthenticated
      }
    }

    return NextResponse.json({ testSecretKey: null, source: 'unauthenticated' }, { status: 401 });
  }

  return NextResponse.json({ status: true, service: 'Paystack API Proxy Gateway' });
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const requestData = await request.json();
    const {
      endpoint,
      method = 'POST',
      apiKey: explicitKey,
      headers: incomingHeaders = {},
      body: payload,
    } = requestData;

    if (!endpoint) {
      return NextResponse.json(
        { status: false, message: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // Determine API Secret Key (Explicit request param -> Bearer header -> ENV variables)
    const headerAuth = incomingHeaders['Authorization'] || incomingHeaders['authorization'];
    const bearerKey = headerAuth ? headerAuth.replace(/^Bearer\s+/i, '') : '';
    const keyToUse = (
      explicitKey ||
      bearerKey ||
      process.env.PAYSTACK_SECRET_KEY ||
      process.env.NEXT_PUBLIC_PAYSTACK_TEST_KEY ||
      ''
    ).trim();

    if (!keyToUse) {
      return NextResponse.json(
        {
          status: false,
          message: 'Paystack Secret Key is required. Please set PAYSTACK_SECRET_KEY in .env.local or enter a valid test key (e.g. sk_test_...).',
        },
        { status: 400 }
      );
    }

    const paystackUrl = `https://api.paystack.co${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${keyToUse}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (incomingHeaders['X-Idempotency-Key']) {
      headers['X-Idempotency-Key'] = incomingHeaders['X-Idempotency-Key'];
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD' && payload) {
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(paystackUrl, fetchOptions);
    const duration = Date.now() - startTime;

    let responseData: any;
    try {
      responseData = await response.json();
    } catch {
      responseData = { status: false, message: 'Non-JSON response received from Paystack API' };
    }

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      durationMs: duration,
      data: responseData,
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        statusText: 'Internal Proxy Error',
        durationMs: duration,
        data: {
          status: false,
          message: err?.message || 'Failed to communicate with Paystack API',
        },
      },
      { status: 500 }
    );
  }
}
