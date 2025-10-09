import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { az } from 'date-fns/locale';

export const formatCurrency = (amount, currency = 'AZN') => {
	const symbols = {
		AZN: '₼',
		USD: '$',
		EUR: '€',
		TRY: '₺',
	};

	return `${parseFloat(amount).toFixed(2)} ${symbols[currency] || currency}`;
};

export const formatDate = (date, formatStr = 'dd.MM.yyyy') => {
	if (!date) return '';
	return format(new Date(date), formatStr, { locale: az });
};

export const formatDateTime = (date) => {
	if (!date) return '';
	return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: az });
};

export const formatTime = (time) => {
	if (!time) return '';
	return time.substring(0, 5);
};

export const getDateRange = (period) => {
	const now = new Date();

	switch (period) {
		case 'today':
			return {
				start: startOfDay(now).toISOString(),
				end: endOfDay(now).toISOString(),
			};
		case 'month':
			return {
				start: startOfMonth(now).toISOString(),
				end: endOfMonth(now).toISOString(),
			};
		case 'year':
			return {
				start: startOfYear(now).toISOString(),
				end: endOfYear(now).toISOString(),
			};
		default:
			return {
				start: startOfDay(now).toISOString(),
				end: endOfDay(now).toISOString(),
			};
	}
};

export const calculateOrderTotal = (items, taxRate = 0, discount = 0) => {
	const subtotal = items.reduce((sum, item) => {
		return sum + parseFloat(item.price) * parseInt(item.quantity);
	}, 0);

	const discountAmount = parseFloat(discount) || 0;
	const afterDiscount = subtotal - discountAmount;
	const tax = (afterDiscount * parseFloat(taxRate)) / 100;
	const total = afterDiscount + tax;

	return {
		subtotal: subtotal.toFixed(2),
		discount: discountAmount.toFixed(2),
		tax: tax.toFixed(2),
		total: total.toFixed(2),
	};
};

export const getTableStatusColor = (status) => {
	const colors = {
		available: 'bg-green-100 text-green-800',
		occupied: 'bg-red-100 text-red-800',
		reserved: 'bg-yellow-100 text-yellow-800',
	};
	return colors[status] || colors.available;
};

export const getTableStatusText = (status) => {
	const texts = {
		available: 'Boş',
		occupied: 'Dolu',
		reserved: 'Rezerv',
	};
	return texts[status] || status;
};

export const getPaymentMethodText = (method) => {
	const texts = {
		cash: 'Nağd',
		card: 'Kart',
		online: 'Online',
	};
	return texts[method] || method;
};

export const exportToCSV = (data, filename) => {
	if (!data || data.length === 0) return;

	const headers = Object.keys(data[0]);
	const csv = [
		headers.join(','),
		...data.map((row) =>
			headers
				.map((header) => {
					const value = row[header];
					return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
				})
				.join(',')
		),
	].join('\n');

	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', `${filename}.csv`);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export const uploadImage = async (file) => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			resolve(reader.result);
		};
		reader.readAsDataURL(file);
	});
};

export const generateBarcode = () => {
	return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
};

export const getActiveTablesCount = (tables) => {
	return tables.filter((t) => t.status === 'occupied').length;
};

export const getTopProducts = (orders, limit = 10) => {
	const productCounts = {};

	orders.forEach((order) => {
		if (order.items && Array.isArray(order.items)) {
			order.items.forEach((item) => {
				const key = item.productName;
				if (!productCounts[key]) {
					productCounts[key] = {
						name: item.productName,
						quantity: 0,
						revenue: 0,
					};
				}
				productCounts[key].quantity += parseInt(item.quantity) || 0;
				productCounts[key].revenue += parseFloat(item.price) * parseInt(item.quantity) || 0;
			});
		}
	});

	return Object.values(productCounts)
		.sort((a, b) => b.quantity - a.quantity)
		.slice(0, limit);
};

export const getRevenueByPeriod = (orders, period = 'day') => {
	const grouped = {};

	orders.forEach((order) => {
		const date = new Date(order.completed_at);
		let key;

		if (period === 'day') {
			key = format(date, 'yyyy-MM-dd');
		} else if (period === 'month') {
			key = format(date, 'yyyy-MM');
		} else if (period === 'year') {
			key = format(date, 'yyyy');
		}

		if (!grouped[key]) {
			grouped[key] = 0;
		}
		grouped[key] += parseFloat(order.total);
	});

	return Object.entries(grouped).map(([date, revenue]) => ({
		date,
		revenue: parseFloat(revenue.toFixed(2)),
	}));
};
