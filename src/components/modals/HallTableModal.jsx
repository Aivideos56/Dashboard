import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function HallTableModal({ isOpen, onClose, hallId, hallName, table = null, existingTables = [] }) {
  const [loading, setLoading] = useState(false);
  const { restaurant } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      status: 'available',
      shape: 'square',
      capacity: 4,
    },
  });

  useEffect(() => {
    if (table) {
      setValue('number', table.number);
      setValue('capacity', table.capacity);
      setValue('status', table.status);
      setValue('shape', table.shape || 'square');
    } else {
      const maxNumber = existingTables.length > 0
        ? Math.max(...existingTables.map((t) => t.number))
        : 0;
      setValue('number', maxNumber + 1);
    }
  }, [table, existingTables, setValue]);

  const onSubmit = async (data) => {
    if (!table) {
      const exists = existingTables.find((t) => t.number === parseInt(data.number));
      if (exists) {
        toast.error(`Masa ${data.number} artıq mövcuddur`);
        return;
      }
    }

    setLoading(true);

    try {
      const tableData = {
        hall_id: hallId,
        number: parseInt(data.number),
        capacity: parseInt(data.capacity),
        status: data.status,
        shape: data.shape,
        restaurant_id: restaurant.id
      };

      let result;
      if (table) {
        const { data: updated, error } = await supabase
          .from('tables')
          .update(tableData)
          .eq('id', table.id)
          .select()
          .single();

        if (error) throw error;
        result = updated;
        toast.success('Masa yeniləndi');
      } else {
        const { data: created, error } = await supabase
          .from('tables')
          .insert([tableData])
          .select()
          .single();

        if (error) throw error;
        result = created;
        toast.success('Masa əlavə edildi');
      }

      reset();
      onClose();
    } catch (error) {
      console.error('Table operation error:', error);
      toast.error(error.message || 'Masa əməliyyatı zamanı xəta baş verdi');
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
            {table ? 'Masanı Redaktə Et' : `${hallName} - Yeni Masa`}
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
              Masa Nömrəsi *
            </label>
            <input
              type="number"
              {...register('number', { required: 'Masa nömrəsi tələb olunur', min: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.number && (
              <p className="mt-1 text-sm text-red-600">{errors.number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tutum (nəfər) *
            </label>
            <input
              type="number"
              {...register('capacity', { required: 'Tutum tələb olunur', min: 1, max: 20 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma
            </label>
            <select
              {...register('shape')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="square">Kvadrat</option>
              <option value="circle">Dairəvi</option>
              <option value="sofa">Divan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="available">Boş</option>
              <option value="occupied">Dolu</option>
              <option value="reserved">Rezerv</option>
            </select>
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
