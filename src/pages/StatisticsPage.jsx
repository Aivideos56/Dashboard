import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Download, Calendar } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatCard from '../components/cards/StatCard';
import { storageUtils } from '../utils/storage';
import { formatCurrency, getTopProducts, getRevenueByPeriod, exportToCSV, getDateRange } from '../utils/helpers';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';

export default function StatisticsPage() {
	const { restaurant } = useSelector((state) => state.auth);
	const [period, setPeriod] = useState('today');
	const [stats, setStats] = useState({ totalRevenue: 0, orderCount: 0 });
	const [orders, setOrders] = useState([]);
	const [topProducts, setTopProducts] = useState([]);
	const [revenueData, setRevenueData] = useState([]);
	const [tableStats, setTableStats] = useState([]);

	useEffect(() => {
		if (restaurant) {
			loadData();
		}
	}, [restaurant, period]);

	const loadData = async () => {
		const dateRange = getDateRange(period);
		const [statsData, ordersData, tables] = await Promise.all([
			storageUtils.getRestaurantStats(restaurant.id, period),
			storageUtils.getOrders(restaurant.id, { startDate: dateRange.start, endDate: dateRange.end }),
			storageUtils.getTables(restaurant.id),
		]);

		setStats(statsData);
		setOrders(ordersData);

		const top = getTopProducts(ordersData, 10);
		setTopProducts(top);

		const revenue = getRevenueByPeriod(ordersData, period === 'today' ? 'day' : period === 'month' ? 'day' : 'month');
		setRevenueData(revenue);

		const tableStatsData = tables.map((table) => {
			const tableOrders = ordersData.filter((o) => o.table_number === table.number);
			const tableRevenue = tableOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
			const avgCheck = tableOrders.length > 0 ? tableRevenue / tableOrders.length : 0;

			return {
				tableNumber: table.number,
				orderCount: tableOrders.length,
				totalRevenue: tableRevenue,
				avgCheck,
			};
		});

		setTableStats(tableStatsData.filter((t) => t.orderCount > 0).sort((a, b) => b.totalRevenue - a.totalRevenue));
	};

	const handleExport = () => {
		const exportData = orders.map((order) => ({
			ID: order.id.slice(0, 8),
			Tarix: new Date(order.completed_at).toLocaleDateString('az-AZ'),
			Masa: order.table_number,
			Məbləğ: order.total,
			Ödəniş: order.payment_method,
		}));

		exportToCSV(exportData, `sifarisler-${period}-${Date.now()}`);
	};

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<Sidebar />

			<div className='flex-1 ml-64'>
				<Header
					title='Statistika'
					stats={[
						{ label: 'Ümumi Gəlir', value: formatCurrency(stats.totalRevenue, restaurant.currency) },
						{ label: 'Sifariş Sayı', value: stats.orderCount },
					]}
				/>

				<div className='p-6'>
					<div className='mb-6 flex items-center justify-between'>
						<div className='flex items-center space-x-4'>
							<Calendar className='w-5 h-5 text-gray-600' />
							<select
								value={period}
								onChange={(e) => setPeriod(e.target.value)}
								className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
							>
								<option value='today'>Bugün</option>
								<option value='month'>Bu Ay</option>
								<option value='year'>Bu İl</option>
							</select>
						</div>

						<button
							onClick={handleExport}
							className='flex items-center px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition'
						>
							<Download className='w-5 h-5 mr-2' />
							Excel Export
						</button>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
						<StatCard title='Ümumi Gəlir' value={formatCurrency(stats.totalRevenue, restaurant.currency)} icon={DollarSign} color='green' />
						<StatCard title='Sifariş Sayı' value={stats.orderCount} icon={ShoppingCart} color='blue' />
						<StatCard
							title='Ortalama Çek'
							value={formatCurrency(stats.orderCount > 0 ? stats.totalRevenue / stats.orderCount : 0, restaurant.currency)}
							icon={TrendingUp}
							color='yellow'
						/>
						<StatCard title='Məhsul Satışı' value={orders.reduce((sum, o) => sum + (o.items?.length || 0), 0)} icon={Package} color='red' />
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
						<div className='bg-white rounded-lg shadow-md p-6'>
							<h3 className='text-lg font-bold text-gray-900 mb-4'>Gəlir Trendi</h3>
							{revenueData.length > 0 ? (
								<ResponsiveContainer width='100%' height={300}>
									<LineChart data={revenueData}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis dataKey='date' />
										<YAxis />
										<Tooltip />
										<Legend />
										<Line type='monotone' dataKey='revenue' stroke='#3B82F6' strokeWidth={2} name='Gəlir' />
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
										<Legend />
										<Bar dataKey='quantity' fill='#10B981' name='Miqdar' />
									</BarChart>
								</ResponsiveContainer>
							) : (
								<p className='text-gray-500 text-center py-12'>Məlumat yoxdur</p>
							)}
						</div>
					</div>

					<div className='bg-white rounded-lg shadow-md p-6'>
						<h3 className='text-lg font-bold text-gray-900 mb-4'>Masa Əsaslı Statistika</h3>
						<div className='overflow-x-auto'>
							<table className='min-w-full'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Masa №</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Sifariş Sayı</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Ümumi Gəlir</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Ortalama Çek</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{tableStats.map((stat) => (
										<tr key={stat.tableNumber} className='hover:bg-gray-50'>
											<td className='px-6 py-4 text-sm font-medium text-gray-900'>Masa {stat.tableNumber}</td>
											<td className='px-6 py-4 text-sm text-gray-900'>{stat.orderCount}</td>
											<td className='px-6 py-4 text-sm font-medium text-gray-900'>{formatCurrency(stat.totalRevenue, restaurant.currency)}</td>
											<td className='px-6 py-4 text-sm text-gray-900'>{formatCurrency(stat.avgCheck, restaurant.currency)}</td>
										</tr>
									))}
								</tbody>
							</table>
							{tableStats.length === 0 && (
								<div className='text-center py-8'>
									<p className='text-gray-500'>Seçilmiş dövrdə sifariş yoxdur</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
