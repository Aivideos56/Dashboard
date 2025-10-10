import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, Edit, Trash2, ArrowLeft, Square, Circle,Sofa } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import HallTableModal from '../components/modals/HallTableModal';

export default function HallTablesPage() {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const { restaurant } = useSelector((state) => state.auth);
  const [hall, setHall] = useState(null);
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurant && hallId) {
      loadHallAndTables();
    }
  }, [restaurant, hallId]);

  useEffect(() => {
    if (!restaurant || !hallId) return;

    const channel = supabase
      .channel('hall-tables-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
          filter: `hall_id=eq.${hallId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTables((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setTables((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)));
          } else if (payload.eventType === 'DELETE') {
            setTables((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant, hallId]);

  const loadHallAndTables = async () => {
    setLoading(true);
    try {
      const { data: hallData, error: hallError } = await supabase
        .from('halls')
        .select('*')
        .eq('id', hallId)
        .single();

      if (hallError) throw hallError;
      setHall(hallData);

      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('hall_id', hallId)
        .order('number', { ascending: true });

      if (tablesError) throw tablesError;
      setTables(tablesData || []);
    } catch (error) {
      console.error('Error loading hall and tables:', error);
      toast.error('Məlumatları yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = () => {
    setSelectedTable(null);
    setShowModal(true);
  };

  const handleEditTable = (table) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Masanı silmək istədiyinizdən əminsiniz?')) {
      try {
        const { error } = await supabase.from('tables').delete().eq('id', tableId);

        if (error) throw error;
        toast.success('Masa silindi');
      } catch (error) {
        console.error('Error deleting table:', error);
        toast.error('Masa silinərkən xəta baş verdi');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTable(null);
  };

  const getTableIcon = (shape) => {
    switch (shape) {
      case 'square':
        return <Square className="w-6 h-6" />;
      case 'circle':
        return <Circle className="w-6 h-6" />;
      case 'sofa':
        return <Sofa className="w-6 h-6" />;
      default:
        return <Square className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Boş';
      case 'occupied':
        return 'Dolu';
      case 'reserved':
        return 'Rezerv';
      default:
        return 'Naməlum';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Yüklənir...</div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Zal tapılmadı</p>
          <button
            onClick={() => navigate('/halls')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Geri qayıt
          </button>
        </div>
      </div>
    );
  }

  const availableTables = tables.filter((t) => t.status === 'available').length;
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header
          title={`${hall.name} - Masalar`}
          stats={[
            { label: 'Ümumi Masalar', value: tables.length },
            { label: 'Boş', value: availableTables },
            { label: 'Dolu', value: occupiedTables },
          ]}
        />

        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/halls')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Zallara qayıt
            </button>
            <button
              onClick={handleAddTable}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Masa
            </button>
          </div>

          {tables.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Square className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hələ masa yoxdur</h3>
              <p className="text-gray-600 mb-6">Bu zal üçün ilk masanı əlavə edin</p>
              <button
                onClick={handleAddTable}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                İlk Masanı Əlavə Et
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`relative p-6 border-2 rounded-lg transition hover:shadow-lg ${getStatusColor(
                    table.status
                  )}`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="text-gray-700">
                      {getTableIcon(table.shape)}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-gray-900">Masa {table.number}</p>
                      <p className="text-sm text-gray-600">{table.capacity} nəfər</p>
                      <p className="text-xs text-gray-500 mt-1">{getStatusText(table.status)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-gray-300">
                    <button
                      onClick={() => handleEditTable(table)}
                      className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition"
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

      <HallTableModal
        isOpen={showModal}
        onClose={handleCloseModal}
        hallId={hallId}
        hallName={hall.name}
        table={selectedTable}
        existingTables={tables}
      />
    </div>
  );
}
