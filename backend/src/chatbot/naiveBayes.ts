import { tachDacTrung } from './vietnamese';

export interface KetQuaDuDoan {
  nhan: string;
  xacSuat: number;
}

export class NaiveBayes {
  private alpha: number;
  private demTu = new Map<string, Map<string, number>>();
  private tongTu = new Map<string, number>();
  private soMau = new Map<string, number>();
  private tuVung = new Set<string>();
  private tongMau = 0;

  constructor(alpha = 1) {
    this.alpha = alpha;
  }

  huanLuyen(duLieu: Array<[string, string]>) {
    this.demTu.clear();
    this.tongTu.clear();
    this.soMau.clear();
    this.tuVung.clear();
    this.tongMau = 0;
    for (const [cau, nhan] of duLieu) this.hocThem(cau, nhan);
  }

  hocThem(cau: string, nhan: string) {
    const dacTrung = tachDacTrung(cau);
    if (!this.demTu.has(nhan)) {
      this.demTu.set(nhan, new Map());
      this.tongTu.set(nhan, 0);
      this.soMau.set(nhan, 0);
    }
    const dem = this.demTu.get(nhan)!;
    for (const t of dacTrung) {
      dem.set(t, (dem.get(t) || 0) + 1);
      this.tuVung.add(t);
    }
    this.tongTu.set(nhan, this.tongTu.get(nhan)! + dacTrung.length);
    this.soMau.set(nhan, this.soMau.get(nhan)! + 1);
    this.tongMau++;
  }

  soTuDaBiet(cau: string) {
    return tachDacTrung(cau).filter((t) => this.tuVung.has(t)).length;
  }

  duDoan(cau: string): KetQuaDuDoan[] {
    const dacTrung = tachDacTrung(cau).filter((t) => this.tuVung.has(t));
    const V = this.tuVung.size || 1;
    const nhans = [...this.demTu.keys()];
    if (nhans.length === 0) return [];

    const logDiem = nhans.map((nhan) => {
      let diem = Math.log(1 / nhans.length);
      const dem = this.demTu.get(nhan)!;
      const tong = this.tongTu.get(nhan)!;
      for (const t of dacTrung) {
        diem += Math.log(((dem.get(t) || 0) + this.alpha) / (tong + this.alpha * V));
      }
      return diem;
    });

    const max = Math.max(...logDiem);
    const exp = logDiem.map((d) => Math.exp(d - max));
    const tongExp = exp.reduce((a, b) => a + b, 0);
    return nhans
      .map((nhan, i) => ({ nhan, xacSuat: exp[i] / tongExp }))
      .sort((a, b) => b.xacSuat - a.xacSuat);
  }

  thongKe() {
    return {
      so_nhan: this.demTu.size,
      so_mau: this.tongMau,
      so_dac_trung: this.tuVung.size,
      mau_theo_nhan: Object.fromEntries(this.soMau)
    };
  }
}
