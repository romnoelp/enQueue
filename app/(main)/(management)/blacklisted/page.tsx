"use client";

import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as motion from "motion/react-client";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import BlacklistedUserCard from "@/components/mvpblocks/blacklisted-user-card";
import type { Blacklist } from "@/types/blacklist";
import Actions from "./_components/Actions";
import { toast } from "sonner";
import RemoveBlacklistDialog from "./_components/RemoveBlacklistDialog";
import AddBlacklistDialog from "./_components/AddBlacklistDialog";
import { useDialog } from "@/hooks/use-dialog";
import { getErrorMessage } from "@/lib/error-utils";
import { useBlacklistedUsers } from "./_hooks/use-blacklisted-users";
import { api } from "@/app/lib/config/api";

const Blacklisted = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmailMap, setUserEmailMap] = useState<Map<string, string>>(new Map());
  const emails = useRef<Set<string>>(new Set());

  const { blacklisted, isLoading, blockUser, unblockUser } = useBlacklistedUsers();
  const removeDialog = useDialog<Blacklist | null>(null);
  const addDialog = useDialog<boolean>(false);

  const loadUserEmail = useCallback(async (userId: string) => {
    if (emails.current.has(userId)) {
      return;
    }

    emails.current.add(userId);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      const email = res.data.user.email ?? null;
      if (email) {
        setUserEmailMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(userId, email);
          return newMap;
        });
      }
    } catch (error) {
      console.error(`Failed to fetch email for user ${userId}`, error);
    }
    emails.current.delete(userId);
  }, []);

  useEffect(() => {
    const uniqueUserIds = new Set(
      blacklisted.map((user) => user.blockedBy).filter(Boolean)
    );
    uniqueUserIds.forEach((userId) => {
      if (userId && !userEmailMap.has(userId) && !emails.current.has(userId)) {
        loadUserEmail(userId);
      }
    });
  }, [blacklisted, userEmailMap, loadUserEmail]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) {
      return blacklisted;
    }
    const query = searchQuery.toLowerCase();
    return blacklisted.filter((user) =>
      user.email.toLowerCase().includes(query) ||
      user.reason.toLowerCase().includes(query)
    );
  }, [blacklisted, searchQuery]);

  const confirmRemove = async () => {
    const selectedUser = removeDialog.data;

    if (!selectedUser?.email) {
      removeDialog.close();
      return;
    }

    try {
      removeDialog.setIsSaving(true);
      removeDialog.resetError();
      await api.delete(`/admin/blacklist/${selectedUser.email}`, )
      unblockUser(selectedUser);
      toast.success(`${selectedUser.email} removed from blacklist.`);
      removeDialog.close();
    } catch (error) {
      const message = getErrorMessage(error);
      removeDialog.setErrorMessage(message);
      toast.error(message);
    } finally {
      removeDialog.setIsSaving(false);
    }
  };

  // blockedBy is an employee user uid
  const confirmAdd = async (email: string, reason: string, blockedBy: string) => {
    try {
      addDialog.setIsSaving(true);
      addDialog.resetError();
      await api.post("/admin/blacklist", {
        email,
        reason,
        blockedBy
      });

      const blacklistedUser: Blacklist = { email, reason, blockedBy };
      blockUser(blacklistedUser);

      toast.success(`${email} has been blacklisted.`);
      addDialog.close();
    } catch (error) {
      const message = getErrorMessage(error);
      addDialog.setErrorMessage(message);
      toast.error(message);
    } finally {
      addDialog.setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col p-4">
        <Actions
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={blacklisted.length}
          filteredCount={filtered.length}
          onAddBlacklist={() => addDialog.open(true)}
        />

        <ScrollArea className="flex-1 mt-4">
          {isLoading && (
            <motion.div
              className="absolute inset-0 flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 70 }}
            >
              <BounceLoader />
            </motion.div>
          )}

          {!isLoading && filtered.length === 0 && (
            <motion.div
              className="flex justify-center items-center h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500 dark:text-gray-400">
                No blacklisted users found.
              </p>
            </motion.div>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {filtered.map((user, index) => (
                <motion.div
                  className="text-left"
                  key={user.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.02 * index,
                    type: "spring",
                    stiffness: 70,
                  }}
                >
                  <BlacklistedUserCard
                    email={user.email}
                    reason={user.reason}
                    blockedBy={user.blockedBy}
                    blockedByEmail={userEmailMap.get(user.blockedBy)}
                    onRemove={() => removeDialog.open(user)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <RemoveBlacklistDialog
        open={!!removeDialog.data}
        userEmail={removeDialog.data?.email ?? ""}
        reason={removeDialog.data?.reason ?? ""}
        blockedBy={removeDialog.data?.blockedBy ?? ""}
        onClose={removeDialog.close}
        onConfirm={confirmRemove}
        isSaving={removeDialog.isSaving}
        errorMessage={removeDialog.errorMessage}
      />

      <AddBlacklistDialog
        open={addDialog.isOpen}
        onClose={addDialog.close}
        onConfirm={confirmAdd}
        isSaving={addDialog.isSaving}
        errorMessage={addDialog.errorMessage}
      />
    </div>
  );
};

export default Blacklisted;
