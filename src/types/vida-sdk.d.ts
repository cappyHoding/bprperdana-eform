declare global {
    interface Window {
        VidaSDK?: {
            init: (config: any) => void;
            destroy: () => void;
        }
    }
}

export interface VidaSDKConfig {
    token: string;
    signingKey: string;
    elementId?: string;
    locale?: 'EN' | 'ID';
    partnerTransactionId?: string;
    workflowConfigs?: VidaWorkflowConfig;
    themeConfigs?: VidaThemeConfig;
    localeConfigs?: VidaLocaleConfig;
    onComplete?: (data: VidaCompleteData) => void;
    onError?: (error: VidaErrorData) => void;
    onSelfieCapture?: (image: string) => void;
}

export interface VidaWorkflowConfig {
    liveness?: {
        skipTutorialScreen?: boolean;
        skipSelfieReviewScreen?: boolean;
        cameraFrameShape?: 'OVAL' | 'CIRCLE' | 'SQUARE' | 'RECTANGLE';
        maxRetryAttempts?: number;
        detectionTimeOut?: number;
        detectionTimeOutCountdownDuration?: number;
        hideDetectionTimeOutCountdownAlert?: boolean;
        hideMaxRetryError?: boolean;
        hideErrorCodeOnSelfieReview?: boolean;
    };
}

export interface VidaThemeConfig {
    primaryButtonBgColor?: string;
    primaryButtonTextColor?: string;
    secondaryButtonBgColor?: string;
    secondaryButtonTextColor?: string;
    titleTextColor?: string;
    descriptionTextColor?: string;
    instructionTextColor?: string;
    cameraFrameColor?: string;
    cameraFrameBgColor?: string;
    loadingSpinnerColor?: string;
}

export interface VidaLocaleConfig {
    // Add custom locale configs if needed
    [key: string]: any;
}

export interface VidaCompleteData {
    base64Image: string;
    imgManipulationScore?: number;
    liveImage: boolean;
    message: string;
    score: number;
    transactionId?: string;
}

export interface VidaErrorData {
    errorCode: string;
    errorMessage: string;
    details?: any;
}

export {};