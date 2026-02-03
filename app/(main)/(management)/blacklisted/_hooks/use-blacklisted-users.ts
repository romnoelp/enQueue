import { useState, useEffect } from "react";
import type { Blacklist } from "@/types/blacklist";
import { toast } from "sonner";
import { api } from "@/app/lib/config/api";
import { isAxiosError } from "axios";

// Custom hook to fetch and manage blacklisted users
export const useBlacklistedUsers = () => {
  const [blacklisted, setBlacklisted] = useState<Blacklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlacklisted = async () => {
      try {
        // Backend Firebase Functions route: GET /admin/blacklist
        const response = await api.get("/admin/blacklist");
        console.log("test", response.data)
        setBlacklisted(response.data.blacklistedEmails);
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message);
        } else {
          toast.error("Failed to load blacklisted users");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlacklisted();
  }, []);

  const blockUser = (newUser: Blacklist) => {
    setBlacklisted((prevList) => [newUser, ...prevList]);
  };

  const unblockUser = (targetUser: Blacklist) => {
    setBlacklisted((prevList) => prevList.filter((user) => user.email !== targetUser.email));
  };

  return {
    blacklisted,
    isLoading,
    blockUser,
    unblockUser
  };
};
