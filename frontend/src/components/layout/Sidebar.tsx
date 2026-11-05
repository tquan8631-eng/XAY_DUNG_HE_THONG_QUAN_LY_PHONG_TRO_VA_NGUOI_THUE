import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Home, Users, FileText, Zap, Receipt, Wrench, CreditCard,
  AlertTriangle, UserCircle, X, Building2, KeyRound, DoorOpen, Bot, Megaphone, CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNhaTro } from '../../hooks/useNhaTro';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  name: string;
  icon: React.ComponentType<any>;
  roles?: string[];
  end?: boolean;
}

const quanLyMenu: MenuItem[] = [
  { path: '/', name: 'Tổng quan', icon: LayoutDashboard, end: true },
  { path: '/phong-tro', name: 'Phòng trọ', icon: Home },
  { path: '/nguoi-thue', name: 'Người thuê', icon: Users },
  { path: '/hop-dong', name: 'Hợp đồng', icon: FileText },
  { path: '/dien-nuoc', name: 'Điện nước', icon: Zap },
  { path: '/dich-vu', name: 'Dịch vụ', icon: Wrench },
  { path: '/hoa-don', name: 'Hóa đơn', icon: Receipt },
  { path: '/thanh-toan', name: 'Thanh toán', icon: CreditCard },
  { path: '/su-co', name: 'Sự cố', icon: AlertTriangle },
  { path: '/khach-xem-phong', name: 'Khách xem phòng', icon: CalendarCheck },
  { path: '/uu-dai', name: 'Quảng cáo & ưu đãi', icon: Megaphone },
  { path: '/chatbot', name: 'Chatbot AI 24/7', icon: Bot },
  { path: '/tai-khoan', name: 'Tài khoản', icon: UserCircle, roles: ['chu_nha'] },
  { path: '/doi-mat-khau', name: 'Đổi mật khẩu', icon: KeyRound }
];

const nguoiThueMenu: MenuItem[] = [
  { path: '/cua-toi', name: 'Tổng quan', icon: LayoutDashboard, end: true },
  { path: '/cua-toi/phong', name: 'Phòng của tôi', icon: DoorOpen },
  { path: '/cua-toi/hop-dong', name: 'Hợp đồng', icon: FileText },
  { path: '/cua-toi/hoa-don', name: 'Hóa đơn', icon: Receipt },
  { path: '/cua-toi/thanh-toan', name: 'Lịch sử thanh toán', icon: CreditCard },
  { path: '/cua-toi/dien-nuoc', name: 'Điện nước', icon: Zap },
  { path: '/cua-toi/su-co', name: 'Báo sự cố', icon: AlertTriangle },
  { path: '/cua-toi/tai-khoan', name: 'Thông tin cá nhân', icon: UserCircle }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const nhaTro = useNhaTro();
  const { user, isNguoiThue } = useAuth();
  const items = (isNguoiThue ? nguoiThueMenu : quanLyMenu).filter((i) => !i.roles || i.roles.includes(user?.vai_tro || ''));
  const theme = isNguoiThue
    ? { bg: 'bg-teal-900', head: 'bg-teal-950', active: 'bg-teal-600 border-teal-300', hover: 'hover:bg-teal-800' }
    : { bg: 'bg-gray-900', head: 'bg-gray-950', active: 'bg-indigo-600 border-indigo-400', hover: 'hover:bg-gray-800' };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 ${theme.bg} text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`flex items-center justify-between h-16 px-4 ${theme.head}`}>
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={22} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{nhaTro.ten_nha_tro}</p>
              <p className="text-xs text-gray-300">{isNguoiThue ? 'Cổng người thuê' : 'Trang quản lý'} · Hỗ trợ 24/7</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 rounded-md lg:hidden hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 border-l-4 ${
                  isActive ? `${theme.active} text-white` : `text-gray-300 ${theme.hover} hover:text-white border-transparent`
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
