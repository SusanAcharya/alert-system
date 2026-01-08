import { NextResponse } from 'next/server';
import { setWebhook, deleteWebhook } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, webhookUrl, secretToken } = body;

    if (action === 'set') {
      if (!webhookUrl) {
        return NextResponse.json(
          { error: 'webhookUrl is required' },
          { status: 400 }
        );
      }

      const result = await setWebhook(webhookUrl, secretToken);
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook set successfully',
        result 
      });
    } else if (action === 'delete') {
      const result = await deleteWebhook();
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook deleted successfully',
        result 
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "set" or "delete"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error managing webhook:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage webhook',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Telegram webhook setup endpoint',
    usage: {
      set: 'POST with { action: "set", webhookUrl: "https://your-domain.com/api/telegram/webhook", secretToken?: "optional" }',
      delete: 'POST with { action: "delete" }'
    }
  });
}

