import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { vaiTro } from '../../utils/formatters';
import { TEN_HE_THONG } from '../../config';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout, isNguoiThue } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/dang-nhap', { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="p-2 mr-4 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100">
          <Menu size={24} />
        </button>
        <h1 className="hidden text-lg font-semibold text-gray-800 truncate sm:block">
          {isNguoiThue ? `Xin chào, ${user?.ho_ten || user?.ten_dang_nhap}` : TEN_HE_THONG}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(isNguoiThue ? '/cua-toi/tai-khoan' : '/doi-mat-khau')}
          className="flex items-center gap-3 text-left"
          title="Tài khoản của tôi"
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900">{user?.ho_ten || user?.ten_dang_nhap}</p>
            <p className="text-xs text-gray-500">{vaiTro(user?.vai_tro || '').label}</p>
          </div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              isNguoiThue ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            <User size={20} />
          </div>
        </button>

        <div className="w-px h-8 bg-gray-300" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
