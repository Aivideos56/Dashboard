import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { storageUtils } from '../../utils/storage';

export default function UserModal({ isOpen, onClose, onSuccess, restaurantId, branches, user = null }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      role: 'cashier',
      is_active: true,
    },
  });

  useEffect(() => {
    if (user) {
      setValue('username', user.username);
      setValue('full_name', user.full_name);
      setValue('role', user.role);
      setValue('branch_id', user.branch_id || '');
      setValue('is_active', user.is_active);
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    if (!user && !data.password) {
      toast.error('Şifrə tələb olunur');
      return;
    }

    if (data.password && data.password.length < 4) {
      toast.error('Şifrə ən azı 4 simvol olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        ...data,
        restaurant_id: restaurantId,
        branch_id: data.branch_id || null,
        is_active: data.is_active === true || data.is_active === 'true',
      };

      if (!user || data.password) {
        userData.password = data.password;
      } else {
        delete userData.password;
      }

      let result;
      if (user) {
        result = await storageUtils.updateUser(user.id, userData);
      } else {
        result = await storageUtils.addUser(userData);
      }

      if (result.success) {
        toast.success(user ? 'İstifadəçi yeniləndi' : 'İstifadəçi əlavə edildi');
        reset();
        onSuccess(result.data);
        onClose();
      } else {
        toast.error(result.error || 'Xəta baş verdi');
      }
    } catch (error) {
      toast.error('İstifadəçi əməliyyatı zamanı xəta baş verdi');
      console.error('User operation error:', error);
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
            {user ? 'İstifadəçini Redaktə Et' : 'Yeni İstifadəçi'}
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
              İstifadəçi adı *
            </label>
            <input
              type="text"
              {...register('username', { required: 'İstifadəçi adı tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tam ad *
            </label>
            <input
              type="text"
              {...register('full_name', { required: 'Tam ad tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {user ? 'Yeni Şifrə (boş saxlayın dəyişdirmək istəmirsinizsə)' : 'Şifrə *'}
            </label>
            <input
              type="password"
              {...register('password', user ? {} : { required: 'Şifrə tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol *
            </label>
            <select
              {...register('role')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cashier">Kassir</option>
              <option value="waiter">Ofisiant</option>
              <option value="kitchen">Mətbəx</option>
              <option value="manager">Menecer</option>
            </select>
          </div>

          {branches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filial
              </label>
              <select
                {...register('branch_id')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Filial seçin (opsional)</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
