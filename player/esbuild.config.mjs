import esbuild from "esbuild"
import metaUrlPlugin from '@chialab/esbuild-plugin-meta-url';


await esbuild.build({
    entryPoints:["src/index.css","src/index.tsx"],
    plugins: [
        metaUrlPlugin(),
    ],
    bundle:true,
    minify:true,
    format:"esm",
    outdir:"dist",
    loader:{
        ".png":"file",
        ".jpg":"file",
        ".mp3":"file",
        ".hex":"file"
    }
});