import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ModifierModal({ isOpen, onClose, onSuccess, restaurantId, item = null }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      is_active: true,
      price: 0,
    },
  });

  useEffect(() => {
    if (item) {
      setValue('name', item.name);
      setValue('price', item.price);
      setValue('is_active', item.is_active);
    } else {
      reset({
        is_active: true,
        price: 0,
      });
    }
  }, [item, setValue, reset]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const itemData = {
        ...data,
        restaurant_id: restaurantId,
        price: parseFloat(data.price),
        is_active: data.is_active === true || data.is_active === 'true',
      };

      if (item) {
        itemData.id = item.id;
      }

      toast.success(item ? 'Modifikator yeniləndi' : 'Modifikator əlavə edildi');
      reset();
      onSuccess(itemData);
      onClose();
    } catch (error) {
      toast.error('Modifikator əməliyyatı zamanı xəta baş verdi');
      console.error('Modifier operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Modifikatoru Redaktə Et' : 'Yeni Modifikator'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modifikator Adı *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Ad tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="məs: Əlavə pendir, Böyük ölçü, Ekstra sous"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qiymət (₼) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Qiymət tələb olunur', min: 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
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

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Ləğv et
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Əməliyyat...' : 'Yadda saxla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}