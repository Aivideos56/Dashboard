import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import SemiFinishedModal from '../components/modals/SemiFinishedModal';
import toast from 'react-hot-toast';

export default function SemiFinishedPage() {
  const { restaurant } = useSelector((state) => state.auth);
  const [semiFinished, setSemiFinished] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('');

  useEffect(() => {
    if (restaurant) {
      loadSemiFinished();
    }
  }, [restaurant]);

  const loadSemiFinished = async () => {
    const mockData = [
      {
        id: 1,
        name: 'Hazır xəmir',
        unit: 'kg',
        quantity: 15,
        min_quantity: 5,
        ingredients: [
          { ingredient_id: 1, ingredient_name: 'Un', quantity: 10, unit: 'kg' },
          { ingredient_id: 2, ingredient_name: 'Su', quantity: 5, unit: 'l' },
        ],
        is_active: true
      },
      {
        id: 2,
        name: 'Sous əsası',
        unit: 'l',
        quantity: 8,
        min_quantity: 3,
        ingredients: [
          { ingredient_id: 3, ingredient_name: 'Pomidor', quantity: 5, unit: 'kg' },
          { ingredient_id: 4, ingredient_name: 'Soğan', quantity: 2, unit: 'kg' },
        ],
        is_active: true
      },
    ];
    setSemiFinished(mockData);
  };

  const handleAddItem = (newItem) => {
    setSemiFinished([...semiFinished, { ...newItem, id: Date.now() }]);
  };

  const handleUpdateItem = (updatedItem) => {
    setSemiFinished(
      semiFinished.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Yarımfabrikatı silmək istədiyinizdən əminsiniz?')) {
      setSemiFinished(semiFinished.filter((item) => item.id !== itemId));
      toast.success('Yarımfabrikat silindi');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const filteredItems = semiFinished.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = !filterUnit || item.unit === filterUnit;
    return matchesSearch && matchesUnit;
  });

  const lowStockCount = semiFinished.filter(
    (item) => item.quantity <= item.min_quantity
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header
          title="Yarımfabrikatlar"
          stats={[
            { label: 'Ümumi', value: semiFinished.length },
            { label: 'Az Qalıb', value: lowStockCount },
          ]}
        />

        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1 max-w-md flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Yarımfabrikat axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bütün ölçülər</option>
                <option value="kg">Kq</option>
                <option value="l">Litr</option>
                <option value="pcs">Ədəd</option>
                <option value="m">Metr</option>
              </select>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Yarımfabrikat
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Ad</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Ölçü</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Miqdar</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Min. Miqdar</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Tərkiblər</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const isLowStock = item.quantity <= item.min_quantity;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.unit}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`font-medium ${
                              isLowStock ? 'text-red-600' : 'text-gray-900'
                            }`}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.min_quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.ingredients?.length || 0} tərkib
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              isLowStock
                                ? 'bg-red-100 text-red-800'
                                : item.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {isLowStock ? 'Az qalıb' : item.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterUnit
                      ? 'Filtrə uyğun yarımfabrikat tapılmadı'
                      : 'Hələ yarımfabrikat əlavə edilməyib'}
                  </p>
                  {!searchTerm && !filterUnit && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      İlk Yarımfabrikatı Əlavə Et
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SemiFinishedModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={selectedItem ? handleUpdateItem : handleAddItem}
        restaurantId={restaurant?.id}
        item={selectedItem}
      />
    </div>
  );
}
