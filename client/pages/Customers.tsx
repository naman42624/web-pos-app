import { useState } from "react";
import { Link } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/POSContext";
import { Users, Phone, Mail, CreditCard, Plus, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Address } from "@/hooks/usePOS";

export default function Customers() {
  const { customers, addCustomer } = usePOSContext();
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    email: "",
    organization: "",
    addresses: [] as Address[],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleAddAddress = () => {
    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      label: "Address",
      street: "",
      city: "",
      state: "",
      zip: "",
    };
    setFormData({
      ...formData,
      addresses: [...formData.addresses, newAddress],
    });
  };

  const handleRemoveAddress = (addressId: string) => {
    setFormData({
      ...formData,
      addresses: formData.addresses.filter((addr) => addr.id !== addressId),
    });
  };

  const handleAddressChange = (
    addressId: string,
    field: string,
    value: string
  ) => {
    setFormData({
      ...formData,
      addresses: formData.addresses.map((addr) =>
        addr.id === addressId ? { ...addr, [field]: value } : addr
      ),
    });
  };

  const handleAddCustomer = () => {
    if (!formData.name.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter phone number");
      return;
    }

    addCustomer({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      altPhone: formData.altPhone.trim() || undefined,
      email: formData.email.trim() || undefined,
      organization: formData.organization.trim() || undefined,
      addresses: formData.addresses,
      totalCredit: 0,
    });

    setFormData({
      name: "",
      phone: "",
      altPhone: "",
      email: "",
      organization: "",
      addresses: [],
    });
    setShowAddCustomerModal(false);
  };

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-500 mt-2">
              Manage customer information and view credit details
            </p>
          </div>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Total Credit
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {customer.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-slate-900">
                            ₹{customer.totalCredit.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/customer/${customer.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No customers yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Create a credit sale to add customers
              </p>
            </div>
          )}
        </div>

        {/* Add Customer Modal */}
        {showAddCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4">
                <h2 className="text-3xl font-bold text-slate-900">Add New Customer</h2>
                <button
                  onClick={() => setShowAddCustomerModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">
                    Contact Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange(e, "name")}
                        placeholder="e.g., John Doe"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="text-slate-400 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-sm">
                            +91
                          </div>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange(e, "phone")}
                            placeholder="9876543210"
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">10-digit mobile number</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Alternative Phone
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="text-slate-400 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-sm">
                            +91
                          </div>
                          <input
                            type="tel"
                            value={formData.altPhone}
                            onChange={(e) => handleInputChange(e, "altPhone")}
                            placeholder="9876543210"
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange(e, "email")}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">
                    Business Information
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Organization / Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => handleInputChange(e, "organization")}
                      placeholder="e.g., Acme Corporation"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                    />
                  </div>
                </div>

                {/* Addresses Section */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Addresses
                    </h3>
                    <button
                      onClick={handleAddAddress}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Address
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.addresses.map((address) => (
                      <div key={address.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={address.label}
                            onChange={(e) =>
                              handleAddressChange(address.id, "label", e.target.value)
                            }
                            placeholder="e.g., Home, Office"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-semibold"
                          />
                          <button
                            onClick={() => handleRemoveAddress(address.id)}
                            className="ml-2 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) =>
                            handleAddressChange(address.id, "street", e.target.value)
                          }
                          placeholder="Street address"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) =>
                              handleAddressChange(address.id, "city", e.target.value)
                            }
                            placeholder="City"
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                          />
                          <input
                            type="text"
                            value={address.state}
                            onChange={(e) =>
                              handleAddressChange(address.id, "state", e.target.value)
                            }
                            placeholder="State"
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                          />
                          <input
                            type="text"
                            value={address.zip}
                            onChange={(e) =>
                              handleAddressChange(address.id, "zip", e.target.value)
                            }
                            placeholder="ZIP"
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 sticky bottom-0 bg-white pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base"
                >
                  <Plus className="w-5 h-5" />
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
}
