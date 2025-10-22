import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function IngredientModal({ isOpen, onClose, onSuccess, restaurantId, ingredient = null }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      is_active: true,
      unit: 'kg',
    },
  });

  useEffect(() => {
    if (restaurantId) {
      loadCategories();
    }
    if (ingredient) {
      setValue('name', ingredient.name);
      setValue('unit', ingredient.unit);
      setValue('category_id', ingredient.category_id);
      setValue('cost_price', ingredient.cost_price);
      setValue('is_active', ingredient.is_active);
    }
  }, [ingredient, restaurantId, setValue]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const ingredientData = {
        ...data,
        restaurant_id: restaurantId,
        cost_price: parseFloat(data.cost_price),
        is_active: data.is_active === true || data.is_active === 'true',
      };

      if (ingredient) {
        ingredientData.id = ingredient.id;
      }

      toast.success(ingredient ? 'Tərkib yeniləndi' : 'Tərkib əlavə edildi');
      reset();
      onSuccess(ingredientData);
      onClose();
    } catch (error) {
      toast.error('Tərkib əməliyyatı zamanı xəta baş verdi');
      console.error('Ingredient operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {ingredient ? 'Tərkibi Redaktə Et' : 'Yeni Tərkib'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tərkib Adı *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Tərkib adı tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="məs: Pomidor"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kateqoriya *
            </label>
            <select
              {...register('category_id', { required: 'Kateqoriya tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ölçü vahidi *
            </label>
            <select
              {...register('unit', { required: 'Ölçü vahidi tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="kg">Kiloqram (kg)</option>
              <option value="l">Litr (l)</option>
              <option value="pcs">Ədəd</option>
              <option value="m">Metr (m)</option>
            </select>
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maya Dəyəri *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('cost_price', { required: 'Maya dəyəri tələb olunur', min: 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            {errors.cost_price && (
              <p className="mt-1 text-sm text-red-600">{errors.cost_price.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_active')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Aktiv</label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Əməliyyat...' : 'Yadda saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
