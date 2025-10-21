import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import UsersPage from './pages/UsersPage';
import BranchesPage from './pages/BranchesPage';
import TablesPage from './pages/TablesPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import HallsPage from './pages/HallsPage';
import HallTablesPage from './pages/HallTablesPage';
import SemiFinishedPage from './pages/SemiFinishedPage';
import DepartmentPage from './pages/DepartmentsPage'
import IngredientsPage from './pages/IngredientsPage'

function App() {
	return (
		<Provider store={store}>
			<Router>
				<Routes>
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />

					<Route
						path='/admin'
						element={
							<ProtectedRoute requireAdmin>
								<AdminDashboard />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<RestaurantDashboard />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/users'
						element={
							<ProtectedRoute>
								<UsersPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/branches'
						element={
							<ProtectedRoute>
								<BranchesPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/halls'
						element={
							<ProtectedRoute>
								<HallsPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/halls/:hallId/tables'
						element={
							<ProtectedRoute>
								<HallTablesPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/menu'
						element={
							<ProtectedRoute>
								<MenuPage />
							</ProtectedRoute>
						}
					/>

          <Route
						path='/semifinished'
						element={
							<ProtectedRoute>
								<SemiFinishedPage />
							</ProtectedRoute>
						}
					/>
          
          <Route
						path='/ingredients'
						element={
							<ProtectedRoute>
								<IngredientsPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/departments'
						element={
							<ProtectedRoute>
								<DepartmentPage />
							</ProtectedRoute>
						}
					/>
          
					<Route
						path='/orders'
						element={
							<ProtectedRoute>
								<OrdersPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/statistics'
						element={
							<ProtectedRoute>
								<StatisticsPage />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/settings'
						element={
							<ProtectedRoute>
								<SettingsPage />
							</ProtectedRoute>
						}
					/>

					<Route path='/' element={<Navigate to='/login' replace />} />
				</Routes>

				<Toaster
					position='top-right'
					toastOptions={{
						duration: 3000,
						style: {
							background: '#fff',
							color: '#1f2937',
						},
						success: {
							iconTheme: {
								primary: '#10b981',
								secondary: '#fff',
							},
						},
						error: {
							iconTheme: {
								primary: '#ef4444',
								secondary: '#fff',
							},
						},
					}}
				/>
			</Router>
		</Provider>
	);
}

export default App;
