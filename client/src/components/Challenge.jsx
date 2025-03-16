import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useGame } from '../contexts/GameContext';
import { createChallenge } from '../lib/pocketbase';
import Card from './Card';
import Button from './Button';

const Challenge = () => {
  const { username, score, collectedEmojis } = useGame();
  const [challengeCode, setChallengeCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef(null);
  
  // Base URL for the challenge
  const baseUrl = window.location.origin;
  const challengeUrl = `${baseUrl}/challenge/${challengeCode}`;
  
  // Generate a challenge code when the component mounts
  useEffect(() => {
    // Generate a random challenge code
    const generateChallengeCode = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };
    
    setChallengeCode(generateChallengeCode());
  }, []);
  
  const handleCreateChallenge = async () => {
    setIsLoading(true);
    
    try {
      // Get the last 5 destinations played or fewer if not enough
      const destinations = collectedEmojis.length > 0 
        ? collectedEmojis.slice(-5) 
        : ['🗽', '🗼', '🏛️']; // Default emojis if none collected
      
      console.log('Creating challenge with destinations:', destinations);
      
      // Create the challenge in PocketBase
      const challenge = await createChallenge(username, destinations);
      
      // If successful, update the challenge code with the one from PocketBase
      if (challenge && challenge.challenge_code) {
        console.log('Challenge created successfully:', challenge);
        setChallengeCode(challenge.challenge_code);
      }
      
      setShowQR(true);
    } catch (error) {
      console.error('Error creating challenge:', error);
      // Continue with the generated code if PocketBase fails
      alert('Could not save challenge to server. Using local challenge instead.');
      setShowQR(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(challengeUrl)
      .then(() => {
        alert('Challenge link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please copy it manually.');
      });
  };
  
  const handleShareWhatsApp = () => {
    const message = `Hey! I challenge you to beat my score of ${score} points in the Globetrotter Challenge! Click here to play: ${challengeUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleDownloadQR = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `globetrotter-challenge-${challengeCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };
  
  return (
    <Card className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Challenge a Friend</h2>
      
      {!showQR ? (
        <div>
          <p className="text-gray-600 mb-6 text-center">
            Create a challenge and invite your friends to beat your score!
          </p>
          
          <Button 
            onClick={handleCreateChallenge} 
            variant="primary" 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Creating Challenge...' : 'Create Challenge'}
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Share this challenge with your friends:
            </p>
            <p className="font-semibold text-lg mb-4">
              Challenge Code: {challengeCode}
            </p>
            
            <div 
              ref={qrRef}
              className="bg-white p-4 rounded-lg inline-block mb-4"
            >
              <QRCode 
                value={challengeUrl} 
                size={200}
                level="H"
                includeMargin={true}
                renderAs="canvas"
              />
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Current Score: {score} points
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handleCopyLink} 
              variant="secondary"
            >
              <span className="mr-2">📋</span> Copy Challenge Link
            </Button>
            
            <Button 
              onClick={handleShareWhatsApp} 
              variant="accent"
            >
              <span className="mr-2">📱</span> Share on WhatsApp
            </Button>
            
            <Button 
              onClick={handleDownloadQR} 
              variant="outline"
            >
              <span className="mr-2">📥</span> Download QR Code
            </Button>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default Challenge;
