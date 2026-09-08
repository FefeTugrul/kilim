import type { Icerik } from "@/lib/icerik";
import { anatomiDenetle } from "@/lib/katmanlar-denetim";
import { Altbilgi, Bolum, Ustbilgi } from "./Kabuk";
import { TohumSaglayici } from "./TohumSaglayici";
import Playground from "./Playground";
import Neden from "./Neden";
import Kullanim from "./Kullanim";
import Anatomi from "./Anatomi";
import MotifSozlugu from "./MotifSozlugu";
import Baglamda from "./Baglamda";
import Kaynaklar from "./Kaynaklar";

/**
 * Anatomi levhası artık kullanıcının yazdığı HER tohumu söküyor; tek bir
 * tohumu elle doğrulamak yetmez. Bu tarama derleme sırasında çalışıyor:
 * kütüphanede katman yığını değişirse `next build` burada durur.
 */
anatomiDenetle();

const VARSAYILAN_TOHUM = "furkan";

export default function Sayfa({ icerik }: { icerik: Icerik }) {
  return (
    <div className="sayfa">
      <Ustbilgi icerik={icerik} />
      <TohumSaglayici varsayilan={VARSAYILAN_TOHUM}>
        <main>
          <Playground hero={icerik.hero} dil={icerik.dil} />
          <Bolum metin={icerik.bolumler.neden}>
            <Neden icerik={icerik} />
          </Bolum>
          <Bolum metin={icerik.bolumler.kullanim}>
            <Kullanim icerik={icerik} />
          </Bolum>
          <Bolum metin={icerik.bolumler.anatomi}>
            <Anatomi icerik={icerik} />
          </Bolum>
          <Bolum metin={icerik.bolumler.motifler}>
            <MotifSozlugu icerik={icerik} />
          </Bolum>
          <Bolum metin={icerik.bolumler.baglam}>
            <Baglamda icerik={icerik} />
          </Bolum>
          <Bolum metin={icerik.bolumler.kaynaklar}>
            <Kaynaklar icerik={icerik} />
          </Bolum>
        </main>
      </TohumSaglayici>
      <Altbilgi icerik={icerik} />
    </div>
  );
}
