import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Çekirdek testleri saf Node'da koşar; yalnızca React testleri DOM ister.
    //
    // jsdom yerine happy-dom: jsdom, undici üzerinden Node'un belirli bir
    // sürümünde bulunan bir API'ye bağlı ve CI matrisindeki Node 20 işinde
    // "webidl.util.markAsUncloneable is not a function" ile düşüyordu.
    // happy-dom'un böyle bir bağımlılığı yok ve bu testler için fazlasıyla
    // yeterli — sadece DOM sorguları ve olay gönderimi yapıyoruz.
    environmentMatchGlobs: [["test/react.test.tsx", "happy-dom"]],
  },
});
