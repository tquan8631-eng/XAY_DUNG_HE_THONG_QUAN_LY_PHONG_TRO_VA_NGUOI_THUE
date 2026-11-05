import { NaiveBayes } from './naiveBayes';
import { Y_DINH, BO_KIEM_THU, BO_KIEM_THU_2, MUC_DO_MAU, laNguyHiem } from './duLieuHuanLuyen';

const NGUONG = 0.3;

const mohinh = new NaiveBayes(1);
mohinh.huanLuyen(Y_DINH.flatMap((y) => y.mau.map((m) => [m, y.ma] as [string, string])));

const tk = mohinh.thongKe();
console.log('=== MÔ HÌNH PHÂN LOẠI Ý ĐỊNH (Naive Bayes) ===');
console.log(`Số ý định: ${tk.so_nhan} | Số câu mẫu huấn luyện: ${tk.so_mau} | Số đặc trưng: ${tk.so_dac_trung}`);

const danhGia = (ten: string, bo: Array<[string, string]>) => {
  let dung = 0;
  let khongChac = 0;
  const sai: string[] = [];
  for (const [cau, mongDoi] of bo) {
    const [top] = mohinh.duDoan(cau);
    if (top.xacSuat < NGUONG) khongChac++;
    if (top.nhan === mongDoi) dung++;
    else sai.push(`  ✗ "${cau}" → đoán ${top.nhan} (${(top.xacSuat * 100).toFixed(0)}%), đúng là ${mongDoi}`);
  }
  console.log(`\n${ten}: ${bo.length} câu`);
  console.log(`Độ chính xác: ${dung}/${bo.length} = ${((dung / bo.length) * 100).toFixed(1)}%`);
  console.log(`Số câu có độ tin cậy dưới ${NGUONG * 100}%: ${khongChac}`);
  if (sai.length) console.log('Các câu đoán sai:\n' + sai.join('\n'));
};
danhGia('Bộ kiểm thử 1 (dùng trong quá trình xây dựng)', BO_KIEM_THU);
danhGia('Bộ kiểm thử 2 (độc lập, không dùng để chỉnh mô hình)', BO_KIEM_THU_2);

let dungMd = 0;
let dungKetHop = 0;
for (let i = 0; i < MUC_DO_MAU.length; i++) {
  const m = new NaiveBayes(1);
  m.huanLuyen(MUC_DO_MAU.filter((_, j) => j !== i));
  const doan = m.duDoan(MUC_DO_MAU[i][0])[0].nhan;
  if (doan === MUC_DO_MAU[i][1]) dungMd++;
  const nguyHiem = laNguyHiem(MUC_DO_MAU[i][0]);
  if ((nguyHiem ? 'khan_cap' : doan) === MUC_DO_MAU[i][1]) dungKetHop++;
}
console.log('\n=== MÔ HÌNH MỨC ĐỘ SỰ CỐ (kiểm tra chéo bỏ-một, 4 mức) ===');
console.log(`Chỉ Naive Bayes: ${dungMd}/${MUC_DO_MAU.length} = ${((dungMd / MUC_DO_MAU.length) * 100).toFixed(1)}%`);
console.log(`Naive Bayes + quy tắc từ khóa nguy hiểm: ${dungKetHop}/${MUC_DO_MAU.length} = ${((dungKetHop / MUC_DO_MAU.length) * 100).toFixed(1)}%`);
