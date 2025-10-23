import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Warehouse, Search } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function WarehousePage() {
  const { restaurant } = useSelector((state) => state.auth);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      loadWarehouses();
    }
  }, [restaurant]);

  useEffect(() => {
    if (!restaurant) return;

    const channel = supabase
      .channel('warehouses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'warehouses',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWarehouses((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setWarehouses((prev) => prev.map((w) => (w.id === payload.new.id ? payload.new : w)));
          } else if (payload.eventType === 'DELETE') {
            setWarehouses((prev) => prev.filter((w) => w.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant]);

  const loadWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      toast.error('Anbarları yükləmək mümkün olmadı');
    }
  };

  const handleAddWarehouse = async () => {
    if (!newName.trim()) {
      toast.error('Anbar adı tələb olunur');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert([
          {
            name: newName.trim(),
            restaurant_id: restaurant.id,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      toast.success('Anbar əlavə edildi');
      setNewName('');
      setShowModal(false);
    } catch (error) {
      console.error('Error adding warehouse:', error);
      toast.error('Anbar əlavə edilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (warehouse) => {
    try {
      const { error } = await supabase
        .from('warehouses')
        .update({ is_active: !warehouse.is_active })
        .eq('id', warehouse.id);

      if (error) throw error;
      toast.success(`Anbar ${!warehouse.is_active ? 'aktivləşdirildi' : 'deaktivləşdirildi'}`);
    } catch (error) {
      console.error('Error toggling warehouse:', error);
      toast.error('Status dəyişdirilərkən xəta baş verdi');
    }
  };

  const handleDeleteWarehouse = async (warehouseId) => {
    if (window.confirm('Anbarı silmək istədiyinizdən əminsiniz?')) {
      try {
        const { error } = await supabase.from('warehouses').delete().eq('id', warehouseId);

        if (error) throw error;
        toast.success('Anbar silindi');
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        toast.error('Anbar silinərkən xəta baş verdi');
      }
    }
  };

  const filteredWarehouses = warehouses.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = warehouses.filter((w) => w.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header
          title="Anbar İdarəetməsi"
          stats={[
            { label: 'Ümumi Anbarlar', value: warehouses.length },
            { label: 'Aktiv Anbarlar', value: activeCount },
          ]}
        />

        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Anbar axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Anbar
            </button>
          </div>

          {filteredWarehouses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'Nəticə tapılmadı' : 'Hələ anbar yoxdur'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Axtarış üçün başqa açar söz cəhd edin' : 'İlk anbarı əlavə edərək başlayın'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  İlk Anbarı Əlavə Et
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <div key={warehouse.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{warehouse.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={warehouse.is_active}
                          onChange={() => handleToggleActive(warehouse)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {warehouse.is_active ? 'Aktiv' : 'Qeyri-aktiv'}
                        </span>
                      </label>
                    </div>
                    <button
                      onClick={() => handleDeleteWarehouse(warehouse.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Yeni Anbar</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anbar Adı *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="məs: Əsas Anbar"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewName('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleAddWarehouse}
                  disabled={loading || !newName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Əməliyyat...' : 'Yadda saxla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
