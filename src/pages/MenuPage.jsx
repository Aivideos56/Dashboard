import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, CreditCard as Edit, Trash2, Search, Package } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import CategoryModal from '../components/modals/CategoryModal';
import SubCategoryModal from '../components/modals/SubCategoryModal';
import ProductModal from '../components/modals/ProductModal';
import {
	setCategories,
	addCategory,
	updateCategory as updateCategoryAction,
	removeCategory,
	setSubCategories,
	addSubCategory,
	updateSubCategory as updateSubCategoryAction,
	removeSubCategory,
	setProducts,
	addProduct,
	updateProduct as updateProductAction,
	removeProduct,
} from '../store/slices/menuSlice';
import { storageUtils } from '../utils/storage';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function MenuPage() {
	const dispatch = useDispatch();
	const { restaurant } = useSelector((state) => state.auth);
	const { categories, subCategories, products } = useSelector((state) => state.menu);
	const [activeTab, setActiveTab] = useState('categories');
	const [showCategoryModal, setShowCategoryModal] = useState(false);
	const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
	const [showProductModal, setShowProductModal] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterCategory, setFilterCategory] = useState('');
	const [filterSubCategory, setFilterSubCategory] = useState('');

	useEffect(() => {
		if (restaurant) {
			loadData();
		}
	}, [restaurant]);

	const loadData = async () => {
		const [categoriesData, productsData] = await Promise.all([storageUtils.getCategories(restaurant.id), storageUtils.getProducts(restaurant.id)]);

		dispatch(setCategories(categoriesData));
		dispatch(setProducts(productsData));

		const allSubCategories = [];
		for (const cat of categoriesData) {
			const subs = await storageUtils.getSubCategories(cat.id);
			allSubCategories.push(...subs);
		}
		dispatch(setSubCategories(allSubCategories));
	};

	const handleDeleteCategory = async (id) => {
		if (window.confirm('Kateqoriyanı silmək istədiyinizdən əminsiniz?')) {
			const result = await storageUtils.deleteCategory(id);
			if (result.success) {
				dispatch(removeCategory(id));
				toast.success('Kateqoriya silindi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		}
	};

	const handleDeleteSubCategory = async (id) => {
		if (window.confirm('Alt kateqoriyanı silmək istədiyinizdən əminsiniz?')) {
			const result = await storageUtils.deleteSubCategory(id);
			if (result.success) {
				dispatch(removeSubCategory(id));
				toast.success('Alt kateqoriya silindi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		}
	};

	const handleDeleteProduct = async (id) => {
		if (window.confirm('Məhsulu silmək istədiyinizdən əminsiniz?')) {
			const result = await storageUtils.deleteProduct(id);
			if (result.success) {
				dispatch(removeProduct(id));
				toast.success('Məhsul silindi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		}
	};

	const handleEditCategory = (category) => {
		setSelectedItem(category);
		setShowCategoryModal(true);
	};

	const handleEditSubCategory = (subCategory) => {
		setSelectedItem(subCategory);
		setShowSubCategoryModal(true);
	};

	const handleEditProduct = (product) => {
		setSelectedItem(product);
		setShowProductModal(true);
	};

	const handleCloseModals = () => {
		setShowCategoryModal(false);
		setShowSubCategoryModal(false);
		setShowProductModal(false);
		setSelectedItem(null);
	};

	const filteredProducts = products.filter((product) => {
		const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = !filterCategory || product.category_id === filterCategory;
		const matchesSubCategory = !filterSubCategory || product.sub_category_id === filterSubCategory;
		return matchesSearch && matchesCategory && matchesSubCategory;
	});

	const tabs = [
		{ id: 'categories', name: 'Kateqoriyalar' },
		{ id: 'subcategories', name: 'Alt Kateqoriyalar' },
		{ id: 'products', name: 'Məhsullar' },
	];

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<Sidebar />

			<div className='flex-1 ml-64'>
				<Header
					title='Menyu'
					stats={[
						{ label: 'Kateqoriyalar', value: categories.length },
						{ label: 'Məhsullar', value: products.length },
					]}
				/>

				<div className='p-6'>
					<div className='mb-6'>
						<div className='flex border-b border-gray-200'>
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`px-6 py-3 font-medium border-b-2 transition ${
										activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
									}`}
								>
									{tab.name}
								</button>
							))}
						</div>
					</div>

					{activeTab === 'categories' && (
						<div>
							<div className='mb-6 flex items-center justify-between'>
								<h2 className='text-2xl font-bold text-gray-900'>Kateqoriyalar</h2>
								<button
									onClick={() => setShowCategoryModal(true)}
									className='flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
								>
									<Plus className='w-5 h-5 mr-2' />
									Yeni Kateqoriya
								</button>
							</div>

							<div className='bg-white rounded-lg shadow-md overflow-hidden'>
								<table className='min-w-full'>
									<thead className='bg-gray-50'>
										<tr>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Ad</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Alt Kateqoriya</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Məhsul Sayı</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Status</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-gray-600'>Əməliyyatlar</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-gray-200'>
										{categories.map((category) => {
											const subCount = subCategories.filter((s) => s.category_id === category.id).length;
											const productCount = products.filter((p) => p.category_id === category.id).length;

											return (
												<tr key={category.id} className='hover:bg-gray-50'>
													<td className='px-6 py-4 text-sm font-medium text-gray-900'>{category.name}</td>
													<td className='px-6 py-4 text-sm text-gray-900'>{subCount}</td>
													<td className='px-6 py-4 text-sm text-gray-900'>{productCount}</td>
													<td className='px-6 py-4 text-sm'>
														<span
															className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
																category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
															}`}
														>
															{category.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
														</span>
													</td>
													<td className='px-6 py-4 text-sm text-right'>
														<div className='flex items-center justify-end space-x-2'>
															<button
																onClick={() => handleEditCategory(category)}
																className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'
															>
																<Edit className='w-4 h-4' />
															</button>
															<button
																onClick={() => handleDeleteCategory(category.id)}
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
								{categories.length === 0 && (
									<div className='text-center py-12'>
										<Package className='w-12 h-12 text-gray-400 mx-auto mb-4' />
										<p className='text-gray-500 mb-4'>Hələ kateqoriya yoxdur</p>
										<button
											onClick={() => setShowCategoryModal(true)}
											className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
										>
											İlk Kateqoriyanı Əlavə Et
										</button>
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === 'subcategories' && (
						<div>
							<div className='mb-6 flex items-center justify-between'>
								<div>
									<h2 className='text-2xl font-bold text-gray-900 mb-2'>Alt Kateqoriyalar</h2>
									<select
										value={filterCategory}
										onChange={(e) => setFilterCategory(e.target.value)}
										className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
									>
										<option value=''>Bütün kateqoriyalar</option>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.name}
											</option>
										))}
									</select>
								</div>
								<button
									onClick={() => setShowSubCategoryModal(true)}
									className='flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
								>
									<Plus className='w-5 h-5 mr-2' />
									Yeni Alt Kateqoriya
								</button>
							</div>

							<div className='bg-white rounded-lg shadow-md overflow-hidden'>
								<table className='min-w-full'>
									<thead className='bg-gray-50'>
										<tr>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Ad</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Kateqoriya</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Məhsul Sayı</th>
											<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Status</th>
											<th className='px-6 py-3 text-right text-sm font-medium text-gray-600'>Əməliyyatlar</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-gray-200'>
										{subCategories
											.filter((sub) => !filterCategory || sub.category_id === filterCategory)
											.map((subCategory) => {
												const category = categories.find((c) => c.id === subCategory.category_id);
												const productCount = products.filter((p) => p.sub_category_id === subCategory.id).length;

												return (
													<tr key={subCategory.id} className='hover:bg-gray-50'>
														<td className='px-6 py-4 text-sm font-medium text-gray-900'>{subCategory.name}</td>
														<td className='px-6 py-4 text-sm text-gray-900'>{category?.name || '-'}</td>
														<td className='px-6 py-4 text-sm text-gray-900'>{productCount}</td>
														<td className='px-6 py-4 text-sm'>
															<span
																className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
																	subCategory.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
																}`}
															>
																{subCategory.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
															</span>
														</td>
														<td className='px-6 py-4 text-sm text-right'>
															<div className='flex items-center justify-end space-x-2'>
																<button
																	onClick={() => handleEditSubCategory(subCategory)}
																	className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'
																>
																	<Edit className='w-4 h-4' />
																</button>
																<button
																	onClick={() => handleDeleteSubCategory(subCategory.id)}
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

					{activeTab === 'products' && (
						<div>
							<div className='mb-6 flex items-center justify-between'>
								<div className='flex-1 max-w-2xl space-y-2'>
									<div className='flex items-center space-x-4'>
										<div className='flex-1 relative'>
											<Search className='w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
											<input
												type='text'
												placeholder='Məhsul axtar...'
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
											/>
										</div>
										<button
											onClick={() => setShowProductModal(true)}
											className='flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition whitespace-nowrap'
										>
											<Plus className='w-5 h-5 mr-2' />
											Yeni Məhsul
										</button>
									</div>
									<div className='flex items-center space-x-4'>
										<select
											value={filterCategory}
											onChange={(e) => {
												setFilterCategory(e.target.value);
												setFilterSubCategory('');
											}}
											className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
										>
											<option value=''>Bütün kateqoriyalar</option>
											{categories.map((cat) => (
												<option key={cat.id} value={cat.id}>
													{cat.name}
												</option>
											))}
										</select>
										{filterCategory && (
											<select
												value={filterSubCategory}
												onChange={(e) => setFilterSubCategory(e.target.value)}
												className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
											>
												<option value=''>Bütün alt kateqoriyalar</option>
												{subCategories
													.filter((s) => s.category_id === filterCategory)
													.map((sub) => (
														<option key={sub.id} value={sub.id}>
															{sub.name}
														</option>
													))}
											</select>
										)}
									</div>
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
								{filteredProducts.map((product) => {
									const category = categories.find((c) => c.id === product.category_id);

									return (
										<div key={product.id} className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition'>
											{product.image ? (
												<img src={product.image} alt={product.name} className='w-full h-48 object-cover' />
											) : (
												<div className='w-full h-48 bg-gray-200 flex items-center justify-center'>
													<Package className='w-12 h-12 text-gray-400' />
												</div>
											)}
											<div className='p-4'>
												<h3 className='font-bold text-gray-900 mb-1'>{product.name}</h3>
												<p className='text-sm text-gray-600 mb-2'>{category?.name}</p>
												<p className='text-lg font-bold text-blue-600 mb-3'>{formatCurrency(product.price, restaurant.currency)}</p>
												<div className='flex items-center justify-between'>
													<span
														className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
															product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
														}`}
													>
														{product.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
													</span>
													<div className='flex items-center space-x-2'>
														<button onClick={() => handleEditProduct(product)} className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'>
															<Edit className='w-4 h-4' />
														</button>
														<button
															onClick={() => handleDeleteProduct(product.id)}
															className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition'
														>
															<Trash2 className='w-4 h-4' />
														</button>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							{filteredProducts.length === 0 && (
								<div className='bg-white rounded-lg shadow-md p-12 text-center'>
									<Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-bold text-gray-900 mb-2'>Məhsul tapılmadı</h3>
									<p className='text-gray-600 mb-6'>
										{searchTerm || filterCategory ? 'Axtarış kriteriyalarına uyğun məhsul yoxdur' : 'Hələ məhsul əlavə edilməyib'}
									</p>
									{!searchTerm && !filterCategory && (
										<button
											onClick={() => setShowProductModal(true)}
											className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
										>
											İlk Məhsulu Əlavə Et
										</button>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			<CategoryModal
				isOpen={showCategoryModal}
				onClose={handleCloseModals}
				onSuccess={(data) => {
					if (selectedItem) {
						dispatch(updateCategoryAction(data));
					} else {
						dispatch(addCategory(data));
					}
				}}
				restaurantId={restaurant?.id}
				category={selectedItem}
			/>

			<SubCategoryModal
				isOpen={showSubCategoryModal}
				onClose={handleCloseModals}
				onSuccess={(data) => {
					if (selectedItem) {
						dispatch(updateSubCategoryAction(data));
					} else {
						dispatch(addSubCategory(data));
					}
				}}
				restaurantId={restaurant?.id}
				categories={categories}
				subCategory={selectedItem}
			/>

			<ProductModal
				isOpen={showProductModal}
				onClose={handleCloseModals}
				onSuccess={(data) => {
					if (selectedItem) {
						dispatch(updateProductAction(data));
					} else {
						dispatch(addProduct(data));
					}
				}}
				restaurantId={restaurant?.id}
				categories={categories}
				product={selectedItem}
				allProducts={products}
			/>
		</div>
	);
}
