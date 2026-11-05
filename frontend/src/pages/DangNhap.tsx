import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Lock, User, Bot, ArrowLeft } from 'lucide-react';
import { TEN_HE_THONG } from '../config';
import { useAuth } from '../hooks/useAuth';
import { homePathFor } from '../contexts/AuthContext';

const DangNhap: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const user = await login({
        ten_dang_nhap: username.trim(),
        mat_khau: password
      });

      toast.success(`Xin chào ${user.ho_ten || user.ten_dang_nhap}!`);

      navigate(homePathFor(user), { replace: true });
    } catch (error: any) {
      console.error('LOGIN ERROR:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Tên đăng nhập hoặc mật khẩu không chính xác';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 p-3 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>

          <h1 className="text-xl font-bold text-center text-gray-900 leading-snug">
            {TEN_HE_THONG}
          </h1>

          <p className="text-gray-500 mt-2 text-sm text-center">
            Dành cho chủ nhà, nhân viên và người thuê
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nhập mật khẩu"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>

                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link to="/gioi-thieu" className="flex items-center gap-1 text-gray-500 hover:text-indigo-600">
            <ArrowLeft size={15} /> Trang giới thiệu
          </Link>
          <Link to="/gioi-thieu" onClick={() => setTimeout(() => window.dispatchEvent(new CustomEvent('mo-chatbot')), 300)} className="flex items-center gap-1 font-medium text-indigo-600 hover:underline">
            <Bot size={15} /> Chưa có tài khoản? Hỏi chatbot
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DangNhap;
