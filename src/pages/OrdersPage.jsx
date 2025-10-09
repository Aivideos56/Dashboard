import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, Eye } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import OrderDetailModal from '../components/modals/OrderDetailModal';
import { setOrders } from '../store/slices/orderSlice';
import { storageUtils } from '../utils/storage';
import { formatCurrency, formatDateTime, getPaymentMethodText } from '../utils/helpers';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { restaurant } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.order);
  const { tables } = useSelector((state) => state.table);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (restaurant) {
      loadOrders();
    }
  }, [restaurant]);

  const loadOrders = async () => {
    const data = await storageUtils.getOrders(restaurant.id);
    dispatch(setOrders(data));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = !filterTable || order.table_number === parseInt(filterTable);
    const matchesPayment = !filterPayment || order.payment_method === filterPayment;

    let matchesDate = true;
    if (startDate && endDate) {
      const orderDate = new Date(order.completed_at);
      matchesDate = orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    }

    return matchesSearch && matchesTable && matchesPayment && matchesDate;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header
          title="Sifarişlər"
          stats={[
            { label: 'Ümumi Sifarişlər', value: filteredOrders.length },
            { label: 'Ümumi Məbləğ', value: formatCurrency(totalRevenue, restaurant.currency) },
          ]}
        />

        <div className="p-6">
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Sifariş ID axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Başlanğıc"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Son"
              />

              <select
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bütün masalar</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.number}>
                    Masa {table.number}
                  </option>
                ))}
              </select>

              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bütün ödənişlər</option>
                <option value="cash">Nağd</option>
                <option value="card">Kart</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Tarix/Saat</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Masa</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Məhsul Sayı</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Məbləğ</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Ödəniş</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDateTime(order.completed_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">Masa {order.table_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.items ? order.items.length : 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(order.total, restaurant.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getPaymentMethodText(order.payment_method)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span>Detallı</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm || filterTable || filterPayment || startDate || endDate
                      ? 'Filtrə uyğun sifariş tapılmadı'
                      : 'Hələ sifariş yoxdur'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        currency={restaurant?.currency}
      />
    </div>
  );
}
