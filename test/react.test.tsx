// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Kilim, useKilim } from "../src/react.js";
import { generateKilim } from "../src/index.js";

afterEach(cleanup);

describe("<Kilim />", () => {
  it("çekirdekle aynı SVG'yi çizer", () => {
    // jsdom öznitelikleri yeniden serileştirdiği için ham metin karşılaştırmıyoruz;
    // eşdeğerliği yapı üzerinden ölçüyoruz.
    const { container } = render(<Kilim seed="furkan" />);
    const svg = container.querySelector("svg") as SVGElement;
    const beklenen = generateKilim("furkan");

    const beklenenRect = (beklenen.svg.match(/<rect/g) ?? []).length;
    expect(svg.querySelectorAll("rect")).toHaveLength(beklenenRect);
    expect(svg.querySelector("title")?.textContent).toBe(beklenen.nameEn);
    expect(svg.getAttribute("viewBox")).toBe(
      beklenen.svg.match(/viewBox="([^"]+)"/)?.[1],
    );

    // İlk ve son dikdörtgenin dolgusu da tutmalı: sıra ve renk korunuyor.
    const rects = Array.from(svg.querySelectorAll("rect"));
    const beklenenFill = [...beklenen.svg.matchAll(/fill="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(rects[0]?.getAttribute("fill")).toBe(beklenenFill[0]);
    expect(rects[rects.length - 1]?.getAttribute("fill")).toBe(
      beklenenFill[beklenenFill.length - 1],
    );
  });

  it("aynı seed her render'da aynı çıktıyı verir", () => {
    const a = render(<Kilim seed="ayşe" />).container.innerHTML;
    cleanup();
    const b = render(<Kilim seed="ayşe" />).container.innerHTML;
    expect(a).toBe(b);
  });

  it("size, region ve label proplarını geçirir", () => {
    const { container } = render(
      <Kilim seed="furkan" size={64} region="sivas" />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("height")).toBe("64");
    expect(svg?.querySelector("title")?.textContent).toContain("Sivas");
  });

  it("label={false} ile ekran okuyucudan gizlenir", () => {
    const { container } = render(<Kilim seed="furkan" label={false} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.querySelector("title")).toBeNull();
  });

  it("className ve style geçirilir, style CSS anlamını korur", () => {
    const { container } = render(
      <Kilim seed="furkan" className="avatar" style={{ opacity: 0.5 }} />,
    );
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("class")).toBe("avatar");
    expect(svg.style.opacity).toBe("0.5");
  });

  it("rounded kısayolu yuvarlaklık ekler ve kullanıcı stilini ezmez", () => {
    const { container } = render(
      <Kilim seed="furkan" rounded style={{ opacity: 0.5 }} />,
    );
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.style.borderRadius).toBe("50%");
    expect(svg.style.opacity).toBe("0.5");
  });

  it("SVG özniteliklerini kaybetmez", () => {
    const { container } = render(<Kilim seed="furkan" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("viewBox")).toMatch(/^0 0 [\d.]+ [\d.]+$/);
    expect(svg.getAttribute("shape-rendering")).toBe("crispEdges");
    expect(svg.getAttribute("role")).toBe("img");
  });

  it("geçersiz seed'de anlamlı hata verir", () => {
    expect(() => render(<Kilim seed={undefined as never} />)).toThrow(
      /seed must be a string/,
    );
  });
});

describe("useKilim", () => {
  function Deneme({ seed }: { seed: string }): React.ReactElement {
    const k = useKilim(seed, { size: 64 });
    return <span data-testid="ad">{k.name}</span>;
  }

  it("çekirdekle aynı sonucu döner", () => {
    const { getByTestId } = render(<Deneme seed="furkan" />);
    expect(getByTestId("ad").textContent).toBe(
      generateKilim("furkan", { size: 64 }).name,
    );
  });
});

describe("<Kilim /> prop geçişi", () => {
  it("standart SVG proplarını geçirir", () => {
    let tiklandi = false;
    const { container } = render(
      <Kilim
        seed="furkan"
        id="avatar-1"
        data-testid="kilim"
        aria-describedby="ipucu"
        onClick={() => {
          tiklandi = true;
        }}
      />,
    );
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.id).toBe("avatar-1");
    expect(svg.getAttribute("data-testid")).toBe("kilim");
    expect(svg.getAttribute("aria-describedby")).toBe("ipucu");
    svg.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(tiklandi).toBe(true);
  });

  it("ref kök svg öğesine bağlanır", () => {
    let dugum: SVGSVGElement | null = null;
    render(
      <Kilim
        seed="furkan"
        ref={(el) => {
          dugum = el;
        }}
      />,
    );
    expect(dugum).not.toBeNull();
    expect((dugum as unknown as SVGElement).tagName.toLowerCase()).toBe("svg");
  });

  it("tireli SVG öznitelikleri kayıpsız geçer", () => {
    const { container } = render(<Kilim seed="furkan" />);
    const svg = container.querySelector("svg") as SVGElement;
    // React uyarı basıp özniteliği düşürseydi bu null olurdu.
    expect(svg.getAttribute("shape-rendering")).toBe("crispEdges");
  });

  it("geçersiz label React'te de anlamlı hata verir", () => {
    expect(() => render(<Kilim seed="furkan" label={true as never} />)).toThrow(
      /label must be a string or false/,
    );
  });
});
