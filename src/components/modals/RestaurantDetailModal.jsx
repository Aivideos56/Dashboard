import { useState, useEffect } from 'react';
import { X, Users, Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { storageUtils } from '../../utils/storage';
import { formatCurrency, formatDateTime, getTableStatusText, getTableStatusColor } from '../../utils/helpers';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RestaurantDetailModal({ isOpen, onClose, restaurant }) {
	const [activeTab, setActiveTab] = useState('general');
	const [tables, setTables] = useState([]);
	const [categories, setCategories] = useState([]);
	const [products, setProducts] = useState([]);
	const [orders, setOrders] = useState([]);
	const [stats, setStats] = useState({ today: 0, month: 0, year: 0 });

	useEffect(() => {
		if (isOpen && restaurant) {
			loadData();
		}
	}, [isOpen, restaurant]);

	const loadData = async () => {
		const [tablesData, categoriesData, productsData, ordersData] = await Promise.all([
			storageUtils.getTables(restaurant.id),
			storageUtils.getCategories(restaurant.id),
			storageUtils.getProducts(restaurant.id),
			storageUtils.getOrders(restaurant.id),
		]);

		setTables(tablesData);
		setCategories(categoriesData);
		setProducts(productsData);
		setOrders(ordersData);

		const todayStats = await storageUtils.getRestaurantStats(restaurant.id, 'today');
		const monthStats = await storageUtils.getRestaurantStats(restaurant.id, 'month');
		const yearStats = await storageUtils.getRestaurantStats(restaurant.id, 'year');

		setStats({
			today: todayStats.totalRevenue,
			month: monthStats.totalRevenue,
			year: yearStats.totalRevenue,
		});
	};

	if (!isOpen || !restaurant) return null;

	const tabs = [
		{ id: 'general', name: 'Ümumi', icon: Package },
		{ id: 'tables', name: 'Masalar', icon: Users },
		{ id: 'menu', name: 'Menyu', icon: Package },
		{ id: 'stats', name: 'Statistika', icon: TrendingUp },
		{ id: 'orders', name: 'Sifarişlər', icon: ShoppingCart },
	];

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
				<div className='bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between'>
					<h2 className='text-2xl font-bold text-white'>{restaurant.name}</h2>
					<button onClick={onClose} className='p-2 hover:bg-blue-800 rounded-lg transition'>
						<X className='w-5 h-5 text-white' />
					</button>
				</div>

				<div className='flex border-b border-gray-200 px-6'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-4 py-3 border-b-2 transition ${
								activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
							}`}
						>
							<tab.icon className='w-4 h-4 mr-2' />
							<span className='font-medium'>{tab.name}</span>
						</button>
					))}
				</div>

				<div className='flex-1 overflow-y-auto p-6'>
					{activeTab === 'general' && (
						<div className='space-y-6'>
							<div className='grid grid-cols-2 gap-6'>
								<div>
									<label className='text-sm font-medium text-gray-600'>Ünvan</label>
									<p className='text-gray-900 mt-1'>{restaurant.address || '-'}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Telefon</label>
									<p className='text-gray-900 mt-1'>{restaurant.phone || '-'}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Email</label>
									<p className='text-gray-900 mt-1'>{restaurant.email || '-'}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>İş Saatları</label>
									<p className='text-gray-900 mt-1'>
										{restaurant.working_hours_open?.substring(0, 5)} - {restaurant.working_hours_close?.substring(0, 5)}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Valyuta</label>
									<p className='text-gray-900 mt-1'>{restaurant.currency}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Vergi</label>
									<p className='text-gray-900 mt-1'>{restaurant.tax_rate}%</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-600'>Status</label>
									<p className='text-gray-900 mt-1'>{restaurant.is_active ? 'Aktiv' : 'Qeyri-aktiv'}</p>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'tables' && (
						<div className='overflow-x-auto'>
							<table className='min-w-full'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-4 py-3 text-left text-sm font-medium text-gray-600'>№</th>
										<th className='px-4 py-3 text-left text-sm font-medium text-gray-600'>Tutum</th>
										<th className='px-4 py-3 text-left text-sm font-medium text-gray-600'>Zona</th>
										<th className='px-4 py-3 text-left text-sm font-medium text-gray-600'>Status</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{tables.map((table) => (
										<tr key={table.id}>
											<td className='px-4 py-3 text-sm text-gray-900'>{table.number}</td>
											<td className='px-4 py-3 text-sm text-gray-900'>{table.capacity} nəfərlik</td>
											<td className='px-4 py-3 text-sm text-gray-900'>{table.zone}</td>
											<td className='px-4 py-3 text-sm'>
												<span className={`inline-block px-2 py-1 rounded-full text-xs ${getTableStatusColor(table.status)}`}>
													{getTableStatusText(table.status)}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{activeTab === 'menu' && (
						<div className='space-y-4'>
							{categories.map((category) => (
								<div key={category.id} className='border border-gray-200 rounded-lg p-4'>
									<h3 className='font-bold text-gray-900 mb-2'>{category.name}</h3>
									<p className='text-sm text-gray-600'>{products.filter((p) => p.category_id === category.id).length} məhsul</p>
								</div>
							))}
						</div>
					)}

					{activeTab === 'stats' && (
						<div className='space-y-6'>
							<div className='grid grid-cols-3 gap-4'>
								<div className='bg-blue-50 rounded-lg p-4'>
									<p className='text-sm text-blue-600 mb-1'>Bugünkü Gəlir</p>
									<p className='text-2xl font-bold text-blue-900'>{formatCurrency(stats.today, restaurant.currency)}</p>
								</div>
								<div className='bg-green-50 rounded-lg p-4'>
									<p className='text-sm text-green-600 mb-1'>Aylıq Gəlir</p>
									<p className='text-2xl font-bold text-green-900'>{formatCurrency(stats.month, restaurant.currency)}</p>
								</div>
								<div className='bg-yellow-50 rounded-lg p-4'>
									<p className='text-sm text-yellow-600 mb-1'>İllik Gəlir</p>
									<p className='text-2xl font-bold text-yellow-900'>{formatCurrency(stats.year, restaurant.currency)}</p>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'orders' && (
						<div className='overflow-x-auto'>
							<table className='min-w-full'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-4 py-3 text-left text-sm font-medium text-gray-600'>Tarix</th>
										<th className='px-4 py-3 text-left text-sm font-medium text-gray-600'>Masa</th>
										<th className='px-4 py-3 text-left text-sm font-medium text-gray-600'>Məbləğ</th>
										<th className='px-4 py-3 text-left text-sm font-medium text-gray-600'>Ödəniş</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{orders.slice(0, 10).map((order) => (
										<tr key={order.id}>
											<td className='px-4 py-3 text-sm text-gray-900'>{formatDateTime(order.completed_at)}</td>
											<td className='px-4 py-3 text-sm text-gray-900'>Masa {order.table_number}</td>
											<td className='px-4 py-3 text-sm text-gray-900'>{formatCurrency(order.total, restaurant.currency)}</td>
											<td className='px-4 py-3 text-sm text-gray-900'>{order.payment_method}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
