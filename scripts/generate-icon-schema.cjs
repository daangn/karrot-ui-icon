const iconData = require("../data/icondata.json");
const { writeFileSync } = require("fs");
const { resolve } = require("path");
const dedent = require("dedent");

const iconName = iconData.map((icon) => icon[1]);

const iconSchema = dedent`
  {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://raw.githubusercontent.com/daangn/karrot-ui-icon/json-schema/schema/schema.json",
    "title": "Karrot UI Icon Schema",
    "description": "JSON Schema for Karrot UI Icon",
    "type": "object",
    "properties": {
      "icons": {
        "type": "array",
        "uniqueItems": true,
        "items": {
          "type": "string",
          "enum": [
            ${iconName.map((name) => `"${name}"`).join(",\n            ")}
          ]
        }
      },
      "componentPath": {
        "type": "string",
        "pattern": "^.+\\.tsx$"
      },
      "spritePath": {
        "type": "string",
        "pattern": "^.+\\.svg$"
      },
      "withContext": {
        "type": "boolean",
      },
      "contextPath": {
        "type": "string",
        "pattern": "^.+\\.tsx$"
      }
    },
    "required": ["icons"]
  }\n
`;

writeFileSync(resolve("./schema", "schema.json"), iconSchema, { encoding: "utf-8" });
