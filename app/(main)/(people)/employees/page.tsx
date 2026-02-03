"use client";

import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as motion from "motion/react-client";
import { useEffect, useState, useMemo } from "react";
import EmployeeCard from "@/components/mvpblocks/employee-card";
import type Employee from "@/types/employee";
import { UserRole } from "@/types/auth";
import Actions from "./_components/Actions";
import {
  getRoleLabel,
} from "@/app/(main)/(people)/employees/_utils/role";
import ChangeRoleDialog from "./_components/ChangeRoleDialog";
import { toast } from "sonner";
import { api } from "@/app/lib/config/api";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const Employee = () => {
  // const { data: session } = useSession();
  const session = { user: { id: "1", email: "test@example.com" } }; // Static value
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEmployees = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await api.get("/admin/employees", {
        params: {
          limit: 20,
        },
      });
      const cursor = response.data?.nextCursor ?? null;
      setEmployees(response.data.employees ?? []);
      setNextCursor(cursor);
      setError(null);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? String(err));
      if (isAxiosError(err)) {
        console.log(err.response?.data);
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const loadMoreEmployees = async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const response = await api.get("/admin/employees", {
        params: {
          cursor: nextCursor,
          limit: 20,
        },
      });

      const cursor = response.data?.nextCursor ?? null;
      setEmployees((prev) => [...prev, ...(response.data.employees ?? [])]);
      setNextCursor(cursor);
      setError(null);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError((err as { message?: string })?.message ?? String(err));
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) void fetchEmployees();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    return employees.filter((employee) => {
      // Filter by role
      if (roleFilter !== "all" && employee.role !== roleFilter) {
        return false;
      }
      
      // Filter by search query
      if (query) {
        const nameMatch = employee.name?.toLowerCase().includes(query);
        const emailMatch = employee.email?.toLowerCase().includes(query);
        return nameMatch || emailMatch;
      }
      
      return true;
    });
  }, [employees, searchQuery, roleFilter]);

  const openRoleDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedRole(null);
    setErrorMessage(null);
  };

  const closeRoleDialog = () => {
    setSelectedEmployee(null);
    setSelectedRole(null);
    setIsSaving(false);
    setErrorMessage(null);
  };

  const handleSaveRole = async () => {
    if (!selectedEmployee?.uid) {
      closeRoleDialog();
      return;
    }
    if (!selectedRole || selectedRole === selectedEmployee.role) {
      closeRoleDialog();
      return;
    }
    try {
      setIsSaving(true);
      setErrorMessage(null);
       await api.post("/admin/assign-role", {
        userId: selectedEmployee.uid,
        role: selectedRole,
      });

      setEmployees((prevEmployees) => {
        if (selectedRole === "pending") {
          // Remove employee from list if role is changed to pending
          return prevEmployees.filter(
            (emp) => emp.uid !== selectedEmployee.uid
          );
        }
        // Otherwise, update the role
        return prevEmployees.map((employee) =>
          employee.uid === selectedEmployee.uid
            ? { ...employee, role: selectedRole }
            : employee
        );
      });
      toast.success(
        `${selectedEmployee.name}'s role changed to ${getRoleLabel(
          selectedRole
        )}`
      );
      closeRoleDialog();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Failed to update role";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="h-full flex justify-center items-center">
        <BounceLoader />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col p-4">
        <Actions
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          totalCount={employees.length}
          filteredCount={filteredEmployees.length}
        />

        {isLoading ? (
          <motion.div
            className="flex-1 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 70 }}
          >
            <BounceLoader />
          </motion.div>
        ) : error ? (
          <motion.div
            className="flex-1 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-red-500">Error loading employees: {error}</p>
          </motion.div>
        ) : (
          <ScrollArea className="h-full flex-1 mt-4">
            {filteredEmployees.length === 0 && (
              <motion.div
                className="flex justify-center items-center h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-500 dark:text-gray-400">
                  No employees found matching your criteria.
                </p>
              </motion.div>
            )}

            {filteredEmployees.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((employee, index) => (
                    <motion.button
                      key={employee.uid ?? employee.email}
                      type="button"
                      onClick={() => openRoleDialog(employee)}
                      className="text-left"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.02 * index,
                        type: "spring",
                        stiffness: 70,
                      }}
                    >
                      <EmployeeCard
                        name={employee.name}
                        email={employee.email}
                        role={employee.role}
                        uid={employee.uid}
                      />
                    </motion.button>
                  ))}
                </div>
                {nextCursor && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => void loadMoreEmployees()}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <Spinner className="mr-2" /> Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        )}
      </div>

      <ChangeRoleDialog
        open={!!selectedEmployee}
        employee={selectedEmployee}
        selectedRole={selectedRole}
        onSelectedRoleChange={(newRole) => setSelectedRole(newRole)}
        onClose={closeRoleDialog}
        onSave={handleSaveRole}
        isSaving={isSaving}
        errorMessage={errorMessage}
      />
    </div>
  );
};
export default Employee;
