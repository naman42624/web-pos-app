import { useState } from "react";
import { Link } from "react-router-dom";
import { SharedLayout } from "@/components/SharedLayout";
import { usePOSContext } from "@/contexts/POSContext";
import { Users, Phone, Mail, CreditCard, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Customers() {
  const { customers, addCustomer } = usePOSContext();
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
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

    if (!formData.email.trim()) {
      alert("Please enter email address");
      return;
    }

    addCustomer({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      totalCredit: 0,
    });

    setFormData({ name: "", phone: "", email: "" });
    setShowAddCustomerModal(false);
  };

  return (
    <SharedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-2">
            Manage customer information and view credit details
          </p>
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
      </div>
    </SharedLayout>
  );
}
