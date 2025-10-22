import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getIngredients, addIngredient, updateIngredient, deleteIngredient } from '../utils/storage';
import IngredientModal from '../components/modals/IngredientModal';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function IngredientsPage({ restaurantId }) {
	const [ingredients, setIngredients] = useState([]);
	const [filteredIngredients, setFilteredIngredients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedIngredient, setSelectedIngredient] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [ingredientToDelete, setIngredientToDelete] = useState(null);

	useEffect(() => {
		loadIngredients();
	}, [restaurantId]);

	useEffect(() => {
		filterIngredients();
	}, [searchTerm, ingredients]);

	const loadIngredients = async () => {
		setLoading(true);
		try {
			const data = await getIngredients(restaurantId);
			setIngredients(data);
			setFilteredIngredients(data);
		} catch (error) {
			toast.error('Tərkiblər yüklənərkən xəta baş verdi');
			console.error('Load ingredients error:', error);
		} finally {
			setLoading(false);
		}
	};

	const filterIngredients = () => {
		if (!searchTerm.trim()) {
			setFilteredIngredients(ingredients);
			return;
		}

		const filtered = ingredients.filter((ingredient) => ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()));
		setFilteredIngredients(filtered);
	};

	const handleAddIngredient = () => {
		setSelectedIngredient(null);
		setIsModalOpen(true);
	};

	const handleEditIngredient = (ingredient) => {
		setSelectedIngredient(ingredient);
		setIsModalOpen(true);
	};

	const handleDeleteClick = (ingredient) => {
		setIngredientToDelete(ingredient);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		if (!ingredientToDelete) return;

		try {
			await deleteIngredient(ingredientToDelete.id);
			toast.success('Tərkib silindi');
			loadIngredients();
		} catch (error) {
			toast.error('Tərkib silinərkən xəta baş verdi');
			console.error('Delete ingredient error:', error);
		} finally {
			setShowDeleteConfirm(false);
			setIngredientToDelete(null);
		}
	};

	const handleModalSuccess = async (ingredientData) => {
		try {
			if (selectedIngredient) {
				await updateIngredient(ingredientData.id, ingredientData);
			} else {
				await addIngredient(ingredientData);
			}
			loadIngredients();
		} catch (error) {
			console.error('Ingredient operation error:', error);
		}
	};

	const getStockStatus = (quantity, minQuantity) => {
		if (quantity <= 0) {
			return { text: 'Stokda yoxdur', color: 'text-red-600 bg-red-100' };
		}
		if (quantity <= minQuantity) {
			return { text: 'Azdır', color: 'text-orange-600 bg-orange-100' };
		}
		return { text: 'Normaldır', color: 'text-green-600 bg-green-100' };
	};

	return (
		<div>
			<Sidebar />
			<div className='flex-1 ml-64'>
				<Header title='İnqredientlər' />
				<div className='flex-1 overflow-y-auto p-6'>
					<div className='mb-8'>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>Tərkiblər</h1>
						<p className='text-gray-600'>Restoran tərkiblərini idarə edin</p>
					</div>

					<div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
						<div className='flex items-center justify-between gap-4'>
							<div className='flex-1 relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
								<input
									type='text'
									placeholder='Tərkib axtar...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								/>
							</div>
							<button
								onClick={handleAddIngredient}
								className='flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium'
							>
								<Plus className='w-5 h-5' />
								<span>Yeni Tərkib</span>
							</button>
						</div>
					</div>

					{loading ? (
						<div className='flex items-center justify-center py-12'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
						</div>
					) : filteredIngredients.length === 0 ? (
						<div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
							<AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
							<h3 className='text-lg font-medium text-gray-900 mb-2'>{searchTerm ? 'Nəticə tapılmadı' : 'Tərkib yoxdur'}</h3>
							<p className='text-gray-600 mb-6'>
								{searchTerm ? 'Axtarış üçün başqa açar söz cəhd edin' : 'Başlamaq üçün ilk tərkibinizi əlavə edin'}
							</p>
							{!searchTerm && (
								<button
									onClick={handleAddIngredient}
									className='inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium'
								>
									<Plus className='w-5 h-5' />
									<span>Yeni Tərkib Əlavə Et</span>
								</button>
							)}
						</div>
					) : (
						<div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead className='bg-gray-50 border-b border-gray-200'>
										<tr>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Ad</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Ölçü Vahidi</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Miqdar</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Min. Miqdar</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
											<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Vəziyyət</th>
											<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Əməliyyatlar</th>
										</tr>
									</thead>
									<tbody className='bg-white divide-y divide-gray-200'>
										{filteredIngredients.map((ingredient) => {
											const stockStatus = getStockStatus(ingredient.quantity, ingredient.min_quantity);
											return (
												<tr key={ingredient.id} className='hover:bg-gray-50 transition'>
													<td className='px-6 py-4 whitespace-nowrap'>
														<div className='text-sm font-medium text-gray-900'>{ingredient.name}</div>
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														<div className='text-sm text-gray-600'>{ingredient.unit}</div>
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														<div className='text-sm text-gray-900 font-medium'>
															{ingredient.quantity} {ingredient.unit}
														</div>
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														<div className='text-sm text-gray-600'>
															{ingredient.min_quantity} {ingredient.unit}
														</div>
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														<span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
															{stockStatus.text}
														</span>
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														<span
															className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
																ingredient.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
															}`}
														>
															{ingredient.is_active ? 'Aktiv' : 'Deaktiv'}
														</span>
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
														<div className='flex items-center justify-end space-x-2'>
															<button
																onClick={() => handleEditIngredient(ingredient)}
																className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'
															>
																<Edit2 className='w-4 h-4' />
															</button>
															<button
																onClick={() => handleDeleteClick(ingredient)}
																className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition'
															>
																<Trash2 className='w-4 h-4' />
															</button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>

				<IngredientModal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setSelectedIngredient(null);
					}}
					onSuccess={handleModalSuccess}
					restaurantId={restaurantId}
					item={selectedIngredient}
				/>

				{showDeleteConfirm && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
						<div className='bg-white rounded-xl shadow-2xl max-w-md w-full p-6'>
							<div className='flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4'>
								<AlertCircle className='w-6 h-6 text-red-600' />
							</div>
							<h3 className='text-lg font-bold text-gray-900 text-center mb-2'>Tərkibi sil</h3>
							<p className='text-gray-600 text-center mb-6'>
								"{ingredientToDelete?.name}" tərkibini silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
							</p>
							<div className='flex items-center space-x-4'>
								<button
									onClick={() => {
										setShowDeleteConfirm(false);
										setIngredientToDelete(null);
									}}
									className='flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition'
								>
									Ləğv et
								</button>
								<button
									onClick={handleDeleteConfirm}
									className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition'
								>
									Sil
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
