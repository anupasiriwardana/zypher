'use client';

import { useState, useEffect } from 'react';
import { Edit, Save, X, PlusCircle, Trash2, Tag, Calendar, Gift, FileText, CheckCircle, DollarSign } from 'lucide-react';
import clsx from 'clsx';

// A visually distinct button for action
const ActionButton = ({ onClick, children, icon: Icon, className = '', color = 'yellow' }) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200",
      "hover:shadow-lg focus:outline-none focus:ring-2",
      color === 'yellow' && 'bg-[var(--brand-yellow)] text-[var(--background)] hover:bg-yellow-500 focus:ring-yellow-500/50',
      color === 'red' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50',
      className
    )}
  >
    {Icon && <Icon size={20} />}
    {children}
  </button>
);

// --- 1. Plan Edit Modal Component ---

const PlanEditModal = ({ plan, onClose, onSave, onDelete }) => {
  const [editedPlan, setEditedPlan] = useState(plan);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPlan(prev => ({ ...prev, [name]: name === 'price' || name === 'discount' ? parseFloat(value) || 0 : value }));
  };

  const handlefeaturesChange = (index, value) => {
    const newfeatures = [...editedPlan.features];
    newfeatures[index] = value;
    setEditedPlan(prev => ({ ...prev, features: newfeatures.filter(b => b.trim() !== '') }));
  };

  const addBenefit = () => {
    setEditedPlan(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const saveChanges = () => {
    onSave(editedPlan);
    onClose();
  };

  if (!plan) return null;

  // Use fixed colors for modal background and borders
  const MODAL_BG = 'rgba(13, 13, 13, 0.95)'; 
  const CARD_BG = '#1A1A1A';
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300"
      style={{ backgroundColor: MODAL_BG }}
      onClick={onClose}
    >
      <div 
        className="bg-[var(--background)] p-8 rounded-2xl shadow-2xl border border-[var(--border-input)] w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 transition-transform duration-300"
        onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing when clicking inside
      >
        <div className="flex justify-between items-start border-b border-[var(--border-input)] pb-4 mb-6 sticky top-0 bg-[var(--background)] z-10">
          <h2 className="text-3xl font-bold text-[var(--brand-yellow)]">Edit Plan: {plan.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-[var(--foreground)] hover:bg-[var(--hover-bg)] transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveChanges(); }} className="space-y-6">
          
          {/* Plan Name and Price */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2 mb-1"><Tag size={16} />Plan Name</span>
              <input
                type="text"
                name="name"
                value={editedPlan.name}
                onChange={handleChange}
                required
                className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2 mb-1"><DollarSign size={16} />Price (USD)</span>
              <input
                type="number"
                name="price"
                value={editedPlan.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)]"
              />
            </label>
          </div>
          
          {/* Discount */}
          <label className="block">
              <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2 mb-1"><Gift size={16} />Discount (%)</span>
              <input
                type="number"
                name="discount"
                value={editedPlan.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)]"
              />
          </label>

          {/* features */}
          <div className="border border-[var(--border-input)] p-4 rounded-xl space-y-3">
            <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2 mb-1"><CheckCircle size={16} />features</span>
            {editedPlan.features.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handlefeaturesChange(index, e.target.value)}
                  placeholder={`Benefit ${index + 1}`}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-2 rounded-lg"
                />
              </div>
            ))}
            <button type="button" onClick={addBenefit} className="flex items-center gap-1 text-[var(--brand-yellow)] hover:text-yellow-500 transition text-sm">
              <PlusCircle size={16} /> Add Benefit
            </button>
          </div>

          {/* Notes and Creation Date (Display only) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[var(--input-bg)] rounded-lg">
              <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2 mb-1"><Calendar size={16} />Date Created</span>
              <p className="text-[var(--foreground)] font-mono">{plan.created}</p>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2 mb-1"><FileText size={16} />Notes</span>
              <textarea
                name="notes"
                value={editedPlan.notes}
                onChange={handleChange}
                rows="3"
                className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)] resize-none"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button 
              type="button" 
              onClick={() => setIsDeleting(true)} 
              className="text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={20} /> Delete Plan
            </button>

            <ActionButton type="submit" icon={Save}>
              Save Changes
            </ActionButton>
          </div>
        </form>

        {/* Delete Confirmation Modal (nested) */}
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl">
            <div className="bg-[var(--background)] p-6 rounded-xl border border-red-500 w-96 text-center shadow-2xl">
              <p className="text-xl font-semibold mb-4 text-red-400">Confirm Deletion</p>
              <p className="text-[var(--foreground)] mb-6">Are you sure you want to delete the plan "{plan.name}"?</p>
              <div className="flex justify-center gap-4">
                <ActionButton onClick={() => setIsDeleting(false)} color="yellow" className="w-1/2">
                  Cancel
                </ActionButton>
                <ActionButton onClick={() => { onDelete(plan.id); onClose(); }} color="red" icon={Trash2} className="w-1/2">
                  Confirm Delete
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 2. Plan Card Component ---

const PlanCard = ({ plan, onEdit }) => {
  const finalPrice = plan.price * (1 - plan.discount / 100);

  return (
    <div className="bg-[var(--background-light)] p-6 rounded-xl shadow-lg border border-[var(--border-input)] flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-yellow-500/10">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-[var(--brand-yellow)]">{plan.planName}</h3>
          <button 
            onClick={() => onEdit(plan)} 
            className="text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition p-2 rounded-full hover:bg-[var(--hover-bg)]"
            title="Edit Plan"
          >
            <Edit size={20} />
          </button>
        </div>
        
        <div className="mb-4">
  {plan.discount > 0 ? (
    <div className="flex items-end gap-2">
      <p className="text-4xl font-extrabold text-[var(--foreground)]">
        ${finalPrice.toFixed(2)}
      </p>
      <p className="text-lg text-red-400 line-through">
        ${plan.monthly_price.toFixed(2)}
      </p>
      <span className="text-sm font-semibold text-green-400 bg-green-900/40 px-2 py-0.5 rounded-full ml-auto">
        {plan.discount}% OFF
      </span>
    </div>
  ) : plan.monthly_price === 0 ? (
    <p className="text-4xl font-extrabold text-[var(--foreground)]">Free</p>
  ) : (
    <p className="text-4xl font-extrabold text-[var(--foreground)]">
      ${plan.monthly_price.toFixed(2)}
    </p>
  )}
  
  <p className="text-sm text-[var(--text-secondary)] mt-1">per month</p>
</div>

        <ul className="space-y-2 mb-6">
      {[
        ...plan.features.slice(0, 3),
        ...(plan.allowCustomRuleRequests ? ["Custom rule requests allowed"] : []),
        ...(plan.scanLimit
          ? plan.scanLimit === -1
            ? ["Unlimited scans per day"]
            : [`Up to ${plan.scanLimit} scans per day`]
          : []),
      ].map((benefit, index) => (
        <li key={index} className="flex items-center text-[var(--foreground)] text-sm">
          <CheckCircle size={16} className="text-green-400 mr-2 flex-shrink-0" />
          {benefit}
        </li>
      ))}

      {plan.features.length > 3 && (
        <li className="text-[var(--text-secondary)] text-xs italic">
          +{plan.features.length - 3} more features...
        </li>
      )}
    </ul>


      </div>

      <p className="text-xs text-[var(--text-secondary)] border-t border-[var(--border-input)] pt-3 mt-4">
        Created: {new Date(plan.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

// --- 3. Add New Plan Form Component ---

const AddNewPlanForm = ({ onAddPlan, existingPlans }) => {
    const [newPlan, setNewPlan] = useState({ 
        name: '', 
        monthly_price: '', 
        yearly_discount: 0, 
        features: ['', ''], 
        notes: '', 
        allowCustomRuleRequests: false,
        scanLimit: 2
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPlan(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : (name === 'monthly_price' || name === 'yearly_discount' || name === 'scanLimit' ? parseFloat(value) || 0 : value)
        }));
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...newPlan.features];
        newFeatures[index] = value;
        setNewPlan(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeatureField = () => {
        setNewPlan(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeatureField = (index) => {
        const newFeatures = newPlan.features.filter((_, i) => i !== index);
        setNewPlan(prev => ({ ...prev, features: newFeatures.length > 0 ? newFeatures : [''] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newPlan.name || !newPlan.monthly_price || newPlan.monthly_price <= 0) {
            console.error("Plan name and monthly price are required.");
            return;
        }

        const planCount = existingPlans.length;
        const planId = `plan${planCount + 1}`;

        const monthlyPrice = parseFloat(newPlan.monthly_price);
        const yearlyPrice = monthlyPrice * 12 * (1 - (newPlan.yearly_discount / 100));

        const defaultFeatures = ["Downloadable Scan Reports", "Access to Knowledge Base"];
        const finalFeatures = [...defaultFeatures, ...newPlan.features.filter(f => f.trim() !== '')];

        const planToAdd = {
            plan_id: planId,
            planName: newPlan.name,
            monthly_price: monthlyPrice,
            yearly_price: yearlyPrice,
            discount: newPlan.yearly_discount,
            allowCustomRuleRequests: newPlan.allowCustomRuleRequests,
            scanLimit: newPlan.scanLimit,
            features: finalFeatures,
            notes: newPlan.notes,
            status: "default",
            createdAt: new Date().toISOString()
        };

        onAddPlan(planToAdd);

        // Reset form
        setNewPlan({ 
            name: '', 
            monthly_price: '', 
            yearly_discount: 0, 
            features: ['', ''], 
            notes: '', 
            allowCustomRuleRequests: false,
            scanLimit: 2
        });
    };

    return (
        <div className="mt-12 bg-[var(--background-light)] p-8 rounded-2xl shadow-xl border border-[var(--brand-yellow)]/50">
            <h2 className="text-2xl font-bold text-[var(--brand-yellow)] mb-6 flex items-center gap-2 border-b border-[var(--border-input)] pb-3">
                <PlusCircle size={24} /> Add New Subscription Plan
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plan Name, Monthly Price, Yearly Discount */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Plan Name *</span>
                        <input
                            type="text"
                            name="name"
                            value={newPlan.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Ultra Premium"
                            className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)]"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Monthly Price ($) *</span>
                        <input
                            type="number"
                            name="monthly_price"
                            value={newPlan.monthly_price}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="e.g., 99.99"
                            className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)]"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Yearly Discount (%)</span>
                        <input
                            type="number"
                            name="yearly_discount"
                            value={newPlan.yearly_discount}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            placeholder="e.g., 10"
                            className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)]"
                        />
                    </label>
                </div>

                {/* Scan Limit & Custom Rule Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Scans per Day</span>
                        <input
                            type="number"
                            name="scanLimit"
                            value={newPlan.scanLimit}
                            onChange={handleChange}
                            min="-1"
                            placeholder="-1 for unlimited"
                            className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)]"
                        />
                    </label>
                    <label className="flex items-center gap-2 mt-6 md:mt-0">
                        <input
                            type="checkbox"
                            name="allowCustomRuleRequests"
                            checked={newPlan.allowCustomRuleRequests}
                            onChange={handleChange}
                            className="h-5 w-5 text-[var(--brand-yellow)] border-[var(--border-input)] rounded focus:ring-2 focus:ring-[var(--brand-yellow)]"
                        />
                        <span className="text-[var(--text-secondary)]">Allow Custom Rule Requests</span>
                    </label>
                </div>

                {/* Features */}
                <div className="space-y-2 border border-[var(--border-input)] p-4 rounded-xl">
                    <span className="text-sm font-medium text-[var(--text-secondary)] block">Features</span>
                    {newPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={`Feature ${index + 1}`}
                                className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-2 rounded-lg"
                            />
                            {newPlan.features.length > 1 && (
                                <button type="button" onClick={() => removeFeatureField(index)} className="text-red-500 hover:text-red-400 transition p-1">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addFeatureField} className="flex items-center gap-1 text-[var(--brand-yellow)] hover:text-yellow-500 transition text-sm pt-2">
                        <PlusCircle size={16} /> Add Another Feature
                    </button>
                </div>

                {/* Notes */}
                <label className="block">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Notes</span>
                    <textarea
                        name="notes"
                        value={newPlan.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Internal notes about billing or features..."
                        className="w-full bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] p-3 rounded-lg focus:ring-2 focus:ring-[var(--brand-yellow)] resize-none"
                    />
                </label>

                <ActionButton type="submit" className="w-full mt-6" icon={PlusCircle}>
                    Create New Plan
                </ActionButton>
            </form>
        </div>
    );
}

// --- 4. Main Page Component ---

export default function ManagerPricingPage() {
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/pricing-plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // 🔹 Add new plan (POST) — use /api/pricing-plans
  const handleAddPlan = async (newPlan) => {
    try {
      const res = await fetch("/api/pricing-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      });
      if (!res.ok) throw new Error("Failed to add plan");
      const created = await res.json();
      setPlans((prev) => [...prev, created]);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 Update plan (PUT) — use /api/pricing-plans and robust id detection
  const handleSavePlan = async (updatedPlan) => {
    try {
      const id = updatedPlan._id || updatedPlan.plan_id || updatedPlan.id;
      if (!id) throw new Error("Missing plan id for update");
      const res = await fetch(`/api/pricing-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan),
      });
      if (!res.ok) throw new Error("Failed to update plan");
      const data = await res.json();
      setPlans((prev) => prev.map((p) => {
        const pId = p._id || p.plan_id || p.id;
        const dId = data._id || data.plan_id || data.id;
        return pId === dId ? data : p;
      }));
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 Delete plan (DELETE) — use /api/pricing-plans and robust id handling
  const handleDeletePlan = async (id) => {
    try {
      const planId = id;
      if (!planId) throw new Error("Missing plan id for delete");
      const res = await fetch(`/api/pricing-plans/${planId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete plan");
      setPlans((prev) => prev.filter((p) => {
        const pId = p._id || p.plan_id || p.id;
        return pId !== planId;
      }));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Loading plans...</p>;

  return (
    <div className="min-h-screen">
      <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-8">
        Pricing Plan Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan._id || plan.plan_id || plan.id} plan={plan} onEdit={setEditingPlan} />
        ))}
      </div>

      <AddNewPlanForm onAddPlan={handleAddPlan} existingPlans={plans} />

      {editingPlan && (
        <PlanEditModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={handleSavePlan}
          onDelete={(id) => handleDeletePlan(id)}
        />
      )}
    </div>
  );
}
