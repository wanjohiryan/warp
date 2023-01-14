const esbuild = require("./esbuild")

//FIXME: reorder the directory, this won't scale nicely

esbuild.build({
    entryPoints: ["src/index.tsx", "src/index.css"],
    outdir: "static",
    bundle: true,
    minify: true,
    plugins: []
})
    .then(() => { console.log("Build complete :)") })
    .catch((err) => { console.error(err); process.exit(1) });


