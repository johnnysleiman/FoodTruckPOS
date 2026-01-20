import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/shared';

interface InventoryItem {
  id: string;
  name: string;
  unit_of_measurement: string;
  category: string;
}

interface MenuIngredient {
  id: string;
  inventory_item_id: string;
  quantity: number;
  inventory_item?: InventoryItem;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string | null;
  recipe_type: string;
  is_active: boolean;
  display_order: number;
  description: string | null;
  created_at: string;
  menu_ingredients?: MenuIngredient[];
}

interface IngredientFormData {
  inventory_item_id: string;
  quantity: string;
}

interface MenuItemFormData {
  name: string;
  price: string;
  category: string;
  description: string;
  recipe_type: string;
  ingredients: IngredientFormData[];
}

const CATEGORIES = [
  { value: 'main', label: 'Main' },
  { value: 'sides', label: 'Sides' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'combos', label: 'Combos' },
];

export default function Menu() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    price: '',
    category: 'main',
    description: '',
    recipe_type: 'fixed_recipe',
    ingredients: [],
  });

  // Fetch inventory items for ingredient selection
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory-items-for-menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, unit_of_measurement, category')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  // Fetch menu items with ingredients
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu-items-with-ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_ingredients (
            id,
            inventory_item_id,
            quantity,
            inventory_items (
              id,
              name,
              unit_of_measurement,
              category
            )
          )
        `)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      return (data || []).map((item: Record<string, unknown>) => ({
        ...item,
        menu_ingredients: ((item.menu_ingredients as Record<string, unknown>[]) || []).map((ing: Record<string, unknown>) => ({
          ...ing,
          inventory_item: ing.inventory_items,
        })),
      })) as MenuItem[];
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items-with-ingredients'] });
      toast.success('Menu item updated');
    },
    onError: () => {
      toast.error('Failed to update menu item');
    },
  });

  // Create/Update menu item with ingredients
  const saveMutation = useMutation({
    mutationFn: async (data: MenuItemFormData & { id?: string }) => {
      const menuItemPayload = {
        name: data.name,
        price: parseFloat(data.price),
        category: data.category,
        description: data.description || null,
        recipe_type: data.recipe_type,
        is_active: true,
      };

      let menuItemId = data.id;

      if (data.id) {
        // Update existing menu item
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemPayload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        // Create new menu item
        const { data: newItem, error } = await supabase
          .from('menu_items')
          .insert(menuItemPayload)
          .select('id')
          .single();
        if (error) throw error;
        menuItemId = newItem.id;
      }

      // Delete existing ingredients and re-insert
      if (menuItemId) {
        await supabase
          .from('menu_ingredients')
          .delete()
          .eq('menu_item_id', menuItemId);

        // Insert new ingredients
        if (data.ingredients.length > 0) {
          const ingredientsPayload = data.ingredients
            .filter(ing => ing.inventory_item_id && ing.quantity)
            .map(ing => ({
              menu_item_id: menuItemId,
              inventory_item_id: ing.inventory_item_id,
              quantity: parseFloat(ing.quantity),
            }));

          if (ingredientsPayload.length > 0) {
            const { error: ingError } = await supabase
              .from('menu_ingredients')
              .insert(ingredientsPayload);
            if (ingError) throw ingError;
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items-with-ingredients'] });
      toast.success(editingItem ? 'Menu item updated' : 'Menu item created');
      closeModal();
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save menu item');
    },
  });

  // Delete menu item
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete ingredients first
      await supabase
        .from('menu_ingredients')
        .delete()
        .eq('menu_item_id', id);

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items-with-ingredients'] });
      toast.success('Menu item deleted');
    },
    onError: () => {
      toast.error('Failed to delete menu item');
    },
  });

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price.toString(),
        category: item.category || 'main',
        description: item.description || '',
        recipe_type: item.recipe_type,
        ingredients: (item.menu_ingredients || []).map(ing => ({
          inventory_item_id: ing.inventory_item_id,
          quantity: ing.quantity.toString(),
        })),
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: '',
        category: 'main',
        description: '',
        recipe_type: 'fixed_recipe',
        ingredients: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveMutation.mutate({ ...formData, id: editingItem?.id });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { inventory_item_id: '', quantity: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, field: keyof IngredientFormData, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your menu items and their ingredients</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Menu Items */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading menu items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No menu items found. Add your first item!
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 capitalize">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border p-4 ${
                      item.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Ingredients list */}
                    {item.menu_ingredients && item.menu_ingredients.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Package size={12} />
                          <span>Ingredients:</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {item.menu_ingredients.slice(0, 3).map((ing) => (
                            <div key={ing.id} className="flex justify-between">
                              <span>{ing.inventory_item?.name}</span>
                              <span className="text-gray-400">
                                {ing.quantity} {ing.inventory_item?.unit_of_measurement}
                              </span>
                            </div>
                          ))}
                          {item.menu_ingredients.length > 3 && (
                            <div className="text-gray-400">
                              +{item.menu_ingredients.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: item.id, is_active: !item.is_active })}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          item.is_active
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {item.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        {item.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => openModal(item)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200 transition-colors"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="e.g., Beef Taco"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>

              {/* Ingredients Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Ingredients (from Inventory)
                  </label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Ingredient
                  </button>
                </div>

                {formData.ingredients.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No ingredients added. Click "Add Ingredient" to link inventory items.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <select
                          value={ingredient.inventory_item_id}
                          onChange={(e) => updateIngredient(index, 'inventory_item_id', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        >
                          <option value="">Select ingredient...</option>
                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.unit_of_measurement})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Ingredients will be deducted from inventory when this item is sold.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteItem}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteItem) {
            deleteMutation.mutate(deleteItem.id);
            setDeleteItem(null);
          }
        }}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}
