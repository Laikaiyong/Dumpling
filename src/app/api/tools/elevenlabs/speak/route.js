import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, voiceId, modelId, outputFormat } = body;
    
    // Validate required fields
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }
    
    // Format URL with voice ID and output format
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'XB0fDUnXU5powFXDhCwa'}?output_format=${outputFormat || 'mp3_44100_128'}`;
    
    // Make request to ElevenLabs API
    const elevenlabsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Xi-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId || 'eleven_multilingual_v2',
      }),
    });
    
    if (!elevenlabsResponse.ok) {
      const error = await elevenlabsResponse.text();
      return NextResponse.json({ error: `ElevenLabs API error: ${error}` }, { status: elevenlabsResponse.status });
    }
    
    // Get audio data from ElevenLabs
    const audioData = await elevenlabsResponse.arrayBuffer();
    
    // Return audio data with appropriate headers
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
    
  } catch (error) {
    console.error('Error in ElevenLabs API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}