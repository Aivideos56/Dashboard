import { Building2, MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';
import { formatCurrency, formatTime } from '../../utils/helpers';

export default function RestaurantCard({ restaurant, onViewDetails, todayRevenue = 0, activeTables = 0 }) {
	return (
		<div className='bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden'>
			<div className='p-6'>
				<div className='flex items-start justify-between mb-4'>
					<div className='flex items-center space-x-3'>
						{restaurant.logo ? (
							<img src={restaurant.logo} alt={restaurant.name} className='w-12 h-12 rounded-lg object-cover' />
						) : (
							<div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
								<Building2 className='w-6 h-6 text-blue-600' />
							</div>
						)}
						<div>
							<h3 className='text-lg font-bold text-gray-900'>{restaurant.name}</h3>
							<span
								className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
									restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
								}`}
							>
								{restaurant.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
							</span>
						</div>
					</div>
				</div>

				<div className='space-y-2 mb-4'>
					{restaurant.address && (
						<div className='flex items-center text-sm text-gray-600'>
							<MapPin className='w-4 h-4 mr-2 flex-shrink-0' />
							<span className='truncate'>{restaurant.address}</span>
						</div>
					)}
					{restaurant.phone && (
						<div className='flex items-center text-sm text-gray-600'>
							<Phone className='w-4 h-4 mr-2 flex-shrink-0' />
							<span>{restaurant.phone}</span>
						</div>
					)}
					{restaurant.email && (
						<div className='flex items-center text-sm text-gray-600'>
							<Mail className='w-4 h-4 mr-2 flex-shrink-0' />
							<span className='truncate'>{restaurant.email}</span>
						</div>
					)}
					<div className='flex items-center text-sm text-gray-600'>
						<Clock className='w-4 h-4 mr-2 flex-shrink-0' />
						<span>
							{formatTime(restaurant.working_hours_open)} - {formatTime(restaurant.working_hours_close)}
						</span>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4 pt-4 border-t border-gray-200'>
					<div>
						<p className='text-xs text-gray-600 mb-1'>Bugünkü gəlir</p>
						<p className='text-lg font-semibold text-green-600'>{formatCurrency(todayRevenue, restaurant.currency)}</p>
					</div>
					<div>
						<p className='text-xs text-gray-600 mb-1'>Aktiv masalar</p>
						<p className='text-lg font-semibold text-blue-600'>{activeTables}</p>
					</div>
				</div>

				<button
					onClick={() => onViewDetails(restaurant)}
					className='mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center'
				>
					<span>Ətraflı Bax</span>
					<ChevronRight className='w-4 h-4 ml-1' />
				</button>
			</div>
		</div>
	);
}
