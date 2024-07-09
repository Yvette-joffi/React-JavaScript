export default function AvatarGenerator(text?: string) {
  //TODO: implement random text generator for random avatar
  return `https://api.multiavatar.com/${text || "redom"}.png`;
}
