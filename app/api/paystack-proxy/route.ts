import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { endpoint, method = 'POST', apiKey, payload } = body;

    if (!endpoint) {
      return NextResponse.json(
        { status: false, message: 'Endpoint is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          status: false,
          message: 'Paystack Secret Key is required. Please enter a valid test key (e.g., sk_test_...).',
        },
        { status: 400 }
      );
    }

    const paystackUrl = `https://api.paystack.co${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

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
