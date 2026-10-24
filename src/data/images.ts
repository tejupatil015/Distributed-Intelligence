const px = (id: number, w = 1800, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=${w}`;

export const images = {
  /* Home — Digital Infrastructure Hero */
  homeHero: px(1516704, 2400),

  /* Shoreline — Distribution & Logistics */
  seaCover: px(4483610, 1600),
  seaSlide1: px(6169668),
  seaSlide2: px(4483610),
  seaSlide3: px(6169668),
  seaSlide4: px(4483610),
  seaIntro: px(6169668, 1400),
  seaSquare: px(4483610, 900),
  seaWide1: px(6169668, 2400),
  seaWide2: px(4483610, 2400),
  seaF1: px(6169668, 1400),
  seaF2: px(4483610, 1400),
  seaF3: px(6169668, 1400),

  /* Canopy — Company & Operations */
  greenCover: px(3184465, 1600),
  greenSlide1: px(3184465),
  greenSlide2: px(3184465),
  greenSlide3: px(3184465),
  greenSlide4: px(3184465),
  greenIntro: px(3184465, 1400),
  greenSquare: px(3184465, 900),
  greenWide1: px(3184465, 2400),
  greenWide2: px(3184465, 2400),
  greenF1: px(3184465, 1400),
  greenF2: px(3184465, 1400),
  greenF3: px(3184465, 1400),

  /* Cityscape — Distributed Network */
  cityCover: px(6169668, 1600),
  citySlide1: px(6169668),
  citySlide2: px(6169668),
  citySlide3: px(6169668),
  citySlide4: px(6169668),
  cityIntro: px(6169668, 1400),
  citySquare: px(6169668, 900),
  cityWide1: px(6169668, 2400),
  cityWide2: px(6169668, 2400),
  cityF1: px(6169668, 1400),
  cityF2: px(6169668, 1400),
  cityF3: px(6169668, 1400),

  /* Singular — Digital Infrastructure */
  rareCover: px(1516704, 1600),
  rareSlide1: px(1516704),
  rareSlide2: px(1516704),
  rareSlide3: px(1516704),
  rareSlide4: px(1516704),
  rareIntro: px(1516704, 1400),
  rareSquare: px(1516704, 900),
  rareWide1: px(1516704, 2400),
  rareWide2: px(1516704, 2400),
  rareF1: px(1516704, 1400),
  rareF2: px(1516704, 1400),
  rareF3: px(1516704, 1400),
} as const;

export type ImageKey = keyof typeof images;