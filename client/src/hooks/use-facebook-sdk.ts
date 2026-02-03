/**
 * Facebook SDK Hook
 * Manages Facebook SDK initialization and login state.
 * Used for Instagram Business API OAuth flow.
 */

import { useCallback, useEffect, useState } from "react";
import type {
  FacebookLoginStatusResponse,
  FacebookPagesResponse,
  FacebookPageWithInstagram,
} from "@/types/facebook-sdk.d";

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
}

interface UseFacebookSDKReturn {
  isLoaded: boolean;
  isLoggedIn: boolean;
  loginStatus: FacebookLoginStatusResponse["status"] | null;
  accessToken: string | null;
  userId: string | null;
  instagramAccount: InstagramAccount | null;
  login: () => Promise<FacebookLoginStatusResponse>;
  logout: () => Promise<void>;
  getInstagramAccount: () => Promise<InstagramAccount | null>;
  checkLoginStatus: () => Promise<FacebookLoginStatusResponse>;
}

/**
 * Hook to manage Facebook SDK and Instagram Business API integration
 */
export function useFacebookSDK(): UseFacebookSDKReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loginStatus, setLoginStatus] = useState<FacebookLoginStatusResponse["status"] | null>(
    null
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [instagramAccount, setInstagramAccount] = useState<InstagramAccount | null>(null);

  const handleStatusChange = useCallback((response: FacebookLoginStatusResponse) => {
    setLoginStatus(response.status);

    if (response.status === "connected" && response.authResponse) {
      setAccessToken(response.authResponse.accessToken);
      setUserId(response.authResponse.userID);
    } else {
      setAccessToken(null);
      setUserId(null);
      setInstagramAccount(null);
    }
  }, []);

  // Check if SDK is loaded
  useEffect(() => {
    const checkSDK = () => {
      if (window.FB) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkSDK()) return;

    // Poll for SDK load (it loads async)
    const interval = setInterval(() => {
      if (checkSDK()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Check login status when SDK loads
  useEffect(() => {
    if (isLoaded && window.FB) {
      window.FB.getLoginStatus((response) => {
        handleStatusChange(response);
      });
    }
  }, [isLoaded, handleStatusChange]);

  const checkLoginStatus = useCallback((): Promise<FacebookLoginStatusResponse> => {
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve({ status: "unknown" });
        return;
      }

      window.FB.getLoginStatus((response) => {
        handleStatusChange(response);
        resolve(response);
      });
    });
  }, [handleStatusChange]);

  const login = useCallback((): Promise<FacebookLoginStatusResponse> => {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error("Facebook SDK not loaded"));
        return;
      }

      // Request permissions for Instagram Business API
      window.FB.login(
        (response: FacebookLoginStatusResponse) => {
          handleStatusChange(response);
          resolve(response);
        },
        {
          scope: "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
          return_scopes: true,
        }
      );
    });
  }, [handleStatusChange]);

  const logout = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve();
        return;
      }

      window.FB.logout(() => {
        setLoginStatus("unknown");
        setAccessToken(null);
        setUserId(null);
        setInstagramAccount(null);
        resolve();
      });
    });
  }, []);

  const getInstagramAccount = useCallback((): Promise<InstagramAccount | null> => {
    return new Promise((resolve) => {
      if (!window.FB || !accessToken) {
        resolve(null);
        return;
      }

      // First get user's Facebook Pages
      window.FB.api<FacebookPagesResponse>("/me/accounts", (pagesResponse) => {
        if (pagesResponse.error || !pagesResponse.data?.length) {
          resolve(null);
          return;
        }

        // Get Instagram Business Account connected to the first page
        const pageId = pagesResponse.data[0].id;
        window.FB.api<FacebookPageWithInstagram>(
          `/${pageId}?fields=instagram_business_account{id,username,name}`,
          (igResponse) => {
            if (igResponse.error || !igResponse.instagram_business_account) {
              resolve(null);
              return;
            }

            const account: InstagramAccount = {
              id: igResponse.instagram_business_account.id,
              username: igResponse.instagram_business_account.username,
              name: igResponse.instagram_business_account.name,
            };

            setInstagramAccount(account);
            resolve(account);
          }
        );
      });
    });
  }, [accessToken]);

  return {
    isLoaded,
    isLoggedIn: loginStatus === "connected",
    loginStatus,
    accessToken,
    userId,
    instagramAccount,
    login,
    logout,
    getInstagramAccount,
    checkLoginStatus,
  };
}
