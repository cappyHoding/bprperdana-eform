import { useState, useEffect } from 'react';

const VIDA_SDK_VERSION = '1.0.5';
const VIDA_SDK_SANDBOX_URL = `https://web-sdk.vida.id/${VIDA_SDK_VERSION}/sandbox/vida-web-sdk.js`;
const VIDA_SDK_PRODUCTION_URL = `https://web-sdk.vida.id/${VIDA_SDK_VERSION}/vida-web-sdk.js`;

interface UseVidaSDKOptions {
    sandbox?: boolean;
}

interface UseVidaSDKReturn {
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;
}

export const useVidaSDK = (options?: UseVidaSDKOptions): UseVidaSDKReturn => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if script already exists
        const existingScript = document.querySelector('script#vida-sdk');
        if (existingScript) {
            setIsLoaded(true);
            return;
        }

        // Check if SDK is already loaded
        if (window.VidaSDK) {
            setIsLoaded(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        const script = document.createElement('script');
        script.id = 'vida-sdk';
        script.src = options?.sandbox ? VIDA_SDK_SANDBOX_URL : VIDA_SDK_PRODUCTION_URL;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log('VIDA SDK loaded successfully');
            setIsLoaded(true);
            setIsLoading(false);
        };

        script.onerror = () => {
            console.error('Failed to load VIDA SDK');
            setError('Failed to load VIDA SDK');
            setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
            const scriptToRemove = document.querySelector('script#vida-sdk');
            if (scriptToRemove) {
                document.body.removeChild(scriptToRemove);
            }
        };
    }, [options?.sandbox]);

    return { isLoaded, isLoading, error };
}