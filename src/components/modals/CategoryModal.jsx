import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { storageUtils } from '../../utils/storage';

export default function CategoryModal({ isOpen, onClose, onSuccess, restaurantId, category = null }) {
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm({
		defaultValues: {
			sort_order: 0,
			is_active: true,
		},
	});

	useEffect(() => {
		if (category) {
			setValue('name', category.name);
			setValue('sort_order', category.sort_order);
			setValue('is_active', category.is_active);
		}
	}, [category, setValue]);

	const onSubmit = async (data) => {
		setLoading(true);

		try {
			const categoryData = {
				...data,
				restaurant_id: restaurantId,
				sort_order: parseInt(data.sort_order),
				is_active: data.is_active === true || data.is_active === 'true',
			};

			let result;
			if (category) {
				result = await storageUtils.updateCategory(category.id, categoryData);
			} else {
				result = await storageUtils.addCategory(categoryData);
			}

			if (result.success) {
				toast.success(category ? 'Kateqoriya yeniləndi' : 'Kateqoriya əlavə edildi');
				reset();
				onSuccess(result.data);
				onClose();
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		} catch (error) {
			toast.error('Kateqoriya əməliyyatı zamanı xəta baş verdi');
			console.error('Category operation error:', error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
				<div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
					<h2 className='text-xl font-bold text-gray-900'>{category ? 'Kateqoriyanı Redaktə Et' : 'Yeni Kateqoriya'}</h2>
					<button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition'>
						<X className='w-5 h-5 text-gray-500' />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Kateqoriya Adı *</label>
						<input
							type='text'
							{...register('name', { required: 'Kateqoriya adı tələb olunur' })}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
						{errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>}
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Sıralama</label>
						<input
							type='number'
							{...register('sort_order')}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
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
