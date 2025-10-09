import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LogIn, Building2 } from 'lucide-react';
import { storageUtils } from '../utils/storage';
import { loginAdmin, loginRestaurant } from '../store/slices/authSlice';

export default function LoginPage() {
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const onSubmit = async (data) => {
		setLoading(true);

		try {
			if (isAdmin) {
				const adminUser = await storageUtils.checkAdmin(data.username, data.password);

				if (adminUser) {
					dispatch(loginAdmin(adminUser));
					toast.success('Xoş gəldiniz, Admin!');
					navigate('/admin');
				} else {
					toast.error('İstifadəçi adı və ya şifrə səhvdir');
				}
			} else {
				const restaurant = await storageUtils.findRestaurant(data.username, data.password);

				if (restaurant) {
					dispatch(loginRestaurant(restaurant));
					toast.success(`Xoş gəldiniz, ${restaurant.name}!`);
					navigate('/dashboard');
				} else {
					toast.error('İstifadəçi adı və ya şifrə səhvdir');
				}
			}
		} catch (error) {
			toast.error('Giriş zamanı xəta baş verdi');
			console.error('Login error:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4'>
			<div className='bg-white rounded-2xl shadow-xl p-8 w-full max-w-md'>
				<div className='text-center mb-8'>
					<div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4'>
						<Building2 className='w-8 h-8 text-white' />
					</div>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>Multi-Restoran Sistemi</h1>
					<p className='text-gray-600'>İdarəetmə Paneli</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>İstifadəçi adı</label>
						<input
							type='text'
							{...register('username', {
								required: 'İstifadəçi adı tələb olunur',
								minLength: {
									value: 3,
									message: 'Minimum 3 simvol olmalıdır',
								},
							})}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
							placeholder='İstifadəçi adınızı daxil edin'
						/>
						{errors.username && <p className='mt-1 text-sm text-red-600'>{errors.username.message}</p>}
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Şifrə</label>
						<input
							type='password'
							{...register('password', {
								required: 'Şifrə tələb olunur',
								minLength: {
									value: 6,
									message: 'Minimum 6 simvol olmalıdır',
								},
							})}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
							placeholder='Şifrənizi daxil edin'
						/>
						{errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>}
					</div>

					<div className='flex items-center'>
						<input
							type='checkbox'
							id='isAdmin'
							checked={isAdmin}
							onChange={(e) => setIsAdmin(e.target.checked)}
							className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
						/>
						<label htmlFor='isAdmin' className='ml-2 text-sm text-gray-700'>
							Admin olaraq daxil ol
						</label>
					</div>

					<button
						type='submit'
						disabled={loading}
						className='w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
					>
						{loading ? (
							<span>Giriş edilir...</span>
						) : (
							<>
								<LogIn className='w-5 h-5 mr-2' />
								<span>Daxil ol</span>
							</>
						)}
					</button>
				</form>

				<div className='mt-6 p-4 bg-gray-50 rounded-lg'>
					<p className='text-xs text-gray-600 mb-2 font-medium'>Test məlumatları:</p>
					<p className='text-xs text-gray-600'>
						Admin: <span className='font-mono'>admin / admin123</span>
					</p>
				</div>

				<p className='mt-6 text-center text-sm text-gray-600'>
					Hesabınız yoxdur?{' '}
					<a href='/register' className='text-blue-600 hover:text-blue-700 font-medium'>
						Qeydiyyatdan keçin
					</a>
				</p>
			</div>
		</div>
	);
}
