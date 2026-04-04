import axios from 'axios';

// Create an Axios instance specifically configured for our backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // Large file uploads might take time, setting a healthy timeout
  timeout: 60000, // 60s for real Gemini Vision inference on large scans
});

/**
 * Setup interceptors to handle global loading and error states.
 * This is particularly useful for unified UI feedback during large DICOM/PNG uploads.
 * 
 * @param {Function} setLoading - State setter for loading status
 * @param {Function} setError - State setter for error messages
 */
export const setupInterceptors = (setLoading, setError) => {
  // Request Interceptor: Triggered before the request is sent
  api.interceptors.request.use(
    (config) => {
      // Clear previous errors and set loading to true
      setError(null);
      setLoading(true);
      return config;
    },
    (error) => {
      setLoading(false);
      setError('An error occurred while preparing the upload.');
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Triggered when a response is received or an error occurs
  api.interceptors.response.use(
    (response) => {
      // Request successful, turn off loading
      setLoading(false);
      return response;
    },
    (error) => {
      setLoading(false);
      
      // Determine the type of error for user-friendly feedback
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        setError(error.response.data?.message || 'Server returned an error.');
      } else if (error.request) {
        // The request was made but no response was received (e.g., network issue or timeout)
        if (error.code === 'ECONNABORTED') {
          setError('Upload timed out. The file might be too large or the network is slow.');
        } else {
          setError('Network error. Please check your connection and try again.');
        }
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred.');
      }
      return Promise.reject(error);
    }
  );
};

export default api;
