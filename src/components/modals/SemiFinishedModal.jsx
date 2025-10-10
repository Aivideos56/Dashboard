import { useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SemiFinishedModal({ isOpen, onClose, onSuccess, restaurantId, item = null }) {
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showIngredientsPanel, setShowIngredientsPanel] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      is_active: true,
      unit: 'kg',
      quantity: 0,
      min_quantity: 0,
    },
  });

  useEffect(() => {
    loadIngredients();
    if (item) {
      setValue('name', item.name);
      setValue('unit', item.unit);
      setValue('quantity', item.quantity);
      setValue('min_quantity', item.min_quantity);
      setValue('is_active', item.is_active);
      if (item.ingredients) {
        setSelectedIngredients(item.ingredients);
      }
    }
  }, [item, setValue]);

  const loadIngredients = async () => {
    const mockIngredients = [
      { id: 1, name: 'Un', unit: 'kg' },
      { id: 2, name: 'Su', unit: 'l' },
      { id: 3, name: 'Pomidor', unit: 'kg' },
      { id: 4, name: 'Soğan', unit: 'kg' },
      { id: 5, name: 'Pendir', unit: 'kg' },
      { id: 6, name: 'Süd', unit: 'l' },
      { id: 7, name: 'Yumurta', unit: 'pcs' },
      { id: 8, name: 'Yağ', unit: 'l' },
    ];
    setIngredients(mockIngredients);
  };

  const handleAddIngredient = () => {
    setShowIngredientsPanel(true);
  };

  const handleIngredientSelect = (ingredient, selectionType = 'single') => {
    if (selectionType === 'single') {
      const exists = selectedIngredients.find((i) => i.ingredient_id === ingredient.id);
      if (exists) {
        toast.error('Bu tərkib artıq əlavə edilib');
        return;
      }
      setSelectedIngredients([
        ...selectedIngredients,
        {
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          quantity: 0,
          unit: ingredient.unit,
        },
      ]);
    } else {
      const newIngredients = ingredients
        .filter((ing) => !selectedIngredients.find((si) => si.ingredient_id === ing.id))
        .map((ing) => ({
          ingredient_id: ing.id,
          ingredient_name: ing.name,
          quantity: 0,
          unit: ing.unit,
        }));
      setSelectedIngredients([...selectedIngredients, ...newIngredients]);
    }
  };

  const handleRemoveIngredient = (ingredientId) => {
    setSelectedIngredients(
      selectedIngredients.filter((i) => i.ingredient_id !== ingredientId)
    );
  };

  const handleIngredientChange = (ingredientId, field, value) => {
    setSelectedIngredients(
      selectedIngredients.map((i) =>
        i.ingredient_id === ingredientId ? { ...i, [field]: value } : i
      )
    );
  };

  const onSubmit = async (data) => {
    if (selectedIngredients.length === 0) {
      toast.error('Ən azı bir tərkib əlavə edin');
      return;
    }

    const hasEmptyQuantity = selectedIngredients.some((i) => !i.quantity || parseFloat(i.quantity) <= 0);
    if (hasEmptyQuantity) {
      toast.error('Bütün tərkiblərin miqdarını daxil edin');
      return;
    }

    setLoading(true);

    try {
      const itemData = {
        ...data,
        restaurant_id: restaurantId,
        quantity: parseFloat(data.quantity),
        min_quantity: parseFloat(data.min_quantity),
        is_active: data.is_active === true || data.is_active === 'true',
        ingredients: selectedIngredients.map((i) => ({
          ...i,
          quantity: parseFloat(i.quantity),
        })),
      };

      if (item) {
        itemData.id = item.id;
      }

      toast.success(item ? 'Yarımfabrikat yeniləndi' : 'Yarımfabrikat əlavə edildi');
      reset();
      setSelectedIngredients([]);
      onSuccess(itemData);
      onClose();
    } catch (error) {
      toast.error('Yarımfabrikat əməliyyatı zamanı xəta baş verdi');
      console.error('Semi-finished operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Yarımfabrikatı Redaktə Et' : 'Yeni Yarımfabrikat'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yarımfabrikat Adı *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Ad tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="məs: Hazır xəmir"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ölçü vahidi *
              </label>
              <select
                {...register('unit', { required: 'Ölçü vahidi tələb olunur' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="kg">Kiloqram (kg)</option>
                <option value="l">Litr (l)</option>
                <option value="pcs">Ədəd</option>
                <option value="m">Metr (m)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miqdar *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('quantity', { required: 'Miqdar tələb olunur', min: 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. Miqdar *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('min_quantity', { required: 'Min. miqdar tələb olunur', min: 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Tərkiblər *
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleIngredientSelect(null, 'all')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Hamısını əlavə et
                </button>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Tərkib əlavə et
                </button>
              </div>
            </div>

            {showIngredientsPanel && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Tərkib seçin</h4>
                  <button
                    type="button"
                    onClick={() => setShowIngredientsPanel(false)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Bağla
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ingredients
                    .filter((ing) => !selectedIngredients.find((si) => si.ingredient_id === ing.id))
                    .map((ingredient) => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => {
                          handleIngredientSelect(ingredient, 'single');
                          setShowIngredientsPanel(false);
                        }}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition text-sm text-left"
                      >
                        {ingredient.name} ({ingredient.unit})
                      </button>
                    ))}
                </div>
              </div>
            )}

            {selectedIngredients.length > 0 && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                {selectedIngredients.map((ingredient) => (
                  <div key={ingredient.ingredient_id} className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                      {ingredient.ingredient_name}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        handleIngredientChange(ingredient.ingredient_id, 'quantity', e.target.value)
                      }
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Miqdar"
                    />
                    <span className="text-sm text-gray-600 w-16">{ingredient.unit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ingredient.ingredient_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_active')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Aktiv</label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Əməliyyat...' : 'Yadda saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
