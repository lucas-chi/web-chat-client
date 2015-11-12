package main

import (
	//"log"
	"net/http"
	"flag"
	log "code.google.com/p/log4go"
	"fmt"
)

var (
	dir string
)

func main() {
	flag.StringVar(&dir, "d", "./", "set file serve dir")
	flag.Parse()
	
	log.Debug("Start to serve dir : %s", dir)
	fmt.Println(dir)
	
	// Simple static webserver:
	log.Error(http.ListenAndServe(":9000", http.FileServer(http.Dir(dir))))
}