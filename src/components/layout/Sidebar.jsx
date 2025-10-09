import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, TrendingUp, Settings, Building2 } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Sidebar() {
  const { restaurant } = useSelector((state) => state.auth);

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', name: 'İstifadəçilər', icon: Users },
    { path: '/branches', name: 'Filiallar', icon: Building2 },
    { path: '/tables', name: 'Masalar', icon: Users },
    { path: '/menu', name: 'Menyu', icon: Package },
    { path: '/orders', name: 'Sifarişlər', icon: ShoppingCart },
    { path: '/statistics', name: 'Statistika', icon: TrendingUp },
    { path: '/settings', name: 'Parametrlər', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {restaurant?.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          )}
          <div>
            <h2 className="font-bold text-gray-900">{restaurant?.name}</h2>
            <p className="text-xs text-gray-500">Restoran Paneli</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
