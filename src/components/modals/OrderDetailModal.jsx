import { X, Printer } from 'lucide-react';
import { formatCurrency, formatDateTime, getPaymentMethodText } from '../../utils/helpers';

export default function OrderDetailModal({ isOpen, onClose, order, currency = 'AZN' }) {
	if (!isOpen || !order) return null;

	const handlePrint = () => {
		window.print();
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
				<div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
					<h2 className='text-xl font-bold text-gray-900'>Sifariş Detalları</h2>
					<div className='flex items-center space-x-2'>
						<button onClick={handlePrint} className='p-2 hover:bg-gray-100 rounded-lg transition'>
							<Printer className='w-5 h-5 text-gray-600' />
						</button>
						<button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition'>
							<X className='w-5 h-5 text-gray-500' />
						</button>
					</div>
				</div>

				<div className='p-6 space-y-6'>
					<div className='grid grid-cols-2 gap-4 pb-4 border-b border-gray-200'>
						<div>
							<p className='text-sm text-gray-600 mb-1'>Sifariş ID</p>
							<p className='font-medium text-gray-900'>{order.id.slice(0, 8)}</p>
						</div>
						<div>
							<p className='text-sm text-gray-600 mb-1'>Tarix</p>
							<p className='font-medium text-gray-900'>{formatDateTime(order.completed_at)}</p>
						</div>
						<div>
							<p className='text-sm text-gray-600 mb-1'>Masa</p>
							<p className='font-medium text-gray-900'>Masa {order.table_number}</p>
						</div>
						<div>
							<p className='text-sm text-gray-600 mb-1'>Ödəniş</p>
							<p className='font-medium text-gray-900'>{getPaymentMethodText(order.payment_method)}</p>
						</div>
					</div>

					<div>
						<h3 className='font-bold text-gray-900 mb-3'>Məhsullar</h3>
						<table className='min-w-full'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Məhsul</th>
									<th className='px-4 py-2 text-center text-sm font-medium text-gray-600'>Miqdar</th>
									<th className='px-4 py-2 text-right text-sm font-medium text-gray-600'>Qiymət</th>
									<th className='px-4 py-2 text-right text-sm font-medium text-gray-600'>Cəm</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{order.items &&
									order.items.map((item, index) => (
										<tr key={index}>
											<td className='px-4 py-3 text-sm text-gray-900'>{item.productName}</td>
											<td className='px-4 py-3 text-sm text-center text-gray-900'>{item.quantity}</td>
											<td className='px-4 py-3 text-sm text-right text-gray-900'>{formatCurrency(item.price, currency)}</td>
											<td className='px-4 py-3 text-sm text-right font-medium text-gray-900'>
												{formatCurrency(parseFloat(item.price) * parseInt(item.quantity), currency)}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>

					<div className='space-y-2 pt-4 border-t border-gray-200'>
						<div className='flex items-center justify-between'>
							<p className='text-gray-600'>Ara cəm:</p>
							<p className='font-medium text-gray-900'>{formatCurrency(order.subtotal, currency)}</p>
						</div>
						{parseFloat(order.discount) > 0 && (
							<div className='flex items-center justify-between'>
								<p className='text-gray-600'>Endirim:</p>
								<p className='font-medium text-red-600'>-{formatCurrency(order.discount, currency)}</p>
							</div>
						)}
						<div className='flex items-center justify-between'>
							<p className='text-gray-600'>Vergi:</p>
							<p className='font-medium text-gray-900'>{formatCurrency(order.tax, currency)}</p>
						</div>
						<div className='flex items-center justify-between pt-2 border-t border-gray-200'>
							<p className='text-lg font-bold text-gray-900'>Ümumi:</p>
							<p className='text-lg font-bold text-blue-600'>{formatCurrency(order.total, currency)}</p>
						</div>
					</div>

					{order.completed_by && (
						<div className='pt-4 border-t border-gray-200'>
							<p className='text-sm text-gray-600'>
								Yekunlaşdıran: <span className='font-medium text-gray-900'>{order.completed_by}</span>
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
