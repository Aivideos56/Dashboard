import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatCard from '../components/cards/StatCard';
import { storageUtils } from '../utils/storage';
import { formatCurrency, getTopProducts, getRevenueByPeriod } from '../utils/helpers';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RestaurantDashboard() {
	const { restaurant } = useSelector((state) => state.auth);

	const [stats, setStats] = useState({
		today: { totalRevenue: 0, orderCount: 0 },
		month: { totalRevenue: 0, orderCount: 0 },
		year: { totalRevenue: 0, orderCount: 0 },
	});
	const [tables, setTables] = useState([]);
	const [orders, setOrders] = useState([]);
	const [topProducts, setTopProducts] = useState([]);
	const [revenueData, setRevenueData] = useState([]);
  console.log(revenueData);
	useEffect(() => {
		if (restaurant) {
			loadData();
		}
	}, [restaurant]);

	const loadData = async () => {
		try {
			// Statistika üçün funksiyanı çağır, indi {today, month, year} formatında qaytarır
			const [todayStats, monthStats, yearStats, tablesData, ordersData] = await Promise.all([
				storageUtils.getRestaurantStats(restaurant.id, 'today'),
				storageUtils.getRestaurantStats(restaurant.id, 'month'),
				storageUtils.getRestaurantStats(restaurant.id, 'year'),
				storageUtils.getTables(restaurant.id),
				storageUtils.getOrders(restaurant.id),
			]);
			setStats({
				today: todayStats || { totalRevenue: 0, orderCount: 0 },
				month: monthStats || { totalRevenue: 0, orderCount: 0 },
				year: yearStats || { totalRevenue: 0, orderCount: 0 },
			});

			setTables(tablesData || []);
			setOrders(ordersData || []);

			const top = getTopProducts(ordersData || [], 5);
			setTopProducts(top);

			const revenue = getRevenueByPeriod((ordersData || []).slice(0, 30), 'day');
			setRevenueData(revenue);
		} catch (err) {
			console.error('Dashboard loadData error:', err);
		}
	};

	const activeTables = tables.filter((t) => t.status === 'occupied').length;

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<Sidebar />

			<div className='flex-1 ml-64'>
				<Header
					title='Dashboard'
					stats={[
						{ label: 'Aktiv Masalar', value: activeTables },
						{ label: 'Bugünkü Gəlir', value: formatCurrency(stats.today.totalRevenue, restaurant.currency) },
					]}
				/>

				<div className='p-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
						<StatCard title='Bugünkü Gəlir' value={formatCurrency(stats.today.totalRevenue, restaurant.currency)} icon={DollarSign} color='green' />
						<StatCard title='Aylıq Gəlir' value={formatCurrency(stats.month.totalRevenue, restaurant.currency)} icon={TrendingUp} color='blue' />
						<StatCard title='İllik Gəlir' value={formatCurrency(stats.year.totalRevenue, restaurant.currency)} icon={TrendingUp} color='yellow' />
						<StatCard title='Ümumi Sifarişlər' value={orders.length} icon={ShoppingCart} color='red' />
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						<div className='bg-white rounded-lg shadow-md p-6'>
							<h3 className='text-lg font-bold text-gray-900 mb-4'>Gəlir Trendi (Son 30 gün)</h3>
							{revenueData.length > 0 ? (
								<ResponsiveContainer width='100%' height={300}>
									<LineChart data={revenueData}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis dataKey='date' />
										<YAxis />
										<Tooltip />
										<Line type='monotone' dataKey='revenue' stroke='#3B82F6' strokeWidth={2} />
									</LineChart>
								</ResponsiveContainer>
							) : (
								<p className='text-gray-500 text-center py-12'>Məlumat yoxdur</p>
							)}
						</div>

						<div className='bg-white rounded-lg shadow-md p-6'>
							<h3 className='text-lg font-bold text-gray-900 mb-4'>Ən Çox Satılan Məhsullar</h3>
							{topProducts.length > 0 ? (
								<ResponsiveContainer width='100%' height={300}>
									<BarChart data={topProducts}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis dataKey='name' />
										<YAxis />
										<Tooltip />
										<Bar dataKey='quantity' fill='#10B981' />
									</BarChart>
								</ResponsiveContainer>
							) : (
								<p className='text-gray-500 text-center py-12'>Məlumat yoxdur</p>
							)}
						</div>
					</div>

					<div className='mt-6 bg-white rounded-lg shadow-md p-6'>
						<h3 className='text-lg font-bold text-gray-900 mb-4'>Son Sifarişlər</h3>
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
									{(orders || []).slice(0, 5).map((order) => (
										<tr key={order.id}>
											<td className='px-4 py-3 text-sm text-gray-900'>{new Date(order.completed_at).toLocaleDateString('az-AZ')}</td>
											<td className='px-4 py-3 text-sm text-gray-900'>Masa {order.table_number}</td>
											<td className='px-4 py-3 text-sm font-medium text-gray-900'>{formatCurrency(order.total, restaurant.currency)}</td>
											<td className='px-4 py-3 text-sm text-gray-900'>{order.payment_method}</td>
										</tr>
									))}
								</tbody>
							</table>
							{(orders || []).length === 0 && <p className='text-gray-500 text-center py-8'>Hələ sifariş yoxdur</p>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
