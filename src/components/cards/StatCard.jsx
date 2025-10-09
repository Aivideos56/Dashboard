export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }) {
	const colorClasses = {
		blue: 'bg-blue-100 text-blue-600',
		green: 'bg-green-100 text-green-600',
		yellow: 'bg-yellow-100 text-yellow-600',
		red: 'bg-red-100 text-red-600',
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition'>
			<div className='flex items-center justify-between'>
				<div className='flex-1'>
					<p className='text-sm font-medium text-gray-600 mb-1'>{title}</p>
					<p className='text-3xl font-bold text-gray-900'>{value}</p>
					{trend && <p className={`text-sm mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>{trend.value}</p>}
				</div>
				<div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
					<Icon className='w-6 h-6' />
				</div>
			</div>
		</div>
	);
}
