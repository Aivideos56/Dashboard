import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { addHall, updateHall } from '../../utils/storageExtensions';

export default function HallModal({ isOpen, onClose, onSuccess, restaurantId, hall = null }) {
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm({
		defaultValues: {
			service_charge: 0,
			is_active: true,
		},
	});

	useEffect(() => {
		if (hall) {
			setValue('name', hall.name);
			setValue('service_charge', hall.service_charge);
			setValue('is_active', hall.is_active);
		}
	}, [hall, setValue]);

	const onSubmit = async (data) => {
		setLoading(true);

		try {
			const hallData = {
				...data,
				restaurant_id: restaurantId,
				service_charge: parseFloat(data.service_charge) || 0,
				is_active: data.is_active === true || data.is_active === 'true',
			};

			let result;
			if (hall) {
				result = await updateHall(hall.id, hallData);
			} else {
				result = await addHall(hallData);
			}

			if (result.success) {
				toast.success(hall ? 'Zal yeniləndi' : 'Zal əlavə edildi');
				reset();
				onSuccess(result.data);
				onClose();
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		} catch (error) {
			toast.error('Zal əməliyyatı zamanı xəta baş verdi');
			console.error('Hall operation error:', error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
				<div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
					<h2 className='text-xl font-bold text-gray-900'>{hall ? 'Zalı Redaktə Et' : 'Yeni Zal'}</h2>
					<button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition'>
						<X className='w-5 h-5 text-gray-500' />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Zal Adı *</label>
						<input
							type='text'
							{...register('name', { required: 'Zal adı tələb olunur' })}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							placeholder='məs: Əsas Zal, VIP Zal'
						/>
						{errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>}
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Xidmət Haqqı (%)</label>
						<input
							type='number'
							step='0.01'
							{...register('service_charge')}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							placeholder='0'
						/>
						<p className='mt-1 text-xs text-gray-500'>Bu zalın bütün masalarına avtomatik tətbiq olunur</p>
					</div>

					<div className='flex items-center'>
						<input type='checkbox' {...register('is_active')} className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500' />
						<label className='ml-2 text-sm text-gray-700'>Aktiv</label>
					</div>

					<div className='flex items-center justify-end space-x-4 pt-4'>
						<button
							type='button'
							onClick={onClose}
							className='px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition'
						>
							Ləğv et
						</button>
						<button
							type='submit'
							disabled={loading}
							className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50'
						>
							{loading ? 'Əməliyyat...' : 'Yadda saxla'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
