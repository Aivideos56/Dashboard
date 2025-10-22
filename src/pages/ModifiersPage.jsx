import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getModifiers, addModifier, updateModifier, deleteModifier } from '../utils/storage';
import ModifierModal from '../components/modals/ModifierModal';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function ModifiersPage({ restaurantId }) {
  const [modifiers, setModifiers] = useState([]);
  const [filteredModifiers, setFilteredModifiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modifierToDelete, setModifierToDelete] = useState(null);

  useEffect(() => {
    loadModifiers();
  }, [restaurantId]);

  useEffect(() => {
    filterModifiers();
  }, [searchTerm, modifiers]);

  const loadModifiers = async () => {
    setLoading(true);
    try {
      const data = await getModifiers(restaurantId);
      setModifiers(data);
      setFilteredModifiers(data);
    } catch (error) {
      toast.error('Modifikatorlar yüklənərkən xəta baş verdi');
      console.error('Load modifiers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterModifiers = () => {
    if (!searchTerm.trim()) {
      setFilteredModifiers(modifiers);
      return;
    }

    const filtered = modifiers.filter((modifier) =>
      modifier.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModifiers(filtered);
  };

  const handleAddModifier = () => {
    setSelectedModifier(null);
    setIsModalOpen(true);
  };

  const handleEditModifier = (modifier) => {
    setSelectedModifier(modifier);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (modifier) => {
    setModifierToDelete(modifier);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!modifierToDelete) return;

    try {
      await deleteModifier(modifierToDelete.id);
      toast.success('Modifikator silindi');
      loadModifiers();
    } catch (error) {
      toast.error('Modifikator silinərkən xəta baş verdi');
      console.error('Delete modifier error:', error);
    } finally {
      setShowDeleteConfirm(false);
      setModifierToDelete(null);
    }
  };

  const handleModalSuccess = async (modifierData) => {
    try {
      if (selectedModifier) {
        await updateModifier(modifierData.id, modifierData);
      } else {
        await addModifier(modifierData);
      }
      loadModifiers();
    } catch (error) {
      console.error('Modifier operation error:', error);
    }
  };

  return (
    <div>
      <Sidebar />
    <div className="flex h-screen bg-gray-50">
        <Header
					title='Modffikatorlar'
				/>  
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Modifikatorlar</h1>
            <p className="text-gray-600">Məhsul modifikatorlarını idarə edin</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Modifikator axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddModifier}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Yeni Modifikator</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredModifiers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nəticə tapılmadı' : 'Modifikator yoxdur'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Axtarış üçün başqa açar söz cəhd edin'
                  : 'Başlamaq üçün ilk modifikatorunuzu əlavə edin'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddModifier}
                  className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Yeni Modifikator Əlavə Et</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qiymət
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vəziyyət
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Əməliyyatlar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredModifiers.map((modifier) => (
                      <tr key={modifier.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {modifier.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {modifier.price} ₼
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              modifier.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {modifier.is_active ? 'Aktiv' : 'Deaktiv'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditModifier(modifier)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(modifier)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <ModifierModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedModifier(null);
          }}
          onSuccess={handleModalSuccess}
          restaurantId={restaurantId}
          item={selectedModifier}
        />

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                Modifikatoru sil
              </h3>
              <p className="text-gray-600 text-center mb-6">
                "{modifierToDelete?.name}" modifikatorunu silmək istədiyinizdən əminsiniz? Bu
                əməliyyat geri qaytarıla bilməz.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setModifierToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}