import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { Trash2, Edit2 } from "lucide-react";
import { PermissionsMatrix, Permissions } from "./PermissionsMatrix";

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permissions;
}

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    useState<Role | null>(null);

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await api.fetchRoles();
      setRoles(data || []);
    } catch (error) {
      toast.error("Failed to load roles");
      console.error("Error loading roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      const defaultPermissions: Permissions = {
        sales: { view: false, add: false, edit: false, changeStatus: false },
        items: { view: false, add: false, edit: false, changeStatus: false },
        products: { view: false, add: false, edit: false, changeStatus: false },
        customers: {
          view: false,
          add: false,
          edit: false,
          changeStatus: false,
        },
        deliveryBoys: {
          view: false,
          add: false,
          edit: false,
          changeStatus: false,
        },
      };

      await api.createRole({
        name: newRole.name,
        description: newRole.description,
        permissions: defaultPermissions,
      });

      toast.success("Role created successfully!");
      setNewRole({ name: "", description: "" });
      setShowForm(false);
      await loadRoles();
    } catch (error: any) {
      toast.error(error.message || "Failed to create role");
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRole({ name: role.name, description: role.description || "" });
    setShowForm(true);
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !newRole.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      await api.updateRole(editingRole._id, {
        name: newRole.name,
        description: newRole.description,
      });

      toast.success("Role updated successfully!");
      setNewRole({ name: "", description: "" });
      setShowForm(false);
      setEditingRole(null);
      await loadRoles();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      await api.deleteRole(roleId);
      toast.success("Role deleted successfully!");
      await loadRoles();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role");
    }
  };

  const handleUpdatePermissions = async (permissions: Permissions) => {
    if (!selectedRoleForPermissions) return;

    try {
      await api.updateRole(selectedRoleForPermissions._id, { permissions });
      toast.success("Role permissions updated successfully!");
      setSelectedRoleForPermissions(null);
      await loadRoles();
    } catch (error: any) {
      toast.error("Failed to update role permissions");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Role Form */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Manage Roles</h2>
          <button
            onClick={() => {
              setEditingRole(null);
              setNewRole({ name: "", description: "" });
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {showForm ? "Cancel" : "Add Role"}
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
                placeholder="e.g., Manager, Sales Lead"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newRole.description}
                onChange={(e) =>
                  setNewRole({ ...newRole, description: e.target.value })
                }
                placeholder="Describe what this role is for"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={editingRole ? handleUpdateRole : handleAddRole}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingRole ? "Update Role" : "Create Role"}
            </button>
          </div>
        )}
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading roles...</div>
        ) : roles.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No roles found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role._id}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <span className="font-medium">{role.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {role.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedRoleForPermissions(role)}
                          className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-medium transition-colors"
                        >
                          Permissions
                        </button>
                        <button
                          onClick={() => handleEditRole(role)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role._id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRoleForPermissions && (
        <PermissionsMatrix
          permissions={selectedRoleForPermissions.permissions}
          onPermissionsChange={handleUpdatePermissions}
          onClose={() => setSelectedRoleForPermissions(null)}
          userName={selectedRoleForPermissions.name}
        />
      )}
    </div>
  );
}
