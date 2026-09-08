"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Sayfanın tek girdisi.
 *
 * Üstteki alana yazılan tohum hem deneme şeridini hem anatomi levhasını
 * besliyor: aşağı indiğinde incelediğin kilim, yukarıda yazdığın kilim.
 *
 * İki değer var. `girdi` anlıktır ve alana bağlıdır; `tohum` gecikmelidir ve
 * çizimi tetikler. Her tuş vuruşunda yeniden dokumak "tek hareket anı"nı
 * sürekli titreşime çeviriyordu.
 */
const MS_BEKLE = 140;

interface TohumBaglami {
  girdi: string;
  tohum: string;
  yaz: (deger: string) => void;
}

const Baglam = createContext<TohumBaglami | null>(null);

export function TohumSaglayici({
  varsayilan,
  children,
}: {
  varsayilan: string;
  children: ReactNode;
}) {
  const [girdi, setGirdi] = useState(varsayilan);
  const [tohum, setTohum] = useState(varsayilan);

  useEffect(() => {
    if (girdi === tohum) return;
    const t = setTimeout(() => setTohum(girdi), MS_BEKLE);
    return () => clearTimeout(t);
  }, [girdi, tohum]);

  const deger = useMemo(
    () => ({ girdi, tohum, yaz: setGirdi }),
    [girdi, tohum],
  );

  return <Baglam.Provider value={deger}>{children}</Baglam.Provider>;
}

export function useTohum(): TohumBaglami {
  const b = useContext(Baglam);
  if (!b) throw new Error("useTohum, TohumSaglayici içinde çağrılmalı");
  return b;
}
