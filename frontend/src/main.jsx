import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import store from './store';
import App from './App.jsx';
import './index.css';
import PrivateRoute from './components/PrivateRoute.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import CategoriesScreen from './screens/CategoriesScreen.jsx';
import ShopScreen from './screens/ShopScreen.jsx';
import MedicineDetailsScreen from './screens/MedicineDetailsScreen.jsx';
import OffersScreen from './screens/OffersScreen.jsx';
import TermsScreen from './screens/TermsScreen.jsx';
import PrivacyScreen from './screens/PrivacyScreen.jsx';
import FAQScreen from './screens/FAQScreen.jsx';
import CartScreen from './screens/CartScreen.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.jsx';
import ResetPasswordScreen from './screens/ResetPasswordScreen.jsx';
import VerifyEmailScreen from './screens/VerifyEmailScreen.jsx';
import ShippingScreen from './screens/ShippingScreen.jsx';
import PaymentScreen from './screens/PaymentScreen.jsx';
import PlaceOrderScreen from './screens/PlaceOrderScreen.jsx';
import OrderScreen from './screens/OrderScreen.jsx';
import MyOrdersScreen from './screens/MyOrdersScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen.jsx';
import OrderListScreen from './screens/admin/OrderListScreen.jsx';
import MedicineListScreen from './screens/admin/MedicineListScreen.jsx';
import MedicineEditScreen from './screens/admin/MedicineEditScreen.jsx';
import InventoryScreen from './screens/admin/InventoryScreen.jsx';
import CouponListScreen from './screens/admin/CouponListScreen.jsx';
import UserListScreen from './screens/admin/UserListScreen.jsx';
import UserEditScreen from './screens/admin/UserEditScreen.jsx';
import SettingsScreen from './screens/admin/SettingsScreen.jsx';
import PaymentListScreen from './screens/admin/PaymentListScreen.jsx';
import DeliveryListScreen from './screens/admin/DeliveryListScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<App />}>
        <Route index={true} path='/' element={<HomeScreen />} />
        <Route path='/categories' element={<CategoriesScreen />} />
        <Route path='/category/:id' element={<ShopScreen />} />
        <Route path='/shop' element={<ShopScreen />} />
        <Route path='/offers' element={<OffersScreen />} />
        <Route path='/terms' element={<TermsScreen />} />
        <Route path='/privacy' element={<PrivacyScreen />} />
        <Route path='/faq' element={<FAQScreen />} />
        <Route path='/medicine/:id' element={<MedicineDetailsScreen />} />
        <Route path='/cart' element={<CartScreen />} />
        <Route path='/login' element={<LoginScreen />} />
        <Route path='/register' element={<RegisterScreen />} />
        <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
        <Route path='/reset-password/:token' element={<ResetPasswordScreen />} />
        <Route path='/verify-email/:token' element={<VerifyEmailScreen />} />

        {/* Registered users */}
        <Route path='' element={<PrivateRoute />}>
          <Route path='/shipping' element={<ShippingScreen />} />
          <Route path='/payment' element={<PaymentScreen />} />
          <Route path='/placeorder' element={<PlaceOrderScreen />} />
          <Route path='/order/:id' element={<OrderScreen />} />
          <Route path='/orders' element={<MyOrdersScreen />} />
          <Route path='/profile' element={<ProfileScreen />} />
        </Route>
      </Route>

      {/* Admin users */}
      <Route path='' element={<AdminRoute />}>
        <Route path='' element={<AdminLayout />}>
          <Route path='/admin/dashboard' element={<AdminDashboardScreen />} />
          <Route path='/admin/inventory' element={<InventoryScreen />} />
          <Route path='/admin/orderlist' element={<OrderListScreen />} />
          <Route path='/admin/medicinelist' element={<MedicineListScreen />} />
          <Route path='/admin/medicine/:id/edit' element={<MedicineEditScreen />} />
          <Route path='/admin/coupons' element={<CouponListScreen />} />
          <Route path='/admin/userlist' element={<UserListScreen />} />
          <Route path='/admin/user/:id/edit' element={<UserEditScreen />} />
          <Route path='/admin/payments' element={<PaymentListScreen />} />
          <Route path='/admin/delivery' element={<DeliveryListScreen />} />
          <Route path='/admin/settings' element={<SettingsScreen />} />
          <Route path='/admin/order/:id' element={<OrderScreen />} />
        </Route>
      </Route>
    </>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
