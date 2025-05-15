'use client';

import { useState, useCallback, useMemo } from 'react';
import { ElevenLabsClient } from 'elevenlabs';

export function useSpeech(apiKey) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentVoiceId, setCurrentVoiceId] = useState("JBFqnCBsd6RMkjVDRZzb");
  const [audioPlayer, setAudioPlayer] = useState(null);

  // Create ElevenLabs client with provided API key or fallback to env variable
  const client = useMemo(() => new ElevenLabsClient({
    apiKey: apiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
  }), [apiKey]);

  // Stop any currently playing audio
  const stopSpeaking = useCallback(() => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
  }, [audioPlayer]);

  const speak = useCallback(async (text, voiceId = currentVoiceId) => {
    if (isLoading) return null;
    
    stopSpeaking();
    setIsLoading(true);
    setError(null);

    try {
      // Convert text to speech using ElevenLabs
      const audio = await client.textToSpeech.convert(
        voiceId,
        {
          text: text.substring(0, 1000), // Limit to 1000 chars
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
        }
      );

      console.log(audio);

      // Create an audio element and play it
      const blob = new Blob([audio], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      
      const player = new Audio(url);
      setAudioPlayer(player);
      
      // Play the audio
      player.play();

      // Clean up the URL when done
      player.addEventListener('ended', () => {
        URL.revokeObjectURL(url);
        setIsLoading(false);
      });

      return url;
    } catch (err) {
      console.error('Speech generation error:', err);
      setError(err.message || 'Failed to generate speech');
      setIsLoading(false);
      return null;
    }
  }, [client, currentVoiceId, isLoading, stopSpeaking]);

  // Change voice
  const setVoice = useCallback((voiceId) => {
    setCurrentVoiceId(voiceId);
  }, []);

  return {
    speak,
    stopSpeaking,
    setVoice,
    isLoading,
    error,
    currentVoiceId
  };
}