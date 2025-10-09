import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Building2, DollarSign } from 'lucide-react';
import Header from '../components/layout/Header';
import RestaurantCard from '../components/cards/RestaurantCard';
import AddRestaurantModal from '../components/modals/AddRestaurantModal';
import RestaurantDetailModal from '../components/modals/RestaurantDetailModal';
import { setRestaurants, addRestaurant as addRestaurantAction } from '../store/slices/restaurantSlice';
import { storageUtils } from '../utils/storage';
import { formatCurrency } from '../utils/helpers';

export default function AdminDashboard() {
	const dispatch = useDispatch();
	const { restaurants } = useSelector((state) => state.restaurant);
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedRestaurant, setSelectedRestaurant] = useState(null);
	const [restaurantStats, setRestaurantStats] = useState({});

	useEffect(() => {
		loadRestaurants();
	}, []);

	const loadRestaurants = async () => {
		const data = await storageUtils.getAllRestaurants();
		dispatch(setRestaurants(data));

		const stats = {};
		for (const restaurant of data) {
			const todayStats = await storageUtils.getRestaurantStats(restaurant.id, 'today');
			const tables = await storageUtils.getTables(restaurant.id);
			const activeTables = tables.filter((t) => t.status === 'occupied').length;

			stats[restaurant.id] = {
				todayRevenue: todayStats.totalRevenue,
				activeTables,
			};
		}
		setRestaurantStats(stats);
	};

	const handleAddRestaurant = (newRestaurant) => {
		dispatch(addRestaurantAction(newRestaurant));
		loadRestaurants();
	};

	const activeCount = restaurants.filter((r) => r.is_active).length;
	const totalRevenue = Object.values(restaurantStats).reduce((sum, stat) => sum + (stat.todayRevenue || 0), 0);

	return (
		<div className='min-h-screen bg-gray-50'>
			<Header
				title='Admin Panel'
				stats={[
					{ label: 'Aktiv Restoranlar', value: activeCount },
					{ label: 'Bugünkü Gəlir', value: formatCurrency(totalRevenue) },
				]}
			/>

			<div className='p-6'>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h2 className='text-2xl font-bold text-gray-900 mb-2'>Restoranlar</h2>
						<p className='text-gray-600'>Bütün restoranları idarə edin</p>
					</div>
					<button
						onClick={() => setShowAddModal(true)}
						className='flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
					>
						<Plus className='w-5 h-5 mr-2' />
						Yeni Restoran
					</button>
				</div>

				{restaurants.length === 0 ? (
					<div className='bg-white rounded-lg shadow-md p-12 text-center'>
						<Building2 className='w-16 h-16 text-gray-400 mx-auto mb-4' />
						<h3 className='text-xl font-bold text-gray-900 mb-2'>Hələ restoran yoxdur</h3>
						<p className='text-gray-600 mb-6'>İlk restoranınızı əlavə edin</p>
						<button
							onClick={() => setShowAddModal(true)}
							className='px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
						>
							Restoran Əlavə Et
						</button>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{restaurants.map((restaurant) => (
							<RestaurantCard
								key={restaurant.id}
								restaurant={restaurant}
								onViewDetails={setSelectedRestaurant}
								todayRevenue={restaurantStats[restaurant.id]?.todayRevenue || 0}
								activeTables={restaurantStats[restaurant.id]?.activeTables || 0}
							/>
						))}
					</div>
				)}
			</div>

			<AddRestaurantModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleAddRestaurant} />

			<RestaurantDetailModal isOpen={!!selectedRestaurant} onClose={() => setSelectedRestaurant(null)} restaurant={selectedRestaurant} />
		</div>
	);
}
