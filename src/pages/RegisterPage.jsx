import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, ArrowLeft } from 'lucide-react';
import { storageUtils } from '../utils/storage';
import { validateUsername, validatePassword, validateEmail, validatePhone } from '../utils/validation';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      currency: 'AZN',
      tax_rate: 18,
      language: 'az',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    const usernameValidation = await validateUsername(data.username);
    if (!usernameValidation.isValid) {
      toast.error(usernameValidation.message);
      return;
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message);
      return;
    }

    if (data.password !== data.confirm_password) {
      toast.error('Şifrələr uyğun gəlmir');
      return;
    }

    if (data.email) {
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.message);
        return;
      }
    }

    if (data.phone) {
      const phoneValidation = validatePhone(data.phone);
      if (!phoneValidation.isValid) {
        toast.error(phoneValidation.message);
        return;
      }
    }

    setLoading(true);

    try {
      const restaurantData = {
        name: data.restaurant_name,
        username: data.username,
        password: data.password,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        currency: data.currency,
        tax_rate: parseFloat(data.tax_rate),
        language: data.language,
        is_active: true,
      };

      const restaurantResult = await storageUtils.addRestaurant(restaurantData);

      if (restaurantResult.success) {
        toast.success('Restoran uğurla qeydiyyatdan keçdi!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(restaurantResult.error || 'Qeydiyyat zamanı xəta baş verdi');
      }
    } catch (error) {
      toast.error('Qeydiyyat zamanı xəta baş verdi');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Geri
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restoran Qeydiyyatı</h1>
          <p className="text-gray-600">Restoranınızı sistemə əlavə edin</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-gray-900 mb-4">Restoran Məlumatları</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restoran Adı *
              </label>
              <input
                type="text"
                {...register('restaurant_name', { required: 'Restoran adı tələb olunur' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="məs: Bakı Restaurant"
              />
              {errors.restaurant_name && (
                <p className="mt-1 text-sm text-red-600">{errors.restaurant_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="info@restaurant.az"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="+994501234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ünvan</label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Bakı şəhəri, 28 May küç. 123"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valyuta</label>
                <select
                  {...register('currency')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="AZN">AZN (₼)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vergi (%)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('tax_rate')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dil</label>
                <select
                  {...register('language')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="az">Azərbaycan</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="tr">Türkçe</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-gray-900 mb-4">Giriş Məlumatları</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İstifadəçi adı *
              </label>
              <input
                type="text"
                {...register('username', {
                  required: 'İstifadəçi adı tələb olunur',
                  minLength: { value: 3, message: 'Minimum 3 simvol' },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="İstifadəçi adınızı daxil edin"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Şifrə *</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Şifrə tələb olunur',
                  minLength: { value: 6, message: 'Minimum 6 simvol' },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Şifrənizi daxil edin"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifrəni Təsdiqlə *
              </label>
              <input
                type="password"
                {...register('confirm_password', {
                  required: 'Şifrə təsdiqi tələb olunur',
                  validate: (value) => value === password || 'Şifrələr uyğun gəlmir',
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Şifrənizi təkrar daxil edin"
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Qeydiyyat edilir...' : 'Qeydiyyatdan Keç'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Artıq hesabınız var?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Daxil ol
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
