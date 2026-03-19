const BOT_TOKEN = process.env.BOT_TOKEN!;

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed: ${res.status}`);
  }
}

export async function sendTelegramVoice(chatId: number, voiceUrl: string): Promise<void> {
  // Download voice from Supabase Storage, send as multipart to Telegram
  const voiceRes = await fetch(voiceUrl);
  const voiceBuffer = await voiceRes.arrayBuffer();

  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  formData.append('voice', new Blob([voiceBuffer], { type: 'audio/ogg' }), 'voice.ogg');

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Telegram sendVoice failed: ${res.status}`);
  }
}
