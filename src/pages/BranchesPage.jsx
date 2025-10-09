import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, CreditCard as Edit, Trash2, MapPin } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import BranchModal from '../components/modals/BranchModal';
import { storageUtils } from '../utils/storage';
import toast from 'react-hot-toast';

export default function BranchesPage() {
	const { restaurant } = useSelector((state) => state.auth);
	const [branches, setBranches] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedBranch, setSelectedBranch] = useState(null);

	useEffect(() => {
		if (restaurant) {
			loadBranches();
		}
	}, [restaurant]);

	const loadBranches = async () => {
		const data = await storageUtils.getBranches(restaurant.id);
		setBranches(data);
	};

	const handleAddBranch = (newBranch) => {
		setBranches([newBranch, ...branches]);
	};

	const handleUpdateBranch = (updatedBranch) => {
		setBranches(branches.map((b) => (b.id === updatedBranch.id ? updatedBranch : b)));
	};

	const handleEditBranch = (branch) => {
		setSelectedBranch(branch);
		setShowModal(true);
	};

	const handleDeleteBranch = async (branchId) => {
		if (window.confirm('Filialı silmək istədiyinizdən əminsiniz? Bu filialın bütün istifadəçi və masa məlumatları silinəcək.')) {
			const result = await storageUtils.deleteBranch(branchId);
			if (result.success) {
				setBranches(branches.filter((b) => b.id !== branchId));
				toast.success('Filial silindi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedBranch(null);
	};

	const activeBranches = branches.filter((b) => b.is_active).length;

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<Sidebar />

			<div className='flex-1 ml-64'>
				<Header
					title='Filiallar'
					stats={[
						{ label: 'Ümumi', value: branches.length },
						{ label: 'Aktiv', value: activeBranches },
					]}
				/>

				<div className='p-6'>
					<div className='mb-6 flex items-center justify-between'>
						<div>
							<h2 className='text-2xl font-bold text-gray-900 mb-2'>Filial İdarəetməsi</h2>
							<p className='text-gray-600'>Restoranınızın filiallarını idarə edin</p>
						</div>
						<button
							onClick={() => setShowModal(true)}
							className='flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
						>
							<Plus className='w-5 h-5 mr-2' />
							Yeni Filial
						</button>
					</div>

					{branches.length === 0 ? (
						<div className='bg-white rounded-lg shadow-md p-12 text-center'>
							<MapPin className='w-16 h-16 text-gray-400 mx-auto mb-4' />
							<h3 className='text-xl font-bold text-gray-900 mb-2'>Hələ filial yoxdur</h3>
							<p className='text-gray-600 mb-6'>Restoranınızın filiallarını əlavə edərək istifadəçi və masa idarəetməsini asanlaşdırın</p>
							<button
								onClick={() => setShowModal(true)}
								className='px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
							>
								İlk Filialı Əlavə Et
							</button>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{branches.map((branch) => (
								<div key={branch.id} className='bg-white rounded-lg shadow-md hover:shadow-lg transition p-6'>
									<div className='flex items-start justify-between mb-4'>
										<div className='flex-1'>
											<h3 className='text-lg font-bold text-gray-900 mb-1'>{branch.name}</h3>
											<span
												className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
													branch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
												}`}
											>
												{branch.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
											</span>
										</div>
									</div>

									<div className='space-y-2 mb-4'>
										{branch.address && (
											<div className='flex items-start text-sm text-gray-600'>
												<MapPin className='w-4 h-4 mr-2 mt-0.5 flex-shrink-0' />
												<span>{branch.address}</span>
											</div>
										)}
										{branch.phone && (
											<div className='text-sm text-gray-600'>
												<span className='font-medium'>Tel:</span> {branch.phone}
											</div>
										)}
									</div>

									<div className='flex items-center space-x-2 pt-4 border-t border-gray-200'>
										<button
											onClick={() => handleEditBranch(branch)}
											className='flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition'
										>
											<Edit className='w-4 h-4 mr-1' />
											<span className='text-sm font-medium'>Redaktə</span>
										</button>
										<button
											onClick={() => handleDeleteBranch(branch.id)}
											className='flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition'
										>
											<Trash2 className='w-4 h-4' />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<BranchModal
				isOpen={showModal}
				onClose={handleCloseModal}
				onSuccess={selectedBranch ? handleUpdateBranch : handleAddBranch}
				restaurantId={restaurant?.id}
				branch={selectedBranch}
			/>
		</div>
	);
}
