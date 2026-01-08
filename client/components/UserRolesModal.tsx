import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as api from "@/lib/api";

interface Role {
  _id: string;
  name: string;
  description?: string;
}

interface UserRolesModalProps {
  userName: string;
  assignedRoleIds: string[];
  onAssignRoles: (roleIds: string[]) => Promise<void>;
  onClose: () => void;
}

export function UserRolesModal({
  userName,
  assignedRoleIds,
  onAssignRoles,
  onClose,
}: UserRolesModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    assignedRoleIds,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await api.fetchRoles();
      setRoles(data || []);
    } catch (error) {
      toast.error("Failed to load roles");
      console.error("Error loading roles:", error);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onAssignRoles(selectedRoleIds);
      toast.success("Roles assigned successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign roles");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Assign Roles
            </h2>
            <p className="text-sm text-slate-600 mt-1">For {userName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {rolesLoading ? (
            <div className="text-center text-slate-500">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-center text-slate-500">
              No roles available. Create roles first.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {roles.map((role) => (
                  <label
                    key={role._id}
                    className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role._id)}
                      onChange={() => handleToggleRole(role._id)}
                      disabled={isLoading}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{role.name}</p>
                      {role.description && (
                        <p className="text-sm text-slate-600">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-300"
                >
                  {isLoading ? "Saving..." : "Assign Roles"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
