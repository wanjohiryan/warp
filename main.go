package main

import (
	"context"
	"crypto/tls"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/kixelated/invoker"
	"github.com/wanjohiryan/warp/internal/warp"
)

type Config struct {
	address  string
	certFile string
	keyFile  string
	logDir   string
	media    string
}

func main() {
	err := run(context.Background())
	if err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context) (err error) {

	myConfig := getConfig()

	media, err := warp.NewMedia(myConfig.media)
	if err != nil {
		return fmt.Errorf("failed to open media: %w", err)
	}

	tlsCert, err := tls.LoadX509KeyPair(myConfig.certFile, myConfig.keyFile)
	if err != nil {
		return fmt.Errorf("failed to load TLS certificate: %w", err)
	}

	config := warp.ServerConfig{
		Addr:   myConfig.address,
		Cert:   &tlsCert,
		LogDir: myConfig.logDir,
	}

	ws, err := warp.NewServer(config, media)
	if err != nil {
		return fmt.Errorf("failed to create warp server: %w", err)
	}

	log.Printf("listening on %s", myConfig.address)

	return invoker.Run(ctx, invoker.Interrupt, ws.Run)
}

func getConfig() Config {
	//TODO: support config files
	addr := flag.String("port", ":8080", "HTTPS server address")
	cert := flag.String("tls-cert", "./certs/localhost.crt", "TLS certificate file path")
	key := flag.String("tls-key", "./certs/localhost.key", "TLS certificate file path")
	logDir := flag.String("log-dir", "", "logs will be written to the provided directory")
	dash := flag.String("media", "/media/playlist.mpd", "DASH playlist path")

	flag.Parse()

	conf := Config{
		logDir: *logDir,
	}

	//get port
	if *addr == "" {
		conf.address = os.Getenv("WARP_PORT")
	} else {
		conf.address = *addr
	}

	//get certFile
	if *cert == "" {
		conf.certFile = os.Getenv("WARP_CERTFILE")
	} else {
		conf.certFile = *cert
	}

	//get keyFile
	if *key == "" {
		conf.keyFile = os.Getenv("WARP_KEYFILE")
	} else {
		conf.keyFile = *key
	}

	//get media folder
	if *dash == "" {
		conf.media = os.Getenv("WARP_MEDIA")
	} else {
		conf.media = *dash
	}


	start := time.Now().UnixNano() / int64(time.Millisecond)


	if _, err := os.Stat(conf.media); err != nil {
		//loop for 10 seconds until we get the media file
		log.Printf("Media file not found, waiting...")

		for {
			now := time.Now().UnixNano() / int64(time.Millisecond)
			diff := now - start
			if diff > 10000 {
				break 
			} else {
				//if file is found break
				// conf.media = fmt.Sprintf("%s%d.mpd", conf.media, os.Getpid())
				if _, err := os.Stat(conf.media); err == nil {
					break
				}
			}
			time.Sleep(2 * time.Second)
		}
	}

	return conf
}
