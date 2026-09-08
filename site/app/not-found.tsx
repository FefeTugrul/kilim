import type { Metadata } from "next";
import { SITE_URL } from "@/lib/paket";
import "./globals.css";
import s from "./not-found.module.css";
import { yol } from "@/lib/yol";

/**
 * İki kök layout olduğu için 404 sayfası kendi <html>'ini basmak zorunda:
 * hiçbir layout'un altında değil.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "404 — kilim",
};

export default function Bulunamadi() {
  return (
    <html lang="en">
      <body>
        <div className="sayfa">
          <div className={s.kutu}>
            <p className={s.kod}>404</p>
            <h1 className={s.baslik}>This page was not woven.</h1>
            <p className={s.govde}>
              The address does not match anything here. Everything the site has
              is on one page.
            </p>
            <a className={s.geri} href={yol("/")}>
              kilim
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
