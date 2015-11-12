package main

import (
	//"log"
	"net/http"
	"flag"
	log "code.google.com/p/log4go"
)

var (
	dir string
)

func main() {
	flag.StringVar(&dir, "c", "./", " set file serve dir")
	flag.Parse()
	
	log.Debug("Start to serve dir : %s", dir)
	
	// Simple static webserver:
	log.Error(http.ListenAndServe(":9000", http.FileServer(http.Dir("./"))))
}