import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { phongTroApi } from '../../services/api';
import { formatCurrency, trangThaiPhong } from '../../utils/formatters';

import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import SearchBox from '../../components/common/SearchBox';
import FilterDropdown from '../../components/common/FilterDropdown';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';

const DanhSachPhong: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    so_phong: '',
    tang: 1,
    gia_thue: '',
    dien_tich: '',
    so_nguoi_toi_da: 2,
    trang_thai: 'trong',
    mo_ta: ''
  });

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, search]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 10,
        search,
        trang_thai: statusFilter
      };

      const response = await phongTroApi.getAll(params);

      setData(response.data);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('LỖI LẤY DANH SÁCH PHÒNG:', error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi tải danh sách phòng'
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setSelectedId(item.id);

      setFormData({
        so_phong: item.so_phong || '',
        tang: item.tang || 1,
        gia_thue: item.gia_thue?.toString() || '',
        dien_tich: item.dien_tich?.toString() || '',
        so_nguoi_toi_da: item.so_nguoi_toi_da || 2,
        trang_thai: item.trang_thai || 'trong',
        mo_ta: item.mo_ta || ''
      });
    } else {
      setSelectedId(null);

      setFormData({
        so_phong: '',
        tang: 1,
        gia_thue: '',
        dien_tich: '',
        so_nguoi_toi_da: 2,
        trang_thai: 'trong',
        mo_ta: ''
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.so_phong.trim()) {
        toast.error('Vui lòng nhập số phòng');
        return;
      }

      if (
        !formData.gia_thue ||
        Number(formData.gia_thue) < 0
      ) {
        toast.error('Giá thuê không hợp lệ');
        return;
      }

      if (
        !formData.dien_tich ||
        Number(formData.dien_tich) <= 0
      ) {
        toast.error('Diện tích không hợp lệ');
        return;
      }

      if (
        !formData.so_nguoi_toi_da ||
        Number(formData.so_nguoi_toi_da) < 1
      ) {
        toast.error('Số người tối đa không hợp lệ');
        return;
      }

      const payload = {
        so_phong: formData.so_phong.trim(),
        tang: Number(formData.tang),
        gia_thue: Number(formData.gia_thue),
        dien_tich: Number(formData.dien_tich),
        so_nguoi_toi_da: Number(formData.so_nguoi_toi_da),
        trang_thai: formData.trang_thai,
        mo_ta: formData.mo_ta.trim()
      };

      if (selectedId !== null) {
        const response = await phongTroApi.update(
          selectedId,
          payload
        );

        toast.success('Cập nhật phòng thành công');
      }

      else {
        const response = await phongTroApi.create(payload);

        toast.success('Thêm phòng mới thành công');
      }

      setIsModalOpen(false);
      setSelectedId(null);

      await fetchData();
    } catch (error: any) {
      console.error('LỖI THÊM / SỬA PHÒNG:', error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Có lỗi xảy ra'
      );
    }
  };

  const handleOpenDelete = (id: number) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (selectedId === null) {
      toast.error('Không xác định được phòng cần xóa');
      return;
    }

    const deleteId = selectedId;

    try {
      const response = await phongTroApi.delete(deleteId);

      toast.success('Xóa phòng thành công');

      setIsConfirmOpen(false);
      setSelectedId(null);

      await fetchData();
    } catch (error: any) {
      console.error('LỖI XÓA PHÒNG:', error);

      console.error(
        'SERVER RESPONSE:',
        error.response?.data
      );

      setIsConfirmOpen(false);
      setSelectedId(null);

      const message =
        error.response?.data?.message ||
        error.message ||
        'Không thể xóa phòng';

      toast.error(message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
  };

  const columns = [
    {
      key: 'so_phong',
      label: 'Số phòng'
    },

    {
      key: 'tang',
      label: 'Tầng'
    },

    {
      key: 'gia_thue',
      label: 'Giá thuê',

      render: (row: any) =>
        formatCurrency(row.gia_thue)
    },

    {
      key: 'dien_tich',
      label: 'Diện tích',

      render: (row: any) =>
        `${row.dien_tich} m²`
    },

    {
      key: 'so_nguoi_toi_da',
      label: 'Số người',

      render: (row: any) =>
        `${row.so_nguoi_hien_tai ?? 0}/${row.so_nguoi_toi_da}`
    },

    {
      key: 'trang_thai',
      label: 'Trạng thái',

      render: (row: any) => {
        const status = trangThaiPhong(row.trang_thai);

        return (
          <Badge
            text={status.label}
            color={status.color}
          />
        );
      }
    },

    {
      key: 'actions',
      label: 'Thao tác',

      render: (row: any) => (
        <div className="flex items-center space-x-3">

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(row);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDelete(row.id);
            }}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-5 h-5" />
          </button>

        </div>
      )
    }
  ];

  const statusOptions = [
    {
      label: 'Tất cả',
      value: ''
    },

    {
      label: 'Phòng trống',
      value: 'trong'
    },

    {
      label: 'Đang thuê',
      value: 'da_thue'
    },

    {
      label: 'Đang sửa chữa',
      value: 'dang_bao_tri'
    },

    {
      label: 'Đã cọc',
      value: 'da_coc'
    }
  ];

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold text-gray-800">
          Quản Lý Phòng Trọ
        </h1>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />

          <span>
            Thêm phòng
          </span>
        </button>

      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">

        <div className="flex flex-col sm:flex-row gap-4 mb-6">

          <div className="w-full sm:w-1/3">

            <SearchBox
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Tìm theo số phòng..."
            />

          </div>

          <div className="w-full sm:w-1/4">

            <FilterDropdown
              label="Trạng thái"
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            />

          </div>

        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          onRowClick={(row: any) =>
            navigate(`/phong-tro/${row.id}`)
          }
        />

        {!loading && totalPages > 1 && (
          <div className="mt-4 flex justify-end">

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />

          </div>
        )}

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          selectedId !== null
            ? 'Cập nhật phòng trọ'
            : 'Thêm phòng trọ mới'
        }
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số phòng *
              </label>

              <input
                type="text"
                required
                value={formData.so_phong}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    so_phong: e.target.value
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tầng *
              </label>

              <input
                type="number"
                required
                min={1}
                value={formData.tang}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tang: Number(e.target.value)
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá thuê (VNĐ) *
              </label>

              <input
                type="number"
                required
                min={0}
                value={formData.gia_thue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gia_thue: e.target.value
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diện tích (m²) *
              </label>

              <input
                type="number"
                required
                min={0}
                step={0.1}
                value={formData.dien_tich}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dien_tich: e.target.value
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số người tối đa *
              </label>

              <input
                type="number"
                required
                min={1}
                value={formData.so_nguoi_toi_da}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    so_nguoi_toi_da: Number(e.target.value)
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>

              <select
                value={formData.trang_thai}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trang_thai: e.target.value
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >

                <option value="trong">
                  Trống
                </option>

                <option value="da_thue">
                  Đã thuê
                </option>

                <option value="da_coc">
                  Đã cọc
                </option>

                <option value="dang_bao_tri">
                  Đang bảo trì
                </option>

              </select>

            </div>

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>

            <textarea
              rows={3}
              value={formData.mo_ta}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mo_ta: e.target.value
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">

            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {selectedId !== null
                ? 'Lưu thay đổi'
                : 'Thêm phòng'}
            </button>

          </div>

        </form>

      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xóa phòng trọ"
        message="Bạn có chắc chắn muốn xóa phòng trọ này? Nếu phòng đang có hợp đồng hoặc dữ liệu liên quan, hệ thống sẽ không cho phép xóa."
        onConfirm={handleDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setSelectedId(null);
        }}
      />

    </div>
  );
};

export default DanhSachPhong;
