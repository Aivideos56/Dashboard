import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Upload } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { updateUser } from '../store/slices/authSlice';
import { storageUtils } from '../utils/storage';
import { uploadImage } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SettingsPage() {
	const dispatch = useDispatch();
	const { restaurant } = useSelector((state) => state.auth);
	const [activeTab, setActiveTab] = useState('general');
	const [logoPreview, setLogoPreview] = useState(restaurant?.logo || '');
	const [loading, setLoading] = useState(false);

	const {
		register: registerGeneral,
		handleSubmit: handleSubmitGeneral,
		formState: { errors: errorsGeneral },
	} = useForm({
		defaultValues: restaurant || {},
	});

	const {
		register: registerAccount,
		handleSubmit: handleSubmitAccount,
		formState: { errors: errorsAccount },
	} = useForm();

	const handleLogoChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const base64 = await uploadImage(file);
			setLogoPreview(base64);
		}
	};

	const onSubmitGeneral = async (data) => {
		setLoading(true);

		try {
			const updateData = {
				...data,
				logo: logoPreview,
				tax_rate: parseFloat(data.tax_rate),
			};

			const result = await storageUtils.updateRestaurant(restaurant.id, updateData);

			if (result.success) {
				dispatch(updateUser(result.data));
				toast.success('Parametrlər yeniləndi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		} catch (error) {
			toast.error('Parametrlər yenilənərkən xəta baş verdi');
			console.error('Update error:', error);
		} finally {
			setLoading(false);
		}
	};

	const onSubmitAccount = async (data) => {
		if (data.new_password && data.new_password !== data.confirm_password) {
			toast.error('Şifrələr uyğun gəlmir');
			return;
		}

		setLoading(true);

		try {
			const updateData = {};

			if (data.username && data.username !== restaurant.username) {
				updateData.username = data.username;
			}

			if (data.new_password) {
				updateData.password = data.new_password;
			}

			if (data.email && data.email !== restaurant.email) {
				updateData.email = data.email;
			}

			if (Object.keys(updateData).length === 0) {
				toast.info('Heç bir dəyişiklik edilmədi');
				setLoading(false);
				return;
			}

			const result = await storageUtils.updateRestaurant(restaurant.id, updateData);

			if (result.success) {
				dispatch(updateUser(result.data));
				toast.success('Hesab məlumatları yeniləndi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		} catch (error) {
			toast.error('Hesab yenilənərkən xəta baş verdi');
			console.error('Account update error:', error);
		} finally {
			setLoading(false);
		}
	};

	const tabs = [
		{ id: 'general', name: 'Ümumi' },
		{ id: 'receipt', name: 'Çek Parametrləri' },
		{ id: 'account', name: 'Hesab' },
	];

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<Sidebar />

			<div className='flex-1 ml-64'>
				<Header title='Parametrlər' />

				<div className='p-6'>
					<div className='bg-white rounded-lg shadow-md overflow-hidden'>
						<div className='flex border-b border-gray-200'>
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`px-6 py-4 font-medium border-b-2 transition ${
										activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
									}`}
								>
									{tab.name}
								</button>
							))}
						</div>

						{activeTab === 'general' && (
							<form onSubmit={handleSubmitGeneral(onSubmitGeneral)} className='p-6'>
								<div className='space-y-6 max-w-2xl'>
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>Restoran Adı *</label>
										<input
											type='text'
											{...registerGeneral('name', { required: 'Restoran adı tələb olunur' })}
											className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										/>
										{errorsGeneral.name && <p className='mt-1 text-sm text-red-600'>{errorsGeneral.name.message}</p>}
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>Logo</label>
										<div className='flex items-center space-x-4'>
											{logoPreview && <img src={logoPreview} alt='Logo' className='w-16 h-16 rounded-lg object-cover' />}
											<label className='flex items-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition'>
												<Upload className='w-4 h-4 mr-2' />
												<span className='text-sm'>Logo Seç</span>
												<input type='file' accept='image/*' onChange={handleLogoChange} className='hidden' />
											</label>
										</div>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>Ünvan</label>
										<input
											type='text'
											{...registerGeneral('address')}
											className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										/>
									</div>

									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className='block text-sm font-medium text-gray-700 mb-2'>Telefon</label>
											<input
												type='text'
												{...registerGeneral('phone')}
												className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
											<input
												type='email'
												{...registerGeneral('email')}
												className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>
									</div>

									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className='block text-sm font-medium text-gray-700 mb-2'>Açılış Saatı</label>
											<input
												type='time'
												{...registerGeneral('working_hours_open')}
												className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-700 mb-2'>Bağlanış Saatı</label>
											<input
												type='time'
												{...registerGeneral('working_hours_close')}
												className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>
									</div>

									<div className='grid grid-cols-3 gap-4'>
										<div>
											<label className='block text-sm font-medium text-gray-700 mb-2'>Valyuta</label>
											<select
												{...registerGeneral('currency')}
												className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											>
												<option value='AZN'>AZN (₼)</option>
												<option value='USD'>USD ($)</option>
												<option value='EUR'>EUR (€)</option>
												<option value='TRY'>TRY (₺)</option>
											</select>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-700 mb-2'>Vergi (%)</label>
											<input
												type='number'
												step='0.01'
												{...registerGeneral('tax_rate')}
												className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-700 mb-2'>Dil</label>
											<select
												{...registerGeneral('language')}
												className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											>
												<option value='az'>Azərbaycan</option>
												<option value='en'>English</option>
												<option value='ru'>Русский</option>
												<option value='tr'>Türkçe</option>
											</select>
										</div>
									</div>

									<div className='pt-4'>
										<button
											type='submit'
											disabled={loading}
											className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50'
										>
											{loading ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
										</button>
									</div>
								</div>
							</form>
						)}

						{activeTab === 'receipt' && (
							<div className='p-6'>
								<div className='max-w-2xl'>
									<p className='text-gray-600'>Çek parametrləri POS sistemində konfiqurasiya ediləcək.</p>
								</div>
							</div>
						)}

						{activeTab === 'account' && (
							<form onSubmit={handleSubmitAccount(onSubmitAccount)} className='p-6'>
								<div className='space-y-6 max-w-2xl'>
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>İstifadəçi Adı</label>
										<input
											type='text'
											{...registerAccount('username')}
											defaultValue={restaurant?.username}
											className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>Yeni Şifrə</label>
										<input
											type='password'
											{...registerAccount('new_password')}
											className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
											placeholder='Boş saxlayın əgər dəyişdirmək istəmirsinizsə'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>Şifrəni Təsdiqlə</label>
										<input
											type='password'
											{...registerAccount('confirm_password')}
											className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
										<input
											type='email'
											{...registerAccount('email')}
											defaultValue={restaurant?.email}
											className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
										/>
									</div>

									<div className='pt-4'>
										<button
											type='submit'
											disabled={loading}
											className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50'
										>
											{loading ? 'Yenilənir...' : 'Yenilə'}
										</button>
									</div>
								</div>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
