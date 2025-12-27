import { useState } from "react";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/usePOSContext";
import { Trash2, Plus, Edit2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeliveryBoys() {
  const { deliveryBoys, addDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy } =
    usePOSContext();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pin: "",
    status: "available" as "available" | "busy",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name.trim()) {
        alert("Please enter delivery boy name");
        return;
      }

      if (!formData.phone.trim()) {
        alert("Please enter phone number");
        return;
      }

      if (!formData.pin.trim()) {
        alert("Please enter PIN");
        return;
      }

      if (formData.pin.length < 4) {
        alert("PIN must be at least 4 digits");
        return;
      }

      if (editingId) {
        await updateDeliveryBoy(
          editingId,
          {
            name: formData.name,
            phone: formData.phone,
            pin: formData.pin,
            status: formData.status,
          },
          selectedFile || undefined,
        );
        alert("Delivery boy updated successfully");
      } else {
        await addDeliveryBoy(
          {
            name: formData.name,
            phone: formData.phone,
            pin: formData.pin,
            status: formData.status,
          },
          selectedFile || undefined,
        );
        alert("Delivery boy added successfully");
      }

      setFormData({ name: "", phone: "", pin: "", status: "available" });
      setSelectedFile(null);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving delivery boy:", error);
      alert("Failed to save delivery boy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (boy: any) => {
    setFormData({
      name: boy.name,
      phone: boy.phone,
      pin: boy.pin,
      status: boy.status,
    });
    setEditingId(boy.id);
    setShowForm(true);
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this delivery boy?")
    ) {
      try {
        await deleteDeliveryBoy(id);
        alert("Delivery boy deleted successfully");
      } catch (error) {
        console.error("Error deleting delivery boy:", error);
        alert("Failed to delete delivery boy");
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", phone: "", pin: "", status: "available" });
    setSelectedFile(null);
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <SharedLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Delivery Boys
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
              Manage delivery personnel and their assignments
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Delivery Boy
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              {editingId ? "Edit Delivery Boy" : "Add New Delivery Boy"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g., 9876543210"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PIN (4+ digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({ ...formData, pin: e.target.value })
                  }
                  placeholder="e.g., 1234"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ID Proof (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-700">Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-slate-600">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "available" | "busy",
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-colors",
                    isLoading
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white",
                  )}
                >
                  {isLoading ? "Saving..." : editingId ? "Update" : "Add"} Delivery Boy
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delivery Boys List */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            All Delivery Boys ({deliveryBoys.length})
          </h2>

          {deliveryBoys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      ID Proof
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryBoys.map((boy) => (
                    <tr
                      key={boy.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                        {boy.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {boy.phone}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            boy.status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800",
                          )}
                        >
                          {boy.status === "available"
                            ? "Available"
                            : "Busy"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {boy.idProofUrl ? (
                          <a
                            href={boy.idProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-slate-400">No proof</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(boy)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(boy.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              No delivery boys added yet
            </p>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
