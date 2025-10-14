import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { npcId } = body;

    if (!npcId) {
      return NextResponse.json({ error: 'npcId is required' }, { status: 400 });
    }

    // Получаем NPC из БД
    const npc = await prisma.nPC.findUnique({
      where: { id: npcId },
    });

    if (!npc) {
      return NextResponse.json({ error: 'NPC not found' }, { status: 404 });
    }

    // Формируем промпт для DALL-E
    const prompt = `Fantasy RPG character portrait: ${npc.name}, ${npc.race} ${npc.class}. ${npc.appearance || 'Detailed fantasy character'}. Professional digital art, highly detailed, fantasy art style, D&D character portrait.`;

    console.log('[PORTRAIT] Generating image for:', npc.name);
    console.log('[PORTRAIT] Prompt:', prompt);

    // Вызываем OpenAI DALL-E API
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[PORTRAIT] OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    console.log('[PORTRAIT] Image generated:', imageUrl);

    // Обновляем NPC с URL изображения
    const updatedNPC = await prisma.nPC.update({
      where: { id: npcId },
      data: { imageUrl },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      npc: updatedNPC,
    });
  } catch (error: any) {
    console.error('Error generating portrait:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate portrait' },
      { status: 500 }
    );
  }
}


