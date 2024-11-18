import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { text, type } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    const systemPrompt = `Analyze this ${type === 'privacy' ? 'privacy policy' : 'terms of service'} document and provide:
    1. A clear, concise summary (2-3 sentences)
    2. Key points (bullet points of important information)
    3. Important user implications (what this means for users)
    4. Potential privacy/security concerns
    5. User-friendliness score (1-10) with brief explanation

    Format the response with clear section breaks using double newlines.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const sections = content.split('\n\n');
    const analysis = {
      summary: sections[0],
      keyPoints: sections[1]?.split('\n')
        .filter(point => point.trim())
        .map(point => point.replace(/^[•\-*]\s*/, '')),
      implications: sections[2]?.split('\n')
        .filter(imp => imp.trim())
        .map(imp => imp.replace(/^[•\-*]\s*/, '')),
      concerns: sections[3]?.split('\n')
        .filter(concern => concern.trim())
        .map(concern => concern.replace(/^[•\-*]\s*/, '')),
      score: parseInt(sections[4]?.match(/\d+/)?.[0] || '0'),
    };

    return NextResponse.json(analysis, { headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}