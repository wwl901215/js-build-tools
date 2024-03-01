import json from "@rollup/plugin-json"
export default [
    {
        input: "./build/modifyFile.js",
        output: [
            {
                file: "./lib/build/index.esm.js",
                format: "es"
            },
            {
                file: "./lib/build/index.cjs.js",
                format: "cjs"
            }
        ],
        external: [
            "@babel/core",
            "prettier",
            "postcss",
        ],
        plugins: [
            json()
        ]
    }
]