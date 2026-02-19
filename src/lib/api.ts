import axios, {AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import type {
  ApiResponse,
  OcrApiResponse,
  VidaTokenResponse,
  VidaLivenessSubmitData,
  VidaLivenessVerifyData,
  VidaLivenessVerifyResult,
  FormSubmitResponse,
} from '@/types/api';

const PERDANA_EFORM_API_BASE_URL = import.meta.env.PERDANA_EFORM_SERVICE_URL || 'http://localhost:8081/api/v1/';

// Create axios instance with base configuration
const apiClient : AxiosInstance = axios.create({
  baseURL: PERDANA_EFORM_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const { method, url } = config;
  console.log(`🚀 [API] ${method?.toUpperCase()} ${url} | Request`);

  // const token = localStorage.getItem('auth_token');
  // if (token && config.headers) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }

  return config;
}

// Response Interceptor
const onResponse = (response: AxiosResponse): AxiosResponse => {
  const { method, url } = response.config;
  const { status } = response;

  console.log(`[API] ${method?.toUpperCase()} ${url} | Response ${status}`);

  return response;
};

const onErrorResponse = (error: AxiosError | Error): Promise<AxiosError> => {
  if (axios.isAxiosError(error)) {
    const { message } = error;
    const { method, url } = error.config as InternalAxiosRequestConfig;
    const { status, statusText } = error.response || {};

    console.error(
        `❌ [API] ${method?.toUpperCase()} ${url} | Error ${status} ${statusText} | ${message}`
    );

    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        console.error('Unauthorized access - redirecting to login');
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        break;
      case 403:
        console.error('Forbidden access');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 500:
        console.error('Internal server error');
        break;
      default:
        console.error('API Error:', error.message);
    }
  } else {
    console.error('Unexpected Error:', error);
  }

  return Promise.reject(error);
}

apiClient.interceptors.request.use(onRequest, onErrorResponse)
apiClient.interceptors.response.use(onResponse, onErrorResponse)

export default apiClient;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsDataURL(file);
  });
};

// Process KTP OCR dengan base64 image
export const ocrApi = {
  // Process KTP OCR dengan base64 image
  processKtp: async (file: File): Promise<OcrApiResponse> => {
    try {
      // Convert file to base64
      const base64String = await fileToBase64(file);

      // Send POST request dengan base64 string di body
      const response = await apiClient.post<OcrApiResponse>(
          'ekyc/ocr',
          {
            ktp_image_base64: base64String
          }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
          error.response?.data?.message ||
          error.message ||
          'Gagal memproses KTP'
      );
    }
  },
};

export const vidaApi = {
  /**
   * Get VIDA access token from backend
   * @returns Access token and signing key
   */
  getVidaToken: async (): Promise<{ token: string; signingKey: string }> => {
    try {
      console.log('🔄 Getting VIDA token...');

      const response = await apiClient.post<VidaTokenResponse>(
          'ekyc/liveness/token'
      );

      if (response.data.success && response.data.data) {
        const { access_token } = response.data.data;
        const signingKey = import.meta.env.VITE_VIDA_SIGNING_KEY || '';

        console.log('✅ Token received:', {
          tokenLength: access_token?.length || 0,
          tokenPreview: access_token?.substring(0, 50) + '...',
          hasSigningKey: !!signingKey,
          signingKeyLength: signingKey?.length || 0,
          tokenType: response.data.data.token_type,
          expiresIn: response.data.data.expires_in,
          expiresAt: response.data.data.expires_at,
        });

        if (!access_token || access_token.length === 0) {
          throw new Error('Token is empty or invalid');
        }

        if (!signingKey || signingKey.length === 0) {
          console.warn('⚠️ Signing key is empty! Check VITE_VIDA_SIGNING_KEY in .env');
        }

        return {
          token: access_token,
          signingKey,
        };
      }

      throw new Error(response.data.message || 'Failed to get VIDA token');
    } catch (error: any) {
      console.error('❌ VIDA token error:', error);
      throw new Error(
          error.response?.data?.message ||
          error.message ||
          'Failed to authenticate with VIDA'
      );
    }
  },

  /**
   * Submit liveness verification result to backend
   * @param data - Selfie image and transaction info
   */
  submitLivenessResult: async (
      data: VidaLivenessSubmitData
  ): Promise<ApiResponse> => {
    try {
      console.log('🔄 Submitting liveness result...');

      const response = await apiClient.post<ApiResponse>(
          '/api/v1/ekyc/liveness',
          {
            selfie_image: data.selfieImage,
            transaction_id: data.transactionId,
            liveness_score: data.livenessScore,
            vida_transaction_id: data.vidaTransactionId,
          }
      );

      console.log('✅ Liveness submitted');
      return response.data;
    } catch (error: any) {
      console.error('❌ Submit liveness error:', error);
      throw new Error(
          error.response?.data?.message ||
          error.message ||
          'Failed to submit liveness result'
      );
    }
  },

  /**
   * Verify liveness with face matching
   * @param data - KTP image and selfie image
   * @returns Face matching result
   */
  verifyLiveness: async (
      data: VidaLivenessVerifyData
  ): Promise<ApiResponse<VidaLivenessVerifyResult>> => {
    try {
      console.log('🔄 Verifying liveness...');

      const response = await apiClient.post<ApiResponse<VidaLivenessVerifyResult>>(
          '/api/v1/ekyc/verify-liveness',
          {
            ktp_image: data.ktpImage,
            selfie_image: data.selfieImage,
          }
      );

      console.log('✅ Liveness verified');
      return response.data;
    } catch (error: any) {
      console.error('❌ Verify liveness error:', error);
      throw new Error(
          error.response?.data?.message ||
          error.message ||
          'Failed to verify liveness'
      );
    }
  },
};
// ========== Form Submission APIs ==========

export const formApi = {
  // Submit Deposito Form
  submitDeposito: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/v1/forms/deposito', data);
    return response.data;
  },

  // Submit Tabungan Form
  submitTabungan: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/v1/forms/tabungan', data);
    return response.data;
  },

  // Submit Pinjaman Form
  submitPinjaman: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/v1/forms/pinjaman', data);
    return response.data;
  },

  // Submit Pengkinian Data Form
  submitPengkinian: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/v1/forms/pengkinian', data);
    return response.data;
  },
};