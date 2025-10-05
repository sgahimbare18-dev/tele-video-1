import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

interface VirtualBackgroundProcessorProps {
  inputStream: MediaStream | null;
  enabled: boolean;
  onProcessedStream: (stream: MediaStream | null) => void;
}

const VirtualBackgroundProcessor: React.FC<VirtualBackgroundProcessorProps> = ({
  inputStream,
  enabled,
  onProcessedStream
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [segmenter, setSegmenter] = useState<bodySegmentation.BodySegmenter | null>(null);
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize TensorFlow and Body Segmentation model
  useEffect(() => {
    const initializeModel = async () => {
      try {
        await tf.ready();
        const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
        const segmenterConfig: bodySegmentation.MediaPipeSelfieSegmentationMediaPipeModelConfig = {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
          modelType: 'general'
        };
        const newSegmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
        setSegmenter(newSegmenter);
      } catch (error) {
        console.error('Failed to initialize virtual background model:', error);
      }
    };

    initializeModel();
  }, []);

  // Process video frames
  const processFrame = () => {
    if (!canvasRef.current || !videoRef.current || !enabled) {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // For now, just apply a simple blur effect to the entire frame
    // This is a placeholder - full body segmentation would require more complex implementation
    ctx.filter = 'blur(2px)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none'; // Reset filter
  };

  // Animation loop
  const animate = () => {
    if (enabled && videoRef.current && videoRef.current.readyState >= 2) {
      processFrame();
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle input stream changes
  useEffect(() => {
    if (!inputStream || !enabled) {
      if (processedStream) {
        processedStream.getTracks().forEach(track => track.stop());
        setProcessedStream(null);
        onProcessedStream(null);
      }
      return;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = inputStream;
      videoRef.current.play().then(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const stream = canvas.captureStream(30); // 30 FPS
          setProcessedStream(stream);
          onProcessedStream(stream);
          animate();
        }
      }).catch(console.error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [inputStream, enabled, onProcessedStream]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (processedStream) {
        processedStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [processedStream]);

  return (
    <div style={{ display: 'none' }}>
      <video ref={videoRef} muted playsInline />
      <canvas ref={canvasRef} />
    </div>
  );
};

export default VirtualBackgroundProcessor;
