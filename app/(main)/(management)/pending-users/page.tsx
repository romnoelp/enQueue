"use client";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as motion from "motion/react-client";
import { useEffect, useMemo, useState } from "react";
import PendingEmployeeCard from "@/components/mvpblocks/pending-employee-card";
import type Employee from "@/types/employee";
import Actions from "./_components/Actions";
import type { UserRole } from "@/types/auth";
import { toast } from "sonner";
import AssignRoleDialog from "./_components/AssignRoleDialog";
import { api } from "@/app/lib/config/api";
import { getRoleLabel } from "@/app/(main)/(people)/employees/_utils/role";
import { isAxiosError } from "axios";

// Dialog state for role assignment
const useAssignRoleDialog = () => {
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = (user: Employee) => {
    setSelectedUser(user);
    setSelectedRole("information");
    setIsSaving(false);
    setErrorMessage(null);
  };

  const close = () => {
    setSelectedUser(null);
    setSelectedRole(null);
    setIsSaving(false);
    setErrorMessage(null);
  };

  const resetError = () => setErrorMessage(null);

  return {
    selectedUser,
    selectedRole,
    isSaving,
    errorMessage,
    setSelectedRole,
    setIsSaving,
    setErrorMessage,
    open,
    close,
    resetError,
  };
};

const PendingUsers = () => {
  const [pending, setPending] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const dialog = useAssignRoleDialog();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await api.get("/admin/pending-users");
        setPending(response.data.pendingUsers);
      } catch (error) {
        console.error("Failed to load pending users", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      return pending;
    }
    
    return pending.filter((user) => {
      const nameMatch = user.name?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      return nameMatch || emailMatch;
    });
  }, [pending, searchQuery]);

  const confirmAssignRole = async () => {
    const { selectedUser, selectedRole } = dialog;

    if (!selectedUser?.uid || !selectedRole) {
      dialog.close();
      return;
    }

    try {
      dialog.setIsSaving(true);
      dialog.resetError();
      await api.post("/admin/assign-role", {
        userId: selectedUser.uid,
        role: selectedRole,
      });
      setPending((prev) => {
        return prev.filter((user) => {
          if (selectedUser.uid && user.uid) {
            return selectedUser.uid !== user.uid;
          }
          if (selectedUser.email) {
            return selectedUser.email !== user.email;
          }
          return user !== selectedUser;
        });
      });
      toast.success(
        `${selectedUser.name} accepted as ${getRoleLabel(selectedRole)}.`
      );
      dialog.close();
    } catch (error) {
      const message = isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : error instanceof Error
        ? error.message
        : "Failed to assign role";
      dialog.setErrorMessage(message);
      toast.error(message);
    } finally {
      dialog.setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col p-4">
        <Actions
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={pending.length}
          filteredCount={filtered.length}
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
                No pending users found.
              </p>
            </motion.div>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {filtered.map((user, index) => (
                <motion.div
                  className="text-left"
                  key={user.uid ?? user.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.02 * index,
                    type: "spring",
                    stiffness: 70,
                  }}
                >
                  <PendingEmployeeCard
                    name={user.name}
                    email={user.email}
                    role={user.role}
                    onAccept={() => dialog.open(user)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <AssignRoleDialog
        open={!!dialog.selectedUser}
        userDisplay={
          dialog.selectedUser
            ? dialog.selectedUser.name || dialog.selectedUser.email
            : ""
        }
        selectedRole={dialog.selectedRole}
        onSelectedRoleChange={dialog.setSelectedRole}
        onClose={dialog.close}
        onConfirm={confirmAssignRole}
        isSaving={dialog.isSaving}
        errorMessage={dialog.errorMessage}
      />
    </div>
  );
};

export default PendingUsers;
