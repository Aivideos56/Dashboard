import { useForm } from 'react-hook-form';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { storageUtils } from '../../utils/storage';
import { validateProduct, validatePrice } from '../../utils/validation';
import { uploadImage, generateBarcode } from '../../utils/helpers';

export default function ProductModal({
	isOpen,
	onClose,
	onSuccess,
	restaurantId,
	categories,
	departments = [],
	product = null,
	allProducts = [],
}) {
	const [loading, setLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState('');
	const [subCategories, setSubCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState('');
	const [hasModifications, setHasModifications] = useState(false);
	const [modifications, setModifications] = useState([]);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm({
		defaultValues: product || {
			price: 0,
			cost: 0,
			is_active: true,
		},
	});

	const watchCategory = watch('category_id');

	useEffect(() => {
		if (watchCategory) {
			setSelectedCategory(watchCategory);
			loadSubCategories(watchCategory);
		}
	}, [watchCategory]);

	useEffect(() => {
		if (product && product.image) setImagePreview(product.image);
		if (product?.modifications?.length) {
			setHasModifications(true);
			setModifications(product.modifications);
		}
	}, [product]);

	const loadSubCategories = async (categoryId) => {
		const subs = await storageUtils.getSubCategories(categoryId);
		setSubCategories(subs);
	};

	const handleImageChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const base64 = await uploadImage(file);
			setImagePreview(base64);
		}
	};

	const handleGenerateBarcode = () => {
		const barcode = generateBarcode();
		setValue('barcode', barcode);
	};

	const handleAddModification = () => {
		setModifications((prev) => [
			...prev,
			{ name: '', barcode: '', cost: 0, price: 0 },
		]);
	};

	const handleRemoveModification = (index) => {
		setModifications((prev) => prev.filter((_, i) => i !== index));
	};

	const handleModificationChange = (index, field, value) => {
		setModifications((prev) =>
			prev.map((mod, i) => (i === index ? { ...mod, [field]: value } : mod))
		);
	};

	const onSubmit = async (data) => {
		const priceValidation = validatePrice(data.price);
		if (!priceValidation.isValid) {
			toast.error(priceValidation.message);
			return;
		}

		if (!product) {
			const validation = validateProduct(data.name, data.category_id, allProducts);
			if (!validation.isValid) {
				toast.error(validation.message);
				return;
			}
		}

		if (!data.department_id) {
			toast.error('Zəhmət olmasa şöbə seçin');
			return;
		}

		setLoading(true);
		try {
			const productData = {
				...data,
				restaurant_id: restaurantId,
				price: parseFloat(data.price),
				cost: parseFloat(data.cost) || 0,
				image: imagePreview,
				is_active: data.is_active === true || data.is_active === 'true',
				sub_category_id: data.sub_category_id || null,
				has_modifications: hasModifications,
				modifications: hasModifications ? modifications : [],
			};

			let result;
			if (product) result = await storageUtils.updateProduct(product.id, productData);
			else result = await storageUtils.addProduct(productData);

			if (result.success) {
				toast.success(product ? 'Məhsul yeniləndi' : 'Məhsul əlavə edildi');
				reset();
				setImagePreview('');
				setModifications([]);
				setHasModifications(false);
				onSuccess(result.data);
				onClose();
			} else toast.error(result.error || 'Xəta baş verdi');
		} catch (error) {
			toast.error('Məhsul əməliyyatı zamanı xəta baş verdi');
			console.error('Product operation error:', error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
					<h2 className='text-xl font-bold text-gray-900'>
						{product ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul'}
					</h2>
					<button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition'>
						<X className='w-5 h-5 text-gray-500' />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-4'>
					{/* Ad */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Məhsul Adı *
						</label>
						<input
							type='text'
							{...register('name', { required: 'Məhsul adı tələb olunur' })}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
						{errors.name && (
							<p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
						)}
					</div>

					{/* Şəkil */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Şəkil</label>
						<div className='flex items-center space-x-4'>
							{imagePreview && (
								<img
									src={imagePreview}
									alt='Preview'
									className='w-20 h-20 rounded-lg object-cover'
								/>
							)}
							<label className='flex items-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition'>
								<Upload className='w-4 h-4 mr-2' />
								<span className='text-sm'>Şəkil Seç</span>
								<input
									type='file'
									accept='image/*'
									onChange={handleImageChange}
									className='hidden'
								/>
							</label>
						</div>
					</div>

					{/* Təsvir */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Təsvir</label>
						<textarea
							{...register('description')}
							rows='3'
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
					</div>

					{/* Qiymət və Maya */}
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>Qiymət *</label>
							<input
								type='number'
								step='0.01'
								{...register('price', { required: 'Qiymət tələb olunur' })}
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Maya dəyəri
							</label>
							<input
								type='number'
								step='0.01'
								{...register('cost')}
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
						</div>
					</div>

					{/* Kateqoriya */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Kateqoriya *
						</label>
						<select
							{...register('category_id', { required: 'Kateqoriya tələb olunur' })}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							<option value=''>Seçin</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
					</div>

					{/* Alt kateqoriya */}
					{subCategories.length > 0 && (
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Alt Kateqoriya
							</label>
							<select
								{...register('sub_category_id')}
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							>
								<option value=''>Seçin (opsional)</option>
								{subCategories.map((sub) => (
									<option key={sub.id} value={sub.id}>
										{sub.name}
									</option>
								))}
							</select>
						</div>
					)}

					{/* Şöbə seçimi */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							Şöbə *
						</label>
						<select
							{...register('department_id', { required: 'Şöbə seçilməlidir' })}
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						>
							<option value=''>Seçin</option>
							{departments.map((dep) => (
								<option key={dep.id} value={dep.id}>
									{dep.name}
								</option>
							))}
						</select>
						{errors.department_id && (
							<p className='mt-1 text-sm text-red-600'>{errors.department_id.message}</p>
						)}
					</div>

					{/* Barkod */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Barkod</label>
						<div className='flex items-center space-x-2'>
							<input
								type='text'
								{...register('barcode')}
								className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							/>
							<button
								type='button'
								onClick={handleGenerateBarcode}
								className='px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition'
							>
								Yarat
							</button>
						</div>
					</div>

					{/* Modifikasiyası var */}
					<div className='pt-2 border-t border-gray-200'>
						<label className='flex items-center space-x-2'>
							<input
								type='checkbox'
								checked={hasModifications}
								onChange={(e) => setHasModifications(e.target.checked)}
								className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
							/>
							<span className='text-sm text-gray-700'>Modifikasiyası var</span>
						</label>

						{/* Əgər seçilibsə modifikasiya listi */}
						{hasModifications && (
							<div className='mt-4 space-y-3'>
								{modifications.map((mod, index) => (
									<div
										key={index}
										className='grid grid-cols-4 gap-3 items-end border p-3 rounded-lg relative'
									>
										<input
											type='text'
											placeholder='Ad'
											value={mod.name}
											onChange={(e) =>
												handleModificationChange(index, 'name', e.target.value)
											}
											className='px-3 py-2 border rounded-lg'
										/>
										<input
											type='text'
											placeholder='Barkod'
											value={mod.barcode}
											onChange={(e) =>
												handleModificationChange(index, 'barcode', e.target.value)
											}
											className='px-3 py-2 border rounded-lg'
										/>
										<input
											type='number'
											step='0.01'
											placeholder='Maya dəyəri'
											value={mod.cost}
											onChange={(e) =>
												handleModificationChange(index, 'cost', e.target.value)
											}
											className='px-3 py-2 border rounded-lg'
										/>
										<input
											type='number'
											step='0.01'
											placeholder='Qiymət'
											value={mod.price}
											onChange={(e) =>
												handleModificationChange(index, 'price', e.target.value)
											}
											className='px-3 py-2 border rounded-lg'
										/>
										<button
											type='button'
											onClick={() => handleRemoveModification(index)}
											className='absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600'
										>
											<Trash2 className='w-4 h-4' />
										</button>
									</div>
								))}

								<button
									type='button'
									onClick={handleAddModification}
									className='flex items-center text-sm text-blue-600 hover:underline'
								>
									<Plus className='w-4 h-4 mr-1' /> Əlavə et
								</button>
							</div>
						)}
					</div>

					{/* Aktiv */}
					<div className='flex items-center'>
						<input
							type='checkbox'
							{...register('is_active')}
							className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
						/>
						<label className='ml-2 text-sm text-gray-700'>Aktiv</label>
					</div>

					{/* Buttonlar */}
					<div className='flex items-center justify-end space-x-4 pt-4 border-t border-gray-200'>
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