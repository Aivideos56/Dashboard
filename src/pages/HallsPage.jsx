import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, CreditCard as Edit, Trash2, LayoutGrid } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { supabase } from '../lib/supabase';
import { getHalls, addHall, updateHall, deleteHall, getHallTableCount } from '../utils/storageExtensions';
import toast from 'react-hot-toast';
import HallModal from '../components/modals/HallModal';
import TableModal from '../components/modals/TableModal';

export default function HallsPage() {
	const { restaurant } = useSelector((state) => state.auth);
	const [halls, setHalls] = useState([]);
	const [hallCounts, setHallCounts] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [showTablesModal, setShowTablesModal] = useState(false);
	const [selectedHall, setSelectedHall] = useState(null);

	useEffect(() => {
		if (restaurant) {
			loadHalls();
		}
	}, [restaurant]);

	useEffect(() => {
		if (!restaurant) return;

		const channel = supabase
			.channel('halls-changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'halls',
					filter: `restaurant_id=eq.${restaurant.id}`,
				},
				(payload) => {
					if (payload.eventType === 'INSERT') {
						setHalls((prev) => [payload.new, ...prev]);
						loadHallCount(payload.new.id);
					} else if (payload.eventType === 'UPDATE') {
						setHalls((prev) => prev.map((h) => (h.id === payload.new.id ? payload.new : h)));
					} else if (payload.eventType === 'DELETE') {
						setHalls((prev) => prev.filter((h) => h.id !== payload.old.id));
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [restaurant]);

	const loadHalls = async () => {
		const data = await getHalls(restaurant.id);
		setHalls(data);

		for (const hall of data) {
			loadHallCount(hall.id);
		}
	};

	const loadHallCount = async (hallId) => {
		const count = await getHallTableCount(hallId);
		setHallCounts((prev) => ({ ...prev, [hallId]: count }));
	};

	const handleAddHall = (newHall) => {
		setHalls([newHall, ...halls]);
		loadHallCount(newHall.id);
	};

	const handleUpdateHall = (updatedHall) => {
		setHalls(halls.map((h) => (h.id === updatedHall.id ? updatedHall : h)));
	};

	const handleEditHall = (hall) => {
		setSelectedHall(hall);
		setShowModal(true);
	};

	const handleDeleteHall = async (hallId) => {
		if (window.confirm('Zalı silmək istədiyinizdən əminsiniz? Bütün masalar silinəcək!')) {
			const result = await deleteHall(hallId);
			if (result.success) {
				setHalls(halls.filter((h) => h.id !== hallId));
				toast.success('Zal silindi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		}
	};

	const handleShowTables = (hall) => {
		setSelectedHall(hall);
		setShowTablesModal(true);
	};

	const handleCloseModals = () => {
		setShowModal(false);
		setShowTablesModal(false);
		setSelectedHall(null);
	};

	const activeHalls = halls.filter((h) => h.is_active).length;

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<Sidebar />

			<div className='flex-1 ml-64'>
				<Header
					title='Zal İdarəetməsi'
					stats={[
						{ label: 'Ümumi Zallar', value: halls.length },
						{ label: 'Aktiv Zallar', value: activeHalls },
					]}
				/>

				<div className='p-6'>
					<div className='mb-6 flex items-center justify-between'>
						<div>
							<h2 className='text-2xl font-bold text-gray-900 mb-2'>Zallar</h2>
							<p className='text-gray-600'>Restoranınızın zallarını idarə edin</p>
						</div>
						<button
							onClick={() => setShowModal(true)}
							className='flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
						>
							<Plus className='w-5 h-5 mr-2' />
							Yeni Zal
						</button>
					</div>

					{halls.length === 0 ? (
						<div className='bg-white rounded-lg shadow-md p-12 text-center'>
							<LayoutGrid className='w-16 h-16 text-gray-400 mx-auto mb-4' />
							<h3 className='text-xl font-bold text-gray-900 mb-2'>Hələ zal yoxdur</h3>
							<p className='text-gray-600 mb-6'>İlk zalı əlavə edərək başlayın</p>
							<button
								onClick={() => setShowModal(true)}
								className='px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
							>
								İlk Zalı Əlavə Et
							</button>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{halls.map((hall) => (
								<div key={hall.id} className='bg-white rounded-lg shadow-md hover:shadow-lg transition p-6'>
									<div className='flex items-start justify-between mb-4'>
										<div className='flex-1'>
											<h3 className='text-lg font-bold text-gray-900 mb-2'>{hall.name}</h3>
											<span
												className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
													hall.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
												}`}
											>
												{hall.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
											</span>
										</div>
									</div>

									<div className='space-y-2 mb-4'>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-gray-600'>Xidmət haqqı:</span>
											<span className='font-medium text-gray-900'>{hall.service_charge}%</span>
										</div>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-gray-600'>Masa sayı:</span>
											<span className='font-medium text-gray-900'>{hallCounts[hall.id] || 0}</span>
										</div>
									</div>

									<div className='flex items-center space-x-2 pt-4 border-t border-gray-200'>
										<button
											onClick={() => handleShowTables(hall)}
											className='flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm font-medium'
										>
											Masalar
										</button>
										<button
											onClick={() => handleEditHall(hall)}
											className='px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition'
										>
											<Edit className='w-4 h-4' />
										</button>
										<button
											onClick={() => handleDeleteHall(hall.id)}
											className='px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition'
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

			<HallModal
				isOpen={showModal}
				onClose={handleCloseModals}
				onSuccess={selectedHall ? handleUpdateHall : handleAddHall}
				restaurantId={restaurant?.id}
				hall={selectedHall}
			/>

			<TableModal
				isOpen={showTablesModal}
				onClose={handleCloseModals}
				hall={selectedHall}
				restaurantId={restaurant?.id}
				onTableChange={() => loadHallCount(selectedHall?.id)}
			/>
		</div>
	);
}
