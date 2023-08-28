package ui

import (
	"embed"
  "fmt"
  "mime"
	"net/http"
  "path/filepath"
	"strings"
)

//go:embed dist/*
var content embed.FS

func NewClient() (s *http.ServeMux) {

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		//For "SharedArrayBuffer" to work
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
		w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")
    // if strings.HasPrefix(path, "static/") {
		w.Header().Set("Cache-Control", "public, max-age=31536000")


		//must be a get method (browser)
		if r.Method != "GET" {
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
		}

    path := filepath.Clean(r.URL.Path)

		path = strings.TrimPrefix(path, `\`)

		if path == `/` || path == "" { // Add other paths that you route on the UI side here
			path = "index.html"
		}

    filename := fmt.Sprintf("dist/%s", path)
    
    indexContent, err := content.ReadFile(filename)
        if err != nil {
            http.Error(w, "Failed to read file", http.StatusInternalServerError)
            return
        }
    
    contentType := mime.TypeByExtension(filepath.Ext(path))
		w.Header().Set("Content-Type", contentType)

    w.Write(indexContent)

	})

	return mux
}
