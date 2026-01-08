import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { SharedLayout } from "@/components/SharedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Edit2, Plus } from "lucide-react";

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: {
    [entity: string]: {
      view?: boolean;
      add?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
  };
}

const ENTITIES = [
  "sales",
  "items",
  "products",
  "customers",
  "deliveryBoys",
  "creditRecords",
  "settings",
  "users",
  "roles",
];
const ACTIONS = ["view", "add", "edit", "delete"];

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: {} as Role["permissions"],
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await api.fetchRoles();
      setRoles(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const initializePermissions = () => {
    const perms: Role["permissions"] = {};
    ENTITIES.forEach((entity) => {
      perms[entity] = {
        view: false,
        add: false,
        edit: false,
        delete: false,
      };
    });
    return perms;
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        permissions: initializePermissions(),
      });
    }
    setShowDialog(true);
  };

  const togglePermission = (entity: string, action: string, value: boolean) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [entity]: {
          ...formData.permissions[entity],
          [action]: value,
        },
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      setLoading(true);

      if (editingRole) {
        await api.updateRole(editingRole._id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
        toast.success("Role updated successfully");
      } else {
        await api.createRole({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
        toast.success("Role created successfully");
      }

      setShowDialog(false);
      await loadRoles();
    } catch (error: any) {
      toast.error(error.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      setLoading(true);
      await api.deleteRole(roleId);
      toast.success("Role deleted successfully");
      await loadRoles();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Roles</h1>
          <p className="text-slate-500">Manage user roles and permissions</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="gap-2 bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </Button>
      </div>

      {loading && !showDialog ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role._id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {role.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {role.description}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(role)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {roles.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-500">
              No roles found
            </div>
          )}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Role name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Role description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Permissions
              </label>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {ENTITIES.map((entity) => (
                  <div
                    key={entity}
                    className="border border-slate-200 rounded-lg p-3"
                  >
                    <h4 className="font-medium text-slate-900 mb-2 capitalize">
                      {entity}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {ACTIONS.map((action) => (
                        <label
                          key={`${entity}-${action}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.permissions[entity]?.[
                                action as keyof (typeof formData.permissions)[string]
                              ] || false
                            }
                            onChange={(e) =>
                              togglePermission(entity, action, e.target.checked)
                            }
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm capitalize">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
