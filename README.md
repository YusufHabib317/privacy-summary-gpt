# Privacy Policy & Terms Analyzer API

A Next.js API service that analyzes privacy policies and terms of service using OpenAI's GPT API.

## Setup

1. Clone and install dependencies:
```bash
git clone [repository-url]
cd [project-name]
npm install
```

2. Create `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

3. Run development server:
```bash
npm run dev
```

## API Endpoint

### POST /api/gpt

Analyzes privacy policies or terms of service documents.

#### Request
```json
{
  "text": "privacy policy text here",
  "type": "privacy" | "terms"
}
```

#### Response
```json
{
  "summary": "Brief summary",
  "keyPoints": ["Point 1", "Point 2"],
  "implications": ["Implication 1", "Implication 2"],
  "concerns": ["Concern 1", "Concern 2"],
  "score": 7
}
```

## Project Structure
```
src/
  app/
    api/
      gpt/
        route.ts  # API endpoint handler
```

## Key Files

`route.ts`:
```typescript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  // Handles document analysis
}
```

## Environment Variables

|
 Variable 
|
 Description 
|
|
----------
|
-------------
|
|
 OPENAI_API_KEY 
|
 Your OpenAI API key 
|

## Error Handling

- 400: Missing text
- 500: OpenAI API errors
- 403: Region restrictions

## CORS Configuration

Configured to accept requests from:
- Chrome extension
- localhost development