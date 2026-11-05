export interface YDinh {
  ma: string;
  ten: string;
  mau: string[];
}

export const Y_DINH: YDinh[] = [
  {
    ma: 'chao_hoi',
    ten: 'Chào hỏi',
    mau: ['xin chào', 'chào bạn', 'hello', 'hi shop', 'alo', 'chào buổi sáng', 'chào ad', 'hế lô', 'chào chủ nhà', 'xin chào chatbot', 'có ai ở đó không', 'chào em']
  },
  {
    ma: 'cam_on',
    ten: 'Cảm ơn',
    mau: ['cảm ơn', 'cảm ơn bạn nhiều', 'thanks', 'ok cảm ơn nha', 'tks', 'cám ơn em', 'cảm ơn đã hỗ trợ', 'hay quá cảm ơn', 'được rồi cảm ơn', 'thank you']
  },
  {
    ma: 'tam_biet',
    ten: 'Tạm biệt',
    mau: ['tạm biệt', 'bye', 'hẹn gặp lại', 'thôi chào nhé', 'bye bye', 'mình đi đây', 'hết rồi', 'không còn gì nữa']
  },
  {
    ma: 'tro_giup',
    ten: 'Chatbot làm được gì',
    mau: ['bạn làm được gì', 'bạn là ai', 'giúp tôi với', 'tôi có thể hỏi gì', 'hướng dẫn sử dụng', 'chatbot hỗ trợ những gì', 'menu', 'trợ giúp', 'help', 'bạn biết những gì', 'có những chức năng gì', 'cách dùng chatbot']
  },
  {
    ma: 'phong_trong',
    ten: 'Tìm phòng trống',
    mau: [
      'còn phòng trống không', 'còn phòng không ạ', 'có phòng cho thuê không', 'tìm phòng trọ', 'phòng nào đang trống',
      'cho mình thuê phòng', 'có phòng dưới 3 triệu không', 'còn phòng cho 2 người không', 'phòng trống tầng mấy',
      'mình cần thuê phòng gấp', 'hiện tại có phòng nào không', 'có phòng rộng không', 'phòng cho 3 người ở',
      'phòng giá rẻ', 'muốn thuê trọ', 'danh sách phòng trống', 'còn phòng tháng sau không'
    ]
  },
  {
    ma: 'gia_phong',
    ten: 'Giá thuê phòng',
    mau: [
      'giá phòng bao nhiêu', 'tiền phòng một tháng bao nhiêu', 'giá thuê thế nào', 'phòng bao nhiêu tiền', 'giá thuê trọ ở đây',
      'thuê phòng hết bao nhiêu', 'bảng giá phòng', 'phòng rẻ nhất bao nhiêu', 'giá phòng có thương lượng không', 'giá thuê phòng p203'
    ]
  },
  {
    ma: 'gia_dich_vu',
    ten: 'Giá điện, nước, dịch vụ',
    mau: [
      'giá điện bao nhiêu', 'tiền nước tính sao', 'điện bao nhiêu một số', 'nước tính theo khối hay theo người', 'giá internet', 'giá điện mỗi kí',
      'tiền rác bao nhiêu', 'các dịch vụ tính phí thế nào', 'phí dịch vụ gồm những gì', 'điện nước tính giá nhà nước không',
      'wifi có mất tiền không', 'chi phí phát sinh hàng tháng', 'đơn giá điện nước', 'phí gửi xe bao nhiêu'
    ]
  },
  {
    ma: 'lien_he',
    ten: 'Địa chỉ, liên hệ',
    mau: [
      'địa chỉ nhà trọ ở đâu', 'số điện thoại chủ nhà', 'liên hệ thế nào', 'cho xin số zalo', 'nhà trọ nằm ở đường nào',
      'gọi cho ai', 'làm sao liên hệ chủ trọ', 'email liên hệ', 'đường đi tới nhà trọ', 'chủ nhà tên gì', 'số hotline'
    ]
  },
  {
    ma: 'khuyen_mai',
    ten: 'Khuyến mãi, ưu đãi',
    mau: [
      'có khuyến mãi gì không', 'đang có ưu đãi gì', 'có giảm giá không', 'mã giảm giá', 'chương trình khuyến mãi tháng này',
      'giới thiệu bạn bè có được giảm không', 'có miễn phí gì không', 'ưu đãi cho người mới', 'có voucher không', 'khuyến mãi'
    ]
  },
  {
    ma: 'thu_tuc_thue',
    ten: 'Thủ tục thuê phòng',
    mau: [
      'thủ tục thuê phòng thế nào', 'cần giấy tờ gì', 'đặt cọc bao nhiêu', 'thuê tối thiểu mấy tháng', 'làm hợp đồng ra sao',
      'tiền cọc có được trả lại không', 'muốn thuê thì làm gì', 'quy trình thuê phòng', 'có cần căn cước không',
      'thuê ngắn hạn được không', 'cọc mấy tháng', 'tiền cọc phòng là bao nhiêu khi thuê', 'có đăng ký tạm trú không'
    ]
  },
  {
    ma: 'dat_lich_xem',
    ten: 'Đặt lịch xem phòng',
    mau: [
      'tôi muốn xem phòng', 'đặt lịch xem phòng', 'cho mình qua xem phòng', 'mai qua xem phòng được không', 'hẹn xem phòng',
      'muốn đến xem trực tiếp', 'đăng ký xem phòng p203', 'chiều nay xem phòng được không', 'giữ phòng giúp mình',
      'mình muốn đặt phòng', 'đăng ký thuê phòng', 'xem phòng lúc nào được'
    ]
  },
  {
    ma: 'noi_quy',
    ten: 'Nội quy, giờ giấc',
    mau: [
      'giờ giấc thế nào', 'mấy giờ đóng cổng', 'giờ đóng cửa ban đêm', 'cổng mở tới mấy giờ', 'có giờ giấc tự do không', 'có được nuôi chó mèo không', 'có được nấu ăn không',
      'bạn bè ở lại qua đêm được không', 'nội quy nhà trọ', 'có chung chủ không', 'đi làm về khuya được không', 'nuôi thú cưng được không'
    ]
  },
  {
    ma: 'tien_ich',
    ten: 'Tiện ích',
    mau: [
      'có máy lạnh không', 'có chỗ để xe không', 'có camera an ninh không', 'có máy giặt không', 'phòng có gác không',
      'có nóng lạnh không', 'tiện ích gồm những gì', 'có wc riêng không', 'có ban công không', 'gần trường không',
      'phòng có nội thất gì', 'có bếp không'
    ]
  },
  {
    ma: 'hoa_don',
    ten: 'Hóa đơn, tiền phải trả',
    mau: [
      'tháng này tôi phải đóng bao nhiêu', 'tiền phòng tháng này', 'hóa đơn tháng 8', 'tôi còn nợ bao nhiêu', 'xem hóa đơn',
      'tháng này hết bao nhiêu tiền', 'tiền trọ tháng 9 bao nhiêu', 'hạn đóng tiền khi nào', 'hóa đơn của tôi', 'tôi đã hết nợ chưa',
      'tổng tiền tháng này', 'bao giờ phải đóng tiền', 'phòng nào còn nợ tiền', 'ai chưa đóng tiền', 'hóa đơn quá hạn', 'công nợ'
    ]
  },
  {
    ma: 'tien_dien_nuoc',
    ten: 'Điện nước đã dùng',
    mau: [
      'tháng này dùng bao nhiêu điện', 'chỉ số điện nước', 'số điện tháng 8', 'tháng này xài bao nhiêu nước', 'tiền điện tháng này',
      'sao tiền điện tăng vậy', 'điện tiêu thụ bao nhiêu kwh', 'nước tháng này bao nhiêu khối', 'xem chỉ số công tơ',
      'phòng nào chưa ghi điện nước', 'tiền nước tháng 9'
    ]
  },
  {
    ma: 'du_bao',
    ten: 'Dự báo tiền tháng sau',
    mau: [
      'tháng sau khoảng bao nhiêu tiền', 'dự đoán tiền tháng tới', 'ước tính tiền tháng sau', 'tháng tới phải đóng khoảng bao nhiêu',
      'dự báo tiền điện', 'tháng sau tiền điện bao nhiêu', 'ước lượng hóa đơn kỳ tới', 'dự kiến chi phí tháng sau', 'kỳ tới tốn khoảng bao nhiêu', 'tiền tháng tới dự tính'
    ]
  },
  {
    ma: 'thanh_toan',
    ten: 'Cách thanh toán',
    mau: [
      'chuyển khoản như thế nào', 'số tài khoản là gì', 'thanh toán bằng cách nào', 'có quét mã qr được không',
      'nội dung chuyển khoản ghi gì', 'trả tiền mặt được không', 'tôi đã chuyển khoản rồi', 'đóng tiền ở đâu',
      'lịch sử thanh toán', 'tôi đã đóng tiền chưa', 'thanh toán momo được không', 'ngân hàng nào'
    ]
  },
  {
    ma: 'hop_dong',
    ten: 'Hợp đồng',
    mau: [
      'hợp đồng của tôi khi nào hết hạn', 'còn bao lâu hết hợp đồng', 'tiền cọc của tôi bao nhiêu', 'muốn gia hạn hợp đồng',
      'muốn trả phòng thì sao', 'xem hợp đồng', 'hợp đồng ký đến bao giờ', 'hợp đồng nào sắp hết hạn', 'thanh lý hợp đồng',
      'chuyển đi có được trả cọc không'
    ]
  },
  {
    ma: 'bao_su_co',
    ten: 'Báo sự cố',
    mau: [
      'vòi nước bị rỉ', 'bóng đèn bị cháy', 'máy lạnh không mát', 'bồn cầu bị tắc', 'báo hỏng', 'tôi muốn báo sự cố',
      'phòng bị mất điện', 'ổ cắm bị chập', 'khóa cửa bị hỏng', 'wifi không vào được', 'trần nhà bị dột', 'máy nước nóng không chạy',
      'ống nước bị vỡ', 'quạt bị hỏng', 'cửa sổ bị kẹt', 'nhờ sửa giúp', 'có cái bị hư cần sửa', 'nước không chảy',
      'muốn báo sự cố', 'báo sự cố', 'gửi báo cáo sự cố mới', 'tạo yêu cầu sửa chữa', 'phòng có đồ bị hư', 'báo hỏng đồ'
    ]
  },
  {
    ma: 'tinh_trang_su_co',
    ten: 'Tình trạng sự cố',
    mau: [
      'sự cố của tôi xử lý chưa', 'bao giờ sửa', 'đã có người sửa chưa', 'kiểm tra yêu cầu sửa chữa', 'tình trạng báo hỏng',
      'sự cố nào chưa xử lý', 'khi nào thợ tới', 'yêu cầu sửa chữa của tôi', 'danh sách sự cố', 'việc sửa chữa tới đâu rồi', 'báo hỏng hôm trước sao rồi'
    ]
  },
  {
    ma: 'phong_cua_toi',
    ten: 'Thông tin phòng của tôi',
    mau: [
      'phòng của tôi', 'tôi đang ở phòng nào', 'ai ở cùng phòng tôi', 'phòng tôi có dịch vụ gì', 'thông tin phòng tôi',
      'phòng tôi rộng bao nhiêu', 'phòng tôi giá bao nhiêu', 'thành viên trong phòng'
    ]
  },
  {
    ma: 'tai_khoan',
    ten: 'Tài khoản, mật khẩu',
    mau: [
      'đổi mật khẩu thế nào', 'quên mật khẩu', 'không đăng nhập được', 'tài khoản của tôi', 'cách đăng nhập', 'đổi số điện thoại',
      'cập nhật thông tin cá nhân', 'tài khoản bị khóa', 'lấy lại mật khẩu'
    ]
  },
  {
    ma: 'thong_ke',
    ten: 'Thống kê nhà trọ',
    mau: [
      'tình hình nhà trọ thế nào', 'doanh thu tháng này', 'thống kê tổng quan', 'báo cáo tháng này', 'bao nhiêu phòng đang thuê',
      'tổng thu tháng này', 'có bao nhiêu người thuê', 'tỷ lệ lấp đầy', 'tổng quan hôm nay'
    ]
  },
  {
    ma: 'khach_dang_ky',
    ten: 'Khách đăng ký xem phòng',
    mau: [
      'có khách nào đăng ký xem phòng không', 'khách mới đăng ký', 'ai muốn xem phòng', 'danh sách khách hẹn xem phòng',
      'yêu cầu xem phòng mới', 'có ai hỏi thuê không', 'khách tiềm năng'
    ]
  }
];

export const MUC_DO_MAU: Array<[string, string]> = [
  ['ổ cắm bị chập có tia lửa', 'khan_cap'], ['dây điện bốc khói', 'khan_cap'], ['có mùi khét từ ổ điện', 'khan_cap'], ['rò rỉ gas bếp', 'khan_cap'],
  ['bị điện giật khi chạm vào tường', 'khan_cap'], ['nước ngập phòng', 'khan_cap'], ['ống nước vỡ phun nước khắp phòng', 'khan_cap'],
  ['cửa không khóa được', 'khan_cap'], ['mất điện cả phòng', 'khan_cap'], ['bồn cầu tắc hoàn toàn không dùng được', 'khan_cap'],
  ['phòng bị cháy', 'khan_cap'], ['chập điện', 'khan_cap'], ['mất điện toàn bộ', 'khan_cap'], ['khóa cửa hỏng không vào phòng được', 'khan_cap'],
  ['nước tràn ra hành lang', 'khan_cap'],

  ['máy lạnh không mát', 'cao'], ['máy lạnh chảy nước', 'cao'], ['máy lạnh hỏng không bật được', 'cao'], ['không có nước nóng để tắm', 'cao'],
  ['máy nước nóng hỏng', 'cao'], ['trần nhà bị dột khi mưa', 'cao'], ['nước không chảy', 'cao'], ['mất nước cả ngày', 'cao'],
  ['tủ lạnh không chạy', 'cao'], ['khóa cửa bị kẹt khó mở', 'cao'], ['bồn cầu bị nghẹt xả chậm', 'cao'], ['không có internet cả ngày', 'cao'],
  ['máy bơm nước hỏng', 'cao'], ['nhà vệ sinh bị tắc', 'cao'],

  ['vòi nước bị rỉ', 'trung_binh'], ['quạt trần kêu to', 'trung_binh'], ['ống thoát nước chảy chậm', 'trung_binh'], ['cửa sổ bị kẹt', 'trung_binh'],
  ['vòi sen yếu', 'trung_binh'], ['bồn rửa chén chảy chậm', 'trung_binh'], ['tường bị thấm ẩm', 'trung_binh'], ['ổ cắm lỏng', 'trung_binh'],
  ['vòi sen bị rỉ nước', 'trung_binh'], ['quạt quay yếu', 'trung_binh'], ['cửa nhà tắm bị kẹt', 'trung_binh'], ['máy giặt kêu to', 'trung_binh'],
  ['nước nóng yếu', 'trung_binh'], ['gạch nền bị bong', 'trung_binh'],

  ['bóng đèn bị cháy', 'thap'], ['wifi yếu', 'thap'], ['sơn tường bị tróc', 'thap'], ['bản lề cửa lỏng', 'thap'], ['rèm cửa bị rách', 'thap'],
  ['kệ bếp bị lung lay', 'thap'], ['mạng chậm buổi tối', 'thap'], ['công tắc đèn hơi lỏng', 'thap'], ['bóng đèn nhà tắm không sáng', 'thap'],
  ['tay nắm tủ bị gãy', 'thap'], ['móc treo đồ bị rơi', 'thap'], ['wifi thỉnh thoảng rớt', 'thap'], ['đèn hành lang hơi tối', 'thap'],
  ['ổ khóa tủ hơi khó mở', 'thap']
];

export const laNguyHiem = (moTa: string): boolean => {
  const s = String(moTa || '').toLowerCase();
  if (/(chập|khói|khét|\bgas\b|điện giật|bị giật|giật điện|ngập|vỡ ống|tia lửa|\bnổ\b|hỏa hoạn)/.test(s)) return true;
  return /cháy/.test(s) && !/đèn[^.]{0,15}cháy/.test(s);
};

export const BO_KIEM_THU: Array<[string, string]> = [
  ['chào shop ạ', 'chao_hoi'], ['hi bạn', 'chao_hoi'], ['xin chào, cho mình hỏi chút', 'chao_hoi'],
  ['ok cám ơn bạn nhé', 'cam_on'], ['cảm ơn nhiều', 'cam_on'],
  ['thôi mình đi nhé, bye', 'tam_biet'],
  ['bạn có thể giúp gì cho tôi', 'tro_giup'], ['tôi hỏi được những gì', 'tro_giup'],
  ['bên mình còn phòng trống nào không', 'phong_trong'], ['mình muốn tìm phòng cho 2 người', 'phong_trong'],
  ['có phòng nào tầm 2tr5 không', 'phong_trong'], ['phòng còn trống không bạn', 'phong_trong'],
  ['phòng giá bao nhiêu 1 tháng', 'gia_phong'], ['giá thuê phòng ở đây thế nào', 'gia_phong'], ['tiền phòng bao nhiêu vậy', 'gia_phong'],
  ['điện tính bao nhiêu 1 kí', 'gia_dich_vu'], ['nước tính theo khối hả', 'gia_dich_vu'], ['wifi có tính tiền không', 'gia_dich_vu'], ['phí rác bao nhiêu', 'gia_dich_vu'],
  ['nhà trọ ở đâu vậy', 'lien_he'], ['cho mình xin sdt chủ trọ', 'lien_he'], ['zalo chủ nhà là gì', 'lien_he'],
  ['tháng này có ưu đãi không', 'khuyen_mai'], ['có chương trình giảm giá nào không', 'khuyen_mai'],
  ['thuê phòng cần những giấy tờ gì', 'thu_tuc_thue'], ['tiền cọc là bao nhiêu', 'thu_tuc_thue'], ['phải thuê ít nhất mấy tháng', 'thu_tuc_thue'],
  ['mình muốn hẹn qua xem phòng', 'dat_lich_xem'], ['cuối tuần qua xem phòng được không', 'dat_lich_xem'], ['đăng ký xem phòng giúp mình', 'dat_lich_xem'],
  ['mấy giờ thì đóng cửa', 'noi_quy'], ['có cho nuôi mèo không', 'noi_quy'], ['nấu ăn trong phòng được không', 'noi_quy'],
  ['có chỗ gửi xe máy không', 'tien_ich'], ['phòng có máy lạnh chưa', 'tien_ich'], ['có camera không', 'tien_ich'],
  ['tháng này em phải trả bao nhiêu tiền', 'hoa_don'], ['hóa đơn tháng 9 của tôi', 'hoa_don'], ['mình còn nợ tiền không', 'hoa_don'], ['khi nào hết hạn đóng tiền', 'hoa_don'],
  ['tháng 8 xài hết bao nhiêu điện', 'tien_dien_nuoc'], ['chỉ số nước tháng này', 'tien_dien_nuoc'], ['sao điện tháng này cao thế', 'tien_dien_nuoc'],
  ['tháng tới chắc tốn bao nhiêu', 'du_bao'], ['dự đoán hóa đơn tháng sau giúp mình', 'du_bao'],
  ['số tài khoản ngân hàng là gì', 'thanh_toan'], ['chuyển khoản ghi nội dung gì', 'thanh_toan'], ['mình trả tiền mặt được không', 'thanh_toan'],
  ['hợp đồng mình còn bao lâu', 'hop_dong'], ['tiền cọc mình đóng bao nhiêu', 'hop_dong'], ['mình muốn gia hạn thêm hợp đồng', 'hop_dong'],
  ['đèn phòng tắm bị hư', 'bao_su_co'], ['nhà vệ sinh bị nghẹt', 'bao_su_co'], ['máy lạnh chảy nước', 'bao_su_co'], ['báo hỏng vòi nước', 'bao_su_co'],
  ['vụ sửa vòi nước sao rồi', 'tinh_trang_su_co'], ['yêu cầu sửa của mình tới đâu rồi', 'tinh_trang_su_co'],
  ['mình ở phòng số mấy', 'phong_cua_toi'], ['phòng mình có ai ở chung', 'phong_cua_toi'],
  ['mình quên pass rồi', 'tai_khoan'], ['muốn đổi mật khẩu', 'tai_khoan'],
  ['doanh thu tháng này được bao nhiêu', 'thong_ke'], ['tổng quan nhà trọ', 'thong_ke'],
  ['có khách nào hẹn xem phòng không', 'khach_dang_ky'], ['khách đăng ký mới', 'khach_dang_ky']
];

export const BO_KIEM_THU_2: Array<[string, string]> = [
  ['chào chủ trọ nha', 'chao_hoi'], ['alo có ai không', 'chao_hoi'],
  ['oke thanks bạn', 'cam_on'],
  ['tạm biệt nhé', 'tam_biet'],
  ['chatbot này dùng sao', 'tro_giup'],
  ['đang còn phòng nào trống không ạ', 'phong_trong'], ['tìm phòng giá dưới 2 triệu 8', 'phong_trong'], ['có phòng ở được 3 người không', 'phong_trong'],
  ['thuê 1 phòng bao nhiêu tiền', 'gia_phong'], ['phòng ở đây giá sao bạn', 'gia_phong'],
  ['tiền điện 1 số là bao nhiêu', 'gia_dich_vu'], ['internet bao nhiêu tiền 1 tháng', 'gia_dich_vu'],
  ['cho mình địa chỉ với', 'lien_he'], ['số chủ nhà là bao nhiêu', 'lien_he'],
  ['đang có giảm giá gì không bạn', 'khuyen_mai'],
  ['thuê thì cần chuẩn bị giấy tờ gì', 'thu_tuc_thue'], ['có phải làm hợp đồng không', 'thu_tuc_thue'],
  ['mai mình ghé xem phòng nhé', 'dat_lich_xem'], ['đặt lịch xem phòng p203 giúp mình', 'dat_lich_xem'],
  ['có được dẫn bạn về ngủ không', 'noi_quy'], ['nuôi chó được không', 'noi_quy'],
  ['phòng có bếp nấu không', 'tien_ich'], ['có wc riêng trong phòng không', 'tien_ich'],
  ['tiền trọ tháng này của mình bao nhiêu', 'hoa_don'], ['xem giúp hóa đơn tháng 8', 'hoa_don'], ['phòng nào chưa trả tiền', 'hoa_don'],
  ['điện tháng 9 dùng hết bao nhiêu số', 'tien_dien_nuoc'], ['xem chỉ số điện tháng trước', 'tien_dien_nuoc'],
  ['ước tính tiền tháng sau của mình', 'du_bao'],
  ['chuyển tiền vào tài khoản nào', 'thanh_toan'], ['mình đóng tiền tháng 8 chưa', 'thanh_toan'],
  ['hợp đồng hết hạn ngày nào', 'hop_dong'], ['muốn trả phòng sớm thì sao', 'hop_dong'],
  ['ổ điện bị chập cháy', 'bao_su_co'], ['máy lạnh không lạnh', 'bao_su_co'], ['phòng bị dột nước', 'bao_su_co'],
  ['cái vòi nước báo hôm qua sửa chưa', 'tinh_trang_su_co'],
  ['phòng mình ở là phòng nào', 'phong_cua_toi'],
  ['làm sao đổi mật khẩu', 'tai_khoan'],
  ['tháng này thu được bao nhiêu', 'thong_ke'],
  ['tuần này có ai đăng ký xem phòng không', 'khach_dang_ky']
];
