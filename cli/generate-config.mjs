import dedent from "string-dedent";

export default function generate() {
  return dedent`
    iconComponentOutputPath: "src"
    iconComponentFileName: "SeedIcon"
  
    spriteOutputPath: "assets"
    spriteFileName: "sprite"
  
    icons: [
      "icon_add_circle_fill",
      "icon_add_circle_regular",
      "icon_add_circle_thin",
    ]
  `;
};
