const dedent = require("dedent");
const fs = require("fs");
const data = require("../data/icondata.json");

const ids = data.map((icon) => icon[1]);

function generate() {
  return dedent`
    export default {
      ${ids
        .map((id) => {
          const icon = fs.readFileSync(`svg/${id}.svg`, "utf-8");
          return `"${id}": \`${icon}\``;
        })
        .join(",\n")}
    }\n
  `;
}

fs.writeFileSync("src/IconData.tsx", generate());
