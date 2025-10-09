import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { storageUtils } from '../../utils/storage';
import { validateTableNumber } from '../../utils/validation';

export default function TableModal({ isOpen, onClose, onSuccess, restaurantId, table = null, existingTables = [] }) {
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: table
			? {
					number: table.table_number,
					capacity: table.capacity,
					zone: table.zone,
					status: table.status,
			  }
			: {
					number: '',
					capacity: 4,
					zone: 'Daxili',
					status: 'empty',
			  },
	});
  
	useEffect(() => {
		if (table) {
			reset({
				number: table.table_number,
				capacity: table.capacity,
				zone: table.zone,
				status: table.status,
			});
		}
	}, [table, reset]);

	const onSubmit = async (data) => {
		const validation = validateTableNumber(data.number, restaurantId, existingTables, table?.id);

		if (!validation.isValid) {
			toast.error(validation.message);
			return;
		}

		setLoading(true);

		try {
			const tableData = {
				...data,
				restaurant_id: restaurantId,
				table_number: parseInt(data.number),
				capacity: parseInt(data.capacity),
			};

			let result;
			if (table) {
				result = await storageUtils.updateTable(table.id, tableData);
			} else {
				result = await storageUtils.addTable(tableData);
			}

			if (result.success) {
				toast.success(table ? 'Masa yeniləndi' : 'Masa əlavə edildi');
				reset();
				onSuccess(result.data);
				onClose();
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		} catch (error) {
			toast.error('Masa əməliyyatı zamanı xəta baş verdi');
			console.error('Table operation error:', error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
				<div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
					<h2 className='text-xl font-bold text-gray-900'>{table ? 'Masanı Redaktə Et' : 'Yeni Masa Əlavə Et'}</h2>
					<button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition'>
						<X className='w-5 h-5 text-gray-500' />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Masa Nömrəsi *</label>
						<input
							type='number'
							{...register('number', { required: 'Masa nömrəsi tələb olunur' })}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
						{errors.number && <p className='mt-1 text-sm text-red-600'>{errors.number.message}</p>}
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Tutum *</label>
						<select
							{...register('capacity')}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							<option value='2'>2 nəfərlik</option>
							<option value='4'>4 nəfərlik</option>
							<option value='6'>6 nəfərlik</option>
							<option value='8'>8 nəfərlik</option>
							<option value='10'>10 nəfərlik</option>
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Zona *</label>
						<select
							{...register('zone')}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							<option value='Daxili'>Daxili</option>
							<option value='Xarici'>Xarici</option>
							<option value='VIP'>VIP</option>
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Status *</label>
						<select
							{...register('status')}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							<option value='empty'>Boş</option>
							<option value='occupied'>Dolu</option>
							<option value='waiting_payment'>Ödəniş gözləyir</option>
						</select>
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
