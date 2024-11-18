import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(req: Request) {
  const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
  try {

    const { text, type } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400, headers:corsHeaders }
      );
    }

        const systemPrompt = `You are an expert at analyzing ${
      type === 'privacy' ? 'privacy policies' : 'terms of service'
    } documents. Analyze the following document and provide:
    1. A clear, concise summary
    2. Key points in bullet points
    3. Important user implications
    4. Potential privacy/security concerns
    5. User-friendliness score (1-10)`;

    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        }
      }
    );

    const content = response.data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from API');
    }

    const sections = content.split('\n\n');
    const analysis = {
      summary: sections[0],
      keyPoints: sections[1]?.split('\n').filter((point:string) => point.trim()),
      implications: sections[2]?.split('\n').filter((imp:string) => imp.trim()),
      concerns: sections[3]?.split('\n').filter((concern:string) => concern.trim()),
      score: parseInt(sections[4]?.match(/\d+/)?.[0] || '0'),
    };

    return NextResponse.json(analysis, { headers:corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    let errorMessage = 'Failed to process document';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500, headers:corsHeaders });
  }
}