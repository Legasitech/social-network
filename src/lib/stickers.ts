/**
 * Real PNG stickers from https://github.com/ptkdev/ptkdev-stickers (CC BY-NC 4.0)
 * Served via jsDelivr CDN
 */

const BASE = "https://cdn.jsdelivr.net/gh/ptkdev/ptkdev-stickers@main/png";

function url(file: string) {
  return `${BASE}/${encodeURIComponent(file)}`;
}

export type StickerItem = {
  id: string;
  name: string;
  imageUrl: string;
};

export type StickerPack = {
  id: string;
  name: string;
  stickers: StickerItem[];
};

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "reactions",
    name: "Реакции",
    stickers: [
      { id: "s01", name: "поцелуй", imageUrl: url("01 - bacio.png") },
      { id: "s02", name: "ржу", imageUrl: url("02 - ridere a crepapelle.png") },
      { id: "s03", name: "влюблён", imageUrl: url("03 - occhi a cuore.png") },
      { id: "s04", name: "плачу", imageUrl: url("04 - piangere disperato.png") },
      { id: "s05", name: "ок", imageUrl: url("05 - ok.png") },
      { id: "s06", name: "думаю", imageUrl: url("06 - pensare.png") },
      { id: "s07", name: "привет", imageUrl: url("07 - ciao.png") },
      { id: "s08", name: "злюсь", imageUrl: url("08 - arrabbiato.png") },
      { id: "s10", name: "facepalm", imageUrl: url("10 - mano davanti la faccia.png") },
      { id: "s11", name: "праздник", imageUrl: url("11 - festeggiamento.png") },
      { id: "s12", name: "сплю", imageUrl: url("12 - assonnato.png") },
      { id: "s15", name: "грусть", imageUrl: url("15 - triste.png") },
      { id: "s27", name: "сердце", imageUrl: url("27 - cuore.png") },
      { id: "s34", name: "grrr", imageUrl: url("34 - grrr.png") },
      { id: "s35", name: "дуюсь", imageUrl: url("35 - broncino.png") },
      { id: "s38", name: "пожимаю", imageUrl: url("38 - spallucce.png") },
    ],
  },
  {
    id: "memes",
    name: "Мемы",
    stickers: [
      { id: "s20", name: "dab", imageUrl: url("20 - dab dance.png") },
      { id: "s36", name: "fuck you", imageUrl: url("36 - fuck you.png") },
      { id: "s37", name: "деньги", imageUrl: url("37 - prendi i soldi.png") },
      { id: "s45", name: "salt bae", imageUrl: url("45 - meme salt bae.png") },
      { id: "s48", name: "you cant", imageUrl: url("48 - meme you cant.png") },
      { id: "s49", name: "yes", imageUrl: url("49 - meme yes.png") },
      { id: "s50", name: "no", imageUrl: url("50 - meme no.png") },
      { id: "s51", name: "big money", imageUrl: url("51 - big money.png") },
      { id: "s61", name: "cheers", imageUrl: url("61 - meme DiCaprio cheers.png") },
      { id: "s67", name: "злая идея", imageUrl: url("67 - malvagia idea.png") },
      { id: "s42", name: "vader", imageUrl: url("42 - darth vader.png") },
      { id: "s55", name: "unicorn", imageUrl: url("55 - unicorno.png") },
    ],
  },
  {
    id: "food",
    name: "Еда",
    stickers: [
      { id: "s18", name: "pizza", imageUrl: url("18 - pizza.png") },
      { id: "s19", name: "kebab", imageUrl: url("19 - kebab.png") },
      { id: "s23", name: "popcorn", imageUrl: url("23 - popcorn.png") },
      { id: "s26", name: "sushi", imageUrl: url("26 - sushi.png") },
      { id: "s41", name: "carbonara", imageUrl: url("41 - carbonara.png") },
      { id: "s54", name: "bbq", imageUrl: url("54 - barbecue.png") },
      { id: "s56", name: "ice cream", imageUrl: url("56 - gelatone.png") },
      { id: "s57", name: "burger", imageUrl: url("57 - hamburger.png") },
      { id: "s14", name: "кофе", imageUrl: url("14 - sputare caffe.png") },
    ],
  },
];
