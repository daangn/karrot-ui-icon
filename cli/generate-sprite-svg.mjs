import dedent from "string-dedent";

import iconData from "./icon-data.mjs";

export default function generate({ icons }) {
	return dedent`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    ${icons.map((id) => {
      const icon = iconData[id];
      return icon
        .replace("<svg", `  <symbol id="${id}"`)
        .replace(/<path/g, "  <path")
        .replace("</svg>", "  </symbol>")}).join("")}
    </svg>\n
	`;
};
