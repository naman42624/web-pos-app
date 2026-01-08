import { X } from "lucide-react";
import { useState } from "react";

export type Permissions = {
  sales: { view: boolean; add: boolean; edit: boolean; changeStatus: boolean };
  items: { view: boolean; add: boolean; edit: boolean; changeStatus: boolean };
  products: { view: boolean; add: boolean; edit: boolean; changeStatus: boolean };
  customers: { view: boolean; add: boolean; edit: boolean; changeStatus: boolean };
  deliveryBoys: { view: boolean; add: boolean; edit: boolean; changeStatus: boolean };
};

const DEFAULT_PERMISSIONS: Permissions = {
  sales: { view: false, add: false, edit: false, changeStatus: false },
  items: { view: false, add: false, edit: false, changeStatus: false },
  products: { view: false, add: false, edit: false, changeStatus: false },
  customers: { view: false, add: false, edit: false, changeStatus: false },
  deliveryBoys: { view: false, add: false, edit: false, changeStatus: false },
};

interface PermissionsMatrixProps {
  permissions?: Permissions;
  onPermissionsChange: (permissions: Permissions) => void;
  onClose: () => void;
  userName: string;
  userRole?: "admin" | "manager" | "staff";
}

const entities = ["sales", "items", "products", "customers", "deliveryBoys"] as const;
const actions = ["view", "add", "edit", "changeStatus"] as const;

const entityLabels: Record<typeof entities[number], string> = {
  sales: "Sales/Orders",
  items: "Items",
  products: "Products",
  customers: "Customers",
  deliveryBoys: "Delivery Boys",
};

const actionLabels: Record<typeof actions[number], string> = {
  view: "View",
  add: "Add",
  edit: "Edit",
  changeStatus: "Change Status",
};

export function PermissionsMatrix({
  permissions,
  onPermissionsChange,
  onClose,
  userName,
  userRole,
}: PermissionsMatrixProps) {
  const isAdmin = userRole === "admin";
  const [localPermissions, setLocalPermissions] = useState<Permissions>(
    permissions || DEFAULT_PERMISSIONS,
  );

  const handlePermissionToggle = (
    entity: typeof entities[number],
    action: typeof actions[number],
  ) => {
    if (isAdmin) return;

    setLocalPermissions((prev) => ({
      ...prev,
      [entity]: {
        ...prev[entity],
        [action]: !prev[entity][action as keyof typeof prev[typeof entity[number]]],
      },
    }));
  };

  const handleSave = () => {
    onPermissionsChange(localPermissions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Manage Permissions
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {isAdmin ? (
                <>
                  <span className="font-medium text-blue-600">Admin user</span> - has all
                  permissions by default
                </>
              ) : (
                <>Set access rights for {userName}</>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-slate-900 pb-3 border-b border-slate-200">
                    Entity
                  </th>
                  {actions.map((action) => (
                    <th
                      key={action}
                      className="text-center text-sm font-semibold text-slate-900 pb-3 border-b border-slate-200"
                    >
                      {actionLabels[action]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entities.map((entity) => (
                  <tr key={entity} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-4 pr-4 text-sm font-medium text-slate-900">
                      {entityLabels[entity]}
                    </td>
                    {actions.map((action) => (
                      <td key={`${entity}-${action}`} className="py-4 text-center">
                        <input
                          type="checkbox"
                          checked={
                            localPermissions[entity][
                              action as keyof typeof localPermissions[typeof entity[number]]
                            ]
                          }
                          onChange={() => handlePermissionToggle(entity, action)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
